# 📋 HACCP Business Manager - Development Tasks

**Version:** 1.2
**Last Updated:** January 21, 2025
**Based on:** PRD v1.0 + Project Map v2.0 + Claude/Cursor Workflow Division

---

## 🎯 Project Overview

HACCP Business Manager is a Progressive Web App (PWA) for digitalizing food safety management in restaurants. The development is organized using a **dual-AI workflow** with **Claude** (complex architecture & business logic) and **Cursor** (UI/UX implementation & CRUD operations) working in synchronized worktrees.

### **🔀 DUAL WORKTREE STRUCTURE**

```
C:\Users\matte.MIO\Documents\GitHub\
├── BHM-v.2\           # Main repository (branch: main)
├── BHM-v.2-Claude\    # Claude worktree (branch: Claude, port 3001)
└── BHM-v.2-Cursor\    # Cursor worktree (branch: Curs, port 3000)
```

### **🎯 RESPONSIBILITY MATRIX**

| Component Type                   | Claude 🤖  | Cursor 👨‍💻  |
| -------------------------------- | ---------- | ---------- |
| **Architecture & Complex Logic** | ✅ Lead    | 🔄 Support |
| **UI/UX Implementation**         | 🔄 Support | ✅ Lead    |
| **CRUD Operations**              | 🔄 Support | ✅ Lead    |
| **Business Logic & HACCP**       | ✅ Lead    | 🔄 Support |
| **Database Schema**              | ✅ Lead    | 🔄 Support |
| **Authentication System**        | ✅ Lead    | 🔄 Support |

---

## 📅 Development Milestones & Tasks

### 🗏️ **STEP A - FOUNDATION (3-4 months) - ✅ COMPLETED**

#### **Milestone A.1: Infrastructure Setup (Sprints 1-4) - ✅ COMPLETED**

##### A.1.0 Initial Project Setup - ✅ COMPLETED

- [x] Create GitHub repository (private recommended)
- [x] Set up branch protection rules
- [x] Configure issue and PR templates
- [x] Create Vercel account and connect to GitHub
- [x] Set up development, staging, and production environments
- [x] Configure environment variables in Vercel
- [x] Set up Posthog/analytics account (optional)
- [x] Create Resend account for email service (optional)

##### A.1.1 Repository & Development Environment - ✅ COMPLETED

- [x] Initialize Git repository with proper branching strategy
- [x] Configure development environment with Node.js 18.x or 20.x LTS
- [x] Set up Vite 5.4+ build tool configuration
- [x] Install and configure ESLint 9.17+ and Prettier 3.4+
- [x] Set up Husky 9.1+ for pre-commit hooks
- [x] Configure TypeScript 5.6+ with gradual migration strategy
- [x] Set up testing framework (Vitest 2.1+ + React Testing Library 16.1+)
- [x] Create project documentation structure (README, CONTRIBUTING)
- [x] Configure CI/CD pipeline with GitHub Actions
- [x] Set up Sentry 8.47+ for error monitoring
- [x] Configure VS Code with required extensions
- [x] Set up pnpm as package manager
- [x] Install React 18.3+ and React DOM
- [x] Configure project structure as per PLANNING.md
- [x] Set up environment variables (.env.example)
- [x] Install development browser extensions

##### A.1.2 Authentication System (Clerk) - ✅ COMPLETED

- [x] Create Clerk account and obtain API keys (Publishable Key, Secret Key)
- [x] Install Clerk React SDK 5.20+
- [x] Implement email/password authentication flow
- [x] Create registration and login pages
- [x] Implement JWT token handling
- [x] Set up session management
- [x] Configure password reset flow
- [x] Implement role-based access control (RBAC)
- [x] Add optional MFA for administrators
- [x] Create user profile management interface
- [x] Configure OAuth providers and webhook endpoints

##### A.1.3 Supabase Backend Setup - ✅ COMPLETED

- [x] Create Supabase project (obtain Project URL, Anon Key, Service Key)
- [x] Design database schema (DDL) with PostgreSQL 15+
- [x] Create core tables:
  - [x] companies (multi-tenancy)
  - [x] users (auth integration)
  - [x] departments
  - [x] conservation_points
  - [x] staff_members
  - [x] tasks
  - [x] task_completions
  - [x] audit_logs
- [x] Implement Row Level Security (RLS) policies
- [x] Set up PostgREST API service layer abstraction
- [x] Configure Realtime subscriptions
- [x] Create data migration utilities with Supabase CLI
- [x] Test RLS policies for security
- [x] Configure Storage buckets for file uploads
- [x] Set up Vector/pgvector for semantic search

#### **Milestone A.2: UI Foundation (Sprints 5-8) - ✅ COMPLETED**

##### A.2.1 Design System & Components - ✅ COMPLETED

- [x] Configure Tailwind CSS 3.4+ with custom theme
- [x] Set up typography system
- [x] Integrate Lucide React icons (latest version)
- [x] Create base components:
  - [x] Button variations
  - [x] Form inputs (text, select, checkbox)
  - [x] Card component
  - [x] CollapsibleCard component
  - [x] Modal system
  - [x] Toast notifications (React-Toastify 10.0+)
  - [x] Loading states/skeletons
- [x] Implement responsive layout utilities
- [x] Create Storybook setup (optional)
- [x] Set up Zustand 5.0+ for state management
- [x] Configure React Query 5.62+ for server state

##### A.2.2 Navigation & PWA Setup - ✅ COMPLETED

- [x] Implement tab-based navigation system with React Router 6.28+
- [x] Create route protection with role-based access
- [x] Design app shell architecture
- [x] Configure Service Worker with Workbox 7.3+
- [x] Create Web App Manifest with PWA Plugin
- [x] Implement install prompt
- [x] Add offline detection
- [x] Set up IndexedDB for offline storage
- [x] Configure Web Push for notifications
- [x] Create main navigation tabs:
  - [x] Home (Dashboard)
  - [x] Conservazione (Conservation)
  - [x] Attività e Mansioni (Tasks)
  - [x] Inventario (Inventory)
  - [x] Impostazioni (Settings)
  - [x] Gestione (Management)

---

## 🔐 **STEP B - ENHANCED FOUNDATION + CORE OPERATIONS (5-6 months)**

### **🔥 PRIORITY 1: Authentication Enhancement (Current Priority)**

#### **MILESTONE B.0: Sistema Autorizzazioni (CRITICAL - MUST COMPLETE FIRST)**

**Timeline:** 1 day
**Status:** ✅ **COMPLETED** - **ALL DEVELOPMENT UNBLOCKED**

##### B.0.1 Database Schema Enhancement - **PRIORITY 1**

- [x] **Execute SQL updates on Supabase:**

  ```sql
  -- Add authorization columns to user_profiles
  ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id),
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'guest';

  -- Add email column to staff table
  ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS email VARCHAR(255);

  -- Create performance indexes
  CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
  CREATE INDEX IF NOT EXISTS idx_user_profiles_staff_id ON user_profiles(staff_id);
  ```

- [x] **Verify RLS policies** work with new columns
- [x] **Test database constraints** and relationships

##### B.0.2 Authentication System Enhancement - **PRIORITY 1**

