# Analisi Completa Gap - GenericTaskForm

**Data**: 2026-01-08
**Analizzato da**: Claude Sonnet 4.5
**File Analizzati**:
- `GENERIC_TASK_FORM_DEFINITION.md` (Definizione)
- `GenericTaskForm.tsx` (Implementazione Form)
- `useGenericTasks.ts` (Logica Hook)
- `useAggregatedEvents.ts` (Generazione Eventi)
- `database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql` (Schema DB)

---

## 🔴 PROBLEMI CRITICI TROVATI

### 1. **MANCANZA CAMPO `recurrence_config` NEL DATABASE**

**Status**: ❌ CRITICO - DB NON ALLINEATO

**Problema**:
- Lo schema `tasks` table NON ha un campo per salvare `custom_days` e `day_of_month`
- Attualmente `useGenericTasks.ts` riceve questi dati ma **NON li salva** nel DB
- Non esiste migrazione per aggiungere `recurrence_config JSONB`

**Impatto**:
- ❌ Attività settimanali mostrano eventi **ogni giorno** invece che solo nei giorni selezionati
- ❌ Attività giornaliere con giorni specifici NON funzionano correttamente
- ❌ Attività mensili con giorno del mese specifico NON funzionano
- ❌ Dati di ricorrenza vengono persi al salvataggio

**Schema Attuale** (database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql:232-256):
```sql
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  frequency VARCHAR NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'annual', 'as_needed', 'custom')),
  assigned_to VARCHAR NOT NULL,
  assignment_type VARCHAR NOT NULL CHECK (assignment_type IN ('role', 'staff', 'category')),
  -- ... altri campi ...
  -- ❌ MANCA: recurrence_config JSONB
);
```

**Schema Necessario**:
```sql
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS recurrence_config JSONB DEFAULT NULL;

COMMENT ON COLUMN public.tasks.recurrence_config IS
  'Configurazione ricorrenza: {
    custom_days: ["lunedi", "mercoledi", "venerdi"],
    day_of_month: 15
  }';
```

---

### 2. **FORM NON MOSTRA SELEZIONE GIORNI PER SETTIMANALE/GIORNALIERA**

**Status**: ❌ CRITICO - IMPLEMENTAZIONE MANCANTE

**Definizione** (GENERIC_TASK_FORM_DEFINITION.md:100-104):
```
Q3.2 - Giorni per Settimanale/Giornaliera:
- Per frequenza "settimanale" o "giornaliera", è **obbligatorio**
  selezionare almeno un giorno della settimana
- Mostra checkbox per tutti i 7 giorni
- Permette selezione di qualsiasi combinazione, anche tutti i 7 giorni (Q13)
```

**Implementazione Attuale** (GenericTaskForm.tsx:358-385):
```tsx
{/* Giorni custom se frequenza personalizzata */}
{formData.frequenza === 'custom' && (
  // ❌ Solo per 'custom', NON per 'settimanale' o 'giornaliera'
  <div className="md:col-span-2">
    <Label>Giorni della settimana *</Label>
    ...
  </div>
)}
```

**Fix Necessario**:
```tsx
{/* Mostra per custom, settimanale, giornaliera */}
{(formData.frequenza === 'custom' ||
  formData.frequenza === 'settimanale' ||
  formData.frequenza === 'giornaliera') && (
  <div className="md:col-span-2">
    <Label>Giorni della settimana *</Label>
    ...
  </div>
)}
```

---

### 3. **MANCA SELEZIONE GIORNO MESE PER FREQUENZA MENSILE**

**Status**: ❌ CRITICO - COMPONENTE MANCANTE

**Definizione** (GENERIC_TASK_FORM_DEFINITION.md:105-116):
```
Q4.4.2 - Mini Calendario per Mensile:
- Per frequenza "mensile", mostra **mini calendario** con tutti i giorni del mese
- Il calendario mostra:
  - Giorni aperti (bianchi, cliccabili) secondo configurazione calendario
  - Giorni chiusi (grigi, non cliccabili) secondo configurazione calendario
  - Giorno selezionato evidenziato in blu
- Usa `calendarSettings` per mostrare:
  - `open_weekdays`: Giorni della settimana aperti
  - `closure_dates`: Date di chiusura
- **Utente deve poter confermare inserimento attività anche se azienda è chiusa**
```

**Implementazione Attuale**: ❌ MANCA COMPLETAMENTE

