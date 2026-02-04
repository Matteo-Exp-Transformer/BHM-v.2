# MASTER INDEX - Conservation Feature
## Aggiornato: 2026-02-04 (solo funzionalità verificate funzionanti; fix modal temperatura ancora aperto)

---

## STATO ATTUALE (Verificato 2026-01-31)

### VERDETTO: **PRONTO PER PRODUZIONE + NUOVE FEATURES**

| Metrica | Valore |
|---------|--------|
| Funzionalità Implementate | **100%** |
| Bug Risolti | **10/10** |
| Blockers per Merge | **0** |
| Migration DB | **Applicata (018, 019, 020, 021)** |
| Test Manuale | **PASS** |
| Profili HACCP | **5 profili × 4 categorie elettrodomestico** |
| Nuove Features | Profili HACCP ✅ + Immagini ✅ + Layout Split ✅ + Nome Utente ✅ + Pulsante Calendario ✅ + **Sistema 3 Tab Temperature** ✅ |

---

## SESSIONE CORRENTE (30-31-01-2026)

### Riorganizzazione Letture Temperature + Miglioramenti UI ⚠️ IMPLEMENTATO (da debuggare)

**Obiettivo**: Sistema a 3 tab per Letture Temperature (Stato Corrente / Storico / Analisi) con workflow azioni correttive HACCP, grafici, e raffinamenti UI.

**Implementazione v2 (30-01)**:
- ✅ **Sistema a 3 tab**: Stato Corrente, Storico, Analisi
- ✅ **4 stati badge punto**: conforme, critico, richiesta_lettura, nessuna_lettura (tolleranza ±1°C)
- ✅ **Azioni correttive**: Popover guidato con istruzioni HACCP per tipo punto
- ✅ **Grafico andamento**: recharts con banda range, tooltip, pallini conformi/fuori range
- ✅ **Storico**: raggruppamento per data, filtri periodo/punto/anomalie
- ✅ **Dipendenze**: recharts, @radix-ui/react-popover

**Miglioramenti UI (31-01)**:
- ✅ **Layout semplificato**: rimosso TemperatureAlertsPanel, solo griglia card
- ✅ **Card ordinate per tipo**: fridge → freezer → blast → ambient
- ✅ **Reparto e operatore**: mostrati nelle card e nella tabella storico
- ✅ **Pulsante "Rileva Temperatura"**: dropdown selezione punto nell'header
- ✅ **Click card condizionale**: apre modal solo per nessuna_lettura e richiesta_lettura
- ✅ **Prop centerTitle**: aggiunta a CollapsibleCard (riutilizzabile)

**Fix bug (31-01)**:
- ✅ **Input temperatura**: stringa in state, permette cancellazione 0 e numeri negativi
- ✅ **Badge stato punti**: usa classifyPointStatus con last_temperature_reading (verde/giallo/rosso)
- ✅ **Raggruppamento date**: timezone locale invece di UTC (31 gen non in 30 gen)
- ✅ **Popover azioni correttive**: convertito in Dialog centrato (era invisibile)
- ✅ **Testi azioni correttive**: messaggi aggiornati frigorifero/freezer, assistenza tecnica

**File chiave**:
- `src/features/conservation/ConservationPage.tsx` — Tab, pulsante Rileva Temperatura, ordinamento
- `src/features/conservation/components/TemperaturePointStatusCard.tsx` — Card stato, reparto, operatore, click
- `src/features/conservation/components/TemperatureReadingsTable.tsx` — Colonna Reparto
- `src/features/conservation/utils/correctiveActions.ts` — Logica tolleranza ±1°C
- [README.md](./30-01-2026/README.md) — Guida agenti per fix
- [riorganizzazione_temperature_card_v2_implementazione.md](./30-01-2026/riorganizzazione_temperature_card_v2_implementazione.md)
- [miglioramenti_ui_temperature_31-01-2026.md](./30-01-2026/miglioramenti_ui_temperature_31-01-2026.md)
- [REPORT_FIX_BUG_UI_TEMPERATURE_31-01-2026.md](./30-01-2026/REPORT_FIX_BUG_UI_TEMPERATURE_31-01-2026.md) — Fix bug input, badge, date, popover, testi

**Status**: ⚠️ IMPLEMENTATO — Fix bug completati (timezone date risolto; eventuali residui: performance, pointsInRichiestaLettura persistenza)

---

