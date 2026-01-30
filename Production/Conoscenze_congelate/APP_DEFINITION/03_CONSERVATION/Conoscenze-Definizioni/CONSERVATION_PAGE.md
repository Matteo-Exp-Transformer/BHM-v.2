# CONSERVATION_PAGE - DOCUMENTAZIONE COMPLETA

**Data Creazione**: 2026-01-16
**Ultima Modifica**: 2026-01-30
**Versione**: 2.0.0
**File Componente**: `src/features/conservation/ConservationPage.tsx`
**Tipo**: Pagina

**Nuove Features (v2.0.0)**:
- ✅ **Profili HACCP** (5 profili × 4 categorie elettrodomestico) per frigoriferi
- ✅ **Immagine Elettrodomestico** con modal lightbox fullscreen
- ✅ **Layout Split** categorie (sx) + immagine (dx) per frigoriferi
- ✅ **Nome Utente** nelle registrazioni temperature (`recorded_by` → `user_profiles`)
- ✅ **Pulsante "Visualizza nel Calendario"** nelle card manutenzioni
- ✅ **Costanti Centralizzate** in `conservationConstants.ts`
- ✅ **Recurrence Config** per manutenzioni (rispetta giorni configurati)

---

## 🎯 SCOPO

### Scopo Business
La pagina Conservazione permette agli utenti di avere sott'occhio lo **stato generale dei punti di conservazione** inseriti. Rappresenta il centro di controllo principale per:

- **Monitorare** tutti i punti di conservazione (frigoriferi, freezer, abbattitori, ambienti/dispense)
- **Consultare** le informazioni dettagliate di ogni punto (temperatura target, stato, categorie prodotti, manutenzioni)
- **Registrare** nuove letture di temperatura (con **nome utente visibile**)
- **Gestire** i punti di conservazione (creare, modificare, eliminare)
- **Visualizzare** statistiche e distribuzione per tipo
- **Utilizzare profili HACCP pre-configurati** per frigoriferi con auto-configurazione
- **Navigare al calendario** direttamente dalle card manutenzioni

Questa pagina risolve il bisogno di avere una vista centralizzata per la conformità HACCP e il monitoraggio delle temperature nei punti di conservazione dell'azienda.

### Scopo Tecnico
La pagina `ConservationPage` è un componente React che:

- **Carica** tutti i punti di conservazione dell'azienda dal database
- **Aggrega** le statistiche (totale, per stato, per tipo)
- **Organizza** la visualizzazione per tipo usando componenti `CollapsibleCard` annidati
- **Gestisce** i modal per creare/modificare punti e registrare temperature
- **Integra** il componente `ScheduledMaintenanceCard` per visualizzare le manutenzioni programmate
- **Supporta profili HACCP** (5 profili per 4 categorie elettrodomestico)
- **Mostra nome utente** nelle letture temperatura (via `useTemperatureReadings`)

---

## 📝 UTILIZZO

### Quando Viene Utilizzato
La pagina viene mostrata quando:

- L'utente naviga alla sezione "Conservazione" dal menu principale dell'applicazione
- L'utente ha completato l'onboarding (i punti di conservazione possono essere vuoti)
- L'utente ha i permessi per visualizzare i punti di conservazione della propria azienda

