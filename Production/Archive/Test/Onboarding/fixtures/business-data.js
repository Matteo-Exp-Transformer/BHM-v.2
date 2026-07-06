/**
 * FIXTURES: Business Data per Test Onboarding BHM v.2
 *
 * Contiene dati validi e invalidi per testare BusinessInfoStep
 */

// ============= DATI VALIDI =============

export const validBusinessData = {
  businessName: 'Ristorante Il Buongustaio',
  address: 'Via Roma 123, 00100 Roma RM',
  phone: '06 1234567',
  email: 'info@buongustaio.it',
  vatNumber: '12345678901', // P.IVA italiana valida (11 cifre)
  fiscalCode: 'RSSMRA80A01H501U', // CF valido
  website: 'https://www.buongustaio.it',
}

export const validBusinessDataMinimal = {
  businessName: 'Pizzeria Da Mario',
  address: 'Piazza Garibaldi 5, Milano',
  phone: '02 9876543',
  email: 'mario@pizzeria.it',
  // Campi opzionali omessi
}

// ============= DATI INVALIDI =============

export const invalidBusinessData = {
  emptyName: {
    ...validBusinessData,
    businessName: '',
    expectedError: 'Il nome dell\'azienda è obbligatorio',
  },

  shortName: {
    ...validBusinessData,
    businessName: 'A', // Troppo corto
    expectedError: 'Il nome deve essere di almeno 2 caratteri',
  },

  emptyAddress: {
    ...validBusinessData,
    address: '',
    expectedError: 'L\'indirizzo è obbligatorio',
  },

  invalidEmail: {
    ...validBusinessData,
    email: 'email-non-valida',
    expectedError: 'Email non valida',
  },

  invalidEmailMissingAt: {
    ...validBusinessData,
    email: 'emailsenzachiocciola.com',
    expectedError: 'Email non valida',
  },

  emptyEmail: {
    ...validBusinessData,
    email: '',
    expectedError: 'L\'email è obbligatoria',
  },

  invalidPhone: {
    ...validBusinessData,
    phone: '123', // Troppo corto
    expectedError: 'Numero di telefono non valido',
  },

  phoneWithLetters: {
    ...validBusinessData,
    phone: 'abc123def',
    expectedError: 'Numero di telefono non valido',
  },

  invalidVatNumberShort: {
    ...validBusinessData,
    vatNumber: '12345', // Meno di 11 cifre
    expectedError: 'P.IVA non valida (deve essere 11 cifre)',
  },

  invalidVatNumberLong: {
    ...validBusinessData,
    vatNumber: '123456789012', // Più di 11 cifre
    expectedError: 'P.IVA non valida (deve essere 11 cifre)',
  },

  invalidVatNumberLetters: {
    ...validBusinessData,
    vatNumber: '1234567890A', // Contiene lettere
    expectedError: 'P.IVA non valida (solo numeri)',
  },

  invalidWebsite: {
    ...validBusinessData,
    website: 'sito-non-valido',
    expectedError: 'URL non valido',
  },

  invalidWebsiteMissingProtocol: {
    ...validBusinessData,
    website: 'www.esempio.com', // Manca http:// o https://
    expectedError: 'URL deve iniziare con http:// o https://',
  },
}

// ============= DATI TEST EDGE CASES =============

export const edgeCaseBusinessData = {
  specialCharactersInName: {
    ...validBusinessData,
    businessName: 'Ristorante "L\'Eleganza" & Co.',
    // Should be accepted
  },

  veryLongName: {
    ...validBusinessData,
    businessName: 'A'.repeat(200), // 200 caratteri
    // Test max length handling
  },

  internationalPhone: {
    ...validBusinessData,
    phone: '+39 06 1234567',
    // Should be accepted
  },

  emailWithPlus: {
    ...validBusinessData,
    email: 'test+filter@example.com',
    // Should be accepted (valid email format)
  },

  unicodeInAddress: {
    ...validBusinessData,
    address: 'Via Caffè 10, 🇮🇹 Roma',
    // Test unicode handling
  },
}

// ============= DATI PRECOMPILA (da DevButtons) =============

export const prefillBusinessData = {
  businessName: 'Al Ritrovo SRL',
  address: 'Via San Pietro 14, 09170 Oristano OR',
  phone: '338 123 4567',
  email: 'info@alritrovo.it',
  vatNumber: '12345678901',
  fiscalCode: 'ALRTRV23A01H501U',
  website: 'https://www.alritrovo.it',
}

// ============= HELPER FUNCTIONS =============

/**
 * Genera dati business randomizzati per test
 */
export function generateRandomBusinessData() {
  const randomId = Math.floor(Math.random() * 10000)

  return {
    businessName: `Ristorante Test ${randomId}`,
    address: `Via Test ${randomId}, 00100 Roma`,
    phone: `06 ${randomId}`,
    email: `test${randomId}@example.com`,
    vatNumber: `${randomId}`.padStart(11, '0'),
  }
}

/**
 * Verifica se dati business sono validi (formato base)
 */
export function isValidBusinessData(data) {
  return (
    data.businessName && data.businessName.length >= 2 &&
    data.address && data.address.length > 0 &&
    data.email && data.email.includes('@') &&
    data.phone && data.phone.length >= 5
  )
}
