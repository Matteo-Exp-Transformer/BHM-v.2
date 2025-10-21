# System Diagram - Login Hardening Subsystem

**Data**: 2025-10-20  
**Autore**: Agente 2 (Systems/API/DB)  
**Versione**: 1.0

## Overview

Diagramma del sottosistema di autenticazione hardening con tutti i componenti, flussi e interazioni.

## System Architecture Diagram

```mermaid
graph TB
    %% Frontend Layer
    subgraph "Frontend (React)"
        UI[Login Form]
        VAL[Validation Schema]
        CSRF[CSRF Token Handler]
        COOKIE[Cookie Manager]
    end

    %% API Gateway Layer
    subgraph "API Gateway"
        RATE[Rate Limiter]
        CSRF_CHECK[CSRF Validator]
        AUTH_MW[Auth Middleware]
    end

    %% Core Auth Services
    subgraph "Auth Services"
        LOGIN[Login Service]
        LOGOUT[Logout Service]
        RECOVERY[Recovery Service]
        INVITE[Invite Service]
        SESSION[Session Manager]
    end

    %% Database Layer
    subgraph "Database (PostgreSQL)"
        USERS[(Users Table)]
        ROLES[(Roles Table)]
        USER_ROLES[(User Roles Table)]
        TENANTS[(Tenants Table)]
        INVITES[(Invites Table)]
        AUDIT[(Audit Log Table)]
        SESSIONS[(Sessions Table)]
        RATE_BUCKETS[(Rate Limit Buckets)]
    end

    %% External Services
    subgraph "External Services"
        SMTP[SMTP Server]
        SENTRY[Sentry Logging]
    end

    %% Flows
    UI --> VAL
    VAL --> RATE
    RATE --> CSRF_CHECK
    CSRF_CHECK --> AUTH_MW
    AUTH_MW --> LOGIN
    AUTH_MW --> LOGOUT
    AUTH_MW --> RECOVERY
    AUTH_MW --> INVITE
    AUTH_MW --> SESSION

    %% Database Connections
    LOGIN --> USERS
    LOGIN --> USER_ROLES
    LOGIN --> TENANTS
    LOGIN --> AUDIT
    LOGIN --> SESSIONS
    LOGIN --> RATE_BUCKETS

    LOGOUT --> SESSIONS
    LOGOUT --> AUDIT

    RECOVERY --> USERS
    RECOVERY --> AUDIT
    RECOVERY --> RATE_BUCKETS

    INVITE --> INVITES
    INVITE --> ROLES
    INVITE --> TENANTS
    INVITE --> AUDIT
    INVITE --> SMTP

    SESSION --> SESSIONS
    SESSION --> USERS

    %% RLS Enforcement
    USERS -.-> RLS[RLS Policies]
    USER_ROLES -.-> RLS
    TENANTS -.-> RLS
    INVITES -.-> RLS
    AUDIT -.-> RLS
    SESSIONS -.-> RLS

    %% External Connections
    RECOVERY --> SMTP
    LOGIN --> SENTRY
    LOGOUT --> SENTRY
    RECOVERY --> SENTRY
    INVITE --> SENTRY

    %% Session Management
    SESSION --> COOKIE
    COOKIE --> UI

    %% CSRF Flow
    CSRF --> CSRF_CHECK
    CSRF_CHECK --> CSRF

    %% Rate Limiting Flow
    RATE --> RATE_BUCKETS
    RATE_BUCKETS --> RATE

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef service fill:#e8f5e8
    classDef database fill:#fff3e0
    classDef external fill:#fce4ec

    class UI,VAL,CSRF,COOKIE frontend
    class RATE,CSRF_CHECK,AUTH_MW api
    class LOGIN,LOGOUT,RECOVERY,INVITE,SESSION service
    class USERS,ROLES,USER_ROLES,TENANTS,INVITES,AUDIT,SESSIONS,RATE_BUCKETS database
    class SMTP,SENTRY external
```

## Component Details

### Frontend Layer
- **Login Form**: UI component con validazione schema-based
- **Validation Schema**: Zod/Yup per validazione client-side
- **CSRF Token Handler**: Gestione token per protezione CSRF
- **Cookie Manager**: Gestione cookie di sessione sicuri

### API Gateway Layer
- **Rate Limiter**: Multi-bucket (IP/Account/UA) con backoff
- **CSRF Validator**: Validazione token per azioni mutanti
- **Auth Middleware**: Middleware di autenticazione e autorizzazione

### Core Auth Services
- **Login Service**: Gestione login con validazione credenziali
- **Logout Service**: Gestione logout e invalidazione sessione
- **Recovery Service**: Gestione password recovery con token
- **Invite Service**: Gestione inviti utente e bootstrap admin
- **Session Manager**: Gestione sessioni sicure con rotazione

### Database Layer
- **Users Table**: Profili utente con password hash
- **Roles Table**: Ruoli sistema (owner, admin, manager, operator)
- **User Roles Table**: Associazione utenti-ruoli-tenant
- **Tenants Table**: Organizzazioni multi-tenant
- **Invites Table**: Inviti utente con token
- **Audit Log Table**: Log sicurezza e telemetria
- **Sessions Table**: Sessioni attive con CSRF token
- **Rate Limit Buckets**: Bucket per rate limiting

### External Services
- **SMTP Server**: Invio email per recovery e inviti
- **Sentry Logging**: Telemetria errori e performance

## Security Flows

### Login Flow
1. User → Login Form → Validation Schema
2. Rate Limiter → CSRF Check → Auth Middleware
3. Login Service → Database (Users, Sessions, Audit)
4. Session Manager → Cookie (httpOnly/secure/sameSite=strict)

### Logout Flow
1. User → Logout Request → CSRF Check
2. Logout Service → Invalidate Session → Clear Cookie
3. Audit Log → Sentry

### Recovery Flow
1. User → Recovery Request → Rate Limiter
2. Recovery Service → Generate Token → SMTP
3. User → Recovery Confirm → Validate Token → Update Password
4. Session Rotation → New Cookie

### Invite Flow
1. Admin → Create Invite → CSRF Check
2. Invite Service → Generate Token → SMTP
3. User → Accept Invite → Validate Token → Create User
4. Assign Role → Session Creation

## RLS (Row Level Security)

Tutte le tabelle hanno RLS abilitato con default deny:
- **Users**: Self-read, admin write
- **User Roles**: Tenant-scoped read/write
- **Tenants**: Admin-only write
- **Invites**: Creator/admin read, anon accept
- **Audit Log**: Security/admin read only
- **Sessions**: User-scoped access

## Performance Considerations

- **Rate Limiting**: Sliding window con cleanup automatico
- **Session Management**: Rolling session con idle timeout
- **Database**: Indici ottimizzati per query frequenti
- **Caching**: Session cache per performance
- **Monitoring**: Metriche real-time per performance

## Security Features

- **CSRF Protection**: Double-submit token pattern
- **Session Security**: HttpOnly, secure, sameSite=strict
- **Rate Limiting**: Multi-bucket con backoff progressivo
- **Password Policy**: Solo lettere, min 12 char, denylist
- **Audit Logging**: Tracciamento completo eventi sicurezza
- **Error Handling**: Messaggi generici, no information leakage
