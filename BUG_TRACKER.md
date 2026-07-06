# BHM v.2 - Bug e Issue Tracker

> File unico per tracciare bug, TODO e issue. Aggiornato da consolidatore A8 Fase 3 (2026-07-05) da report `FASE3_REPORT_A0`…`A7` + MCP DB live.

## Legenda Severity
- **CRITICAL**: Blocca utenti, perdita dati, sicurezza
- **HIGH**: Funzionalità core non funzionante
- **MEDIUM**: Bug visibile ma workaround esiste
- **LOW**: Miglioramento, tech debt, cleanup

## Bug Aperti

| ID | Severity | Area | Descrizione | File:Riga | Data |
|----|----------|------|-------------|-----------|------|
| BUG-004 | MEDIUM | types | Type mismatches custom vs `database.types.ts`: **163 errori TS** (`npm run type-check` 2026-07-05), non ~50. 58 solo in `src/services/`. Cast unsafe (`as Company`, `as HACCPConfig`) in Settings. | Multiple files | 2026-01-07 / agg. 2026-07-05 |
| BUG-005 | **CRITICAL** | conservation | Salvataggio lettura temperatura fallisce: colonne `method`, `notes`, `photo_evidence`, `recorded_by` **assenti su DB live** (`PGRST204`). Migration 015 non applicata; non in `apply-missing-schema-migrations.sql`. **Confermato MCP live 2026-07-05** (A0 §S3, A2). | `useTemperatureReadings.ts:151-164` | 2026-07-05 |
| BUG-006 | HIGH | conservation | Modal temperatura non si chiude dopo salvataggio / Annulla / X. **FASE 3 (A2)**: wiring UI OK; `onSuccess` non chiamato se mutation fallisce (BUG-005). **Rivalutare post-fix 015**. | `ConservationPage.tsx:220-258`, `AddTemperatureModal.tsx` | 2026-02-04 / agg. 2026-07-05 |
| BUG-007 | HIGH | dashboard | Route `/dashboard` monta `HomePage` invece di `DashboardPage`; KPI/grafici/trend non raggiungibili. `DashboardPage` orphan (zero import in `App.tsx`). | `App.tsx:134-138` | 2026-07-05 |
| BUG-008 | **CRITICAL** | shopping | **4 RPC assenti su DB live**: `create_shopping_list_with_items`, `get_shopping_lists_with_stats`, `toggle_shopping_list_item`, `complete_shopping_list`. Tabelle presenti; flusso app bloccato. MCP `pg_proc` → 0 righe. | `shoppingListService.ts:31-274` | 2026-07-05 |
| BUG-009 | HIGH | inventory | `AddProductModal` reparto: select con stringhe `"cucina"`, `"bancone"` invece UUID `departments`. Viola FK `products_department_id_fkey`. | `AddProductModal.tsx:300-305` | 2026-07-05 |
| BUG-010 | HIGH | inventory | Reinserimento prodotti scaduti usa colonne/stato assenti live: `previous_product_id`, `reinsertion_count`, `archived_at`, status `archived` (CHECK esclude). | `useExpiredProducts.ts:203-232` | 2026-07-05 |
| BUG-011 | HIGH | settings | `CompanyConfiguration` invia colonne inesistenti su `companies` (`phone`, `vat_number`, `business_type`, `license_number`, …). Stesso drift in onboarding. | `CompanyConfiguration.tsx:57-61` | 2026-07-05 |
| BUG-012 | HIGH | settings | `HACCPSettings` payload flat incompatibile con schema `haccp_configurations` (`configuration_name`, `configuration_type`, `settings` Json). | `HACCPSettings.tsx:105-123` | 2026-07-05 |
| BUG-013 | HIGH | settings | `NotificationPreferences` query tabella `notification_preferences` **assente** su DB live e in `database.types.ts`. | `NotificationPreferences.tsx:101-139` | 2026-07-05 |
| BUG-014 | HIGH | settings | `UserManagement` aggiorna `user_profiles.role` ma permessi runtime da `company_members`; RLS consente UPDATE solo proprio profilo. | `UserManagement.tsx:109-112` | 2026-07-05 |
| BUG-015 | HIGH | management | `StaffManagement` create/update/delete = `console.log` + TODO; hook `useStaff` ha mutazioni ma non collegate. DB/RLS **pronti** (A6 MCP). | `StaffManagement.tsx:50-64` | 2026-07-05 |
| BUG-016 | HIGH | navigation | Pulsanti header "Cancella e Ricomincia" e "Riapri Onboarding" visibili **fuori DEV**; PRE_PRODUCTION_CLEANUP li marca da rimuovere. | `HeaderButtons.tsx:55-124` | 2026-07-05 |
| BUG-017 | MEDIUM | auth | Remember Me: checkbox attiva ma `authClient.login` non invoca `rememberMeService` (implementazione solo in `useAuth.signIn`). | `LoginForm.tsx:124-129`, `authClient.ts:320-323` | 2026-07-05 |
| BUG-018 | MEDIUM | auth | CSRF login cosmetico: token fetch in UI ma `login()` non valida server-side; tabella `csrf_tokens` live vuota. | `authClient.ts:283-295`, `authClient.ts:439-453` | 2026-07-05 |
| BUG-019 | MEDIUM | auth | Route `/sign-up` pubblica ancora attiva (design: solo invito). | `App.tsx:117` | 2026-07-05 |
| BUG-020 | MEDIUM | onboarding | Campo numero licenza in `BusinessInfoStep` ma colonna `license_number` **assente** su `companies` live. | `BusinessInfoStep.tsx:274-283` | 2026-07-05 |
| BUG-021 | MEDIUM | inventory | Filtri ricerca/categoria/scaduti in Inventario: UI passa params ma `useProducts` query carica tutto senza filtri. | `useProducts.ts:79-96` | 2026-07-05 |
| BUG-022 | MEDIUM | inventory | `markAsExpired` scrive colonna `expired_at` assente su DB live. | `useExpiryTracking.ts:195-200` | 2026-07-05 |
| BUG-023 | MEDIUM | inventory | Doppio stack shopping: legacy `inventory/hooks/useShoppingLists` vs RPC `shopping/hooks/useShoppingList`. | `useDashboardData.ts:9` | 2026-07-05 |
| BUG-024 | MEDIUM | types | `database.types.ts` Functions: 1 RPC (`cleanup_expired_csrf_tokens`) vs 10+ usate (`log_user_activity`, shopping RPC, `is_admin`, …). | `database.types.ts:1963-1965` | 2026-07-05 |
| BUG-025 | MEDIUM | export | `HACCPReportGenerator` query schema obsoleto (`license_number`, `temperature_min/max`, `tasks.title`); sezioni correctiveActions/staffTraining stub vuote. | `HACCPReportGenerator.ts:167-237` | 2026-07-05 |
| BUG-026 | MEDIUM | dashboard | Quick Actions Home/Dashboard senza handler navigazione. | `HomePage.tsx:151-187`, `DashboardPage.tsx:214-231` | 2026-07-05 |
| BUG-027 | LOW | auth | Doppio schema password login: client solo alfanumerico vs API ASCII stampabile. | `features/auth/schemas/authSchemas.ts:25-32` vs `api/schemas/authSchemas.ts:24-28` | 2026-07-05 |
| BUG-028 | LOW | auth | Link recupero password assente da login nonostante route `/forgot-password`. | `LoginPage.tsx`, `LoginForm.tsx` | 2026-07-05 |
| BUG-029 | LOW | conservation | Test `z-[9999]` vs codice `z-50` in `AddTemperatureModal`. | `AddTemperatureModal.tsx:163` | 2026-07-05 |
| BUG-030 | LOW | dashboard | `TaskSummary` usa ripartizioni fabbricate 60/30/10; `turnover_rate` hardcoded 85. | `DashboardPage.tsx:305-327`, `useDashboardData.ts:198` | 2026-07-05 |
| BUG-031 | LOW | calendar | Doc weekend contraddittoria: `00_MASTER_INDEX` "parzialmente risolto" vs report 15-02 "RISOLTO". Codice OK. | `04_CALENDAR/00_MASTER_INDEX.md:97` | 2026-07-05 |
| BUG-032 | MEDIUM | navigation | Route `/liste-spesa` protetta ma assente da bottom navigation. | `App.tsx:166-179` vs `MainLayout.tsx:42-81` | 2026-07-05 |
| BUG-DB-002 | MEDIUM | DB/types | `database.types.ts` obsoleto vs schema live: mancano colonne già presenti (profili conservation, `open_weekdays`, `recurrence_config`, …). | `database.types.ts` vs MCP live | 2026-07-05 |
| BUG-DB-003 | MEDIUM | DB | Doppio canale migration (`database/migrations/` 25 file vs `supabase/migrations/` 11); `list_migrations` = `[]` — nessuna history CLI. | `database/migrations/`, `supabase/migrations/` | 2026-07-05 |

