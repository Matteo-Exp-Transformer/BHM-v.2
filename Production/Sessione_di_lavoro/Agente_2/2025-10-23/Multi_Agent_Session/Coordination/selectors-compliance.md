# 🗺️ MAPPATURA SELETTORI ONBOARDING - COMPLIANCE

**Data**: 2025-10-23  
**Agente**: Agente 2A - Systems Blueprint Architect  
**Scopo**: Mappatura corretta selettori per test Onboarding  

---

## 🔐 **BUSINESSINFOSTEP - SELETTORI CORRETTI**

### **📝 CAMPI INPUT**
```javascript
// Nome Azienda
'input[placeholder="Inserisci il nome della tua azienda"]'

// Indirizzo (textarea)
'textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]'

// Telefono
'input[placeholder="+39 051 1234567"]'

// Email
'input[placeholder="info@azienda.it"]'

// Partita IVA
'input[placeholder="IT12345678901"]'

// Numero Licenza
'input[placeholder="RIS-2024-001"]'
```

### **📋 SELECT E OPTION**
```javascript
// Tipo di Attività
'select[value=""]' // Select principale
'option[value="ristorante"]' // Opzione ristorante
'option[value="bar"]' // Opzione bar
'option[value="pizzeria"]' // Opzione pizzeria
```

### **📅 DATE INPUT**
```javascript
// Data di Apertura
'input[type="date"]'
```

### **🔘 BUTTONS**
```javascript
// Pulsante Prefill
'button:has-text("Precompila")'

// Pulsante Avanti
'button:has-text("Avanti")'

// Pulsante Indietro
'button:has-text("Indietro")'
```

---

## 🏢 **DEPARTMENTSSTEP - SELETTORI CORRETTI**

### **📝 CAMPI INPUT**
```javascript
// Nome Reparto (form aggiunta)
'input[placeholder="es. Cucina, Sala, Bancone..."]'

// Descrizione Reparto (form aggiunta)
'input[placeholder="Descrizione del reparto..."]'

// Nome Reparto (form modifica)
'input[value="Nome Reparto Esistente"]'

// Descrizione Reparto (form modifica)
'input[value="Descrizione Reparto Esistente"]'
```

### **🔘 BUTTONS**
```javascript
// Aggiungi Reparto
'button:has-text("Aggiungi Reparto")'

// Modifica Reparto
'button:has-text("Modifica")'

// Elimina Reparto
'button:has-text("Elimina")'

// Salva Modifiche
'button:has-text("Salva")'

// Annulla Modifiche
'button:has-text("Annulla")'
```

### **🏷️ STATUS BADGES**
```javascript
// Status Attivo (badge specifico)
'span:has-text("Attivo"):has([class*="bg-green"])'

// Status Inattivo (badge specifico)
'span:has-text("Inattivo"):has([class*="bg-gray"])'

// Nome Reparto (heading specifico)
'h4:has-text("Nome Reparto")'

// Descrizione Reparto (paragrafo specifico)
'p:has-text("Descrizione Reparto")'
```

---

## 👥 **STAFFSTEP - SELETTORI CORRETTI**

### **📝 CAMPI INPUT**
```javascript
// Nome
'input[id="staff-name"]'

// Cognome
'input[id="staff-surname"]'

// Email
'input[id="staff-email"]'

// Telefono
'input[id="staff-phone"]'

// Ruolo
'select[id="staff-role"]'

// Reparto
'select[id="staff-department"]'

// Scadenza HACCP
'input[id="staff-haccp-expiry"]'

// Note
'textarea[id="staff-notes"]'
```

### **🔘 BUTTONS**
```javascript
// Aggiungi Membro
'button:has-text("Aggiungi Membro")'

// Modifica Membro
'button:has-text("Modifica")'

// Elimina Membro
'button:has-text("Elimina")'
```

---

## 🌡️ **CONSERVATIONSTEP - SELETTORI CORRETTI**

