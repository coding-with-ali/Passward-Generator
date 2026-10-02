import { Router, Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Coupon } from '../models/Coupon';
import { User } from '../models/User';
import { Newsletter } from '../models/Newsletter';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { serializeProduct, serializeOrder, slugify } from '../utils';

const router = Router();
router.use(requireAuth, requireAdmin);

const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// Wrap multer so file errors become JSON 400s
function uploadSingle(field: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(field)(req, res, (err: any) => {
      if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
      next();
    });
  };
}

// ---------- STATS ----------
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const nonCancelled = { status: { $ne: 'cancelled' } };

    const [revenueAgg, orders, products, customers, lowStock, recent, byDayRaw, byStatusRaw] =
      await Promise.all([
        Order.aggregate([{ $match: nonCancelled }, { $group: { _id: null, v: { $sum: '$total' } } }]),
        Order.countDocuments(),
        Product.countDocuments(),
        User.countDocuments({ isAdmin: { $ne: true } }),
        Product.find({ stock: { $lte: 10 } })
          .sort({ stock: 1 })
          .limit(10)
          .lean(),
        Order.find().sort({ createdAt: -1 }).limit(8).lean(),
        Order.aggregate([
          { $match: { ...nonCancelled, createdAt: { $gte: dayStart(-13) } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              v: { $sum: '$total' },
              c: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([{ $group: { _id: '$status', c: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      ]);

    const byDay: Array<{ d: string; v: number; c: number }> = [];
    const byDayMap = new Map(byDayRaw.map((b: any) => [b._id, { v: b.v, c: b.c }]));
    for (let i = 13; i >= 0; i--) {
      const d = dayStart(-i).toISOString().slice(0, 10);
      const entry = byDayMap.get(d) || { v: 0, c: 0 };
      byDay.push({ d, v: entry.v, c: entry.c });
    }

    return res.json({
      revenue: revenueAgg[0]?.v || 0,
      orders,
      products,
      customers,
      lowStock: lowStock.map((p: any) => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        image: p.image,
      })),
      recent: recent.map((o: any) => ({
        order_number: o.orderNumber,
        name: o.name,
        total: o.total,
        status: o.status,
        created_at: o.createdAt,
      })),
      byDay,
      byStatus: byStatusRaw.map((b: any) => ({ status: b._id, c: b.c })),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load stats' });
  }
});

function dayStart(offsetDays: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

// ---------- ORDERS ----------
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const { status, q } = req.query as Record<string, string>;
    const filter: Record<string, any> = {};
    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` });
      }
      filter.status = status;
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ orderNumber: rx }, { name: rx }, { email: rx }, { phone: rx }];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json(orders.map(serializeOrder));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load orders' });
  }
});

router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json(serializeOrder(order));
  } catch (err) {
    return res.status(404).json({ error: 'Order not found' });
  }
});

router.put('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body || {};
    if (!status || !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status as any;
    order.timeline.push({ status, at: new Date(), note: 'Status updated by admin' });
    await order.save();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

// ---------- PRODUCTS ----------
router.get('/products', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products.map(serializeProduct));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load products' });
  }
});

function csv(value: any): string[] {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base) || 'product';
  let candidate = slug;
  let n = 2;
  while (await Product.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}

function bool1(value: any): boolean {
  return value === '1' || value === 1 || value === true || value === 'true';
}

router.post('/products', uploadSingle('image'), async (req: Request, res: Response) => {
  try {
    const { name, category, price, old_price, description, colors, sizes, stock, featured, bestseller, image_url } =
      req.body || {};
    if (!name || !category || price === undefined || price === '') {
      return res.status(400).json({ error: 'Name, category and price are required' });
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'Price must be a valid number' });
    }

    let image = '';
    if ((req as any).file) {
      image = `/uploads/${(req as any).file.filename}`;
    } else if (image_url) {
      image = String(image_url).trim();
    }

    const product = await Product.create({
      name: String(name).trim(),
      slug: await uniqueSlug(String(name)),
      category: String(category).trim(),
      price: priceNum,
      oldPrice: old_price !== undefined && old_price !== '' ? Number(old_price) : undefined,
      description: description ? String(description).trim() : '',
      colors: csv(colors),
      sizes: sizes ? csv(sizes) : ['36', '37', '38', '39', '40', '41', '42'],
      stock: stock !== undefined && stock !== '' ? Number(stock) : 0,
      image,
      images: image ? [image] : [],
      featured: bool1(featured),
      bestseller: bool1(bestseller),
    });
    return res.json({ ok: true, id: product._id });
  } catch (err: any) {
    if (err?.code === 11000) return res.status(400).json({ error: 'A product with this slug already exists' });
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', uploadSingle('image'), async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const body = req.body || {};
    if (body.name !== undefined) {
      product.name = String(body.name).trim();
      product.slug = await uniqueSlug(String(body.name), String(product._id));
    }
    if (body.category !== undefined) product.category = String(body.category).trim();
    if (body.price !== undefined && body.price !== '') product.price = Number(body.price);
    if (body.old_price !== undefined)
      product.oldPrice = body.old_price === '' ? undefined : Number(body.old_price);
    if (body.description !== undefined) product.description = String(body.description).trim();
    if (body.colors !== undefined) product.colors = csv(body.colors);
    if (body.sizes !== undefined) product.sizes = body.sizes ? csv(body.sizes) : product.sizes;
    if (body.stock !== undefined && body.stock !== '') product.stock = Number(body.stock);
    if (body.featured !== undefined) product.featured = bool1(body.featured);
    if (body.bestseller !== undefined) product.bestseller = bool1(body.bestseller);
    if ((req as any).file) {
      const image = `/uploads/${(req as any).file.filename}`;
      product.image = image;
      product.images = [image, ...(product.images || []).filter((i) => i !== image)];
    } else if (body.image_url !== undefined && body.image_url !== '') {
      product.image = String(body.image_url).trim();
      if (!product.images.includes(product.image)) product.images.unshift(product.image);
    }

    await product.save();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ---------- COUPONS ----------
router.get('/coupons', async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return res.json(
      coupons.map((c: any) => ({
        id: c._id,
        code: c.code,
        type: c.type,
        value: c.value,
        min_order: c.minOrder,
        active: c.active,
        usage_limit: c.usageLimit,
        used_count: c.usedCount,
        created_at: c.createdAt,
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load coupons' });
  }
});

router.post('/coupons', async (req: Request, res: Response) => {
  try {
    const { code, type, value, min_order, usage_limit } = req.body || {};
    if (!code || !type || value === undefined || value === '') {
      return res.status(400).json({ error: 'Code, type and value are required' });
    }
    if (type !== 'percent' && type !== 'fixed') {
      return res.status(400).json({ error: "Type must be 'percent' or 'fixed'" });
    }
    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      type,
      value: Number(value),
      minOrder: min_order !== undefined && min_order !== '' ? Number(min_order) : 0,
      usageLimit: usage_limit !== undefined && usage_limit !== '' ? Number(usage_limit) : 0,
    });
    return res.json({ ok: true, id: coupon._id });
  } catch (err: any) {
    if (err?.code === 11000) return res.status(400).json({ error: 'A coupon with this code already exists' });
    return res.status(500).json({ error: 'Failed to create coupon' });
  }
});

router.put('/coupons/:id', async (req: Request, res: Response) => {
  try {
    const { active } = req.body || {};
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    if (active !== undefined) coupon.active = !!active;
    await coupon.save();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update coupon' });
  }
});

router.delete('/coupons/:id', async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// ---------- CUSTOMERS ----------
router.get('/customers', async (_req: Request, res: Response) => {
  try {
    const users = await User.find({ isAdmin: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    const customers = await Promise.all(
      users.map(async (u: any) => {
        const agg = await Order.aggregate([
          { $match: { user: u._id, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, count: { $sum: 1 }, spent: { $sum: '$total' } } },
        ]);
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          created_at: u.createdAt,
          orders: agg[0]?.count || 0,
          spent: agg[0]?.spent || 0,
        };
      })
    );
    return res.json(customers);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load customers' });
  }
});

// ---------- SUBSCRIBERS ----------
router.get('/subscribers', async (_req: Request, res: Response) => {
  try {
    const subs = await Newsletter.find().sort({ createdAt: -1 }).limit(500).lean();
    return res.json(subs.map((s: any) => ({ email: s.email, created_at: s.createdAt })));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load subscribers' });
  }
});

export default router;
