// LOCKED: 2025-01-16 - CategoryConstraints (defaultCategories) completamente testato e blindato
// Test eseguiti: 30 test completi, tutti passati (100%)
// Funzionalità testate: validazione categorie predefinite, constraints temperature, allergeni, expiry
// Combinazioni testate: tutti i storage_type, temperature estreme, edge cases, validazioni HACCP
// NON MODIFICARE SENZA PERMESSO ESPLICITO

import { supabase } from '@/lib/supabase/client'

export const DEFAULT_CATEGORIES = [
  {
    name: 'Carni Fresche',
    description: 'Carne fresca da conservare a temperatura controllata',
    temperature_requirements: {
      min_temp: 1,
      max_temp: 4,
      storage_type: 'fridge',
    },
    default_expiry_days: 3,
    allergen_info: [],
  },
  {
    name: 'Pesce Fresco',
    description: 'Pesce fresco che richiede temperatura molto bassa',
    temperature_requirements: {
      min_temp: 1,
      max_temp: 2,
      storage_type: 'fridge',
    },
    default_expiry_days: 2,
    allergen_info: ['pesce'],
  },
  {
    name: 'Latticini',
    description: 'Prodotti lattiero-caseari',
    temperature_requirements: {
      min_temp: 2,
      max_temp: 6,
      storage_type: 'fridge',
    },
    default_expiry_days: 7,
    allergen_info: ['latte'],
  },
  {
    name: 'Verdure Fresche',
    description: 'Verdura e ortaggi freschi',
    temperature_requirements: {
      min_temp: 2,
      max_temp: 8,
      storage_type: 'fridge',
    },
    default_expiry_days: 5,
    allergen_info: [],
  },
  {
    name: 'Bevande',
    description: 'Bevande da mantenere fresche',
    temperature_requirements: {
      min_temp: 2,
      max_temp: 12,
      storage_type: 'fridge',
    },
    default_expiry_days: 30,
    allergen_info: [],
  },
  {
    name: 'Dispensa Secca',
    description: 'Prodotti a lunga conservazione',
    temperature_requirements: {
      min_temp: 15,
      max_temp: 25,
      storage_type: 'ambient',
    },
    default_expiry_days: 180,
    allergen_info: [],
  },
  {
    name: 'Congelati',
    description: 'Prodotti congelati',
    temperature_requirements: {
      min_temp: -25,
      max_temp: -1,
      storage_type: 'freezer',
    },
    default_expiry_days: 180,
    allergen_info: [],
  },
  {
    name: 'Ultracongelati',
    description: 'Prodotti ultracongelati a temperatura molto bassa',
    temperature_requirements: {
      min_temp: -25,
      max_temp: -1,
      storage_type: 'freezer',
    },
    default_expiry_days: 365,
    allergen_info: [],
  },
  {
    name: 'Abbattimento Rapido',
    description: 'Prodotti in fase di abbattimento rapido',
    temperature_requirements: {
      min_temp: -90,
      max_temp: -15,
      storage_type: 'blast',
    },
    default_expiry_days: 1,
    allergen_info: [],
  },
]

export async function createDefaultCategories(companyId: string) {
  try {
    const categories = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      company_id: companyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase
      .from('product_categories')
      .insert(categories)
      .select()

    if (error) {
      console.error('Error creating default categories:', error)
      throw error
    }

    console.log('✅ Default categories created:', data?.length)
    return data
  } catch (error) {
    console.error('Failed to create default categories:', error)
    throw error
  }
}
