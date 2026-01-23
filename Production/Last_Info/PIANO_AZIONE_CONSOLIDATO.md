# 🎯 Piano di Azione Consolidato - Risoluzione Bug e TODO

> **Data Creazione**: 2026-01-07  
> **Stato**: 📋 Pronto per Esecuzione  
> **Priorità**: ALTA per Fase 1-3, MEDIA per Fase 4-5

---

## 📊 Situazione Attuale

| Categoria | Count | Status |
|-----------|-------|--------|
| **Bug Aperti** | 1 (BUG-004) | MEDIUM |
| **TODO Funzionali** | 29 | Variabile |
| **DEBUG Statements** | 6 | LOW - Quick Win |
| **Tech Debt** | 1 (TYPE-001) | MEDIUM |
| **TOTALE** | **37 issue** | - |

---

## 🎯 Strategia Consolidata (5 Fasi)

### ⚡ FASE 1: Quick Wins (1-2 ore)
**Priorità**: ALTA | **Impact**: Immediato | **Effort**: Basso

#### Obiettivi
1. Rimuovere tutti i DEBUG statements
2. Collegare funzioni staff CRUD già implementate
3. Quick fixes isolati

#### Task List
- [ ] **DEBUG Cleanup** (30 min)
  - Rimuovere console.log alle righe 1955, 2007, 2010, 2043, 2070 in `src/utils/onboardingHelpers.ts`
  - Verificare che onboarding funzioni ancora

- [ ] **Staff Management CRUD** (30-45 min) ⚡ **QUICK WIN**
  - `src/features/management/components/StaffManagement.tsx`
  - Le funzioni esistono già in `useStaff.ts`!
  - Riga 56: Collegare `createStaffMember.mutate(input)`
  - Riga 52: Collegare `updateStaffMember.mutate({ id: editingStaff.id, input })`
  - Riga 63: Collegare `deleteStaffMember.mutate(id)` con conferma
  - Testare operazioni CRUD

- [ ] **Calendar Editing Mode** (30-45 min)
  - `src/features/calendar/EventDetailsModal.tsx:422`
  - Aggiungere stato `isEditing`
  - Convertire display in form editabile
  - Implementare save/cancel

#### Risultato Atteso
✅ Codice più pulito, funzionalità staff operative, miglior UX calendar

---

### 🔧 FASE 2: Schema & Foundation (4-6 ore)
**Priorità**: ALTA | **Impact**: Abilita Fase 3 | **Effort**: Medio

#### Obiettivi
1. Decisioni critiche schema DB
2. Preparazione migrazione types

#### Task List

**Decision 1: Temperature Readings Schema**
- [ ] **Analisi Requirements** (1h)
  - Verificare se campi `method`, `recorded_by`, `notes` sono necessari per business
  - Decidere: DB fields vs computed fields

- [ ] **Raccomandazione**: Approccio Ibrido
  - ✅ **Computed fields** per: `status`, `compliance_rate` (logica app)
  - ✅ **DB fields** per: `method`, `recorded_by`, `notes` (se richiesti da business)
  
- [ ] **Migration SQL** (se necessaria) (1-2h)
  ```sql
  -- Solo se business requirements lo richiedono
  ALTER TABLE temperature_readings 
  ADD COLUMN IF NOT EXISTS method TEXT CHECK (method IN ('manual', 'automatic', 'sensor')),
  ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS notes TEXT;
  ```

**Decision 2: Notification Preferences**
- [ ] Verificare se tabella esiste nel DB
- [ ] Se no: creare migration o usare JSON field in users table (1-2h)

#### Risultato Atteso
✅ Decisioni prese, migrations pronte (se necessarie), foundation per type migration

---

### 🔒 FASE 3: Type System Alignment (8-12 ore)
**Priorità**: ALTA | **Impact**: Type-safety completa | **Effort**: Alto

#### Obiettivi
1. Risolvere BUG-004 (type mismatches)
2. Completare TYPE-001 (migrazione database.types.ts)

#### Approccio Graduale

**Step 1: Audit & Helper Types** (2h)
- [ ] Eseguire `npm run type-check > type-errors.txt`
- [ ] Creare `src/types/helpers.ts` con type adapters
- [ ] Mappare tutte le incompatibilità

**Step 2: Migrazione Hooks** (4-6h)
- [ ] `useStaff.ts` - role field alignment
- [ ] `useProducts.ts` - company_id nullability, allergen types
- [ ] `useCategories.ts` - allergen_info
- [ ] `useShoppingLists.ts` - shopping_list_id

**Step 3: Migrazione Components** (2-4h)
- [ ] `CompanyConfiguration.tsx` - Company type
- [ ] `HACCPSettings.tsx` - HACCPConfig structure
- [ ] `NotificationPreferences.tsx` - gestione tabella

**Step 4: Validation** (2h)
- [ ] `npm run type-check` deve passare
- [ ] Test suite passa
- [ ] Verificare runtime

#### Pattern Helper Type
```typescript
// src/types/helpers.ts
export type DatabaseStaff = Database['public']['Tables']['staff']['Row']
export type StaffRole = DatabaseStaff['role']

// Adapter per compatibilità
export type StaffAdapter = Omit<DatabaseStaff, 'role'> & {
  role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
}
```

