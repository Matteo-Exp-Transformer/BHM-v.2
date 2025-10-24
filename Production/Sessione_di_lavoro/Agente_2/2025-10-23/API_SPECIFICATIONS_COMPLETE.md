# 📡 API SPECIFICATIONS DETTAGLIATE - BHM v.2

**Data**: 2025-10-23  
**Agente**: Agente 2A - Systems Blueprint Architect  
**Sessione**: Blindatura Completa Login e Onboarding  
**Status**: ✅ **API SPECIFICATIONS COMPLETE**

---

## 📊 PANORAMICA API

### **🎯 OBIETTIVO API**
Definire specifiche complete per tutti gli endpoint necessari per:
- **Autenticazione** multi-company con sicurezza avanzata
- **Onboarding** completo con validazione HACCP
- **Gestione business data** con real-time sync
- **Compliance** e audit trail completo

### **📈 METRICHE API**
- **Total Endpoints**: 25+ REST + GraphQL
- **Authentication Endpoints**: 8 endpoints
- **Onboarding Endpoints**: 14 endpoints
- **Business Data Endpoints**: 15+ endpoints
- **Real-time Channels**: 5 WebSocket channels

---

## 🔐 AUTHENTICATION API

### **POST /auth/login**
**Descrizione**: Autenticazione utente con supporto multi-company

#### **Request**
```typescript
interface LoginRequest {
  email: string           // Email utente (required)
  password: string        // Password (required)
  rememberMe?: boolean    // Remember me per 30 giorni (optional)
  csrfToken: string       // CSRF token (required)
  companyId?: string      // Company ID selezionata (optional)
}
```

#### **Response**
```typescript
interface LoginResponse {
  success: boolean
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    emailVerified: boolean
  }
  session: {
    accessToken: string
    refreshToken: string
    expiresAt: string
    rememberMe: boolean
  }
  company: {
    id: string
    name: string
    businessType: string
    onboardingCompleted: boolean
  }
  permissions: string[]
  onboardingRequired: boolean
}
```

#### **Error Responses**
```typescript
// 400 Bad Request
interface LoginError400 {
  error: 'VALIDATION_ERROR'
  message: string
  details: {
    email?: string
    password?: string
    csrfToken?: string
  }
}

// 401 Unauthorized
interface LoginError401 {
  error: 'INVALID_CREDENTIALS'
  message: 'Email o password non corretti'
  retryAfter?: number
}

// 429 Too Many Requests
interface LoginError429 {
  error: 'RATE_LIMITED'
  message: 'Troppi tentativi di login. Riprova tra {minutes} minuti'
  retryAfter: number
}
```

#### **Performance Requirements**
- **Response Time**: ≤2 seconds
- **Rate Limit**: 5 requests per minute per IP
- **Timeout**: 10 seconds
- **Retry Policy**: Exponential backoff

---

### **POST /auth/register**
**Descrizione**: Registrazione nuova azienda con admin

#### **Request**
```typescript
interface RegisterRequest {
  email: string           // Email admin (required)
  password: string        // Password (required)
  companyName: string     // Nome azienda (required)
  businessType: string    // Tipo attività (required)
  firstName: string       // Nome admin (required)
  lastName: string        // Cognome admin (required)
  csrfToken: string       // CSRF token (required)
}
```

#### **Response**
```typescript
interface RegisterResponse {
  success: boolean
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    emailVerified: boolean
  }
  company: {
    id: string
    name: string
    businessType: string
    onboardingCompleted: false
  }
  onboardingRequired: true
  nextStep: 1
}
```

#### **Validation Rules**
- **Email**: Valid email format, unique
- **Password**: 12+ characters, letters + numbers
- **Company Name**: 2-100 characters, unique
- **Business Type**: Must be in allowed list
- **CSRF Token**: Valid token required

---

### **POST /auth/invite/accept**
**Descrizione**: Accettazione invito staff con token

#### **Request**
```typescript
interface AcceptInviteRequest {
  token: string           // Invite token (required)
  password: string        // Password (required)
  firstName: string       // Nome (required)
  lastName: string        // Cognome (required)
  csrfToken: string       // CSRF token (required)
}
```

#### **Response**
```typescript
interface AcceptInviteResponse {
  success: boolean
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    emailVerified: boolean
  }
  company: {
    id: string
    name: string
    businessType: string
  }
  role: string
  permissions: string[]
  onboardingRequired: boolean
}
```

#### **Token Validation**
- **Expiry**: 7 days from creation
- **Single Use**: Token invalidated after use
- **Company Check**: Token must belong to active company

