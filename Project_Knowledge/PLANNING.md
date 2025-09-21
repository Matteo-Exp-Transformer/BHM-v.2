# 📋 HACCP Business Manager - Planning Document

**Version:** 1.1  
**Last Updated:** January 2025  
**Status:** Auth System Enhancement + Core Features Development

---

## 🎯 **VISION & ARCHITECTURE**

### **Product Vision**

HACCP Business Manager is a mobile-first Progressive Web App (PWA) designed to revolutionize food safety management in the restaurant industry. By digitalizing HACCP compliance processes, we aim to make food safety management intuitive, efficient, and accessible for restaurant staff at all levels.

### **Key Principles**

- **Mobile-First**: Optimized for smartphones and tablets used in restaurant environments
- **Offline-First**: Critical functions work without internet connectivity
- **Real-Time**: Instant updates and notifications across all devices
- **Compliance-Focused**: Built around HACCP regulations and best practices
- **User-Friendly**: Intuitive interface requiring minimal training
- **Role-Based**: Secure, permission-based access control system

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client Layer (PWA)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  React + TypeScript + Vite + Tailwind CSS + Service Worker                  │
│  Clerk Auth | React Query | Zustand | React Router | FullCalendar          │
│  Enhanced: useAuth Hook | ProtectedRoute | Permission System                │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ├── HTTPS API Calls
                                     ├── Real-time Subscriptions
                                     ├── Offline Sync
                                     └── Role-based Data Filtering
                                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Backend Layer (Supabase)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL | Enhanced RLS with Role Checking | Real-time | Edge Functions  │
│  Storage Buckets | Vector Embeddings | Webhooks                            │
│  Enhanced: Role-based Access Control | Multi-tenant Security               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                      External Services Layer                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Clerk (Auth + Role Management) | Sentry (Monitoring) | Vercel (Hosting)   │
│  GitHub Actions (CI/CD) | Resend (Email) | Analytics                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 **NEW: Authentication & Authorization Architecture**

### **Role-Based Access Control (RBAC)**

#### **User Roles Hierarchy:**

```typescript
type UserRole =
  | 'admin'
  | 'responsabile'
  | 'dipendente'
  | 'collaboratore'
  | 'guest'

// Role hierarchy (higher roles inherit lower role permissions)
const roleHierarchy = {
  guest: 0, // No access
  collaboratore: 1, // Basic task execution
  dipendente: 2, // Full operational access
  responsabile: 3, // Supervisory access
  admin: 4, // Full system access
}
```

#### **Permission Matrix:**

```typescript
interface UserPermissions {
  // Staff & Organization Management
  canManageStaff: boolean // admin, responsabile
  canManageDepartments: boolean // admin, responsabile
  canViewAllStaff: boolean // admin, responsabile

  // Task & Activity Management
  canViewAllTasks: boolean // admin, responsabile
  canAssignTasks: boolean // admin, responsabile
  canManageTaskTemplates: boolean // admin, responsabile

  // Conservation & Temperature
  canManageConservation: boolean // admin, responsabile
  canViewAllTemperatures: boolean // admin, responsabile
  canManageAlerts: boolean // admin, responsabile

  // Inventory Management
  canManageInventory: boolean // admin, responsabile, dipendente
  canDeleteProducts: boolean // admin, responsabile
  canViewCostData: boolean // admin, responsabile

  // System Administration
  canExportData: boolean // admin only
  canManageSettings: boolean // admin only
  canViewAuditLogs: boolean // admin only
  canManageUsers: boolean // admin only

  // Reporting & Analytics
  canViewReports: boolean // admin, responsabile
  canExportReports: boolean // admin, responsabile
  canScheduleReports: boolean // admin only
}
```

### **Authentication Flow Architecture**

#### **Email-Based Role Assignment:**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Login    │    │   Email Check    │    │  Role Assignment │
│   (Clerk)       │───▶│   in Staff DB    │───▶│   & Profile     │
│                 │    │                  │    │   Creation      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  If No Email    │    │  If Email Found  │    │  User Profile   │
│  → Guest Role   │    │  → Assign Role   │    │  + Permissions  │
│  → Block Access │    │  → Grant Access  │    │  → App Access   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

