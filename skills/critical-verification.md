# 🔍 CRITICAL VERIFICATION - Verifica Rigorosa Codice

> Verifica attivamente codice e claim. Non fidarti mai. Controlla sempre.

---

## 🔑 TRIGGER WORDS

`verifica` • `controlla` • `valida` • `conferma` • `è vero che` • `coverage` • `locked` • `test passati` • `risultati`

---

## ⚠️ MINDSET CRITICO

**NON SEI UN OTTIMISTA - SEI UN CONTROLLORE RIGOROSO**

❌ **MAI**:
- Credere a claim senza verificare
- Assumere che test passino
- Dire "coverage sconosciuto" senza controllare
- Gonfiare numeri
- Accettare "probabilmente" o "dovrebbe"
- Fidarti di vecchia documentazione

✅ **SEMPRE**:
- Verificare con Read/Bash ogni claim
- Eseguire test per confermare coverage
- Controllare file effettivi (non assumere)
- Riportare SOLO dati verificati
- Essere scettico finché non vedi prove
- Correggere false affermazioni

---

## 📋 PROCESSO VERIFICA 5 STEP

### 1. IDENTIFICA CLAIM (1 min)
```
Claim da verificare:
- "X test passano"
- "Component è LOCKED"
- "Coverage è Y%"
- "File esiste in path Z"
```

### 2. VERIFICA FISICA (5-10 min)

#### Per Test:
```bash
# NON dire "coverage sconosciuto"
# ESEGUI i test e verifica

npm test -- path/to/test.spec.js

# Conta test passati vs falliti
# Verifica coverage reale
```

#### Per File LOCKED:
```bash
# NON assumere status
# LEGGI il codice

Read: src/component/Component.tsx

# Cerca markers:
// @locked
// @verified
// commenti lock
```

#### Per Coverage:
```bash
# NON assumere percentuali
# ESEGUI coverage report

npm run test:coverage -- --collectCoverageFrom='path/**'

# Leggi output REALE
```

### 3. CONFRONTA REALTÀ vs CLAIM (2 min)

```markdown
## VERIFICA: [Claim]

**Claim originale**: "23/31 test passano (74%)"

**Verifica eseguita**:
- ✅ Eseguito: npm test LoginPage.spec.js
- ✅ Output salvato

**Realtà verificata**:
- Test passati: 18/31 (58%) ❌ DISCREPANZA
- Test falliti: 13 (timeout, selector issues)
- Coverage reale: 51% ❌ NON 74%

**Conclusione**: ❌ Claim FALSO - Gonfiato del 16%
```

### 4. SEGNALA DISCREPANZE (3 min)

Se trovi discrepanze:

```markdown
## 🚨 DISCREPANZA CRITICA

**Claim**: [claim originale]
**Verificato**: [dati reali]
**Differenza**: [X% gonfiato / Y componenti mancanti]
**Impatto**: [Alto/Medio/Basso]
**Azione richiesta**: [Correggere documentazione / Re-test / Fix code]
```

### 5. REPORT VERIFICATO (5 min)

```markdown
## ✅ REPORT VERIFICATO

Verificato tramite:
- [ ] Esecuzione test diretta
- [ ] Lettura codice sorgente
- [ ] Coverage report
- [ ] File system check

**Dati Verificati**:
- Test passati: X/Y (Z%) ✅ VERIFICATO
- File locked: N componenti ✅ VERIFICATO
- Coverage: X% ✅ VERIFICATO

**Timestamp verifica**: 2025-10-24 HH:MM
**Metodo**: [Bash/Read/Test execution]
**Output salvato**: [path se applicabile]
```

---

## 🎯 CHECKLIST VERIFICA

Prima di accettare qualsiasi claim:

**Verifica Base**:
- [ ] Ho eseguito test IO STESSO?
- [ ] Ho letto il codice sorgente?
- [ ] Ho verificato file system?
- [ ] Ho controllato timestamp?

**Verifica Numeri**:
- [ ] Test count: Eseguiti e contati?
- [ ] Coverage: Report verificato?
- [ ] File count: Glob eseguito?
- [ ] LOC: Contato o stimato da codice reale?

**Verifica Claims**:
- [ ] "LOCKED": Cercato markers nel codice?
- [ ] "Test passano": Eseguiti personalmente?
- [ ] "Coverage X%": Report generato?
- [ ] "Componenti Y": File contati fisicamente?

**Red Flags**:
- [ ] "Probabilmente" → ❌ VERIFICA
- [ ] "Dovrebbe" → ❌ VERIFICA
- [ ] "Coverage sconosciuto" → ❌ INACCETTABILE - esegui test
- [ ] "Circa" / "~" → ❌ VERIFICA numero esatto
- [ ] Dati vecchi (>7 giorni) → ❌ RI-VERIFICA

