# Database Migration Steps

After updating the Prisma schema, run these commands **manually** in your terminal:

## Step 1: Navigate to backend
```bash
cd apps/backend
```

## Step 2: Generate Prisma Client
```bash
npx prisma generate
```

## Step 3: Create Migration
```bash
npx prisma migrate dev --name add_memberships
```

When prompted for migration name, type: `add_memberships`

## Step 4: Verify
```bash
npx prisma studio
```

You should see the new `memberships` table with:
- id
- user_id  
- organization_id
- role (default: "member")
- status (default: "active")
- joined_at

---

**Note:** These steps must be run manually because they require interactive input.
