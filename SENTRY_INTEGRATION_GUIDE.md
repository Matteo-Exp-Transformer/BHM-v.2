# 🛡️ Sentry Integration Guide - HACCP Business Manager

_Guida completa per integrare error tracking, performance monitoring e logging con Sentry_

---

## 🎯 **Configurazione Base**

### **1. Variabili Ambiente**

Aggiungi al tuo file `.env`:

```env
VITE_SENTRY_DSN=https://031ddf1ba08e11eb2a85bfb2009d6be8@o4510081453850624.ingest.de.sentry.io/4510081455358032
```

### **2. Configurazione Completa**

Il file `src/lib/sentry.ts` è già configurato. Aggiungi queste opzioni per un setup completo:

```typescript
import * as Sentry from '@sentry/react'

export const initSentry = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('Sentry DSN not configured - error tracking disabled')
    return
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      // Logger Integration - cattura automaticamente console.log/warn/error
      Sentry.consoleLoggingIntegration({
        levels: ['log', 'warn', 'error'],
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Control distributed tracing URLs
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/.*\.supabase\.co\/.*$/,
      /^https:\/\/.*\.clerk\.accounts\.dev\/.*$/,
    ],
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% sessioni normali
    replaysOnErrorSampleRate: 1.0, // 100% sessioni con errori
    // Enable logs
    enableLogs: true,
  })
}

export { Sentry }
```

---

## 🚨 **Error Tracking - Per gli Agenti**

### **Quando usare `Sentry.captureException(error)`:**

#### **✅ CURSOR - Fix rapidi:**

```typescript
// In componenti UI quando catturi errori
try {
  await updateUserProfile(data)
} catch (error) {
  Sentry.captureException(error)
  toast.error("Errore nell'aggiornamento profilo")
}

// In form validation
const handleSubmit = async data => {
  try {
    await submitHACCPForm(data)
  } catch (error) {
    Sentry.captureException(error)
    setFormError('Errore nel salvataggio dati HACCP')
  }
}
```

#### **⚡ GEMINI/CLAUDE - Architettura:**

```typescript
// In servizi complessi
export class HACCPDataService {
  async syncToDatabase(data: HACCPData) {
    try {
      const result = await supabase.from('haccp_inspections').insert(data)
      return result
    } catch (error) {
      Sentry.captureException(error)
      throw new Error('Failed to sync HACCP data')
    }
  }
}

// In middleware di autenticazione
export const authMiddleware = async (req, res, next) => {
  try {
    const token = await validateClerkToken(req.headers.authorization)
    req.user = token
    next()
  } catch (error) {
    Sentry.captureException(error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}
```

---

## 📊 **Performance Tracing - Esempi per HACCP**

### **🎯 UI Components (CURSOR):**

```typescript
function HACCPInspectionForm() {
  const handleInspectionSubmit = (data) => {
    // Traccia il click del bottone
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Submit HACCP Inspection",
      },
      (span) => {
        // Aggiungi metadati utili
        span.setAttribute("inspection_type", data.type);
        span.setAttribute("location", data.location);
        span.setAttribute("items_count", data.items.length);

        submitInspectionData(data);
      },
    );
  };

  return (
    <button onClick={handleInspectionSubmit}>
      Salva Ispezione HACCP
    </button>
  );
}
```

### **🌐 API Calls (GEMINI/CLAUDE):**

```typescript
// Per chiamate Supabase
async function fetchHACCPInspections(companyId: string) {
  return Sentry.startSpan(
    {
      op: 'http.client',
      name: `GET /haccp_inspections company:${companyId}`,
    },
    async span => {
      span.setAttribute('company_id', companyId)

      const response = await supabase
        .from('haccp_inspections')
        .select('*')
        .eq('company_id', companyId)

      span.setAttribute('results_count', response.data?.length || 0)
      return response
    }
  )
}

// Per operazioni database complesse
async function generateHACCPReport(params: ReportParams) {
  return Sentry.startSpan(
    {
      op: 'db.query',
      name: 'Generate HACCP Compliance Report',
    },
    async span => {
      span.setAttribute('report_type', params.type)
      span.setAttribute('date_range', `${params.startDate}-${params.endDate}`)

      const data = await generateReport(params)

      span.setAttribute('report_size_kb', JSON.stringify(data).length / 1024)
      return data
    }
  )
}
```

---

## 📝 **Structured Logging**

### **Configurazione Logger:**

```typescript
import * as Sentry from '@sentry/react'

// Ottieni il logger da Sentry
const { logger } = Sentry
```

### **Esempi per HACCP Business Manager:**

