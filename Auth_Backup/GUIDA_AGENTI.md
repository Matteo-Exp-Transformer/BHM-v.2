# 👥 GUIDA_AGENTI - Mock Auth System

## 📋 Panoramica

Guida completa per gli agenti su come utilizzare il sistema Mock Auth per testare l'applicazione senza login.

## 🎯 Obiettivo Mock Auth

Il sistema Mock Auth permette di:
- Testare l'app senza login
- Simulare diversi ruoli utente
- Verificare permessi e accessi
- Sviluppare più velocemente
- Testare scenari multi-ruolo

## 🚀 Avvio App con Mock Auth

### Primo Avvio
1. **Avvia l'app**: `npm run dev`
2. **Vai su**: `http://localhost:3000`
3. **Selezione Ruolo**: Apparirà dialog per scegliere ruolo
4. **Scegli Ruolo**: Admin, Responsabile, Dipendente, Collaboratore
5. **Conferma**: App si comporterà come se fossi loggato con quel ruolo

### Avvii Successivi
- **Ruolo Salvato**: App ricorderà l'ultimo ruolo selezionato
- **Cambio Ruolo**: Usa DevTools console o bottone cambio ruolo
- **Reset**: Cancella localStorage per tornare alla selezione

## 👤 Ruoli Disponibili

### 🔑 Admin
**Accesso Completo**:
- ✅ Tutte le pagine
- ✅ Gestione azienda
- ✅ Impostazioni sistema
- ✅ Gestione utenti
- ✅ Tutti i permessi

**Pagine Accessibili**:
- Dashboard
- Conservazione
- Attività (Calendar)
- Inventario
- Liste Spesa
- Impostazioni
- Gestione

### 👨‍💼 Responsabile
**Accesso Gestione**:
- ✅ Dashboard
- ✅ Conservazione
- ✅ Attività (Calendar)
- ✅ Inventario
- ✅ Liste Spesa
- ✅ Gestione (limitata)
- ❌ Impostazioni sistema

**Pagine Accessibili**:
- Dashboard
- Conservazione
- Attività (Calendar)
- Inventario
- Liste Spesa
- Gestione

### 👷 Dipendente
**Accesso Operativo**:
- ✅ Dashboard
- ✅ Conservazione
- ✅ Attività (Calendar)
- ✅ Inventario
- ✅ Liste Spesa
- ❌ Gestione
- ❌ Impostazioni

**Pagine Accessibili**:
- Dashboard
- Conservazione
- Attività (Calendar)
- Inventario
- Liste Spesa

### 🤝 Collaboratore
**Accesso Base**:
- ✅ Dashboard
- ✅ Conservazione (limitata)
- ✅ Attività (Calendar)
- ✅ Inventario (solo lettura)
- ❌ Liste Spesa
- ❌ Gestione
- ❌ Impostazioni

**Pagine Accessibili**:
- Dashboard
- Conservazione (limitata)
- Attività (Calendar)
- Inventario (solo lettura)

## 🛠️ Comandi DevTools Console

### Comandi Disponibili
```javascript
// Cambia ruolo utente
window.setMockRole('admin')        // Admin completo
window.setMockRole('responsabile') // Responsabile
window.setMockRole('dipendente')   // Dipendente
window.setMockRole('collaboratore') // Collaboratore

// Vedi utente corrente
window.getMockUser()

// Reset selezione ruolo
window.resetMockAuth()

// Vedi tutti i ruoli disponibili
window.getAvailableRoles()
```

### Esempi Utilizzo
```javascript
// Testa come admin
window.setMockRole('admin')
// Ricarica pagina per vedere cambiamenti

// Testa come dipendente
window.setMockRole('dipendente')
// Vai su /impostazioni - dovrebbe essere bloccato

// Reset e ri-seleziona
window.resetMockAuth()
// Ricarica pagina per vedere dialog selezione
```

## 🧪 Scenari di Test

### Test 1: Verifica Permessi Ruolo
```javascript
// 1. Scegli ruolo
window.setMockRole('dipendente')

// 2. Vai su pagine protette
// - /impostazioni → Dovrebbe essere bloccato
// - /gestione → Dovrebbe essere bloccato
// - /dashboard → Dovrebbe essere accessibile

// 3. Verifica UI
// - Menu dovrebbe nascondere voci non accessibili
// - Bottoni dovrebbero essere disabilitati
// - Messaggi di errore appropriati
```

### Test 2: Cambio Ruolo Runtime
```javascript
// 1. Inizia come dipendente
window.setMockRole('dipendente')

// 2. Vai su pagina limitata
// - /impostazioni → Bloccato

// 3. Cambia a admin
window.setMockRole('admin')

// 4. Ricarica pagina
// - /impostazioni → Ora accessibile
```

### Test 3: Test Multi-Ruolo
```javascript
// Testa tutti i ruoli in sequenza
const roles = ['collaboratore', 'dipendente', 'responsabile', 'admin']

roles.forEach(role => {
  console.log(`Testing as ${role}`)
  window.setMockRole(role)
  // Testa funzionalità specifiche per ruolo
})
```

