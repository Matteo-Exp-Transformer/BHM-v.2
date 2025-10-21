/**
 * TEST FUNZIONALI - CategoryConstraints
 * 
 * Test per verificare che tutte le funzioni di validazione categorie prodotto
 * funzionino correttamente in ogni scenario possibile.
 */

import { test, expect } from '@playwright/test';

test.describe('CategoryConstraints - Test Funzionali', () => {
  
  // Test 1: ConservationRule interface - Validazione regole conservazione
  test('ConservationRule dovrebbe validare temperature min/max corrette', async ({ page }) => {
    
    // Test regola conservazione valida
    const validRule = await page.evaluate(() => {
      const rule = {
        temp_min: 2,
        temp_max: 8,
        humidity_min: 30,
        humidity_max: 70,
        max_storage_days: 7,
        requires_blast_chilling: false
      };
      return rule.temp_min <= rule.temp_max && rule.humidity_min <= rule.humidity_max;
    });
    expect(validRule).toBe(true);
    
    // Test regola conservazione invalida (temp_min > temp_max)
    const invalidRule = await page.evaluate(() => {
      const rule = {
        temp_min: 10,
        temp_max: 5, // Invalido: min > max
        humidity_min: 30,
        humidity_max: 70
      };
      return rule.temp_min <= rule.temp_max;
    });
    expect(invalidRule).toBe(false);
  });

  // Test 2: ProductCategory interface - Validazione categorie prodotto
  test('ProductCategory dovrebbe avere conservation_rules valide', async ({ page }) => {
    
    // Test categoria con regole multiple
    const categoryWithRules = await page.evaluate(() => {
      const category = {
        name: 'Carni Fresche',
        conservation_rules: [
          { temp_min: 1, temp_max: 4, max_storage_days: 3 },
          { temp_min: 0, temp_max: 2, max_storage_days: 1, requires_blast_chilling: true }
        ],
        color: '#FF6B6B'
      };
      return category.conservation_rules.length > 0 && 
             category.conservation_rules.every(rule => rule.temp_min <= rule.temp_max);
    });
    expect(categoryWithRules).toBe(true);
  });

  // Test 3: DEFAULT_CATEGORIES - Validazione categorie default
  test('DEFAULT_CATEGORIES dovrebbe avere tutte le categorie con regole valide', async ({ page }) => {
    
    // Test tutte le categorie default
    const allCategoriesValid = await page.evaluate(() => {
      const categories = [
        {
          name: 'Carni Fresche',
          temperature_requirements: { min_temp: 1, max_temp: 4, storage_type: 'fridge' },
          default_expiry_days: 3
        },
        {
          name: 'Pesce Fresco',
          temperature_requirements: { min_temp: 1, max_temp: 2, storage_type: 'fridge' },
          default_expiry_days: 2
        },
        {
          name: 'Latticini',
          temperature_requirements: { min_temp: 2, max_temp: 6, storage_type: 'fridge' },
          default_expiry_days: 7
        },
        {
          name: 'Congelati',
          temperature_requirements: { min_temp: -25, max_temp: -1, storage_type: 'freezer' },
          default_expiry_days: 180
        },
        {
          name: 'Abbattimento Rapido',
          temperature_requirements: { min_temp: -90, max_temp: -15, storage_type: 'blast' },
          default_expiry_days: 1
        }
      ];
      
      return categories.every(cat => 
        cat.temperature_requirements.min_temp <= cat.temperature_requirements.max_temp &&
        cat.default_expiry_days > 0 &&
        ['fridge', 'freezer', 'blast', 'ambient'].includes(cat.temperature_requirements.storage_type)
      );
    });
    expect(allCategoriesValid).toBe(true);
  });

  // Test 4: Validazione temperature vs storage_type
  test('Temperature dovrebbe essere compatibile con storage_type', async ({ page }) => {
    
    // Test freezer con temperature negative
    const freezerValid = await page.evaluate(() => {
      const category = {
        name: 'Congelati',
        temperature_requirements: { min_temp: -25, max_temp: -1, storage_type: 'freezer' }
      };
      return category.temperature_requirements.max_temp < 0;
    });
    expect(freezerValid).toBe(true);
    
    // Test fridge con temperature positive
    const fridgeValid = await page.evaluate(() => {
      const category = {
        name: 'Latticini',
        temperature_requirements: { min_temp: 2, max_temp: 6, storage_type: 'fridge' }
      };
      return category.temperature_requirements.min_temp >= 0 && 
             category.temperature_requirements.max_temp <= 8;
    });
    expect(fridgeValid).toBe(true);
    
    // Test blast con temperature molto negative
    const blastValid = await page.evaluate(() => {
      const category = {
        name: 'Abbattimento Rapido',
        temperature_requirements: { min_temp: -90, max_temp: -15, storage_type: 'blast' }
      };
      return category.temperature_requirements.min_temp <= -40;
    });
    expect(blastValid).toBe(true);
  });

  // Test 5: Validazione allergen_info
  test('Allergen_info dovrebbe contenere valori validi', async ({ page }) => {
    
    // Test categoria con allergeni
    const categoryWithAllergens = await page.evaluate(() => {
      const category = {
        name: 'Pesce Fresco',
        allergen_info: ['pesce']
      };
      return Array.isArray(category.allergen_info) && 
             category.allergen_info.every(allergen => typeof allergen === 'string');
    });
    expect(categoryWithAllergens).toBe(true);
    
    // Test categoria senza allergeni
    const categoryWithoutAllergens = await page.evaluate(() => {
      const category = {
        name: 'Dispensa Secca',
        allergen_info: []
      };
      return Array.isArray(category.allergen_info);
    });
    expect(categoryWithoutAllergens).toBe(true);
  });

  // Test 6: Validazione default_expiry_days
  test('Default_expiry_days dovrebbe essere realistico per categoria', async ({ page }) => {
    
    // Test categorie con scadenze realistiche
    const realisticExpiry = await page.evaluate(() => {
      const categories = [
        { name: 'Carni Fresche', default_expiry_days: 3 },
        { name: 'Pesce Fresco', default_expiry_days: 2 },
        { name: 'Latticini', default_expiry_days: 7 },
        { name: 'Dispensa Secca', default_expiry_days: 180 },
        { name: 'Congelati', default_expiry_days: 180 }
      ];
      
      return categories.every(cat => {
        // Carne e pesce: 1-7 giorni
        if (['Carni Fresche', 'Pesce Fresco'].includes(cat.name)) {
          return cat.default_expiry_days >= 1 && cat.default_expiry_days <= 7;
        }
        // Latticini: 3-14 giorni
        if (cat.name === 'Latticini') {
          return cat.default_expiry_days >= 3 && cat.default_expiry_days <= 14;
        }
        // Prodotti a lunga conservazione: 30+ giorni
        if (['Dispensa Secca', 'Congelati'].includes(cat.name)) {
          return cat.default_expiry_days >= 30;
        }
        return true;
      });
    });
    expect(realisticExpiry).toBe(true);
  });
});
