'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth, useCart, useWishlist } from '@/lib/store-context';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/track', label: 'Track Order' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const { count, setOpen } = useCart();
  const { slugs } = useWishlist();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-[#fbf7f1]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* mobile menu button */}
        <button
          className="rounded p-2 text-bronze lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        {/* logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox="0 0 32 24" className="h-7 w-9 text-bronze" fill="currentColor" aria-hidden>
            <path d="M2 20L4 7l6 5 3-8 3 8 6-5 2 13H2zm2-2h20l-1-8-4 3.5L16 8l-3 5.5L9 10l-4 3.5L4 18z" opacity="0" />
            <path d="M3 21h26v-2.5H3V21zM5 16.5L7 6l5 4.2L16 2l4 8.2L25 6l2 10.5H5z" />
            <circle cx="7" cy="4" r="1.6" />
            <circle cx="16" cy="1.6" r="1.6" />
            <circle cx="25" cy="4" r="1.6" />
          </svg>
          <span className="font-serif text-2xl font-semibold tracking-[0.35em] text-coco">
            CROWNE
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="ml-6 hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[13px] font-medium uppercase tracking-[0.18em] text-bronzedark transition hover:text-bronze"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* search */}
          <form onSubmit={submitSearch} className="hidden items-center md:flex">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search heels, flats..."
                className="w-44 rounded-full border border-sand bg-white py-1.5 pl-4 pr-9 text-sm text-coco placeholder:text-bronze/50 focus:border-bronze focus:outline-none lg:w-52"
              />
              <button type="submit" aria-label="Search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bronze">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16.5 16.5L21 21" />
                </svg>
              </button>
            </div>
          </form>

          {/* wishlist */}
          <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-full p-2 text-bronze transition hover:bg-blush">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7.5-4.9-10-9.3C.4 8.6 2.3 4.9 6 4.9c2.2 0 3.6 1.2 4.4 2.4L12 9l1.6-1.7C14.4 6.1 15.8 4.9 18 4.9c3.7 0 5.6 3.7 4 6.8C19.5 16.1 12 21 12 21z" />
            </svg>
            {slugs.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-bronze text-[10px] font-semibold text-white">
                {slugs.length}
              </span>
            )}
          </Link>

          {/* account */}
          <Link href="/account" aria-label="Account" className="rounded-full p-2 text-bronze transition hover:bg-blush">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
            </svg>
          </Link>

          {/* cart */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Shopping bag"
            className="relative rounded-full p-2 text-bronze transition hover:bg-blush"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8h15l-1.5 9.5a1 1 0 01-1 .5H8.7a1 1 0 01-1-.8L5 4.5A1 1 0 004 3.7H2" />
              <circle cx="10" cy="21" r="1.4" />
              <circle cx="17" cy="21" r="1.4" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-bronze text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* mobile nav */}
      {menuOpen && (
        <div className="border-t border-sand bg-[#fbf7f1] px-6 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-4 md:hidden">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border border-sand bg-white px-4 py-2 text-sm focus:border-bronze focus:outline-none"
            />
          </form>
          <nav className="flex flex-col gap-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium uppercase tracking-[0.18em] text-bronzedark"
              >
                {n.label}
              </Link>
            ))}
            {user?.is_admin && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm font-medium uppercase tracking-[0.18em] text-bronze">
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
