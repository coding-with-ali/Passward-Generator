'use client';

import Link from 'next/link';
import { Reveal, Stagger, StaggerItem, motion } from '@/components/motion';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-coco text-blush">
      {/* giant wordmark */}
      <div className="pointer-events-none select-none px-6 pt-10" aria-hidden>
        <motion.p
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-b from-blush/25 to-blush/[0.03] bg-clip-text text-center font-serif text-[19vw] font-semibold leading-[0.85] tracking-[0.08em] text-transparent lg:text-[13rem]"
        >
          CROWNE
        </motion.p>
      </div>
      <Stagger className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4" gap={0.12} amount={0.15}>
        <StaggerItem>
          <p className="font-serif text-2xl font-semibold tracking-[0.3em]">CROWNE</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-bronze">Step into elegance</p>
          <p className="mt-4 text-sm leading-relaxed text-blush/70">
            Premium ladies&apos; footwear, designed for grace and crafted for comfort —
            delivered across Pakistan.
          </p>
        </StaggerItem>
        <StaggerItem>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-blush/80">
            <li><Link href="/shop" className="transition hover:text-white">All Footwear</Link></li>
            <li><Link href="/shop?category=Heels" className="transition hover:text-white">Heels</Link></li>
            <li><Link href="/shop?category=Flats" className="transition hover:text-white">Flats</Link></li>
            <li><Link href="/shop?category=Sandals" className="transition hover:text-white">Sandals</Link></li>
            <li><Link href="/shop?category=Slippers" className="transition hover:text-white">Slippers</Link></li>
          </ul>
        </StaggerItem>
        <StaggerItem>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Help</p>
          <ul className="mt-4 space-y-2 text-sm text-blush/80">
            <li><Link href="/track" className="transition hover:text-white">Track Your Order</Link></li>
            <li><Link href="/account" className="transition hover:text-white">My Account</Link></li>
            <li><Link href="/wishlist" className="transition hover:text-white">Wishlist</Link></li>
            <li><Link href="/contact" className="transition hover:text-white">Contact Us</Link></li>
            <li><Link href="/about" className="transition hover:text-white">Our Story</Link></li>
          </ul>
        </StaggerItem>
        <StaggerItem>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Care</p>
          <ul className="mt-4 space-y-2 text-sm text-blush/80">
            <li>care@crowne.pk</li>
            <li>+92 300 000 0000</li>
            <li>Mon–Sat, 10am–7pm PKT</li>
            <li className="pt-2 text-blush/60">Free shipping on orders over PKR 5,000</li>
          </ul>
        </StaggerItem>
      </Stagger>
      <div className="border-t border-blush/10">
        <Reveal y={10} className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-blush/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Crowne. All rights reserved.</p>
          <p className="uppercase tracking-[0.25em]">Step into elegance</p>
        </Reveal>
      </div>
    </footer>
  );
}
