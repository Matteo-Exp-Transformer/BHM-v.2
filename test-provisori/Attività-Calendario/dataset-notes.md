## Dataset & Variabili per i test onboarding

### Variabili d'ambiente (file `.env.test`)
- `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`: credenziali dell’utente test che esegue il wizard (usare account con permessi admin/responsabile).
- `SUPABASE_SERVICE_KEY`: necessaria se i test eseguono operazioni privilegiate (es. creazione inviti, reset dati). Evitare di committare valori reali.
- `BASE_URL`: puntare all’app in esecuzione durante gli E2E (default `http://localhost:3000`).

### Dati minimi per scenari comuni
| Scenario | Dati richiesti | Note |
| --- | --- | --- |
| Primo onboarding azienda | Nessuna company preesistente, utilizzare `deleteCompanyData` prima del test | Assicurarsi che l’utente test sia associato alla company target o che l’onboarding preveda la creazione contestuale. |
| Invito staff multiplo | Mock di `inviteService` oppure predisporre staff in Supabase con email fittizie | Preferire mocking per evitare invio reale. |
| Ripresa wizard a metà | Popolare `onboardingData` nello storage locale (usare gli helper `safeSetItem`) con step > 0 | Verificare che `OnboardingWizard` carichi lo stato persistito. |

### Consigli su fixture
- Quando si generano reparti/staff fittizi, assicurarsi che gli ID rispettino il formato `uuid` se i servizi Supabase li validano.
- Per test unitari sugli helper, mockare `supabase` restituendo `Promise.resolve({ data: ..., error: null })`.
- Nei test E2E, isolare il dominio email (es. `utente+test@bhm.local`) per evitare conflitti con inviti precedenti.