#### **Database Schema Enhancement:**

```sql
-- Enhanced user_profiles table
user_profiles {
  id: UUID PRIMARY KEY
  clerk_user_id: VARCHAR UNIQUE NOT NULL
  company_id: UUID → companies(id)
  staff_id: UUID → staff(id)        -- NEW: Link to staff record
  role: VARCHAR DEFAULT 'guest'     -- NEW: Role assignment
  email: VARCHAR NOT NULL
  first_name: VARCHAR
  last_name: VARCHAR
  permissions: JSONB               -- NEW: Cached permissions
  last_role_sync: TIMESTAMP        -- NEW: Role sync tracking
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}

-- Enhanced staff table with auth integration
staff {
  id: UUID PRIMARY KEY
  company_id: UUID NOT NULL
  name: VARCHAR NOT NULL
  role: VARCHAR NOT NULL           -- admin|responsabile|dipendente|collaboratore
  category: VARCHAR NOT NULL
  email: VARCHAR                   -- NEW: Email for auto-matching
  phone: VARCHAR
  haccp_certification: JSONB
  department_assignments: UUID[]
  hire_date: DATE
  status: VARCHAR DEFAULT 'active'
  notes: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}

-- New: Role permissions cache table
role_permissions {
  id: UUID PRIMARY KEY
  role: VARCHAR NOT NULL
  permissions: JSONB NOT NULL
  updated_at: TIMESTAMP
}
```

---

## 💻 **TECHNOLOGY STACK**

### **Frontend Core**

| Technology       | Version | Purpose      | Rationale                                                    |
| ---------------- | ------- | ------------ | ------------------------------------------------------------ |
| **React**        | 18.3+   | UI Framework | Industry standard, large ecosystem, excellent mobile support |
| **TypeScript**   | 5.6+    | Type Safety  | Reduces bugs, improves maintainability, better IDE support   |
| **Vite**         | 5.4+    | Build Tool   | Fast builds, excellent DX, native ESM support                |
| **React Router** | 6.28+   | Routing      | Standard for SPAs, good PWA support                          |
| **Tailwind CSS** | 3.4+    | Styling      | Rapid development, consistent design, small bundle size      |

### **Enhanced State Management & Data Fetching**

| Technology          | Version | Purpose           | Rationale                                          |
| ------------------- | ------- | ----------------- | -------------------------------------------------- |
| **Zustand**         | 5.0+    | State Management  | Simple, lightweight, TypeScript-friendly           |
| **React Query**     | 5.62+   | Server State      | Excellent caching, offline support, real-time sync |
| **React Hook Form** | 7.54+   | Form Management   | Performance, minimal re-renders, good validation   |
| **Zod**             | 3.24+   | Schema Validation | TypeScript integration, runtime validation         |

### **UI Components & Visualization**

| Technology         | Version | Purpose        | Rationale                                       |
| ------------------ | ------- | -------------- | ----------------------------------------------- |
| **Lucide React**   | Latest  | Icons          | Tree-shakeable, consistent design, lightweight  |
| **FullCalendar**   | 6.1+    | Calendar View  | Feature-rich, mobile-friendly, customizable     |
| **Chart.js**       | 4.4+    | Charts         | Responsive, lightweight, good React integration |
| **React-Toastify** | 10.0+   | Notifications  | Customizable, accessible, queue management      |
| **jsPDF**          | 2.5+    | PDF Generation | Client-side PDFs, no server needed              |

### **PWA & Performance**

| Technology     | Version | Purpose         | Rationale                                    |
| -------------- | ------- | --------------- | -------------------------------------------- |
| **Workbox**    | 7.3+    | Service Worker  | Powerful caching strategies, offline support |
| **PWA Plugin** | Latest  | Vite Plugin     | Easy PWA setup, manifest generation          |
| **Web Push**   | Latest  | Notifications   | Native notification support                  |
| **IndexedDB**  | Native  | Offline Storage | Large data storage, better than localStorage |

### **Enhanced Backend (Supabase)**

