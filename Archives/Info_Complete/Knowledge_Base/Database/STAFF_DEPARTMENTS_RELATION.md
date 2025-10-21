# 👥 Relazione Staff ↔ Departments (Many-to-Many)

**Data**: 9 Gennaio 2025  
**Tipo Relazione**: Many-to-Many tramite Array PostgreSQL  
**Campo Chiave**: `staff.department_assignments`

---

## 🎯 PANORAMICA

La relazione tra **Staff** (dipendenti) e **Departments** (reparti) è una relazione **Many-to-Many**:
- Un **dipendente** può lavorare in **più reparti** (es. Mario lavora sia in Cucina che in Sala)
- Un **reparto** può avere **più dipendenti** assegnati

Questa relazione è implementata tramite il campo **array** `staff.department_assignments` invece della classica tabella junction.

---

## 📊 SCHEMA DATABASE

### Tabella: `staff`
```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  
  -- ⭐ CAMPO CHIAVE PER RELAZIONE MANY-TO-MANY
  department_assignments UUID[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Esempio Dati

**Tabella departments**:
| id | name | company_id |
|----|------|------------|
| `uuid-cucina` | Cucina | company-1 |
| `uuid-sala` | Sala | company-1 |
| `uuid-magazzino` | Magazzino | company-1 |

**Tabella staff**:
| id | name | department_assignments |
|----|------|------------------------|
| `staff-1` | Mario Rossi | `['uuid-cucina', 'uuid-sala']` |
| `staff-2` | Laura Bianchi | `['uuid-sala']` |
| `staff-3` | Giuseppe Verdi | `['uuid-cucina', 'uuid-magazzino']` |

**Interpretazione**:
- Mario Rossi lavora in **Cucina** e **Sala**
- Laura Bianchi lavora solo in **Sala**
- Giuseppe Verdi lavora in **Cucina** e **Magazzino**

---

## 💻 INTERFACCIA TYPESCRIPT

### Interface StaffMember

```typescript
export interface StaffMember {
  id: string
  company_id: string
  name: string
  role: StaffRole
  category: string
  
  // ⭐ Array di UUID dei reparti assegnati
  department_assignments: string[]  // UUID[]
  
  created_at: Date
  updated_at: Date
}
```

### Input Forms

```typescript
// Durante l'onboarding - Creazione staff
export interface CreateStaffInput {
  name: string
  role: StaffRole
  category: string
  
  // Seleziona uno o più reparti
  department_assignments?: string[]  // Es. ['uuid-cucina', 'uuid-sala']
}

// Update staff esistente
export interface UpdateStaffInput extends Partial<CreateStaffInput> {
  id: string
}
```

---

## 🔍 QUERY PATTERNS

### 1. Ottieni Staff per Reparto

```typescript
// Trova tutti i dipendenti che lavorano in un reparto specifico
const getStaffByDepartment = async (departmentId: string) => {
  const { data } = await supabase
    .from('staff')
    .select('*')
    .contains('department_assignments', [departmentId])  // ⭐ Operatore @>
    .eq('status', 'active')
  
  return data
}

// Esempio uso:
// const cucinaStaff = await getStaffByDepartment('uuid-cucina')
// Ritorna: [Mario Rossi, Giuseppe Verdi]
```

### 2. Ottieni Reparti per Dipendente

```typescript
// Trova tutti i reparti assegnati a un dipendente
const getDepartmentsForStaff = async (staffId: string) => {
  // 1. Ottieni department_assignments
  const { data: staff } = await supabase
    .from('staff')
    .select('department_assignments')
    .eq('id', staffId)
    .single()
  
  if (!staff?.department_assignments?.length) return []
  
  // 2. Ottieni dettagli reparti
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .in('id', staff.department_assignments)  // ⭐ WHERE id IN (...)
  
  return departments
}

// Esempio uso:
// const mariosDepts = await getDepartmentsForStaff('staff-1')
// Ritorna: [{id: 'uuid-cucina', name: 'Cucina'}, {id: 'uuid-sala', name: 'Sala'}]
```

### 3. Assegna Reparti (Onboarding)

```typescript
// Durante l'onboarding, assegna uno o più reparti al dipendente
const assignStaffToDepartments = async (
  staffId: string,
  departmentIds: string[]
) => {
  const { data } = await supabase
    .from('staff')
    .update({ 
      department_assignments: departmentIds  // ⭐ Sostituisce completamente
    })
    .eq('id', staffId)
    .select()
    .single()
  
  return data
}

