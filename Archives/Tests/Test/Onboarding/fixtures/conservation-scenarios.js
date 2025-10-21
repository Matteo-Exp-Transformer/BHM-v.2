/**
 * FIXTURES: Conservation Scenarios per Test ConservationStep
 *
 * Contiene scenari di configurazione punti conservazione con validazioni temperature
 * Basato su logica: temperatura punto DEVE essere dentro range min-max categoria prodotto
 */

// ============= CONSERVATION POINT TYPES =============

export const POINT_TYPES = {
  ambient: {
    value: 'ambient',
    label: 'Ambiente (dispense)',
    temperatureRange: { min: null, max: null }, // NO temperatura
    canSetTemperature: false,
  },
  fridge: {
    value: 'fridge',
    label: 'Frigorifero',
    temperatureRange: { min: 1, max: 15 },
    canSetTemperature: true,
  },
  freezer: {
    value: 'freezer',
    label: 'Congelatore',
    temperatureRange: { min: -25, max: -1 },
    canSetTemperature: true,
  },
  blast: {
    value: 'blast',
    label: 'Abbattitore',
    temperatureRange: { min: -90, max: -15 },
    canSetTemperature: true,
  },
}

// ============= PRODUCT CATEGORIES =============

export const PRODUCT_CATEGORIES = {
  fresh_meat: {
    id: 'fresh_meat',
    label: 'Carni fresche',
    range: { min: 1, max: 4 },
    compatibleTypes: ['fridge'],
    incompatibleTypes: ['ambient', 'blast'],
  },
  fresh_fish: {
    id: 'fresh_fish',
    label: 'Pesce fresco',
    range: { min: 1, max: 2 },
    compatibleTypes: ['fridge'],
    incompatibleTypes: ['ambient', 'blast'],
  },
  fresh_dairy: {
    id: 'fresh_dairy',
    label: 'Latticini',
    range: { min: 2, max: 6 },
    compatibleTypes: ['fridge'],
    incompatibleTypes: ['ambient'],
  },
  fresh_produce: {
    id: 'fresh_produce',
    label: 'Verdure fresche',
    range: { min: 2, max: 8 },
    compatibleTypes: ['fridge'],
    incompatibleTypes: ['ambient'],
  },
  beverages: {
    id: 'beverages',
    label: 'Bevande',
    range: { min: 2, max: 12 },
    compatibleTypes: ['fridge'],
    incompatibleTypes: [],
  },
  dry_goods: {
    id: 'dry_goods',
    label: 'Dispensa secca',
    range: { min: 15, max: 25 },
    compatibleTypes: ['ambient'],
    incompatibleTypes: ['fridge', 'freezer', 'blast'],
  },
  frozen: {
    id: 'frozen',
    label: 'Congelati',
    range: { min: -25, max: -1 },
    compatibleTypes: ['freezer'],
    incompatibleTypes: ['ambient', 'fridge', 'blast'],
  },
  deep_frozen: {
    id: 'deep_frozen',
    label: 'Ultracongelati',
    range: { min: -25, max: -1 },
    compatibleTypes: ['freezer'],
    incompatibleTypes: ['ambient', 'fridge', 'blast'],
  },
  blast_chilling: {
    id: 'blast_chilling',
    label: 'Abbattimento rapido',
    range: { min: -90, max: -15 },
    compatibleTypes: ['blast'],
    incompatibleTypes: ['ambient', 'fridge', 'freezer'],
  },
}

// ============= SCENARI VALIDI =============

export const validConservationScenarios = {
  // Scenario 1: Frigorifero per carni fresche
  fridgeMeat: {
    name: 'Frigo Carni',
    pointType: 'fridge',
    targetTemperature: 2, // Dentro range carni (1-4°C)
    productCategories: ['fresh_meat'],
    expectedValid: true,
  },

  // Scenario 2: Frigorifero per latticini
  fridgeDairy: {
    name: 'Frigo Latticini',
    pointType: 'fridge',
    targetTemperature: 4, // Dentro range latticini (2-6°C)
    productCategories: ['fresh_dairy'],
    expectedValid: true,
  },

  // Scenario 3: Frigorifero multi-categoria (temp compatibile con tutte)
  fridgeMulti: {
    name: 'Frigo Multi-prodotti',
    pointType: 'fridge',
    targetTemperature: 4, // OK per carni (1-4), latticini (2-6), pesce (1-2)? NO pesce!
    productCategories: ['fresh_meat', 'fresh_dairy'],
    expectedValid: true,
  },

  // Scenario 4: Congelatore per prodotti frozen
  freezerStandard: {
    name: 'Freezer A',
    pointType: 'freezer',
    targetTemperature: -18, // Dentro range frozen (-25 a -1)
    productCategories: ['frozen', 'deep_frozen'],
    expectedValid: true,
  },

  // Scenario 5: Abbattitore
  blastChiller: {
    name: 'Abbattitore Rapido',
    pointType: 'blast',
    targetTemperature: -40, // Dentro range blast (-90 a -15)
    productCategories: ['blast_chilling'],
    expectedValid: true,
  },

  // Scenario 6: Dispensa secca (NO temperatura)
  ambientDry: {
    name: 'Dispensa A',
    pointType: 'ambient',
    targetTemperature: null, // Ambient NON ha temperatura
    productCategories: ['dry_goods'],
    expectedValid: true,
  },
}

