# 🤖 HACCP Business Manager - CURSOR MULTI-AGENT ORCHESTRATION

**Version:** 1.0
**Date:** 3 Ottobre 2025
**Platform:** Cursor IDE con GPT-4 Codex
**Execution Mode:** Parallel Dual-Agent Debug Sprint
**Goal:** 100% App Stabilization in 2-3 weeks

---

## 🎯 **ORCHESTRATION OVERVIEW**

### **Execution Model**

```
CURSOR IDE (2 Workspaces/Windows)
├── Agent A (Primary) - Architecture & Critical Bugs
│   ├── Workspace A: C:\Users\matte.MIO\Documents\GitHub\BHM-v.2
│   ├── Branch: fix/agent-a-critical
│   ├── Focus: P0/P1 critical path
│   └── Tools: TypeScript, React DevTools, Supabase CLI
│
└── Agent B (Secondary) - UI/UX & Code Quality
    ├── Workspace B: C:\Users\matte.MIO\Documents\GitHub\BHM-v.2
    ├── Branch: fix/agent-b-quality
    ├── Focus: P1/P2 quality improvements
    └── Tools: ESLint, Vitest, Browser DevTools
```

### **Work Division Philosophy**

**Agent A = Deep & Complex**
- Critical crashes
- Data flow issues
- Hook dependencies
- Database/API integration
- TypeScript architecture

**Agent B = Wide & Quality**
- UI/UX bugs
- Layout responsive
- Component testing
- Code linting
- Test coverage

---

## 🏗️ **SETUP INSTRUCTIONS**

### **Prerequisites**

```bash
# Ensure you have:
- Node.js 18+ or 20+ LTS
- Cursor IDE latest version
- Git configured
- Supabase CLI (optional but recommended)
- npm installed globally
```

### **Initial Setup (Both Agents)**

#### **Agent A Setup**

```bash
# Terminal 1
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2

# Create and switch to agent A branch
git checkout main
git pull origin main
git checkout -b fix/agent-a-critical

# Install dependencies if needed
npm install

# Verify environment
npm run type-check
npm run lint

# Start dev server on port 3000
npm run dev

# Open Cursor IDE Window 1
cursor .
```

#### **Agent B Setup**

```bash
# Terminal 2 (new window)
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2

# Create and switch to agent B branch
git checkout main
git pull origin main
git checkout -b fix/agent-b-quality

# Start dev server on port 3001 (different port!)
PORT=3001 npm run dev

# Open Cursor IDE Window 2
cursor .
```

**Important:** Each agent runs on different port to avoid conflicts:
- Agent A: http://localhost:3000
- Agent B: http://localhost:3001

### **Cursor IDE Configuration**

#### **Agent A Settings**

Create file: `.cursor/agent-a-prompt.md`
```markdown
# Agent A - Architecture & Critical Bugs

You are Agent A working on critical architectural bugs.

## Your Role
- Fix critical crashes and errors
- Handle complex TypeScript issues
- Manage database/API integration
- Fix React hooks dependencies
- Implement architecture solutions

## Rules
- ONLY work on tasks assigned to Agent A in TASKS-STABILIZATION-2025-10-03.md
- NO new features - bug fixes only
- Follow existing code patterns
- Write tests for every fix
- Validate thoroughly before marking complete

## Current Focus
Check TASKS-STABILIZATION-2025-10-03.md for your current tasks (A1-A12)

## Communication
- Update task status in TASKS file
- Commit frequently with clear messages
- Document blockers immediately
- Sync with Agent B at designated sync points
```

#### **Agent B Settings**

Create file: `.cursor/agent-b-prompt.md`
```markdown
# Agent B - UI/UX & Code Quality

You are Agent B working on UI/UX and code quality.

## Your Role
- Fix UI/layout bugs
- Improve responsive design
- Clean up ESLint warnings
- Fix TypeScript quality issues
- Write component tests
- Improve code quality

## Rules
- ONLY work on tasks assigned to Agent B in TASKS-STABILIZATION-2025-10-03.md
- NO new features - improvements only
- Maintain consistent UI patterns
- Write comprehensive tests
- Follow Tailwind best practices

## Current Focus
Check TASKS-STABILIZATION-2025-10-03.md for your current tasks (B1-B11)

## Communication
- Update task status in TASKS file
- Commit frequently with clear messages
- Document UI/UX decisions
- Sync with Agent A at designated sync points
```

---

## 📅 **SPRINT SCHEDULE**

### **Week 1: Critical Bugs (Days 1-5)**