// Esempio uso durante onboarding:
// await assignStaffToDepartments('staff-1', ['uuid-cucina', 'uuid-sala'])
```

### 4. Aggiungi Reparto a Staff Esistente

```typescript
// Aggiungi un nuovo reparto senza rimuovere quelli esistenti
const addDepartmentToStaff = async (
  staffId: string,
  newDepartmentId: string
) => {
  // 1. Ottieni reparti attuali
  const { data: staff } = await supabase
    .from('staff')
    .select('department_assignments')
    .eq('id', staffId)
    .single()
  
  const currentDepts = staff?.department_assignments || []
  
  // 2. Aggiungi nuovo reparto se non presente
  if (currentDepts.includes(newDepartmentId)) {
    return staff // Già assegnato
  }
  
  // 3. Update con array espanso
  const { data } = await supabase
    .from('staff')
    .update({ 
      department_assignments: [...currentDepts, newDepartmentId]  // ⭐ Spread operator
    })
    .eq('id', staffId)
    .select()
    .single()
  
  return data
}

// Esempio uso:
// await addDepartmentToStaff('staff-2', 'uuid-magazzino')
// Laura ora lavora anche in Magazzino oltre che in Sala
```

### 5. Rimuovi Reparto da Staff

```typescript
// Rimuovi un reparto senza eliminare gli altri
const removeDepartmentFromStaff = async (
  staffId: string,
  departmentIdToRemove: string
) => {
  const { data: staff } = await supabase
    .from('staff')
    .select('department_assignments')
    .eq('id', staffId)
    .single()
  
  // Filter out il reparto da rimuovere
  const updatedDepts = (staff?.department_assignments || [])
    .filter(id => id !== departmentIdToRemove)  // ⭐ Array.filter()
  
  const { data } = await supabase
    .from('staff')
    .update({ department_assignments: updatedDepts })
    .eq('id', staffId)
    .select()
    .single()
  
  return data
}

// Esempio uso:
// await removeDepartmentFromStaff('staff-1', 'uuid-sala')
// Mario ora lavora solo in Cucina
```

### 6. Staff con Dettagli Reparti (Join Manuale)

```typescript
// Ottieni staff con i nomi dei reparti invece di soli UUID
const getStaffWithDepartmentNames = async (companyId: string) => {
  const { data: staffList } = await supabase
    .from('staff')
    .select('*')
    .eq('company_id', companyId)
  
  if (!staffList) return []
  
  // Per ogni staff, fetch reparti
  const staffWithDepts = await Promise.all(
    staffList.map(async (staff) => {
      if (!staff.department_assignments?.length) {
        return { ...staff, departments: [] }
      }
      
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name, is_active')
        .in('id', staff.department_assignments)
      
      return { 
        ...staff, 
        departments: departments || [] 
      }
    })
  )
  
  return staffWithDepts
}

// Esempio output:
// [
//   {
//     id: 'staff-1',
//     name: 'Mario Rossi',
//     department_assignments: ['uuid-cucina', 'uuid-sala'],
//     departments: [
//       { id: 'uuid-cucina', name: 'Cucina', is_active: true },
//       { id: 'uuid-sala', name: 'Sala', is_active: true }
//     ]
//   }
// ]
```

### 7. Statistiche: Conta Staff per Reparto

```typescript
// Conta quanti dipendenti sono assegnati a ogni reparto
const getStaffCountByDepartment = async (companyId: string) => {
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .eq('company_id', companyId)
  
  if (!departments) return []
  
  const counts = await Promise.all(
    departments.map(async (dept) => {
      const { data: staff } = await supabase
        .from('staff')
        .select('id')
        .eq('company_id', companyId)
        .contains('department_assignments', [dept.id])
      
      return {
        department_id: dept.id,
        department_name: dept.name,
        staff_count: staff?.length || 0
      }
    })
  )
  
  return counts
}

