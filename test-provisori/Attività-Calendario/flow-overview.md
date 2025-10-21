## Onboarding Flow – Architettura sintetica

1. **Autenticazione & contesto**
   - `useAuth.ts` fornisce `user`, `companyId`, ruoli e stato di configurazione.
   - I test devono mockare o predisporre `AuthContext` coerente con l’utente che esegue il wizard (tipicamente admin o responsabile).

2. **Wizard principale (`OnboardingWizard.tsx`)**
   - Mantiene lo stato condiviso (`onboardingData`, step corrente, validazione di ciascun form).
   - Orchestrazione:
     1. raccoglie dati azienda, reparti, staff, configurazioni iniziali;
     2. delega a helper/service per la persistenza su Supabase;
     3. alla fine invoca `onComplete`, eventualmente reindirizzando alla dashboard.
   - Dipendenze dirette:
     - tipi da `src/types/onboarding.ts`;
     - helper dal file `onboardingHelpers.ts`;
     - servizi inviti (`inviteService.ts`) per creare gli account staff;
     - hook auth per conoscere l’utente che sta completando l’onboarding.

3. **Helper di supporto (`onboardingHelpers.ts`)**
   - Funzioni principali:
     - `deleteCompanyData`/`clearAllStorage`: reset environment di test prima di un onboarding completo.
     - `createOrUpdateCompany` / `seedDepartmentsAndStaff` (nomi da confermare nel file) per scrivere i dati nella giusta sequenza.
   - Richiedono `supabase` client e service key per bypassare RLS quando necessario.

4. **Invite service (`inviteService.ts`)**
   - Espone `createInviteToken` e `sendInviteEmail`.
   - Interagisce con `supabase.functions.invoke` / `supabase.auth.admin` (controllare implementazione) e gestisce feedback via toast.
   - Nei test integrare stub/mocking per evitare email reali; utilizzare `SUPABASE_SERVICE_KEY` se si testano query reali.

5. **Dataset/Fixtures**
   - Per test end-to-end, usare le info in `.env.test` (credenziali utente di prova).
   - Per test unitari/integrazione, creare mock coerenti con i tipi definiti in `src/types/onboarding.ts`.
   - `tests/onboarding_full_flow.test.tsx` mostra lo scenario di riferimento (wizard completo).

## Suggerimenti operativi

- Prima di lanciare un test completo, pulire i dati company tramite gli helper (evita duplicati di reparti/staff).
- Se il test coinvolge inviti, assicurarsi che `SUPABASE_SERVICE_KEY` e le policy RLS siano configurate; in alternativa mockare i servizi di invito.
- Per velocizzare i test, mockare `toast` e l’eventuale routing (`next/router` o `react-router`, a seconda dell’implementazione).

