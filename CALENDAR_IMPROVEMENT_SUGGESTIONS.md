# 💡 Suggerimenti Miglioramento Calendario

## ✅ RISOLTO: Product Expiry ora visibile per reparto

### Problema Risolto ✅

**File**: `src/features/calendar/hooks/useAggregatedEvents.ts` linea 287-298

```typescript
assigned_to: [], // Rimane vuoto per assigned_to
department_id: product.department_id, // ✅ Reparto del prodotto
metadata: {
  // ✅ Assegnazione per reparto specifico invece di 'all'
  assigned_to_category: product.department_id ? `department:${product.department_id}` : 'all',
  notes: `Scadenza prodotto: ${product.name}`,
},
```

**File**: `src/features/calendar/hooks/useFilteredEvents.ts` linea 84-90

```typescript
// ✅ Se assegnato a reparto specifico, controlla department_assignments
if (assignment.assigned_to_category?.startsWith('department:')) {
  const departmentId = assignment.assigned_to_category.replace(
    'department:',
    ''
  )
  if (staffMember.department_assignments?.includes(departmentId)) {
    return true
  }
}
```

**Effetto**: ✅ I dipendenti vedono solo le scadenze prodotti del loro reparto tramite `department_assignments`

### 🎯 Logica Implementata

1. **Prodotti** hanno `department_id` (singolo reparto)
2. **Staff** hanno `department_assignments` (array di reparti assegnati)
3. **Product Expiry** viene assegnato con `assigned_to_category: "department:{department_id}"`
4. **Filtraggio** controlla se `staffMember.department_assignments.includes(departmentId)`

### 📋 Esempi Pratici

- **Prodotto "Latte"** in reparto `"cucina"` → Solo dipendenti con `department_assignments: ["cucina"]` vedono la scadenza
- **Prodotto "Pane"** in reparto `"magazzino"` → Solo dipendenti con `department_assignments: ["magazzino"]` vedono la scadenza
- **Dipendente Mario** con `department_assignments: ["cucina", "magazzino"]` → Vede scadenze di entrambi i reparti
- **Admin/Responsabile** → Vede TUTTE le scadenze (logica esistente)

### Soluzione Proposta

Assegnare eventi scadenza prodotti ai dipendenti del reparto:

```typescript
function convertProductExpiryToEvent(
  product: Product,
  companyId: string,
  userId: string
): CalendarEvent {
  // ... codice esistente ...

  return {
    // ... altri campi ...
    assigned_to: [], // Rimane vuoto per assigned_to

    // ✅ AGGIUNGI department_id per filtraggio
    department_id: product.department_id,

    metadata: {
      product_id: product.id,
      conservation_point_id: product.conservation_point_id,
      // ✅ AGGIUNGI assegnazione a categoria/reparto
      assigned_to_category: product.department_id ? 'all' : undefined,
      notes: `Scadenza prodotto: ${product.name}`,
    },
  }
}
```

**Poi modifica useFilteredEvents.ts** per filtrare anche per department:

```typescript
// In checkEventAssignment():
function checkEventAssignment(
  event: CalendarEvent,
  staffMember: StaffMember
): boolean {
  // ... logica esistente ...

  // ✅ AGGIUNGI: Se evento ha department_id, mostra a dipendenti del reparto
  if (event.department_id && staffMember.department_assignments) {
    if (staffMember.department_assignments.includes(event.department_id)) {
      return true
    }
  }

  return false
}
```

**Risultato**: Dipendente del reparto "Cucina" vede scadenze prodotti in Cucina.

---

## 🎯 Opzioni Alternative Assegnazione Product Expiry

### Opzione 1: Assegna a TUTTI (più semplice)

```typescript
metadata: {
  assigned_to_category: 'all',  // Tutti vedono
}
```

**Pro**: Semplice, tutti informati
**Contro**: Può creare rumore per dipendenti non interessati

### Opzione 2: Assegna per Conservation Point

```typescript
// Trova staff assegnati al conservation point
const assignedStaff = getStaffByConservationPoint(product.conservation_point_id)

assigned_to: assignedStaff.map(s => s.id)
metadata: {
  assigned_to_category: 'responsabile',  // + responsabili
}
```

**Pro**: Più preciso
**Contro**: Richiede mapping conservation point → staff

### Opzione 3: Assegna per Product Category

```typescript
// Es: Prodotti "Carni" → Categoria "Cuochi"
const categoryMap = {
  'Carni Fresche': 'Cuochi',
  'Latticini': 'Banconisti',
  'Verdure': 'Cuochi',
}

metadata: {
  assigned_to_category: categoryMap[product.category] || 'all',
}
```

**Pro**: Logica business-oriented
**Contro**: Richiede mantenere mapping

---

## 📋 Raccomandazione

**Per MVP**: Usa **Opzione 1** (assegna a tutti)

**Per Produzione**: Usa **Soluzione Proposta** (filtra per department)

**Implementazione**:

1. Modifica `convertProductExpiryToEvent()` in useAggregatedEvents.ts
2. Modifica `checkEventAssignment()` in useFilteredEvents.ts
3. Test con dipendente di un reparto specifico

---

_Creato: 2025-01-05_
_Riferimento: Custom Events Assignment_
