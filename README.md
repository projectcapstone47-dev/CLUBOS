# CLUB OS

> **The Digital Operating System for Student Organizations**

From idea to archive, manage every aspect of your student club in one place.

---

## 🚀 Vertical Slice #1: WORKING!

**Status:** ✅ Complete and deployed  
**What works:** User authentication + Organization creation + Dashboard

### Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start database (Docker Desktop must be running)
docker-compose up -d

# 3. Run migrations
pnpm db:generate
pnpm db:migrate

# 4. Start development servers
pnpm dev

# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

**See [setup.md](setup.md) for detailed instructions**

### Current Features

- ✅ User Registration
- ✅ User Login (JWT)
- ✅ Protected Routes
- ✅ Create Organization
- ✅ List Organizations
- ✅ Dashboard UI

### Tech Stack

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** Next.js 14 + Tailwind CSS + Zustand
- **Database:** PostgreSQL 15
- **Auth:** JWT

---

## 📚 Full Documentation

This repository contains the complete architectural blueprint for Club OS — a production-ready, enterprise-grade platform for managing student organizations.

### 🎯 Core Documentation

| Document | Description | Status |
|----------|-------------|--------|
| **[DATA_MODEL.md](docs/DATA_MODEL.md)** | Complete entity-relationship model with 62 entities across 12 engines | ✅ Complete |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System architecture, tech stack, deployment strategy | ✅ Complete |
| **[ERD.md](docs/ERD.md)** | Visual entity relationships and data flow diagrams | ✅ Complete |
| **[MVP_ROADMAP.md](docs/MVP_ROADMAP.md)** | 3-month MVP plan with timeline and deliverables | ✅ Complete |
| **[schema.sql](database/schema.sql)** | PostgreSQL database schema (implementation-ready) | 🚧 Partial |

---

## 🌟 What is Club OS?

Club OS is a **comprehensive institutional operating system** designed to replace the fragmented toolkit that student organizations currently use.

### The Problem

Student clubs today juggle:
- 📱 WhatsApp for communication
- 📊 Google Sheets for member tracking
- 📝 Google Forms for registration
- 📄 Google Drive for documents
- 📧 Gmail for official communication
- 📋 Physical registers for attendance
- 💰 Excel for budget tracking
- 🗂️ No institutional memory

### The Solution

**One platform. One source of truth. Complete lifecycle management.**

```
Organization Identity → People Management → Event Planning
       ↓                      ↓                  ↓
  Workflow Engine ← Communication Hub ← Task Management
       ↓                      ↓                  ↓
  Document System ← Resource Booking ← Attendance Tracking
       ↓                      ↓                  ↓
  Budget Tracking ← Analytics Engine ← Institutional Memory
```

---

## 🏗️ Architecture Overview

### The 12 Core Engines

```
1.  Identity Engine          → Who organizations are
2.  People Engine            → Who belongs, how, where
3.  Membership Engine        → Roles, positions, hierarchy
4.  RBAC Engine              → Permissions and policies
5.  Workflow Engine          → Approval routing and automation
6.  Event Engine             → Activity lifecycle management
7.  Task Engine              → Operational execution
8.  Resource Engine          → Asset management and booking
9.  Communication Engine     → Structured messaging
10. Document Engine          → Knowledge management
11. Program Engine           → Learning and development (LLC)
12. Finance Engine           → Budget and expense tracking
```

### Tech Stack (Recommended)

**Backend:**
- Runtime: Node.js 20+ (TypeScript)
- Framework: NestJS
- ORM: Prisma
- Database: PostgreSQL 15+
- Cache: Redis 7+
- Queue: BullMQ
- Auth: JWT + Passport

**Frontend:**
- Framework: Next.js 14 (App Router)
- UI: shadcn/ui + Tailwind CSS
- State: Zustand
- Forms: React Hook Form + Zod

