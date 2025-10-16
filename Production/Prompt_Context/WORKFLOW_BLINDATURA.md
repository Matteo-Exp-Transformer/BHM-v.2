# 🔄 WORKFLOW BLINDATURA - Processo Step-by-Step

> **Guida completa per il processo di blindatura delle componenti**

## 📋 OVERVIEW DEL PROCESSO

Il processo di blindatura segue un ciclo iterativo per ogni componente:

```
Esplorazione → Analisi → Test → Fix → Re-Test → Lock
```

## 🔍 FASE 1: ESPLORAZIONE E MAPPATURA

### 1.1 Esplorazione con Playwright MCP
```bash
# Usare Playwright MCP per navigare l'app
- Aprire ogni pagina dell'app
- Identificare tutti i componenti UI
- Mappare tutte le interazioni possibili
- Documentare ogni funzionalità trovata
```

### 1.2 Generazione Inventario
Creare file `Production/Knowledge/[AREA]_COMPONENTI.md` con:
- Lista completa componenti trovate
- Tutte le funzionalità per componente
- Tutte le interazioni utente
- Tutte le chiamate API/database
- Screenshot delle UI principali

### 1.3 Prioritizzazione
Seguire l'ordine definito in `REGOLE_AGENTI.md`

## 🔬 FASE 2: ANALISI COMPONENTE

### 2.1 Lettura Codice Sorgente
```javascript
// Per ogni componente, analizzare:
- Tutte le funzioni/metodi
- Tutti gli stati possibili (useState, props)
- Tutte le props/input
- Tutte le dipendenze (import, hooks)
- Tutti i side effects
```

### 2.2 Identificazione Funzionalità
```javascript
// Mappare:
- Input fields e validazioni
- Bottoni e azioni
- Modal e dialog
- Navigation e routing
- API calls e database operations
- Error handling
- Loading states
```

### 2.3 Creazione Piano Test
Documentare in file tracking:
- Test funzionali necessari
- Test validazione dati
- Edge cases da testare
- Casi estremi da verificare

## 🧪 FASE 3: CREAZIONE TEST

### 3.1 Struttura File Test
```
Production/Test/[Area]/[Componente]/
├── test-funzionale.js      # Test UI e interazioni
├── test-validazione.js     # Test dati validi/invalidi
└── test-edge-cases.js      # Test casi limite
```

### 3.2 Template Test Funzionale
```javascript
// test-funzionale.js
const { test, expect } = require('@playwright/test');

test.describe('[Nome Componente] - Test Funzionali', () => {
  test('Dovrebbe [descrizione comportamento atteso]', async ({ page }) => {
    // Navigare alla pagina
    await page.goto('/[route]');
    
    // Verificare elemento presente
    await expect(page.locator('[selector]')).toBeVisible();
    
    // Interagire con elemento
    await page.click('[selector]');
    
    // Verificare risultato
    await expect(page.locator('[risultato]')).toBeVisible();
  });
});
```

### 3.3 Template Test Validazione
```javascript
// test-validazione.js
test.describe('[Nome Componente] - Test Validazione', () => {
  test('Dovrebbe accettare input validi', async ({ page }) => {
    // Test con dati corretti
    await page.fill('[input]', 'dato_valido');
    await page.click('[submit]');
    await expect(page.locator('[success]')).toBeVisible();
  });
  
  test('Dovrebbe rifiutare input invalidi', async ({ page }) => {
    // Test con dati sbagliati
    await page.fill('[input]', '');
    await page.click('[submit]');
    await expect(page.locator('[error]')).toBeVisible();
  });
});
```

### 3.4 Template Test Edge Cases
```javascript
// test-edge-cases.js
test.describe('[Nome Componente] - Edge Cases', () => {
  test('Dovrebbe gestire valori limite', async ({ page }) => {
    // Test stringa vuota
    // Test null/undefined
    // Test valori molto grandi
    // Test caratteri speciali
  });
});
```

