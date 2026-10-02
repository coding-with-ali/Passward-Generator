# Crowne Backend — Ladies Footwear E-commerce API

Node.js + Express + TypeScript + Mongoose. Runs on port 5000.

## Setup

```bash
npm install
cp .env.example .env   # then edit values
```

## Scripts

| Script       | Command              |
| ------------ | -------------------- |
| `npm run dev`   | Start dev server (tsx, hot reload) |
| `npm run build` | Compile to `dist/` |
| `npm start`     | Run compiled server |
| `npm run seed`  | Clear + seed DB (admin user, coupons, 14 products) |

## Environment

| Var | Default | Notes |
| --- | ------- | ----- |
| `PORT` | 5000 | API port |
| `MONGODB_URI` | _(empty)_ | Empty = in-memory MongoDB for dev; set to a real URI for prod |
| `JWT_SECRET` | change-me | Sign JWT auth tokens |
| `STRIPE_SECRET_KEY` | _(empty)_ | Required for card payments; without it only COD works |
| `STRIPE_PUBLISHABLE_KEY` | _(empty)_ | Returned by `GET /api/payments/config` |
| `FRONTEND_URL` | http://localhost:3000 | Allowed CORS origin |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin@crowne.pk / admin123 | Seeded admin login |

## API

Public: products, categories, reviews (read), coupons/validate, auth, checkout,
payments, track, newsletter, contact.
Admin (`Authorization: Bearer <token>`, `isAdmin`): `/api/admin/*` (stats, orders,
products incl. image upload, coupons, customers, subscribers).

Uploads: `multer` → `public/uploads`, served at `/uploads` (5MB, images only).

Error shape: `{ "error": "message" }`.
