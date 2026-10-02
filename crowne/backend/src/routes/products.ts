import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { serializeProduct } from '../utils';

const router = Router();

// GET /api/categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await Product.distinct('category');
    categories.sort((a, b) => a.localeCompare(b));
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load categories' });
  }
});

// GET /api/products
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { q, category, min, max, sort, featured, bestseller } = req.query as Record<
      string,
      string
    >;
    const filter: Record<string, any> = {};

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { category: rx }, { description: rx }];
    }
    if (category) filter.category = category;
    if (min !== undefined || max !== undefined) {
      filter.price = {};
      if (min !== undefined && min !== '') filter.price.$gte = Number(min);
      if (max !== undefined && max !== '') filter.price.$lte = Number(max);
    }
    if (featured === '1') filter.featured = true;
    if (bestseller === '1') filter.bestseller = true;

    let sortSpec: Record<string, 1 | -1>;
    switch (sort) {
      case 'price-asc':
        sortSpec = { price: 1 };
        break;
      case 'price-desc':
        sortSpec = { price: -1 };
        break;
      case 'name':
        sortSpec = { name: 1 };
        break;
      case 'rating':
        sortSpec = { rating: -1 };
        break;
      case 'newest':
        sortSpec = { createdAt: -1 };
        break;
      default:
        sortSpec = { featured: -1, createdAt: -1 };
    }

    const products = await Product.find(filter).sort(sortSpec);
    return res.json(products.map(serializeProduct));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load products' });
  }
});

// GET /api/products/:slug/reviews
router.get('/products/:slug/reviews', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const reviews = await Review.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json(
      reviews.map((r: any) => ({
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        created_at: r.createdAt,
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// GET /api/products/:slug
router.get('/products/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .sort({ createdAt: -1 })
      .limit(4);
    return res.json({
      product: serializeProduct(product),
      related: related.map(serializeProduct),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load product' });
  }
});

export default router;
