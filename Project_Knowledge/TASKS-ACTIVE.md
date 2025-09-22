# 📋 HACCP Business Manager - Active Development Tasks

**Version:** 2.0 Active
**Last Updated:** January 22, 2025
**Purpose:** Current development milestones and active coordination

---

## 🎯 **PROJECT STATUS OVERVIEW**

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

## ✅ **CURRENT COMPLETED MILESTONES**

### **Major Systems Complete:**
- **B.0 Authentication System** ✅ - Role-based access control
- **B.1.1.2 Department Management** ✅ - CRUD operations with presets
- **B.1.1.3 Staff Management** ✅ - Complete staff system (Cursor Session 13)
- **B.1.2 Calendar Integration** ✅ - FullCalendar with unified events
- **B.2 Conservation System** ✅ - Temperature monitoring HACCP compliant
- **B.3.1 Product Management** ✅ - Inventory with full CRUD
- **B.3.2 Expiry Management** ✅ - Product lifecycle management
- **B.3.3 Shopping Lists & PDF** ✅ - PDF generation system (Claude Session 14-15)
- **B.4 Calendar Data Integration** ✅ - Real-time calendar sync (Claude Session 15)
- **B.5.1 Settings System** ✅ - Company configuration (Cursor Session 11)
- **B.5.2 Dashboard & KPIs** ✅ - Analytics dashboard (Cursor Session 12)

---

## 🔄 **CURRENT ACTIVE DEVELOPMENT**

### **Milestone B.6: System Integration & Optimization - 🔄 IN PROGRESS**

#### **B.6.1 Database Schema Completion - 🔄 IN PROGRESS**

**Status:** 70% Complete
**Owner:** Claude (Architecture Lead)
**Priority:** High

- [x] Core tables deployed (companies, users, staff, departments)
- [x] Conservation and temperature monitoring tables
- [x] Product and inventory management tables
- [x] Shopping lists tables (Claude Session 15)
- [ ] Settings and configuration tables
- [ ] Audit logs and compliance tables
- [ ] Export and reporting tables

**Next Actions:**
```sql
-- Deploy these schemas in Supabase:
1. settings-schema.sql - Company configuration tables
2. audit-logs-schema.sql - HACCP compliance tracking
3. reports-schema.sql - Export and reporting system
```

#### **B.6.2 TypeScript Restoration - 🚨 CRITICAL**

**Status:** 0% Complete
**Owner:** Shared Responsibility (Claude + Cursor)
**Priority:** Critical

**Current Blockers:**
```typescript
// Critical errors blocking git push:
1. useAuth.ts: Missing User type import from Clerk
2. CollapsibleCard: Props mismatch (isExpanded vs defaultExpanded)
3. Database types: Missing table definitions
4. Calendar components: Property type mismatches
5. Settings components: React import issues
```

**Resolution Plan:**
- **Phase 1:** Fix Clerk User import (Claude responsibility)
- **Phase 2:** Align CollapsibleCard props across codebase (Shared)
- **Phase 3:** Update database types after schema deployment (Claude)
- **Phase 4:** Component type fixes (Cursor responsibility)

#### **B.6.3 Branch Synchronization - 🔄 IN PROGRESS**

**Status:** In Progress
**Owner:** Claude (Merge Coordinator)
**Priority:** High

**Current Status:**
- Main branch: TypeScript errors blocking push
- Claude branch: Shopping lists and calendar integration complete
- Cursor branch: Staff management, settings, dashboard complete

**Synchronization Plan:**
1. Fix TypeScript errors across all branches
2. Update documentation consistency
3. Deploy missing database schemas
4. Execute coordinated merge strategy

### **Milestone B.7: Performance & Polish - ⏳ PENDING**

#### **B.7.1 Bundle Optimization**

**Owner:** Cursor (UI Lead)
**Current:** 1.7MB bundle size
**Target:** <1MB
**Timeline:** Post-TypeScript resolution

#### **B.7.2 Testing Suite Implementation**

**Owner:** Shared
**Coverage Target:** >80%
**Timeline:** Post-integration completion

---

## 🔄 **STEP C - ADVANCED FEATURES (Next Phase)**

### **Milestone C.1: Advanced CRUD & Workflows - ⏳ PLANNED**

#### **C.1.1 Advanced Task Management**
- **Owner:** Cursor
- **Features:** Task dependencies, recurring tasks, team assignments
- **Timeline:** Q1 2025

