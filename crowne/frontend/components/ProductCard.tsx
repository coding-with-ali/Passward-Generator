'use client';

import Link from 'next/link';
import { useCart, useWishlist } from '@/lib/store-context';
import { formatPKR, imgSrc } from '@/lib/api';
import type { Product } from '@/lib/types';
import Stars from './Stars';
import { EASE, motion } from './motion';

export default function ProductCard({ product, dark = false }: { product: Product; dark?: boolean }) {
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
    <motion.article
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`group relative h-full overflow-hidden rounded-[1.4rem] transition-shadow duration-500 hover:shadow-[0_28px_56px_-24px_rgba(43,33,24,0.45)] ${
        dark ? 'bg-white/[0.06] ring-1 ring-white/10' : 'bg-white shadow-[0_10px_36px_-20px_rgba(43,33,24,0.25)]'
      }`}
    >
      <Link href={`/product/${product.slug}`} className="block h-full">
        <div className="relative aspect-[4/5] overflow-hidden bg-blush">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc(product.image)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-coco/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {onSale && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 18 }}
                className="rounded-full bg-bronze px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg"
              >
                Sale
              </motion.span>
            )}
            {product.bestseller && (
              <span className="rounded-full bg-coco/85 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sand backdrop-blur">
                Bestseller
              </span>
            )}
          </div>

          {product.stock <= 0 && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-coco/70 py-2.5 text-center text-xs uppercase tracking-[0.25em] text-blush backdrop-blur-sm">
              Sold out
            </span>
          )}

          {/* wishlist */}
          <motion.button
            onClick={toggleWish}
            aria-label="Toggle wishlist"
            whileTap={{ scale: 0.8 }}
            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-lg backdrop-blur transition-all duration-300 ${
              wished ? 'bg-bronze text-white' : 'bg-white/85 text-bronze hover:bg-white'
            }`}
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill={wished ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              key={String(wished)}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <path d="M12 21s-7.5-4.9-10-9.3C.4 8.6 2.3 4.9 6 4.9c2.2 0 3.6 1.2 4.4 2.4L12 9l1.6-1.7C14.4 6.1 15.8 4.9 18 4.9c3.7 0 5.6 3.7 4 6.8C19.5 16.1 12 21 12 21z" />
            </motion.svg>
          </motion.button>

          {/* quick add slides up */}
          <div className="absolute inset-x-3 bottom-3 translate-y-[130%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="w-full rounded-full bg-white/95 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-coco shadow-xl backdrop-blur transition-colors hover:bg-coco hover:text-blush disabled:opacity-0"
            >
              Add to Bag +
            </button>
          </div>
        </div>

        <div className={`p-5 ${dark ? '' : ''}`}>
          <p className={`text-[10px] font-medium uppercase tracking-[0.3em] ${dark ? 'text-bronze' : 'text-bronze'}`}>
            {product.category}
          </p>
          <h3 className={`mt-1.5 font-serif text-[1.35rem] leading-snug transition-colors group-hover:text-bronze ${dark ? 'text-blush' : 'text-coco'}`}>
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Stars value={product.rating} />
            <span className={`text-xs ${dark ? 'text-sand/60' : 'text-bronze/70'}`}>({product.reviews_count})</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-lg font-medium ${dark ? 'text-white' : 'text-coco'}`}>{formatPKR(product.price)}</span>
            {onSale && (
              <span className={`text-sm line-through ${dark ? 'text-sand/50' : 'text-bronze/55'}`}>{formatPKR(product.old_price!)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
