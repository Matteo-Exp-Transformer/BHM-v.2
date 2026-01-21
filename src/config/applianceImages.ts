import type { ApplianceCategory, ConservationProfileId } from '@/utils/conservationProfiles'

/**
 * Configurazione immagini elettrodomestici per Conservation
 *
 * Per aggiungere una nuova categoria:
 * 1. Aggiungi la categoria in conservationProfiles.ts (ApplianceCategory type)
 * 2. Crea cartella: public/images/conservation/appliances/{categoria-kebab-case}/
 * 3. Aggiungi immagine main.png nella cartella
 * 4. Aggiungi entry in APPLIANCE_IMAGE_PATHS sotto
 */
export const APPLIANCE_IMAGE_PATHS: Record<ApplianceCategory, string> = {
  vertical_fridge_with_freezer: '/images/conservation/appliances/vertical-fridge-with-freezer/main.png',
  // Aggiungi nuove categorie qui:
  // single_door_fridge: '/images/conservation/appliances/single-door-fridge/main.png',
  // chest_freezer: '/images/conservation/appliances/chest-freezer/main.png',
}

/**
 * Configurazione immagini specifiche per profilo
 * 
 * Per aggiungere una nuova immagine profilo:
 * 1. Aggiungi immagine in: public/images/conservation/appliances/{categoria-kebab-case}/{profile-id}-profile.png
 * 2. Aggiungi entry in PROFILE_IMAGE_PATHS sotto
 */
export const PROFILE_IMAGE_PATHS: Record<string, string> = {
  'vertical_fridge_with_freezer:max_capacity': '/images/conservation/appliances/vertical-fridge-with-freezer/max-capacity-profile.png',
  'vertical_fridge_with_freezer:vegetables_generic': '/images/conservation/appliances/vertical-fridge-with-freezer/vegetables-generic-profile.png',
  'vertical_fridge_with_freezer:fish_generic': '/images/conservation/appliances/vertical-fridge-with-freezer/fish-generic-profile.png',
  'vertical_fridge_with_freezer:meat_generic': '/images/conservation/appliances/vertical-fridge-with-freezer/meat-generic-profile.png',
  // Aggiungi nuove immagini profilo qui:
}

/**
 * Ottiene il path dell'immagine per una categoria di elettrodomestico
 * @returns path immagine o null se categoria non configurata
 */
export function getApplianceImagePath(category: ApplianceCategory): string | null {
  return APPLIANCE_IMAGE_PATHS[category] ?? null
}

/**
 * Ottiene il path dell'immagine per una combinazione categoria + profilo
 * @returns path immagine profilo se disponibile, altrimenti null
 */
export function getProfileImagePath(
  category: ApplianceCategory,
  profileId: ConservationProfileId | string
): string | null {
  const key = `${category}:${profileId}`
  return PROFILE_IMAGE_PATHS[key] ?? null
}

/**
 * Ottiene il path dell'immagine corretta (profilo specifica o categoria base)
 * @returns path immagine profilo se disponibile, altrimenti immagine categoria base
 */
export function getApplianceImagePathWithProfile(
  category: ApplianceCategory,
  profileId?: ConservationProfileId | string | null
): string | null {
  // Se c'è un profilo, prova prima l'immagine specifica del profilo
  if (profileId) {
    const profilePath = getProfileImagePath(category, profileId)
    if (profilePath) {
      return profilePath
    }
  }
  
  // Altrimenti usa l'immagine base della categoria
  return getApplianceImagePath(category)
}

/**
 * Verifica se una categoria ha un'immagine configurata
 */
export function hasApplianceImage(category: ApplianceCategory): boolean {
  return category in APPLIANCE_IMAGE_PATHS
}

/**
 * Verifica se esiste un'immagine specifica per un profilo
 */
export function hasProfileImage(
  category: ApplianceCategory,
  profileId: ConservationProfileId | string
): boolean {
  const key = `${category}:${profileId}`
  return key in PROFILE_IMAGE_PATHS
}

/**
 * Verifica se esiste un'immagine disponibile (profilo specifica o categoria base)
 * @returns true se esiste un'immagine disponibile (profilo o categoria base)
 */
export function hasApplianceImageAvailable(
  category: ApplianceCategory,
  profileId?: ConservationProfileId | string | null
): boolean {
  // Se c'è un profilo, verifica prima se esiste l'immagine del profilo
  if (profileId && hasProfileImage(category, profileId)) {
    return true
  }
  
  // Altrimenti verifica se esiste l'immagine base della categoria
  return hasApplianceImage(category)
}