- [x] **Create useAuth hook** (`src/hooks/useAuth.ts`)
  - [x] Role management: admin, responsabile, dipendente, collaboratore, guest
  - [x] Permission system based on roles:
    ```typescript
    interface UserPermissions {
      canManageStaff: boolean // admin, responsabile
      canManageDepartments: boolean // admin, responsabile
      canViewAllTasks: boolean // admin, responsabile
      canManageConservation: boolean // admin, responsabile
      canExportData: boolean // admin only
      canManageSettings: boolean // admin only
    }
    ```
  - [x] Auto-linking: email in staff table → user profile creation
  - [x] React Query integration for caching and performance
  - [x] Error handling for auth failures

- [x] **Create ProtectedRoute component** (`src/components/ProtectedRoute.tsx`)
  - [x] Role-based route protection
  - [x] Permission-based component protection
  - [x] Unauthorized user UI with clear messaging
  - [x] Loading states during auth checks
  - [x] Fallback components for insufficient permissions

##### B.0.3 Route Protection Implementation - **PRIORITY 1**

- [x] **Update App.tsx** with protected routes:

  ```typescript
  // Route protection examples
  <Route path="/gestione" element={
    <ProtectedRoute requiredPermission="canManageStaff">
      <ManagementPage />
    </ProtectedRoute>
  } />

  <Route path="/impostazioni" element={
    <ProtectedRoute requiredRole={['admin']}>
      <SettingsPage />
    </ProtectedRoute>
  } />
  ```

- [x] **Update MainLayout.tsx** to hide inaccessible tabs
- [x] **Implement permission-based UI elements**

##### B.0.4 Testing & Validation - **PRIORITY 1**

- [x] **Create test data in Supabase:**

  ```sql
  -- Test company
  INSERT INTO companies (name, address, staff_count, email) VALUES
  ('Al Ritrovo SRL', 'Via centotrecento 1/1b Bologna 40128', 5, '000@gmail.com');

  -- Test staff with YOUR email
  INSERT INTO staff (company_id, name, role, category, email) VALUES
  (company_id, 'Test Admin', 'admin', 'Amministratore', 'YOUR_EMAIL_HERE');
  ```

- [x] **Test authentication scenarios:**
  - [x] ✅ User with email in staff table → Correct role assignment
  - [x] ✅ User with email NOT in staff table → Guest role + access denied
  - [x] ✅ Admin user → Access to all protected routes
  - [x] ✅ Regular user → Limited access based on permissions
  - [x] ✅ Route protection working correctly
  - [x] ✅ UI shows appropriate messages for unauthorized users

**🎯 CRITICAL SUCCESS CRITERIA FOR B.0:**

- [x] ✅ Email-based role assignment: 100% accurate
- [x] ✅ Route protection: All protected routes working
- [x] ✅ Performance: Auth check <500ms
- [x] ✅ UX: Clear messaging for unauthorized access
- [x] ✅ Security: No unauthorized data access possible
- [x] ✅ Mobile: Auth UI works on all devices

**✅ SUCCESS:** B.0 is 100% complete and tested. All development unblocked.

---

## 🚀 **CURRENT TASK ASSIGNMENT & PRIORITY ORDER**

### **🤖 CLAUDE TASKS (Architecture & Complex Logic Priority)**

#### **IMMEDIATE PRIORITY (Next 1-2 Sessions)**

1. **🔴 B.3.3 Shopping Lists & PDF Generation (Current)**
   - **Complexity:** Medium-High (PDF generation logic)
   - **Timeline:** 1-2 sessions
   - **Dependencies:** Inventory system (completed)
   - **Files:** `src/features/inventory/components/ShoppingList*.tsx`, PDF utilities

2. **🔴 B.4 Calendar Data Integration (High Priority)**
   - **Complexity:** High (Multi-system integration)
   - **Timeline:** 2-3 sessions
   - **Dependencies:** Calendar schema (completed), all CRUD systems
   - **Files:** Calendar hooks, data transformation utilities

#### **SECONDARY PRIORITY (After Cursor Completes Staff Management)**

3. **🟡 C.3 Offline System v1 (Advanced Architecture)**
   - **Complexity:** Very High (Sync logic, conflict resolution)
   - **Timeline:** 3-4 sessions
   - **Dependencies:** All CRUD systems stabilized
   - **Files:** Service worker, sync utilities, outbox pattern

4. **🟡 C.2 Export & Reporting System (HACCP Compliance)**
   - **Complexity:** High (Legal compliance, multiple formats)
   - **Timeline:** 2-3 sessions
   - **Dependencies:** All data systems complete
   - **Files:** Export utilities, PDF templates, compliance reports

### **👨‍💻 CURSOR TASKS (UI/UX & CRUD Priority)**

#### **IMMEDIATE PRIORITY (Current Milestone)**

1. **🔴 B.1.1.3 Staff Management System** - ✅ COMPLETED BY CURSOR
   - **Complexity:** Medium (Standard CRUD + Auth integration)
   - **Timeline:** 2-3 sessions
   - **Dependencies:** Authentication system (completed by Claude)
   - **Files:** `src/features/management/components/Staff*.tsx`
   - **Template:** Copy Department Management pattern
   - **Status:** ✅ COMPLETED - Full CRUD system with HACCP certifications

2. **🟠 B.5.1 Settings System** - ✅ COMPLETED BY CURSOR
   - **Complexity:** Medium (Forms, validation, preferences)
   - **Timeline:** 2 sessions
   - **Dependencies:** Authentication, company management
   - **Files:** `src/features/settings/SettingsPage.tsx`
   - **Status:** ✅ COMPLETED - Complete settings management system

#### **SECONDARY PRIORITY (After Core CRUD Complete)**

3. **🟡 B.5.2 Dashboard & KPIs (Data Visualization)**
   - **Complexity:** Medium-High (Charts, statistics, real-time data)
   - **Timeline:** 2-3 sessions
   - **Dependencies:** All data systems must be complete
   - **Files:** `src/features/dashboard/DashboardPage.tsx`

4. **🟡 UI Polish & Component Library (Ongoing)**
   - **Complexity:** Low-Medium (Incremental improvements)
   - **Timeline:** Ongoing during development
   - **Dependencies:** Core functionality stable
   - **Files:** Component library, accessibility, mobile optimization

### **📋 COORDINATION CHECKPOINTS**

#### **🔄 Sync Points Between Claude & Cursor**

1. **After B.1.1.3 Staff Management (Cursor) + B.3.3 Shopping Lists (Claude)**
   - **Action:** Merge branches, integration testing
   - **Timeline:** End of week

2. **After B.4 Calendar Integration (Claude) + B.5.1 Settings (Cursor)**
   - **Action:** Full system integration, E2E testing
   - **Timeline:** End of next week

3. **Before C.3 Offline System (Claude) + B.5.2 Dashboard (Cursor)**
   - **Action:** Architecture review, performance optimization
   - **Timeline:** Before advanced features

#### **🎯 Success Criteria for Task Completion**

**For Claude Tasks:**

- [ ] Complex business logic correctly implemented
- [ ] Database schema properly designed and integrated
- [ ] Performance optimized for large datasets
- [ ] HACCP compliance requirements fully met
- [ ] Error handling and edge cases covered

