# 📋 TRACKING MainLayout - Agente 5

> **Componente**: MainLayout.tsx  
> **File**: `src/components/layouts/MainLayout.tsx`  
> **Agente**: Agente 5 - Navigazione e Routing  
> **Porta**: 3004  
> **Data Inizio**: 16 Ottobre 2025

---

## 📊 STATO COMPONENTE

| Campo | Valore |
|-------|--------|
| **Stato** | 🔄 In Testing |
| **Data Inizio** | 16 Ottobre 2025 |
| **Test Eseguiti** | 0/33 (0%) |
| **Test Passati** | 0 |
| **Test Falliti** | 0 |
| **Bug Trovati** | 0 |
| **Fix Applicati** | 0 |
| **Complessità** | Alta |
| **Priorità** | 1 (CRITICA) |

---

## 🧪 PIANO DI TEST

### **Test Funzionali** (11 test)
- [ ] Mostrare header con titolo e controlli
- [ ] Mostrare navigazione bottom con tab principali
- [ ] Evidenziare tab attivo
- [ ] Permettere navigazione tra tab
- [ ] Mostrare tab Impostazioni solo per admin
- [ ] Mostrare tab Gestione solo per admin/responsabile
- [ ] Avere layout responsive
- [ ] Avere accessibilità corretta
- [ ] Mostrare contenuto principale
- [ ] Avere padding bottom per navigazione fissa

### **Test Validazione** (11 test)
- [ ] Gestire correttamente permessi tab Impostazioni
- [ ] Gestire correttamente permessi tab Gestione
- [ ] Mostrare tutti i tab base per utenti autenticati
- [ ] Gestire correttamente stati loading
- [ ] Mantenere stato navigazione durante refresh
- [ ] Gestire correttamente navigazione con URL diretti
- [ ] Gestire correttamente CompanySwitcher se presente
- [ ] Gestire correttamente HeaderButtons se presenti
- [ ] Gestire correttamente SyncStatusBar se presente
- [ ] Validare correttamente struttura HTML

### **Test Edge Cases** (11 test)
- [ ] Gestire correttamente viewport molto piccolo
- [ ] Gestire correttamente viewport molto grande
- [ ] Gestire correttamente navigazione rapida tra tab
- [ ] Gestire correttamente doppio click su tab
- [ ] Gestire correttamente navigazione con tasti freccia
- [ ] Gestire correttamente navigazione con Enter
- [ ] Gestire correttamente stato durante caricamento lento
- [ ] Gestire correttamente navigazione con URL malformati
- [ ] Gestire correttamente navigazione con parametri query
- [ ] Gestire correttamente zoom browser
- [ ] Gestire correttamente orientamento dispositivo mobile
- [ ] Gestire correttamente navigazione con JavaScript disabilitato
- [ ] Gestire correttamente memoria limitata
- [ ] Gestire correttamente navigazione con molti tab attivi

---

## 🔍 ANALISI COMPONENTE

### **Funzionalità Identificate**
- Header con titolo "HACCP Manager"
- Bottom navigation con 4-6 tab principali
- Gestione permessi per tab (admin, responsabile)
- Integrazione CompanySwitcher
- Integrazione HeaderButtons
- Integrazione SyncStatusBar
- Layout responsive
- Accessibilità (ARIA labels, roles)

### **Dipendenze**
- `useAuth` - per gestione permessi
- `useLocation` - per tab attivo
- `useNavigate` - per navigazione
- `HeaderButtons` - componenti controlli
- `CompanySwitcher` - selettore azienda
- `SyncStatusBar` - barra sincronizzazione

### **Props/Interfaces**
```typescript
interface MainLayoutProps {
  children: ReactNode
}
```

### **Stati Possibili**
- Loading (durante caricamento auth)
- Autenticato con permessi base
- Autenticato con permessi admin
- Autenticato con permessi responsabile
- Multi-tenant (più aziende)
- Single-tenant (una azienda)

---

## 🐛 BUG TRACKING

### **Bug Trovati**
*Nessun bug trovato ancora*

### **Fix Applicati**
*Nessun fix applicato ancora*

---

## 📈 METRICHE

### **Performance**
- **Tempo Caricamento**: Da misurare
- **Bundle Size**: Da misurare
- **Rendering Time**: Da misurare

### **Accessibilità**
- **ARIA Labels**: ✅ Presenti
- **Keyboard Navigation**: ✅ Supportata
- **Screen Reader**: Da testare
- **Color Contrast**: Da verificare

### **Responsive**
- **Mobile**: Da testare
- **Tablet**: Da testare
- **Desktop**: Da testare
- **Large Screens**: Da testare

---

## 🔒 CRITERI BLINDATURA

### **Prima del Lock**
- [ ] Tutti i 33 test passano (100%)
- [ ] Layout responsive verificato su tutti i dispositivi
- [ ] Accessibilità verificata
- [ ] Performance accettabile
- [ ] Nessun side effect su altri componenti
- [ ] Integrazione con dipendenze verificata
- [ ] Gestione permessi verificata
- [ ] Navigazione fluida verificata

### **Dopo il Lock**
- [ ] Codice commentato con `// LOCKED:`
- [ ] MASTER_TRACKING.md aggiornato
- [ ] NAVIGAZIONE_COMPONENTI.md aggiornato
- [ ] Commit eseguito con messaggio "LOCK: MainLayout"
- [ ] Altri agenti notificati
- [ ] Prossimo elemento identificato

---

## 📝 NOTE OPERATIVE

### **Osservazioni**
- Componente critico per navigazione dell'app
- Dipende da useAuth per gestione permessi
- Integra multiple componenti (HeaderButtons, CompanySwitcher, SyncStatusBar)
- Layout responsive con bottom navigation

### **Raccomandazioni**
- Testare con utenti di diversi ruoli (admin, responsabile, dipendente)
- Verificare integrazione con tutti i componenti dipendenti
- Testare performance su dispositivi mobili
- Verificare accessibilità completa

---

## 🚀 PROSSIMI STEP

1. **Eseguire test funzionali** - Verificare navigazione base
2. **Eseguire test validazione** - Verificare permessi e stati
3. **Eseguire test edge cases** - Verificare casi limite
4. **Analizzare risultati** - Identificare bug o problemi
5. **Applicare fix** - Risolvere eventuali problemi
6. **Ri-testare** - Verificare che tutti i test passino
7. **Blindare componente** - Aggiungere commento LOCKED

---

*Questo file traccia il progresso del testing di MainLayout per Agente 5.*
