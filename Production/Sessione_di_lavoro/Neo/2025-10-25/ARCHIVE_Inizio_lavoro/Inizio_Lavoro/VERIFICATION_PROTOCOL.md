# 🔍 VERIFICATION PROTOCOL

> **Purpose**: Standard verification process for ALL agents
> **Rule**: NO exceptions - everyone follows this protocol

---

## 📋 PRE-VERIFICATION CHECKLIST

Before ANY verification:
- [ ] Read `SHARED_STATE.json` (check current state)
- [ ] Read `FILE_PATH_REGISTRY.md` (get official path)
- [ ] Read `CENTRAL_VERIFICATION_LOG.md` (check if already done)
- [ ] Check `verifications_in_progress` (avoid conflicts)
- [ ] Identify planning file that requires this verification
- [ ] Identify user decision this implements

---

## 🔄 VERIFICATION PROCESS (5 STEPS)

### STEP 1: Check Existing State (1 min)

```bash
# Read current state
Read: Production/Last_Info/Multi agent/SHARED_STATE.json
```

**Check**:
- Is component already DOUBLE_VERIFIED? → Skip, use existing result
- Is component VERIFIED (needs confirmation)? → Proceed as confirmation agent
- Is verification IN_PROGRESS by another agent? → Wait 3 minutes, re-check
- Is component not verified yet? → Proceed as first verifier

---

### STEP 2: Acquire Lock (30 sec)

```json
// Edit SHARED_STATE.json
// Add to "verifications_in_progress":

{
  "agent": "Agente_X",
  "target": "ComponentName",
  "file": "path/from/FILE_PATH_REGISTRY.md",
  "started": "2025-10-24T10:30:00Z",
  "status": "IN_PROGRESS",
  "planning_ref": "path/to/planning/file.md"
}

// Update metadata:
"_metadata": {
  "last_updated": "2025-10-24T10:30:00Z",
  "last_updated_by": "Agente_X"
}
```

**Commit**:
```bash
git add SHARED_STATE.json
git commit -m "lock: Agente_X verifying ComponentName"
git push
```

---

### STEP 3: Execute Verification (5-10 min)

**Get Official Command**:
```bash
# From FILE_PATH_REGISTRY.md
COMMAND=$(grep -A 3 "ComponentName" FILE_PATH_REGISTRY.md | grep "COMMAND")
```

**Execute**:
```bash
# Use EXACT command from registry
npm test -- Production/Test/Area/Component/

# Read COMPLETE output (not just summary)
# Count: X passed, Y failed, Z total
# Note: Any errors, warnings, timeouts
```

**If Using CRITICAL_VERIFICATION Skill**:
```bash
# For complex verifications
Use skill: CRITICAL_VERIFICATION
Provides: Verification report with all details
```

---

### STEP 4: Record Result (2 min)

```json
// Edit SHARED_STATE.json

// Remove from "verifications_in_progress"
"verifications_in_progress": []

// Add to "verified_components":
"ComponentName": {
  "status": "VERIFIED",
  "result": "15/15 passed (100%)",
  "file_path": "path/from/FILE_PATH_REGISTRY.md",
  "command": "npm test -- path/to/test.js",
  "output_summary": "All tests passed, no warnings",
  "verified_by": ["Agente_X"],
  "git_commit": "a1b2c3d4",
  "timestamp": "2025-10-24T10:35:00Z",
  "needs_confirmation": true,
  "awaiting_agent": "Agente_9",
  "planning_reference": "Production/Planning/feature_X.md",
  "user_decision_reference": "Production/Sessione_di_lavoro/User/decisions.md"
}
```

**Write to Central Log**:
```bash
Edit: Production/Last_Info/Multi agent/CENTRAL_VERIFICATION_LOG.md

# Append entry with timestamp, agent, result, file path
```

**Commit**:
```bash
git add SHARED_STATE.json CENTRAL_VERIFICATION_LOG.md
git commit -m "verify: Agente_X - ComponentName - 15/15 passed (100%)"
git push
```

---

### STEP 5: Request Confirmation (30 sec)

**If First Verifier**:
```markdown
# In your report, add:

## ⚠️ NEEDS CONFIRMATION
**Component**: ComponentName
**Result**: 15/15 passed (100%)
**Awaiting**: @Agente_9 please confirm with same file path and command
**File Path**: path/from/registry
**Command**: exact command here
```

**If Confirmation Agent (Agente_9)**:
```bash
# MUST use EXACT same file path and command
# Execute verification
# If match → Update to DOUBLE_VERIFIED
# If mismatch → Add to discrepancies
```

---

## 🎯 ALIGNMENT WITH PLANNING

### Link to Planning Files

**Every verification MUST reference**:
1. **User Decision File**: What user requested
2. **Planning File**: How team planned to implement
3. **Test Coverage**: ALL tests required by planning

**Example**:
```json
"ComponentName": {
  "user_decision_reference": "User wants X feature with Y behavior",
  "planning_reference": "Planning/FEATURE_X_PLAN.md says test A, B, C",
  "tests_executed": ["test_A", "test_B", "test_C"],
  "tests_coverage": "3/3 required tests executed (100%)"
}
```

**Rule**: If planning says "test A, B, C, D" but you only test A, B → Incomplete verification

---

## 🚨 DISCREPANCY PROTOCOL