| Technology          | Version | Purpose      | Rationale                                      |
| ------------------- | ------- | ------------ | ---------------------------------------------- |
| **PostgreSQL**      | 15+     | Database     | Robust, ACID compliant, excellent JSON support |
| **PostgREST**       | Latest  | REST API     | Automatic API from schema, RLS support         |
| **Realtime**        | Latest  | WebSockets   | Live updates, presence, broadcast              |
| **Storage**         | Latest  | File Storage | S3-compatible, CDN, transformations            |
| **Edge Functions**  | Latest  | Serverless   | Custom logic, webhooks, integrations           |
| **Vector/pgvector** | Latest  | AI/Search    | Semantic search capabilities                   |

### **Authentication & Security**

| Technology             | Version | Purpose          | Rationale                                |
| ---------------------- | ------- | ---------------- | ---------------------------------------- |
| **Clerk**              | 5.20+   | Authentication   | Complete auth solution, great DX, secure |
| **Row Level Security** | Native  | Data Security    | Database-level security, multi-tenancy   |
| **JWT**                | Latest  | Token Management | Stateless auth, standard format          |

### **Development Tools**

| Technology                | Version | Purpose           | Rationale                          |
| ------------------------- | ------- | ----------------- | ---------------------------------- |
| **ESLint**                | 9.17+   | Linting           | Code quality, consistency          |
| **Prettier**              | 3.4+    | Formatting        | Consistent code style              |
| **Husky**                 | 9.1+    | Git Hooks         | Pre-commit checks, quality gates   |
| **Vitest**                | 2.1+    | Unit Testing      | Vite-native, fast, Jest-compatible |
| **React Testing Library** | 16.1+   | Component Testing | Best practices, user-centric       |
| **Playwright**            | 1.49+   | E2E Testing       | Cross-browser, reliable, fast      |

### **DevOps & Monitoring**

| Technology         | Version | Purpose          | Rationale                                |
| ------------------ | ------- | ---------------- | ---------------------------------------- |
| **Vercel**         | Latest  | Hosting          | Excellent Next.js support, edge network  |
| **GitHub Actions** | Latest  | CI/CD            | Integrated with repo, flexible           |
| **Sentry**         | 8.47+   | Error Monitoring | Real-time errors, performance monitoring |
| **Posthog**        | Latest  | Analytics        | Privacy-friendly, self-hostable option   |

---

## 🛠️ **REQUIRED TOOLS & SETUP**

### **Development Environment**

#### **Core Requirements**

- **Node.js**: 18.x or 20.x LTS (use nvm for version management)
- **npm/pnpm**: Latest version (pnpm recommended for faster installs)
- **Git**: 2.40+ with proper .gitignore configuration
- **VS Code**: Latest version (recommended IDE)

#### **VS Code Extensions (Required)**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "steoates.autoimport-es6",
    "lokalise.i18n-ally",
    "usernamehw.errorlens",
    "eamodio.gitlens"
  ]
}
```

#### **Browser Extensions**

- React Developer Tools
- Redux DevTools (for Zustand)
- Lighthouse (PWA testing)
- WAVE (accessibility testing)

### **External Service Accounts**

#### **Essential Services (Day 1)**

1. **Supabase Account**
   - Free tier sufficient for development
   - Production requires Pro plan ($25/month)
   - Need: Project URL, Anon Key, Service Key

2. **Clerk Account**
   - Free tier: up to 5,000 monthly active users
   - Need: Publishable Key, Secret Key
   - Configure: OAuth providers, webhook endpoints

3. **GitHub Repository**
   - Private repository recommended
   - Set up: Branch protection, Actions secrets
   - Configure: Issue templates, PR templates

4. **Vercel Account**
   - Free tier sufficient for development
   - Connect to GitHub for auto-deployments
   - Configure: Environment variables, domains

#### **Additional Services (As Needed)**

5. **Sentry Account**
   - Free tier: 5,000 errors/month
   - Set up: Project DSN, source maps
   - Configure: Environments, alerts

6. **Resend Account** (Email Service)
   - Free tier: 3,000 emails/month
   - Alternative: Supabase built-in email
   - Need: API key, verified domain

7. **Posthog/Analytics**
   - Free tier: 1M events/month
   - Alternative: Vercel Analytics
   - Privacy-compliant solution

### **Local Development Setup**

#### **Initial Setup Script**

```bash
# Clone repository
git clone https://github.com/your-org/haccp-business-manager.git
cd haccp-business-manager

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Configure git hooks
pnpm prepare