### 31-01-2026: Centralizzazione Tolleranza ±1°C + Badge Cliccabile + UX Critico ✅

**Obiettivo**: Unificare tolleranza temperatura, migliorare UX stati Attenzione/Critico, correggere sicurezza git.

**Implementazione**:
- ✅ **Tolleranza centralizzata**: TOLERANCE_C = 1.0 in correctiveActions; tutti i file allineati
- ✅ **Stato da ultimo rilevamento**: getLatestReadingByPoint seleziona il più recente per data/ora
- ✅ **Nessuna lettura**: stato Attenzione (giallo) invece di Regolare
- ✅ **Messaggi di azione**: per ogni stato (nessuna lettura, temp fuori range, temp al limite, manutenzione)
- ✅ **Badge cliccabile**: scroll alla TemperaturePointStatusCard con highlight fino al click
- ✅ **Nome utente** nella sezione Ultima lettura (allineato a timestamp)
- ✅ **classifyPointStatus**: allineato a ±1°C, colori critico più rossi (border-red-500)
- ✅ **Sicurezza**: .cursor/mcp.json rimosso da history (git-filter-repo), aggiunto a .gitignore

**File chiave**:
- `src/features/conservation/utils/correctiveActions.ts` — Fonte tolleranza
- `src/utils/temperatureStatus.ts` — Centralizzazione
- `src/types/conservation.ts` — classifyPointStatus, CONSERVATION_STATUS_COLORS
- `src/features/conservation/components/ConservationPointCard.tsx` — Badge, nome utente
- [REPORT_SESSIONE_COMPLETA_31-01-2026.md](./31-01-2026/REPORT_SESSIONE_COMPLETA_31-01-2026.md)

---

### 31-01-2026: Abbattitore (no rilevamento temperatura) + UI card ✅

**Obiettivo**: Per tipologia Abbattitore: non richiedere/assegnare manutenzione "Rilevamento temperatura"; nascondere temperatura/badge/ultime letture in card; escludere dalla sezione Rilevamento temperature; uniformare altezza card temperatura.

**Implementazione**:
- ✅ **Abbattitore senza rilevamento temperatura**: typesRequiringTemp senza blast; classifyPointStatus non calcola stato da temperatura per blast
- ✅ **Card ConservationPointCard**: per blast nascosti temperatura target, badge regolazione termostato, ultima lettura
- ✅ **AddPointModal**: filter load/save temperature; testo dinamico manutenzioni (poi 01-02: blast = 1 solo Sanificazione)
- ✅ **TasksStep + onboardingHelpers**: validazioni; (poi 01-02: blast = 1 solo Sanificazione)
- ✅ **temperatureCheckGenerator**: nessun evento rilevamento temperatura per punti blast
- ✅ **ConservationPage**: filter blast dalla griglia TemperaturePointStatusCard (sezione Rilevamento temperature)
- ✅ **TemperaturePointStatusCard**: min-h-[246px], area azioni min-h-[40px] per altezza uniforme; riga "Metodo" sotto Ultima lettura (solo metodo, no note/foto)
- ✅ **TemperatureReadingsTable**: riga cliccabile → sezione espandibile con Metodo, Note, Foto evidenza; titoli distinti da contenuti (uppercase grigio vs text-base scuro)

**File chiave**:
- `src/types/conservation.ts` — typesRequiringTemp, classifyPointStatus
- `src/features/conservation/components/ConservationPointCard.tsx` — Nascita temperatura/badge/ultima lettura per blast
- `src/features/conservation/components/AddPointModal.tsx` — Manutenzioni blast, validazioni, testo 2/4
- `src/features/conservation/ConservationPage.tsx` — Filter blast da griglia temperatura
- `src/features/conservation/components/TemperaturePointStatusCard.tsx` — Altezza uniforme, metodo rilevamento
- `src/features/conservation/components/TemperatureReadingsTable.tsx` — Riga espandibile, dettagli metodo/note/foto
- [REPORT_ABBATTITORE_E_UI_31-01-2026.md](./31-01-2026/REPORT_ABBATTITORE_E_UI_31-01-2026.md)

---

### 01-02-2026: Conformità Range + Abbattitore Solo Sanificazione + Validazioni Modali ✅

**Obiettivo**: Temperatura in ±1°C = conforme; Abbattitore con solo Sanificazione; Validazioni modali allineate.

