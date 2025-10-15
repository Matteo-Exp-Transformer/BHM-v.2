# 📊 REPORT COMPLETO: SISTEMA DI TRACKING UTENTI
## Business HACCP Manager v.2

---

<div style="page-break-after: always;"></div>

## 📋 INDICE

1. [Executive Summary](#executive-summary)
2. [Panoramica Sistema](#panoramica-sistema)
3. [Attività Tracciabili](#attività-tracciabili)
4. [Esempio Report Completo](#esempio-report-completo)
5. [Statistiche Disponibili](#statistiche-disponibili)
6. [Accesso ai Dati](#accesso-ai-dati)
7. [Casi d'Uso Pratici](#casi-duso-pratici)

---

<div style="page-break-after: always;"></div>

## 1. EXECUTIVE SUMMARY

### 🎯 Obiettivo del Sistema

Il sistema di tracking di **Business HACCP Manager v.2** fornisce un'audit trail completa di tutte le attività svolte dagli utenti nell'applicazione, garantendo:

- ✅ **Tracciabilità completa** per conformità HACCP
- ✅ **Sicurezza** con isolamento multi-tenant
- ✅ **Performance** ottimizzate con indici strategici
- ✅ **Privacy** con Row-Level Security (RLS)
- ✅ **Scalabilità** pronta per partizionamento

### 📈 Metriche Chiave

| Metrica | Valore | Note |
|---------|--------|------|
| **Tipi di attività tracciabili** | 16 | Copertura completa operazioni |
| **Retention periodo dati** | 90 giorni | Configurabile |
| **Overhead performance** | < 50ms | Per singola operazione |
| **Sicurezza RLS** | ✅ Attiva | Isolamento completo aziende |

---

<div style="page-break-after: always;"></div>

## 2. PANORAMICA SISTEMA

### 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND APPLICATION                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ useAuth()    │  │ Hooks        │  │ Components   │      │
│  │ - Login      │  │ - Products   │  │ - Forms      │      │
│  │ - Logout     │  │ - Tasks      │  │ - Actions    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  logActivity()  │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Supabase API   │
                    └────────┬────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                    DATABASE LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  log_user_activity() FUNCTION                        │   │
│  │  - Bypass RLS for system logging                     │   │
│  │  - Timestamp automatico                              │   │
│  │  - Validazione activity_type                         │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │  user_activity_logs TABLE                            │   │
│  │  - 8 indici per performance                          │   │
│  │  - JSONB per dati flessibili                         │   │
│  │  - RLS policies attive                               │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 🔐 Sicurezza e Permessi

| Ruolo | Visualizzazione | Inserimento | Modifica | Eliminazione |
|-------|----------------|-------------|----------|--------------|
| **Utente Standard** | ✅ Proprie attività | ✅ Proprie attività | ❌ No | ❌ No |
| **Admin** | ✅ Tutte attività azienda | ✅ Proprie attività | ❌ No | ❌ No |
| **System** | ✅ Via funzioni | ✅ Via funzioni | ❌ No | 🔧 Solo DBA |

> **Nota**: I log sono **immutabili** - nessuno può modificare o eliminare attività registrate (audit trail)

---

<div style="page-break-after: always;"></div>

## 3. ATTIVITÀ TRACCIABILI

### 📊 Catalogo Completo

#### 🔐 1. GESTIONE SESSIONI

##### `session_start` - Inizio Sessione
**Quando:** Utente effettua login
```json
{
  "activity_type": "session_start",
  "activity_data": {
    "login_method": "email",
    "device_type": "desktop",
    "browser": "Chrome 120",
    "os": "Windows 11"
  },
  "timestamp": "2025-01-14T08:30:00Z",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

##### `session_end` - Fine Sessione
**Quando:** Utente effettua logout o sessione scade
```json
{
  "activity_type": "session_end",
  "activity_data": {
    "duration_minutes": 125,
    "logout_type": "manual",
    "pages_visited": 15,
    "actions_performed": 8
  },
  "timestamp": "2025-01-14T10:35:00Z"
}
```

---

#### ✅ 2. GESTIONE TASK

##### `task_completed` - Task Completata (Manutenzione)
**Quando:** Utente completa una task di manutenzione (temperature, sanificazione, ecc.)
```json
{
  "activity_type": "task_completed",
  "entity_type": "maintenance_task",
  "entity_id": "uuid-123",
  "activity_data": {
    "task_name": "Rilevamento Temperature Frigo 1",
    "task_type": "temperature",
    "department_name": "Cucina",
    "department_id": "dept-uuid",
    "conservation_point_name": "Frigo Carni - Cucina",
    "conservation_point_id": "cp-uuid",
    "completed_value": 4.5,
    "expected_range": { "min": 0, "max": 4 },
    "within_range": false,
    "notes": "Temperatura leggermente alta, controllato guarnizioni",
    "completion_time": "2025-01-14T12:15:00Z",
    "photo_uploaded": true
  },
  "timestamp": "2025-01-14T12:15:23Z"
}
```

##### `task_completed` - Task Completata (Generica)
**Quando:** Utente completa una task generica
```json
{
  "activity_type": "task_completed",
  "entity_type": "generic_task",
  "entity_id": "uuid-456",
  "activity_data": {
    "task_name": "Formazione Staff HACCP",
    "task_type": "generic",
    "department_name": "Sala",
    "department_id": "dept-uuid",
    "assigned_staff": ["Mario Rossi", "Laura Bianchi"],
    "notes": "Completata formazione su nuove procedure",
    "duration_minutes": 90,
    "completion_time": "2025-01-14T15:30:00Z"
  },
  "timestamp": "2025-01-14T15:30:45Z"
}
```

---

#### 📦 3. GESTIONE PRODOTTI

##### `product_added` - Prodotto Aggiunto
**Quando:** Utente aggiunge un nuovo prodotto all'inventario
```json
{
  "activity_type": "product_added",
  "entity_type": "product",
  "entity_id": "prod-uuid-789",
  "activity_data": {
    "product_name": "Mozzarella di Bufala DOP",
    "category": "Latticini",
    "category_id": "cat-uuid",
    "department": "Cucina",
    "department_id": "dept-uuid",
    "conservation_point": "Frigo 1 - Latticini",
    "conservation_point_id": "cp-uuid",
    "quantity": 10,
    "unit": "kg",
    "supplier": "Caseificio Rossi",
    "lot_number": "LOT20250114-A",
    "expiry_date": "2025-01-21",
    "purchase_date": "2025-01-14",
    "cost_per_unit": 12.50,
    "total_cost": 125.00,
    "status": "active"
  },
  "timestamp": "2025-01-14T09:00:00Z"
}
```

##### `product_updated` - Prodotto Modificato
**Quando:** Utente modifica un prodotto esistente
```json
{
  "activity_type": "product_updated",
  "entity_type": "product",
  "entity_id": "prod-uuid-789",
  "activity_data": {
    "product_name": "Mozzarella di Bufala DOP",
    "changes": {
      "quantity": {
        "old": 10,
        "new": 7,
        "difference": -3
      },
      "status": {
        "old": "active",
        "new": "active"
      }
    },
    "update_reason": "Consumo parziale per servizio pranzo",
    "updated_by": "Mario Rossi",
    "service_date": "2025-01-14"
  },
  "timestamp": "2025-01-14T13:30:00Z"
}
```

##### `product_deleted` - Prodotto Eliminato
**Quando:** Utente elimina un prodotto
```json
{
  "activity_type": "product_deleted",
  "entity_type": "product",
  "entity_id": "prod-uuid-321",
  "activity_data": {
    "product_name": "Formaggio Gorgonzola",
    "category": "Latticini",
    "department": "Cucina",
    "conservation_point": "Frigo 1",
    "final_quantity": 2,
    "unit": "kg",
    "deletion_reason": "Scaduto",
    "final_status": "expired",
    "expiry_date": "2025-01-13",
    "disposal_method": "Smaltimento organico",
    "value_lost": 18.00
  },
  "timestamp": "2025-01-14T18:00:00Z"
}
```

---

#### 🛒 4. GESTIONE LISTE SPESA

##### `shopping_list_created` - Lista Creata
**Quando:** Utente crea una nuova lista della spesa
```json
{
  "activity_type": "shopping_list_created",
  "entity_type": "shopping_list",
  "entity_id": "list-uuid-555",
  "activity_data": {
    "list_name": "Lista Spesa Settimanale - 14 Gen 2025",
    "items_count": 18,
    "total_products": 18,
    "categories": [
      "Latticini",
      "Carne",
      "Verdure",
      "Pesce",
      "Bevande"
    ],
    "total_estimated_cost": 450.00,
    "supplier": "Fornitore Principale",
    "delivery_date_requested": "2025-01-16",
    "urgency": "normal",
    "created_from": "low_stock_alert"
  },
  "timestamp": "2025-01-14T16:00:00Z"
}
```

##### `shopping_list_updated` - Lista Modificata
**Quando:** Utente modifica una lista esistente
```json
{
  "activity_type": "shopping_list_updated",
  "entity_type": "shopping_list",
  "entity_id": "list-uuid-555",
  "activity_data": {
    "list_name": "Lista Spesa Settimanale - 14 Gen 2025",
    "changes": {
      "items_added": 3,
      "items_removed": 1,
      "items_updated": 2
    },
    "new_items_count": 20,
    "update_reason": "Aggiornamento necessità cucina",
    "updated_sections": ["Latticini", "Verdure"]
  },
  "timestamp": "2025-01-14T17:30:00Z"
}
```

##### `shopping_list_completed` - Lista Completata
**Quando:** Tutti gli item della lista sono stati acquistati
```json
{
  "activity_type": "shopping_list_completed",
  "entity_type": "shopping_list",
  "entity_id": "list-uuid-555",
  "activity_data": {
    "list_name": "Lista Spesa Settimanale - 14 Gen 2025",
    "items_total": 20,
    "items_purchased": 20,
    "completion_rate": 100,
    "total_cost_estimated": 450.00,
    "total_cost_actual": 462.50,
    "variance": 12.50,
    "variance_percentage": 2.78,
    "completion_time_hours": 48,
    "supplier": "Fornitore Principale"
  },
  "timestamp": "2025-01-16T10:00:00Z"
}
```

---

#### 🏢 5. GESTIONE STRUTTURA

##### `department_created` - Reparto Creato
**Quando:** Admin crea un nuovo reparto
```json
{
  "activity_type": "department_created",
  "entity_type": "department",
  "entity_id": "dept-uuid-999",
  "activity_data": {
    "department_name": "Cantina Vini",
    "department_code": "CANT",
    "area_type": "storage",
    "temperature_controlled": true,
    "target_temperature": 16,
    "responsible_staff": "Sommelier Giovanni",
    "description": "Cantina per conservazione vini pregiati"
  },
  "timestamp": "2025-01-14T11:00:00Z"
}
```

##### `staff_added` - Personale Aggiunto
**Quando:** Admin aggiunge un nuovo membro dello staff
```json
{
  "activity_type": "staff_added",
  "entity_type": "staff",
  "entity_id": "staff-uuid-777",
  "activity_data": {
    "staff_name": "Laura Verdi",
    "role": "Cuoca",
    "department": "Cucina",
    "department_id": "dept-uuid",
    "hire_date": "2025-01-14",
    "certifications": ["HACCP Base", "Celiachia"],
    "shift": "morning",
    "contract_type": "full_time"
  },
  "timestamp": "2025-01-14T09:30:00Z"
}
```

##### `conservation_point_created` - Punto Conservazione Creato
**Quando:** Admin crea un nuovo punto di conservazione
```json
{
  "activity_type": "conservation_point_created",
  "entity_type": "conservation_point",
  "entity_id": "cp-uuid-888",
  "activity_data": {
    "point_name": "Frigo 3 - Pesce",
    "point_type": "refrigerator",
    "department": "Cucina",
    "department_id": "dept-uuid",
    "temperature_range": { "min": -2, "max": 2 },
    "capacity_liters": 500,
    "brand": "Arctic Pro",
    "model": "FRG-500X",
    "purchase_date": "2024-06-15",
    "maintenance_frequency": "monthly"
  },
  "timestamp": "2025-01-14T10:00:00Z"
}
```

---

#### 📝 6. ALTRE ATTIVITÀ

##### `maintenance_task_created` - Task Manutenzione Creata
**Quando:** Admin crea una nuova task di manutenzione
```json
{
  "activity_type": "maintenance_task_created",
  "entity_type": "maintenance_task",
  "entity_id": "mtask-uuid-666",
  "activity_data": {
    "task_name": "Sanificazione Frigo 2",
    "task_type": "sanitization",
    "frequency": "weekly",
    "department": "Cucina",
    "conservation_point": "Frigo 2 - Verdure",
    "assigned_to": "Staff Cucina",
    "start_date": "2025-01-15",
    "priority": "high",
    "estimated_duration": 45
  },
  "timestamp": "2025-01-14T14:00:00Z"
}
```

##### `temperature_reading_added` - Lettura Temperatura
**Quando:** Utente registra una lettura temperatura manuale
```json
{
  "activity_type": "temperature_reading_added",
  "entity_type": "temperature_reading",
  "entity_id": "temp-uuid-444",
  "activity_data": {
    "conservation_point": "Frigo 1 - Carni",
    "temperature_value": 3.5,
    "expected_range": { "min": 0, "max": 4 },
    "within_range": true,
    "reading_time": "2025-01-14T08:00:00Z",
    "notes": "Tutto regolare",
    "photo_attached": false
  },
  "timestamp": "2025-01-14T08:05:00Z"
}
```

##### `note_created` - Nota Creata
**Quando:** Utente crea una nota
```json
{
  "activity_type": "note_created",
  "entity_type": "note",
  "entity_id": "note-uuid-333",
  "activity_data": {
    "note_title": "Cambio fornitore latticini",
    "note_content": "Dal 20/01 nuovo fornitore: Caseificio Bianchi...",
    "category": "suppliers",
    "priority": "medium",
    "tags": ["fornitore", "latticini", "cambio"],
    "visibility": "all_company"
  },
  "timestamp": "2025-01-14T11:30:00Z"
}
```

##### `non_conformity_reported` - Non Conformità Segnalata
**Quando:** Utente segnala una non conformità
```json
{
  "activity_type": "non_conformity_reported",
  "entity_type": "non_conformity",
  "entity_id": "nc-uuid-222",
  "activity_data": {
    "nc_title": "Temperatura frigo fuori range",
    "nc_description": "Frigo 1 rilevato a 8°C invece di 4°C max",
    "severity": "high",
    "department": "Cucina",
    "conservation_point": "Frigo 1 - Latticini",
    "affected_products": ["Mozzarella", "Ricotta", "Yogurt"],
    "immediate_action": "Prodotti spostati in Frigo 2",
    "corrective_action_required": true,
    "reported_to_admin": true
  },
  "timestamp": "2025-01-14T13:00:00Z"
}
```

##### `page_view` - Visualizzazione Pagina
**Quando:** Utente naviga in una pagina (opzionale, configurabile)
```json
{
  "activity_type": "page_view",
  "activity_data": {
    "page_path": "/dashboard/inventory",
    "page_title": "Gestione Inventario",
    "referrer": "/dashboard",
    "time_on_page_seconds": 45,
    "actions_performed": 2
  },
  "timestamp": "2025-01-14T09:15:00Z"
}
```

##### `export_data` - Esportazione Dati
**Quando:** Utente esporta dati in PDF/Excel
```json
{
  "activity_type": "export_data",
  "activity_data": {
    "export_type": "pdf",
    "data_type": "temperature_report",
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-01-14"
    },
    "filters": {
      "department": "Cucina",
      "conservation_point": "all"
    },
    "records_exported": 456,
    "file_size_kb": 234
  },
  "timestamp": "2025-01-14T17:00:00Z"
}
```

---

<div style="page-break-after: always;"></div>

## 4. ESEMPIO REPORT COMPLETO

### 📊 Report Attività Giornaliero
**Azienda:** Ristorante "La Buona Tavola" S.r.l.  
**Data:** 14 Gennaio 2025  
**Generato da:** Sistema BHM v.2  
**Tipo Report:** Attività Giornaliera Completa

---

#### 📈 RIEPILOGO ESECUTIVO

| Metrica | Valore | Variazione vs. ieri |
|---------|--------|---------------------|
| **Sessioni Totali** | 12 | +2 (↑ 20%) |
| **Utenti Attivi** | 8 | +1 (↑ 14%) |
| **Task Completate** | 24 | +3 (↑ 14%) |
| **Prodotti Gestiti** | 15 | -2 (↓ 12%) |
| **Liste Spesa Create** | 1 | = |
| **Non Conformità** | 1 | +1 (⚠️) |
| **Tempo Medio Sessione** | 98 min | +12 min |

---

#### 👥 DETTAGLIO SESSIONI UTENTE

##### 1. Mario Rossi (Admin) - mario.rossi@labuonatavola.it

```
🟢 SESSIONE ATTIVA
├─ Inizio: 08:15:23
├─ Durata: 6h 23m (ancora attivo)
├─ Device: Desktop - Windows 11 - Chrome 120
├─ IP: 192.168.1.100
└─ Ultima attività: 14:38:45 (ora)

📊 ATTIVITÀ ESEGUITE (18 azioni):

08:15  ✅ Task Completata
       └─ Rilevamento Temperature Frigo 1
          Valore: 3.5°C ✓ (range: 0-4°C)
          Note: Tutto regolare

08:30  ✅ Task Completata
       └─ Rilevamento Temperature Frigo 2
          Valore: 2.8°C ✓ (range: 0-4°C)

09:00  📦 Prodotto Aggiunto
       └─ Mozzarella di Bufala DOP
          Quantità: 10 kg
          Categoria: Latticini
          Scadenza: 21/01/2025
          Punto: Frigo 1 - Latticini

09:15  📦 Prodotto Aggiunto
       └─ Parmigiano Reggiano 24 mesi
          Quantità: 5 kg
          Categoria: Latticini
          Scadenza: 15/03/2025

09:30  👤 Staff Aggiunto
       └─ Laura Verdi - Cuoca
          Reparto: Cucina
          Certificazioni: HACCP Base, Celiachia

10:00  🏢 Punto Conservazione Creato
       └─ Frigo 3 - Pesce
          Tipo: Refrigeratore
          Range: -2°C / +2°C
          Capacità: 500L

11:00  🏢 Reparto Creato
       └─ Cantina Vini
          Tipo: Storage
          Temperatura: 16°C
          Responsabile: Sommelier Giovanni

11:30  📝 Nota Creata
       └─ Cambio fornitore latticini
          Categoria: Fornitori
          Priorità: Media

13:00  ⚠️ Non Conformità Segnalata
       └─ Temperatura frigo fuori range
          Severità: Alta
          Punto: Frigo 1 - Latticini
          Azione: Prodotti spostati

13:30  📦 Prodotto Modificato
       └─ Mozzarella di Bufala DOP
          Quantità: 10kg → 7kg (-3kg)
          Motivo: Consumo servizio pranzo

14:00  ✅ Task Manutenzione Creata
       └─ Sanificazione Frigo 2
          Frequenza: Settimanale
          Data inizio: 15/01/2025
          Priorità: Alta

14:30  📋 Export Dati
       └─ Report Temperature PDF
          Periodo: 01/01 - 14/01/2025
          Records: 456
```

---

##### 2. Laura Bianchi (Responsabile) - laura.bianchi@labuonatavola.it

```
🔵 SESSIONE COMPLETATA
├─ Inizio: 09:30:15
├─ Fine: 13:45:22
├─ Durata: 4h 15m
├─ Device: Tablet - iOS 17 - Safari
├─ IP: 192.168.1.105
└─ Logout: Manuale

📊 ATTIVITÀ ESEGUITE (12 azioni):

09:30  ✅ Task Completata
       └─ Controllo Scaffalatura Dispensa
          Note: Tutto in ordine, nessuna criticità

10:15  ✅ Task Completata
       └─ Verifica Date Scadenza
          Prodotti controllati: 45
          Prodotti in scadenza (3gg): 8
          Prodotti scaduti: 0

10:45  📦 Prodotto Aggiunto
       └─ Olio EVO Toscano
          Quantità: 20 L
          Categoria: Condimenti
          Lotto: LOT20250110-B

11:00  📦 Prodotto Aggiunto
       └─ Pasta Secca Grano Duro
          Quantità: 50 confezioni
          Categoria: Dispensa

11:30  📦 Prodotto Aggiunto
       └─ Pomodori Pelati Bio
          Quantità: 30 lattine
          Categoria: Conserve

12:00  ✅ Task Completata
       └─ Inventario Parziale Dispensa
          Items contati: 150
          Discordanze: 2 (minori)

12:30  📝 Nota Creata
       └─ Ordine urgente olio
          Categoria: Ordini
          Priorità: Alta

13:15  🛒 Lista Spesa Creata
       └─ Lista Settimanale 14 Gen 2025
          Items: 18
          Categorie: 5
          Costo stimato: €450

13:45  🚪 Logout
       └─ Fine turno
```

---

##### 3. Giovanni Neri (Cuoco) - giovanni.neri@labuonatavola.it

```
🔵 SESSIONE COMPLETATA
├─ Inizio: 10:00:45
├─ Fine: 16:30:12
├─ Durata: 6h 29m
├─ Device: Mobile - Android 13 - Chrome
├─ IP: 192.168.1.112
└─ Logout: Manuale

📊 ATTIVITÀ ESEGUITE (8 azioni):

10:00  ✅ Task Completata
       └─ Rilevamento Temperature Frigo 3
          Valore: 1.5°C ✓ (range: -2/+2°C)

12:00  ✅ Task Completata
       └─ Rilevamento Temperature Celle Frigorifere
          Frigo 1: 3.2°C ✓
          Frigo 2: 2.9°C ✓
          Frigo 3: 1.8°C ✓

14:00  📦 Prodotto Modificato
       └─ Filetto di Manzo
          Quantità: 8kg → 3kg (-5kg)
          Motivo: Utilizzato per servizio cena

14:30  📦 Prodotto Modificato
       └─ Branzino Fresco
          Quantità: 12pz → 6pz (-6pz)
          Motivo: Servizio pranzo

15:00  ✅ Task Completata
       └─ Preparazione Mise en Place
          Portate preparate: 15
          Tempo impiegato: 45 min

15:30  📝 Nota Creata
       └─ Necessario ordinare pesce extra
          Categoria: Cucina
          Priorità: Alta

16:00  ✅ Task Completata
       └─ Pulizia Postazione Lavoro
          Status: Completata

16:30  🚪 Logout
       └─ Fine turno
```

---

##### 4. Silvia Martinelli (Cameriera) - silvia.martinelli@labuonatavola.it

```
🔵 SESSIONE COMPLETATA
├─ Inizio: 11:45:20
├─ Fine: 15:15:45
├─ Durata: 3h 30m
├─ Device: Mobile - iOS 17 - Safari
├─ IP: 192.168.1.118
└─ Logout: Manuale

📊 ATTIVITÀ ESEGUITE (5 azioni):

12:00  ✅ Task Completata
       └─ Controllo Dispensa Sala
          Prodotti verificati: Tovaglioli, posate, bicchieri
          Note: Tutto disponibile

13:00  📝 Nota Creata
       └─ Cliente con allergia glutine
          Categoria: Servizio
          Priorità: Alta
          Tavolo: 12

14:00  ✅ Task Completata
       └─ Servizio Pranzo
          Coperti serviti: 45
          Note: Tutto regolare

14:30  📝 Nota Creata
       └─ Feedback cliente
          Categoria: Qualità
          Commento positivo: Eccellente

15:15  🚪 Logout
       └─ Fine turno
```

---

##### 5-8. ALTRI UTENTI (Riepilogo)

```
🔵 Marco Ferri (Aiuto Cuoco)
   └─ 07:30 - 14:00 (6h 30m) - 6 task completate

🔵 Francesca Galli (Addetta Pulizie)
   └─ 06:00 - 09:30 (3h 30m) - 4 task completate

🔵 Roberto Colombo (Magazziniere)
   └─ 08:00 - 12:30 (4h 30m) - 8 prodotti gestiti

🔵 Elena Russo (Barista)
   └─ 17:00 - 23:00 (6h) - 3 task completate
```

---

<div style="page-break-after: always;"></div>

#### 📊 STATISTICHE DETTAGLIATE

##### Distribuzione Attività per Tipo

```
┌─────────────────────────────────┬────────┬──────────┐
│ Tipo Attività                   │ Totale │ % Totale │
├─────────────────────────────────┼────────┼──────────┤
│ ✅ Task Completate              │   24   │   37%    │
│ 📦 Prodotti Gestiti             │   15   │   23%    │
│ 🔐 Sessioni (login/logout)      │   16   │   25%    │
│ 📝 Note Create                  │    5   │    8%    │
│ 🛒 Liste Spesa                  │    2   │    3%    │
│ ⚠️  Non Conformità              │    1   │    2%    │
│ 🏢 Struttura (reparti/punti)    │    2   │    3%    │
│ 👤 Staff                        │    1   │    2%    │
└─────────────────────────────────┴────────┴──────────┘
```

##### Task per Reparto

```
┌──────────────────┬───────────┬─────────────┬────────────┐
│ Reparto          │ Totale    │ Temperature │ Altre      │
├──────────────────┼───────────┼─────────────┼────────────┤
│ Cucina           │    18     │     10      │     8      │
│ Sala             │     3     │      0      │     3      │
│ Magazzino        │     2     │      0      │     2      │
│ Cantina          │     1     │      1      │     0      │
└──────────────────┴───────────┴─────────────┴────────────┘
```

##### Prodotti per Categoria

```
┌──────────────────┬─────────┬─────────┬──────────┐
│ Categoria        │ Aggiunti│ Modific.│ Eliminati│
├──────────────────┼─────────┼─────────┼──────────┤
│ Latticini        │    3    │    2    │    1     │
│ Carne            │    2    │    1    │    0     │
│ Pesce            │    1    │    1    │    0     │
│ Condimenti       │    1    │    0    │    0     │
│ Dispensa         │    2    │    0    │    0     │
│ Conserve         │    1    │    0    │    0     │
└──────────────────┴─────────┴─────────┴──────────┘
```

##### Temperature Readings

```
┌────────────────────────┬────────┬──────────┬──────────┐
│ Punto Conservazione    │ N.Lett.│ In Range │ Fuori R. │
├────────────────────────┼────────┼──────────┼──────────┤
│ Frigo 1 - Carni        │   4    │    3     │    1     │
│ Frigo 2 - Verdure      │   3    │    3     │    0     │
│ Frigo 3 - Pesce        │   2    │    2     │    0     │
│ Cella 1 - Surgelati    │   1    │    1     │    0     │
└────────────────────────┴────────┴──────────┴──────────┘

⚠️ ALERT: 1 lettura fuori range rilevata → Frigo 1 alle 13:00
Azione correttiva: Implementata (prodotti spostati)
```

##### Timeline Oraria

```
Attività per Fascia Oraria (14 Gen 2025)

06:00 ▓░░░░░░░░░ 4 attività
07:00 ▓▓░░░░░░░░ 6 attività
08:00 ▓▓▓▓░░░░░░ 12 attività
09:00 ▓▓▓▓▓░░░░░ 18 attività  ← Picco
10:00 ▓▓▓▓░░░░░░ 15 attività
11:00 ▓▓▓░░░░░░░ 11 attività
12:00 ▓▓▓░░░░░░░ 10 attività
13:00 ▓▓▓▓░░░░░░ 13 attività
14:00 ▓▓▓░░░░░░░ 9 attività
15:00 ▓▓░░░░░░░░ 7 attività
16:00 ▓░░░░░░░░░ 5 attività
17:00 ▓░░░░░░░░░ 3 attività

Orario di maggior attività: 09:00-10:00 (18 azioni)
Orario di minor attività: 17:00+ (3 azioni)
```

---

<div style="page-break-after: always;"></div>

#### 🎯 INSIGHTS E RACCOMANDAZIONI

##### ✅ Punti di Forza

1. **Compliance HACCP Eccellente**
   - ✓ 100% delle letture temperature completate in tempo
   - ✓ Non conformità gestita immediatamente con azione correttiva
   - ✓ Tracciabilità prodotti completa

2. **Team Engagement Alto**
   - ✓ 8/10 membri staff attivi (80%)
   - ✓ Tempo medio sessione stabile (98 min)
   - ✓ Task completate nei tempi previsti

3. **Gestione Inventario Efficiente**
   - ✓ 15 prodotti gestiti correttamente
   - ✓ Movimentazioni tracciate con motivazioni
   - ✓ Lista spesa generata proattivamente

##### ⚠️ Aree di Miglioramento

1. **Temperatura Frigo 1**
   - ⚠️ 1 lettura fuori range rilevata (8°C vs 4°C max)
   - 📋 Raccomandazione: Verificare guarnizioni e sistema refrigerazione
   - 🔧 Azione: Manutenzione straordinaria programmata

2. **Distribuzione Carico Lavoro**
   - ⚠️ Picco di attività concentrato 09:00-10:00
   - 📋 Raccomandazione: Distribuire task su più fasce orarie
   - 🔧 Azione: Rivedere schedulazione task

3. **Utilizzo App Mobile**
   - ℹ️ Solo 37% sessioni da mobile
   - 📋 Raccomandazione: Incentivare uso mobile per task campo
   - 🔧 Azione: Training staff su funzionalità mobile

##### 📈 KPI vs. Target

```
┌────────────────────────────┬─────────┬─────────┬──────────┐
│ KPI                        │ Attuale │ Target  │ Status   │
├────────────────────────────┼─────────┼─────────┼──────────┤
│ Task Completate/Giorno     │   24    │   20    │ ✅ +20%  │
│ Utenti Attivi/Giorno       │    8    │   10    │ ⚠️ -20%  │
│ Temperature in Range       │   90%   │   95%   │ ⚠️ -5%   │
│ Non Conformità/Giorno      │    1    │    0    │ ⚠️ +1    │
│ Tempo Risposta NC (min)    │   15    │   30    │ ✅ -50%  │
│ Prodotti Tracciati         │  100%   │  100%   │ ✅ OK    │
└────────────────────────────┴─────────┴─────────┴──────────┘
```

---

#### 📋 AZIONI RICHIESTE

##### Urgenti (entro 24h)

1. ⚡ **Manutenzione Frigo 1**
   - Responsabile: Tecnico Assistenza
   - Deadline: 15/01/2025 10:00
   - Priorità: ALTA

2. ⚡ **Follow-up Non Conformità**
   - Responsabile: Mario Rossi (Admin)
   - Verifica azione correttiva efficace
   - Deadline: 15/01/2025 14:00

##### Breve Termine (entro 7gg)

1. 📅 **Riorganizzazione Schedule Task**
   - Responsabile: Laura Bianchi
   - Distribuire carico 09:00-10:00
   - Deadline: 20/01/2025

2. 📅 **Training Mobile App**
   - Responsabile: Mario Rossi
   - Target: Staff Sala e Cucina
   - Deadline: 21/01/2025

##### Medio Termine (entro 30gg)

1. 📆 **Revisione KPI Utenti Attivi**
   - Responsabile: Management
   - Analisi calo 20% vs target
   - Piano incentivazione utilizzo

---

<div style="page-break-after: always;"></div>

## 5. STATISTICHE DISPONIBILI

### 📊 Report Predefiniti

L'applicazione offre diverse tipologie di report predefiniti accessibili agli amministratori:

#### 1. Report Sessioni Attive

**Contenuto:**
- Utenti attualmente connessi
- Orario inizio sessione
- Durata sessione
- Ultima attività
- Device utilizzato
- IP Address

**Aggiornamento:** Real-time (ogni 30 secondi)

**Esempio Output:**
```
👥 Sessioni Attive (5)
├─ Mario Rossi (Admin)
│  └─ Inizio: 08:15 | Durata: 6h 23m | Desktop | Ultima attività: ora
├─ Laura Bianchi (Responsabile)
│  └─ Inizio: 09:30 | Durata: 5h 8m | Tablet | Ultima attività: 2 min fa
├─ Giovanni Neri (Cuoco)
│  └─ Inizio: 10:00 | Durata: 4h 38m | Mobile | Ultima attività: 15 min fa
└─ ...
```

---

#### 2. Report Attività per Utente

**Contenuto:**
- Timeline completa attività utente
- Filtri: Tipo attività, periodo, reparto
- Dettaglio ogni azione eseguita
- Statistiche personali

**Periodo:** Configurabile (oggi, settimana, mese, custom)

**Esempio Output:**
```
📊 Attività Mario Rossi - Oggi (18 azioni)

✅ Task Completate: 8
   ├─ Temperature: 5
   ├─ Sanificazione: 1
   ├─ Verifiche: 2

📦 Prodotti Gestiti: 5
   ├─ Aggiunti: 3
   ├─ Modificati: 2

🏢 Gestione Struttura: 3
   ├─ Reparti: 1
   ├─ Punti Conservazione: 1
   ├─ Staff: 1

⚠️ Non Conformità: 1
📝 Note: 2
```

---

#### 3. Report Attività Azienda (Admin Only)

**Contenuto:**
- Tutte attività di tutti gli utenti
- Filtri avanzati multipli
- Export CSV/PDF
- Grafici e visualizzazioni

**Periodo:** Configurabile

**Esempio Output:**
```
📊 Attività Azienda "La Buona Tavola" - Settimana

Riepilogo Generale:
├─ Sessioni: 78 (+12% vs settimana precedente)
├─ Utenti Attivi: 10 (100% staff)
├─ Task Completate: 156 (+8%)
├─ Prodotti Gestiti: 89 (-5%)
├─ Liste Spesa: 3 (=)
├─ Non Conformità: 2 (-50% ✅)

Top Performers:
1. Mario Rossi: 45 attività
2. Laura Bianchi: 38 attività
3. Giovanni Neri: 32 attività

Reparti più Attivi:
1. Cucina: 120 attività (77%)
2. Sala: 25 attività (16%)
3. Magazzino: 11 attività (7%)
```

---

#### 4. Report Statistiche Aggregate

**Contenuto:**
- Conteggi per tipo attività
- Trend temporali
- Utenti unici per attività
- Performance metrics

**Visualizzazioni:**
- Grafici a barre
- Heatmap orarie/giornaliere
- Pie chart distribuzioni
- Trend lines

**Esempio Query SQL Disponibile:**
```sql
-- Statistiche Settimanali
SELECT 
  activity_type,
  COUNT(*) as total_count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(timestamp) as last_activity
FROM user_activity_logs
WHERE company_id = 'xxx'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY activity_type
ORDER BY total_count DESC
```

---

#### 5. Report Task Completate

**Contenuto:**
- Tutte task completate
- Filtri: Tipo, reparto, utente, periodo
- Valori registrati (temperature, etc.)
- Anomalie rilevate

**Esempio Output:**
```
✅ Task Completate - Gennaio 2025

Riepilogo:
├─ Totale: 356
├─ Temperature: 180 (51%)
├─ Sanificazioni: 95 (27%)
├─ Verifiche: 81 (23%)

Performance:
├─ Completate in tempo: 348 (98%)
├─ In ritardo: 8 (2%)
├─ Valori fuori range: 12 (7% delle temperature)

Alert Critici:
⚠️ 12 letture temperature fuori range
   └─ Tutte gestite con azioni correttive
```

---

#### 6. Report Inventario Movimentazioni

**Contenuto:**
- Tutti i movimenti prodotti
- Aggiunte, modifiche, eliminazioni
- Valore economico movimenti
- Trend scorte

**Esempio Output:**
```
📦 Movimentazioni Inventario - Gennaio 2025

Totali:
├─ Prodotti Aggiunti: 145 (valore: €12.450)
├─ Prodotti Modificati: 89 (consumo: €3.200)
├─ Prodotti Eliminati: 15 (perdita: €450)

Categorie più movimentate:
1. Latticini: 65 movimenti (€4.200)
2. Carne: 48 movimenti (€5.800)
3. Pesce: 42 movimenti (€3.500)

⚠️ Prodotti Eliminati (scadenze):
└─ 15 prodotti (3% del totale) - Perdita €450
   Suggerimento: Rivedere quantità ordini
```

---

#### 7. Report Non Conformità

**Contenuto:**
- Tutte NC registrate
- Severità e tipo
- Tempi di risposta
- Azioni correttive

**Esempio Output:**
```
⚠️ Non Conformità - Gennaio 2025

Totali: 8 (-20% vs dicembre ✅)

Per Severità:
├─ Alta: 3 (38%)
├─ Media: 4 (50%)
└─ Bassa: 1 (12%)

Per Tipo:
├─ Temperature: 5 (62%)
├─ Pulizia: 2 (25%)
└─ Altro: 1 (13%)

Performance Risposta:
├─ Tempo medio risposta: 18 minuti
├─ Azioni correttive: 8/8 (100%)
├─ Follow-up chiusi: 7/8 (88%)

Trend: Miglioramento generale ✅
```

---

<div style="page-break-after: always;"></div>

## 6. ACCESSO AI DATI

### 🔑 Permessi e Visibilità

#### Per Utente Standard

**Può Visualizzare:**
- ✅ Proprie attività complete
- ✅ Proprie sessioni
- ✅ Proprie task completate
- ❌ Attività altri utenti
- ❌ Statistiche aziendali

**Query Disponibili:**
```typescript
// Frontend Hook
const { data: myActivities } = useUserActivities({
  activity_type: 'task_completed', // opzionale
  start_date: '2025-01-01',        // opzionale
  end_date: '2025-01-31',          // opzionale
  limit: 100,                       // default 100
  offset: 0                         // paginazione
})
```

---

#### Per Admin

**Può Visualizzare:**
- ✅ Tutte attività azienda
- ✅ Attività tutti gli utenti
- ✅ Statistiche aggregate
- ✅ Sessioni attive
- ✅ Report esportabili

**Query Disponibili:**
```typescript
// 1. Tutte attività azienda
const { data: companyActivities } = useCompanyActivities({
  activity_type: 'task_completed',  // opzionale
  user_id: 'user-uuid',             // opzionale
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  limit: 500,
  offset: 0
})

// 2. Statistiche
const { data: stats } = useActivityStatistics(
  '2025-01-01',  // start_date
  '2025-01-31'   // end_date
)

// 3. Sessioni attive
const { data: sessions } = useActiveSessions()
```

---

### 📡 API Endpoints

#### Database Functions Disponibili

1. **log_user_activity**
```sql
SELECT log_user_activity(
  p_user_id := 'user-uuid',
  p_company_id := 'company-uuid',
  p_session_id := 'session-uuid',
  p_activity_type := 'task_completed',
  p_activity_data := '{"task_name": "Test"}'::jsonb,
  p_entity_type := 'maintenance_task',
  p_entity_id := 'entity-uuid',
  p_ip_address := '192.168.1.100',
  p_user_agent := 'Chrome/120'
)
```

2. **get_user_activities**
```sql
SELECT * FROM get_user_activities(
  p_user_id := 'user-uuid',
  p_activity_type := NULL,  -- tutti i tipi
  p_start_date := '2025-01-01'::timestamptz,
  p_end_date := '2025-01-31'::timestamptz,
  p_limit := 100,
  p_offset := 0
)
```

3. **get_company_activities** (Admin only)
```sql
SELECT * FROM get_company_activities(
  p_company_id := 'company-uuid',
  p_activity_type := NULL,
  p_user_id := NULL,  -- tutti gli utenti
  p_start_date := '2025-01-01'::timestamptz,
  p_end_date := '2025-01-31'::timestamptz,
  p_limit := 500,
  p_offset := 0
)
```

4. **get_activity_statistics** (Admin only)
```sql
SELECT * FROM get_activity_statistics(
  p_company_id := 'company-uuid',
  p_start_date := '2025-01-01'::timestamptz,
  p_end_date := '2025-01-31'::timestamptz
)
```

5. **get_active_sessions**
```sql
SELECT * FROM get_active_sessions(
  p_company_id := 'company-uuid'
)
```

---

### 📊 Export Formati

Gli admin possono esportare i dati in:

1. **CSV** - Per analisi Excel/Spreadsheet
2. **PDF** - Per report formali stampabili
3. **JSON** - Per integrazioni API

**Esempio Export CSV:**
```csv
timestamp,user_email,activity_type,entity_type,entity_name,details
2025-01-14T08:15:23Z,mario.rossi@example.com,task_completed,maintenance_task,Temperature Frigo 1,"3.5°C (range: 0-4°C)"
2025-01-14T09:00:15Z,mario.rossi@example.com,product_added,product,Mozzarella Bufala,"10kg, Scad: 21/01/2025"
...
```

---

<div style="page-break-after: always;"></div>

## 7. CASI D'USO PRATICI

### 🎯 Scenari Reali

#### Scenario 1: Audit HACCP

**Situazione:** Controllo ASL chiede documentazione movimentazioni ultimo mese

**Azione Admin:**
1. Accede a "Activity Tracking"
2. Filtra periodo: 14/12/2024 - 14/01/2025
3. Filtra tipo: 
   - `task_completed` (temperature)
   - `product_added`
   - `product_deleted`
   - `non_conformity_reported`
4. Export PDF completo

**Risultato:**
- ✅ Report completo in 2 minuti
- ✅ Tracciabilità 100%
- ✅ Non conformità documentate con azioni correttive
- ✅ Conformità verificata

---

#### Scenario 2: Analisi Performance Staff

**Situazione:** Valutazione mensile dipendenti

**Azione Admin:**
1. Report attività per utente
2. Periodo: Gennaio 2025
3. Metriche analizzate:
   - Task completate
   - Puntualità (task in tempo)
   - Qualità (valori fuori range)
   - Proattività (note, segnalazioni)

**Risultato:**
```
📊 Performance Mario Rossi - Gennaio

✅ Task Completate: 95/100 (95%)
⏰ Puntualità: 93/95 (98%)
🎯 Qualità: 2 valori fuori range (2%)
💡 Proattività: 12 note, 3 NC segnalate

Valutazione: ⭐⭐⭐⭐⭐ Eccellente
```

---

#### Scenario 3: Investigazione Problema

**Situazione:** Lotto prodotto ritirato dal fornitore, necessario identificare dove è stato utilizzato

**Azione Admin:**
1. Cerca in activities
2. Filtro: `product_added`
3. Cerca `lot_number: "LOT20250110-B"`
4. Visualizza dettagli: 
   - Chi ha inserito il prodotto
   - Quando
   - Dove conservato
5. Cerca `product_updated` per stesso product_id
   - Quando è stato utilizzato
   - Da chi
   - Per quale servizio

**Risultato:**
```
📦 Lotto LOT20250110-B - Tracciamento

Inserimento:
├─ Data: 10/01/2025 09:30
├─ Utente: Laura Bianchi
├─ Prodotto: Olio EVO Toscano
├─ Quantità: 20 L
└─ Posizione: Dispensa A - Scaffale 3

Utilizzo:
├─ 11/01/2025 12:00 - 5L (Servizio pranzo)
├─ 12/01/2025 12:00 - 4L (Servizio pranzo)
├─ 13/01/2025 12:00 - 3L (Servizio pranzo)
└─ Rimanente: 8L → DA SMALTIRE ⚠️

Azione: Prodotto ritirato e smaltito
```

---

#### Scenario 4: Ottimizzazione Operazioni

**Situazione:** Admin vuole ottimizzare distribuzione task

**Azione Admin:**
1. Report statistiche aggregate
2. Visualizza heatmap attività per orario
3. Identifica picchi/valli
4. Ridistribuisce task

**Risultato:**
```
📊 Heatmap Attività Settimanali

        Lun  Mar  Mer  Gio  Ven  Sab  Dom
06:00   ▓░░  ▓░░  ▓░░  ▓░░  ▓░░  ░░░  ░░░
07:00   ▓▓░  ▓▓░  ▓▓░  ▓▓░  ▓▓░  ▓░░  ░░░
08:00   ▓▓▓  ▓▓▓  ▓▓▓  ▓▓▓  ▓▓▓  ▓▓░  ▓░░
09:00   ███  ███  ███  ███  ███  ▓▓▓  ▓▓░  ← PICCO
10:00   ▓▓▓  ▓▓▓  ▓▓▓  ▓▓▓  ▓▓▓  ▓▓▓  ▓▓░
11:00   ▓▓░  ▓▓░  ▓▓░  ▓▓░  ▓▓░  ▓▓░  ▓░░
12:00   ▓▓░  ▓▓░  ▓▓░  ▓▓░  ▓▓░  ▓▓░  ▓░░
...

💡 Raccomandazione:
Spostare alcune task dalle 09:00 alle 07:00 o 11:00
per distribuire meglio il carico di lavoro
```

---

#### Scenario 5: Report Mensile Management

**Situazione:** Presentazione mensile ai proprietari

**Azione Admin:**
1. Export report completo mese
2. Include:
   - KPI generali
   - Conformità HACCP
   - Performance team
   - Costi inventario
   - Non conformità e risoluzioni

**Risultato:** Report PDF 15 pagine con:
- Executive Summary
- Statistiche dettagliate
- Grafici e visualizzazioni
- Raccomandazioni
- Piano azioni prossimo mese

---

<div style="page-break-after: always;"></div>

## 📌 APPENDICE

### A. Glossario Termini

| Termine | Definizione |
|---------|-------------|
| **Activity Type** | Tipo di attività tracciata (es. task_completed) |
| **Entity Type** | Tipo di entità collegata all'attività (es. product) |
| **Session** | Periodo di utilizzo app da login a logout |
| **RLS** | Row-Level Security - sicurezza a livello di riga |
| **Audit Trail** | Traccia completa e immutabile di tutte le operazioni |
| **JSONB** | Formato JSON binario per dati flessibili PostgreSQL |

---

### B. Contatti Supporto

**Supporto Tecnico BHM v.2**
- 📧 Email: support@bhm.example.com
- 📞 Tel: +39 XXX XXX XXXX
- 🌐 Web: https://bhm.example.com/support

**Documentazione:**
- 📚 Manuale Utente: `/docs/user-guide`
- 🔧 Manuale Admin: `/docs/admin-guide`
- 💻 API Docs: `/docs/api`

---

### C. Note Legali

Questo documento è proprietario e confidenziale. Tutti i dati presentati sono fittizi e utilizzati solo a scopo dimostrativo.

**Privacy & GDPR:**
- I dati utente sono protetti secondo GDPR
- Retention periodo: 90 giorni (configurabile)
- IP address anonimizzati dopo 30 giorni
- Export dati su richiesta utente

---

### D. Changelog Report

| Versione | Data | Modifiche |
|----------|------|-----------|
| 1.0 | 14/01/2025 | Prima versione report |

---

<div style="text-align: center; margin-top: 50px;">
  <h3>Fine Report</h3>
  <p>Business HACCP Manager v.2</p>
  <p>Generato il: 14 Gennaio 2025</p>
  <p>© 2025 BHM. Tutti i diritti riservati.</p>
</div>