## TODO da Codice (35 totali)

### Area: Auth (3 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| features/auth/api/authClient.ts | 314 | ~~Implementare Remember Me service~~ → servizio esiste; manca wiring in `authClient.login` (**BUG-017**) |
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
| features/conservation/components/AddTemperatureModal.tsx | 138 | ~~Add method field when DB schema updated~~ → **campo implementato**; attende Migration 015 |
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
| features/inventory/components/AddProductModal.tsx | 306 | Add departments from useDepartments hook → **BUG-009** |

### Area: Management (3 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| features/management/components/StaffManagement.tsx | 52 | Implement updateStaff function → **BUG-015** |
| features/management/components/StaffManagement.tsx | 56 | Implement createStaff function → **BUG-015** |
| features/management/components/StaffManagement.tsx | 63 | Implement deleteStaff function → **BUG-015** |

### Area: Calendar (1 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| features/calendar/EventDetailsModal.tsx | 422 | Implement editing mode |

### Area: Export (2 TODO)
| File | Riga | Descrizione |
|------|------|-------------|
| services/export/HACCPReportGenerator.ts | 242 | Implement corrective actions tracking → **BUG-025** |
| services/export/HACCPReportGenerator.ts | 243 | Implement staff training tracking → **BUG-025** |

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
**Descrizione**: Dopo generazione types da Supabase, **163 incompatibilità** TS (A7 FASE 3). `helpers.ts` espone pattern `Db*` corretto ma non adottato massivamente.

