# Render Deployment Configuration

## Environment Variables for Render

When deploying backend to Render.com, add these environment variables:

### Required Variables

```
DATABASE_URL
postgresql://postgres.tmbkojfmzxouwyuwstpd:MDDtB7Nwwd6n6Cif@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres

JWT_SECRET
secretfvoaSLGmrrFM3uQV6aZqMIZebrwT/eoC1GokK3B3QYfInzJtdjvOm5ZagmWgEtX4MA6C1fmiQPWuRN3AGogDTw==

NODE_ENV
production

PORT
5000

CLIENT_URL
https://your-app-name.vercel.app
```

### Optional Variables (if using Supabase Auth)

```
SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYmtvamZtenhvdXd5dXdzdHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDUyMjIsImV4cCI6MjA4MDc4MTIyMn0.FTywX9VEpNFwd-AaW5BE4uU_c9g7zQFFM-tsnSGvWbo

SUPABASE_URL
https://tmbkojfmzxouwyuwstpd.supabase.co
```

---

## Step-by-Step Render Deployment

### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub

### 2. Create Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository (`Devine-Water`)
- Click "Connect"

### 3. Configuration
- **Name**: `water-management-api` (or your choice)
- **Region**: Choose closest region (e.g., Singapore)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: 
  ```
  npm install && npx prisma generate
  ```
- **Start Command**: 
  ```
  npm start
  ```
- **Instance Type**: `Free`

### 4. Add Environment Variables
Click "Environment" tab and add each variable:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.tmbkojfmzxouwyuwstpd:MDDtB7Nwwd6n6Cif@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | `secretfvoaSLGmrrFM3uQV6aZqMIZebrwT/eoC1GokK3B3QYfInzJtdjvOm5ZagmWgEtX4MA6C1fmiQPWuRN3AGogDTw==` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CLIENT_URL` | `https://your-app-name.vercel.app` (update after deploying frontend) |

### 5. Deploy
- Click "Create Web Service"
- Wait 3-5 minutes for build
- Copy your backend URL: `https://water-management-api.onrender.com`

### 6. Initialize Database (One-Time)
After deployment succeeds:
1. Go to your service dashboard
2. Click "Shell" tab
3. Run these commands:
   ```bash
   npx prisma db push
   npm run seed
   ```

### 7. Update Frontend URL
After deploying frontend to Vercel:
1. Go to Render dashboard
2. Environment → Edit `CLIENT_URL`
3. Update to your Vercel URL
4. Service will auto-redeploy

---

## Troubleshooting

### Build Failed
- Check logs for specific error
- Ensure all dependencies in package.json
- Verify Node version compatibility

### Database Connection Failed
- Double-check DATABASE_URL is correct
- Ensure Supabase project is active
- Check if IP allowlist in Supabase allows all IPs (0.0.0.0/0)

### CORS Errors
- Ensure CLIENT_URL matches exact frontend URL (including https://)
- No trailing slash in URL

---

## Your Deployed Backend URL

After successful deployment, your API will be at:
```
https://water-management-api.onrender.com
```

Test it:
```
https://water-management-api.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Water Management API is running (Supabase/PostgreSQL)"
}
```
