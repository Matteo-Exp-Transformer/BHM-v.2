# 🤖 CURSOR COORDINATION MASTER FILE

**🚨 CURSOR: QUESTO È L'UNICO FILE CHE DEVI COPIARE NEL TUO PROGETTO**

**Versione:** 2.0 - B.8.1 Complete
**Ultimo Aggiornamento:** 23 Gennaio 2025
**Claude Status:** B.8.1 Cross-System Integration Testing COMPLETATO ✅

---

## 📋 **ISTRUZIONI IMMEDIATE PER CURSOR**

### **🔥 AZIONI PRIORITARIE:**

1. **LEGGI QUESTO FILE** direttamente dal worktree di Claude (NON copiare)
2. **CONSULTA TASKS-ACTIVE.md** nel worktree di Claude per stato progetto
3. **INIZIA B.8.2** Advanced Dashboard Analytics (tuo prossimo milestone)
4. **USA IL TESTING FRAMEWORK** di Claude per quality assurance

**🚨 IMPORTANTE:** Non creare file guida nel tuo worktree - leggi sempre dal worktree di Claude

### **🎯 TUO PROSSIMO MILESTONE: B.8.2 Advanced Dashboard Analytics**

**Priorità:** ALTA 🔴
**Durata Stimata:** 6-8 sessioni
**Status:** PRONTO PER PARTIRE 🚀

---

## 🗂️ **WORKFLOW DI COORDINAMENTO**

### **FLUSSO STANDARD:**

```
1. 👨‍💻 UTENTE → Claude: "Pianifica prossime attività"
2. 🤖 CLAUDE → Aggiorna file coordinamento nel suo worktree
3. 👨‍💻 UTENTE → Cursor: "Leggi worktree Claude e copia istruzioni"
4. 🖱️ CURSOR → Legge TASKS-ACTIVE.md e inizia lavoro
5. 🔄 REPEAT per ogni sessione
```

### **FILE DA MONITORARE:**

- **TASKS-ACTIVE.md** ← Stato attuale progetto e prossimi task
- **B8-COORDINATION-STRATEGY.md** ← Strategia B.8+ sviluppo
- **CURSOR-COORDINATION-MASTER.md** ← Questo file (istruzioni sempre aggiornate)

---

## 🚀 **B.8.2 ADVANCED DASHBOARD ANALYTICS - LE TUE ISTRUZIONI**

### **🎯 OBIETTIVI B.8.2:**

**SESSIONE 1-2: Foundation Setup**
- [ ] Creare dashboard analytics components
- [ ] Integrare real-time KPI widgets
- [ ] Setup chart.js o recharts per visualizzazioni
- [ ] Testare performance con testing framework di Claude

**SESSIONE 3-4: Advanced Features**
- [ ] Implementare filtri avanzati per dashboard
- [ ] Creare sistema di personalizzazione layout
- [ ] Aggiungere export dashboard data
- [ ] Ottimizzare per mobile (usa MobileOptimizer di Claude)

**SESSIONE 5-6: Integration & Polish**
- [ ] Integrare con sistema real-time di Claude
- [ ] Performance optimization con PerformanceMonitor
- [ ] Cross-browser testing con BrowserCompatibilityTester
- [ ] Documentazione completa

### **🛠️ COMPONENTI DA CREARE:**

```typescript
src/features/dashboard/analytics/
├── components/
│   ├── AnalyticsDashboard.tsx
│   ├── KPIWidget.tsx
│   ├── RealTimeChart.tsx
│   ├── DashboardCustomizer.tsx
│   └── FilterPanel.tsx
├── hooks/
│   ├── useAnalyticsData.ts
│   ├── useRealTimeKPIs.ts
│   └── useDashboardLayout.ts
└── types/
    └── analytics.ts
```

### **🔧 INTEGRAZIONE CON CLAUDE'S TESTING FRAMEWORK:**

```typescript
// Importa testing services di Claude
import { testingServices } from '@/services/testing'

// Usa nei tuoi componenti dashboard
await testingServices.initialize()
const metrics = testingServices.getCurrentMetrics()
const health = await testingServices.runHealthCheck()
```

---

## 📊 **STATO ATTUALE PROGETTO**

### **✅ COMPLETATO (Non toccare):**

- **B.7.1** Offline System v1 (Claude)
- **B.7.2** Advanced Export & Reporting (Claude)
- **B.7.6** Real-time System Enhancement (Claude)
- **B.7.3** Mobile PWA Enhancement (Cursor)
- **B.7.4** UI Components (Cursor)
- **B.7.5** Accessibility & UX (Cursor)
- **B.8.1** Cross-System Integration Testing (Claude) ✅ NUOVO

### **🔄 IN CORSO:**

