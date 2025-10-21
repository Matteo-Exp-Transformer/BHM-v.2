# 🎯 PRIORITÀ RIVISTE CON MAPPATURA COMPLETA - BHM v.2

## 📊 OVERVIEW PRIORITÀ RIVISTE
- **Data Revisione**: 2025-10-21
- **Agente**: Agente 2 - Component Mapping Specialist
- **Status**: ✅ PRIORITÀ RIVISTE COMPLETATE
- **Totale Componenti**: 260+ componenti
- **Componenti Blindati**: 6/260+ (2.3%)
- **Componenti Da Blindare**: 254+ (97.7%)

---

## 🎯 PRIORITÀ P0 - CRITICO (30+ componenti)

### **CRITERI P0 RIVISTI**
- ✅ Componenti core per MVP
- ✅ Componenti critici per funzionalità base
- ✅ Componenti con alto impatto utente
- ✅ Componenti con dipendenze multiple
- ✅ Componenti già parzialmente blindati

### **COMPONENTI P0 COMPLETATI (5 componenti)**
| Componente | Path | Status | Note |
|------------|------|--------|------|
| **LoginPage** | `src/features/auth/LoginPage.tsx` | ✅ Blindato | MVP core completato |
| **RegisterPage** | `src/features/auth/RegisterPage.tsx` | ✅ Blindato | MVP core completato |
| **MainLayout** | `src/components/layouts/MainLayout.tsx` | ✅ Blindato | Layout principale completato |
| **useAuth** | `src/hooks/useAuth.ts` | ✅ Blindato | Hook autenticazione completato |
| **ManagementPage** | `src/features/management/ManagementPage.tsx` | ✅ Blindato | Pagina gestione completata |

### **COMPONENTI P0 DA BLINDARE (25+ componenti)**

#### **🔐 AUTHENTICATION (5 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| HomePage | `src/features/auth/HomePage.tsx` | 🔄 Parziale | Redirect critico |
| LoginForm | `src/features/auth/components/LoginForm.tsx` | ❌ Da blindare | Form core |
| authClient | `src/features/auth/api/authClient.ts` | ❌ Da blindare | Client autenticazione |
| authSchemas | `src/features/auth/schemas/authSchemas.ts` | ❌ Da blindare | Schemi validazione |
| ProtectedRoute | `src/components/ProtectedRoute.tsx` | ❌ Da blindare | Controllo accesso |

#### **📊 DASHBOARD (6 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| DashboardPage | `src/features/dashboard/DashboardPage.tsx` | ❌ Da blindare | Pagina principale |
| KPICard | `src/features/dashboard/components/KPICard.tsx` | ❌ Da blindare | KPI critici |
| ComplianceChart | `src/features/dashboard/components/ComplianceChart.tsx` | ❌ Da blindare | Compliance HACCP |
| TemperatureTrend | `src/features/dashboard/components/TemperatureTrend.tsx` | ❌ Da blindare | Monitoraggio temperatura |
| TaskSummary | `src/features/dashboard/components/TaskSummary.tsx` | ❌ Da blindare | Riepilogo task |
| useDashboardData | `src/features/dashboard/hooks/useDashboardData.ts` | ❌ Da blindare | Hook dati dashboard |

#### **📅 CALENDAR (4 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| CalendarPage | `src/features/calendar/CalendarPage.tsx` | 🔄 Parziale | Pagina calendario |
| Calendar | `src/features/calendar/Calendar.tsx` | ❌ Da blindare | Componente principale |
| CalendarFilter | `src/features/calendar/CalendarFilter.tsx` | ❌ Da blindare | Filtri base |
| useCalendar | `src/features/calendar/hooks/useCalendar.ts` | ❌ Da blindare | Hook calendario |

#### **🧊 CONSERVATION (4 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| ConservationPage | `src/features/conservation/ConservationPage.tsx` | ❌ Da blindare | Pagina conservazione |
| ConservationManager | `src/features/conservation/ConservationManager.tsx` | ❌ Da blindare | Manager principale |
| ConservationFilters | `src/features/conservation/ConservationFilters.tsx` | ❌ Da blindare | Filtri base |
| useConservationPoints | `src/features/conservation/hooks/useConservationPoints.ts` | ❌ Da blindare | Hook punti conservazione |

#### **📦 INVENTORY (4 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| InventoryPage | `src/features/inventory/InventoryPage.tsx` | ❌ Da blindare | Pagina inventario |
| useCategories | `src/features/inventory/hooks/useCategories.ts` | ❌ Da blindare | Hook categorie |
| useProducts | `src/features/inventory/hooks/useProducts.ts` | ❌ Da blindare | Hook prodotti |
| useExpiryTracking | `src/features/inventory/hooks/useExpiryTracking.ts` | ❌ Da blindare | Hook tracking scadenze |

