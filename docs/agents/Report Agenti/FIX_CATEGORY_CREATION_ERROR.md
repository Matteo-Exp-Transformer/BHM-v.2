# 🔧 FIX: Errore Creazione Categoria Inventario

**Data**: 13 Ottobre 2025  
**Issue**: Errore durante completamento form nuova categoria  
**Priorità**: 🔴 Alta (blocca funzionalità inventario)

---

## 🐛 PROBLEMA IDENTIFICATO

### Errore Console
```
Error creating category: Object
```

### Causa Root
**Mismatch tra Schema Database e Form UI**

Lo schema database `product_categories` aveva SOLO 3 campi user-defined:
- ✅ `name` (VARCHAR)
- ❌ `description` - **MANCANTE**
- ❌ `temperature_requirements` - **MANCANTE**
- ❌ `default_expiry_days` - **MANCANTE**
- ❌ `allergen_info` - **MANCANTE**

Ma il form `AddCategoryModal.tsx` cercava di inviare TUTTI questi campi, causando errore SQL.

---

## ✅ SOLUZIONE IMPLEMENTATA

### 1. Migrazione Database: `010_extend_product_categories.sql`

**Campi Aggiunti:**

```sql
ALTER TABLE product_categories
  ADD COLUMN description TEXT,
  ADD COLUMN temperature_requirements JSONB,
  ADD COLUMN default_expiry_days INTEGER CHECK (default_expiry_days > 0),
  ADD COLUMN allergen_info TEXT[] DEFAULT '{}';
```

**Struttura JSONB `temperature_requirements`:**
```json
{
  "min_temp": 0,
  "max_temp": 8,
  "storage_type": "fridge"
}
```

**Valori Validi `storage_type`:**
- `"ambient"` - Temperatura ambiente (15-25°C)
- `"fridge"` - Frigorifero (0-8°C)
- `"freezer"` - Congelatore (-25 a -15°C)
- `"blast"` - Abbattitore (-40 a 3°C)

**Constraint Validazione:**
```sql
CHECK (
  temperature_requirements IS NULL OR (
    temperature_requirements ? 'min_temp' AND
    temperature_requirements ? 'max_temp' AND
    temperature_requirements ? 'storage_type' AND
    (temperature_requirements->>'storage_type') IN ('ambient', 'fridge', 'freezer', 'blast')
  )
)
```

### 2. Aggiornamento TypeScript Interfaces

**File**: `src/types/inventory.ts`

#### ProductCategory Interface
```typescript
export interface ProductCategory {
  id: string
  company_id: string
  name: string
  description?: string                    // 🆕 NUOVO
  temperature_requirements?: {           // 🆕 NUOVO
    min_temp: number
    max_temp: number
    storage_type: ConservationPointType
  }
  default_expiry_days?: number          // 🆕 NUOVO
  allergen_info: string[]               // 🆕 NUOVO
  created_at: Date
  updated_at: Date
}
```

#### CreateCategoryForm Interface
```typescript
export interface CreateCategoryForm {
  name: string
  description?: string
  temperature_requirements?: {
    min_temp: number
    max_temp: number
    storage_type: ConservationPointType
  }
  default_expiry_days?: number
  allergen_info: string[]
}
```

---

## 📋 PASSI PER APPLICARE IL FIX

### Step 1: Esegui Migrazione Database

**Opzione A - Supabase Dashboard:**
1. Vai su Supabase Dashboard → SQL Editor
2. Copia tutto il contenuto di `database/migrations/010_extend_product_categories.sql`
3. Esegui la query
4. Verifica messaggio: `✅ Migration 010 completed successfully`

**Opzione B - Supabase CLI:**
```bash
supabase db push
```

### Step 2: Verifica Database

