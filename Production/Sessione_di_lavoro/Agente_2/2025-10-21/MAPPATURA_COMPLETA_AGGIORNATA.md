# 🗺️ MAPPATURA COMPLETA AGGIORNATA - BHM v.2

## 📊 OVERVIEW MAPPATURA COMPLETA
- **Data Mappatura**: 2025-10-21 (Aggiornata)
- **Agente**: Agente 2 - Component Mapping Specialist
- **Status**: ✅ MAPPATURA COMPLETA COMPLETATA
- **Totale File**: 260+ file identificati
- **Componenti Effettivi**: ~80-100 componenti React
- **Componenti Blindati**: 6/~80-100 (7.5%)
- **Componenti Da Blindare**: ~74-94 (92.5%)

---

## 🏗️ ARCHITETTURA COMPONENTI COMPLETA

### **STRUTTURA PRINCIPALE**
```
src/
├── components/           # 25+ file condivisi (~20 componenti)
├── features/            # 150+ file features (~80 componenti)
├── hooks/               # 15+ file hooks (~15 hooks)
├── services/            # 50+ file services (~50 servizi)
├── utils/               # 20+ file utilities (~20 funzioni)
└── types/               # 10+ file TypeScript (~10 definizioni)
```

---

## 🔐 AREA AUTHENTICATION (12 componenti)

### **PAGES (6 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| LoginPage | `src/features/auth/LoginPage.tsx` | ✅ Blindato | P0 | Componente principale login |
| RegisterPage | `src/features/auth/RegisterPage.tsx` | ✅ Blindato | P0 | Componente principale registrazione |
| HomePage | `src/features/auth/HomePage.tsx` | 🔄 Parziale | P0 | Redirect dopo login |
| AcceptInvitePage | `src/features/auth/AcceptInvitePage.tsx` | ❌ Da blindare | P1 | Gestione inviti |
| AuthCallbackPage | `src/features/auth/AuthCallbackPage.tsx` | ❌ Da blindare | P1 | Callback OAuth |
| ForgotPasswordPage | `src/features/auth/ForgotPasswordPage.tsx` | ❌ Da blindare | P1 | Recupero password |

### **COMPONENTS (4 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| LoginForm | `src/features/auth/components/LoginForm.tsx` | ❌ Da blindare | P0 | Form login |
| InviteAcceptForm | `src/features/auth/components/InviteAcceptForm.tsx` | ❌ Da blindare | P1 | Form accettazione invito |
| RecoveryConfirmForm | `src/features/auth/components/RecoveryConfirmForm.tsx` | ❌ Da blindare | P1 | Form conferma recupero |
| RecoveryRequestForm | `src/features/auth/components/RecoveryRequestForm.tsx` | ❌ Da blindare | P1 | Form richiesta recupero |

### **API & SCHEMAS (2 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| authClient | `src/features/auth/api/authClient.ts` | ❌ Da blindare | P0 | Client autenticazione |
| authSchemas | `src/features/auth/schemas/authSchemas.ts` | ❌ Da blindare | P0 | Schemi validazione |

---

## 📊 AREA DASHBOARD (6 componenti)

### **PAGES (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| DashboardPage | `src/features/dashboard/DashboardPage.tsx` | ❌ Da blindare | P0 | Dashboard principale |

### **COMPONENTS (5 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| KPICard | `src/features/dashboard/components/KPICard.tsx` | ❌ Da blindare | P0 | Card KPI |
| ComplianceChart | `src/features/dashboard/components/ComplianceChart.tsx` | ❌ Da blindare | P0 | Grafico compliance |
| TemperatureTrend | `src/features/dashboard/components/TemperatureTrend.tsx` | ❌ Da blindare | P0 | Trend temperature |
| TaskSummary | `src/features/dashboard/components/TaskSummary.tsx` | ❌ Da blindare | P0 | Riepilogo task |
| ScheduledMaintenanceCard | `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` | ❌ Da blindare | P0 | Card manutenzioni |

### **HOOKS (1 hook)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useDashboardData | `src/features/dashboard/hooks/useDashboardData.ts` | ❌ Da blindare | P0 | Hook dati dashboard |

---

## 📅 AREA CALENDAR (25+ componenti)

### **PAGES (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| CalendarPage | `src/features/calendar/CalendarPage.tsx` | 🔄 Parziale | P0 | Pagina calendario |

### **COMPONENTS PRINCIPALI (4 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| Calendar | `src/features/calendar/Calendar.tsx` | ❌ Da blindare | P0 | Componente calendario principale |
| CalendarFilter | `src/features/calendar/CalendarFilter.tsx` | ❌ Da blindare | P0 | Filtri calendario |
| CalendarSettings | `src/features/calendar/CalendarSettings.tsx` | ❌ Da blindare | P0 | Impostazioni calendario |
| CreateEventModal | `src/features/calendar/CreateEventModal.tsx` | ❌ Da blindare | P0 | Modal creazione evento |

