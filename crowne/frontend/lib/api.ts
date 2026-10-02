import type { Product } from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('crowne_token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      (data as { error?: string } | null)?.error ||
      (typeof data === 'string' ? data : '') ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

/** Resolve a product image path to a usable URL. */
export function imgSrc(p?: string | null): string {
  if (!p) return '/images/hero.jpg';
  if (p.startsWith('http') || p.startsWith('/images/')) return p;
  if (p.startsWith('/uploads/')) return `${API_URL}${p}`;
  if (p.startsWith('uploads/')) return `${API_URL}/${p}`;
  return p;
}

/** Normalize a product record (handles Mongoose `_id` if present). */
export function normProduct(p: Record<string, unknown>): Product {
  const id = (p.id ?? p._id ?? '') as number | string;
  return {
    id,
    name: String(p.name ?? ''),
    slug: String(p.slug ?? ''),
    category: String(p.category ?? ''),
    price: Number(p.price ?? 0),
    old_price: p.old_price == null ? null : Number(p.old_price),
    description: String(p.description ?? ''),
    colors: (p.colors as string[]) || [],
    sizes: (p.sizes as string[]) || [],
    stock: Number(p.stock ?? 0),
    image: String(p.image ?? ''),
    images: (p.images as string[]) || [],
    rating: Number(p.rating ?? 0),
    reviews_count: Number(p.reviews_count ?? 0),
    featured: !!p.featured,
    bestseller: !!p.bestseller,
    created_at: p.created_at ? String(p.created_at) : undefined,
  };
}

export function normProducts(list: unknown): Product[] {
  if (!Array.isArray(list)) return [];
  return list.map((p) => normProduct(p as Record<string, unknown>));
}

/** PKR 4,299 */
export function formatPKR(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return `PKR ${v.toLocaleString('en-PK')}`;
}

export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FLAT = 250;

export function shippingFor(subtotalAfterDiscount: number): number {
  return subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export const EU_SIZES = ['36', '37', '38', '39', '40', '41', '42'];
