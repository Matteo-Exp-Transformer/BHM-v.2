# 🎯 PROMPT PER AGENTE 2 - ORGANIZZAZIONE MULTI-AGENT CORRETTA

**Data**: 2025-10-23  
**Sessione**: Estensione Onboarding Blindatura (Step 2-7)  
**Metodologia**: Mappatura sistematica completa da zero  
**Obiettivo**: Creare 2 file di mappatura completa per Knowledge Base  

---

## 📋 **MISSIONE AGENTE 2**

**Obiettivo**: Organizzare lavoro multi-agent per completare blindatura Onboarding Step 2-7 e creare 2 file di mappatura completa per Knowledge Base.

**Metodologia**: Solo dati reali verificati attivamente nelle funzioni, nessuna assunzione.

---

## 🎯 **DIVISIONE LAVORO MULTI-AGENT CORRETTA**

### 🔍 **AGENTE 2A - LOGIN FLOW MAPPING**
**Responsabilità**:
- 🎯 Mappare Step 2-4 Onboarding (DepartmentsStep, StaffStep, ConservationStep)
- 🎯 Verificare tutti i dati reali nelle funzioni
- 🎯 Creare test perfettamente allineati
- 🎯 Documentare compliance HACCP

**Deliverables**:
- Mappatura completa Step 2-4
- Test coverage 100% per ogni step
- Contributo al file di mappatura completa

### 🗺️ **AGENTE 2B - ONBOARDING MAPPING**
**Responsabilità**:
- 🎯 Mappare Step 5-7 Onboarding (TasksStep, InventoryStep, CalendarConfigStep)
- 🎯 Verificare tutti i dati reali nelle funzioni
- 🎯 Creare test perfettamente allineati
- 🎯 Documentare compliance HACCP

**Deliverables**:
- Mappatura completa Step 5-7
- Test coverage 100% per ogni step
- Contributo al file di mappatura completa

---

## 📊 **PIANO MAPPATURA SISTEMATICA**

### **FASE 1: ANALISI PRELIMINARE** (Entrambi Agenti)
**Obiettivo**: Identificare tutti i file da mappare

**AGENTE 2A - Step 2-4**:
- Step 2: `src/components/onboarding-steps/DepartmentsStep.tsx`
- Step 3: `src/components/onboarding-steps/StaffStep.tsx`
- Step 4: `src/components/onboarding-steps/ConservationStep.tsx`

**AGENTE 2B - Step 5-7**:
- Step 5: `src/components/onboarding-steps/TasksStep.tsx`
- Step 6: `src/components/onboarding-steps/InventoryStep.tsx`
- Step 7: `src/components/onboarding-steps/CalendarConfigStep.tsx`

### **FASE 2: MAPPATURA STEP-BY-STEP** (Entrambi Agenti)
**Obiettivo**: Mappare ogni step assegnato con dati reali verificati

**Per ogni step**:
- File: `src/components/onboarding-steps/[StepName].tsx`
- Verifica: Tutti i campi, validazioni, dipendenze
- Test: Coverage 100%

### **FASE 3: CREAZIONE FILE MAPPATURA COMPLETA** (Entrambi Agenti)
**Obiettivo**: Compilare i 2 file di mappatura completa per Knowledge Base

**File 1**: `Production/Knowledge/AUTENTICAZIONE/LOGIN_FLOW_MAPPING_COMPLETE.md`
- Contenuto: Tutto il lavoro di blindatura Login Flow della sessione di oggi
- Incluso: Step 1 (CompanyStep) già completato
- Incluso: Tutti i test Login Flow (28/28)

**File 2**: `Production/Knowledge/ONBOARDING/ONBOARDING_FLOW_MAPPING_COMPLETE.md`
- Contenuto: Tutto il lavoro di blindatura Onboarding Flow della sessione di oggi
- Incluso: Step 1 (CompanyStep) già completato
- Incluso: Step 2-7 mappati da Agente 2A + 2B
- Incluso: Tutti i test Onboarding Flow

---

## 🔍 **METODOLOGIA MAPPATURA DA ZERO**

### **1. ANALISI FILE REALE**
**Per ogni file da mappare**:
```bash
# 1. Leggere file completo
cat src/components/onboarding-steps/[StepName].tsx

# 2. Identificare tutti i campi
grep -n "input\|select\|textarea\|button" [StepName].tsx

# 3. Verificare validazioni
grep -n "validate\|schema\|required" [StepName].tsx

# 4. Analizzare dipendenze
grep -n "import\|useEffect\|useState" [StepName].tsx
```

### **2. VERIFICA DATI REALI**
**Per ogni campo identificato**:
- ✅ **Nome campo**: Verificare nel DOM
- ✅ **Tipo input**: text, select, textarea, checkbox
- ✅ **Validazioni**: required, min/max, pattern
- ✅ **Dipendenze**: altri campi, API calls
- ✅ **Compliance**: HACCP requirements

