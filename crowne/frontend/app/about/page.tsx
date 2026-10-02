'use client';

import Link from 'next/link';
import { imgSrc } from '@/lib/api';

const VALUES = [
  {
    title: 'Crafted for Comfort',
    text: 'Every pair is built on cushioned soles and thoughtful lasts, so elegance never comes at the cost of comfort. From morning errands to midnight celebrations, Crowne carries you gracefully.',
  },
  {
    title: 'Designed in Pakistan',
    text: 'Our designs are born in Karachi — inspired by the modern Pakistani woman: poised, ambitious, and unapologetically herself. We create for her wardrobe, her weddings, her every day.',
  },
  {
    title: 'Honest Quality',
    text: 'Premium materials, careful stitching, and finishes that last season after season. We would rather make fewer pairs, better, than chase trends that fade.',
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* hero */}
      <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc('/images/hero.jpg')} alt="Crowne brand story" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-coco/60" />
        <div className="relative z-10 px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.5em] text-sand">Our Story</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-6xl text-white">The House of Crowne</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="font-serif text-2xl italic leading-relaxed text-bronzedark">
          “A crown is worn on the head — but confidence begins at the feet.”
        </p>
        <p className="mt-8 leading-relaxed text-bronzedark/90">
          Crowne began with a simple observation: the modern Pakistani woman moves through many
          worlds in a single day — the office, the dholki, the dinner, the desi wedding that runs
          till 2am. Her footwear should move with her, beautifully.
        </p>
        <p className="mt-4 leading-relaxed text-bronzedark/90">
          So we set out to craft ladies&apos; footwear that pairs runway-worthy silhouettes with
          all-day comfort: heels that don&apos;t punish, flats with polish, sandals that shine,
          and slippers that feel like a small luxury at home. Each pair is finished with care and
          delivered to doorsteps across Pakistan.
        </p>
        <div className="mx-auto mt-8 h-px w-16 bg-bronze" />
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-bronze">
          Step into elegance
        </p>
      </section>

      <section className="bg-blush/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-center font-serif text-4xl text-coco">What We Stand For</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-8 shadow-sm">
                <h3 className="font-serif text-2xl text-bronze">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-bronzedark/90">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="grid gap-8 rounded-3xl bg-coco p-10 text-center sm:grid-cols-3">
          {[
            { n: '12+', l: 'Signature styles' },
            { n: '10k+', l: 'Happy customers' },
            { n: '4.8', l: 'Average rating' },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-serif text-5xl text-sand">{s.n}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-blush/70">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/shop" className="inline-block rounded-full bg-bronze px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark">
            Shop the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
