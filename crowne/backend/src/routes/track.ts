import { Router, Request, Response } from 'express';
import { Order } from '../models/Order';

const router = Router();

// GET /api/track/:orderNumber?email=
router.get('/track/:orderNumber', async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const email = req.query.email as string | undefined;
    if (email && email.trim().toLowerCase() !== order.email.toLowerCase()) {
      return res.status(403).json({ error: 'Email does not match this order' });
    }

    return res.json({
      order_number: order.orderNumber,
      status: order.status,
      total: order.total,
      payment_method: order.paymentMethod,
      name: order.name,
      city: order.city,
      created_at: order.createdAt,
      timeline: (order.timeline || []).map((t) => ({
        status: t.status,
        at: t.at,
        note: t.note,
      })),
      items: (order.items || []).map((it) => ({
        name: it.name,
        size: it.size,
        color: it.color,
        price: it.price,
        qty: it.qty,
        image: it.image,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to track order' });
  }
});

export default router;
