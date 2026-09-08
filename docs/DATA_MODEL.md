# CLUB OS — COMPLETE DATA MODEL
## God Mode Edition

**Version:** 1.0  
**Last Updated:** 2026-09-08  
**Architecture:** Multi-tenant, Event-sourced, RBAC-enabled

---

## 🎯 DESIGN PRINCIPLES

1. **Everything is tenant-scoped** — All entities belong to an Institution
2. **Soft deletes everywhere** — Nothing is ever truly deleted
3. **Audit trail by default** — Every change is tracked
4. **Polymorphic relationships** — Resources can belong to any activity type
5. **Activity-centric** — Events, Meetings, LLC Sessions inherit from Activity
6. **Workflow-driven** — State machines control lifecycle
7. **Permission-checked** — RBAC at entity + field level

---

## 📊 ENTITY SUMMARY

```
12 CORE ENGINES
├── 01. Identity Engine          (Institution, Organization, Chapter)
├── 02. People Engine            (User, Profile, Contact)
├── 03. Membership Engine        (Membership, Role, Position)
├── 04. RBAC Engine              (Permission, PolicyRule, AccessControl)
├── 05. Workflow Engine          (Workflow, WorkflowStep, ApprovalChain)
├── 06. Event Engine             (Activity, Event, Registration, Attendance)
├── 07. Task Engine              (Task, TaskList, Checklist, Dependency)
├── 08. Resource Engine          (Resource, Booking, Allocation)
├── 09. Communication Engine     (Channel, Message, Announcement, Notice)
├── 10. Document Engine          (Document, Template, Version, Folder)
├── 11. Program Engine           (Program, Cohort, Session, Curriculum)
├── 12. Finance Engine           (Budget, Expense, Transaction, Reimbursement)
└── 13. Analytics Engine         (Metric, Report, Dashboard, Query)
```

---

# 🏢 ENGINE 01: IDENTITY ENGINE

## Entity: Institution

The root tenant. Everything belongs to an institution.

```sql
institutions
├── id                  UUID PRIMARY KEY
├── code                VARCHAR(50) UNIQUE NOT NULL
├── name                VARCHAR(255) NOT NULL
├── short_name          VARCHAR(100)
├── type                ENUM(university, college, school, organization)
├── logo_url            TEXT
├── cover_url           TEXT
├── domain              VARCHAR(255) UNIQUE
├── website             TEXT
├── address             JSONB
├── contact             JSONB
├── settings            JSONB
├── subscription_plan   VARCHAR(50)
├── subscription_status ENUM(active, suspended, trial, expired)
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_institutions_code ON institutions(code);
CREATE INDEX idx_institutions_domain ON institutions(domain);
```

---

## Entity: Organization

A club, committee, chapter, society, or any organized group.

```sql
organizations
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NOT NULL REFERENCES institutions(id)
├── parent_id           UUID NULL REFERENCES organizations(id)
├── code                VARCHAR(50) NOT NULL
├── name                VARCHAR(255) NOT NULL
├── short_name          VARCHAR(100)
├── slug                VARCHAR(255) UNIQUE NOT NULL
├── type                ENUM(club, committee, chapter, society, cell, team, wing)
├── category            VARCHAR(100)
├── department          VARCHAR(100)
├── description         TEXT
├── mission             TEXT
├── vision              TEXT
├── objectives          JSONB
├── logo_url            TEXT
├── cover_url           TEXT
├── established_date    DATE
├── status              ENUM(active, inactive, suspended, archived)
├── visibility          ENUM(public, private, hidden)
├── settings            JSONB
├── contact             JSONB
├── social_links        JSONB
├── meeting_schedule    JSONB
├── location            VARCHAR(255)
├── verified            BOOLEAN DEFAULT FALSE
├── verified_at         TIMESTAMP NULL
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Relationships:**
- `institution_id` → Institution (many-to-one)
- `parent_id` → Organization (self-referencing, for sub-committees)

**Indexes:**
```sql
CREATE INDEX idx_organizations_institution ON organizations(institution_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);
```

**Business Rules:**
- `code` must be unique within institution
- `slug` must be globally unique (for public URLs)
- Deleted organizations cascade soft-delete to child entities

---

# 👤 ENGINE 02: PEOPLE ENGINE

## Entity: User

The core identity. A person who interacts with the system.

```sql
users
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NOT NULL REFERENCES institutions(id)
├── email               VARCHAR(255) UNIQUE NOT NULL
├── email_verified      BOOLEAN DEFAULT FALSE
├── phone               VARCHAR(20)
├── phone_verified      BOOLEAN DEFAULT FALSE
├── username            VARCHAR(100) UNIQUE
├── password_hash       VARCHAR(255)
├── auth_provider       ENUM(local, google, microsoft, saml, ldap)
├── auth_provider_id    VARCHAR(255)
├── first_name          VARCHAR(100)
├── last_name           VARCHAR(100)
├── display_name        VARCHAR(200)
├── avatar_url          TEXT
├── user_type           ENUM(student, faculty, staff, alumni, guest, admin)
├── student_id          VARCHAR(50)
├── employee_id         VARCHAR(50)
├── department          VARCHAR(100)
├── batch               VARCHAR(20)
├── year                INTEGER
├── division            VARCHAR(20)
├── status              ENUM(active, inactive, suspended, graduated)
├── preferences         JSONB
├── settings            JSONB
├── last_login_at       TIMESTAMP
├── last_active_at      TIMESTAMP
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
```

**Business Rules:**
- Email must be unique per institution
- Student ID must be unique per institution (if provided)
- Soft-deleted users retain their memberships (for historical data)

---

## Entity: Profile

Extended profile information. Separated for performance (not loaded every query).

```sql
profiles
├── user_id             UUID PRIMARY KEY REFERENCES users(id)
├── bio                 TEXT
├── date_of_birth       DATE
├── gender              ENUM(male, female, non_binary, prefer_not_to_say, other)
├── nationality         VARCHAR(100)
├── languages           JSONB
├── address             JSONB
├── emergency_contact   JSONB
├── social_links        JSONB
├── interests           JSONB
├── skills              JSONB
├── achievements        JSONB
├── custom_fields       JSONB
├── updated_at          TIMESTAMP DEFAULT NOW()
```

---

# 🎭 ENGINE 03: MEMBERSHIP ENGINE

## Entity: Membership

Connects a person to an organization with a role.

```sql
memberships
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── membership_type     ENUM(member, volunteer, participant, alumni, advisor)
├── status              ENUM(active, inactive, pending, rejected, expired)
├── joined_at           TIMESTAMP DEFAULT NOW()
├── approved_at         TIMESTAMP NULL
├── approved_by         UUID REFERENCES users(id)
├── expires_at          TIMESTAMP NULL
├── exit_at             TIMESTAMP NULL
├── exit_reason         TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
├── UNIQUE(organization_id, user_id, deleted_at)
```

**Indexes:**
```sql
CREATE INDEX idx_memberships_org ON memberships(organization_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);
```

---

## Entity: Role

A named set of permissions within an organization.

```sql
roles
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NULL REFERENCES organizations(id)
├── institution_id      UUID NULL REFERENCES institutions(id)
├── name                VARCHAR(100) NOT NULL
├── slug                VARCHAR(100) NOT NULL
├── description         TEXT
├── type                ENUM(system, custom)
├── level               INTEGER DEFAULT 0
├── is_leadership       BOOLEAN DEFAULT FALSE
├── permissions         JSONB
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
├── UNIQUE(organization_id, slug, deleted_at)
```

**System Roles:**
```
- super_admin       (institution-level)
- admin             (institution-level)
- faculty           (institution-level)
- president         (organization-level)
- vice_president    (organization-level)
- secretary         (organization-level)
- treasurer         (organization-level)
- coordinator       (organization-level)
- member            (organization-level)
- volunteer         (organization-level)
```

**Indexes:**
```sql
CREATE INDEX idx_roles_org ON roles(organization_id);
CREATE INDEX idx_roles_institution ON roles(institution_id);
CREATE INDEX idx_roles_slug ON roles(slug);
```

---

## Entity: UserRole

Assignment of a role to a user (can have multiple roles).

```sql
user_roles
├── id                  UUID PRIMARY KEY
├── user_id             UUID NOT NULL REFERENCES users(id)
├── role_id             UUID NOT NULL REFERENCES roles(id)
├── organization_id     UUID NULL REFERENCES organizations(id)
├── scope               ENUM(institution, organization, event, program)
├── scope_id            UUID NULL
├── assigned_by         UUID REFERENCES users(id)
├── assigned_at         TIMESTAMP DEFAULT NOW()
├── expires_at          TIMESTAMP NULL
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
├── UNIQUE(user_id, role_id, organization_id, scope, scope_id, deleted_at)
```

**Indexes:**
```sql
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX idx_user_roles_scope ON user_roles(scope, scope_id);
```

---

## Entity: Position

A leadership position within an organization (optional, higher-level than roles).

```sql
positions
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── title               VARCHAR(200) NOT NULL
├── description         TEXT
├── level               INTEGER DEFAULT 0
├── responsibilities    JSONB
├── requirements        JSONB
├── term_duration       INTEGER
├── is_elected          BOOLEAN DEFAULT FALSE
├── is_active           BOOLEAN DEFAULT TRUE
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: PositionHolder

