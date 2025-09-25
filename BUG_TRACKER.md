# HACCP Business Manager - Bug Tracker & Fix Registry

## 🎯 SISTEMA DI TRACCIAMENTO

### 📊 STATISTICHE CORRENTI

- **Bug Attivi**: 2
- **Bug Risolti**: 13+
- **Ultimo Fix**: 25/01/2025

## 🐛 BUG ATTIVI

### 🔥 CRITICI (App non funziona)

_Nessuno_

### ⚠️ ALTI (Funzionalità compromesse)

_Nessuno_

### 📋 MEDI (Problemi minori)

#### B001 - Errori 400 su richieste Clerk

- **Descrizione**: URL redirect complessi causano errori 400
- **File coinvolti**: Auth configuration
- **Impatto**: Warning nel console, non blocca funzionalità
- **Assegnazione**: 🎯 CURSOR (config semplice)
- **Status**: 📋 Aperto
- **Priorità**: Media

#### B002 - Errore Supabase 406 su companies endpoint

- **Descrizione**: `Failed to load resource: the server responded with a status of 406`
- **URL**: `neilla documentazionercdyadsluzzzsybwrmlz.supabase.co/rest/v1/companies`
- **File coinvolti**: Supabase RLS, companies table
- **Impatto**: Possibile problema di accesso ai dati aziendali
- **Assegnazione**: ⚡ CLAUDE (database/RLS)
- **Status**: 📋 Aperto
- **Priorità**: Media

## ✅ BUG RISOLTI (Ultimi 10)

### 25/01/2025 - CORS Conflict Sentry/Clerk - RISOLTO

- **Fix by**: Claude
- **Files**: `src/main.tsx`, `BHM-v.2-Gemini/src/main.tsx`
- **Commit**: N/A (pre-commit hooks failed)
- **Dettagli**:
  - Disabilitato Sentry in development mode
  - Risolto conflitto CORS con header `sentry-trace` e `baggage`
  - Autenticazione Clerk ora funzionante
  - Report completo: `Project_Knowledge/Session_Reports/2025-01-25_CORS-FIX-SESSION-COMPLETED.md`

### 25/01/2025 - TypeScript Conservation Errors - RISOLTO

- **Fix by**: Gemini
- **Files**: `src/features/conservation/*`
- **Commit**: f19d723
- **Dettagli**:
  `Project_Knowledge/Bug_Reports/Fixed/Critical/2025-09-25_typescript-conservation-module-errors.md`

## 🔍 GUIDA DIAGNOSI RAPIDA

### 🎯 CURSOR può gestire:

- Errori TypeScript standard
- Import mancanti
- Syntax errors
- Dependency updates
- UI bugs minori

### ⚡ CLAUDE/GEMINI deve gestire:

- **Architettura errors** (restructuring)
- **Auth integration issues** (Clerk/Supabase)
- **Database/RLS problems** (complex queries)
- **Performance critical** (optimization)
- **Security issues** (vulnerabilities)
- **Testing infrastructure** (advanced setup)
- **Build/deployment** (configuration)

## 📝 TEMPLATE BUG REPORT

```markdown
### [ID] - [TITOLO] - [STATUS]

- **Descrizione**:
- **File coinvolti**:
- **Impatto**:
- **Assegnazione**: 🎯 CURSOR / ⚡ CLAUDE/GEMINI
- **Priorità**: CRITICA/ALTA/MEDIA/BASSA
- **Riproducibilità**: Sempre/Intermittente/Rara
- **Fix stimato**:
```

## 🎯 PROSSIMI FIX PROGRAMMATI

1. **Clerk 400 errors** - Semplificare redirect URLs
2. **Test user setup** - Per automation completa

---

_Aggiornare ad ogni bug found/fixed_
