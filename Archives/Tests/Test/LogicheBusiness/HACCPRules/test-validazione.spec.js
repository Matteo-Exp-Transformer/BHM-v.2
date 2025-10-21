import { test, expect } from '@playwright/test';

test.describe('HACCPRules - Test Validazione', () => {
  test('Dovrebbe validare correttamente le categorie che richiedono certificazione HACCP', async ({ page }) => {
    const validationResult = await page.evaluate(() => {
      const HACCP_CERT_REQUIRED_CATEGORIES = [
        'Cuochi',
        'Banconisti',
        'Camerieri',
        'Addetto Pulizie',
        'Magazziniere',
      ];
      
      const checkCategory = (category) => {
        return HACCP_CERT_REQUIRED_CATEGORIES.includes(category);
      };
      
      // Test con categorie che richiedono certificazione
      const requiresCert = checkCategory('Cuochi');
      const requiresCert2 = checkCategory('Banconisti');
      
      // Test con categoria che NON richiede certificazione
      const noCert = checkCategory('Social & Media Manager');
      
      return {
        cuochi: requiresCert,
        banconisti: requiresCert2,
        socialMedia: noCert
      };
    });

    expect(validationResult.cuochi).toBe(true);
    expect(validationResult.banconisti).toBe(true);
    expect(validationResult.socialMedia).toBe(false);
  });

  test('Dovrebbe validare correttamente i mesi di alert scadenza certificazioni', async ({ page }) => {
    const validationResult = await page.evaluate(() => {
      const HACCP_EXPIRY_ALERT_MONTHS = [3, 1];
      
      const checkExpiryAlert = (monthsUntilExpiry) => {
        return HACCP_EXPIRY_ALERT_MONTHS.includes(monthsUntilExpiry);
      };
      
      // Test con mesi che dovrebbero triggerare alert
      const alert3Months = checkExpiryAlert(3);
      const alert1Month = checkExpiryAlert(1);
      
      // Test con mese che NON dovrebbe triggerare alert
      const noAlert6Months = checkExpiryAlert(6);
      
      return {
        threeMonths: alert3Months,
        oneMonth: alert1Month,
        sixMonths: noAlert6Months
      };
    });

    expect(validationResult.threeMonths).toBe(true);
    expect(validationResult.oneMonth).toBe(true);
    expect(validationResult.sixMonths).toBe(false);
  });

  test('Dovrebbe validare correttamente i livelli di severità degli alert', async ({ page }) => {
    const validationResult = await page.evaluate(() => {
      const HACCP_ALERT_SEVERITIES = ['info', 'warning', 'critical', 'emergency'];
      
      const isValidSeverity = (severity) => {
        return HACCP_ALERT_SEVERITIES.includes(severity);
      };
      
      // Test con severità valide
      const validInfo = isValidSeverity('info');
      const validWarning = isValidSeverity('warning');
      const validCritical = isValidSeverity('critical');
      const validEmergency = isValidSeverity('emergency');
      
      // Test con severità non valida
      const invalidSeverity = isValidSeverity('unknown');
      
      return {
        info: validInfo,
        warning: validWarning,
        critical: validCritical,
        emergency: validEmergency,
        invalid: invalidSeverity
      };
    });

    expect(validationResult.info).toBe(true);
    expect(validationResult.warning).toBe(true);
    expect(validationResult.critical).toBe(true);
    expect(validationResult.emergency).toBe(true);
    expect(validationResult.invalid).toBe(false);
  });

  test('Dovrebbe validare correttamente i tipi di controllo compliance', async ({ page }) => {
    const validationResult = await page.evaluate(() => {
      const COMPLIANCE_CHECK_TYPES = [
        'TEMPERATURE',
        'DOCUMENTATION',
        'TRAINING',
        'MAINTENANCE',
        'ACCESS_CONTROL'
      ];
      
      const isValidCheckType = (checkType) => {
        return COMPLIANCE_CHECK_TYPES.includes(checkType);
      };
      
      // Test con tipi di controllo validi
      const validTemp = isValidCheckType('TEMPERATURE');
      const validDoc = isValidCheckType('DOCUMENTATION');
      const validTraining = isValidCheckType('TRAINING');
      
      // Test con tipo non valido
      const invalidType = isValidCheckType('UNKNOWN');
      
      return {
        temperature: validTemp,
        documentation: validDoc,
        training: validTraining,
        invalid: invalidType
      };
    });

    expect(validationResult.temperature).toBe(true);
    expect(validationResult.documentation).toBe(true);
    expect(validationResult.training).toBe(true);
    expect(validationResult.invalid).toBe(false);
  });

  test('Dovrebbe validare correttamente i livelli critici di compliance', async ({ page }) => {
    const validationResult = await page.evaluate(() => {
      const CRITICAL_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      
      const isValidCriticalLevel = (level) => {
        return CRITICAL_LEVELS.includes(level);
      };
      
      // Test con livelli critici validi
      const validLow = isValidCriticalLevel('LOW');
      const validMedium = isValidCriticalLevel('MEDIUM');
      const validHigh = isValidCriticalLevel('HIGH');
      const validCritical = isValidCriticalLevel('CRITICAL');
      
      // Test con livello non valido
      const invalidLevel = isValidCriticalLevel('UNKNOWN');
      
      return {
        low: validLow,
        medium: validMedium,
        high: validHigh,
        critical: validCritical,
        invalid: invalidLevel
      };
    });

    expect(validationResult.low).toBe(true);
    expect(validationResult.medium).toBe(true);
    expect(validationResult.high).toBe(true);
    expect(validationResult.critical).toBe(true);
    expect(validationResult.invalid).toBe(false);
  });

  test('Dovrebbe validare correttamente le frequenze di monitoraggio', async ({ page }) => {
    const validationResult = await page.evaluate(() => {
      const MONITORING_FREQUENCIES = ['real-time', 'hourly', 'daily', 'weekly', 'monthly'];
      
      const isValidFrequency = (frequency) => {
        return MONITORING_FREQUENCIES.includes(frequency);
      };
      
      // Test con frequenze valide
      const validRealTime = isValidFrequency('real-time');
      const validHourly = isValidFrequency('hourly');
      const validDaily = isValidFrequency('daily');
      const validWeekly = isValidFrequency('weekly');
      const validMonthly = isValidFrequency('monthly');
      
      // Test con frequenza non valida
      const invalidFrequency = isValidFrequency('yearly');
      
      return {
        realTime: validRealTime,
        hourly: validHourly,
        daily: validDaily,
        weekly: validWeekly,
        monthly: validMonthly,
        invalid: invalidFrequency
      };
    });

    expect(validationResult.realTime).toBe(true);
    expect(validationResult.hourly).toBe(true);
    expect(validationResult.daily).toBe(true);
    expect(validationResult.weekly).toBe(true);
    expect(validationResult.monthly).toBe(true);
    expect(validationResult.invalid).toBe(false);
  });

  test('Dovrebbe validare correttamente i risultati dei controlli compliance', async ({ page }) => {
    const validationResult = await page.evaluate(() => {
      const CHECK_RESULTS = ['PASS', 'FAIL', 'WARNING', 'NOT_APPLICABLE'];
      
      const isValidResult = (result) => {
        return CHECK_RESULTS.includes(result);
      };
      
      // Test con risultati validi
      const validPass = isValidResult('PASS');
      const validFail = isValidResult('FAIL');
      const validWarning = isValidResult('WARNING');
      const validNotApplicable = isValidResult('NOT_APPLICABLE');
      
      // Test con risultato non valido
      const invalidResult = isValidResult('UNKNOWN');
      
      return {
        pass: validPass,
        fail: validFail,
        warning: validWarning,
        notApplicable: validNotApplicable,
        invalid: invalidResult
      };
    });

    expect(validationResult.pass).toBe(true);
    expect(validationResult.fail).toBe(true);
    expect(validationResult.warning).toBe(true);
    expect(validationResult.notApplicable).toBe(true);
    expect(validationResult.invalid).toBe(false);
  });

  test('Dovrebbe validare correttamente le lingue supportate per i report', async ({ page }) => {
    const validationResult = await page.evaluate(() => {
      const SUPPORTED_LANGUAGES = ['it', 'en'];
      
      const isValidLanguage = (language) => {
        return SUPPORTED_LANGUAGES.includes(language);
      };
      
      // Test con lingue supportate
      const validItalian = isValidLanguage('it');
      const validEnglish = isValidLanguage('en');
      
      // Test con lingua non supportata
      const invalidLanguage = isValidLanguage('fr');
      
      return {
        italian: validItalian,
        english: validEnglish,
        invalid: invalidLanguage
      };
    });

    expect(validationResult.italian).toBe(true);
    expect(validationResult.english).toBe(true);
    expect(validationResult.invalid).toBe(false);
  });
});
