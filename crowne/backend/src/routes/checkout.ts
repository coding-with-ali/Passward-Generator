import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { config } from '../config';
import {
  generateOrderNumber,
  calculateDiscount,
  calculateShipping,
  isValidEmail,
  serializeOrder,
} from '../utils';
import { requireAuth } from '../middleware/auth';
import { validateCouponForSubtotal } from './coupons';

const router = Router();

// GET /api/orders/mine (auth) — newest first, includes timeline
router.get('/orders/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
    return res.json(orders.map(serializeOrder));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load orders' });
  }
});

function getOptionalUserId(req: Request): string | undefined {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { id: string };
    return payload.id;
  } catch {
    return undefined;
  }
}

async function buildTotals(
  items: Array<{ id: string; qty: number; size?: string; color?: string }>,
  couponCode?: string
) {
  if (!Array.isArray(items) || items.length === 0) {
    throw { status: 400, error: 'Order must include at least one item' };
  }
  let subtotal = 0;
  const lines: Array<{
    productId: any;
    name: string;
    size?: string;
    color?: string;
    price: number;
    qty: number;
    image?: string;
  }> = [];
  for (const item of items) {
    const qty = Number(item.qty);
    if (!item.id || !Number.isFinite(qty) || qty < 1) {
      throw { status: 400, error: 'Each item needs a valid product id and quantity' };
    }
    const product = await Product.findById(item.id);
    if (!product) throw { status: 400, error: 'One of the products is no longer available' };
    if (product.stock < qty) {
      throw { status: 400, error: `Not enough stock for "${product.name}"` };
    }
    subtotal += product.price * qty;
    lines.push({
      productId: product._id,
      name: product.name,
      size: item.size,
      color: item.color,
      price: product.price,
      qty,
      image: product.image,
    });
  }

  // Coupon: validate silently — apply only if valid
  let discount = 0;
  let coupon: any = null;
  if (couponCode) {
    try {
      const result = await validateCouponForSubtotal(String(couponCode), subtotal);
      coupon = result.coupon;
      discount = result.discount;
    } catch {
      discount = 0;
      coupon = null;
    }
  }
  const shipping = calculateShipping(subtotal, discount);
  const total = subtotal - discount + shipping;
  return { lines, subtotal, discount, coupon, shipping, total };
}

export { buildTotals };

// POST /api/checkout
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const {
      items,
      payment_method,
      name,
      email,
      phone,
      address,
      city,
      postal,
      coupon,
      payment_intent_id,
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one item' });
    }
    if (!name || !email || !phone || !address || !city) {
      return res.status(400).json({ error: 'Name, email, phone, address and city are required' });
    }
    if (!isValidEmail(String(email))) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (payment_method !== 'cod' && payment_method !== 'card') {
      return res.status(400).json({ error: "payment_method must be 'cod' or 'card'" });
    }
    if (payment_method === 'card') {
      if (!config.stripeSecretKey) {
        return res
          .status(400)
          .json({
            error: 'Card payments are not configured yet. Please choose Cash on Delivery.',
          });
      }
      if (!payment_intent_id || !String(payment_intent_id).startsWith('pi_')) {
        return res.status(400).json({ error: 'A valid payment_intent_id is required for card orders' });
      }
    }

    const { lines, subtotal, discount, coupon: appliedCoupon, shipping, total } =
      await buildTotals(items, coupon);

    // Decrement stock
    for (const line of lines) {
      await Product.updateOne(
        { _id: line.productId, stock: { $gte: line.qty } },
        { $inc: { stock: -line.qty } }
      );
    }
    // Increment coupon usage
    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      user: getOptionalUserId(req),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      city: String(city).trim(),
      postal: postal ? String(postal).trim() : undefined,
      paymentMethod: payment_method,
      items: lines,
      subtotal,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      shipping,
      total,
      status: 'placed',
      timeline: [{ status: 'placed', at: new Date(), note: 'Order received' }],
    });

    return res.json({
      ok: true,
      order_number: orderNumber,
      order_id: order._id,
      total,
    });
  } catch (err: any) {
    if (err && err.status) return res.status(err.status).json({ error: err.error });
    return res.status(500).json({ error: 'Checkout failed' });
  }
});

export default router;
