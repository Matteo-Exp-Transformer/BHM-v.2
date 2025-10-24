/**
 * 🧹 Cleanup Test Data - Rimozione Dati Fake di Sviluppo
 * 
 * Funzioni per rimuovere tutti i dati di test/fake creati durante lo sviluppo
 * e mantenere solo i dati inseriti dall'utente durante l'onboarding reale
 * 
 * @date 2025-01-10
 */

import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-toastify'

/**
 * Identifica e rimuove tutti i dati fake/test dal database
 */
export const cleanupAllTestData = async (): Promise<void> => {
  console.log('🧹 Inizio pulizia dati test...')

  try {
    // 1. Ottieni company ID corrente
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Utente non autenticato')
    }

    const { data: companyMember } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!companyMember) {
      throw new Error('Company non trovata')
    }

    const companyId = companyMember.company_id
    console.log('🏢 Company ID:', companyId)

    // 2. Identifica dati fake da rimuovere
    const fakeData = await identifyFakeData()
    console.log('🔍 Dati fake identificati:', fakeData)

    // 3. Rimuovi dati fake in ordine di dipendenza
    await removeFakeData(fakeData)

    console.log('✅ Pulizia dati test completata')
    toast.success('Dati di test rimossi con successo!', {
      position: 'top-right',
      autoClose: 3000,
    })

  } catch (error) {
    console.error('❌ Errore durante pulizia:', error)
    toast.error(`Errore durante pulizia: ${(error as Error).message}`, {
      position: 'top-right',
      autoClose: 5000,
    })
    throw error
  }
}

/**
 * Identifica tutti i dati fake/test nel database
 * ESCLUDE i dati inseriti con "Precompila" (DevButtons)
 * 
 * ATTENZIONE: Attualmente TUTTI i dati "fake" provengono da Precompila,
 * quindi questa funzione non rimuove nulla per preservare i dati Precompila.
 */
async function identifyFakeData(/* companyId: string */) {
  const fakeData = {
    staff: [] as string[],
    departments: [] as string[],
    conservationPoints: [] as string[],
    products: [] as string[],
    maintenanceTasks: [] as string[],
    genericTasks: [] as string[],
    temperatureReadings: [] as string[],
    events: [] as string[],
  }

  // ✅ TUTTI i dati "fake" provengono da Precompila e devono essere MANTENUTI
  // Paolo Dettori, Cucina, Bancone, Frigo A, Freezer A, etc. → TUTTI da Precompila
  // 
  // Questa funzione attualmente non rimuove nulla perché:
  // 1. Non ci sono altri dati fake generati automaticamente dal sistema
  // 2. Tutti i dati con nomi "fake" sono inseriti intenzionalmente con Precompila
  // 3. L'utente vuole mantenere i dati Precompila
  
  console.log('ℹ️ Nessun dato fake da rimuovere - tutti i dati sono da Precompila o inseriti dall\'utente')

  return fakeData
}

/**
 * Rimuove i dati fake in ordine di dipendenza
 */
async function removeFakeData(fakeData: any) {
  console.log('🗑️ Rimozione dati fake...')

  // 1. Rimuovi temperature readings (dipende da conservation points)
  if (fakeData.temperatureReadings.length > 0) {
    console.log('🗑️ Rimuovendo temperature readings fake...')
    await supabase
      .from('temperature_readings')
      .delete()
      .in('id', fakeData.temperatureReadings)
  }

  // 2. Rimuovi maintenance tasks (dipende da conservation points)
  if (fakeData.maintenanceTasks.length > 0) {
    console.log('🗑️ Rimuovendo maintenance tasks fake...')
    await supabase
      .from('maintenance_tasks')
      .delete()
      .in('id', fakeData.maintenanceTasks)
  }

  // 3. Rimuovi generic tasks (dipende da staff)
  if (fakeData.genericTasks.length > 0) {
    console.log('🗑️ Rimuovendo generic tasks fake...')
    await supabase
      .from('tasks')
      .delete()
      .in('id', fakeData.genericTasks)
  }

  // 4. Rimuovi events
  if (fakeData.events.length > 0) {
    console.log('🗑️ Rimuovendo events fake...')
    await supabase
      .from('events')
      .delete()
      .in('id', fakeData.events)
  }

  // 5. Rimuovi products (dipende da departments e conservation points)
  if (fakeData.products.length > 0) {
    console.log('🗑️ Rimuovendo products fake...')
    await supabase
      .from('products')
      .delete()
      .in('id', fakeData.products)
  }

  // 6. Rimuovi conservation points (dipende da departments)
  if (fakeData.conservationPoints.length > 0) {
    console.log('🗑️ Rimuovendo conservation points fake...')
    await supabase
      .from('conservation_points')
      .delete()
      .in('id', fakeData.conservationPoints)
  }

  // 7. Rimuovi staff (dipende da departments)
  if (fakeData.staff.length > 0) {
    console.log('🗑️ Rimuovendo staff fake...')
    await supabase
      .from('staff')
      .delete()
      .in('id', fakeData.staff)
  }

  // 8. Rimuovi departments (ultimi, non dipendono da nulla)
  if (fakeData.departments.length > 0) {
    console.log('🗑️ Rimuovendo departments fake...')
    await supabase
      .from('departments')
      .delete()
      .in('id', fakeData.departments)
  }

  console.log('✅ Dati fake rimossi con successo')
}

