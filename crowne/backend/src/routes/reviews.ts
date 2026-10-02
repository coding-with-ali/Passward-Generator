import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/reviews (auth)
router.post('/reviews', requireAuth, async (req: Request, res: Response) => {
  try {
    const { slug, rating, comment } = req.body || {};
    if (!slug || rating === undefined || !comment) {
      return res.status(400).json({ error: 'slug, rating and comment are required' });
    }
    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const product = await Product.findOne({ slug: String(slug) });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const user = (req as any).user;
    // Name from token user record
    const { User } = await import('../models/User');
    const reviewer = await User.findById(user.id);
    await Review.create({
      product: product._id,
      user: user.id,
      name: reviewer ? reviewer.name : 'Customer',
      rating: ratingNum,
      comment: String(comment).trim(),
    });

    // Recompute product rating average (1 decimal) + reviewsCount
    const agg = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg.length) {
      product.rating = Math.round(agg[0].avg * 10) / 10;
      product.reviewsCount = agg[0].count;
      await product.save();
    }
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
