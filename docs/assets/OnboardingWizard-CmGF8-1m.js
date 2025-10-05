import { j as s } from './query-vendor-BsnDS19Y.js'
import {
  r as f,
  a as xe,
  b as hn,
  R as ys,
  d as ai,
} from './react-vendor-Cttizgra.js'
import {
  u as zt,
  r as An,
  f as ws,
  M as ii,
  z as oi,
  y as li,
  x as it,
  g as ot,
  T as Xe,
  a as js,
  C as ci,
  L as di,
  a6 as Bn,
  a7 as Cs,
  o as Fn,
  a8 as ui,
  m as Pt,
  l as _r,
  e as fi,
  H as Ns,
  G as mi,
  a1 as pi,
  d as hi,
  p as gi,
  B as Rt,
} from './ui-vendor-BFMCvSnM.js'
import {
  p as _e,
  t as xi,
  q as vi,
  M as bi,
  u as yi,
  s as qe,
} from './calendar-features-DOX2NwpL.js'
import { A as ue } from './inventory-features-tEOlqD7s.js'
import { g as wi, c as ji, r as Ci } from './index-OccD0Bg4.js'
import { a as Ni } from './router-vendor-kmGKi7vG.js'
import './calendar-vendor-CzJ7rMdU.js'
import './auth-vendor-CMFeYHy6.js'
import './conservation-features-D5ZiW3Ii.js'
const _i = [
    'ristorante',
    'bar',
    'pizzeria',
    'trattoria',
    'osteria',
    'enoteca',
    'birreria',
    'altro',
  ],
  Si = ({ data: e, onUpdate: t, onValidChange: n }) => {
    const [r, a] = f.useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        vat_number: '',
        business_type: '',
        established_date: '',
        license_number: '',
        ...e,
      }),
      [i, o] = f.useState({})
    f.useEffect(() => {
      a(u => ({ ...u, ...e }))
    }, [e])
    const l = (u, x) => {
      const b = { ...r, [u]: x }
      ;(a(b), t(b))
    }
    f.useEffect(() => {
      const u = r,
        x = {}
      ;(u.name.trim()
        ? u.name.trim().length < 2 &&
          (x.name = 'Il nome deve essere di almeno 2 caratteri')
        : (x.name = "Il nome dell'azienda è obbligatorio"),
        u.address.trim() || (x.address = "L'indirizzo è obbligatorio"),
        u.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email) &&
          (x.email = 'Inserisci un indirizzo email valido'),
        u.phone &&
          !/^[+]?[0-9\s\-()]+$/.test(u.phone) &&
          (x.phone = 'Inserisci un numero di telefono valido'),
        u.vat_number &&
          !/^IT[0-9]{11}$/.test(u.vat_number.replace(/\s/g, '')) &&
          (x.vat_number =
            'Inserisci una Partita IVA valida (es: IT12345678901)'),
        o(x),
        n(Object.keys(x).length === 0 && !!u.name.trim() && !!u.address.trim()))
    }, [r, n])
    const d = (u, x) => {
        l(u, x)
      },
      c = () => {
        const u = {
          name: 'Al Ritrovo SRL',
          address: 'Via Roma 123, 40121 Bologna BO',
          phone: '+39 051 1234567',
          email: 'info@alritrovo.it',
          vat_number: 'IT01234567890',
          business_type: 'ristorante',
          established_date: '2020-01-15',
          license_number: 'RIS-2020-001',
        }
        ;(a(u), t(u))
      }
    return s.jsxs('div', {
      className: 'space-y-6',
      children: [
        s.jsxs('div', {
          className: 'text-center',
          children: [
            s.jsx('div', {
              className:
                'w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4',
              children: s.jsx(zt, { className: 'w-8 h-8 text-blue-600' }),
            }),
            s.jsx('h2', {
              className: 'text-2xl font-bold text-gray-900 mb-2',
              children: 'Informazioni Aziendali',
            }),
            s.jsx('p', {
              className: 'text-gray-600',
              children:
                'Inserisci i dati principali della tua azienda per configurare il sistema HACCP',
            }),
          ],
        }),
        s.jsx('div', {
          className: 'flex justify-center',
          children: s.jsx('button', {
            type: 'button',
            onClick: c,
            className:
              'px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors',
            children: '🚀 Compila con dati di esempio',
          }),
        }),
        s.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
          children: [
            s.jsxs('div', {
              className: 'md:col-span-2',
              children: [
                s.jsxs('label', {
                  className:
                    'flex items-center text-sm font-medium text-gray-700 mb-2',
                  children: [
                    s.jsx(zt, { className: 'w-4 h-4 mr-2' }),
                    'Nome Azienda *',
                  ],
                }),
                s.jsx('input', {
                  type: 'text',
                  value: r.name,
                  onChange: u => d('name', u.target.value),
                  className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${i.name ? 'border-red-300' : 'border-gray-300'}`,
                  placeholder: 'Inserisci il nome della tua azienda',
                }),
                i.name &&
                  s.jsx('p', {
                    className: 'mt-1 text-sm text-red-600',
                    children: i.name,
                  }),
              ],
            }),
            s.jsxs('div', {
              children: [
                s.jsxs('label', {
                  className:
                    'flex items-center text-sm font-medium text-gray-700 mb-2',
                  children: [
                    s.jsx(An, { className: 'w-4 h-4 mr-2' }),
                    'Tipo di Attività',
                  ],
                }),
                s.jsxs('select', {
                  value: r.business_type,
                  onChange: u => d('business_type', u.target.value),
                  className:
                    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                  children: [
                    s.jsx('option', {
                      value: '',
                      children: 'Seleziona tipo di attività',
                    }),
                    _i.map(u =>
                      s.jsx(
                        'option',
                        {
                          value: u,
                          children: u.charAt(0).toUpperCase() + u.slice(1),
                        },
                        u
                      )
                    ),
                  ],
                }),
              ],
            }),
            s.jsxs('div', {
              children: [
                s.jsxs('label', {
                  className:
                    'flex items-center text-sm font-medium text-gray-700 mb-2',
                  children: [
                    s.jsx(ws, { className: 'w-4 h-4 mr-2' }),
                    'Data di Apertura',
                  ],
                }),
                s.jsx('input', {
                  type: 'date',
                  value: r.established_date,
                  onChange: u => d('established_date', u.target.value),
                  className:
                    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                }),
              ],
            }),
            s.jsxs('div', {
              className: 'md:col-span-2',
              children: [
                s.jsxs('label', {
                  className:
                    'flex items-center text-sm font-medium text-gray-700 mb-2',
                  children: [
                    s.jsx(ii, { className: 'w-4 h-4 mr-2' }),
                    'Indirizzo *',
                  ],
                }),
                s.jsx('textarea', {
                  value: r.address,
                  onChange: u => d('address', u.target.value),
                  rows: 3,
                  className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${i.address ? 'border-red-300' : 'border-gray-300'}`,
                  placeholder: "Inserisci l'indirizzo completo dell'azienda",
                }),
                i.address &&
                  s.jsx('p', {
                    className: 'mt-1 text-sm text-red-600',
                    children: i.address,
                  }),
              ],
            }),
            s.jsxs('div', {
              children: [
                s.jsxs('label', {
                  className:
                    'flex items-center text-sm font-medium text-gray-700 mb-2',
                  children: [
                    s.jsx(oi, { className: 'w-4 h-4 mr-2' }),
                    'Telefono',
                  ],
                }),
                s.jsx('input', {
                  type: 'tel',
                  value: r.phone,
                  onChange: u => d('phone', u.target.value),
                  className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${i.phone ? 'border-red-300' : 'border-gray-300'}`,
                  placeholder: '+39 051 1234567',
                }),
                i.phone &&
                  s.jsx('p', {
                    className: 'mt-1 text-sm text-red-600',
                    children: i.phone,
                  }),
              ],
            }),
            s.jsxs('div', {
              children: [
                s.jsxs('label', {
                  className:
                    'flex items-center text-sm font-medium text-gray-700 mb-2',
                  children: [s.jsx(li, { className: 'w-4 h-4 mr-2' }), 'Email'],
                }),
                s.jsx('input', {
                  type: 'email',
                  value: r.email,
                  onChange: u => d('email', u.target.value),
                  className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${i.email ? 'border-red-300' : 'border-gray-300'}`,
                  placeholder: 'info@azienda.it',
                }),
                i.email &&
                  s.jsx('p', {
                    className: 'mt-1 text-sm text-red-600',
                    children: i.email,
                  }),
              ],
            }),
            s.jsxs('div', {
              children: [
                s.jsxs('label', {
                  className:
                    'flex items-center text-sm font-medium text-gray-700 mb-2',
                  children: [
                    s.jsx(An, { className: 'w-4 h-4 mr-2' }),
                    'Partita IVA',
                  ],
                }),
                s.jsx('input', {
                  type: 'text',
                  value: r.vat_number,
                  onChange: u => d('vat_number', u.target.value),
                  className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${i.vat_number ? 'border-red-300' : 'border-gray-300'}`,
                  placeholder: 'IT12345678901',
                }),
                i.vat_number &&
                  s.jsx('p', {
                    className: 'mt-1 text-sm text-red-600',
                    children: i.vat_number,
                  }),
              ],
            }),
            s.jsxs('div', {
              children: [
                s.jsxs('label', {
                  className:
                    'flex items-center text-sm font-medium text-gray-700 mb-2',
                  children: [
                    s.jsx(An, { className: 'w-4 h-4 mr-2' }),
                    'Numero Licenza',
                  ],
                }),
                s.jsx('input', {
                  type: 'text',
                  value: r.license_number,
                  onChange: u => d('license_number', u.target.value),
                  className:
                    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                  placeholder: 'RIS-2024-001',
                }),
              ],
            }),
          ],
        }),
        s.jsxs('div', {
          className: 'bg-blue-50 border border-blue-200 rounded-lg p-4',
          children: [
            s.jsx('h3', {
              className: 'font-medium text-blue-900 mb-2',
              children: 'ℹ️ Conformità HACCP',
            }),
            s.jsx('p', {
              className: 'text-sm text-blue-700',
              children:
                'Le informazioni inserite verranno utilizzate per configurare il sistema HACCP in conformità alle normative vigenti. I campi obbligatori sono necessari per garantire la tracciabilità e la compliance.',
            }),
          ],
        }),
      ],
    })
  },
  Ai = ({ data: e, onUpdate: t, onValidChange: n }) => {
    const r = e || [],
      [a, i] = f.useState(null),
      [o, l] = f.useState({ name: '', description: '', is_active: !0 }),
      [d, c] = f.useState({})
    f.useEffect(() => {
      const h =
        r.length > 0 &&
        r.every(
          C =>
            C.name.trim().length >= 2 &&
            !r.find(
              A =>
                A.id !== C.id && A.name.toLowerCase() === C.name.toLowerCase()
            )
        )
      n(h)
    }, [r, n])
    const u = () =>
        `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x = () => {
        const h = {}
        if (
          (o.name.trim()
            ? o.name.trim().length < 2
              ? (h.name = 'Il nome deve essere di almeno 2 caratteri')
              : r.find(C => C.name.toLowerCase() === o.name.toLowerCase()) &&
                (h.name = 'Un reparto con questo nome esiste già')
            : (h.name = 'Il nome del reparto è obbligatorio'),
          c(h),
          Object.keys(h).length === 0)
        ) {
          const C = {
            id: u(),
            name: o.name.trim(),
            description: o.description.trim(),
            is_active: o.is_active,
          }
          ;(t([...r, C]), l({ name: '', description: '', is_active: !0 }))
        }
      },
      b = () => {
        const h = {}
        ;(o.name.trim()
          ? o.name.trim().length < 2
            ? (h.name = 'Il nome deve essere di almeno 2 caratteri')
            : r.find(
                C => C.id !== a && C.name.toLowerCase() === o.name.toLowerCase()
              ) && (h.name = 'Un reparto con questo nome esiste già')
          : (h.name = 'Il nome del reparto è obbligatorio'),
          c(h),
          Object.keys(h).length === 0 &&
            (t(
              r.map(C =>
                C.id === a
                  ? {
                      ...C,
                      name: o.name.trim(),
                      description: o.description.trim(),
                      is_active: o.is_active,
                    }
                  : C
              )
            ),
            i(null),
            l({ name: '', description: '', is_active: !0 })))
      },
      j = h => {
        t(r.filter(C => C.id !== h))
      },
      w = h => {
        ;(i(h.id),
          l({
            name: h.name,
            description: h.description ?? '',
            is_active: h.is_active ?? !0,
          }),
          c({}))
      },
      m = () => {
        ;(i(null), l({ name: '', description: '', is_active: !0 }), c({}))
      },
      v = () => {
        const h = [
          {
            id: u(),
            name: 'Cucina',
            description: 'Area di preparazione dei cibi',
            is_active: !0,
          },
          {
            id: u(),
            name: 'Bancone',
            description: 'Area servizio al bancone',
            is_active: !0,
          },
          {
            id: u(),
            name: 'Sala',
            description: 'Area servizio ai tavoli',
            is_active: !0,
          },
          {
            id: u(),
            name: 'Magazzino',
            description: 'Deposito merci e prodotti',
            is_active: !0,
          },
          {
            id: u(),
            name: 'Lavaggio',
            description: 'Area lavaggio stoviglie',
            is_active: !0,
          },
          {
            id: u(),
            name: 'Deoor / Esterno',
            description: 'Area deoor e servizi esterni',
            is_active: !0,
          },
          {
            id: u(),
            name: 'Plonge / Lavaggio Piatti',
            description: 'Area lavaggio stoviglie e piatti',
            is_active: !0,
          },
        ]
        t(h)
      }
    return s.jsxs('div', {
      className: 'space-y-6',
      children: [
        s.jsxs('div', {
          className: 'text-center',
          children: [
            s.jsx('div', {
              className:
                'w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4',
              children: s.jsx(zt, { className: 'w-8 h-8 text-blue-600' }),
            }),
            s.jsx('h2', {
              className: 'text-2xl font-bold text-gray-900 mb-2',
              children: 'Configurazione Reparti',
            }),
            s.jsx('p', {
              className: 'text-gray-600',
              children:
                'Definisci i reparti della tua azienda per organizzare staff, attrezzature e controlli',
            }),
          ],
        }),
        s.jsx('div', {
          className: 'flex justify-center',
          children: s.jsx('button', {
            type: 'button',
            onClick: v,
            className:
              'px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors',
            children: '🚀 Carica reparti predefiniti',
          }),
        }),
        s.jsxs('div', {
          className: 'bg-gray-50 border border-gray-200 rounded-lg p-4',
          children: [
            s.jsx('h3', {
              className: 'font-medium text-gray-900 mb-3',
              children: a ? 'Modifica Reparto' : 'Aggiungi Nuovo Reparto',
            }),
            s.jsxs('div', {
              className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
              children: [
                s.jsxs('div', {
                  children: [
                    s.jsx('label', {
                      className: 'block text-sm font-medium text-gray-700 mb-1',
                      children: 'Nome Reparto *',
                    }),
                    s.jsx('input', {
                      type: 'text',
                      value: o.name,
                      onChange: h => l({ ...o, name: h.target.value }),
                      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${d.name ? 'border-red-300' : 'border-gray-300'}`,
                      placeholder: 'es. Cucina, Sala, Bancone...',
                    }),
                    d.name &&
                      s.jsx('p', {
                        className: 'mt-1 text-sm text-red-600',
                        children: d.name,
                      }),
                  ],
                }),
                s.jsxs('div', {
                  children: [
                    s.jsx('label', {
                      className: 'block text-sm font-medium text-gray-700 mb-1',
                      children: 'Descrizione',
                    }),
                    s.jsx('input', {
                      type: 'text',
                      value: o.description,
                      onChange: h => l({ ...o, description: h.target.value }),
                      className:
                        'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                      placeholder: 'Descrizione del reparto...',
                    }),
                  ],
                }),
              ],
            }),
            s.jsxs('div', {
              className: 'flex items-center justify-between mt-4',
              children: [
                s.jsxs('label', {
                  className: 'flex items-center',
                  children: [
                    s.jsx('input', {
                      type: 'checkbox',
                      checked: o.is_active,
                      onChange: h => l({ ...o, is_active: h.target.checked }),
                      className:
                        'rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                    }),
                    s.jsx('span', {
                      className: 'ml-2 text-sm text-gray-700',
                      children: 'Reparto attivo',
                    }),
                  ],
                }),
                s.jsxs('div', {
                  className: 'flex gap-2',
                  children: [
                    a &&
                      s.jsx('button', {
                        type: 'button',
                        onClick: m,
                        className:
                          'px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50',
                        children: 'Annulla',
                      }),
                    s.jsx('button', {
                      type: 'button',
                      onClick: a ? b : x,
                      className:
                        'px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2',
                      children: a
                        ? s.jsxs(s.Fragment, {
                            children: [
                              s.jsx(it, { className: 'w-4 h-4' }),
                              'Aggiorna',
                            ],
                          })
                        : s.jsxs(s.Fragment, {
                            children: [
                              s.jsx(ot, { className: 'w-4 h-4' }),
                              'Aggiungi',
                            ],
                          }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        s.jsxs('div', {
          children: [
            s.jsxs('h3', {
              className: 'font-medium text-gray-900 mb-3',
              children: ['Reparti Configurati (', r.length, ')'],
            }),
            r.length === 0
              ? s.jsxs('div', {
                  className:
                    'text-center py-8 border-2 border-dashed border-gray-300 rounded-lg',
                  children: [
                    s.jsx(zt, {
                      className: 'w-12 h-12 text-gray-400 mx-auto mb-4',
                    }),
                    s.jsx('p', {
                      className: 'text-gray-500 mb-2',
                      children: 'Nessun reparto configurato',
                    }),
                    s.jsx('p', {
                      className: 'text-sm text-gray-400',
                      children: 'Aggiungi almeno un reparto per continuare',
                    }),
                  ],
                })
              : s.jsx('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: r.map(h =>
                    s.jsx(
                      'div',
                      {
                        className: `border rounded-lg p-4 ${h.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`,
                        children: s.jsxs('div', {
                          className: 'flex items-start justify-between',
                          children: [
                            s.jsxs('div', {
                              className: 'flex-1',
                              children: [
                                s.jsx('h4', {
                                  className: 'font-medium text-gray-900',
                                  children: h.name,
                                }),
                                h.description &&
                                  s.jsx('p', {
                                    className: 'text-sm text-gray-600 mt-1',
                                    children: h.description,
                                  }),
                                s.jsx('div', {
                                  className: 'flex items-center mt-2',
                                  children: s.jsx('span', {
                                    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${h.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`,
                                    children: h.is_active
                                      ? 'Attivo'
                                      : 'Inattivo',
                                  }),
                                }),
                              ],
                            }),
                            s.jsxs('div', {
                              className: 'flex gap-2 ml-4',
                              children: [
                                s.jsx('button', {
                                  onClick: () => w(h),
                                  className:
                                    'p-1 text-blue-600 hover:text-blue-800',
                                  title: 'Modifica reparto',
                                  children: s.jsx(it, { className: 'w-4 h-4' }),
                                }),
                                s.jsx('button', {
                                  onClick: () => j(h.id),
                                  className:
                                    'p-1 text-red-600 hover:text-red-800',
                                  title: 'Elimina reparto',
                                  children: s.jsx(Xe, { className: 'w-4 h-4' }),
                                }),
                              ],
                            }),
                          ],
                        }),
                      },
                      h.id
                    )
                  ),
                }),
          ],
        }),
        s.jsxs('div', {
          className: 'bg-blue-50 border border-blue-200 rounded-lg p-4',
          children: [
            s.jsx('h3', {
              className: 'font-medium text-blue-900 mb-2',
              children: 'ℹ️ Organizzazione HACCP',
            }),
            s.jsx('p', {
              className: 'text-sm text-blue-700',
              children:
                'I reparti sono utilizzati per organizzare il personale, assegnare responsabilità e configurare punti di controllo specifici. Ogni reparto può avere le proprie procedure HACCP e controlli di temperatura.',
            }),
          ],
        }),
      ],
    })
  },
  Ti = (e, t = 'onboarding-form') => {
    const n = f.useRef(null),
      r = f.useRef(!1),
      a = f.useCallback(() => {
        e &&
          n.current &&
          window.requestAnimationFrame(() => {
            n.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          })
      }, [e])
    return (
      f.useEffect(() => {
        e && !r.current ? ((r.current = !0), a()) : e || (r.current = !1)
      }, [e, a]),
      f.useEffect(() => {
        if (!t) return
        const i = document.getElementById(t)
        return (
          i && (n.current = i),
          () => {
            n.current && n.current.id === t && (n.current = null)
          }
        )
      }, [t]),
      { formRef: n, scrollToForm: a }
    )
  },
  Sr = {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline:
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    },
  },
  re = xe.forwardRef(
    ({ className: e, variant: t = 'default', size: n = 'default', ...r }, a) =>
      s.jsx('button', {
        className: _e(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          Sr.variant[t],
          Sr.size[n],
          e
        ),
        ref: a,
        ...r,
      })
  )
re.displayName = 'Button'
const Fe = xe.forwardRef(({ className: e, type: t, ...n }, r) =>
  s.jsx('input', {
    type: t,
    className: _e(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      e
    ),
    ref: r,
    ...n,
  })
)
Fe.displayName = 'Input'
const K = xe.forwardRef(({ className: e, ...t }, n) =>
  s.jsx('label', {
    ref: n,
    className: _e(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      e
    ),
    ...t,
  })
)
K.displayName = 'Label'
function Ar(e, [t, n]) {
  return Math.min(n, Math.max(t, e))
}
function ce(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function (a) {
    if ((e?.(a), n === !1 || !a.defaultPrevented)) return t?.(a)
  }
}
function fr(e, t = []) {
  let n = []
  function r(i, o) {
    const l = f.createContext(o),
      d = n.length
    n = [...n, o]
    const c = x => {
      const { scope: b, children: j, ...w } = x,
        m = b?.[e]?.[d] || l,
        v = f.useMemo(() => w, Object.values(w))
      return s.jsx(m.Provider, { value: v, children: j })
    }
    c.displayName = i + 'Provider'
    function u(x, b) {
      const j = b?.[e]?.[d] || l,
        w = f.useContext(j)
      if (w) return w
      if (o !== void 0) return o
      throw new Error(`\`${x}\` must be used within \`${i}\``)
    }
    return [c, u]
  }
  const a = () => {
    const i = n.map(o => f.createContext(o))
    return function (l) {
      const d = l?.[e] || i
      return f.useMemo(() => ({ [`__scope${e}`]: { ...l, [e]: d } }), [l, d])
    }
  }
  return ((a.scopeName = e), [r, Ei(a, ...t)])
}
function Ei(...e) {
  const t = e[0]
  if (e.length === 1) return t
  const n = () => {
    const r = e.map(a => ({ useScope: a(), scopeName: a.scopeName }))
    return function (i) {
      const o = r.reduce((l, { useScope: d, scopeName: c }) => {
        const x = d(i)[`__scope${c}`]
        return { ...l, ...x }
      }, {})
      return f.useMemo(() => ({ [`__scope${t.scopeName}`]: o }), [o])
    }
  }
  return ((n.scopeName = t.scopeName), n)
}
function Tr(e, t) {
  if (typeof e == 'function') return e(t)
  e != null && (e.current = t)
}
function _s(...e) {
  return t => {
    let n = !1
    const r = e.map(a => {
      const i = Tr(a, t)
      return (!n && typeof i == 'function' && (n = !0), i)
    })
    if (n)
      return () => {
        for (let a = 0; a < r.length; a++) {
          const i = r[a]
          typeof i == 'function' ? i() : Tr(e[a], null)
        }
      }
  }
}
function fe(...e) {
  return f.useCallback(_s(...e), e)
}
function tn(e) {
  const t = ki(e),
    n = f.forwardRef((r, a) => {
      const { children: i, ...o } = r,
        l = f.Children.toArray(i),
        d = l.find(Ii)
      if (d) {
        const c = d.props.children,
          u = l.map(x =>
            x === d
              ? f.Children.count(c) > 1
                ? f.Children.only(null)
                : f.isValidElement(c)
                  ? c.props.children
                  : null
              : x
          )
        return s.jsx(t, {
          ...o,
          ref: a,
          children: f.isValidElement(c) ? f.cloneElement(c, void 0, u) : null,
        })
      }
      return s.jsx(t, { ...o, ref: a, children: i })
    })
  return ((n.displayName = `${e}.Slot`), n)
}
function ki(e) {
  const t = f.forwardRef((n, r) => {
    const { children: a, ...i } = n
    if (f.isValidElement(a)) {
      const o = Oi(a),
        l = Pi(i, a.props)
      return (
        a.type !== f.Fragment && (l.ref = r ? _s(r, o) : o),
        f.cloneElement(a, l)
      )
    }
    return f.Children.count(a) > 1 ? f.Children.only(null) : null
  })
  return ((t.displayName = `${e}.SlotClone`), t)
}
var Ri = Symbol('radix.slottable')
function Ii(e) {
  return (
    f.isValidElement(e) &&
    typeof e.type == 'function' &&
    '__radixId' in e.type &&
    e.type.__radixId === Ri
  )
}
function Pi(e, t) {
  const n = { ...t }
  for (const r in t) {
    const a = e[r],
      i = t[r]
    ;/^on[A-Z]/.test(r)
      ? a && i
        ? (n[r] = (...l) => {
            const d = i(...l)
            return (a(...l), d)
          })
        : a && (n[r] = a)
      : r === 'style'
        ? (n[r] = { ...a, ...i })
        : r === 'className' && (n[r] = [a, i].filter(Boolean).join(' '))
  }
  return { ...e, ...n }
}
function Oi(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, 'ref')?.get,
    n = t && 'isReactWarning' in t && t.isReactWarning
  return n
    ? e.ref
    : ((t = Object.getOwnPropertyDescriptor(e, 'ref')?.get),
      (n = t && 'isReactWarning' in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref)
}
function Di(e) {
  const t = e + 'CollectionProvider',
    [n, r] = fr(t),
    [a, i] = n(t, { collectionRef: { current: null }, itemMap: new Map() }),
    o = m => {
      const { scope: v, children: h } = m,
        C = xe.useRef(null),
        A = xe.useRef(new Map()).current
      return s.jsx(a, { scope: v, itemMap: A, collectionRef: C, children: h })
    }
  o.displayName = t
  const l = e + 'CollectionSlot',
    d = tn(l),
    c = xe.forwardRef((m, v) => {
      const { scope: h, children: C } = m,
        A = i(l, h),
        y = fe(v, A.collectionRef)
      return s.jsx(d, { ref: y, children: C })
    })
  c.displayName = l
  const u = e + 'CollectionItemSlot',
    x = 'data-radix-collection-item',
    b = tn(u),
    j = xe.forwardRef((m, v) => {
      const { scope: h, children: C, ...A } = m,
        y = xe.useRef(null),
        T = fe(v, y),
        _ = i(u, h)
      return (
        xe.useEffect(
          () => (
            _.itemMap.set(y, { ref: y, ...A }),
            () => void _.itemMap.delete(y)
          )
        ),
        s.jsx(b, { [x]: '', ref: T, children: C })
      )
    })
  j.displayName = u
  function w(m) {
    const v = i(e + 'CollectionConsumer', m)
    return xe.useCallback(() => {
      const C = v.collectionRef.current
      if (!C) return []
      const A = Array.from(C.querySelectorAll(`[${x}]`))
      return Array.from(v.itemMap.values()).sort(
        (_, S) => A.indexOf(_.ref.current) - A.indexOf(S.ref.current)
      )
    }, [v.collectionRef, v.itemMap])
  }
  return [{ Provider: o, Slot: c, ItemSlot: j }, w, r]
}
var Mi = f.createContext(void 0)
function zi(e) {
  const t = f.useContext(Mi)
  return e || t || 'ltr'
}
var Li = [
    'a',
    'button',
    'div',
    'form',
    'h2',
    'h3',
    'img',
    'input',
    'label',
    'li',
    'nav',
    'ol',
    'p',
    'select',
    'span',
    'svg',
    'ul',
  ],
  ae = Li.reduce((e, t) => {
    const n = tn(`Primitive.${t}`),
      r = f.forwardRef((a, i) => {
        const { asChild: o, ...l } = a,
          d = o ? n : t
        return (
          typeof window < 'u' && (window[Symbol.for('radix-ui')] = !0),
          s.jsx(d, { ...l, ref: i })
        )
      })
    return ((r.displayName = `Primitive.${t}`), { ...e, [t]: r })
  }, {})
function $i(e, t) {
  e && hn.flushSync(() => e.dispatchEvent(t))
}
function lt(e) {
  const t = f.useRef(e)
  return (
    f.useEffect(() => {
      t.current = e
    }),
    f.useMemo(
      () =>
        (...n) =>
          t.current?.(...n),
      []
    )
  )
}
function Bi(e, t = globalThis?.document) {
  const n = lt(e)
  f.useEffect(() => {
    const r = a => {
      a.key === 'Escape' && n(a)
    }
    return (
      t.addEventListener('keydown', r, { capture: !0 }),
      () => t.removeEventListener('keydown', r, { capture: !0 })
    )
  }, [n, t])
}
var Fi = 'DismissableLayer',
  Vn = 'dismissableLayer.update',
  Vi = 'dismissableLayer.pointerDownOutside',
  Hi = 'dismissableLayer.focusOutside',
  Er,
  Ss = f.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
  }),
  As = f.forwardRef((e, t) => {
    const {
        disableOutsidePointerEvents: n = !1,
        onEscapeKeyDown: r,
        onPointerDownOutside: a,
        onFocusOutside: i,
        onInteractOutside: o,
        onDismiss: l,
        ...d
      } = e,
      c = f.useContext(Ss),
      [u, x] = f.useState(null),
      b = u?.ownerDocument ?? globalThis?.document,
      [, j] = f.useState({}),
      w = fe(t, S => x(S)),
      m = Array.from(c.layers),
      [v] = [...c.layersWithOutsidePointerEventsDisabled].slice(-1),
      h = m.indexOf(v),
      C = u ? m.indexOf(u) : -1,
      A = c.layersWithOutsidePointerEventsDisabled.size > 0,
      y = C >= h,
      T = Ui(S => {
        const N = S.target,
          P = [...c.branches].some(L => L.contains(N))
        !y || P || (a?.(S), o?.(S), S.defaultPrevented || l?.())
      }, b),
      _ = Wi(S => {
        const N = S.target
        ;[...c.branches].some(L => L.contains(N)) ||
          (i?.(S), o?.(S), S.defaultPrevented || l?.())
      }, b)
    return (
      Bi(S => {
        C === c.layers.size - 1 &&
          (r?.(S), !S.defaultPrevented && l && (S.preventDefault(), l()))
      }, b),
      f.useEffect(() => {
        if (u)
          return (
            n &&
              (c.layersWithOutsidePointerEventsDisabled.size === 0 &&
                ((Er = b.body.style.pointerEvents),
                (b.body.style.pointerEvents = 'none')),
              c.layersWithOutsidePointerEventsDisabled.add(u)),
            c.layers.add(u),
            kr(),
            () => {
              n &&
                c.layersWithOutsidePointerEventsDisabled.size === 1 &&
                (b.body.style.pointerEvents = Er)
            }
          )
      }, [u, b, n, c]),
      f.useEffect(
        () => () => {
          u &&
            (c.layers.delete(u),
            c.layersWithOutsidePointerEventsDisabled.delete(u),
            kr())
        },
        [u, c]
      ),
      f.useEffect(() => {
        const S = () => j({})
        return (
          document.addEventListener(Vn, S),
          () => document.removeEventListener(Vn, S)
        )
      }, []),
      s.jsx(ae.div, {
        ...d,
        ref: w,
        style: {
          pointerEvents: A ? (y ? 'auto' : 'none') : void 0,
          ...e.style,
        },
        onFocusCapture: ce(e.onFocusCapture, _.onFocusCapture),
        onBlurCapture: ce(e.onBlurCapture, _.onBlurCapture),
        onPointerDownCapture: ce(
          e.onPointerDownCapture,
          T.onPointerDownCapture
        ),
      })
    )
  })
As.displayName = Fi
var Zi = 'DismissableLayerBranch',
  qi = f.forwardRef((e, t) => {
    const n = f.useContext(Ss),
      r = f.useRef(null),
      a = fe(t, r)
    return (
      f.useEffect(() => {
        const i = r.current
        if (i)
          return (
            n.branches.add(i),
            () => {
              n.branches.delete(i)
            }
          )
      }, [n.branches]),
      s.jsx(ae.div, { ...e, ref: a })
    )
  })
qi.displayName = Zi
function Ui(e, t = globalThis?.document) {
  const n = lt(e),
    r = f.useRef(!1),
    a = f.useRef(() => {})
  return (
    f.useEffect(() => {
      const i = l => {
          if (l.target && !r.current) {
            let d = function () {
              Ts(Vi, n, c, { discrete: !0 })
            }
            const c = { originalEvent: l }
            l.pointerType === 'touch'
              ? (t.removeEventListener('click', a.current),
                (a.current = d),
                t.addEventListener('click', a.current, { once: !0 }))
              : d()
          } else t.removeEventListener('click', a.current)
          r.current = !1
        },
        o = window.setTimeout(() => {
          t.addEventListener('pointerdown', i)
        }, 0)
      return () => {
        ;(window.clearTimeout(o),
          t.removeEventListener('pointerdown', i),
          t.removeEventListener('click', a.current))
      }
    }, [t, n]),
    { onPointerDownCapture: () => (r.current = !0) }
  )
}
function Wi(e, t = globalThis?.document) {
  const n = lt(e),
    r = f.useRef(!1)
  return (
    f.useEffect(() => {
      const a = i => {
        i.target &&
          !r.current &&
          Ts(Hi, n, { originalEvent: i }, { discrete: !1 })
      }
      return (
        t.addEventListener('focusin', a),
        () => t.removeEventListener('focusin', a)
      )
    }, [t, n]),
    {
      onFocusCapture: () => (r.current = !0),
      onBlurCapture: () => (r.current = !1),
    }
  )
}
function kr() {
  const e = new CustomEvent(Vn)
  document.dispatchEvent(e)
}
function Ts(e, t, n, { discrete: r }) {
  const a = n.originalEvent.target,
    i = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n })
  ;(t && a.addEventListener(e, t, { once: !0 }),
    r ? $i(a, i) : a.dispatchEvent(i))
}
var Tn = 0
function Gi() {
  f.useEffect(() => {
    const e = document.querySelectorAll('[data-radix-focus-guard]')
    return (
      document.body.insertAdjacentElement('afterbegin', e[0] ?? Rr()),
      document.body.insertAdjacentElement('beforeend', e[1] ?? Rr()),
      Tn++,
      () => {
        ;(Tn === 1 &&
          document
            .querySelectorAll('[data-radix-focus-guard]')
            .forEach(t => t.remove()),
          Tn--)
      }
    )
  }, [])
}
function Rr() {
  const e = document.createElement('span')
  return (
    e.setAttribute('data-radix-focus-guard', ''),
    (e.tabIndex = 0),
    (e.style.outline = 'none'),
    (e.style.opacity = '0'),
    (e.style.position = 'fixed'),
    (e.style.pointerEvents = 'none'),
    e
  )
}
var En = 'focusScope.autoFocusOnMount',
  kn = 'focusScope.autoFocusOnUnmount',
  Ir = { bubbles: !1, cancelable: !0 },
  Yi = 'FocusScope',
  Es = f.forwardRef((e, t) => {
    const {
        loop: n = !1,
        trapped: r = !1,
        onMountAutoFocus: a,
        onUnmountAutoFocus: i,
        ...o
      } = e,
      [l, d] = f.useState(null),
      c = lt(a),
      u = lt(i),
      x = f.useRef(null),
      b = fe(t, m => d(m)),
      j = f.useRef({
        paused: !1,
        pause() {
          this.paused = !0
        },
        resume() {
          this.paused = !1
        },
      }).current
    ;(f.useEffect(() => {
      if (r) {
        let m = function (A) {
            if (j.paused || !l) return
            const y = A.target
            l.contains(y) ? (x.current = y) : Ue(x.current, { select: !0 })
          },
          v = function (A) {
            if (j.paused || !l) return
            const y = A.relatedTarget
            y !== null && (l.contains(y) || Ue(x.current, { select: !0 }))
          },
          h = function (A) {
            if (document.activeElement === document.body)
              for (const T of A) T.removedNodes.length > 0 && Ue(l)
          }
        ;(document.addEventListener('focusin', m),
          document.addEventListener('focusout', v))
        const C = new MutationObserver(h)
        return (
          l && C.observe(l, { childList: !0, subtree: !0 }),
          () => {
            ;(document.removeEventListener('focusin', m),
              document.removeEventListener('focusout', v),
              C.disconnect())
          }
        )
      }
    }, [r, l, j.paused]),
      f.useEffect(() => {
        if (l) {
          Or.add(j)
          const m = document.activeElement
          if (!l.contains(m)) {
            const h = new CustomEvent(En, Ir)
            ;(l.addEventListener(En, c),
              l.dispatchEvent(h),
              h.defaultPrevented ||
                (Ki(to(ks(l)), { select: !0 }),
                document.activeElement === m && Ue(l)))
          }
          return () => {
            ;(l.removeEventListener(En, c),
              setTimeout(() => {
                const h = new CustomEvent(kn, Ir)
                ;(l.addEventListener(kn, u),
                  l.dispatchEvent(h),
                  h.defaultPrevented || Ue(m ?? document.body, { select: !0 }),
                  l.removeEventListener(kn, u),
                  Or.remove(j))
              }, 0))
          }
        }
      }, [l, c, u, j]))
    const w = f.useCallback(
      m => {
        if ((!n && !r) || j.paused) return
        const v = m.key === 'Tab' && !m.altKey && !m.ctrlKey && !m.metaKey,
          h = document.activeElement
        if (v && h) {
          const C = m.currentTarget,
            [A, y] = Xi(C)
          A && y
            ? !m.shiftKey && h === y
              ? (m.preventDefault(), n && Ue(A, { select: !0 }))
              : m.shiftKey &&
                h === A &&
                (m.preventDefault(), n && Ue(y, { select: !0 }))
            : h === C && m.preventDefault()
        }
      },
      [n, r, j.paused]
    )
    return s.jsx(ae.div, { tabIndex: -1, ...o, ref: b, onKeyDown: w })
  })
Es.displayName = Yi
function Ki(e, { select: t = !1 } = {}) {
  const n = document.activeElement
  for (const r of e)
    if ((Ue(r, { select: t }), document.activeElement !== n)) return
}
function Xi(e) {
  const t = ks(e),
    n = Pr(t, e),
    r = Pr(t.reverse(), e)
  return [n, r]
}
function ks(e) {
  const t = [],
    n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
      acceptNode: r => {
        const a = r.tagName === 'INPUT' && r.type === 'hidden'
        return r.disabled || r.hidden || a
          ? NodeFilter.FILTER_SKIP
          : r.tabIndex >= 0
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP
      },
    })
  for (; n.nextNode(); ) t.push(n.currentNode)
  return t
}
function Pr(e, t) {
  for (const n of e) if (!Qi(n, { upTo: t })) return n
}
function Qi(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === 'hidden') return !0
  for (; e; ) {
    if (t !== void 0 && e === t) return !1
    if (getComputedStyle(e).display === 'none') return !0
    e = e.parentElement
  }
  return !1
}
function Ji(e) {
  return e instanceof HTMLInputElement && 'select' in e
}
function Ue(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement
    ;(e.focus({ preventScroll: !0 }), e !== n && Ji(e) && t && e.select())
  }
}
var Or = eo()
function eo() {
  let e = []
  return {
    add(t) {
      const n = e[0]
      ;(t !== n && n?.pause(), (e = Dr(e, t)), e.unshift(t))
    },
    remove(t) {
      ;((e = Dr(e, t)), e[0]?.resume())
    },
  }
}
function Dr(e, t) {
  const n = [...e],
    r = n.indexOf(t)
  return (r !== -1 && n.splice(r, 1), n)
}
function to(e) {
  return e.filter(t => t.tagName !== 'A')
}
var ge = globalThis?.document ? f.useLayoutEffect : () => {},
  no = ys[' useId '.trim().toString()] || (() => {}),
  ro = 0
function mr(e) {
  const [t, n] = f.useState(no())
  return (
    ge(() => {
      n(r => r ?? String(ro++))
    }, [e]),
    e || (t ? `radix-${t}` : '')
  )
}
const so = ['top', 'right', 'bottom', 'left'],
  Qe = Math.min,
  ve = Math.max,
  nn = Math.round,
  Zt = Math.floor,
  Oe = e => ({ x: e, y: e }),
  ao = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' },
  io = { start: 'end', end: 'start' }
function Hn(e, t, n) {
  return ve(e, Qe(t, n))
}
function Ve(e, t) {
  return typeof e == 'function' ? e(t) : e
}
function He(e) {
  return e.split('-')[0]
}
function Tt(e) {
  return e.split('-')[1]
}
function pr(e) {
  return e === 'x' ? 'y' : 'x'
}
function hr(e) {
  return e === 'y' ? 'height' : 'width'
}
const oo = new Set(['top', 'bottom'])
function Pe(e) {
  return oo.has(He(e)) ? 'y' : 'x'
}
function gr(e) {
  return pr(Pe(e))
}
function lo(e, t, n) {
  n === void 0 && (n = !1)
  const r = Tt(e),
    a = gr(e),
    i = hr(a)
  let o =
    a === 'x'
      ? r === (n ? 'end' : 'start')
        ? 'right'
        : 'left'
      : r === 'start'
        ? 'bottom'
        : 'top'
  return (t.reference[i] > t.floating[i] && (o = rn(o)), [o, rn(o)])
}
function co(e) {
  const t = rn(e)
  return [Zn(e), t, Zn(t)]
}
function Zn(e) {
  return e.replace(/start|end/g, t => io[t])
}
const Mr = ['left', 'right'],
  zr = ['right', 'left'],
  uo = ['top', 'bottom'],
  fo = ['bottom', 'top']
function mo(e, t, n) {
  switch (e) {
    case 'top':
    case 'bottom':
      return n ? (t ? zr : Mr) : t ? Mr : zr
    case 'left':
    case 'right':
      return t ? uo : fo
    default:
      return []
  }
}
function po(e, t, n, r) {
  const a = Tt(e)
  let i = mo(He(e), n === 'start', r)
  return (
    a && ((i = i.map(o => o + '-' + a)), t && (i = i.concat(i.map(Zn)))),
    i
  )
}
function rn(e) {
  return e.replace(/left|right|bottom|top/g, t => ao[t])
}
function ho(e) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...e }
}
function Rs(e) {
  return typeof e != 'number' ? ho(e) : { top: e, right: e, bottom: e, left: e }
}
function sn(e) {
  const { x: t, y: n, width: r, height: a } = e
  return {
    width: r,
    height: a,
    top: n,
    left: t,
    right: t + r,
    bottom: n + a,
    x: t,
    y: n,
  }
}
function Lr(e, t, n) {
  let { reference: r, floating: a } = e
  const i = Pe(t),
    o = gr(t),
    l = hr(o),
    d = He(t),
    c = i === 'y',
    u = r.x + r.width / 2 - a.width / 2,
    x = r.y + r.height / 2 - a.height / 2,
    b = r[l] / 2 - a[l] / 2
  let j
  switch (d) {
    case 'top':
      j = { x: u, y: r.y - a.height }
      break
    case 'bottom':
      j = { x: u, y: r.y + r.height }
      break
    case 'right':
      j = { x: r.x + r.width, y: x }
      break
    case 'left':
      j = { x: r.x - a.width, y: x }
      break
    default:
      j = { x: r.x, y: r.y }
  }
  switch (Tt(t)) {
    case 'start':
      j[o] -= b * (n && c ? -1 : 1)
      break
    case 'end':
      j[o] += b * (n && c ? -1 : 1)
      break
  }
  return j
}
const go = async (e, t, n) => {
  const {
      placement: r = 'bottom',
      strategy: a = 'absolute',
      middleware: i = [],
      platform: o,
    } = n,
    l = i.filter(Boolean),
    d = await (o.isRTL == null ? void 0 : o.isRTL(t))
  let c = await o.getElementRects({ reference: e, floating: t, strategy: a }),
    { x: u, y: x } = Lr(c, r, d),
    b = r,
    j = {},
    w = 0
  for (let m = 0; m < l.length; m++) {
    const { name: v, fn: h } = l[m],
      {
        x: C,
        y: A,
        data: y,
        reset: T,
      } = await h({
        x: u,
        y: x,
        initialPlacement: r,
        placement: b,
        strategy: a,
        middlewareData: j,
        rects: c,
        platform: o,
        elements: { reference: e, floating: t },
      })
    ;((u = C ?? u),
      (x = A ?? x),
      (j = { ...j, [v]: { ...j[v], ...y } }),
      T &&
        w <= 50 &&
        (w++,
        typeof T == 'object' &&
          (T.placement && (b = T.placement),
          T.rects &&
            (c =
              T.rects === !0
                ? await o.getElementRects({
                    reference: e,
                    floating: t,
                    strategy: a,
                  })
                : T.rects),
          ({ x: u, y: x } = Lr(c, b, d))),
        (m = -1)))
  }
  return { x: u, y: x, placement: b, strategy: a, middlewareData: j }
}
async function Lt(e, t) {
  var n
  t === void 0 && (t = {})
  const { x: r, y: a, platform: i, rects: o, elements: l, strategy: d } = e,
    {
      boundary: c = 'clippingAncestors',
      rootBoundary: u = 'viewport',
      elementContext: x = 'floating',
      altBoundary: b = !1,
      padding: j = 0,
    } = Ve(t, e),
    w = Rs(j),
    v = l[b ? (x === 'floating' ? 'reference' : 'floating') : x],
    h = sn(
      await i.getClippingRect({
        element:
          (n = await (i.isElement == null ? void 0 : i.isElement(v))) == null ||
          n
            ? v
            : v.contextElement ||
              (await (i.getDocumentElement == null
                ? void 0
                : i.getDocumentElement(l.floating))),
        boundary: c,
        rootBoundary: u,
        strategy: d,
      })
    ),
    C =
      x === 'floating'
        ? { x: r, y: a, width: o.floating.width, height: o.floating.height }
        : o.reference,
    A = await (i.getOffsetParent == null
      ? void 0
      : i.getOffsetParent(l.floating)),
    y = (await (i.isElement == null ? void 0 : i.isElement(A)))
      ? (await (i.getScale == null ? void 0 : i.getScale(A))) || { x: 1, y: 1 }
      : { x: 1, y: 1 },
    T = sn(
      i.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: l,
            rect: C,
            offsetParent: A,
            strategy: d,
          })
        : C
    )
  return {
    top: (h.top - T.top + w.top) / y.y,
    bottom: (T.bottom - h.bottom + w.bottom) / y.y,
    left: (h.left - T.left + w.left) / y.x,
    right: (T.right - h.right + w.right) / y.x,
  }
}
const xo = e => ({
    name: 'arrow',
    options: e,
    async fn(t) {
      const {
          x: n,
          y: r,
          placement: a,
          rects: i,
          platform: o,
          elements: l,
          middlewareData: d,
        } = t,
        { element: c, padding: u = 0 } = Ve(e, t) || {}
      if (c == null) return {}
      const x = Rs(u),
        b = { x: n, y: r },
        j = gr(a),
        w = hr(j),
        m = await o.getDimensions(c),
        v = j === 'y',
        h = v ? 'top' : 'left',
        C = v ? 'bottom' : 'right',
        A = v ? 'clientHeight' : 'clientWidth',
        y = i.reference[w] + i.reference[j] - b[j] - i.floating[w],
        T = b[j] - i.reference[j],
        _ = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(c))
      let S = _ ? _[A] : 0
      ;(!S || !(await (o.isElement == null ? void 0 : o.isElement(_)))) &&
        (S = l.floating[A] || i.floating[w])
      const N = y / 2 - T / 2,
        P = S / 2 - m[w] / 2 - 1,
        L = Qe(x[h], P),
        B = Qe(x[C], P),
        F = L,
        E = S - m[w] - B,
        p = S / 2 - m[w] / 2 + N,
        g = Hn(F, p, E),
        k =
          !d.arrow &&
          Tt(a) != null &&
          p !== g &&
          i.reference[w] / 2 - (p < F ? L : B) - m[w] / 2 < 0,
        O = k ? (p < F ? p - F : p - E) : 0
      return {
        [j]: b[j] + O,
        data: {
          [j]: g,
          centerOffset: p - g - O,
          ...(k && { alignmentOffset: O }),
        },
        reset: k,
      }
    },
  }),
  vo = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'flip',
        options: e,
        async fn(t) {
          var n, r
          const {
              placement: a,
              middlewareData: i,
              rects: o,
              initialPlacement: l,
              platform: d,
              elements: c,
            } = t,
            {
              mainAxis: u = !0,
              crossAxis: x = !0,
              fallbackPlacements: b,
              fallbackStrategy: j = 'bestFit',
              fallbackAxisSideDirection: w = 'none',
              flipAlignment: m = !0,
              ...v
            } = Ve(e, t)
          if ((n = i.arrow) != null && n.alignmentOffset) return {}
          const h = He(a),
            C = Pe(l),
            A = He(l) === l,
            y = await (d.isRTL == null ? void 0 : d.isRTL(c.floating)),
            T = b || (A || !m ? [rn(l)] : co(l)),
            _ = w !== 'none'
          !b && _ && T.push(...po(l, m, w, y))
          const S = [l, ...T],
            N = await Lt(t, v),
            P = []
          let L = ((r = i.flip) == null ? void 0 : r.overflows) || []
          if ((u && P.push(N[h]), x)) {
            const p = lo(a, o, y)
            P.push(N[p[0]], N[p[1]])
          }
          if (
            ((L = [...L, { placement: a, overflows: P }]),
            !P.every(p => p <= 0))
          ) {
            var B, F
            const p = (((B = i.flip) == null ? void 0 : B.index) || 0) + 1,
              g = S[p]
            if (
              g &&
              (!(x === 'alignment' ? C !== Pe(g) : !1) ||
                L.every(I => (Pe(I.placement) === C ? I.overflows[0] > 0 : !0)))
            )
              return {
                data: { index: p, overflows: L },
                reset: { placement: g },
              }
            let k =
              (F = L.filter(O => O.overflows[0] <= 0).sort(
                (O, I) => O.overflows[1] - I.overflows[1]
              )[0]) == null
                ? void 0
                : F.placement
            if (!k)
              switch (j) {
                case 'bestFit': {
                  var E
                  const O =
                    (E = L.filter(I => {
                      if (_) {
                        const M = Pe(I.placement)
                        return M === C || M === 'y'
                      }
                      return !0
                    })
                      .map(I => [
                        I.placement,
                        I.overflows
                          .filter(M => M > 0)
                          .reduce((M, q) => M + q, 0),
                      ])
                      .sort((I, M) => I[1] - M[1])[0]) == null
                      ? void 0
                      : E[0]
                  O && (k = O)
                  break
                }
                case 'initialPlacement':
                  k = l
                  break
              }
            if (a !== k) return { reset: { placement: k } }
          }
          return {}
        },
      }
    )
  }
function $r(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width,
  }
}
function Br(e) {
  return so.some(t => e[t] >= 0)
}
const bo = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'hide',
        options: e,
        async fn(t) {
          const { rects: n } = t,
            { strategy: r = 'referenceHidden', ...a } = Ve(e, t)
          switch (r) {
            case 'referenceHidden': {
              const i = await Lt(t, { ...a, elementContext: 'reference' }),
                o = $r(i, n.reference)
              return {
                data: { referenceHiddenOffsets: o, referenceHidden: Br(o) },
              }
            }
            case 'escaped': {
              const i = await Lt(t, { ...a, altBoundary: !0 }),
                o = $r(i, n.floating)
              return { data: { escapedOffsets: o, escaped: Br(o) } }
            }
            default:
              return {}
          }
        },
      }
    )
  },
  Is = new Set(['left', 'top'])
async function yo(e, t) {
  const { placement: n, platform: r, elements: a } = e,
    i = await (r.isRTL == null ? void 0 : r.isRTL(a.floating)),
    o = He(n),
    l = Tt(n),
    d = Pe(n) === 'y',
    c = Is.has(o) ? -1 : 1,
    u = i && d ? -1 : 1,
    x = Ve(t, e)
  let {
    mainAxis: b,
    crossAxis: j,
    alignmentAxis: w,
  } = typeof x == 'number'
    ? { mainAxis: x, crossAxis: 0, alignmentAxis: null }
    : {
        mainAxis: x.mainAxis || 0,
        crossAxis: x.crossAxis || 0,
        alignmentAxis: x.alignmentAxis,
      }
  return (
    l && typeof w == 'number' && (j = l === 'end' ? w * -1 : w),
    d ? { x: j * u, y: b * c } : { x: b * c, y: j * u }
  )
}
const wo = function (e) {
    return (
      e === void 0 && (e = 0),
      {
        name: 'offset',
        options: e,
        async fn(t) {
          var n, r
          const { x: a, y: i, placement: o, middlewareData: l } = t,
            d = await yo(t, e)
          return o === ((n = l.offset) == null ? void 0 : n.placement) &&
            (r = l.arrow) != null &&
            r.alignmentOffset
            ? {}
            : { x: a + d.x, y: i + d.y, data: { ...d, placement: o } }
        },
      }
    )
  },
  jo = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'shift',
        options: e,
        async fn(t) {
          const { x: n, y: r, placement: a } = t,
            {
              mainAxis: i = !0,
              crossAxis: o = !1,
              limiter: l = {
                fn: v => {
                  let { x: h, y: C } = v
                  return { x: h, y: C }
                },
              },
              ...d
            } = Ve(e, t),
            c = { x: n, y: r },
            u = await Lt(t, d),
            x = Pe(He(a)),
            b = pr(x)
          let j = c[b],
            w = c[x]
          if (i) {
            const v = b === 'y' ? 'top' : 'left',
              h = b === 'y' ? 'bottom' : 'right',
              C = j + u[v],
              A = j - u[h]
            j = Hn(C, j, A)
          }
          if (o) {
            const v = x === 'y' ? 'top' : 'left',
              h = x === 'y' ? 'bottom' : 'right',
              C = w + u[v],
              A = w - u[h]
            w = Hn(C, w, A)
          }
          const m = l.fn({ ...t, [b]: j, [x]: w })
          return {
            ...m,
            data: { x: m.x - n, y: m.y - r, enabled: { [b]: i, [x]: o } },
          }
        },
      }
    )
  },
  Co = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        options: e,
        fn(t) {
          const { x: n, y: r, placement: a, rects: i, middlewareData: o } = t,
            { offset: l = 0, mainAxis: d = !0, crossAxis: c = !0 } = Ve(e, t),
            u = { x: n, y: r },
            x = Pe(a),
            b = pr(x)
          let j = u[b],
            w = u[x]
          const m = Ve(l, t),
            v =
              typeof m == 'number'
                ? { mainAxis: m, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...m }
          if (d) {
            const A = b === 'y' ? 'height' : 'width',
              y = i.reference[b] - i.floating[A] + v.mainAxis,
              T = i.reference[b] + i.reference[A] - v.mainAxis
            j < y ? (j = y) : j > T && (j = T)
          }
          if (c) {
            var h, C
            const A = b === 'y' ? 'width' : 'height',
              y = Is.has(He(a)),
              T =
                i.reference[x] -
                i.floating[A] +
                ((y && ((h = o.offset) == null ? void 0 : h[x])) || 0) +
                (y ? 0 : v.crossAxis),
              _ =
                i.reference[x] +
                i.reference[A] +
                (y ? 0 : ((C = o.offset) == null ? void 0 : C[x]) || 0) -
                (y ? v.crossAxis : 0)
            w < T ? (w = T) : w > _ && (w = _)
          }
          return { [b]: j, [x]: w }
        },
      }
    )
  },
  No = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'size',
        options: e,
        async fn(t) {
          var n, r
          const { placement: a, rects: i, platform: o, elements: l } = t,
            { apply: d = () => {}, ...c } = Ve(e, t),
            u = await Lt(t, c),
            x = He(a),
            b = Tt(a),
            j = Pe(a) === 'y',
            { width: w, height: m } = i.floating
          let v, h
          x === 'top' || x === 'bottom'
            ? ((v = x),
              (h =
                b ===
                ((await (o.isRTL == null ? void 0 : o.isRTL(l.floating)))
                  ? 'start'
                  : 'end')
                  ? 'left'
                  : 'right'))
            : ((h = x), (v = b === 'end' ? 'top' : 'bottom'))
          const C = m - u.top - u.bottom,
            A = w - u.left - u.right,
            y = Qe(m - u[v], C),
            T = Qe(w - u[h], A),
            _ = !t.middlewareData.shift
          let S = y,
            N = T
          if (
            ((n = t.middlewareData.shift) != null && n.enabled.x && (N = A),
            (r = t.middlewareData.shift) != null && r.enabled.y && (S = C),
            _ && !b)
          ) {
            const L = ve(u.left, 0),
              B = ve(u.right, 0),
              F = ve(u.top, 0),
              E = ve(u.bottom, 0)
            j
              ? (N = w - 2 * (L !== 0 || B !== 0 ? L + B : ve(u.left, u.right)))
              : (S = m - 2 * (F !== 0 || E !== 0 ? F + E : ve(u.top, u.bottom)))
          }
          await d({ ...t, availableWidth: N, availableHeight: S })
          const P = await o.getDimensions(l.floating)
          return w !== P.width || m !== P.height ? { reset: { rects: !0 } } : {}
        },
      }
    )
  }
function gn() {
  return typeof window < 'u'
}
function Et(e) {
  return Ps(e) ? (e.nodeName || '').toLowerCase() : '#document'
}
function ye(e) {
  var t
  return (
    (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) ||
    window
  )
}
function ze(e) {
  var t
  return (t = (Ps(e) ? e.ownerDocument : e.document) || window.document) == null
    ? void 0
    : t.documentElement
}
function Ps(e) {
  return gn() ? e instanceof Node || e instanceof ye(e).Node : !1
}
function ke(e) {
  return gn() ? e instanceof Element || e instanceof ye(e).Element : !1
}
function Me(e) {
  return gn() ? e instanceof HTMLElement || e instanceof ye(e).HTMLElement : !1
}
function Fr(e) {
  return !gn() || typeof ShadowRoot > 'u'
    ? !1
    : e instanceof ShadowRoot || e instanceof ye(e).ShadowRoot
}
const _o = new Set(['inline', 'contents'])
function Vt(e) {
  const { overflow: t, overflowX: n, overflowY: r, display: a } = Re(e)
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !_o.has(a)
}
const So = new Set(['table', 'td', 'th'])
function Ao(e) {
  return So.has(Et(e))
}
const To = [':popover-open', ':modal']
function xn(e) {
  return To.some(t => {
    try {
      return e.matches(t)
    } catch {
      return !1
    }
  })
}
const Eo = ['transform', 'translate', 'scale', 'rotate', 'perspective'],
  ko = ['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter'],
  Ro = ['paint', 'layout', 'strict', 'content']
function xr(e) {
  const t = vr(),
    n = ke(e) ? Re(e) : e
  return (
    Eo.some(r => (n[r] ? n[r] !== 'none' : !1)) ||
    (n.containerType ? n.containerType !== 'normal' : !1) ||
    (!t && (n.backdropFilter ? n.backdropFilter !== 'none' : !1)) ||
    (!t && (n.filter ? n.filter !== 'none' : !1)) ||
    ko.some(r => (n.willChange || '').includes(r)) ||
    Ro.some(r => (n.contain || '').includes(r))
  )
}
function Io(e) {
  let t = Je(e)
  for (; Me(t) && !wt(t); ) {
    if (xr(t)) return t
    if (xn(t)) return null
    t = Je(t)
  }
  return null
}
function vr() {
  return typeof CSS > 'u' || !CSS.supports
    ? !1
    : CSS.supports('-webkit-backdrop-filter', 'none')
}
const Po = new Set(['html', 'body', '#document'])
function wt(e) {
  return Po.has(Et(e))
}
function Re(e) {
  return ye(e).getComputedStyle(e)
}
function vn(e) {
  return ke(e)
    ? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
    : { scrollLeft: e.scrollX, scrollTop: e.scrollY }
}
function Je(e) {
  if (Et(e) === 'html') return e
  const t = e.assignedSlot || e.parentNode || (Fr(e) && e.host) || ze(e)
  return Fr(t) ? t.host : t
}
function Os(e) {
  const t = Je(e)
  return wt(t)
    ? e.ownerDocument
      ? e.ownerDocument.body
      : e.body
    : Me(t) && Vt(t)
      ? t
      : Os(t)
}
function $t(e, t, n) {
  var r
  ;(t === void 0 && (t = []), n === void 0 && (n = !0))
  const a = Os(e),
    i = a === ((r = e.ownerDocument) == null ? void 0 : r.body),
    o = ye(a)
  if (i) {
    const l = qn(o)
    return t.concat(
      o,
      o.visualViewport || [],
      Vt(a) ? a : [],
      l && n ? $t(l) : []
    )
  }
  return t.concat(a, $t(a, [], n))
}
function qn(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null
}
function Ds(e) {
  const t = Re(e)
  let n = parseFloat(t.width) || 0,
    r = parseFloat(t.height) || 0
  const a = Me(e),
    i = a ? e.offsetWidth : n,
    o = a ? e.offsetHeight : r,
    l = nn(n) !== i || nn(r) !== o
  return (l && ((n = i), (r = o)), { width: n, height: r, $: l })
}
function br(e) {
  return ke(e) ? e : e.contextElement
}
function vt(e) {
  const t = br(e)
  if (!Me(t)) return Oe(1)
  const n = t.getBoundingClientRect(),
    { width: r, height: a, $: i } = Ds(t)
  let o = (i ? nn(n.width) : n.width) / r,
    l = (i ? nn(n.height) : n.height) / a
  return (
    (!o || !Number.isFinite(o)) && (o = 1),
    (!l || !Number.isFinite(l)) && (l = 1),
    { x: o, y: l }
  )
}
const Oo = Oe(0)
function Ms(e) {
  const t = ye(e)
  return !vr() || !t.visualViewport
    ? Oo
    : { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop }
}
function Do(e, t, n) {
  return (t === void 0 && (t = !1), !n || (t && n !== ye(e)) ? !1 : t)
}
function ct(e, t, n, r) {
  ;(t === void 0 && (t = !1), n === void 0 && (n = !1))
  const a = e.getBoundingClientRect(),
    i = br(e)
  let o = Oe(1)
  t && (r ? ke(r) && (o = vt(r)) : (o = vt(e)))
  const l = Do(i, n, r) ? Ms(i) : Oe(0)
  let d = (a.left + l.x) / o.x,
    c = (a.top + l.y) / o.y,
    u = a.width / o.x,
    x = a.height / o.y
  if (i) {
    const b = ye(i),
      j = r && ke(r) ? ye(r) : r
    let w = b,
      m = qn(w)
    for (; m && r && j !== w; ) {
      const v = vt(m),
        h = m.getBoundingClientRect(),
        C = Re(m),
        A = h.left + (m.clientLeft + parseFloat(C.paddingLeft)) * v.x,
        y = h.top + (m.clientTop + parseFloat(C.paddingTop)) * v.y
      ;((d *= v.x),
        (c *= v.y),
        (u *= v.x),
        (x *= v.y),
        (d += A),
        (c += y),
        (w = ye(m)),
        (m = qn(w)))
    }
  }
  return sn({ width: u, height: x, x: d, y: c })
}
function bn(e, t) {
  const n = vn(e).scrollLeft
  return t ? t.left + n : ct(ze(e)).left + n
}
function zs(e, t) {
  const n = e.getBoundingClientRect(),
    r = n.left + t.scrollLeft - bn(e, n),
    a = n.top + t.scrollTop
  return { x: r, y: a }
}
function Mo(e) {
  let { elements: t, rect: n, offsetParent: r, strategy: a } = e
  const i = a === 'fixed',
    o = ze(r),
    l = t ? xn(t.floating) : !1
  if (r === o || (l && i)) return n
  let d = { scrollLeft: 0, scrollTop: 0 },
    c = Oe(1)
  const u = Oe(0),
    x = Me(r)
  if (
    (x || (!x && !i)) &&
    ((Et(r) !== 'body' || Vt(o)) && (d = vn(r)), Me(r))
  ) {
    const j = ct(r)
    ;((c = vt(r)), (u.x = j.x + r.clientLeft), (u.y = j.y + r.clientTop))
  }
  const b = o && !x && !i ? zs(o, d) : Oe(0)
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - d.scrollLeft * c.x + u.x + b.x,
    y: n.y * c.y - d.scrollTop * c.y + u.y + b.y,
  }
}
function zo(e) {
  return Array.from(e.getClientRects())
}
function Lo(e) {
  const t = ze(e),
    n = vn(e),
    r = e.ownerDocument.body,
    a = ve(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth),
    i = ve(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight)
  let o = -n.scrollLeft + bn(e)
  const l = -n.scrollTop
  return (
    Re(r).direction === 'rtl' && (o += ve(t.clientWidth, r.clientWidth) - a),
    { width: a, height: i, x: o, y: l }
  )
}
const Vr = 25
function $o(e, t) {
  const n = ye(e),
    r = ze(e),
    a = n.visualViewport
  let i = r.clientWidth,
    o = r.clientHeight,
    l = 0,
    d = 0
  if (a) {
    ;((i = a.width), (o = a.height))
    const u = vr()
    ;(!u || (u && t === 'fixed')) && ((l = a.offsetLeft), (d = a.offsetTop))
  }
  const c = bn(r)
  if (c <= 0) {
    const u = r.ownerDocument,
      x = u.body,
      b = getComputedStyle(x),
      j =
        (u.compatMode === 'CSS1Compat' &&
          parseFloat(b.marginLeft) + parseFloat(b.marginRight)) ||
        0,
      w = Math.abs(r.clientWidth - x.clientWidth - j)
    w <= Vr && (i -= w)
  } else c <= Vr && (i += c)
  return { width: i, height: o, x: l, y: d }
}
const Bo = new Set(['absolute', 'fixed'])
function Fo(e, t) {
  const n = ct(e, !0, t === 'fixed'),
    r = n.top + e.clientTop,
    a = n.left + e.clientLeft,
    i = Me(e) ? vt(e) : Oe(1),
    o = e.clientWidth * i.x,
    l = e.clientHeight * i.y,
    d = a * i.x,
    c = r * i.y
  return { width: o, height: l, x: d, y: c }
}
function Hr(e, t, n) {
  let r
  if (t === 'viewport') r = $o(e, n)
  else if (t === 'document') r = Lo(ze(e))
  else if (ke(t)) r = Fo(t, n)
  else {
    const a = Ms(e)
    r = { x: t.x - a.x, y: t.y - a.y, width: t.width, height: t.height }
  }
  return sn(r)
}
function Ls(e, t) {
  const n = Je(e)
  return n === t || !ke(n) || wt(n)
    ? !1
    : Re(n).position === 'fixed' || Ls(n, t)
}
function Vo(e, t) {
  const n = t.get(e)
  if (n) return n
  let r = $t(e, [], !1).filter(l => ke(l) && Et(l) !== 'body'),
    a = null
  const i = Re(e).position === 'fixed'
  let o = i ? Je(e) : e
  for (; ke(o) && !wt(o); ) {
    const l = Re(o),
      d = xr(o)
    ;(!d && l.position === 'fixed' && (a = null),
      (
        i
          ? !d && !a
          : (!d && l.position === 'static' && !!a && Bo.has(a.position)) ||
            (Vt(o) && !d && Ls(e, o))
      )
        ? (r = r.filter(u => u !== o))
        : (a = l),
      (o = Je(o)))
  }
  return (t.set(e, r), r)
}
function Ho(e) {
  let { element: t, boundary: n, rootBoundary: r, strategy: a } = e
  const o = [
      ...(n === 'clippingAncestors'
        ? xn(t)
          ? []
          : Vo(t, this._c)
        : [].concat(n)),
      r,
    ],
    l = o[0],
    d = o.reduce(
      (c, u) => {
        const x = Hr(t, u, a)
        return (
          (c.top = ve(x.top, c.top)),
          (c.right = Qe(x.right, c.right)),
          (c.bottom = Qe(x.bottom, c.bottom)),
          (c.left = ve(x.left, c.left)),
          c
        )
      },
      Hr(t, l, a)
    )
  return {
    width: d.right - d.left,
    height: d.bottom - d.top,
    x: d.left,
    y: d.top,
  }
}
function Zo(e) {
  const { width: t, height: n } = Ds(e)
  return { width: t, height: n }
}
function qo(e, t, n) {
  const r = Me(t),
    a = ze(t),
    i = n === 'fixed',
    o = ct(e, !0, i, t)
  let l = { scrollLeft: 0, scrollTop: 0 }
  const d = Oe(0)
  function c() {
    d.x = bn(a)
  }
  if (r || (!r && !i))
    if (((Et(t) !== 'body' || Vt(a)) && (l = vn(t)), r)) {
      const j = ct(t, !0, i, t)
      ;((d.x = j.x + t.clientLeft), (d.y = j.y + t.clientTop))
    } else a && c()
  i && !r && a && c()
  const u = a && !r && !i ? zs(a, l) : Oe(0),
    x = o.left + l.scrollLeft - d.x - u.x,
    b = o.top + l.scrollTop - d.y - u.y
  return { x, y: b, width: o.width, height: o.height }
}
function Rn(e) {
  return Re(e).position === 'static'
}
function Zr(e, t) {
  if (!Me(e) || Re(e).position === 'fixed') return null
  if (t) return t(e)
  let n = e.offsetParent
  return (ze(e) === n && (n = n.ownerDocument.body), n)
}
function $s(e, t) {
  const n = ye(e)
  if (xn(e)) return n
  if (!Me(e)) {
    let a = Je(e)
    for (; a && !wt(a); ) {
      if (ke(a) && !Rn(a)) return a
      a = Je(a)
    }
    return n
  }
  let r = Zr(e, t)
  for (; r && Ao(r) && Rn(r); ) r = Zr(r, t)
  return r && wt(r) && Rn(r) && !xr(r) ? n : r || Io(e) || n
}
const Uo = async function (e) {
  const t = this.getOffsetParent || $s,
    n = this.getDimensions,
    r = await n(e.floating)
  return {
    reference: qo(e.reference, await t(e.floating), e.strategy),
    floating: { x: 0, y: 0, width: r.width, height: r.height },
  }
}
function Wo(e) {
  return Re(e).direction === 'rtl'
}
const Go = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Mo,
  getDocumentElement: ze,
  getClippingRect: Ho,
  getOffsetParent: $s,
  getElementRects: Uo,
  getClientRects: zo,
  getDimensions: Zo,
  getScale: vt,
  isElement: ke,
  isRTL: Wo,
}
function Bs(e, t) {
  return (
    e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height
  )
}
function Yo(e, t) {
  let n = null,
    r
  const a = ze(e)
  function i() {
    var l
    ;(clearTimeout(r), (l = n) == null || l.disconnect(), (n = null))
  }
  function o(l, d) {
    ;(l === void 0 && (l = !1), d === void 0 && (d = 1), i())
    const c = e.getBoundingClientRect(),
      { left: u, top: x, width: b, height: j } = c
    if ((l || t(), !b || !j)) return
    const w = Zt(x),
      m = Zt(a.clientWidth - (u + b)),
      v = Zt(a.clientHeight - (x + j)),
      h = Zt(u),
      A = {
        rootMargin: -w + 'px ' + -m + 'px ' + -v + 'px ' + -h + 'px',
        threshold: ve(0, Qe(1, d)) || 1,
      }
    let y = !0
    function T(_) {
      const S = _[0].intersectionRatio
      if (S !== d) {
        if (!y) return o()
        S
          ? o(!1, S)
          : (r = setTimeout(() => {
              o(!1, 1e-7)
            }, 1e3))
      }
      ;(S === 1 && !Bs(c, e.getBoundingClientRect()) && o(), (y = !1))
    }
    try {
      n = new IntersectionObserver(T, { ...A, root: a.ownerDocument })
    } catch {
      n = new IntersectionObserver(T, A)
    }
    n.observe(e)
  }
  return (o(!0), i)
}
function Ko(e, t, n, r) {
  r === void 0 && (r = {})
  const {
      ancestorScroll: a = !0,
      ancestorResize: i = !0,
      elementResize: o = typeof ResizeObserver == 'function',
      layoutShift: l = typeof IntersectionObserver == 'function',
      animationFrame: d = !1,
    } = r,
    c = br(e),
    u = a || i ? [...(c ? $t(c) : []), ...$t(t)] : []
  u.forEach(h => {
    ;(a && h.addEventListener('scroll', n, { passive: !0 }),
      i && h.addEventListener('resize', n))
  })
  const x = c && l ? Yo(c, n) : null
  let b = -1,
    j = null
  o &&
    ((j = new ResizeObserver(h => {
      let [C] = h
      ;(C &&
        C.target === c &&
        j &&
        (j.unobserve(t),
        cancelAnimationFrame(b),
        (b = requestAnimationFrame(() => {
          var A
          ;(A = j) == null || A.observe(t)
        }))),
        n())
    })),
    c && !d && j.observe(c),
    j.observe(t))
  let w,
    m = d ? ct(e) : null
  d && v()
  function v() {
    const h = ct(e)
    ;(m && !Bs(m, h) && n(), (m = h), (w = requestAnimationFrame(v)))
  }
  return (
    n(),
    () => {
      var h
      ;(u.forEach(C => {
        ;(a && C.removeEventListener('scroll', n),
          i && C.removeEventListener('resize', n))
      }),
        x?.(),
        (h = j) == null || h.disconnect(),
        (j = null),
        d && cancelAnimationFrame(w))
    }
  )
}
const Xo = wo,
  Qo = jo,
  Jo = vo,
  el = No,
  tl = bo,
  qr = xo,
  nl = Co,
  rl = (e, t, n) => {
    const r = new Map(),
      a = { platform: Go, ...n },
      i = { ...a.platform, _c: r }
    return go(e, t, { ...a, platform: i })
  }
var sl = typeof document < 'u',
  al = function () {},
  Xt = sl ? f.useLayoutEffect : al
function an(e, t) {
  if (e === t) return !0
  if (typeof e != typeof t) return !1
  if (typeof e == 'function' && e.toString() === t.toString()) return !0
  let n, r, a
  if (e && t && typeof e == 'object') {
    if (Array.isArray(e)) {
      if (((n = e.length), n !== t.length)) return !1
      for (r = n; r-- !== 0; ) if (!an(e[r], t[r])) return !1
      return !0
    }
    if (((a = Object.keys(e)), (n = a.length), n !== Object.keys(t).length))
      return !1
    for (r = n; r-- !== 0; ) if (!{}.hasOwnProperty.call(t, a[r])) return !1
    for (r = n; r-- !== 0; ) {
      const i = a[r]
      if (!(i === '_owner' && e.$$typeof) && !an(e[i], t[i])) return !1
    }
    return !0
  }
  return e !== e && t !== t
}
function Fs(e) {
  return typeof window > 'u'
    ? 1
    : (e.ownerDocument.defaultView || window).devicePixelRatio || 1
}
function Ur(e, t) {
  const n = Fs(e)
  return Math.round(t * n) / n
}
function In(e) {
  const t = f.useRef(e)
  return (
    Xt(() => {
      t.current = e
    }),
    t
  )
}
function il(e) {
  e === void 0 && (e = {})
  const {
      placement: t = 'bottom',
      strategy: n = 'absolute',
      middleware: r = [],
      platform: a,
      elements: { reference: i, floating: o } = {},
      transform: l = !0,
      whileElementsMounted: d,
      open: c,
    } = e,
    [u, x] = f.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: t,
      middlewareData: {},
      isPositioned: !1,
    }),
    [b, j] = f.useState(r)
  an(b, r) || j(r)
  const [w, m] = f.useState(null),
    [v, h] = f.useState(null),
    C = f.useCallback(I => {
      I !== _.current && ((_.current = I), m(I))
    }, []),
    A = f.useCallback(I => {
      I !== S.current && ((S.current = I), h(I))
    }, []),
    y = i || w,
    T = o || v,
    _ = f.useRef(null),
    S = f.useRef(null),
    N = f.useRef(u),
    P = d != null,
    L = In(d),
    B = In(a),
    F = In(c),
    E = f.useCallback(() => {
      if (!_.current || !S.current) return
      const I = { placement: t, strategy: n, middleware: b }
      ;(B.current && (I.platform = B.current),
        rl(_.current, S.current, I).then(M => {
          const q = { ...M, isPositioned: F.current !== !1 }
          p.current &&
            !an(N.current, q) &&
            ((N.current = q),
            hn.flushSync(() => {
              x(q)
            }))
        }))
    }, [b, t, n, B, F])
  Xt(() => {
    c === !1 &&
      N.current.isPositioned &&
      ((N.current.isPositioned = !1), x(I => ({ ...I, isPositioned: !1 })))
  }, [c])
  const p = f.useRef(!1)
  ;(Xt(
    () => (
      (p.current = !0),
      () => {
        p.current = !1
      }
    ),
    []
  ),
    Xt(() => {
      if ((y && (_.current = y), T && (S.current = T), y && T)) {
        if (L.current) return L.current(y, T, E)
        E()
      }
    }, [y, T, E, L, P]))
  const g = f.useMemo(
      () => ({ reference: _, floating: S, setReference: C, setFloating: A }),
      [C, A]
    ),
    k = f.useMemo(() => ({ reference: y, floating: T }), [y, T]),
    O = f.useMemo(() => {
      const I = { position: n, left: 0, top: 0 }
      if (!k.floating) return I
      const M = Ur(k.floating, u.x),
        q = Ur(k.floating, u.y)
      return l
        ? {
            ...I,
            transform: 'translate(' + M + 'px, ' + q + 'px)',
            ...(Fs(k.floating) >= 1.5 && { willChange: 'transform' }),
          }
        : { position: n, left: M, top: q }
    }, [n, l, k.floating, u.x, u.y])
  return f.useMemo(
    () => ({ ...u, update: E, refs: g, elements: k, floatingStyles: O }),
    [u, E, g, k, O]
  )
}
const ol = e => {
    function t(n) {
      return {}.hasOwnProperty.call(n, 'current')
    }
    return {
      name: 'arrow',
      options: e,
      fn(n) {
        const { element: r, padding: a } = typeof e == 'function' ? e(n) : e
        return r && t(r)
          ? r.current != null
            ? qr({ element: r.current, padding: a }).fn(n)
            : {}
          : r
            ? qr({ element: r, padding: a }).fn(n)
            : {}
      },
    }
  },
  ll = (e, t) => ({ ...Xo(e), options: [e, t] }),
  cl = (e, t) => ({ ...Qo(e), options: [e, t] }),
  dl = (e, t) => ({ ...nl(e), options: [e, t] }),
  ul = (e, t) => ({ ...Jo(e), options: [e, t] }),
  fl = (e, t) => ({ ...el(e), options: [e, t] }),
  ml = (e, t) => ({ ...tl(e), options: [e, t] }),
  pl = (e, t) => ({ ...ol(e), options: [e, t] })
var hl = 'Arrow',
  Vs = f.forwardRef((e, t) => {
    const { children: n, width: r = 10, height: a = 5, ...i } = e
    return s.jsx(ae.svg, {
      ...i,
      ref: t,
      width: r,
      height: a,
      viewBox: '0 0 30 10',
      preserveAspectRatio: 'none',
      children: e.asChild ? n : s.jsx('polygon', { points: '0,0 30,0 15,10' }),
    })
  })
Vs.displayName = hl
var gl = Vs
function xl(e) {
  const [t, n] = f.useState(void 0)
  return (
    ge(() => {
      if (e) {
        n({ width: e.offsetWidth, height: e.offsetHeight })
        const r = new ResizeObserver(a => {
          if (!Array.isArray(a) || !a.length) return
          const i = a[0]
          let o, l
          if ('borderBoxSize' in i) {
            const d = i.borderBoxSize,
              c = Array.isArray(d) ? d[0] : d
            ;((o = c.inlineSize), (l = c.blockSize))
          } else ((o = e.offsetWidth), (l = e.offsetHeight))
          n({ width: o, height: l })
        })
        return (r.observe(e, { box: 'border-box' }), () => r.unobserve(e))
      } else n(void 0)
    }, [e]),
    t
  )
}
var yr = 'Popper',
  [Hs, Zs] = fr(yr),
  [vl, qs] = Hs(yr),
  Us = e => {
    const { __scopePopper: t, children: n } = e,
      [r, a] = f.useState(null)
    return s.jsx(vl, { scope: t, anchor: r, onAnchorChange: a, children: n })
  }
Us.displayName = yr
var Ws = 'PopperAnchor',
  Gs = f.forwardRef((e, t) => {
    const { __scopePopper: n, virtualRef: r, ...a } = e,
      i = qs(Ws, n),
      o = f.useRef(null),
      l = fe(t, o),
      d = f.useRef(null)
    return (
      f.useEffect(() => {
        const c = d.current
        ;((d.current = r?.current || o.current),
          c !== d.current && i.onAnchorChange(d.current))
      }),
      r ? null : s.jsx(ae.div, { ...a, ref: l })
    )
  })
Gs.displayName = Ws
var wr = 'PopperContent',
  [bl, yl] = Hs(wr),
  Ys = f.forwardRef((e, t) => {
    const {
        __scopePopper: n,
        side: r = 'bottom',
        sideOffset: a = 0,
        align: i = 'center',
        alignOffset: o = 0,
        arrowPadding: l = 0,
        avoidCollisions: d = !0,
        collisionBoundary: c = [],
        collisionPadding: u = 0,
        sticky: x = 'partial',
        hideWhenDetached: b = !1,
        updatePositionStrategy: j = 'optimized',
        onPlaced: w,
        ...m
      } = e,
      v = qs(wr, n),
      [h, C] = f.useState(null),
      A = fe(t, V => C(V)),
      [y, T] = f.useState(null),
      _ = xl(y),
      S = _?.width ?? 0,
      N = _?.height ?? 0,
      P = r + (i !== 'center' ? '-' + i : ''),
      L =
        typeof u == 'number'
          ? u
          : { top: 0, right: 0, bottom: 0, left: 0, ...u },
      B = Array.isArray(c) ? c : [c],
      F = B.length > 0,
      E = { padding: L, boundary: B.filter(jl), altBoundary: F },
      {
        refs: p,
        floatingStyles: g,
        placement: k,
        isPositioned: O,
        middlewareData: I,
      } = il({
        strategy: 'fixed',
        placement: P,
        whileElementsMounted: (...V) =>
          Ko(...V, { animationFrame: j === 'always' }),
        elements: { reference: v.anchor },
        middleware: [
          ll({ mainAxis: a + N, alignmentAxis: o }),
          d &&
            cl({
              mainAxis: !0,
              crossAxis: !1,
              limiter: x === 'partial' ? dl() : void 0,
              ...E,
            }),
          d && ul({ ...E }),
          fl({
            ...E,
            apply: ({
              elements: V,
              rects: ee,
              availableWidth: pe,
              availableHeight: X,
            }) => {
              const { width: te, height: oe } = ee.reference,
                je = V.floating.style
              ;(je.setProperty('--radix-popper-available-width', `${pe}px`),
                je.setProperty('--radix-popper-available-height', `${X}px`),
                je.setProperty('--radix-popper-anchor-width', `${te}px`),
                je.setProperty('--radix-popper-anchor-height', `${oe}px`))
            },
          }),
          y && pl({ element: y, padding: l }),
          Cl({ arrowWidth: S, arrowHeight: N }),
          b && ml({ strategy: 'referenceHidden', ...E }),
        ],
      }),
      [M, q] = Qs(k),
      Q = lt(w)
    ge(() => {
      O && Q?.()
    }, [O, Q])
    const ne = I.arrow?.x,
      J = I.arrow?.y,
      de = I.arrow?.centerOffset !== 0,
      [ie, me] = f.useState()
    return (
      ge(() => {
        h && me(window.getComputedStyle(h).zIndex)
      }, [h]),
      s.jsx('div', {
        ref: p.setFloating,
        'data-radix-popper-content-wrapper': '',
        style: {
          ...g,
          transform: O ? g.transform : 'translate(0, -200%)',
          minWidth: 'max-content',
          zIndex: ie,
          '--radix-popper-transform-origin': [
            I.transformOrigin?.x,
            I.transformOrigin?.y,
          ].join(' '),
          ...(I.hide?.referenceHidden && {
            visibility: 'hidden',
            pointerEvents: 'none',
          }),
        },
        dir: e.dir,
        children: s.jsx(bl, {
          scope: n,
          placedSide: M,
          onArrowChange: T,
          arrowX: ne,
          arrowY: J,
          shouldHideArrow: de,
          children: s.jsx(ae.div, {
            'data-side': M,
            'data-align': q,
            ...m,
            ref: A,
            style: { ...m.style, animation: O ? void 0 : 'none' },
          }),
        }),
      })
    )
  })
Ys.displayName = wr
var Ks = 'PopperArrow',
  wl = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' },
  Xs = f.forwardRef(function (t, n) {
    const { __scopePopper: r, ...a } = t,
      i = yl(Ks, r),
      o = wl[i.placedSide]
    return s.jsx('span', {
      ref: i.onArrowChange,
      style: {
        position: 'absolute',
        left: i.arrowX,
        top: i.arrowY,
        [o]: 0,
        transformOrigin: {
          top: '',
          right: '0 0',
          bottom: 'center 0',
          left: '100% 0',
        }[i.placedSide],
        transform: {
          top: 'translateY(100%)',
          right: 'translateY(50%) rotate(90deg) translateX(-50%)',
          bottom: 'rotate(180deg)',
          left: 'translateY(50%) rotate(-90deg) translateX(50%)',
        }[i.placedSide],
        visibility: i.shouldHideArrow ? 'hidden' : void 0,
      },
      children: s.jsx(gl, {
        ...a,
        ref: n,
        style: { ...a.style, display: 'block' },
      }),
    })
  })
Xs.displayName = Ks
function jl(e) {
  return e !== null
}
var Cl = e => ({
  name: 'transformOrigin',
  options: e,
  fn(t) {
    const { placement: n, rects: r, middlewareData: a } = t,
      o = a.arrow?.centerOffset !== 0,
      l = o ? 0 : e.arrowWidth,
      d = o ? 0 : e.arrowHeight,
      [c, u] = Qs(n),
      x = { start: '0%', center: '50%', end: '100%' }[u],
      b = (a.arrow?.x ?? 0) + l / 2,
      j = (a.arrow?.y ?? 0) + d / 2
    let w = '',
      m = ''
    return (
      c === 'bottom'
        ? ((w = o ? x : `${b}px`), (m = `${-d}px`))
        : c === 'top'
          ? ((w = o ? x : `${b}px`), (m = `${r.floating.height + d}px`))
          : c === 'right'
            ? ((w = `${-d}px`), (m = o ? x : `${j}px`))
            : c === 'left' &&
              ((w = `${r.floating.width + d}px`), (m = o ? x : `${j}px`)),
      { data: { x: w, y: m } }
    )
  },
})
function Qs(e) {
  const [t, n = 'center'] = e.split('-')
  return [t, n]
}
var Nl = Us,
  _l = Gs,
  Sl = Ys,
  Al = Xs,
  Tl = 'Portal',
  Js = f.forwardRef((e, t) => {
    const { container: n, ...r } = e,
      [a, i] = f.useState(!1)
    ge(() => i(!0), [])
    const o = n || (a && globalThis?.document?.body)
    return o ? ai.createPortal(s.jsx(ae.div, { ...r, ref: t }), o) : null
  })
Js.displayName = Tl
var El = ys[' useInsertionEffect '.trim().toString()] || ge
function Wr({ prop: e, defaultProp: t, onChange: n = () => {}, caller: r }) {
  const [a, i, o] = kl({ defaultProp: t, onChange: n }),
    l = e !== void 0,
    d = l ? e : a
  {
    const u = f.useRef(e !== void 0)
    f.useEffect(() => {
      const x = u.current
      ;(x !== l &&
        console.warn(
          `${r} is changing from ${x ? 'controlled' : 'uncontrolled'} to ${l ? 'controlled' : 'uncontrolled'}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        ),
        (u.current = l))
    }, [l, r])
  }
  const c = f.useCallback(
    u => {
      if (l) {
        const x = Rl(u) ? u(e) : u
        x !== e && o.current?.(x)
      } else i(u)
    },
    [l, e, i, o]
  )
  return [d, c]
}
function kl({ defaultProp: e, onChange: t }) {
  const [n, r] = f.useState(e),
    a = f.useRef(n),
    i = f.useRef(t)
  return (
    El(() => {
      i.current = t
    }, [t]),
    f.useEffect(() => {
      a.current !== n && (i.current?.(n), (a.current = n))
    }, [n, a]),
    [n, r, i]
  )
}
function Rl(e) {
  return typeof e == 'function'
}
function Il(e) {
  const t = f.useRef({ value: e, previous: e })
  return f.useMemo(
    () => (
      t.current.value !== e &&
        ((t.current.previous = t.current.value), (t.current.value = e)),
      t.current.previous
    ),
    [e]
  )
}
var ea = Object.freeze({
    position: 'absolute',
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
  }),
  Pl = 'VisuallyHidden',
  Ol = f.forwardRef((e, t) =>
    s.jsx(ae.span, { ...e, ref: t, style: { ...ea, ...e.style } })
  )
Ol.displayName = Pl
var Dl = function (e) {
    if (typeof document > 'u') return null
    var t = Array.isArray(e) ? e[0] : e
    return t.ownerDocument.body
  },
  pt = new WeakMap(),
  qt = new WeakMap(),
  Ut = {},
  Pn = 0,
  ta = function (e) {
    return e && (e.host || ta(e.parentNode))
  },
  Ml = function (e, t) {
    return t
      .map(function (n) {
        if (e.contains(n)) return n
        var r = ta(n)
        return r && e.contains(r)
          ? r
          : (console.error(
              'aria-hidden',
              n,
              'in not contained inside',
              e,
              '. Doing nothing'
            ),
            null)
      })
      .filter(function (n) {
        return !!n
      })
  },
  zl = function (e, t, n, r) {
    var a = Ml(t, Array.isArray(e) ? e : [e])
    Ut[n] || (Ut[n] = new WeakMap())
    var i = Ut[n],
      o = [],
      l = new Set(),
      d = new Set(a),
      c = function (x) {
        !x || l.has(x) || (l.add(x), c(x.parentNode))
      }
    a.forEach(c)
    var u = function (x) {
      !x ||
        d.has(x) ||
        Array.prototype.forEach.call(x.children, function (b) {
          if (l.has(b)) u(b)
          else
            try {
              var j = b.getAttribute(r),
                w = j !== null && j !== 'false',
                m = (pt.get(b) || 0) + 1,
                v = (i.get(b) || 0) + 1
              ;(pt.set(b, m),
                i.set(b, v),
                o.push(b),
                m === 1 && w && qt.set(b, !0),
                v === 1 && b.setAttribute(n, 'true'),
                w || b.setAttribute(r, 'true'))
            } catch (h) {
              console.error('aria-hidden: cannot operate on ', b, h)
            }
        })
    }
    return (
      u(t),
      l.clear(),
      Pn++,
      function () {
        ;(o.forEach(function (x) {
          var b = pt.get(x) - 1,
            j = i.get(x) - 1
          ;(pt.set(x, b),
            i.set(x, j),
            b || (qt.has(x) || x.removeAttribute(r), qt.delete(x)),
            j || x.removeAttribute(n))
        }),
          Pn--,
          Pn ||
            ((pt = new WeakMap()),
            (pt = new WeakMap()),
            (qt = new WeakMap()),
            (Ut = {})))
      }
    )
  },
  Ll = function (e, t, n) {
    n === void 0 && (n = 'data-aria-hidden')
    var r = Array.from(Array.isArray(e) ? e : [e]),
      a = Dl(e)
    return a
      ? (r.push.apply(r, Array.from(a.querySelectorAll('[aria-live], script'))),
        zl(r, a, n, 'aria-hidden'))
      : function () {
          return null
        }
  },
  Ie = function () {
    return (
      (Ie =
        Object.assign ||
        function (t) {
          for (var n, r = 1, a = arguments.length; r < a; r++) {
            n = arguments[r]
            for (var i in n)
              Object.prototype.hasOwnProperty.call(n, i) && (t[i] = n[i])
          }
          return t
        }),
      Ie.apply(this, arguments)
    )
  }
function na(e, t) {
  var n = {}
  for (var r in e)
    Object.prototype.hasOwnProperty.call(e, r) &&
      t.indexOf(r) < 0 &&
      (n[r] = e[r])
  if (e != null && typeof Object.getOwnPropertySymbols == 'function')
    for (var a = 0, r = Object.getOwnPropertySymbols(e); a < r.length; a++)
      t.indexOf(r[a]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(e, r[a]) &&
        (n[r[a]] = e[r[a]])
  return n
}
function $l(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, a = t.length, i; r < a; r++)
      (i || !(r in t)) &&
        (i || (i = Array.prototype.slice.call(t, 0, r)), (i[r] = t[r]))
  return e.concat(i || Array.prototype.slice.call(t))
}
var Qt = 'right-scroll-bar-position',
  Jt = 'width-before-scroll-bar',
  Bl = 'with-scroll-bars-hidden',
  Fl = '--removed-body-scroll-bar-size'
function On(e, t) {
  return (typeof e == 'function' ? e(t) : e && (e.current = t), e)
}
function Vl(e, t) {
  var n = f.useState(function () {
    return {
      value: e,
      callback: t,
      facade: {
        get current() {
          return n.value
        },
        set current(r) {
          var a = n.value
          a !== r && ((n.value = r), n.callback(r, a))
        },
      },
    }
  })[0]
  return ((n.callback = t), n.facade)
}
var Hl = typeof window < 'u' ? f.useLayoutEffect : f.useEffect,
  Gr = new WeakMap()
function Zl(e, t) {
  var n = Vl(null, function (r) {
    return e.forEach(function (a) {
      return On(a, r)
    })
  })
  return (
    Hl(
      function () {
        var r = Gr.get(n)
        if (r) {
          var a = new Set(r),
            i = new Set(e),
            o = n.current
          ;(a.forEach(function (l) {
            i.has(l) || On(l, null)
          }),
            i.forEach(function (l) {
              a.has(l) || On(l, o)
            }))
        }
        Gr.set(n, e)
      },
      [e]
    ),
    n
  )
}
function ql(e) {
  return e
}
function Ul(e, t) {
  t === void 0 && (t = ql)
  var n = [],
    r = !1,
    a = {
      read: function () {
        if (r)
          throw new Error(
            'Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.'
          )
        return n.length ? n[n.length - 1] : e
      },
      useMedium: function (i) {
        var o = t(i, r)
        return (
          n.push(o),
          function () {
            n = n.filter(function (l) {
              return l !== o
            })
          }
        )
      },
      assignSyncMedium: function (i) {
        for (r = !0; n.length; ) {
          var o = n
          ;((n = []), o.forEach(i))
        }
        n = {
          push: function (l) {
            return i(l)
          },
          filter: function () {
            return n
          },
        }
      },
      assignMedium: function (i) {
        r = !0
        var o = []
        if (n.length) {
          var l = n
          ;((n = []), l.forEach(i), (o = n))
        }
        var d = function () {
            var u = o
            ;((o = []), u.forEach(i))
          },
          c = function () {
            return Promise.resolve().then(d)
          }
        ;(c(),
          (n = {
            push: function (u) {
              ;(o.push(u), c())
            },
            filter: function (u) {
              return ((o = o.filter(u)), n)
            },
          }))
      },
    }
  return a
}
function Wl(e) {
  e === void 0 && (e = {})
  var t = Ul(null)
  return ((t.options = Ie({ async: !0, ssr: !1 }, e)), t)
}
var ra = function (e) {
  var t = e.sideCar,
    n = na(e, ['sideCar'])
  if (!t)
    throw new Error(
      'Sidecar: please provide `sideCar` property to import the right car'
    )
  var r = t.read()
  if (!r) throw new Error('Sidecar medium not found')
  return f.createElement(r, Ie({}, n))
}
ra.isSideCarExport = !0
function Gl(e, t) {
  return (e.useMedium(t), ra)
}
var sa = Wl(),
  Dn = function () {},
  yn = f.forwardRef(function (e, t) {
    var n = f.useRef(null),
      r = f.useState({
        onScrollCapture: Dn,
        onWheelCapture: Dn,
        onTouchMoveCapture: Dn,
      }),
      a = r[0],
      i = r[1],
      o = e.forwardProps,
      l = e.children,
      d = e.className,
      c = e.removeScrollBar,
      u = e.enabled,
      x = e.shards,
      b = e.sideCar,
      j = e.noRelative,
      w = e.noIsolation,
      m = e.inert,
      v = e.allowPinchZoom,
      h = e.as,
      C = h === void 0 ? 'div' : h,
      A = e.gapMode,
      y = na(e, [
        'forwardProps',
        'children',
        'className',
        'removeScrollBar',
        'enabled',
        'shards',
        'sideCar',
        'noRelative',
        'noIsolation',
        'inert',
        'allowPinchZoom',
        'as',
        'gapMode',
      ]),
      T = b,
      _ = Zl([n, t]),
      S = Ie(Ie({}, y), a)
    return f.createElement(
      f.Fragment,
      null,
      u &&
        f.createElement(T, {
          sideCar: sa,
          removeScrollBar: c,
          shards: x,
          noRelative: j,
          noIsolation: w,
          inert: m,
          setCallbacks: i,
          allowPinchZoom: !!v,
          lockRef: n,
          gapMode: A,
        }),
      o
        ? f.cloneElement(f.Children.only(l), Ie(Ie({}, S), { ref: _ }))
        : f.createElement(C, Ie({}, S, { className: d, ref: _ }), l)
    )
  })
yn.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 }
yn.classNames = { fullWidth: Jt, zeroRight: Qt }
var Yl = function () {
  if (typeof __webpack_nonce__ < 'u') return __webpack_nonce__
}
function Kl() {
  if (!document) return null
  var e = document.createElement('style')
  e.type = 'text/css'
  var t = Yl()
  return (t && e.setAttribute('nonce', t), e)
}
function Xl(e, t) {
  e.styleSheet
    ? (e.styleSheet.cssText = t)
    : e.appendChild(document.createTextNode(t))
}
function Ql(e) {
  var t = document.head || document.getElementsByTagName('head')[0]
  t.appendChild(e)
}
var Jl = function () {
    var e = 0,
      t = null
    return {
      add: function (n) {
        ;(e == 0 && (t = Kl()) && (Xl(t, n), Ql(t)), e++)
      },
      remove: function () {
        ;(e--,
          !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null)))
      },
    }
  },
  ec = function () {
    var e = Jl()
    return function (t, n) {
      f.useEffect(
        function () {
          return (
            e.add(t),
            function () {
              e.remove()
            }
          )
        },
        [t && n]
      )
    }
  },
  aa = function () {
    var e = ec(),
      t = function (n) {
        var r = n.styles,
          a = n.dynamic
        return (e(r, a), null)
      }
    return t
  },
  tc = { left: 0, top: 0, right: 0, gap: 0 },
  Mn = function (e) {
    return parseInt(e || '', 10) || 0
  },
  nc = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === 'padding' ? 'paddingLeft' : 'marginLeft'],
      r = t[e === 'padding' ? 'paddingTop' : 'marginTop'],
      a = t[e === 'padding' ? 'paddingRight' : 'marginRight']
    return [Mn(n), Mn(r), Mn(a)]
  },
  rc = function (e) {
    if ((e === void 0 && (e = 'margin'), typeof window > 'u')) return tc
    var t = nc(e),
      n = document.documentElement.clientWidth,
      r = window.innerWidth
    return {
      left: t[0],
      top: t[1],
      right: t[2],
      gap: Math.max(0, r - n + t[2] - t[0]),
    }
  },
  sc = aa(),
  bt = 'data-scroll-locked',
  ac = function (e, t, n, r) {
    var a = e.left,
      i = e.top,
      o = e.right,
      l = e.gap
    return (
      n === void 0 && (n = 'margin'),
      `
  .`
        .concat(
          Bl,
          ` {
   overflow: hidden `
        )
        .concat(
          r,
          `;
   padding-right: `
        )
        .concat(l, 'px ')
        .concat(
          r,
          `;
  }
  body[`
        )
        .concat(
          bt,
          `] {
    overflow: hidden `
        )
        .concat(
          r,
          `;
    overscroll-behavior: contain;
    `
        )
        .concat(
          [
            t && 'position: relative '.concat(r, ';'),
            n === 'margin' &&
              `
    padding-left: `
                .concat(
                  a,
                  `px;
    padding-top: `
                )
                .concat(
                  i,
                  `px;
    padding-right: `
                )
                .concat(
                  o,
                  `px;
    margin-left:0;
    margin-top:0;
    margin-right: `
                )
                .concat(l, 'px ')
                .concat(
                  r,
                  `;
    `
                ),
            n === 'padding' &&
              'padding-right: '.concat(l, 'px ').concat(r, ';'),
          ]
            .filter(Boolean)
            .join(''),
          `
  }
  
  .`
        )
        .concat(
          Qt,
          ` {
    right: `
        )
        .concat(l, 'px ')
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(
          Jt,
          ` {
    margin-right: `
        )
        .concat(l, 'px ')
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(Qt, ' .')
        .concat(
          Qt,
          ` {
    right: 0 `
        )
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(Jt, ' .')
        .concat(
          Jt,
          ` {
    margin-right: 0 `
        )
        .concat(
          r,
          `;
  }
  
  body[`
        )
        .concat(
          bt,
          `] {
    `
        )
        .concat(Fl, ': ')
        .concat(
          l,
          `px;
  }
`
        )
    )
  },
  Yr = function () {
    var e = parseInt(document.body.getAttribute(bt) || '0', 10)
    return isFinite(e) ? e : 0
  },
  ic = function () {
    f.useEffect(function () {
      return (
        document.body.setAttribute(bt, (Yr() + 1).toString()),
        function () {
          var e = Yr() - 1
          e <= 0
            ? document.body.removeAttribute(bt)
            : document.body.setAttribute(bt, e.toString())
        }
      )
    }, [])
  },
  oc = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      r = e.gapMode,
      a = r === void 0 ? 'margin' : r
    ic()
    var i = f.useMemo(
      function () {
        return rc(a)
      },
      [a]
    )
    return f.createElement(sc, { styles: ac(i, !t, a, n ? '' : '!important') })
  },
  Un = !1
if (typeof window < 'u')
  try {
    var Wt = Object.defineProperty({}, 'passive', {
      get: function () {
        return ((Un = !0), !0)
      },
    })
    ;(window.addEventListener('test', Wt, Wt),
      window.removeEventListener('test', Wt, Wt))
  } catch {
    Un = !1
  }
var ht = Un ? { passive: !1 } : !1,
  lc = function (e) {
    return e.tagName === 'TEXTAREA'
  },
  ia = function (e, t) {
    if (!(e instanceof Element)) return !1
    var n = window.getComputedStyle(e)
    return (
      n[t] !== 'hidden' &&
      !(n.overflowY === n.overflowX && !lc(e) && n[t] === 'visible')
    )
  },
  cc = function (e) {
    return ia(e, 'overflowY')
  },
  dc = function (e) {
    return ia(e, 'overflowX')
  },
  Kr = function (e, t) {
    var n = t.ownerDocument,
      r = t
    do {
      typeof ShadowRoot < 'u' && r instanceof ShadowRoot && (r = r.host)
      var a = oa(e, r)
      if (a) {
        var i = la(e, r),
          o = i[1],
          l = i[2]
        if (o > l) return !0
      }
      r = r.parentNode
    } while (r && r !== n.body)
    return !1
  },
  uc = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      r = e.clientHeight
    return [t, n, r]
  },
  fc = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      r = e.clientWidth
    return [t, n, r]
  },
  oa = function (e, t) {
    return e === 'v' ? cc(t) : dc(t)
  },
  la = function (e, t) {
    return e === 'v' ? uc(t) : fc(t)
  },
  mc = function (e, t) {
    return e === 'h' && t === 'rtl' ? -1 : 1
  },
  pc = function (e, t, n, r, a) {
    var i = mc(e, window.getComputedStyle(t).direction),
      o = i * r,
      l = n.target,
      d = t.contains(l),
      c = !1,
      u = o > 0,
      x = 0,
      b = 0
    do {
      if (!l) break
      var j = la(e, l),
        w = j[0],
        m = j[1],
        v = j[2],
        h = m - v - i * w
      ;(w || h) && oa(e, l) && ((x += h), (b += w))
      var C = l.parentNode
      l = C && C.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? C.host : C
    } while ((!d && l !== document.body) || (d && (t.contains(l) || t === l)))
    return (((u && Math.abs(x) < 1) || (!u && Math.abs(b) < 1)) && (c = !0), c)
  },
  Gt = function (e) {
    return 'changedTouches' in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0]
  },
  Xr = function (e) {
    return [e.deltaX, e.deltaY]
  },
  Qr = function (e) {
    return e && 'current' in e ? e.current : e
  },
  hc = function (e, t) {
    return e[0] === t[0] && e[1] === t[1]
  },
  gc = function (e) {
    return `
  .block-interactivity-`
      .concat(
        e,
        ` {pointer-events: none;}
  .allow-interactivity-`
      )
      .concat(
        e,
        ` {pointer-events: all;}
`
      )
  },
  xc = 0,
  gt = []
function vc(e) {
  var t = f.useRef([]),
    n = f.useRef([0, 0]),
    r = f.useRef(),
    a = f.useState(xc++)[0],
    i = f.useState(aa)[0],
    o = f.useRef(e)
  ;(f.useEffect(
    function () {
      o.current = e
    },
    [e]
  ),
    f.useEffect(
      function () {
        if (e.inert) {
          document.body.classList.add('block-interactivity-'.concat(a))
          var m = $l([e.lockRef.current], (e.shards || []).map(Qr), !0).filter(
            Boolean
          )
          return (
            m.forEach(function (v) {
              return v.classList.add('allow-interactivity-'.concat(a))
            }),
            function () {
              ;(document.body.classList.remove(
                'block-interactivity-'.concat(a)
              ),
                m.forEach(function (v) {
                  return v.classList.remove('allow-interactivity-'.concat(a))
                }))
            }
          )
        }
      },
      [e.inert, e.lockRef.current, e.shards]
    ))
  var l = f.useCallback(function (m, v) {
      if (
        ('touches' in m && m.touches.length === 2) ||
        (m.type === 'wheel' && m.ctrlKey)
      )
        return !o.current.allowPinchZoom
      var h = Gt(m),
        C = n.current,
        A = 'deltaX' in m ? m.deltaX : C[0] - h[0],
        y = 'deltaY' in m ? m.deltaY : C[1] - h[1],
        T,
        _ = m.target,
        S = Math.abs(A) > Math.abs(y) ? 'h' : 'v'
      if ('touches' in m && S === 'h' && _.type === 'range') return !1
      var N = Kr(S, _)
      if (!N) return !0
      if ((N ? (T = S) : ((T = S === 'v' ? 'h' : 'v'), (N = Kr(S, _))), !N))
        return !1
      if (
        (!r.current && 'changedTouches' in m && (A || y) && (r.current = T), !T)
      )
        return !0
      var P = r.current || T
      return pc(P, v, m, P === 'h' ? A : y)
    }, []),
    d = f.useCallback(function (m) {
      var v = m
      if (!(!gt.length || gt[gt.length - 1] !== i)) {
        var h = 'deltaY' in v ? Xr(v) : Gt(v),
          C = t.current.filter(function (T) {
            return (
              T.name === v.type &&
              (T.target === v.target || v.target === T.shadowParent) &&
              hc(T.delta, h)
            )
          })[0]
        if (C && C.should) {
          v.cancelable && v.preventDefault()
          return
        }
        if (!C) {
          var A = (o.current.shards || [])
              .map(Qr)
              .filter(Boolean)
              .filter(function (T) {
                return T.contains(v.target)
              }),
            y = A.length > 0 ? l(v, A[0]) : !o.current.noIsolation
          y && v.cancelable && v.preventDefault()
        }
      }
    }, []),
    c = f.useCallback(function (m, v, h, C) {
      var A = { name: m, delta: v, target: h, should: C, shadowParent: bc(h) }
      ;(t.current.push(A),
        setTimeout(function () {
          t.current = t.current.filter(function (y) {
            return y !== A
          })
        }, 1))
    }, []),
    u = f.useCallback(function (m) {
      ;((n.current = Gt(m)), (r.current = void 0))
    }, []),
    x = f.useCallback(function (m) {
      c(m.type, Xr(m), m.target, l(m, e.lockRef.current))
    }, []),
    b = f.useCallback(function (m) {
      c(m.type, Gt(m), m.target, l(m, e.lockRef.current))
    }, [])
  f.useEffect(function () {
    return (
      gt.push(i),
      e.setCallbacks({
        onScrollCapture: x,
        onWheelCapture: x,
        onTouchMoveCapture: b,
      }),
      document.addEventListener('wheel', d, ht),
      document.addEventListener('touchmove', d, ht),
      document.addEventListener('touchstart', u, ht),
      function () {
        ;((gt = gt.filter(function (m) {
          return m !== i
        })),
          document.removeEventListener('wheel', d, ht),
          document.removeEventListener('touchmove', d, ht),
          document.removeEventListener('touchstart', u, ht))
      }
    )
  }, [])
  var j = e.removeScrollBar,
    w = e.inert
  return f.createElement(
    f.Fragment,
    null,
    w ? f.createElement(i, { styles: gc(a) }) : null,
    j
      ? f.createElement(oc, { noRelative: e.noRelative, gapMode: e.gapMode })
      : null
  )
}
function bc(e) {
  for (var t = null; e !== null; )
    (e instanceof ShadowRoot && ((t = e.host), (e = e.host)),
      (e = e.parentNode))
  return t
}
const yc = Gl(sa, vc)
var ca = f.forwardRef(function (e, t) {
  return f.createElement(yn, Ie({}, e, { ref: t, sideCar: yc }))
})
ca.classNames = yn.classNames
var wc = [' ', 'Enter', 'ArrowUp', 'ArrowDown'],
  jc = [' ', 'Enter'],
  dt = 'Select',
  [wn, jn, Cc] = Di(dt),
  [kt] = fr(dt, [Cc, Zs]),
  Cn = Zs(),
  [Nc, nt] = kt(dt),
  [_c, Sc] = kt(dt),
  da = e => {
    const {
        __scopeSelect: t,
        children: n,
        open: r,
        defaultOpen: a,
        onOpenChange: i,
        value: o,
        defaultValue: l,
        onValueChange: d,
        dir: c,
        name: u,
        autoComplete: x,
        disabled: b,
        required: j,
        form: w,
      } = e,
      m = Cn(t),
      [v, h] = f.useState(null),
      [C, A] = f.useState(null),
      [y, T] = f.useState(!1),
      _ = zi(c),
      [S, N] = Wr({ prop: r, defaultProp: a ?? !1, onChange: i, caller: dt }),
      [P, L] = Wr({ prop: o, defaultProp: l, onChange: d, caller: dt }),
      B = f.useRef(null),
      F = v ? w || !!v.closest('form') : !0,
      [E, p] = f.useState(new Set()),
      g = Array.from(E)
        .map(k => k.props.value)
        .join(';')
    return s.jsx(Nl, {
      ...m,
      children: s.jsxs(Nc, {
        required: j,
        scope: t,
        trigger: v,
        onTriggerChange: h,
        valueNode: C,
        onValueNodeChange: A,
        valueNodeHasChildren: y,
        onValueNodeHasChildrenChange: T,
        contentId: mr(),
        value: P,
        onValueChange: L,
        open: S,
        onOpenChange: N,
        dir: _,
        triggerPointerDownPosRef: B,
        disabled: b,
        children: [
          s.jsx(wn.Provider, {
            scope: t,
            children: s.jsx(_c, {
              scope: e.__scopeSelect,
              onNativeOptionAdd: f.useCallback(k => {
                p(O => new Set(O).add(k))
              }, []),
              onNativeOptionRemove: f.useCallback(k => {
                p(O => {
                  const I = new Set(O)
                  return (I.delete(k), I)
                })
              }, []),
              children: n,
            }),
          }),
          F
            ? s.jsxs(
                Oa,
                {
                  'aria-hidden': !0,
                  required: j,
                  tabIndex: -1,
                  name: u,
                  autoComplete: x,
                  value: P,
                  onChange: k => L(k.target.value),
                  disabled: b,
                  form: w,
                  children: [
                    P === void 0 ? s.jsx('option', { value: '' }) : null,
                    Array.from(E),
                  ],
                },
                g
              )
            : null,
        ],
      }),
    })
  }
da.displayName = dt
var ua = 'SelectTrigger',
  fa = f.forwardRef((e, t) => {
    const { __scopeSelect: n, disabled: r = !1, ...a } = e,
      i = Cn(n),
      o = nt(ua, n),
      l = o.disabled || r,
      d = fe(t, o.onTriggerChange),
      c = jn(n),
      u = f.useRef('touch'),
      [x, b, j] = Ma(m => {
        const v = c().filter(A => !A.disabled),
          h = v.find(A => A.value === o.value),
          C = za(v, m, h)
        C !== void 0 && o.onValueChange(C.value)
      }),
      w = m => {
        ;(l || (o.onOpenChange(!0), j()),
          m &&
            (o.triggerPointerDownPosRef.current = {
              x: Math.round(m.pageX),
              y: Math.round(m.pageY),
            }))
      }
    return s.jsx(_l, {
      asChild: !0,
      ...i,
      children: s.jsx(ae.button, {
        type: 'button',
        role: 'combobox',
        'aria-controls': o.contentId,
        'aria-expanded': o.open,
        'aria-required': o.required,
        'aria-autocomplete': 'none',
        dir: o.dir,
        'data-state': o.open ? 'open' : 'closed',
        disabled: l,
        'data-disabled': l ? '' : void 0,
        'data-placeholder': Da(o.value) ? '' : void 0,
        ...a,
        ref: d,
        onClick: ce(a.onClick, m => {
          ;(m.currentTarget.focus(), u.current !== 'mouse' && w(m))
        }),
        onPointerDown: ce(a.onPointerDown, m => {
          u.current = m.pointerType
          const v = m.target
          ;(v.hasPointerCapture(m.pointerId) &&
            v.releasePointerCapture(m.pointerId),
            m.button === 0 &&
              m.ctrlKey === !1 &&
              m.pointerType === 'mouse' &&
              (w(m), m.preventDefault()))
        }),
        onKeyDown: ce(a.onKeyDown, m => {
          const v = x.current !== ''
          ;(!(m.ctrlKey || m.altKey || m.metaKey) &&
            m.key.length === 1 &&
            b(m.key),
            !(v && m.key === ' ') &&
              wc.includes(m.key) &&
              (w(), m.preventDefault()))
        }),
      }),
    })
  })
fa.displayName = ua
var ma = 'SelectValue',
  pa = f.forwardRef((e, t) => {
    const {
        __scopeSelect: n,
        className: r,
        style: a,
        children: i,
        placeholder: o = '',
        ...l
      } = e,
      d = nt(ma, n),
      { onValueNodeHasChildrenChange: c } = d,
      u = i !== void 0,
      x = fe(t, d.onValueNodeChange)
    return (
      ge(() => {
        c(u)
      }, [c, u]),
      s.jsx(ae.span, {
        ...l,
        ref: x,
        style: { pointerEvents: 'none' },
        children: Da(d.value) ? s.jsx(s.Fragment, { children: o }) : i,
      })
    )
  })
pa.displayName = ma
var Ac = 'SelectIcon',
  ha = f.forwardRef((e, t) => {
    const { __scopeSelect: n, children: r, ...a } = e
    return s.jsx(ae.span, {
      'aria-hidden': !0,
      ...a,
      ref: t,
      children: r || '▼',
    })
  })
ha.displayName = Ac
var Tc = 'SelectPortal',
  ga = e => s.jsx(Js, { asChild: !0, ...e })
ga.displayName = Tc
var ut = 'SelectContent',
  xa = f.forwardRef((e, t) => {
    const n = nt(ut, e.__scopeSelect),
      [r, a] = f.useState()
    if (
      (ge(() => {
        a(new DocumentFragment())
      }, []),
      !n.open)
    ) {
      const i = r
      return i
        ? hn.createPortal(
            s.jsx(va, {
              scope: e.__scopeSelect,
              children: s.jsx(wn.Slot, {
                scope: e.__scopeSelect,
                children: s.jsx('div', { children: e.children }),
              }),
            }),
            i
          )
        : null
    }
    return s.jsx(ba, { ...e, ref: t })
  })
xa.displayName = ut
var Ae = 10,
  [va, rt] = kt(ut),
  Ec = 'SelectContentImpl',
  kc = tn('SelectContent.RemoveScroll'),
  ba = f.forwardRef((e, t) => {
    const {
        __scopeSelect: n,
        position: r = 'item-aligned',
        onCloseAutoFocus: a,
        onEscapeKeyDown: i,
        onPointerDownOutside: o,
        side: l,
        sideOffset: d,
        align: c,
        alignOffset: u,
        arrowPadding: x,
        collisionBoundary: b,
        collisionPadding: j,
        sticky: w,
        hideWhenDetached: m,
        avoidCollisions: v,
        ...h
      } = e,
      C = nt(ut, n),
      [A, y] = f.useState(null),
      [T, _] = f.useState(null),
      S = fe(t, V => y(V)),
      [N, P] = f.useState(null),
      [L, B] = f.useState(null),
      F = jn(n),
      [E, p] = f.useState(!1),
      g = f.useRef(!1)
    ;(f.useEffect(() => {
      if (A) return Ll(A)
    }, [A]),
      Gi())
    const k = f.useCallback(
        V => {
          const [ee, ...pe] = F().map(oe => oe.ref.current),
            [X] = pe.slice(-1),
            te = document.activeElement
          for (const oe of V)
            if (
              oe === te ||
              (oe?.scrollIntoView({ block: 'nearest' }),
              oe === ee && T && (T.scrollTop = 0),
              oe === X && T && (T.scrollTop = T.scrollHeight),
              oe?.focus(),
              document.activeElement !== te)
            )
              return
        },
        [F, T]
      ),
      O = f.useCallback(() => k([N, A]), [k, N, A])
    f.useEffect(() => {
      E && O()
    }, [E, O])
    const { onOpenChange: I, triggerPointerDownPosRef: M } = C
    ;(f.useEffect(() => {
      if (A) {
        let V = { x: 0, y: 0 }
        const ee = X => {
            V = {
              x: Math.abs(Math.round(X.pageX) - (M.current?.x ?? 0)),
              y: Math.abs(Math.round(X.pageY) - (M.current?.y ?? 0)),
            }
          },
          pe = X => {
            ;(V.x <= 10 && V.y <= 10
              ? X.preventDefault()
              : A.contains(X.target) || I(!1),
              document.removeEventListener('pointermove', ee),
              (M.current = null))
          }
        return (
          M.current !== null &&
            (document.addEventListener('pointermove', ee),
            document.addEventListener('pointerup', pe, {
              capture: !0,
              once: !0,
            })),
          () => {
            ;(document.removeEventListener('pointermove', ee),
              document.removeEventListener('pointerup', pe, { capture: !0 }))
          }
        )
      }
    }, [A, I, M]),
      f.useEffect(() => {
        const V = () => I(!1)
        return (
          window.addEventListener('blur', V),
          window.addEventListener('resize', V),
          () => {
            ;(window.removeEventListener('blur', V),
              window.removeEventListener('resize', V))
          }
        )
      }, [I]))
    const [q, Q] = Ma(V => {
        const ee = F().filter(te => !te.disabled),
          pe = ee.find(te => te.ref.current === document.activeElement),
          X = za(ee, V, pe)
        X && setTimeout(() => X.ref.current.focus())
      }),
      ne = f.useCallback(
        (V, ee, pe) => {
          const X = !g.current && !pe
          ;((C.value !== void 0 && C.value === ee) || X) &&
            (P(V), X && (g.current = !0))
        },
        [C.value]
      ),
      J = f.useCallback(() => A?.focus(), [A]),
      de = f.useCallback(
        (V, ee, pe) => {
          const X = !g.current && !pe
          ;((C.value !== void 0 && C.value === ee) || X) && B(V)
        },
        [C.value]
      ),
      ie = r === 'popper' ? Wn : ya,
      me =
        ie === Wn
          ? {
              side: l,
              sideOffset: d,
              align: c,
              alignOffset: u,
              arrowPadding: x,
              collisionBoundary: b,
              collisionPadding: j,
              sticky: w,
              hideWhenDetached: m,
              avoidCollisions: v,
            }
          : {}
    return s.jsx(va, {
      scope: n,
      content: A,
      viewport: T,
      onViewportChange: _,
      itemRefCallback: ne,
      selectedItem: N,
      onItemLeave: J,
      itemTextRefCallback: de,
      focusSelectedItem: O,
      selectedItemText: L,
      position: r,
      isPositioned: E,
      searchRef: q,
      children: s.jsx(ca, {
        as: kc,
        allowPinchZoom: !0,
        children: s.jsx(Es, {
          asChild: !0,
          trapped: C.open,
          onMountAutoFocus: V => {
            V.preventDefault()
          },
          onUnmountAutoFocus: ce(a, V => {
            ;(C.trigger?.focus({ preventScroll: !0 }), V.preventDefault())
          }),
          children: s.jsx(As, {
            asChild: !0,
            disableOutsidePointerEvents: !0,
            onEscapeKeyDown: i,
            onPointerDownOutside: o,
            onFocusOutside: V => V.preventDefault(),
            onDismiss: () => C.onOpenChange(!1),
            children: s.jsx(ie, {
              role: 'listbox',
              id: C.contentId,
              'data-state': C.open ? 'open' : 'closed',
              dir: C.dir,
              onContextMenu: V => V.preventDefault(),
              ...h,
              ...me,
              onPlaced: () => p(!0),
              ref: S,
              style: {
                display: 'flex',
                flexDirection: 'column',
                outline: 'none',
                ...h.style,
              },
              onKeyDown: ce(h.onKeyDown, V => {
                const ee = V.ctrlKey || V.altKey || V.metaKey
                if (
                  (V.key === 'Tab' && V.preventDefault(),
                  !ee && V.key.length === 1 && Q(V.key),
                  ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(V.key))
                ) {
                  let X = F()
                    .filter(te => !te.disabled)
                    .map(te => te.ref.current)
                  if (
                    (['ArrowUp', 'End'].includes(V.key) &&
                      (X = X.slice().reverse()),
                    ['ArrowUp', 'ArrowDown'].includes(V.key))
                  ) {
                    const te = V.target,
                      oe = X.indexOf(te)
                    X = X.slice(oe + 1)
                  }
                  ;(setTimeout(() => k(X)), V.preventDefault())
                }
              }),
            }),
          }),
        }),
      }),
    })
  })
ba.displayName = Ec
var Rc = 'SelectItemAlignedPosition',
  ya = f.forwardRef((e, t) => {
    const { __scopeSelect: n, onPlaced: r, ...a } = e,
      i = nt(ut, n),
      o = rt(ut, n),
      [l, d] = f.useState(null),
      [c, u] = f.useState(null),
      x = fe(t, S => u(S)),
      b = jn(n),
      j = f.useRef(!1),
      w = f.useRef(!0),
      {
        viewport: m,
        selectedItem: v,
        selectedItemText: h,
        focusSelectedItem: C,
      } = o,
      A = f.useCallback(() => {
        if (i.trigger && i.valueNode && l && c && m && v && h) {
          const S = i.trigger.getBoundingClientRect(),
            N = c.getBoundingClientRect(),
            P = i.valueNode.getBoundingClientRect(),
            L = h.getBoundingClientRect()
          if (i.dir !== 'rtl') {
            const te = L.left - N.left,
              oe = P.left - te,
              je = S.left - oe,
              st = S.width + je,
              Nn = Math.max(st, N.width),
              _n = window.innerWidth - Ae,
              Sn = Ar(oe, [Ae, Math.max(Ae, _n - Nn)])
            ;((l.style.minWidth = st + 'px'), (l.style.left = Sn + 'px'))
          } else {
            const te = N.right - L.right,
              oe = window.innerWidth - P.right - te,
              je = window.innerWidth - S.right - oe,
              st = S.width + je,
              Nn = Math.max(st, N.width),
              _n = window.innerWidth - Ae,
              Sn = Ar(oe, [Ae, Math.max(Ae, _n - Nn)])
            ;((l.style.minWidth = st + 'px'), (l.style.right = Sn + 'px'))
          }
          const B = b(),
            F = window.innerHeight - Ae * 2,
            E = m.scrollHeight,
            p = window.getComputedStyle(c),
            g = parseInt(p.borderTopWidth, 10),
            k = parseInt(p.paddingTop, 10),
            O = parseInt(p.borderBottomWidth, 10),
            I = parseInt(p.paddingBottom, 10),
            M = g + k + E + I + O,
            q = Math.min(v.offsetHeight * 5, M),
            Q = window.getComputedStyle(m),
            ne = parseInt(Q.paddingTop, 10),
            J = parseInt(Q.paddingBottom, 10),
            de = S.top + S.height / 2 - Ae,
            ie = F - de,
            me = v.offsetHeight / 2,
            V = v.offsetTop + me,
            ee = g + k + V,
            pe = M - ee
          if (ee <= de) {
            const te = B.length > 0 && v === B[B.length - 1].ref.current
            l.style.bottom = '0px'
            const oe = c.clientHeight - m.offsetTop - m.offsetHeight,
              je = Math.max(ie, me + (te ? J : 0) + oe + O),
              st = ee + je
            l.style.height = st + 'px'
          } else {
            const te = B.length > 0 && v === B[0].ref.current
            l.style.top = '0px'
            const je = Math.max(de, g + m.offsetTop + (te ? ne : 0) + me) + pe
            ;((l.style.height = je + 'px'),
              (m.scrollTop = ee - de + m.offsetTop))
          }
          ;((l.style.margin = `${Ae}px 0`),
            (l.style.minHeight = q + 'px'),
            (l.style.maxHeight = F + 'px'),
            r?.(),
            requestAnimationFrame(() => (j.current = !0)))
        }
      }, [b, i.trigger, i.valueNode, l, c, m, v, h, i.dir, r])
    ge(() => A(), [A])
    const [y, T] = f.useState()
    ge(() => {
      c && T(window.getComputedStyle(c).zIndex)
    }, [c])
    const _ = f.useCallback(
      S => {
        S && w.current === !0 && (A(), C?.(), (w.current = !1))
      },
      [A, C]
    )
    return s.jsx(Pc, {
      scope: n,
      contentWrapper: l,
      shouldExpandOnScrollRef: j,
      onScrollButtonChange: _,
      children: s.jsx('div', {
        ref: d,
        style: {
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          zIndex: y,
        },
        children: s.jsx(ae.div, {
          ...a,
          ref: x,
          style: { boxSizing: 'border-box', maxHeight: '100%', ...a.style },
        }),
      }),
    })
  })
ya.displayName = Rc
var Ic = 'SelectPopperPosition',
  Wn = f.forwardRef((e, t) => {
    const {
        __scopeSelect: n,
        align: r = 'start',
        collisionPadding: a = Ae,
        ...i
      } = e,
      o = Cn(n)
    return s.jsx(Sl, {
      ...o,
      ...i,
      ref: t,
      align: r,
      collisionPadding: a,
      style: {
        boxSizing: 'border-box',
        ...i.style,
        '--radix-select-content-transform-origin':
          'var(--radix-popper-transform-origin)',
        '--radix-select-content-available-width':
          'var(--radix-popper-available-width)',
        '--radix-select-content-available-height':
          'var(--radix-popper-available-height)',
        '--radix-select-trigger-width': 'var(--radix-popper-anchor-width)',
        '--radix-select-trigger-height': 'var(--radix-popper-anchor-height)',
      },
    })
  })
Wn.displayName = Ic
var [Pc, jr] = kt(ut, {}),
  Gn = 'SelectViewport',
  wa = f.forwardRef((e, t) => {
    const { __scopeSelect: n, nonce: r, ...a } = e,
      i = rt(Gn, n),
      o = jr(Gn, n),
      l = fe(t, i.onViewportChange),
      d = f.useRef(0)
    return s.jsxs(s.Fragment, {
      children: [
        s.jsx('style', {
          dangerouslySetInnerHTML: {
            __html:
              '[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}',
          },
          nonce: r,
        }),
        s.jsx(wn.Slot, {
          scope: n,
          children: s.jsx(ae.div, {
            'data-radix-select-viewport': '',
            role: 'presentation',
            ...a,
            ref: l,
            style: {
              position: 'relative',
              flex: 1,
              overflow: 'hidden auto',
              ...a.style,
            },
            onScroll: ce(a.onScroll, c => {
              const u = c.currentTarget,
                { contentWrapper: x, shouldExpandOnScrollRef: b } = o
              if (b?.current && x) {
                const j = Math.abs(d.current - u.scrollTop)
                if (j > 0) {
                  const w = window.innerHeight - Ae * 2,
                    m = parseFloat(x.style.minHeight),
                    v = parseFloat(x.style.height),
                    h = Math.max(m, v)
                  if (h < w) {
                    const C = h + j,
                      A = Math.min(w, C),
                      y = C - A
                    ;((x.style.height = A + 'px'),
                      x.style.bottom === '0px' &&
                        ((u.scrollTop = y > 0 ? y : 0),
                        (x.style.justifyContent = 'flex-end')))
                  }
                }
              }
              d.current = u.scrollTop
            }),
          }),
        }),
      ],
    })
  })
wa.displayName = Gn
var ja = 'SelectGroup',
  [Oc, Dc] = kt(ja),
  Mc = f.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e,
      a = mr()
    return s.jsx(Oc, {
      scope: n,
      id: a,
      children: s.jsx(ae.div, {
        role: 'group',
        'aria-labelledby': a,
        ...r,
        ref: t,
      }),
    })
  })
Mc.displayName = ja
var Ca = 'SelectLabel',
  Na = f.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e,
      a = Dc(Ca, n)
    return s.jsx(ae.div, { id: a.id, ...r, ref: t })
  })
Na.displayName = Ca
var on = 'SelectItem',
  [zc, _a] = kt(on),
  Sa = f.forwardRef((e, t) => {
    const {
        __scopeSelect: n,
        value: r,
        disabled: a = !1,
        textValue: i,
        ...o
      } = e,
      l = nt(on, n),
      d = rt(on, n),
      c = l.value === r,
      [u, x] = f.useState(i ?? ''),
      [b, j] = f.useState(!1),
      w = fe(t, C => d.itemRefCallback?.(C, r, a)),
      m = mr(),
      v = f.useRef('touch'),
      h = () => {
        a || (l.onValueChange(r), l.onOpenChange(!1))
      }
    if (r === '')
      throw new Error(
        'A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.'
      )
    return s.jsx(zc, {
      scope: n,
      value: r,
      disabled: a,
      textId: m,
      isSelected: c,
      onItemTextChange: f.useCallback(C => {
        x(A => A || (C?.textContent ?? '').trim())
      }, []),
      children: s.jsx(wn.ItemSlot, {
        scope: n,
        value: r,
        disabled: a,
        textValue: u,
        children: s.jsx(ae.div, {
          role: 'option',
          'aria-labelledby': m,
          'data-highlighted': b ? '' : void 0,
          'aria-selected': c && b,
          'data-state': c ? 'checked' : 'unchecked',
          'aria-disabled': a || void 0,
          'data-disabled': a ? '' : void 0,
          tabIndex: a ? void 0 : -1,
          ...o,
          ref: w,
          onFocus: ce(o.onFocus, () => j(!0)),
          onBlur: ce(o.onBlur, () => j(!1)),
          onClick: ce(o.onClick, () => {
            v.current !== 'mouse' && h()
          }),
          onPointerUp: ce(o.onPointerUp, () => {
            v.current === 'mouse' && h()
          }),
          onPointerDown: ce(o.onPointerDown, C => {
            v.current = C.pointerType
          }),
          onPointerMove: ce(o.onPointerMove, C => {
            ;((v.current = C.pointerType),
              a
                ? d.onItemLeave?.()
                : v.current === 'mouse' &&
                  C.currentTarget.focus({ preventScroll: !0 }))
          }),
          onPointerLeave: ce(o.onPointerLeave, C => {
            C.currentTarget === document.activeElement && d.onItemLeave?.()
          }),
          onKeyDown: ce(o.onKeyDown, C => {
            ;(d.searchRef?.current !== '' && C.key === ' ') ||
              (jc.includes(C.key) && h(), C.key === ' ' && C.preventDefault())
          }),
        }),
      }),
    })
  })
Sa.displayName = on
var Ot = 'SelectItemText',
  Aa = f.forwardRef((e, t) => {
    const { __scopeSelect: n, className: r, style: a, ...i } = e,
      o = nt(Ot, n),
      l = rt(Ot, n),
      d = _a(Ot, n),
      c = Sc(Ot, n),
      [u, x] = f.useState(null),
      b = fe(
        t,
        h => x(h),
        d.onItemTextChange,
        h => l.itemTextRefCallback?.(h, d.value, d.disabled)
      ),
      j = u?.textContent,
      w = f.useMemo(
        () =>
          s.jsx(
            'option',
            { value: d.value, disabled: d.disabled, children: j },
            d.value
          ),
        [d.disabled, d.value, j]
      ),
      { onNativeOptionAdd: m, onNativeOptionRemove: v } = c
    return (
      ge(() => (m(w), () => v(w)), [m, v, w]),
      s.jsxs(s.Fragment, {
        children: [
          s.jsx(ae.span, { id: d.textId, ...i, ref: b }),
          d.isSelected && o.valueNode && !o.valueNodeHasChildren
            ? hn.createPortal(i.children, o.valueNode)
            : null,
        ],
      })
    )
  })
Aa.displayName = Ot
var Ta = 'SelectItemIndicator',
  Ea = f.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e
    return _a(Ta, n).isSelected
      ? s.jsx(ae.span, { 'aria-hidden': !0, ...r, ref: t })
      : null
  })
Ea.displayName = Ta
var Yn = 'SelectScrollUpButton',
  ka = f.forwardRef((e, t) => {
    const n = rt(Yn, e.__scopeSelect),
      r = jr(Yn, e.__scopeSelect),
      [a, i] = f.useState(!1),
      o = fe(t, r.onScrollButtonChange)
    return (
      ge(() => {
        if (n.viewport && n.isPositioned) {
          let l = function () {
            const c = d.scrollTop > 0
            i(c)
          }
          const d = n.viewport
          return (
            l(),
            d.addEventListener('scroll', l),
            () => d.removeEventListener('scroll', l)
          )
        }
      }, [n.viewport, n.isPositioned]),
      a
        ? s.jsx(Ia, {
            ...e,
            ref: o,
            onAutoScroll: () => {
              const { viewport: l, selectedItem: d } = n
              l && d && (l.scrollTop = l.scrollTop - d.offsetHeight)
            },
          })
        : null
    )
  })
ka.displayName = Yn
var Kn = 'SelectScrollDownButton',
  Ra = f.forwardRef((e, t) => {
    const n = rt(Kn, e.__scopeSelect),
      r = jr(Kn, e.__scopeSelect),
      [a, i] = f.useState(!1),
      o = fe(t, r.onScrollButtonChange)
    return (
      ge(() => {
        if (n.viewport && n.isPositioned) {
          let l = function () {
            const c = d.scrollHeight - d.clientHeight,
              u = Math.ceil(d.scrollTop) < c
            i(u)
          }
          const d = n.viewport
          return (
            l(),
            d.addEventListener('scroll', l),
            () => d.removeEventListener('scroll', l)
          )
        }
      }, [n.viewport, n.isPositioned]),
      a
        ? s.jsx(Ia, {
            ...e,
            ref: o,
            onAutoScroll: () => {
              const { viewport: l, selectedItem: d } = n
              l && d && (l.scrollTop = l.scrollTop + d.offsetHeight)
            },
          })
        : null
    )
  })
Ra.displayName = Kn
var Ia = f.forwardRef((e, t) => {
    const { __scopeSelect: n, onAutoScroll: r, ...a } = e,
      i = rt('SelectScrollButton', n),
      o = f.useRef(null),
      l = jn(n),
      d = f.useCallback(() => {
        o.current !== null &&
          (window.clearInterval(o.current), (o.current = null))
      }, [])
    return (
      f.useEffect(() => () => d(), [d]),
      ge(() => {
        l()
          .find(u => u.ref.current === document.activeElement)
          ?.ref.current?.scrollIntoView({ block: 'nearest' })
      }, [l]),
      s.jsx(ae.div, {
        'aria-hidden': !0,
        ...a,
        ref: t,
        style: { flexShrink: 0, ...a.style },
        onPointerDown: ce(a.onPointerDown, () => {
          o.current === null && (o.current = window.setInterval(r, 50))
        }),
        onPointerMove: ce(a.onPointerMove, () => {
          ;(i.onItemLeave?.(),
            o.current === null && (o.current = window.setInterval(r, 50)))
        }),
        onPointerLeave: ce(a.onPointerLeave, () => {
          d()
        }),
      })
    )
  }),
  Lc = 'SelectSeparator',
  Pa = f.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e
    return s.jsx(ae.div, { 'aria-hidden': !0, ...r, ref: t })
  })
Pa.displayName = Lc
var Xn = 'SelectArrow',
  $c = f.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e,
      a = Cn(n),
      i = nt(Xn, n),
      o = rt(Xn, n)
    return i.open && o.position === 'popper'
      ? s.jsx(Al, { ...a, ...r, ref: t })
      : null
  })
$c.displayName = Xn
var Bc = 'SelectBubbleInput',
  Oa = f.forwardRef(({ __scopeSelect: e, value: t, ...n }, r) => {
    const a = f.useRef(null),
      i = fe(r, a),
      o = Il(t)
    return (
      f.useEffect(() => {
        const l = a.current
        if (!l) return
        const d = window.HTMLSelectElement.prototype,
          u = Object.getOwnPropertyDescriptor(d, 'value').set
        if (o !== t && u) {
          const x = new Event('change', { bubbles: !0 })
          ;(u.call(l, t), l.dispatchEvent(x))
        }
      }, [o, t]),
      s.jsx(ae.select, {
        ...n,
        style: { ...ea, ...n.style },
        ref: i,
        defaultValue: t,
      })
    )
  })
Oa.displayName = Bc
function Da(e) {
  return e === '' || e === void 0
}
function Ma(e) {
  const t = lt(e),
    n = f.useRef(''),
    r = f.useRef(0),
    a = f.useCallback(
      o => {
        const l = n.current + o
        ;(t(l),
          (function d(c) {
            ;((n.current = c),
              window.clearTimeout(r.current),
              c !== '' && (r.current = window.setTimeout(() => d(''), 1e3)))
          })(l))
      },
      [t]
    ),
    i = f.useCallback(() => {
      ;((n.current = ''), window.clearTimeout(r.current))
    }, [])
  return (
    f.useEffect(() => () => window.clearTimeout(r.current), []),
    [n, a, i]
  )
}
function za(e, t, n) {
  const a = t.length > 1 && Array.from(t).every(c => c === t[0]) ? t[0] : t,
    i = n ? e.indexOf(n) : -1
  let o = Fc(e, Math.max(i, 0))
  a.length === 1 && (o = o.filter(c => c !== n))
  const d = o.find(c => c.textValue.toLowerCase().startsWith(a.toLowerCase()))
  return d !== n ? d : void 0
}
function Fc(e, t) {
  return e.map((n, r) => e[(t + r) % e.length])
}
var Vc = da,
  La = fa,
  Hc = pa,
  Zc = ha,
  qc = ga,
  $a = xa,
  Uc = wa,
  Ba = Na,
  Fa = Sa,
  Wc = Aa,
  Gc = Ea,
  Va = ka,
  Ha = Ra,
  Za = Pa
const Te = Vc,
  Ee = Hc,
  Ce = f.forwardRef(({ className: e, children: t, ...n }, r) =>
    s.jsxs(La, {
      ref: r,
      className: _e(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        e
      ),
      ...n,
      children: [
        t,
        s.jsx(Zc, {
          asChild: !0,
          children: s.jsx(js, { className: 'h-4 w-4 opacity-50' }),
        }),
      ],
    })
  )
Ce.displayName = La.displayName
const qa = f.forwardRef(({ className: e, ...t }, n) =>
  s.jsx(Va, {
    ref: n,
    className: _e('flex cursor-default items-center justify-center py-1', e),
    ...t,
    children: s.jsx(ci, { className: 'h-4 w-4' }),
  })
)
qa.displayName = Va.displayName
const Ua = f.forwardRef(({ className: e, ...t }, n) =>
  s.jsx(Ha, {
    ref: n,
    className: _e('flex cursor-default items-center justify-center py-1', e),
    ...t,
    children: s.jsx(js, { className: 'h-4 w-4' }),
  })
)
Ua.displayName = Ha.displayName
const Ne = f.forwardRef(
  ({ className: e, children: t, position: n = 'popper', ...r }, a) =>
    s.jsx(qc, {
      children: s.jsxs($a, {
        ref: a,
        className: _e(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          n === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          e
        ),
        position: n,
        ...r,
        children: [
          s.jsx(qa, {}),
          s.jsx(Uc, {
            className: _e(
              'p-1',
              n === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            ),
            children: t,
          }),
          s.jsx(Ua, {}),
        ],
      }),
    })
)
Ne.displayName = $a.displayName
const Yc = f.forwardRef(({ className: e, ...t }, n) =>
  s.jsx(Ba, {
    ref: n,
    className: _e('py-1.5 pl-8 pr-2 text-sm font-semibold', e),
    ...t,
  })
)
Yc.displayName = Ba.displayName
const Wa = f.forwardRef(({ className: e, children: t, ...n }, r) =>
  s.jsxs(Fa, {
    ref: r,
    className: _e(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      e
    ),
    ...n,
    children: [
      s.jsx('span', {
        className:
          'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
        children: s.jsx(Gc, { children: s.jsx(di, { className: 'h-4 w-4' }) }),
      }),
      s.jsx(Wc, { children: t }),
    ],
  })
)
Wa.displayName = Fa.displayName
const Kc = f.forwardRef(({ className: e, ...t }, n) =>
  s.jsx(Za, { ref: n, className: _e('-mx-1 my-1 h-px bg-muted', e), ...t })
)
Kc.displayName = Za.displayName
const se = ({ children: e, ...t }) =>
    s.jsx(Wa, { ...t, value: t.value, children: e }),
  Ht = xe.forwardRef(({ className: e, ...t }, n) =>
    s.jsx('textarea', {
      className: _e(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        e
      ),
      ref: n,
      ...t,
    })
  )
Ht.displayName = 'Textarea'
var Xc = /\s+/g,
  Qn = e => (typeof e != 'string' || !e ? e : e.replace(Xc, ' ').trim()),
  ln = (...e) => {
    let t = [],
      n = r => {
        if (!r && r !== 0 && r !== 0n) return
        if (Array.isArray(r)) {
          for (let i = 0, o = r.length; i < o; i++) n(r[i])
          return
        }
        let a = typeof r
        if (a === 'string' || a === 'number' || a === 'bigint') {
          if (a === 'number' && r !== r) return
          t.push(String(r))
        } else if (a === 'object') {
          let i = Object.keys(r)
          for (let o = 0, l = i.length; o < l; o++) {
            let d = i[o]
            r[d] && t.push(d)
          }
        }
      }
    for (let r = 0, a = e.length; r < a; r++) {
      let i = e[r]
      i != null && n(i)
    }
    return t.length > 0 ? Qn(t.join(' ')) : void 0
  },
  Jr = e => (e === !1 ? 'false' : e === !0 ? 'true' : e === 0 ? '0' : e),
  he = e => {
    if (!e || typeof e != 'object') return !0
    for (let t in e) return !1
    return !0
  },
  Qc = (e, t) => {
    if (e === t) return !0
    if (!e || !t) return !1
    let n = Object.keys(e),
      r = Object.keys(t)
    if (n.length !== r.length) return !1
    for (let a = 0; a < n.length; a++) {
      let i = n[a]
      if (!r.includes(i) || e[i] !== t[i]) return !1
    }
    return !0
  },
  es = (e, t) => {
    for (let n in t)
      if (Object.prototype.hasOwnProperty.call(t, n)) {
        let r = t[n]
        n in e ? (e[n] = ln(e[n], r)) : (e[n] = r)
      }
    return e
  },
  Ga = (e, t) => {
    for (let n = 0; n < e.length; n++) {
      let r = e[n]
      Array.isArray(r) ? Ga(r, t) : r && t.push(r)
    }
  },
  Ya = (...e) => {
    let t = []
    Ga(e, t)
    let n = []
    for (let r = 0; r < t.length; r++) t[r] && n.push(t[r])
    return n
  },
  Jn = (e, t) => {
    let n = {}
    for (let r in e) {
      let a = e[r]
      if (r in t) {
        let i = t[r]
        Array.isArray(a) || Array.isArray(i)
          ? (n[r] = Ya(i, a))
          : typeof a == 'object' && typeof i == 'object' && a && i
            ? (n[r] = Jn(a, i))
            : (n[r] = i + ' ' + a)
      } else n[r] = a
    }
    for (let r in t) r in e || (n[r] = t[r])
    return n
  },
  Jc = { twMerge: !0, twMergeConfig: {}, responsiveVariants: !1 }
function ed() {
  let e = null,
    t = {},
    n = !1
  return {
    get cachedTwMerge() {
      return e
    },
    set cachedTwMerge(r) {
      e = r
    },
    get cachedTwMergeConfig() {
      return t
    },
    set cachedTwMergeConfig(r) {
      t = r
    },
    get didTwMergeConfigChange() {
      return n
    },
    set didTwMergeConfigChange(r) {
      n = r
    },
    reset() {
      ;((e = null), (t = {}), (n = !1))
    },
  }
}
var Be = ed(),
  td = e => {
    let t = (n, r) => {
      let {
          extend: a = null,
          slots: i = {},
          variants: o = {},
          compoundVariants: l = [],
          compoundSlots: d = [],
          defaultVariants: c = {},
        } = n,
        u = { ...Jc, ...r },
        x = a?.base ? ln(a.base, n?.base) : n?.base,
        b = a?.variants && !he(a.variants) ? Jn(o, a.variants) : o,
        j =
          a?.defaultVariants && !he(a.defaultVariants)
            ? { ...a.defaultVariants, ...c }
            : c
      !he(u.twMergeConfig) &&
        !Qc(u.twMergeConfig, Be.cachedTwMergeConfig) &&
        ((Be.didTwMergeConfigChange = !0),
        (Be.cachedTwMergeConfig = u.twMergeConfig))
      let w = he(a?.slots),
        m = he(i) ? {} : { base: ln(n?.base, w && a?.base), ...i },
        v = w ? m : es({ ...a?.slots }, he(m) ? { base: n?.base } : m),
        h = he(a?.compoundVariants) ? l : Ya(a?.compoundVariants, l),
        C = y => {
          if (he(b) && he(i) && w) return e(x, y?.class, y?.className)(u)
          if (h && !Array.isArray(h))
            throw new TypeError(
              `The "compoundVariants" prop must be an array. Received: ${typeof h}`
            )
          if (d && !Array.isArray(d))
            throw new TypeError(
              `The "compoundSlots" prop must be an array. Received: ${typeof d}`
            )
          let T = (p, g, k = [], O) => {
              let I = k
              if (typeof g == 'string') {
                let M = Qn(g).split(' ')
                for (let q = 0; q < M.length; q++) I.push(`${p}:${M[q]}`)
              } else if (Array.isArray(g))
                for (let M = 0; M < g.length; M++) I.push(`${p}:${g[M]}`)
              else if (typeof g == 'object' && typeof O == 'string' && O in g) {
                let M = g[O]
                if (M && typeof M == 'string') {
                  let q = Qn(M).split(' '),
                    Q = []
                  for (let ne = 0; ne < q.length; ne++) Q.push(`${p}:${q[ne]}`)
                  I[O] = I[O] ? I[O].concat(Q) : Q
                } else if (Array.isArray(M) && M.length > 0) {
                  let q = []
                  for (let Q = 0; Q < M.length; Q++) q.push(`${p}:${M[Q]}`)
                  I[O] = q
                }
              }
              return I
            },
            _ = (p, g = b, k = null, O = null) => {
              let I = g[p]
              if (!I || he(I)) return null
              let M = O?.[p] ?? y?.[p]
              if (M === null) return null
              let q = Jr(M),
                Q =
                  (Array.isArray(u.responsiveVariants) &&
                    u.responsiveVariants.length > 0) ||
                  u.responsiveVariants === !0,
                ne = j?.[p],
                J = []
              if (typeof q == 'object' && Q)
                for (let [me, V] of Object.entries(q)) {
                  let ee = I[V]
                  if (me === 'initial') {
                    ne = V
                    continue
                  }
                  ;(Array.isArray(u.responsiveVariants) &&
                    !u.responsiveVariants.includes(me)) ||
                    (J = T(me, ee, J, k))
                }
              let de = q != null && typeof q != 'object' ? q : Jr(ne),
                ie = I[de || 'false']
              return typeof J == 'object' && typeof k == 'string' && J[k]
                ? es(J, ie)
                : J.length > 0
                  ? (J.push(ie), k === 'base' ? J.join(' ') : J)
                  : ie
            },
            S = () => {
              if (!b) return null
              let p = Object.keys(b),
                g = []
              for (let k = 0; k < p.length; k++) {
                let O = _(p[k], b)
                O && g.push(O)
              }
              return g
            },
            N = (p, g) => {
              if (!b || typeof b != 'object') return null
              let k = []
              for (let O in b) {
                let I = _(O, b, p, g),
                  M = p === 'base' && typeof I == 'string' ? I : I && I[p]
                M && k.push(M)
              }
              return k
            },
            P = {}
          for (let p in y) {
            let g = y[p]
            g !== void 0 && (P[p] = g)
          }
          let L = (p, g) => {
              let k = typeof y?.[p] == 'object' ? { [p]: y[p]?.initial } : {}
              return { ...j, ...P, ...k, ...g }
            },
            B = (p = [], g) => {
              let k = [],
                O = p.length
              for (let I = 0; I < O; I++) {
                let { class: M, className: q, ...Q } = p[I],
                  ne = !0,
                  J = L(null, g)
                for (let de in Q) {
                  let ie = Q[de],
                    me = J[de]
                  if (Array.isArray(ie)) {
                    if (!ie.includes(me)) {
                      ne = !1
                      break
                    }
                  } else {
                    if ((ie == null || ie === !1) && (me == null || me === !1))
                      continue
                    if (me !== ie) {
                      ne = !1
                      break
                    }
                  }
                }
                ne && (M && k.push(M), q && k.push(q))
              }
              return k
            },
            F = p => {
              let g = B(h, p)
              if (!Array.isArray(g)) return g
              let k = {},
                O = e
              for (let I = 0; I < g.length; I++) {
                let M = g[I]
                if (typeof M == 'string') k.base = O(k.base, M)(u)
                else if (typeof M == 'object')
                  for (let q in M) k[q] = O(k[q], M[q])(u)
              }
              return k
            },
            E = p => {
              if (d.length < 1) return null
              let g = {},
                k = L(null, p)
              for (let O = 0; O < d.length; O++) {
                let { slots: I = [], class: M, className: q, ...Q } = d[O]
                if (!he(Q)) {
                  let ne = !0
                  for (let J in Q) {
                    let de = k[J],
                      ie = Q[J]
                    if (
                      de === void 0 ||
                      (Array.isArray(ie) ? !ie.includes(de) : ie !== de)
                    ) {
                      ne = !1
                      break
                    }
                  }
                  if (!ne) continue
                }
                for (let ne = 0; ne < I.length; ne++) {
                  let J = I[ne]
                  ;(g[J] || (g[J] = []), g[J].push([M, q]))
                }
              }
              return g
            }
          if (!he(i) || !w) {
            let p = {}
            if (typeof v == 'object' && !he(v)) {
              let g = e
              for (let k in v)
                p[k] = O => {
                  let I = F(O),
                    M = E(O)
                  return g(
                    v[k],
                    N(k, O),
                    I ? I[k] : void 0,
                    M ? M[k] : void 0,
                    O?.class,
                    O?.className
                  )(u)
                }
            }
            return p
          }
          return e(x, S(), B(h), y?.class, y?.className)(u)
        },
        A = () => {
          if (!(!b || typeof b != 'object')) return Object.keys(b)
        }
      return (
        (C.variantKeys = A()),
        (C.extend = a),
        (C.base = x),
        (C.slots = v),
        (C.variants = b),
        (C.defaultVariants = j),
        (C.compoundSlots = d),
        (C.compoundVariants = h),
        C
      )
    }
    return { tv: t, createTV: n => (r, a) => t(r, a ? Jn(n, a) : n) }
  },
  nd = e =>
    he(e)
      ? xi
      : vi({
          ...e,
          extend: {
            theme: e.theme,
            classGroups: e.classGroups,
            conflictingClassGroupModifiers: e.conflictingClassGroupModifiers,
            conflictingClassGroups: e.conflictingClassGroups,
            ...e.extend,
          },
        }),
  rd =
    (...e) =>
    t => {
      let n = ln(e)
      return !n || !t.twMerge
        ? n
        : ((!Be.cachedTwMerge || Be.didTwMergeConfigChange) &&
            ((Be.didTwMergeConfigChange = !1),
            (Be.cachedTwMerge = nd(Be.cachedTwMergeConfig))),
          Be.cachedTwMerge(n) || void 0)
    },
  { tv: sd } = td(rd)
const ad = sd({
    base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline:
          'border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
      tone: {
        neutral: '',
        success: 'border-green-200 bg-green-100 text-green-700',
        warning: 'border-amber-200 bg-amber-100 text-amber-800',
        danger: 'border-red-200 bg-red-100 text-red-800',
        info: 'border-blue-200 bg-blue-100 text-blue-700',
      },
      size: { sm: 'px-2 py-0.5 text-[11px]', md: 'px-2.5 py-0.5 text-xs' },
    },
    defaultVariants: { variant: 'default', tone: 'neutral', size: 'md' },
  }),
  be = xe.forwardRef(
    ({ className: e, variant: t, tone: n, size: r, ...a }, i) =>
      s.jsx('span', {
        ref: i,
        className: ad({ variant: t, tone: n, size: r, className: e }),
        ...a,
      })
  )
be.displayName = 'Badge'
const Cr = [
    { value: 'admin', label: 'Amministratore' },
    { value: 'responsabile', label: 'Responsabile' },
    { value: 'dipendente', label: 'Dipendente' },
    { value: 'collaboratore', label: 'Collaboratore Occasionale / Part-time' },
  ],
  er = [
    { value: 'Amministratore', label: 'Amministratore' },
    { value: 'Cuochi', label: 'Cuochi' },
    { value: 'Banconisti', label: 'Banconisti' },
    { value: 'Camerieri', label: 'Camerieri' },
    { value: 'Addetto Pulizie', label: 'Addetto Pulizie' },
    { value: 'Magazziniere', label: 'Magazziniere' },
    { value: 'Social & Media Manager', label: 'Social & Media Manager' },
    { value: 'Altro', label: 'Altro' },
  ],
  tr = ['Cuochi', 'Banconisti', 'Camerieri', 'Addetto Pulizie', 'Magazziniere']
var Y
;(function (e) {
  e.assertEqual = a => {}
  function t(a) {}
  e.assertIs = t
  function n(a) {
    throw new Error()
  }
  ;((e.assertNever = n),
    (e.arrayToEnum = a => {
      const i = {}
      for (const o of a) i[o] = o
      return i
    }),
    (e.getValidEnumValues = a => {
      const i = e.objectKeys(a).filter(l => typeof a[a[l]] != 'number'),
        o = {}
      for (const l of i) o[l] = a[l]
      return e.objectValues(o)
    }),
    (e.objectValues = a =>
      e.objectKeys(a).map(function (i) {
        return a[i]
      })),
    (e.objectKeys =
      typeof Object.keys == 'function'
        ? a => Object.keys(a)
        : a => {
            const i = []
            for (const o in a)
              Object.prototype.hasOwnProperty.call(a, o) && i.push(o)
            return i
          }),
    (e.find = (a, i) => {
      for (const o of a) if (i(o)) return o
    }),
    (e.isInteger =
      typeof Number.isInteger == 'function'
        ? a => Number.isInteger(a)
        : a =>
            typeof a == 'number' && Number.isFinite(a) && Math.floor(a) === a))
  function r(a, i = ' | ') {
    return a.map(o => (typeof o == 'string' ? `'${o}'` : o)).join(i)
  }
  ;((e.joinValues = r),
    (e.jsonStringifyReplacer = (a, i) =>
      typeof i == 'bigint' ? i.toString() : i))
})(Y || (Y = {}))
var ts
;(function (e) {
  e.mergeShapes = (t, n) => ({ ...t, ...n })
})(ts || (ts = {}))
const z = Y.arrayToEnum([
    'string',
    'nan',
    'number',
    'integer',
    'float',
    'boolean',
    'date',
    'bigint',
    'symbol',
    'function',
    'undefined',
    'null',
    'array',
    'object',
    'unknown',
    'promise',
    'void',
    'never',
    'map',
    'set',
  ]),
  We = e => {
    switch (typeof e) {
      case 'undefined':
        return z.undefined
      case 'string':
        return z.string
      case 'number':
        return Number.isNaN(e) ? z.nan : z.number
      case 'boolean':
        return z.boolean
      case 'function':
        return z.function
      case 'bigint':
        return z.bigint
      case 'symbol':
        return z.symbol
      case 'object':
        return Array.isArray(e)
          ? z.array
          : e === null
            ? z.null
            : e.then &&
                typeof e.then == 'function' &&
                e.catch &&
                typeof e.catch == 'function'
              ? z.promise
              : typeof Map < 'u' && e instanceof Map
                ? z.map
                : typeof Set < 'u' && e instanceof Set
                  ? z.set
                  : typeof Date < 'u' && e instanceof Date
                    ? z.date
                    : z.object
      default:
        return z.unknown
    }
  },
  R = Y.arrayToEnum([
    'invalid_type',
    'invalid_literal',
    'custom',
    'invalid_union',
    'invalid_union_discriminator',
    'invalid_enum_value',
    'unrecognized_keys',
    'invalid_arguments',
    'invalid_return_type',
    'invalid_date',
    'invalid_string',
    'too_small',
    'too_big',
    'invalid_intersection_types',
    'not_multiple_of',
    'not_finite',
  ])
class Ze extends Error {
  get errors() {
    return this.issues
  }
  constructor(t) {
    ;(super(),
      (this.issues = []),
      (this.addIssue = r => {
        this.issues = [...this.issues, r]
      }),
      (this.addIssues = (r = []) => {
        this.issues = [...this.issues, ...r]
      }))
    const n = new.target.prototype
    ;(Object.setPrototypeOf
      ? Object.setPrototypeOf(this, n)
      : (this.__proto__ = n),
      (this.name = 'ZodError'),
      (this.issues = t))
  }
  format(t) {
    const n =
        t ||
        function (i) {
          return i.message
        },
      r = { _errors: [] },
      a = i => {
        for (const o of i.issues)
          if (o.code === 'invalid_union') o.unionErrors.map(a)
          else if (o.code === 'invalid_return_type') a(o.returnTypeError)
          else if (o.code === 'invalid_arguments') a(o.argumentsError)
          else if (o.path.length === 0) r._errors.push(n(o))
          else {
            let l = r,
              d = 0
            for (; d < o.path.length; ) {
              const c = o.path[d]
              ;(d === o.path.length - 1
                ? ((l[c] = l[c] || { _errors: [] }), l[c]._errors.push(n(o)))
                : (l[c] = l[c] || { _errors: [] }),
                (l = l[c]),
                d++)
            }
          }
      }
    return (a(this), r)
  }
  static assert(t) {
    if (!(t instanceof Ze)) throw new Error(`Not a ZodError: ${t}`)
  }
  toString() {
    return this.message
  }
  get message() {
    return JSON.stringify(this.issues, Y.jsonStringifyReplacer, 2)
  }
  get isEmpty() {
    return this.issues.length === 0
  }
  flatten(t = n => n.message) {
    const n = {},
      r = []
    for (const a of this.issues)
      if (a.path.length > 0) {
        const i = a.path[0]
        ;((n[i] = n[i] || []), n[i].push(t(a)))
      } else r.push(t(a))
    return { formErrors: r, fieldErrors: n }
  }
  get formErrors() {
    return this.flatten()
  }
}
Ze.create = e => new Ze(e)
const nr = (e, t) => {
  let n
  switch (e.code) {
    case R.invalid_type:
      e.received === z.undefined
        ? (n = 'Required')
        : (n = `Expected ${e.expected}, received ${e.received}`)
      break
    case R.invalid_literal:
      n = `Invalid literal value, expected ${JSON.stringify(e.expected, Y.jsonStringifyReplacer)}`
      break
    case R.unrecognized_keys:
      n = `Unrecognized key(s) in object: ${Y.joinValues(e.keys, ', ')}`
      break
    case R.invalid_union:
      n = 'Invalid input'
      break
    case R.invalid_union_discriminator:
      n = `Invalid discriminator value. Expected ${Y.joinValues(e.options)}`
      break
    case R.invalid_enum_value:
      n = `Invalid enum value. Expected ${Y.joinValues(e.options)}, received '${e.received}'`
      break
    case R.invalid_arguments:
      n = 'Invalid function arguments'
      break
    case R.invalid_return_type:
      n = 'Invalid function return type'
      break
    case R.invalid_date:
      n = 'Invalid date'
      break
    case R.invalid_string:
      typeof e.validation == 'object'
        ? 'includes' in e.validation
          ? ((n = `Invalid input: must include "${e.validation.includes}"`),
            typeof e.validation.position == 'number' &&
              (n = `${n} at one or more positions greater than or equal to ${e.validation.position}`))
          : 'startsWith' in e.validation
            ? (n = `Invalid input: must start with "${e.validation.startsWith}"`)
            : 'endsWith' in e.validation
              ? (n = `Invalid input: must end with "${e.validation.endsWith}"`)
              : Y.assertNever(e.validation)
        : e.validation !== 'regex'
          ? (n = `Invalid ${e.validation}`)
          : (n = 'Invalid')
      break
    case R.too_small:
      e.type === 'array'
        ? (n = `Array must contain ${e.exact ? 'exactly' : e.inclusive ? 'at least' : 'more than'} ${e.minimum} element(s)`)
        : e.type === 'string'
          ? (n = `String must contain ${e.exact ? 'exactly' : e.inclusive ? 'at least' : 'over'} ${e.minimum} character(s)`)
          : e.type === 'number'
            ? (n = `Number must be ${e.exact ? 'exactly equal to ' : e.inclusive ? 'greater than or equal to ' : 'greater than '}${e.minimum}`)
            : e.type === 'bigint'
              ? (n = `Number must be ${e.exact ? 'exactly equal to ' : e.inclusive ? 'greater than or equal to ' : 'greater than '}${e.minimum}`)
              : e.type === 'date'
                ? (n = `Date must be ${e.exact ? 'exactly equal to ' : e.inclusive ? 'greater than or equal to ' : 'greater than '}${new Date(Number(e.minimum))}`)
                : (n = 'Invalid input')
      break
    case R.too_big:
      e.type === 'array'
        ? (n = `Array must contain ${e.exact ? 'exactly' : e.inclusive ? 'at most' : 'less than'} ${e.maximum} element(s)`)
        : e.type === 'string'
          ? (n = `String must contain ${e.exact ? 'exactly' : e.inclusive ? 'at most' : 'under'} ${e.maximum} character(s)`)
          : e.type === 'number'
            ? (n = `Number must be ${e.exact ? 'exactly' : e.inclusive ? 'less than or equal to' : 'less than'} ${e.maximum}`)
            : e.type === 'bigint'
              ? (n = `BigInt must be ${e.exact ? 'exactly' : e.inclusive ? 'less than or equal to' : 'less than'} ${e.maximum}`)
              : e.type === 'date'
                ? (n = `Date must be ${e.exact ? 'exactly' : e.inclusive ? 'smaller than or equal to' : 'smaller than'} ${new Date(Number(e.maximum))}`)
                : (n = 'Invalid input')
      break
    case R.custom:
      n = 'Invalid input'
      break
    case R.invalid_intersection_types:
      n = 'Intersection results could not be merged'
      break
    case R.not_multiple_of:
      n = `Number must be a multiple of ${e.multipleOf}`
      break
    case R.not_finite:
      n = 'Number must be finite'
      break
    default:
      ;((n = t.defaultError), Y.assertNever(e))
  }
  return { message: n }
}
let id = nr
function od() {
  return id
}
const ld = e => {
  const { data: t, path: n, errorMaps: r, issueData: a } = e,
    i = [...n, ...(a.path || [])],
    o = { ...a, path: i }
  if (a.message !== void 0) return { ...a, path: i, message: a.message }
  let l = ''
  const d = r
    .filter(c => !!c)
    .slice()
    .reverse()
  for (const c of d) l = c(o, { data: t, defaultError: l }).message
  return { ...a, path: i, message: l }
}
function D(e, t) {
  const n = od(),
    r = ld({
      issueData: t,
      data: e.data,
      path: e.path,
      errorMaps: [
        e.common.contextualErrorMap,
        e.schemaErrorMap,
        n,
        n === nr ? void 0 : nr,
      ].filter(a => !!a),
    })
  e.common.issues.push(r)
}
class we {
  constructor() {
    this.value = 'valid'
  }
  dirty() {
    this.value === 'valid' && (this.value = 'dirty')
  }
  abort() {
    this.value !== 'aborted' && (this.value = 'aborted')
  }
  static mergeArray(t, n) {
    const r = []
    for (const a of n) {
      if (a.status === 'aborted') return H
      ;(a.status === 'dirty' && t.dirty(), r.push(a.value))
    }
    return { status: t.value, value: r }
  }
  static async mergeObjectAsync(t, n) {
    const r = []
    for (const a of n) {
      const i = await a.key,
        o = await a.value
      r.push({ key: i, value: o })
    }
    return we.mergeObjectSync(t, r)
  }
  static mergeObjectSync(t, n) {
    const r = {}
    for (const a of n) {
      const { key: i, value: o } = a
      if (i.status === 'aborted' || o.status === 'aborted') return H
      ;(i.status === 'dirty' && t.dirty(),
        o.status === 'dirty' && t.dirty(),
        i.value !== '__proto__' &&
          (typeof o.value < 'u' || a.alwaysSet) &&
          (r[i.value] = o.value))
    }
    return { status: t.value, value: r }
  }
}
const H = Object.freeze({ status: 'aborted' }),
  Dt = e => ({ status: 'dirty', value: e }),
  Se = e => ({ status: 'valid', value: e }),
  ns = e => e.status === 'aborted',
  rs = e => e.status === 'dirty',
  jt = e => e.status === 'valid',
  cn = e => typeof Promise < 'u' && e instanceof Promise
var $
;(function (e) {
  ;((e.errToObj = t => (typeof t == 'string' ? { message: t } : t || {})),
    (e.toString = t => (typeof t == 'string' ? t : t?.message)))
})($ || ($ = {}))
class et {
  constructor(t, n, r, a) {
    ;((this._cachedPath = []),
      (this.parent = t),
      (this.data = n),
      (this._path = r),
      (this._key = a))
  }
  get path() {
    return (
      this._cachedPath.length ||
        (Array.isArray(this._key)
          ? this._cachedPath.push(...this._path, ...this._key)
          : this._cachedPath.push(...this._path, this._key)),
      this._cachedPath
    )
  }
}
const ss = (e, t) => {
  if (jt(t)) return { success: !0, data: t.value }
  if (!e.common.issues.length)
    throw new Error('Validation failed but no issues detected.')
  return {
    success: !1,
    get error() {
      if (this._error) return this._error
      const n = new Ze(e.common.issues)
      return ((this._error = n), this._error)
    },
  }
}
function W(e) {
  if (!e) return {}
  const {
    errorMap: t,
    invalid_type_error: n,
    required_error: r,
    description: a,
  } = e
  if (t && (n || r))
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`
    )
  return t
    ? { errorMap: t, description: a }
    : {
        errorMap: (o, l) => {
          const { message: d } = e
          return o.code === 'invalid_enum_value'
            ? { message: d ?? l.defaultError }
            : typeof l.data > 'u'
              ? { message: d ?? r ?? l.defaultError }
              : o.code !== 'invalid_type'
                ? { message: l.defaultError }
                : { message: d ?? n ?? l.defaultError }
        },
        description: a,
      }
}
class G {
  get description() {
    return this._def.description
  }
  _getType(t) {
    return We(t.data)
  }
  _getOrReturnCtx(t, n) {
    return (
      n || {
        common: t.parent.common,
        data: t.data,
        parsedType: We(t.data),
        schemaErrorMap: this._def.errorMap,
        path: t.path,
        parent: t.parent,
      }
    )
  }
  _processInputParams(t) {
    return {
      status: new we(),
      ctx: {
        common: t.parent.common,
        data: t.data,
        parsedType: We(t.data),
        schemaErrorMap: this._def.errorMap,
        path: t.path,
        parent: t.parent,
      },
    }
  }
  _parseSync(t) {
    const n = this._parse(t)
    if (cn(n)) throw new Error('Synchronous parse encountered promise.')
    return n
  }
  _parseAsync(t) {
    const n = this._parse(t)
    return Promise.resolve(n)
  }
  parse(t, n) {
    const r = this.safeParse(t, n)
    if (r.success) return r.data
    throw r.error
  }
  safeParse(t, n) {
    const r = {
        common: {
          issues: [],
          async: n?.async ?? !1,
          contextualErrorMap: n?.errorMap,
        },
        path: n?.path || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: t,
        parsedType: We(t),
      },
      a = this._parseSync({ data: t, path: r.path, parent: r })
    return ss(r, a)
  }
  '~validate'(t) {
    const n = {
      common: { issues: [], async: !!this['~standard'].async },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: t,
      parsedType: We(t),
    }
    if (!this['~standard'].async)
      try {
        const r = this._parseSync({ data: t, path: [], parent: n })
        return jt(r) ? { value: r.value } : { issues: n.common.issues }
      } catch (r) {
        ;(r?.message?.toLowerCase()?.includes('encountered') &&
          (this['~standard'].async = !0),
          (n.common = { issues: [], async: !0 }))
      }
    return this._parseAsync({ data: t, path: [], parent: n }).then(r =>
      jt(r) ? { value: r.value } : { issues: n.common.issues }
    )
  }
  async parseAsync(t, n) {
    const r = await this.safeParseAsync(t, n)
    if (r.success) return r.data
    throw r.error
  }
  async safeParseAsync(t, n) {
    const r = {
        common: { issues: [], contextualErrorMap: n?.errorMap, async: !0 },
        path: n?.path || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: t,
        parsedType: We(t),
      },
      a = this._parse({ data: t, path: r.path, parent: r }),
      i = await (cn(a) ? a : Promise.resolve(a))
    return ss(r, i)
  }
  refine(t, n) {
    const r = a =>
      typeof n == 'string' || typeof n > 'u'
        ? { message: n }
        : typeof n == 'function'
          ? n(a)
          : n
    return this._refinement((a, i) => {
      const o = t(a),
        l = () => i.addIssue({ code: R.custom, ...r(a) })
      return typeof Promise < 'u' && o instanceof Promise
        ? o.then(d => (d ? !0 : (l(), !1)))
        : o
          ? !0
          : (l(), !1)
    })
  }
  refinement(t, n) {
    return this._refinement((r, a) =>
      t(r) ? !0 : (a.addIssue(typeof n == 'function' ? n(r, a) : n), !1)
    )
  }
  _refinement(t) {
    return new _t({
      schema: this,
      typeName: Z.ZodEffects,
      effect: { type: 'refinement', refinement: t },
    })
  }
  superRefine(t) {
    return this._refinement(t)
  }
  constructor(t) {
    ;((this.spa = this.safeParseAsync),
      (this._def = t),
      (this.parse = this.parse.bind(this)),
      (this.safeParse = this.safeParse.bind(this)),
      (this.parseAsync = this.parseAsync.bind(this)),
      (this.safeParseAsync = this.safeParseAsync.bind(this)),
      (this.spa = this.spa.bind(this)),
      (this.refine = this.refine.bind(this)),
      (this.refinement = this.refinement.bind(this)),
      (this.superRefine = this.superRefine.bind(this)),
      (this.optional = this.optional.bind(this)),
      (this.nullable = this.nullable.bind(this)),
      (this.nullish = this.nullish.bind(this)),
      (this.array = this.array.bind(this)),
      (this.promise = this.promise.bind(this)),
      (this.or = this.or.bind(this)),
      (this.and = this.and.bind(this)),
      (this.transform = this.transform.bind(this)),
      (this.brand = this.brand.bind(this)),
      (this.default = this.default.bind(this)),
      (this.catch = this.catch.bind(this)),
      (this.describe = this.describe.bind(this)),
      (this.pipe = this.pipe.bind(this)),
      (this.readonly = this.readonly.bind(this)),
      (this.isNullable = this.isNullable.bind(this)),
      (this.isOptional = this.isOptional.bind(this)),
      (this['~standard'] = {
        version: 1,
        vendor: 'zod',
        validate: n => this['~validate'](n),
      }))
  }
  optional() {
    return Ke.create(this, this._def)
  }
  nullable() {
    return St.create(this, this._def)
  }
  nullish() {
    return this.nullable().optional()
  }
  array() {
    return De.create(this)
  }
  promise() {
    return mn.create(this, this._def)
  }
  or(t) {
    return un.create([this, t], this._def)
  }
  and(t) {
    return fn.create(this, t, this._def)
  }
  transform(t) {
    return new _t({
      ...W(this._def),
      schema: this,
      typeName: Z.ZodEffects,
      effect: { type: 'transform', transform: t },
    })
  }
  default(t) {
    const n = typeof t == 'function' ? t : () => t
    return new or({
      ...W(this._def),
      innerType: this,
      defaultValue: n,
      typeName: Z.ZodDefault,
    })
  }
  brand() {
    return new Rd({ typeName: Z.ZodBranded, type: this, ...W(this._def) })
  }
  catch(t) {
    const n = typeof t == 'function' ? t : () => t
    return new lr({
      ...W(this._def),
      innerType: this,
      catchValue: n,
      typeName: Z.ZodCatch,
    })
  }
  describe(t) {
    const n = this.constructor
    return new n({ ...this._def, description: t })
  }
  pipe(t) {
    return Nr.create(this, t)
  }
  readonly() {
    return cr.create(this)
  }
  isOptional() {
    return this.safeParse(void 0).success
  }
  isNullable() {
    return this.safeParse(null).success
  }
}
const cd = /^c[^\s-]{8,}$/i,
  dd = /^[0-9a-z]+$/,
  ud = /^[0-9A-HJKMNP-TV-Z]{26}$/i,
  fd =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,
  md = /^[a-z0-9_-]{21}$/i,
  pd = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
  hd =
    /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
  gd =
    /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,
  xd = '^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$'
let zn
const vd =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  bd =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
  yd =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
  wd =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  jd = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
  Cd = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
  Ka =
    '((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))',
  Nd = new RegExp(`^${Ka}$`)
function Xa(e) {
  let t = '[0-5]\\d'
  e.precision
    ? (t = `${t}\\.\\d{${e.precision}}`)
    : e.precision == null && (t = `${t}(\\.\\d+)?`)
  const n = e.precision ? '+' : '?'
  return `([01]\\d|2[0-3]):[0-5]\\d(:${t})${n}`
}
function _d(e) {
  return new RegExp(`^${Xa(e)}$`)
}
function Sd(e) {
  let t = `${Ka}T${Xa(e)}`
  const n = []
  return (
    n.push(e.local ? 'Z?' : 'Z'),
    e.offset && n.push('([+-]\\d{2}:?\\d{2})'),
    (t = `${t}(${n.join('|')})`),
    new RegExp(`^${t}$`)
  )
}
function Ad(e, t) {
  return !!(
    ((t === 'v4' || !t) && vd.test(e)) ||
    ((t === 'v6' || !t) && yd.test(e))
  )
}
function Td(e, t) {
  if (!pd.test(e)) return !1
  try {
    const [n] = e.split('.')
    if (!n) return !1
    const r = n
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(n.length + ((4 - (n.length % 4)) % 4), '='),
      a = JSON.parse(atob(r))
    return !(
      typeof a != 'object' ||
      a === null ||
      ('typ' in a && a?.typ !== 'JWT') ||
      !a.alg ||
      (t && a.alg !== t)
    )
  } catch {
    return !1
  }
}
function Ed(e, t) {
  return !!(
    ((t === 'v4' || !t) && bd.test(e)) ||
    ((t === 'v6' || !t) && wd.test(e))
  )
}
class Ge extends G {
  _parse(t) {
    if (
      (this._def.coerce && (t.data = String(t.data)),
      this._getType(t) !== z.string)
    ) {
      const i = this._getOrReturnCtx(t)
      return (
        D(i, {
          code: R.invalid_type,
          expected: z.string,
          received: i.parsedType,
        }),
        H
      )
    }
    const r = new we()
    let a
    for (const i of this._def.checks)
      if (i.kind === 'min')
        t.data.length < i.value &&
          ((a = this._getOrReturnCtx(t, a)),
          D(a, {
            code: R.too_small,
            minimum: i.value,
            type: 'string',
            inclusive: !0,
            exact: !1,
            message: i.message,
          }),
          r.dirty())
      else if (i.kind === 'max')
        t.data.length > i.value &&
          ((a = this._getOrReturnCtx(t, a)),
          D(a, {
            code: R.too_big,
            maximum: i.value,
            type: 'string',
            inclusive: !0,
            exact: !1,
            message: i.message,
          }),
          r.dirty())
      else if (i.kind === 'length') {
        const o = t.data.length > i.value,
          l = t.data.length < i.value
        ;(o || l) &&
          ((a = this._getOrReturnCtx(t, a)),
          o
            ? D(a, {
                code: R.too_big,
                maximum: i.value,
                type: 'string',
                inclusive: !0,
                exact: !0,
                message: i.message,
              })
            : l &&
              D(a, {
                code: R.too_small,
                minimum: i.value,
                type: 'string',
                inclusive: !0,
                exact: !0,
                message: i.message,
              }),
          r.dirty())
      } else if (i.kind === 'email')
        gd.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          D(a, {
            validation: 'email',
            code: R.invalid_string,
            message: i.message,
          }),
          r.dirty())
      else if (i.kind === 'emoji')
        (zn || (zn = new RegExp(xd, 'u')),
          zn.test(t.data) ||
            ((a = this._getOrReturnCtx(t, a)),
            D(a, {
              validation: 'emoji',
              code: R.invalid_string,
              message: i.message,
            }),
            r.dirty()))
      else if (i.kind === 'uuid')
        fd.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          D(a, {
            validation: 'uuid',
            code: R.invalid_string,
            message: i.message,
          }),
          r.dirty())
      else if (i.kind === 'nanoid')
        md.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          D(a, {
            validation: 'nanoid',
            code: R.invalid_string,
            message: i.message,
          }),
          r.dirty())
      else if (i.kind === 'cuid')
        cd.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          D(a, {
            validation: 'cuid',
            code: R.invalid_string,
            message: i.message,
          }),
          r.dirty())
      else if (i.kind === 'cuid2')
        dd.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          D(a, {
            validation: 'cuid2',
            code: R.invalid_string,
            message: i.message,
          }),
          r.dirty())
      else if (i.kind === 'ulid')
        ud.test(t.data) ||
          ((a = this._getOrReturnCtx(t, a)),
          D(a, {
            validation: 'ulid',
            code: R.invalid_string,
            message: i.message,
          }),
          r.dirty())
      else if (i.kind === 'url')
        try {
          new URL(t.data)
        } catch {
          ;((a = this._getOrReturnCtx(t, a)),
            D(a, {
              validation: 'url',
              code: R.invalid_string,
              message: i.message,
            }),
            r.dirty())
        }
      else
        i.kind === 'regex'
          ? ((i.regex.lastIndex = 0),
            i.regex.test(t.data) ||
              ((a = this._getOrReturnCtx(t, a)),
              D(a, {
                validation: 'regex',
                code: R.invalid_string,
                message: i.message,
              }),
              r.dirty()))
          : i.kind === 'trim'
            ? (t.data = t.data.trim())
            : i.kind === 'includes'
              ? t.data.includes(i.value, i.position) ||
                ((a = this._getOrReturnCtx(t, a)),
                D(a, {
                  code: R.invalid_string,
                  validation: { includes: i.value, position: i.position },
                  message: i.message,
                }),
                r.dirty())
              : i.kind === 'toLowerCase'
                ? (t.data = t.data.toLowerCase())
                : i.kind === 'toUpperCase'
                  ? (t.data = t.data.toUpperCase())
                  : i.kind === 'startsWith'
                    ? t.data.startsWith(i.value) ||
                      ((a = this._getOrReturnCtx(t, a)),
                      D(a, {
                        code: R.invalid_string,
                        validation: { startsWith: i.value },
                        message: i.message,
                      }),
                      r.dirty())
                    : i.kind === 'endsWith'
                      ? t.data.endsWith(i.value) ||
                        ((a = this._getOrReturnCtx(t, a)),
                        D(a, {
                          code: R.invalid_string,
                          validation: { endsWith: i.value },
                          message: i.message,
                        }),
                        r.dirty())
                      : i.kind === 'datetime'
                        ? Sd(i).test(t.data) ||
                          ((a = this._getOrReturnCtx(t, a)),
                          D(a, {
                            code: R.invalid_string,
                            validation: 'datetime',
                            message: i.message,
                          }),
                          r.dirty())
                        : i.kind === 'date'
                          ? Nd.test(t.data) ||
                            ((a = this._getOrReturnCtx(t, a)),
                            D(a, {
                              code: R.invalid_string,
                              validation: 'date',
                              message: i.message,
                            }),
                            r.dirty())
                          : i.kind === 'time'
                            ? _d(i).test(t.data) ||
                              ((a = this._getOrReturnCtx(t, a)),
                              D(a, {
                                code: R.invalid_string,
                                validation: 'time',
                                message: i.message,
                              }),
                              r.dirty())
                            : i.kind === 'duration'
                              ? hd.test(t.data) ||
                                ((a = this._getOrReturnCtx(t, a)),
                                D(a, {
                                  validation: 'duration',
                                  code: R.invalid_string,
                                  message: i.message,
                                }),
                                r.dirty())
                              : i.kind === 'ip'
                                ? Ad(t.data, i.version) ||
                                  ((a = this._getOrReturnCtx(t, a)),
                                  D(a, {
                                    validation: 'ip',
                                    code: R.invalid_string,
                                    message: i.message,
                                  }),
                                  r.dirty())
                                : i.kind === 'jwt'
                                  ? Td(t.data, i.alg) ||
                                    ((a = this._getOrReturnCtx(t, a)),
                                    D(a, {
                                      validation: 'jwt',
                                      code: R.invalid_string,
                                      message: i.message,
                                    }),
                                    r.dirty())
                                  : i.kind === 'cidr'
                                    ? Ed(t.data, i.version) ||
                                      ((a = this._getOrReturnCtx(t, a)),
                                      D(a, {
                                        validation: 'cidr',
                                        code: R.invalid_string,
                                        message: i.message,
                                      }),
                                      r.dirty())
                                    : i.kind === 'base64'
                                      ? jd.test(t.data) ||
                                        ((a = this._getOrReturnCtx(t, a)),
                                        D(a, {
                                          validation: 'base64',
                                          code: R.invalid_string,
                                          message: i.message,
                                        }),
                                        r.dirty())
                                      : i.kind === 'base64url'
                                        ? Cd.test(t.data) ||
                                          ((a = this._getOrReturnCtx(t, a)),
                                          D(a, {
                                            validation: 'base64url',
                                            code: R.invalid_string,
                                            message: i.message,
                                          }),
                                          r.dirty())
                                        : Y.assertNever(i)
    return { status: r.value, value: t.data }
  }
  _regex(t, n, r) {
    return this.refinement(a => t.test(a), {
      validation: n,
      code: R.invalid_string,
      ...$.errToObj(r),
    })
  }
  _addCheck(t) {
    return new Ge({ ...this._def, checks: [...this._def.checks, t] })
  }
  email(t) {
    return this._addCheck({ kind: 'email', ...$.errToObj(t) })
  }
  url(t) {
    return this._addCheck({ kind: 'url', ...$.errToObj(t) })
  }
  emoji(t) {
    return this._addCheck({ kind: 'emoji', ...$.errToObj(t) })
  }
  uuid(t) {
    return this._addCheck({ kind: 'uuid', ...$.errToObj(t) })
  }
  nanoid(t) {
    return this._addCheck({ kind: 'nanoid', ...$.errToObj(t) })
  }
  cuid(t) {
    return this._addCheck({ kind: 'cuid', ...$.errToObj(t) })
  }
  cuid2(t) {
    return this._addCheck({ kind: 'cuid2', ...$.errToObj(t) })
  }
  ulid(t) {
    return this._addCheck({ kind: 'ulid', ...$.errToObj(t) })
  }
  base64(t) {
    return this._addCheck({ kind: 'base64', ...$.errToObj(t) })
  }
  base64url(t) {
    return this._addCheck({ kind: 'base64url', ...$.errToObj(t) })
  }
  jwt(t) {
    return this._addCheck({ kind: 'jwt', ...$.errToObj(t) })
  }
  ip(t) {
    return this._addCheck({ kind: 'ip', ...$.errToObj(t) })
  }
  cidr(t) {
    return this._addCheck({ kind: 'cidr', ...$.errToObj(t) })
  }
  datetime(t) {
    return typeof t == 'string'
      ? this._addCheck({
          kind: 'datetime',
          precision: null,
          offset: !1,
          local: !1,
          message: t,
        })
      : this._addCheck({
          kind: 'datetime',
          precision: typeof t?.precision > 'u' ? null : t?.precision,
          offset: t?.offset ?? !1,
          local: t?.local ?? !1,
          ...$.errToObj(t?.message),
        })
  }
  date(t) {
    return this._addCheck({ kind: 'date', message: t })
  }
  time(t) {
    return typeof t == 'string'
      ? this._addCheck({ kind: 'time', precision: null, message: t })
      : this._addCheck({
          kind: 'time',
          precision: typeof t?.precision > 'u' ? null : t?.precision,
          ...$.errToObj(t?.message),
        })
  }
  duration(t) {
    return this._addCheck({ kind: 'duration', ...$.errToObj(t) })
  }
  regex(t, n) {
    return this._addCheck({ kind: 'regex', regex: t, ...$.errToObj(n) })
  }
  includes(t, n) {
    return this._addCheck({
      kind: 'includes',
      value: t,
      position: n?.position,
      ...$.errToObj(n?.message),
    })
  }
  startsWith(t, n) {
    return this._addCheck({ kind: 'startsWith', value: t, ...$.errToObj(n) })
  }
  endsWith(t, n) {
    return this._addCheck({ kind: 'endsWith', value: t, ...$.errToObj(n) })
  }
  min(t, n) {
    return this._addCheck({ kind: 'min', value: t, ...$.errToObj(n) })
  }
  max(t, n) {
    return this._addCheck({ kind: 'max', value: t, ...$.errToObj(n) })
  }
  length(t, n) {
    return this._addCheck({ kind: 'length', value: t, ...$.errToObj(n) })
  }
  nonempty(t) {
    return this.min(1, $.errToObj(t))
  }
  trim() {
    return new Ge({
      ...this._def,
      checks: [...this._def.checks, { kind: 'trim' }],
    })
  }
  toLowerCase() {
    return new Ge({
      ...this._def,
      checks: [...this._def.checks, { kind: 'toLowerCase' }],
    })
  }
  toUpperCase() {
    return new Ge({
      ...this._def,
      checks: [...this._def.checks, { kind: 'toUpperCase' }],
    })
  }
  get isDatetime() {
    return !!this._def.checks.find(t => t.kind === 'datetime')
  }
  get isDate() {
    return !!this._def.checks.find(t => t.kind === 'date')
  }
  get isTime() {
    return !!this._def.checks.find(t => t.kind === 'time')
  }
  get isDuration() {
    return !!this._def.checks.find(t => t.kind === 'duration')
  }
  get isEmail() {
    return !!this._def.checks.find(t => t.kind === 'email')
  }
  get isURL() {
    return !!this._def.checks.find(t => t.kind === 'url')
  }
  get isEmoji() {
    return !!this._def.checks.find(t => t.kind === 'emoji')
  }
  get isUUID() {
    return !!this._def.checks.find(t => t.kind === 'uuid')
  }
  get isNANOID() {
    return !!this._def.checks.find(t => t.kind === 'nanoid')
  }
  get isCUID() {
    return !!this._def.checks.find(t => t.kind === 'cuid')
  }
  get isCUID2() {
    return !!this._def.checks.find(t => t.kind === 'cuid2')
  }
  get isULID() {
    return !!this._def.checks.find(t => t.kind === 'ulid')
  }
  get isIP() {
    return !!this._def.checks.find(t => t.kind === 'ip')
  }
  get isCIDR() {
    return !!this._def.checks.find(t => t.kind === 'cidr')
  }
  get isBase64() {
    return !!this._def.checks.find(t => t.kind === 'base64')
  }
  get isBase64url() {
    return !!this._def.checks.find(t => t.kind === 'base64url')
  }
  get minLength() {
    let t = null
    for (const n of this._def.checks)
      n.kind === 'min' && (t === null || n.value > t) && (t = n.value)
    return t
  }
  get maxLength() {
    let t = null
    for (const n of this._def.checks)
      n.kind === 'max' && (t === null || n.value < t) && (t = n.value)
    return t
  }
}
Ge.create = e =>
  new Ge({
    checks: [],
    typeName: Z.ZodString,
    coerce: e?.coerce ?? !1,
    ...W(e),
  })
function kd(e, t) {
  const n = (e.toString().split('.')[1] || '').length,
    r = (t.toString().split('.')[1] || '').length,
    a = n > r ? n : r,
    i = Number.parseInt(e.toFixed(a).replace('.', '')),
    o = Number.parseInt(t.toFixed(a).replace('.', ''))
  return (i % o) / 10 ** a
}
class Ct extends G {
  constructor() {
    ;(super(...arguments),
      (this.min = this.gte),
      (this.max = this.lte),
      (this.step = this.multipleOf))
  }
  _parse(t) {
    if (
      (this._def.coerce && (t.data = Number(t.data)),
      this._getType(t) !== z.number)
    ) {
      const i = this._getOrReturnCtx(t)
      return (
        D(i, {
          code: R.invalid_type,
          expected: z.number,
          received: i.parsedType,
        }),
        H
      )
    }
    let r
    const a = new we()
    for (const i of this._def.checks)
      i.kind === 'int'
        ? Y.isInteger(t.data) ||
          ((r = this._getOrReturnCtx(t, r)),
          D(r, {
            code: R.invalid_type,
            expected: 'integer',
            received: 'float',
            message: i.message,
          }),
          a.dirty())
        : i.kind === 'min'
          ? (i.inclusive ? t.data < i.value : t.data <= i.value) &&
            ((r = this._getOrReturnCtx(t, r)),
            D(r, {
              code: R.too_small,
              minimum: i.value,
              type: 'number',
              inclusive: i.inclusive,
              exact: !1,
              message: i.message,
            }),
            a.dirty())
          : i.kind === 'max'
            ? (i.inclusive ? t.data > i.value : t.data >= i.value) &&
              ((r = this._getOrReturnCtx(t, r)),
              D(r, {
                code: R.too_big,
                maximum: i.value,
                type: 'number',
                inclusive: i.inclusive,
                exact: !1,
                message: i.message,
              }),
              a.dirty())
            : i.kind === 'multipleOf'
              ? kd(t.data, i.value) !== 0 &&
                ((r = this._getOrReturnCtx(t, r)),
                D(r, {
                  code: R.not_multiple_of,
                  multipleOf: i.value,
                  message: i.message,
                }),
                a.dirty())
              : i.kind === 'finite'
                ? Number.isFinite(t.data) ||
                  ((r = this._getOrReturnCtx(t, r)),
                  D(r, { code: R.not_finite, message: i.message }),
                  a.dirty())
                : Y.assertNever(i)
    return { status: a.value, value: t.data }
  }
  gte(t, n) {
    return this.setLimit('min', t, !0, $.toString(n))
  }
  gt(t, n) {
    return this.setLimit('min', t, !1, $.toString(n))
  }
  lte(t, n) {
    return this.setLimit('max', t, !0, $.toString(n))
  }
  lt(t, n) {
    return this.setLimit('max', t, !1, $.toString(n))
  }
  setLimit(t, n, r, a) {
    return new Ct({
      ...this._def,
      checks: [
        ...this._def.checks,
        { kind: t, value: n, inclusive: r, message: $.toString(a) },
      ],
    })
  }
  _addCheck(t) {
    return new Ct({ ...this._def, checks: [...this._def.checks, t] })
  }
  int(t) {
    return this._addCheck({ kind: 'int', message: $.toString(t) })
  }
  positive(t) {
    return this._addCheck({
      kind: 'min',
      value: 0,
      inclusive: !1,
      message: $.toString(t),
    })
  }
  negative(t) {
    return this._addCheck({
      kind: 'max',
      value: 0,
      inclusive: !1,
      message: $.toString(t),
    })
  }
  nonpositive(t) {
    return this._addCheck({
      kind: 'max',
      value: 0,
      inclusive: !0,
      message: $.toString(t),
    })
  }
  nonnegative(t) {
    return this._addCheck({
      kind: 'min',
      value: 0,
      inclusive: !0,
      message: $.toString(t),
    })
  }
  multipleOf(t, n) {
    return this._addCheck({
      kind: 'multipleOf',
      value: t,
      message: $.toString(n),
    })
  }
  finite(t) {
    return this._addCheck({ kind: 'finite', message: $.toString(t) })
  }
  safe(t) {
    return this._addCheck({
      kind: 'min',
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: $.toString(t),
    })._addCheck({
      kind: 'max',
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: $.toString(t),
    })
  }
  get minValue() {
    let t = null
    for (const n of this._def.checks)
      n.kind === 'min' && (t === null || n.value > t) && (t = n.value)
    return t
  }
  get maxValue() {
    let t = null
    for (const n of this._def.checks)
      n.kind === 'max' && (t === null || n.value < t) && (t = n.value)
    return t
  }
  get isInt() {
    return !!this._def.checks.find(
      t => t.kind === 'int' || (t.kind === 'multipleOf' && Y.isInteger(t.value))
    )
  }
  get isFinite() {
    let t = null,
      n = null
    for (const r of this._def.checks) {
      if (r.kind === 'finite' || r.kind === 'int' || r.kind === 'multipleOf')
        return !0
      r.kind === 'min'
        ? (n === null || r.value > n) && (n = r.value)
        : r.kind === 'max' && (t === null || r.value < t) && (t = r.value)
    }
    return Number.isFinite(n) && Number.isFinite(t)
  }
}
Ct.create = e =>
  new Ct({
    checks: [],
    typeName: Z.ZodNumber,
    coerce: e?.coerce || !1,
    ...W(e),
  })
class Bt extends G {
  constructor() {
    ;(super(...arguments), (this.min = this.gte), (this.max = this.lte))
  }
  _parse(t) {
    if (this._def.coerce)
      try {
        t.data = BigInt(t.data)
      } catch {
        return this._getInvalidInput(t)
      }
    if (this._getType(t) !== z.bigint) return this._getInvalidInput(t)
    let r
    const a = new we()
    for (const i of this._def.checks)
      i.kind === 'min'
        ? (i.inclusive ? t.data < i.value : t.data <= i.value) &&
          ((r = this._getOrReturnCtx(t, r)),
          D(r, {
            code: R.too_small,
            type: 'bigint',
            minimum: i.value,
            inclusive: i.inclusive,
            message: i.message,
          }),
          a.dirty())
        : i.kind === 'max'
          ? (i.inclusive ? t.data > i.value : t.data >= i.value) &&
            ((r = this._getOrReturnCtx(t, r)),
            D(r, {
              code: R.too_big,
              type: 'bigint',
              maximum: i.value,
              inclusive: i.inclusive,
              message: i.message,
            }),
            a.dirty())
          : i.kind === 'multipleOf'
            ? t.data % i.value !== BigInt(0) &&
              ((r = this._getOrReturnCtx(t, r)),
              D(r, {
                code: R.not_multiple_of,
                multipleOf: i.value,
                message: i.message,
              }),
              a.dirty())
            : Y.assertNever(i)
    return { status: a.value, value: t.data }
  }
  _getInvalidInput(t) {
    const n = this._getOrReturnCtx(t)
    return (
      D(n, {
        code: R.invalid_type,
        expected: z.bigint,
        received: n.parsedType,
      }),
      H
    )
  }
  gte(t, n) {
    return this.setLimit('min', t, !0, $.toString(n))
  }
  gt(t, n) {
    return this.setLimit('min', t, !1, $.toString(n))
  }
  lte(t, n) {
    return this.setLimit('max', t, !0, $.toString(n))
  }
  lt(t, n) {
    return this.setLimit('max', t, !1, $.toString(n))
  }
  setLimit(t, n, r, a) {
    return new Bt({
      ...this._def,
      checks: [
        ...this._def.checks,
        { kind: t, value: n, inclusive: r, message: $.toString(a) },
      ],
    })
  }
  _addCheck(t) {
    return new Bt({ ...this._def, checks: [...this._def.checks, t] })
  }
  positive(t) {
    return this._addCheck({
      kind: 'min',
      value: BigInt(0),
      inclusive: !1,
      message: $.toString(t),
    })
  }
  negative(t) {
    return this._addCheck({
      kind: 'max',
      value: BigInt(0),
      inclusive: !1,
      message: $.toString(t),
    })
  }
  nonpositive(t) {
    return this._addCheck({
      kind: 'max',
      value: BigInt(0),
      inclusive: !0,
      message: $.toString(t),
    })
  }
  nonnegative(t) {
    return this._addCheck({
      kind: 'min',
      value: BigInt(0),
      inclusive: !0,
      message: $.toString(t),
    })
  }
  multipleOf(t, n) {
    return this._addCheck({
      kind: 'multipleOf',
      value: t,
      message: $.toString(n),
    })
  }
  get minValue() {
    let t = null
    for (const n of this._def.checks)
      n.kind === 'min' && (t === null || n.value > t) && (t = n.value)
    return t
  }
  get maxValue() {
    let t = null
    for (const n of this._def.checks)
      n.kind === 'max' && (t === null || n.value < t) && (t = n.value)
    return t
  }
}
Bt.create = e =>
  new Bt({
    checks: [],
    typeName: Z.ZodBigInt,
    coerce: e?.coerce ?? !1,
    ...W(e),
  })
class rr extends G {
  _parse(t) {
    if (
      (this._def.coerce && (t.data = !!t.data), this._getType(t) !== z.boolean)
    ) {
      const r = this._getOrReturnCtx(t)
      return (
        D(r, {
          code: R.invalid_type,
          expected: z.boolean,
          received: r.parsedType,
        }),
        H
      )
    }
    return Se(t.data)
  }
}
rr.create = e =>
  new rr({ typeName: Z.ZodBoolean, coerce: e?.coerce || !1, ...W(e) })
class dn extends G {
  _parse(t) {
    if (
      (this._def.coerce && (t.data = new Date(t.data)),
      this._getType(t) !== z.date)
    ) {
      const i = this._getOrReturnCtx(t)
      return (
        D(i, {
          code: R.invalid_type,
          expected: z.date,
          received: i.parsedType,
        }),
        H
      )
    }
    if (Number.isNaN(t.data.getTime())) {
      const i = this._getOrReturnCtx(t)
      return (D(i, { code: R.invalid_date }), H)
    }
    const r = new we()
    let a
    for (const i of this._def.checks)
      i.kind === 'min'
        ? t.data.getTime() < i.value &&
          ((a = this._getOrReturnCtx(t, a)),
          D(a, {
            code: R.too_small,
            message: i.message,
            inclusive: !0,
            exact: !1,
            minimum: i.value,
            type: 'date',
          }),
          r.dirty())
        : i.kind === 'max'
          ? t.data.getTime() > i.value &&
            ((a = this._getOrReturnCtx(t, a)),
            D(a, {
              code: R.too_big,
              message: i.message,
              inclusive: !0,
              exact: !1,
              maximum: i.value,
              type: 'date',
            }),
            r.dirty())
          : Y.assertNever(i)
    return { status: r.value, value: new Date(t.data.getTime()) }
  }
  _addCheck(t) {
    return new dn({ ...this._def, checks: [...this._def.checks, t] })
  }
  min(t, n) {
    return this._addCheck({
      kind: 'min',
      value: t.getTime(),
      message: $.toString(n),
    })
  }
  max(t, n) {
    return this._addCheck({
      kind: 'max',
      value: t.getTime(),
      message: $.toString(n),
    })
  }
  get minDate() {
    let t = null
    for (const n of this._def.checks)
      n.kind === 'min' && (t === null || n.value > t) && (t = n.value)
    return t != null ? new Date(t) : null
  }
  get maxDate() {
    let t = null
    for (const n of this._def.checks)
      n.kind === 'max' && (t === null || n.value < t) && (t = n.value)
    return t != null ? new Date(t) : null
  }
}
dn.create = e =>
  new dn({ checks: [], coerce: e?.coerce || !1, typeName: Z.ZodDate, ...W(e) })
class as extends G {
  _parse(t) {
    if (this._getType(t) !== z.symbol) {
      const r = this._getOrReturnCtx(t)
      return (
        D(r, {
          code: R.invalid_type,
          expected: z.symbol,
          received: r.parsedType,
        }),
        H
      )
    }
    return Se(t.data)
  }
}
as.create = e => new as({ typeName: Z.ZodSymbol, ...W(e) })
class is extends G {
  _parse(t) {
    if (this._getType(t) !== z.undefined) {
      const r = this._getOrReturnCtx(t)
      return (
        D(r, {
          code: R.invalid_type,
          expected: z.undefined,
          received: r.parsedType,
        }),
        H
      )
    }
    return Se(t.data)
  }
}
is.create = e => new is({ typeName: Z.ZodUndefined, ...W(e) })
class os extends G {
  _parse(t) {
    if (this._getType(t) !== z.null) {
      const r = this._getOrReturnCtx(t)
      return (
        D(r, {
          code: R.invalid_type,
          expected: z.null,
          received: r.parsedType,
        }),
        H
      )
    }
    return Se(t.data)
  }
}
os.create = e => new os({ typeName: Z.ZodNull, ...W(e) })
class ls extends G {
  constructor() {
    ;(super(...arguments), (this._any = !0))
  }
  _parse(t) {
    return Se(t.data)
  }
}
ls.create = e => new ls({ typeName: Z.ZodAny, ...W(e) })
class cs extends G {
  constructor() {
    ;(super(...arguments), (this._unknown = !0))
  }
  _parse(t) {
    return Se(t.data)
  }
}
cs.create = e => new cs({ typeName: Z.ZodUnknown, ...W(e) })
class tt extends G {
  _parse(t) {
    const n = this._getOrReturnCtx(t)
    return (
      D(n, { code: R.invalid_type, expected: z.never, received: n.parsedType }),
      H
    )
  }
}
tt.create = e => new tt({ typeName: Z.ZodNever, ...W(e) })
class ds extends G {
  _parse(t) {
    if (this._getType(t) !== z.undefined) {
      const r = this._getOrReturnCtx(t)
      return (
        D(r, {
          code: R.invalid_type,
          expected: z.void,
          received: r.parsedType,
        }),
        H
      )
    }
    return Se(t.data)
  }
}
ds.create = e => new ds({ typeName: Z.ZodVoid, ...W(e) })
class De extends G {
  _parse(t) {
    const { ctx: n, status: r } = this._processInputParams(t),
      a = this._def
    if (n.parsedType !== z.array)
      return (
        D(n, {
          code: R.invalid_type,
          expected: z.array,
          received: n.parsedType,
        }),
        H
      )
    if (a.exactLength !== null) {
      const o = n.data.length > a.exactLength.value,
        l = n.data.length < a.exactLength.value
      ;(o || l) &&
        (D(n, {
          code: o ? R.too_big : R.too_small,
          minimum: l ? a.exactLength.value : void 0,
          maximum: o ? a.exactLength.value : void 0,
          type: 'array',
          inclusive: !0,
          exact: !0,
          message: a.exactLength.message,
        }),
        r.dirty())
    }
    if (
      (a.minLength !== null &&
        n.data.length < a.minLength.value &&
        (D(n, {
          code: R.too_small,
          minimum: a.minLength.value,
          type: 'array',
          inclusive: !0,
          exact: !1,
          message: a.minLength.message,
        }),
        r.dirty()),
      a.maxLength !== null &&
        n.data.length > a.maxLength.value &&
        (D(n, {
          code: R.too_big,
          maximum: a.maxLength.value,
          type: 'array',
          inclusive: !0,
          exact: !1,
          message: a.maxLength.message,
        }),
        r.dirty()),
      n.common.async)
    )
      return Promise.all(
        [...n.data].map((o, l) => a.type._parseAsync(new et(n, o, n.path, l)))
      ).then(o => we.mergeArray(r, o))
    const i = [...n.data].map((o, l) =>
      a.type._parseSync(new et(n, o, n.path, l))
    )
    return we.mergeArray(r, i)
  }
  get element() {
    return this._def.type
  }
  min(t, n) {
    return new De({
      ...this._def,
      minLength: { value: t, message: $.toString(n) },
    })
  }
  max(t, n) {
    return new De({
      ...this._def,
      maxLength: { value: t, message: $.toString(n) },
    })
  }
  length(t, n) {
    return new De({
      ...this._def,
      exactLength: { value: t, message: $.toString(n) },
    })
  }
  nonempty(t) {
    return this.min(1, t)
  }
}
De.create = (e, t) =>
  new De({
    type: e,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: Z.ZodArray,
    ...W(t),
  })
function xt(e) {
  if (e instanceof le) {
    const t = {}
    for (const n in e.shape) {
      const r = e.shape[n]
      t[n] = Ke.create(xt(r))
    }
    return new le({ ...e._def, shape: () => t })
  } else
    return e instanceof De
      ? new De({ ...e._def, type: xt(e.element) })
      : e instanceof Ke
        ? Ke.create(xt(e.unwrap()))
        : e instanceof St
          ? St.create(xt(e.unwrap()))
          : e instanceof ft
            ? ft.create(e.items.map(t => xt(t)))
            : e
}
class le extends G {
  constructor() {
    ;(super(...arguments),
      (this._cached = null),
      (this.nonstrict = this.passthrough),
      (this.augment = this.extend))
  }
  _getCached() {
    if (this._cached !== null) return this._cached
    const t = this._def.shape(),
      n = Y.objectKeys(t)
    return ((this._cached = { shape: t, keys: n }), this._cached)
  }
  _parse(t) {
    if (this._getType(t) !== z.object) {
      const c = this._getOrReturnCtx(t)
      return (
        D(c, {
          code: R.invalid_type,
          expected: z.object,
          received: c.parsedType,
        }),
        H
      )
    }
    const { status: r, ctx: a } = this._processInputParams(t),
      { shape: i, keys: o } = this._getCached(),
      l = []
    if (
      !(this._def.catchall instanceof tt && this._def.unknownKeys === 'strip')
    )
      for (const c in a.data) o.includes(c) || l.push(c)
    const d = []
    for (const c of o) {
      const u = i[c],
        x = a.data[c]
      d.push({
        key: { status: 'valid', value: c },
        value: u._parse(new et(a, x, a.path, c)),
        alwaysSet: c in a.data,
      })
    }
    if (this._def.catchall instanceof tt) {
      const c = this._def.unknownKeys
      if (c === 'passthrough')
        for (const u of l)
          d.push({
            key: { status: 'valid', value: u },
            value: { status: 'valid', value: a.data[u] },
          })
      else if (c === 'strict')
        l.length > 0 &&
          (D(a, { code: R.unrecognized_keys, keys: l }), r.dirty())
      else if (c !== 'strip')
        throw new Error('Internal ZodObject error: invalid unknownKeys value.')
    } else {
      const c = this._def.catchall
      for (const u of l) {
        const x = a.data[u]
        d.push({
          key: { status: 'valid', value: u },
          value: c._parse(new et(a, x, a.path, u)),
          alwaysSet: u in a.data,
        })
      }
    }
    return a.common.async
      ? Promise.resolve()
          .then(async () => {
            const c = []
            for (const u of d) {
              const x = await u.key,
                b = await u.value
              c.push({ key: x, value: b, alwaysSet: u.alwaysSet })
            }
            return c
          })
          .then(c => we.mergeObjectSync(r, c))
      : we.mergeObjectSync(r, d)
  }
  get shape() {
    return this._def.shape()
  }
  strict(t) {
    return (
      $.errToObj,
      new le({
        ...this._def,
        unknownKeys: 'strict',
        ...(t !== void 0
          ? {
              errorMap: (n, r) => {
                const a = this._def.errorMap?.(n, r).message ?? r.defaultError
                return n.code === 'unrecognized_keys'
                  ? { message: $.errToObj(t).message ?? a }
                  : { message: a }
              },
            }
          : {}),
      })
    )
  }
  strip() {
    return new le({ ...this._def, unknownKeys: 'strip' })
  }
  passthrough() {
    return new le({ ...this._def, unknownKeys: 'passthrough' })
  }
  extend(t) {
    return new le({
      ...this._def,
      shape: () => ({ ...this._def.shape(), ...t }),
    })
  }
  merge(t) {
    return new le({
      unknownKeys: t._def.unknownKeys,
      catchall: t._def.catchall,
      shape: () => ({ ...this._def.shape(), ...t._def.shape() }),
      typeName: Z.ZodObject,
    })
  }
  setKey(t, n) {
    return this.augment({ [t]: n })
  }
  catchall(t) {
    return new le({ ...this._def, catchall: t })
  }
  pick(t) {
    const n = {}
    for (const r of Y.objectKeys(t))
      t[r] && this.shape[r] && (n[r] = this.shape[r])
    return new le({ ...this._def, shape: () => n })
  }
  omit(t) {
    const n = {}
    for (const r of Y.objectKeys(this.shape)) t[r] || (n[r] = this.shape[r])
    return new le({ ...this._def, shape: () => n })
  }
  deepPartial() {
    return xt(this)
  }
  partial(t) {
    const n = {}
    for (const r of Y.objectKeys(this.shape)) {
      const a = this.shape[r]
      t && !t[r] ? (n[r] = a) : (n[r] = a.optional())
    }
    return new le({ ...this._def, shape: () => n })
  }
  required(t) {
    const n = {}
    for (const r of Y.objectKeys(this.shape))
      if (t && !t[r]) n[r] = this.shape[r]
      else {
        let i = this.shape[r]
        for (; i instanceof Ke; ) i = i._def.innerType
        n[r] = i
      }
    return new le({ ...this._def, shape: () => n })
  }
  keyof() {
    return Qa(Y.objectKeys(this.shape))
  }
}
le.create = (e, t) =>
  new le({
    shape: () => e,
    unknownKeys: 'strip',
    catchall: tt.create(),
    typeName: Z.ZodObject,
    ...W(t),
  })
le.strictCreate = (e, t) =>
  new le({
    shape: () => e,
    unknownKeys: 'strict',
    catchall: tt.create(),
    typeName: Z.ZodObject,
    ...W(t),
  })
le.lazycreate = (e, t) =>
  new le({
    shape: e,
    unknownKeys: 'strip',
    catchall: tt.create(),
    typeName: Z.ZodObject,
    ...W(t),
  })
class un extends G {
  _parse(t) {
    const { ctx: n } = this._processInputParams(t),
      r = this._def.options
    function a(i) {
      for (const l of i) if (l.result.status === 'valid') return l.result
      for (const l of i)
        if (l.result.status === 'dirty')
          return (n.common.issues.push(...l.ctx.common.issues), l.result)
      const o = i.map(l => new Ze(l.ctx.common.issues))
      return (D(n, { code: R.invalid_union, unionErrors: o }), H)
    }
    if (n.common.async)
      return Promise.all(
        r.map(async i => {
          const o = { ...n, common: { ...n.common, issues: [] }, parent: null }
          return {
            result: await i._parseAsync({
              data: n.data,
              path: n.path,
              parent: o,
            }),
            ctx: o,
          }
        })
      ).then(a)
    {
      let i
      const o = []
      for (const d of r) {
        const c = { ...n, common: { ...n.common, issues: [] }, parent: null },
          u = d._parseSync({ data: n.data, path: n.path, parent: c })
        if (u.status === 'valid') return u
        ;(u.status === 'dirty' && !i && (i = { result: u, ctx: c }),
          c.common.issues.length && o.push(c.common.issues))
      }
      if (i) return (n.common.issues.push(...i.ctx.common.issues), i.result)
      const l = o.map(d => new Ze(d))
      return (D(n, { code: R.invalid_union, unionErrors: l }), H)
    }
  }
  get options() {
    return this._def.options
  }
}
un.create = (e, t) => new un({ options: e, typeName: Z.ZodUnion, ...W(t) })
function sr(e, t) {
  const n = We(e),
    r = We(t)
  if (e === t) return { valid: !0, data: e }
  if (n === z.object && r === z.object) {
    const a = Y.objectKeys(t),
      i = Y.objectKeys(e).filter(l => a.indexOf(l) !== -1),
      o = { ...e, ...t }
    for (const l of i) {
      const d = sr(e[l], t[l])
      if (!d.valid) return { valid: !1 }
      o[l] = d.data
    }
    return { valid: !0, data: o }
  } else if (n === z.array && r === z.array) {
    if (e.length !== t.length) return { valid: !1 }
    const a = []
    for (let i = 0; i < e.length; i++) {
      const o = e[i],
        l = t[i],
        d = sr(o, l)
      if (!d.valid) return { valid: !1 }
      a.push(d.data)
    }
    return { valid: !0, data: a }
  } else
    return n === z.date && r === z.date && +e == +t
      ? { valid: !0, data: e }
      : { valid: !1 }
}
class fn extends G {
  _parse(t) {
    const { status: n, ctx: r } = this._processInputParams(t),
      a = (i, o) => {
        if (ns(i) || ns(o)) return H
        const l = sr(i.value, o.value)
        return l.valid
          ? ((rs(i) || rs(o)) && n.dirty(), { status: n.value, value: l.data })
          : (D(r, { code: R.invalid_intersection_types }), H)
      }
    return r.common.async
      ? Promise.all([
          this._def.left._parseAsync({ data: r.data, path: r.path, parent: r }),
          this._def.right._parseAsync({
            data: r.data,
            path: r.path,
            parent: r,
          }),
        ]).then(([i, o]) => a(i, o))
      : a(
          this._def.left._parseSync({ data: r.data, path: r.path, parent: r }),
          this._def.right._parseSync({ data: r.data, path: r.path, parent: r })
        )
  }
}
fn.create = (e, t, n) =>
  new fn({ left: e, right: t, typeName: Z.ZodIntersection, ...W(n) })
class ft extends G {
  _parse(t) {
    const { status: n, ctx: r } = this._processInputParams(t)
    if (r.parsedType !== z.array)
      return (
        D(r, {
          code: R.invalid_type,
          expected: z.array,
          received: r.parsedType,
        }),
        H
      )
    if (r.data.length < this._def.items.length)
      return (
        D(r, {
          code: R.too_small,
          minimum: this._def.items.length,
          inclusive: !0,
          exact: !1,
          type: 'array',
        }),
        H
      )
    !this._def.rest &&
      r.data.length > this._def.items.length &&
      (D(r, {
        code: R.too_big,
        maximum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: 'array',
      }),
      n.dirty())
    const i = [...r.data]
      .map((o, l) => {
        const d = this._def.items[l] || this._def.rest
        return d ? d._parse(new et(r, o, r.path, l)) : null
      })
      .filter(o => !!o)
    return r.common.async
      ? Promise.all(i).then(o => we.mergeArray(n, o))
      : we.mergeArray(n, i)
  }
  get items() {
    return this._def.items
  }
  rest(t) {
    return new ft({ ...this._def, rest: t })
  }
}
ft.create = (e, t) => {
  if (!Array.isArray(e))
    throw new Error('You must pass an array of schemas to z.tuple([ ... ])')
  return new ft({ items: e, typeName: Z.ZodTuple, rest: null, ...W(t) })
}
class us extends G {
  get keySchema() {
    return this._def.keyType
  }
  get valueSchema() {
    return this._def.valueType
  }
  _parse(t) {
    const { status: n, ctx: r } = this._processInputParams(t)
    if (r.parsedType !== z.map)
      return (
        D(r, { code: R.invalid_type, expected: z.map, received: r.parsedType }),
        H
      )
    const a = this._def.keyType,
      i = this._def.valueType,
      o = [...r.data.entries()].map(([l, d], c) => ({
        key: a._parse(new et(r, l, r.path, [c, 'key'])),
        value: i._parse(new et(r, d, r.path, [c, 'value'])),
      }))
    if (r.common.async) {
      const l = new Map()
      return Promise.resolve().then(async () => {
        for (const d of o) {
          const c = await d.key,
            u = await d.value
          if (c.status === 'aborted' || u.status === 'aborted') return H
          ;((c.status === 'dirty' || u.status === 'dirty') && n.dirty(),
            l.set(c.value, u.value))
        }
        return { status: n.value, value: l }
      })
    } else {
      const l = new Map()
      for (const d of o) {
        const c = d.key,
          u = d.value
        if (c.status === 'aborted' || u.status === 'aborted') return H
        ;((c.status === 'dirty' || u.status === 'dirty') && n.dirty(),
          l.set(c.value, u.value))
      }
      return { status: n.value, value: l }
    }
  }
}
us.create = (e, t, n) =>
  new us({ valueType: t, keyType: e, typeName: Z.ZodMap, ...W(n) })
class Ft extends G {
  _parse(t) {
    const { status: n, ctx: r } = this._processInputParams(t)
    if (r.parsedType !== z.set)
      return (
        D(r, { code: R.invalid_type, expected: z.set, received: r.parsedType }),
        H
      )
    const a = this._def
    ;(a.minSize !== null &&
      r.data.size < a.minSize.value &&
      (D(r, {
        code: R.too_small,
        minimum: a.minSize.value,
        type: 'set',
        inclusive: !0,
        exact: !1,
        message: a.minSize.message,
      }),
      n.dirty()),
      a.maxSize !== null &&
        r.data.size > a.maxSize.value &&
        (D(r, {
          code: R.too_big,
          maximum: a.maxSize.value,
          type: 'set',
          inclusive: !0,
          exact: !1,
          message: a.maxSize.message,
        }),
        n.dirty()))
    const i = this._def.valueType
    function o(d) {
      const c = new Set()
      for (const u of d) {
        if (u.status === 'aborted') return H
        ;(u.status === 'dirty' && n.dirty(), c.add(u.value))
      }
      return { status: n.value, value: c }
    }
    const l = [...r.data.values()].map((d, c) =>
      i._parse(new et(r, d, r.path, c))
    )
    return r.common.async ? Promise.all(l).then(d => o(d)) : o(l)
  }
  min(t, n) {
    return new Ft({
      ...this._def,
      minSize: { value: t, message: $.toString(n) },
    })
  }
  max(t, n) {
    return new Ft({
      ...this._def,
      maxSize: { value: t, message: $.toString(n) },
    })
  }
  size(t, n) {
    return this.min(t, n).max(t, n)
  }
  nonempty(t) {
    return this.min(1, t)
  }
}
Ft.create = (e, t) =>
  new Ft({
    valueType: e,
    minSize: null,
    maxSize: null,
    typeName: Z.ZodSet,
    ...W(t),
  })
class fs extends G {
  get schema() {
    return this._def.getter()
  }
  _parse(t) {
    const { ctx: n } = this._processInputParams(t)
    return this._def.getter()._parse({ data: n.data, path: n.path, parent: n })
  }
}
fs.create = (e, t) => new fs({ getter: e, typeName: Z.ZodLazy, ...W(t) })
class ar extends G {
  _parse(t) {
    if (t.data !== this._def.value) {
      const n = this._getOrReturnCtx(t)
      return (
        D(n, {
          received: n.data,
          code: R.invalid_literal,
          expected: this._def.value,
        }),
        H
      )
    }
    return { status: 'valid', value: t.data }
  }
  get value() {
    return this._def.value
  }
}
ar.create = (e, t) => new ar({ value: e, typeName: Z.ZodLiteral, ...W(t) })
function Qa(e, t) {
  return new Nt({ values: e, typeName: Z.ZodEnum, ...W(t) })
}
class Nt extends G {
  _parse(t) {
    if (typeof t.data != 'string') {
      const n = this._getOrReturnCtx(t),
        r = this._def.values
      return (
        D(n, {
          expected: Y.joinValues(r),
          received: n.parsedType,
          code: R.invalid_type,
        }),
        H
      )
    }
    if (
      (this._cache || (this._cache = new Set(this._def.values)),
      !this._cache.has(t.data))
    ) {
      const n = this._getOrReturnCtx(t),
        r = this._def.values
      return (
        D(n, { received: n.data, code: R.invalid_enum_value, options: r }),
        H
      )
    }
    return Se(t.data)
  }
  get options() {
    return this._def.values
  }
  get enum() {
    const t = {}
    for (const n of this._def.values) t[n] = n
    return t
  }
  get Values() {
    const t = {}
    for (const n of this._def.values) t[n] = n
    return t
  }
  get Enum() {
    const t = {}
    for (const n of this._def.values) t[n] = n
    return t
  }
  extract(t, n = this._def) {
    return Nt.create(t, { ...this._def, ...n })
  }
  exclude(t, n = this._def) {
    return Nt.create(
      this.options.filter(r => !t.includes(r)),
      { ...this._def, ...n }
    )
  }
}
Nt.create = Qa
class ir extends G {
  _parse(t) {
    const n = Y.getValidEnumValues(this._def.values),
      r = this._getOrReturnCtx(t)
    if (r.parsedType !== z.string && r.parsedType !== z.number) {
      const a = Y.objectValues(n)
      return (
        D(r, {
          expected: Y.joinValues(a),
          received: r.parsedType,
          code: R.invalid_type,
        }),
        H
      )
    }
    if (
      (this._cache ||
        (this._cache = new Set(Y.getValidEnumValues(this._def.values))),
      !this._cache.has(t.data))
    ) {
      const a = Y.objectValues(n)
      return (
        D(r, { received: r.data, code: R.invalid_enum_value, options: a }),
        H
      )
    }
    return Se(t.data)
  }
  get enum() {
    return this._def.values
  }
}
ir.create = (e, t) => new ir({ values: e, typeName: Z.ZodNativeEnum, ...W(t) })
class mn extends G {
  unwrap() {
    return this._def.type
  }
  _parse(t) {
    const { ctx: n } = this._processInputParams(t)
    if (n.parsedType !== z.promise && n.common.async === !1)
      return (
        D(n, {
          code: R.invalid_type,
          expected: z.promise,
          received: n.parsedType,
        }),
        H
      )
    const r = n.parsedType === z.promise ? n.data : Promise.resolve(n.data)
    return Se(
      r.then(a =>
        this._def.type.parseAsync(a, {
          path: n.path,
          errorMap: n.common.contextualErrorMap,
        })
      )
    )
  }
}
mn.create = (e, t) => new mn({ type: e, typeName: Z.ZodPromise, ...W(t) })
class _t extends G {
  innerType() {
    return this._def.schema
  }
  sourceType() {
    return this._def.schema._def.typeName === Z.ZodEffects
      ? this._def.schema.sourceType()
      : this._def.schema
  }
  _parse(t) {
    const { status: n, ctx: r } = this._processInputParams(t),
      a = this._def.effect || null,
      i = {
        addIssue: o => {
          ;(D(r, o), o.fatal ? n.abort() : n.dirty())
        },
        get path() {
          return r.path
        },
      }
    if (((i.addIssue = i.addIssue.bind(i)), a.type === 'preprocess')) {
      const o = a.transform(r.data, i)
      if (r.common.async)
        return Promise.resolve(o).then(async l => {
          if (n.value === 'aborted') return H
          const d = await this._def.schema._parseAsync({
            data: l,
            path: r.path,
            parent: r,
          })
          return d.status === 'aborted'
            ? H
            : d.status === 'dirty' || n.value === 'dirty'
              ? Dt(d.value)
              : d
        })
      {
        if (n.value === 'aborted') return H
        const l = this._def.schema._parseSync({
          data: o,
          path: r.path,
          parent: r,
        })
        return l.status === 'aborted'
          ? H
          : l.status === 'dirty' || n.value === 'dirty'
            ? Dt(l.value)
            : l
      }
    }
    if (a.type === 'refinement') {
      const o = l => {
        const d = a.refinement(l, i)
        if (r.common.async) return Promise.resolve(d)
        if (d instanceof Promise)
          throw new Error(
            'Async refinement encountered during synchronous parse operation. Use .parseAsync instead.'
          )
        return l
      }
      if (r.common.async === !1) {
        const l = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r,
        })
        return l.status === 'aborted'
          ? H
          : (l.status === 'dirty' && n.dirty(),
            o(l.value),
            { status: n.value, value: l.value })
      } else
        return this._def.schema
          ._parseAsync({ data: r.data, path: r.path, parent: r })
          .then(l =>
            l.status === 'aborted'
              ? H
              : (l.status === 'dirty' && n.dirty(),
                o(l.value).then(() => ({ status: n.value, value: l.value })))
          )
    }
    if (a.type === 'transform')
      if (r.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: r.data,
          path: r.path,
          parent: r,
        })
        if (!jt(o)) return H
        const l = a.transform(o.value, i)
        if (l instanceof Promise)
          throw new Error(
            'Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.'
          )
        return { status: n.value, value: l }
      } else
        return this._def.schema
          ._parseAsync({ data: r.data, path: r.path, parent: r })
          .then(o =>
            jt(o)
              ? Promise.resolve(a.transform(o.value, i)).then(l => ({
                  status: n.value,
                  value: l,
                }))
              : H
          )
    Y.assertNever(a)
  }
}
_t.create = (e, t, n) =>
  new _t({ schema: e, typeName: Z.ZodEffects, effect: t, ...W(n) })
_t.createWithPreprocess = (e, t, n) =>
  new _t({
    schema: t,
    effect: { type: 'preprocess', transform: e },
    typeName: Z.ZodEffects,
    ...W(n),
  })
class Ke extends G {
  _parse(t) {
    return this._getType(t) === z.undefined
      ? Se(void 0)
      : this._def.innerType._parse(t)
  }
  unwrap() {
    return this._def.innerType
  }
}
Ke.create = (e, t) => new Ke({ innerType: e, typeName: Z.ZodOptional, ...W(t) })
class St extends G {
  _parse(t) {
    return this._getType(t) === z.null
      ? Se(null)
      : this._def.innerType._parse(t)
  }
  unwrap() {
    return this._def.innerType
  }
}
St.create = (e, t) => new St({ innerType: e, typeName: Z.ZodNullable, ...W(t) })
class or extends G {
  _parse(t) {
    const { ctx: n } = this._processInputParams(t)
    let r = n.data
    return (
      n.parsedType === z.undefined && (r = this._def.defaultValue()),
      this._def.innerType._parse({ data: r, path: n.path, parent: n })
    )
  }
  removeDefault() {
    return this._def.innerType
  }
}
or.create = (e, t) =>
  new or({
    innerType: e,
    typeName: Z.ZodDefault,
    defaultValue: typeof t.default == 'function' ? t.default : () => t.default,
    ...W(t),
  })
class lr extends G {
  _parse(t) {
    const { ctx: n } = this._processInputParams(t),
      r = { ...n, common: { ...n.common, issues: [] } },
      a = this._def.innerType._parse({
        data: r.data,
        path: r.path,
        parent: { ...r },
      })
    return cn(a)
      ? a.then(i => ({
          status: 'valid',
          value:
            i.status === 'valid'
              ? i.value
              : this._def.catchValue({
                  get error() {
                    return new Ze(r.common.issues)
                  },
                  input: r.data,
                }),
        }))
      : {
          status: 'valid',
          value:
            a.status === 'valid'
              ? a.value
              : this._def.catchValue({
                  get error() {
                    return new Ze(r.common.issues)
                  },
                  input: r.data,
                }),
        }
  }
  removeCatch() {
    return this._def.innerType
  }
}
lr.create = (e, t) =>
  new lr({
    innerType: e,
    typeName: Z.ZodCatch,
    catchValue: typeof t.catch == 'function' ? t.catch : () => t.catch,
    ...W(t),
  })
class ms extends G {
  _parse(t) {
    if (this._getType(t) !== z.nan) {
      const r = this._getOrReturnCtx(t)
      return (
        D(r, { code: R.invalid_type, expected: z.nan, received: r.parsedType }),
        H
      )
    }
    return { status: 'valid', value: t.data }
  }
}
ms.create = e => new ms({ typeName: Z.ZodNaN, ...W(e) })
class Rd extends G {
  _parse(t) {
    const { ctx: n } = this._processInputParams(t),
      r = n.data
    return this._def.type._parse({ data: r, path: n.path, parent: n })
  }
  unwrap() {
    return this._def.type
  }
}
class Nr extends G {
  _parse(t) {
    const { status: n, ctx: r } = this._processInputParams(t)
    if (r.common.async)
      return (async () => {
        const i = await this._def.in._parseAsync({
          data: r.data,
          path: r.path,
          parent: r,
        })
        return i.status === 'aborted'
          ? H
          : i.status === 'dirty'
            ? (n.dirty(), Dt(i.value))
            : this._def.out._parseAsync({
                data: i.value,
                path: r.path,
                parent: r,
              })
      })()
    {
      const a = this._def.in._parseSync({
        data: r.data,
        path: r.path,
        parent: r,
      })
      return a.status === 'aborted'
        ? H
        : a.status === 'dirty'
          ? (n.dirty(), { status: 'dirty', value: a.value })
          : this._def.out._parseSync({ data: a.value, path: r.path, parent: r })
    }
  }
  static create(t, n) {
    return new Nr({ in: t, out: n, typeName: Z.ZodPipeline })
  }
}
class cr extends G {
  _parse(t) {
    const n = this._def.innerType._parse(t),
      r = a => (jt(a) && (a.value = Object.freeze(a.value)), a)
    return cn(n) ? n.then(a => r(a)) : r(n)
  }
  unwrap() {
    return this._def.innerType
  }
}
cr.create = (e, t) => new cr({ innerType: e, typeName: Z.ZodReadonly, ...W(t) })
var Z
;(function (e) {
  ;((e.ZodString = 'ZodString'),
    (e.ZodNumber = 'ZodNumber'),
    (e.ZodNaN = 'ZodNaN'),
    (e.ZodBigInt = 'ZodBigInt'),
    (e.ZodBoolean = 'ZodBoolean'),
    (e.ZodDate = 'ZodDate'),
    (e.ZodSymbol = 'ZodSymbol'),
    (e.ZodUndefined = 'ZodUndefined'),
    (e.ZodNull = 'ZodNull'),
    (e.ZodAny = 'ZodAny'),
    (e.ZodUnknown = 'ZodUnknown'),
    (e.ZodNever = 'ZodNever'),
    (e.ZodVoid = 'ZodVoid'),
    (e.ZodArray = 'ZodArray'),
    (e.ZodObject = 'ZodObject'),
    (e.ZodUnion = 'ZodUnion'),
    (e.ZodDiscriminatedUnion = 'ZodDiscriminatedUnion'),
    (e.ZodIntersection = 'ZodIntersection'),
    (e.ZodTuple = 'ZodTuple'),
    (e.ZodRecord = 'ZodRecord'),
    (e.ZodMap = 'ZodMap'),
    (e.ZodSet = 'ZodSet'),
    (e.ZodFunction = 'ZodFunction'),
    (e.ZodLazy = 'ZodLazy'),
    (e.ZodLiteral = 'ZodLiteral'),
    (e.ZodEnum = 'ZodEnum'),
    (e.ZodEffects = 'ZodEffects'),
    (e.ZodNativeEnum = 'ZodNativeEnum'),
    (e.ZodOptional = 'ZodOptional'),
    (e.ZodNullable = 'ZodNullable'),
    (e.ZodDefault = 'ZodDefault'),
    (e.ZodCatch = 'ZodCatch'),
    (e.ZodPromise = 'ZodPromise'),
    (e.ZodBranded = 'ZodBranded'),
    (e.ZodPipeline = 'ZodPipeline'),
    (e.ZodReadonly = 'ZodReadonly'))
})(Z || (Z = {}))
const U = Ge.create,
  yt = Ct.create,
  Ja = rr.create
tt.create
const mt = De.create,
  At = le.create
un.create
fn.create
ft.create
const Yt = ar.create,
  Ye = Nt.create,
  Id = ir.create
mn.create
Ke.create
St.create
const ei = At({
    name: U().min(2, 'Il nome è obbligatorio'),
    surname: U().min(2, 'Il cognome è obbligatorio'),
    email: U().email('Email non valida').optional().or(Yt('')),
    phone: U()
      .regex(/^[0-9+\s-]*$/, 'Numero di telefono non valido')
      .optional()
      .or(Yt('')),
    role: Ye(['admin', 'responsabile', 'dipendente', 'collaboratore']),
    categories: mt(U()).min(1, 'Seleziona almeno una categoria'),
    departmentAssignments: mt(U()),
    haccpExpiry: U().optional().or(Yt('')),
    notes: U().optional().or(Yt('')),
  }),
  Pd = e => ({
    name: e.name,
    surname: e.surname,
    email: e.email || '',
    phone: e.phone || '',
    role: e.role,
    categories: e.categories.length ? e.categories : ['Altro'],
    departmentAssignments: e.department_assignments || [],
    haccpExpiry: e.haccpExpiry || '',
    notes: e.notes || '',
  }),
  ti = e => e.every(t => !tr.includes(t)),
  dr = e => {
    const t = ei.safeParse({
      name: e.name,
      surname: e.surname,
      email: e.email || '',
      phone: e.phone || '',
      role: e.role,
      categories: e.categories,
      departmentAssignments: e.department_assignments || [],
      haccpExpiry: e.haccpExpiry || '',
      notes: e.notes || '',
    })
    if (!t.success) {
      const n = {}
      return (
        t.error.issues.forEach(r => {
          r.path[0] && (n[r.path[0]] = r.message)
        }),
        { success: !1, fieldErrors: n }
      )
    }
    return !ti(e.categories) &&
      (!e.haccpExpiry || e.haccpExpiry.trim().length === 0)
      ? {
          success: !1,
          fieldErrors: {
            haccpExpiry:
              'La certificazione HACCP è obbligatoria per questa categoria',
          },
        }
      : { success: !0 }
  },
  Od = (e, t) => {
    const n = ei.safeParse(e),
      r = {}
    if (!n.success)
      return (
        n.error.issues.forEach(d => {
          d.path[0] && (r[d.path[0]] = d.message)
        }),
        { validation: { success: !1, fieldErrors: r } }
      )
    if (
      !ti(e.categories) &&
      (!e.haccpExpiry || e.haccpExpiry.trim().length === 0)
    )
      return (
        (r.haccpExpiry =
          'Inserisci la data di scadenza della certificazione HACCP'),
        { validation: { success: !1, fieldErrors: r } }
      )
    const i = Cr.some(d => d.value === e.role) ? e.role : 'dipendente',
      o = {
        id:
          t || `staff_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        name: e.name.trim(),
        surname: e.surname.trim(),
        fullName: `${e.name.trim()} ${e.surname.trim()}`,
        role: i,
        email: e.email.trim() || void 0,
        phone: e.phone.trim() || void 0,
        categories: Array.from(new Set(e.categories)),
        department_assignments: e.departmentAssignments,
        haccpExpiry: e.haccpExpiry || void 0,
        notes: e.notes || void 0,
      },
      l = dr(o)
    return l.success
      ? { member: o, validation: { success: !0 } }
      : { validation: l }
  },
  Ln = e => {
    if (!e)
      return {
        level: 'missing',
        message: 'Certificazione HACCP non registrata',
      }
    const t = new Date(e),
      n = new Date()
    if (Number.isNaN(t.getTime()))
      return { level: 'missing', message: 'Data certificazione non valida' }
    const r = t.getTime() - n.getTime(),
      a = Math.ceil(r / (1e3 * 60 * 60 * 24))
    return a < 0
      ? {
          level: 'expired',
          message: `Certificato scaduto da ${Math.abs(a)} giorni`,
        }
      : a <= 30
        ? { level: 'warning', message: `Scade tra ${a} giorni` }
        : {
            level: 'ok',
            message: `Valido fino al ${t.toLocaleDateString('it-IT')}`,
          }
  },
  ps = {
    name: '',
    surname: '',
    email: '',
    phone: '',
    role: Cr[0].value,
    categories: [er[0].value],
    departmentAssignments: [],
    haccpExpiry: '',
    notes: '',
  },
  Dd = ({ data: e, departments: t, onUpdate: n, onValidChange: r }) => {
    const [a, i] = f.useState(e || []),
      [o, l] = f.useState({ ...ps }),
      [d, c] = f.useState(null),
      [u, x] = f.useState({}),
      { formRef: b, scrollToForm: j } = Ti(!!d, 'staff-step-form')
    ;(f.useEffect(() => {
      n(a)
    }, [a, n]),
      f.useEffect(() => {
        const y = a.length > 0 && a.every(T => dr(T).success)
        r(y)
      }, [a, r]))
    const w = f.useMemo(() => t.filter(y => y.is_active !== !1), [t]),
      m = () => {
        ;(l(ps), x({}), c(null))
      },
      v = y => {
        ;(c(y.id), l(Pd(y)), x({}), j())
      },
      h = y => {
        ;(i(T => T.filter(_ => _.id !== y)), d === y && m())
      },
      C = y => {
        y.preventDefault()
        const { member: T, validation: _ } = Od(o, d)
        ;(x(_.fieldErrors || {}),
          !(!_.success || !T) &&
            (i(S => (d ? S.map(N => (N.id === d ? T : N)) : [...S, T])), m()))
      },
      A = f.useMemo(() => {
        if (a.length === 0) return null
        const y = a.filter(N => N.categories.some(P => tr.includes(P))),
          T = y.filter(N => dr(N).success && !!N.haccpExpiry),
          _ = y.filter(N => Ln(N.haccpExpiry).level === 'warning'),
          S = y.filter(N => Ln(N.haccpExpiry).level === 'expired')
        return {
          total: a.length,
          requiringCertification: y.length,
          compliant: T.length,
          expiringSoon: _.length,
          expired: S.length,
        }
      }, [a])
    return s.jsxs('div', {
      className: 'space-y-6',
      id: 'staff-step',
      children: [
        s.jsxs('header', {
          className: 'text-center space-y-2',
          children: [
            s.jsx('h2', {
              className: 'text-2xl font-bold text-gray-900',
              children: 'Gestione del Personale',
            }),
            s.jsx('p', {
              className: 'text-gray-600 max-w-2xl mx-auto',
              children:
                'Registra ruoli, categorie operative e certificazioni HACCP del personale per garantire la conformità normativa.',
            }),
          ],
        }),
        A &&
          s.jsxs('section', {
            className: 'grid gap-4 md:grid-cols-2',
            children: [
              s.jsxs('div', {
                className: 'rounded-lg border border-blue-100 bg-blue-50 p-4',
                children: [
                  s.jsx('h3', {
                    className: 'text-sm font-semibold text-blue-900 mb-2',
                    children: 'Panoramica HACCP',
                  }),
                  s.jsxs('dl', {
                    className: 'space-y-1 text-sm text-blue-800',
                    children: [
                      s.jsxs('div', {
                        className: 'flex justify-between',
                        children: [
                          s.jsx('dt', { children: 'Membri registrati' }),
                          s.jsx('dd', {
                            className: 'font-semibold',
                            children: A.total,
                          }),
                        ],
                      }),
                      s.jsxs('div', {
                        className: 'flex justify-between',
                        children: [
                          s.jsx('dt', {
                            children: 'Richiedono certificazione',
                          }),
                          s.jsx('dd', {
                            className: 'font-semibold',
                            children: A.requiringCertification,
                          }),
                        ],
                      }),
                      s.jsxs('div', {
                        className: 'flex justify-between',
                        children: [
                          s.jsx('dt', { children: 'Certificazioni valide' }),
                          s.jsx('dd', {
                            className: 'font-semibold',
                            children: A.compliant,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              s.jsxs('div', {
                className: 'rounded-lg border border-amber-100 bg-amber-50 p-4',
                children: [
                  s.jsx('h3', {
                    className: 'text-sm font-semibold text-amber-900 mb-2',
                    children: 'Scadenze monitorate',
                  }),
                  s.jsxs('dl', {
                    className: 'space-y-1 text-sm text-amber-800',
                    children: [
                      s.jsxs('div', {
                        className: 'flex justify-between',
                        children: [
                          s.jsx('dt', { children: 'Certificati in scadenza' }),
                          s.jsx('dd', {
                            className: 'font-semibold',
                            children: A.expiringSoon,
                          }),
                        ],
                      }),
                      s.jsxs('div', {
                        className: 'flex justify-between',
                        children: [
                          s.jsx('dt', { children: 'Certificati scaduti' }),
                          s.jsx('dd', {
                            className: 'font-semibold',
                            children: A.expired,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        s.jsxs('section', {
          className: 'rounded-lg border border-gray-200 bg-white',
          children: [
            s.jsxs('header', {
              className:
                'border-b border-gray-100 px-4 py-3 flex items-center justify-between',
              children: [
                s.jsxs('div', {
                  children: [
                    s.jsx('h3', {
                      className: 'font-semibold text-gray-900',
                      children: 'Staff configurato',
                    }),
                    s.jsx('p', {
                      className: 'text-sm text-gray-500',
                      children:
                        "Elenco dei membri registrati durante l'onboarding",
                    }),
                  ],
                }),
                s.jsxs(re, {
                  variant: 'ghost',
                  className: 'gap-2',
                  onClick: j,
                  children: [
                    s.jsx(ot, { className: 'h-4 w-4' }),
                    d ? 'Modifica membro' : 'Aggiungi membro',
                  ],
                }),
              ],
            }),
            s.jsxs('div', {
              className: 'divide-y divide-gray-100',
              children: [
                a.length === 0 &&
                  s.jsx('p', {
                    className: 'px-4 py-8 text-center text-sm text-gray-500',
                    children:
                      'Nessun membro dello staff registrato. Aggiungi almeno un membro per procedere.',
                  }),
                a.map(y => {
                  const T = y.categories.some(S => tr.includes(S)),
                    _ = Ln(y.haccpExpiry)
                  return s.jsxs(
                    'article',
                    {
                      className:
                        'grid gap-4 px-4 py-3 md:grid-cols-[1fr_auto] md:items-start',
                      children: [
                        s.jsxs('div', {
                          className: 'space-y-2',
                          children: [
                            s.jsxs('div', {
                              className: 'flex flex-wrap items-center gap-2',
                              children: [
                                s.jsx('h4', {
                                  className:
                                    'text-base font-semibold text-gray-900',
                                  children: y.fullName,
                                }),
                                s.jsx(be, { children: y.role }),
                              ],
                            }),
                            s.jsxs('div', {
                              className:
                                'flex flex-wrap gap-2 text-xs text-gray-600',
                              children: [
                                y.email &&
                                  s.jsx(be, {
                                    variant: 'secondary',
                                    children: y.email,
                                  }),
                                y.phone &&
                                  s.jsx(be, {
                                    variant: 'secondary',
                                    children: y.phone,
                                  }),
                              ],
                            }),
                            s.jsx('div', {
                              className:
                                'flex flex-wrap gap-2 text-xs text-gray-600',
                              children: y.categories.map(S =>
                                s.jsx(
                                  be,
                                  { variant: 'outline', children: S },
                                  S
                                )
                              ),
                            }),
                            y.department_assignments.length > 0 &&
                              s.jsx('div', {
                                className:
                                  'flex flex-wrap gap-2 text-xs text-gray-600',
                                children: y.department_assignments.map(S => {
                                  const N = t.find(P => P.id === S)
                                  return N
                                    ? s.jsx(
                                        be,
                                        {
                                          variant: 'outline',
                                          children: N.name,
                                        },
                                        S
                                      )
                                    : null
                                }),
                              }),
                            T &&
                              s.jsxs('div', {
                                className:
                                  'mt-3 flex items-center gap-2 text-sm',
                                children: [
                                  _.level === 'ok'
                                    ? s.jsx(Bn, {
                                        className: 'h-4 w-4 text-green-600',
                                        'aria-hidden': !0,
                                      })
                                    : s.jsx(Cs, {
                                        className: 'h-4 w-4 text-amber-600',
                                        'aria-hidden': !0,
                                      }),
                                  s.jsx('span', {
                                    className:
                                      _.level === 'expired'
                                        ? 'text-red-600 font-semibold'
                                        : _.level === 'warning'
                                          ? 'text-amber-600 font-semibold'
                                          : 'text-green-700',
                                    children: _.message,
                                  }),
                                ],
                              }),
                            y.notes &&
                              s.jsx('p', {
                                className:
                                  'text-sm text-gray-500 border-l-2 border-gray-200 pl-3',
                                children: y.notes,
                              }),
                          ],
                        }),
                        s.jsxs('div', {
                          className: 'flex gap-2',
                          children: [
                            s.jsx(re, {
                              variant: 'outline',
                              size: 'icon',
                              onClick: () => v(y),
                              'aria-label': 'Modifica membro',
                              children: s.jsx(it, {
                                className: 'h-4 w-4',
                                'aria-hidden': !0,
                              }),
                            }),
                            s.jsx(re, {
                              variant: 'destructive',
                              size: 'icon',
                              onClick: () => h(y.id),
                              'aria-label': 'Elimina membro',
                              children: s.jsx(Xe, {
                                className: 'h-4 w-4',
                                'aria-hidden': !0,
                              }),
                            }),
                          ],
                        }),
                      ],
                    },
                    y.id
                  )
                }),
              ],
            }),
          ],
        }),
        s.jsxs('section', {
          id: 'staff-step-form',
          ref: b,
          className: 'rounded-lg border border-gray-200 bg-gray-50 p-4',
          children: [
            s.jsxs('header', {
              className: 'mb-4',
              children: [
                s.jsx('h3', {
                  className: 'text-lg font-semibold text-gray-900',
                  children: d
                    ? 'Modifica membro dello staff'
                    : 'Aggiungi nuovo membro',
                }),
                s.jsx('p', {
                  className: 'text-sm text-gray-500',
                  children:
                    'Compila i campi obbligatori per registrare il personale. Le certificazioni HACCP sono richieste solo per le categorie operative.',
                }),
              ],
            }),
            s.jsxs('form', {
              className: 'space-y-6',
              onSubmit: C,
              children: [
                s.jsxs('div', {
                  className: 'grid gap-4 md:grid-cols-2',
                  children: [
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, { htmlFor: 'staff-name', children: 'Nome *' }),
                        s.jsx(Fe, {
                          id: 'staff-name',
                          value: o.name,
                          onChange: y =>
                            l(T => ({ ...T, name: y.target.value })),
                          placeholder: 'Mario',
                          'aria-invalid': !!u.name,
                        }),
                        u.name &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: u.name,
                          }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, {
                          htmlFor: 'staff-surname',
                          children: 'Cognome *',
                        }),
                        s.jsx(Fe, {
                          id: 'staff-surname',
                          value: o.surname,
                          onChange: y =>
                            l(T => ({ ...T, surname: y.target.value })),
                          placeholder: 'Rossi',
                          'aria-invalid': !!u.surname,
                        }),
                        u.surname &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: u.surname,
                          }),
                      ],
                    }),
                  ],
                }),
                s.jsxs('div', {
                  className: 'grid gap-4 md:grid-cols-2',
                  children: [
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, { htmlFor: 'staff-email', children: 'Email' }),
                        s.jsx(Fe, {
                          id: 'staff-email',
                          type: 'email',
                          value: o.email,
                          onChange: y =>
                            l(T => ({ ...T, email: y.target.value })),
                          placeholder: 'email@azienda.it',
                          'aria-invalid': !!u.email,
                        }),
                        u.email &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: u.email,
                          }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, {
                          htmlFor: 'staff-phone',
                          children: 'Telefono',
                        }),
                        s.jsx(Fe, {
                          id: 'staff-phone',
                          value: o.phone,
                          onChange: y =>
                            l(T => ({ ...T, phone: y.target.value })),
                          placeholder: '+39 340 1234567',
                          'aria-invalid': !!u.phone,
                        }),
                        u.phone &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: u.phone,
                          }),
                      ],
                    }),
                  ],
                }),
                s.jsxs('div', {
                  className: 'grid gap-4 md:grid-cols-2',
                  children: [
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, {
                          htmlFor: 'staff-role',
                          children: 'Ruolo *',
                        }),
                        s.jsxs(Te, {
                          value: o.role,
                          onValueChange: y => l(T => ({ ...T, role: y })),
                          children: [
                            s.jsx(Ce, {
                              children: s.jsx(Ee, {
                                placeholder: 'Seleziona ruolo',
                              }),
                            }),
                            s.jsx(Ne, {
                              children: Cr.map(y =>
                                s.jsx(
                                  se,
                                  { value: y.value, children: y.label },
                                  y.value
                                )
                              ),
                            }),
                          ],
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, { children: 'Categorie *' }),
                        s.jsxs('div', {
                          className: 'space-y-2',
                          children: [
                            o.categories.map((y, T) =>
                              s.jsxs(
                                'div',
                                {
                                  className: 'flex items-center gap-2',
                                  children: [
                                    s.jsxs(Te, {
                                      value: y,
                                      onValueChange: _ =>
                                        l(S => ({
                                          ...S,
                                          categories: S.categories.map(
                                            (N, P) => (P === T ? _ : N)
                                          ),
                                        })),
                                      children: [
                                        s.jsx(Ce, {
                                          children: s.jsx(Ee, {
                                            placeholder: 'Seleziona categoria',
                                          }),
                                        }),
                                        s.jsx(Ne, {
                                          children: er.map(_ =>
                                            s.jsx(
                                              se,
                                              {
                                                value: _.value,
                                                children: _.label,
                                              },
                                              _.value
                                            )
                                          ),
                                        }),
                                      ],
                                    }),
                                    o.categories.length > 1 &&
                                      s.jsx(re, {
                                        type: 'button',
                                        variant: 'ghost',
                                        size: 'icon',
                                        onClick: () =>
                                          l(_ => ({
                                            ..._,
                                            categories: _.categories.filter(
                                              (S, N) => N !== T
                                            ),
                                          })),
                                        'aria-label': 'Rimuovi categoria',
                                        children: s.jsx(Xe, {
                                          className: 'h-4 w-4',
                                          'aria-hidden': !0,
                                        }),
                                      }),
                                  ],
                                },
                                `category-${T}`
                              )
                            ),
                            s.jsx(re, {
                              type: 'button',
                              variant: 'outline',
                              onClick: () =>
                                l(y => ({
                                  ...y,
                                  categories: [...y.categories, er[0].value],
                                })),
                              className: 'w-full',
                              children: 'Aggiungi categoria',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                s.jsxs('div', {
                  children: [
                    s.jsx(K, { children: 'Assegnazione reparti' }),
                    s.jsxs('div', {
                      className: 'mt-2 space-y-2',
                      children: [
                        s.jsxs('label', {
                          className:
                            'flex items-center gap-2 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium',
                          children: [
                            s.jsx('input', {
                              type: 'checkbox',
                              checked:
                                o.departmentAssignments.length === w.length &&
                                w.length > 0,
                              onChange: y => {
                                const T = y.target.checked
                                l(_ => ({
                                  ..._,
                                  departmentAssignments: T
                                    ? w.map(S => S.id)
                                    : [],
                                }))
                              },
                              className:
                                'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                            }),
                            s.jsx('span', {
                              className: 'text-blue-800',
                              children: '🎯 Tutti i reparti',
                            }),
                          ],
                        }),
                        s.jsx('div', {
                          className: 'grid gap-2 md:grid-cols-2',
                          children: w.map(y =>
                            s.jsxs(
                              'label',
                              {
                                className:
                                  'flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2 text-sm',
                                children: [
                                  s.jsx('input', {
                                    type: 'checkbox',
                                    checked: o.departmentAssignments.includes(
                                      y.id
                                    ),
                                    onChange: T => {
                                      const _ = T.target.checked
                                      l(S => ({
                                        ...S,
                                        departmentAssignments: _
                                          ? [...S.departmentAssignments, y.id]
                                          : S.departmentAssignments.filter(
                                              N => N !== y.id
                                            ),
                                      }))
                                    },
                                    className:
                                      'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                                  }),
                                  s.jsx('span', { children: y.name }),
                                ],
                              },
                              y.id
                            )
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                s.jsxs('div', {
                  children: [
                    s.jsx(K, {
                      htmlFor: 'staff-haccp-expiry',
                      children: 'Scadenza certificazione HACCP *',
                    }),
                    s.jsx(Fe, {
                      id: 'staff-haccp-expiry',
                      type: 'date',
                      value: o.haccpExpiry,
                      onChange: y =>
                        l(T => ({ ...T, haccpExpiry: y.target.value })),
                      'aria-invalid': !!u.haccpExpiry,
                    }),
                    u.haccpExpiry &&
                      s.jsx('p', {
                        className: 'mt-1 text-sm text-red-600',
                        children: u.haccpExpiry,
                      }),
                  ],
                }),
                s.jsxs('div', {
                  children: [
                    s.jsx(K, { htmlFor: 'staff-notes', children: 'Note' }),
                    s.jsx(Ht, {
                      id: 'staff-notes',
                      value: o.notes,
                      onChange: y => l(T => ({ ...T, notes: y.target.value })),
                      placeholder:
                        'Aggiungi note sulla certificazione HACCP o sul membro',
                    }),
                  ],
                }),
                s.jsx(re, {
                  type: 'submit',
                  className: 'w-full',
                  children: d ? 'Salva modifiche' : 'Aggiungi membro',
                }),
              ],
            }),
          ],
        }),
      ],
    })
  },
  en = {
    ambient: {
      value: 'ambient',
      label: 'Ambiente (dispense)',
      temperatureRange: { min: null, max: null },
      color: 'text-amber-600',
    },
    fridge: {
      value: 'fridge',
      label: 'Frigorifero',
      temperatureRange: { min: 1, max: 15 },
      color: 'text-blue-600',
    },
    freezer: {
      value: 'freezer',
      label: 'Congelatore',
      temperatureRange: { min: -25, max: -1 },
      color: 'text-cyan-600',
    },
    blast: {
      value: 'blast',
      label: 'Abbattitore',
      temperatureRange: { min: -90, max: -15 },
      color: 'text-emerald-600',
    },
  },
  ur = [
    {
      id: 'fresh_meat',
      label: 'Carni fresche',
      range: { min: 1, max: 4 },
      incompatible: ['ambient', 'blast'],
    },
    {
      id: 'fresh_fish',
      label: 'Pesce fresco',
      range: { min: 1, max: 2 },
      incompatible: ['ambient', 'blast'],
    },
    {
      id: 'fresh_dairy',
      label: 'Latticini',
      range: { min: 2, max: 6 },
      incompatible: ['ambient'],
    },
    {
      id: 'fresh_produce',
      label: 'Verdure fresche',
      range: { min: 2, max: 8 },
      incompatible: ['ambient'],
    },
    {
      id: 'beverages',
      label: 'Bevande',
      range: { min: 2, max: 12 },
      incompatible: [],
    },
    {
      id: 'dry_goods',
      label: 'Dispensa secca',
      range: { min: 15, max: 25 },
      compatibleTypes: ['ambient'],
    },
    {
      id: 'frozen',
      label: 'Congelati',
      range: { min: -25, max: -1 },
      compatibleTypes: ['freezer'],
    },
    {
      id: 'deep_frozen',
      label: 'Ultracongelati',
      range: { min: -25, max: -1 },
      compatibleTypes: ['freezer'],
    },
    {
      id: 'blast_chilling',
      label: 'Abbattimento rapido',
      range: { min: -90, max: -15 },
      compatibleTypes: ['blast'],
    },
  ],
  Md = Object.keys(bi),
  zd = [
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'annual',
    'custom',
    'as_needed',
  ],
  Ld = At({
    id: U(),
    conservationPointId: U().min(1, 'Associa il punto di conservazione'),
    conservationPointName: U().optional(),
    title: U().min(2, 'Il titolo è obbligatorio'),
    type: Ye(Md),
    frequency: Ye(zd),
    assignedRole: U().optional(),
    assignedStaffIds: mt(U()).default([]),
    notes: U().optional(),
    estimatedDuration: yt().min(1).optional(),
    priority: Ye(['low', 'medium', 'high', 'critical']).optional(),
    nextDue: U().optional(),
    instructions: mt(U()).optional(),
    status: Ye([
      'scheduled',
      'in_progress',
      'completed',
      'overdue',
      'skipped',
    ]).optional(),
  }),
  $d = At({
    id: U(),
    name: U().min(2, 'Il nome deve essere di almeno 2 caratteri'),
    departmentId: U().min(
      1,
      'Seleziona il reparto a cui appartiene il punto di conservazione'
    ),
    targetTemperature: yt({
      invalid_type_error: 'Inserisci una temperatura valida',
    })
      .min(-99)
      .max(80),
    pointType: Ye(['ambient', 'fridge', 'freezer', 'blast']),
    isBlastChiller: Ja(),
    productCategories: mt(U()).min(1, 'Seleziona almeno una categoria'),
    source: Ye(['manual', 'prefill', 'import']),
    maintenanceTasks: mt(Ld).optional(),
  }),
  $n = e => {
    const t = $d.safeParse(e)
    if (!t.success) {
      const a = {}
      return (
        t.error.issues.forEach(i => {
          i.path[0] && (a[i.path[0].toString()] = i.message)
        }),
        { success: !1, errors: a }
      )
    }
    const n = e.productCategories.filter(a => {
      const i = Mt(a)
      return i
        ? i.compatibleTypes && !i.compatibleTypes.includes(e.pointType)
          ? !0
          : i.incompatible?.includes(e.pointType)
        : !1
    })
    if (n.length > 0)
      return {
        success: !1,
        errors: {
          productCategories:
            'Alcune categorie non sono compatibili con la tipologia selezionata',
          global: `Rimuovi le categorie incompatibili: ${n.map(a => Mt(a)?.label || a).join(', ')}`,
        },
      }
    const r = e.productCategories.filter(a => {
      const i = Mt(a)
      if (!i) return !1
      const o = i.range,
        l = e.targetTemperature
      return l < o.min || l > o.max
    })
    return r.length > 0
      ? {
          success: !1,
          errors: {
            targetTemperature:
              'La temperatura non rientra nei range HACCP delle categorie selezionate',
            global: `Verifica i range per: ${r.map(a => Mt(a)?.label || a).join(', ')}`,
          },
        }
      : { success: !0, point: e }
  },
  $e = () => `cp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  Bd = e =>
    e
      ? {
          ...e,
          productCategories: [...e.productCategories],
          maintenanceTasks: e.maintenanceTasks
            ? e.maintenanceTasks.map(t => ({
                ...t,
                assignedStaffIds: [...t.assignedStaffIds],
                instructions: [...(t.instructions ?? [])],
                status: t.status ?? 'scheduled',
              }))
            : [],
        }
      : {
          id: $e(),
          name: '',
          departmentId: '',
          targetTemperature: 4,
          pointType: 'fridge',
          isBlastChiller: !1,
          productCategories: [],
          maintenanceTasks: [],
          source: 'manual',
        },
  Le = e => ({
    id: e.id,
    name: e.name.trim(),
    departmentId: e.departmentId,
    targetTemperature: e.targetTemperature,
    pointType: e.pointType,
    isBlastChiller: e.isBlastChiller,
    productCategories: [...e.productCategories],
    maintenanceTasks: e.maintenanceTasks?.map(Fd),
    maintenanceDue: e.maintenanceDue,
    source: e.source,
  }),
  Fd = e => ({
    id: e.id,
    conservationPointId: e.conservationPointId,
    conservationPointName: e.conservationPointName,
    title: e.title.trim(),
    type: e.type,
    frequency: e.frequency,
    assignedRole: e.assignedRole,
    assignedStaffIds: [...e.assignedStaffIds],
    notes: e.notes,
    estimatedDuration: e.estimatedDuration,
    priority: e.priority,
    nextDue: e.nextDue,
    instructions: [...(e.instructions ?? [])],
    status: e.status ?? 'scheduled',
  }),
  Mt = e => ur.find(t => t.id === e),
  hs = (e, t) => {
    const r = en[t].temperatureRange
    return t === 'ambient'
      ? {
          valid: !1,
          message:
            'La temperatura non è impostabile per i punti di tipo Ambiente',
        }
      : r.min !== null && e < r.min
        ? {
            valid: !1,
            message: `Temperatura troppo bassa. Minimo consentito: ${r.min}°C`,
          }
        : r.max !== null && e > r.max
          ? {
              valid: !1,
              message: `Temperatura troppo alta. Massimo consentito: ${r.max}°C`,
            }
          : { valid: !0 }
  },
  Vd = (e, t) =>
    e
      ? ur.filter(n =>
          (n.compatibleTypes && !n.compatibleTypes.includes(t)) ||
          (n.incompatible && n.incompatible.includes(t))
            ? !1
            : n.range
              ? e >= n.range.min && e <= n.range.max
              : !0
        )
      : ur,
  gs = {
    name: '',
    departmentId: '',
    targetTemperature: '',
    pointType: 'fridge',
    isBlastChiller: !1,
    productCategories: [],
  },
  Hd = ({ data: e, departments: t, onUpdate: n, onValidChange: r }) => {
    const [a, i] = f.useState((e?.points ?? []).map(Le)),
      [o, l] = f.useState({ ...gs }),
      [d, c] = f.useState(null),
      [u, x] = f.useState({}),
      [b, j] = f.useState(null)
    ;(f.useEffect(() => {
      n({ points: a })
    }, [a, n]),
      f.useEffect(() => {
        const _ = a.length > 0 && a.every(S => $n(S).success)
        r(_)
      }, [a, r]),
      f.useEffect(() => {
        if (o.targetTemperature && o.pointType !== 'ambient') {
          const _ = Number(o.targetTemperature)
          if (isNaN(_)) j(null)
          else {
            const S = hs(_, o.pointType)
            j(S.valid ? null : S.message || null)
          }
        } else j(null)
      }, [o.targetTemperature, o.pointType]))
    const w = f.useMemo(() => t.filter(_ => _.is_active !== !1), [t]),
      m = f.useMemo(() => en[o.pointType], [o.pointType]),
      v = f.useMemo(() => {
        const _ = o.targetTemperature ? Number(o.targetTemperature) : null
        return Vd(_, o.pointType)
      }, [o.targetTemperature, o.pointType]),
      h = () => {
        ;(l(gs), c(null), x({}), j(null))
      },
      C = _ => {
        const S = Bd(_)
        ;(c(_.id),
          l({
            name: S.name,
            departmentId: S.departmentId,
            targetTemperature: S.targetTemperature.toString(),
            pointType: S.pointType,
            isBlastChiller: S.isBlastChiller,
            productCategories: S.productCategories,
          }),
          x({}),
          j(null))
      },
      A = _ => {
        ;(i(S => S.filter(N => N.id !== _)), d === _ && h())
      },
      y = _ => {
        _.preventDefault()
        const S = Le({
            id: d ?? $e(),
            name: o.name.trim(),
            departmentId: o.departmentId,
            targetTemperature: Number(o.targetTemperature),
            pointType: o.pointType,
            isBlastChiller: o.isBlastChiller,
            productCategories: [...new Set(o.productCategories)],
            maintenanceTasks: [],
          }),
          N = $n(S)
        if (o.pointType !== 'ambient' && o.targetTemperature) {
          const P = Number(o.targetTemperature)
          if (!isNaN(P)) {
            const L = hs(P, o.pointType)
            if (!L.valid) {
              x({
                ...N.errors,
                targetTemperature: L.message || 'Temperatura non valida',
              })
              return
            }
          }
        }
        if (!N.success) {
          x(N.errors ?? {})
          return
        }
        ;(i(P => (d ? P.map(L => (L.id === d ? S : L)) : [...P, S])), h())
      },
      T = () => {
        if (w.length === 0) return
        const _ = w.find(P => P.name.toLowerCase() === 'cucina'),
          S = w.find(P => P.name.toLowerCase() === 'bancone'),
          N = [
            Le({
              id: $e(),
              name: 'Frigo A',
              departmentId: _?.id ?? w[0].id,
              targetTemperature: 4,
              pointType: 'fridge',
              isBlastChiller: !1,
              productCategories: ['fresh_meat', 'fresh_dairy'],
            }),
            Le({
              id: $e(),
              name: 'Freezer A',
              departmentId: _?.id ?? w[0].id,
              targetTemperature: -18,
              pointType: 'freezer',
              isBlastChiller: !1,
              productCategories: ['frozen', 'deep_frozen'],
            }),
            Le({
              id: $e(),
              name: 'Freezer B',
              departmentId: _?.id ?? w[0].id,
              targetTemperature: -20,
              pointType: 'freezer',
              isBlastChiller: !1,
              productCategories: ['frozen', 'deep_frozen'],
            }),
            Le({
              id: $e(),
              name: 'Abbattitore',
              departmentId: _?.id ?? w[0].id,
              targetTemperature: -25,
              pointType: 'blast',
              isBlastChiller: !0,
              productCategories: ['blast_chilling'],
            }),
            Le({
              id: $e(),
              name: 'Frigo 1',
              departmentId: S?.id ?? w[0].id,
              targetTemperature: 2,
              pointType: 'fridge',
              isBlastChiller: !1,
              productCategories: ['beverages', 'fresh_produce'],
            }),
            Le({
              id: $e(),
              name: 'Frigo 2',
              departmentId: S?.id ?? w[0].id,
              targetTemperature: 3,
              pointType: 'fridge',
              isBlastChiller: !1,
              productCategories: ['beverages', 'fresh_produce'],
            }),
            Le({
              id: $e(),
              name: 'Frigo 3',
              departmentId: S?.id ?? w[0].id,
              targetTemperature: 5,
              pointType: 'fridge',
              isBlastChiller: !1,
              productCategories: ['beverages', 'fresh_produce'],
            }),
          ]
        ;(i(N), h())
      }
    return s.jsxs('div', {
      className: 'space-y-6',
      children: [
        s.jsxs('header', {
          className: 'space-y-2 text-center',
          children: [
            s.jsx('h2', {
              className: 'text-2xl font-bold text-gray-900',
              children: 'Punti di conservazione',
            }),
            s.jsx('p', {
              className: 'mx-auto max-w-2xl text-gray-600',
              children:
                'Configura frigoriferi, congelatori e abbattitori assicurando i range HACCP corretti per le categorie di prodotto gestite.',
            }),
          ],
        }),
        s.jsx('div', {
          className: 'flex justify-center',
          children: s.jsxs(re, {
            variant: 'outline',
            onClick: T,
            className: 'gap-2',
            children: [
              s.jsx(ot, { className: 'h-4 w-4' }),
              ' Carica punti predefiniti',
            ],
          }),
        }),
        s.jsxs('section', {
          className: 'rounded-lg border border-gray-200 bg-white',
          children: [
            s.jsxs('header', {
              className:
                'flex items-center justify-between border-b border-gray-100 px-4 py-3',
              children: [
                s.jsxs('div', {
                  children: [
                    s.jsx('h3', {
                      className: 'font-semibold text-gray-900',
                      children: 'Punti configurati',
                    }),
                    s.jsx('p', {
                      className: 'text-sm text-gray-500',
                      children:
                        "Elenco dei punti di conservazione creati durante l'onboarding",
                    }),
                  ],
                }),
                s.jsxs(re, {
                  variant: 'ghost',
                  className: 'gap-2',
                  onClick: () => c(null),
                  children: [
                    s.jsx(ot, { className: 'h-4 w-4' }),
                    ' ',
                    d ? 'Modifica punto' : 'Aggiungi punto',
                  ],
                }),
              ],
            }),
            s.jsxs('div', {
              className: 'divide-y divide-gray-100',
              children: [
                a.length === 0 &&
                  s.jsx('p', {
                    className: 'px-4 py-8 text-center text-sm text-gray-500',
                    children:
                      'Nessun punto di conservazione configurato. Aggiungi almeno un punto per procedere.',
                  }),
                a.map(_ => {
                  const S = t.find(L => L.id === _.departmentId),
                    N = $n(_),
                    P = en[_.pointType]
                  return s.jsxs(
                    'article',
                    {
                      className:
                        'grid gap-4 px-4 py-3 md:grid-cols-[1fr_auto] md:items-start',
                      children: [
                        s.jsxs('div', {
                          className: 'space-y-2',
                          children: [
                            s.jsxs('div', {
                              className: 'flex flex-wrap items-center gap-2',
                              children: [
                                s.jsx(Fn, {
                                  className: `h-4 w-4 ${P.color}`,
                                  'aria-hidden': !0,
                                }),
                                s.jsx('h4', {
                                  className:
                                    'text-base font-semibold text-gray-900',
                                  children: _.name,
                                }),
                                s.jsx(be, {
                                  variant: 'outline',
                                  children: P.label,
                                }),
                                _.isBlastChiller &&
                                  s.jsx(be, {
                                    tone: 'warning',
                                    variant: 'outline',
                                    children: 'Abbattitore',
                                  }),
                              ],
                            }),
                            s.jsxs('div', {
                              className:
                                'flex flex-wrap gap-2 text-xs text-gray-600',
                              children: [
                                S &&
                                  s.jsx(be, {
                                    variant: 'outline',
                                    children: S.name,
                                  }),
                                s.jsxs(be, {
                                  variant: 'secondary',
                                  children: [_.targetTemperature, '°C'],
                                }),
                              ],
                            }),
                            s.jsx('div', {
                              className:
                                'flex flex-wrap gap-2 text-xs text-gray-600',
                              children: _.productCategories.map(L => {
                                const B = Mt(L)
                                return B
                                  ? s.jsx(
                                      be,
                                      { variant: 'outline', children: B.label },
                                      B.id
                                    )
                                  : null
                              }),
                            }),
                            s.jsxs('div', {
                              className: `flex items-center gap-2 rounded border px-3 py-2 text-sm ${N.success ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`,
                              children: [
                                N.success
                                  ? s.jsx(Bn, {
                                      className: 'h-4 w-4',
                                      'aria-hidden': !0,
                                    })
                                  : s.jsx(Cs, {
                                      className: 'h-4 w-4',
                                      'aria-hidden': !0,
                                    }),
                                s.jsx('span', {
                                  children: N.success
                                    ? 'Punto conforme ai requisiti HACCP'
                                    : N.errors?.global ||
                                      'Verifica categorie selezionate e temperatura impostata',
                                }),
                              ],
                            }),
                            _.maintenanceTasks &&
                              _.maintenanceTasks.length > 0 &&
                              s.jsxs('div', {
                                className: 'space-y-1',
                                children: [
                                  s.jsx('p', {
                                    className:
                                      'text-xs font-semibold text-gray-700',
                                    children: 'Task programmati:',
                                  }),
                                  s.jsx('ul', {
                                    className:
                                      'space-y-1 text-xs text-gray-600',
                                    children: _.maintenanceTasks.map(L =>
                                      s.jsxs(
                                        'li',
                                        {
                                          children: [
                                            '• ',
                                            L.title,
                                            ' (',
                                            L.frequency,
                                            ')',
                                          ],
                                        },
                                        L.id
                                      )
                                    ),
                                  }),
                                ],
                              }),
                          ],
                        }),
                        s.jsxs('div', {
                          className: 'flex gap-2',
                          children: [
                            s.jsx(re, {
                              variant: 'outline',
                              size: 'icon',
                              onClick: () => C(_),
                              children: s.jsx(it, {
                                className: 'h-4 w-4',
                                'aria-hidden': !0,
                              }),
                            }),
                            s.jsx(re, {
                              variant: 'destructive',
                              size: 'icon',
                              onClick: () => A(_.id),
                              children: s.jsx(Xe, {
                                className: 'h-4 w-4',
                                'aria-hidden': !0,
                              }),
                            }),
                          ],
                        }),
                      ],
                    },
                    _.id
                  )
                }),
              ],
            }),
          ],
        }),
        s.jsxs('section', {
          className: 'rounded-lg border border-gray-200 bg-gray-50 p-4',
          children: [
            s.jsxs('header', {
              className: 'mb-4',
              children: [
                s.jsx('h3', {
                  className: 'text-lg font-semibold text-gray-900',
                  children: d
                    ? 'Modifica punto di conservazione'
                    : 'Aggiungi nuovo punto di conservazione',
                }),
                s.jsx('p', {
                  className: 'text-sm text-gray-500',
                  children:
                    'Compila i campi obbligatori per definire il punto di conservazione e le relative attività.',
                }),
              ],
            }),
            s.jsxs('form', {
              className: 'space-y-6',
              onSubmit: y,
              children: [
                s.jsxs('div', {
                  className: 'grid gap-4 md:grid-cols-2',
                  children: [
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, { htmlFor: 'point-name', children: 'Nome *' }),
                        s.jsx(Fe, {
                          id: 'point-name',
                          value: o.name,
                          onChange: _ =>
                            l(S => ({ ...S, name: _.target.value })),
                          placeholder: 'Frigo principale cucina',
                          'aria-invalid': !!u.name,
                        }),
                        u.name &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: u.name,
                          }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, { children: 'Reparto *' }),
                        s.jsxs(Te, {
                          value: o.departmentId || void 0,
                          onValueChange: _ =>
                            l(S => ({ ...S, departmentId: _ })),
                          children: [
                            s.jsx(Ce, {
                              children: s.jsx(Ee, {
                                placeholder: 'Seleziona un reparto',
                              }),
                            }),
                            s.jsx(Ne, {
                              children: w.map(_ =>
                                s.jsx(
                                  se,
                                  { value: _.id, children: _.name },
                                  _.id
                                )
                              ),
                            }),
                          ],
                        }),
                        u.departmentId &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: u.departmentId,
                          }),
                      ],
                    }),
                  ],
                }),
                s.jsxs('div', {
                  className: 'grid gap-4 md:grid-cols-2',
                  children: [
                    s.jsxs('div', {
                      children: [
                        s.jsxs(K, {
                          htmlFor: 'point-temperature',
                          children: [
                            'Temperatura target ',
                            o.pointType === 'ambient' ? '' : '*',
                          ],
                        }),
                        s.jsx(Fe, {
                          id: 'point-temperature',
                          type: 'number',
                          step: '0.1',
                          min: '-99',
                          max: '30',
                          value: o.targetTemperature,
                          onChange: _ =>
                            l(S => ({
                              ...S,
                              targetTemperature: _.target.value,
                            })),
                          placeholder:
                            o.pointType === 'ambient'
                              ? 'Non impostabile'
                              : String(m.temperatureRange.min),
                          disabled: o.pointType === 'ambient',
                          className:
                            o.pointType === 'ambient'
                              ? 'bg-gray-100 cursor-not-allowed'
                              : '',
                          'aria-invalid': !!(u.targetTemperature || b),
                        }),
                        o.pointType !== 'ambient'
                          ? s.jsxs('p', {
                              className: 'mt-1 text-xs text-gray-500',
                              children: [
                                'Range consigliato ',
                                m.temperatureRange.min,
                                '°C -',
                                ' ',
                                m.temperatureRange.max,
                                '°C',
                              ],
                            })
                          : s.jsx('p', {
                              className: 'mt-1 text-xs text-gray-500',
                              children:
                                'La temperatura non è impostabile per i punti di tipo Ambiente',
                            }),
                        u.targetTemperature &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: u.targetTemperature,
                          }),
                        b &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: b,
                          }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, { children: 'Tipologia' }),
                        s.jsx('div', {
                          className: 'grid grid-cols-2 gap-2',
                          children: Object.values(en).map(_ => {
                            const S = o.pointType === _.value
                            return s.jsxs(
                              re,
                              {
                                type: 'button',
                                variant: S ? 'default' : 'outline',
                                className: `justify-start gap-2 transition-all duration-200 ${S ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'}`,
                                onClick: () =>
                                  l(N => ({
                                    ...N,
                                    pointType: _.value,
                                    isBlastChiller: _.value === 'blast',
                                  })),
                                children: [
                                  s.jsx(Fn, {
                                    className: `h-4 w-4 ${S ? 'text-white' : _.color}`,
                                  }),
                                  s.jsx('span', {
                                    className: 'font-medium',
                                    children: _.label,
                                  }),
                                ],
                              },
                              _.value
                            )
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                s.jsxs('div', {
                  children: [
                    s.jsx(K, { children: 'Categorie prodotti *' }),
                    s.jsx('p', {
                      className: 'mb-3 text-sm text-gray-600',
                      children:
                        'Seleziona le categorie di prodotti che verranno conservate in questo punto di conservazione. Solo le categorie compatibili con la temperatura impostata sono disponibili.',
                    }),
                    s.jsx('div', {
                      className: 'grid gap-2 md:grid-cols-2 lg:grid-cols-3',
                      children: v.map(_ => {
                        const S = o.productCategories.includes(_.id)
                        return s.jsxs(
                          'button',
                          {
                            type: 'button',
                            className: `flex items-center justify-between rounded border p-2 text-sm transition-colors ${S ? 'border-blue-400 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white hover:border-blue-200'}`,
                            onClick: () => {
                              l(N => ({
                                ...N,
                                productCategories: S
                                  ? N.productCategories.filter(P => P !== _.id)
                                  : [...N.productCategories, _.id],
                              }))
                            },
                            children: [
                              s.jsx('span', { children: _.label }),
                              _.range &&
                                s.jsxs('span', {
                                  className: 'text-xs text-gray-500',
                                  children: [
                                    _.range.min,
                                    '°C - ',
                                    _.range.max,
                                    '°C',
                                  ],
                                }),
                              S &&
                                s.jsx(Bn, {
                                  className: 'h-4 w-4 text-blue-600',
                                  'aria-hidden': !0,
                                }),
                            ],
                          },
                          _.id
                        )
                      }),
                    }),
                    v.length === 0 &&
                      o.targetTemperature &&
                      s.jsxs('p', {
                        className: 'mt-1 text-sm text-amber-600',
                        children: [
                          'Nessuna categoria compatibile con la temperatura',
                          ' ',
                          o.targetTemperature,
                          '°C',
                        ],
                      }),
                    u.productCategories &&
                      s.jsx('p', {
                        className: 'mt-1 text-sm text-red-600',
                        children: u.productCategories,
                      }),
                  ],
                }),
                s.jsx('div', {
                  className: 'grid gap-4 md:grid-cols-1',
                  children: s.jsxs('div', {
                    children: [
                      s.jsx(K, { children: 'Note operative' }),
                      s.jsx(Ht, {
                        rows: 2,
                        value: u.global ? u.global : '',
                        readOnly: !0,
                        className: 'border-dashed text-sm text-amber-600',
                      }),
                    ],
                  }),
                }),
                s.jsx(re, {
                  type: 'submit',
                  className: 'w-full',
                  children: d ? 'Salva modifiche' : 'Aggiungi punto',
                }),
              ],
            }),
          ],
        }),
      ],
    })
  },
  at = [
    {
      value: 'rilevamento_temperatura',
      label: 'Rilevamento Temperatura',
      icon: '🌡️',
    },
    { value: 'sanificazione', label: 'Sanificazione', icon: '🧽' },
    { value: 'sbrinamento', label: 'Sbrinamento', icon: '❄️' },
    { value: 'controllo_scadenze', label: 'Controllo Scadenze', icon: '📅' },
  ],
  pn = [
    { value: 'annuale', label: 'Annuale' },
    { value: 'mensile', label: 'Mensile' },
    { value: 'settimanale', label: 'Settimanale' },
    { value: 'giornaliera', label: 'Giornaliera' },
    { value: 'custom', label: 'Personalizzata' },
  ],
  ni = [
    { value: 'lunedi', label: 'Lunedì' },
    { value: 'martedi', label: 'Martedì' },
    { value: 'mercoledi', label: 'Mercoledì' },
    { value: 'giovedi', label: 'Giovedì' },
    { value: 'venerdi', label: 'Venerdì' },
    { value: 'sabato', label: 'Sabato' },
    { value: 'domenica', label: 'Domenica' },
  ],
  Zd = ({
    data: e,
    conservationPoints: t,
    staff: n,
    onUpdate: r,
    onValidChange: a,
  }) => {
    const [i, o] = f.useState(e?.conservationMaintenancePlans ?? []),
      [l, d] = f.useState(e?.genericTasks ?? []),
      [c, u] = f.useState(null),
      [x, b] = f.useState(null)
    ;(f.useEffect(() => {
      e?.conservationMaintenancePlans !== void 0 &&
        o(e.conservationMaintenancePlans)
    }, [e?.conservationMaintenancePlans]),
      f.useEffect(() => {
        e?.genericTasks !== void 0 && d(e.genericTasks)
      }, [e?.genericTasks]))
    const j = f.useMemo(
        () =>
          (n ?? []).map(N => ({
            id: N.id,
            label: N.fullName,
            role: N.role,
            categories: N.categories || [],
            department: N.department_assignments,
          })),
        [n]
      ),
      w = f.useCallback(
        () =>
          t.every(N => {
            const P = i.filter(B => B.conservationPointId === N.id)
            return (
              N.pointType === 'ambient'
                ? at.filter(B => B.value !== 'sbrinamento')
                : at
            ).every(B =>
              P.some(
                F =>
                  F.manutenzione === B.value &&
                  F.frequenza &&
                  F.assegnatoARuolo &&
                  (F.frequenza !== 'custom' ||
                    (F.giorniCustom && F.giorniCustom.length > 0))
              )
            )
          }),
        [t, i]
      )
    ;(f.useEffect(() => {
      const N = {
        conservationMaintenancePlans: i,
        generalTasks: [],
        maintenanceTasks: e?.maintenanceTasks ?? [],
        genericTasks: l,
      }
      r(N)
    }, [i, l, r, e?.maintenanceTasks]),
      f.useEffect(() => {
        const N = w(),
          P = l.length > 0
        a(N && P)
      }, [w, l, a]))
    const m = f.useCallback(N => {
        b(N)
      }, []),
      v = f.useCallback(() => {
        b(null)
      }, []),
      h = f.useCallback(N => {
        ;(o(P => [
          ...P.filter(B => B.conservationPointId !== N[0]?.conservationPointId),
          ...N,
        ]),
          b(null))
      }, []),
      C = f.useCallback(() => {
        const N = {
          id: `generic-${Date.now()}`,
          name: '',
          frequenza: 'settimanale',
          assegnatoARuolo: 'dipendente',
          note: '',
        }
        ;(d(P => [...P, N]), u(N.id))
      }, []),
      A = f.useCallback((N, P) => {
        d(L => L.map(B => (B.id === N ? { ...B, ...P } : B)))
      }, []),
      y = f.useCallback(N => {
        d(P => P.filter(L => L.id !== N))
      }, []),
      T = f.useCallback(() => {
        u(null)
      }, []),
      _ = () =>
        x
          ? s.jsx('div', {
              className:
                'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50',
              children: s.jsxs('div', {
                className:
                  'max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6',
                children: [
                  s.jsxs('div', {
                    className: 'mb-4 flex items-center justify-between',
                    children: [
                      s.jsxs('h3', {
                        className: 'text-lg font-semibold',
                        children: ['Assegna Manutenzioni - ', x.name],
                      }),
                      s.jsx(re, {
                        variant: 'outline',
                        onClick: v,
                        children: '✕',
                      }),
                    ],
                  }),
                  s.jsx(qd, {
                    conservationPoint: x,
                    staffOptions: j,
                    maintenancePlans: i,
                    onSave: h,
                    onCancel: v,
                  }),
                ],
              }),
            })
          : null,
      S = () =>
        s.jsxs('div', {
          className: 'space-y-6',
          children: [
            s.jsxs('div', {
              className: 'flex items-center justify-between',
              children: [
                s.jsxs('div', {
                  children: [
                    s.jsx('h3', {
                      className: 'text-xl font-semibold text-gray-900',
                      children: '👥 Attività/Mansioni Generiche',
                    }),
                    s.jsx('p', {
                      className: 'text-sm text-gray-500',
                      children:
                        'Crea attività generiche e assegna responsabilità al personale',
                    }),
                  ],
                }),
                s.jsxs(re, {
                  onClick: C,
                  className: 'gap-2',
                  children: [
                    s.jsx(ot, { className: 'h-4 w-4' }),
                    ' Aggiungi Attività',
                  ],
                }),
              ],
            }),
            l.length === 0 &&
              s.jsx('div', {
                className:
                  'rounded-lg border-2 border-dashed border-gray-300 p-8 text-center',
                children: s.jsx('p', {
                  className: 'text-gray-500',
                  children:
                    "Nessuna attività generica configurata. Aggiungi almeno un'attività per procedere.",
                }),
              }),
            l.filter(N => c === N.id).length > 0 &&
              s.jsx('div', {
                className: 'space-y-4',
                children: l
                  .filter(N => c === N.id)
                  .map(N =>
                    s.jsx(
                      Ud,
                      {
                        task: N,
                        staffOptions: j,
                        isEditing: !0,
                        onUpdate: P => A(N.id, P),
                        onDelete: () => y(N.id),
                        onConfirm: () => T(),
                      },
                      N.id
                    )
                  ),
              }),
            l.filter(N => c !== N.id).length > 0 &&
              s.jsxs('div', {
                className: 'rounded-lg border border-gray-200 bg-white',
                children: [
                  s.jsx('div', {
                    className: 'border-b border-gray-100 px-4 py-3',
                    children: s.jsx('h4', {
                      className: 'font-semibold text-gray-900',
                      children: 'Attività Configurate',
                    }),
                  }),
                  s.jsx('div', {
                    className: 'divide-y divide-gray-100',
                    children: l
                      .filter(N => c !== N.id)
                      .map(N =>
                        s.jsx(
                          'div',
                          {
                            className: 'px-4 py-3',
                            children: s.jsxs('div', {
                              className: 'flex items-center justify-between',
                              children: [
                                s.jsxs('div', {
                                  className: 'space-y-1',
                                  children: [
                                    s.jsx('h5', {
                                      className: 'font-medium text-gray-900',
                                      children: N.name,
                                    }),
                                    s.jsxs('div', {
                                      className:
                                        'flex gap-4 text-sm text-gray-500',
                                      children: [
                                        s.jsxs('span', {
                                          children: [
                                            '🔄 ',
                                            pn.find(
                                              P => P.value === N.frequenza
                                            )?.label,
                                          ],
                                        }),
                                        s.jsxs('span', {
                                          children: ['👤 ', N.assegnatoARuolo],
                                        }),
                                        N.assegnatoACategoria &&
                                          N.assegnatoACategoria !== 'all' &&
                                          s.jsxs('span', {
                                            children: [
                                              '📂 ',
                                              N.assegnatoACategoria,
                                            ],
                                          }),
                                        N.assegnatoADipendenteSpecifico &&
                                          s.jsxs('span', {
                                            children: [
                                              '👨‍💼 ',
                                              j.find(
                                                P =>
                                                  P.id ===
                                                  N.assegnatoADipendenteSpecifico
                                              )?.label,
                                            ],
                                          }),
                                      ],
                                    }),
                                    N.note &&
                                      s.jsx('p', {
                                        className: 'text-sm text-gray-600',
                                        children: N.note,
                                      }),
                                  ],
                                }),
                                s.jsxs('div', {
                                  className: 'flex gap-2',
                                  children: [
                                    s.jsx(re, {
                                      variant: 'outline',
                                      size: 'icon',
                                      onClick: () => u(N.id),
                                      children: s.jsx(it, {
                                        className: 'h-4 w-4',
                                      }),
                                    }),
                                    s.jsx(re, {
                                      variant: 'destructive',
                                      size: 'icon',
                                      onClick: () => y(N.id),
                                      children: s.jsx(Xe, {
                                        className: 'h-4 w-4',
                                      }),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          },
                          N.id
                        )
                      ),
                  }),
                ],
              }),
          ],
        })
    return s.jsxs('div', {
      className: 'space-y-8',
      children: [
        s.jsxs('header', {
          className: 'space-y-2 text-center',
          children: [
            s.jsx('div', {
              className:
                'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100',
              children: s.jsx(ui, { className: 'h-8 w-8 text-blue-600' }),
            }),
            s.jsx('h2', {
              className: 'text-2xl font-bold text-gray-900',
              children: 'Attività e controlli HACCP',
            }),
            s.jsx('p', {
              className: 'text-gray-600',
              children:
                'Definisci le attività periodiche per garantire la conformità alle normative HACCP.',
            }),
          ],
        }),
        s.jsx('div', {
          className: 'rounded-lg border border-gray-200 bg-white p-6',
          children: s.jsxs('div', {
            className: 'space-y-4',
            children: [
              s.jsx('div', {
                className: 'flex items-center justify-between',
                children: s.jsxs('div', {
                  children: [
                    s.jsx('h3', {
                      className: 'text-xl font-semibold text-gray-900',
                      children: '🔧 Manutenzioni Punti di Conservazione',
                    }),
                    s.jsx('p', {
                      className: 'text-sm text-gray-500',
                      children:
                        'Assegna le manutenzioni obbligatorie per ogni punto di conservazione',
                    }),
                  ],
                }),
              }),
              s.jsx('div', {
                className: 'space-y-3',
                children:
                  t.length === 0
                    ? s.jsx('div', {
                        className:
                          'rounded-lg border-2 border-dashed border-gray-300 p-8 text-center',
                        children: s.jsx('p', {
                          className: 'text-gray-500',
                          children:
                            'Nessun punto di conservazione configurato. Completa lo Step 4 per procedere.',
                        }),
                      })
                    : t.map(N => {
                        const P = i.filter(F => F.conservationPointId === N.id),
                          B = (
                            N.pointType === 'ambient'
                              ? at.filter(F => F.value !== 'sbrinamento')
                              : at
                          ).every(F => P.some(E => E.manutenzione === F.value))
                        return s.jsxs(
                          'div',
                          {
                            className: 'py-3',
                            children: [
                              s.jsxs('div', {
                                className: 'flex items-center justify-between',
                                children: [
                                  s.jsx('div', {
                                    className: 'flex items-center gap-3',
                                    children: s.jsxs('div', {
                                      children: [
                                        s.jsx('h4', {
                                          className:
                                            'font-medium text-gray-900',
                                          children: N.name,
                                        }),
                                        s.jsxs('div', {
                                          className: 'flex gap-2',
                                          children: [
                                            s.jsx(be, {
                                              variant: 'outline',
                                              children:
                                                N.pointType === 'ambient'
                                                  ? 'Ambiente'
                                                  : 'Attrezzatura',
                                            }),
                                            s.jsx(be, {
                                              variant: B
                                                ? 'default'
                                                : 'destructive',
                                              children: B
                                                ? 'Completato'
                                                : 'Incompleto',
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  }),
                                  s.jsx(re, {
                                    variant: 'outline',
                                    onClick: () => m(N),
                                    children: B
                                      ? 'Modifica Manutenzioni'
                                      : 'Assegna manutenzioni',
                                  }),
                                ],
                              }),
                              s.jsx('div', {
                                className: 'mt-2 grid gap-2 md:grid-cols-2',
                                children: P.map(F => {
                                  const E = at.find(
                                    p => p.value === F.manutenzione
                                  )
                                  return s.jsxs(
                                    'div',
                                    {
                                      className:
                                        'rounded border border-gray-200 bg-gray-50 p-2 text-xs',
                                      children: [
                                        s.jsxs('div', {
                                          className: 'flex items-center gap-2',
                                          children: [
                                            s.jsx('span', {
                                              children: E?.icon,
                                            }),
                                            s.jsx('span', {
                                              className: 'font-medium',
                                              children: E?.label,
                                            }),
                                          ],
                                        }),
                                        s.jsxs('div', {
                                          className: 'mt-1 text-gray-600',
                                          children: [
                                            pn.find(
                                              p => p.value === F.frequenza
                                            )?.label,
                                            ' - ',
                                            F.assegnatoARuolo,
                                            F.assegnatoACategoria &&
                                              F.assegnatoACategoria !== 'all' &&
                                              s.jsxs(s.Fragment, {
                                                children: [
                                                  ' - ',
                                                  F.assegnatoACategoria,
                                                ],
                                              }),
                                          ],
                                        }),
                                      ],
                                    },
                                    F.id
                                  )
                                }),
                              }),
                            ],
                          },
                          N.id
                        )
                      }),
              }),
            ],
          }),
        }),
        s.jsx('div', {
          className: 'rounded-lg border border-gray-200 bg-white p-6',
          children: S(),
        }),
        x && _(),
        s.jsx('div', {
          className:
            'rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800',
          children:
            'ℹ️ Le attività configurate verranno automaticamente assegnate al personale secondo la frequenza indicata e monitorate nel sistema principale.',
        }),
      ],
    })
  },
  qd = ({
    conservationPoint: e,
    staffOptions: t,
    maintenancePlans: n,
    onSave: r,
    onCancel: a,
  }) => {
    const i =
        e.pointType === 'ambient'
          ? at.filter(w => w.value !== 'sbrinamento')
          : at,
      o = n.filter(w => w.conservationPointId === e.id),
      [l, d] = f.useState(() =>
        i.map(w => {
          const m = o.find(v => v.manutenzione === w.value)
          return (
            m || {
              id: `plan-${w.value}-${e.id}`,
              conservationPointId: e.id,
              manutenzione: w.value,
              frequenza:
                w.value === 'rilevamento_temperatura'
                  ? 'giornaliera'
                  : w.value === 'sanificazione'
                    ? 'settimanale'
                    : w.value === 'sbrinamento'
                      ? 'annuale'
                      : 'custom',
              assegnatoARuolo: 'dipendente',
              giorniCustom:
                w.value === 'controllo_scadenze'
                  ? ['lunedi', 'giovedi']
                  : void 0,
            }
          )
        })
      ),
      [c, u] = f.useState({}),
      x = (w, m) => {
        d(v => v.map((h, C) => (C === w ? { ...h, ...m } : h)))
      },
      b = () => {
        const w = {}
        return (
          l.forEach((m, v) => {
            ;(m.frequenza ||
              (w[`plan-${v}-frequenza`] = 'Frequenza obbligatoria'),
              m.assegnatoARuolo ||
                (w[`plan-${v}-ruolo`] = 'Ruolo obbligatorio'),
              m.frequenza === 'custom' &&
                (!m.giorniCustom || m.giorniCustom.length === 0) &&
                (w[`plan-${v}-giorni`] =
                  'Seleziona almeno un giorno per frequenza custom'))
          }),
          u(w),
          Object.keys(w).length === 0
        )
      },
      j = () => {
        b() && r(l)
      }
    return s.jsxs('div', {
      className: 'space-y-6',
      children: [
        i.map((w, m) => {
          const v = l[m]
          return s.jsxs(
            'div',
            {
              className: 'rounded-lg border border-gray-200 bg-gray-50 p-4',
              children: [
                s.jsxs('div', {
                  className: 'flex items-center gap-3 mb-4',
                  children: [
                    s.jsx('span', { className: 'text-2xl', children: w.icon }),
                    s.jsxs('div', {
                      children: [
                        s.jsx('h4', {
                          className: 'font-semibold text-gray-900',
                          children: w.label,
                        }),
                        s.jsx('p', {
                          className: 'text-sm text-gray-500',
                          children:
                            'Configura frequenza e assegnazione per questa manutenzione',
                        }),
                      ],
                    }),
                  ],
                }),
                s.jsxs('div', {
                  className: 'grid gap-4 md:grid-cols-2',
                  children: [
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, { children: 'Frequenza *' }),
                        s.jsxs(Te, {
                          value: v.frequenza,
                          onValueChange: h =>
                            x(m, {
                              frequenza: h,
                              giorniCustom:
                                h === 'custom' ? ['lunedi'] : void 0,
                            }),
                          children: [
                            s.jsx(Ce, {
                              children: s.jsx(Ee, {
                                placeholder: 'Seleziona frequenza',
                              }),
                            }),
                            s.jsx(Ne, {
                              children: pn.map(h =>
                                s.jsx(
                                  se,
                                  { value: h.value, children: h.label },
                                  h.value
                                )
                              ),
                            }),
                          ],
                        }),
                        c[`plan-${m}-frequenza`] &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: c[`plan-${m}-frequenza`],
                          }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, { children: 'Ruolo *' }),
                        s.jsxs(Te, {
                          value: v.assegnatoARuolo || '',
                          onValueChange: h =>
                            x(m, {
                              assegnatoARuolo: h,
                              assegnatoADipendenteSpecifico: void 0,
                            }),
                          children: [
                            s.jsx(Ce, {
                              children: s.jsx(Ee, {
                                placeholder: 'Seleziona ruolo',
                              }),
                            }),
                            s.jsxs(Ne, {
                              children: [
                                s.jsx(se, {
                                  value: 'admin',
                                  children: 'Amministratore',
                                }),
                                s.jsx(se, {
                                  value: 'responsabile',
                                  children: 'Responsabile',
                                }),
                                s.jsx(se, {
                                  value: 'dipendente',
                                  children: 'Dipendente',
                                }),
                                s.jsx(se, {
                                  value: 'collaboratore',
                                  children: 'Collaboratore',
                                }),
                              ],
                            }),
                          ],
                        }),
                        c[`plan-${m}-ruolo`] &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: c[`plan-${m}-ruolo`],
                          }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx(K, { children: 'Categoria' }),
                        s.jsxs(Te, {
                          value: v.assegnatoACategoria || 'all',
                          onValueChange: h =>
                            x(m, {
                              assegnatoACategoria: h,
                              assegnatoADipendenteSpecifico: void 0,
                            }),
                          disabled: !v.assegnatoARuolo,
                          children: [
                            s.jsx(Ce, {
                              children: s.jsx(Ee, {
                                placeholder: v.assegnatoARuolo
                                  ? 'Seleziona categoria'
                                  : 'Prima seleziona un ruolo',
                              }),
                            }),
                            s.jsxs(Ne, {
                              children: [
                                s.jsx(se, {
                                  value: 'all',
                                  children: 'Tutte le categorie',
                                }),
                                t
                                  .filter(h => h.role === v.assegnatoARuolo)
                                  .flatMap(h => h.categories)
                                  .filter(h => h && h.trim() !== '')
                                  .filter((h, C, A) => A.indexOf(h) === C)
                                  .map(h =>
                                    s.jsx(se, { value: h, children: h }, h)
                                  ),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    v.assegnatoARuolo &&
                      s.jsxs('div', {
                        className: 'md:col-span-2',
                        children: [
                          s.jsx(K, { children: 'Dipendente specifico' }),
                          s.jsxs(Te, {
                            value: v.assegnatoADipendenteSpecifico ?? 'none',
                            onValueChange: h =>
                              x(m, { assegnatoADipendenteSpecifico: h }),
                            disabled: !1,
                            children: [
                              s.jsx(Ce, {
                                children: s.jsx(Ee, {
                                  placeholder:
                                    'Opzionale: seleziona dipendente specifico',
                                }),
                              }),
                              s.jsxs(Ne, {
                                children: [
                                  s.jsx(se, {
                                    value: 'none',
                                    children: 'Nessun dipendente specifico',
                                  }),
                                  t
                                    .filter(h =>
                                      h.role !== v.assegnatoARuolo
                                        ? !1
                                        : v.assegnatoACategoria &&
                                            v.assegnatoACategoria !== 'all'
                                          ? h.categories.includes(
                                              v.assegnatoACategoria
                                            )
                                          : !0
                                    )
                                    .map(h =>
                                      s.jsxs(
                                        se,
                                        {
                                          value: h.id,
                                          children: [
                                            h.label,
                                            ' - ',
                                            h.categories.join(', '),
                                          ],
                                        },
                                        h.id
                                      )
                                    ),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    v.frequenza === 'custom' &&
                      s.jsxs('div', {
                        className: 'md:col-span-2',
                        children: [
                          s.jsx(K, { children: 'Giorni della settimana *' }),
                          s.jsx('div', {
                            className: 'grid grid-cols-2 gap-2 md:grid-cols-4',
                            children: ni.map(h =>
                              s.jsxs(
                                'label',
                                {
                                  className: 'flex items-center gap-2',
                                  children: [
                                    s.jsx('input', {
                                      type: 'checkbox',
                                      checked:
                                        v.giorniCustom?.includes(h.value) ?? !1,
                                      onChange: C => {
                                        const A = v.giorniCustom || [],
                                          y = C.target.checked
                                            ? [...A, h.value]
                                            : A.filter(T => T !== h.value)
                                        x(m, { giorniCustom: y })
                                      },
                                      className: 'rounded border-gray-300',
                                    }),
                                    s.jsx('span', {
                                      className: 'text-sm',
                                      children: h.label,
                                    }),
                                  ],
                                },
                                h.value
                              )
                            ),
                          }),
                          c[`plan-${m}-giorni`] &&
                            s.jsx('p', {
                              className: 'mt-1 text-sm text-red-600',
                              children: c[`plan-${m}-giorni`],
                            }),
                        ],
                      }),
                    s.jsxs('div', {
                      className: 'md:col-span-2',
                      children: [
                        s.jsx(K, { children: 'Note (opzionale)' }),
                        s.jsx(Ht, {
                          rows: 2,
                          value: v.note ?? '',
                          onChange: h => x(m, { note: h.target.value }),
                          placeholder: 'Note aggiuntive...',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            },
            v.id
          )
        }),
        s.jsxs('div', {
          className: 'flex justify-end gap-3 border-t pt-4',
          children: [
            s.jsx(re, { variant: 'outline', onClick: a, children: 'Annulla' }),
            s.jsx(re, { onClick: j, children: 'Salva Manutenzioni' }),
          ],
        }),
      ],
    })
  },
  Ud = ({
    task: e,
    staffOptions: t,
    isEditing: n,
    onUpdate: r,
    onDelete: a,
    onConfirm: i,
  }) => {
    const [o, l] = f.useState({}),
      d = c => {
        r(c)
        const u = {}
        ;(!c.name && !e.name && (u.name = 'Nome attività obbligatorio'),
          !c.frequenza &&
            !e.frequenza &&
            (u.frequenza = 'Frequenza obbligatoria'),
          !c.assegnatoARuolo &&
            !e.assegnatoARuolo &&
            (u.ruolo = 'Ruolo obbligatorio'),
          c.frequenza === 'custom' &&
            (!c.giorniCustom || c.giorniCustom.length === 0) &&
            (u.giorni = 'Seleziona almeno un giorno per frequenza custom'),
          l(u))
      }
    return s.jsx('div', {
      className: 'rounded-lg border border-gray-200 bg-gray-50 p-4',
      children: n
        ? s.jsxs(s.Fragment, {
            children: [
              s.jsxs('div', {
                className: 'flex items-center justify-between mb-4',
                children: [
                  s.jsx('h4', {
                    className: 'font-semibold text-gray-900',
                    children: e.name
                      ? `Modifica: ${e.name}`
                      : 'Nuova Attività Generica',
                  }),
                  s.jsx(re, {
                    variant: 'destructive',
                    size: 'icon',
                    onClick: a,
                    children: s.jsx(Xe, { className: 'h-4 w-4' }),
                  }),
                ],
              }),
              s.jsxs('div', {
                className: 'grid gap-4 md:grid-cols-2',
                children: [
                  s.jsxs('div', {
                    children: [
                      s.jsx(K, { children: 'Nome attività *' }),
                      s.jsx(Fe, {
                        value: e.name,
                        onChange: c => d({ name: c.target.value }),
                        placeholder:
                          'Es: Pulizia cucina, Controllo fornelli...',
                        'aria-invalid': !!o.name,
                      }),
                      o.name &&
                        s.jsx('p', {
                          className: 'mt-1 text-sm text-red-600',
                          children: o.name,
                        }),
                    ],
                  }),
                  s.jsxs('div', {
                    children: [
                      s.jsx(K, { children: 'Frequenza *' }),
                      s.jsxs(Te, {
                        value: e.frequenza,
                        onValueChange: c =>
                          d({
                            frequenza: c,
                            giorniCustom: c === 'custom' ? ['lunedi'] : void 0,
                          }),
                        children: [
                          s.jsx(Ce, {
                            children: s.jsx(Ee, {
                              placeholder: 'Seleziona frequenza',
                            }),
                          }),
                          s.jsx(Ne, {
                            children: pn.map(c =>
                              s.jsx(
                                se,
                                { value: c.value, children: c.label },
                                c.value
                              )
                            ),
                          }),
                        ],
                      }),
                      o.frequenza &&
                        s.jsx('p', {
                          className: 'mt-1 text-sm text-red-600',
                          children: o.frequenza,
                        }),
                    ],
                  }),
                  s.jsxs('div', {
                    children: [
                      s.jsx(K, { children: 'Ruolo *' }),
                      s.jsxs(Te, {
                        value: e.assegnatoARuolo || '',
                        onValueChange: c =>
                          d({
                            assegnatoARuolo: c,
                            assegnatoADipendenteSpecifico: void 0,
                          }),
                        children: [
                          s.jsx(Ce, {
                            children: s.jsx(Ee, {
                              placeholder: 'Seleziona ruolo',
                            }),
                          }),
                          s.jsxs(Ne, {
                            children: [
                              s.jsx(se, {
                                value: 'admin',
                                children: 'Amministratore',
                              }),
                              s.jsx(se, {
                                value: 'responsabile',
                                children: 'Responsabile',
                              }),
                              s.jsx(se, {
                                value: 'dipendente',
                                children: 'Dipendente',
                              }),
                              s.jsx(se, {
                                value: 'collaboratore',
                                children: 'Collaboratore',
                              }),
                            ],
                          }),
                        ],
                      }),
                      o.ruolo &&
                        s.jsx('p', {
                          className: 'mt-1 text-sm text-red-600',
                          children: o.ruolo,
                        }),
                    ],
                  }),
                  s.jsxs('div', {
                    children: [
                      s.jsx(K, { children: 'Categoria' }),
                      s.jsxs(Te, {
                        value: e.assegnatoACategoria || 'all',
                        onValueChange: c =>
                          d({
                            assegnatoACategoria: c,
                            assegnatoADipendenteSpecifico: void 0,
                          }),
                        disabled: !e.assegnatoARuolo,
                        children: [
                          s.jsx(Ce, {
                            children: s.jsx(Ee, {
                              placeholder: e.assegnatoARuolo
                                ? 'Seleziona categoria'
                                : 'Prima seleziona un ruolo',
                            }),
                          }),
                          s.jsxs(Ne, {
                            children: [
                              s.jsx(se, {
                                value: 'all',
                                children: 'Tutte le categorie',
                              }),
                              t
                                .filter(c => c.role === e.assegnatoARuolo)
                                .flatMap(c => c.categories)
                                .filter(c => c && c.trim() !== '')
                                .filter((c, u, x) => x.indexOf(c) === u)
                                .map(c =>
                                  s.jsx(se, { value: c, children: c }, c)
                                ),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.assegnatoARuolo &&
                    s.jsxs('div', {
                      className: 'md:col-span-2',
                      children: [
                        s.jsx(K, { children: 'Dipendente specifico' }),
                        s.jsxs(Te, {
                          value: e.assegnatoADipendenteSpecifico ?? 'none',
                          onValueChange: c =>
                            d({ assegnatoADipendenteSpecifico: c }),
                          disabled: !1,
                          children: [
                            s.jsx(Ce, {
                              children: s.jsx(Ee, {
                                placeholder:
                                  'Opzionale: seleziona dipendente specifico',
                              }),
                            }),
                            s.jsxs(Ne, {
                              children: [
                                s.jsx(se, {
                                  value: 'none',
                                  children: 'Nessun dipendente specifico',
                                }),
                                t
                                  .filter(c =>
                                    c.role !== e.assegnatoARuolo
                                      ? !1
                                      : e.assegnatoACategoria &&
                                          e.assegnatoACategoria !== 'all'
                                        ? c.categories.includes(
                                            e.assegnatoACategoria
                                          )
                                        : !0
                                  )
                                  .map(c =>
                                    s.jsxs(
                                      se,
                                      {
                                        value: c.id,
                                        children: [
                                          c.label,
                                          ' - ',
                                          c.categories.join(', '),
                                        ],
                                      },
                                      c.id
                                    )
                                  ),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  e.frequenza === 'custom' &&
                    s.jsxs('div', {
                      className: 'md:col-span-2',
                      children: [
                        s.jsx(K, { children: 'Giorni della settimana *' }),
                        s.jsx('div', {
                          className: 'grid grid-cols-2 gap-2 md:grid-cols-4',
                          children: ni.map(c =>
                            s.jsxs(
                              'label',
                              {
                                className: 'flex items-center gap-2',
                                children: [
                                  s.jsx('input', {
                                    type: 'checkbox',
                                    checked:
                                      e.giorniCustom?.includes(c.value) ?? !1,
                                    onChange: u => {
                                      const x = e.giorniCustom || [],
                                        b = u.target.checked
                                          ? [...x, c.value]
                                          : x.filter(j => j !== c.value)
                                      d({ giorniCustom: b })
                                    },
                                    className: 'rounded border-gray-300',
                                  }),
                                  s.jsx('span', {
                                    className: 'text-sm',
                                    children: c.label,
                                  }),
                                ],
                              },
                              c.value
                            )
                          ),
                        }),
                        o.giorni &&
                          s.jsx('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: o.giorni,
                          }),
                      ],
                    }),
                  s.jsxs('div', {
                    className: 'md:col-span-2',
                    children: [
                      s.jsx(K, { children: 'Note (opzionale)' }),
                      s.jsx(Ht, {
                        rows: 2,
                        value: e.note ?? '',
                        onChange: c => d({ note: c.target.value }),
                        placeholder: 'Note aggiuntive...',
                      }),
                    ],
                  }),
                ],
              }),
              s.jsxs('div', {
                className: 'flex justify-end gap-3 border-t pt-4 mt-4',
                children: [
                  s.jsx(re, {
                    variant: 'outline',
                    onClick: a,
                    children: 'Annulla',
                  }),
                  s.jsx(re, { onClick: i, children: 'Conferma Attività' }),
                ],
              }),
            ],
          })
        : null,
    })
  },
  Wd = {
    [ue.GLUTINE]: 'Glutine',
    [ue.LATTE]: 'Latte',
    [ue.UOVA]: 'Uova',
    [ue.SOIA]: 'Soia',
    [ue.FRUTTA_GUSCIO]: 'Frutta a guscio',
    [ue.ARACHIDI]: 'Arachidi',
    [ue.PESCE]: 'Pesce',
    [ue.CROSTACEI]: 'Crostacei',
  },
  Gd = ['kg', 'g', 'l', 'ml', 'pz', 'conf', 'buste', 'vaschette'],
  ri = ['active', 'expired', 'consumed', 'waste']
;[...ri]
const Yd = At({
    id: U(),
    name: U().min(2, 'Nome categoria troppo corto'),
    color: U().regex(/^#[0-9A-Fa-f]{6}$/i, 'Colore non valido'),
    description: U().optional(),
    conservationRules: At({
      minTemp: yt().min(-80).max(80),
      maxTemp: yt().min(-80).max(80),
      maxStorageDays: yt().min(1).max(365).optional(),
      requiresBlastChilling: Ja().optional(),
    }),
  }),
  Kd = At({
    id: U(),
    name: U().min(2, 'Il nome del prodotto è obbligatorio'),
    categoryId: U().min(1, 'Seleziona una categoria').optional(),
    departmentId: U().optional(),
    conservationPointId: U().optional(),
    sku: U().optional(),
    barcode: U().optional(),
    supplierName: U().optional(),
    purchaseDate: U().optional(),
    expiryDate: U().optional(),
    quantity: yt()
      .nonnegative({ message: 'La quantità deve essere positiva' })
      .optional(),
    unit: U().optional(),
    allergens: mt(Id(ue)).default([]),
    labelPhotoUrl: U().optional(),
    status: Ye(ri),
    notes: U().optional(),
  }),
  xs = {
    name: 'Inserisci il nome del prodotto',
    categoryId: 'Seleziona una categoria di appartenenza',
    departmentId: 'Seleziona un reparto di riferimento',
    conservationPointId: 'Associa un punto di conservazione',
    quantity: 'La quantità è obbligatoria',
    unit: "Seleziona l'unità di misura",
    purchaseDate: 'Seleziona la data di acquisto',
    expiryDate: 'Seleziona la data di scadenza',
  },
  Xd = ['quantity'],
  Qd = [
    'name',
    'categoryId',
    'departmentId',
    'conservationPointId',
    'unit',
    'purchaseDate',
    'expiryDate',
  ],
  Jd = e => {
    const t = {}
    return (
      Qd.forEach(n => {
        const r = e[n]
        ;(!r || (typeof r == 'string' && r.trim() === '')) && (t[n] = xs[n])
      }),
      Xd.forEach(n => {
        const r = e[n]
        ;(r == null || Number.isNaN(r)) && (t[n] = xs[n])
      }),
      t
    )
  },
  eu = (e, t) => {
    const n = Yd.safeParse(e)
    if (!n.success) {
      const i = {}
      return (
        n.error.issues.forEach(o => {
          const l = o.path.join('.')
          i[l] = o.message
        }),
        { success: !1, errors: i }
      )
    }
    const { minTemp: r, maxTemp: a } = e.conservationRules
    return r >= a
      ? {
          success: !1,
          errors: {
            minTemp: 'La temperatura minima deve essere inferiore alla massima',
            maxTemp: 'La temperatura massima deve essere superiore alla minima',
          },
        }
      : t.some(
            i =>
              i.id !== e.id &&
              i.name.trim().toLowerCase() === e.name.trim().toLowerCase()
          )
        ? {
            success: !1,
            errors: { name: 'Una categoria con questo nome esiste già' },
          }
        : { success: !0 }
  },
  tu = (e, t, n) => {
    const r = Kd.safeParse(e),
      a = Jd(e)
    if (!r.success || Object.keys(a).length > 0) {
      const i = { ...a }
      return (
        r.success ||
          r.error.issues.forEach(o => {
            const l = o.path.join('.')
            i[l] || (i[l] = o.message)
          }),
        { success: !1, errors: i }
      )
    }
    if (e.categoryId) {
      const i = t.find(o => o.id === e.categoryId)
      if (!i)
        return {
          success: !1,
          errors: { categoryId: 'Categoria selezionata non valida' },
        }
      if (e.conservationPointId) {
        const o = n.find(l => l.id === e.conservationPointId)
        if (o) {
          const {
            minTemp: l,
            maxTemp: d,
            requiresBlastChilling: c,
          } = i.conservationRules
          if (o.targetTemperature < l || o.targetTemperature > d)
            return {
              success: !1,
              errors: {
                conservationPointId:
                  'Il punto di conservazione non rispetta il range di temperatura richiesto',
              },
            }
          if (c && !o.isBlastChiller)
            return {
              success: !1,
              errors: {
                conservationPointId:
                  'La categoria richiede un abbattitore di temperatura',
              },
            }
        }
      }
    }
    if (e.purchaseDate && e.expiryDate) {
      const i = new Date(e.purchaseDate),
        o = new Date(e.expiryDate)
      if (i >= o)
        return {
          success: !1,
          errors: {
            expiryDate:
              'La data di scadenza deve essere successiva alla data di acquisto',
          },
        }
    }
    return { success: !0 }
  },
  si = e => `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  vs = {
    fromExisting(e) {
      return e
        ? {
            ...e,
            color: e.color ?? '#3b82f6',
            conservationRules: {
              minTemp: e.conservationRules.minTemp ?? 0,
              maxTemp: e.conservationRules.maxTemp ?? 4,
              maxStorageDays: e.conservationRules.maxStorageDays,
              requiresBlastChilling:
                e.conservationRules.requiresBlastChilling ?? !1,
            },
          }
        : {
            id: si('cat'),
            name: '',
            color: '#3b82f6',
            conservationRules: {
              minTemp: 0,
              maxTemp: 4,
              maxStorageDays: void 0,
              requiresBlastChilling: !1,
            },
          }
    },
  },
  nu = {
    fromExisting(e) {
      return e
        ? { ...e, allergens: e.allergens ?? [] }
        : { id: si('prod'), name: '', status: 'active', allergens: [] }
    },
  },
  bs = e => ({
    id: e.id,
    name: e.name.trim(),
    categoryId: e.categoryId || void 0,
    departmentId: e.departmentId || void 0,
    conservationPointId: e.conservationPointId || void 0,
    sku: e.sku?.trim() || void 0,
    barcode: e.barcode?.trim() || void 0,
    supplierName: e.supplierName?.trim() || void 0,
    purchaseDate: e.purchaseDate?.trim() || void 0,
    expiryDate: e.expiryDate?.trim() || void 0,
    quantity: e.quantity,
    unit: e.unit?.trim() || void 0,
    allergens: e.allergens ?? [],
    labelPhotoUrl: e.labelPhotoUrl?.trim() || void 0,
    status: e.status,
    complianceStatus: e.complianceStatus,
    notes: e.notes?.trim() || void 0,
  }),
  ru = e => Wd[e] || e,
  su = (e, t, n) => {
    if (!e.categoryId || !e.conservationPointId)
      return {
        compliant: !1,
        message:
          'Associa categoria e punto di conservazione per verificare la conformità',
      }
    const r = t.find(d => d.id === e.categoryId),
      a = n.find(d => d.id === e.conservationPointId)
    if (!r || !a)
      return {
        compliant: !1,
        message: 'Dati insufficienti per la verifica HACCP',
      }
    const {
      minTemp: i,
      maxTemp: o,
      requiresBlastChilling: l,
    } = r.conservationRules
    return a.targetTemperature < i || a.targetTemperature > o
      ? {
          compliant: !1,
          message: `Temperatura ${a.targetTemperature}°C fuori range (${i}°C - ${o}°C)`,
        }
      : l && !a.isBlastChiller
        ? {
            compliant: !1,
            message: 'La categoria richiede un abbattitore certificato',
          }
        : {
            compliant: !0,
            message: 'Configurazione conforme alle regole HACCP',
          }
  },
  au = [
    { value: ue.GLUTINE, label: 'Glutine' },
    { value: ue.LATTE, label: 'Latte' },
    { value: ue.UOVA, label: 'Uova' },
    { value: ue.SOIA, label: 'Soia' },
    { value: ue.FRUTTA_GUSCIO, label: 'Frutta a guscio' },
    { value: ue.ARACHIDI, label: 'Arachidi' },
    { value: ue.PESCE, label: 'Pesce' },
    { value: ue.CROSTACEI, label: 'Crostacei' },
  ],
  iu = ({
    data: e,
    departments: t,
    conservationPoints: n,
    onUpdate: r,
    onValidChange: a,
  }) => {
    const [i, o] = f.useState(
        (e?.categories ?? []).map(p => vs.fromExisting(p))
      ),
      [l, d] = f.useState((e?.products ?? []).map(bs)),
      [c, u] = f.useState('categories'),
      [x, b] = f.useState(null),
      [j, w] = f.useState({}),
      [m, v] = f.useState(null),
      [h, C] = f.useState({})
    ;(f.useEffect(() => {
      r({ categories: i, products: l })
    }, [i, l, r]),
      f.useEffect(() => {
        a(l.length > 0)
      }, [l.length, a]))
    const A = f.useMemo(() => t.filter(p => p.is_active), [t]),
      y = f.useMemo(
        () => l.reduce((p, g) => ((p[g.id] = su(g, i, n)), p), {}),
        [l, i, n]
      ),
      T = p => {
        ;(b(vs.fromExisting(p)), w({}))
      },
      _ = () => {
        ;(b(null), w({}))
      },
      S = () => {
        if (!x) return
        const p = eu(x, i)
        if (!p.success) {
          w(p.errors ?? {})
          return
        }
        ;(o(g => {
          const k = g.findIndex(O => O.id === x.id)
          if (k >= 0) {
            const O = [...g]
            return ((O[k] = x), O)
          }
          return [...g, x]
        }),
          _())
      },
      N = p => {
        ;(o(g => g.filter(k => k.id !== p)),
          d(g =>
            g.map(k => (k.categoryId === p ? { ...k, categoryId: void 0 } : k))
          ))
      },
      P = p => {
        ;(v(nu.fromExisting(p)), C({}))
      },
      L = () => {
        ;(v(null), C({}))
      },
      B = () => {
        if (!m) return
        const p = bs(m),
          g = tu(p, i, n)
        if (!g.success) {
          C(g.errors ?? {})
          return
        }
        ;(d(k => {
          const O = k.findIndex(I => I.id === p.id)
          if (O >= 0) {
            const I = [...k]
            return ((I[O] = p), I)
          }
          return [...k, p]
        }),
          L())
      },
      F = p => {
        d(g => g.filter(k => k.id !== p))
      },
      E = p => {
        v(
          g =>
            g && {
              ...g,
              allergens: g.allergens.includes(p)
                ? g.allergens.filter(k => k !== p)
                : [...g.allergens, p],
            }
        )
      }
    return s.jsxs('div', {
      className: 'space-y-6',
      children: [
        s.jsxs('header', {
          className: 'text-center space-y-2',
          children: [
            s.jsx('div', {
              className:
                'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100',
              children: s.jsx(Pt, { className: 'h-8 w-8 text-blue-600' }),
            }),
            s.jsx('h2', {
              className: 'text-2xl font-bold text-gray-900',
              children: 'Gestione Inventario',
            }),
            s.jsx('p', {
              className: 'text-gray-600',
              children:
                'Configura categorie prodotti e inventario iniziale per il controllo HACCP',
            }),
          ],
        }),
        s.jsxs('div', {
          className: 'flex space-x-1 rounded-lg bg-gray-100 p-1',
          children: [
            s.jsxs('button', {
              type: 'button',
              onClick: () => u('categories'),
              className: `flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${c === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`,
              children: [
                s.jsx(_r, { className: 'mr-2 inline h-4 w-4' }),
                'Categorie Prodotti',
              ],
            }),
            s.jsxs('button', {
              type: 'button',
              onClick: () => u('products'),
              className: `flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${c === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`,
              children: [
                s.jsx(Pt, { className: 'mr-2 inline h-4 w-4' }),
                'Prodotti',
              ],
            }),
          ],
        }),
        c === 'categories' &&
          s.jsxs('section', {
            className: 'space-y-6',
            children: [
              s.jsxs('div', {
                className: 'flex items-center justify-between',
                children: [
                  s.jsxs('div', {
                    children: [
                      s.jsxs('h3', {
                        className: 'text-lg font-semibold text-gray-900',
                        children: ['Categorie configurate (', i.length, ')'],
                      }),
                      s.jsx('p', {
                        className: 'text-sm text-gray-600',
                        children:
                          'Ogni categoria definisce i range termici e i requisiti HACCP',
                      }),
                    ],
                  }),
                  s.jsxs('button', {
                    type: 'button',
                    onClick: () => T(),
                    className:
                      'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700',
                    children: [
                      s.jsx(ot, { className: 'h-4 w-4' }),
                      ' Nuova categoria',
                    ],
                  }),
                ],
              }),
              i.length === 0
                ? s.jsx('div', {
                    className:
                      'rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500',
                    children:
                      'Nessuna categoria configurata. Aggiungi la prima categoria per iniziare.',
                  })
                : s.jsx('div', {
                    className: 'grid grid-cols-1 gap-4 md:grid-cols-2',
                    children: i.map(p =>
                      s.jsx(
                        'article',
                        {
                          className:
                            'rounded-lg border border-gray-200 bg-white p-4',
                          children: s.jsxs('div', {
                            className: 'flex items-start justify-between',
                            children: [
                              s.jsxs('div', {
                                className: 'flex-1',
                                children: [
                                  s.jsxs('div', {
                                    className: 'mb-2 flex items-center gap-2',
                                    children: [
                                      s.jsx('span', {
                                        className: 'h-4 w-4 rounded-full',
                                        style: { backgroundColor: p.color },
                                      }),
                                      s.jsx('h4', {
                                        className: 'font-medium text-gray-900',
                                        children: p.name,
                                      }),
                                    ],
                                  }),
                                  p.description &&
                                    s.jsx('p', {
                                      className: 'mb-2 text-sm text-gray-600',
                                      children: p.description,
                                    }),
                                  s.jsxs('dl', {
                                    className:
                                      'space-y-1 text-xs text-gray-600',
                                    children: [
                                      s.jsxs('div', {
                                        className: 'flex items-center gap-2',
                                        children: [
                                          s.jsx('span', {
                                            className: 'font-medium',
                                            children: 'Range:',
                                          }),
                                          s.jsxs('span', {
                                            children: [
                                              p.conservationRules.minTemp,
                                              '°C ➝',
                                              ' ',
                                              p.conservationRules.maxTemp,
                                              '°C',
                                            ],
                                          }),
                                        ],
                                      }),
                                      p.conservationRules.maxStorageDays &&
                                        s.jsxs('div', {
                                          className: 'flex items-center gap-2',
                                          children: [
                                            s.jsx('span', {
                                              className: 'font-medium',
                                              children: 'Durata max:',
                                            }),
                                            s.jsxs('span', {
                                              children: [
                                                p.conservationRules
                                                  .maxStorageDays,
                                                ' giorni',
                                              ],
                                            }),
                                          ],
                                        }),
                                      p.conservationRules
                                        .requiresBlastChilling &&
                                        s.jsx('div', {
                                          className:
                                            'flex items-center gap-2 text-amber-600',
                                          children: '⚡ Richiede abbattitore',
                                        }),
                                    ],
                                  }),
                                ],
                              }),
                              s.jsxs('div', {
                                className: 'ml-4 flex gap-2',
                                children: [
                                  s.jsx('button', {
                                    type: 'button',
                                    onClick: () => T(p),
                                    className:
                                      'rounded p-1 text-blue-600 hover:bg-blue-50',
                                    title: 'Modifica categoria',
                                    children: s.jsx(it, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                  s.jsx('button', {
                                    type: 'button',
                                    onClick: () => N(p.id),
                                    className:
                                      'rounded p-1 text-red-600 hover:bg-red-50',
                                    title: 'Elimina categoria',
                                    children: s.jsx(Xe, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        },
                        p.id
                      )
                    ),
                  }),
              x &&
                s.jsxs('div', {
                  className: 'rounded-lg border border-blue-200 bg-blue-50 p-4',
                  children: [
                    s.jsx('h4', {
                      className: 'mb-4 text-sm font-semibold text-blue-900',
                      children: i.some(p => p.id === x.id)
                        ? 'Modifica categoria'
                        : 'Nuova categoria',
                    }),
                    s.jsxs('div', {
                      className: 'grid grid-cols-1 gap-4 md:grid-cols-2',
                      children: [
                        s.jsxs('div', {
                          children: [
                            s.jsx('label', {
                              className:
                                'mb-1 block text-sm font-medium text-blue-900',
                              children: 'Nome *',
                            }),
                            s.jsx('input', {
                              type: 'text',
                              value: x.name,
                              onChange: p =>
                                b(g => g && { ...g, name: p.target.value }),
                              className: `w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${j.name ? 'border-red-300' : 'border-blue-200'}`,
                            }),
                            j.name &&
                              s.jsx('p', {
                                className: 'mt-1 text-xs text-red-600',
                                children: j.name,
                              }),
                          ],
                        }),
                        s.jsxs('div', {
                          children: [
                            s.jsx('label', {
                              className:
                                'mb-1 block text-sm font-medium text-blue-900',
                              children: 'Colore',
                            }),
                            s.jsx('input', {
                              type: 'color',
                              value: x.color,
                              onChange: p =>
                                b(g => g && { ...g, color: p.target.value }),
                              className:
                                'h-10 w-full cursor-pointer rounded-md border border-blue-200',
                            }),
                          ],
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx('label', {
                          className:
                            'mb-1 block text-sm font-medium text-blue-900',
                          children: 'Descrizione',
                        }),
                        s.jsx('textarea', {
                          value: x.description ?? '',
                          onChange: p =>
                            b(g => g && { ...g, description: p.target.value }),
                          rows: 3,
                          className:
                            'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                          placeholder: 'Descrizione opzionale',
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      className: 'grid grid-cols-1 gap-4 md:grid-cols-4',
                      children: [
                        s.jsxs('div', {
                          children: [
                            s.jsx('label', {
                              className:
                                'mb-1 block text-sm font-medium text-blue-900',
                              children: 'Temp. minima *',
                            }),
                            s.jsx('input', {
                              type: 'number',
                              step: '0.1',
                              value: x.conservationRules.minTemp,
                              onChange: p =>
                                b(
                                  g =>
                                    g && {
                                      ...g,
                                      conservationRules: {
                                        ...g.conservationRules,
                                        minTemp: Number(p.target.value),
                                      },
                                    }
                                ),
                              className:
                                'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                            }),
                          ],
                        }),
                        s.jsxs('div', {
                          children: [
                            s.jsx('label', {
                              className:
                                'mb-1 block text-sm font-medium text-blue-900',
                              children: 'Temp. massima *',
                            }),
                            s.jsx('input', {
                              type: 'number',
                              step: '0.1',
                              value: x.conservationRules.maxTemp,
                              onChange: p =>
                                b(
                                  g =>
                                    g && {
                                      ...g,
                                      conservationRules: {
                                        ...g.conservationRules,
                                        maxTemp: Number(p.target.value),
                                      },
                                    }
                                ),
                              className: `w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${j['conservationRules.maxTemp'] ? 'border-red-300' : 'border-blue-200'}`,
                            }),
                            j['conservationRules.maxTemp'] &&
                              s.jsx('p', {
                                className: 'mt-1 text-xs text-red-600',
                                children: j['conservationRules.maxTemp'],
                              }),
                          ],
                        }),
                        s.jsxs('div', {
                          children: [
                            s.jsx('label', {
                              className:
                                'mb-1 block text-sm font-medium text-blue-900',
                              children: 'Durata max (gg)',
                            }),
                            s.jsx('input', {
                              type: 'number',
                              min: 1,
                              value: x.conservationRules.maxStorageDays ?? '',
                              onChange: p =>
                                b(
                                  g =>
                                    g && {
                                      ...g,
                                      conservationRules: {
                                        ...g.conservationRules,
                                        maxStorageDays: p.target.value
                                          ? Number(p.target.value)
                                          : void 0,
                                      },
                                    }
                                ),
                              className:
                                'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                            }),
                          ],
                        }),
                        s.jsxs('div', {
                          className: 'flex items-end gap-2',
                          children: [
                            s.jsx('input', {
                              id: 'requiresBlastChilling',
                              type: 'checkbox',
                              checked:
                                x.conservationRules.requiresBlastChilling ?? !1,
                              onChange: p =>
                                b(
                                  g =>
                                    g && {
                                      ...g,
                                      conservationRules: {
                                        ...g.conservationRules,
                                        requiresBlastChilling: p.target.checked,
                                      },
                                    }
                                ),
                              className:
                                'h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500',
                            }),
                            s.jsx('label', {
                              htmlFor: 'requiresBlastChilling',
                              className: 'text-sm text-blue-900',
                              children: 'Richiede abbattitore',
                            }),
                          ],
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      className: 'flex justify-end gap-3 pt-2',
                      children: [
                        s.jsx('button', {
                          type: 'button',
                          onClick: _,
                          className:
                            'rounded-lg px-4 py-2 text-sm text-blue-900 hover:bg-blue-100',
                          children: 'Annulla',
                        }),
                        s.jsx('button', {
                          type: 'button',
                          onClick: S,
                          className:
                            'rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700',
                          children: 'Salva categoria',
                        }),
                      ],
                    }),
                  ],
                }),
            ],
          }),
        c === 'products' &&
          s.jsxs('section', {
            className: 'space-y-6',
            children: [
              s.jsxs('div', {
                className: 'flex items-center justify-between',
                children: [
                  s.jsxs('div', {
                    children: [
                      s.jsxs('h3', {
                        className: 'text-lg font-semibold text-gray-900',
                        children: ['Prodotti configurati (', l.length, ')'],
                      }),
                      s.jsx('p', {
                        className: 'text-sm text-gray-600',
                        children:
                          'Ogni prodotto viene validato secondo le regole HACCP di categoria',
                      }),
                    ],
                  }),
                  s.jsxs('button', {
                    type: 'button',
                    onClick: () => P(),
                    className:
                      'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700',
                    children: [
                      s.jsx(ot, { className: 'h-4 w-4' }),
                      ' Nuovo prodotto',
                    ],
                  }),
                ],
              }),
              l.length === 0
                ? s.jsx('div', {
                    className:
                      'rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500',
                    children:
                      'Nessun prodotto configurato. Aggiungi un prodotto per proseguire.',
                  })
                : s.jsx('div', {
                    className: 'grid grid-cols-1 gap-4',
                    children: l.map(p => {
                      const g = i.find(M => M.id === p.categoryId),
                        k = t.find(M => M.id === p.departmentId),
                        O = n.find(M => M.id === p.conservationPointId),
                        I = y[p.id]
                      return s.jsx(
                        'article',
                        {
                          className:
                            'rounded-lg border border-gray-200 bg-white p-4',
                          children: s.jsxs('div', {
                            className: 'flex items-start justify-between gap-4',
                            children: [
                              s.jsxs('div', {
                                className: 'flex-1 space-y-2',
                                children: [
                                  s.jsxs('div', {
                                    className:
                                      'flex flex-wrap items-center gap-2',
                                    children: [
                                      s.jsx('h4', {
                                        className: 'font-medium text-gray-900',
                                        children: p.name,
                                      }),
                                      p.quantity !== void 0 &&
                                        s.jsxs('span', {
                                          className: 'text-sm text-gray-500',
                                          children: [
                                            p.quantity,
                                            ' ',
                                            p.unit ?? 'pz',
                                          ],
                                        }),
                                      s.jsx('span', {
                                        className: `rounded-full px-2 py-1 text-xs capitalize ${p.status === 'active' ? 'bg-green-100 text-green-800' : p.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`,
                                        children: p.status,
                                      }),
                                    ],
                                  }),
                                  s.jsxs('dl', {
                                    className:
                                      'grid grid-cols-1 gap-1 text-xs text-gray-600 md:grid-cols-3',
                                    children: [
                                      g &&
                                        s.jsxs('div', {
                                          children: [
                                            s.jsx('dt', {
                                              className: 'font-semibold',
                                              children: 'Categoria:',
                                            }),
                                            s.jsx('dd', { children: g.name }),
                                          ],
                                        }),
                                      k &&
                                        s.jsxs('div', {
                                          children: [
                                            s.jsx('dt', {
                                              className: 'font-semibold',
                                              children: 'Reparto:',
                                            }),
                                            s.jsx('dd', { children: k.name }),
                                          ],
                                        }),
                                      O &&
                                        s.jsxs('div', {
                                          children: [
                                            s.jsx('dt', {
                                              className: 'font-semibold',
                                              children: 'Conservazione:',
                                            }),
                                            s.jsxs('dd', {
                                              children: [
                                                O.name,
                                                ' (',
                                                O.targetTemperature,
                                                '°C)',
                                              ],
                                            }),
                                          ],
                                        }),
                                    ],
                                  }),
                                  s.jsxs('div', {
                                    className:
                                      'flex flex-wrap gap-2 text-xs text-gray-500',
                                    children: [
                                      p.supplierName &&
                                        s.jsx('span', {
                                          className:
                                            'rounded-full bg-gray-100 px-2 py-1',
                                          children: p.supplierName,
                                        }),
                                      p.expiryDate &&
                                        s.jsxs('span', {
                                          className:
                                            'rounded-full bg-amber-100 px-2 py-1 text-amber-700',
                                          children: [
                                            'Scadenza: ',
                                            p.expiryDate,
                                          ],
                                        }),
                                      p.allergens.length > 0 &&
                                        s.jsxs('span', {
                                          className:
                                            'rounded-full bg-red-100 px-2 py-1 text-red-700',
                                          children: [
                                            'Allergeni:',
                                            ' ',
                                            p.allergens.map(ru).join(', '),
                                          ],
                                        }),
                                    ],
                                  }),
                                  p.labelPhotoUrl &&
                                    s.jsx('a', {
                                      href: p.labelPhotoUrl,
                                      target: '_blank',
                                      rel: 'noreferrer',
                                      className:
                                        'inline-flex items-center gap-2 text-xs text-blue-600 hover:underline',
                                      children: 'Visualizza etichetta',
                                    }),
                                  s.jsx('div', {
                                    className: `rounded-md border px-3 py-2 text-xs ${I.compliant ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`,
                                    children: I.message,
                                  }),
                                  p.notes &&
                                    s.jsx('p', {
                                      className:
                                        'border-l-2 border-blue-200 pl-3 text-sm text-gray-500',
                                      children: p.notes,
                                    }),
                                ],
                              }),
                              s.jsxs('div', {
                                className: 'flex gap-2',
                                children: [
                                  s.jsx('button', {
                                    type: 'button',
                                    onClick: () => P(p),
                                    className:
                                      'rounded p-1 text-blue-600 hover:bg-blue-50',
                                    title: 'Modifica prodotto',
                                    children: s.jsx(it, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                  s.jsx('button', {
                                    type: 'button',
                                    onClick: () => F(p.id),
                                    className:
                                      'rounded p-1 text-red-600 hover:bg-red-50',
                                    title: 'Elimina prodotto',
                                    children: s.jsx(Xe, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        },
                        p.id
                      )
                    }),
                  }),
              m &&
                s.jsxs('div', {
                  className:
                    'space-y-6 rounded-lg border border-blue-200 bg-blue-50 p-6',
                  children: [
                    s.jsxs('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        s.jsx('div', {
                          className: 'p-2 bg-blue-100 rounded-lg',
                          children: s.jsx(Pt, {
                            className: 'w-5 h-5 text-blue-600',
                          }),
                        }),
                        s.jsxs('div', {
                          children: [
                            s.jsx('h4', {
                              className: 'text-lg font-semibold text-blue-900',
                              children: l.some(p => p.id === m.id)
                                ? 'Modifica Prodotto'
                                : 'Nuovo Prodotto',
                            }),
                            s.jsx('p', {
                              className: 'text-sm text-blue-600',
                              children: l.some(p => p.id === m.id)
                                ? 'Aggiorna le informazioni del prodotto'
                                : "Aggiungi un nuovo prodotto all'inventario",
                            }),
                          ],
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      className: 'space-y-4',
                      children: [
                        s.jsxs('h3', {
                          className:
                            'text-lg font-medium text-blue-900 flex items-center gap-2',
                          children: [
                            s.jsx(Pt, { className: 'w-5 h-5' }),
                            'Informazioni Base',
                          ],
                        }),
                        s.jsxs('div', {
                          className: 'grid grid-cols-1 gap-4 md:grid-cols-2',
                          children: [
                            s.jsxs('div', {
                              children: [
                                s.jsx('label', {
                                  className:
                                    'mb-1 block text-sm font-medium text-blue-900',
                                  children: 'Nome prodotto *',
                                }),
                                s.jsx('input', {
                                  type: 'text',
                                  value: m.name,
                                  onChange: p =>
                                    v(g => g && { ...g, name: p.target.value }),
                                  className: `w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${h.name ? 'border-red-300' : 'border-blue-200'}`,
                                }),
                                h.name &&
                                  s.jsx('p', {
                                    className: 'mt-1 text-xs text-red-600',
                                    children: h.name,
                                  }),
                              ],
                            }),
                            s.jsxs('div', {
                              className: 'grid grid-cols-2 gap-4',
                              children: [
                                s.jsxs('div', {
                                  children: [
                                    s.jsx('label', {
                                      className:
                                        'mb-1 block text-sm font-medium text-blue-900',
                                      children: 'SKU',
                                    }),
                                    s.jsx('input', {
                                      type: 'text',
                                      value: m.sku ?? '',
                                      onChange: p =>
                                        v(
                                          g =>
                                            g && { ...g, sku: p.target.value }
                                        ),
                                      className:
                                        'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                                    }),
                                  ],
                                }),
                                s.jsxs('div', {
                                  children: [
                                    s.jsx('label', {
                                      className:
                                        'mb-1 block text-sm font-medium text-blue-900',
                                      children: 'Barcode',
                                    }),
                                    s.jsx('input', {
                                      type: 'text',
                                      value: m.barcode ?? '',
                                      onChange: p =>
                                        v(
                                          g =>
                                            g && {
                                              ...g,
                                              barcode: p.target.value,
                                            }
                                        ),
                                      className:
                                        'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      className: 'space-y-4',
                      children: [
                        s.jsxs('h3', {
                          className:
                            'text-lg font-medium text-blue-900 flex items-center gap-2',
                          children: [
                            s.jsx(_r, { className: 'w-5 h-5' }),
                            'Categoria e Posizione',
                          ],
                        }),
                        s.jsxs('div', {
                          className: 'grid grid-cols-1 gap-4 md:grid-cols-2',
                          children: [
                            s.jsxs('div', {
                              children: [
                                s.jsx('label', {
                                  className:
                                    'mb-1 block text-sm font-medium text-blue-900',
                                  children: 'Categoria',
                                }),
                                s.jsxs('select', {
                                  value: m.categoryId ?? '',
                                  onChange: p =>
                                    v(
                                      g =>
                                        g && {
                                          ...g,
                                          categoryId: p.target.value || void 0,
                                        }
                                    ),
                                  className:
                                    'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                                  children: [
                                    s.jsx('option', {
                                      value: '',
                                      children: 'Seleziona categoria',
                                    }),
                                    i.map(p =>
                                      s.jsx(
                                        'option',
                                        { value: p.id, children: p.name },
                                        p.id
                                      )
                                    ),
                                  ],
                                }),
                                h.categoryId &&
                                  s.jsx('p', {
                                    className: 'mt-1 text-xs text-red-600',
                                    children: h.categoryId,
                                  }),
                              ],
                            }),
                            s.jsxs('div', {
                              className: 'grid grid-cols-2 gap-4',
                              children: [
                                s.jsxs('div', {
                                  children: [
                                    s.jsx('label', {
                                      className:
                                        'mb-1 block text-sm font-medium text-blue-900',
                                      children: 'Reparto',
                                    }),
                                    s.jsxs('select', {
                                      value: m.departmentId ?? '',
                                      onChange: p =>
                                        v(
                                          g =>
                                            g && {
                                              ...g,
                                              departmentId:
                                                p.target.value || void 0,
                                            }
                                        ),
                                      className:
                                        'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                                      children: [
                                        s.jsx('option', {
                                          value: '',
                                          children: 'Seleziona reparto',
                                        }),
                                        A.map(p =>
                                          s.jsx(
                                            'option',
                                            { value: p.id, children: p.name },
                                            p.id
                                          )
                                        ),
                                      ],
                                    }),
                                  ],
                                }),
                                s.jsxs('div', {
                                  children: [
                                    s.jsx('label', {
                                      className:
                                        'mb-1 block text-sm font-medium text-blue-900',
                                      children: 'Conservazione',
                                    }),
                                    s.jsxs('select', {
                                      value: m.conservationPointId ?? '',
                                      onChange: p =>
                                        v(
                                          g =>
                                            g && {
                                              ...g,
                                              conservationPointId:
                                                p.target.value || void 0,
                                            }
                                        ),
                                      className: `w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${h.conservationPointId ? 'border-red-300' : 'border-blue-200'}`,
                                      children: [
                                        s.jsx('option', {
                                          value: '',
                                          children:
                                            'Seleziona punto conservazione',
                                        }),
                                        n.map(p =>
                                          s.jsxs(
                                            'option',
                                            {
                                              value: p.id,
                                              children: [
                                                p.name,
                                                ' (',
                                                p.targetTemperature,
                                                '°C)',
                                              ],
                                            },
                                            p.id
                                          )
                                        ),
                                      ],
                                    }),
                                    h.conservationPointId &&
                                      s.jsx('p', {
                                        className: 'mt-1 text-xs text-red-600',
                                        children: h.conservationPointId,
                                      }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      className: 'space-y-4',
                      children: [
                        s.jsxs('h3', {
                          className:
                            'text-lg font-medium text-blue-900 flex items-center gap-2',
                          children: [
                            s.jsx(ws, { className: 'w-5 h-5' }),
                            'Date e Quantità',
                          ],
                        }),
                        s.jsxs('div', {
                          className: 'grid grid-cols-1 gap-4 md:grid-cols-2',
                          children: [
                            s.jsxs('div', {
                              children: [
                                s.jsx('label', {
                                  className:
                                    'mb-1 block text-sm font-medium text-blue-900',
                                  children: 'Data Acquisto',
                                }),
                                s.jsx('input', {
                                  type: 'date',
                                  value: m?.purchaseDate ?? '',
                                  onChange: p =>
                                    v(
                                      g =>
                                        g && {
                                          ...g,
                                          purchaseDate:
                                            p.target.value || void 0,
                                        }
                                    ),
                                  className:
                                    'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                                }),
                              ],
                            }),
                            s.jsxs('div', {
                              children: [
                                s.jsx('label', {
                                  className:
                                    'mb-1 block text-sm font-medium text-blue-900',
                                  children: 'Data Scadenza',
                                }),
                                s.jsx('input', {
                                  type: 'date',
                                  value: m?.expiryDate ?? '',
                                  onChange: p =>
                                    v(
                                      g =>
                                        g && {
                                          ...g,
                                          expiryDate: p.target.value || void 0,
                                        }
                                    ),
                                  className: `w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${h.expiryDate ? 'border-red-300' : 'border-blue-200'}`,
                                }),
                                h.expiryDate &&
                                  s.jsx('p', {
                                    className: 'mt-1 text-xs text-red-600',
                                    children: h.expiryDate,
                                  }),
                              ],
                            }),
                            s.jsxs('div', {
                              children: [
                                s.jsx('label', {
                                  className:
                                    'mb-1 block text-sm font-medium text-blue-900',
                                  children: 'Quantità',
                                }),
                                s.jsx('input', {
                                  type: 'number',
                                  min: 0,
                                  step: '0.001',
                                  value: m.quantity ?? '',
                                  onChange: p =>
                                    v(
                                      g =>
                                        g && {
                                          ...g,
                                          quantity: p.target.value
                                            ? Number(p.target.value)
                                            : void 0,
                                        }
                                    ),
                                  className: `w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${h.quantity ? 'border-red-300' : 'border-blue-200'}`,
                                }),
                                h.quantity &&
                                  s.jsx('p', {
                                    className: 'mt-1 text-xs text-red-600',
                                    children: h.quantity,
                                  }),
                              ],
                            }),
                            s.jsxs('div', {
                              children: [
                                s.jsx('label', {
                                  className:
                                    'mb-1 block text-sm font-medium text-blue-900',
                                  children: 'Unità',
                                }),
                                s.jsx('select', {
                                  value: m.unit ?? 'pz',
                                  onChange: p =>
                                    v(g => g && { ...g, unit: p.target.value }),
                                  className:
                                    'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                                  children: Gd.map(p =>
                                    s.jsx(
                                      'option',
                                      { value: p, children: p },
                                      p
                                    )
                                  ),
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsxs('h3', {
                          className:
                            'text-lg font-medium text-blue-900 flex items-center gap-2 mb-4',
                          children: [
                            s.jsx(fi, { className: 'w-5 h-5' }),
                            'Allergeni',
                          ],
                        }),
                        s.jsx('div', {
                          className: 'grid grid-cols-2 md:grid-cols-4 gap-3',
                          children: au.map(p =>
                            s.jsxs(
                              'label',
                              {
                                className:
                                  'flex items-center gap-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50/50 cursor-pointer',
                                children: [
                                  s.jsx('input', {
                                    type: 'checkbox',
                                    checked:
                                      m?.allergens.includes(p.value) || !1,
                                    onChange: () => E(p.value),
                                    className:
                                      'w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500',
                                  }),
                                  s.jsx('span', {
                                    className:
                                      'text-sm font-medium text-blue-900',
                                    children: p.label,
                                  }),
                                ],
                              },
                              p.value
                            )
                          ),
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx('label', {
                          className:
                            'mb-1 block text-sm font-medium text-blue-900',
                          children: 'URL Foto Etichetta',
                        }),
                        s.jsx('input', {
                          type: 'url',
                          value: m?.labelPhotoUrl ?? '',
                          onChange: p =>
                            v(
                              g => g && { ...g, labelPhotoUrl: p.target.value }
                            ),
                          className:
                            'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                          placeholder: 'https://...',
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      children: [
                        s.jsx('label', {
                          className:
                            'mb-1 block text-sm font-medium text-blue-900',
                          children: 'Note',
                        }),
                        s.jsx('textarea', {
                          value: m.notes ?? '',
                          onChange: p =>
                            v(g => g && { ...g, notes: p.target.value }),
                          rows: 3,
                          className:
                            'w-full rounded-md border border-blue-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                          placeholder: 'Informazioni aggiuntive',
                        }),
                      ],
                    }),
                    s.jsxs('div', {
                      className:
                        'flex justify-end gap-3 border-t border-blue-200 pt-4',
                      children: [
                        s.jsx('button', {
                          type: 'button',
                          onClick: L,
                          className:
                            'rounded-lg px-4 py-2 text-sm text-blue-900 hover:bg-blue-100',
                          children: 'Annulla',
                        }),
                        s.jsx('button', {
                          type: 'button',
                          onClick: B,
                          className:
                            'rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700',
                          children: 'Salva prodotto',
                        }),
                      ],
                    }),
                  ],
                }),
            ],
          }),
      ],
    })
  },
  Kt = [
    {
      id: 0,
      title: 'Informazioni Aziendali',
      description: 'Dati base della tua azienda',
      icon: zt,
    },
    {
      id: 1,
      title: 'Reparti',
      description: 'Organizzazione aziendale',
      icon: Ns,
    },
    {
      id: 2,
      title: 'Personale',
      description: 'Staff e responsabilità',
      icon: mi,
    },
    {
      id: 3,
      title: 'Conservazione',
      description: 'Punti di controllo temperatura',
      icon: Fn,
    },
    { id: 4, title: 'Attività', description: 'Task e manutenzioni', icon: pi },
    {
      id: 5,
      title: 'Inventario',
      description: 'Prodotti e categorie',
      icon: Pt,
    },
  ],
  ou = ({ currentStep: e, totalSteps: t, onStepClick: n }) => {
    const r = i => (i < e ? 'completed' : i === e ? 'current' : 'upcoming'),
      a = i => {
        switch (i) {
          case 'completed':
            return {
              container: 'border-green-200 bg-green-50',
              icon: 'bg-green-600 text-white',
              text: 'text-green-900',
              description: 'text-green-600',
            }
          case 'current':
            return {
              container:
                'border-blue-200 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50',
              icon: 'bg-blue-600 text-white',
              text: 'text-blue-900',
              description: 'text-blue-600',
            }
          default:
            return {
              container: 'border-gray-200 bg-gray-50',
              icon: 'bg-gray-300 text-gray-600',
              text: 'text-gray-500',
              description: 'text-gray-400',
            }
        }
      }
    return s.jsxs('div', {
      className: 'mb-8',
      children: [
        s.jsx('div', {
          className: 'hidden md:block',
          children: s.jsx('div', {
            className: 'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6',
            children: Kt.map(i => {
              const o = r(i.id),
                l = a(o),
                d = i.icon
              return s.jsxs(
                'button',
                {
                  onClick: () => n(i.id),
                  disabled: i.id > e,
                  className: `
                  p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${l.container}
                  ${i.id <= e ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed'}
                `,
                  children: [
                    s.jsxs('div', {
                      className: 'flex items-center mb-2',
                      children: [
                        s.jsx('div', {
                          className: `
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${l.icon}
                  `,
                          children:
                            o === 'completed'
                              ? s.jsx('span', { children: '✓' })
                              : s.jsx(d, { className: 'w-4 h-4' }),
                        }),
                        s.jsx('span', {
                          className: `ml-2 text-xs font-medium ${l.text}`,
                          children: i.id + 1,
                        }),
                      ],
                    }),
                    s.jsx('h3', {
                      className: `text-sm font-semibold mb-1 ${l.text}`,
                      children: i.title,
                    }),
                    s.jsx('p', {
                      className: `text-xs ${l.description}`,
                      children: i.description,
                    }),
                  ],
                },
                i.id
              )
            }),
          }),
        }),
        s.jsxs('div', {
          className: 'md:hidden',
          children: [
            s.jsxs('div', {
              className: 'flex items-center justify-between mb-4',
              children: [
                s.jsxs('span', {
                  className: 'text-sm font-medium text-gray-500',
                  children: ['Passo ', e + 1, ' di ', t],
                }),
                s.jsxs('span', {
                  className: 'text-sm text-gray-400',
                  children: [Math.round(((e + 1) / t) * 100), '% completato'],
                }),
              ],
            }),
            s.jsx('div', {
              className: 'bg-white rounded-lg border border-gray-200 p-4',
              children: s.jsxs('div', {
                className: 'flex items-center',
                children: [
                  s.jsx('div', {
                    className: `
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              bg-blue-600 text-white
            `,
                    children: xe.createElement(Kt[e].icon, {
                      className: 'w-5 h-5',
                    }),
                  }),
                  s.jsxs('div', {
                    className: 'ml-3',
                    children: [
                      s.jsx('h3', {
                        className: 'text-base font-semibold text-gray-900',
                        children: Kt[e].title,
                      }),
                      s.jsx('p', {
                        className: 'text-sm text-gray-500',
                        children: Kt[e].description,
                      }),
                    ],
                  }),
                ],
              }),
            }),
            s.jsx('div', {
              className: 'flex justify-center mt-4 space-x-2',
              children: Array.from({ length: t }).map((i, o) => {
                const l = r(o)
                return s.jsx(
                  'button',
                  {
                    onClick: () => n(o),
                    disabled: o > e,
                    className: `
                  w-3 h-3 rounded-full transition-all duration-200
                  ${l === 'completed' ? 'bg-green-500' : l === 'current' ? 'bg-blue-500' : 'bg-gray-300'}
                  ${o <= e ? 'cursor-pointer' : 'cursor-not-allowed'}
                `,
                  },
                  o
                )
              }),
            }),
          ],
        }),
      ],
    })
  },
  lu = ({
    onPrefillOnboarding: e,
    onResetOnboarding: t,
    onCompleteOnboarding: n,
    isDevMode: r = !1,
  }) => (
    f.useEffect(() => {
      r && console.log('DevButtons loaded in dev mode')
    }, [r]),
    s.jsxs('div', {
      className: 'flex gap-2 flex-wrap',
      children: [
        s.jsxs('button', {
          onClick: e,
          className:
            'flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-200 rounded-md hover:text-green-700 hover:bg-green-50 transition-colors',
          title: 'Precompila onboarding con dati di test',
          children: [
            s.jsx(Ns, { className: 'h-4 w-4' }),
            s.jsx('span', {
              className: 'hidden sm:inline',
              children: 'Precompila',
            }),
            s.jsx('span', { className: 'sm:hidden', children: 'Precompila' }),
          ],
        }),
        s.jsxs('button', {
          onClick: n,
          className:
            'flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:text-blue-700 hover:bg-blue-50 transition-colors',
          title: 'Completa onboarding automaticamente',
          children: [
            s.jsx(hi, { className: 'h-4 w-4' }),
            s.jsx('span', {
              className: 'hidden sm:inline',
              children: 'Completa Onboarding',
            }),
            s.jsx('span', { className: 'sm:hidden', children: 'Completa' }),
          ],
        }),
        s.jsxs('button', {
          onClick: t,
          className:
            'flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:text-red-700 hover:bg-red-50 transition-colors',
          title: 'Reset completo onboarding e app',
          children: [
            s.jsx(gi, { className: 'h-4 w-4' }),
            s.jsx('span', {
              className: 'hidden sm:inline',
              children: 'Reset Onboarding',
            }),
            s.jsx('span', { className: 'sm:hidden', children: 'Reset' }),
          ],
        }),
      ],
    })
  ),
  It = 6,
  bu = () => {
    const e = Ni(),
      { companyId: t } = yi(),
      [n, r] = f.useState(0),
      [a, i] = f.useState({}),
      [o, l] = f.useState(!1),
      [d, c] = f.useState(!1),
      [u, x] = f.useState(!1)
    f.useEffect(() => {
      const E = localStorage.getItem('onboarding-data')
      if (E)
        try {
          const p = JSON.parse(E)
          i(p)
        } catch (p) {
          console.error('Error parsing saved onboarding data:', p)
        }
    }, [])
    const b = f.useCallback(() => {
        try {
          const E = wi()
          ;(i(E), Rt.success('Dati precompilati caricati!'))
        } catch (E) {
          ;(console.error('Error prefilling onboarding:', E),
            Rt.error('Errore durante la precompilazione'))
        }
      }, []),
      j = f.useCallback(() => {
        ji()
      }, []),
      w = f.useCallback(() => {
        Ci()
      }, []),
      m = f.useRef()
    f.useEffect(
      () => (
        m.current && clearTimeout(m.current),
        Object.keys(a).length > 0 &&
          (m.current = setTimeout(() => {
            localStorage.setItem('onboarding-data', JSON.stringify(a))
          }, 500)),
        () => {
          m.current && clearTimeout(m.current)
        }
      ),
      [a]
    )
    const v = f.useCallback((E, p) => {
        i(g => ({ ...g, [E]: p }))
      }, []),
      h = f.useCallback(E => {
        l(E)
      }, []),
      C = f.useCallback(
        E => {
          v('tasks', E)
        },
        [v]
      ),
      A = f.useCallback(
        E => {
          v('conservation', E)
        },
        [v]
      ),
      y = f.useCallback(
        E => {
          v('staff', E)
        },
        [v]
      ),
      T = async () => {
        if (!o) {
          Rt.error('Completa tutti i campi obbligatori prima di continuare')
          return
        }
        n < It - 1 ? r(E => E + 1) : await S()
      },
      _ = () => {
        n > 0 && r(E => E - 1)
      },
      S = async () => {
        ;(x(!0), c(!0))
        try {
          await B()
          const { error: E } = await qe
            .from('companies')
            .update({
              onboarding_completed: !0,
              onboarding_completed_at: new Date().toISOString(),
            })
            .eq('id', t)
          if (E) throw E
          ;(localStorage.removeItem('onboarding-data'),
            Rt.success('Onboarding completato con successo!'),
            e('/'))
        } catch (E) {
          ;(console.error('Error completing onboarding:', E),
            Rt.error("Errore durante il completamento dell'onboarding"))
        } finally {
          ;(x(!1), c(!1))
        }
      },
      N = E =>
        ({
          rilevamento_temperatura: 'temperature_monitoring',
          sanificazione: 'sanitation',
          sbrinamento: 'defrosting',
          controllo_scadenze: 'expiry_check',
        })[E] || 'general_maintenance',
      P = E =>
        ({
          giornaliera: 'daily',
          settimanale: 'weekly',
          mensile: 'monthly',
          annuale: 'annual',
          custom: 'custom',
        })[E] || 'weekly',
      L = E => {
        const p = new Date()
        switch (E) {
          case 'giornaliera':
            return new Date(p.setDate(p.getDate() + 1)).toISOString()
          case 'settimanale':
            return new Date(p.setDate(p.getDate() + 7)).toISOString()
          case 'mensile':
            return new Date(p.setMonth(p.getMonth() + 1)).toISOString()
          case 'annuale':
            return new Date(p.setFullYear(p.getFullYear() + 1)).toISOString()
          default:
            return new Date(p.setDate(p.getDate() + 7)).toISOString()
        }
      },
      B = async () => {
        if (!t) throw new Error('Company ID not found')
        if (a.business) {
          const { error: E } = await qe
            .from('companies')
            .update({ ...a.business, updated_at: new Date().toISOString() })
            .eq('id', t)
          if (E) throw E
        }
        if (a.departments?.length) {
          const E = a.departments.map(g => ({
              ...g,
              company_id: t,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            { error: p } = await qe.from('departments').insert(E)
          if (p) throw p
        }
        if (a.staff?.length) {
          const E = a.staff.map(g => ({
              company_id: t,
              name: g.fullName || `${g.name} ${g.surname}`,
              role: g.role,
              category: Array.isArray(g.categories)
                ? g.categories[0] || 'Altro'
                : g.category,
              email: g.email || null,
              phone: g.phone || null,
              hire_date: null,
              status: 'active',
              notes: g.notes || null,
              haccp_certification: g.haccpExpiry
                ? {
                    level: 'base',
                    expiry_date: g.haccpExpiry,
                    issuing_authority: '',
                    certificate_number: '',
                  }
                : null,
              department_assignments: g.department_assignments || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            { error: p } = await qe.from('staff').insert(E)
          if (p) throw p
        }
        if (a.conservation?.points?.length) {
          const E = a.conservation.points.map(g => ({
              company_id: t,
              department_id: g.departmentId,
              name: g.name,
              setpoint_temp: g.targetTemperature,
              type: g.pointType,
              product_categories: g.productCategories || [],
              is_blast_chiller: g.isBlastChiller || !1,
              status: 'normal',
              maintenance_due: g.maintenanceDue || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            { error: p } = await qe.from('conservation_points').insert(E)
          if (p) throw p
        }
        if (a.tasks?.conservationMaintenancePlans?.length) {
          const E = a.tasks.conservationMaintenancePlans.map(g => ({
              company_id: t,
              conservation_point_id: g.conservationPointId,
              type: N(g.manutenzione),
              frequency: P(g.frequenza),
              title: `Manutenzione: ${g.manutenzione}`,
              description: g.note || '',
              priority: 'medium',
              status: 'scheduled',
              next_due: L(g.frequenza),
              estimated_duration: 60,
              instructions: [],
              assigned_to_staff_id:
                g.assegnatoARuolo === 'specifico'
                  ? g.assegnatoADipendenteSpecifico
                  : null,
              assigned_to_role:
                g.assegnatoARuolo !== 'specifico' ? g.assegnatoARuolo : null,
              assigned_to_category: g.assegnatoACategoria || null,
              assigned_to:
                g.assegnatoADipendenteSpecifico || g.assegnatoARuolo || '',
              assignment_type:
                g.assegnatoARuolo === 'specifico' ? 'staff' : 'role',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            { error: p } = await qe.from('maintenance_tasks').insert(E)
          if (p) throw p
        }
        if (a.tasks?.genericTasks?.length) {
          const E = a.tasks.genericTasks.map(g => ({
              company_id: t,
              name: g.name,
              frequency: P(g.frequenza),
              description: g.note || '',
              department_id: null,
              conservation_point_id: null,
              priority: 'medium',
              estimated_duration: 60,
              checklist: [],
              required_tools: [],
              haccp_category: null,
              next_due: L(g.frequenza),
              status: 'pending',
              assigned_to_staff_id:
                g.assegnatoARuolo === 'specifico'
                  ? g.assegnatoADipendenteSpecifico
                  : null,
              assigned_to_role:
                g.assegnatoARuolo !== 'specifico' ? g.assegnatoARuolo : null,
              assigned_to_category: g.assegnatoACategoria || null,
              assigned_to:
                g.assegnatoADipendenteSpecifico || g.assegnatoARuolo || '',
              assignment_type:
                g.assegnatoARuolo === 'specifico' ? 'staff' : 'role',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            { error: p } = await qe.from('tasks').insert(E)
          if (p) throw p
        }
        if (a.inventory?.products?.length) {
          const E = a.inventory.products.map(g => ({
              ...g,
              company_id: t,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            { error: p } = await qe.from('products').insert(E)
          if (p) throw p
        }
      },
      F = () => {
        switch (n) {
          case 0:
            return s.jsx(Si, {
              data: a.business,
              onUpdate: E => v('business', E),
              onValidChange: h,
            })
          case 1:
            return s.jsx(Ai, {
              data: a.departments,
              onUpdate: E => v('departments', E),
              onValidChange: h,
            })
          case 2:
            return s.jsx(Dd, {
              data: a.staff,
              departments: a.departments || [],
              onUpdate: y,
              onValidChange: h,
            })
          case 3:
            return s.jsx(Hd, {
              data: a.conservation,
              departments: a.departments || [],
              onUpdate: A,
              onValidChange: h,
            })
          case 4:
            return s.jsx(Zd, {
              data: a.tasks,
              departments: a.departments || [],
              conservationPoints: a.conservation?.points || [],
              staff: a.staff || [],
              onUpdate: C,
              onValidChange: h,
            })
          case 5:
            return s.jsx(iu, {
              data: a.inventory,
              departments: a.departments || [],
              conservationPoints: a.conservation?.points || [],
              onUpdate: E => v('inventory', E),
              onValidChange: h,
            })
          default:
            return null
        }
      }
    return s.jsx('div', {
      className: 'min-h-screen bg-gray-50',
      'data-testid': 'onboarding-wizard',
      children: s.jsxs('div', {
        className: 'max-w-4xl mx-auto py-6 px-4 sm:py-8',
        children: [
          s.jsxs('div', {
            className: 'text-center mb-6 space-y-3 sm:mb-8',
            children: [
              s.jsx('h1', {
                className: 'text-2xl font-bold text-gray-900 sm:text-3xl',
                children: 'Configurazione Iniziale HACCP',
              }),
              s.jsx('p', {
                className: 'text-sm text-gray-600 sm:text-base',
                children:
                  'Configura la tua azienda per iniziare a utilizzare il sistema HACCP',
              }),
              s.jsx('div', {
                className:
                  'flex flex-col items-center gap-2 sm:flex-row sm:justify-center',
                children: s.jsx(lu, {
                  onPrefillOnboarding: b,
                  onResetOnboarding: w,
                  onCompleteOnboarding: j,
                  isDevMode: !1,
                }),
              }),
            ],
          }),
          s.jsx(ou, { currentStep: n, totalSteps: It, onStepClick: r }),
          s.jsx('div', {
            className:
              'bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6',
            children: F(),
          }),
          s.jsxs('div', {
            className: 'flex justify-between',
            children: [
              s.jsx('button', {
                type: 'button',
                onClick: _,
                disabled: n === 0,
                className:
                  'px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
                children: 'Indietro',
              }),
              s.jsx('button', {
                type: 'button',
                onClick: T,
                disabled: !o || d,
                className:
                  'px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
                children: u
                  ? s.jsxs(s.Fragment, {
                      children: [
                        s.jsx('div', {
                          className:
                            'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin',
                        }),
                        'Completando...',
                      ],
                    })
                  : n === It - 1
                    ? 'Completa Configurazione'
                    : 'Avanti',
              }),
            ],
          }),
          s.jsxs('div', {
            className: 'mt-6',
            children: [
              s.jsx('div', {
                className: 'bg-gray-200 rounded-full h-2',
                children: s.jsx('div', {
                  className:
                    'bg-blue-600 h-2 rounded-full transition-all duration-300',
                  style: { width: `${((n + 1) / It) * 100}%` },
                }),
              }),
              s.jsxs('p', {
                className: 'text-center text-sm text-gray-500 mt-2',
                children: ['Step ', n + 1, ' di ', It],
              }),
            ],
          }),
        ],
      }),
    })
  }
export { bu as default }