**For Cursor Tasks:**

- [ ] UI/UX responsive and intuitive
- [ ] CRUD operations fully functional
- [ ] Form validation comprehensive
- [ ] Mobile-first design implemented
- [ ] Component reusability maintained

---

### **MILESTONE B.1: Core Features Implementation (After B.0 Complete)**

#### **Milestone B.1.1: Tab Gestione (Management) - ✅ **COMPLETED** (Days 2-4)**

**Prerequisites:** ✅ B.0 Authentication System Complete
**Target:** ✅ Complete CRUD management for Staff and Departments

##### B.1.1.1 Management Page Structure - ✅ **COMPLETED**

- [x] **Create ManagementPage.tsx** (`src/features/management/ManagementPage.tsx`)
  - [x] Role-based access control (admin/responsabile only)
  - [x] Two main CollapsibleCard components (Staff + Departments)
  - [x] Responsive layout (mobile-first)
  - [x] Loading states and error handling
  - [x] Real-time data updates

##### B.1.1.2 Department Management System - ✅ **COMPLETED**

- [x] **Create Department CRUD components:**

  ```
  src/features/management/components/
  ├── DepartmentManagement.tsx     # Main department section ✅
  ├── DepartmentCard.tsx          # Individual department display ✅
  ├── AddDepartmentModal.tsx      # Create/edit department modal ✅
  └── DepartmentList.tsx          # List with CollapsibleCard ✅
  ```

- [x] **Implement useDepartments hook** (`src/features/management/hooks/useDepartments.ts`)
  - [x] CRUD operations with Supabase
  - [x] Real-time subscriptions for live updates
  - [x] Error handling and loading states
  - [x] Optimistic updates for better UX

- [x] **Department Features:**
  - [x] Preset departments with quick-add:
    - [x] Bancone, Sala, Magazzino, Cucina
  - [x] Custom department creation
  - [x] Enable/disable toggle functionality
  - [x] Validation: minimum 1 department required
  - [x] Department assignment to conservation points

##### B.1.1.3 Staff Management System - ✅ **COMPLETED**

_[Implemented by Cursor - January 21, 2025]_

- [x] **Create Staff CRUD components:**

  ```
  src/features/management/components/
  ├── StaffManagement.tsx         # Main staff section ✅
  ├── StaffCard.tsx              # Individual staff member card ✅
  ├── AddStaffModal.tsx          # Create/edit staff modal ✅
  └── StaffList.tsx              # List with CollapsibleCard ✅
  ```

- [x] **Implement useStaff hook** (`src/features/management/hooks/useStaff.ts`)
  - [x] Complete CRUD with all staff fields
  - [x] HACCP certification tracking with expiry alerts
  - [x] Department assignment (multi-select)
  - [x] Real-time updates and subscriptions

- [x] **Staff Management Features:**

  ```typescript
  interface Staff {
    id: string
    company_id: string
    name: string          // Required ✅
    role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore' ✅
    category: string      // Required - multiple selection ✅
    email?: string        // For auth system linking ✅
    phone?: string ✅
    haccp_certification?: {
      level: 'base' | 'advanced'
      expiry_date: Date
      issuing_authority: string
      certificate_number: string
    } ✅
    department_assignments: string[] // Department IDs ✅
    hire_date: Date ✅
    status: 'active' | 'inactive' | 'suspended' ✅
    notes?: string ✅
  }
  ```

- [x] **Staff Categories (Multi-select):**
  - [x] Amministratore
  - [x] Banconisti
  - [x] Cuochi
  - [x] Camerieri
  - [x] Social & Media Manager

##### B.1.1.4 Integration & Testing - ✅ **COMPLETED**

- [x] **Integrate with auth system:**
  - [x] New staff creation updates auth permissions
  - [x] Email changes update user profile links
  - [x] Role changes update user permissions immediately

- [x] **Test with pre-filled data:**

  ```
  Staff members (5):
  - Matteo Cavallaro (Responsabile, Banconisti+Amministratore)
  - Fabrizio Dettori (Responsabile, Amministratore+Camerieri)
  - Paolo Dettori (Amministratore, Amministratore+Cuochi)
  - Eddy TheQueen (Dipendente, Banconisti)
  - Elena Guaitoli (Dipendente, Social & Media Manager+Banconisti)

  Departments (6):
  - Cucina, Bancone, Sala, Magazzino (presets)
  - Magazzino B, Sala B (custom)
  ```

**🎯 DELIVERABLE B.1.1:** ✅ **COMPLETED** - Complete Management tab with staff and department CRUD

#### **Milestone B.1.2: Calendar Schema + Integration - ✅ **COMPLETED** (Day 5)**

**Target:** ✅ Unified calendar interface ready for data integration
**STATUS:** ✅ **COMPLETED + AUTHENTICATION BUG FIXED (Session 10)**

##### B.1.2.1 Unified Data Schema - ✅ **COMPLETED**

- [x] **Define calendar event interfaces:**

  ```typescript
  interface CalendarEvent {
    id: string
    title: string
    start: Date
    end?: Date
    allDay: boolean
    type: 'maintenance' | 'general_task' | 'temperature_reading' | 'custom'
    status: 'pending' | 'completed' | 'overdue' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'critical'
    assigned_to: string[]
    department_id?: string
    conservation_point_id?: string
    recurring: boolean
    metadata: {
      task_id?: string
      maintenance_id?: string
      temperature_reading_id?: string
    }
    backgroundColor: string
    borderColor: string
    textColor: string
  }
  ```

- [x] **Create data transformation utilities:**
  - [x] Task → CalendarEvent converter
  - [x] Maintenance → CalendarEvent converter
  - [x] Color coding system by type and status
  - [x] Event filtering and grouping utilities

##### B.1.2.2 FullCalendar Integration - ✅ **COMPLETED**

- [x] **Install and configure FullCalendar 6.1+:**

  ```bash
  npm install @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
  ```

- [x] **Create Calendar components:**

  ```
  src/features/calendar/
  ├── Calendar.tsx               # Main calendar component ✅
  ├── CalendarPage.tsx          # Calendar page with stats ✅
  ├── components/
  │   ├── EventModal.tsx        # Event details modal ✅
  │   ├── QuickActions.tsx      # Quick completion actions ✅
  │   └── FilterPanel.tsx       # Calendar filtering ✅
  ├── hooks/
  │   ├── useCalendar.ts        # Calendar state management ✅
  │   └── useCalendarEvents.ts  # Event data fetching ✅
  └── utils/
      ├── eventTransform.ts     # Data transformation ✅
      └── colorUtils.ts         # Color coding logic ✅
  ```

- [x] **Calendar Features:**
  - [x] Multi-view support (day/week/month)
  - [x] Mobile-responsive touch interactions
  - [x] Custom theme matching app design
  - [x] Event click handlers and modals
  - [x] Mock data rendering for testing

**🎯 DELIVERABLE B.1.2:** ✅ **COMPLETED & FUNCTIONAL** - FullCalendar integrated with unified event schema + authentication fixed

---

### **MILESTONE B.2: Conservation System (Days 6-9)**

#### **Milestone B.2.1: Conservation Points Management - ✅ **COMPLETED\*\*