#### **🎯 ONBOARDING (3 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| OnboardingWizard | `src/components/OnboardingWizard.tsx` | ❌ Da blindare | Wizard principale |
| OnboardingGuard | `src/components/OnboardingGuard.tsx` | ❌ Da blindare | Controllo accesso |
| BusinessInfoStep | `src/components/onboarding-steps/BusinessInfoStep.tsx` | ❌ Da blindare | Step critico |

---

## 🔥 PRIORITÀ P1 - ALTO (100+ componenti)

### **CRITERI P1 RIVISTI**
- ✅ Componenti importanti per funzionalità
- ✅ Componenti con impatto utente medio-alto
- ✅ Componenti con dipendenze moderate
- ✅ Componenti per completare MVP
- ✅ Componenti già parzialmente blindati

### **COMPONENTI P1 COMPLETATI (1 componente)**
| Componente | Path | Status | Note |
|------------|------|--------|------|
| **UI Index** | `src/components/ui/index.ts` | ✅ Blindato | Componenti UI base completati |

### **COMPONENTI P1 DA BLINDARE (99+ componenti)**

#### **🔐 AUTHENTICATION (8 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| AcceptInvitePage | `src/features/auth/AcceptInvitePage.tsx` | ❌ Da blindare | Gestione inviti |
| AuthCallbackPage | `src/features/auth/AuthCallbackPage.tsx` | ❌ Da blindare | Callback OAuth |
| ForgotPasswordPage | `src/features/auth/ForgotPasswordPage.tsx` | ❌ Da blindare | Recupero password |
| InviteAcceptForm | `src/features/auth/components/InviteAcceptForm.tsx` | ❌ Da blindare | Form inviti |
| RecoveryConfirmForm | `src/features/auth/components/RecoveryConfirmForm.tsx` | ❌ Da blindare | Form recupero |
| RecoveryRequestForm | `src/features/auth/components/RecoveryRequestForm.tsx` | ❌ Da blindare | Form richiesta |
| CompanySwitcher | `src/components/CompanySwitcher.tsx` | ❌ Da blindare | Selettore azienda |
| HeaderButtons | `src/components/HeaderButtons.tsx` | ❌ Da blindare | Pulsanti header |

#### **📅 CALENDAR (20+ componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| CalendarSettings | `src/features/calendar/CalendarSettings.tsx` | ❌ Da blindare | Impostazioni calendario |
| CreateEventModal | `src/features/calendar/CreateEventModal.tsx` | ❌ Da blindare | Modal creazione evento |
| AlertModal | `src/features/calendar/components/AlertModal.tsx` | ❌ Da blindare | Modal alert |
| CalendarConfigModal | `src/features/calendar/components/CalendarConfigModal.tsx` | ❌ Da blindare | Modal configurazione |
| CalendarEventLegend | `src/features/calendar/components/CalendarEventLegend.tsx` | ❌ Da blindare | Legenda eventi |
| CalendarFilters | `src/features/calendar/components/CalendarFilters.tsx` | ❌ Da blindare | Filtri avanzati |
| CalendarLegend | `src/features/calendar/components/CalendarLegend.tsx` | ❌ Da blindare | Legenda calendario |
| CategoryEventsModal | `src/features/calendar/components/CategoryEventsModal.tsx` | ❌ Da blindare | Modal eventi categoria |
| EventBadge | `src/features/calendar/components/EventBadge.tsx` | ❌ Da blindare | Badge evento |
| EventModal | `src/features/calendar/components/EventModal.tsx` | ❌ Da blindare | Modal evento |
| FilterPanel | `src/features/calendar/components/FilterPanel.tsx` | ❌ Da blindare | Pannello filtri |
| GenericTaskForm | `src/features/calendar/components/GenericTaskForm.tsx` | ❌ Da blindare | Form task generico |
| HorizontalCalendarFilters | `src/features/calendar/components/HorizontalCalendarFilters.tsx` | ❌ Da blindare | Filtri orizzontali |
| MacroCategoryModal | `src/features/calendar/components/MacroCategoryModal.tsx` | ❌ Da blindare | Modal macro categoria |
| NewCalendarFilters | `src/features/calendar/components/NewCalendarFilters.tsx` | ❌ Da blindare | Nuovi filtri |
| ProductExpiryModal | `src/features/calendar/components/ProductExpiryModal.tsx` | ❌ Da blindare | Modal scadenza prodotti |
| QuickActions | `src/features/calendar/components/QuickActions.tsx` | ❌ Da blindare | Azioni rapide |
| ViewSelector | `src/features/calendar/components/ViewSelector.tsx` | ❌ Da blindare | Selettore vista |
| EventDetailsModal | `src/features/calendar/EventDetailsModal.tsx` | ❌ Da blindare | Modal dettagli evento |
| useCalendarEvents | `src/features/calendar/hooks/useCalendarEvents.ts` | ❌ Da blindare | Hook eventi calendario |

