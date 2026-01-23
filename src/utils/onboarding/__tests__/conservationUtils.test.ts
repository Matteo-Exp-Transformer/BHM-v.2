import { describe, test, expect } from 'vitest'
import {
  areTemperatureRangesCompatible,
  isStorageTypeCompatible,
  getCompatibleCategoriesByPointType,
} from '../conservationUtils'

describe('areTemperatureRangesCompatible', () => {
  test('overlapping ranges: 1-8°C and 1-4°C', () => {
    expect(
      areTemperatureRangesCompatible({ min: 1, max: 8 }, { min: 1, max: 4 })
    ).toBe(true)
  })

  test('boundary touch (no overlap): 1-8°C and 8-25°C', () => {
    expect(
      areTemperatureRangesCompatible({ min: 1, max: 8 }, { min: 8, max: 25 })
    ).toBe(false) // Touch at 8°C but no strict overlap
  })

  test('completely disjoint: 1-8°C and -25 to -18°C', () => {
    expect(
      areTemperatureRangesCompatible({ min: 1, max: 8 }, { min: -25, max: -18 })
    ).toBe(false)
  })

  test('null range (ambient): always compatible', () => {
    expect(
      areTemperatureRangesCompatible({ min: null, max: null }, { min: 1, max: 4 })
    ).toBe(true)
  })

  test('category range contains point range', () => {
    expect(
      areTemperatureRangesCompatible({ min: 2, max: 8 }, { min: 0, max: 10 })
    ).toBe(true)
  })

  test('point range contains category range', () => {
    expect(
      areTemperatureRangesCompatible({ min: 0, max: 10 }, { min: 2, max: 8 })
    ).toBe(true)
  })

  test('ranges touch at lower boundary: 1°C', () => {
    expect(
      areTemperatureRangesCompatible({ min: 1, max: 8 }, { min: -25, max: 1 })
    ).toBe(false) // Touch at 1°C but no strict overlap
  })

  test('ranges do not touch: gap between 0°C and 1°C', () => {
    expect(
      areTemperatureRangesCompatible({ min: 1, max: 8 }, { min: -25, max: 0 })
    ).toBe(false) // Gap: 0°C to 1°C
  })
})

describe('isStorageTypeCompatible', () => {
  test('fridge accepts fridge categories', () => {
    expect(isStorageTypeCompatible('fridge', 'fridge')).toBe(true)
  })

  test('fridge accepts ambient categories', () => {
    expect(isStorageTypeCompatible('ambient', 'fridge')).toBe(true)
  })

  test('fridge rejects freezer categories', () => {
    expect(isStorageTypeCompatible('freezer', 'fridge')).toBe(false)
  })

  test('freezer only accepts freezer', () => {
    expect(isStorageTypeCompatible('freezer', 'freezer')).toBe(true)
    expect(isStorageTypeCompatible('fridge', 'freezer')).toBe(false)
    expect(isStorageTypeCompatible('ambient', 'freezer')).toBe(false)
  })

  test('blast only accepts blast', () => {
    expect(isStorageTypeCompatible('blast', 'blast')).toBe(true)
    expect(isStorageTypeCompatible('fridge', 'blast')).toBe(false)
    expect(isStorageTypeCompatible('freezer', 'blast')).toBe(false)
  })

  test('ambient only accepts ambient', () => {
    expect(isStorageTypeCompatible('ambient', 'ambient')).toBe(true)
    expect(isStorageTypeCompatible('fridge', 'ambient')).toBe(false)
    expect(isStorageTypeCompatible('freezer', 'ambient')).toBe(false)
  })

  test('fridge rejects blast', () => {
    expect(isStorageTypeCompatible('blast', 'fridge')).toBe(false)
  })
})

