'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, imgSrc, normProducts } from '@/lib/api';
import { useToast } from '@/lib/store-context';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Stars from '@/components/Stars';
import { CountUp, EASE, Magnetic, Marquee, Parallax, Reveal, SplitWords, Stagger, StaggerItem, motion } from '@/components/motion';

const CATEGORIES = [
  { n: '01', name: 'Heels', img: '/images/product-1.jpg', blurb: 'Command every room' },
  { n: '02', name: 'Flats', img: '/images/product-4.jpg', blurb: 'Grace in every step' },
  { n: '03', name: 'Sandals', img: '/images/product-7.jpg', blurb: 'Sunlit elegance' },
  { n: '04', name: 'Slippers', img: '/images/product-10.jpg', blurb: 'Effortless comfort' },
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

/** Editorial section heading: index number + huge serif title, left aligned. */
function EditorialHead({
  index,
  eyebrow,
  title,
  dark = false,
  action,
}: {
  index: string;
  eyebrow: string;
  title: string;
  dark?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <Reveal>
        <p className={`flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] ${dark ? 'text-bronze' : 'text-bronze'}`}>
          <span className="font-serif text-base italic tracking-normal text-bronze/70">{index}</span>
          <span className={`h-px w-10 ${dark ? 'bg-bronze/60' : 'bg-bronze/50'}`} />
          {eyebrow}
        </p>
        <h2 className={`mt-4 max-w-2xl font-serif text-5xl leading-[1.05] sm:text-6xl ${dark ? 'text-blush' : 'text-coco'}`}>
          {title}
        </h2>
      </Reveal>
      {action && <Reveal delay={0.15}>{action}</Reveal>}
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
      {/* ============ HERO — dark luxe, arch portrait, floating cards ============ */}
      <section className="relative overflow-hidden bg-noir">
        {/* ambient gradient wash */}
        <div className="absolute inset-0 bg-[radial-gradient(1100px_600px_at_85%_-10%,#3a1f2e_0%,transparent_60%),radial-gradient(900px_500px_at_-10%_110%,#2c1a26_0%,transparent_55%)]" />
        {/* drifting orbs */}
        <div aria-hidden className="animate-drift absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-rose/25 blur-[110px]" />
        <div aria-hidden className="animate-drift absolute right-[8%] top-[8%] h-72 w-72 rounded-full bg-gold/20 blur-[110px] [animation-delay:4s]" />
        <div aria-hidden className="animate-drift absolute bottom-[-10%] left-[35%] h-96 w-96 rounded-full bg-plum/60 blur-[130px] [animation-delay:8s]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-28 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-28">
          {/* copy */}
          <div>
            <motion.p
              className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.45em] text-gold"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            >
              <span className="inline-block h-px w-12 bg-gold" />
              FW26 · The Regal Edit
            </motion.p>

            <div className="mt-6">
              <SplitWords
                text="Step into"
                as="h1"
                delay={0.4}
                wordDelay={0.1}
                className="block font-serif text-[19vw] font-medium leading-[0.95] text-ivory sm:text-8xl lg:text-[6.8rem]"
              />
              <SplitWords
                text="pure elegance."
                as="span"
                delay={0.7}
                wordDelay={0.1}
                className="text-luxe-gradient block font-serif text-[19vw] font-medium italic leading-[0.95] sm:text-8xl lg:text-[6.8rem]"
              />
            </div>

            <motion.p
              className="mt-7 max-w-md text-base font-light leading-relaxed text-ivory/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
            >
              Heels, flats & sandals hand-finished for queens — delivered to your
              doorstep, anywhere in Pakistan.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.25, ease: EASE }}
            >
              <Magnetic>
                <Link
                  href="/shop"
                  className="btn-shimmer group inline-flex items-center gap-3 rounded-full bg-rose px-9 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_18px_40px_-14px_rgba(225,77,111,0.7)] transition-colors hover:bg-rosedeep"
                >
                  Shop the Collection
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/shop?bestseller=1"
                  className="inline-flex items-center gap-3 rounded-full border border-gold/60 px-9 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-goldlight transition hover:bg-gold hover:text-noir"
                >
                  Bestsellers
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div
              className="mt-12 flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] text-ivory/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
            >
              <span className="flex items-center gap-2">
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-rose"
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                14 signature pieces
              </span>
              <span className="hidden sm:inline">Cash on Delivery</span>
              <span className="hidden md:inline">4.9 ★ loved by 2,000+ women</span>
            </motion.div>
          </div>

          {/* arch portrait + floating cards */}
          <motion.div
            className="relative mx-auto w-full max-w-[420px]"
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
          >
            <div className="overflow-hidden rounded-b-[2rem] rounded-t-[999px] shadow-[0_40px_90px_-30px_rgba(225,77,111,0.45)] ring-1 ring-gold/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc('/images/hero.jpg')}
                alt="Crowne — Step Into Elegance"
                className="animate-slow-zoom aspect-[3/4] w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-b-[2rem] rounded-t-[999px] bg-gradient-to-t from-noir/35 via-transparent to-transparent" />

            {/* floating rating card */}
            <motion.div
              className="animate-float absolute -left-6 top-16 rounded-2xl bg-ivory/95 px-5 py-4 shadow-2xl backdrop-blur sm:-left-12"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.7, ease: EASE }}
            >
              <p className="font-serif text-3xl text-noir">4.9<span className="text-xl text-gold"> ★</span></p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-noir/60">2,000+ reviews</p>
            </motion.div>

            {/* floating bestseller mini card */}
            <motion.div
              className="animate-float absolute -right-4 bottom-24 flex items-center gap-3 rounded-2xl bg-ivory/95 py-3 pl-3 pr-5 shadow-2xl backdrop-blur [animation-delay:2.2s] sm:-right-10"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.7, ease: EASE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc('/images/product-1.jpg')} alt="Aurelia Block Heels" className="h-14 w-12 rounded-xl object-cover" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose">Bestseller</p>
                <p className="font-serif text-base leading-tight text-noir">Aurelia Heels</p>
              </div>
            </motion.div>

            {/* new drop pill */}
            <motion.div
              className="absolute -top-4 right-8 rounded-full bg-gradient-to-r from-rose to-rosedeep px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white shadow-xl"
              initial={{ opacity: 0, y: -16, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ delay: 1.7, duration: 0.6, ease: EASE }}
            >
              ✦ New Drop
            </motion.div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="flex h-12 w-7 items-start justify-center rounded-full border border-ivory/40 p-1.5"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-2 w-1 rounded-full bg-gold" />
          </motion.div>
        </motion.div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="overflow-hidden border-y border-gold/30 bg-gradient-to-r from-rosedeep via-rose to-rosedeep py-4">
        <Marquee>
          {MARQUEE_ITEMS.map((m) => (
            <span key={m} className="mx-7 flex items-center gap-7 whitespace-nowrap">
              <span className="font-serif text-lg italic text-ivory">{m}</span>
              <CrownMark className="h-3.5 w-4 text-goldlight" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* ============ 01 COLLECTIONS — asymmetric editorial grid ============ */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
        <EditorialHead
          index="01"
          eyebrow="The Collections"
          title="Find your signature stride."
          action={
            <Link href="/shop" className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-bronze">
              View all
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
          }
        />
        <Stagger className="border-t border-coco/15" gap={0.06}>
          {CATEGORIES.map((c) => (
            <StaggerItem key={c.name}>
              <Link
                href={`/shop?category=${encodeURIComponent(c.name)}`}
                className="group relative flex items-center gap-5 overflow-hidden border-b border-coco/15 py-6 sm:gap-10 sm:py-8"
              >
                {/* hover wash */}
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-blush/80 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                <span className="relative w-10 shrink-0 font-serif text-xl italic text-bronze/60">{c.n}</span>
                <div className="relative min-w-0 flex-1">
                  <p className="truncate font-serif text-4xl text-coco transition-all duration-500 group-hover:translate-x-2 group-hover:text-bronze sm:text-6xl">
                    {c.name}
                  </p>
                  <p className="mt-1.5 text-[11px] uppercase tracking-[0.28em] text-bronze/75">{c.blurb}</p>
                </div>
                <div className="relative hidden h-24 w-20 shrink-0 overflow-hidden rounded-2xl shadow-md sm:block sm:h-28 sm:w-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc(c.img)}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-3 group-hover:scale-110"
                  />
                </div>
                <motion.span
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-bronze/40 text-xl text-bronze transition-all duration-400 group-hover:border-bronze group-hover:bg-bronze group-hover:text-white"
                  whileHover={{ rotate: -45 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  →
                </motion.span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============ FW26 DROP BANNER ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose via-rosedeep to-plum" />
        <div aria-hidden className="animate-drift absolute -left-16 top-0 h-64 w-64 rounded-full bg-goldlight/30 blur-[100px]" />
        <div aria-hidden className="animate-drift absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-noir/40 blur-[100px] [animation-delay:5s]" />
        {/* floating sparkles */}
        {['✦', '✧', '✦'].map((s, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="animate-float absolute text-goldlight/70"
            style={{ left: `${12 + i * 33}%`, top: `${18 + (i % 2) * 52}%`, fontSize: `${20 + i * 8}px`, animationDelay: `${i * 1.8}s` }}
          >
            {s}
          </motion.span>
        ))}
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-20 text-center sm:py-24 lg:flex-row lg:justify-between lg:text-left">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-goldlight">Limited Time</p>
            <h2 className="mt-3 font-serif text-5xl leading-[1.02] text-white sm:text-7xl">
              The FW26 Drop
              <br />
              <span className="italic">is here.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] font-light leading-relaxed text-white/85">
              Six new silhouettes, hand-finished in blush rose and champagne gold.
              When they're gone, they're gone.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="shrink-0">
            <Magnetic strength={0.35}>
              <Link
                href="/shop"
                className="btn-shimmer group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-xs font-semibold uppercase tracking-[0.3em] text-rosedeep shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.03]"
              >
                Shop the Drop
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      {/* ============ EDITORIAL PARALLAX BANNER ============ */}
      <section className="relative flex min-h-[68vh] items-center justify-center overflow-hidden">
        <Parallax className="absolute inset-0" speed={0.35}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc('/images/product-5.jpg')} alt="Crowne craft" className="h-full w-full object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-coco/60" />
        <Reveal className="relative z-10 max-w-4xl px-6 text-center">
          <CrownMark className="mx-auto h-8 w-10 text-bronze" />
          <p className="mt-6 font-serif text-4xl italic leading-snug text-white sm:text-6xl">
            “Grace in every step,
            <br />
            royalty in every pair.”
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.4em] text-sand/80">The Crowne Philosophy</p>
        </Reveal>
      </section>

      {/* ============ 02 FEATURED ============ */}
      <section className="bg-blush/50 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <EditorialHead
            index="02"
            eyebrow="Handpicked for you"
            title="This week's coveted pieces."
            action={
              <Link href="/shop" className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-bronze">
                Shop all
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </Link>
            }
          />
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

      {/* ============ 03 BESTSELLERS — dark luxe ============ */}
      <section className="relative overflow-hidden bg-coco py-24 sm:py-28">
        <motion.div aria-hidden className="animate-float absolute -right-24 top-16 h-72 w-72 rounded-full bg-bronze/15 blur-3xl" />
        <motion.div aria-hidden className="animate-float absolute -left-24 bottom-16 h-72 w-72 rounded-full bg-sand/10 blur-3xl [animation-delay:2.5s]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <EditorialHead
            index="03"
            eyebrow="Loved by thousands"
            title="The most coveted pairs."
            dark
            action={
              <Link href="/shop?bestseller=1" className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-sand">
                All bestsellers
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </Link>
            }
          />
          <Stagger className="grid grid-cols-2 gap-5 lg:grid-cols-4" gap={0.1}>
            {bestsellers.map((p) => (
              <StaggerItem key={String(p.id)}>
                <ProductCard product={p} dark />
              </StaggerItem>
            ))}
          </Stagger>
          {bestsellers.length === 0 && (
            <p className="text-center text-sm text-sand/60">Loading bestsellers…</p>
          )}
        </div>
      </section>

      {/* ============ STATS BAND ============ */}
      <section className="relative overflow-hidden border-y border-gold/20 bg-gradient-to-r from-noir via-plum to-noir py-16">
        <Stagger className="relative mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 text-center lg:grid-cols-4" gap={0.12}>
          {[
            { v: 2000, suffix: '+', label: 'Happy Customers' },
            { v: 4.9, decimals: 1, label: 'Average Rating' },
            { v: 50, suffix: '+', label: 'Cities Served' },
            { v: 14, label: 'Signature Pieces' },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <p className="font-serif text-5xl text-ivory sm:text-6xl">
                <CountUp to={s.v} suffix={s.suffix ?? ''} decimals={s.decimals ?? 0} />
              </p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.3em] text-gold">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============ 04 CRAFT — split editorial ============ */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <motion.div
              className="overflow-hidden rounded-[2rem]"
              whileHover={{ scale: 0.985 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc('/images/product-3.jpg')} alt="Hand-finished Crowne footwear" loading="lazy" className="aspect-[4/5] w-full object-cover" />
            </motion.div>
            <motion.div
              className="absolute -bottom-6 -right-4 rounded-2xl bg-coco px-7 py-5 shadow-xl sm:-right-8"
              initial={{ opacity: 0, y: 24, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: -2 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            >
              <p className="font-serif text-4xl text-sand">4.9<span className="text-xl text-bronze"> ★</span></p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-blush/70">2,000+ happy customers</p>
            </motion.div>
          </Reveal>
          <div>
            <Reveal>
              <p className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-bronze">
                <span className="font-serif text-base italic tracking-normal text-bronze/70">04</span>
                <span className="h-px w-10 bg-bronze/50" />
                The Craft
              </p>
              <h2 className="mt-4 font-serif text-5xl leading-[1.05] text-coco sm:text-6xl">
                Hand-finished,
                <br />
                <span className="italic text-bronze">made for royalty.</span>
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-bronzedark/90">
                Every Crowne pair begins as a sketch and ends in the hands of master
                craftsmen — cushioned insoles, balanced heels, and detailing that
                catches the light with every step.
              </p>
            </Reveal>
            <Stagger className="mt-8 space-y-4" gap={0.1}>
              {['Cloud-soft cushioned insoles', 'Balanced, all-evening heels', 'Premium vegan leather finishes'].map((f) => (
                <StaggerItem key={f} className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-bronze">✓</span>
                  <span className="text-[15px] text-coco">{f}</span>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.2} className="mt-9">
              <Magnetic>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-3 rounded-full border border-bronze px-9 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-bronze transition hover:bg-bronze hover:text-white"
                >
                  Our Story
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Link>
              </Magnetic>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 05 TESTIMONIALS ============ */}
      <section className="border-y border-sand bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <EditorialHead index="05" eyebrow="Testimonials" title="Worn, adored, reordered." />
          <Stagger className="grid gap-6 md:grid-cols-3" gap={0.14}>
            {TESTIMONIALS.map((t, i) => (
              <StaggerItem key={t.name}>
                <motion.figure
                  className="relative h-full overflow-hidden rounded-[1.75rem] bg-blush/50 p-9"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <span className="pointer-events-none absolute -top-3 right-5 font-serif text-[7rem] leading-none text-bronze/15">”</span>
                  <span className="font-serif text-base italic text-bronze/60">0{i + 1}</span>
                  <Stars value={5} />
                  <blockquote className="mt-4 font-serif text-xl italic leading-relaxed text-coco">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">
                    {t.name} <span className="text-bronze/50">— {t.city}</span>
                  </figcaption>
                </motion.figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="relative overflow-hidden bg-coco py-24 sm:py-28">
        <motion.div aria-hidden className="animate-float absolute -left-20 top-10 h-64 w-64 rounded-full bg-bronze/15 blur-3xl" />
        <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-bronze">The Inner Circle</p>
          <h2 className="mt-4 font-serif text-5xl leading-tight text-blush sm:text-6xl">
            Get <span className="italic text-sand">10% off</span> your first order.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-blush/70">
            Join the Crowne Circle for early access to new drops, private sales
            and styling notes. No spam — only elegance.
          </p>
          <form onSubmit={subscribe} className="mx-auto mt-9 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded-full border border-bronze/40 bg-white/5 px-7 py-4 text-sm text-blush placeholder:text-blush/40 focus:border-bronze focus:outline-none"
            />
            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.96 }}
              className="btn-shimmer rounded-full bg-bronze px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-bronzedark disabled:opacity-60"
            >
              {submitting ? 'Joining…' : 'Subscribe'}
            </motion.button>
          </form>
        </Reveal>
      </section>
    </div>
  );
}
