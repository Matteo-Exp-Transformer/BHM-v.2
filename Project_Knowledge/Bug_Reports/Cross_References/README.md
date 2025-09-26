# 🔗 Cross-References Bug System

**Purpose:** Track bug fixes performed across AI agents (Claude/Gemini/Cursor)
**Updated:** September 25, 2025
**Critical:** Must include TypeScript error fixes and Puppeteer MCP testing results

---

## 📋 **SYSTEM OVERVIEW**

### **Ownership Rule:**

- **Full Bug Report** = Created by discovering AI agent
- **Cross-Reference** = In other AI agents' directories, linking to full report + fix signature
- **TypeScript Errors** = Primary ownership by Gemini (cleanup specialist)
- **Puppeteer MCP Issues** = Shared between Gemini (setup) and Claude (integration)

### **File Naming Convention:**

```
YYYY-MM-DD_[origin-worktree]-bug-[ID].md

Examples:
2025-09-25_gemini-typescript-001.md    # TypeScript errors fixed by Gemini
2025-09-25_claude-mcp-puppeteer-002.md # Puppeteer MCP setup by Claude
2025-09-25_cursor-ui-bug-003.md        # UI bug fixed by Cursor
```

---

## 📝 **CROSS-REFERENCE TEMPLATE**

```markdown
# 🔗 Cross-Reference: [Bug Brief Description]

**Bug ID:** BUG-XXX
**Origin Agent:** Claude/Gemini/Cursor
**Discovered:** YYYY-MM-DD
**Fixed By:** Claude/Gemini/Cursor
**Related Issues:** [Link to TypeScript errors or MCP issues]
**Fixed Date:** YYYY-MM-DD
**Status:** Fixed

---

## 📋 Bug Summary

[One-line summary from original report]

## 🔗 Full Report Location

**Full Report:** `../BHM-v.2-[Origin]/Project_Knowledge/Bug_Reports/[Severity]/YYYY-MM-DD_bug-description.md`
**TypeScript Status:** [Fixed/Pending] (if applicable)
**Puppeteer Test Status:** [Passed/Failed/Pending] (if applicable)

## ✅ Fix Summary

**Solution Applied:** [Brief description of fix]
**Files Modified:** [List of files changed]
**Impact:** [Any side effects or improvements]

## 📝 Cross-Worktree Note

This bug was originally discovered in [Origin] worktree and has been resolved by [Fixer AI].
The fix has been tested and verified in both worktrees.

**Signature:** [Fixer AI] - [Date]
```

---

## 🔄 **WORKFLOW**

### **When Bug Found in Own Worktree:**

1. Create full bug report in local Bug_Reports/[Severity]/
2. Fix the bug
3. Move report to Fixed/[Severity]/
4. Update bug-tracking-index.md

### **When Bug Found in Other Worktree:**

1. Create full bug report in other worktree's Bug_Reports/[Severity]/
2. Fix the bug in other worktree
3. Create cross-reference in own Cross_References/
4. Update both bug-tracking-index.md files

### **Example Scenario:**

```
BUG-001: TypeScript Compilation Errors (190+ errors)
├── Origin: Gemini agent (systematic TypeScript cleanup task)
├── Full Report: BHM-v.2-Gemini/Project_Knowledge/Bug_Reports/Critical/2025-09-25_typescript-compilation-errors.md
├── Fixed By: Gemini (TypeScript specialist)
├── Cross-Ref: Multiple agents reference this fix
└── Result: Production build enabled, all agents can proceed

BUG-002: Puppeteer MCP Integration
├── Origin: Claude agent (testing infrastructure setup)
├── Full Report: BHM-v.2-Gemini/Project_Knowledge/Bug_Reports/High/2025-09-25_puppeteer-mcp-setup.md
├── Fixed By: Claude + Gemini (collaborative)
├── Cross-Ref: Testing results shared across agents
└── Result: Automated testing fully operational
```

---

## 📊 **TRACKING INTEGRATION**

Both `bug-tracking-index.md` files should include cross-worktree bugs:

```markdown
### Cross-Worktree Fixes (Fixed by Other AI)

| ID      | Origin | Fixed By | Date       | Description                                         | Cross-Ref                                                         |
| ------- | ------ | -------- | ---------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| BUG-006 | Gemini | Gemini   | 2025-09-25 | TypeScript Compilation Errors (Conservation Module) | Cross_References/2025-09-25_gemini-typescript-conservation-006.md |
| BUG-001 | Cursor | Claude   | 2025-01-22 | TypeScript User import                              | Cross_References/2025-01-22_cursor-bug-001.md                     |
```

---

**🎯 Goal:** Complete visibility of all bug activity across both worktrees while maintaining clear ownership and detailed documentation.
