# Wagydog Crypto Analytics Platform

Complete Dextools/Dexscreener-style crypto analytics platform with real-time data, WebSocket streaming, and comprehensive admin dashboard.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) - Deployed on Netlify
- **Backend**: Node.js + Express + Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: WebSocket for live price/trade updates
- **Styling**: TailwindCSS with Wagydog brand theming

## 📁 Project Structure

```
wagydog-daap/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/      # App Router pages
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── backend/          # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── websocket/
│   │   └── middleware/
│   ├── prisma/
│   └── package.json
├── shared/          # Shared types (future)
└── docs/           # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# Run Prisma migrations
npx prisma migrate dev

# Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

Backend runs on `http://localhost:4000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with API URLs

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🔑 Features

### User Features
- ✅ Market Overview Dashboard
- ✅ Trending Tokens (real-time updates)
- ✅ Top Gainers/Losers
- ✅ New Pairs
- ✅ Token Search with Autocomplete
- ✅ Chain Selector (Ethereum, BSC, Polygon, Arbitrum, Solana)
- ✅ Token Detail Pages with comprehensive stats
- ✅ Trading Pairs Information
- ✅ Wallet Integration Ready
- ✅ Watchlist Support

### Admin Dashboard
- ✅ Admin Authentication (JWT)
- ✅ Dashboard Analytics
- ✅ Token Approval Workflow
- ✅ Feature/Unfeature Tokens
- ✅ Edit Token Metadata
- ✅ User Management
- ✅ Activity Logs
- ✅ Site Analytics

### Real-Time Features
- ✅ WebSocket price updates (every 5s)
- ✅ Live trade streaming
- ✅ Trending token updates
- ✅ Auto-reconnection

## 📡 API Endpoints

### Public Endpoints
```
GET  /api/tokens/trending
GET  /api/tokens/new
GET  /api/tokens/search?q=
GET  /api/tokens/:address
GET  /api/tokens/lists/gainers
GET  /api/tokens/lists/losers
GET  /api/pairs/trending
GET  /api/pairs/:pairAddress
GET  /api/pairs/:pairAddress/chart
GET  /api/pairs/:pairAddress/trades
```

### Admin Endpoints (Requires Auth)
```
POST /api/admin/login
GET  /api/admin/dashboard
GET  /api/admin/tokens/pending
POST /api/admin/tokens/:id/approve
POST /api/admin/tokens/:id/feature
PUT  /api/admin/tokens/:id
DELETE /api/admin/tokens/:id
GET  /api/admin/analytics
GET  /api/admin/users
GET  /api/admin/logs
```

## 🎨 Design System

### Colors (Wagydog Brand)
- Primary: `#7c5cff` (Purple)
- Accent: `#4be1c3` (Teal)
- Background: `#04040d` (Dark)
- Surface: `rgba(20, 24, 38, 0.85)` (Glass)

### Components
- Glass-morphism surfaces with backdrop blur
- Custom scrollbars
- Responsive grid layouts
- Mobile-first design

## 🔐 Default Admin Credentials

```
Email: admin@wagydog.com
Password: changeme123
```

**⚠️ Change these immediately in production!**

## 🌐 Deployment

### Frontend (Netlify)

1. Connect repository to Netlify
2. Build settings:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/out`
3. Environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
   - `NEXT_PUBLIC_WS_URL`: Your WebSocket URL

### Backend (Railway/Render)

1. Create new service
2. Connect repository
3. Environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Random secret key
   - `ADMIN_DEFAULT_EMAIL`: Admin email
   - `ADMIN_DEFAULT_PASSWORD`: Admin password
4. Run migrations: `npx prisma migrate deploy`
5. Seed database: `npm run prisma:seed`

## 📊 Database Schema

- **User**: Authentication and roles
- **Token**: Token metadata and approval status
- **Pair**: Trading pair data
- **TrendingToken**: Trending rankings
- **Trade**: Historical trades
- **ChartData**: OHLCV candles
- **WatchList**: User watchlists
- **AdminLog**: Admin activity tracking
- **AdCampaign**: Promotional campaigns
- **SiteAnalytics**: Platform analytics

## 🛠️ Development

### Adding External APIs

Edit `backend/src/services/externalApis.js` to integrate:
- GeckoTerminal API
- Dexscreener API
- Moralis
- Alchemy
- QuickNode

Currently uses mock data for demo purposes.

### Customizing Branding

Edit `frontend/tailwind.config.js` to change colors and theme.

## 📝 License

MIT License - Free to use and modify.

## 🤝 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for the Wagydog community**
