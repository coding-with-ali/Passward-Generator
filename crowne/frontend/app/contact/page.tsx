'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/store-context';

const inputCls =
  'w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm text-coco placeholder:text-bronze/40 focus:border-bronze focus:outline-none';

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const d = await api<{ message?: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSent(true);
      toast(d.message || 'Message sent.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not send your message.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-bronze">Get in Touch</p>
        <h1 className="mt-2 font-serif text-5xl text-coco">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-bronzedark/80">
          Questions about sizing, orders, or exchanges — our care team replies within 24 hours.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="rounded-3xl bg-coco p-8 text-blush lg:col-span-2">
          <h2 className="font-serif text-2xl text-sand">Care Details</h2>
          <ul className="mt-6 space-y-5 text-sm">
            <li>
              <p className="text-xs uppercase tracking-[0.25em] text-bronze">Email</p>
              <p className="mt-1">care@crowne.pk</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-[0.25em] text-bronze">Phone / WhatsApp</p>
              <p className="mt-1">+92 300 000 0000</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-[0.25em] text-bronze">Hours</p>
              <p className="mt-1">Monday – Saturday, 10am – 7pm PKT</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-[0.25em] text-bronze">Studio</p>
              <p className="mt-1">Karachi, Pakistan</p>
            </li>
          </ul>
          <div className="mt-8 rounded-2xl bg-blush/10 p-5">
            <p className="font-serif text-lg text-sand">Order help?</p>
            <p className="mt-1 text-xs text-blush/70">
              Have your order number ready — you can also track any order from the Track Order page.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm lg:col-span-3">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blush">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-bronze" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 font-serif text-3xl text-coco">Message received</p>
              <p className="mt-2 text-sm text-bronzedark/70">Our care team will reply within 24 hours.</p>
              <button onClick={() => setSent(false)} className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-bronze hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.name} onChange={set('name')} placeholder="Your name *" required className={inputCls} />
                <input value={form.email} onChange={set('email')} placeholder="Email *" type="email" required className={inputCls} />
              </div>
              <input value={form.subject} onChange={set('subject')} placeholder="Subject (e.g. Size exchange)" className={inputCls} />
              <textarea value={form.message} onChange={set('message')} placeholder="How can we help? *" required rows={6} className={inputCls} />
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-bronze py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-bronzedark disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
