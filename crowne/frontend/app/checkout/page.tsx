'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useCart, useToast } from '@/lib/store-context';
import { api, formatPKR, imgSrc, shippingFor } from '@/lib/api';
import type { PaymentsConfig } from '@/lib/types';

const STEPS = ['Shipping', 'Payment', 'Review'];

const inputCls =
  'w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-coco placeholder:text-bronze/40 focus:border-bronze focus:outline-none';

function CheckoutInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();
  const { items, subtotal, clear } = useCart();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<{ order_number: string; total: number } | null>(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', postal: '' });
  const [couponCode] = useState(sp.get('coupon') ?? '');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<'cod' | 'card'>('cod');
  const [payConfig, setPayConfig] = useState<PaymentsConfig | null>(null);
  const [mockCard, setMockCard] = useState({ number: '4242 4242 4242 4242', expiry: '12/28', cvc: '123' });

  const discount = couponDiscount;
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;

  useEffect(() => {
    api<PaymentsConfig>('/api/payments/config').then(setPayConfig).catch(() => {});
    if (couponCode && subtotal > 0) {
      api<{ discount: number }>('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
        .then((d) => setCouponDiscount(d.discount))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-serif text-5xl text-coco">Your bag is empty</p>
        <p className="mt-3 text-bronzedark/70">Add a few pieces before checking out.</p>
        <Link href="/shop" className="mt-8 inline-block rounded-full bg-bronze px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark">
          Shop the Collection
        </Link>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const canNextFromStep0 =
    form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.phone.trim() && form.address.trim() && form.city.trim();

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const body: Record<string, unknown> = {
        items: items.map((it) => ({ id: it.id, qty: it.qty, size: it.size, color: it.color })),
        payment_method: payMethod,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postal: form.postal,
        coupon: couponCode,
      };
      // Card payments: demo-only mock. We collect mock card details and hand a
      // mock payment-intent id to the backend, which still validates everything.
      if (payMethod === 'card') {
        if (!payConfig?.card_enabled) {
          throw new Error('Card payments are not configured yet — please choose Cash on Delivery.');
        }
        const digits = mockCard.number.replace(/\D/g, '');
        if (digits.length < 12) throw new Error('Please enter a valid demo card number.');
        body.payment_intent_id = `pi_mock_${Date.now()}`;
      }
      const d = await api<{ order_number: string; total: number }>('/api/checkout', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      clear();
      setDone({ order_number: d.order_number, total: d.total });
      toast('Your order has been placed.', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Checkout failed. Please try again.', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="rounded-3xl bg-white p-12 shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blush">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-bronze" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 font-serif text-5xl text-coco">Order Confirmed</h1>
          <p className="mt-3 text-bronzedark">Thank you, {form.name.split(' ')[0] || 'queen'}. Your order is being prepared.</p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-blush/60 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-bronze">Order number</p>
            <p className="mt-1 font-serif text-3xl text-coco">{done.order_number}</p>
            <p className="mt-2 text-sm text-bronzedark">Total: {formatPKR(done.total)} · Cash on Delivery</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={`/track?id=${encodeURIComponent(done.order_number)}`} className="rounded-full bg-bronze px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark">
              Track Order
            </Link>
            <Link href="/shop" className="rounded-full border border-bronze px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-bronze hover:bg-blush">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-center font-serif text-5xl text-coco">Checkout</h1>

      {/* stepper */}
      <div className="mx-auto mb-10 flex max-w-xl items-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${i <= step ? 'bg-bronze text-white' : 'bg-sand text-bronze'}`}>
                {i + 1}
              </div>
              <span className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${i <= step ? 'text-bronze' : 'text-bronze/50'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-2 h-px flex-1 ${i < step ? 'bg-bronze' : 'bg-sand'}`} />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            {step === 0 && (
              <div>
                <h2 className="mb-5 font-serif text-2xl text-coco">Contact & Shipping</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={form.name} onChange={set('name')} placeholder="Full name *" className={inputCls} />
                  <input value={form.phone} onChange={set('phone')} placeholder="Phone *" className={inputCls} />
                  <input value={form.email} onChange={set('email')} placeholder="Email *" type="email" className={`${inputCls} sm:col-span-2`} />
                  <input value={form.address} onChange={set('address')} placeholder="Street address *" className={`${inputCls} sm:col-span-2`} />
                  <input value={form.city} onChange={set('city')} placeholder="City *" className={inputCls} />
                  <input value={form.postal} onChange={set('postal')} placeholder="Postal code (optional)" className={inputCls} />
                </div>
                <button
                  onClick={() => canNextFromStep0 && setStep(1)}
                  disabled={!canNextFromStep0}
                  className="mt-6 w-full rounded-full bg-bronze py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark disabled:opacity-40 sm:w-auto sm:px-12"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="mb-5 font-serif text-2xl text-coco">Payment Method</h2>
                <div className="space-y-3">
                  <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${payMethod === 'cod' ? 'border-bronze bg-blush/50' : 'border-sand'}`}>
                    <input type="radio" name="pay" checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')} className="mt-1 h-4 w-4 accent-[#e14d6f]" />
                    <div>
                      <p className="font-medium text-coco">Cash on Delivery</p>
                      <p className="mt-1 text-sm text-bronzedark/70">Pay in cash when your order arrives at your doorstep.</p>
                    </div>
                  </label>
                  <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${payMethod === 'card' ? 'border-bronze bg-blush/50' : 'border-sand'}`}>
                    <input type="radio" name="pay" checked={payMethod === 'card'} onChange={() => setPayMethod('card')} className="mt-1 h-4 w-4 accent-[#e14d6f]" />
                    <div className="flex-1">
                      <p className="font-medium text-coco">Debit / Credit Card</p>
                      {payConfig && !payConfig.card_enabled ? (
                        <p className="mt-1 text-sm font-medium text-red-800">
                          Card payments are not configured yet — please choose Cash on Delivery.
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-bronzedark/70">Secure online card payment.</p>
                      )}
                      {payMethod === 'card' && payConfig?.card_enabled && (
                        <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-2">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-bronze sm:col-span-2">
                            Demo card form — no real charge
                          </p>
                          <input
                            value={mockCard.number}
                            onChange={(e) => setMockCard((m) => ({ ...m, number: e.target.value }))}
                            placeholder="Card number"
                            inputMode="numeric"
                            className={`${inputCls} sm:col-span-2`}
                          />
                          <input
                            value={mockCard.expiry}
                            onChange={(e) => setMockCard((m) => ({ ...m, expiry: e.target.value }))}
                            placeholder="MM/YY"
                            className={inputCls}
                          />
                          <input
                            value={mockCard.cvc}
                            onChange={(e) => setMockCard((m) => ({ ...m, cvc: e.target.value }))}
                            placeholder="CVC"
                            inputMode="numeric"
                            className={inputCls}
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(0)} className="rounded-full border border-sand px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-bronze hover:bg-blush">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={payMethod === 'card' && payConfig != null && !payConfig.card_enabled}
                    className="flex-1 rounded-full bg-bronze py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark disabled:opacity-40"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-5 font-serif text-2xl text-coco">Review & Place Order</h2>
                <div className="rounded-2xl bg-blush/50 p-5 text-sm text-bronzedark">
                  <p className="font-medium text-coco">{form.name}</p>
                  <p>{form.address}, {form.city}{form.postal ? ` ${form.postal}` : ''}</p>
                  <p>{form.phone} · {form.email}</p>
                  <p className="mt-2">Payment: {payMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
                </div>
                <ul className="mt-4 space-y-3">
                  {items.map((it, i) => (
                    <li key={i} className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgSrc(it.image)} alt={it.name} className="h-14 w-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-coco">{it.name}</p>
                        <p className="text-xs text-bronze/70">EU {it.size}{it.color ? ` · ${it.color}` : ''} × {it.qty}</p>
                      </div>
                      <p className="text-sm text-coco">{formatPKR(it.price * it.qty)}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(1)} className="rounded-full border border-sand px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-bronze hover:bg-blush">
                    Back
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="flex-1 rounded-full bg-coco py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-blush hover:bg-bronzedark disabled:opacity-60"
                  >
                    {placing ? 'Placing Order…' : `Place Order · ${formatPKR(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* summary */}
        <div>
          <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-serif text-2xl text-coco">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-bronzedark"><span>Subtotal</span><span className="text-coco">{formatPKR(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-bronze"><span>Coupon {couponCode && `(${couponCode})`}</span><span>− {formatPKR(discount)}</span></div>
              )}
              <div className="flex justify-between text-bronzedark">
                <span>Shipping</span><span className="text-coco">{shipping === 0 ? 'FREE' : formatPKR(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-sand pt-3 font-serif text-2xl text-coco">
                <span>Total</span><span>{formatPKR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-6 py-20 text-center font-serif text-2xl text-bronze">Preparing checkout…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
