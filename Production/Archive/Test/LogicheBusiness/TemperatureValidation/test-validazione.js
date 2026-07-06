/**
 * TEST VALIDAZIONE - TemperatureValidation
 * 
 * Test per verificare che le validazioni temperatura gestiscano correttamente
 * tutti i casi limite, valori estremi e scenari di errore.
 */

const { test, expect } = require('@playwright/test');

test.describe('TemperatureValidation - Test Validazione', () => {
  
  // Test 1: Validazione temperature negative
  test('Dovrebbe gestire correttamente temperature negative per freezer', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    // Test freezer con temperatura negativa normale
    const negativeTemp = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(-18, -20, 'freezer'); // -18°C su setpoint -20°C
    });
    expect(negativeTemp).toBe('compliant');
    
    // Test freezer con temperatura troppo alta (critica)
    const tooHighForFreezer = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(-10, -20, 'freezer'); // -10°C su setpoint -20°C (critico)
    });
    expect(tooHighForFreezer).toBe('critical');
  });

  // Test 2: Validazione temperature molto alte per ambient
  test('Dovrebbe gestire correttamente temperature alte per ambiente', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    // Test ambiente con temperatura normale
    const normalAmbient = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(22, 20, 'ambient'); // 22°C su setpoint 20°C
    });
    expect(normalAmbient).toBe('compliant');
    
    // Test ambiente con temperatura troppo alta
    const tooHotAmbient = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(30, 20, 'ambient'); // 30°C su setpoint 20°C (warning)
    });
    expect(tooHotAmbient).toBe('warning');
  });

  // Test 3: Validazione blast chiller con range ampio
  test('Dovrebbe gestire correttamente blast chiller con tolleranza ±5°C', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    // Test blast chiller entro tolleranza
    const blastCompliant = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(-13, -18, 'blast'); // -13°C su setpoint -18°C
    });
    expect(blastCompliant).toBe('compliant');
    
    // Test blast chiller warning
    const blastWarning = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(-8, -18, 'blast'); // -8°C su setpoint -18°C
    });
    expect(blastWarning).toBe('warning');
    
    // Test blast chiller critical
    const blastCritical = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(-5, -18, 'blast'); // -5°C su setpoint -18°C
    });
    expect(blastCritical).toBe('critical');
  });

  // Test 4: Validazione valori limite (0, null, undefined)
  test('Dovrebbe gestire correttamente valori limite e edge cases', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    // Test temperatura zero
    const zeroTemp = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(0, 2, 'fridge'); // 0°C su setpoint 2°C
    });
    expect(zeroTemp).toBe('compliant');
    
    // Test setpoint zero
    const zeroSetpoint = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(1, 0, 'fridge'); // 1°C su setpoint 0°C
    });
    expect(zeroSetpoint).toBe('compliant');
  });

  // Test 5: Validazione temperature decimali
  test('Dovrebbe gestire correttamente temperature con decimali', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    // Test con decimali precisi
    const decimalTemp = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(4.7, 4.0, 'fridge'); // 4.7°C su setpoint 4.0°C
    });
    expect(decimalTemp).toBe('compliant');
    
    // Test con molti decimali
    const preciseTemp = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(4.123456, 4.000000, 'fridge');
    });
    expect(preciseTemp).toBe('compliant');
  });

  // Test 6: Validazione letture senza conservation_point
  test('Dovrebbe gestire correttamente letture incomplete', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    // Test lettura senza conservation_point (default compliant)
    const incompleteReading = await page.evaluate(() => {
      const { getReadingStatus } = require('../../src/utils/temperatureStatus.ts');
      const reading = {
        temperature: 50, // Temperatura molto alta
        // conservation_point mancante
      };
      return getReadingStatus(reading);
    });
    expect(incompleteReading).toBe('compliant');
    
    // Test lettura con conservation_point null
    const nullConservationPoint = await page.evaluate(() => {
      const { getReadingStatus } = require('../../src/utils/temperatureStatus.ts');
      const reading = {
        temperature: 50,
        conservation_point: null
      };
      return getReadingStatus(reading);
    });
    expect(nullConservationPoint).toBe('compliant');
  });

  // Test 7: Validazione compliance rate con array misti
  test('Dovrebbe calcolare compliance rate corretto con dati misti', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    // Test con array misto di stati
    const mixedCompliance = await page.evaluate(() => {
      const { calculateComplianceRate } = require('../../src/utils/temperatureStatus.ts');
      const readings = [
        { temperature: 4, conservation_point: { setpoint_temp: 4, type: 'fridge' } }, // Compliant
        { temperature: 7, conservation_point: { setpoint_temp: 4, type: 'fridge' } }, // Warning
        { temperature: 10, conservation_point: { setpoint_temp: 4, type: 'fridge' } }, // Critical
        { temperature: 3, conservation_point: { setpoint_temp: 4, type: 'fridge' } },  // Compliant
        { temperature: 5, conservation_point: { setpoint_temp: 4, type: 'fridge' } },  // Compliant
        { temperature: 8, conservation_point: { setpoint_temp: 4, type: 'fridge' } }   // Critical
      ];
      return calculateComplianceRate(readings);
    });
    expect(mixedCompliance).toBe(50); // 3 compliant su 6 totali = 50%
  });

  // Test 8: Validazione range tolleranza estremi
  test('Dovrebbe calcolare range tolleranza corretto per tutti i tipi', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    // Test range frigo
    const fridgeRange = await page.evaluate(() => {
      const { getToleranceRange } = require('../../src/utils/temperatureStatus.ts');
      return getToleranceRange(4, 'fridge');
    });
    expect(fridgeRange).toEqual({ min: 2, max: 6 });
    
    // Test range freezer
    const freezerRange = await page.evaluate(() => {
      const { getToleranceRange } = require('../../src/utils/temperatureStatus.ts');
      return getToleranceRange(-20, 'freezer');
    });
    expect(freezerRange).toEqual({ min: -22, max: -18 });
    
    // Test range blast
    const blastRange = await page.evaluate(() => {
      const { getToleranceRange } = require('../../src/utils/temperatureStatus.ts');
      return getToleranceRange(-18, 'blast');
    });
    expect(blastRange).toEqual({ min: -23, max: -13 });
    
    // Test range ambient
    const ambientRange = await page.evaluate(() => {
      const { getToleranceRange } = require('../../src/utils/temperatureStatus.ts');
      return getToleranceRange(20, 'ambient');
    });
    expect(ambientRange).toEqual({ min: 17, max: 23 });
  });
});
