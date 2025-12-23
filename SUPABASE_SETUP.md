# Water Management System - Supabase Deployment Guide

## 🎉 System Converted to Supabase (PostgreSQL)

Your water management system now uses **Supabase** with **PostgreSQL** and **Prisma ORM**.

### Why Supabase?
- ✅ **Better Free Tier**: 500MB database (vs MongoDB 512MB)
- ✅ **Built-in Features**: Authentication, Storage, Real-time
- ✅ **SQL Database**: Better for relational data and complex queries
- ✅ **Auto-generated REST API**: Instant API endpoints
- ✅ **Easy Hosting**: One-click deployment

---

## Quick Setup (30 minutes)

### 1. Create Supabase Project (5 minutes)

1. **Sign Up**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - **Name**: `water-management`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get Connection String**
   - Go to Project Settings → Database
   - Scroll to **Connection string** → **URI**
   - Copy the connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
   - Replace `[YOUR-PASSWORD]` with your actual password

---

### 2. Setup Local Development (10 minutes)

1. **Update Environment File**
   ```bash
   cd backend
   Copy .env.example .env
   ```

2. **Edit `.env` file**
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   JWT_SECRET=your_super_secret_jwt_key_production
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Push Database Schema to Supabase**
   ```bash
   npx prisma db push
   ```
   This creates all tables in your Supabase database.

5. **Seed Database with Demo Data**
   ```bash
   npm run seed
   ```

---

### 3. Run Locally (Test)

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

2. **Start Frontend** (new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Login**
   - Visit: http://localhost:5173
   - Username: `admin`
   - Password: `admin123`

---

## Production Deployment

### Option 1: Render + Vercel (Recommended - FREE)

#### Deploy Backend to Render

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Converted to Supabase"
   git push origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - **Name**: `water-management-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   ```
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=your_production_secret
   NODE_ENV=production
   CLIENT_URL=https://your-frontend.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes
   - Copy URL: `https://water-api.onrender.com`

6. **Seed Production Database** (One-time)
   - In Render dashboard → Shell tab
   - Run: `npm run seed`

#### Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your repository
   - **Root Directory**: `frontend`
   - Click "Deploy"

3. **Your App is Live!**
   - `https://water-management.vercel.app`

---

### Option 2: All-in-One Supabase Hosting

Supabase also offers frontend hosting (beta):

1. ** Go to your Supabase project
2. Click "Storage" → "Hosting" (if available)
3. Deploy frontend directly

---

## Database Management

### View Your Database

1. **Supabase Dashboard**
   - Go to your project
   - Click "Table Editor"
   - See all tables and data

2. **Prisma Studio** (Local GUI)
   ```bash
   cd backend
   npx prisma studio
   ```
   Opens at http://localhost:5555

### Database Migrations

When you change the schema:

```bash
# Update schema.prisma file
# Then push changes
npx prisma db push
```

### Backup Database

1. In Supabase Dashboard
2. Go to Database → Backups
3. Click "Create Backup"

---

## SQL Schema Reference

All tables created automatically by Prisma:

- `users` - All system users (admin, customer, supplier, shopkeeper)
- `orders` - Water bottle orders
- `finance_incoming` - Revenue tracking
- `finance_outgoing` - Expense tracking
- `deliveries` - Delivery status
- `routes` - Delivery route scheduling
- `route_customers` - Customer stops on routes
- `shop_sales` - Walk-in sales
- `activity_logs` - Audit trail

### View Schema in Supabase

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## Prisma Commands Reference

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Create migration (production)
npx prisma migrate dev --name init

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## API Endpoints (Unchanged)

All API endpoints work exactly the same:

- `POST /api/auth/login`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/finance/reports`
- etc.

---

## Monitoring & Logs

### Supabase Monitoring

1. Go to your project dashboard
2. Click "Database" → "Logs"
3. Monitor queries and performance

### Application Logs

- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Deployments → Function Logs

---

## Cost Breakdown

### Free Tier (Perfect for Development/Testing)
- **Supabase**: FREE (500MB database, 2GB storage)
- **Render**: FREE (512MB RAM, sleeps after 15min)
- **Vercel**: FREE (Unlimited bandwidth)
- **Total: $0/month**

### Paid Tier (Production)
- **Supabase Pro**: $25/month (8GB database, better performance)
- **Render**: $7/month (no sleep, 512MB RAM)
- **Vercel**: FREE (or $20/month for team)
- **Total: $32-52/month**

---

## Troubleshooting

### "P2002: Unique constraint failed"
**Problem**: Trying to create duplicate username/email  
**Solution**: Use unique values or delete existing user

### "Can't reach database server"
**Problem**: Wrong DATABASE_URL  
**Solution**: Double-check connection string from Supabase

### "P2025: Record not found"
**Problem**: Trying to update/delete non-existent record  
**Solution**: Check if ID exists first

### Migration Issues
**Problem**: Schema out of sync  
**Solution**: 
```bash
npx prisma db push --force-reset
npm run seed
```

---

## Advantages of Current Setup

✅ **Better Performance**: SQL joins vs MongoDB lookups  
✅ **Data Integrity**: Foreign keys prevent orphaned records  
✅ **Better Free Tier**: 500MB vs 512MB  
✅ **SQL Queries**: Complex reports easier  
✅ **Transactions**: Built-in ACID compliance  
✅ **Type Safety**: Prisma provides full TypeScript support  
✅ **Easier Deployment**: One connection string  

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Update `.env` with DATABASE_URL
3. ✅ Run `npx prisma db push`
4. ✅ Run `npm run seed`
5. ✅ Test locally
6. ✅ Deploy to Render + Vercel
7. 🎉 **Your app is live!**

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://prisma.io/docs
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## Migration Complete! 🎉

Your water management system is now running on:
- ✅ **Supabase (PostgreSQL)** - Modern SQL database
- ✅ **Prisma ORM** - Type-safe database client
- ✅ **All features working** -Zero functionality loss
- ✅ **Better performance** - Optimized queries
- ✅ **Production-ready** - Ready to deploy

**Happy deploying! 🚀**
