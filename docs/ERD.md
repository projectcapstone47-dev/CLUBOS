# CLUB OS — ENTITY RELATIONSHIP DIAGRAM
## Visual Data Model

**Version:** 1.0  
**Last Updated:** 2026-09-08

---

## 🎯 CORE ENTITY RELATIONSHIPS

```
┌─────────────────────────────────────────────────────────────────────┐
│                          IDENTITY & PEOPLE                          │
└─────────────────────────────────────────────────────────────────────┘

                      ┌──────────────┐
                      │ Institution  │
                      └───────┬──────┘
                              │
                    ┌─────────┼─────────┐
                    │                   │
                    ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │Organization  │    │     User     │
          └───────┬──────┘    └──────┬───────┘
                  │                   │
                  └────────┬──────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │  Membership  │
                  └──────┬───────┘
                         │
            ┌────────────┼────────────┐
            │                         │
            ▼                         ▼
    ┌──────────────┐          ┌──────────────┐
    │   UserRole   │          │   Position   │
    └──────┬───────┘          └──────┬───────┘
           │                         │
           ▼                         ▼
    ┌──────────────┐          ┌──────────────┐
    │     Role     │          │PositionHolder│
    └──────┬───────┘          └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ Permission   │
    └──────────────┘
```

### Relationships

```
Institution ──1:N──> Organization
Institution ──1:N──> User
Institution ──1:N──> Resource

Organization ──1:N──> Membership
Organization ──N:1──> Organization (parent)

User ──1:N──> Membership
User ──1:N──> UserRole

Membership ──M:N──> Role (via UserRole)

Role ──M:N──> Permission (via RolePermission)
```

---

## 🎪 ACTIVITY & EVENTS

```
┌─────────────────────────────────────────────────────────────────────┐
│                       ACTIVITY ECOSYSTEM                             │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │Organization  │
          └───────┬──────┘
                  │
                  ▼
          ┌──────────────┐
          │   Activity   │
          │  (Base Type) │
          └───────┬──────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │ Event  │ │Meeting │ │Session │
   └────────┘ └────────┘ └───┬────┘
        │         │           │
        └─────────┼───────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│Registration│Attendance││   Task   │
└──────────┘ └──────────┘ └──────────┘
        │         │
        └─────────┤
                  │
                  ▼
          ┌──────────────┐
          │     User     │
          └──────────────┘
```

### Relationships

```
Organization ──1:N──> Activity

Activity ──1:1──> Event (optional)
Activity ──1:1──> Meeting (optional)
Activity ──1:1──> Session (optional)

Activity ──1:N──> Registration
Activity ──1:N──> Attendance
Activity ──1:N──> Task
Activity ──1:N──> Document
Activity ──1:N──> ResourceBooking

User ──1:N──> Registration
User ──1:N──> Attendance

Registration ──1:1──> Attendance (optional)
```

---

## 🔄 WORKFLOW ENGINE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW SYSTEM                              │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │   Workflow   │
          │   Template   │
          └───────┬──────┘
                  │
                  │ 1:N
                  │
          ┌───────▼──────┐
          │ WorkflowStep │
          └──────────────┘
                  │
                  │ 1:N
                  │
          ┌───────▼───────┐
          │  Workflow     │
          │  Instance     │
          └───────┬───────┘
                  │
                  │ 1:N
                  │
          ┌───────▼────────────┐
          │ WorkflowStep       │
          │ Instance           │
          └────────────────────┘
                  │
                  │ N:1
                  │
          ┌───────▼──────┐
          │     User     │
          │  (Approver)  │
          └──────────────┘
```

### Workflow Flow

```
Event Created
     │
     ▼
WorkflowInstance (event_approval)
     │
     ├─► Step 1: President → Pending
     │
     ├─► Step 2: Faculty → Waiting
     │
     └─► Step 3: Admin → Waiting

When Step 1 Approved:
     │
     ├─► Step 1: President → Approved
     │
     ├─► Step 2: Faculty → Pending (now active)
     │
     └─► Step 3: Admin → Waiting
```

---

## ✅ TASK MANAGEMENT

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TASK SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │Organization  │
          └───────┬──────┘
                  │
                  ▼
          ┌──────────────┐
          │   TaskList   │
          └───────┬──────┘
                  │
                  │ 1:N
                  │
          ┌───────▼──────┐
          │     Task     │
          └───────┬──────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │  User  │ │Activity│ │SubTasks│
   │(Assigned)│(Parent)│ │        │
   └────────┘ └────────┘ └────────┘
```