**Condizioni di accesso:**
- L'utente deve essere autenticato
- L'utente deve avere un `company_id` valido (gestito tramite `useAuth()`)
- Non sono necessari permessi specifici per la visualizzazione (politiche RLS gestiscono l'accesso)

**Ruoli utente:**
- **Tutti i membri** possono visualizzare i punti di conservazione
- Solo **manager/admin** possono creare/modificare/eliminare punti (gestito da RLS policies)

### Casi d'Uso Principali

1. **Consultare stato punti conservazione**
   - **Scenario**: Un responsabile HACCP vuole verificare lo stato di tutti i frigoriferi prima dell'ispezione
   - **Azione**: Apre la pagina, espande la sezione "Punti di Conservazione", visualizza le card organizzate per tipo
   - **Risultato**: Vede lo stato di ogni punto (Regolare/Attenzione/Critico) con informazioni chiave

2. **Registrare nuova temperatura**
   - **Scenario**: Un dipendente ha appena controllato la temperatura del frigorifero principale
   - **Azione**: Usa il dropdown "Registra temperatura..." nella sezione "Letture Temperature", seleziona il punto, inserisce la temperatura
   - **Risultato**: La lettura viene salvata e visualizzata nella lista, aggiornando lo stato del punto se necessario

3. **Creare nuovo punto di conservazione**
   - **Scenario**: L'azienda ha acquistato un nuovo frigorifero e deve configurarlo nel sistema
   - **Azione**: Clicca "Aggiungi Punto", compila il form con nome, reparto, tipologia, temperatura target, categorie prodotti, manutenzioni obbligatorie
   - **Risultato**: Il punto viene creato con tutte le manutenzioni configurate e visualizzato nella lista appropriata

4. **Verificare manutenzioni in scadenza**
   - **Scenario**: Un responsabile vuole vedere quali manutenzioni sono imminenti o scadute
   - **Azione**: Visualizza la sezione "Manutenzioni Programmivate" che mostra le manutenzioni con stato, oppure controlla lo stato di ogni punto (giallo = in scadenza, rosso = scaduto)
   - **Risultato**: Identifica rapidamente i punti che richiedono intervento

5. **Creare frigorifero con profilo HACCP** (v2.0.0)
   - **Scenario**: Manager vuole aggiungere un frigorifero usando un profilo HACCP standard
   - **Azione**: Clicca "Aggiungi Punto", seleziona tipologia "Frigorifero", sceglie categoria elettrodomestico (es. "Frigorifero Verticale con Freezer"), seleziona profilo HACCP (es. "Bibite e Bevande Alcoliche")
   - **Risultato**: Temperatura e categorie prodotti vengono auto-configurate dal profilo. Immagine elettrodomestico visibile con click-to-enlarge. Punto salvato con `profile_id` e `appliance_category`

6. **Visualizzare chi ha registrato temperatura** (v2.0.0)
   - **Scenario**: Responsabile HACCP vuole verificare chi ha effettuato le registrazioni temperature
   - **Azione**: Espande la sezione "Letture Temperature", visualizza le card delle letture
   - **Risultato**: Ogni card mostra **nome e cognome** dell'utente che ha registrato la temperatura (campo `recorded_by` → `user_profiles`)

7. **Navigare al calendario dalle manutenzioni** (v2.0.0)
   - **Scenario**: Manager vuole vedere le manutenzioni nel contesto del calendario
   - **Azione**: Sulla card di una manutenzione in scadenza, clicca "Visualizza nel Calendario"
   - **Risultato**: Si apre la pagina "Attività" con il modal Manutenzioni aperto sulla data di scadenza e la manutenzione evidenziata con bordo animato

### Flusso Utente

**Flusso principale - Consultazione:**
1. Utente naviga a "Conservazione" dal menu principale
2. La pagina carica automaticamente tutti i punti di conservazione dell'azienda
3. Utente vede header con titolo "Sistema di Conservazione" e sottotitolo
4. Utente può espandere/collassare la sezione "Punti di Conservazione" (di default espansa)
5. Nella sezione espansa, vede sottosezioni organizzate per tipo (Frigoriferi, Freezer, Abbattitori, Ambiente/Dispensa)
6. Ogni sottosezione mostra le card dei punti di quel tipo
7. Cliccando su una card, può vedere dettagli o modificare/eliminare

**Flusso creazione nuovo punto:**
1. Utente clicca "Aggiungi Punto" nell'header della CollapsibleCard
2. Si apre il modal `AddPointModal`
3. Utente compila nome, seleziona reparto, sceglie tipologia (che auto-imposta il range temperatura)
4. **Se tipologia = "Frigorifero"** (v2.0.0):
   - Appare sezione "Profilo Punto di Conservazione" con layout split
   - Utente seleziona **Categoria Elettrodomestico** (es. "Frigorifero Verticale con Freezer")
   - Utente seleziona **Profilo HACCP** (es. "Massima Capienza", "Carne + Generico", "Bibite e Bevande Alcoliche")
   - Temperatura e categorie vengono **auto-configurate** dal profilo (read-only)
   - Immagine elettrodomestico appare nella colonna destra (click per lightbox)
5. **Se altra tipologia**: Utente inserisce temperatura target e seleziona categorie manualmente
6. Utente configura le 4 manutenzioni obbligatorie (o 2 per tipo ambiente)
7. Utente salva, il punto viene creato e la lista si aggiorna

**Flusso creazione frigorifero con profilo HACCP (v2.0.0):**
1. Utente clicca "Aggiungi Punto"
2. Compila nome (es. "Frigo Bar")
3. Seleziona reparto (es. "Bar")
4. Sceglie tipologia "Frigorifero" → **layout split appare immediatamente**
5. Colonna sinistra: Placeholder "Seleziona un profilo HACCP"
6. Colonna destra: Placeholder "Seleziona una categoria elettrodomestico"
7. Utente seleziona "Frigorifero Verticale con Freezer" → **immagine appare**
8. Utente seleziona "Bibite e Bevande Alcoliche" → **categorie auto-configurate** (Frutta/Verdure, Acqua, Succhi, Bibite gassate, Bevande Alcoliche)
9. Note HACCP: "Categorie senza range di temperatura obbligatorio; adatto a cella bevande / bar. Temperatura consigliata: 4°C."
10. Utente configura manutenzioni e salva

**Flusso registrazione temperatura:**
1. Utente usa il dropdown "Registra temperatura..." nella sezione "Letture Temperature"
2. Seleziona un punto di conservazione
3. Si apre il modal `AddTemperatureModal`
4. Utente inserisce la temperatura rilevata, seleziona metodo (manuale/termometro digitale/sensore automatico)
5. Utente salva → la lettura viene registrata con `recorded_by` = user.id
6. La lista si aggiorna mostrando **nome utente** (es. "Registrata da: Mario Rossi")

**Dettaglio nome utente (v2.0.0):**
- `recorded_by` → `user_profiles.auth_user_id` → `first_name`, `last_name`
- **Fallback**: Se non trovato in `user_profiles`, cerca in `company_members` → `staff`
- **Query**: `useTemperatureReadings` esegue join per risolvere nome utente

---

## ⚠️ CONFLITTI E GESTIONE

### Conflitti Possibili

#### Conflitto 1: Modifica simultanea di un punto di conservazione
- **Quando si verifica**: Due utenti manager modificano contemporaneamente lo stesso punto di conservazione
- **Cosa succede**: Il secondo salvataggio sovrascrive le modifiche del primo senza avvisare
- **Come viene gestito**: **ATTUALMENTE NON GESTITO** - Non c'è optimistic locking o versioning
- **Esempio**: Manager A modifica la temperatura target da 2°C a 3°C, Manager B modifica il reparto. Il salvataggio di B sovrascrive anche la temperatura, riportandola a 2°C.

**Soluzione proposta**: Implementare optimistic locking con `updated_at` timestamp. Prima di salvare, verificare che `updated_at` nel database sia uguale a quello della versione caricata. Se diverso, mostrare conflitto e permettere merge o sovrascrittura.

#### Conflitto 2: Eliminazione punto con letture temperatura associate
- **Quando si verifica**: Un manager elimina un punto di conservazione che ha letture di temperatura registrate
- **Cosa succede**: Le letture vengono eliminate automaticamente (CASCADE) - **comportamento corretto**
- **Come viene gestito**: Il database ha `ON DELETE CASCADE` configurato, quindi le letture vengono eliminate automaticamente senza lasciare riferimenti orfani
- **Esempio**: Eliminando "Frigo 1 Cucina", tutte le 50 letture temperatura associate vengono eliminate automaticamente.

#### Conflitto 3: Modifica temperatura target con categorie prodotti già assegnate
- **Quando si verifica**: Un manager modifica la temperatura target di un punto, ma questa nuova temperatura non è compatibile con alcune categorie prodotti già selezionate
- **Cosa succede**: **ATTUALMENTE NON GESTITO** - Il sistema permette di salvare anche se la temperatura non è compatibile con le categorie
- **Come viene gestito**: Non c'è validazione incrociata tra temperatura e categorie selezionate durante l'editing
- **Esempio**: Punto ha temperatura 2°C e categoria "Carni fresche" (range 1-4°C). Manager modifica temperatura a 10°C. Il salvataggio va a buon fine, ma la categoria non è più compatibile.

**Soluzione proposta**: Durante il salvataggio in modalità edit, validare che tutte le categorie selezionate siano compatibili con la nuova temperatura. Se non compatibili, mostrare warning e permettere di rimuovere le categorie incompatibili o modificare la temperatura.

#### Conflitto 4: Manutenzioni programmate per punto eliminato
- **Quando si verifica**: Un punto viene eliminato, ma aveva manutenzioni programmate nel calendario
- **Cosa succede**: Le manutenzioni vengono eliminate automaticamente (CASCADE) - **comportamento corretto**
- **Come viene gestito**: Il database ha `ON DELETE CASCADE` configurato per `maintenance_tasks.conservation_point_id`
- **Esempio**: Eliminando un punto con 4 manutenzioni obbligatorie configurate, tutte vengono eliminate.

### Conflitti Multi-Utente

**Modifica simultanea punto di conservazione:**
- **Comportamento attuale**: L'ultimo salvataggio vince, senza notificare l'altro utente
- **Rischio**: Perdita di dati se due utenti modificano campi diversi contemporaneamente
- **Soluzione proposta**: Implementare optimistic locking con `updated_at` timestamp. Se `updated_at` è cambiato tra il caricamento e il salvataggio, mostrare dialog di conflitto con:
  - Mostrare valori attuali vs valori modificati
  - Permettere di scegliere quali modifiche mantenere
  - Opzione "Aggiorna e ricarica" per ottenere la versione più recente

**Registrazione temperatura simultanea:**
- **Comportamento attuale**: Non c'è conflitto - ogni lettura è indipendente, quindi due utenti possono registrare temperature diverse per lo stesso punto contemporaneamente
- **Comportamento corretto**: Le letture vengono create con timestamp, quindi l'ordine è determinato dalla data/ora. L'ultima lettura diventa la `last_temperature_reading` del punto.

**Creazione punto simultanea:**
- **Comportamento attuale**: Non c'è conflitto - ogni punto è indipendente. Due manager possono creare punti contemporaneamente senza problemi.

### Conflitti di Sincronizzazione

**Comportamento offline:**
- **Situazione**: L'app non gestisce attualmente lo stato offline
- **Cosa succede**: Se l'utente è offline, le chiamate API falliscono e viene mostrato un errore generico
- **Rischio**: Perdita di dati se l'utente ha creato/modificato dati senza connessione

**Soluzione proposta**: Implementare sistema di sincronizzazione offline con:
- Queue locale per operazioni pendenti
- Sync automatico quando la connessione viene ripristinata
- Indicatore visivo dello stato di sincronizzazione

**Gestione conflitti al ripristino connessione:**
- **Problema**: Se due utenti hanno modificato lo stesso punto mentre erano offline, ci sono conflitti al sync
- **Soluzione proposta**: Usare timestamps per determinare la versione più recente, con fallback a "last write wins"

---

## 🔧 MODO IN CUI VIENE GENERATO

### Generazione Automatica
La pagina viene generata automaticamente quando:

- L'utente naviga alla route `/conservation` (definita nel router dell'applicazione)
- Il componente viene montato e carica i dati automaticamente tramite `useConservationPoints()` hook