#### **🧊 CONSERVATION (10+ componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| ConservationStats | `src/features/conservation/ConservationStats.tsx` | ❌ Da blindare | Statistiche conservazione |
| CreateConservationPointModal | `src/features/conservation/CreateConservationPointModal.tsx` | ❌ Da blindare | Modal creazione punto |
| OfflineConservationDemo | `src/features/conservation/OfflineConservationDemo.tsx` | ❌ Da blindare | Demo offline |
| AddPointModal | `src/features/conservation/components/AddPointModal.tsx` | ❌ Da blindare | Modal aggiunta punto |
| AddTemperatureModal | `src/features/conservation/components/AddTemperatureModal.tsx` | ❌ Da blindare | Modal aggiunta temperatura |
| ConservationPointCard | `src/features/conservation/components/ConservationPointCard.tsx` | ❌ Da blindare | Card punto conservazione |
| MaintenanceTaskCard | `src/features/conservation/components/MaintenanceTaskCard.tsx` | ❌ Da blindare | Card task manutenzione |
| TemperatureReadingCard | `src/features/conservation/components/TemperatureReadingCard.tsx` | ❌ Da blindare | Card lettura temperatura |
| MaintenanceTaskModal | `src/features/conservation/MaintenanceTaskModal.tsx` | ❌ Da blindare | Modal task manutenzione |
| TemperatureReadingModal | `src/features/conservation/TemperatureReadingModal.tsx` | ❌ Da blindare | Modal lettura temperatura |
| useMaintenanceTasks | `src/features/conservation/hooks/useMaintenanceTasks.ts` | ❌ Da blindare | Hook task manutenzione |
| useTemperatureReadings | `src/features/conservation/hooks/useTemperatureReadings.ts` | ❌ Da blindare | Hook letture temperatura |

#### **📦 INVENTORY (10+ componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| AddCategoryModal | `src/features/inventory/components/AddCategoryModal.tsx` | ❌ Da blindare | Modal aggiunta categoria |
| AddProductModal | `src/features/inventory/components/AddProductModal.tsx` | ❌ Da blindare | Modal aggiunta prodotto |
| AllergenBadge | `src/features/inventory/components/AllergenBadge.tsx` | ❌ Da blindare | Badge allergeni |
| CategoryFilter | `src/features/inventory/components/CategoryFilter.tsx` | ❌ Da blindare | Filtro categorie |
| CreateListModal | `src/features/inventory/components/CreateListModal.tsx` | ❌ Da blindare | Modal creazione lista |
| ExpiredProductsManager | `src/features/inventory/components/ExpiredProductsManager.tsx` | ❌ Da blindare | Manager prodotti scaduti |
| ExpiryAlert | `src/features/inventory/components/ExpiryAlert.tsx` | ❌ Da blindare | Alert scadenze |
| ProductCard | `src/features/inventory/components/ProductCard.tsx` | ❌ Da blindare | Card prodotto |
| ProductSelector | `src/features/inventory/components/ProductSelector.tsx` | ❌ Da blindare | Selettore prodotti |
| ShoppingListCard | `src/features/inventory/components/ShoppingListCard.tsx` | ❌ Da blindare | Card lista spesa |
| ShoppingListManager | `src/features/inventory/components/ShoppingListManager.tsx` | ❌ Da blindare | Manager liste spesa |
| TransferProductModal | `src/features/inventory/components/TransferProductModal.tsx` | ❌ Da blindare | Modal trasferimento prodotto |
| useExpiredProducts | `src/features/inventory/hooks/useExpiredProducts.ts` | ❌ Da blindare | Hook prodotti scaduti |
| useShoppingLists | `src/features/inventory/hooks/useShoppingLists.ts` | ❌ Da blindare | Hook liste spesa |

#### **🎯 ONBOARDING (5+ componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| StepNavigator | `src/components/StepNavigator.tsx` | ❌ Da blindare | Navigatore step |
| CalendarConfigStep | `src/components/onboarding-steps/CalendarConfigStep.tsx` | ❌ Da blindare | Step configurazione calendario |
| ConservationStep | `src/components/onboarding-steps/ConservationStep.tsx` | ❌ Da blindare | Step conservazione |
| DepartmentsStep | `src/components/onboarding-steps/DepartmentsStep.tsx` | ❌ Da blindare | Step reparti |
| InventoryStep | `src/components/onboarding-steps/InventoryStep.tsx` | ❌ Da blindare | Step inventario |
| StaffStep | `src/components/onboarding-steps/StaffStep.tsx` | ❌ Da blindare | Step staff |
| TasksStep | `src/components/onboarding-steps/TasksStep.tsx` | ❌ Da blindare | Step task |

