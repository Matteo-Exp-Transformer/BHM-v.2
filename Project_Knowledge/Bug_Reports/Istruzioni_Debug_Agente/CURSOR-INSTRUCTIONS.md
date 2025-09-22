# 🎯 CURSOR DEVELOPMENT INSTRUCTIONS & PROTOCOLS

**Source:** Extracted from TASKS.md lines 1414-1677
**Project:** HACCP Business Manager PWA
**Last Updated:** January 22, 2025

---

## 📋 **CONTEXT: QUICK PROJECT SUMMARY**

HACCP Business Manager è una PWA per digitalizzare la sicurezza alimentare nei ristoranti.

**Milestones Completati:**

- ✅ Authentication System (B.0)
- ✅ Staff & Department Management (B.1.1)
- ✅ Calendar Integration (B.1.2)
- ✅ Conservation System (B.2)
- ✅ Inventory & Shopping Lists (B.3)
- ✅ Settings & Dashboard (B.5)

**Current Priority:** Fix 5 TypeScript errors blocking commits + Performance optimization.

---

## 🚀 **CURSOR SESSION STARTUP CHECKLIST**

**📋 EVERY CURSOR SESSION MUST BEGIN WITH:**

1. ✅ **Read PLANNING.md** - Review architecture and technical stack
2. ✅ **Check TASKS.md** - Current milestone status and priorities
3. ✅ **Review Claude.md** - Coordination with Claude and session history
4. ✅ **Verify Branch Status** - Ensure working on correct Curs branch
5. ✅ **Start Development Server** - `npm run dev` on port 3000 (Cursor worktree)

## 🎯 **CURSOR PRIMARY RESPONSIBILITIES**

### **IMMEDIATE PRIORITY TASKS FOR CURSOR:**

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

## 🛠️ **CURSOR TECHNICAL STANDARDS**

### **Code Quality Requirements:**

- **TypeScript**: Always for new components
- **Mobile-first**: Design responsive prioritario
- **CollapsibleCard pattern**: Standard per sezioni principali
- **Error Handling**: Toast notifications + graceful fallbacks
- **Testing**: React Testing Library for critical components

### **Component Patterns to Follow:**

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

## 🐛 **BUG TRACKING & FIX MANAGEMENT PROTOCOL**

### **🔥 CRITICAL: Bug Discovery and Documentation**

**When Cursor discovers a bug during testing:**

1. **IMMEDIATE DOCUMENTATION** - Create bug report in structured format
2. **BUG CATEGORIZATION** - Classify by severity and impact
3. **FIX IMPLEMENTATION** - Apply fix with detailed documentation
4. **TESTING VERIFICATION** - Confirm fix resolves issue
5. **KNOWLEDGE BASE UPDATE** - Add to project knowledge base

### **📁 Bug Report File Structure**

**Use this folder structure in Project_Knowledge:**

```
Project_Knowledge/
├── Bug_Reports/
│   ├── Critical/           # Severity: Critical (app breaking)
│   ├── High/              # Severity: High (major functionality)
│   ├── Medium/            # Severity: Medium (moderate impact)
│   ├── Low/               # Severity: Low (minor issues)
│   ├── Fixed/             # Archive of resolved bugs
│   │   ├── Critical/
│   │   ├── High/
│   │   ├── Medium/
│   │   └── Low/
│   └── Templates/
│       └── bug-report-template.md
```

### **🔄 Bug Management Workflow**

**For Each Bug Discovered:**

1. **Create Bug Report** using template
2. **File in Appropriate Severity Folder**
3. **Add Entry to Bug Tracking Index**
4. **Fix Bug** with detailed documentation
5. **Test Fix Thoroughly**
6. **Move Report to Fixed Folder**
7. **Update Bug Tracking Index**

### **📊 Bug Tracking Index**

**Update:** `Project_Knowledge/Bug_Reports/bug-tracking-index.md`

## 📋 **SESSION END REQUIREMENTS FOR CURSOR**

**Before ending each Cursor session:**

1. ✅ **Update TASKS.md** - Mark completed milestones
2. ✅ **Document any bugs found** - Use bug report template
3. ✅ **Update bug tracking index** - Maintain current status
4. ✅ **Commit changes** - Descriptive commit messages
5. ✅ **Update session progress** - Communication for Claude coordination

## 🔗 **COORDINATION WITH CLAUDE**

### **Shared Files (Require Coordination):**

- `src/hooks/useAuth.ts` - Authentication system
- `src/lib/supabase/client.ts` - Database types (Claude lead)
- `src/types/*.ts` - Type definitions
- `src/components/ui/CollapsibleCard.tsx` - Base component

### **⚠️ CRITICAL CONSTRAINTS**

- **Database Schema:** Do NOT modify without Claude coordination
- **Authentication Logic:** Do NOT change useAuth.ts without approval
- **CollapsibleCard API:** Follow established patterns (defaultExpanded, counter)

### **Communication Protocol:**

- **Breaking Changes:** Notify Claude immediately
- **Shared Component Updates:** Test on both worktrees
- **TypeScript Errors:** Coordinate solution approach
- **Database Issues:** Escalate to Claude immediately

## 🎖️ **SUCCESS METRICS FOR CURSOR**

### **Immediate Goals (Current Session):**

- ✅ Zero TypeScript errors
- ✅ Successful git push to GitHub
- ✅ All Cursor components working without props errors
- ✅ Clean browser console (no warnings)

### **Short-term Goals (2 weeks):**

- Bundle size <1.2MB (from 1.7MB)
- Settings system 100% functional with database
- Dashboard real-time data integration
- Mobile performance optimization

### **Long-term Goals (1 month):**

- Test coverage >80%
- Lighthouse score >95
- Component library documented
- Accessibility compliance (WCAG AA)

---

**⚠️ CRITICAL REMINDER:** TypeScript errors are currently blocking git commits. This is the HIGHEST PRIORITY for Cursor to resolve immediately.
