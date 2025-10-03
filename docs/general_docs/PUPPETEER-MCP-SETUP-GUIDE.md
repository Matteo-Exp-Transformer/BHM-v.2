# 🤖 PUPPETEER MCP SETUP & TESTING GUIDE

**Version:** 1.0
**Created:** September 25, 2025
**Purpose:** Complete setup guide for Puppeteer MCP testing tools
**Priority:** HIGH - After TypeScript fixes

---

## 🎯 **CURRENT STATUS**

### **✅ COMPLETED:**

- Puppeteer MCP server configured in `claude_desktop_config.json`
- Test script created: `test-script-haccp-app.js`
- App running on http://localhost:3002

### **🔄 PENDING:**

- Claude Code restart required to load MCP tools
- Puppeteer MCP tools verification
- Automated testing execution

---

## 📋 **PUPPETEER MCP CONFIGURATION**

### **Current Config Location:**

`C:\Users\matte.MIO\.config\claude\claude_desktop_config.json`

### **Configuration Details:**

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@executeautomation/puppeteer-mcp-server"],
      "env": {
        "PUPPETEER_HEADLESS": "true",
        "PUPPETEER_ARGS": "--no-sandbox,--disable-setuid-sandbox"
      }
    }
  }
}
```

### **Expected MCP Tools After Restart:**

When Claude Code restarts, these tools should be available:

- `mcp__puppeteer_navigate` - Navigate to pages
- `mcp__puppeteer_click` - Click elements
- `mcp__puppeteer_type` - Type in inputs
- `mcp__puppeteer_screenshot` - Take screenshots
- `mcp__puppeteer_evaluate` - Execute JavaScript
- `mcp__puppeteer_wait` - Wait for elements

---

## 🔧 **SETUP VERIFICATION STEPS**

### **Step 1: Restart Claude Code**

**CRITICAL:** Claude Code must be completely restarted to load MCP servers

### **Step 2: Verify MCP Tools Available**

After restart, check if Puppeteer tools are listed in available functions

### **Step 3: Test Basic Functionality**

```bash
# Verify app is running
curl -s http://localhost:3002 | head -5
# Should return HTML content
```

### **Step 4: Run Test Commands**

Try these basic tests with Puppeteer MCP:

1. Navigate to http://localhost:3002
2. Take screenshot of homepage
3. Test login form interaction
4. Verify HACCP pages load

---

## 🧪 **COMPREHENSIVE TEST EXECUTION PLAN**

### **Phase 1: Authentication Testing**

```javascript
// Test Cases A1-A2 from testing guide
1. Navigate to http://localhost:3002
2. Verify redirect to login
3. Test authentication flow
4. Verify role-based access
```

### **Phase 2: Core HACCP Features**

```javascript
// Test Cases C1-C2 (CRITICAL)
1. Navigate to /conservazione
2. Test temperature monitoring
3. Verify conservation points
4. Test maintenance tasks
```

### **Phase 3: Calendar & Inventory**

```javascript
// Test Cases CAL1, I1
1. Navigate to /attivita
2. Test calendar functionality
3. Navigate to /inventario
4. Test inventory management
```

### **Phase 4: Mobile & PWA**

```javascript
// Test Cases M1, P1
1. Test mobile responsiveness
2. Verify PWA installation
3. Test offline capabilities
4. Validate service worker
```

---

## 📊 **AUTOMATED TEST SCRIPT UPDATES**

### **Fix ES Module Issues:**

The current `test-script-haccp-app.js` has ES module conflicts. Need to:

1. **Convert to ES modules:**

```javascript
// Replace require with import
import { testSuite } from './test-helpers.js'

// Or convert to CommonJS
// Rename to test-script-haccp-app.cjs
```

2. **Update package.json scripts:**

```json
{
  "scripts": {
    "test:haccp": "node test-script-haccp-app.cjs",
    "test:puppeteer": "node --experimental-modules test-script-haccp-app.js"
  }
}
```

---

## 🎯 **TESTING SUCCESS CRITERIA**

### **Automated Testing Targets:**

- [ ] **Authentication:** 100% login/logout flow working
- [ ] **HACCP Core:** 100% conservation monitoring functional
- [ ] **Calendar:** 100% event management working
- [ ] **Inventory:** 100% product management working
- [ ] **Mobile:** 100% responsive design validated
- [ ] **PWA:** 100% installation and offline features

### **Performance Targets:**

- [ ] **Page Load:** < 3 seconds
- [ ] **Navigation:** < 1 second
- [ ] **Form Submit:** < 2 seconds
- [ ] **Data Load:** < 2 seconds

### **Error Tolerance:**

- [ ] **Console Errors:** 0 critical errors
- [ ] **Network Errors:** 0 failed requests
- [ ] **UI Errors:** 0 visual glitches
- [ ] **Functionality:** 100% features working

---

## 📝 **BUG REPORT & PROJECT KNOWLEDGE UPDATES**

### **CRITICAL: Update Project Documentation**

After each test cycle, MUST update these files:

#### **Bug Reports Directory:**

`Project_Knowledge/Bug_Reports/`

**Files to Update:**

1. **`Project_Knowledge/Bug_Reports/README.md`**
   - Document any bugs found during testing
   - Include screenshots and steps to reproduce

2. **`Project_Knowledge/Bug_Reports/Cross_References/README.md`**
   - Cross-reference bugs with TypeScript fixes
   - Link issues to specific components

3. **`Project_Knowledge/Bug_Reports/Istruzioni_Debug_Agente/README.md`**
   - Update debugging instructions based on findings
   - Add specific Puppeteer testing procedures

#### **Testing Guidelines:**

`Project_Knowledge/Testing_Guidelines/`

**Files to Update:**

1. **`BUG-REPORT-GUIDE.md`**
   - Include Puppeteer testing results
   - Update with automation findings

#### **Report Template:**

```markdown
# Bug Report - [Component Name]