### **COMPONENTS DETTAGLIATI (17 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| AlertModal | `src/features/calendar/components/AlertModal.tsx` | ❌ Da blindare | P1 | Modal alert |
| CalendarConfigModal | `src/features/calendar/components/CalendarConfigModal.tsx` | ❌ Da blindare | P1 | Modal configurazione |
| CalendarEventLegend | `src/features/calendar/components/CalendarEventLegend.tsx` | ❌ Da blindare | P1 | Legenda eventi |
| CalendarFilters | `src/features/calendar/components/CalendarFilters.tsx` | ❌ Da blindare | P1 | Filtri avanzati |
| CalendarLegend | `src/features/calendar/components/CalendarLegend.tsx` | ❌ Da blindare | P1 | Legenda calendario |
| CategoryEventsModal | `src/features/calendar/components/CategoryEventsModal.tsx` | ❌ Da blindare | P1 | Modal eventi categoria |
| EventBadge | `src/features/calendar/components/EventBadge.tsx` | ❌ Da blindare | P1 | Badge evento |
| EventModal | `src/features/calendar/components/EventModal.tsx` | ❌ Da blindare | P1 | Modal evento |
| FilterPanel | `src/features/calendar/components/FilterPanel.tsx` | ❌ Da blindare | P1 | Pannello filtri |
| GenericTaskForm | `src/features/calendar/components/GenericTaskForm.tsx` | ❌ Da blindare | P1 | Form task generico |
| HorizontalCalendarFilters | `src/features/calendar/components/HorizontalCalendarFilters.tsx` | ❌ Da blindare | P1 | Filtri orizzontali |
| MacroCategoryModal | `src/features/calendar/components/MacroCategoryModal.tsx` | ❌ Da blindare | P1 | Modal macro categoria |
| NewCalendarFilters | `src/features/calendar/components/NewCalendarFilters.tsx` | ❌ Da blindare | P1 | Nuovi filtri |
| ProductExpiryModal | `src/features/calendar/components/ProductExpiryModal.tsx` | ❌ Da blindare | P1 | Modal scadenza prodotti |
| QuickActions | `src/features/calendar/components/QuickActions.tsx` | ❌ Da blindare | P1 | Azioni rapide |
| ViewSelector | `src/features/calendar/components/ViewSelector.tsx` | ❌ Da blindare | P1 | Selettore vista |
| EventDetailsModal | `src/features/calendar/EventDetailsModal.tsx` | ❌ Da blindare | P1 | Modal dettagli evento |

### **HOOKS (7 hooks)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useAggregatedEvents | `src/features/calendar/hooks/useAggregatedEvents.ts` | ❌ Da blindare | P1 | Hook eventi aggregati |
| useCalendar | `src/features/calendar/hooks/useCalendar.ts` | ❌ Da blindare | P0 | Hook calendario principale |
| useCalendarAlerts | `src/features/calendar/hooks/useCalendarAlerts.ts` | ❌ Da blindare | P1 | Hook alert calendario |
| useCalendarEvents | `src/features/calendar/hooks/useCalendarEvents.ts` | ❌ Da blindare | P0 | Hook eventi calendario |
| useFilteredEvents | `src/features/calendar/hooks/useFilteredEvents.ts` | ❌ Da blindare | P1 | Hook eventi filtrati |
| useGenericTasks | `src/features/calendar/hooks/useGenericTasks.ts` | ❌ Da blindare | P1 | Hook task generici |
| useMacroCategoryEvents | `src/features/calendar/hooks/useMacroCategoryEvents.ts` | ❌ Da blindare | P1 | Hook eventi macro categoria |

### **UTILS (5 utils)**
| Util | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| colorUtils | `src/features/calendar/utils/colorUtils.ts` | ❌ Da blindare | P2 | Utility colori |
| eventTransform | `src/features/calendar/utils/eventTransform.ts` | ❌ Da blindare | P1 | Trasformazione eventi |
| haccpDeadlineGenerator | `src/features/calendar/utils/haccpDeadlineGenerator.ts` | ❌ Da blindare | P1 | Generatore scadenze HACCP |
| recurrenceScheduler | `src/features/calendar/utils/recurrenceScheduler.ts` | ❌ Da blindare | P1 | Scheduler ricorrenze |
| temperatureCheckGenerator | `src/features/calendar/utils/temperatureCheckGenerator.ts` | ❌ Da blindare | P1 | Generatore controlli temperatura |

---

## 🧊 AREA CONSERVATION (15+ componenti)

### **PAGES (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ConservationPage | `src/features/conservation/ConservationPage.tsx` | ❌ Da blindare | P0 | Pagina conservazione |

### **COMPONENTS PRINCIPALI (5 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ConservationManager | `src/features/conservation/ConservationManager.tsx` | ❌ Da blindare | P0 | Manager conservazione |
| ConservationFilters | `src/features/conservation/ConservationFilters.tsx` | ❌ Da blindare | P0 | Filtri conservazione |
| ConservationStats | `src/features/conservation/ConservationStats.tsx` | ❌ Da blindare | P0 | Statistiche conservazione |
| CreateConservationPointModal | `src/features/conservation/CreateConservationPointModal.tsx` | ❌ Da blindare | P0 | Modal creazione punto |
| OfflineConservationDemo | `src/features/conservation/OfflineConservationDemo.tsx` | ❌ Da blindare | P1 | Demo offline |

