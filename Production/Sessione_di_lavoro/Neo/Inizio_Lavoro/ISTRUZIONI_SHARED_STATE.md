# 📋 ISTRUZIONI: SHARED_STATE.json

> **For**: ALL agents
> **When**: Before AND after every verification
> **Rule**: NO exceptions

---

## 🎯 WHEN TO UPDATE

### Before Verification:
1. Read current state
2. Check if already done
3. Add lock (IN_PROGRESS entry)

### After Verification:
1. Remove lock
2. Add result
3. Request confirmation (if first verifier)

### If Discrepancy:
1. Add to discrepancies array
2. Start investigation

---

## 📝 STEP-BY-STEP GUIDE

### STEP 1: Read Current State
```bash
Read: Production/Last_Info/Multi agent/SHARED_STATE.json
```

**Check**:
- `verified_components` → Is it already DOUBLE_VERIFIED?
- `verifications_in_progress` → Is someone else verifying?
- `discrepancies` → Any ongoing investigations?

---

### STEP 2: Add Lock (If Proceeding)
```json
Edit: SHARED_STATE.json

// Add to "verifications_in_progress":
{
  "agent": "Agente_X",
  "target": "RememberMeService",
  "file": "src/services/auth/__tests__/RememberMeService.test.ts",
  "started": "2025-10-24T10:30:00Z",
  "status": "IN_PROGRESS",
  "planning_ref": "Production/Planning/auth_services.md"
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
git commit -m "lock: Agente_X verifying RememberMeService"
```

---

### STEP 3: Execute Tests
```bash
# Get command from FILE_PATH_REGISTRY.md
npm test -- src/services/auth/__tests__/RememberMeService.test.ts

# Read COMPLETE output
```

---

### STEP 4: Record Result
```json
Edit: SHARED_STATE.json

// Remove from "verifications_in_progress":
"verifications_in_progress": []

// Add to "verified_components":
"RememberMeService": {
  "status": "VERIFIED",
  "result": "15/15 passed (100%)",
  "file_path": "src/services/auth/__tests__/RememberMeService.test.ts",
  "command": "npm test -- RememberMeService.test.ts",
  "output_summary": "All tests passed",
  "verified_by": ["Agente_X"],
  "git_commit": "a1b2c3d4",
  "timestamp": "2025-10-24T10:35:00Z",
  "needs_confirmation": true,
  "awaiting_agent": "Agente_9",
  "planning_reference": "Production/Planning/auth_services.md",
  "user_decision_reference": "User requested Remember Me functionality"
}
```

**Commit**:
```bash
git add SHARED_STATE.json
git commit -m "verify: Agente_X - RememberMeService - 15/15 passed"
```

---

### STEP 5a: Confirmation (Agente_9)

**When tagged for confirmation**:
```bash
# Read component entry from SHARED_STATE.json
# Get file_path and command
# Execute SAME test with SAME command

npm test -- RememberMeService.test.ts
```

**If Results Match**:
```json
Edit: SHARED_STATE.json

// Update component:
"RememberMeService": {
  "status": "DOUBLE_VERIFIED",
  "verified_by": ["Agente_X", "Agente_9"],
  "timestamp_confirmed": "2025-10-24T10:40:00Z",
  "needs_confirmation": false
}
```

**If Results Don't Match**:
```json
// Add to "discrepancies":
{
  "id": "DISC_001",
  "component": "RememberMeService",
  "agent_A": "Agente_X",
  "result_A": "15/15 passed",
  "agent_B": "Agente_9",
  "result_B": "12/15 passed",
  "timestamp": "2025-10-24T10:40:00Z",
  "status": "INVESTIGATING"
}
```

---

## ✅ VALIDATION CHECKLIST

Before committing SHARED_STATE.json:
- [ ] JSON is valid (no syntax errors)
- [ ] Timestamp format: "YYYY-MM-DDTHH:MM:SSZ"
- [ ] File path from FILE_PATH_REGISTRY.md
- [ ] Git commit hash present
- [ ] Status is: VERIFIED, DOUBLE_VERIFIED, or FAILED
- [ ] Planning reference included
- [ ] User decision reference included

---

## 🚨 COMMON CASES

### Case 1: Component Not Yet Verified
```json
"verifications_in_progress": [],
"verified_components": {}
// Proceed as first verifier
```

### Case 2: Component VERIFIED (Needs Confirmation)
```json
"RememberMeService": {
  "status": "VERIFIED",
  "needs_confirmation": true,
  "awaiting_agent": "Agente_9"
}
// If you're Agente_9: Confirm
// If you're other agent: Skip (already done)
```

### Case 3: Component DOUBLE_VERIFIED
```json
"RememberMeService": {
  "status": "DOUBLE_VERIFIED",
  "needs_confirmation": false
}
// Skip: Already fully verified
```

### Case 4: Someone Else Verifying
```json
"verifications_in_progress": [
  {
    "agent": "Agente_0",
    "target": "RememberMeService",
    "started": "2025-10-24T10:30:00Z"
  }
]
// Wait 3 minutes, then re-check
// If still in progress after 3 min: Proceed (assume timeout)
```

---

## 🔗 PLANNING ALIGNMENT

### Link Verifications to Planning

**Every entry MUST include**:
- `planning_reference`: File that requires this verification
- `user_decision_reference`: What user decided that this implements

**Example**:
```json
"LoginPage": {
  "planning_reference": "Production/Planning/LOGIN_FLOW_PLAN.md requires: functional, validation, accessibility tests",
  "user_decision_reference": "User decided: Login with Remember Me + Social OAuth"
}
```

**Rule**: If planning says test A, B, C → You MUST test A, B, C. Not just A.

---

## 📊 EXAMPLE WORKFLOW

### Time 10:00 - Agente_0 Starts
```json
{
  "verifications_in_progress": [
    {
      "agent": "Agente_0",
      "target": "RememberMeService",
      "started": "2025-10-24T10:00:00Z"
    }
  ],
  "verified_components": {}
}
```

### Time 10:05 - Agente_0 Completes
```json
{
  "verifications_in_progress": [],
  "verified_components": {
    "RememberMeService": {
      "status": "VERIFIED",
      "result": "15/15 passed",
      "verified_by": ["Agente_0"],
      "needs_confirmation": true,
      "awaiting_agent": "Agente_9"
    }
  }
}
```

### Time 10:10 - Agente_9 Confirms
```json
{
  "verified_components": {
    "RememberMeService": {
      "status": "DOUBLE_VERIFIED",
      "result": "15/15 passed",
      "verified_by": ["Agente_0", "Agente_9"],
      "needs_confirmation": false
    }
  }
}
```

---

## 🚫 DON'T DO THIS

❌ Edit without reading current state
❌ Skip lock step
❌ Use vague component names
❌ Forget planning reference
❌ Skip confirmation request
❌ Mark DOUBLE_VERIFIED without second agent

## ✅ DO THIS

✅ Read state before every action
✅ Add lock when starting
✅ Use exact names from FILE_PATH_REGISTRY
✅ Include planning + user decision references
✅ Request confirmation from Agente_9
✅ Wait for double-verification before approving

---

**Last Updated**: 2025-10-24
**Mandatory for**: ALL agents
