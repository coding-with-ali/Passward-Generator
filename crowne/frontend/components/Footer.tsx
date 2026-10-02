'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 bg-coco text-blush">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl font-semibold tracking-[0.3em]">CROWNE</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-bronze">Step into elegance</p>
          <p className="mt-4 text-sm leading-relaxed text-blush/70">
            Premium ladies&apos; footwear, designed for grace and crafted for comfort —
            delivered across Pakistan.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-blush/80">
            <li><Link href="/shop" className="hover:text-white">All Footwear</Link></li>
            <li><Link href="/shop?category=Heels" className="hover:text-white">Heels</Link></li>
            <li><Link href="/shop?category=Flats" className="hover:text-white">Flats</Link></li>
            <li><Link href="/shop?category=Sandals" className="hover:text-white">Sandals</Link></li>
            <li><Link href="/shop?category=Slippers" className="hover:text-white">Slippers</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Help</p>
          <ul className="mt-4 space-y-2 text-sm text-blush/80">
            <li><Link href="/track" className="hover:text-white">Track Your Order</Link></li>
            <li><Link href="/account" className="hover:text-white">My Account</Link></li>
            <li><Link href="/wishlist" className="hover:text-white">Wishlist</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/about" className="hover:text-white">Our Story</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Care</p>
          <ul className="mt-4 space-y-2 text-sm text-blush/80">
            <li>care@crowne.pk</li>
            <li>+92 300 000 0000</li>
            <li>Mon–Sat, 10am–7pm PKT</li>
            <li className="pt-2 text-blush/60">Free shipping on orders over PKR 5,000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blush/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-blush/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Crowne. All rights reserved.</p>
          <p className="uppercase tracking-[0.25em]">Step into elegance</p>
        </div>
      </div>
    </footer>
  );
}