#### **🎨 UI COMPONENTS (18+ componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| Alert | `src/components/ui/Alert.tsx` | ❌ Da blindare | Componente alert |
| Badge | `src/components/ui/Badge.tsx` | ❌ Da blindare | Componente badge |
| Button | `src/components/ui/Button.tsx` | ❌ Da blindare | Componente button |
| Card | `src/components/ui/Card.tsx` | ❌ Da blindare | Componente card |
| CollapsibleCard | `src/components/ui/CollapsibleCard.tsx` | ❌ Da blindare | Card collassabile |
| FormField | `src/components/ui/FormField.tsx` | ❌ Da blindare | Campo form |
| Input | `src/components/ui/Input.tsx` | ❌ Da blindare | Componente input |
| Label | `src/components/ui/Label.tsx` | ❌ Da blindare | Componente label |
| LoadingSpinner | `src/components/ui/LoadingSpinner.tsx` | ❌ Da blindare | Spinner caricamento |
| Modal | `src/components/ui/Modal.tsx` | ❌ Da blindare | Componente modal |
| OptimizedImage | `src/components/ui/OptimizedImage.tsx` | ❌ Da blindare | Immagine ottimizzata |
| Progress | `src/components/ui/Progress.tsx` | ❌ Da blindare | Componente progress |
| Select | `src/components/ui/Select.tsx` | ❌ Da blindare | Componente select |
| Switch | `src/components/ui/Switch.tsx` | ❌ Da blindare | Componente switch |
| Table | `src/components/ui/Table.tsx` | ❌ Da blindare | Componente tabella |
| Tabs | `src/components/ui/Tabs.tsx` | ❌ Da blindare | Componente tabs |
| Textarea | `src/components/ui/Textarea.tsx` | ❌ Da blindare | Componente textarea |
| Tooltip | `src/components/ui/Tooltip.tsx` | ❌ Da blindare | Componente tooltip |

#### **🔧 HOOKS GLOBALI (14+ hooks)**
| Hook | Path | Motivazione | Impact |
|------|------|-------------|---------|
| useActivityTracking | `src/hooks/useActivityTracking.ts` | ❌ Da blindare | Hook tracking attività |
| useCalendar | `src/hooks/useCalendar.ts` | ❌ Da blindare | Hook calendario |
| useCalendarSettings | `src/hooks/useCalendarSettings.ts` | ❌ Da blindare | Hook impostazioni calendario |
| useConservation | `src/hooks/useConservation.ts` | ❌ Da blindare | Hook conservazione |
| useCsrfToken | `src/hooks/useCsrfToken.ts` | ❌ Da blindare | Hook CSRF protection |
| useInvites | `src/hooks/useInvites.ts` | ❌ Da blindare | Hook gestione inviti |
| useRealtime | `src/hooks/useRealtime.ts` | ❌ Da blindare | Hook realtime updates |
| ErrorBoundary | `src/components/ErrorBoundary.tsx` | ❌ Da blindare | Boundary errori |
| HomeRedirect | `src/components/HomeRedirect.tsx` | ❌ Da blindare | Redirect home |

---

## ⚠️ PRIORITÀ P2 - MEDIO (80+ componenti)

### **CRITERI P2 RIVISTI**
- ✅ Componenti secondari per funzionalità
- ✅ Componenti con impatto utente medio
- ✅ Componenti con dipendenze limitate
- ✅ Componenti per completare feature

### **COMPONENTI P2 DA BLINDARE (80+ componenti)**

#### **🛒 SHOPPING (9 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| ShoppingListsPage | `src/features/shopping/pages/ShoppingListsPage.tsx` | ❌ Da blindare | Pagina liste spesa |
| ShoppingListDetailPage | `src/features/shopping/pages/ShoppingListDetailPage.tsx` | ❌ Da blindare | Pagina dettaglio lista |
| CreateShoppingListModal | `src/features/shopping/components/CreateShoppingListModal.tsx` | ❌ Da blindare | Modal creazione lista |
| CreateShoppingListModalV2 | `src/features/shopping/components/CreateShoppingListModalV2.tsx` | ❌ Da blindare | Modal creazione lista v2 |
| ProductFilters | `src/features/shopping/components/ProductFilters.tsx` | ❌ Da blindare | Filtri prodotti |
| ProductSelectGrid | `src/features/shopping/components/ProductSelectGrid.tsx` | ❌ Da blindare | Griglia selezione prodotti |
| ShoppingListCard | `src/features/shopping/components/ShoppingListCard.tsx` | ❌ Da blindare | Card lista spesa |
| useShoppingList | `src/features/shopping/hooks/useShoppingList.ts` | ❌ Da blindare | Hook lista spesa |
| exportToPDF | `src/features/shopping/utils/exportToPDF.ts` | ❌ Da blindare | Export PDF |