### **📝 CAMPI INPUT**
```javascript
// Nome Punto
'input[id="point-name"]'

// Temperatura Target
'input[id="point-temperature"]'

// Tipo Punto
'select[id="point-type"]'
```

### **🔘 BUTTONS**
```javascript
// Aggiungi Punto
'button:has-text("Aggiungi Punto")'

// Modifica Punto
'button:has-text("Modifica")'

// Elimina Punto
'button:has-text("Elimina")'
```

---

## 🎯 **TASKSTEP - SELETTORI CORRETTI**

### **📝 CAMPI INPUT**
```javascript
// Nome Attività
'input[placeholder="Nome dell\'attività"]'

// Descrizione
'textarea[placeholder="Descrizione dell\'attività"]'

// Frequenza
'select[id="task-frequency"]'

// Assegnato a
'select[id="task-assigned-to"]'
```

### **🔘 BUTTONS**
```javascript
// Aggiungi Attività
'button:has-text("Aggiungi Attività")'

// Modifica Attività
'button:has-text("Modifica")'

// Elimina Attività
'button:has-text("Elimina")'
```

---

## 📦 **INVENTORYSTEP - SELETTORI CORRETTI**

### **📝 CAMPI INPUT**
```javascript
// Nome Categoria
'input[placeholder="Nome categoria"]'

// Descrizione Categoria
'textarea[placeholder="Descrizione categoria"]'

// Nome Prodotto
'input[placeholder="Nome prodotto"]'

// Scadenza
'input[type="date"]'
```

### **🔘 BUTTONS**
```javascript
// Aggiungi Categoria
'button:has-text("Aggiungi Categoria")'

// Aggiungi Prodotto
'button:has-text("Aggiungi Prodotto")'
```

---

## 📅 **CALENDARCONFIGSTEP - SELETTORI CORRETTI**

### **📝 CAMPI INPUT**
```javascript
// Giorni Lavorativi
'input[type="checkbox"][name="work-days"]'

// Orario Apertura
'input[type="time"]'

// Orario Chiusura
'input[type="time"]'
```

### **🔘 BUTTONS**
```javascript
// Salva Configurazione
'button:has-text("Salva Configurazione")'
```

---

## 🎯 **NAVIGAZIONE ONBOARDING**

### **🔘 BUTTONS NAVIGAZIONE**
```javascript
// Pulsante Onboarding (Header)
'button:has-text("Onboarding")'

// Avanti Step
'button:has-text("Avanti")'

// Indietro Step
'button:has-text("Indietro")'

// Completa Onboarding
'button:has-text("Completa")'
```

### **📊 INDICATORI STEP**
```javascript
// Titolo Step
'h2:has-text("Informazioni Aziendali")'
'h2:has-text("Reparti")'
'h2:has-text("Staff")'
'h2:has-text("Conservazione")'
'h2:has-text("Attività")'
'h2:has-text("Inventario")'
'h2:has-text("Configurazione Calendario")'
```

---

## ✅ **COMPLIANCE STATUS**

### **✅ MAPPATI CORRETTAMENTE**
- [x] BusinessInfoStep - Tutti i selettori mappati
- [x] DepartmentsStep - Tutti i selettori mappati
- [x] StaffStep - Tutti i selettori mappati
- [x] ConservationStep - Tutti i selettori mappati
- [x] TasksStep - Tutti i selettori mappati
- [x] InventoryStep - Tutti i selettori mappati
- [x] CalendarConfigStep - Tutti i selettori mappati

### **📊 STATISTICHE**
- **Componenti Mappati**: 7/7 (100%)
- **Selettori Identificati**: 45+
- **Tipi Selettori**: input, textarea, select, button, checkbox
- **Compliance**: ✅ **COMPLETA**

---

**Status**: ✅ **MAPPATURA COMPLETATA**  
**Prossimo**: Aggiornamento test con selettori corretti  
**Firma**: Agente 2A - Systems Blueprint Architect