// ============= SCENARI INVALIDI - TEMPERATURA FUORI RANGE =============

export const invalidTemperatureScenarios = {
  // Temp troppo alta per carni fresche
  meatTooWarm: {
    name: 'Frigo Carni (troppo caldo)',
    pointType: 'fridge',
    targetTemperature: 8, // FUORI range carni (1-4°C)
    productCategories: ['fresh_meat'],
    expectedValid: false,
    expectedError: 'La temperatura non rientra nei range HACCP delle categorie selezionate',
  },

  // Temp troppo bassa per carni fresche
  meatTooCold: {
    name: 'Frigo Carni (troppo freddo)',
    pointType: 'fridge',
    targetTemperature: 0, // FUORI range carni (1-4°C)
    productCategories: ['fresh_meat'],
    expectedValid: false,
    expectedError: 'La temperatura non rientra nei range HACCP',
  },

  // Pesce fresco richiede 1-2°C, ma temp impostata a 5°C
  fishWrong: {
    name: 'Frigo Pesce (temp sbagliata)',
    pointType: 'fridge',
    targetTemperature: 5, // FUORI range pesce (1-2°C)
    productCategories: ['fresh_fish'],
    expectedValid: false,
    expectedError: 'La temperatura non rientra nei range HACCP',
  },

  // Multi-categoria con temperatura incompatibile per UNA categoria
  multiIncompatibleTemp: {
    name: 'Frigo Multi (temp incompatibile)',
    pointType: 'fridge',
    targetTemperature: 5, // OK per latticini (2-6) ma NON per pesce (1-2)
    productCategories: ['fresh_fish', 'fresh_dairy'],
    expectedValid: false,
    expectedError: 'La temperatura non rientra nei range HACCP delle categorie selezionate',
  },

  // Freezer con temp troppo alta
  freezerTooWarm: {
    name: 'Freezer (temp troppo alta)',
    pointType: 'freezer',
    targetTemperature: 0, // FUORI range freezer (-25 a -1)
    productCategories: ['frozen'],
    expectedValid: false,
    expectedError: 'La temperatura non rientra nei range HACCP',
  },
}

// ============= SCENARI INVALIDI - TIPO INCOMPATIBILE =============

export const invalidTypeScenarios = {
  // Carni fresche in ambiente (dispensa)
  meatInAmbient: {
    name: 'Dispensa con Carni (ERRORE)',
    pointType: 'ambient',
    targetTemperature: null,
    productCategories: ['fresh_meat'],
    expectedValid: false,
    expectedError: 'Alcune categorie non sono compatibili con la tipologia selezionata',
  },

  // Dispensa secca in frigorifero
  dryGoodsInFridge: {
    name: 'Frigo con Dispensa Secca (ERRORE)',
    pointType: 'fridge',
    targetTemperature: 20, // Temperatura dispensa ma in frigo!
    productCategories: ['dry_goods'],
    expectedValid: false,
    expectedError: 'Alcune categorie non sono compatibili',
  },

  // Prodotti frozen in abbattitore
  frozenInBlast: {
    name: 'Abbattitore con Frozen (ERRORE)',
    pointType: 'blast',
    targetTemperature: -18,
    productCategories: ['frozen'],
    expectedValid: false,
    expectedError: 'Alcune categorie non sono compatibili',
  },

  // Prodotti blast chilling in freezer
  blastInFreezer: {
    name: 'Freezer con Blast (ERRORE)',
    pointType: 'freezer',
    targetTemperature: -20,
    productCategories: ['blast_chilling'],
    expectedValid: false,
    expectedError: 'Alcune categorie non sono compatibili',
  },
}

// ============= SCENARI EDGE CASES =============