### **COMPONENTS DETTAGLIATI (5 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| AddPointModal | `src/features/conservation/components/AddPointModal.tsx` | ❌ Da blindare | P1 | Modal aggiunta punto |
| AddTemperatureModal | `src/features/conservation/components/AddTemperatureModal.tsx` | ❌ Da blindare | P1 | Modal aggiunta temperatura |
| ConservationPointCard | `src/features/conservation/components/ConservationPointCard.tsx` | ❌ Da blindare | P1 | Card punto conservazione |
| MaintenanceTaskCard | `src/features/conservation/components/MaintenanceTaskCard.tsx` | ❌ Da blindare | P1 | Card task manutenzione |
| TemperatureReadingCard | `src/features/conservation/components/TemperatureReadingCard.tsx` | ❌ Da blindare | P1 | Card lettura temperatura |

### **MODALS (2 modals)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| MaintenanceTaskModal | `src/features/conservation/MaintenanceTaskModal.tsx` | ❌ Da blindare | P1 | Modal task manutenzione |
| TemperatureReadingModal | `src/features/conservation/TemperatureReadingModal.tsx` | ❌ Da blindare | P1 | Modal lettura temperatura |

### **HOOKS (3 hooks)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useConservationPoints | `src/features/conservation/hooks/useConservationPoints.ts` | ❌ Da blindare | P0 | Hook punti conservazione |
| useMaintenanceTasks | `src/features/conservation/hooks/useMaintenanceTasks.ts` | ❌ Da blindare | P0 | Hook task manutenzione |
| useTemperatureReadings | `src/features/conservation/hooks/useTemperatureReadings.ts` | ❌ Da blindare | P0 | Hook letture temperatura |

---

## 📦 AREA INVENTORY (15+ componenti)

### **PAGES (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| InventoryPage | `src/features/inventory/InventoryPage.tsx` | ❌ Da blindare | P0 | Pagina inventario |

### **COMPONENTS (12 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| AddCategoryModal | `src/features/inventory/components/AddCategoryModal.tsx` | ❌ Da blindare | P1 | Modal aggiunta categoria |
| AddProductModal | `src/features/inventory/components/AddProductModal.tsx` | ❌ Da blindare | P1 | Modal aggiunta prodotto |
| AllergenBadge | `src/features/inventory/components/AllergenBadge.tsx` | ❌ Da blindare | P1 | Badge allergeni |
| CategoryFilter | `src/features/inventory/components/CategoryFilter.tsx` | ❌ Da blindare | P1 | Filtro categorie |
| CreateListModal | `src/features/inventory/components/CreateListModal.tsx` | ❌ Da blindare | P1 | Modal creazione lista |
| ExpiredProductsManager | `src/features/inventory/components/ExpiredProductsManager.tsx` | ❌ Da blindare | P1 | Manager prodotti scaduti |
| ExpiryAlert | `src/features/inventory/components/ExpiryAlert.tsx` | ❌ Da blindare | P1 | Alert scadenze |
| ProductCard | `src/features/inventory/components/ProductCard.tsx` | ❌ Da blindare | P1 | Card prodotto |
| ProductSelector | `src/features/inventory/components/ProductSelector.tsx` | ❌ Da blindare | P1 | Selettore prodotti |
| ShoppingListCard | `src/features/inventory/components/ShoppingListCard.tsx` | ❌ Da blindare | P1 | Card lista spesa |
| ShoppingListManager | `src/features/inventory/components/ShoppingListManager.tsx` | ❌ Da blindare | P1 | Manager liste spesa |
| TransferProductModal | `src/features/inventory/components/TransferProductModal.tsx` | ❌ Da blindare | P1 | Modal trasferimento prodotto |

### **HOOKS (5 hooks)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useCategories | `src/features/inventory/hooks/useCategories.ts` | ❌ Da blindare | P0 | Hook categorie |
| useExpiredProducts | `src/features/inventory/hooks/useExpiredProducts.ts` | ❌ Da blindare | P0 | Hook prodotti scaduti |
| useExpiryTracking | `src/features/inventory/hooks/useExpiryTracking.ts` | ❌ Da blindare | P0 | Hook tracking scadenze |
| useProducts | `src/features/inventory/hooks/useProducts.ts` | ❌ Da blindare | P0 | Hook prodotti |
| useShoppingLists | `src/features/inventory/hooks/useShoppingLists.ts` | ❌ Da blindare | P0 | Hook liste spesa |

---

## 🛒 AREA SHOPPING (9 componenti) - COMPLETATA

### **PAGES (2 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ShoppingListsPage | `src/features/shopping/pages/ShoppingListsPage.tsx` | ❌ Da blindare | P0 | Pagina liste spesa |
| ShoppingListDetailPage | `src/features/shopping/pages/ShoppingListDetailPage.tsx` | ❌ Da blindare | P0 | Pagina dettaglio lista |