#### **⚙️ SETTINGS (5 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| SettingsPage | `src/features/settings/SettingsPage.tsx` | ❌ Da blindare | Pagina impostazioni |
| CompanyConfiguration | `src/features/settings/components/CompanyConfiguration.tsx` | ❌ Da blindare | Configurazione azienda |
| HACCPSettings | `src/features/settings/components/HACCPSettings.tsx` | ❌ Da blindare | Impostazioni HACCP |
| NotificationPreferences | `src/features/settings/components/NotificationPreferences.tsx` | ❌ Da blindare | Preferenze notifiche |
| UserManagement | `src/features/settings/components/UserManagement.tsx` | ❌ Da blindare | Gestione utenti |

#### **👥 MANAGEMENT (7 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| AddDepartmentModal | `src/features/management/components/AddDepartmentModal.tsx` | ❌ Da blindare | Modal aggiunta reparto |
| AddStaffModal | `src/features/management/components/AddStaffModal.tsx` | ❌ Da blindare | Modal aggiunta staff |
| DepartmentCard | `src/features/management/components/DepartmentCard.tsx` | ❌ Da blindare | Card reparto |
| DepartmentManagement | `src/features/management/components/DepartmentManagement.tsx` | ❌ Da blindare | Gestione reparti |
| StaffCard | `src/features/management/components/StaffCard.tsx` | ❌ Da blindare | Card staff |
| StaffManagement | `src/features/management/components/StaffManagement.tsx` | ❌ Da blindare | Gestione staff |
| useDepartments | `src/features/management/hooks/useDepartments.ts` | ❌ Da blindare | Hook reparti |
| useStaff | `src/features/management/hooks/useStaff.ts` | ❌ Da blindare | Hook staff |

#### **🔧 ADMIN (5 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| ActivityTrackingPage | `src/features/admin/pages/ActivityTrackingPage.tsx` | ❌ Da blindare | Pagina tracking attività |
| ActiveSessionsCard | `src/features/admin/components/ActiveSessionsCard.tsx` | ❌ Da blindare | Card sessioni attive |
| ActivityFilters | `src/features/admin/components/ActivityFilters.tsx` | ❌ Da blindare | Filtri attività |
| ActivityLogTable | `src/features/admin/components/ActivityLogTable.tsx` | ❌ Da blindare | Tabella log attività |
| ActivityStatisticsChart | `src/features/admin/components/ActivityStatisticsChart.tsx` | ❌ Da blindare | Grafico statistiche attività |

#### **🔧 SHARED (4 componenti)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| CollapseCard | `src/features/shared/components/CollapseCard.tsx` | ❌ Da blindare | Card collassabile condivisa |
| useEvents | `src/features/shared/hooks/useEvents.ts` | ❌ Da blindare | Hook eventi |
| useNonConformities | `src/features/shared/hooks/useNonConformities.ts` | ❌ Da blindare | Hook non conformità |
| useNotes | `src/features/shared/hooks/useNotes.ts` | ❌ Da blindare | Hook note |

#### **🔧 SERVICES (30+ servizi)**
| Service | Path | Motivazione | Impact |
|---------|------|-------------|---------|
| activityTrackingService | `src/services/activityTrackingService.ts` | ❌ Da blindare | Servizio tracking attività |
| shoppingListService | `src/services/shoppingListService.ts` | ❌ Da blindare | Servizio liste spesa |
| auth/index | `src/services/auth/index.ts` | ❌ Da blindare | Servizi autenticazione |
| inviteService | `src/services/auth/inviteService.ts` | ❌ Da blindare | Servizio inviti |
| MultiTenantDashboard | `src/services/dashboard/MultiTenantDashboard.ts` | ❌ Da blindare | Dashboard multi-tenant |
| dashboard/index | `src/services/dashboard/index.ts` | ❌ Da blindare | Index dashboard |
| AuditLogger | `src/services/security/AuditLogger.ts` | ❌ Da blindare | Logger audit |
| ComplianceMonitor | `src/services/security/ComplianceMonitor.ts` | ❌ Da blindare | Monitor compliance |
| SecurityDashboard | `src/services/security/SecurityDashboard.ts` | ❌ Da blindare | Dashboard sicurezza |
| SecurityManager | `src/services/security/SecurityManager.ts` | ❌ Da blindare | Manager sicurezza |
| security/index | `src/services/security/index.ts` | ❌ Da blindare | Index sicurezza |

