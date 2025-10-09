# 📁 NoClerk - Documentazione Database & Schema

**Versione**: 1.0.0  
**Data**: 9 Gennaio 2025  
**Stato**: ✅ Produzione Ready

---

## 🎯 SCOPO DELLA CARTELLA

Questa cartella contiene tutta la documentazione necessaria per garantire **compliance perfetta** tra:
- Schema database Supabase PostgreSQL
- Interfacce TypeScript frontend
- Query e operazioni database
- Row Level Security (RLS) policies
- Sistema di autenticazione Supabase Auth

---

## 📚 FILE DISPONIBILI

### 1. `SCHEMA_ATTUALE.md` 📊
**Documentazione completa dello schema database**

**Cosa contiene**:
- ✅ Descrizione dettagliata di tutte le 19 tabelle
- ✅ Campi, tipi, constraints e default values
- ✅ Relazioni e foreign keys
- ✅ Indici per performance
- ✅ Trigger e funzioni automatiche
- ✅ Diagramma ER testuale
- ✅ Statistiche storage e manutenzione

**Quando usarlo**:
- 📖 Riferimento completo dello schema
- 🔍 Capire relazioni tra tabelle
- 🛠️ Pianificare modifiche allo schema
- 📊 Analizzare performance database

**Link**: [SCHEMA_ATTUALE.md](./SCHEMA_ATTUALE.md)

---

### 2. `GLOSSARIO_NOCLERK.md` 📖
**Guida sviluppatori per compliance TypeScript ↔ Database**

**Cosa contiene**:
- ✅ Interfacce TypeScript complete per tutte le tabelle
- ✅ Enum types esatti (StaffRole, TaskStatus, ProductStatus, ecc.)
- ✅ Mapping tipi PostgreSQL → TypeScript
- ✅ Query patterns comuni con esempi
- ✅ RLS helper functions reference
- ✅ Migration guide Clerk → Supabase Auth
- ✅ Validation rules e constraints
- ✅ Best practices e checklist

**Quando usarlo**:
- 💻 Scrivere codice TypeScript allineato al database
- 🔍 Verificare tipi e enum corretti
- 📝 Implementare nuove feature
- 🐛 Debugging problemi di tipo
- ✅ Code review e validazione

**Link**: [GLOSSARIO_NOCLERK.md](./GLOSSARIO_NOCLERK.md)

---

### 3. `STAFF_DEPARTMENTS_RELATION.md` 👥
**Guida completa alla relazione Many-to-Many Staff ↔ Departments**

**Cosa contiene**:
- ✅ Spiegazione dettagliata della relazione Many-to-Many
- ✅ Schema database e esempi dati
- ✅ Interfacce TypeScript specifiche
- ✅ 7+ query patterns per gestire l'assegnazione
- ✅ React hooks completi (useAssignDepartments, ecc.)
- ✅ UI/UX best practices per onboarding
- ✅ Validation rules frontend + backend
- ✅ Troubleshooting comuni

**Quando usarlo**:
- 🎓 Durante l'onboarding per assegnare reparti a dipendenti
- 🔧 Implementare gestione reparti nella UI
- 📊 Creare report e statistiche per reparto
- 🐛 Risolvere problemi con department_assignments
- 💡 Capire come funziona la relazione array-based

**Link**: [STAFF_DEPARTMENTS_RELATION.md](./STAFF_DEPARTMENTS_RELATION.md)

---

## 🚀 QUICK START

### Per Nuovi Sviluppatori

1. **Prima cosa**: Leggi `SCHEMA_ATTUALE.md` per capire la struttura database
2. **Seconda cosa**: Studia `GLOSSARIO_NOCLERK.md` per le interfacce TypeScript
3. **Terza cosa**: Leggi `STAFF_DEPARTMENTS_RELATION.md` per capire la relazione Many-to-Many più importante
4. **Quarta cosa**: Usa il glossario come riferimento durante lo sviluppo

### Per Feature Nuove

1. Consulta `SCHEMA_ATTUALE.md` per capire le tabelle coinvolte
2. Copia le interfacce da `GLOSSARIO_NOCLERK.md`
3. Segui i query patterns e best practices del glossario
4. Verifica compliance con checklist in fondo al glossario

### Per Debugging

1. Controlla `SCHEMA_ATTUALE.md` per constraints e relazioni
2. Verifica i tipi in `GLOSSARIO_NOCLERK.md`
3. Controlla enum values corretti
4. Usa query patterns di esempio

---

## 🔄 WORKFLOW AGGIORNAMENTI

### Quando modifichi lo schema database

1. ✅ Aggiorna le tabelle in Supabase
2. ✅ Aggiorna `SCHEMA_ATTUALE.md` con le modifiche
3. ✅ Aggiorna interfacce TypeScript in `GLOSSARIO_NOCLERK.md`
4. ✅ Aggiorna query patterns se necessario
5. ✅ Testa le modifiche
6. ✅ Commenta le modifiche nel changelog (in fondo a ogni file)

### Quando aggiungi nuove interfacce TypeScript