## 🔍 Debug e Troubleshooting

### Problemi Comuni

#### Dialog Selezione Non Appare
```javascript
// Forza reset
window.resetMockAuth()
// Ricarica pagina
location.reload()
```

#### Ruolo Non Cambia
```javascript
// Verifica ruolo corrente
window.getMockUser()

// Forza cambio
window.setMockRole('admin')
// Ricarica pagina
location.reload()
```

#### Permessi Non Funzionano
```javascript
// Verifica che mock auth sia attivo
console.log('Mock Auth Active:', window.mockAuthActive)

// Verifica ruolo
console.log('Current Role:', window.getMockUser()?.role)
```

### Log Debug
```javascript
// Abilita log debug
window.enableMockAuthDebug = true

// Vedi log dettagliati
// - Selezione ruolo
// - Cambio permessi
// - Accesso pagine
// - Errori mock auth
```

## 📱 Test Responsive

### Test Mobile
```javascript
// 1. Cambia viewport
// DevTools → Toggle device toolbar
// Scegli dispositivo mobile

// 2. Testa navigazione
// - Menu hamburger
// - Pagine responsive
// - Bottoni touch-friendly

// 3. Testa ruoli
window.setMockRole('dipendente')
// Verifica che permessi funzionino anche su mobile
```

### Test Tablet
```javascript
// 1. Viewport tablet
// DevTools → Toggle device toolbar
// Scegli tablet

// 2. Testa layout
// - Sidebar collassabile
// - Griglie responsive
// - Form ottimizzati
```

## 🎨 Test UI/UX

### Test Interfaccia
```javascript
// Testa con diversi ruoli
const roles = ['admin', 'responsabile', 'dipendente', 'collaboratore']

roles.forEach(role => {
  window.setMockRole(role)
  // Verifica:
  // - Menu items visibili/nascosti
  // - Bottoni abilitati/disabilitati
  // - Messaggi appropriati
  // - Colori e stili
})
```

### Test Accessibilità
```javascript
// Testa accessibilità per ogni ruolo
window.setMockRole('dipendente')

// Verifica:
// - Focus management
// - Screen reader compatibility
// - Keyboard navigation
// - ARIA labels
```

## 🔧 Sviluppo e Testing

### Sviluppo Nuove Funzionalità
```javascript
// 1. Scegli ruolo appropriato
window.setMockRole('admin') // Per testare tutto

// 2. Sviluppa funzionalità
// - Codifica nuova feature
// - Testa con ruolo admin

// 3. Testa con altri ruoli
window.setMockRole('dipendente')
// Verifica che funzionalità sia accessibile appropriatamente
```

### Test Bug Fix
```javascript
// 1. Riproduci bug
window.setMockRole('responsabile')

// 2. Fix bug
// - Applica correzione
// - Testa con ruolo responsabile

// 3. Verifica non regressione
window.setMockRole('admin')
// Verifica che fix non rompa altre cose
```

## 📊 Metriche e Performance

### Test Performance
```javascript
// Misura performance per ogni ruolo
const roles = ['admin', 'responsabile', 'dipendente', 'collaboratore']

roles.forEach(role => {
  window.setMockRole(role)
  
  // Misura:
  // - Tempo caricamento pagina
  // - Tempo rendering componenti
  // - Uso memoria
  // - Network requests
})
```

### Test Scalabilità
```javascript
// Testa con dati mock grandi
window.setMockRole('admin')

// Simula:
// - Molte aziende
// - Molti utenti
// - Molte attività
// - Grandi inventari
```

## 🚨 Limitazioni e Note

### Limitazioni Mock Auth
- **Solo Sviluppo**: Mock auth funziona solo in modalità sviluppo
- **Dati Mock**: Usa dati simulati, non database reale
- **Sessioni**: Non gestisce sessioni Supabase reali
- **Sicurezza**: Non implementa controlli sicurezza reali

### Note Importanti
- **Non Production**: Non usare mock auth in produzione
- **Test Completi**: Mock auth non sostituisce test con auth reale
- **Database**: Database rimane intatto, solo layer applicativo modificato
- **Rollback**: Sempre possibile tornare al sistema auth originale

## 📞 Supporto

### Problemi Mock Auth
1. **Console Errors**: Controlla DevTools console
2. **Reset Completo**: `window.resetMockAuth()` + reload
3. **Verifica Ruolo**: `window.getMockUser()`
4. **Debug Mode**: `window.enableMockAuthDebug = true`

### File di Supporto
- **Codice Mock**: `src/hooks/useMockAuth.ts`
- **Selezione Ruolo**: `src/components/MockAuthSelector.tsx`
- **Documentazione**: `Auth_Backup/README.md`
- **Piano Reintegro**: `Auth_Backup/PIANO_REINTEGRO.md`

---

**⚠️ IMPORTANTE**: Mock auth è solo per sviluppo e testing. Non usare in produzione. Sempre possibile tornare al sistema auth originale seguendo `PIANO_REINTEGRO.md`.
