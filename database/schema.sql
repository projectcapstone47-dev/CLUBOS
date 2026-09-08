-- =====================================================
-- CLUB OS - DATABASE SCHEMA
-- PostgreSQL 15+
-- Version: 1.0
-- Last Updated: 2026-09-08
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE institution_type AS ENUM ('university', 'college', 'school', 'organization');
CREATE TYPE subscription_status AS ENUM ('active', 'suspended', 'trial', 'expired');

CREATE TYPE organization_type AS ENUM ('club', 'committee', 'chapter', 'society', 'cell', 'team', 'wing');
CREATE TYPE organization_status AS ENUM ('active', 'inactive', 'suspended', 'archived');
CREATE TYPE visibility_level AS ENUM ('public', 'private', 'hidden');

CREATE TYPE user_type AS ENUM ('student', 'faculty', 'staff', 'alumni', 'guest', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'graduated');
CREATE TYPE auth_provider AS ENUM ('local', 'google', 'microsoft', 'saml', 'ldap');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say', 'other');

CREATE TYPE membership_type AS ENUM ('member', 'volunteer', 'participant', 'alumni', 'advisor');
CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'pending', 'rejected', 'expired');

CREATE TYPE activity_type AS ENUM ('event', 'meeting', 'session', 'workshop', 'training', 'competition', 'volunteer_activity');
CREATE TYPE activity_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'in_progress', 'completed', 'cancelled', 'archived');
CREATE TYPE location_type AS ENUM ('physical', 'online', 'hybrid');

CREATE TYPE registration_type AS ENUM ('individual', 'team', 'group');
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
CREATE TYPE channel_role AS ENUM ('owner', 'admin', 'moderator', 'member');
CREATE TYPE message_content_type AS ENUM ('text', 'markdown', 'html');
CREATE TYPE notification_level AS ENUM ('all', 'mentions', 'none');

CREATE TYPE announcement_type AS ENUM ('general', 'urgent', 'event', 'deadline', 'achievement');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE document_type AS ENUM ('general', 'letter', 'report', 'certificate', 'policy', 'sop', 'meeting_minutes', 'proposal', 'agreement', 'template');
CREATE TYPE document_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'published', 'archived');
CREATE TYPE access_level AS ENUM ('public', 'members', 'private', 'restricted');
CREATE TYPE template_format AS ENUM ('text', 'html', 'markdown', 'docx', 'pdf');

CREATE TYPE program_type AS ENUM ('llc', 'workshop_series', 'training', 'certification', 'mentorship', 'cohort');
CREATE TYPE program_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE program_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled', 'archived');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

CREATE TYPE enrollment_status AS ENUM ('pending', 'enrolled', 'in_progress', 'completed', 'dropped', 'failed');
CREATE TYPE assignment_type AS ENUM ('task', 'quiz', 'project', 'presentation', 'practical');
CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'graded', 'returned');

CREATE TYPE budget_type AS ENUM ('annual', 'event', 'project', 'program');
CREATE TYPE budget_status AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'closed');
CREATE TYPE expense_type AS ENUM ('purchase', 'service', 'reimbursement', 'honorarium', 'transport', 'food', 'venue', 'equipment', 'other');
CREATE TYPE expense_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'paid');
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'bank_transfer', 'cheque', 'card');

CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

CREATE TYPE reimbursement_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'paid');

CREATE TYPE sponsor_type AS ENUM ('title', 'platinum', 'gold', 'silver', 'bronze', 'in_kind', 'custom');
CREATE TYPE sponsorship_status AS ENUM ('prospect', 'negotiation', 'confirmed', 'delivered', 'completed');

CREATE TYPE workflow_type AS ENUM ('approval', 'process', 'automation');
CREATE TYPE workflow_step_type AS ENUM ('approval', 'action', 'condition', 'notification');
CREATE TYPE workflow_status AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'skipped', 'escalated');
CREATE TYPE approval_decision AS ENUM ('approve', 'reject', 'skip');
CREATE TYPE approver_type AS ENUM ('role', 'user', 'dynamic');

CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push', 'sms');
CREATE TYPE report_status AS ENUM ('pending', 'generating', 'completed', 'failed');
CREATE TYPE report_format AS ENUM ('json', 'pdf', 'excel', 'csv');
CREATE TYPE dashboard_type AS ENUM ('personal', 'organization', 'system');
CREATE TYPE setting_scope AS ENUM ('system', 'institution', 'organization', 'user');
CREATE TYPE integration_type AS ENUM ('sso', 'storage', 'calendar', 'communication', 'payment', 'analytics', 'custom');
CREATE TYPE meeting_type AS ENUM ('general', 'committee', 'board', 'emergency', 'annual');
CREATE TYPE certificate_status AS ENUM ('draft', 'issued', 'revoked', 'expired');

-- =====================================================
-- IDENTITY ENGINE
-- =====================================================

CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    type institution_type NOT NULL,
    logo_url TEXT,
    cover_url TEXT,
    domain VARCHAR(255) UNIQUE,
    website TEXT,
    address JSONB,
    contact JSONB,
    settings JSONB,
    subscription_plan VARCHAR(50),
    subscription_status subscription_status DEFAULT 'trial',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_institutions_code ON institutions(code);
CREATE INDEX idx_institutions_domain ON institutions(domain);
CREATE INDEX idx_institutions_deleted ON institutions(deleted_at);

-- =====================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    parent_id UUID REFERENCES organizations(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    slug VARCHAR(255) UNIQUE NOT NULL,
    type organization_type NOT NULL,
    category VARCHAR(100),
    department VARCHAR(100),
    description TEXT,
    mission TEXT,
    vision TEXT,
    objectives JSONB,
    logo_url TEXT,
    cover_url TEXT,
    established_date DATE,
    status organization_status DEFAULT 'active',
    visibility visibility_level DEFAULT 'public',
    settings JSONB,
    contact JSONB,
    social_links JSONB,
    meeting_schedule JSONB,
    location VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(institution_id, code, deleted_at)
);

CREATE INDEX idx_organizations_institution ON organizations(institution_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);
CREATE INDEX idx_organizations_deleted ON organizations(deleted_at);

-- =====================================================
-- PEOPLE ENGINE
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    email VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    username VARCHAR(100),
    password_hash VARCHAR(255),
    auth_provider auth_provider DEFAULT 'local',
    auth_provider_id VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    avatar_url TEXT,
    user_type user_type NOT NULL,
    student_id VARCHAR(50),
    employee_id VARCHAR(50),
    department VARCHAR(100),
    batch VARCHAR(20),
    year INTEGER,
    division VARCHAR(20),
    status user_status DEFAULT 'active',
    preferences JSONB,
    settings JSONB,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(institution_id, email, deleted_at),
    UNIQUE(institution_id, student_id, deleted_at)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted ON users(deleted_at);

-- =====================================================

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    date_of_birth DATE,
    gender gender_type,
    nationality VARCHAR(100),
    languages JSONB,
    address JSONB,
    emergency_contact JSONB,
    social_links JSONB,
    interests JSONB,
    skills JSONB,
    achievements JSONB,
    custom_fields JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MEMBERSHIP ENGINE
-- =====================================================

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    membership_type membership_type DEFAULT 'member',
    status membership_status DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    exit_at TIMESTAMP WITH TIME ZONE,
    exit_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, user_id, deleted_at)
);

CREATE INDEX idx_memberships_org ON memberships(organization_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_deleted ON memberships(deleted_at);

-- =====================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    institution_id UUID REFERENCES institutions(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'custom',
    level INTEGER DEFAULT 0,
    is_leadership BOOLEAN DEFAULT FALSE,
    permissions JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, slug, deleted_at),
    UNIQUE(institution_id, slug, deleted_at)
);

CREATE INDEX idx_roles_org ON roles(organization_id);
CREATE INDEX idx_roles_institution ON roles(institution_id);
CREATE INDEX idx_roles_slug ON roles(slug);
CREATE INDEX idx_roles_deleted ON roles(deleted_at);

-- =====================================================

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    organization_id UUID REFERENCES organizations(id),
    scope VARCHAR(100),
    scope_id UUID,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id, organization_id, scope, scope_id, deleted_at)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX idx_user_roles_scope ON user_roles(scope, scope_id);
CREATE INDEX idx_user_roles_deleted ON user_roles(deleted_at);

-- =====================================================

CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 0,
    responsibilities JSONB,
    requirements JSONB,
    term_duration INTEGER,
    is_elected BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_positions_org ON positions(organization_id);
CREATE INDEX idx_positions_deleted ON positions(deleted_at);

-- =====================================================

CREATE TABLE position_holders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES positions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    term_start DATE NOT NULL,
    term_end DATE NOT NULL,
    appointed_by UUID REFERENCES users(id),
    appointed_at TIMESTAMP WITH TIME ZONE,
    election_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_position_holders_position ON position_holders(position_id);
CREATE INDEX idx_position_holders_user ON position_holders(user_id);
CREATE INDEX idx_position_holders_org ON position_holders(organization_id);
CREATE INDEX idx_position_holders_deleted ON position_holders(deleted_at);

-- =====================================================
-- RBAC ENGINE
-- =====================================================

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    resource VARCHAR(100),
    action VARCHAR(100),
    is_system BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_permissions_category ON permissions(category);

-- =====================================================

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT TRUE,
    conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- =====================================================

