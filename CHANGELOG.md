# Changelog

All notable changes to Club OS will be documented in this file.

## [0.2.0] - 2026-09-08

### Added - Vertical Slice #2: Memberships

**Backend:**
- Membership model with user-organization many-to-many relationship
- Join organization endpoint (`POST /memberships/organizations/:id/join`)
- Leave organization endpoint (`DELETE /memberships/organizations/:id/leave`)
- Get members endpoint (`GET /memberships/organizations/:id/members`)
- Get user memberships endpoint (`GET /memberships/my-memberships`)
- Organization API now includes membership status (isMember, isCreator, memberCount)
- Validation: Creator cannot leave their own organization
- Validation: Cannot join organization twice

**Frontend:**
- Join/Leave buttons on organization cards
- Member count display
- Creator badge
- Members page (`/organizations/:slug/members`)
- Member list with avatars, names, emails, roles, and join dates
- Real-time UI updates after join/leave actions
- Confirmation dialog before leaving

**Database:**
- Memberships table with unique constraint on (user_id, organization_id)
- Role field (defaults to "member")
- Status field (defaults to "active")
- Joined_at timestamp

**Documentation:**
- Migration steps guide
- Comprehensive testing guide with test scenarios
- API testing commands
- Edge cases documentation

### What Works

1. User can join any organization
2. User can leave organizations (except if creator)
3. Organization cards show membership status
4. Members page lists all organization members
5. Member count updates dynamically
6. Creators get special badge
7. Proper error handling and validation

### Next Slice

- Events (create, list, view)
- Event approval workflow
- Event registration

---

## [0.1.0] - 2026-09-08

### Added - Vertical Slice #1

**Backend:**
- NestJS project structure with TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication (register + login)
- User CRUD operations
- Organization CRUD operations
- Protected API routes
- Global exception handling
- Input validation with class-validator

**Frontend:**
- Next.js 14 App Router project
- Tailwind CSS styling
- Zustand state management
- Login page
- Register page
- Dashboard page
- Organization creation form
- Organization list view
- Protected client routes
- API client with Axios

**Infrastructure:**
- Docker Compose setup (PostgreSQL + Redis)
- pnpm workspace monorepo
- Environment configuration
- Development scripts

**Database:**
- Users table
- Organizations table
- Prisma migrations

### What Works

1. User can register an account
2. User can login and receive JWT token
3. User can create organizations
4. User can view all organizations
5. Protected routes require authentication
6. Auto-generated slugs from organization names
7. Form validation on both frontend and backend

### Next Slice

- Memberships (join/leave organizations)
- Role-based access control
- Organization settings
