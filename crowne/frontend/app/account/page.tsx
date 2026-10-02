'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth, useToast } from '@/lib/store-context';
import { api, formatPKR } from '@/lib/api';
import type { Order } from '@/lib/types';

const inputCls =
  'w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-coco placeholder:text-bronze/40 focus:border-bronze focus:outline-none';

function AuthForms() {
  const { toast } = useToast();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === 'login') {
        await login(email.trim(), password);
        toast('Welcome back.', 'success');
      } else {
        await register(name.trim(), email.trim(), password, phone.trim());
        toast('Your Crowne account is ready.', 'success');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Authentication failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
      <div className="mb-6 grid grid-cols-2 rounded-full bg-blush p-1">
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full py-2.5 text-xs font-semibold uppercase tracking-[0.25em] transition ${tab === t ? 'bg-white text-bronze shadow' : 'text-bronze/60'}`}
          >
            {t === 'login' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>
      <h1 className="text-center font-serif text-4xl text-coco">
        {tab === 'login' ? 'Welcome Back' : 'Join Crowne'}
      </h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {tab === 'register' && (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name *" required className={inputCls} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className={inputCls} />
          </>
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" type="email" required className={inputCls} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters) *" type="password" required minLength={6} className={inputCls} />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-bronze py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark disabled:opacity-60"
        >
          {busy ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

function Profile() {
  const { toast } = useToast();
  const { user, logout, refresh } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Order[]>('/api/orders/mine').then(setOrders).catch(() => {});
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      await refresh();
      toast('Profile updated.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="font-serif text-3xl text-coco">Profile</h2>
        <form onSubmit={save} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Email</label>
            <input value={user?.email ?? ''} disabled className={`${inputCls} opacity-60`} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-bronze">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
          <button disabled={saving} className="w-full rounded-full bg-bronze py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-2 border-t border-sand pt-4">
          {user?.is_admin && (
            <Link href="/admin" className="rounded-full bg-coco py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-blush hover:bg-bronzedark">
              Admin Dashboard
            </Link>
          )}
          <button onClick={logout} className="rounded-full border border-sand py-3 text-xs font-semibold uppercase tracking-[0.3em] text-bronze hover:bg-blush">
            Sign Out
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="font-serif text-3xl text-coco">Order History</h2>
        {orders.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-bronzedark/70">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="mt-4 inline-block rounded-full bg-bronze px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {orders.map((o) => (
              <div key={String(o.id)} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-serif text-xl text-coco">{o.order_number}</p>
                    <p className="text-xs text-bronzedark/60">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      {' '}· {(o.items ?? []).reduce((s, it) => s + (it.qty ?? 0), 0)} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-coco">{formatPKR(o.total)}</p>
                    <span className="mt-1 inline-block rounded-full bg-blush px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-bronzedark">
                      {o.status}
                    </span>
                  </div>
                </div>
                <Link href={`/track?id=${encodeURIComponent(o.order_number)}`} className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-bronze hover:underline">
                  Track this order
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, loading } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {loading ? (
        <p className="py-20 text-center font-serif text-2xl text-bronze">Loading your account…</p>
      ) : user ? (
        <>
          <p className="mb-8 text-center font-serif text-4xl text-coco">
            Hello, <span className="text-bronze">{user.name.split(' ')[0]}</span>
          </p>
          <Profile />
        </>
      ) : (
        <AuthForms />
      )}
    </div>
  );
}