- [x] **Create Conservation CRUD system:**

  ```
  src/features/conservation/
  ├── ConservationPage.tsx           # Main conservation page ✅
  ├── components/
  │   ├── ConservationPointCard.tsx  # Individual point display ✅
  │   ├── AddPointModal.tsx          # Create/edit point modal ✅
  │   ├── TemperatureChart.tsx       # Temperature history chart ✅
  │   └── StatusIndicator.tsx       # Visual status display ✅
  ├── hooks/
  │   ├── useConservationPoints.ts   # Points CRUD operations ✅
  │   └── useTemperatureReadings.ts  # Temperature data ✅
  └── types.ts                       # Conservation-specific types ✅
  ```

- [x] **Conservation Point Features:**

  ```typescript
  interface ConservationPoint {
    id: string
    company_id: string
    department_id: string
    name: string
    setpoint_temp: number
    type: 'ambient' | 'fridge' | 'freezer' | 'blast'
    product_categories: string[]
    status: 'normal' | 'warning' | 'critical'
    last_temperature_reading?: {
      value: number
      recorded_at: Date
      status: 'compliant' | 'violation'
    }
    maintenance_due?: Date
  }
  ```

- [x] **Automatic Classification Logic:**
  ```typescript
  function classifyConservationPoint(
    temperature: number,
    isBlastChiller: boolean
  ): string {
    if (isBlastChiller && temperature >= -99 && temperature <= -10)
      return 'blast'
    if (temperature >= -90 && temperature <= 0) return 'freezer'
    if (temperature >= 0 && temperature <= 9) return 'fridge'
    return 'ambient'
  }
  ```

#### **Milestone B.2.2: Temperature Logging System - ✅ **COMPLETED\*\*

- [x] **Temperature Recording Interface:**
  - [x] Temperature entry forms with validation
  - [x] Manual temperature input with status preview
  - [x] Recording method selection (manual, digital, automatic)
  - [x] Photo evidence URL input
  - [x] Notes and observations support

- [x] **Temperature Validation & Compliance:**
  - [x] Automatic HACCP range checking
  - [x] Real-time status validation (compliant, warning, critical)
  - [x] Visual status indicators with color coding
  - [x] Tolerance range calculation per conservation point type
  - [x] Immediate compliance feedback

- [x] **Temperature Data Model:**
  ```typescript
  interface TemperatureReading {
    id: string
    company_id: string
    conservation_point_id: string
    temperature: number
    target_temperature: number
    tolerance_range: { min: number; max: number }
    status: 'compliant' | 'warning' | 'critical'
    recorded_by: string
    recorded_at: Date
    method: 'manual' | 'digital_thermometer' | 'automatic_sensor'
    notes?: string
    photo_evidence?: string
    validation_status: 'pending' | 'validated' | 'flagged'
  }
  ```

#### **Milestone B.2.3: Maintenance System - ✅ **COMPLETED\*\*

- [x] **Maintenance Task Generation:**
  - [x] Mock maintenance tasks for testing and UI development
  - [x] Maintenance templates (Temperature Control 🌡️, Sanitization 🧼, Defrosting ❄️)
  - [x] Frequency support (daily, weekly, monthly, custom)
  - [x] Staff assignment with role-based assignments

- [x] **Maintenance Types:**

  ```typescript
  interface MaintenanceTask {
    id: string
    conservation_point_id: string
    kind: 'temperature' | 'sanitization' | 'defrosting'
    frequency: string
    assigned_to: string
    assignment_type: 'user' | 'role' | 'category'
    next_due_date: Date
    estimated_duration: number // minutes
    checklist?: string[]
    completion_history: MaintenanceCompletion[]
  }
  ```

- [x] **Maintenance System Features:**
  - [x] MaintenanceTaskCard component with priority-based styling
  - [x] Status classification (overdue, pending, scheduled)
  - [x] Complete maintenance workflow with handlers
  - [x] Checklist preview and assigned staff display
  - [x] Integration with ConservationPage
  - [x] Statistics calculation and display

**🎯 DELIVERABLE B.2:** ✅ **COMPLETED** - Complete conservation system with temperature monitoring and maintenance

---

### **MILESTONE B.3: Inventory System (Days 10-13)**

#### **Milestone B.3.1: Product Management - ✅ **COMPLETED\*\*

- [x] **Product CRUD System:**

  ```
  src/features/inventory/
  ├── InventoryPage.tsx              # Main inventory page ✅
  ├── components/
  │   ├── ProductCard.tsx            # Individual product display ✅
  │   ├── AddProductModal.tsx        # Create/edit product modal ✅
  │   ├── ExpiryAlert.tsx            # Expiry warnings ✅
  │   ├── AllergenBadge.tsx          # Allergen indicators ✅
  │   └── CategoryFilter.tsx         # Category filtering ✅
  ├── hooks/
  │   ├── useProducts.ts             # Product CRUD operations ✅
  │   ├── useCategories.ts           # Category management ✅
  │   └── useExpiryTracking.ts       # Expiry monitoring ✅
  └── types.ts                       # Inventory-specific types ✅
  ```

- [x] **Product Data Model:**

  ```typescript
  interface Product {
    id: string
    company_id: string
    name: string // Required
    category_id: string // Required
    department_id: string // Required
    conservation_point_id?: string

    // Identification
    barcode?: string
    sku?: string
    supplier_name?: string

    // Dates & Quantities
    purchase_date?: Date
    expiry_date?: Date
    quantity?: number
    unit?: string

    // Safety & Compliance
    allergens: AllergenType[]
    temperature_requirements: {
      min_temp: number
      max_temp: number
      storage_type: ConservationPointType
    }

    // Documentation
    label_photo_url?: string
    notes?: string

    // Status
    status: 'active' | 'expired' | 'consumed' | 'waste'
    compliance_status: 'compliant' | 'warning' | 'non_compliant'
  }

  enum AllergenType {
    GLUTINE = 'glutine',
    LATTE = 'latte',
    UOVA = 'uova',
    SOIA = 'soia',
    FRUTTA_GUSCIO = 'frutta_guscio',
    ARACHIDI = 'arachidi',
    PESCE = 'pesce',
    CROSTACEI = 'crostacei',
  }
  ```

#### **Milestone B.3.2: Expiry Management & "Scaduti" System**

- [ ] **Expiry Tracking:**
  - [ ] Automatic expiry date monitoring
  - [ ] Configurable expiry alerts (3, 5, 7 days before)
  - [ ] "Prodotti in Scadenza" dashboard section
  - [ ] Color-coded expiry indicators
  - [ ] Batch expiry notifications

- [ ] **Expired Products Management:**
  - [ ] Automatic migration to "Prodotti Scaduti" section
  - [ ] Expired product reinsertion workflow:
    ```typescript
    const reinsertExpiredProduct = async (
      expiredProductId: string,
      newExpiryDate: Date
    ) => {
      const expiredProduct = await getExpiredProduct(expiredProductId)
      const newProduct = {
        ...expiredProduct,
        id: generateUUID(),
        expiry_date: newExpiryDate,
        status: 'active',
        previous_product_id: expiredProductId,
        reinsertion_count: (expiredProduct.reinsertion_count || 0) + 1,
      }
      await createProduct(newProduct)
      await archiveExpiredProduct(expiredProductId)
    }
    ```
  - [ ] Waste tracking and cost analysis
  - [ ] Prevention recommendations