**Fix Necessario**:
1. Creare componente `MonthDayPicker.tsx`
2. Aggiungere nel form quando `frequenza === 'mensile'`
3. Passare `calendarSettings` come prop
4. Validare `giornoMese` (1-31)

---

### 4. **INPUT ORARIO USA DUE CAMPI SEPARATI INVECE DI INPUT UNICO**

**Status**: ⚠️ MEDIO - UX NON OTTIMALE

**Definizione** (GENERIC_TASK_FORM_DEFINITION.md:93-97):
```
**Input Orario Unico (Q3):**
- Usa componente `TimeRangeInput` invece di due `TimeInput` separati
- Permette di digitare direttamente: "09:00-17:00" o selezionare con click
- Un solo click nella casella per impostare orario
```

**Implementazione Attuale** (GenericTaskForm.tsx:463-517):
```tsx
{/* Fascia Oraria Completamento */}
{formData.timeManagement?.completionType === 'timeRange' && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
    <div>
      <Label>Orario Inizio</Label>
      <TimeInput ... /> {/* ❌ Due input separati */}
    </div>
    <div>
      <Label>Orario Fine</Label>
      <TimeInput ... /> {/* ❌ invece di uno solo */}
    </div>
  </div>
)}
```

**Fix Necessario**:
- Creare/Usare componente `TimeRangeInput` per input singolo
- Formato: `"09:00-17:00"`

---

### 5. **FUNZIONE `expandRecurringTask` NON USA `custom_days` e `day_of_month`**

**Status**: ❌ CRITICO - LOGICA MANCANTE

**Implementazione Attuale** (useAggregatedEvents.ts:252-334):
```typescript
function expandRecurringTask(task, companyId, userId, type, completions, fiscalYearEnd) {
  // ...
  switch (frequency) {
    case 'daily':
      currentDate = addDays(currentDate, 1) // ❌ Genera OGNI giorno
      break
    case 'weekly':
      currentDate = addWeeks(currentDate, 1) // ❌ Genera OGNI settimana (stesso giorno)
      break
    case 'monthly':
      currentDate = addMonths(currentDate, 1) // ❌ Genera OGNI mese (stesso giorno)
      break
    case 'custom':
      // ❌ Non espande, ritorna un solo evento
      return [convertGenericTaskToEvent(...)]
  }
}
```

**Fix Necessario**:
```typescript
// Estrarre custom_days e day_of_month dal task.recurrence_config
const recurrenceConfig = task.recurrence_config || {}
const customDays = recurrenceConfig.custom_days || []
const dayOfMonth = recurrenceConfig.day_of_month

switch (frequency) {
  case 'daily':
    // Se ci sono custom_days, genera solo per quei giorni
    if (customDays.length > 0) {
      // Genera solo se il giorno della settimana è in customDays
      const dayName = getDayName(currentDate)
      if (customDays.includes(dayName)) {
        events.push(event)
      }
    } else {
      // Altrimenti genera per tutti i giorni
      events.push(event)
    }
    currentDate = addDays(currentDate, 1)
    break

  case 'weekly':
    // Se ci sono custom_days, genera per tutti i giorni specificati della settimana
    if (customDays.length > 0) {
      for (const day of customDays) {
        const eventDate = getNextDayOfWeek(currentDate, day)
        events.push(convertGenericTaskToEvent(task, companyId, userId, eventDate, completions))
      }
      currentDate = addWeeks(currentDate, 1)
    } else {
      // Altrimenti genera per lo stesso giorno ogni settimana
      events.push(event)
      currentDate = addWeeks(currentDate, 1)
    }
    break

  case 'monthly':
    // Se c'è day_of_month, genera solo per quel giorno
    if (dayOfMonth) {
      const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth)
      events.push(convertGenericTaskToEvent(task, companyId, userId, eventDate, completions))
    } else {
      events.push(event)
    }
    currentDate = addMonths(currentDate, 1)
    break
}
```

---

## 🟡 CONFLITTI NON GESTITI

### 6. **VALIDAZIONE NOMI DUPLICATI (Q6) - MANCANTE**

**Definizione** (GENERIC_TASK_FORM_DEFINITION.md:61-63):
```
**Q6 - Nomi Duplicati:**
- **Blocca** se stesso nome + stesso reparto + stessa frequenza (C)
- Mostra errore: "Esiste già un'attività con questo nome per questo reparto e frequenza"
```

**Implementazione Attuale**: ❌ MANCA COMPLETAMENTE

