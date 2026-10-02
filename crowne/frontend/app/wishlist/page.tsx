'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, normProducts } from '@/lib/api';
import { useWishlist } from '@/lib/store-context';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { slugs, clear } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slugs.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      slugs.map((s) =>
        api<{ product: unknown }>(`/api/products/${encodeURIComponent(s)}`)
          .then((d) => normProducts([d.product])[0])
          .catch(() => null)
      )
    )
      .then((list) => setProducts(list.filter((p): p is Product => !!p)))
      .finally(() => setLoading(false));
  }, [slugs]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-bronze">Saved Pieces</p>
        <h1 className="mt-2 font-serif text-5xl text-coco">Your Wishlist</h1>
        {slugs.length > 0 && (
          <button onClick={clear} className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-bronze/70 hover:text-bronze hover:underline">
            Clear wishlist
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-sm text-bronze/60">Loading your wishlist…</p>
      ) : products.length === 0 ? (
        <div className="mx-auto max-w-md rounded-3xl bg-white p-12 text-center shadow-sm">
          <p className="font-serif text-3xl text-coco">Nothing saved yet</p>
          <p className="mt-2 text-sm text-bronzedark/70">Tap the heart on any piece to keep it here.</p>
          <Link href="/shop" className="mt-6 inline-block rounded-full bg-bronze px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark">
            Discover Pieces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={String(p.id)} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