#### **Milestone B.3.3: Shopping List & PDF Generation** - ✅ COMPLETED BY CLAUDE

_[Completed by Claude - January 21, 2025]_

- [x] **Shopping List Features:**
  - [x] Product selection interface with checkboxes
  - [x] Shopping list creation and management
  - [x] Quantity specification for each item
  - [x] Category grouping in lists
  - [x] List history and persistence
  - [x] Template system for recurring lists
  - [x] Real-time updates and statistics
  - [x] Error handling with graceful fallbacks

- [x] **PDF Generation with jsPDF 2.5+:**
  - [x] Comprehensive PDF export with configurable options
  - [x] Company branding and professional formatting
  - [x] Category grouping and completion status
  - [x] Responsive modal interface
  - [x] File naming with date stamps

  ```typescript
  const pdfConfig = {
    format: 'A4',
    margin: 20,
    header: {
      company_name: true,
      logo: true,
      list_date: true,
      created_by: true,
    },
    grouping: {
      by_category: true,
      by_supplier: false,
      by_department: false,
    },
    columns: ['product_name', 'quantity', 'category', 'notes'],
  }
  ```

- [ ] **Advanced Shopping Features:**
  - [ ] Template lists for recurring purchases
  - [ ] Cost estimation and budgeting
  - [ ] Supplier-based list separation
  - [ ] Mobile-optimized PDF formatting

**🎯 DELIVERABLE B.3:** Complete inventory system with expiry management and shopping lists

---

### **MILESTONE B.4: Calendar Integration (Days 14-16)**

#### **Milestone B.4.1: Data Source Integration** - ✅ COMPLETED BY CLAUDE

- [x] **Connect all data sources to calendar:**
  - [x] Maintenance tasks from conservation points
  - [x] General tasks from task management
  - [x] Temperature reading schedules
  - [x] HACCP certification expiry reminders
  - [x] Shopping lists → calendar reminders _(NEW - Claude)_
  - [x] Real-time data integration complete

- [x] **Real-time Calendar Updates:**
  - [x] Supabase subscriptions for live data
  - [x] Event synchronization across users
  - [x] Automatic invalidation and refetch
  - [x] Performance optimization for large datasets

#### **Milestone B.4.2: Advanced Calendar Features** - ✅ COMPLETED BY CLAUDE

- [x] **Interactive Calendar Features:**
  - [x] Drag & drop rescheduling (admin/responsabile only)
  - [x] Enhanced event completion system
  - [x] Quick completion actions from calendar view
  - [x] Bulk operations (mark multiple complete)

- [ ] **Filtering & Views:**
  - [ ] Department-based filtering
  - [ ] User-based filtering (my tasks vs all)
  - [ ] Task type filtering (maintenance vs general)
  - [ ] Status filtering (pending/completed/overdue)
  - [ ] Custom view configurations
  - [ ] Filter persistence (user preferences)

- [ ] **Calendar Export & Sharing:**
  - [ ] iCal/Google Calendar export
  - [ ] Print view optimization
  - [ ] Calendar sharing between staff members
  - [ ] Email notifications for upcoming tasks

**🎯 DELIVERABLE B.4:** ✅ **COMPLETED** - Fully integrated calendar with all data sources + real-time updates + advanced features

---

### **MILESTONE B.5: Settings + Dashboard (Days 17-19)**

#### **Milestone B.5.1: Settings System** - ✅ COMPLETED BY CURSOR

_[Implemented by Cursor - January 21, 2025]_

- [x] **Company Configuration:**
  - [x] Company data management
  - [x] Business settings and preferences
  - [x] HACCP compliance configuration
  - [x] Notification preferences

- [x] **User Management Interface:**
  - [x] User role management (admin only)
  - [x] Permission configuration
  - [x] Staff account management
  - [x] Department assignments

- [x] **Settings System Features:**
  - [x] Complete SettingsPage with CollapsibleCard pattern
  - [x] CompanyConfiguration component with form validation
  - [x] UserManagement component with role-based access
  - [x] HACCPSettings component with temperature thresholds
  - [x] NotificationPreferences component with email/push controls
  - [x] Mobile-responsive design and error handling
  - [x] Integration with main routing system
  - [x] Real-time updates with React Query

#### **Milestone B.5.2: Dashboard & KPIs**

- [ ] **Dashboard Development:**

  ```
  src/features/dashboard/
  ├── DashboardPage.tsx              # Main dashboard
  ├── components/
  │   ├── KPICard.tsx               # Individual KPI display
  │   ├── ComplianceChart.tsx       # Compliance visualization
  │   ├── TemperatureTrend.tsx      # Temperature trends
  │   └── TaskSummary.tsx           # Task completion summary
  └── hooks/
      └── useDashboardData.ts       # Dashboard data aggregation
  ```

- [ ] **KPI Implementation:**

  ```typescript
  interface DashboardKPIs {
    // Compliance Metrics
    overall_compliance_score: {
      value: number // 0-100
      trend: 'up' | 'down' | 'stable'
      period_comparison: '7d' | '30d' | '90d'
    }

    // Task Performance
    task_completion_rate: {
      total_tasks: number
      completed_on_time: number
      overdue: number
      completion_rate: number
    }

    // Temperature Compliance
    temperature_compliance: {
      total_readings: number
      compliant_readings: number
      compliance_rate: number
      violations_trend: number[]
    }

    // Inventory Health
    inventory_metrics: {
      total_products: number
      expiring_soon: number
      expired: number
      waste_percentage: number
      turnover_rate: number
    }
  }
  ```

**🎯 DELIVERABLE B.5:** Complete app with dashboard and settings

---

## ⚙️ **STEP C - COMPLIANCE & POLISH (3-4 months)**

### **Milestone C.1: Advanced Features**

#### **C.1.1 Communication System**

- [ ] **Mini-Messages System:**
  - [ ] Notes on tasks and conservation points
  - [ ] Internal communication system
  - [ ] Alert notifications
  - [ ] Read/unread status tracking
  - [ ] Push notifications setup

#### **C.1.2 Non-Conformance Management**

- [ ] **Automatic Detection System:**
  - [ ] Temperature violation detection
  - [ ] Task overdue detection
  - [ ] Pattern analysis for recurring issues

- [ ] **Non-Conformance Workflow:**
  - [ ] Issue reporting and classification
  - [ ] Severity level assignment
  - [ ] Corrective action planning
  - [ ] Root cause analysis forms
  - [ ] Resolution tracking and validation

### **Milestone C.2: Export & Reporting System**

#### **C.2.1 Comprehensive Export System**

- [ ] **Multi-format Export Engine:**
  - [ ] JSON complete data export
  - [ ] PDF compliance reports
  - [ ] CSV specific data exports (temperature, tasks, inventory)
  - [ ] Excel format for detailed analysis

- [ ] **HACCP Compliance Reports:**
  - [ ] Temperature log official reports
  - [ ] Task completion audit trails
  - [ ] Non-conformance summary reports
  - [ ] Staff certification status reports
  - [ ] Custom export builder for inspectors

