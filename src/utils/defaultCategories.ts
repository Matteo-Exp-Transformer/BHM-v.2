import { supabase } from '@/lib/supabase/client'

export const DEFAULT_CATEGORIES = [
  {
    name: 'Preparazioni/Pronti/Cotti (RTE)',
    description: 'Preparazioni pronte, cibi cotti e pronti al consumo',
    temperature_requirements: {
      min_temp: 0,
      max_temp: 4,
      storage_type: 'fridge',
    },
    default_expiry_days: 3,
    allergen_info: [],
  },
  {
    name: 'Latticini',
    description: 'Latticini (latte, yogurt, formaggi)',
    temperature_requirements: {
      min_temp: 2,
      max_temp: 6,
      storage_type: 'fridge',
    },
    default_expiry_days: 7,
    allergen_info: ['latte'],
  },
  {
    name: 'Uova - Ovoprodotti',
    description: 'Uova in contenitore dedicato',
    temperature_requirements: {
      min_temp: 2,
      max_temp: 6,
      storage_type: 'fridge',
    },
    default_expiry_days: 28,
    allergen_info: ['uova'],
  },
  {
    name: 'Salumi e affettati',
    description: 'Salumi e affettati',
    temperature_requirements: {
      min_temp: 0,
      max_temp: 4,
      storage_type: 'fridge',
    },
    default_expiry_days: 5,
    allergen_info: [],
  },
  {
    name: 'Verdure e ortofrutta',
    description: 'Verdure e ortofrutta fresche',
    temperature_requirements: {
      min_temp: 2,
      max_temp: 8,
      storage_type: 'fridge',
    },
    default_expiry_days: 5,
    allergen_info: [],
  },
  {
    name: 'Erbe aromatiche fresche',
    description: 'Erbe aromatiche fresche',
    temperature_requirements: {
      min_temp: 2,
      max_temp: 8,
      storage_type: 'fridge',
    },
    default_expiry_days: 7,
    allergen_info: [],
  },
  {
    name: 'Carni crude',
    description: 'Carni crude',
    temperature_requirements: {
      min_temp: 0,
      max_temp: 4,
      storage_type: 'fridge',
    },
    default_expiry_days: 3,
    allergen_info: [],
  },
  {
    name: 'Pesce e frutti di mare crudi',
    description: 'Pesce e frutti di mare crudi',
    temperature_requirements: {
      min_temp: 0,
      max_temp: 2,
      storage_type: 'fridge',
    },
    default_expiry_days: 2,
    allergen_info: ['pesce'],
  },
  {
    name: 'Salse/condimenti',
    description: 'Salse e condimenti (solo chiusi o contenitori chiusi)',
    temperature_requirements: {
      min_temp: 2,
      max_temp: 8,
      storage_type: 'fridge',
    },
    default_expiry_days: 30,
    allergen_info: [],
  },
  {
    name: 'Bevande',
    description: 'Bevande (chiuse/tappate)',
    temperature_requirements: {
      min_temp: 2,
      max_temp: 12,
      storage_type: 'fridge',
    },
    default_expiry_days: 30,
    allergen_info: [],
  },
  {
    name: 'Conserve/semiconserve',
    description: 'Conserve e semiconserve (chiuse)',
    temperature_requirements: {
      min_temp: 15,
      max_temp: 25,
      storage_type: 'ambient',
    },
    default_expiry_days: 365,
    allergen_info: [],
  },
  {
    name: 'Dispensa (T° Ambiente)',
    description: 'Pasta, Farine, Spezie, Condimenti, legumi, Frutta secca',
    temperature_requirements: {
      min_temp: 10,
      max_temp: 25,
      storage_type: 'ambient',
    },
    default_expiry_days: 365,
    allergen_info: [],
  },
  {
    name: 'Congelati: preparazioni',
    description: 'Congelati: preparazioni porzionate / basi',
    temperature_requirements: {
      min_temp: -25,
      max_temp: -18,
      storage_type: 'freezer',
    },
    default_expiry_days: 180,
    allergen_info: [],
  },
  {
    name: 'Congelati: vegetali',
    description: 'Congelati: vegetali',
    temperature_requirements: {
      min_temp: -25,
      max_temp: -18,
      storage_type: 'freezer',
    },
    default_expiry_days: 180,
    allergen_info: [],
  },
  {
    name: 'Congelati: carni e pesce',
    description: 'Congelati: carni e pesce (separati)',
    temperature_requirements: {
      min_temp: -25,
      max_temp: -18,
      storage_type: 'freezer',
    },
    default_expiry_days: 365,
    allergen_info: ['pesce'],
  },
  {
    name: 'Congelati: Dolci',
    description: 'Congelati: Dolci',
    temperature_requirements: {
      min_temp: -25,
      max_temp: -18,
      storage_type: 'freezer',
    },
    default_expiry_days: 180,
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