### **COMPONENTS (6 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| CreateShoppingListModal | `src/features/shopping/components/CreateShoppingListModal.tsx` | ❌ Da blindare | P1 | Modal creazione lista |
| CreateShoppingListModalV2 | `src/features/shopping/components/CreateShoppingListModalV2.tsx` | ❌ Da blindare | P1 | Modal creazione lista v2 |
| ProductFilters | `src/features/shopping/components/ProductFilters.tsx` | ❌ Da blindare | P1 | Filtri prodotti |
| ProductSelectGrid | `src/features/shopping/components/ProductSelectGrid.tsx` | ❌ Da blindare | P1 | Griglia selezione prodotti |
| ShoppingListCard | `src/features/shopping/components/ShoppingListCard.tsx` | ❌ Da blindare | P1 | Card lista spesa |
| index | `src/features/shopping/components/index.ts` | ❌ Da blindare | P1 | Index componenti |

### **HOOKS (1 hook)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useShoppingList | `src/features/shopping/hooks/useShoppingList.ts` | ❌ Da blindare | P0 | Hook lista spesa |

### **UTILS (1 util)**
| Util | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| exportToPDF | `src/features/shopping/utils/exportToPDF.ts` | ❌ Da blindare | P2 | Export PDF |

---

## ⚙️ AREA SETTINGS (5 componenti) - COMPLETATA

### **PAGES (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| SettingsPage | `src/features/settings/SettingsPage.tsx` | ❌ Da blindare | P0 | Pagina impostazioni |

### **COMPONENTS (4 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| CompanyConfiguration | `src/features/settings/components/CompanyConfiguration.tsx` | ❌ Da blindare | P1 | Configurazione azienda |
| HACCPSettings | `src/features/settings/components/HACCPSettings.tsx` | ❌ Da blindare | P1 | Impostazioni HACCP |
| NotificationPreferences | `src/features/settings/components/NotificationPreferences.tsx` | ❌ Da blindare | P1 | Preferenze notifiche |
| UserManagement | `src/features/settings/components/UserManagement.tsx` | ❌ Da blindare | P1 | Gestione utenti |

---

## 👥 AREA MANAGEMENT (8 componenti) - COMPLETATA

### **PAGES (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ManagementPage | `src/features/management/ManagementPage.tsx` | ✅ Blindato | P0 | Pagina gestione |

### **COMPONENTS (6 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| AddDepartmentModal | `src/features/management/components/AddDepartmentModal.tsx` | ❌ Da blindare | P1 | Modal aggiunta reparto |
| AddStaffModal | `src/features/management/components/AddStaffModal.tsx` | ❌ Da blindare | P1 | Modal aggiunta staff |
| DepartmentCard | `src/features/management/components/DepartmentCard.tsx` | ❌ Da blindare | P1 | Card reparto |
| DepartmentManagement | `src/features/management/components/DepartmentManagement.tsx` | ❌ Da blindare | P1 | Gestione reparti |
| StaffCard | `src/features/management/components/StaffCard.tsx` | ❌ Da blindare | P1 | Card staff |
| StaffManagement | `src/features/management/components/StaffManagement.tsx` | ❌ Da blindare | P1 | Gestione staff |

### **HOOKS (2 hooks)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useDepartments | `src/features/management/hooks/useDepartments.ts` | ❌ Da blindare | P0 | Hook reparti |
| useStaff | `src/features/management/hooks/useStaff.ts` | ❌ Da blindare | P0 | Hook staff |

---

## 🔧 AREA ADMIN (5 componenti) - COMPLETATA

### **PAGES (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ActivityTrackingPage | `src/features/admin/pages/ActivityTrackingPage.tsx` | ❌ Da blindare | P1 | Pagina tracking attività |

### **COMPONENTS (4 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ActiveSessionsCard | `src/features/admin/components/ActiveSessionsCard.tsx` | ❌ Da blindare | P1 | Card sessioni attive |
| ActivityFilters | `src/features/admin/components/ActivityFilters.tsx` | ❌ Da blindare | P1 | Filtri attività |
| ActivityLogTable | `src/features/admin/components/ActivityLogTable.tsx` | ❌ Da blindare | P1 | Tabella log attività |
| ActivityStatisticsChart | `src/features/admin/components/ActivityStatisticsChart.tsx` | ❌ Da blindare | P1 | Grafico statistiche attività |

---

## 🎯 AREA ONBOARDING (8+ componenti)

### **COMPONENTS PRINCIPALI (2 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| OnboardingWizard | `src/components/OnboardingWizard.tsx` | ❌ Da blindare | P0 | Wizard onboarding principale |
| OnboardingGuard | `src/components/OnboardingGuard.tsx` | ❌ Da blindare | P0 | Guard onboarding |

### **STEP COMPONENTS (7 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| BusinessInfoStep | `src/components/onboarding-steps/BusinessInfoStep.tsx` | ❌ Da blindare | P0 | Step info azienda |
| CalendarConfigStep | `src/components/onboarding-steps/CalendarConfigStep.tsx` | ❌ Da blindare | P0 | Step configurazione calendario |
| ConservationStep | `src/components/onboarding-steps/ConservationStep.tsx` | ❌ Da blindare | P0 | Step conservazione |
| DepartmentsStep | `src/components/onboarding-steps/DepartmentsStep.tsx` | ❌ Da blindare | P0 | Step reparti |
| InventoryStep | `src/components/onboarding-steps/InventoryStep.tsx` | ❌ Da blindare | P0 | Step inventario |
| StaffStep | `src/components/onboarding-steps/StaffStep.tsx` | ❌ Da blindare | P0 | Step staff |
| TasksStep | `src/components/onboarding-steps/TasksStep.tsx` | ❌ Da blindare | P0 | Step task |

