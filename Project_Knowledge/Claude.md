# 🤖 Claude Development Guide - HACCP Business Manager

**Version:** 1.0  
**Last Updated:** January 2025  
**Project:** HACCP Business Manager PWA

---

## 📋 **PROJECT OVERVIEW**

### **Product Vision**

HACCP Business Manager è una Progressive Web App (PWA) che digitalizza e automatizza la gestione della sicurezza alimentare per ristoranti e attività del settore food. L'app garantisce compliance HACCP attraverso workflow guidati, monitoraggio automatico e audit trail completo.

### **Core Value Proposition**

- **Compliance Automatica**: Guida passo-passo per conformità normative HACCP
- **Audit Trail Completo**: Tracciabilità totale per controlli ispettivi
- **Operatività Offline**: Funzionamento garantito anche senza connessione
- **Score System**: Valutazione automatica delle performance di compliance
- **IA Assistant**: Automazioni intelligenti e suggerimenti proattivi

### **Target Users**

- **Titolare/Amministratore**: Setup completo, gestione utenti, export report
- **Responsabile/Manager**: Supervisione operativa, assegnazione mansioni, alert system
- **Dipendente/Collaboratore**: Task list, registrazione dati, note

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Frontend Stack**

```
Core Framework:
├── React 18+ (Current codebase)
├── TypeScript (gradual migration)
├── Vite (build tool)
└── Tailwind CSS (styling)

PWA Components:
├── Service Worker (offline capability)
├── Web App Manifest
├── Push Notifications API
└── IndexedDB (offline storage)

State Management:
├── Zustand (lightweight, current)
├── React Query (server state)
└── Context API (local state)
```

### **Backend Architecture**

```
Authentication:
├── Clerk (email/password, MFA)
├── JWT tokens
└── Session management

Database:
├── Supabase (PostgreSQL)
├── Row Level Security (RLS)
├── Real-time subscriptions
└── Edge functions

Storage:
├── Supabase Storage (images)
├── CDN distribution
└── Backup automation
```

### **Key Integrations**

- **FullCalendar**: Calendario unificato mansioni/manutenzioni
- **jsPDF**: Generazione report e liste della spesa
- **Lucide Icons**: Sistema iconografico
- **Date libraries**: Manipolazione date e orari

---

## 🎯 **CORE FUNCTIONAL MODULES**

### **FR1: Authentication & Users**

- **Clerk Integration**: Email/password + MFA opzionale
- **Role-Based Access**: Admin, Responsabile, Dipendente, Collaboratore
- **Multi-tenant**: Isolamento dati per azienda

### **FR2: Onboarding Aziendale**

- **Dati Azienda**: Nome, indirizzo, dipendenti, contatti
- **Configurazione Reparti**: Bancone, Sala, Magazzino, Cucina + custom
- **Staff Management**: Ruoli, categorie, certificazioni HACCP

### **FR3: Punti di Conservazione**

```
Classificazione Automatica per Temperatura:
├── Ambiente: Checkbox dedicata
├── Frigorifero: 0°C a 9°C
├── Freezer: 0°C a -90°C
└── Abbattitore: -10°C a -99°C + Checkbox dedicata

Stati di Monitoraggio:
├── 🟢 Verde: Tutte manutenzioni in regola
├── 🟡 Giallo: Manutenzioni imminenti (≤2 giorni)
└── 🔴 Rosso: Manutenzioni scadute
```

### **FR4: Mansioni e Manutenzioni**

- **Calendario Unificato**: FullCalendar per mansioni + manutenzioni
- **Frequenze**: Giornaliera, Settimanale, Mensile, Annuale, Custom
- **Assegnazione**: Dipendente specifico, Ruolo, Categoria
- **Completamento**: Workflow con timestamp e reset automatico

### **FR5: Inventario Prodotti**