#### **C.1.2 Inventory Optimization**
- **Owner:** Claude
- **Features:** Smart reorder points, supplier integration
- **Timeline:** Q1 2025

### **Milestone C.2: Export & Reporting System - ⏳ PLANNED**

#### **C.2.1 HACCP Compliance Reports**
- **Owner:** Claude
- **Features:** Automated compliance scoring, audit trail exports
- **Timeline:** Q1 2025

#### **C.2.2 Business Intelligence Dashboard**
- **Owner:** Cursor
- **Features:** Advanced analytics, trend analysis
- **Timeline:** Q2 2025

### **Milestone C.3: Offline System v1 - ⏳ PLANNED**

#### **C.3.1 Offline Data Management**
- **Owner:** Claude
- **Features:** IndexedDB sync, conflict resolution
- **Timeline:** Q2 2025

---

## 🚨 **IMMEDIATE PRIORITIES (Next 2 Weeks)**

### **Week 1: Critical Infrastructure**
1. **TypeScript Error Resolution** - Shared responsibility
2. **Database Schema Deployment** - Claude lead
3. **Branch Synchronization** - Claude coordination

### **Week 2: System Stabilization**
1. **Integration Testing** - Shared
2. **Performance Optimization** - Cursor lead
3. **Documentation Updates** - Shared

---

## 🤖 **CURSOR SPECIFIC INSTRUCTIONS**

### **📋 Priority Tasks for Cursor Sessions**

#### **Immediate (Week 1-2):**

1. **TypeScript Error Resolution:**
   ```typescript
   // Fix these component-level errors:
   - CollapsibleCard props standardization
   - Settings components React imports
   - Dashboard component type safety
   - Form validation types
   ```

2. **UI Polish & Performance:**
   ```bash
   # Focus areas:
   - Bundle size optimization (<1MB target)
   - Component lazy loading
   - Image optimization
   - CSS purging
   ```

3. **Testing Implementation:**
   ```bash
   # Setup comprehensive testing:
   - React Testing Library for components
   - Integration tests for workflows
   - E2E tests for critical paths
   ```

#### **Medium Term (Week 3-4):**

1. **Advanced UI Features:**
   - Accessibility improvements (WCAG 2.1)
   - Mobile gesture optimizations
   - Advanced form validations
   - Loading state enhancements

2. **User Experience Polish:**
   - Error message improvements
   - Toast notification system enhancement
   - Progressive disclosure patterns
   - Keyboard navigation

### **🔧 Cursor Development Workflow**

#### **Session Startup Checklist:**

1. **📖 Read Required Files:**
   ```
   @Project_Knowledge\TASKS-ACTIVE.md     # This file - current tasks
   @Project_Knowledge\Claude.md           # Coordination status
   @Project_Knowledge\SESSION-STARTUP-GUIDE.md  # Protocols
   @.claude_rules                         # Working branch rules
   ```

2. **🔍 Check Project Status:**
   - Review git status for conflicts
   - Check development server (port 3000)
   - Verify Supabase connection
   - Check TypeScript compilation status

3. **📋 Task Prioritization:**
   - Focus on UI/UX implementation tasks
   - Coordinate on shared files (useAuth.ts, CollapsibleCard.tsx)
   - Communicate breaking changes to Claude

#### **Session Work Protocol:**

1. **🎯 Task Selection:**
   - Choose tasks marked for Cursor ownership
   - Prioritize TypeScript error resolution
   - Focus on CRUD operations and UI polish

2. **📝 Documentation Updates:**
   - Mark completed tasks immediately in this file
   - Add newly discovered tasks
   - Update bug reports with detailed solutions

3. **🔄 Coordination Protocol:**
   - Test changes on both worktrees when possible
   - Notify Claude of shared file modifications
   - Document any breaking changes or new dependencies

#### **Bug Tracking & Cross-Reference System:**

**🐛 When You Fix a Bug:**

1. **If Bug Originated in Cursor Worktree:**
   ```
   Location: BHM-v.2-Cursor/Project_Knowledge/Bug_Reports/[Severity]/
   Action: Create full bug report with solution
   File: YYYY-MM-DD_bug-description.md
   ```

2. **If Bug Originated in Claude Worktree:**
   ```
   Location: BHM-v.2-Cursor/Project_Knowledge/Bug_Reports/Cross_References/
   Action: Create cross-reference with link to full report
   File: YYYY-MM-DD_claude-bug-XXX.md
   Template: Use Cross_References/README.md template
   ```

