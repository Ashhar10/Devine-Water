# Devine Water - Quick Start

Get the Devine Water Management System running in 5 minutes!

## 🚀 Quick Local Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_secret_key
ALLOW_ORIGINS=http://localhost:3000
PORT=5000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Devine Water
```

### 3. Setup Database

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run `database/schema.sql` in Supabase SQL Editor
3. Run `database/seed.sql` in Supabase SQL Editor

### 4. Start Servers

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

### 5. Login

Visit `http://localhost:3000` and login with:

- **Admin**: `admin@devinewater.com` / `admin123`
- **User**: `user@devinewater.com` / `user123`
- **Customer**: `customer@devinewater.com` / `customer123`

## 📦 What You Get

✅ Three role-based portals (Customer, User, Admin)
✅ Beautiful glassmorphism UI with dark/light modes
✅ JWT authentication with role-based access control
✅ PostgreSQL database with sample data
✅ RESTful API with Express
✅ Ready for Vercel + Render + Supabase deployment

## 📚 Full Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup and deployment instructions.

---

Made with 💙 by Devine Water Team
