# 🚀 QUICK REFERENCE - Multi-Agent System

> **FILE DI RIFERIMENTO RAPIDO** per agenti che lavorano sul sistema multi-agent BHM v.2

---

## 📋 CHECKLIST PRIMA DI INIZIARE

### ✅ Setup Iniziale
- [ ] Leggi `AGENT_STATUS.md` per stato globale
- [ ] Leggi `REGOLE_AGENTI.md` per regole critiche  
- [ ] Leggi `MASTER_TRACKING.md` per stato componenti
- [ ] Verifica porta assegnata (3000/3001/3002)
- [ ] Controlla lock system: `npm run lock:status`

### ✅ Avvio Sistema
```bash
# Avvio multi-istanza
npm run dev:multi

# Monitoraggio real-time
npm run lock:monitor

# Test con lock automatico
npm run test:agent1  # Porta 3000
npm run test:agent2  # Porta 3001  
npm run test:agent3  # Porta 3002
```

---

## 🎯 ASSEGNAZIONI AGENTI

| Agente | Porta | Area | Priorità | Status Attuale | Prossimo Elemento |
|--------|-------|------|----------|----------------|-------------------|
| **Agente 1** | 3000 | UI Elementi Base | 🔥 CRITICA | ✅ Free | Button.tsx |
| **Agente 2** | 3001 | Form e Validazioni | 🔥 CRITICA | ✅ Free | LoginForm |
| **Agente 3** | 3002 | Logiche Business | 🔥 CRITICA | ⏳ Queue #2 | TemperatureValidation |

---

## 🔒 COMANDI LOCK SYSTEM

### Monitoraggio
```bash
npm run lock:status      # Stato lock attuali
npm run lock:monitor     # Monitor real-time
npm run lock:cleanup     # Pulizia lock stale
```

### Port Detection
```bash
npm run detect:port      # Trova prima porta libera
npm run detect:all       # Lista tutte le porte
npm run detect:free      # Lista porte libere
npm run detect:monitor   # Monitor porte continuo
```

### Test con Lock
```bash
npm run test:agent1      # Test Agente 1 con lock
npm run test:agent2      # Test Agente 2 con lock
npm run test:agent3      # Test Agente 3 con lock
```

---

## 📊 STATI POSSIBILI

| Stato | Significato | Azione |
|-------|-------------|--------|
| ⏳ **In attesa** | Agente non ancora iniziato | Inizia lavoro |
| 🔄 **Testing** | Sta testando elemento | Continua test |
| 🔄 **Bug Fix** | Sta fixando bug | Fixa e ri-testa |
| ✅ **Blinded** | Elemento completato | Passa al prossimo |
| ⚠️ **Conflitto** | Conflitto con altri agenti | Risolvi conflitto |
| ❌ **Problemi** | Problemi tecnici | Chiedi supporto |

---

## 🚨 REGOLE CRITICHE

### ❌ MAI FARE
- Modificare file con `// LOCKED:`
- Lavorare senza lock system
- Saltare test di validazione
- Usare dati mock senza verificare database

### ✅ SEMPRE FARE
- Consultare database Supabase prima di testare
- Aggiornare `AGENT_STATUS.md` dopo ogni modifica
- Usare lock system per coordinamento
- Testare con dati reali verificati

---

## 🔗 DIPENDENZE CRITICHE

### Sequenza Obbligatoria
```
Agente 1 (UI Base) → Agente 2 (Form) → Agente 3 (Business)
```

### Prerequisiti
- **Agente 2** deve aspettare che **Agente 1** completi Button.tsx e Input.tsx
- **Agente 3** deve aspettare che **Agente 2** completi LoginForm

---

## 📞 SUPPORTO RAPIDO

### Se hai problemi:
1. **Leggi** `REGOLE_AGENTI.md` completamente
2. **Controlla** `AGENT_STATUS.md` per stato globale
3. **Verifica** `MASTER_TRACKING.md` per stato componenti
4. **Chiedi** chiarimenti all'utente

### Comandi di emergenza:
```bash
# Reset completo lock system
npm run lock:cleanup

# Riavvio sistema multi-istanza
npm run dev:multi

# Verifica stato generale
npm run lock:status
```

---

## 📝 TEMPLATE RAPIDO

### Per iniziare lavoro:
```markdown
## AGENTE [X] - [NomeElemento]
- **Porta**: 300X
- **Status**: 🔄 Testing
- **Test Eseguiti**: 0/X
- **Bug Trovati**: []
- **Note**: [Descrizione lavoro]
```

### Per completare lavoro:
```markdown
## AGENTE [X] - [NomeElemento] ✅ COMPLETATO
- **Test Eseguiti**: X/X (100%)
- **Bug Risolti**: [Lista]
- **Status**: ✅ Blinded
- **Prossimo**: [NomeElementoSuccessivo]
```

---

**RICORDA**: La qualità è tutto! Meglio un elemento perfettamente blindato che 10 elementi parzialmente funzionanti. 🛡️
