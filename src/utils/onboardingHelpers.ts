import { safeSetItem, clearAllStorage, clearHaccpData } from './safeStorage'
import { toast } from 'react-toastify'
import { AllergenType } from '@/types/inventory'
import type { OnboardingData } from '@/types/onboarding'
import { supabase } from '@/lib/supabase/client'

// Funzione per generare UUID validi (RFC 4122 v4)
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Funzione per generare le manutenzioni precompilate per ogni punto di conservazione
const generateConservationMaintenancePlans = (conservationPoints: any[]) => {
  const generateId = generateUUID

  // Manutenzioni standard per ogni punto di conservazione (da PRECOMPILATION_AND_RESET_GUIDE.md righe 166-197)
  const standardMaintenances = [
    {
      manutenzione: 'rilevamento_temperatura' as const, // ✅ Corretto: inglese
      frequenza: 'mensile' as const,
      assegnatoARuolo: 'responsabile' as const,
      assegnatoACategoria: 'Banconisti',
      assegnatoADipendenteSpecifico: undefined,
      giorniCustom: undefined,
      note: 'Controllo temperatura mensile',
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
      // I punti di tipo "ambient" non hanno "sbrinamento" (defrosting)
      // Database usa 'ambient' (inglese), non 'ambiente'
      if (
        point.pointType === 'ambient' &&
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
  const generateId = generateUUID

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
 * Reset selettivo dei dati operativi di una company
 * PRESERVA: companies, users, company_members
 * CANCELLA: staff, departments, products, conservation, etc.
 */
const resetCompanyOperationalData = async (companyId: string): Promise<void> => {
  console.log('🗑️ Reset dati operativi per company:', companyId)

  try {
    // Lista delle tabelle da pulire (dati operativi)
    // ⚠️ NON includere: companies, company_members, user_sessions (CRITICI!)
    const tablesToClean = [
      'staff',
      'departments', 
      'products',
      'product_categories',
      'conservation_points',
      'temperature_readings',
      'maintenance_tasks',
      'maintenance_completions',
      'calendar_events',
      'shopping_lists',
      'shopping_list_items',
      'haccp_configurations',
      'notification_preferences',
      'audit_logs'
      // ❌ NON cancellare user_sessions - contiene active_company_id necessario!
    ]

    // Pulisce ogni tabella
    for (const table of tablesToClean) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('company_id', companyId)

        if (error) {
          console.warn(`⚠️ Errore pulizia ${table}:`, error.message)
        } else {
          console.log(`✅ Pulito ${table}`)
        }
      } catch (err) {
        console.warn(`⚠️ Errore pulizia ${table}:`, err)
      }
    }

    console.log('✅ Reset dati operativi completato')
  } catch (error) {
    console.error('❌ Errore reset dati operativi:', error)
    throw error
  }
}

/**
 * Reset completo dell'app (solo sviluppo)
 * NUOVA VERSIONE: include purge database + cache QueryClient
 */
export const resetApp = async (): Promise<void> => {
  const confirmed = window.confirm(
    '🔄 RESET DATI OPERATIVI\n\n' +
      'Questa operazione cancellerà:\n' +
      '- Staff, Departments, Products\n' +
      '- Conservation Points, Temperature Readings\n' +
      '- Maintenance Tasks, Calendar Events\n' +
      '- Shopping Lists, Inventory Data\n' +
      '- localStorage e sessionStorage\n' +
      '- Cache di React Query\n\n' +
      '✅ PRESERVATO:\n' +
      '- Companies (aziende)\n' +
      '- Users (utenti)\n' +
      '- Company Members (associazioni)\n\n' +
      '⚠️ ATTENZIONE: OPERAZIONE IRREVERSIBILE!\n\n' +
      'Sei sicuro di voler procedere?'
  )

  if (!confirmed) {
    console.log("🔄 Reset app annullato dall'utente")
    return
  }

  console.log('🔄 Reset selettivo dati operativi...')

  try {
    // 1. Ottieni company_id dall'utente autenticato
    const { data: { user } } = await supabase.auth.getUser()
    let companyId: string | null = null

    if (user?.id) {
      // Usa funzione RLS helper per ottenere company_id attivo
      const { data: activeCompanyId, error } = await supabase.rpc('get_active_company_id')
      
      if (!error && activeCompanyId) {
        companyId = activeCompanyId
      }
    }

    // 2. Reset selettivo se abbiamo company_id
    if (companyId) {
      console.log('🗑️ Reset dati operativi per company_id:', companyId)
      await resetCompanyOperationalData(companyId)
    } else {
      console.warn('⚠️ Nessun company_id trovato - skip database reset')
    }

    // 3. Pulisce storage locale
    clearAllStorage()

    // 4. Pulisce cache React Query (se disponibile)
    if (window.queryClient) {
      console.log('🗑️ Clearing React Query cache...')
      window.queryClient.clear()
    }

    console.log('✅ Reset app + database completato con successo')
    toast.success('App e database resettati completamente!', {
      position: 'top-right',
      autoClose: 2000,
    })

    // 5. Ricarica la pagina per hard refresh
    setTimeout(() => {
      window.location.reload()
    }, 500)
  } catch (error) {
    console.error('❌ Errore nel reset app:', error)
    toast.error(`Errore durante il reset: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      position: 'top-right',
      autoClose: 5000,
    })
  }
}

/**
 * Helper functions for data mapping
 */
const mapManutenzioneTipo = (tipo: string): string => {
  // Mapping ai valori enum effettivi di maintenance_task_kind
  // Valori disponibili: 'temperature', 'sanitization', 'defrosting'
  const map: Record<string, string> = {
    'rilevamento_temperatura': 'temperature',
    'sanificazione': 'sanitization',
    'sbrinamento': 'defrosting',
    'controllo_scadenze': 'temperature', // Fallback a temperature per controllo scadenze
  }
  return map[tipo] || 'sanitization' // Default fallback
}

const mapFrequenza = (frequenza: string): string => {
  const map: Record<string, string> = {
    'giornaliera': 'daily',
    'settimanale': 'weekly',
    'mensile': 'monthly',
    'annuale': 'annually',  // ✅ Fixed: DB requires 'annually' not 'annual'
    'custom': 'custom',
  }
  return map[frequenza] || 'weekly'
}

const calculateNextDue = (frequenza: string): string => {
  const now = new Date()
  switch (frequenza) {
    case 'giornaliera':
      return new Date(now.setDate(now.getDate() + 1)).toISOString()
    case 'settimanale':
      return new Date(now.setDate(now.getDate() + 7)).toISOString()
    case 'mensile':
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString()
    case 'annuale':
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
    default:
      return new Date(now.setDate(now.getDate() + 7)).toISOString()
  }
}

/**
 * Pulisce i dati esistenti dell'onboarding per evitare duplicati
 * 
 * IMPORTANTE: NON elimina mai company_members - quella tabella è gestita
 * separatamente e contiene le associazioni utente-azienda critiche!
 */
const cleanExistingOnboardingData = async (companyId: string) => {
  console.log('🧹 Cleaning existing onboarding data...')

  try {
    // Elimina in ordine inverso per rispettare le foreign keys
    // ⚠️ NON eliminare company_members - potrebbe disconnettere utenti!
    await supabase.from('products').delete().eq('company_id', companyId)
    await supabase.from('product_categories').delete().eq('company_id', companyId)
    await supabase.from('tasks').delete().eq('company_id', companyId)
    await supabase.from('maintenance_tasks').delete().eq('company_id', companyId)
    await supabase.from('conservation_points').delete().eq('company_id', companyId)
    await supabase.from('staff').delete().eq('company_id', companyId)
    await supabase.from('departments').delete().eq('company_id', companyId)
    // ⚠️ NON toccare: companies, company_members, user_sessions

    console.log('✅ Existing onboarding data cleaned (preserving company_members)')
  } catch (error) {
    console.warn('⚠️ Error cleaning existing data (might not exist):', error)
  }
}

/**
 * Crea company durante onboarding per primo cliente
 */
const createCompanyFromOnboarding = async (formData: OnboardingData): Promise<string> => {
  console.log('🏢 Creando company per primo cliente...')
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) {
    throw new Error('Utente non autenticato')
  }

  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      name: formData.business?.name || 'Nuova Azienda',
      address: formData.business?.address || '',
      email: user.email || '',
      staff_count: 0, // Inizialmente 0, verrà aggiornato quando si aggiungono dipendenti
    })
    .select('id')
    .single()

  if (error || !company) {
    throw new Error(`Errore creazione company: ${error?.message}`)
  }

  console.log('✅ Company creata:', company.id)

  // Associa l'utente alla company come admin
  const { error: memberError } = await supabase
    .from('company_members')
    .insert({
      user_id: user.id,
      company_id: company.id,
      role: 'admin',
      staff_id: null,
      is_active: true,
    })

  if (memberError) {
    console.error('❌ Errore associazione company_member:', memberError)
    throw new Error(`Errore associazione utente: ${memberError.message}`)
  }

  console.log('✅ Utente associato alla company come admin')
  return company.id
}

/**
 * Salva tutti i dati su Supabase
 */
const saveAllDataToSupabase = async (formData: OnboardingData, companyId: string | null) => {
  // Se companyId è NULL, crea la company
  if (!companyId) {
    console.log('🔧 Creando company durante onboarding...')
    companyId = await createCompanyFromOnboarding(formData)
  }

  // Pulisci i dati esistenti prima di inserire nuovi dati
  await cleanExistingOnboardingData(companyId)

  // Salva informazioni aziendali
  // Riferimento: SUPABASE_SCHEMA_MAPPING.md - Section 1: companies
  if (formData.business) {
    const businessUpdate: Record<string, any> = {
      name: formData.business.name,                      // ✅ DISPONIBILE
      address: formData.business.address,                // ✅ DISPONIBILE
      email: formData.business.email,                    // ✅ DISPONIBILE
      staff_count: formData.staff?.length || 0,          // ✅ CALCOLARE
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('companies')
      .update(businessUpdate)
      .eq('id', companyId)

    if (error) {
      console.error('❌ Error updating company:', error)
      throw error
    }

    console.log('✅ Company updated successfully')
  }

  // Salva reparti
  // Riferimento: SUPABASE_SCHEMA_MAPPING.md - Section 2: departments
  const departmentsIdMap = new Map<string, string>()
  
  if (formData.departments?.length) {
    const departments = formData.departments.map(dept => ({
      company_id: companyId,                // ✅ Da passare
      name: dept.name,                      // ✅ DISPONIBILE
      is_active: dept.is_active ?? true,    // ✅ DISPONIBILE
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
      // ❌ NON SALVARE: description (non esiste nella tabella)
      // ❌ NON SALVARE: id frontend (database genera il proprio)
    }))

    console.log('📤 Inserting departments:', departments.length)

    const { data: insertedDepts, error } = await supabase
      .from('departments')
      .insert(departments)
      .select('id, name')

    if (error) {
      console.error('❌ Error inserting departments:', error)
      console.error('❌ Departments data:', JSON.stringify(departments, null, 2))
      throw new Error(`Failed to insert departments: ${error.message}`)
    }

    // Crea mappa old_id -> new_id per mapping staff e conservation points
    if (insertedDepts) {
      formData.departments.forEach((dept: any, index: number) => {
        if (insertedDepts[index]) {
          departmentsIdMap.set(dept.id, insertedDepts[index].id)
        }
      })
    }

    console.log('✅ Departments inserted successfully:', departments.length)
    console.log('✅ Departments ID mapping:', Object.fromEntries(departmentsIdMap))
  }

  // Salva staff
  // Riferimento: SUPABASE_SCHEMA_MAPPING.md - Section 3: staff
  if (formData.staff?.length) {
    const staff = formData.staff.map((person: any) => {
      // Mappa department_assignments con ID reali
      let mappedDepartments = null
      if (person.department_assignments && Array.isArray(person.department_assignments)) {
        mappedDepartments = person.department_assignments
          .map((deptId: string) => departmentsIdMap.get(deptId) || deptId)
          .filter(Boolean)
      }

      return {
        company_id: companyId,                                                    // ✅ Da passare
        name: person.fullName || `${person.name} ${person.surname}`,             // ✅ DISPONIBILE
        role: person.role,                                                        // ✅ DISPONIBILE
        category: Array.isArray(person.categories)
          ? person.categories[0] || 'Altro'
          : person.category,                                                      // ✅ DISPONIBILE
        email: person.email || null,                                              // ✅ DISPONIBILE
        phone: person.phone || null,                                              // ✅ DISPONIBILE
        hire_date: null,                                                          // ⚠️ Non presente
        status: 'active',                                                         // ✅ Default
        notes: person.notes || null,                                              // ✅ DISPONIBILE
        haccp_certification: person.haccpExpiry ? {
          level: 'base',
          expiry_date: person.haccpExpiry,
          issuing_authority: '',
          certificate_number: ''
        } : null,                                                                 // ✅ DISPONIBILE
        department_assignments: mappedDepartments,                                // ✅ Con ID reali
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })

    const { error } = await supabase.from('staff').insert(staff)

    if (error) {
      console.error('❌ Error inserting staff:', error)
      throw error
    }

    console.log('✅ Staff inserted successfully:', staff.length)
  }

  // Salva punti conservazione
  // Riferimento: SUPABASE_SCHEMA_MAPPING.md - Section 4: conservation_points
  const conservationPointsIdMap = new Map<string, string>()

  if (formData.conservation?.points?.length) {
    const points = formData.conservation.points.map((point: any) => ({
      company_id: companyId,
      department_id: departmentsIdMap.get(point.departmentId) || point.departmentId, // ✅ Usa ID reale
      name: point.name,
      setpoint_temp: point.targetTemperature,
      type: point.pointType,
      product_categories: point.productCategories || [],
      is_blast_chiller: point.isBlastChiller || false,
      status: 'normal',
      maintenance_due: point.maintenanceDue || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { data: insertedPoints, error } = await supabase
      .from('conservation_points')
      .insert(points)
      .select('id, name')

    if (error) {
      console.error('❌ Error inserting conservation points:', error)
      throw error
    }

    // Crea mappa old_id -> new_id per mapping products e maintenance tasks
    if (insertedPoints) {
      formData.conservation.points.forEach((point: any, index: number) => {
        if (insertedPoints[index]) {
          conservationPointsIdMap.set(point.id, insertedPoints[index].id)
        }
      })
    }

    console.log('✅ Conservation points inserted successfully:', points.length)
    console.log('✅ Conservation points ID mapping:', Object.fromEntries(conservationPointsIdMap))
  }

  // Salva manutenzioni punti conservazione
  // Riferimento: SUPABASE_SCHEMA_MAPPING.md - Section 5: maintenance_tasks
  if (formData.tasks?.conservationMaintenancePlans?.length) {
    const maintenanceTasks = formData.tasks.conservationMaintenancePlans
      .map((plan: any) => {
        // Ottieni il vero ID dal database usando la mappa
        const realConservationPointId = conservationPointsIdMap.get(plan.conservationPointId)

        if (!realConservationPointId) {
          console.warn(`⚠️ Skipping maintenance task - conservation point not found: ${plan.conservationPointId}`)
          return null
        }

        return {
          company_id: companyId,
          conservation_point_id: realConservationPointId, // ✅ Usa ID reale
          type: mapManutenzioneTipo(plan.manutenzione),
          frequency: mapFrequenza(plan.frequenza),
          title: `Manutenzione: ${plan.manutenzione}`,
          description: plan.note || '',
          priority: 'medium',
          status: 'scheduled',
          next_due: calculateNextDue(plan.frequenza),
          estimated_duration: 60,
          instructions: [],
          assigned_to_staff_id:
            plan.assegnatoARuolo === 'specifico'
              ? plan.assegnatoADipendenteSpecifico
              : null,
          assigned_to_role:
            plan.assegnatoARuolo !== 'specifico' ? plan.assegnatoARuolo : null,
          assigned_to_category: plan.assegnatoACategoria || null,
          assigned_to:
            plan.assegnatoADipendenteSpecifico || plan.assegnatoARuolo || '',
          assignment_type:
            plan.assegnatoARuolo === 'specifico' ? 'staff' : 'role',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
      .filter(Boolean) // Rimuovi null

    if (maintenanceTasks.length > 0) {
      console.log('📤 Inserting maintenance tasks:', maintenanceTasks.length)
      console.log('📤 Sample task:', JSON.stringify(maintenanceTasks[0], null, 2))

      const { error } = await supabase
        .from('maintenance_tasks')
        .insert(maintenanceTasks)

      if (error) {
        console.error('❌ Error inserting maintenance tasks:', error)
        console.error('❌ Error message:', error.message)
        throw new Error(`Failed to insert maintenance tasks: ${error.message}`)
      }

      console.log('✅ Maintenance tasks inserted successfully:', maintenanceTasks.length)
    } else {
      console.warn('⚠️ No maintenance tasks to insert - all conservation points missing')
    }
  }

  // Salva generic tasks
  if (formData.tasks?.genericTasks?.length) {
    const genericTasks = formData.tasks.genericTasks.map((task: any) => ({
      company_id: companyId,
      name: task.name,
      frequency: mapFrequenza(task.frequenza),
      description: task.note || '',
      department_id: null,
      conservation_point_id: null,
      priority: 'medium',
      estimated_duration: 60,
      checklist: [],
      required_tools: [],
      haccp_category: null,
      next_due: calculateNextDue(task.frequenza),
      status: 'pending',
      assigned_to_staff_id:
        task.assegnatoARuolo === 'specifico'
          ? task.assegnatoADipendenteSpecifico
          : null,
      assigned_to_role:
        task.assegnatoARuolo !== 'specifico' ? task.assegnatoARuolo : null,
      assigned_to_category: task.assegnatoACategoria || null,
      assigned_to:
        task.assegnatoADipendenteSpecifico || task.assegnatoARuolo || '',
      assignment_type: task.assegnatoARuolo === 'specifico' ? 'staff' : 'role',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from('tasks').insert(genericTasks)

    if (error) throw error
  }

  // Salva categorie prodotti
  // Riferimento: SUPABASE_SCHEMA_MAPPING.md - Section 7: product_categories
  const categoriesIdMap = new Map<string, string>()
  
  if (formData.inventory?.categories?.length) {
    const categories = formData.inventory.categories.map(category => ({
      company_id: companyId,                  // ✅ Da passare
      name: category.name,                    // ✅ DISPONIBILE
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
      // ❌ NON SALVARE: color, description, conservationRules (solo frontend)
      // ❌ NON SALVARE: id frontend (database genera il proprio)
    }))

    const { data: insertedCategories, error: catError } = await supabase
      .from('product_categories')
      .insert(categories)
      .select('id, name')

    if (catError) {
      console.error('❌ Error inserting product categories:', catError)
      throw catError
    }

    // Crea mappa old_id -> new_id per mapping products
    if (insertedCategories) {
      formData.inventory.categories.forEach((cat: any, index: number) => {
        if (insertedCategories[index]) {
          categoriesIdMap.set(cat.id, insertedCategories[index].id)
        }
      })
    }

    console.log('✅ Product categories inserted successfully:', categories.length)
    console.log('✅ Product categories ID mapping:', Object.fromEntries(categoriesIdMap))
  }

  // Salva prodotti
  // Riferimento: SUPABASE_SCHEMA_MAPPING.md - Section 8: products
  if (formData.inventory?.products?.length) {
    const products = formData.inventory.products.map(product => ({
      company_id: companyId,                                // ✅ Da passare
      name: product.name,                                   // ✅ DISPONIBILE
      category_id: categoriesIdMap.get(product.categoryId) || null,              // ✅ Usa ID reale
      department_id: departmentsIdMap.get(product.departmentId) || null,          // ✅ Usa ID reale
      conservation_point_id: conservationPointsIdMap.get(product.conservationPointId) || null, // ✅ Usa ID reale
      barcode: product.barcode || null,                     // ✅ DISPONIBILE
      sku: product.sku || null,                             // ✅ DISPONIBILE
      supplier_name: product.supplierName || null,          // ✅ DISPONIBILE
      purchase_date: product.purchaseDate || null,          // ✅ DISPONIBILE
      expiry_date: product.expiryDate || null,              // ✅ DISPONIBILE
      quantity: product.quantity || null,                   // ✅ DISPONIBILE
      unit: product.unit || null,                           // ✅ DISPONIBILE
      allergens: product.allergens || [],                   // ✅ DISPONIBILE
      label_photo_url: product.labelPhotoUrl || null,       // ✅ DISPONIBILE
      notes: product.notes || null,                         // ✅ DISPONIBILE
      status: product.status || 'active',                   // ✅ DISPONIBILE
      compliance_status: product.complianceStatus || null,  // ✅ DISPONIBILE
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
      // ❌ NON SALVARE: id frontend (database genera il proprio)
    }))

    console.log('📤 Inserting products with mapped IDs:', products.length)
    console.log('📤 Sample product:', JSON.stringify(products[0], null, 2))

    const { error } = await supabase.from('products').insert(products)

    if (error) {
      console.error('❌ Error inserting products:', error)
      throw error
    }

    console.log('✅ Products inserted successfully:', products.length)
  }
}

/**
 * Completa automaticamente l'onboarding
 * Nota: Questa funzione può essere chiamata sia dal componente OnboardingWizard
 * che dai DevButtons per testing.
 *
 * @param companyIdParam - ID dell'azienda (opzionale, verrà cercato se non fornito)
 * @param formDataParam - Dati dell'onboarding (opzionale, verranno letti da localStorage se non forniti)
 */
export const completeOnboarding = async (
  companyIdParam?: string,
  formDataParam?: OnboardingData
): Promise<void> => {
  console.log('🔄 Completamento automatico onboarding...')

  try {
    let formData: OnboardingData

    // Usa formData passato come parametro se disponibile, altrimenti leggi da localStorage
    if (formDataParam) {
      formData = formDataParam
    } else {
      // Prima precompila i dati se non esistono
      let existingData = localStorage.getItem('onboarding-data')
      if (!existingData) {
        prefillOnboarding()
        existingData = localStorage.getItem('onboarding-data')
      }

      if (!existingData) {
        throw new Error('Nessun dato di onboarding trovato')
      }

      formData = JSON.parse(existingData)
    }

    // Recupera il companyId
    let companyId = companyIdParam

    if (!companyId) {
      // Prova a recuperare il company_id dall'utente autenticato (Supabase Auth)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.id) {
        throw new Error('Utente non autenticato. Effettua il login e riprova.')
      }

      // Verifica se utente ha già un company_member record
      const { data: existingMember, error: memberError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .single()

      if (existingMember && existingMember.company_id) {
        // Utente ha già una company associata → usa quella esistente
        console.log('✅ Company esistente trovata:', existingMember.company_id)
        companyId = existingMember.company_id
      } else {
        // Nessuna company associata → creane una nuova durante onboarding
        console.log('🔧 Nessuna company trovata - creando nuova company durante onboarding')
        companyId = null
      }
    }

    console.log('🏢 Company ID:', companyId)

    // Salva tutti i dati su Supabase
    await saveAllDataToSupabase(formData, companyId!)

    // CRITICAL: Assicurati che user_sessions sia creata/aggiornata con il company_id corretto
    if (companyId) {
      // Recupera utente corrente
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser?.id) {
        console.log('🔄 Aggiornamento user_sessions con company_id:', companyId)
        
        const { error: sessionError } = await supabase
          .from('user_sessions')
          .upsert({
            user_id: currentUser.id,
            active_company_id: companyId,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          })

        if (sessionError) {
          console.error('❌ Errore aggiornamento sessione:', sessionError)
          throw new Error(`Impossibile aggiornare sessione: ${sessionError.message}`)
        }

        console.log('✅ User session aggiornata con active_company_id')
      }
    }

    // Marca onboarding come completato nel localStorage
    // Nota: i campi onboarding_completed/onboarding_completed_at non esistono in companies table
    localStorage.setItem('onboarding-completed', 'true')
    localStorage.setItem('onboarding-completed-at', new Date().toISOString())

    // Pulisci localStorage onboarding data
    localStorage.removeItem('onboarding-data')

    console.log('✅ Onboarding completato automaticamente')
    toast.success('Onboarding completato con successo!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // Reindirizza alla dashboard
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 1000)
  } catch (error) {
    console.error('❌ Errore nel completamento automatico:', error)
    toast.error(`Errore durante il completamento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`, {
      position: 'top-right',
      autoClose: 5000,
    })
  }
}
