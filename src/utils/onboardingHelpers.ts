import { safeSetItem, clearAllStorage, clearHaccpData } from './safeStorage'
import { toast } from 'react-toastify'
import { AllergenType } from '@/types/inventory'
import type { OnboardingData } from '@/types/onboarding'

// Funzione per generare le manutenzioni precompilate per ogni punto di conservazione
const generateConservationMaintenancePlans = (conservationPoints: any[]) => {
  const generateId = () =>
    `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Manutenzioni standard per ogni punto di conservazione (da PRECOMPILATION_AND_RESET_GUIDE.md righe 166-197)
  const standardMaintenances = [
    {
      manutenzione: 'rilevamento_temperatura' as const, // ✅ Corretto: inglese
      frequenza: 'giornaliera' as const,
      assegnatoARuolo: 'responsabile' as const,
      assegnatoACategoria: 'Banconisti',
      assegnatoADipendenteSpecifico: undefined,
      giorniCustom: undefined,
      note: 'Controllo temperatura giornaliero obbligatorio',
    },
    {
      manutenzione: 'sanificazione' as const, // ✅ Corretto: inglese
      frequenza: 'settimanale' as const,
      assegnatoARuolo: 'dipendente' as const,
      assegnatoACategoria: 'Cuochi',
      assegnatoADipendenteSpecifico: undefined,
      giorniCustom: undefined,
      note: 'Sanificazione settimanale completa',
    },
    {
      manutenzione: 'sbrinamento' as const, // ✅ Corretto: inglese
      frequenza: 'annuale' as const,
      assegnatoARuolo: 'admin' as const,
      assegnatoACategoria: 'Amministratore',
      assegnatoADipendenteSpecifico: undefined,
      giorniCustom: undefined,
      note: 'Sbrinamento annuale profondo',
    },
    {
      manutenzione: 'controllo_scadenze' as const, // ✅ Corretto: inglese
      frequenza: 'custom' as const,
      assegnatoARuolo: 'dipendente' as const,
      assegnatoACategoria: 'all',
      assegnatoADipendenteSpecifico: undefined,
      giorniCustom: ['lunedi', 'giovedi'] as const,
      note: 'Controllo scadenze Lunedì e Giovedì',
    },
  ]

  const maintenancePlans: any[] = []

  conservationPoints.forEach(point => {
    standardMaintenances.forEach(maintenance => {
      // I punti di tipo "ambiente" non hanno "sbrinamento" ✅ Corretto: inglese
      if (
        point.pointType === 'ambiente' &&
        maintenance.manutenzione === 'sbrinamento'
      ) {
        return
      }

      maintenancePlans.push({
        id: generateId(),
        conservationPointId: point.id,
        manutenzione: maintenance.manutenzione,
        frequenza: maintenance.frequenza,
        assegnatoARuolo: maintenance.assegnatoARuolo,
        assegnatoACategoria: maintenance.assegnatoACategoria,
        assegnatoADipendenteSpecifico:
          maintenance.assegnatoADipendenteSpecifico,
        giorniCustom: maintenance.giorniCustom,
        note: maintenance.note,
      })
    })
  })

  return maintenancePlans
}

// Dati precompilati seguendo esattamente la guida di riferimento
export const getPrefillData = (): OnboardingData => {
  const generateId = () =>
    `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Genera i reparti prima per poterli referenziare
  const departments = [
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
    {
      id: generateId(),
      name: 'Deoor / Esterno',
      description: 'Area deoor e servizi esterni',
      is_active: true,
    },
    {
      id: generateId(),
      name: 'Plonge / Lavaggio Piatti',
      description: 'Area lavaggio stoviglie e piatti',
      is_active: true,
    },
  ]

  // Funzione helper per trovare reparti per nome
  const getDepartmentIds = (names: string[]) => {
    return departments
      .filter(dept =>
        names.some(name => dept.name.toLowerCase().includes(name.toLowerCase()))
      )
      .map(dept => dept.id)
  }

  // Funzione helper per tutti i reparti attivi
  const getAllDepartmentIds = () => {
    return departments.filter(dept => dept.is_active).map(dept => dept.id)
  }

  // Funzione helper per trovare un reparto per nome
  const getDepartmentId = (name: string) => {
    const dept = departments.find(dept =>
      dept.name.toLowerCase().includes(name.toLowerCase())
    )
    return dept?.id || ''
  }

  const staff = [
    {
      id: generateId(),
      name: 'Matteo',
      surname: 'Cavallaro',
      fullName: 'Matteo Cavallaro',
      role: 'responsabile' as const,
      categories: ['Banconisti'],
      email: 'Neo@gmail.com',
      phone: '3334578536',
      department_assignments: getAllDepartmentIds(), // Tutti i reparti
      haccpExpiry: '2025-10-01',
      notes: 'Responsabile con accesso a tutti i reparti',
    },
    {
      id: generateId(),
      name: 'Fabrizio',
      surname: 'Dettori',
      fullName: 'Fabrizio Dettori',
      role: 'admin' as const,
      categories: ['Amministratore'],
      email: 'Fabri@gmail.com',
      phone: '3334578535',
      department_assignments: getDepartmentIds([
        'Sala',
        'Sala B',
        'Deoor',
        'Plonge',
      ]), // Sala + Sala B + Deoor + Plonge
      haccpExpiry: '2026-10-01',
      notes: 'Amministratore con accesso a Sala, Sala B, Deoor e Plonge',
    },
    {
      id: generateId(),
      name: 'Paolo',
      surname: 'Dettori',
      fullName: 'Paolo Dettori',
      role: 'admin' as const,
      categories: ['Cuochi', 'Amministratore'],
      email: 'Pablo@gmail.com',
      phone: '3334578534',
      department_assignments: getAllDepartmentIds(), // Tutti i reparti
      haccpExpiry: '2025-10-01',
      notes: 'Amministratore con competenze di cucina',
    },
    {
      id: generateId(),
      name: 'Eddy',
      surname: 'TheQueen',
      fullName: 'Eddy TheQueen',
      role: 'dipendente' as const,
      categories: ['Banconisti'],
      email: 'Eddy@gmail.com',
      phone: '3334578533',
      department_assignments: getDepartmentIds(['Bancone']), // Bancone
      haccpExpiry: '2026-10-01',
      notes: 'Dipendente specializzato al bancone',
    },
    {
      id: generateId(),
      name: 'Elena',
      surname: 'Compagna',
      fullName: 'Elena Compagna',
      role: 'dipendente' as const,
      categories: ['Banconisti', 'Camerieri'],
      email: 'Ele@gmail.com',
      phone: '3334578532',
      department_assignments: getDepartmentIds([
        'Bancone',
        'Sala',
        'Sala B',
        'Deoor',
        'Plonge',
      ]), // Bancone + Sala + Sala B + Deoor + Plonge
      haccpExpiry: '2026-10-01',
      notes: 'Dipendente multiruolo con accesso a più reparti',
    },
  ]

  const conservationPoints = [
    {
      id: generateId(),
      name: 'Frigo A',
      departmentId: getDepartmentId('Cucina'),
      targetTemperature: 4,
      pointType: 'fridge' as const,
      isBlastChiller: false,
      productCategories: ['fresh_meat', 'fresh_dairy'],
      source: 'prefill' as const,
    },
    {
      id: generateId(),
      name: 'Freezer A',
      departmentId: getDepartmentId('Cucina'),
      targetTemperature: -18,
      pointType: 'freezer' as const,
      isBlastChiller: false,
      productCategories: ['frozen', 'deep_frozen'],
      source: 'prefill' as const,
    },
    {
      id: generateId(),
      name: 'Freezer B',
      departmentId: getDepartmentId('Cucina'),
      targetTemperature: -20,
      pointType: 'freezer' as const,
      isBlastChiller: false,
      productCategories: ['frozen', 'deep_frozen'],
      source: 'prefill' as const,
    },
    {
      id: generateId(),
      name: 'Abbattitore',
      departmentId: getDepartmentId('Cucina'),
      targetTemperature: -25,
      pointType: 'blast' as const,
      isBlastChiller: true,
      productCategories: ['blast_chilling'],
      source: 'prefill' as const,
    },
    {
      id: generateId(),
      name: 'Frigo 1',
      departmentId: getDepartmentId('Bancone'),
      targetTemperature: 2,
      pointType: 'fridge' as const,
      isBlastChiller: false,
      productCategories: ['beverages', 'fresh_produce'],
      source: 'prefill' as const,
    },
    {
      id: generateId(),
      name: 'Frigo 2',
      departmentId: getDepartmentId('Bancone'),
      targetTemperature: 3,
      pointType: 'fridge' as const,
      isBlastChiller: false,
      productCategories: ['beverages', 'fresh_produce'],
      source: 'prefill' as const,
    },
    {
      id: generateId(),
      name: 'Frigo 3',
      departmentId: getDepartmentId('Bancone'),
      targetTemperature: 5,
      pointType: 'fridge' as const,
      isBlastChiller: false,
      productCategories: ['beverages', 'fresh_produce'],
      source: 'prefill' as const,
    },
  ]

  return {
    business: {
      name: 'Al Ritrovo SRL',
      address: 'Via centotrecento 1/1b Bologna 40128',
      phone: '0511234567',
      email: '000@gmail.com',
      vat_number: 'IT01234567890',
      business_type: 'ristorante',
      established_date: '2020-01-15',
      license_number: 'RIS-2020-001',
    },
    departments: departments,
    staff: staff,
    conservation: {
      points: conservationPoints,
    },
    tasks: {
      conservationMaintenancePlans:
        generateConservationMaintenancePlans(conservationPoints),
      genericTasks: [
        {
          id: generateId(),
          name: 'Pulizia approfondita cucina',
          frequenza: 'settimanale' as const,
          assegnatoARuolo: 'dipendente' as const,
          assegnatoACategoria: 'Cuochi',
          assegnatoADipendenteSpecifico: undefined,
          giorniCustom: undefined,
          note: 'Pulizia e sanificazione completa area cucina ogni settimana',
        },
        {
          id: generateId(),
          name: 'Controllo giacenze magazzino',
          frequenza: 'settimanale' as const,
          assegnatoARuolo: 'responsabile' as const,
          assegnatoACategoria: undefined,
          assegnatoADipendenteSpecifico: undefined,
          giorniCustom: undefined,
          note: 'Verifica inventario e ordini settimanali',
        },
        {
          id: generateId(),
          name: 'Pulizia bancone servizio',
          frequenza: 'giornaliera' as const,
          assegnatoARuolo: 'dipendente' as const,
          assegnatoACategoria: 'Banconisti',
          assegnatoADipendenteSpecifico: undefined,
          giorniCustom: undefined,
          note: 'Sanificazione quotidiana bancone e attrezzature',
        },
        {
          id: generateId(),
          name: 'Controllo e pulizia sala',
          frequenza: 'giornaliera' as const,
          assegnatoARuolo: 'dipendente' as const,
          assegnatoACategoria: 'Camerieri',
          assegnatoADipendenteSpecifico: undefined,
          giorniCustom: undefined,
          note: 'Pulizia tavoli, pavimenti e controllo generale sala',
        },
      ],
      generalTasks: [],
      maintenanceTasks: [],
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