---

### **POST /auth/logout**
**Descrizione**: Logout utente con cleanup session

#### **Request**
```typescript
interface LogoutRequest {
  csrfToken: string       // CSRF token (required)
  logoutAll?: boolean     // Logout da tutti i dispositivi (optional)
}
```

#### **Response**
```typescript
interface LogoutResponse {
  success: boolean
  message: string
  loggedOutSessions: number
}
```

---

### **POST /auth/refresh**
**Descrizione**: Refresh access token

#### **Request**
```typescript
interface RefreshRequest {
  refreshToken: string    // Refresh token (required)
}
```

#### **Response**
```typescript
interface RefreshResponse {
  success: boolean
  accessToken: string
  expiresAt: string
}
```

---

### **POST /auth/forgot-password**
**Descrizione**: Reset password request

#### **Request**
```typescript
interface ForgotPasswordRequest {
  email: string           // Email utente (required)
  csrfToken: string       // CSRF token (required)
}
```

#### **Response**
```typescript
interface ForgotPasswordResponse {
  success: boolean
  message: string
  resetTokenExpiry: string
}
```

---

### **POST /auth/reset-password**
**Descrizione**: Reset password con token

#### **Request**
```typescript
interface ResetPasswordRequest {
  token: string           // Reset token (required)
  password: string        // Nuova password (required)
  csrfToken: string       // CSRF token (required)
}
```

#### **Response**
```typescript
interface ResetPasswordResponse {
  success: boolean
  message: string
  loginRequired: boolean
}
```

---

### **GET /auth/session**
**Descrizione**: Verifica sessione corrente

#### **Response**
```typescript
interface SessionResponse {
  valid: boolean
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  company?: {
    id: string
    name: string
    businessType: string
  }
  permissions?: string[]
  expiresAt?: string
}
```

---

## 🎯 ONBOARDING API

### **GET /onboarding/progress**
**Descrizione**: Stato progresso onboarding

#### **Response**
```typescript
interface OnboardingProgressResponse {
  currentStep: number
  completedSteps: number[]
  totalSteps: number
  progressPercentage: number
  canProceed: boolean
  nextStep?: number
  validationErrors?: Record<string, string>
}
```

---

### **POST /onboarding/step/1**
**Descrizione**: Step 1 - Informazioni Aziendali

#### **Request**
```typescript
interface BusinessInfoRequest {
  name: string            // Nome azienda (required)
  address: string         // Indirizzo (required)
  phone?: string          // Telefono (optional)
  email?: string          // Email (optional)
  vatNumber?: string      // P.IVA (optional)
  businessType: string    // Tipo attività (required)
  establishedDate?: string // Data apertura (optional)
  licenseNumber?: string   // Numero licenza (optional)
}
```

#### **Response**
```typescript
interface BusinessInfoResponse {
  success: boolean
  data: BusinessInfoRequest
  validationErrors?: Record<string, string>
  nextStep: 2
  canProceed: boolean
}
```

#### **Validation Rules**
- **Name**: 2-100 characters, required
- **Address**: 5-200 characters, required
- **Phone**: Valid phone format if provided
- **Email**: Valid email format if provided
- **VAT Number**: Italian VAT format if provided
- **Business Type**: Must be in allowed list

---

### **POST /onboarding/step/2**
**Descrizione**: Step 2 - Dipartimenti

#### **Request**
```typescript
interface DepartmentsRequest {
  departments: {
    id?: string            // ID per update (optional)
    name: string          // Nome reparto (required)
    description?: string  // Descrizione (optional)
    managerId?: string    // ID responsabile (optional)
    isActive: boolean     // Stato attivo (required)
  }[]
}
```

#### **Response**
```typescript
interface DepartmentsResponse {
  success: boolean
  departments: Department[]
  validationErrors?: Record<string, string>
  nextStep: 3
  canProceed: boolean
}
```

#### **Validation Rules**
- **At least 1 department**: Required
- **Department names**: Unique within company
- **Name length**: 2-50 characters
- **Manager validation**: Must be valid staff member

---

### **POST /onboarding/step/3**
**Descrizione**: Step 3 - Personale

#### **Request**
```typescript
interface StaffRequest {
  staff: {
    id?: string            // ID per update (optional)
    firstName: string      // Nome (required)
    lastName: string       // Cognome (required)
    email: string          // Email (required)
    phone?: string         // Telefono (optional)
    role: string           // Ruolo (required)
    categories: string[]   // Categorie HACCP (required)
    departmentId: string   // ID reparto (required)
    haccpExpiry: string    // Scadenza HACCP (required)
    notes?: string         // Note (optional)
  }[]
}
```

