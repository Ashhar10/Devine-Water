# Water Management System

A comprehensive full-stack water management system with role-based access for Admin, Customer, Supplier, and Shopkeeper users.

## Features

### Admin Panel
- 📊 Dashboard with comprehensive reports and analytics
- 📦 Order management and tracking
- 💰 Finance module (incoming/outgoing money tracking)
- 🚚 Delivery tracking and monitoring
- 📅 Monthly routing scheduler
- 👥 User management with role assignment
- 📝 Activity logs for audit trailing

### Customer Panel
- 🏠 Personal dashboard with order history
- 🛒 Request bottle feature for placing orders
- 💳 Payment history and balance tracking
- 📅 Supply schedule view

### Supplier Panel
- 🗺️ Daily delivery routes
- 📋 Delivery status tracking
- ✅ Mark deliveries as complete
- 📍 Customer location and order details

### Shopkeeper Panel
- 💵 Sales entry for walk-in customers
- 🧮 Automatic cash calculator
- 📊 Daily sales reports
- 💰 Automatic finance integration

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO for real-time updates
- bcrypt for password hashing

**Frontend:**
- React with Vite
- React Router for navigation
- Axios for API calls
- Modern CSS with Glassmorphism
- Socket.IO client for real-time features

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy environment variables:
```bash
copy .env.example .env
```

3. Update `.env` with your MongoDB connection string

4. Install dependencies (already done):
```bash
npm install
```

5. Seed the database with sample data:
```bash
node seed.js
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Demo Credentials

After seeding the database, use these credentials:

- **Admin**: `admin` / `admin123`
- **Customer**: `customer` / `admin123`
- **Supplier**: `supplier` / `admin123`
- **Shopkeeper**: `shopkeeper` / `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Orders
- `GET /api/orders` - Get orders (role-filtered)
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PUT /api/orders/:id/assign` - Assign to supplier

### Finance
- `GET /api/finance/incoming` - Get incoming transactions
- `POST /api/finance/incoming` - Add income
- `GET /api/finance/outgoing` - Get expenses
- `POST /api/finance/outgoing` - Add expense
- `GET /api/finance/reports` - Get financial reports

### Deliveries
- `GET /api/deliveries` - Get deliveries
- `PUT /api/deliveries/:id/status` - Update status

### Routes
- `GET /api/routes` - Get routes
- `POST /api/routes` - Create route
- `GET /api/routes/date/:date` - Get routes by date

### Shop Sales
- `GET /api/shop-sales` - Get sales
- `POST /api/shop-sales` - Record sale
- `GET /api/shop-sales/daily` - Daily sales report

### Dashboards
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/customer` - Customer dashboard data
- `GET /api/dashboard/supplier` - Supplier dashboard data

## Features Implemented

✅ Complete authentication system with JWT
✅ Role-based access control (Admin, Customer, Supplier, Shopkeeper)
✅ Real-time updates using Socket.IO
✅ Activity logging for audit trailing
✅ Beautiful glassmorphism UI design
✅ Responsive layouts
✅ Finance tracking (incoming/outgoing)
✅ Order management
✅ Delivery tracking
✅ Shop sales with cash calculator
✅ Dashboard analytics

## Project Structure

```
water-management/
├── backend/
│   ├── config/         # Database configuration
│   ├── models/         # Mongoose models
│   ├── controllers/    # Request handlers
│   ├── routes/         # API routes
│   ├── middleware/     # Auth & logging middleware
│   ├── server.js       # Express server
│   └── seed.js         # Database seeder
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # React context (Auth)
│   │   ├── services/   # API service
│   │   ├── utils/      # Socket.IO client
│   │   ├── App.jsx     # Main app component
│   │   ├── main.jsx    # Entry point
│   │   └── index.css   # Global styles
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## License

MIT
