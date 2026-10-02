'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, normProducts } from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

const SORTS = [
  { v: '', label: 'Sort: Recommended' },
  { v: 'price-asc', label: 'Price: Low to High' },
  { v: 'price-desc', label: 'Price: High to Low' },
  { v: 'name', label: 'Name: A to Z' },
  { v: 'rating', label: 'Top Rated' },
  { v: 'newest', label: 'Newest' },
];

function ShopInner() {
  const sp = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [cats, setCats] = useState<string[]>(() =>
    sp.get('category') ? [sp.get('category') as string] : []
  );
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [sort, setSort] = useState(sp.get('sort') ?? '');
  const [mobileFilters, setMobileFilters] = useState(false);

  // sync when navigated via header search
  useEffect(() => {
    setQ(sp.get('q') ?? '');
    const c = sp.get('category');
    if (c) setCats([c]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  useEffect(() => {
    api<string[]>('/api/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (cats.length === 1) params.set('category', cats[0]);
    else if (cats.length > 1) params.set('category', cats.join(',')); // fallback; backend uses single
    if (min) params.set('min', min);
    if (max) params.set('max', max);
    if (sort) params.set('sort', sort);
    if (sp.get('bestseller') === '1') params.set('bestseller', '1');

    api<unknown>(`/api/products?${params.toString()}`)
      .then((d) => {
        let list = normProducts(d);
        if (cats.length > 1) list = list.filter((p) => cats.includes(p.category));
        if (onSale) list = list.filter((p) => p.old_price != null && p.old_price > p.price);
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, cats, min, max, sort, onSale, sp]);

  const toggleCat = (c: string) =>
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const activeFilterCount = useMemo(
    () => cats.length + (onSale ? 1 : 0) + (min ? 1 : 0) + (max ? 1 : 0),
    [cats, onSale, min, max]
  );

  const filters = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Category</h3>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-3 text-sm text-bronzedark">
              <input
                type="checkbox"
                checked={cats.includes(c)}
                onChange={() => toggleCat(c)}
                className="h-4 w-4 accent-[#8a6d3b]"
              />
              {c}
            </label>
          ))}
          {categories.length === 0 && <p className="text-xs text-bronze/60">Loading…</p>}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">Price (PKR)</h3>
        <div className="flex items-center gap-2">
          <input
            value={min}
            onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))}
            placeholder="Min"
            inputMode="numeric"
            className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm focus:border-bronze focus:outline-none"
          />
          <span className="text-bronze">–</span>
          <input
            value={max}
            onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))}
            placeholder="Max"
            inputMode="numeric"
            className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm focus:border-bronze focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-bronzedark">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            className="h-4 w-4 accent-[#8a6d3b]"
          />
          On sale only
        </label>
      </div>
      <button
        onClick={() => { setCats([]); setMin(''); setMax(''); setOnSale(false); setQ(''); setSort(''); }}
        className="text-xs font-semibold uppercase tracking-[0.2em] text-bronze underline-offset-4 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-bronze">The Collection</p>
        <h1 className="mt-2 font-serif text-5xl text-coco">Shop Crowne</h1>
      </div>

      {/* toolbar */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the collection…"
          className="flex-1 rounded-full border border-sand bg-white px-5 py-2.5 text-sm focus:border-bronze focus:outline-none"
        />
        <div className="flex gap-3">
          <button
            onClick={() => setMobileFilters((v) => !v)}
            className="rounded-full border border-sand bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-bronze lg:hidden"
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-sand bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-bronze focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.v} value={s.v}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {mobileFilters && <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm lg:hidden">{filters}</div>}

      <div className="flex gap-10">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">{filters}</div>
        </aside>
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white p-4">
                  <div className="aspect-[4/5] rounded-xl bg-blush" />
                  <div className="mx-auto mt-4 h-4 w-2/3 rounded bg-blush" />
                  <div className="mx-auto mt-2 h-4 w-1/3 rounded bg-blush" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
              <p className="font-serif text-3xl text-bronze">No pieces found</p>
              <p className="mt-2 text-sm text-bronzedark/70">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-bronze/70">
                {products.length} {products.length === 1 ? 'piece' : 'pieces'}
              </p>
              <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={String(p.id)} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-20 text-center font-serif text-2xl text-bronze">Loading the boutique…</div>}>
      <ShopInner />
    </Suspense>
  );
}