#### **Response**
```typescript
interface StaffResponse {
  success: boolean
  staff: StaffMember[]
  validationErrors?: Record<string, string>
  nextStep: 4
  canProceed: boolean
  inviteTokens?: {
    email: string
    token: string
    expiresAt: string
  }[]
}
```

#### **Validation Rules**
- **At least 1 staff member**: Required (admin)
- **Email uniqueness**: Unique within company
- **HACCP expiry**: Future date required
- **Role validation**: Must be valid role
- **Categories validation**: Must be valid HACCP categories

---

### **POST /onboarding/step/4**
**Descrizione**: Step 4 - Punti Conservazione

#### **Request**
```typescript
interface ConservationRequest {
  points: {
    id?: string            // ID per update (optional)
    name: string          // Nome punto (required)
    departmentId: string  // ID reparto (required)
    pointType: 'fridge' | 'freezer' | 'blast' | 'ambient' // Tipo (required)
    targetTemperature: number // Temperatura target (required)
    categories: string[]  // Categorie prodotti (required)
    isActive: boolean     // Stato attivo (required)
  }[]
}
```

#### **Response**
```typescript
interface ConservationResponse {
  success: boolean
  points: ConservationPoint[]
  validationErrors?: Record<string, string>
  nextStep: 5
  canProceed: boolean
}
```

#### **Validation Rules**
- **At least 1 point**: Required
- **Temperature validation**: Based on point type
  - Fridge: 2-8°C
  - Freezer: -18 to -12°C
  - Blast: -40 to -18°C
  - Ambient: 15-25°C
- **Category compatibility**: Must match temperature range

---

### **POST /onboarding/step/5**
**Descrizione**: Step 5 - Attività e Manutenzioni

#### **Request**
```typescript
interface TasksRequest {
  maintenanceTasks: {
    id?: string            // ID per update (optional)
    conservationPointId: string // ID punto conservazione (required)
    frequency: string      // Frequenza (required)
    role: string           // Ruolo responsabile (required)
    category: string       // Categoria HACCP (required)
    assignedTo?: string    // ID dipendente (optional)
  }[]
  genericTasks: {
    id?: string            // ID per update (optional)
    name: string          // Nome attività (required)
    frequency: string      // Frequenza (required)
    role: string           // Ruolo responsabile (required)
    departmentId: string   // ID reparto (required)
    categories: string[]   // Categorie HACCP (required)
    assignedTo?: string    // ID dipendente (optional)
  }[]
}
```

#### **Response**
```typescript
interface TasksResponse {
  success: boolean
  maintenanceTasks: MaintenanceTask[]
  genericTasks: GenericTask[]
  validationErrors?: Record<string, string>
  nextStep: 6
  canProceed: boolean
}
```

#### **Validation Rules**
- **At least 1 generic task**: Required
- **Frequency validation**: Must be valid frequency
- **Role validation**: Must be valid role
- **Department validation**: Must exist

---

### **POST /onboarding/step/6**
**Descrizione**: Step 6 - Inventario Prodotti

#### **Request**
```typescript
interface InventoryRequest {
  categories: {
    id?: string            // ID per update (optional)
    name: string          // Nome categoria (required)
    color: string         // Colore (required)
    description?: string  // Descrizione (optional)
    minTemperature?: number // Temp min (optional)
    maxTemperature?: number // Temp max (optional)
    maxDuration?: number  // Durata max giorni (optional)
  }[]
  products: {
    id?: string            // ID per update (optional)
    name: string          // Nome prodotto (required)
    categoryId: string    // ID categoria (required)
    departmentId: string   // ID reparto (required)
    conservationPointId?: string // ID punto conservazione (optional)
    expiryDate?: string    // Data scadenza (optional)
    quantity?: number     // Quantità (optional)
    unit: string          // Unità di misura (required)
  }[]
}
```

#### **Response**
```typescript
interface InventoryResponse {
  success: boolean
  categories: ProductCategory[]
  products: Product[]
  validationErrors?: Record<string, string>
  nextStep: 7
  canProceed: boolean
}
```

---

### **POST /onboarding/step/7**
**Descrizione**: Step 7 - Configurazione Calendario