**Implementazione**:
- ✅ **Conformità range**: temperatura entro ±1°C → sempre conforme (no Attenzione); messaggio correttivo solo fuori range; `calculateTemperatureStatus`, `classifyPointStatus`, `computeTemperatureStatus`, `getTemperatureStatus` aggiornati
- ✅ **Abbattitore solo Sanificazione**: `getRequiredMaintenanceTasks` blast = 1 tipo (solo sanificazione); TasksStep, onboardingHelpers, filtro load/save AddPointModal
- ✅ **Validazioni modali**: AddPointModal `validateMaintenanceTasks` per blast; MaintenanceTaskModal tipi limitati + pre-selezione + validazione submit; conservationUtils `validateConservationPoint`; TasksStep `validatePlans`

**File chiave**:
- [REPORT_SESSIONE_01-02-2026.md](./01-02-2026/REPORT_SESSIONE_01-02-2026.md)

---

### 04-02-2026: Manutenzioni Programmate + Pallino giornaliero + Completamento automatico task temperatura ✅

**Obiettivo**: Allineare card Manutenzioni programmate alle 4 tipologie (inclusi Controllo Scadenze e Sbrinamento); conteggio per tipologia; considerare il rilevamento temperatura come soddisfacimento del task “Rilevamento Temperature” sulla card.

**Implementazione (funzionante)**:
- ✅ **Conteggio manutenzioni**: numero di **tipologie** (max 4), non numero di eventi/task (`Set` sui `type`)
- ✅ **Ordine fisso**: Rilevamento Temperature → Sanificazione → Sbrinamento → Controllo Scadenze; “Mostra altre X manutenzioni [tipo]” per **tutte** le tipologie (prossima per data in ogni tipo)
- ✅ **Rilevamento temperatura**: in `pointCheckup`, se esiste una lettura temperatura per il punto con data ≥ scadenza del task tipo `temperature`, il task non viene mostrato come arretrato né “di oggi da completare”

**Non risolto (stesso giorno)**:
- ❌ **Chiusura AddTemperatureModal**: il modal di lettura temperatura non si chiude né dopo salvataggio né con click su X o Annulla. Vedi REPORT_SESSIONE_MODAL_TEMPERATURA_04-02-2026.md in cartella 04-02-2026.

**File chiave**:
- `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` — `MAINTENANCE_TYPE_ORDER`, conteggio per tipologia, letture temperatura, `calculateWeeklyStatus` a logica giornaliera
- `src/features/conservation/utils/pointCheckup.ts` — `isTemperatureTaskSatisfiedByReading`, filtri todayPending/overdueTasks per tipo temperature
- `src/features/conservation/hooks/useTemperatureReadings.ts` — dopo `createReading`: insert in `maintenance_completions` per task temperatura, invalidazioni e `calendar-refresh`
- `src/features/conservation/components/ConservationPointCard.tsx` — Box "Ultima lettura": colore solo da conformità temperatura (`temperatureBadgeColors` da `checkup.temperature.inRange`)
- [REPORT_LAVORO_04-02-2026.md](./04-02-2026/REPORT_LAVORO_04-02-2026.md)
- [REPORT_SESSIONE_MODAL_TEMPERATURA_04-02-2026.md](./04-02-2026/REPORT_SESSIONE_MODAL_TEMPERATURA_04-02-2026.md) — tentativo fix chiusura modal (non risolto)
- [PIANO_completamento_temperatura_su_lettura.md](./04-02-2026/PIANO_completamento_temperatura_su_lettura.md)
- [README.md](./04-02-2026/README.md)

---

## SESSIONI PRECEDENTI

### 29-01-2026: Profilo Bibite + Pulsante Calendario ✅

**Obiettivo**: 5° profilo HACCP e pulsante per navigare al calendario dalle manutenzioni.

**Implementazione**:
- ✅ Profilo `beverages_alcoholic`, pulsante "Visualizza nel Calendario", fix completamento manutenzione

**File**: [README.md](./29-01-2026/README.md)

---

### 24-01-2026: Allineamento ConservationStep ↔ AddPointModal ✅

**Obiettivo**: Allineare validazione temperatura e UI del form punti di conservazione.

**Implementazione**:
- ✅ **Validazione solo schema**: `validateConservationPoint()` usa solo Zod
- ✅ **Sezione profilo** (solo frigoriferi): layout split, immagine, Modal lightbox, Note HACCP
- ✅ Campo temperatura read-only, profili HACCP nei prefill