3. **Update Bug Tracking Index:**
   ```
   File: Project_Knowledge/bug-tracking-index.md
   Action: Add entry with bug ID, description, and resolution
   Include: Links to full reports and cross-references
   ```

**🔧 Bug Report Requirements:**

- **Severity Classification:** Critical/High/Medium/Low
- **Detailed Description:** Steps to reproduce, expected vs actual behavior
- **Solution Applied:** Code changes, files modified, testing performed
- **Impact Assessment:** Side effects, performance implications
- **Cross-Worktree Testing:** Verify fix works in both environments

### **🤝 Coordination with Claude**

#### **Shared Responsibilities:**

1. **useAuth.ts Hook:**
   - Claude: Core authentication logic and types
   - Cursor: UI integration and error handling

2. **CollapsibleCard Component:**
   - Claude: Complex state management features
   - Cursor: UI styling and accessibility

3. **Database Types:**
   - Claude: Schema definition and RLS policies
   - Cursor: Frontend type integration and validation

#### **Communication Protocol:**

1. **Before Major Changes:**
   - Check if changes affect shared components
   - Notify about breaking changes or new dependencies
   - Coordinate database schema modifications

2. **After Completing Tasks:**
   - Update TASKS-ACTIVE.md with progress
   - Document any new issues discovered
   - Commit changes with descriptive messages

3. **Emergency Situations:**
   - TypeScript explosions: Coordinate immediate resolution
   - Database connectivity issues: Escalate to Claude
   - Authentication problems: Requires Claude involvement

### **📊 Success Metrics for Cursor**

#### **Code Quality:**
- Component test coverage >80%
- Accessibility score (WCAG 2.1 compliance)
- Performance budget adherence
- TypeScript strict mode compliance

#### **User Experience:**
- Mobile responsiveness (all screen sizes)
- Loading time <3 seconds
- Error recovery mechanisms
- Intuitive navigation patterns

#### **Technical Metrics:**
- Bundle size optimization
- Component reusability score
- Code maintainability index
- Browser compatibility coverage

---

## 🔄 **COMMIT & MERGE PROTOCOLS**

### **Commit Frequency Rules:**

1. **Every Feature Milestone:** Immediate commit required
2. **Bug Fixes:** Commit after verification testing
3. **UI Polish:** Commit after cross-browser testing
4. **Breaking Changes:** Coordinate before commit

### **Backup Protocol:**

- **Frequency:** Every 3 commits
- **Method:** Update existing backup, don't create new
- **Location:** User manages backup timing
- **Trigger:** Update SESSION-STARTUP-GUIDE.md reminder

### **Merge Timing (Claude Coordination):**

- **Automatic Triggers:** Defined in PLANNING.md merge intelligence
- **Manual Triggers:** User request or critical bug fixes
- **Readiness Checklist:** TypeScript clean, tests passing, documentation updated
- **Coordination:** Always through Claude (architecture lead)

---

## 📚 **QUICK REFERENCE**

### **Development Commands:**
```bash
npm run dev          # Port 3000 (Cursor worktree)
npm run build        # Production build
npm run type-check   # TypeScript validation (currently disabled)
npm run lint         # ESLint validation
npm run test         # Run test suite
```

### **Critical File Locations:**
```
src/hooks/useAuth.ts                    # Authentication (shared)
src/components/CollapsibleCard.tsx      # UI component (shared)
src/features/management/               # Staff & departments (Cursor)
src/features/settings/                 # Configuration (Cursor)
src/features/dashboard/                # Analytics (Cursor)
Project_Knowledge/Bug_Reports/         # Bug tracking
Project_Knowledge/Cross_References/    # Cross-worktree bugs
```

### **Emergency Contacts:**
- **TypeScript Errors:** Coordinate with Claude immediately
- **Database Issues:** Escalate to Claude (schema owner)
- **Authentication Problems:** Requires Claude architecture review
- **Performance Issues:** Cursor responsibility with Claude consultation

---

**🤖 For Cursor AI Assistant**
**📱 HACCP Business Manager PWA**
**🔄 Updated January 22, 2025**

---

_Complete development history: TASKS-ARCHIVED.md_
_Architecture details: PLANNING.md_
_Coordination status: Claude.md_