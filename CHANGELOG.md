# Changelog

All notable changes to Club OS will be documented in this file.

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
