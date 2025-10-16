# Debug: Fix Completamento Eventi Modal Laterale

## Problemi Identificati e Risolti

### 1. **Count nel Modal non si aggiornava correttamente**

**Problema**: Il count degli eventi nel modal laterale non si aggiornava dopo il completamento di un evento.

**Causa**: La logica di calcolo del count era corretta, ma mancava un'adeguata invalidazione delle query React Query.

**Soluzione**:
- Aggiunta invalidazione esplicita di `['macro-category-events']` dopo ogni completamento
- Migliorata la logica di invalidazione per includere anche `['task-completions']`

### 2. **Logica di Matching dei Completamenti**

**Problema**: La logica per trovare i completamenti degli eventi non funzionava correttamente in alcuni casi.

**Causa**: Il matching tra `dueDate` dell'evento e `period_start/period_end` del completamento era troppo rigido.

**Soluzione**:
```typescript
// Vecchia logica (troppo rigida)
return eventTime >= completionStart && eventTime <= completionEnd

// Nuova logica (più flessibile)
return (eventTime >= completionStart && eventTime <= completionEnd) ||
       (c.completed_at.getTime() >= eventDayStart && c.completed_at.getTime() <= eventDayEnd)
```

### 3. **Aggiornamento UI del Modal**

**Problema**: Il modal non si aggiornava immediatamente dopo il completamento.

**Soluzione**:
- Aggiunta invalidazione immediata delle query React Query
- Mantenuto il delay di 800ms per permettere alle query di completarsi
- Aggiunto refresh forzato con `window.dispatchEvent(new Event('calendar-refresh'))`

## File Modificati

### 1. `src/features/calendar/hooks/useMacroCategoryEvents.ts`
- **Riga 542-548**: Migliorata logica di matching dei completamenti
- **Riga 362**: Aggiunto commento esplicativo per il count

### 2. `src/features/calendar/components/CategoryEventsModal.tsx`
- **Riga 118-121**: Aggiunta invalidazione di `['task-completions']`
- **Riga 444-448**: Invalidazione immediata dopo completamento mansioni
- **Riga 541-545**: Invalidazione immediata dopo ripristino mansioni

## Test da Eseguire

1. **Completamento Mansione Generica**:
   - Aprire modal laterale per una data
   - Completare una mansione
   - Verificare che il count si aggiorni immediatamente
   - Verificare che la mansione appaia nella sezione "Completate"

2. **Completamento Manutenzione**:
   - Aprire modal laterale per una data
   - Completare una manutenzione
   - Verificare che il count si aggiorni immediatamente
   - Verificare che la manutenzione appaia nella sezione "Completate"

3. **Ripristino Mansione**:
   - Ripristinare una mansione completata
   - Verificare che torni nella sezione "Attive"
   - Verificare che il count si aggiorni

## Logica di Completamento

### Per Mansioni Generiche (`generic_tasks`)
1. Chiama `completeTask()` da `useGenericTasks`
2. Inserisce record in `task_completions` con periodo calcolato
3. Invalida tutte le query React Query
4. Aggiorna UI immediatamente

### Per Manutenzioni (`maintenance`)
1. Aggiorna direttamente `maintenance_tasks` con status 'completed'
2. Invalida tutte le query React Query
3. Forza refresh del calendario
4. Aggiorna UI immediatamente

## Note Importanti

- Il sistema ora supporta completamenti anche per eventi futuri (con warning)
- La logica di matching è più robusta e gestisce edge cases
- L'aggiornamento UI è più reattivo grazie alle invalidazioni immediate
- Il count nel modal ora riflette correttamente lo stato degli eventi

## Debugging

Per debug, controllare:
1. Console per errori React Query
2. Network tab per chiamate API
3. Stato delle query in React Query DevTools
4. Log del completamento nelle funzioni `completeTask` e `handleCompleteMaintenance`