#### **Day 1 - Monday**

**Agent A Morning:**
- [ ] Task A1: Fix React Import Error (30min)
- [ ] Task A2: Diagnose Conservation Crash (2-3h)

**Agent A Afternoon:**
- [ ] Task A3: Fix Conservation Crash (2-3h)

**Agent B Morning:**
- [ ] Task B3: Audit Responsive Layout (2h)
- [ ] Task B1: Fix CollapsibleCard Inventory (start)

**Agent B Afternoon:**
- [ ] Task B1: Fix CollapsibleCard Inventory (finish, 2-3h total)

**End of Day:**
- Both agents: Update standup doc
- Commit all work
- No sync needed today (independent tasks)

---

#### **Day 2 - Tuesday**

**Agent A Morning:**
- [ ] Task A4: Verify Conservation Hooks (2h)
- [ ] Task A5: Diagnose Categories System (1-2h)

**Agent A Afternoon:**
- [ ] Task A6: Implement Categories UI (2h)

**Agent B Morning:**
- [ ] Task B2: Fix CollapsibleCard Settings (2h)

**Agent B Afternoon:**
- [ ] Task B4: Fix Responsive Issues (start, 3-4h total)

**End of Day:**
- Both agents: Update standup
- Agent A: Conservation should be working
- Agent B: CollapsibleCard pattern standardized

---

#### **Day 3 - Wednesday**

**Agent A Morning:**
- [ ] Task A7: Fix useCategories Hook (1-2h)
- [ ] Task A8: Verify Database & RLS (1h)

**Agent A Afternoon:**
- [ ] Task A9: Fix React Hook Error CreateListModal (1-2h)

**Agent B Morning/Afternoon:**
- [ ] Task B4: Fix Responsive Issues (finish)
- [ ] Task B5: Improve CollapsibleCard Component (2h)

**End of Day - SYNC POINT 1:**
```bash
# Both agents:
git add .
git commit -m "checkpoint: week 1 day 3"
git push origin [your-branch]

# Create integration branch
git checkout main
git pull origin main
git checkout -b integration/week1-sync1
git merge fix/agent-a-critical
git merge fix/agent-b-quality

# Resolve conflicts if any
npm run type-check
npm run lint
npm run build
npm run dev

# Manual test ALL pages:
1. /conservation (should be fixed!)
2. /inventory (categories should work!)
3. /settings (cards should show correctly)
4. All responsive on mobile/tablet/desktop

# Document issues found
# If major issues: fix before continuing
# If minor: add to backlog

# Both agents update:
git checkout [your-branch]
git merge integration/week1-sync1
```

---

#### **Day 4 - Thursday**

**Agent A Morning:**
- [ ] Task A10: Verify Calendar Sync (2-3h)

**Agent A Afternoon:**
- [ ] Task A11: Cleanup Unused Variables (start, 3-4h total)

**Agent B Morning:**
- [ ] Task B6: Fix ExcelExporter Tests (2-3h)

**Agent B Afternoon:**
- [ ] Task B7: Replace Explicit 'any' Types (start, 2-3h total)

**End of Day:**
- Both agents: Update standup
- Progress check: ~60% of tasks should be done

---

#### **Day 5 - Friday**

**Agent A Morning/Afternoon:**
- [ ] Task A11: Cleanup Unused Variables (finish)

**Agent B Morning:**
- [ ] Task B7: Replace Explicit 'any' Types (finish)

**Agent B Afternoon:**
- [ ] Task B8: Fix exhaustive-deps Warnings (1-2h)
- [ ] Task B9: Fix react-refresh Warnings (1h)

**End of Day:**
- Both agents: Commit all work
- Week review meeting (optional)
- Plan weekend work if needed

---

### **Week 2: Quality & Testing (Days 6-10)**

#### **Day 6 - Monday**

**Agent A Morning:**
- [ ] Task A12: Verify Management & Dashboard (2h)

**Agent A Afternoon:**
- [ ] Code review Agent B work
- [ ] Fix any issues found in verification

**Agent B Morning:**
- [ ] Task B10: Final ESLint Cleanup (1h)
- [ ] Task B11: Component Testing Suite (start, 3-4h total)

**Agent B Afternoon:**
- [ ] Task B11: Component Testing Suite (continue)

