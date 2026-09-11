# 🚀 Run Club OS Application

## Quick Start (Copy-Paste These Commands)

### Step 1: Fix Prisma Version & Install Dependencies

```powershell
# Navigate to backend
cd C:\LOCAL\Aaryan\Project_on\CLUBOS\apps\backend

# Remove node_modules and package-lock
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Install correct versions
npm install

# Verify Prisma version (should be 5.x)
npx prisma --version
```

---

### Step 2: Start Database

```powershell
# Navigate to project root
cd C:\LOCAL\Aaryan\Project_on\CLUBOS

# Start Docker containers
docker-compose up -d

# Verify containers are running
docker ps
```

You should see:
- `clubos-postgres` on port 5432
- `clubos-redis` on port 6379

---

### Step 3: Run Database Migrations

```powershell
# Navigate to backend
cd C:\LOCAL\Aaryan\Project_on\CLUBOS\apps\backend

# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to see tables
npx prisma studio
```

---

### Step 4: Start Backend Server

```powershell
# In backend directory
npm run dev
```

✅ **Backend should start on:** http://localhost:3001

**Look for:**
```
✅ Database connected
🚀 Backend running on http://localhost:3001
```

---

### Step 5: Start Frontend (New Terminal)

```powershell
# Open NEW PowerShell terminal
cd C:\LOCAL\Aaryan\Project_on\CLUBOS\apps\frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ **Frontend should start on:** http://localhost:3000

---

## 🧪 Test the Application

### 1. Open Browser
Navigate to: **http://localhost:3000**

### 2. Register Account
- Click "Sign up"
- Email: `test@example.com`
- Password: `password123`
- Click "Create Account"

### 3. Create Organization
- You'll land on dashboard
- Click "+ Create Organization"
- Name: "Coding Club"
- Slug: `coding-club` (auto-generated)
- Description: "Learn programming together"
- Click "Create Organization"

### 4. Test Membership (Register 2nd User)
**Option A: Use incognito/private window**
- Register another account: `user2@example.com`
- See "Coding Club" on dashboard
- Click "Join" button
- Click "Members" link
- See both users listed!

**Option B: Logout and login as different user**
- Click "Logout"
- Register new account
- Join the organization

---

## 🐛 Troubleshooting

### Issue: "npx: command not found"
```powershell
npm install -g npm@latest
```

### Issue: Docker not running
```powershell
# Start Docker Desktop manually, then:
docker-compose up -d
```

### Issue: Port 3001 already in use
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Port 3000 already in use
```powershell
# Find and kill
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Database connection failed
```powershell
# Restart database
docker-compose down
docker-compose up -d

# Wait 5 seconds, then migrate
timeout /t 5
npx prisma migrate dev
```

### Issue: Prisma Client not found
```powershell
cd C:\LOCAL\Aaryan\Project_on\CLUBOS\apps\backend
npx prisma generate
```

---

## ✅ Success Indicators

### Backend Running:
```
[Nest] 12345  - 09/08/2026, 11:30:00 PM     LOG ✅ Database connected
[Nest] 12345  - 09/08/2026, 11:30:00 PM     LOG 🚀 Backend running on http://localhost:3001
```

### Frontend Running:
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000

 ✓ Ready in 2.5s
```

### Database Tables Created:
```
✓ users
✓ organizations  
✓ memberships
```

---

## 📊 API Endpoints to Test

### Test Auth
```powershell
# Register
curl -X POST http://localhost:3001/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"api@test.com","password":"password123"}'

# Login (save the token)
curl -X POST http://localhost:3001/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"api@test.com","password":"password123"}'
```

### Test Organizations (use token from login)
```powershell
$token = "YOUR_JWT_TOKEN_HERE"

# List orgs
curl -H "Authorization: Bearer $token" http://localhost:3001/organizations

# Create org
curl -X POST http://localhost:3001/organizations `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"name":"API Club","slug":"api-club","description":"Created via API"}'
```

---

## 🎯 Complete Test Flow

1. ✅ Backend starts successfully
2. ✅ Frontend starts successfully  
3. ✅ Register user account
4. ✅ Login works
5. ✅ Create organization
6. ✅ See organization on dashboard
7. ✅ Register 2nd user
8. ✅ Join organization
9. ✅ View members list
10. ✅ Leave organization

---

## 📝 Notes

- **First time setup:** Takes ~5 minutes
- **Subsequent runs:** Just `docker-compose up -d` and `npm run dev`
- **Database persists:** Data survives restarts
- **Hot reload:** Backend and frontend auto-reload on code changes

---

## 🔗 Useful URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Prisma Studio:** Run `npx prisma studio` (http://localhost:5555)
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

---

**Ready to run? Start with Step 1! 🚀**
