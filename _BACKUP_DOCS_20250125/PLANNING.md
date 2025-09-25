# 📐 HACCP Business Manager - Planning Document

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Pre-Development Planning

---

## 🎯 Vision & Architecture

### Product Vision

HACCP Business Manager is a mobile-first Progressive Web App (PWA) designed to revolutionize food safety management in the restaurant industry. By digitalizing HACCP compliance processes, we aim to make food safety management intuitive, efficient, and accessible for restaurant staff at all levels.

### Key Principles

- **Mobile-First**: Optimized for smartphones and tablets used in restaurant environments
- **Offline-First**: Critical functions work without internet connectivity
- **Real-Time**: Instant updates and notifications across all devices
- **Compliance-Focused**: Built around HACCP regulations and best practices
- **User-Friendly**: Intuitive interface requiring minimal training

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer (PWA)                         │
├─────────────────────────────────────────────────────────────────┤
│  React + TypeScript + Vite + Tailwind CSS + Service Worker       │
│  Clerk Auth | React Query | Zustand | React Router | FullCalendar│
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ├── HTTPS API Calls
                                 ├── Real-time Subscriptions
                                 └── Offline Sync
                                 │
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Layer (Supabase)                      │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL | Row Level Security | Real-time | Edge Functions    │
│  Storage Buckets | Vector Embeddings | Webhooks                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│                    External Services Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  Clerk (Auth) | Sentry (Monitoring) | Vercel (Hosting)          │
│  GitHub Actions (CI/CD) | Resend (Email) | Analytics            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend Core

| Technology       | Version | Purpose      | Rationale                                                    |
| ---------------- | ------- | ------------ | ------------------------------------------------------------ |
| **React**        | 18.3+   | UI Framework | Industry standard, large ecosystem, excellent mobile support |
| **TypeScript**   | 5.6+    | Type Safety  | Reduces bugs, improves maintainability, better IDE support   |
| **Vite**         | 5.4+    | Build Tool   | Fast builds, excellent DX, native ESM support                |
| **React Router** | 6.28+   | Routing      | Standard for SPAs, good PWA support                          |
| **Tailwind CSS** | 3.4+    | Styling      | Rapid development, consistent design, small bundle size      |

### State Management & Data Fetching

| Technology          | Version | Purpose           | Rationale                                          |
| ------------------- | ------- | ----------------- | -------------------------------------------------- |
| **Zustand**         | 5.0+    | State Management  | Simple, lightweight, TypeScript-friendly           |
| **React Query**     | 5.62+   | Server State      | Excellent caching, offline support, real-time sync |
| **React Hook Form** | 7.54+   | Form Management   | Performance, minimal re-renders, good validation   |
| **Zod**             | 3.24+   | Schema Validation | TypeScript integration, runtime validation         |

### UI Components & Visualization

| Technology         | Version | Purpose        | Rationale                                       |
| ------------------ | ------- | -------------- | ----------------------------------------------- |
| **Lucide React**   | Latest  | Icons          | Tree-shakeable, consistent design, lightweight  |
| **FullCalendar**   | 6.1+    | Calendar View  | Feature-rich, mobile-friendly, customizable     |
| **Chart.js**       | 4.4+    | Charts         | Responsive, lightweight, good React integration |
| **React-Toastify** | 10.0+   | Notifications  | Customizable, accessible, queue management      |
| **jsPDF**          | 2.5+    | PDF Generation | Client-side PDFs, no server needed              |

### PWA & Performance

| Technology     | Version | Purpose         | Rationale                                    |
| -------------- | ------- | --------------- | -------------------------------------------- |
| **Workbox**    | 7.3+    | Service Worker  | Powerful caching strategies, offline support |
| **PWA Plugin** | Latest  | Vite Plugin     | Easy PWA setup, manifest generation          |
| **Web Push**   | Latest  | Notifications   | Native notification support                  |
| **IndexedDB**  | Native  | Offline Storage | Large data storage, better than localStorage |

### Backend (Supabase)

| Technology          | Version | Purpose      | Rationale                                      |
| ------------------- | ------- | ------------ | ---------------------------------------------- |
| **PostgreSQL**      | 15+     | Database     | Robust, ACID compliant, excellent JSON support |
| **PostgREST**       | Latest  | REST API     | Automatic API from schema, RLS support         |
| **Realtime**        | Latest  | WebSockets   | Live updates, presence, broadcast              |
| **Storage**         | Latest  | File Storage | S3-compatible, CDN, transformations            |
| **Edge Functions**  | Latest  | Serverless   | Custom logic, webhooks, integrations           |
| **Vector/pgvector** | Latest  | AI/Search    | Semantic search capabilities                   |

### Authentication & Security

| Technology             | Version | Purpose          | Rationale                                |
| ---------------------- | ------- | ---------------- | ---------------------------------------- |
| **Clerk**              | 5.20+   | Authentication   | Complete auth solution, great DX, secure |
| **Row Level Security** | Native  | Data Security    | Database-level security, multi-tenancy   |
| **JWT**                | Latest  | Token Management | Stateless auth, standard format          |