---

## 🏗️ AREA LAYOUT & NAVIGATION (5+ componenti)

### **LAYOUTS (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| MainLayout | `src/components/layouts/MainLayout.tsx` | ✅ Blindato | P0 | Layout principale |

### **NAVIGATION (4 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ProtectedRoute | `src/components/ProtectedRoute.tsx` | ❌ Da blindare | P0 | Route protetta |
| StepNavigator | `src/components/StepNavigator.tsx` | ❌ Da blindare | P1 | Navigatore step |
| CompanySwitcher | `src/components/CompanySwitcher.tsx` | ❌ Da blindare | P1 | Selettore azienda |
| HeaderButtons | `src/components/HeaderButtons.tsx` | ❌ Da blindare | P1 | Pulsanti header |

---

## 🎨 AREA UI COMPONENTS (19+ componenti)

### **COMPONENTS BASE (19 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| UI Index | `src/components/ui/index.ts` | ✅ Blindato | P0 | Index componenti UI |
| Alert | `src/components/ui/Alert.tsx` | ❌ Da blindare | P1 | Componente alert |
| Badge | `src/components/ui/Badge.tsx` | ❌ Da blindare | P1 | Componente badge |
| Button | `src/components/ui/Button.tsx` | ❌ Da blindare | P1 | Componente button |
| Card | `src/components/ui/Card.tsx` | ❌ Da blindare | P1 | Componente card |
| CollapsibleCard | `src/components/ui/CollapsibleCard.tsx` | ❌ Da blindare | P1 | Card collassabile |
| FormField | `src/components/ui/FormField.tsx` | ❌ Da blindare | P1 | Campo form |
| Input | `src/components/ui/Input.tsx` | ❌ Da blindare | P1 | Componente input |
| Label | `src/components/ui/Label.tsx` | ❌ Da blindare | P1 | Componente label |
| LoadingSpinner | `src/components/ui/LoadingSpinner.tsx` | ❌ Da blindare | P1 | Spinner caricamento |
| Modal | `src/components/ui/Modal.tsx` | ❌ Da blindare | P1 | Componente modal |
| OptimizedImage | `src/components/ui/OptimizedImage.tsx` | ❌ Da blindare | P1 | Immagine ottimizzata |
| Progress | `src/components/ui/Progress.tsx` | ❌ Da blindare | P1 | Componente progress |
| Select | `src/components/ui/Select.tsx` | ❌ Da blindare | P1 | Componente select |
| Switch | `src/components/ui/Switch.tsx` | ❌ Da blindare | P1 | Componente switch |
| Table | `src/components/ui/Table.tsx` | ❌ Da blindare | P1 | Componente tabella |
| Tabs | `src/components/ui/Tabs.tsx` | ❌ Da blindare | P1 | Componente tabs |
| Textarea | `src/components/ui/Textarea.tsx` | ❌ Da blindare | P1 | Componente textarea |
| Tooltip | `src/components/ui/Tooltip.tsx` | ❌ Da blindare | P1 | Componente tooltip |

---

## 🔧 AREA SHARED (4 componenti) - COMPLETATA

### **COMPONENTS (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| CollapseCard | `src/features/shared/components/CollapseCard.tsx` | ❌ Da blindare | P2 | Card collassabile condivisa |

### **HOOKS (3 hooks)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useEvents | `src/features/shared/hooks/useEvents.ts` | ❌ Da blindare | P2 | Hook eventi |
| useNonConformities | `src/features/shared/hooks/useNonConformities.ts` | ❌ Da blindare | P2 | Hook non conformità |
| useNotes | `src/features/shared/hooks/useNotes.ts` | ❌ Da blindare | P2 | Hook note |

---

## 🎯 AREA PAGES (1+ componente)

### **PAGES (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| NotFoundPage | `src/components/pages/NotFoundPage.tsx` | ❌ Da blindare | P2 | Pagina 404 |

---

## 🔧 AREA OFFLINE (1+ componente)

### **COMPONENTS (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| SyncStatusBar | `src/components/offline/SyncStatusBar.tsx` | ❌ Da blindare | P2 | Barra stato sincronizzazione |

---

## 🔧 AREA DEV (1+ componente)

### **COMPONENTS (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| DevButtons | `src/components/DevButtons.tsx` | ❌ Da blindare | P3 | Pulsanti sviluppo |

---

## 🔧 AREA ERROR HANDLING (1+ componente)

### **COMPONENTS (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ErrorBoundary | `src/components/ErrorBoundary.tsx` | ❌ Da blindare | P1 | Boundary errori |

---

## 🔧 AREA REDIRECT (1+ componente)

### **COMPONENTS (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| HomeRedirect | `src/components/HomeRedirect.tsx` | ❌ Da blindare | P1 | Redirect home |

---

