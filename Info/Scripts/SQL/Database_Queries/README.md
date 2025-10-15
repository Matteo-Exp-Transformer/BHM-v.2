# 📁 Database Query Utilities

Questa cartella contiene query SQL organizzate e pronte all'uso per gestire il database.

## 📊 Query di Verifica

### `CONTEGGIO_RAPIDO.sql`
Query veloce per vedere il conteggio di tutte le tabelle principali.
**Quando usarla:** Per un check rapido dello stato del database.

### `VERIFICA_DATABASE_COMPLETA.sql`
Verifica completa con dettagli su tutte le tabelle.
**Quando usarla:** Per un'analisi approfondita del database.
**Nota:** Esegui ogni query separatamente!

### `GET_MY_IDS.sql`
Recupera user_id, company_id, staff_id per una specifica email.
**Quando usarla:** Per trovare gli ID di un utente specifico.
**Nota:** Sostituisci l'email nella query.

## 🔗 Query per Inviti

### `RECUPERA_INVITE_LINKS.sql`
Mostra tutti i link inviti generati (usati e pending).
**Quando usarla:** Per recuperare i link inviti dopo l'onboarding o il reset.

## 🔧 Query di Fix

### `FIX_USER_SESSIONS.sql`
Corregge le sessioni utente senza company_id.
**Quando usarla:** Se gli utenti hanno problemi di accesso o company_id NULL.

### `ELIMINA_COMPANY_SPECIFICA.sql`
Elimina una company specifica e tutti i suoi dati.
**⚠️ ATTENZIONE:** Operazione irreversibile! Elimina CASCADE.

## 🚀 Workflow Consigliato

### Dopo un Reset Database:
1. `FULL_DATABASE_RESET.sql` (in `database/test_data`)
2. `RECUPERA_INVITE_LINKS.sql` - per ottenere il link del primo admin
3. `CONTEGGIO_RAPIDO.sql` - per verificare lo stato

### Durante lo Sviluppo:
1. `CONTEGGIO_RAPIDO.sql` - check rapido
2. `VERIFICA_DATABASE_COMPLETA.sql` - analisi dettagliata (esegui sezione per sezione)

### Per Debug:
1. `GET_MY_IDS.sql` - trova gli ID di un utente
2. `FIX_USER_SESSIONS.sql` - se ci sono problemi di sessione

## 💡 Tips

- **Esegui sempre una query alla volta** per vedere i risultati
- **Sostituisci i placeholder** (email, ID) prima di eseguire
- **Fai backup** prima di eseguire query di DELETE
- Le query commentate (`--`) vanno decommentate e personalizzate prima dell'uso

