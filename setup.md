# Setup Instructions

## Step 1: Install Dependencies

```powershell
# Install pnpm globally if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

## Step 2: Start Docker Database

**Make sure Docker Desktop is running first!**

```powershell
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker ps
```

You should see:
- `clubos-postgres` on port 5432
- `clubos-redis` on port 6379

## Step 3: Run Database Migrations

```powershell
# Generate Prisma client
pnpm db:generate

# Create database tables
pnpm db:migrate
```

When prompted for migration name, type: `init`

## Step 4: Start Development Servers

```powershell
# Start both backend and frontend
pnpm dev
```

This will start:
- **Backend API:** http://localhost:3001
- **Frontend:** http://localhost:3000

## Verification

Once running, test the API:

```powershell
# Test backend is running
curl http://localhost:3001/health
```

Then open your browser to http://localhost:3000

## Troubleshooting

### Docker not running
```powershell
# Start Docker Desktop manually, then:
docker-compose up -d
```

### Port already in use
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Prisma client not found
```powershell
cd apps/backend
pnpm prisma generate
```

### Database connection failed
```powershell
# Restart database
docker-compose down
docker-compose up -d

# Wait 5 seconds, then migrate
pnpm db:migrate
```

## Next Steps

Once everything is running, you can:
1. Visit http://localhost:3000
2. Register a new account
3. Create an organization
4. See it on your dashboard

---

**Current vertical slice:** Auth → Create Org → Dashboard (full stack working)
