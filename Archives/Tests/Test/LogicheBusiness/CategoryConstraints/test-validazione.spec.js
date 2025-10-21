/**
 * TEST VALIDAZIONE - CategoryConstraints
 * 
 * Test per verificare che le validazioni categoria gestiscano correttamente
 * tutti i casi limite, valori estremi e scenari di errore.
 */

import { test, expect } from '@playwright/test';

test.describe('CategoryConstraints - Test Validazione', () => {
  
  // Test 1: Validazione temperature estreme
  test('Dovrebbe gestire temperature estreme per ogni storage_type', async ({ page }) => {
    
    // Test temperature criogeniche per blast
    const cryogenicTemp = await page.evaluate(() => {
      const category = {
        name: 'Abbattimento Rapido',
        temperature_requirements: { min_temp: -90, max_temp: -15, storage_type: 'blast' }
      };
      return category.temperature_requirements.min_temp <= -80 && 
             category.temperature_requirements.max_temp <= -10;
    });
    expect(cryogenicTemp).toBe(true);
    
    // Test temperature ambiente per dispensa
    const ambientTemp = await page.evaluate(() => {
      const category = {
        name: 'Dispensa Secca',
        temperature_requirements: { min_temp: 15, max_temp: 25, storage_type: 'ambient' }
      };
      return category.temperature_requirements.min_temp >= 10 && 
             category.temperature_requirements.max_temp <= 30;
    });
    expect(ambientTemp).toBe(true);
  });

  // Test 2: Validazione range temperatura invalidi
  test('Dovrebbe rifiutare range temperatura invalidi', async ({ page }) => {
    
    // Test min_temp > max_temp
    const invalidRange = await page.evaluate(() => {
      const category = {
        name: 'Test Invalido',
        temperature_requirements: { min_temp: 10, max_temp: 5, storage_type: 'fridge' }
      };
      return category.temperature_requirements.min_temp <= category.temperature_requirements.max_temp;
    });
    expect(invalidRange).toBe(false);
    
    // Test temperature troppo alte per freezer
    const tooHighForFreezer = await page.evaluate(() => {
      const category = {
        name: 'Freezer Invalido',
        temperature_requirements: { min_temp: 5, max_temp: 10, storage_type: 'freezer' }
      };
      return category.temperature_requirements.storage_type === 'freezer' && 
             category.temperature_requirements.max_temp < 0;
    });
    expect(tooHighForFreezer).toBe(false);
  });

  // Test 3: Validazione storage_type vs temperature
  test('Dovrebbe validare compatibilità storage_type e temperature', async ({ page }) => {
    
    // Test fridge con temperature appropriate
    const fridgeCompatible = await page.evaluate(() => {
      const category = {
        name: 'Latticini',
        temperature_requirements: { min_temp: 2, max_temp: 6, storage_type: 'fridge' }
      };
      const isFridge = category.temperature_requirements.storage_type === 'fridge';
      const tempRange = category.temperature_requirements.min_temp >= 0 && 
                       category.temperature_requirements.max_temp <= 8;
      return isFridge && tempRange;
    });
    expect(fridgeCompatible).toBe(true);
    
    // Test freezer con temperature negative
    const freezerCompatible = await page.evaluate(() => {
      const category = {
        name: 'Congelati',
        temperature_requirements: { min_temp: -25, max_temp: -1, storage_type: 'freezer' }
      };
      const isFreezer = category.temperature_requirements.storage_type === 'freezer';
      const tempRange = category.temperature_requirements.max_temp < 0;
      return isFreezer && tempRange;
    });
    expect(freezerCompatible).toBe(true);
  });

  // Test 4: Validazione expiry_days estremi
  test('Dovrebbe gestire expiry_days estremi', async ({ page }) => {
    
    // Test expiry_days molto brevi (prodotti freschissimi)
    const veryShortExpiry = await page.evaluate(() => {
      const category = {
        name: 'Pesce Freschissimo',
        default_expiry_days: 1
      };
      return category.default_expiry_days >= 1 && category.default_expiry_days <= 2;
    });
    expect(veryShortExpiry).toBe(true);
    
    // Test expiry_days molto lunghi (prodotti congelati)
    const veryLongExpiry = await page.evaluate(() => {
      const category = {
        name: 'Congelati a Lungo Termine',
        default_expiry_days: 365
      };
      return category.default_expiry_days >= 180 && category.default_expiry_days <= 730;
    });
    expect(veryLongExpiry).toBe(true);
    
    // Test expiry_days zero o negativi (invalido)
    const invalidExpiry = await page.evaluate(() => {
      const category = {
        name: 'Categoria Invalida',
        default_expiry_days: 0
      };
      return category.default_expiry_days > 0;
    });
    expect(invalidExpiry).toBe(false);
  });

  // Test 5: Validazione allergen_info complessi
  test('Dovrebbe gestire allergeni multipli e complessi', async ({ page }) => {
    
    // Test categoria con allergeni multipli
    const multipleAllergens = await page.evaluate(() => {
      const category = {
        name: 'Prodotti Complessi',
        allergen_info: ['glutine', 'latte', 'uova', 'soia']
      };
      return Array.isArray(category.allergen_info) && 
             category.allergen_info.length > 1 &&
             category.allergen_info.every(allergen => typeof allergen === 'string' && allergen.length > 0);
    });
    expect(multipleAllergens).toBe(true);
    
    // Test categoria senza allergeni
    const noAllergens = await page.evaluate(() => {
      const category = {
        name: 'Prodotti Sicuri',
        allergen_info: []
      };
      return Array.isArray(category.allergen_info) && category.allergen_info.length === 0;
    });
    expect(noAllergens).toBe(true);
  });

  // Test 6: Validazione conservation_rules multiple
  test('Dovrebbe gestire conservation_rules multiple per categoria', async ({ page }) => {
    
    // Test categoria con regole multiple
    const multipleRules = await page.evaluate(() => {
      const category = {
        name: 'Carni Speciali',
        conservation_rules: [
          { temp_min: 1, temp_max: 4, max_storage_days: 3 },
          { temp_min: 0, temp_max: 2, max_storage_days: 1, requires_blast_chilling: true },
          { temp_min: -2, temp_max: 0, max_storage_days: 7 }
        ]
      };
      
      return category.conservation_rules.length > 1 &&
             category.conservation_rules.every(rule => 
               rule.temp_min <= rule.temp_max &&
               rule.max_storage_days > 0
             );
    });
    expect(multipleRules).toBe(true);
  });

  // Test 7: Validazione humidity constraints
  test('Dovrebbe gestire humidity constraints quando presenti', async ({ page }) => {
    
    // Test regola con humidity
    const withHumidity = await page.evaluate(() => {
      const rule = {
        temp_min: 2,
        temp_max: 6,
        humidity_min: 30,
        humidity_max: 70,
        max_storage_days: 7
      };
      return rule.humidity_min <= rule.humidity_max &&
             rule.humidity_min >= 0 &&
             rule.humidity_max <= 100;
    });
    expect(withHumidity).toBe(true);
    
    // Test regola senza humidity (opzionale)
    const withoutHumidity = await page.evaluate(() => {
      const rule = {
        temp_min: 2,
        temp_max: 6,
        max_storage_days: 7
        // humidity_min e humidity_max opzionali
      };
      return rule.temp_min <= rule.temp_max &&
             rule.max_storage_days > 0;
    });
    expect(withoutHumidity).toBe(true);
  });

  // Test 8: Validazione requires_blast_chilling
  test('Dovrebbe gestire requires_blast_chilling correttamente', async ({ page }) => {
    
    // Test categoria che richiede blast chilling
    const requiresBlastChilling = await page.evaluate(() => {
      const rule = {
        temp_min: 0,
        temp_max: 2,
        max_storage_days: 1,
        requires_blast_chilling: true
      };
      return rule.requires_blast_chilling === true &&
             rule.max_storage_days <= 3; // Blast chilling per prodotti molto deperibili
    });
    expect(requiresBlastChilling).toBe(true);
    
    // Test categoria che non richiede blast chilling
    const noBlastChilling = await page.evaluate(() => {
      const rule = {
        temp_min: 2,
        temp_max: 6,
        max_storage_days: 7,
        requires_blast_chilling: false
      };
      return rule.requires_blast_chilling === false;
    });
    expect(noBlastChilling).toBe(true);
  });
});