### If Results Don't Match

**Agente_0 says**: 1/1 passed
**Agente_9 says**: 0/1 failed

**Action**:
```json
// Add to "discrepancies" in SHARED_STATE.json:

{
  "id": "DISC_001",
  "component": "ComponentName",
  "agent_A": {
    "name": "Agente_0",
    "result": "1/1 passed",
    "file_path": "path/A",
    "command": "command_A",
    "timestamp": "2025-10-24T10:00:00Z"
  },
  "agent_B": {
    "name": "Agente_9",
    "result": "0/1 failed",
    "file_path": "path/B",
    "command": "command_B",
    "timestamp": "2025-10-24T10:05:00Z"
  },
  "status": "INVESTIGATING",
  "investigation_steps": [
    "Compare file paths: A vs B",
    "Compare commands: command_A vs command_B",
    "Compare git commits",
    "Check cache/environment"
  ]
}
```

**Investigation**:
1. Compare file paths (different files?)
2. Compare commands (different test runners?)
3. Compare git commits (code changed between verifications?)
4. Compare timestamps (>5 min apart = possible code change)
5. Check cache (clear and re-run)

**Resolution**:
- Root cause identified
- Fix applied
- Both agents re-verify with SAME file + SAME command + SAME commit
- Results match → Mark RESOLVED
- Results still different → Escalate to Neo (Agente 0)

---

## ⏱️ TIMEOUT POLICY

### Lock Timeout: 3 Minutes

**If verification IN_PROGRESS >3 min**:
- Assume timeout/crash
- Proceed with verification
- Document in log: "Proceeded after timeout of Agente_X"

---

## 📊 COVERAGE REQUIREMENTS

### Align with Planning Files

**Planning says**: "Test LoginPage: functional, validation, accessibility, edge cases"

**Your verification MUST**:
```bash
# Execute ALL test types mentioned in planning
npm test -- Production/Test/LoginPage/test-funzionale.spec.js
npm test -- Production/Test/LoginPage/test-validazione.spec.js
npm test -- Production/Test/LoginPage/test-accessibility.spec.js
npm test -- Production/Test/LoginPage/test-edge-cases.spec.js

# Report coverage of planning requirements:
"planning_coverage": {
  "required_tests": ["functional", "validation", "accessibility", "edge-cases"],
  "executed_tests": ["functional", "validation", "accessibility", "edge-cases"],
  "coverage": "4/4 (100%)"
}
```

**Rule**: If planning requires 4 test types, verify ALL 4. Not just 1 or 2.

---

## ✅ COMPLETION CRITERIA

### VERIFIED (First Agent)
- [ ] Tests executed with official path
- [ ] Results recorded in SHARED_STATE.json
- [ ] Entry in CENTRAL_VERIFICATION_LOG.md
- [ ] Planning reference included
- [ ] User decision reference included
- [ ] Confirmation requested from Agente_9

### DOUBLE_VERIFIED (Confirmed)
- [ ] Second agent (Agente_9) executed same tests
- [ ] Same file path used
- [ ] Same command used
- [ ] Results match first agent
- [ ] Status updated to DOUBLE_VERIFIED
- [ ] No discrepancies

### FAILED
- [ ] Failed tests documented (name, error, path, line)
- [ ] Root cause identified
- [ ] Priority assigned (P0/P1/P2/P3)
- [ ] Fix estimate provided
- [ ] Status: FAILED in SHARED_STATE.json

---

## 📝 REPORT TEMPLATE

```markdown
# 🔍 VERIFICATION: ComponentName

**Agent**: Agente_X
**Date**: 2025-10-24 10:30:00
**Status**: VERIFIED | DOUBLE_VERIFIED | FAILED

---

## 📋 VERIFICATION CONTEXT

**File Path**: path/from/FILE_PATH_REGISTRY.md
**Command**: npm test -- path/to/test.js
**Git Commit**: a1b2c3d4
**Branch**: NoClerk

**Planning Reference**: Production/Planning/feature_X.md
**User Decision**: User requested X with behavior Y
**Required Tests**: [List from planning]

---

## ✅ RESULTS

**Tests Executed**: 15/15
**Passed**: 15 (100%)
**Failed**: 0
**Coverage**: 95.2%

**Output Summary**: All tests passed, no warnings

---

## 📊 PLANNING ALIGNMENT

**Required by Planning**: Test A, B, C
**Executed**: Test A ✅, Test B ✅, Test C ✅
**Coverage**: 3/3 (100%)

---

## 🎯 NEXT STEPS

**Needs Confirmation**: @Agente_9
**File Path**: Same as above
**Command**: Same as above
**Expected**: Same result (15/15 passed)
```

---

## 🚫 COMMON MISTAKES

### ❌ DON'T:
- Verify without checking SHARED_STATE.json
- Use vague component names ("Step 2" instead of "BusinessInfoStep")
- Use path not in FILE_PATH_REGISTRY
- Skip planning reference
- Approve without double-verification
- Report "probably works" without executing tests

### ✅ DO:
- Always check current state first
- Use exact names from FILE_PATH_REGISTRY
- Use official paths only
- Reference planning files
- Wait for double-verification
- Execute ALL tests required by planning
- Report only verified data

---

**Last Updated**: 2025-10-24
**Mandatory for**: ALL agents
**No Exceptions**: This protocol is non-negotiable