Assignment of a position to a user for a specific term.

```sql
position_holders
├── id                  UUID PRIMARY KEY
├── position_id         UUID NOT NULL REFERENCES positions(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── term_start          DATE NOT NULL
├── term_end            DATE NOT NULL
├── appointed_by        UUID REFERENCES users(id)
├── appointed_at        TIMESTAMP
├── election_id         UUID NULL
├── status              ENUM(active, completed, resigned)
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

# 🔐 ENGINE 04: RBAC ENGINE

## Entity: Permission

Granular permission definition.

```sql
permissions
├── id                  UUID PRIMARY KEY
├── code                VARCHAR(100) UNIQUE NOT NULL
├── name                VARCHAR(200) NOT NULL
├── description         TEXT
├── category            VARCHAR(100)
├── resource            VARCHAR(100)
├── action              VARCHAR(100)
├── is_system           BOOLEAN DEFAULT TRUE
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
```

**Permission Format:**
```
{resource}.{action}

Examples:
- events.view
- events.create
- events.edit
- events.delete
- events.approve
- members.view
- members.invite
- members.remove
- finance.view
- finance.approve
- documents.upload
- tasks.assign
```

**Categories:**
```
- membership
- events
- tasks
- documents
- finance
- governance
- communication
- resources
- programs
- analytics
- admin
```

---

## Entity: RolePermission

Maps permissions to roles.

```sql
role_permissions
├── id                  UUID PRIMARY KEY
├── role_id             UUID NOT NULL REFERENCES roles(id)
├── permission_id       UUID NOT NULL REFERENCES permissions(id)
├── granted             BOOLEAN DEFAULT TRUE
├── conditions          JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── UNIQUE(role_id, permission_id)
```

---

## Entity: PolicyRule

Advanced permission rules (optional, for complex scenarios).

```sql
policy_rules
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NULL REFERENCES organizations(id)
├── institution_id      UUID NULL REFERENCES institutions(id)
├── name                VARCHAR(200) NOT NULL
├── description         TEXT
├── resource_type       VARCHAR(100)
├── action              VARCHAR(100)
├── effect              ENUM(allow, deny)
├── conditions          JSONB
├── priority            INTEGER DEFAULT 0
├── is_active           BOOLEAN DEFAULT TRUE
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

**Example Conditions (JSONB):**
```json
{
  "user_type": ["student"],
  "membership_status": ["active"],
  "event_status": ["draft", "pending"],
  "created_by": "$user.id",
  "organization_id": "$user.organizations"
}
```

---

# ⚙️ ENGINE 05: WORKFLOW ENGINE

## Entity: Workflow

A reusable workflow template.

```sql
workflows
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NULL REFERENCES institutions(id)
├── organization_id     UUID NULL REFERENCES organizations(id)
├── name                VARCHAR(200) NOT NULL
├── slug                VARCHAR(200) NOT NULL
├── description         TEXT
├── type                ENUM(approval, process, automation)
├── trigger_event       VARCHAR(100)
├── applicable_to       VARCHAR(100)
├── is_system           BOOLEAN DEFAULT FALSE
├── is_active           BOOLEAN DEFAULT TRUE
├── config              JSONB
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Workflow Types:**
```
Approval Workflows:
- event_approval
- expense_approval
- document_approval
- membership_approval

Process Workflows:
- event_lifecycle
- program_enrollment
- certificate_generation

Automation Workflows:
- task_auto_assignment
- notification_trigger
- reminder_cascade
```

---

## Entity: WorkflowStep

Individual steps in a workflow.

```sql
workflow_steps
├── id                  UUID PRIMARY KEY
├── workflow_id         UUID NOT NULL REFERENCES workflows(id)
├── name                VARCHAR(200) NOT NULL
├── slug                VARCHAR(200) NOT NULL
├── description         TEXT
├── step_order          INTEGER NOT NULL
├── step_type           ENUM(approval, action, condition, notification)
├── required            BOOLEAN DEFAULT TRUE
├── approver_type       ENUM(role, user, dynamic)
├── approver_config     JSONB
├── conditions          JSONB
├── actions             JSONB
├── sla_hours           INTEGER
├── escalation_config   JSONB
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

**Example approver_config:**
```json
{
  "type": "role",
  "role_slug": "president",
  "fallback": "vice_president"
}
```

---

## Entity: WorkflowInstance

A running instance of a workflow for a specific entity.

```sql
workflow_instances
├── id                  UUID PRIMARY KEY
├── workflow_id         UUID NOT NULL REFERENCES workflows(id)
├── entity_type         VARCHAR(100) NOT NULL
├── entity_id           UUID NOT NULL
├── organization_id     UUID NULL REFERENCES organizations(id)
├── current_step_id     UUID NULL REFERENCES workflow_steps(id)
├── status              ENUM(pending, in_progress, approved, rejected, cancelled, completed)
├── initiated_by        UUID REFERENCES users(id)
├── initiated_at        TIMESTAMP DEFAULT NOW()
├── completed_at        TIMESTAMP NULL
├── context             JSONB
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

**Indexes:**
```sql
CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
```

---

## Entity: WorkflowStepInstance

Execution of a specific workflow step.

```sql
workflow_step_instances
├── id                  UUID PRIMARY KEY
├── workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id)
├── workflow_step_id    UUID NOT NULL REFERENCES workflow_steps(id)
├── assigned_to         UUID NULL REFERENCES users(id)
├── status              ENUM(pending, in_progress, approved, rejected, skipped, escalated)
├── started_at          TIMESTAMP
├── completed_at        TIMESTAMP NULL
├── due_at              TIMESTAMP NULL
├── comments            TEXT
├── decision            ENUM(approve, reject, skip)
├── decision_reason     TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