#### **🔧 UTILS (20+ utility)**
| Util | Path | Motivazione | Impact |
|------|------|-------------|---------|
| calendarUtils | `src/utils/calendarUtils.ts` | ❌ Da blindare | Utility calendario |
| defaultCategories | `src/utils/defaultCategories.ts` | ❌ Da blindare | Categorie default |
| haccpRules | `src/utils/haccpRules.ts` | ❌ Da blindare | Regole HACCP |
| multiHostAuth | `src/utils/multiHostAuth.ts` | ❌ Da blindare | Multi-host auth |
| onboardingHelpers | `src/utils/onboardingHelpers.ts` | ❌ Da blindare | Helper onboarding |
| performance | `src/utils/performance.ts` | ❌ Da blindare | Utility performance |
| safeStorage | `src/utils/safeStorage.ts` | ❌ Da blindare | Storage sicuro |
| temperatureStatus | `src/utils/temperatureStatus.ts` | ❌ Da blindare | Status temperatura |

---

## 🔧 PRIORITÀ P3 - BASSO (50+ componenti)

### **CRITERI P3 RIVISTI**
- ✅ Componenti opzionali per funzionalità
- ✅ Componenti con impatto utente basso
- ✅ Componenti con dipendenze minime
- ✅ Componenti per completare app

### **COMPONENTI P3 DA BLINDARE (50+ componenti)**

#### **🔧 DEV (1+ componente)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| DevButtons | `src/components/DevButtons.tsx` | ❌ Da blindare | Pulsanti sviluppo |

#### **🔧 OFFLINE (1+ componente)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| SyncStatusBar | `src/components/offline/SyncStatusBar.tsx` | ❌ Da blindare | Barra stato sincronizzazione |

#### **🔧 PAGES (1+ componente)**
| Componente | Path | Motivazione | Impact |
|------------|------|-------------|---------|
| NotFoundPage | `src/components/pages/NotFoundPage.tsx` | ❌ Da blindare | Pagina 404 |

#### **🔧 HOOKS GLOBALI (6+ hooks)**
| Hook | Path | Motivazione | Impact |
|------|------|-------------|---------|
| useExportManager | `src/hooks/useExportManager.ts` | ❌ Da blindare | Hook export management |
| useGitInfo | `src/hooks/useGitInfo.ts` | ❌ Da blindare | Hook info Git |
| useNetworkStatus | `src/hooks/useNetworkStatus.ts` | ❌ Da blindare | Hook stato rete |
| useOfflineStorage | `src/hooks/useOfflineStorage.ts` | ❌ Da blindare | Hook storage offline |
| useOfflineSync | `src/hooks/useOfflineSync.ts` | ❌ Da blindare | Hook sincronizzazione offline |
| useRateLimit | `src/hooks/useRateLimit.ts` | ❌ Da blindare | Hook rate limiting |
| useScrollToForm | `src/hooks/useScrollToForm.ts` | ❌ Da blindare | Hook scroll form |