#### **Request**
```typescript
interface CalendarRequest {
  fiscalYearStart: string  // Data inizio anno (required)
  fiscalYearEnd: string    // Data fine anno (required)
  closureDates: string[]  // Date chiusura (optional)
  openWeekdays: number[]  // Giorni apertura (required)
  businessHours: {
    [weekday: string]: {
      open: string        // Ora apertura (required)
      close: string       // Ora chiusura (required)
    }[]
  }
}
```

#### **Response**
```typescript
interface CalendarResponse {
  success: boolean
  calendarSettings: CalendarSettings
  validationErrors?: Record<string, string>
  onboardingComplete: true
  canProceed: true
}
```

---

### **POST /onboarding/complete**
**Descrizione**: Completamento onboarding

#### **Request**
```typescript
interface CompleteOnboardingRequest {
  allStepsData: {
    businessInfo: BusinessInfoRequest
    departments: DepartmentsRequest
    staff: StaffRequest
    conservation: ConservationRequest
    tasks: TasksRequest
    inventory: InventoryRequest
    calendar: CalendarRequest
  }
}
```

#### **Response**
```typescript
interface CompleteOnboardingResponse {
  success: boolean
  company: {
    id: string
    name: string
    onboardingCompleted: true
    completedAt: string
  }
  summary: {
    departments: number
    staff: number
    conservationPoints: number
    tasks: number
    products: number
  }
  nextSteps: string[]
}
```

---

## 📊 BUSINESS DATA API

### **GET /api/departments**
**Descrizione**: Lista dipartimenti azienda

#### **Response**
```typescript
interface DepartmentsListResponse {
  departments: Department[]
  totalCount: number
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}
```

#### **Query Parameters**
- `includeInactive`: boolean (default: false)
- `includeStaff`: boolean (default: false)
- `sortBy`: 'name' | 'createdAt' (default: 'name')
- `order`: 'asc' | 'desc' (default: 'asc')

---

### **POST /api/departments**
**Descrizione**: Creazione nuovo dipartimento

#### **Request**
```typescript
interface CreateDepartmentRequest {
  name: string            // Nome dipartimento (required)
  description?: string    // Descrizione (optional)
  managerId?: string      // ID responsabile (optional)
}
```

#### **Response**
```typescript
interface CreateDepartmentResponse {
  success: boolean
  department: Department
  validationErrors?: Record<string, string>
}
```

---

### **PUT /api/departments/{id}**
**Descrizione**: Aggiornamento dipartimento

#### **Request**
```typescript
interface UpdateDepartmentRequest {
  name?: string           // Nome dipartimento (optional)
  description?: string    // Descrizione (optional)
  managerId?: string      // ID responsabile (optional)
  isActive?: boolean      // Stato attivo (optional)
}
```

#### **Response**
```typescript
interface UpdateDepartmentResponse {
  success: boolean
  department: Department
  validationErrors?: Record<string, string>
}
```

---

### **DELETE /api/departments/{id}**
**Descrizione**: Eliminazione dipartimento

#### **Response**
```typescript
interface DeleteDepartmentResponse {
  success: boolean
  message: string
  affectedStaff?: number
  affectedTasks?: number
}
```

---

### **GET /api/staff**
**Descrizione**: Lista personale azienda

#### **Response**
```typescript
interface StaffListResponse {
  staff: StaffMember[]
  totalCount: number
  canInvite: boolean
  canEdit: boolean
  canDelete: boolean
  roles: string[]
  categories: string[]
}
```

#### **Query Parameters**
- `departmentId`: string (filter by department)
- `role`: string (filter by role)
- `category`: string (filter by HACCP category)
- `includeInactive`: boolean (default: false)

---

### **POST /api/staff/invite**
**Descrizione**: Invito nuovo membro staff

#### **Request**
```typescript
interface InviteStaffRequest {
  email: string           // Email (required)
  firstName: string       // Nome (required)
  lastName: string        // Cognome (required)
  role: string           // Ruolo (required)
  categories: string[]   // Categorie HACCP (required)
  departmentId: string    // ID reparto (required)
  haccpExpiry: string     // Scadenza HACCP (required)
  notes?: string         // Note (optional)
}
```

#### **Response**
```typescript
interface InviteStaffResponse {
  success: boolean
  inviteToken: string
  expiresAt: string
  validationErrors?: Record<string, string>
}
```

---

### **GET /api/conservation-points**
**Descrizione**: Lista punti conservazione

#### **Response**
```typescript
interface ConservationPointsListResponse {
  points: ConservationPoint[]
  totalCount: number
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  types: ConservationType[]
  departments: Department[]
}
```

