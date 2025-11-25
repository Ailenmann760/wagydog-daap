# Getting Started - Wagydog Crypto Analytics Platform

## ✅ Current Status

Your application is **fully functional** and running locally!

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Admin Dashboard**: http://localhost:3000/admin

## 🎯 What's Been Built

### Complete Full-Stack Platform
- ✅ Next.js 14 frontend with Wagydog branding
- ✅ Express backend with REST API
- ✅ SQLite database (seeded with sample data)
- ✅ WebSocket real-time streaming
- ✅ Admin dashboard with authentication
- ✅ 60+ files, ~6,800 lines of code

### Features Implemented
- Market dashboard (trending tokens, top movers, new pairs)
- Token search with autocomplete
- Token detail pages
- Chain selector (Ethereum, BSC, Polygon, etc.)
- Admin authentication & token management
- Real-time WebSocket connections
- Wallet integration foundation

## 🚀 Daily Development Workflow

### Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access the Application
- **Homepage**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin
  - Email: `admin@wagydog.com`
  - Password: `changeme123`

## 📝 Important Files

### Environment Files
- `backend/.env` - Backend configuration (✅ Created)
- `frontend/.env.local` - Frontend configuration (✅ Created)

### Database
- `backend/dev.db` - SQLite database (✅ Seeded)
- `backend/prisma/schema.prisma` - Database schema

### Key Directories
- `frontend/src/app/` - Next.js pages
- `frontend/src/components/` - React components
- `backend/src/routes/` - API endpoints
- `backend/src/websocket/` - WebSocket server

## 🔧 Common Tasks

### Reset Database
```bash
cd backend
npx prisma db push --force-reset
npm run prisma:seed
```

### View Database
```bash
cd backend
npx prisma studio
```

### Check API Health
```bash
curl http://localhost:4000/api/health
```

### Test WebSocket
Open browser console at http://localhost:3000 and check for:
```
Connected to WebSocket
```

## 📦 Deployment Notes

### Current Setup
- **Database**: SQLite (local file-based)
- **Dependencies**: Installed and working in dev mode

### For Production Deployment
1. **Frontend (Netlify)**:
   - Deploy the `frontend` directory
   - Set environment variables:
     - `NEXT_PUBLIC_API_URL=https://your-backend-domain.com`
     - `NEXT_PUBLIC_WS_URL=wss://your-backend-domain.com`
   
2. **Backend (Railway/Render)**:
   - Deploy the `backend` directory
   - Switch to PostgreSQL for production
   - Set environment variables from `backend/.env.example`

3. **See Full Guide**: `docs/DEPLOYMENT.md`

## 🐛 Troubleshooting

### Frontend Won't Start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

### Backend Won't Start
```bash
cd backend
npx prisma generate
npm run dev
```

### Database Issues
```bash
cd backend
rm dev.db
npx prisma db push
npm run prisma:seed
```

### Port Already in Use
```bash
# Change PORT in backend/.env to 4001
# Update NEXT_PUBLIC_API_URL in frontend/.env.local
```

## 📚 Documentation

- `README.md` - Project overview & features
- `docs/DEPLOYMENT.md` - Production deployment guide
- `docs/ENV_VARIABLES.md` - Environment configuration
- `walkthrough.md` - Complete project walkthrough

## 🎨 Customization

### Update Branding
- Colors: `frontend/tailwind.config.js`
- Logo: `frontend/public/`
- Styles: `frontend/src/app/globals.css`

### Add Features
- New pages: `frontend/src/app/[pagename]/page.tsx`
- New API routes: `backend/src/routes/`
- New database models: `backend/prisma/schema.prisma`

## 🔐 Security Reminder

**Before deploying to production:**
1. Change admin password (`backend/.env` → `ADMIN_DEFAULT_PASSWORD`)
2. Generate new JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
3. Update CORS origins (`backend/.env` → `ALLOWED_ORIGINS`)
4. Use PostgreSQL instead of SQLite
5. Enable HTTPS for all connections

## ✨ Next Steps

1. **Test the application** - Browse to http://localhost:3000
2. **Customize branding** - Update colors, logo, content
3. **Add more features** - Build on the existing foundation
4. **Deploy to production** - Follow `docs/DEPLOYMENT.md`

---

**Questions?** Check the comprehensive documentation in the `docs/` folder!
