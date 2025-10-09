# 📋 Migration Planning - Clerk to Supabase Auth

**Project:** Business HACCP Manager v2
**Branch:** NoClerk
**Timeline:** 10-12 giorni lavorativi
**Start:** 2025-01-09

---

## 🎯 OBIETTIVI

### Primari
1. ✅ Eliminare completamente dipendenza da Clerk
2. ✅ Implementare Supabase Auth nativo
3. ✅ Supporto multi-company per utente
4. ✅ RLS completo su tutte le tabelle
5. ✅ Sistema inviti email (Resend)
6. ✅ Audit trail HACCP compliant

### Secondari
7. ✅ Migliorare performance query
8. ✅ Documentazione completa
9. ✅ Zero downtime deployment
10. ✅ Backward compatibility dove possibile

---

## 📊 SCOPE

### Codice da Modificare
- **File da creare:** ~20
- **File da modificare:** ~50
- **File da eliminare:** 6 (Clerk related)
- **Lines of code:** ~3000

### Database
- **Nuove tabelle:** 4 (company_members, user_sessions, audit_logs, invite_tokens)
- **Funzioni SQL:** 6 (RLS helpers)
- **Policies RLS:** 72 (18 tabelle × 4 operations)
- **Trigger:** 3 (audit logging)

### Dipendenze
- **Rimosse:** @clerk/clerk-react
- **Aggiunte:** resend (email service)
- **Configurate:** Supabase Auth, SMTP

---

## 🗓️ TIMELINE DETTAGLIATO

### Settimana 1 (Giorni 1-5)

#### Giorno 1: Setup & Database
```
09:00-10:00  Git setup (branch, commit)
10:00-12:00  Database migrations (tabelle nuove)
12:00-13:00  Pausa
13:00-15:00  Funzioni RLS helper
15:00-17:00  RLS policies scrittura
17:00-18:00  Test SQL migrations
```
**Deliverable:** Database pronto con nuove tabelle

#### Giorno 2: Supabase Auth Config
```
09:00-11:00  Configurazione Supabase Auth
11:00-13:00  Setup Resend + email templates
13:00-14:00  Pausa
14:00-16:00  Invite service implementation
16:00-18:00  Test email sending
```
**Deliverable:** Auth configurato, email funzionanti

#### Giorno 3: Remove Clerk
```
09:00-11:00  Uninstall Clerk package
11:00-13:00  Remove imports e componenti Clerk
13:00-14:00  Pausa
14:00-16:00  Update main.tsx e App.tsx
16:00-18:00  Fix compilation errors
```
**Deliverable:** App compila senza Clerk

#### Giorno 4: New useAuth Hook
```
09:00-12:00  Implementazione useAuth v2
12:00-13:00  Pausa
13:00-15:00  Multi-company logic
15:00-17:00  Permissions system
17:00-18:00  Test hook isolato
```
**Deliverable:** useAuth hook completo

#### Giorno 5: Auth Pages
```
09:00-11:00  LoginPage rewrite
11:00-13:00  RegisterPage (admin only)
13:00-14:00  Pausa
14:00-16:00  InvitePage (accept invite)
16:00-18:00  ProtectedRoute update
```
**Deliverable:** Auth flow funzionante

---

### Settimana 2 (Giorni 6-10)

#### Giorno 6: Layout & Navigation
```
09:00-11:00  MainLayout update
11:00-13:00  CompanySwitcher component
13:00-14:00  Pausa
14:00-16:00  Topbar user menu
16:00-18:00  Navigation guards
```
**Deliverable:** Layout multi-company

#### Giorno 7: Feature Hooks Update
```
09:00-11:00  Update 10 feature hooks
11:00-13:00  Update altri 10 hooks
13:00-14:00  Pausa
14:00-16:00  Update ultimi 15 hooks
16:00-18:00  Test compilazione
```
**Deliverable:** Tutti gli hook aggiornati

#### Giorno 8: Invite System Integration
```
09:00-11:00  Onboarding wizard integration
11:00-13:00  Staff management UI
13:00-14:00  Pausa
14:00-16:00  Invite acceptance flow
16:00-18:00  Test end-to-end invites
```
**Deliverable:** Sistema inviti completo

#### Giorno 9: RLS Activation
```
09:00-11:00  Enable RLS progressive
11:00-13:00  Test CRUD con RLS attivo
13:00-14:00  Pausa
14:00-16:00  Audit logs triggers
16:00-18:00  Security testing
```
**Deliverable:** RLS attivo e validato

#### Giorno 10: Testing & Polish
```
09:00-11:00  Integration testing
11:00-13:00  Performance testing
13:00-14:00  Pausa
14:00-16:00  Bug fixing
16:00-18:00  UI/UX polish
```
**Deliverable:** App production-ready

---

### Settimana 3 (Giorni 11-12)

#### Giorno 11: Documentation
```
09:00-12:00  Update schema documentation
12:00-13:00  Pausa
13:00-15:00  Migration report
15:00-17:00  Code documentation
17:00-18:00  README update
```
**Deliverable:** Docs complete

#### Giorno 12: Deployment
```
09:00-11:00  Pre-deploy checklist
11:00-12:00  Merge to main
12:00-13:00  Pausa
13:00-15:00  Production deployment
15:00-18:00  Monitoring & validation
```
**Deliverable:** App in produzione

---

## 🔄 DAILY WORKFLOW

### Morning (09:00-13:00)
1. Check todo list
2. Review previous day work
3. Plan morning tasks
4. Code/implement
5. Commit progress

