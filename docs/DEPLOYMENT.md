# Deployment Guide - Wagydog Analytics

## Overview

This guide covers deploying the Wagydog Analytics platform:
- Frontend on **Netlify**
- Backend on **Railway** (or Render)
- Database on **Railway PostgreSQL**

---

## Prerequisites

- GitHub repository with the code
- Netlify account
- Railway account (or Render)
- Domain (optional)

---

## Part 1: Backend Deployment (Railway)

### Step 1: Create PostgreSQL Database

1. Go to https://railway.app
2. Create new project → "Provision PostgreSQL"
3. Copy the `DATABASE_URL` from the database settings

### Step 2: Deploy Backend Service

1. In Railway, click "New" → "GitHub Repo"
2. Select your repository
3. Railway will auto-detect Node.js

### Step 3: Configure Environment Variables

In Railway project settings, add:

```env
DATABASE_URL=<from PostgreSQL service>
PORT=4000
NODE_ENV=production
JWT_SECRET=<generate random 32+ char string>
JWT_EXPIRES_IN=7d
ADMIN_DEFAULT_EMAIL=admin@wagydog.com
ADMIN_DEFAULT_PASSWORD=<strong password>
ALLOWED_ORIGINS=https://your-frontend.netlify.app
```

### Step 4: Configure Build Settings

Add to Railway service settings:
- **Root Directory**: `backend`
- **Build Command**: `npm install && npx prisma generate`
- **Start Command**: `npx prisma migrate deploy && npm start`

### Step 5: Deploy

1. Railway will automatically deploy
2. Note your backend URL (e.g., `https://your-app.up.railway.app`)

### Step 6: Run Database Migrations

Railway should run migrations automatically, but if needed manually:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npm run prisma:seed
```

---

## Part 2: Frontend Deployment (Netlify)

### Step 1: Prepare Frontend

1. Update `frontend/next.config.js`:
```javascript
const nextConfig = {
  output: 'export',  // Static export for Netlify
  // ... rest of config
};
```

2. Create `frontend/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Step 2: Deploy to Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/out`

### Step 3: Environment Variables

In Netlify site settings → Environment variables, add:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your project id>
```

### Step 4: Deploy

1. Netlify will automatically deploy
2. Your site will be live at `https://your-site.netlify.app`

---

## Part 3: Custom Domain (Optional)

### For Frontend (Netlify)

1. Go to Netlify → Domain settings
2. Add custom domain
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

### For Backend (Railway)

1. Go to Railway project → Settings
2. Add custom domain
3. Update DNS with CNAME record
4. SSL certificate auto-provisioned

### Update Environment Variables

Update `ALLOWED_ORIGINS` in backend and `NEXT_PUBLIC_API_URL` in frontend with new domains.

---

## Part 4: Post-Deployment

### 1. Test Backend API

```bash
curl https://your-backend.railway.app/api/health
#Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test WebSocket

Use tool like https://www.websocket.org/echo.html
- Connect to: `wss://your-backend.railway.app`
- Should connect successfully

### 3. Test Frontend

1. Visit `https://your-frontend.netlify.app`
2. Check:
   - Homepage loads
   - Trending tokens appear
   - Search works
   - Token pages load
   - No console errors

### 4. Test Admin Dashboard

1. Visit `https://your-frontend.netlify.app/admin`
2. Login with admin credentials
3. Verify dashboard loads
4. Test token approval workflow

---

## Alternative: Deploy Backend on Render

### Steps for Render:

1. Create account at https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`
5. Add same environment variables as Railway
6. Create PostgreSQL database in Render
7. Link to web service

---

## Monitoring & Maintenance

### Check Logs

**Railway:**
```bash
railway logs
```

**Render:**
- Go to service → Logs tab

**Netlify:**
- Go to site → Deploys → View logs

### Database Backups

**Railway:**
- Automatic daily backups included
- Manual: Export from database service

**Render:**
- Set up automatic backups in settings

### Updates

To deploy updates:

1. Push to GitHub
2. Railway/Netlify auto-deploy from main branch
3. Monitor deployment logs

---

## Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is correct
- Verify all environment variables set
- Check build logs for Prisma errors

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### WebSocket won't connect
- Check `NEXT_PUBLIC_WS_URL` uses `wss://` not `ws://`
- Verify backend WebSocket server running
- Check firewall/proxy settings

### Database migrations fail
- Run manually: `npx prisma migrate deploy`
- Check database connection
- Verify Prisma schema is valid

---

## Security Checklist

- [ ] Changed default admin password
- [ ] JWT_SECRET is strong random string
- [ ] CORS configured for your domain only
- [ ] Database has strong password
- [ ] Environment variables never committed to Git
- [ ] HTTPS enabled on all services

---

## Cost Estimate

**Railway:**
- PostgreSQL: ~$5-10/month
- Backend service: ~$5/month
- Total: ~$10-15/month

**Netlify:**
- Free tier (100GB bandwidth)
- Pro if needed: $19/month

**Total Monthly Cost: ~$10-35/month**

---

For support, contact the development team or check the main README.
