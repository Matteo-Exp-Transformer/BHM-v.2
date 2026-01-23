# 🔄 CSRF MIGRATION PLAN - DA MOCK A SUPABASE

**Data**: 2025-10-25  
**Agente**: Agente 4 - Backend Agent  
**Status**: ✅ **PIANO COMPLETATO**

## 🎯 OBIETTIVO MIGRATION

Sostituire il mock temporaneo CSRF con implementazione Supabase Edge Function definitiva per produzione.

## 📋 STEP MIGRATION

### **FASE 1: PREPARAZIONE** ✅
- [x] Creare Edge Function Supabase
- [x] Implementare generazione token sicura
- [x] Configurare CORS e security headers
- [x] Creare migration database
- [x] Documentare implementazione

### **FASE 2: DEPLOYMENT** 🔄
- [ ] Deploy Edge Function su Supabase Cloud
- [ ] Deploy Migration su database produzione
- [ ] Configurare variabili ambiente produzione
- [ ] Test endpoint produzione

### **FASE 3: SOSTITUZIONE MOCK** 🔄
- [ ] Rimuovere file mock temporaneo
- [ ] Aggiornare configurazione Vite (se necessario)
- [ ] Verificare URL mapping frontend
- [ ] Test integrazione completa

### **FASE 4: VERIFICA** 🔄
- [ ] Test endpoint con curl/Postman
- [ ] Verificare login frontend
- [ ] Test refresh automatico token
- [ ] Verificare audit log

## 🗂️ FILE DA RIMUOVERE

### **Mock Temporaneo**
```
public/functions/v1/auth-csrf-token
```
**Status**: Da rimuovere dopo deploy produzione

### **Configurazione Vite**
```
vite.config.ts - middleware CSRF
```
**Status**: Da rimuovere se presente

## 🔧 CONFIGURAZIONE PRODUZIONE

### **Variabili Ambiente**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Deploy Commands**
```bash
# Deploy Edge Function
npx supabase functions deploy auth/csrf-token

# Deploy Migration
npx supabase db push

# Verifica Deploy
curl -X GET "https://your-project.supabase.co/functions/v1/auth/csrf-token"
```

## 🚨 ROLLBACK PLAN

### **Se Problemi in Produzione**
1. **Rollback Edge Function**: Disabilitare funzione
2. **Ripristino Mock**: Ricreare file mock temporaneo
3. **Rollback Migration**: Rimuovere tabella csrf_tokens
4. **Verifica Frontend**: Testare login con mock

### **File Rollback**
```bash
# Ricreare mock temporaneo
echo '{"csrf_token":"mock-csrf-token-rollback","expires_at":"2025-10-25T15:09:15.000Z"}' > public/functions/v1/auth-csrf-token
```

## 📊 METRICHE SUCCESSO

### **Pre-Migration**
- Mock statico funzionante
- Login bloccato senza token
- Nessun audit o sicurezza

### **Post-Migration**
- Edge Function Supabase attiva
- Token generati dinamicamente
- Audit completo in database
- Sicurezza enterprise-grade

## 🔄 TIMELINE MIGRATION

### **Oggi (2025-10-25)**
- ✅ Implementazione completata
- ✅ Documentazione creata
- ✅ Migration preparata

### **Prossimi Step**
- [ ] Deploy su Supabase Cloud
- [ ] Test produzione
- [ ] Rimozione mock
- [ ] Verifica finale

## 🎯 RISULTATO ATTESO

**Prima**: Mock temporaneo con token fisso  
**Dopo**: Supabase Edge Function con token dinamici, audit completo, sicurezza enterprise

---

**✅ Migration Plan completato. Pronto per deployment produzione.**
