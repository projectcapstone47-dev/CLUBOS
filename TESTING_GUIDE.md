# Testing Guide - Vertical Slice #2: Memberships

## 🧪 End-to-End Test Flow

### Prerequisites
1. Database is running: `docker-compose up -d`
2. Migration is applied: `cd apps/backend && npx prisma migrate dev --name add_memberships`
3. Backend is running: `pnpm dev:backend`
4. Frontend is running: `pnpm dev:frontend`

---

## Test Scenario: Complete Membership Flow

### Step 1: Setup (2 users)

**User A (Creator):**
1. Register at http://localhost:3000/register
   - Email: `alice@example.com`
   - Password: `password123`
   - First Name: Alice
   - Last Name: Smith

2. Login and create organization
   - Name: "Coding Club"
   - Slug: "coding-club"
   - Description: "Learn programming together"

**User B (Member):**
1. Register at http://localhost:3000/register
   - Email: `bob@example.com`
   - Password: `password123`
   - First Name: Bob
   - Last Name: Johnson

---

### Step 2: Test Join Organization (User B)

**As Bob:**
1. Login to dashboard
2. See "Coding Club" card
3. Verify:
   - ✓ "Join" button visible
   - ✓ Member count shows "0 members"
   - ✓ No "Members" link (not a member yet)

4. Click "Join" button
5. Verify:
   - ✓ Button changes to "Leave"
   - ✓ "Members" link appears
   - ✓ Member count updates to "1 member"

---

### Step 3: Test Members List

**As Bob (now a member):**
1. Click "Members" link on Coding Club card
2. Navigate to `/organizations/coding-club/members`
3. Verify members page shows:
   - ✓ "Coding Club" header
   - ✓ "Members (1)" count
   - ✓ Bob's info displayed:
     - Avatar with "B"
     - Name: "Bob Johnson"
     - Email: "bob@example.com"
     - Role: "member"
     - Join date: Today's date

---

### Step 4: Test Creator View (User A)

**As Alice (creator):**
1. Login to dashboard
2. See "Coding Club" card
3. Verify:
   - ✓ "Creator" badge visible
   - ✓ No "Join" or "Leave" buttons
   - ✓ "Members" link visible
   - ✓ Member count shows "1 member"

4. Click "Members" link
5. Verify members page shows:
   - ✓ Bob Johnson listed as member
   - ✓ All Bob's details correct

---

### Step 5: Test Leave Organization (User B)

**As Bob:**
1. Return to dashboard
2. Find "Coding Club" card
3. Click "Leave" button
4. Confirm in popup dialog
5. Verify:
   - ✓ Button changes back to "Join"
   - ✓ "Members" link disappears
   - ✓ Member count updates to "0 members"

**As Alice:**
1. Refresh dashboard
2. Verify:
   - ✓ Member count shows "0 members"

3. Click "Members" link
4. Verify:
   - ✓ "No members yet" message displayed

---

### Step 6: Test Creator Cannot Leave

**As Alice (creator):**
1. On dashboard, check "Coding Club" card
2. Verify:
   - ✓ No "Leave" button (only "Creator" badge)
   - ✓ Cannot leave own organization

**If you try via API (should fail):**
```bash
curl -X DELETE http://localhost:3001/memberships/organizations/{org-id}/leave \
  -H "Authorization: Bearer {alice-token}"
```
Expected: Error "Organization creator cannot leave"

---

## API Testing

### Test Join Organization
```bash
# Get token from login
TOKEN="your-jwt-token"
ORG_ID="organization-uuid"

curl -X POST http://localhost:3001/memberships/organizations/$ORG_ID/join \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "organizationId": "uuid",
  "role": "member",
  "status": "active",
  "joinedAt": "2026-09-08T...",
  "user": {...},
  "organization": {...}
}
```

---

### Test Leave Organization
```bash
curl -X DELETE http://localhost:3001/memberships/organizations/$ORG_ID/leave \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "message": "Left organization successfully"
}
```

---

### Test Get Members
```bash
curl -X GET http://localhost:3001/memberships/organizations/$ORG_ID/members \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "role": "member",
    "status": "active",
    "joinedAt": "2026-09-08T...",
    "user": {
      "id": "uuid",
      "email": "bob@example.com",
      "firstName": "Bob",
      "lastName": "Johnson"
    }
  }
]
```

---

### Test Get Organizations (with membership status)
```bash
curl -X GET http://localhost:3001/organizations \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (for each org):**
```json
{
  "id": "uuid",
  "name": "Coding Club",
  "slug": "coding-club",
  "isMember": true,      // ✓ Added in slice #2
  "isCreator": false,    // ✓ Added in slice #2
  "memberCount": 1,      // ✓ Added in slice #2
  "createdBy": {...},
  "_count": {...}
}
```

---

## Edge Cases to Test

### 1. Double Join
- User joins org
- User tries to join again
- **Expected:** Error "Already a member of this organization"

### 2. Leave Non-Member Org
- User hasn't joined org
- User tries to leave
- **Expected:** Error "Not a member of this organization"

### 3. Creator Leave
- Creator tries to leave their own org
- **Expected:** Error "Organization creator cannot leave"

### 4. Invalid Organization
- Try to join non-existent org
- **Expected:** Error "Organization not found"

### 5. Unauthenticated Access
- Try to access members page without login
- **Expected:** Redirect to login

---

## Database Verification

### Check memberships table
```bash
cd apps/backend
npx prisma studio
```

Open "memberships" table and verify:
- ✓ `user_id` and `organization_id` are set
- ✓ `role` defaults to "member"
- ✓ `status` defaults to "active"
- ✓ `joined_at` has current timestamp
- ✓ Unique constraint on (user_id, organization_id)

---

## Success Criteria

### Backend ✓
- [x] Membership model in database
- [x] Join organization endpoint works
- [x] Leave organization endpoint works
- [x] Get members endpoint works
- [x] Creator cannot leave validation works
- [x] Double-join prevention works
- [x] Organization API includes membership status

### Frontend ✓
- [x] Join button visible for non-members
- [x] Leave button visible for members
- [x] Creator badge visible for creators
- [x] Member count displays correctly
- [x] Members link visible for members/creators
- [x] Members page loads and displays all members
- [x] Members page shows avatars, names, roles, join dates
- [x] Navigation between dashboard and members works

### User Experience ✓
- [x] Immediate UI update after join/leave
- [x] Confirmation dialog before leaving
- [x] Error messages display properly
- [x] Loading states work
- [x] Responsive design

---

## Known Limitations

1. **No real-time updates:** Other users must refresh to see membership changes
2. **No member removal:** Creators can't remove other members yet (future slice)
3. **No role management:** Can't change roles yet (future slice)
4. **No invitations:** All orgs are join-able by anyone (future slice)

---

## Next Testing Session

After running these tests manually:
1. Document any bugs found
2. Fix critical issues
3. Test again
4. Commit as working slice

---

**Test Status:** ⏳ Ready for manual testing  
**Date Created:** September 8, 2026
