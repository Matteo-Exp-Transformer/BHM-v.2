// Costanti per profili punto di conservazione HACCP

export type ApplianceCategory =
  | 'vertical_fridge_with_freezer'
  | 'vertical_fridge_1_door'
  | 'vertical_fridge_2_doors'
  | 'base_refrigerated'
// Future: | 'display_fridge' | 'glass_door_fridge'

export type ConservationProfileId =
  | 'max_capacity'
  | 'meat_generic'
  | 'vegetables_generic'
  | 'fish_generic'

export interface CompartmentDefinition {
  id: string
  zone: 'fridge' | 'fridge_door' | 'freezer'
  label: string
  order: number
}

export interface PlacementRule {
  ruleId: string
  title: string
  short: string
}

export interface ConservationProfile {
  profileId: ConservationProfileId
  name: string
  applianceType: string
  recommendedSetPointsC: { fridge: number; freezer?: number }
  allowedCategoryIds: string[]
  compartmentFill: Record<string, string[]>
  haccpNotes: string[]
}

export interface ApplianceTemplate {
  templateId: string
  applianceType: string
  compartments: CompartmentDefinition[]
  globalPlacementRules: PlacementRule[]
}

// Template per Frigorifero Verticale con Freezer
export const VERTICAL_FRIDGE_WITH_FREEZER_TEMPLATE: ApplianceTemplate = {
  templateId: 'vertical_fridge_with_freezer_v1',
  applianceType: 'Frigorifero verticale con Freezer',
  compartments: [
    { id: 'fr_shelf_1_top', zone: 'fridge', label: 'Ripiano 1 (alto)', order: 1 },
    { id: 'fr_shelf_2', zone: 'fridge', label: 'Ripiano 2', order: 2 },
    { id: 'fr_shelf_3', zone: 'fridge', label: 'Ripiano 3', order: 3 },
    { id: 'fr_shelf_4_bottom', zone: 'fridge', label: 'Ripiano 4 (basso)', order: 4 },
    { id: 'fr_crisper_drawer', zone: 'fridge', label: 'Cassetto/Vaschetta', order: 5 },
    { id: 'fr_door_1_top', zone: 'fridge_door', label: 'Porta ripiano 1 (alto)', order: 6 },
    { id: 'fr_door_2_mid', zone: 'fridge_door', label: 'Porta ripiano 2 (medio)', order: 7 },
    { id: 'fr_door_3_bottom', zone: 'fridge_door', label: 'Porta ripiano 3 (basso)', order: 8 },
    { id: 'fz_drawer_1_top', zone: 'freezer', label: 'Freezer cassetto 1 (alto)', order: 9 },
    { id: 'fz_drawer_2_mid', zone: 'freezer', label: 'Freezer cassetto 2 (medio)', order: 10 },
    { id: 'fz_drawer_3_bottom', zone: 'freezer', label: 'Freezer cassetto 3 (basso)', order: 11 },
  ],
  globalPlacementRules: [
    { ruleId: 'raw_below_rte', title: 'Crudo sempre sotto a Preparazioni/Pronti/Cotti', short: 'Ripiani alti = Preparazioni/Pronti/Cotti; ripiani bassi = crudi (a tenuta).' },
    { ruleId: 'sealed_containers', title: 'Crudi e preparazioni SEMPRE chiusi e a tenuta', short: 'Doppio contenimento dove possibile + etichetta (nome, data/ora, scadenza).' },
    { ruleId: 'door_is_warmest', title: 'La porta è la zona più instabile', short: 'Porta solo per bevande/condimenti/conserve chiuse.' },
    { ruleId: 'freezer_target', title: 'Freezer: mantenere almeno -18°C', short: 'Separare per tipologia in sacchetti/box dedicati.' },
    { ruleId: 'herbs_with_produce', title: 'Erbe aromatiche = come ortofrutta fresca', short: 'Nel cassetto verdure, protette e lontane da crudi.' },
  ],
}