**Fix Necessario**:
```tsx
// Nel GenericTaskForm.tsx
interface GenericTaskFormProps {
  // ...
  existingTasks?: GenericTask[] // Aggiungere prop per task esistenti
}

// Validazione in validate()
const validate = (): boolean => {
  // ...

  // Q6 - Blocca nomi duplicati
  if (existingTasks) {
    const duplicate = existingTasks.find(task =>
      task.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
      task.department_id === (formData.departmentId === 'all' ? null : formData.departmentId) &&
      mapFrequency(task.frequency) === mapFrequency(formData.frequenza)
    )

    if (duplicate) {
      newErrors.name = 'Esiste già un\'attività con questo nome per questo reparto e frequenza'
    }
  }

  // ...
}
```

---

### 7. **WARNING STESSO DIPENDENTE FREQUENZA DIVERSA (Q7) - MANCANTE**

**Definizione** (GENERIC_TASK_FORM_DEFINITION.md:129-133):
```
**Q7 - Stesso Dipendente con Frequenza Diversa:**
- **Warning** (non blocca): "Questo dipendente ha già questa attività assegnata
  con una frequenza diversa" (B)
- Mostra toast warning ma permette submit
```

**Implementazione Attuale**: ❌ MANCA COMPLETAMENTE

**Fix Necessario**:
```tsx
// In handleSubmit(), prima di onSubmit()
if (formData.assegnatoADipendenteSpecifico && existingTasks) {
  const sameTaskDifferentFreq = existingTasks.find(task =>
    task.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
    task.assigned_to_staff_id === formData.assegnatoADipendenteSpecifico &&
    task.frequency !== mapFrequency(formData.frequenza)
  )

  if (sameTaskDifferentFreq) {
    toast.warning(
      'Questo dipendente ha già questa attività assegnata con una frequenza diversa',
      { autoClose: 5000 }
    )
  }
}

// Poi procedi con onSubmit(formData)
```

---

### 8. **RESET A CASCATA MANCANTE (Q3.1)**

**Definizione** (GENERIC_TASK_FORM_DEFINITION.md:66-78):
```
**Q3.1 - Reset Automatico:**
Quando si cambia il **Ruolo**:
- ✅ Categoria viene resettata a "all"
- ✅ Dipendente specifico viene resettato
- ✅ Reparto **NON** viene resettato (può rimanere lo stesso)
```

**Implementazione Attuale** (GenericTaskForm.tsx:245-251):
```tsx
// ✅ CORRETTO - Reset categoria e dipendente quando cambia ruolo
onValueChange={value =>
  updateField({
    assegnatoARuolo: value as StaffRole,
    assegnatoACategoria: 'all',
    assegnatoADipendenteSpecifico: undefined
  })
}
```

**Status**: ✅ IMPLEMENTATO CORRETTAMENTE

---

### 9. **VALIDAZIONE GIORNI MANCANTE PER SETTIMANALE/GIORNALIERA**

**Problema**: La validazione attualmente controlla solo `custom`:

```tsx
if (formData.frequenza === 'custom' && (!formData.giorniCustom || formData.giorniCustom.length === 0)) {
  newErrors.giorni = 'Seleziona almeno un giorno per frequenza personalizzata'
}
```

**Fix Necessario**:
```tsx
// Validazione per custom, settimanale, giornaliera
if ((formData.frequenza === 'custom' ||
     formData.frequenza === 'settimanale' ||
     formData.frequenza === 'giornaliera') &&
    (!formData.giorniCustom || formData.giorniCustom.length === 0)) {
  newErrors.giorni = 'Seleziona almeno un giorno della settimana'
}

// Validazione per mensile
if (formData.frequenza === 'mensile' && !formData.giornoMese) {
  newErrors.giornoMese = 'Seleziona il giorno del mese'
}
```

---

## 📊 RIEPILOGO GAP

### Critici (Bloccanti)
1. ❌ **DB**: Manca colonna `recurrence_config JSONB` in `tasks` table
2. ❌ **Form**: Selezione giorni solo per custom, non per settimanale/giornaliera
3. ❌ **Form**: Manca selezione giorno mese per mensile (componente `MonthDayPicker`)
4. ❌ **Logic**: `expandRecurringTask` non usa `custom_days` e `day_of_month`
5. ❌ **Validation**: Manca validazione nomi duplicati (Q6)