**Aree coinvolte** (confermate FASE 3):
- `useStaff.ts`: role field (string vs union type)
- `useProducts.ts`: company_id nullability, allergen types
- `useCategories.ts`: allergen_info missing
- `useShoppingLists.ts`: shopping_list_id field mismatch
- `CompanyConfiguration.tsx`: Company type mismatch (**BUG-011**)
- `HACCPSettings.tsx`: HACCPConfig structure mismatch (**BUG-012**)
- `NotificationPreferences.tsx`: notification_preferences table missing (**BUG-013**)
- `HACCPReportGenerator.ts`, `EmailScheduler.ts`, `shoppingListService.ts`, `activityTrackingService.ts`: RPC/schema drift

**Soluzione**:
1. Apply migration mancanti (015, RPC shopping, settings schema) — vedi `META/FASE3_MIGRATION_GAPS.md`
2. Rigenerare `database.types.ts` da schema live
3. Allineare custom types in `src/types/*.ts` con tipi generati
4. Adottare pattern `helpers.ts` (`DbStaff`, computed helpers)
5. Rimuovere interfacce DEPRECATED duplicate in `client.ts`

**Priorità**: MEDIUM — app funziona parzialmente; type-safety e insert Settings/Conservation non protetti

---

## Bug Risolti / Revocati (FASE 3)

| ID | Descrizione | Esito FASE 3 | Data |
|----|-------------|--------------|------|
| BUG-001 | window.location.reload() invece di invalidazione query | Refactoring v2 | 2026-01-07 |
| BUG-002 | Type any nel client Supabase bypassa type-safety | Refactoring v2 | 2026-01-07 |
| BUG-003 | Import diretto invece di lazy per CalendarPage | Refactoring v2 | 2026-01-07 |
| BUG-DB-001 | `expiry_check` assente in CHECK `maintenance_tasks` | **Revocato** — CHECK live include `expiry_check` (A0 §S4, A2) | 2026-07-05 |
| BUG-DB-004 | Trigger `20260201120000` non deployato | **Revocato** — `trigger_update_task_on_completion` presente su `maintenance_completions` (A2 correzione A0) | 2026-07-05 |

---

## Riferimenti FASE 3

| Documento | Path |
|-----------|------|
| Catalogo FASE 3 | `Production/Conoscenze_congelate/META/CATALOGO_DOCUMENTALE_BHM_v2_FASE1.md` §FASE 3 |
| Inventario migration | `Production/Conoscenze_congelate/META/FASE3_MIGRATION_GAPS.md` |
| Report agenti | `Production/Conoscenze_congelate/META/FASE3_REPORT_A0`…`A7` |


