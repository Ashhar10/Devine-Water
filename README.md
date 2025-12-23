# Water Management System - Supabase Edition

A comprehensive full-stack water management system with **Supabase (PostgreSQL)**, **Prisma ORM**, and role-based access control.

## 🆕 What Changed?

This system has been **fully converted** from MongoDB to Supabase:

- ❌ MongoDB + Mongoose → ✅ **Supabase (PostgreSQL) + Prisma**
- ❌ NoSQL Collections → ✅ **SQL Tables with Foreign Keys**
- ❌ MongoDB Atlas → ✅ **Supabase Cloud**

## Features

### Admin Panel
- 📊 Dashboard with comprehensive reports
- 📦 Order management and tracking
- 💰 Finance module (incoming/outgoing money)
- 🚚 Delivery tracking
- 📅 Monthly routing scheduler
- 👥 User management
- 📝 Activity logs

### Customer Panel
- 🏠 Personal dashboard
- 🛒 Request bottle feature
- 💳 Payment history
- 📅 Supply schedule

### Supplier Panel
- 🗺️ Daily delivery routes
- 📋 Delivery status tracking
- ✅ Mark deliveries complete

### Shopkeeper Panel
- 💵 Sales entry
- 🧮 Cash calculator
- 📊 Daily sales reports

## Tech Stack

**Frontend:**
- React + Vite
- Modern CSS (Glassmorphism)
- Axios + Socket.IO

**Backend:**
- Node.js + Express
- **Supabase (PostgreSQL)**
- **Prisma ORM**
- JWT Authentication
- Socket.IO

## Quick Start

### 1. Setup Supabase

```bash
# Create account at https://supabase.com
# Create new project
# Copy DATABASE_URL from Project Settings → Database
```

### 2. Setup Backend

```bash
cd backend

# Copy environment file
copy .env.example .env

# Edit .env and add your Supabase DATABASE_URL

# Install dependencies (already done)
# Generate Prisma Client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Seed database
npm run seed

# Start server
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend

# Start dev server
npm run dev
```

### 4. Login

Visit http://localhost:5173

**Demo Credentials:**
- Admin: `admin` / `admin123`
- Customer: `customer` / `admin123`
- Supplier: `supplier` / `admin123`
- Shopkeeper: `shopkeeper` / `admin123`

## Database Schema (PostgreSQL)

### Tables
- `users` - All system users with roles
- `orders` - Water bottle orders
- `deliveries` - Delivery tracking
- `finance_incoming` - Revenue (payments, sales)
- `finance_outgoing` - Expenses (bills, maintenance)
- `routes` - Delivery route scheduling
- `route_customers` - Customer stops
- `shop_sales` - Walk-in purchases
- `activity_logs` - Audit trail

### View Schema

```bash
npx prisma studio
```

## Deployment

See **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** for complete deployment guide.

**Quick Deployment:**
1. Create Supabase project → Get DATABASE_URL
2. Deploy backend to Render.com (free)
3. Deploy frontend to Vercel (free)
4. Total cost: **$0/month**

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Orders
- `GET /api/orders`
- `POST /api/orders`
- `PUT /api/orders/:id`

### Finance
- `GET /api/finance/incoming`
- `GET /api/finance/outgoing`
- `GET /api/finance/reports`

### More
- Orders, Deliveries, Routes, Shop Sales, Logs, Dashboards

## Prisma Commands

```bash
# Generate client
npx prisma generate

# Push schema changes
npx prisma db push

# Open database GUI
npx prisma studio

# Reset database
npx prisma migrate reset
```

## Project Structure

```
water-management/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── config/
│   │   └── db.js              # Prisma client
│   ├── controllers/           # Business logic
│   ├── routes/                # API routes
│   ├── middleware/            # Auth & logging
│   ├── server.js              # Express server
│   └── seed.js                # Database seeder
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API service
│   │   └── context/           # Auth context
│   └── index.html
└── SUPABASE_SETUP.md         # Deployment guide
```

## Why Supabase?

✅ **Better Free Tier** - 500MB database  
✅ **SQL Database** - Better for relational data  
✅ **Built-in Features** - Auth, storage, real-time  
✅ **Better Performance** - Optimized queries  
✅ **Production Ready** - Enterprise-grade PostgreSQL  

## License

MIT

---

**🎉 Your water management system is now powered by Supabase!**
