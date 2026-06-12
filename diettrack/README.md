# DietTrack — Full-Stack Nutrition & Fitness Tracker

A production-ready, full-stack diet and nutrition tracking application built with modern technologies.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS · TanStack Query · Recharts |
| **Backend** | Node.js · Express · TypeScript |
| **Database** | PostgreSQL 16 · Prisma ORM v5 |
| **Auth** | JWT (access + refresh tokens) · bcrypt |
| **Deployment** | Frontend → Vercel · Backend → Render · DB → Neon |

---

## Features

### Core Tracking
- 🍽️ **Meal Logging** — Breakfast, Lunch, Dinner, Snack with food search and quantity control
- 🔥 **Calorie & Macro Tracking** — Protein, carbs, fat, fiber automatically calculated
- 💧 **Water Intake** — Quick-add buttons (250ml–1L) with progress visualization
- ⚖️ **Weight Tracking** — Daily logs with trend charts (30d / 90d / 1y)
- 📊 **Analytics** — Interactive charts for all nutrients over 7d / 30d / 90d

### Smart Features
- 🎯 **Auto-calculated targets** — BMR + TDEE using Mifflin-St Jeor formula
- 🏆 **Achievement Badges** — 8 unlockable milestones (streaks, goals, hydration)
- 🔥 **Streak System** — Separate streaks for meals, water, and weight
- 💡 **Smart Insights** — Auto-generated observations from your data
- 📅 **Weekly Summary Report** — 7-day breakdown with mini bar chart
- 🔍 **Global Search (⌘K)** — Search across your entire meal history + food library

### Data & Export
- 📥 **CSV Export** — Meals (with date range), weight log, water log
- 📚 **Food Library** — 60+ pre-loaded foods + unlimited custom foods

### UX
- 🌙 **Dark / Light theme** — Persisted to localStorage
- 📱 **Fully responsive** — Mobile-first sidebar with overlay
- ⚡ **Optimistic updates** — React Query cache management
- 🍞 **Toast notifications** — Success, error, info
- 💀 **Loading skeletons** — Every data state handled

---

## Project Structure

```
diettrack/
├── docker-compose.yml          ← Local dev (Postgres + API + frontend)
├── README.md
├── diettrack-backend/          ← Node.js / Express API
│   ├── prisma/
│   │   └── schema.prisma       ← Database schema (7 models)
│   ├── src/
│   │   ├── config/             ← Prisma client, env config
│   │   ├── controllers/        ← Route handlers (8 controllers)
│   │   ├── middlewares/        ← JWT auth, error handler, validator
│   │   ├── routes/             ← Express routers (8 route files)
│   │   ├── services/           ← Business logic (9 services)
│   │   └── utils/              ← JWT, BMR/TDEE, response helpers
│   ├── Dockerfile
│   └── render.yaml             ← One-click Render deployment
└── diettrack-frontend/         ← React / Vite SPA
    ├── src/
    │   ├── components/
    │   │   ├── layout/         ← AppLayout, Sidebar (with search + theme)
    │   │   └── ui/             ← ProgressBar, MacroPill, Modal, Badges,
    │   │                           ActivityTimeline, GlobalSearch,
    │   │                           WeeklyReport, ExportPanel, Skeleton…
    │   ├── contexts/           ← AuthContext, ThemeContext
    │   ├── pages/              ← 10 pages (Landing → Profile)
    │   ├── services/           ← API service layer (7 services)
    │   ├── types/              ← Shared TypeScript interfaces
    │   └── utils/              ← Formatters, labels, error helpers
    ├── Dockerfile              ← Production (nginx)
    ├── Dockerfile.dev          ← Development (Vite HMR)
    ├── nginx.conf
    └── vercel.json             ← SPA routing rewrite
```

---

## Quick Start (Local — Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

```bash
# Clone repo and navigate to root
git clone <your-repo-url> diettrack
cd diettrack

# Start all services (Postgres + API + frontend)
docker compose up --build

# In a separate terminal, seed the food database:
docker exec diettrack-api sh -c "cd /app && node -e \"require('./dist/prisma/seed')\""
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| Health check | http://localhost:3001/health |

---

## Quick Start (Local — Manual)

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or use the Docker Compose just for Postgres)

### 1. Start Postgres only
```bash
docker compose up postgres -d
```

### 2. Backend
```bash
cd diettrack-backend
cp .env.example .env
# DATABASE_URL is already set for local Docker Postgres

npm install
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed
npm run dev
# → API running on http://localhost:3001
```

### 3. Frontend
```bash
cd diettrack-frontend
npm install
npm run dev
# → App running on http://localhost:5173
```

---

## Environment Variables

### Backend (`diettrack-backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` \| `production` |
| `JWT_ACCESS_SECRET` | Access token secret (min 64 chars) | `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 64 chars) | `openssl rand -hex 64` |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL | `7d` |
| `BCRYPT_ROUNDS` | bcrypt salt rounds | `12` (lower for dev: `10`) |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

