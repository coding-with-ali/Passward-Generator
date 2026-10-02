'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, formatPKR, imgSrc } from '@/lib/api';
import { useToast } from '@/lib/store-context';
import type { Order } from '@/lib/types';

const STAGES = ['placed', 'confirmed', 'shipped', 'delivered'] as const;

function stageIndex(status: string) {
  const i = STAGES.indexOf(status as (typeof STAGES)[number]);
  return i === -1 ? 0 : i;
}

function TrackInner() {
  const sp = useSearchParams();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState(sp.get('id') ?? '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (idOverride?: string) => {
    const id = (idOverride ?? orderId).trim();
    if (!id) {
      toast('Please enter your order ID.', 'error');
      return;
    }
    setLoading(true);
    setOrder(null);
    try {
      const q = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : '';
      const d = await api<Order>(`/api/track/${encodeURIComponent(id.toUpperCase())}${q}`);
      setOrder(d);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Order not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = sp.get('id');
    if (id) lookup(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-bronze">Order Tracking</p>
        <h1 className="mt-2 font-serif text-5xl text-coco">Where Is My Order?</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); lookup(); }}
        className="mx-auto mt-8 max-w-xl rounded-2xl bg-white p-6 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            placeholder="Order ID (e.g. CWN-123456)"
            className="rounded-xl border border-sand px-4 py-3 text-sm uppercase focus:border-bronze focus:outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            type="email"
            className="rounded-xl border border-sand px-4 py-3 text-sm focus:border-bronze focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full bg-bronze py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark disabled:opacity-60"
        >
          {loading ? 'Looking up…' : 'Track Order'}
        </button>
      </form>

      {order && (
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-bronze">Order</p>
              <p className="font-serif text-3xl text-coco">{order.order_number}</p>
            </div>
            <span className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blush text-bronzedark'}`}>
              {order.status}
            </span>
          </div>

          {order.status !== 'cancelled' ? (
            <div className="mt-8">
              <div className="flex items-center">
                {STAGES.map((s, i) => {
                  const active = i <= stageIndex(order.status);
                  const entry = order.timeline.find((t) => t.status === s);
                  return (
                    <div key={s} className="flex flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        <div className={`h-px flex-1 ${i === 0 ? 'invisible' : active ? 'bg-bronze' : 'bg-sand'}`} />
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-bronze text-white' : 'bg-sand text-bronze/60'}`}>
                          {active ? (
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-xs font-semibold">{i + 1}</span>
                          )}
                        </div>
                        <div className={`h-px flex-1 ${i === STAGES.length - 1 ? 'invisible' : active && i < stageIndex(order.status) ? 'bg-bronze' : 'bg-sand'}`} />
                      </div>
                      <p className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.15em] ${active ? 'text-bronze' : 'text-bronze/50'}`}>{s}</p>
                      {entry?.at && (
                        <p className="text-[10px] text-bronzedark/60">
                          {new Date(entry.at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">This order was cancelled. Please contact our care team for help.</p>
          )}

          <div className="mt-8 border-t border-sand pt-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Items</p>
            <ul className="space-y-3">
              {(order.items ?? []).map((it, i) => (
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
            <div className="mt-4 flex justify-between border-t border-sand pt-4 font-serif text-2xl text-coco">
              <span>Total</span>
              <span>{formatPKR(order.total)}</span>
            </div>
            <p className="mt-2 text-xs text-bronzedark/70">
              Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}
              {order.city ? ` · Delivering to ${order.city}` : ''}
            </p>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-bronzedark/70">
        Need help? <Link href="/contact" className="font-semibold text-bronze hover:underline">Contact our care team</Link>
      </p>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-20 text-center font-serif text-2xl text-bronze">Loading tracker…</div>}>
      <TrackInner />
    </Suspense>
  );
}