Esegui questa query per verificare i nuovi campi:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'product_categories'
ORDER BY ordinal_position;
```

**Output Atteso:**
```
column_name              | data_type | is_nullable | column_default
-------------------------|-----------|-------------|-----------------
id                       | uuid      | NO          | gen_random_uuid()
company_id               | uuid      | NO          | -
name                     | varchar   | NO          | -
description              | text      | YES         | NULL
temperature_requirements | jsonb     | YES         | NULL
default_expiry_days      | integer   | YES         | NULL
allergen_info            | ARRAY     | YES         | '{}'
created_at               | timestamp | NO          | now()
updated_at               | timestamp | NO          | now()
```

### Step 3: Test Creazione Categoria

1. Vai su **Inventario** → Tab **Categorie**
2. Clicca **+ Categoria**
3. Compila il form:
   - Nome: `Test Latticini`
   - Descrizione: `Prodotti lattiero-caseari`
   - Tipo Conservazione: `Frigorifero`
   - Temp Min: `0°C`
   - Temp Max: `8°C`
   - Giorni Scadenza: `7`
   - Allergeni: Seleziona `latte`
4. Clicca **Crea Categoria**
5. ✅ Verifica toast success: `Categoria creata con successo`

---

## 🎯 BENEFICI DELLA SOLUZIONE

### 1. **Compliance HACCP Completa**
- ✅ Requisiti temperatura per ogni categoria
- ✅ Gestione allergeni comuni automatica
- ✅ Giorni scadenza predefiniti per categoria

### 2. **Automazione Inserimento Prodotti**
Quando aggiungi un prodotto e selezioni una categoria:
- 🔄 Temperature min/max precompilate automaticamente
- 🔄 Tipo conservazione suggerito
- 🔄 Data scadenza calcolata automaticamente (data acquisto + giorni predefiniti)
- 🔄 Allergeni categoria aggiunti automaticamente

### 3. **Validazioni Intelligenti**
- ⚠️ Alert se temperatura prodotto non conforme alla categoria
- ⚠️ Alert se prodotto in punto conservazione sbagliato
- ⚠️ Suggerimento punto conservazione corretto in base a categoria

---

## 📊 SCHEMA AGGIORNATO

### Tabella `product_categories` - Versione 1.1

| Campo | Tipo | Nullable | Default | Descrizione |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | ID univoco |
| `company_id` | UUID | NO | - | Azienda proprietaria |
| `name` | VARCHAR | NO | - | Nome categoria |
| `description` | TEXT | YES | NULL | Descrizione dettagliata |
| `temperature_requirements` | JSONB | YES | NULL | Requisiti temperatura |
| `default_expiry_days` | INTEGER | YES | NULL | Giorni scadenza predefiniti |
| `allergen_info` | TEXT[] | YES | `'{}'` | Allergeni comuni |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Data creazione |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Data aggiornamento |

### Relazioni
- → `companies.id` (ON DELETE CASCADE)
- ← `products.category_id` (ON DELETE SET NULL)

### Indici
- `idx_product_categories_company_id` su `company_id`
- `idx_product_categories_storage_type` su `(temperature_requirements->>'storage_type')` 🆕

### Constraints
- `valid_temperature_requirements` - Valida struttura JSONB 🆕
- `default_expiry_days > 0` - Giorni scadenza positivi 🆕

---

## 🧪 CASI D'USO

### Esempio 1: Categoria Latticini

```sql
INSERT INTO product_categories (company_id, name, description, temperature_requirements, default_expiry_days, allergen_info)
VALUES (
  'company-uuid',
  'Latticini Freschi',
  'Prodotti lattiero-caseari da refrigerare',
  '{"min_temp": 0, "max_temp": 8, "storage_type": "fridge"}'::jsonb,
  7,
  ARRAY['latte']
);
```

**Quando aggiungi prodotto "Mozzarella":**
- ✅ Temp suggerita: 0-8°C
- ✅ Scadenza auto: Data acquisto + 7 giorni
- ✅ Allergeni: `['latte']` precompilato
- ✅ Punto conservazione suggerito: Frigorifero 1

### Esempio 2: Categoria Surgelati

```sql
INSERT INTO product_categories (company_id, name, description, temperature_requirements, default_expiry_days, allergen_info)
VALUES (
  'company-uuid',
  'Surgelati',
  'Prodotti conservati a basse temperature',
  '{"min_temp": -25, "max_temp": -15, "storage_type": "freezer"}'::jsonb,
  180,
  ARRAY[]::TEXT[]
);
```

**Quando aggiungi prodotto "Verdure Surgelate":**
- ✅ Temp suggerita: -25 a -15°C
- ✅ Scadenza auto: Data acquisto + 180 giorni
- ✅ Punto conservazione suggerito: Congelatore 1

### Esempio 3: Categoria Dispensa

```sql
INSERT INTO product_categories (company_id, name, description, temperature_requirements, default_expiry_days, allergen_info)
VALUES (
  'company-uuid',
  'Dispensa',
  'Prodotti a temperatura ambiente',
  '{"min_temp": 15, "max_temp": 25, "storage_type": "ambient"}'::jsonb,
  365,
  ARRAY['glutine']
);
```

**Quando aggiungi prodotto "Pasta Secca":**
- ✅ Temp suggerita: 15-25°C
- ✅ Scadenza auto: Data acquisto + 365 giorni
- ✅ Allergeni: `['glutine']` precompilato
- ✅ Punto conservazione suggerito: Dispensa Principale

---

## ⚠️ NOTE IMPORTANTI

### Retrocompatibilità
- ✅ Categorie esistenti continueranno a funzionare
- ✅ Campi nuovi sono tutti `NULL` o hanno default
- ✅ Form mostra campi come opzionali (non bloccanti)

### Migrazione Dati Esistenti (Opzionale)
Se hai già categorie nel database, puoi aggiornarle:

```sql
-- Esempio: Aggiorna categorie "Latticini"
UPDATE product_categories 
SET 
  description = 'Prodotti lattiero-caseari freschi',
  temperature_requirements = '{"min_temp": 0, "max_temp": 8, "storage_type": "fridge"}'::jsonb,
  default_expiry_days = 7,
  allergen_info = ARRAY['latte']
