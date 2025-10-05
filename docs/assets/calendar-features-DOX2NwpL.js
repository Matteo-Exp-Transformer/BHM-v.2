import { u as Le, a as Tt, b as V, j as o } from './query-vendor-BsnDS19Y.js'
import { g as bn, c as Z, r as E } from './react-vendor-Cttizgra.js'
import {
  D as vn,
  m as Ds,
  g as kt,
  y as R,
  S as xn,
  V as wn,
  C as ws,
  s as _n,
  i as kn,
  f as wr,
  a as jn,
  b as Sn,
  N as Cn,
  c as En,
  d as Is,
  B as _r,
  e as Tn,
  h as Os,
  j as Nn,
  _ as kr,
  E as An,
  k as jr,
  l as Pn,
  n as $t,
  o as Dn,
  p as In,
  q as On,
  r as ht,
  F as Rn,
  t as $n,
  u as Ln,
  v as Fn,
} from './calendar-vendor-CzJ7rMdU.js'
import {
  B as I,
  C as Oe,
  a as Re,
  X as et,
  b as jt,
  c as St,
  U as Sr,
  M as Rs,
  d as es,
  P as Cr,
  T as Er,
  F as _s,
  R as Mn,
  e as Un,
  f as Fe,
  g as zn,
  h as qn,
  i as Bn,
  j as Hn,
  A as Lt,
  k as Gn,
} from './ui-vendor-BFMCvSnM.js'
import { u as Wn } from './auth-vendor-CMFeYHy6.js'
import { A as Ft } from './inventory-features-tEOlqD7s.js'
const Vn = 'modulepreload',
  Kn = function (r) {
    return '/' + r
  },
  $s = {},
  st = function (e, t, s) {
    let n = Promise.resolve()
    if (t && t.length > 0) {
      document.getElementsByTagName('link')
      const a = document.querySelector('meta[property=csp-nonce]'),
        l = a?.nonce || a?.getAttribute('nonce')
      n = Promise.allSettled(
        t.map(c => {
          if (((c = Kn(c)), c in $s)) return
          $s[c] = !0
          const d = c.endsWith('.css'),
            u = d ? '[rel="stylesheet"]' : ''
          if (document.querySelector(`link[href="${c}"]${u}`)) return
          const h = document.createElement('link')
          if (
            ((h.rel = d ? 'stylesheet' : Vn),
            d || (h.as = 'script'),
            (h.crossOrigin = ''),
            (h.href = c),
            l && h.setAttribute('nonce', l),
            document.head.appendChild(h),
            d)
          )
            return new Promise((p, f) => {
              ;(h.addEventListener('load', p),
                h.addEventListener('error', () =>
                  f(new Error(`Unable to preload CSS for ${c}`))
                ))
            })
        })
      )
    }
    function i(a) {
      const l = new Event('vite:preloadError', { cancelable: !0 })
      if (((l.payload = a), window.dispatchEvent(l), !l.defaultPrevented))
        throw a
    }
    return n.then(a => {
      for (const l of a || []) l.status === 'rejected' && i(l.reason)
      return e().catch(i)
    })
  },
  Jn = r => {
    let e
    return (
      r
        ? (e = r)
        : typeof fetch > 'u'
          ? (e = (...t) =>
              st(
                async () => {
                  const { default: s } = await Promise.resolve().then(() => ze)
                  return { default: s }
                },
                void 0
              ).then(({ default: s }) => s(...t)))
          : (e = fetch),
      (...t) => e(...t)
    )
  }
class ks extends Error {
  constructor(e, t = 'FunctionsError', s) {
    ;(super(e), (this.name = t), (this.context = s))
  }
}
class Qn extends ks {
  constructor(e) {
    super(
      'Failed to send a request to the Edge Function',
      'FunctionsFetchError',
      e
    )
  }
}
class Ls extends ks {
  constructor(e) {
    super('Relay Error invoking the Edge Function', 'FunctionsRelayError', e)
  }
}
class Fs extends ks {
  constructor(e) {
    super(
      'Edge Function returned a non-2xx status code',
      'FunctionsHttpError',
      e
    )
  }
}
var ts
;(function (r) {
  ;((r.Any = 'any'),
    (r.ApNortheast1 = 'ap-northeast-1'),
    (r.ApNortheast2 = 'ap-northeast-2'),
    (r.ApSouth1 = 'ap-south-1'),
    (r.ApSoutheast1 = 'ap-southeast-1'),
    (r.ApSoutheast2 = 'ap-southeast-2'),
    (r.CaCentral1 = 'ca-central-1'),
    (r.EuCentral1 = 'eu-central-1'),
    (r.EuWest1 = 'eu-west-1'),
    (r.EuWest2 = 'eu-west-2'),
    (r.EuWest3 = 'eu-west-3'),
    (r.SaEast1 = 'sa-east-1'),
    (r.UsEast1 = 'us-east-1'),
    (r.UsWest1 = 'us-west-1'),
    (r.UsWest2 = 'us-west-2'))
})(ts || (ts = {}))
var Yn = function (r, e, t, s) {
  function n(i) {
    return i instanceof t
      ? i
      : new t(function (a) {
          a(i)
        })
  }
  return new (t || (t = Promise))(function (i, a) {
    function l(u) {
      try {
        d(s.next(u))
      } catch (h) {
        a(h)
      }
    }
    function c(u) {
      try {
        d(s.throw(u))
      } catch (h) {
        a(h)
      }
    }
    function d(u) {
      u.done ? i(u.value) : n(u.value).then(l, c)
    }
    d((s = s.apply(r, e || [])).next())
  })
}
class Zn {
  constructor(e, { headers: t = {}, customFetch: s, region: n = ts.Any } = {}) {
    ;((this.url = e),
      (this.headers = t),
      (this.region = n),
      (this.fetch = Jn(s)))
  }
  setAuth(e) {
    this.headers.Authorization = `Bearer ${e}`
  }
  invoke(e, t = {}) {
    var s
    return Yn(this, void 0, void 0, function* () {
      try {
        const { headers: n, method: i, body: a } = t
        let l = {},
          { region: c } = t
        c || (c = this.region)
        const d = new URL(`${this.url}/${e}`)
        c &&
          c !== 'any' &&
          ((l['x-region'] = c), d.searchParams.set('forceFunctionRegion', c))
        let u
        a &&
          ((n && !Object.prototype.hasOwnProperty.call(n, 'Content-Type')) ||
            !n) &&
          ((typeof Blob < 'u' && a instanceof Blob) || a instanceof ArrayBuffer
            ? ((l['Content-Type'] = 'application/octet-stream'), (u = a))
            : typeof a == 'string'
              ? ((l['Content-Type'] = 'text/plain'), (u = a))
              : typeof FormData < 'u' && a instanceof FormData
                ? (u = a)
                : ((l['Content-Type'] = 'application/json'),
                  (u = JSON.stringify(a))))
        const h = yield this.fetch(d.toString(), {
            method: i || 'POST',
            headers: Object.assign(
              Object.assign(Object.assign({}, l), this.headers),
              n
            ),
            body: u,
          }).catch(m => {
            throw new Qn(m)
          }),
          p = h.headers.get('x-relay-error')
        if (p && p === 'true') throw new Ls(h)
        if (!h.ok) throw new Fs(h)
        let f = (
            (s = h.headers.get('Content-Type')) !== null && s !== void 0
              ? s
              : 'text/plain'
          )
            .split(';')[0]
            .trim(),
          g
        return (
          f === 'application/json'
            ? (g = yield h.json())
            : f === 'application/octet-stream'
              ? (g = yield h.blob())
              : f === 'text/event-stream'
                ? (g = h)
                : f === 'multipart/form-data'
                  ? (g = yield h.formData())
                  : (g = yield h.text()),
          { data: g, error: null, response: h }
        )
      } catch (n) {
        return {
          data: null,
          error: n,
          response: n instanceof Fs || n instanceof Ls ? n.context : void 0,
        }
      }
    })
  }
}
var J = {},
  js = {},
  Nt = {},
  rt = {},
  At = {},
  Pt = {},
  Xn = function () {
    if (typeof self < 'u') return self
    if (typeof window < 'u') return window
    if (typeof global < 'u') return global
    throw new Error('unable to locate global object')
  },
  Me = Xn()
const ei = Me.fetch,
  Tr = Me.fetch.bind(Me),
  Nr = Me.Headers,
  ti = Me.Request,
  si = Me.Response,
  ze = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        Headers: Nr,
        Request: ti,
        Response: si,
        default: Tr,
        fetch: ei,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  ri = bn(ze)
var Dt = {}
Object.defineProperty(Dt, '__esModule', { value: !0 })
let ni = class extends Error {
  constructor(e) {
    ;(super(e.message),
      (this.name = 'PostgrestError'),
      (this.details = e.details),
      (this.hint = e.hint),
      (this.code = e.code))
  }
}
Dt.default = ni
var Ar =
  (Z && Z.__importDefault) ||
  function (r) {
    return r && r.__esModule ? r : { default: r }
  }
Object.defineProperty(Pt, '__esModule', { value: !0 })
const ii = Ar(ri),
  ai = Ar(Dt)
let oi = class {
  constructor(e) {
    var t, s
    ;((this.shouldThrowOnError = !1),
      (this.method = e.method),
      (this.url = e.url),
      (this.headers = new Headers(e.headers)),
      (this.schema = e.schema),
      (this.body = e.body),
      (this.shouldThrowOnError =
        (t = e.shouldThrowOnError) !== null && t !== void 0 ? t : !1),
      (this.signal = e.signal),
      (this.isMaybeSingle =
        (s = e.isMaybeSingle) !== null && s !== void 0 ? s : !1),
      e.fetch
        ? (this.fetch = e.fetch)
        : typeof fetch > 'u'
          ? (this.fetch = ii.default)
          : (this.fetch = fetch))
  }
  throwOnError() {
    return ((this.shouldThrowOnError = !0), this)
  }
  setHeader(e, t) {
    return (
      (this.headers = new Headers(this.headers)),
      this.headers.set(e, t),
      this
    )
  }
  then(e, t) {
    ;(this.schema === void 0 ||
      (['GET', 'HEAD'].includes(this.method)
        ? this.headers.set('Accept-Profile', this.schema)
        : this.headers.set('Content-Profile', this.schema)),
      this.method !== 'GET' &&
        this.method !== 'HEAD' &&
        this.headers.set('Content-Type', 'application/json'))
    const s = this.fetch
    let n = s(this.url.toString(), {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body),
      signal: this.signal,
    }).then(async i => {
      var a, l, c, d
      let u = null,
        h = null,
        p = null,
        f = i.status,
        g = i.statusText
      if (i.ok) {
        if (this.method !== 'HEAD') {
          const b = await i.text()
          b === '' ||
            (this.headers.get('Accept') === 'text/csv' ||
            (this.headers.get('Accept') &&
              !((a = this.headers.get('Accept')) === null || a === void 0) &&
              a.includes('application/vnd.pgrst.plan+text'))
              ? (h = b)
              : (h = JSON.parse(b)))
        }
        const y =
            (l = this.headers.get('Prefer')) === null || l === void 0
              ? void 0
              : l.match(/count=(exact|planned|estimated)/),
          x =
            (c = i.headers.get('content-range')) === null || c === void 0
              ? void 0
              : c.split('/')
        ;(y && x && x.length > 1 && (p = parseInt(x[1])),
          this.isMaybeSingle &&
            this.method === 'GET' &&
            Array.isArray(h) &&
            (h.length > 1
              ? ((u = {
                  code: 'PGRST116',
                  details: `Results contain ${h.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                  hint: null,
                  message:
                    'JSON object requested, multiple (or no) rows returned',
                }),
                (h = null),
                (p = null),
                (f = 406),
                (g = 'Not Acceptable'))
              : h.length === 1
                ? (h = h[0])
                : (h = null)))
      } else {
        const y = await i.text()
        try {
          ;((u = JSON.parse(y)),
            Array.isArray(u) &&
              i.status === 404 &&
              ((h = []), (u = null), (f = 200), (g = 'OK')))
        } catch {
          i.status === 404 && y === ''
            ? ((f = 204), (g = 'No Content'))
            : (u = { message: y })
        }
        if (
          (u &&
            this.isMaybeSingle &&
            !((d = u?.details) === null || d === void 0) &&
            d.includes('0 rows') &&
            ((u = null), (f = 200), (g = 'OK')),
          u && this.shouldThrowOnError)
        )
          throw new ai.default(u)
      }
      return { error: u, data: h, count: p, status: f, statusText: g }
    })
    return (
      this.shouldThrowOnError ||
        (n = n.catch(i => {
          var a, l, c
          return {
            error: {
              message: `${(a = i?.name) !== null && a !== void 0 ? a : 'FetchError'}: ${i?.message}`,
              details: `${(l = i?.stack) !== null && l !== void 0 ? l : ''}`,
              hint: '',
              code: `${(c = i?.code) !== null && c !== void 0 ? c : ''}`,
            },
            data: null,
            count: null,
            status: 0,
            statusText: '',
          }
        })),
      n.then(e, t)
    )
  }
  returns() {
    return this
  }
  overrideTypes() {
    return this
  }
}
Pt.default = oi
var li =
  (Z && Z.__importDefault) ||
  function (r) {
    return r && r.__esModule ? r : { default: r }
  }
Object.defineProperty(At, '__esModule', { value: !0 })
const ci = li(Pt)
let di = class extends ci.default {
  select(e) {
    let t = !1
    const s = (e ?? '*')
      .split('')
      .map(n => (/\s/.test(n) && !t ? '' : (n === '"' && (t = !t), n)))
      .join('')
    return (
      this.url.searchParams.set('select', s),
      this.headers.append('Prefer', 'return=representation'),
      this
    )
  }
  order(
    e,
    {
      ascending: t = !0,
      nullsFirst: s,
      foreignTable: n,
      referencedTable: i = n,
    } = {}
  ) {
    const a = i ? `${i}.order` : 'order',
      l = this.url.searchParams.get(a)
    return (
      this.url.searchParams.set(
        a,
        `${l ? `${l},` : ''}${e}.${t ? 'asc' : 'desc'}${s === void 0 ? '' : s ? '.nullsfirst' : '.nullslast'}`
      ),
      this
    )
  }
  limit(e, { foreignTable: t, referencedTable: s = t } = {}) {
    const n = typeof s > 'u' ? 'limit' : `${s}.limit`
    return (this.url.searchParams.set(n, `${e}`), this)
  }
  range(e, t, { foreignTable: s, referencedTable: n = s } = {}) {
    const i = typeof n > 'u' ? 'offset' : `${n}.offset`,
      a = typeof n > 'u' ? 'limit' : `${n}.limit`
    return (
      this.url.searchParams.set(i, `${e}`),
      this.url.searchParams.set(a, `${t - e + 1}`),
      this
    )
  }
  abortSignal(e) {
    return ((this.signal = e), this)
  }
  single() {
    return (
      this.headers.set('Accept', 'application/vnd.pgrst.object+json'),
      this
    )
  }
  maybeSingle() {
    return (
      this.method === 'GET'
        ? this.headers.set('Accept', 'application/json')
        : this.headers.set('Accept', 'application/vnd.pgrst.object+json'),
      (this.isMaybeSingle = !0),
      this
    )
  }
  csv() {
    return (this.headers.set('Accept', 'text/csv'), this)
  }
  geojson() {
    return (this.headers.set('Accept', 'application/geo+json'), this)
  }
  explain({
    analyze: e = !1,
    verbose: t = !1,
    settings: s = !1,
    buffers: n = !1,
    wal: i = !1,
    format: a = 'text',
  } = {}) {
    var l
    const c = [
        e ? 'analyze' : null,
        t ? 'verbose' : null,
        s ? 'settings' : null,
        n ? 'buffers' : null,
        i ? 'wal' : null,
      ]
        .filter(Boolean)
        .join('|'),
      d =
        (l = this.headers.get('Accept')) !== null && l !== void 0
          ? l
          : 'application/json'
    return (
      this.headers.set(
        'Accept',
        `application/vnd.pgrst.plan+${a}; for="${d}"; options=${c};`
      ),
      a === 'json' ? this : this
    )
  }
  rollback() {
    return (this.headers.append('Prefer', 'tx=rollback'), this)
  }
  returns() {
    return this
  }
  maxAffected(e) {
    return (
      this.headers.append('Prefer', 'handling=strict'),
      this.headers.append('Prefer', `max-affected=${e}`),
      this
    )
  }
}
At.default = di
var ui =
  (Z && Z.__importDefault) ||
  function (r) {
    return r && r.__esModule ? r : { default: r }
  }
Object.defineProperty(rt, '__esModule', { value: !0 })
const hi = ui(At)
let fi = class extends hi.default {
  eq(e, t) {
    return (this.url.searchParams.append(e, `eq.${t}`), this)
  }
  neq(e, t) {
    return (this.url.searchParams.append(e, `neq.${t}`), this)
  }
  gt(e, t) {
    return (this.url.searchParams.append(e, `gt.${t}`), this)
  }
  gte(e, t) {
    return (this.url.searchParams.append(e, `gte.${t}`), this)
  }
  lt(e, t) {
    return (this.url.searchParams.append(e, `lt.${t}`), this)
  }
  lte(e, t) {
    return (this.url.searchParams.append(e, `lte.${t}`), this)
  }
  like(e, t) {
    return (this.url.searchParams.append(e, `like.${t}`), this)
  }
  likeAllOf(e, t) {
    return (this.url.searchParams.append(e, `like(all).{${t.join(',')}}`), this)
  }
  likeAnyOf(e, t) {
    return (this.url.searchParams.append(e, `like(any).{${t.join(',')}}`), this)
  }
  ilike(e, t) {
    return (this.url.searchParams.append(e, `ilike.${t}`), this)
  }
  ilikeAllOf(e, t) {
    return (
      this.url.searchParams.append(e, `ilike(all).{${t.join(',')}}`),
      this
    )
  }
  ilikeAnyOf(e, t) {
    return (
      this.url.searchParams.append(e, `ilike(any).{${t.join(',')}}`),
      this
    )
  }
  is(e, t) {
    return (this.url.searchParams.append(e, `is.${t}`), this)
  }
  in(e, t) {
    const s = Array.from(new Set(t))
      .map(n =>
        typeof n == 'string' && new RegExp('[,()]').test(n) ? `"${n}"` : `${n}`
      )
      .join(',')
    return (this.url.searchParams.append(e, `in.(${s})`), this)
  }
  contains(e, t) {
    return (
      typeof t == 'string'
        ? this.url.searchParams.append(e, `cs.${t}`)
        : Array.isArray(t)
          ? this.url.searchParams.append(e, `cs.{${t.join(',')}}`)
          : this.url.searchParams.append(e, `cs.${JSON.stringify(t)}`),
      this
    )
  }
  containedBy(e, t) {
    return (
      typeof t == 'string'
        ? this.url.searchParams.append(e, `cd.${t}`)
        : Array.isArray(t)
          ? this.url.searchParams.append(e, `cd.{${t.join(',')}}`)
          : this.url.searchParams.append(e, `cd.${JSON.stringify(t)}`),
      this
    )
  }
  rangeGt(e, t) {
    return (this.url.searchParams.append(e, `sr.${t}`), this)
  }
  rangeGte(e, t) {
    return (this.url.searchParams.append(e, `nxl.${t}`), this)
  }
  rangeLt(e, t) {
    return (this.url.searchParams.append(e, `sl.${t}`), this)
  }
  rangeLte(e, t) {
    return (this.url.searchParams.append(e, `nxr.${t}`), this)
  }
  rangeAdjacent(e, t) {
    return (this.url.searchParams.append(e, `adj.${t}`), this)
  }
  overlaps(e, t) {
    return (
      typeof t == 'string'
        ? this.url.searchParams.append(e, `ov.${t}`)
        : this.url.searchParams.append(e, `ov.{${t.join(',')}}`),
      this
    )
  }
  textSearch(e, t, { config: s, type: n } = {}) {
    let i = ''
    n === 'plain'
      ? (i = 'pl')
      : n === 'phrase'
        ? (i = 'ph')
        : n === 'websearch' && (i = 'w')
    const a = s === void 0 ? '' : `(${s})`
    return (this.url.searchParams.append(e, `${i}fts${a}.${t}`), this)
  }
  match(e) {
    return (
      Object.entries(e).forEach(([t, s]) => {
        this.url.searchParams.append(t, `eq.${s}`)
      }),
      this
    )
  }
  not(e, t, s) {
    return (this.url.searchParams.append(e, `not.${t}.${s}`), this)
  }
  or(e, { foreignTable: t, referencedTable: s = t } = {}) {
    const n = s ? `${s}.or` : 'or'
    return (this.url.searchParams.append(n, `(${e})`), this)
  }
  filter(e, t, s) {
    return (this.url.searchParams.append(e, `${t}.${s}`), this)
  }
}
rt.default = fi
var mi =
  (Z && Z.__importDefault) ||
  function (r) {
    return r && r.__esModule ? r : { default: r }
  }
Object.defineProperty(Nt, '__esModule', { value: !0 })
const Ge = mi(rt)
let gi = class {
  constructor(e, { headers: t = {}, schema: s, fetch: n }) {
    ;((this.url = e),
      (this.headers = new Headers(t)),
      (this.schema = s),
      (this.fetch = n))
  }
  select(e, { head: t = !1, count: s } = {}) {
    const n = t ? 'HEAD' : 'GET'
    let i = !1
    const a = (e ?? '*')
      .split('')
      .map(l => (/\s/.test(l) && !i ? '' : (l === '"' && (i = !i), l)))
      .join('')
    return (
      this.url.searchParams.set('select', a),
      s && this.headers.append('Prefer', `count=${s}`),
      new Ge.default({
        method: n,
        url: this.url,
        headers: this.headers,
        schema: this.schema,
        fetch: this.fetch,
      })
    )
  }
  insert(e, { count: t, defaultToNull: s = !0 } = {}) {
    var n
    const i = 'POST'
    if (
      (t && this.headers.append('Prefer', `count=${t}`),
      s || this.headers.append('Prefer', 'missing=default'),
      Array.isArray(e))
    ) {
      const a = e.reduce((l, c) => l.concat(Object.keys(c)), [])
      if (a.length > 0) {
        const l = [...new Set(a)].map(c => `"${c}"`)
        this.url.searchParams.set('columns', l.join(','))
      }
    }
    return new Ge.default({
      method: i,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: e,
      fetch: (n = this.fetch) !== null && n !== void 0 ? n : fetch,
    })
  }
  upsert(
    e,
    {
      onConflict: t,
      ignoreDuplicates: s = !1,
      count: n,
      defaultToNull: i = !0,
    } = {}
  ) {
    var a
    const l = 'POST'
    if (
      (this.headers.append(
        'Prefer',
        `resolution=${s ? 'ignore' : 'merge'}-duplicates`
      ),
      t !== void 0 && this.url.searchParams.set('on_conflict', t),
      n && this.headers.append('Prefer', `count=${n}`),
      i || this.headers.append('Prefer', 'missing=default'),
      Array.isArray(e))
    ) {
      const c = e.reduce((d, u) => d.concat(Object.keys(u)), [])
      if (c.length > 0) {
        const d = [...new Set(c)].map(u => `"${u}"`)
        this.url.searchParams.set('columns', d.join(','))
      }
    }
    return new Ge.default({
      method: l,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: e,
      fetch: (a = this.fetch) !== null && a !== void 0 ? a : fetch,
    })
  }
  update(e, { count: t } = {}) {
    var s
    const n = 'PATCH'
    return (
      t && this.headers.append('Prefer', `count=${t}`),
      new Ge.default({
        method: n,
        url: this.url,
        headers: this.headers,
        schema: this.schema,
        body: e,
        fetch: (s = this.fetch) !== null && s !== void 0 ? s : fetch,
      })
    )
  }
  delete({ count: e } = {}) {
    var t
    const s = 'DELETE'
    return (
      e && this.headers.append('Prefer', `count=${e}`),
      new Ge.default({
        method: s,
        url: this.url,
        headers: this.headers,
        schema: this.schema,
        fetch: (t = this.fetch) !== null && t !== void 0 ? t : fetch,
      })
    )
  }
}
Nt.default = gi
var Pr =
  (Z && Z.__importDefault) ||
  function (r) {
    return r && r.__esModule ? r : { default: r }
  }
Object.defineProperty(js, '__esModule', { value: !0 })
const pi = Pr(Nt),
  yi = Pr(rt)
let bi = class Dr {
  constructor(e, { headers: t = {}, schema: s, fetch: n } = {}) {
    ;((this.url = e),
      (this.headers = new Headers(t)),
      (this.schemaName = s),
      (this.fetch = n))
  }
  from(e) {
    const t = new URL(`${this.url}/${e}`)
    return new pi.default(t, {
      headers: new Headers(this.headers),
      schema: this.schemaName,
      fetch: this.fetch,
    })
  }
  schema(e) {
    return new Dr(this.url, {
      headers: this.headers,
      schema: e,
      fetch: this.fetch,
    })
  }
  rpc(e, t = {}, { head: s = !1, get: n = !1, count: i } = {}) {
    var a
    let l
    const c = new URL(`${this.url}/rpc/${e}`)
    let d
    s || n
      ? ((l = s ? 'HEAD' : 'GET'),
        Object.entries(t)
          .filter(([h, p]) => p !== void 0)
          .map(([h, p]) => [h, Array.isArray(p) ? `{${p.join(',')}}` : `${p}`])
          .forEach(([h, p]) => {
            c.searchParams.append(h, p)
          }))
      : ((l = 'POST'), (d = t))
    const u = new Headers(this.headers)
    return (
      i && u.set('Prefer', `count=${i}`),
      new yi.default({
        method: l,
        url: c,
        headers: u,
        schema: this.schemaName,
        body: d,
        fetch: (a = this.fetch) !== null && a !== void 0 ? a : fetch,
      })
    )
  }
}
js.default = bi
var qe =
  (Z && Z.__importDefault) ||
  function (r) {
    return r && r.__esModule ? r : { default: r }
  }
Object.defineProperty(J, '__esModule', { value: !0 })
J.PostgrestError =
  J.PostgrestBuilder =
  J.PostgrestTransformBuilder =
  J.PostgrestFilterBuilder =
  J.PostgrestQueryBuilder =
  J.PostgrestClient =
    void 0
const Ir = qe(js)
J.PostgrestClient = Ir.default
const Or = qe(Nt)
J.PostgrestQueryBuilder = Or.default
const Rr = qe(rt)
J.PostgrestFilterBuilder = Rr.default
const $r = qe(At)
J.PostgrestTransformBuilder = $r.default
const Lr = qe(Pt)
J.PostgrestBuilder = Lr.default
const Fr = qe(Dt)
J.PostgrestError = Fr.default
var vi = (J.default = {
  PostgrestClient: Ir.default,
  PostgrestQueryBuilder: Or.default,
  PostgrestFilterBuilder: Rr.default,
  PostgrestTransformBuilder: $r.default,
  PostgrestBuilder: Lr.default,
  PostgrestError: Fr.default,
})
const {
  PostgrestClient: xi,
  PostgrestQueryBuilder: Ic,
  PostgrestFilterBuilder: Oc,
  PostgrestTransformBuilder: Rc,
  PostgrestBuilder: $c,
  PostgrestError: Lc,
} = vi
class wi {
  static detectEnvironment() {
    var e
    if (typeof WebSocket < 'u')
      return { type: 'native', constructor: WebSocket }
    if (typeof globalThis < 'u' && typeof globalThis.WebSocket < 'u')
      return { type: 'native', constructor: globalThis.WebSocket }
    if (typeof global < 'u' && typeof global.WebSocket < 'u')
      return { type: 'native', constructor: global.WebSocket }
    if (
      typeof globalThis < 'u' &&
      typeof globalThis.WebSocketPair < 'u' &&
      typeof globalThis.WebSocket > 'u'
    )
      return {
        type: 'cloudflare',
        error:
          'Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.',
        workaround:
          'Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime.',
      }
    if (
      (typeof globalThis < 'u' && globalThis.EdgeRuntime) ||
      (typeof navigator < 'u' &&
        !((e = navigator.userAgent) === null || e === void 0) &&
        e.includes('Vercel-Edge'))
    )
      return {
        type: 'unsupported',
        error:
          'Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.',
        workaround:
          'Use serverless functions or a different deployment target for WebSocket functionality.',
      }
    if (typeof process < 'u') {
      const t = process.versions
      if (t && t.node) {
        const s = t.node,
          n = parseInt(s.replace(/^v/, '').split('.')[0])
        return n >= 22
          ? typeof globalThis.WebSocket < 'u'
            ? { type: 'native', constructor: globalThis.WebSocket }
            : {
                type: 'unsupported',
                error: `Node.js ${n} detected but native WebSocket not found.`,
                workaround:
                  'Provide a WebSocket implementation via the transport option.',
              }
          : {
              type: 'unsupported',
              error: `Node.js ${n} detected without native WebSocket support.`,
              workaround: `For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })`,
            }
      }
    }
    return {
      type: 'unsupported',
      error: 'Unknown JavaScript runtime without WebSocket support.',
      workaround:
        "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation.",
    }
  }
  static getWebSocketConstructor() {
    const e = this.detectEnvironment()
    if (e.constructor) return e.constructor
    let t = e.error || 'WebSocket not supported in this environment.'
    throw (
      e.workaround &&
        (t += `

Suggested solution: ${e.workaround}`),
      new Error(t)
    )
  }
  static createWebSocket(e, t) {
    const s = this.getWebSocketConstructor()
    return new s(e, t)
  }
  static isWebSocketSupported() {
    try {
      const e = this.detectEnvironment()
      return e.type === 'native' || e.type === 'ws'
    } catch {
      return !1
    }
  }
}
const _i = '2.15.5',
  ki = `realtime-js/${_i}`,
  ji = '1.0.0',
  ss = 1e4,
  Si = 1e3,
  Ci = 100
var Qe
;(function (r) {
  ;((r[(r.connecting = 0)] = 'connecting'),
    (r[(r.open = 1)] = 'open'),
    (r[(r.closing = 2)] = 'closing'),
    (r[(r.closed = 3)] = 'closed'))
})(Qe || (Qe = {}))
var B
;(function (r) {
  ;((r.closed = 'closed'),
    (r.errored = 'errored'),
    (r.joined = 'joined'),
    (r.joining = 'joining'),
    (r.leaving = 'leaving'))
})(B || (B = {}))
var ee
;(function (r) {
  ;((r.close = 'phx_close'),
    (r.error = 'phx_error'),
    (r.join = 'phx_join'),
    (r.reply = 'phx_reply'),
    (r.leave = 'phx_leave'),
    (r.access_token = 'access_token'))
})(ee || (ee = {}))
var rs
;(function (r) {
  r.websocket = 'websocket'
})(rs || (rs = {}))
var ye
;(function (r) {
  ;((r.Connecting = 'connecting'),
    (r.Open = 'open'),
    (r.Closing = 'closing'),
    (r.Closed = 'closed'))
})(ye || (ye = {}))
class Ei {
  constructor() {
    this.HEADER_LENGTH = 1
  }
  decode(e, t) {
    return e.constructor === ArrayBuffer
      ? t(this._binaryDecode(e))
      : t(typeof e == 'string' ? JSON.parse(e) : {})
  }
  _binaryDecode(e) {
    const t = new DataView(e),
      s = new TextDecoder()
    return this._decodeBroadcast(e, t, s)
  }
  _decodeBroadcast(e, t, s) {
    const n = t.getUint8(1),
      i = t.getUint8(2)
    let a = this.HEADER_LENGTH + 2
    const l = s.decode(e.slice(a, a + n))
    a = a + n
    const c = s.decode(e.slice(a, a + i))
    a = a + i
    const d = JSON.parse(s.decode(e.slice(a, e.byteLength)))
    return { ref: null, topic: l, event: c, payload: d }
  }
}
class Mr {
  constructor(e, t) {
    ;((this.callback = e),
      (this.timerCalc = t),
      (this.timer = void 0),
      (this.tries = 0),
      (this.callback = e),
      (this.timerCalc = t))
  }
  reset() {
    ;((this.tries = 0), clearTimeout(this.timer), (this.timer = void 0))
  }
  scheduleTimeout() {
    ;(clearTimeout(this.timer),
      (this.timer = setTimeout(
        () => {
          ;((this.tries = this.tries + 1), this.callback())
        },
        this.timerCalc(this.tries + 1)
      )))
  }
}
var L
;(function (r) {
  ;((r.abstime = 'abstime'),
    (r.bool = 'bool'),
    (r.date = 'date'),
    (r.daterange = 'daterange'),
    (r.float4 = 'float4'),
    (r.float8 = 'float8'),
    (r.int2 = 'int2'),
    (r.int4 = 'int4'),
    (r.int4range = 'int4range'),
    (r.int8 = 'int8'),
    (r.int8range = 'int8range'),
    (r.json = 'json'),
    (r.jsonb = 'jsonb'),
    (r.money = 'money'),
    (r.numeric = 'numeric'),
    (r.oid = 'oid'),
    (r.reltime = 'reltime'),
    (r.text = 'text'),
    (r.time = 'time'),
    (r.timestamp = 'timestamp'),
    (r.timestamptz = 'timestamptz'),
    (r.timetz = 'timetz'),
    (r.tsrange = 'tsrange'),
    (r.tstzrange = 'tstzrange'))
})(L || (L = {}))
const Ms = (r, e, t = {}) => {
    var s
    const n = (s = t.skipTypes) !== null && s !== void 0 ? s : []
    return Object.keys(e).reduce((i, a) => ((i[a] = Ti(a, r, e, n)), i), {})
  },
  Ti = (r, e, t, s) => {
    const n = e.find(l => l.name === r),
      i = n?.type,
      a = t[r]
    return i && !s.includes(i) ? Ur(i, a) : ns(a)
  },
  Ur = (r, e) => {
    if (r.charAt(0) === '_') {
      const t = r.slice(1, r.length)
      return Di(e, t)
    }
    switch (r) {
      case L.bool:
        return Ni(e)
      case L.float4:
      case L.float8:
      case L.int2:
      case L.int4:
      case L.int8:
      case L.numeric:
      case L.oid:
        return Ai(e)
      case L.json:
      case L.jsonb:
        return Pi(e)
      case L.timestamp:
        return Ii(e)
      case L.abstime:
      case L.date:
      case L.daterange:
      case L.int4range:
      case L.int8range:
      case L.money:
      case L.reltime:
      case L.text:
      case L.time:
      case L.timestamptz:
      case L.timetz:
      case L.tsrange:
      case L.tstzrange:
        return ns(e)
      default:
        return ns(e)
    }
  },
  ns = r => r,
  Ni = r => {
    switch (r) {
      case 't':
        return !0
      case 'f':
        return !1
      default:
        return r
    }
  },
  Ai = r => {
    if (typeof r == 'string') {
      const e = parseFloat(r)
      if (!Number.isNaN(e)) return e
    }
    return r
  },
  Pi = r => {
    if (typeof r == 'string')
      try {
        return JSON.parse(r)
      } catch (e) {
        return (console.log(`JSON parse error: ${e}`), r)
      }
    return r
  },
  Di = (r, e) => {
    if (typeof r != 'string') return r
    const t = r.length - 1,
      s = r[t]
    if (r[0] === '{' && s === '}') {
      let i
      const a = r.slice(1, t)
      try {
        i = JSON.parse('[' + a + ']')
      } catch {
        i = a ? a.split(',') : []
      }
      return i.map(l => Ur(e, l))
    }
    return r
  },
  Ii = r => (typeof r == 'string' ? r.replace(' ', 'T') : r),
  zr = r => {
    let e = r
    return (
      (e = e.replace(/^ws/i, 'http')),
      (e = e.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, '')),
      e.replace(/\/+$/, '') + '/api/broadcast'
    )
  }
class Mt {
  constructor(e, t, s = {}, n = ss) {
    ;((this.channel = e),
      (this.event = t),
      (this.payload = s),
      (this.timeout = n),
      (this.sent = !1),
      (this.timeoutTimer = void 0),
      (this.ref = ''),
      (this.receivedResp = null),
      (this.recHooks = []),
      (this.refEvent = null))
  }
  resend(e) {
    ;((this.timeout = e),
      this._cancelRefEvent(),
      (this.ref = ''),
      (this.refEvent = null),
      (this.receivedResp = null),
      (this.sent = !1),
      this.send())
  }
  send() {
    this._hasReceived('timeout') ||
      (this.startTimeout(),
      (this.sent = !0),
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref,
        join_ref: this.channel._joinRef(),
      }))
  }
  updatePayload(e) {
    this.payload = Object.assign(Object.assign({}, this.payload), e)
  }
  receive(e, t) {
    var s
    return (
      this._hasReceived(e) &&
        t(
          (s = this.receivedResp) === null || s === void 0 ? void 0 : s.response
        ),
      this.recHooks.push({ status: e, callback: t }),
      this
    )
  }
  startTimeout() {
    if (this.timeoutTimer) return
    ;((this.ref = this.channel.socket._makeRef()),
      (this.refEvent = this.channel._replyEventName(this.ref)))
    const e = t => {
      ;(this._cancelRefEvent(),
        this._cancelTimeout(),
        (this.receivedResp = t),
        this._matchReceive(t))
    }
    ;(this.channel._on(this.refEvent, {}, e),
      (this.timeoutTimer = setTimeout(() => {
        this.trigger('timeout', {})
      }, this.timeout)))
  }
  trigger(e, t) {
    this.refEvent &&
      this.channel._trigger(this.refEvent, { status: e, response: t })
  }
  destroy() {
    ;(this._cancelRefEvent(), this._cancelTimeout())
  }
  _cancelRefEvent() {
    this.refEvent && this.channel._off(this.refEvent, {})
  }
  _cancelTimeout() {
    ;(clearTimeout(this.timeoutTimer), (this.timeoutTimer = void 0))
  }
  _matchReceive({ status: e, response: t }) {
    this.recHooks.filter(s => s.status === e).forEach(s => s.callback(t))
  }
  _hasReceived(e) {
    return this.receivedResp && this.receivedResp.status === e
  }
}
var Us
;(function (r) {
  ;((r.SYNC = 'sync'), (r.JOIN = 'join'), (r.LEAVE = 'leave'))
})(Us || (Us = {}))
class Ye {
  constructor(e, t) {
    ;((this.channel = e),
      (this.state = {}),
      (this.pendingDiffs = []),
      (this.joinRef = null),
      (this.enabled = !1),
      (this.caller = { onJoin: () => {}, onLeave: () => {}, onSync: () => {} }))
    const s = t?.events || { state: 'presence_state', diff: 'presence_diff' }
    ;(this.channel._on(s.state, {}, n => {
      const { onJoin: i, onLeave: a, onSync: l } = this.caller
      ;((this.joinRef = this.channel._joinRef()),
        (this.state = Ye.syncState(this.state, n, i, a)),
        this.pendingDiffs.forEach(c => {
          this.state = Ye.syncDiff(this.state, c, i, a)
        }),
        (this.pendingDiffs = []),
        l())
    }),
      this.channel._on(s.diff, {}, n => {
        const { onJoin: i, onLeave: a, onSync: l } = this.caller
        this.inPendingSyncState()
          ? this.pendingDiffs.push(n)
          : ((this.state = Ye.syncDiff(this.state, n, i, a)), l())
      }),
      this.onJoin((n, i, a) => {
        this.channel._trigger('presence', {
          event: 'join',
          key: n,
          currentPresences: i,
          newPresences: a,
        })
      }),
      this.onLeave((n, i, a) => {
        this.channel._trigger('presence', {
          event: 'leave',
          key: n,
          currentPresences: i,
          leftPresences: a,
        })
      }),
      this.onSync(() => {
        this.channel._trigger('presence', { event: 'sync' })
      }))
  }
  static syncState(e, t, s, n) {
    const i = this.cloneDeep(e),
      a = this.transformState(t),
      l = {},
      c = {}
    return (
      this.map(i, (d, u) => {
        a[d] || (c[d] = u)
      }),
      this.map(a, (d, u) => {
        const h = i[d]
        if (h) {
          const p = u.map(y => y.presence_ref),
            f = h.map(y => y.presence_ref),
            g = u.filter(y => f.indexOf(y.presence_ref) < 0),
            m = h.filter(y => p.indexOf(y.presence_ref) < 0)
          ;(g.length > 0 && (l[d] = g), m.length > 0 && (c[d] = m))
        } else l[d] = u
      }),
      this.syncDiff(i, { joins: l, leaves: c }, s, n)
    )
  }
  static syncDiff(e, t, s, n) {
    const { joins: i, leaves: a } = {
      joins: this.transformState(t.joins),
      leaves: this.transformState(t.leaves),
    }
    return (
      s || (s = () => {}),
      n || (n = () => {}),
      this.map(i, (l, c) => {
        var d
        const u = (d = e[l]) !== null && d !== void 0 ? d : []
        if (((e[l] = this.cloneDeep(c)), u.length > 0)) {
          const h = e[l].map(f => f.presence_ref),
            p = u.filter(f => h.indexOf(f.presence_ref) < 0)
          e[l].unshift(...p)
        }
        s(l, u, c)
      }),
      this.map(a, (l, c) => {
        let d = e[l]
        if (!d) return
        const u = c.map(h => h.presence_ref)
        ;((d = d.filter(h => u.indexOf(h.presence_ref) < 0)),
          (e[l] = d),
          n(l, d, c),
          d.length === 0 && delete e[l])
      }),
      e
    )
  }
  static map(e, t) {
    return Object.getOwnPropertyNames(e).map(s => t(s, e[s]))
  }
  static transformState(e) {
    return (
      (e = this.cloneDeep(e)),
      Object.getOwnPropertyNames(e).reduce((t, s) => {
        const n = e[s]
        return (
          'metas' in n
            ? (t[s] = n.metas.map(
                i => (
                  (i.presence_ref = i.phx_ref),
                  delete i.phx_ref,
                  delete i.phx_ref_prev,
                  i
                )
              ))
            : (t[s] = n),
          t
        )
      }, {})
    )
  }
  static cloneDeep(e) {
    return JSON.parse(JSON.stringify(e))
  }
  onJoin(e) {
    this.caller.onJoin = e
  }
  onLeave(e) {
    this.caller.onLeave = e
  }
  onSync(e) {
    this.caller.onSync = e
  }
  inPendingSyncState() {
    return !this.joinRef || this.joinRef !== this.channel._joinRef()
  }
}
var zs
;(function (r) {
  ;((r.ALL = '*'),
    (r.INSERT = 'INSERT'),
    (r.UPDATE = 'UPDATE'),
    (r.DELETE = 'DELETE'))
})(zs || (zs = {}))
var Ze
;(function (r) {
  ;((r.BROADCAST = 'broadcast'),
    (r.PRESENCE = 'presence'),
    (r.POSTGRES_CHANGES = 'postgres_changes'),
    (r.SYSTEM = 'system'))
})(Ze || (Ze = {}))
var ae
;(function (r) {
  ;((r.SUBSCRIBED = 'SUBSCRIBED'),
    (r.TIMED_OUT = 'TIMED_OUT'),
    (r.CLOSED = 'CLOSED'),
    (r.CHANNEL_ERROR = 'CHANNEL_ERROR'))
})(ae || (ae = {}))
class Ss {
  constructor(e, t = { config: {} }, s) {
    ;((this.topic = e),
      (this.params = t),
      (this.socket = s),
      (this.bindings = {}),
      (this.state = B.closed),
      (this.joinedOnce = !1),
      (this.pushBuffer = []),
      (this.subTopic = e.replace(/^realtime:/i, '')),
      (this.params.config = Object.assign(
        {
          broadcast: { ack: !1, self: !1 },
          presence: { key: '', enabled: !1 },
          private: !1,
        },
        t.config
      )),
      (this.timeout = this.socket.timeout),
      (this.joinPush = new Mt(this, ee.join, this.params, this.timeout)),
      (this.rejoinTimer = new Mr(
        () => this._rejoinUntilConnected(),
        this.socket.reconnectAfterMs
      )),
      this.joinPush.receive('ok', () => {
        ;((this.state = B.joined),
          this.rejoinTimer.reset(),
          this.pushBuffer.forEach(n => n.send()),
          (this.pushBuffer = []))
      }),
      this._onClose(() => {
        ;(this.rejoinTimer.reset(),
          this.socket.log('channel', `close ${this.topic} ${this._joinRef()}`),
          (this.state = B.closed),
          this.socket._remove(this))
      }),
      this._onError(n => {
        this._isLeaving() ||
          this._isClosed() ||
          (this.socket.log('channel', `error ${this.topic}`, n),
          (this.state = B.errored),
          this.rejoinTimer.scheduleTimeout())
      }),
      this.joinPush.receive('timeout', () => {
        this._isJoining() &&
          (this.socket.log(
            'channel',
            `timeout ${this.topic}`,
            this.joinPush.timeout
          ),
          (this.state = B.errored),
          this.rejoinTimer.scheduleTimeout())
      }),
      this.joinPush.receive('error', n => {
        this._isLeaving() ||
          this._isClosed() ||
          (this.socket.log('channel', `error ${this.topic}`, n),
          (this.state = B.errored),
          this.rejoinTimer.scheduleTimeout())
      }),
      this._on(ee.reply, {}, (n, i) => {
        this._trigger(this._replyEventName(i), n)
      }),
      (this.presence = new Ye(this)),
      (this.broadcastEndpointURL = zr(this.socket.endPoint)),
      (this.private = this.params.config.private || !1))
  }
  subscribe(e, t = this.timeout) {
    var s, n, i
    if (
      (this.socket.isConnected() || this.socket.connect(),
      this.state == B.closed)
    ) {
      const {
          config: { broadcast: a, presence: l, private: c },
        } = this.params,
        d =
          (n =
            (s = this.bindings.postgres_changes) === null || s === void 0
              ? void 0
              : s.map(f => f.filter)) !== null && n !== void 0
            ? n
            : [],
        u =
          (!!this.bindings[Ze.PRESENCE] &&
            this.bindings[Ze.PRESENCE].length > 0) ||
          ((i = this.params.config.presence) === null || i === void 0
            ? void 0
            : i.enabled) === !0,
        h = {},
        p = {
          broadcast: a,
          presence: Object.assign(Object.assign({}, l), { enabled: u }),
          postgres_changes: d,
          private: c,
        }
      ;(this.socket.accessTokenValue &&
        (h.access_token = this.socket.accessTokenValue),
        this._onError(f => e?.(ae.CHANNEL_ERROR, f)),
        this._onClose(() => e?.(ae.CLOSED)),
        this.updateJoinPayload(Object.assign({ config: p }, h)),
        (this.joinedOnce = !0),
        this._rejoin(t),
        this.joinPush
          .receive('ok', async ({ postgres_changes: f }) => {
            var g
            if ((this.socket.setAuth(), f === void 0)) {
              e?.(ae.SUBSCRIBED)
              return
            } else {
              const m = this.bindings.postgres_changes,
                y = (g = m?.length) !== null && g !== void 0 ? g : 0,
                x = []
              for (let b = 0; b < y; b++) {
                const w = m[b],
                  {
                    filter: { event: v, schema: A, table: j, filter: O },
                  } = w,
                  S = f && f[b]
                if (
                  S &&
                  S.event === v &&
                  S.schema === A &&
                  S.table === j &&
                  S.filter === O
                )
                  x.push(Object.assign(Object.assign({}, w), { id: S.id }))
                else {
                  ;(this.unsubscribe(),
                    (this.state = B.errored),
                    e?.(
                      ae.CHANNEL_ERROR,
                      new Error(
                        'mismatch between server and client bindings for postgres changes'
                      )
                    ))
                  return
                }
              }
              ;((this.bindings.postgres_changes = x), e && e(ae.SUBSCRIBED))
              return
            }
          })
          .receive('error', f => {
            ;((this.state = B.errored),
              e?.(
                ae.CHANNEL_ERROR,
                new Error(
                  JSON.stringify(Object.values(f).join(', ') || 'error')
                )
              ))
          })
          .receive('timeout', () => {
            e?.(ae.TIMED_OUT)
          }))
    }
    return this
  }
  presenceState() {
    return this.presence.state
  }
  async track(e, t = {}) {
    return await this.send(
      { type: 'presence', event: 'track', payload: e },
      t.timeout || this.timeout
    )
  }
  async untrack(e = {}) {
    return await this.send({ type: 'presence', event: 'untrack' }, e)
  }
  on(e, t, s) {
    return (
      this.state === B.joined &&
        e === Ze.PRESENCE &&
        (this.socket.log(
          'channel',
          `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`
        ),
        this.unsubscribe().then(() => this.subscribe())),
      this._on(e, t, s)
    )
  }
  async send(e, t = {}) {
    var s, n
    if (!this._canPush() && e.type === 'broadcast') {
      const { event: i, payload: a } = e,
        c = {
          method: 'POST',
          headers: {
            Authorization: this.socket.accessTokenValue
              ? `Bearer ${this.socket.accessTokenValue}`
              : '',
            apikey: this.socket.apiKey ? this.socket.apiKey : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                topic: this.subTopic,
                event: i,
                payload: a,
                private: this.private,
              },
            ],
          }),
        }
      try {
        const d = await this._fetchWithTimeout(
          this.broadcastEndpointURL,
          c,
          (s = t.timeout) !== null && s !== void 0 ? s : this.timeout
        )
        return (
          await ((n = d.body) === null || n === void 0 ? void 0 : n.cancel()),
          d.ok ? 'ok' : 'error'
        )
      } catch (d) {
        return d.name === 'AbortError' ? 'timed out' : 'error'
      }
    } else
      return new Promise(i => {
        var a, l, c
        const d = this._push(e.type, e, t.timeout || this.timeout)
        ;(e.type === 'broadcast' &&
          !(
            !(
              (c =
                (l =
                  (a = this.params) === null || a === void 0
                    ? void 0
                    : a.config) === null || l === void 0
                  ? void 0
                  : l.broadcast) === null || c === void 0
            ) && c.ack
          ) &&
          i('ok'),
          d.receive('ok', () => i('ok')),
          d.receive('error', () => i('error')),
          d.receive('timeout', () => i('timed out')))
      })
  }
  updateJoinPayload(e) {
    this.joinPush.updatePayload(e)
  }
  unsubscribe(e = this.timeout) {
    this.state = B.leaving
    const t = () => {
      ;(this.socket.log('channel', `leave ${this.topic}`),
        this._trigger(ee.close, 'leave', this._joinRef()))
    }
    this.joinPush.destroy()
    let s = null
    return new Promise(n => {
      ;((s = new Mt(this, ee.leave, {}, e)),
        s
          .receive('ok', () => {
            ;(t(), n('ok'))
          })
          .receive('timeout', () => {
            ;(t(), n('timed out'))
          })
          .receive('error', () => {
            n('error')
          }),
        s.send(),
        this._canPush() || s.trigger('ok', {}))
    }).finally(() => {
      s?.destroy()
    })
  }
  teardown() {
    ;(this.pushBuffer.forEach(e => e.destroy()),
      (this.pushBuffer = []),
      this.rejoinTimer.reset(),
      this.joinPush.destroy(),
      (this.state = B.closed),
      (this.bindings = {}))
  }
  async _fetchWithTimeout(e, t, s) {
    const n = new AbortController(),
      i = setTimeout(() => n.abort(), s),
      a = await this.socket.fetch(
        e,
        Object.assign(Object.assign({}, t), { signal: n.signal })
      )
    return (clearTimeout(i), a)
  }
  _push(e, t, s = this.timeout) {
    if (!this.joinedOnce)
      throw `tried to push '${e}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`
    let n = new Mt(this, e, t, s)
    return (this._canPush() ? n.send() : this._addToPushBuffer(n), n)
  }
  _addToPushBuffer(e) {
    if (
      (e.startTimeout(), this.pushBuffer.push(e), this.pushBuffer.length > Ci)
    ) {
      const t = this.pushBuffer.shift()
      t &&
        (t.destroy(),
        this.socket.log(
          'channel',
          `discarded push due to buffer overflow: ${t.event}`,
          t.payload
        ))
    }
  }
  _onMessage(e, t, s) {
    return t
  }
  _isMember(e) {
    return this.topic === e
  }
  _joinRef() {
    return this.joinPush.ref
  }
  _trigger(e, t, s) {
    var n, i
    const a = e.toLocaleLowerCase(),
      { close: l, error: c, leave: d, join: u } = ee
    if (s && [l, c, d, u].indexOf(a) >= 0 && s !== this._joinRef()) return
    let p = this._onMessage(a, t, s)
    if (t && !p)
      throw 'channel onMessage callbacks must return the payload, modified or unmodified'
    ;['insert', 'update', 'delete'].includes(a)
      ? (n = this.bindings.postgres_changes) === null ||
        n === void 0 ||
        n
          .filter(f => {
            var g, m, y
            return (
              ((g = f.filter) === null || g === void 0 ? void 0 : g.event) ===
                '*' ||
              ((y =
                (m = f.filter) === null || m === void 0 ? void 0 : m.event) ===
                null || y === void 0
                ? void 0
                : y.toLocaleLowerCase()) === a
            )
          })
          .map(f => f.callback(p, s))
      : (i = this.bindings[a]) === null ||
        i === void 0 ||
        i
          .filter(f => {
            var g, m, y, x, b, w
            if (['broadcast', 'presence', 'postgres_changes'].includes(a))
              if ('id' in f) {
                const v = f.id,
                  A = (g = f.filter) === null || g === void 0 ? void 0 : g.event
                return (
                  v &&
                  ((m = t.ids) === null || m === void 0
                    ? void 0
                    : m.includes(v)) &&
                  (A === '*' ||
                    A?.toLocaleLowerCase() ===
                      ((y = t.data) === null || y === void 0
                        ? void 0
                        : y.type.toLocaleLowerCase()))
                )
              } else {
                const v =
                  (b =
                    (x = f?.filter) === null || x === void 0
                      ? void 0
                      : x.event) === null || b === void 0
                    ? void 0
                    : b.toLocaleLowerCase()
                return (
                  v === '*' ||
                  v ===
                    ((w = t?.event) === null || w === void 0
                      ? void 0
                      : w.toLocaleLowerCase())
                )
              }
            else return f.type.toLocaleLowerCase() === a
          })
          .map(f => {
            if (typeof p == 'object' && 'ids' in p) {
              const g = p.data,
                {
                  schema: m,
                  table: y,
                  commit_timestamp: x,
                  type: b,
                  errors: w,
                } = g
              p = Object.assign(
                Object.assign(
                  {},
                  {
                    schema: m,
                    table: y,
                    commit_timestamp: x,
                    eventType: b,
                    new: {},
                    old: {},
                    errors: w,
                  }
                ),
                this._getPayloadRecords(g)
              )
            }
            f.callback(p, s)
          })
  }
  _isClosed() {
    return this.state === B.closed
  }
  _isJoined() {
    return this.state === B.joined
  }
  _isJoining() {
    return this.state === B.joining
  }
  _isLeaving() {
    return this.state === B.leaving
  }
  _replyEventName(e) {
    return `chan_reply_${e}`
  }
  _on(e, t, s) {
    const n = e.toLocaleLowerCase(),
      i = { type: n, filter: t, callback: s }
    return (
      this.bindings[n] ? this.bindings[n].push(i) : (this.bindings[n] = [i]),
      this
    )
  }
  _off(e, t) {
    const s = e.toLocaleLowerCase()
    return (
      this.bindings[s] &&
        (this.bindings[s] = this.bindings[s].filter(n => {
          var i
          return !(
            ((i = n.type) === null || i === void 0
              ? void 0
              : i.toLocaleLowerCase()) === s && Ss.isEqual(n.filter, t)
          )
        })),
      this
    )
  }
  static isEqual(e, t) {
    if (Object.keys(e).length !== Object.keys(t).length) return !1
    for (const s in e) if (e[s] !== t[s]) return !1
    return !0
  }
  _rejoinUntilConnected() {
    ;(this.rejoinTimer.scheduleTimeout(),
      this.socket.isConnected() && this._rejoin())
  }
  _onClose(e) {
    this._on(ee.close, {}, e)
  }
  _onError(e) {
    this._on(ee.error, {}, t => e(t))
  }
  _canPush() {
    return this.socket.isConnected() && this._isJoined()
  }
  _rejoin(e = this.timeout) {
    this._isLeaving() ||
      (this.socket._leaveOpenTopic(this.topic),
      (this.state = B.joining),
      this.joinPush.resend(e))
  }
  _getPayloadRecords(e) {
    const t = { new: {}, old: {} }
    return (
      (e.type === 'INSERT' || e.type === 'UPDATE') &&
        (t.new = Ms(e.columns, e.record)),
      (e.type === 'UPDATE' || e.type === 'DELETE') &&
        (t.old = Ms(e.columns, e.old_record)),
      t
    )
  }
}
const Ut = () => {},
  ft = {
    HEARTBEAT_INTERVAL: 25e3,
    RECONNECT_DELAY: 10,
    HEARTBEAT_TIMEOUT_FALLBACK: 100,
  },
  Oi = [1e3, 2e3, 5e3, 1e4],
  Ri = 1e4,
  $i = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`
class Li {
  constructor(e, t) {
    var s
    if (
      ((this.accessTokenValue = null),
      (this.apiKey = null),
      (this.channels = new Array()),
      (this.endPoint = ''),
      (this.httpEndpoint = ''),
      (this.headers = {}),
      (this.params = {}),
      (this.timeout = ss),
      (this.transport = null),
      (this.heartbeatIntervalMs = ft.HEARTBEAT_INTERVAL),
      (this.heartbeatTimer = void 0),
      (this.pendingHeartbeatRef = null),
      (this.heartbeatCallback = Ut),
      (this.ref = 0),
      (this.reconnectTimer = null),
      (this.logger = Ut),
      (this.conn = null),
      (this.sendBuffer = []),
      (this.serializer = new Ei()),
      (this.stateChangeCallbacks = {
        open: [],
        close: [],
        error: [],
        message: [],
      }),
      (this.accessToken = null),
      (this._connectionState = 'disconnected'),
      (this._wasManualDisconnect = !1),
      (this._authPromise = null),
      (this._resolveFetch = n => {
        let i
        return (
          n
            ? (i = n)
            : typeof fetch > 'u'
              ? (i = (...a) =>
                  st(
                    async () => {
                      const { default: l } = await Promise.resolve().then(
                        () => ze
                      )
                      return { default: l }
                    },
                    void 0
                  )
                    .then(({ default: l }) => l(...a))
                    .catch(l => {
                      throw new Error(
                        `Failed to load @supabase/node-fetch: ${l.message}. This is required for HTTP requests in Node.js environments without native fetch.`
                      )
                    }))
              : (i = fetch),
          (...a) => i(...a)
        )
      }),
      !(!((s = t?.params) === null || s === void 0) && s.apikey))
    )
      throw new Error('API key is required to connect to Realtime')
    ;((this.apiKey = t.params.apikey),
      (this.endPoint = `${e}/${rs.websocket}`),
      (this.httpEndpoint = zr(e)),
      this._initializeOptions(t),
      this._setupReconnectionTimer(),
      (this.fetch = this._resolveFetch(t?.fetch)))
  }
  connect() {
    if (
      !(
        this.isConnecting() ||
        this.isDisconnecting() ||
        (this.conn !== null && this.isConnected())
      )
    ) {
      if (
        (this._setConnectionState('connecting'),
        this._setAuthSafely('connect'),
        this.transport)
      )
        this.conn = new this.transport(this.endpointURL())
      else
        try {
          this.conn = wi.createWebSocket(this.endpointURL())
        } catch (e) {
          this._setConnectionState('disconnected')
          const t = e.message
          throw t.includes('Node.js')
            ? new Error(`${t}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`)
            : new Error(`WebSocket not available: ${t}`)
        }
      this._setupConnectionHandlers()
    }
  }
  endpointURL() {
    return this._appendParams(
      this.endPoint,
      Object.assign({}, this.params, { vsn: ji })
    )
  }
  disconnect(e, t) {
    if (!this.isDisconnecting())
      if ((this._setConnectionState('disconnecting', !0), this.conn)) {
        const s = setTimeout(() => {
          this._setConnectionState('disconnected')
        }, 100)
        ;((this.conn.onclose = () => {
          ;(clearTimeout(s), this._setConnectionState('disconnected'))
        }),
          e ? this.conn.close(e, t ?? '') : this.conn.close(),
          this._teardownConnection())
      } else this._setConnectionState('disconnected')
  }
  getChannels() {
    return this.channels
  }
  async removeChannel(e) {
    const t = await e.unsubscribe()
    return (this.channels.length === 0 && this.disconnect(), t)
  }
  async removeAllChannels() {
    const e = await Promise.all(this.channels.map(t => t.unsubscribe()))
    return ((this.channels = []), this.disconnect(), e)
  }
  log(e, t, s) {
    this.logger(e, t, s)
  }
  connectionState() {
    switch (this.conn && this.conn.readyState) {
      case Qe.connecting:
        return ye.Connecting
      case Qe.open:
        return ye.Open
      case Qe.closing:
        return ye.Closing
      default:
        return ye.Closed
    }
  }
  isConnected() {
    return this.connectionState() === ye.Open
  }
  isConnecting() {
    return this._connectionState === 'connecting'
  }
  isDisconnecting() {
    return this._connectionState === 'disconnecting'
  }
  channel(e, t = { config: {} }) {
    const s = `realtime:${e}`,
      n = this.getChannels().find(i => i.topic === s)
    if (n) return n
    {
      const i = new Ss(`realtime:${e}`, t, this)
      return (this.channels.push(i), i)
    }
  }
  push(e) {
    const { topic: t, event: s, payload: n, ref: i } = e,
      a = () => {
        this.encode(e, l => {
          var c
          ;(c = this.conn) === null || c === void 0 || c.send(l)
        })
      }
    ;(this.log('push', `${t} ${s} (${i})`, n),
      this.isConnected() ? a() : this.sendBuffer.push(a))
  }
  async setAuth(e = null) {
    this._authPromise = this._performAuth(e)
    try {
      await this._authPromise
    } finally {
      this._authPromise = null
    }
  }
  async sendHeartbeat() {
    var e
    if (!this.isConnected()) {
      try {
        this.heartbeatCallback('disconnected')
      } catch (t) {
        this.log('error', 'error in heartbeat callback', t)
      }
      return
    }
    if (this.pendingHeartbeatRef) {
      ;((this.pendingHeartbeatRef = null),
        this.log(
          'transport',
          'heartbeat timeout. Attempting to re-establish connection'
        ))
      try {
        this.heartbeatCallback('timeout')
      } catch (t) {
        this.log('error', 'error in heartbeat callback', t)
      }
      ;((this._wasManualDisconnect = !1),
        (e = this.conn) === null ||
          e === void 0 ||
          e.close(Si, 'heartbeat timeout'),
        setTimeout(() => {
          var t
          this.isConnected() ||
            (t = this.reconnectTimer) === null ||
            t === void 0 ||
            t.scheduleTimeout()
        }, ft.HEARTBEAT_TIMEOUT_FALLBACK))
      return
    }
    ;((this.pendingHeartbeatRef = this._makeRef()),
      this.push({
        topic: 'phoenix',
        event: 'heartbeat',
        payload: {},
        ref: this.pendingHeartbeatRef,
      }))
    try {
      this.heartbeatCallback('sent')
    } catch (t) {
      this.log('error', 'error in heartbeat callback', t)
    }
    this._setAuthSafely('heartbeat')
  }
  onHeartbeat(e) {
    this.heartbeatCallback = e
  }
  flushSendBuffer() {
    this.isConnected() &&
      this.sendBuffer.length > 0 &&
      (this.sendBuffer.forEach(e => e()), (this.sendBuffer = []))
  }
  _makeRef() {
    let e = this.ref + 1
    return (
      e === this.ref ? (this.ref = 0) : (this.ref = e),
      this.ref.toString()
    )
  }
  _leaveOpenTopic(e) {
    let t = this.channels.find(
      s => s.topic === e && (s._isJoined() || s._isJoining())
    )
    t &&
      (this.log('transport', `leaving duplicate topic "${e}"`), t.unsubscribe())
  }
  _remove(e) {
    this.channels = this.channels.filter(t => t.topic !== e.topic)
  }
  _onConnMessage(e) {
    this.decode(e.data, t => {
      if (t.topic === 'phoenix' && t.event === 'phx_reply')
        try {
          this.heartbeatCallback(t.payload.status === 'ok' ? 'ok' : 'error')
        } catch (d) {
          this.log('error', 'error in heartbeat callback', d)
        }
      t.ref &&
        t.ref === this.pendingHeartbeatRef &&
        (this.pendingHeartbeatRef = null)
      const { topic: s, event: n, payload: i, ref: a } = t,
        l = a ? `(${a})` : '',
        c = i.status || ''
      ;(this.log('receive', `${c} ${s} ${n} ${l}`.trim(), i),
        this.channels
          .filter(d => d._isMember(s))
          .forEach(d => d._trigger(n, i, a)),
        this._triggerStateCallbacks('message', t))
    })
  }
  _clearTimer(e) {
    var t
    e === 'heartbeat' && this.heartbeatTimer
      ? (clearInterval(this.heartbeatTimer), (this.heartbeatTimer = void 0))
      : e === 'reconnect' &&
        ((t = this.reconnectTimer) === null || t === void 0 || t.reset())
  }
  _clearAllTimers() {
    ;(this._clearTimer('heartbeat'), this._clearTimer('reconnect'))
  }
  _setupConnectionHandlers() {
    this.conn &&
      ('binaryType' in this.conn && (this.conn.binaryType = 'arraybuffer'),
      (this.conn.onopen = () => this._onConnOpen()),
      (this.conn.onerror = e => this._onConnError(e)),
      (this.conn.onmessage = e => this._onConnMessage(e)),
      (this.conn.onclose = e => this._onConnClose(e)))
  }
  _teardownConnection() {
    ;(this.conn &&
      ((this.conn.onopen = null),
      (this.conn.onerror = null),
      (this.conn.onmessage = null),
      (this.conn.onclose = null),
      (this.conn = null)),
      this._clearAllTimers(),
      this.channels.forEach(e => e.teardown()))
  }
  _onConnOpen() {
    ;(this._setConnectionState('connected'),
      this.log('transport', `connected to ${this.endpointURL()}`),
      this.flushSendBuffer(),
      this._clearTimer('reconnect'),
      this.worker
        ? this.workerRef || this._startWorkerHeartbeat()
        : this._startHeartbeat(),
      this._triggerStateCallbacks('open'))
  }
  _startHeartbeat() {
    ;(this.heartbeatTimer && clearInterval(this.heartbeatTimer),
      (this.heartbeatTimer = setInterval(
        () => this.sendHeartbeat(),
        this.heartbeatIntervalMs
      )))
  }
  _startWorkerHeartbeat() {
    this.workerUrl
      ? this.log('worker', `starting worker for from ${this.workerUrl}`)
      : this.log('worker', 'starting default worker')
    const e = this._workerObjectUrl(this.workerUrl)
    ;((this.workerRef = new Worker(e)),
      (this.workerRef.onerror = t => {
        ;(this.log('worker', 'worker error', t.message),
          this.workerRef.terminate())
      }),
      (this.workerRef.onmessage = t => {
        t.data.event === 'keepAlive' && this.sendHeartbeat()
      }),
      this.workerRef.postMessage({
        event: 'start',
        interval: this.heartbeatIntervalMs,
      }))
  }
  _onConnClose(e) {
    var t
    ;(this._setConnectionState('disconnected'),
      this.log('transport', 'close', e),
      this._triggerChanError(),
      this._clearTimer('heartbeat'),
      this._wasManualDisconnect ||
        (t = this.reconnectTimer) === null ||
        t === void 0 ||
        t.scheduleTimeout(),
      this._triggerStateCallbacks('close', e))
  }
  _onConnError(e) {
    ;(this._setConnectionState('disconnected'),
      this.log('transport', `${e}`),
      this._triggerChanError(),
      this._triggerStateCallbacks('error', e))
  }
  _triggerChanError() {
    this.channels.forEach(e => e._trigger(ee.error))
  }
  _appendParams(e, t) {
    if (Object.keys(t).length === 0) return e
    const s = e.match(/\?/) ? '&' : '?',
      n = new URLSearchParams(t)
    return `${e}${s}${n}`
  }
  _workerObjectUrl(e) {
    let t
    if (e) t = e
    else {
      const s = new Blob([$i], { type: 'application/javascript' })
      t = URL.createObjectURL(s)
    }
    return t
  }
  _setConnectionState(e, t = !1) {
    ;((this._connectionState = e),
      e === 'connecting'
        ? (this._wasManualDisconnect = !1)
        : e === 'disconnecting' && (this._wasManualDisconnect = t))
  }
  async _performAuth(e = null) {
    let t
    ;(e
      ? (t = e)
      : this.accessToken
        ? (t = await this.accessToken())
        : (t = this.accessTokenValue),
      this.accessTokenValue != t &&
        ((this.accessTokenValue = t),
        this.channels.forEach(s => {
          const n = { access_token: t, version: ki }
          ;(t && s.updateJoinPayload(n),
            s.joinedOnce &&
              s._isJoined() &&
              s._push(ee.access_token, { access_token: t }))
        })))
  }
  async _waitForAuthIfNeeded() {
    this._authPromise && (await this._authPromise)
  }
  _setAuthSafely(e = 'general') {
    this.setAuth().catch(t => {
      this.log('error', `error setting auth in ${e}`, t)
    })
  }
  _triggerStateCallbacks(e, t) {
    try {
      this.stateChangeCallbacks[e].forEach(s => {
        try {
          s(t)
        } catch (n) {
          this.log('error', `error in ${e} callback`, n)
        }
      })
    } catch (s) {
      this.log('error', `error triggering ${e} callbacks`, s)
    }
  }
  _setupReconnectionTimer() {
    this.reconnectTimer = new Mr(async () => {
      setTimeout(async () => {
        ;(await this._waitForAuthIfNeeded(),
          this.isConnected() || this.connect())
      }, ft.RECONNECT_DELAY)
    }, this.reconnectAfterMs)
  }
  _initializeOptions(e) {
    var t, s, n, i, a, l, c, d, u
    if (
      ((this.transport =
        (t = e?.transport) !== null && t !== void 0 ? t : null),
      (this.timeout = (s = e?.timeout) !== null && s !== void 0 ? s : ss),
      (this.heartbeatIntervalMs =
        (n = e?.heartbeatIntervalMs) !== null && n !== void 0
          ? n
          : ft.HEARTBEAT_INTERVAL),
      (this.worker = (i = e?.worker) !== null && i !== void 0 ? i : !1),
      (this.accessToken =
        (a = e?.accessToken) !== null && a !== void 0 ? a : null),
      (this.heartbeatCallback =
        (l = e?.heartbeatCallback) !== null && l !== void 0 ? l : Ut),
      e?.params && (this.params = e.params),
      e?.logger && (this.logger = e.logger),
      (e?.logLevel || e?.log_level) &&
        ((this.logLevel = e.logLevel || e.log_level),
        (this.params = Object.assign(Object.assign({}, this.params), {
          log_level: this.logLevel,
        }))),
      (this.reconnectAfterMs =
        (c = e?.reconnectAfterMs) !== null && c !== void 0
          ? c
          : h => Oi[h - 1] || Ri),
      (this.encode =
        (d = e?.encode) !== null && d !== void 0
          ? d
          : (h, p) => p(JSON.stringify(h))),
      (this.decode =
        (u = e?.decode) !== null && u !== void 0
          ? u
          : this.serializer.decode.bind(this.serializer)),
      this.worker)
    ) {
      if (typeof window < 'u' && !window.Worker)
        throw new Error('Web Worker is not supported')
      this.workerUrl = e?.workerUrl
    }
  }
}
class Cs extends Error {
  constructor(e) {
    ;(super(e), (this.__isStorageError = !0), (this.name = 'StorageError'))
  }
}
function H(r) {
  return typeof r == 'object' && r !== null && '__isStorageError' in r
}
class Fi extends Cs {
  constructor(e, t, s) {
    ;(super(e),
      (this.name = 'StorageApiError'),
      (this.status = t),
      (this.statusCode = s))
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusCode: this.statusCode,
    }
  }
}
class is extends Cs {
  constructor(e, t) {
    ;(super(e), (this.name = 'StorageUnknownError'), (this.originalError = t))
  }
}
var Mi = function (r, e, t, s) {
  function n(i) {
    return i instanceof t
      ? i
      : new t(function (a) {
          a(i)
        })
  }
  return new (t || (t = Promise))(function (i, a) {
    function l(u) {
      try {
        d(s.next(u))
      } catch (h) {
        a(h)
      }
    }
    function c(u) {
      try {
        d(s.throw(u))
      } catch (h) {
        a(h)
      }
    }
    function d(u) {
      u.done ? i(u.value) : n(u.value).then(l, c)
    }
    d((s = s.apply(r, e || [])).next())
  })
}
const qr = r => {
    let e
    return (
      r
        ? (e = r)
        : typeof fetch > 'u'
          ? (e = (...t) =>
              st(
                async () => {
                  const { default: s } = await Promise.resolve().then(() => ze)
                  return { default: s }
                },
                void 0
              ).then(({ default: s }) => s(...t)))
          : (e = fetch),
      (...t) => e(...t)
    )
  },
  Ui = () =>
    Mi(void 0, void 0, void 0, function* () {
      return typeof Response > 'u'
        ? (yield st(() => Promise.resolve().then(() => ze), void 0)).Response
        : Response
    }),
  as = r => {
    if (Array.isArray(r)) return r.map(t => as(t))
    if (typeof r == 'function' || r !== Object(r)) return r
    const e = {}
    return (
      Object.entries(r).forEach(([t, s]) => {
        const n = t.replace(/([-_][a-z])/gi, i =>
          i.toUpperCase().replace(/[-_]/g, '')
        )
        e[n] = as(s)
      }),
      e
    )
  },
  zi = r => {
    if (typeof r != 'object' || r === null) return !1
    const e = Object.getPrototypeOf(r)
    return (
      (e === null ||
        e === Object.prototype ||
        Object.getPrototypeOf(e) === null) &&
      !(Symbol.toStringTag in r) &&
      !(Symbol.iterator in r)
    )
  }
var ve = function (r, e, t, s) {
  function n(i) {
    return i instanceof t
      ? i
      : new t(function (a) {
          a(i)
        })
  }
  return new (t || (t = Promise))(function (i, a) {
    function l(u) {
      try {
        d(s.next(u))
      } catch (h) {
        a(h)
      }
    }
    function c(u) {
      try {
        d(s.throw(u))
      } catch (h) {
        a(h)
      }
    }
    function d(u) {
      u.done ? i(u.value) : n(u.value).then(l, c)
    }
    d((s = s.apply(r, e || [])).next())
  })
}
const zt = r =>
    r.msg || r.message || r.error_description || r.error || JSON.stringify(r),
  qi = (r, e, t) =>
    ve(void 0, void 0, void 0, function* () {
      const s = yield Ui()
      r instanceof s && !t?.noResolveJson
        ? r
            .json()
            .then(n => {
              const i = r.status || 500,
                a = n?.statusCode || i + ''
              e(new Fi(zt(n), i, a))
            })
            .catch(n => {
              e(new is(zt(n), n))
            })
        : e(new is(zt(r), r))
    }),
  Bi = (r, e, t, s) => {
    const n = { method: r, headers: e?.headers || {} }
    return r === 'GET' || !s
      ? n
      : (zi(s)
          ? ((n.headers = Object.assign(
              { 'Content-Type': 'application/json' },
              e?.headers
            )),
            (n.body = JSON.stringify(s)))
          : (n.body = s),
        e?.duplex && (n.duplex = e.duplex),
        Object.assign(Object.assign({}, n), t))
  }
function nt(r, e, t, s, n, i) {
  return ve(this, void 0, void 0, function* () {
    return new Promise((a, l) => {
      r(t, Bi(e, s, n, i))
        .then(c => {
          if (!c.ok) throw c
          return s?.noResolveJson ? c : c.json()
        })
        .then(c => a(c))
        .catch(c => qi(c, l, s))
    })
  })
}
function Ct(r, e, t, s) {
  return ve(this, void 0, void 0, function* () {
    return nt(r, 'GET', e, t, s)
  })
}
function re(r, e, t, s, n) {
  return ve(this, void 0, void 0, function* () {
    return nt(r, 'POST', e, s, n, t)
  })
}
function os(r, e, t, s, n) {
  return ve(this, void 0, void 0, function* () {
    return nt(r, 'PUT', e, s, n, t)
  })
}
function Hi(r, e, t, s) {
  return ve(this, void 0, void 0, function* () {
    return nt(
      r,
      'HEAD',
      e,
      Object.assign(Object.assign({}, t), { noResolveJson: !0 }),
      s
    )
  })
}
function Br(r, e, t, s, n) {
  return ve(this, void 0, void 0, function* () {
    return nt(r, 'DELETE', e, s, n, t)
  })
}
var K = function (r, e, t, s) {
  function n(i) {
    return i instanceof t
      ? i
      : new t(function (a) {
          a(i)
        })
  }
  return new (t || (t = Promise))(function (i, a) {
    function l(u) {
      try {
        d(s.next(u))
      } catch (h) {
        a(h)
      }
    }
    function c(u) {
      try {
        d(s.throw(u))
      } catch (h) {
        a(h)
      }
    }
    function d(u) {
      u.done ? i(u.value) : n(u.value).then(l, c)
    }
    d((s = s.apply(r, e || [])).next())
  })
}
const Gi = { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } },
  qs = {
    cacheControl: '3600',
    contentType: 'text/plain;charset=UTF-8',
    upsert: !1,
  }
class Wi {
  constructor(e, t = {}, s, n) {
    ;((this.shouldThrowOnError = !1),
      (this.url = e),
      (this.headers = t),
      (this.bucketId = s),
      (this.fetch = qr(n)))
  }
  throwOnError() {
    return ((this.shouldThrowOnError = !0), this)
  }
  uploadOrUpdate(e, t, s, n) {
    return K(this, void 0, void 0, function* () {
      try {
        let i
        const a = Object.assign(Object.assign({}, qs), n)
        let l = Object.assign(
          Object.assign({}, this.headers),
          e === 'POST' && { 'x-upsert': String(a.upsert) }
        )
        const c = a.metadata
        ;(typeof Blob < 'u' && s instanceof Blob
          ? ((i = new FormData()),
            i.append('cacheControl', a.cacheControl),
            c && i.append('metadata', this.encodeMetadata(c)),
            i.append('', s))
          : typeof FormData < 'u' && s instanceof FormData
            ? ((i = s),
              i.append('cacheControl', a.cacheControl),
              c && i.append('metadata', this.encodeMetadata(c)))
            : ((i = s),
              (l['cache-control'] = `max-age=${a.cacheControl}`),
              (l['content-type'] = a.contentType),
              c && (l['x-metadata'] = this.toBase64(this.encodeMetadata(c)))),
          n?.headers && (l = Object.assign(Object.assign({}, l), n.headers)))
        const d = this._removeEmptyFolders(t),
          u = this._getFinalPath(d),
          h = yield (e == 'PUT' ? os : re)(
            this.fetch,
            `${this.url}/object/${u}`,
            i,
            Object.assign({ headers: l }, a?.duplex ? { duplex: a.duplex } : {})
          )
        return { data: { path: d, id: h.Id, fullPath: h.Key }, error: null }
      } catch (i) {
        if (this.shouldThrowOnError) throw i
        if (H(i)) return { data: null, error: i }
        throw i
      }
    })
  }
  upload(e, t, s) {
    return K(this, void 0, void 0, function* () {
      return this.uploadOrUpdate('POST', e, t, s)
    })
  }
  uploadToSignedUrl(e, t, s, n) {
    return K(this, void 0, void 0, function* () {
      const i = this._removeEmptyFolders(e),
        a = this._getFinalPath(i),
        l = new URL(this.url + `/object/upload/sign/${a}`)
      l.searchParams.set('token', t)
      try {
        let c
        const d = Object.assign({ upsert: qs.upsert }, n),
          u = Object.assign(Object.assign({}, this.headers), {
            'x-upsert': String(d.upsert),
          })
        typeof Blob < 'u' && s instanceof Blob
          ? ((c = new FormData()),
            c.append('cacheControl', d.cacheControl),
            c.append('', s))
          : typeof FormData < 'u' && s instanceof FormData
            ? ((c = s), c.append('cacheControl', d.cacheControl))
            : ((c = s),
              (u['cache-control'] = `max-age=${d.cacheControl}`),
              (u['content-type'] = d.contentType))
        const h = yield os(this.fetch, l.toString(), c, { headers: u })
        return { data: { path: i, fullPath: h.Key }, error: null }
      } catch (c) {
        if (this.shouldThrowOnError) throw c
        if (H(c)) return { data: null, error: c }
        throw c
      }
    })
  }
  createSignedUploadUrl(e, t) {
    return K(this, void 0, void 0, function* () {
      try {
        let s = this._getFinalPath(e)
        const n = Object.assign({}, this.headers)
        t?.upsert && (n['x-upsert'] = 'true')
        const i = yield re(
            this.fetch,
            `${this.url}/object/upload/sign/${s}`,
            {},
            { headers: n }
          ),
          a = new URL(this.url + i.url),
          l = a.searchParams.get('token')
        if (!l) throw new Cs('No token returned by API')
        return {
          data: { signedUrl: a.toString(), path: e, token: l },
          error: null,
        }
      } catch (s) {
        if (this.shouldThrowOnError) throw s
        if (H(s)) return { data: null, error: s }
        throw s
      }
    })
  }
  update(e, t, s) {
    return K(this, void 0, void 0, function* () {
      return this.uploadOrUpdate('PUT', e, t, s)
    })
  }
  move(e, t, s) {
    return K(this, void 0, void 0, function* () {
      try {
        return {
          data: yield re(
            this.fetch,
            `${this.url}/object/move`,
            {
              bucketId: this.bucketId,
              sourceKey: e,
              destinationKey: t,
              destinationBucket: s?.destinationBucket,
            },
            { headers: this.headers }
          ),
          error: null,
        }
      } catch (n) {
        if (this.shouldThrowOnError) throw n
        if (H(n)) return { data: null, error: n }
        throw n
      }
    })
  }
  copy(e, t, s) {
    return K(this, void 0, void 0, function* () {
      try {
        return {
          data: {
            path: (yield re(
              this.fetch,
              `${this.url}/object/copy`,
              {
                bucketId: this.bucketId,
                sourceKey: e,
                destinationKey: t,
                destinationBucket: s?.destinationBucket,
              },
              { headers: this.headers }
            )).Key,
          },
          error: null,
        }
      } catch (n) {
        if (this.shouldThrowOnError) throw n
        if (H(n)) return { data: null, error: n }
        throw n
      }
    })
  }
  createSignedUrl(e, t, s) {
    return K(this, void 0, void 0, function* () {
      try {
        let n = this._getFinalPath(e),
          i = yield re(
            this.fetch,
            `${this.url}/object/sign/${n}`,
            Object.assign(
              { expiresIn: t },
              s?.transform ? { transform: s.transform } : {}
            ),
            { headers: this.headers }
          )
        const a = s?.download
          ? `&download=${s.download === !0 ? '' : s.download}`
          : ''
        return (
          (i = { signedUrl: encodeURI(`${this.url}${i.signedURL}${a}`) }),
          { data: i, error: null }
        )
      } catch (n) {
        if (this.shouldThrowOnError) throw n
        if (H(n)) return { data: null, error: n }
        throw n
      }
    })
  }
  createSignedUrls(e, t, s) {
    return K(this, void 0, void 0, function* () {
      try {
        const n = yield re(
            this.fetch,
            `${this.url}/object/sign/${this.bucketId}`,
            { expiresIn: t, paths: e },
            { headers: this.headers }
          ),
          i = s?.download
            ? `&download=${s.download === !0 ? '' : s.download}`
            : ''
        return {
          data: n.map(a =>
            Object.assign(Object.assign({}, a), {
              signedUrl: a.signedURL
                ? encodeURI(`${this.url}${a.signedURL}${i}`)
                : null,
            })
          ),
          error: null,
        }
      } catch (n) {
        if (this.shouldThrowOnError) throw n
        if (H(n)) return { data: null, error: n }
        throw n
      }
    })
  }
  download(e, t) {
    return K(this, void 0, void 0, function* () {
      const n =
          typeof t?.transform < 'u' ? 'render/image/authenticated' : 'object',
        i = this.transformOptsToQueryString(t?.transform || {}),
        a = i ? `?${i}` : ''
      try {
        const l = this._getFinalPath(e)
        return {
          data: yield (yield Ct(this.fetch, `${this.url}/${n}/${l}${a}`, {
            headers: this.headers,
            noResolveJson: !0,
          })).blob(),
          error: null,
        }
      } catch (l) {
        if (this.shouldThrowOnError) throw l
        if (H(l)) return { data: null, error: l }
        throw l
      }
    })
  }
  info(e) {
    return K(this, void 0, void 0, function* () {
      const t = this._getFinalPath(e)
      try {
        const s = yield Ct(this.fetch, `${this.url}/object/info/${t}`, {
          headers: this.headers,
        })
        return { data: as(s), error: null }
      } catch (s) {
        if (this.shouldThrowOnError) throw s
        if (H(s)) return { data: null, error: s }
        throw s
      }
    })
  }
  exists(e) {
    return K(this, void 0, void 0, function* () {
      const t = this._getFinalPath(e)
      try {
        return (
          yield Hi(this.fetch, `${this.url}/object/${t}`, {
            headers: this.headers,
          }),
          { data: !0, error: null }
        )
      } catch (s) {
        if (this.shouldThrowOnError) throw s
        if (H(s) && s instanceof is) {
          const n = s.originalError
          if ([400, 404].includes(n?.status)) return { data: !1, error: s }
        }
        throw s
      }
    })
  }
  getPublicUrl(e, t) {
    const s = this._getFinalPath(e),
      n = [],
      i = t?.download ? `download=${t.download === !0 ? '' : t.download}` : ''
    i !== '' && n.push(i)
    const l = typeof t?.transform < 'u' ? 'render/image' : 'object',
      c = this.transformOptsToQueryString(t?.transform || {})
    c !== '' && n.push(c)
    let d = n.join('&')
    return (
      d !== '' && (d = `?${d}`),
      { data: { publicUrl: encodeURI(`${this.url}/${l}/public/${s}${d}`) } }
    )
  }
  remove(e) {
    return K(this, void 0, void 0, function* () {
      try {
        return {
          data: yield Br(
            this.fetch,
            `${this.url}/object/${this.bucketId}`,
            { prefixes: e },
            { headers: this.headers }
          ),
          error: null,
        }
      } catch (t) {
        if (this.shouldThrowOnError) throw t
        if (H(t)) return { data: null, error: t }
        throw t
      }
    })
  }
  list(e, t, s) {
    return K(this, void 0, void 0, function* () {
      try {
        const n = Object.assign(Object.assign(Object.assign({}, Gi), t), {
          prefix: e || '',
        })
        return {
          data: yield re(
            this.fetch,
            `${this.url}/object/list/${this.bucketId}`,
            n,
            { headers: this.headers },
            s
          ),
          error: null,
        }
      } catch (n) {
        if (this.shouldThrowOnError) throw n
        if (H(n)) return { data: null, error: n }
        throw n
      }
    })
  }
  listV2(e, t) {
    return K(this, void 0, void 0, function* () {
      try {
        const s = Object.assign({}, e)
        return {
          data: yield re(
            this.fetch,
            `${this.url}/object/list-v2/${this.bucketId}`,
            s,
            { headers: this.headers },
            t
          ),
          error: null,
        }
      } catch (s) {
        if (this.shouldThrowOnError) throw s
        if (H(s)) return { data: null, error: s }
        throw s
      }
    })
  }
  encodeMetadata(e) {
    return JSON.stringify(e)
  }
  toBase64(e) {
    return typeof Buffer < 'u' ? Buffer.from(e).toString('base64') : btoa(e)
  }
  _getFinalPath(e) {
    return `${this.bucketId}/${e.replace(/^\/+/, '')}`
  }
  _removeEmptyFolders(e) {
    return e.replace(/^\/|\/$/g, '').replace(/\/+/g, '/')
  }
  transformOptsToQueryString(e) {
    const t = []
    return (
      e.width && t.push(`width=${e.width}`),
      e.height && t.push(`height=${e.height}`),
      e.resize && t.push(`resize=${e.resize}`),
      e.format && t.push(`format=${e.format}`),
      e.quality && t.push(`quality=${e.quality}`),
      t.join('&')
    )
  }
}
const Vi = '2.12.1',
  Ki = { 'X-Client-Info': `storage-js/${Vi}` }
var Se = function (r, e, t, s) {
  function n(i) {
    return i instanceof t
      ? i
      : new t(function (a) {
          a(i)
        })
  }
  return new (t || (t = Promise))(function (i, a) {
    function l(u) {
      try {
        d(s.next(u))
      } catch (h) {
        a(h)
      }
    }
    function c(u) {
      try {
        d(s.throw(u))
      } catch (h) {
        a(h)
      }
    }
    function d(u) {
      u.done ? i(u.value) : n(u.value).then(l, c)
    }
    d((s = s.apply(r, e || [])).next())
  })
}
class Ji {
  constructor(e, t = {}, s, n) {
    this.shouldThrowOnError = !1
    const i = new URL(e)
    ;(n?.useNewHostname &&
      /supabase\.(co|in|red)$/.test(i.hostname) &&
      !i.hostname.includes('storage.supabase.') &&
      (i.hostname = i.hostname.replace('supabase.', 'storage.supabase.')),
      (this.url = i.href),
      (this.headers = Object.assign(Object.assign({}, Ki), t)),
      (this.fetch = qr(s)))
  }
  throwOnError() {
    return ((this.shouldThrowOnError = !0), this)
  }
  listBuckets() {
    return Se(this, void 0, void 0, function* () {
      try {
        return {
          data: yield Ct(this.fetch, `${this.url}/bucket`, {
            headers: this.headers,
          }),
          error: null,
        }
      } catch (e) {
        if (this.shouldThrowOnError) throw e
        if (H(e)) return { data: null, error: e }
        throw e
      }
    })
  }
  getBucket(e) {
    return Se(this, void 0, void 0, function* () {
      try {
        return {
          data: yield Ct(this.fetch, `${this.url}/bucket/${e}`, {
            headers: this.headers,
          }),
          error: null,
        }
      } catch (t) {
        if (this.shouldThrowOnError) throw t
        if (H(t)) return { data: null, error: t }
        throw t
      }
    })
  }
  createBucket(e, t = { public: !1 }) {
    return Se(this, void 0, void 0, function* () {
      try {
        return {
          data: yield re(
            this.fetch,
            `${this.url}/bucket`,
            {
              id: e,
              name: e,
              type: t.type,
              public: t.public,
              file_size_limit: t.fileSizeLimit,
              allowed_mime_types: t.allowedMimeTypes,
            },
            { headers: this.headers }
          ),
          error: null,
        }
      } catch (s) {
        if (this.shouldThrowOnError) throw s
        if (H(s)) return { data: null, error: s }
        throw s
      }
    })
  }
  updateBucket(e, t) {
    return Se(this, void 0, void 0, function* () {
      try {
        return {
          data: yield os(
            this.fetch,
            `${this.url}/bucket/${e}`,
            {
              id: e,
              name: e,
              public: t.public,
              file_size_limit: t.fileSizeLimit,
              allowed_mime_types: t.allowedMimeTypes,
            },
            { headers: this.headers }
          ),
          error: null,
        }
      } catch (s) {
        if (this.shouldThrowOnError) throw s
        if (H(s)) return { data: null, error: s }
        throw s
      }
    })
  }
  emptyBucket(e) {
    return Se(this, void 0, void 0, function* () {
      try {
        return {
          data: yield re(
            this.fetch,
            `${this.url}/bucket/${e}/empty`,
            {},
            { headers: this.headers }
          ),
          error: null,
        }
      } catch (t) {
        if (this.shouldThrowOnError) throw t
        if (H(t)) return { data: null, error: t }
        throw t
      }
    })
  }
  deleteBucket(e) {
    return Se(this, void 0, void 0, function* () {
      try {
        return {
          data: yield Br(
            this.fetch,
            `${this.url}/bucket/${e}`,
            {},
            { headers: this.headers }
          ),
          error: null,
        }
      } catch (t) {
        if (this.shouldThrowOnError) throw t
        if (H(t)) return { data: null, error: t }
        throw t
      }
    })
  }
}
class Qi extends Ji {
  constructor(e, t = {}, s, n) {
    super(e, t, s, n)
  }
  from(e) {
    return new Wi(this.url, this.headers, e, this.fetch)
  }
}
const Yi = '2.57.4'
let Ke = ''
typeof Deno < 'u'
  ? (Ke = 'deno')
  : typeof document < 'u'
    ? (Ke = 'web')
    : typeof navigator < 'u' && navigator.product === 'ReactNative'
      ? (Ke = 'react-native')
      : (Ke = 'node')
const Zi = { 'X-Client-Info': `supabase-js-${Ke}/${Yi}` },
  Xi = { headers: Zi },
  ea = { schema: 'public' },
  ta = {
    autoRefreshToken: !0,
    persistSession: !0,
    detectSessionInUrl: !0,
    flowType: 'implicit',
  },
  sa = {}
var ra = function (r, e, t, s) {
  function n(i) {
    return i instanceof t
      ? i
      : new t(function (a) {
          a(i)
        })
  }
  return new (t || (t = Promise))(function (i, a) {
    function l(u) {
      try {
        d(s.next(u))
      } catch (h) {
        a(h)
      }
    }
    function c(u) {
      try {
        d(s.throw(u))
      } catch (h) {
        a(h)
      }
    }
    function d(u) {
      u.done ? i(u.value) : n(u.value).then(l, c)
    }
    d((s = s.apply(r, e || [])).next())
  })
}
const na = r => {
    let e
    return (
      r ? (e = r) : typeof fetch > 'u' ? (e = Tr) : (e = fetch),
      (...t) => e(...t)
    )
  },
  ia = () => (typeof Headers > 'u' ? Nr : Headers),
  aa = (r, e, t) => {
    const s = na(t),
      n = ia()
    return (i, a) =>
      ra(void 0, void 0, void 0, function* () {
        var l
        const c = (l = yield e()) !== null && l !== void 0 ? l : r
        let d = new n(a?.headers)
        return (
          d.has('apikey') || d.set('apikey', r),
          d.has('Authorization') || d.set('Authorization', `Bearer ${c}`),
          s(i, Object.assign(Object.assign({}, a), { headers: d }))
        )
      })
  }
var oa = function (r, e, t, s) {
  function n(i) {
    return i instanceof t
      ? i
      : new t(function (a) {
          a(i)
        })
  }
  return new (t || (t = Promise))(function (i, a) {
    function l(u) {
      try {
        d(s.next(u))
      } catch (h) {
        a(h)
      }
    }
    function c(u) {
      try {
        d(s.throw(u))
      } catch (h) {
        a(h)
      }
    }
    function d(u) {
      u.done ? i(u.value) : n(u.value).then(l, c)
    }
    d((s = s.apply(r, e || [])).next())
  })
}
function la(r) {
  return r.endsWith('/') ? r : r + '/'
}
function ca(r, e) {
  var t, s
  const { db: n, auth: i, realtime: a, global: l } = r,
    { db: c, auth: d, realtime: u, global: h } = e,
    p = {
      db: Object.assign(Object.assign({}, c), n),
      auth: Object.assign(Object.assign({}, d), i),
      realtime: Object.assign(Object.assign({}, u), a),
      storage: {},
      global: Object.assign(Object.assign(Object.assign({}, h), l), {
        headers: Object.assign(
          Object.assign({}, (t = h?.headers) !== null && t !== void 0 ? t : {}),
          (s = l?.headers) !== null && s !== void 0 ? s : {}
        ),
      }),
      accessToken: () =>
        oa(this, void 0, void 0, function* () {
          return ''
        }),
    }
  return (
    r.accessToken ? (p.accessToken = r.accessToken) : delete p.accessToken,
    p
  )
}
function da(r) {
  const e = r?.trim()
  if (!e) throw new Error('supabaseUrl is required.')
  if (!e.match(/^https?:\/\//i))
    throw new Error('Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.')
  try {
    return new URL(la(e))
  } catch {
    throw Error('Invalid supabaseUrl: Provided URL is malformed.')
  }
}
const Hr = '2.71.1',
  De = 30 * 1e3,
  ls = 3,
  qt = ls * De,
  ua = 'http://localhost:9999',
  ha = 'supabase.auth.token',
  fa = { 'X-Client-Info': `gotrue-js/${Hr}` },
  cs = 'X-Supabase-Api-Version',
  Gr = {
    '2024-01-01': {
      timestamp: Date.parse('2024-01-01T00:00:00.0Z'),
      name: '2024-01-01',
    },
  },
  ma = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i,
  ga = 10 * 60 * 1e3
class Es extends Error {
  constructor(e, t, s) {
    ;(super(e),
      (this.__isAuthError = !0),
      (this.name = 'AuthError'),
      (this.status = t),
      (this.code = s))
  }
}
function T(r) {
  return typeof r == 'object' && r !== null && '__isAuthError' in r
}
class pa extends Es {
  constructor(e, t, s) {
    ;(super(e, t, s),
      (this.name = 'AuthApiError'),
      (this.status = t),
      (this.code = s))
  }
}
function ya(r) {
  return T(r) && r.name === 'AuthApiError'
}
class Wr extends Es {
  constructor(e, t) {
    ;(super(e), (this.name = 'AuthUnknownError'), (this.originalError = t))
  }
}
class he extends Es {
  constructor(e, t, s, n) {
    ;(super(e, s, n), (this.name = t), (this.status = s))
  }
}
class ce extends he {
  constructor() {
    super('Auth session missing!', 'AuthSessionMissingError', 400, void 0)
  }
}
function ba(r) {
  return T(r) && r.name === 'AuthSessionMissingError'
}
class mt extends he {
  constructor() {
    super(
      'Auth session or user missing',
      'AuthInvalidTokenResponseError',
      500,
      void 0
    )
  }
}
class gt extends he {
  constructor(e) {
    super(e, 'AuthInvalidCredentialsError', 400, void 0)
  }
}
class pt extends he {
  constructor(e, t = null) {
    ;(super(e, 'AuthImplicitGrantRedirectError', 500, void 0),
      (this.details = null),
      (this.details = t))
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details,
    }
  }
}
function va(r) {
  return T(r) && r.name === 'AuthImplicitGrantRedirectError'
}
class Bs extends he {
  constructor(e, t = null) {
    ;(super(e, 'AuthPKCEGrantCodeExchangeError', 500, void 0),
      (this.details = null),
      (this.details = t))
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details,
    }
  }
}
class ds extends he {
  constructor(e, t) {
    super(e, 'AuthRetryableFetchError', t, void 0)
  }
}
function Bt(r) {
  return T(r) && r.name === 'AuthRetryableFetchError'
}
class Hs extends he {
  constructor(e, t, s) {
    ;(super(e, 'AuthWeakPasswordError', t, 'weak_password'), (this.reasons = s))
  }
}
class us extends he {
  constructor(e) {
    super(e, 'AuthInvalidJwtError', 400, 'invalid_jwt')
  }
}
const Et =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split(
      ''
    ),
  Gs = ` 	
\r=`.split(''),
  xa = (() => {
    const r = new Array(128)
    for (let e = 0; e < r.length; e += 1) r[e] = -1
    for (let e = 0; e < Gs.length; e += 1) r[Gs[e].charCodeAt(0)] = -2
    for (let e = 0; e < Et.length; e += 1) r[Et[e].charCodeAt(0)] = e
    return r
  })()
function Ws(r, e, t) {
  if (r !== null)
    for (e.queue = (e.queue << 8) | r, e.queuedBits += 8; e.queuedBits >= 6; ) {
      const s = (e.queue >> (e.queuedBits - 6)) & 63
      ;(t(Et[s]), (e.queuedBits -= 6))
    }
  else if (e.queuedBits > 0)
    for (
      e.queue = e.queue << (6 - e.queuedBits), e.queuedBits = 6;
      e.queuedBits >= 6;

    ) {
      const s = (e.queue >> (e.queuedBits - 6)) & 63
      ;(t(Et[s]), (e.queuedBits -= 6))
    }
}
function Vr(r, e, t) {
  const s = xa[r]
  if (s > -1)
    for (e.queue = (e.queue << 6) | s, e.queuedBits += 6; e.queuedBits >= 8; )
      (t((e.queue >> (e.queuedBits - 8)) & 255), (e.queuedBits -= 8))
  else {
    if (s === -2) return
    throw new Error(`Invalid Base64-URL character "${String.fromCharCode(r)}"`)
  }
}
function Vs(r) {
  const e = [],
    t = a => {
      e.push(String.fromCodePoint(a))
    },
    s = { utf8seq: 0, codepoint: 0 },
    n = { queue: 0, queuedBits: 0 },
    i = a => {
      ka(a, s, t)
    }
  for (let a = 0; a < r.length; a += 1) Vr(r.charCodeAt(a), n, i)
  return e.join('')
}
function wa(r, e) {
  if (r <= 127) {
    e(r)
    return
  } else if (r <= 2047) {
    ;(e(192 | (r >> 6)), e(128 | (r & 63)))
    return
  } else if (r <= 65535) {
    ;(e(224 | (r >> 12)), e(128 | ((r >> 6) & 63)), e(128 | (r & 63)))
    return
  } else if (r <= 1114111) {
    ;(e(240 | (r >> 18)),
      e(128 | ((r >> 12) & 63)),
      e(128 | ((r >> 6) & 63)),
      e(128 | (r & 63)))
    return
  }
  throw new Error(`Unrecognized Unicode codepoint: ${r.toString(16)}`)
}
function _a(r, e) {
  for (let t = 0; t < r.length; t += 1) {
    let s = r.charCodeAt(t)
    if (s > 55295 && s <= 56319) {
      const n = ((s - 55296) * 1024) & 65535
      ;((s = (((r.charCodeAt(t + 1) - 56320) & 65535) | n) + 65536), (t += 1))
    }
    wa(s, e)
  }
}
function ka(r, e, t) {
  if (e.utf8seq === 0) {
    if (r <= 127) {
      t(r)
      return
    }
    for (let s = 1; s < 6; s += 1)
      if (!((r >> (7 - s)) & 1)) {
        e.utf8seq = s
        break
      }
    if (e.utf8seq === 2) e.codepoint = r & 31
    else if (e.utf8seq === 3) e.codepoint = r & 15
    else if (e.utf8seq === 4) e.codepoint = r & 7
    else throw new Error('Invalid UTF-8 sequence')
    e.utf8seq -= 1
  } else if (e.utf8seq > 0) {
    if (r <= 127) throw new Error('Invalid UTF-8 sequence')
    ;((e.codepoint = (e.codepoint << 6) | (r & 63)),
      (e.utf8seq -= 1),
      e.utf8seq === 0 && t(e.codepoint))
  }
}
function ja(r) {
  const e = [],
    t = { queue: 0, queuedBits: 0 },
    s = n => {
      e.push(n)
    }
  for (let n = 0; n < r.length; n += 1) Vr(r.charCodeAt(n), t, s)
  return new Uint8Array(e)
}
function Sa(r) {
  const e = []
  return (_a(r, t => e.push(t)), new Uint8Array(e))
}
function Ca(r) {
  const e = [],
    t = { queue: 0, queuedBits: 0 },
    s = n => {
      e.push(n)
    }
  return (r.forEach(n => Ws(n, t, s)), Ws(null, t, s), e.join(''))
}
function Ea(r) {
  return Math.round(Date.now() / 1e3) + r
}
function Ta() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (r) {
    const e = (Math.random() * 16) | 0
    return (r == 'x' ? e : (e & 3) | 8).toString(16)
  })
}
const X = () => typeof window < 'u' && typeof document < 'u',
  fe = { tested: !1, writable: !1 },
  Kr = () => {
    if (!X()) return !1
    try {
      if (typeof globalThis.localStorage != 'object') return !1
    } catch {
      return !1
    }
    if (fe.tested) return fe.writable
    const r = `lswt-${Math.random()}${Math.random()}`
    try {
      ;(globalThis.localStorage.setItem(r, r),
        globalThis.localStorage.removeItem(r),
        (fe.tested = !0),
        (fe.writable = !0))
    } catch {
      ;((fe.tested = !0), (fe.writable = !1))
    }
    return fe.writable
  }
function Na(r) {
  const e = {},
    t = new URL(r)
  if (t.hash && t.hash[0] === '#')
    try {
      new URLSearchParams(t.hash.substring(1)).forEach((n, i) => {
        e[i] = n
      })
    } catch {}
  return (
    t.searchParams.forEach((s, n) => {
      e[n] = s
    }),
    e
  )
}
const Jr = r => {
    let e
    return (
      r
        ? (e = r)
        : typeof fetch > 'u'
          ? (e = (...t) =>
              st(
                async () => {
                  const { default: s } = await Promise.resolve().then(() => ze)
                  return { default: s }
                },
                void 0
              ).then(({ default: s }) => s(...t)))
          : (e = fetch),
      (...t) => e(...t)
    )
  },
  Aa = r =>
    typeof r == 'object' &&
    r !== null &&
    'status' in r &&
    'ok' in r &&
    'json' in r &&
    typeof r.json == 'function',
  Ie = async (r, e, t) => {
    await r.setItem(e, JSON.stringify(t))
  },
  me = async (r, e) => {
    const t = await r.getItem(e)
    if (!t) return null
    try {
      return JSON.parse(t)
    } catch {
      return t
    }
  },
  oe = async (r, e) => {
    await r.removeItem(e)
  }
class It {
  constructor() {
    this.promise = new It.promiseConstructor((e, t) => {
      ;((this.resolve = e), (this.reject = t))
    })
  }
}
It.promiseConstructor = Promise
function Ht(r) {
  const e = r.split('.')
  if (e.length !== 3) throw new us('Invalid JWT structure')
  for (let s = 0; s < e.length; s++)
    if (!ma.test(e[s])) throw new us('JWT not in base64url format')
  return {
    header: JSON.parse(Vs(e[0])),
    payload: JSON.parse(Vs(e[1])),
    signature: ja(e[2]),
    raw: { header: e[0], payload: e[1] },
  }
}
async function Pa(r) {
  return await new Promise(e => {
    setTimeout(() => e(null), r)
  })
}
function Da(r, e) {
  return new Promise((s, n) => {
    ;(async () => {
      for (let i = 0; i < 1 / 0; i++)
        try {
          const a = await r(i)
          if (!e(i, null, a)) {
            s(a)
            return
          }
        } catch (a) {
          if (!e(i, a)) {
            n(a)
            return
          }
        }
    })()
  })
}
function Ia(r) {
  return ('0' + r.toString(16)).substr(-2)
}
function Oa() {
  const e = new Uint32Array(56)
  if (typeof crypto > 'u') {
    const t =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~',
      s = t.length
    let n = ''
    for (let i = 0; i < 56; i++) n += t.charAt(Math.floor(Math.random() * s))
    return n
  }
  return (crypto.getRandomValues(e), Array.from(e, Ia).join(''))
}
async function Ra(r) {
  const t = new TextEncoder().encode(r),
    s = await crypto.subtle.digest('SHA-256', t),
    n = new Uint8Array(s)
  return Array.from(n)
    .map(i => String.fromCharCode(i))
    .join('')
}
async function $a(r) {
  if (
    !(
      typeof crypto < 'u' &&
      typeof crypto.subtle < 'u' &&
      typeof TextEncoder < 'u'
    )
  )
    return (
      console.warn(
        'WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.'
      ),
      r
    )
  const t = await Ra(r)
  return btoa(t).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
async function Ce(r, e, t = !1) {
  const s = Oa()
  let n = s
  ;(t && (n += '/PASSWORD_RECOVERY'), await Ie(r, `${e}-code-verifier`, n))
  const i = await $a(s)
  return [i, s === i ? 'plain' : 's256']
}
const La = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i
function Fa(r) {
  const e = r.headers.get(cs)
  if (!e || !e.match(La)) return null
  try {
    return new Date(`${e}T00:00:00.0Z`)
  } catch {
    return null
  }
}
function Ma(r) {
  if (!r) throw new Error('Missing exp claim')
  const e = Math.floor(Date.now() / 1e3)
  if (r <= e) throw new Error('JWT has expired')
}
function Ua(r) {
  switch (r) {
    case 'RS256':
      return { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } }
    case 'ES256':
      return { name: 'ECDSA', namedCurve: 'P-256', hash: { name: 'SHA-256' } }
    default:
      throw new Error('Invalid alg claim')
  }
}
const za = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
function Ee(r) {
  if (!za.test(r))
    throw new Error(
      '@supabase/auth-js: Expected parameter to be UUID but is not'
    )
}
function Gt() {
  const r = {}
  return new Proxy(r, {
    get: (e, t) => {
      if (t === '__isUserNotAvailableProxy') return !0
      if (typeof t == 'symbol') {
        const s = t.toString()
        if (
          s === 'Symbol(Symbol.toPrimitive)' ||
          s === 'Symbol(Symbol.toStringTag)' ||
          s === 'Symbol(util.inspect.custom)'
        )
          return
      }
      throw new Error(
        `@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${t}" property of the session object is not supported. Please use getUser() instead.`
      )
    },
    set: (e, t) => {
      throw new Error(
        `@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`
      )
    },
    deleteProperty: (e, t) => {
      throw new Error(
        `@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`
      )
    },
  })
}
function Ks(r) {
  return JSON.parse(JSON.stringify(r))
}
var qa = function (r, e) {
  var t = {}
  for (var s in r)
    Object.prototype.hasOwnProperty.call(r, s) &&
      e.indexOf(s) < 0 &&
      (t[s] = r[s])
  if (r != null && typeof Object.getOwnPropertySymbols == 'function')
    for (var n = 0, s = Object.getOwnPropertySymbols(r); n < s.length; n++)
      e.indexOf(s[n]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(r, s[n]) &&
        (t[s[n]] = r[s[n]])
  return t
}
const pe = r =>
    r.msg || r.message || r.error_description || r.error || JSON.stringify(r),
  Ba = [502, 503, 504]
async function Js(r) {
  var e
  if (!Aa(r)) throw new ds(pe(r), 0)
  if (Ba.includes(r.status)) throw new ds(pe(r), r.status)
  let t
  try {
    t = await r.json()
  } catch (i) {
    throw new Wr(pe(i), i)
  }
  let s
  const n = Fa(r)
  if (
    (n &&
    n.getTime() >= Gr['2024-01-01'].timestamp &&
    typeof t == 'object' &&
    t &&
    typeof t.code == 'string'
      ? (s = t.code)
      : typeof t == 'object' &&
        t &&
        typeof t.error_code == 'string' &&
        (s = t.error_code),
    s)
  ) {
    if (s === 'weak_password')
      throw new Hs(
        pe(t),
        r.status,
        ((e = t.weak_password) === null || e === void 0 ? void 0 : e.reasons) ||
          []
      )
    if (s === 'session_not_found') throw new ce()
  } else if (
    typeof t == 'object' &&
    t &&
    typeof t.weak_password == 'object' &&
    t.weak_password &&
    Array.isArray(t.weak_password.reasons) &&
    t.weak_password.reasons.length &&
    t.weak_password.reasons.reduce((i, a) => i && typeof a == 'string', !0)
  )
    throw new Hs(pe(t), r.status, t.weak_password.reasons)
  throw new pa(pe(t), r.status || 500, s)
}
const Ha = (r, e, t, s) => {
  const n = { method: r, headers: e?.headers || {} }
  return r === 'GET'
    ? n
    : ((n.headers = Object.assign(
        { 'Content-Type': 'application/json;charset=UTF-8' },
        e?.headers
      )),
      (n.body = JSON.stringify(s)),
      Object.assign(Object.assign({}, n), t))
}
async function D(r, e, t, s) {
  var n
  const i = Object.assign({}, s?.headers)
  ;(i[cs] || (i[cs] = Gr['2024-01-01'].name),
    s?.jwt && (i.Authorization = `Bearer ${s.jwt}`))
  const a = (n = s?.query) !== null && n !== void 0 ? n : {}
  s?.redirectTo && (a.redirect_to = s.redirectTo)
  const l = Object.keys(a).length
      ? '?' + new URLSearchParams(a).toString()
      : '',
    c = await Ga(
      r,
      e,
      t + l,
      { headers: i, noResolveJson: s?.noResolveJson },
      {},
      s?.body
    )
  return s?.xform ? s?.xform(c) : { data: Object.assign({}, c), error: null }
}
async function Ga(r, e, t, s, n, i) {
  const a = Ha(e, s, n, i)
  let l
  try {
    l = await r(t, Object.assign({}, a))
  } catch (c) {
    throw (console.error(c), new ds(pe(c), 0))
  }
  if ((l.ok || (await Js(l)), s?.noResolveJson)) return l
  try {
    return await l.json()
  } catch (c) {
    await Js(c)
  }
}
function ie(r) {
  var e
  let t = null
  Ja(r) &&
    ((t = Object.assign({}, r)),
    r.expires_at || (t.expires_at = Ea(r.expires_in)))
  const s = (e = r.user) !== null && e !== void 0 ? e : r
  return { data: { session: t, user: s }, error: null }
}
function Qs(r) {
  const e = ie(r)
  return (
    !e.error &&
      r.weak_password &&
      typeof r.weak_password == 'object' &&
      Array.isArray(r.weak_password.reasons) &&
      r.weak_password.reasons.length &&
      r.weak_password.message &&
      typeof r.weak_password.message == 'string' &&
      r.weak_password.reasons.reduce((t, s) => t && typeof s == 'string', !0) &&
      (e.data.weak_password = r.weak_password),
    e
  )
}
function de(r) {
  var e
  return {
    data: { user: (e = r.user) !== null && e !== void 0 ? e : r },
    error: null,
  }
}
function Wa(r) {
  return { data: r, error: null }
}
function Va(r) {
  const {
      action_link: e,
      email_otp: t,
      hashed_token: s,
      redirect_to: n,
      verification_type: i,
    } = r,
    a = qa(r, [
      'action_link',
      'email_otp',
      'hashed_token',
      'redirect_to',
      'verification_type',
    ]),
    l = {
      action_link: e,
      email_otp: t,
      hashed_token: s,
      redirect_to: n,
      verification_type: i,
    },
    c = Object.assign({}, a)
  return { data: { properties: l, user: c }, error: null }
}
function Ka(r) {
  return r
}
function Ja(r) {
  return r.access_token && r.refresh_token && r.expires_in
}
const Wt = ['global', 'local', 'others']
var Qa = function (r, e) {
  var t = {}
  for (var s in r)
    Object.prototype.hasOwnProperty.call(r, s) &&
      e.indexOf(s) < 0 &&
      (t[s] = r[s])
  if (r != null && typeof Object.getOwnPropertySymbols == 'function')
    for (var n = 0, s = Object.getOwnPropertySymbols(r); n < s.length; n++)
      e.indexOf(s[n]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(r, s[n]) &&
        (t[s[n]] = r[s[n]])
  return t
}
class Ya {
  constructor({ url: e = '', headers: t = {}, fetch: s }) {
    ;((this.url = e),
      (this.headers = t),
      (this.fetch = Jr(s)),
      (this.mfa = {
        listFactors: this._listFactors.bind(this),
        deleteFactor: this._deleteFactor.bind(this),
      }))
  }
  async signOut(e, t = Wt[0]) {
    if (Wt.indexOf(t) < 0)
      throw new Error(
        `@supabase/auth-js: Parameter scope must be one of ${Wt.join(', ')}`
      )
    try {
      return (
        await D(this.fetch, 'POST', `${this.url}/logout?scope=${t}`, {
          headers: this.headers,
          jwt: e,
          noResolveJson: !0,
        }),
        { data: null, error: null }
      )
    } catch (s) {
      if (T(s)) return { data: null, error: s }
      throw s
    }
  }
  async inviteUserByEmail(e, t = {}) {
    try {
      return await D(this.fetch, 'POST', `${this.url}/invite`, {
        body: { email: e, data: t.data },
        headers: this.headers,
        redirectTo: t.redirectTo,
        xform: de,
      })
    } catch (s) {
      if (T(s)) return { data: { user: null }, error: s }
      throw s
    }
  }
  async generateLink(e) {
    try {
      const { options: t } = e,
        s = Qa(e, ['options']),
        n = Object.assign(Object.assign({}, s), t)
      return (
        'newEmail' in s && ((n.new_email = s?.newEmail), delete n.newEmail),
        await D(this.fetch, 'POST', `${this.url}/admin/generate_link`, {
          body: n,
          headers: this.headers,
          xform: Va,
          redirectTo: t?.redirectTo,
        })
      )
    } catch (t) {
      if (T(t)) return { data: { properties: null, user: null }, error: t }
      throw t
    }
  }
  async createUser(e) {
    try {
      return await D(this.fetch, 'POST', `${this.url}/admin/users`, {
        body: e,
        headers: this.headers,
        xform: de,
      })
    } catch (t) {
      if (T(t)) return { data: { user: null }, error: t }
      throw t
    }
  }
  async listUsers(e) {
    var t, s, n, i, a, l, c
    try {
      const d = { nextPage: null, lastPage: 0, total: 0 },
        u = await D(this.fetch, 'GET', `${this.url}/admin/users`, {
          headers: this.headers,
          noResolveJson: !0,
          query: {
            page:
              (s =
                (t = e?.page) === null || t === void 0
                  ? void 0
                  : t.toString()) !== null && s !== void 0
                ? s
                : '',
            per_page:
              (i =
                (n = e?.perPage) === null || n === void 0
                  ? void 0
                  : n.toString()) !== null && i !== void 0
                ? i
                : '',
          },
          xform: Ka,
        })
      if (u.error) throw u.error
      const h = await u.json(),
        p =
          (a = u.headers.get('x-total-count')) !== null && a !== void 0 ? a : 0,
        f =
          (c =
            (l = u.headers.get('link')) === null || l === void 0
              ? void 0
              : l.split(',')) !== null && c !== void 0
            ? c
            : []
      return (
        f.length > 0 &&
          (f.forEach(g => {
            const m = parseInt(g.split(';')[0].split('=')[1].substring(0, 1)),
              y = JSON.parse(g.split(';')[1].split('=')[1])
            d[`${y}Page`] = m
          }),
          (d.total = parseInt(p))),
        { data: Object.assign(Object.assign({}, h), d), error: null }
      )
    } catch (d) {
      if (T(d)) return { data: { users: [] }, error: d }
      throw d
    }
  }
  async getUserById(e) {
    Ee(e)
    try {
      return await D(this.fetch, 'GET', `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        xform: de,
      })
    } catch (t) {
      if (T(t)) return { data: { user: null }, error: t }
      throw t
    }
  }
  async updateUserById(e, t) {
    Ee(e)
    try {
      return await D(this.fetch, 'PUT', `${this.url}/admin/users/${e}`, {
        body: t,
        headers: this.headers,
        xform: de,
      })
    } catch (s) {
      if (T(s)) return { data: { user: null }, error: s }
      throw s
    }
  }
  async deleteUser(e, t = !1) {
    Ee(e)
    try {
      return await D(this.fetch, 'DELETE', `${this.url}/admin/users/${e}`, {
        headers: this.headers,
        body: { should_soft_delete: t },
        xform: de,
      })
    } catch (s) {
      if (T(s)) return { data: { user: null }, error: s }
      throw s
    }
  }
  async _listFactors(e) {
    Ee(e.userId)
    try {
      const { data: t, error: s } = await D(
        this.fetch,
        'GET',
        `${this.url}/admin/users/${e.userId}/factors`,
        {
          headers: this.headers,
          xform: n => ({ data: { factors: n }, error: null }),
        }
      )
      return { data: t, error: s }
    } catch (t) {
      if (T(t)) return { data: null, error: t }
      throw t
    }
  }
  async _deleteFactor(e) {
    ;(Ee(e.userId), Ee(e.id))
    try {
      return {
        data: await D(
          this.fetch,
          'DELETE',
          `${this.url}/admin/users/${e.userId}/factors/${e.id}`,
          { headers: this.headers }
        ),
        error: null,
      }
    } catch (t) {
      if (T(t)) return { data: null, error: t }
      throw t
    }
  }
}
function Ys(r = {}) {
  return {
    getItem: e => r[e] || null,
    setItem: (e, t) => {
      r[e] = t
    },
    removeItem: e => {
      delete r[e]
    },
  }
}
function Za() {
  if (typeof globalThis != 'object')
    try {
      ;(Object.defineProperty(Object.prototype, '__magic__', {
        get: function () {
          return this
        },
        configurable: !0,
      }),
        (__magic__.globalThis = __magic__),
        delete Object.prototype.__magic__)
    } catch {
      typeof self < 'u' && (self.globalThis = self)
    }
}
const Te = {
  debug: !!(
    globalThis &&
    Kr() &&
    globalThis.localStorage &&
    globalThis.localStorage.getItem('supabase.gotrue-js.locks.debug') === 'true'
  ),
}
class Qr extends Error {
  constructor(e) {
    ;(super(e), (this.isAcquireTimeout = !0))
  }
}
class Xa extends Qr {}
async function eo(r, e, t) {
  Te.debug &&
    console.log('@supabase/gotrue-js: navigatorLock: acquire lock', r, e)
  const s = new globalThis.AbortController()
  return (
    e > 0 &&
      setTimeout(() => {
        ;(s.abort(),
          Te.debug &&
            console.log(
              '@supabase/gotrue-js: navigatorLock acquire timed out',
              r
            ))
      }, e),
    await Promise.resolve().then(() =>
      globalThis.navigator.locks.request(
        r,
        e === 0
          ? { mode: 'exclusive', ifAvailable: !0 }
          : { mode: 'exclusive', signal: s.signal },
        async n => {
          if (n) {
            Te.debug &&
              console.log(
                '@supabase/gotrue-js: navigatorLock: acquired',
                r,
                n.name
              )
            try {
              return await t()
            } finally {
              Te.debug &&
                console.log(
                  '@supabase/gotrue-js: navigatorLock: released',
                  r,
                  n.name
                )
            }
          } else {
            if (e === 0)
              throw (
                Te.debug &&
                  console.log(
                    '@supabase/gotrue-js: navigatorLock: not immediately available',
                    r
                  ),
                new Xa(
                  `Acquiring an exclusive Navigator LockManager lock "${r}" immediately failed`
                )
              )
            if (Te.debug)
              try {
                const i = await globalThis.navigator.locks.query()
                console.log(
                  '@supabase/gotrue-js: Navigator LockManager state',
                  JSON.stringify(i, null, '  ')
                )
              } catch (i) {
                console.warn(
                  '@supabase/gotrue-js: Error when querying Navigator LockManager state',
                  i
                )
              }
            return (
              console.warn(
                '@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request'
              ),
              await t()
            )
          }
        }
      )
    )
  )
}
Za()
const to = {
  url: ua,
  storageKey: ha,
  autoRefreshToken: !0,
  persistSession: !0,
  detectSessionInUrl: !0,
  headers: fa,
  flowType: 'implicit',
  debug: !1,
  hasCustomAuthorizationHeader: !1,
}
async function Zs(r, e, t) {
  return await t()
}
const Ne = {}
class tt {
  constructor(e) {
    var t, s
    ;((this.userStorage = null),
      (this.memoryStorage = null),
      (this.stateChangeEmitters = new Map()),
      (this.autoRefreshTicker = null),
      (this.visibilityChangedCallback = null),
      (this.refreshingDeferred = null),
      (this.initializePromise = null),
      (this.detectSessionInUrl = !0),
      (this.hasCustomAuthorizationHeader = !1),
      (this.suppressGetSessionWarning = !1),
      (this.lockAcquired = !1),
      (this.pendingInLock = []),
      (this.broadcastChannel = null),
      (this.logger = console.log),
      (this.instanceID = tt.nextInstanceID),
      (tt.nextInstanceID += 1),
      this.instanceID > 0 &&
        X() &&
        console.warn(
          'Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.'
        ))
    const n = Object.assign(Object.assign({}, to), e)
    if (
      ((this.logDebugMessages = !!n.debug),
      typeof n.debug == 'function' && (this.logger = n.debug),
      (this.persistSession = n.persistSession),
      (this.storageKey = n.storageKey),
      (this.autoRefreshToken = n.autoRefreshToken),
      (this.admin = new Ya({ url: n.url, headers: n.headers, fetch: n.fetch })),
      (this.url = n.url),
      (this.headers = n.headers),
      (this.fetch = Jr(n.fetch)),
      (this.lock = n.lock || Zs),
      (this.detectSessionInUrl = n.detectSessionInUrl),
      (this.flowType = n.flowType),
      (this.hasCustomAuthorizationHeader = n.hasCustomAuthorizationHeader),
      n.lock
        ? (this.lock = n.lock)
        : X() &&
            !((t = globalThis?.navigator) === null || t === void 0) &&
            t.locks
          ? (this.lock = eo)
          : (this.lock = Zs),
      this.jwks ||
        ((this.jwks = { keys: [] }),
        (this.jwks_cached_at = Number.MIN_SAFE_INTEGER)),
      (this.mfa = {
        verify: this._verify.bind(this),
        enroll: this._enroll.bind(this),
        unenroll: this._unenroll.bind(this),
        challenge: this._challenge.bind(this),
        listFactors: this._listFactors.bind(this),
        challengeAndVerify: this._challengeAndVerify.bind(this),
        getAuthenticatorAssuranceLevel:
          this._getAuthenticatorAssuranceLevel.bind(this),
      }),
      this.persistSession
        ? (n.storage
            ? (this.storage = n.storage)
            : Kr()
              ? (this.storage = globalThis.localStorage)
              : ((this.memoryStorage = {}),
                (this.storage = Ys(this.memoryStorage))),
          n.userStorage && (this.userStorage = n.userStorage))
        : ((this.memoryStorage = {}), (this.storage = Ys(this.memoryStorage))),
      X() &&
        globalThis.BroadcastChannel &&
        this.persistSession &&
        this.storageKey)
    ) {
      try {
        this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey)
      } catch (i) {
        console.error(
          'Failed to create a new BroadcastChannel, multi-tab state changes will not be available',
          i
        )
      }
      ;(s = this.broadcastChannel) === null ||
        s === void 0 ||
        s.addEventListener('message', async i => {
          ;(this._debug(
            'received broadcast notification from other tab or client',
            i
          ),
            await this._notifyAllSubscribers(i.data.event, i.data.session, !1))
        })
    }
    this.initialize()
  }
  get jwks() {
    var e, t
    return (t =
      (e = Ne[this.storageKey]) === null || e === void 0 ? void 0 : e.jwks) !==
      null && t !== void 0
      ? t
      : { keys: [] }
  }
  set jwks(e) {
    Ne[this.storageKey] = Object.assign(
      Object.assign({}, Ne[this.storageKey]),
      { jwks: e }
    )
  }
  get jwks_cached_at() {
    var e, t
    return (t =
      (e = Ne[this.storageKey]) === null || e === void 0
        ? void 0
        : e.cachedAt) !== null && t !== void 0
      ? t
      : Number.MIN_SAFE_INTEGER
  }
  set jwks_cached_at(e) {
    Ne[this.storageKey] = Object.assign(
      Object.assign({}, Ne[this.storageKey]),
      { cachedAt: e }
    )
  }
  _debug(...e) {
    return (
      this.logDebugMessages &&
        this.logger(
          `GoTrueClient@${this.instanceID} (${Hr}) ${new Date().toISOString()}`,
          ...e
        ),
      this
    )
  }
  async initialize() {
    return this.initializePromise
      ? await this.initializePromise
      : ((this.initializePromise = (async () =>
          await this._acquireLock(-1, async () => await this._initialize()))()),
        await this.initializePromise)
  }
  async _initialize() {
    var e
    try {
      const t = Na(window.location.href)
      let s = 'none'
      if (
        (this._isImplicitGrantCallback(t)
          ? (s = 'implicit')
          : (await this._isPKCECallback(t)) && (s = 'pkce'),
        X() && this.detectSessionInUrl && s !== 'none')
      ) {
        const { data: n, error: i } = await this._getSessionFromURL(t, s)
        if (i) {
          if (
            (this._debug(
              '#_initialize()',
              'error detecting session from URL',
              i
            ),
            va(i))
          ) {
            const c = (e = i.details) === null || e === void 0 ? void 0 : e.code
            if (
              c === 'identity_already_exists' ||
              c === 'identity_not_found' ||
              c === 'single_identity_not_deletable'
            )
              return { error: i }
          }
          return (await this._removeSession(), { error: i })
        }
        const { session: a, redirectType: l } = n
        return (
          this._debug(
            '#_initialize()',
            'detected session in URL',
            a,
            'redirect type',
            l
          ),
          await this._saveSession(a),
          setTimeout(async () => {
            l === 'recovery'
              ? await this._notifyAllSubscribers('PASSWORD_RECOVERY', a)
              : await this._notifyAllSubscribers('SIGNED_IN', a)
          }, 0),
          { error: null }
        )
      }
      return (await this._recoverAndRefresh(), { error: null })
    } catch (t) {
      return T(t)
        ? { error: t }
        : { error: new Wr('Unexpected error during initialization', t) }
    } finally {
      ;(await this._handleVisibilityChange(),
        this._debug('#_initialize()', 'end'))
    }
  }
  async signInAnonymously(e) {
    var t, s, n
    try {
      const i = await D(this.fetch, 'POST', `${this.url}/signup`, {
          headers: this.headers,
          body: {
            data:
              (s =
                (t = e?.options) === null || t === void 0 ? void 0 : t.data) !==
                null && s !== void 0
                ? s
                : {},
            gotrue_meta_security: {
              captcha_token:
                (n = e?.options) === null || n === void 0
                  ? void 0
                  : n.captchaToken,
            },
          },
          xform: ie,
        }),
        { data: a, error: l } = i
      if (l || !a) return { data: { user: null, session: null }, error: l }
      const c = a.session,
        d = a.user
      return (
        a.session &&
          (await this._saveSession(a.session),
          await this._notifyAllSubscribers('SIGNED_IN', c)),
        { data: { user: d, session: c }, error: null }
      )
    } catch (i) {
      if (T(i)) return { data: { user: null, session: null }, error: i }
      throw i
    }
  }
  async signUp(e) {
    var t, s, n
    try {
      let i
      if ('email' in e) {
        const { email: u, password: h, options: p } = e
        let f = null,
          g = null
        ;(this.flowType === 'pkce' &&
          ([f, g] = await Ce(this.storage, this.storageKey)),
          (i = await D(this.fetch, 'POST', `${this.url}/signup`, {
            headers: this.headers,
            redirectTo: p?.emailRedirectTo,
            body: {
              email: u,
              password: h,
              data: (t = p?.data) !== null && t !== void 0 ? t : {},
              gotrue_meta_security: { captcha_token: p?.captchaToken },
              code_challenge: f,
              code_challenge_method: g,
            },
            xform: ie,
          })))
      } else if ('phone' in e) {
        const { phone: u, password: h, options: p } = e
        i = await D(this.fetch, 'POST', `${this.url}/signup`, {
          headers: this.headers,
          body: {
            phone: u,
            password: h,
            data: (s = p?.data) !== null && s !== void 0 ? s : {},
            channel: (n = p?.channel) !== null && n !== void 0 ? n : 'sms',
            gotrue_meta_security: { captcha_token: p?.captchaToken },
          },
          xform: ie,
        })
      } else
        throw new gt(
          'You must provide either an email or phone number and a password'
        )
      const { data: a, error: l } = i
      if (l || !a) return { data: { user: null, session: null }, error: l }
      const c = a.session,
        d = a.user
      return (
        a.session &&
          (await this._saveSession(a.session),
          await this._notifyAllSubscribers('SIGNED_IN', c)),
        { data: { user: d, session: c }, error: null }
      )
    } catch (i) {
      if (T(i)) return { data: { user: null, session: null }, error: i }
      throw i
    }
  }
  async signInWithPassword(e) {
    try {
      let t
      if ('email' in e) {
        const { email: i, password: a, options: l } = e
        t = await D(
          this.fetch,
          'POST',
          `${this.url}/token?grant_type=password`,
          {
            headers: this.headers,
            body: {
              email: i,
              password: a,
              gotrue_meta_security: { captcha_token: l?.captchaToken },
            },
            xform: Qs,
          }
        )
      } else if ('phone' in e) {
        const { phone: i, password: a, options: l } = e
        t = await D(
          this.fetch,
          'POST',
          `${this.url}/token?grant_type=password`,
          {
            headers: this.headers,
            body: {
              phone: i,
              password: a,
              gotrue_meta_security: { captcha_token: l?.captchaToken },
            },
            xform: Qs,
          }
        )
      } else
        throw new gt(
          'You must provide either an email or phone number and a password'
        )
      const { data: s, error: n } = t
      return n
        ? { data: { user: null, session: null }, error: n }
        : !s || !s.session || !s.user
          ? { data: { user: null, session: null }, error: new mt() }
          : (s.session &&
              (await this._saveSession(s.session),
              await this._notifyAllSubscribers('SIGNED_IN', s.session)),
            {
              data: Object.assign(
                { user: s.user, session: s.session },
                s.weak_password ? { weakPassword: s.weak_password } : null
              ),
              error: n,
            })
    } catch (t) {
      if (T(t)) return { data: { user: null, session: null }, error: t }
      throw t
    }
  }
  async signInWithOAuth(e) {
    var t, s, n, i
    return await this._handleProviderSignIn(e.provider, {
      redirectTo:
        (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo,
      scopes: (s = e.options) === null || s === void 0 ? void 0 : s.scopes,
      queryParams:
        (n = e.options) === null || n === void 0 ? void 0 : n.queryParams,
      skipBrowserRedirect:
        (i = e.options) === null || i === void 0
          ? void 0
          : i.skipBrowserRedirect,
    })
  }
  async exchangeCodeForSession(e) {
    return (
      await this.initializePromise,
      this._acquireLock(-1, async () => this._exchangeCodeForSession(e))
    )
  }
  async signInWithWeb3(e) {
    const { chain: t } = e
    if (t === 'solana') return await this.signInWithSolana(e)
    throw new Error(`@supabase/auth-js: Unsupported chain "${t}"`)
  }
  async signInWithSolana(e) {
    var t, s, n, i, a, l, c, d, u, h, p, f
    let g, m
    if ('message' in e) ((g = e.message), (m = e.signature))
    else {
      const { chain: y, wallet: x, statement: b, options: w } = e
      let v
      if (X())
        if (typeof x == 'object') v = x
        else {
          const j = window
          if (
            'solana' in j &&
            typeof j.solana == 'object' &&
            (('signIn' in j.solana && typeof j.solana.signIn == 'function') ||
              ('signMessage' in j.solana &&
                typeof j.solana.signMessage == 'function'))
          )
            v = j.solana
          else
            throw new Error(
              "@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead."
            )
        }
      else {
        if (typeof x != 'object' || !w?.url)
          throw new Error(
            '@supabase/auth-js: Both wallet and url must be specified in non-browser environments.'
          )
        v = x
      }
      const A = new URL(
        (t = w?.url) !== null && t !== void 0 ? t : window.location.href
      )
      if ('signIn' in v && v.signIn) {
        const j = await v.signIn(
          Object.assign(
            Object.assign(
              Object.assign(
                { issuedAt: new Date().toISOString() },
                w?.signInWithSolana
              ),
              { version: '1', domain: A.host, uri: A.href }
            ),
            b ? { statement: b } : null
          )
        )
        let O
        if (Array.isArray(j) && j[0] && typeof j[0] == 'object') O = j[0]
        else if (
          j &&
          typeof j == 'object' &&
          'signedMessage' in j &&
          'signature' in j
        )
          O = j
        else
          throw new Error(
            '@supabase/auth-js: Wallet method signIn() returned unrecognized value'
          )
        if (
          'signedMessage' in O &&
          'signature' in O &&
          (typeof O.signedMessage == 'string' ||
            O.signedMessage instanceof Uint8Array) &&
          O.signature instanceof Uint8Array
        )
          ((g =
            typeof O.signedMessage == 'string'
              ? O.signedMessage
              : new TextDecoder().decode(O.signedMessage)),
            (m = O.signature))
        else
          throw new Error(
            '@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields'
          )
      } else {
        if (
          !('signMessage' in v) ||
          typeof v.signMessage != 'function' ||
          !('publicKey' in v) ||
          typeof v != 'object' ||
          !v.publicKey ||
          !('toBase58' in v.publicKey) ||
          typeof v.publicKey.toBase58 != 'function'
        )
          throw new Error(
            '@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API'
          )
        g = [
          `${A.host} wants you to sign in with your Solana account:`,
          v.publicKey.toBase58(),
          ...(b ? ['', b, ''] : ['']),
          'Version: 1',
          `URI: ${A.href}`,
          `Issued At: ${(n = (s = w?.signInWithSolana) === null || s === void 0 ? void 0 : s.issuedAt) !== null && n !== void 0 ? n : new Date().toISOString()}`,
          ...(!((i = w?.signInWithSolana) === null || i === void 0) &&
          i.notBefore
            ? [`Not Before: ${w.signInWithSolana.notBefore}`]
            : []),
          ...(!((a = w?.signInWithSolana) === null || a === void 0) &&
          a.expirationTime
            ? [`Expiration Time: ${w.signInWithSolana.expirationTime}`]
            : []),
          ...(!((l = w?.signInWithSolana) === null || l === void 0) && l.chainId
            ? [`Chain ID: ${w.signInWithSolana.chainId}`]
            : []),
          ...(!((c = w?.signInWithSolana) === null || c === void 0) && c.nonce
            ? [`Nonce: ${w.signInWithSolana.nonce}`]
            : []),
          ...(!((d = w?.signInWithSolana) === null || d === void 0) &&
          d.requestId
            ? [`Request ID: ${w.signInWithSolana.requestId}`]
            : []),
          ...(!(
            (h =
              (u = w?.signInWithSolana) === null || u === void 0
                ? void 0
                : u.resources) === null || h === void 0
          ) && h.length
            ? ['Resources', ...w.signInWithSolana.resources.map(O => `- ${O}`)]
            : []),
        ].join(`
`)
        const j = await v.signMessage(new TextEncoder().encode(g), 'utf8')
        if (!j || !(j instanceof Uint8Array))
          throw new Error(
            '@supabase/auth-js: Wallet signMessage() API returned an recognized value'
          )
        m = j
      }
    }
    try {
      const { data: y, error: x } = await D(
        this.fetch,
        'POST',
        `${this.url}/token?grant_type=web3`,
        {
          headers: this.headers,
          body: Object.assign(
            { chain: 'solana', message: g, signature: Ca(m) },
            !((p = e.options) === null || p === void 0) && p.captchaToken
              ? {
                  gotrue_meta_security: {
                    captcha_token:
                      (f = e.options) === null || f === void 0
                        ? void 0
                        : f.captchaToken,
                  },
                }
              : null
          ),
          xform: ie,
        }
      )
      if (x) throw x
      return !y || !y.session || !y.user
        ? { data: { user: null, session: null }, error: new mt() }
        : (y.session &&
            (await this._saveSession(y.session),
            await this._notifyAllSubscribers('SIGNED_IN', y.session)),
          { data: Object.assign({}, y), error: x })
    } catch (y) {
      if (T(y)) return { data: { user: null, session: null }, error: y }
      throw y
    }
  }
  async _exchangeCodeForSession(e) {
    const t = await me(this.storage, `${this.storageKey}-code-verifier`),
      [s, n] = (t ?? '').split('/')
    try {
      const { data: i, error: a } = await D(
        this.fetch,
        'POST',
        `${this.url}/token?grant_type=pkce`,
        {
          headers: this.headers,
          body: { auth_code: e, code_verifier: s },
          xform: ie,
        }
      )
      if ((await oe(this.storage, `${this.storageKey}-code-verifier`), a))
        throw a
      return !i || !i.session || !i.user
        ? {
            data: { user: null, session: null, redirectType: null },
            error: new mt(),
          }
        : (i.session &&
            (await this._saveSession(i.session),
            await this._notifyAllSubscribers('SIGNED_IN', i.session)),
          {
            data: Object.assign(Object.assign({}, i), {
              redirectType: n ?? null,
            }),
            error: a,
          })
    } catch (i) {
      if (T(i))
        return {
          data: { user: null, session: null, redirectType: null },
          error: i,
        }
      throw i
    }
  }
  async signInWithIdToken(e) {
    try {
      const {
          options: t,
          provider: s,
          token: n,
          access_token: i,
          nonce: a,
        } = e,
        l = await D(
          this.fetch,
          'POST',
          `${this.url}/token?grant_type=id_token`,
          {
            headers: this.headers,
            body: {
              provider: s,
              id_token: n,
              access_token: i,
              nonce: a,
              gotrue_meta_security: { captcha_token: t?.captchaToken },
            },
            xform: ie,
          }
        ),
        { data: c, error: d } = l
      return d
        ? { data: { user: null, session: null }, error: d }
        : !c || !c.session || !c.user
          ? { data: { user: null, session: null }, error: new mt() }
          : (c.session &&
              (await this._saveSession(c.session),
              await this._notifyAllSubscribers('SIGNED_IN', c.session)),
            { data: c, error: d })
    } catch (t) {
      if (T(t)) return { data: { user: null, session: null }, error: t }
      throw t
    }
  }
  async signInWithOtp(e) {
    var t, s, n, i, a
    try {
      if ('email' in e) {
        const { email: l, options: c } = e
        let d = null,
          u = null
        this.flowType === 'pkce' &&
          ([d, u] = await Ce(this.storage, this.storageKey))
        const { error: h } = await D(this.fetch, 'POST', `${this.url}/otp`, {
          headers: this.headers,
          body: {
            email: l,
            data: (t = c?.data) !== null && t !== void 0 ? t : {},
            create_user:
              (s = c?.shouldCreateUser) !== null && s !== void 0 ? s : !0,
            gotrue_meta_security: { captcha_token: c?.captchaToken },
            code_challenge: d,
            code_challenge_method: u,
          },
          redirectTo: c?.emailRedirectTo,
        })
        return { data: { user: null, session: null }, error: h }
      }
      if ('phone' in e) {
        const { phone: l, options: c } = e,
          { data: d, error: u } = await D(
            this.fetch,
            'POST',
            `${this.url}/otp`,
            {
              headers: this.headers,
              body: {
                phone: l,
                data: (n = c?.data) !== null && n !== void 0 ? n : {},
                create_user:
                  (i = c?.shouldCreateUser) !== null && i !== void 0 ? i : !0,
                gotrue_meta_security: { captcha_token: c?.captchaToken },
                channel: (a = c?.channel) !== null && a !== void 0 ? a : 'sms',
              },
            }
          )
        return {
          data: { user: null, session: null, messageId: d?.message_id },
          error: u,
        }
      }
      throw new gt('You must provide either an email or phone number.')
    } catch (l) {
      if (T(l)) return { data: { user: null, session: null }, error: l }
      throw l
    }
  }
  async verifyOtp(e) {
    var t, s
    try {
      let n, i
      'options' in e &&
        ((n = (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo),
        (i =
          (s = e.options) === null || s === void 0 ? void 0 : s.captchaToken))
      const { data: a, error: l } = await D(
        this.fetch,
        'POST',
        `${this.url}/verify`,
        {
          headers: this.headers,
          body: Object.assign(Object.assign({}, e), {
            gotrue_meta_security: { captcha_token: i },
          }),
          redirectTo: n,
          xform: ie,
        }
      )
      if (l) throw l
      if (!a) throw new Error('An error occurred on token verification.')
      const c = a.session,
        d = a.user
      return (
        c?.access_token &&
          (await this._saveSession(c),
          await this._notifyAllSubscribers(
            e.type == 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN',
            c
          )),
        { data: { user: d, session: c }, error: null }
      )
    } catch (n) {
      if (T(n)) return { data: { user: null, session: null }, error: n }
      throw n
    }
  }
  async signInWithSSO(e) {
    var t, s, n
    try {
      let i = null,
        a = null
      return (
        this.flowType === 'pkce' &&
          ([i, a] = await Ce(this.storage, this.storageKey)),
        await D(this.fetch, 'POST', `${this.url}/sso`, {
          body: Object.assign(
            Object.assign(
              Object.assign(
                Object.assign(
                  Object.assign(
                    {},
                    'providerId' in e ? { provider_id: e.providerId } : null
                  ),
                  'domain' in e ? { domain: e.domain } : null
                ),
                {
                  redirect_to:
                    (s =
                      (t = e.options) === null || t === void 0
                        ? void 0
                        : t.redirectTo) !== null && s !== void 0
                      ? s
                      : void 0,
                }
              ),
              !((n = e?.options) === null || n === void 0) && n.captchaToken
                ? {
                    gotrue_meta_security: {
                      captcha_token: e.options.captchaToken,
                    },
                  }
                : null
            ),
            {
              skip_http_redirect: !0,
              code_challenge: i,
              code_challenge_method: a,
            }
          ),
          headers: this.headers,
          xform: Wa,
        })
      )
    } catch (i) {
      if (T(i)) return { data: null, error: i }
      throw i
    }
  }
  async reauthenticate() {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._reauthenticate())
    )
  }
  async _reauthenticate() {
    try {
      return await this._useSession(async e => {
        const {
          data: { session: t },
          error: s,
        } = e
        if (s) throw s
        if (!t) throw new ce()
        const { error: n } = await D(
          this.fetch,
          'GET',
          `${this.url}/reauthenticate`,
          { headers: this.headers, jwt: t.access_token }
        )
        return { data: { user: null, session: null }, error: n }
      })
    } catch (e) {
      if (T(e)) return { data: { user: null, session: null }, error: e }
      throw e
    }
  }
  async resend(e) {
    try {
      const t = `${this.url}/resend`
      if ('email' in e) {
        const { email: s, type: n, options: i } = e,
          { error: a } = await D(this.fetch, 'POST', t, {
            headers: this.headers,
            body: {
              email: s,
              type: n,
              gotrue_meta_security: { captcha_token: i?.captchaToken },
            },
            redirectTo: i?.emailRedirectTo,
          })
        return { data: { user: null, session: null }, error: a }
      } else if ('phone' in e) {
        const { phone: s, type: n, options: i } = e,
          { data: a, error: l } = await D(this.fetch, 'POST', t, {
            headers: this.headers,
            body: {
              phone: s,
              type: n,
              gotrue_meta_security: { captcha_token: i?.captchaToken },
            },
          })
        return {
          data: { user: null, session: null, messageId: a?.message_id },
          error: l,
        }
      }
      throw new gt(
        'You must provide either an email or phone number and a type'
      )
    } catch (t) {
      if (T(t)) return { data: { user: null, session: null }, error: t }
      throw t
    }
  }
  async getSession() {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => this._useSession(async t => t))
    )
  }
  async _acquireLock(e, t) {
    this._debug('#_acquireLock', 'begin', e)
    try {
      if (this.lockAcquired) {
        const s = this.pendingInLock.length
            ? this.pendingInLock[this.pendingInLock.length - 1]
            : Promise.resolve(),
          n = (async () => (await s, await t()))()
        return (
          this.pendingInLock.push(
            (async () => {
              try {
                await n
              } catch {}
            })()
          ),
          n
        )
      }
      return await this.lock(`lock:${this.storageKey}`, e, async () => {
        this._debug(
          '#_acquireLock',
          'lock acquired for storage key',
          this.storageKey
        )
        try {
          this.lockAcquired = !0
          const s = t()
          for (
            this.pendingInLock.push(
              (async () => {
                try {
                  await s
                } catch {}
              })()
            ),
              await s;
            this.pendingInLock.length;

          ) {
            const n = [...this.pendingInLock]
            ;(await Promise.all(n), this.pendingInLock.splice(0, n.length))
          }
          return await s
        } finally {
          ;(this._debug(
            '#_acquireLock',
            'lock released for storage key',
            this.storageKey
          ),
            (this.lockAcquired = !1))
        }
      })
    } finally {
      this._debug('#_acquireLock', 'end')
    }
  }
  async _useSession(e) {
    this._debug('#_useSession', 'begin')
    try {
      const t = await this.__loadSession()
      return await e(t)
    } finally {
      this._debug('#_useSession', 'end')
    }
  }
  async __loadSession() {
    ;(this._debug('#__loadSession()', 'begin'),
      this.lockAcquired ||
        this._debug(
          '#__loadSession()',
          'used outside of an acquired lock!',
          new Error().stack
        ))
    try {
      let e = null
      const t = await me(this.storage, this.storageKey)
      if (
        (this._debug('#getSession()', 'session from storage', t),
        t !== null &&
          (this._isValidSession(t)
            ? (e = t)
            : (this._debug(
                '#getSession()',
                'session from storage is not valid'
              ),
              await this._removeSession())),
        !e)
      )
        return { data: { session: null }, error: null }
      const s = e.expires_at ? e.expires_at * 1e3 - Date.now() < qt : !1
      if (
        (this._debug(
          '#__loadSession()',
          `session has${s ? '' : ' not'} expired`,
          'expires_at',
          e.expires_at
        ),
        !s)
      ) {
        if (this.userStorage) {
          const a = await me(this.userStorage, this.storageKey + '-user')
          a?.user ? (e.user = a.user) : (e.user = Gt())
        }
        if (this.storage.isServer && e.user) {
          let a = this.suppressGetSessionWarning
          e = new Proxy(e, {
            get: (c, d, u) => (
              !a &&
                d === 'user' &&
                (console.warn(
                  'Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.'
                ),
                (a = !0),
                (this.suppressGetSessionWarning = !0)),
              Reflect.get(c, d, u)
            ),
          })
        }
        return { data: { session: e }, error: null }
      }
      const { session: n, error: i } = await this._callRefreshToken(
        e.refresh_token
      )
      return i
        ? { data: { session: null }, error: i }
        : { data: { session: n }, error: null }
    } finally {
      this._debug('#__loadSession()', 'end')
    }
  }
  async getUser(e) {
    return e
      ? await this._getUser(e)
      : (await this.initializePromise,
        await this._acquireLock(-1, async () => await this._getUser()))
  }
  async _getUser(e) {
    try {
      return e
        ? await D(this.fetch, 'GET', `${this.url}/user`, {
            headers: this.headers,
            jwt: e,
            xform: de,
          })
        : await this._useSession(async t => {
            var s, n, i
            const { data: a, error: l } = t
            if (l) throw l
            return !(
              !((s = a.session) === null || s === void 0) && s.access_token
            ) && !this.hasCustomAuthorizationHeader
              ? { data: { user: null }, error: new ce() }
              : await D(this.fetch, 'GET', `${this.url}/user`, {
                  headers: this.headers,
                  jwt:
                    (i =
                      (n = a.session) === null || n === void 0
                        ? void 0
                        : n.access_token) !== null && i !== void 0
                      ? i
                      : void 0,
                  xform: de,
                })
          })
    } catch (t) {
      if (T(t))
        return (
          ba(t) &&
            (await this._removeSession(),
            await oe(this.storage, `${this.storageKey}-code-verifier`)),
          { data: { user: null }, error: t }
        )
      throw t
    }
  }
  async updateUser(e, t = {}) {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._updateUser(e, t))
    )
  }
  async _updateUser(e, t = {}) {
    try {
      return await this._useSession(async s => {
        const { data: n, error: i } = s
        if (i) throw i
        if (!n.session) throw new ce()
        const a = n.session
        let l = null,
          c = null
        this.flowType === 'pkce' &&
          e.email != null &&
          ([l, c] = await Ce(this.storage, this.storageKey))
        const { data: d, error: u } = await D(
          this.fetch,
          'PUT',
          `${this.url}/user`,
          {
            headers: this.headers,
            redirectTo: t?.emailRedirectTo,
            body: Object.assign(Object.assign({}, e), {
              code_challenge: l,
              code_challenge_method: c,
            }),
            jwt: a.access_token,
            xform: de,
          }
        )
        if (u) throw u
        return (
          (a.user = d.user),
          await this._saveSession(a),
          await this._notifyAllSubscribers('USER_UPDATED', a),
          { data: { user: a.user }, error: null }
        )
      })
    } catch (s) {
      if (T(s)) return { data: { user: null }, error: s }
      throw s
    }
  }
  async setSession(e) {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._setSession(e))
    )
  }
  async _setSession(e) {
    try {
      if (!e.access_token || !e.refresh_token) throw new ce()
      const t = Date.now() / 1e3
      let s = t,
        n = !0,
        i = null
      const { payload: a } = Ht(e.access_token)
      if ((a.exp && ((s = a.exp), (n = s <= t)), n)) {
        const { session: l, error: c } = await this._callRefreshToken(
          e.refresh_token
        )
        if (c) return { data: { user: null, session: null }, error: c }
        if (!l) return { data: { user: null, session: null }, error: null }
        i = l
      } else {
        const { data: l, error: c } = await this._getUser(e.access_token)
        if (c) throw c
        ;((i = {
          access_token: e.access_token,
          refresh_token: e.refresh_token,
          user: l.user,
          token_type: 'bearer',
          expires_in: s - t,
          expires_at: s,
        }),
          await this._saveSession(i),
          await this._notifyAllSubscribers('SIGNED_IN', i))
      }
      return { data: { user: i.user, session: i }, error: null }
    } catch (t) {
      if (T(t)) return { data: { session: null, user: null }, error: t }
      throw t
    }
  }
  async refreshSession(e) {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._refreshSession(e))
    )
  }
  async _refreshSession(e) {
    try {
      return await this._useSession(async t => {
        var s
        if (!e) {
          const { data: a, error: l } = t
          if (l) throw l
          e = (s = a.session) !== null && s !== void 0 ? s : void 0
        }
        if (!e?.refresh_token) throw new ce()
        const { session: n, error: i } = await this._callRefreshToken(
          e.refresh_token
        )
        return i
          ? { data: { user: null, session: null }, error: i }
          : n
            ? { data: { user: n.user, session: n }, error: null }
            : { data: { user: null, session: null }, error: null }
      })
    } catch (t) {
      if (T(t)) return { data: { user: null, session: null }, error: t }
      throw t
    }
  }
  async _getSessionFromURL(e, t) {
    try {
      if (!X()) throw new pt('No browser detected.')
      if (e.error || e.error_description || e.error_code)
        throw new pt(
          e.error_description ||
            'Error in URL with unspecified error_description',
          {
            error: e.error || 'unspecified_error',
            code: e.error_code || 'unspecified_code',
          }
        )
      switch (t) {
        case 'implicit':
          if (this.flowType === 'pkce')
            throw new Bs('Not a valid PKCE flow url.')
          break
        case 'pkce':
          if (this.flowType === 'implicit')
            throw new pt('Not a valid implicit grant flow url.')
          break
        default:
      }
      if (t === 'pkce') {
        if (
          (this._debug('#_initialize()', 'begin', 'is PKCE flow', !0), !e.code)
        )
          throw new Bs('No code detected.')
        const { data: b, error: w } = await this._exchangeCodeForSession(e.code)
        if (w) throw w
        const v = new URL(window.location.href)
        return (
          v.searchParams.delete('code'),
          window.history.replaceState(window.history.state, '', v.toString()),
          { data: { session: b.session, redirectType: null }, error: null }
        )
      }
      const {
        provider_token: s,
        provider_refresh_token: n,
        access_token: i,
        refresh_token: a,
        expires_in: l,
        expires_at: c,
        token_type: d,
      } = e
      if (!i || !l || !a || !d) throw new pt('No session defined in URL')
      const u = Math.round(Date.now() / 1e3),
        h = parseInt(l)
      let p = u + h
      c && (p = parseInt(c))
      const f = p - u
      f * 1e3 <= De &&
        console.warn(
          `@supabase/gotrue-js: Session as retrieved from URL expires in ${f}s, should have been closer to ${h}s`
        )
      const g = p - h
      u - g >= 120
        ? console.warn(
            '@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale',
            g,
            p,
            u
          )
        : u - g < 0 &&
          console.warn(
            '@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew',
            g,
            p,
            u
          )
      const { data: m, error: y } = await this._getUser(i)
      if (y) throw y
      const x = {
        provider_token: s,
        provider_refresh_token: n,
        access_token: i,
        expires_in: h,
        expires_at: p,
        refresh_token: a,
        token_type: d,
        user: m.user,
      }
      return (
        (window.location.hash = ''),
        this._debug('#_getSessionFromURL()', 'clearing window.location.hash'),
        { data: { session: x, redirectType: e.type }, error: null }
      )
    } catch (s) {
      if (T(s)) return { data: { session: null, redirectType: null }, error: s }
      throw s
    }
  }
  _isImplicitGrantCallback(e) {
    return !!(e.access_token || e.error_description)
  }
  async _isPKCECallback(e) {
    const t = await me(this.storage, `${this.storageKey}-code-verifier`)
    return !!(e.code && t)
  }
  async signOut(e = { scope: 'global' }) {
    return (
      await this.initializePromise,
      await this._acquireLock(-1, async () => await this._signOut(e))
    )
  }
  async _signOut({ scope: e } = { scope: 'global' }) {
    return await this._useSession(async t => {
      var s
      const { data: n, error: i } = t
      if (i) return { error: i }
      const a =
        (s = n.session) === null || s === void 0 ? void 0 : s.access_token
      if (a) {
        const { error: l } = await this.admin.signOut(a, e)
        if (
          l &&
          !(ya(l) && (l.status === 404 || l.status === 401 || l.status === 403))
        )
          return { error: l }
      }
      return (
        e !== 'others' &&
          (await this._removeSession(),
          await oe(this.storage, `${this.storageKey}-code-verifier`)),
        { error: null }
      )
    })
  }
  onAuthStateChange(e) {
    const t = Ta(),
      s = {
        id: t,
        callback: e,
        unsubscribe: () => {
          ;(this._debug(
            '#unsubscribe()',
            'state change callback with id removed',
            t
          ),
            this.stateChangeEmitters.delete(t))
        },
      }
    return (
      this._debug('#onAuthStateChange()', 'registered callback with id', t),
      this.stateChangeEmitters.set(t, s),
      (async () => (
        await this.initializePromise,
        await this._acquireLock(-1, async () => {
          this._emitInitialSession(t)
        })
      ))(),
      { data: { subscription: s } }
    )
  }
  async _emitInitialSession(e) {
    return await this._useSession(async t => {
      var s, n
      try {
        const {
          data: { session: i },
          error: a,
        } = t
        if (a) throw a
        ;(await ((s = this.stateChangeEmitters.get(e)) === null || s === void 0
          ? void 0
          : s.callback('INITIAL_SESSION', i)),
          this._debug('INITIAL_SESSION', 'callback id', e, 'session', i))
      } catch (i) {
        ;(await ((n = this.stateChangeEmitters.get(e)) === null || n === void 0
          ? void 0
          : n.callback('INITIAL_SESSION', null)),
          this._debug('INITIAL_SESSION', 'callback id', e, 'error', i),
          console.error(i))
      }
    })
  }
  async resetPasswordForEmail(e, t = {}) {
    let s = null,
      n = null
    this.flowType === 'pkce' &&
      ([s, n] = await Ce(this.storage, this.storageKey, !0))
    try {
      return await D(this.fetch, 'POST', `${this.url}/recover`, {
        body: {
          email: e,
          code_challenge: s,
          code_challenge_method: n,
          gotrue_meta_security: { captcha_token: t.captchaToken },
        },
        headers: this.headers,
        redirectTo: t.redirectTo,
      })
    } catch (i) {
      if (T(i)) return { data: null, error: i }
      throw i
    }
  }
  async getUserIdentities() {
    var e
    try {
      const { data: t, error: s } = await this.getUser()
      if (s) throw s
      return {
        data: {
          identities: (e = t.user.identities) !== null && e !== void 0 ? e : [],
        },
        error: null,
      }
    } catch (t) {
      if (T(t)) return { data: null, error: t }
      throw t
    }
  }
  async linkIdentity(e) {
    var t
    try {
      const { data: s, error: n } = await this._useSession(async i => {
        var a, l, c, d, u
        const { data: h, error: p } = i
        if (p) throw p
        const f = await this._getUrlForProvider(
          `${this.url}/user/identities/authorize`,
          e.provider,
          {
            redirectTo:
              (a = e.options) === null || a === void 0 ? void 0 : a.redirectTo,
            scopes:
              (l = e.options) === null || l === void 0 ? void 0 : l.scopes,
            queryParams:
              (c = e.options) === null || c === void 0 ? void 0 : c.queryParams,
            skipBrowserRedirect: !0,
          }
        )
        return await D(this.fetch, 'GET', f, {
          headers: this.headers,
          jwt:
            (u =
              (d = h.session) === null || d === void 0
                ? void 0
                : d.access_token) !== null && u !== void 0
              ? u
              : void 0,
        })
      })
      if (n) throw n
      return (
        X() &&
          !(
            !((t = e.options) === null || t === void 0) && t.skipBrowserRedirect
          ) &&
          window.location.assign(s?.url),
        { data: { provider: e.provider, url: s?.url }, error: null }
      )
    } catch (s) {
      if (T(s)) return { data: { provider: e.provider, url: null }, error: s }
      throw s
    }
  }
  async unlinkIdentity(e) {
    try {
      return await this._useSession(async t => {
        var s, n
        const { data: i, error: a } = t
        if (a) throw a
        return await D(
          this.fetch,
          'DELETE',
          `${this.url}/user/identities/${e.identity_id}`,
          {
            headers: this.headers,
            jwt:
              (n =
                (s = i.session) === null || s === void 0
                  ? void 0
                  : s.access_token) !== null && n !== void 0
                ? n
                : void 0,
          }
        )
      })
    } catch (t) {
      if (T(t)) return { data: null, error: t }
      throw t
    }
  }
  async _refreshAccessToken(e) {
    const t = `#_refreshAccessToken(${e.substring(0, 5)}...)`
    this._debug(t, 'begin')
    try {
      const s = Date.now()
      return await Da(
        async n => (
          n > 0 && (await Pa(200 * Math.pow(2, n - 1))),
          this._debug(t, 'refreshing attempt', n),
          await D(
            this.fetch,
            'POST',
            `${this.url}/token?grant_type=refresh_token`,
            { body: { refresh_token: e }, headers: this.headers, xform: ie }
          )
        ),
        (n, i) => {
          const a = 200 * Math.pow(2, n)
          return i && Bt(i) && Date.now() + a - s < De
        }
      )
    } catch (s) {
      if ((this._debug(t, 'error', s), T(s)))
        return { data: { session: null, user: null }, error: s }
      throw s
    } finally {
      this._debug(t, 'end')
    }
  }
  _isValidSession(e) {
    return (
      typeof e == 'object' &&
      e !== null &&
      'access_token' in e &&
      'refresh_token' in e &&
      'expires_at' in e
    )
  }
  async _handleProviderSignIn(e, t) {
    const s = await this._getUrlForProvider(`${this.url}/authorize`, e, {
      redirectTo: t.redirectTo,
      scopes: t.scopes,
      queryParams: t.queryParams,
    })
    return (
      this._debug(
        '#_handleProviderSignIn()',
        'provider',
        e,
        'options',
        t,
        'url',
        s
      ),
      X() && !t.skipBrowserRedirect && window.location.assign(s),
      { data: { provider: e, url: s }, error: null }
    )
  }
  async _recoverAndRefresh() {
    var e, t
    const s = '#_recoverAndRefresh()'
    this._debug(s, 'begin')
    try {
      const n = await me(this.storage, this.storageKey)
      if (n && this.userStorage) {
        let a = await me(this.userStorage, this.storageKey + '-user')
        ;(!this.storage.isServer &&
          Object.is(this.storage, this.userStorage) &&
          !a &&
          ((a = { user: n.user }),
          await Ie(this.userStorage, this.storageKey + '-user', a)),
          (n.user = (e = a?.user) !== null && e !== void 0 ? e : Gt()))
      } else if (n && !n.user && !n.user) {
        const a = await me(this.storage, this.storageKey + '-user')
        a && a?.user
          ? ((n.user = a.user),
            await oe(this.storage, this.storageKey + '-user'),
            await Ie(this.storage, this.storageKey, n))
          : (n.user = Gt())
      }
      if (
        (this._debug(s, 'session from storage', n), !this._isValidSession(n))
      ) {
        ;(this._debug(s, 'session is not valid'),
          n !== null && (await this._removeSession()))
        return
      }
      const i =
        ((t = n.expires_at) !== null && t !== void 0 ? t : 1 / 0) * 1e3 -
          Date.now() <
        qt
      if (
        (this._debug(
          s,
          `session has${i ? '' : ' not'} expired with margin of ${qt}s`
        ),
        i)
      ) {
        if (this.autoRefreshToken && n.refresh_token) {
          const { error: a } = await this._callRefreshToken(n.refresh_token)
          a &&
            (console.error(a),
            Bt(a) ||
              (this._debug(
                s,
                'refresh failed with a non-retryable error, removing the session',
                a
              ),
              await this._removeSession()))
        }
      } else if (n.user && n.user.__isUserNotAvailableProxy === !0)
        try {
          const { data: a, error: l } = await this._getUser(n.access_token)
          !l && a?.user
            ? ((n.user = a.user),
              await this._saveSession(n),
              await this._notifyAllSubscribers('SIGNED_IN', n))
            : this._debug(
                s,
                'could not get user data, skipping SIGNED_IN notification'
              )
        } catch (a) {
          ;(console.error('Error getting user data:', a),
            this._debug(
              s,
              'error getting user data, skipping SIGNED_IN notification',
              a
            ))
        }
      else await this._notifyAllSubscribers('SIGNED_IN', n)
    } catch (n) {
      ;(this._debug(s, 'error', n), console.error(n))
      return
    } finally {
      this._debug(s, 'end')
    }
  }
  async _callRefreshToken(e) {
    var t, s
    if (!e) throw new ce()
    if (this.refreshingDeferred) return this.refreshingDeferred.promise
    const n = `#_callRefreshToken(${e.substring(0, 5)}...)`
    this._debug(n, 'begin')
    try {
      this.refreshingDeferred = new It()
      const { data: i, error: a } = await this._refreshAccessToken(e)
      if (a) throw a
      if (!i.session) throw new ce()
      ;(await this._saveSession(i.session),
        await this._notifyAllSubscribers('TOKEN_REFRESHED', i.session))
      const l = { session: i.session, error: null }
      return (this.refreshingDeferred.resolve(l), l)
    } catch (i) {
      if ((this._debug(n, 'error', i), T(i))) {
        const a = { session: null, error: i }
        return (
          Bt(i) || (await this._removeSession()),
          (t = this.refreshingDeferred) === null ||
            t === void 0 ||
            t.resolve(a),
          a
        )
      }
      throw (
        (s = this.refreshingDeferred) === null || s === void 0 || s.reject(i),
        i
      )
    } finally {
      ;((this.refreshingDeferred = null), this._debug(n, 'end'))
    }
  }
  async _notifyAllSubscribers(e, t, s = !0) {
    const n = `#_notifyAllSubscribers(${e})`
    this._debug(n, 'begin', t, `broadcast = ${s}`)
    try {
      this.broadcastChannel &&
        s &&
        this.broadcastChannel.postMessage({ event: e, session: t })
      const i = [],
        a = Array.from(this.stateChangeEmitters.values()).map(async l => {
          try {
            await l.callback(e, t)
          } catch (c) {
            i.push(c)
          }
        })
      if ((await Promise.all(a), i.length > 0)) {
        for (let l = 0; l < i.length; l += 1) console.error(i[l])
        throw i[0]
      }
    } finally {
      this._debug(n, 'end')
    }
  }
  async _saveSession(e) {
    ;(this._debug('#_saveSession()', e), (this.suppressGetSessionWarning = !0))
    const t = Object.assign({}, e),
      s = t.user && t.user.__isUserNotAvailableProxy === !0
    if (this.userStorage) {
      !s &&
        t.user &&
        (await Ie(this.userStorage, this.storageKey + '-user', {
          user: t.user,
        }))
      const n = Object.assign({}, t)
      delete n.user
      const i = Ks(n)
      await Ie(this.storage, this.storageKey, i)
    } else {
      const n = Ks(t)
      await Ie(this.storage, this.storageKey, n)
    }
  }
  async _removeSession() {
    ;(this._debug('#_removeSession()'),
      await oe(this.storage, this.storageKey),
      await oe(this.storage, this.storageKey + '-code-verifier'),
      await oe(this.storage, this.storageKey + '-user'),
      this.userStorage &&
        (await oe(this.userStorage, this.storageKey + '-user')),
      await this._notifyAllSubscribers('SIGNED_OUT', null))
  }
  _removeVisibilityChangedCallback() {
    this._debug('#_removeVisibilityChangedCallback()')
    const e = this.visibilityChangedCallback
    this.visibilityChangedCallback = null
    try {
      e &&
        X() &&
        window?.removeEventListener &&
        window.removeEventListener('visibilitychange', e)
    } catch (t) {
      console.error('removing visibilitychange callback failed', t)
    }
  }
  async _startAutoRefresh() {
    ;(await this._stopAutoRefresh(), this._debug('#_startAutoRefresh()'))
    const e = setInterval(() => this._autoRefreshTokenTick(), De)
    ;((this.autoRefreshTicker = e),
      e && typeof e == 'object' && typeof e.unref == 'function'
        ? e.unref()
        : typeof Deno < 'u' &&
          typeof Deno.unrefTimer == 'function' &&
          Deno.unrefTimer(e),
      setTimeout(async () => {
        ;(await this.initializePromise, await this._autoRefreshTokenTick())
      }, 0))
  }
  async _stopAutoRefresh() {
    this._debug('#_stopAutoRefresh()')
    const e = this.autoRefreshTicker
    ;((this.autoRefreshTicker = null), e && clearInterval(e))
  }
  async startAutoRefresh() {
    ;(this._removeVisibilityChangedCallback(), await this._startAutoRefresh())
  }
  async stopAutoRefresh() {
    ;(this._removeVisibilityChangedCallback(), await this._stopAutoRefresh())
  }
  async _autoRefreshTokenTick() {
    this._debug('#_autoRefreshTokenTick()', 'begin')
    try {
      await this._acquireLock(0, async () => {
        try {
          const e = Date.now()
          try {
            return await this._useSession(async t => {
              const {
                data: { session: s },
              } = t
              if (!s || !s.refresh_token || !s.expires_at) {
                this._debug('#_autoRefreshTokenTick()', 'no session')
                return
              }
              const n = Math.floor((s.expires_at * 1e3 - e) / De)
              ;(this._debug(
                '#_autoRefreshTokenTick()',
                `access token expires in ${n} ticks, a tick lasts ${De}ms, refresh threshold is ${ls} ticks`
              ),
                n <= ls && (await this._callRefreshToken(s.refresh_token)))
            })
          } catch (t) {
            console.error(
              'Auto refresh tick failed with error. This is likely a transient error.',
              t
            )
          }
        } finally {
          this._debug('#_autoRefreshTokenTick()', 'end')
        }
      })
    } catch (e) {
      if (e.isAcquireTimeout || e instanceof Qr)
        this._debug('auto refresh token tick lock not available')
      else throw e
    }
  }
  async _handleVisibilityChange() {
    if (
      (this._debug('#_handleVisibilityChange()'),
      !X() || !window?.addEventListener)
    )
      return (this.autoRefreshToken && this.startAutoRefresh(), !1)
    try {
      ;((this.visibilityChangedCallback = async () =>
        await this._onVisibilityChanged(!1)),
        window?.addEventListener(
          'visibilitychange',
          this.visibilityChangedCallback
        ),
        await this._onVisibilityChanged(!0))
    } catch (e) {
      console.error('_handleVisibilityChange', e)
    }
  }
  async _onVisibilityChanged(e) {
    const t = `#_onVisibilityChanged(${e})`
    ;(this._debug(t, 'visibilityState', document.visibilityState),
      document.visibilityState === 'visible'
        ? (this.autoRefreshToken && this._startAutoRefresh(),
          e ||
            (await this.initializePromise,
            await this._acquireLock(-1, async () => {
              if (document.visibilityState !== 'visible') {
                this._debug(
                  t,
                  'acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting'
                )
                return
              }
              await this._recoverAndRefresh()
            })))
        : document.visibilityState === 'hidden' &&
          this.autoRefreshToken &&
          this._stopAutoRefresh())
  }
  async _getUrlForProvider(e, t, s) {
    const n = [`provider=${encodeURIComponent(t)}`]
    if (
      (s?.redirectTo &&
        n.push(`redirect_to=${encodeURIComponent(s.redirectTo)}`),
      s?.scopes && n.push(`scopes=${encodeURIComponent(s.scopes)}`),
      this.flowType === 'pkce')
    ) {
      const [i, a] = await Ce(this.storage, this.storageKey),
        l = new URLSearchParams({
          code_challenge: `${encodeURIComponent(i)}`,
          code_challenge_method: `${encodeURIComponent(a)}`,
        })
      n.push(l.toString())
    }
    if (s?.queryParams) {
      const i = new URLSearchParams(s.queryParams)
      n.push(i.toString())
    }
    return (
      s?.skipBrowserRedirect &&
        n.push(`skip_http_redirect=${s.skipBrowserRedirect}`),
      `${e}?${n.join('&')}`
    )
  }
  async _unenroll(e) {
    try {
      return await this._useSession(async t => {
        var s
        const { data: n, error: i } = t
        return i
          ? { data: null, error: i }
          : await D(this.fetch, 'DELETE', `${this.url}/factors/${e.factorId}`, {
              headers: this.headers,
              jwt:
                (s = n?.session) === null || s === void 0
                  ? void 0
                  : s.access_token,
            })
      })
    } catch (t) {
      if (T(t)) return { data: null, error: t }
      throw t
    }
  }
  async _enroll(e) {
    try {
      return await this._useSession(async t => {
        var s, n
        const { data: i, error: a } = t
        if (a) return { data: null, error: a }
        const l = Object.assign(
            { friendly_name: e.friendlyName, factor_type: e.factorType },
            e.factorType === 'phone' ? { phone: e.phone } : { issuer: e.issuer }
          ),
          { data: c, error: d } = await D(
            this.fetch,
            'POST',
            `${this.url}/factors`,
            {
              body: l,
              headers: this.headers,
              jwt:
                (s = i?.session) === null || s === void 0
                  ? void 0
                  : s.access_token,
            }
          )
        return d
          ? { data: null, error: d }
          : (e.factorType === 'totp' &&
              !((n = c?.totp) === null || n === void 0) &&
              n.qr_code &&
              (c.totp.qr_code = `data:image/svg+xml;utf-8,${c.totp.qr_code}`),
            { data: c, error: null })
      })
    } catch (t) {
      if (T(t)) return { data: null, error: t }
      throw t
    }
  }
  async _verify(e) {
    return this._acquireLock(-1, async () => {
      try {
        return await this._useSession(async t => {
          var s
          const { data: n, error: i } = t
          if (i) return { data: null, error: i }
          const { data: a, error: l } = await D(
            this.fetch,
            'POST',
            `${this.url}/factors/${e.factorId}/verify`,
            {
              body: { code: e.code, challenge_id: e.challengeId },
              headers: this.headers,
              jwt:
                (s = n?.session) === null || s === void 0
                  ? void 0
                  : s.access_token,
            }
          )
          return l
            ? { data: null, error: l }
            : (await this._saveSession(
                Object.assign(
                  { expires_at: Math.round(Date.now() / 1e3) + a.expires_in },
                  a
                )
              ),
              await this._notifyAllSubscribers('MFA_CHALLENGE_VERIFIED', a),
              { data: a, error: l })
        })
      } catch (t) {
        if (T(t)) return { data: null, error: t }
        throw t
      }
    })
  }
  async _challenge(e) {
    return this._acquireLock(-1, async () => {
      try {
        return await this._useSession(async t => {
          var s
          const { data: n, error: i } = t
          return i
            ? { data: null, error: i }
            : await D(
                this.fetch,
                'POST',
                `${this.url}/factors/${e.factorId}/challenge`,
                {
                  body: { channel: e.channel },
                  headers: this.headers,
                  jwt:
                    (s = n?.session) === null || s === void 0
                      ? void 0
                      : s.access_token,
                }
              )
        })
      } catch (t) {
        if (T(t)) return { data: null, error: t }
        throw t
      }
    })
  }
  async _challengeAndVerify(e) {
    const { data: t, error: s } = await this._challenge({
      factorId: e.factorId,
    })
    return s
      ? { data: null, error: s }
      : await this._verify({
          factorId: e.factorId,
          challengeId: t.id,
          code: e.code,
        })
  }
  async _listFactors() {
    const {
      data: { user: e },
      error: t,
    } = await this.getUser()
    if (t) return { data: null, error: t }
    const s = e?.factors || [],
      n = s.filter(a => a.factor_type === 'totp' && a.status === 'verified'),
      i = s.filter(a => a.factor_type === 'phone' && a.status === 'verified')
    return { data: { all: s, totp: n, phone: i }, error: null }
  }
  async _getAuthenticatorAssuranceLevel() {
    return this._acquireLock(
      -1,
      async () =>
        await this._useSession(async e => {
          var t, s
          const {
            data: { session: n },
            error: i,
          } = e
          if (i) return { data: null, error: i }
          if (!n)
            return {
              data: {
                currentLevel: null,
                nextLevel: null,
                currentAuthenticationMethods: [],
              },
              error: null,
            }
          const { payload: a } = Ht(n.access_token)
          let l = null
          a.aal && (l = a.aal)
          let c = l
          ;((s =
            (t = n.user.factors) === null || t === void 0
              ? void 0
              : t.filter(h => h.status === 'verified')) !== null && s !== void 0
            ? s
            : []
          ).length > 0 && (c = 'aal2')
          const u = a.amr || []
          return {
            data: {
              currentLevel: l,
              nextLevel: c,
              currentAuthenticationMethods: u,
            },
            error: null,
          }
        })
    )
  }
  async fetchJwk(e, t = { keys: [] }) {
    let s = t.keys.find(l => l.kid === e)
    if (s) return s
    const n = Date.now()
    if (
      ((s = this.jwks.keys.find(l => l.kid === e)),
      s && this.jwks_cached_at + ga > n)
    )
      return s
    const { data: i, error: a } = await D(
      this.fetch,
      'GET',
      `${this.url}/.well-known/jwks.json`,
      { headers: this.headers }
    )
    if (a) throw a
    return !i.keys ||
      i.keys.length === 0 ||
      ((this.jwks = i),
      (this.jwks_cached_at = n),
      (s = i.keys.find(l => l.kid === e)),
      !s)
      ? null
      : s
  }
  async getClaims(e, t = {}) {
    try {
      let s = e
      if (!s) {
        const { data: f, error: g } = await this.getSession()
        if (g || !f.session) return { data: null, error: g }
        s = f.session.access_token
      }
      const {
        header: n,
        payload: i,
        signature: a,
        raw: { header: l, payload: c },
      } = Ht(s)
      t?.allowExpired || Ma(i.exp)
      const d =
        !n.alg ||
        n.alg.startsWith('HS') ||
        !n.kid ||
        !('crypto' in globalThis && 'subtle' in globalThis.crypto)
          ? null
          : await this.fetchJwk(n.kid, t?.keys ? { keys: t.keys } : t?.jwks)
      if (!d) {
        const { error: f } = await this.getUser(s)
        if (f) throw f
        return { data: { claims: i, header: n, signature: a }, error: null }
      }
      const u = Ua(n.alg),
        h = await crypto.subtle.importKey('jwk', d, u, !0, ['verify'])
      if (!(await crypto.subtle.verify(u, h, a, Sa(`${l}.${c}`))))
        throw new us('Invalid JWT signature')
      return { data: { claims: i, header: n, signature: a }, error: null }
    } catch (s) {
      if (T(s)) return { data: null, error: s }
      throw s
    }
  }
}
tt.nextInstanceID = 0
const so = tt
class ro extends so {
  constructor(e) {
    super(e)
  }
}
var no = function (r, e, t, s) {
  function n(i) {
    return i instanceof t
      ? i
      : new t(function (a) {
          a(i)
        })
  }
  return new (t || (t = Promise))(function (i, a) {
    function l(u) {
      try {
        d(s.next(u))
      } catch (h) {
        a(h)
      }
    }
    function c(u) {
      try {
        d(s.throw(u))
      } catch (h) {
        a(h)
      }
    }
    function d(u) {
      u.done ? i(u.value) : n(u.value).then(l, c)
    }
    d((s = s.apply(r, e || [])).next())
  })
}
class io {
  constructor(e, t, s) {
    var n, i, a
    ;((this.supabaseUrl = e), (this.supabaseKey = t))
    const l = da(e)
    if (!t) throw new Error('supabaseKey is required.')
    ;((this.realtimeUrl = new URL('realtime/v1', l)),
      (this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace(
        'http',
        'ws'
      )),
      (this.authUrl = new URL('auth/v1', l)),
      (this.storageUrl = new URL('storage/v1', l)),
      (this.functionsUrl = new URL('functions/v1', l)))
    const c = `sb-${l.hostname.split('.')[0]}-auth-token`,
      d = {
        db: ea,
        realtime: sa,
        auth: Object.assign(Object.assign({}, ta), { storageKey: c }),
        global: Xi,
      },
      u = ca(s ?? {}, d)
    ;((this.storageKey =
      (n = u.auth.storageKey) !== null && n !== void 0 ? n : ''),
      (this.headers = (i = u.global.headers) !== null && i !== void 0 ? i : {}),
      u.accessToken
        ? ((this.accessToken = u.accessToken),
          (this.auth = new Proxy(
            {},
            {
              get: (h, p) => {
                throw new Error(
                  `@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(p)} is not possible`
                )
              },
            }
          )))
        : (this.auth = this._initSupabaseAuthClient(
            (a = u.auth) !== null && a !== void 0 ? a : {},
            this.headers,
            u.global.fetch
          )),
      (this.fetch = aa(t, this._getAccessToken.bind(this), u.global.fetch)),
      (this.realtime = this._initRealtimeClient(
        Object.assign(
          {
            headers: this.headers,
            accessToken: this._getAccessToken.bind(this),
          },
          u.realtime
        )
      )),
      (this.rest = new xi(new URL('rest/v1', l).href, {
        headers: this.headers,
        schema: u.db.schema,
        fetch: this.fetch,
      })),
      (this.storage = new Qi(
        this.storageUrl.href,
        this.headers,
        this.fetch,
        s?.storage
      )),
      u.accessToken || this._listenForAuthEvents())
  }
  get functions() {
    return new Zn(this.functionsUrl.href, {
      headers: this.headers,
      customFetch: this.fetch,
    })
  }
  from(e) {
    return this.rest.from(e)
  }
  schema(e) {
    return this.rest.schema(e)
  }
  rpc(e, t = {}, s = {}) {
    return this.rest.rpc(e, t, s)
  }
  channel(e, t = { config: {} }) {
    return this.realtime.channel(e, t)
  }
  getChannels() {
    return this.realtime.getChannels()
  }
  removeChannel(e) {
    return this.realtime.removeChannel(e)
  }
  removeAllChannels() {
    return this.realtime.removeAllChannels()
  }
  _getAccessToken() {
    var e, t
    return no(this, void 0, void 0, function* () {
      if (this.accessToken) return yield this.accessToken()
      const { data: s } = yield this.auth.getSession()
      return (t =
        (e = s.session) === null || e === void 0 ? void 0 : e.access_token) !==
        null && t !== void 0
        ? t
        : this.supabaseKey
    })
  }
  _initSupabaseAuthClient(
    {
      autoRefreshToken: e,
      persistSession: t,
      detectSessionInUrl: s,
      storage: n,
      userStorage: i,
      storageKey: a,
      flowType: l,
      lock: c,
      debug: d,
    },
    u,
    h
  ) {
    const p = {
      Authorization: `Bearer ${this.supabaseKey}`,
      apikey: `${this.supabaseKey}`,
    }
    return new ro({
      url: this.authUrl.href,
      headers: Object.assign(Object.assign({}, p), u),
      storageKey: a,
      autoRefreshToken: e,
      persistSession: t,
      detectSessionInUrl: s,
      storage: n,
      userStorage: i,
      flowType: l,
      lock: c,
      debug: d,
      fetch: h,
      hasCustomAuthorizationHeader: Object.keys(this.headers).some(
        f => f.toLowerCase() === 'authorization'
      ),
    })
  }
  _initRealtimeClient(e) {
    return new Li(
      this.realtimeUrl.href,
      Object.assign(Object.assign({}, e), {
        params: Object.assign({ apikey: this.supabaseKey }, e?.params),
      })
    )
  }
  _listenForAuthEvents() {
    return this.auth.onAuthStateChange((t, s) => {
      this._handleTokenChanged(t, 'CLIENT', s?.access_token)
    })
  }
  _handleTokenChanged(e, t, s) {
    ;(e === 'TOKEN_REFRESHED' || e === 'SIGNED_IN') &&
    this.changedAccessToken !== s
      ? (this.changedAccessToken = s)
      : e === 'SIGNED_OUT' &&
        (this.realtime.setAuth(),
        t == 'STORAGE' && this.auth.signOut(),
        (this.changedAccessToken = void 0))
  }
}
const Yr = (r, e, t) => new io(r, e, t)
function ao() {
  if (typeof window < 'u' || typeof process > 'u') return !1
  const r = process.version
  if (r == null) return !1
  const e = r.match(/^v(\d+)\./)
  return e ? parseInt(e[1], 10) <= 18 : !1
}
ao() &&
  console.warn(
    '⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217'
  )
const Zr = 'https://rcdyadsluzzzsybwrmlz.supabase.co',
  oo =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZHlhZHNsdXp6enN5YndybWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzM3ODksImV4cCI6MjA3Mzg0OTc4OX0.m2Jxd5ZwnUtAGuxw_Sj0__kcJUlILdKTJJbwESZP9c4'
let Vt = null,
  Kt = null
const F =
    (Vt ||
      (Vt = Yr(Zr, oo, {
        auth: {
          autoRefreshToken: !0,
          persistSession: !0,
          detectSessionInUrl: !0,
          storage: typeof window < 'u' ? window.localStorage : void 0,
          storageKey: 'bhm-supabase-auth',
        },
        global: {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      })),
    Vt),
  lo =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZHlhZHNsdXp6enN5YndybWx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3Mzc4OSwiZXhwIjoyMDczODQ5Nzg5fQ.QT-P0WDDOD8AsM3LVCpz0LAjr-7O-D8nQhSs8YMBuLY'
;(Kt ||
  (Kt = Yr(Zr, lo, { auth: { autoRefreshToken: !1, persistSession: !1 } })),
  Kt)
const co = r => {
    switch (r) {
      case 'admin':
        return {
          canManageStaff: !0,
          canManageDepartments: !0,
          canViewAllTasks: !0,
          canManageConservation: !0,
          canExportData: !0,
          canManageSettings: !0,
        }
      case 'responsabile':
        return {
          canManageStaff: !0,
          canManageDepartments: !0,
          canViewAllTasks: !0,
          canManageConservation: !0,
          canExportData: !1,
          canManageSettings: !1,
        }
      case 'dipendente':
      case 'collaboratore':
        return {
          canManageStaff: !1,
          canManageDepartments: !1,
          canViewAllTasks: !1,
          canManageConservation: !1,
          canExportData: !1,
          canManageSettings: !1,
        }
      case 'guest':
      default:
        return {
          canManageStaff: !1,
          canManageDepartments: !1,
          canViewAllTasks: !1,
          canManageConservation: !1,
          canExportData: !1,
          canManageSettings: !1,
        }
    }
  },
  xe = () => {
    const { user: r, isLoaded: e, isSignedIn: t } = Wn(),
      s = r,
      {
        data: n,
        isLoading: i,
        error: a,
        refetch: l,
      } = Le({
        queryKey: ['userProfile', s?.id],
        queryFn: async () => {
          if (!s?.emailAddresses?.[0]?.emailAddress) return null
          const w = s.emailAddresses[0].emailAddress,
            { data: v } = await F.from('user_profiles')
              .select('*, staff_id, role')
              .eq('clerk_user_id', s.id)
              .single()
          if (v) return v
          const { data: A, error: j } = await F.from('staff')
            .select('id, company_id, role, name, email')
            .eq('email', w)
            .single()
          if (j && j.code !== 'PGRST116')
            throw (
              console.error('Error checking staff table:', j),
              new Error('Failed to check staff membership')
            )
          const O = A?.role || 'guest',
            S = A?.company_id || null,
            N = A?.id || null,
            { data: $, error: M } = await F.from('user_profiles')
              .insert({
                clerk_user_id: s.id,
                email: w,
                first_name: s.firstName,
                last_name: s.lastName,
                company_id: S,
                staff_id: N,
                role: O,
              })
              .select()
              .single()
          if (M)
            throw (
              console.error('Error creating user profile:', M),
              new Error('Failed to create user profile')
            )
          return $
        },
        enabled: !!s?.id && t,
        staleTime: 5 * 60 * 1e3,
        retry: 3,
      }),
      c = !e || i,
      d = t && !!n,
      u = n?.role || 'guest',
      h = co(u),
      p = w => h[w],
      f = w => (Array.isArray(w) ? w : [w]).includes(u),
      g = w => w.some(v => u === v),
      m = u !== 'guest',
      y =
        n?.first_name && n?.last_name
          ? `${n.first_name} ${n.last_name}`
          : s?.firstName && s?.lastName
            ? `${s.firstName} ${s.lastName}`
            : n?.email || 'User',
      x = a ? 'Failed to load user profile' : null,
      b = s
    return (
      b && n?.company_id && (b.company_id = n.company_id),
      b && n?.role && (b.role = n.role),
      {
        isLoading: c,
        isClerkLoaded: e,
        isProfileLoading: i,
        isSignedIn: t,
        isAuthenticated: d,
        isAuthorized: m,
        user: b,
        userId: s?.id || null,
        userProfile: n,
        userRole: u,
        permissions: h,
        displayName: y,
        companyId: n?.company_id,
        hasPermission: p,
        hasRole: f,
        hasAnyRole: g,
        refetchProfile: l,
        authError: x,
      }
    )
  },
  uo = 864e5,
  Xr = 6e4,
  Ts = 36e5,
  Xs = Symbol.for('constructDateFrom')
function Ue(r, e) {
  return typeof r == 'function'
    ? r(e)
    : r && typeof r == 'object' && Xs in r
      ? r[Xs](e)
      : r instanceof Date
        ? new r.constructor(e)
        : new Date(e)
}
function ue(r, e) {
  return Ue(r, r)
}
function Xe(r, e, t) {
  const s = ue(r)
  return isNaN(e) ? Ue(r, NaN) : (e && s.setDate(s.getDate() + e), s)
}
function ho(r, e, t) {
  const s = ue(r)
  if (isNaN(e)) return Ue(r, NaN)
  const n = s.getDate(),
    i = Ue(r, s.getTime())
  i.setMonth(s.getMonth() + e + 1, 0)
  const a = i.getDate()
  return n >= a ? i : (s.setFullYear(i.getFullYear(), i.getMonth(), n), s)
}
function er(r) {
  const e = ue(r),
    t = new Date(
      Date.UTC(
        e.getFullYear(),
        e.getMonth(),
        e.getDate(),
        e.getHours(),
        e.getMinutes(),
        e.getSeconds(),
        e.getMilliseconds()
      )
    )
  return (t.setUTCFullYear(e.getFullYear()), +r - +t)
}
function Ns(r, ...e) {
  const t = Ue.bind(
    null,
    e.find(s => typeof s == 'object')
  )
  return e.map(t)
}
function hs(r, e) {
  const t = ue(r)
  return (t.setHours(0, 0, 0, 0), t)
}
function fo(r, e, t) {
  const [s, n] = Ns(t?.in, r, e),
    i = hs(s),
    a = hs(n),
    l = +i - er(i),
    c = +a - er(a)
  return Math.round((l - c) / uo)
}
function mo(r, e, t) {
  return Xe(r, e * 7)
}
function go(r, e, t) {
  const [s, n] = Ns(t?.in, r, e),
    i = tr(s, n),
    a = Math.abs(fo(s, n))
  s.setDate(s.getDate() - i * a)
  const l = +(tr(s, n) === -i),
    c = i * (a - l)
  return c === 0 ? 0 : c
}
function tr(r, e) {
  const t =
    r.getFullYear() - e.getFullYear() ||
    r.getMonth() - e.getMonth() ||
    r.getDate() - e.getDate() ||
    r.getHours() - e.getHours() ||
    r.getMinutes() - e.getMinutes() ||
    r.getSeconds() - e.getSeconds() ||
    r.getMilliseconds() - e.getMilliseconds()
  return t < 0 ? -1 : t > 0 ? 1 : t
}
function po(r) {
  return e => {
    const s = (r ? Math[r] : Math.trunc)(e)
    return s === 0 ? 0 : s
  }
}
function yo(r, e, t) {
  const [s, n] = Ns(t?.in, r, e),
    i = (+s - +n) / Ts
  return po(t?.roundingMethod)(i)
}
function bo(r) {
  return +ue(r) < Date.now()
}
function vo(r, e) {
  const t = () => Ue(e?.in, NaN),
    n = ko(r)
  let i
  if (n.date) {
    const d = jo(n.date, 2)
    i = So(d.restDateString, d.year)
  }
  if (!i || isNaN(+i)) return t()
  const a = +i
  let l = 0,
    c
  if (n.time && ((l = Co(n.time)), isNaN(l))) return t()
  if (n.timezone) {
    if (((c = Eo(n.timezone)), isNaN(c))) return t()
  } else {
    const d = new Date(a + l),
      u = ue(0)
    return (
      u.setFullYear(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      u.setHours(
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds(),
        d.getUTCMilliseconds()
      ),
      u
    )
  }
  return ue(a + l + c)
}
const yt = {
    dateTimeDelimiter: /[T ]/,
    timeZoneDelimiter: /[Z ]/i,
    timezone: /([Z+-].*)$/,
  },
  xo = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/,
  wo =
    /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/,
  _o = /^([+-])(\d{2})(?::?(\d{2}))?$/
function ko(r) {
  const e = {},
    t = r.split(yt.dateTimeDelimiter)
  let s
  if (t.length > 2) return e
  if (
    (/:/.test(t[0])
      ? (s = t[0])
      : ((e.date = t[0]),
        (s = t[1]),
        yt.timeZoneDelimiter.test(e.date) &&
          ((e.date = r.split(yt.timeZoneDelimiter)[0]),
          (s = r.substr(e.date.length, r.length)))),
    s)
  ) {
    const n = yt.timezone.exec(s)
    n ? ((e.time = s.replace(n[1], '')), (e.timezone = n[1])) : (e.time = s)
  }
  return e
}
function jo(r, e) {
  const t = new RegExp(
      '^(?:(\\d{4}|[+-]\\d{' +
        (4 + e) +
        '})|(\\d{2}|[+-]\\d{' +
        (2 + e) +
        '})$)'
    ),
    s = r.match(t)
  if (!s) return { year: NaN, restDateString: '' }
  const n = s[1] ? parseInt(s[1]) : null,
    i = s[2] ? parseInt(s[2]) : null
  return {
    year: i === null ? n : i * 100,
    restDateString: r.slice((s[1] || s[2]).length),
  }
}
function So(r, e) {
  if (e === null) return new Date(NaN)
  const t = r.match(xo)
  if (!t) return new Date(NaN)
  const s = !!t[4],
    n = We(t[1]),
    i = We(t[2]) - 1,
    a = We(t[3]),
    l = We(t[4]),
    c = We(t[5]) - 1
  if (s) return Do(e, l, c) ? To(e, l, c) : new Date(NaN)
  {
    const d = new Date(0)
    return !Ao(e, i, a) || !Po(e, n)
      ? new Date(NaN)
      : (d.setUTCFullYear(e, i, Math.max(n, a)), d)
  }
}
function We(r) {
  return r ? parseInt(r) : 1
}
function Co(r) {
  const e = r.match(wo)
  if (!e) return NaN
  const t = Jt(e[1]),
    s = Jt(e[2]),
    n = Jt(e[3])
  return Io(t, s, n) ? t * Ts + s * Xr + n * 1e3 : NaN
}
function Jt(r) {
  return (r && parseFloat(r.replace(',', '.'))) || 0
}
function Eo(r) {
  if (r === 'Z') return 0
  const e = r.match(_o)
  if (!e) return 0
  const t = e[1] === '+' ? -1 : 1,
    s = parseInt(e[2]),
    n = (e[3] && parseInt(e[3])) || 0
  return Oo(s, n) ? t * (s * Ts + n * Xr) : NaN
}
function To(r, e, t) {
  const s = new Date(0)
  s.setUTCFullYear(r, 0, 4)
  const n = s.getUTCDay() || 7,
    i = (e - 1) * 7 + t + 1 - n
  return (s.setUTCDate(s.getUTCDate() + i), s)
}
const No = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
function en(r) {
  return r % 400 === 0 || (r % 4 === 0 && r % 100 !== 0)
}
function Ao(r, e, t) {
  return e >= 0 && e <= 11 && t >= 1 && t <= (No[e] || (en(r) ? 29 : 28))
}
function Po(r, e) {
  return e >= 1 && e <= (en(r) ? 366 : 365)
}
function Do(r, e, t) {
  return e >= 1 && e <= 53 && t >= 0 && t <= 6
}
function Io(r, e, t) {
  return r === 24
    ? e === 0 && t === 0
    : t >= 0 && t < 60 && e >= 0 && e < 60 && r >= 0 && r < 25
}
function Oo(r, e) {
  return e >= 0 && e <= 59
}
function sr(r, e, t) {
  const s = ue(r)
  return (s.setHours(e), s)
}
const tn = 'calendar-dismissed-alerts',
  Ro = 24,
  rr = 72
function nr() {
  try {
    const r = localStorage.getItem(tn)
    return r ? JSON.parse(r) : []
  } catch {
    return []
  }
}
function ir(r) {
  try {
    localStorage.setItem(tn, JSON.stringify(r))
  } catch (e) {
    console.error('Failed to save dismissed alerts:', e)
  }
}
function sn(r) {
  const e = E.useMemo(() => nr(), []),
    t = E.useMemo(() => {
      const c = new Date(),
        d = []
      return (
        r.forEach(u => {
          if (u.status === 'completed' || u.status === 'cancelled') return
          const h = new Date(u.start),
            p = bo(h) && u.status !== 'completed',
            f = yo(h, c)
          let g = null,
            m = ''
          if (p) {
            g = 'critical'
            const y = Math.abs(Math.floor(f / 24))
            m = `⚠️ SCADUTO da ${y} ${y === 1 ? 'giorno' : 'giorni'}: ${u.title}`
          } else if (u.priority === 'critical' && f <= Ro)
            ((g = 'critical'),
              (m = `🔴 URGENTE (${Math.max(0, f)}h): ${u.title}`))
          else if (
            (u.priority === 'critical' || u.priority === 'high') &&
            f <= rr
          ) {
            g = 'high'
            const y = Math.ceil(f / 24)
            m = `🟠 In scadenza tra ${y} ${y === 1 ? 'giorno' : 'giorni'}: ${u.title}`
          } else
            u.priority === 'high' &&
              f <= rr * 2 &&
              ((g = 'medium'),
              (m = `🟡 Promemoria (${Math.ceil(f / 24)} giorni): ${u.title}`))
          if (g) {
            const y = `${u.id}-${h.getTime()}`
            d.push({
              id: y,
              event: u,
              severity: g,
              message: m,
              isDismissed: e.includes(y),
            })
          }
        }),
        d.sort((u, h) => {
          const p = { critical: 0, high: 1, medium: 2 }
          return p[u.severity] !== p[h.severity]
            ? p[u.severity] - p[h.severity]
            : new Date(u.event.start).getTime() -
                new Date(h.event.start).getTime()
        })
      )
    }, [r, e]),
    s = E.useMemo(() => t.filter(c => !c.isDismissed), [t]),
    n = s.length,
    i = E.useMemo(() => s.filter(c => c.severity === 'critical').length, [s]),
    a = E.useCallback(c => {
      const d = nr()
      d.includes(c) || ir([...d, c])
    }, []),
    l = E.useCallback(() => {
      ir([])
    }, [])
  return {
    alerts: s,
    alertCount: n,
    criticalCount: i,
    dismissAlert: a,
    clearAllAlerts: l,
    dismissedAlerts: e,
  }
}
function Fc(r) {
  const { alertCount: e, criticalCount: t } = sn(r)
  return { count: e, criticalCount: t, hasAlerts: e > 0, hasCritical: t > 0 }
}
const bt = {
    temperature_calibration: {
      label: 'Calibrazione Termometro',
      icon: 'thermometer',
      color: 'blue',
      defaultDuration: 30,
      defaultChecklist: [
        'Verificare calibrazione termometro',
        'Controllare temperatura ambiente',
        'Registrare lettura di riferimento',
        'Documentare eventuali scostamenti',
      ],
    },
    deep_cleaning: {
      label: 'Pulizia Profonda',
      icon: 'spray-can',
      color: 'green',
      defaultDuration: 120,
      defaultChecklist: [
        'Svuotare completamente il vano',
        'Rimuovere tutti i residui alimentari',
        'Pulire con detergente specifico',
        'Disinfettare superfici',
        'Risciacquare e asciugare',
        'Verificare stato delle guarnizioni',
      ],
    },
    defrosting: {
      label: 'Sbrinamento',
      icon: 'snowflake',
      color: 'cyan',
      defaultDuration: 60,
      defaultChecklist: [
        'Svuotare il vano',
        "Spegnere l'apparecchio",
        'Rimuovere il ghiaccio accumulato',
        "Pulire l'acqua di scongelamento",
        'Asciugare completamente',
        'Riaccendere e verificare funzionamento',
      ],
    },
    filter_replacement: {
      label: 'Sostituzione Filtri',
      icon: 'filter',
      color: 'yellow',
      defaultDuration: 45,
      defaultChecklist: [
        'Identificare il filtro da sostituire',
        "Spegnere l'apparecchio",
        'Rimuovere il filtro vecchio',
        'Installare il filtro nuovo',
        'Verificare la tenuta',
        'Riaccendere e testare',
      ],
    },
    seal_inspection: {
      label: 'Controllo Guarnizioni',
      icon: 'search',
      color: 'purple',
      defaultDuration: 30,
      defaultChecklist: [
        'Ispezionare visivamente le guarnizioni',
        'Verificare elasticità e integrità',
        'Controllare aderenza alla porta',
        'Testare tenuta con foglio di carta',
        'Documentare eventuali difetti',
      ],
    },
    compressor_check: {
      label: 'Controllo Compressore',
      icon: 'wrench',
      color: 'red',
      defaultDuration: 90,
      defaultChecklist: [
        'Verificare funzionamento del compressore',
        'Controllare livelli di refrigerante',
        'Ispezionare tubazioni e connessioni',
        'Verificare vibrazioni anomale',
        'Controllare temperatura di esercizio',
        'Documentare stato generale',
      ],
    },
    general_inspection: {
      label: 'Ispezione Generale',
      icon: 'clipboard-check',
      color: 'gray',
      defaultDuration: 60,
      defaultChecklist: [
        'Verificare funzionamento generale',
        'Controllare temperature di esercizio',
        'Ispezionare componenti esterni',
        'Verificare illuminazione interna',
        'Controllare sistema di allarme',
        'Documentare stato complessivo',
      ],
    },
    other: {
      label: 'Altro',
      icon: 'tool',
      color: 'gray',
      defaultDuration: 60,
      defaultChecklist: [
        'Verificare specifiche del task',
        'Controllare strumenti necessari',
        'Eseguire operazioni richieste',
        'Documentare risultati',
        'Verificare completamento',
      ],
    },
  },
  Mc = (r, e, t = 2) => {
    const s = Math.abs(r - e)
    return s <= t ? 'normal' : s <= t * 2 ? 'warning' : 'critical'
  },
  ar = (r, e) =>
    e
      ? 'blast'
      : r <= -15
        ? 'freezer'
        : r <= 8
          ? 'fridge'
          : r >= 15
            ? 'ambient'
            : 'fridge',
  $o = r => {
    const e = new Date()
    if (r.maintenance_due && r.maintenance_due <= e)
      return {
        status: 'critical',
        message: 'Manutenzione scaduta',
        priority: 1,
      }
    if (r.last_temperature_reading) {
      const t = r.last_temperature_reading,
        s = Fo[r.type],
        { min: n, max: i } = s.tempRange
      if (t.temperature < n - 2 || t.temperature > i + 2)
        return {
          status: 'critical',
          message: 'Temperatura fuori controllo',
          priority: 1,
        }
      if (t.temperature < n || t.temperature > i)
        return {
          status: 'warning',
          message: 'Temperatura al limite',
          priority: 2,
        }
    }
    if (r.maintenance_due) {
      const t = Math.ceil((r.maintenance_due.getTime() - e.getTime()) / 864e5)
      if (t <= 7)
        return {
          status: 'warning',
          message: `Manutenzione tra ${t} giorni`,
          priority: 2,
        }
    }
    return { status: 'normal', message: 'Tutto normale', priority: 3 }
  },
  Lo = {
    normal: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
    critical: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
    },
  },
  Fo = {
    ambient: {
      label: 'Ambiente',
      tempRange: { min: 15, max: 25, optimal: 20 },
      icon: 'thermometer',
      color: 'blue',
    },
    fridge: {
      label: 'Frigorifero',
      tempRange: { min: 0, max: 8, optimal: 4 },
      icon: 'snowflake',
      color: 'cyan',
    },
    freezer: {
      label: 'Congelatore',
      tempRange: { min: -25, max: -15, optimal: -20 },
      icon: 'snow',
      color: 'indigo',
    },
    blast: {
      label: 'Abbattitore',
      tempRange: { min: -40, max: 3, optimal: -18 },
      icon: 'wind',
      color: 'purple',
    },
  },
  Uc = Lo,
  zc = {
    ambient: { min: 15, max: 25, optimal: 20 },
    fridge: { min: 0, max: 8, optimal: 4 },
    freezer: { min: -25, max: -15, optimal: -20 },
    blast: { min: -40, max: 3, optimal: -18 },
  },
  qc = {
    scheduled: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    in_progress: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
    overdue: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
    },
    skipped: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
    },
  }
function Mo(r) {
  const { user: e } = xe(),
    t = Tt(),
    s = [
      {
        id: '1',
        company_id: 'test',
        conservation_point_id: '1',
        title: 'Calibrazione Termometro',
        type: 'temperature_calibration',
        frequency: 'daily',
        assigned_to: 'user1',
        next_due: new Date(Date.now() + 2 * 60 * 60 * 1e3),
        estimated_duration: 15,
        priority: 'high',
        status: 'scheduled',
        checklist: [...bt.temperature_calibration.defaultChecklist],
        created_at: new Date(),
        updated_at: new Date(),
        assigned_user: { id: 'user1', name: 'Matteo Cavallaro' },
      },
      {
        id: '2',
        company_id: 'test',
        conservation_point_id: '1',
        title: 'Pulizia Profonda',
        type: 'deep_cleaning',
        frequency: 'weekly',
        assigned_to: 'user2',
        next_due: new Date(Date.now() + 24 * 60 * 60 * 1e3),
        estimated_duration: 30,
        priority: 'medium',
        status: 'scheduled',
        checklist: [...bt.deep_cleaning.defaultChecklist],
        created_at: new Date(),
        updated_at: new Date(),
        assigned_user: { id: 'user2', name: 'Fabrizio Dettori' },
      },
      {
        id: '3',
        company_id: 'test',
        conservation_point_id: '2',
        title: 'Sbrinamento',
        type: 'defrosting',
        frequency: 'monthly',
        assigned_to: 'user1',
        next_due: new Date(Date.now() - 2 * 60 * 60 * 1e3),
        estimated_duration: 45,
        priority: 'high',
        status: 'overdue',
        checklist: [...bt.defrosting.defaultChecklist],
        created_at: new Date(),
        updated_at: new Date(),
        assigned_user: { id: 'user1', name: 'Matteo Cavallaro' },
      },
      {
        id: '4',
        company_id: 'test',
        conservation_point_id: '3',
        title: 'Pulizia Profonda',
        type: 'deep_cleaning',
        frequency: 'daily',
        assigned_to: 'user3',
        next_due: new Date(Date.now() + 4 * 60 * 60 * 1e3),
        estimated_duration: 20,
        priority: 'medium',
        status: 'scheduled',
        checklist: [...bt.deep_cleaning.defaultChecklist],
        created_at: new Date(),
        updated_at: new Date(),
        assigned_user: { id: 'user3', name: 'Elena Guaitoli' },
      },
    ],
    {
      data: n,
      isLoading: i,
      error: a,
    } = Le({
      queryKey: ['maintenance-tasks', r],
      queryFn: async () => (
        console.log('🔧 Using mock data for maintenance tasks'),
        s
      ),
      enabled: !0,
    }),
    l = V({
      mutationFn: async g => {
        if (!e?.company_id) throw new Error('No company ID available')
        const { data: m, error: y } = await F.from('maintenance_tasks')
          .insert([
            { ...g, checklist: g.checklist ?? [], company_id: e.company_id },
          ])
          .select()
          .single()
        if (y) throw y
        return m
      },
      onSuccess: () => {
        ;(t.invalidateQueries({ queryKey: ['maintenance-tasks'] }),
          I.success('Task di manutenzione creato'))
      },
      onError: g => {
        ;(console.error('Error creating maintenance task:', g),
          I.error('Errore nella creazione del task di manutenzione'))
      },
    }),
    c = V({
      mutationFn: async ({ id: g, data: m }) => {
        const { data: y, error: x } = await F.from('maintenance_tasks')
          .update(m)
          .eq('id', g)
          .select()
          .single()
        if (x) throw x
        return y
      },
      onSuccess: () => {
        ;(t.invalidateQueries({ queryKey: ['maintenance-tasks'] }),
          I.success('Task di manutenzione aggiornato'))
      },
      onError: g => {
        ;(console.error('Error updating maintenance task:', g),
          I.error("Errore nell'aggiornamento del task"))
      },
    }),
    d = V({
      mutationFn: async g => {
        const { error: m } = await F.from('maintenance_tasks')
          .delete()
          .eq('id', g)
        if (m) throw m
      },
      onSuccess: () => {
        ;(t.invalidateQueries({ queryKey: ['maintenance-tasks'] }),
          I.success('Task di manutenzione eliminato'))
      },
      onError: g => {
        ;(console.error('Error deleting maintenance task:', g),
          I.error("Errore nell'eliminazione del task"))
      },
    }),
    u = V({
      mutationFn: async g => {
        if (!e?.company_id) throw new Error('No company ID available')
        const { data: m, error: y } = await F.from('maintenance_completions')
          .insert([{ ...g, company_id: e.company_id }])
          .select()
          .single()
        if (y) throw y
        return m
      },
      onSuccess: () => {
        ;(t.invalidateQueries({ queryKey: ['maintenance-tasks'] }),
          t.invalidateQueries({ queryKey: ['maintenance-completions'] }),
          I.success('Manutenzione completata'))
      },
      onError: g => {
        ;(console.error('Error completing maintenance:', g),
          I.error('Errore nel completamento della manutenzione'))
      },
    }),
    h = g => {
      const m = new Date(),
        y = new Date(g.next_due)
      return y < m
        ? 'overdue'
        : (y.getTime() - m.getTime()) / (1e3 * 60 * 60) <= 2
          ? 'pending'
          : 'scheduled'
    },
    p = n ?? [],
    f = {
      total_tasks: p.length,
      completed_tasks: p.filter(g => g.status === 'completed').length,
      overdue_tasks: p.filter(g => h(g) === 'overdue').length,
      completion_rate: p.length
        ? (p.filter(g => g.status === 'completed').length / p.length) * 100
        : 0,
      average_completion_time: 0,
      tasks_by_type: p.reduce(
        (g, m) => ((g[m.type] = (g[m.type] ?? 0) + 1), g),
        {}
      ),
      upcoming_tasks: p
        .filter(g => h(g) !== 'overdue')
        .sort(
          (g, m) =>
            new Date(g.next_due).getTime() - new Date(m.next_due).getTime()
        )
        .slice(0, 5),
    }
  return {
    maintenanceTasks: p,
    isLoading: i,
    error: a,
    stats: f,
    getTaskStatus: h,
    createTask: l.mutate,
    updateTask: c.mutate,
    deleteTask: d.mutate,
    completeTask: u.mutate,
    isCreating: l.isPending,
    isUpdating: c.isPending,
    isDeleting: d.isPending,
    isCompleting: u.isPending,
  }
}
function Uo() {
  const { user: r } = xe(),
    e = Tt(),
    t = [
      {
        id: '1',
        company_id: 'test',
        department_id: '1',
        name: 'Frigorifero Cucina 1',
        setpoint_temp: 4,
        type: 'fridge',
        product_categories: ['Carni fresche', 'Latticini'],
        is_blast_chiller: !1,
        created_at: new Date(),
        updated_at: new Date(),
        department: { id: '1', name: 'Cucina' },
        status: 'normal',
      },
      {
        id: '2',
        company_id: 'test',
        department_id: '1',
        name: 'Freezer Principale',
        setpoint_temp: -18,
        type: 'freezer',
        product_categories: ['Surgelati', 'Gelati'],
        is_blast_chiller: !1,
        created_at: new Date(),
        updated_at: new Date(),
        department: { id: '1', name: 'Cucina' },
        status: 'normal',
      },
      {
        id: '3',
        company_id: 'test',
        department_id: '2',
        name: 'Vetrina Refrigerata',
        setpoint_temp: 6,
        type: 'fridge',
        product_categories: ['Bevande'],
        is_blast_chiller: !1,
        created_at: new Date(),
        updated_at: new Date(),
        department: { id: '2', name: 'Bancone' },
        status: 'warning',
      },
      {
        id: '4',
        company_id: 'test',
        department_id: '1',
        name: 'Abbattitore Rapido',
        setpoint_temp: -35,
        type: 'blast',
        product_categories: ['Preparazioni cotte'],
        is_blast_chiller: !0,
        created_at: new Date(),
        updated_at: new Date(),
        department: { id: '1', name: 'Cucina' },
        status: 'critical',
      },
    ],
    {
      data: s,
      isLoading: n,
      error: i,
    } = Le({
      queryKey: ['conservation-points', r?.company_id],
      queryFn: async () => {
        if (!r?.company_id)
          return (
            console.log(
              '🔧 No company_id, using mock data for conservation points'
            ),
            t
          )
        console.log(
          '🔧 Loading conservation points from Supabase for company:',
          r.company_id
        )
        const { data: m, error: y } = await F.from('conservation_points')
          .select(
            `
          *,
          department:departments(id, name)
        `
          )
          .eq('company_id', r.company_id)
          .order('created_at', { ascending: !1 })
        return y
          ? (console.error('Error loading conservation points:', y),
            console.log('🔧 Fallback to mock data due to error'),
            t)
          : (console.log(
              '✅ Loaded conservation points from Supabase:',
              m?.length || 0
            ),
            m || [])
      },
      enabled: !!r,
    }),
    a = V({
      mutationFn: async ({ conservationPoint: m, maintenanceTasks: y }) => {
        if (!r?.company_id) throw new Error('No company ID available')
        const x = ar(m.setpoint_temp, m.is_blast_chiller),
          { data: b, error: w } = await F.from('conservation_points')
            .insert([{ ...m, company_id: r.company_id, type: x }])
            .select()
            .single()
        if (w) throw w
        if (y.length > 0) {
          const v = y.map(j => ({
              company_id: r.company_id,
              conservation_point_id: b.id,
              title: j.title,
              type: j.type,
              frequency: j.frequency,
              estimated_duration: j.estimated_duration,
              assigned_to: j.assigned_to,
              priority: j.priority,
              next_due: j.next_due.toISOString(),
              status: 'scheduled',
              instructions: j.instructions,
            })),
            { error: A } = await F.from('maintenance_tasks').insert(v)
          A && console.error('Error creating maintenance tasks:', A)
        }
        return b
      },
      onSuccess: () => {
        ;(e.invalidateQueries({ queryKey: ['conservation-points'] }),
          e.invalidateQueries({ queryKey: ['maintenance-tasks'] }),
          I.success('Punto di conservazione creato con successo'))
      },
      onError: m => {
        ;(console.error('Error creating conservation point:', m),
          I.error('Errore nella creazione del punto di conservazione'))
      },
    }),
    l = V({
      mutationFn: async ({ id: m, data: y }) => {
        const x = { ...y }
        y.setpoint_temp !== void 0 &&
          (x.type = ar(y.setpoint_temp, y.is_blast_chiller ?? !1))
        const { data: b, error: w } = await F.from('conservation_points')
          .update(x)
          .eq('id', m)
          .select()
          .single()
        if (w) throw w
        return b
      },
      onSuccess: () => {
        ;(e.invalidateQueries({ queryKey: ['conservation-points'] }),
          I.success('Punto di conservazione aggiornato'))
      },
      onError: m => {
        ;(console.error('Error updating conservation point:', m),
          I.error("Errore nell'aggiornamento del punto di conservazione"))
      },
    }),
    c = V({
      mutationFn: async m => {
        const { error: y } = await F.from('conservation_points')
          .delete()
          .eq('id', m)
        if (y) throw y
      },
      onSuccess: () => {
        ;(e.invalidateQueries({ queryKey: ['conservation-points'] }),
          I.success('Punto di conservazione eliminato'))
      },
      onError: m => {
        ;(console.error('Error deleting conservation point:', m),
          I.error("Errore nell'eliminazione del punto di conservazione"))
      },
    }),
    d = s ?? [],
    u = { normal: 0, warning: 0, critical: 0 },
    h = { ambient: 0, fridge: 0, freezer: 0, blast: 0 },
    p = d.reduce((m, y) => ((m[y.status] = (m[y.status] ?? 0) + 1), m), u),
    f = d.reduce((m, y) => ((m[y.type] = (m[y.type] ?? 0) + 1), m), h),
    g = {
      total_points: d.length,
      by_status: p,
      by_type: f,
      temperature_compliance_rate: 0,
      maintenance_compliance_rate: 0,
      alerts_count: d.filter(m => $o(m).status !== 'normal').length,
    }
  return {
    conservationPoints: d,
    isLoading: n,
    error: i,
    stats: g,
    createConservationPoint: a.mutate,
    updateConservationPoint: l.mutate,
    deleteConservationPoint: c.mutate,
    isCreating: a.isPending,
    isUpdating: l.isPending,
    isDeleting: c.isPending,
  }
}
const zo = [
    'Amministratore',
    'Banconisti',
    'Cuochi',
    'Camerieri',
    'Social & Media Manager',
    'Addetto alle Pulizie',
    'Magazziniere',
    'Altro',
  ],
  Ae = { staff: r => ['staff', r], staffMember: r => ['staffMember', r] },
  rn = () => {
    const { userProfile: r } = xe(),
      e = Tt(),
      t = r?.company_id,
      {
        data: s = [],
        isLoading: n,
        error: i,
        refetch: a,
      } = Le({
        queryKey: Ae.staff(t || ''),
        queryFn: async () => {
          if (!t) throw new Error('Company ID not found')
          const { data: f, error: g } = await F.from('staff')
            .select('*')
            .eq('company_id', t)
            .order('name', { ascending: !0 })
          if (g) throw g
          return f || []
        },
        enabled: !!t,
        staleTime: 5 * 60 * 1e3,
      }),
      l = V({
        mutationFn: async f => {
          if (!t) throw new Error('Company ID not found')
          const { data: g, error: m } = await F.from('staff')
            .insert({
              company_id: t,
              name: f.name,
              role: f.role,
              category: f.category,
              email: f.email || null,
              phone: f.phone || null,
              hire_date: f.hire_date || null,
              status: f.status || 'active',
              notes: f.notes || null,
              haccp_certification: f.haccp_certification || null,
              department_assignments: f.department_assignments || null,
            })
            .select()
            .single()
          if (m) throw m
          return g
        },
        onSuccess: f => {
          ;(e.setQueryData(Ae.staff(t || ''), (g = []) => [...g, f]),
            I.success(`Dipendente "${f.name}" aggiunto con successo`))
        },
        onError: f => {
          ;(console.error('Error creating staff member:', f),
            I.error(`Errore nell'aggiunta del dipendente: ${f.message}`))
        },
      }),
      c = V({
        mutationFn: async ({ id: f, input: g }) => {
          const m = { updated_at: new Date().toISOString() }
          ;(g.name !== void 0 && (m.name = g.name),
            g.role !== void 0 && (m.role = g.role),
            g.category !== void 0 && (m.category = g.category),
            g.email !== void 0 && (m.email = g.email || null),
            g.phone !== void 0 && (m.phone = g.phone || null),
            g.hire_date !== void 0 && (m.hire_date = g.hire_date || null),
            g.status !== void 0 && (m.status = g.status),
            g.notes !== void 0 && (m.notes = g.notes || null),
            g.haccp_certification !== void 0 &&
              (m.haccp_certification = g.haccp_certification || null),
            g.department_assignments !== void 0 &&
              (m.department_assignments = g.department_assignments || null))
          const { data: y, error: x } = await F.from('staff')
            .update(m)
            .eq('id', f)
            .select()
            .single()
          if (x) throw x
          return y
        },
        onSuccess: f => {
          ;(e.setQueryData(Ae.staff(t || ''), (g = []) =>
            g.map(m => (m.id === f.id ? f : m))
          ),
            I.success(`Dipendente "${f.name}" aggiornato con successo`))
        },
        onError: f => {
          ;(console.error('Error updating staff member:', f),
            I.error(`Errore nell'aggiornamento del dipendente: ${f.message}`))
        },
      }),
      d = V({
        mutationFn: async f => {
          const { error: g } = await F.from('staff').delete().eq('id', f)
          if (g) throw g
        },
        onSuccess: (f, g) => {
          ;(e.setQueryData(Ae.staff(t || ''), (m = []) =>
            m.filter(y => y.id !== g)
          ),
            I.success('Dipendente rimosso con successo'))
        },
        onError: f => {
          ;(console.error('Error deleting staff member:', f),
            I.error(`Errore nella rimozione del dipendente: ${f.message}`))
        },
      }),
      u = V({
        mutationFn: async ({ id: f, status: g }) => {
          const { data: m, error: y } = await F.from('staff')
            .update({ status: g, updated_at: new Date().toISOString() })
            .eq('id', f)
            .select()
            .single()
          if (y) throw y
          return m
        },
        onSuccess: f => {
          e.setQueryData(Ae.staff(t || ''), (m = []) =>
            m.map(y => (y.id === f.id ? f : y))
          )
          const g = {
            active: 'attivato',
            inactive: 'disattivato',
            suspended: 'sospeso',
          }[f.status]
          I.success(`Dipendente "${f.name}" ${g} con successo`)
        },
        onError: f => {
          ;(console.error('Error toggling staff status:', f),
            I.error(`Errore nel cambio stato del dipendente: ${f.message}`))
        },
      }),
      h = V({
        mutationFn: async ({ id: f, certification: g }) => {
          const { data: m, error: y } = await F.from('staff')
            .update({
              haccp_certification: g,
              updated_at: new Date().toISOString(),
            })
            .eq('id', f)
            .select()
            .single()
          if (y) throw y
          return m
        },
        onSuccess: f => {
          ;(e.setQueryData(Ae.staff(t || ''), (g = []) =>
            g.map(m => (m.id === f.id ? f : m))
          ),
            I.success(`Certificazione HACCP aggiornata per "${f.name}"`))
        },
        onError: f => {
          ;(console.error('Error updating HACCP certification:', f),
            I.error(
              `Errore nell'aggiornamento della certificazione HACCP: ${f.message}`
            ))
        },
      }),
      p = {
        total: s.length,
        active: s.filter(f => f.status === 'active').length,
        inactive: s.filter(f => f.status === 'inactive').length,
        suspended: s.filter(f => f.status === 'suspended').length,
        byRole: {
          admin: s.filter(f => f.role === 'admin').length,
          responsabile: s.filter(f => f.role === 'responsabile').length,
          dipendente: s.filter(f => f.role === 'dipendente').length,
          collaboratore: s.filter(f => f.role === 'collaboratore').length,
        },
        byCategory: zo.reduce(
          (f, g) => ((f[g] = s.filter(m => m.category === g).length), f),
          {}
        ),
        withHaccpCert: s.filter(f => f.haccp_certification).length,
        haccpExpiringSoon: s.filter(f => {
          if (!f.haccp_certification?.expiry_date) return !1
          const g = new Date(f.haccp_certification.expiry_date),
            m = new Date(),
            y = new Date(m.getTime() + 30 * 24 * 60 * 60 * 1e3)
          return g <= y && g > m
        }).length,
      }
    return {
      staff: s,
      stats: p,
      isLoading: n,
      isCreating: l.isPending,
      isUpdating: c.isPending,
      isDeleting: d.isPending,
      isToggling: u.isPending,
      isUpdatingCertification: h.isPending,
      error: i,
      createError: l.error,
      updateError: c.error,
      deleteError: d.error,
      createStaffMember: l.mutate,
      updateStaffMember: c.mutate,
      deleteStaffMember: d.mutate,
      toggleStaffStatus: u.mutate,
      updateHaccpCertification: h.mutate,
      refetch: a,
      getStaffMemberById: f => s.find(g => g.id === f),
      getStaffByRole: f => s.filter(g => g.role === f),
      getStaffByCategory: f => s.filter(g => g.category === f),
      getStaffByStatus: f => s.filter(g => g.status === f),
      getStaffByDepartment: f =>
        s.filter(g => g.department_assignments?.includes(f)),
    }
  },
  se = {
    products: (r, e) => ['products', r, e],
    product: r => ['product', r],
    productStats: r => ['productStats', r],
    expiringProducts: r => ['expiringProducts', r],
    expiredProducts: r => ['expiredProducts', r],
  },
  qo = r => {
    const { user: e, companyId: t } = xe(),
      s = Tt(),
      n = [
        {
          id: '1',
          company_id: t || '',
          name: 'Latte Fresco Intero',
          category_id: 'cat1',
          department_id: 'dept1',
          conservation_point_id: 'cp1',
          barcode: '1234567890123',
          supplier_name: 'Latteria Centrale',
          purchase_date: new Date('2025-09-15'),
          expiry_date: new Date('2025-09-28'),
          quantity: 10,
          unit: 'litri',
          allergens: [Ft.LATTE],
          status: 'active',
          notes: 'Prodotto fresco di alta qualità',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          company_id: t || '',
          name: 'Parmigiano Reggiano 24 mesi',
          category_id: 'cat1',
          department_id: 'dept1',
          conservation_point_id: 'cp1',
          supplier_name: 'Caseificio Emiliano',
          purchase_date: new Date('2025-09-10'),
          expiry_date: new Date('2025-12-15'),
          quantity: 2.5,
          unit: 'kg',
          allergens: [Ft.LATTE],
          status: 'active',
          notes: 'Stagionato 24 mesi, qualità DOP',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          company_id: t || '',
          name: 'Latte Scaduto',
          category_id: 'cat1',
          department_id: 'dept1',
          conservation_point_id: 'cp1',
          supplier_name: 'Latteria Centrale',
          purchase_date: new Date('2025-09-01'),
          expiry_date: new Date('2025-09-19'),
          quantity: 1,
          unit: 'litri',
          allergens: [Ft.LATTE],
          status: 'expired',
          notes: 'Prodotto scaduto da rimuovere',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      i = m => ({
        id: m.id,
        company_id: m.company_id,
        name: m.name,
        category_id: m.category_id ?? void 0,
        department_id: m.department_id ?? void 0,
        conservation_point_id: m.conservation_point_id ?? void 0,
        barcode: m.barcode ?? void 0,
        sku: m.sku ?? void 0,
        supplier_name: m.supplier_name ?? void 0,
        purchase_date: m.purchase_date ? new Date(m.purchase_date) : void 0,
        expiry_date: m.expiry_date ? new Date(m.expiry_date) : void 0,
        quantity:
          m.quantity === null || m.quantity === void 0
            ? void 0
            : Number(m.quantity),
        unit: m.unit ?? void 0,
        allergens: Array.isArray(m.allergens) ? m.allergens : [],
        label_photo_url: m.label_photo_url ?? void 0,
        notes: m.notes ?? void 0,
        status: m.status,
        compliance_status: m.compliance_status ?? void 0,
        created_at: m.created_at ? new Date(m.created_at) : new Date(),
        updated_at: m.updated_at ? new Date(m.updated_at) : new Date(),
      }),
      {
        data: a = [],
        isLoading: l,
        error: c,
        refetch: d,
      } = Le({
        queryKey: se.products(t || '', r?.filters),
        queryFn: async () => {
          if (!t)
            return (
              console.log('🔧 No company_id, using mock data for products'),
              n
            )
          console.log('🔧 Loading products from Supabase for company:', t)
          const { data: m, error: y } = await F.from('products')
            .select(
              `
          *,
          product_categories(id, name, color),
          departments(id, name),
          conservation_points(id, name)
        `
            )
            .eq('company_id', t)
            .order('created_at', { ascending: !1 })
          if (y)
            return (
              console.error('Error loading products:', y),
              console.log('🔧 Fallback to mock data due to error'),
              n
            )
          const x = (m || []).map(i)
          return (console.log('✅ Loaded products from Supabase:', x.length), x)
        },
        enabled: !!t && !!e,
      }),
      { data: u } = Le({
        queryKey: se.productStats(t || ''),
        queryFn: async () => {
          if (!t || !a)
            return (
              console.log(
                '🔧 Using mock stats for products - no data available'
              ),
              {
                total_products: 3,
                active_products: 2,
                expiring_soon: 1,
                expired: 1,
                by_category: { Latticini: 3 },
                by_department: { Cucina: 3 },
                by_status: { active: 2, expired: 1, consumed: 0, waste: 0 },
                compliance_rate: 85,
              }
            )
          console.log('🔧 Computing product stats from loaded data')
          const m = new Date(),
            y = new Date(m.getTime() + 3 * 24 * 60 * 60 * 1e3)
          return {
            total_products: a.length,
            active_products: a.filter(b => b.status === 'active').length,
            expiring_soon: a.filter(b =>
              b.expiry_date
                ? b.status === 'active' &&
                  b.expiry_date <= y &&
                  b.expiry_date > m
                : !1
            ).length,
            expired: a.filter(
              b =>
                (b.expiry_date && b.expiry_date <= m) || b.status === 'expired'
            ).length,
            by_category: a.reduce(
              (b, w) => (
                w.category_id &&
                  (b[w.category_id] = (b[w.category_id] || 0) + 1),
                b
              ),
              {}
            ),
            by_department: a.reduce(
              (b, w) => (
                w.department_id &&
                  (b[w.department_id] = (b[w.department_id] || 0) + 1),
                b
              ),
              {}
            ),
            by_status: {
              active: a.filter(b => b.status === 'active').length,
              expired: a.filter(b => b.status === 'expired').length,
              consumed: a.filter(b => b.status === 'consumed').length,
              waste: a.filter(b => b.status === 'waste').length,
            },
            compliance_rate: Math.round(
              (a.filter(b => b.status === 'active').length /
                Math.max(a.length, 1)) *
                100
            ),
          }
        },
        enabled: !!t && !!e && !!a,
      }),
      h = V({
        mutationFn: async m => {
          const y = {
              ...m,
              company_id: t,
              allergens: m.allergens || [],
              purchase_date: m.purchase_date
                ? m.purchase_date.toISOString()
                : null,
              expiry_date: m.expiry_date ? m.expiry_date.toISOString() : null,
            },
            { data: x, error: b } = await F.from('products')
              .insert(y)
              .select()
              .single()
          if (b) throw (console.error('Error creating product:', b), b)
          return i(x)
        },
        onSuccess: () => {
          ;(s.invalidateQueries({ queryKey: se.products(t || '') }),
            s.invalidateQueries({ queryKey: se.productStats(t || '') }),
            I.success('Prodotto creato con successo'))
        },
        onError: m => {
          ;(console.error('Error creating product:', m),
            I.error('Errore nella creazione del prodotto'))
        },
      }),
      p = V({
        mutationFn: async ({ id: m, ...y }) => {
          const x = {
              ...y,
              allergens: y.allergens || [],
              updated_at: new Date().toISOString(),
              purchase_date: y.purchase_date
                ? y.purchase_date.toISOString()
                : null,
              expiry_date: y.expiry_date ? y.expiry_date.toISOString() : null,
            },
            { data: b, error: w } = await F.from('products')
              .update(x)
              .eq('id', m)
              .eq('company_id', t)
              .select()
              .single()
          if (w) throw (console.error('Error updating product:', w), w)
          return i(b)
        },
        onSuccess: () => {
          ;(s.invalidateQueries({ queryKey: se.products(t || '') }),
            s.invalidateQueries({ queryKey: se.productStats(t || '') }),
            I.success('Prodotto aggiornato con successo'))
        },
        onError: m => {
          ;(console.error('Error updating product:', m),
            I.error("Errore nell'aggiornamento del prodotto"))
        },
      }),
      f = V({
        mutationFn: async m => {
          const { error: y } = await F.from('products')
            .delete()
            .eq('id', m)
            .eq('company_id', t)
          if (y) throw (console.error('Error deleting product:', y), y)
        },
        onSuccess: () => {
          ;(s.invalidateQueries({ queryKey: se.products(t || '') }),
            s.invalidateQueries({ queryKey: se.productStats(t || '') }),
            I.success('Prodotto eliminato con successo'))
        },
        onError: m => {
          ;(console.error('Error deleting product:', m),
            I.error("Errore nell'eliminazione del prodotto"))
        },
      }),
      g = V({
        mutationFn: async ({ id: m, status: y }) => {
          const { data: x, error: b } = await F.from('products')
            .update({ status: y, updated_at: new Date().toISOString() })
            .eq('id', m)
            .eq('company_id', t)
            .select()
            .single()
          if (b) throw (console.error('Error updating product status:', b), b)
          return i(x)
        },
        onSuccess: () => {
          ;(s.invalidateQueries({ queryKey: se.products(t || '') }),
            s.invalidateQueries({ queryKey: se.productStats(t || '') }),
            I.success('Stato prodotto aggiornato'))
        },
        onError: m => {
          ;(console.error('Error updating product status:', m),
            I.error("Errore nell'aggiornamento dello stato"))
        },
      })
    return {
      products: a,
      stats: u,
      isLoading: l,
      error: c,
      createProduct: h.mutate,
      updateProduct: p.mutate,
      deleteProduct: f.mutate,
      updateProductStatus: g.mutate,
      isCreating: h.isPending,
      isUpdating: p.isPending,
      isDeleting: f.isPending,
      isUpdatingStatus: g.isPending,
      refetch: d,
    }
  },
  or = {
    maintenance: {
      backgroundColor: '#FEF3C7',
      borderColor: '#F59E0B',
      textColor: '#92400E',
    },
    general_task: {
      backgroundColor: '#DBEAFE',
      borderColor: '#3B82F6',
      textColor: '#1E40AF',
    },
    temperature_reading: {
      backgroundColor: '#DCFCE7',
      borderColor: '#10B981',
      textColor: '#065F46',
    },
    custom: {
      backgroundColor: '#F3E8FF',
      borderColor: '#8B5CF6',
      textColor: '#5B21B6',
    },
  },
  $e = {
    completed: {
      backgroundColor: '#DCFCE7',
      borderColor: '#10B981',
      textColor: '#065F46',
    },
    overdue: {
      backgroundColor: '#FEE2E2',
      borderColor: '#EF4444',
      textColor: '#991B1B',
    },
    cancelled: {
      backgroundColor: '#F9FAFB',
      borderColor: '#9CA3AF',
      textColor: '#6B7280',
    },
  },
  Qt = {
    high: { backgroundColor: '#FEF2F2', textColor: '#991B1B' },
    critical: {
      backgroundColor: '#7F1D1D',
      borderColor: '#991B1B',
      textColor: '#FFFFFF',
    },
  },
  Bo = [
    {
      label: 'Completa',
      icon: 'check',
      action: 'complete',
      requiresConfirmation: !1,
      allowedRoles: ['admin', 'responsabile', 'dipendente'],
      showFor: {
        types: ['maintenance', 'general_task', 'temperature_reading'],
        statuses: ['pending', 'overdue'],
      },
    },
    {
      label: 'Riprogramma',
      icon: 'clock',
      action: 'reschedule',
      requiresConfirmation: !1,
      allowedRoles: ['admin', 'responsabile'],
      showFor: {
        types: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
        statuses: ['pending', 'overdue'],
      },
    },
    {
      label: 'Riassegna',
      icon: 'user',
      action: 'assign',
      requiresConfirmation: !1,
      allowedRoles: ['admin', 'responsabile'],
      showFor: {
        types: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
        statuses: ['pending', 'overdue'],
      },
    },
    {
      label: 'Annulla',
      icon: 'x',
      action: 'cancel',
      requiresConfirmation: !0,
      allowedRoles: ['admin', 'responsabile'],
      showFor: {
        types: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
        statuses: ['pending', 'overdue'],
      },
    },
    {
      label: 'Modifica',
      icon: 'edit',
      action: 'edit',
      requiresConfirmation: !1,
      allowedRoles: ['admin', 'responsabile'],
      showFor: {
        types: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
        statuses: ['pending', 'overdue', 'completed'],
      },
    },
    {
      label: 'Elimina',
      icon: 'trash',
      action: 'delete',
      requiresConfirmation: !0,
      allowedRoles: ['admin'],
      showFor: { types: ['custom'], statuses: ['pending', 'cancelled'] },
    },
  ]
function Ho(r) {
  return {
    id: r.id,
    title: r.title,
    start: r.start,
    end: r.end,
    allDay: r.allDay,
    backgroundColor: r.backgroundColor,
    borderColor: r.borderColor,
    textColor: r.textColor,
    extendedProps: {
      type: r.type,
      status: r.status,
      priority: r.priority,
      assigned_to: r.assigned_to,
      department_id: r.department_id,
      conservation_point_id: r.conservation_point_id,
      metadata: r.metadata,
      originalEvent: r,
    },
  }
}
function Go(r) {
  return r.map(Ho)
}
function As(r, e, t) {
  return t === 'critical'
    ? Qt.critical
    : e === 'completed'
      ? $e.completed
      : e === 'overdue'
        ? $e.overdue
        : e === 'cancelled'
          ? $e.cancelled
          : t === 'high'
            ? {
                backgroundColor: Qt.high.backgroundColor,
                borderColor: or[r].borderColor,
                textColor: Qt.high.textColor,
              }
            : or[r]
}
function Wo(r) {
  if (r.status === 'completed' || r.status === 'cancelled') return !1
  const e = new Date()
  return (r.end || r.start) < e
}
function Bc(r) {
  return Wo(r) && r.status === 'pending'
    ? {
        ...r,
        status: 'overdue',
        backgroundColor: $e.overdue.backgroundColor,
        borderColor: $e.overdue.borderColor,
        textColor: $e.overdue.textColor,
      }
    : r
}
function Hc(r, e) {
  return r.filter(t => {
    if (
      (e.types && e.types.length > 0 && !e.types.includes(t.type)) ||
      (e.statuses && e.statuses.length > 0 && !e.statuses.includes(t.status)) ||
      (e.priorities &&
        e.priorities.length > 0 &&
        !e.priorities.includes(t.priority)) ||
      (e.departments &&
        e.departments.length > 0 &&
        (!t.department_id || !e.departments.includes(t.department_id))) ||
      (e.assignees &&
        e.assignees.length > 0 &&
        !e.assignees.some(n => t.assigned_to.includes(n)))
    )
      return !1
    if (e.searchTerm && e.searchTerm.trim()) {
      const s = e.searchTerm.toLowerCase(),
        n = t.title.toLowerCase().includes(s),
        i = t.description?.toLowerCase().includes(s),
        a = t.metadata.notes?.toLowerCase().includes(s)
      if (!n && !i && !a) return !1
    }
    return !0
  })
}
function Vo(r) {
  return r.reduce(
    (e, t) => (e[t.type] || (e[t.type] = []), e[t.type].push(t), e),
    {}
  )
}
function Ko(r) {
  return r.reduce(
    (e, t) => (e[t.status] || (e[t.status] = []), e[t.status].push(t), e),
    {}
  )
}
function Gc(r) {
  const e = r.length,
    t = Ko(r),
    s = Vo(r),
    n = t.completed?.length || 0,
    i = t.pending?.length || 0,
    a = t.overdue?.length || 0,
    l = t.cancelled?.length || 0,
    c = e > 0 ? (n / e) * 100 : 0,
    d = e > 0 ? (a / e) * 100 : 0
  return {
    total: e,
    completed: n,
    pending: i,
    overdue: a,
    cancelled: l,
    completionRate: c,
    overdueRate: d,
    byType: s,
    byStatus: t,
  }
}
const Jo = { warningDays: [90, 60, 30, 14, 7], criticalDays: 7 }
function Qo(r, e, t, s = Jo) {
  const n = [],
    i = new Date()
  return (
    r.forEach(a => {
      if (
        !a.haccp_certification ||
        typeof a.haccp_certification != 'object' ||
        !('expiry_date' in a.haccp_certification)
      )
        return
      const l = a.haccp_certification,
        c = vo(l.expiry_date),
        d = go(c, i)
      if (d < 0) {
        n.push(Yt(a, l, c, d, e, t, 'overdue'))
        return
      }
      if (d <= s.criticalDays) {
        n.push(Yt(a, l, c, d, e, t, 'critical'))
        return
      }
      s.warningDays.forEach(u => {
        if (d <= u && d > u - 1) {
          const h = d <= 30 ? 'high' : d <= 60 ? 'medium' : 'low'
          n.push(Yt(a, l, c, d, e, t, 'warning', h))
        }
      })
    }),
    n
  )
}
function Yt(r, e, t, s, n, i, a, l) {
  const c = l || (a === 'overdue' || a === 'critical' ? 'critical' : 'high'),
    d = a === 'overdue' ? 'overdue' : 'pending'
  let u = '',
    h = ''
  a === 'overdue'
    ? ((u = `⚠️ SCADUTO: Certificato HACCP ${r.name}`),
      (h = `Il certificato HACCP di ${r.name} è scaduto da ${Math.abs(s)} giorni. Rinnovo urgente richiesto!`))
    : a === 'critical'
      ? ((u = `🔴 URGENTE: Rinnovo HACCP ${r.name}`),
        (h = `Il certificato HACCP di ${r.name} scade tra ${s} giorni. Azione immediata richiesta!`))
      : ((u = `⏰ Promemoria: Rinnovo HACCP ${r.name}`),
        (h = `Il certificato HACCP di ${r.name} scade tra ${s} giorni.`))
  const p = Yo(d, c)
  return {
    id: `haccp-expiry-${r.id}-${a}`,
    title: u,
    description: h,
    start: t,
    end: t,
    allDay: !0,
    type: 'custom',
    status: d,
    priority: c,
    source: 'custom',
    sourceId: r.id,
    assigned_to: [r.id],
    recurring: !1,
    backgroundColor: p.backgroundColor,
    borderColor: p.borderColor,
    textColor: p.textColor,
    metadata: {
      staff_id: r.id,
      assigned_to_staff_id: r.id,
      assigned_to_role: 'admin',
      assigned_to_category: 'Amministratore',
      notes: `Scadenza certificato HACCP - ${r.name}
Livello: ${e.level || 'N/A'}
Numero: ${e.certificate_number || 'N/A'}`,
    },
    extendedProps: {
      status: d,
      priority: c,
      assignedTo: [r.id],
      metadata: {
        staffMember: r.name,
        haccpLevel: e.level,
        certificateNumber: e.certificate_number,
        issuingAuthority: e.issuing_authority,
        daysUntilExpiry: s,
        expiryType: a,
      },
    },
    created_at: new Date(),
    updated_at: new Date(),
    created_by: i,
    company_id: n,
  }
}
function Yo(r, e) {
  return r === 'overdue'
    ? {
        backgroundColor: '#7F1D1D',
        borderColor: '#991B1B',
        textColor: '#FFFFFF',
      }
    : e === 'critical'
      ? {
          backgroundColor: '#7F1D1D',
          borderColor: '#991B1B',
          textColor: '#FFFFFF',
        }
      : e === 'high'
        ? {
            backgroundColor: '#FEF2F2',
            borderColor: '#EF4444',
            textColor: '#991B1B',
          }
        : e === 'medium'
          ? {
              backgroundColor: '#FFFBEB',
              borderColor: '#F59E0B',
              textColor: '#92400E',
            }
          : {
              backgroundColor: '#F0FDF4',
              borderColor: '#22C55E',
              textColor: '#166534',
            }
}
const Zo = { startDate: new Date(), daysAhead: 90, maxEventsPerPoint: 100 }
function Xo(r, e, t, s = Zo) {
  const n = [],
    i = s.startDate || new Date(),
    a = s.daysAhead || 90,
    l = s.maxEventsPerPoint || 100
  return (
    r.forEach(c => {
      const d = el(c),
        u = {
          conservationPointId: c.id,
          frequency: d,
          startHour: 9,
          assignedToRole: 'dipendente',
          assignedToCategory: 'all',
        },
        h = tl(c, u, i, a, l, e, t)
      n.push(...h)
    }),
    n
  )
}
function el(r) {
  return r.type === 'blast' || r.type === 'fridge'
    ? 'daily'
    : (r.type === 'freezer', 'weekly')
}
function tl(r, e, t, s, n, i, a) {
  const l = [],
    c = Xe(t, s)
  let d = hs(t),
    u = 0
  for (; d <= c && u < n; ) {
    if (sl(d, e)) {
      const h = nl(r, e, d, i, a)
      ;(l.push(h), u++)
    }
    d = rl(d, e.frequency)
  }
  return l
}
function sl(r, e) {
  if (e.frequency === 'daily') return !0
  if (e.frequency === 'weekly') return r.getDay() === 1
  if (e.frequency === 'monthly') return r.getDate() === 1
  if (e.frequency === 'custom' && e.customDays) {
    const s = [
      'domenica',
      'lunedi',
      'martedi',
      'mercoledi',
      'giovedi',
      'venerdi',
      'sabato',
    ][r.getDay()]
    return e.customDays.includes(s)
  }
  return !1
}
function rl(r, e) {
  switch (e) {
    case 'daily':
      return Xe(r, 1)
    case 'weekly':
      return mo(r, 1)
    case 'monthly':
      return ho(r, 1)
    case 'custom':
      return Xe(r, 1)
    default:
      return Xe(r, 1)
  }
}
function nl(r, e, t, s, n) {
  const i = sr(t, e.startHour || 9),
    a = sr(t, (e.startHour || 9) + 1),
    l = {
      daily: 'giornaliero',
      weekly: 'settimanale',
      monthly: 'mensile',
      custom: 'personalizzato',
    }[e.frequency],
    c = `🌡️ Controllo Temperatura: ${r.name}`,
    d = `Rilevamento temperatura ${l} per ${r.name}
Temp. obiettivo: ${r.setpoint_temp}°C`,
    u = {
      backgroundColor: '#DCFCE7',
      borderColor: '#10B981',
      textColor: '#065F46',
    }
  return {
    id: `temp-check-${r.id}-${t.getTime()}`,
    title: c,
    description: d,
    start: i,
    end: a,
    allDay: !1,
    type: 'temperature_reading',
    status: 'pending',
    priority: 'medium',
    source: 'temperature_reading',
    sourceId: r.id,
    assigned_to: e.assignedToStaffId ? [e.assignedToStaffId] : [],
    conservation_point_id: r.id,
    department_id: r.department_id,
    recurring: !0,
    recurrence_pattern: {
      frequency: e.frequency,
      interval: 1,
      days_of_week: e.frequency === 'weekly' ? [1] : void 0,
      day_of_month: e.frequency === 'monthly' ? 1 : void 0,
    },
    backgroundColor: u.backgroundColor,
    borderColor: u.borderColor,
    textColor: u.textColor,
    metadata: {
      conservation_point_id: r.id,
      temperature_reading_id: `temp-check-${r.id}-${t.getTime()}`,
      assigned_to_role: e.assignedToRole,
      assigned_to_category: e.assignedToCategory,
      assigned_to_staff_id: e.assignedToStaffId,
      notes: `Controllo temperatura ${l}`,
    },
    extendedProps: {
      status: 'scheduled',
      priority: 'medium',
      assignedTo: e.assignedToStaffId ? [e.assignedToStaffId] : [],
      metadata: {
        conservationPointName: r.name,
        targetTemperature: r.setpoint_temp,
        pointType: r.type,
        frequency: e.frequency,
      },
    },
    created_at: new Date(),
    updated_at: new Date(),
    created_by: n,
    company_id: s,
  }
}
function il() {
  const { user: r, companyId: e } = xe(),
    { maintenanceTasks: t, isLoading: s } = Mo(),
    { conservationPoints: n, isLoading: i } = Uo(),
    { staff: a, isLoading: l } = rn(),
    { products: c, isLoading: d } = qo(),
    u = s || l || d || i,
    h = E.useMemo(
      () =>
        !t || t.length === 0 ? [] : t.map(x => al(x, e || '', r?.id || '')),
      [t, e, r?.id]
    ),
    p = E.useMemo(
      () =>
        !a || a.length === 0
          ? []
          : a
              .filter(
                x =>
                  x.haccp_certification &&
                  typeof x.haccp_certification == 'object' &&
                  'expiry_date' in x.haccp_certification
              )
              .map(x => ol(x, e || '', r?.id || '')),
      [a, e, r?.id]
    ),
    f = E.useMemo(
      () =>
        !c || c.length === 0
          ? []
          : c
              .filter(
                x =>
                  x.expiry_date &&
                  x.status === 'active' &&
                  new Date(x.expiry_date) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
              )
              .map(x => ll(x, e || '', r?.id || '')),
      [c, e, r?.id]
    ),
    g = E.useMemo(
      () => (!a || a.length === 0 ? [] : Qo(a, e || '', r?.id || '')),
      [a, e, r?.id]
    ),
    m = E.useMemo(
      () => (!n || n.length === 0 ? [] : Xo(n, e || '', r?.id || '')),
      [n, e, r?.id]
    )
  return {
    events: E.useMemo(() => [...h, ...p, ...f, ...g, ...m], [h, p, f, g, m]),
    isLoading: u,
    error: null,
    sources: {
      maintenance: h.length,
      haccpExpiry: p.length,
      productExpiry: f.length,
      haccpDeadlines: g.length,
      temperatureChecks: m.length,
      custom: 0,
    },
  }
}
function al(r, e, t) {
  const s = new Date(r.next_due),
    n = new Date(s.getTime() + (r.estimated_duration || 60) * 60 * 1e3),
    i =
      r.status === 'completed'
        ? 'completed'
        : s < new Date()
          ? 'overdue'
          : 'pending',
    a = As('maintenance', i, r.priority || 'medium')
  return {
    id: `maintenance-${r.id}`,
    title: r.title || 'Manutenzione',
    description: r.description,
    start: s,
    end: n,
    allDay: !1,
    type: 'maintenance',
    status: i,
    priority: r.priority || 'medium',
    source: 'maintenance',
    sourceId: r.id,
    assigned_to: r.assigned_to ? [r.assigned_to] : [],
    conservation_point_id: r.conservation_point_id,
    recurring: !1,
    backgroundColor: a.backgroundColor,
    borderColor: a.borderColor,
    textColor: a.textColor,
    metadata: {
      maintenance_id: r.id,
      conservation_point_id: r.conservation_point_id,
      assigned_to_staff_id: r.assigned_to_staff_id,
      assigned_to_role: r.assigned_to_role,
      assigned_to_category: r.assigned_to_category,
      notes: r.description,
    },
    extendedProps: {
      status: i,
      priority: r.priority || 'medium',
      assignedTo: r.assigned_to ? [r.assigned_to] : [],
      metadata: {
        id: r.id,
        notes: r.description,
        estimatedDuration: r.estimated_duration,
      },
    },
    created_at: r.created_at,
    updated_at: r.updated_at,
    created_by: t,
    company_id: e,
  }
}
function ol(r, e, t) {
  const s = r.haccp_certification,
    n = new Date(s.expiry_date),
    i = new Date(),
    a = Math.ceil((n.getTime() - i.getTime()) / (1e3 * 60 * 60 * 24)),
    l = a <= 7 ? 'critical' : a <= 30 ? 'high' : 'medium',
    c = n < i ? 'overdue' : 'pending',
    d = As('custom', c, l)
  return {
    id: `haccp-expiry-${r.id}`,
    title: `Scadenza HACCP - ${r.name}`,
    description: `Certificazione HACCP ${s.level || ''} in scadenza`,
    start: n,
    end: n,
    allDay: !0,
    type: 'custom',
    status: c,
    priority: l,
    source: 'custom',
    sourceId: r.id,
    assigned_to: [r.id],
    recurring: !1,
    backgroundColor: d.backgroundColor,
    borderColor: d.borderColor,
    textColor: d.textColor,
    metadata: {
      staff_id: r.id,
      assigned_to_staff_id: r.id,
      notes: `Scadenza certificazione HACCP - ${r.name}`,
    },
    extendedProps: {
      status: c,
      priority: l,
      assignedTo: [r.id],
      metadata: { staffMember: r.name, haccpLevel: s.level },
    },
    created_at: new Date(),
    updated_at: new Date(),
    created_by: t,
    company_id: e,
  }
}
function ll(r, e, t) {
  const s = new Date(r.expiry_date),
    n = new Date(),
    i = Math.ceil((s.getTime() - n.getTime()) / (1e3 * 60 * 60 * 24)),
    a = i <= 1 ? 'critical' : i <= 3 ? 'high' : 'medium',
    l = s < n ? 'overdue' : 'pending',
    c = As('custom', l, a)
  return {
    id: `product-expiry-${r.id}`,
    title: `Scadenza: ${r.name}`,
    description: `Prodotto in scadenza - ${r.quantity || ''} ${r.unit || ''}`,
    start: s,
    end: s,
    allDay: !0,
    type: 'custom',
    status: l,
    priority: a,
    source: 'custom',
    sourceId: r.id,
    assigned_to: [],
    department_id: r.department_id,
    conservation_point_id: r.conservation_point_id,
    recurring: !1,
    backgroundColor: c.backgroundColor,
    borderColor: c.borderColor,
    textColor: c.textColor,
    metadata: {
      product_id: r.id,
      conservation_point_id: r.conservation_point_id,
      assigned_to_category: r.department_id
        ? `department:${r.department_id}`
        : 'all',
      notes: `Scadenza prodotto: ${r.name}`,
    },
    extendedProps: {
      status: l,
      priority: a,
      metadata: {
        productName: r.name,
        quantity: r.quantity,
        unit: r.unit,
        departmentId: r.department_id,
      },
    },
    created_at: r.created_at,
    updated_at: r.updated_at,
    created_by: t,
    company_id: e,
  }
}
function cl(r) {
  const { userProfile: e, userRole: t, isLoading: s } = xe(),
    { staff: n, isLoading: i } = rn(),
    a = s || i,
    l = E.useMemo(
      () =>
        !e?.staff_id || !n ? null : n.find(u => u.id === e.staff_id) || null,
      [e?.staff_id, n]
    ),
    c = E.useMemo(() => t === 'admin' || t === 'responsabile', [t])
  return {
    filteredEvents: E.useMemo(
      () =>
        !e || !r || r.length === 0
          ? []
          : c
            ? r
            : l
              ? r.filter(u => {
                  const h = {
                    assigned_to_staff_id: u.metadata?.staff_id,
                    assigned_to_role: u.metadata?.assigned_to_role,
                    assigned_to_category: u.metadata?.assigned_to_category,
                    assigned_to: u.assigned_to,
                  }
                  return dl(h, l)
                })
              : [],
      [r, e, c, l]
    ),
    isLoading: a,
    canViewAllEvents: c,
    userStaffMember: l,
  }
}
function dl(r, e) {
  if (r.assigned_to_category === 'all') return !0
  if (r.assigned_to_category?.startsWith('department:')) {
    const t = r.assigned_to_category.replace('department:', '')
    if (e.department_assignments?.includes(t)) return !0
  }
  return !!(
    r.assigned_to_staff_id === e.id ||
    (r.assigned_to_role && r.assigned_to_role === e.role) ||
    (r.assigned_to_category && r.assigned_to_category === e.category) ||
    (r.assigned_to &&
      Array.isArray(r.assigned_to) &&
      r.assigned_to.includes(e.id))
  )
}
const ul = ({
    title: r,
    subtitle: e,
    description: t,
    icon: s,
    children: n,
    defaultExpanded: i = !0,
    defaultOpen: a,
    expanded: l,
    onExpandedChange: c,
    counter: d,
    actions: u,
    className: h = '',
    headerClassName: p = '',
    contentClassName: f,
    loading: g = !1,
    isLoading: m,
    loadingMessage: y = 'Caricamento...',
    loadingContent: x,
    error: b = null,
    onRetry: w,
    errorActionLabel: v = 'Riprova',
    emptyMessage: A = 'Nessun elemento disponibile',
    showEmpty: j = !1,
    isEmpty: O,
    emptyContent: S,
    emptyActionLabel: N = 'Aggiungi elemento',
    onEmptyAction: $,
    collapseDisabled: M = !1,
    id: we,
  }) => {
    const it = E.useId(),
      _e = we ?? `collapsible-card-${it}`,
      te = `${_e}-header`,
      Q = `${_e}-content`,
      Y = m ?? g,
      C = E.useMemo(() => (O ?? j) && !Y && !b, [O, j, Y, b]),
      at = E.useMemo(
        () => (l !== void 0 ? l : a !== void 0 ? a : i),
        [i, a, l]
      ),
      [ot, lt] = E.useState(at),
      ke = l !== void 0,
      U = ke ? l : ot,
      G = () => {
        if (M) return
        const W = !U
        ;(ke || lt(W), c?.(W))
      },
      je = W => {
        ;(W.key === 'Enter' || W.key === ' ') && (W.preventDefault(), G())
      },
      z = Y
        ? o.jsx('div', {
            className:
              f ??
              'flex flex-col items-center justify-center gap-3 py-10 px-4 sm:px-6 text-sm text-gray-600',
            role: 'status',
            'aria-live': 'polite',
            children:
              x ??
              o.jsxs(o.Fragment, {
                children: [
                  o.jsx('div', {
                    className:
                      'inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-b-transparent border-blue-600/60',
                    'aria-hidden': 'true',
                    children: o.jsx('div', {
                      className:
                        'h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600',
                    }),
                  }),
                  o.jsx('span', { children: y }),
                ],
              }),
          })
        : b
          ? o.jsxs('div', {
              className:
                f ??
                'flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-6 sm:px-6',
              role: 'alert',
              'aria-live': 'assertive',
              children: [
                o.jsxs('div', {
                  className: 'flex items-start gap-2 text-sm text-red-800',
                  children: [
                    o.jsx('div', {
                      className:
                        'mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500',
                      'aria-hidden': 'true',
                    }),
                    o.jsx('p', { children: b }),
                  ],
                }),
                w &&
                  o.jsx('div', {
                    children: o.jsx('button', {
                      type: 'button',
                      onClick: W => {
                        ;(W.stopPropagation(), w())
                      },
                      className:
                        'inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                      children: o.jsx('span', { children: v }),
                    }),
                  }),
              ],
            })
          : C
            ? S
              ? o.jsx('div', {
                  className: f ?? 'px-4 py-10 sm:px-6',
                  children: S,
                })
              : o.jsxs('div', {
                  className:
                    f ??
                    'flex flex-col items-center gap-4 px-4 py-12 text-center text-gray-500 sm:px-6',
                  children: [
                    o.jsx('div', {
                      className:
                        'flex h-16 w-16 items-center justify-center rounded-full bg-gray-100',
                      children:
                        s &&
                        o.jsx(s, {
                          className: 'h-7 w-7 text-gray-400',
                          'aria-hidden': 'true',
                        }),
                    }),
                    o.jsx('p', {
                      className: 'text-sm sm:text-base',
                      children: A,
                    }),
                    $ &&
                      o.jsx('button', {
                        type: 'button',
                        onClick: W => {
                          ;(W.stopPropagation(), $())
                        },
                        className:
                          'inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        children: N,
                      }),
                  ],
                })
            : null,
      ct = !!f
    return o.jsxs('div', {
      className: `rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-1 ${h}`,
      'data-expanded': U,
      role: 'region',
      'aria-labelledby': te,
      children: [
        o.jsxs('div', {
          className: `flex cursor-pointer items-start justify-between gap-4 rounded-t-lg px-4 py-4 transition-colors hover:bg-gray-50 sm:px-6 ${p}`,
          onClick: G,
          role: 'button',
          tabIndex: 0,
          onKeyDown: je,
          'aria-expanded': U,
          'aria-controls': Q,
          id: te,
          'data-collapsible-disabled': M,
          children: [
            o.jsxs('div', {
              className: 'flex flex-1 items-start gap-3',
              children: [
                s &&
                  o.jsx(s, {
                    className: 'mt-1 h-5 w-5 text-gray-500',
                    'aria-hidden': 'true',
                  }),
                o.jsxs('div', {
                  className: 'flex flex-col space-y-1',
                  children: [
                    o.jsxs('div', {
                      className: 'flex items-center space-x-2',
                      children: [
                        o.jsx('div', {
                          children: o.jsx('h3', {
                            className: 'text-lg font-semibold text-gray-900',
                            children: r,
                          }),
                        }),
                        d !== void 0 &&
                          o.jsx('span', {
                            className:
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
                            'aria-label': `${d} items`,
                            children: d,
                          }),
                      ],
                    }),
                    e &&
                      o.jsx('p', {
                        className: 'text-sm text-gray-500',
                        children: e,
                      }),
                    t &&
                      o.jsx('p', {
                        className: 'text-xs text-gray-400 sm:text-sm',
                        children: t,
                      }),
                  ],
                }),
              ],
            }),
            o.jsxs('div', {
              className: 'flex items-center space-x-2',
              children: [
                u &&
                  o.jsx('div', {
                    className: 'flex items-center space-x-2',
                    children: u,
                  }),
                o.jsx('button', {
                  type: 'button',
                  className:
                    'p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  onClick: W => {
                    ;(W.stopPropagation(), G())
                  },
                  'aria-label': U ? 'Collapse section' : 'Expand section',
                  disabled: M,
                  children: U
                    ? o.jsx(Oe, {
                        className:
                          'h-4 w-4 text-gray-500 transition-transform duration-200',
                        'aria-hidden': 'true',
                      })
                    : o.jsx(Re, {
                        className:
                          'h-4 w-4 text-gray-500 transition-transform duration-200',
                        'aria-hidden': 'true',
                      }),
                }),
              ],
            }),
          ],
        }),
        U &&
          o.jsxs('div', {
            id: Q,
            className: 'border-t border-gray-200',
            role: 'region',
            'aria-labelledby': te,
            'data-state': Y ? 'loading' : b ? 'error' : C ? 'empty' : 'default',
            children: [
              z,
              !z &&
                o.jsx(o.Fragment, {
                  children: ct
                    ? o.jsx('div', { className: f, children: n })
                    : n,
                }),
            ],
          }),
      ],
    })
  },
  Wc = ({
    icon: r,
    label: e,
    onClick: t,
    variant: s = 'default',
    disabled: n = !1,
  }) => {
    const i =
        'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
      a = {
        default:
          'text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50',
        primary:
          'text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50',
        danger: 'text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50',
      }
    return o.jsxs('button', {
      type: 'button',
      className: `${i} ${a[s]} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`,
      onClick: l => {
        ;(l.stopPropagation(), t())
      },
      disabled: n,
      'aria-label': e,
      children: [
        o.jsx(r, { className: 'h-3 w-3 mr-1', 'aria-hidden': 'true' }),
        e,
      ],
    })
  }
class hl extends _r {
  constructor() {
    ;(super(...arguments), (this.state = { textId: kt() }))
  }
  render() {
    let { theme: e, dateEnv: t, options: s, viewApi: n } = this.context,
      { cellId: i, dayDate: a, todayRange: l } = this.props,
      { textId: c } = this.state,
      d = Tn(a, l),
      u = s.listDayFormat ? t.format(a, s.listDayFormat) : '',
      h = s.listDaySideFormat ? t.format(a, s.listDaySideFormat) : '',
      p = Object.assign(
        {
          date: t.toDate(a),
          view: n,
          textId: c,
          text: u,
          sideText: h,
          navLinkAttrs: Os(this.context, a),
          sideNavLinkAttrs: Os(this.context, a, 'day', !1),
        },
        d
      )
    return R(
      ws,
      {
        elTag: 'tr',
        elClasses: ['fc-list-day', ...Nn(d, e)],
        elAttrs: { 'data-date': wr(a) },
        renderProps: p,
        generatorName: 'dayHeaderContent',
        customGenerator: s.dayHeaderContent,
        defaultGenerator: fl,
        classNameGenerator: s.dayHeaderClassNames,
        didMount: s.dayHeaderDidMount,
        willUnmount: s.dayHeaderWillUnmount,
      },
      f =>
        R(
          'th',
          { scope: 'colgroup', colSpan: 3, id: i, 'aria-labelledby': c },
          R(f, {
            elTag: 'div',
            elClasses: ['fc-list-day-cushion', e.getClass('tableCellShaded')],
          })
        )
    )
  }
}
function fl(r) {
  return R(
    kr,
    null,
    r.text &&
      R(
        'a',
        Object.assign(
          { id: r.textId, className: 'fc-list-day-text' },
          r.navLinkAttrs
        ),
        r.text
      ),
    r.sideText &&
      R(
        'a',
        Object.assign(
          { 'aria-hidden': !0, className: 'fc-list-day-side-text' },
          r.sideNavLinkAttrs
        ),
        r.sideText
      )
  )
}
const ml = jr({ hour: 'numeric', minute: '2-digit', meridiem: 'short' })
class gl extends _r {
  render() {
    let { props: e, context: t } = this,
      { options: s } = t,
      { seg: n, timeHeaderId: i, eventHeaderId: a, dateHeaderId: l } = e,
      c = s.eventTimeFormat || ml
    return R(
      An,
      Object.assign({}, e, {
        elTag: 'tr',
        elClasses: [
          'fc-list-event',
          n.eventRange.def.url && 'fc-event-forced-url',
        ],
        defaultGenerator: () => pl(n, t),
        seg: n,
        timeText: '',
        disableDragging: !0,
        disableResizing: !0,
      }),
      (d, u) =>
        R(
          kr,
          null,
          yl(n, c, t, i, l),
          R(
            'td',
            { 'aria-hidden': !0, className: 'fc-list-event-graphic' },
            R('span', {
              className: 'fc-list-event-dot',
              style: { borderColor: u.borderColor || u.backgroundColor },
            })
          ),
          R(d, {
            elTag: 'td',
            elClasses: ['fc-list-event-title'],
            elAttrs: { headers: `${a} ${l}` },
          })
        )
    )
  }
}
function pl(r, e) {
  let t = Dn(r, e)
  return R('a', Object.assign({}, t), r.eventRange.def.title)
}
function yl(r, e, t, s, n) {
  let { options: i } = t
  if (i.displayEventTime !== !1) {
    let a = r.eventRange.def,
      l = r.eventRange.instance,
      c = !1,
      d
    if (
      (a.allDay
        ? (c = !0)
        : Pn(r.eventRange.range)
          ? r.isStart
            ? (d = $t(r, e, t, null, null, l.range.start, r.end))
            : r.isEnd
              ? (d = $t(r, e, t, null, null, r.start, l.range.end))
              : (c = !0)
          : (d = $t(r, e, t)),
      c)
    ) {
      let u = { text: t.options.allDayText, view: t.viewApi }
      return R(ws, {
        elTag: 'td',
        elClasses: ['fc-list-event-time'],
        elAttrs: { headers: `${s} ${n}` },
        renderProps: u,
        generatorName: 'allDayContent',
        customGenerator: i.allDayContent,
        defaultGenerator: bl,
        classNameGenerator: i.allDayClassNames,
        didMount: i.allDayDidMount,
        willUnmount: i.allDayWillUnmount,
      })
    }
    return R('td', { className: 'fc-list-event-time' }, d)
  }
  return null
}
function bl(r) {
  return r.text
}
class vl extends vn {
  constructor() {
    ;(super(...arguments),
      (this.computeDateVars = Ds(wl)),
      (this.eventStoreToSegs = Ds(this._eventStoreToSegs)),
      (this.state = {
        timeHeaderId: kt(),
        eventHeaderId: kt(),
        dateHeaderIdRoot: kt(),
      }),
      (this.setRootEl = e => {
        e
          ? this.context.registerInteractiveComponent(this, { el: e })
          : this.context.unregisterInteractiveComponent(this)
      }))
  }
  render() {
    let { props: e, context: t } = this,
      { dayDates: s, dayRanges: n } = this.computeDateVars(e.dateProfile),
      i = this.eventStoreToSegs(e.eventStore, e.eventUiBases, n)
    return R(
      wn,
      {
        elRef: this.setRootEl,
        elClasses: [
          'fc-list',
          t.theme.getClass('table'),
          t.options.stickyHeaderDates !== !1 ? 'fc-list-sticky' : '',
        ],
        viewSpec: t.viewSpec,
      },
      R(
        xn,
        {
          liquid: !e.isHeightAuto,
          overflowX: e.isHeightAuto ? 'visible' : 'hidden',
          overflowY: e.isHeightAuto ? 'visible' : 'auto',
        },
        i.length > 0 ? this.renderSegList(i, s) : this.renderEmptyMessage()
      )
    )
  }
  renderEmptyMessage() {
    let { options: e, viewApi: t } = this.context,
      s = { text: e.noEventsText, view: t }
    return R(
      ws,
      {
        elTag: 'div',
        elClasses: ['fc-list-empty'],
        renderProps: s,
        generatorName: 'noEventsContent',
        customGenerator: e.noEventsContent,
        defaultGenerator: xl,
        classNameGenerator: e.noEventsClassNames,
        didMount: e.noEventsDidMount,
        willUnmount: e.noEventsWillUnmount,
      },
      n => R(n, { elTag: 'div', elClasses: ['fc-list-empty-cushion'] })
    )
  }
  renderSegList(e, t) {
    let { theme: s, options: n } = this.context,
      { timeHeaderId: i, eventHeaderId: a, dateHeaderIdRoot: l } = this.state,
      c = _l(e)
    return R(Cn, { unit: 'day' }, (d, u) => {
      let h = []
      for (let p = 0; p < c.length; p += 1) {
        let f = c[p]
        if (f) {
          let g = wr(t[p]),
            m = l + '-' + g
          ;(h.push(R(hl, { key: g, cellId: m, dayDate: t[p], todayRange: u })),
            (f = jn(f, n.eventOrder)))
          for (let y of f)
            h.push(
              R(
                gl,
                Object.assign(
                  {
                    key: g + ':' + y.eventRange.instance.instanceId,
                    seg: y,
                    isDragging: !1,
                    isResizing: !1,
                    isDateSelecting: !1,
                    isSelected: !1,
                    timeHeaderId: i,
                    eventHeaderId: a,
                    dateHeaderId: m,
                  },
                  Sn(y, u, d)
                )
              )
            )
        }
      }
      return R(
        'table',
        { className: 'fc-list-table ' + s.getClass('table') },
        R(
          'thead',
          null,
          R(
            'tr',
            null,
            R('th', { scope: 'col', id: i }, n.timeHint),
            R('th', { scope: 'col', 'aria-hidden': !0 }),
            R('th', { scope: 'col', id: a }, n.eventHint)
          )
        ),
        R('tbody', null, h)
      )
    })
  }
  _eventStoreToSegs(e, t, s) {
    return this.eventRangesToSegs(
      _n(
        e,
        t,
        this.props.dateProfile.activeRange,
        this.context.options.nextDayThreshold
      ).fg,
      s
    )
  }
  eventRangesToSegs(e, t) {
    let s = []
    for (let n of e) s.push(...this.eventRangeToSegs(n, t))
    return s
  }
  eventRangeToSegs(e, t) {
    let { dateEnv: s } = this.context,
      { nextDayThreshold: n } = this.context.options,
      i = e.range,
      a = e.def.allDay,
      l,
      c,
      d,
      u = []
    for (l = 0; l < t.length; l += 1)
      if (
        ((c = kn(i, t[l])),
        c &&
          ((d = {
            component: this,
            eventRange: e,
            start: c.start,
            end: c.end,
            isStart: e.isStart && c.start.valueOf() === i.start.valueOf(),
            isEnd: e.isEnd && c.end.valueOf() === i.end.valueOf(),
            dayIndex: l,
          }),
          u.push(d),
          !d.isEnd &&
            !a &&
            l + 1 < t.length &&
            i.end < s.add(t[l + 1].start, n)))
      ) {
        ;((d.end = i.end), (d.isEnd = !0))
        break
      }
    return u
  }
}
function xl(r) {
  return r.text
}
function wl(r) {
  let e = En(r.renderRange.start),
    t = r.renderRange.end,
    s = [],
    n = []
  for (; e < t; )
    (s.push(e), n.push({ start: e, end: Is(e, 1) }), (e = Is(e, 1)))
  return { dayDates: s, dayRanges: n }
}
function _l(r) {
  let e = [],
    t,
    s
  for (t = 0; t < r.length; t += 1)
    ((s = r[t]), (e[s.dayIndex] || (e[s.dayIndex] = [])).push(s))
  return e
}
var kl =
  ':root{--fc-list-event-dot-width:10px;--fc-list-event-hover-bg-color:#f5f5f5}.fc-theme-standard .fc-list{border:1px solid var(--fc-border-color)}.fc .fc-list-empty{align-items:center;background-color:var(--fc-neutral-bg-color);display:flex;height:100%;justify-content:center}.fc .fc-list-empty-cushion{margin:5em 0}.fc .fc-list-table{border-style:hidden;width:100%}.fc .fc-list-table tr>*{border-left:0;border-right:0}.fc .fc-list-sticky .fc-list-day>*{background:var(--fc-page-bg-color);position:sticky;top:0}.fc .fc-list-table thead{left:-10000px;position:absolute}.fc .fc-list-table tbody>tr:first-child th{border-top:0}.fc .fc-list-table th{padding:0}.fc .fc-list-day-cushion,.fc .fc-list-table td{padding:8px 14px}.fc .fc-list-day-cushion:after{clear:both;content:"";display:table}.fc-theme-standard .fc-list-day-cushion{background-color:var(--fc-neutral-bg-color)}.fc-direction-ltr .fc-list-day-text,.fc-direction-rtl .fc-list-day-side-text{float:left}.fc-direction-ltr .fc-list-day-side-text,.fc-direction-rtl .fc-list-day-text{float:right}.fc-direction-ltr .fc-list-table .fc-list-event-graphic{padding-right:0}.fc-direction-rtl .fc-list-table .fc-list-event-graphic{padding-left:0}.fc .fc-list-event.fc-event-forced-url{cursor:pointer}.fc .fc-list-event:hover td{background-color:var(--fc-list-event-hover-bg-color)}.fc .fc-list-event-graphic,.fc .fc-list-event-time{white-space:nowrap;width:1px}.fc .fc-list-event-dot{border:calc(var(--fc-list-event-dot-width)/2) solid var(--fc-event-border-color);border-radius:calc(var(--fc-list-event-dot-width)/2);box-sizing:content-box;display:inline-block;height:0;width:0}.fc .fc-list-event-title a{color:inherit;text-decoration:none}.fc .fc-list-event.fc-event-forced-url:hover a{text-decoration:underline}'
In(kl)
const jl = {
  listDayFormat: lr,
  listDaySideFormat: lr,
  noEventsClassNames: ht,
  noEventsContent: ht,
  noEventsDidMount: ht,
  noEventsWillUnmount: ht,
}
function lr(r) {
  return r === !1 ? null : jr(r)
}
var Sl = On({
  name: '@fullcalendar/list',
  optionRefiners: jl,
  views: {
    list: {
      component: vl,
      buttonTextKey: 'list',
      listDayFormat: { month: 'long', day: 'numeric', year: 'numeric' },
    },
    listDay: {
      type: 'list',
      duration: { days: 1 },
      listDayFormat: { weekday: 'long' },
    },
    listWeek: {
      type: 'list',
      duration: { weeks: 1 },
      listDayFormat: { weekday: 'long' },
      listDaySideFormat: { month: 'long', day: 'numeric', year: 'numeric' },
    },
    listMonth: {
      type: 'list',
      duration: { month: 1 },
      listDaySideFormat: { weekday: 'long' },
    },
    listYear: {
      type: 'list',
      duration: { year: 1 },
      listDaySideFormat: { weekday: 'long' },
    },
  },
})
function fs(r) {
  return (
    {
      maintenance: '🔧',
      general_task: '📋',
      temperature_reading: '🌡️',
      custom: '📌',
    }[r] || '📌'
  )
}
function ms(r) {
  return (
    { pending: '⏳', completed: '✅', overdue: '⚠️', cancelled: '❌' }[r] ||
    '⏳'
  )
}
function gs(r) {
  return { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }[r] || '🟢'
}
function cr(r, e, t) {
  let s = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  if (t === 'critical')
    return `${s} bg-red-900 text-white border border-red-800`
  switch (e) {
    case 'completed':
      return `${s} bg-green-100 text-green-800 border border-green-200`
    case 'overdue':
      return `${s} bg-red-100 text-red-800 border border-red-200`
    case 'cancelled':
      return `${s} bg-gray-100 text-gray-600 border border-gray-200`
    case 'pending':
      if (t === 'high')
        return `${s} bg-orange-100 text-orange-800 border border-orange-200`
  }
  switch (r) {
    case 'maintenance':
      return `${s} bg-yellow-100 text-yellow-800 border border-yellow-200`
    case 'general_task':
      return `${s} bg-blue-100 text-blue-800 border border-blue-200`
    case 'temperature_reading':
      return `${s} bg-green-100 text-green-800 border border-green-200`
    case 'custom':
      return `${s} bg-purple-100 text-purple-800 border border-purple-200`
    default:
      return `${s} bg-gray-100 text-gray-800 border border-gray-200`
  }
}
const Cl = ({ isOpen: r, onClose: e, event: t, onUpdate: s, onDelete: n }) => {
    const [, i] = E.useState(!1),
      [a, l] = E.useState(!1)
    if (!r) return null
    const c = () => {
        if (s && t.status === 'pending') {
          const p = {
            ...t,
            status: 'completed',
            updated_at: new Date(),
            metadata: {
              ...t.metadata,
              completion_data: {
                completed_at: new Date(),
                completed_by: 'current_user',
              },
            },
          }
          s(p)
        }
      },
      d = () => {
        n && (n(t.id), e())
      },
      u = p =>
        p.toLocaleString('it-IT', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      h = () => {
        if (!t.end) return 'Evento senza orario di fine'
        const p = t.end.getTime() - t.start.getTime(),
          f = Math.floor(p / (1e3 * 60 * 60)),
          g = Math.floor((p % (1e3 * 60 * 60)) / (1e3 * 60))
        return f > 0 ? `${f}h ${g}m` : `${g}m`
      }
    return o.jsxs('div', {
      className: 'fixed inset-0 z-50 overflow-y-auto',
      children: [
        o.jsxs('div', {
          className:
            'flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0',
          children: [
            o.jsx('div', {
              className:
                'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
              onClick: e,
            }),
            o.jsxs('div', {
              className:
                'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full',
              children: [
                o.jsx('div', {
                  className: 'bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4',
                  children: o.jsxs('div', {
                    className: 'flex items-start justify-between',
                    children: [
                      o.jsxs('div', {
                        className: 'flex items-center space-x-3',
                        children: [
                          o.jsx('div', {
                            className: 'flex-shrink-0',
                            children: o.jsx('span', {
                              className: 'text-2xl',
                              children: fs(t.type),
                            }),
                          }),
                          o.jsxs('div', {
                            className: 'flex-1 min-w-0',
                            children: [
                              o.jsx('h3', {
                                className:
                                  'text-lg leading-6 font-medium text-gray-900 mb-2',
                                children: t.title,
                              }),
                              o.jsxs('div', {
                                className: 'flex items-center space-x-2',
                                children: [
                                  o.jsxs('span', {
                                    className: cr(t.type, t.status, t.priority),
                                    children: [ms(t.status), ' ', t.status],
                                  }),
                                  o.jsxs('span', {
                                    className: cr(t.type, t.status, t.priority),
                                    children: [gs(t.priority), ' ', t.priority],
                                  }),
                                  o.jsx('span', {
                                    className:
                                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
                                    children: t.type.replace('_', ' '),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      o.jsx('button', {
                        onClick: e,
                        className:
                          'bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        children: o.jsx(et, { className: 'h-6 w-6' }),
                      }),
                    ],
                  }),
                }),
                o.jsxs('div', {
                  className: 'bg-white px-4 pb-4 sm:px-6',
                  children: [
                    t.description &&
                      o.jsxs('div', {
                        className: 'mb-4',
                        children: [
                          o.jsx('h4', {
                            className: 'text-sm font-medium text-gray-900 mb-2',
                            children: 'Descrizione',
                          }),
                          o.jsx('p', {
                            className: 'text-sm text-gray-600',
                            children: t.description,
                          }),
                        ],
                      }),
                    o.jsxs('div', {
                      className: 'mb-4',
                      children: [
                        o.jsx('h4', {
                          className: 'text-sm font-medium text-gray-900 mb-2',
                          children: 'Orario',
                        }),
                        o.jsxs('div', {
                          className: 'space-y-2',
                          children: [
                            o.jsxs('div', {
                              className:
                                'flex items-center text-sm text-gray-600',
                              children: [
                                o.jsx(jt, { className: 'h-4 w-4 mr-2' }),
                                o.jsxs('span', {
                                  children: ['Inizio: ', u(t.start)],
                                }),
                              ],
                            }),
                            t.end &&
                              o.jsxs('div', {
                                className:
                                  'flex items-center text-sm text-gray-600',
                                children: [
                                  o.jsx(jt, { className: 'h-4 w-4 mr-2' }),
                                  o.jsxs('span', {
                                    children: ['Fine: ', u(t.end)],
                                  }),
                                ],
                              }),
                            o.jsxs('div', {
                              className:
                                'flex items-center text-sm text-gray-600',
                              children: [
                                o.jsx(St, { className: 'h-4 w-4 mr-2' }),
                                o.jsxs('span', { children: ['Durata: ', h()] }),
                              ],
                            }),
                            t.allDay &&
                              o.jsx('div', {
                                className:
                                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
                                children: 'Tutto il giorno',
                              }),
                          ],
                        }),
                      ],
                    }),
                    t.assigned_to.length > 0 &&
                      o.jsxs('div', {
                        className: 'mb-4',
                        children: [
                          o.jsx('h4', {
                            className: 'text-sm font-medium text-gray-900 mb-2',
                            children: 'Assegnato a',
                          }),
                          o.jsxs('div', {
                            className:
                              'flex items-center text-sm text-gray-600',
                            children: [
                              o.jsx(Sr, { className: 'h-4 w-4 mr-2' }),
                              o.jsxs('span', {
                                children: [t.assigned_to.length, ' persona/e'],
                              }),
                            ],
                          }),
                        ],
                      }),
                    (t.department_id || t.conservation_point_id) &&
                      o.jsxs('div', {
                        className: 'mb-4',
                        children: [
                          o.jsx('h4', {
                            className: 'text-sm font-medium text-gray-900 mb-2',
                            children: 'Ubicazione',
                          }),
                          o.jsxs('div', {
                            className: 'space-y-1',
                            children: [
                              t.department_id &&
                                o.jsxs('div', {
                                  className:
                                    'flex items-center text-sm text-gray-600',
                                  children: [
                                    o.jsx(Rs, { className: 'h-4 w-4 mr-2' }),
                                    o.jsxs('span', {
                                      children: ['Reparto: ', t.department_id],
                                    }),
                                  ],
                                }),
                              t.conservation_point_id &&
                                o.jsxs('div', {
                                  className:
                                    'flex items-center text-sm text-gray-600',
                                  children: [
                                    o.jsx(Rs, { className: 'h-4 w-4 mr-2' }),
                                    o.jsxs('span', {
                                      children: [
                                        'Punto conservazione: ',
                                        t.conservation_point_id,
                                      ],
                                    }),
                                  ],
                                }),
                            ],
                          }),
                        ],
                      }),
                    t.recurring &&
                      t.recurrence_pattern &&
                      o.jsxs('div', {
                        className: 'mb-4',
                        children: [
                          o.jsx('h4', {
                            className: 'text-sm font-medium text-gray-900 mb-2',
                            children: 'Ricorrenza',
                          }),
                          o.jsx('div', {
                            className: 'text-sm text-gray-600',
                            children: o.jsxs('span', {
                              children: [
                                'Ripete ogni ',
                                t.recurrence_pattern.interval,
                                ' ',
                                t.recurrence_pattern.frequency === 'daily' &&
                                  'giorni',
                                t.recurrence_pattern.frequency === 'weekly' &&
                                  'settimane',
                                t.recurrence_pattern.frequency === 'monthly' &&
                                  'mesi',
                                t.recurrence_pattern.frequency === 'yearly' &&
                                  'anni',
                              ],
                            }),
                          }),
                        ],
                      }),
                    t.metadata.notes &&
                      o.jsxs('div', {
                        className: 'mb-4',
                        children: [
                          o.jsx('h4', {
                            className: 'text-sm font-medium text-gray-900 mb-2',
                            children: 'Note',
                          }),
                          o.jsx('p', {
                            className: 'text-sm text-gray-600',
                            children: t.metadata.notes,
                          }),
                        ],
                      }),
                    t.status === 'completed' &&
                      t.metadata.completion_data &&
                      o.jsxs('div', {
                        className: 'mb-4 p-3 bg-green-50 rounded-lg',
                        children: [
                          o.jsxs('h4', {
                            className:
                              'text-sm font-medium text-green-900 mb-2 flex items-center',
                            children: [
                              o.jsx(es, { className: 'h-4 w-4 mr-2' }),
                              'Completato',
                            ],
                          }),
                          o.jsxs('div', {
                            className: 'text-sm text-green-700',
                            children: [
                              t.metadata.completion_data.completed_at &&
                                o.jsxs('p', {
                                  children: [
                                    'Completato il:',
                                    ' ',
                                    new Date(
                                      t.metadata.completion_data.completed_at
                                    ).toLocaleString('it-IT'),
                                  ],
                                }),
                              t.metadata.completion_data.completed_by &&
                                o.jsxs('p', {
                                  children: [
                                    'Da: ',
                                    t.metadata.completion_data.completed_by,
                                  ],
                                }),
                            ],
                          }),
                        ],
                      }),
                  ],
                }),
                o.jsxs('div', {
                  className:
                    'bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-3',
                  children: [
                    t.status === 'pending' &&
                      s &&
                      o.jsxs('button', {
                        onClick: c,
                        className:
                          'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm',
                        children: [
                          o.jsx(es, { className: 'h-4 w-4 mr-2' }),
                          'Segna come Completato',
                        ],
                      }),
                    s &&
                      o.jsxs('button', {
                        onClick: () => i(!0),
                        className:
                          'w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm',
                        children: [
                          o.jsx(Cr, { className: 'h-4 w-4 mr-2' }),
                          'Modifica',
                        ],
                      }),
                    n &&
                      t.type === 'custom' &&
                      o.jsxs('button', {
                        onClick: () => l(!0),
                        className:
                          'w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm',
                        children: [
                          o.jsx(Er, { className: 'h-4 w-4 mr-2' }),
                          'Elimina',
                        ],
                      }),
                    o.jsx('button', {
                      onClick: e,
                      className:
                        'w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm',
                      children: 'Chiudi',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        a &&
          o.jsx('div', {
            className: 'fixed inset-0 z-60 overflow-y-auto',
            children: o.jsxs('div', {
              className:
                'flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0',
              children: [
                o.jsx('div', {
                  className:
                    'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
                }),
                o.jsxs('div', {
                  className:
                    'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full',
                  children: [
                    o.jsx('div', {
                      className: 'bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4',
                      children: o.jsxs('div', {
                        className: 'sm:flex sm:items-start',
                        children: [
                          o.jsx('div', {
                            className:
                              'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10',
                            children: o.jsx(St, {
                              className: 'h-6 w-6 text-red-600',
                            }),
                          }),
                          o.jsxs('div', {
                            className:
                              'mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left',
                            children: [
                              o.jsx('h3', {
                                className:
                                  'text-lg leading-6 font-medium text-gray-900',
                                children: 'Elimina evento',
                              }),
                              o.jsx('div', {
                                className: 'mt-2',
                                children: o.jsx('p', {
                                  className: 'text-sm text-gray-500',
                                  children:
                                    'Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.',
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    o.jsxs('div', {
                      className:
                        'bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse',
                      children: [
                        o.jsx('button', {
                          onClick: d,
                          className:
                            'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm',
                          children: 'Elimina',
                        }),
                        o.jsx('button', {
                          onClick: () => l(!1),
                          className:
                            'mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm',
                          children: 'Annulla',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
      ],
    })
  },
  dr = [
    { value: 'maintenance', label: 'Manutenzioni' },
    { value: 'general_task', label: 'Mansioni Generali' },
    { value: 'temperature_reading', label: 'Rilevazioni Temperatura' },
    { value: 'custom', label: 'Eventi Personalizzati' },
  ],
  ur = [
    { value: 'pending', label: 'In Attesa' },
    { value: 'completed', label: 'Completato' },
    { value: 'overdue', label: 'In Ritardo' },
    { value: 'cancelled', label: 'Annullato' },
  ],
  hr = [
    { value: 'low', label: 'Bassa' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Critica' },
  ],
  El = ({ filters: r, onFiltersChange: e, onClose: t }) => {
    const [s, n] = E.useState(r),
      i = h => {
        const p = s.types.includes(h)
          ? s.types.filter(f => f !== h)
          : [...s.types, h]
        n({ ...s, types: p })
      },
      a = h => {
        const p = s.statuses.includes(h)
          ? s.statuses.filter(f => f !== h)
          : [...s.statuses, h]
        n({ ...s, statuses: p })
      },
      l = h => {
        const p = s.priorities.includes(h)
          ? s.priorities.filter(f => f !== h)
          : [...s.priorities, h]
        n({ ...s, priorities: p })
      },
      c = () => {
        ;(e(s), t())
      },
      d = () => {
        const h = {
          types: [],
          statuses: [],
          priorities: [],
          departments: [],
          assignees: [],
        }
        ;(n(h), e(h))
      },
      u =
        s.types.length > 0 ||
        s.statuses.length > 0 ||
        s.priorities.length > 0 ||
        s.departments.length > 0 ||
        s.assignees.length > 0
    return o.jsx('div', {
      className: 'bg-gray-50 border-b border-gray-200 p-4',
      children: o.jsxs('div', {
        className: 'max-w-7xl mx-auto',
        children: [
          o.jsxs('div', {
            className: 'flex items-center justify-between mb-4',
            children: [
              o.jsxs('div', {
                className: 'flex items-center space-x-2',
                children: [
                  o.jsx(_s, { className: 'h-5 w-5 text-gray-600' }),
                  o.jsx('h3', {
                    className: 'text-lg font-medium text-gray-900',
                    children: 'Filtri Calendario',
                  }),
                  u &&
                    o.jsx('span', {
                      className:
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
                      children: 'Filtri attivi',
                    }),
                ],
              }),
              o.jsx('button', {
                onClick: t,
                className:
                  'text-gray-400 hover:text-gray-600 transition-colors',
                children: o.jsx(et, { className: 'h-5 w-5' }),
              }),
            ],
          }),
          o.jsxs('div', {
            className: 'grid grid-cols-1 md:grid-cols-3 gap-6',
            children: [
              o.jsxs('div', {
                children: [
                  o.jsx('h4', {
                    className: 'text-sm font-medium text-gray-900 mb-3',
                    children: 'Tipo di Evento',
                  }),
                  o.jsx('div', {
                    className: 'space-y-2',
                    children: dr.map(h =>
                      o.jsxs(
                        'label',
                        {
                          className: 'flex items-center',
                          children: [
                            o.jsx('input', {
                              type: 'checkbox',
                              checked: s.types.includes(h.value),
                              onChange: () => i(h.value),
                              className:
                                'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                            }),
                            o.jsxs('span', {
                              className:
                                'ml-2 text-sm text-gray-700 flex items-center',
                              children: [
                                o.jsx('span', {
                                  className: 'mr-2',
                                  children: fs(h.value),
                                }),
                                h.label,
                              ],
                            }),
                          ],
                        },
                        h.value
                      )
                    ),
                  }),
                ],
              }),
              o.jsxs('div', {
                children: [
                  o.jsx('h4', {
                    className: 'text-sm font-medium text-gray-900 mb-3',
                    children: 'Stato',
                  }),
                  o.jsx('div', {
                    className: 'space-y-2',
                    children: ur.map(h =>
                      o.jsxs(
                        'label',
                        {
                          className: 'flex items-center',
                          children: [
                            o.jsx('input', {
                              type: 'checkbox',
                              checked: s.statuses.includes(h.value),
                              onChange: () => a(h.value),
                              className:
                                'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                            }),
                            o.jsxs('span', {
                              className:
                                'ml-2 text-sm text-gray-700 flex items-center',
                              children: [
                                o.jsx('span', {
                                  className: 'mr-2',
                                  children: ms(h.value),
                                }),
                                h.label,
                              ],
                            }),
                          ],
                        },
                        h.value
                      )
                    ),
                  }),
                ],
              }),
              o.jsxs('div', {
                children: [
                  o.jsx('h4', {
                    className: 'text-sm font-medium text-gray-900 mb-3',
                    children: 'Priorità',
                  }),
                  o.jsx('div', {
                    className: 'space-y-2',
                    children: hr.map(h =>
                      o.jsxs(
                        'label',
                        {
                          className: 'flex items-center',
                          children: [
                            o.jsx('input', {
                              type: 'checkbox',
                              checked: s.priorities.includes(h.value),
                              onChange: () => l(h.value),
                              className:
                                'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
                            }),
                            o.jsxs('span', {
                              className:
                                'ml-2 text-sm text-gray-700 flex items-center',
                              children: [
                                o.jsx('span', {
                                  className: 'mr-2',
                                  children: gs(h.value),
                                }),
                                h.label,
                              ],
                            }),
                          ],
                        },
                        h.value
                      )
                    ),
                  }),
                ],
              }),
            ],
          }),
          o.jsxs('div', {
            className: 'mt-6 pt-4 border-t border-gray-200',
            children: [
              o.jsx('h4', {
                className: 'text-sm font-medium text-gray-900 mb-3',
                children: 'Filtri Rapidi',
              }),
              o.jsxs('div', {
                className: 'flex flex-wrap gap-2',
                children: [
                  o.jsx('button', {
                    onClick: () => {
                      n({ ...s, statuses: ['pending', 'overdue'] })
                    },
                    className:
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors',
                    children: '⏳ Solo Da Completare',
                  }),
                  o.jsx('button', {
                    onClick: () => {
                      n({ ...s, statuses: ['overdue'] })
                    },
                    className:
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors',
                    children: '⚠️ Solo In Ritardo',
                  }),
                  o.jsx('button', {
                    onClick: () => {
                      n({ ...s, priorities: ['high', 'critical'] })
                    },
                    className:
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors',
                    children: '🔥 Alta Priorità',
                  }),
                  o.jsx('button', {
                    onClick: () => {
                      n({ ...s, types: ['maintenance'] })
                    },
                    className:
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors',
                    children: '🔧 Solo Manutenzioni',
                  }),
                ],
              }),
            ],
          }),
          o.jsxs('div', {
            className:
              'mt-6 pt-4 border-t border-gray-200 flex items-center justify-between',
            children: [
              o.jsxs('button', {
                onClick: d,
                className:
                  'inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                children: [
                  o.jsx(Mn, { className: 'h-4 w-4 mr-2' }),
                  'Reset Filtri',
                ],
              }),
              o.jsxs('div', {
                className: 'flex items-center space-x-3',
                children: [
                  o.jsx('button', {
                    onClick: t,
                    className:
                      'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    children: 'Annulla',
                  }),
                  o.jsx('button', {
                    onClick: c,
                    className:
                      'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                    children: 'Applica Filtri',
                  }),
                ],
              }),
            ],
          }),
          u &&
            o.jsxs('div', {
              className: 'mt-4 p-3 bg-blue-50 rounded-lg',
              children: [
                o.jsx('h5', {
                  className: 'text-sm font-medium text-blue-900 mb-2',
                  children: 'Filtri Attivi:',
                }),
                o.jsxs('div', {
                  className: 'flex flex-wrap gap-2',
                  children: [
                    s.types.map(h =>
                      o.jsxs(
                        'span',
                        {
                          className:
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
                          children: [
                            fs(h),
                            ' ',
                            dr.find(p => p.value === h)?.label,
                          ],
                        },
                        h
                      )
                    ),
                    s.statuses.map(h =>
                      o.jsxs(
                        'span',
                        {
                          className:
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
                          children: [
                            ms(h),
                            ' ',
                            ur.find(p => p.value === h)?.label,
                          ],
                        },
                        h
                      )
                    ),
                    s.priorities.map(h =>
                      o.jsxs(
                        'span',
                        {
                          className:
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
                          children: [
                            gs(h),
                            ' ',
                            hr.find(p => p.value === h)?.label,
                          ],
                        },
                        h
                      )
                    ),
                  ],
                }),
              ],
            }),
        ],
      }),
    })
  },
  Tl = ({ event: r, onUpdate: e, onClose: t }) => {
    const { userRole: s, userId: n } = xe(),
      [i, a] = E.useState(!1),
      [l, c] = E.useState(null),
      [d, u] = E.useState(''),
      h = Bo.filter(b => {
        if (!b.allowedRoles.includes(s)) return !1
        const v = b.showFor.types.includes(r.type),
          A = b.showFor.statuses.includes(r.status)
        return v && A
      }),
      p = () => {
        const b = {
          ...r,
          status: 'completed',
          updated_at: new Date(),
          metadata: {
            ...r.metadata,
            completion_data: {
              completed_at: new Date(),
              completed_by: n || 'unknown',
              method: 'quick_action',
            },
          },
        }
        ;(e(b), t())
      },
      f = () => {
        if (!d) return
        const b = new Date(d),
          w = r.end ? r.end.getTime() - r.start.getTime() : 60 * 60 * 1e3,
          v = {
            ...r,
            start: b,
            end: new Date(b.getTime() + w),
            updated_at: new Date(),
            metadata: {
              ...r.metadata,
              notes: `${r.metadata.notes || ''}
Riprogrammato il ${new Date().toLocaleString('it-IT')}`,
            },
          }
        ;(e(v), a(!1), t())
      },
      g = () => {
        const b = {
          ...r,
          status: 'cancelled',
          updated_at: new Date(),
          metadata: {
            ...r.metadata,
            notes: `${r.metadata.notes || ''}
Annullato il ${new Date().toLocaleString('it-IT')}`,
          },
        }
        ;(e(b), c(null), t())
      },
      m = b => {
        switch (b) {
          case 'complete':
            return o.jsx(es, { className: 'h-4 w-4' })
          case 'reschedule':
            return o.jsx(jt, { className: 'h-4 w-4' })
          case 'assign':
            return o.jsx(Sr, { className: 'h-4 w-4' })
          case 'cancel':
            return o.jsx(et, { className: 'h-4 w-4' })
          case 'edit':
            return o.jsx(Cr, { className: 'h-4 w-4' })
          case 'delete':
            return o.jsx(Er, { className: 'h-4 w-4' })
          default:
            return o.jsx(Fe, { className: 'h-4 w-4' })
        }
      },
      y = b => {
        switch (b) {
          case 'complete':
            return 'bg-green-600 hover:bg-green-700 text-white'
          case 'reschedule':
            return 'bg-blue-600 hover:bg-blue-700 text-white'
          case 'assign':
            return 'bg-purple-600 hover:bg-purple-700 text-white'
          case 'cancel':
            return 'bg-red-600 hover:bg-red-700 text-white'
          case 'edit':
            return 'bg-gray-600 hover:bg-gray-700 text-white'
          case 'delete':
            return 'bg-red-700 hover:bg-red-800 text-white'
          default:
            return 'bg-gray-600 hover:bg-gray-700 text-white'
        }
      },
      x = (b, w) => {
        if (w) {
          c(b)
          return
        }
        switch (b) {
          case 'complete':
            p()
            break
          case 'reschedule':
            a(!0)
            break
          case 'cancel':
            c('cancel')
            break
          default:
            console.log(`Action ${b} not implemented yet`)
        }
      }
    return h.length === 0
      ? null
      : o.jsxs(o.Fragment, {
          children: [
            o.jsxs('div', {
              className:
                'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-40',
              children: [
                o.jsxs('div', {
                  className: 'flex items-center justify-between mb-3',
                  children: [
                    o.jsx('h4', {
                      className: 'text-sm font-medium text-gray-900',
                      children: 'Azioni Rapide',
                    }),
                    o.jsx('button', {
                      onClick: t,
                      className:
                        'text-gray-400 hover:text-gray-600 transition-colors',
                      children: o.jsx(et, { className: 'h-4 w-4' }),
                    }),
                  ],
                }),
                o.jsx('div', {
                  className: 'space-y-2',
                  children: h.map(b =>
                    o.jsxs(
                      'button',
                      {
                        onClick: () => x(b.action, b.requiresConfirmation),
                        className: `w-full inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${y(b.action)}`,
                        children: [
                          m(b.action),
                          o.jsx('span', {
                            className: 'ml-2',
                            children: b.label,
                          }),
                        ],
                      },
                      b.action
                    )
                  ),
                }),
                o.jsxs('div', {
                  className: 'mt-3 pt-3 border-t border-gray-200',
                  children: [
                    o.jsxs('p', {
                      className: 'text-xs text-gray-500',
                      children: ['Evento: ', r.title],
                    }),
                    o.jsxs('p', {
                      className: 'text-xs text-gray-500',
                      children: [
                        'Stato: ',
                        r.status,
                        ' | Priorità: ',
                        r.priority,
                      ],
                    }),
                  ],
                }),
              ],
            }),
            i &&
              o.jsx('div', {
                className: 'fixed inset-0 z-50 overflow-y-auto',
                children: o.jsxs('div', {
                  className:
                    'flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0',
                  children: [
                    o.jsx('div', {
                      className:
                        'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
                    }),
                    o.jsxs('div', {
                      className:
                        'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full',
                      children: [
                        o.jsx('div', {
                          className: 'bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4',
                          children: o.jsxs('div', {
                            className: 'sm:flex sm:items-start',
                            children: [
                              o.jsx('div', {
                                className:
                                  'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10',
                                children: o.jsx(jt, {
                                  className: 'h-6 w-6 text-blue-600',
                                }),
                              }),
                              o.jsxs('div', {
                                className:
                                  'mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1',
                                children: [
                                  o.jsx('h3', {
                                    className:
                                      'text-lg leading-6 font-medium text-gray-900',
                                    children: 'Riprogramma Evento',
                                  }),
                                  o.jsxs('div', {
                                    className: 'mt-2',
                                    children: [
                                      o.jsxs('p', {
                                        className: 'text-sm text-gray-500 mb-4',
                                        children: [
                                          `Seleziona la nuova data e ora per l'evento "`,
                                          r.title,
                                          '".',
                                        ],
                                      }),
                                      o.jsxs('div', {
                                        children: [
                                          o.jsx('label', {
                                            className:
                                              'block text-sm font-medium text-gray-700 mb-2',
                                            children: 'Nuova Data e Ora',
                                          }),
                                          o.jsx('input', {
                                            type: 'datetime-local',
                                            value: d,
                                            onChange: b => u(b.target.value),
                                            className:
                                              'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                                            min: new Date()
                                              .toISOString()
                                              .slice(0, 16),
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                        o.jsxs('div', {
                          className:
                            'bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse',
                          children: [
                            o.jsx('button', {
                              onClick: f,
                              disabled: !d,
                              className:
                                'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed',
                              children: 'Riprogramma',
                            }),
                            o.jsx('button', {
                              onClick: () => a(!1),
                              className:
                                'mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm',
                              children: 'Annulla',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            l &&
              o.jsx('div', {
                className: 'fixed inset-0 z-50 overflow-y-auto',
                children: o.jsxs('div', {
                  className:
                    'flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0',
                  children: [
                    o.jsx('div', {
                      className:
                        'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
                    }),
                    o.jsxs('div', {
                      className:
                        'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full',
                      children: [
                        o.jsx('div', {
                          className: 'bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4',
                          children: o.jsxs('div', {
                            className: 'sm:flex sm:items-start',
                            children: [
                              o.jsx('div', {
                                className:
                                  'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10',
                                children: o.jsx(Un, {
                                  className: 'h-6 w-6 text-red-600',
                                }),
                              }),
                              o.jsxs('div', {
                                className:
                                  'mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left',
                                children: [
                                  o.jsx('h3', {
                                    className:
                                      'text-lg leading-6 font-medium text-gray-900',
                                    children: 'Conferma Azione',
                                  }),
                                  o.jsx('div', {
                                    className: 'mt-2',
                                    children: o.jsxs('p', {
                                      className: 'text-sm text-gray-500',
                                      children: [
                                        l === 'cancel' &&
                                          `Sei sicuro di voler annullare l'evento "${r.title}"? Questa azione può essere annullata modificando nuovamente l'evento.`,
                                        l === 'delete' &&
                                          `Sei sicuro di voler eliminare l'evento "${r.title}"? Questa azione non può essere annullata.`,
                                      ],
                                    }),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                        o.jsxs('div', {
                          className:
                            'bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse',
                          children: [
                            o.jsx('button', {
                              onClick: () => {
                                l === 'cancel' && g()
                              },
                              className:
                                'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm',
                              children:
                                l === 'cancel' ? 'Annulla Evento' : 'Elimina',
                            }),
                            o.jsx('button', {
                              onClick: () => c(null),
                              className:
                                'mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm',
                              children: 'Annulla',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
          ],
        })
  },
  Nl = {
    defaultView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    height: 'auto',
    locale: 'it',
    firstDay: 1,
    slotMinTime: '06:00:00',
    slotMaxTime: '24:00:00',
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '22:00',
    },
    notifications: {
      enabled: !0,
      defaultTimings: ['minutes_before', 'hours_before'],
    },
    colorScheme: {
      maintenance: '#F59E0B',
      task: '#3B82F6',
      training: '#10B981',
      inventory: '#8B5CF6',
      meeting: '#EF4444',
      temperature_reading: '#06B6D4',
      general_task: '#84CC16',
      custom: '#F97316',
    },
  },
  Al = ({
    events: r,
    onEventClick: e,
    onEventCreate: t,
    onEventUpdate: s,
    onEventDelete: n,
    onDateSelect: i,
    config: a = {},
    loading: l = !1,
    error: c = null,
  }) => {
    const [d, u] = E.useState(null),
      [h, p] = E.useState(!1),
      [f, g] = E.useState(!1),
      [m, y] = E.useState({
        types: [],
        statuses: [],
        priorities: [],
        departments: [],
        assignees: [],
      }),
      x = E.useRef(null),
      b = { ...Nl, ...a },
      w = Go(r),
      v = E.useCallback(
        N => {
          const $ = N.event.extendedProps?.originalEvent
          $ && (u($), p(!0), e?.($))
        },
        [e]
      ),
      A = E.useCallback(
        N => {
          const $ = new Date(N.start),
            M = new Date(N.end)
          i?.($, M)
        },
        [i]
      ),
      j = E.useCallback(
        N => {
          const $ = N.event.extendedProps?.originalEvent
          if ($ && s) {
            const M = {
              ...$,
              start: N.event.start ? new Date(N.event.start) : new Date(),
              end: N.event.end ? new Date(N.event.end) : void 0,
              updated_at: new Date(),
            }
            s(M)
          }
        },
        [s]
      ),
      O = E.useCallback(
        N => {
          const $ = N.event.extendedProps?.originalEvent
          if ($ && s) {
            const M = {
              ...$,
              start: N.event.start ? new Date(N.event.start) : new Date(),
              end: N.event.end ? new Date(N.event.end) : void 0,
              updated_at: new Date(),
            }
            s(M)
          }
        },
        [s]
      ),
      S = {
        addEvent: {
          text: 'Nuovo',
          click: () => {
            if (t) {
              const N = new Date()
              t({
                start: N,
                end: new Date(N.getTime() + 60 * 60 * 1e3),
                allDay: !1,
              })
            }
          },
        },
        filterToggle: { text: 'Filtri', click: () => g(!f) },
      }
    return l
      ? o.jsx('div', {
          className:
            'flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200',
          children: o.jsxs('div', {
            className: 'text-center',
            children: [
              o.jsx('div', {
                className:
                  'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4',
              }),
              o.jsx('p', {
                className: 'text-gray-600',
                children: 'Caricamento calendario...',
              }),
            ],
          }),
        })
      : c
        ? o.jsx('div', {
            className:
              'flex items-center justify-center h-96 bg-white rounded-lg border border-red-200',
            children: o.jsxs('div', {
              className: 'text-center',
              children: [
                o.jsx('div', {
                  className: 'mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit',
                  children: o.jsx(Fe, { className: 'h-8 w-8 text-red-600' }),
                }),
                o.jsx('h3', {
                  className: 'text-lg font-semibold text-gray-900 mb-2',
                  children: 'Errore nel caricamento del calendario',
                }),
                o.jsx('p', { className: 'text-gray-600', children: c }),
              ],
            }),
          })
        : o.jsxs('div', {
            className: 'bg-white rounded-lg border border-gray-200 shadow-sm',
            children: [
              o.jsx('div', {
                className: 'p-4 border-b border-gray-200',
                children: o.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    o.jsxs('div', {
                      className: 'flex items-center space-x-3',
                      children: [
                        o.jsx('div', {
                          className: 'p-2 bg-blue-100 rounded-lg',
                          children: o.jsx(Fe, {
                            className: 'h-5 w-5 text-blue-600',
                          }),
                        }),
                        o.jsxs('div', {
                          children: [
                            o.jsx('h2', {
                              className: 'text-lg font-semibold text-gray-900',
                              children: 'Calendario Unified',
                            }),
                            o.jsx('p', {
                              className: 'text-sm text-gray-600',
                              children:
                                'Mansioni, manutenzioni e attività in un unico calendario',
                            }),
                          ],
                        }),
                      ],
                    }),
                    o.jsxs('div', {
                      className: 'flex items-center space-x-2',
                      children: [
                        o.jsxs('button', {
                          onClick: () => g(!f),
                          className: `inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${f ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`,
                          children: [
                            o.jsx(_s, { className: 'h-4 w-4 mr-2' }),
                            'Filtri',
                          ],
                        }),
                        t &&
                          o.jsxs('button', {
                            onClick: () => {
                              const N = new Date()
                              t({
                                start: N,
                                end: new Date(N.getTime() + 60 * 60 * 1e3),
                                allDay: !1,
                              })
                            },
                            className:
                              'inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors',
                            children: [
                              o.jsx(zn, { className: 'h-4 w-4 mr-2' }),
                              'Nuovo Evento',
                            ],
                          }),
                      ],
                    }),
                  ],
                }),
              }),
              f &&
                o.jsx(El, {
                  filters: m,
                  onFiltersChange: y,
                  onClose: () => g(!1),
                }),
              o.jsx('div', {
                className: 'p-4',
                children: o.jsx('div', {
                  className: 'calendar-container',
                  children: o.jsx(Rn, {
                    ref: x,
                    plugins: [$n, Ln, Fn, Sl],
                    initialView: b.defaultView,
                    headerToolbar: b.headerToolbar,
                    customButtons: S,
                    height: b.height,
                    locale: b.locale,
                    firstDay: b.firstDay,
                    slotMinTime: b.slotMinTime,
                    slotMaxTime: b.slotMaxTime,
                    businessHours: b.businessHours,
                    events: w,
                    eventClick: v,
                    select: A,
                    eventDrop: j,
                    eventResize: O,
                    selectable: !0,
                    editable: !0,
                    dayMaxEvents: 3,
                    moreLinkClick: 'popover',
                    nowIndicator: !0,
                    weekNumbers: !1,
                    eventDisplay: 'block',
                    displayEventTime: !0,
                    allDaySlot: !0,
                    slotEventOverlap: !1,
                    eventOverlap: !1,
                    selectMirror: !0,
                    unselectAuto: !0,
                    eventResizableFromStart: !0,
                    eventDurationEditable: !0,
                    eventStartEditable: !0,
                    eventClassNames: N => {
                      const $ = N.event.extendedProps
                      return $
                        ? [
                            `event-type-${$.type}`,
                            `event-status-${$.status}`,
                            `event-priority-${$.priority}`,
                          ]
                        : []
                    },
                    eventContent: N => {
                      const { event: $ } = N,
                        M = $.extendedProps
                      return o.jsxs('div', {
                        className: 'fc-event-content-custom',
                        children: [
                          o.jsxs('div', {
                            className: 'fc-event-title-container',
                            children: [
                              M?.type &&
                                o.jsxs('span', {
                                  className: 'fc-event-type-icon',
                                  children: [
                                    M.type === 'maintenance' && '🔧',
                                    M.type === 'general_task' && '📋',
                                    M.type === 'temperature_reading' && '🌡️',
                                    M.type === 'custom' && '📌',
                                  ],
                                }),
                              o.jsx('span', {
                                className: 'fc-event-title',
                                children: $.title,
                              }),
                            ],
                          }),
                          M?.priority === 'critical' &&
                            o.jsx('span', {
                              className: 'fc-event-priority-indicator',
                              children: '🔴',
                            }),
                        ],
                      })
                    },
                  }),
                }),
              }),
              d &&
                o.jsx(Cl, {
                  isOpen: h,
                  onClose: () => {
                    ;(p(!1), u(null))
                  },
                  event: d,
                  onUpdate: s,
                  onDelete: n,
                }),
              d &&
                s &&
                o.jsx(Tl, { event: d, onUpdate: s, onClose: () => u(null) }),
              o.jsx('style', {
                children: `
        .calendar-container {
          --fc-border-color: #e5e7eb;
          --fc-button-bg-color: #3b82f6;
          --fc-button-border-color: #3b82f6;
          --fc-button-hover-bg-color: #2563eb;
          --fc-button-hover-border-color: #2563eb;
          --fc-button-active-bg-color: #1d4ed8;
          --fc-button-active-border-color: #1d4ed8;
          --fc-today-bg-color: #eff6ff;
        }

        .fc-event-content-custom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2px 4px;
        }

        .fc-event-title-container {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .fc-event-type-icon {
          font-size: 12px;
          flex-shrink: 0;
        }

        .fc-event-title {
          font-size: 11px;
          font-weight: 500;
          truncate: true;
          flex: 1;
          min-width: 0;
        }

        .fc-event-priority-indicator {
          font-size: 10px;
          flex-shrink: 0;
        }

        /* Event type styling */
        .event-type-maintenance {
          background-color: #fef3c7 !important;
          border-color: #f59e0b !important;
          color: #92400e !important;
        }

        .event-type-general_task {
          background-color: #dbeafe !important;
          border-color: #3b82f6 !important;
          color: #1e40af !important;
        }

        .event-type-temperature_reading {
          background-color: #dcfce7 !important;
          border-color: #10b981 !important;
          color: #065f46 !important;
        }

        .event-type-custom {
          background-color: #f3e8ff !important;
          border-color: #8b5cf6 !important;
          color: #5b21b6 !important;
        }

        /* Status styling */
        .event-status-completed {
          background-color: #dcfce7 !important;
          border-color: #10b981 !important;
          color: #065f46 !important;
          opacity: 0.8;
        }

        .event-status-overdue {
          background-color: #fee2e2 !important;
          border-color: #ef4444 !important;
          color: #991b1b !important;
          animation: pulse 2s infinite;
        }

        .event-status-cancelled {
          background-color: #f9fafb !important;
          border-color: #9ca3af !important;
          color: #6b7280 !important;
          opacity: 0.6;
          text-decoration: line-through;
        }

        /* Priority styling */
        .event-priority-critical {
          background-color: #7f1d1d !important;
          border-color: #991b1b !important;
          color: #ffffff !important;
          font-weight: 600;
        }

        .event-priority-high {
          border-width: 2px !important;
          font-weight: 500;
        }
      `,
              }),
            ],
          })
  },
  Ps = '-',
  Pl = r => {
    const e = Il(r),
      { conflictingClassGroups: t, conflictingClassGroupModifiers: s } = r
    return {
      getClassGroupId: a => {
        const l = a.split(Ps)
        return (l[0] === '' && l.length !== 1 && l.shift(), nn(l, e) || Dl(a))
      },
      getConflictingClassGroupIds: (a, l) => {
        const c = t[a] || []
        return l && s[a] ? [...c, ...s[a]] : c
      },
    }
  },
  nn = (r, e) => {
    if (r.length === 0) return e.classGroupId
    const t = r[0],
      s = e.nextPart.get(t),
      n = s ? nn(r.slice(1), s) : void 0
    if (n) return n
    if (e.validators.length === 0) return
    const i = r.join(Ps)
    return e.validators.find(({ validator: a }) => a(i))?.classGroupId
  },
  fr = /^\[(.+)\]$/,
  Dl = r => {
    if (fr.test(r)) {
      const e = fr.exec(r)[1],
        t = e?.substring(0, e.indexOf(':'))
      if (t) return 'arbitrary..' + t
    }
  },
  Il = r => {
    const { theme: e, classGroups: t } = r,
      s = { nextPart: new Map(), validators: [] }
    for (const n in t) ps(t[n], s, n, e)
    return s
  },
  ps = (r, e, t, s) => {
    r.forEach(n => {
      if (typeof n == 'string') {
        const i = n === '' ? e : mr(e, n)
        i.classGroupId = t
        return
      }
      if (typeof n == 'function') {
        if (Ol(n)) {
          ps(n(s), e, t, s)
          return
        }
        e.validators.push({ validator: n, classGroupId: t })
        return
      }
      Object.entries(n).forEach(([i, a]) => {
        ps(a, mr(e, i), t, s)
      })
    })
  },
  mr = (r, e) => {
    let t = r
    return (
      e.split(Ps).forEach(s => {
        ;(t.nextPart.has(s) ||
          t.nextPart.set(s, { nextPart: new Map(), validators: [] }),
          (t = t.nextPart.get(s)))
      }),
      t
    )
  },
  Ol = r => r.isThemeGetter,
  Rl = r => {
    if (r < 1) return { get: () => {}, set: () => {} }
    let e = 0,
      t = new Map(),
      s = new Map()
    const n = (i, a) => {
      ;(t.set(i, a), e++, e > r && ((e = 0), (s = t), (t = new Map())))
    }
    return {
      get(i) {
        let a = t.get(i)
        if (a !== void 0) return a
        if ((a = s.get(i)) !== void 0) return (n(i, a), a)
      },
      set(i, a) {
        t.has(i) ? t.set(i, a) : n(i, a)
      },
    }
  },
  ys = '!',
  bs = ':',
  $l = bs.length,
  Ll = r => {
    const { prefix: e, experimentalParseClassName: t } = r
    let s = n => {
      const i = []
      let a = 0,
        l = 0,
        c = 0,
        d
      for (let g = 0; g < n.length; g++) {
        let m = n[g]
        if (a === 0 && l === 0) {
          if (m === bs) {
            ;(i.push(n.slice(c, g)), (c = g + $l))
            continue
          }
          if (m === '/') {
            d = g
            continue
          }
        }
        m === '[' ? a++ : m === ']' ? a-- : m === '(' ? l++ : m === ')' && l--
      }
      const u = i.length === 0 ? n : n.substring(c),
        h = Fl(u),
        p = h !== u,
        f = d && d > c ? d - c : void 0
      return {
        modifiers: i,
        hasImportantModifier: p,
        baseClassName: h,
        maybePostfixModifierPosition: f,
      }
    }
    if (e) {
      const n = e + bs,
        i = s
      s = a =>
        a.startsWith(n)
          ? i(a.substring(n.length))
          : {
              isExternal: !0,
              modifiers: [],
              hasImportantModifier: !1,
              baseClassName: a,
              maybePostfixModifierPosition: void 0,
            }
    }
    if (t) {
      const n = s
      s = i => t({ className: i, parseClassName: n })
    }
    return s
  },
  Fl = r =>
    r.endsWith(ys)
      ? r.substring(0, r.length - 1)
      : r.startsWith(ys)
        ? r.substring(1)
        : r,
  Ml = r => {
    const e = Object.fromEntries(r.orderSensitiveModifiers.map(s => [s, !0]))
    return s => {
      if (s.length <= 1) return s
      const n = []
      let i = []
      return (
        s.forEach(a => {
          a[0] === '[' || e[a] ? (n.push(...i.sort(), a), (i = [])) : i.push(a)
        }),
        n.push(...i.sort()),
        n
      )
    }
  },
  Ul = r => ({
    cache: Rl(r.cacheSize),
    parseClassName: Ll(r),
    sortModifiers: Ml(r),
    ...Pl(r),
  }),
  zl = /\s+/,
  ql = (r, e) => {
    const {
        parseClassName: t,
        getClassGroupId: s,
        getConflictingClassGroupIds: n,
        sortModifiers: i,
      } = e,
      a = [],
      l = r.trim().split(zl)
    let c = ''
    for (let d = l.length - 1; d >= 0; d -= 1) {
      const u = l[d],
        {
          isExternal: h,
          modifiers: p,
          hasImportantModifier: f,
          baseClassName: g,
          maybePostfixModifierPosition: m,
        } = t(u)
      if (h) {
        c = u + (c.length > 0 ? ' ' + c : c)
        continue
      }
      let y = !!m,
        x = s(y ? g.substring(0, m) : g)
      if (!x) {
        if (!y) {
          c = u + (c.length > 0 ? ' ' + c : c)
          continue
        }
        if (((x = s(g)), !x)) {
          c = u + (c.length > 0 ? ' ' + c : c)
          continue
        }
        y = !1
      }
      const b = i(p).join(':'),
        w = f ? b + ys : b,
        v = w + x
      if (a.includes(v)) continue
      a.push(v)
      const A = n(x, y)
      for (let j = 0; j < A.length; ++j) {
        const O = A[j]
        a.push(w + O)
      }
      c = u + (c.length > 0 ? ' ' + c : c)
    }
    return c
  }
function Bl() {
  let r = 0,
    e,
    t,
    s = ''
  for (; r < arguments.length; )
    (e = arguments[r++]) && (t = an(e)) && (s && (s += ' '), (s += t))
  return s
}
const an = r => {
  if (typeof r == 'string') return r
  let e,
    t = ''
  for (let s = 0; s < r.length; s++)
    r[s] && (e = an(r[s])) && (t && (t += ' '), (t += e))
  return t
}
function vs(r, ...e) {
  let t,
    s,
    n,
    i = a
  function a(c) {
    const d = e.reduce((u, h) => h(u), r())
    return ((t = Ul(d)), (s = t.cache.get), (n = t.cache.set), (i = l), l(c))
  }
  function l(c) {
    const d = s(c)
    if (d) return d
    const u = ql(c, t)
    return (n(c, u), u)
  }
  return function () {
    return i(Bl.apply(null, arguments))
  }
}
const q = r => {
    const e = t => t[r] || []
    return ((e.isThemeGetter = !0), e)
  },
  on = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  ln = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  Hl = /^\d+\/\d+$/,
  Gl = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  Wl =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  Vl = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  Kl = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  Jl =
    /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  Pe = r => Hl.test(r),
  P = r => !!r && !Number.isNaN(Number(r)),
  le = r => !!r && Number.isInteger(Number(r)),
  Zt = r => r.endsWith('%') && P(r.slice(0, -1)),
  ne = r => Gl.test(r),
  Ql = () => !0,
  Yl = r => Wl.test(r) && !Vl.test(r),
  cn = () => !1,
  Zl = r => Kl.test(r),
  Xl = r => Jl.test(r),
  ec = r => !_(r) && !k(r),
  tc = r => Be(r, hn, cn),
  _ = r => on.test(r),
  ge = r => Be(r, fn, Yl),
  Xt = r => Be(r, ac, P),
  gr = r => Be(r, dn, cn),
  sc = r => Be(r, un, Xl),
  vt = r => Be(r, mn, Zl),
  k = r => ln.test(r),
  Ve = r => He(r, fn),
  rc = r => He(r, oc),
  pr = r => He(r, dn),
  nc = r => He(r, hn),
  ic = r => He(r, un),
  xt = r => He(r, mn, !0),
  Be = (r, e, t) => {
    const s = on.exec(r)
    return s ? (s[1] ? e(s[1]) : t(s[2])) : !1
  },
  He = (r, e, t = !1) => {
    const s = ln.exec(r)
    return s ? (s[1] ? e(s[1]) : t) : !1
  },
  dn = r => r === 'position' || r === 'percentage',
  un = r => r === 'image' || r === 'url',
  hn = r => r === 'length' || r === 'size' || r === 'bg-size',
  fn = r => r === 'length',
  ac = r => r === 'number',
  oc = r => r === 'family-name',
  mn = r => r === 'shadow',
  xs = () => {
    const r = q('color'),
      e = q('font'),
      t = q('text'),
      s = q('font-weight'),
      n = q('tracking'),
      i = q('leading'),
      a = q('breakpoint'),
      l = q('container'),
      c = q('spacing'),
      d = q('radius'),
      u = q('shadow'),
      h = q('inset-shadow'),
      p = q('text-shadow'),
      f = q('drop-shadow'),
      g = q('blur'),
      m = q('perspective'),
      y = q('aspect'),
      x = q('ease'),
      b = q('animate'),
      w = () => [
        'auto',
        'avoid',
        'all',
        'avoid-page',
        'page',
        'left',
        'right',
        'column',
      ],
      v = () => [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top-left',
        'left-top',
        'top-right',
        'right-top',
        'bottom-right',
        'right-bottom',
        'bottom-left',
        'left-bottom',
      ],
      A = () => [...v(), k, _],
      j = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'],
      O = () => ['auto', 'contain', 'none'],
      S = () => [k, _, c],
      N = () => [Pe, 'full', 'auto', ...S()],
      $ = () => [le, 'none', 'subgrid', k, _],
      M = () => ['auto', { span: ['full', le, k, _] }, le, k, _],
      we = () => [le, 'auto', k, _],
      it = () => ['auto', 'min', 'max', 'fr', k, _],
      _e = () => [
        'start',
        'end',
        'center',
        'between',
        'around',
        'evenly',
        'stretch',
        'baseline',
        'center-safe',
        'end-safe',
      ],
      te = () => [
        'start',
        'end',
        'center',
        'stretch',
        'center-safe',
        'end-safe',
      ],
      Q = () => ['auto', ...S()],
      Y = () => [
        Pe,
        'auto',
        'full',
        'dvw',
        'dvh',
        'lvw',
        'lvh',
        'svw',
        'svh',
        'min',
        'max',
        'fit',
        ...S(),
      ],
      C = () => [r, k, _],
      at = () => [...v(), pr, gr, { position: [k, _] }],
      ot = () => ['no-repeat', { repeat: ['', 'x', 'y', 'space', 'round'] }],
      lt = () => ['auto', 'cover', 'contain', nc, tc, { size: [k, _] }],
      ke = () => [Zt, Ve, ge],
      U = () => ['', 'none', 'full', d, k, _],
      G = () => ['', P, Ve, ge],
      je = () => ['solid', 'dashed', 'dotted', 'double'],
      Ot = () => [
        'normal',
        'multiply',
        'screen',
        'overlay',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion',
        'hue',
        'saturation',
        'color',
        'luminosity',
      ],
      z = () => [P, Zt, pr, gr],
      ct = () => ['', 'none', g, k, _],
      W = () => ['none', P, k, _],
      dt = () => ['none', P, k, _],
      Rt = () => [P, k, _],
      ut = () => [Pe, 'full', ...S()]
    return {
      cacheSize: 500,
      theme: {
        animate: ['spin', 'ping', 'pulse', 'bounce'],
        aspect: ['video'],
        blur: [ne],
        breakpoint: [ne],
        color: [Ql],
        container: [ne],
        'drop-shadow': [ne],
        ease: ['in', 'out', 'in-out'],
        font: [ec],
        'font-weight': [
          'thin',
          'extralight',
          'light',
          'normal',
          'medium',
          'semibold',
          'bold',
          'extrabold',
          'black',
        ],
        'inset-shadow': [ne],
        leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
        perspective: [
          'dramatic',
          'near',
          'normal',
          'midrange',
          'distant',
          'none',
        ],
        radius: [ne],
        shadow: [ne],
        spacing: ['px', P],
        text: [ne],
        'text-shadow': [ne],
        tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'],
      },
      classGroups: {
        aspect: [{ aspect: ['auto', 'square', Pe, _, k, y] }],
        container: ['container'],
        columns: [{ columns: [P, _, k, l] }],
        'break-after': [{ 'break-after': w() }],
        'break-before': [{ 'break-before': w() }],
        'break-inside': [
          { 'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column'] },
        ],
        'box-decoration': [{ 'box-decoration': ['slice', 'clone'] }],
        box: [{ box: ['border', 'content'] }],
        display: [
          'block',
          'inline-block',
          'inline',
          'flex',
          'inline-flex',
          'table',
          'inline-table',
          'table-caption',
          'table-cell',
          'table-column',
          'table-column-group',
          'table-footer-group',
          'table-header-group',
          'table-row-group',
          'table-row',
          'flow-root',
          'grid',
          'inline-grid',
          'contents',
          'list-item',
          'hidden',
        ],
        sr: ['sr-only', 'not-sr-only'],
        float: [{ float: ['right', 'left', 'none', 'start', 'end'] }],
        clear: [{ clear: ['left', 'right', 'both', 'none', 'start', 'end'] }],
        isolation: ['isolate', 'isolation-auto'],
        'object-fit': [
          { object: ['contain', 'cover', 'fill', 'none', 'scale-down'] },
        ],
        'object-position': [{ object: A() }],
        overflow: [{ overflow: j() }],
        'overflow-x': [{ 'overflow-x': j() }],
        'overflow-y': [{ 'overflow-y': j() }],
        overscroll: [{ overscroll: O() }],
        'overscroll-x': [{ 'overscroll-x': O() }],
        'overscroll-y': [{ 'overscroll-y': O() }],
        position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
        inset: [{ inset: N() }],
        'inset-x': [{ 'inset-x': N() }],
        'inset-y': [{ 'inset-y': N() }],
        start: [{ start: N() }],
        end: [{ end: N() }],
        top: [{ top: N() }],
        right: [{ right: N() }],
        bottom: [{ bottom: N() }],
        left: [{ left: N() }],
        visibility: ['visible', 'invisible', 'collapse'],
        z: [{ z: [le, 'auto', k, _] }],
        basis: [{ basis: [Pe, 'full', 'auto', l, ...S()] }],
        'flex-direction': [
          { flex: ['row', 'row-reverse', 'col', 'col-reverse'] },
        ],
        'flex-wrap': [{ flex: ['nowrap', 'wrap', 'wrap-reverse'] }],
        flex: [{ flex: [P, Pe, 'auto', 'initial', 'none', _] }],
        grow: [{ grow: ['', P, k, _] }],
        shrink: [{ shrink: ['', P, k, _] }],
        order: [{ order: [le, 'first', 'last', 'none', k, _] }],
        'grid-cols': [{ 'grid-cols': $() }],
        'col-start-end': [{ col: M() }],
        'col-start': [{ 'col-start': we() }],
        'col-end': [{ 'col-end': we() }],
        'grid-rows': [{ 'grid-rows': $() }],
        'row-start-end': [{ row: M() }],
        'row-start': [{ 'row-start': we() }],
        'row-end': [{ 'row-end': we() }],
        'grid-flow': [
          { 'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense'] },
        ],
        'auto-cols': [{ 'auto-cols': it() }],
        'auto-rows': [{ 'auto-rows': it() }],
        gap: [{ gap: S() }],
        'gap-x': [{ 'gap-x': S() }],
        'gap-y': [{ 'gap-y': S() }],
        'justify-content': [{ justify: [..._e(), 'normal'] }],
        'justify-items': [{ 'justify-items': [...te(), 'normal'] }],
        'justify-self': [{ 'justify-self': ['auto', ...te()] }],
        'align-content': [{ content: ['normal', ..._e()] }],
        'align-items': [{ items: [...te(), { baseline: ['', 'last'] }] }],
        'align-self': [{ self: ['auto', ...te(), { baseline: ['', 'last'] }] }],
        'place-content': [{ 'place-content': _e() }],
        'place-items': [{ 'place-items': [...te(), 'baseline'] }],
        'place-self': [{ 'place-self': ['auto', ...te()] }],
        p: [{ p: S() }],
        px: [{ px: S() }],
        py: [{ py: S() }],
        ps: [{ ps: S() }],
        pe: [{ pe: S() }],
        pt: [{ pt: S() }],
        pr: [{ pr: S() }],
        pb: [{ pb: S() }],
        pl: [{ pl: S() }],
        m: [{ m: Q() }],
        mx: [{ mx: Q() }],
        my: [{ my: Q() }],
        ms: [{ ms: Q() }],
        me: [{ me: Q() }],
        mt: [{ mt: Q() }],
        mr: [{ mr: Q() }],
        mb: [{ mb: Q() }],
        ml: [{ ml: Q() }],
        'space-x': [{ 'space-x': S() }],
        'space-x-reverse': ['space-x-reverse'],
        'space-y': [{ 'space-y': S() }],
        'space-y-reverse': ['space-y-reverse'],
        size: [{ size: Y() }],
        w: [{ w: [l, 'screen', ...Y()] }],
        'min-w': [{ 'min-w': [l, 'screen', 'none', ...Y()] }],
        'max-w': [
          { 'max-w': [l, 'screen', 'none', 'prose', { screen: [a] }, ...Y()] },
        ],
        h: [{ h: ['screen', 'lh', ...Y()] }],
        'min-h': [{ 'min-h': ['screen', 'lh', 'none', ...Y()] }],
        'max-h': [{ 'max-h': ['screen', 'lh', ...Y()] }],
        'font-size': [{ text: ['base', t, Ve, ge] }],
        'font-smoothing': ['antialiased', 'subpixel-antialiased'],
        'font-style': ['italic', 'not-italic'],
        'font-weight': [{ font: [s, k, Xt] }],
        'font-stretch': [
          {
            'font-stretch': [
              'ultra-condensed',
              'extra-condensed',
              'condensed',
              'semi-condensed',
              'normal',
              'semi-expanded',
              'expanded',
              'extra-expanded',
              'ultra-expanded',
              Zt,
              _,
            ],
          },
        ],
        'font-family': [{ font: [rc, _, e] }],
        'fvn-normal': ['normal-nums'],
        'fvn-ordinal': ['ordinal'],
        'fvn-slashed-zero': ['slashed-zero'],
        'fvn-figure': ['lining-nums', 'oldstyle-nums'],
        'fvn-spacing': ['proportional-nums', 'tabular-nums'],
        'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
        tracking: [{ tracking: [n, k, _] }],
        'line-clamp': [{ 'line-clamp': [P, 'none', k, Xt] }],
        leading: [{ leading: [i, ...S()] }],
        'list-image': [{ 'list-image': ['none', k, _] }],
        'list-style-position': [{ list: ['inside', 'outside'] }],
        'list-style-type': [{ list: ['disc', 'decimal', 'none', k, _] }],
        'text-alignment': [
          { text: ['left', 'center', 'right', 'justify', 'start', 'end'] },
        ],
        'placeholder-color': [{ placeholder: C() }],
        'text-color': [{ text: C() }],
        'text-decoration': [
          'underline',
          'overline',
          'line-through',
          'no-underline',
        ],
        'text-decoration-style': [{ decoration: [...je(), 'wavy'] }],
        'text-decoration-thickness': [
          { decoration: [P, 'from-font', 'auto', k, ge] },
        ],
        'text-decoration-color': [{ decoration: C() }],
        'underline-offset': [{ 'underline-offset': [P, 'auto', k, _] }],
        'text-transform': [
          'uppercase',
          'lowercase',
          'capitalize',
          'normal-case',
        ],
        'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
        'text-wrap': [{ text: ['wrap', 'nowrap', 'balance', 'pretty'] }],
        indent: [{ indent: S() }],
        'vertical-align': [
          {
            align: [
              'baseline',
              'top',
              'middle',
              'bottom',
              'text-top',
              'text-bottom',
              'sub',
              'super',
              k,
              _,
            ],
          },
        ],
        whitespace: [
          {
            whitespace: [
              'normal',
              'nowrap',
              'pre',
              'pre-line',
              'pre-wrap',
              'break-spaces',
            ],
          },
        ],
        break: [{ break: ['normal', 'words', 'all', 'keep'] }],
        wrap: [{ wrap: ['break-word', 'anywhere', 'normal'] }],
        hyphens: [{ hyphens: ['none', 'manual', 'auto'] }],
        content: [{ content: ['none', k, _] }],
        'bg-attachment': [{ bg: ['fixed', 'local', 'scroll'] }],
        'bg-clip': [{ 'bg-clip': ['border', 'padding', 'content', 'text'] }],
        'bg-origin': [{ 'bg-origin': ['border', 'padding', 'content'] }],
        'bg-position': [{ bg: at() }],
        'bg-repeat': [{ bg: ot() }],
        'bg-size': [{ bg: lt() }],
        'bg-image': [
          {
            bg: [
              'none',
              {
                linear: [
                  { to: ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl'] },
                  le,
                  k,
                  _,
                ],
                radial: ['', k, _],
                conic: [le, k, _],
              },
              ic,
              sc,
            ],
          },
        ],
        'bg-color': [{ bg: C() }],
        'gradient-from-pos': [{ from: ke() }],
        'gradient-via-pos': [{ via: ke() }],
        'gradient-to-pos': [{ to: ke() }],
        'gradient-from': [{ from: C() }],
        'gradient-via': [{ via: C() }],
        'gradient-to': [{ to: C() }],
        rounded: [{ rounded: U() }],
        'rounded-s': [{ 'rounded-s': U() }],
        'rounded-e': [{ 'rounded-e': U() }],
        'rounded-t': [{ 'rounded-t': U() }],
        'rounded-r': [{ 'rounded-r': U() }],
        'rounded-b': [{ 'rounded-b': U() }],
        'rounded-l': [{ 'rounded-l': U() }],
        'rounded-ss': [{ 'rounded-ss': U() }],
        'rounded-se': [{ 'rounded-se': U() }],
        'rounded-ee': [{ 'rounded-ee': U() }],
        'rounded-es': [{ 'rounded-es': U() }],
        'rounded-tl': [{ 'rounded-tl': U() }],
        'rounded-tr': [{ 'rounded-tr': U() }],
        'rounded-br': [{ 'rounded-br': U() }],
        'rounded-bl': [{ 'rounded-bl': U() }],
        'border-w': [{ border: G() }],
        'border-w-x': [{ 'border-x': G() }],
        'border-w-y': [{ 'border-y': G() }],
        'border-w-s': [{ 'border-s': G() }],
        'border-w-e': [{ 'border-e': G() }],
        'border-w-t': [{ 'border-t': G() }],
        'border-w-r': [{ 'border-r': G() }],
        'border-w-b': [{ 'border-b': G() }],
        'border-w-l': [{ 'border-l': G() }],
        'divide-x': [{ 'divide-x': G() }],
        'divide-x-reverse': ['divide-x-reverse'],
        'divide-y': [{ 'divide-y': G() }],
        'divide-y-reverse': ['divide-y-reverse'],
        'border-style': [{ border: [...je(), 'hidden', 'none'] }],
        'divide-style': [{ divide: [...je(), 'hidden', 'none'] }],
        'border-color': [{ border: C() }],
        'border-color-x': [{ 'border-x': C() }],
        'border-color-y': [{ 'border-y': C() }],
        'border-color-s': [{ 'border-s': C() }],
        'border-color-e': [{ 'border-e': C() }],
        'border-color-t': [{ 'border-t': C() }],
        'border-color-r': [{ 'border-r': C() }],
        'border-color-b': [{ 'border-b': C() }],
        'border-color-l': [{ 'border-l': C() }],
        'divide-color': [{ divide: C() }],
        'outline-style': [{ outline: [...je(), 'none', 'hidden'] }],
        'outline-offset': [{ 'outline-offset': [P, k, _] }],
        'outline-w': [{ outline: ['', P, Ve, ge] }],
        'outline-color': [{ outline: C() }],
        shadow: [{ shadow: ['', 'none', u, xt, vt] }],
        'shadow-color': [{ shadow: C() }],
        'inset-shadow': [{ 'inset-shadow': ['none', h, xt, vt] }],
        'inset-shadow-color': [{ 'inset-shadow': C() }],
        'ring-w': [{ ring: G() }],
        'ring-w-inset': ['ring-inset'],
        'ring-color': [{ ring: C() }],
        'ring-offset-w': [{ 'ring-offset': [P, ge] }],
        'ring-offset-color': [{ 'ring-offset': C() }],
        'inset-ring-w': [{ 'inset-ring': G() }],
        'inset-ring-color': [{ 'inset-ring': C() }],
        'text-shadow': [{ 'text-shadow': ['none', p, xt, vt] }],
        'text-shadow-color': [{ 'text-shadow': C() }],
        opacity: [{ opacity: [P, k, _] }],
        'mix-blend': [
          { 'mix-blend': [...Ot(), 'plus-darker', 'plus-lighter'] },
        ],
        'bg-blend': [{ 'bg-blend': Ot() }],
        'mask-clip': [
          {
            'mask-clip': [
              'border',
              'padding',
              'content',
              'fill',
              'stroke',
              'view',
            ],
          },
          'mask-no-clip',
        ],
        'mask-composite': [
          { mask: ['add', 'subtract', 'intersect', 'exclude'] },
        ],
        'mask-image-linear-pos': [{ 'mask-linear': [P] }],
        'mask-image-linear-from-pos': [{ 'mask-linear-from': z() }],
        'mask-image-linear-to-pos': [{ 'mask-linear-to': z() }],
        'mask-image-linear-from-color': [{ 'mask-linear-from': C() }],
        'mask-image-linear-to-color': [{ 'mask-linear-to': C() }],
        'mask-image-t-from-pos': [{ 'mask-t-from': z() }],
        'mask-image-t-to-pos': [{ 'mask-t-to': z() }],
        'mask-image-t-from-color': [{ 'mask-t-from': C() }],
        'mask-image-t-to-color': [{ 'mask-t-to': C() }],
        'mask-image-r-from-pos': [{ 'mask-r-from': z() }],
        'mask-image-r-to-pos': [{ 'mask-r-to': z() }],
        'mask-image-r-from-color': [{ 'mask-r-from': C() }],
        'mask-image-r-to-color': [{ 'mask-r-to': C() }],
        'mask-image-b-from-pos': [{ 'mask-b-from': z() }],
        'mask-image-b-to-pos': [{ 'mask-b-to': z() }],
        'mask-image-b-from-color': [{ 'mask-b-from': C() }],
        'mask-image-b-to-color': [{ 'mask-b-to': C() }],
        'mask-image-l-from-pos': [{ 'mask-l-from': z() }],
        'mask-image-l-to-pos': [{ 'mask-l-to': z() }],
        'mask-image-l-from-color': [{ 'mask-l-from': C() }],
        'mask-image-l-to-color': [{ 'mask-l-to': C() }],
        'mask-image-x-from-pos': [{ 'mask-x-from': z() }],
        'mask-image-x-to-pos': [{ 'mask-x-to': z() }],
        'mask-image-x-from-color': [{ 'mask-x-from': C() }],
        'mask-image-x-to-color': [{ 'mask-x-to': C() }],
        'mask-image-y-from-pos': [{ 'mask-y-from': z() }],
        'mask-image-y-to-pos': [{ 'mask-y-to': z() }],
        'mask-image-y-from-color': [{ 'mask-y-from': C() }],
        'mask-image-y-to-color': [{ 'mask-y-to': C() }],
        'mask-image-radial': [{ 'mask-radial': [k, _] }],
        'mask-image-radial-from-pos': [{ 'mask-radial-from': z() }],
        'mask-image-radial-to-pos': [{ 'mask-radial-to': z() }],
        'mask-image-radial-from-color': [{ 'mask-radial-from': C() }],
        'mask-image-radial-to-color': [{ 'mask-radial-to': C() }],
        'mask-image-radial-shape': [{ 'mask-radial': ['circle', 'ellipse'] }],
        'mask-image-radial-size': [
          {
            'mask-radial': [
              { closest: ['side', 'corner'], farthest: ['side', 'corner'] },
            ],
          },
        ],
        'mask-image-radial-pos': [{ 'mask-radial-at': v() }],
        'mask-image-conic-pos': [{ 'mask-conic': [P] }],
        'mask-image-conic-from-pos': [{ 'mask-conic-from': z() }],
        'mask-image-conic-to-pos': [{ 'mask-conic-to': z() }],
        'mask-image-conic-from-color': [{ 'mask-conic-from': C() }],
        'mask-image-conic-to-color': [{ 'mask-conic-to': C() }],
        'mask-mode': [{ mask: ['alpha', 'luminance', 'match'] }],
        'mask-origin': [
          {
            'mask-origin': [
              'border',
              'padding',
              'content',
              'fill',
              'stroke',
              'view',
            ],
          },
        ],
        'mask-position': [{ mask: at() }],
        'mask-repeat': [{ mask: ot() }],
        'mask-size': [{ mask: lt() }],
        'mask-type': [{ 'mask-type': ['alpha', 'luminance'] }],
        'mask-image': [{ mask: ['none', k, _] }],
        filter: [{ filter: ['', 'none', k, _] }],
        blur: [{ blur: ct() }],
        brightness: [{ brightness: [P, k, _] }],
        contrast: [{ contrast: [P, k, _] }],
        'drop-shadow': [{ 'drop-shadow': ['', 'none', f, xt, vt] }],
        'drop-shadow-color': [{ 'drop-shadow': C() }],
        grayscale: [{ grayscale: ['', P, k, _] }],
        'hue-rotate': [{ 'hue-rotate': [P, k, _] }],
        invert: [{ invert: ['', P, k, _] }],
        saturate: [{ saturate: [P, k, _] }],
        sepia: [{ sepia: ['', P, k, _] }],
        'backdrop-filter': [{ 'backdrop-filter': ['', 'none', k, _] }],
        'backdrop-blur': [{ 'backdrop-blur': ct() }],
        'backdrop-brightness': [{ 'backdrop-brightness': [P, k, _] }],
        'backdrop-contrast': [{ 'backdrop-contrast': [P, k, _] }],
        'backdrop-grayscale': [{ 'backdrop-grayscale': ['', P, k, _] }],
        'backdrop-hue-rotate': [{ 'backdrop-hue-rotate': [P, k, _] }],
        'backdrop-invert': [{ 'backdrop-invert': ['', P, k, _] }],
        'backdrop-opacity': [{ 'backdrop-opacity': [P, k, _] }],
        'backdrop-saturate': [{ 'backdrop-saturate': [P, k, _] }],
        'backdrop-sepia': [{ 'backdrop-sepia': ['', P, k, _] }],
        'border-collapse': [{ border: ['collapse', 'separate'] }],
        'border-spacing': [{ 'border-spacing': S() }],
        'border-spacing-x': [{ 'border-spacing-x': S() }],
        'border-spacing-y': [{ 'border-spacing-y': S() }],
        'table-layout': [{ table: ['auto', 'fixed'] }],
        caption: [{ caption: ['top', 'bottom'] }],
        transition: [
          {
            transition: [
              '',
              'all',
              'colors',
              'opacity',
              'shadow',
              'transform',
              'none',
              k,
              _,
            ],
          },
        ],
        'transition-behavior': [{ transition: ['normal', 'discrete'] }],
        duration: [{ duration: [P, 'initial', k, _] }],
        ease: [{ ease: ['linear', 'initial', x, k, _] }],
        delay: [{ delay: [P, k, _] }],
        animate: [{ animate: ['none', b, k, _] }],
        backface: [{ backface: ['hidden', 'visible'] }],
        perspective: [{ perspective: [m, k, _] }],
        'perspective-origin': [{ 'perspective-origin': A() }],
        rotate: [{ rotate: W() }],
        'rotate-x': [{ 'rotate-x': W() }],
        'rotate-y': [{ 'rotate-y': W() }],
        'rotate-z': [{ 'rotate-z': W() }],
        scale: [{ scale: dt() }],
        'scale-x': [{ 'scale-x': dt() }],
        'scale-y': [{ 'scale-y': dt() }],
        'scale-z': [{ 'scale-z': dt() }],
        'scale-3d': ['scale-3d'],
        skew: [{ skew: Rt() }],
        'skew-x': [{ 'skew-x': Rt() }],
        'skew-y': [{ 'skew-y': Rt() }],
        transform: [{ transform: [k, _, '', 'none', 'gpu', 'cpu'] }],
        'transform-origin': [{ origin: A() }],
        'transform-style': [{ transform: ['3d', 'flat'] }],
        translate: [{ translate: ut() }],
        'translate-x': [{ 'translate-x': ut() }],
        'translate-y': [{ 'translate-y': ut() }],
        'translate-z': [{ 'translate-z': ut() }],
        'translate-none': ['translate-none'],
        accent: [{ accent: C() }],
        appearance: [{ appearance: ['none', 'auto'] }],
        'caret-color': [{ caret: C() }],
        'color-scheme': [
          {
            scheme: [
              'normal',
              'dark',
              'light',
              'light-dark',
              'only-dark',
              'only-light',
            ],
          },
        ],
        cursor: [
          {
            cursor: [
              'auto',
              'default',
              'pointer',
              'wait',
              'text',
              'move',
              'help',
              'not-allowed',
              'none',
              'context-menu',
              'progress',
              'cell',
              'crosshair',
              'vertical-text',
              'alias',
              'copy',
              'no-drop',
              'grab',
              'grabbing',
              'all-scroll',
              'col-resize',
              'row-resize',
              'n-resize',
              'e-resize',
              's-resize',
              'w-resize',
              'ne-resize',
              'nw-resize',
              'se-resize',
              'sw-resize',
              'ew-resize',
              'ns-resize',
              'nesw-resize',
              'nwse-resize',
              'zoom-in',
              'zoom-out',
              k,
              _,
            ],
          },
        ],
        'field-sizing': [{ 'field-sizing': ['fixed', 'content'] }],
        'pointer-events': [{ 'pointer-events': ['auto', 'none'] }],
        resize: [{ resize: ['none', '', 'y', 'x'] }],
        'scroll-behavior': [{ scroll: ['auto', 'smooth'] }],
        'scroll-m': [{ 'scroll-m': S() }],
        'scroll-mx': [{ 'scroll-mx': S() }],
        'scroll-my': [{ 'scroll-my': S() }],
        'scroll-ms': [{ 'scroll-ms': S() }],
        'scroll-me': [{ 'scroll-me': S() }],
        'scroll-mt': [{ 'scroll-mt': S() }],
        'scroll-mr': [{ 'scroll-mr': S() }],
        'scroll-mb': [{ 'scroll-mb': S() }],
        'scroll-ml': [{ 'scroll-ml': S() }],
        'scroll-p': [{ 'scroll-p': S() }],
        'scroll-px': [{ 'scroll-px': S() }],
        'scroll-py': [{ 'scroll-py': S() }],
        'scroll-ps': [{ 'scroll-ps': S() }],
        'scroll-pe': [{ 'scroll-pe': S() }],
        'scroll-pt': [{ 'scroll-pt': S() }],
        'scroll-pr': [{ 'scroll-pr': S() }],
        'scroll-pb': [{ 'scroll-pb': S() }],
        'scroll-pl': [{ 'scroll-pl': S() }],
        'snap-align': [{ snap: ['start', 'end', 'center', 'align-none'] }],
        'snap-stop': [{ snap: ['normal', 'always'] }],
        'snap-type': [{ snap: ['none', 'x', 'y', 'both'] }],
        'snap-strictness': [{ snap: ['mandatory', 'proximity'] }],
        touch: [{ touch: ['auto', 'none', 'manipulation'] }],
        'touch-x': [{ 'touch-pan': ['x', 'left', 'right'] }],
        'touch-y': [{ 'touch-pan': ['y', 'up', 'down'] }],
        'touch-pz': ['touch-pinch-zoom'],
        select: [{ select: ['none', 'text', 'all', 'auto'] }],
        'will-change': [
          { 'will-change': ['auto', 'scroll', 'contents', 'transform', k, _] },
        ],
        fill: [{ fill: ['none', ...C()] }],
        'stroke-w': [{ stroke: [P, Ve, ge, Xt] }],
        stroke: [{ stroke: ['none', ...C()] }],
        'forced-color-adjust': [{ 'forced-color-adjust': ['auto', 'none'] }],
      },
      conflictingClassGroups: {
        overflow: ['overflow-x', 'overflow-y'],
        overscroll: ['overscroll-x', 'overscroll-y'],
        inset: [
          'inset-x',
          'inset-y',
          'start',
          'end',
          'top',
          'right',
          'bottom',
          'left',
        ],
        'inset-x': ['right', 'left'],
        'inset-y': ['top', 'bottom'],
        flex: ['basis', 'grow', 'shrink'],
        gap: ['gap-x', 'gap-y'],
        p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
        px: ['pr', 'pl'],
        py: ['pt', 'pb'],
        m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
        mx: ['mr', 'ml'],
        my: ['mt', 'mb'],
        size: ['w', 'h'],
        'font-size': ['leading'],
        'fvn-normal': [
          'fvn-ordinal',
          'fvn-slashed-zero',
          'fvn-figure',
          'fvn-spacing',
          'fvn-fraction',
        ],
        'fvn-ordinal': ['fvn-normal'],
        'fvn-slashed-zero': ['fvn-normal'],
        'fvn-figure': ['fvn-normal'],
        'fvn-spacing': ['fvn-normal'],
        'fvn-fraction': ['fvn-normal'],
        'line-clamp': ['display', 'overflow'],
        rounded: [
          'rounded-s',
          'rounded-e',
          'rounded-t',
          'rounded-r',
          'rounded-b',
          'rounded-l',
          'rounded-ss',
          'rounded-se',
          'rounded-ee',
          'rounded-es',
          'rounded-tl',
          'rounded-tr',
          'rounded-br',
          'rounded-bl',
        ],
        'rounded-s': ['rounded-ss', 'rounded-es'],
        'rounded-e': ['rounded-se', 'rounded-ee'],
        'rounded-t': ['rounded-tl', 'rounded-tr'],
        'rounded-r': ['rounded-tr', 'rounded-br'],
        'rounded-b': ['rounded-br', 'rounded-bl'],
        'rounded-l': ['rounded-tl', 'rounded-bl'],
        'border-spacing': ['border-spacing-x', 'border-spacing-y'],
        'border-w': [
          'border-w-x',
          'border-w-y',
          'border-w-s',
          'border-w-e',
          'border-w-t',
          'border-w-r',
          'border-w-b',
          'border-w-l',
        ],
        'border-w-x': ['border-w-r', 'border-w-l'],
        'border-w-y': ['border-w-t', 'border-w-b'],
        'border-color': [
          'border-color-x',
          'border-color-y',
          'border-color-s',
          'border-color-e',
          'border-color-t',
          'border-color-r',
          'border-color-b',
          'border-color-l',
        ],
        'border-color-x': ['border-color-r', 'border-color-l'],
        'border-color-y': ['border-color-t', 'border-color-b'],
        translate: ['translate-x', 'translate-y', 'translate-none'],
        'translate-none': [
          'translate',
          'translate-x',
          'translate-y',
          'translate-z',
        ],
        'scroll-m': [
          'scroll-mx',
          'scroll-my',
          'scroll-ms',
          'scroll-me',
          'scroll-mt',
          'scroll-mr',
          'scroll-mb',
          'scroll-ml',
        ],
        'scroll-mx': ['scroll-mr', 'scroll-ml'],
        'scroll-my': ['scroll-mt', 'scroll-mb'],
        'scroll-p': [
          'scroll-px',
          'scroll-py',
          'scroll-ps',
          'scroll-pe',
          'scroll-pt',
          'scroll-pr',
          'scroll-pb',
          'scroll-pl',
        ],
        'scroll-px': ['scroll-pr', 'scroll-pl'],
        'scroll-py': ['scroll-pt', 'scroll-pb'],
        touch: ['touch-x', 'touch-y', 'touch-pz'],
        'touch-x': ['touch'],
        'touch-y': ['touch'],
        'touch-pz': ['touch'],
      },
      conflictingClassGroupModifiers: { 'font-size': ['leading'] },
      orderSensitiveModifiers: [
        '*',
        '**',
        'after',
        'backdrop',
        'before',
        'details-content',
        'file',
        'first-letter',
        'first-line',
        'marker',
        'placeholder',
        'selection',
      ],
    }
  },
  lc = (
    r,
    {
      cacheSize: e,
      prefix: t,
      experimentalParseClassName: s,
      extend: n = {},
      override: i = {},
    }
  ) => (
    Je(r, 'cacheSize', e),
    Je(r, 'prefix', t),
    Je(r, 'experimentalParseClassName', s),
    wt(r.theme, i.theme),
    wt(r.classGroups, i.classGroups),
    wt(r.conflictingClassGroups, i.conflictingClassGroups),
    wt(r.conflictingClassGroupModifiers, i.conflictingClassGroupModifiers),
    Je(r, 'orderSensitiveModifiers', i.orderSensitiveModifiers),
    _t(r.theme, n.theme),
    _t(r.classGroups, n.classGroups),
    _t(r.conflictingClassGroups, n.conflictingClassGroups),
    _t(r.conflictingClassGroupModifiers, n.conflictingClassGroupModifiers),
    gn(r, n, 'orderSensitiveModifiers'),
    r
  ),
  Je = (r, e, t) => {
    t !== void 0 && (r[e] = t)
  },
  wt = (r, e) => {
    if (e) for (const t in e) Je(r, t, e[t])
  },
  _t = (r, e) => {
    if (e) for (const t in e) gn(r, e, t)
  },
  gn = (r, e, t) => {
    const s = e[t]
    s !== void 0 && (r[t] = r[t] ? r[t].concat(s) : s)
  },
  Vc = (r, ...e) =>
    typeof r == 'function' ? vs(xs, r, ...e) : vs(() => lc(xs(), r), ...e),
  cc = vs(xs)
function be(...r) {
  return cc(qn(r))
}
const dc = [
    {
      label: 'Critico/Scaduto',
      color: 'bg-red-900 border-red-800',
      icon: '🔴',
      description: 'Richiede azione immediata',
    },
    {
      label: 'Alta Priorità',
      color: 'bg-red-50 border-red-500',
      icon: '🟠',
      description: 'Importante, da completare presto',
    },
    {
      label: 'Media Priorità',
      color: 'bg-amber-50 border-amber-500',
      icon: '🟡',
      description: 'Normale',
    },
    {
      label: 'Bassa Priorità',
      color: 'bg-green-50 border-green-500',
      icon: '🔵',
      description: 'Non urgente',
    },
    {
      label: 'Completato',
      color: 'bg-green-100 border-green-500',
      icon: '🟢',
      description: 'Attività completata',
    },
  ],
  uc = [
    {
      label: 'Manutenzione',
      color: 'bg-yellow-100 border-yellow-500',
      icon: '🔧',
    },
    {
      label: 'Mansione Generale',
      color: 'bg-blue-100 border-blue-500',
      icon: '📋',
    },
    {
      label: 'Controllo Temperatura',
      color: 'bg-green-100 border-green-500',
      icon: '🌡️',
    },
    {
      label: 'Scadenza HACCP',
      color: 'bg-purple-100 border-purple-500',
      icon: '📜',
    },
    {
      label: 'Scadenza Prodotto',
      color: 'bg-orange-100 border-orange-500',
      icon: '📦',
    },
  ]
function hc({
  showPriority: r = !0,
  showEventType: e = !0,
  customItems: t,
  defaultExpanded: s = !1,
  className: n,
}) {
  const [i, a] = E.useState(s),
    l = c =>
      o.jsx('div', {
        className: 'grid grid-cols-1 sm:grid-cols-2 gap-2',
        children: c.map((d, u) =>
          o.jsxs(
            'div',
            {
              className: 'flex items-center gap-2',
              children: [
                o.jsx('div', {
                  className: be(
                    'h-4 w-4 rounded border-2 flex-shrink-0',
                    d.color
                  ),
                }),
                o.jsxs('div', {
                  className: 'flex-1 min-w-0',
                  children: [
                    o.jsxs('div', {
                      className: 'flex items-center gap-1',
                      children: [
                        d.icon &&
                          o.jsx('span', {
                            className: 'text-sm',
                            children: d.icon,
                          }),
                        o.jsx('span', {
                          className:
                            'text-sm font-medium text-gray-700 truncate',
                          children: d.label,
                        }),
                      ],
                    }),
                    d.description &&
                      o.jsx('p', {
                        className: 'text-xs text-gray-500 truncate',
                        children: d.description,
                      }),
                  ],
                }),
              ],
            },
            u
          )
        ),
      })
  return o.jsxs('div', {
    className: be('bg-white rounded-lg border border-gray-200 shadow-sm', n),
    children: [
      o.jsxs('button', {
        onClick: () => a(!i),
        className:
          'w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg',
        children: [
          o.jsx('h3', {
            className: 'text-sm font-semibold text-gray-900',
            children: 'Legenda Eventi',
          }),
          i
            ? o.jsx(Oe, { className: 'h-4 w-4 text-gray-500' })
            : o.jsx(Re, { className: 'h-4 w-4 text-gray-500' }),
        ],
      }),
      i &&
        o.jsxs('div', {
          className: 'px-4 pb-4 space-y-4',
          children: [
            t &&
              o.jsxs('div', {
                children: [
                  o.jsx('h4', {
                    className:
                      'text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide',
                    children: 'Personalizzato',
                  }),
                  l(t),
                ],
              }),
            r &&
              o.jsxs('div', {
                children: [
                  o.jsx('h4', {
                    className:
                      'text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide',
                    children: 'Priorità',
                  }),
                  l(dc),
                ],
              }),
            e &&
              o.jsxs('div', {
                children: [
                  o.jsx('h4', {
                    className:
                      'text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide',
                    children: 'Tipo Evento',
                  }),
                  l(uc),
                ],
              }),
          ],
        }),
    ],
  })
}
const pn = 'calendar-filters',
  yr = [
    { value: 'maintenance', label: 'Manutenzioni', icon: '🔧' },
    { value: 'general_task', label: 'Mansioni Generali', icon: '📋' },
    {
      value: 'temperature_reading',
      label: 'Controlli Temperatura',
      icon: '🌡️',
    },
    { value: 'custom', label: 'Eventi Personalizzati', icon: '📅' },
  ],
  br = [
    { value: 'critical', label: 'Critico', color: 'text-red-700' },
    { value: 'high', label: 'Alta', color: 'text-orange-600' },
    { value: 'medium', label: 'Media', color: 'text-yellow-600' },
    { value: 'low', label: 'Bassa', color: 'text-blue-600' },
  ],
  vr = [
    { value: 'pending', label: 'In Attesa', icon: '⏳' },
    { value: 'completed', label: 'Completato', icon: '✅' },
    { value: 'overdue', label: 'Scaduto', icon: '⚠️' },
    { value: 'cancelled', label: 'Annullato', icon: '❌' },
  ]
function fc() {
  try {
    const r = localStorage.getItem(pn)
    return r ? JSON.parse(r) : {}
  } catch {
    return {}
  }
}
function mc(r) {
  try {
    localStorage.setItem(pn, JSON.stringify(r))
  } catch (e) {
    console.error('Failed to save filters:', e)
  }
}
function gc({ onFilterChange: r, initialFilters: e, className: t }) {
  const [s, n] = E.useState(!1),
    [i, a] = E.useState({ eventTypes: !0, priorities: !0, statuses: !0 }),
    l = fc(),
    c = {
      eventTypes: e?.eventTypes ||
        l.eventTypes || [
          'maintenance',
          'general_task',
          'temperature_reading',
          'custom',
        ],
      priorities: e?.priorities ||
        l.priorities || ['critical', 'high', 'medium', 'low'],
      statuses: e?.statuses || l.statuses || ['pending', 'overdue'],
    },
    [d, u] = E.useState(c)
  E.useEffect(() => {
    ;(r(d), mc(d))
  }, [d, r])
  const h = x => {
      a(b => ({ ...b, [x]: !b[x] }))
    },
    p = x => {
      u(b => ({
        ...b,
        eventTypes: b.eventTypes.includes(x)
          ? b.eventTypes.filter(w => w !== x)
          : [...b.eventTypes, x],
      }))
    },
    f = x => {
      u(b => ({
        ...b,
        priorities: b.priorities.includes(x)
          ? b.priorities.filter(w => w !== x)
          : [...b.priorities, x],
      }))
    },
    g = x => {
      u(b => ({
        ...b,
        statuses: b.statuses.includes(x)
          ? b.statuses.filter(w => w !== x)
          : [...b.statuses, x],
      }))
    },
    m = () => {
      u({
        eventTypes: [
          'maintenance',
          'general_task',
          'temperature_reading',
          'custom',
        ],
        priorities: ['critical', 'high', 'medium', 'low'],
        statuses: ['pending', 'overdue'],
      })
    },
    y =
      yr.length -
      d.eventTypes.length +
      (br.length - d.priorities.length) +
      (vr.length - d.statuses.length)
  return o.jsxs('div', {
    className: be('bg-white rounded-lg border border-gray-200 shadow-sm', t),
    children: [
      o.jsxs('button', {
        onClick: () => n(!s),
        className:
          'w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg',
        children: [
          o.jsxs('div', {
            className: 'flex items-center gap-2',
            children: [
              o.jsx(_s, { className: 'h-4 w-4 text-gray-500' }),
              o.jsx('h3', {
                className: 'text-sm font-semibold text-gray-900',
                children: 'Filtri',
              }),
              y > 0 &&
                o.jsx('span', {
                  className:
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
                  children: y,
                }),
            ],
          }),
          s
            ? o.jsx(Oe, { className: 'h-4 w-4 text-gray-500' })
            : o.jsx(Re, { className: 'h-4 w-4 text-gray-500' }),
        ],
      }),
      s &&
        o.jsxs('div', {
          className: 'px-4 pb-4 space-y-4',
          children: [
            o.jsx('div', {
              className: 'flex justify-end',
              children: o.jsxs('button', {
                onClick: m,
                className:
                  'text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1',
                children: [o.jsx(et, { className: 'h-3 w-3' }), 'Reset'],
              }),
            }),
            o.jsxs('div', {
              className: 'space-y-3',
              children: [
                o.jsxs('div', {
                  className: 'border-b pb-2',
                  children: [
                    o.jsxs('button', {
                      onClick: () => h('eventTypes'),
                      className:
                        'w-full flex items-center justify-between text-left',
                      children: [
                        o.jsx('span', {
                          className:
                            'text-xs font-semibold text-gray-700 uppercase tracking-wide',
                          children: 'Tipo Evento',
                        }),
                        i.eventTypes
                          ? o.jsx(Oe, { className: 'h-3 w-3 text-gray-400' })
                          : o.jsx(Re, { className: 'h-3 w-3 text-gray-400' }),
                      ],
                    }),
                    i.eventTypes &&
                      o.jsx('div', {
                        className: 'mt-2 space-y-2',
                        children: yr.map(x =>
                          o.jsxs(
                            'label',
                            {
                              className:
                                'flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded',
                              children: [
                                o.jsx('input', {
                                  type: 'checkbox',
                                  checked: d.eventTypes.includes(x.value),
                                  onChange: () => p(x.value),
                                  className:
                                    'rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                                }),
                                o.jsx('span', {
                                  className: 'text-sm',
                                  children: x.icon,
                                }),
                                o.jsx('span', {
                                  className: 'text-sm text-gray-700',
                                  children: x.label,
                                }),
                              ],
                            },
                            x.value
                          )
                        ),
                      }),
                  ],
                }),
                o.jsxs('div', {
                  className: 'border-b pb-2',
                  children: [
                    o.jsxs('button', {
                      onClick: () => h('priorities'),
                      className:
                        'w-full flex items-center justify-between text-left',
                      children: [
                        o.jsx('span', {
                          className:
                            'text-xs font-semibold text-gray-700 uppercase tracking-wide',
                          children: 'Priorità',
                        }),
                        i.priorities
                          ? o.jsx(Oe, { className: 'h-3 w-3 text-gray-400' })
                          : o.jsx(Re, { className: 'h-3 w-3 text-gray-400' }),
                      ],
                    }),
                    i.priorities &&
                      o.jsx('div', {
                        className: 'mt-2 space-y-2',
                        children: br.map(x =>
                          o.jsxs(
                            'label',
                            {
                              className:
                                'flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded',
                              children: [
                                o.jsx('input', {
                                  type: 'checkbox',
                                  checked: d.priorities.includes(x.value),
                                  onChange: () => f(x.value),
                                  className:
                                    'rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                                }),
                                o.jsx('span', {
                                  className: be('text-sm font-medium', x.color),
                                  children: x.label,
                                }),
                              ],
                            },
                            x.value
                          )
                        ),
                      }),
                  ],
                }),
                o.jsxs('div', {
                  children: [
                    o.jsxs('button', {
                      onClick: () => h('statuses'),
                      className:
                        'w-full flex items-center justify-between text-left',
                      children: [
                        o.jsx('span', {
                          className:
                            'text-xs font-semibold text-gray-700 uppercase tracking-wide',
                          children: 'Stato',
                        }),
                        i.statuses
                          ? o.jsx(Oe, { className: 'h-3 w-3 text-gray-400' })
                          : o.jsx(Re, { className: 'h-3 w-3 text-gray-400' }),
                      ],
                    }),
                    i.statuses &&
                      o.jsx('div', {
                        className: 'mt-2 space-y-2',
                        children: vr.map(x =>
                          o.jsxs(
                            'label',
                            {
                              className:
                                'flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded',
                              children: [
                                o.jsx('input', {
                                  type: 'checkbox',
                                  checked: d.statuses.includes(x.value),
                                  onChange: () => g(x.value),
                                  className:
                                    'rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                                }),
                                o.jsx('span', {
                                  className: 'text-sm',
                                  children: x.icon,
                                }),
                                o.jsx('span', {
                                  className: 'text-sm text-gray-700',
                                  children: x.label,
                                }),
                              ],
                            },
                            x.value
                          )
                        ),
                      }),
                  ],
                }),
              ],
            }),
          ],
        }),
    ],
  })
}
const pc = 'calendar-view-preference',
  yc = [
    { value: 'month', label: 'Mese', icon: Fe },
    { value: 'week', label: 'Settimana', icon: Bn },
    { value: 'day', label: 'Giorno', icon: Hn },
  ],
  bc = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5',
  },
  vc = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' }
function yn(r) {
  try {
    localStorage.setItem(pc, r)
  } catch (e) {
    console.error('Failed to save view preference:', e)
  }
}
function xc({ currentView: r, onChange: e, className: t, size: s = 'md' }) {
  const n = i => {
    ;(e(i), yn(i))
  }
  return o.jsx('div', {
    className: be(
      'inline-flex items-center bg-white rounded-lg border border-gray-200 shadow-sm',
      t
    ),
    role: 'group',
    'aria-label': 'Vista calendario',
    children: yc.map(i => {
      const a = i.icon,
        l = r === i.value
      return o.jsxs(
        'button',
        {
          onClick: () => n(i.value),
          className: be(
            'inline-flex items-center gap-2 font-medium transition-all border-r border-gray-200 last:border-r-0 first:rounded-l-lg last:rounded-r-lg',
            bc[s],
            l
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          ),
          'aria-pressed': l,
          'aria-label': `Vista ${i.label}`,
          children: [
            o.jsx(a, { className: be(vc[s]) }),
            o.jsx('span', { className: 'hidden sm:inline', children: i.label }),
          ],
        },
        i.value
      )
    }),
  })
}
function wc(r) {
  const [e, t] = E.useState(r)
  return (
    E.useEffect(() => {
      yn(e)
    }, [e]),
    [e, t]
  )
}
const xr = () => {
    const { events: r, isLoading: e, sources: t } = il(),
      { filteredEvents: s } = cl(r),
      { alertCount: n, criticalCount: i } = sn(s),
      [a, l] = wc('month'),
      [c, d] = E.useState({
        eventTypes: [
          'maintenance',
          'general_task',
          'temperature_reading',
          'custom',
        ],
        priorities: ['critical', 'high', 'medium', 'low'],
        statuses: ['pending', 'overdue'],
      }),
      u = E.useMemo(
        () =>
          s.filter(
            v =>
              c.eventTypes.includes(v.type) &&
              c.priorities.includes(v.priority) &&
              c.statuses.includes(v.status)
          ),
        [s, c]
      ),
      h = E.useMemo(() => {
        const v = new Date()
        v.setHours(0, 0, 0, 0)
        const A = new Date(v)
        return (
          A.setDate(A.getDate() + 1),
          u.filter(j => j.start >= v && j.start < A)
        )
      }, [u]),
      p = E.useMemo(() => {
        const v = new Date(),
          A = new Date(v.getTime() + 7 * 24 * 60 * 60 * 1e3)
        return u.filter(
          j => j.start >= v && j.start <= A && j.status === 'pending'
        )
      }, [u]),
      f = E.useMemo(() => u.filter(v => v.status === 'overdue'), [u]),
      g = v => {
        console.log('Event clicked:', v)
      },
      m = v => {
        console.log('Event updated:', v)
      },
      y = v => {
        console.log('Event deleted:', v)
      },
      x = (v, A) => {
        console.log('Date selected:', v, A)
      },
      b = v => {
        console.log('Create event:', v)
      },
      w = v => {
        b({
          title: v.title || 'Nuovo Evento',
          start: v.start,
          end: v.end,
          allDay: v.allDay || !1,
          type: v.type || 'custom',
          priority: v.priority || 'medium',
          assigned_to: v.assigned_to || [],
          department_id: v.department_id,
          conservation_point_id: v.conservation_point_id,
          description: v.description,
          metadata: v.metadata || {},
        })
      }
    return o.jsxs('div', {
      className: 'min-h-screen bg-gray-50',
      children: [
        o.jsx('div', {
          className: 'bg-white border-b border-gray-200',
          children: o.jsx('div', {
            className: 'px-4 py-6',
            children: o.jsxs('div', {
              className: 'flex items-center justify-between',
              children: [
                o.jsxs('div', {
                  className: 'flex items-center space-x-3',
                  children: [
                    o.jsx('div', {
                      className: 'p-2 bg-blue-100 rounded-lg',
                      children: o.jsx(Lt, {
                        className: 'h-6 w-6 text-blue-600',
                      }),
                    }),
                    o.jsxs('div', {
                      children: [
                        o.jsx('h1', {
                          className: 'text-2xl font-bold text-gray-900',
                          children: 'Attività e Mansioni',
                        }),
                        o.jsx('p', {
                          className: 'text-sm text-gray-600',
                          children:
                            'Calendario unificato per mansioni, manutenzioni e controlli',
                        }),
                      ],
                    }),
                  ],
                }),
                o.jsxs('div', {
                  className: 'flex items-center gap-4',
                  children: [
                    n > 0 &&
                      o.jsx('div', {
                        className:
                          'flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg',
                        children: o.jsxs('span', {
                          className: 'text-sm font-medium text-red-700',
                          children: [i > 0 ? '🔴' : '⚠️', ' ', n, ' Alert'],
                        }),
                      }),
                    o.jsx(xc, { currentView: a, onChange: l }),
                  ],
                }),
              ],
            }),
          }),
        }),
        o.jsxs('div', {
          className: 'px-4 py-6',
          children: [
            o.jsx('div', {
              className: 'mb-6',
              children: o.jsx(ul, {
                title: 'Statistiche',
                icon: Gn,
                counter: u.length,
                className: 'mb-4',
                defaultExpanded: !0,
                children: o.jsxs('div', {
                  className: 'p-4',
                  children: [
                    o.jsxs('div', {
                      className: 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-6',
                      children: [
                        o.jsxs('div', {
                          className: 'text-center',
                          children: [
                            o.jsx('div', {
                              className: 'text-2xl font-bold text-gray-900',
                              children: u.length,
                            }),
                            o.jsx('div', {
                              className: 'text-sm text-gray-500',
                              children: 'Eventi Totali',
                            }),
                          ],
                        }),
                        o.jsxs('div', {
                          className: 'text-center',
                          children: [
                            o.jsx('div', {
                              className: 'text-2xl font-bold text-green-600',
                              children: u.filter(v => v.status === 'completed')
                                .length,
                            }),
                            o.jsx('div', {
                              className: 'text-sm text-gray-500',
                              children: 'Completati',
                            }),
                          ],
                        }),
                        o.jsxs('div', {
                          className: 'text-center',
                          children: [
                            o.jsx('div', {
                              className: 'text-2xl font-bold text-yellow-600',
                              children: u.filter(v => v.status === 'pending')
                                .length,
                            }),
                            o.jsx('div', {
                              className: 'text-sm text-gray-500',
                              children: 'In Attesa',
                            }),
                          ],
                        }),
                        o.jsxs('div', {
                          className: 'text-center',
                          children: [
                            o.jsx('div', {
                              className: 'text-2xl font-bold text-red-600',
                              children: f.length,
                            }),
                            o.jsx('div', {
                              className: 'text-sm text-gray-500',
                              children: 'In Ritardo',
                            }),
                          ],
                        }),
                      ],
                    }),
                    o.jsxs('div', {
                      className: 'mb-6',
                      children: [
                        o.jsxs('div', {
                          className: 'flex items-center justify-between mb-2',
                          children: [
                            o.jsx('span', {
                              className: 'text-sm font-medium text-gray-700',
                              children: 'Tasso di Completamento',
                            }),
                            o.jsxs('span', {
                              className: 'text-sm text-gray-600',
                              children: [
                                u.length > 0
                                  ? (
                                      (u.filter(v => v.status === 'completed')
                                        .length /
                                        u.length) *
                                      100
                                    ).toFixed(1)
                                  : '0.0',
                                '%',
                              ],
                            }),
                          ],
                        }),
                        o.jsx('div', {
                          className: 'w-full bg-gray-200 rounded-full h-2',
                          children: o.jsx('div', {
                            className:
                              'bg-green-500 h-2 rounded-full transition-all duration-300',
                            style: {
                              width: `${u.length > 0 ? Math.min((u.filter(v => v.status === 'completed').length / u.length) * 100, 100) : 0}%`,
                            },
                          }),
                        }),
                      ],
                    }),
                    o.jsxs('div', {
                      className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                      children: [
                        o.jsxs('div', {
                          children: [
                            o.jsx('h4', {
                              className:
                                'text-sm font-medium text-gray-700 mb-3',
                              children: 'Per Tipologia',
                            }),
                            o.jsxs('div', {
                              className: 'space-y-2',
                              children: [
                                o.jsxs('div', {
                                  className:
                                    'flex items-center justify-between text-sm',
                                  children: [
                                    o.jsx('span', {
                                      className: 'text-gray-600',
                                      children: '🔧 Manutenzioni',
                                    }),
                                    o.jsx('span', {
                                      className: 'font-medium',
                                      children: t?.maintenance || 0,
                                    }),
                                  ],
                                }),
                                o.jsxs('div', {
                                  className:
                                    'flex items-center justify-between text-sm',
                                  children: [
                                    o.jsx('span', {
                                      className: 'text-gray-600',
                                      children: '👥 Scadenze HACCP',
                                    }),
                                    o.jsx('span', {
                                      className: 'font-medium',
                                      children: t?.haccpExpiry || 0,
                                    }),
                                  ],
                                }),
                                o.jsxs('div', {
                                  className:
                                    'flex items-center justify-between text-sm',
                                  children: [
                                    o.jsx('span', {
                                      className: 'text-gray-600',
                                      children: '📦 Scadenze Prodotti',
                                    }),
                                    o.jsx('span', {
                                      className: 'font-medium',
                                      children: t?.productExpiry || 0,
                                    }),
                                  ],
                                }),
                                o.jsxs('div', {
                                  className:
                                    'flex items-center justify-between text-sm',
                                  children: [
                                    o.jsx('span', {
                                      className: 'text-gray-600',
                                      children: '⏰ Alert HACCP',
                                    }),
                                    o.jsx('span', {
                                      className: 'font-medium',
                                      children: t?.haccpDeadlines || 0,
                                    }),
                                  ],
                                }),
                                o.jsxs('div', {
                                  className:
                                    'flex items-center justify-between text-sm',
                                  children: [
                                    o.jsx('span', {
                                      className: 'text-gray-600',
                                      children: '🌡️ Controlli Temp',
                                    }),
                                    o.jsx('span', {
                                      className: 'font-medium',
                                      children: t?.temperatureChecks || 0,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        o.jsxs('div', {
                          children: [
                            o.jsx('h4', {
                              className:
                                'text-sm font-medium text-gray-700 mb-3',
                              children: 'Urgenti',
                            }),
                            o.jsxs('div', {
                              className: 'space-y-2',
                              children: [
                                o.jsxs('div', {
                                  className:
                                    'flex items-center text-sm text-red-600',
                                  children: [
                                    o.jsx(St, { className: 'h-4 w-4 mr-2' }),
                                    o.jsxs('span', {
                                      children: [
                                        f.length,
                                        ' eventi in ritardo',
                                      ],
                                    }),
                                  ],
                                }),
                                o.jsxs('div', {
                                  className:
                                    'flex items-center text-sm text-yellow-600',
                                  children: [
                                    o.jsx(Fe, { className: 'h-4 w-4 mr-2' }),
                                    o.jsxs('span', {
                                      children: [
                                        p.length,
                                        ' eventi prossimi (7 giorni)',
                                      ],
                                    }),
                                  ],
                                }),
                                o.jsxs('div', {
                                  className:
                                    'flex items-center text-sm text-blue-600',
                                  children: [
                                    o.jsx(Lt, { className: 'h-4 w-4 mr-2' }),
                                    o.jsxs('span', {
                                      children: [h.length, ' eventi oggi'],
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
              }),
            }),
            o.jsxs('div', {
              className: 'grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6',
              children: [
                o.jsxs('div', {
                  className: 'lg:col-span-1 space-y-4',
                  children: [
                    o.jsx(gc, { onFilterChange: d, initialFilters: c }),
                    o.jsx(hc, { defaultExpanded: !1 }),
                    o.jsxs('div', {
                      className: 'bg-white rounded-lg border p-4',
                      children: [
                        o.jsx('h3', {
                          className: 'text-sm font-semibold mb-2',
                          children: 'Fonti Eventi',
                        }),
                        o.jsxs('div', {
                          className: 'space-y-1 text-xs',
                          children: [
                            o.jsxs('div', {
                              children: [
                                '🔧 Manutenzioni: ',
                                t?.maintenance || 0,
                              ],
                            }),
                            o.jsxs('div', {
                              children: [
                                '📜 Scadenze HACCP: ',
                                t?.haccpExpiry || 0,
                              ],
                            }),
                            o.jsxs('div', {
                              children: [
                                '📦 Scadenze Prodotti: ',
                                t?.productExpiry || 0,
                              ],
                            }),
                            o.jsxs('div', {
                              children: [
                                '⏰ Alert HACCP: ',
                                t?.haccpDeadlines || 0,
                              ],
                            }),
                            o.jsxs('div', {
                              children: [
                                '🌡️ Controlli Temp: ',
                                t?.temperatureChecks || 0,
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                o.jsx('div', {
                  className: 'lg:col-span-3',
                  children: o.jsx(Al, {
                    events: u,
                    onEventClick: g,
                    onEventCreate: w,
                    onEventUpdate: m,
                    onEventDelete: y,
                    onDateSelect: x,
                    config: {
                      defaultView:
                        a === 'month'
                          ? 'dayGridMonth'
                          : a === 'week'
                            ? 'timeGridWeek'
                            : 'timeGridDay',
                      headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: '',
                      },
                    },
                    loading: e,
                    error: null,
                  }),
                }),
              ],
            }),
            o.jsxs('div', {
              className: 'grid grid-cols-1 md:grid-cols-3 gap-6',
              children: [
                o.jsxs('div', {
                  className:
                    'bg-white rounded-lg border border-gray-200 shadow-sm',
                  children: [
                    o.jsx('div', {
                      className: 'p-4 border-b border-gray-200',
                      children: o.jsxs('h3', {
                        className:
                          'text-lg font-semibold text-gray-900 flex items-center',
                        children: [
                          o.jsx(Fe, {
                            className: 'h-5 w-5 mr-2 text-blue-600',
                          }),
                          'Eventi di Oggi',
                        ],
                      }),
                    }),
                    o.jsx('div', {
                      className: 'p-4',
                      children:
                        h.length === 0
                          ? o.jsx('p', {
                              className:
                                'text-sm text-gray-500 text-center py-4',
                              children: 'Nessun evento programmato per oggi',
                            })
                          : o.jsxs('div', {
                              className: 'space-y-3',
                              children: [
                                h
                                  .slice(0, 3)
                                  .map(v =>
                                    o.jsxs(
                                      'div',
                                      {
                                        className:
                                          'flex items-center justify-between p-2 bg-gray-50 rounded-md',
                                        children: [
                                          o.jsxs('div', {
                                            children: [
                                              o.jsx('p', {
                                                className:
                                                  'text-sm font-medium text-gray-900',
                                                children: v.title,
                                              }),
                                              o.jsx('p', {
                                                className:
                                                  'text-xs text-gray-500',
                                                children:
                                                  v.start.toLocaleTimeString(
                                                    'it-IT',
                                                    {
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                    }
                                                  ),
                                              }),
                                            ],
                                          }),
                                          o.jsx('span', {
                                            className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${v.status === 'completed' ? 'bg-green-100 text-green-800' : v.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`,
                                            children:
                                              v.status === 'completed'
                                                ? '✅'
                                                : v.status === 'overdue'
                                                  ? '⚠️'
                                                  : '⏳',
                                          }),
                                        ],
                                      },
                                      v.id
                                    )
                                  ),
                                h.length > 3 &&
                                  o.jsxs('p', {
                                    className:
                                      'text-xs text-gray-500 text-center',
                                    children: [
                                      '+',
                                      h.length - 3,
                                      ' altri eventi',
                                    ],
                                  }),
                              ],
                            }),
                    }),
                  ],
                }),
                o.jsxs('div', {
                  className:
                    'bg-white rounded-lg border border-gray-200 shadow-sm',
                  children: [
                    o.jsx('div', {
                      className: 'p-4 border-b border-gray-200',
                      children: o.jsxs('h3', {
                        className:
                          'text-lg font-semibold text-gray-900 flex items-center',
                        children: [
                          o.jsx(St, { className: 'h-5 w-5 mr-2 text-red-600' }),
                          'Eventi in Ritardo',
                        ],
                      }),
                    }),
                    o.jsx('div', {
                      className: 'p-4',
                      children:
                        f.length === 0
                          ? o.jsx('p', {
                              className:
                                'text-sm text-green-600 text-center py-4',
                              children: '✅ Nessun evento in ritardo',
                            })
                          : o.jsxs('div', {
                              className: 'space-y-3',
                              children: [
                                f
                                  .slice(0, 3)
                                  .map(v =>
                                    o.jsxs(
                                      'div',
                                      {
                                        className:
                                          'flex items-center justify-between p-2 bg-red-50 rounded-md border border-red-200',
                                        children: [
                                          o.jsxs('div', {
                                            children: [
                                              o.jsx('p', {
                                                className:
                                                  'text-sm font-medium text-gray-900',
                                                children: v.title,
                                              }),
                                              o.jsxs('p', {
                                                className:
                                                  'text-xs text-red-600',
                                                children: [
                                                  'Scaduto il',
                                                  ' ',
                                                  v.start.toLocaleDateString(
                                                    'it-IT',
                                                    {
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                    }
                                                  ),
                                                ],
                                              }),
                                            ],
                                          }),
                                          o.jsxs('span', {
                                            className:
                                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800',
                                            children: ['⚠️ ', v.priority],
                                          }),
                                        ],
                                      },
                                      v.id
                                    )
                                  ),
                                f.length > 3 &&
                                  o.jsxs('p', {
                                    className:
                                      'text-xs text-red-500 text-center',
                                    children: [
                                      '+',
                                      f.length - 3,
                                      ' altri eventi in ritardo',
                                    ],
                                  }),
                              ],
                            }),
                    }),
                  ],
                }),
                o.jsxs('div', {
                  className:
                    'bg-white rounded-lg border border-gray-200 shadow-sm',
                  children: [
                    o.jsx('div', {
                      className: 'p-4 border-b border-gray-200',
                      children: o.jsxs('h3', {
                        className:
                          'text-lg font-semibold text-gray-900 flex items-center',
                        children: [
                          o.jsx(Lt, {
                            className: 'h-5 w-5 mr-2 text-blue-600',
                          }),
                          'Prossimi Eventi',
                        ],
                      }),
                    }),
                    o.jsx('div', {
                      className: 'p-4',
                      children:
                        p.length === 0
                          ? o.jsx('p', {
                              className:
                                'text-sm text-gray-500 text-center py-4',
                              children: 'Nessun evento nei prossimi 7 giorni',
                            })
                          : o.jsxs('div', {
                              className: 'space-y-3',
                              children: [
                                p
                                  .slice(0, 3)
                                  .map(v =>
                                    o.jsxs(
                                      'div',
                                      {
                                        className:
                                          'flex items-center justify-between p-2 bg-blue-50 rounded-md',
                                        children: [
                                          o.jsxs('div', {
                                            children: [
                                              o.jsx('p', {
                                                className:
                                                  'text-sm font-medium text-gray-900',
                                                children: v.title,
                                              }),
                                              o.jsx('p', {
                                                className:
                                                  'text-xs text-blue-600',
                                                children:
                                                  v.start.toLocaleDateString(
                                                    'it-IT',
                                                    {
                                                      weekday: 'short',
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                    }
                                                  ),
                                              }),
                                            ],
                                          }),
                                          o.jsx('span', {
                                            className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${v.priority === 'critical' ? 'bg-red-100 text-red-800' : v.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`,
                                            children:
                                              v.priority === 'critical'
                                                ? '🔴'
                                                : v.priority === 'high'
                                                  ? '🟠'
                                                  : '🔵',
                                          }),
                                        ],
                                      },
                                      v.id
                                    )
                                  ),
                                p.length > 3 &&
                                  o.jsxs('p', {
                                    className:
                                      'text-xs text-blue-500 text-center',
                                    children: [
                                      '+',
                                      p.length - 3,
                                      ' altri eventi programmati',
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
        }),
      ],
    })
  },
  Kc = Object.freeze(
    Object.defineProperty(
      { __proto__: null, CalendarPage: xr, default: xr },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  )
export {
  ul as C,
  bt as M,
  zo as S,
  zc as T,
  st as _,
  qo as a,
  Uc as b,
  rn as c,
  qc as d,
  Uo as e,
  Mo as f,
  Mc as g,
  Wc as h,
  il as i,
  cl as j,
  Fc as k,
  Gc as l,
  Hc as m,
  As as n,
  Bc as o,
  be as p,
  Vc as q,
  Kc as r,
  F as s,
  cc as t,
  xe as u,
}
