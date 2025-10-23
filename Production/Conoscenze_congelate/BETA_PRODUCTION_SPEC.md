# SPECIFICA TECNICA BETA PRODUCTION - BHM v.2

**Data**: 2025-10-22 01:38
**Versione**: Beta Production v1.0
**Agente**: Agente 9 - Knowledge Brain Mapper

---

## 🎯 SCOPO BETA PRODUCTION

**Obiettivo**: Rilasciare versione beta funzionante con le 5 funzioni core identificate dalla visione dell'Owner, mantenendo la qualità e stabilità del sistema esistente.

---

## 🏗️ ARCHITETTURA TECNICA

### **Stack Confermato**
- **Frontend**: React 18.3.1 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Testing**: Vitest + Playwright (multi-agent)
- **Deploy**: Vercel + PWA

### **Database Schema**
- ✅ **Multi-tenancy**: companies, company_members, user_sessions
- ✅ **Auth System**: Supabase Auth + RBAC
- ✅ **HACCP Core**: conservation_points, products, temperature_readings
- ✅ **Activity Tracking**: user_activity_logs, audit_logs
- ✅ **Calendar**: calendar_events, maintenance_tasks

---

## 🎯 FUNZIONI CORE BETA

### **1. FORM CONSERVAZIONE A COMPILAZIONE A CASCATA** ⭐ PRIORITÀ 1

#### **Specifica Tecnica**
```typescript
interface ConservationFormData {
  pointType: 'fridge' | 'freezer' | 'ambient' | 'blast'
  category: string
  product: string
  temperature: number
  location: string
}

interface ConservationFormLogic {
  // Elimina opzioni non compatibili basate su selezioni precedenti
  filterOptions(step: number, previousData: Partial<ConservationFormData>): string[]
  validateCompatibility(data: ConservationFormData): boolean
  getHACCPGuidance(data: ConservationFormData): string
}
```

#### **Implementazione**
- **File**: `src/features/conservation/components/ConservationForm.tsx`
- **Hook**: `src/features/conservation/hooks/useConservationForm.ts`
- **Logic**: Form sequenziale con validazione intelligente
- **Database**: Estendere `conservation_points` table

#### **Acceptance Criteria**
- [ ] Form mostra solo opzioni compatibili
- [ ] Validazione temperatura per tipo punto
- [ ] Guidance HACCP automatica
- [ ] Salvataggio con audit trail

### **2. TIMESTAMP SESSIONE UTENTE** ⭐ PRIORITÀ 2

#### **Specifica Tecnica**
```typescript
interface UserSessionTracking {
  sessionId: string
  userId: string
  companyId: string
  startTime: Date
  location: {
    latitude: number
    longitude: number
    accuracy: number
  }
  deviceInfo: {
    userAgent: string
    platform: string
  }
}

interface SessionAnalytics {
  totalWorkTime: number
  activeSessions: number
  locationHistory: Location[]
}
```

#### **Implementazione**
- **Service**: `src/services/sessionTrackingService.ts`
- **Hook**: `src/hooks/useSessionTracking.ts`
- **Database**: `user_activity_logs` + `user_sessions`
- **API**: Geolocation + accelerometer

#### **Acceptance Criteria**
- [ ] Tracking automatico inizio sessione
- [ ] Geolocalizzazione con permessi
- [ ] Calcolo tempo lavoro
- [ ] Dashboard admin con statistiche

### **3. SISTEMA ALERT BASE** ⭐ PRIORITÀ 3

#### **Specifica Tecnica**
```typescript
interface AlertRule {
  id: string
  type: 'expiry' | 'maintenance' | 'temperature' | 'task'
  condition: string
  threshold: number
  notification: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

interface Alert {
  id: string
  userId: string
  companyId: string
  type: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  acknowledged: boolean
}
```

#### **Implementazione**
- **Service**: `src/services/alertService.ts`
- **Component**: `src/components/AlertSystem.tsx`
- **Database**: `alerts` table + triggers
- **Background**: Supabase Edge Function

#### **Acceptance Criteria**
- [ ] Alert automatici per scadenze prodotti
- [ ] Notifiche manutenzioni scadute
- [ ] Sistema priorità
- [ ] Acknowledgment utente

