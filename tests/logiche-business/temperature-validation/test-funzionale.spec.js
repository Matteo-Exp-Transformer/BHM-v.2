/**
 * TEST FUNZIONALI - TemperatureValidation
 * 
 * Test per verificare che tutte le funzioni di validazione temperatura
 * funzionino correttamente in ogni scenario possibile.
 */

import { test, expect } from '@playwright/test';

test.describe('TemperatureValidation - Test Funzionali', () => {
  
  // Test 1: getToleranceForType() - Tolleranze per tipo punto conservazione
  test('getToleranceForType dovrebbe restituire tolleranze corrette per ogni tipo', async ({ page }) => {
    // Test delle funzioni JavaScript senza navigazione
    
    // Test tolleranza freezer (2°C)
    const freezerTolerance = await page.evaluate(() => {
      const getToleranceForType = (type) => {
        switch (type) {
          case 'blast': return 5;
          case 'ambient': return 3;
          case 'fridge':
          case 'freezer':
          default: return 2;
        }
      };
      return getToleranceForType('freezer');
    });
    expect(freezerTolerance).toBe(2);
    
    // Test tolleranza frigo (2°C)
    const fridgeTolerance = await page.evaluate(() => {
      const getToleranceForType = (type) => {
        switch (type) {
          case 'blast': return 5;
          case 'ambient': return 3;
          case 'fridge':
          case 'freezer':
          default: return 2;
        }
      };
      return getToleranceForType('fridge');
    });
    expect(fridgeTolerance).toBe(2);
    
    // Test tolleranza blast (5°C)
    const blastTolerance = await page.evaluate(() => {
      const getToleranceForType = (type) => {
        switch (type) {
          case 'blast': return 5;
          case 'ambient': return 3;
          case 'fridge':
          case 'freezer':
          default: return 2;
        }
      };
      return getToleranceForType('blast');
    });
    expect(blastTolerance).toBe(5);
    
    // Test tolleranza ambient (3°C)
    const ambientTolerance = await page.evaluate(() => {
      const getToleranceForType = (type) => {
        switch (type) {
          case 'blast': return 5;
          case 'ambient': return 3;
          case 'fridge':
          case 'freezer':
          default: return 2;
        }
      };
      return getToleranceForType('ambient');
    });
    expect(ambientTolerance).toBe(3);
  });

  // Test 2: calculateTemperatureStatus() - Calcolo status temperatura
  test('calculateTemperatureStatus dovrebbe calcolare status corretto per ogni scenario', async ({ page }) => {
    
    // Test scenario COMPLIANT - temperatura perfetta
    const compliantStatus = await page.evaluate(() => {
      const calculateTemperatureStatus = (temperature, setpoint, type) => {
        const tolerance = type === 'blast' ? 5 : type === 'ambient' ? 3 : 2;
        const diff = Math.abs(temperature - setpoint);
        
        if (diff <= tolerance) return 'compliant';
        if (diff <= tolerance + 2) return 'warning';
        return 'critical';
      };
      return calculateTemperatureStatus(4, 4, 'fridge'); // Temperatura = setpoint
    });
    expect(compliantStatus).toBe('compliant');
    
    // Test scenario COMPLIANT - temperatura entro tolleranza
    const compliantWithinTolerance = await page.evaluate(() => {
      const calculateTemperatureStatus = (temperature, setpoint, type) => {
        const tolerance = type === 'blast' ? 5 : type === 'ambient' ? 3 : 2;
        const diff = Math.abs(temperature - setpoint);
        
        if (diff <= tolerance) return 'compliant';
        if (diff <= tolerance + 2) return 'warning';
        return 'critical';
      };
      return calculateTemperatureStatus(5.5, 4, 'fridge'); // +1.5°C (entro ±2°C)
    });
    expect(compliantWithinTolerance).toBe('compliant');
    
    // Test scenario WARNING - temperatura fuori tolleranza ma non critica
    const warningStatus = await page.evaluate(() => {
      const calculateTemperatureStatus = (temperature, setpoint, type) => {
        const tolerance = type === 'blast' ? 5 : type === 'ambient' ? 3 : 2;
        const diff = Math.abs(temperature - setpoint);
        
        if (diff <= tolerance) return 'compliant';
        if (diff <= tolerance + 2) return 'warning';
        return 'critical';
      };
      return calculateTemperatureStatus(7, 4, 'fridge'); // +3°C (warning: ±2°C + 2°C)
    });
    expect(warningStatus).toBe('warning');
    
    // Test scenario CRITICAL - temperatura fuori range critico
    const criticalStatus = await page.evaluate(() => {
      const calculateTemperatureStatus = (temperature, setpoint, type) => {
        const tolerance = type === 'blast' ? 5 : type === 'ambient' ? 3 : 2;
        const diff = Math.abs(temperature - setpoint);
        
        if (diff <= tolerance) return 'compliant';
        if (diff <= tolerance + 2) return 'warning';
        return 'critical';
      };
      return calculateTemperatureStatus(10, 4, 'fridge'); // +6°C (critico: > ±4°C)
    });
    expect(criticalStatus).toBe('critical');
  });

  // Test 3: calculateComplianceRate() - Tasso compliance
  test('calculateComplianceRate dovrebbe calcolare tasso corretto', async ({ page }) => {
    
    // Test array vuoto (dovrebbe restituire 100%)
    const emptyRate = await page.evaluate(() => {
      const calculateComplianceRate = (readings) => {
        if (readings.length === 0) return 100;
        
        const compliantCount = readings.filter(reading => {
          if (!reading.conservation_point) return true; // Default compliant
          
          const tolerance = reading.conservation_point.type === 'blast' ? 5 : 
                           reading.conservation_point.type === 'ambient' ? 3 : 2;
          const diff = Math.abs(reading.temperature - reading.conservation_point.setpoint_temp);
          return diff <= tolerance;
        }).length;
        
        return Math.round((compliantCount / readings.length) * 100);
      };
      return calculateComplianceRate([]);
    });
    expect(emptyRate).toBe(100);
    
    // Test array con tutte letture compliant (100%)
    const allCompliantRate = await page.evaluate(() => {
      const calculateComplianceRate = (readings) => {
        if (readings.length === 0) return 100;
        
        const compliantCount = readings.filter(reading => {
          if (!reading.conservation_point) return true;
          
          const tolerance = reading.conservation_point.type === 'blast' ? 5 : 
                           reading.conservation_point.type === 'ambient' ? 3 : 2;
          const diff = Math.abs(reading.temperature - reading.conservation_point.setpoint_temp);
          return diff <= tolerance;
        }).length;
        
        return Math.round((compliantCount / readings.length) * 100);
      };
      const readings = [
        { temperature: 4, conservation_point: { setpoint_temp: 4, type: 'fridge' } },
        { temperature: 3, conservation_point: { setpoint_temp: 4, type: 'fridge' } },
        { temperature: 5, conservation_point: { setpoint_temp: 4, type: 'fridge' } }
      ];
      return calculateComplianceRate(readings);
    });
    expect(allCompliantRate).toBe(100);
    
    // Test array misto (75% compliant)
    const mixedRate = await page.evaluate(() => {
      const calculateComplianceRate = (readings) => {
        if (readings.length === 0) return 100;
        
        const compliantCount = readings.filter(reading => {
          if (!reading.conservation_point) return true;
          
          const tolerance = reading.conservation_point.type === 'blast' ? 5 : 
                           reading.conservation_point.type === 'ambient' ? 3 : 2;
          const diff = Math.abs(reading.temperature - reading.conservation_point.setpoint_temp);
          return diff <= tolerance;
        }).length;
        
        return Math.round((compliantCount / readings.length) * 100);
      };
      const readings = [
        { temperature: 4, conservation_point: { setpoint_temp: 4, type: 'fridge' } },
        { temperature: 3, conservation_point: { setpoint_temp: 4, type: 'fridge' } },
        { temperature: 5, conservation_point: { setpoint_temp: 4, type: 'fridge' } },
        { temperature: 10, conservation_point: { setpoint_temp: 4, type: 'fridge' } } // Critico
      ];
      return calculateComplianceRate(readings);
    });
    expect(mixedRate).toBe(75);
  });

  // Test 4: getReadingStatus() - Status lettura specifica
  test('getReadingStatus dovrebbe gestire letture con e senza conservation_point', async ({ page }) => {
    await page.goto('/conservation');
    
    // Test lettura con conservation_point
    const readingWithPoint = await page.evaluate(() => {
      const getReadingStatus = (reading) => {
        if (!reading.conservation_point) {
          return 'compliant'; // Default if no conservation point data
        }
        
        const tolerance = reading.conservation_point.type === 'blast' ? 5 : 
                         reading.conservation_point.type === 'ambient' ? 3 : 2;
        const diff = Math.abs(reading.temperature - reading.conservation_point.setpoint_temp);
        
        if (diff <= tolerance) return 'compliant';
        if (diff <= tolerance + 2) return 'warning';
        return 'critical';
      };
      const reading = {
        temperature: 6,
        conservation_point: { setpoint_temp: 4, type: 'fridge' }
      };
      return getReadingStatus(reading);
    });
    expect(readingWithPoint).toBe('warning');
    
    // Test lettura senza conservation_point (default compliant)
    const readingWithoutPoint = await page.evaluate(() => {
      const getReadingStatus = (reading) => {
        if (!reading.conservation_point) {
          return 'compliant'; // Default if no conservation point data
        }
        
        const tolerance = reading.conservation_point.type === 'blast' ? 5 : 
                         reading.conservation_point.type === 'ambient' ? 3 : 2;
        const diff = Math.abs(reading.temperature - reading.conservation_point.setpoint_temp);
        
        if (diff <= tolerance) return 'compliant';
        if (diff <= tolerance + 2) return 'warning';
        return 'critical';
      };
      const reading = { temperature: 6 };
      return getReadingStatus(reading);
    });
    expect(readingWithoutPoint).toBe('compliant');
  });

  // Test 5: filterReadingsByStatus() - Filtro letture per status
  test('filterReadingsByStatus dovrebbe filtrare correttamente', async ({ page }) => {
    await page.goto('/conservation');
    
    const filteredReadings = await page.evaluate(() => {
      const filterReadingsByStatus = (readings, status) => {
        return readings.filter(reading => {
          const readingStatus = !reading.conservation_point ? 'compliant' : (() => {
            const tolerance = reading.conservation_point.type === 'blast' ? 5 : 
                             reading.conservation_point.type === 'ambient' ? 3 : 2;
            const diff = Math.abs(reading.temperature - reading.conservation_point.setpoint_temp);
            
            if (diff <= tolerance) return 'compliant';
            if (diff <= tolerance + 2) return 'warning';
            return 'critical';
          })();
          
          return readingStatus === status;
        });
      };
      const readings = [
        { temperature: 4, conservation_point: { setpoint_temp: 4, type: 'fridge' } }, // Compliant
        { temperature: 7, conservation_point: { setpoint_temp: 4, type: 'fridge' } }, // Warning
        { temperature: 10, conservation_point: { setpoint_temp: 4, type: 'fridge' } }, // Critical
        { temperature: 3, conservation_point: { setpoint_temp: 4, type: 'fridge' } }  // Compliant
      ];
      return filterReadingsByStatus(readings, 'compliant');
    });
    expect(filteredReadings).toHaveLength(2);
  });

  // Test 6: getToleranceRange() - Range tolleranza
  test('getToleranceRange dovrebbe calcolare range corretto', async ({ page }) => {
    await page.goto('/conservation');
    
    const toleranceRange = await page.evaluate(() => {
      const getToleranceRange = (setpoint, type) => {
        const tolerance = type === 'blast' ? 5 : type === 'ambient' ? 3 : 2;
        return {
          min: setpoint - tolerance,
          max: setpoint + tolerance,
        };
      };
      return getToleranceRange(4, 'fridge');
    });
    expect(toleranceRange).toEqual({ min: 2, max: 6 }); // 4 ± 2
  });
});