// 5 Profili per Frigorifero Verticale con Freezer
export const CONSERVATION_PROFILES: Record<ApplianceCategory, ConservationProfile[]> = {
  vertical_fridge_with_freezer: [
    {
      profileId: 'max_capacity',
      name: 'Profilo Massima Capienza',
      applianceType: 'Frigorifero verticale con Freezer',
      recommendedSetPointsC: { fridge: 2, freezer: -18 },
      allowedCategoryIds: ['rte', 'dairy', 'eggs', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed', 'frozen_ready', 'frozen_veg', 'frozen_meat_fish'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'eggs'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat', 'raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
        fz_drawer_1_top: ['frozen_ready'],
        fz_drawer_2_mid: ['frozen_veg'],
        fz_drawer_3_bottom: ['frozen_meat_fish'],
      },
      haccpNotes: [
        'Capienza massima = disciplina massima: contenitori a tenuta e ordine verticale rigoroso.',
        'Sul ripiano basso: ideale usare BOX separati (carne vs pesce).',
        'Set point 2°C: compromesso conservativo per includere anche pesce.',
      ],
    },
    {
      profileId: 'meat_generic',
      name: 'Profilo Carne + Generico',
      applianceType: 'Frigorifero verticale con Freezer',
      recommendedSetPointsC: { fridge: 3, freezer: -18 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'sauces_closed', 'beverages', 'preserves_closed', 'frozen_ready', 'frozen_veg', 'frozen_meat_fish'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
        fz_drawer_1_top: ['frozen_ready'],
        fz_drawer_2_mid: ['frozen_veg'],
        fz_drawer_3_bottom: ['frozen_meat_fish'],
      },
      haccpNotes: [
        'Carni crude sempre in basso e a tenuta (anti-gocciolamento).',
        'Set point 3°C: range operativo tipico 0-4°C con buon margine.',
      ],
    },
    {
      profileId: 'vegetables_generic',
      name: 'Profilo Verdure + Generico',
      applianceType: 'Frigorifero verticale con Freezer',
      recommendedSetPointsC: { fridge: 4, freezer: -18 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'sauces_closed', 'beverages', 'preserves_closed', 'frozen_ready', 'frozen_veg'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['produce', 'cured_meats'],
        fr_shelf_4_bottom: ['produce'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages'],
        fz_drawer_1_top: ['frozen_ready'],
        fz_drawer_2_mid: ['frozen_veg'],
        fz_drawer_3_bottom: ['frozen_ready'],
      },
      haccpNotes: [
        'Set point 4°C: più adatto a verdure (riduce danni da freddo).',
        'Valuta gestione dedicata per ortaggi sensibili al freddo.',
      ],
    },
    {
      profileId: 'fish_generic',
      name: 'Profilo Pesce + Generico',
      applianceType: 'Frigorifero verticale con Freezer',
      recommendedSetPointsC: { fridge: 1, freezer: -18 },
      allowedCategoryIds: ['rte', 'dairy', 'produce', 'aromatic_herbs', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed', 'frozen_ready', 'frozen_veg', 'frozen_meat_fish'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'sauces_closed'],
        fr_shelf_3: ['produce'],
        fr_shelf_4_bottom: ['raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
        fz_drawer_1_top: ['frozen_ready'],
        fz_drawer_2_mid: ['frozen_veg'],
        fz_drawer_3_bottom: ['frozen_meat_fish'],
      },
      haccpNotes: [
        'Set point 1°C: profilo conservativo per pesce fresco.',
        'Pesce crudo: doppio contenimento + pulizia frequente ripiano basso.',
      ],
    },
  ],
  vertical_fridge_1_door: [
    {
      profileId: 'max_capacity',
      name: 'Profilo Massima Capienza',
      applianceType: 'Frigorifero Verticale 1 Anta',
      recommendedSetPointsC: { fridge: 2 },
      allowedCategoryIds: ['rte', 'dairy', 'eggs', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'eggs'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat', 'raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
      },
      haccpNotes: [
        'Capienza massima = disciplina massima: contenitori a tenuta e ordine verticale rigoroso.',
        'Sul ripiano basso: ideale usare BOX separati (carne vs pesce).',
        'Set point 2°C: compromesso conservativo per includere anche pesce.',
      ],
    },
    {
      profileId: 'meat_generic',
      name: 'Profilo Carne + Generico',
      applianceType: 'Frigorifero Verticale 1 Anta',
      recommendedSetPointsC: { fridge: 3 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
      },
      haccpNotes: [
        'Carni crude sempre in basso e a tenuta (anti-gocciolamento).',
        'Set point 3°C: range operativo tipico 0-4°C con buon margine.',
      ],
    },
    {
      profileId: 'vegetables_generic',
      name: 'Profilo Verdure + Generico',
      applianceType: 'Frigorifero Verticale 1 Anta',
      recommendedSetPointsC: { fridge: 4 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['produce', 'cured_meats'],
        fr_shelf_4_bottom: ['produce'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages'],
      },
      haccpNotes: [
        'Set point 4°C: più adatto a verdure (riduce danni da freddo).',
        'Valuta gestione dedicata per ortaggi sensibili al freddo.',
      ],
    },
    {
      profileId: 'fish_generic',
      name: 'Profilo Pesce + Generico',
      applianceType: 'Frigorifero Verticale 1 Anta',
      recommendedSetPointsC: { fridge: 1 },
      allowedCategoryIds: ['rte', 'dairy', 'produce', 'aromatic_herbs', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'sauces_closed'],
        fr_shelf_3: ['produce'],
        fr_shelf_4_bottom: ['raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
      },
      haccpNotes: [
        'Set point 1°C: profilo conservativo per pesce fresco.',
        'Pesce crudo: doppio contenimento + pulizia frequente ripiano basso.',
      ],
    },
  ],
  vertical_fridge_2_doors: [
    {
      profileId: 'max_capacity',
      name: 'Profilo Massima Capienza',
      applianceType: 'Frigorifero Verticale 2 Ante',
      recommendedSetPointsC: { fridge: 2 },
      allowedCategoryIds: ['rte', 'dairy', 'eggs', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'eggs'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat', 'raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
      },
      haccpNotes: [
        'Capienza massima = disciplina massima: contenitori a tenuta e ordine verticale rigoroso.',
        'Sul ripiano basso: ideale usare BOX separati (carne vs pesce).',
        'Set point 2°C: compromesso conservativo per includere anche pesce.',
      ],
    },
    {
      profileId: 'meat_generic',
      name: 'Profilo Carne + Generico',
      applianceType: 'Frigorifero Verticale 2 Ante',
      recommendedSetPointsC: { fridge: 3 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
      },
      haccpNotes: [
        'Carni crude sempre in basso e a tenuta (anti-gocciolamento).',
        'Set point 3°C: range operativo tipico 0-4°C con buon margine.',
      ],
    },
    {
      profileId: 'vegetables_generic',
      name: 'Profilo Verdure + Generico',
      applianceType: 'Frigorifero Verticale 2 Ante',
      recommendedSetPointsC: { fridge: 4 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['produce', 'cured_meats'],
        fr_shelf_4_bottom: ['produce'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages'],
      },
      haccpNotes: [
        'Set point 4°C: più adatto a verdure (riduce danni da freddo).',
        'Valuta gestione dedicata per ortaggi sensibili al freddo.',
      ],
    },
    {
      profileId: 'fish_generic',
      name: 'Profilo Pesce + Generico',
      applianceType: 'Frigorifero Verticale 2 Ante',
      recommendedSetPointsC: { fridge: 1 },
      allowedCategoryIds: ['rte', 'dairy', 'produce', 'aromatic_herbs', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'sauces_closed'],
        fr_shelf_3: ['produce'],
        fr_shelf_4_bottom: ['raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
      },
      haccpNotes: [
        'Set point 1°C: profilo conservativo per pesce fresco.',
        'Pesce crudo: doppio contenimento + pulizia frequente ripiano basso.',
      ],
    },
  ],
  base_refrigerated: [
    {
      profileId: 'max_capacity',
      name: 'Profilo Massima Capienza',
      applianceType: 'Base Refrigerata',
      recommendedSetPointsC: { fridge: 2 },
      allowedCategoryIds: ['rte', 'dairy', 'eggs', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'eggs'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat', 'raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
      },
      haccpNotes: [
        'Capienza massima = disciplina massima: contenitori a tenuta e ordine verticale rigoroso.',
        'Sul ripiano basso: ideale usare BOX separati (carne vs pesce).',
        'Set point 2°C: compromesso conservativo per includere anche pesce.',
      ],
    },
    {
      profileId: 'meat_generic',
      name: 'Profilo Carne + Generico',
      applianceType: 'Base Refrigerata',
      recommendedSetPointsC: { fridge: 3 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
      },
      haccpNotes: [
        'Carni crude sempre in basso e a tenuta (anti-gocciolamento).',
        'Set point 3°C: range operativo tipico 0-4°C con buon margine.',
      ],
    },
    {
      profileId: 'vegetables_generic',
      name: 'Profilo Verdure + Generico',
      applianceType: 'Base Refrigerata',
      recommendedSetPointsC: { fridge: 4 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['produce', 'cured_meats'],
        fr_shelf_4_bottom: ['produce'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages'],
      },
      haccpNotes: [
        'Set point 4°C: più adatto a verdure (riduce danni da freddo).',
        'Valuta gestione dedicata per ortaggi sensibili al freddo.',
      ],
    },
    {
      profileId: 'fish_generic',
      name: 'Profilo Pesce + Generico',
      applianceType: 'Base Refrigerata',
      recommendedSetPointsC: { fridge: 1 },
      allowedCategoryIds: ['rte', 'dairy', 'produce', 'aromatic_herbs', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'sauces_closed'],
        fr_shelf_3: ['produce'],
        fr_shelf_4_bottom: ['raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
      },
      haccpNotes: [
        'Set point 1°C: profilo conservativo per pesce fresco.',
        'Pesce crudo: doppio contenimento + pulizia frequente ripiano basso.',
      ],
    },
  ],
}

// Mapping category ID → DB name
export const CATEGORY_ID_TO_DB_NAME: Record<string, string> = {
  rte: 'Preparazioni/Pronti/Cotti (RTE)',
  dairy: 'Latticini',
  eggs: 'Uova - Ovoprodotti',
  cured_meats: 'Salumi e affettati',
  produce: 'Verdure e ortofrutta',
  aromatic_herbs: 'Erbe aromatiche fresche',
  raw_meat: 'Carni crude',
  raw_fish: 'Pesce e frutti di mare crudi',
  sauces_closed: 'Salse/condimenti',
  beverages: 'Bevande',
  preserves_closed: 'Conserve/semiconserve',
  frozen_ready: 'Congelati: preparazioni',
  frozen_veg: 'Congelati: vegetali',
  frozen_meat_fish: 'Congelati: carni e pesce',
}

// Helper functions
export function getProfileById(
  profileId: ConservationProfileId,
  applianceCategory: ApplianceCategory
): ConservationProfile | null {
  const profiles = CONSERVATION_PROFILES[applianceCategory]
  return profiles?.find(p => p.profileId === profileId) || null
}

export function getProfilesForAppliance(
  applianceCategory: ApplianceCategory
): ConservationProfile[] {
  return CONSERVATION_PROFILES[applianceCategory] || []
}

export function mapCategoryIdToDbName(categoryId: string): string | null {
  return CATEGORY_ID_TO_DB_NAME[categoryId] || null
}

export function mapCategoryIdsToDbNames(categoryIds: string[]): string[] {
  return categoryIds
    .map(id => CATEGORY_ID_TO_DB_NAME[id])
    .filter((name): name is string => name !== null && name !== undefined)
}

// Appliance category labels for UI
export const APPLIANCE_CATEGORY_LABELS: Record<ApplianceCategory, string> = {
  vertical_fridge_with_freezer: 'Frigorifero Verticale con Freezer',
  vertical_fridge_1_door: 'Frigorifero Verticale 1 Anta',
  vertical_fridge_2_doors: 'Frigorifero Verticale 2 Ante',
  base_refrigerated: 'Base Refrigerata',
}

// Profile labels for UI
export const PROFILE_LABELS: Record<ConservationProfileId, string> = {
  max_capacity: 'Profilo Massima Capienza',
  meat_generic: 'Profilo Carne + Generico',
  vegetables_generic: 'Profilo Verdure + Generico',
  fish_generic: 'Profilo Pesce + Generico',
}