#### **🔧 CURSOR - Logging UI Events:**

```typescript
// Traccia azioni utente
logger.info('User started HACCP inspection', {
  inspectionId: inspection.id,
  inspectorName: user.name,
  location: inspection.location,
})

// Debug form validation
logger.debug(logger.fmt`Form validation failed for field: ${fieldName}`, {
  formType: 'haccp_inspection',
  errorType: 'required_field',
})
```

#### **⚡ GEMINI - System Events:**

```typescript
// Database operations
logger.trace('Starting HACCP data sync', {
  database: 'supabase',
  tableName: 'haccp_inspections',
})

logger.info('HACCP report generated successfully', {
  reportId: report.id,
  itemsProcessed: report.itemCount,
  generationTimeMs: report.processingTime,
})

// Performance warnings
logger.warn('HACCP query taking longer than expected', {
  queryType: 'compliance_check',
  executionTimeMs: 5000,
  companyId: company.id,
})
```

#### **🧠 CLAUDE - Security & Errors:**

```typescript
// Security events
logger.warn('Multiple failed login attempts detected', {
  userId: user.id,
  attemptCount: 5,
  ipAddress: request.ip,
  isHACCPAdmin: user.role === 'admin',
})

// Critical system errors
logger.error('Failed to backup HACCP compliance data', {
  backupId: 'backup_123',
  errorCode: 'STORAGE_FULL',
  affectedRecords: 1500,
})

// Fatal application errors
logger.fatal('HACCP database connection lost', {
  database: 'supabase',
  activeConnections: 0,
  lastSuccessfulConnection: lastConnectionTime,
})
```

---

## 🎯 **Integrazioni Specifiche HACCP**

### **Tracciamento Conformità HACCP:**

```typescript
// Monitoraggio punti critici di controllo
Sentry.startSpan(
  {
    op: 'haccp.ccp_check',
    name: 'Critical Control Point Temperature Check',
  },
  span => {
    span.setAttribute('ccp_id', 'CCP-1')
    span.setAttribute('temperature', temperature)
    span.setAttribute('critical_limit', '4°C')
    span.setAttribute('compliant', temperature <= 4)

    if (temperature > 4) {
      logger.error('HACCP CCP temperature violation', {
        ccp: 'CCP-1',
        measured: temperature,
        limit: 4,
        location: location,
        severity: 'critical',
      })
    }
  }
)

// Audit trail per ispetzioni
logger.info('HACCP inspection completed', {
  inspectionId: inspection.id,
  inspectorId: inspector.id,
  duration: inspection.duration,
  itemsChecked: inspection.items.length,
  nonConformities: inspection.nonConformities.length,
  overallScore: inspection.score,
})
```

---

## ⚙️ **Setup per Agenti AI**

### **🔍 REGOLA FONDAMENTALE - ANALISI PRIMA DEL CODICE**

**TUTTI GLI AGENTI devono seguire questo processo:**

```bash
# PRIMA DI MODIFICARE QUALSIASI FILE:
1. 📖 Leggi l'INTERO file/componente da modificare
2. 🔍 Analizza la struttura dell'app e le dipendenze
3. 📋 Verifica i pattern esistenti e le convenzioni
4. 🔗 Controlla componenti correlati e imports
5. ⚡ SOLO POI procedi con le modifiche
```

### **📋 Regole per CURSOR:**

- **PRIMA**: Leggi tutto il componente da modificare
- Usa `Sentry.captureException()` in tutti i try/catch
- Aggiungi spans per click di bottoni importanti
- Logga eventi UI significativi con `logger.info()`

### **🏗️ Regole per GEMINI:**

- **PRIMA**: Analizza l'architettura completa del sistema
- Traccia tutte le chiamate API con spans personalizzati
- Monitora performance delle query database
- Logga cambiamenti di stato dell'applicazione

### **🛡️ Regole per CLAUDE:**

- **PRIMA**: Studia l'intera struttura di sicurezza
- Implementa logging di sicurezza avanzato
- Monitora errori critici e fatali
- Configura alert per violazioni HACCP

---

## 🔧 **Comandi di Test**

### **Test Configurazione:**

```typescript
// Aggiungi questo in un componente per testare
const testSentry = () => {
  // Test error tracking
  Sentry.captureException(new Error('Test error from HACCP app'))

  // Test logging
  logger.info('Sentry integration test completed', {
    timestamp: new Date().toISOString(),
    testType: 'integration',
  })
}
```

---

**🎯 Ora hai Sentry completamente integrato per monitoraggio professionale della tua app HACCP!**
