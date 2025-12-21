# Backend Not Starting - Troubleshooting Guide

## Problem
Backend returns "Not Found" and CORS errors because the server isn't running.

## Step-by-Step Fix

### 1. Check Render Deployment Status

Go to your Render dashboard:
- **Look for the status indicator** - it should say "Live" in green
- If it says "Build failed" or "Deploy failed" - click on it to see logs

### 2. Check Render Logs

1. Click on your backend service
2. Click **"Logs"** tab
3. Scroll to the bottom
4. Look for:
   - ✅ `🚀 Server running on port 5000` - **GOOD!**
   - ❌ `Error:` or crash - **PROBLEM!**

### 3. Common Issues & Fixes

#### Issue A: Database Connection Error
**Symptoms:** Logs show `❌ Unexpected database error` or connection refused

**Fix:**
1. Go to Supabase → Settings → Database
2. Copy the **Connection String (URI)**
3. It should look like:
   ```
   postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. In Render → Environment → Edit `DATABASE_URL`
5. Paste the FULL connection string
6. Save and redeploy

#### Issue B: Missing Environment Variables
**Symptoms:** Server crashes immediately

**Fix:** Make sure you have ALL of these in Render Environment:
```
DATABASE_URL=postgresql://...full.connection.string...
JWT_SECRET=any-random-string-here
ALLOW_ORIGINS=https://devine-water.vercel.app
NODE_ENV=production
PORT=5000
```

#### Issue C: Port Already in Use
**Symptoms:** `EADDRINUSE` error

**Fix:** Remove the `PORT` environment variable entirely - let Render assign it automatically

#### Issue D: Module Not Found
**Symptoms:** `Cannot find module` errors

**Fix:**
1. Check that `package.json` exists in `backend/` folder
2. Verify Root Directory is set to `backend`
3. Try manual redeploy

### 4. Force Redeploy

1. Go to Render → Your service
2. Click **"Manual Deploy"**
3. Select **"Clear build cache & deploy"**
4. Wait 3-5 minutes
5. Check logs again

### 5. Test Backend

Once deployed successfully, test these URLs in browser:

**Health Check:**
```
https://devine-water.onrender.com/health
```
Should return: `{"status":"healthy","timestamp":"..."}`

**API Info:**
```
https://devine-water.onrender.com/api
```
Should return API endpoints list

**If both work** → Backend is running! The CORS issue will be fixed next.

### 6. Fix CORS (After Backend Runs)

In Render Environment:
- `ALLOW_ORIGINS` must be EXACTLY: `https://devine-water.vercel.app`
- No trailing slash
- Must include `https://`

Then redeploy and test login.

## Still Not Working?

### Get Diagnostic Info:

1. **Render Logs** - Screenshot the last 30 lines
2. **Environment Variables** - Screenshot (hide sensitive values)
3. **Service Status** - What does it say? (Live/Failed/Building)

Share these and I'll help debug further!