### Afternoon (14:00-18:00)
6. Continue implementation
7. Test features
8. Update documentation
9. Commit EOD
10. Update MIGRATION_TASKS.md

---

## 📝 COMMIT STRATEGY

### Branch Structure
```
main (produzione)
  └── NoClerk (feature branch)
       ├── commit: "feat: setup database migrations"
       ├── commit: "feat: implement supabase auth"
       ├── commit: "refactor: remove clerk dependencies"
       ├── commit: "feat: new useAuth hook"
       └── ...più commit incrementali
```

### Commit Guidelines
- **Prefissi:** feat, fix, refactor, docs, test, chore
- **Formato:** `type: brief description`
- **Esempi:**
  - `feat: add company_members table`
  - `refactor: remove clerk from App.tsx`
  - `fix: resolve RLS permission issue`
  - `docs: update schema mapping`

### Commit Frequency
- Minimo 3-5 commit/giorno
- Commit dopo ogni feature completa
- Commit prima di switch task

---

## 🧪 TESTING STRATEGY

### Unit Tests
- [ ] useAuth hook functions
- [ ] Invite service functions
- [ ] RLS helper functions
- [ ] Email templates

### Integration Tests
- [ ] Auth flow (login/logout)
- [ ] Invite flow (send/accept)
- [ ] Multi-company switch
- [ ] CRUD operations

### E2E Tests
- [ ] Admin registration + onboarding
- [ ] Staff invite + acceptance
- [ ] Data isolation verification
- [ ] Permissions enforcement

### Testing Tools
- Vitest (unit)
- React Testing Library (components)
- Playwright (E2E)
- Supabase SQL testing

---

## 📊 PROGRESS TRACKING

### Daily Checklist
- [ ] Morning standup (review plan)
- [ ] Complete 3-5 tasks
- [ ] Write 2+ commits
- [ ] Update MIGRATION_TASKS.md
- [ ] Document blockers
- [ ] EOD summary

### Weekly Milestones
- **Week 1:** Database + Auth setup
- **Week 2:** Component migration + RLS
- **Week 3:** Testing + Deployment

### Success Metrics
- [ ] 0 Clerk references in code
- [ ] All 35+ hooks updated
- [ ] All 18 tables with RLS
- [ ] 100% auth tests passing
- [ ] <100ms RLS overhead
- [ ] Zero security vulnerabilities

---

## 🚧 RISK MITIGATION

### High Risk Areas
1. **Data Loss durante migration**
   - Mitigazione: Backup prima di ogni step
   - Rollback: Restore da backup

2. **Breaking changes non previsti**
   - Mitigazione: Test incrementale
   - Rollback: Revert commit specifico

3. **Performance degradation RLS**
   - Mitigazione: Indici strategici
   - Rollback: Disable RLS temporaneo

4. **Email delivery issues**
   - Mitigazione: Resend fallback + logs
   - Rollback: Manual invite links

### Contingency Plan
- Backup branch: `NoClerk-backup`
- Rollback SQL: `database/rollback/`
- Recovery time: <30 minuti
- Communication plan: Immediate notification

---

## 📞 STAKEHOLDERS

### Developer
- **Responsabile:** Claude AI Assistant
- **Supporto:** Utente (testing, decisioni)
- **Review:** Utente finale

### Infrastructure
- **Supabase:** Database + Auth provider
- **Resend:** Email service
- **Vercel:** Hosting frontend

### Communication
- **Status updates:** Fine giornata
- **Blockers:** Immediate notification
- **Milestone completion:** Report dettagliato

---

## 📚 DOCUMENTATION

### To Create
- [x] MIGRATION_TASKS.md (questo file)
- [x] MIGRATION_PLANNING.md (questo file)
- [ ] MIGRATION_REPORT.md (fine progetto)
- [ ] Updated SUPABASE_SCHEMA_MAPPING.md
- [ ] API_DOCUMENTATION.md (auth + invites)

### To Update
- [ ] README.md (nuovo auth flow)
- [ ] .env.example (nuove variabili)
- [ ] CONTRIBUTING.md (setup istruzioni)
- [ ] CHANGELOG.md (breaking changes)

---

## ✅ ACCEPTANCE CRITERIA

### Must Have
- [x] Clerk completamente rimosso
- [ ] Login/register funzionante
- [ ] Inviti email funzionanti
- [ ] RLS attivo su tutte tabelle
- [ ] Multi-company support
- [ ] Permissions enforcement
- [ ] Audit trail logging

### Should Have
- [ ] Performance <100ms overhead
- [ ] Documentazione completa
- [ ] Test coverage >80%
- [ ] Zero console errors
- [ ] Mobile responsive

### Nice to Have
- [ ] Social login (Google)
- [ ] 2FA support
- [ ] Email templates personalizzati
- [ ] Advanced audit reports

---

## 🎉 DEFINITION OF DONE

### Per Task
- [ ] Code implementato
- [ ] Test scritti e passati
- [ ] Documentazione aggiornata
- [ ] Code review approvato
- [ ] Commit pushato

### Per Fase
- [ ] Tutti i task completati
- [ ] Integration test passati
- [ ] Milestone documentata
- [ ] Demo funzionante
- [ ] Ready for next fase

### Per Progetto
- [ ] Tutte le fasi complete
- [ ] Acceptance criteria soddisfatti
- [ ] Production deployment successful
- [ ] User acceptance passed
- [ ] Documentation complete

---

**Planning Owner:** Claude AI Assistant
**Last Updated:** 2025-01-09
**Next Review:** Daily (EOD)
**Approval:** Pending user confirmation