describe('getCompatibleCategoriesByPointType', () => {
  const mockCategories = [
    {
      name: 'Carni Fresche',
      temperature_requirements: {
        min_temp: 1,
        max_temp: 4,
        storage_type: 'fridge',
      },
    },
    {
      name: 'Latticini',
      temperature_requirements: {
        min_temp: 2,
        max_temp: 6,
        storage_type: 'fridge',
      },
    },
    {
      name: 'Congelati',
      temperature_requirements: {
        min_temp: -25,
        max_temp: -1,
        storage_type: 'freezer',
      },
    },
    {
      name: 'Dispensa Secca',
      temperature_requirements: {
        min_temp: 15,
        max_temp: 25,
        storage_type: 'ambient',
      },
    },
    {
      name: 'Categoria Generica',
      // No temperature_requirements
    },
  ]

  test('fridge: shows only fridge-compatible categories', () => {
    const result = getCompatibleCategoriesByPointType('fridge', mockCategories)
    const names = result.map(c => c.name)

    expect(names).toContain('Carni Fresche')
    expect(names).toContain('Latticini')
    expect(names).toContain('Categoria Generica') // No requirements
    expect(names).not.toContain('Dispensa Secca') // Range 15-25°C does not overlap with fridge 1-8°C
    expect(names).not.toContain('Congelati') // Wrong storage_type
  })

  test('freezer: shows only freezer-compatible categories', () => {
    const result = getCompatibleCategoriesByPointType('freezer', mockCategories)
    const names = result.map(c => c.name)

    expect(names).toContain('Congelati')
    expect(names).toContain('Categoria Generica')
    expect(names).not.toContain('Carni Fresche')
    expect(names).not.toContain('Latticini')
    expect(names).not.toContain('Dispensa Secca')
  })

  test('ambient: shows only ambient categories', () => {
    const result = getCompatibleCategoriesByPointType('ambient', mockCategories)
    const names = result.map(c => c.name)

    expect(names).toContain('Dispensa Secca')
    expect(names).toContain('Categoria Generica')
    expect(names).not.toContain('Carni Fresche')
    expect(names).not.toContain('Congelati')
  })

  test('blast: accepts only blast categories', () => {
    const categoriesWithBlast = [
      ...mockCategories,
      {
        name: 'Prodotti Abbattuti',
        temperature_requirements: {
          min_temp: -40,
          max_temp: -20,
          storage_type: 'blast',
        },
      },
    ]

    const result = getCompatibleCategoriesByPointType('blast', categoriesWithBlast)
    const names = result.map(c => c.name)

    expect(names).toContain('Prodotti Abbattuti')
    expect(names).toContain('Categoria Generica')
    expect(names).not.toContain('Carni Fresche')
    expect(names).not.toContain('Congelati')
  })

  test('fridge: excludes "Abbattimento Rapido" (blast storage_type)', () => {
    const categoriesWithAbbattimento = [
      ...mockCategories,
      {
        name: 'Abbattimento Rapido',
        temperature_requirements: {
          min_temp: -40,
          max_temp: -15,
          storage_type: 'blast',
        },
      },
    ]

    const result = getCompatibleCategoriesByPointType('fridge', categoriesWithAbbattimento)
    const names = result.map(c => c.name)

    expect(names).toContain('Carni Fresche')
    expect(names).toContain('Latticini')
    expect(names).not.toContain('Abbattimento Rapido') // Should be excluded - blast is not compatible with fridge
    expect(names).not.toContain('Congelati')
  })

  test('empty categories array returns empty', () => {
    const result = getCompatibleCategoriesByPointType('fridge', [])
    expect(result).toEqual([])
  })

  test('categories without storage_type: only range checked', () => {
    const categories = [
      {
        name: 'Test',
        temperature_requirements: {
          min_temp: 2,
          max_temp: 8,
          storage_type: '', // Missing storage_type (empty string is falsy)
        },
      },
    ]

    const result = getCompatibleCategoriesByPointType('fridge', categories)
    // Should pass range check (2-8°C overlaps with fridge 1-8°C)
    // storage_type check is skipped because '' is falsy
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Test')
  })

  test('category with partial range overlap', () => {
    const categories = [
      {
        name: 'Verdure Fresche',
        temperature_requirements: {
          min_temp: 4,
          max_temp: 8,
          storage_type: 'fridge',
        },
      },
    ]

    const result = getCompatibleCategoriesByPointType('fridge', categories)
    const names = result.map(c => c.name)

    // Range 4-8°C overlaps with fridge 1-8°C (overlap: 4-8°C)
    expect(names).toContain('Verdure Fresche')
  })

  test('ambient point type accepts fridge categories with ambient storage_type', () => {
    const categories = [
      {
        name: 'Bevande Ambiente',
        temperature_requirements: {
          min_temp: 15,
          max_temp: 20,
          storage_type: 'ambient',
        },
      },
      {
        name: 'Carni Fresche',
        temperature_requirements: {
          min_temp: 1,
          max_temp: 4,
          storage_type: 'fridge',
        },
      },
    ]

    const result = getCompatibleCategoriesByPointType('ambient', categories)
    const names = result.map(c => c.name)

    // Ambient only accepts storage_type 'ambient', ignores temperature range
    expect(names).toContain('Bevande Ambiente')
    expect(names).not.toContain('Carni Fresche')
  })

  test('fridge can accept ambient-type products (fridge accepts ambient)', () => {
    const categories = [
      {
        name: 'Bevande da Refrigerare',
        temperature_requirements: {
          min_temp: 2,
          max_temp: 8,
          storage_type: 'ambient', // Ambient products can go in fridge
        },
      },
    ]

    const result = getCompatibleCategoriesByPointType('fridge', categories)
    const names = result.map(c => c.name)

    // Fridge accepts 'ambient' storage_type and range overlaps (2-8°C ⊆ 1-8°C)
    expect(names).toContain('Bevande da Refrigerare')
  })

  test('exact boundary match: fridge 1-8°C and category 8-25°C', () => {
    const categories = [
      {
        name: 'Prodotto Limite',
        temperature_requirements: {
          min_temp: 15,
          max_temp: 25,
          storage_type: 'fridge',
        },
      },
    ]

    const result = getCompatibleCategoriesByPointType('fridge', categories)
    const names = result.map(c => c.name)

    // Ranges do not overlap (15-25°C vs 1-8°C) - no strict overlap
    expect(names).not.toContain('Prodotto Limite')
  })
})