#### **C.2.2 Audit Trail & Legal Compliance**

- [ ] **Complete Audit System:**
  - [ ] Immutable logging of all operations
  - [ ] Digital signatures for critical records
  - [ ] Data retention management (1 year minimum)
  - [ ] Legal compliance timestamps
  - [ ] Inspector-ready documentation

### **Milestone C.3: Offline System v1**

#### **C.3.1 Offline Infrastructure**

- [ ] **Advanced Service Worker:**
  - [ ] Robust cache strategies for different resource types
  - [ ] Background sync setup
  - [ ] Offline detection and UI states
  - [ ] Data synchronization queue
  - [ ] Conflict resolution system

- [ ] **Outbox System:**
  ```typescript
  interface OutboxOperation {
    id: string
    timestamp: Date
    entity: 'temperature_reading' | 'task_completion' | 'note' | 'product'
    operation: 'create' | 'update' | 'delete'
    payload: any
    dedup_key?: string
    retry_count: number
    max_retries: number
    status: 'pending' | 'syncing' | 'completed' | 'failed'
  }
  ```

#### **C.3.2 Offline Operations**

- [ ] **Offline CRUD Operations:**
  - [ ] Offline temperature logging
  - [ ] Offline task completion
  - [ ] Offline note creation
  - [ ] Offline product management
  - [ ] Offline calendar viewing

- [ ] **Sync Strategies:**

  ```typescript
  const syncStrategies = {
    // Append-only entities (no conflicts)
    temperature_readings: {
      strategy: 'append_only',
      dedup_key: '${conservation_point_id}_${taken_at}',
    },

    // Last-Write-Wins entities
    products: {
      strategy: 'last_write_wins',
      conflict_resolution: 'server_timestamp_wins',
    },

    // Idempotent entities
    task_completions: {
      strategy: 'idempotent',
      dedup_key: '${task_id}_${due_date}',
    },
  }
  ```

### **Milestone C.4: Production Polish & Security**

#### **C.4.1 Security & RLS Refinement**

- [ ] **Security Enhancements:**
  - [ ] Row Level Security policy refinement
  - [ ] API rate limiting implementation
  - [ ] Input validation hardening
  - [ ] SQL injection prevention audit
  - [ ] XSS protection implementation
  - [ ] CSRF token implementation

#### **C.4.2 Performance & Monitoring**

- [ ] **Performance Optimization:**
  - [ ] Database query optimization
  - [ ] Index optimization for large datasets
  - [ ] Connection pooling configuration
  - [ ] Bundle size optimization
  - [ ] Image compression and CDN integration

- [ ] **Monitoring & Analytics:**
  - [ ] Error monitoring (Sentry) optimization
  - [ ] Performance monitoring dashboard
  - [ ] User analytics and behavior tracking
  - [ ] System health monitoring
  - [ ] Load testing and optimization

#### **C.4.3 PWA Optimization & Final Polish**

- [ ] **PWA Enhancement:**
  - [ ] Service Worker optimization
  - [ ] Cache strategy refinement
  - [ ] App manifest optimization
  - [ ] Install prompt optimization
  - [ ] Splash screen customization
  - [ ] App store listing preparation

- [ ] **UI/UX Final Polish:**
  - [ ] UI/UX consistency audit
  - [ ] Accessibility improvements (WCAG basics)
  - [ ] Mobile responsiveness final check
  - [ ] Loading states and animations polish
  - [ ] Error messages humanization
  - [ ] Help text and tooltips completion

---

## 🚀 **POST-MVP DEVELOPMENT (Future Phases)**

### **Phase D: Intelligence & Automation (6 months)**

- [ ] **IA Assistant Integration:**
  - [ ] Open-source ML models integration (Llama/Mistral)
  - [ ] Predictive analytics for maintenance
  - [ ] Automated alerts and suggestions
  - [ ] Natural language interface
  - [ ] Learning from usage patterns

- [ ] **Advanced Automation:**
  - [ ] Smart inventory management
  - [ ] Automatic reordering suggestions
  - [ ] Compliance violation prediction
  - [ ] Optimization recommendations
  - [ ] Trend analysis and forecasting

### **Phase E: Enterprise & Integrations (6 months)**

- [ ] **Enterprise Features:**
  - [ ] Multi-location management
  - [ ] Advanced user management
  - [ ] Custom reporting tools
  - [ ] API for external integrations
  - [ ] White-label capabilities

- [ ] **External Integrations:**
  - [ ] POS system connections
  - [ ] ERP integrations
  - [ ] Supplier ordering systems
  - [ ] Government reporting APIs
  - [ ] Third-party audit tools

### **Phase F: Advanced Features (Ongoing)**

- [ ] **Mobile & IoT:**
  - [ ] Mobile app (React Native)
  - [ ] IoT sensor integration
  - [ ] Bluetooth temperature probes
  - [ ] RFID product tracking
  - [ ] Barcode scanning

- [ ] **International Expansion:**
  - [ ] Multi-language support (i18n)
  - [ ] International compliance (EU, US standards)
  - [ ] Currency and units localization
  - [ ] Regional HACCP variations

---

## 📋 **ONGOING TASKS**

### **Throughout Development**

- [ ] **Code Quality:**
  - [ ] Write unit tests (>80% coverage)
  - [ ] Update documentation continuously
  - [ ] Conduct regular code reviews
  - [ ] Fix bugs and issues promptly
  - [ ] Optimize performance regularly

- [ ] **Performance Monitoring:**
  - [ ] Lighthouse score >90 maintenance
  - [ ] Core Web Vitals targets (LCP <2.5s, FID <100ms, CLS <0.1)
  - [ ] Bundle size monitoring (<500KB)
  - [ ] Database performance monitoring
  - [ ] Error tracking with Sentry

### **Testing & QA Strategy**

- [ ] **Component Testing:**
  - [ ] React Testing Library 16.1+ for component tests
  - [ ] Unit testing with Vitest 2.1+
  - [ ] Integration testing with MSW (Mock Service Worker)
  - [ ] Storybook for component documentation

- [ ] **End-to-End Testing:**
  - [ ] Playwright 1.49+ for critical user journeys
  - [ ] Authentication flow testing
  - [ ] CRUD operations testing
  - [ ] Calendar integration testing
  - [ ] Mobile device testing

- [ ] **Specialized Testing:**
  - [ ] HACCP compliance validation
  - [ ] Security testing and penetration testing
  - [ ] Performance testing with Lighthouse CI
  - [ ] Accessibility testing with WAVE
  - [ ] Cross-browser testing with BrowserStack

### **Documentation Maintenance**

- [ ] **Technical Documentation:**
  - [ ] API documentation updates
  - [ ] Database schema documentation
  - [ ] Component library documentation
  - [ ] Deployment guides maintenance

- [ ] **User Documentation:**
  - [ ] User guides and tutorials
  - [ ] Admin documentation
  - [ ] Troubleshooting guides
  - [ ] HACCP compliance guides
  - [ ] Video tutorials creation

---

## ✅ **DEFINITION OF DONE**

### **For Each Feature:**

