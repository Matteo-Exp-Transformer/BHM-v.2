# 🍽️ BHM v.2 - Business HACCP Manager

> **Progressive Web App per gestione sicurezza alimentare secondo standard HACCP**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud-green.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://web.dev/progressive-web-apps/)

## 🎯 Panoramica

**BHM v.2** è una Progressive Web App completa per la gestione della sicurezza alimentare, sviluppata con React, TypeScript e Supabase. Il progetto utilizza un sistema multi-agente per sviluppo e manutenzione.

## 🚀 Quick Start

```bash
# Installazione dipendenze
npm install

# Avvio development server
npm run dev

# Build production
npm run build

# Test
npm run test
```

## 📁 Struttura Progetto

```
BHM-v.2/
├── 📁 Production/           # LAVORO ATTIVO - Solo file correnti
├── 📁 Archives/             # STORICO - Tutti i file archiviati  
├── 📁 docs/                 # DOCUMENTAZIONE - Guide e overview
├── 📁 src/                  # CODICE SORGENTE - App React
├── 📁 config/               # CONFIGURAZIONI - Build, test, deploy
├── 📁 assets/               # RISORSE - Screenshot, immagini
├── 📁 scripts/              # UTILITY - Script di automazione
├── 📁 database/             # DATABASE - Migrazioni e schema
└── 📁 supabase/             # SUPABASE - Configurazioni cloud
```

## 🤖 Sistema Multi-Agente

Il progetto utilizza 9 agenti specializzati per sviluppo e manutenzione:

- **Agente 0**: Orchestratore
- **Agente 1**: Product Strategy Lead  
- **Agente 2**: Systems Blueprint Architect
- **Agente 3**: Experience Designer
- **Agente 4**: Backend Agent
- **Agente 5**: Frontend Agent
- **Agente 6**: Testing Agent
- **Agente 7**: Security Agent
- **Agente 8**: Documentation Manager

## 🎯 Feature Principali

- ✅ **Autenticazione Multi-tenant** - Login, registrazione, gestione inviti
- ✅ **Dashboard Operativa** - KPI, statistiche, monitoraggio real-time
- ✅ **Calendario Eventi** - Pianificazione attività e scadenze
- ✅ **Gestione Inventario** - Tracciamento prodotti e controllo scadenze
- ✅ **Conservazione Alimenti** - Monitoraggio temperature e compliance HACCP
- ✅ **Liste Spesa e Ordini** - Gestione acquisti e budget tracking

## 🛠️ Stack Tecnologico

**Frontend:**
- React 18.3.1 + TypeScript 5.6.3
- Vite 5.4.11 (build tool)
- Tailwind CSS 3.4.17 + Radix UI
- React Query 5.62.2 (state management)

**Backend:**
- Supabase (PostgreSQL + Auth + Realtime)
- Edge Functions per logica server
- Row Level Security (RLS)

**Testing:**
- Vitest 2.1.8 (unit testing)
- Playwright 1.56.0 (E2E testing)

## 📚 Documentazione

- **🧭 [Guida Navigazione Agenti](docs/AGENT_NAVIGATION_GUIDE.md)** - Come orientarsi nel progetto
- **📋 [Overview Progetto](docs/project-overview/README.md)** - Panoramica completa
- **🏗️ [Skills Agenti](Production/Prompt_Context/)** - Competenze specializzate
- **📁 [Archivi](Archives/)** - Storia e riferimenti del progetto

## 🔧 Script Disponibili

```bash
# Development
npm run dev                # Start dev server (port 3000)
npm run dev:multi          # Start 3 instances (multi-agent testing)

# Testing  
npm run test               # Vitest unit tests
npm run test:coverage      # Coverage report
npm run test:e2e           # Playwright E2E tests

# Build & Quality
npm run build              # Production build
npm run lint               # ESLint check
npm run type-check         # TypeScript check
```

## 🚀 Deployment

- **Development**: `http://localhost:3000`
- **Production**: Vercel deployment
- **Database**: Supabase cloud
- **Monitoring**: Sentry integration

## 📊 Statistiche Progetto

- **Componenti React**: ~65 componenti effettivi
- **File totali**: 259 file (131 .tsx + 128 .ts)
- **Aree principali**: 22 aree identificate
- **Test coverage**: 85%+ per componenti critici

## 🤝 Contribuire

1. Leggi la [Guida Navigazione Agenti](docs/AGENT_NAVIGATION_GUIDE.md)
2. Segui le convenzioni del sistema multi-agente
3. Mantieni la struttura organizzata (Production vs Archives)
4. Documenta sempre le modifiche significative

## 📄 Licenza

Questo progetto è proprietario e riservato.

---

**🎯 Obiettivo**: Sistema completo per gestione sicurezza alimentare con architettura moderna e team di agenti specializzati.

**📅 Ultimo aggiornamento**: {DATA_CORRENTE_SESSIONE}  
**👤 Mantenuto da**: Sistema Multi-Agente BHM v.2