### Task Hierarchy

```
Event: Hackathon
│
├─► TaskList: Event Preparation
    │
    ├─► Task: Book Venue
    │   ├─► Subtask: Check availability
    │   ├─► Subtask: Get approval
    │   └─► Subtask: Confirm booking
    │
    ├─► Task: Arrange Food
    │   ├─► Subtask: Get quotes
    │   ├─► Subtask: Budget approval
    │   └─► Subtask: Place order
    │
    └─► Task: Setup Equipment
        ├─► Subtask: Projector
        ├─► Subtask: Microphones
        └─► Subtask: WiFi
```

---

## 🏢 RESOURCE MANAGEMENT

```
┌─────────────────────────────────────────────────────────────────────┐
│                       RESOURCE SYSTEM                                │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │ Institution  │
          └───────┬──────┘
                  │
                  ▼
          ┌──────────────┐
          │   Resource   │
          └───────┬──────┘
                  │
        ┌─────────┼─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Booking    │    │  Allocation  │
└───────┬──────┘    └──────┬───────┘
        │                   │
        └────────┬──────────┘
                 │
                 ▼
          ┌──────────────┐
          │   Activity   │
          └──────────────┘
```

### Resource Timeline

```
Resource: Auditorium
│
├─► 9 AM - 11 AM: Event A (Booking #1) - Confirmed
├─► 11 AM - 1 PM: Available
├─► 1 PM - 5 PM: Event B (Booking #2) - Pending Approval
└─► 5 PM onwards: Available
```

---

## 💬 COMMUNICATION

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMMUNICATION SYSTEM                             │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │Organization  │
          └───────┬──────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Channel │ │Announce│ │ Notice │
   └────┬───┘ └───┬────┘ └───┬────┘
        │         │           │
        ▼         │           │
┌──────────────┐  │           │
│ChannelMember│  │           │
└───────┬──────┘  │           │
        │         │           │
        ▼         ▼           ▼
   ┌─────────────────────────┐
   │         User            │
   └─────────────────────────┘
        │
        ▼
   ┌─────────────────────────┐
   │       Message           │
   └─────────────────────────┘
```

### Channel Structure

```
Organization: Coding Club
│
├─► Channel: #general (public)
│   ├─► Member: Student A
│   ├─► Member: Student B
│   └─► Messages...
│
├─► Channel: #events (public)
│   └─► Messages...
│
├─► Channel: #management (private)
│   ├─► Member: President
│   ├─► Member: Vice President
│   └─► Messages...
│
├─► Announcements (broadcast)
│   └─► All members receive
│
└─► Notices (official)
    └─► Target specific groups
```

---

## 📄 DOCUMENT MANAGEMENT

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DOCUMENT SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │Organization  │
          └───────┬──────┘
                  │
                  ▼
          ┌──────────────┐
          │    Folder    │
          │ (Hierarchy)  │
          └───────┬──────┘
                  │
                  ▼
          ┌──────────────┐
          │   Document   │
          └───────┬──────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Version │ │Activity│ │Template│
   └────────┘ └───┬────┘ └────────┘
                   │
                   ▼
            ┌──────────────┐
            │ Certificate  │
            └──────────────┘
```

### Document Hierarchy

```
Organization: Coding Club
│
├─► Folder: Events
│   ├─► Folder: Hackathon 2026
│   │   ├─► Document: Proposal.pdf (v2)
│   │   ├─► Document: Budget.xlsx
│   │   └─► Document: Approval_Letter.pdf
│   └─► Folder: Workshop Series
│
├─► Folder: Policies
│   ├─► Document: Club_Constitution.pdf
│   └─► Document: Code_of_Conduct.pdf
│
└─► Folder: Reports
    ├─► Document: Annual_Report_2025.pdf
    └─► Document: Q1_Activity_Summary.pdf
```

---

## 🎓 PROGRAM & LEARNING

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PROGRAM SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │Organization  │
          └───────┬──────┘
                  │
                  ▼
          ┌──────────────┐
          │   Program    │
          └───────┬──────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │ Cohort │ │Session │ │Assignment│
   └────┬───┘ └───┬────┘ └───┬────┘
        │         │           │
        │         └─────┬─────┘
        │               │
        ▼               ▼