---

# 🎪 ENGINE 06: EVENT ENGINE

## Entity: Activity (Base Table)

The universal base for any organizational activity.

```sql
activities
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NOT NULL REFERENCES institutions(id)
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── parent_id           UUID NULL REFERENCES activities(id)
├── activity_type       ENUM(event, meeting, session, workshop, training, competition, volunteer_activity)
├── code                VARCHAR(50)
├── title               VARCHAR(255) NOT NULL
├── slug                VARCHAR(255) UNIQUE NOT NULL
├── description         TEXT
├── category            VARCHAR(100)
├── tags                JSONB
├── status              ENUM(draft, pending_approval, approved, rejected, scheduled, in_progress, completed, cancelled, archived)
├── visibility          ENUM(public, private, members_only, invite_only)
├── is_featured         BOOLEAN DEFAULT FALSE
├── start_date          TIMESTAMP NOT NULL
├── end_date            TIMESTAMP NOT NULL
├── timezone            VARCHAR(50)
├── location_type       ENUM(physical, online, hybrid)
├── venue               VARCHAR(255)
├── venue_details       JSONB
├── online_link         TEXT
├── online_platform     VARCHAR(100)
├── cover_image_url     TEXT
├── max_participants    INTEGER
├── registration_required BOOLEAN DEFAULT FALSE
├── registration_start  TIMESTAMP NULL
├── registration_end    TIMESTAMP NULL
├── attendance_required BOOLEAN DEFAULT FALSE
├── certificate_enabled BOOLEAN DEFAULT FALSE
├── approval_required   BOOLEAN DEFAULT TRUE
├── workflow_id         UUID NULL REFERENCES workflows(id)
├── created_by          UUID NOT NULL REFERENCES users(id)
├── approved_by         UUID NULL REFERENCES users(id)
├── approved_at         TIMESTAMP NULL
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_activities_org ON activities(organization_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_dates ON activities(start_date, end_date);
CREATE INDEX idx_activities_slug ON activities(slug);
```

---

## Entity: Event (Extends Activity)

Event-specific fields.

```sql
events
├── activity_id         UUID PRIMARY KEY REFERENCES activities(id)
├── event_type          VARCHAR(100)
├── target_audience     JSONB
├── prerequisites       TEXT
├── objectives          JSONB
├── agenda              JSONB
├── speakers            JSONB
├── sponsors            JSONB
├── partners            JSONB
├── budget_allocated    DECIMAL(15,2)
├── budget_spent        DECIMAL(15,2)
├── expected_attendees  INTEGER
├── actual_attendees    INTEGER
├── feedback_form_id    UUID NULL
├── certificate_template_id UUID NULL
├── extra_fields        JSONB
├── updated_at          TIMESTAMP DEFAULT NOW()
```

---

## Entity: Meeting (Extends Activity)

Meeting-specific fields.

```sql
meetings
├── activity_id         UUID PRIMARY KEY REFERENCES activities(id)
├── meeting_type        ENUM(general, committee, board, emergency, annual)
├── agenda              JSONB
├── required_attendees  JSONB
├── optional_attendees  JSONB
├── minutes             TEXT
├── decisions           JSONB
├── action_items        JSONB
├── next_meeting_date   TIMESTAMP NULL
├── recording_url       TEXT
├── extra_fields        JSONB
├── updated_at          TIMESTAMP DEFAULT NOW()
```

---

## Entity: Registration

Participant registration for activities.

```sql
registrations
├── id                  UUID PRIMARY KEY
├── activity_id         UUID NOT NULL REFERENCES activities(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── registration_type   ENUM(individual, team, group)
├── team_name           VARCHAR(200)
├── team_members        JSONB
├── status              ENUM(pending, approved, rejected, waitlisted, confirmed, cancelled, attended)
├── payment_required    BOOLEAN DEFAULT FALSE
├── payment_status      ENUM(pending, completed, failed, refunded)
├── payment_amount      DECIMAL(10,2)
├── payment_id          VARCHAR(255)
├── form_data           JSONB
├── qr_code             TEXT
├── check_in_code       VARCHAR(20)
├── checked_in          BOOLEAN DEFAULT FALSE
├── checked_in_at       TIMESTAMP NULL
├── checked_in_by       UUID NULL REFERENCES users(id)
├── certificate_issued  BOOLEAN DEFAULT FALSE
├── certificate_id      UUID NULL
├── notes               TEXT
├── metadata            JSONB
├── registered_at       TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
├── UNIQUE(activity_id, user_id, deleted_at)
```

**Indexes:**
```sql
CREATE INDEX idx_registrations_activity ON registrations(activity_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_check_in_code ON registrations(check_in_code);
```

---

## Entity: Attendance

Attendance tracking for activities.

```sql
attendance
├── id                  UUID PRIMARY KEY
├── activity_id         UUID NOT NULL REFERENCES activities(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── registration_id     UUID NULL REFERENCES registrations(id)
├── status              ENUM(present, absent, late, excused, guest)
├── check_in_time       TIMESTAMP NULL
├── check_out_time      TIMESTAMP NULL
├── duration_minutes    INTEGER
├── location            VARCHAR(255)
├── method              ENUM(manual, qr, barcode, student_id, pin, import, system)
├── recorded_by         UUID NULL REFERENCES users(id)
├── notes               TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── UNIQUE(activity_id, user_id)
```

**Indexes:**
```sql
CREATE INDEX idx_attendance_activity ON attendance(activity_id);
CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_status ON attendance(status);
```

---

## Entity: ActivityTeam

Team/committee assigned to an activity.