# Start development server
pnpm dev
```

#### **Environment Variables**

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key

# Optional Services
VITE_SENTRY_DSN=your_sentry_dsn
VITE_POSTHOG_KEY=your_posthog_key
```

### **Testing Tools**

#### **Local Testing**

- **Vitest UI**: Interactive test runner
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Faker.js**: Test data generation

#### **Mobile Testing**

- **Chrome DevTools**: Device emulation
- **Safari Developer Tools**: iOS testing
- **BrowserStack**: Cross-device testing (optional)
- **ngrok**: Test on real devices

#### **Performance Testing**

- **Lighthouse CI**: Automated performance checks
- **WebPageTest**: Detailed performance analysis
- **Bundle Analyzer**: Webpack bundle analysis

### **Database Tools**

#### **Development**

- **Supabase Studio**: Web-based database manager
- **TablePlus/DBeaver**: Desktop database client
- **pgAdmin**: PostgreSQL administration
- **Beekeeper Studio**: Modern SQL editor

#### **Migrations & Seeding**

- **Supabase CLI**: Database migrations
- **Prisma**: Schema management (optional)
- **Node scripts**: Custom seeding logic

---

## 📦 **PROJECT STRUCTURE**

```
haccp-business-manager/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Base UI components
│   │   ├── forms/          # Form components
│   │   ├── layouts/        # Layout components
│   │   └── auth/           # NEW: Auth-specific components
│   │       ├── ProtectedRoute.tsx
│   │       ├── RoleGuard.tsx
│   │       └── PermissionCheck.tsx
│   ├── features/           # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   ├── management/    # NEW: Staff & Department management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── onboarding/    # Onboarding flow
│   │   ├── conservation/  # Temperature management
│   │   ├── tasks/         # Task management
│   │   ├── inventory/     # Inventory system
│   │   ├── calendar/      # NEW: Calendar integration
│   │   ├── dashboard/     # NEW: Dashboard & KPIs
│   │   └── settings/      # NEW: Settings management
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts     # NEW: Enhanced auth hook
│   │   ├── usePermissions.ts # NEW: Permission management
│   │   └── useRealtime.ts # NEW: Realtime data hooks
│   ├── lib/               # Utilities and helpers
│   │   ├── supabase/      # Supabase client
│   │   │   ├── client.ts
│   │   │   ├── auth.ts    # Enhanced auth utilities
│   │   │   ├── types.ts   # Enhanced with role types
│   │   │   └── policies.ts # NEW: RLS policy helpers
│   │   ├── api/           # API abstraction
│   │   ├── auth/          # NEW: Auth utilities
│   │   │   ├── permissions.ts
│   │   │   ├── roles.ts
│   │   │   └── guards.ts
│   │   └── utils/         # Helper functions
│   ├── stores/            # Zustand stores
│   │   ├── authStore.ts   # NEW: Auth state management
│   │   ├── userStore.ts   # NEW: User profile management
│   │   └── appStore.ts    # Global app state
│   ├── types/             # TypeScript types
│   │   ├── auth.ts        # NEW: Auth-related types
│   │   ├── database.ts    # Enhanced with auth types
│   │   ├── permissions.ts # NEW: Permission types
│   │   └── api.ts         # API types
│   └── styles/            # Global styles
├── public/                # Static assets
│   ├── icons/            # PWA icons
│   └── locales/          # Translation files
├── supabase/             # Supabase configuration
│   ├── migrations/       # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_auth_enhancement.sql # NEW: Auth system migration
│   ├── functions/        # Edge functions
│   └── seed.sql          # Seed data
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   ├── e2e/             # End-to-end tests
│   └── __mocks__/       # Mock data and utilities
└── docs/                # Documentation
    ├── api/             # API documentation
    ├── deployment/      # Deployment guides
    ├── development/     # Development guides
    └── auth/            # NEW: Auth system documentation
```

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Environments**

1. **Development**: Local development with hot reload
2. **Staging**: Preview deployments on Vercel
3. **Production**: Main deployment with custom domain

