# 🤖 AI Agent Development Workflow - HACCP Business Manager

**Specialized workflow for Cursor, Gemini, and Claude AI agents working collaboratively on the HACCP Business Manager project.**

## 📋 Table of Contents

- [Agent-Specific Workflow](#agent-specific-workflow)
- [Branch Management](#branch-management)
- [Bug Assignment System](#bug-assignment-system)
- [Quality Gates](#quality-gates)
- [Agent Responsibilities](#agent-responsibilities)
- [Escalation Process](#escalation-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)

## 🎯 Agent-Specific Workflow

### 🔄 **Branch Management System**

Each AI agent works on a **dedicated permanent branch**:

```bash
main                    # ← Stable version (managed by Matteo)
├── cursor-workspace    # ← Cursor's permanent working branch
├── gemini-workspace    # ← Gemini's permanent working branch
├── claude-workspace    # ← Claude's permanent working branch
└── hotfix/*           # ← Emergency fixes (any agent)
```

### 📋 **Daily Workflow for All Agents**

**BEFORE starting any work:**

```bash
# 1. Switch to your workspace
git checkout [agent]-workspace

# 2. Sync with main (MANDATORY)
git pull origin main
git rebase origin/main  # Resolve any conflicts

# 3. Check app status
npm run dev                    # Start if not running
node debug-app-detailed.js     # Run full test suite

# 4. ANALYZE BEFORE CODING (MANDATORY)
# - Read ENTIRE component/file you plan to modify
# - Understand app structure and dependencies
# - Review related components and imports
# - Check existing patterns and conventions

# 5. Work on assigned tasks
# 6. Test your changes
# 7. Commit with clear messages
# 8. Push to your workspace
```

## 🎯 Bug Assignment System

### **🚨 IMMEDIATE ASSIGNMENT RULES**

**No waiting for assignment needed** - Use this decision tree:

#### **🔧 CURSOR handles (< 15min fixes):**

- ✅ TypeScript compilation errors
- ✅ Import/export issues
- ✅ Syntax and linting errors
- ✅ Simple UI component fixes
- ✅ Dependency updates
- ✅ Basic form validation
- ✅ CSS/styling adjustments

**🎯 Cursor Problem-Solving Pattern:**

```
1. 📋 PROBLEM RECEIVED → Examine the issue details
2. 🔍 ANALYZE PROBLEM → Review error messages and context
3. 📚 CHECK ASSIGNMENT → Consult CONTRIBUTING.md decision tree
4. ✅ IF CURSOR TASK → Proceed with fix immediately
5. ❌ IF NOT CURSOR → Inform user which agent should handle it

CURSOR Response Templates:
✅ "This is a [TypeScript/UI/Import] issue - I'll fix it now"
❌ "This requires [Architecture/Auth/Security] expertise - assign to [Claude/Gemini]"
```

**Cursor Fix Template:**

```
Fix: [Bug description]
Files affected: [list]
Expected: Standard TypeScript/React fix
Deadline: 15 minutes max
```

#### **⚡ GEMINI/CLAUDE handle (Complex fixes):**

- 🔥 **Architecture restructuring**
- 🔐 **Authentication/Authorization issues**
- 💾 **Database schema changes**
- 🚀 **Performance optimizations**
- 🔒 **Security vulnerabilities**
- 🧪 **Testing infrastructure setup**
- 🏗️ **Build/deployment problems**
- 🌐 **Cross-platform compatibility**

**Claude/Gemini Prompt Template:**

```
Complex Fix Required: [Detailed description]
System Impact: [Architecture/Security/Performance]
Analysis needed: [Root cause investigation]
Testing: [Comprehensive validation required]
```

### **🔄 Escalation System**

```bash
# CURSOR → CLAUDE/GEMINI escalation triggers:
- Fix takes > 15 minutes
- Requires architecture changes
- Affects multiple system components
- Security implications discovered
```

## ✅ Quality Gates

### **🧪 MANDATORY Testing Before Commit**

All agents must run these tests before pushing:

```bash
# 1. TypeScript check (MUST pass)
npm run type-check

# 2. Linting (MUST pass)
npm run lint

# 3. Basic tests (MUST pass)
npm run test

# 4. Full app testing (CRITICAL)
node debug-app-detailed.js    # Our Puppeteer test suite
```

### **🎯 Commit Standards**

Use conventional commits with agent prefix:

```bash
# CURSOR commits:
git commit -m "fix(cursor): resolve TypeScript import error in AuthComponent"
git commit -m "style(cursor): update button styling in UserProfile"

# GEMINI/CLAUDE commits:
git commit -m "feat(claude): implement advanced user authentication system"
git commit -m "perf(gemini): optimize database query performance"
```

## 🎯 Agent Responsibilities

### **🔧 CURSOR - Rapid Development**

**Specialty**: Quick fixes, standard implementations
**Working time**: < 15 minutes per task
**Focus areas**:

- TypeScript/JavaScript errors
- Component implementations
- UI/UX adjustments
- Dependency management
- Code formatting

**Daily workflow**:

```bash
git checkout cursor-workspace
git rebase origin/main
# Fix assigned bugs quickly
# Test with npm commands
# Push to cursor-workspace
```

### **⚡ GEMINI - System Architecture**

**Specialty**: Complex system design and integration
**Working time**: Hours to days per task
**Focus areas**:

- Database design and optimization
- Authentication systems
- API architecture
- Performance optimization
- Cross-platform compatibility

### **🧠 CLAUDE - Analysis & Security**

**Specialty**: Deep analysis, security, and advanced features
**Working time**: Variable, thorough investigation
**Focus areas**:

- Security vulnerability analysis
- Code architecture review
- Advanced testing strategies
- Documentation and planning
- Complex debugging

## 🚨 Escalation Process

### **CURSOR → CLAUDE/GEMINI**

```bash
# When CURSOR hits a roadblock:
git commit -m "wip(cursor): escalating - [reason]"
git push cursor-workspace

# Create escalation note:
echo "ESCALATION: [description]" >> BUG_TRACKER.md
# Prompt for Claude/Gemini with full context
```

### **Emergency Hotfix Protocol**

```bash
# For critical production issues:
git checkout -b hotfix/critical-[issue]
# Fix immediately
# Test thoroughly
# Direct merge to main (Matteo approval)
```

## 📝 Code Quality Standards

### **TypeScript Requirements**

- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Proper interface definitions
- Comprehensive error handling

### **React Component Standards**

```typescript
// ✅ REQUIRED structure
interface ComponentProps {
  variant: 'primary' | 'secondary'
  children: React.ReactNode
  onAction?: () => void
}

export const Component: React.FC<ComponentProps> = ({
  variant,
  children,
  onAction
}) => {
  return (
    <div className="component-base">
      {children}
    </div>
  )
}
```

## 🧪 Testing Requirements

### **Required Test Coverage**

- **CURSOR**: Basic functionality tests
- **GEMINI/CLAUDE**: Comprehensive integration tests

### **Puppeteer Integration**

All major changes must pass:

```bash
node debug-app-detailed.js
# Must show: ✅ No critical errors
```

---

## 🎯 **SUMMARY FOR AGENTS**

1. **Work on your dedicated branch** (`[agent]-workspace`)
2. **Sync with main daily** before starting work
3. **Use decision tree** for immediate bug assignment
4. **Follow quality gates** before every commit
5. **Escalate when needed** - no shame in complexity
6. **Test thoroughly** with our Puppeteer suite

**🚀 This workflow ensures rapid development while maintaining code quality and system stability.**