**End of Day - SYNC POINT 2:**
```bash
# Both agents: Merge and test

# Expected state:
- TypeScript errors: 0
- ESLint warnings: < 5
- All critical bugs fixed
- All high priority bugs fixed
- Medium priority cleanup done

# Integration test
git checkout integration/week2-sync2
git merge fix/agent-a-critical
git merge fix/agent-b-quality

npm run type-check  # Should be ZERO errors
npm run lint        # Should be < 5 warnings
npm run build       # Should succeed
npm run test        # Should pass

# If all pass:
# → Ready for final testing
# If any fail:
# → Fix before proceeding
```

---

#### **Day 7 - Tuesday**

**Both Agents:**
- [ ] Comprehensive manual testing
- [ ] E2E test scenarios
- [ ] Performance profiling
- [ ] Documentation updates

**Testing Checklist:**
```
Authentication:
- [ ] Login/Logout works
- [ ] Role-based access works
- [ ] Protected routes work

Onboarding:
- [ ] All 6 steps completable
- [ ] Validation works
- [ ] Data persists
- [ ] Can start over

Conservation (Agent A Focus):
- [ ] Page loads without crash ✓
- [ ] View conservation points ✓
- [ ] Add conservation point ✓
- [ ] Record temperature ✓
- [ ] Complete maintenance ✓
- [ ] All stats correct ✓

Inventory (Both Agents):
- [ ] Page loads ✓
- [ ] Categories CRUD works ✓
- [ ] Products CRUD works ✓
- [ ] Filter by category ✓
- [ ] Expiry tracking works ✓
- [ ] Shopping lists work ✓

Calendar (Agent A Focus):
- [ ] Loads correctly ✓
- [ ] Tasks sync ✓
- [ ] Maintenance sync ✓
- [ ] CRUD works ✓
- [ ] Filters work ✓

Management (Agent A Verify):
- [ ] Staff CRUD ✓
- [ ] Departments CRUD ✓
- [ ] Role assignment ✓

Settings (Agent B Focus):
- [ ] All sections load ✓
- [ ] Settings save ✓
- [ ] UI responsive ✓

Dashboard (Agent A Verify):
- [ ] KPIs accurate ✓
- [ ] Charts load ✓
- [ ] Data correct ✓

Responsive (Agent B Focus):
- [ ] Mobile 375px ✓
- [ ] Mobile 414px ✓
- [ ] Tablet 768px ✓
- [ ] Tablet 1024px ✓
- [ ] Desktop 1920px ✓
```

---

#### **Day 8 - Wednesday**

**Both Agents:**
- [ ] Fix issues found in Day 7 testing
- [ ] Performance optimization if needed
- [ ] Final code review
- [ ] Documentation completion

**Deliverables:**
- All bugs fixed
- All tests passing
- Documentation complete
- Ready for staging deploy

---

#### **Day 9-10 - Thursday/Friday**

**Both Agents:**
- [ ] Prepare for merge to main
- [ ] Final validation
- [ ] Staging deployment
- [ ] Monitor staging for 24h
- [ ] Fix any production issues

**End of Week 2 - FINAL SYNC:**
```bash
# Create final integration
git checkout main
git pull origin main
git checkout -b release/stabilization-v1
git merge fix/agent-a-critical
git merge fix/agent-b-quality

# Final validation
npm run type-check  # MUST be 0 errors
npm run lint        # MUST be < 5 warnings
npm run build       # MUST succeed
npm run test        # MUST pass with > 90% coverage
npm run test:e2e    # MUST pass all scenarios

# If all pass:
git push origin release/stabilization-v1

# Create PR to main
# Get user approval
# Merge to main
# Deploy to production
```

---

## 🔄 **DAILY WORKFLOW**

### **Morning Routine (Both Agents)**

```bash
# 1. Pull latest from main and your branch
git checkout main && git pull origin main
git checkout [your-branch] && git pull origin [your-branch]

# 2. Merge main into your branch if needed
git merge main

# 3. Check for conflicts, resolve if any
# 4. Review task list for today
# 5. Start dev server
npm run dev

# 6. Pick first task marked TODO
# 7. Move task to IN PROGRESS in TASKS file
# 8. Create feature sub-branch if needed
git checkout -b feature/[task-id]
```

### **During Work (Both Agents)**

```bash
# For each task:

# 1. Read task description completely
# 2. Understand acceptance criteria
# 3. Implement fix following task steps
# 4. Test incrementally
# 5. Run validations:
npm run type-check  # No new errors
npm run lint        # No new warnings
npm run test        # Tests pass

# 6. Commit frequently
git add .
git commit -m "fix([task-id]): [what you did]"

# 7. Push to branch
git push origin [your-branch]

# 8. Update task status to DONE
# 9. Document in standup notes
```