#### **🔧 SERVICES (40+ servizi)**
| Service | Path | Motivazione | Impact |
|---------|------|-------------|---------|
| AutomatedReportingService | `src/services/automation/AutomatedReportingService.ts` | ❌ Da blindare | Servizio reporting automatico |
| IntelligentAlertManager | `src/services/automation/IntelligentAlertManager.ts` | ❌ Da blindare | Manager alert intelligenti |
| SmartSchedulingService | `src/services/automation/SmartSchedulingService.ts` | ❌ Da blindare | Servizio scheduling intelligente |
| WorkflowAutomationEngine | `src/services/automation/WorkflowAutomationEngine.ts` | ❌ Da blindare | Engine automazione workflow |
| ProductionDeploymentManager | `src/services/deployment/ProductionDeploymentManager.ts` | ❌ Da blindare | Manager deployment produzione |
| EmailScheduler | `src/services/export/EmailScheduler.ts` | ❌ Da blindare | Scheduler email |
| ExcelExporter | `src/services/export/ExcelExporter.ts` | ❌ Da blindare | Export Excel |
| HACCPReportGenerator | `src/services/export/HACCPReportGenerator.ts` | ❌ Da blindare | Generatore report HACCP |
| AdvancedAnalyticsIntegration | `src/services/integration/AdvancedAnalyticsIntegration.ts` | ❌ Da blindare | Integrazione analytics avanzata |
| PerformanceBenchmarker | `src/services/integration/PerformanceBenchmarker.ts` | ❌ Da blindare | Benchmarker performance |
| SystemIntegrationTester | `src/services/integration/SystemIntegrationTester.ts` | ❌ Da blindare | Tester integrazione sistema |
| CrossCompanyReporting | `src/services/multi-tenant/CrossCompanyReporting.ts` | ❌ Da blindare | Reporting cross-company |
| MultiTenantManager | `src/services/multi-tenant/MultiTenantManager.ts` | ❌ Da blindare | Manager multi-tenant |
| PermissionManager | `src/services/multi-tenant/PermissionManager.ts` | ❌ Da blindare | Manager permessi |
| AdvancedServiceWorker | `src/services/offline/AdvancedServiceWorker.ts` | ❌ Da blindare | Service worker avanzato |
| BackgroundSync | `src/services/offline/BackgroundSync.ts` | ❌ Da blindare | Sincronizzazione background |
| ConflictResolver | `src/services/offline/ConflictResolver.ts` | ❌ Da blindare | Risolutore conflitti |
| IndexedDBManager | `src/services/offline/IndexedDBManager.ts` | ❌ Da blindare | Manager IndexedDB |
| AutomationCacheManager | `src/services/pwa/AutomationCacheManager.ts` | ❌ Da blindare | Manager cache automazione |
| AutomationServiceWorker | `src/services/pwa/AutomationServiceWorker.ts` | ❌ Da blindare | Service worker automazione |
| InstallPromptManager | `src/services/pwa/InstallPromptManager.ts` | ❌ Da blindare | Manager prompt installazione |
| UpdateManager | `src/services/pwa/UpdateManager.ts` | ❌ Da blindare | Manager aggiornamenti |
| CollaborativeEditing | `src/services/realtime/CollaborativeEditing.ts` | ❌ Da blindare | Editing collaborativo |
| HACCPAlertSystem | `src/services/realtime/HACCPAlertSystem.ts` | ❌ Da blindare | Sistema alert HACCP |
| RealtimeConnectionManager | `src/services/realtime/RealtimeConnectionManager.ts` | ❌ Da blindare | Manager connessione realtime |
| TemperatureMonitor | `src/services/realtime/TemperatureMonitor.ts` | ❌ Da blindare | Monitor temperatura |

#### **🔧 UTILS (12+ utility)**
| Util | Path | Motivazione | Impact |
|------|------|-------------|---------|
| cleanupTestData | `src/utils/cleanupTestData.ts` | ❌ Da blindare | Utility pulizia test |
| devCompanyHelper | `src/utils/devCompanyHelper.ts` | ❌ Da blindare | Helper sviluppo |
| testDynamicImport | `src/utils/testDynamicImport.ts` | ❌ Da blindare | Test dynamic import |
| conservationUtils | `src/utils/onboarding/conservationUtils.ts` | ❌ Da blindare | Utility conservazione onboarding |
| inventoryUtils | `src/utils/onboarding/inventoryUtils.ts` | ❌ Da blindare | Utility inventario onboarding |
| staffUtils | `src/utils/onboarding/staffUtils.ts` | ❌ Da blindare | Utility staff onboarding |
| taskUtils | `src/utils/onboarding/taskUtils.ts` | ❌ Da blindare | Utility task onboarding |

#### **🔧 TYPES (10+ definizioni)**
| Type | Path | Motivazione | Impact |
|------|------|-------------|---------|
| activity | `src/types/activity.ts` | ❌ Da blindare | Tipi attività |
| auth | `src/types/auth.ts` | ❌ Da blindare | Tipi autenticazione |
| calendar-filters | `src/types/calendar-filters.ts` | ❌ Da blindare | Tipi filtri calendario |
| calendar | `src/types/calendar.ts` | ❌ Da blindare | Tipi calendario |
| conservation | `src/types/conservation.ts` | ❌ Da blindare | Tipi conservazione |
| env.d | `src/types/env.d.ts` | ❌ Da blindare | Tipi environment |
| inventory | `src/types/inventory.ts` | ❌ Da blindare | Tipi inventario |
| onboarding | `src/types/onboarding.ts` | ❌ Da blindare | Tipi onboarding |
| shared | `src/types/shared.ts` | ❌ Da blindare | Tipi condivisi |
| shopping | `src/types/shopping.ts` | ❌ Da blindare | Tipi shopping |

---

## 📊 RIEPILOGO PRIORITÀ RIVISTE