### Medi (Funzionalità Mancanti)
6. ⚠️ **UX**: Input orario usa due campi invece di uno solo
7. ⚠️ **Validation**: Manca warning stesso dipendente frequenza diversa (Q7)
8. ⚠️ **Validation**: Validazione giorni solo per custom, non per settimanale/giornaliera/mensile

### Minori (Future Enhancement)
9. 💡 **Form**: Limite caratteri note (2000) - definito ma non implementato con contatore
10. 💡 **Warning**: Q9 (dipendente rimosso) e Q10 (reparto disattivato) - implementare in componenti gestione

---

## ✅ COSA FUNZIONA CORRETTAMENTE

1. ✅ **Reset a cascata** (Q3.1): Ruolo → Categoria → Dipendente
2. ✅ **Time Management**: Salvataggio corretto di `time_management` JSONB
3. ✅ **Filtri a cascata**: Ruolo → Categoria → Dipendente filtrato correttamente
4. ✅ **Reset form** dopo submit (Q5)
5. ✅ **Validazione campi obbligatori**: Nome, Frequenza, Ruolo, Reparto
6. ✅ **Orari notturni**: Supporto per overnight time (Q2.3)
7. ✅ **CompletionType**: Gestione corretta di 'none', 'timeRange', 'startTime', 'endTime'

---

## 🎯 PIANO DI AZIONE CONSIGLIATO

### Priority 1 (URGENT - Funzionalità Base)
1. **Migration DB**: Aggiungere `recurrence_config JSONB` a `tasks` table
2. **Form**: Mostrare selezione giorni per settimanale/giornaliera/custom
3. **Form**: Aggiungere campo `giornoMese` nel FormData
4. **Logic**: Salvare `custom_days` e `day_of_month` in `recurrence_config`
5. **Logic**: Modificare `expandRecurringTask` per usare `recurrence_config`

### Priority 2 (HIGH - Validazioni Critiche)
6. **Validation**: Implementare Q6 (blocca nomi duplicati)
7. **Validation**: Implementare Q7 (warning stesso dipendente)
8. **Validation**: Validare giorni per settimanale/giornaliera/mensile

### Priority 3 (MEDIUM - UX Improvements)
9. **Component**: Creare `MonthDayPicker` per selezione giorno mese
10. **Component**: Creare/Usare `TimeRangeInput` per input orario unico
11. **UI**: Aggiungere contatore caratteri note (2000 max)

### Priority 4 (LOW - Future)
12. **Warning**: Q9 (warning all'eliminazione dipendente)
13. **Warning**: Q10 (warning quando reparto disattivato)

---

## 📝 FILE DA MODIFICARE

### 1. Database Migration
- ✅ Creare: `database/migrations/014_add_recurrence_config_to_tasks.sql`

### 2. Componenti UI
- ✅ Modificare: `src/features/calendar/components/GenericTaskForm.tsx`
- ✅ Creare: `src/components/ui/MonthDayPicker.tsx` (opzionale Priority 3)
- ✅ Creare: `src/components/ui/TimeRangeInput.tsx` (opzionale Priority 3)

### 3. Hook e Logica
- ✅ Modificare: `src/features/calendar/hooks/useGenericTasks.ts`
- ✅ Modificare: `src/features/calendar/hooks/useAggregatedEvents.ts`

### 4. Types
- ✅ Aggiornare: `src/features/calendar/hooks/useGenericTasks.ts` (interface GenericTask)

### 5. CalendarPage
- ✅ Modificare: `src/features/calendar/CalendarPage.tsx` (passare `existingTasks` e `calendarSettings`)

---

## 🧪 TEST DA ESEGUIRE DOPO FIX

1. ✅ Creare attività settimanale con giorni specifici (es. lunedì, mercoledì, venerdì)
   - Verificare che nel calendario appaiano SOLO i 3 eventi (non 7)

2. ✅ Creare attività giornaliera con giorni specifici (es. tutti i giorni feriali)
   - Verificare che nel calendario appaiano SOLO dal lunedì al venerdì

3. ✅ Creare attività mensile con giorno 15
   - Verificare che nel calendario appaia SOLO il giorno 15 di ogni mese

4. ✅ Tentare di creare attività duplicata (stesso nome + reparto + frequenza)
   - Verificare che mostri errore e blocchi submit

5. ✅ Assegnare stessa attività a stesso dipendente con frequenza diversa
   - Verificare che mostri warning ma permetta submit

6. ✅ Creare attività con orario notturno (22:00-06:00)
   - Verificare badge "🌙 Orario notturno"

---

**Fine Analisi**
