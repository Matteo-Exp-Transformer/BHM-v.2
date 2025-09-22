# 🔗 Cross-References Bug System

**Purpose:** Track bug fixes performed in other worktrees
**Updated:** January 22, 2025

---

## 📋 **SYSTEM OVERVIEW**

### **Ownership Rule:**

- **Full Bug Report** = In the worktree where bug was originally discovered
- **Cross-Reference** = In the other worktree, linking to full report + fix signature

### **File Naming Convention:**

```
YYYY-MM-DD_[origin-worktree]-bug-[ID].md

Examples:
2025-01-22_cursor-bug-001.md    # Bug originated in Cursor, referenced in Claude
2025-01-22_claude-bug-003.md    # Bug originated in Claude, referenced in Cursor
```

---

## 📝 **CROSS-REFERENCE TEMPLATE**

```markdown
# 🔗 Cross-Reference: [Bug Brief Description]

**Bug ID:** BUG-XXX
**Origin Worktree:** Cursor/Claude
**Discovered:** YYYY-MM-DD
**Fixed By:** Claude/Cursor
**Fixed Date:** YYYY-MM-DD
**Status:** Fixed

---

## 📋 Bug Summary

[One-line summary from original report]

## 🔗 Full Report Location

**Full Report:** `../BHM-v.2-[Origin]/Project_Knowledge/Bug_Reports/[Severity]/YYYY-MM-DD_bug-description.md`

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
BUG-001: TypeScript User import missing
├── Origin: Cursor worktree (discovered during Cursor development)
├── Full Report: BHM-v.2-Cursor/Bug_Reports/Critical/2025-01-22_typescript-user-import.md
├── Fixed By: Claude (has TypeScript expertise)
├── Cross-Ref: BHM-v.2-Claude/Bug_Reports/Cross_References/2025-01-22_cursor-bug-001.md
└── Result: Bug fixed, both worktrees have documentation
```

---

## 📊 **TRACKING INTEGRATION**

Both `bug-tracking-index.md` files should include cross-worktree bugs:

```markdown
### Cross-Worktree Fixes (Fixed by Other AI)

| ID      | Origin | Fixed By | Date       | Description            | Cross-Ref                                     |
| ------- | ------ | -------- | ---------- | ---------------------- | --------------------------------------------- |
| BUG-001 | Cursor | Claude   | 2025-01-22 | TypeScript User import | Cross_References/2025-01-22_cursor-bug-001.md |
```

---

**🎯 Goal:** Complete visibility of all bug activity across both worktrees while maintaining clear ownership and detailed documentation.