### **End of Day (Both Agents)**

```bash
# 1. Ensure all work committed
git status  # Should be clean

# 2. Push all commits
git push origin [your-branch]

# 3. Update standup doc
# File: docs/standup/[date].md

## Agent [A/B] - [Date]

### Completed Today
- [x] Task [ID]: [Description]
- [x] Task [ID]: [Description]

### In Progress
- [ ] Task [ID]: [Description] (70% done)

### Blockers
- None / [Description of blocker]

### Tomorrow Plan
- [ ] Finish Task [ID]
- [ ] Start Task [ID]

### Notes
[Any important notes or decisions]

# 4. Check if sync point reached
# 5. If sync: Follow sync procedure
# 6. Plan next day
```

---

## 🚨 **CONFLICT RESOLUTION**

### **Git Conflicts**

If merge conflicts occur:

```bash
# 1. Don't panic
# 2. Identify conflicting files
git status

# 3. For each conflict:
# Open in Cursor IDE
# Review both changes
# Decide which to keep or merge both

# 4. Common conflicts:
# - TASKS file: Merge both task updates
# - Same component: Discuss with other agent
# - Package.json: Usually accept incoming

# 5. After resolving:
git add [file]
git commit -m "merge: resolve conflicts in [file]"

# 6. Test thoroughly
npm run type-check
npm run build
npm run dev
```

### **Task Overlap**

If both agents need same file:

1. **Check dependency graph** in TASKS file
2. **Communicate** via standup doc or direct message
3. **Decide priority**:
   - Critical bug fixes (Agent A) take precedence
   - UI fixes (Agent B) can wait
4. **Sequence work**: Agent A finishes, then Agent B
5. **Update** TASKS file with new dependency

### **Blockers**

If blocked on a task:

1. **Document blocker** in standup immediately
2. **Mark task** as ⚠️ BLOCKED in TASKS file
3. **Try alternatives**:
   - Can you work around it?
   - Can other agent unblock you?
   - Can you skip and return later?
4. **Escalate** if blocker critical
5. **Move to next task** if possible

---

## 📊 **PROGRESS TRACKING**

### **Dashboard (Manual)**

Create file: `docs/progress/dashboard.md`

Update daily:

```markdown
# Stabilization Progress Dashboard

**Updated:** [Date]

## Overall Progress
- Tasks Completed: [X] / 23 (YY%)
- TypeScript Errors: [N] / 92 (started)
- ESLint Warnings: [N] / 40+ (started)
- Test Coverage: [N]%

## Agent A Progress
- Completed: [X] / 12 tasks
- In Progress: [Task IDs]
- Blocked: [None/Task IDs]
- Ahead/Behind Schedule: [Assessment]

## Agent B Progress
- Completed: [X] / 11 tasks
- In Progress: [Task IDs]
- Blocked: [None/Task IDs]
- Ahead/Behind Schedule: [Assessment]

## Critical Path Status
- [ ] C001: Conservation Fixed
- [ ] C002: Categories Fixed
- [ ] C003: React Import Fixed

## Sync Points
- [ ] Sync 1 (Day 3): Not reached/Completed
- [ ] Sync 2 (Day 6): Not reached/Completed
- [ ] Final Sync (Day 10): Not reached/Completed

## Risks
- [None] / [List any risks to timeline]

## Next Milestones
1. [Description] - ETA: [Date]
2. [Description] - ETA: [Date]
```

---

## ✅ **SUCCESS CRITERIA**

### **Per Agent**

**Agent A Success:**
- [ ] All A1-A12 tasks completed
- [ ] Conservation page 100% working
- [ ] Categories system 100% working
- [ ] Calendar sync verified
- [ ] TypeScript architectural errors fixed
- [ ] All tests written pass

**Agent B Success:**
- [ ] All B1-B11 tasks completed
- [ ] All CollapsibleCard working
- [ ] Layout 100% responsive
- [ ] ESLint warnings < 5
- [ ] Explicit 'any' types < 5
- [ ] Component tests comprehensive

### **Combined Success (FINAL)**

- [ ] TypeScript errors: 0
- [ ] ESLint warnings: < 5
- [ ] Build time: < 8s
- [ ] Test coverage: > 90%
- [ ] All critical bugs: Fixed
- [ ] All high bugs: Fixed
- [ ] All medium issues: Fixed
- [ ] All pages: Working
- [ ] All features: Tested
- [ ] Responsive: All breakpoints
- [ ] Performance: Lighthouse > 90
- [ ] Sentry: Configured
- [ ] Documentation: Complete
- [ ] Ready for production

