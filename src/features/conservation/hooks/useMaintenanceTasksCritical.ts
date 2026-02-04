import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { MaintenanceTask } from '@/types/conservation'
import { startOfDay, endOfDay } from 'date-fns'

/**
 * Hook per caricare solo i maintenance tasks "critici" necessari per il check-up:
 * - Task arretrati (scaduti e non completati)
 * - Task di oggi (considerando orario)
 * - Prossima task per tipo (SOLO se quella di oggi è completata)
 *
 * Questa query ottimizzata riduce il carico rispetto a caricare TUTTI i task.
 */
export function useMaintenanceTasksCritical() {
  const { companyId } = useAuth()

  return useQuery({
    queryKey: ['maintenance-tasks-critical', companyId],
    queryFn: async () => {
      if (!companyId) {
        console.warn('⚠️ No company_id available, cannot load maintenance tasks')
        return []
      }

      const now = new Date()
      const todayStart = startOfDay(now).toISOString()
      const todayEnd = endOfDay(now).toISOString()

      // Query 1: Task arretrati (scaduti prima di oggi e non completati)
      const { data: overdueTasks, error: overdueError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('company_id', companyId)
        .lt('next_due', todayStart)
        .not('status', 'in', '(completed,skipped)')

      if (overdueError) {
        console.error('❌ Error loading overdue tasks:', overdueError)
        throw overdueError
      }

      // Query 2: Task di oggi (next_due tra inizio e fine giornata)
      const { data: todayTasksRaw, error: todayError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('company_id', companyId)
        .gte('next_due', todayStart)
        .lte('next_due', todayEnd)

      if (todayError) {
        console.error('❌ Error loading today tasks:', todayError)
        throw todayError
      }

      // Escludi da "oggi" i task già completati oggi (last_completed nella giornata corrente)
      const todayStartDate = new Date(todayStart)
      const todayTasks = (todayTasksRaw || []).filter(
        (t: { last_completed?: string | null }) =>
          !t.last_completed || new Date(t.last_completed) < todayStartDate
      )

      // Query 3: Task futuri (per calcolare "prossima per tipo")
      // Carichiamo tutti i futuri scheduled e poi filtriamo in memoria
      const { data: futureTasks, error: futureError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('company_id', companyId)
        .gt('next_due', todayEnd)
        .eq('status', 'scheduled')
        .order('next_due', { ascending: true })

      if (futureError) {
        console.error('❌ Error loading future tasks:', futureError)
        throw futureError
      }

      // Merge tutti i task (cast: Supabase restituisce tipo DB, normalizziamo per MaintenanceTask)
      const allCriticalTasks = [
        ...(overdueTasks || []),
        ...todayTasks,
      ] as unknown as MaintenanceTask[]

      // Aggiungi "prossima per tipo" SOLO se quella di oggi è completata
      let nextTasksPerType: MaintenanceTask[] = []
      if (futureTasks && futureTasks.length > 0) {
        nextTasksPerType = getNextTasksPerType(futureTasks, todayTasks || []) as MaintenanceTask[]
        allCriticalTasks.push(...nextTasksPerType)
      }

      // Normalizza date (Supabase restituisce stringhe ISO)
      const normalizedTasks = allCriticalTasks.map(task => ({
        ...task,
        next_due: task.next_due ? new Date(task.next_due) : new Date(),
        last_completed: task.last_completed ? new Date(task.last_completed) : undefined,
        completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
        created_at: task.created_at ? new Date(task.created_at) : new Date(),
        updated_at: task.updated_at ? new Date(task.updated_at) : new Date(),
      }))

      console.log(
        `✅ Loaded critical tasks: ${overdueTasks?.length || 0} overdue, ${todayTasks?.length || 0} today, ${nextTasksPerType.length} next`
      )

      return normalizedTasks
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minuti - i dati non cambiano troppo spesso
  })
}

/**
 * Filtra i task futuri per ottenere solo la "prossima" per ogni tipo,
 * MA solo se quella di oggi è completata.
 *
 * Logica:
 * - Per ogni tipo di manutenzione (sanitization, temperature, defrosting, expiry_check)
 * - Verifica se c'è un task di oggi di quel tipo
 * - Se SÌ e NON è completato → NON includere la prossima
 * - Se NO oppure è completato → Includi la prossima (la più vicina)
 */
function getNextTasksPerType(
  futureTasks: any[],
  todayTasks: any[],
): any[] {
  const nextTasks: any[] = []

  // Raggruppa task futuri per conservation_point_id + type
  const futureByPointAndType = new Map<string, any[]>()

  futureTasks.forEach(task => {
    const key = `${task.conservation_point_id}:${task.type}`
    if (!futureByPointAndType.has(key)) {
      futureByPointAndType.set(key, [])
    }
    futureByPointAndType.get(key)!.push(task)
  })

  // Per ogni gruppo, verifica se includere la prossima
  futureByPointAndType.forEach((tasks, key) => {
    const [pointId, type] = key.split(':')

    // Verifica se c'è un task di oggi dello stesso tipo e punto
    const todayTaskOfType = todayTasks.find(
      t => t.conservation_point_id === pointId && t.type === type
    )

    // Includi la prossima SOLO se:
    // - Non c'è task oggi di quel tipo
    // - OPPURE il task oggi è completato
    if (!todayTaskOfType || todayTaskOfType.status === 'completed') {
      // Prendi solo la prima (già ordinati per next_due ASC)
      if (tasks.length > 0) {
        nextTasks.push(tasks[0])
      }
    }
  })

  return nextTasks
}