// Esempio output:
// [
//   { department_id: 'uuid-cucina', department_name: 'Cucina', staff_count: 2 },
//   { department_id: 'uuid-sala', department_name: 'Sala', staff_count: 2 },
//   { department_id: 'uuid-magazzino', department_name: 'Magazzino', staff_count: 1 }
// ]
```

---

## ⚛️ REACT HOOKS

### Hook per Gestire Staff con Reparti

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-toastify'

// Hook per ottenere staff con reparti
export const useStaffWithDepartments = (companyId: string) => {
  return useQuery({
    queryKey: ['staff-with-departments', companyId],
    queryFn: () => getStaffWithDepartmentNames(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // Cache 5 minuti
  })
}

// Hook per assegnare reparti
export const useAssignDepartments = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ staffId, departmentIds }: {
      staffId: string
      departmentIds: string[]
    }) => assignStaffToDepartments(staffId, departmentIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['staff-with-departments'])
      queryClient.invalidateQueries(['staff', variables.staffId])
      toast.success('Reparti assegnati con successo')
    },
    onError: (error) => {
      console.error('Errore assegnazione reparti:', error)
      toast.error('Impossibile assegnare i reparti')
    }
  })
}

// Hook per aggiungere singolo reparto
export const useAddDepartment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ staffId, departmentId }: {
      staffId: string
      departmentId: string
    }) => addDepartmentToStaff(staffId, departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-with-departments'])
      toast.success('Reparto aggiunto')
    }
  })
}

// Hook per rimuovere singolo reparto
export const useRemoveDepartment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ staffId, departmentId }: {
      staffId: string
      departmentId: string
    }) => removeDepartmentFromStaff(staffId, departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-with-departments'])
      toast.success('Reparto rimosso')
    }
  })
}
```

### Uso nei Componenti

```typescript
// Componente Onboarding - Step Staff
const StaffOnboardingStep = () => {
  const { data: departments } = useDepartments(companyId)
  const { mutate: assignDepts, isPending } = useAssignDepartments()
  const [selectedDepts, setSelectedDepts] = useState<string[]>([])
  
  const handleSaveStaff = async (staffData: CreateStaffInput) => {
    // 1. Crea staff
    const newStaff = await createStaff(staffData)
    
    // 2. Assegna reparti selezionati
    if (selectedDepts.length > 0) {
      assignDepts({
        staffId: newStaff.id,
        departmentIds: selectedDepts
      })
    }
  }
  
  return (
    <form onSubmit={handleSubmit(handleSaveStaff)}>
      {/* Form campi staff... */}
      
      {/* Multi-select reparti */}
      <div>
        <label>Reparti Assegnati</label>
        <MultiSelect
          options={departments?.map(d => ({ value: d.id, label: d.name }))}
          value={selectedDepts}
          onChange={setSelectedDepts}
          placeholder="Seleziona uno o più reparti"
        />
      </div>
      
      <button type="submit" disabled={isPending}>
        Salva Dipendente
      </button>
    </form>
  )
}
```

```typescript
// Componente Gestione Staff - Lista con reparti
const StaffList = () => {
  const { data: staffWithDepts, isLoading } = useStaffWithDepartments(companyId)
  
  if (isLoading) return <Spinner />
  
  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Ruolo</th>
          <th>Reparti</th>
        </tr>
      </thead>
      <tbody>
        {staffWithDepts?.map(staff => (
          <tr key={staff.id}>
            <td>{staff.name}</td>
            <td>{staff.role}</td>
            <td>
              {staff.departments.length > 0 ? (
                <div className="flex gap-2">
                  {staff.departments.map(dept => (
                    <Badge key={dept.id}>{dept.name}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">Nessun reparto</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## 🎨 UI/UX BEST PRACTICES

### 1. Onboarding - Selezione Multipla

```tsx
// Usa un multi-select con checkboxes per chiarezza
<div className="space-y-2">
  <label className="font-semibold">
    Reparti di Lavoro <span className="text-red-500">*</span>
  </label>
  <p className="text-sm text-gray-500">
    Seleziona tutti i reparti dove questo dipendente lavorerà
  </p>
  
  <div className="grid grid-cols-2 gap-3">
    {departments?.map(dept => (
      <label key={dept.id} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={selectedDepts.includes(dept.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedDepts([...selectedDepts, dept.id])
            } else {
              setSelectedDepts(selectedDepts.filter(id => id !== dept.id))
            }
          }}
        />
        <span>{dept.name}</span>
      </label>
    ))}
  </div>