/**
 * Funzione di pulizia selettiva - rimuove solo dati specifici
 */
export const cleanupSpecificTestData = async (dataTypes: string[]): Promise<void> => {
  console.log('🧹 Pulizia selettiva dati test:', dataTypes)

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Utente non autenticato')
    }

    const { data: companyMember } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!companyMember) {
      throw new Error('Company non trovata')
    }

    const companyId = companyMember.company_id

    // Implementa pulizia selettiva basata su dataTypes
    for (const dataType of dataTypes) {
      switch (dataType) {
        case 'staff':
          await cleanupFakeStaff(companyId)
          break
        case 'departments':
          await cleanupFakeDepartments(companyId)
          break
        case 'conservation_points':
          await cleanupFakeConservationPoints(companyId)
          break
        case 'products':
          await cleanupFakeProducts(companyId)
          break
        case 'tasks':
          await cleanupFakeTasks(companyId)
          break
        default:
          console.warn('⚠️ Tipo di dato non riconosciuto:', dataType)
      }
    }

    toast.success('Pulizia selettiva completata!', {
      position: 'top-right',
      autoClose: 3000,
    })

  } catch (error) {
    console.error('❌ Errore durante pulizia selettiva:', error)
    toast.error(`Errore: ${(error as Error).message}`)
    throw error
  }
}

// Funzioni helper per pulizia selettiva
async function cleanupFakeStaff(companyId: string) {
  const { data: fakeStaff } = await supabase
    .from('staff')
    .select('id')
    .eq('company_id', companyId)
    .in('email', ['0cavuz0@gmail.com'])

  if (fakeStaff?.length) {
    await supabase.from('staff').delete().in('id', fakeStaff.map((s: any) => s.id))
    console.log('✅ Staff fake rimosso')
  }
}

async function cleanupFakeDepartments(companyId: string) {
  const { data: fakeDepartments } = await supabase
    .from('departments')
    .select('id')
    .eq('company_id', companyId)
    .in('name', ['Cucina', 'Bancone', 'Sala', 'Magazzino'])

  if (fakeDepartments?.length) {
    await supabase.from('departments').delete().in('id', fakeDepartments.map((d: any) => d.id))
    console.log('✅ Departments fake rimossi')
  }
}

async function cleanupFakeConservationPoints(companyId: string) {
  const { data: fakePoints } = await supabase
    .from('conservation_points')
    .select('id')
    .eq('company_id', companyId)
    .or('name.ilike.%Frigo A%,name.ilike.%Freezer A%')

  if (fakePoints?.length) {
    await supabase.from('conservation_points').delete().in('id', fakePoints.map((p: any) => p.id))
    console.log('✅ Conservation points fake rimossi')
  }
}

async function cleanupFakeProducts(companyId: string) {
  const { data: fakeProducts } = await supabase
    .from('products')
    .select('id')
    .eq('company_id', companyId)
    .or('name.ilike.%Pollo%,name.ilike.%Salmone%')

  if (fakeProducts?.length) {
    await supabase.from('products').delete().in('id', fakeProducts.map((p: any) => p.id))
    console.log('✅ Products fake rimossi')
  }
}

async function cleanupFakeTasks(companyId: string) {
  // Rimuovi maintenance tasks e generic tasks fake
  await cleanupFakeMaintenanceTasks(companyId)
  await cleanupFakeGenericTasks(companyId)
}

async function cleanupFakeMaintenanceTasks(companyId: string) {
  // Identifica conservation points fake
  const { data: fakePoints } = await supabase
    .from('conservation_points')
    .select('id')
    .eq('company_id', companyId)
    .or('name.ilike.%Frigo A%,name.ilike.%Freezer A%')

  if (fakePoints?.length) {
    const { data: fakeTasks } = await supabase
      .from('maintenance_tasks')
      .select('id')
      .eq('company_id', companyId)
      .in('conservation_point_id', fakePoints.map((p: any) => p.id))

    if (fakeTasks?.length) {
      await supabase.from('maintenance_tasks').delete().in('id', fakeTasks.map((t: any) => t.id))
      console.log('✅ Maintenance tasks fake rimossi')
    }
  }
}

async function cleanupFakeGenericTasks(companyId: string) {
  // Identifica staff fake
  const { data: fakeStaff } = await supabase
    .from('staff')
    .select('id')
    .eq('company_id', companyId)
    .in('email', ['0cavuz0@gmail.com'])

  if (fakeStaff?.length) {
    const { data: fakeTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('company_id', companyId)
      .in('assigned_to_staff_id', fakeStaff.map((s: any) => s.id))

    if (fakeTasks?.length) {
      await supabase.from('tasks').delete().in('id', fakeTasks.map((t: any) => t.id))
      console.log('✅ Generic tasks fake rimossi')
    }
  }
}
