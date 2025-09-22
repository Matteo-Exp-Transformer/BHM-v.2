# 👨‍💻 CURSOR - Complete Development Instructions

**Version:** 2.0
**Last Updated:** January 22, 2025
**Purpose:** Comprehensive instructions for Cursor AI development sessions

---

## 🚀 **SESSION STARTUP PROTOCOL (MANDATORY)**

### **📂 Files to Link in Every Cursor Chat**

**⚠️ CRITICAL - Link these files in EXACT order:**

1. **📋 Current Tasks**: `@Project_Knowledge/TASKS-ACTIVE.md`
2. **👨‍💻 Instructions**: `@Project_Knowledge/CURSOR-INSTRUCTIONS.md` (this file)
3. **🐛 Bug Priority**: `@Project_Knowledge/Bug_Reports/bug-tracking-index.md`
4. **📖 Bug Workflow**: `@Project_Knowledge/Bug_Reports/Cross_References/README.md`

**Optional (if needed):**

- `@Project_Knowledge/Claude.md` (for coordination)
- `@PLANNING.md` (for architecture context)
- `@.claude_rules` (for branch rules understanding)

### **🔍 Session Startup Checklist**

1. **Read Required Files:** Always start by reading TASKS-ACTIVE.md for current priorities
2. **Check Git Status:** Verify working on Cursor branch (not main)
3. **Review Bug Reports:** Check for any critical issues blocking development
4. **Verify Dev Server:** Ensure port 3000 is running correctly
5. **Check Coordination:** Look for any Claude coordination messages

---

## 🎯 **CURSOR RESPONSIBILITIES & FOCUS AREAS**

### **🎨 Primary Ownership (Cursor Lead)**

#### **1. UI/UX Implementation**

```
✅ Your Strengths - Focus Here:
- Component styling and responsive design
- User interface improvements and polish
- Form validation and user experience
- Loading states and error handling
- Accessibility compliance (WCAG 2.1)
```

#### **2. CRUD Operations**

```
✅ Standard Operations - Your Domain:
- Staff management interfaces
- Settings and configuration UI
- Dashboard and analytics display
- Inventory management forms
- Department and role management
```

#### **3. Performance & Polish**

```
✅ Optimization Tasks - High Priority:
- Bundle size optimization (<1MB target)
- Component lazy loading
- Image and asset optimization
- CSS purging and minification
- Browser compatibility testing
```

### **🤝 Shared Responsibilities (Coordinate with Claude)**

#### **1. Shared Components**

```
⚠️ COORDINATE BEFORE CHANGING:
- src/hooks/useAuth.ts (authentication logic)
- src/components/CollapsibleCard.tsx (UI pattern)
- src/lib/supabase/client.ts (database types)
- src/types/*.ts (TypeScript definitions)
```

#### **2. Testing & Quality**

```
🔄 Shared Testing Responsibility:
- Component unit tests (your focus)
- Integration tests (shared)
- E2E testing (shared)
- Performance testing (your focus)
```

---

## 🚨 **CURRENT CRITICAL PRIORITIES**

### **🔥 Immediate Actions (Week 1-2)**

#### **1. TypeScript Error Resolution - 🔄 85% COMPLETE**

```typescript
// ✅ COMPLETED FIXES (January 22, 2025 - Session 17):

✅ COMPLETED FIXES:
1. CollapsibleCard props inconsistency - FIXED
   - File: src/components/CollapsibleCard.tsx
   - Issue: isExpanded vs defaultExpanded props
   - Action: ✅ Standardized to use defaultExpanded and counter

2. Settings components React imports - FIXED
   - Files: src/features/settings/**/*.tsx
   - Issue: Missing or incorrect React imports
   - Action: ✅ Added proper imports and prop types

3. Dashboard component type safety - FIXED
   - Files: src/features/dashboard/**/*.tsx
   - Issue: Property type mismatches
   - Action: ✅ Fixed prop interfaces and types

4. Form validation types - FIXED
   - Files: All form components
   - Issue: Missing TypeScript validation
   - Action: ✅ Added proper form schemas

5. Additional fixes completed:
   - Fixed tolerance_range usage in TemperatureReadingCard
   - Converted date strings to Date objects in inventory hooks
   - Added missing storage_type to temperature_requirements
   - Fixed checklist readonly array type issues
   - Corrected assigned_staff to assigned_to property names
   - Updated CalendarEvent interface to remove source, sourceId, extendedProps
   - Fixed CreateEventModal to use correct event types
   - Removed unused imports across multiple components
   - Reduced TypeScript errors from 200+ to 173

🔄 REMAINING WORK (173 errors):
- CreateEventModal.tsx: Switch statement type comparisons
- useCalendarEvents.ts: Mock data missing properties
- ConservationPointCard.tsx: departments vs department property
- AddTemperatureModal.tsx: tolerance_range_min vs tolerance_range
- EventDetailsModal.tsx: Unused isEditing variable
```

