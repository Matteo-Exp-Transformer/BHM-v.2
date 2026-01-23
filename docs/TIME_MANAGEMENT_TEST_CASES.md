# Test Cases - Gestione Orario Attività (time_management)

## Struttura Dati

### Form (camelCase)
```typescript
timeManagement?: {
  timeRange?: {
    startTime: string // HH:MM
    endTime: string   // HH:MM
    isOvernight: boolean
  }
  completionType?: 'timeRange' | 'startTime' | 'endTime' | 'none'
  completionStartTime?: string // HH:MM
  completionEndTime?: string   // HH:MM
}
```

### Database (snake_case JSONB)
```json
{
  "time_range": {
    "start_time": "09:00",
    "end_time": "17:00",
    "is_overnight": false
  },
  "completion_type": "timeRange" | "startTime" | "endTime" | "none",
  "completion_start_time": "09:00",
  "completion_end_time": "18:00"
}
```

## Test Cases

### 1. Nessuna configurazione (default)
**Input Form:**
```typescript
timeManagement: undefined
```

**Output Database:**
```json
null
```

**Comportamento:** Usa orario di apertura azienda

---

### 2. completionType: 'none'
**Input Form:**
```typescript
timeManagement: {
  completionType: 'none'
}
```

**Output Database:**
```json
{
  "completion_type": "none"
}
```

**Comportamento:** Usa orario di apertura azienda

---

### 3. completionType: 'timeRange' (con timeRange)
**Input Form:**
```typescript
timeManagement: {
  timeRange: {
    startTime: '09:00',
    endTime: '17:00',
    isOvernight: false
  },
  completionType: 'timeRange'
}
```

**Output Database:**
```json
{
  "time_range": {
    "start_time": "09:00",
    "end_time": "17:00",
    "is_overnight": false
  },
  "completion_type": "timeRange"
}
```

**Comportamento:** 
- Visibilità evento: solo durante time_range
- Completamento: solo durante time_range

---

### 4. completionType: 'timeRange' (senza timeRange)
**Input Form:**
```typescript
timeManagement: {
  completionType: 'timeRange'
  // timeRange mancante
}
```

**Output Database:**
```json
null
```

**Comportamento:** Non salvato (timeRange obbligatorio per completionType 'timeRange')

---

### 5. completionType: 'startTime'
**Input Form:**
```typescript
timeManagement: {
  completionType: 'startTime',
  completionStartTime: '09:00'
}
```

**Output Database:**
```json
{
  "completion_type": "startTime",
  "completion_start_time": "09:00"
}
```

**Comportamento:** Completamento possibile da 09:00 in poi

---

### 6. completionType: 'startTime' (senza completionStartTime)
**Input Form:**
```typescript
timeManagement: {
  completionType: 'startTime'
  // completionStartTime mancante
}
```

**Output Database:**
```json
null
```

**Comportamento:** Non salvato (completionStartTime obbligatorio per completionType 'startTime')

---

### 7. completionType: 'endTime'
**Input Form:**
```typescript
timeManagement: {
  completionType: 'endTime',
  completionEndTime: '18:00'
}
```

**Output Database:**
```json
{
  "completion_type": "endTime",
  "completion_end_time": "18:00"
}
```

**Comportamento:** Completamento possibile entro le 18:00

---

### 8. completionType: 'endTime' (senza completionEndTime)
**Input Form:**
```typescript
timeManagement: {
  completionType: 'endTime'
  // completionEndTime mancante
}
```

**Output Database:**
```json
null
```

**Comportamento:** Non salvato (completionEndTime obbligatorio per completionType 'endTime')

---

### 9. timeRange solo (senza completionType)
**Input Form:**
```typescript
timeManagement: {
  timeRange: {
    startTime: '08:00',
    endTime: '20:00',
    isOvernight: false
  }
  // completionType mancante
}
```

**Output Database:**
```json
{
  "time_range": {
    "start_time": "08:00",
    "end_time": "20:00",
    "is_overnight": false
  }
}
```

**Comportamento:** 
- Visibilità evento: solo durante time_range
- Completamento: usa orario azienda (default)

---

### 10. Orario notturno (isOvernight: true)
**Input Form:**
```typescript
timeManagement: {
  timeRange: {
    startTime: '22:00',
    endTime: '06:00',
    isOvernight: true
  },
  completionType: 'timeRange'
}
```

**Output Database:**
```json
{
  "time_range": {
    "start_time": "22:00",
    "end_time": "06:00",
    "is_overnight": true
  },
  "completion_type": "timeRange"
}
```

**Comportamento:** 
- Visibilità: da 22:00 a mezzanotte + da mezzanotte a 06:00
- Completamento: stesso orario

---

### 11. Combinazione completa (timeRange + startTime)
**Input Form:**
```typescript
timeManagement: {
  timeRange: {
    startTime: '08:00',
    endTime: '20:00',
    isOvernight: false
  },
  completionType: 'startTime',
  completionStartTime: '10:00'
}
```

**Output Database:**
```json
{
  "time_range": {
    "start_time": "08:00",
    "end_time": "20:00",
    "is_overnight": false
  },
  "completion_type": "startTime",
  "completion_start_time": "10:00"
}
```

**Comportamento:** 
- Visibilità evento: 08:00-20:00
- Completamento: da 10:00 in poi

---

## Checklist Test Manuali

- [ ] Test 1: Nessuna configurazione → usa orario azienda
- [ ] Test 2: completionType 'none' → usa orario azienda
- [ ] Test 3: completionType 'timeRange' con timeRange → funziona
- [ ] Test 4: completionType 'timeRange' senza timeRange → non salva
- [ ] Test 5: completionType 'startTime' con orario → funziona
- [ ] Test 6: completionType 'startTime' senza orario → non salva
- [ ] Test 7: completionType 'endTime' con orario → funziona
- [ ] Test 8: completionType 'endTime' senza orario → non salva
- [ ] Test 9: timeRange solo → visibilità funziona, completamento usa azienda
- [ ] Test 10: Orario notturno → funziona correttamente
- [ ] Test 11: Combinazione completa → entrambe le funzionalità funzionano

## Verifica Database

Per verificare che i dati siano salvati correttamente:

```sql
SELECT 
  id,
  name,
  time_management
FROM tasks
WHERE time_management IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

## Note Implementative

1. **Validazione:** Il codice valida che i campi obbligatori siano presenti prima di salvare
2. **Pulizia:** I campi undefined non vengono salvati nel JSONB
3. **Compatibilità:** Se time_management è null, usa orario azienda (default)
4. **Type Safety:** L'interfaccia GenericTask include time_management con type completo

