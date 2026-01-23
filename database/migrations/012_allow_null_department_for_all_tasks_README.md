# Migrazione 012: Allow NULL department_id for "All Departments" Tasks

## 📋 Riepilogo

Questa migrazione permette di salvare `NULL` nel campo `department_id` della tabella `tasks` quando un'attività è assegnata a "Tutti" i reparti.

## ✅ Compatibilità

- **Idempotente**: Può essere eseguita più volte senza errori
- **Compatibile con migrazione 011**: Se la migrazione 011 (make_department_required_for_tasks) è già stata eseguita, questa migrazione la "sovrascrive" permettendo NULL di nuovo
- **Backward compatible**: I task esistenti con `department_id` non null continuano a funzionare normalmente

## 🔄 Logica

- `department_id = NULL` → Attività visibile a **tutti i reparti**
- `department_id = UUID` → Attività visibile solo al **reparto specifico**

## 📝 Modifiche Applicate

### Database
- ✅ Campo `department_id` ora nullable
- ✅ Commento aggiornato per documentare il comportamento

### Frontend
- ✅ Form: Aggiunta opzione "Tutti" nel select Reparto
- ✅ Validazione: Accetta "all" come valore valido
- ✅ Filtri: Tutti i filtri gestiscono correttamente NULL come "visibile a tutti"
- ✅ Type safety: Interfaccia `GenericTask` aggiornata con `department_id?: string | null`

### File Modificati
1. `database/migrations/012_allow_null_department_for_all_tasks.sql`
2. `src/features/calendar/components/GenericTaskForm.tsx`
3. `src/features/calendar/CalendarPage.tsx`
4. `src/features/calendar/hooks/useGenericTasks.ts`
5. `src/features/calendar/hooks/useMacroCategoryEvents.ts`
6. `src/features/calendar/hooks/useAggregatedEvents.ts`
7. `src/features/calendar/utils/eventTransform.ts`
8. `src/types/calendar-filters.ts`

## 🧪 Testing

Prima di eseguire in produzione, verificare:

1. ✅ Creazione task con reparto specifico → `department_id` = UUID
2. ✅ Creazione task con "Tutti" → `department_id` = NULL
3. ✅ Filtri calendario: task con NULL visibili a tutti i reparti
4. ✅ Task esistenti continuano a funzionare
5. ✅ Export/Import non rompe con NULL

## ⚠️ Note Importanti

- Le **RLS policies** non filtrano per `department_id`, quindi NULL è sicuro
- I **filtri applicativi** sono stati aggiornati per gestire NULL correttamente
- La migrazione è **idempotente** e può essere eseguita in sicurezza

