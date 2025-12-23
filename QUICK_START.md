# 🚀 Quick Deployment Guide - Water Management System

## Your Supabase Credentials ✅

Database is ready at:
- **Host**: `aws-1-ap-southeast-2.pooler.supabase.com`
- **Database**: `postgres`
- **Connection String**: Already configured in files

---

## 📋 Setup Checklist

### Step 1: Local Setup (5 minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Create .env file
copy .env.example .env
# The .env.example already has your Supabase credentials!

# 3. Generate Prisma Client
npx prisma generate

# 4. Push schema to Supabase
npx prisma db push

# 5. Seed database
npm run seed

# 6. Start backend
npm run dev
```

✅ Backend running at `http://localhost:5000`

```bash
# 7. In new terminal, start frontend
cd frontend
npm run dev
```

✅ Frontend running at `http://localhost:5173`

### Step 2: Test Locally

1. Visit: http://localhost:5173
2. Login: `admin` / `admin123`
3. ✅ If dashboard loads, you're ready to deploy!

---

## 🌐 Deploy to Production (15 minutes)

### Deploy Backend to Render

1. **Go to**: https://render.com → Sign up with GitHub
2. **New Web Service** → Connect `Devine-Water` repo
3. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
   
4. **Add Environment Variables** (copy from `RENDER_CONFIG.md`):
   ```
   DATABASE_URL = postgresql://postgres.tmbkojfmzxouwyuwstpd:MDDtB7Nwwd6n6Cif@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
   
   JWT_SECRET = secretfvoaSLGmrrFM3uQV6aZqMIZebrwT/eoC1GokK3B3QYfInzJtdjvOm5ZagmWgEtX4MA6C1fmiQPWuRN3AGogDTw==
   
   NODE_ENV = production
   
   PORT = 5000
   
   CLIENT_URL = https://your-app.vercel.app (update after step 2)
   ```

5. **Deploy** → Wait 3-5 minutes
6. **Initialize DB** (in Render Shell):
   ```bash
   npx prisma db push
   npm run seed
   ```

✅ Copy your Render URL: `https://water-management-api.onrender.com`

### Deploy Frontend to Vercel

1. **Update API URLs** in code (if backend URL is different):
   - Edit `frontend/src/services/api.js` (line 3)
   - Edit `frontend/src/utils/socket.js` (line 3)
   - Replace with your Render URL

2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Update API URLs"
   git push origin main
   ```

3. **Go to**: https://vercel.com → Sign up with GitHub
4. **Import** `Devine-Water` repo
5. **Configure**:
   - Root Directory: `frontend`
   - Framework: Vite (auto-detected)
6. **Deploy** → Wait 2 minutes

✅ Copy your Vercel URL: `https://devine-water.vercel.app`

### Final Step: Connect Backend & Frontend

1. Go to Render → Environment Variables
2. Update `CLIENT_URL` to your Vercel URL
3. Save (auto-redeploys)

---

## 🎉 You're Live!

**Frontend**: https://devine-water.vercel.app  
**Backend**: https://water-management-api.onrender.com  
**Database**: Supabase (already running)

Test: Visit your Vercel URL and login with `admin` / `admin123`

---

## 📁 Files Reference

- **`RENDER_CONFIG.md`** - Detailed Render deployment guide
- **`VERCEL_CONFIG.md`** - Detailed Vercel deployment guide
- **`SUPABASE_SETUP.md`** - Complete Supabase documentation
- **`backend/.env.example`** - Your Supabase credentials (copy to `.env`)
- **`backend/schema.sql`** - Complete SQL schema

---

## 💰 Costs

- Supabase: **FREE** (500MB database)
- Render: **FREE** (sleeps after 15min inactivity)
- Vercel: **FREE** (unlimited bandwidth)
- **Total: $0/month**

---

## ❓ Need Help?

See detailed guides:
- Render issues → `RENDER_CONFIG.md`
- Vercel issues → `VERCEL_CONFIG.md`
- Database issues → `SUPABASE_SETUP.md`

**Your system is ready to deploy! 🚀**