```sql
activity_teams
├── id                  UUID PRIMARY KEY
├── activity_id         UUID NOT NULL REFERENCES activities(id)
├── name                VARCHAR(200) NOT NULL
├── role                VARCHAR(100)
├── responsibilities    JSONB
├── lead_id             UUID NULL REFERENCES users(id)
├── members             JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

---

# ✅ ENGINE 07: TASK ENGINE

## Entity: TaskList

A collection of related tasks.

```sql
task_lists
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── parent_type         VARCHAR(100)
├── parent_id           UUID
├── name                VARCHAR(255) NOT NULL
├── description         TEXT
├── status              ENUM(active, completed, archived)
├── progress_percent    INTEGER DEFAULT 0
├── due_date            TIMESTAMP NULL
├── created_by          UUID REFERENCES users(id)
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_task_lists_org ON task_lists(organization_id);
CREATE INDEX idx_task_lists_parent ON task_lists(parent_type, parent_id);
```

---

## Entity: Task

Individual task.

```sql
tasks
├── id                  UUID PRIMARY KEY
├── task_list_id        UUID NULL REFERENCES task_lists(id)
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── parent_task_id      UUID NULL REFERENCES tasks(id)
├── parent_type         VARCHAR(100)
├── parent_id           UUID
├── title               VARCHAR(255) NOT NULL
├── description         TEXT
├── status              ENUM(todo, in_progress, in_review, blocked, completed, cancelled)
├── priority            ENUM(low, medium, high, urgent)
├── assigned_to         UUID NULL REFERENCES users(id)
├── assigned_by         UUID NULL REFERENCES users(id)
├── assigned_at         TIMESTAMP NULL
├── reporter            UUID NULL REFERENCES users(id)
├── start_date          TIMESTAMP NULL
├── due_date            TIMESTAMP NULL
├── completed_at        TIMESTAMP NULL
├── completed_by        UUID NULL REFERENCES users(id)
├── estimated_hours     DECIMAL(6,2)
├── actual_hours        DECIMAL(6,2)
├── tags                JSONB
├── attachments         JSONB
├── dependencies        JSONB
├── checklist           JSONB
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_tasks_list ON tasks(task_list_id);
CREATE INDEX idx_tasks_org ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent ON tasks(parent_type, parent_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

---

## Entity: TaskComment

Comments on tasks.

```sql
task_comments
├── id                  UUID PRIMARY KEY
├── task_id             UUID NOT NULL REFERENCES tasks(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── comment             TEXT NOT NULL
├── attachments         JSONB
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

# 🏢 ENGINE 08: RESOURCE ENGINE

## Entity: Resource

Physical or digital resources managed by the institution/organization.

```sql
resources
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NOT NULL REFERENCES institutions(id)
├── organization_id     UUID NULL REFERENCES organizations(id)
├── code                VARCHAR(50)
├── name                VARCHAR(255) NOT NULL
├── type                ENUM(room, lab, auditorium, equipment, vehicle, device, digital)
├── category            VARCHAR(100)
├── description         TEXT
├── location            VARCHAR(255)
├── capacity            INTEGER
├── status              ENUM(available, unavailable, maintenance, retired)
├── is_bookable         BOOLEAN DEFAULT TRUE
├── requires_approval   BOOLEAN DEFAULT TRUE
├── specifications      JSONB
├── images              JSONB
├── booking_rules       JSONB
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_resources_institution ON resources(institution_id);
CREATE INDEX idx_resources_org ON resources(organization_id);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_status ON resources(status);
```

---

## Entity: ResourceBooking

Booking/reservation of resources.

```sql
resource_bookings
├── id                  UUID PRIMARY KEY
├── resource_id         UUID NOT NULL REFERENCES resources(id)
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── activity_id         UUID NULL REFERENCES activities(id)
├── booked_by           UUID NOT NULL REFERENCES users(id)
├── purpose             TEXT
├── start_time          TIMESTAMP NOT NULL
├── end_time            TIMESTAMP NOT NULL
├── status              ENUM(pending, approved, rejected, confirmed, in_use, completed, cancelled)
├── approved_by         UUID NULL REFERENCES users(id)
├── approved_at         TIMESTAMP NULL
├── rejection_reason    TEXT
├── check_in_time       TIMESTAMP NULL
├── check_out_time      TIMESTAMP NULL
├── actual_usage        JSONB
├── notes               TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_bookings_resource ON resource_bookings(resource_id);
CREATE INDEX idx_bookings_activity ON resource_bookings(activity_id);
CREATE INDEX idx_bookings_time ON resource_bookings(start_time, end_time);
CREATE INDEX idx_bookings_status ON resource_bookings(status);
```

---

## Entity: ResourceAllocation

Allocation of resources to activities (pre-booking).

```sql
resource_allocations
├── id                  UUID PRIMARY KEY
├── resource_id         UUID NOT NULL REFERENCES resources(id)
├── activity_id         UUID NOT NULL REFERENCES activities(id)
├── quantity            INTEGER DEFAULT 1
├── allocated_by        UUID REFERENCES users(id)
├── allocated_at        TIMESTAMP DEFAULT NOW()
├── notes               TEXT
├── metadata            JSONB
```

---

# 💬 ENGINE 09: COMMUNICATION ENGINE

## Entity: Channel

Communication channel (like Slack channels).

```sql
channels
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── name                VARCHAR(200) NOT NULL
├── slug                VARCHAR(200) NOT NULL
├── description         TEXT
├── type                ENUM(public, private, announcement, direct)
├── category            VARCHAR(100)
├── parent_type         VARCHAR(100)
├── parent_id           UUID
├── is_archived         BOOLEAN DEFAULT FALSE
├── settings            JSONB
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: ChannelMember

Members of a channel.

```sql
channel_members
├── id                  UUID PRIMARY KEY
├── channel_id          UUID NOT NULL REFERENCES channels(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── role                ENUM(owner, admin, moderator, member)
├── can_post            BOOLEAN DEFAULT TRUE
├── notifications       ENUM(all, mentions, none)
├── joined_at           TIMESTAMP DEFAULT NOW()
├── last_read_at        TIMESTAMP NULL
├── metadata            JSONB
├── UNIQUE(channel_id, user_id)
```

---

## Entity: Message

Messages in channels.

```sql
messages
├── id                  UUID PRIMARY KEY
├── channel_id          UUID NOT NULL REFERENCES channels(id)
├── parent_message_id   UUID NULL REFERENCES messages(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── content             TEXT NOT NULL
├── content_type        ENUM(text, markdown, html)
├── attachments         JSONB
├── mentions            JSONB
├── reactions           JSONB
├── is_pinned           BOOLEAN DEFAULT FALSE
├── is_edited           BOOLEAN DEFAULT FALSE
├── edited_at           TIMESTAMP NULL
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_parent ON messages(parent_message_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

---

## Entity: Announcement

Official announcements (different from chat messages).

```sql
announcements
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── title               VARCHAR(255) NOT NULL
├── content             TEXT NOT NULL
├── type                ENUM(general, urgent, event, deadline, achievement)
├── priority            ENUM(low, medium, high, critical)
├── target_audience     JSONB
├── published_by        UUID NOT NULL REFERENCES users(id)
├── published_at        TIMESTAMP
├── expires_at          TIMESTAMP NULL
├── attachments         JSONB
├── read_tracking       BOOLEAN DEFAULT FALSE
├── status              ENUM(draft, scheduled, published, expired, archived)
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: Notice

Formal notices (institutional/administrative).

```sql
notices
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NOT NULL REFERENCES institutions(id)
├── organization_id     UUID NULL REFERENCES organizations(id)
├── notice_number       VARCHAR(50)
├── title               VARCHAR(255) NOT NULL
├── content             TEXT NOT NULL
├── category            VARCHAR(100)
├── target_audience     JSONB
├── publish_date        TIMESTAMP NOT NULL
├── expiry_date         TIMESTAMP NULL
├── attachments         JSONB
├── requires_acknowledgment BOOLEAN DEFAULT FALSE
├── issued_by           UUID NOT NULL REFERENCES users(id)
├── approved_by         UUID NULL REFERENCES users(id)
├── status              ENUM(draft, pending_approval, published, expired, archived)
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: Poll

Polls and surveys.

```sql
polls
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── channel_id          UUID NULL REFERENCES channels(id)
├── activity_id         UUID NULL REFERENCES activities(id)
├── question            TEXT NOT NULL
├── type                ENUM(single_choice, multiple_choice, rating, open_ended)
├── options             JSONB
├── settings            JSONB
├── target_audience     JSONB
├── is_anonymous        BOOLEAN DEFAULT FALSE
├── allow_multiple      BOOLEAN DEFAULT FALSE
├── start_date          TIMESTAMP
├── end_date            TIMESTAMP NULL
├── status              ENUM(draft, active, closed, archived)
├── created_by          UUID REFERENCES users(id)
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: PollResponse

Individual poll responses.

```sql
poll_responses
├── id                  UUID PRIMARY KEY
├── poll_id             UUID NOT NULL REFERENCES polls(id)
├── user_id             UUID NULL REFERENCES users(id)
├── response            JSONB NOT NULL
├── submitted_at        TIMESTAMP DEFAULT NOW()
├── metadata            JSONB
├── UNIQUE(poll_id, user_id)
```

---

# 📄 ENGINE 10: DOCUMENT ENGINE

## Entity: Folder

Hierarchical folder structure.

```sql
folders
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── parent_id           UUID NULL REFERENCES folders(id)
├── name                VARCHAR(255) NOT NULL
├── description         TEXT
├── path                TEXT
├── type                VARCHAR(100)
├── parent_type         VARCHAR(100)
├── parent_id_ref       UUID
├── access_level        ENUM(public, members, private, restricted)
├── permissions         JSONB
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: Document

Core document entity.

```sql
documents
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── folder_id           UUID NULL REFERENCES folders(id)
├── parent_type         VARCHAR(100)
├── parent_id           UUID
├── document_type       ENUM(general, letter, report, certificate, policy, sop, meeting_minutes, proposal, agreement, template)
├── title               VARCHAR(255) NOT NULL
├── description         TEXT
├── file_name           VARCHAR(255)
├── file_url            TEXT
├── file_size           BIGINT
├── file_type           VARCHAR(100)
├── mime_type           VARCHAR(100)
├── version             INTEGER DEFAULT 1
├── status              ENUM(draft, pending_approval, approved, rejected, published, archived)
├── access_level        ENUM(public, members, private, restricted)
├── tags                JSONB
├── metadata            JSONB
├── uploaded_by         UUID NOT NULL REFERENCES users(id)
├── approved_by         UUID NULL REFERENCES users(id)
├── approved_at         TIMESTAMP NULL
├── published_at        TIMESTAMP NULL
├── expires_at          TIMESTAMP NULL
├── download_count      INTEGER DEFAULT 0
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_documents_folder ON documents(folder_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_parent ON documents(parent_type, parent_id);
CREATE INDEX idx_documents_status ON documents(status);
```

---

## Entity: DocumentVersion

Version history for documents.

```sql
document_versions
├── id                  UUID PRIMARY KEY
├── document_id         UUID NOT NULL REFERENCES documents(id)
├── version             INTEGER NOT NULL
├── file_url            TEXT NOT NULL
├── file_size           BIGINT
├── changes             TEXT
├── uploaded_by         UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── UNIQUE(document_id, version)
```

---

## Entity: Template

Reusable document templates.

```sql
templates
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NULL REFERENCES organizations(id)
├── institution_id      UUID NULL REFERENCES institutions(id)
├── name                VARCHAR(255) NOT NULL
├── type                VARCHAR(100)
├── category            VARCHAR(100)
├── description         TEXT
├── content             TEXT
├── variables           JSONB
├── format              ENUM(text, html, markdown, docx, pdf)
├── file_url            TEXT
├── is_system           BOOLEAN DEFAULT FALSE
├── is_active           BOOLEAN DEFAULT TRUE
├── usage_count         INTEGER DEFAULT 0
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Template Types:**
```
- permission_letter
- invitation_letter
- appreciation_letter
- sponsorship_proposal
- event_report
- meeting_minutes
- certificate
- od_request
- venue_request
```

---

## Entity: Certificate

Certificates issued to participants.

```sql
certificates
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NOT NULL REFERENCES institutions(id)
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── activity_id         UUID NULL REFERENCES activities(id)
├── program_id          UUID NULL REFERENCES programs(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── template_id         UUID NULL REFERENCES templates(id)
├── certificate_number  VARCHAR(100) UNIQUE
├── title               VARCHAR(255) NOT NULL
├── description         TEXT
├── issued_for          TEXT
├── issued_date         DATE NOT NULL
├── valid_until         DATE NULL
├── file_url            TEXT
├── qr_code             TEXT
├── verification_url    TEXT
├── signatories         JSONB
├── metadata            JSONB
├── issued_by           UUID REFERENCES users(id)
├── status              ENUM(draft, issued, revoked, expired)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

**Indexes:**
```sql
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_activity ON certificates(activity_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_org ON certificates(organization_id);
```

---

# 🎓 ENGINE 11: PROGRAM ENGINE

## Entity: Program

Long-term learning programs (LLC, workshops, training).

```sql
programs
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NOT NULL REFERENCES institutions(id)
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── code                VARCHAR(50)
├── name                VARCHAR(255) NOT NULL
├── slug                VARCHAR(255) UNIQUE NOT NULL
├── type                ENUM(llc, workshop_series, training, certification, mentorship, cohort)
├── description         TEXT
├── objectives          JSONB
├── duration_weeks      INTEGER
├── total_sessions      INTEGER
├── category            VARCHAR(100)
├── level               ENUM(beginner, intermediate, advanced)
├── prerequisites       TEXT
├── target_audience     JSONB
├── max_participants    INTEGER
├── enrollment_start    TIMESTAMP
├── enrollment_end      TIMESTAMP
├── program_start       TIMESTAMP
├── program_end         TIMESTAMP
├── schedule            JSONB
├── curriculum          JSONB
├── faculty             JSONB
├── status              ENUM(draft, open, in_progress, completed, cancelled, archived)
├── visibility          ENUM(public, private, invite_only)
├── certificate_enabled BOOLEAN DEFAULT TRUE
├── certificate_template_id UUID NULL
├── cover_image_url     TEXT
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_programs_org ON programs(organization_id);
CREATE INDEX idx_programs_type ON programs(type);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_slug ON programs(slug);
```

---

## Entity: Cohort

A batch of students in a program.

```sql
cohorts
├── id                  UUID PRIMARY KEY
├── program_id          UUID NOT NULL REFERENCES programs(id)
├── name                VARCHAR(200) NOT NULL
├── year                INTEGER
├── division            VARCHAR(50)
├── max_participants    INTEGER
├── enrolled_count      INTEGER DEFAULT 0
├── start_date          DATE
├── end_date            DATE
├── schedule            JSONB
├── faculty_id          UUID NULL REFERENCES users(id)
├── status              ENUM(active, completed, cancelled)
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: ProgramEnrollment

Student enrollment in programs.

```sql
program_enrollments
├── id                  UUID PRIMARY KEY
├── program_id          UUID NOT NULL REFERENCES programs(id)
├── cohort_id           UUID NULL REFERENCES cohorts(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── status              ENUM(pending, enrolled, in_progress, completed, dropped, failed)
├── enrolled_at         TIMESTAMP DEFAULT NOW()
├── completed_at        TIMESTAMP NULL
├── progress_percent    INTEGER DEFAULT 0
├── attendance_percent  DECIMAL(5,2)
├── performance_score   DECIMAL(5,2)
├── certificate_issued  BOOLEAN DEFAULT FALSE
├── certificate_id      UUID NULL REFERENCES certificates(id)
├── notes               TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
├── UNIQUE(program_id, cohort_id, user_id, deleted_at)
```

---

## Entity: Session

Individual session within a program.

```sql
sessions
├── id                  UUID PRIMARY KEY
├── program_id          UUID NOT NULL REFERENCES programs(id)
├── cohort_id           UUID NULL REFERENCES cohorts(id)
├── activity_id         UUID NULL REFERENCES activities(id)
├── session_number      INTEGER NOT NULL
├── title               VARCHAR(255) NOT NULL
├── description         TEXT
├── topics              JSONB
├── learning_objectives JSONB
├── date                TIMESTAMP NOT NULL
├── duration_minutes    INTEGER
├── location            VARCHAR(255)
├── faculty_id          UUID NULL REFERENCES users(id)
├── materials           JSONB
├── assignments         JSONB
├── status              ENUM(scheduled, in_progress, completed, cancelled)
├── attendance_taken    BOOLEAN DEFAULT FALSE
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: Assignment

Assignments for program participants.

```sql
assignments
├── id                  UUID PRIMARY KEY
├── program_id          UUID NOT NULL REFERENCES programs(id)
├── session_id          UUID NULL REFERENCES sessions(id)
├── title               VARCHAR(255) NOT NULL
├── description         TEXT
├── type                ENUM(task, quiz, project, presentation, practical)
├── instructions        TEXT
├── attachments         JSONB
├── max_score           DECIMAL(6,2)
├── due_date            TIMESTAMP
├── submission_type     ENUM(file, link, text, none)
├── is_mandatory        BOOLEAN DEFAULT TRUE
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: AssignmentSubmission

Student submissions for assignments.

```sql
assignment_submissions
├── id                  UUID PRIMARY KEY
├── assignment_id       UUID NOT NULL REFERENCES assignments(id)
├── user_id             UUID NOT NULL REFERENCES users(id)
├── submission_type     VARCHAR(50)
├── submission_content  TEXT
├── attachments         JSONB
├── submitted_at        TIMESTAMP DEFAULT NOW()
├── status              ENUM(pending, submitted, graded, returned)
├── score               DECIMAL(6,2)
├── feedback            TEXT
├── graded_by           UUID NULL REFERENCES users(id)
├── graded_at           TIMESTAMP NULL
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── UNIQUE(assignment_id, user_id)
```

---

# 💰 ENGINE 12: FINANCE ENGINE

## Entity: Budget

Annual or event-specific budget.

```sql
budgets
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── budget_type         ENUM(annual, event, project, program)
├── parent_type         VARCHAR(100)
├── parent_id           UUID
├── name                VARCHAR(255) NOT NULL
├── financial_year      VARCHAR(20)
├── total_allocated     DECIMAL(15,2) NOT NULL
├── total_spent         DECIMAL(15,2) DEFAULT 0
├── total_committed     DECIMAL(15,2) DEFAULT 0
├── total_remaining     DECIMAL(15,2) GENERATED ALWAYS AS (total_allocated - total_spent - total_committed) STORED
├── categories          JSONB
├── start_date          DATE
├── end_date            DATE
├── status              ENUM(draft, pending_approval, approved, active, closed)
├── approved_by         UUID NULL REFERENCES users(id)
├── approved_at         TIMESTAMP NULL
├── notes               TEXT
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: BudgetCategory

Budget breakdown by category.

```sql
budget_categories
├── id                  UUID PRIMARY KEY
├── budget_id           UUID NOT NULL REFERENCES budgets(id)
├── name                VARCHAR(200) NOT NULL
├── code                VARCHAR(50)
├── allocated_amount    DECIMAL(15,2) NOT NULL
├── spent_amount        DECIMAL(15,2) DEFAULT 0
├── committed_amount    DECIMAL(15,2) DEFAULT 0
├── description         TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

---

## Entity: Expense

Individual expense record.

```sql
expenses
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── budget_id           UUID NULL REFERENCES budgets(id)
├── category_id         UUID NULL REFERENCES budget_categories(id)
├── expense_number      VARCHAR(50)
├── title               VARCHAR(255) NOT NULL
├── description         TEXT
├── expense_type        ENUM(purchase, service, reimbursement, honorarium, transport, food, venue, equipment, other)
├── amount              DECIMAL(15,2) NOT NULL
├── currency            VARCHAR(10) DEFAULT 'INR'
├── expense_date        DATE NOT NULL
├── vendor              VARCHAR(255)
├── vendor_details      JSONB
├── payment_method      ENUM(cash, upi, bank_transfer, cheque, card)
├── payment_status      ENUM(pending, paid, partially_paid, failed)
├── paid_amount         DECIMAL(15,2) DEFAULT 0
├── status              ENUM(draft, pending_approval, approved, rejected, paid)
├── receipts            JSONB
├── approval_chain      JSONB
├── requested_by        UUID NOT NULL REFERENCES users(id)
├── approved_by         UUID NULL REFERENCES users(id)
├── approved_at         TIMESTAMP NULL
├── paid_by             UUID NULL REFERENCES users(id)
├── paid_at             TIMESTAMP NULL
├── notes               TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

**Indexes:**
```sql
CREATE INDEX idx_expenses_org ON expenses(organization_id);
CREATE INDEX idx_expenses_budget ON expenses(budget_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
```

---

## Entity: Reimbursement

Expense reimbursement requests.

```sql
reimbursements
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── expense_id          UUID NULL REFERENCES expenses(id)
├── reimbursement_number VARCHAR(50)
├── requested_by        UUID NOT NULL REFERENCES users(id)
├── amount              DECIMAL(15,2) NOT NULL
├── purpose             TEXT NOT NULL
├── expense_date        DATE NOT NULL
├── category            VARCHAR(100)
├── receipts            JSONB NOT NULL
├── bank_details        JSONB
├── status              ENUM(pending, under_review, approved, rejected, paid)
├── reviewed_by         UUID NULL REFERENCES users(id)
├── reviewed_at         TIMESTAMP NULL
├── approved_by         UUID NULL REFERENCES users(id)
├── approved_at         TIMESTAMP NULL
├── rejection_reason    TEXT
├── paid_amount         DECIMAL(15,2)
├── paid_at             TIMESTAMP NULL
├── notes               TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: Transaction

Financial transaction log.

```sql
transactions
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── transaction_number  VARCHAR(50)
├── transaction_type    ENUM(income, expense, transfer, refund)
├── amount              DECIMAL(15,2) NOT NULL
├── currency            VARCHAR(10) DEFAULT 'INR'
├── transaction_date    TIMESTAMP NOT NULL
├── source_type         VARCHAR(100)
├── source_id           UUID
├── category            VARCHAR(100)
├── description         TEXT
├── payment_method      VARCHAR(100)
├── reference_number    VARCHAR(255)
├── bank_details        JSONB
├── status              ENUM(pending, completed, failed, cancelled)
├── recorded_by         UUID REFERENCES users(id)
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

---

## Entity: Sponsorship

Sponsorship tracking.

```sql
sponsorships
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── activity_id         UUID NULL REFERENCES activities(id)
├── sponsor_name        VARCHAR(255) NOT NULL
├── sponsor_type        ENUM(title, platinum, gold, silver, bronze, in_kind, custom)
├── contact_person      VARCHAR(255)
├── contact_details     JSONB
├── amount              DECIMAL(15,2)
├── currency            VARCHAR(10) DEFAULT 'INR'
├── sponsorship_details TEXT
├── deliverables        JSONB
├── agreement_url       TEXT
├── status              ENUM(prospect, negotiation, confirmed, delivered, completed)
├── payment_status      ENUM(pending, partial, completed)
├── payment_received    DECIMAL(15,2) DEFAULT 0
├── start_date          DATE
├── end_date            DATE
├── notes               TEXT
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

# 📊 ENGINE 13: ANALYTICS ENGINE

## Entity: Metric

Predefined metrics tracked over time.

```sql
metrics
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NULL REFERENCES institutions(id)
├── organization_id     UUID NULL REFERENCES organizations(id)
├── metric_key          VARCHAR(100) NOT NULL
├── metric_name         VARCHAR(200) NOT NULL
├── category            VARCHAR(100)
├── description         TEXT
├── unit                VARCHAR(50)
├── calculation_method  TEXT
├── target_value        DECIMAL(15,2)
├── is_system           BOOLEAN DEFAULT FALSE
├── is_active           BOOLEAN DEFAULT TRUE
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

**System Metrics:**
```
Organization:
- total_members
- active_members
- member_growth_rate
- retention_rate

Events:
- total_events
- events_per_month
- average_attendance
- attendance_rate
- participant_satisfaction

Programs:
- total_programs
- enrolled_students
- completion_rate
- average_performance

Finance:
- budget_utilization
- expense_ratio
- sponsorship_revenue

Engagement:
- message_count
- active_users
- task_completion_rate
```

---

## Entity: MetricValue

Time-series values for metrics.

```sql
metric_values
├── id                  UUID PRIMARY KEY
├── metric_id           UUID NOT NULL REFERENCES metrics(id)
├── organization_id     UUID NULL REFERENCES organizations(id)
├── entity_type         VARCHAR(100)
├── entity_id           UUID
├── value               DECIMAL(15,2) NOT NULL
├── period              VARCHAR(20)
├── period_start        DATE NOT NULL
├── period_end          DATE NOT NULL
├── dimensions          JSONB
├── metadata            JSONB
├── recorded_at         TIMESTAMP DEFAULT NOW()
```

**Indexes:**
```sql
CREATE INDEX idx_metric_values_metric ON metric_values(metric_id);
CREATE INDEX idx_metric_values_org ON metric_values(organization_id);
CREATE INDEX idx_metric_values_period ON metric_values(period_start, period_end);
```

---

## Entity: Report

Generated reports.

```sql
reports
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NOT NULL REFERENCES organizations(id)
├── report_type         VARCHAR(100) NOT NULL
├── title               VARCHAR(255) NOT NULL
├── description         TEXT
├── parameters          JSONB
├── data                JSONB
├── file_url            TEXT
├── format              ENUM(json, pdf, excel, csv)
├── period_start        DATE
├── period_end          DATE
├── status              ENUM(pending, generating, completed, failed)
├── generated_by        UUID REFERENCES users(id)
├── generated_at        TIMESTAMP NULL
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

**Report Types:**
```
- event_report
- attendance_report
- financial_report
- membership_report
- program_report
- annual_report
- activity_summary
- student_passport
- club_health
```

---

## Entity: Dashboard

Custom dashboards.

```sql
dashboards
├── id                  UUID PRIMARY KEY
├── organization_id     UUID NULL REFERENCES organizations(id)
├── user_id             UUID NULL REFERENCES users(id)
├── name                VARCHAR(200) NOT NULL
├── description         TEXT
├── type                ENUM(personal, organization, system)
├── layout              JSONB
├── widgets             JSONB
├── filters             JSONB
├── is_default          BOOLEAN DEFAULT FALSE
├── is_shared           BOOLEAN DEFAULT FALSE
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

# 🔔 CROSS-CUTTING CONCERNS

## Entity: Notification

System notifications.

```sql
notifications
├── id                  UUID PRIMARY KEY
├── user_id             UUID NOT NULL REFERENCES users(id)
├── type                VARCHAR(100) NOT NULL
├── title               VARCHAR(255) NOT NULL
├── message             TEXT
├── action_url          TEXT
├── entity_type         VARCHAR(100)
├── entity_id           UUID
├── priority            ENUM(low, normal, high, urgent)
├── channel             ENUM(in_app, email, push, sms)
├── is_read             BOOLEAN DEFAULT FALSE
├── read_at             TIMESTAMP NULL
├── sent_at             TIMESTAMP NULL
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
```

**Indexes:**
```sql
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## Entity: AuditLog

Complete audit trail.

```sql
audit_logs
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NULL REFERENCES institutions(id)
├── organization_id     UUID NULL REFERENCES organizations(id)
├── user_id             UUID NULL REFERENCES users(id)
├── action              VARCHAR(100) NOT NULL
├── entity_type         VARCHAR(100) NOT NULL
├── entity_id           UUID NOT NULL
├── changes             JSONB
├── old_values          JSONB
├── new_values          JSONB
├── ip_address          VARCHAR(45)
├── user_agent          TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
```

**Indexes:**
```sql
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

---

## Entity: ActivityLog

User activity tracking.

```sql
activity_logs
├── id                  UUID PRIMARY KEY
├── user_id             UUID NOT NULL REFERENCES users(id)
├── activity_type       VARCHAR(100) NOT NULL
├── entity_type         VARCHAR(100)
├── entity_id           UUID
├── description         TEXT
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
```

---

## Entity: FileUpload

Centralized file metadata.

```sql
file_uploads
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NOT NULL REFERENCES institutions(id)
├── organization_id     UUID NULL REFERENCES organizations(id)
├── entity_type         VARCHAR(100)
├── entity_id           UUID
├── file_name           VARCHAR(255) NOT NULL
├── file_path           TEXT NOT NULL
├── file_url            TEXT NOT NULL
├── file_size           BIGINT NOT NULL
├── mime_type           VARCHAR(100) NOT NULL
├── file_type           VARCHAR(50)
├── storage_provider    VARCHAR(50)
├── storage_key         TEXT
├── checksum            VARCHAR(255)
├── uploaded_by         UUID REFERENCES users(id)
├── metadata            JSONB
├── created_at          TIMESTAMP DEFAULT NOW()
├── deleted_at          TIMESTAMP NULL
```

---

## Entity: Setting

System/organization settings.

```sql
settings
├── id                  UUID PRIMARY KEY
├── scope               ENUM(system, institution, organization, user)
├── scope_id            UUID
├── key                 VARCHAR(255) NOT NULL
├── value               JSONB NOT NULL
├── type                VARCHAR(50)
├── is_encrypted        BOOLEAN DEFAULT FALSE
├── is_public           BOOLEAN DEFAULT FALSE
├── metadata            JSONB
├── updated_by          UUID REFERENCES users(id)
├── updated_at          TIMESTAMP DEFAULT NOW()
├── UNIQUE(scope, scope_id, key)
```

---

## Entity: Integration

External integrations.

```sql
integrations
├── id                  UUID PRIMARY KEY
├── institution_id      UUID NULL REFERENCES institutions(id)
├── organization_id     UUID NULL REFERENCES organizations(id)
├── provider            VARCHAR(100) NOT NULL
├── provider_type       ENUM(sso, storage, calendar, communication, payment, analytics, custom)
├── config              JSONB
├── credentials         JSONB
├── is_active           BOOLEAN DEFAULT TRUE
├── last_sync_at        TIMESTAMP NULL
├── metadata            JSONB
├── created_by          UUID REFERENCES users(id)
├── created_at          TIMESTAMP DEFAULT NOW()
├── updated_at          TIMESTAMP DEFAULT NOW()
```

---

# 🎯 ENUMERATION REFERENCE

```sql
-- All enums used in the schema

CREATE TYPE institution_type AS ENUM ('university', 'college', 'school', 'organization');
CREATE TYPE subscription_status AS ENUM ('active', 'suspended', 'trial', 'expired');

CREATE TYPE organization_type AS ENUM ('club', 'committee', 'chapter', 'society', 'cell', 'team', 'wing');
CREATE TYPE organization_status AS ENUM ('active', 'inactive', 'suspended', 'archived');
CREATE TYPE visibility_level AS ENUM ('public', 'private', 'hidden');

CREATE TYPE user_type AS ENUM ('student', 'faculty', 'staff', 'alumni', 'guest', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'graduated');
CREATE TYPE auth_provider AS ENUM ('local', 'google', 'microsoft', 'saml', 'ldap');

CREATE TYPE membership_type AS ENUM ('member', 'volunteer', 'participant', 'alumni', 'advisor');
CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'pending', 'rejected', 'expired');

CREATE TYPE activity_type AS ENUM ('event', 'meeting', 'session', 'workshop', 'training', 'competition', 'volunteer_activity');
CREATE TYPE activity_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'in_progress', 'completed', 'cancelled', 'archived');
CREATE TYPE location_type AS ENUM ('physical', 'online', 'hybrid');

CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected', 'waitlisted', 'confirmed', 'cancelled', 'attended');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused', 'guest');
CREATE TYPE attendance_method AS ENUM ('manual', 'qr', 'barcode', 'student_id', 'pin', 'import', 'system');

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE resource_type AS ENUM ('room', 'lab', 'auditorium', 'equipment', 'vehicle', 'device', 'digital');
CREATE TYPE resource_status AS ENUM ('available', 'unavailable', 'maintenance', 'retired');
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'confirmed', 'in_use', 'completed', 'cancelled');