**File chiave**:
- `src/utils/onboarding/conservationUtils.ts`
- `src/components/onboarding-steps/ConservationStep.tsx`
- [REPORT_ALLINEAMENTO_VALIDAZIONE_TEMPERATURA.md](./24-01-2026/REPORT_ALLINEAMENTO_VALIDAZIONE_TEMPERATURA.md)

---

### 23-01-2026: Fix Conservation Point Card + Nome Utente ✅

**Obiettivo**: Fixare visualizzazione categorie e ripristinare nome utente nelle temperature readings.

**Implementazione**:
- ✅ **Mapping categorie unificato**: Funzione `mapCategoryToLabel()` cerca in entrambi i formati
- ✅ **Fix query useTemperatureReadings**: `auth_user_id` invece di `id`
- ✅ **Fallback nome utente**: `company_members` → `staff`
- ✅ **Salvataggio appliance_category e profile_id** durante onboarding

**File chiave**:
- `src/features/conservation/components/ConservationPointCard.tsx`
- `src/features/conservation/hooks/useTemperatureReadings.ts`
- [REPORT_FIX_CONSERVATION_POINT_CARD_DISPLAY.md](./23-01-2026/REPORT_FIX_CONSERVATION_POINT_CARD_DISPLAY.md)

---

### 22-01-2026: Nome Utente + Recurrence Config ✅

**Obiettivo**: Associazione nome utente a registrazioni temperature e implementazione recurrence_config.

**Implementazione**:
- ✅ **Sistema associazione nome utente**: onboarding → user_profiles → temperature readings
- ✅ **Migration 019**: `recurrence_config JSONB` per manutenzioni
- ✅ **Funzione `calculateNextDueWithRecurrence`**: Rispetta giorni configurati
- ✅ **Fix bug validazione ConservationStep**

**Formato recurrence_config**:
```json
{
  "weekdays": ["lunedi", "mercoledi", "venerdi"],
  "day_of_month": 15,
  "day_of_year": "2026-03-15"
}
```

**File chiave**:
- `database/migrations/019_add_recurrence_config_to_maintenance_tasks.sql`
- `src/features/conservation/hooks/useMaintenanceTasks.ts`
- [ASSOCIAZIONE_NOME_UTENTE_TEMPERATURE.md](./22-01-2026%20Nome%20associato%20ad%20evento/ASSOCIAZIONE_NOME_UTENTE_TEMPERATURE.md)

---

### 21-01-2026: Centralizzazione Costanti + Layout Split UX ✅

**Obiettivo**: Eliminare duplicazioni costanti e migliorare UX layout split.

**Implementazione**:
- ✅ **Nuovo file `conservationConstants.ts`**: Singola fonte di verità
- ✅ **Helper functions**: `getConservationTypeLabel()`, `getConservationTempRange()`, ecc.
- ✅ **Rimozione profilo `meat_fish_generic`**: Migration 021
- ✅ **Layout split immediato** per frigoriferi con placeholder informativi

**Metriche**:
- Codice duplicato eliminato: ~120 linee
- File con definizioni ridotti: da 4 a 1
- Funzioni helper aggiunte: 5

**File chiave**:
- `src/utils/conservationConstants.ts` — NUOVO
- [RIEPILOGO_SESSIONE_21_01_2026.md](./21-01-2026/RIEPILOGO_SESSIONE_21_01_2026.md)

---

### 20-01-2026: Immagini Elettrodomestici + Layout Split ✅

- ✅ Layout split: Categorie (sinistra) + Immagine (destra)
- ✅ Modal lightbox fullscreen
- ✅ Config centralizzata paths (`applianceImages.ts`)

---

### 19-01-2026: Profili HACCP v2.0.0 ✅

- ✅ 4 profili iniziali (max_capacity, meat_generic, vegetables_generic, fish_generic)
- ✅ Auto-configurazione temperatura e categorie
- ✅ Database schema aggiornato (migration 018, 019, 020)

---

### 16-01-2026: Bug Fix Session ✅

| Bug ID | Descrizione | Status |
|--------|-------------|--------|
| **C1** | Select Ruolo non salvava valore | ✅ RISOLTO |
| **C1-bis** | Select Categoria non salvava valore | ✅ RISOLTO |
| **M1** | Temperatura mostra valore fisso | ✅ RISOLTO |

