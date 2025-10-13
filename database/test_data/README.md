# 📁 Database Test Data & Documentation

Questa cartella contiene guide e documentazione per testing e configurazione del database.

## 📚 Guide di Setup

### Email & Inviti
- **`CONFIGURA_GMAIL_SMTP.md`** - Configurazione SMTP Gmail per invio email automatiche
- **`SETUP_EMAIL_AUTOMATICHE.md`** - Setup completo sistema email
- **`GENERA_EMAIL_INVITI.md`** - Come generare inviti via email
- **`FIX_SIGNUP_RAPIDO.md`** - Fix per signup rapido senza invito

### Testing & Debug
- **`DEBUG_FILTRAGGIO_CALENDARIO.md`** - Debug filtri calendario
- **`FIX_FILTRAGGIO_CALENDARIO_RIEPILOGO.md`** - Riepilogo fix calendario
- **`README_TEST_TASKS.md`** - Documentazione per test task

## 📖 Guide Complete

### Flow Testing
- **`FLUSSO_TEST_COMPLETO.md`** - Workflow completo di test dall'inizio alla fine
- **`QUICK_START.md`** - Guida rapida per iniziare
- **`START_HERE.md`** - Punto di partenza per nuovi sviluppatori

### Status & Reports
- **`STATUS_POST_RESET.md`** - Checklist stato dopo reset database
- **`RIEPILOGO_MODIFICHE.md`** - Riepilogo modifiche effettuate
- **`ESEGUI_QUESTO.md`** - Istruzioni rapide per operazioni comuni

## 🚀 Per Iniziare

### Nuovo Setup
1. Leggi **`START_HERE.md`** per orientarti
2. Segui **`QUICK_START.md`** per setup rapido
3. Usa **`database/query/FULL_DATABASE_RESET.sql`** per reset completo

### Testing Completo
1. Esegui reset con `database/query/FULL_DATABASE_RESET.sql`
2. Segui **`FLUSSO_TEST_COMPLETO.md`** passo-passo
3. Verifica con `database/query/VERIFICA_DATABASE_COMPLETA.sql`

### Setup Email
1. Leggi **`CONFIGURA_GMAIL_SMTP.md`**
2. Applica configurazione da **`SETUP_EMAIL_AUTOMATICHE.md`**
3. Testa con **`GENERA_EMAIL_INVITI.md`**

## 📂 Struttura Cartelle Database

```
database/
├── query/              ← Query SQL pronte all'uso
│   ├── FULL_DATABASE_RESET.sql
│   ├── VERIFICA_DATABASE_COMPLETA.sql
│   ├── CONTEGGIO_RAPIDO.sql
│   ├── RECUPERA_INVITE_LINKS.sql
│   ├── GET_MY_IDS.sql
│   ├── FIX_USER_SESSIONS.sql
│   ├── ELIMINA_COMPANY_SPECIFICA.sql
│   └── README.md
│
├── test_data/          ← Guide e documentazione (questa cartella)
│   ├── README.md       ← Questo file
│   ├── *_SETUP*.md     ← Guide di setup
│   ├── *_TEST*.md      ← Guide di test
│   └── *_DEBUG*.md     ← Guide di debug
│
├── migrations/         ← Migrazioni schema database
├── policies/           ← Row Level Security policies
├── triggers/           ← Database triggers
└── functions/          ← Stored procedures e funzioni
```

## 💡 Tips

- **Prima di un Reset**: Fai sempre backup su Supabase Dashboard
- **Query SQL**: Usa la cartella `database/query/` per query pronte
- **Testing**: Segui sempre `FLUSSO_TEST_COMPLETO.md` per test completi
- **Email**: Testa l'invio email prima di usare in produzione
- **Debug**: Controlla `STATUS_POST_RESET.md` dopo ogni reset

## 🔗 Link Utili

- [Supabase Dashboard](https://supabase.com/dashboard)
- [SQL Editor su Supabase](https://supabase.com/dashboard/project/_/sql)
- Documentazione Migrations: `../migrations/README.md`
- Documentazione Query: `../query/README.md`

