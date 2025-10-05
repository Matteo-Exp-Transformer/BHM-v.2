import { j as e } from './query-vendor-BsnDS19Y.js'
import {
  h as k,
  C as R,
  S as q,
  c as T,
  u as J,
} from './calendar-features-DOX2NwpL.js'
import { r as v } from './react-vendor-Cttizgra.js'
import { u as E } from './conservation-features-D5ZiW3Ii.js'
import {
  u as D,
  v as I,
  w as L,
  x as P,
  T as H,
  X as G,
  g as z,
  Z as $,
  U,
  y as K,
  z as X,
  f as Q,
  e as V,
  b as W,
  G as B,
  H as A,
  J as Y,
  c as F,
} from './ui-vendor-BFMCvSnM.js'
import './calendar-vendor-CzJ7rMdU.js'
import './auth-vendor-CMFeYHy6.js'
import './inventory-features-tEOlqD7s.js'
const M = ({
    department: s,
    onEdit: o,
    onDelete: y,
    onToggleStatus: n,
    isToggling: u = !1,
    isDeleting: c = !1,
  }) => {
    const [a, d] = v.useState(!1),
      x = () => {
        n(s.id, !s.is_active)
      },
      b = () => {
        ;(y(s.id), d(!1))
      }
    return e.jsx('div', {
      className: `p-4 border rounded-lg transition-all duration-200 ${s.is_active ? 'border-gray-200 bg-white hover:shadow-md' : 'border-gray-300 bg-gray-50 opacity-75'}`,
      children: e.jsxs('div', {
        className: 'flex items-start justify-between',
        children: [
          e.jsxs('div', {
            className: 'flex items-start space-x-3 flex-1',
            children: [
              e.jsx('div', {
                className: `p-2 rounded-lg ${s.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`,
                children: e.jsx(D, { className: 'h-5 w-5' }),
              }),
              e.jsxs('div', {
                className: 'flex-1 min-w-0',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center space-x-2',
                    children: [
                      e.jsx('h4', {
                        className: `text-sm font-semibold truncate ${s.is_active ? 'text-gray-900' : 'text-gray-500'}`,
                        children: s.name,
                      }),
                      e.jsx('span', {
                        className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`,
                        children: s.is_active ? 'Attivo' : 'Inattivo',
                      }),
                    ],
                  }),
                  s.description &&
                    e.jsx('p', {
                      className: `mt-1 text-sm truncate ${s.is_active ? 'text-gray-600' : 'text-gray-400'}`,
                      children: s.description,
                    }),
                  e.jsxs('div', {
                    className: 'mt-2 text-xs text-gray-400',
                    children: [
                      'Creato:',
                      ' ',
                      new Date(s.created_at).toLocaleDateString('it-IT'),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'flex items-center space-x-1 ml-4',
            children: [
              e.jsx('button', {
                type: 'button',
                onClick: x,
                disabled: u,
                className: `p-1.5 rounded-md transition-colors ${s.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'} disabled:opacity-50`,
                title: s.is_active ? 'Disattiva reparto' : 'Attiva reparto',
                children: u
                  ? e.jsx('div', {
                      className:
                        'animate-spin rounded-full h-4 w-4 border-b-2 border-current',
                    })
                  : s.is_active
                    ? e.jsx(I, { className: 'h-4 w-4' })
                    : e.jsx(L, { className: 'h-4 w-4' }),
              }),
              e.jsx('button', {
                type: 'button',
                onClick: () => o(s),
                className:
                  'p-1.5 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors',
                title: 'Modifica reparto',
                children: e.jsx(P, { className: 'h-4 w-4' }),
              }),
              a
                ? e.jsxs('div', {
                    className: 'flex items-center space-x-1',
                    children: [
                      e.jsx('button', {
                        type: 'button',
                        onClick: () => d(!1),
                        className:
                          'px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors',
                        children: 'Annulla',
                      }),
                      e.jsx('button', {
                        type: 'button',
                        onClick: b,
                        disabled: c,
                        className:
                          'px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50',
                        children: c ? 'Eliminando...' : 'Conferma',
                      }),
                    ],
                  })
                : e.jsx('button', {
                    type: 'button',
                    onClick: () => d(!0),
                    className:
                      'p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors',
                    title: 'Elimina reparto',
                    children: e.jsx(H, { className: 'h-4 w-4' }),
                  }),
            ],
          }),
        ],
      }),
    })
  },
  ee = ({
    isOpen: s,
    onClose: o,
    onSubmit: y,
    department: n = null,
    isLoading: u = !1,
  }) => {
    const [c, a] = v.useState({ name: '', description: '', is_active: !0 }),
      [d, x] = v.useState({})
    v.useEffect(() => {
      s &&
        (a(
          n
            ? {
                name: n.name,
                description: n.description || '',
                is_active: n.is_active,
              }
            : { name: '', description: '', is_active: !0 }
        ),
        x({}))
    }, [s, n])
    const b = () => {
        const r = {}
        return (
          c.name.trim()
            ? c.name.trim().length < 2
              ? (r.name = 'Il nome deve essere di almeno 2 caratteri')
              : c.name.trim().length > 50 &&
                (r.name = 'Il nome non può superare i 50 caratteri')
            : (r.name = 'Il nome del reparto è obbligatorio'),
          c.description &&
            c.description.length > 200 &&
            (r.description = 'La descrizione non può superare i 200 caratteri'),
          x(r),
          Object.keys(r).length === 0
        )
      },
      j = r => {
        if ((r.preventDefault(), !b())) return
        const p = {
          name: c.name.trim(),
          description: c.description?.trim() || void 0,
          is_active: c.is_active,
        }
        y(p)
      },
      g = (r, p) => {
        ;(a(h => ({ ...h, [r]: p })), d[r] && x(h => ({ ...h, [r]: '' })))
      }
    if (!s) return null
    const i = !!n
    return e.jsx('div', {
      className: 'fixed inset-0 z-50 overflow-y-auto',
      children: e.jsxs('div', {
        className:
          'flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0',
        children: [
          e.jsx('div', {
            className:
              'fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75',
            onClick: o,
          }),
          e.jsxs('div', {
            className:
              'inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-6',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center space-x-3',
                    children: [
                      e.jsx('div', {
                        className: 'p-2 bg-blue-100 rounded-lg',
                        children: e.jsx(D, {
                          className: 'h-5 w-5 text-blue-600',
                        }),
                      }),
                      e.jsx('h3', {
                        className: 'text-lg font-semibold text-gray-900',
                        children: i ? 'Modifica Reparto' : 'Nuovo Reparto',
                      }),
                    ],
                  }),
                  e.jsx('button', {
                    type: 'button',
                    onClick: o,
                    className:
                      'p-1 text-gray-400 hover:text-gray-600 transition-colors',
                    children: e.jsx(G, { className: 'h-5 w-5' }),
                  }),
                ],
              }),
              e.jsxs('form', {
                onSubmit: j,
                className: 'space-y-4',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx('label', {
                        htmlFor: 'name',
                        className:
                          'block text-sm font-medium text-gray-700 mb-1',
                        children: 'Nome Reparto *',
                      }),
                      e.jsx('input', {
                        type: 'text',
                        id: 'name',
                        value: c.name,
                        onChange: r => g('name', r.target.value),
                        className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${d.name ? 'border-red-300' : 'border-gray-300'}`,
                        placeholder: 'es. Cucina, Sala, Bancone...',
                        maxLength: 50,
                      }),
                      d.name &&
                        e.jsx('p', {
                          className: 'mt-1 text-sm text-red-600',
                          children: d.name,
                        }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('label', {
                        htmlFor: 'description',
                        className:
                          'block text-sm font-medium text-gray-700 mb-1',
                        children: 'Descrizione',
                      }),
                      e.jsx('textarea', {
                        id: 'description',
                        value: c.description,
                        onChange: r => g('description', r.target.value),
                        rows: 3,
                        className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${d.description ? 'border-red-300' : 'border-gray-300'}`,
                        placeholder: 'Descrizione opzionale del reparto...',
                        maxLength: 200,
                      }),
                      d.description &&
                        e.jsx('p', {
                          className: 'mt-1 text-sm text-red-600',
                          children: d.description,
                        }),
                      e.jsxs('p', {
                        className: 'mt-1 text-xs text-gray-500',
                        children: [
                          c.description?.length || 0,
                          '/200 caratteri',
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center',
                    children: [
                      e.jsx('input', {
                        type: 'checkbox',
                        id: 'is_active',
                        checked: c.is_active,
                        onChange: r => g('is_active', r.target.checked),
                        className:
                          'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                      }),
                      e.jsx('label', {
                        htmlFor: 'is_active',
                        className: 'ml-2 block text-sm text-gray-700',
                        children: 'Reparto attivo',
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className:
                      'flex justify-end space-x-3 pt-4 border-t border-gray-200',
                    children: [
                      e.jsx('button', {
                        type: 'button',
                        onClick: o,
                        className:
                          'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        children: 'Annulla',
                      }),
                      e.jsx('button', {
                        type: 'submit',
                        disabled: u,
                        className:
                          'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                        children: u
                          ? e.jsxs('div', {
                              className: 'flex items-center space-x-2',
                              children: [
                                e.jsx('div', {
                                  className:
                                    'animate-spin rounded-full h-4 w-4 border-b-2 border-white',
                                }),
                                e.jsx('span', {
                                  children: i ? 'Salvando...' : 'Creando...',
                                }),
                              ],
                            })
                          : e.jsx('span', {
                              children: i ? 'Salva Modifiche' : 'Crea Reparto',
                            }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    })
  },
  se = () => {
    const {
        departments: s,
        stats: o,
        isLoading: y,
        isCreating: n,
        isUpdating: u,
        isDeleting: c,
        isToggling: a,
        isCreatingPresets: d,
        createDepartment: x,
        updateDepartment: b,
        deleteDepartment: j,
        toggleDepartmentStatus: g,
        createPresetDepartments: i,
      } = E(),
      [r, p] = v.useState(!1),
      [h, m] = v.useState(null),
      l = () => {
        ;(m(null), p(!0))
      },
      C = w => {
        ;(m(w), p(!0))
      },
      N = () => {
        ;(p(!1), m(null))
      },
      t = w => {
        h
          ? b(
              { id: h.id, input: w },
              {
                onSuccess: () => {
                  N()
                },
              }
            )
          : x(w, {
              onSuccess: () => {
                N()
              },
            })
      },
      f = w => {
        j(w)
      },
      _ = (w, Z) => {
        g({ id: w, isActive: Z })
      },
      S = () => {
        i()
      },
      O = e.jsxs(e.Fragment, {
        children: [
          e.jsx(k, { icon: z, label: 'Nuovo', onClick: l, variant: 'primary' }),
          s.length === 0 &&
            e.jsx(k, {
              icon: $,
              label: 'Predefiniti',
              onClick: S,
              variant: 'default',
              disabled: d,
            }),
        ],
      })
    return e.jsxs(e.Fragment, {
      children: [
        e.jsx(R, {
          title: 'Gestione Reparti',
          icon: D,
          counter: o.total,
          actions: O,
          isLoading: y,
          error: null,
          isEmpty: s.length === 0,
          emptyMessage:
            'Nessun reparto configurato. Crea il primo reparto o usa i predefiniti.',
          className: 'mb-6',
          contentClassName: 'px-4 py-6 sm:px-6',
          emptyActionLabel:
            s.length === 0 ? 'Aggiungi predefiniti' : 'Crea reparto',
          onEmptyAction: s.length === 0 ? S : l,
          children:
            s.length > 0 &&
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'mb-4 grid grid-cols-3 gap-4',
                  children: [
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className: 'text-2xl font-bold text-gray-900',
                          children: o.total,
                        }),
                        e.jsx('div', {
                          className: 'text-sm text-gray-500',
                          children: 'Totale',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className: 'text-2xl font-bold text-green-600',
                          children: o.active,
                        }),
                        e.jsx('div', {
                          className: 'text-sm text-gray-500',
                          children: 'Attivi',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className: 'text-2xl font-bold text-gray-400',
                          children: o.inactive,
                        }),
                        e.jsx('div', {
                          className: 'text-sm text-gray-500',
                          children: 'Inattivi',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'space-y-3',
                  children: s.map(w =>
                    e.jsx(
                      M,
                      {
                        department: w,
                        onEdit: C,
                        onDelete: f,
                        onToggleStatus: _,
                        isToggling: a,
                        isDeleting: c,
                      },
                      w.id
                    )
                  ),
                }),
                s.length < 10 &&
                  e.jsxs('div', {
                    className: 'mt-4 pt-4 border-t border-gray-200',
                    children: [
                      e.jsx('p', {
                        className: 'text-xs text-gray-500 mb-2',
                        children: 'Azioni rapide:',
                      }),
                      e.jsxs('div', {
                        className: 'flex space-x-2',
                        children: [
                          e.jsxs('button', {
                            type: 'button',
                            onClick: l,
                            className:
                              'inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors',
                            children: [
                              e.jsx(z, { className: 'h-3 w-3 mr-1' }),
                              'Aggiungi Reparto',
                            ],
                          }),
                          o.total < 4 &&
                            e.jsxs('button', {
                              type: 'button',
                              onClick: S,
                              disabled: d,
                              className:
                                'inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50',
                              children: [
                                e.jsx($, { className: 'h-3 w-3 mr-1' }),
                                d ? 'Creando...' : 'Aggiungi Predefiniti',
                              ],
                            }),
                        ],
                      }),
                    ],
                  }),
              ],
            }),
        }),
        e.jsx(ee, {
          isOpen: r,
          onClose: N,
          onSubmit: t,
          department: h,
          isLoading: n || u,
        }),
      ],
    })
  },
  te = ({
    staffMember: s,
    onEdit: o,
    onDelete: y,
    onToggleStatus: n,
    isToggling: u = !1,
    isDeleting: c = !1,
    departments: a = [],
  }) => {
    const [d, x] = v.useState(!1),
      b = () => {
        const l = s.status === 'active' ? 'inactive' : 'active'
        n(s.id, l)
      },
      j = () => {
        ;(y(s.id), x(!1))
      },
      g = l =>
        ({
          admin: 'Amministratore',
          responsabile: 'Responsabile',
          dipendente: 'Dipendente',
          collaboratore: 'Collaboratore',
        })[l] || l,
      i = l => {
        switch (l) {
          case 'active':
            return 'bg-green-100 text-green-800'
          case 'inactive':
            return 'bg-gray-100 text-gray-600'
          case 'suspended':
            return 'bg-red-100 text-red-800'
          default:
            return 'bg-gray-100 text-gray-600'
        }
      },
      r = l => {
        switch (l) {
          case 'admin':
            return 'bg-purple-100 text-purple-800'
          case 'responsabile':
            return 'bg-blue-100 text-blue-800'
          case 'dipendente':
            return 'bg-green-100 text-green-800'
          case 'collaboratore':
            return 'bg-yellow-100 text-yellow-800'
          default:
            return 'bg-gray-100 text-gray-600'
        }
      },
      p = () => {
        if (!s.haccp_certification?.expiry_date) return !1
        const l = new Date(s.haccp_certification.expiry_date),
          C = new Date(),
          N = new Date(C.getTime() + 30 * 24 * 60 * 60 * 1e3)
        return l <= N && l > C
      },
      h = () =>
        s.haccp_certification?.expiry_date
          ? new Date(s.haccp_certification.expiry_date) < new Date()
          : !1,
      m = () =>
        s.department_assignments
          ? a.filter(l => s.department_assignments?.includes(l.id))
          : []
    return e.jsx('div', {
      className: `p-4 border rounded-lg transition-all duration-200 ${s.status === 'active' ? 'border-gray-200 bg-white hover:shadow-md' : s.status === 'suspended' ? 'border-red-300 bg-red-50 opacity-90' : 'border-gray-300 bg-gray-50 opacity-75'}`,
      children: e.jsxs('div', {
        className: 'flex items-start justify-between',
        children: [
          e.jsxs('div', {
            className: 'flex items-start space-x-3 flex-1',
            children: [
              e.jsx('div', {
                className: `p-2 rounded-lg ${s.status === 'active' ? 'bg-blue-100 text-blue-600' : s.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`,
                children: e.jsx(U, { className: 'h-5 w-5' }),
              }),
              e.jsxs('div', {
                className: 'flex-1 min-w-0',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center space-x-2 mb-1',
                    children: [
                      e.jsx('h4', {
                        className: `text-sm font-semibold truncate ${s.status === 'active' ? 'text-gray-900' : 'text-gray-500'}`,
                        children: s.name,
                      }),
                      e.jsx('span', {
                        className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${i(s.status)}`,
                        children:
                          s.status === 'active'
                            ? 'Attivo'
                            : s.status === 'suspended'
                              ? 'Sospeso'
                              : 'Inattivo',
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex flex-wrap items-center gap-2 mb-2',
                    children: [
                      e.jsx('span', {
                        className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${r(s.role)}`,
                        children: g(s.role),
                      }),
                      e.jsx('span', {
                        className:
                          'inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700',
                        children: s.category,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'space-y-1 mb-2',
                    children: [
                      s.email &&
                        e.jsxs('div', {
                          className:
                            'flex items-center space-x-1 text-xs text-gray-500',
                          children: [
                            e.jsx(K, { className: 'h-3 w-3' }),
                            e.jsx('span', {
                              className: 'truncate',
                              children: s.email,
                            }),
                          ],
                        }),
                      s.phone &&
                        e.jsxs('div', {
                          className:
                            'flex items-center space-x-1 text-xs text-gray-500',
                          children: [
                            e.jsx(X, { className: 'h-3 w-3' }),
                            e.jsx('span', { children: s.phone }),
                          ],
                        }),
                    ],
                  }),
                  s.hire_date &&
                    e.jsxs('div', {
                      className:
                        'flex items-center space-x-1 text-xs text-gray-400 mb-2',
                      children: [
                        e.jsx(Q, { className: 'h-3 w-3' }),
                        e.jsxs('span', {
                          children: [
                            'Assunto:',
                            ' ',
                            new Date(s.hire_date).toLocaleDateString('it-IT'),
                          ],
                        }),
                      ],
                    }),
                  s.haccp_certification &&
                    e.jsxs('div', {
                      className: 'mb-2',
                      children: [
                        e.jsxs('div', {
                          className: `flex items-center space-x-1 text-xs ${h() ? 'text-red-600' : p() ? 'text-yellow-600' : 'text-green-600'}`,
                          children: [
                            h()
                              ? e.jsx(V, { className: 'h-3 w-3' })
                              : p()
                                ? e.jsx(W, { className: 'h-3 w-3' })
                                : e.jsx(B, { className: 'h-3 w-3' }),
                            e.jsxs('span', {
                              children: [
                                'HACCP',
                                ' ',
                                s.haccp_certification.level === 'advanced'
                                  ? 'Avanzato'
                                  : 'Base',
                                h() && ' - SCADUTO',
                                p() && ' - IN SCADENZA',
                              ],
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'text-xs text-gray-400',
                          children: [
                            'Scadenza:',
                            ' ',
                            new Date(
                              s.haccp_certification.expiry_date
                            ).toLocaleDateString('it-IT'),
                          ],
                        }),
                      ],
                    }),
                  m().length > 0 &&
                    e.jsxs('div', {
                      className: 'mb-2',
                      children: [
                        e.jsxs('div', {
                          className:
                            'flex items-center space-x-1 text-xs text-gray-500 mb-1',
                          children: [
                            e.jsx(D, { className: 'h-3 w-3' }),
                            e.jsx('span', { children: 'Reparti:' }),
                          ],
                        }),
                        e.jsx('div', {
                          className: 'flex flex-wrap gap-1',
                          children: m().map(l =>
                            e.jsx(
                              'span',
                              {
                                className:
                                  'inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700',
                                children: l.name,
                              },
                              l.id
                            )
                          ),
                        }),
                      ],
                    }),
                  s.notes &&
                    e.jsx('div', {
                      className:
                        'text-xs text-gray-500 bg-gray-50 rounded p-2 mb-2',
                      children: s.notes,
                    }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'flex items-center space-x-1 ml-4',
            children: [
              e.jsx('button', {
                type: 'button',
                onClick: b,
                disabled: u,
                className: `p-1.5 rounded-md transition-colors ${s.status === 'active' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'} disabled:opacity-50`,
                title:
                  s.status === 'active'
                    ? 'Disattiva dipendente'
                    : 'Attiva dipendente',
                children: u
                  ? e.jsx('div', {
                      className:
                        'animate-spin rounded-full h-4 w-4 border-b-2 border-current',
                    })
                  : s.status === 'active'
                    ? e.jsx(I, { className: 'h-4 w-4' })
                    : e.jsx(L, { className: 'h-4 w-4' }),
              }),
              e.jsx('button', {
                type: 'button',
                onClick: () => o(s),
                className:
                  'p-1.5 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors',
                title: 'Modifica dipendente',
                children: e.jsx(P, { className: 'h-4 w-4' }),
              }),
              d
                ? e.jsxs('div', {
                    className: 'flex items-center space-x-1',
                    children: [
                      e.jsx('button', {
                        type: 'button',
                        onClick: () => x(!1),
                        className:
                          'px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors',
                        children: 'Annulla',
                      }),
                      e.jsx('button', {
                        type: 'button',
                        onClick: j,
                        disabled: c,
                        className:
                          'px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50',
                        children: c ? 'Eliminando...' : 'Conferma',
                      }),
                    ],
                  })
                : e.jsx('button', {
                    type: 'button',
                    onClick: () => x(!0),
                    className:
                      'p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors',
                    title: 'Elimina dipendente',
                    children: e.jsx(H, { className: 'h-4 w-4' }),
                  }),
            ],
          }),
        ],
      }),
    })
  },
  ae = ({
    isOpen: s,
    onClose: o,
    onSubmit: y,
    staffMember: n = null,
    isLoading: u = !1,
    departments: c = [],
  }) => {
    const [a, d] = v.useState({
        name: '',
        role: 'dipendente',
        category: 'Altro',
        email: '',
        phone: '',
        hire_date: '',
        status: 'active',
        notes: '',
        department_assignments: [],
      }),
      [x, b] = v.useState({
        level: 'base',
        expiry_date: '',
        issuing_authority: '',
        certificate_number: '',
      }),
      [j, g] = v.useState(!1),
      [i, r] = v.useState({})
    v.useEffect(() => {
      s &&
        (n
          ? (d({
              name: n.name,
              role: n.role,
              category: n.category,
              email: n.email || '',
              phone: n.phone || '',
              hire_date: n.hire_date || '',
              status: n.status,
              notes: n.notes || '',
              department_assignments: n.department_assignments || [],
            }),
            n.haccp_certification
              ? (g(!0), b(n.haccp_certification))
              : (g(!1),
                b({
                  level: 'base',
                  expiry_date: '',
                  issuing_authority: '',
                  certificate_number: '',
                })))
          : (d({
              name: '',
              role: 'dipendente',
              category: 'Altro',
              email: '',
              phone: '',
              hire_date: '',
              status: 'active',
              notes: '',
              department_assignments: [],
            }),
            g(!1),
            b({
              level: 'base',
              expiry_date: '',
              issuing_authority: '',
              certificate_number: '',
            })),
        r({}))
    }, [s, n])
    const p = () => {
        const t = {}
        return (
          a.name.trim()
            ? a.name.trim().length < 2 &&
              (t.name = 'Il nome deve essere di almeno 2 caratteri')
            : (t.name = 'Il nome è obbligatorio'),
          a.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email) &&
            (t.email = 'Inserisci un email valido'),
          a.phone &&
            !/^[\d\s\-+()]+$/.test(a.phone) &&
            (t.phone = 'Inserisci un numero di telefono valido'),
          j &&
            (x.expiry_date ||
              (t.haccp_expiry = 'La data di scadenza è obbligatoria'),
            x.issuing_authority.trim() ||
              (t.haccp_authority = "L'ente certificatore è obbligatorio"),
            x.certificate_number.trim() ||
              (t.haccp_number = 'Il numero certificato è obbligatorio')),
          r(t),
          Object.keys(t).length === 0
        )
      },
      h = t => {
        if ((t.preventDefault(), !p())) return
        const f = {
          ...a,
          name: a.name.trim(),
          email: a.email?.trim() || void 0,
          phone: a.phone?.trim() || void 0,
          notes: a.notes?.trim() || void 0,
          hire_date: a.hire_date || void 0,
          haccp_certification: j ? x : void 0,
        }
        y(f)
      },
      m = (t, f) => {
        ;(d(_ => ({ ..._, [t]: f })), i[t] && r(_ => ({ ..._, [t]: '' })))
      },
      l = (t, f) => {
        b(S => ({ ...S, [t]: f }))
        const _ = `haccp_${t === 'expiry_date' ? 'expiry' : t === 'issuing_authority' ? 'authority' : 'number'}`
        i[_] && r(S => ({ ...S, [_]: '' }))
      },
      C = t => {
        const f = a.department_assignments || []
        f.includes(t)
          ? m(
              'department_assignments',
              f.filter(S => S !== t)
            )
          : m('department_assignments', [...f, t])
      }
    if (!s) return null
    const N = !!n
    return e.jsx('div', {
      className: 'fixed inset-0 z-50 overflow-y-auto',
      children: e.jsxs('div', {
        className:
          'flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0',
        children: [
          e.jsx('div', {
            className:
              'fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75',
            onClick: o,
          }),
          e.jsxs('div', {
            className:
              'inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg max-h-[90vh] overflow-y-auto',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-6',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center space-x-3',
                    children: [
                      e.jsx('div', {
                        className: 'p-2 bg-blue-100 rounded-lg',
                        children: e.jsx(U, {
                          className: 'h-5 w-5 text-blue-600',
                        }),
                      }),
                      e.jsx('h3', {
                        className: 'text-lg font-semibold text-gray-900',
                        children: N
                          ? 'Modifica Dipendente'
                          : 'Nuovo Dipendente',
                      }),
                    ],
                  }),
                  e.jsx('button', {
                    type: 'button',
                    onClick: o,
                    className:
                      'p-1 text-gray-400 hover:text-gray-600 transition-colors',
                    children: e.jsx(G, { className: 'h-5 w-5' }),
                  }),
                ],
              }),
              e.jsxs('form', {
                onSubmit: h,
                className: 'space-y-6',
                children: [
                  e.jsxs('div', {
                    className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            htmlFor: 'name',
                            className:
                              'block text-sm font-medium text-gray-700 mb-1',
                            children: 'Nome Completo *',
                          }),
                          e.jsx('input', {
                            type: 'text',
                            id: 'name',
                            value: a.name,
                            onChange: t => m('name', t.target.value),
                            className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${i.name ? 'border-red-300' : 'border-gray-300'}`,
                            placeholder: 'Nome e Cognome',
                          }),
                          i.name &&
                            e.jsx('p', {
                              className: 'mt-1 text-sm text-red-600',
                              children: i.name,
                            }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            htmlFor: 'role',
                            className:
                              'block text-sm font-medium text-gray-700 mb-1',
                            children: 'Ruolo *',
                          }),
                          e.jsxs('select', {
                            id: 'role',
                            value: a.role,
                            onChange: t => m('role', t.target.value),
                            className:
                              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            children: [
                              e.jsx('option', {
                                value: 'dipendente',
                                children: 'Dipendente',
                              }),
                              e.jsx('option', {
                                value: 'collaboratore',
                                children: 'Collaboratore',
                              }),
                              e.jsx('option', {
                                value: 'responsabile',
                                children: 'Responsabile',
                              }),
                              e.jsx('option', {
                                value: 'admin',
                                children: 'Amministratore',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            htmlFor: 'category',
                            className:
                              'block text-sm font-medium text-gray-700 mb-1',
                            children: 'Categoria *',
                          }),
                          e.jsx('select', {
                            id: 'category',
                            value: a.category,
                            onChange: t => m('category', t.target.value),
                            className:
                              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            children: q.map(t =>
                              e.jsx('option', { value: t, children: t }, t)
                            ),
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            htmlFor: 'status',
                            className:
                              'block text-sm font-medium text-gray-700 mb-1',
                            children: 'Stato',
                          }),
                          e.jsxs('select', {
                            id: 'status',
                            value: a.status,
                            onChange: t => m('status', t.target.value),
                            className:
                              'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            children: [
                              e.jsx('option', {
                                value: 'active',
                                children: 'Attivo',
                              }),
                              e.jsx('option', {
                                value: 'inactive',
                                children: 'Inattivo',
                              }),
                              e.jsx('option', {
                                value: 'suspended',
                                children: 'Sospeso',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            htmlFor: 'email',
                            className:
                              'block text-sm font-medium text-gray-700 mb-1',
                            children: 'Email',
                          }),
                          e.jsx('input', {
                            type: 'email',
                            id: 'email',
                            value: a.email,
                            onChange: t => m('email', t.target.value),
                            className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${i.email ? 'border-red-300' : 'border-gray-300'}`,
                            placeholder: 'email@esempio.com',
                          }),
                          i.email &&
                            e.jsx('p', {
                              className: 'mt-1 text-sm text-red-600',
                              children: i.email,
                            }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            htmlFor: 'phone',
                            className:
                              'block text-sm font-medium text-gray-700 mb-1',
                            children: 'Telefono',
                          }),
                          e.jsx('input', {
                            type: 'tel',
                            id: 'phone',
                            value: a.phone,
                            onChange: t => m('phone', t.target.value),
                            className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${i.phone ? 'border-red-300' : 'border-gray-300'}`,
                            placeholder: '+39 123 456 7890',
                          }),
                          i.phone &&
                            e.jsx('p', {
                              className: 'mt-1 text-sm text-red-600',
                              children: i.phone,
                            }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('label', {
                        htmlFor: 'hire_date',
                        className:
                          'block text-sm font-medium text-gray-700 mb-1',
                        children: 'Data di Assunzione',
                      }),
                      e.jsx('input', {
                        type: 'date',
                        id: 'hire_date',
                        value: a.hire_date,
                        onChange: t => m('hire_date', t.target.value),
                        className:
                          'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      }),
                    ],
                  }),
                  c.length > 0 &&
                    e.jsxs('div', {
                      children: [
                        e.jsxs('label', {
                          className:
                            'block text-sm font-medium text-gray-700 mb-2',
                          children: [
                            e.jsx(D, { className: 'inline h-4 w-4 mr-1' }),
                            'Assegnazione Reparti',
                          ],
                        }),
                        e.jsx('div', {
                          className: 'grid grid-cols-2 md:grid-cols-3 gap-2',
                          children: c.map(t =>
                            e.jsxs(
                              'label',
                              {
                                className:
                                  'flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer',
                                children: [
                                  e.jsx('input', {
                                    type: 'checkbox',
                                    checked:
                                      a.department_assignments?.includes(
                                        t.id
                                      ) || !1,
                                    onChange: () => C(t.id),
                                    className:
                                      'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                                  }),
                                  e.jsx('span', {
                                    className: 'text-sm text-gray-700',
                                    children: t.name,
                                  }),
                                ],
                              },
                              t.id
                            )
                          ),
                        }),
                      ],
                    }),
                  e.jsxs('div', {
                    className: 'border-t pt-4',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center space-x-2 mb-3',
                        children: [
                          e.jsx('input', {
                            type: 'checkbox',
                            id: 'has_haccp',
                            checked: j,
                            onChange: t => g(t.target.checked),
                            className:
                              'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                          }),
                          e.jsxs('label', {
                            htmlFor: 'has_haccp',
                            className:
                              'flex items-center text-sm font-medium text-gray-700',
                            children: [
                              e.jsx(B, { className: 'h-4 w-4 mr-1' }),
                              'Certificazione HACCP',
                            ],
                          }),
                        ],
                      }),
                      j &&
                        e.jsxs('div', {
                          className: 'ml-6 space-y-4 p-4 bg-blue-50 rounded-lg',
                          children: [
                            e.jsxs('div', {
                              className:
                                'grid grid-cols-1 md:grid-cols-2 gap-4',
                              children: [
                                e.jsxs('div', {
                                  children: [
                                    e.jsx('label', {
                                      className:
                                        'block text-sm font-medium text-gray-700 mb-1',
                                      children: 'Livello *',
                                    }),
                                    e.jsxs('select', {
                                      value: x.level,
                                      onChange: t => l('level', t.target.value),
                                      className:
                                        'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                                      children: [
                                        e.jsx('option', {
                                          value: 'base',
                                          children: 'Base',
                                        }),
                                        e.jsx('option', {
                                          value: 'advanced',
                                          children: 'Avanzato',
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  children: [
                                    e.jsx('label', {
                                      className:
                                        'block text-sm font-medium text-gray-700 mb-1',
                                      children: 'Data Scadenza *',
                                    }),
                                    e.jsx('input', {
                                      type: 'date',
                                      value: x.expiry_date,
                                      onChange: t =>
                                        l('expiry_date', t.target.value),
                                      className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${i.haccp_expiry ? 'border-red-300' : 'border-gray-300'}`,
                                    }),
                                    i.haccp_expiry &&
                                      e.jsx('p', {
                                        className: 'mt-1 text-sm text-red-600',
                                        children: i.haccp_expiry,
                                      }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className:
                                'grid grid-cols-1 md:grid-cols-2 gap-4',
                              children: [
                                e.jsxs('div', {
                                  children: [
                                    e.jsx('label', {
                                      className:
                                        'block text-sm font-medium text-gray-700 mb-1',
                                      children: 'Ente Certificatore *',
                                    }),
                                    e.jsx('input', {
                                      type: 'text',
                                      value: x.issuing_authority,
                                      onChange: t =>
                                        l('issuing_authority', t.target.value),
                                      className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${i.haccp_authority ? 'border-red-300' : 'border-gray-300'}`,
                                      placeholder: 'Nome ente certificatore',
                                    }),
                                    i.haccp_authority &&
                                      e.jsx('p', {
                                        className: 'mt-1 text-sm text-red-600',
                                        children: i.haccp_authority,
                                      }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  children: [
                                    e.jsx('label', {
                                      className:
                                        'block text-sm font-medium text-gray-700 mb-1',
                                      children: 'Numero Certificato *',
                                    }),
                                    e.jsx('input', {
                                      type: 'text',
                                      value: x.certificate_number,
                                      onChange: t =>
                                        l('certificate_number', t.target.value),
                                      className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${i.haccp_number ? 'border-red-300' : 'border-gray-300'}`,
                                      placeholder: 'Numero del certificato',
                                    }),
                                    i.haccp_number &&
                                      e.jsx('p', {
                                        className: 'mt-1 text-sm text-red-600',
                                        children: i.haccp_number,
                                      }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('label', {
                        htmlFor: 'notes',
                        className:
                          'block text-sm font-medium text-gray-700 mb-1',
                        children: 'Note',
                      }),
                      e.jsx('textarea', {
                        id: 'notes',
                        value: a.notes,
                        onChange: t => m('notes', t.target.value),
                        rows: 3,
                        className:
                          'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                        placeholder: 'Note aggiuntive sul dipendente...',
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className:
                      'flex justify-end space-x-3 pt-4 border-t border-gray-200',
                    children: [
                      e.jsx('button', {
                        type: 'button',
                        onClick: o,
                        className:
                          'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        children: 'Annulla',
                      }),
                      e.jsx('button', {
                        type: 'submit',
                        disabled: u,
                        className:
                          'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                        children: u
                          ? e.jsxs('div', {
                              className: 'flex items-center space-x-2',
                              children: [
                                e.jsx('div', {
                                  className:
                                    'animate-spin rounded-full h-4 w-4 border-b-2 border-white',
                                }),
                                e.jsx('span', {
                                  children: N ? 'Salvando...' : 'Creando...',
                                }),
                              ],
                            })
                          : e.jsx('span', {
                              children: N
                                ? 'Salva Modifiche'
                                : 'Crea Dipendente',
                            }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    })
  },
  ie = () => {
    const {
        staff: s,
        stats: o,
        isLoading: y,
        isCreating: n,
        isUpdating: u,
        isDeleting: c,
        isToggling: a,
        toggleStaffStatus: d,
      } = T(),
      { departments: x } = E(),
      [b, j] = v.useState(!1),
      [g, i] = v.useState(null),
      r = () => {
        ;(i(null), j(!0))
      },
      p = t => {
        ;(i(t), j(!0))
      },
      h = () => {
        ;(j(!1), i(null))
      },
      m = t => {
        g
          ? (console.log('Update staff:', g.id, t), h())
          : (console.log('Create staff:', t), h())
      },
      l = t => {
        console.log('Delete staff:', t)
      },
      C = (t, f) => {
        d({ id: t, status: f })
      },
      N = e.jsxs(e.Fragment, {
        children: [
          e.jsx(k, { icon: z, label: 'Nuovo', onClick: r, variant: 'primary' }),
          e.jsx(k, {
            icon: Y,
            label: 'Aggiungi Staff',
            onClick: r,
            variant: 'default',
          }),
        ],
      })
    return e.jsxs(e.Fragment, {
      children: [
        e.jsx(R, {
          title: 'Gestione Staff',
          icon: A,
          counter: o.total,
          actions: N,
          isLoading: y,
          error: null,
          isEmpty: s.length === 0,
          emptyMessage:
            'Nessun membro dello staff configurato. Aggiungi il primo dipendente per iniziare.',
          className: 'mb-6',
          contentClassName: 'px-4 py-6 sm:px-6',
          emptyActionLabel: 'Aggiungi staff',
          onEmptyAction: r,
          children:
            s.length > 0 &&
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'mb-4 grid grid-cols-4 gap-4',
                  children: [
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className: 'text-2xl font-bold text-gray-900',
                          children: o.total,
                        }),
                        e.jsx('div', {
                          className: 'text-sm text-gray-500',
                          children: 'Totale',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className: 'text-2xl font-bold text-green-600',
                          children: o.active,
                        }),
                        e.jsx('div', {
                          className: 'text-sm text-gray-500',
                          children: 'Attivi',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className: 'text-2xl font-bold text-gray-400',
                          children: o.inactive,
                        }),
                        e.jsx('div', {
                          className: 'text-sm text-gray-500',
                          children: 'Inattivi',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className: 'text-2xl font-bold text-yellow-600',
                          children: o.suspended || 0,
                        }),
                        e.jsx('div', {
                          className: 'text-sm text-gray-500',
                          children: 'Sospesi',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'mb-4 p-3 bg-gray-50 rounded-lg',
                  children: [
                    e.jsx('h4', {
                      className: 'text-sm font-medium text-gray-700 mb-2',
                      children: 'Distribuzione Ruoli',
                    }),
                    e.jsxs('div', {
                      className:
                        'grid grid-cols-2 md:grid-cols-4 gap-2 text-xs',
                      children: [
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', {
                              className: 'text-gray-600',
                              children: 'Admin:',
                            }),
                            e.jsx('span', {
                              className: 'font-medium',
                              children: s.filter(t => t.role === 'admin')
                                .length,
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', {
                              className: 'text-gray-600',
                              children: 'Responsabili:',
                            }),
                            e.jsx('span', {
                              className: 'font-medium',
                              children: s.filter(t => t.role === 'responsabile')
                                .length,
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', {
                              className: 'text-gray-600',
                              children: 'Dipendenti:',
                            }),
                            e.jsx('span', {
                              className: 'font-medium',
                              children: s.filter(t => t.role === 'dipendente')
                                .length,
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between',
                          children: [
                            e.jsx('span', {
                              className: 'text-gray-600',
                              children: 'Collaboratori:',
                            }),
                            e.jsx('span', {
                              className: 'font-medium',
                              children: s.filter(
                                t => t.role === 'collaboratore'
                              ).length,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'space-y-3',
                  children: s.map(t =>
                    e.jsx(
                      te,
                      {
                        staffMember: t,
                        onEdit: p,
                        onDelete: l,
                        onToggleStatus: C,
                        isToggling: a,
                        isDeleting: c,
                        departments: x,
                      },
                      t.id
                    )
                  ),
                }),
                e.jsxs('div', {
                  className: 'mt-4 pt-4 border-t border-gray-200',
                  children: [
                    e.jsx('p', {
                      className: 'text-xs text-gray-500 mb-2',
                      children: 'Azioni rapide:',
                    }),
                    e.jsx('div', {
                      className: 'flex space-x-2',
                      children: e.jsxs('button', {
                        type: 'button',
                        onClick: r,
                        className:
                          'inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors',
                        children: [
                          e.jsx(z, { className: 'h-3 w-3 mr-1' }),
                          'Aggiungi Dipendente',
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
        }),
        e.jsx(ae, {
          isOpen: b,
          onClose: h,
          onSubmit: m,
          staffMember: g,
          isLoading: n || u,
          departments: x,
        }),
      ],
    })
  },
  ue = () => {
    const { isLoading: s, hasRole: o, displayName: y } = J(),
      { stats: n } = E(),
      { stats: u, staff: c } = T()
    return s
      ? e.jsx('div', {
          className: 'min-h-screen bg-gray-50 flex items-center justify-center',
          children: e.jsxs('div', {
            className: 'text-center',
            children: [
              e.jsx('div', {
                className:
                  'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4',
              }),
              e.jsx('p', {
                className: 'text-gray-600',
                children: 'Caricamento...',
              }),
            ],
          }),
        })
      : o(['admin', 'responsabile'])
        ? e.jsxs('div', {
            className: 'min-h-screen bg-gray-50',
            children: [
              e.jsx('div', {
                className: 'bg-white border-b border-gray-200',
                children: e.jsx('div', {
                  className: 'px-4 py-6',
                  children: e.jsxs('div', {
                    className: 'flex items-center space-x-3',
                    children: [
                      e.jsx('div', {
                        className: 'p-2 bg-blue-100 rounded-lg',
                        children: e.jsx(A, {
                          className: 'h-6 w-6 text-blue-600',
                        }),
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('h1', {
                            className: 'text-2xl font-bold text-gray-900',
                            children: 'Gestione',
                          }),
                          e.jsx('p', {
                            className: 'text-sm text-gray-600',
                            children:
                              'Gestisci staff e reparti della tua attività',
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
              e.jsxs('div', {
                className: 'px-4 py-6 space-y-6',
                children: [
                  e.jsx('div', {
                    className:
                      'bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white',
                    children: e.jsxs('div', {
                      className: 'flex items-center space-x-3',
                      children: [
                        e.jsx('div', {
                          className: 'p-2 bg-white/20 rounded-lg',
                          children: e.jsx(A, {
                            className: 'h-6 w-6 text-white',
                          }),
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsxs('h2', {
                              className: 'text-lg font-semibold',
                              children: ['Benvenuto, ', y],
                            }),
                            e.jsx('p', {
                              className: 'text-blue-100 text-sm',
                              children:
                                'Gestisci la struttura organizzativa della tua attività',
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  e.jsxs('div', {
                    className: 'space-y-6',
                    children: [e.jsx(se, {}), e.jsx(ie, {})],
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-1 md:grid-cols-3 gap-4',
                    children: [
                      e.jsx('div', {
                        className:
                          'bg-white rounded-lg border border-gray-200 p-4',
                        children: e.jsxs('div', {
                          className: 'flex items-center space-x-3',
                          children: [
                            e.jsx('div', {
                              className: 'p-2 bg-blue-100 rounded-lg',
                              children: e.jsx(D, {
                                className: 'h-5 w-5 text-blue-600',
                              }),
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('p', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Reparti Attivi',
                                }),
                                e.jsx('p', {
                                  className:
                                    'text-xl font-semibold text-gray-900',
                                  children: n.active,
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      e.jsx('div', {
                        className:
                          'bg-white rounded-lg border border-gray-200 p-4',
                        children: e.jsxs('div', {
                          className: 'flex items-center space-x-3',
                          children: [
                            e.jsx('div', {
                              className: 'p-2 bg-green-100 rounded-lg',
                              children: e.jsx(A, {
                                className: 'h-5 w-5 text-green-600',
                              }),
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('p', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Staff Attivo',
                                }),
                                e.jsx('p', {
                                  className:
                                    'text-xl font-semibold text-gray-900',
                                  children: u.active,
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      e.jsx('div', {
                        className:
                          'bg-white rounded-lg border border-gray-200 p-4',
                        children: e.jsxs('div', {
                          className: 'flex items-center space-x-3',
                          children: [
                            e.jsx('div', {
                              className: 'p-2 bg-purple-100 rounded-lg',
                              children: e.jsx(F, {
                                className: 'h-5 w-5 text-purple-600',
                              }),
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('p', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Certificazioni HACCP',
                                }),
                                e.jsx('p', {
                                  className:
                                    'text-xl font-semibold text-gray-900',
                                  children: c.filter(a => a.haccp_certification)
                                    .length,
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className:
                      'bg-gray-50 rounded-lg p-6 border border-gray-200',
                    children: [
                      e.jsx('h3', {
                        className: 'text-lg font-semibold text-gray-900 mb-3',
                        children: 'Guida alla Gestione',
                      }),
                      e.jsxs('div', {
                        className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('h4', {
                                className: 'font-medium text-gray-900 mb-2',
                                children: 'Reparti',
                              }),
                              e.jsxs('ul', {
                                className: 'text-sm text-gray-600 space-y-1',
                                children: [
                                  e.jsx('li', {
                                    children:
                                      '• Organizza la tua attività in aree funzionali',
                                  }),
                                  e.jsx('li', {
                                    children:
                                      '• Usa i reparti predefiniti per iniziare velocemente',
                                  }),
                                  e.jsx('li', {
                                    children:
                                      '• Attiva/disattiva reparti secondo necessità',
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('h4', {
                                className: 'font-medium text-gray-900 mb-2',
                                children: 'Staff',
                              }),
                              e.jsxs('ul', {
                                className: 'text-sm text-gray-600 space-y-1',
                                children: [
                                  e.jsx('li', {
                                    children:
                                      '• Aggiungi dipendenti e collaboratori',
                                  }),
                                  e.jsx('li', {
                                    children:
                                      '• Assegna ruoli (admin, responsabile, dipendente)',
                                  }),
                                  e.jsx('li', {
                                    children:
                                      '• Gestisci certificazioni HACCP con scadenze',
                                  }),
                                  e.jsx('li', {
                                    children:
                                      "• Collega staff all'autenticazione tramite email",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        : e.jsx('div', {
            className:
              'min-h-screen bg-gray-50 flex items-center justify-center p-4',
            children: e.jsxs('div', {
              className: 'max-w-md text-center',
              children: [
                e.jsx('div', {
                  className: 'mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit',
                  children: e.jsx(F, { className: 'h-8 w-8 text-red-600' }),
                }),
                e.jsx('h2', {
                  className: 'text-xl font-semibold text-gray-900 mb-2',
                  children: 'Accesso Non Autorizzato',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 mb-4',
                  children:
                    'Solo gli amministratori e i responsabili possono accedere alla gestione.',
                }),
                e.jsx('div', {
                  className: 'bg-gray-100 rounded-lg p-3',
                  children: e.jsx('p', {
                    className: 'text-sm text-gray-500',
                    children:
                      'Se pensi che questo sia un errore, contatta il tuo amministratore.',
                  }),
                }),
              ],
            }),
          })
  }
export { ue as ManagementPage, ue as default }
