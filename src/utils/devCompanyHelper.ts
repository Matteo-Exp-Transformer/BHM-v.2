/**
 * 🛠️ DEV COMPANY HELPER
 * 
 * Utility per sviluppo/testing che "ancora" sempre la stessa company
 * invece di crearne di nuove ad ogni onboarding.
 * 
 * **PROBLEMA**: Ogni volta che completi l'onboarding, viene creata una NUOVA company
 * **SOLUZIONE**: Questa utility forza sempre l'uso di UNA company specifica
 * 
 * **COME USARE**:
 * 1. Esegui `setDevCompany('your-company-id')` una volta nella console
 * 2. Tutti gli onboarding successivi useranno SEMPRE quella company
 * 3. Per disabilitare: `clearDevCompany()`
 */

import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-toastify'

const DEV_COMPANY_KEY = 'bhm-dev-company-id'

/**
 * Imposta la company di sviluppo
 * Tutti gli onboarding useranno questa company invece di crearne di nuove
 */
export const setDevCompany = async (companyId: string): Promise<void> => {
  if (!companyId || typeof companyId !== 'string') {
    toast.error('Company ID non valido')
    return
  }

  // Verifica che la company esista
  const { data: company, error } = await supabase
    .from('companies')
    .select('id, name, email')
    .eq('id', companyId)
    .single()

  if (error || !company) {
    console.error('❌ Company non trovata:', error)
    toast.error('Company non trovata nel database')
    return
  }

  // Salva in localStorage
  localStorage.setItem(DEV_COMPANY_KEY, companyId)

  console.log('✅ Dev Company impostata:', {
    id: company.id,
    name: company.name,
    email: company.email,
  })

  toast.success(`Dev Company impostata: ${company.name}`, {
    position: 'top-right',
    autoClose: 3000,
  })
}

/**
 * Ottiene la company di sviluppo (se impostata)
 */
export const getDevCompany = (): string | null => {
  return localStorage.getItem(DEV_COMPANY_KEY)
}

/**
 * Verifica se una dev company è impostata
 */
export const hasDevCompany = (): boolean => {
  return !!localStorage.getItem(DEV_COMPANY_KEY)
}

/**
 * Rimuove la company di sviluppo
 */
export const clearDevCompany = (): void => {
  localStorage.removeItem(DEV_COMPANY_KEY)
  console.log('✅ Dev Company rimossa')
  toast.info('Dev Company rimossa - verrà creata una nuova company al prossimo onboarding', {
    position: 'top-right',
    autoClose: 3000,
  })
}

/**
 * Imposta automaticamente la company più recente dell'utente corrente
 */
export const setDevCompanyFromCurrentUser = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.id) {
      toast.error('Utente non autenticato')
      return
    }

    // Trova la company più recente dell'utente
    const { data: member } = await supabase
      .from('company_members')
      .select('company_id, companies(id, name, email, created_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!member?.company_id) {
      toast.error('Nessuna company trovata per questo utente')
      return
    }

    await setDevCompany(member.company_id)
  } catch (error) {
    console.error('❌ Errore impostazione dev company:', error)
    toast.error('Errore durante l\'impostazione della dev company')
  }
}

/**
 * Mostra informazioni sulla dev company attuale
 */