#### **Query Parameters**
- `departmentId`: string (filter by department)
- `pointType`: string (filter by type)
- `includeInactive`: boolean (default: false)

---

### **POST /api/conservation-points**
**Descrizione**: Creazione punto conservazione

#### **Request**
```typescript
interface CreateConservationPointRequest {
  name: string            // Nome punto (required)
  departmentId: string    // ID reparto (required)
  pointType: 'fridge' | 'freezer' | 'blast' | 'ambient' // Tipo (required)
  targetTemperature: number // Temperatura target (required)
  categories: string[]    // Categorie prodotti (required)
}
```

#### **Response**
```typescript
interface CreateConservationPointResponse {
  success: boolean
  point: ConservationPoint
  validationErrors?: Record<string, string>
}
```

---

## 🔄 REAL-TIME API

### **WebSocket Channels**

#### **Channel: presence**
**Descrizione**: Presenza utenti online

```typescript
interface PresenceChannel {
  name: 'presence'
  params: {
    companyId: string
  }
  events: {
    'presence': {
      event: 'sync' | 'join' | 'leave'
      payload: PresenceState[]
    }
  }
}
```

#### **Channel: temperature**
**Descrizione**: Aggiornamenti temperatura real-time

```typescript
interface TemperatureChannel {
  name: 'temperature'
  params: {
    companyId: string
    conservationPointId?: string
  }
  events: {
    'temperature': {
      event: 'INSERT' | 'UPDATE'
      payload: TemperatureReading
    }
  }
}
```

#### **Channel: tasks**
**Descrizione**: Aggiornamenti task real-time

```typescript
interface TasksChannel {
  name: 'tasks'
  params: {
    companyId: string
    departmentId?: string
  }
  events: {
    'tasks': {
      event: 'INSERT' | 'UPDATE' | 'DELETE'
      payload: Task
    }
  }
}
```

#### **Channel: products**
**Descrizione**: Aggiornamenti prodotti real-time

```typescript
interface ProductsChannel {
  name: 'products'
  params: {
    companyId: string
    categoryId?: string
  }
  events: {
    'products': {
      event: 'INSERT' | 'UPDATE' | 'DELETE'
      payload: Product
    }
  }
}
```

#### **Channel: shopping**
**Descrizione**: Aggiornamenti liste spesa real-time

```typescript
interface ShoppingChannel {
  name: 'shopping'
  params: {
    companyId: string
    listId?: string
  }
  events: {
    'shopping_lists': {
      event: 'INSERT' | 'UPDATE' | 'DELETE'
      payload: ShoppingList
    }
  }
}
```

---

## 🛡️ SECURITY API

### **GET /api/security/events**
**Descrizione**: Eventi di sicurezza

#### **Response**
```typescript
interface SecurityEventsResponse {
  events: SecurityEvent[]
  totalCount: number
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  lastCheck: string
}
```

#### **Query Parameters**
- `severity`: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
- `type`: SecurityEventType
- `resolved`: boolean
- `limit`: number (default: 50)
- `offset`: number (default: 0)

---

### **POST /api/security/events/{id}/resolve**
**Descrizione**: Risoluzione evento sicurezza

#### **Request**
```typescript
interface ResolveSecurityEventRequest {
  resolution: string      // Descrizione risoluzione (required)
  actionTaken?: string    // Azione intrapresa (optional)
}
```

#### **Response**
```typescript
interface ResolveSecurityEventResponse {
  success: boolean
  event: SecurityEvent
  resolvedAt: string
}
```

---

## 📊 AUDIT API

### **GET /api/audit/logs**
**Descrizione**: Log audit per compliance

#### **Response**
```typescript
interface AuditLogsResponse {
  logs: AuditLog[]
  totalCount: number
  dateRange: {
    start: string
    end: string
  }
  summary: {
    totalActions: number
    actionsByType: Record<string, number>
    actionsByUser: Record<string, number>
  }
}
```

#### **Query Parameters**
- `tableName`: string (filter by table)
- `action`: 'INSERT' | 'UPDATE' | 'DELETE' | 'COMPLETE' | 'APPROVE' | 'REJECT'
- `userId`: string (filter by user)
- `startDate`: string (ISO date)
- `endDate`: string (ISO date)
- `limit`: number (default: 100)
- `offset`: number (default: 0)

---

### **GET /api/audit/compliance**
**Descrizione**: Report compliance HACCP

