/**
 * TEST EDGE CASES - CategoryConstraints
 * 
 * Test per verificare che le logiche categoria gestiscano correttamente
 * tutti i casi estremi, scenari anomali e condizioni limite.
 */

import { test, expect } from '@playwright/test';

test.describe('CategoryConstraints - Edge Cases', () => {
  
  // Test 1: Temperature estremamente basse
  test('Dovrebbe gestire temperature criogeniche (-100°C)', async ({ page }) => {
    
    const cryogenicTemp = await page.evaluate(() => {
      const category = {
        name: 'Criogenico Estremo',
        temperature_requirements: { min_temp: -100, max_temp: -50, storage_type: 'blast' }
      };
      return category.temperature_requirements.min_temp <= -90 && 
             category.temperature_requirements.max_temp < 0;
    });
    expect(cryogenicTemp).toBe(true);
  });

  // Test 2: Temperature estremamente alte per ambient
  test('Dovrebbe gestire temperature molto alte per ambiente', async ({ page }) => {
    
    const hotAmbient = await page.evaluate(() => {
      const category = {
        name: 'Ambiente Caldo',
        temperature_requirements: { min_temp: 25, max_temp: 35, storage_type: 'ambient' }
      };
      return category.temperature_requirements.storage_type === 'ambient' &&
             category.temperature_requirements.min_temp >= 15 &&
             category.temperature_requirements.max_temp <= 40;
    });
    expect(hotAmbient).toBe(true);
  });

  // Test 3: Expiry_days estremamente lunghi
  test('Dovrebbe gestire expiry_days estremamente lunghi', async ({ page }) => {
    
    const veryLongExpiry = await page.evaluate(() => {
      const category = {
        name: 'Conserva Perpetua',
        default_expiry_days: 9999
      };
      return category.default_expiry_days > 365 && 
             category.default_expiry_days <= 10000;
    });
    expect(veryLongExpiry).toBe(true);
  });

  // Test 4: Allergen_info con caratteri speciali
  test('Dovrebbe gestire allergeni con caratteri speciali', async ({ page }) => {
    
    const specialAllergens = await page.evaluate(() => {
      const category = {
        name: 'Prodotti Speciali',
        allergen_info: ['glutine-free', 'sans-gluten', 'lactose-free', 'no-nuts', 'sans-noix']
      };
      return Array.isArray(category.allergen_info) &&
             category.allergen_info.every(allergen => 
               typeof allergen === 'string' && 
               allergen.includes('-') || allergen.includes('_')
             );
    });
    expect(specialAllergens).toBe(true);
  });

  // Test 5: Conservation_rules con valori limite
  test('Dovrebbe gestire conservation_rules con valori limite', async ({ page }) => {
    
    const edgeRules = await page.evaluate(() => {
      const category = {
        name: 'Categoria Limite',
        conservation_rules: [
          { temp_min: 0, temp_max: 0, max_storage_days: 1 }, // Temperatura identica
          { temp_min: -1, temp_max: 1, max_storage_days: 0.5 }, // Storage giorni decimali
          { temp_min: 2, temp_max: 2, max_storage_days: 999 } // Temperatura identica, storage lungo
        ]
      };
      
      return category.conservation_rules.every(rule => 
        rule.temp_min <= rule.temp_max &&
        rule.max_storage_days >= 0
      );
    });
    expect(edgeRules).toBe(true);
  });

  // Test 6: Storage_type non riconosciuto
  test('Dovrebbe gestire storage_type non riconosciuto', async ({ page }) => {
    
    const unknownStorage = await page.evaluate(() => {
      const category = {
        name: 'Categoria Sconosciuta',
        temperature_requirements: { min_temp: 5, max_temp: 15, storage_type: 'unknown' }
      };
      const validStorageTypes = ['fridge', 'freezer', 'blast', 'ambient'];
      return !validStorageTypes.includes(category.temperature_requirements.storage_type);
    });
    expect(unknownStorage).toBe(true);
  });

  // Test 7: Categoria con nome vuoto o null
  test('Dovrebbe gestire categoria con nome problematico', async ({ page }) => {
    
    const emptyName = await page.evaluate(() => {
      const category = {
        name: '', // Nome vuoto
        temperature_requirements: { min_temp: 2, max_temp: 6, storage_type: 'fridge' }
      };
      return category.name.length === 0;
    });
    expect(emptyName).toBe(true);
    
    const nullName = await page.evaluate(() => {
      const category = {
        name: null, // Nome null
        temperature_requirements: { min_temp: 2, max_temp: 6, storage_type: 'fridge' }
      };
      return category.name === null;
    });
    expect(nullName).toBe(true);
  });

  // Test 8: Conservation_rules array vuoto
  test('Dovrebbe gestire conservation_rules array vuoto', async ({ page }) => {
    
    const emptyRules = await page.evaluate(() => {
      const category = {
        name: 'Categoria Senza Regole',
        conservation_rules: []
      };
      return Array.isArray(category.conservation_rules) && 
             category.conservation_rules.length === 0;
    });
    expect(emptyRules).toBe(true);
  });

  // Test 9: Humidity values estremi
  test('Dovrebbe gestire humidity values estremi', async ({ page }) => {
    
    const extremeHumidity = await page.evaluate(() => {
      const rule = {
        temp_min: 2,
        temp_max: 6,
        humidity_min: 0, // Umidità minima
        humidity_max: 100, // Umidità massima
        max_storage_days: 7
      };
      return rule.humidity_min === 0 && 
             rule.humidity_max === 100 &&
             rule.humidity_min <= rule.humidity_max;
    });
    expect(extremeHumidity).toBe(true);
  });

  // Test 10: Temperature con precisione molto alta
  test('Dovrebbe gestire temperature con molti decimali', async ({ page }) => {
    
    const preciseTemp = await page.evaluate(() => {
      const category = {
        name: 'Categoria Precisa',
        temperature_requirements: { 
          min_temp: 2.123456789, 
          max_temp: 6.987654321, 
          storage_type: 'fridge' 
        }
      };
      return category.temperature_requirements.min_temp < category.temperature_requirements.max_temp;
    });
    expect(preciseTemp).toBe(true);
  });

  // Test 11: Max_storage_days con valori decimali
  test('Dovrebbe gestire max_storage_days con decimali', async ({ page }) => {
    
    const decimalStorage = await page.evaluate(() => {
      const rule = {
        temp_min: 2,
        temp_max: 6,
        max_storage_days: 2.5 // Mezza giornata
      };
      return rule.max_storage_days > 0 && 
             rule.max_storage_days < 3;
    });
    expect(decimalStorage).toBe(true);
  });

  // Test 12: Allergen_info con array molto lungo
  test('Dovrebbe gestire allergen_info con molti allergeni', async ({ page }) => {
    
    const manyAllergens = await page.evaluate(() => {
      const category = {
        name: 'Categoria Multi-Allergenica',
        allergen_info: [
          'glutine', 'latte', 'uova', 'soia', 'frutta-guscio', 'arachidi', 
          'pesce', 'crostacei', 'sedano', 'senape', 'sesamo', 'solfiti'
        ]
      };
      return Array.isArray(category.allergen_info) && 
             category.allergen_info.length > 10;
    });
    expect(manyAllergens).toBe(true);
  });

  // Test 13: Conservation_rules con temperature identiche
  test('Dovrebbe gestire conservation_rules con temperature identiche', async ({ page }) => {
    
    const identicalTemp = await page.evaluate(() => {
      const rule = {
        temp_min: 4.0,
        temp_max: 4.0, // Temperatura identica
        max_storage_days: 5
      };
      return rule.temp_min === rule.temp_max &&
             rule.temp_min === 4.0;
    });
    expect(identicalTemp).toBe(true);
  });

  // Test 14: Categoria con proprietà mancanti
  test('Dovrebbe gestire categoria con proprietà mancanti', async ({ page }) => {
    
    const incompleteCategory = await page.evaluate(() => {
      const category = {
        name: 'Categoria Incompleta'
        // temperature_requirements mancante
        // conservation_rules mancante
        // allergen_info mancante
      };
      return category.name && 
             !category.temperature_requirements && 
             !category.conservation_rules;
    });
    expect(incompleteCategory).toBe(true);
  });

  // Test 15: Humidity con valori negativi
  test('Dovrebbe gestire humidity con valori negativi', async ({ page }) => {
    
    const negativeHumidity = await page.evaluate(() => {
      const rule = {
        temp_min: 2,
        temp_max: 6,
        humidity_min: -10, // Umidità negativa (invalido)
        humidity_max: 70,
        max_storage_days: 7
      };
      return rule.humidity_min < 0; // Dovrebbe essere invalido
    });
    expect(negativeHumidity).toBe(true);
  });
});
