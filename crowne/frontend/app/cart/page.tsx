'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart, useToast } from '@/lib/store-context';
import { api, formatPKR, imgSrc, shippingFor } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, updateQty, removeAt, subtotal } = useCart();
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [validating, setValidating] = useState(false);

  const discount = coupon?.discount ?? 0;
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;

  const validateCoupon = async () => {
    if (!code.trim()) return;
    setValidating(true);
    try {
      const d = await api<{ code: string; discount: number }>('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      setCoupon({ code: d.code, discount: d.discount });
      toast(`Coupon ${d.code} applied — ${formatPKR(d.discount)} off.`, 'success');
    } catch (err) {
      setCoupon(null);
      toast(err instanceof Error ? err.message : 'Invalid coupon.', 'error');
    } finally {
      setValidating(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-serif text-5xl text-coco">Your bag is empty</p>
        <p className="mt-3 text-bronzedark/70">Every queen needs her crowning pair.</p>
        <Link href="/shop" className="mt-8 inline-block rounded-full bg-bronze px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark">
          Shop the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-8 text-center font-serif text-5xl text-coco">Shopping Bag</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="space-y-4">
            {items.map((it, i) => (
              <li key={`${it.id}-${it.size}-${it.color}-${i}`} className="flex gap-5 rounded-2xl bg-white p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc(it.image)} alt={it.name} className="h-28 w-24 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/product/${it.slug}`} className="font-serif text-xl text-coco hover:text-bronze">
                        {it.name}
                      </Link>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-bronze/70">
                        {it.color && `${it.color} · `}EU {it.size}
                      </p>
                    </div>
                    <button onClick={() => removeAt(i)} className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze/60 hover:text-red-800">
                      Remove
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-sand">
                      <button onClick={() => updateQty(i, it.qty - 1)} className="px-3.5 py-2 text-bronze" aria-label="Decrease">−</button>
                      <span className="w-8 text-center text-sm font-medium">{it.qty}</span>
                      <button onClick={() => updateQty(i, it.qty + 1)} className="px-3.5 py-2 text-bronze" aria-label="Increase">+</button>
                    </div>
                    <p className="font-medium text-coco">{formatPKR(it.price * it.qty)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
            {/* coupon */}
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Coupon Code</p>
            <div className="mt-2 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 rounded-full border border-sand px-4 py-2.5 text-sm uppercase focus:border-bronze focus:outline-none"
              />
              <button
                onClick={validateCoupon}
                disabled={validating}
                className="rounded-full bg-coco px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-blush hover:bg-bronzedark disabled:opacity-60"
              >
                {validating ? '…' : 'Apply'}
              </button>
            </div>
            {coupon && (
              <p className="mt-2 text-xs text-bronze">
                {coupon.code} applied — {formatPKR(coupon.discount)} off. {' '}
                <button onClick={() => { setCoupon(null); setCode(''); }} className="underline">Remove</button>
              </p>
            )}

            <div className="mt-6 space-y-2 border-t border-sand pt-4 text-sm">
              <div className="flex justify-between text-bronzedark">
                <span>Subtotal</span><span className="font-medium text-coco">{formatPKR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-bronze">
                  <span>Coupon discount</span><span>− {formatPKR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-bronzedark">
                <span>Shipping</span>
                <span className="font-medium text-coco">{shipping === 0 ? 'FREE' : formatPKR(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-sand pt-3 font-serif text-2xl text-coco">
                <span>Total</span><span>{formatPKR(total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/checkout${coupon ? `?coupon=${encodeURIComponent(coupon.code)}` : ''}`)}
              className="mt-6 w-full rounded-full bg-bronze py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-bronzedark"
            >
              Proceed to Checkout
            </button>
            <Link href="/shop" className="mt-3 block text-center text-xs font-semibold uppercase tracking-[0.25em] text-bronze hover:underline">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
