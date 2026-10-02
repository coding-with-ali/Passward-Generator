'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, imgSrc, normProducts } from '@/lib/api';
import { useToast } from '@/lib/store-context';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Stars from '@/components/Stars';

const CATEGORIES = [
  { name: 'Heels', img: '/images/product-1.jpg', blurb: 'Command every room' },
  { name: 'Flats', img: '/images/product-4.jpg', blurb: 'Grace in every step' },
  { name: 'Sandals', img: '/images/product-7.jpg', blurb: 'Sunlit elegance' },
  { name: 'Slippers', img: '/images/product-10.jpg', blurb: 'Effortless comfort' },
];

const TESTIMONIALS = [
  {
    quote: 'The heels are the most comfortable pair I own — I wore them through an entire wedding and my feet never complained.',
    name: 'Ayesha K.',
    city: 'Karachi',
  },
  {
    quote: 'Ordered on Monday, delivered by Wednesday. The packaging felt like opening a gift from royalty. Crowne is my new obsession.',
    name: 'Mahnoor S.',
    city: 'Lahore',
  },
  {
    quote: 'Premium quality at a fair price. The flats I bought look far more expensive than they were — I get compliments every day.',
    name: 'Fatima R.',
    city: 'Islamabad',
  },
];

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-bronze">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-4xl text-coco sm:text-5xl">{title}</h2>
      <div className="mx-auto mt-4 h-px w-16 bg-bronze" />
    </div>
  );
}

export default function HomePage() {
  const { toast } = useToast();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<unknown>('/api/products?featured=1')
      .then((d) => setFeatured(normProducts(d).slice(0, 4)))
      .catch(() => {});
    api<unknown>('/api/products?bestseller=1')
      .then((d) => setBestsellers(normProducts(d).slice(0, 4)))
      .catch(() => {});
  }, []);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const d = await api<{ message?: string }>('/api/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      toast(d.message || 'Welcome to the Crowne circle.', 'success');
      setEmail('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc('/images/hero.jpg')}
          alt="Crowne — Step Into Elegance"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-coco/50 via-coco/25 to-coco/55" />
        <div className="relative z-10 px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.5em] text-sand">Crowne Footwear</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-6xl font-medium leading-tight text-white sm:text-7xl">
            Step Into Elegance
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg font-light text-blush/90">
            Premium ladies&apos; footwear, designed for grace and crafted for comfort —
            delivered across Pakistan.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-bronze px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-bronzedark"
            >
              Shop the Collection
            </Link>
            <Link
              href="/shop?bestseller=1"
              className="rounded-full border border-white/70 px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-coco"
            >
              Bestsellers
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead eyebrow="Collections" title="Shop by Category" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href={`/shop?category=${encodeURIComponent(c.name)}`}
              className="group relative overflow-hidden rounded-2xl shadow-sm"
            >
              <div className="aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc(c.img)}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-coco/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-center">
                <p className="font-serif text-2xl text-white">{c.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-sand/90">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-blush/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead eyebrow="Handpicked" title="Featured Pieces" />
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={String(p.id)} product={p} />
            ))}
          </div>
          {featured.length === 0 && (
            <p className="text-center text-sm text-bronze/60">Loading the collection…</p>
          )}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead eyebrow="Loved by Many" title="Bestsellers" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={String(p.id)} product={p} />
          ))}
        </div>
        {bestsellers.length === 0 && (
          <p className="text-center text-sm text-bronze/60">Loading bestsellers…</p>
        )}
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-block rounded-full border border-bronze px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-bronze transition hover:bg-bronze hover:text-white"
          >
            View All Footwear
          </Link>
        </div>
      </section>

      {/* PERKS */}
      <section className="border-y border-sand bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3">
          {[
            { t: 'Free Shipping', d: 'On all orders over PKR 5,000, nationwide.' },
            { t: 'Easy Exchange', d: '7-day size exchange, no questions asked.' },
            { t: 'Cash on Delivery', d: 'Pay at your doorstep, anywhere in Pakistan.' },
          ].map((p) => (
            <div key={p.t} className="text-center">
              <p className="font-serif text-2xl text-bronze">{p.t}</p>
              <p className="mt-2 text-sm text-bronzedark/80">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead eyebrow="Testimonials" title="Worn & Adored" />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl bg-white p-8 shadow-sm">
              <Stars value={5} />
              <blockquote className="mt-4 font-serif text-lg italic leading-relaxed text-coco">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">
                {t.name} — {t.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-coco py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-bronze">Newsletter</p>
          <h2 className="mt-3 font-serif text-4xl text-blush sm:text-5xl">Join the Crowne Circle</h2>
          <p className="mt-3 text-sm text-blush/70">
            Be first to know about new arrivals and enjoy 10% off your first order.
          </p>
          <form onSubmit={subscribe} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded-full border border-bronze/40 bg-transparent px-6 py-3.5 text-sm text-blush placeholder:text-blush/40 focus:border-bronze focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-bronze px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-bronzedark disabled:opacity-60"
            >
              {submitting ? 'Joining…' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