**Trigger di caricamento:**
- Mount del componente (`useEffect` interno all'hook `useQuery`)
- Invalidation della query cache (dopo creazione/modifica/eliminazione)
- Cambio di `company_id` (utente cambia azienda)

### Generazione Manuale
Non applicabile - questa è una pagina, non un elemento creato dall'utente.

### Condizioni di Generazione

**Condizioni obbligatorie:**
1. Utente autenticato (gestito da `ProtectedRoute` wrapper)
2. `company_id` valido presente nel contesto auth
3. Permessi di lettura per la tabella `conservation_points` (RLS policy)

**Condizioni opzionali:**
- Punti di conservazione possono essere vuoti (sezione mostra messaggio "Nessun punto di conservazione")
- Reparti possono essere vuoti (il form mostra warning se non ci sono reparti disponibili)

---

## 💻 SCRITTURA DEL CODICE

### Struttura Componente

```typescript
import { useState } from 'react'
import { Plus, Thermometer, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react'
import { useConservationPoints } from './hooks/useConservationPoints'
import { useTemperatureReadings } from './hooks/useTemperatureReadings'
import { ConservationPointCard } from './components/ConservationPointCard'
import { AddPointModal } from './components/AddPointModal'
import { AddTemperatureModal } from './components/AddTemperatureModal'
import { TemperatureReadingCard } from './components/TemperatureReadingCard'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { ScheduledMaintenanceCard } from '@/features/dashboard/components/ScheduledMaintenanceCard'
import type { ConservationPoint, TemperatureReading } from '@/types/conservation'

export default function ConservationPage() {
  // State management
  // Hooks per dati
  // Handler functions
  // Render
}
```

### Props Richieste
Questo è un componente di pagina (route component), quindi **non riceve props**. I dati vengono caricati tramite hooks che accedono al contesto di autenticazione.

### State Management

**State locale (useState):**
- `showAddModal: boolean` - controlla visibilità modal creazione/modifica punto
- `editingPoint: ConservationPoint | null` - punto in modifica (null = creazione nuova)
- `showTemperatureModal: boolean` - controlla visibilità modal registrazione temperatura
- `selectedPointForTemperature: ConservationPoint | null` - punto per cui registrare temperatura
- `editingReading: TemperatureReading | null` - lettura in modifica (attualmente non usato, feature futura)

**State globale (hooks + React Query):**
- `conservationPoints: ConservationPoint[]` - lista punti (da `useConservationPoints`)
- `temperatureReadings: TemperatureReading[]` - lista letture (da `useTemperatureReadings`)
- `stats: ConservationStats` - statistiche aggregate (da `useConservationPoints`)
- `isLoading: boolean` - stato caricamento punti
- `isLoadingReadings: boolean` - stato caricamento letture

**Cache management (React Query):**
- Query key: `['conservation-points', companyId]`
- Auto-refresh: quando viene invalidata la cache dopo mutazioni (create/update/delete)
- Cache time: default di React Query (5 minuti)

### Hooks Utilizzati

- **`useConservationPoints()`**: 
  - Carica punti di conservazione dal database
  - Fornisce funzioni CRUD (create, update, delete)
  - Calcola statistiche aggregate
  - Gestisce cache React Query

- **`useTemperatureReadings()`**: 
  - Carica letture temperatura dal database
  - Fornisce funzioni per creare/eliminare letture
  - Calcola statistiche letture (totale, conformi, attenzione, critiche)

- **`useAuth()`**: (interno agli hook)
  - Fornisce `company_id` per filtrare i dati per azienda
  - Gestisce autenticazione utente

### Funzioni Principali

#### `handleSave(conservationPoint, maintenanceTasks)`
- **Scopo**: Gestisce il salvataggio (creazione o modifica) di un punto di conservazione
- **Parametri**: 
  - `conservationPoint`: Dati del punto (senza id, company_id, timestamp)
  - `maintenanceTasks`: Array di manutenzioni obbligatorie da associare
- **Ritorna**: void (gestisce side effect)
- **Logica**: 
  1. Se `editingPoint` è presente, chiama `updateConservationPoint()`
  2. Altrimenti, chiama `createConservationPoint()`
  3. Chiude il modal e resetta lo state

#### `handleEdit(point)`
- **Scopo**: Apre il modal in modalità modifica per un punto esistente
- **Parametri**: `point: ConservationPoint` - punto da modificare
- **Ritorna**: void
- **Logica**: 
  1. Imposta `editingPoint` con il punto selezionato
  2. Apre il modal (`setShowAddModal(true)`)

#### `handleDelete(id)`
- **Scopo**: Elimina un punto di conservazione dopo conferma utente
- **Parametri**: `id: string` - ID del punto da eliminare
- **Ritorna**: void
- **Logica**: 
  1. Mostra dialog di conferma (`confirm()`)
  2. Se confermato, chiama `deleteConservationPoint(id)`
  3. La cache viene invalidata automaticamente dall'hook

#### `handleAddNew()`
- **Scopo**: Apre il modal per creare un nuovo punto
- **Parametri**: nessuno
- **Ritorna**: void
- **Logica**: 
  1. Resetta `editingPoint` a `null`
  2. Apre il modal (`setShowAddModal(true)`)

#### `handleAddTemperature(point)`
- **Scopo**: Apre il modal per registrare una temperatura per un punto specifico
- **Parametri**: `point: ConservationPoint` - punto per cui registrare temperatura
- **Ritorna**: void
- **Logica**: 
  1. Imposta `selectedPointForTemperature` con il punto
  2. Apre il modal temperatura (`setShowTemperatureModal(true)`)

#### `handleSaveTemperature(readingData)`
- **Scopo**: Salva una nuova lettura di temperatura
- **Parametri**: `readingData` - dati lettura (senza id, company_id, timestamp)
- **Ritorna**: void
- **Logica**: 
  1. Chiama `createReading(readingData)`
  2. Chiude il modal e resetta lo state

#### `handleEditReading(reading)`
- **Scopo**: Gestisce la modifica di una lettura (ATTUALMENTE NON IMPLEMENTATO)
- **Parametri**: `reading: TemperatureReading` - lettura da modificare
- **Ritorna**: void
- **Logica**: 
  - Mostra alert "Funzionalità in arrivo"
  - TODO: Implementare modal di modifica

#### `handleDeleteReading(id)`
- **Scopo**: Elimina una lettura di temperatura dopo conferma
- **Parametri**: `id: string` - ID lettura da eliminare
- **Ritorna**: void
- **Logica**: 
  1. Mostra dialog di conferma
  2. Se confermato, chiama `deleteReading(id)`

### Validazioni

**Validazioni client-side:**
- Nessuna validazione diretta nella pagina (gestite nei modal)
- Validazione presenza `company_id` (gestita negli hook, ritorna array vuoto se mancante)

**Validazioni server-side:**
- RLS policies: controllano che `company_id` corrisponda all'azienda dell'utente
- Foreign key constraints: `department_id` deve esistere, `conservation_point_id` per letture deve esistere
- Not null constraints: campi obbligatori come `name`, `department_id`, `type`

### Gestione Errori

**Errori di caricamento:**
- **Quando**: Errore nella query dei punti di conservazione
- **Cosa succede**: `isLoading` rimane `true`, `error` viene popolato dall'hook
- **UI**: La pagina mostra skeleton loading, ma non gestisce esplicitamente l'errore (da migliorare)
- **Logging**: Errore loggato in console dall'hook

**Errori di salvataggio:**
- **Quando**: Errore nella creazione/modifica/eliminazione di un punto
- **Cosa succede**: `toast.error()` mostra messaggio generico "Errore nella creazione/modifica/eliminazione"
- **UI**: Modal rimane aperto, utente può riprovare
- **Logging**: Errore loggato in console

**Soluzione proposta**: Migliorare gestione errori con:
- Messaggi di errore più specifici (es. "Temperatura non valida per questa tipologia")
- Retry automatico per errori di rete
- Fallback UI quando i dati non possono essere caricati

---

## 🎨 LAYOUT

### Struttura Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Sistema di Conservazione" + sottotitolo         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ CollapsibleCard: "Punti di Conservazione"           │ │
│ │ Header: Titolo + Counter "7 punti configurati"      │ │
│ │         + Pulsante "Aggiungi Punto"                  │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Content (se espanso):                                │ │
│ │   ┌───────────────────────────────────────────────┐ │ │
│ │   │ CollapsibleCard: "Frigoriferi" (N punti)     │ │ │
│ │   │   ┌────────┐  ┌────────┐                      │ │ │
│ │   │   │ Card 1 │  │ Card 2 │  (grid 2 colonne)   │ │ │
│ │   │   └────────┘  └────────┘                      │ │ │
│ │   └───────────────────────────────────────────────┘ │ │
│ │   ┌───────────────────────────────────────────────┐ │ │
│ │   │ CollapsibleCard: "Freezer" (N punti)         │ │ │
│ │   └───────────────────────────────────────────────┘ │ │
│ │   ┌───────────────────────────────────────────────┐ │ │
│ │   │ CollapsibleCard: "Abbattitori" (N punti)     │ │ │
│ │   └───────────────────────────────────────────────┘ │ │
│ │   ┌───────────────────────────────────────────────┐ │ │
│ │   │ CollapsibleCard: "Ambiente/Dispensa"         │ │ │
│ │   └───────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ CollapsibleCard: "Letture Temperature"              │ │
│ │ Header: Titolo + Counter + Dropdown "Registra..."   │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Content:                                            │ │
│ │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │ │
│ │   │Totale│ │Conf. │ │Attenz│ │Crit. │ (mini stats)│ │
│ │   └──────┘ └──────┘ └──────┘ └──────┘             │ │
│ │                                                      │ │
│ │   [Lista TemperatureReadingCard]                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ScheduledMaintenanceCard (component esterno)        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Sezione: "Distribuzione per Tipo"                   │ │
│ │   🌡️ Ambiente | ❄️ Frigorifero | 🧊 Freezer | ⚡   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Responsive Design

**Mobile (< 640px):**
- Layout a colonna singola
- Header con titolo su una riga, sottotitolo sotto
- CollapsibleCard con padding ridotto (`px-4` invece di `sm:px-6`)
- Grid dei punti: 1 colonna (`grid-cols-1`)
- Mini statistiche: 1 colonna che si adatta
- Pulsanti full-width o con spazio adeguato

**Tablet (640px - 1024px):**
- Layout a colonna singola con più spazio
- Grid dei punti: 2 colonne (`lg:grid-cols-2`)
- Mini statistiche: 2 colonne (`sm:grid-cols-2`)
- Header con elementi affiancati

**Desktop (> 1024px):**
- Layout ottimizzato con più spazio laterale
- Grid dei punti: 2 colonne (`lg:grid-cols-2`)
- Mini statistiche: 4 colonne (`md:grid-cols-4`)
- Pulsanti e azioni con spacing ottimizzato

### Styling

**Colori principali:**
- Background pagina: `bg-gray-50` (grigio chiaro)
- Card: `bg-white` con `border border-gray-200` e `shadow-sm`
- Pulsante primario "Aggiungi Punto": `bg-gradient-to-r from-blue-600 to-blue-700` con hover `from-blue-700 to-blue-800`
- Stati conservazione:
  - Regolare: `text-green-600`, `bg-green-100`
  - Attenzione: `text-yellow-600`, `bg-yellow-100`
  - Critico: `text-red-600`, `bg-red-100`

**Spaziature:**
- Container principale: `p-6` (padding 24px)
- Spazio tra sezioni: `space-y-6` (24px verticale)
- Spazio interno card: `px-4 py-4 sm:px-6` (responsive padding)
- Gap grid: `gap-4` (16px)

**Tipografia:**
- Titolo principale: `text-2xl font-bold text-gray-900`
- Sottotitolo: `text-gray-600`
- Titoli card: `text-lg font-semibold text-gray-900`
- Testo body: `text-sm text-gray-600`

**Effetti hover/focus:**
- Card hover: `hover:shadow-md transition-shadow duration-200`
- Pulsanti: `hover:bg-blue-700 transition-colors`
- CollapsibleCard header: `hover:bg-gray-50 transition-colors`
- Focus ring: `focus:ring-2 focus:ring-primary-500 focus:ring-offset-1`

### Accessibilità

**ARIA labels utilizzati:**
- `role="region"` sulle CollapsibleCard
- `aria-expanded` sull'header delle card collassabili
- `aria-controls` per collegare header e content
- `aria-labelledby` per associare regioni ai titoli

**Keyboard navigation:**
- CollapsibleCard header: `tabIndex={0}`, risponde a `Enter` e `Space` per espandere/collassare
- Pulsanti: focusabile con Tab, attivabili con Enter/Space
- Dropdown temperatura: navigabile con tastiera

**Screen reader support:**
- Tutti i testi informativi sono visibili (non solo icone)
- Contatori hanno `aria-label` (es. "7 items")
- Stati di loading/error hanno `role="status"` e `aria-live="polite"`

**Contrasto colori:**
- Testo su background: minimo 4.5:1 (WCAG AA)
- Stati colorati: rispettano i contrasti minimi
- Focus indicators: visibili con contrasto sufficiente

**Miglioramenti proposti:**
- Aggiungere `aria-label` descrittivi ai pulsanti icona (Edit, Delete)
- Aggiungere `aria-describedby` per spiegare azioni distruttive
- Migliorare feedback audio per azioni critiche

---

## ⚙️ FUNZIONAMENTO

### Flusso di Funzionamento

1. **Inizializzazione**: 
   - Il componente viene montato quando l'utente naviga alla route
   - `useConservationPoints()` hook viene eseguito automaticamente
   - `useQuery` carica i dati da Supabase filtrati per `company_id`
   - Se `company_id` non è disponibile, ritorna array vuoto e logga warning

2. **Caricamento dati**:
   - Query Supabase: `SELECT * FROM conservation_points WHERE company_id = ? ORDER BY created_at DESC`
   - Include join con `departments` per ottenere nome reparto
   - Dati vengono trasformati in oggetti `ConservationPoint` con tipizzazione TypeScript
   - Statistiche vengono calcolate lato client aggregando i dati

3. **Rendering iniziale**:
   - Se `isLoading === true`: mostra skeleton loading con animazione pulse
   - Se `isLoading === false && points.length === 0`: mostra empty state con messaggio e pulsante "Crea Primo Punto"
   - Se dati presenti: renderizza la struttura completa con tutte le sezioni

4. **Interazione utente - Espansione sezioni**:
   - Utente clicca header di CollapsibleCard
   - `toggleExpanded()` viene chiamato
   - State interno della card viene aggiornato
   - Content viene mostrato/nascosto con animazione CSS

5. **Interazione utente - Creazione punto**:
   - Utente clicca "Aggiungi Punto"
   - `handleAddNew()` imposta `showAddModal = true`, `editingPoint = null`
   - Modal `AddPointModal` viene renderizzato
   - Utente compila form e salva
   - `handleSave()` chiama `createConservationPoint()` mutation
   - Query cache viene invalidata
   - Lista si aggiorna automaticamente con nuovo punto

6. **Interazione utente - Registrazione temperatura**:
   - Utente seleziona punto dal dropdown "Registra temperatura..."
   - `handleAddTemperature(point)` imposta `selectedPointForTemperature` e `showTemperatureModal = true`
   - Modal `AddTemperatureModal` viene renderizzato
   - Utente inserisce temperatura e salva
   - `handleSaveTemperature()` chiama `createReading()` mutation
   - Query cache viene invalidata
   - Lista letture si aggiorna, `last_temperature_reading` del punto viene aggiornato

7. **Aggiornamento automatico**:
   - Dopo ogni mutazione (create/update/delete), `queryClient.invalidateQueries()` viene chiamato
   - React Query ricarica automaticamente i dati
   - UI si aggiorna senza necessità di refresh manuale

### Integrazione Database

**Tabelle utilizzate:**

1. **`conservation_points`**:
   - **Operazioni**: SELECT, INSERT, UPDATE, DELETE
   - **Filtri**: `company_id` (obbligatorio, da auth)
   - **Join**: `departments` per nome reparto
   - **Ordinamento**: `created_at DESC` (più recenti prima)

2. **`temperature_readings`**:
   - **Operazioni**: SELECT, INSERT, DELETE
   - **Filtri**: `company_id` (obbligatorio)
   - **Join**: `conservation_points` per nome punto (opzionale, per display)
   - **Ordinamento**: `recorded_at DESC` (più recenti prima)

3. **`maintenance_tasks`** (gestito indirettamente):
   - **Operazioni**: INSERT (durante creazione punto)
   - **Relazione**: `conservation_point_id` foreign key
   - **Accesso**: Tramite `ScheduledMaintenanceCard` componente separato

**Operazioni CRUD:**

- **CREATE**: 
  - Inserisce record in `conservation_points`
  - Auto-classifica `type` in base a `setpoint_temp` e `is_blast_chiller`
  - Inserisce manutenzioni obbligatorie in `maintenance_tasks` (se fornite)

- **READ**: 
  - Carica tutti i punti dell'azienda
  - Include informazioni dipartimento tramite join
  - Calcola statistiche aggregate lato client

- **UPDATE**: 
  - Aggiorna singolo record per ID
  - Auto-riclassifica `type` se temperatura cambia
  - Trigger database aggiorna `updated_at` automaticamente

- **DELETE**: 
  - Elimina record per ID
  - CASCADE elimina automaticamente:
    - Letture temperatura associate (`temperature_readings`)
    - Manutenzioni associate (`maintenance_tasks`)

**Transazioni:**
- Non vengono usate transazioni esplicite
- Ogni operazione è atomica (Supabase gestisce transazioni a livello di singola operazione)
- **Problema identificato**: Creazione punto + manutenzioni non è atomica. Se la creazione del punto va a buon fine ma l'inserimento delle manutenzioni fallisce, il punto viene creato senza manutenzioni.

**Soluzione proposta**: Usare transazione esplicita per creazione punto + manutenzioni, oppure gestire rollback manuale se manutenzioni falliscono.

### Integrazione Servizi

**Supabase Client**:
- Utilizzato tramite `@/lib/supabase/client`
- Configurato con URL e anon key da variabili ambiente
- RLS policies applicate automaticamente a tutte le query

**React Query (TanStack Query)**:
- Gestisce cache e sincronizzazione stato-server
- Auto-retry per errori di rete
- Background refetch quando tab torna in focus
- Cache time: 5 minuti (default)

**Toast Notifications**:
- Utilizzato `react-toastify` per notifiche successo/errore
- Messaggi: "Punto creato con successo", "Errore nella creazione", ecc.

### Real-time Updates

**Comportamento attuale**: 
- **NON implementato** - La pagina non si aggiorna in real-time quando altri utenti modificano dati
- Aggiornamenti avvengono solo dopo:
  - Mutazioni locali (invalidation cache)
  - Refresh manuale pagina
  - Focus su tab (background refetch di React Query)

**Soluzione proposta**: Implementare Supabase Realtime subscriptions per:
- Aggiornamenti automatici quando punti vengono creati/modificati/eliminati da altri utenti
- Aggiornamenti automatici quando nuove temperature vengono registrate
- Indicatore visivo quando dati sono stati aggiornati da altro utente

---

## 🔗 INTERAZIONI

### Componenti Collegati

- **`CollapsibleCard`** (`@/components/ui/CollapsibleCard`):
  - **Tipo di interazione**: Wrapper riutilizzabile per sezioni collassabili
  - **Uso**: 5 istanze (Punti di Conservazione, Frigoriferi, Freezer, Abbattitori, Ambiente/Dispensa, Letture Temperature)
  - **Props passate**: title, subtitle, counter, actions, defaultExpanded, children

- **`ConservationPointCard`** (`./components/ConservationPointCard`):
  - **Tipo di interazione**: Card di visualizzazione per singolo punto
  - **Uso**: Renderizzato in loop per ogni punto, filtrato per tipo
  - **Props passate**: `point`, `onEdit`, `onDelete`

- **`AddPointModal`** (`./components/AddPointModal`):
  - **Tipo di interazione**: Modal per creare/modificare punto
  - **Uso**: Condizionale (`isOpen={showAddModal}`)
  - **Props passate**: `isOpen`, `onClose`, `onSave`, `point` (per edit), `isLoading`

- **`AddTemperatureModal`** (`./components/AddTemperatureModal`):
  - **Tipo di interazione**: Modal per registrare temperatura
  - **Uso**: Condizionale (`selectedPointForTemperature && isOpen={showTemperatureModal}`)
  - **Props passate**: `isOpen`, `onClose`, `onSave`, `conservationPoint`, `isLoading`

- **`TemperatureReadingCard`** (`./components/TemperatureReadingCard`):
  - **Tipo di interazione**: Card di visualizzazione per singola lettura
  - **Uso**: Renderizzato in loop per ogni lettura
  - **Props passate**: `reading`, `onEdit`, `onDelete`

- **`ScheduledMaintenanceCard`** (`@/features/dashboard/components/ScheduledMaintenanceCard`):
  - **Tipo di interazione**: Componente esterno che mostra manutenzioni programmate
  - **Uso**: Renderizzato direttamente, gestisce i propri dati
  - **Props passate**: nessuna (usa hook interni)

### Dipendenze

- **Hooks custom**:
  - `useConservationPoints()` - gestione punti conservazione
  - `useTemperatureReadings()` - gestione letture temperatura
  - `useAuth()` - autenticazione e company_id (interno agli hook)

- **Librerie esterne**:
  - `react` - framework UI
  - `@tanstack/react-query` - gestione stato server
  - `lucide-react` - icone
  - `react-toastify` - notifiche (usato negli hook)

- **Servizi**:
  - `@/lib/supabase/client` - client Supabase per database
  - `@/types/conservation` - tipi TypeScript

### Eventi Emessi

La pagina non emette eventi custom. Le comunicazioni avvengono tramite:
- **Callback props** ai componenti figli (`onEdit`, `onDelete`, `onSave`)
- **Hook mutations** che aggiornano la cache React Query
- **Toast notifications** per feedback utente

### Eventi Ascoltati

La pagina non ascolta eventi custom. Reagisce a:
- **Mount/unmount** del componente (trigger caricamento dati)
- **Invalidation cache** React Query (trigger ricaricamento dati)
- **Cambio `company_id`** nel contesto auth (trigger ricaricamento)

---

## 📊 DATI

### Struttura Dati Input

La pagina non riceve input diretti. I dati vengono caricati tramite hook dal database.

**Dati caricati dal database:**

```typescript
interface ConservationPoint {
  id: string
  company_id: string
  department_id: string
  name: string
  setpoint_temp: number
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
  product_categories: string[]
  status: 'normal' | 'warning' | 'critical'
  is_blast_chiller: boolean
  last_temperature_reading?: {
    temperature: number
    recorded_at: Date
  }
  maintenance_due?: Date
  created_at: Date
  updated_at: Date
  department?: {
    id: string
    name: string
  }
}

interface TemperatureReading {
  id: string
  company_id: string
  conservation_point_id: string
  temperature: number
  recorded_at: Date
  created_at: Date
  conservation_point?: ConservationPoint
}
```

### Struttura Dati Output

La pagina non emette output diretto. I dati vengono modificati tramite mutazioni che aggiornano il database.

**Dati inviati al database (CREATE):**

```typescript
interface CreateConservationPointInput {
  name: string
  department_id: string
  setpoint_temp: number
  type: ConservationPointType  // auto-calcolato
  product_categories: string[]
  is_blast_chiller: boolean
  // maintenanceTasks: Array<MandatoryMaintenanceTask>
}
```

**Dati inviati al database (UPDATE):**

```typescript
interface UpdateConservationPointInput {
  id: string
  name?: string
  department_id?: string
  setpoint_temp?: number
  type?: ConservationPointType  // auto-ricalculato se temperatura cambia
  product_categories?: string[]
  is_blast_chiller?: boolean
}
```

**Dati inviati al database (CREATE Temperature Reading):**

```typescript
interface CreateTemperatureReadingInput {
  conservation_point_id: string
  temperature: number
  recorded_at?: Date  // opzionale, default now()
}
```

### Mapping Database

**Campo form → Campo database:**

| Campo Form | Campo Database | Trasformazione |
|------------|----------------|----------------|
| `name` | `conservation_points.name` | Diretto |
| `departmentId` | `conservation_points.department_id` | Diretto |
| `targetTemperature` | `conservation_points.setpoint_temp` | Diretto (number) |
| `pointType` | `conservation_points.type` | Auto-calcolato in base a temperatura (vedi `classifyConservationPoint()`) |
| `isBlastChiller` | `conservation_points.is_blast_chiller` | Diretto (boolean) |
| `productCategories` | `conservation_points.product_categories` | Array string (JSONB nel database) |
| `temperature` (lettura) | `temperature_readings.temperature` | Diretto (number) |
| `recorded_at` (lettura) | `temperature_readings.recorded_at` | Date → ISO string |

**Validazioni database:**

- **Not null**: `name`, `department_id`, `setpoint_temp`, `type`, `company_id`
- **Foreign key**: `department_id` deve esistere in `departments`
- **Check constraints**: Nessuno esplicito (validazione lato client)
- **Unique constraints**: Nessuno (più punti possono avere lo stesso nome)

**Trasformazioni applicate:**

1. **Auto-classificazione tipo**: 
   ```typescript
   function classifyConservationPoint(setpointTemp: number, isBlastChiller: boolean): ConservationPointType {
     if (isBlastChiller) return 'blast'
     if (setpointTemp <= -15) return 'freezer'
     if (setpointTemp <= 8) return 'fridge'
     if (setpointTemp >= 15) return 'ambient'
     return 'fridge'  // default
   }
   ```

2. **Calcolo statistiche**:
   - Aggregazione lato client dei punti per tipo e stato
   - Conteggio totale, per stato (normal/warning/critical), per tipo

3. **Calcolo stato punto**:
   - Basato su `last_temperature_reading` e `maintenance_due`
   - Funzione `classifyPointStatus()` determina stato (normal/warning/critical)

---

## ✅ ACCEPTANCE CRITERIA

**Criteri di accettazione per la pagina Conservazione:**

- [x] La pagina carica e visualizza tutti i punti di conservazione dell'azienda
- [x] I punti sono organizzati per tipo (Frigoriferi, Freezer, Abbattitori, Ambiente/Dispensa)
- [x] Ogni punto mostra informazioni essenziali (nome, reparto, temperatura target, stato)
- [x] L'utente può espandere/collassare le sezioni
- [x] L'utente può creare un nuovo punto tramite pulsante "Aggiungi Punto"
- [x] L'utente può modificare un punto esistente cliccando l'icona edit sulla card
- [x] L'utente può eliminare un punto con conferma
- [x] L'utente può registrare una nuova temperatura per un punto
- [x] Le statistiche vengono calcolate e visualizzate correttamente
- [ ] **DA IMPLEMENTARE**: Visualizzazione ingredienti associati a un punto (feature futura - da definire meglio cosa visualizzare e come)
- [ ] **DA IMPLEMENTARE**: Modifica lettura temperatura (attualmente mostra solo alert)
- [ ] **DA MIGLIORARE**: Gestione errori più specifica e user-friendly
- [ ] **DA MIGLIORARE**: Real-time updates quando altri utenti modificano dati

---

## 🧪 TESTING

### Test da Eseguire

1. **Test caricamento dati**:
   - Verificare che i punti vengano caricati correttamente al mount
   - Verificare comportamento con `company_id` mancante (dovrebbe ritornare array vuoto)
   - Verificare comportamento con errore di rete (dovrebbe mostrare errore)

2. **Test organizzazione per tipo**:
   - Verificare che i punti vengano filtrati correttamente per tipo
   - Verificare che le sottosezioni mostrino il conteggio corretto
   - Verificare che punti senza tipo vengano gestiti correttamente

3. **Test creazione punto**:
   - Verificare che il modal si apra correttamente
   - Verificare che il form si resetti dopo la creazione
   - Verificare che la lista si aggiorni automaticamente
   - Verificare che le statistiche si aggiornino

4. **Test modifica punto**:
   - Verificare che il modal si apra con i dati del punto precompilati
   - Verificare che le modifiche vengano salvate correttamente
   - Verificare auto-riclassificazione tipo quando temperatura cambia

5. **Test eliminazione punto**:
   - Verificare dialog di conferma
   - Verificare che il punto venga eliminato dal database
   - Verificare che letture e manutenzioni associate vengano eliminate (CASCADE)
   - Verificare aggiornamento lista e statistiche

6. **Test registrazione temperatura**:
   - Verificare che il modal si apra con il punto selezionato
   - Verificare che la lettura venga salvata correttamente
   - Verificare che `last_temperature_reading` del punto venga aggiornato
   - Verificare che lo stato del punto venga ricalcolato se necessario

7. **Test responsive design**:
   - Verificare layout mobile (< 640px)
   - Verificare layout tablet (640px - 1024px)
   - Verificare layout desktop (> 1024px)

8. **Test accessibilità**:
   - Verificare navigazione con tastiera
   - Verificare screen reader compatibility
   - Verificare contrasto colori (WCAG AA)

### Scenari di Test

**Scenario 1: Creazione punto completo**
- **Input**: Nome "Frigo Test", Reparto "Cucina", Tipologia "Frigorifero", Temperatura 4°C, Categorie ["Carni fresche", "Latticini"], 4 manutenzioni configurate
- **Output atteso**: Punto creato con `type='fridge'`, manutenzioni inserite, visualizzato nella sezione "Frigoriferi"

**Scenario 2: Modifica temperatura con riclassificazione**
- **Input**: Punto esistente tipo "fridge" con temperatura 4°C, modifica a -18°C
- **Output atteso**: Tipo auto-riclassificato a "freezer", punto spostato nella sezione "Freezer"

**Scenario 3: Eliminazione punto con dati associati**
- **Input**: Punto con 10 letture temperatura e 4 manutenzioni
- **Output atteso**: Punto eliminato, 10 letture eliminate (CASCADE), 4 manutenzioni eliminate (CASCADE), lista aggiornata

**Scenario 4: Stato punto basato su temperatura**
- **Input**: Punto con temperatura target 2°C, ultima lettura 5°C (fuori range)
- **Output atteso**: Stato calcolato come "warning" o "critical" a seconda della tolleranza

---

## 📚 RIFERIMENTI

### File Correlati
- **Componente**: `src/features/conservation/ConservationPage.tsx`
- **Hook**: `src/features/conservation/hooks/useConservationPoints.ts`
- **Hook**: `src/features/conservation/hooks/useTemperatureReadings.ts`
- **Componente Card**: `src/features/conservation/components/ConservationPointCard.tsx`
- **Modal Punto**: `src/features/conservation/components/AddPointModal.tsx`
- **Modal Temperatura**: `src/features/conservation/components/AddTemperatureModal.tsx`
- **Componente UI**: `src/components/ui/CollapsibleCard.tsx`
- **Tipi**: `src/types/conservation.ts`
- **Profili HACCP** (v2.0.0): `src/utils/conservationProfiles.ts`
- **Costanti Centralizzate** (v2.0.0): `src/utils/conservationConstants.ts`
- **Config Immagini** (v2.0.0): `src/config/applianceImages.ts`

### Documentazione Correlata
- Template standard: `00_TEMPLATE_STANDARD.md`
- Master Index: `00_MASTER_INDEX_CONSERVATION.md`
- Documentazione ConservationPointCard: `CONSERVATION_POINT_CARD.md` ✅
- Documentazione AddPointModal: `ADD_POINT_MODAL.md` ✅
- Documentazione TemperatureReadings: `TEMPERATURE_READINGS_SECTION.md` ✅
- Documentazione ScheduledMaintenance: `SCHEDULED_MAINTENANCE_SECTION.md` ✅

---

## 📝 NOTE SVILUPPO

### Performance

**Ottimizzazioni implementate:**
- React Query cache: evita ricaricamenti inutili
- useMemo per calcoli statistiche (gestito internamente agli hook)
- Lazy loading modal: i modal vengono renderizzati solo quando aperti

**Considerazioni performance:**
- **N+1 Query Problem**: Attualmente non presente - tutte le query sono batch
- **Re-renders**: Componente potrebbe re-renderizzare quando statistiche cambiano. Considerare `React.memo` per componenti figli se necessario
- **Lista grandi**: Se ci sono centinaia di punti, considerare paginazione o virtualizzazione

**Miglioramenti proposti:**
- Implementare paginazione per liste grandi (>50 punti)
- Virtualizzare liste lunghe con `react-window` o `react-virtualized`
- Debounce ricerca/filtri se verranno aggiunti

### Sicurezza

**Validazioni sicurezza:**
- RLS policies: tutte le query sono filtrate automaticamente per `company_id`
- Input sanitization: gestita da Supabase (prepara statement)
- XSS prevention: React escape automaticamente i valori

**Sanitizzazione input:**
- Nome punto: sanitizzato da Supabase, ma nessuna validazione esplicita di lunghezza massima
- Temperatura: validata come numero, range controllato lato client
- Categorie: array di string, validato lato client

**Autorizzazioni:**
- Lettura: tutti i membri azienda (RLS policy)
- Scrittura: solo manager/admin (RLS policy)
- Eliminazione: solo manager/admin (RLS policy)

**Miglioramenti proposti:**
- Validare lunghezza massima nome punto (es. 100 caratteri)
- Validare categorie contro whitelist per prevenire injection
- Aggiungere audit log per operazioni critiche (eliminazione punti)

### Limitazioni

**Limitazioni conosciute:**
1. **Feature "Visualizza ingredienti" non implementata**: L'utente ha menzionato che cliccando su un elemento nella ConservationPointCard dovrebbero essere visualizzati gli ingredienti associati, ma questa feature non esiste ancora e deve essere ancora definita (cosa visualizzare e come interagire)
2. **Modifica lettura temperatura non implementata**: Mostra solo alert "Funzionalità in arrivo"
3. **Conflitti multi-utente non gestiti**: Modifiche simultanee possono sovrascriversi
4. **Real-time updates non implementati**: La pagina non si aggiorna automaticamente quando altri utenti modificano dati
5. **Transazioni non atomiche**: Creazione punto + manutenzioni non è atomica (se manutenzioni falliscono, punto rimane senza manutenzioni)

**Limitazioni tecniche:**
- React Query cache time: 5 minuti - dati possono essere obsoleti
- Nessuna persistenza locale: se pagina viene ricaricata, tutti i dati vengono ricaricati dal server
- Nessun offline support: app non funziona senza connessione

### Future Miglioramenti

**Miglioramenti funzionali:**
1. **Visualizzazione ingredienti**: Implementare feature per visualizzare ingredienti associati a un punto di conservazione (da definire meglio: cosa visualizzare e come interagire con la lista ingredienti)
2. **Modifica lettura temperatura**: Implementare modal per modificare letture esistenti
3. **Filtri e ricerca**: Aggiungere filtri per reparto, tipo, stato e ricerca per nome
4. **Esportazione dati**: Permettere export CSV/PDF dei punti e letture
5. **Grafici temperatura**: Visualizzare trend temperatura nel tempo per ogni punto

**Miglioramenti tecnici:**
1. **Optimistic locking**: Implementare per prevenire conflitti multi-utente
2. **Real-time subscriptions**: Implementare Supabase Realtime per aggiornamenti automatici
3. **Offline support**: Implementare queue locale e sync automatico
4. **Transazioni atomiche**: Usare transazioni per creazione punto + manutenzioni
5. **Audit logging**: Tracciare tutte le modifiche critiche (creazione, modifica, eliminazione)

**Miglioramenti UX:**
1. **Drag & drop riordinamento**: Permettere riordinamento punti per priorità
2. **Bulk operations**: Permettere eliminazione/modifica multipla
3. **Tutorial onboarding**: Guida interattiva per nuovi utenti
4. **Notifiche push**: Alert quando temperature sono fuori range o manutenzioni scadono
5. **Dark mode**: Supporto tema scuro

---

## 🆕 CHANGELOG v2.0.0 (2026-01-30)

### Features Aggiunte
- **Profili HACCP**: 5 profili (max_capacity, meat_generic, vegetables_generic, fish_generic, beverages_alcoholic) × 4 categorie elettrodomestico
- **Layout Split**: Categorie (sx) + Immagine elettrodomestico (dx) per frigoriferi
- **Nome Utente**: Visualizzazione nome utente nelle letture temperatura (`recorded_by` → `user_profiles`)
- **Pulsante Calendario**: Navigazione a pagina Attività dalle card manutenzioni
- **Costanti Centralizzate**: `conservationConstants.ts` come single source of truth

### File Correlati Aggiunti
- `src/utils/conservationProfiles.ts` - Profili HACCP
- `src/utils/conservationConstants.ts` - Costanti centralizzate
- `src/config/applianceImages.ts` - Config immagini elettrodomestici

### Riferimenti Sessioni di Lavoro
- [19-01-2026](../Lavoro/19-01-2026/) - Profili HACCP v2.0.0
- [20-01-2026](../Lavoro/20-01-2026/) - Immagini Elettrodomestici + Layout Split
- [21-01-2026](../Lavoro/21-01-2026/) - Centralizzazione Costanti
- [22-01-2026](../Lavoro/22-01-2026%20Nome%20associato%20ad%20evento/) - Nome Utente + Recurrence Config
- [29-01-2026](../Lavoro/29-01-2026/) - Profilo Bibite + Pulsante Calendario

---

**Ultimo Aggiornamento**: 2026-01-30
**Versione**: 2.0.0
