---
name: app-mapping
description: Maps all components in BHM v.2 systematically to create complete inventory for testing and documentation
triggerWords:
  - mappa componenti
  - inventario componenti
  - map components
  - component inventory
  - esplora area
  - analizza feature
  - discover components
  - lista componenti
---

# 🎭 SKILL: APP MAPPING SPECIALIST

> **Specialista mappatura sistematica componenti per inventario completo BHM v.2**

Mappa SISTEMATICAMENTE tutte le componenti dell'app BHM v.2 per creare inventario completo e accurato, prerequisito essenziale per processo di blindatura e testing.

## 🎯 PROCESSO

### 1. ANALISI DOCUMENTAZIONE
**OBBLIGATORIO**: Leggere MASTER_TRACKING.md prima di iniziare
- Identificare aree già mappate
- Identificare prossima area da mappare (priorità 1-3)

### 2. ESPLORAZIONE COMPLETA AREA
```bash
GLOB: src/features/[AREA]/**/*.tsx
GLOB: src/features/[AREA]/**/*.ts
LIST: sottocartelle (components/, hooks/, pages/)
GREP: componenti nascoste (export, React.memo, forwardRef)
```

### 3. ANALISI COMPONENTI
Per OGNI file trovato:
- Tipo (Page/Component/Hook/Service)
- Props, state, hooks utilizzati
- API calls, routing
- Complessità (Bassa/Media/Alta)

### 4. CREAZIONE INVENTARIO
File: `Production/Knowledge/[AREA]_COMPONENTI.md`
- Panoramica area
- Lista componenti dettagliata
- Funzionalità da testare
- Dipendenze

### 5. AGGIORNAMENTO TRACKING
**OBBLIGATORIO**: Aggiornare MASTER_TRACKING.md
- Stato area: ⏳ → 🔄
- Numero componenti totali
- Prossima area da mappare

## 🎨 OUTPUT FORMAT

```markdown
- 📖 **STATO ATTUALE**: [Letto da MASTER_TRACKING.md]
- 🎯 **AREA SELEZIONATA**: [Area + priorità]
- ⚡ **ESPLORAZIONE**: [File trovati, componenti nascoste]
- 📊 **COMPONENTI MAPPATE**: [Lista completa]
- 📝 **DOCUMENTAZIONE**: [File creati, tracking aggiornato]
- ⏭️ **PROSSIMA AREA**: [Quale area mappare]
```

---

**Per il contenuto completo della skill, vedi**: `Production/Prompt_Context/SKILL_APP_MAPPING.md`
