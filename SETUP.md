# Quick Setup - Wagydog Analytics Platform

## ✅ Status
- Backend dependencies: **Installed** (160 packages)
- Frontend dependencies: **Installing...**

## 🚀 Next Steps

### 1. Database Setup (Choose One)

**Option A: Free Cloud Database (Easiest)**
- Go to https://neon.tech/
- Sign up & create project
- Copy the connection string

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL, then:
createdb wagydog_analytics
```

### 2. Create Environment Files

**Backend** - Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/wagydog_analytics"
PORT=4000
NODE_ENV=development
JWT_SECRET="run: node -e console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_EXPIRES_IN=7d
ADMIN_DEFAULT_EMAIL=admin@wagydog.com
ADMIN_DEFAULT_PASSWORD=changeme123
ALLOWED_ORIGINS=http://localhost:3000
CACHE_TTL=300
```

**Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### 3. Initialize Database
```bash
cd backend
npx prisma migrate dev
npm run prisma:seed
```

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access Application
- **App**: http://localhost:3000
- **Admin**: http://localhost:3000/admin (admin@wagydog.com / changeme123)
- **API**: http://localhost:4000/api/health

## 📝 Important Notes

- Change admin password after first login!
- Frontend uses static export for Netlify
- Mock data used until API keys added
- See README.md for full documentation

## 🔧 Troubleshooting

**Database connection error?**
- Check DATABASE_URL format is correct

**Port in use?**
- Change PORT in backend/.env

**Module errors?**
- Run `npm install` again

Ready to deploy? See `docs/DEPLOYMENT.md`!