export const edgeCaseScenarios = {
  // Temperatura esattamente al limite inferiore (boundary test)
  exactMinTemperature: {
    name: 'Frigo Carni (esatto min)',
    pointType: 'fridge',
    targetTemperature: 1, // Esattamente min range carni (1-4)
    productCategories: ['fresh_meat'],
    expectedValid: true,
  },

  // Temperatura esattamente al limite superiore (boundary test)
  exactMaxTemperature: {
    name: 'Frigo Carni (esatto max)',
    pointType: 'fridge',
    targetTemperature: 4, // Esattamente max range carni (1-4)
    productCategories: ['fresh_meat'],
    expectedValid: true,
  },

  // Temperatura appena fuori range (0.1°C sotto min)
  justBelowMin: {
    name: 'Frigo Carni (0.1°C sotto)',
    pointType: 'fridge',
    targetTemperature: 0.9, // Appena sotto min (1)
    productCategories: ['fresh_meat'],
    expectedValid: false,
  },

  // Temperatura appena fuori range (0.1°C sopra max)
  justAboveMax: {
    name: 'Frigo Carni (0.1°C sopra)',
    pointType: 'fridge',
    targetTemperature: 4.1, // Appena sopra max (4)
    productCategories: ['fresh_meat'],
    expectedValid: false,
  },

  // Nessuna categoria selezionata
  noCategories: {
    name: 'Frigo senza categorie',
    pointType: 'fridge',
    targetTemperature: 4,
    productCategories: [],
    expectedValid: false,
    expectedError: 'Seleziona almeno una categoria',
  },

  // Temperatura negativa per frigorifero (edge case valido)
  negativeInFridge: {
    name: 'Frigo Pesce (temp negativa)',
    pointType: 'fridge',
    targetTemperature: -0.5, // Tecnicamente possibile per fridge
    productCategories: [], // Ma nessuna categoria compatibile!
    expectedValid: false,
  },
}

// ============= SCENARI UI BEHAVIOR =============

export const uiBehaviorScenarios = {
  // Test: Dispensa secca → Input temperatura DISABLED
  ambientDisablesTemp: {
    name: 'Dispensa A',
    pointType: 'ambient',
    shouldDisableTemperatureInput: true,
    availableCategories: ['dry_goods'], // Solo questa visibile
  },

  // Test: Frigorifero → Input temperatura ENABLED, categorie filtrate
  fridgeEnablesTemp: {
    name: 'Frigo A',
    pointType: 'fridge',
    targetTemperature: 4,
    shouldDisableTemperatureInput: false,
    availableCategories: [
      'fresh_meat',
      'fresh_fish',
      'fresh_dairy',
      'fresh_produce',
      'beverages',
    ], // NO dry_goods, frozen, blast_chilling
  },

  // Test: Cambio tipologia → Reset categorie selezionate
  typeChangeResetsCategories: {
    initial: {
      pointType: 'fridge',
      targetTemperature: 4,
      productCategories: ['fresh_meat'],
    },
    changeTypeTo: 'ambient',
    expectedResult: {
      productCategories: [], // RESET (fresh_meat incompatibile con ambient)
      temperatureInput: 'disabled',
    },
  },

  // Test: Cambio temperatura → Filtra categorie disponibili
  tempChangeFiltersCategories: {
    pointType: 'fridge',
    temperature: 2,
    availableCategories: ['fresh_meat', 'fresh_fish', 'fresh_dairy'], // 2°C compatibile
    notAvailableCategories: ['beverages'], // range 2-12 ma 2 è al limite
  },
}

// ============= HELPER FUNCTIONS =============

/**
 * Verifica se temperatura è compatibile con categoria
 */
export function isTemperatureCompatible(temperature, categoryId) {
  const category = PRODUCT_CATEGORIES[categoryId]
  if (!category || !category.range) return false

  return temperature >= category.range.min && temperature <= category.range.max
}

/**
 * Verifica se tipo punto è compatibile con categoria
 */
export function isTypeCompatible(pointType, categoryId) {
  const category = PRODUCT_CATEGORIES[categoryId]
  if (!category) return false

  // Check compatibleTypes (whitelist)
  if (category.compatibleTypes) {
    return category.compatibleTypes.includes(pointType)
  }

  // Check incompatibleTypes (blacklist)
  if (category.incompatibleTypes) {
    return !category.incompatibleTypes.includes(pointType)
  }

  return true
}

/**
 * Ottiene categorie compatibili per tipo e temperatura
 */
export function getCompatibleCategories(pointType, temperature = null) {
  return Object.values(PRODUCT_CATEGORIES).filter(category => {
    // Check type compatibility
    if (!isTypeCompatible(pointType, category.id)) {
      return false
    }

    // If temperature provided, check temperature compatibility
    if (temperature !== null && category.range) {
      return isTemperatureCompatible(temperature, category.id)
    }

    return true
  })
}

/**
 * Valida scenario conservazione completo
 */
export function validateConservationScenario(scenario) {
  const { pointType, targetTemperature, productCategories } = scenario

  // Check almeno una categoria
  if (!productCategories || productCategories.length === 0) {
    return {
      valid: false,
      error: 'Seleziona almeno una categoria',
    }
  }

  // Check ogni categoria
  for (const categoryId of productCategories) {
    // Type compatibility
    if (!isTypeCompatible(pointType, categoryId)) {
      return {
        valid: false,
        error: `Categoria ${categoryId} non compatibile con tipo ${pointType}`,
      }
    }

    // Temperature compatibility (se temp impostata)
    if (targetTemperature !== null && !isTemperatureCompatible(targetTemperature, categoryId)) {
      return {
        valid: false,
        error: `Temperatura ${targetTemperature}°C fuori range per categoria ${categoryId}`,
      }
    }
  }

  return { valid: true }
}