</div>
```

### 2. Vista Lista - Badge Reparti

```tsx
// Mostra reparti come badge colorati
<td>
  {staff.departments.length > 0 ? (
    <div className="flex flex-wrap gap-1">
      {staff.departments.map(dept => (
        <span
          key={dept.id}
          className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
        >
          {dept.name}
        </span>
      ))}
    </div>
  ) : (
    <span className="text-gray-400 text-sm italic">Nessun reparto</span>
  )}
</td>
```

### 3. Vista Reparto - Lista Staff

```tsx
// Mostra dipendenti filtrati per reparto
const DepartmentDetail = ({ departmentId }: { departmentId: string }) => {
  const [staff, setStaff] = useState([])
  
  useEffect(() => {
    getStaffByDepartment(departmentId).then(setStaff)
  }, [departmentId])
  
  return (
    <div>
      <h3>Dipendenti in questo Reparto</h3>
      {staff.length > 0 ? (
        <ul>
          {staff.map(s => (
            <li key={s.id}>
              {s.name} - {s.role}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Nessun dipendente assegnato</p>
      )}
    </div>
  )
}
```

---

## ✅ VALIDATION RULES

### Frontend Validation

```typescript
// Validazione form con Zod
import { z } from 'zod'

const staffSchema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
  role: z.enum(['admin', 'responsabile', 'dipendente', 'collaboratore']),
  category: z.string().min(1, 'Categoria obbligatoria'),
  
  // Department assignments - ALMENO uno richiesto
  department_assignments: z
    .array(z.string().uuid())
    .min(1, 'Seleziona almeno un reparto')
    .max(10, 'Massimo 10 reparti')
})

// Uso nel form
const form = useForm({
  resolver: zodResolver(staffSchema),
  defaultValues: {
    department_assignments: []
  }
})
```

### Backend Validation (PostgreSQL)

```sql
-- Assicurati che department_assignments contenga solo UUID validi
ALTER TABLE staff
  ADD CONSTRAINT staff_valid_departments
  CHECK (
    department_assignments IS NOT NULL AND
    cardinality(department_assignments) >= 0
  );

-- Trigger per validare che i department_id esistano
CREATE OR REPLACE FUNCTION validate_department_assignments()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica che tutti i department_id esistano
  IF NEW.department_assignments IS NOT NULL THEN
    PERFORM 1
    FROM unnest(NEW.department_assignments) AS dept_id
    WHERE NOT EXISTS (
      SELECT 1 FROM departments 
      WHERE id = dept_id 
        AND company_id = NEW.company_id
        AND is_active = true
    );
    
    IF FOUND THEN
      RAISE EXCEPTION 'Uno o più department_id non validi o inattivi';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_staff_departments
  BEFORE INSERT OR UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION validate_department_assignments();
```

---

## 🔧 TROUBLESHOOTING

### Problema: Query `.contains()` non funziona

```typescript
// ❌ SBAGLIATO - contains richiede array
.contains('department_assignments', departmentId)

// ✅ CORRETTO - passa array anche per singolo valore
.contains('department_assignments', [departmentId])
```

### Problema: Department_assignments è NULL

```typescript
// Gestisci sempre il caso null/undefined
const depts = staff?.department_assignments || []

// Oppure con optional chaining
staff?.department_assignments?.forEach(...)
```

### Problema: Update sovrascrive invece di aggiungere

```typescript
// ❌ SBAGLIATO - sovrascrive tutto
update({ department_assignments: [newDept] })

// ✅ CORRETTO - spread existing + new
update({ department_assignments: [...currentDepts, newDept] })
```

---

## 📚 RIFERIMENTI

- **Schema Completo**: `NoClerk/SCHEMA_ATTUALE.md` → Sezione Staff (riga 77)
- **Glossario TypeScript**: `NoClerk/GLOSSARIO_NOCLERK.md` → Sezione 1.2 + 4.5
- **PostgreSQL Array Functions**: [Supabase Array Operators](https://supabase.com/docs/guides/database/arrays)

---

**Versione**: 1.0.0  
**Ultimo Aggiornamento**: 9 Gennaio 2025  
**Maintainer**: Dev Team BHM v.2

