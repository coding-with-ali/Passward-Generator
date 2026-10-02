import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/store-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const serif = Cormorant_Garamond({
  variable: '--font-crowne-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const sans = Jost({
  variable: '--font-crowne-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Crowne — Step Into Elegance',
  description:
    "Crowne crafts premium ladies' footwear in Pakistan — elegant heels, flats, sandals and slippers designed to make every step regal.",
  openGraph: {
    title: 'Crowne — Step Into Elegance',
    description:
      "Premium ladies' footwear: elegant heels, flats, sandals and slippers. Step into elegance with Crowne.",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <div className="bg-coco px-4 py-2 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-sand">
              Complimentary shipping over PKR 5,000 <span className="mx-2 text-bronze">·</span> Cash on Delivery nationwide
            </p>
          </div>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