┌──────────────┐ ┌──────────────┐
│ Enrollment   │ │ Submission   │
└──────┬───────┘ └──────┬───────┘
       │                │
       └────────┬───────┘
                │
                ▼
          ┌──────────────┐
          │     User     │
          └──────────────┘
```

### Program Flow

```
Program: Leadership & Learning Cell (LLC)
│
├─► Cohort: Batch 2026-27
│   │
│   ├─► Enrollment: Student A
│   ├─► Enrollment: Student B
│   └─► Enrollment: Student C
│
├─► Session 1: Introduction
│   ├─► Activity: Lecture
│   ├─► Attendance: A✓, B✓, C✗
│   └─► Assignment: Essay
│       ├─► Submission: A (90%)
│       ├─► Submission: B (85%)
│       └─► Submission: C (pending)
│
├─► Session 2: Leadership Skills
└─► Session 3: Team Building
```

---

## 💰 FINANCE SYSTEM

```
┌─────────────────────────────────────────────────────────────────────┐
│                       FINANCE SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │Organization  │
          └───────┬──────┘
                  │
                  ▼
          ┌──────────────┐
          │    Budget    │
          └───────┬──────┘
                  │
                  │ 1:N
                  │
          ┌───────▼──────┐
          │BudgetCategory│
          └───────┬──────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Expense │ │Reimburse││Sponsor │
   └────┬───┘ └────┬───┘ └───┬────┘
        │          │          │
        └──────────┼──────────┘
                   │
                   ▼
          ┌──────────────┐
          │ Transaction  │
          └──────────────┘
```

### Budget Tracking

```
Budget: Annual 2026
Total Allocated: ₹5,00,000
│
├─► Category: Events (₹3,00,000)
│   ├─► Allocated: ₹3,00,000
│   ├─► Spent: ₹1,50,000
│   ├─► Committed: ₹50,000
│   └─► Remaining: ₹1,00,000
│
├─► Category: Equipment (₹1,00,000)
│   ├─► Allocated: ₹1,00,000
│   ├─► Spent: ₹60,000
│   ├─► Committed: ₹20,000
│   └─► Remaining: ₹20,000
│
└─► Category: Operations (₹1,00,000)
    ├─► Allocated: ₹1,00,000
    ├─► Spent: ₹40,000
    ├─► Committed: ₹10,000
    └─► Remaining: ₹50,000
```

---

## 📊 ANALYTICS & METRICS

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ANALYTICS SYSTEM                                 │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────┐
          │Organization  │
          └───────┬──────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │ Metric │ │ Report │ │Dashboard│
   └────┬───┘ └────────┘ └────────┘
        │
        │ 1:N
        │
        ▼
   ┌─────────────┐
   │MetricValue  │
   │(Time Series)│
   └─────────────┘
```

### Metric Tracking

```
Organization: Coding Club

Metric: Member Growth
├─► Jan 2026: 45 members
├─► Feb 2026: 52 members (+7)
├─► Mar 2026: 48 members (-4)
└─► Apr 2026: 55 members (+7)

Metric: Event Attendance Rate
├─► Event 1: 85% (42/50)
├─► Event 2: 90% (45/50)
└─► Event 3: 78% (39/50)

Metric: Budget Utilization
├─► Q1: 40% utilized
├─► Q2: 65% utilized
└─► Q3: 85% utilized
```

---

## 🔔 NOTIFICATION SYSTEM

```
┌─────────────────────────────────────────────────────────────────────┐
│                   NOTIFICATION PIPELINE                              │
└─────────────────────────────────────────────────────────────────────┘

    Domain Event
         │
         ▼
┌──────────────────┐
│  Event Handler   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Notification     │
│    Creator       │
└────────┬─────────┘
         │
         ├──► In-App Notification
         ├──► Email Notification
         ├──► Push Notification
         └──► SMS Notification
         │
         ▼
┌──────────────────┐
│  Notification    │
│     Queue        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Notification    │
│   Delivery       │
└──────────────────┘
```

### Notification Flow

```
Event: Task Assigned

1. Task.assignedTo = User A
2. Emit TaskAssigned event
3. NotificationHandler receives event
4. Create notification:
   - Type: task_assigned
   - User: User A
   - Title: "New task assigned"
   - Message: "You have been assigned: Venue Preparation"
   - Action: /tasks/123
5. Queue notification
6. Deliver via:
   ✓ In-app (immediate)
   ✓ Email (batched)
   ⨯ Push (user disabled)
```

---