```
Campi Prodotto:
├── Nome prodotto *, Categoria *, Reparto *
├── Punto di conservazione *, Data scadenza
├── Allergeni (8 tipologie checkbox)
├── Foto etichetta (cloud storage)
└── Note

Alert Scadenze:
├── Configurabile: 3-7 giorni prima scadenza
├── Sezione "Prodotti Scaduti" con workflow reinserimento
└── Lista della Spesa: selezione + export PDF
```

### **FR6: Score System & Compliance**

```
Algoritmo Score:
├── Manutenzioni: Peso 70% (priorità alta)
├── Mansioni Generiche: Peso 20%
├── Gestione Prodotti: Peso 10%
└── Formula: (Completate/Totali) * Peso

Tracking: Ultimi 6 mesi/1 anno per tipologia, dipendente, reparto
Export: Report automatici JSON + PDF
```

### **FR7: Offline System**

```
Strategia Sync (Last-Write-Wins + Dedup):
├── localStorage outbox system
├── Entità Append-Only: temperature, completamenti, note
├── Entità LWW: prodotti, punti conservazione, configurazioni
├── Conflict resolution: v1 semplificata, v2 advanced
└── Capacità: 3 giorni - 1 mese dati offline
```

---

## 🎨 **UI/UX PATTERNS**

### **Navigation Structure**

```
Main Tabs:
├── 🏠 Home (dashboard, statistiche principali)
├── ❄️ Conservazione (punti + manutenzioni + stato)
├── ✅ Attività e Mansioni (calendario + registro + statistiche)
├── 📦 Inventario (prodotti + etichette)
├── ⚙️ Impostazioni e Dati (backup + configurazioni)
├── 👥 Gestione (staff + reparti) [Admin only]
└── 🤖 IA Assistant (automazioni + suggerimenti)
```

### **CollapsibleCard Pattern**

```
Standard Component Structure:
├── Header: Icon + Title + Counter + Expand/Collapse
├── Content: Dynamic based on section
├── Actions: Primary/Secondary buttons
└── States: Loading, Empty, Error, Success
```

### **Color Schema & States**

```
Color Coding:
├── Primary: Blue tones (trust, stability)
├── Success: Green (compliance, completato)
├── Warning: Yellow (attenzione, imminente)
├── Error: Red (critico, scaduto)
└── Neutral: Gray scale (backgrounds, text)
```

### **Responsive Breakpoints**

```
Device Strategy:
├── Mobile: 320px - 768px (primary focus)
├── Tablet: 768px - 1024px (secondary)
└── Desktop: 1024px+ (tertiary)
```

---

## 💾 **DATABASE SCHEMA OVERVIEW**

### **Core Tables**

```
Primary Entities:
├── companies (tenant isolation)
├── users (authentication + roles)
├── departments (organizational structure)
├── conservation_points (monitoring locations)
├── products (inventory management)
├── tasks (maintenance + general tasks)
├── task_completions (execution tracking)
├── temperature_readings (compliance data)
├── non_conformities (issue tracking)
├── notes (communication system)
├── audit_logs (full traceability)
└── exports (backup history)
```

### **Row Level Security (RLS)**

- **Tenant Isolation**: Tutti i dati filtrati per `company_id`
- **Role-based Access**: Controllo granulare per funzionalità
- **Audit Trail**: Logging automatico di tutte le operazioni

---

## 🔧 **DEVELOPMENT GUIDELINES**

### **Code Standards**

```
TypeScript Migration Strategy:
├── New components: Always TypeScript
├── Existing components: Gradual migration
├── Types: Strong typing for all data models
└── Interfaces: Defined in /src/types/entities.ts
```

### **Component Architecture**

```
Component Structure:
├── /src/components/[Feature]/
├── /src/hooks/[custom hooks]
├── /src/services/[API layer]
├── /src/store/[Zustand stores]
├── /src/utils/[utility functions]
└── /src/types/[TypeScript definitions]
```

### **State Management Pattern**