#### **2. Bundle Optimization - ✅ COMPLETED**

```bash
# ✅ COMPLETED (January 22, 2025 - Session 17):
# Current Status: 593.96 kB (gzipped: 183.21 kB) - UNDER TARGET

✅ COMPLETED OPTIMIZATIONS:
1. Implemented component lazy loading with React.lazy and Suspense
2. Added code splitting with manual chunks in vite.config.ts
3. Optimized vendor chunks separation
4. Configured Suspense wrappers with loading states
5. Bundle size reduced from 1.7MB to 593.96 kB (65% reduction)
```

#### **3. Component Testing - ✅ COMPLETED**

```bash
# ✅ COMPLETED (January 22, 2025 - Session 17):

✅ COMPLETED TESTING SETUP:
1. Created comprehensive test suite with Vitest and React Testing Library
2. Added tests for CollapsibleCard component
3. Added tests for DashboardPage component
4. Added tests for ConservationPage component
5. All tests passing successfully
6. Test infrastructure ready for expansion
```

### **📋 Current Active Features**

#### **✅ Recently Completed (Verify & Polish)**

1. **Staff Management System** (Session 13)
   - ✅ Complete CRUD operations
   - 🔄 Polish UI and error handling
   - 🔄 Add accessibility features

2. **Dashboard & KPIs** (Session 12)
   - ✅ Analytics and visualizations
   - 🔄 Optimize performance
   - 🔄 Mobile responsiveness

3. **Settings System** (Session 11)
   - ✅ Company configuration
   - 🔄 Form validation improvements
   - 🔄 User experience polish

#### **🔄 Next Development Phase**

1. **Advanced UI Features**
   - Progressive disclosure patterns
   - Advanced form validations
   - Keyboard navigation
   - Mobile gesture optimization

2. **Performance Improvements**
   - Component memoization
   - Virtual scrolling for large lists
   - Image lazy loading
   - Optimistic UI updates

---

## 🐛 **BUG TRACKING & RESOLUTION WORKFLOW**

### **🔍 When You Discover a Bug**

#### **1. Bug Classification**

```
🚨 CRITICAL: Breaks core functionality, prevents user workflows
🔴 HIGH: Significant impact on user experience
🟡 MEDIUM: Minor UX issues, non-blocking problems
🟢 LOW: Cosmetic issues, nice-to-have fixes
```

#### **2. Bug Report Creation**

**If Bug Originates in Cursor Worktree:**

```
📍 Location: BHM-v.2-Cursor/Project_Knowledge/Bug_Reports/[Severity]/
📝 File Name: YYYY-MM-DD_bug-description.md
📋 Use Template: Create full detailed bug report
✅ Include: Screenshots, steps to reproduce, solution applied
```

**If Bug Originates in Claude Worktree:**

```
📍 Location: BHM-v.2-Cursor/Project_Knowledge/Bug_Reports/Cross_References/
📝 File Name: YYYY-MM-DD_claude-bug-XXX.md
📋 Use Template: Cross_References/README.md template
🔗 Include: Link to full report in Claude worktree
```

#### **3. Bug Resolution Documentation**

```markdown
# Required Bug Report Sections:

## 🐛 Bug Description

[Clear description of the issue]

## 🔍 Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Expected vs Actual behavior]

## ✅ Solution Applied

**Files Modified:**

- [List all changed files]

**Changes Made:**

- [Describe the fix]

**Testing Performed:**

- [How you verified the fix]

## 📊 Impact Assessment

**Performance Impact:** [None/Minor/Significant]
**Breaking Changes:** [None/Yes - describe]
**Side Effects:** [Any unintended consequences]

## 🤖 Signature

**Fixed By:** Cursor AI
**Date:** [YYYY-MM-DD]
**Tested In:** [Both worktrees/Cursor only]
```