### **4. LISTA SPESA FUNZIONALE** ⭐ PRIORITÀ 4

#### **Specifica Tecnica**
```typescript
interface ShoppingListFilter {
  department: string[]
  expiryStatus: 'expired' | 'expiring' | 'fresh'
  stockStatus: 'in_stock' | 'out_of_stock' | 'low_stock'
  category: string[]
}

interface ShoppingListExport {
  format: 'pdf' | 'excel' | 'csv'
  includePrices: boolean
  includeQuantities: boolean
  groupBy: 'department' | 'category' | 'none'
}
```

#### **Implementazione**
- **Component**: `src/features/inventory/components/ShoppingListManager.tsx`
- **Service**: `src/services/shoppingListService.ts`
- **Export**: jsPDF + xlsx libraries
- **Database**: `shopping_lists` table

#### **Acceptance Criteria**
- [ ] Filtri avanzati per prodotti
- [ ] Checkbox selezione prodotti
- [ ] Export PDF/Excel/CSV
- [ ] Salvataggio liste personalizzate

### **5. SINCRONIZZAZIONE MULTI-UTENTE BASE** ⭐ PRIORITÀ 5

#### **Specifica Tecnica**
```typescript
interface ConflictResolution {
  conflictId: string
  recordId: string
  tableName: string
  conflictType: 'simultaneous_edit' | 'deletion_conflict' | 'permission_conflict'
  resolution: 'last_wins' | 'manual' | 'merge'
  resolvedBy: string
  resolvedAt: Date
}

interface SyncStrategy {
  strategy: 'optimistic' | 'pessimistic' | 'hybrid'
  retryAttempts: number
  conflictDetection: boolean
  autoResolution: boolean
}
```

#### **Implementazione**
- **Service**: `src/services/syncService.ts`
- **Hook**: `src/hooks/useSync.ts`
- **Database**: `sync_conflicts` table
- **Real-time**: Supabase Realtime

#### **Acceptance Criteria**
- [ ] Rilevamento conflitti simultanei
- [ ] Risoluzione automatica semplice
- [ ] Notifica conflitti complessi
- [ ] Audit trail risoluzioni

---

## 📋 ROADMAP IMPLEMENTAZIONE

### **SETTIMANA 1-2: CORE FEATURES**
- [ ] Form conservazione a cascata
- [ ] Timestamp sessione utente
- [ ] Sistema alert base

### **SETTIMANA 3: FUNZIONI AVANZATE**
- [ ] Lista spesa funzionale
- [ ] Sincronizzazione base

### **SETTIMANA 4: STABILIZZAZIONE**
- [ ] Test completi
- [ ] Performance optimization
- [ ] Bug fixing

### **SETTIMANA 5: BETA RELEASE**
- [ ] Deploy beta environment
- [ ] User acceptance testing
- [ ] Feedback collection

---

## 🧪 CRITERI DI ACCETTAZIONE BETA

### **Funzionalità Core**
- [ ] Tutte le 5 funzioni core implementate e funzionanti
- [ ] Sistema multi-utente stabile
- [ ] Performance accettabile (< 3s load time)

### **Qualità**
- [ ] Test coverage > 80%
- [ ] Zero errori critici
- [ ] Responsive design (mobile + desktop)

### **Sicurezza**
- [ ] RLS policies attive
- [ ] Audit trail completo
- [ ] Validazione input

### **Usabilità**
- [ ] UI intuitiva per utenti non tecnici
- [ ] Onboarding funzionante
- [ ] Help system base

---

## 🚀 CRITERI DI RILASCIO BETA

### **Must-Have**
- ✅ Tutte le 5 funzioni core implementate
- ✅ Sistema multi-utente funzionante
- ✅ Test E2E passanti
- ✅ Performance accettabile

### **Nice-to-Have**
- 🔄 IA per automazioni (fase 2)
- 🔄 Alert avanzati (fase 2)
- 🔄 Export avanzato (fase 2)
- 🔄 Analytics avanzate (fase 2)

---

**STATUS**: 🟢 SPECIFICA COMPLETA - Pronto per implementazione

