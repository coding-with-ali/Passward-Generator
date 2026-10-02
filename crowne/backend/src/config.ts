import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: (process.env.MONGODB_URI || '').trim(),
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  stripeSecretKey: (process.env.STRIPE_SECRET_KEY || '').trim(),
  stripePublishableKey: (process.env.STRIPE_PUBLISHABLE_KEY || '').trim(),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@crowne.pk',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
};
