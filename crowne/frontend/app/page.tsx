'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, imgSrc, normProducts } from '@/lib/api';
import { useToast } from '@/lib/store-context';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Stars from '@/components/Stars';
import { EASE, Magnetic, Marquee, Parallax, Reveal, SplitWords, Stagger, StaggerItem, motion } from '@/components/motion';

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

const MARQUEE_ITEMS = [
  'Free shipping over PKR 5,000',
  'Cash on Delivery',
  '7-day easy exchange',
  'Hand-finished in Pakistan',
  'New drops every Friday',
];

function CrownMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 21h26v-2.5H3V21zM5 16.5L7 6l5 4.2L16 2l4 8.2L25 6l2 10.5H5z" />
      <circle cx="7" cy="4" r="1.6" />
      <circle cx="16" cy="1.6" r="1.6" />
      <circle cx="25" cy="4" r="1.6" />
    </svg>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal className="mb-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-bronze">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl text-coco sm:text-5xl">{title}</h2>
      <motion.div
        className="mx-auto mt-5 h-px w-16 bg-bronze"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
      />
    </Reveal>
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
      {/* HERO — parallax + cinematic entrance */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
        <Parallax className="absolute inset-0" speed={0.28}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc('/images/hero.jpg')}
            alt="Crowne — Step Into Elegance"
            className="animate-slow-zoom h-full w-full object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-b from-coco/60 via-coco/25 to-coco/60" />

        {/* floating shimmer accents */}
        <motion.div
          aria-hidden
          className="animate-float absolute left-[12%] top-[22%] h-24 w-24 rounded-full bg-bronze/20 blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.5 }}
        />
        <motion.div
          aria-hidden
          className="animate-float absolute bottom-[20%] right-[10%] h-32 w-32 rounded-full bg-sand/20 blur-3xl [animation-delay:2s]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1.5 }}
        />

        <div className="relative z-10 px-6 text-center">
          <motion.p
            className="text-xs font-medium uppercase tracking-[0.5em] text-sand"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
          >
            Crowne Footwear
          </motion.p>
          <SplitWords
            text="Step Into Elegance"
            as="h1"
            delay={0.5}
            className="mx-auto mt-4 block max-w-3xl font-serif text-6xl font-medium leading-tight text-white sm:text-7xl"
          />
          <motion.p
            className="mx-auto mt-5 max-w-xl text-lg font-light text-blush/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05, ease: EASE }}
          >
            Premium ladies&apos; footwear, designed for grace and crafted for comfort —
            delivered across Pakistan.
          </motion.p>
          <motion.div
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.25, ease: EASE }}
          >
            <Magnetic>
              <Link
                href="/shop"
                className="btn-shimmer inline-block rounded-full bg-bronze px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-bronzedark"
              >
                Shop the Collection
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/shop?bestseller=1"
                className="inline-block rounded-full border border-white/70 px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-coco"
              >
                Bestsellers
              </Link>
            </Magnetic>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <motion.div
            className="flex h-12 w-7 items-start justify-center rounded-full border border-white/50 p-1.5"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-2 w-1 rounded-full bg-white/80" />
          </motion.div>
        </motion.div>
      </section>

      {/* MARQUEE RIBBON */}
      <div className="overflow-hidden border-y border-bronze/20 bg-coco py-3.5">
        <Marquee>
          {MARQUEE_ITEMS.map((m) => (
            <span key={m} className="mx-6 flex items-center gap-6 whitespace-nowrap">
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-sand">{m}</span>
              <CrownMark className="h-3.5 w-4 text-bronze" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* CATEGORY COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow="Collections" title="Shop by Category" />
        <Stagger className="grid grid-cols-2 gap-5 lg:grid-cols-4" gap={0.12}>
          {CATEGORIES.map((c) => (
            <StaggerItem key={c.name}>
              <Link
                href={`/shop?category=${encodeURIComponent(c.name)}`}
                className="group relative block overflow-hidden rounded-2xl shadow-sm"
              >
                <motion.div
                  className="aspect-[3/4]"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc(c.img)}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-coco/75 via-transparent to-transparent transition-opacity duration-500 group-hover:from-coco/85" />
                <div className="absolute inset-x-0 bottom-0 translate-y-1 p-5 text-center transition-transform duration-500 group-hover:translate-y-0">
                  <p className="font-serif text-2xl text-white">{c.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-sand/90">{c.blurb}</p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/0 transition-all duration-500 group-hover:text-white/90">
                    Explore →
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* FEATURED */}
      <section className="bg-blush/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead eyebrow="Handpicked" title="Featured Pieces" />
          <Stagger className="grid grid-cols-2 gap-5 lg:grid-cols-4" gap={0.1}>
            {featured.map((p) => (
              <StaggerItem key={String(p.id)}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
          {featured.length === 0 && (
            <p className="text-center text-sm text-bronze/60">Loading the collection…</p>
          )}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow="Loved by Many" title="Bestsellers" />
        <Stagger className="grid grid-cols-2 gap-5 lg:grid-cols-4" gap={0.1}>
          {bestsellers.map((p) => (
            <StaggerItem key={String(p.id)}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>
        {bestsellers.length === 0 && (
          <p className="text-center text-sm text-bronze/60">Loading bestsellers…</p>
        )}
        <Reveal className="mt-12 text-center" y={20}>
          <Magnetic>
            <Link
              href="/shop"
              className="inline-block rounded-full border border-bronze px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-bronze transition hover:bg-bronze hover:text-white"
            >
              View All Footwear
            </Link>
          </Magnetic>
        </Reveal>
      </section>

      {/* PERKS */}
      <section className="border-y border-sand bg-white">
        <Stagger className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:grid-cols-3" gap={0.15}>
          {[
            { t: 'Free Shipping', d: 'On all orders over PKR 5,000, nationwide.' },
            { t: 'Easy Exchange', d: '7-day size exchange, no questions asked.' },
            { t: 'Cash on Delivery', d: 'Pay at your doorstep, anywhere in Pakistan.' },
          ].map((p) => (
            <StaggerItem key={p.t} className="text-center">
              <p className="font-serif text-2xl text-bronze">{p.t}</p>
              <p className="mt-2 text-sm text-bronzedark/80">{p.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead eyebrow="Testimonials" title="Worn & Adored" />
        <Stagger className="grid gap-6 md:grid-cols-3" gap={0.14}>
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <motion.figure
                className="h-full rounded-2xl bg-white p-8 shadow-sm"
                whileHover={{ y: -6, boxShadow: '0 20px 40px -18px rgba(138,109,59,0.35)' }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Stars value={5} />
                <blockquote className="mt-4 font-serif text-lg italic leading-relaxed text-coco">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">
                  {t.name} — {t.city}
                </figcaption>
              </motion.figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* NEWSLETTER */}
      <section className="relative overflow-hidden bg-coco py-24">
        <motion.div
          aria-hidden
          className="animate-float absolute -left-16 top-10 h-56 w-56 rounded-full bg-bronze/15 blur-3xl"
        />
        <motion.div
          aria-hidden
          className="animate-float absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-sand/10 blur-3xl [animation-delay:3s]"
        />
        <Reveal className="relative mx-auto max-w-2xl px-6 text-center">
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
            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.96 }}
              className="btn-shimmer rounded-full bg-bronze px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-bronzedark disabled:opacity-60"
            >
              {submitting ? 'Joining…' : 'Subscribe'}
            </motion.button>
          </form>
        </Reveal>
      </section>
    </div>
  );
}