## 🔧 FASE 4: ESECUZIONE E FIX

### 4.1 Esecuzione Test
```bash
# Eseguire tutti i test per la componente
npx playwright test Production/Test/[Area]/[Componente]/
```

### 4.2 Analisi Risultati
```javascript
// Per ogni test fallito:
1. Identificare la causa del fallimento
2. Verificare se è un bug o test sbagliato
3. Se bug: fixare il codice
4. Se test sbagliato: correggere il test
5. Ri-eseguire il test
```

### 4.3 Iterazione
```javascript
// Ripetere fino a 100% successo:
- Fix → Test → Fix → Test
- Ogni fix deve essere minimale
- Ogni fix deve essere testato
- Verificare che non ci siano side effects
```

## 🔒 FASE 5: BLINDATURA E LOCK

### 5.1 Verifica Finale
```javascript
// Prima del lock, verificare:
✅ Tutti i test passano (100%)
✅ Funzionalità verificata manualmente
✅ UI/UX corretta
✅ Nessun side effect su altre componenti
✅ Performance accettabile
✅ Error handling corretto
```

### 5.2 Aggiunta Commenti Lock
```javascript
// Nel codice sorgente, aggiungere:
// LOCKED: [Data] - [NomeComponente] blindata
// Tutti i test passano, funzionalità verificata
// NON MODIFICARE SENZA PERMESSO ESPLICITO

// Esempio:
const LoginForm = () => {
  // LOCKED: 2025-01-15 - LoginForm blindata
  // Test: login-validi, login-invalidi, login-edge-cases
  // NON MODIFICARE SENZA PERMESSO ESPLICITO
  
  const [email, setEmail] = useState('');
  // ... resto del codice
};
```

### 5.3 Aggiornamento Tracking
```markdown
# In Production/Knowledge/[AREA]_TRACKING.md:
## [Nome Componente]
- **Stato**: 🔒 LOCKED
- **Data Lock**: 2025-01-15
- **Test Eseguiti**: 15/15 (100%)
- **File Sorgente**: src/[path]/[file].tsx
- **Test Files**: Production/Test/[Area]/[Componente]/
```

### 5.4 Aggiornamento Master
```markdown
# In Production/Knowledge/MASTER_TRACKING.md:
| Area | Componenti Totali | Testate | Locked | Status |
|------|------------------|---------|---------|---------|
| 🔐 Autenticazione | 1 | 1 | 1 | 🔒 1 locked |
```

### 5.5 Commit
```bash
git add .
git commit -m "LOCK: [NomeComponente] - Blindatura completata

- Tutti i test passano (15/15)
- Funzionalità verificata con dati validi/invalidi
- Edge cases testati
- Componente bloccata e non modificabile"
```

## 🚨 GESTIONE ERRORI

### Se Test Falliscono:
1. **NON fare lock** della componente
2. Analizzare la causa del fallimento
3. Fixare il problema
4. Ri-eseguire tutti i test
5. Solo se 100% successo: procedere con lock

### Se Side Effects:
1. **FERMARE** il processo
2. Analizzare l'impatto
3. Fixare il side effect
4. Ri-testare componente originale
5. Ri-testare componente impattata
6. Solo se tutto OK: procedere con lock

## 📊 METRICHE E REPORTING

### Per Ogni Componente:
- **Tempo speso**: tracking ore/minuti
- **Test eseguiti**: numero e tipologia
- **Bug trovati**: lista e severità
- **Fix applicati**: descrizione e impatto
- **Performance**: metriche prima/dopo

### Report Settimanale:
- Componenti completate
- Componenti in corso
- Problemi riscontrati
- Tempo totale investito
- Prossimi obiettivi

---

**RICORDA**: La qualità è più importante della velocità. Meglio una componente perfettamente blindata che 10 componenti parzialmente funzionanti! 🛡️


