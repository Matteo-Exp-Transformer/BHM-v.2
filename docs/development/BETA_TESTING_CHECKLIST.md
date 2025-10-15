# ✅ BETA TESTING CHECKLIST - Quick Reference

**Version:** 2.0.0-beta.1  
**Last Updated:** 15 Ottobre 2025

---

## 🚀 DAILY SMOKE TEST (10 min)

Esegui questi test ogni giorno prima di invitare nuovi beta testers:

### ✅ Core Flow (5 min)
```
[ ] 1. Login → Dashboard carica senza errori
[ ] 2. Inventario → Aggiungi 1 prodotto → Successo
[ ] 3. Calendario → Task visibili e cliccabili
[ ] 4. Logout → Redirect a login
```

### ✅ Critical Features (5 min)
```
[ ] 5. Onboarding → Step 1-7 completabili
[ ] 6. Punti conservazione → Crea 1 punto → Successo
[ ] 7. Staff → Aggiungi 1 membro → Successo
[ ] 8. Mobile responsive → Dashboard OK su mobile
```

**✅ Se tutti passano:** App stabile, procedi con inviti beta  
**❌ Se 1+ fallisce:** DEBUG immediato prima di invitare utenti

---

## 🔍 WEEKLY DEEP TEST (30 min)

### Auth & Sessions
```
[ ] Login con email valida
[ ] Magic link funziona
[ ] Password reset flow
[ ] Session timeout dopo 30 min
[ ] Multi-device login (2 browser)
[ ] Logout pulisce sessione
```

### Onboarding
```
[ ] Step 1: Company info salvataggio
[ ] Step 2: Departments creazione
[ ] Step 3: Primo staff è admin
[ ] Step 3: Email readonly per primo membro
[ ] Step 3: NO invito per primo membro
[ ] Step 4: Categories creazione
[ ] Step 5: Conservation points creazione
[ ] Step 6: Tasks creazione
[ ] Step 7: Calendar settings salvataggio
[ ] Step 7: Contatore giorni lavorativi corretto
[ ] Completamento → Redirect dashboard
```

### Inventory
```
[ ] CRUD prodotti completo
[ ] Trasferimento prodotto (NEW!)
[ ] Filtri per categoria
[ ] Search per nome
[ ] Expired products evidenziati
[ ] Shopping list generation
```

### Calendar
```
[ ] Eventi task generici visibili
[ ] Eventi manutenzione visibili
[ ] Eventi scadenza prodotti visibili
[ ] Filtri per reparto
[ ] Filtri per stato
[ ] Completamento task con note
[ ] Task ricorrenti funzionano
```

### Conservation
```
[ ] CRUD conservation points
[ ] Temperature readings
[ ] Maintenance tasks
[ ] Alert temperatura fuori range
```

### Staff
```
[ ] CRUD staff
[ ] Department assignments (array)
[ ] Inviti staff
[ ] Token invito valido
```

### Activity Tracking (Admin)
```
[ ] Access control (solo admin)
[ ] Active sessions tab
[ ] Timeline tab con filtri
[ ] Statistics tab
[ ] Activity log corretto
```

---

## 🐛 BUG TRACKING

### Come Segnalare Bug

**Template:**
```
🐛 BUG: [Titolo breve]

Severity: 🔴 Critical / 🟡 High / 🟢 Medium / ⚪ Low

Steps:
1. ...
2. ...
3. ...

Expected: ...
Actual: ...

Browser: Chrome 120
OS: Windows 11
User: admin@test.com

Screenshot: [Allega]
```

### Severity Guidelines

**🔴 Critical (Blocker)**
- Crash applicazione
- Data loss
- Login impossibile
- Feature core non funzionante

**🟡 High Priority**
- Feature importante non funziona
- Performance grave (> 5s)
- Error visibile a utente
- RLS bypass

**🟢 Medium Priority**
- UI glitch
- Filtro non funziona
- Toast mancante
- Testo errato

**⚪ Low Priority**
- Typo
- Styling minore
- Feature "nice-to-have"
- Suggerimento miglioramento

---

## 📊 METRICS TO TRACK

### Technical
```
[ ] Uptime: > 99%
[ ] Page load: < 3s (p95)
[ ] API latency: < 500ms
[ ] Error rate: < 1%
[ ] Zero data loss
```

### User
```
[ ] Onboarding completion: > 80%
[ ] Daily active users: Target beta testers
[ ] Feature adoption: > 60%
[ ] Bug reports: Track count
[ ] User satisfaction: Survey
```

---

## 🎯 BETA TESTER ONBOARDING

### Checklist Invito
```
[ ] Email invito preparata
[ ] Credenziali generate
[ ] Link app condiviso
[ ] Form feedback pronto
[ ] Contatto supporto fornito
```

### Email Template
```
Subject: 🎉 Benvenuto in BHM v.2 Beta Testing!

Ciao [Nome],

Sei stato selezionato per testare la nuova versione di Business HACCP Manager!

🔗 App: https://bhm-v2.vercel.app
📧 Email: beta-tester-01@test.com
🔑 Password: [generata]

📝 Feedback Form: [link]
💬 Supporto: support@bhm.app

Cosa testare:
1. Onboarding completo (7 step)
2. Aggiungi prodotti in inventario
3. Crea tasks nel calendario
4. Genera lista spesa

Grazie per il tuo aiuto! 🚀

Team BHM
```

---

## 🔧 QUICK FIXES

### Common Issues & Solutions

**Issue:** Login fallisce  
**Fix:** Verifica Supabase auth config, controlla RLS policies

**Issue:** Dati non caricano  
**Fix:** Controlla company_id nell'auth context, verifica RLS

**Issue:** Product transfer non funziona  
**Fix:** Verifica `useProducts.transferProduct` esposto, controlla TransferProductModal import

**Issue:** Activity tracking non registra  
**Fix:** Verifica `activityTrackingService.logActivity` chiamato, controlla user_id e company_id

**Issue:** Calendar eventi non visibili  
**Fix:** Verifica `useAggregatedEvents` hook, controlla filtri applicati

**Issue:** Onboarding si blocca  
**Fix:** Controlla validation form, verifica step navigation

---

## 📞 CONTACTS

**Project Lead:** [Nome]  
**Backend:** [Nome]  
**Frontend:** [Nome]  
**QA:** [Nome]  

**Support Email:** support@bhm.app  
**Bug Reports:** bugs@bhm.app  
**Slack Channel:** #bhm-beta-testing

---

## 🎉 RELEASE CRITERIA

Prima di passare da beta a produzione:

```
[ ] 0 critical bugs
[ ] < 3 high priority bugs
[ ] > 95% success rate test suite
[ ] > 80% onboarding completion rate
[ ] > 70% user satisfaction (NPS)
[ ] Performance targets met
[ ] Security audit passed
[ ] Documentation complete
[ ] Support team trained
```

---

**Quick Links:**
- 📋 [Full Debug Plan](./DEBUG_PLAN_BETA_RELEASE.md)
- 🤖 [Run Automated Tests](./scripts/debug-pre-beta.js)
- 📊 [Generate Report](./scripts/generate-test-report.js)
- 🗂️ [Schema Database](./supabase/Main/NoClerk/SCHEMA_ATTUALE.md)