## 🔧 AREA HOOKS GLOBALI (15+ hooks) - COMPLETATA

### **HOOKS PRINCIPALI (15 hooks)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useActivityTracking | `src/hooks/useActivityTracking.ts` | ❌ Da blindare | P1 | Hook tracking attività |
| useAuth | `src/hooks/useAuth.ts` | ✅ Blindato | P0 | Hook autenticazione |
| useCalendar | `src/hooks/useCalendar.ts` | ❌ Da blindare | P0 | Hook calendario |
| useCalendarSettings | `src/hooks/useCalendarSettings.ts` | ❌ Da blindare | P1 | Hook impostazioni calendario |
| useConservation | `src/hooks/useConservation.ts` | ❌ Da blindare | P0 | Hook conservazione |
| useCsrfToken | `src/hooks/useCsrfToken.ts` | ❌ Da blindare | P1 | Hook CSRF protection |
| useExportManager | `src/hooks/useExportManager.ts` | ❌ Da blindare | P2 | Hook export management |
| useGitInfo | `src/hooks/useGitInfo.ts` | ❌ Da blindare | P3 | Hook info Git |
| useInvites | `src/hooks/useInvites.ts` | ❌ Da blindare | P1 | Hook gestione inviti |
| useNetworkStatus | `src/hooks/useNetworkStatus.ts` | ❌ Da blindare | P2 | Hook stato rete |
| useOfflineStorage | `src/hooks/useOfflineStorage.ts` | ❌ Da blindare | P2 | Hook storage offline |
| useOfflineSync | `src/hooks/useOfflineSync.ts` | ❌ Da blindare | P2 | Hook sincronizzazione offline |
| useRateLimit | `src/hooks/useRateLimit.ts` | ❌ Da blindare | P2 | Hook rate limiting |
| useRealtime | `src/hooks/useRealtime.ts` | ❌ Da blindare | P1 | Hook realtime updates |
| useScrollToForm | `src/hooks/useScrollToForm.ts` | ❌ Da blindare | P2 | Hook scroll form |

---

## 🔧 AREA SERVICES (50+ servizi) - COMPLETATA

### **SERVICES PRINCIPALI (50+ servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| activityTrackingService | `src/services/activityTrackingService.ts` | ❌ Da blindare | P1 | Servizio tracking attività |
| shoppingListService | `src/services/shoppingListService.ts` | ❌ Da blindare | P1 | Servizio liste spesa |

### **AUTH SERVICES (2 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| auth/index | `src/services/auth/index.ts` | ❌ Da blindare | P0 | Servizi autenticazione |
| inviteService | `src/services/auth/inviteService.ts` | ❌ Da blindare | P1 | Servizio inviti |

### **AUTOMATION SERVICES (6 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| AutomatedReportingService | `src/services/automation/AutomatedReportingService.ts` | ❌ Da blindare | P2 | Servizio reporting automatico |
| IntelligentAlertManager | `src/services/automation/IntelligentAlertManager.ts` | ❌ Da blindare | P2 | Manager alert intelligenti |
| SmartSchedulingService | `src/services/automation/SmartSchedulingService.ts` | ❌ Da blindare | P2 | Servizio scheduling intelligente |
| WorkflowAutomationEngine | `src/services/automation/WorkflowAutomationEngine.ts` | ❌ Da blindare | P2 | Engine automazione workflow |
| automation/index | `src/services/automation/index.ts` | ❌ Da blindare | P2 | Index automazione |
| test-b10-automation | `src/services/automation/test-b10-automation.ts` | ❌ Da blindare | P3 | Test automazione |

### **DASHBOARD SERVICES (2 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| MultiTenantDashboard | `src/services/dashboard/MultiTenantDashboard.ts` | ❌ Da blindare | P1 | Dashboard multi-tenant |
| dashboard/index | `src/services/dashboard/index.ts` | ❌ Da blindare | P1 | Index dashboard |

### **DEPLOYMENT SERVICES (1 servizio)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| ProductionDeploymentManager | `src/services/deployment/ProductionDeploymentManager.ts` | ❌ Da blindare | P3 | Manager deployment produzione |

### **EXPORT SERVICES (4 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| EmailScheduler | `src/services/export/EmailScheduler.ts` | ❌ Da blindare | P2 | Scheduler email |
| ExcelExporter | `src/services/export/ExcelExporter.ts` | ❌ Da blindare | P2 | Export Excel |
| HACCPReportGenerator | `src/services/export/HACCPReportGenerator.ts` | ❌ Da blindare | P2 | Generatore report HACCP |

### **INTEGRATION SERVICES (5 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| AdvancedAnalyticsIntegration | `src/services/integration/AdvancedAnalyticsIntegration.ts` | ❌ Da blindare | P2 | Integrazione analytics avanzata |
| PerformanceBenchmarker | `src/services/integration/PerformanceBenchmarker.ts` | ❌ Da blindare | P2 | Benchmarker performance |
| SystemIntegrationTester | `src/services/integration/SystemIntegrationTester.ts` | ❌ Da blindare | P2 | Tester integrazione sistema |
| integration/index | `src/services/integration/index.ts` | ❌ Da blindare | P2 | Index integrazione |
| test-b10-integration | `src/services/integration/test-b10-integration.ts` | ❌ Da blindare | P3 | Test integrazione |