---

## STRUTTURA CARTELLE

```
Lavoro/
├── 00_MASTER_INDEX_CONSERVATION.md  ← QUESTO FILE (aggiornato 04-02-2026)
├── 10-01-2026/                      ← Archivio storico
├── ...
├── 21-01-2026/                      ← Centralizzazione costanti
│   └── RIEPILOGO_SESSIONE_21_01_2026.md
├── 22-01-2026 Nome associato.../    ← Nome utente + recurrence_config
│   ├── ASSOCIAZIONE_NOME_UTENTE_TEMPERATURE.md
│   └── REPORT_RECURRENCE_CONFIG_IMPLEMENTATION.md
├── 23-01-2026/                      ← Fix Conservation Point Card
│   └── REPORT_FIX_CONSERVATION_POINT_CARD_DISPLAY.md
├── 24-01-2026/                      ← Allineamento ConservationStep
│   ├── REPORT_ALLINEAMENTO_VALIDAZIONE_TEMPERATURA.md
│   └── MAPPATURA_PROFILO_BIBITE_BEVANDE_ALCOLICHE.md
├── 29-01-2026/                      ← Profilo Bibite + Pulsante Calendario
│   ├── README.md
│   ├── REPORT_PROFILO_BIBITE_BEVANDE_ALCOLICHE.md
│   └── REPORT_PULSANTE_VISUALIZZA_CALENDARIO_E_FIX.md
├── 30-01-2026/                      ← Riorg. Temperature + UI (30-31 gen)
│   ├── README.md
│   ├── riorganizzazione_temperature_card_v2_implementazione.md
│   ├── miglioramenti_ui_temperature_31-01-2026.md
│   └── REPORT_FIX_BUG_UI_TEMPERATURE_31-01-2026.md
├── 31-01-2026/                      ← Centralizzazione tolleranza + Badge cliccabile + Abbattitore no temp + UI card
│   ├── README.md
│   ├── REPORT_SESSIONE_COMPLETA_31-01-2026.md
│   └── REPORT_ABBATTITORE_E_UI_31-01-2026.md
├── 01-02-2026/                      ← Conformità range + Abbattitore solo Sanificazione + Validazioni
│   ├── README.md
│   ├── REPORT_SESSIONE_01-02-2026.md
│   └── REPORT_card_checkup_centralizzato.md
└── 04-02-2026/                      ← ⭐ Manutenzioni programmate + Pallino giornaliero + Completamento automatico task temperatura (+ tentativo fix modal non risolto)
    ├── README.md
    ├── REPORT_LAVORO_04-02-2026.md
    ├── REPORT_SESSIONE_MODAL_TEMPERATURA_04-02-2026.md   ← fix chiusura AddTemperatureModal (non risolto)
    └── PIANO_completamento_temperatura_su_lettura.md
```

---

## FUNZIONALITÀ IMPLEMENTATE (100%)