CREATE TYPE channel_type AS ENUM ('public', 'private', 'announcement', 'direct');
CREATE TYPE message_content_type AS ENUM ('text', 'markdown', 'html');

CREATE TYPE announcement_type AS ENUM ('general', 'urgent', 'event', 'deadline', 'achievement');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE document_type AS ENUM ('general', 'letter', 'report', 'certificate', 'policy', 'sop', 'meeting_minutes', 'proposal', 'agreement', 'template');
CREATE TYPE document_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'published', 'archived');
CREATE TYPE access_level AS ENUM ('public', 'members', 'private', 'restricted');

CREATE TYPE program_type AS ENUM ('llc', 'workshop_series', 'training', 'certification', 'mentorship', 'cohort');
CREATE TYPE program_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE program_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled', 'archived');

CREATE TYPE enrollment_status AS ENUM ('pending', 'enrolled', 'in_progress', 'completed', 'dropped', 'failed');

CREATE TYPE budget_type AS ENUM ('annual', 'event', 'project', 'program');
CREATE TYPE expense_type AS ENUM ('purchase', 'service', 'reimbursement', 'honorarium', 'transport', 'food', 'venue', 'equipment', 'other');
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'bank_transfer', 'cheque', 'card');

CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer', 'refund');

CREATE TYPE workflow_type AS ENUM ('approval', 'process', 'automation');
CREATE TYPE workflow_step_type AS ENUM ('approval', 'action', 'condition', 'notification');
CREATE TYPE workflow_status AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'cancelled', 'completed');

CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push', 'sms');
```

---

# 📐 CORE RELATIONSHIPS

```
Institution (1) ──> (N) Organization
Institution (1) ──> (N) User
Institution (1) ──> (N) Resource

Organization (1) ──> (N) Membership
Organization (1) ──> (N) Activity
Organization (1) ──> (N) Task
Organization (1) ──> (N) Document
Organization (1) ──> (N) Channel
Organization (1) ──> (N) Program
Organization (1) ──> (N) Budget

User (1) ──> (N) Membership
User (1) ──> (N) UserRole
User (1) ──> (N) Registration
User (1) ──> (N) Attendance
User (1) ──> (N) Task (assigned)
User (1) ──> (N) Certificate

Activity (1) ──> (N) Registration
Activity (1) ──> (N) Attendance
Activity (1) ──> (N) Task
Activity (1) ──> (N) Document
Activity (1) ──> (N) ResourceBooking
Activity (1) ──> (1) Event (optional)
Activity (1) ──> (1) Meeting (optional)

Program (1) ──> (N) Cohort
Program (1) ──> (N) Session
Program (1) ──> (N) Assignment
Program (1) ──> (N) ProgramEnrollment

Workflow (1) ──> (N) WorkflowStep
Workflow (1) ──> (N) WorkflowInstance