### Development Tools

| Technology                | Version | Purpose           | Rationale                          |
| ------------------------- | ------- | ----------------- | ---------------------------------- |
| **ESLint**                | 9.17+   | Linting           | Code quality, consistency          |
| **Prettier**              | 3.4+    | Formatting        | Consistent code style              |
| **Husky**                 | 9.1+    | Git Hooks         | Pre-commit checks, quality gates   |
| **Vitest**                | 2.1+    | Unit Testing      | Vite-native, fast, Jest-compatible |
| **React Testing Library** | 16.1+   | Component Testing | Best practices, user-centric       |
| **Playwright**            | 1.49+   | E2E Testing       | Cross-browser, reliable, fast      |

### DevOps & Monitoring

| Technology         | Version | Purpose          | Rationale                                |
| ------------------ | ------- | ---------------- | ---------------------------------------- |
| **Vercel**         | Latest  | Hosting          | Excellent Next.js support, edge network  |
| **GitHub Actions** | Latest  | CI/CD            | Integrated with repo, flexible           |
| **Sentry**         | 8.47+   | Error Monitoring | Real-time errors, performance monitoring |
| **Posthog**        | Latest  | Analytics        | Privacy-friendly, self-hostable option   |

---

## 🛠️ Required Tools & Setup

### Development Environment

#### Core Requirements

- **Node.js**: 18.x or 20.x LTS (use nvm for version management)
- **npm/pnpm**: Latest version (pnpm recommended for faster installs)
- **Git**: 2.40+ with proper .gitignore configuration
- **VS Code**: Latest version (recommended IDE)

#### VS Code Extensions (Required)

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

#### Browser Extensions

- React Developer Tools
- Redux DevTools (for Zustand)
- Lighthouse (PWA testing)
- WAVE (accessibility testing)

### External Service Accounts

#### Essential Services (Day 1)

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

#### Additional Services (As Needed)

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

### Local Development Setup

#### Initial Setup Script

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

#### Environment Variables

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

### Testing Tools

#### Local Testing

- **Vitest UI**: Interactive test runner
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Faker.js**: Test data generation

#### Mobile Testing

- **Chrome DevTools**: Device emulation
- **Safari Developer Tools**: iOS testing
- **BrowserStack**: Cross-device testing (optional)
- **ngrok**: Test on real devices

#### Performance Testing

- **Lighthouse CI**: Automated performance checks
- **WebPageTest**: Detailed performance analysis
- **Bundle Analyzer**: Webpack bundle analysis

### Database Tools

#### Development

- **Supabase Studio**: Web-based database manager
- **TablePlus/DBeaver**: Desktop database client
- **pgAdmin**: PostgreSQL administration
- **Beekeeper Studio**: Modern SQL editor

#### Migrations & Seeding

- **Supabase CLI**: Database migrations
- **Prisma**: Schema management (optional)
- **Node scripts**: Custom seeding logic

---

## 📦 Project Structure

```
haccp-business-manager/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Base UI components
│   │   ├── forms/          # Form components
│   │   └── layouts/        # Layout components
│   ├── features/           # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   ├── onboarding/    # Onboarding flow
│   │   ├── conservation/  # Temperature management
│   │   ├── tasks/         # Task management
│   │   └── inventory/     # Inventory system
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   │   ├── supabase/      # Supabase client
│   │   ├── api/           # API abstraction
│   │   └── utils/         # Helper functions
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript types
│   └── styles/            # Global styles
├── public/                # Static assets
│   ├── icons/            # PWA icons
│   └── locales/          # Translation files
├── supabase/             # Supabase configuration
│   ├── migrations/       # Database migrations
│   ├── functions/        # Edge functions
│   └── seed.sql          # Seed data
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
└── docs/                # Documentation
    ├── api/             # API documentation
    ├── deployment/      # Deployment guides
    └── development/     # Development guides
```

---

## 🚀 Deployment Architecture

### Environments

1. **Development**: Local development with hot reload
2. **Staging**: Preview deployments on Vercel
3. **Production**: Main deployment with custom domain

### Infrastructure

- **CDN**: Vercel Edge Network / Cloudflare
- **Database**: Supabase (AWS RDS under the hood)
- **File Storage**: Supabase Storage (S3 compatible)
- **Monitoring**: Sentry + Vercel Analytics

### Security Considerations

- HTTPS everywhere (enforced by Vercel)
- Content Security Policy headers
- CORS configuration for API calls
- Rate limiting on API endpoints
- Input sanitization and validation
- Regular dependency updates

---

## 📊 Performance Targets

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### PWA Requirements

- **Lighthouse Score**: > 90 across all categories
- **Time to Interactive**: < 3s on 3G
- **Bundle Size**: < 200KB (initial)
- **Offline Support**: Full CRUD operations

### Scalability

- Support 10,000+ concurrent users
- Handle 1M+ database records
- 99.9% uptime target
- < 200ms API response time

