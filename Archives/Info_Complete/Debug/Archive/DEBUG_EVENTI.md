# 🔍 DEBUG: Come verificare che il pulsante "Completa" funzioni

## 1️⃣ Verifica che ci siano Mansioni nel Calendario

Apri la console del browser (F12) e digita:

```javascript
// Verifica eventi caricati
window.__DEBUG_EVENTS__ = true
```

Poi ricarica la pagina e cerca nel log della console messaggi come:
- `✅ Loaded generic tasks from Supabase`
- Dovrebbe mostrare il numero di mansioni caricate

## 2️⃣ Crea una Mansione di Test

1. Nel calendario, clicca su **"Assegna nuova attività / mansione"**
2. Compila:
   - Nome: "Test Mansione"
   - Frequenza: "Giornaliera"
   - Ruolo: "Dipendente"
3. Clicca **"Crea Attività"**

## 3️⃣ Trova la Mansione nel Calendario

Le mansioni (general_task) dovrebbero apparire in **BLU** nel calendario.

## 4️⃣ Clicca sulla Mansione

Quando clicchi:
1. Si apre una **modal laterale** (pannello a destra)
2. Nel pannello dovresti vedere:
   - Titolo della mansione
   - "Attività Generale" come tipo
   - Sezione "Azioni" in basso
   - **PULSANTE VERDE "Completa"** (se non completata oggi)

## 5️⃣ Console Browser - Check Errori

Apri Console (F12) e cerca errori tipo:
```
❌ Error completing task
❌ Error loading completions
❌ Cannot read property 'taskId'
```

## 6️⃣ Verifica Database

Controlla che la migrazione sia stata eseguita:

1. Vai su Supabase Dashboard → SQL Editor
2. Esegui:
```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_name = 'task_completions'
);
```

Dovrebbe tornare `true`.

## 🐛 Problemi Comuni

### Problema: Non vedo il pulsante "Completa"
**Causa**: Stai cliccando su un evento di tipo "manutenzione" invece che "mansione"
**Soluzione**: Le mansioni hanno colore BLU e tipo "Attività Generale"

### Problema: Il pulsante c'è ma non fa nulla
**Causa**: Errore nella chiamata API
**Soluzione**: Controlla console browser per errori

### Problema: Errore "taskId is undefined"
**Causa**: L'evento non ha il campo `metadata.task_id`
**Soluzione**: Verifica con console:
```javascript
// Quando clicchi su un evento, copia l'oggetto event e ispezionalo
console.log(event.extendedProps?.metadata?.task_id)
console.log(event.metadata?.task_id)
```

## 📸 Screenshot Atteso

Quando clicchi su una mansione dovresti vedere:
```
╔══════════════════════════════════════╗
║  Test Mansione                    [X]║
╠══════════════════════════════════════╣
║  Attività Generale • [data]          ║
║                                      ║
║  Priorità: Media                     ║
║  Stato: Programmato                  ║
║                                      ║
║  Descrizione: ...                    ║
║                                      ║
║  ┌────────────────────────────┐     ║
║  │                            │     ║
║  │  [✓ Completa] [✏️ Modifica]│     ║
║  │     [🗑️ Elimina]           │     ║
║  └────────────────────────────┘     ║
╚══════════════════════════════════════╝
```
