/**
 * Puppeteer E2E Test Configuration for HACCP Business Manager PWA
 * Comprehensive testing setup for authentication, HACCP features, and PWA functionality
 */

export const PUPPETEER_CONFIG = {
  // Browser launch options
  launchOptions: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO) || 0,
    devtools: process.env.DEVTOOLS === 'true',
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      // PWA testing args
      '--enable-features=VizDisplayCompositor',
      '--enable-web-app-manifest',
      '--enable-service-worker-navigation-preload',
    ],
  },

  // App configuration
  app: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3001',
    timeout: parseInt(process.env.TIMEOUT) || 30000,
    slowActionDelay: 100,
    fastActionDelay: 50,
  },

  // Test user configurations for different roles
  testUsers: {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@test.haccp.app',
      password: process.env.TEST_ADMIN_PASSWORD || 'TestAdmin123!',
      role: 'admin',
      permissions: [
        'canManageStaff',
        'canManageDepartments',
        'canManageSettings',
        'canExportData',
      ],
    },
    responsabile: {
      email: process.env.TEST_MANAGER_EMAIL || 'manager@test.haccp.app',
      password: process.env.TEST_MANAGER_PASSWORD || 'TestManager123!',
      role: 'responsabile',
      permissions: ['canManageConservation', 'canViewAllTasks'],
    },
    dipendente: {
      email: process.env.TEST_EMPLOYEE_EMAIL || 'employee@test.haccp.app',
      password: process.env.TEST_EMPLOYEE_PASSWORD || 'TestEmployee123!',
      role: 'dipendente',
      permissions: [],
    },
    collaboratore: {
      email: process.env.TEST_COLLAB_EMAIL || 'collab@test.haccp.app',
      password: process.env.TEST_COLLAB_PASSWORD || 'TestCollab123!',
      role: 'collaboratore',
      permissions: [],
    },
  },

  // Page routes and selectors
  routes: {
    home: '/',
    login: '/login',
    signIn: '/sign-in',
    signUp: '/sign-up',
    conservation: '/conservazione',
    activities: '/attivita',
    inventory: '/inventario',
    management: '/gestione',
    settings: '/impostazioni',
  },

  // Common selectors used across tests
  selectors: {
    // Authentication
    clerkEmailInput: 'input[name="identifier"]',
    clerkPasswordInput: 'input[name="password"]',
    clerkSubmitButton: 'button[type="submit"]',
    clerkSignInButton: '[data-testid="sign-in"]',
    clerkSignUpButton: '[data-testid="sign-up"]',
    userButton: '.cl-userButton-trigger',
    signOutButton: '.cl-userButton-menuItem[data-testid="sign-out"]',

    // Navigation
    sidebar: '[data-testid="sidebar"]',
    navLink: '[data-testid="nav-link"]',
    mobileMenuToggle: '[data-testid="mobile-menu-toggle"]',

    // Dashboard/Homepage
    welcomeMessage: '[data-testid="welcome-message"]',
    statsGrid: '[data-testid="stats-grid"]',
    quickActions: '[data-testid="quick-actions"]',
    recentActivity: '[data-testid="recent-activity"]',
    complianceScore: '[data-testid="compliance-score"]',

    // Conservation/HACCP
    temperatureCard: '[data-testid="temperature-card"]',
    addTemperatureButton: '[data-testid="add-temperature-button"]',
    temperatureInput: '[data-testid="temperature-input"]',
    conservationPointCard: '[data-testid="conservation-point-card"]',
    maintenanceTaskCard: '[data-testid="maintenance-task-card"]',
    temperatureChart: '[data-testid="temperature-chart"]',

    // Calendar/Activities
    calendarView: '[data-testid="calendar-view"]',
    addEventButton: '[data-testid="add-event-button"]',
    eventModal: '[data-testid="event-modal"]',
    eventTitle: '[data-testid="event-title"]',
    eventDescription: '[data-testid="event-description"]',
    eventDate: '[data-testid="event-date"]',
    saveEventButton: '[data-testid="save-event-button"]',

    // Inventory
    productCard: '[data-testid="product-card"]',
    addProductButton: '[data-testid="add-product-button"]',
    productModal: '[data-testid="product-modal"]',
    productName: '[data-testid="product-name"]',
    productCategory: '[data-testid="product-category"]',
    expiryDate: '[data-testid="expiry-date"]',
    inventoryFilter: '[data-testid="inventory-filter"]',

    // Management
    staffCard: '[data-testid="staff-card"]',
    addStaffButton: '[data-testid="add-staff-button"]',
    departmentCard: '[data-testid="department-card"]',
    addDepartmentButton: '[data-testid="add-department-button"]',

    // Settings
    settingsForm: '[data-testid="settings-form"]',
    saveSettingsButton: '[data-testid="save-settings-button"]',
    notificationPreferences: '[data-testid="notification-preferences"]',
    haccpSettings: '[data-testid="haccp-settings"]',

    // Generic UI elements
    modal: '[data-testid="modal"]',
    modalClose: '[data-testid="modal-close"]',
    submitButton: '[data-testid="submit-button"]',
    cancelButton: '[data-testid="cancel-button"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]',
    toast: '.Toastify__toast',
    toastSuccess: '.Toastify__toast--success',
    toastError: '.Toastify__toast--error',

    // PWA specific
    installPrompt: '[data-testid="pwa-install-prompt"]',
    serviceWorkerUpdate: '[data-testid="sw-update-prompt"]',
    offlineIndicator: '[data-testid="offline-indicator"]',
  },

  // Mobile viewports for responsive testing
  mobileViewports: {
    iphone: { width: 375, height: 812 },
    android: { width: 412, height: 892 },
    tablet: { width: 768, height: 1024 },
    smallMobile: { width: 320, height: 568 },
  },

  // Performance thresholds
  performance: {
    pageLoadTimeout: 10000,
    networkIdleTimeout: 2000,
    firstContentfulPaint: 2000,
    largestContentfulPaint: 4000,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100,
  },

  // Test data
  testData: {
    // Sample temperature readings
    temperatures: [
      { location: 'Frigorifero Principale', value: '4.2', unit: '°C' },
      { location: 'Freezer 1', value: '-18.5', unit: '°C' },
      { location: 'Frigorifero Bevande', value: '2.8', unit: '°C' },
    ],

    // Sample products
    products: [
      {
        name: 'Pollo Fresco',
        category: 'Carni',
        quantity: '2.5kg',
        expiry: '2024-12-31',
        allergens: ['Nessuno'],
      },
      {
        name: 'Mozzarella di Bufala',
        category: 'Latticini',
        quantity: '500g',
        expiry: '2024-12-25',
        allergens: ['Latte'],
      },
      {
        name: 'Olio Extravergine',
        category: 'Condimenti',
        quantity: '1L',
        expiry: '2025-06-01',
        allergens: ['Nessuno'],
      },
    ],

    // Sample events
    events: [
      {
        title: 'Pulizia Frigorifero',
        description: 'Pulizia settimanale del frigorifero principale',
        date: '2024-12-30',
        type: 'maintenance',
      },
      {
        title: 'Controllo Scadenze',
        description: 'Controllo prodotti in scadenza',
        date: '2024-12-28',
        type: 'inspection',
      },
      {
        title: 'Formazione HACCP',
        description: 'Sessione di formazione per nuovo personale',
        date: '2025-01-05',
        type: 'training',
      },
    ],

    // Sample staff
    staff: [
      {
        name: 'Mario Rossi',
        email: 'mario.rossi@restaurant.com',
        role: 'dipendente',
        department: 'Cucina',
      },
      {
        name: 'Giulia Bianchi',
        email: 'giulia.bianchi@restaurant.com',
        role: 'responsabile',
        department: 'Sala',
      },
    ],

    // Sample departments
    departments: [
      {
        name: 'Cucina',
        description: 'Reparto preparazione cibi',
        manager: 'Chef Mario',
      },
      {
        name: 'Sala',
        description: 'Servizio ai tavoli',
        manager: 'Giulia Bianchi',
      },
      {
        name: 'Bar',
        description: 'Preparazione bevande',
        manager: 'Luca Verdi',
      },
    ],
  },

  // Test environment settings
  environment: {
    skipAuthTests: process.env.SKIP_AUTH_TESTS === 'true',
    skipPWATests: process.env.SKIP_PWA_TESTS === 'true',
    skipMobileTests: process.env.SKIP_MOBILE_TESTS === 'true',
    skipPerformanceTests: process.env.SKIP_PERFORMANCE_TESTS === 'true',
    testParallel: process.env.TEST_PARALLEL !== 'false',
    retryFailedTests: parseInt(process.env.RETRY_COUNT) || 2,
  },

  // Screenshot and recording settings
  capture: {
    screenshot: {
      enabled: process.env.SCREENSHOT === 'true',
      path: './e2e/screenshots',
      fullPage: true,
    },
    video: {
      enabled: process.env.VIDEO === 'true',
      path: './e2e/videos',
    },
    trace: {
      enabled: process.env.TRACE === 'true',
      path: './e2e/traces',
    },
  },
}

export default PUPPETEER_CONFIG