---

## 🎓 **BEST PRACTICES**

### **Communication**

1. **Over-communicate**: Better to over-share than under-share
2. **Update frequently**: Standup docs daily minimum
3. **Ask questions**: Don't assume, clarify
4. **Document decisions**: Why you chose solution X over Y
5. **Flag blockers early**: Don't wait until EOD

### **Code Quality**

1. **Follow existing patterns**: Don't introduce new styles
2. **Test everything**: Every fix needs test
3. **Commit atomically**: One logical change per commit
4. **Write clear messages**: "fix(conservation): handle empty state"
5. **Review before committing**: Self-review in Cursor IDE

### **Time Management**

1. **Time-box tasks**: If task taking 2x estimate, reassess
2. **Take breaks**: Pomodoro technique (25min work, 5min break)
3. **Track actual time**: Compare to estimates, adjust
4. **Finish what you start**: Don't context-switch mid-task
5. **End day cleanly**: Commit everything, update docs

### **Collaboration**

1. **Respect sync points**: Critical for integration
2. **Help each other**: If ahead, offer help to other agent
3. **Share learnings**: Found a useful pattern? Share it
4. **Review each other**: Cross-review code for quality
5. **Celebrate wins**: Acknowledge task completions

---

## 📚 **REFERENCE DOCS**

### **Always Check First**

1. **PRD**: `PRD-CURRENT-STATE-2025-10-03.md`
   - Understand project goals
   - Know what's in scope
   - Reference feature specs

2. **DEBUG PLAN**: `DEBUG_PLAN-2025-10-03.md`
   - Detailed bug descriptions
   - Fix strategies
   - Validation criteria

3. **TASKS**: `TASKS-STABILIZATION-2025-10-03.md`
   - Your specific tasks
   - Acceptance criteria
   - Dependencies

4. **Existing Docs**: `docs/`
   - Setup guides
   - Architecture notes
   - Onboarding guides

### **Cursor Composer Usage**

For complex tasks, use Cursor Composer:

```
@workspace Fix [Task ID] - [Description]

Context:
- Read: [relevant files]
- Task: [TASKS file excerpt]
- Goal: [what to achieve]

Rules:
- No new features
- Follow existing patterns
- Write tests
- Validate thoroughly

Steps:
[Copy steps from TASKS file]
```

---

## 🏁 **COMPLETION PROTOCOL**

### **When All Tasks Done**

1. **Final Integration**
```bash
git checkout -b release/stabilization-complete
git merge fix/agent-a-critical
git merge fix/agent-b-quality
```

2. **Final Validation**
```bash
npm run type-check     # 0 errors
npm run lint           # < 5 warnings
npm run build          # success
npm run test           # > 90% coverage
npm run test:e2e       # all pass
```

3. **Manual Testing**
- Full app walkthrough
- All user scenarios
- All device sizes
- All edge cases

4. **Documentation**
- Update CHANGELOG.md
- Update README.md
- Create STABILIZATION-COMPLETE.md report

5. **Prepare for Production**
- Configure Sentry with real DSN
- Set up monitoring alerts
- Prepare rollback plan
- Schedule deployment

6. **Deploy**
- Staging first
- Monitor for 24h
- Fix any issues
- Production deploy
- Monitor for 48h

7. **Handoff**
- Demo to user
- Transfer knowledge
- Document lessons learned
- Plan Phase 2

---

## 🎉 **POST-STABILIZATION**

After successful completion:

1. **Retrospective**
   - What went well?
   - What could improve?
   - Lessons learned
   - Update processes

2. **Documentation**
   - Archive working docs
   - Update living docs
   - Create runbook
   - Document patterns

3. **Planning Phase 2**
   - Review roadmap
   - Prioritize enhancements
   - Estimate timeline
   - Assign responsibilities

4. **Celebration**
   - Acknowledge effort
   - Review achievements
   - Rest and recharge
   - Prepare for next phase

---

**Document Control:**
- **Created:** 3 Ottobre 2025
- **Status:** Active Orchestration Guide
- **Platform:** Cursor IDE + GPT-4 Codex
- **Execution:** Dual-Agent Parallel Sprint

---

_This guide orchestrates 2 AI agents working in parallel in Cursor IDE to stabilize the HACCP Business Manager app to 100% functionality in 2-3 weeks. Follow this guide exactly for optimal results._