**Infrastructure:**
- Cloud: AWS / Vercel / Railway
- Storage: S3 / Cloudflare R2
- Email: Resend / SendGrid
- Monitoring: Sentry

---

## 📊 Data Model

### Entity Count by Engine

```
Identity & People:      12 entities
RBAC & Permissions:      3 entities
Workflow:                4 entities
Activities & Events:     6 entities
Tasks:                   3 entities
Resources:               3 entities
Communication:           7 entities
Documents:               5 entities
Programs:                6 entities
Finance:                 6 entities
Analytics:               4 entities
Cross-cutting:           7 entities
────────────────────────────────────
TOTAL:                  62 entities
```

### Key Relationships

```
Institution (1) ──> (N) Organization
Organization (1) ──> (N) Member
Organization (1) ──> (N) Event
Event (1) ──> (N) Registration
Event (1) ──> (N) Attendance
Event (1) ──> (N) Task
User (1) ──> (N) Role
Workflow (1) ──> (N) Step
Activity (1) ──> (N) Document
```

---

## 🎯 MVP Scope (3 Months)

### Core Features

**✅ Phase 1: Foundation (Month 1)**
- Authentication & Authorization
- Organization Management
- User & Member Management
- Basic Role System
- Event Creation & Approval

**✅ Phase 2: Operations (Month 2)**
- Event Registration
- QR-based Attendance
- Task Management
- Resource Booking
- Basic Communication

**✅ Phase 3: Polish (Month 3)**
- Document Management
- Analytics Dashboard
- Notifications (Email + In-app)
- Reports Generation
- Launch Preparation

### MVP Deliverables

```
📱 35 UI Screens
🗄️ 25 Database Tables
⚙️ 50+ API Endpoints
👥 3 User Experiences (Student, Club Leader, Faculty)
📊 5 Core Workflows
🎯 20 Core Features
```

---

## 🚀 Getting Started

### For Developers

```bash
# 1. Clone repository
git clone https://github.com/yourusername/clubos.git
cd clubos

# 2. Install dependencies
pnpm install

# 3. Set up database
docker-compose up -d postgres redis

# 4. Run migrations
pnpm prisma migrate dev

# 5. Start development servers
pnpm dev
```

### For Product Managers

1. Read [MVP_ROADMAP.md](docs/MVP_ROADMAP.md) for timeline
2. Review [DATA_MODEL.md](docs/DATA_MODEL.md) for scope
3. Check [ARCHITECTURE.md](docs/ARCHITECTURE.md) for tech decisions

### For Designers

1. See UI screen list in [MVP_ROADMAP.md](docs/MVP_ROADMAP.md)
2. Three main experiences: Student, Club Leader, Faculty
3. Mobile-first, accessibility-compliant

---

## 📈 Market Position

### Competitors

**International:**
- CampusGroups (30+ modules, enterprise focus)
- Ready Education (engagement platform)
- Modern Campus Involve (forms, events, finance)

**India:**
- Sparse market
- Mostly manual or fragmented

### Differentiation

```
✓ India-specific workflows (LLC, Faculty approval chains)
✓ Institutional Memory (event cloning, knowledge reuse)
✓ Complete lifecycle (not just event management)
✓ Beautiful UX (not enterprise-ugly)
✓ Affordable pricing (vs. $10k+ enterprise solutions)
```

---

## 💡 Key Insights

### 1. Activity-Centric Design

Everything inherits from `Activity`:
- Events
- Meetings
- LLC Sessions
- Workshops

This means **one system handles all activity types** rather than building separate systems for each.

### 2. Workflow-Driven

Approval routing, state management, and automation are **core platform features**, not afterthoughts.

### 3. Multi-tenant from Day 1

Every entity is scoped to Institution or Organization. Row-level security ensures data isolation.

### 4. Audit Everything

Complete audit trail for compliance, debugging, and institutional memory.

### 5. Institutional Memory

The killer feature: **clone last year's event** with all tasks, requirements, and learnings intact.

