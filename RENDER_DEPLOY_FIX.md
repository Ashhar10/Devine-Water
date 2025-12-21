# Render Backend Deployment Fix

## The Issue
Render is looking for `package.json` in the root directory (`/opt/render/project/src/`), but it's actually in the `backend` folder.

## ✅ Solution: Configure Render Settings

You need to set the **Root Directory** in your Render web service settings:

### Step-by-Step Instructions:

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com

2. **Select Your Web Service**
   - Click on your "Devine Water Backend" service (or whatever you named it)

3. **Go to Settings**
   - Click on "Settings" in the left sidebar

4. **Set Root Directory**
   - Scroll down to find **"Root Directory"**
   - Click "Edit"
   - Enter: `backend`
   - Click "Save Changes"

5. **Configure Build & Start Commands**
   
   Make sure these are set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: Leave default (or set to 18+ if needed)

6. **Set Environment Variables**
   
   Go to "Environment" tab and add:
   ```
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=your_random_secret_key_here
   ALLOW_ORIGINS=https://your-app.vercel.app
   NODE_ENV=production
   PORT=5000
   ```

7. **Trigger Manual Deploy**
   - Go back to "Deploys" tab
   - Click "Manual Deploy" → "Deploy latest commit"

## Environment Variables Details

### DATABASE_URL
Get from Supabase:
1. Go to your Supabase project
2. Settings → Database
3. Copy the "Connection string" (URI format)
4. Should look like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### JWT_SECRET
Generate a secure random string:
```bash
# On Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use any random string generator
# Example: MySecureJWT$ecret2024!K3y
```

### ALLOW_ORIGINS
Your Vercel frontend URL:
```
https://your-app-name.vercel.app
```

## After Deployment Succeeds

1. **Copy your Render backend URL** (e.g., `https://devine-water-api.onrender.com`)

2. **Update Vercel environment variable**:
   - Go to Vercel → Settings → Environment Variables
   - Edit `VITE_API_URL` to: `https://your-render-url.onrender.com/api`
   - Redeploy frontend

3. **Test the full stack**:
   - Visit your Vercel URL
   - Try logging in with demo credentials
   - Check if API calls work

## Common Issues

### Issue: "Free instance will spin down with inactivity"
- ✅ This is normal for free tier
- First request after inactivity will take ~30 seconds
- Consider upgrading if you need instant response

### Issue: Build still fails
- Check that `backend/package.json` exists in your GitHub repo
- Verify Root Directory is set to `backend`
- Check build logs for specific errors

### Issue: Database connection fails
- Verify DATABASE_URL is correct
- Make sure you copied the full connection string from Supabase
- Check that password in connection string is URL-encoded

## Testing Your Backend

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-app.onrender.com/health

# API info
curl https://your-app.onrender.com/api

# Login test (should return JWT token)
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@devinewater.com","password":"admin123"}'
```

## Next Steps

After backend is working:
1. Update frontend env var with backend URL
2. Redeploy frontend
3. Test the complete application end-to-end
4. Set up your database in Supabase (run schema.sql and seed.sql)

---

**Need Help?** Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete deployment instructions.