```
Zustand Stores:
├── dataStore.ts (main application state)
├── /selectors/ (computed state)
├── Persistence: localStorage integration
└── Sync: Supabase real-time subscriptions
```

### **Error Handling**

```
Error Boundaries:
├── Component-level: ErrorBoundary wrapper
├── API-level: Service layer try/catch
├── User Feedback: Toast notifications
└── Logging: Full error tracking to audit trail
```

### **Performance Optimization**

```
Key Strategies:
├── React.memo for expensive components
├── useMemo/useCallback for complex calculations
├── Lazy loading for route components
├── Image optimization for photo uploads
└── IndexedDB for offline data caching
```

---

## 🧪 **TESTING STRATEGY**

### **Testing Pyramid**

```
Test Coverage:
├── Unit Tests: Utility functions, hooks, services
├── Component Tests: React Testing Library
├── Integration Tests: API interactions, state management
├── E2E Tests: Critical user workflows
└── Manual Testing: HACCP compliance scenarios
```

### **Key Test Scenarios**

```
Critical Paths:
├── Onboarding workflow completion
├── Task assignment and completion
├── Temperature logging and alerts
├── Offline sync functionality
├── Data export/import operations
└── Multi-user role access control
```

---

## 📋 **DEVELOPMENT PHASES**

### **Current Phase: Foundation (Step A)**

```
🏗️ Infrastructure & Core:
├── ✅ Repository setup + development environment
├── ✅ Clerk authentication integration
├── ✅ Supabase setup (DDL + basic RLS)
├── ✅ Service layer architecture
├── ✅ UI skeleton (Tab structure)
└── ✅ PWA basic configuration

📋 Onboarding Completo:
├── Business data collection
├── Departments setup (≥1 required)
├── Staff management (≥1 required)
├── Conservation points configuration
├── Maintenance planning per point
└── At least 1 generic task creation
```

### **Next Phase: Core Modules (Step B)**

```
📅 Unified Calendar System
💬 Mini-Messages System
🌡️ Temperature Logging & Non-Conformance
🔄 Offline v1 Implementation
```

---

## ⚠️ **CRITICAL CONSIDERATIONS**

### **HACCP Compliance**

```
Non-Negotiable Requirements:
├── Temperature ranges: Strict validation per categoria prodotti
├── Audit Trail: Immutable logging di tutte le operazioni
├── Data Retention: Minimo 1 anno per controlli ispettivi
├── Export Requirements: Formati standard per authorities
└── Legal Compliance: Timestamp immutabili e tracciabilità completa
```

### **Security & Privacy**

```
Security Measures:
├── TLS 1.3 per trasporto, AES-256 per storage
├── JWT tokens con refresh mechanism
├── RBAC (Role-Based Access Control)
├── GDPR compliance per data privacy
└── Regular security audits e penetration testing
```

### **Performance Requirements**

```
SLA Targets:
├── Load Time: < 3 secondi caricamento iniziale
├── Response Time: < 1 secondo per operazioni CRUD
├── Offline Sync: < 30 secondi riconnessione
├── Image Upload: < 10 secondi per foto etichette
└── System Uptime: 99.5% availability
```

---

## 🚨 **COMMON PITFALLS & SOLUTIONS**

### **Data Sync Issues**

```
Problem: Offline/online conflicts
Solution:
├── Robust outbox pattern implementation
├── Proper deduplication keys
├── Last-Write-Wins strategy for v1
└── Comprehensive conflict detection
```

### **HACCP Validation**

```
Problem: Incorrect temperature/category combinations
Solution:
├── Server-side validation rules
├── Real-time client-side feedback
├── Expert consultation for validation logic
└── Comprehensive test coverage
```

### **Mobile Performance**

```
Problem: Slow performance on older devices
Solution:
├── Progressive enhancement approach
├── Lazy loading and code splitting
├── Efficient image handling and caching
└── Memory management for large datasets
```