CREATE TABLE policy_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    institution_id UUID REFERENCES institutions(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    resource_type VARCHAR(100),
    action VARCHAR(100),
    effect VARCHAR(20) DEFAULT 'allow',
    conditions JSONB,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_policy_rules_org ON policy_rules(organization_id);
CREATE INDEX idx_policy_rules_institution ON policy_rules(institution_id);
CREATE INDEX idx_policy_rules_resource ON policy_rules(resource_type);

-- =====================================================
-- WORKFLOW ENGINE
-- =====================================================

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    type workflow_type NOT NULL,
    trigger_event VARCHAR(100),
    applicable_to VARCHAR(100),
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB,
    metadata JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workflows_org ON workflows(organization_id);
CREATE INDEX idx_workflows_institution ON workflows(institution_id);
CREATE INDEX idx_workflows_slug ON workflows(slug);
CREATE INDEX idx_workflows_deleted ON workflows(deleted_at);

-- =====================================================

CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    step_order INTEGER NOT NULL,
    step_type workflow_step_type NOT NULL,
    required BOOLEAN DEFAULT TRUE,
    approver_type approver_type,
    approver_config JSONB,
    conditions JSONB,
    actions JSONB,
    sla_hours INTEGER,
    escalation_config JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_order ON workflow_steps(workflow_id, step_order);

-- =====================================================

CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    current_step_id UUID REFERENCES workflow_steps(id),
    status workflow_status DEFAULT 'pending',
    initiated_by UUID REFERENCES users(id),
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    context JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_org ON workflow_instances(organization_id);

-- =====================================================

CREATE TABLE workflow_step_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    workflow_step_id UUID NOT NULL REFERENCES workflow_steps(id),
    assigned_to UUID REFERENCES users(id),
    status step_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    decision approval_decision,
    decision_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_step_instances_workflow_instance ON workflow_step_instances(workflow_instance_id);
CREATE INDEX idx_step_instances_assigned ON workflow_step_instances(assigned_to);
CREATE INDEX idx_step_instances_status ON workflow_step_instances(status);

-- =====================================================
-- EVENT ENGINE
-- =====================================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    parent_id UUID REFERENCES activities(id),
    activity_type activity_type NOT NULL,
    code VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags JSONB,
    status activity_status DEFAULT 'draft',
    visibility visibility_level DEFAULT 'public',
    is_featured BOOLEAN DEFAULT FALSE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    location_type location_type DEFAULT 'physical',
    venue VARCHAR(255),
    venue_details JSONB,
    online_link TEXT,
    online_platform VARCHAR(100),
    cover_image_url TEXT,
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT FALSE,
    registration_start TIMESTAMP WITH TIME ZONE,
    registration_end TIMESTAMP WITH TIME ZONE,
    attendance_required BOOLEAN DEFAULT FALSE,
    certificate_enabled BOOLEAN DEFAULT FALSE,
    approval_required BOOLEAN DEFAULT TRUE,
    workflow_id UUID REFERENCES workflows(id),
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_activities_org ON activities(organization_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_dates ON activities(start_date, end_date);
CREATE INDEX idx_activities_slug ON activities(slug);
CREATE INDEX idx_activities_deleted ON activities(deleted_at);

-- Full-text search
CREATE INDEX idx_activities_search ON activities USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- =====================================================

CREATE TABLE events (
    activity_id UUID PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
    event_type VARCHAR(100),
    target_audience JSONB,
    prerequisites TEXT,
    objectives JSONB,
    agenda JSONB,
    speakers JSONB,
    sponsors JSONB,
    partners JSONB,
    budget_allocated DECIMAL(15,2),
    budget_spent DECIMAL(15,2),
    expected_attendees INTEGER,
    actual_attendees INTEGER,
    feedback_form_id UUID,
    certificate_template_id UUID,
    extra_fields JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================

CREATE TABLE meetings (
    activity_id UUID PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
    meeting_type meeting_type DEFAULT 'general',
    agenda JSONB,
    required_attendees JSONB,
    optional_attendees JSONB,
    minutes TEXT,
    decisions JSONB,
    action_items JSONB,
    next_meeting_date TIMESTAMP WITH TIME ZONE,
    recording_url TEXT,
    extra_fields JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    registration_type registration_type DEFAULT 'individual',
    team_name VARCHAR(200),
    team_members JSONB,
    status registration_status DEFAULT 'pending',
    payment_required BOOLEAN DEFAULT FALSE,
    payment_status payment_status DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    payment_id VARCHAR(255),
    form_data JSONB,
    qr_code TEXT,
    check_in_code VARCHAR(20),
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES users(id),
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_id UUID,
    notes TEXT,
    metadata JSONB,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(activity_id, user_id, deleted_at)
);

CREATE INDEX idx_registrations_activity ON registrations(activity_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_check_in_code ON registrations(check_in_code);
CREATE INDEX idx_registrations_deleted ON registrations(deleted_at);

-- =====================================================

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    registration_id UUID REFERENCES registrations(id),
    status attendance_status DEFAULT 'present',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    location VARCHAR(255),
    method attendance_method DEFAULT 'manual',
    recorded_by UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

CREATE INDEX idx_attendance_activity ON attendance(activity_id);
CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- =====================================================

CREATE TABLE activity_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(100),
    responsibilities JSONB,
    lead_id UUID REFERENCES users(id),
    members JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_teams_activity ON activity_teams(activity_id);

-- Continue with remaining tables in next file...
-- (Character limit reached, schema continues)