## 🔍 AUDIT & COMPLIANCE

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AUDIT SYSTEM                                    │
└─────────────────────────────────────────────────────────────────────┘

    Any Write Operation
         │
         ▼
┌──────────────────┐
│   Audit Logger   │
└────────┬─────────┘
         │
         ├──► AuditLog (compliance)
         │    - Who did what when
         │    - Full change tracking
         │
         └──► ActivityLog (analytics)
              - User activity patterns
              - Usage statistics
```

### Audit Log Entry

```json
{
  "id": "audit_123",
  "user_id": "user_456",
  "action": "event.update",
  "entity_type": "event",
  "entity_id": "event_789",
  "changes": {
    "status": {
      "old": "draft",
      "new": "pending_approval"
    },
    "title": {
      "old": "Hackathon",
      "new": "Hackathon 2026"
    }
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2026-09-08T10:30:00Z"
}
```

---

## 🎯 COMPLETE ENTITY COUNT

```
CORE ENTITIES:

Identity & People:
├── Institution           (1)
├── Organization          (2)
├── User                  (3)
├── Profile               (4)
├── Membership            (5)
├── Role                  (6)
├── UserRole              (7)
├── Permission            (8)
├── RolePermission        (9)
├── PolicyRule            (10)
├── Position              (11)
└── PositionHolder        (12)

Workflow:
├── Workflow              (13)
├── WorkflowStep          (14)
├── WorkflowInstance      (15)
└── WorkflowStepInstance  (16)

Activities:
├── Activity              (17)
├── Event                 (18)
├── Meeting               (19)
├── Registration          (20)
├── Attendance            (21)
└── ActivityTeam          (22)

Tasks:
├── TaskList              (23)
├── Task                  (24)
└── TaskComment           (25)

Resources:
├── Resource              (26)
├── ResourceBooking       (27)
└── ResourceAllocation    (28)

Communication:
├── Channel               (29)
├── ChannelMember         (30)
├── Message               (31)
├── Announcement          (32)
├── Notice                (33)
├── Poll                  (34)
└── PollResponse          (35)

Documents:
├── Folder                (36)
├── Document              (37)
├── DocumentVersion       (38)
├── Template              (39)
└── Certificate           (40)

Programs:
├── Program               (41)
├── Cohort                (42)
├── ProgramEnrollment     (43)
├── Session               (44)
├── Assignment            (45)
└── AssignmentSubmission  (46)

Finance:
├── Budget                (47)
├── BudgetCategory        (48)
├── Expense               (49)
├── Reimbursement         (50)
├── Transaction           (51)
└── Sponsorship           (52)

Analytics:
├── Metric                (53)
├── MetricValue           (54)
├── Report                (55)
└── Dashboard             (56)

Cross-Cutting:
├── Notification          (57)
├── AuditLog              (58)
├── ActivityLog           (59)
├── FileUpload            (60)
├── Setting               (61)
└── Integration           (62)

────────────────────────────
TOTAL: 62 CORE ENTITIES
────────────────────────────
```

---

## 📊 RELATIONSHIP SUMMARY

```
ONE-TO-MANY (1:N): 85+ relationships
MANY-TO-ONE (N:1): 85+ relationships
MANY-TO-MANY (M:N): 12+ relationships
ONE-TO-ONE (1:1): 8+ relationships

Total Relationships: ~190
```

---

## 🎯 KEY INSIGHTS

### 1. Polymorphic Relationships

Many entities can belong to different parent types:

```sql
-- Task can belong to:
parent_type = 'event'    parent_id = event_id
parent_type = 'meeting'  parent_id = meeting_id
parent_type = 'program'  parent_id = program_id

-- Document can belong to:
parent_type = 'event'
parent_type = 'organization'
parent_type = 'meeting'
```

### 2. Soft Deletes

All entities have `deleted_at`:

```sql
-- Never actually delete
UPDATE activities SET deleted_at = NOW() WHERE id = 123;

-- Always filter out deleted
SELECT * FROM activities WHERE deleted_at IS NULL;
```

### 3. Audit Trail

All writes create audit logs:

```sql
-- After every UPDATE/INSERT/DELETE
INSERT INTO audit_logs (
  user_id, action, entity_type, entity_id, 
  changes, old_values, new_values
);
```

### 4. Multi-tenancy

All data scoped to institution/organization:

```sql
-- Every query filters by tenant
WHERE organization_id = current_org_id()
  AND deleted_at IS NULL;
```

---

**END OF ERD DOCUMENT**
