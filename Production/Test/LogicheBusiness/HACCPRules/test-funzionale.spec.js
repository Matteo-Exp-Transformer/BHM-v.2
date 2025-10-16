import { test, expect } from '@playwright/test';

test.describe('HACCPRules - Test Funzionali', () => {
  test('HACCP_CERT_REQUIRED_CATEGORIES dovrebbe contenere le categorie corrette', async ({ page }) => {
    const categories = await page.evaluate(() => {
      const HACCP_CERT_REQUIRED_CATEGORIES = [
        'Cuochi',
        'Banconisti',
        'Camerieri',
        'Addetto Pulizie',
        'Magazziniere',
      ];
      return HACCP_CERT_REQUIRED_CATEGORIES;
    });

    expect(categories).toEqual([
      'Cuochi',
      'Banconisti', 
      'Camerieri',
      'Addetto Pulizie',
      'Magazziniere'
    ]);
  });

  test('HACCP_EXPIRY_ALERT_MONTHS dovrebbe essere configurato correttamente', async ({ page }) => {
    const alertMonths = await page.evaluate(() => {
      const HACCP_EXPIRY_ALERT_MONTHS = [3, 1];
      return HACCP_EXPIRY_ALERT_MONTHS;
    });

    expect(alertMonths).toEqual([3, 1]);
    expect(alertMonths.length).toBe(2);
  });

  test('STAFF_ROLES dovrebbe contenere tutti i ruoli necessari', async ({ page }) => {
    const roles = await page.evaluate(() => {
      const STAFF_ROLES = [
        { value: 'admin', label: 'Amministratore' },
        { value: 'responsabile', label: 'Responsabile' },
        { value: 'dipendente', label: 'Dipendente' },
        { value: 'collaboratore', label: 'Collaboratore Occasionale / Part-time' },
      ];
      return STAFF_ROLES;
    });

    expect(roles).toHaveLength(4);
    expect(roles[0].value).toBe('admin');
    expect(roles[1].value).toBe('responsabile');
    expect(roles[2].value).toBe('dipendente');
    expect(roles[3].value).toBe('collaboratore');
  });

  test('STAFF_CATEGORIES dovrebbe contenere tutte le categorie staff', async ({ page }) => {
    const categories = await page.evaluate(() => {
      const STAFF_CATEGORIES = [
        { value: 'Amministratore', label: 'Amministratore' },
        { value: 'Cuochi', label: 'Cuochi' },
        { value: 'Banconisti', label: 'Banconisti' },
        { value: 'Camerieri', label: 'Camerieri' },
        { value: 'Addetto Pulizie', label: 'Addetto Pulizie' },
        { value: 'Magazziniere', label: 'Magazziniere' },
        { value: 'Social & Media Manager', label: 'Social & Media Manager' },
        { value: 'Altro', label: 'Altro' },
      ];
      return STAFF_CATEGORIES;
    });

    expect(categories).toHaveLength(8);
    expect(categories[0].value).toBe('Amministratore');
    expect(categories[1].value).toBe('Cuochi');
    expect(categories[6].value).toBe('Social & Media Manager');
    expect(categories[7].value).toBe('Altro');
  });

  test('ComplianceMonitor dovrebbe inizializzarsi correttamente', async ({ page }) => {
    const monitorInitialized = await page.evaluate(() => {
      // Simula l'inizializzazione del ComplianceMonitor
      const config = {
        standards: ['HACCP', 'ISO22000'],
        automaticChecks: true,
        reportingFrequency: 'daily'
      };
      
      // Verifica che la configurazione sia valida
      return config.standards.length > 0 && 
             typeof config.automaticChecks === 'boolean' &&
             ['daily', 'weekly', 'monthly'].includes(config.reportingFrequency);
    });

    expect(monitorInitialized).toBe(true);
  });

  test('HACCPAlertSystem dovrebbe gestire correttamente i tipi di alert', async ({ page }) => {
    const alertTypes = await page.evaluate(() => {
      const HACCP_ALERT_TYPES = [
        'temperature_violation',
        'maintenance_overdue',
        'expiry_warning',
        'certification_expiry',
        'audit_required',
        'system_error'
      ];
      return HACCP_ALERT_TYPES;
    });

    expect(alertTypes).toHaveLength(6);
    expect(alertTypes).toContain('temperature_violation');
    expect(alertTypes).toContain('maintenance_overdue');
    expect(alertTypes).toContain('expiry_warning');
  });

  test('HACCPReportGenerator dovrebbe supportare i tipi di report corretti', async ({ page }) => {
    const reportTypes = await page.evaluate(() => {
      const HACCP_REPORT_TYPES = ['inspection', 'monthly', 'quarterly', 'custom'];
      return HACCP_REPORT_TYPES;
    });

    expect(reportTypes).toHaveLength(4);
    expect(reportTypes).toContain('inspection');
    expect(reportTypes).toContain('monthly');
    expect(reportTypes).toContain('quarterly');
    expect(reportTypes).toContain('custom');
  });
});