### **DISTRIBUZIONE PRIORITÀ AGGIORNATA**
| Priorità | Componenti | % Totale | Tempo Stimato | Status |
|----------|------------|----------|---------------|--------|
| **P0 (Critico)** | 30+ | 12% | 2 giorni | 🔄 Ottimizzata |
| **P1 (Alto)** | 100+ | 38% | 6.5 giorni | 🔄 Ottimizzata |
| **P2 (Medio)** | 80+ | 31% | 4 giorni | ❌ Invariata |
| **P3 (Basso)** | 50+ | 19% | 1 giorno | ❌ Invariata |
| **TOTALE** | **260+** | **100%** | **13.5 giorni** | 🔄 Ottimizzata |

### **COMPLETAMENTO PER PRIORITÀ**
| Priorità | Completati | Da Completare | % Progresso |
|----------|------------|---------------|--------------|
| **P0** | 5 | 25+ | 17% |
| **P1** | 1 | 99+ | 1% |
| **P2** | 0 | 80+ | 0% |
| **P3** | 0 | 50+ | 0% |
| **TOTALE** | **6** | **254+** | **2.3%** |

---

## 🎯 STRATEGIA BLINDAGGIO RIVISTA

### **FASE 1: MVP CORE OTTIMIZZATA (2 giorni)**
**Obiettivo**: Completare componenti P0 rimanenti per MVP
**Componenti**: 25+ componenti P0
**Durata**: 2 giorni (ridotta da 3)

#### **Giorno 1 - Authentication & Dashboard**
| Ora | Attività | Componenti | Status |
|-----|----------|------------|--------|
| 09:00-10:30 | Completare Authentication | HomePage, LoginForm, authClient, authSchemas | ❌ Da fare |
| 10:30-12:00 | Blindare Dashboard | DashboardPage, KPICard, ComplianceChart | ❌ Da fare |
| 14:00-15:30 | Blindare Dashboard Components | TemperatureTrend, TaskSummary, ScheduledMaintenanceCard | ❌ Da fare |
| 15:30-17:00 | Blindare Dashboard Hook | useDashboardData | ❌ Da fare |

#### **Giorno 2 - Calendar, Conservation & Inventory**
| Ora | Attività | Componenti | Status |
|-----|----------|------------|--------|
| 09:00-10:30 | Blindare Calendar Core | CalendarPage, Calendar, CalendarFilter, useCalendar | ❌ Da fare |
| 10:30-12:00 | Blindare Conservation Core | ConservationPage, ConservationManager, ConservationFilters | ❌ Da fare |
| 14:00-15:30 | Blindare Inventory Core | InventoryPage, useCategories, useProducts | ❌ Da fare |
| 15:30-17:00 | Blindare Onboarding Core | OnboardingWizard, OnboardingGuard, BusinessInfoStep | ❌ Da fare |

### **FASE 2: FUNZIONALITÀ IMPORTANTI OTTIMIZZATA (6.5 giorni)**
**Obiettivo**: Completare componenti P1 per funzionalità complete
**Componenti**: 99+ componenti P1
**Durata**: 6.5 giorni (ridotta da 7)

### **FASE 3: FEATURE COMPLETE (4 giorni)**
**Obiettivo**: Completare componenti P2 per feature complete
**Componenti**: 80+ componenti P2
**Durata**: 4 giorni (invariata)

### **FASE 4: COMPLETAMENTO (1 giorno)**
**Obiettivo**: Completare componenti P3 per completamento
**Componenti**: 50+ componenti P3
**Durata**: 1 giorno (invariata)

---

## 🚀 PROSSIMI PASSI RIVISTI

### **1. PRIORITÀ IMMEDIATE (P0)**
- Completare componenti Authentication rimanenti
- Blindare componenti Dashboard
- Blindare componenti Calendar principali
- Blindare componenti Conservation principali
- Blindare componenti Inventory principali
- Blindare componenti Onboarding principali

### **2. PRIORITÀ ALTE (P1)**
- Blindare componenti Calendar avanzati
- Blindare componenti Conservation avanzati
- Blindare componenti Inventory avanzati
- Blindare componenti UI
- Blindare componenti Hooks Globali
- Blindare componenti Services critici

### **3. PRIORITÀ MEDIE (P2)**
- Blindare componenti Shopping
- Blindare componenti Settings
- Blindare componenti Management
- Blindare componenti Admin
- Blindare componenti Services secondari
- Blindare componenti Utils

### **4. PRIORITÀ BASSE (P3)**
- Blindare componenti Dev
- Blindare componenti Shared
- Blindare componenti Offline
- Blindare componenti Services opzionali
- Blindare componenti Types

---

## 📅 DATA COMPLETAMENTO
**Data**: 2025-10-21
**Agente**: Agente 2 - Component Mapping Specialist
**Status**: ✅ PRIORITÀ RIVISTE COMPLETATE
**Prossimo**: Aggiornare dipendenze con componenti mancanti