---

## 📚 **QUICK REFERENCE**

### **File Structure Priority**

```
High Priority Files:
├── /src/App.jsx (main app structure)
├── /src/components/PuntidiConservazione.jsx (conservation points)
├── /src/store/dataStore.ts (main state)
├── /src/services/dataService.js (API layer)
└── /src/persistence/ (offline sync)
```

### **Environment Setup**

```
Required Services:
├── Clerk account (authentication)
├── Supabase project (database + storage)
├── Vercel/Netlify (deployment)
└── Development tools: Node.js 18+, Vite
```

### **Key Commands**

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run test suite
npm run lint         # Code linting

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed test data
```

---

## 🎯 **SUCCESS METRICS**

### **Development KPIs**

```
Code Quality:
├── Test coverage: >80%
├── TypeScript migration: >60% by Phase 2
├── Performance: Lighthouse score >90
├── Bundle size: <500KB initial load
└── Error rate: <1% in production
```

### **User Experience**

```
UX Metrics:
├── Onboarding completion: >80%
├── Daily active usage: >70%
├── Task completion rate: >95%
├── Support ticket volume: <5% users/month
└── Customer satisfaction (NPS): >50
```

---

## 📝 **SESSION SUMMARIES**

### **Session 3: Infrastructure Completion & Environment Setup (January 2025)**

**Date:** January 2025  
**Developer:** Claude (AI Assistant)  
**Tasks Completed:**

- ✅ Fixed ESLint configuration for Node.js config files (resolved \_\_dirname errors)
- ✅ Verified all project dependencies are properly installed and working
- ✅ Confirmed CI/CD workflows are properly configured and functional
- ✅ Enhanced Vercel configuration with security headers (CSP, HSTS, XSS protection)
- ✅ Verified comprehensive issue and PR templates with HACCP-specific fields
- ✅ Confirmed environment variable templates are comprehensive and well-documented
- ✅ Validated PostHog analytics setup documentation
- ✅ Validated Resend email service setup documentation
- ✅ Completed all A.1.0 Initial Project Setup tasks

**Key Technical Achievements:**

- ESLint now properly handles both browser and Node.js environments
- All tests passing (2/2 test cases)
- Build system working correctly with TypeScript compilation
- PWA configuration functional with Service Worker generation
- Security headers implemented for production deployment
- Comprehensive documentation for all external service integrations

**Files Modified:**

- `eslint.config.js` - Added Node.js configuration for config files
- `vercel.json` - Enhanced with security headers (X-Frame-Options, HSTS, etc.)

**Current Status:**

- ✅ A.1.0 Initial Project Setup - **COMPLETED**
- 🔄 Ready to proceed with A.1.1 Repository & Development Environment
- All infrastructure and tooling is properly configured
- Project builds successfully and passes all quality checks

**Next Priority Tasks:**

- Begin A.1.2 Authentication System (Clerk) setup
- Start A.1.3 Supabase Backend Setup
- Implement A.2.1 Design System & Components
- Set up A.2.2 Navigation & PWA Setup

---

### **Session 2: Infrastructure & CI/CD Setup (January 2025)**

**Date:** January 2025  
**Developer:** Claude (AI Assistant)  
**Tasks Completed:**

- ✅ Set up GitHub branch protection rules with CI/CD workflow
- ✅ Created comprehensive issue and PR templates with HACCP-specific fields
- ✅ Configured Vercel deployment setup with multi-environment support
- ✅ Set up environment variable templates and configuration guides
- ✅ Created PostHog analytics setup documentation
- ✅ Created Resend email service setup documentation
- ✅ Established deployment architecture for dev/staging/production

**Key Decisions:**

- Implemented branch protection with automated testing and security checks
- Created HACCP-specific issue templates for better compliance tracking
- Set up multi-environment deployment strategy with proper secret management
- Established comprehensive documentation for external service integrations

**Files Created/Modified:**

- `.github/workflows/branch-protection.yml` - CI/CD pipeline
- `.github/ISSUE_TEMPLATE/` - Bug report and feature request templates
- `.github/pull_request_template.md` - PR template with HACCP compliance checks
- `vercel.json` - Vercel deployment configuration
- `docs/deployment/vercel-setup.md` - Vercel setup guide
- `docs/setup/posthog-setup.md` - Analytics configuration
- `docs/setup/resend-setup.md` - Email service setup

**Next Steps:**

- Begin A.1.1 Repository & Development Environment setup
- Configure Node.js 20.x and Vite 5.4+ build tool
- Set up ESLint, Prettier, and Husky for code quality
- Initialize TypeScript 5.6+ with gradual migration strategy

---

### **Session 1: Initial Project Setup (January 2025)**

**Date:** January 2025  
**Developer:** Claude (AI Assistant)  
**Tasks Completed:**

- ✅ Created new branch `BHM-v.2` from main
- ✅ Set up initial project directory structure following PLANNING.md specifications
- ✅ Created core documentation files (Claude.md, PLANNING.md, TASKS.md)
- ✅ Initialized basic folder structure for React + TypeScript project
- ✅ Prepared for Node.js and Vite setup

**Key Decisions:**

- Using the recommended project structure from PLANNING.md
- Following mobile-first PWA approach
- Implementing gradual TypeScript migration strategy

**Next Steps:**

- Initialize Node.js project with package.json
- Install core dependencies (React, Vite, TypeScript)
- Configure development environment
- Set up ESLint and Prettier

---

### **Session 2: Infrastructure & Development Environment (January 2025)**

**Date:** January 2025  
**Developer:** Claude (AI Assistant)  
**Tasks Completed:**

- ✅ Created GitHub issue and PR templates
- ✅ Set up VS Code recommended extensions and settings
- ✅ Updated .env.example with comprehensive environment variables
- ✅ Installed all core dependencies (React 18.3+, TypeScript 5.6+, Vite 5.4+, etc.)
- ✅ Configured ESLint and Prettier with Husky pre-commit hooks
- ✅ Set up GitHub Actions CI/CD pipeline with Lighthouse CI
- ✅ Created comprehensive README.md and CONTRIBUTING.md documentation
- ✅ Configured Vite with PWA plugin and path aliases
- ✅ Set up Vitest testing framework with React Testing Library
- ✅ Created basic UI structure with navigation and placeholder components
- ✅ Implemented mobile-first responsive layout with Tailwind CSS

**Key Decisions:**

- Using npm as package manager (instead of pnpm for simplicity)
- Implementing comprehensive environment variable documentation
- Setting up conventional commit validation with Husky
- Creating mobile-first navigation with bottom tab bar
- Using Lucide React for consistent iconography

**Technical Achievements:**

- Complete development environment setup
- PWA configuration with Workbox
- TypeScript configuration with strict settings
- Testing infrastructure (with minor environment variable mocking issues)
- CI/CD pipeline with automated testing and Lighthouse checks
- Comprehensive documentation for contributors

**Current Status:**

- Infrastructure setup is 95% complete
- Basic UI skeleton is functional
- Testing framework needs environment variable mocking fix
- Ready to proceed with authentication system setup

**Next Steps:**

- Fix testing environment variable mocking
- Set up Clerk authentication system
- Create Supabase backend configuration
- Implement onboarding wizard

---

**Document Control:**

- **Created:** January 2025
- **Last Updated:** January 2025
- **Next Review:** Monthly during active development
- **Usage:** Reference guide for all Claude development sessions

---

4 Rules to follow in workflow :

1. Always read PLANNING.MD at the start of every new conversation.
2. Check TASKS.md befor starting your work
3. Mark completed task immediately.
4. Add new discovered tasks.

---

_This guide should be consulted at the start of every development session to ensure consistency with project goals, architecture, and standards._