### Frontend (`diettrack-frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://your-api.onrender.com/api` |

---

## API Reference

### Authentication
```
POST /api/auth/register   { name, email, password, age, gender, height, weight, activityLevel, goal }
POST /api/auth/login      { email, password }
POST /api/auth/refresh    { refreshToken }
POST /api/auth/logout     { refreshToken }
```

### Protected Endpoints (require `Authorization: Bearer <token>`)
```
# Dashboard & Analytics
GET  /api/dashboard?date=YYYY-MM-DD
GET  /api/analytics?period=7d|30d|90d

# Foods
GET  /api/foods?search=chicken
POST /api/foods            { name, servingSize, calories, protein, carbs, fat, fiber?, sugar? }
PUT  /api/foods/:id
DEL  /api/foods/:id

# Meals
GET  /api/meals?date=YYYY-MM-DD
POST /api/meals            { mealType, date, items: [{foodId, quantity}], notes? }
PUT  /api/meals/:id
DEL  /api/meals/:id

# Weight
GET  /api/weights?days=30
POST /api/weights          { weight, date, notes? }
PUT  /api/weights/:id
DEL  /api/weights/:id

# Water
GET  /api/water?date=YYYY-MM-DD
POST /api/water            { amount, date }
PUT  /api/water/:id
DEL  /api/water/:id

# Profile
GET  /api/profile
PUT  /api/profile          { name?, age?, gender?, height?, weight?, activityLevel?, goal?, waterGoal?, newPassword?, currentPassword? }

# Export & Search
GET  /api/export/meals?from=YYYY-MM-DD&to=YYYY-MM-DD    → CSV download
GET  /api/export/weights                                 → CSV download
GET  /api/export/water                                   → CSV download
GET  /api/export-weekly                                  → JSON weekly summary
GET  /api/search?q=chicken                               → search meal history + foods
GET  /api/activity?limit=15                              → recent activity timeline
```

### Response Format
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

---

## Deployment

### Backend → Render

1. Push `diettrack-backend/` to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect the repo — `render.yaml` auto-configures build + start commands
4. Add environment variables (see table above)
5. Deploy

`render.yaml` is already configured:
```yaml
buildCommand: npm install && npx prisma generate && npm run build
startCommand: npx prisma migrate deploy && npm start
```

### Frontend → Vercel

1. Push `diettrack-frontend/` to a GitHub repo  
2. Import on [vercel.com](https://vercel.com) — zero config needed
3. Add environment variable: `VITE_API_URL` = your Render backend URL + `/api`
4. Deploy — `vercel.json` handles SPA routing

### Database → Neon

1. Create a project on [neon.tech](https://neon.tech)
2. Copy the connection string (pooled) to `DATABASE_URL`
3. Run migrations on first deploy: `npx prisma migrate deploy`
4. Seed foods: `npm run prisma:seed`

---

## Nutrition Calculation

Uses the **Mifflin-St Jeor** BMR equation:

```
Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
Female: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
```

**TDEE** = BMR × activity multiplier:

| Level | Multiplier |
|-------|-----------|
| Sedentary | 1.2 |
| Lightly Active | 1.375 |
| Moderately Active | 1.55 |
| Very Active | 1.725 |
| Extremely Active | 1.9 |

**Calorie targets by goal:**

| Goal | Adjustment |
|------|-----------|
| Weight Loss | TDEE − 500 kcal |
| Maintenance | TDEE |
| Weight Gain | TDEE + 300 kcal |
| Muscle Gain | TDEE + 200 kcal |

**Macro splits:**

| Goal | Protein | Fat | Carbs |
|------|---------|-----|-------|
| Weight Loss | 35% | 30% | 35% |
| Maintenance | 25% | 30% | 45% |
| Weight Gain | 25% | 30% | 45% |
| Muscle Gain | 30% | 25% | 45% |

---

## Security

- JWT access tokens (15 min) + refresh tokens (7 days, stored in DB)
- Token rotation on every refresh
- bcrypt password hashing (12 rounds in production)
- Helmet HTTP headers
- CORS restricted to configured origin
- Rate limiting: 200 req/15min general · 20 req/15min auth endpoints
- Input validation on all mutation endpoints (express-validator)
- Prisma ORM prevents SQL injection by design
- Sensitive env vars never committed (`.env.example` provided)

---

## Database Schema

```
User ──┬── Meal ── MealItem ── Food
       ├── WeightLog
       ├── WaterLog
       ├── Streak
       └── RefreshToken
```

7 Prisma models · 4 enums (Gender, ActivityLevel, Goal, MealType)

---

## License

MIT — use freely for personal or commercial projects.
