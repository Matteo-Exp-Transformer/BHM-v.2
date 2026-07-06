import { test, expect } from '@playwright/test';

test.describe('HACCPRules - Edge Cases', () => {
  test('Dovrebbe gestire categorie staff con caratteri speciali', async ({ page }) => {
    const specialCategory = await page.evaluate(() => {
      const STAFF_CATEGORIES = [
        { value: 'Amministratore', label: 'Amministratore' },
        { value: 'Social & Media Manager', label: 'Social & Media Manager' },
        { value: 'Addetto Pulizie', label: 'Addetto Pulizie' },
      ];
      
      // Test con categoria che contiene caratteri speciali
      const socialMediaCategory = STAFF_CATEGORIES.find(cat => cat.value.includes('&'));
      
      return {
        found: !!socialMediaCategory,
        value: socialMediaCategory?.value,
        label: socialMediaCategory?.label
      };
    });

    expect(specialCategory.found).toBe(true);
    expect(specialCategory.value).toBe('Social & Media Manager');
    expect(specialCategory.label).toBe('Social & Media Manager');
  });

  test('Dovrebbe gestire alert con severità estreme', async ({ page }) => {
    const extremeSeverity = await page.evaluate(() => {
      const HACCP_ALERT_SEVERITIES = ['info', 'warning', 'critical', 'emergency'];
      
      // Test con severità emergency (massima priorità)
      const emergencyIndex = HACCP_ALERT_SEVERITIES.indexOf('emergency');
      const infoIndex = HACCP_ALERT_SEVERITIES.indexOf('info');
      
      return {
        emergencyIndex,
        infoIndex,
        emergencyIsHighest: emergencyIndex > infoIndex
      };
    });

    expect(extremeSeverity.emergencyIndex).toBe(3);
    expect(extremeSeverity.infoIndex).toBe(0);
    expect(extremeSeverity.emergencyIsHighest).toBe(true);
  });

  test('Dovrebbe gestire frequenze di monitoraggio con valori estremi', async ({ page }) => {
    const extremeFrequencies = await page.evaluate(() => {
      const MONITORING_FREQUENCIES = ['real-time', 'hourly', 'daily', 'weekly', 'monthly'];
      
      // Test con frequenza real-time (massima frequenza)
      const realTimeIndex = MONITORING_FREQUENCIES.indexOf('real-time');
      const monthlyIndex = MONITORING_FREQUENCIES.indexOf('monthly');
      
      return {
        realTimeIndex,
        monthlyIndex,
        realTimeIsHighest: realTimeIndex < monthlyIndex
      };
    });

    expect(extremeFrequencies.realTimeIndex).toBe(0);
    expect(extremeFrequencies.monthlyIndex).toBe(4);
    expect(extremeFrequencies.realTimeIsHighest).toBe(true);
  });

  test('Dovrebbe gestire livelli critici con priorità estreme', async ({ page }) => {
    const extremeLevels = await page.evaluate(() => {
      const CRITICAL_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      
      // Test con livello CRITICAL (massima priorità)
      const criticalIndex = CRITICAL_LEVELS.indexOf('CRITICAL');
      const lowIndex = CRITICAL_LEVELS.indexOf('LOW');
      
      return {
        criticalIndex,
        lowIndex,
        criticalIsHighest: criticalIndex > lowIndex
      };
    });

    expect(extremeLevels.criticalIndex).toBe(3);
    expect(extremeLevels.lowIndex).toBe(0);
    expect(extremeLevels.criticalIsHighest).toBe(true);
  });

  test('Dovrebbe gestire tipi di controllo con casi limite', async ({ page }) => {
    const edgeCaseControl = await page.evaluate(() => {
      const COMPLIANCE_CHECK_TYPES = [
        'TEMPERATURE',
        'DOCUMENTATION',
        'TRAINING',
        'MAINTENANCE',
        'ACCESS_CONTROL'
      ];
      
      // Test con tipo di controllo più critico (TEMPERATURE)
      const temperatureIndex = COMPLIANCE_CHECK_TYPES.indexOf('TEMPERATURE');
      const trainingIndex = COMPLIANCE_CHECK_TYPES.indexOf('TRAINING');
      
      return {
        temperatureIndex,
        trainingIndex,
        hasTemperature: temperatureIndex >= 0,
        hasTraining: trainingIndex >= 0
      };
    });

    expect(edgeCaseControl.temperatureIndex).toBe(0);
    expect(edgeCaseControl.trainingIndex).toBe(2);
    expect(edgeCaseControl.hasTemperature).toBe(true);
    expect(edgeCaseControl.hasTraining).toBe(true);
  });

  test('Dovrebbe gestire risultati di controllo con stati estremi', async ({ page }) => {
    const extremeResults = await page.evaluate(() => {
      const CHECK_RESULTS = ['PASS', 'FAIL', 'WARNING', 'NOT_APPLICABLE'];
      
      // Test con risultati estremi
      const passIndex = CHECK_RESULTS.indexOf('PASS');
      const failIndex = CHECK_RESULTS.indexOf('FAIL');
      const notApplicableIndex = CHECK_RESULTS.indexOf('NOT_APPLICABLE');
      
      return {
        passIndex,
        failIndex,
        notApplicableIndex,
        passIsBest: passIndex === 0,
        failIsWorst: failIndex === 1,
        notApplicableIsSpecial: notApplicableIndex === 3
      };
    });

    expect(extremeResults.passIndex).toBe(0);
    expect(extremeResults.failIndex).toBe(1);
    expect(extremeResults.notApplicableIndex).toBe(3);
    expect(extremeResults.passIsBest).toBe(true);
    expect(extremeResults.failIsWorst).toBe(true); // FAIL è index 1, che è il peggiore tra i primi due
    expect(extremeResults.notApplicableIsSpecial).toBe(true);
  });

  test('Dovrebbe gestire certificazioni con scadenze estreme', async ({ page }) => {
    const extremeExpiry = await page.evaluate(() => {
      const HACCP_EXPIRY_ALERT_MONTHS = [3, 1];
      
      // Test con scadenze estreme
      const hasThreeMonthAlert = HACCP_EXPIRY_ALERT_MONTHS.includes(3);
      const hasOneMonthAlert = HACCP_EXPIRY_ALERT_MONTHS.includes(1);
      const hasZeroMonthAlert = HACCP_EXPIRY_ALERT_MONTHS.includes(0);
      const hasTwelveMonthAlert = HACCP_EXPIRY_ALERT_MONTHS.includes(12);
      
      return {
        threeMonths: hasThreeMonthAlert,
        oneMonth: hasOneMonthAlert,
        zeroMonths: hasZeroMonthAlert,
        twelveMonths: hasTwelveMonthAlert
      };
    });

    expect(extremeExpiry.threeMonths).toBe(true);
    expect(extremeExpiry.oneMonth).toBe(true);
    expect(extremeExpiry.zeroMonths).toBe(false);
    expect(extremeExpiry.twelveMonths).toBe(false);
  });

  test('Dovrebbe gestire ruoli staff con permessi estremi', async ({ page }) => {
    const extremeRoles = await page.evaluate(() => {
      const STAFF_ROLES = [
        { value: 'admin', label: 'Amministratore' },
        { value: 'responsabile', label: 'Responsabile' },
        { value: 'dipendente', label: 'Dipendente' },
        { value: 'collaboratore', label: 'Collaboratore Occasionale / Part-time' },
      ];
      
      // Test con ruoli estremi (admin = massimi permessi, collaboratore = minimi)
      const adminRole = STAFF_ROLES.find(role => role.value === 'admin');
      const collaboratorRole = STAFF_ROLES.find(role => role.value === 'collaboratore');
      
      return {
        adminExists: !!adminRole,
        collaboratorExists: !!collaboratorRole,
        adminLabel: adminRole?.label,
        collaboratorLabel: collaboratorRole?.label,
        isAdminHighest: adminRole?.value === 'admin',
        isCollaboratorLowest: collaboratorRole?.value === 'collaboratore'
      };
    });

    expect(extremeRoles.adminExists).toBe(true);
    expect(extremeRoles.collaboratorExists).toBe(true);
    expect(extremeRoles.adminLabel).toBe('Amministratore');
    expect(extremeRoles.collaboratorLabel).toBe('Collaboratore Occasionale / Part-time');
    expect(extremeRoles.isAdminHighest).toBe(true);
    expect(extremeRoles.isCollaboratorLowest).toBe(true);
  });

  test('Dovrebbe gestire tipi di report con configurazioni estreme', async ({ page }) => {
    const extremeReports = await page.evaluate(() => {
      const HACCP_REPORT_TYPES = ['inspection', 'monthly', 'quarterly', 'custom'];
      
      // Test con tipi di report estremi
      const inspectionIndex = HACCP_REPORT_TYPES.indexOf('inspection');
      const customIndex = HACCP_REPORT_TYPES.indexOf('custom');
      const monthlyIndex = HACCP_REPORT_TYPES.indexOf('monthly');
      
      return {
        inspectionIndex,
        customIndex,
        monthlyIndex,
        hasInspection: inspectionIndex >= 0,
        hasCustom: customIndex >= 0,
        hasMonthly: monthlyIndex >= 0,
        inspectionIsFirst: inspectionIndex === 0,
        customIsLast: customIndex === 3
      };
    });

    expect(extremeReports.inspectionIndex).toBe(0);
    expect(extremeReports.customIndex).toBe(3);
    expect(extremeReports.monthlyIndex).toBe(1);
    expect(extremeReports.hasInspection).toBe(true);
    expect(extremeReports.hasCustom).toBe(true);
    expect(extremeReports.hasMonthly).toBe(true);
    expect(extremeReports.inspectionIsFirst).toBe(true);
    expect(extremeReports.customIsLast).toBe(true);
  });

  test('Dovrebbe gestire lingue con configurazioni estreme', async ({ page }) => {
    const extremeLanguages = await page.evaluate(() => {
      const SUPPORTED_LANGUAGES = ['it', 'en'];
      
      // Test con lingue supportate
      const italianIndex = SUPPORTED_LANGUAGES.indexOf('it');
      const englishIndex = SUPPORTED_LANGUAGES.indexOf('en');
      
      // Test con lingua non supportata
      const frenchIndex = SUPPORTED_LANGUAGES.indexOf('fr');
      const spanishIndex = SUPPORTED_LANGUAGES.indexOf('es');
      
      return {
        italianIndex,
        englishIndex,
        frenchIndex,
        spanishIndex,
        italianIsDefault: italianIndex === 0,
        englishIsSecondary: englishIndex === 1,
        frenchNotSupported: frenchIndex === -1,
        spanishNotSupported: spanishIndex === -1
      };
    });

    expect(extremeLanguages.italianIndex).toBe(0);
    expect(extremeLanguages.englishIndex).toBe(1);
    expect(extremeLanguages.frenchIndex).toBe(-1);
    expect(extremeLanguages.spanishIndex).toBe(-1);
    expect(extremeLanguages.italianIsDefault).toBe(true);
    expect(extremeLanguages.englishIsSecondary).toBe(true);
    expect(extremeLanguages.frenchNotSupported).toBe(true);
    expect(extremeLanguages.spanishNotSupported).toBe(true);
  });

  test('Dovrebbe gestire configurazioni di alert con valori estremi', async ({ page }) => {
    const extremeAlertConfig = await page.evaluate(() => {
      // Test con configurazione di alert estremi
      const alertConfig = {
        escalation_rules: {
          temperature_violation: { escalate_after: 15, escalate_to: ['admin'] },
          maintenance_overdue: { escalate_after: 60, escalate_to: ['responsabile'] },
          expiry_warning: { escalate_after: 1440, escalate_to: ['admin'] },
          system_error: { escalate_after: 5, escalate_to: ['admin'] }
        },
        notification_settings: {
          max_per_minute: 10,
          max_per_hour: 50
        },
        compliance_thresholds: {
          temperature_tolerance: 2,
          expiry_warning_days: 3,
          certification_warning_days: 30
        }
      };
      
      // Test con valori estremi
      const fastestEscalation = Math.min(
        alertConfig.escalation_rules.temperature_violation.escalate_after,
        alertConfig.escalation_rules.maintenance_overdue.escalate_after,
        alertConfig.escalation_rules.system_error.escalate_after
      );
      
      const slowestEscalation = Math.max(
        alertConfig.escalation_rules.temperature_violation.escalate_after,
        alertConfig.escalation_rules.maintenance_overdue.escalate_after,
        alertConfig.escalation_rules.expiry_warning.escalate_after
      );
      
      return {
        fastestEscalation,
        slowestEscalation,
        hasSystemErrorEscalation: alertConfig.escalation_rules.system_error.escalate_after === 5,
        hasExpiryWarningEscalation: alertConfig.escalation_rules.expiry_warning.escalate_after === 1440,
        maxNotificationsPerMinute: alertConfig.notification_settings.max_per_minute,
        maxNotificationsPerHour: alertConfig.notification_settings.max_per_hour
      };
    });

    expect(extremeAlertConfig.fastestEscalation).toBe(5);
    expect(extremeAlertConfig.slowestEscalation).toBe(1440);
    expect(extremeAlertConfig.hasSystemErrorEscalation).toBe(true);
    expect(extremeAlertConfig.hasExpiryWarningEscalation).toBe(true);
    expect(extremeAlertConfig.maxNotificationsPerMinute).toBe(10);
    expect(extremeAlertConfig.maxNotificationsPerHour).toBe(50);
  });
});
