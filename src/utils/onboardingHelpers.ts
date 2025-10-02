import { safeSetItem, clearAllStorage, clearHaccpData } from './safeStorage'
import { toast } from 'react-toastify'
import { AllergenType } from '@/types/inventory'
import type { OnboardingData } from '@/types/onboarding'

// Dati precompilati seguendo esattamente la guida di riferimento
export const getPrefillData = (): OnboardingData => {
  const generateId = () =>
    `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    business: {
      name: 'Al Ritrovo SRL',
      address: 'Via centotrecento 1/1b Bologna 40128',
      phone: '0511234567',
      email: '000@gmail.com',
      vat_number: '001255668899101',
      business_type: 'ristorante',
      established_date: '2020-01-15',
      license_number: 'RIS-2020-001',
    },
    departments: [
      {
        id: generateId(),
        name: 'Cucina',
        description: 'Area di preparazione e cottura cibi',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Bancone',
        description: 'Area di servizio clienti',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Sala',
        description: 'Area di servizio ai tavoli',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Magazzino',
        description: 'Area di stoccaggio merci',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Magazzino B',
        description: 'Area di stoccaggio secondaria',
        is_active: true,
      },
      {
        id: generateId(),
        name: 'Sala B',
        description: 'Area di servizio secondaria',
        is_active: true,
      },
    ],
    staff: [
      {
        id: generateId(),
        name: 'Mario',
        surname: 'Rossi',
        fullName: 'Mario Rossi',
        role: 'responsabile',
        categories: ['Cuochi'],
        email: 'mario.rossi@alritrovo.it',
        phone: '+39 340 1234567',
        department_assignments: [],
        haccpExpiry: '2025-12-31',
        notes: 'Responsabile HACCP cucina',
      },
      {
        id: generateId(),
        name: 'Giulia',
        surname: 'Bianchi',
        fullName: 'Giulia Bianchi',
        role: 'dipendente',
        categories: ['Camerieri'],
        email: 'giulia.bianchi@alritrovo.it',
        department_assignments: [],
        haccpExpiry: '2025-06-30',
      },
      {
        id: generateId(),
        name: 'Luca',
        surname: 'Verdi',
        fullName: 'Luca Verdi',
        role: 'collaboratore',
        categories: ['Banconisti'],
        department_assignments: [],
      },
    ],
    conservation: {
      points: [
        {
          id: generateId(),
          name: 'Frigo A Cucina',
          departmentId: '',
          targetTemperature: 4,
          pointType: 'fridge' as const,
          isBlastChiller: false,
          productCategories: ['fresh_meat', 'fresh_dairy', 'fresh_produce'],
          source: 'prefill' as const,
        },
        {
          id: generateId(),
          name: 'Frigo Bancone 1',
          departmentId: '',
          targetTemperature: 2,
          pointType: 'fridge' as const,
          isBlastChiller: false,
          productCategories: ['beverages', 'fresh_dairy'],
          source: 'prefill' as const,
        },
        {
          id: generateId(),
          name: 'Frigo Bancone 2',
          departmentId: '',
          targetTemperature: 3,
          pointType: 'fridge' as const,
          isBlastChiller: false,
          productCategories: ['beverages'],
          source: 'prefill' as const,
        },
        {
          id: generateId(),
          name: 'Congelatore Principale',
          departmentId: '',
          targetTemperature: -18,
          pointType: 'freezer' as const,
          isBlastChiller: false,
          productCategories: ['frozen'],
          source: 'prefill' as const,
        },
      ],
    },
    tasks: {
      generalTasks: [
        {
          id: generateId(),
          name: 'Rilevamento Temperatura Giornaliero',
          description:
            'Controllo e registrazione temperature di tutti i frigoriferi',
          frequency: 'daily' as const,
          priority: 'high' as const,
          estimatedDuration: 15,
          haccpCategory: 'temperature' as const,
          checklist: [
            'Verificare temperatura display frigorifero',
            'Controllare temperatura con termometro di controllo',
            'Registrare temperatura su modulo HACCP',
            'Verificare corretta chiusura porta',
          ],
          requiredTools: ['Termometro digitale', 'Modulo registrazione'],
        },
        {
          id: generateId(),
          name: 'Sanificazione Settimanale',
          description: 'Pulizia e sanificazione approfondita delle superfici',
          frequency: 'weekly' as const,
          priority: 'critical' as const,
          estimatedDuration: 120,
          haccpCategory: 'hygiene' as const,
          checklist: [
            'Preparare soluzione disinfettante',
            'Pulire tutte le superfici di lavoro',
            'Sanificare attrezzature',
            'Documentare intervento',
          ],
          requiredTools: ['Disinfettante professionale', 'Panni monouso'],
        },
        {
          id: generateId(),
          name: 'Controllo Scadenze',
          description: 'Verifica e rimozione prodotti scaduti o in scadenza',
          frequency: 'daily' as const,
          priority: 'high' as const,
          estimatedDuration: 20,
          haccpCategory: 'documentation' as const,
          checklist: [
            'Controllare date scadenza frigorifero',
            'Controllare date scadenza dispensa',
            'Rimuovere prodotti scaduti',
            'Segnalare prodotti in scadenza',
          ],
          requiredTools: ['Etichette', 'Registro scadenze'],
        },
      ],
      maintenanceTasks: [
        {
          id: generateId(),
          conservationPointId: '',
          title: 'Taratura sensori frigoriferi',
          type: 'temperature_calibration',
          frequency: 'monthly',
          priority: 'medium',
          estimatedDuration: 45,
          assignedStaffIds: [],
          status: 'scheduled',
          notes: 'Verificare taratura sensori digitali e analogici',
          instructions: [
            'Verificare sensori digitali',
            'Confrontare con termometro certificato',
            'Registrare taratura nel registro HACCP',
          ],
          nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        },
      ],
    },
    inventory: {
      categories: [
        {
          id: generateId(),
          name: 'Carni Fresche',
          color: '#ef4444',
          conservationRules: {
            minTemp: 0,
            maxTemp: 4,
            maxStorageDays: 3,
            requiresBlastChilling: true,
          },
        },
        {
          id: generateId(),
          name: 'Pesce Fresco',
          color: '#3b82f6',
          conservationRules: {
            minTemp: 0,
            maxTemp: 2,
            maxStorageDays: 2,
            requiresBlastChilling: true,
          },
        },
        {
          id: generateId(),
          name: 'Latticini',
          color: '#f59e0b',
          conservationRules: {
            minTemp: 2,
            maxTemp: 6,
            maxStorageDays: 7,
          },
        },
        {
          id: generateId(),
          name: 'Verdure Fresche',
          color: '#10b981',
          conservationRules: {
            minTemp: 4,
            maxTemp: 8,
            maxStorageDays: 5,
          },
        },
      ],
      products: [
        {
          id: generateId(),
          name: 'Pomodori San Marzano',
          quantity: 5,
          unit: 'kg',
          supplierName: 'Ortofrutta Napoletana',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          status: 'active',
          allergens: [],
        },
        {
          id: generateId(),
          name: 'Mozzarella di Bufala',
          quantity: 10,
          unit: 'pz',
          allergens: [AllergenType.LATTE],
          supplierName: 'Caseificio Campano',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          status: 'active',
        },
        {
          id: generateId(),
          name: 'Petto di Pollo',
          quantity: 2.5,
          unit: 'kg',
          supplierName: 'Carni Locali SRL',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          status: 'active',
          allergens: [],
        },
        {
          id: generateId(),
          name: 'Salmone Fresco',
          quantity: 1.8,
          unit: 'kg',
          allergens: [AllergenType.PESCE],
          supplierName: 'Pescheria del Porto',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          status: 'active',
        },
        {
          id: generateId(),
          name: 'Olio Extravergine',
          quantity: 5,
          unit: 'l',
          supplierName: 'Frantoio Toscano',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          status: 'active',
          allergens: [],
        },
        {
          id: generateId(),
          name: 'Pasta di Grano Duro',
          quantity: 20,
          unit: 'conf',
          allergens: [AllergenType.GLUTINE],
          supplierName: 'Pastificio Artigianale',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          status: 'active',
        },
      ],
    },
  }
}

/**
 * Precompila l'onboarding con dati di test completi
 */
export const prefillOnboarding = (): void => {
  console.log('🔄 Precompilazione onboarding...')

  try {
    // Pulisce COMPLETAMENTE tutti i dati esistenti per evitare conflitti
    clearAllStorage()

    // Ottiene i dati precompilati
    const data = getPrefillData()

    // Associa i department_id ai conservation points
    if (data.departments?.length) {
      const cucinaId = data.departments.find(d => d.name === 'Cucina')?.id
      const banconeId = data.departments.find(d => d.name === 'Bancone')?.id

      if (data.conservation?.points) {
        data.conservation.points = data.conservation.points.map(point => ({
          ...point,
          departmentId: point.name.includes('Cucina')
            ? cucinaId || ''
            : point.name.includes('Bancone')
              ? banconeId || ''
              : data.departments?.[0]?.id || '',
        }))
      }

      if (data.staff) {
        data.staff = data.staff.map(member => ({
          ...member,
          department_assignments: member.categories.includes(
            'Responsabile Sala'
          )
            ? [banconeId || '']
            : member.categories.includes('Cuochi')
              ? [cucinaId || '']
              : [data.departments?.[0]?.id || ''],
        }))
      }

      if (data.inventory?.categories?.length) {
        const carniId = data.inventory.categories.find(
          c => c.name === 'Carni Fresche'
        )?.id
        const pesceId = data.inventory.categories.find(
          c => c.name === 'Pesce Fresco'
        )?.id
        const latticiniId = data.inventory.categories.find(
          c => c.name === 'Latticini'
        )?.id
        const verdureId = data.inventory.categories.find(
          c => c.name === 'Verdure Fresche'
        )?.id

        const frigoId = data.conservation?.points?.find(cp =>
          cp.name.includes('Frigo')
        )?.id

        if (data.inventory.products) {
          data.inventory.products = data.inventory.products.map(product => ({
            ...product,
            categoryId: product.name.includes('Pollo')
              ? carniId
              : product.name.includes('Salmone')
                ? pesceId
                : product.name.includes('Mozzarella')
                  ? latticiniId
                  : product.name.includes('Pomodori')
                    ? verdureId
                    : undefined,
            departmentId: cucinaId,
            conservationPointId: frigoId,
          }))
        }
      }
    }

    // Salva tutti i dati in localStorage
    safeSetItem('onboarding-data', data)

    console.log('✅ Onboarding precompilato con successo:', data)
    toast.success('Onboarding precompilato con dati di Al Ritrovo SRL!', {
      position: 'top-right',
      autoClose: 3000,
    })
  } catch (error) {
    console.error('❌ Errore nella precompilazione:', error)
    toast.error('Errore durante la precompilazione', {
      position: 'top-right',
      autoClose: 3000,
    })
  }
}

/**
 * Reset completo dell'onboarding con conferma
 */
export const resetOnboarding = (): void => {
  const confirmed = window.confirm(
    '⚠️ ATTENZIONE!\n\n' +
      "Questa operazione cancellerà TUTTI i dati dell'onboarding e dell'app.\n\n" +
      'Sei sicuro di voler continuare?'
  )

  if (!confirmed) {
    console.log("🔄 Reset onboarding annullato dall'utente")
    return
  }

  console.log('🔄 Reset completo onboarding...')

  try {
    // Pulisce tutti i dati HACCP e onboarding
    clearHaccpData()

    console.log('✅ Reset onboarding completato con successo')
    toast.success('Onboarding resettato completamente!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // Ricarica la pagina dopo un breve delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('❌ Errore nel reset onboarding:', error)
    toast.error('Errore durante il reset', {
      position: 'top-right',
      autoClose: 3000,
    })
  }
}

/**
 * Reset completo dell'app (solo sviluppo)
 */
export const resetApp = (): void => {
  const confirmed = window.confirm(
    '🚨 RESET COMPLETO APP\n\n' +
      'Questa operazione cancellerà TUTTO il localStorage e sessionStorage.\n' +
      'Utilizzare solo in sviluppo!\n\n' +
      'Sei ASSOLUTAMENTE sicuro?'
  )

  if (!confirmed) {
    console.log("🔄 Reset app annullato dall'utente")
    return
  }

  console.log('🔄 Reset completo app...')

  try {
    // Pulisce completamente tutto lo storage
    clearAllStorage()

    console.log('✅ Reset app completato con successo')
    toast.success('App resettata completamente!', {
      position: 'top-right',
      autoClose: 2000,
    })

    // Ricarica la pagina immediatamente
    setTimeout(() => {
      window.location.reload()
    }, 500)
  } catch (error) {
    console.error('❌ Errore nel reset app:', error)
    toast.error('Errore durante il reset completo', {
      position: 'top-right',
      autoClose: 3000,
    })
  }
}

/**
 * Completa automaticamente l'onboarding
 */
export const completeOnboarding = (): void => {
  console.log('🔄 Completamento automatico onboarding...')

  try {
    // Prima precompila i dati se non esistono
    const existingData = localStorage.getItem('onboarding-data')
    if (!existingData) {
      prefillOnboarding()
    }

    // Simula il completamento dell'onboarding
    safeSetItem('onboarding-completed', true)
    safeSetItem('onboarding-completed-at', new Date().toISOString())

    console.log('✅ Onboarding completato automaticamente')
    toast.success('Onboarding completato automaticamente!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // Reindirizza alla dashboard
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  } catch (error) {
    console.error('❌ Errore nel completamento automatico:', error)
    toast.error('Errore durante il completamento automatico', {
      position: 'top-right',
      autoClose: 3000,
    })
  }
}
