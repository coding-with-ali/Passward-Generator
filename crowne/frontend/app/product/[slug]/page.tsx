'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, EU_SIZES, formatPKR, imgSrc, normProduct, normProducts } from '@/lib/api';
import { useAuth, useCart, useToast, useWishlist } from '@/lib/store-context';
import type { Product, Review } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Stars from '@/components/Stars';

export default function ProductPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { add, setOpen } = useCart();
  const { toggle, has } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    api<{ product: unknown; related: unknown }>(`/api/products/${slug}`)
      .then((d) => {
        const p = normProduct(d.product as Record<string, unknown>);
        setProduct(p);
        setRelated(normProducts(d.related));
        setColor(p.colors?.[0] ?? '');
        setSize('');
        setActiveImg(0);
        return api<unknown>(`/api/products/${slug}/reviews`);
      })
      .then((r) => setReviews(Array.isArray(r) ? (r as Review[]) : []))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-blush" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-blush" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-blush" />
            <div className="h-24 animate-pulse rounded bg-blush" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-serif text-4xl text-bronze">This piece is no longer available</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-bronze px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark">
          Back to shop
        </Link>
      </div>
    );
  }

  const gallery = [product.image, ...(product.images || [])].filter(Boolean);
  const sizes = product.sizes?.length ? product.sizes : EU_SIZES;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 10;
  const onSale = product.old_price != null && product.old_price > product.price;

  const buildItem = () => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    size: size || sizes[0],
    color,
    qty,
  });

  const handleAdd = () => {
    if (outOfStock) return;
    if (!size) {
      toast('Please choose a size first.', 'error');
      return;
    }
    add(buildItem());
    setOpen(true);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    if (!size) {
      toast('Please choose a size first.', 'error');
      return;
    }
    add({ ...buildItem(), qty });
    router.push('/checkout');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast('Please write a few words about this piece.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const d = await api<Review>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ slug: product.slug, rating, comment: comment.trim() }),
      });
      setReviews((r) => [d, ...r]);
      setComment('');
      toast('Thank you for your review.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <nav className="mb-6 text-xs uppercase tracking-[0.2em] text-bronze/70">
        <Link href="/" className="hover:text-bronze">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-bronze">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-bronzedark">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <div className="overflow-hidden rounded-2xl bg-blush shadow-sm">
            <div className="aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc(gallery[activeImg])}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`overflow-hidden rounded-xl bg-blush ring-2 transition ${i === activeImg ? 'ring-bronze' : 'ring-transparent hover:ring-sand'}`}
                >
                  <div className="aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc(g)} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-bronze">{product.category}</p>
          <h1 className="mt-2 font-serif text-5xl leading-tight text-coco">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <Stars value={product.rating} size={16} />
            <span className="text-sm text-bronze/70">
              {product.rating.toFixed(1)} · {product.reviews_count} reviews
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-serif text-4xl text-coco">{formatPKR(product.price)}</span>
            {onSale && <span className="text-xl text-bronze/60 line-through">{formatPKR(product.old_price!)}</span>}
          </div>

          {lowStock && (
            <p className="mt-3 inline-block rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-800">
              Only {product.stock} left in stock
            </p>
          )}
          {outOfStock && (
            <p className="mt-3 inline-block rounded-full bg-coco px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blush">
              Out of stock
            </p>
          )}

          <p className="mt-5 leading-relaxed text-bronzedark">{product.description}</p>

          {/* colors */}
          {product.colors?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">
                Colour — <span className="text-coco">{color}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${color === c ? 'border-bronze bg-bronze text-white' : 'border-sand bg-white text-bronzedark hover:border-bronze'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* sizes */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Size (EU)</p>
              {!size && <p className="text-xs text-red-800/70">Please select a size</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex h-11 w-12 items-center justify-center rounded-lg border text-sm transition ${size === s ? 'border-bronze bg-bronze text-white' : 'border-sand bg-white text-bronzedark hover:border-bronze'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* qty + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-sand bg-white">
              <button onClick={() => setQty((v) => Math.max(1, v - 1))} className="px-4 py-3 text-bronze" aria-label="Decrease quantity">−</button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((v) => Math.min(10, v + 1))} className="px-4 py-3 text-bronze" aria-label="Increase quantity">+</button>
            </div>
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="flex-1 rounded-full bg-bronze px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-bronzedark disabled:opacity-40"
            >
              Add to Bag
            </button>
            <button
              onClick={() => toggle(product.slug)}
              aria-label="Toggle wishlist"
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${has(product.slug) ? 'border-bronze bg-bronze text-white' : 'border-sand bg-white text-bronze hover:border-bronze'}`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill={has(product.slug) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-7.5-4.9-10-9.3C.4 8.6 2.3 4.9 6 4.9c2.2 0 3.6 1.2 4.4 2.4L12 9l1.6-1.7C14.4 6.1 15.8 4.9 18 4.9c3.7 0 5.6 3.7 4 6.8C19.5 16.1 12 21 12 21z" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="mt-3 w-full rounded-full bg-coco px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-blush transition hover:bg-bronzedark disabled:opacity-40"
          >
            Buy Now
          </button>

          <div className="mt-8 space-y-2 rounded-2xl bg-white p-5 text-sm text-bronzedark shadow-sm">
            <p>Free shipping on orders over PKR 5,000</p>
            <p>7-day easy size exchange</p>
            <p>Cash on delivery available nationwide</p>
          </div>
        </div>
      </div>

      {/* reviews */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-3xl text-coco">Reviews ({reviews.length})</h2>
          <div className="mt-5 space-y-4">
            {reviews.length === 0 && <p className="text-sm text-bronze/70">No reviews yet — be the first to share your thoughts.</p>}
            {reviews.map((r, i) => (
              <div key={i} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-coco">{r.name}</p>
                  <Stars value={r.rating} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-bronzedark">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-serif text-3xl text-coco">Write a Review</h2>
          {user ? (
            <form onSubmit={submitReview} className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Your rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                    <svg viewBox="0 0 24 24" className={`h-7 w-7 ${n <= rating ? 'text-bronze' : 'text-sand'}`} fill="currentColor">
                      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="How did they fit? How did they feel?"
                className="mt-4 w-full rounded-xl border border-sand px-4 py-3 text-sm focus:border-bronze focus:outline-none"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="mt-4 rounded-full bg-bronze px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark disabled:opacity-60"
              >
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-bronzedark">Please sign in to write a review.</p>
              <Link href="/account" className="mt-4 inline-block rounded-full bg-bronze px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-center font-serif text-4xl text-coco">You May Also Adore</h2>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={String(p.id)} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