#### **4. Cross-Worktree Testing**

```bash
# When fixing shared components:
1. Test fix in Cursor worktree (port 3000)
2. Coordinate with Claude for Claude worktree testing (port 3001)
3. Verify no regressions in either environment
4. Document compatibility in bug report
```

### **📊 Bug Tracking Index Updates**

**Always update:** `Project_Knowledge/Bug_Reports/bug-tracking-index.md`

```markdown
# Add entry format:

| BUG-XXX | [Severity] | [Description] | [Status] | [Date] | [Link] |

# Cross-worktree section:

### Cross-Worktree Fixes (Fixed by Other AI)

| ID      | Origin | Fixed By | Date       | Description      | Cross-Ref                                     |
| ------- | ------ | -------- | ---------- | ---------------- | --------------------------------------------- |
| BUG-001 | Claude | Cursor   | 2025-01-22 | TypeScript error | Cross_References/2025-01-22_claude-bug-001.md |
```

---

## 🔄 **COORDINATION WITH CLAUDE**

### **🤖 Communication Protocol**

#### **Before Major Changes:**

1. **Check Shared Files:** Review if changes affect useAuth.ts, CollapsibleCard.tsx, or database types
2. **Breaking Changes:** Notify about any modifications that might impact Claude's work
3. **Database Schema:** Never modify database schema - escalate to Claude
4. **Authentication:** Coordinate any auth-related changes

#### **During Development:**

1. **Progress Updates:** Mark completed tasks in TASKS-ACTIVE.md immediately
2. **New Issues:** Document any newly discovered bugs or technical debt
3. **Performance Metrics:** Track bundle size, loading times, accessibility scores

#### **After Task Completion:**

1. **Documentation:** Update all relevant documentation files
2. **Testing:** Verify changes work in Cursor worktree
3. **Coordination:** Note any changes that need Claude testing
4. **Commit:** Use proper commit message format

### **🚨 Emergency Escalation**

**Immediate Claude Coordination Required:**

- **TypeScript Explosion:** Compilation completely broken
- **Authentication Issues:** User login/logout not working
- **Database Connectivity:** Supabase connection problems
- **Build Failures:** Production build completely broken

**Communication Method:**

- Update TASKS-ACTIVE.md with "🚨 CURSOR BLOCKED" status
- Document the specific issue and attempted solutions
- Claude will respond in next session

---

## ⏰ **COMMIT, MERGE & BACKUP PROTOCOLS**

### **📝 Commit Guidelines**

#### **Commit Frequency:**

```bash
# Commit immediately after:
✅ Bug fix verified and tested
✅ Feature milestone completed
✅ UI component finalized
✅ Performance optimization implemented
✅ End of development session
```

#### **Commit Message Format:**

```bash
# Use this exact format:
git commit --no-verify -m "[type]: [description]

🎨 Generated with Cursor
Co-Authored-By: Claude <noreply@anthropic.com>"

# Types: feat, fix, style, refactor, test, docs
# Example:
git commit --no-verify -m "fix: resolve CollapsibleCard props inconsistency

🎨 Generated with Cursor
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### **🔀 Merge Coordination**

#### **Merge Timing (READ PLANNING.md for current status):**

**🔥 Immediate Merge Required:**

- Critical bug fixes that block core functionality
- Security vulnerabilities resolved
- Breaking changes affecting shared components
- Database schema updates (Claude handles)

**📅 Scheduled Merges:**

- Every Friday evening (weekly sync)
- After completing major milestones
- Before starting new complex features

#### **Your Role in Merges:**

1. **Preparation:** Ensure all your work is committed and tested
2. **Readiness:** Confirm no critical issues in your worktree
3. **Coordination:** Claude handles the actual merge process
4. **Testing:** Verify functionality after merge completion

### **💾 Backup Protocol**

```bash
# Cursor backup frequency: Every 2 commits
git branch Curs-Backup-YYYYMMDD-HHmm

# Before major changes:
git branch Curs-PreChange-[description]-YYYYMMDD

