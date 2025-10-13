import { safeSetItem, clearAllStorage, clearHaccpData } from './safeStorage'
import { toast } from 'react-toastify'
import { AllergenType } from '@/types/inventory'
import type { OnboardingData } from '@/types/onboarding'
import { supabase } from '@/lib/supabase/client'
import { createInviteToken, sendInviteEmail } from '@/services/auth/inviteService'
import { getCompanyIdForOnboarding, hasDevCompany } from './devCompanyHelper'

// Funzione per cancellare tutti i dati di una company (mantenendo solo la company stessa)
const deleteCompanyData = async (companyId: string): Promise<void> => {
  console.log('🗑️ Cancellazione dati company:', companyId)
  
  try {
    // Cancella in ordine di dipendenze (FK constraints)
    const deleteOperations = [
      // 1. Dati utente/sessione
      supabase.from('user_sessions').delete().eq('company_id', companyId),
      supabase.from('audit_logs').delete().eq('company_id', companyId),
      supabase.from('user_profiles').delete().eq('company_id', companyId),
      
      // 2. Task completions e temperature
      supabase.from('task_completions').delete().eq('company_id', companyId),
      supabase.from('temperature_readings').delete().eq('company_id', companyId),
      
      // 3. Shopping lists
      supabase.from('shopping_list_items').delete().eq('company_id', companyId),
      supabase.from('shopping_lists').delete().eq('company_id', companyId),
      
      // 4. Maintenance tasks e events
      supabase.from('maintenance_tasks').delete().eq('company_id', companyId),
      supabase.from('events').delete().eq('company_id', companyId),
      supabase.from('notes').delete().eq('company_id', companyId),
      supabase.from('non_conformities').delete().eq('company_id', companyId),
      
      // 5. Tasks (dipende da departments e staff)
      supabase.from('tasks').delete().eq('company_id', companyId),
      
      // 6. Products e conservation points
      supabase.from('products').delete().eq('company_id', companyId),
      supabase.from('product_categories').delete().eq('company_id', companyId),
      supabase.from('conservation_points').delete().eq('company_id', companyId),
      
      // 7. Staff e departments
      supabase.from('staff').delete().eq('company_id', companyId),
      supabase.from('departments').delete().eq('company_id', companyId),
      
      // 8. Company members (mantiene la company)
      supabase.from('company_members').delete().eq('company_id', companyId),
    ]
    
    // Esegui tutte le cancellazioni in parallelo
    const results = await Promise.all(deleteOperations)
    
    console.log('✅ Cancellazione dati completata:', results.length, 'operazioni')
    
  } catch (error) {
    console.error('❌ Errore durante cancellazione dati company:', error)
    throw error
  }
}

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
  // const getDepartmentIds = (names: string[]) => {
  //   return departments
  //     .filter(dept =>
  //       names.some(name => dept.name.toLowerCase().includes(name.toLowerCase()))
  //     )
  //     .map(dept => dept.id)
  // }

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

  // ⚠️ IMPORTANTE: Il PRIMO membro è sempre l'admin che sta facendo l'onboarding
  // Questo membro NON riceverà invito (è già registrato)
  // Gli altri membri riceveranno inviti automatici
  const staff = [
    // 1️⃣ PRIMO MEMBRO: Admin che sta creando l'azienda (Paolo)
    {
      id: generateId(),
      name: 'Paolo',
      surname: 'Dettori',
      fullName: 'Paolo Dettori',
      role: 'admin' as const,
      categories: ['Cuochi', 'Amministratore'],
      email: 'matteo.cavallaro.work@gmail.com',
      phone: '3334578534',
      department_assignments: getAllDepartmentIds(), // Tutti i reparti
      haccpExpiry: '2025-10-01',
      notes: 'Amministratore - Primo utente che ha creato l\'azienda',
      isCurrentUser: true, // ⚠️ Flag per identificare l'utente corrente
    },
    // 2️⃣ Altri membri: Riceveranno inviti automatici
    {
      id: generateId(),
      name: 'Matteo',
      surname: 'Cavallaro',
      fullName: 'Matteo Cavallaro',
      role: 'responsabile' as const,
      categories: ['Banconisti'],
      email: 'matti169cava@libero.it',
      phone: '3334578536',
      department_assignments: getAllDepartmentIds(), // Tutti i reparti
      haccpExpiry: '2025-10-01',
      notes: 'Responsabile con accesso a tutti i reparti',
    },
    {
      id: generateId(),
      name: 'Elena',
      surname: 'Compagna',
      fullName: 'Elena Compagna',
      role: 'dipendente' as const,
      categories: ['Banconisti', 'Camerieri'],
      email: '0cavuz0@gmail.com',
      phone: '3334578532',
      department_assignments: [
        getDepartmentId('Bancone'),
        getDepartmentId('Sala'),
        getDepartmentId('Sala B'),
        getDepartmentId('Deoor'),
        getDepartmentId('Plonge'),
      ].filter(Boolean), // Bancone + Sala + Sala B + Deoor + Plonge
      haccpExpiry: '2026-10-01',
      notes: 'Dipendente multiruolo con accesso a più reparti',
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
      department_assignments: [
        getDepartmentId('Sala'),
        getDepartmentId('Sala B'),
        getDepartmentId('Deoor'),
        getDepartmentId('Plonge'),
      ].filter(Boolean), // Sala + Sala B + Deoor + Plonge
      haccpExpiry: '2026-10-01',
      notes: 'Amministratore con accesso a Sala, Sala B, Deoor e Plonge',
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
      department_assignments: [getDepartmentId('Bancone')].filter(Boolean), // Bancone
      haccpExpiry: '2026-10-01',
      notes: 'Dipendente specializzato al bancone',
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
    },
    inventory: {
      categories: [
        {
          id: generateId(),
          name: 'Carni Fresche',
          color: '#ef4444',
          conservationRules: {
            minTemp: 1,
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
            minTemp: 1,
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
            minTemp: 2,
            maxTemp: 8,
            maxStorageDays: 5,
          },
        },
        {
          id: generateId(),
          name: 'Bevande',
          color: '#06b6d4',
          conservationRules: {
            minTemp: 2,
            maxTemp: 12,
            maxStorageDays: 30,
          },
        },
        {
          id: generateId(),
          name: 'Dispensa Secca',
          color: '#d97706',
          conservationRules: {
            minTemp: 15,
            maxTemp: 25,
            maxStorageDays: 180,
          },
        },
        {
          id: generateId(),
          name: 'Congelati',
          color: '#6366f1',
          conservationRules: {
            minTemp: -25,
            maxTemp: -1,
            maxStorageDays: 180,
          },
        },
        {
          id: generateId(),
          name: 'Ultracongelati',
          color: '#8b5cf6',
          conservationRules: {
            minTemp: -25,
            maxTemp: -1,
            maxStorageDays: 365,
          },
        },
        {
          id: generateId(),
          name: 'Abbattimento Rapido',
          color: '#ec4899',
          conservationRules: {
            minTemp: -90,
            maxTemp: -15,
            maxStorageDays: 1,
            requiresBlastChilling: true,
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
 * ⚠️ NUOVO: Usa l'email dell'utente corrente per il primo membro (admin)
 */
export const prefillOnboarding = async (): Promise<void> => {
  console.log('🔄 Precompilazione onboarding...')

  try {
    // Pulisce COMPLETAMENTE tutti i dati esistenti per evitare conflitti
    clearAllStorage()

    // Ottieni email utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserEmail = user?.email || 'matteo.cavallaro.work@gmail.com' // Fallback
    const currentUserFirstName = user?.user_metadata?.first_name || 'Paolo'
    const currentUserLastName = user?.user_metadata?.last_name || 'Dettori'

    console.log('👤 Utente corrente:', {
      email: currentUserEmail,
      nome: currentUserFirstName,
      cognome: currentUserLastName,
    })

    // Ottiene i dati precompilati
    const data = getPrefillData()

    // ⚠️ IMPORTANTE: Sostituisci il primo staff member con i dati dell'utente corrente
    if (data.staff && data.staff.length > 0) {
      console.log('🔄 Sostituisco primo staff member con dati utente corrente...')
      
      data.staff[0] = {
        ...data.staff[0],
        name: currentUserFirstName,
        surname: currentUserLastName,
        fullName: `${currentUserFirstName} ${currentUserLastName}`,
        email: currentUserEmail,
        role: 'admin' as const, // Primo membro è sempre admin
        notes: 'Amministratore - Primo utente che ha creato l\'azienda',
      }

      console.log('✅ Primo staff member aggiornato:', data.staff[0])
    }

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
 * Reset Onboarding - Elimina solo dati inseriti con "Precompila"
 * PRESERVA i dati inseriti manualmente dall'utente
 */
export const resetOnboardingData = (): void => {
  const confirmed = window.confirm(
    '🔄 RESET ONBOARDING\n\n' +
      'Questa operazione cancellerà SOLO i dati inseriti con "Precompila":\n' +
      '- Paolo Dettori e staff da Precompila\n' +
      '- Reparti da Precompila (Cucina, Bancone, etc.)\n' +
      '- Punti Conservazione da Precompila (Frigo A, Freezer A, etc.)\n' +
      '- Prodotti da Precompila (Pollo, Salmone, etc.)\n' +
      '- Attività e Manutenzioni da Precompila\n' +
      '- localStorage onboarding\n' +
      '- Cache di React Query\n\n' +
      '✅ PRESERVATO:\n' +
      '- Dati inseriti manualmente dall\'utente\n' +
      '- Companies (aziende)\n' +
      '- Users (utenti)\n' +
      '- Company Members (associazioni)\n' +
      '- Token di autenticazione (rimani loggato)\n\n' +
      '⚠️ ATTENZIONE: OPERAZIONE IRREVERSIBILE!\n\n' +
      'Sei sicuro di voler procedere?'
  )

  if (!confirmed) {
    console.log("🔄 Reset onboarding annullato dall'utente")
    return
  }

  console.log('🔄 Reset dati onboarding...')

  try {
    // Pulisce solo dati da Precompila
    clearPrefillData()

    console.log('✅ Reset onboarding completato con successo')
    toast.success('Dati onboarding rimossi!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // Ricarica la pagina dopo un breve delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('❌ Errore durante reset onboarding:', error)
    toast.error('Errore durante il reset', {
      position: 'top-right',
      autoClose: 3000,
    })
  }
}

/**
 * Reset All Data - Elimina TUTTI i dati (onboarding + utente manuale)
 */
export const resetAllData = async (): Promise<void> => {
  const confirmed = window.confirm(
    '🔄 RESET ALL DATA\n\n' +
      'Questa operazione cancellerà TUTTI i dati:\n' +
      '- TUTTI i reparti (Precompila + manuali)\n' +
      '- TUTTO lo staff (Precompila + manuali)\n' +
      '- TUTTI i prodotti e categorie\n' +
      '- TUTTI i punti di conservazione\n' +
      '- TUTTE le manutenzioni e attività\n' +
      '- TUTTE le rilevazioni temperatura\n' +
      '- localStorage onboarding\n' +
      '- Cache di React Query\n\n' +
      '✅ PRESERVATO:\n' +
      '- Companies (aziende)\n' +
      '- Users (utenti)\n' +
      '- Company Members (associazioni)\n' +
      '- Token di autenticazione (rimani loggato)\n\n' +
      '⚠️ ATTENZIONE: OPERAZIONE IRREVERSIBILE!\n\n' +
      'Sei sicuro di voler procedere?'
  )

  if (!confirmed) {
    console.log("🔄 Reset all data annullato dall'utente")
    return
  }

  try {
    // Pulisce TUTTI i dati operativi
    const companyId = await getCurrentCompanyId()
    if (!companyId) {
      throw new Error('Company ID non trovato')
    }
    await resetCompanyOperationalData(companyId)

    console.log('✅ Reset all data completato con successo')
    toast.success('Tutti i dati rimossi!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // Ricarica la pagina dopo un breve delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('❌ Errore durante reset all data:', error)
    toast.error('Errore durante il reset', {
      position: 'top-right',
      autoClose: 3000,
    })
  }
}

/**
 * Reset Tot+Utenti - Elimina TUTTO inclusi utenti e token inviti
 */
export const resetTotAndUsers = async (): Promise<void> => {
  const confirmed = window.confirm(
    '🚨 RESET TOT+UTENTI\n\n' +
      'Questa operazione cancellerà TUTTO:\n' +
      '- TUTTI i dati dell\'app\n' +
      '- TUTTI gli utenti registrati\n' +
      '- TUTTI i token di invito\n' +
      '- TUTTE le company (eccetto quella corrente)\n' +
      '- TUTTE le associazioni utente-company\n' +
      '- localStorage onboarding\n' +
      '- Cache di React Query\n\n' +
      '✅ PRESERVATO:\n' +
      '- Company corrente\n' +
      '- Utente corrente (tu)\n' +
      '- Associazione corrente\n' +
      '- Sessione login (rimani loggato)\n\n' +
      '⚠️ ATTENZIONE: OPERAZIONE IRREVERSIBILE!\n\n' +
      'Sei sicuro di voler procedere?'
  )

  if (!confirmed) {
    console.log("🔄 Reset tot+utenti annullato dall'utente")
    return
  }

  try {
    // 1. Pulisce TUTTI i dati operativi
    const companyId = await getCurrentCompanyId()
    if (!companyId) {
      throw new Error('Company ID non trovato')
    }
    await resetCompanyOperationalData(companyId)

    // 2. Pulisce TUTTI i token inviti
    await supabase.from('invite_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 3. Pulisce TUTTI gli utenti (eccetto corrente)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      await supabase.from('company_members').delete().neq('user_id', currentUser.id)
      await supabase.from('user_sessions').delete().neq('user_id', currentUser.id)
    }

    console.log('✅ Reset tot+utenti completato con successo')
    toast.success('Tutto rimosso incluso utenti!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // Ricarica la pagina dopo un breve delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('❌ Errore durante reset tot+utenti:', error)
    toast.error('Errore durante il reset', {
      position: 'top-right',
      autoClose: 3000,
    })
  }
}

/**
 * Pulisce solo i dati inseriti manualmente dall'utente (esclude Precompila)
 */
const clearManualData = async (): Promise<void> => {
  console.log('🧹 Pulizia dati manuali...')
  
  try {
    const companyId = await getCurrentCompanyId()
    
    if (!companyId) {
      throw new Error('Company ID non trovato')
    }

    // Rimuove staff NON da Precompila (tutto tranne Paolo Dettori)
    await supabase
      .from('staff')
      .delete()
      .eq('company_id', companyId)
      .not('name', 'eq', 'Paolo Dettori')
      .not('email', 'eq', 'paolo.dettori@example.com')

    // Rimuove departments NON da Precompila (tutto tranne Cucina, Bancone, Sala, Magazzino)
    await supabase
      .from('departments')
      .delete()
      .eq('company_id', companyId)
      .not('name', 'in', ['Cucina', 'Bancone', 'Sala', 'Magazzino'])

    // Rimuove conservation points NON da Precompila
    await supabase
      .from('conservation_points')
      .delete()
      .eq('company_id', companyId)
      .not('name', 'like', '%Frigo A%')
      .not('name', 'like', '%Freezer A%')
      .not('name', 'like', '%Abbattitore%')

    // Rimuove prodotti NON da Precompila
    await supabase
      .from('products')
      .delete()
      .eq('company_id', companyId)
      .not('name', 'in', ['Pollo Intero', 'Salmone Fresco', 'Mozzarella di Bufala', 'Pomodori San Marzano'])

    // Rimuove TUTTE le temperature readings (sono sempre manuali)
    await supabase
      .from('temperature_readings')
      .delete()
      .eq('company_id', companyId)

    // Pulisce localStorage preservando token di autenticazione
    clearLocalStoragePreservingAuth()

    console.log('✅ Dati manuali rimossi')
  } catch (error) {
    console.error('❌ Errore pulizia dati manuali:', error)
    throw error
  }
}

/**
 * Pulisce solo i dati inseriti con "Precompila"
 */
const clearPrefillData = async (): Promise<void> => {
  console.log('🧹 Pulizia dati Precompila...')
  
  try {
    // Identifica e rimuove solo dati specifici da Precompila
    const companyId = await getCurrentCompanyId()
    
    if (!companyId) {
      throw new Error('Company ID non trovato')
    }

    // Rimuove staff specifico da Precompila
    await supabase
      .from('staff')
      .delete()
      .eq('company_id', companyId)
      .in('name', ['Paolo Dettori'])
      .in('email', ['paolo.dettori@example.com'])

    // Rimuove departments specifici da Precompila
    await supabase
      .from('departments')
      .delete()
      .eq('company_id', companyId)
      .in('name', ['Cucina', 'Bancone', 'Sala', 'Magazzino'])

    // Rimuove conservation points specifici da Precompila
    await supabase
      .from('conservation_points')
      .delete()
      .eq('company_id', companyId)
      .or('name.ilike.%Frigo A%,name.ilike.%Freezer A%,name.ilike.%Abbattitore%')

    // Rimuove prodotti specifici da Precompila
    await supabase
      .from('products')
      .delete()
      .eq('company_id', companyId)
      .in('name', ['Pollo Intero', 'Salmone Fresco', 'Mozzarella di Bufala', 'Pomodori San Marzano'])

    // Pulisce localStorage preservando token di autenticazione
    clearLocalStoragePreservingAuth()

    console.log('✅ Dati Precompila rimossi')
  } catch (error) {
    console.error('❌ Errore pulizia dati Precompila:', error)
    throw error
  }
}

/**
 * Ottiene l'ID della company corrente
 */
const getCurrentCompanyId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: session } = await supabase
      .from('user_sessions')
      .select('active_company_id')
      .eq('user_id', user.id)
      .single()

    return session?.active_company_id || null
  } catch (error) {
    console.error('❌ Errore ottenimento company ID:', error)
    return null
  }
}

/**
 * Pulisce localStorage preservando i token di autenticazione Supabase
 * Rimuove solo onboardingData e haccpData, mantiene token per utente loggato
 */
const clearLocalStoragePreservingAuth = (): void => {
  // Salva token di autenticazione Supabase
  const authKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('sb-') && key.includes('auth')
  )
  
  const authTokens: Record<string, string> = {}
  authKeys.forEach(key => {
    authTokens[key] = localStorage.getItem(key) || ''
  })

  // Pulisce localStorage
  localStorage.removeItem('onboardingData')
  localStorage.removeItem('haccpData')
  
  // Ripristina token di autenticazione
  Object.entries(authTokens).forEach(([key, value]) => {
    if (value) {
      localStorage.setItem(key, value)
    }
  })

  console.log('🔒 Token di autenticazione preservati:', authKeys.length)
}

/**
 * Reset selettivo dei dati operativi di una company
 * PRESERVA: companies, users, company_members
 * CANCELLA: staff, departments, products, conservation, etc.
 */
const resetCompanyOperationalData = async (companyId: string): Promise<void> => {
  console.log('🗑️ Reset dati operativi per company:', companyId)
  console.log('🔒 PRESERVANDO: Token di autenticazione Supabase in localStorage')

  try {
    // Lista delle tabelle da pulire (solo dati configurabili nell'onboarding)
    // ⚠️ PRESERVATO: companies, company_members, user_sessions, staff
    const tablesToClean = [
      'departments',           // ✅ Reparti
      'products',             // ✅ Prodotti
      'product_categories',   // ✅ Categorie prodotti
      'conservation_points',  // ✅ Punti di conservazione
      'temperature_readings', // ✅ Rilevazioni temperatura
      'maintenance_tasks',    // ✅ Manutenzioni
      'tasks',                // ✅ Attività generiche
      'calendar_events',
      'shopping_lists',
      'shopping_list_items',
      'audit_logs'
      // ❌ NON cancellare: staff, companies, company_members, user_sessions
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
 * Reset Manuale - Elimina solo dati inseriti manualmente dall'utente
 * PRESERVA i dati inseriti con "Precompila"
 */
export const resetManualData = async (): Promise<void> => {
  const confirmed = window.confirm(
    '🔄 RESET MANUALE\n\n' +
      'Questa operazione cancellerà SOLO i dati inseriti manualmente dall\'utente:\n' +
      '- Reparti aggiunti manualmente (esclude Precompila)\n' +
      '- Staff aggiunti manualmente (esclude Precompila)\n' +
      '- Prodotti e Categorie inseriti manualmente\n' +
      '- Punti Conservazione aggiunti manualmente\n' +
      '- Manutenzioni e Attività create manualmente\n' +
      '- Rilevazioni Temperatura\n' +
      '- localStorage onboarding\n' +
      '- Cache di React Query\n\n' +
      '✅ PRESERVATO:\n' +
      '- Dati inseriti con "Precompila" (Paolo Dettori, Cucina, etc.)\n' +
      '- Companies (aziende)\n' +
      '- Users (utenti)\n' +
      '- Company Members (associazioni)\n' +
      '- Token di autenticazione (rimani loggato)\n\n' +
      '⚠️ ATTENZIONE: OPERAZIONE IRREVERSIBILE!\n\n' +
      'Sei sicuro di voler procedere?'
  )

  if (!confirmed) {
    console.log("🔄 Reset manuale annullato dall'utente")
    return
  }

  try {
    // Pulisce solo dati inseriti manualmente (esclude Precompila)
    await clearManualData()

    console.log('✅ Reset manuale completato con successo')
    toast.success('Dati manuali rimossi!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // Ricarica la pagina dopo un breve delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('❌ Errore durante reset manuale:', error)
    toast.error('Errore durante il reset', {
      position: 'top-right',
      autoClose: 3000,
    })
  }
}

/**
 * Reset completo dell'app (legacy - mantenuto per compatibilità)
 */
export const resetApp = async (): Promise<void> => {
  const confirmed = window.confirm(
    '🔄 RESET APP (LEGACY)\n\n' +
      'Questa operazione cancellerà tutti i dati operativi:\n' +
      '- Reparti (Departments)\n' +
      '- Prodotti e Categorie\n' +
      '- Punti di Conservazione\n' +
      '- Manutenzioni e Attività\n' +
      '- Rilevazioni Temperatura\n' +
      '- localStorage onboarding\n' +
      '- Cache di React Query\n\n' +
      '✅ PRESERVATO:\n' +
      '- Companies (aziende)\n' +
      '- Users (utenti)\n' +
      '- Company Members (associazioni)\n' +
      '- Staff (dipendenti)\n' +
      '- Sessione login (rimani loggato)\n\n' +
      '⚠️ ATTENZIONE: OPERAZIONE IRREVERSIBILE!\n\n' +
      'Sei sicuro di voler procedere?'
  )

  if (!confirmed) {
    console.log("🔄 Reset app annullato dall'utente")
    return
  }

  try {
    const companyId = await getCurrentCompanyId()
    if (!companyId) {
      throw new Error('Company ID non trovato')
    }
    await resetCompanyOperationalData(companyId)

    console.log('✅ Reset app completato con successo')
    toast.success('App resettata!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // Ricarica la pagina dopo un breve delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
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
  // Imposta la scadenza a OGGI per permettere il completamento immediato
  // Le mansioni precompilate devono essere completabili subito dopo l'onboarding
  const now = new Date()
  
  switch (frequenza) {
    case 'giornaliera':
      // Giornaliera: scade oggi
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
    case 'settimanale':
      // Settimanale: scade oggi (inizio settimana corrente)
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
    case 'mensile':
      // Mensile: scade oggi (inizio mese corrente)
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
    case 'annuale':
      // Annuale: scade oggi (inizio anno corrente)
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
    default:
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
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

  // Guardia: verifica che companyId sia una stringa valida
  if (!companyId || typeof companyId !== 'string') {
    console.error('❌ Invalid companyId for cleaning:', companyId)
    throw new Error('Invalid company ID: must be a valid UUID string')
  }

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

  // Associa l'utente alla company come admin (usa upsert per prevenire duplicati)
  const { error: memberError } = await supabase
    .from('company_members')
    .upsert({
      user_id: user.id,
      company_id: company.id,
      role: 'admin',
      staff_id: null,
      is_active: true,
    }, {
      onConflict: 'user_id,company_id'
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
const saveAllDataToSupabase = async (formData: OnboardingData, companyId: string | null): Promise<string> => {
  // Se companyId è NULL, crea la company
  if (!companyId) {
    console.log('🔧 Creando company durante onboarding...')
    companyId = await createCompanyFromOnboarding(formData)
  }

  // Verifica che companyId sia una stringa valida
  if (!companyId || typeof companyId !== 'string') {
    console.error('❌ Invalid companyId:', companyId, 'type:', typeof companyId)
    throw new Error('Invalid company ID: must be a valid UUID string')
  }

  console.log('✅ Using valid companyId:', companyId)

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
    // Prima verifica quali staff esistono già
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('email, id')
      .eq('company_id', companyId)

    const existingEmails = new Set(existingStaff?.map(s => s.email?.toLowerCase()) || [])

    const staff = formData.staff
      .filter((person: any) => {
        // Filtra solo staff che NON esistono già
        if (person.email && existingEmails.has(person.email.toLowerCase())) {
          console.log(`⚠️ Staff con email ${person.email} già esistente, skip...`)
          return false
        }
        return true
      })
      .map((person: any) => {
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

    if (staff.length === 0) {
      console.log('⚠️ Tutti gli staff members esistono già, skip inserimento')
    } else {
      const { data: insertedStaff, error } = await supabase
        .from('staff')
        .insert(staff)
        .select('id, email')

      if (error) {
        console.error('❌ Error inserting staff:', error)
        throw error
      }

      console.log('✅ Staff inserted successfully:', staff.length)
    }

    // Recupera tutti gli staff (esistenti + appena inseriti) per il linking
    const { data: allStaff } = await supabase
      .from('staff')
      .select('id, email')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })

    const insertedStaff = allStaff || []

    console.log('✅ Staff totali per company:', insertedStaff.length)

    // ⚠️ IMPORTANTE: Collega il primo staff member (admin) al company_member dell'utente corrente
    if (insertedStaff && insertedStaff.length > 0) {
      const firstStaffMember = insertedStaff[0] // Primo staff = utente corrente
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (currentUser?.id && firstStaffMember.id) {
        console.log('🔗 Collegamento primo staff member a company_member...')
        
        // Aggiorna company_member per includere staff_id
        const { error: updateError } = await supabase
          .from('company_members')
          .update({ 
            staff_id: firstStaffMember.id,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', currentUser.id)
          .eq('company_id', companyId)

        if (updateError) {
          console.warn('⚠️ Errore collegamento staff_id a company_member:', updateError)
        } else {
          console.log('✅ Primo staff member collegato a company_member')
          console.log('   User:', currentUser.email)
          console.log('   Staff ID:', firstStaffMember.id)
        }
      }
    }
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
      category_id: (product.categoryId ? categoriesIdMap.get(product.categoryId) : null) || null,              // ✅ Usa ID reale
      department_id: (product.departmentId ? departmentsIdMap.get(product.departmentId) : null) || null,          // ✅ Usa ID reale
      conservation_point_id: (product.conservationPointId ? conservationPointsIdMap.get(product.conservationPointId) : null) || null, // ✅ Usa ID reale
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

  if (formData.calendar) {
    console.log('📤 Inserting calendar settings...')

    const calendarSettings = {
      company_id: companyId,
      fiscal_year_start: formData.calendar.fiscal_year_start,
      fiscal_year_end: formData.calendar.fiscal_year_end,
      closure_dates: formData.calendar.closure_dates || [],
      open_weekdays: formData.calendar.open_weekdays || [1,2,3,4,5,6],
      business_hours: formData.calendar.business_hours || {},
      is_configured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('company_calendar_settings')
      .insert(calendarSettings)

    if (error) {
      console.error('❌ Error inserting calendar settings:', error)
      throw error
    }

    console.log('✅ Calendar settings inserted successfully')
  }

  // ✅ RITORNA IL COMPANY ID
  console.log('🎯 Ritorno company_id da saveAllDataToSupabase:', companyId)
  return companyId
}

/**
 * DEBUG: Verifica stato autenticazione
 */
export const debugAuthState = async (): Promise<void> => {
  console.log('🔍 ===== DEBUG AUTH STATE =====')

  // 1. Verifica localStorage
  console.log('1️⃣ localStorage keys:')
  const allKeys = Object.keys(localStorage)
  allKeys.forEach(key => {
    if (key.includes('auth') || key.includes('supabase') || key.includes('bhm')) {
      const value = localStorage.getItem(key)
      console.log(`  ✓ ${key}:`, value ? `PRESENTE (${value.length} chars)` : 'VUOTO')
    }
  })

  // 2. Verifica sessione Supabase
  console.log('2️⃣ Supabase getSession():')
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  console.log('  Session:', sessionData.session ? '✅ PRESENTE' : '❌ ASSENTE')
  console.log('  Error:', sessionError)
  if (sessionData.session) {
    console.log('  User ID:', sessionData.session.user?.id)
    console.log('  Email:', sessionData.session.user?.email)
    console.log('  Expires at:', sessionData.session.expires_at)
  }

  // 3. Verifica getUser
  console.log('3️⃣ Supabase getUser():')
  const { data: userData, error: userError } = await supabase.auth.getUser()
  console.log('  User:', userData.user ? '✅ PRESENTE' : '❌ ASSENTE')
  console.log('  Error:', userError)
  if (userData.user) {
    console.log('  User ID:', userData.user.id)
    console.log('  Email:', userData.user.email)
  }

  console.log('🔍 ===== END DEBUG =====')
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
): Promise<string | null> => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔵 [completeOnboarding] FUNZIONE PRINCIPALE AVVIATA')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📥 Parametri ricevuti:')
  console.log('  - companyIdParam:', companyIdParam || 'NON FORNITO')
  console.log('  - formDataParam:', formDataParam ? 'FORNITO' : 'NON FORNITO')
  if (formDataParam) {
    console.log('  - formDataParam keys:', Object.keys(formDataParam))
  }
  console.log('⏰ Timestamp inizio:', new Date().toISOString())
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // DEBUG: Verifica SUBITO localStorage all'inizio
  console.log('🔍 [completeOnboarding] Verifica localStorage all\'inizio:')
  const allKeys = Object.keys(localStorage)
  console.log('📦 Tutte le chiavi localStorage:', allKeys)
  allKeys.forEach(key => {
    if (key.includes('auth') || key.includes('supabase') || key.includes('bhm')) {
      const value = localStorage.getItem(key)
      console.log(`  - ${key}:`, value ? 'PRESENTE (length: ' + value.length + ')' : 'VUOTO')
    }
  })

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
      // 🔧 DEV MODE: Controlla se c'è una dev company impostata
      console.log('🔍 Cercando company per onboarding...')
      
      if (hasDevCompany()) {
        console.log('🛠️ DEV MODE ATTIVO - Cercando dev company...')
        const devCompanyId = await getCompanyIdForOnboarding()
        
        if (devCompanyId) {
          // 🚨 NUOVO: Controlla se la company ha già dati completi
          const { data: existingCompany } = await supabase
            .from('companies')
            .select(`
              id, name, email,
              departments:departments(id),
              staff:staff(id),
              products:products(id),
              conservation_points:conservation_points(id),
              tasks:tasks(id)
            `)
            .eq('id', devCompanyId)
            .single()

          if (existingCompany && (
            (existingCompany.departments?.length || 0) > 0 ||
            (existingCompany.staff?.length || 0) > 0 ||
            (existingCompany.products?.length || 0) > 0 ||
            (existingCompany.conservation_points?.length || 0) > 0 ||
            (existingCompany.tasks?.length || 0) > 0
          )) {
            // 🎯 Company ha dati esistenti - chiedi conferma per sovrascrittura
            const confirmOverwrite = confirm(
              `🏢 Azienda "${existingCompany.name}" ha già dati completi.\n\n` +
              `📊 Dati esistenti:\n` +
              `• Reparti: ${existingCompany.departments?.length || 0}\n` +
              `• Staff: ${existingCompany.staff?.length || 0}\n` +
              `• Prodotti: ${existingCompany.products?.length || 0}\n` +
              `• Punti conservazione: ${existingCompany.conservation_points?.length || 0}\n` +
              `• Task: ${existingCompany.tasks?.length || 0}\n\n` +
              `⚠️ Vuoi CANCELLARE tutti i dati esistenti e ricreare l'onboarding?\n\n` +
              `✅ SÌ = Cancella tutto e ricrea\n` +
              `❌ NO = Annulla onboarding`
            )

            if (confirmOverwrite) {
              console.log('🗑️ Utente ha confermato cancellazione dati esistenti')
              toast.warning('🗑️ Cancellazione dati esistenti in corso...', {
                position: 'top-right',
                autoClose: 3000,
              })
              
              // Cancella tutti i dati associati alla company
              await deleteCompanyData(devCompanyId)
              
              companyId = devCompanyId
              console.log('✅ Company pulita e pronta per nuovo onboarding:', companyId)
            } else {
              console.log('❌ Utente ha annullato - onboarding interrotto')
              toast.info('❌ Onboarding annullato', {
                position: 'top-right',
                autoClose: 2000,
              })
              return
            }
          } else {
            // Company esiste ma è vuota - riutilizza normalmente
            companyId = devCompanyId
            console.log('✅ Dev company trovata (vuota) e verrà riutilizzata:', companyId)
            toast.info('🛠️ Modalità sviluppo: riutilizzo company esistente (vuota)', {
              position: 'top-right',
              autoClose: 2000,
            })
          }
        }
      }

      // Se ancora non abbiamo companyId, cerca dall'utente autenticato
      if (!companyId) {
        console.log('🔍 Cercando company da sessione utente...')

        // Prima verifica la sessione
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('📊 getSession result:', { session: sessionData.session, error: sessionError })

        if (!sessionData.session?.user?.id) {
          // Fallback: prova getUser()
          console.log('🔍 Fallback a getUser()...')
          const { data: userData, error: userError } = await supabase.auth.getUser()
          console.log('📊 getUser result:', { user: userData.user, error: userError })

          if (!userData.user?.id) {
            console.error('❌ Nessuna sessione o utente trovato')

            // Debug: verifica localStorage
            const storageKey = 'bhm-supabase-auth'
            const authToken = localStorage.getItem(storageKey)
            console.log('🔑 LocalStorage auth token:', authToken ? 'PRESENTE' : 'ASSENTE')
            if (authToken) {
              try {
                const parsed = JSON.parse(authToken)
                console.log('🔑 Token parsed:', {
                  hasAccessToken: !!parsed?.access_token,
                  hasUser: !!parsed?.user,
                  expiresAt: parsed?.expires_at
                })
              } catch (e) {
                console.error('❌ Errore parsing token:', e)
              }
            }

          throw new Error('Utente non autenticato. Effettua il login e riprova.')
        }

          console.log('✅ Utente trovato via getUser:', userData.user.id)
          companyId = await resolveCompanyId(userData.user.id)
        } else {
          console.log('✅ Sessione trovata:', sessionData.session.user.id)
          companyId = await resolveCompanyId(sessionData.session.user.id)
        }
      }
    }

    async function resolveCompanyId(userId: string): Promise<string | undefined> {
      // Verifica se utente ha già un company_member record
      const { data: existingMember } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', userId)
        .single()

      if (existingMember && existingMember.company_id) {
        // Utente ha già una company associata → usa quella esistente
        console.log('✅ Company esistente trovata:', existingMember.company_id)
        return existingMember.company_id
      } else {
        // Nessuna company associata → creane una nuova durante onboarding
        console.log('🔧 Nessuna company trovata - creando nuova company durante onboarding')
        return undefined
      }
    }

    console.log('🏢 Company ID (prima saveAll):', companyId)

    // Salva tutti i dati su Supabase - CATTURA IL COMPANY ID RITORNATO!
    companyId = await saveAllDataToSupabase(formData, companyId ?? null)

    console.log('🏢 Company ID (dopo saveAll):', companyId)

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

    // AUTO-INVIO INVITI: Invia email di invito a tutti gli staff con email
    // ESCLUSO il PRIMO membro (utente che sta completando l'onboarding - già registrato)
    if (formData.staff?.length && companyId) {
      console.log('📧 Invio inviti a staff...')
      
      let invitesSent = 0
      let invitesFailed = 0

      // ⚠️ IMPORTANTE: Salta il primo membro (indice 0) - è l'utente corrente!
      for (let i = 1; i < formData.staff.length; i++) {
        const person = formData.staff[i]
        
        if (person.email) {
          try {
            // Crea token invito
            const inviteToken = await createInviteToken({
              email: person.email,
              company_id: companyId,
              role: person.role, // Usa ruolo assegnato nello Step 3
              expires_in_days: 7,
            })
            
            console.log(`✅ Invito creato per: ${person.email} (${person.role})`)
            
            // Tenta invio email (non bloccante se fallisce)
            const emailSent = await sendInviteEmail(inviteToken)
            
            if (emailSent) {
              console.log(`📧 Email inviata a: ${person.email}`)
            } else {
              console.warn(`⚠️ Email NON inviata a ${person.email} - usa link manuale`)
            }
            
            invitesSent++
          } catch (err) {
            invitesFailed++
            console.warn(`⚠️ Errore creazione invito per ${person.email}:`, err)
          }
        }
      }

      // Log del primo membro saltato
      if (formData.staff[0]?.email) {
        console.log(`⏭️ Primo membro (utente corrente) saltato: ${formData.staff[0].email}`)
      }

      if (invitesSent > 0) {
        console.log(`📧 Inviti creati: ${invitesSent} (falliti: ${invitesFailed})`)
        toast.success(`${invitesSent} inviti creati e pronti per l'invio!`, {
          position: 'top-right',
          autoClose: 4000,
        })
      } else {
        console.log(`ℹ️ Nessun invito da inviare (solo utente corrente registrato)`)
      }
    }

    // Marca onboarding come completato nel localStorage
    // Nota: i campi onboarding_completed/onboarding_completed_at non esistono in companies table
    localStorage.setItem('onboarding-completed', 'true')
    localStorage.setItem('onboarding-completed-at', new Date().toISOString())

    // Pulisci localStorage onboarding data
    localStorage.removeItem('onboarding-data')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ [completeOnboarding] COMPLETATO CON SUCCESSO')
    console.log('🔄 Reindirizzamento a /dashboard tra 1 secondo...')
    console.log('⏰ Timestamp fine:', new Date().toISOString())
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    toast.success('Onboarding completato con successo!', {
      position: 'top-right',
      autoClose: 3000,
    })

    // 🔧 FIX: Imposta company ID nel localStorage PRIMA del redirect
    console.log('🔧 Impostazione company ID nel localStorage:', companyId)
    if (companyId) {
      localStorage.setItem('active_company_id', companyId) // ✅ Chiave principale usata da useAuth
      localStorage.setItem('haccp-company-id', companyId) // Backup per compatibilità
      localStorage.setItem('company-id', companyId) // Backup per compatibilità
    }

    // Reindirizza alla dashboard con reload per invalidare cache React Query
    console.log('✅✅✅ ONBOARDING COMPLETATO CON SUCCESSO! ✅✅✅')
    console.log('📊 Company ID salvato in localStorage:', companyId)
    console.log('📊 active_company_id:', localStorage.getItem('active_company_id'))
    console.log('📊 haccp-company-id:', localStorage.getItem('haccp-company-id'))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 Restituendo controllo al componente per navigazione React Router')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // ✅ RITORNA IL COMPANY ID al componente invece di fare reload
    return companyId || null
  } catch (error) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('❌ [completeOnboarding] ERRORE!')
    console.error('❌ Errore completo:', error)
    console.log('⏰ Timestamp errore:', new Date().toISOString())
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    toast.error(`Errore durante il completamento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`, {
      position: 'top-right',
      autoClose: 5000,
    })

    // Rilancia errore per far gestire al componente
    throw error
  }
}

/**
 * =============================================
 * 🔄 RESET OPERATIONAL DATA
 * =============================================
 * Cancella tutti i dati operativi mantenendo:
 * - Company (id, name, email, address)
 * - Auth users
 * - Company members
 * - User sessions
 * - User profiles
 *
 * Usa questa funzione per "ricominciare" l'onboarding
 * senza creare duplicati di company/user.
 */
export const resetOperationalData = async (): Promise<boolean> => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 [resetOperationalData] AVVIO RESET DATI OPERATIVI')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Conferma utente
  const confirmed = window.confirm(
    '⚠️ ATTENZIONE!\n\n' +
    'Questa operazione cancellerà TUTTI i dati operativi:\n' +
    '• Staff\n' +
    '• Reparti\n' +
    '• Prodotti e Categorie\n' +
    '• Punti di Conservazione\n' +
    '• Task ed Eventi\n' +
    '• Note e Temperature\n' +
    '• Inviti pendenti\n\n' +
    '✅ MANTERRÀ:\n' +
    '• Azienda (nome, email, indirizzo)\n' +
    '• Utente admin\n' +
    '• Associazione utente-azienda\n\n' +
    'Potrai rifare l\'onboarding senza duplicare l\'azienda.\n\n' +
    'Vuoi continuare?'
  )

  if (!confirmed) {
    console.log('❌ Reset annullato dall\'utente')
    toast.info('Reset annullato', {
      position: 'top-right',
      autoClose: 2000,
    })
    return false
  }

  try {
    // Ottieni company ID dell'utente corrente
    const companyId = await getCurrentCompanyId()

    if (!companyId) {
      throw new Error('Company ID non trovato. Effettua il login e riprova.')
    }

    console.log('🏢 Company ID:', companyId)
    console.log('🗑️ Inizio cancellazione dati operativi...')

    // Usa la funzione esistente per pulire i dati
    await cleanExistingOnboardingData(companyId)

    // Cancella anche altri dati operativi non inclusi in cleanExistingOnboardingData
    console.log('🗑️ Cancellazione dati aggiuntivi...')

    await supabase.from('invite_tokens').delete().eq('company_id', companyId)
    await supabase.from('events').delete().eq('company_id', companyId)
    await supabase.from('notes').delete().eq('company_id', companyId)
    await supabase.from('temperature_readings').delete().eq('company_id', companyId)
    await supabase.from('shopping_lists').delete().eq('company_id', companyId)
    await supabase.from('non_conformities').delete().eq('company_id', companyId)
    await supabase.from('audit_logs').delete().eq('company_id', companyId)

    // Pulisci localStorage onboarding
    localStorage.removeItem('onboarding-data')
    localStorage.removeItem('onboarding-completed')
    localStorage.removeItem('onboarding-completed-at')

    console.log('✅ Reset completato con successo!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    toast.success('✅ Dati operativi cancellati! Puoi rifare l\'onboarding.', {
      position: 'top-right',
      autoClose: 4000,
    })

    return true

  } catch (error) {
    console.error('❌ Errore durante reset:', error)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    toast.error(`Errore durante il reset: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`, {
      position: 'top-right',
      autoClose: 5000,
    })

    return false
  }
}

// Esponi funzione globalmente per uso in console
if (typeof window !== 'undefined') {
  ;(window as any).resetOperationalData = resetOperationalData
}
