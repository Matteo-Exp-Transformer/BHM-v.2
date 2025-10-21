# 📅 REGOLE SISTEMA DATE DINAMICO
**Progetto**: BHM v.2 - Business HACCP Manager  
**Versione**: 1.0  
**Data**: {DATA_CORRENTE_SESSIONE}

## 🎯 SCOPO
Questo documento definisce le regole per il sistema di date dinamico del progetto, evitando confusione e errori.

## 📅 SISTEMA DATA CORRENTE DINAMICA

### **DEFINIZIONE CHIARA**
- **Data corrente sessione** = Data di inizio della sessione di lavoro attuale
- **Formato**: YYYY-MM-DD (formato ISO standard)
- **Utilizzo**: Per cartelle, file, e riferimenti temporali
- **Aggiornamento**: Automatico all'inizio di ogni nuova sessione

### **REGOLE FONDAMENTALI**

#### **✅ COSA FARE**
1. **SEMPRE usare** `{DATA_CORRENTE_SESSIONE}` nei template e esempi
2. **SEMPRE ottenere** la data corrente con comando appropriato prima di creare file
3. **SEMPRE verificare** che le cartelle usino la data corrente di sessione
4. **SEMPRE aggiornare** la data all'inizio di ogni nuova sessione di lavoro

#### **❌ COSA NON FARE**
1. **NON usare mai** date hardcoded o date di esempio
2. **NON copiare** date da altri file o documenti
3. **NON assumere** che una data sia corretta senza verificare
4. **NON lasciare** date di esempio nei file di documentazione

### **COMANDI PER OTTENERE DATA CORRENTE**

#### **PowerShell (Windows)**
```powershell
$currentDate = Get-Date -Format "yyyy-MM-dd"
Write-Host "Data corrente: $currentDate"
```

#### **Bash (Linux/Mac)**
```bash
current_date=$(date +%Y-%m-%d)
echo "Data corrente: $current_date"
```

### **ESEMPI DI UTILIZZO CORRETTO**

#### **✅ CORRETTO**
```markdown
# Report Agente 1
**Data**: {DATA_CORRENTE_SESSIONE}
**Sessione**: Analisi componenti

File salvato in: Production/Sessione_di_lavoro/Agente_1/{DATA_CORRENTE_SESSIONE}/
```

#### **❌ SBAGLIATO**
```markdown
# Report Agente 1
**Data**: {DATA_CORRENTE_SESSIONE}
**Sessione**: Analisi componenti

File salvato in: Production/Sessione_di_lavoro/Agente_1/{DATA_CORRENTE_SESSIONE}/
```

### **VERIFICA AUTOMATICA**

#### **Script di Verifica**
```powershell
# Verifica date hardcoded
$hardcodedDates = Get-ChildItem . -Recurse -Filter "*.md" | Select-String -Pattern "\d{4}-\d{2}-\d{2}" | Where-Object {$_.Line -notmatch "DATA_CORRENTE_SESSIONE|YYYY-MM-DD|esempio|example"}
if ($hardcodedDates) {
    Write-Host "⚠️ Date hardcoded trovate:" -ForegroundColor Red
    $hardcodedDates | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber)" -ForegroundColor Red }
}
```

### **GESTIONE ERRORI**

#### **Se trovi date hardcoded:**
1. **Identifica** il file contenente la data
2. **Sostituisci** con `{DATA_CORRENTE_SESSIONE}`
3. **Verifica** che il file sia nella cartella corretta
4. **Testa** che tutto funzioni correttamente

#### **Se non sei sicuro della data:**
1. **Usa** il comando appropriato per ottenere la data corrente
2. **Verifica** con altri agenti se necessario
3. **Documenta** la decisione presa
4. **Aggiorna** la documentazione se necessario

## 🎯 OBIETTIVO FINALE

**Sistema completamente dinamico** dove:
- ❌ **Zero date hardcoded** nel progetto
- ❌ **Zero date di esempio** nella documentazione
- ✅ **Solo data corrente sessione** utilizzata
- ✅ **Aggiornamento automatico** per nuove sessioni

---
**📅 Data**: {DATA_CORRENTE_SESSIONE}  
**👤 Autore**: Agente 8 - Documentation Manager  
**🎯 Status**: ✅ **REGOLE DEFINITE E DOCUMENTATE**
