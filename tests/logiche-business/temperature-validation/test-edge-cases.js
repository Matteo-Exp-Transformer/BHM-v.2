/**
 * TEST EDGE CASES - TemperatureValidation
 * 
 * Test per verificare che le logiche temperatura gestiscano correttamente
 * tutti i casi estremi, scenari anomali e condizioni limite.
 */

const { test, expect } = require('@playwright/test');

test.describe('TemperatureValidation - Edge Cases', () => {
  
  // Test 1: Temperature estremamente basse
  test('Dovrebbe gestire temperature criogeniche (-100°C)', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const cryogenicTemp = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(-100, -20, 'freezer');
    });
    expect(cryogenicTemp).toBe('critical');
  });

  // Test 2: Temperature estremamente alte
  test('Dovrebbe gestire temperature molto alte (100°C)', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const boilingTemp = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(100, 20, 'ambient');
    });
    expect(boilingTemp).toBe('critical');
  });

  // Test 3: Setpoint negativo per frigo (scenario anomale)
  test('Dovrebbe gestire setpoint negativi per frigo', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const negativeSetpoint = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(4, -5, 'fridge'); // 4°C su setpoint -5°C
    });
    expect(negativeSetpoint).toBe('critical');
  });

  // Test 4: Setpoint positivo per freezer (scenario anomale)
  test('Dovrebbe gestire setpoint positivi per freezer', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const positiveSetpoint = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(-18, 10, 'freezer'); // -18°C su setpoint 10°C
    });
    expect(positiveSetpoint).toBe('critical');
  });

  // Test 5: Temperature identiche (differenza 0)
  test('Dovrebbe gestire temperature identiche al setpoint', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const identicalTemp = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(4.0, 4.0, 'fridge');
    });
    expect(identicalTemp).toBe('compliant');
  });

  // Test 6: Array vuoto per compliance rate
  test('Dovrebbe restituire 100% per array vuoto', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const emptyArrayRate = await page.evaluate(() => {
      const { calculateComplianceRate } = require('../../src/utils/temperatureStatus.ts');
      return calculateComplianceRate([]);
    });
    expect(emptyArrayRate).toBe(100);
  });

  // Test 7: Array con letture tutte critical
  test('Dovrebbe restituire 0% per letture tutte critical', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const allCriticalRate = await page.evaluate(() => {
      const { calculateComplianceRate } = require('../../src/utils/temperatureStatus.ts');
      const readings = [
        { temperature: 15, conservation_point: { setpoint_temp: 4, type: 'fridge' } }, // Critical
        { temperature: 20, conservation_point: { setpoint_temp: 4, type: 'fridge' } }, // Critical
        { temperature: 25, conservation_point: { setpoint_temp: 4, type: 'fridge' } }  // Critical
      ];
      return calculateComplianceRate(readings);
    });
    expect(allCriticalRate).toBe(0);
  });

  // Test 8: Filtro con status inesistente
  test('Dovrebbe restituire array vuoto per status inesistente', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const filteredEmpty = await page.evaluate(() => {
      const { filterReadingsByStatus } = require('../../src/utils/temperatureStatus.ts');
      const readings = [
        { temperature: 4, conservation_point: { setpoint_temp: 4, type: 'fridge' } }
      ];
      // Tentativo di filtrare per status inesistente
      return filterReadingsByStatus(readings, 'nonexistent');
    });
    expect(filteredEmpty).toHaveLength(0);
  });

  // Test 9: Letture con conservation_point incompleto
  test('Dovrebbe gestire conservation_point con dati mancanti', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const incompletePoint = await page.evaluate(() => {
      const { getReadingStatus } = require('../../src/utils/temperatureStatus.ts');
      const reading = {
        temperature: 4,
        conservation_point: {
          // setpoint_temp mancante
          type: 'fridge'
        }
      };
      return getReadingStatus(reading);
    });
    expect(incompletePoint).toBe('compliant'); // Default behavior
  });

  // Test 10: Range tolleranza con valori estremi
  test('Dovrebbe calcolare range con valori molto grandi', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const extremeRange = await page.evaluate(() => {
      const { getToleranceRange } = require('../../src/utils/temperatureStatus.ts');
      return getToleranceRange(1000, 'ambient'); // Setpoint molto alto
    });
    expect(extremeRange).toEqual({ min: 997, max: 1003 });
  });

  // Test 11: Temperature con precisione molto alta
  test('Dovrebbe gestire temperature con molti decimali', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const preciseTemp = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(4.123456789, 4.000000000, 'fridge');
    });
    expect(preciseTemp).toBe('compliant');
  });

  // Test 12: Compliance rate con divisione per zero
  test('Dovrebbe gestire correttamente calcoli con zero', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const zeroCompliance = await page.evaluate(() => {
      const { calculateComplianceRate } = require('../../src/utils/temperatureStatus.ts');
      return calculateComplianceRate([]);
    });
    expect(zeroCompliance).toBe(100);
  });

  // Test 13: Tipo punto conservazione non valido
  test('Dovrebbe gestire tipo punto conservazione non riconosciuto', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const invalidType = await page.evaluate(() => {
      const { getToleranceForType } = require('../../src/utils/temperatureStatus.ts');
      return getToleranceForType('invalid_type');
    });
    expect(invalidType).toBe(2); // Default tolerance
  });

  // Test 14: Letture con timestamp molto vecchi
  test('Dovrebbe gestire letture con date molto vecchie', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const oldReading = await page.evaluate(() => {
      const { getReadingStatus } = require('../../src/utils/temperatureStatus.ts');
      const reading = {
        temperature: 4,
        recorded_at: new Date('1900-01-01'),
        conservation_point: { setpoint_temp: 4, type: 'fridge' }
      };
      return getReadingStatus(reading);
    });
    expect(oldReading).toBe('compliant');
  });

  // Test 15: Temperature con notazione scientifica
  test('Dovrebbe gestire temperature in notazione scientifica', async ({ page }) => {
    await page.goto('http://localhost:3002/conservation');
    
    const scientificTemp = await page.evaluate(() => {
      const { calculateTemperatureStatus } = require('../../src/utils/temperatureStatus.ts');
      return calculateTemperatureStatus(4e0, 4e0, 'fridge'); // 4.0 in notazione scientifica
    });
    expect(scientificTemp).toBe('compliant');
  });
});