### **3. CREAZIONE TEST**
**Per ogni step**:
```javascript
// Template test per step
test('Step X - [NomeStep] - Mappatura completa', async ({ page }) => {
  // 1. Navigare allo step
  await page.goto('/onboarding')
  await page.click('[data-testid="step-X"]')
  
  // 2. Verificare tutti i campi presenti
  await expect(page.locator('[name="campo1"]')).toBeVisible()
  await expect(page.locator('[name="campo2"]')).toBeVisible()
  
  // 3. Testare validazioni
  await page.fill('[name="campo1"]', '')
  await page.click('[type="submit"]')
  await expect(page.locator('.error')).toBeVisible()
  
  // 4. Testare compilazione completa
  await page.fill('[name="campo1"]', 'valore1')
  await page.fill('[name="campo2"]', 'valore2')
  await page.click('[type="submit"]')
  await expect(page.locator('.success')).toBeVisible()
})
```

---

## 📁 **STRUTTURA FILE OUTPUT**

### **AGENTE 2A - Step 2-4**
```
Production/Sessione_di_lavoro/Agente_2/2025-10-23/Estensione_Onboarding/
├── Step2_DepartmentsStep/
│   ├── mappatura-completa.md
│   ├── test-coverage-100.spec.js
│   └── compliance-haccp.md
├── Step3_StaffStep/
│   ├── mappatura-completa.md
│   ├── test-coverage-100.spec.js
│   └── compliance-haccp.md
└── Step4_ConservationStep/
    ├── mappatura-completa.md
    ├── test-coverage-100.spec.js
    └── compliance-haccp.md
```

### **AGENTE 2B - Step 5-7**
```
Production/Sessione_di_lavoro/Agente_2/2025-10-23/Estensione_Onboarding/
├── Step5_TasksStep/
│   ├── mappatura-completa.md
│   ├── test-coverage-100.spec.js
│   └── compliance-haccp.md
├── Step6_InventoryStep/
│   ├── mappatura-completa.md
│   ├── test-coverage-100.spec.js
│   └── compliance-haccp.md
└── Step7_CalendarConfigStep/
    ├── mappatura-completa.md
    ├── test-coverage-100.spec.js
    └── compliance-haccp.md
```

### **FILE MAPPATURA COMPLETA** (Entrambi Agenti)
```
Production/Knowledge/
├── AUTENTICAZIONE/
│   └── LOGIN_FLOW_MAPPING_COMPLETE.md
└── ONBOARDING/
    └── ONBOARDING_FLOW_MAPPING_COMPLETE.md
```

---

## 🎯 **CONTENUTO FILE MAPPATURA COMPLETA**

### **LOGIN_FLOW_MAPPING_COMPLETE.md**
```markdown
# 🔐 LOGIN FLOW MAPPING COMPLETE

## 📊 PANORAMICA
- **Step**: Login Flow P0
- **Componenti**: 5 componenti critici
- **Test Coverage**: 100% (28/28 test)
- **Status**: ✅ COMPLETAMENTE BLINDATO

## 🔍 COMPONENTI MAPPATI
1. Password Policy
2. CSRF Protection
3. Rate Limiting
4. Remember Me
5. Multi-Company

## 📋 DETTAGLI TECNICI
[Include tutti i dettagli della sessione precedente]
```

### **ONBOARDING_FLOW_MAPPING_COMPLETE.md**
```markdown
# 🚀 ONBOARDING FLOW MAPPING COMPLETE

## 📊 PANORAMICA
- **Step**: Onboarding P0 (Step 1-7)
- **Componenti**: 7 step completi
- **Test Coverage**: 100% (Tutti i test)
- **Status**: ✅ COMPLETAMENTE BLINDATO

## 🔍 STEP MAPPATI
1. CompanyStep (BusinessInfoStep) - ✅ Completato
2. DepartmentsStep - 🔄 Da mappare (Agente 2A)
3. StaffStep - 🔄 Da mappare (Agente 2A)
4. ConservationStep - 🔄 Da mappare (Agente 2A)
5. TasksStep - 🔄 Da mappare (Agente 2B)
6. InventoryStep - 🔄 Da mappare (Agente 2B)
7. CalendarConfigStep - 🔄 Da mappare (Agente 2B)

## 📋 DETTAGLI TECNICI
[Include tutti i dettagli della mappatura completa]
```

---

## 🚀 **AVVIO SESSIONE**

### **AGENTE 2A**
1. Leggere questo prompt completamente
2. Verificare file Step 2-4 esistenti
3. Iniziare mappatura sistematica
4. Creare test coverage 100%

### **AGENTE 2B**
1. Leggere questo prompt completamente
2. Verificare file Step 5-7 esistenti
3. Iniziare mappatura sistematica
4. Creare test coverage 100%

---

**Status**: 🟡 **READY FOR EXTENSION SESSION**  
**Prossimo**: Avvio mappatura sistematica Step 2-7  
**Firma**: Agente 2 - Systems Blueprint Architect  
**Data**: 2025-10-23