### **Enhanced Infrastructure**

- **CDN**: Vercel Edge Network / Cloudflare
- **Database**: Supabase (AWS RDS under the hood) with enhanced RLS
- **File Storage**: Supabase Storage (S3 compatible)
- **Authentication**: Clerk with role management
- **Monitoring**: Sentry + Vercel Analytics + Custom auth metrics

### **Security Considerations**

- HTTPS everywhere (enforced by Vercel)
- Content Security Policy headers
- CORS configuration for API calls
- Enhanced RLS with role-based filtering
- Rate limiting on API endpoints
- Input sanitization and validation
- Regular dependency updates
- Auth token rotation and management

---

## 📊 **PERFORMANCE TARGETS**

### **Core Web Vitals**

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### **Enhanced PWA Requirements**

- **Lighthouse Score**: > 90 across all categories
- **Time to Interactive**: < 3s on 3G
- **Bundle Size**: < 200KB (initial), < 500KB (total)
- **Offline Support**: Full CRUD operations
- **Auth Performance**: < 500ms for permission checks

### **Scalability**

- Support 10,000+ concurrent users
- Handle 1M+ database records per company
- 99.9% uptime target
- < 200ms API response time
- < 1s real-time update propagation

### **Auth-Specific Performance**

- **Role Assignment**: < 500ms after login
- **Permission Checking**: < 100ms per check (cached)
- **User Profile Sync**: < 1s across all devices
- **Route Protection**: < 200ms validation time

---

## 🔄 **MIGRATION STRATEGY**

### **From Paper-Based System**

1. Gradual onboarding process with role-based guidance
2. Data import tools for existing records
3. Training materials and videos per role
4. Parallel operation period
5. Full digital transition with compliance validation

### **Auth System Migration (Current)**

1. **Phase 1**: Database schema enhancement
2. **Phase 2**: Auth hook and component implementation
3. **Phase 3**: Route protection deployment
4. **Phase 4**: User role assignment and testing
5. **Phase 5**: Permission system validation

### **Future Considerations**

- Multi-language support (i18n ready)
- Multi-tenant architecture scaling
- API for third-party integrations
- Mobile app wrapper (React Native)
- Advanced analytics and ML features
- Single Sign-On (SSO) integration

---

## 🎯 **CURRENT DEVELOPMENT PHASE**

### **Phase Status:**

- ✅ **Foundation Complete:** React + TypeScript + Vite + Clerk + Supabase
- 🔄 **Current Priority:** Authentication System Enhancement (B.0)
- 📅 **Approach:** Enhanced Hybrid Development Strategy
- ⏱️ **Timeline:** 1 day for auth system, then core features

### **Development Priority Order:**

1. **🔥 CRITICAL:** Sistema Autorizzazioni (B.0) - BLOCKING
2. **Gestione** (Staff + Departments Management) - Admin only
3. **Conservazione** (Conservation Points + Temperature + Maintenance)
4. **Inventario** (Products + Expiry + Shopping Lists)
5. **Attività** (Tasks + Calendar Integration)
6. **Impostazioni** (Settings + Backup)
7. **Home** (Dashboard + KPIs)

### **Enhanced Development Workflow**

#### **Feature Development Process (Enhanced)**

```
1. Requirements Analysis
   ├── Check TASKS.md for specifications
   ├── Review permission requirements ← NEW
   ├── Identify role-based access needs ← NEW
   ├── Plan auth integration points ← NEW
   └── Plan UI/UX approach

2. Database Design
   ├── Schema updates if needed
   ├── Enhanced RLS policy adjustments ← NEW
   ├── Role-based query optimization ← NEW
   └── Migration scripts

3. Backend Implementation
   ├── API hooks development
   ├── Real-time subscriptions with auth ← NEW
   ├── Permission validation ← NEW
   └── Performance optimization

4. Frontend Implementation
   ├── Component architecture
   ├── Role-based UI logic ← NEW
   ├── ProtectedRoute integration ← NEW
   └── Loading/error states

5. Integration & Testing
   ├── End-to-end functionality
   ├── Permission validation testing ← NEW
   ├── Cross-role testing scenarios ← NEW
   └── Performance benchmarks
```

