'use client';

import Link from 'next/link';
import { useCart, useWishlist } from '@/lib/store-context';
import { formatPKR, imgSrc } from '@/lib/api';
import type { Product } from '@/lib/types';
import Stars from './Stars';
import { EASE, motion } from './motion';

export default function ProductCard({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product.slug);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes?.[0] ?? '38',
      color: product.colors?.[0] ?? '',
      qty: 1,
    });
    setOpen(true);
  };

  const toggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.slug);
  };

  const onSale = product.old_price != null && product.old_price > product.price;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group relative h-full overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-[0_24px_48px_-20px_rgba(138,109,59,0.4)]"
    >
      <Link href={`/product/${product.slug}`} className="block h-full">
        <div className="relative aspect-[4/5] overflow-hidden bg-blush">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc(product.image)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-coco/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {onSale && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 18 }}
              className="absolute left-3 top-3 rounded-full bg-bronze px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white"
            >
              Sale
            </motion.span>
          )}
          {product.stock <= 0 && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-coco/70 py-2 text-center text-xs uppercase tracking-[0.25em] text-blush">
              Sold out
            </span>
          )}
          <motion.button
            onClick={toggleWish}
            aria-label="Toggle wishlist"
            whileTap={{ scale: 0.82 }}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow transition-colors ${
              wished ? 'bg-bronze text-white' : 'bg-white/90 text-bronze hover:bg-white'
            }`}
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill={wished ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              key={String(wished)}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <path d="M12 21s-7.5-4.9-10-9.3C.4 8.6 2.3 4.9 6 4.9c2.2 0 3.6 1.2 4.4 2.4L12 9l1.6-1.7C14.4 6.1 15.8 4.9 18 4.9c3.7 0 5.6 3.7 4 6.8C19.5 16.1 12 21 12 21z" />
            </motion.svg>
          </motion.button>
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="absolute inset-x-3 bottom-3 translate-y-14 rounded-full bg-coco/90 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-blush opacity-0 backdrop-blur transition-all duration-300 hover:bg-coco group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-0"
          >
            Add to Bag
          </button>
        </div>
        <div className="p-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-bronze">{product.category}</p>
          <h3 className="mt-1 font-serif text-lg leading-snug text-coco transition-colors group-hover:text-bronze">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <Stars value={product.rating} />
            <span className="text-xs text-bronze/70">({product.reviews_count})</span>
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="text-base font-medium text-coco">{formatPKR(product.price)}</span>
            {onSale && (
              <span className="text-sm text-bronze/60 line-through">{formatPKR(product.old_price!)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
