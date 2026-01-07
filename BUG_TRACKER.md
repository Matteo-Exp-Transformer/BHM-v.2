# BHM v.2 - Bug e Issue Tracker

> File unico per tracciare bug, TODO e issue. Aggiornare questo file invece di creare nuovi documenti.

## Legenda Severity
- **CRITICAL**: Blocca utenti, perdita dati, sicurezza
- **HIGH**: Funzionalità core non funzionante
- **MEDIUM**: Bug visibile ma workaround esiste
- **LOW**: Miglioramento, tech debt, cleanup

## Bug Aperti

| ID | Severity | Area | Descrizione | File:Riga | Data |
|----|----------|------|-------------|-----------|------|
| BUG-004 | MEDIUM | types | Type mismatches tra custom types e database.types.ts generati | Multiple files | 2026-01-07 |

## TODO da Codice (35 totali)

### Area: Auth (3 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| features/auth/api/authClient.ts | 314 | Implementare Remember Me service |
| services/auth/inviteService.ts | 322 | Rollback - eliminare utente auth se creazione fallisce |
| services/auth/inviteService.ts | 507 | Query corretta quando RLS attivo |

### Area: Conservation (12 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| hooks/useConservation.ts | 153 | Status and method filters disabled - fields dont exist in DB |
| hooks/useConservation.ts | 172 | recorded_by filter disabled - field doesnt exist in DB |
| hooks/useConservation.ts | 278 | Compute compliance based on conservation point setpoint_temp |
| hooks/useConservation.ts | 290 | Add computed temperature alerts |
| features/conservation/ConservationPage.tsx | 159 | Get completed_by from auth |
| features/conservation/components/AddTemperatureModal.tsx | 138 | Add method field when DB schema updated |
| features/conservation/components/TemperatureReadingCard.tsx | 241 | Add method indicator when DB schema updated |
| features/conservation/TemperatureReadingModal.tsx | 15 | Method tracking when DB schema updated |
| features/conservation/TemperatureReadingModal.tsx | 31 | Add fields when DB schema updated |
| features/conservation/TemperatureReadingModal.tsx | 50 | Add method/notes fields when DB schema updated |
| features/conservation/hooks/useTemperatureReadings.ts | 175 | Add method and validation status tracking |
| features/conservation/OfflineConservationDemo.tsx | 95 | Add fields when DB schema updated |

### Area: Types (4 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| types/conservation.ts | 466 | Remove status and method filters (fields dont exist) |
| types/conservation.ts | 467 | Add computed status based on setpoint_temp |
| types/conservation.ts | 494 | Add computed compliance_rate |
| types/conservation.ts | 545 | Add computed status |

### Area: Inventory (3 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| features/inventory/hooks/useExpiredProducts.ts | 167 | Implement trend calculation |
| features/inventory/hooks/useExpiredProducts.ts | 168 | Implement monthly cost tracking |
| features/inventory/components/AddProductModal.tsx | 306 | Add departments from useDepartments hook |

### Area: Management (3 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| features/management/components/StaffManagement.tsx | 52 | Implement updateStaff function |
| features/management/components/StaffManagement.tsx | 56 | Implement createStaff function |
| features/management/components/StaffManagement.tsx | 63 | Implement deleteStaff function |

### Area: Calendar (1 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| features/calendar/EventDetailsModal.tsx | 422 | Implement editing mode |

### Area: Export (2 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| services/export/HACCPReportGenerator.ts | 242 | Implement corrective actions tracking |
| services/export/HACCPReportGenerator.ts | 243 | Implement staff training tracking |

### Area: Integration (1 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| services/integration/AdvancedAnalyticsIntegration.ts | 6 | Modules dont exist yet - commented out |

### Area: Utils (6 DEBUG - da rimuovere)
| File | Riga | Descrizione |
|------|------|-------------|
| utils/onboardingHelpers.ts | 1955 | DEBUG: Verifica calendario |
| utils/onboardingHelpers.ts | 2007 | DEBUG: Verifica stato auth |
| utils/onboardingHelpers.ts | 2010 | DEBUG console log |
| utils/onboardingHelpers.ts | 2043 | DEBUG end marker |
| utils/onboardingHelpers.ts | 2070 | DEBUG localStorage check |

## Tech Debt da Risolvere

### TYPE-001: Migrazione a database.types.ts (MEDIUM)
**Descrizione**: Dopo generazione types da Supabase, ci sono ~50 incompatibilità tra custom types e types generati.

**Aree coinvolte**:
- `useStaff.ts`: role field (string vs union type)
- `useProducts.ts`: company_id nullability, allergen types
- `useCategories.ts`: allergen_info missing
- `useShoppingLists.ts`: shopping_list_id field mismatch
- `CompanyConfiguration.tsx`: Company type mismatch
- `HACCPSettings.tsx`: HACCPConfig structure mismatch
- `NotificationPreferences.tsx`: notification_preferences table missing in generated types

**Soluzione**:
1. Allineare custom types in `src/types/*.ts` con `database.types.ts`
2. Aggiungere helper types per compatibilità transitoria
3. Migrare gradualmente ogni hook per usare types generati
4. Considerare aggiunta tabella `notification_preferences` al DB

**Priorità**: MEDIUM - L'app funziona, ma type-safety non è completa

---

## Bug Risolti
| ID | Descrizione | Risolto da | Data |
|----|-------------|------------|------|
| BUG-001 | window.location.reload() invece di invalidazione query | Refactoring v2 | 2026-01-07 |
| BUG-002 | Type any nel client Supabase bypassa type-safety | Refactoring v2 | 2026-01-07 |
| BUG-003 | Import diretto invece di lazy per CalendarPage | Refactoring v2 | 2026-01-07 |




