# Devine Water Management System

![Devine Water](https://img.shields.io/badge/Devine-Water-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

A comprehensive water management system with three distinct portals for customers, admins, and staff users.

## 🌊 Features

### Customer Portal
- 📊 **Dashboard**: Water usage overview and statistics
- 💰 **Billing & Payments**: View bills and payment history
- 📈 **Water Consumption**: Detailed consumption analytics
- ⚠️ **Complaints**: Submit and track complaints
- 👤 **Profile Management**: Update personal information

### Admin Portal (Full Access)
- 🎯 **System Dashboard**: Complete system analytics
- 👥 **Customer Management**: Full CRUD operations + credential generation
- 🔐 **User Management**: Manage staff users and roles
- 💵 **Billing Management**: Generate bills, track payments, manage tariffs
- 📊 **Consumption Tracking**: Record meter readings and analytics
- 🔧 **Complaint Resolution**: Assign and resolve customer complaints
- 📝 **Activity Logs**: Complete audit trail (Admin only)
- ⚙️ **System Settings**: Configure system-wide settings

### User Portal (Limited Admin)
- 📋 **Basic Dashboard**: Limited statistics view
- 👁️ **View Customers**: Read-only customer access
- 💳 **View Billing**: Billing information viewing
- 📞 **Manage Complaints**: View and assign complaints
- 📄 **Basic Reports**: Limited reporting capabilities

**NO ACCESS**: Activity Logs, User Management, System Settings, Infrastructure Management

## 🎨 Design Features

- ✨ **Modern Glassmorphism UI**: Beautiful glass-effect components
- 🌓 **Dark/Light Theme**: Seamless theme switching
- 📱 **Fully Responsive**: Works perfectly on all devices
- 🎭 **Smooth Animations**: Apple-inspired micro-interactions
- 🎨 **Beautiful Gradients**: Water-themed color palette

## 🚀 Tech Stack

### Frontend
- React 18 + Vite
- React Router v6
- Chart.js for analytics
- CSS with custom design system
- Framer Motion for animations

### Backend
- Node.js + Express
- PostgreSQL (Supabase)
- JWT Authentication
- Bcrypt for password hashing
- Role-based access control

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase PostgreSQL

## 📋 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend API URL
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and JWT secret
npm run dev
```

### Database Setup

1. Create a Supabase project or use your PostgreSQL database
2. Run the schema:
```bash
psql -d your_database < database/schema.sql
```
3. Run the seed data:
```bash
psql -d your_database < database/seed.sql
```

## 🔐 Demo Credentials

### Admin Access
- Email: `admin@devinewater.com`
- Password: `admin123`

### User Access (Limited Admin)
- Email: `user@devinewater.com`
- Password: `user123`

### Customer Access
- Email: `customer@devinewater.com`
- Password: `customer123`

## 🌐 Deployment

### Deploy Frontend to Vercel

```bash
cd frontend
vercel
```

### Deploy Backend to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: Your JWT secret key
   - `ALLOW_ORIGINS`: Your Vercel frontend URL
   - `NODE_ENV`: production
4. Deploy!

### Configure Supabase

1. Create a new Supabase project
2. Copy the connection string from Settings > Database
3. Run the schema and seed files using the SQL Editor

## 📁 Project Structure

```
devine-water/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── context/    # React contexts
│   │   ├── hooks/      # Custom hooks
│   │   ├── services/   # API services
│   │   ├── styles/     # CSS files
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
│
├── backend/            # Express backend
│   └── src/
│       ├── config/     # Configuration
│       ├── controllers/# Route controllers
│       ├── middleware/ # Express middleware
│       └── routes/     # API routes
│
└── database/           # Database files
    ├── schema.sql      # Database schema
    └── seed.sql        # Seed data
```

## 🔒 Role-Based Access Control

| Feature | Customer | User | Admin | Super Admin |
|---------|----------|------|-------|-------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Own Data | ✅ | ❌ | ❌ | ❌ |
| View All Customers | ❌ | ✅ | ✅ | ✅ |
| Edit Customers | ❌ | ✅ | ✅ | ✅ |
| Delete Customers | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ | ✅ |
| Activity Logs | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ✅ |

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### (More endpoints coming soon as features are implemented)

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

## 📝 License

MIT License - feel free to use this project for your own purposes!

## 👨‍💻 Author

**Devine Water Team**

---

Made with 💙 by the Devine Water Team