---

## 🔄 Migration Strategy

### From Paper-Based System

1. Gradual onboarding process
2. Data import tools for existing records
3. Training materials and videos
4. Parallel operation period
5. Full digital transition

### Future Considerations

- Multi-language support (i18n ready)
- Multi-tenant architecture
- API for third-party integrations
- Mobile app wrapper (React Native)
- Advanced analytics and ML features

---

## 🔀 **MERGE TIMING INTELLIGENCE**

### **🚨 Automatic Merge Triggers**

**IMMEDIATE MERGE** (entro 4 ore da trigger):

- 🔥 **Critical Bug Fix**: Bug che blocca funzionalità core risolto
- 🚨 **Security Patch**: Vulnerabilità di sicurezza sistemata
- 💾 **Database Schema Update**: Nuovo schema deployato in Supabase
- ⚠️ **Breaking Change**: Modifica che impatta shared components

**SCHEDULED MERGE** (merge programmati):

- 📅 **Weekly Sync**: Ogni venerdì sera (fine sprint settimanale)
- 🎯 **Milestone Complete**: Dopo completamento feature importante
- 🔄 **Pre-Feature**: Prima di iniziare development di nuova feature complessa
- 📊 **Pre-Release**: Prima di prepare versione per staging/production

### **📋 Merge Readiness Checklist**

**✅ PRE-MERGE VERIFICATION:**

**Technical Requirements:**

- [ ] TypeScript compilation clean (no errors)
- [ ] ESLint warnings < 10
- [ ] All tests passing
- [ ] Database schema synchronized
- [ ] No console.error in production build

**Documentation Requirements:**

- [ ] TASKS-ACTIVE.md updated with completed milestones
- [ ] Claude.md updated with session summary
- [ ] Bug reports updated with resolutions
- [ ] Breaking changes documented

**Coordination Requirements:**

- [ ] Shared components tested in both worktrees
- [ ] Database changes verified in both environments
- [ ] No conflicting work in progress
- [ ] Both AI assistants ready for sync

### **🤖 AI Coordination Protocol**

**Claude Responsibilities (Merge Coordinator):**

1. Monitor merge triggers in PLANNING.md (questo file)
2. Execute readiness checklist verification
3. Coordinate with Cursor on timing
4. Execute merge process and conflict resolution
5. Update documentation post-merge

**Cursor Responsibilities (Merge Participant):**

1. Read PLANNING.md at ogni session start per merge alerts
2. Complete assigned tasks before scheduled merges
3. Report readiness status to Claude
4. Test integrated changes post-merge
5. Update TASKS-ACTIVE.md with new discoveries

### **📊 Coordination Metrics**

**Merge Success Indicators:**

- Zero merge conflicts (target: >90% merges)
- Post-merge functionality intact (target: 100%)
- Documentation alignment (target: 100%)
- Cross-worktree feature compatibility (target: >95%)

**Performance Tracking:**

- Merge frequency: Target 1-2 per week
- Resolution time: Target <2 hours for critical, <24h for scheduled
- Rollback rate: Target <5% of merges
- Communication gaps: Target 0 surprise breaks

### **🔔 Merge Notification System**

**Claude Session Start Check:**

```markdown
🔍 **MERGE ALERT CHECK:**

- Last merge: [DATE]
- Days since merge: [COUNT]
- Pending triggers: [LIST]
- Readiness status: [READY/BLOCKED/NEEDS_COORDINATION]
```

**Auto-Reminder Protocol:**

- **3+ days since merge**: Reminder to check pending work
- **5+ days since merge**: Escalate for immediate coordination
- **Critical trigger active**: Immediate merge coordination required
- **Scheduled merge due**: Readiness checklist verification

---

## 💾 **BACKUP & RECOVERY PROTOCOLS**

### **Backup Frequency Rules**

**Claude Backup Protocol:**

- **Every 3 commits**: Create backup branch
- **Before major merge**: Create pre-merge backup
- **After milestone completion**: Create milestone backup
- **Emergency**: Manual backup before risky operations

**Backup Naming Convention:**

```bash
# Regular backups
git branch Claude-Backup-YYYYMMDD-HHmm

# Milestone backups
git branch Claude-Milestone-B.3.3-Shopping-Lists

# Pre-merge backups
git branch Claude-PreMerge-YYYYMMDD-HHmm

# Emergency backups
git branch Claude-Emergency-[description]-YYYYMMDD
```

### **Recovery Procedures**

**If Merge Goes Wrong:**

1. Identify last known good state
2. Reset to backup branch
3. Re-apply changes incrementally
4. Test thoroughly before re-attempting merge

**If Database Schema Breaks:**

1. Rollback to previous schema backup
2. Re-test applications with rolled back schema
3. Fix schema issues on development copy
4. Re-deploy tested schema

---

**Note:** This planning document should be reviewed and updated regularly as the project evolves and new requirements emerge. **Both Claude and Cursor must read this file at every session start for merge coordination.**