### **Code Quality Standards (Enhanced)**

```
TypeScript:
├── Strict mode enabled
├── No any types allowed
├── Interface definitions for all data
├── Role-based type guards ← NEW
└── Permission-based type checking ← NEW

Components:
├── Functional components only
├── Custom hooks for business logic
├── ProtectedRoute wrapping ← NEW
├── Permission-based rendering ← NEW
└── Consistent prop interfaces

Testing:
├── Unit tests for utilities
├── Component testing for UI
├── Auth integration testing ← NEW
├── Permission scenario testing ← NEW
└── Cross-role workflow testing ← NEW

Security:
├── Input validation and sanitization
├── SQL injection prevention
├── XSS protection
├── RLS policy testing ← NEW
├── Permission boundary testing ← NEW
└── Role escalation prevention ← NEW
```

---

## 🎯 **IMMEDIATE NEXT STEPS**

### **Today's Priority (CRITICAL):**

1. 🔥 **MILESTONE B.0** - Authentication System Implementation
2. 🔥 **Database Schema Update** - Add role columns to user_profiles and staff
3. 🔥 **Auth System Testing** - Verify email-based role assignment works
4. 🔥 **Route Protection** - Implement ProtectedRoute component
5. 🔥 **Permission Validation** - Test all role-based access controls

### **This Week's Goals:**

1. **Day 1:** Complete Authentication System (B.0) - 100% tested
2. **Days 2-4:** Management Tab Implementation (B.1.1)
3. **Day 5:** Calendar Schema + Skeleton (B.1.2)

### **Next Week's Goals:**

1. **Days 6-9:** Conservation System Implementation (B.2)
2. **Days 10-13:** Inventory System Implementation (B.3)
3. **Days 14-16:** Calendar Integration Complete (B.4)

### **Development Commands:**

```bash
# Enhanced development workflow
npm run dev          # Start development server with auth system
npm run type-check   # Verify TypeScript compliance
npm run lint         # Code linting with auth-specific rules
npm run test         # Run test suite including auth tests
npm run test:auth    # Run auth-specific test suite
npm run build        # Test production build with auth
npm run preview      # Preview production build locally

# Auth-specific commands
npm run db:migrate   # Run database migrations (including auth schema)
npm run db:seed      # Seed test data with roles and permissions
npm run db:reset     # Reset database (development only)
npm run auth:test    # Test auth system functionality
```

---

## 📝 **DEVELOPER NOTES**

### **Critical Implementation Order:**

1. **Authentication MUST be first** - All other features depend on role system
2. **Management tab validates patterns** - Establishes CollapsibleCard architecture
3. **Calendar integration requires all data sources** - Must be implemented last
4. **Testing at each milestone** - No feature moves to next milestone without complete testing

### **Architecture Decisions:**

- **Email-based role matching** chosen for simplicity and immediate implementation
- **Permission-based UI** preferred over role-based for flexibility and future-proofing
- **Real-time updates** via Supabase subscriptions for all CRUD operations
- **Mobile-first approach** maintained throughout all implementations
- **Enhanced RLS** for database-level security with role filtering

### **Performance Considerations:**

- **Auth caching** via React Query to avoid repeated database calls
- **Permission checks** cached and invalidated on role changes
- **Optimistic updates** for better UX during CRUD operations
- **Lazy loading** for non-critical components
- **Bundle optimization** to maintain <200KB initial load
- **Role-based data pre-fetching** to improve perceived performance

### **Security Considerations:**

- **Database-first security** - All access control enforced at RLS level
- **Frontend validation** as convenience layer only
- **Token validation** on every sensitive operation
- **Permission caching** with proper invalidation
- **Audit logging** for all role and permission changes
- **Rate limiting** on auth-related endpoints

---

**Note:** This planning document reflects the current enhanced architecture with comprehensive role-based access control and serves as the definitive technical guide for the HACCP Business Manager development. All development must follow the authentication-first approach outlined here.

---

**Document Control:**

- **Created:** January 2025
- **Last Updated:** January 2025 (Auth System Integration)
- **Next Review:** Weekly during active development
- **Distribution:** Development team, Cursor AI, project stakeholders