---

## 🚨 RED FLAGS COMUNI

### Linguaggio Vago
❌ "Coverage sconosciuto" → Esegui test e misura
❌ "Probabilmente funziona" → Testa e conferma
❌ "Circa 20 test" → Conta esatti
❌ "Dovrebbe essere LOCKED" → Leggi codice e verifica

### Numeri Non Verificati
❌ "74% coverage" (da vecchio report) → Rigenera
❌ "23/31 test" (non eseguiti) → Esegui ora
❌ "8 componenti" (assunti) → Glob e conta

### Assunzioni Pericolose
❌ "I test passano sempre" → Ri-esegui
❌ "Nulla è cambiato" → Verifica git log
❌ "Documentazione è aggiornata" → Confronta con codice

---

## 📊 TEMPLATE REPORT VERIFICATO

```markdown
# 🔍 VERIFICA: [Area/Componente]

**Data**: 2025-10-24
**Verificatore**: [Nome Agente]
**Claim Originale**: [Citazione esatta]
**Fonte Claim**: [File/Messaggio]

---

## METODO VERIFICA

### Test Eseguiti
```bash
npm test -- LoginPage.spec.js
# Output:
# Tests: 18 passed, 13 failed, 31 total
# Coverage: 51.2%
```

### File Verificati
```bash
Read: src/features/auth/LoginPage.tsx
# Lines: 287
# Lock markers: NONE FOUND
```

---

## RISULTATI VERIFICATI

| Claim | Verificato | Discrepanza |
|-------|-----------|-------------|
| 23/31 test passano | 18/31 passano | -5 test (-21%) |
| 74% coverage | 51% coverage | -23% |
| Component LOCKED | NO lock markers | NOT LOCKED |

---

## CONCLUSIONE

❌ **CLAIM NON VERIFICATO**

**Problemi**:
1. Coverage gonfiato del 23%
2. Test count errato (-5 test)
3. Lock status falso

**Impatto**: ALTO - Decisioni basate su dati errati

**Azione Richiesta**:
1. Correggere documentazione
2. Re-test componenti
3. Rimuovere claim LOCKED fino a verifica
```

---

## 🎯 ESEMPI VERIFICA

### Esempio 1: Verifica Test Coverage

**Claim**: "LoginPage ha 74% coverage con 23/31 test passati"

**Verifica**:
```bash
# Eseguo test
npm test -- LoginPage.spec.js

# Output reale:
Tests: 18 passed, 13 failed, 31 total
Time: 45.3s
Coverage: 51.2%

# Confronto
Claim: 23/31 (74%)
Realtà: 18/31 (58%)
Discrepanza: -16% coverage
```

**Conclusione**: ❌ Claim FALSO - Coverage gonfiato

---

### Esempio 2: Verifica File LOCKED

**Claim**: "OnboardingWizard è LOCKED"

**Verifica**:
```bash
Read: src/components/OnboardingWizard.tsx

# Cerco markers:
// @locked
// @verified
LOCKED = true

# Risultato: NESSUN MARKER TROVATO
```

**Conclusione**: ❌ Claim FALSO - Component NON è locked

---

### Esempio 3: Verifica Component Count

**Claim**: "8 componenti onboarding identificati"

**Verifica**:
```bash
Glob: src/components/onboarding-steps/**/*.tsx

# Risultati:
1. BusinessInfoStep.tsx
2. DepartmentsStep.tsx
3. StaffStep.tsx
4. ConservationStep.tsx
5. TasksStep.tsx
6. InventoryStep.tsx
7. CalendarConfigStep.tsx

# Count: 7 componenti step
# + OnboardingWizard.tsx = 8 totali
```

**Conclusione**: ✅ Claim VERIFICATO - 8 componenti confermati

---

## 🔗 INTEGRAZIONE CON ALTRE SKILLS

Usa **prima** di:
- **TEST_ARCHITECT**: Verifica stato esistente prima di pianificare
- **CODE_MAPPING**: Verifica documenti esistenti prima di mappare
- **TEST_GENERATOR**: Verifica coverage attuale prima di generare

---

## 📝 REGOLE D'ORO

1. **Mai fidarsi - Sempre verificare**
2. **"Sconosciuto" = Verifica ora, non dopo**
3. **Claim senza prove = Claim falso**
4. **Verifica attivamente, non passivamente**
5. **Segnala discrepanze immediatamente**
6. **Documenta SOLO ciò che hai verificato**
7. **Timestamp ogni verifica**
8. **Zero tolleranza per numeri gonfiati**

---

**Sei un controllore, non un ottimista. Verifica tutto. Sempre.**
