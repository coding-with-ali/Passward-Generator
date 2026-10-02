'use client';

import { useEffect, useState } from 'react';
import { useAuth, useToast } from '@/lib/store-context';
import { api, formatPKR, imgSrc, normProducts } from '@/lib/api';
import type { AdminStats, Coupon, Customer, Order, Product, Subscriber } from '@/lib/types';

const inputCls =
  'w-full rounded-xl border border-sand bg-white px-4 py-2.5 text-sm text-coco placeholder:text-bronze/40 focus:border-bronze focus:outline-none';

const TABS = ['Dashboard', 'Products', 'Orders', 'Coupons', 'Customers', 'Subscribers'] as const;
type Tab = (typeof TABS)[number];

/* ================= gate ================= */

function AdminLogin() {
  const { login, logout } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email.trim(), password);
      if (!u.is_admin) {
        logout();
        throw new Error('This account does not have admin access.');
      }
      toast('Welcome to the admin panel.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Login failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
        <p className="font-serif text-2xl tracking-[0.3em] text-coco">CROWNE</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.35em] text-bronze">Admin Panel</p>
        <form onSubmit={submit} className="mt-8 space-y-4 text-left">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Admin email" className={inputCls} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" className={inputCls} />
          <button disabled={busy} className="w-full rounded-full bg-coco py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-blush hover:bg-bronzedark disabled:opacity-60">
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= dashboard ================= */

function DashboardTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api<AdminStats>('/api/admin/stats').then(setStats).catch(() => {});
  }, []);

  if (!stats) return <p className="py-10 text-center text-sm text-bronze/60">Loading dashboard…</p>;

  // build 14-day series
  const days: { label: string; v: number }[] = [];
  const byDayMap = new Map((stats.byDay || []).map((d) => [d.d, d.v]));
  for (let i = 13; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    days.push({
      label: dt.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }),
      v: Number(byDayMap.get(key) ?? 0),
    });
  }
  const maxV = Math.max(1, ...days.map((d) => d.v));

  const cards = [
    { label: 'Total Revenue', value: formatPKR(stats.revenue) },
    { label: 'Orders', value: String(stats.orders) },
    { label: 'Products', value: String(stats.products) },
    { label: 'Customers', value: String(stats.customers) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-bronze">{c.label}</p>
            <p className="mt-2 font-serif text-4xl text-coco">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-serif text-2xl text-coco">Revenue — Last 14 Days</h3>
        <div className="flex h-44 items-end gap-1.5">
          {days.map((d, i) => (
            <div key={i} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.label}: ${formatPKR(d.v)}`}>
              <div
                className="w-full rounded-t bg-bronze/80 transition group-hover:bg-bronze"
                style={{ height: `${Math.max(3, (d.v / maxV) * 100)}%` }}
              />
              {i % 2 === 0 && <p className="mt-1 truncate text-center text-[9px] text-bronze/70">{d.label}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-serif text-2xl text-coco">Low Stock</h3>
          {(stats.lowStock || []).length === 0 && <p className="text-sm text-bronze/60">All stocked up.</p>}
          <ul className="space-y-3">
            {(stats.lowStock || []).map((p) => (
              <li key={String(p.id)} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc(p.image)} alt={p.name} className="h-10 w-9 rounded object-cover" />
                <p className="flex-1 text-sm text-coco">{p.name}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.stock <= 0 ? 'bg-red-100 text-red-800' : 'bg-blush text-bronzedark'}`}>
                  {p.stock} left
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-serif text-2xl text-coco">Recent Orders</h3>
          <ul className="space-y-3">
            {(stats.recent || []).map((o) => (
              <li key={o.order_number} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-coco">{o.order_number}</p>
                  <p className="text-xs text-bronze/70">{o.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-coco">{formatPKR(o.total)}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-bronze">{o.status}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-serif text-2xl text-coco">Orders by Status</h3>
        <div className="flex flex-wrap gap-3">
          {(stats.byStatus || []).map((s) => (
            <span key={s.status} className="rounded-full bg-blush px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-bronzedark">
              {s.status}: {s.c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= products ================= */

interface ProductFormState {
  name: string;
  category: string;
  price: string;
  old_price: string;
  stock: string;
  description: string;
  colors: string;
  sizes: string;
  featured: boolean;
  bestseller: boolean;
  image_url: string;
}

const EMPTY_FORM: ProductFormState = {
  name: '', category: 'Heels', price: '', old_price: '', stock: '20',
  description: '', colors: '', sizes: '36,37,38,39,40,41,42',
  featured: false, bestseller: false, image_url: '',
};

function ProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<ProductFormState>(
    product
      ? {
          name: product.name,
          category: product.category,
          price: String(product.price),
          old_price: product.old_price ? String(product.old_price) : '',
          stock: String(product.stock),
          description: product.description ?? '',
          colors: (product.colors || []).join(', '),
          sizes: (product.sizes || []).join(','),
          featured: product.featured,
          bestseller: product.bestseller,
          image_url: product.image.startsWith('/images/') ? '' : product.image,
        }
      : EMPTY_FORM
  );
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ProductFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const v = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set('name', form.name);
      fd.set('category', form.category);
      fd.set('price', form.price);
      fd.set('old_price', form.old_price || '0');
      fd.set('stock', form.stock || '0');
      fd.set('description', form.description);
      fd.set('colors', form.colors);
      fd.set('sizes', form.sizes);
      fd.set('featured', form.featured ? '1' : '0');
      fd.set('bestseller', form.bestseller ? '1' : '0');
      if (file) fd.set('image', file);
      else if (form.image_url) fd.set('image_url', form.image_url);

      if (product) {
        await api(`/api/admin/products/${product.id}`, { method: 'PUT', body: fd });
        toast('Product updated.', 'success');
      } else {
        await api('/api/admin/products', { method: 'POST', body: fd });
        toast('Product added.', 'success');
      }
      onSaved();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-coco/50" onClick={onClose} />
      <form onSubmit={submit} className="nice-scroll relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#fbf7f1] p-8 shadow-2xl">
        <h3 className="font-serif text-3xl text-coco">{product ? 'Edit Product' : 'Add Product'}</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Name *</label>
            <input value={form.name} onChange={set('name')} required className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Category *</label>
            <select value={form.category} onChange={set('category')} className={inputCls}>
              {['Heels', 'Flats', 'Sandals', 'Slippers'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Stock</label>
            <input value={form.stock} onChange={set('stock')} inputMode="numeric" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Price (PKR) *</label>
            <input value={form.price} onChange={set('price')} required inputMode="numeric" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Old Price (PKR, optional)</label>
            <input value={form.old_price} onChange={set('old_price')} inputMode="numeric" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Colors (comma-separated)</label>
            <input value={form.colors} onChange={set('colors')} placeholder="Nude, Black, Gold" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Sizes (comma-separated)</label>
            <input value={form.sizes} onChange={set('sizes')} placeholder="36,37,38,39,40,41,42" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-bronzedark file:mr-4 file:rounded-full file:border-0 file:bg-bronze file:px-5 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-white"
            />
            {!file && (
              <input value={form.image_url} onChange={set('image_url')} placeholder="…or paste an image URL" className={`${inputCls} mt-2`} />
            )}
            {file && <p className="mt-1 text-xs text-bronze">Selected: {file.name}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm text-bronzedark">
            <input type="checkbox" checked={form.featured} onChange={set('featured')} className="h-4 w-4 accent-[#8a6d3b]" /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-bronzedark">
            <input type="checkbox" checked={form.bestseller} onChange={set('bestseller')} className="h-4 w-4 accent-[#8a6d3b]" /> Bestseller
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-sand px-8 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-bronze hover:bg-blush">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 rounded-full bg-bronze py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-bronzedark disabled:opacity-60">
            {saving ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProductsTab() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [modal, setModal] = useState<'add' | Product | null>(null);

  const load = () => {
    api<unknown>('/api/admin/products').then((d) => setProducts(normProducts(d))).catch(() => {});
  };
  useEffect(load, []);

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      toast('Product deleted.', 'success');
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete.', 'error');
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-bronze/70">{products.length} products</p>
        <button onClick={() => setModal('add')} className="rounded-full bg-bronze px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-bronzedark">
          Add Product
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-sand text-[11px] uppercase tracking-[0.2em] text-bronze">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Flags</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={String(p.id)} className="border-b border-blush/60 last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc(p.image)} alt={p.name} className="h-11 w-10 rounded object-cover" />
                    <span className="font-medium text-coco">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-bronzedark">{p.category}</td>
                <td className="p-4 text-coco">{formatPKR(p.price)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.stock <= 10 ? 'bg-red-100 text-red-800' : 'bg-blush text-bronzedark'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4 text-xs text-bronze">
                  {[p.featured && 'Featured', p.bestseller && 'Bestseller'].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setModal(p)} className="mr-3 text-xs font-semibold uppercase tracking-[0.15em] text-bronze hover:underline">Edit</button>
                  <button onClick={() => remove(p)} className="text-xs font-semibold uppercase tracking-[0.15em] text-red-800 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}

/* ================= orders ================= */

const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function OrdersTab() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const load = () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q.trim()) params.set('q', q.trim());
    api<Order[]>(`/api/admin/orders?${params.toString()}`).then(setOrders).catch(() => {});
  };
  useEffect(load, [status]);

  const openOrder = async (id: number | string) => {
    try {
      const d = await api<Order>(`/api/admin/orders/${id}`);
      setSelected(d);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not load order.', 'error');
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!selected) return;
    try {
      await api(`/api/admin/orders/${selected.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      toast(`Order marked as ${newStatus}.`, 'success');
      const d = await api<Order>(`/api/admin/orders/${selected.id}`);
      setSelected(d);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update status.', 'error');
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full border border-sand bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-bronze">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex flex-1 gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, name, email, phone…" className="flex-1 rounded-full border border-sand bg-white px-5 py-2.5 text-sm focus:border-bronze focus:outline-none" />
          <button className="rounded-full bg-coco px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-blush hover:bg-bronzedark">Search</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-sand text-[11px] uppercase tracking-[0.2em] text-bronze">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">View</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={String(o.id)} className="border-b border-blush/60 last:border-0">
                <td className="p-4 font-medium text-coco">{o.order_number}</td>
                <td className="p-4 text-bronzedark">{o.name}<br /><span className="text-xs text-bronze/60">{o.city}</span></td>
                <td className="p-4 text-coco">{formatPKR(o.total)}</td>
                <td className="p-4 text-xs uppercase text-bronze">{o.payment_method}</td>
                <td className="p-4">
                  <span className="rounded-full bg-blush px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-bronzedark">{o.status}</span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openOrder(o.id)} className="text-xs font-semibold uppercase tracking-[0.15em] text-bronze hover:underline">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-sm text-bronze/60">No orders found.</p>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-coco/50" onClick={() => setSelected(null)} />
          <div className="nice-scroll relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[#fbf7f1] p-8 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-bronze">Order</p>
                <p className="font-serif text-3xl text-coco">{selected.order_number}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full p-2 text-bronze hover:bg-blush" aria-label="Close">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-bronze">Customer</p>
                <p className="mt-1 font-medium text-coco">{selected.name}</p>
                <p className="text-bronzedark">{selected.phone}</p>
                <p className="text-bronzedark">{selected.email}</p>
                <p className="mt-1 text-bronzedark">{selected.address}, {selected.city}{selected.postal ? ` ${selected.postal}` : ''}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-bronze">Totals</p>
                <p className="mt-1 text-bronzedark">Subtotal: {formatPKR(selected.subtotal)}</p>
                <p className="text-bronzedark">Discount: {formatPKR(selected.discount)}</p>
                <p className="text-bronzedark">Shipping: {selected.shipping === 0 ? 'FREE' : formatPKR(selected.shipping)}</p>
                <p className="mt-1 font-medium text-coco">Total: {formatPKR(selected.total)}</p>
                <p className="text-xs uppercase text-bronze">Paid via {selected.payment_method}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-bronze">Items</p>
              <ul className="space-y-2">
                {(selected.items ?? []).map((it, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc(it.image)} alt={it.name} className="h-10 w-9 rounded object-cover" />
                    <span className="flex-1 text-coco">{it.name} <span className="text-bronze/70">EU {it.size}{it.color ? ` · ${it.color}` : ''} × {it.qty}</span></span>
                    <span className="text-coco">{formatPKR(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-bronze">Update status</p>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={selected.status === s}
                    className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] ${selected.status === s ? 'bg-bronze text-white' : 'bg-white text-bronze hover:bg-blush'} disabled:opacity-100`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {(selected.timeline || []).length > 0 && (
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-bronze">Timeline</p>
                <ul className="space-y-1 text-xs text-bronzedark">
                  {selected.timeline.map((t, i) => (
                    <li key={i}>• <span className="font-semibold uppercase">{t.status}</span> — {new Date(t.at).toLocaleString('en-PK')}{t.note ? ` (${t.note})` : ''}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= coupons ================= */

function CouponsTab() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', min_order: '', usage_limit: '' });

  const load = () => {
    api<Coupon[]>('/api/admin/coupons').then(setCoupons).catch(() => {});
  };
  useEffect(load, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          type: form.type,
          value: Number(form.value),
          min_order: Number(form.min_order) || 0,
          usage_limit: Number(form.usage_limit) || 0,
        }),
      });
      toast('Coupon created.', 'success');
      setForm({ code: '', type: 'percent', value: '', min_order: '', usage_limit: '' });
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not create coupon.', 'error');
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await api(`/api/admin/coupons/${c.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !c.active }),
      });
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update coupon.', 'error');
    }
  };

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await api(`/api/admin/coupons/${c.id}`, { method: 'DELETE' });
      toast('Coupon deleted.', 'success');
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete coupon.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={create} className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-serif text-2xl text-coco">Create Coupon</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE *" required className={inputCls} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
            <option value="percent">Percent %</option>
            <option value="fixed">Fixed PKR</option>
          </select>
          <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Value *" required inputMode="numeric" className={inputCls} />
          <input value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} placeholder="Min order (PKR)" inputMode="numeric" className={inputCls} />
          <input value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Usage limit (0 = ∞)" inputMode="numeric" className={inputCls} />
        </div>
        <button className="mt-4 rounded-full bg-bronze px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white hover:bg-bronzedark">
          Create
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-sand text-[11px] uppercase tracking-[0.2em] text-bronze">
              <th className="p-4">Code</th>
              <th className="p-4">Value</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Used</th>
              <th className="p-4">Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={String(c.id)} className="border-b border-blush/60 last:border-0">
                <td className="p-4 font-semibold text-coco">{c.code}</td>
                <td className="p-4 text-bronzedark">{c.type === 'percent' ? `${c.value}%` : formatPKR(c.value)}</td>
                <td className="p-4 text-bronzedark">{formatPKR(c.min_order)}</td>
                <td className="p-4 text-bronzedark">{c.used_count ?? 0}{c.usage_limit > 0 ? ` / ${c.usage_limit}` : ''}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`relative h-6 w-11 rounded-full transition ${c.active ? 'bg-bronze' : 'bg-sand'}`}
                    aria-label="Toggle active"
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${c.active ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => remove(c)} className="text-xs font-semibold uppercase tracking-[0.15em] text-red-800 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="p-8 text-center text-sm text-bronze/60">No coupons yet.</p>}
      </div>
    </div>
  );
}

/* ================= customers & subscribers ================= */

function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  useEffect(() => {
    api<Customer[]>('/api/admin/customers').then(setCustomers).catch(() => {});
  }, []);

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-sand text-[11px] uppercase tracking-[0.2em] text-bronze">
            <th className="p-4">Customer</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Orders</th>
            <th className="p-4">Total Spent</th>
            <th className="p-4">Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={String(c.id)} className="border-b border-blush/60 last:border-0">
              <td className="p-4 font-medium text-coco">{c.name}</td>
              <td className="p-4 text-bronzedark">{c.email}<br /><span className="text-xs text-bronze/60">{c.phone || '—'}</span></td>
              <td className="p-4 text-bronzedark">{c.orders}</td>
              <td className="p-4 text-coco">{formatPKR(c.spent)}</td>
              <td className="p-4 text-xs text-bronze/70">
                {c.created_at ? new Date(c.created_at).toLocaleDateString('en-PK') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && <p className="p-8 text-center text-sm text-bronze/60">No customers yet.</p>}
    </div>
  );
}

function SubscribersTab() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  useEffect(() => {
    api<Subscriber[]>('/api/admin/subscribers').then(setSubs).catch(() => {});
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-serif text-2xl text-coco">Newsletter Subscribers ({subs.length})</h3>
      <ul className="divide-y divide-blush">
        {subs.map((s) => (
          <li key={String(s.id)} className="flex items-center justify-between py-3 text-sm">
            <span className="text-coco">{s.email}</span>
            <span className="text-xs text-bronze/60">
              {s.created_at ? new Date(s.created_at).toLocaleDateString('en-PK') : ''}
            </span>
          </li>
        ))}
      </ul>
      {subs.length === 0 && <p className="py-6 text-center text-sm text-bronze/60">No subscribers yet.</p>}
    </div>
  );
}

/* ================= page ================= */

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('Dashboard');

  if (loading) {
    return <p className="py-24 text-center font-serif text-2xl text-bronze">Loading…</p>;
  }

  if (!user || !user.is_admin) {
    return <AdminLogin />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-bronze">Crowne Admin</p>
          <h1 className="mt-1 font-serif text-4xl text-coco">Dashboard</h1>
        </div>
        <button onClick={logout} className="rounded-full border border-sand bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-bronze hover:bg-blush">
          Sign Out
        </button>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto border-b border-sand pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-t-xl px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition ${tab === t ? 'bg-white text-bronze shadow-sm' : 'text-bronze/60 hover:text-bronze'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Dashboard' && <DashboardTab />}
      {tab === 'Products' && <ProductsTab />}
      {tab === 'Orders' && <OrdersTab />}
      {tab === 'Coupons' && <CouponsTab />}
      {tab === 'Customers' && <CustomersTab />}
      {tab === 'Subscribers' && <SubscribersTab />}
    </div>
  );
}
