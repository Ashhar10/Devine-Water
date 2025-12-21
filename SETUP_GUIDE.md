# Devine Water - Setup Guide

This guide will walk you through setting up the Devine Water Management System from scratch.

## Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (free tier is fine)
- A Vercel account (for frontend deployment)
- A Render account (for backend deployment)

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Devine-Water
```

## Step 2: Database Setup (Supabase)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready
4. Go to Settings → Database
5. Copy your **Connection String** (it should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres`)

### 2.2 Run Database Schema

1. In Supabase, go to the SQL Editor
2. Open `database/schema.sql` from this project
3. Copy and paste the entire content into the SQL Editor
4. Click "Run"
5. Verify all tables were created successfully

### 2.3 Run Seed Data

1. Still in the SQL Editor
2. Open `database/seed.sql` from this project
3. Copy and paste the entire content
4. Click "Run"
5. You should now have demo users and customers in your database

## Step 3: Backend Setup

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

### 3.2 Configure Environment Variables

Create a file called `.env` in the `backend` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Secret (Generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
ALLOW_ORIGINS=http://localhost:3000

# Email Service (Optional - Configure later)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@devinewater.com
```

**Important**: Replace `[YOUR-PASSWORD]` and `[YOUR-PROJECT-REF]` with your actual Supabase credentials!

### 3.3 Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database (Supabase)
🚀 Server running on port 5000
```

## Step 4: Frontend Setup

### 4.1 Install Dependencies

Open a **new terminal window** and navigate to the frontend:

```bash
cd frontend
npm install
```

### 4.2 Configure Environment Variables

Create a file called `.env` in the `frontend` directory with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Devine Water
```

### 4.3 Start Frontend Development Server

```bash
npm run dev
```

The app should open at `http://localhost:3000`

## Step 5: Test the Application

### Login Credentials

The seed data has created these demo accounts:

**Admin (Full Access)**
- Email: `admin@devinewater.com`
- Password: `admin123`

**User (Limited Admin)**
- Email: `user@devinewater.com`
- Password: `user123`

**Customer**
- Email: `customer@devinewater.com`
- Password: `customer123`

### Test Each Portal

1. **Login as Admin**: You should see the admin dashboard with full system statistics
2. **Login as User**: You'll see limited options (no Activity Logs, User Management, or Settings)
3. **Login as Customer**: You'll see your personal dashboard with water usage and billing info

## Step 6: Deploy to Production

### 6.1 Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Set the **Root Directory** to `frontend`
6. Add Environment Variables:
   - `VITE_API_URL`: (will be your Render backend URL after step 6.2)
   - `VITE_APP_NAME`: `Devine Water`
7. Deploy!

### 6.2 Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `devine-water-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: Your secret key
   - `ALLOW_ORIGINS`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
6. Deploy!

### 6.3 Update Frontend Environment

1. Go back to Vercel
2. Go to Settings → Environment Variables
3. Update `VITE_API_URL` to your Render backend URL (e.g., `https://devine-water-api.onrender.com/api`)
4. Redeploy the frontend

## Step 7: Verify Deployment

1. Visit your Vercel URL
2. Try logging in with the demo credentials
3. Test navigation between different portals
4. Verify role-based access control:
   - As a User, try accessing `/admin/activity-logs` - you should get "Access Denied"
   - As an Admin, you should be able to access activity logs

## Troubleshooting

### Backend won't connect to database

- Verify your `DATABASE_URL` is correct
- Make sure you're using the connection string from Supabase Settings → Database
- Check that SSL is configured (Supabase requires SSL)

### Frontend can't reach backend

- Check CORS configuration in backend `.env`
- Verify `ALLOW_ORIGINS` includes your frontend URL
- Make sure backend is running on the correct port

### Login doesn't work

- Verify the database seed ran successfully
- Check that bcrypt hashed passwords correctly
- Look at browser developer console for error messages

### Role-based access not working

- Check JWT token is being sent in requests
- Verify the role middleware is applied to routes
- Look at backend logs for authentication errors

## Next Steps

Now that your system is running, you can:

1. **Customize the Design**: Edit `/frontend/src/styles/variables.css` to change colors
2. **Add More Features**: Expand placeholder components with full functionality
3. **Configure Email**: Set up SMTP for sending credentials and notifications
4. **Add Analytics**: Integrate Chart.js charts with real data
5. **Build Mobile App**: Use the same backend API for a mobile application

## Need Help?

Check the main README.md for more information about the project structure and API endpoints.

---

**Congratulations!** 🎉 You now have a fully functional water management system!
