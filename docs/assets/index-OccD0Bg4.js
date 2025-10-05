const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/HomePage-9w2zZVJ_.js',
      'assets/query-vendor-BsnDS19Y.js',
      'assets/react-vendor-Cttizgra.js',
      'assets/auth-vendor-CMFeYHy6.js',
      'assets/calendar-features-DOX2NwpL.js',
      'assets/calendar-vendor-CzJ7rMdU.js',
      'assets/ui-vendor-BFMCvSnM.js',
      'assets/inventory-features-tEOlqD7s.js',
      'assets/LoginPage-BQ7V4N0Z.js',
      'assets/router-vendor-kmGKi7vG.js',
      'assets/RegisterPage-iJIebdt6.js',
      'assets/management-features-QyU8GELz.js',
      'assets/conservation-features-D5ZiW3Ii.js',
      'assets/settings-features-BV-70C1r.js',
      'assets/OnboardingWizard-CmGF8-1m.js',
      'assets/NotFoundPage-1eDZszGx.js',
      'assets/sentry-h8UfmTbw.js',
    ])
) => i.map(i => d[i])
import {
  i as $,
  j as U,
  k as H,
  u as D,
  _ as u,
} from './calendar-features-DOX2NwpL.js'
import { j as e, Q, c as W } from './query-vendor-BsnDS19Y.js'
import { b as G, r as p, a as K } from './react-vendor-Cttizgra.js'
import {
  L as E,
  u as Y,
  a as J,
  R as S,
  b as m,
  B as X,
} from './router-vendor-kmGKi7vG.js'
import { S as Z, a as ee, R as te, C as ae } from './auth-vendor-CMFeYHy6.js'
import {
  B as h,
  V as w,
  b as ne,
  R as C,
  Y as A,
  c as b,
  _,
  d as se,
  N as ie,
  p as re,
  H as I,
  $ as oe,
  a0 as le,
  a1 as ce,
  m as de,
  Q as me,
  a2 as P,
  a3 as pe,
  a4 as ue,
  a5 as ge,
} from './ui-vendor-BFMCvSnM.js'
import { a as xe, b as he } from './conservation-features-D5ZiW3Ii.js'
import { A as j } from './inventory-features-tEOlqD7s.js'
import './calendar-vendor-CzJ7rMdU.js'
;(function () {
  const a = document.createElement('link').relList
  if (a && a.supports && a.supports('modulepreload')) return
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) i(n)
  new MutationObserver(n => {
    for (const s of n)
      if (s.type === 'childList')
        for (const c of s.addedNodes)
          c.tagName === 'LINK' && c.rel === 'modulepreload' && i(c)
  }).observe(document, { childList: !0, subtree: !0 })
  function o(n) {
    const s = {}
    return (
      n.integrity && (s.integrity = n.integrity),
      n.referrerPolicy && (s.referrerPolicy = n.referrerPolicy),
      n.crossOrigin === 'use-credentials'
        ? (s.credentials = 'include')
        : n.crossOrigin === 'anonymous'
          ? (s.credentials = 'omit')
          : (s.credentials = 'same-origin'),
      s
    )
  }
  function i(n) {
    if (n.ep) return
    n.ep = !0
    const s = o(n)
    fetch(n.href, s)
  }
})()
var N = {},
  T = G
