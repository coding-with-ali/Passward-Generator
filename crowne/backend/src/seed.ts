import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import { config } from './config';
import { User } from './models/User';
import { Product } from './models/Product';
import { Order } from './models/Order';
import { Coupon } from './models/Coupon';
import { Review } from './models/Review';
import { Newsletter } from './models/Newsletter';
import { slugify } from './utils';

interface SeedProduct {
  name: string;
  category: string;
  price: number;
  old?: number;
  image: string;
  stock: number;
  featured?: boolean;
  bestseller?: boolean;
  colors: string[];
  desc: string;
}

const SIZES = ['36', '37', '38', '39', '40', '41', '42'];

const PRODUCTS: SeedProduct[] = [
  {
    name: 'Aurelia Block Heels',
    category: 'Heels',
    price: 6999,
    old: 8499,
    image: 'product-1.jpg',
    stock: 24,
    featured: true,
    bestseller: true,
    colors: ['Nude', 'Blush', 'Black'],
    desc: 'Sculpted block heels in soft nude leather with a cushioned insole — designed for long evenings that never hurt. The Aurelia is our signature: timeless, stable, unforgettable.',
  },
  {
    name: 'Rosé Slide Sandals',
    category: 'Sandals',
    price: 3499,
    image: 'product-2.jpg',
    stock: 40,
    featured: true,
    bestseller: true,
    colors: ['Rose Gold', 'Champagne'],
    desc: 'Rose-gold metallic slides with a moulded comfort footbed. Slip on, step out — effortless shine for every day.',
  },
  {
    name: 'Velvet Khussa Flats',
    category: 'Flats',
    price: 4299,
    old: 4999,
    image: 'product-3.jpg',
    stock: 18,
    featured: true,
    colors: ['Maroon', 'Emerald', 'Navy'],
    desc: 'Hand-finished velvet khussas with delicate gold threadwork — heritage craft, Crowne comfort. A festive essential.',
  },
  {
    name: 'Pearl Embellished Slippers',
    category: 'Slippers',
    price: 2999,
    image: 'product-4.jpg',
    stock: 52,
    bestseller: true,
    colors: ['Ivory', 'Blush'],
    desc: 'Ivory slippers scattered with hand-set pearls. Soft as a whisper, pretty as a promise.',
  },
  {
    name: 'Gilded Strappy Heels',
    category: 'Heels',
    price: 7999,
    image: 'product-5.jpg',
    stock: 15,
    featured: true,
    colors: ['Gold', 'Silver'],
    desc: 'Fine gold straps on a sculpted stiletto — made for weddings, receptions and rooms you intend to own.',
  },
  {
    name: 'Ivory Mule Flats',
    category: 'Flats',
    price: 3999,
    image: 'product-6.jpg',
    stock: 33,
    bestseller: true,
    colors: ['Ivory', 'Nude', 'Black'],
    desc: 'Clean-lined ivory mules with a pointed toe. Minimal, modern, endlessly wearable.',
  },
  {
    name: 'Champagne Wedge Sandals',
    category: 'Sandals',
    price: 5499,
    old: 6499,
    image: 'product-7.jpg',
    stock: 21,
    featured: true,
    colors: ['Champagne', 'Rose Gold'],
    desc: 'Champagne wedges with a secure ankle strap — height without the wobble, sparkle without the effort.',
  },
  {
    name: 'Blush Ballet Flats',
    category: 'Flats',
    price: 3299,
    image: 'product-8.jpg',
    stock: 47,
    bestseller: true,
    colors: ['Blush', 'Nude', 'Black'],
    desc: 'Featherlight blush ballet flats with a grosgrain bow. The everyday pair you will reach for on repeat.',
  },
  {
    name: 'Satin Evening Heels',
    category: 'Heels',
    price: 8999,
    old: 10999,
    image: 'product-9.jpg',
    stock: 9,
    featured: true,
    colors: ['Champagne', 'Black'],
    desc: 'Champagne satin, pointed toe, evening-ready heel. Our most luxurious pair — limited stock.',
  },
  {
    name: 'Gold Thong Slippers',
    category: 'Slippers',
    price: 2499,
    image: 'product-10.jpg',
    stock: 60,
    bestseller: true,
    colors: ['Gold', 'Copper'],
    desc: 'Golden thong slippers with a soft padded sole. Understated luxury for daily wear.',
  },
  {
    name: 'Rosewood Platform Sandals',
    category: 'Sandals',
    price: 6499,
    image: 'product-7.jpg', // product-11.jpg was never generated; reuse the sandal shot
    stock: 17,
    colors: ['Rosewood', 'Tan'],
    desc: 'Bold rosewood platforms with cushioned straps — statement height, all-day ease.',
  },
  {
    name: 'Crystal Court Shoes',
    category: 'Heels',
    price: 8499,
    image: 'product-12.jpg',
    stock: 12,
    featured: true,
    colors: ['Nude', 'Silver'],
    desc: 'Nude court shoes dusted with hand-set crystals. Quietly dazzling, from desk to dinner.',
  },
  {
    name: 'Nude Comfort Slippers',
    category: 'Slippers',
    price: 2799,
    old: 3299,
    image: 'product-4.jpg',
    stock: 55,
    colors: ['Nude', 'Grey'],
    desc: 'Cloud-soft nude slippers with memory-foam cushioning. Your feet will thank you daily.',
  },
  {
    name: 'Embroidered Jutti Flats',
    category: 'Flats',
    price: 4999,
    image: 'product-3.jpg',
    stock: 6,
    colors: ['Gold', 'Red'],
    desc: 'Festive juttis with intricate embroidery and a flexible sole — tradition, tailored for today.',
  },
];

export async function seedDatabase(): Promise<void> {
  // Idempotent: clear collections first
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Coupon.deleteMany({}),
    Review.deleteMany({}),
    Newsletter.deleteMany({}),
  ]);
  console.log('🧹 Collections cleared');

  // Admin user
  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  await User.create({
    name: 'Crowne Admin',
    email: config.adminEmail.toLowerCase(),
    phone: '',
    passwordHash,
    isAdmin: true,
  });
  console.log(`👤 Admin user created: ${config.adminEmail}`);

  // Coupons
  await Coupon.create([
    { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 2000, usageLimit: 0 },
    { code: 'ELEGANCE500', type: 'fixed', value: 500, minOrder: 5000, usageLimit: 100 },
    { code: 'FLAT15', type: 'percent', value: 15, minOrder: 8000, usageLimit: 50 },
  ]);
  console.log('🎟️  Coupons created: WELCOME10, ELEGANCE500, FLAT15');

  // Products
  const docs = PRODUCTS.map((p) => {
    const image = `/images/${p.image}`;
    return {
      name: p.name,
      slug: slugify(p.name),
      category: p.category,
      price: p.price,
      oldPrice: p.old,
      description: p.desc,
      colors: p.colors,
      sizes: SIZES,
      stock: p.stock,
      image,
      images: [image],
      featured: !!p.featured,
      bestseller: !!p.bestseller,
    };
  });
  await Product.insertMany(docs);
  console.log(`👠 ${docs.length} products created`);

  console.log('✅ Seed complete');
}

async function main() {
  await connectDB();
  await seedDatabase();
  process.exit(0);
}

// Only run when executed directly (npm run seed), not when imported
if (require.main === module) {
  main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
