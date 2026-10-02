import { Router, Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { calculateDiscount } from '../utils';

const router = Router();

// Validate a coupon code against a subtotal. Throws { status, error } on failure.
export async function validateCouponForSubtotal(code: string, subtotal: number) {
  const normalized = String(code).trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalized });
  if (!coupon) throw { status: 400, error: 'Invalid coupon code' };
  if (!coupon.active) throw { status: 400, error: 'This coupon is no longer active' };
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
    throw { status: 400, error: 'This coupon has reached its usage limit' };
  if (subtotal < coupon.minOrder)
    throw {
      status: 400,
      error: `This coupon requires a minimum order of PKR ${coupon.minOrder}`,
    };
  const discount = calculateDiscount(coupon.type, coupon.value, subtotal);
  return { coupon, discount };
}

// POST /api/coupons/validate
router.post('/coupons/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });
    const { coupon, discount } = await validateCouponForSubtotal(
      String(code),
      Number(subtotal) || 0
    );
    return res.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    });
  } catch (err: any) {
    if (err && err.status) return res.status(err.status).json({ error: err.error });
    return res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

export default router;