---

## 🎓 Learning Resources

### If You're Building This

**Backend (NestJS):**
- [Official Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

**Frontend (Next.js):**
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)

**System Design:**
- *Designing Data-Intensive Applications* by Martin Kleppmann
- *Clean Architecture* by Robert C. Martin
- *Domain-Driven Design* by Eric Evans

---

## 📊 Project Stats

```
Lines of Documentation: ~15,000
Database Entities:      62
API Endpoints:          200+
UI Screens:             35 (MVP), 100+ (Full)
Development Time:       3 months (MVP), 12 months (Full)
Team Size:              1-3 (MVP), 6-8 (Full)
```

---

## 🗺️ Roadmap

### MVP (Month 0-3)
✅ Event lifecycle management  
✅ Basic membership & RBAC  
✅ Registration & Attendance  
✅ Tasks & Resources  

### V1 (Month 4-6)
🔲 Custom forms  
🔲 Document approval  
🔲 Advanced analytics  
🔲 Certificate generation  

### V2 (Month 7-12)
🔲 Programs (LLC)  
🔲 Finance management  
🔲 Sponsorship tracking  
🔲 Email automation  

### V3 (Year 2)
🔲 Institutional memory AI  
🔲 Event recommendations  
🔲 Advanced workflows  
🔲 Mobile apps  

---

## 🤝 Contributing

This is currently a design/architecture repository.

**To contribute:**
1. Read the documentation
2. Understand the data model
3. Propose improvements via Issues
4. Submit PRs with detailed explanations

---

## 📄 License

This architectural documentation is shared for educational and reference purposes.

Implementation of this design should respect appropriate licensing for dependencies and third-party tools.

---

## 🙏 Acknowledgments

**Inspiration:**
- CampusGroups (breadth of modules)
- Linear (beautiful UX)
- Notion (flexibility)
- Slack (communication patterns)

**Tools Used:**
- Claude Sonnet 4.5 (architecture design)
- PostgreSQL (database)
- NestJS (backend framework)
- Next.js (frontend framework)

---

## 📞 Contact

**Project Status:** Architecture & Design Complete  
**Next Phase:** MVP Implementation  
**Timeline:** 3 months to MVP  

For questions or collaboration:
- Open an issue in this repository
- Review the documentation first

---

## 🎯 The Vision

> **"What if every student organization had an operating system?"**

Club OS aims to:
- ✅ Eliminate fragmented tools
- ✅ Preserve institutional knowledge
- ✅ Make organization management delightful
- ✅ Enable better student experiences
- ✅ Provide actionable insights

From hackathons to leadership programs, from budget tracking to certificate generation — **one platform, infinite possibilities**.

---

## 📁 Repository Structure

```
clubos/
├── docs/
│   ├── DATA_MODEL.md          # Complete data model
│   ├── ARCHITECTURE.md        # System architecture
│   ├── ERD.md                 # Entity relationships
│   └── MVP_ROADMAP.md         # 3-month plan
├── database/
│   └── schema.sql             # PostgreSQL schema
├── README.md                  # This file
└── .gitignore
```

---

## 🔥 Quick Links

| Link | Description |
|------|-------------|
| [Data Model](docs/DATA_MODEL.md) | See all 62 entities |
| [Architecture](docs/ARCHITECTURE.md) | Understand the system |
| [ERD](docs/ERD.md) | Visualize relationships |
| [MVP Roadmap](docs/MVP_ROADMAP.md) | Build in 3 months |
| [Database Schema](database/schema.sql) | PostgreSQL code |

---

## ⭐ Star This Repository

If you find this architecture useful:
- ⭐ Star the repository
- 🔄 Share with others
- 💬 Provide feedback
- 🤝 Contribute improvements

---

**Built with ❤️ for student organizations everywhere.**

**Let's make club management beautiful.**

---

*Last Updated: September 8, 2026*  
*Version: 1.0 (God Mode Edition)*