;((N.createRoot = T.createRoot), (N.hydrateRoot = T.hydrateRoot))
const z = (t, a) => {
    try {
      if (a === void 0)
        return (
          console.warn(
            `[SafeStorage] Tentativo di salvare undefined per chiave: ${t}`
          ),
          !1
        )
      const o = JSON.stringify(a)
      return o === 'undefined' || o === 'null'
        ? (console.warn(
            `[SafeStorage] Dati non serializzabili per chiave: ${t}`
          ),
          !1)
        : (localStorage.setItem(t, o), !0)
    } catch (o) {
      return (console.error(`[SafeStorage] Errore nel salvare ${t}:`, o), !1)
    }
  },
  fe = t => {
    try {
      return (localStorage.removeItem(t), !0)
    } catch (a) {
      return (console.error(`[SafeStorage] Errore nel rimuovere ${t}:`, a), !1)
    }
  },
  ve = () => {
    try {
      return (
        [
          'onboarding-data',
          'haccp-onboarding',
          'haccp-onboarding-new',
          'haccp-departments',
          'haccp-staff',
          'haccp-refrigerators',
          'haccp-cleaning',
          'haccp-products',
          'haccp-temperatures',
          'haccp-product-labels',
          'haccp-users',
          'haccp-current-user',
          'haccp-last-check',
          'haccp-last-sync',
          'haccp-company-id',
        ].forEach(a => {
          fe(a)
        }),
        console.log('[SafeStorage] Dati HACCP puliti con successo'),
        !0
      )
    } catch (t) {
      return (
        console.error('[SafeStorage] Errore nella pulizia dati HACCP:', t),
        !1
      )
    }
  },
  O = () => {
    try {
      return (
        localStorage.clear(),
        sessionStorage.clear(),
        console.log('[SafeStorage] Storage pulito completamente'),
        !0
      )
    } catch (t) {
      return (
        console.error('[SafeStorage] Errore nella pulizia completa:', t),
        !1
      )
    }
  },
  be = t => {
    const a = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      o = [
        {
          manutenzione: 'rilevamento_temperatura',
          frequenza: 'giornaliera',
          assegnatoARuolo: 'responsabile',
          assegnatoACategoria: 'Banconisti',
          assegnatoADipendenteSpecifico: void 0,
          giorniCustom: void 0,
          note: 'Controllo temperatura giornaliero obbligatorio',
        },
        {
          manutenzione: 'sanificazione',
          frequenza: 'settimanale',
          assegnatoARuolo: 'dipendente',
          assegnatoACategoria: 'Cuochi',
          assegnatoADipendenteSpecifico: void 0,
          giorniCustom: void 0,
          note: 'Sanificazione settimanale completa',
        },
        {
          manutenzione: 'sbrinamento',
          frequenza: 'annuale',
          assegnatoARuolo: 'admin',
          assegnatoACategoria: 'Amministratore',
          assegnatoADipendenteSpecifico: void 0,
          giorniCustom: void 0,
          note: 'Sbrinamento annuale profondo',
        },
        {
          manutenzione: 'controllo_scadenze',
          frequenza: 'custom',
          assegnatoARuolo: 'dipendente',
          assegnatoACategoria: 'all',
          assegnatoADipendenteSpecifico: void 0,
          giorniCustom: ['lunedi', 'giovedi'],
          note: 'Controllo scadenze Lunedì e Giovedì',
        },
      ],
      i = []
    return (
      t.forEach(n => {
        o.forEach(s => {
          ;(n.pointType === 'ambiente' && s.manutenzione === 'sbrinamento') ||
            i.push({
              id: a(),
              conservationPointId: n.id,
              manutenzione: s.manutenzione,
              frequenza: s.frequenza,
              assegnatoARuolo: s.assegnatoARuolo,
              assegnatoACategoria: s.assegnatoACategoria,
              assegnatoADipendenteSpecifico: s.assegnatoADipendenteSpecifico,
              giorniCustom: s.giorniCustom,
              note: s.note,
            })
        })
      }),
      i
    )
  },
  je = () => {
    const t = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      a = [
        {
          id: t(),
          name: 'Cucina',
          description: 'Area di preparazione e cottura cibi',
          is_active: !0,
        },
        {
          id: t(),
          name: 'Bancone',
          description: 'Area di servizio clienti',
          is_active: !0,
        },
        {
          id: t(),
          name: 'Sala',
          description: 'Area di servizio ai tavoli',
          is_active: !0,
        },
        {
          id: t(),
          name: 'Magazzino',
          description: 'Area di stoccaggio merci',
          is_active: !0,
        },
        {
          id: t(),
          name: 'Magazzino B',
          description: 'Area di stoccaggio secondaria',
          is_active: !0,
        },
        {
          id: t(),
          name: 'Sala B',
          description: 'Area di servizio secondaria',
          is_active: !0,
        },
        {
          id: t(),
          name: 'Deoor / Esterno',
          description: 'Area deoor e servizi esterni',
          is_active: !0,
        },
        {
          id: t(),
          name: 'Plonge / Lavaggio Piatti',
          description: 'Area lavaggio stoviglie e piatti',
          is_active: !0,
        },
      ],
      o = l =>
        a
          .filter(r =>
            l.some(d => r.name.toLowerCase().includes(d.toLowerCase()))
          )
          .map(r => r.id),
      i = () => a.filter(l => l.is_active).map(l => l.id),
      n = l =>
        a.find(d => d.name.toLowerCase().includes(l.toLowerCase()))?.id || '',
      s = [
        {
          id: t(),
          name: 'Matteo',
          surname: 'Cavallaro',
          fullName: 'Matteo Cavallaro',
          role: 'responsabile',
          categories: ['Banconisti'],
          email: 'Neo@gmail.com',
          phone: '3334578536',
          department_assignments: i(),
          haccpExpiry: '2025-10-01',
          notes: 'Responsabile con accesso a tutti i reparti',
        },
        {
          id: t(),
          name: 'Fabrizio',
          surname: 'Dettori',
          fullName: 'Fabrizio Dettori',
          role: 'admin',
          categories: ['Amministratore'],
          email: 'Fabri@gmail.com',
          phone: '3334578535',
          department_assignments: o(['Sala', 'Sala B', 'Deoor', 'Plonge']),
          haccpExpiry: '2026-10-01',
          notes: 'Amministratore con accesso a Sala, Sala B, Deoor e Plonge',
        },
        {
          id: t(),
          name: 'Paolo',
          surname: 'Dettori',
          fullName: 'Paolo Dettori',
          role: 'admin',
          categories: ['Cuochi', 'Amministratore'],
          email: 'Pablo@gmail.com',
          phone: '3334578534',
          department_assignments: i(),
          haccpExpiry: '2025-10-01',
          notes: 'Amministratore con competenze di cucina',
        },
        {
          id: t(),
          name: 'Eddy',
          surname: 'TheQueen',
          fullName: 'Eddy TheQueen',
          role: 'dipendente',
          categories: ['Banconisti'],
          email: 'Eddy@gmail.com',
          phone: '3334578533',
          department_assignments: o(['Bancone']),
          haccpExpiry: '2026-10-01',
          notes: 'Dipendente specializzato al bancone',
        },
        {
          id: t(),
          name: 'Elena',
          surname: 'Compagna',
          fullName: 'Elena Compagna',
          role: 'dipendente',
          categories: ['Banconisti', 'Camerieri'],
          email: 'Ele@gmail.com',
          phone: '3334578532',
          department_assignments: o([
            'Bancone',
            'Sala',
            'Sala B',
            'Deoor',
            'Plonge',
          ]),
          haccpExpiry: '2026-10-01',
          notes: 'Dipendente multiruolo con accesso a più reparti',
        },
      ],
      c = [
        {
          id: t(),
          name: 'Frigo A',
          departmentId: n('Cucina'),
          targetTemperature: 4,
          pointType: 'fridge',
          isBlastChiller: !1,
          productCategories: ['fresh_meat', 'fresh_dairy'],
          source: 'prefill',
        },
        {
          id: t(),
          name: 'Freezer A',
          departmentId: n('Cucina'),
          targetTemperature: -18,
          pointType: 'freezer',
          isBlastChiller: !1,
          productCategories: ['frozen', 'deep_frozen'],
          source: 'prefill',
        },
        {
          id: t(),
          name: 'Freezer B',
          departmentId: n('Cucina'),
          targetTemperature: -20,
          pointType: 'freezer',
          isBlastChiller: !1,
          productCategories: ['frozen', 'deep_frozen'],
          source: 'prefill',
        },
        {
          id: t(),
          name: 'Abbattitore',
          departmentId: n('Cucina'),
          targetTemperature: -25,
          pointType: 'blast',
          isBlastChiller: !0,
          productCategories: ['blast_chilling'],
          source: 'prefill',
        },
        {
          id: t(),
          name: 'Frigo 1',
          departmentId: n('Bancone'),
          targetTemperature: 2,
          pointType: 'fridge',
          isBlastChiller: !1,
          productCategories: ['beverages', 'fresh_produce'],
          source: 'prefill',
        },
        {
          id: t(),
          name: 'Frigo 2',
          departmentId: n('Bancone'),
          targetTemperature: 3,
          pointType: 'fridge',
          isBlastChiller: !1,
          productCategories: ['beverages', 'fresh_produce'],
          source: 'prefill',
        },
        {
          id: t(),
          name: 'Frigo 3',
          departmentId: n('Bancone'),
          targetTemperature: 5,
          pointType: 'fridge',
          isBlastChiller: !1,
          productCategories: ['beverages', 'fresh_produce'],
          source: 'prefill',
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
      departments: a,
      staff: s,
      conservation: { points: c },
      tasks: {
        conservationMaintenancePlans: be(c),
        genericTasks: [
          {
            id: t(),
            name: 'Pulizia approfondita cucina',
            frequenza: 'settimanale',
            assegnatoARuolo: 'dipendente',
            assegnatoACategoria: 'Cuochi',
            assegnatoADipendenteSpecifico: void 0,
            giorniCustom: void 0,
            note: 'Pulizia e sanificazione completa area cucina ogni settimana',
          },
          {
            id: t(),
            name: 'Controllo giacenze magazzino',
            frequenza: 'settimanale',
            assegnatoARuolo: 'responsabile',
            assegnatoACategoria: void 0,
            assegnatoADipendenteSpecifico: void 0,
            giorniCustom: void 0,
            note: 'Verifica inventario e ordini settimanali',
          },
          {
            id: t(),
            name: 'Pulizia bancone servizio',
            frequenza: 'giornaliera',
            assegnatoARuolo: 'dipendente',
            assegnatoACategoria: 'Banconisti',
            assegnatoADipendenteSpecifico: void 0,
            giorniCustom: void 0,
            note: 'Sanificazione quotidiana bancone e attrezzature',
          },
          {
            id: t(),
            name: 'Controllo e pulizia sala',
            frequenza: 'giornaliera',
            assegnatoARuolo: 'dipendente',
            assegnatoACategoria: 'Camerieri',
            assegnatoADipendenteSpecifico: void 0,
            giorniCustom: void 0,
            note: 'Pulizia tavoli, pavimenti e controllo generale sala',
          },
        ],
        generalTasks: [],
        maintenanceTasks: [],
      },
      inventory: {
        categories: [
          {
            id: t(),
            name: 'Carni Fresche',
            color: '#ef4444',
            conservationRules: {
              minTemp: 0,
              maxTemp: 4,
              maxStorageDays: 3,
              requiresBlastChilling: !0,
            },
          },
          {
            id: t(),
            name: 'Pesce Fresco',
            color: '#3b82f6',
            conservationRules: {
              minTemp: 0,
              maxTemp: 2,
              maxStorageDays: 2,
              requiresBlastChilling: !0,
            },
          },
          {
            id: t(),
            name: 'Latticini',
            color: '#f59e0b',
            conservationRules: { minTemp: 2, maxTemp: 6, maxStorageDays: 7 },
          },
          {
            id: t(),
            name: 'Verdure Fresche',
            color: '#10b981',
            conservationRules: { minTemp: 4, maxTemp: 8, maxStorageDays: 5 },
          },
        ],
        products: [
          {
            id: t(),
            name: 'Pomodori San Marzano',
            quantity: 5,
            unit: 'kg',
            supplierName: 'Ortofrutta Napoletana',
            purchaseDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1e3)
              .toISOString()
              .split('T')[0],
            status: 'active',
            allergens: [],
          },
          {
            id: t(),
            name: 'Mozzarella di Bufala',
            quantity: 10,
            unit: 'pz',
            allergens: [j.LATTE],
            supplierName: 'Caseificio Campano',
            purchaseDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3)
              .toISOString()
              .split('T')[0],
            status: 'active',
          },
          {
            id: t(),
            name: 'Petto di Pollo',
            quantity: 2.5,
            unit: 'kg',
            supplierName: 'Carni Locali SRL',
            purchaseDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3)
              .toISOString()
              .split('T')[0],
            status: 'active',
            allergens: [],
          },
          {
            id: t(),
            name: 'Salmone Fresco',
            quantity: 1.8,
            unit: 'kg',
            allergens: [j.PESCE],
            supplierName: 'Pescheria del Porto',
            purchaseDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3)
              .toISOString()
              .split('T')[0],
            status: 'active',
          },
          {
            id: t(),
            name: 'Olio Extravergine',
            quantity: 5,
            unit: 'l',
            supplierName: 'Frantoio Toscano',
            purchaseDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3)
              .toISOString()
              .split('T')[0],
            status: 'active',
            allergens: [],
          },
          {
            id: t(),
            name: 'Pasta di Grano Duro',
            quantity: 20,
            unit: 'conf',
            allergens: [j.GLUTINE],
            supplierName: 'Pastificio Artigianale',
            purchaseDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1e3)
              .toISOString()
              .split('T')[0],
            status: 'active',
          },
        ],
      },
    }
  },
  ye = () => {
    console.log('🔄 Precompilazione onboarding...')
    try {
      O()
      const t = je()
      if (t.departments?.length) {
        const a = t.departments.find(i => i.name === 'Cucina')?.id,
          o = t.departments.find(i => i.name === 'Bancone')?.id
        if (
          (t.conservation?.points &&
            (t.conservation.points = t.conservation.points.map(i => ({
              ...i,
              departmentId: i.name.includes('Cucina')
                ? a || ''
                : i.name.includes('Bancone')
                  ? o || ''
                  : t.departments?.[0]?.id || '',
            }))),
          t.staff &&
            (t.staff = t.staff.map(i => ({
              ...i,
              department_assignments: i.categories.includes('Responsabile Sala')
                ? [o || '']
                : i.categories.includes('Cuochi')
                  ? [a || '']
                  : [t.departments?.[0]?.id || ''],
            }))),
          t.inventory?.categories?.length)
        ) {
          const i = t.inventory.categories.find(
              r => r.name === 'Carni Fresche'
            )?.id,
            n = t.inventory.categories.find(r => r.name === 'Pesce Fresco')?.id,
            s = t.inventory.categories.find(r => r.name === 'Latticini')?.id,
            c = t.inventory.categories.find(
              r => r.name === 'Verdure Fresche'
            )?.id,
            l = t.conservation?.points?.find(r => r.name.includes('Frigo'))?.id
          t.inventory.products &&
            (t.inventory.products = t.inventory.products.map(r => ({
              ...r,
              categoryId: r.name.includes('Pollo')
                ? i
                : r.name.includes('Salmone')
                  ? n
                  : r.name.includes('Mozzarella')
                    ? s
                    : r.name.includes('Pomodori')
                      ? c
                      : void 0,
              departmentId: a,
              conservationPointId: l,
            })))
        }
      }
      ;(z('onboarding-data', t),
        console.log('✅ Onboarding precompilato con successo:', t),
        h.success('Onboarding precompilato con dati di Al Ritrovo SRL!', {
          position: 'top-right',
          autoClose: 3e3,
        }))
    } catch (t) {
      ;(console.error('❌ Errore nella precompilazione:', t),
        h.error('Errore durante la precompilazione', {
          position: 'top-right',
          autoClose: 3e3,
        }))
    }
  },
  Ke = () => {
    if (
      !window.confirm(`⚠️ ATTENZIONE!

Questa operazione cancellerà TUTTI i dati dell'onboarding e dell'app.

Sei sicuro di voler continuare?`)
    ) {
      console.log("🔄 Reset onboarding annullato dall'utente")
      return
    }
    console.log('🔄 Reset completo onboarding...')
    try {
      ;(ve(),
        console.log('✅ Reset onboarding completato con successo'),
        h.success('Onboarding resettato completamente!', {
          position: 'top-right',
          autoClose: 3e3,
        }),
        setTimeout(() => {
          window.location.reload()
        }, 1e3))
    } catch (a) {
      ;(console.error('❌ Errore nel reset onboarding:', a),
        h.error('Errore durante il reset', {
          position: 'top-right',
          autoClose: 3e3,
        }))
    }
  },
  Ne = () => {
    if (
      !window.confirm(`🚨 RESET COMPLETO APP

Questa operazione cancellerà TUTTO il localStorage e sessionStorage.
Utilizzare solo in sviluppo!

Sei ASSOLUTAMENTE sicuro?`)
    ) {
      console.log("🔄 Reset app annullato dall'utente")
      return
    }
    console.log('🔄 Reset completo app...')
    try {
      ;(O(),
        console.log('✅ Reset app completato con successo'),
        h.success('App resettata completamente!', {
          position: 'top-right',
          autoClose: 2e3,
        }),
        setTimeout(() => {
          window.location.reload()
        }, 500))
    } catch (a) {
      ;(console.error('❌ Errore nel reset app:', a),
        h.error('Errore durante il reset completo', {
          position: 'top-right',
          autoClose: 3e3,
        }))
    }
  },
  Ye = () => {
    console.log('🔄 Completamento automatico onboarding...')
    try {
      ;(localStorage.getItem('onboarding-data') || ye(),
        z('onboarding-completed', !0),
        z('onboarding-completed-at', new Date().toISOString()),
        console.log('✅ Onboarding completato automaticamente'),
        h.success('Onboarding completato automaticamente!', {
          position: 'top-right',
          autoClose: 3e3,
        }),
        setTimeout(() => {
          window.location.href = '/'
        }, 1e3))
    } catch (t) {
      ;(console.error('❌ Errore nel completamento automatico:', t),
        h.error('Errore durante il completamento automatico', {
          position: 'top-right',
          autoClose: 3e3,
        }))
    }
  }
