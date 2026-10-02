'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api } from './api';
import type { CartItem, Product, User } from './types';

/* ---------------- toast ---------------- */

interface ToastMsg {
  id: number;
  text: string;
  kind: 'success' | 'error' | 'info';
}

const ToastCtx = createContext<{ toast: (text: string, kind?: ToastMsg['kind']) => void }>({
  toast: () => {},
});
export const useToast = () => useContext(ToastCtx);

/* ---------------- auth ---------------- */

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within Providers');
  return ctx;
};

/* ---------------- cart ---------------- */

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartItem) => void;
  updateQty: (index: number, qty: number) => void;
  removeAt: (index: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const CartCtx = createContext<CartState | null>(null);
export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used within Providers');
  return ctx;
};

/* ---------------- wishlist ---------------- */

interface WishlistState {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  clear: () => void;
}

const WishCtx = createContext<WishlistState | null>(null);
export const useWishlist = () => {
  const ctx = useContext(WishCtx);
  if (!ctx) throw new Error('useWishlist must be used within Providers');
  return ctx;
};

/* ---------------- provider ---------------- */

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

let toastId = 0;

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishSlugs, setWishSlugs] = useState<string[]>([]);
  const booted = useRef(false);

  const toast = useCallback((text: string, kind: ToastMsg['kind'] = 'info') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, kind }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((m) => m.id !== id));
    }, 3400);
  }, []);

  // boot from localStorage
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    setCartItems(readLS<CartItem[]>('crowne_cart', []));
    setWishSlugs(readLS<string[]>('crowne_wishlist', []));
    const t = readLS<string | null>('crowne_token', null);
    if (t) {
      setToken(t);
      api<{ user: User | null }>('/api/auth/me')
        .then((d) => setUser(d.user))
        .catch(() => {
          setUser(null);
          setToken(null);
          window.localStorage.removeItem('crowne_token');
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('crowne_cart', JSON.stringify(cartItems));
  }, [cartItems]);
  useEffect(() => {
    window.localStorage.setItem('crowne_wishlist', JSON.stringify(wishSlugs));
  }, [wishSlugs]);

  const refresh = useCallback(async () => {
    const d = await api<{ user: User | null }>('/api/auth/me');
    setUser(d.user);
  }, []);

  const persistToken = (t: string | null, u: User | null) => {
    setToken(t);
    setUser(u);
    if (t) window.localStorage.setItem('crowne_token', t);
    else window.localStorage.removeItem('crowne_token');
  };

  const login = useCallback(async (email: string, password: string) => {
    const d = await api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    persistToken(d.token, d.user);
    return d.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const d = await api<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone }),
      });
      persistToken(d.token, d.user);
      return d.user;
    },
    []
  );

  const logout = useCallback(() => {
    persistToken(null, null);
    toast('You have been signed out.', 'info');
  }, [toast]);

  /* cart */
  const add = useCallback(
    (item: CartItem) => {
      setCartItems((prev) => {
        const idx = prev.findIndex(
          (p) => String(p.id) === String(item.id) && p.size === item.size && p.color === item.color
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + item.qty, 10) };
          return next;
        }
        return [...prev, item];
      });
      toast('Added to your bag', 'success');
    },
    [toast]
  );

  const updateQty = useCallback((index: number, qty: number) => {
    setCartItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, qty: Math.max(1, Math.min(10, qty)) } : it))
    );
  }, []);

  const removeAt = useCallback((index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => setCartItems([]), []);

  const count = useMemo(() => cartItems.reduce((s, i) => s + i.qty, 0), [cartItems]);
  const subtotal = useMemo(
    () => cartItems.reduce((s, i) => s + i.price * i.qty, 0),
    [cartItems]
  );

  /* wishlist */
  const toggle = useCallback(
    (slug: string) => {
      setWishSlugs((prev) => {
        if (prev.includes(slug)) return prev.filter((s) => s !== slug);
        toast('Saved to wishlist', 'success');
        return [...prev, slug];
      });
    },
    [toast]
  );
  const has = useCallback((slug: string) => wishSlugs.includes(slug), [wishSlugs]);
  const clearWish = useCallback(() => setWishSlugs([]), []);

  const auth: AuthState = { user, token, loading: authLoading, login, register, logout, refresh };
  const cart: CartState = {
    items: cartItems,
    count,
    subtotal,
    add,
    updateQty,
    removeAt,
    clear,
    open: cartOpen,
    setOpen: setCartOpen,
  };
  const wish: WishlistState = { slugs: wishSlugs, toggle, has, clear: clearWish };

  return (
    <ToastCtx.Provider value={{ toast }}>
      <AuthCtx.Provider value={auth}>
        <CartCtx.Provider value={cart}>
          <WishCtx.Provider value={wish}>
            {children}
            {/* toast viewport */}
            <div className="fixed bottom-6 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
              {toasts.map((m) => (
                <div
                  key={m.id}
                  className={`w-full rounded-full px-5 py-3 text-center text-sm shadow-lg backdrop-blur ${
                    m.kind === 'success'
                      ? 'bg-bronze text-white'
                      : m.kind === 'error'
                        ? 'bg-red-900/95 text-white'
                        : 'bg-coco/95 text-blush'
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </WishCtx.Provider>
        </CartCtx.Provider>
      </AuthCtx.Provider>
    </ToastCtx.Provider>
  );
}

export type { Product };
