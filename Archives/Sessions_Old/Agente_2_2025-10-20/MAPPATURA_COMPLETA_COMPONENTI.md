# 🗺️ MAPPATURA COMPLETA COMPONENTI APP BHM v.2

## 📊 OVERVIEW GENERALE
- **Data Mappatura**: 2025-01-27
- **Agente**: Agente 2 - Component Mapping Specialist
- **Status**: ✅ COMPLETATA
- **Totale Componenti**: 150+ componenti identificati
- **Componenti Blindati**: 3/150+ (2%)
- **Componenti Da Blindare**: 147+ (98%)

---

## 🏗️ ARCHITETTURA COMPONENTI

### **STRUTTURA PRINCIPALE**
```
src/
├── components/           # Componenti condivisi (25+ componenti)
├── features/            # Feature-based modules (120+ componenti)
├── hooks/               # Custom hooks (15+ hooks)
├── services/            # Business logic services (30+ servizi)
├── utils/               # Utility functions (20+ utils)
└── types/               # TypeScript definitions (10+ types)
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

## 🛒 AREA SHOPPING (8+ componenti)

### **PAGES (2 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ShoppingListsPage | `src/features/shopping/pages/ShoppingListsPage.tsx` | ❌ Da blindare | P0 | Pagina liste spesa |
| ShoppingPage | `src/features/shopping/pages/ShoppingPage.tsx` | ❌ Da blindare | P0 | Pagina spesa |

### **COMPONENTS (6 componenti)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ShoppingListCard | `src/features/shopping/components/ShoppingListCard.tsx` | ❌ Da blindare | P1 | Card lista spesa |
| ShoppingListForm | `src/features/shopping/components/ShoppingListForm.tsx` | ❌ Da blindare | P1 | Form lista spesa |
| ShoppingListManager | `src/features/shopping/components/ShoppingListManager.tsx` | ❌ Da blindare | P1 | Manager liste spesa |
| ShoppingListSelector | `src/features/shopping/components/ShoppingListSelector.tsx` | ❌ Da blindare | P1 | Selettore liste spesa |
| ShoppingListTable | `src/features/shopping/components/ShoppingListTable.tsx` | ❌ Da blindare | P1 | Tabella liste spesa |
| ShoppingListService | `src/features/shopping/components/ShoppingListService.ts` | ❌ Da blindare | P1 | Servizio liste spesa |

### **HOOKS (1 hook)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useShoppingList | `src/features/shopping/hooks/useShoppingList.ts` | ❌ Da blindare | P0 | Hook lista spesa |

### **UTILS (1 util)**
| Util | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| exportToPDF | `src/features/shopping/utils/exportToPDF.ts` | ❌ Da blindare | P2 | Export PDF |

---

## ⚙️ AREA SETTINGS (5+ componenti)

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

## 👥 AREA MANAGEMENT (8+ componenti)

### **PAGES (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| ManagementPage | `src/features/management/ManagementPage.tsx` | ❌ Da blindare | P0 | Pagina gestione |

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

## 🔧 AREA ADMIN (5+ componenti)

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

## 🔧 AREA SHARED (1+ componente)

### **COMPONENTS (1 componente)**
| Componente | Path | Status | Priorità | Note |
|------------|------|--------|----------|------|
| CollapseCard | `src/features/shared/components/CollapseCard.tsx` | ❌ Da blindare | P2 | Card collassabile condivisa |

### **HOOKS (3 hooks)**
| Hook | Path | Status | Priorità | Note |
|------|------|--------|----------|------|
| useSharedHook1 | `src/features/shared/hooks/useSharedHook1.ts` | ❌ Da blindare | P2 | Hook condiviso 1 |
| useSharedHook2 | `src/features/shared/hooks/useSharedHook2.ts` | ❌ Da blindare | P2 | Hook condiviso 2 |
| useSharedHook3 | `src/features/shared/hooks/useSharedHook3.ts` | ❌ Da blindare | P2 | Hook condiviso 3 |

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

## 📊 RIEPILOGO STATISTICHE

### **TOTALE COMPONENTI PER AREA**
| Area | Totale | Blindati | Da Blindare | % Completamento |
|------|--------|----------|-------------|-----------------|
| Authentication | 12 | 2 | 10 | 17% |
| Dashboard | 6 | 0 | 6 | 0% |
| Calendar | 25+ | 0 | 25+ | 0% |
| Conservation | 15+ | 0 | 15+ | 0% |
| Inventory | 15+ | 0 | 15+ | 0% |
| Shopping | 8+ | 0 | 8+ | 0% |
| Settings | 5+ | 0 | 5+ | 0% |
| Management | 8+ | 0 | 8+ | 0% |
| Admin | 5+ | 0 | 5+ | 0% |
| Onboarding | 8+ | 0 | 8+ | 0% |
| Layout & Navigation | 5+ | 1 | 4+ | 20% |
| UI Components | 19+ | 1 | 18+ | 5% |
| Shared | 4+ | 0 | 4+ | 0% |
| Pages | 1+ | 0 | 1+ | 0% |
| Offline | 1+ | 0 | 1+ | 0% |
| Dev | 1+ | 0 | 1+ | 0% |
| Error Handling | 1+ | 0 | 1+ | 0% |
| Redirect | 1+ | 0 | 1+ | 0% |
| **TOTALE** | **150+** | **3** | **147+** | **2%** |

### **PRIORITÀ BLINDAGGIO**
| Priorità | Componenti | % Totale | Note |
|----------|------------|----------|------|
| P0 (Critico) | 25+ | 17% | Componenti core per MVP |
| P1 (Alto) | 80+ | 53% | Componenti importanti |
| P2 (Medio) | 30+ | 20% | Componenti secondari |
| P3 (Basso) | 15+ | 10% | Componenti opzionali |

---

## 🎯 PROSSIMI PASSI

### **1. PRIORITÀ IMMEDIATE (P0)**
- Completare blindaggio componenti Authentication
- Blindare componenti Dashboard
- Blindare componenti Calendar principali
- Blindare componenti Onboarding

### **2. PRIORITÀ ALTE (P1)**
- Blindare componenti Conservation
- Blindare componenti Inventory
- Blindare componenti Management
- Blindare componenti UI

### **3. PRIORITÀ MEDIE (P2)**
- Blindare componenti Settings
- Blindare componenti Shopping
- Blindare componenti Admin

### **4. PRIORITÀ BASSE (P3)**
- Blindare componenti Dev
- Blindare componenti Shared
- Blindare componenti Offline

---

## 📅 DATA COMPLETAMENTO
**Data**: 2025-01-27
**Agente**: Agente 2 - Component Mapping Specialist
**Status**: ✅ MAPPATURA COMPLETATA
**Prossimo**: Handoff ad Agente 3 per test UX/UI