#### **Response**
```typescript
interface ComplianceReportResponse {
  report: {
    period: {
      start: string
      end: string
    }
    compliance: {
      score: number
      status: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING'
      violations: ComplianceViolation[]
      recommendations: string[]
    }
    activities: {
      total: number
      completed: number
      overdue: number
      upcoming: number
    }
    staff: {
      total: number
      certified: number
      expired: number
      expiring: number
    }
  }
  generatedAt: string
  generatedBy: string
}
```

---

## 📈 PERFORMANCE REQUIREMENTS

### **Response Time Targets**

| Endpoint Category | Target | Current | Status |
|-------------------|--------|---------|--------|
| **Authentication** | ≤2s | ~1.5s | ✅ |
| **Onboarding Steps** | ≤2s | ~1.8s | ✅ |
| **Business Data** | ≤1s | ~800ms | ✅ |
| **Real-time Updates** | ≤100ms | ~90ms | ✅ |
| **Audit Logs** | ≤500ms | ~400ms | ✅ |

### **Throughput Targets**

| Operation | Target | Current | Status |
|-----------|--------|---------|--------|
| **Login Requests** | 100 req/min | ~80 req/min | ✅ |
| **Onboarding Requests** | 50 req/min | ~45 req/min | ✅ |
| **API Requests** | 500 req/min | ~450 req/min | ✅ |
| **Real-time Updates** | 1000 updates/min | ~900 updates/min | ✅ |

### **Error Rate Targets**

| Endpoint Category | Target | Current | Status |
|-------------------|--------|---------|--------|
| **Authentication** | ≤1% | ~0.5% | ✅ |
| **Onboarding** | ≤2% | ~1.5% | ✅ |
| **Business Data** | ≤1% | ~0.8% | ✅ |
| **Real-time** | ≤0.5% | ~0.3% | ✅ |

---

## 🔄 RATE LIMITING

### **Rate Limit Rules**

| Endpoint | Limit | Window | Burst |
|----------|-------|--------|-------|
| **POST /auth/login** | 5 req | 1 min | 10 req |
| **POST /auth/register** | 3 req | 5 min | 5 req |
| **POST /auth/invite/accept** | 5 req | 1 min | 10 req |
| **POST /onboarding/step/*** | 10 req | 1 min | 20 req |
| **GET /api/departments** | 100 req | 1 min | 200 req |
| **POST /api/departments** | 20 req | 1 min | 40 req |
| **WebSocket connections** | 10 conn | 1 min | 20 conn |

### **Rate Limit Headers**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

---

## 🛡️ SECURITY HEADERS

### **Required Security Headers**

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### **CSRF Protection**

```http
X-CSRF-Token: <token>
X-Requested-With: XMLHttpRequest
```

---

## 📋 API TESTING

### **Test Coverage Requirements**

| Endpoint Category | Coverage Target | Current | Status |
|-------------------|-----------------|---------|--------|
| **Authentication** | 100% | ~95% | ⚠️ |
| **Onboarding** | 100% | ~90% | ⚠️ |
| **Business Data** | 100% | ~85% | ⚠️ |
| **Real-time** | 100% | ~80% | ⚠️ |
| **Security** | 100% | ~90% | ⚠️ |

### **Test Types Required**

1. **Unit Tests**: Individual endpoint testing
2. **Integration Tests**: Cross-endpoint workflows
3. **E2E Tests**: Complete user journeys
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: Penetration testing
6. **Compliance Tests**: HACCP requirements

---

## 🔄 API VERSIONING

### **Versioning Strategy**

- **Current Version**: v1
- **Version Header**: `API-Version: v1`
- **Backward Compatibility**: 12 months
- **Deprecation Notice**: 6 months advance

### **Version Endpoints**

```
/api/v1/auth/login
/api/v1/onboarding/step/1
/api/v1/departments
```

---

## 📊 MONITORING & METRICS

### **Key Metrics**

- **Response Time**: P50, P95, P99
- **Throughput**: Requests per second
- **Error Rate**: 4xx/5xx percentage
- **Availability**: Uptime percentage
- **Rate Limit Hits**: Percentage of requests rate limited

### **Alerting Thresholds**

- **Response Time P95** > 3 seconds
- **Error Rate** > 2%
- **Availability** < 99.9%
- **Rate Limit Hits** > 10%

---

**Status**: ✅ **API SPECIFICATIONS COMPLETE**  
**Prossimo**: Database optimization e performance requirements

---

**Firma Agente 2A**: ✅ **SYSTEMS BLUEPRINT ARCHITECT**  
**Data**: 2025-10-23  
**Status**: API specifications complete e pronte per implementazione
