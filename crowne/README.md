# Crowne — Step Into Elegance 👑

Full-stack e-commerce website for **Crowne**, a ladies' footwear brand (heels, flats, sandals, slippers).
Blush-pink + bronze/gold premium branding, serif typography.

## Tech stack

| Layer    | Technology |
|----------|-----------|
| Frontend | **Next.js** (App Router) + **React** + **TypeScript** + **Tailwind CSS** |
| Backend  | **Node.js** + **Express** + **TypeScript** + **Mongoose** |
| Database | **MongoDB** |
| Auth     | JWT (Bearer tokens) |

```
crowne-ecommerce/
├── frontend/          # Next.js app (port 3000)
├── backend/           # Express API (port 5000)
├── legacy-vanilla/   # Previous working build (Express + SQLite + plain HTML/CSS), preserved
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally **or** a MongoDB Atlas URI

A local MongoDB 8.0 is already installed on this machine:

```bash
~/workspace/mongodb/mongodb/bin/mongod --dbpath ~/workspace/mongodb/data \
  --bind_ip 127.0.0.1 --port 27017 --fork --logpath ~/workspace/mongodb/mongod.log
```

## Run it (3 terminals)

**1. MongoDB** — start it with the command above (skip if already running).

**2. Backend** (http://localhost:5000):

```bash
cd ~/workspace/crowne-ecommerce/backend
npm install
npm run seed     # creates admin, coupons, 14 products (idempotent)
npm run dev
```

**3. Frontend** (http://localhost:3000):

```bash
cd ~/workspace/crowne-ecommerce/frontend
npm install
npm run dev      # or: npm run build && npm start
```

The frontend talks to the API at `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`,
set in `frontend/.env.local`).

## Admin panel

Open http://localhost:3000/admin and log in:

- Email: `admin@crowne.pk`
- Password: `admin123`

Dashboard (revenue, 14-day chart, low stock), product CRUD with image upload,
order management with status timeline, coupons, customers, newsletter subscribers.

## Test coupons

| Code        | Discount              | Min. order |
|-------------|-----------------------|------------|
| WELCOME10   | 10% off               | PKR 2,000  |
| ELEGANCE500 | PKR 500 off           | PKR 5,000  |
| FLAT15      | 15% off               | PKR 8,000  |

Shipping is **free over PKR 5,000**, otherwise PKR 250. Cash on Delivery works out of the box.

## Configuration

- `backend/.env` — `PORT`, `MONGODB_URI` (empty = in-memory MongoDB for quick dev),
  `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `FRONTEND_URL`.
  See `backend/.env.example`.
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL`. See `frontend/.env.example`.

## Features

Storefront (hero, collections, featured/bestsellers, testimonials, newsletter) ·
shop with category/price/sale filters, sorting and live search · product pages
(gallery, EU 36–42 sizes, colours, stock alerts, reviews, related products) ·
cart drawer + page · wishlist · 3-step checkout (COD + Stripe scaffold) ·
order tracking by order ID · customer accounts with order history ·
full admin panel · coupons · responsive design · SEO meta tags.

## Going live — still needed

1. **Stripe keys** — set `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` in `backend/.env`
   (card payments currently show "not configured"; COD works).
2. **MongoDB Atlas** — put your connection string in `MONGODB_URI` instead of local MongoDB.
3. **Production hardening** — change `JWT_SECRET` and the default admin password,
   serve over HTTPS, use a persistent session/token store policy.
4. Replace AI-generated product shots in `frontend/public/images/` with real photography when ready.