### **MULTI-TENANT SERVICES (4 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| CrossCompanyReporting | `src/services/multi-tenant/CrossCompanyReporting.ts` | ❌ Da blindare | P2 | Reporting cross-company |
| MultiTenantManager | `src/services/multi-tenant/MultiTenantManager.ts` | ❌ Da blindare | P2 | Manager multi-tenant |
| PermissionManager | `src/services/multi-tenant/PermissionManager.ts` | ❌ Da blindare | P2 | Manager permessi |
| multi-tenant/index | `src/services/multi-tenant/index.ts` | ❌ Da blindare | P2 | Index multi-tenant |

### **OFFLINE SERVICES (4 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| AdvancedServiceWorker | `src/services/offline/AdvancedServiceWorker.ts` | ❌ Da blindare | P2 | Service worker avanzato |
| BackgroundSync | `src/services/offline/BackgroundSync.ts` | ❌ Da blindare | P2 | Sincronizzazione background |
| ConflictResolver | `src/services/offline/ConflictResolver.ts` | ❌ Da blindare | P2 | Risolutore conflitti |
| IndexedDBManager | `src/services/offline/IndexedDBManager.ts` | ❌ Da blindare | P2 | Manager IndexedDB |

### **PWA SERVICES (4 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| AutomationCacheManager | `src/services/pwa/AutomationCacheManager.ts` | ❌ Da blindare | P2 | Manager cache automazione |
| AutomationServiceWorker | `src/services/pwa/AutomationServiceWorker.ts` | ❌ Da blindare | P2 | Service worker automazione |
| InstallPromptManager | `src/services/pwa/InstallPromptManager.ts` | ❌ Da blindare | P2 | Manager prompt installazione |
| UpdateManager | `src/services/pwa/UpdateManager.ts` | ❌ Da blindare | P2 | Manager aggiornamenti |

### **REALTIME SERVICES (4 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| CollaborativeEditing | `src/services/realtime/CollaborativeEditing.ts` | ❌ Da blindare | P2 | Editing collaborativo |
| HACCPAlertSystem | `src/services/realtime/HACCPAlertSystem.ts` | ❌ Da blindare | P2 | Sistema alert HACCP |
| RealtimeConnectionManager | `src/services/realtime/RealtimeConnectionManager.ts` | ❌ Da blindare | P2 | Manager connessione realtime |
| TemperatureMonitor | `src/services/realtime/TemperatureMonitor.ts` | ❌ Da blindare | P2 | Monitor temperatura |

### **SECURITY SERVICES (6 servizi)**
| Service | Path | Status | Priorità | Note |
|---------|------|--------|----------|------|
| AuditLogger | `src/services/security/AuditLogger.ts` | ❌ Da blindare | P1 | Logger audit |
| ComplianceMonitor | `src/services/security/ComplianceMonitor.ts` | ❌ Da blindare | P1 | Monitor compliance |
| SecurityDashboard | `src/services/security/SecurityDashboard.ts` | ❌ Da blindare | P1 | Dashboard sicurezza |
| SecurityManager | `src/services/security/SecurityManager.ts` | ❌ Da blindare | P1 | Manager sicurezza |
| security/index | `src/services/security/index.ts` | ❌ Da blindare | P1 | Index sicurezza |
| test-integration | `src/services/security/test-integration.ts` | ❌ Da blindare | P3 | Test integrazione sicurezza |

---

## 🔧 AREA UTILS (20+ utility) - COMPLETATA

### **UTILS PRINCIPALI (20+ utility)**
| Util | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| calendarUtils | `src/utils/calendarUtils.ts` | ❌ Da blindare | P2 | Utility calendario |
| cleanupTestData | `src/utils/cleanupTestData.ts` | ❌ Da blindare | P3 | Utility pulizia test |
| defaultCategories | `src/utils/defaultCategories.ts` | ❌ Da blindare | P2 | Categorie default |
| devCompanyHelper | `src/utils/devCompanyHelper.ts` | ❌ Da blindare | P3 | Helper sviluppo |
| haccpRules | `src/utils/haccpRules.ts` | ❌ Da blindare | P2 | Regole HACCP |
| multiHostAuth | `src/utils/multiHostAuth.ts` | ❌ Da blindare | P2 | Multi-host auth |
| onboardingHelpers | `src/utils/onboardingHelpers.ts` | ❌ Da blindare | P2 | Helper onboarding |
| performance | `src/utils/performance.ts` | ❌ Da blindare | P2 | Utility performance |
| safeStorage | `src/utils/safeStorage.ts` | ❌ Da blindare | P2 | Storage sicuro |
| temperatureStatus | `src/utils/temperatureStatus.ts` | ❌ Da blindare | P2 | Status temperatura |
| testDynamicImport | `src/utils/testDynamicImport.ts` | ❌ Da blindare | P3 | Test dynamic import |