1. **Functionality:**
   - [ ] All acceptance criteria met
   - [ ] CRUD operations working correctly
   - [ ] Real-time updates functional
   - [ ] Error handling implemented
   - [ ] Loading states present

2. **Code Quality:**
   - [ ] TypeScript strict compliance
   - [ ] ESLint rules passing
   - [ ] Code reviewed and approved
   - [ ] Unit tests written and passing
   - [ ] Integration tests completed

3. **User Experience:**
   - [ ] Mobile responsive design
   - [ ] Accessibility requirements met
   - [ ] Performance benchmarks achieved
   - [ ] User feedback incorporated
   - [ ] Error messages user-friendly

4. **Security & Compliance:**
   - [ ] RLS policies tested
   - [ ] HACCP requirements met
   - [ ] Data validation implemented
   - [ ] Audit trail complete
   - [ ] Security vulnerabilities addressed

### **For Each Milestone:**

1. **Technical Deliverables:**
   - [ ] All planned features implemented
   - [ ] Database migrations successful
   - [ ] API endpoints tested
   - [ ] Real-time subscriptions working
   - [ ] Performance targets met

2. **Business Value:**
   - [ ] HACCP compliance requirements satisfied
   - [ ] User workflow improvements delivered
   - [ ] Business logic correctly implemented
   - [ ] Stakeholder approval received
   - [ ] Documentation completed

---

## 🎯 **SUCCESS METRICS & KPIs**

### **Development Metrics**

- [ ] **Code Quality:**
  - [ ] Test coverage: >80%
  - [ ] TypeScript migration: >90% by Phase C
  - [ ] Performance: Lighthouse score >90
  - [ ] Bundle size: <500KB initial load
  - [ ] Error rate: <1% in production

- [ ] **Development Velocity:**
  - [ ] Sprint completion rate: >85%
  - [ ] Bug resolution time: <48h critical, <1 week minor
  - [ ] Feature delivery: On schedule per milestone
  - [ ] Code review turnaround: <24h
  - [ ] Deployment frequency: Daily to staging

### **User Experience Metrics**

- [ ] **Usability:**
  - [ ] Onboarding completion: >80%
  - [ ] Daily active usage: >70%
  - [ ] Task completion rate: >95%
  - [ ] Mobile usage satisfaction: >4.5/5
  - [ ] Support ticket volume: <5% users/month

- [ ] **Performance:**
  - [ ] Page load time: <3s on 3G
  - [ ] API response time: <1s average
  - [ ] Offline functionality: 100% core features
  - [ ] Real-time updates: <500ms latency
  - [ ] Calendar responsiveness: <2s view changes

### **Business Impact Metrics**

- [ ] **HACCP Compliance:**
  - [ ] Compliance score accuracy: 100%
  - [ ] Audit trail completeness: 100%
  - [ ] Temperature tracking accuracy: >99%
  - [ ] Task completion tracking: >99%
  - [ ] Inspector satisfaction: >4.5/5

- [ ] **Operational Efficiency:**
  - [ ] Time savings vs manual: >80%
  - [ ] Error reduction vs paper: >90%
  - [ ] Staff productivity increase: >25%
  - [ ] Compliance preparation time: <2h/inspection
  - [ ] Data export success rate: >99%

---

## ⚡ **IMMEDIATE ACTION ITEMS**

### **🔥 TODAY (CRITICAL PRIORITY)**

1. **MILESTONE B.0 - Authentication System Implementation**
   - [ ] Execute database schema updates
   - [ ] Create useAuth hook with role management
   - [ ] Implement ProtectedRoute component
   - [ ] Update App.tsx with route protection
   - [ ] Test authentication scenarios completely

### **📅 THIS WEEK**

1. **Days 1:** Complete B.0 (Auth System) - 100% tested
2. **Days 2-4:** Implement B.1.1 (Management Tab)
3. **Day 5:** Create B.1.2 (Calendar Schema + Skeleton)

### **📅 NEXT WEEK**

1. **Days 6-9:** Implement B.2 (Conservation System)
2. **Days 10-13:** Implement B.3 (Inventory System)
3. **Days 14-16:** Complete B.4 (Calendar Integration)

---

## 📞 **SUPPORT & RESOURCES**

### **Key Reference Documents:**

- [ ] **PLANNING.md** - Technical architecture and project structure
- [ ] **Claude.md** - Development guidelines and session history
- [ ] **HACCP_Business_Manager_PRD.md** - Product requirements
- [ ] **BHM_Project_Map.md** - Detailed project roadmap
- [ ] **supabase-schema.sql** - Complete database schema

### **Development Tools & Commands:**

```bash
# Development workflow
npm run dev          # Start development server
npm run build        # Production build
npm run type-check   # TypeScript validation
npm run lint         # Code linting
npm run test         # Run test suite
npm run test:coverage # Test coverage report

# Database operations
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed test data
npm run db:reset     # Reset database (development only)

# Deployment
npm run deploy:dev   # Deploy to development
npm run deploy:staging # Deploy to staging
npm run deploy:prod  # Deploy to production
```

### **Emergency Contacts & Escalation:**

- [ ] **Technical Issues:** Check existing documentation first
- [ ] **HACCP Compliance Questions:** Consult PRD and schema
- [ ] **Architecture Decisions:** Reference PLANNING.md
- [ ] **Business Logic Questions:** Check Claude.md session history

---

**Document Control:**

- **Created:** January 2025
- **Last Updated:** January 2025
- **Next Review:** Weekly during active development
- **Usage:** Master task tracking for HACCP Business Manager development

---

## 🎯 **CURSOR DEVELOPMENT INSTRUCTIONS & PROTOCOLS**

### **🚀 CURSOR SESSION STARTUP CHECKLIST**

**📋 EVERY CURSOR SESSION MUST BEGIN WITH:**

1. ✅ **Read PLANNING.md** - Review architecture and technical stack
2. ✅ **Check TASKS.md** - Current milestone status and priorities (this file)
3. ✅ **Review Claude.md** - Coordination with Claude and session history
4. ✅ **Verify Branch Status** - Ensure working on correct Curs branch
5. ✅ **Start Development Server** - `npm run dev` on port 3000 (Cursor worktree)

### **🎯 CURSOR PRIMARY RESPONSIBILITIES**

#### **IMMEDIATE PRIORITY TASKS FOR CURSOR:**

1. **🔴 TypeScript Error Resolution (CRITICAL PRIORITY)**
   - Fix User import in useAuth.ts (Missing User type from Clerk)
   - Align CollapsibleCard props (isExpanded vs defaultExpanded inconsistency)
   - Update database types in Supabase client
   - Fix property mismatches in Calendar and Settings components
   - Remove React imports and fix prop types

2. **🟠 Performance Optimization**
   - Reduce bundle size from 1.7MB to <1MB
   - Code splitting for route components
   - Tree shaking optimization
   - Image compression and lazy loading
   - Bundle analyzer setup

3. **🟡 Testing Suite Setup**
   - > 80% test coverage for components critici
   - Focus on Staff Management components
   - Settings system components testing
   - Dashboard KPI calculations testing
   - CollapsibleCard component library testing

### **🛠️ CURSOR TECHNICAL STANDARDS**

#### **Code Quality Requirements:**

