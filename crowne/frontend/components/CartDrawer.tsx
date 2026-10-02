'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store-context';
import { formatPKR, imgSrc, shippingFor, FREE_SHIPPING_THRESHOLD } from '@/lib/api';

export default function CartDrawer() {
  const router = useRouter();
  const { items, open, setOpen, updateQty, removeAt, subtotal } = useCart();

  if (!open) return null;

  const shipping = shippingFor(subtotal);

  const goCheckout = () => {
    setOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-coco/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fbf7f1] shadow-2xl">
        <div className="flex items-center justify-between border-b border-sand px-6 py-4">
          <h2 className="font-serif text-2xl text-coco">Your Bag ({items.length})</h2>
          <button onClick={() => setOpen(false)} aria-label="Close bag" className="rounded-full p-2 text-bronze hover:bg-blush">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {subtotal < FREE_SHIPPING_THRESHOLD && items.length > 0 && (
          <div className="border-b border-sand bg-blush/60 px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-bronzedark">
            Add {formatPKR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
          </div>
        )}

        <div className="nice-scroll flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-serif text-2xl text-bronze">Your bag is empty</p>
              <p className="mt-2 text-sm text-bronzedark/70">Every queen needs her crowning pair.</p>
              <button
                onClick={() => { setOpen(false); router.push('/shop'); }}
                className="mt-6 rounded-full bg-bronze px-8 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-bronzedark"
              >
                Shop now
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((it, i) => (
                <li key={`${it.id}-${it.size}-${it.color}-${i}`} className="flex gap-4 rounded-xl bg-white p-3 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgSrc(it.image)} alt={it.name} className="h-20 w-16 rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-serif text-base leading-tight text-coco">{it.name}</p>
                        <p className="mt-0.5 text-xs text-bronze/70">
                          {it.color && `${it.color} · `}EU {it.size}
                        </p>
                      </div>
                      <button onClick={() => removeAt(i)} aria-label="Remove item" className="text-bronze/60 hover:text-red-800">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m3 0l-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-sand">
                        <button onClick={() => updateQty(i, it.qty - 1)} className="px-2.5 py-1 text-bronze" aria-label="Decrease">−</button>
                        <span className="w-6 text-center text-sm">{it.qty}</span>
                        <button onClick={() => updateQty(i, it.qty + 1)} className="px-2.5 py-1 text-bronze" aria-label="Increase">+</button>
                      </div>
                      <p className="text-sm font-medium text-coco">{formatPKR(it.price * it.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-sand bg-white px-6 py-4">
            <div className="flex justify-between text-sm text-bronzedark">
              <span>Subtotal</span>
              <span className="font-medium text-coco">{formatPKR(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-bronzedark">
              <span>Shipping</span>
              <span className="font-medium text-coco">{shipping === 0 ? 'FREE' : formatPKR(shipping)}</span>
            </div>
            <div className="mt-2 flex gap-3">
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-bronze py-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-bronze hover:bg-blush"
              >
                View bag
              </Link>
              <button
                onClick={goCheckout}
                className="flex-1 rounded-full bg-bronze py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-bronzedark"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
