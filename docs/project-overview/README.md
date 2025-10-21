# 📋 BHM v.2 - Business HACCP Manager
**Progetto**: Progressive Web App per gestione sicurezza alimentare  
**Versione**: 2.0  
**Data**: 2025-10-21

## 🎯 PANORAMICA PROGETTO

**BHM v.2** è una Progressive Web App (PWA) per la gestione della sicurezza alimentare secondo standard HACCP (Hazard Analysis and Critical Control Points).

### **🏗️ ARCHITETTURA TECNICA**

**Frontend:**
- React 18.3.1 + TypeScript 5.6.3
- Vite 5.4.11 (build tool)
- Tailwind CSS 3.4.17 + Radix UI
- React Query 5.62.2 (state management)
- PWA capabilities

**Backend:**
- Supabase (PostgreSQL + Auth + Realtime)
- Edge Functions per logica server
- Row Level Security (RLS)
- Real-time subscriptions

**Testing:**
- Vitest 2.1.8 (unit testing)
- Playwright 1.56.0 (E2E testing)
- Multi-agent testing system

### **📁 STRUTTURA PROGETTO**

```
BHM-v.2/
├── Production/           # Lavoro attivo agenti
├── Archives/             # Storia e riferimenti
├── docs/                 # Documentazione
├── src/                  # Codice sorgente
│   ├── components/       # Componenti UI condivisi
│   ├── features/         # Feature modules
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── config/               # Configurazioni
├── assets/               # Risorse statiche
├── scripts/              # Script di automazione
├── database/             # Schema e migrazioni
└── supabase/             # Configurazioni cloud
```

### **🎯 FEATURE PRINCIPALI**

1. **Autenticazione Multi-tenant**
   - Login/registrazione
   - Gestione inviti
   - Ruoli e permessi

2. **Dashboard Operativa**
   - KPI e statistiche
   - Monitoraggio real-time
   - Notifiche push

3. **Calendario Eventi**
   - Pianificazione attività
   - Gestione scadenze
   - Integrazione team

4. **Gestione Inventario**
   - Tracciamento prodotti
   - Controllo scadenze
   - Alert automatici

5. **Conservazione Alimenti**
   - Monitoraggio temperature
   - Controlli qualità
   - Compliance HACCP

6. **Liste Spesa e Ordini**
   - Gestione acquisti
   - Integrazione fornitori
   - Budget tracking

### **🤖 SISTEMA MULTI-AGENT**

Il progetto utilizza un sistema di 9 agenti specializzati:

- **Agente 0**: Orchestratore
- **Agente 1**: Product Strategy Lead
- **Agente 2**: Systems Blueprint Architect
- **Agente 3**: Experience Designer
- **Agente 4**: Backend Agent
- **Agente 5**: Frontend Agent
- **Agente 6**: Testing Agent
- **Agente 7**: Security Agent
- **Agente 8**: Documentation Manager

### **📊 STATISTICHE PROGETTO**

- **Componenti React**: ~65 componenti effettivi
- **File totali**: 259 file (131 .tsx + 128 .ts)
- **Aree principali**: 22 aree identificate
- **Test coverage**: 85%+ per componenti critici

### **🚀 DEPLOYMENT**

- **Development**: Vite dev server (port 3000)
- **Production**: Vercel deployment
- **Database**: Supabase cloud
- **Monitoring**: Sentry integration

### **📚 DOCUMENTAZIONE**

- **Guida Navigazione**: `docs/AGENT_NAVIGATION_GUIDE.md`
- **Skills Agenti**: `Production/Prompt_Context/`
- **Prompt Agenti**: `Production/Last_Info/Multi agent/`
- **Archivi**: `Archives/` (conoscenza storica)

---
**🎯 OBIETTIVO**: Sistema completo per gestione sicurezza alimentare con architettura moderna e team di agenti specializzati.
