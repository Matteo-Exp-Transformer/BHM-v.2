# Handover — Agente 1 (UI/Forms) — P0-1 Login email/password

Ruolo: Implementazione UI/Forms e validazioni robuste per login.

## Contesto
- Obiettivo: Login sicuro con email/password (Supabase Auth) con validazioni e messaggi di errore sicuri (no enumeration).
- File/funzionalità attese:
  - `src/features/auth/components/LoginForm.tsx`
  - `src/features/auth/hooks/useAuth.ts` (esposizione `signIn`)
  - `src/features/auth/services/authService.ts` (interfaccia invocata dall’hook)
  - Schemi/validatori: `src/features/auth/validators/loginSchema.ts`

## Task
- Implementa `LoginForm` con:
  - Validazioni sincrone (email RFC, password policy parametriche)
  - Stato UI: idle/loading/success/error
  - Mappatura errori tecnici → messaggi generici, localizzabili
  - Backoff/lock client-side dopo N tentativi falliti in finestra breve
- Integra con `useAuth.signIn` fornendo payload tipizzato.
- Non rivelare se l’utente esiste; messaggi neutrali.

## Definition of Done
- Form accessibile (ruoli, labels, aria), data-testid definiti
- Validatori unit-testati (≥95% statements nel file validator)
- Test d’integrazione del form: submit success/failure, lock dopo N errori
- E2E base: credenziali corrette/errate, messaggi sicuri, lock funziona
- Lint e type-check ok; nessun `any`

## Test da eseguire
- Unit: `npm run test`
- Coverage: `npm run test:coverage`
- E2E (UI base/forms): `npm run test:agent2` (Forms) e `npm run test:agent1` (UI Base)

## Output richiesti
- Codice UI/Forms
- Test unit/integration + snapshot se utile
- Aggiornamento `Production/Sessione_di_lavoro/Agente_1/2025-10-20/README_SESSIONE.md`

## Dove salvare
- `Production/Sessione_di_lavoro/Agente_1/2025-10-20/`

## Note
- Segui convenzioni progetto (TypeScript strict, path alias `@/`)
- Non introdurre dipendenze non approvate
