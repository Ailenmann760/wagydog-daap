# Environment Variables Guide

## Backend Environment Variables

Create `backend/.env` file:

```env
# ================================================
# DATABASE
# ================================================
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/wagydog_analytics?schema=public"

# ================================================
# SERVER CONFIGURATION
# ================================================
PORT=4000
NODE_ENV=development

# ================================================
# JWT AUTHENTICATION
# ================================================
# Generate with: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# ================================================
# ADMIN DEFAULTS
# ================================================
ADMIN_DEFAULT_EMAIL="admin@wagydog.com"
ADMIN_DEFAULT_PASSWORD="changeme123"

# ================================================
# CORS
# ================================================
# Comma-separated list of allowed origins
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,https://your-frontend.netlify.app"

# ================================================
# EXTERNAL APIS (Optional)
# ================================================
# GeckoTerminal API (free tier available)
GECKOTERMINAL_API_KEY=""

# Moralis API (for blockchain data)
MORALIS_API_KEY=""

# Alchemy API (for RPC calls)
ALCHEMY_API_KEY=""

# ================================================
# CACHING
# ================================================
# Cache TTL in seconds
CACHE_TTL=300

# Redis URL (optional, uses in-memory cache if not provided)
REDIS_URL=""
```

---

## Frontend Environment Variables

Create `frontend/.env.local` file:

```env
# ================================================
# API CONFIGURATION
# ================================================
# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:4000"

# WebSocket URL
NEXT_PUBLIC_WS_URL="ws://localhost:4000"

# ================================================
# WEB3 CONFIGURATION
# ================================================
# WalletConnect Project ID
# Get from: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"

# ================================================
# FEATURE FLAGS
# ================================================
# Enable/disable trading features
NEXT_PUBLIC_ENABLE_TRADING=false

# Enable/disable analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# ================================================
# CHAIN CONFIGURATION
# ================================================
# Default chain (ethereum, bsc, polygon, arbitrum, solana)
NEXT_PUBLIC_DEFAULT_CHAIN="ethereum"
```

---

## Production Environment Variables

### Backend (Railway/Render)

```env
DATABASE_URL="<from database service>"
PORT=4000
NODE_ENV="production"
JWT_SECRET="<generate-strong-secret>"
JWT_EXPIRES_IN="7d"
ADMIN_DEFAULT_EMAIL="admin@yourdomain.com"
ADMIN_DEFAULT_PASSWORD="<strong-password>"
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
CACHE_TTL=300
```

### Frontend (Netlify)

```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_WS_URL="wss://api.yourdomain.com"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="<your-project-id>"
NEXT_PUBLIC_ENABLE_TRADING=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## Generating Secrets

### JWT Secret
```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Admin Password
Use a strong password generator or:
```bash
openssl rand -base64 16
```

---

## Security Best Practices

1. **Never commit .env files to Git**
   - Added to `.gitignore` by default
   - Use `.env.example` for templates

2. **Use environment-specific files**
   - Development: `.env` or `.env.local`
   - Production: Platform environment variables

3. **Rotate secrets regularly**
   - JWT secrets
   - API keys
   - Admin passwords

4. **Limit CORS origins**
   - Only allow your actual domains
   - Never use `*` in production

5. **Use HTTPS in production**
   - All API URLs should use `https://`
   - WebSocket URLs should use `wss://`

---

## Troubleshooting

### Backend won't connect to database
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Test connection: `psql "DATABASE_URL"`

### Frontend can't reach API
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check CORS configuration

### JWT authentication fails
- Verify `JWT_SECRET` matches on server
- Check token hasn't expired
- Ensure secret is properly encoded

### WalletConnect issues
- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is valid
- Check project settings at cloud.walletconnect.com
- Ensure allowed domains are configured

---

## Platform-Specific Setup

### Railway
1. Go to project → Variables
2. Click "New Variable"
3. Add each variable
4. Deploy to apply changes

### Render
1. Go to service → Environment
2. Add environment variables
3. Save to trigger redeploy

### Netlify
1. Go to site → Site settings → Environment variables
2. Click "Add a variable"
3. Add each variable
4. Trigger new deploy

---

## Quick Start Scripts

### Development
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your values
npm install
npm run dev
```

### Production Check
```bash
# Verify all required variables are set
node scripts/check-env.js
```

---

For more details, see DEPLOYMENT.md
