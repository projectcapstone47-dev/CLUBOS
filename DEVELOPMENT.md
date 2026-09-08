# Club OS - Development Guide

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### 1. Install Dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 2. Set Up Environment

```bash
# Backend
cd apps/backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.local.example .env.local
```

### 3. Start Database

```bash
# From project root
docker-compose up -d
```

### 4. Run Migrations

```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Start Development Servers

```bash
# Start both backend and frontend
pnpm dev

# Or individually:
pnpm dev:backend  # http://localhost:3001
pnpm dev:frontend # http://localhost:3000
```

## Project Structure

```
clubos/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   └── prisma/
│   └── frontend/         # Next.js app
│       └── src/
├── docs/                 # Architecture docs
├── database/            # SQL schemas
└── docker-compose.yml   # Local services
```

## Current Vertical Slice

**What works:**
- ✅ User registration
- ✅ User login (JWT)
- ✅ Create organization
- ✅ List organizations
- ✅ Protected routes

**Entities:**
- `users` (2 records)
- `organizations` (1 record)

**API Endpoints:**
- `POST /auth/register`
- `POST /auth/login`
- `POST /organizations`
- `GET /organizations`

**Pages:**
- `/` - Login
- `/register` - Sign up
- `/dashboard` - Create & list organizations

## Development Workflow

### Making Changes

1. **Backend changes:** Edit files in `apps/backend/src/`
2. **Frontend changes:** Edit files in `apps/frontend/src/`
3. **Database changes:** Update `apps/backend/prisma/schema.prisma`

### Database Changes

```bash
# After modifying schema.prisma
pnpm db:migrate

# View database
pnpm db:studio
```

### Testing the API

```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create organization (needs token from login)
curl -X POST http://localhost:3001/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Coding Club","slug":"coding-club","description":"Learn to code"}'
```

## Next Vertical Slices

After this works, we'll add one slice at a time:

1. **Membership** - Join/leave organizations
2. **Events** - Create and list events
3. **Registration** - Register for events
4. **Attendance** - Mark attendance
5. **Tasks** - Assign tasks to events

Each slice will be fully working before moving to the next.

## Troubleshooting

### Database connection failed
```bash
docker-compose down
docker-compose up -d
pnpm db:migrate
```

### Port already in use
```bash
# Change ports in:
# - apps/backend/.env (PORT=3001)
# - apps/frontend/.env.local (NEXT_PUBLIC_API_URL)
```

### Prisma client not found
```bash
pnpm db:generate
```

## Architecture Decisions

- **Monorepo:** pnpm workspaces for easy development
- **Backend:** NestJS (production-ready, scalable)
- **Frontend:** Next.js 14 (App Router, SSR-ready)
- **Database:** PostgreSQL (ACID, reliable)
- **Auth:** JWT (stateless, scalable)
- **Styling:** Tailwind CSS (utility-first)

## Commands Reference

```bash
# Development
pnpm dev              # Start everything
pnpm dev:backend      # Backend only
pnpm dev:frontend     # Frontend only

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio

# Production
pnpm build            # Build both apps
```

## Git Workflow

```bash
# After completing a vertical slice:
git add .
git commit -m "feat: add [feature name]"
git push
```

## Need Help?

- Backend issues: Check `apps/backend/README.md`
- Frontend issues: Check `apps/frontend/README.md`
- Architecture: See `docs/ARCHITECTURE.md`
