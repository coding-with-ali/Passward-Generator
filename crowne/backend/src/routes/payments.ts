import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { config } from '../config';
import { calculateShipping } from '../utils';
import { validateCouponForSubtotal } from './coupons';
import { Product } from '../models/Product';

const router = Router();

function stripeClient(): Stripe | null {
  if (!config.stripeSecretKey) return null;
  return new Stripe(config.stripeSecretKey);
}

const cardEnabled = () => !!config.stripeSecretKey;

// GET /api/payments/config
router.get('/payments/config', (_req: Request, res: Response) => {
  return res.json({
    card_enabled: cardEnabled(),
    publishable_key: cardEnabled() ? config.stripePublishableKey : '',
  });
});

// POST /api/payments/intent
router.post('/payments/intent', async (req: Request, res: Response) => {
  try {
    const stripe = stripeClient();
    if (!stripe) {
      return res.status(400).json({ error: 'Card payments are not configured' });
    }
    const { items, coupon } = req.body || {};
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    let subtotal = 0;
    for (const item of items) {
      const qty = Number(item.qty);
      if (!item.id || !Number.isFinite(qty) || qty < 1) {
        return res.status(400).json({ error: 'Each item needs a valid product id and quantity' });
      }
      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(400).json({ error: 'One of the products is no longer available' });
      }
      subtotal += product.price * qty;
    }

    let discount = 0;
    if (coupon) {
      try {
        const result = await validateCouponForSubtotal(String(coupon), subtotal);
        discount = result.discount;
      } catch {
        discount = 0;
      }
    }

    const shipping = calculateShipping(subtotal, discount);
    const total = subtotal - discount + shipping;

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // minor units
      currency: 'pkr',
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    });

    return res.json({
      client_secret: intent.client_secret,
      payment_intent_id: intent.id,
      total,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

export default router;
