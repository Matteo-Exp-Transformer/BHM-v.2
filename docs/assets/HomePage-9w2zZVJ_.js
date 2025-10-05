import { a as F, u as S, b as N, j as e } from './query-vendor-BsnDS19Y.js'
import { u as P, U as q } from './auth-vendor-CMFeYHy6.js'
import {
  u as A,
  l as M,
  m as B,
  n as g,
  o as D,
  s as I,
  e as k,
  a as L,
} from './calendar-features-DOX2NwpL.js'
import { B as m, k as T, d as b, b as $, e as U } from './ui-vendor-BFMCvSnM.js'
import './react-vendor-Cttizgra.js'
import './calendar-vendor-CzJ7rMdU.js'
import './inventory-features-tEOlqD7s.js'
const z = [
  {
    id: '1',
    title: 'Controllo Temperatura Frigorifero 1',
    description: 'Controllo temperatura e registrazione dati',
    start: new Date(2025, 0, 20, 8, 0),
    end: new Date(2025, 0, 20, 8, 15),
    allDay: !1,
    type: 'temperature_reading',
    status: 'pending',
    priority: 'medium',
    assigned_to: ['user1'],
    department_id: 'cucina',
    conservation_point_id: 'fridge1',
    recurring: !0,
    recurrence_pattern: { frequency: 'daily', interval: 1 },
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
    textColor: '#065F46',
    metadata: {
      conservation_point_id: 'fridge1',
      notes: 'Controllo giornaliero temperatura',
    },
    source: 'temperature_reading',
    sourceId: 'temp1',
    extendedProps: {},
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user1',
    company_id: 'company1',
  },
  {
    id: '2',
    title: 'Manutenzione Abbattitore',
    description: 'Pulizia e controllo funzionamento abbattitore',
    start: new Date(2025, 0, 20, 14, 0),
    end: new Date(2025, 0, 20, 16, 0),
    allDay: !1,
    type: 'maintenance',
    status: 'pending',
    priority: 'high',
    assigned_to: ['user2'],
    department_id: 'cucina',
    conservation_point_id: 'blast1',
    recurring: !0,
    recurrence_pattern: { frequency: 'weekly', interval: 1, days_of_week: [1] },
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    textColor: '#92400E',
    metadata: {
      conservation_point_id: 'blast1',
      notes: 'Manutenzione settimanale programmata',
    },
    source: 'maintenance',
    sourceId: 'maint1',
    extendedProps: {},
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user1',
    company_id: 'company1',
  },
  {
    id: '3',
    title: 'Formazione Staff HACCP',
    description: 'Sessione di formazione per nuovo personale',
    start: new Date(2025, 0, 21, 10, 0),
    end: new Date(2025, 0, 21, 12, 0),
    allDay: !1,
    type: 'general_task',
    status: 'pending',
    priority: 'medium',
    assigned_to: ['user1', 'user2', 'user3'],
    department_id: 'sala',
    recurring: !1,
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
    textColor: '#1E40AF',
    metadata: { notes: 'Formazione obbligatoria nuovo personale' },
    source: 'general_task',
    sourceId: 'task1',
    extendedProps: {},
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user1',
    company_id: 'company1',
  },
  {
    id: '4',
    title: 'Controllo Inventario Scadenze',
    description: 'Verifica prodotti in scadenza nei prossimi 3 giorni',
    start: new Date(2025, 0, 19, 9, 0),
    end: new Date(2025, 0, 19, 10, 0),
    allDay: !1,
    type: 'general_task',
    status: 'overdue',
    priority: 'critical',
    assigned_to: ['user1'],
    department_id: 'magazzino',
    recurring: !0,
    recurrence_pattern: { frequency: 'daily', interval: 1 },
    backgroundColor: '#7F1D1D',
    borderColor: '#991B1B',
    textColor: '#FFFFFF',
    metadata: { notes: 'Controllo urgente prodotti in scadenza' },
    source: 'general_task',
    sourceId: 'task2',
    extendedProps: {},
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user1',
    company_id: 'company1',
  },
]
function H() {
  const { user: s } = A(),
    l = F(),
    {
      data: o = [],
      isLoading: p,
      error: C,
      refetch: h,
    } = S({
      queryKey: ['calendar-events', s?.company_id],
      queryFn: async () => {
        if (!s?.company_id)
          return (
            console.log('🔧 No company_id, using mock calendar events'),
            z.map(D).map(n => {
              const a = g(n.type, n.status, n.priority)
              return {
                ...n,
                backgroundColor: a.backgroundColor,
                borderColor: a.borderColor,
                textColor: a.textColor,
              }
            })
          )
        console.log(
          '🔧 Loading calendar events from Supabase for company:',
          s.company_id
        )
        try {
          const { data: r, error: n } = await I.from('maintenance_tasks')
            .select(
              `
            *,
            conservation_points(id, name, departments(id, name))
          `
            )
            .eq('company_id', s.company_id)
            .order('next_due', { ascending: !0 })
          if (n) throw (console.error('Error loading maintenance tasks:', n), n)
          return (
            console.log(
              '✅ Loaded maintenance tasks from Supabase:',
              r?.length || 0
            ),
            (r || []).map(t => {
              const u = new Date(t.next_due),
                w = new Date(
                  u.getTime() + (t.estimated_duration || 60) * 60 * 1e3
                ),
                f = {
                  id: `task-${t.id}`,
                  title: t.title || 'Manutenzione',
                  description:
                    t.instructions || 'Attività di manutenzione programmata',
                  start: u,
                  end: w,
                  allDay: !1,
                  type: 'maintenance',
                  status:
                    t.status === 'completed'
                      ? 'completed'
                      : u < new Date()
                        ? 'overdue'
                        : 'pending',
                  priority: t.priority || 'medium',
                  assigned_to: t.assigned_to ? [t.assigned_to] : [],
                  department_id: t.conservation_points?.departments?.id,
                  conservation_point_id: t.conservation_point_id,
                  recurring: t.frequency !== 'once',
                  recurrence_pattern:
                    t.frequency === 'daily'
                      ? { frequency: 'daily', interval: 1 }
                      : t.frequency === 'weekly'
                        ? { frequency: 'weekly', interval: 1 }
                        : t.frequency === 'monthly'
                          ? { frequency: 'monthly', interval: 1 }
                          : void 0,
                  backgroundColor: '#FEF3C7',
                  borderColor: '#F59E0B',
                  textColor: '#92400E',
                  metadata: {
                    conservation_point_id: t.conservation_point_id,
                    notes: t.instructions,
                    task_id: t.id,
                  },
                  source: 'maintenance',
                  sourceId: t.id,
                  extendedProps: {
                    status:
                      t.status === 'completed'
                        ? 'completed'
                        : u < new Date()
                          ? 'overdue'
                          : 'scheduled',
                    priority: t.priority || 'medium',
                    assignedTo: t.assigned_to ? [t.assigned_to] : [],
                    metadata: {
                      id: t.id,
                      notes: t.instructions,
                      conservationPoint: t.conservation_points?.name,
                      estimatedDuration: t.estimated_duration,
                    },
                  },
                  created_at: new Date(t.created_at),
                  updated_at: new Date(t.updated_at),
                  created_by: t.created_by || 'system',
                  company_id: t.company_id,
                },
                E = g(f.type, f.status, f.priority)
              return {
                ...f,
                backgroundColor: E.backgroundColor,
                borderColor: E.borderColor,
                textColor: E.textColor,
              }
            })
          )
        } catch (r) {
          return (
            console.error('Error loading calendar events from Supabase:', r),
            console.log('🔧 Fallback to mock calendar events due to error'),
            z.map(D).map(a => {
              const t = g(a.type, a.status, a.priority)
              return {
                ...a,
                backgroundColor: t.backgroundColor,
                borderColor: t.borderColor,
                textColor: t.textColor,
              }
            })
          )
        }
      },
      enabled: !!s,
      refetchInterval: 5 * 60 * 1e3,
    }),
    x = N({
      mutationFn: async r => {
        const n = g(r.type, 'pending', r.priority)
        return {
          id: `temp-${Date.now()}`,
          title: r.title,
          description: r.description,
          start: r.start,
          end: r.end,
          allDay: r.allDay || !1,
          type: r.type,
          status: 'pending',
          priority: r.priority,
          assigned_to: r.assigned_to,
          department_id: r.department_id,
          conservation_point_id: r.conservation_point_id,
          recurring: r.recurring || !1,
          recurrence_pattern: r.recurrence_pattern,
          backgroundColor: n.backgroundColor,
          borderColor: n.borderColor,
          textColor: n.textColor,
          metadata: r.metadata || {},
          source: r.type,
          sourceId: `temp-${Date.now()}`,
          extendedProps: {},
          created_at: new Date(),
          updated_at: new Date(),
          created_by: s?.id || 'unknown',
          company_id: s?.company_id || 'unknown',
        }
      },
      onSuccess: () => {
        ;(l.invalidateQueries({ queryKey: ['calendar-events'] }),
          m.success('Evento creato con successo'))
      },
      onError: r => {
        ;(console.error('Errore nella creazione evento:', r),
          m.error("Errore nella creazione dell'evento"))
      },
    }),
    y = N({
      mutationFn: async r => {
        const n = o.find(t => t.id === r.id)
        if (!n) throw new Error('Evento non trovato')
        const a = { ...n, ...r, updated_at: new Date() }
        if (r.status || r.priority) {
          const t = g(a.type, a.status, a.priority)
          ;((a.backgroundColor = t.backgroundColor),
            (a.borderColor = t.borderColor),
            (a.textColor = t.textColor))
        }
        return a
      },
      onSuccess: () => {
        ;(l.invalidateQueries({ queryKey: ['calendar-events'] }),
          m.success('Evento aggiornato con successo'))
      },
      onError: r => {
        ;(console.error("Errore nell'aggiornamento evento:", r),
          m.error("Errore nell'aggiornamento dell'evento"))
      },
    }),
    i = N({
      mutationFn: async r => {
        console.log('Deleting event:', r)
      },
      onSuccess: () => {
        ;(l.invalidateQueries({ queryKey: ['calendar-events'] }),
          m.success('Evento eliminato con successo'))
      },
      onError: r => {
        ;(console.error("Errore nell'eliminazione evento:", r),
          m.error("Errore nell'eliminazione dell'evento"))
      },
    }),
    v = r => (r ? B(o, r) : o),
    _ = () => M(o),
    c = r => {
      const n = new Date(r)
      n.setHours(0, 0, 0, 0)
      const a = new Date(r)
      return (
        a.setHours(23, 59, 59, 999),
        o.filter(t => {
          const u = t.start,
            w = t.end || t.start
          return u <= a && w >= n
        })
      )
    },
    j = (r = 7) => {
      const n = new Date(),
        a = new Date(n.getTime() + r * 24 * 60 * 60 * 1e3)
      return o.filter(
        t => t.start >= n && t.start <= a && t.status === 'pending'
      )
    },
    d = () => o.filter(r => r.status === 'overdue')
  return {
    events: o,
    isLoading: p,
    error: C,
    createEvent: x.mutate,
    updateEvent: y.mutate,
    deleteEvent: i.mutate,
    isCreating: x.isPending,
    isUpdating: y.isPending,
    isDeleting: i.isPending,
    refetch: h,
    getFilteredEvents: v,
    getEventStats: _,
    getEventsForDate: c,
    getUpcomingEvents: j,
    getOverdueEvents: d,
  }
}
const W = () => {
  const { user: s } = P(),
    { stats: l, isLoading: o } = k(),
    { stats: p, isLoading: C } = L(),
    { getEventStats: h, isLoading: x } = H(),
    y = h(),
    i = o || C || x,
    v = l?.total_points ?? 0,
    _ = l?.by_status.normal ?? 0,
    c = i
      ? 0
      : Math.round(
          ((_ + (p?.active_products || 0)) /
            Math.max(v + (p?.total_products || 1), 1)) *
            100
        ),
    j = [
      {
        label: 'Compliance Score',
        value: i ? '--' : `${c}%`,
        icon: T,
        color:
          c >= 90
            ? 'text-success-600'
            : c >= 70
              ? 'text-warning-600'
              : 'text-error-600',
        bgColor:
          c >= 90 ? 'bg-success-50' : c >= 70 ? 'bg-warning-50' : 'bg-error-50',
      },
      {
        label: 'Punti Conservazione',
        value: i ? '--' : `${_}/${v}`,
        icon: b,
        color: 'text-success-600',
        bgColor: 'bg-success-50',
      },
      {
        label: 'In Scadenza',
        value: i ? '--' : `${p?.expiring_soon || 0}`,
        icon: $,
        color: 'text-warning-600',
        bgColor: 'bg-warning-50',
      },
      {
        label: 'Attività Scadute',
        value: i ? '--' : `${y?.overdue || 0}`,
        icon: U,
        color: 'text-error-600',
        bgColor: 'bg-error-50',
      },
    ]
  return e.jsxs('div', {
    className: 'p-4 space-y-6',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between',
        children: [
          e.jsxs('div', {
            children: [
              e.jsxs('h1', {
                className: 'text-2xl font-bold text-gray-900',
                children: ['Ciao, ', s?.firstName || 'Utente', '!'],
              }),
              e.jsx('p', {
                className: 'text-gray-600',
                children: 'Benvenuto nel tuo HACCP Manager',
              }),
            ],
          }),
          e.jsx(q, { afterSignOutUrl: '/login' }),
        ],
      }),
      e.jsx('div', {
        className: 'grid grid-cols-2 gap-4',
        children: j.map((d, r) => {
          const n = d.icon
          return e.jsx(
            'div',
            {
              className: 'card p-4',
              children: e.jsxs('div', {
                className: 'flex items-center space-x-3',
                children: [
                  e.jsx('div', {
                    className: `p-2 rounded-lg ${d.bgColor}`,
                    children: e.jsx(n, { size: 20, className: d.color }),
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('p', {
                        className: 'text-sm text-gray-600',
                        children: d.label,
                      }),
                      e.jsx('p', {
                        className: 'text-lg font-semibold text-gray-900',
                        children: d.value,
                      }),
                    ],
                  }),
                ],
              }),
            },
            r
          )
        }),
      }),
      e.jsxs('div', {
        className: 'space-y-4',
        children: [
          e.jsx('h2', {
            className: 'text-lg font-semibold text-gray-900',
            children: 'Azioni Rapide',
          }),
          e.jsxs('div', {
            className: 'space-y-3',
            children: [
              e.jsx('button', {
                className:
                  'w-full card p-4 text-left hover:bg-gray-50 transition-colors',
                children: e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h3', {
                          className: 'font-medium text-gray-900',
                          children: 'Registra Temperatura',
                        }),
                        e.jsx('p', {
                          className: 'text-sm text-gray-600',
                          children: 'Aggiungi una nuova lettura',
                        }),
                      ],
                    }),
                    e.jsx(b, { className: 'text-gray-400', size: 20 }),
                  ],
                }),
              }),
              e.jsx('button', {
                className:
                  'w-full card p-4 text-left hover:bg-gray-50 transition-colors',
                children: e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h3', {
                          className: 'font-medium text-gray-900',
                          children: 'Completa Mansione',
                        }),
                        e.jsx('p', {
                          className: 'text-sm text-gray-600',
                          children: "Segna un'attività come completata",
                        }),
                      ],
                    }),
                    e.jsx(b, { className: 'text-gray-400', size: 20 }),
                  ],
                }),
              }),
              e.jsx('button', {
                className:
                  'w-full card p-4 text-left hover:bg-gray-50 transition-colors',
                children: e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h3', {
                          className: 'font-medium text-gray-900',
                          children: 'Aggiungi Prodotto',
                        }),
                        e.jsx('p', {
                          className: 'text-sm text-gray-600',
                          children: 'Registra un nuovo prodotto',
                        }),
                      ],
                    }),
                    e.jsx(b, { className: 'text-gray-400', size: 20 }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
      e.jsxs('div', {
        className: 'space-y-4',
        children: [
          e.jsx('h2', {
            className: 'text-lg font-semibold text-gray-900',
            children: 'Attività Recenti',
          }),
          e.jsxs('div', {
            className: 'space-y-3',
            children: [
              e.jsx('div', {
                className: 'card p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center space-x-3',
                  children: [
                    e.jsx('div', {
                      className: 'w-2 h-2 bg-success-500 rounded-full',
                    }),
                    e.jsxs('div', {
                      className: 'flex-1',
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium text-gray-900',
                          children: 'Pulizia frigorifero principale completata',
                        }),
                        e.jsx('p', {
                          className: 'text-xs text-gray-500',
                          children: '2 ore fa',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              e.jsx('div', {
                className: 'card p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center space-x-3',
                  children: [
                    e.jsx('div', {
                      className: 'w-2 h-2 bg-warning-500 rounded-full',
                    }),
                    e.jsxs('div', {
                      className: 'flex-1',
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium text-gray-900',
                          children: 'Temperatura freezer fuori range',
                        }),
                        e.jsx('p', {
                          className: 'text-xs text-gray-500',
                          children: '4 ore fa',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              e.jsx('div', {
                className: 'card p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center space-x-3',
                  children: [
                    e.jsx('div', {
                      className: 'w-2 h-2 bg-success-500 rounded-full',
                    }),
                    e.jsxs('div', {
                      className: 'flex-1',
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium text-gray-900',
                          children: 'Controllo scadenze inventario',
                        }),
                        e.jsx('p', {
                          className: 'text-xs text-gray-500',
                          children: '6 ore fa',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  })
}
export { W as default }