- **TypeScript**: Always for new components
- **Mobile-first**: Design responsive prioritario
- **CollapsibleCard pattern**: Standard per sezioni principali
- **Error Handling**: Toast notifications + graceful fallbacks
- **Testing**: React Testing Library for critical components

#### **Component Patterns to Follow:**

```typescript
// ✅ Correct CollapsibleCard usage
<CollapsibleCard
  title="Section Title"
  icon={IconComponent}
  counter={itemCount}
  defaultExpanded={true}
  actions={actionButtons}
/>

// ❌ Incorrect patterns to avoid
isExpanded={boolean}     // Non esistente
onToggle={function}      // Non esistente
count={number}          // Deprecated, use counter
```

### **🐛 BUG TRACKING & FIX MANAGEMENT PROTOCOL**

#### **🔥 CRITICAL: Bug Discovery and Documentation**

**When Cursor discovers a bug during testing:**

1. **IMMEDIATE DOCUMENTATION** - Create bug report in structured format
2. **BUG CATEGORIZATION** - Classify by severity and impact
3. **FIX IMPLEMENTATION** - Apply fix with detailed documentation
4. **TESTING VERIFICATION** - Confirm fix resolves issue
5. **KNOWLEDGE BASE UPDATE** - Add to project knowledge base

#### **📁 Bug Report File Structure**

**Create this folder structure in Project_Knowledge:**

```
Project_Knowledge/
├── Bug_Reports/
│   ├── Critical/           # Severity: Critical (app breaking)
│   │   ├── YYYY-MM-DD_bug-description.md
│   │   └── ...
│   ├── High/              # Severity: High (major functionality)
│   │   ├── YYYY-MM-DD_bug-description.md
│   │   └── ...
│   ├── Medium/            # Severity: Medium (moderate impact)
│   │   └── ...
│   ├── Low/               # Severity: Low (minor issues)
│   │   └── ...
│   ├── Fixed/             # Archive of resolved bugs
│   │   ├── Critical/
│   │   ├── High/
│   │   ├── Medium/
│   │   └── Low/
│   └── Templates/
│       └── bug-report-template.md
```

#### **📝 Bug Report Template**

**Cursor must use this exact template for all bug reports:**

```markdown
# 🐛 Bug Report: [Brief Description]

**Date:** YYYY-MM-DD
**Reported by:** Cursor
**Severity:** Critical | High | Medium | Low
**Status:** Open | In Progress | Fixed | Verified

## 📋 Bug Summary

[One-line summary of the issue]

## 🔍 Detailed Description

[Detailed explanation of the bug]

## 🔄 Steps to Reproduce

1. Step 1
2. Step 2
3. Step 3

## 🎯 Expected Behavior

[What should happen]

## ❌ Actual Behavior

[What actually happens]

## 🖥️ Environment

- **Browser:** [Browser and version]
- **Device:** Desktop/Mobile
- **OS:** Windows/Mac/Linux
- **Screen Size:** [if relevant]

## 📱 Impact Assessment

- **User Impact:** [How many users affected]
- **Business Impact:** [Effect on business logic]
- **HACCP Compliance:** [Any compliance issues]

## 🛠️ Root Cause Analysis

[Technical analysis of why the bug occurred]

## ✅ Proposed Solution

[Detailed solution approach]

## 🧪 Fix Implementation

[Steps taken to fix the bug]

## ✅ Testing Verification

- [ ] Bug reproducer no longer works
- [ ] Related functionality still works
- [ ] No regression introduced
- [ ] Mobile responsive still works
- [ ] TypeScript compiles without errors

## 📚 Knowledge Base Entry

[What we learned and how to prevent similar bugs]

## 📎 Related Files

- [List of files modified]
- [Screenshots if applicable]
- [Console logs if relevant]
```

#### **🔄 Bug Management Workflow**

**For Each Bug Discovered:**

1. **Create Bug Report** using template above
2. **File in Appropriate Severity Folder**
3. **Add Entry to Bug Tracking Index** (see below)
4. **Fix Bug** with detailed documentation
5. **Test Fix Thoroughly**
6. **Move Report to Fixed Folder**
7. **Update Bug Tracking Index**

#### **📊 Bug Tracking Index**

**Create/Update:** `Project_Knowledge/Bug_Reports/bug-tracking-index.md`

```markdown
# 🐛 Bug Tracking Index

## 📊 Current Status (Updated: YYYY-MM-DD by Cursor)

### Open Bugs

| ID      | Date       | Severity | Description                    | Status      | Assigned |
| ------- | ---------- | -------- | ------------------------------ | ----------- | -------- |
| BUG-001 | 2025-01-22 | Critical | TypeScript User import missing | In Progress | Cursor   |

### Recently Fixed

| ID      | Date Fixed | Severity | Description                   | Fix Summary        |
| ------- | ---------- | -------- | ----------------------------- | ------------------ |
| BUG-000 | 2025-01-21 | High     | CollapsibleCard prop mismatch | Updated prop names |

### Statistics

- **Total Bugs Reported:** 0
- **Critical Fixed:** 0
- **High Fixed:** 0
- **Medium Fixed:** 0
- **Low Fixed:** 0
- **Average Resolution Time:** 0 hours
```

### **📋 SESSION END REQUIREMENTS FOR CURSOR**

**Before ending each Cursor session:**

1. ✅ **Update TASKS.md** - Mark completed milestones
2. ✅ **Document any bugs found** - Use bug report template
3. ✅ **Update bug tracking index** - Maintain current status
4. ✅ **Commit changes** - Descriptive commit messages
5. ✅ **Update session progress** - Communication for Claude coordination

### **🔗 COORDINATION WITH CLAUDE**

#### **Shared Files (Require Coordination):**

- `src/hooks/useAuth.ts` - Authentication system
- `src/lib/supabase/client.ts` - Database types (Claude lead)
- `src/types/*.ts` - Type definitions
- `src/components/ui/CollapsibleCard.tsx` - Base component

#### **⚠️ CRITICAL CONSTRAINTS**

- **Database Schema:** Do NOT modify without Claude coordination
- **Authentication Logic:** Do NOT change useAuth.ts without approval
- **CollapsibleCard API:** Follow established patterns (defaultExpanded, counter)

#### **Communication Protocol:**

- **Breaking Changes:** Notify Claude immediately
- **Shared Component Updates:** Test on both worktrees
- **TypeScript Errors:** Coordinate solution approach
- **Database Issues:** Escalate to Claude immediately

### **🎖️ SUCCESS METRICS FOR CURSOR**

#### **Immediate Goals (Current Session):**

- ✅ Zero TypeScript errors
- ✅ Successful git push to GitHub
- ✅ All Cursor components working without props errors
- ✅ Clean browser console (no warnings)

#### **Short-term Goals (2 weeks):**

- Bundle size <1.2MB (from 1.7MB)
- Settings system 100% functional with database
- Dashboard real-time data integration
- Mobile performance optimization

#### **Long-term Goals (1 month):**

- Test coverage >80%
- Lighthouse score >95
- Component library documented
- Accessibility compliance (WCAG AA)

---

**⚠️ CRITICAL REMINDER:** TypeScript errors are currently blocking git commits. This is the HIGHEST PRIORITY for Cursor to resolve immediately.