1. ✅ Verifica che corrispondano esattamente allo schema in `SCHEMA_ATTUALE.md`
2. ✅ Aggiungi l'interfaccia in `GLOSSARIO_NOCLERK.md`
3. ✅ Aggiungi enum types se necessari
4. ✅ Aggiungi esempi di utilizzo

---

## 📋 RIFERIMENTI ESTERNI

### Setup e Configurazione
- **Setup Completo**: `../SUPABASE_MANUAL_SETUP.md`
- **Istruzioni Rapide**: `../ISTRUZIONI_SETUP_NUOVO_PROGETTO.md`
- **Schema SQL**: `../database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql`

### Migrazione Clerk → Supabase
- **Migration Planning**: `../MIGRATION_PLANNING.md`
- **Migration Tasks**: `../MIGRATION_TASKS.md`
- **Auth Setup**: `../database/migrations/001_supabase_auth_setup.sql`
- **RLS Functions**: `../database/functions/rls_helpers.sql`
- **RLS Policies**: `../database/policies/rls_policies.sql`

### Report e Analisi
- **Verifica Schema**: `../Report Agenti/1_VERIFICA_SCHEMA_SQL_2025_01_09.md`

---

## 🎯 OBIETTIVO COMPLIANCE

**Regola d'oro**: Lo schema database e il codice TypeScript devono essere **SEMPRE** allineati.

### Checklist Compliance ✅

- [ ] Ogni tabella database ha un'interfaccia TypeScript
- [ ] Ogni campo database ha il tipo TypeScript corretto
- [ ] Ogni CHECK constraint ha un enum TypeScript
- [ ] Ogni relazione database è documentata
- [ ] Ogni query usa le interfacce TypeScript
- [ ] Ogni mutation valida input con enum types
- [ ] Ogni componente usa interfacce type-safe

---

## 💡 SUGGERIMENTI

### Per Evitare Errori Comuni

1. **Non indovinare i tipi**: Controlla sempre `GLOSSARIO_NOCLERK.md`
2. **Non usare `any`**: Usa interfacce specifiche
3. **Non dimenticare `null`**: Molti campi sono nullable
4. **Non inventare enum**: Usa quelli definiti nel glossario
5. **Non ignorare constraints**: Valida prima di INSERT/UPDATE

### Per Scrivere Codice Migliore

1. **Usa React Query**: Per caching automatico
2. **Gestisci errori**: Sempre con try/catch
3. **Valida input**: Prima di mandare al database
4. **Documenta codice**: Con commenti TypeScript
5. **Testa edge cases**: Null, empty, invalid

---

## 🔗 LINK RAPIDI

### Tabelle Principali

- [Companies](./SCHEMA_ATTUALE.md#companies) - Aziende
- [Departments](./SCHEMA_ATTUALE.md#departments) - Reparti
- [Staff](./SCHEMA_ATTUALE.md#staff) - Personale
- [Products](./SCHEMA_ATTUALE.md#products) - Prodotti
- [ConservationPoints](./SCHEMA_ATTUALE.md#conservation_points) - Punti conservazione
- [Tasks](./SCHEMA_ATTUALE.md#tasks) - Attività
- [MaintenanceTasks](./SCHEMA_ATTUALE.md#maintenance_tasks) - Manutenzioni

### Interfacce TypeScript

- [CompanyMember](./GLOSSARIO_NOCLERK.md#companymember) - Membri azienda
- [UserSession](./GLOSSARIO_NOCLERK.md#usersession) - Sessioni
- [Product](./GLOSSARIO_NOCLERK.md#product) - Prodotti
- [Task](./GLOSSARIO_NOCLERK.md#task) - Task
- [MaintenanceTask](./GLOSSARIO_NOCLERK.md#maintenancetask) - Manutenzioni

### Enum Types

- [StaffRole](./GLOSSARIO_NOCLERK.md#21-staff--roles) - Ruoli staff
- [ConservationPointType](./GLOSSARIO_NOCLERK.md#22-conservation--temperature) - Tipi conservazione
- [TaskFrequency](./GLOSSARIO_NOCLERK.md#23-tasks--maintenance) - Frequenze task
- [ProductStatus](./GLOSSARIO_NOCLERK.md#24-products--inventory) - Status prodotti

### Query Patterns

- [Auth & Multi-Tenant](./GLOSSARIO_NOCLERK.md#41-auth--multi-tenant-queries)
- [Products](./GLOSSARIO_NOCLERK.md#42-product-queries)
- [Temperature](./GLOSSARIO_NOCLERK.md#43-temperature-queries)
- [Tasks](./GLOSSARIO_NOCLERK.md#44-task-queries)

---

## 📞 SUPPORTO

**Domande?** Controlla:
1. `SCHEMA_ATTUALE.md` per schema database
2. `GLOSSARIO_NOCLERK.md` per interfacce TypeScript
3. `../SUPABASE_MANUAL_SETUP.md` per setup
4. `../Report Agenti/` per analisi e report

**Problemi?** Verifica:
1. Schema database aggiornato
2. Interfacce TypeScript allineate
3. Enum values corretti
4. RLS policies attive

---

**Maintainer**: Dev Team BHM v.2  
**Versione Documentazione**: 1.0.0  
**Ultimo Aggiornamento**: 9 Gennaio 2025  
**Stato**: ✅ Produzione Ready