#### Risultato Atteso
✅ Type-check pulito, types allineati, BUG-004 risolto

---

### 🚀 FASE 4: Feature Completion (6-10 ore)
**Priorità**: MEDIUM | **Impact**: Funzionalità complete | **Effort**: Medio-Alto

#### Task List per Area

**Auth (3 TODO - 4h)**
- [ ] Remember Me service (`authClient.ts:314`) - 2h
- [ ] Rollback invite service (`inviteService.ts:322`) - 1h
- [ ] Fix RLS query (`inviteService.ts:507`) - 1h

**Conservation (12 TODO - 6-8h)**
- [ ] Computed compliance_rate (`useConservation.ts:278`) - 2h
- [ ] Computed temperature alerts (`useConservation.ts:290`) - 2h
- [ ] Computed status logic - 2h
- [ ] UI updates per method/notes (se DB schema aggiornato) - 2h
- [ ] completed_by da auth (`ConservationPage.tsx:159`) - 30min

**Inventory (3 TODO - 3h)**
- [ ] Trend calculation (`useExpiredProducts.ts:167`) - 1.5h
- [ ] Monthly cost tracking (`useExpiredProducts.ts:168`) - 1h
- [ ] Departments dropdown (`AddProductModal.tsx:306`) - 30min

**Types Cleanup (4 TODO - 2h)**
- [ ] Rimuovere filtri inesistenti (`conservation.ts:466-467`) - 30min
- [ ] Aggiungere computed types (`conservation.ts:494, 545`) - 1.5h

**Export (2 TODO - 4h)**
- [ ] Corrective actions tracking - 2h
- [ ] Staff training tracking - 2h

**Integration (1 TODO - 1h)**
- [ ] Valutare o rimuovere `AdvancedAnalyticsIntegration.ts`

#### Risultato Atteso
✅ Funzionalità business-critical complete, computed fields implementati

---

### ✨ FASE 5: Polish & Validation (2-3 ore)
**Priorità**: LOW | **Impact**: Qualità finale | **Effort**: Basso

#### Task List
- [ ] Test suite completa (`npm run test`)
- [ ] E2E test validation (`npm run test:e2e`)
- [ ] Type-check finale (`npm run type-check`)
- [ ] Lint check (`npm run lint`)
- [ ] Aggiornare `BUG_TRACKER.md` con stato "Risolto"
- [ ] Documentare breaking changes (se presenti)

#### Risultato Atteso
✅ Tutti i test passano, documentazione aggiornata, ready per produzione

---

## 📅 Timeline Consolidata

| Fase | Effort | Priorità | Dipendenze |
|------|--------|----------|------------|
| **Fase 1: Quick Wins** | 1-2h | 🔴 ALTA | Nessuna |
| **Fase 2: Schema** | 4-6h | 🔴 ALTA | Nessuna |
| **Fase 3: Types** | 8-12h | 🔴 ALTA | Fase 2 |
| **Fase 4: Features** | 6-10h | 🟡 MEDIA | Fase 3 |
| **Fase 5: Polish** | 2-3h | 🟢 BASSA | Fase 4 |
| **TOTALE** | **21-33h** | - | - |

**Stima Realistica**: 25-30 ore con buffer per imprevisti

---

## ✅ Success Criteria

Il piano è completato quando:
- ✅ Tutti i DEBUG statements rimossi
- ✅ BUG-004 risolto (type-check pulito)
- ✅ TYPE-001 completato (types allineati)
- ✅ 85%+ TODO implementati
- ✅ Test suite passa
- ✅ Nessun type error
- ✅ `BUG_TRACKER.md` aggiornato

---

## 🎯 Prossimi Step Immediati

### Per Iniziare Oggi (Fase 1):

1. **Quick Win - Staff CRUD** (30 min)
   - Aprire `src/features/management/components/StaffManagement.tsx`
   - Collegare le 3 funzioni da `useStaff` hook
   - Testare

2. **DEBUG Cleanup** (30 min)
   - Rimuovere console.log da `onboardingHelpers.ts`
   - Verificare onboarding funziona

3. **Calendar Editing** (45 min)
   - Implementare editing mode base

**Totale oggi**: ~2 ore per completare Fase 1

---

## 🚨 Note Critiche

### Dipendenze
- **Fase 3 → Fase 4**: Types devono essere allineati prima di implementare features
- **Fase 2 → Fase 3**: Decisioni schema necessarie per type migration
- **Fase 1**: Può essere fatto in parallelo con Fase 2

### Rischi
| Rischio | Mitigazione |
|---------|-------------|
| Schema changes breaking data | Backup DB prima di migrations |
| Type changes breaking runtime | Test estensivi dopo ogni migrazione |
| Features incomplete | Prioritizzare MVP, documentare TODO rimanenti |

---

## 📝 Decisioni da Prendere Prima di Iniziare

1. **Temperature Readings Schema**: 
   - ✅ Computed fields per status/compliance (app logic)
   - ❓ DB fields per method/recorded_by? (richiede business input)

2. **Notification Preferences**:
   - ❓ Tabella DB separata o JSON field in users?

3. **Priorità Features**:
   - Quali TODO possono essere posticipati vs must-have?

---

**🎯 Raccomandazione**: Iniziare con **Fase 1** oggi (quick wins), poi procedere con Fase 2-3 questa settimana.



