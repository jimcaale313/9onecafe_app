# 9ONE Café — Full Stack App

A complete loyalty + menu app for 9ONE Café, Hargeisa, Somaliland.

## Architecture

| Part | Tech | Port |
|------|------|------|
| Backend API | Node.js + Express + Prisma + PostgreSQL | 3000 |
| Customer PWA | React + Vite | 5173 |
| Staff Dashboard | React + Vite | 5174 |

---

## Quick Start (Development)

### 1. Start PostgreSQL

```bash
# Option A — Docker
docker-compose up -d postgres

# Option B — local Postgres, create a database named 9one_cafe
```

### 2. Set up the Backend

```bash
cd backend
cp .env.example .env
# Edit .env — fill in JWT_ACCESS_SECRET and JWT_REFRESH_SECRET with random strings

npm install
npx prisma migrate dev --name init
node prisma/seed.js   # seeds menu + creates admin/staff1 accounts
npm run dev
```

### 3. Start the Customer App

```bash
cd customer-app
npm install
npm run dev
# Opens at http://localhost:5173
```

### 4. Start the Staff Dashboard

```bash
cd staff-dashboard
npm install
npm run dev
# Opens at http://localhost:5174
```

---

## Environment Variables (backend/.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Random secret, min 32 chars |
| `JWT_REFRESH_SECRET` | Different random secret, min 32 chars |
| `JWT_ACCESS_EXPIRES` | e.g. `15m` |
| `JWT_REFRESH_EXPIRES` | e.g. `7d` |
| `PORT` | API port (default 3000) |
| `CORS_ORIGIN` | Comma-separated allowed origins |

---

## Default Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Staff | `staff1` | `staff123` |

**⚠️ Change these passwords immediately after first login in production.**

---

## Loyalty System

- Every coffee purchase = **1 stamp**
- After **6 stamps** → customer earns **1 free coffee**
- `current_stamps` resets to 0 after redemption
- `total_stamps` never resets (lifetime tracking)
- All events logged with staff name, timestamp, stamps before/after

---

## API Base URL

All endpoints: `http://localhost:3000/api`

Set in frontend with env var `VITE_API_URL`.

---

## Deployment

1. Build frontends: `npm run build` in each app directory
2. Serve `dist/` folders with nginx or a static host (Netlify, Vercel)
3. Deploy backend to a Node.js host (Railway, Render, Fly.io)
4. Set environment variables on the host
5. Run `npx prisma migrate deploy` on first deploy
6. Run seed script: `node prisma/seed.js`

---

## Docker (Full Stack)

```bash
# Copy and fill in .env at root level
cp backend/.env.example .env

docker-compose up -d
# Then exec into backend container and run seed:
docker-compose exec backend node prisma/seed.js
```