export const showDevCompanyInfo = async (): Promise<void> => {
  const devCompanyId = getDevCompany()

  if (!devCompanyId) {
    console.log('ℹ️ Nessuna Dev Company impostata')
    console.log('Per impostarne una: setDevCompany("your-company-id")')
    toast.info('Nessuna Dev Company impostata')
    return
  }

  const { data: company } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      email,
      staff_count,
      created_at,
      updated_at
    `)
    .eq('id', devCompanyId)
    .single()

  if (!company) {
    console.error('❌ Dev Company non trovata nel database (ID salvato non valido)')
    toast.error('Dev Company non trovata - rimuovi e riconfigura')
    return
  }

  // Count relazioni
  const [
    { count: departmentsCount },
    { count: staffCount },
    { count: productsCount },
    { count: conservationPointsCount },
    { count: tasksCount },
  ] = await Promise.all([
    supabase.from('departments').select('*', { count: 'exact', head: true }).eq('company_id', devCompanyId),
    supabase.from('staff').select('*', { count: 'exact', head: true }).eq('company_id', devCompanyId),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('company_id', devCompanyId),
    supabase.from('conservation_points').select('*', { count: 'exact', head: true }).eq('company_id', devCompanyId),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('company_id', devCompanyId),
  ])

  console.log('🏢 Dev Company Info:')
  console.log({
    id: company.id,
    name: company.name,
    email: company.email,
    created_at: company.created_at,
    updated_at: company.updated_at,
    statistics: {
      departments: departmentsCount || 0,
      staff: staffCount || 0,
      products: productsCount || 0,
      conservation_points: conservationPointsCount || 0,
      tasks: tasksCount || 0,
    }
  })

  toast.info(`Dev Company: ${company.name}`, {
    position: 'top-right',
    autoClose: 3000,
  })
}

/**
 * Helper per trovare tutte le company di "Al Ritrovo SRL" e mostrare quale usare
 */
export const findBestDevCompany = async (): Promise<void> => {
  console.log('🔍 Cercando la migliore company "Al Ritrovo SRL"...')

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, created_at, updated_at, email, staff_count')
    .eq('name', 'Al Ritrovo SRL')
    .order('created_at', { ascending: false })

  if (!companies || companies.length === 0) {
    console.log('❌ Nessuna company "Al Ritrovo SRL" trovata')
    return
  }

  console.log(`📊 Trovate ${companies.length} company "Al Ritrovo SRL"`)

  // Per ogni company, conta le relazioni
  const companiesWithStats = await Promise.all(
    companies.map(async (company) => {
      const [
        { count: departmentsCount },
        { count: staffCount },
        { count: productsCount },
        { count: conservationPointsCount },
        { count: tasksCount },
        { count: membersCount },
      ] = await Promise.all([
        supabase.from('departments').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('staff').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('conservation_points').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
        supabase.from('company_members').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
      ])

      const completenessScore = 
        (departmentsCount || 0) +
        (staffCount || 0) +
        (productsCount || 0) +
        (conservationPointsCount || 0) +
        (tasksCount || 0) +
        (membersCount || 0)

      return {
        ...company,
        statistics: {
          departments: departmentsCount || 0,
          staff: staffCount || 0,
          products: productsCount || 0,
          conservation_points: conservationPointsCount || 0,
          tasks: tasksCount || 0,
          members: membersCount || 0,
        },
        completenessScore,
      }
    })
  )

  // Ordina per completeness score (più completa = meglio)
  const sorted = companiesWithStats.sort((a, b) => b.completenessScore - a.completenessScore)

  console.table(
    sorted.map((c, index) => ({
      rank: index + 1,
      id: c.id,
      created_at: new Date(c.created_at).toLocaleDateString(),
      departments: c.statistics.departments,
      staff: c.statistics.staff,
      products: c.statistics.products,
      conservation_points: c.statistics.conservation_points,
      tasks: c.statistics.tasks,
      members: c.statistics.members,
      score: c.completenessScore,
    }))
  )

  const best = sorted[0]
  console.log('\n✨ Migliore Company (più completa):')
  console.log({
    id: best.id,
    name: best.name,
    created_at: best.created_at,
    email: best.email,
    completeness_score: best.completenessScore,
  })

  console.log('\n💡 Per usare questa company in sviluppo, esegui:')
  console.log(`setDevCompany('${best.id}')`)

  toast.success(`Migliore company trovata: ${best.name} (score: ${best.completenessScore})`, {
    position: 'top-right',
    autoClose: 5000,
  })
}

/**
 * INTEGRAZIONE CON ONBOARDING HELPERS
 * 
 * Questa funzione dovrebbe essere chiamata PRIMA di completeOnboarding
 * per forzare l'uso della dev company se impostata
 */
export const getCompanyIdForOnboarding = async (): Promise<string | null> => {
  // 1. Controlla se c'è una dev company impostata
  const devCompanyId = getDevCompany()
  
  if (devCompanyId) {
    console.log('🔧 DEV MODE: Usando dev company invece di crearne una nuova:', devCompanyId)
    
    // Verifica che esista ancora
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', devCompanyId)
      .single()
    
    if (company) {
      console.log('✅ Dev company trovata:', company.name)
      return devCompanyId
    } else {
      console.warn('⚠️ Dev company non trovata nel database - rimuovendo impostazione')
      clearDevCompany()
    }
  }

  // 2. Altrimenti, cerca la company dell'utente corrente
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    return null
  }

  const { data: member } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return member?.company_id || null
}

// Esporta tutte le funzioni come oggetto per uso da console
export const devCompanyHelper = {
  setDevCompany,
  getDevCompany,
  hasDevCompany,
  clearDevCompany,
  setDevCompanyFromCurrentUser,
  showDevCompanyInfo,
  findBestDevCompany,
  getCompanyIdForOnboarding,
}

// Rendi disponibile globalmente per la console del browser
if (typeof window !== 'undefined') {
  (window as any).devCompanyHelper = devCompanyHelper
}

/**
 * 📚 GUIDA UTILIZZO DA CONSOLE
 * 
 * Apri la console del browser (F12) e usa questi comandi:
 * 
 * 1. **Trova la migliore company**:
 *    ```
 *    devCompanyHelper.findBestDevCompany()
 *    ```
 * 
 * 2. **Imposta dev company** (usando l'ID dalla query sopra):
 *    ```
 *    devCompanyHelper.setDevCompany('205c56c7-30b5-4526-b064-bf998c562df3')
 *    ```
 * 
 * 3. **Imposta automaticamente la company dell'utente corrente**:
 *    ```
 *    devCompanyHelper.setDevCompanyFromCurrentUser()
 *    ```
 * 
 * 4. **Mostra info sulla dev company**:
 *    ```
 *    devCompanyHelper.showDevCompanyInfo()
 *    ```
 * 
 * 5. **Rimuovi dev company** (torni al comportamento normale):
 *    ```
 *    devCompanyHelper.clearDevCompany()
 *    ```
 * 
 * Dopo aver impostato la dev company, tutti gli onboarding useranno
 * SEMPRE quella company invece di crearne di nuove!
 */