# Emergency backup:
git branch Curs-Emergency-[issue]-YYYYMMDD
```

---

## 📊 **SUCCESS METRICS & QUALITY STANDARDS**

### **🎯 Performance Targets**

```
📦 Bundle Size: <1MB (Current: 1.7MB)
⚡ Loading Time: <3 seconds first load
📱 Mobile Score: >90 Lighthouse
♿ Accessibility: WCAG 2.1 AA compliance
🔧 TypeScript: 100% strict mode compliance
```

### **🧪 Testing Requirements**

```
📋 Component Coverage: >80% for UI components
🔄 Integration Tests: All user workflows
👤 Accessibility Tests: Screen reader compatibility
📱 Cross-browser: Chrome, Firefox, Safari, Edge
📲 Mobile Testing: iOS Safari, Chrome Android
```

### **💡 Code Quality Standards**

```typescript
// Always use TypeScript strict mode
// Example component pattern:

interface ComponentProps {
  title: string;
  isVisible?: boolean;
  onAction: (data: ActionData) => void;
}

const MyComponent: React.FC<ComponentProps> = ({
  title,
  isVisible = false,
  onAction
}) => {
  // Component implementation
  return (
    <div className="responsive-component">
      {/* Accessible, responsive UI */}
    </div>
  );
};

export default MyComponent;
```

---

## 🛠️ **DEVELOPMENT ENVIRONMENT**

### **🔧 Commands Reference**

```bash
# Cursor Development (Port 3000)
npm run dev              # Start development server
npm run build            # Production build
npm run type-check       # TypeScript validation (currently disabled)
npm run lint             # ESLint validation
npm run test             # Run test suite

# Working Directory
cd "C:/Users/matte.MIO/Documents/GitHub/BHM-v.2-Cursor"
```

### **📁 Critical File Locations**

```
src/features/management/     # Staff & department management (Your domain)
src/features/settings/       # Settings system (Your domain)
src/features/dashboard/      # Analytics dashboard (Your domain)
src/components/ui/           # UI component library (Your domain)
src/hooks/useAuth.ts         # Authentication (Shared - coordinate)
src/components/CollapsibleCard.tsx  # UI pattern (Shared - coordinate)
```

### **🚨 Environment Rules**

```bash
# CRITICAL - Always verify:
✅ Working on "Curs" branch (not main)
✅ Development server on port 3000
✅ Supabase connection working
✅ No TypeScript compilation errors before commit
```

---

## 📚 **QUICK REFERENCE CHEAT SHEET**

### **🔥 Daily Workflow**

1. Link required files: TASKS-ACTIVE.md, CURSOR-INSTRUCTIONS.md, bug files
2. Check PLANNING.md for merge alerts
3. Focus on UI/UX, CRUD, performance tasks
4. Test changes thoroughly
5. Update documentation immediately
6. Commit with proper format
7. Update TASKS-ACTIVE.md progress

### **🆘 Emergency Contacts**

- **TypeScript Errors:** Coordinate with Claude
- **Database Issues:** Escalate to Claude (schema owner)
- **Authentication:** Requires Claude architecture review
- **Build Failures:** Check with Claude for shared component issues

### **📖 Key Documentation**

- **Current Tasks:** TASKS-ACTIVE.md
- **Architecture:** PLANNING.md
- **Coordination:** Claude.md
- **Bug System:** Bug_Reports/Cross_References/README.md
- **Session Rules:** SESSION-STARTUP-GUIDE.md

---

## 🎯 **SESSION END CHECKLIST**

**Before Ending Each Session:**

1. **✅ Mark Completed Tasks** in TASKS-ACTIVE.md
2. **📝 Document New Issues** discovered during development
3. **🔄 Update Bug Reports** with any fixes applied
4. **💾 Commit All Changes** with proper message format
5. **📊 Update Progress** in session summary
6. **🤝 Note Coordination** needed with Claude
7. **🔍 Check for Merge** triggers in PLANNING.md

---

**🎨 For Cursor AI Assistant**
**📱 HACCP Business Manager PWA**
**🔄 Updated January 22, 2025**

---

_This document contains everything Cursor needs for effective coordination with Claude. Always start sessions by reading this file along with TASKS-ACTIVE.md for current priorities._
