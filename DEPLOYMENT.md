# Water Management System - Deployment Guide

## Hosting Options Overview

### Recommended Stack (FREE Tier Available)
- **Database**: MongoDB Atlas (Free 512MB)
- **Backend**: Render.com or Railway.app (Free tier)
- **Frontend**: Vercel or Netlify (Free unlimited)

## Step-by-Step Deployment

---

## 1. Deploy Database (MongoDB Atlas)

### Setup MongoDB Atlas (5 minutes)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select region closest to you
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `wateradmin`
   - Password: Generate strong password (save it!)
   - Select "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://wateradmin:<password>@cluster0.xxxxx.mongodb.net/water-management?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

---

## 2. Deploy Backend (Render.com)

### Setup Render (10 minutes)

1. **Push Code to GitHub**
   ```bash
   cd d:/Devine/Devine-Water
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub account

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `Devine-Water` repository
   
4. **Configure Service**
   - **Name**: `water-management-api`
   - **Region**: Choose closest region
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Add Environment Variables**
   Click "Environment" tab and add:
   ```
   MONGO_URI=mongodb+srv://wateradmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/water-management?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_production_2024
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Copy your backend URL: `https://water-management-api.onrender.com`

7. **Seed Database** (One-time)
   - In Render dashboard, go to "Shell" tab
   - Run: `node seed.js`

---

## 3. Deploy Frontend (Vercel)

### Setup Vercel (5 minutes)

1. **Update API URL in Frontend**
   Edit `frontend/src/services/api.js`:
   ```javascript
   const API_URL = import.meta.env.PROD 
     ? 'https://water-management-api.onrender.com/api'
     : '/api';
   ```

   Edit `frontend/src/utils/socket.js`:
   ```javascript
   const socket = io(import.meta.env.PROD 
     ? 'https://water-management-api.onrender.com'
     : 'http://localhost:5000', {
     autoConnect: false
   });
   ```

2. **Push Changes**
   ```bash
   git add .
   git commit -m "Update API URLs for production"
   git push origin main
   ```

3. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub account

4. **Import Project**
   - Click "Add New..." → "Project"
   - Import `Devine-Water` repository
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - Click "Deploy"

5. **Your App is Live!**
   - Copy URL: `https://water-management.vercel.app`
   - Update backend `CLIENT_URL` env variable in Render

---

## Alternative Hosting Options

### Backend Alternatives

**Railway.app** (Free $5 credit/month)
- Similar to Render
- Dashboard: https://railway.app
- Better for hobby projects

**Heroku** (No longer free, $7/month)
- Most popular option
- Easy deployment

**DigitalOcean App Platform** ($5/month)
- More control
- Better performance

### Frontend Alternatives

**Netlify** (Free)
- Similar to Vercel
- Great build times
- Dashboard: https://netlify.com

**GitHub Pages** (Free)
- Simple static hosting
- Requires build setup

**Cloudflare Pages** (Free)
- Fast global CDN
- Unlimited bandwidth

---

## Environment Variables Summary

### Backend (.env in Render)
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_very_secret_key_change_this
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (Automatic in Vercel)
No environment variables needed - API URL is set in code based on production mode.

---

## Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with password saved
- [ ] Backend deployed and accessible
- [ ] Database seeded with initial users
- [ ] Frontend deployed and accessible
- [ ] Can login with demo credentials
- [ ] All API calls working
- [ ] Real-time features (Socket.IO) working
- [ ] CORS configured correctly
- [ ] SSL certificates active (automatic with Render/Vercel)

---

## Testing Your Deployment

1. **Visit Frontend URL**
   ```
   https://water-management.vercel.app
   ```

2. **Login with Demo Account**
   ```
   Username: admin
   Password: admin123
   ```

3. **Test Features**
   - Create new order (Customer panel)
   - View orders (Admin panel)
   - Record sale (Shopkeeper panel)
   - Check activity logs

---

## Costs

### Free Tier (Perfect for Testing)
- MongoDB Atlas: **FREE** (512MB)
- Render: **FREE** (512MB RAM, sleeps after 15min inactivity)
- Vercel: **FREE** (Unlimited bandwidth)
- **Total: $0/month**

### Paid Tier (Production Ready)
- MongoDB Atlas: **$0** (can upgrade to $9/month for 2GB)
- Render: **$7/month** (512MB RAM, no sleep)
- Vercel: **$0** (or $20/month for teams)
- **Total: $7-27/month**

---

## Common Issues & Solutions

### Backend Sleeps on Free Tier
**Problem**: Render free tier sleeps after 15 minutes of inactivity
**Solution**: 
- Upgrade to paid tier ($7/month)
- Or use a cron job to ping every 14 minutes

### CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**: Ensure `CLIENT_URL` in backend matches your frontend URL exactly

### Database Connection Failed
**Problem**: Can't connect to MongoDB
**Solution**: 
- Check IP whitelist includes 0.0.0.0/0
- Verify connection string is correct
- Check database user has correct permissions

### Build Failures
**Problem**: Deployment fails during build
**Solution**:
- Check all dependencies are in package.json
- Verify Node version compatibility
- Check build logs for specific errors

---

## Custom Domain (Optional)

### Add Your Own Domain

1. **Buy Domain** (Namecheap, GoDaddy, etc.)

2. **Frontend (Vercel)**
   - Go to project settings → Domains
   - Add your domain
   - Update DNS records as shown

3. **Backend (Render)**
   - Go to service settings → Custom Domain
   - Add api.yourdomain.com
   - Update DNS records

**Result**: 
- Frontend: `https://water.yourdomain.com`
- Backend: `https://api.yourdomain.com`

---

## Monitoring & Maintenance

### Logs
- **Render**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → View Function Logs

### Database Backup
- **MongoDB Atlas**: 
  - Automatic backups on paid tier
  - Manual export: Collections → Export Collection

### Updates
```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Auto-deploys to Render & Vercel
```

---

## Security Checklist

- [ ] Strong JWT_SECRET in production
- [ ] Database user has strong password
- [ ] HTTPS enabled (automatic)
- [ ] Environment variables not in code
- [ ] MongoDB IP whitelist configured
- [ ] CORS restricted to your domain
- [ ] Activity logs enabled

---

## Need Help?

- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