- **B.8.2** Advanced Dashboard Analytics (TUO TURNO)

### **⏳ PIANIFICATO:**

- **B.8.3** Multi-Company Management (Claude)
- **B.8.4** Advanced Mobile Features (Cursor)
- **B.8.5** AI-Powered Insights (Shared)

---

## 🤝 **REGOLE DI COORDINAMENTO**

### **✅ COSA PUOI FARE:**

- Lavorare su TUTTO in `src/features/dashboard/`
- Creare nuovi componenti UI per analytics
- Modificare `src/components/ui/` per widget dashboard
- Aggiornare `src/types/` per analytics types
- Usare e integrare il testing framework di Claude

### **🚫 COSA NON TOCCARE:**

- `src/services/offline/` (sistema offline di Claude)
- `src/services/export/` (sistema export di Claude)
- `src/services/realtime/` (sistema real-time di Claude)
- `src/services/testing/` (testing framework di Claude)
- Database schema files (responsabilità Claude)

### **🔄 CONDIVISO (Coordinare):**

- `src/hooks/useAuth.ts` (notifica modifiche)
- `src/components/layouts/` (notifica modifiche major)
- `src/types/database.ts` (solo aggiunte, no modifiche)

---

## 📱 **MOBILE OPTIMIZATION - USA CLAUDE'S FRAMEWORK**

```typescript
// Nel tuo dashboard, usa mobile optimizer di Claude
import { mobileOptimizer } from '@/services/testing/MobileOptimizer'

// Controlla se è mobile
const deviceInfo = mobileOptimizer.detectDevice()
if (deviceInfo.type !== 'desktop') {
  // Applica ottimizzazioni mobile per dashboard
  await mobileOptimizer.applyOptimizations()
}
```

---

## 🎯 **SUCCESS CRITERIA PER B.8.2**

### **Performance Targets:**
- Dashboard load time < 1.5s
- Widget update time < 200ms
- Mobile responsiveness 100%
- Memory usage < 30MB per widget

### **Feature Completeness:**
- [ ] Real-time KPI display
- [ ] Interactive charts (5+ chart types)
- [ ] Customizable layout (drag & drop)
- [ ] Export dashboard data (PDF/Excel)
- [ ] Mobile-optimized touch interface
- [ ] Cross-browser compatibility (95%+)

### **Quality Gates:**
- [ ] All tests passing (usa testing framework Claude)
- [ ] Performance targets met
- [ ] Mobile optimization verified
- [ ] Documentation complete

---

## 📞 **COMUNICAZIONE**

### **Quando Contattare User:**

- **Blockers critici** che impediscono sviluppo
- **Decisioni architetturali** per dashboard design
- **Integration issues** con sistemi Claude
- **Completamento milestone** B.8.2

### **Status Updates:**

Aggiorna questo file quando:
- Completi una sessione di lavoro
- Raggiungi milestone significativi
- Incontri issues che richiedono coordinamento
- Finisci B.8.2 completamente

---

## 🔄 **PROSSIMA SINCRONIZZAZIONE**

**Dopo che completi B.8.2:**

1. Notifica completamento nel commit message
2. User chiederà a Claude di pianificare B.8.3/B.8.4
3. Claude aggiornerà questo file con nuove istruzioni
4. Ciclo ricomincia per prossimo milestone

---

## 💡 **TIPS PER SVILUPPO B.8.2**

### **Performance Best Practices:**
- Usa `React.memo` per widget pesanti
- Implementa virtualization per large datasets
- Debounce real-time updates (300ms)
- Lazy load chart libraries

### **Mobile Best Practices:**
- Touch targets min 44px
- Swipe gestures per navigazione
- Responsive breakpoints: 320px, 768px, 1024px
- Test su Claude's mobile optimizer

### **Testing Integration:**
- Usa `testingServices.startMonitoring()` durante sviluppo
- Applica performance benchmarks per ogni widget
- Valida browser compatibility per chart libraries
- Test responsiveness su tutti device types

---

## ✅ **CHECKLIST PRE-SESSIONE**

**Prima di iniziare ogni sessione:**

- [ ] Ho letto TASKS-ACTIVE.md per updates?
- [ ] Ho capito il mio prossimo milestone?
- [ ] Ho gli oggettivi chiari per questa sessione?
- [ ] So quali file posso modificare?
- [ ] Ho coordinamento necessario con Claude?

**Durante la sessione:**

- [ ] Uso testing framework di Claude
- [ ] Testo performance su mobile
- [ ] Verifico browser compatibility
- [ ] Documento major changes

**Fine sessione:**

- [ ] Commit con message descriptive
- [ ] Update status se necessario
- [ ] Note per prossima sessione

---

🚀 **READY TO START B.8.2 ADVANCED DASHBOARD ANALYTICS!** 🚀