**Date:** [Current Date]
**Tester:** Gemini/Puppeteer MCP
**Priority:** [Critical/High/Medium/Low]

## Issue Description

[Detailed description]

## Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Result

[What should happen]

## Actual Result

[What actually happened]

## Screenshots

[Puppeteer screenshots]

## Technical Details

- Browser: Puppeteer/Chromium
- App URL: http://localhost:3002
- TypeScript Status: [Fixed/Pending]

## Fix Status

- [ ] Identified
- [ ] In Progress
- [ ] Fixed
- [ ] Verified
```

---

## 🚀 **EXECUTION TIMELINE**

### **Day 1: Setup & Basic Testing**

1. **Fix TypeScript errors** (PREREQUISITE)
2. **Restart Claude Code** (Load MCP tools)
3. **Verify Puppeteer MCP** working
4. **Run basic navigation tests**

### **Day 2: Comprehensive Testing**

1. **Authentication flow testing**
2. **HACCP core functionality testing**
3. **Calendar and inventory testing**
4. **Document all findings**

### **Day 3: Advanced Testing**

1. **Mobile responsiveness testing**
2. **PWA functionality testing**
3. **Performance benchmarking**
4. **Final bug report compilation**

---

## ⚠️ **TROUBLESHOOTING**

### **If MCP Tools Don't Load:**

1. Check Claude Code is completely restarted
2. Verify config file JSON syntax
3. Check NPX can access the package:
   ```bash
   npx @executeautomation/puppeteer-mcp-server --help
   ```

### **If Tests Fail:**

1. Ensure app is running on http://localhost:3002
2. Check TypeScript errors are fixed
3. Verify no console errors in browser
4. Check Puppeteer can access localhost

### **If Performance Issues:**

1. Run tests with headless mode
2. Check system resources
3. Monitor network requests
4. Profile JavaScript execution

---

## 📞 **SUPPORT RESOURCES**

### **Key Files:**

- `test-script-haccp-app.js` - Main test script
- `TYPESCRIPT-ERROR-FIXING-GUIDE.md` - Fix guide
- `HACCP-APP-TESTING-GUIDE.md` - Manual testing guide

### **Commands:**

```bash
# Check app status
curl -s http://localhost:3002 | head -5

# Verify TypeScript
npm run type-check

# Run development server
npm run dev

# Build production
npm run build
```

---

**🎯 PRIORITY:** Complete TypeScript fixes FIRST, then execute this guide
**⏰ TARGET:** Full test automation within 24 hours
**🚦 STATUS:** Ready for execution after TypeScript cleanup

---

---

## 📝 **CRITICAL: CATALOGAZIONE PROJECT_KNOWLEDGE**

### **Dopo Ogni Test Cycle, DEVI Aggiornare:**

#### **1. Bug Reports per Test Failures:**

```bash
# Location
Project_Knowledge/Bug_Reports/[Severity]/2025-09-25_puppeteer-test-[feature].md

# Per ogni bug trovato durante testing:
- Descrizione dettagliata del problema
- Steps to reproduce con Puppeteer commands
- Screenshots automatici allegati
- Expected vs Actual results
- Fix status e ownership (Gemini/Claude/Cursor)
```

#### **2. Cross References per Collaboration:**

```bash
# Location
Project_Knowledge/Bug_Reports/Cross_References/2025-09-25_puppeteer-findings.md

# Content:
- Lista tutti i test results
- Bug assignments agli AI agents appropriati
- Coordination notes per parallel fixing
- Testing progress tracking
```

#### **3. Testing Guidelines Updates:**

```bash
# Location
Project_Knowledge/Testing_Guidelines/BUG-REPORT-GUIDE.md

# Action:
- Aggiorna con Puppeteer testing procedures
- Include automated testing templates
- Document regression test patterns
- Add performance benchmarking results
```

#### **4. Bug Tracking Index:**

```bash
# Location
Project_Knowledge/Bug_Reports/bug-tracking-index.md

# For each test session:
- Update bug counts by severity
- Track resolution progress
- Record testing coverage percentages
- Document agent assignments
```

### **Template per Test Reports:**

```markdown
# 🧪 Puppeteer Test Report: [Feature Name]

**Agent:** Gemini
**Test Date:** 2025-09-25
**Test URL:** http://localhost:3002/[feature]
**Test Result:** ✅ Pass / ❌ Fail / ⚠️ Partial
**Performance:** [Load time / Response time]
**Bugs Found:** [Count]
**Critical Issues:** [List]
**Assigned To:** [Gemini/Claude/Cursor]
**Next Action:** [Specific fix instructions]
```

### **Workflow Completo:**

1. **Run Puppeteer Tests** → Document results
2. **Create Bug Reports** → For each failure found
3. **Update Cross References** → Coordinate with other agents
4. **Update Tracking Index** → Maintain project overview
5. **Commit Documentation** → With test results and bug reports

---

**✅ SUCCESS = All HACCP features validated + Complete Project_Knowledge documentation**
