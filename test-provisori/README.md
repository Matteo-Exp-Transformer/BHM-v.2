Scopo
- Raccolta provvisoria di template per i test automatici sulla pagina Attività (Calendario + MacroCategoryModal).
- Ogni template mantiene aderente i dati di seed alle tabelle reali di Supabase e alle strutture `CalendarEvent`.
- I file di questa cartella non sono test eseguibili: fungono da scheletro che altri agenti compileranno con dati reali.

Come usare i template
- Per ogni scenario (A-T) completare i placeholder `__...__` con gli ID reali di company, reparti, staff, prodotti ecc.
- Quando il test richiede seed DB usare gli helper `build*Seed` e serializzare il risultato verso Supabase (o nel mock DB) prima dell'esecuzione del test.
- Quando il test lavora direttamente con componenti React usare gli helper `build*EventTemplate` per creare `CalendarEvent` coerenti con `determineEventType`, `calculateEventStatus` e `convertEventToItem`.
- Impostare l'orologio di test su `BASE_NOW` (vedi file TypeScript) per rendere deterministici gli stati calcolati (`pending`, `overdue`, `future`).
- Rimuovere o spostare i template fuori da `test-provisori` quando vengono promossi a test ufficiali.

Riferimenti rapidi
- Componente principale: `src/features/calendar/CalendarPage.tsx` (gestione filtri, onEventClick, viewBasedEvents, statistiche).
- Calendario: `src/features/calendar/Calendar.tsx` (apertura MacroCategoryModal via `onMacroCategorySelect`).
- Modal macro-categorie: `src/features/calendar/components/MacroCategoryModal.tsx` (filtri modale, `convertEventToItem`, completamento task/manutenzioni).
- Aggregazione dati: `src/features/calendar/hooks/useAggregatedEvents.ts`, `useMacroCategoryEvents.ts`, `useFilteredEvents.ts`, `useGenericTasks.ts`.
- Tipi condivisi: `src/types/calendar.ts`, `src/types/calendar-filters.ts`, `src/types/conservation.ts`.

