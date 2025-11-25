# Wagydog Analytics - Quick Setup Guide

## Step 1: Database Setup

You need a PostgreSQL database. Choose one option:

### Option A: Free Cloud Database (Recommended for testing)
1. **Neon** (easiest): https://neon.tech/
   - Sign up free
   - Create new project
   - Copy connection string

2. **ElephantSQL**: https://www.elephantsql.com/
   - Sign up free
   - Create "Tiny Turtle" instance
   - Copy URL

### Option B: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Then create database:
createdb wagydog_analytics
```

## Step 2: Backend Environment Setup

Create `backend/.env` file with this content:

```env
# REQUIRED: Replace with your database URL
DATABASE_URL="postgresql://user:password@host:5432/wagydog_analytics?schema=public"

# Server config
PORT=4000
NODE_ENV=development

# JWT Secret - Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_SECRET="your-generated-secret-here"
JWT_EXPIRES_IN=7d

# Admin credentials
ADMIN_DEFAULT_EMAIL=admin@wagydog.com
ADMIN_DEFAULT_PASSWORD=changeme123

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Cache
CACHE_TTL=300
```

## Step 3: Frontend Environment Setup

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-optional
NEXT_PUBLIC_ENABLE_TRADING=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Step 4: Run Database Migrations

```bash
cd backend
npx prisma migrate dev
npm run prisma:seed
```

## Step 5: Start Servers

### Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Should see: "🚀 Server running on port 4000"
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Should see: "ready - started server on 0.0.0.0:3000"
```

## Step 6: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/health
- **Admin Dashboard**: http://localhost:3000/admin
  - Email: admin@wagydog.com
  - Password: changeme123

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Test connection: `psql "YOUR_DATABASE_URL"`

### "Module not found" errors
- Run `npm install` in both frontend and backend folders

### "Prisma migration failed"
- Delete `backend/prisma/migrations` folder
- Run `npx prisma migrate dev --name init` again

### Port already in use
- Change PORT in backend/.env to 4001
- Update NEXT_PUBLIC_API_URL in frontend/.env.local

## Quick Commands

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Reset database
cd backend
npx prisma migrate reset

# Check backend health
curl http://localhost:4000/api/health

# View database
cd backend
npx prisma studio
```

## Next Steps

1. ✅ Install dependencies (done)
2. 📝 Create .env files (follow Step 2 & 3)
3. 🗄️ Set up database (Step 4)
4. 🚀 Start servers (Step 5)
5. 🎉 Access app (Step 6)

Need help? Check README.md or DEPLOYMENT.md docs!