| Funzionalità | Status | Data |
|--------------|--------|------|
| CRUD Punti Conservazione | ✅ | 16-01 |
| Manutenzioni Obbligatorie (4 tipi) | ✅ | 16-01 |
| Select Ruolo/Categoria/Dipendente | ✅ | 16-01 |
| **Profili HACCP (5 profili)** | ✅ | 19-01 → 29-01 |
| **Immagine Elettrodomestico** | ✅ | 20-01 |
| **Layout Split Categorie + Immagine** | ✅ | 20-01 |
| **Costanti Centralizzate** | ✅ | 21-01 |
| **Nome Utente Temperature Readings** | ✅ | 22-01 |
| **Recurrence Config Manutenzioni** | ✅ | 22-01 |
| **Fix Mapping Categorie** | ✅ | 23-01 |
| **Allineamento ConservationStep** | ✅ | 24-01 |
| **Profilo Bibite/Bevande** | ✅ | 29-01 |
| **Pulsante Calendario** | ✅ | 29-01 |
| **Sistema 3 Tab Temperature** | ✅ | 30-01 |
| **Azioni correttive HACCP** | ✅ | 30-01 |
| **Grafico andamento temperature** | ✅ | 30-01 |
| **Pulsante Rileva Temperatura** | ✅ | 31-01 |
| **Fix bug UI temperatura** (input, badge, date, popover, testi) | ✅ | 31-01 |
| **Tolleranza centralizzata ±1°C** | ✅ | 31-01 |
| **Badge Attenzione/Critico cliccabile** (scroll + highlight) | ✅ | 31-01 |
| **Nome utente in Ultima lettura** | ✅ | 31-01 |
| **Colori critico intensificati** | ✅ | 31-01 |
| **Abbattitore: no rilevamento temperatura** | ✅ | 31-01 |
| **Validazioni manutenzioni per tipo** (blast 1, ambient 2, fridge/freezer 4) | ✅ | 31-01 → 01-02 |
| **Sezione Rilevamento temperature senza Abbattitore** | ✅ | 31-01 |
| **Altezza uniforme card temperatura (TemperaturePointStatusCard)** | ✅ | 31-01 |
| **Dettagli rilevamento in tabella** (riga espandibile: metodo, note, foto; titoli distinti) | ✅ | 31-01 |
| **Metodo rilevamento in card** (TemperaturePointStatusCard, riga sotto Ultima lettura) | ✅ | 31-01 |
| **Conformità in range ±1°C** (dentro = conforme, messaggio solo fuori) | ✅ | 01-02 |
| **Abbattitore: solo Sanificazione** (1 manutenzione obbligatoria) | ✅ | 01-02 |
| **Validazioni modali** (AddPointModal, MaintenanceTaskModal, conservationUtils, TasksStep) | ✅ | 01-02 |
| **Manutenzioni programmate: conteggio per tipologia** (max 4, non per eventi) | ✅ | 04-02 |
| **Manutenzioni programmate: ordine fisso** (Temperature → Sanificazione → Sbrinamento → Controllo Scadenze) + “Mostra altre” per tutti i tipi | ✅ | 04-02 |
| **Rilevamento temperatura = completamento task** (card non mostra “Rilevamento Temperature” arretrato se c’è lettura ≥ scadenza) | ✅ | 04-02 |
| **Pallino Manutenzioni programmate** (verde = nulla da completare oggi; giallo = da completare oggi; rosso = in ritardo) | ✅ | 04-02 |
| **Completamento automatico task temperatura su "Rileva Temperatura"** (insert in maintenance_completions, visibile in Conservazione e Attività) | ✅ | 04-02 |
| **Box "Ultima lettura" colore solo da temperatura** (verde = conforme, rosso = critico; non da stato complessivo) | ✅ | 04-02 |

---

## 5 PROFILI HACCP

| ID | Nome | Temperatura | Note |
|----|------|-------------|------|
| `max_capacity` | Massima Capienza | 2°C | Per disciplina e organizzazione |
| `meat_generic` | Carne + Generico | 3°C | Specializzato carne |
| `vegetables_generic` | Verdure + Generico | 4°C | Specializzato verdure |
| `fish_generic` | Pesce + Generico | 1°C | Specializzato pesce |
| `beverages_alcoholic` | Bibite e Bevande Alcoliche | 4°C | Nessun range temperatura |

Ogni profilo è disponibile per tutte e 4 le categorie elettrodomestico:
- `vertical_fridge_with_freezer`
- `vertical_fridge_1_door`
- `vertical_fridge_2_doors`
- `base_refrigerated`

---

## QUICK START

### Per debug o implementazione:

1. **Profili HACCP**: Leggi `src/utils/conservationProfiles.ts`
2. **Costanti**: Leggi `src/utils/conservationConstants.ts`
3. **Immagini**: Leggi `src/config/applianceImages.ts`
4. **Guida agenti**: [AGENT_GUIDE_APPLIANCE_IMAGES.md](./20-01-2026/AGENT_GUIDE_APPLIANCE_IMAGES.md)

### Comandi verifica:

```bash
npm run dev          # Dev server
npm run build        # Build
npm run type-check   # TypeScript check
npm run test -- --run  # Test
```

---

## CRONOLOGIA SESSIONI