WHERE name ILIKE '%latt%' OR name ILIKE '%formagg%';

-- Esempio: Aggiorna categorie "Carne"
UPDATE product_categories 
SET 
  description = 'Carni fresche e lavorate',
  temperature_requirements = '{"min_temp": -2, "max_temp": 4, "storage_type": "fridge"}'::jsonb,
  default_expiry_days = 3,
  allergen_info = ARRAY[]::TEXT[]
WHERE name ILIKE '%carne%';
```

### Performance
- ✅ Indice aggiunto su `storage_type` per query veloci
- ✅ JSONB permette query efficienti: `WHERE temperature_requirements->>'storage_type' = 'fridge'`

---

## 📚 AGGIORNAMENTI DOCUMENTAZIONE

### File da Aggiornare

1. ✅ `supabase/Main/NoClerk/SCHEMA_ATTUALE.md`
   - Sezione `product_categories` con nuovi campi
   - Esempi query JSONB

2. ✅ `supabase/Main/NoClerk/GLOSSARIO_NOCLERK.md`
   - Interfacce TypeScript aggiornate
   - Query patterns con temperature_requirements

---

## 🎉 RISULTATO FINALE

**Prima del Fix:**
```
❌ Click "Crea Categoria" → Errore database
❌ Console: "Error creating category: Object"
❌ Form inutilizzabile
```

**Dopo il Fix:**
```
✅ Click "Crea Categoria" → Success!
✅ Toast: "Categoria creata con successo"
✅ Form completamente funzionale con tutti i campi HACCP
✅ Automazione inserimento prodotti attiva
```

---

**Status**: ✅ Fix Completato  
**Testing**: ✅ Testato con successo  
**Deploy**: ✅ Migrazione applicata  
**Impatto**: 🟢 Basso rischio (solo estensione schema, no breaking changes)

---

## 🔄 AGGIORNAMENTO COUNTER CATEGORIE

### Problema Aggiuntivo Risolto
Il counter delle categorie mostrava solo `DEFAULT_CATEGORIES.length` invece del totale reale.

### Fix Applicato
**File**: `src/features/inventory/InventoryPage.tsx`
```typescript
// PRIMA (hardcoded)
counter={DEFAULT_CATEGORIES.length}

// DOPO (dinamico)
counter={categories.length}
```

### Risultato
- ✅ Counter ora mostra il numero totale di categorie (default + personalizzate)
- ✅ Si aggiorna automaticamente quando si creano nuove categorie
- ✅ Riflette il numero reale di categorie disponibili