WorkflowInstance (1) ──> (N) WorkflowStepInstance
```

---

# 🔍 COMMON QUERY PATTERNS

## Get user's organizations

```sql
SELECT o.*
FROM organizations o
JOIN memberships m ON m.organization_id = o.id
WHERE m.user_id = :user_id
  AND m.status = 'active'
  AND m.deleted_at IS NULL
  AND o.deleted_at IS NULL;
```

## Get user's permissions in an organization

```sql
SELECT DISTINCT p.code
FROM permissions p
JOIN role_permissions rp ON rp.permission_id = p.id
JOIN roles r ON r.id = rp.role_id
JOIN user_roles ur ON ur.role_id = r.id
WHERE ur.user_id = :user_id
  AND (ur.organization_id = :org_id OR r.institution_id = :institution_id)
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  AND ur.deleted_at IS NULL;
```

## Get upcoming events for an organization

```sql
SELECT a.*, e.*
FROM activities a
LEFT JOIN events e ON e.activity_id = a.id
WHERE a.organization_id = :org_id
  AND a.activity_type = 'event'
  AND a.status IN ('approved', 'scheduled')
  AND a.start_date > NOW()
  AND a.deleted_at IS NULL
ORDER BY a.start_date ASC;
```

## Get user's attendance for a program

```sql
SELECT s.session_number, s.title, s.date,
       a.status, a.check_in_time
