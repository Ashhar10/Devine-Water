# Vercel Deployment Configuration

## Frontend Deployment to Vercel

### Prerequisites
- Render backend deployed and running
- Backend URL copied (e.g., `https://water-management-api.onrender.com`)

---

## Environment Variables for Vercel

Vercel deployment **does NOT need environment variables** for the frontend.

The API URL is automatically detected based on production/development mode in the code.

---

## Update Frontend Code (Before Deploying)

The frontend is already configured to work with your backend. The API URLs are set in:

### `frontend/src/services/api.js`
Already configured to use:
- **Development**: `http://localhost:5000/api` (via Vite proxy)
- **Production**: Detected automatically from backend URL

### `frontend/src/utils/socket.js`
Already configured for Socket.IO connection

---

## Step-by-Step Vercel Deployment

### 1. Update API URLs (If Needed)

After deploying backend to Render, update the production URL:

**Edit `frontend/src/services/api.js`:**
```javascript
const API_URL = import.meta.env.PROD 
  ? 'https://water-management-api.onrender.com/api'  // Your Render URL
  : '/api';
```

**Edit `frontend/src/utils/socket.js`:**
```javascript
const socket = io(import.meta.env.PROD 
  ? 'https://water-management-api.onrender.com'  // Your Render URL
  : 'http://localhost:5000', {
  autoConnect: false
});
```

### 2. Commit Changes
```bash
git add .
git commit -m "Update API URLs for production"
git push origin main
```

### 3. Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub

### 4. Import Project
- Click "Add New..." → "Project"
- Import `Devine-Water` repository
- Click "Import"

### 5. Configure Project
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 6. Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your app will be live!

### 7. Copy Frontend URL
Your app will be at:
```
https://devine-water.vercel.app
```
Or custom name you chose.

### 8. Update Backend CORS
Go back to Render and update `CLIENT_URL`:
1. Render Dashboard → Your Service
2. Environment → Edit `CLIENT_URL`
3. Change to: `https://devine-water.vercel.app`
4. Save (auto-redeploys)

---

## Vercel Configuration File (Optional)

Create `vercel.json` in `frontend/` directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## Custom Domain (Optional)

### Add Custom Domain
1. Go to Project Settings → Domains
2. Add your domain (e.g., `water-management.com`)
3. Update DNS records as instructed
4. Wait for DNS propagation (5-15 minutes)

### Update Backend
Update `CLIENT_URL` in Render to your custom domain.

---

## Environment Detection

The frontend automatically detects environment:

**Development** (`npm run dev`):
- API: `http://localhost:5000/api`
- Socket: `http://localhost:5000`

**Production** (Vercel):
- API: `https://your-backend.onrender.com/api`
- Socket: `https://your-backend.onrender.com`

---

## Testing Deployment

### 1. Visit Your Vercel URL
```
https://devine-water.vercel.app
```

### 2. Test Login
- Username: `admin`
- Password: `admin123`

### 3. Check Features
- ✅ Dashboard loads
- ✅ Orders display
- ✅ Finance reports work
- ✅ Real-time updates work

### 4. Check Browser Console
Should show:
```
📱 Client connected: [socket-id]
```

---

## Redeployment

### Automatic (Recommended)
- Push to GitHub main branch
- Vercel auto-deploys

### Manual
- Vercel Dashboard → Deployments → "Redeploy"

---

## Troubleshooting

### API Calls Fail
**Problem**: CORS errors or 404  
**Solution**: 
- Check backend `CLIENT_URL` matches frontend URL exactly
- Ensure backend is running on Render
- Check API_URL in `services/api.js`

### Socket.IO Not Connecting
**Problem**: WebSocket connection fails  
**Solution**:
- Check socket URL in `utils/socket.js`
- Ensure backend supports WebSocket (Render does)
- Check browser console for errors

### Blank Page After Deploy
**Problem**: White screen  
**Solution**:
- Check Vercel build logs
- Ensure `dist` folder is generated
- Check for build errors

### Routes Not Working
**Problem**: Page refresh shows 404  
**Solution**:
- Add `vercel.json` with route configuration (see above)

---

## Production URLs

After deployment:

**Frontend (Vercel):**
```
https://devine-water.vercel.app
```

**Backend (Render):**
```
https://water-management-api.onrender.com
```

**Database (Supabase):**
```
https://tmbkojfmzxouwyuwstpd.supabase.co
```

---

## Your Complete Stack

✅ **Database**: Supabase (PostgreSQL) - FREE 500MB  
✅ **Backend**: Render.com - FREE (sleeps after 15min)  
✅ **Frontend**: Vercel - FREE unlimited  
✅ **Total Cost**: $0/month  

🎉 **Your app is now live and accessible worldwide!**