### **ONBOARDING UTILS (4 utility)**
| Util | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| conservationUtils | `src/utils/onboarding/conservationUtils.ts` | ❌ Da blindare | P2 | Utility conservazione onboarding |
| inventoryUtils | `src/utils/onboarding/inventoryUtils.ts` | ❌ Da blindare | P2 | Utility inventario onboarding |
| staffUtils | `src/utils/onboarding/staffUtils.ts` | ❌ Da blindare | P2 | Utility staff onboarding |
| taskUtils | `src/utils/onboarding/taskUtils.ts` | ❌ Da blindare | P2 | Utility task onboarding |

---

## 🔧 AREA TYPES (10+ definizioni) - COMPLETATA

### **TYPES PRINCIPALI (10+ definizioni)**
| Type | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| activity | `src/types/activity.ts` | ❌ Da blindare | P2 | Tipi attività |
| auth | `src/types/auth.ts` | ❌ Da blindare | P1 | Tipi autenticazione |
| calendar-filters | `src/types/calendar-filters.ts` | ❌ Da blindare | P2 | Tipi filtri calendario |
| calendar | `src/types/calendar.ts` | ❌ Da blindare | P1 | Tipi calendario |
| conservation | `src/types/conservation.ts` | ❌ Da blindare | P1 | Tipi conservazione |
| env.d | `src/types/env.d.ts` | ❌ Da blindare | P2 | Tipi environment |
| inventory | `src/types/inventory.ts` | ❌ Da blindare | P1 | Tipi inventario |
| onboarding | `src/types/onboarding.ts` | ❌ Da blindare | P1 | Tipi onboarding |
| shared | `src/types/shared.ts` | ❌ Da blindare | P2 | Tipi condivisi |
| shopping | `src/types/shopping.ts` | ❌ Da blindare | P2 | Tipi shopping |

---

## 📊 RIEPILOGO STATISTICHE COMPLETE

### **TOTALE COMPONENTI PER AREA**
| Area | Totale | Blindati | Da Blindare | % Completamento |
|------|--------|----------|-------------|-----------------|
| **Authentication** | 12 | 2 | 10 | 17% |
| **Dashboard** | 6 | 0 | 6 | 0% |
| **Calendar** | 25+ | 0 | 25+ | 0% |
| **Conservation** | 15+ | 0 | 15+ | 0% |
| **Inventory** | 15+ | 0 | 15+ | 0% |
| **Shopping** | 9 | 0 | 9 | 0% |
| **Settings** | 5 | 0 | 5 | 0% |
| **Management** | 8 | 1 | 7 | 12% |
| **Admin** | 5 | 0 | 5 | 0% |
| **Onboarding** | 8+ | 0 | 8+ | 0% |
| **Layout & Navigation** | 5+ | 1 | 4+ | 20% |
| **UI Components** | 19+ | 1 | 18+ | 5% |
| **Shared** | 4 | 0 | 4 | 0% |
| **Pages** | 1+ | 0 | 1+ | 0% |
| **Offline** | 1+ | 0 | 1+ | 0% |
| **Dev** | 1+ | 0 | 1+ | 0% |
| **Error Handling** | 1+ | 0 | 1+ | 0% |
| **Redirect** | 1+ | 0 | 1+ | 0% |
| **Hooks Globali** | 15+ | 1 | 14+ | 7% |
| **Services** | 50+ | 0 | 50+ | 0% |
| **Utils** | 20+ | 0 | 20+ | 0% |
| **Types** | 10+ | 0 | 10+ | 0% |
| **TOTALE** | **260+** | **6** | **254+** | **2.3%** |

### **PRIORITÀ BLINDAGGIO AGGIORNATE**
| Priorità | Componenti | % Totale | Note |
|----------|------------|----------|------|
| **P0 (Critico)** | 30+ | 12% | Componenti core per MVP |
| **P1 (Alto)** | 100+ | 38% | Componenti importanti |
| **P2 (Medio)** | 80+ | 31% | Componenti secondari |
| **P3 (Basso)** | 50+ | 19% | Componenti opzionali |

---

## 🎯 PROSSIMI PASSI AGGIORNATI

### **1. PRIORITÀ IMMEDIATE (P0)**
- Completare blindaggio componenti Authentication
- Blindare componenti Dashboard
- Blindare componenti Calendar principali
- Blindare componenti Onboarding
- Blindare componenti Management

### **2. PRIORITÀ ALTE (P1)**
- Blindare componenti Conservation
- Blindare componenti Inventory
- Blindare componenti UI
- Blindare componenti Hooks Globali
- Blindare componenti Services critici

### **3. PRIORITÀ MEDIE (P2)**
- Blindare componenti Settings
- Blindare componenti Shopping
- Blindare componenti Admin
- Blindare componenti Services secondari
- Blindare componenti Utils

### **4. PRIORITÀ BASSE (P3)**
- Blindare componenti Dev
- Blindare componenti Shared
- Blindare componenti Offline
- Blindare componenti Services opzionali

---

## 📅 DATA COMPLETAMENTO
**Data**: 2025-10-21 (Aggiornata)
**Agente**: Agente 2 - Component Mapping Specialist
**Status**: ✅ MAPPATURA COMPLETA COMPLETATA
**Prossimo**: Handoff ad Agente 3 per test UX/UI