FROM sessions s
LEFT JOIN activities act ON act.id = s.activity_id
LEFT JOIN attendance a ON a.activity_id = act.id AND a.user_id = :user_id
WHERE s.program_id = :program_id
  AND s.deleted_at IS NULL
ORDER BY s.session_number;
```

## Get organization's pending approvals

```sql
SELECT wi.entity_type, wi.entity_id, wi.status,
       ws.name as current_step, wsi.assigned_to
FROM workflow_instances wi
JOIN workflow_step_instances wsi ON wsi.workflow_instance_id = wi.id
JOIN workflow_steps ws ON ws.id = wsi.workflow_step_id
WHERE wi.organization_id = :org_id
  AND wsi.status = 'pending'
  AND wi.status = 'in_progress'
ORDER BY wi.initiated_at DESC;
```

---

# ⚡ PERFORMANCE INDEXES

All critical indexes have been included in entity definitions above.

**Additional Composite Indexes:**

```sql
-- User + Organization lookups
CREATE INDEX idx_memberships_user_org_status 
ON memberships(user_id, organization_id, status);

-- Activity queries
CREATE INDEX idx_activities_org_type_status_date 
ON activities(organization_id, activity_type, status, start_date);

-- Permission checks
CREATE INDEX idx_user_roles_user_org 
ON user_roles(user_id, organization_id, scope, scope_id);

-- Notification queries
CREATE INDEX idx_notifications_user_read_created 
ON notifications(user_id, is_read, created_at DESC);

-- Attendance reports
CREATE INDEX idx_attendance_activity_status 
ON attendance(activity_id, status);

-- Financial queries
CREATE INDEX idx_expenses_org_status_date 
ON expenses(organization_id, status, expense_date);
```

---

# 🔐 ROW-LEVEL SECURITY

For PostgreSQL implementations, use RLS policies:

```sql
-- Organizations: Users can only see orgs they're members of
CREATE POLICY org_member_access ON organizations
FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = current_user_id() AND status = 'active'
  )
);

-- Activities: Based on visibility
CREATE POLICY activity_visibility ON activities
FOR SELECT
USING (
  visibility = 'public' OR
  (visibility = 'members_only' AND organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = current_user_id()
  ))
);
```

---

# 🎯 NEXT STEPS

With this data model:

1. **Generate database migrations**
2. **Create TypeScript/Python types**
3. **Build the API layer**
4. **Implement RBAC middleware**
5. **Create seed data**
6. **Write integration tests**

This is a **production-ready, enterprise-grade data model** that can scale from 1 organization to 10,000.

---

**END OF DATA MODEL**
