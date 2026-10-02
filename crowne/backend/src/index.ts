import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { connectDB } from './db';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import reviewRoutes from './routes/reviews';
import couponRoutes from './routes/coupons';
import checkoutRoutes from './routes/checkout';
import paymentRoutes from './routes/payments';
import trackRoutes from './routes/track';
import newsletterRoutes from './routes/newsletter';
import contactRoutes from './routes/contact';
import adminRoutes from './routes/admin';

const app = express();

app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads served at /uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'crowne-api' }));

app.use('/api/auth', authRoutes);
app.use('/api', productRoutes); // /api/categories, /api/products...
app.use('/api', reviewRoutes); // POST /api/reviews
app.use('/api', couponRoutes); // POST /api/coupons/validate
app.use('/api', checkoutRoutes); // POST /api/checkout
app.use('/api', paymentRoutes); // /api/payments/*
app.use('/api', trackRoutes); // /api/track/:orderNumber
app.use('/api', newsletterRoutes); // POST /api/newsletter
app.use('/api', contactRoutes); // POST /api/contact
app.use('/api/admin', adminRoutes);

// 404 for unknown API routes
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

async function main() {
  await connectDB();
  // In-memory dev DB is fresh on every boot — auto-seed so `npm run dev` just works.
  if (!config.mongoUri) {
    const { User } = await import('./models/User');
    const { seedDatabase } = await import('./seed');
    if ((await User.countDocuments()) === 0) {
      console.log('🌱 Empty dev database — seeding demo data…');
      await seedDatabase();
    }
  }
  app.listen(config.port, () => {
    console.log(`👠 Crowne API listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