| Data | Attività | Risultato |
|------|----------|-----------|
| 10-01-2026 | Piano iniziale | Base feature |
| 16-01-2026 | Bug fix session | 7/7 completate |
| 19-01-2026 | Feature Profili HACCP | 4 profili implementati |
| 20-01-2026 | Feature Immagini Elettrodomestici | Layout split + modal |
| **21-01-2026** | **Centralizzazione Costanti** | **Eliminazione ~120 linee duplicate** |
| **22-01-2026** | **Nome Utente + Recurrence Config** | **Migration 019, fallback query** |
| **23-01-2026** | **Fix Conservation Point Card** | **Mapping unificato categorie** |
| **24-01-2026** | **Allineamento ConservationStep** | **Validazione schema, sezione profilo** |
| **29-01-2026** | **Profilo Bibite + Pulsante Calendario** | **5° profilo HACCP, navigazione calendario** |
| **30-31-01-2026** | **Riorg. Temperature + Miglioramenti UI** | **3 tab, azioni correttive, grafico, pulsante Rileva** |
| **31-01-2026** | **Centralizzazione tolleranza + Badge cliccabile** | **±1°C unificato, badge scroll/highlight, nome utente, colori critico** |
| **31-01-2026** | **Abbattitore no rilevamento temperatura + UI card** | **Manutenzioni blast, sezione temp senza Abbattitore, card altezza uniforme** |
| **01-02-2026** | **Conformità range + Abbattitore solo Sanificazione + Validazioni** | **Temp in ±1°C = conforme; blast 1 solo Sanificazione; validazioni modali** |
| **04-02-2026** | **Manutenzioni programmate + Pallino giornaliero + Completamento automatico** | **Conteggio per tipologia (max 4); ordine fisso 4 tipi; “Mostra altre” per tutti; lettura temp soddisfa task Rilevamento Temperature** |

---

## RISORSE AGENTI

Per implementare o fare debug:
- 📖 [README 30-01-2026 - Guida fix Letture Temperature](./30-01-2026/README.md) — Punto di ingresso per fix sistema 3 tab
- 📖 [Report Fix Bug UI Temperatura 31-01-2026](./30-01-2026/REPORT_FIX_BUG_UI_TEMPERATURE_31-01-2026.md) — Fix input, badge, date, popover, testi
- 📖 [Report Sessione Completa 31-01-2026](./31-01-2026/REPORT_SESSIONE_COMPLETA_31-01-2026.md) — Centralizzazione tolleranza ±1°C, badge cliccabile, nome utente, colori critico, sicurezza git
- 📖 [Report Abbattitore e UI 31-01-2026](./31-01-2026/REPORT_ABBATTITORE_E_UI_31-01-2026.md) — Abbattitore senza rilevamento temperatura, sezione Rilevamento senza Abbattitore, altezza uniforme card
- 📖 [Report Sessione 01-02-2026](./01-02-2026/REPORT_SESSIONE_01-02-2026.md) — Conformità range ±1°C, Abbattitore solo Sanificazione, validazioni modali
- 📖 [Report Lavoro 04-02-2026](./04-02-2026/REPORT_LAVORO_04-02-2026.md) — Manutenzioni programmate, pallino verde/giallo/rosso giornaliero, rilevamento = completamento task, completamento automatico su "Rileva Temperatura"
- 📖 [Report Sessione Modal Temperatura 04-02-2026](./04-02-2026/REPORT_SESSIONE_MODAL_TEMPERATURA_04-02-2026.md) — Tentativo fix chiusura AddTemperatureModal (X, Annulla, dopo salvataggio) — **non risolto**
- 📖 [Piano completamento temperatura su lettura](./04-02-2026/PIANO_completamento_temperatura_su_lettura.md) — Completamento automatico task "Rilevamento Temperature" quando si salva una lettura
- 📖 [Report Profilo Bibite e Pulsante Calendario](./29-01-2026/REPORT_PROFILO_BIBITE_BEVANDE_ALCOLICHE.md) (29-01-2026)
- 📖 [Report Allineamento ConservationStep ↔ AddPointModal](./24-01-2026/REPORT_ALLINEAMENTO_VALIDAZIONE_TEMPERATURA.md) (Fasi 1–3, 24-01-2026)
- 📖 [Guida Debug & Nuove Categorie](./20-01-2026/AGENT_GUIDE_APPLIANCE_IMAGES.md)
- 🏗️ File sorgenti:
  - `src/config/applianceImages.ts`
  - `src/features/conservation/components/AddPointModal.tsx`
  - `src/utils/conservationProfiles.ts`
  - `src/utils/conservationConstants.ts`

---

**Fine 00_MASTER_INDEX_CONSERVATION.md**
**Ultimo aggiornamento**: 2026-02-04
**Status**: FEATURE COMPLETA — 5 profili HACCP × 4 categorie elettrodomestico + Sistema 3 Tab Temperature + Abbattitore (solo Sanificazione) + Conformità range ±1°C
