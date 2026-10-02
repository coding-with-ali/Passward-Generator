# Crowne Website LIVE Kaise Karein

Website ko internet par live karne ke 2 tareeqe hain. Sab se aasan **Tareeqa 1** hai.

---

## Tareeqa 1: Apne Computer Par Chalana (sab se aasan, 10 minute)

### Step 1 — Node.js install karein
[nodejs.org](https://nodejs.org) se **LTS version** download karke install karein.

### Step 2 — Free MongoDB Atlas account banayein (database ke liye)
1. [cloud.mongodb.com](https://cloud.mongodb.com) par free account banayein.
2. **Create Cluster** → **M0 Free** select karein → Create.
3. **Database Access** → **Add New Database User** → username/password banayein (yaad rakhein).
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0).
5. **Connect** → **Drivers** → connection string copy karein, is tarah ki hogi:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/crowne
   ```
   (USERNAME/PASSWORD apne wale se replace karein)

### Step 3 — Project copy karein
Ye poora folder apne computer par copy karein: `crowne-ecommerce/`

### Step 4 — Backend start karein
Terminal/CMD mein:
```bash
cd crowne-ecommerce/backend
npm install
```
Phir `backend/.env` file mein ye line apni Atlas string se replace karein:
```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/crowne
```
Phir:
```bash
npm run seed
npm run dev
```
Backend chal jayega: http://localhost:5000

### Step 5 — Frontend start karein
Nayi terminal mein:
```bash
cd crowne-ecommerce/frontend
npm install
npm run dev
```
Website khul jayegi: **http://localhost:3000** 🎉

**Admin panel:** http://localhost:3000/admin
Login: `admin@crowne.pk` / `admin123`

---

## Tareeqa 2: Internet Par Deploy (duniya dekhegi)

Free hosting par 3 cheezein lagani hongi:

| Cheez | Service (free) | Kya karein |
|---|---|---|
| Database | MongoDB Atlas | Upar Step 2 follow karein |
| Backend | Render | [render.com](https://render.com) → New **Web Service** → GitHub repo connect karein → Root Directory: `backend` → `render.yaml` khud settings utha lega → Environment mein `MONGODB_URI` aur `FRONTEND_URL` add karein |
| Frontend | Vercel | [vercel.com](https://vercel.com) → New Project → GitHub repo → Root Directory: `frontend` → Environment Variable add karein: `NEXT_PUBLIC_API_URL` = Render backend ka URL (jaise `https://crowne-backend.onrender.com`) → Deploy |

**Zaroori:** GitHub par code push karna hoga pehle:
```bash
cd crowne-ecommerce
git init
git add .
git commit -m "Crowne ecommerce"
# GitHub par naya repo banayein, phir:
git remote add origin https://github.com/APKA-USERNAME/crowne.git
git push -u origin main
```

**Note:** Render ka free plan 15 minute idle ke baad "so jata" hai — pehli request par ~30 second lag sakte hain. Ye normal hai.

---

## Payment (Stripe) live karna ho to
`backend/.env` mein apni Stripe keys add karein:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```
Filhal **Cash on Delivery** poori tarah kaam kar raha hai.
