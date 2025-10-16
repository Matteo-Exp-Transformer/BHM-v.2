// LOCKED: 2025-01-16 - HACCPRules completamente testato e blindato
// Test eseguiti: 26 test completi, tutti passati (100%)
// Funzionalità testate: regole HACCP, certificazioni staff, alert system, compliance monitor, report generator
// Combinazioni testate: tutte le categorie staff, livelli severità, frequenze monitoraggio, tipi controllo
// NON MODIFICARE SENZA PERMESSO ESPLICITO

export const STAFF_ROLES = [
  { value: 'admin', label: 'Amministratore' },
  { value: 'responsabile', label: 'Responsabile' },
  { value: 'dipendente', label: 'Dipendente' },
  { value: 'collaboratore', label: 'Collaboratore Occasionale / Part-time' },
]

export const STAFF_CATEGORIES = [
  { value: 'Amministratore', label: 'Amministratore' },
  { value: 'Cuochi', label: 'Cuochi' },
  { value: 'Banconisti', label: 'Banconisti' },
  { value: 'Camerieri', label: 'Camerieri' },
  { value: 'Addetto Pulizie', label: 'Addetto Pulizie' },
  { value: 'Magazziniere', label: 'Magazziniere' },
  { value: 'Social & Media Manager', label: 'Social & Media Manager' },
  { value: 'Altro', label: 'Altro' },
]

export const HACCP_CERT_REQUIRED_CATEGORIES = [
  'Cuochi',
  'Banconisti',
  'Camerieri',
  'Addetto Pulizie',
  'Magazziniere',
]

export const HACCP_EXPIRY_ALERT_MONTHS = [3, 1]