function ze({
  position: t = 'bottom',
  showDetails: a = !1,
  className: o = '',
}) {
  const {
      isOnline: i,
      isSyncing: n,
      pendingOperations: s,
      lastSyncTime: c,
      syncErrors: l,
      syncPendingOperations: r,
      hasPendingOperations: d,
      hasErrors: g,
    } = xe(),
    { isSlowConnection: v, connectionQuality: L, effectiveType: B } = he()
  if (!a && i && !d && !g) return null
  const F = () =>
      !i || g
        ? 'bg-red-500'
        : d
          ? 'bg-yellow-500'
          : n
            ? 'bg-blue-500'
            : 'bg-green-500',
    k = () =>
      i
        ? n
          ? 'Sincronizzazione...'
          : g
            ? `${l.length} errori di sync`
            : d
              ? `${s.length} operazioni in coda`
              : 'Sincronizzato'
        : 'Offline',
    q = () =>
      i
        ? n
          ? e.jsx(C, { className: 'w-4 h-4 animate-spin' })
          : g
            ? e.jsx(b, { className: 'w-4 h-4' })
            : d
              ? e.jsx(A, { className: 'w-4 h-4' })
              : e.jsx(se, { className: 'w-4 h-4' })
        : e.jsx(_, { className: 'w-4 h-4' }),
    M = t === 'top' ? 'top-0 border-b' : 'bottom-0 border-t'
  return e.jsx('div', {
    className: `
      fixed left-0 right-0 ${M} bg-white border-gray-200 z-40
      ${o}
    `,
    children: e.jsxs('div', {
      className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between py-2',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsxs('div', {
                  className: `
              flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium
              ${F()}
            `,
                  children: [q(), e.jsx('span', { children: k() })],
                }),
                i &&
                  e.jsxs('div', {
                    className: 'flex items-center gap-1 text-xs text-gray-500',
                    children: [
                      e.jsx(w, { className: 'w-3 h-3' }),
                      e.jsx('span', {
                        className: 'capitalize',
                        children: B || 'unknown',
                      }),
                      v &&
                        e.jsx('span', {
                          className: 'text-yellow-600 font-medium',
                          children: '(lenta)',
                        }),
                    ],
                  }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                c &&
                  e.jsxs('div', {
                    className: 'flex items-center gap-1 text-xs text-gray-500',
                    children: [
                      e.jsx(ne, { className: 'w-3 h-3' }),
                      e.jsx('span', {
                        children: c.toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      }),
                    ],
                  }),
                i &&
                  d &&
                  e.jsxs('button', {
                    onClick: () => r(),
                    disabled: n,
                    className:
                      'flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50',
                    children: [
                      e.jsx(C, {
                        className: `w-3 h-3 ${n ? 'animate-spin' : ''}`,
                      }),
                      'Sync',
                    ],
                  }),
              ],
            }),
          ],
        }),
        a &&
          e.jsxs('div', {
            className: 'pb-3 border-t border-gray-100 pt-2',
            children: [
              e.jsxs('div', {
                className: 'grid grid-cols-1 md:grid-cols-3 gap-4 text-sm',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(A, { className: 'w-4 h-4 text-yellow-500' }),
                      e.jsx('span', {
                        className: 'text-gray-600',
                        children: 'In coda:',
                      }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: s.length,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(b, { className: 'w-4 h-4 text-red-500' }),
                      e.jsx('span', {
                        className: 'text-gray-600',
                        children: 'Errori:',
                      }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: l.length,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      i
                        ? e.jsx(w, { className: 'w-4 h-4 text-green-500' })
                        : e.jsx(_, { className: 'w-4 h-4 text-red-500' }),
                      e.jsx('span', {
                        className: 'text-gray-600',
                        children: 'Connessione:',
                      }),
                      e.jsx('span', {
                        className: 'font-medium capitalize',
                        children: L,
                      }),
                    ],
                  }),
                ],
              }),
              s.length > 0 &&
                e.jsxs('div', {
                  className: 'mt-3',
                  children: [
                    e.jsx('h4', {
                      className: 'text-xs font-medium text-gray-700 mb-2',
                      children: 'Operazioni in attesa:',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-1',
                      children: [
                        s
                          .slice(0, 3)
                          .map(x =>
                            e.jsxs(
                              'div',
                              {
                                className:
                                  'flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1',
                                children: [
                                  e.jsxs('span', {
                                    className: 'text-gray-600',
                                    children: [x.type, ' ', x.entity],
                                  }),
                                  e.jsx('span', {
                                    className: 'text-gray-500',
                                    children: new Date(
                                      x.timestamp
                                    ).toLocaleTimeString('it-IT', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }),
                                  }),
                                ],
                              },
                              x.id
                            )
                          ),
                        s.length > 3 &&
                          e.jsxs('div', {
                            className: 'text-xs text-gray-500 text-center',
                            children: [
                              '... e altre ',
                              s.length - 3,
                              ' operazioni',
                            ],
                          }),
                      ],
                    }),
                  ],
                }),
              l.length > 0 &&
                e.jsxs('div', {
                  className: 'mt-3',
                  children: [
                    e.jsx('h4', {
                      className: 'text-xs font-medium text-red-700 mb-2',
                      children: 'Errori di sincronizzazione:',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-1',
                      children: [
                        l
                          .slice(0, 2)
                          .map((x, V) =>
                            e.jsxs(
                              'div',
                              {
                                className:
                                  'text-xs bg-red-50 text-red-700 rounded px-2 py-1',
                                children: [
                                  e.jsxs('div', {
                                    className: 'font-medium',
                                    children: [
                                      x.operation.type,
                                      ' ',
                                      x.operation.entity,
                                    ],
                                  }),
                                  e.jsx('div', {
                                    className: 'text-red-600 truncate',
                                    children: x.error,
                                  }),
                                ],
                              },
                              V
                            )
                          ),
                        l.length > 2 &&
                          e.jsxs('div', {
                            className: 'text-xs text-red-500 text-center',
                            children: ['... e altri ', l.length - 2, ' errori'],
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
}
const Se = ({ onResetApp: t, onOpenOnboarding: a, showResetApp: o = !1 }) => {
    const { events: i } = $(),
      { filteredEvents: n } = U(i),
      { count: s, hasAlerts: c, hasCritical: l } = H(n)
    return e.jsxs('div', {
      className: 'flex gap-2',
      children: [
        e.jsxs(E, {
          to: '/attivita',
          className:
            'relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:text-gray-700 hover:bg-gray-50 transition-colors',
          title: 'Vai al calendario attività',
          children: [
            e.jsx(ie, { className: 'h-4 w-4' }),
            e.jsx('span', {
              className: 'hidden sm:inline',
              children: 'Attività',
            }),
            c &&
              e.jsx('span', {
                className: `absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ${l ? 'bg-red-600' : 'bg-orange-500'}`,
                children: s > 9 ? '9+' : s,
              }),
          ],
        }),
        o &&
          e.jsxs('button', {
            onClick: t,
            className:
              'flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:text-red-700 hover:bg-red-50 transition-colors',
            title: "Reset completo dell'app (solo sviluppo)",
            children: [
              e.jsx(re, { className: 'h-4 w-4' }),
              e.jsx('span', {
                className: 'hidden sm:inline',
                children: 'Reset App',
              }),
              e.jsx('span', { className: 'sm:hidden', children: 'Reset' }),
            ],
          }),
        e.jsxs('button', {
          onClick: a,
          className:
            'flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:text-blue-700 hover:bg-blue-50 transition-colors',
          title: "Riapri l'onboarding",
          children: [
            e.jsx(I, { className: 'h-4 w-4' }),
            e.jsx('span', {
              className: 'hidden sm:inline',
              children: 'Riapri Onboarding',
            }),
            e.jsx('span', { className: 'sm:hidden', children: 'Onboarding' }),
          ],
        }),
      ],
    })
  },
  we = ({ children: t }) => {
    const a = Y(),
      o = J(),
      { hasRole: i, isLoading: n } = D(),
      s = () => {
        o('/onboarding')
      },
      l = [
        { id: 'home', label: 'Home', icon: oe, path: '/', requiresAuth: !0 },
        {
          id: 'conservation',
          label: 'Conservazione',
          icon: le,
          path: '/conservazione',
          requiresAuth: !0,
        },
        {
          id: 'tasks',
          label: 'Attività',
          icon: ce,
          path: '/attivita',
          requiresAuth: !0,
        },
        {
          id: 'inventory',
          label: 'Inventario',
          icon: de,
          path: '/inventario',
          requiresAuth: !0,
        },
        {
          id: 'settings',
          label: 'Impostazioni',
          icon: me,
          path: '/impostazioni',
          requiresAuth: !0,
          requiredRole: ['admin'],
        },
        {
          id: 'management',
          label: 'Gestione',
          icon: I,
          path: '/gestione',
          requiresAuth: !0,
          requiredRole: ['admin', 'responsabile'],
        },
      ].filter(r =>
        !r.requiresAuth || n ? !0 : r.requiredRole ? i(r.requiredRole) : !0
      )
    return e.jsxs('div', {
      className: 'min-h-screen bg-gray-50',
      children: [
        e.jsx('header', {
          className:
            'bg-white border-b border-gray-200 px-4 py-3 safe-area-top',
          children: e.jsxs('div', {
            className: 'flex items-center justify-between',
            children: [
              e.jsx('div', {
                className: 'flex items-center space-x-3',
                children: e.jsx('h1', {
                  className: 'text-lg font-semibold text-gray-900',
                  children: 'HACCP Manager',
                }),
              }),
              e.jsx(Se, {
                onResetApp: Ne,
                onOpenOnboarding: s,
                showResetApp: !1,
              }),
            ],
          }),
        }),
        e.jsx('main', {
          className: 'pb-20 pt-0',
          role: 'main',
          'aria-label': 'Main content',
          children: t,
        }),
        e.jsx('nav', {
          className:
            'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50',
          role: 'navigation',
          'aria-label': 'Main navigation',
          children: e.jsx('div', {
            className:
              'flex h-16 items-stretch gap-1 overflow-x-auto px-2 pb-1',
            children: l.map(r => {
              const d = r.icon,
                g = a.pathname === r.path
              return e.jsxs(
                E,
                {
                  to: r.path,
                  className: `flex min-w-[80px] flex-1 flex-col items-center justify-center space-y-1 rounded-md touch-manipulation transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${g ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`,
                  'aria-label': `Navigate to ${r.label}`,
                  'aria-current': g ? 'page' : void 0,
                  children: [
                    e.jsx(d, { size: 20, 'aria-hidden': 'true' }),
                    e.jsx('span', {
                      className: 'text-[10px] font-medium sm:text-xs',
                      children: r.label,
                    }),
                  ],
                },
                r.id
              )
            }),
          }),
        }),
        e.jsx(ze, { position: 'bottom' }),
      ],
    })
  },
  Ce = () =>
    e.jsxs('div', {
      className: 'flex flex-col items-center justify-center min-h-[60vh] p-8',
      children: [
        e.jsx(pe, { className: 'h-8 w-8 animate-spin text-blue-600 mb-4' }),
        e.jsx('h2', {
          className: 'text-lg font-semibold text-gray-900 mb-2',
          children: 'Controllo autorizzazioni...',
        }),
        e.jsx('p', {
          className: 'text-gray-600 text-center',
          children: 'Stiamo verificando i tuoi permessi di accesso.',
        }),
      ],
    }),
  y = ({ userRole: t, requiredRole: a, requiredPermission: o, isGuest: i }) => {
    const n = () =>
        a
          ? (Array.isArray(a) ? a : [a])
              .map(l => {
                switch (l) {
                  case 'admin':
                    return 'Amministratore'
                  case 'responsabile':
                    return 'Responsabile'
                  case 'dipendente':
                    return 'Dipendente'
                  case 'collaboratore':
                    return 'Collaboratore'
                  default:
                    return l
                }
              })
              .join(' o ')
          : '',
      s = () => {
        switch (o) {
          case 'canManageStaff':
            return 'gestione del personale'
          case 'canManageDepartments':
            return 'gestione dei reparti'
          case 'canViewAllTasks':
            return 'visualizzazione di tutte le attività'
          case 'canManageConservation':
            return 'gestione della conservazione'
          case 'canExportData':
            return 'esportazione dati'
          case 'canManageSettings':
            return 'gestione delle impostazioni'
          default:
            return 'questa funzionalità'
        }
      }
    return i
      ? e.jsxs('div', {
          className:
            'flex flex-col items-center justify-center min-h-[60vh] p-8 bg-red-50 border border-red-200 rounded-lg mx-4',
          children: [
            e.jsx(ue, { className: 'h-12 w-12 text-red-600 mb-4' }),
            e.jsx('h2', {
              className: 'text-xl font-bold text-red-900 mb-3 text-center',
              children: 'Accesso Non Autorizzato',
            }),
            e.jsxs('div', {
              className: 'text-red-800 text-center space-y-2 mb-6',
              children: [
                e.jsx('p', {
                  className: 'font-medium',
                  children:
                    'La tua email non è registrata nel sistema come membro dello staff.',
                }),
                e.jsx('p', {
                  className: 'text-sm',
                  children:
                    "Per accedere all'applicazione, la tua email deve essere associata a un dipendente nell'anagrafica aziendale.",
                }),
              ],
            }),
            e.jsxs('div', {
              className:
                'bg-white border border-red-300 rounded-lg p-4 mb-6 w-full max-w-md',
              children: [
                e.jsxs('h3', {
                  className:
                    'font-semibold text-red-900 mb-2 flex items-center',
                  children: [
                    e.jsx(b, { className: 'h-4 w-4 mr-2' }),
                    'Cosa fare:',
                  ],
                }),
                e.jsxs('ul', {
                  className: 'text-sm text-red-800 space-y-1',
                  children: [
                    e.jsx('li', {
                      children: '1. Contatta il tuo amministratore',
                    }),
                    e.jsx('li', {
                      children: '2. Verifica che la tua email sia corretta',
                    }),
                    e.jsx('li', {
                      children:
                        "3. Richiedi l'inserimento nell'anagrafica staff",
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'text-xs text-red-600 text-center',
              children: [
                e.jsxs('p', {
                  children: [
                    'Email corrente:',
                    ' ',
                    e.jsx('code', {
                      className: 'bg-red-100 px-2 py-1 rounded',
                    }),
                  ],
                }),
                e.jsxs('p', {
                  className: 'mt-1',
                  children: [
                    'Ruolo assegnato:',
                    ' ',
                    e.jsx('span', {
                      className: 'font-medium',
                      children: 'Guest (Accesso negato)',
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      : e.jsxs('div', {
          className:
            'flex flex-col items-center justify-center min-h-[60vh] p-8 bg-yellow-50 border border-yellow-200 rounded-lg mx-4',
          children: [
            e.jsx(P, { className: 'h-12 w-12 text-yellow-600 mb-4' }),
            e.jsx('h2', {
              className: 'text-xl font-bold text-yellow-900 mb-3 text-center',
              children: 'Permessi Insufficienti',
            }),
            e.jsxs('div', {
              className: 'text-yellow-800 text-center space-y-2 mb-6',
              children: [
                e.jsx('p', {
                  children:
                    'Non hai i permessi necessari per accedere a questa sezione.',
                }),
                a &&
                  e.jsxs('p', {
                    className: 'text-sm',
                    children: [
                      'Ruolo richiesto:',
                      ' ',
                      e.jsx('span', {
                        className: 'font-medium',
                        children: n(),
                      }),
                    ],
                  }),
                o &&
                  e.jsxs('p', {
                    className: 'text-sm',
                    children: [
                      'Permesso richiesto:',
                      ' ',
                      e.jsx('span', {
                        className: 'font-medium',
                        children: s(),
                      }),
                    ],
                  }),
              ],
            }),
            e.jsxs('div', {
              className:
                'bg-white border border-yellow-300 rounded-lg p-4 w-full max-w-md',
              children: [
                e.jsx('h3', {
                  className: 'font-semibold text-yellow-900 mb-2',
                  children: 'Le tue informazioni:',
                }),
                e.jsxs('div', {
                  className: 'text-sm text-yellow-800 space-y-1',
                  children: [
                    e.jsxs('p', {
                      children: [
                        'Ruolo attuale:',
                        ' ',
                        e.jsx('span', {
                          className: 'font-medium capitalize',
                          children: t,
                        }),
                      ],
                    }),
                    e.jsx('p', {
                      className: 'text-xs text-yellow-600 mt-2',
                      children:
                        'Se pensi che ci sia un errore, contatta il tuo amministratore per verificare i tuoi permessi.',
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
  },
  f = ({
    children: t,
    requiredRole: a,
    requiredPermission: o,
    fallback: i,
    showLoadingSpinner: n = !0,
  }) => {
    const {
      isLoading: s,
      isAuthenticated: c,
      isAuthorized: l,
      userRole: r,
      hasRole: d,
      hasPermission: g,
      authError: v,
    } = D()
    return s && n
      ? i || e.jsx(Ce, {})
      : v
        ? e.jsxs('div', {
            className:
              'flex flex-col items-center justify-center min-h-[60vh] p-8 bg-red-50 border border-red-200 rounded-lg mx-4',
            children: [
              e.jsx(b, { className: 'h-12 w-12 text-red-600 mb-4' }),
              e.jsx('h2', {
                className: 'text-xl font-bold text-red-900 mb-3',
                children: 'Errore di Autenticazione',
              }),
              e.jsx('p', {
                className: 'text-red-800 text-center mb-4',
                children: v,
              }),
              e.jsx('button', {
                onClick: () => window.location.reload(),
                className:
                  'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors',
                children: 'Riprova',
              }),
            ],
          })
        : c
          ? l
            ? a && !d(a)
              ? e.jsx(y, {
                  userRole: r,
                  requiredRole: a,
                  requiredPermission: o,
                  isGuest: !1,
                })
              : o && !g(o)
                ? e.jsx(y, {
                    userRole: r,
                    requiredRole: a,
                    requiredPermission: o,
                    isGuest: !1,
                  })
                : e.jsx(e.Fragment, { children: t })
            : e.jsx(y, {
                userRole: r,
                requiredRole: a,
                requiredPermission: o,
                isGuest: !0,
              })
          : e.jsxs('div', {
              className:
                'flex flex-col items-center justify-center min-h-[60vh] p-8',
              children: [
                e.jsx(P, { className: 'h-12 w-12 text-gray-400 mb-4' }),
                e.jsx('h2', {
                  className: 'text-xl font-bold text-gray-900 mb-3',
                  children: 'Accesso Richiesto',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 text-center',
                  children:
                    "Devi effettuare l'accesso per visualizzare questa pagina.",
                }),
              ],
            })
  },
  Ae = () =>
    e.jsx('div', {
      className: 'flex items-center justify-center min-h-screen',
      children: e.jsx('div', {
        className:
          'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600',
      }),
    }),
  _e = p.lazy(() =>
    u(
      () => import('./HomePage-9w2zZVJ_.js'),
      __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7])
    )
  ),
  R = p.lazy(() =>
    u(() => import('./LoginPage-BQ7V4N0Z.js'), __vite__mapDeps([8, 1, 2, 3, 9]))
  ),
  Te = p.lazy(() =>
    u(
      () => import('./RegisterPage-iJIebdt6.js'),
      __vite__mapDeps([10, 1, 2, 3, 9])
    )
  ),
  Re = p.lazy(() =>
    u(
      () => import('./management-features-QyU8GELz.js'),
      __vite__mapDeps([11, 1, 2, 4, 5, 6, 3, 7, 12])
    )
  ),
  De = p.lazy(() =>
    u(
      () => import('./calendar-features-DOX2NwpL.js').then(t => t.r),
      __vite__mapDeps([4, 1, 2, 5, 6, 3, 7])
    )
  ),
  Ee = p.lazy(() =>
    u(
      () => import('./conservation-features-D5ZiW3Ii.js').then(t => t.C),
      __vite__mapDeps([12, 2, 1, 4, 5, 6, 3, 7])
    )
  ),
  Ie = p.lazy(() =>
    u(
      () => import('./inventory-features-tEOlqD7s.js').then(t => t.I),
      __vite__mapDeps([7, 1, 2, 4, 5, 6, 3])
    )
  ),
  Pe = p.lazy(() =>
    u(
      () => import('./settings-features-BV-70C1r.js'),
      __vite__mapDeps([13, 1, 2, 4, 5, 6, 3, 7])
    )
  ),
  Oe = p.lazy(() =>
    u(
      () => import('./OnboardingWizard-CmGF8-1m.js'),
      __vite__mapDeps([14, 1, 2, 6, 4, 5, 3, 7, 9, 12])
    )
  ),
  Le = p.lazy(() =>
    u(
      () => import('./NotFoundPage-1eDZszGx.js'),
      __vite__mapDeps([15, 1, 2, 9, 6])
    )
  )
function Be() {
  return (
    p.useEffect(() => {}, []),
    e.jsxs(e.Fragment, {
      children: [
        e.jsx(p.Suspense, {
          fallback: e.jsx(Ae, {}),
          children: e.jsxs(S, {
            children: [
              e.jsx(m, { path: '/login', element: e.jsx(R, {}) }),
              e.jsx(m, { path: '/sign-in', element: e.jsx(R, {}) }),
              e.jsx(m, { path: '/sign-up', element: e.jsx(Te, {}) }),
              e.jsx(m, {
                path: '/*',
                element: e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(Z, {
                      children: e.jsx(we, {
                        children: e.jsxs(S, {
                          children: [
                            e.jsx(m, {
                              path: '/',
                              element: e.jsx(f, { children: e.jsx(_e, {}) }),
                            }),
                            e.jsx(m, {
                              path: '/conservazione',
                              element: e.jsx(f, { children: e.jsx(Ee, {}) }),
                            }),
                            e.jsx(m, {
                              path: '/attivita',
                              element: e.jsx(f, { children: e.jsx(De, {}) }),
                            }),
                            e.jsx(m, {
                              path: '/inventario',
                              element: e.jsx(f, { children: e.jsx(Ie, {}) }),
                            }),
                            e.jsx(m, {
                              path: '/impostazioni',
                              element: e.jsx(f, {
                                requiredRole: 'admin',
                                children: e.jsx(Pe, {}),
                              }),
                            }),
                            e.jsx(m, {
                              path: '/gestione',
                              element: e.jsx(f, {
                                requiredRole: ['admin', 'responsabile'],
                                children: e.jsx(Re, {}),
                              }),
                            }),
                            e.jsx(m, {
                              path: '/onboarding',
                              element: e.jsx(f, { children: e.jsx(Oe, {}) }),
                            }),
                            e.jsx(m, { path: '*', element: e.jsx(Le, {}) }),
                          ],
                        }),
                      }),
                    }),
                    e.jsx(ee, { children: e.jsx(te, {}) }),
                  ],
                }),
              }),
            ],
          }),
        }),
        e.jsx(ge, {
          position: 'top-right',
          autoClose: 5e3,
          hideProgressBar: !1,
          newestOnTop: !1,
          closeOnClick: !0,
          rtl: !1,
          pauseOnFocusLoss: !0,
          draggable: !0,
          pauseOnHover: !0,
          theme: 'light',
        }),
      ],
    })
  )
}
{
  const { initSentry: t } = await u(
    async () => {
      const { initSentry: a } = await import('./sentry-h8UfmTbw.js')
      return { initSentry: a }
    },
    __vite__mapDeps([16, 2])
  )
  t()
}
'serviceWorker' in navigator &&
  window.addEventListener('load', async () => {
    try {
      const t = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      ;(console.log('SW registered: ', t),
        t.addEventListener('updatefound', () => {
          const a = t.installing
          a &&
            a.addEventListener('statechange', () => {
              a.state === 'installed' &&
                navigator.serviceWorker.controller &&
                console.log('New content available; please refresh.')
            })
        }))
    } catch (t) {
      console.log('SW registration failed: ', t)
    }
  })
const Fe = 'pk_test_c21vb3RoLWNhcmRpbmFsLTMxLmNsZXJrLmFjY291bnRzLmRldiQ',
  ke = new Q({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1e3,
        gcTime: 10 * 60 * 1e3,
        retry: 2,
        refetchOnWindowFocus: !1,
        refetchOnMount: !0,
        refetchOnReconnect: !0,
      },
      mutations: { retry: 1 },
    },
  })
N.createRoot(document.getElementById('root')).render(
  e.jsx(K.StrictMode, {
    children: e.jsx(ae, {
      publishableKey: Fe,
      appearance: { baseTheme: void 0, variables: { colorPrimary: '#3b82f6' } },
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      signInFallbackRedirectUrl: '/',
      signUpFallbackRedirectUrl: '/',
      children: e.jsx(W, {
        client: ke,
        children: e.jsx(X, {
          future: { v7_startTransition: !0, v7_relativeSplatPath: !0 },
          children: e.jsx(Be, {}),
        }),
      }),
    }),
  })
)
export { Ye as c, je as g, Ke as r }
