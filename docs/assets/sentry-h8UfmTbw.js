import { r as vu } from './react-vendor-Cttizgra.js'
const v = typeof __SENTRY_DEBUG__ > 'u' || __SENTRY_DEBUG__,
  $ = globalThis,
  ct = '10.15.0'
function mt() {
  return (mr($), $)
}
function mr(e) {
  const t = (e.__SENTRY__ = e.__SENTRY__ || {})
  return ((t.version = t.version || ct), (t[ct] = t[ct] || {}))
}
function ln(e, t, n = $) {
  const r = (n.__SENTRY__ = n.__SENTRY__ || {}),
    s = (r[ct] = r[ct] || {})
  return s[e] || (s[e] = t())
}
const Vo = ['debug', 'info', 'warn', 'error', 'log', 'assert', 'trace'],
  Tu = 'Sentry Logger ',
  Kn = {}
function Ze(e) {
  if (!('console' in $)) return e()
  const t = $.console,
    n = {},
    r = Object.keys(Kn)
  r.forEach(s => {
    const i = Kn[s]
    ;((n[s] = t[s]), (t[s] = i))
  })
  try {
    return e()
  } finally {
    r.forEach(s => {
      t[s] = n[s]
    })
  }
}
function Iu() {
  Is().enabled = !0
}
function wu() {
  Is().enabled = !1
}
function Yo() {
  return Is().enabled
}
function ku(...e) {
  Ts('log', ...e)
}
function Ru(...e) {
  Ts('warn', ...e)
}
function Cu(...e) {
  Ts('error', ...e)
}
function Ts(e, ...t) {
  v &&
    Yo() &&
    Ze(() => {
      $.console[e](`${Tu}[${e}]:`, ...t)
    })
}
function Is() {
  return v ? ln('loggerSettings', () => ({ enabled: !1 })) : { enabled: !1 }
}
const _ = {
    enable: Iu,
    disable: wu,
    isEnabled: Yo,
    log: ku,
    warn: Ru,
    error: Cu,
  },
  Xo = 50,
  ft = '?',
  _i = /\(error: (.*)\)/,
  yi = /captureMessage|captureException/
function Ko(...e) {
  const t = e.sort((n, r) => n[0] - r[0]).map(n => n[1])
  return (n, r = 0, s = 0) => {
    const i = [],
      o = n.split(`
`)
    for (let c = r; c < o.length; c++) {
      let a = o[c]
      a.length > 1024 && (a = a.slice(0, 1024))
      const u = _i.test(a) ? a.replace(_i, '$1') : a
      if (!u.match(/\S*Error: /)) {
        for (const l of t) {
          const d = l(u)
          if (d) {
            i.push(d)
            break
          }
        }
        if (i.length >= Xo + s) break
      }
    }
    return Mu(i.slice(s))
  }
}
function xu(e) {
  return Array.isArray(e) ? Ko(...e) : e
}
function Mu(e) {
  if (!e.length) return []
  const t = Array.from(e)
  return (
    /sentryWrapped/.test(kn(t).function || '') && t.pop(),
    t.reverse(),
    yi.test(kn(t).function || '') &&
      (t.pop(), yi.test(kn(t).function || '') && t.pop()),
    t
      .slice(0, Xo)
      .map(n => ({
        ...n,
        filename: n.filename || kn(t).filename,
        function: n.function || ft,
      }))
  )
}
function kn(e) {
  return e[e.length - 1] || {}
}
const Ar = '<anonymous>'
function ze(e) {
  try {
    return !e || typeof e != 'function' ? Ar : e.name || Ar
  } catch {
    return Ar
  }
}
function Si(e) {
  const t = e.exception
  if (t) {
    const n = []
    try {
      return (
        t.values.forEach(r => {
          r.stacktrace.frames && n.push(...r.stacktrace.frames)
        }),
        n
      )
    } catch {
      return
    }
  }
}
const Un = {},
  Ei = {}
function et(e, t) {
  ;((Un[e] = Un[e] || []), Un[e].push(t))
}
function tt(e, t) {
  if (!Ei[e]) {
    Ei[e] = !0
    try {
      t()
    } catch (n) {
      v && _.error(`Error while instrumenting ${e}`, n)
    }
  }
}
function Ie(e, t) {
  const n = e && Un[e]
  if (n)
    for (const r of n)
      try {
        r(t)
      } catch (s) {
        v &&
          _.error(
            `Error while triggering instrumentation handler.
Type: ${e}
Name: ${ze(r)}
Error:`,
            s
          )
      }
}
let Or = null
function Jo(e) {
  const t = 'error'
  ;(et(t, e), tt(t, Au))
}
function Au() {
  ;((Or = $.onerror),
    ($.onerror = function (e, t, n, r, s) {
      return (
        Ie('error', { column: r, error: s, line: n, msg: e, url: t }),
        Or ? Or.apply(this, arguments) : !1
      )
    }),
    ($.onerror.__SENTRY_INSTRUMENTED__ = !0))
}
let Nr = null
function Qo(e) {
  const t = 'unhandledrejection'
  ;(et(t, e), tt(t, Ou))
}
function Ou() {
  ;((Nr = $.onunhandledrejection),
    ($.onunhandledrejection = function (e) {
      return (Ie('unhandledrejection', e), Nr ? Nr.apply(this, arguments) : !0)
    }),
    ($.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0))
}
const Zo = Object.prototype.toString
function ws(e) {
  switch (Zo.call(e)) {
    case '[object Error]':
    case '[object Exception]':
    case '[object DOMException]':
    case '[object WebAssembly.Exception]':
      return !0
    default:
      return je(e, Error)
  }
}
function Bt(e, t) {
  return Zo.call(e) === `[object ${t}]`
}
function ea(e) {
  return Bt(e, 'ErrorEvent')
}
function bi(e) {
  return Bt(e, 'DOMError')
}
function Nu(e) {
  return Bt(e, 'DOMException')
}
function $e(e) {
  return Bt(e, 'String')
}
function gr(e) {
  return (
    typeof e == 'object' &&
    e !== null &&
    '__sentry_template_string__' in e &&
    '__sentry_template_values__' in e
  )
}
function Rt(e) {
  return e === null || gr(e) || (typeof e != 'object' && typeof e != 'function')
}
function tn(e) {
  return Bt(e, 'Object')
}
function _r(e) {
  return typeof Event < 'u' && je(e, Event)
}
function Lu(e) {
  return typeof Element < 'u' && je(e, Element)
}
function Du(e) {
  return Bt(e, 'RegExp')
}
function $t(e) {
  return !!(e?.then && typeof e.then == 'function')
}
function Pu(e) {
  return (
    tn(e) &&
    'nativeEvent' in e &&
    'preventDefault' in e &&
    'stopPropagation' in e
  )
}
function je(e, t) {
  try {
    return e instanceof t
  } catch {
    return !1
  }
}
function ta(e) {
  return !!(typeof e == 'object' && e !== null && (e.__isVue || e._isVue))
}
function na(e) {
  return typeof Request < 'u' && je(e, Request)
}
const ks = $,
  Fu = 80
function we(e, t = {}) {
  if (!e) return '<unknown>'
  try {
    let n = e
    const r = 5,
      s = []
    let i = 0,
      o = 0
    const c = ' > ',
      a = c.length
    let u
    const l = Array.isArray(t) ? t : t.keyAttrs,
      d = (!Array.isArray(t) && t.maxStringLength) || Fu
    for (
      ;
      n &&
      i++ < r &&
      ((u = Bu(n, l)),
      !(u === 'html' || (i > 1 && o + s.length * a + u.length >= d)));

    )
      (s.push(u), (o += u.length), (n = n.parentNode))
    return s.reverse().join(c)
  } catch {
    return '<unknown>'
  }
}
function Bu(e, t) {
  const n = e,
    r = []
  if (!n?.tagName) return ''
  if (ks.HTMLElement && n instanceof HTMLElement && n.dataset) {
    if (n.dataset.sentryComponent) return n.dataset.sentryComponent
    if (n.dataset.sentryElement) return n.dataset.sentryElement
  }
  r.push(n.tagName.toLowerCase())
  const s = t?.length
    ? t.filter(o => n.getAttribute(o)).map(o => [o, n.getAttribute(o)])
    : null
  if (s?.length)
    s.forEach(o => {
      r.push(`[${o[0]}="${o[1]}"]`)
    })
  else {
    n.id && r.push(`#${n.id}`)
    const o = n.className
    if (o && $e(o)) {
      const c = o.split(/\s+/)
      for (const a of c) r.push(`.${a}`)
    }
  }
  const i = ['aria-label', 'type', 'name', 'title', 'alt']
  for (const o of i) {
    const c = n.getAttribute(o)
    c && r.push(`[${o}="${c}"]`)
  }
  return r.join('')
}
function Ut() {
  try {
    return ks.document.location.href
  } catch {
    return ''
  }
}
function ra(e) {
  if (!ks.HTMLElement) return null
  let t = e
  const n = 5
  for (let r = 0; r < n; r++) {
    if (!t) return null
    if (t instanceof HTMLElement) {
      if (t.dataset.sentryComponent) return t.dataset.sentryComponent
      if (t.dataset.sentryElement) return t.dataset.sentryElement
    }
    t = t.parentNode
  }
  return null
}
function Jn(e, t = 0) {
  return typeof e != 'string' || t === 0 || e.length <= t
    ? e
    : `${e.slice(0, t)}...`
}
function vi(e, t) {
  if (!Array.isArray(e)) return ''
  const n = []
  for (let r = 0; r < e.length; r++) {
    const s = e[r]
    try {
      ta(s) ? n.push('[VueViewModel]') : n.push(String(s))
    } catch {
      n.push('[value cannot be serialized]')
    }
  }
  return n.join(t)
}
function Hn(e, t, n = !1) {
  return $e(e)
    ? Du(t)
      ? t.test(e)
      : $e(t)
        ? n
          ? e === t
          : e.includes(t)
        : !1
    : !1
}
function Ue(e, t = [], n = !1) {
  return t.some(r => Hn(e, r, n))
}
function ge(e, t, n) {
  if (!(t in e)) return
  const r = e[t]
  if (typeof r != 'function') return
  const s = n(r)
  typeof s == 'function' && sa(s, r)
  try {
    e[t] = s
  } catch {
    v && _.log(`Failed to replace method "${t}" in object`, e)
  }
}
function Ee(e, t, n) {
  try {
    Object.defineProperty(e, t, { value: n, writable: !0, configurable: !0 })
  } catch {
    v && _.log(`Failed to add non-enumerable property "${t}" to object`, e)
  }
}
function sa(e, t) {
  try {
    const n = t.prototype || {}
    ;((e.prototype = t.prototype = n), Ee(e, '__sentry_original__', t))
  } catch {}
}
function Rs(e) {
  return e.__sentry_original__
}
function ia(e) {
  if (ws(e))
    return { message: e.message, name: e.name, stack: e.stack, ...Ii(e) }
  if (_r(e)) {
    const t = {
      type: e.type,
      target: Ti(e.target),
      currentTarget: Ti(e.currentTarget),
      ...Ii(e),
    }
    return (
      typeof CustomEvent < 'u' && je(e, CustomEvent) && (t.detail = e.detail),
      t
    )
  } else return e
}
function Ti(e) {
  try {
    return Lu(e) ? we(e) : Object.prototype.toString.call(e)
  } catch {
    return '<unknown>'
  }
}
function Ii(e) {
  if (typeof e == 'object' && e !== null) {
    const t = {}
    for (const n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n])
    return t
  } else return {}
}
function $u(e, t = 40) {
  const n = Object.keys(ia(e))
  n.sort()
  const r = n[0]
  if (!r) return '[object has no keys]'
  if (r.length >= t) return Jn(r, t)
  for (let s = n.length; s > 0; s--) {
    const i = n.slice(0, s).join(', ')
    if (!(i.length > t)) return s === n.length ? i : Jn(i, t)
  }
  return ''
}
function Uu() {
  const e = $
  return e.crypto || e.msCrypto
}
function Se(e = Uu()) {
  let t = () => Math.random() * 16
  try {
    if (e?.randomUUID) return e.randomUUID().replace(/-/g, '')
    e?.getRandomValues &&
      (t = () => {
        const n = new Uint8Array(1)
        return (e.getRandomValues(n), n[0])
      })
  } catch {}
  return ('10000000100040008000' + 1e11).replace(/[018]/g, n =>
    (n ^ ((t() & 15) >> (n / 4))).toString(16)
  )
}
function oa(e) {
  return e.exception?.values?.[0]
}
function it(e) {
  const { message: t, event_id: n } = e
  if (t) return t
  const r = oa(e)
  return r
    ? r.type && r.value
      ? `${r.type}: ${r.value}`
      : r.type || r.value || n || '<unknown>'
    : n || '<unknown>'
}
function Xr(e, t, n) {
  const r = (e.exception = e.exception || {}),
    s = (r.values = r.values || []),
    i = (s[0] = s[0] || {})
  ;(i.value || (i.value = t || ''), i.type || (i.type = 'Error'))
}
function Ct(e, t) {
  const n = oa(e)
  if (!n) return
  const r = { type: 'generic', handled: !0 },
    s = n.mechanism
  if (((n.mechanism = { ...r, ...s, ...t }), t && 'data' in t)) {
    const i = { ...s?.data, ...t.data }
    n.mechanism.data = i
  }
}
function wi(e) {
  if (Hu(e)) return !0
  try {
    Ee(e, '__sentry_captured__', !0)
  } catch {}
  return !1
}
function Hu(e) {
  try {
    return e.__sentry_captured__
  } catch {}
}
const aa = 1e3
function gt() {
  return Date.now() / aa
}
function Wu() {
  const { performance: e } = $
  if (!e?.now || !e.timeOrigin) return gt
  const t = e.timeOrigin
  return () => (t + e.now()) / aa
}
let ki
function ce() {
  return (ki ?? (ki = Wu()))()
}
let Lr
function zu() {
  const { performance: e } = $
  if (!e?.now) return [void 0, 'none']
  const t = 3600 * 1e3,
    n = e.now(),
    r = Date.now(),
    s = e.timeOrigin ? Math.abs(e.timeOrigin + n - r) : t,
    i = s < t,
    o = e.timing?.navigationStart,
    a = typeof o == 'number' ? Math.abs(o + n - r) : t,
    u = a < t
  return i || u
    ? s <= a
      ? [e.timeOrigin, 'timeOrigin']
      : [o, 'navigationStart']
    : [r, 'dateNow']
}
function _e() {
  return (Lr || (Lr = zu()), Lr[0])
}
function ju(e) {
  const t = ce(),
    n = {
      sid: Se(),
      init: !0,
      timestamp: t,
      started: t,
      duration: 0,
      status: 'ok',
      errors: 0,
      ignoreDuration: !1,
      toJSON: () => Gu(n),
    }
  return (e && xt(n, e), n)
}
function xt(e, t = {}) {
  if (
    (t.user &&
      (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address),
      !e.did &&
        !t.did &&
        (e.did = t.user.id || t.user.email || t.user.username)),
    (e.timestamp = t.timestamp || ce()),
    t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism),
    t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration),
    t.sid && (e.sid = t.sid.length === 32 ? t.sid : Se()),
    t.init !== void 0 && (e.init = t.init),
    !e.did && t.did && (e.did = `${t.did}`),
    typeof t.started == 'number' && (e.started = t.started),
    e.ignoreDuration)
  )
    e.duration = void 0
  else if (typeof t.duration == 'number') e.duration = t.duration
  else {
    const n = e.timestamp - e.started
    e.duration = n >= 0 ? n : 0
  }
  ;(t.release && (e.release = t.release),
    t.environment && (e.environment = t.environment),
    !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress),
    !e.userAgent && t.userAgent && (e.userAgent = t.userAgent),
    typeof t.errors == 'number' && (e.errors = t.errors),
    t.status && (e.status = t.status))
}
function qu(e, t) {
  let n = {}
  ;(e.status === 'ok' && (n = { status: 'exited' }), xt(e, n))
}
function Gu(e) {
  return {
    sid: `${e.sid}`,
    init: e.init,
    started: new Date(e.started * 1e3).toISOString(),
    timestamp: new Date(e.timestamp * 1e3).toISOString(),
    status: e.status,
    errors: e.errors,
    did:
      typeof e.did == 'number' || typeof e.did == 'string'
        ? `${e.did}`
        : void 0,
    duration: e.duration,
    abnormal_mechanism: e.abnormal_mechanism,
    attrs: {
      release: e.release,
      environment: e.environment,
      ip_address: e.ipAddress,
      user_agent: e.userAgent,
    },
  }
}
function fn(e, t, n = 2) {
  if (!t || typeof t != 'object' || n <= 0) return t
  if (e && Object.keys(t).length === 0) return e
  const r = { ...e }
  for (const s in t)
    Object.prototype.hasOwnProperty.call(t, s) && (r[s] = fn(r[s], t[s], n - 1))
  return r
}
function qe() {
  return Se()
}
function He() {
  return Se().substring(16)
}
const Kr = '_sentrySpan'
function Mt(e, t) {
  t ? Ee(e, Kr, t) : delete e[Kr]
}
function nn(e) {
  return e[Kr]
}
const Vu = 100
class Le {
  constructor() {
    ;((this._notifyingListeners = !1),
      (this._scopeListeners = []),
      (this._eventProcessors = []),
      (this._breadcrumbs = []),
      (this._attachments = []),
      (this._user = {}),
      (this._tags = {}),
      (this._extra = {}),
      (this._contexts = {}),
      (this._sdkProcessingMetadata = {}),
      (this._propagationContext = { traceId: qe(), sampleRand: Math.random() }))
  }
  clone() {
    const t = new Le()
    return (
      (t._breadcrumbs = [...this._breadcrumbs]),
      (t._tags = { ...this._tags }),
      (t._extra = { ...this._extra }),
      (t._contexts = { ...this._contexts }),
      this._contexts.flags &&
        (t._contexts.flags = { values: [...this._contexts.flags.values] }),
      (t._user = this._user),
      (t._level = this._level),
      (t._session = this._session),
      (t._transactionName = this._transactionName),
      (t._fingerprint = this._fingerprint),
      (t._eventProcessors = [...this._eventProcessors]),
      (t._attachments = [...this._attachments]),
      (t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }),
      (t._propagationContext = { ...this._propagationContext }),
      (t._client = this._client),
      (t._lastEventId = this._lastEventId),
      Mt(t, nn(this)),
      t
    )
  }
  setClient(t) {
    this._client = t
  }
  setLastEventId(t) {
    this._lastEventId = t
  }
  getClient() {
    return this._client
  }
  lastEventId() {
    return this._lastEventId
  }
  addScopeListener(t) {
    this._scopeListeners.push(t)
  }
  addEventProcessor(t) {
    return (this._eventProcessors.push(t), this)
  }
  setUser(t) {
    return (
      (this._user = t || {
        email: void 0,
        id: void 0,
        ip_address: void 0,
        username: void 0,
      }),
      this._session && xt(this._session, { user: t }),
      this._notifyScopeListeners(),
      this
    )
  }
  getUser() {
    return this._user
  }
  setTags(t) {
    return (
      (this._tags = { ...this._tags, ...t }),
      this._notifyScopeListeners(),
      this
    )
  }
  setTag(t, n) {
    return (
      (this._tags = { ...this._tags, [t]: n }),
      this._notifyScopeListeners(),
      this
    )
  }
  setExtras(t) {
    return (
      (this._extra = { ...this._extra, ...t }),
      this._notifyScopeListeners(),
      this
    )
  }
  setExtra(t, n) {
    return (
      (this._extra = { ...this._extra, [t]: n }),
      this._notifyScopeListeners(),
      this
    )
  }
  setFingerprint(t) {
    return ((this._fingerprint = t), this._notifyScopeListeners(), this)
  }
  setLevel(t) {
    return ((this._level = t), this._notifyScopeListeners(), this)
  }
  setTransactionName(t) {
    return ((this._transactionName = t), this._notifyScopeListeners(), this)
  }
  setContext(t, n) {
    return (
      n === null ? delete this._contexts[t] : (this._contexts[t] = n),
      this._notifyScopeListeners(),
      this
    )
  }
  setSession(t) {
    return (
      t ? (this._session = t) : delete this._session,
      this._notifyScopeListeners(),
      this
    )
  }
  getSession() {
    return this._session
  }
  update(t) {
    if (!t) return this
    const n = typeof t == 'function' ? t(this) : t,
      r = n instanceof Le ? n.getScopeData() : tn(n) ? t : void 0,
      {
        tags: s,
        extra: i,
        user: o,
        contexts: c,
        level: a,
        fingerprint: u = [],
        propagationContext: l,
      } = r || {}
    return (
      (this._tags = { ...this._tags, ...s }),
      (this._extra = { ...this._extra, ...i }),
      (this._contexts = { ...this._contexts, ...c }),
      o && Object.keys(o).length && (this._user = o),
      a && (this._level = a),
      u.length && (this._fingerprint = u),
      l && (this._propagationContext = l),
      this
    )
  }
  clear() {
    return (
      (this._breadcrumbs = []),
      (this._tags = {}),
      (this._extra = {}),
      (this._user = {}),
      (this._contexts = {}),
      (this._level = void 0),
      (this._transactionName = void 0),
      (this._fingerprint = void 0),
      (this._session = void 0),
      Mt(this, void 0),
      (this._attachments = []),
      this.setPropagationContext({ traceId: qe(), sampleRand: Math.random() }),
      this._notifyScopeListeners(),
      this
    )
  }
  addBreadcrumb(t, n) {
    const r = typeof n == 'number' ? n : Vu
    if (r <= 0) return this
    const s = {
      timestamp: gt(),
      ...t,
      message: t.message ? Jn(t.message, 2048) : t.message,
    }
    return (
      this._breadcrumbs.push(s),
      this._breadcrumbs.length > r &&
        ((this._breadcrumbs = this._breadcrumbs.slice(-r)),
        this._client?.recordDroppedEvent('buffer_overflow', 'log_item')),
      this._notifyScopeListeners(),
      this
    )
  }
  getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1]
  }
  clearBreadcrumbs() {
    return ((this._breadcrumbs = []), this._notifyScopeListeners(), this)
  }
  addAttachment(t) {
    return (this._attachments.push(t), this)
  }
  clearAttachments() {
    return ((this._attachments = []), this)
  }
  getScopeData() {
    return {
      breadcrumbs: this._breadcrumbs,
      attachments: this._attachments,
      contexts: this._contexts,
      tags: this._tags,
      extra: this._extra,
      user: this._user,
      level: this._level,
      fingerprint: this._fingerprint || [],
      eventProcessors: this._eventProcessors,
      propagationContext: this._propagationContext,
      sdkProcessingMetadata: this._sdkProcessingMetadata,
      transactionName: this._transactionName,
      span: nn(this),
    }
  }
  setSDKProcessingMetadata(t) {
    return (
      (this._sdkProcessingMetadata = fn(this._sdkProcessingMetadata, t, 2)),
      this
    )
  }
  setPropagationContext(t) {
    return ((this._propagationContext = t), this)
  }
  getPropagationContext() {
    return this._propagationContext
  }
  captureException(t, n) {
    const r = n?.event_id || Se()
    if (!this._client)
      return (
        v &&
          _.warn('No client configured on scope - will not capture exception!'),
        r
      )
    const s = new Error('Sentry syntheticException')
    return (
      this._client.captureException(
        t,
        { originalException: t, syntheticException: s, ...n, event_id: r },
        this
      ),
      r
    )
  }
  captureMessage(t, n, r) {
    const s = r?.event_id || Se()
    if (!this._client)
      return (
        v &&
          _.warn('No client configured on scope - will not capture message!'),
        s
      )
    const i = new Error(t)
    return (
      this._client.captureMessage(
        t,
        n,
        { originalException: t, syntheticException: i, ...r, event_id: s },
        this
      ),
      s
    )
  }
  captureEvent(t, n) {
    const r = n?.event_id || Se()
    return this._client
      ? (this._client.captureEvent(t, { ...n, event_id: r }, this), r)
      : (v && _.warn('No client configured on scope - will not capture event!'),
        r)
  }
  _notifyScopeListeners() {
    this._notifyingListeners ||
      ((this._notifyingListeners = !0),
      this._scopeListeners.forEach(t => {
        t(this)
      }),
      (this._notifyingListeners = !1))
  }
}
function Yu() {
  return ln('defaultCurrentScope', () => new Le())
}
function Xu() {
  return ln('defaultIsolationScope', () => new Le())
}
class Ku {
  constructor(t, n) {
    let r
    t ? (r = t) : (r = new Le())
    let s
    ;(n ? (s = n) : (s = new Le()),
      (this._stack = [{ scope: r }]),
      (this._isolationScope = s))
  }
  withScope(t) {
    const n = this._pushScope()
    let r
    try {
      r = t(n)
    } catch (s) {
      throw (this._popScope(), s)
    }
    return $t(r)
      ? r.then(
          s => (this._popScope(), s),
          s => {
            throw (this._popScope(), s)
          }
        )
      : (this._popScope(), r)
  }
  getClient() {
    return this.getStackTop().client
  }
  getScope() {
    return this.getStackTop().scope
  }
  getIsolationScope() {
    return this._isolationScope
  }
  getStackTop() {
    return this._stack[this._stack.length - 1]
  }
  _pushScope() {
    const t = this.getScope().clone()
    return (this._stack.push({ client: this.getClient(), scope: t }), t)
  }
  _popScope() {
    return this._stack.length <= 1 ? !1 : !!this._stack.pop()
  }
}
function At() {
  const e = mt(),
    t = mr(e)
  return (t.stack = t.stack || new Ku(Yu(), Xu()))
}
function Ju(e) {
  return At().withScope(e)
}
function Qu(e, t) {
  const n = At()
  return n.withScope(() => ((n.getStackTop().scope = e), t(e)))
}
function Ri(e) {
  return At().withScope(() => e(At().getIsolationScope()))
}
function Zu() {
  return {
    withIsolationScope: Ri,
    withScope: Ju,
    withSetScope: Qu,
    withSetIsolationScope: (e, t) => Ri(t),
    getCurrentScope: () => At().getScope(),
    getIsolationScope: () => At().getIsolationScope(),
  }
}
function Ht(e) {
  const t = mr(e)
  return t.acs ? t.acs : Zu()
}
function X() {
  const e = mt()
  return Ht(e).getCurrentScope()
}
function Oe() {
  const e = mt()
  return Ht(e).getIsolationScope()
}
function ca() {
  return ln('globalScope', () => new Le())
}
function pn(...e) {
  const t = mt(),
    n = Ht(t)
  if (e.length === 2) {
    const [r, s] = e
    return r ? n.withSetScope(r, s) : n.withScope(s)
  }
  return n.withScope(e[0])
}
function F() {
  return X().getClient()
}
function ua(e) {
  const t = e.getPropagationContext(),
    { traceId: n, parentSpanId: r, propagationSpanId: s } = t,
    i = { trace_id: n, span_id: s || He() }
  return (r && (i.parent_span_id = r), i)
}
const Me = 'sentry.source',
  Cs = 'sentry.sample_rate',
  da = 'sentry.previous_trace_sample_rate',
  Ge = 'sentry.op',
  oe = 'sentry.origin',
  rn = 'sentry.idle_span_finish_reason',
  hn = 'sentry.measurement_unit',
  mn = 'sentry.measurement_value',
  Ci = 'sentry.custom_span_name',
  xs = 'sentry.profile_id',
  Wt = 'sentry.exclusive_time',
  ed = 'sentry.link.type',
  td = 0,
  la = 1,
  ae = 2
function nd(e) {
  if (e < 400 && e >= 100) return { code: la }
  if (e >= 400 && e < 500)
    switch (e) {
      case 401:
        return { code: ae, message: 'unauthenticated' }
      case 403:
        return { code: ae, message: 'permission_denied' }
      case 404:
        return { code: ae, message: 'not_found' }
      case 409:
        return { code: ae, message: 'already_exists' }
      case 413:
        return { code: ae, message: 'failed_precondition' }
      case 429:
        return { code: ae, message: 'resource_exhausted' }
      case 499:
        return { code: ae, message: 'cancelled' }
      default:
        return { code: ae, message: 'invalid_argument' }
    }
  if (e >= 500 && e < 600)
    switch (e) {
      case 501:
        return { code: ae, message: 'unimplemented' }
      case 503:
        return { code: ae, message: 'unavailable' }
      case 504:
        return { code: ae, message: 'deadline_exceeded' }
      default:
        return { code: ae, message: 'internal_error' }
    }
  return { code: ae, message: 'unknown_error' }
}
function fa(e, t) {
  e.setAttribute('http.response.status_code', t)
  const n = nd(t)
  n.message !== 'unknown_error' && e.setStatus(n)
}
const pa = '_sentryScope',
  ha = '_sentryIsolationScope'
function rd(e) {
  try {
    const t = $.WeakRef
    if (typeof t == 'function') return new t(e)
  } catch {}
  return e
}
function sd(e) {
  if (e) {
    if (typeof e == 'object' && 'deref' in e && typeof e.deref == 'function')
      try {
        return e.deref()
      } catch {
        return
      }
    return e
  }
}
function id(e, t, n) {
  e && (Ee(e, ha, rd(n)), Ee(e, pa, t))
}
function Qn(e) {
  const t = e
  return { scope: t[pa], isolationScope: sd(t[ha]) }
}
const Ms = 'sentry-',
  od = /^sentry-/,
  ad = 8192
function ma(e) {
  const t = ud(e)
  if (!t) return
  const n = Object.entries(t).reduce((r, [s, i]) => {
    if (s.match(od)) {
      const o = s.slice(Ms.length)
      r[o] = i
    }
    return r
  }, {})
  if (Object.keys(n).length > 0) return n
}
function cd(e) {
  if (!e) return
  const t = Object.entries(e).reduce(
    (n, [r, s]) => (s && (n[`${Ms}${r}`] = s), n),
    {}
  )
  return dd(t)
}
function ud(e) {
  if (!(!e || (!$e(e) && !Array.isArray(e))))
    return Array.isArray(e)
      ? e.reduce((t, n) => {
          const r = xi(n)
          return (
            Object.entries(r).forEach(([s, i]) => {
              t[s] = i
            }),
            t
          )
        }, {})
      : xi(e)
}
function xi(e) {
  return e
    .split(',')
    .map(t =>
      t.split('=').map(n => {
        try {
          return decodeURIComponent(n.trim())
        } catch {
          return
        }
      })
    )
    .reduce((t, [n, r]) => (n && r && (t[n] = r), t), {})
}
function dd(e) {
  if (Object.keys(e).length !== 0)
    return Object.entries(e).reduce((t, [n, r], s) => {
      const i = `${encodeURIComponent(n)}=${encodeURIComponent(r)}`,
        o = s === 0 ? i : `${t},${i}`
      return o.length > ad
        ? (v &&
            _.warn(
              `Not adding key: ${n} with val: ${r} to baggage header due to exceeding baggage size limits.`
            ),
          t)
        : o
    }, '')
}
const ld = /^o(\d+)\./,
  fd = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/
function pd(e) {
  return e === 'http' || e === 'https'
}
function gn(e, t = !1) {
  const {
    host: n,
    path: r,
    pass: s,
    port: i,
    projectId: o,
    protocol: c,
    publicKey: a,
  } = e
  return `${c}://${a}${t && s ? `:${s}` : ''}@${n}${i ? `:${i}` : ''}/${r && `${r}/`}${o}`
}
function hd(e) {
  const t = fd.exec(e)
  if (!t) {
    Ze(() => {
      console.error(`Invalid Sentry Dsn: ${e}`)
    })
    return
  }
  const [n, r, s = '', i = '', o = '', c = ''] = t.slice(1)
  let a = '',
    u = c
  const l = u.split('/')
  if ((l.length > 1 && ((a = l.slice(0, -1).join('/')), (u = l.pop())), u)) {
    const d = u.match(/^\d+/)
    d && (u = d[0])
  }
  return ga({
    host: i,
    pass: s,
    path: a,
    projectId: u,
    port: o,
    protocol: n,
    publicKey: r,
  })
}
function ga(e) {
  return {
    protocol: e.protocol,
    publicKey: e.publicKey || '',
    pass: e.pass || '',
    host: e.host,
    port: e.port || '',
    path: e.path || '',
    projectId: e.projectId,
  }
}
function md(e) {
  if (!v) return !0
  const { port: t, projectId: n, protocol: r } = e
  return ['protocol', 'publicKey', 'host', 'projectId'].find(o =>
    e[o] ? !1 : (_.error(`Invalid Sentry Dsn: ${o} missing`), !0)
  )
    ? !1
    : n.match(/^\d+$/)
      ? pd(r)
        ? t && isNaN(parseInt(t, 10))
          ? (_.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1)
          : !0
        : (_.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1)
      : (_.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1)
}
function gd(e) {
  return e.match(ld)?.[1]
}
function _d(e) {
  const t = e.getOptions(),
    { host: n } = e.getDsn() || {}
  let r
  return (t.orgId ? (r = String(t.orgId)) : n && (r = gd(n)), r)
}
function yd(e) {
  const t = typeof e == 'string' ? hd(e) : ga(e)
  if (!(!t || !md(t))) return t
}
function pt(e) {
  if (typeof e == 'boolean') return Number(e)
  const t = typeof e == 'string' ? parseFloat(e) : e
  if (!(typeof t != 'number' || isNaN(t) || t < 0 || t > 1)) return t
}
const _a = new RegExp(
  '^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$'
)
function Sd(e) {
  if (!e) return
  const t = e.match(_a)
  if (!t) return
  let n
  return (
    t[3] === '1' ? (n = !0) : t[3] === '0' && (n = !1),
    { traceId: t[1], parentSampled: n, parentSpanId: t[2] }
  )
}
function Ed(e, t) {
  const n = Sd(e),
    r = ma(t)
  if (!n?.traceId) return { traceId: qe(), sampleRand: Math.random() }
  const s = bd(n, r)
  r && (r.sample_rand = s.toString())
  const { traceId: i, parentSpanId: o, parentSampled: c } = n
  return {
    traceId: i,
    parentSpanId: o,
    sampled: c,
    dsc: r || {},
    sampleRand: s,
  }
}
function ya(e = qe(), t = He(), n) {
  let r = ''
  return (n !== void 0 && (r = n ? '-1' : '-0'), `${e}-${t}${r}`)
}
function Sa(e = qe(), t = He(), n) {
  return `00-${e}-${t}-${n ? '01' : '00'}`
}
function bd(e, t) {
  const n = pt(t?.sample_rand)
  if (n !== void 0) return n
  const r = pt(t?.sample_rate)
  return r && e?.parentSampled !== void 0
    ? e.parentSampled
      ? Math.random() * r
      : r + Math.random() * (1 - r)
    : Math.random()
}
const Ea = 0,
  As = 1
let Mi = !1
function vd(e) {
  const { spanId: t, traceId: n } = e.spanContext(),
    { data: r, op: s, parent_span_id: i, status: o, origin: c, links: a } = z(e)
  return {
    parent_span_id: i,
    span_id: t,
    trace_id: n,
    data: r,
    op: s,
    status: o,
    origin: c,
    links: a,
  }
}
function ba(e) {
  const { spanId: t, traceId: n, isRemote: r } = e.spanContext(),
    s = r ? t : z(e).parent_span_id,
    i = Qn(e).scope,
    o = r ? i?.getPropagationContext().propagationSpanId || He() : t
  return { parent_span_id: s, span_id: o, trace_id: n }
}
function Td(e) {
  const { traceId: t, spanId: n } = e.spanContext(),
    r = nt(e)
  return ya(t, n, r)
}
function Id(e) {
  const { traceId: t, spanId: n } = e.spanContext(),
    r = nt(e)
  return Sa(t, n, r)
}
function va(e) {
  if (e && e.length > 0)
    return e.map(
      ({
        context: { spanId: t, traceId: n, traceFlags: r, ...s },
        attributes: i,
      }) => ({
        span_id: t,
        trace_id: n,
        sampled: r === As,
        attributes: i,
        ...s,
      })
    )
}
function ut(e) {
  return typeof e == 'number'
    ? Ai(e)
    : Array.isArray(e)
      ? e[0] + e[1] / 1e9
      : e instanceof Date
        ? Ai(e.getTime())
        : ce()
}
function Ai(e) {
  return e > 9999999999 ? e / 1e3 : e
}
function z(e) {
  if (kd(e)) return e.getSpanJSON()
  const { spanId: t, traceId: n } = e.spanContext()
  if (wd(e)) {
    const {
        attributes: r,
        startTime: s,
        name: i,
        endTime: o,
        status: c,
        links: a,
      } = e,
      u =
        'parentSpanId' in e
          ? e.parentSpanId
          : 'parentSpanContext' in e
            ? e.parentSpanContext?.spanId
            : void 0
    return {
      span_id: t,
      trace_id: n,
      data: r,
      description: i,
      parent_span_id: u,
      start_timestamp: ut(s),
      timestamp: ut(o) || void 0,
      status: Ta(c),
      op: r[Ge],
      origin: r[oe],
      links: va(a),
    }
  }
  return { span_id: t, trace_id: n, start_timestamp: 0, data: {} }
}
function wd(e) {
  const t = e
  return (
    !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status
  )
}
function kd(e) {
  return typeof e.getSpanJSON == 'function'
}
function nt(e) {
  const { traceFlags: t } = e.spanContext()
  return t === As
}
function Ta(e) {
  if (!(!e || e.code === td))
    return e.code === la ? 'ok' : e.message || 'unknown_error'
}
const dt = '_sentryChildSpans',
  Jr = '_sentryRootSpan'
function Ia(e, t) {
  const n = e[Jr] || e
  ;(Ee(t, Jr, n), e[dt] ? e[dt].add(t) : Ee(e, dt, new Set([t])))
}
function Rd(e, t) {
  e[dt] && e[dt].delete(t)
}
function Wn(e) {
  const t = new Set()
  function n(r) {
    if (!t.has(r) && nt(r)) {
      t.add(r)
      const s = r[dt] ? Array.from(r[dt]) : []
      for (const i of s) n(i)
    }
  }
  return (n(e), Array.from(t))
}
function de(e) {
  return e[Jr] || e
}
function le() {
  const e = mt(),
    t = Ht(e)
  return t.getActiveSpan ? t.getActiveSpan() : nn(X())
}
function Qr() {
  Mi ||
    (Ze(() => {
      console.warn(
        '[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`.'
      )
    }),
    (Mi = !0))
}
let Oi = !1
function Cd() {
  if (Oi) return
  function e() {
    const t = le(),
      n = t && de(t)
    if (n) {
      const r = 'internal_error'
      ;(v && _.log(`[Tracing] Root span: ${r} -> Global error occurred`),
        n.setStatus({ code: ae, message: r }))
    }
  }
  ;((e.tag = 'sentry_tracingErrorCallback'), (Oi = !0), Jo(e), Qo(e))
}
function Ae(e) {
  if (typeof __SENTRY_TRACING__ == 'boolean' && !__SENTRY_TRACING__) return !1
  const t = e || F()?.getOptions()
  return !!t && (t.tracesSampleRate != null || !!t.tracesSampler)
}
function Ni(e) {
  _.log(
    `Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`
  )
}
function Zn(e, t) {
  if (!t?.length || !e.description) return !1
  for (const n of t) {
    if (Md(n)) {
      if (Hn(e.description, n)) return (v && Ni(e), !0)
      continue
    }
    if (!n.name && !n.op) continue
    const r = n.name ? Hn(e.description, n.name) : !0,
      s = n.op ? e.op && Hn(e.op, n.op) : !0
    if (r && s) return (v && Ni(e), !0)
  }
  return !1
}
function xd(e, t) {
  const n = t.parent_span_id,
    r = t.span_id
  if (n) for (const s of e) s.parent_span_id === r && (s.parent_span_id = n)
}
function Md(e) {
  return typeof e == 'string' || e instanceof RegExp
}
const Os = 'production',
  wa = '_frozenDsc'
function zn(e, t) {
  Ee(e, wa, t)
}
function ka(e, t) {
  const n = t.getOptions(),
    { publicKey: r } = t.getDsn() || {},
    s = {
      environment: n.environment || Os,
      release: n.release,
      public_key: r,
      trace_id: e,
      org_id: _d(t),
    }
  return (t.emit('createDsc', s), s)
}
function Ns(e, t) {
  const n = t.getPropagationContext()
  return n.dsc || ka(n.traceId, e)
}
function De(e) {
  const t = F()
  if (!t) return {}
  const n = de(e),
    r = z(n),
    s = r.data,
    i = n.spanContext().traceState,
    o = i?.get('sentry.sample_rate') ?? s[Cs] ?? s[da]
  function c(h) {
    return (
      (typeof o == 'number' || typeof o == 'string') &&
        (h.sample_rate = `${o}`),
      h
    )
  }
  const a = n[wa]
  if (a) return c(a)
  const u = i?.get('sentry.dsc'),
    l = u && ma(u)
  if (l) return c(l)
  const d = ka(e.spanContext().traceId, t),
    p = s[Me],
    f = r.description
  return (
    p !== 'url' && f && (d.transaction = f),
    Ae() &&
      ((d.sampled = String(nt(n))),
      (d.sample_rand =
        i?.get('sentry.sample_rand') ??
        Qn(n).scope?.getPropagationContext().sampleRand.toString())),
    c(d),
    t.emit('createDsc', d, n),
    d
  )
}
class Ke {
  constructor(t = {}) {
    ;((this._traceId = t.traceId || qe()), (this._spanId = t.spanId || He()))
  }
  spanContext() {
    return { spanId: this._spanId, traceId: this._traceId, traceFlags: Ea }
  }
  end(t) {}
  setAttribute(t, n) {
    return this
  }
  setAttributes(t) {
    return this
  }
  setStatus(t) {
    return this
  }
  updateName(t) {
    return this
  }
  isRecording() {
    return !1
  }
  addEvent(t, n, r) {
    return this
  }
  addLink(t) {
    return this
  }
  addLinks(t) {
    return this
  }
  recordException(t, n) {}
}
function Te(e, t = 100, n = 1 / 0) {
  try {
    return Zr('', e, t, n)
  } catch (r) {
    return { ERROR: `**non-serializable** (${r})` }
  }
}
function Ra(e, t = 3, n = 100 * 1024) {
  const r = Te(e, t)
  return Ld(r) > n ? Ra(e, t - 1, n) : r
}
function Zr(e, t, n = 1 / 0, r = 1 / 0, s = Dd()) {
  const [i, o] = s
  if (
    t == null ||
    ['boolean', 'string'].includes(typeof t) ||
    (typeof t == 'number' && Number.isFinite(t))
  )
    return t
  const c = Ad(e, t)
  if (!c.startsWith('[object ')) return c
  if (t.__sentry_skip_normalization__) return t
  const a =
    typeof t.__sentry_override_normalization_depth__ == 'number'
      ? t.__sentry_override_normalization_depth__
      : n
  if (a === 0) return c.replace('object ', '')
  if (i(t)) return '[Circular ~]'
  const u = t
  if (u && typeof u.toJSON == 'function')
    try {
      const f = u.toJSON()
      return Zr('', f, a - 1, r, s)
    } catch {}
  const l = Array.isArray(t) ? [] : {}
  let d = 0
  const p = ia(t)
  for (const f in p) {
    if (!Object.prototype.hasOwnProperty.call(p, f)) continue
    if (d >= r) {
      l[f] = '[MaxProperties ~]'
      break
    }
    const h = p[f]
    ;((l[f] = Zr(f, h, a - 1, r, s)), d++)
  }
  return (o(t), l)
}
function Ad(e, t) {
  try {
    if (e === 'domain' && t && typeof t == 'object' && t._events)
      return '[Domain]'
    if (e === 'domainEmitter') return '[DomainEmitter]'
    if (typeof global < 'u' && t === global) return '[Global]'
    if (typeof window < 'u' && t === window) return '[Window]'
    if (typeof document < 'u' && t === document) return '[Document]'
    if (ta(t)) return '[VueViewModel]'
    if (Pu(t)) return '[SyntheticEvent]'
    if (typeof t == 'number' && !Number.isFinite(t)) return `[${t}]`
    if (typeof t == 'function') return `[Function: ${ze(t)}]`
    if (typeof t == 'symbol') return `[${String(t)}]`
    if (typeof t == 'bigint') return `[BigInt: ${String(t)}]`
    const n = Od(t)
    return /^HTML(\w*)Element$/.test(n)
      ? `[HTMLElement: ${n}]`
      : `[object ${n}]`
  } catch (n) {
    return `**non-serializable** (${n})`
  }
}
function Od(e) {
  const t = Object.getPrototypeOf(e)
  return t?.constructor ? t.constructor.name : 'null prototype'
}
function Nd(e) {
  return ~-encodeURI(e).split(/%..|./).length
}
function Ld(e) {
  return Nd(JSON.stringify(e))
}
function Dd() {
  const e = new WeakSet()
  function t(r) {
    return e.has(r) ? !0 : (e.add(r), !1)
  }
  function n(r) {
    e.delete(r)
  }
  return [t, n]
}
function _t(e, t = []) {
  return [e, t]
}
function Pd(e, t) {
  const [n, r] = e
  return [n, [...r, t]]
}
function Li(e, t) {
  const n = e[1]
  for (const r of n) {
    const s = r[0].type
    if (t(r, s)) return !0
  }
  return !1
}
function es(e) {
  const t = mr($)
  return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e)
}
function Fd(e) {
  const [t, n] = e
  let r = JSON.stringify(t)
  function s(i) {
    typeof r == 'string'
      ? (r = typeof i == 'string' ? r + i : [es(r), i])
      : r.push(typeof i == 'string' ? es(i) : i)
  }
  for (const i of n) {
    const [o, c] = i
    if (
      (s(`
${JSON.stringify(o)}
`),
      typeof c == 'string' || c instanceof Uint8Array)
    )
      s(c)
    else {
      let a
      try {
        a = JSON.stringify(c)
      } catch {
        a = JSON.stringify(Te(c))
      }
      s(a)
    }
  }
  return typeof r == 'string' ? r : Bd(r)
}
function Bd(e) {
  const t = e.reduce((s, i) => s + i.length, 0),
    n = new Uint8Array(t)
  let r = 0
  for (const s of e) (n.set(s, r), (r += s.length))
  return n
}
function $d(e) {
  return [{ type: 'span' }, e]
}
function Ud(e) {
  const t = typeof e.data == 'string' ? es(e.data) : e.data
  return [
    {
      type: 'attachment',
      length: t.length,
      filename: e.filename,
      content_type: e.contentType,
      attachment_type: e.attachmentType,
    },
    t,
  ]
}
const Hd = {
  session: 'session',
  sessions: 'session',
  attachment: 'attachment',
  transaction: 'transaction',
  event: 'error',
  client_report: 'internal',
  user_report: 'default',
  profile: 'profile',
  profile_chunk: 'profile',
  replay_event: 'replay',
  replay_recording: 'replay',
  check_in: 'monitor',
  feedback: 'feedback',
  span: 'span',
  raw_security: 'security',
  log: 'log_item',
}
function Di(e) {
  return Hd[e]
}
function Ls(e) {
  if (!e?.sdk) return
  const { name: t, version: n } = e.sdk
  return { name: t, version: n }
}
function Ca(e, t, n, r) {
  const s = e.sdkProcessingMetadata?.dynamicSamplingContext
  return {
    event_id: e.event_id,
    sent_at: new Date().toISOString(),
    ...(t && { sdk: t }),
    ...(!!n && r && { dsn: gn(r) }),
    ...(s && { trace: s }),
  }
}
function Wd(e, t) {
  if (!t) return e
  const n = e.sdk || {}
  return (
    (e.sdk = {
      ...n,
      name: n.name || t.name,
      version: n.version || t.version,
      integrations: [...(e.sdk?.integrations || []), ...(t.integrations || [])],
      packages: [...(e.sdk?.packages || []), ...(t.packages || [])],
      settings:
        e.sdk?.settings || t.settings
          ? { ...e.sdk?.settings, ...t.settings }
          : void 0,
    }),
    e
  )
}
function zd(e, t, n, r) {
  const s = Ls(n),
    i = {
      sent_at: new Date().toISOString(),
      ...(s && { sdk: s }),
      ...(!!r && t && { dsn: gn(t) }),
    },
    o =
      'aggregates' in e
        ? [{ type: 'sessions' }, e]
        : [{ type: 'session' }, e.toJSON()]
  return _t(i, [o])
}
function jd(e, t, n, r) {
  const s = Ls(n),
    i = e.type && e.type !== 'replay_event' ? e.type : 'event'
  Wd(e, n?.sdk)
  const o = Ca(e, s, r, t)
  return (delete e.sdkProcessingMetadata, _t(o, [[{ type: i }, e]]))
}
function qd(e, t) {
  function n(f) {
    return !!f.trace_id && !!f.public_key
  }
  const r = De(e[0]),
    s = t?.getDsn(),
    i = t?.getOptions().tunnel,
    o = {
      sent_at: new Date().toISOString(),
      ...(n(r) && { trace: r }),
      ...(!!i && s && { dsn: gn(s) }),
    },
    { beforeSendSpan: c, ignoreSpans: a } = t?.getOptions() || {},
    u = a?.length ? e.filter(f => !Zn(z(f), a)) : e,
    l = e.length - u.length
  l && t?.recordDroppedEvent('before_send', 'span', l)
  const d = c
      ? f => {
          const h = z(f),
            m = c(h)
          return m || (Qr(), h)
        }
      : z,
    p = []
  for (const f of u) {
    const h = d(f)
    h && p.push($d(h))
  }
  return _t(o, p)
}
function Gd(e) {
  if (!v) return
  const {
      description: t = '< unknown name >',
      op: n = '< unknown op >',
      parent_span_id: r,
    } = z(e),
    { spanId: s } = e.spanContext(),
    i = nt(e),
    o = de(e),
    c = o === e,
    a = `[Tracing] Starting ${i ? 'sampled' : 'unsampled'} ${c ? 'root ' : ''}span`,
    u = [`op: ${n}`, `name: ${t}`, `ID: ${s}`]
  if ((r && u.push(`parent ID: ${r}`), !c)) {
    const { op: l, description: d } = z(o)
    ;(u.push(`root ID: ${o.spanContext().spanId}`),
      l && u.push(`root op: ${l}`),
      d && u.push(`root description: ${d}`))
  }
  _.log(`${a}
  ${u.join(`
  `)}`)
}
function Vd(e) {
  if (!v) return
  const { description: t = '< unknown name >', op: n = '< unknown op >' } =
      z(e),
    { spanId: r } = e.spanContext(),
    i = de(e) === e,
    o = `[Tracing] Finishing "${n}" ${i ? 'root ' : ''}span "${t}" with ID ${r}`
  _.log(o)
}
function Yd(e, t, n, r = le()) {
  const s = r && de(r)
  s &&
    (v &&
      _.log(`[Measurement] Setting measurement on root span: ${e} = ${t} ${n}`),
    s.addEvent(e, { [mn]: t, [hn]: n }))
}
function Pi(e) {
  if (!e || e.length === 0) return
  const t = {}
  return (
    e.forEach(n => {
      const r = n.attributes || {},
        s = r[hn],
        i = r[mn]
      typeof s == 'string' &&
        typeof i == 'number' &&
        (t[n.name] = { value: i, unit: s })
    }),
    t
  )
}
const Fi = 1e3
class yr {
  constructor(t = {}) {
    ;((this._traceId = t.traceId || qe()),
      (this._spanId = t.spanId || He()),
      (this._startTime = t.startTimestamp || ce()),
      (this._links = t.links),
      (this._attributes = {}),
      this.setAttributes({ [oe]: 'manual', [Ge]: t.op, ...t.attributes }),
      (this._name = t.name),
      t.parentSpanId && (this._parentSpanId = t.parentSpanId),
      'sampled' in t && (this._sampled = t.sampled),
      t.endTimestamp && (this._endTime = t.endTimestamp),
      (this._events = []),
      (this._isStandaloneSpan = t.isStandalone),
      this._endTime && this._onSpanEnded())
  }
  addLink(t) {
    return (this._links ? this._links.push(t) : (this._links = [t]), this)
  }
  addLinks(t) {
    return (this._links ? this._links.push(...t) : (this._links = t), this)
  }
  recordException(t, n) {}
  spanContext() {
    const { _spanId: t, _traceId: n, _sampled: r } = this
    return { spanId: t, traceId: n, traceFlags: r ? As : Ea }
  }
  setAttribute(t, n) {
    return (
      n === void 0 ? delete this._attributes[t] : (this._attributes[t] = n),
      this
    )
  }
  setAttributes(t) {
    return (Object.keys(t).forEach(n => this.setAttribute(n, t[n])), this)
  }
  updateStartTime(t) {
    this._startTime = ut(t)
  }
  setStatus(t) {
    return ((this._status = t), this)
  }
  updateName(t) {
    return ((this._name = t), this.setAttribute(Me, 'custom'), this)
  }
  end(t) {
    this._endTime || ((this._endTime = ut(t)), Vd(this), this._onSpanEnded())
  }
  getSpanJSON() {
    return {
      data: this._attributes,
      description: this._name,
      op: this._attributes[Ge],
      parent_span_id: this._parentSpanId,
      span_id: this._spanId,
      start_timestamp: this._startTime,
      status: Ta(this._status),
      timestamp: this._endTime,
      trace_id: this._traceId,
      origin: this._attributes[oe],
      profile_id: this._attributes[xs],
      exclusive_time: this._attributes[Wt],
      measurements: Pi(this._events),
      is_segment: (this._isStandaloneSpan && de(this) === this) || void 0,
      segment_id: this._isStandaloneSpan
        ? de(this).spanContext().spanId
        : void 0,
      links: va(this._links),
    }
  }
  isRecording() {
    return !this._endTime && !!this._sampled
  }
  addEvent(t, n, r) {
    v && _.log('[Tracing] Adding an event to span:', t)
    const s = Bi(n) ? n : r || ce(),
      i = Bi(n) ? {} : n || {},
      o = { name: t, time: ut(s), attributes: i }
    return (this._events.push(o), this)
  }
  isStandaloneSpan() {
    return !!this._isStandaloneSpan
  }
  _onSpanEnded() {
    const t = F()
    if (
      (t && t.emit('spanEnd', this),
      !(this._isStandaloneSpan || this === de(this)))
    )
      return
    if (this._isStandaloneSpan) {
      this._sampled
        ? Kd(qd([this], t))
        : (v &&
            _.log(
              '[Tracing] Discarding standalone span because its trace was not chosen to be sampled.'
            ),
          t && t.recordDroppedEvent('sample_rate', 'span'))
      return
    }
    const r = this._convertSpanToTransaction()
    r && (Qn(this).scope || X()).captureEvent(r)
  }
  _convertSpanToTransaction() {
    if (!$i(z(this))) return
    this._name ||
      (v &&
        _.warn(
          'Transaction has no name, falling back to `<unlabeled transaction>`.'
        ),
      (this._name = '<unlabeled transaction>'))
    const { scope: t, isolationScope: n } = Qn(this),
      r = t?.getScopeData().sdkProcessingMetadata?.normalizedRequest
    if (this._sampled !== !0) return
    const i = Wn(this)
        .filter(l => l !== this && !Xd(l))
        .map(l => z(l))
        .filter($i),
      o = this._attributes[Me]
    ;(delete this._attributes[Ci],
      i.forEach(l => {
        delete l.data[Ci]
      }))
    const c = {
        contexts: { trace: vd(this) },
        spans:
          i.length > Fi
            ? i
                .sort((l, d) => l.start_timestamp - d.start_timestamp)
                .slice(0, Fi)
            : i,
        start_timestamp: this._startTime,
        timestamp: this._endTime,
        transaction: this._name,
        type: 'transaction',
        sdkProcessingMetadata: {
          capturedSpanScope: t,
          capturedSpanIsolationScope: n,
          dynamicSamplingContext: De(this),
        },
        request: r,
        ...(o && { transaction_info: { source: o } }),
      },
      a = Pi(this._events)
    return (
      a &&
        Object.keys(a).length &&
        (v &&
          _.log(
            '[Measurements] Adding measurements to transaction event',
            JSON.stringify(a, void 0, 2)
          ),
        (c.measurements = a)),
      c
    )
  }
}
function Bi(e) {
  return (e && typeof e == 'number') || e instanceof Date || Array.isArray(e)
}
function $i(e) {
  return !!e.start_timestamp && !!e.timestamp && !!e.span_id && !!e.trace_id
}
function Xd(e) {
  return e instanceof yr && e.isStandaloneSpan()
}
function Kd(e) {
  const t = F()
  if (!t) return
  const n = e[1]
  if (!n || n.length === 0) {
    t.recordDroppedEvent('before_send', 'span')
    return
  }
  t.sendEnvelope(e)
}
function Jd(e, t, n = () => {}, r = () => {}) {
  let s
  try {
    s = e()
  } catch (i) {
    throw (t(i), n(), i)
  }
  return Qd(s, t, n, r)
}
function Qd(e, t, n, r) {
  return $t(e)
    ? e.then(
        s => (n(), r(s), s),
        s => {
          throw (t(s), n(), s)
        }
      )
    : (n(), r(e), e)
}
function Zd(e, t, n) {
  if (!Ae(e)) return [!1]
  let r, s
  typeof e.tracesSampler == 'function'
    ? ((s = e.tracesSampler({
        ...t,
        inheritOrSampleWith: c =>
          typeof t.parentSampleRate == 'number'
            ? t.parentSampleRate
            : typeof t.parentSampled == 'boolean'
              ? Number(t.parentSampled)
              : c,
      })),
      (r = !0))
    : t.parentSampled !== void 0
      ? (s = t.parentSampled)
      : typeof e.tracesSampleRate < 'u' && ((s = e.tracesSampleRate), (r = !0))
  const i = pt(s)
  if (i === void 0)
    return (
      v &&
        _.warn(
          `[Tracing] Discarding root span because of invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(s)} of type ${JSON.stringify(typeof s)}.`
        ),
      [!1]
    )
  if (!i)
    return (
      v &&
        _.log(
          `[Tracing] Discarding transaction because ${typeof e.tracesSampler == 'function' ? 'tracesSampler returned 0 or false' : 'a negative sampling decision was inherited or tracesSampleRate is set to 0'}`
        ),
      [!1, i, r]
    )
  const o = n < i
  return (
    o ||
      (v &&
        _.log(
          `[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(s)})`
        )),
    [o, i, r]
  )
}
const xa = '__SENTRY_SUPPRESS_TRACING__'
function el(e, t) {
  const n = Ps()
  if (n.startSpan) return n.startSpan(e, t)
  const r = Aa(e),
    { forceTransaction: s, parentSpan: i, scope: o } = e,
    c = o?.clone()
  return pn(c, () =>
    nl(i)(() => {
      const u = X(),
        l = Oa(u, i),
        p =
          e.onlyIfParent && !l
            ? new Ke()
            : Ma({
                parentSpan: l,
                spanArguments: r,
                forceTransaction: s,
                scope: u,
              })
      return (
        Mt(u, p),
        Jd(
          () => t(p),
          () => {
            const { status: f } = z(p)
            p.isRecording() &&
              (!f || f === 'ok') &&
              p.setStatus({ code: ae, message: 'internal_error' })
          },
          () => {
            p.end()
          }
        )
      )
    })
  )
}
function zt(e) {
  const t = Ps()
  if (t.startInactiveSpan) return t.startInactiveSpan(e)
  const n = Aa(e),
    { forceTransaction: r, parentSpan: s } = e
  return (
    e.scope ? o => pn(e.scope, o) : s !== void 0 ? o => Ds(s, o) : o => o()
  )(() => {
    const o = X(),
      c = Oa(o, s)
    return e.onlyIfParent && !c
      ? new Ke()
      : Ma({ parentSpan: c, spanArguments: n, forceTransaction: r, scope: o })
  })
}
function Ds(e, t) {
  const n = Ps()
  return n.withActiveSpan
    ? n.withActiveSpan(e, t)
    : pn(r => (Mt(r, e || void 0), t(r)))
}
function Ma({
  parentSpan: e,
  spanArguments: t,
  forceTransaction: n,
  scope: r,
}) {
  if (!Ae()) {
    const o = new Ke()
    if (n || !e) {
      const c = {
        sampled: 'false',
        sample_rate: '0',
        transaction: t.name,
        ...De(o),
      }
      zn(o, c)
    }
    return o
  }
  const s = Oe()
  let i
  if (e && !n) ((i = tl(e, r, t)), Ia(e, i))
  else if (e) {
    const o = De(e),
      { traceId: c, spanId: a } = e.spanContext(),
      u = nt(e)
    ;((i = Ui({ traceId: c, parentSpanId: a, ...t }, r, u)), zn(i, o))
  } else {
    const {
      traceId: o,
      dsc: c,
      parentSpanId: a,
      sampled: u,
    } = { ...s.getPropagationContext(), ...r.getPropagationContext() }
    ;((i = Ui({ traceId: o, parentSpanId: a, ...t }, r, u)), c && zn(i, c))
  }
  return (Gd(i), id(i, r, s), i)
}
function Aa(e) {
  const n = { isStandalone: (e.experimental || {}).standalone, ...e }
  if (e.startTime) {
    const r = { ...n }
    return ((r.startTimestamp = ut(e.startTime)), delete r.startTime, r)
  }
  return n
}
function Ps() {
  const e = mt()
  return Ht(e)
}
function Ui(e, t, n) {
  const r = F(),
    s = r?.getOptions() || {},
    { name: i = '' } = e,
    o = { spanAttributes: { ...e.attributes }, spanName: i, parentSampled: n }
  r?.emit('beforeSampling', o, { decision: !1 })
  const c = o.parentSampled ?? n,
    a = o.spanAttributes,
    u = t.getPropagationContext(),
    [l, d, p] = t.getScopeData().sdkProcessingMetadata[xa]
      ? [!1]
      : Zd(
          s,
          {
            name: i,
            parentSampled: c,
            attributes: a,
            parentSampleRate: pt(u.dsc?.sample_rate),
          },
          u.sampleRand
        ),
    f = new yr({
      ...e,
      attributes: {
        [Me]: 'custom',
        [Cs]: d !== void 0 && p ? d : void 0,
        ...a,
      },
      sampled: l,
    })
  return (
    !l &&
      r &&
      (v &&
        _.log(
          '[Tracing] Discarding root span because its trace was not chosen to be sampled.'
        ),
      r.recordDroppedEvent('sample_rate', 'transaction')),
    r && r.emit('spanStart', f),
    f
  )
}
function tl(e, t, n) {
  const { spanId: r, traceId: s } = e.spanContext(),
    i = t.getScopeData().sdkProcessingMetadata[xa] ? !1 : nt(e),
    o = i
      ? new yr({ ...n, parentSpanId: r, traceId: s, sampled: i })
      : new Ke({ traceId: s })
  Ia(e, o)
  const c = F()
  return (
    c && (c.emit('spanStart', o), n.endTimestamp && c.emit('spanEnd', o)),
    o
  )
}
function Oa(e, t) {
  if (t) return t
  if (t === null) return
  const n = nn(e)
  if (!n) return
  const r = F()
  return (r ? r.getOptions() : {}).parentSpanIsAlwaysRootSpan ? de(n) : n
}
function nl(e) {
  return e !== void 0 ? t => Ds(e, t) : t => t()
}
const jn = { idleTimeout: 1e3, finalTimeout: 3e4, childSpanTimeout: 15e3 },
  rl = 'heartbeatFailed',
  sl = 'idleTimeout',
  il = 'finalTimeout',
  ol = 'externalFinish'
function Na(e, t = {}) {
  const n = new Map()
  let r = !1,
    s,
    i = ol,
    o = !t.disableAutoFinish
  const c = [],
    {
      idleTimeout: a = jn.idleTimeout,
      finalTimeout: u = jn.finalTimeout,
      childSpanTimeout: l = jn.childSpanTimeout,
      beforeSpanEnd: d,
      trimIdleSpanEndTimestamp: p = !0,
    } = t,
    f = F()
  if (!f || !Ae()) {
    const y = new Ke(),
      I = { sample_rate: '0', sampled: 'false', ...De(y) }
    return (zn(y, I), y)
  }
  const h = X(),
    m = le(),
    g = al(e)
  g.end = new Proxy(g.end, {
    apply(y, I, S) {
      if ((d && d(g), I instanceof Ke)) return
      const [w, ...L] = S,
        B = w || ce(),
        U = ut(B),
        Z = Wn(g).filter(G => G !== g),
        te = z(g)
      if (!Z.length || !p) return (T(U), Reflect.apply(y, I, [U, ...L]))
      const K = f.getOptions().ignoreSpans,
        b = Z?.reduce(
          (G, ne) => {
            const ee = z(ne)
            return !ee.timestamp || (K && Zn(ee, K))
              ? G
              : G
                ? Math.max(G, ee.timestamp)
                : ee.timestamp
          },
          void 0
        ),
        q = te.start_timestamp,
        k = Math.min(
          q ? q + u / 1e3 : 1 / 0,
          Math.max(q || -1 / 0, Math.min(U, b || 1 / 0))
        )
      return (T(k), Reflect.apply(y, I, [k, ...L]))
    },
  })
  function E() {
    s && (clearTimeout(s), (s = void 0))
  }
  function R(y) {
    ;(E(),
      (s = setTimeout(() => {
        !r && n.size === 0 && o && ((i = sl), g.end(y))
      }, a)))
  }
  function P(y) {
    s = setTimeout(() => {
      !r && o && ((i = rl), g.end(y))
    }, l)
  }
  function N(y) {
    ;(E(), n.set(y, !0))
    const I = ce()
    P(I + l / 1e3)
  }
  function M(y) {
    if ((n.has(y) && n.delete(y), n.size === 0)) {
      const I = ce()
      R(I + a / 1e3)
    }
  }
  function T(y) {
    ;((r = !0), n.clear(), c.forEach(U => U()), Mt(h, m))
    const I = z(g),
      { start_timestamp: S } = I
    if (!S) return
    ;(I.data[rn] || g.setAttribute(rn, i),
      _.log(`[Tracing] Idle span "${I.op}" finished`))
    const L = Wn(g).filter(U => U !== g)
    let B = 0
    ;(L.forEach(U => {
      U.isRecording() &&
        (U.setStatus({ code: ae, message: 'cancelled' }),
        U.end(y),
        v &&
          _.log(
            '[Tracing] Cancelling span since span ended early',
            JSON.stringify(U, void 0, 2)
          ))
      const Z = z(U),
        { timestamp: te = 0, start_timestamp: K = 0 } = Z,
        b = K <= y,
        q = (u + a) / 1e3,
        k = te - K <= q
      if (v) {
        const G = JSON.stringify(U, void 0, 2)
        b
          ? k ||
            _.log(
              '[Tracing] Discarding span since it finished after idle span final timeout',
              G
            )
          : _.log(
              '[Tracing] Discarding span since it happened after idle span was finished',
              G
            )
      }
      ;(!k || !b) && (Rd(g, U), B++)
    }),
      B > 0 && g.setAttribute('sentry.idle_span_discarded_spans', B))
  }
  return (
    c.push(
      f.on('spanStart', y => {
        if (
          r ||
          y === g ||
          z(y).timestamp ||
          (y instanceof yr && y.isStandaloneSpan())
        )
          return
        Wn(g).includes(y) && N(y.spanContext().spanId)
      })
    ),
    c.push(
      f.on('spanEnd', y => {
        r || M(y.spanContext().spanId)
      })
    ),
    c.push(
      f.on('idleSpanEnableAutoFinish', y => {
        y === g && ((o = !0), R(), n.size && P())
      })
    ),
    t.disableAutoFinish || R(),
    setTimeout(() => {
      r ||
        (g.setStatus({ code: ae, message: 'deadline_exceeded' }),
        (i = il),
        g.end())
    }, u),
    g
  )
}
function al(e) {
  const t = zt(e)
  return (Mt(X(), t), v && _.log('[Tracing] Started span is an idle span'), t)
}
const Dr = 0,
  Hi = 1,
  Wi = 2
function Sr(e) {
  return new Ot(t => {
    t(e)
  })
}
function Fs(e) {
  return new Ot((t, n) => {
    n(e)
  })
}
class Ot {
  constructor(t) {
    ;((this._state = Dr), (this._handlers = []), this._runExecutor(t))
  }
  then(t, n) {
    return new Ot((r, s) => {
      ;(this._handlers.push([
        !1,
        i => {
          if (!t) r(i)
          else
            try {
              r(t(i))
            } catch (o) {
              s(o)
            }
        },
        i => {
          if (!n) s(i)
          else
            try {
              r(n(i))
            } catch (o) {
              s(o)
            }
        },
      ]),
        this._executeHandlers())
    })
  }
  catch(t) {
    return this.then(n => n, t)
  }
  finally(t) {
    return new Ot((n, r) => {
      let s, i
      return this.then(
        o => {
          ;((i = !1), (s = o), t && t())
        },
        o => {
          ;((i = !0), (s = o), t && t())
        }
      ).then(() => {
        if (i) {
          r(s)
          return
        }
        n(s)
      })
    })
  }
  _executeHandlers() {
    if (this._state === Dr) return
    const t = this._handlers.slice()
    ;((this._handlers = []),
      t.forEach(n => {
        n[0] ||
          (this._state === Hi && n[1](this._value),
          this._state === Wi && n[2](this._value),
          (n[0] = !0))
      }))
  }
  _runExecutor(t) {
    const n = (i, o) => {
        if (this._state === Dr) {
          if ($t(o)) {
            o.then(r, s)
            return
          }
          ;((this._state = i), (this._value = o), this._executeHandlers())
        }
      },
      r = i => {
        n(Hi, i)
      },
      s = i => {
        n(Wi, i)
      }
    try {
      t(r, s)
    } catch (i) {
      s(i)
    }
  }
}
function cl(e, t, n, r = 0) {
  try {
    const s = ts(t, n, e, r)
    return $t(s) ? s : Sr(s)
  } catch (s) {
    return Fs(s)
  }
}
function ts(e, t, n, r) {
  const s = n[r]
  if (!e || !s) return e
  const i = s({ ...e }, t)
  return (
    v && i === null && _.log(`Event processor "${s.id || '?'}" dropped event`),
    $t(i) ? i.then(o => ts(o, t, n, r + 1)) : ts(i, t, n, r + 1)
  )
}
function ul(e, t) {
  const {
    fingerprint: n,
    span: r,
    breadcrumbs: s,
    sdkProcessingMetadata: i,
  } = t
  ;(dl(e, t), r && pl(e, r), hl(e, n), ll(e, s), fl(e, i))
}
function er(e, t) {
  const {
    extra: n,
    tags: r,
    user: s,
    contexts: i,
    level: o,
    sdkProcessingMetadata: c,
    breadcrumbs: a,
    fingerprint: u,
    eventProcessors: l,
    attachments: d,
    propagationContext: p,
    transactionName: f,
    span: h,
  } = t
  ;(Rn(e, 'extra', n),
    Rn(e, 'tags', r),
    Rn(e, 'user', s),
    Rn(e, 'contexts', i),
    (e.sdkProcessingMetadata = fn(e.sdkProcessingMetadata, c, 2)),
    o && (e.level = o),
    f && (e.transactionName = f),
    h && (e.span = h),
    a.length && (e.breadcrumbs = [...e.breadcrumbs, ...a]),
    u.length && (e.fingerprint = [...e.fingerprint, ...u]),
    l.length && (e.eventProcessors = [...e.eventProcessors, ...l]),
    d.length && (e.attachments = [...e.attachments, ...d]),
    (e.propagationContext = { ...e.propagationContext, ...p }))
}
function Rn(e, t, n) {
  e[t] = fn(e[t], n, 1)
}
function dl(e, t) {
  const {
    extra: n,
    tags: r,
    user: s,
    contexts: i,
    level: o,
    transactionName: c,
  } = t
  ;(Object.keys(n).length && (e.extra = { ...n, ...e.extra }),
    Object.keys(r).length && (e.tags = { ...r, ...e.tags }),
    Object.keys(s).length && (e.user = { ...s, ...e.user }),
    Object.keys(i).length && (e.contexts = { ...i, ...e.contexts }),
    o && (e.level = o),
    c && e.type !== 'transaction' && (e.transaction = c))
}
function ll(e, t) {
  const n = [...(e.breadcrumbs || []), ...t]
  e.breadcrumbs = n.length ? n : void 0
}
function fl(e, t) {
  e.sdkProcessingMetadata = { ...e.sdkProcessingMetadata, ...t }
}
function pl(e, t) {
  ;((e.contexts = { trace: ba(t), ...e.contexts }),
    (e.sdkProcessingMetadata = {
      dynamicSamplingContext: De(t),
      ...e.sdkProcessingMetadata,
    }))
  const n = de(t),
    r = z(n).description
  r && !e.transaction && e.type === 'transaction' && (e.transaction = r)
}
function hl(e, t) {
  ;((e.fingerprint = e.fingerprint
    ? Array.isArray(e.fingerprint)
      ? e.fingerprint
      : [e.fingerprint]
    : []),
    t && (e.fingerprint = e.fingerprint.concat(t)),
    e.fingerprint.length || delete e.fingerprint)
}
let Cn, zi, xn
function ml(e) {
  const t = $._sentryDebugIds
  if (!t) return {}
  const n = Object.keys(t)
  return (
    (xn && n.length === zi) ||
      ((zi = n.length),
      (xn = n.reduce((r, s) => {
        Cn || (Cn = {})
        const i = Cn[s]
        if (i) r[i[0]] = i[1]
        else {
          const o = e(s)
          for (let c = o.length - 1; c >= 0; c--) {
            const u = o[c]?.filename,
              l = t[s]
            if (u && l) {
              ;((r[u] = l), (Cn[s] = [u, l]))
              break
            }
          }
        }
        return r
      }, {}))),
    xn
  )
}
function La(e, t, n, r, s, i) {
  const { normalizeDepth: o = 3, normalizeMaxBreadth: c = 1e3 } = e,
    a = {
      ...t,
      event_id: t.event_id || n.event_id || Se(),
      timestamp: t.timestamp || gt(),
    },
    u = n.integrations || e.integrations.map(g => g.name)
  ;(gl(a, e),
    Sl(a, u),
    s && s.emit('applyFrameMetadata', t),
    t.type === void 0 && _l(a, e.stackParser))
  const l = bl(r, n.captureContext)
  n.mechanism && Ct(a, n.mechanism)
  const d = s ? s.getEventProcessors() : [],
    p = ca().getScopeData()
  if (i) {
    const g = i.getScopeData()
    er(p, g)
  }
  if (l) {
    const g = l.getScopeData()
    er(p, g)
  }
  const f = [...(n.attachments || []), ...p.attachments]
  ;(f.length && (n.attachments = f), ul(a, p))
  const h = [...d, ...p.eventProcessors]
  return cl(h, a, n).then(
    g => (g && yl(g), typeof o == 'number' && o > 0 ? El(g, o, c) : g)
  )
}
function gl(e, t) {
  const { environment: n, release: r, dist: s, maxValueLength: i = 250 } = t
  ;((e.environment = e.environment || n || Os),
    !e.release && r && (e.release = r),
    !e.dist && s && (e.dist = s))
  const o = e.request
  o?.url && (o.url = Jn(o.url, i))
}
function _l(e, t) {
  const n = ml(t)
  e.exception?.values?.forEach(r => {
    r.stacktrace?.frames?.forEach(s => {
      s.filename && (s.debug_id = n[s.filename])
    })
  })
}
function yl(e) {
  const t = {}
  if (
    (e.exception?.values?.forEach(r => {
      r.stacktrace?.frames?.forEach(s => {
        s.debug_id &&
          (s.abs_path
            ? (t[s.abs_path] = s.debug_id)
            : s.filename && (t[s.filename] = s.debug_id),
          delete s.debug_id)
      })
    }),
    Object.keys(t).length === 0)
  )
    return
  ;((e.debug_meta = e.debug_meta || {}),
    (e.debug_meta.images = e.debug_meta.images || []))
  const n = e.debug_meta.images
  Object.entries(t).forEach(([r, s]) => {
    n.push({ type: 'sourcemap', code_file: r, debug_id: s })
  })
}
function Sl(e, t) {
  t.length > 0 &&
    ((e.sdk = e.sdk || {}),
    (e.sdk.integrations = [...(e.sdk.integrations || []), ...t]))
}
function El(e, t, n) {
  if (!e) return null
  const r = {
    ...e,
    ...(e.breadcrumbs && {
      breadcrumbs: e.breadcrumbs.map(s => ({
        ...s,
        ...(s.data && { data: Te(s.data, t, n) }),
      })),
    }),
    ...(e.user && { user: Te(e.user, t, n) }),
    ...(e.contexts && { contexts: Te(e.contexts, t, n) }),
    ...(e.extra && { extra: Te(e.extra, t, n) }),
  }
  return (
    e.contexts?.trace &&
      r.contexts &&
      ((r.contexts.trace = e.contexts.trace),
      e.contexts.trace.data &&
        (r.contexts.trace.data = Te(e.contexts.trace.data, t, n))),
    e.spans &&
      (r.spans = e.spans.map(s => ({
        ...s,
        ...(s.data && { data: Te(s.data, t, n) }),
      }))),
    e.contexts?.flags &&
      r.contexts &&
      (r.contexts.flags = Te(e.contexts.flags, 3, n)),
    r
  )
}
function bl(e, t) {
  if (!t) return e
  const n = e ? e.clone() : new Le()
  return (n.update(t), n)
}
function vl(e) {
  if (e)
    return Tl(e) ? { captureContext: e } : wl(e) ? { captureContext: e } : e
}
function Tl(e) {
  return e instanceof Le || typeof e == 'function'
}
const Il = [
  'user',
  'level',
  'extra',
  'contexts',
  'tags',
  'fingerprint',
  'propagationContext',
]
function wl(e) {
  return Object.keys(e).some(t => Il.includes(t))
}
function Da(e, t) {
  return X().captureException(e, vl(t))
}
function Pa(e, t) {
  return X().captureEvent(e, t)
}
function Fa(e, t) {
  Oe().setContext(e, t)
}
function kl() {
  const e = F()
  return e?.getOptions().enabled !== !1 && !!e?.getTransport()
}
function Rl(e) {
  Oe().addEventProcessor(e)
}
function ji(e) {
  const t = Oe(),
    n = X(),
    { userAgent: r } = $.navigator || {},
    s = ju({
      user: n.getUser() || t.getUser(),
      ...(r && { userAgent: r }),
      ...e,
    }),
    i = t.getSession()
  return (
    i?.status === 'ok' && xt(i, { status: 'exited' }),
    Ba(),
    t.setSession(s),
    s
  )
}
function Ba() {
  const e = Oe(),
    n = X().getSession() || e.getSession()
  ;(n && qu(n), $a(), e.setSession())
}
function $a() {
  const e = Oe(),
    t = F(),
    n = e.getSession()
  n && t && t.captureSession(n)
}
function qi(e = !1) {
  if (e) {
    Ba()
    return
  }
  $a()
}
const Cl = '7'
function xl(e) {
  const t = e.protocol ? `${e.protocol}:` : '',
    n = e.port ? `:${e.port}` : ''
  return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ''}/api/`
}
function Ml(e) {
  return `${xl(e)}${e.projectId}/envelope/`
}
function Al(e, t) {
  const n = { sentry_version: Cl }
  return (
    e.publicKey && (n.sentry_key = e.publicKey),
    t && (n.sentry_client = `${t.name}/${t.version}`),
    new URLSearchParams(n).toString()
  )
}
function Ol(e, t, n) {
  return t || `${Ml(e)}?${Al(e, n)}`
}
const Gi = []
function Nl(e) {
  const t = {}
  return (
    e.forEach(n => {
      const { name: r } = n,
        s = t[r]
      ;(s && !s.isDefaultInstance && n.isDefaultInstance) || (t[r] = n)
    }),
    Object.values(t)
  )
}
function Ll(e) {
  const t = e.defaultIntegrations || [],
    n = e.integrations
  t.forEach(s => {
    s.isDefaultInstance = !0
  })
  let r
  if (Array.isArray(n)) r = [...t, ...n]
  else if (typeof n == 'function') {
    const s = n(t)
    r = Array.isArray(s) ? s : [s]
  } else r = t
  return Nl(r)
}
function Dl(e, t) {
  const n = {}
  return (
    t.forEach(r => {
      r && Ua(e, r, n)
    }),
    n
  )
}
function Vi(e, t) {
  for (const n of t) n?.afterAllSetup && n.afterAllSetup(e)
}
function Ua(e, t, n) {
  if (n[t.name]) {
    v &&
      _.log(`Integration skipped because it was already installed: ${t.name}`)
    return
  }
  if (
    ((n[t.name] = t),
    Gi.indexOf(t.name) === -1 &&
      typeof t.setupOnce == 'function' &&
      (t.setupOnce(), Gi.push(t.name)),
    t.setup && typeof t.setup == 'function' && t.setup(e),
    typeof t.preprocessEvent == 'function')
  ) {
    const r = t.preprocessEvent.bind(t)
    e.on('preprocessEvent', (s, i) => r(s, i, e))
  }
  if (typeof t.processEvent == 'function') {
    const r = t.processEvent.bind(t),
      s = Object.assign((i, o) => r(i, o, e), { id: t.name })
    e.addEventProcessor(s)
  }
  v && _.log(`Integration installed: ${t.name}`)
}
function Pl(e, t, n) {
  const r = [
    { type: 'client_report' },
    { timestamp: gt(), discarded_events: e },
  ]
  return _t(t ? { dsn: t } : {}, [r])
}
function Ha(e) {
  const t = []
  e.message && t.push(e.message)
  try {
    const n = e.exception.values[e.exception.values.length - 1]
    n?.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`))
  } catch {}
  return t
}
function Fl(e) {
  const {
    trace_id: t,
    parent_span_id: n,
    span_id: r,
    status: s,
    origin: i,
    data: o,
    op: c,
  } = e.contexts?.trace ?? {}
  return {
    data: o ?? {},
    description: e.transaction,
    op: c,
    parent_span_id: n,
    span_id: r ?? '',
    start_timestamp: e.start_timestamp ?? 0,
    status: s,
    timestamp: e.timestamp,
    trace_id: t ?? '',
    origin: i,
    profile_id: o?.[xs],
    exclusive_time: o?.[Wt],
    measurements: e.measurements,
    is_segment: !0,
  }
}
function Bl(e) {
  return {
    type: 'transaction',
    timestamp: e.timestamp,
    start_timestamp: e.start_timestamp,
    transaction: e.description,
    contexts: {
      trace: {
        trace_id: e.trace_id,
        span_id: e.span_id,
        parent_span_id: e.parent_span_id,
        op: e.op,
        status: e.status,
        origin: e.origin,
        data: {
          ...e.data,
          ...(e.profile_id && { [xs]: e.profile_id }),
          ...(e.exclusive_time && { [Wt]: e.exclusive_time }),
        },
      },
    },
    measurements: e.measurements,
  }
}
const Yi = "Not capturing exception because it's already been captured.",
  Xi = 'Discarded session because of missing or non-string release',
  Wa = Symbol.for('SentryInternalError'),
  za = Symbol.for('SentryDoNotSendEventError')
function qn(e) {
  return { message: e, [Wa]: !0 }
}
function Pr(e) {
  return { message: e, [za]: !0 }
}
function Ki(e) {
  return !!e && typeof e == 'object' && Wa in e
}
function Ji(e) {
  return !!e && typeof e == 'object' && za in e
}
class $l {
  constructor(t) {
    if (
      ((this._options = t),
      (this._integrations = {}),
      (this._numProcessing = 0),
      (this._outcomes = {}),
      (this._hooks = {}),
      (this._eventProcessors = []),
      t.dsn
        ? (this._dsn = yd(t.dsn))
        : v && _.warn('No DSN provided, client will not send events.'),
      this._dsn)
    ) {
      const n = Ol(this._dsn, t.tunnel, t._metadata ? t._metadata.sdk : void 0)
      this._transport = t.transport({
        tunnel: this._options.tunnel,
        recordDroppedEvent: this.recordDroppedEvent.bind(this),
        ...t.transportOptions,
        url: n,
      })
    }
  }
  captureException(t, n, r) {
    const s = Se()
    if (wi(t)) return (v && _.log(Yi), s)
    const i = { event_id: s, ...n }
    return (
      this._process(
        this.eventFromException(t, i).then(o => this._captureEvent(o, i, r))
      ),
      i.event_id
    )
  }
  captureMessage(t, n, r, s) {
    const i = { event_id: Se(), ...r },
      o = gr(t) ? t : String(t),
      c = Rt(t) ? this.eventFromMessage(o, n, i) : this.eventFromException(t, i)
    return (this._process(c.then(a => this._captureEvent(a, i, s))), i.event_id)
  }
  captureEvent(t, n, r) {
    const s = Se()
    if (n?.originalException && wi(n.originalException))
      return (v && _.log(Yi), s)
    const i = { event_id: s, ...n },
      o = t.sdkProcessingMetadata || {},
      c = o.capturedSpanScope,
      a = o.capturedSpanIsolationScope
    return (this._process(this._captureEvent(t, i, c || r, a)), i.event_id)
  }
  captureSession(t) {
    ;(this.sendSession(t), xt(t, { init: !1 }))
  }
  getDsn() {
    return this._dsn
  }
  getOptions() {
    return this._options
  }
  getSdkMetadata() {
    return this._options._metadata
  }
  getTransport() {
    return this._transport
  }
  async flush(t) {
    const n = this._transport
    if (!n) return !0
    this.emit('flush')
    const r = await this._isClientDoneProcessing(t),
      s = await n.flush(t)
    return r && s
  }
  async close(t) {
    const n = await this.flush(t)
    return ((this.getOptions().enabled = !1), this.emit('close'), n)
  }
  getEventProcessors() {
    return this._eventProcessors
  }
  addEventProcessor(t) {
    this._eventProcessors.push(t)
  }
  init() {
    ;(this._isEnabled() ||
      this._options.integrations.some(({ name: t }) =>
        t.startsWith('Spotlight')
      )) &&
      this._setupIntegrations()
  }
  getIntegrationByName(t) {
    return this._integrations[t]
  }
  addIntegration(t) {
    const n = this._integrations[t.name]
    ;(Ua(this, t, this._integrations), n || Vi(this, [t]))
  }
  sendEvent(t, n = {}) {
    this.emit('beforeSendEvent', t, n)
    let r = jd(t, this._dsn, this._options._metadata, this._options.tunnel)
    for (const s of n.attachments || []) r = Pd(r, Ud(s))
    this.sendEnvelope(r).then(s => this.emit('afterSendEvent', t, s))
  }
  sendSession(t) {
    const { release: n, environment: r = Os } = this._options
    if ('aggregates' in t) {
      const i = t.attrs || {}
      if (!i.release && !n) {
        v && _.warn(Xi)
        return
      }
      ;((i.release = i.release || n),
        (i.environment = i.environment || r),
        (t.attrs = i))
    } else {
      if (!t.release && !n) {
        v && _.warn(Xi)
        return
      }
      ;((t.release = t.release || n), (t.environment = t.environment || r))
    }
    this.emit('beforeSendSession', t)
    const s = zd(t, this._dsn, this._options._metadata, this._options.tunnel)
    this.sendEnvelope(s)
  }
  recordDroppedEvent(t, n, r = 1) {
    if (this._options.sendClientReports) {
      const s = `${t}:${n}`
      ;(v && _.log(`Recording outcome: "${s}"${r > 1 ? ` (${r} times)` : ''}`),
        (this._outcomes[s] = (this._outcomes[s] || 0) + r))
    }
  }
  on(t, n) {
    const r = (this._hooks[t] = this._hooks[t] || new Set()),
      s = (...i) => n(...i)
    return (
      r.add(s),
      () => {
        r.delete(s)
      }
    )
  }
  emit(t, ...n) {
    const r = this._hooks[t]
    r && r.forEach(s => s(...n))
  }
  async sendEnvelope(t) {
    if ((this.emit('beforeEnvelope', t), this._isEnabled() && this._transport))
      try {
        return await this._transport.send(t)
      } catch (n) {
        return (v && _.error('Error while sending envelope:', n), {})
      }
    return (v && _.error('Transport disabled'), {})
  }
  _setupIntegrations() {
    const { integrations: t } = this._options
    ;((this._integrations = Dl(this, t)), Vi(this, t))
  }
  _updateSessionFromEvent(t, n) {
    let r = n.level === 'fatal',
      s = !1
    const i = n.exception?.values
    if (i) {
      s = !0
      for (const a of i)
        if (a.mechanism?.handled === !1) {
          r = !0
          break
        }
    }
    const o = t.status === 'ok'
    ;((o && t.errors === 0) || (o && r)) &&
      (xt(t, {
        ...(r && { status: 'crashed' }),
        errors: t.errors || Number(s || r),
      }),
      this.captureSession(t))
  }
  async _isClientDoneProcessing(t) {
    let n = 0
    for (; !t || n < t; ) {
      if ((await new Promise(r => setTimeout(r, 1)), !this._numProcessing))
        return !0
      n++
    }
    return !1
  }
  _isEnabled() {
    return this.getOptions().enabled !== !1 && this._transport !== void 0
  }
  _prepareEvent(t, n, r, s) {
    const i = this.getOptions(),
      o = Object.keys(this._integrations)
    return (
      !n.integrations && o?.length && (n.integrations = o),
      this.emit('preprocessEvent', t, n),
      t.type || s.setLastEventId(t.event_id || n.event_id),
      La(i, t, n, r, this, s).then(c => {
        if (c === null) return c
        ;(this.emit('postprocessEvent', c, n),
          (c.contexts = { trace: ua(r), ...c.contexts }))
        const a = Ns(this, r)
        return (
          (c.sdkProcessingMetadata = {
            dynamicSamplingContext: a,
            ...c.sdkProcessingMetadata,
          }),
          c
        )
      })
    )
  }
  _captureEvent(t, n = {}, r = X(), s = Oe()) {
    return (
      v &&
        ns(t) &&
        _.log(`Captured error event \`${Ha(t)[0] || '<unknown>'}\``),
      this._processEvent(t, n, r, s).then(
        i => i.event_id,
        i => {
          v &&
            (Ji(i) ? _.log(i.message) : Ki(i) ? _.warn(i.message) : _.warn(i))
        }
      )
    )
  }
  _processEvent(t, n, r, s) {
    const i = this.getOptions(),
      { sampleRate: o } = i,
      c = ja(t),
      a = ns(t),
      u = t.type || 'error',
      l = `before send for type \`${u}\``,
      d = typeof o > 'u' ? void 0 : pt(o)
    if (a && typeof d == 'number' && Math.random() > d)
      return (
        this.recordDroppedEvent('sample_rate', 'error'),
        Fs(
          Pr(
            `Discarding event because it's not included in the random sample (sampling rate = ${o})`
          )
        )
      )
    const p = u === 'replay_event' ? 'replay' : u
    return this._prepareEvent(t, n, r, s)
      .then(f => {
        if (f === null)
          throw (
            this.recordDroppedEvent('event_processor', p),
            Pr('An event processor returned `null`, will not send event.')
          )
        if (n.data && n.data.__sentry__ === !0) return f
        const m = Hl(this, i, f, n)
        return Ul(m, l)
      })
      .then(f => {
        if (f === null) {
          if ((this.recordDroppedEvent('before_send', p), c)) {
            const E = 1 + (t.spans || []).length
            this.recordDroppedEvent('before_send', 'span', E)
          }
          throw Pr(`${l} returned \`null\`, will not send event.`)
        }
        const h = r.getSession() || s.getSession()
        if ((a && h && this._updateSessionFromEvent(h, f), c)) {
          const g = f.sdkProcessingMetadata?.spanCountBeforeProcessing || 0,
            E = f.spans ? f.spans.length : 0,
            R = g - E
          R > 0 && this.recordDroppedEvent('before_send', 'span', R)
        }
        const m = f.transaction_info
        if (c && m && f.transaction !== t.transaction) {
          const g = 'custom'
          f.transaction_info = { ...m, source: g }
        }
        return (this.sendEvent(f, n), f)
      })
      .then(null, f => {
        throw Ji(f) || Ki(f)
          ? f
          : (this.captureException(f, {
              mechanism: { handled: !1, type: 'internal' },
              data: { __sentry__: !0 },
              originalException: f,
            }),
            qn(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${f}`))
      })
  }
  _process(t) {
    ;(this._numProcessing++,
      t.then(
        n => (this._numProcessing--, n),
        n => (this._numProcessing--, n)
      ))
  }
  _clearOutcomes() {
    const t = this._outcomes
    return (
      (this._outcomes = {}),
      Object.entries(t).map(([n, r]) => {
        const [s, i] = n.split(':')
        return { reason: s, category: i, quantity: r }
      })
    )
  }
  _flushOutcomes() {
    v && _.log('Flushing outcomes...')
    const t = this._clearOutcomes()
    if (t.length === 0) {
      v && _.log('No outcomes to send')
      return
    }
    if (!this._dsn) {
      v && _.log('No dsn provided, will not send outcomes')
      return
    }
    v && _.log('Sending outcomes:', t)
    const n = Pl(t, this._options.tunnel && gn(this._dsn))
    this.sendEnvelope(n)
  }
}
function Ul(e, t) {
  const n = `${t} must return \`null\` or a valid event.`
  if ($t(e))
    return e.then(
      r => {
        if (!tn(r) && r !== null) throw qn(n)
        return r
      },
      r => {
        throw qn(`${t} rejected with ${r}`)
      }
    )
  if (!tn(e) && e !== null) throw qn(n)
  return e
}
function Hl(e, t, n, r) {
  const {
    beforeSend: s,
    beforeSendTransaction: i,
    beforeSendSpan: o,
    ignoreSpans: c,
  } = t
  let a = n
  if (ns(a) && s) return s(a, r)
  if (ja(a)) {
    if (o || c) {
      const u = Fl(a)
      if (c?.length && Zn(u, c)) return null
      if (o) {
        const l = o(u)
        l ? (a = fn(n, Bl(l))) : Qr()
      }
      if (a.spans) {
        const l = [],
          d = a.spans
        for (const f of d) {
          if (c?.length && Zn(f, c)) {
            xd(d, f)
            continue
          }
          if (o) {
            const h = o(f)
            h ? l.push(h) : (Qr(), l.push(f))
          } else l.push(f)
        }
        const p = a.spans.length - l.length
        ;(p && e.recordDroppedEvent('before_send', 'span', p), (a.spans = l))
      }
    }
    if (i) {
      if (a.spans) {
        const u = a.spans.length
        a.sdkProcessingMetadata = {
          ...n.sdkProcessingMetadata,
          spanCountBeforeProcessing: u,
        }
      }
      return i(a, r)
    }
  }
  return a
}
function ns(e) {
  return e.type === void 0
}
function ja(e) {
  return e.type === 'transaction'
}
function Wl(e, t) {
  return t
    ? pn(t, () => {
        const n = le(),
          r = n ? ba(n) : ua(t)
        return [n ? De(n) : Ns(e, t), r]
      })
    : [void 0, void 0]
}
const zl = { trace: 1, debug: 5, info: 9, warn: 13, error: 17, fatal: 21 }
function jl(e) {
  return [
    {
      type: 'log',
      item_count: e.length,
      content_type: 'application/vnd.sentry.items.log+json',
    },
    { items: e },
  ]
}
function ql(e, t, n, r) {
  const s = {}
  return (
    t?.sdk && (s.sdk = { name: t.sdk.name, version: t.sdk.version }),
    n && r && (s.dsn = gn(r)),
    _t(s, [jl(e)])
  )
}
const Gl = 100
function Vl(e) {
  switch (typeof e) {
    case 'number':
      return Number.isInteger(e)
        ? { value: e, type: 'integer' }
        : { value: e, type: 'double' }
    case 'boolean':
      return { value: e, type: 'boolean' }
    case 'string':
      return { value: e, type: 'string' }
    default: {
      let t = ''
      try {
        t = JSON.stringify(e) ?? ''
      } catch {}
      return { value: t, type: 'string' }
    }
  }
}
function Fe(e, t, n, r = !0) {
  n && (!e[t] || r) && (e[t] = n)
}
function Yl(e, t) {
  const n = Bs(),
    r = qa(e)
  r === void 0
    ? n.set(e, [t])
    : (n.set(e, [...r, t]), r.length >= Gl && Gn(e, r))
}
function Qi(e, t = X(), n = Yl) {
  const r = t?.getClient() ?? F()
  if (!r) {
    v && _.warn('No client available to capture log.')
    return
  }
  const {
    release: s,
    environment: i,
    enableLogs: o = !1,
    beforeSendLog: c,
  } = r.getOptions()
  if (!o) {
    v && _.warn('logging option not enabled, log will not be captured.')
    return
  }
  const [, a] = Wl(r, t),
    u = { ...e.attributes },
    {
      user: { id: l, email: d, username: p },
    } = Xl(t)
  ;(Fe(u, 'user.id', l, !1),
    Fe(u, 'user.email', d, !1),
    Fe(u, 'user.name', p, !1),
    Fe(u, 'sentry.release', s),
    Fe(u, 'sentry.environment', i))
  const { name: f, version: h } = r.getSdkMetadata()?.sdk ?? {}
  ;(Fe(u, 'sentry.sdk.name', f), Fe(u, 'sentry.sdk.version', h))
  const m = r.getIntegrationByName('Replay')
  Fe(u, 'sentry.replay_id', m?.getReplayId())
  const g = e.message
  if (gr(g)) {
    const {
      __sentry_template_string__: S,
      __sentry_template_values__: w = [],
    } = g
    ;(w?.length && (u['sentry.message.template'] = S),
      w.forEach((L, B) => {
        u[`sentry.message.parameter.${B}`] = L
      }))
  }
  const E = nn(t)
  Fe(u, 'sentry.trace.parent_span_id', E?.spanContext().spanId)
  const R = { ...e, attributes: u }
  r.emit('beforeCaptureLog', R)
  const P = c ? Ze(() => c(R)) : R
  if (!P) {
    ;(r.recordDroppedEvent('before_send', 'log_item', 1),
      v && _.warn('beforeSendLog returned null, log will not be captured.'))
    return
  }
  const { level: N, message: M, attributes: T = {}, severityNumber: y } = P,
    I = {
      timestamp: ce(),
      level: N,
      body: M,
      trace_id: a?.trace_id,
      severity_number: y ?? zl[N],
      attributes: Object.keys(T).reduce((S, w) => ((S[w] = Vl(T[w])), S), {}),
    }
  ;(n(r, I), r.emit('afterCaptureLog', P))
}
function Gn(e, t) {
  const n = t ?? qa(e) ?? []
  if (n.length === 0) return
  const r = e.getOptions(),
    s = ql(n, r._metadata, r.tunnel, e.getDsn())
  ;(Bs().set(e, []), e.emit('flushLogs'), e.sendEnvelope(s))
}
function qa(e) {
  return Bs().get(e)
}
function Xl(e) {
  const t = ca().getScopeData()
  return (er(t, Oe().getScopeData()), er(t, e.getScopeData()), t)
}
function Bs() {
  return ln('clientToLogBufferMap', () => new WeakMap())
}
function Kl(e, t) {
  ;(t.debug === !0 &&
    (v
      ? _.enable()
      : Ze(() => {
          console.warn(
            '[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.'
          )
        })),
    X().update(t.initialScope))
  const r = new e(t)
  return (Jl(r), r.init(), r)
}
function Jl(e) {
  X().setClient(e)
}
const Ga = Symbol.for('SentryBufferFullError')
function Ql(e) {
  const t = []
  function n() {
    return e === void 0 || t.length < e
  }
  function r(o) {
    return t.splice(t.indexOf(o), 1)[0] || Promise.resolve(void 0)
  }
  function s(o) {
    if (!n()) return Fs(Ga)
    const c = o()
    return (
      t.indexOf(c) === -1 && t.push(c),
      c.then(() => r(c)).then(null, () => r(c).then(null, () => {})),
      c
    )
  }
  function i(o) {
    return new Ot((c, a) => {
      let u = t.length
      if (!u) return c(!0)
      const l = setTimeout(() => {
        o && o > 0 && c(!1)
      }, o)
      t.forEach(d => {
        Sr(d).then(() => {
          --u || (clearTimeout(l), c(!0))
        }, a)
      })
    })
  }
  return { $: t, add: s, drain: i }
}
const Zl = 60 * 1e3
function ef(e, t = Date.now()) {
  const n = parseInt(`${e}`, 10)
  if (!isNaN(n)) return n * 1e3
  const r = Date.parse(`${e}`)
  return isNaN(r) ? Zl : r - t
}
function tf(e, t) {
  return e[t] || e.all || 0
}
function Va(e, t, n = Date.now()) {
  return tf(e, t) > n
}
function Ya(e, { statusCode: t, headers: n }, r = Date.now()) {
  const s = { ...e },
    i = n?.['x-sentry-rate-limits'],
    o = n?.['retry-after']
  if (i)
    for (const c of i.trim().split(',')) {
      const [a, u, , , l] = c.split(':', 5),
        d = parseInt(a, 10),
        p = (isNaN(d) ? 60 : d) * 1e3
      if (!u) s.all = r + p
      else
        for (const f of u.split(';'))
          f === 'metric_bucket'
            ? (!l || l.split(';').includes('custom')) && (s[f] = r + p)
            : (s[f] = r + p)
    }
  else o ? (s.all = r + ef(o, r)) : t === 429 && (s.all = r + 60 * 1e3)
  return s
}
const nf = 64
function rf(e, t, n = Ql(e.bufferSize || nf)) {
  let r = {}
  const s = o => n.drain(o)
  function i(o) {
    const c = []
    if (
      (Li(o, (d, p) => {
        const f = Di(p)
        Va(r, f) ? e.recordDroppedEvent('ratelimit_backoff', f) : c.push(d)
      }),
      c.length === 0)
    )
      return Promise.resolve({})
    const a = _t(o[0], c),
      u = d => {
        Li(a, (p, f) => {
          e.recordDroppedEvent(d, Di(f))
        })
      },
      l = () =>
        t({ body: Fd(a) }).then(
          d => (
            d.statusCode !== void 0 &&
              (d.statusCode < 200 || d.statusCode >= 300) &&
              v &&
              _.warn(
                `Sentry responded with status code ${d.statusCode} to sent event.`
              ),
            (r = Ya(r, d)),
            d
          ),
          d => {
            throw (
              u('network_error'),
              v && _.error('Encountered error running transport request:', d),
              d
            )
          }
        )
    return n.add(l).then(
      d => d,
      d => {
        if (d === Ga)
          return (
            v && _.error('Skipped sending event because buffer is full.'),
            u('queue_overflow'),
            Promise.resolve({})
          )
        throw d
      }
    )
  }
  return { send: i, flush: s }
}
const sf = 'thismessage:/'
function $s(e) {
  return 'isRelative' in e
}
function Us(e, t) {
  const n = e.indexOf('://') <= 0 && e.indexOf('//') !== 0,
    r = n ? sf : void 0
  try {
    if ('canParse' in URL && !URL.canParse(e, r)) return
    const s = new URL(e, r)
    return n
      ? { isRelative: n, pathname: s.pathname, search: s.search, hash: s.hash }
      : s
  } catch {}
}
function of(e) {
  if ($s(e)) return e.pathname
  const t = new URL(e)
  return (
    (t.search = ''),
    (t.hash = ''),
    ['80', '443'].includes(t.port) && (t.port = ''),
    t.password && (t.password = '%filtered%'),
    t.username && (t.username = '%filtered%'),
    t.toString()
  )
}
function lt(e) {
  if (!e) return {}
  const t = e.match(
    /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/
  )
  if (!t) return {}
  const n = t[6] || '',
    r = t[8] || ''
  return {
    host: t[4],
    path: t[5],
    protocol: t[2],
    search: n,
    hash: r,
    relative: t[5] + n + r,
  }
}
function af(e) {
  return e.split(/[?#]/, 1)[0]
}
function cf(e, t) {
  const n = t?.getDsn(),
    r = t?.getOptions().tunnel
  return df(e, n) || uf(e, r)
}
function uf(e, t) {
  return t ? Zi(e) === Zi(t) : !1
}
function df(e, t) {
  const n = Us(e)
  return !n || $s(n)
    ? !1
    : t
      ? n.host.includes(t.host) && /(^|&|\?)sentry_key=/.test(n.search)
      : !1
}
function Zi(e) {
  return e[e.length - 1] === '/' ? e.slice(0, -1) : e
}
function lf(e) {
  'aggregates' in e
    ? e.attrs?.ip_address === void 0 &&
      (e.attrs = { ...e.attrs, ip_address: '{{auto}}' })
    : e.ipAddress === void 0 && (e.ipAddress = '{{auto}}')
}
function Xa(e, t, n = [t], r = 'npm') {
  const s = e._metadata || {}
  ;(s.sdk ||
    (s.sdk = {
      name: `sentry.javascript.${t}`,
      packages: n.map(i => ({ name: `${r}:@sentry/${i}`, version: ct })),
      version: ct,
    }),
    (e._metadata = s))
}
function Ka(e = {}) {
  const t = e.client || F()
  if (!kl() || !t) return {}
  const n = mt(),
    r = Ht(n)
  if (r.getTraceData) return r.getTraceData(e)
  const s = e.scope || X(),
    i = e.span || le(),
    o = i ? Td(i) : ff(s),
    c = i ? De(i) : Ns(t, s),
    a = cd(c)
  if (!_a.test(o))
    return (_.warn('Invalid sentry-trace data. Cannot generate trace data'), {})
  const l = { 'sentry-trace': o, baggage: a }
  if (e.propagateTraceparent) {
    const d = i ? Id(i) : pf(s)
    d && (l.traceparent = d)
  }
  return l
}
function ff(e) {
  const {
    traceId: t,
    sampled: n,
    propagationSpanId: r,
  } = e.getPropagationContext()
  return ya(t, r, n)
}
function pf(e) {
  const {
    traceId: t,
    sampled: n,
    propagationSpanId: r,
  } = e.getPropagationContext()
  return Sa(t, r, n)
}
function hf(e, t, n) {
  let r, s, i
  const o = n?.maxWait ? Math.max(n.maxWait, t) : 0,
    c = n?.setTimeoutImpl || setTimeout
  function a() {
    return (u(), (r = e()), r)
  }
  function u() {
    ;(s !== void 0 && clearTimeout(s),
      i !== void 0 && clearTimeout(i),
      (s = i = void 0))
  }
  function l() {
    return s !== void 0 || i !== void 0 ? a() : r
  }
  function d() {
    return (
      s && clearTimeout(s),
      (s = c(a, t)),
      o && i === void 0 && (i = c(a, o)),
      r
    )
  }
  return ((d.cancel = u), (d.flush = l), d)
}
const mf = 100
function Je(e, t) {
  const n = F(),
    r = Oe()
  if (!n) return
  const { beforeBreadcrumb: s = null, maxBreadcrumbs: i = mf } = n.getOptions()
  if (i <= 0) return
  const c = { timestamp: gt(), ...e },
    a = s ? Ze(() => s(c, t)) : c
  a !== null &&
    (n.emit && n.emit('beforeAddBreadcrumb', a, t), r.addBreadcrumb(a, i))
}
let eo
const gf = 'FunctionToString',
  to = new WeakMap(),
  _f = () => ({
    name: gf,
    setupOnce() {
      eo = Function.prototype.toString
      try {
        Function.prototype.toString = function (...e) {
          const t = Rs(this),
            n = to.has(F()) && t !== void 0 ? t : this
          return eo.apply(n, e)
        }
      } catch {}
    },
    setup(e) {
      to.set(e, !0)
    },
  }),
  yf = _f,
  Sf = [
    /^Script error\.?$/,
    /^Javascript error: Script error\.? on line 0$/,
    /^ResizeObserver loop completed with undelivered notifications.$/,
    /^Cannot redefine property: googletag$/,
    /^Can't find variable: gmo$/,
    /^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
    `can't redefine non-configurable property "solana"`,
    "vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)",
    "Can't find variable: _AutofillCallbackHandler",
    /^Non-Error promise rejection captured with value: Object Not Found Matching Id:\d+, MethodName:simulateEvent, ParamCount:\d+$/,
    /^Java exception was raised during method invocation$/,
  ],
  Ef = 'EventFilters',
  bf = (e = {}) => {
    let t
    return {
      name: Ef,
      setup(n) {
        const r = n.getOptions()
        t = no(e, r)
      },
      processEvent(n, r, s) {
        if (!t) {
          const i = s.getOptions()
          t = no(e, i)
        }
        return Tf(n, t) ? null : n
      },
    }
  },
  vf = (e = {}) => ({ ...bf(e), name: 'InboundFilters' })
function no(e = {}, t = {}) {
  return {
    allowUrls: [...(e.allowUrls || []), ...(t.allowUrls || [])],
    denyUrls: [...(e.denyUrls || []), ...(t.denyUrls || [])],
    ignoreErrors: [
      ...(e.ignoreErrors || []),
      ...(t.ignoreErrors || []),
      ...(e.disableErrorDefaults ? [] : Sf),
    ],
    ignoreTransactions: [
      ...(e.ignoreTransactions || []),
      ...(t.ignoreTransactions || []),
    ],
  }
}
function Tf(e, t) {
  if (e.type) {
    if (e.type === 'transaction' && wf(e, t.ignoreTransactions))
      return (
        v &&
          _.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${it(e)}`),
        !0
      )
  } else {
    if (If(e, t.ignoreErrors))
      return (
        v &&
          _.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${it(e)}`),
        !0
      )
    if (xf(e))
      return (
        v &&
          _.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${it(e)}`),
        !0
      )
    if (kf(e, t.denyUrls))
      return (
        v &&
          _.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${it(e)}.
Url: ${tr(e)}`),
        !0
      )
    if (!Rf(e, t.allowUrls))
      return (
        v &&
          _.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${it(e)}.
Url: ${tr(e)}`),
        !0
      )
  }
  return !1
}
function If(e, t) {
  return t?.length ? Ha(e).some(n => Ue(n, t)) : !1
}
function wf(e, t) {
  if (!t?.length) return !1
  const n = e.transaction
  return n ? Ue(n, t) : !1
}
function kf(e, t) {
  if (!t?.length) return !1
  const n = tr(e)
  return n ? Ue(n, t) : !1
}
function Rf(e, t) {
  if (!t?.length) return !0
  const n = tr(e)
  return n ? Ue(n, t) : !0
}
function Cf(e = []) {
  for (let t = e.length - 1; t >= 0; t--) {
    const n = e[t]
    if (n && n.filename !== '<anonymous>' && n.filename !== '[native code]')
      return n.filename || null
  }
  return null
}
function tr(e) {
  try {
    const n = [...(e.exception?.values ?? [])]
      .reverse()
      .find(
        r => r.mechanism?.parent_id === void 0 && r.stacktrace?.frames?.length
      )?.stacktrace?.frames
    return n ? Cf(n) : null
  } catch {
    return (v && _.error(`Cannot extract url for event ${it(e)}`), null)
  }
}
function xf(e) {
  return e.exception?.values?.length
    ? !e.message &&
        !e.exception.values.some(
          t => t.stacktrace || (t.type && t.type !== 'Error') || t.value
        )
    : !1
}
function Mf(e, t, n, r, s, i) {
  if (!s.exception?.values || !i || !je(i.originalException, Error)) return
  const o =
    s.exception.values.length > 0
      ? s.exception.values[s.exception.values.length - 1]
      : void 0
  o &&
    (s.exception.values = rs(
      e,
      t,
      r,
      i.originalException,
      n,
      s.exception.values,
      o,
      0
    ))
}
function rs(e, t, n, r, s, i, o, c) {
  if (i.length >= n + 1) return i
  let a = [...i]
  if (je(r[s], Error)) {
    ro(o, c)
    const u = e(t, r[s]),
      l = a.length
    ;(so(u, s, l, c), (a = rs(e, t, n, r[s], s, [u, ...a], u, l)))
  }
  return (
    Array.isArray(r.errors) &&
      r.errors.forEach((u, l) => {
        if (je(u, Error)) {
          ro(o, c)
          const d = e(t, u),
            p = a.length
          ;(so(d, `errors[${l}]`, p, c),
            (a = rs(e, t, n, u, s, [d, ...a], d, p)))
        }
      }),
    a
  )
}
function ro(e, t) {
  e.mechanism = {
    handled: !0,
    type: 'auto.core.linked_errors',
    ...e.mechanism,
    ...(e.type === 'AggregateError' && { is_exception_group: !0 }),
    exception_id: t,
  }
}
function so(e, t, n, r) {
  e.mechanism = {
    handled: !0,
    ...e.mechanism,
    type: 'chained',
    source: t,
    exception_id: n,
    parent_id: r,
  }
}
function Ja(e) {
  const t = 'console'
  ;(et(t, e), tt(t, Af))
}
function Af() {
  'console' in $ &&
    Vo.forEach(function (e) {
      e in $.console &&
        ge($.console, e, function (t) {
          return (
            (Kn[e] = t),
            function (...n) {
              ;(Ie('console', { args: n, level: e }),
                Kn[e]?.apply($.console, n))
            }
          )
        })
    })
}
function Qa(e) {
  return e === 'warn'
    ? 'warning'
    : ['fatal', 'error', 'warning', 'log', 'info', 'debug'].includes(e)
      ? e
      : 'log'
}
const Of = 'Dedupe',
  Nf = () => {
    let e
    return {
      name: Of,
      processEvent(t) {
        if (t.type) return t
        try {
          if (Df(t, e))
            return (
              v &&
                _.warn(
                  'Event dropped due to being a duplicate of previously captured event.'
                ),
              null
            )
        } catch {}
        return (e = t)
      },
    }
  },
  Lf = Nf
function Df(e, t) {
  return t ? !!(Pf(e, t) || Ff(e, t)) : !1
}
function Pf(e, t) {
  const n = e.message,
    r = t.message
  return !(
    (!n && !r) ||
    (n && !r) ||
    (!n && r) ||
    n !== r ||
    !ec(e, t) ||
    !Za(e, t)
  )
}
function Ff(e, t) {
  const n = io(t),
    r = io(e)
  return !(
    !n ||
    !r ||
    n.type !== r.type ||
    n.value !== r.value ||
    !ec(e, t) ||
    !Za(e, t)
  )
}
function Za(e, t) {
  let n = Si(e),
    r = Si(t)
  if (!n && !r) return !0
  if ((n && !r) || (!n && r) || ((n = n), (r = r), r.length !== n.length))
    return !1
  for (let s = 0; s < r.length; s++) {
    const i = r[s],
      o = n[s]
    if (
      i.filename !== o.filename ||
      i.lineno !== o.lineno ||
      i.colno !== o.colno ||
      i.function !== o.function
    )
      return !1
  }
  return !0
}
function ec(e, t) {
  let n = e.fingerprint,
    r = t.fingerprint
  if (!n && !r) return !0
  if ((n && !r) || (!n && r)) return !1
  ;((n = n), (r = r))
  try {
    return n.join('') === r.join('')
  } catch {
    return !1
  }
}
function io(e) {
  return e.exception?.values?.[0]
}
function Bf(e, t, n, r, s) {
  if (!e.fetchData) return
  const { method: i, url: o } = e.fetchData,
    c = Ae() && t(o)
  if (e.endTimestamp && c) {
    const f = e.fetchData.__span
    if (!f) return
    const h = r[f]
    h && (Uf(h, e), delete r[f])
    return
  }
  const { spanOrigin: a = 'auto.http.browser', propagateTraceparent: u = !1 } =
      typeof s == 'object' ? s : { spanOrigin: s },
    l = !!le(),
    d = c && l ? zt(Wf(o, i, a)) : new Ke()
  if (
    ((e.fetchData.__span = d.spanContext().spanId),
    (r[d.spanContext().spanId] = d),
    n(e.fetchData.url))
  ) {
    const f = e.args[0],
      h = e.args[1] || {},
      m = $f(f, h, Ae() && l ? d : void 0, u)
    m && ((e.args[1] = h), (h.headers = m))
  }
  const p = F()
  if (p) {
    const f = {
      input: e.args,
      response: e.response,
      startTimestamp: e.startTimestamp,
      endTimestamp: e.endTimestamp,
    }
    p.emit('beforeOutgoingRequestSpan', d, f)
  }
  return d
}
function $f(e, t, n, r) {
  const s = Ka({ span: n, propagateTraceparent: r }),
    i = s['sentry-trace'],
    o = s.baggage,
    c = s.traceparent
  if (!i) return
  const a = t.headers || (na(e) ? e.headers : void 0)
  if (a)
    if (Hf(a)) {
      const u = new Headers(a)
      if (
        (u.get('sentry-trace') || u.set('sentry-trace', i),
        r && c && !u.get('traceparent') && u.set('traceparent', c),
        o)
      ) {
        const l = u.get('baggage')
        l ? Mn(l) || u.set('baggage', `${l},${o}`) : u.set('baggage', o)
      }
      return u
    } else if (Array.isArray(a)) {
      const u = [...a]
      ;(a.find(d => d[0] === 'sentry-trace') || u.push(['sentry-trace', i]),
        r &&
          c &&
          !a.find(d => d[0] === 'traceparent') &&
          u.push(['traceparent', c]))
      const l = a.find(d => d[0] === 'baggage' && Mn(d[1]))
      return (o && !l && u.push(['baggage', o]), u)
    } else {
      const u = 'sentry-trace' in a ? a['sentry-trace'] : void 0,
        l = 'traceparent' in a ? a.traceparent : void 0,
        d = 'baggage' in a ? a.baggage : void 0,
        p = d ? (Array.isArray(d) ? [...d] : [d]) : [],
        f = d && (Array.isArray(d) ? d.find(m => Mn(m)) : Mn(d))
      o && !f && p.push(o)
      const h = {
        ...a,
        'sentry-trace': u ?? i,
        baggage: p.length > 0 ? p.join(',') : void 0,
      }
      return (r && c && !l && (h.traceparent = c), h)
    }
  else return { ...s }
}
function Uf(e, t) {
  if (t.response) {
    fa(e, t.response.status)
    const n = t.response?.headers?.get('content-length')
    if (n) {
      const r = parseInt(n)
      r > 0 && e.setAttribute('http.response_content_length', r)
    }
  } else t.error && e.setStatus({ code: ae, message: 'internal_error' })
  e.end()
}
function Mn(e) {
  return e.split(',').some(t => t.trim().startsWith(Ms))
}
function Hf(e) {
  return typeof Headers < 'u' && je(e, Headers)
}
function Wf(e, t, n) {
  const r = Us(e)
  return { name: r ? `${t} ${of(r)}` : t, attributes: zf(e, r, t, n) }
}
function zf(e, t, n, r) {
  const s = {
    url: e,
    type: 'fetch',
    'http.method': n,
    [oe]: r,
    [Ge]: 'http.client',
  }
  return (
    t &&
      ($s(t) || ((s['http.url'] = t.href), (s['server.address'] = t.host)),
      t.search && (s['http.query'] = t.search),
      t.hash && (s['http.fragment'] = t.hash)),
    s
  )
}
function oo(e, t, n) {
  return 'util' in $ && typeof $.util.format == 'function'
    ? $.util.format(...e)
    : jf(e, t, n)
}
function jf(e, t, n) {
  return e.map(r => (Rt(r) ? String(r) : JSON.stringify(Te(r, t, n)))).join(' ')
}
function qf(e) {
  return /%[sdifocO]/.test(e)
}
function Gf(e, t) {
  const n = {},
    r = new Array(t.length).fill('{}').join(' ')
  return (
    (n['sentry.message.template'] = `${e} ${r}`),
    t.forEach((s, i) => {
      n[`sentry.message.parameter.${i}`] = s
    }),
    n
  )
}
const Vf = 'ConsoleLogs',
  ao = { [oe]: 'auto.console.logging' },
  Yf = (e = {}) => {
    const t = e.levels || Vo
    return {
      name: Vf,
      setup(n) {
        const {
          enableLogs: r,
          normalizeDepth: s = 3,
          normalizeMaxBreadth: i = 1e3,
        } = n.getOptions()
        if (!r) {
          v &&
            _.warn(
              '`enableLogs` is not enabled, ConsoleLogs integration disabled'
            )
          return
        }
        Ja(({ args: o, level: c }) => {
          if (F() !== n || !t.includes(c)) return
          const a = o[0],
            u = o.slice(1)
          if (c === 'assert') {
            if (!a) {
              const f =
                u.length > 0
                  ? `Assertion failed: ${oo(u, s, i)}`
                  : 'Assertion failed'
              Qi({ level: 'error', message: f, attributes: ao })
            }
            return
          }
          const l = c === 'log',
            d = o.length > 1 && typeof o[0] == 'string' && !qf(o[0]),
            p = { ...ao, ...(d ? Gf(a, u) : {}) }
          Qi({
            level: l ? 'info' : c,
            message: oo(o, s, i),
            severityNumber: l ? 10 : void 0,
            attributes: p,
          })
        })
      },
    }
  },
  Xf = Yf
function tc(e) {
  if (e !== void 0)
    return e >= 400 && e < 500 ? 'warning' : e >= 500 ? 'error' : void 0
}
const sn = $
function Kf() {
  return 'history' in sn && !!sn.history
}
function Jf() {
  if (!('fetch' in sn)) return !1
  try {
    return (
      new Headers(),
      new Request('http://www.example.com'),
      new Response(),
      !0
    )
  } catch {
    return !1
  }
}
function ss(e) {
  return (
    e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString())
  )
}
function Qf() {
  if (typeof EdgeRuntime == 'string') return !0
  if (!Jf()) return !1
  if (ss(sn.fetch)) return !0
  let e = !1
  const t = sn.document
  if (t && typeof t.createElement == 'function')
    try {
      const n = t.createElement('iframe')
      ;((n.hidden = !0),
        t.head.appendChild(n),
        n.contentWindow?.fetch && (e = ss(n.contentWindow.fetch)),
        t.head.removeChild(n))
    } catch (n) {
      v &&
        _.warn(
          'Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ',
          n
        )
    }
  return e
}
function nc(e, t) {
  const n = 'fetch'
  ;(et(n, e), tt(n, () => rc(void 0, t)))
}
function Zf(e) {
  const t = 'fetch-body-resolved'
  ;(et(t, e), tt(t, () => rc(tp)))
}
function rc(e, t = !1) {
  ;(t && !Qf()) ||
    ge($, 'fetch', function (n) {
      return function (...r) {
        const s = new Error(),
          { method: i, url: o } = np(r),
          c = {
            args: r,
            fetchData: { method: i, url: o },
            startTimestamp: ce() * 1e3,
            virtualError: s,
            headers: rp(r),
          }
        return (
          e || Ie('fetch', { ...c }),
          n.apply($, r).then(
            async a => (
              e
                ? e(a)
                : Ie('fetch', { ...c, endTimestamp: ce() * 1e3, response: a }),
              a
            ),
            a => {
              if (
                (Ie('fetch', { ...c, endTimestamp: ce() * 1e3, error: a }),
                ws(a) &&
                  a.stack === void 0 &&
                  ((a.stack = s.stack), Ee(a, 'framesToPop', 1)),
                a instanceof TypeError &&
                  (a.message === 'Failed to fetch' ||
                    a.message === 'Load failed' ||
                    a.message ===
                      'NetworkError when attempting to fetch resource.'))
              )
                try {
                  const u = new URL(c.fetchData.url)
                  a.message = `${a.message} (${u.host})`
                } catch {}
              throw a
            }
          )
        )
      }
    })
}
async function ep(e, t) {
  if (e?.body) {
    const n = e.body,
      r = n.getReader(),
      s = setTimeout(() => {
        n.cancel().then(null, () => {})
      }, 90 * 1e3)
    let i = !0
    for (; i; ) {
      let o
      try {
        o = setTimeout(() => {
          n.cancel().then(null, () => {})
        }, 5e3)
        const { done: c } = await r.read()
        ;(clearTimeout(o), c && (t(), (i = !1)))
      } catch {
        i = !1
      } finally {
        clearTimeout(o)
      }
    }
    ;(clearTimeout(s), r.releaseLock(), n.cancel().then(null, () => {}))
  }
}
function tp(e) {
  let t
  try {
    t = e.clone()
  } catch {
    return
  }
  ep(t, () => {
    Ie('fetch-body-resolved', { endTimestamp: ce() * 1e3, response: e })
  })
}
function is(e, t) {
  return !!e && typeof e == 'object' && !!e[t]
}
function co(e) {
  return typeof e == 'string'
    ? e
    : e
      ? is(e, 'url')
        ? e.url
        : e.toString
          ? e.toString()
          : ''
      : ''
}
function np(e) {
  if (e.length === 0) return { method: 'GET', url: '' }
  if (e.length === 2) {
    const [n, r] = e
    return {
      url: co(n),
      method: is(r, 'method') ? String(r.method).toUpperCase() : 'GET',
    }
  }
  const t = e[0]
  return {
    url: co(t),
    method: is(t, 'method') ? String(t.method).toUpperCase() : 'GET',
  }
}
function rp(e) {
  const [t, n] = e
  try {
    if (typeof n == 'object' && n !== null && 'headers' in n && n.headers)
      return new Headers(n.headers)
    if (na(t)) return new Headers(t.headers)
  } catch {}
}
function sp() {
  return typeof __SENTRY_BROWSER_BUNDLE__ < 'u' && !!__SENTRY_BROWSER_BUNDLE__
}
function ip() {
  return 'npm'
}
function op() {
  return (
    !sp() &&
    Object.prototype.toString.call(typeof process < 'u' ? process : 0) ===
      '[object process]'
  )
}
function uo() {
  return typeof window < 'u' && (!op() || ap())
}
function ap() {
  return $.process?.type === 'renderer'
}
const j = $
let os = 0
function sc() {
  return os > 0
}
function cp() {
  ;(os++,
    setTimeout(() => {
      os--
    }))
}
function Nt(e, t = {}) {
  function n(s) {
    return typeof s == 'function'
  }
  if (!n(e)) return e
  try {
    const s = e.__sentry_wrapped__
    if (s) return typeof s == 'function' ? s : e
    if (Rs(e)) return e
  } catch {
    return e
  }
  const r = function (...s) {
    try {
      const i = s.map(o => Nt(o, t))
      return e.apply(this, i)
    } catch (i) {
      throw (
        cp(),
        pn(o => {
          ;(o.addEventProcessor(
            c => (
              t.mechanism && (Xr(c, void 0), Ct(c, t.mechanism)),
              (c.extra = { ...c.extra, arguments: s }),
              c
            )
          ),
            Da(i))
        }),
        i
      )
    }
  }
  try {
    for (const s in e)
      Object.prototype.hasOwnProperty.call(e, s) && (r[s] = e[s])
  } catch {}
  ;(sa(r, e), Ee(e, '__sentry_wrapped__', r))
  try {
    Object.getOwnPropertyDescriptor(r, 'name').configurable &&
      Object.defineProperty(r, 'name', {
        get() {
          return e.name
        },
      })
  } catch {}
  return r
}
function Hs() {
  const e = Ut(),
    { referrer: t } = j.document || {},
    { userAgent: n } = j.navigator || {},
    r = { ...(t && { Referer: t }), ...(n && { 'User-Agent': n }) }
  return { url: e, headers: r }
}
function Ws(e, t) {
  const n = zs(e, t),
    r = { type: pp(t), value: hp(t) }
  return (
    n.length && (r.stacktrace = { frames: n }),
    r.type === void 0 &&
      r.value === '' &&
      (r.value = 'Unrecoverable error caught'),
    r
  )
}
function up(e, t, n, r) {
  const i = F()?.getOptions().normalizeDepth,
    o = Sp(t),
    c = { __serialized__: Ra(t, i) }
  if (o) return { exception: { values: [Ws(e, o)] }, extra: c }
  const a = {
    exception: {
      values: [
        {
          type: _r(t) ? t.constructor.name : r ? 'UnhandledRejection' : 'Error',
          value: _p(t, { isUnhandledRejection: r }),
        },
      ],
    },
    extra: c,
  }
  if (n) {
    const u = zs(e, n)
    u.length && (a.exception.values[0].stacktrace = { frames: u })
  }
  return a
}
function Fr(e, t) {
  return { exception: { values: [Ws(e, t)] } }
}
function zs(e, t) {
  const n = t.stacktrace || t.stack || '',
    r = lp(t),
    s = fp(t)
  try {
    return e(n, r, s)
  } catch {}
  return []
}
const dp = /Minified React error #\d+;/i
function lp(e) {
  return e && dp.test(e.message) ? 1 : 0
}
function fp(e) {
  return typeof e.framesToPop == 'number' ? e.framesToPop : 0
}
function ic(e) {
  return typeof WebAssembly < 'u' && typeof WebAssembly.Exception < 'u'
    ? e instanceof WebAssembly.Exception
    : !1
}
function pp(e) {
  const t = e?.name
  return !t && ic(e)
    ? e.message && Array.isArray(e.message) && e.message.length == 2
      ? e.message[0]
      : 'WebAssembly.Exception'
    : t
}
function hp(e) {
  const t = e?.message
  return ic(e)
    ? Array.isArray(e.message) && e.message.length == 2
      ? e.message[1]
      : 'wasm exception'
    : t
      ? t.error && typeof t.error.message == 'string'
        ? t.error.message
        : t
      : 'No error message'
}
function mp(e, t, n, r) {
  const s = n?.syntheticException || void 0,
    i = js(e, t, s, r)
  return (
    Ct(i),
    (i.level = 'error'),
    n?.event_id && (i.event_id = n.event_id),
    Sr(i)
  )
}
function gp(e, t, n = 'info', r, s) {
  const i = r?.syntheticException || void 0,
    o = as(e, t, i, s)
  return ((o.level = n), r?.event_id && (o.event_id = r.event_id), Sr(o))
}
function js(e, t, n, r, s) {
  let i
  if (ea(t) && t.error) return Fr(e, t.error)
  if (bi(t) || Nu(t)) {
    const o = t
    if ('stack' in t) i = Fr(e, t)
    else {
      const c = o.name || (bi(o) ? 'DOMError' : 'DOMException'),
        a = o.message ? `${c}: ${o.message}` : c
      ;((i = as(e, a, n, r)), Xr(i, a))
    }
    return (
      'code' in o && (i.tags = { ...i.tags, 'DOMException.code': `${o.code}` }),
      i
    )
  }
  return ws(t)
    ? Fr(e, t)
    : tn(t) || _r(t)
      ? ((i = up(e, t, n, s)), Ct(i, { synthetic: !0 }), i)
      : ((i = as(e, t, n, r)), Xr(i, `${t}`), Ct(i, { synthetic: !0 }), i)
}
function as(e, t, n, r) {
  const s = {}
  if (r && n) {
    const i = zs(e, n)
    ;(i.length &&
      (s.exception = { values: [{ value: t, stacktrace: { frames: i } }] }),
      Ct(s, { synthetic: !0 }))
  }
  if (gr(t)) {
    const { __sentry_template_string__: i, __sentry_template_values__: o } = t
    return ((s.logentry = { message: i, params: o }), s)
  }
  return ((s.message = t), s)
}
function _p(e, { isUnhandledRejection: t }) {
  const n = $u(e),
    r = t ? 'promise rejection' : 'exception'
  return ea(e)
    ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\``
    : _r(e)
      ? `Event \`${yp(e)}\` (type=${e.type}) captured as ${r}`
      : `Object captured as ${r} with keys: ${n}`
}
function yp(e) {
  try {
    const t = Object.getPrototypeOf(e)
    return t ? t.constructor.name : void 0
  } catch {}
}
function Sp(e) {
  for (const t in e)
    if (Object.prototype.hasOwnProperty.call(e, t)) {
      const n = e[t]
      if (n instanceof Error) return n
    }
}
const Ep = 5e3
class bp extends $l {
  constructor(t) {
    const n = vp(t),
      r = j.SENTRY_SDK_SOURCE || ip()
    ;(Xa(n, 'browser', ['browser'], r),
      n._metadata?.sdk &&
        (n._metadata.sdk.settings = {
          infer_ip: n.sendDefaultPii ? 'auto' : 'never',
          ...n._metadata.sdk.settings,
        }),
      super(n))
    const {
      sendDefaultPii: s,
      sendClientReports: i,
      enableLogs: o,
    } = this._options
    ;(j.document &&
      (i || o) &&
      j.document.addEventListener('visibilitychange', () => {
        j.document.visibilityState === 'hidden' &&
          (i && this._flushOutcomes(), o && Gn(this))
      }),
      o &&
        (this.on('flush', () => {
          Gn(this)
        }),
        this.on('afterCaptureLog', () => {
          ;(this._logFlushIdleTimeout &&
            clearTimeout(this._logFlushIdleTimeout),
            (this._logFlushIdleTimeout = setTimeout(() => {
              Gn(this)
            }, Ep)))
        })),
      s && this.on('beforeSendSession', lf))
  }
  eventFromException(t, n) {
    return mp(this._options.stackParser, t, n, this._options.attachStacktrace)
  }
  eventFromMessage(t, n = 'info', r) {
    return gp(
      this._options.stackParser,
      t,
      n,
      r,
      this._options.attachStacktrace
    )
  }
  _prepareEvent(t, n, r, s) {
    return (
      (t.platform = t.platform || 'javascript'),
      super._prepareEvent(t, n, r, s)
    )
  }
}
function vp(e) {
  return {
    release:
      typeof __SENTRY_RELEASE__ == 'string'
        ? __SENTRY_RELEASE__
        : j.SENTRY_RELEASE?.id,
    sendClientReports: !0,
    parentSpanIsAlwaysRootSpan: !0,
    ...e,
  }
}
const Lt = typeof __SENTRY_DEBUG__ > 'u' || __SENTRY_DEBUG__,
  O = $,
  Tp = (e, t) => (e > t[1] ? 'poor' : e > t[0] ? 'needs-improvement' : 'good'),
  _n = (e, t, n, r) => {
    let s, i
    return o => {
      t.value >= 0 &&
        (o || r) &&
        ((i = t.value - (s ?? 0)),
        (i || s === void 0) &&
          ((s = t.value), (t.delta = i), (t.rating = Tp(t.value, n)), e(t)))
    }
  },
  Ip = () =>
    `v5-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`,
  yn = (e = !0) => {
    const t = O.performance?.getEntriesByType?.('navigation')[0]
    if (!e || (t && t.responseStart > 0 && t.responseStart < performance.now()))
      return t
  },
  jt = () => yn()?.activationStart ?? 0,
  Sn = (e, t = -1) => {
    const n = yn()
    let r = 'navigate'
    return (
      n &&
        (O.document?.prerendering || jt() > 0
          ? (r = 'prerender')
          : O.document?.wasDiscarded
            ? (r = 'restore')
            : n.type && (r = n.type.replace(/_/g, '-'))),
      {
        name: e,
        value: t,
        rating: 'good',
        delta: 0,
        entries: [],
        id: Ip(),
        navigationType: r,
      }
    )
  },
  Br = new WeakMap()
function qs(e, t) {
  return (Br.get(e) || Br.set(e, new t()), Br.get(e))
}
class nr {
  constructor() {
    ;(nr.prototype.__init.call(this), nr.prototype.__init2.call(this))
  }
  __init() {
    this._sessionValue = 0
  }
  __init2() {
    this._sessionEntries = []
  }
  _processEntry(t) {
    if (t.hadRecentInput) return
    const n = this._sessionEntries[0],
      r = this._sessionEntries[this._sessionEntries.length - 1]
    ;(this._sessionValue &&
    n &&
    r &&
    t.startTime - r.startTime < 1e3 &&
    t.startTime - n.startTime < 5e3
      ? ((this._sessionValue += t.value), this._sessionEntries.push(t))
      : ((this._sessionValue = t.value), (this._sessionEntries = [t])),
      this._onAfterProcessingUnexpectedShift?.(t))
  }
}
const qt = (e, t, n = {}) => {
    try {
      if (PerformanceObserver.supportedEntryTypes.includes(e)) {
        const r = new PerformanceObserver(s => {
          Promise.resolve().then(() => {
            t(s.getEntries())
          })
        })
        return (r.observe({ type: e, buffered: !0, ...n }), r)
      }
    } catch {}
  },
  Gs = e => {
    let t = !1
    return () => {
      t || (e(), (t = !0))
    }
  }
let Kt = -1
const wp = () =>
    O.document?.visibilityState === 'hidden' && !O.document?.prerendering
      ? 0
      : 1 / 0,
  rr = e => {
    O.document.visibilityState === 'hidden' &&
      Kt > -1 &&
      ((Kt = e.type === 'visibilitychange' ? e.timeStamp : 0), Rp())
  },
  kp = () => {
    ;(addEventListener('visibilitychange', rr, !0),
      addEventListener('prerenderingchange', rr, !0))
  },
  Rp = () => {
    ;(removeEventListener('visibilitychange', rr, !0),
      removeEventListener('prerenderingchange', rr, !0))
  },
  Vs = () => {
    if (O.document && Kt < 0) {
      const e = jt()
      ;((Kt =
        (O.document.prerendering
          ? void 0
          : globalThis.performance
              .getEntriesByType('visibility-state')
              .filter(n => n.name === 'hidden' && n.startTime > e)[0]
              ?.startTime) ?? wp()),
        kp())
    }
    return {
      get firstHiddenTime() {
        return Kt
      },
    }
  },
  Er = e => {
    O.document?.prerendering
      ? addEventListener('prerenderingchange', () => e(), !0)
      : e()
  },
  Cp = [1800, 3e3],
  xp = (e, t = {}) => {
    Er(() => {
      const n = Vs(),
        r = Sn('FCP')
      let s
      const o = qt('paint', c => {
        for (const a of c)
          a.name === 'first-contentful-paint' &&
            (o.disconnect(),
            a.startTime < n.firstHiddenTime &&
              ((r.value = Math.max(a.startTime - jt(), 0)),
              r.entries.push(a),
              s(!0)))
      })
      o && (s = _n(e, r, Cp, t.reportAllChanges))
    })
  },
  Mp = [0.1, 0.25],
  Ap = (e, t = {}) => {
    xp(
      Gs(() => {
        const n = Sn('CLS', 0)
        let r
        const s = qs(t, nr),
          i = c => {
            for (const a of c) s._processEntry(a)
            s._sessionValue > n.value &&
              ((n.value = s._sessionValue),
              (n.entries = s._sessionEntries),
              r())
          },
          o = qt('layout-shift', i)
        o &&
          ((r = _n(e, n, Mp, t.reportAllChanges)),
          O.document?.addEventListener('visibilitychange', () => {
            O.document?.visibilityState === 'hidden' &&
              (i(o.takeRecords()), r(!0))
          }),
          O?.setTimeout?.(r))
      })
    )
  }
let oc = 0,
  $r = 1 / 0,
  An = 0
const Op = e => {
  e.forEach(t => {
    t.interactionId &&
      (($r = Math.min($r, t.interactionId)),
      (An = Math.max(An, t.interactionId)),
      (oc = An ? (An - $r) / 7 + 1 : 0))
  })
}
let cs
const ac = () => (cs ? oc : performance.interactionCount || 0),
  Np = () => {
    'interactionCount' in performance ||
      cs ||
      (cs = qt('event', Op, {
        type: 'event',
        buffered: !0,
        durationThreshold: 0,
      }))
  },
  Ur = 10
let cc = 0
const Lp = () => ac() - cc
class sr {
  constructor() {
    ;(sr.prototype.__init.call(this), sr.prototype.__init2.call(this))
  }
  __init() {
    this._longestInteractionList = []
  }
  __init2() {
    this._longestInteractionMap = new Map()
  }
  _resetInteractions() {
    ;((cc = ac()),
      (this._longestInteractionList.length = 0),
      this._longestInteractionMap.clear())
  }
  _estimateP98LongestInteraction() {
    const t = Math.min(
      this._longestInteractionList.length - 1,
      Math.floor(Lp() / 50)
    )
    return this._longestInteractionList[t]
  }
  _processEntry(t) {
    if (
      (this._onBeforeProcessingEntry?.(t),
      !(t.interactionId || t.entryType === 'first-input'))
    )
      return
    const n = this._longestInteractionList.at(-1)
    let r = this._longestInteractionMap.get(t.interactionId)
    if (
      r ||
      this._longestInteractionList.length < Ur ||
      t.duration > n._latency
    ) {
      if (
        (r
          ? t.duration > r._latency
            ? ((r.entries = [t]), (r._latency = t.duration))
            : t.duration === r._latency &&
              t.startTime === r.entries[0].startTime &&
              r.entries.push(t)
          : ((r = { id: t.interactionId, entries: [t], _latency: t.duration }),
            this._longestInteractionMap.set(r.id, r),
            this._longestInteractionList.push(r)),
        this._longestInteractionList.sort((s, i) => i._latency - s._latency),
        this._longestInteractionList.length > Ur)
      ) {
        const s = this._longestInteractionList.splice(Ur)
        for (const i of s) this._longestInteractionMap.delete(i.id)
      }
      this._onAfterProcessingINPCandidate?.(r)
    }
  }
}
const Ys = e => {
    const t = n => {
      ;(n.type === 'pagehide' || O.document?.visibilityState === 'hidden') &&
        e(n)
    }
    O.document &&
      (addEventListener('visibilitychange', t, !0),
      addEventListener('pagehide', t, !0))
  },
  uc = e => {
    const t = O.requestIdleCallback || O.setTimeout
    O.document?.visibilityState === 'hidden' ? e() : ((e = Gs(e)), t(e), Ys(e))
  },
  Dp = [200, 500],
  Pp = 40,
  Fp = (e, t = {}) => {
    globalThis.PerformanceEventTiming &&
      'interactionId' in PerformanceEventTiming.prototype &&
      Er(() => {
        Np()
        const n = Sn('INP')
        let r
        const s = qs(t, sr),
          i = c => {
            uc(() => {
              for (const u of c) s._processEntry(u)
              const a = s._estimateP98LongestInteraction()
              a &&
                a._latency !== n.value &&
                ((n.value = a._latency), (n.entries = a.entries), r())
            })
          },
          o = qt('event', i, { durationThreshold: t.durationThreshold ?? Pp })
        ;((r = _n(e, n, Dp, t.reportAllChanges)),
          o &&
            (o.observe({ type: 'first-input', buffered: !0 }),
            Ys(() => {
              ;(i(o.takeRecords()), r(!0))
            })))
      })
  }
class Bp {
  _processEntry(t) {
    this._onBeforeProcessingEntry?.(t)
  }
}
const $p = [2500, 4e3],
  Up = (e, t = {}) => {
    Er(() => {
      const n = Vs(),
        r = Sn('LCP')
      let s
      const i = qs(t, Bp),
        o = a => {
          t.reportAllChanges || (a = a.slice(-1))
          for (const u of a)
            (i._processEntry(u),
              u.startTime < n.firstHiddenTime &&
                ((r.value = Math.max(u.startTime - jt(), 0)),
                (r.entries = [u]),
                s()))
        },
        c = qt('largest-contentful-paint', o)
      if (c) {
        s = _n(e, r, $p, t.reportAllChanges)
        const a = Gs(() => {
          ;(o(c.takeRecords()), c.disconnect(), s(!0))
        })
        for (const u of ['keydown', 'click', 'visibilitychange'])
          O.document &&
            addEventListener(u, () => uc(a), { capture: !0, once: !0 })
      }
    })
  },
  Hp = [800, 1800],
  us = e => {
    O.document?.prerendering
      ? Er(() => us(e))
      : O.document?.readyState !== 'complete'
        ? addEventListener('load', () => us(e), !0)
        : setTimeout(e)
  },
  Wp = (e, t = {}) => {
    const n = Sn('TTFB'),
      r = _n(e, n, Hp, t.reportAllChanges)
    us(() => {
      const s = yn()
      s &&
        ((n.value = Math.max(s.responseStart - jt(), 0)),
        (n.entries = [s]),
        r(!0))
    })
  },
  Jt = {},
  ir = {}
let dc, lc, fc, pc
function Xs(e, t = !1) {
  return br('cls', e, jp, dc, t)
}
function Ks(e, t = !1) {
  return br('lcp', e, qp, lc, t)
}
function zp(e) {
  return br('ttfb', e, Gp, fc)
}
function hc(e) {
  return br('inp', e, Vp, pc)
}
function ht(e, t) {
  return (mc(e, t), ir[e] || (Yp(e), (ir[e] = !0)), gc(e, t))
}
function En(e, t) {
  const n = Jt[e]
  if (n?.length)
    for (const r of n)
      try {
        r(t)
      } catch (s) {
        Lt &&
          _.error(
            `Error while triggering instrumentation handler.
Type: ${e}
Name: ${ze(r)}
Error:`,
            s
          )
      }
}
function jp() {
  return Ap(
    e => {
      ;(En('cls', { metric: e }), (dc = e))
    },
    { reportAllChanges: !0 }
  )
}
function qp() {
  return Up(
    e => {
      ;(En('lcp', { metric: e }), (lc = e))
    },
    { reportAllChanges: !0 }
  )
}
function Gp() {
  return Wp(e => {
    ;(En('ttfb', { metric: e }), (fc = e))
  })
}
function Vp() {
  return Fp(e => {
    ;(En('inp', { metric: e }), (pc = e))
  })
}
function br(e, t, n, r, s = !1) {
  mc(e, t)
  let i
  return (
    ir[e] || ((i = n()), (ir[e] = !0)),
    r && t({ metric: r }),
    gc(e, t, s ? i : void 0)
  )
}
function Yp(e) {
  const t = {}
  ;(e === 'event' && (t.durationThreshold = 0),
    qt(
      e,
      n => {
        En(e, { entries: n })
      },
      t
    ))
}
function mc(e, t) {
  ;((Jt[e] = Jt[e] || []), Jt[e].push(t))
}
function gc(e, t, n) {
  return () => {
    n && n()
    const r = Jt[e]
    if (!r) return
    const s = r.indexOf(t)
    s !== -1 && r.splice(s, 1)
  }
}
function Xp(e) {
  return 'duration' in e
}
function Hr(e) {
  return typeof e == 'number' && isFinite(e)
}
function Qe(e, t, n, { ...r }) {
  const s = z(e).start_timestamp
  return (
    s &&
      s > t &&
      typeof e.updateStartTime == 'function' &&
      e.updateStartTime(t),
    Ds(e, () => {
      const i = zt({ startTime: t, ...r })
      return (i && i.end(n), i)
    })
  )
}
function Js(e) {
  const t = F()
  if (!t) return
  const { name: n, transaction: r, attributes: s, startTime: i } = e,
    { release: o, environment: c, sendDefaultPii: a } = t.getOptions(),
    l = t.getIntegrationByName('Replay')?.getReplayId(),
    d = X(),
    p = d.getUser(),
    f = p !== void 0 ? p.email || p.id || p.ip_address : void 0
  let h
  try {
    h = d.getScopeData().contexts.profile.profile_id
  } catch {}
  const m = {
    release: o,
    environment: c,
    user: f || void 0,
    profile_id: h || void 0,
    replay_id: l || void 0,
    transaction: r,
    'user_agent.original': O.navigator?.userAgent,
    'client.address': a ? '{{auto}}' : void 0,
    ...s,
  }
  return zt({
    name: n,
    attributes: m,
    startTime: i,
    experimental: { standalone: !0 },
  })
}
function bn() {
  return O.addEventListener && O.performance
}
function se(e) {
  return e / 1e3
}
function Kp(e) {
  let t = 'unknown',
    n = 'unknown',
    r = ''
  for (const s of e) {
    if (s === '/') {
      ;[t, n] = e.split('/')
      break
    }
    if (!isNaN(Number(s))) {
      ;((t = r === 'h' ? 'http' : r), (n = e.split(r)[1]))
      break
    }
    r += s
  }
  return (r === e && (t = r), { name: t, version: n })
}
function _c(e) {
  try {
    return PerformanceObserver.supportedEntryTypes.includes(e)
  } catch {
    return !1
  }
}
function yc(e, t) {
  let n,
    r = !1
  function s(c) {
    ;(!r && n && t(c, n), (r = !0))
  }
  Ys(() => {
    s('pagehide')
  })
  const i = e.on('beforeStartNavigationSpan', (c, a) => {
      a?.isRedirect || (s('navigation'), i(), o())
    }),
    o = e.on('afterStartPageLoadSpan', c => {
      ;((n = c.spanContext().spanId), o())
    })
}
function Jp(e) {
  let t = 0,
    n
  if (!_c('layout-shift')) return
  const r = Xs(({ metric: s }) => {
    const i = s.entries[s.entries.length - 1]
    i && ((t = s.value), (n = i))
  }, !0)
  yc(e, (s, i) => {
    ;(Qp(t, n, i, s), r())
  })
}
function Qp(e, t, n, r) {
  Lt && _.log(`Sending CLS span (${e})`)
  const s = se((_e() || 0) + (t?.startTime || 0)),
    i = X().getScopeData().transactionName,
    o = t ? we(t.sources[0]?.node) : 'Layout shift',
    c = {
      [oe]: 'auto.http.browser.cls',
      [Ge]: 'ui.webvital.cls',
      [Wt]: t?.duration || 0,
      'sentry.pageload.span_id': n,
      'sentry.report_event': r,
    }
  t?.sources &&
    t.sources.forEach((u, l) => {
      c[`cls.source.${l + 1}`] = we(u.node)
    })
  const a = Js({ name: o, transaction: i, attributes: c, startTime: s })
  a && (a.addEvent('cls', { [hn]: '', [mn]: e }), a.end(s))
}
function Zp(e) {
  let t = 0,
    n
  if (!_c('largest-contentful-paint')) return
  const r = Ks(({ metric: s }) => {
    const i = s.entries[s.entries.length - 1]
    i && ((t = s.value), (n = i))
  }, !0)
  yc(e, (s, i) => {
    ;(eh(t, n, i, s), r())
  })
}
function eh(e, t, n, r) {
  Lt && _.log(`Sending LCP span (${e})`)
  const s = se((_e() || 0) + (t?.startTime || 0)),
    i = X().getScopeData().transactionName,
    o = t ? we(t.element) : 'Largest contentful paint',
    c = {
      [oe]: 'auto.http.browser.lcp',
      [Ge]: 'ui.webvital.lcp',
      [Wt]: 0,
      'sentry.pageload.span_id': n,
      'sentry.report_event': r,
    }
  t &&
    (t.element && (c['lcp.element'] = we(t.element)),
    t.id && (c['lcp.id'] = t.id),
    t.url && (c['lcp.url'] = t.url.trim().slice(0, 200)),
    t.loadTime != null && (c['lcp.loadTime'] = t.loadTime),
    t.renderTime != null && (c['lcp.renderTime'] = t.renderTime),
    t.size != null && (c['lcp.size'] = t.size))
  const a = Js({ name: o, transaction: i, attributes: c, startTime: s })
  a && (a.addEvent('lcp', { [hn]: 'millisecond', [mn]: e }), a.end(s))
}
function ve(e) {
  return e && ((_e() || performance.timeOrigin) + e) / 1e3
}
function Sc(e) {
  const t = {}
  if (e.nextHopProtocol != null) {
    const { name: n, version: r } = Kp(e.nextHopProtocol)
    ;((t['network.protocol.version'] = r), (t['network.protocol.name'] = n))
  }
  return _e() || bn()?.timeOrigin
    ? th({
        ...t,
        'http.request.redirect_start': ve(e.redirectStart),
        'http.request.redirect_end': ve(e.redirectEnd),
        'http.request.worker_start': ve(e.workerStart),
        'http.request.fetch_start': ve(e.fetchStart),
        'http.request.domain_lookup_start': ve(e.domainLookupStart),
        'http.request.domain_lookup_end': ve(e.domainLookupEnd),
        'http.request.connect_start': ve(e.connectStart),
        'http.request.secure_connection_start': ve(e.secureConnectionStart),
        'http.request.connection_end': ve(e.connectEnd),
        'http.request.request_start': ve(e.requestStart),
        'http.request.response_start': ve(e.responseStart),
        'http.request.response_end': ve(e.responseEnd),
        'http.request.time_to_first_byte':
          e.responseStart != null ? e.responseStart / 1e3 : void 0,
      })
    : t
}
function th(e) {
  return Object.fromEntries(Object.entries(e).filter(([, t]) => t != null))
}
const nh = 2147483647
let lo = 0,
  xe = {},
  me,
  or
function rh({
  recordClsStandaloneSpans: e,
  recordLcpStandaloneSpans: t,
  client: n,
}) {
  const r = bn()
  if (r && _e()) {
    r.mark && O.performance.mark('sentry-tracing-init')
    const s = t ? Zp(n) : ch(),
      i = uh(),
      o = e ? Jp(n) : ah()
    return () => {
      ;(s?.(), i(), o?.())
    }
  }
  return () => {}
}
function sh() {
  ht('longtask', ({ entries: e }) => {
    const t = le()
    if (!t) return
    const { op: n, start_timestamp: r } = z(t)
    for (const s of e) {
      const i = se(_e() + s.startTime),
        o = se(s.duration)
      ;(n === 'navigation' && r && i < r) ||
        Qe(t, i, i + o, {
          name: 'Main UI thread blocked',
          op: 'ui.long-task',
          attributes: { [oe]: 'auto.ui.browser.metrics' },
        })
    }
  })
}
function ih() {
  new PerformanceObserver(t => {
    const n = le()
    if (n)
      for (const r of t.getEntries()) {
        if (!r.scripts[0]) continue
        const s = se(_e() + r.startTime),
          { start_timestamp: i, op: o } = z(n)
        if (o === 'navigation' && i && s < i) continue
        const c = se(r.duration),
          a = { [oe]: 'auto.ui.browser.metrics' },
          u = r.scripts[0],
          {
            invoker: l,
            invokerType: d,
            sourceURL: p,
            sourceFunctionName: f,
            sourceCharPosition: h,
          } = u
        ;((a['browser.script.invoker'] = l),
          (a['browser.script.invoker_type'] = d),
          p && (a['code.filepath'] = p),
          f && (a['code.function'] = f),
          h !== -1 && (a['browser.script.source_char_position'] = h),
          Qe(n, s, s + c, {
            name: 'Main UI thread blocked',
            op: 'ui.long-animation-frame',
            attributes: a,
          }))
      }
  }).observe({ type: 'long-animation-frame', buffered: !0 })
}
function oh() {
  ht('event', ({ entries: e }) => {
    const t = le()
    if (t) {
      for (const n of e)
        if (n.name === 'click') {
          const r = se(_e() + n.startTime),
            s = se(n.duration),
            i = {
              name: we(n.target),
              op: `ui.interaction.${n.name}`,
              startTime: r,
              attributes: { [oe]: 'auto.ui.browser.metrics' },
            },
            o = ra(n.target)
          ;(o && (i.attributes['ui.component_name'] = o), Qe(t, r, r + s, i))
        }
    }
  })
}
function ah() {
  return Xs(({ metric: e }) => {
    const t = e.entries[e.entries.length - 1]
    t && ((xe.cls = { value: e.value, unit: '' }), (or = t))
  }, !0)
}
function ch() {
  return Ks(({ metric: e }) => {
    const t = e.entries[e.entries.length - 1]
    t && ((xe.lcp = { value: e.value, unit: 'millisecond' }), (me = t))
  }, !0)
}
function uh() {
  return zp(({ metric: e }) => {
    e.entries[e.entries.length - 1] &&
      (xe.ttfb = { value: e.value, unit: 'millisecond' })
  })
}
function dh(e, t) {
  const n = bn(),
    r = _e()
  if (!n?.getEntries || !r) return
  const s = se(r),
    i = n.getEntries(),
    { op: o, start_timestamp: c } = z(e)
  ;(i.slice(lo).forEach(a => {
    const u = se(a.startTime),
      l = se(Math.max(0, a.duration))
    if (!(o === 'navigation' && c && s + u < c))
      switch (a.entryType) {
        case 'navigation': {
          ph(e, a, s)
          break
        }
        case 'mark':
        case 'paint':
        case 'measure': {
          lh(e, a, u, l, s, t.ignorePerformanceApiSpans)
          const d = Vs(),
            p = a.startTime < d.firstHiddenTime
          ;(a.name === 'first-paint' &&
            p &&
            (xe.fp = { value: a.startTime, unit: 'millisecond' }),
            a.name === 'first-contentful-paint' &&
              p &&
              (xe.fcp = { value: a.startTime, unit: 'millisecond' }))
          break
        }
        case 'resource': {
          gh(e, a, a.name, u, l, s, t.ignoreResourceSpans)
          break
        }
      }
  }),
    (lo = Math.max(i.length - 1, 0)),
    _h(e),
    o === 'pageload' &&
      (Eh(xe),
      t.recordClsOnPageloadSpan || delete xe.cls,
      t.recordLcpOnPageloadSpan || delete xe.lcp,
      Object.entries(xe).forEach(([a, u]) => {
        Yd(a, u.value, u.unit)
      }),
      e.setAttribute('performance.timeOrigin', s),
      e.setAttribute('performance.activationStart', jt()),
      yh(e, t)),
    (me = void 0),
    (or = void 0),
    (xe = {}))
}
function lh(e, t, n, r, s, i) {
  if (['mark', 'measure'].includes(t.entryType) && Ue(t.name, i)) return
  const o = yn(!1),
    c = se(o ? o.requestStart : 0),
    a = s + Math.max(n, c),
    u = s + n,
    l = u + r,
    d = { [oe]: 'auto.resource.browser.metrics' }
  ;(a !== u &&
    ((d['sentry.browser.measure_happened_before_request'] = !0),
    (d['sentry.browser.measure_start_time'] = a)),
    fh(d, t),
    a <= l && Qe(e, a, l, { name: t.name, op: t.entryType, attributes: d }))
}
function fh(e, t) {
  try {
    const n = t.detail
    if (!n) return
    if (typeof n == 'object') {
      for (const [r, s] of Object.entries(n))
        if (s && Rt(s)) e[`sentry.browser.measure.detail.${r}`] = s
        else if (s !== void 0)
          try {
            e[`sentry.browser.measure.detail.${r}`] = JSON.stringify(s)
          } catch {}
      return
    }
    if (Rt(n)) {
      e['sentry.browser.measure.detail'] = n
      return
    }
    try {
      e['sentry.browser.measure.detail'] = JSON.stringify(n)
    } catch {}
  } catch {}
}
function ph(e, t, n) {
  ;([
    'unloadEvent',
    'redirect',
    'domContentLoadedEvent',
    'loadEvent',
    'connect',
  ].forEach(r => {
    On(e, t, r, n)
  }),
    On(e, t, 'secureConnection', n, 'TLS/SSL'),
    On(e, t, 'fetch', n, 'cache'),
    On(e, t, 'domainLookup', n, 'DNS'),
    mh(e, t, n))
}
function On(e, t, n, r, s = n) {
  const i = hh(n),
    o = t[i],
    c = t[`${n}Start`]
  !c ||
    !o ||
    Qe(e, r + se(c), r + se(o), {
      op: `browser.${s}`,
      name: t.name,
      attributes: {
        [oe]: 'auto.ui.browser.metrics',
        ...(n === 'redirect' && t.redirectCount != null
          ? { 'http.redirect_count': t.redirectCount }
          : {}),
      },
    })
}
function hh(e) {
  return e === 'secureConnection'
    ? 'connectEnd'
    : e === 'fetch'
      ? 'domainLookupStart'
      : `${e}End`
}
function mh(e, t, n) {
  const r = n + se(t.requestStart),
    s = n + se(t.responseEnd),
    i = n + se(t.responseStart)
  t.responseEnd &&
    (Qe(e, r, s, {
      op: 'browser.request',
      name: t.name,
      attributes: { [oe]: 'auto.ui.browser.metrics' },
    }),
    Qe(e, i, s, {
      op: 'browser.response',
      name: t.name,
      attributes: { [oe]: 'auto.ui.browser.metrics' },
    }))
}
function gh(e, t, n, r, s, i, o) {
  if (t.initiatorType === 'xmlhttprequest' || t.initiatorType === 'fetch')
    return
  const c = t.initiatorType ? `resource.${t.initiatorType}` : 'resource.other'
  if (o?.includes(c)) return
  const a = { [oe]: 'auto.resource.browser.metrics' },
    u = lt(n)
  ;(u.protocol && (a['url.scheme'] = u.protocol.split(':').pop()),
    u.host && (a['server.address'] = u.host),
    (a['url.same_origin'] = n.includes(O.location.origin)),
    Sh(t, a, [
      ['responseStatus', 'http.response.status_code'],
      ['transferSize', 'http.response_transfer_size'],
      ['encodedBodySize', 'http.response_content_length'],
      ['decodedBodySize', 'http.decoded_response_content_length'],
      ['renderBlockingStatus', 'resource.render_blocking_status'],
      ['deliveryType', 'http.response_delivery_type'],
    ]))
  const l = { ...a, ...Sc(t) },
    d = i + r,
    p = d + s
  Qe(e, d, p, { name: n.replace(O.location.origin, ''), op: c, attributes: l })
}
function _h(e) {
  const t = O.navigator
  if (!t) return
  const n = t.connection
  ;(n &&
    (n.effectiveType &&
      e.setAttribute('effectiveConnectionType', n.effectiveType),
    n.type && e.setAttribute('connectionType', n.type),
    Hr(n.rtt) &&
      (xe['connection.rtt'] = { value: n.rtt, unit: 'millisecond' })),
    Hr(t.deviceMemory) &&
      e.setAttribute('deviceMemory', `${t.deviceMemory} GB`),
    Hr(t.hardwareConcurrency) &&
      e.setAttribute('hardwareConcurrency', String(t.hardwareConcurrency)))
}
function yh(e, t) {
  ;(me &&
    t.recordLcpOnPageloadSpan &&
    (me.element && e.setAttribute('lcp.element', we(me.element)),
    me.id && e.setAttribute('lcp.id', me.id),
    me.url && e.setAttribute('lcp.url', me.url.trim().slice(0, 200)),
    me.loadTime != null && e.setAttribute('lcp.loadTime', me.loadTime),
    me.renderTime != null && e.setAttribute('lcp.renderTime', me.renderTime),
    e.setAttribute('lcp.size', me.size)),
    or?.sources &&
      t.recordClsOnPageloadSpan &&
      or.sources.forEach((n, r) =>
        e.setAttribute(`cls.source.${r + 1}`, we(n.node))
      ))
}
function Sh(e, t, n) {
  n.forEach(([r, s]) => {
    const i = e[r]
    i != null &&
      ((typeof i == 'number' && i < nh) || typeof i == 'string') &&
      (t[s] = i)
  })
}
function Eh(e) {
  const t = yn(!1)
  if (!t) return
  const { responseStart: n, requestStart: r } = t
  r <= n && (e['ttfb.requestTime'] = { value: n - r, unit: 'millisecond' })
}
function bh() {
  return bn() && _e() ? ht('element', vh) : () => {}
}
const vh = ({ entries: e }) => {
    const t = le(),
      n = t ? de(t) : void 0,
      r = n ? z(n).description : X().getScopeData().transactionName
    e.forEach(s => {
      const i = s
      if (!i.identifier) return
      const o = i.name,
        c = i.renderTime,
        a = i.loadTime,
        [u, l] = a
          ? [se(a), 'load-time']
          : c
            ? [se(c), 'render-time']
            : [ce(), 'entry-emission'],
        d = o === 'image-paint' ? se(Math.max(0, (c ?? 0) - (a ?? 0))) : 0,
        p = {
          [oe]: 'auto.ui.browser.elementtiming',
          [Ge]: 'ui.elementtiming',
          [Me]: 'component',
          'sentry.span_start_time_source': l,
          'sentry.transaction_name': r,
          'element.id': i.id,
          'element.type': i.element?.tagName?.toLowerCase() || 'unknown',
          'element.size':
            i.naturalWidth && i.naturalHeight
              ? `${i.naturalWidth}x${i.naturalHeight}`
              : void 0,
          'element.render_time': c,
          'element.load_time': a,
          'element.url': i.url || void 0,
          'element.identifier': i.identifier,
          'element.paint_type': o,
        }
      el(
        {
          name: `element[${i.identifier}]`,
          attributes: p,
          startTime: u,
          onlyIfParent: !0,
        },
        f => {
          f.end(u + d)
        }
      )
    })
  },
  Th = 1e3
let fo, ds, ls
function Ec(e) {
  const t = 'dom'
  ;(et(t, e), tt(t, Ih))
}
function Ih() {
  if (!O.document) return
  const e = Ie.bind(null, 'dom'),
    t = po(e, !0)
  ;(O.document.addEventListener('click', t, !1),
    O.document.addEventListener('keypress', t, !1),
    ['EventTarget', 'Node'].forEach(n => {
      const s = O[n]?.prototype
      s?.hasOwnProperty?.('addEventListener') &&
        (ge(s, 'addEventListener', function (i) {
          return function (o, c, a) {
            if (o === 'click' || o == 'keypress')
              try {
                const u = (this.__sentry_instrumentation_handlers__ =
                    this.__sentry_instrumentation_handlers__ || {}),
                  l = (u[o] = u[o] || { refCount: 0 })
                if (!l.handler) {
                  const d = po(e)
                  ;((l.handler = d), i.call(this, o, d, a))
                }
                l.refCount++
              } catch {}
            return i.call(this, o, c, a)
          }
        }),
        ge(s, 'removeEventListener', function (i) {
          return function (o, c, a) {
            if (o === 'click' || o == 'keypress')
              try {
                const u = this.__sentry_instrumentation_handlers__ || {},
                  l = u[o]
                l &&
                  (l.refCount--,
                  l.refCount <= 0 &&
                    (i.call(this, o, l.handler, a),
                    (l.handler = void 0),
                    delete u[o]),
                  Object.keys(u).length === 0 &&
                    delete this.__sentry_instrumentation_handlers__)
              } catch {}
            return i.call(this, o, c, a)
          }
        }))
    }))
}
function wh(e) {
  if (e.type !== ds) return !1
  try {
    if (!e.target || e.target._sentryId !== ls) return !1
  } catch {}
  return !0
}
function kh(e, t) {
  return e !== 'keypress'
    ? !1
    : t?.tagName
      ? !(
          t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.isContentEditable
        )
      : !0
}
function po(e, t = !1) {
  return n => {
    if (!n || n._sentryCaptured) return
    const r = Rh(n)
    if (kh(n.type, r)) return
    ;(Ee(n, '_sentryCaptured', !0),
      r && !r._sentryId && Ee(r, '_sentryId', Se()))
    const s = n.type === 'keypress' ? 'input' : n.type
    ;(wh(n) ||
      (e({ event: n, name: s, global: t }),
      (ds = n.type),
      (ls = r ? r._sentryId : void 0)),
      clearTimeout(fo),
      (fo = O.setTimeout(() => {
        ;((ls = void 0), (ds = void 0))
      }, Th)))
  }
}
function Rh(e) {
  try {
    return e.target
  } catch {
    return null
  }
}
let Nn
function vr(e) {
  const t = 'history'
  ;(et(t, e), tt(t, Ch))
}
function Ch() {
  if (
    (O.addEventListener('popstate', () => {
      const t = O.location.href,
        n = Nn
      if (((Nn = t), n === t)) return
      Ie('history', { from: n, to: t })
    }),
    !Kf())
  )
    return
  function e(t) {
    return function (...n) {
      const r = n.length > 2 ? n[2] : void 0
      if (r) {
        const s = Nn,
          i = xh(String(r))
        if (((Nn = i), s === i)) return t.apply(this, n)
        Ie('history', { from: s, to: i })
      }
      return t.apply(this, n)
    }
  }
  ;(ge(O.history, 'pushState', e), ge(O.history, 'replaceState', e))
}
function xh(e) {
  try {
    return new URL(e, O.location.origin).toString()
  } catch {
    return e
  }
}
const Vn = {}
function bc(e) {
  const t = Vn[e]
  if (t) return t
  let n = O[e]
  if (ss(n)) return (Vn[e] = n.bind(O))
  const r = O.document
  if (r && typeof r.createElement == 'function')
    try {
      const s = r.createElement('iframe')
      ;((s.hidden = !0), r.head.appendChild(s))
      const i = s.contentWindow
      ;(i?.[e] && (n = i[e]), r.head.removeChild(s))
    } catch (s) {
      Lt &&
        _.warn(
          `Could not create sandbox iframe for ${e} check, bailing to window.${e}: `,
          s
        )
    }
  return n && (Vn[e] = n.bind(O))
}
function Mh(e) {
  Vn[e] = void 0
}
function vn(...e) {
  return bc('setTimeout')(...e)
}
const ot = '__sentry_xhr_v3__'
function vc(e) {
  const t = 'xhr'
  ;(et(t, e), tt(t, Ah))
}
function Ah() {
  if (!O.XMLHttpRequest) return
  const e = XMLHttpRequest.prototype
  ;((e.open = new Proxy(e.open, {
    apply(t, n, r) {
      const s = new Error(),
        i = ce() * 1e3,
        o = $e(r[0]) ? r[0].toUpperCase() : void 0,
        c = Oh(r[1])
      if (!o || !c) return t.apply(n, r)
      ;((n[ot] = { method: o, url: c, request_headers: {} }),
        o === 'POST' &&
          c.match(/sentry_key/) &&
          (n.__sentry_own_request__ = !0))
      const a = () => {
        const u = n[ot]
        if (u && n.readyState === 4) {
          try {
            u.status_code = n.status
          } catch {}
          const l = {
            endTimestamp: ce() * 1e3,
            startTimestamp: i,
            xhr: n,
            virtualError: s,
          }
          Ie('xhr', l)
        }
      }
      return (
        'onreadystatechange' in n && typeof n.onreadystatechange == 'function'
          ? (n.onreadystatechange = new Proxy(n.onreadystatechange, {
              apply(u, l, d) {
                return (a(), u.apply(l, d))
              },
            }))
          : n.addEventListener('readystatechange', a),
        (n.setRequestHeader = new Proxy(n.setRequestHeader, {
          apply(u, l, d) {
            const [p, f] = d,
              h = l[ot]
            return (
              h && $e(p) && $e(f) && (h.request_headers[p.toLowerCase()] = f),
              u.apply(l, d)
            )
          },
        })),
        t.apply(n, r)
      )
    },
  })),
    (e.send = new Proxy(e.send, {
      apply(t, n, r) {
        const s = n[ot]
        if (!s) return t.apply(n, r)
        r[0] !== void 0 && (s.body = r[0])
        const i = { startTimestamp: ce() * 1e3, xhr: n }
        return (Ie('xhr', i), t.apply(n, r))
      },
    })))
}
function Oh(e) {
  if ($e(e)) return e
  try {
    return e.toString()
  } catch {}
}
function Tc(e) {
  return new URLSearchParams(e).toString()
}
function Ic(e, t = _) {
  try {
    if (typeof e == 'string') return [e]
    if (e instanceof URLSearchParams) return [e.toString()]
    if (e instanceof FormData) return [Tc(e)]
    if (!e) return [void 0]
  } catch (n) {
    return (
      Lt && t.error(n, 'Failed to serialize body', e),
      [void 0, 'BODY_PARSE_ERROR']
    )
  }
  return (
    Lt && t.log('Skipping network body because of body type', e),
    [void 0, 'UNPARSEABLE_BODY_TYPE']
  )
}
function wc(e = []) {
  if (!(e.length !== 2 || typeof e[1] != 'object')) return e[1].body
}
const Wr = [],
  Yn = new Map(),
  Nh = 60
function Lh() {
  if (bn() && _e()) {
    const t = Dh()
    return () => {
      t()
    }
  }
  return () => {}
}
const ho = {
  click: 'click',
  pointerdown: 'click',
  pointerup: 'click',
  mousedown: 'click',
  mouseup: 'click',
  touchstart: 'click',
  touchend: 'click',
  mouseover: 'hover',
  mouseout: 'hover',
  mouseenter: 'hover',
  mouseleave: 'hover',
  pointerover: 'hover',
  pointerout: 'hover',
  pointerenter: 'hover',
  pointerleave: 'hover',
  dragstart: 'drag',
  dragend: 'drag',
  drag: 'drag',
  dragenter: 'drag',
  dragleave: 'drag',
  dragover: 'drag',
  drop: 'drag',
  keydown: 'press',
  keyup: 'press',
  keypress: 'press',
  input: 'press',
}
function Dh() {
  return hc(Ph)
}
const Ph = ({ metric: e }) => {
  if (e.value == null) return
  const t = se(e.value)
  if (t > Nh) return
  const n = e.entries.find(h => h.duration === e.value && ho[h.name])
  if (!n) return
  const { interactionId: r } = n,
    s = ho[n.name],
    i = se(_e() + n.startTime),
    o = le(),
    c = o ? de(o) : void 0,
    u = (r != null ? Yn.get(r) : void 0) || c,
    l = u ? z(u).description : X().getScopeData().transactionName,
    d = we(n.target),
    p = {
      [oe]: 'auto.http.browser.inp',
      [Ge]: `ui.interaction.${s}`,
      [Wt]: n.duration,
    },
    f = Js({ name: d, transaction: l, attributes: p, startTime: i })
  f && (f.addEvent('inp', { [hn]: 'millisecond', [mn]: e.value }), f.end(i + t))
}
function Fh() {
  const e = ({ entries: t }) => {
    const n = le(),
      r = n && de(n)
    t.forEach(s => {
      if (!Xp(s) || !r) return
      const i = s.interactionId
      if (i != null && !Yn.has(i)) {
        if (Wr.length > 10) {
          const o = Wr.shift()
          Yn.delete(o)
        }
        ;(Wr.push(i), Yn.set(i, r))
      }
    })
  }
  ;(ht('event', e), ht('first-input', e))
}
function Bh(e, t = bc('fetch')) {
  let n = 0,
    r = 0
  async function s(i) {
    const o = i.body.length
    ;((n += o), r++)
    const c = {
      body: i.body,
      method: 'POST',
      referrerPolicy: 'strict-origin',
      headers: e.headers,
      keepalive: n <= 6e4 && r < 15,
      ...e.fetchOptions,
    }
    try {
      const a = await t(e.url, c)
      return {
        statusCode: a.status,
        headers: {
          'x-sentry-rate-limits': a.headers.get('X-Sentry-Rate-Limits'),
          'retry-after': a.headers.get('Retry-After'),
        },
      }
    } catch (a) {
      throw (Mh('fetch'), a)
    } finally {
      ;((n -= o), r--)
    }
  }
  return rf(e, s)
}
const $h = 30,
  Uh = 50
function fs(e, t, n, r) {
  const s = { filename: e, function: t === '<anonymous>' ? ft : t, in_app: !0 }
  return (n !== void 0 && (s.lineno = n), r !== void 0 && (s.colno = r), s)
}
const Hh = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,
  Wh =
    /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
  zh = /\((\S*)(?::(\d+))(?::(\d+))\)/,
  jh = /at (.+?) ?\(data:(.+?),/,
  qh = e => {
    const t = e.match(jh)
    if (t) return { filename: `<data:${t[2]}>`, function: t[1] }
    const n = Hh.exec(e)
    if (n) {
      const [, s, i, o] = n
      return fs(s, ft, +i, +o)
    }
    const r = Wh.exec(e)
    if (r) {
      if (r[2] && r[2].indexOf('eval') === 0) {
        const c = zh.exec(r[2])
        c && ((r[2] = c[1]), (r[3] = c[2]), (r[4] = c[3]))
      }
      const [i, o] = kc(r[1] || ft, r[2])
      return fs(o, i, r[3] ? +r[3] : void 0, r[4] ? +r[4] : void 0)
    }
  },
  Gh = [$h, qh],
  Vh =
    /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
  Yh = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
  Xh = e => {
    const t = Vh.exec(e)
    if (t) {
      if (t[3] && t[3].indexOf(' > eval') > -1) {
        const i = Yh.exec(t[3])
        i &&
          ((t[1] = t[1] || 'eval'), (t[3] = i[1]), (t[4] = i[2]), (t[5] = ''))
      }
      let r = t[3],
        s = t[1] || ft
      return (
        ([s, r] = kc(s, r)),
        fs(r, s, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0)
      )
    }
  },
  Kh = [Uh, Xh],
  Jh = [Gh, Kh],
  Qh = Ko(...Jh),
  kc = (e, t) => {
    const n = e.indexOf('safari-extension') !== -1,
      r = e.indexOf('safari-web-extension') !== -1
    return n || r
      ? [
          e.indexOf('@') !== -1 ? e.split('@')[0] : ft,
          n ? `safari-extension:${t}` : `safari-web-extension:${t}`,
        ]
      : [e, t]
  },
  ke = typeof __SENTRY_DEBUG__ > 'u' || __SENTRY_DEBUG__,
  Ln = 1024,
  Zh = 'Breadcrumbs',
  em = (e = {}) => {
    const t = {
      console: !0,
      dom: !0,
      fetch: !0,
      history: !0,
      sentry: !0,
      xhr: !0,
      ...e,
    }
    return {
      name: Zh,
      setup(n) {
        ;(t.console && Ja(sm(n)),
          t.dom && Ec(rm(n, t.dom)),
          t.xhr && vc(im(n)),
          t.fetch && nc(om(n)),
          t.history && vr(am(n)),
          t.sentry && n.on('beforeSendEvent', nm(n)))
      },
    }
  },
  tm = em
function nm(e) {
  return function (n) {
    F() === e &&
      Je(
        {
          category: `sentry.${n.type === 'transaction' ? 'transaction' : 'event'}`,
          event_id: n.event_id,
          level: n.level,
          message: it(n),
        },
        { event: n }
      )
  }
}
function rm(e, t) {
  return function (r) {
    if (F() !== e) return
    let s,
      i,
      o = typeof t == 'object' ? t.serializeAttribute : void 0,
      c =
        typeof t == 'object' && typeof t.maxStringLength == 'number'
          ? t.maxStringLength
          : void 0
    ;(c &&
      c > Ln &&
      (ke &&
        _.warn(
          `\`dom.maxStringLength\` cannot exceed ${Ln}, but a value of ${c} was configured. Sentry will use ${Ln} instead.`
        ),
      (c = Ln)),
      typeof o == 'string' && (o = [o]))
    try {
      const u = r.event,
        l = cm(u) ? u.target : u
      ;((s = we(l, { keyAttrs: o, maxStringLength: c })), (i = ra(l)))
    } catch {
      s = '<unknown>'
    }
    if (s.length === 0) return
    const a = { category: `ui.${r.name}`, message: s }
    ;(i && (a.data = { 'ui.component_name': i }),
      Je(a, { event: r.event, name: r.name, global: r.global }))
  }
}
function sm(e) {
  return function (n) {
    if (F() !== e) return
    const r = {
      category: 'console',
      data: { arguments: n.args, logger: 'console' },
      level: Qa(n.level),
      message: vi(n.args, ' '),
    }
    if (n.level === 'assert')
      if (n.args[0] === !1)
        ((r.message = `Assertion failed: ${vi(n.args.slice(1), ' ') || 'console.assert'}`),
          (r.data.arguments = n.args.slice(1)))
      else return
    Je(r, { input: n.args, level: n.level })
  }
}
function im(e) {
  return function (n) {
    if (F() !== e) return
    const { startTimestamp: r, endTimestamp: s } = n,
      i = n.xhr[ot]
    if (!r || !s || !i) return
    const { method: o, url: c, status_code: a, body: u } = i,
      l = { method: o, url: c, status_code: a },
      d = { xhr: n.xhr, input: u, startTimestamp: r, endTimestamp: s },
      p = { category: 'xhr', data: l, type: 'http', level: tc(a) }
    ;(e.emit('beforeOutgoingRequestBreadcrumb', p, d), Je(p, d))
  }
}
function om(e) {
  return function (n) {
    if (F() !== e) return
    const { startTimestamp: r, endTimestamp: s } = n
    if (
      s &&
      !(n.fetchData.url.match(/sentry_key/) && n.fetchData.method === 'POST')
    )
      if ((n.fetchData.method, n.fetchData.url, n.error)) {
        const i = n.fetchData,
          o = {
            data: n.error,
            input: n.args,
            startTimestamp: r,
            endTimestamp: s,
          },
          c = { category: 'fetch', data: i, level: 'error', type: 'http' }
        ;(e.emit('beforeOutgoingRequestBreadcrumb', c, o), Je(c, o))
      } else {
        const i = n.response,
          o = { ...n.fetchData, status_code: i?.status }
        ;(n.fetchData.request_body_size,
          n.fetchData.response_body_size,
          i?.status)
        const c = {
            input: n.args,
            response: i,
            startTimestamp: r,
            endTimestamp: s,
          },
          a = {
            category: 'fetch',
            data: o,
            type: 'http',
            level: tc(o.status_code),
          }
        ;(e.emit('beforeOutgoingRequestBreadcrumb', a, c), Je(a, c))
      }
  }
}
function am(e) {
  return function (n) {
    if (F() !== e) return
    let r = n.from,
      s = n.to
    const i = lt(j.location.href)
    let o = r ? lt(r) : void 0
    const c = lt(s)
    ;(o?.path || (o = i),
      i.protocol === c.protocol && i.host === c.host && (s = c.relative),
      i.protocol === o.protocol && i.host === o.host && (r = o.relative),
      Je({ category: 'navigation', data: { from: r, to: s } }))
  }
}
function cm(e) {
  return !!e && !!e.target
}
const um = [
    'EventTarget',
    'Window',
    'Node',
    'ApplicationCache',
    'AudioTrackList',
    'BroadcastChannel',
    'ChannelMergerNode',
    'CryptoOperation',
    'EventSource',
    'FileReader',
    'HTMLUnknownElement',
    'IDBDatabase',
    'IDBRequest',
    'IDBTransaction',
    'KeyOperation',
    'MediaController',
    'MessagePort',
    'ModalWindow',
    'Notification',
    'SVGElementInstance',
    'Screen',
    'SharedWorker',
    'TextTrack',
    'TextTrackCue',
    'TextTrackList',
    'WebSocket',
    'WebSocketWorker',
    'Worker',
    'XMLHttpRequest',
    'XMLHttpRequestEventTarget',
    'XMLHttpRequestUpload',
  ],
  dm = 'BrowserApiErrors',
  lm = (e = {}) => {
    const t = {
      XMLHttpRequest: !0,
      eventTarget: !0,
      requestAnimationFrame: !0,
      setInterval: !0,
      setTimeout: !0,
      unregisterOriginalCallbacks: !1,
      ...e,
    }
    return {
      name: dm,
      setupOnce() {
        ;(t.setTimeout && ge(j, 'setTimeout', mo),
          t.setInterval && ge(j, 'setInterval', mo),
          t.requestAnimationFrame && ge(j, 'requestAnimationFrame', pm),
          t.XMLHttpRequest &&
            'XMLHttpRequest' in j &&
            ge(XMLHttpRequest.prototype, 'send', hm))
        const n = t.eventTarget
        n && (Array.isArray(n) ? n : um).forEach(s => mm(s, t))
      },
    }
  },
  fm = lm
function mo(e) {
  return function (...t) {
    const n = t[0]
    return (
      (t[0] = Nt(n, {
        mechanism: {
          handled: !1,
          type: `auto.browser.browserapierrors.${ze(e)}`,
        },
      })),
      e.apply(this, t)
    )
  }
}
function pm(e) {
  return function (t) {
    return e.apply(this, [
      Nt(t, {
        mechanism: {
          data: { handler: ze(e) },
          handled: !1,
          type: 'auto.browser.browserapierrors.requestAnimationFrame',
        },
      }),
    ])
  }
}
function hm(e) {
  return function (...t) {
    const n = this
    return (
      ['onload', 'onerror', 'onprogress', 'onreadystatechange'].forEach(s => {
        s in n &&
          typeof n[s] == 'function' &&
          ge(n, s, function (i) {
            const o = {
                mechanism: {
                  data: { handler: ze(i) },
                  handled: !1,
                  type: `auto.browser.browserapierrors.xhr.${s}`,
                },
              },
              c = Rs(i)
            return (c && (o.mechanism.data.handler = ze(c)), Nt(i, o))
          })
      }),
      e.apply(this, t)
    )
  }
}
function mm(e, t) {
  const r = j[e]?.prototype
  r?.hasOwnProperty?.('addEventListener') &&
    (ge(r, 'addEventListener', function (s) {
      return function (i, o, c) {
        try {
          gm(o) &&
            (o.handleEvent = Nt(o.handleEvent, {
              mechanism: {
                data: { handler: ze(o), target: e },
                handled: !1,
                type: 'auto.browser.browserapierrors.handleEvent',
              },
            }))
        } catch {}
        return (
          t.unregisterOriginalCallbacks && _m(this, i, o),
          s.apply(this, [
            i,
            Nt(o, {
              mechanism: {
                data: { handler: ze(o), target: e },
                handled: !1,
                type: 'auto.browser.browserapierrors.addEventListener',
              },
            }),
            c,
          ])
        )
      }
    }),
    ge(r, 'removeEventListener', function (s) {
      return function (i, o, c) {
        try {
          const a = o.__sentry_wrapped__
          a && s.call(this, i, a, c)
        } catch {}
        return s.call(this, i, o, c)
      }
    }))
}
function gm(e) {
  return typeof e.handleEvent == 'function'
}
function _m(e, t, n) {
  e &&
    typeof e == 'object' &&
    'removeEventListener' in e &&
    typeof e.removeEventListener == 'function' &&
    e.removeEventListener(t, n)
}
const ym = () => ({
    name: 'BrowserSession',
    setupOnce() {
      if (typeof j.document > 'u') {
        ke &&
          _.warn(
            'Using the `browserSessionIntegration` in non-browser environments is not supported.'
          )
        return
      }
      ;(ji({ ignoreDuration: !0 }),
        qi(),
        vr(({ from: e, to: t }) => {
          e !== void 0 && e !== t && (ji({ ignoreDuration: !0 }), qi())
        }))
    },
  }),
  Sm = 'GlobalHandlers',
  Em = (e = {}) => {
    const t = { onerror: !0, onunhandledrejection: !0, ...e }
    return {
      name: Sm,
      setupOnce() {
        Error.stackTraceLimit = 50
      },
      setup(n) {
        ;(t.onerror && (vm(n), go('onerror')),
          t.onunhandledrejection && (Tm(n), go('onunhandledrejection')))
      },
    }
  },
  bm = Em
function vm(e) {
  Jo(t => {
    const { stackParser: n, attachStacktrace: r } = Rc()
    if (F() !== e || sc()) return
    const { msg: s, url: i, line: o, column: c, error: a } = t,
      u = km(js(n, a || s, void 0, r, !1), i, o, c)
    ;((u.level = 'error'),
      Pa(u, {
        originalException: a,
        mechanism: {
          handled: !1,
          type: 'auto.browser.global_handlers.onerror',
        },
      }))
  })
}
function Tm(e) {
  Qo(t => {
    const { stackParser: n, attachStacktrace: r } = Rc()
    if (F() !== e || sc()) return
    const s = Im(t),
      i = Rt(s) ? wm(s) : js(n, s, void 0, r, !0)
    ;((i.level = 'error'),
      Pa(i, {
        originalException: s,
        mechanism: {
          handled: !1,
          type: 'auto.browser.global_handlers.onunhandledrejection',
        },
      }))
  })
}
function Im(e) {
  if (Rt(e)) return e
  try {
    if ('reason' in e) return e.reason
    if ('detail' in e && 'reason' in e.detail) return e.detail.reason
  } catch {}
  return e
}
function wm(e) {
  return {
    exception: {
      values: [
        {
          type: 'UnhandledRejection',
          value: `Non-Error promise rejection captured with value: ${String(e)}`,
        },
      ],
    },
  }
}
function km(e, t, n, r) {
  const s = (e.exception = e.exception || {}),
    i = (s.values = s.values || []),
    o = (i[0] = i[0] || {}),
    c = (o.stacktrace = o.stacktrace || {}),
    a = (c.frames = c.frames || []),
    u = r,
    l = n,
    d = Rm(t) ?? Ut()
  return (
    a.length === 0 &&
      a.push({ colno: u, filename: d, function: ft, in_app: !0, lineno: l }),
    e
  )
}
function go(e) {
  ke && _.log(`Global Handler attached: ${e}`)
}
function Rc() {
  return F()?.getOptions() || { stackParser: () => [], attachStacktrace: !1 }
}
function Rm(e) {
  if (!(!$e(e) || e.length === 0)) {
    if (e.startsWith('data:')) {
      const t = e.match(/^data:([^;]+)/),
        n = t ? t[1] : 'text/javascript',
        r = e.includes('base64,')
      return `<data:${n}${r ? ',base64' : ''}>`
    }
    return e.slice(0, 1024)
  }
}
const Cm = () => ({
    name: 'HttpContext',
    preprocessEvent(e) {
      if (!j.navigator && !j.location && !j.document) return
      const t = Hs(),
        n = { ...t.headers, ...e.request?.headers }
      e.request = { ...t, ...e.request, headers: n }
    },
  }),
  xm = 'cause',
  Mm = 5,
  Am = 'LinkedErrors',
  Om = (e = {}) => {
    const t = e.limit || Mm,
      n = e.key || xm
    return {
      name: Am,
      preprocessEvent(r, s, i) {
        const o = i.getOptions()
        Mf(Ws, o.stackParser, n, t, r, s)
      },
    }
  },
  Nm = Om
function Lm() {
  return Dm()
    ? (ke &&
        Ze(() => {
          console.error(
            '[Sentry] You cannot use Sentry.init() in a browser extension, see: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/'
          )
        }),
      !0)
    : !1
}
function Dm() {
  if (typeof j.window > 'u') return !1
  const e = j
  if (e.nw || !(e.chrome || e.browser)?.runtime?.id) return !1
  const n = Ut(),
    r = [
      'chrome-extension',
      'moz-extension',
      'ms-browser-extension',
      'safari-web-extension',
    ]
  return !(j === j.top && r.some(i => n.startsWith(`${i}://`)))
}
function Pm(e) {
  return [vf(), yf(), fm(), tm(), bm(), Nm(), Lf(), Cm(), ym()]
}
function Fm(e = {}) {
  const t = !e.skipBrowserExtensionCheck && Lm(),
    n = {
      ...e,
      enabled: t ? !1 : e.enabled,
      stackParser: xu(e.stackParser || Qh),
      integrations: Ll({
        integrations: e.integrations,
        defaultIntegrations:
          e.defaultIntegrations == null ? Pm() : e.defaultIntegrations,
      }),
      transport: e.transport || Bh,
    }
  return Kl(bp, n)
}
const Q = $,
  Qs = 'sentryReplaySession',
  Bm = 'replay_event',
  Zs = 'Unable to send Replay',
  $m = 3e5,
  Um = 9e5,
  Hm = 5e3,
  Wm = 5500,
  zm = 6e4,
  jm = 5e3,
  qm = 3,
  _o = 15e4,
  Dn = 5e3,
  Gm = 3e3,
  Vm = 300,
  ei = 2e7,
  Ym = 4999,
  Xm = 15e3,
  yo = 36e5
var Km = Object.defineProperty,
  Jm = (e, t, n) =>
    t in e
      ? Km(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  So = (e, t, n) => Jm(e, typeof t != 'symbol' ? t + '' : t, n),
  ie = (e => (
    (e[(e.Document = 0)] = 'Document'),
    (e[(e.DocumentType = 1)] = 'DocumentType'),
    (e[(e.Element = 2)] = 'Element'),
    (e[(e.Text = 3)] = 'Text'),
    (e[(e.CDATA = 4)] = 'CDATA'),
    (e[(e.Comment = 5)] = 'Comment'),
    e
  ))(ie || {})
function Qm(e) {
  return e.nodeType === e.ELEMENT_NODE
}
function Qt(e) {
  return e?.host?.shadowRoot === e
}
function Zt(e) {
  return Object.prototype.toString.call(e) === '[object ShadowRoot]'
}
function Zm(e) {
  return (
    e.includes(' background-clip: text;') &&
      !e.includes(' -webkit-background-clip: text;') &&
      (e = e.replace(
        /\sbackground-clip:\s*text;/g,
        ' -webkit-background-clip: text; background-clip: text;'
      )),
    e
  )
}
function eg(e) {
  const { cssText: t } = e
  if (t.split('"').length < 3) return t
  const n = ['@import', `url(${JSON.stringify(e.href)})`]
  return (
    e.layerName === ''
      ? n.push('layer')
      : e.layerName && n.push(`layer(${e.layerName})`),
    e.supportsText && n.push(`supports(${e.supportsText})`),
    e.media.length && n.push(e.media.mediaText),
    n.join(' ') + ';'
  )
}
function ar(e) {
  try {
    const t = e.rules || e.cssRules
    return t ? Zm(Array.from(t, Cc).join('')) : null
  } catch {
    return null
  }
}
function tg(e) {
  let t = ''
  for (let n = 0; n < e.style.length; n++) {
    const r = e.style,
      s = r[n],
      i = r.getPropertyPriority(s)
    t += `${s}:${r.getPropertyValue(s)}${i ? ' !important' : ''};`
  }
  return `${e.selectorText} { ${t} }`
}
function Cc(e) {
  let t
  if (rg(e))
    try {
      t = ar(e.styleSheet) || eg(e)
    } catch {}
  else if (sg(e)) {
    let n = e.cssText
    const r = e.selectorText.includes(':'),
      s = typeof e.style.all == 'string' && e.style.all
    if ((s && (n = tg(e)), r && (n = ng(n)), r || s)) return n
  }
  return t || e.cssText
}
function ng(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm
  return e.replace(t, '$1\\$2')
}
function rg(e) {
  return 'styleSheet' in e
}
function sg(e) {
  return 'selectorText' in e
}
class xc {
  constructor() {
    ;(So(this, 'idNodeMap', new Map()), So(this, 'nodeMetaMap', new WeakMap()))
  }
  getId(t) {
    return t ? (this.getMeta(t)?.id ?? -1) : -1
  }
  getNode(t) {
    return this.idNodeMap.get(t) || null
  }
  getIds() {
    return Array.from(this.idNodeMap.keys())
  }
  getMeta(t) {
    return this.nodeMetaMap.get(t) || null
  }
  removeNodeFromMap(t) {
    const n = this.getId(t)
    ;(this.idNodeMap.delete(n),
      t.childNodes && t.childNodes.forEach(r => this.removeNodeFromMap(r)))
  }
  has(t) {
    return this.idNodeMap.has(t)
  }
  hasNode(t) {
    return this.nodeMetaMap.has(t)
  }
  add(t, n) {
    const r = n.id
    ;(this.idNodeMap.set(r, t), this.nodeMetaMap.set(t, n))
  }
  replace(t, n) {
    const r = this.getNode(t)
    if (r) {
      const s = this.nodeMetaMap.get(r)
      s && this.nodeMetaMap.set(n, s)
    }
    this.idNodeMap.set(t, n)
  }
  reset() {
    ;((this.idNodeMap = new Map()), (this.nodeMetaMap = new WeakMap()))
  }
}
function ig() {
  return new xc()
}
function Tr({ maskInputOptions: e, tagName: t, type: n }) {
  return (
    t === 'OPTION' && (t = 'SELECT'),
    !!(
      e[t.toLowerCase()] ||
      (n && e[n]) ||
      n === 'password' ||
      (t === 'INPUT' && !n && e.text)
    )
  )
}
function on({ isMasked: e, element: t, value: n, maskInputFn: r }) {
  let s = n || ''
  return e ? (r && (s = r(s, t)), '*'.repeat(s.length)) : s
}
function Dt(e) {
  return e.toLowerCase()
}
function ps(e) {
  return e.toUpperCase()
}
const Eo = '__rrweb_original__'
function og(e) {
  const t = e.getContext('2d')
  if (!t) return !0
  const n = 50
  for (let r = 0; r < e.width; r += n)
    for (let s = 0; s < e.height; s += n) {
      const i = t.getImageData,
        o = Eo in i ? i[Eo] : i
      if (
        new Uint32Array(
          o.call(
            t,
            r,
            s,
            Math.min(n, e.width - r),
            Math.min(n, e.height - s)
          ).data.buffer
        ).some(a => a !== 0)
      )
        return !1
    }
  return !0
}
function ti(e) {
  const t = e.type
  return e.hasAttribute('data-rr-is-password') ? 'password' : t ? Dt(t) : null
}
function cr(e, t, n) {
  return t === 'INPUT' && (n === 'radio' || n === 'checkbox')
    ? e.getAttribute('value') || ''
    : e.value
}
function Mc(e, t) {
  let n
  try {
    n = new URL(e, t ?? window.location.href)
  } catch {
    return null
  }
  const r = /\.([0-9a-z]+)(?:$)/i
  return n.pathname.match(r)?.[1] ?? null
}
const bo = {}
function Ac(e) {
  const t = bo[e]
  if (t) return t
  const n = window.document
  let r = window[e]
  if (n && typeof n.createElement == 'function')
    try {
      const s = n.createElement('iframe')
      ;((s.hidden = !0), n.head.appendChild(s))
      const i = s.contentWindow
      ;(i && i[e] && (r = i[e]), n.head.removeChild(s))
    } catch {}
  return (bo[e] = r.bind(window))
}
function hs(...e) {
  return Ac('setTimeout')(...e)
}
function Oc(...e) {
  return Ac('clearTimeout')(...e)
}
function Nc(e) {
  try {
    return e.contentDocument
  } catch {}
}
let ag = 1
const cg = new RegExp('[^a-z0-9-_:]'),
  an = -2
function ni() {
  return ag++
}
function ug(e) {
  if (e instanceof HTMLFormElement) return 'form'
  const t = Dt(e.tagName)
  return cg.test(t) ? 'div' : t
}
function dg(e) {
  let t = ''
  return (
    e.indexOf('//') > -1
      ? (t = e.split('/').slice(0, 3).join('/'))
      : (t = e.split('/')[0]),
    (t = t.split('?')[0]),
    t
  )
}
let Et, vo
const lg = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm,
  fg = /^(?:[a-z+]+:)?\/\//i,
  pg = /^www\..*/i,
  hg = /^(data:)([^,]*),(.*)/i
function ur(e, t) {
  return (e || '').replace(lg, (n, r, s, i, o, c) => {
    const a = s || o || c,
      u = r || i || ''
    if (!a) return n
    if (fg.test(a) || pg.test(a)) return `url(${u}${a}${u})`
    if (hg.test(a)) return `url(${u}${a}${u})`
    if (a[0] === '/') return `url(${u}${dg(t) + a}${u})`
    const l = t.split('/'),
      d = a.split('/')
    l.pop()
    for (const p of d) p !== '.' && (p === '..' ? l.pop() : l.push(p))
    return `url(${u}${l.join('/')}${u})`
  })
}
const mg = /^[^ \t\n\r\u000c]+/,
  gg = /^[, \t\n\r\u000c]+/
function _g(e, t) {
  if (t.trim() === '') return t
  let n = 0
  function r(i) {
    let o
    const c = i.exec(t.substring(n))
    return c ? ((o = c[0]), (n += o.length), o) : ''
  }
  const s = []
  for (; r(gg), !(n >= t.length); ) {
    let i = r(mg)
    if (i.slice(-1) === ',')
      ((i = Tt(e, i.substring(0, i.length - 1))), s.push(i))
    else {
      let o = ''
      i = Tt(e, i)
      let c = !1
      for (;;) {
        const a = t.charAt(n)
        if (a === '') {
          s.push((i + o).trim())
          break
        } else if (c) a === ')' && (c = !1)
        else if (a === ',') {
          ;((n += 1), s.push((i + o).trim()))
          break
        } else a === '(' && (c = !0)
        ;((o += a), (n += 1))
      }
    }
  }
  return s.join(', ')
}
const To = new WeakMap()
function Tt(e, t) {
  return !t || t.trim() === '' ? t : Ir(e, t)
}
function yg(e) {
  return !!(e.tagName === 'svg' || e.ownerSVGElement)
}
function Ir(e, t) {
  let n = To.get(e)
  if ((n || ((n = e.createElement('a')), To.set(e, n)), !t)) t = ''
  else if (t.startsWith('blob:') || t.startsWith('data:')) return t
  return (n.setAttribute('href', t), n.href)
}
function Lc(e, t, n, r, s, i) {
  return (
    r &&
    (n === 'src' ||
    (n === 'href' && !(t === 'use' && r[0] === '#')) ||
    (n === 'xlink:href' && r[0] !== '#') ||
    (n === 'background' && (t === 'table' || t === 'td' || t === 'th'))
      ? Tt(e, r)
      : n === 'srcset'
        ? _g(e, r)
        : n === 'style'
          ? ur(r, Ir(e))
          : t === 'object' && n === 'data'
            ? Tt(e, r)
            : typeof i == 'function'
              ? i(n, r, s)
              : r)
  )
}
function Dc(e, t, n) {
  return (e === 'video' || e === 'audio') && t === 'autoplay'
}
function Sg(e, t, n, r) {
  try {
    if (r && e.matches(r)) return !1
    if (typeof t == 'string') {
      if (e.classList.contains(t)) return !0
    } else
      for (let s = e.classList.length; s--; ) {
        const i = e.classList[s]
        if (t.test(i)) return !0
      }
    if (n) return e.matches(n)
  } catch {}
  return !1
}
function Eg(e, t) {
  for (let n = e.classList.length; n--; ) {
    const r = e.classList[n]
    if (t.test(r)) return !0
  }
  return !1
}
function at(e, t, n = 1 / 0, r = 0) {
  return !e || e.nodeType !== e.ELEMENT_NODE || r > n
    ? -1
    : t(e)
      ? r
      : at(e.parentNode, t, n, r + 1)
}
function It(e, t) {
  return n => {
    const r = n
    if (r === null) return !1
    try {
      if (e) {
        if (typeof e == 'string') {
          if (r.matches(`.${e}`)) return !0
        } else if (Eg(r, e)) return !0
      }
      return !!(t && r.matches(t))
    } catch {
      return !1
    }
  }
}
function Pt(e, t, n, r, s, i) {
  try {
    const o = e.nodeType === e.ELEMENT_NODE ? e : e.parentElement
    if (o === null) return !1
    if (o.tagName === 'INPUT') {
      const u = o.getAttribute('autocomplete')
      if (
        [
          'current-password',
          'new-password',
          'cc-number',
          'cc-exp',
          'cc-exp-month',
          'cc-exp-year',
          'cc-csc',
        ].includes(u)
      )
        return !0
    }
    let c = -1,
      a = -1
    if (i) {
      if (((a = at(o, It(r, s))), a < 0)) return !0
      c = at(o, It(t, n), a >= 0 ? a : 1 / 0)
    } else {
      if (((c = at(o, It(t, n))), c < 0)) return !1
      a = at(o, It(r, s), c >= 0 ? c : 1 / 0)
    }
    return c >= 0 ? (a >= 0 ? c <= a : !0) : a >= 0 ? !1 : !!i
  } catch {}
  return !!i
}
function bg(e, t, n) {
  const r = e.contentWindow
  if (!r) return
  let s = !1,
    i
  try {
    i = r.document.readyState
  } catch {
    return
  }
  if (i !== 'complete') {
    const c = hs(() => {
      s || (t(), (s = !0))
    }, n)
    e.addEventListener('load', () => {
      ;(Oc(c), (s = !0), t())
    })
    return
  }
  const o = 'about:blank'
  if (r.location.href !== o || e.src === o || e.src === '')
    return (hs(t, 0), e.addEventListener('load', t))
  e.addEventListener('load', t)
}
function vg(e, t, n) {
  let r = !1,
    s
  try {
    s = e.sheet
  } catch {
    return
  }
  if (s) return
  const i = hs(() => {
    r || (t(), (r = !0))
  }, n)
  e.addEventListener('load', () => {
    ;(Oc(i), (r = !0), t())
  })
}
function Tg(e, t) {
  const {
      doc: n,
      mirror: r,
      blockClass: s,
      blockSelector: i,
      unblockSelector: o,
      maskAllText: c,
      maskAttributeFn: a,
      maskTextClass: u,
      unmaskTextClass: l,
      maskTextSelector: d,
      unmaskTextSelector: p,
      inlineStylesheet: f,
      maskInputOptions: h = {},
      maskTextFn: m,
      maskInputFn: g,
      dataURLOptions: E = {},
      inlineImages: R,
      recordCanvas: P,
      keepIframeSrcFn: N,
      newlyAddedElement: M = !1,
    } = t,
    T = Ig(n, r)
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== 'CSS1Compat'
        ? { type: ie.Document, childNodes: [], compatMode: e.compatMode }
        : { type: ie.Document, childNodes: [] }
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: ie.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: T,
      }
    case e.ELEMENT_NODE:
      return kg(e, {
        doc: n,
        blockClass: s,
        blockSelector: i,
        unblockSelector: o,
        inlineStylesheet: f,
        maskAttributeFn: a,
        maskInputOptions: h,
        maskInputFn: g,
        dataURLOptions: E,
        inlineImages: R,
        recordCanvas: P,
        keepIframeSrcFn: N,
        newlyAddedElement: M,
        rootId: T,
        maskTextClass: u,
        unmaskTextClass: l,
        maskTextSelector: d,
        unmaskTextSelector: p,
      })
    case e.TEXT_NODE:
      return wg(e, {
        doc: n,
        maskAllText: c,
        maskTextClass: u,
        unmaskTextClass: l,
        maskTextSelector: d,
        unmaskTextSelector: p,
        maskTextFn: m,
        maskInputOptions: h,
        maskInputFn: g,
        rootId: T,
      })
    case e.CDATA_SECTION_NODE:
      return { type: ie.CDATA, textContent: '', rootId: T }
    case e.COMMENT_NODE:
      return { type: ie.Comment, textContent: e.textContent || '', rootId: T }
    default:
      return !1
  }
}
function Ig(e, t) {
  if (!t.hasNode(e)) return
  const n = t.getId(e)
  return n === 1 ? void 0 : n
}
function wg(e, t) {
  const {
      maskAllText: n,
      maskTextClass: r,
      unmaskTextClass: s,
      maskTextSelector: i,
      unmaskTextSelector: o,
      maskTextFn: c,
      maskInputOptions: a,
      maskInputFn: u,
      rootId: l,
    } = t,
    d = e.parentNode && e.parentNode.tagName
  let p = e.textContent
  const f = d === 'STYLE' ? !0 : void 0,
    h = d === 'SCRIPT' ? !0 : void 0,
    m = d === 'TEXTAREA' ? !0 : void 0
  if (f && p) {
    try {
      e.nextSibling ||
        e.previousSibling ||
        (e.parentNode.sheet?.cssRules && (p = ar(e.parentNode.sheet)))
    } catch (E) {
      console.warn(
        `Cannot get CSS styles from text's parentNode. Error: ${E}`,
        e
      )
    }
    p = ur(p, Ir(t.doc))
  }
  h && (p = 'SCRIPT_PLACEHOLDER')
  const g = Pt(e, r, i, s, o, n)
  if (
    (!f &&
      !h &&
      !m &&
      p &&
      g &&
      (p = c ? c(p, e.parentElement) : p.replace(/[\S]/g, '*')),
    m &&
      p &&
      (a.textarea || g) &&
      (p = u ? u(p, e.parentNode) : p.replace(/[\S]/g, '*')),
    d === 'OPTION' && p)
  ) {
    const E = Tr({ type: null, tagName: d, maskInputOptions: a })
    p = on({
      isMasked: Pt(e, r, i, s, o, E),
      element: e,
      value: p,
      maskInputFn: u,
    })
  }
  return { type: ie.Text, textContent: p || '', isStyle: f, rootId: l }
}
function kg(e, t) {
  const {
      doc: n,
      blockClass: r,
      blockSelector: s,
      unblockSelector: i,
      inlineStylesheet: o,
      maskInputOptions: c = {},
      maskAttributeFn: a,
      maskInputFn: u,
      dataURLOptions: l = {},
      inlineImages: d,
      recordCanvas: p,
      keepIframeSrcFn: f,
      newlyAddedElement: h = !1,
      rootId: m,
      maskTextClass: g,
      unmaskTextClass: E,
      maskTextSelector: R,
      unmaskTextSelector: P,
    } = t,
    N = Sg(e, r, s, i),
    M = ug(e)
  let T = {}
  const y = e.attributes.length
  for (let S = 0; S < y; S++) {
    const w = e.attributes[S]
    w.name &&
      !Dc(M, w.name, w.value) &&
      (T[w.name] = Lc(n, M, Dt(w.name), w.value, e, a))
  }
  if (M === 'link' && o) {
    const S = Array.from(n.styleSheets).find(L => L.href === e.href)
    let w = null
    ;(S && (w = ar(S)),
      w &&
        ((T.rel = null),
        (T.href = null),
        (T.crossorigin = null),
        (T._cssText = ur(w, S.href))))
  }
  if (
    M === 'style' &&
    e.sheet &&
    !(e.innerText || e.textContent || '').trim().length
  ) {
    const S = ar(e.sheet)
    S && (T._cssText = ur(S, Ir(n)))
  }
  if (M === 'input' || M === 'textarea' || M === 'select' || M === 'option') {
    const S = e,
      w = ti(S),
      L = cr(S, ps(M), w),
      B = S.checked
    if (w !== 'submit' && w !== 'button' && L) {
      const U = Pt(
        S,
        g,
        R,
        E,
        P,
        Tr({ type: w, tagName: ps(M), maskInputOptions: c })
      )
      T.value = on({ isMasked: U, element: S, value: L, maskInputFn: u })
    }
    B && (T.checked = B)
  }
  if (
    (M === 'option' &&
      (e.selected && !c.select ? (T.selected = !0) : delete T.selected),
    M === 'canvas' && p)
  ) {
    if (e.__context === '2d')
      og(e) || (T.rr_dataURL = e.toDataURL(l.type, l.quality))
    else if (!('__context' in e)) {
      const S = e.toDataURL(l.type, l.quality),
        w = n.createElement('canvas')
      ;((w.width = e.width), (w.height = e.height))
      const L = w.toDataURL(l.type, l.quality)
      S !== L && (T.rr_dataURL = S)
    }
  }
  if (M === 'img' && d) {
    Et || ((Et = n.createElement('canvas')), (vo = Et.getContext('2d')))
    const S = e,
      w = S.currentSrc || S.getAttribute('src') || '<unknown-src>',
      L = S.crossOrigin,
      B = () => {
        S.removeEventListener('load', B)
        try {
          ;((Et.width = S.naturalWidth),
            (Et.height = S.naturalHeight),
            vo.drawImage(S, 0, 0),
            (T.rr_dataURL = Et.toDataURL(l.type, l.quality)))
        } catch (U) {
          if (S.crossOrigin !== 'anonymous') {
            ;((S.crossOrigin = 'anonymous'),
              S.complete && S.naturalWidth !== 0
                ? B()
                : S.addEventListener('load', B))
            return
          } else console.warn(`Cannot inline img src=${w}! Error: ${U}`)
        }
        S.crossOrigin === 'anonymous' &&
          (L ? (T.crossOrigin = L) : S.removeAttribute('crossorigin'))
      }
    S.complete && S.naturalWidth !== 0 ? B() : S.addEventListener('load', B)
  }
  if (
    ((M === 'audio' || M === 'video') &&
      ((T.rr_mediaState = e.paused ? 'paused' : 'played'),
      (T.rr_mediaCurrentTime = e.currentTime)),
    h ||
      (e.scrollLeft && (T.rr_scrollLeft = e.scrollLeft),
      e.scrollTop && (T.rr_scrollTop = e.scrollTop)),
    N)
  ) {
    const { width: S, height: w } = e.getBoundingClientRect()
    T = { class: T.class, rr_width: `${S}px`, rr_height: `${w}px` }
  }
  M === 'iframe' &&
    !f(T.src) &&
    (!N && !Nc(e) && (T.rr_src = T.src), delete T.src)
  let I
  try {
    customElements.get(M) && (I = !0)
  } catch {}
  return {
    type: ie.Element,
    tagName: M,
    attributes: T,
    childNodes: [],
    isSVG: yg(e) || void 0,
    needBlock: N,
    rootId: m,
    isCustom: I,
  }
}
function J(e) {
  return e == null ? '' : e.toLowerCase()
}
function Rg(e, t) {
  if (t.comment && e.type === ie.Comment) return !0
  if (e.type === ie.Element) {
    if (
      t.script &&
      (e.tagName === 'script' ||
        (e.tagName === 'link' &&
          (e.attributes.rel === 'preload' ||
            e.attributes.rel === 'modulepreload')) ||
        (e.tagName === 'link' &&
          e.attributes.rel === 'prefetch' &&
          typeof e.attributes.href == 'string' &&
          Mc(e.attributes.href) === 'js'))
    )
      return !0
    if (
      t.headFavicon &&
      ((e.tagName === 'link' && e.attributes.rel === 'shortcut icon') ||
        (e.tagName === 'meta' &&
          (J(e.attributes.name).match(/^msapplication-tile(image|color)$/) ||
            J(e.attributes.name) === 'application-name' ||
            J(e.attributes.rel) === 'icon' ||
            J(e.attributes.rel) === 'apple-touch-icon' ||
            J(e.attributes.rel) === 'shortcut icon')))
    )
      return !0
    if (e.tagName === 'meta') {
      if (
        t.headMetaDescKeywords &&
        J(e.attributes.name).match(/^description|keywords$/)
      )
        return !0
      if (
        t.headMetaSocial &&
        (J(e.attributes.property).match(/^(og|twitter|fb):/) ||
          J(e.attributes.name).match(/^(og|twitter):/) ||
          J(e.attributes.name) === 'pinterest')
      )
        return !0
      if (
        t.headMetaRobots &&
        (J(e.attributes.name) === 'robots' ||
          J(e.attributes.name) === 'googlebot' ||
          J(e.attributes.name) === 'bingbot')
      )
        return !0
      if (t.headMetaHttpEquiv && e.attributes['http-equiv'] !== void 0)
        return !0
      if (
        t.headMetaAuthorship &&
        (J(e.attributes.name) === 'author' ||
          J(e.attributes.name) === 'generator' ||
          J(e.attributes.name) === 'framework' ||
          J(e.attributes.name) === 'publisher' ||
          J(e.attributes.name) === 'progid' ||
          J(e.attributes.property).match(/^article:/) ||
          J(e.attributes.property).match(/^product:/))
      )
        return !0
      if (
        t.headMetaVerification &&
        (J(e.attributes.name) === 'google-site-verification' ||
          J(e.attributes.name) === 'yandex-verification' ||
          J(e.attributes.name) === 'csrf-token' ||
          J(e.attributes.name) === 'p:domain_verify' ||
          J(e.attributes.name) === 'verify-v1' ||
          J(e.attributes.name) === 'verification' ||
          J(e.attributes.name) === 'shopify-checkout-api-token')
      )
        return !0
    }
  }
  return !1
}
function wt(e, t) {
  const {
    doc: n,
    mirror: r,
    blockClass: s,
    blockSelector: i,
    unblockSelector: o,
    maskAllText: c,
    maskTextClass: a,
    unmaskTextClass: u,
    maskTextSelector: l,
    unmaskTextSelector: d,
    skipChild: p = !1,
    inlineStylesheet: f = !0,
    maskInputOptions: h = {},
    maskAttributeFn: m,
    maskTextFn: g,
    maskInputFn: E,
    slimDOMOptions: R,
    dataURLOptions: P = {},
    inlineImages: N = !1,
    recordCanvas: M = !1,
    onSerialize: T,
    onIframeLoad: y,
    iframeLoadTimeout: I = 5e3,
    onBlockedImageLoad: S,
    onStylesheetLoad: w,
    stylesheetLoadTimeout: L = 5e3,
    keepIframeSrcFn: B = () => !1,
    newlyAddedElement: U = !1,
  } = t
  let { preserveWhiteSpace: Z = !0 } = t
  const te = Tg(e, {
    doc: n,
    mirror: r,
    blockClass: s,
    blockSelector: i,
    maskAllText: c,
    unblockSelector: o,
    maskTextClass: a,
    unmaskTextClass: u,
    maskTextSelector: l,
    unmaskTextSelector: d,
    inlineStylesheet: f,
    maskInputOptions: h,
    maskAttributeFn: m,
    maskTextFn: g,
    maskInputFn: E,
    dataURLOptions: P,
    inlineImages: N,
    recordCanvas: M,
    keepIframeSrcFn: B,
    newlyAddedElement: U,
  })
  if (!te) return (console.warn(e, 'not serialized'), null)
  let K
  r.hasNode(e)
    ? (K = r.getId(e))
    : Rg(te, R) ||
        (!Z &&
          te.type === ie.Text &&
          !te.isStyle &&
          !te.textContent.replace(/^\s+|\s+$/gm, '').length)
      ? (K = an)
      : (K = ni())
  const b = Object.assign(te, { id: K })
  if ((r.add(e, b), K === an)) return null
  T && T(e)
  let q = !p
  if (b.type === ie.Element) {
    q = q && !b.needBlock
    const k = e.shadowRoot
    k && Zt(k) && (b.isShadowHost = !0)
  }
  if ((b.type === ie.Document || b.type === ie.Element) && q) {
    R.headWhitespace &&
      b.type === ie.Element &&
      b.tagName === 'head' &&
      (Z = !1)
    const k = {
        doc: n,
        mirror: r,
        blockClass: s,
        blockSelector: i,
        maskAllText: c,
        unblockSelector: o,
        maskTextClass: a,
        unmaskTextClass: u,
        maskTextSelector: l,
        unmaskTextSelector: d,
        skipChild: p,
        inlineStylesheet: f,
        maskInputOptions: h,
        maskAttributeFn: m,
        maskTextFn: g,
        maskInputFn: E,
        slimDOMOptions: R,
        dataURLOptions: P,
        inlineImages: N,
        recordCanvas: M,
        preserveWhiteSpace: Z,
        onSerialize: T,
        onIframeLoad: y,
        iframeLoadTimeout: I,
        onBlockedImageLoad: S,
        onStylesheetLoad: w,
        stylesheetLoadTimeout: L,
        keepIframeSrcFn: B,
      },
      G = e.childNodes ? Array.from(e.childNodes) : []
    for (const ne of G) {
      const ee = wt(ne, k)
      ee && b.childNodes.push(ee)
    }
    if (Qm(e) && e.shadowRoot)
      for (const ne of Array.from(e.shadowRoot.childNodes)) {
        const ee = wt(ne, k)
        ee && (Zt(e.shadowRoot) && (ee.isShadow = !0), b.childNodes.push(ee))
      }
  }
  if (
    (e.parentNode && Qt(e.parentNode) && Zt(e.parentNode) && (b.isShadow = !0),
    b.type === ie.Element &&
      b.tagName === 'iframe' &&
      !b.needBlock &&
      bg(
        e,
        () => {
          const k = Nc(e)
          if (k && y) {
            const G = wt(k, {
              doc: k,
              mirror: r,
              blockClass: s,
              blockSelector: i,
              unblockSelector: o,
              maskAllText: c,
              maskTextClass: a,
              unmaskTextClass: u,
              maskTextSelector: l,
              unmaskTextSelector: d,
              skipChild: !1,
              inlineStylesheet: f,
              maskInputOptions: h,
              maskAttributeFn: m,
              maskTextFn: g,
              maskInputFn: E,
              slimDOMOptions: R,
              dataURLOptions: P,
              inlineImages: N,
              recordCanvas: M,
              preserveWhiteSpace: Z,
              onSerialize: T,
              onIframeLoad: y,
              iframeLoadTimeout: I,
              onStylesheetLoad: w,
              stylesheetLoadTimeout: L,
              keepIframeSrcFn: B,
            })
            G && y(e, G)
          }
        },
        I
      ),
    b.type === ie.Element && b.tagName === 'img' && !e.complete && b.needBlock)
  ) {
    const k = e,
      G = () => {
        if (k.isConnected && !k.complete && S)
          try {
            const ne = k.getBoundingClientRect()
            ne.width > 0 && ne.height > 0 && S(k, b, ne)
          } catch {}
        k.removeEventListener('load', G)
      }
    k.isConnected && k.addEventListener('load', G)
  }
  return (
    b.type === ie.Element &&
      b.tagName === 'link' &&
      typeof b.attributes.rel == 'string' &&
      (b.attributes.rel === 'stylesheet' ||
        (b.attributes.rel === 'preload' &&
          typeof b.attributes.href == 'string' &&
          Mc(b.attributes.href) === 'css')) &&
      vg(
        e,
        () => {
          if (w) {
            const k = wt(e, {
              doc: n,
              mirror: r,
              blockClass: s,
              blockSelector: i,
              unblockSelector: o,
              maskAllText: c,
              maskTextClass: a,
              unmaskTextClass: u,
              maskTextSelector: l,
              unmaskTextSelector: d,
              skipChild: !1,
              inlineStylesheet: f,
              maskInputOptions: h,
              maskAttributeFn: m,
              maskTextFn: g,
              maskInputFn: E,
              slimDOMOptions: R,
              dataURLOptions: P,
              inlineImages: N,
              recordCanvas: M,
              preserveWhiteSpace: Z,
              onSerialize: T,
              onIframeLoad: y,
              iframeLoadTimeout: I,
              onStylesheetLoad: w,
              stylesheetLoadTimeout: L,
              keepIframeSrcFn: B,
            })
            k && w(e, k)
          }
        },
        L
      ),
    b.type === ie.Element && delete b.needBlock,
    b
  )
}
function Cg(e, t) {
  const {
    mirror: n = new xc(),
    blockClass: r = 'rr-block',
    blockSelector: s = null,
    unblockSelector: i = null,
    maskAllText: o = !1,
    maskTextClass: c = 'rr-mask',
    unmaskTextClass: a = null,
    maskTextSelector: u = null,
    unmaskTextSelector: l = null,
    inlineStylesheet: d = !0,
    inlineImages: p = !1,
    recordCanvas: f = !1,
    maskAllInputs: h = !1,
    maskAttributeFn: m,
    maskTextFn: g,
    maskInputFn: E,
    slimDOM: R = !1,
    dataURLOptions: P,
    preserveWhiteSpace: N,
    onSerialize: M,
    onIframeLoad: T,
    iframeLoadTimeout: y,
    onBlockedImageLoad: I,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: w,
    keepIframeSrcFn: L = () => !1,
  } = t || {}
  return wt(e, {
    doc: e,
    mirror: n,
    blockClass: r,
    blockSelector: s,
    unblockSelector: i,
    maskAllText: o,
    maskTextClass: c,
    unmaskTextClass: a,
    maskTextSelector: u,
    unmaskTextSelector: l,
    skipChild: !1,
    inlineStylesheet: d,
    maskInputOptions:
      h === !0
        ? {
            color: !0,
            date: !0,
            'datetime-local': !0,
            email: !0,
            month: !0,
            number: !0,
            range: !0,
            search: !0,
            tel: !0,
            text: !0,
            time: !0,
            url: !0,
            week: !0,
            textarea: !0,
            select: !0,
          }
        : h === !1
          ? {}
          : h,
    maskAttributeFn: m,
    maskTextFn: g,
    maskInputFn: E,
    slimDOMOptions:
      R === !0 || R === 'all'
        ? {
            script: !0,
            comment: !0,
            headFavicon: !0,
            headWhitespace: !0,
            headMetaDescKeywords: R === 'all',
            headMetaSocial: !0,
            headMetaRobots: !0,
            headMetaHttpEquiv: !0,
            headMetaAuthorship: !0,
            headMetaVerification: !0,
          }
        : R === !1
          ? {}
          : R,
    dataURLOptions: P,
    inlineImages: p,
    recordCanvas: f,
    preserveWhiteSpace: N,
    onSerialize: M,
    onIframeLoad: T,
    iframeLoadTimeout: y,
    onBlockedImageLoad: I,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: w,
    keepIframeSrcFn: L,
    newlyAddedElement: !1,
  })
}
function he(e, t, n = document) {
  const r = { capture: !0, passive: !0 }
  return (n.addEventListener(e, t, r), () => n.removeEventListener(e, t, r))
}
const bt = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`
let Io = {
  map: {},
  getId() {
    return (console.error(bt), -1)
  },
  getNode() {
    return (console.error(bt), null)
  },
  removeNodeFromMap() {
    console.error(bt)
  },
  has() {
    return (console.error(bt), !1)
  },
  reset() {
    console.error(bt)
  },
}
typeof window < 'u' &&
  window.Proxy &&
  window.Reflect &&
  (Io = new Proxy(Io, {
    get(e, t, n) {
      return (t === 'map' && console.error(bt), Reflect.get(e, t, n))
    },
  }))
function cn(e, t, n = {}) {
  let r = null,
    s = 0
  return function (...i) {
    const o = Date.now()
    !s && n.leading === !1 && (s = o)
    const c = t - (o - s),
      a = this
    c <= 0 || c > t
      ? (r && (Dg(r), (r = null)), (s = o), e.apply(a, i))
      : !r &&
        n.trailing !== !1 &&
        (r = wr(() => {
          ;((s = n.leading === !1 ? 0 : Date.now()), (r = null), e.apply(a, i))
        }, c))
  }
}
function Pc(e, t, n, r, s = window) {
  const i = s.Object.getOwnPropertyDescriptor(e, t)
  return (
    s.Object.defineProperty(
      e,
      t,
      r
        ? n
        : {
            set(o) {
              ;(wr(() => {
                n.set.call(this, o)
              }, 0),
                i && i.set && i.set.call(this, o))
            },
          }
    ),
    () => Pc(e, t, i || {}, !0)
  )
}
function ri(e, t, n) {
  try {
    if (!(t in e)) return () => {}
    const r = e[t],
      s = n(r)
    return (
      typeof s == 'function' &&
        ((s.prototype = s.prototype || {}),
        Object.defineProperties(s, {
          __rrweb_original__: { enumerable: !1, value: r },
        })),
      (e[t] = s),
      () => {
        e[t] = r
      }
    )
  } catch {
    return () => {}
  }
}
let dr = Date.now
;/[1-9][0-9]{12}/.test(Date.now().toString()) ||
  (dr = () => new Date().getTime())
function Fc(e) {
  const t = e.document
  return {
    left: t.scrollingElement
      ? t.scrollingElement.scrollLeft
      : e.pageXOffset !== void 0
        ? e.pageXOffset
        : t?.documentElement.scrollLeft ||
          t?.body?.parentElement?.scrollLeft ||
          t?.body?.scrollLeft ||
          0,
    top: t.scrollingElement
      ? t.scrollingElement.scrollTop
      : e.pageYOffset !== void 0
        ? e.pageYOffset
        : t?.documentElement.scrollTop ||
          t?.body?.parentElement?.scrollTop ||
          t?.body?.scrollTop ||
          0,
  }
}
function Bc() {
  return (
    window.innerHeight ||
    (document.documentElement && document.documentElement.clientHeight) ||
    (document.body && document.body.clientHeight)
  )
}
function $c() {
  return (
    window.innerWidth ||
    (document.documentElement && document.documentElement.clientWidth) ||
    (document.body && document.body.clientWidth)
  )
}
function Uc(e) {
  if (!e) return null
  try {
    return e.nodeType === e.ELEMENT_NODE ? e : e.parentElement
  } catch {
    return null
  }
}
function ye(e, t, n, r, s) {
  if (!e) return !1
  const i = Uc(e)
  if (!i) return !1
  const o = It(t, n)
  if (!s) {
    const u = r && i.matches(r)
    return o(i) && !u
  }
  const c = at(i, o)
  let a = -1
  return c < 0
    ? !1
    : (r && (a = at(i, It(null, r))), c > -1 && a < 0 ? !0 : c < a)
}
function xg(e, t) {
  return t.getId(e) !== -1
}
function zr(e, t) {
  return t.getId(e) === an
}
function Hc(e, t) {
  if (Qt(e)) return !1
  const n = t.getId(e)
  return t.has(n)
    ? e.parentNode && e.parentNode.nodeType === e.DOCUMENT_NODE
      ? !1
      : e.parentNode
        ? Hc(e.parentNode, t)
        : !0
    : !0
}
function ms(e) {
  return !!e.changedTouches
}
function Mg(e = window) {
  ;('NodeList' in e &&
    !e.NodeList.prototype.forEach &&
    (e.NodeList.prototype.forEach = Array.prototype.forEach),
    'DOMTokenList' in e &&
      !e.DOMTokenList.prototype.forEach &&
      (e.DOMTokenList.prototype.forEach = Array.prototype.forEach),
    Node.prototype.contains ||
      (Node.prototype.contains = (...t) => {
        let n = t[0]
        if (!(0 in t)) throw new TypeError('1 argument is required')
        do if (this === n) return !0
        while ((n = n && n.parentNode))
        return !1
      }))
}
function Wc(e, t) {
  return !!(e.nodeName === 'IFRAME' && t.getMeta(e))
}
function zc(e, t) {
  return !!(
    e.nodeName === 'LINK' &&
    e.nodeType === e.ELEMENT_NODE &&
    e.getAttribute &&
    e.getAttribute('rel') === 'stylesheet' &&
    t.getMeta(e)
  )
}
function gs(e) {
  return !!e?.shadowRoot
}
class Ag {
  constructor() {
    ;((this.id = 1),
      (this.styleIDMap = new WeakMap()),
      (this.idStyleMap = new Map()))
  }
  getId(t) {
    return this.styleIDMap.get(t) ?? -1
  }
  has(t) {
    return this.styleIDMap.has(t)
  }
  add(t, n) {
    if (this.has(t)) return this.getId(t)
    let r
    return (
      n === void 0 ? (r = this.id++) : (r = n),
      this.styleIDMap.set(t, r),
      this.idStyleMap.set(r, t),
      r
    )
  }
  getStyle(t) {
    return this.idStyleMap.get(t) || null
  }
  reset() {
    ;((this.styleIDMap = new WeakMap()),
      (this.idStyleMap = new Map()),
      (this.id = 1))
  }
  generateId() {
    return this.id++
  }
}
function jc(e) {
  let t = null
  return (
    e.getRootNode?.()?.nodeType === Node.DOCUMENT_FRAGMENT_NODE &&
      e.getRootNode().host &&
      (t = e.getRootNode().host),
    t
  )
}
function Og(e) {
  let t = e,
    n
  for (; (n = jc(t)); ) t = n
  return t
}
function Ng(e) {
  const t = e.ownerDocument
  if (!t) return !1
  const n = Og(e)
  return t.contains(n)
}
function qc(e) {
  const t = e.ownerDocument
  return t ? t.contains(e) || Ng(e) : !1
}
const wo = {}
function si(e) {
  const t = wo[e]
  if (t) return t
  const n = window.document
  let r = window[e]
  if (n && typeof n.createElement == 'function')
    try {
      const s = n.createElement('iframe')
      ;((s.hidden = !0), n.head.appendChild(s))
      const i = s.contentWindow
      ;(i && i[e] && (r = i[e]), n.head.removeChild(s))
    } catch {}
  return (wo[e] = r.bind(window))
}
function Lg(...e) {
  return si('requestAnimationFrame')(...e)
}
function wr(...e) {
  return si('setTimeout')(...e)
}
function Dg(...e) {
  return si('clearTimeout')(...e)
}
var D = (e => (
    (e[(e.DomContentLoaded = 0)] = 'DomContentLoaded'),
    (e[(e.Load = 1)] = 'Load'),
    (e[(e.FullSnapshot = 2)] = 'FullSnapshot'),
    (e[(e.IncrementalSnapshot = 3)] = 'IncrementalSnapshot'),
    (e[(e.Meta = 4)] = 'Meta'),
    (e[(e.Custom = 5)] = 'Custom'),
    (e[(e.Plugin = 6)] = 'Plugin'),
    e
  ))(D || {}),
  A = (e => (
    (e[(e.Mutation = 0)] = 'Mutation'),
    (e[(e.MouseMove = 1)] = 'MouseMove'),
    (e[(e.MouseInteraction = 2)] = 'MouseInteraction'),
    (e[(e.Scroll = 3)] = 'Scroll'),
    (e[(e.ViewportResize = 4)] = 'ViewportResize'),
    (e[(e.Input = 5)] = 'Input'),
    (e[(e.TouchMove = 6)] = 'TouchMove'),
    (e[(e.MediaInteraction = 7)] = 'MediaInteraction'),
    (e[(e.StyleSheetRule = 8)] = 'StyleSheetRule'),
    (e[(e.CanvasMutation = 9)] = 'CanvasMutation'),
    (e[(e.Font = 10)] = 'Font'),
    (e[(e.Log = 11)] = 'Log'),
    (e[(e.Drag = 12)] = 'Drag'),
    (e[(e.StyleDeclaration = 13)] = 'StyleDeclaration'),
    (e[(e.Selection = 14)] = 'Selection'),
    (e[(e.AdoptedStyleSheet = 15)] = 'AdoptedStyleSheet'),
    (e[(e.CustomElement = 16)] = 'CustomElement'),
    e
  ))(A || {}),
  pe = (e => (
    (e[(e.MouseUp = 0)] = 'MouseUp'),
    (e[(e.MouseDown = 1)] = 'MouseDown'),
    (e[(e.Click = 2)] = 'Click'),
    (e[(e.ContextMenu = 3)] = 'ContextMenu'),
    (e[(e.DblClick = 4)] = 'DblClick'),
    (e[(e.Focus = 5)] = 'Focus'),
    (e[(e.Blur = 6)] = 'Blur'),
    (e[(e.TouchStart = 7)] = 'TouchStart'),
    (e[(e.TouchMove_Departed = 8)] = 'TouchMove_Departed'),
    (e[(e.TouchEnd = 9)] = 'TouchEnd'),
    (e[(e.TouchCancel = 10)] = 'TouchCancel'),
    e
  ))(pe || {}),
  Be = (e => (
    (e[(e.Mouse = 0)] = 'Mouse'),
    (e[(e.Pen = 1)] = 'Pen'),
    (e[(e.Touch = 2)] = 'Touch'),
    e
  ))(Be || {}),
  vt = (e => (
    (e[(e.Play = 0)] = 'Play'),
    (e[(e.Pause = 1)] = 'Pause'),
    (e[(e.Seeked = 2)] = 'Seeked'),
    (e[(e.VolumeChange = 3)] = 'VolumeChange'),
    (e[(e.RateChange = 4)] = 'RateChange'),
    e
  ))(vt || {})
function ii(e) {
  try {
    return e.contentDocument
  } catch {}
}
function Pg(e) {
  try {
    return e.contentWindow
  } catch {}
}
function ko(e) {
  return '__ln' in e
}
class Fg {
  constructor() {
    ;((this.length = 0), (this.head = null), (this.tail = null))
  }
  get(t) {
    if (t >= this.length) throw new Error('Position outside of list range')
    let n = this.head
    for (let r = 0; r < t; r++) n = n?.next || null
    return n
  }
  addNode(t) {
    const n = { value: t, previous: null, next: null }
    if (((t.__ln = n), t.previousSibling && ko(t.previousSibling))) {
      const r = t.previousSibling.__ln.next
      ;((n.next = r),
        (n.previous = t.previousSibling.__ln),
        (t.previousSibling.__ln.next = n),
        r && (r.previous = n))
    } else if (
      t.nextSibling &&
      ko(t.nextSibling) &&
      t.nextSibling.__ln.previous
    ) {
      const r = t.nextSibling.__ln.previous
      ;((n.previous = r),
        (n.next = t.nextSibling.__ln),
        (t.nextSibling.__ln.previous = n),
        r && (r.next = n))
    } else
      (this.head && (this.head.previous = n),
        (n.next = this.head),
        (this.head = n))
    ;(n.next === null && (this.tail = n), this.length++)
  }
  removeNode(t) {
    const n = t.__ln
    this.head &&
      (n.previous
        ? ((n.previous.next = n.next),
          n.next ? (n.next.previous = n.previous) : (this.tail = n.previous))
        : ((this.head = n.next),
          this.head ? (this.head.previous = null) : (this.tail = null)),
      t.__ln && delete t.__ln,
      this.length--)
  }
}
const Ro = (e, t) => `${e}@${t}`
class Bg {
  constructor() {
    ;((this.frozen = !1),
      (this.locked = !1),
      (this.texts = []),
      (this.attributes = []),
      (this.attributeMap = new WeakMap()),
      (this.removes = []),
      (this.mapRemoves = []),
      (this.movedMap = {}),
      (this.addedSet = new Set()),
      (this.movedSet = new Set()),
      (this.droppedSet = new Set()),
      (this.processMutations = t => {
        ;(t.forEach(this.processMutation), this.emit())
      }),
      (this.emit = () => {
        if (this.frozen || this.locked) return
        const t = [],
          n = new Set(),
          r = new Fg(),
          s = a => {
            let u = a,
              l = an
            for (; l === an; )
              ((u = u && u.nextSibling), (l = u && this.mirror.getId(u)))
            return l
          },
          i = a => {
            if (!a.parentNode || !qc(a)) return
            const u = Qt(a.parentNode)
                ? this.mirror.getId(jc(a))
                : this.mirror.getId(a.parentNode),
              l = s(a)
            if (u === -1 || l === -1) return r.addNode(a)
            const d = wt(a, {
              doc: this.doc,
              mirror: this.mirror,
              blockClass: this.blockClass,
              blockSelector: this.blockSelector,
              maskAllText: this.maskAllText,
              unblockSelector: this.unblockSelector,
              maskTextClass: this.maskTextClass,
              unmaskTextClass: this.unmaskTextClass,
              maskTextSelector: this.maskTextSelector,
              unmaskTextSelector: this.unmaskTextSelector,
              skipChild: !0,
              newlyAddedElement: !0,
              inlineStylesheet: this.inlineStylesheet,
              maskInputOptions: this.maskInputOptions,
              maskAttributeFn: this.maskAttributeFn,
              maskTextFn: this.maskTextFn,
              maskInputFn: this.maskInputFn,
              slimDOMOptions: this.slimDOMOptions,
              dataURLOptions: this.dataURLOptions,
              recordCanvas: this.recordCanvas,
              inlineImages: this.inlineImages,
              onSerialize: p => {
                ;(Wc(p, this.mirror) &&
                  !ye(
                    p,
                    this.blockClass,
                    this.blockSelector,
                    this.unblockSelector,
                    !1
                  ) &&
                  this.iframeManager.addIframe(p),
                  zc(p, this.mirror) &&
                    this.stylesheetManager.trackLinkElement(p),
                  gs(a) &&
                    this.shadowDomManager.addShadowRoot(a.shadowRoot, this.doc))
              },
              onIframeLoad: (p, f) => {
                ye(
                  p,
                  this.blockClass,
                  this.blockSelector,
                  this.unblockSelector,
                  !1
                ) ||
                  (this.iframeManager.attachIframe(p, f),
                  p.contentWindow &&
                    this.canvasManager.addWindow(p.contentWindow),
                  this.shadowDomManager.observeAttachShadow(p))
              },
              onStylesheetLoad: (p, f) => {
                this.stylesheetManager.attachLinkElement(p, f)
              },
              onBlockedImageLoad: (p, f, { width: h, height: m }) => {
                this.mutationCb({
                  adds: [],
                  removes: [],
                  texts: [],
                  attributes: [
                    {
                      id: f.id,
                      attributes: {
                        style: { width: `${h}px`, height: `${m}px` },
                      },
                    },
                  ],
                })
              },
            })
            d && (t.push({ parentId: u, nextId: l, node: d }), n.add(d.id))
          }
        for (; this.mapRemoves.length; )
          this.mirror.removeNodeFromMap(this.mapRemoves.shift())
        for (const a of this.movedSet)
          (Co(this.removes, a, this.mirror) &&
            !this.movedSet.has(a.parentNode)) ||
            i(a)
        for (const a of this.addedSet)
          (!xo(this.droppedSet, a) && !Co(this.removes, a, this.mirror)) ||
          xo(this.movedSet, a)
            ? i(a)
            : this.droppedSet.add(a)
        let o = null
        for (; r.length; ) {
          let a = null
          if (o) {
            const u = this.mirror.getId(o.value.parentNode),
              l = s(o.value)
            u !== -1 && l !== -1 && (a = o)
          }
          if (!a) {
            let u = r.tail
            for (; u; ) {
              const l = u
              if (((u = u.previous), l)) {
                const d = this.mirror.getId(l.value.parentNode)
                if (s(l.value) === -1) continue
                if (d !== -1) {
                  a = l
                  break
                } else {
                  const f = l.value
                  if (
                    f.parentNode &&
                    f.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE
                  ) {
                    const h = f.parentNode.host
                    if (this.mirror.getId(h) !== -1) {
                      a = l
                      break
                    }
                  }
                }
              }
            }
          }
          if (!a) {
            for (; r.head; ) r.removeNode(r.head.value)
            break
          }
          ;((o = a.previous), r.removeNode(a.value), i(a.value))
        }
        const c = {
          texts: this.texts
            .map(a => ({ id: this.mirror.getId(a.node), value: a.value }))
            .filter(a => !n.has(a.id))
            .filter(a => this.mirror.has(a.id)),
          attributes: this.attributes
            .map(a => {
              const { attributes: u } = a
              if (typeof u.style == 'string') {
                const l = JSON.stringify(a.styleDiff),
                  d = JSON.stringify(a._unchangedStyles)
                l.length < u.style.length &&
                  (l + d).split('var(').length ===
                    u.style.split('var(').length &&
                  (u.style = a.styleDiff)
              }
              return { id: this.mirror.getId(a.node), attributes: u }
            })
            .filter(a => !n.has(a.id))
            .filter(a => this.mirror.has(a.id)),
          removes: this.removes,
          adds: t,
        }
        ;(!c.texts.length &&
          !c.attributes.length &&
          !c.removes.length &&
          !c.adds.length) ||
          ((this.texts = []),
          (this.attributes = []),
          (this.attributeMap = new WeakMap()),
          (this.removes = []),
          (this.addedSet = new Set()),
          (this.movedSet = new Set()),
          (this.droppedSet = new Set()),
          (this.movedMap = {}),
          this.mutationCb(c))
      }),
      (this.processMutation = t => {
        if (!zr(t.target, this.mirror))
          switch (t.type) {
            case 'characterData': {
              const n = t.target.textContent
              !ye(
                t.target,
                this.blockClass,
                this.blockSelector,
                this.unblockSelector,
                !1
              ) &&
                n !== t.oldValue &&
                this.texts.push({
                  value:
                    Pt(
                      t.target,
                      this.maskTextClass,
                      this.maskTextSelector,
                      this.unmaskTextClass,
                      this.unmaskTextSelector,
                      this.maskAllText
                    ) && n
                      ? this.maskTextFn
                        ? this.maskTextFn(n, Uc(t.target))
                        : n.replace(/[\S]/g, '*')
                      : n,
                  node: t.target,
                })
              break
            }
            case 'attributes': {
              const n = t.target
              let r = t.attributeName,
                s = t.target.getAttribute(r)
              if (r === 'value') {
                const o = ti(n),
                  c = n.tagName
                s = cr(n, c, o)
                const a = Tr({
                    maskInputOptions: this.maskInputOptions,
                    tagName: c,
                    type: o,
                  }),
                  u = Pt(
                    t.target,
                    this.maskTextClass,
                    this.maskTextSelector,
                    this.unmaskTextClass,
                    this.unmaskTextSelector,
                    a
                  )
                s = on({
                  isMasked: u,
                  element: n,
                  value: s,
                  maskInputFn: this.maskInputFn,
                })
              }
              if (
                ye(
                  t.target,
                  this.blockClass,
                  this.blockSelector,
                  this.unblockSelector,
                  !1
                ) ||
                s === t.oldValue
              )
                return
              let i = this.attributeMap.get(t.target)
              if (
                n.tagName === 'IFRAME' &&
                r === 'src' &&
                !this.keepIframeSrcFn(s)
              )
                if (!ii(n)) r = 'rr_src'
                else return
              if (
                (i ||
                  ((i = {
                    node: t.target,
                    attributes: {},
                    styleDiff: {},
                    _unchangedStyles: {},
                  }),
                  this.attributes.push(i),
                  this.attributeMap.set(t.target, i)),
                r === 'type' &&
                  n.tagName === 'INPUT' &&
                  (t.oldValue || '').toLowerCase() === 'password' &&
                  n.setAttribute('data-rr-is-password', 'true'),
                !Dc(n.tagName, r) &&
                  ((i.attributes[r] = Lc(
                    this.doc,
                    Dt(n.tagName),
                    Dt(r),
                    s,
                    n,
                    this.maskAttributeFn
                  )),
                  r === 'style'))
              ) {
                if (!this.unattachedDoc)
                  try {
                    this.unattachedDoc =
                      document.implementation.createHTMLDocument()
                  } catch {
                    this.unattachedDoc = this.doc
                  }
                const o = this.unattachedDoc.createElement('span')
                t.oldValue && o.setAttribute('style', t.oldValue)
                for (const c of Array.from(n.style)) {
                  const a = n.style.getPropertyValue(c),
                    u = n.style.getPropertyPriority(c)
                  a !== o.style.getPropertyValue(c) ||
                  u !== o.style.getPropertyPriority(c)
                    ? u === ''
                      ? (i.styleDiff[c] = a)
                      : (i.styleDiff[c] = [a, u])
                    : (i._unchangedStyles[c] = [a, u])
                }
                for (const c of Array.from(o.style))
                  n.style.getPropertyValue(c) === '' && (i.styleDiff[c] = !1)
              }
              break
            }
            case 'childList': {
              if (
                ye(
                  t.target,
                  this.blockClass,
                  this.blockSelector,
                  this.unblockSelector,
                  !0
                )
              )
                return
              ;(t.addedNodes.forEach(n => this.genAdds(n, t.target)),
                t.removedNodes.forEach(n => {
                  const r = this.mirror.getId(n),
                    s = Qt(t.target)
                      ? this.mirror.getId(t.target.host)
                      : this.mirror.getId(t.target)
                  ye(
                    t.target,
                    this.blockClass,
                    this.blockSelector,
                    this.unblockSelector,
                    !1
                  ) ||
                    zr(n, this.mirror) ||
                    !xg(n, this.mirror) ||
                    (this.addedSet.has(n)
                      ? (_s(this.addedSet, n), this.droppedSet.add(n))
                      : (this.addedSet.has(t.target) && r === -1) ||
                        Hc(t.target, this.mirror) ||
                        (this.movedSet.has(n) && this.movedMap[Ro(r, s)]
                          ? _s(this.movedSet, n)
                          : this.removes.push({
                              parentId: s,
                              id: r,
                              isShadow:
                                Qt(t.target) && Zt(t.target) ? !0 : void 0,
                            })),
                    this.mapRemoves.push(n))
                }))
              break
            }
          }
      }),
      (this.genAdds = (t, n) => {
        if (
          !this.processedNodeManager.inOtherBuffer(t, this) &&
          !(this.addedSet.has(t) || this.movedSet.has(t))
        ) {
          if (this.mirror.hasNode(t)) {
            if (zr(t, this.mirror)) return
            this.movedSet.add(t)
            let r = null
            ;(n && this.mirror.hasNode(n) && (r = this.mirror.getId(n)),
              r &&
                r !== -1 &&
                (this.movedMap[Ro(this.mirror.getId(t), r)] = !0))
          } else (this.addedSet.add(t), this.droppedSet.delete(t))
          ye(
            t,
            this.blockClass,
            this.blockSelector,
            this.unblockSelector,
            !1
          ) ||
            (t.childNodes && t.childNodes.forEach(r => this.genAdds(r)),
            gs(t) &&
              t.shadowRoot.childNodes.forEach(r => {
                ;(this.processedNodeManager.add(r, this), this.genAdds(r, t))
              }))
        }
      }))
  }
  init(t) {
    ;[
      'mutationCb',
      'blockClass',
      'blockSelector',
      'unblockSelector',
      'maskAllText',
      'maskTextClass',
      'unmaskTextClass',
      'maskTextSelector',
      'unmaskTextSelector',
      'inlineStylesheet',
      'maskInputOptions',
      'maskAttributeFn',
      'maskTextFn',
      'maskInputFn',
      'keepIframeSrcFn',
      'recordCanvas',
      'inlineImages',
      'slimDOMOptions',
      'dataURLOptions',
      'doc',
      'mirror',
      'iframeManager',
      'stylesheetManager',
      'shadowDomManager',
      'canvasManager',
      'processedNodeManager',
    ].forEach(n => {
      this[n] = t[n]
    })
  }
  freeze() {
    ;((this.frozen = !0), this.canvasManager.freeze())
  }
  unfreeze() {
    ;((this.frozen = !1), this.canvasManager.unfreeze(), this.emit())
  }
  isFrozen() {
    return this.frozen
  }
  lock() {
    ;((this.locked = !0), this.canvasManager.lock())
  }
  unlock() {
    ;((this.locked = !1), this.canvasManager.unlock(), this.emit())
  }
  reset() {
    ;(this.shadowDomManager.reset(), this.canvasManager.reset())
  }
}
function _s(e, t) {
  ;(e.delete(t), t.childNodes?.forEach(n => _s(e, n)))
}
function Co(e, t, n) {
  return e.length === 0 ? !1 : $g(e, t, n)
}
function $g(e, t, n) {
  let r = t.parentNode
  for (; r; ) {
    const s = n.getId(r)
    if (e.some(i => i.id === s)) return !0
    r = r.parentNode
  }
  return !1
}
function xo(e, t) {
  return e.size === 0 ? !1 : Gc(e, t)
}
function Gc(e, t) {
  const { parentNode: n } = t
  return n ? (e.has(n) ? !0 : Gc(e, n)) : !1
}
let en
function Ug(e) {
  en = e
}
function Hg() {
  en = void 0
}
const W = e =>
    en
      ? (...n) => {
          try {
            return e(...n)
          } catch (r) {
            if (en && en(r) === !0) return () => {}
            throw r
          }
        }
      : e,
  kt = []
function Tn(e) {
  try {
    if ('composedPath' in e) {
      const t = e.composedPath()
      if (t.length) return t[0]
    } else if ('path' in e && e.path.length) return e.path[0]
  } catch {}
  return e && e.target
}
function Vc(e, t) {
  const n = new Bg()
  ;(kt.push(n), n.init(e))
  let r = window.MutationObserver || window.__rrMutationObserver
  const s = window?.Zone?.__symbol__?.('MutationObserver')
  s && window[s] && (r = window[s])
  const i = new r(
    W(o => {
      ;(e.onMutation && e.onMutation(o) === !1) || n.processMutations.bind(n)(o)
    })
  )
  return (
    i.observe(t, {
      attributes: !0,
      attributeOldValue: !0,
      characterData: !0,
      characterDataOldValue: !0,
      childList: !0,
      subtree: !0,
    }),
    i
  )
}
function Wg({ mousemoveCb: e, sampling: t, doc: n, mirror: r }) {
  if (t.mousemove === !1) return () => {}
  const s = typeof t.mousemove == 'number' ? t.mousemove : 50,
    i = typeof t.mousemoveCallback == 'number' ? t.mousemoveCallback : 500
  let o = [],
    c
  const a = cn(
      W(d => {
        const p = Date.now() - c
        ;(e(
          o.map(f => ((f.timeOffset -= p), f)),
          d
        ),
          (o = []),
          (c = null))
      }),
      i
    ),
    u = W(
      cn(
        W(d => {
          const p = Tn(d),
            { clientX: f, clientY: h } = ms(d) ? d.changedTouches[0] : d
          ;(c || (c = dr()),
            o.push({ x: f, y: h, id: r.getId(p), timeOffset: dr() - c }),
            a(
              typeof DragEvent < 'u' && d instanceof DragEvent
                ? A.Drag
                : d instanceof MouseEvent
                  ? A.MouseMove
                  : A.TouchMove
            ))
        }),
        s,
        { trailing: !1 }
      )
    ),
    l = [he('mousemove', u, n), he('touchmove', u, n), he('drag', u, n)]
  return W(() => {
    l.forEach(d => d())
  })
}
function zg({
  mouseInteractionCb: e,
  doc: t,
  mirror: n,
  blockClass: r,
  blockSelector: s,
  unblockSelector: i,
  sampling: o,
}) {
  if (o.mouseInteraction === !1) return () => {}
  const c =
      o.mouseInteraction === !0 || o.mouseInteraction === void 0
        ? {}
        : o.mouseInteraction,
    a = []
  let u = null
  const l = d => p => {
    const f = Tn(p)
    if (ye(f, r, s, i, !0)) return
    let h = null,
      m = d
    if ('pointerType' in p) {
      switch (p.pointerType) {
        case 'mouse':
          h = Be.Mouse
          break
        case 'touch':
          h = Be.Touch
          break
        case 'pen':
          h = Be.Pen
          break
      }
      h === Be.Touch
        ? pe[d] === pe.MouseDown
          ? (m = 'TouchStart')
          : pe[d] === pe.MouseUp && (m = 'TouchEnd')
        : Be.Pen
    } else ms(p) && (h = Be.Touch)
    h !== null
      ? ((u = h),
        ((m.startsWith('Touch') && h === Be.Touch) ||
          (m.startsWith('Mouse') && h === Be.Mouse)) &&
          (h = null))
      : pe[d] === pe.Click && ((h = u), (u = null))
    const g = ms(p) ? p.changedTouches[0] : p
    if (!g) return
    const E = n.getId(f),
      { clientX: R, clientY: P } = g
    W(e)({
      type: pe[m],
      id: E,
      x: R,
      y: P,
      ...(h !== null && { pointerType: h }),
    })
  }
  return (
    Object.keys(pe)
      .filter(
        d => Number.isNaN(Number(d)) && !d.endsWith('_Departed') && c[d] !== !1
      )
      .forEach(d => {
        let p = Dt(d)
        const f = l(d)
        if (window.PointerEvent)
          switch (pe[d]) {
            case pe.MouseDown:
            case pe.MouseUp:
              p = p.replace('mouse', 'pointer')
              break
            case pe.TouchStart:
            case pe.TouchEnd:
              return
          }
        a.push(he(p, f, t))
      }),
    W(() => {
      a.forEach(d => d())
    })
  )
}
function Yc({
  scrollCb: e,
  doc: t,
  mirror: n,
  blockClass: r,
  blockSelector: s,
  unblockSelector: i,
  sampling: o,
}) {
  const c = W(
    cn(
      W(a => {
        const u = Tn(a)
        if (!u || ye(u, r, s, i, !0)) return
        const l = n.getId(u)
        if (u === t && t.defaultView) {
          const d = Fc(t.defaultView)
          e({ id: l, x: d.left, y: d.top })
        } else e({ id: l, x: u.scrollLeft, y: u.scrollTop })
      }),
      o.scroll || 100
    )
  )
  return he('scroll', c, t)
}
function jg({ viewportResizeCb: e }, { win: t }) {
  let n = -1,
    r = -1
  const s = W(
    cn(
      W(() => {
        const i = Bc(),
          o = $c()
        ;(n !== i || r !== o) &&
          (e({ width: Number(o), height: Number(i) }), (n = i), (r = o))
      }),
      200
    )
  )
  return he('resize', s, t)
}
const qg = ['INPUT', 'TEXTAREA', 'SELECT'],
  Mo = new WeakMap()
function Gg({
  inputCb: e,
  doc: t,
  mirror: n,
  blockClass: r,
  blockSelector: s,
  unblockSelector: i,
  ignoreClass: o,
  ignoreSelector: c,
  maskInputOptions: a,
  maskInputFn: u,
  sampling: l,
  userTriggeredOnInput: d,
  maskTextClass: p,
  unmaskTextClass: f,
  maskTextSelector: h,
  unmaskTextSelector: m,
}) {
  function g(y) {
    let I = Tn(y)
    const S = y.isTrusted,
      w = I && ps(I.tagName)
    if (
      (w === 'OPTION' && (I = I.parentElement),
      !I || !w || qg.indexOf(w) < 0 || ye(I, r, s, i, !0))
    )
      return
    const L = I
    if (L.classList.contains(o) || (c && L.matches(c))) return
    const B = ti(I)
    let U = cr(L, w, B),
      Z = !1
    const te = Tr({ maskInputOptions: a, tagName: w, type: B }),
      K = Pt(I, p, h, f, m, te)
    ;((B === 'radio' || B === 'checkbox') && (Z = I.checked),
      (U = on({ isMasked: K, element: I, value: U, maskInputFn: u })),
      E(
        I,
        d
          ? { text: U, isChecked: Z, userTriggered: S }
          : { text: U, isChecked: Z }
      ))
    const b = I.name
    B === 'radio' &&
      b &&
      Z &&
      t.querySelectorAll(`input[type="radio"][name="${b}"]`).forEach(q => {
        if (q !== I) {
          const k = on({
            isMasked: K,
            element: q,
            value: cr(q, w, B),
            maskInputFn: u,
          })
          E(
            q,
            d
              ? { text: k, isChecked: !Z, userTriggered: !1 }
              : { text: k, isChecked: !Z }
          )
        }
      })
  }
  function E(y, I) {
    const S = Mo.get(y)
    if (!S || S.text !== I.text || S.isChecked !== I.isChecked) {
      Mo.set(y, I)
      const w = n.getId(y)
      W(e)({ ...I, id: w })
    }
  }
  const P = (l.input === 'last' ? ['change'] : ['input', 'change']).map(y =>
      he(y, W(g), t)
    ),
    N = t.defaultView
  if (!N)
    return () => {
      P.forEach(y => y())
    }
  const M = N.Object.getOwnPropertyDescriptor(
      N.HTMLInputElement.prototype,
      'value'
    ),
    T = [
      [N.HTMLInputElement.prototype, 'value'],
      [N.HTMLInputElement.prototype, 'checked'],
      [N.HTMLSelectElement.prototype, 'value'],
      [N.HTMLTextAreaElement.prototype, 'value'],
      [N.HTMLSelectElement.prototype, 'selectedIndex'],
      [N.HTMLOptionElement.prototype, 'selected'],
    ]
  return (
    M &&
      M.set &&
      P.push(
        ...T.map(y =>
          Pc(
            y[0],
            y[1],
            {
              set() {
                W(g)({ target: this, isTrusted: !1 })
              },
            },
            !1,
            N
          )
        )
      ),
    W(() => {
      P.forEach(y => y())
    })
  )
}
function lr(e) {
  const t = []
  function n(r, s) {
    if (
      (Pn('CSSGroupingRule') && r.parentRule instanceof CSSGroupingRule) ||
      (Pn('CSSMediaRule') && r.parentRule instanceof CSSMediaRule) ||
      (Pn('CSSSupportsRule') && r.parentRule instanceof CSSSupportsRule) ||
      (Pn('CSSConditionRule') && r.parentRule instanceof CSSConditionRule)
    ) {
      const o = Array.from(r.parentRule.cssRules).indexOf(r)
      s.unshift(o)
    } else if (r.parentStyleSheet) {
      const o = Array.from(r.parentStyleSheet.cssRules).indexOf(r)
      s.unshift(o)
    }
    return s
  }
  return n(e, t)
}
function Ve(e, t, n) {
  let r, s
  return e
    ? (e.ownerNode ? (r = t.getId(e.ownerNode)) : (s = n.getId(e)),
      { styleId: s, id: r })
    : {}
}
function Vg(
  { styleSheetRuleCb: e, mirror: t, stylesheetManager: n },
  { win: r }
) {
  if (!r.CSSStyleSheet || !r.CSSStyleSheet.prototype) return () => {}
  const s = r.CSSStyleSheet.prototype.insertRule
  r.CSSStyleSheet.prototype.insertRule = new Proxy(s, {
    apply: W((l, d, p) => {
      const [f, h] = p,
        { id: m, styleId: g } = Ve(d, t, n.styleMirror)
      return (
        ((m && m !== -1) || (g && g !== -1)) &&
          e({ id: m, styleId: g, adds: [{ rule: f, index: h }] }),
        l.apply(d, p)
      )
    }),
  })
  const i = r.CSSStyleSheet.prototype.deleteRule
  r.CSSStyleSheet.prototype.deleteRule = new Proxy(i, {
    apply: W((l, d, p) => {
      const [f] = p,
        { id: h, styleId: m } = Ve(d, t, n.styleMirror)
      return (
        ((h && h !== -1) || (m && m !== -1)) &&
          e({ id: h, styleId: m, removes: [{ index: f }] }),
        l.apply(d, p)
      )
    }),
  })
  let o
  r.CSSStyleSheet.prototype.replace &&
    ((o = r.CSSStyleSheet.prototype.replace),
    (r.CSSStyleSheet.prototype.replace = new Proxy(o, {
      apply: W((l, d, p) => {
        const [f] = p,
          { id: h, styleId: m } = Ve(d, t, n.styleMirror)
        return (
          ((h && h !== -1) || (m && m !== -1)) &&
            e({ id: h, styleId: m, replace: f }),
          l.apply(d, p)
        )
      }),
    })))
  let c
  r.CSSStyleSheet.prototype.replaceSync &&
    ((c = r.CSSStyleSheet.prototype.replaceSync),
    (r.CSSStyleSheet.prototype.replaceSync = new Proxy(c, {
      apply: W((l, d, p) => {
        const [f] = p,
          { id: h, styleId: m } = Ve(d, t, n.styleMirror)
        return (
          ((h && h !== -1) || (m && m !== -1)) &&
            e({ id: h, styleId: m, replaceSync: f }),
          l.apply(d, p)
        )
      }),
    })))
  const a = {}
  Fn('CSSGroupingRule')
    ? (a.CSSGroupingRule = r.CSSGroupingRule)
    : (Fn('CSSMediaRule') && (a.CSSMediaRule = r.CSSMediaRule),
      Fn('CSSConditionRule') && (a.CSSConditionRule = r.CSSConditionRule),
      Fn('CSSSupportsRule') && (a.CSSSupportsRule = r.CSSSupportsRule))
  const u = {}
  return (
    Object.entries(a).forEach(([l, d]) => {
      ;((u[l] = {
        insertRule: d.prototype.insertRule,
        deleteRule: d.prototype.deleteRule,
      }),
        (d.prototype.insertRule = new Proxy(u[l].insertRule, {
          apply: W((p, f, h) => {
            const [m, g] = h,
              { id: E, styleId: R } = Ve(f.parentStyleSheet, t, n.styleMirror)
            return (
              ((E && E !== -1) || (R && R !== -1)) &&
                e({
                  id: E,
                  styleId: R,
                  adds: [{ rule: m, index: [...lr(f), g || 0] }],
                }),
              p.apply(f, h)
            )
          }),
        })),
        (d.prototype.deleteRule = new Proxy(u[l].deleteRule, {
          apply: W((p, f, h) => {
            const [m] = h,
              { id: g, styleId: E } = Ve(f.parentStyleSheet, t, n.styleMirror)
            return (
              ((g && g !== -1) || (E && E !== -1)) &&
                e({ id: g, styleId: E, removes: [{ index: [...lr(f), m] }] }),
              p.apply(f, h)
            )
          }),
        })))
    }),
    W(() => {
      ;((r.CSSStyleSheet.prototype.insertRule = s),
        (r.CSSStyleSheet.prototype.deleteRule = i),
        o && (r.CSSStyleSheet.prototype.replace = o),
        c && (r.CSSStyleSheet.prototype.replaceSync = c),
        Object.entries(a).forEach(([l, d]) => {
          ;((d.prototype.insertRule = u[l].insertRule),
            (d.prototype.deleteRule = u[l].deleteRule))
        }))
    })
  )
}
function Xc({ mirror: e, stylesheetManager: t }, n) {
  let r = null
  n.nodeName === '#document' ? (r = e.getId(n)) : (r = e.getId(n.host))
  const s =
      n.nodeName === '#document'
        ? n.defaultView?.Document
        : n.ownerDocument?.defaultView?.ShadowRoot,
    i = s?.prototype
      ? Object.getOwnPropertyDescriptor(s?.prototype, 'adoptedStyleSheets')
      : void 0
  return r === null || r === -1 || !s || !i
    ? () => {}
    : (Object.defineProperty(n, 'adoptedStyleSheets', {
        configurable: i.configurable,
        enumerable: i.enumerable,
        get() {
          return i.get?.call(this)
        },
        set(o) {
          const c = i.set?.call(this, o)
          if (r !== null && r !== -1)
            try {
              t.adoptStyleSheets(o, r)
            } catch {}
          return c
        },
      }),
      W(() => {
        Object.defineProperty(n, 'adoptedStyleSheets', {
          configurable: i.configurable,
          enumerable: i.enumerable,
          get: i.get,
          set: i.set,
        })
      }))
}
function Yg(
  {
    styleDeclarationCb: e,
    mirror: t,
    ignoreCSSAttributes: n,
    stylesheetManager: r,
  },
  { win: s }
) {
  const i = s.CSSStyleDeclaration.prototype.setProperty
  s.CSSStyleDeclaration.prototype.setProperty = new Proxy(i, {
    apply: W((c, a, u) => {
      const [l, d, p] = u
      if (n.has(l)) return i.apply(a, [l, d, p])
      const { id: f, styleId: h } = Ve(
        a.parentRule?.parentStyleSheet,
        t,
        r.styleMirror
      )
      return (
        ((f && f !== -1) || (h && h !== -1)) &&
          e({
            id: f,
            styleId: h,
            set: { property: l, value: d, priority: p },
            index: lr(a.parentRule),
          }),
        c.apply(a, u)
      )
    }),
  })
  const o = s.CSSStyleDeclaration.prototype.removeProperty
  return (
    (s.CSSStyleDeclaration.prototype.removeProperty = new Proxy(o, {
      apply: W((c, a, u) => {
        const [l] = u
        if (n.has(l)) return o.apply(a, [l])
        const { id: d, styleId: p } = Ve(
          a.parentRule?.parentStyleSheet,
          t,
          r.styleMirror
        )
        return (
          ((d && d !== -1) || (p && p !== -1)) &&
            e({
              id: d,
              styleId: p,
              remove: { property: l },
              index: lr(a.parentRule),
            }),
          c.apply(a, u)
        )
      }),
    })),
    W(() => {
      ;((s.CSSStyleDeclaration.prototype.setProperty = i),
        (s.CSSStyleDeclaration.prototype.removeProperty = o))
    })
  )
}
function Xg({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: n,
  unblockSelector: r,
  mirror: s,
  sampling: i,
  doc: o,
}) {
  const c = W(u =>
      cn(
        W(l => {
          const d = Tn(l)
          if (!d || ye(d, t, n, r, !0)) return
          const { currentTime: p, volume: f, muted: h, playbackRate: m } = d
          e({
            type: u,
            id: s.getId(d),
            currentTime: p,
            volume: f,
            muted: h,
            playbackRate: m,
          })
        }),
        i.media || 500
      )
    ),
    a = [
      he('play', c(vt.Play), o),
      he('pause', c(vt.Pause), o),
      he('seeked', c(vt.Seeked), o),
      he('volumechange', c(vt.VolumeChange), o),
      he('ratechange', c(vt.RateChange), o),
    ]
  return W(() => {
    a.forEach(u => u())
  })
}
function Kg({ fontCb: e, doc: t }) {
  const n = t.defaultView
  if (!n) return () => {}
  const r = [],
    s = new WeakMap(),
    i = n.FontFace
  n.FontFace = function (a, u, l) {
    const d = new i(a, u, l)
    return (
      s.set(d, {
        family: a,
        buffer: typeof u != 'string',
        descriptors: l,
        fontSource:
          typeof u == 'string'
            ? u
            : JSON.stringify(Array.from(new Uint8Array(u))),
      }),
      d
    )
  }
  const o = ri(t.fonts, 'add', function (c) {
    return function (a) {
      return (
        wr(
          W(() => {
            const u = s.get(a)
            u && (e(u), s.delete(a))
          }),
          0
        ),
        c.apply(this, [a])
      )
    }
  })
  return (
    r.push(() => {
      n.FontFace = i
    }),
    r.push(o),
    W(() => {
      r.forEach(c => c())
    })
  )
}
function Jg(e) {
  const {
    doc: t,
    mirror: n,
    blockClass: r,
    blockSelector: s,
    unblockSelector: i,
    selectionCb: o,
  } = e
  let c = !0
  const a = W(() => {
    const u = t.getSelection()
    if (!u || (c && u?.isCollapsed)) return
    c = u.isCollapsed || !1
    const l = [],
      d = u.rangeCount || 0
    for (let p = 0; p < d; p++) {
      const f = u.getRangeAt(p),
        { startContainer: h, startOffset: m, endContainer: g, endOffset: E } = f
      ye(h, r, s, i, !0) ||
        ye(g, r, s, i, !0) ||
        l.push({
          start: n.getId(h),
          startOffset: m,
          end: n.getId(g),
          endOffset: E,
        })
    }
    o({ ranges: l })
  })
  return (a(), he('selectionchange', a))
}
function Qg({ doc: e, customElementCb: t }) {
  const n = e.defaultView
  return !n || !n.customElements
    ? () => {}
    : ri(n.customElements, 'define', function (s) {
        return function (i, o, c) {
          try {
            t({ define: { name: i } })
          } catch {}
          return s.apply(this, [i, o, c])
        }
      })
}
function Zg(e, t = {}) {
  const n = e.doc.defaultView
  if (!n) return () => {}
  let r
  e.recordDOM && (r = Vc(e, e.doc))
  const s = Wg(e),
    i = zg(e),
    o = Yc(e),
    c = jg(e, { win: n }),
    a = Gg(e),
    u = Xg(e)
  let l = () => {},
    d = () => {},
    p = () => {},
    f = () => {}
  e.recordDOM &&
    ((l = Vg(e, { win: n })),
    (d = Xc(e, e.doc)),
    (p = Yg(e, { win: n })),
    e.collectFonts && (f = Kg(e)))
  const h = Jg(e),
    m = Qg(e),
    g = []
  for (const E of e.plugins) g.push(E.observer(E.callback, n, E.options))
  return W(() => {
    ;(kt.forEach(E => E.reset()),
      r?.disconnect(),
      s(),
      i(),
      o(),
      c(),
      a(),
      u(),
      l(),
      d(),
      p(),
      f(),
      h(),
      m(),
      g.forEach(E => E()))
  })
}
function Pn(e) {
  return typeof window[e] < 'u'
}
function Fn(e) {
  return !!(
    typeof window[e] < 'u' &&
    window[e].prototype &&
    'insertRule' in window[e].prototype &&
    'deleteRule' in window[e].prototype
  )
}
class ys {
  constructor(t) {
    ;((this.generateIdFn = t),
      (this.iframeIdToRemoteIdMap = new WeakMap()),
      (this.iframeRemoteIdToIdMap = new WeakMap()))
  }
  getId(t, n, r, s) {
    const i = r || this.getIdToRemoteIdMap(t),
      o = s || this.getRemoteIdToIdMap(t)
    let c = i.get(n)
    return (c || ((c = this.generateIdFn()), i.set(n, c), o.set(c, n)), c)
  }
  getIds(t, n) {
    const r = this.getIdToRemoteIdMap(t),
      s = this.getRemoteIdToIdMap(t)
    return n.map(i => this.getId(t, i, r, s))
  }
  getRemoteId(t, n, r) {
    const s = r || this.getRemoteIdToIdMap(t)
    if (typeof n != 'number') return n
    const i = s.get(n)
    return i || -1
  }
  getRemoteIds(t, n) {
    const r = this.getRemoteIdToIdMap(t)
    return n.map(s => this.getRemoteId(t, s, r))
  }
  reset(t) {
    if (!t) {
      ;((this.iframeIdToRemoteIdMap = new WeakMap()),
        (this.iframeRemoteIdToIdMap = new WeakMap()))
      return
    }
    ;(this.iframeIdToRemoteIdMap.delete(t),
      this.iframeRemoteIdToIdMap.delete(t))
  }
  getIdToRemoteIdMap(t) {
    let n = this.iframeIdToRemoteIdMap.get(t)
    return (n || ((n = new Map()), this.iframeIdToRemoteIdMap.set(t, n)), n)
  }
  getRemoteIdToIdMap(t) {
    let n = this.iframeRemoteIdToIdMap.get(t)
    return (n || ((n = new Map()), this.iframeRemoteIdToIdMap.set(t, n)), n)
  }
}
class e_ {
  constructor() {
    ;((this.crossOriginIframeMirror = new ys(ni)),
      (this.crossOriginIframeRootIdMap = new WeakMap()))
  }
  addIframe() {}
  addLoadListener() {}
  attachIframe() {}
}
class t_ {
  constructor(t) {
    ;((this.iframes = new WeakMap()),
      (this.crossOriginIframeMap = new WeakMap()),
      (this.crossOriginIframeMirror = new ys(ni)),
      (this.crossOriginIframeRootIdMap = new WeakMap()),
      (this.mutationCb = t.mutationCb),
      (this.wrappedEmit = t.wrappedEmit),
      (this.stylesheetManager = t.stylesheetManager),
      (this.recordCrossOriginIframes = t.recordCrossOriginIframes),
      (this.crossOriginIframeStyleMirror = new ys(
        this.stylesheetManager.styleMirror.generateId.bind(
          this.stylesheetManager.styleMirror
        )
      )),
      (this.mirror = t.mirror),
      this.recordCrossOriginIframes &&
        window.addEventListener('message', this.handleMessage.bind(this)))
  }
  addIframe(t) {
    ;(this.iframes.set(t, !0),
      t.contentWindow && this.crossOriginIframeMap.set(t.contentWindow, t))
  }
  addLoadListener(t) {
    this.loadListener = t
  }
  attachIframe(t, n) {
    ;(this.mutationCb({
      adds: [{ parentId: this.mirror.getId(t), nextId: null, node: n }],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: !0,
    }),
      this.recordCrossOriginIframes &&
        t.contentWindow?.addEventListener(
          'message',
          this.handleMessage.bind(this)
        ),
      this.loadListener?.(t))
    const r = ii(t)
    r &&
      r.adoptedStyleSheets &&
      r.adoptedStyleSheets.length > 0 &&
      this.stylesheetManager.adoptStyleSheets(
        r.adoptedStyleSheets,
        this.mirror.getId(r)
      )
  }
  handleMessage(t) {
    const n = t
    if (n.data.type !== 'rrweb' || n.origin !== n.data.origin || !t.source)
      return
    const s = this.crossOriginIframeMap.get(t.source)
    if (!s) return
    const i = this.transformCrossOriginEvent(s, n.data.event)
    i && this.wrappedEmit(i, n.data.isCheckout)
  }
  transformCrossOriginEvent(t, n) {
    switch (n.type) {
      case D.FullSnapshot: {
        ;(this.crossOriginIframeMirror.reset(t),
          this.crossOriginIframeStyleMirror.reset(t),
          this.replaceIdOnNode(n.data.node, t))
        const r = n.data.node.id
        return (
          this.crossOriginIframeRootIdMap.set(t, r),
          this.patchRootIdOnNode(n.data.node, r),
          {
            timestamp: n.timestamp,
            type: D.IncrementalSnapshot,
            data: {
              source: A.Mutation,
              adds: [
                {
                  parentId: this.mirror.getId(t),
                  nextId: null,
                  node: n.data.node,
                },
              ],
              removes: [],
              texts: [],
              attributes: [],
              isAttachIframe: !0,
            },
          }
        )
      }
      case D.Meta:
      case D.Load:
      case D.DomContentLoaded:
        return !1
      case D.Plugin:
        return n
      case D.Custom:
        return (
          this.replaceIds(n.data.payload, t, [
            'id',
            'parentId',
            'previousId',
            'nextId',
          ]),
          n
        )
      case D.IncrementalSnapshot:
        switch (n.data.source) {
          case A.Mutation:
            return (
              n.data.adds.forEach(r => {
                ;(this.replaceIds(r, t, ['parentId', 'nextId', 'previousId']),
                  this.replaceIdOnNode(r.node, t))
                const s = this.crossOriginIframeRootIdMap.get(t)
                s && this.patchRootIdOnNode(r.node, s)
              }),
              n.data.removes.forEach(r => {
                this.replaceIds(r, t, ['parentId', 'id'])
              }),
              n.data.attributes.forEach(r => {
                this.replaceIds(r, t, ['id'])
              }),
              n.data.texts.forEach(r => {
                this.replaceIds(r, t, ['id'])
              }),
              n
            )
          case A.Drag:
          case A.TouchMove:
          case A.MouseMove:
            return (
              n.data.positions.forEach(r => {
                this.replaceIds(r, t, ['id'])
              }),
              n
            )
          case A.ViewportResize:
            return !1
          case A.MediaInteraction:
          case A.MouseInteraction:
          case A.Scroll:
          case A.CanvasMutation:
          case A.Input:
            return (this.replaceIds(n.data, t, ['id']), n)
          case A.StyleSheetRule:
          case A.StyleDeclaration:
            return (
              this.replaceIds(n.data, t, ['id']),
              this.replaceStyleIds(n.data, t, ['styleId']),
              n
            )
          case A.Font:
            return n
          case A.Selection:
            return (
              n.data.ranges.forEach(r => {
                this.replaceIds(r, t, ['start', 'end'])
              }),
              n
            )
          case A.AdoptedStyleSheet:
            return (
              this.replaceIds(n.data, t, ['id']),
              this.replaceStyleIds(n.data, t, ['styleIds']),
              n.data.styles?.forEach(r => {
                this.replaceStyleIds(r, t, ['styleId'])
              }),
              n
            )
        }
    }
    return !1
  }
  replace(t, n, r, s) {
    for (const i of s)
      (!Array.isArray(n[i]) && typeof n[i] != 'number') ||
        (Array.isArray(n[i])
          ? (n[i] = t.getIds(r, n[i]))
          : (n[i] = t.getId(r, n[i])))
    return n
  }
  replaceIds(t, n, r) {
    return this.replace(this.crossOriginIframeMirror, t, n, r)
  }
  replaceStyleIds(t, n, r) {
    return this.replace(this.crossOriginIframeStyleMirror, t, n, r)
  }
  replaceIdOnNode(t, n) {
    ;(this.replaceIds(t, n, ['id', 'rootId']),
      'childNodes' in t &&
        t.childNodes.forEach(r => {
          this.replaceIdOnNode(r, n)
        }))
  }
  patchRootIdOnNode(t, n) {
    ;(t.type !== ie.Document && !t.rootId && (t.rootId = n),
      'childNodes' in t &&
        t.childNodes.forEach(r => {
          this.patchRootIdOnNode(r, n)
        }))
  }
}
class n_ {
  init() {}
  addShadowRoot() {}
  observeAttachShadow() {}
  reset() {}
}
class r_ {
  constructor(t) {
    ;((this.shadowDoms = new WeakSet()),
      (this.restoreHandlers = []),
      (this.mutationCb = t.mutationCb),
      (this.scrollCb = t.scrollCb),
      (this.bypassOptions = t.bypassOptions),
      (this.mirror = t.mirror),
      this.init())
  }
  init() {
    ;(this.reset(), this.patchAttachShadow(Element, document))
  }
  addShadowRoot(t, n) {
    if (!Zt(t) || this.shadowDoms.has(t)) return
    ;(this.shadowDoms.add(t), this.bypassOptions.canvasManager.addShadowRoot(t))
    const r = Vc(
      {
        ...this.bypassOptions,
        doc: n,
        mutationCb: this.mutationCb,
        mirror: this.mirror,
        shadowDomManager: this,
      },
      t
    )
    ;(this.restoreHandlers.push(() => r.disconnect()),
      this.restoreHandlers.push(
        Yc({
          ...this.bypassOptions,
          scrollCb: this.scrollCb,
          doc: t,
          mirror: this.mirror,
        })
      ),
      wr(() => {
        ;(t.adoptedStyleSheets &&
          t.adoptedStyleSheets.length > 0 &&
          this.bypassOptions.stylesheetManager.adoptStyleSheets(
            t.adoptedStyleSheets,
            this.mirror.getId(t.host)
          ),
          this.restoreHandlers.push(
            Xc(
              {
                mirror: this.mirror,
                stylesheetManager: this.bypassOptions.stylesheetManager,
              },
              t
            )
          ))
      }, 0))
  }
  observeAttachShadow(t) {
    const n = ii(t),
      r = Pg(t)
    !n || !r || this.patchAttachShadow(r.Element, n)
  }
  patchAttachShadow(t, n) {
    const r = this
    this.restoreHandlers.push(
      ri(t.prototype, 'attachShadow', function (s) {
        return function (i) {
          const o = s.call(this, i)
          return (
            this.shadowRoot && qc(this) && r.addShadowRoot(this.shadowRoot, n),
            o
          )
        }
      })
    )
  }
  reset() {
    ;(this.restoreHandlers.forEach(t => {
      try {
        t()
      } catch {}
    }),
      (this.restoreHandlers = []),
      (this.shadowDoms = new WeakSet()),
      this.bypassOptions.canvasManager.resetShadowRoots())
  }
}
var Ao = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  s_ = typeof Uint8Array > 'u' ? [] : new Uint8Array(256)
for (var Bn = 0; Bn < Ao.length; Bn++) s_[Ao.charCodeAt(Bn)] = Bn
class Oo {
  reset() {}
  freeze() {}
  unfreeze() {}
  lock() {}
  unlock() {}
  snapshot() {}
  addWindow() {}
  addShadowRoot() {}
  resetShadowRoots() {}
}
class i_ {
  constructor(t) {
    ;((this.trackedLinkElements = new WeakSet()),
      (this.styleMirror = new Ag()),
      (this.mutationCb = t.mutationCb),
      (this.adoptedStyleSheetCb = t.adoptedStyleSheetCb))
  }
  attachLinkElement(t, n) {
    ;('_cssText' in n.attributes &&
      this.mutationCb({
        adds: [],
        removes: [],
        texts: [],
        attributes: [{ id: n.id, attributes: n.attributes }],
      }),
      this.trackLinkElement(t))
  }
  trackLinkElement(t) {
    this.trackedLinkElements.has(t) ||
      (this.trackedLinkElements.add(t), this.trackStylesheetInLinkElement(t))
  }
  adoptStyleSheets(t, n) {
    if (t.length === 0) return
    const r = { id: n, styleIds: [] },
      s = []
    for (const i of t) {
      let o
      ;(this.styleMirror.has(i)
        ? (o = this.styleMirror.getId(i))
        : ((o = this.styleMirror.add(i)),
          s.push({
            styleId: o,
            rules: Array.from(i.rules || CSSRule, (c, a) => ({
              rule: Cc(c),
              index: a,
            })),
          })),
        r.styleIds.push(o))
    }
    ;(s.length > 0 && (r.styles = s), this.adoptedStyleSheetCb(r))
  }
  reset() {
    ;(this.styleMirror.reset(), (this.trackedLinkElements = new WeakSet()))
  }
  trackStylesheetInLinkElement(t) {}
}
class o_ {
  constructor() {
    ;((this.nodeMap = new WeakMap()), (this.active = !1))
  }
  inOtherBuffer(t, n) {
    const r = this.nodeMap.get(t)
    return r && Array.from(r).some(s => s !== n)
  }
  add(t, n) {
    ;(this.active ||
      ((this.active = !0),
      Lg(() => {
        ;((this.nodeMap = new WeakMap()), (this.active = !1))
      })),
      this.nodeMap.set(t, (this.nodeMap.get(t) || new Set()).add(n)))
  }
  destroy() {}
}
let re, fr
try {
  if (Array.from([1], e => e * 2)[0] !== 2) {
    const e = document.createElement('iframe')
    ;(document.body.appendChild(e),
      (Array.from = e.contentWindow?.Array.from || Array.from),
      document.body.removeChild(e))
  }
} catch (e) {
  console.debug('Unable to override Array.from', e)
}
const Ce = ig()
function We(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: n,
    checkoutEveryNth: r,
    blockClass: s = 'rr-block',
    blockSelector: i = null,
    unblockSelector: o = null,
    ignoreClass: c = 'rr-ignore',
    ignoreSelector: a = null,
    maskAllText: u = !1,
    maskTextClass: l = 'rr-mask',
    unmaskTextClass: d = null,
    maskTextSelector: p = null,
    unmaskTextSelector: f = null,
    inlineStylesheet: h = !0,
    maskAllInputs: m,
    maskInputOptions: g,
    slimDOMOptions: E,
    maskAttributeFn: R,
    maskInputFn: P,
    maskTextFn: N,
    maxCanvasSize: M = null,
    packFn: T,
    sampling: y = {},
    dataURLOptions: I = {},
    mousemoveWait: S,
    recordDOM: w = !0,
    recordCanvas: L = !1,
    recordCrossOriginIframes: B = !1,
    recordAfter: U = e.recordAfter === 'DOMContentLoaded'
      ? e.recordAfter
      : 'load',
    userTriggeredOnInput: Z = !1,
    collectFonts: te = !1,
    inlineImages: K = !1,
    plugins: b,
    keepIframeSrcFn: q = () => !1,
    ignoreCSSAttributes: k = new Set([]),
    errorHandler: G,
    onMutation: ne,
    getCanvasManager: ee,
  } = e
  Ug(G)
  const be = B ? window.parent === window : !0
  let fe = !1
  if (!be)
    try {
      window.parent.document && (fe = !1)
    } catch {
      fe = !0
    }
  if (be && !t) throw new Error('emit function is required')
  if (!be && !fe) return () => {}
  ;(S !== void 0 && y.mousemove === void 0 && (y.mousemove = S), Ce.reset())
  const yt =
      m === !0
        ? {
            color: !0,
            date: !0,
            'datetime-local': !0,
            email: !0,
            month: !0,
            number: !0,
            range: !0,
            search: !0,
            tel: !0,
            text: !0,
            time: !0,
            url: !0,
            week: !0,
            textarea: !0,
            select: !0,
            radio: !0,
            checkbox: !0,
          }
        : g !== void 0
          ? g
          : {},
    Pe =
      E === !0 || E === 'all'
        ? {
            script: !0,
            comment: !0,
            headFavicon: !0,
            headWhitespace: !0,
            headMetaSocial: !0,
            headMetaRobots: !0,
            headMetaHttpEquiv: !0,
            headMetaVerification: !0,
            headMetaAuthorship: E === 'all',
            headMetaDescKeywords: E === 'all',
          }
        : E || {}
  Mg()
  let St,
    Gt = 0
  const mi = V => {
    for (const Re of b || []) Re.eventProcessor && (V = Re.eventProcessor(V))
    return (T && !fe && (V = T(V)), V)
  }
  re = (V, Re) => {
    const H = V
    if (
      ((H.timestamp = dr()),
      kt[0]?.isFrozen() &&
        H.type !== D.FullSnapshot &&
        !(H.type === D.IncrementalSnapshot && H.data.source === A.Mutation) &&
        kt.forEach(ue => ue.unfreeze()),
      be)
    )
      t?.(mi(H), Re)
    else if (fe) {
      const ue = {
        type: 'rrweb',
        event: mi(H),
        origin: window.location.origin,
        isCheckout: Re,
      }
      window.parent.postMessage(ue, '*')
    }
    if (H.type === D.FullSnapshot) ((St = H), (Gt = 0))
    else if (H.type === D.IncrementalSnapshot) {
      if (H.data.source === A.Mutation && H.data.isAttachIframe) return
      Gt++
      const ue = r && Gt >= r,
        Y = n && St && H.timestamp - St.timestamp > n
      ;(ue || Y) && Mr(!0)
    }
  }
  const Vt = V => {
      re({ type: D.IncrementalSnapshot, data: { source: A.Mutation, ...V } })
    },
    gi = V =>
      re({ type: D.IncrementalSnapshot, data: { source: A.Scroll, ...V } }),
    Eu = V =>
      re({
        type: D.IncrementalSnapshot,
        data: { source: A.CanvasMutation, ...V },
      }),
    bu = V =>
      re({
        type: D.IncrementalSnapshot,
        data: { source: A.AdoptedStyleSheet, ...V },
      }),
    rt = new i_({ mutationCb: Vt, adoptedStyleSheetCb: bu }),
    st =
      typeof __RRWEB_EXCLUDE_IFRAME__ == 'boolean' && __RRWEB_EXCLUDE_IFRAME__
        ? new e_()
        : new t_({
            mirror: Ce,
            mutationCb: Vt,
            stylesheetManager: rt,
            recordCrossOriginIframes: B,
            wrappedEmit: re,
          })
  for (const V of b || [])
    V.getMirror &&
      V.getMirror({
        nodeMirror: Ce,
        crossOriginIframeMirror: st.crossOriginIframeMirror,
        crossOriginIframeStyleMirror: st.crossOriginIframeStyleMirror,
      })
  const Cr = new o_(),
    xr = c_(ee, {
      mirror: Ce,
      win: window,
      mutationCb: V =>
        re({
          type: D.IncrementalSnapshot,
          data: { source: A.CanvasMutation, ...V },
        }),
      recordCanvas: L,
      blockClass: s,
      blockSelector: i,
      unblockSelector: o,
      maxCanvasSize: M,
      sampling: y.canvas,
      dataURLOptions: I,
      errorHandler: G,
    }),
    wn =
      typeof __RRWEB_EXCLUDE_SHADOW_DOM__ == 'boolean' &&
      __RRWEB_EXCLUDE_SHADOW_DOM__
        ? new n_()
        : new r_({
            mutationCb: Vt,
            scrollCb: gi,
            bypassOptions: {
              onMutation: ne,
              blockClass: s,
              blockSelector: i,
              unblockSelector: o,
              maskAllText: u,
              maskTextClass: l,
              unmaskTextClass: d,
              maskTextSelector: p,
              unmaskTextSelector: f,
              inlineStylesheet: h,
              maskInputOptions: yt,
              dataURLOptions: I,
              maskAttributeFn: R,
              maskTextFn: N,
              maskInputFn: P,
              recordCanvas: L,
              inlineImages: K,
              sampling: y,
              slimDOMOptions: Pe,
              iframeManager: st,
              stylesheetManager: rt,
              canvasManager: xr,
              keepIframeSrcFn: q,
              processedNodeManager: Cr,
            },
            mirror: Ce,
          }),
    Mr = (V = !1) => {
      if (!w) return
      ;(re(
        {
          type: D.Meta,
          data: { href: window.location.href, width: $c(), height: Bc() },
        },
        V
      ),
        rt.reset(),
        wn.init(),
        kt.forEach(H => H.lock()))
      const Re = Cg(document, {
        mirror: Ce,
        blockClass: s,
        blockSelector: i,
        unblockSelector: o,
        maskAllText: u,
        maskTextClass: l,
        unmaskTextClass: d,
        maskTextSelector: p,
        unmaskTextSelector: f,
        inlineStylesheet: h,
        maskAllInputs: yt,
        maskAttributeFn: R,
        maskInputFn: P,
        maskTextFn: N,
        slimDOM: Pe,
        dataURLOptions: I,
        recordCanvas: L,
        inlineImages: K,
        onSerialize: H => {
          ;(Wc(H, Ce) && st.addIframe(H),
            zc(H, Ce) && rt.trackLinkElement(H),
            gs(H) && wn.addShadowRoot(H.shadowRoot, document))
        },
        onIframeLoad: (H, ue) => {
          ;(st.attachIframe(H, ue),
            H.contentWindow && xr.addWindow(H.contentWindow),
            wn.observeAttachShadow(H))
        },
        onStylesheetLoad: (H, ue) => {
          rt.attachLinkElement(H, ue)
        },
        onBlockedImageLoad: (H, ue, { width: Y, height: Yt }) => {
          Vt({
            adds: [],
            removes: [],
            texts: [],
            attributes: [
              {
                id: ue.id,
                attributes: { style: { width: `${Y}px`, height: `${Yt}px` } },
              },
            ],
          })
        },
        keepIframeSrcFn: q,
      })
      if (!Re) return console.warn('Failed to snapshot the document')
      ;(re({
        type: D.FullSnapshot,
        data: { node: Re, initialOffset: Fc(window) },
      }),
        kt.forEach(H => H.unlock()),
        document.adoptedStyleSheets &&
          document.adoptedStyleSheets.length > 0 &&
          rt.adoptStyleSheets(document.adoptedStyleSheets, Ce.getId(document)))
    }
  fr = Mr
  try {
    const V = [],
      Re = ue =>
        W(Zg)(
          {
            onMutation: ne,
            mutationCb: Vt,
            mousemoveCb: (Y, Yt) =>
              re({
                type: D.IncrementalSnapshot,
                data: { source: Yt, positions: Y },
              }),
            mouseInteractionCb: Y =>
              re({
                type: D.IncrementalSnapshot,
                data: { source: A.MouseInteraction, ...Y },
              }),
            scrollCb: gi,
            viewportResizeCb: Y =>
              re({
                type: D.IncrementalSnapshot,
                data: { source: A.ViewportResize, ...Y },
              }),
            inputCb: Y =>
              re({
                type: D.IncrementalSnapshot,
                data: { source: A.Input, ...Y },
              }),
            mediaInteractionCb: Y =>
              re({
                type: D.IncrementalSnapshot,
                data: { source: A.MediaInteraction, ...Y },
              }),
            styleSheetRuleCb: Y =>
              re({
                type: D.IncrementalSnapshot,
                data: { source: A.StyleSheetRule, ...Y },
              }),
            styleDeclarationCb: Y =>
              re({
                type: D.IncrementalSnapshot,
                data: { source: A.StyleDeclaration, ...Y },
              }),
            canvasMutationCb: Eu,
            fontCb: Y =>
              re({
                type: D.IncrementalSnapshot,
                data: { source: A.Font, ...Y },
              }),
            selectionCb: Y => {
              re({
                type: D.IncrementalSnapshot,
                data: { source: A.Selection, ...Y },
              })
            },
            customElementCb: Y => {
              re({
                type: D.IncrementalSnapshot,
                data: { source: A.CustomElement, ...Y },
              })
            },
            blockClass: s,
            ignoreClass: c,
            ignoreSelector: a,
            maskAllText: u,
            maskTextClass: l,
            unmaskTextClass: d,
            maskTextSelector: p,
            unmaskTextSelector: f,
            maskInputOptions: yt,
            inlineStylesheet: h,
            sampling: y,
            recordDOM: w,
            recordCanvas: L,
            inlineImages: K,
            userTriggeredOnInput: Z,
            collectFonts: te,
            doc: ue,
            maskAttributeFn: R,
            maskInputFn: P,
            maskTextFn: N,
            keepIframeSrcFn: q,
            blockSelector: i,
            unblockSelector: o,
            slimDOMOptions: Pe,
            dataURLOptions: I,
            mirror: Ce,
            iframeManager: st,
            stylesheetManager: rt,
            shadowDomManager: wn,
            processedNodeManager: Cr,
            canvasManager: xr,
            ignoreCSSAttributes: k,
            plugins:
              b
                ?.filter(Y => Y.observer)
                ?.map(Y => ({
                  observer: Y.observer,
                  options: Y.options,
                  callback: Yt =>
                    re({
                      type: D.Plugin,
                      data: { plugin: Y.name, payload: Yt },
                    }),
                })) || [],
          },
          {}
        )
    st.addLoadListener(ue => {
      try {
        V.push(Re(ue.contentDocument))
      } catch (Y) {
        console.warn(Y)
      }
    })
    const H = () => {
      ;(Mr(), V.push(Re(document)))
    }
    return (
      document.readyState === 'interactive' ||
      document.readyState === 'complete'
        ? H()
        : (V.push(
            he('DOMContentLoaded', () => {
              ;(re({ type: D.DomContentLoaded, data: {} }),
                U === 'DOMContentLoaded' && H())
            })
          ),
          V.push(
            he(
              'load',
              () => {
                ;(re({ type: D.Load, data: {} }), U === 'load' && H())
              },
              window
            )
          )),
      () => {
        ;(V.forEach(ue => ue()), Cr.destroy(), (fr = void 0), Hg())
      }
    )
  } catch (V) {
    console.warn(V)
  }
}
function a_(e) {
  if (!fr) throw new Error('please take full snapshot after start recording')
  fr(e)
}
We.mirror = Ce
We.takeFullSnapshot = a_
function c_(e, t) {
  try {
    return e ? e(t) : new Oo()
  } catch {
    return (console.warn('Unable to initialize CanvasManager'), new Oo())
  }
}
var No
;(function (e) {
  ;((e[(e.NotStarted = 0)] = 'NotStarted'),
    (e[(e.Running = 1)] = 'Running'),
    (e[(e.Stopped = 2)] = 'Stopped'))
})(No || (No = {}))
const u_ = 3,
  d_ = 5
function oi(e) {
  return e > 9999999999 ? e : e * 1e3
}
function jr(e) {
  return e > 9999999999 ? e / 1e3 : e
}
function In(e, t) {
  t.category !== 'sentry.transaction' &&
    (['ui.click', 'ui.input'].includes(t.category)
      ? e.triggerUserActivity()
      : e.checkAndHandleExpiredSession(),
    e.addUpdate(
      () => (
        e.throttledAddEvent({
          type: D.Custom,
          timestamp: (t.timestamp || 0) * 1e3,
          data: { tag: 'breadcrumb', payload: Te(t, 10, 1e3) },
        }),
        t.category === 'console'
      )
    ))
}
const l_ = 'button,a'
function Kc(e) {
  return e.closest(l_) || e
}
function Jc(e) {
  const t = Qc(e)
  return !t || !(t instanceof Element) ? t : Kc(t)
}
function Qc(e) {
  return f_(e) ? e.target : e
}
function f_(e) {
  return typeof e == 'object' && !!e && 'target' in e
}
let Ye
function p_(e) {
  return (
    Ye || ((Ye = []), h_()),
    Ye.push(e),
    () => {
      const t = Ye ? Ye.indexOf(e) : -1
      t > -1 && Ye.splice(t, 1)
    }
  )
}
function h_() {
  ge(Q, 'open', function (e) {
    return function (...t) {
      if (Ye)
        try {
          Ye.forEach(n => n())
        } catch {}
      return e.apply(Q, t)
    }
  })
}
const m_ = new Set([
  A.Mutation,
  A.StyleSheetRule,
  A.StyleDeclaration,
  A.AdoptedStyleSheet,
  A.CanvasMutation,
  A.Selection,
  A.MediaInteraction,
])
function g_(e, t, n) {
  e.handleClick(t, n)
}
class __ {
  constructor(t, n, r = In) {
    ;((this._lastMutation = 0),
      (this._lastScroll = 0),
      (this._clicks = []),
      (this._timeout = n.timeout / 1e3),
      (this._threshold = n.threshold / 1e3),
      (this._scrollTimeout = n.scrollTimeout / 1e3),
      (this._replay = t),
      (this._ignoreSelector = n.ignoreSelector),
      (this._addBreadcrumbEvent = r))
  }
  addListeners() {
    const t = p_(() => {
      this._lastMutation = Lo()
    })
    this._teardown = () => {
      ;(t(),
        (this._clicks = []),
        (this._lastMutation = 0),
        (this._lastScroll = 0))
    }
  }
  removeListeners() {
    ;(this._teardown && this._teardown(),
      this._checkClickTimeout && clearTimeout(this._checkClickTimeout))
  }
  handleClick(t, n) {
    if (S_(n, this._ignoreSelector) || !E_(t)) return
    const r = {
      timestamp: jr(t.timestamp),
      clickBreadcrumb: t,
      clickCount: 0,
      node: n,
    }
    this._clicks.some(
      s => s.node === r.node && Math.abs(s.timestamp - r.timestamp) < 1
    ) ||
      (this._clicks.push(r),
      this._clicks.length === 1 && this._scheduleCheckClicks())
  }
  registerMutation(t = Date.now()) {
    this._lastMutation = jr(t)
  }
  registerScroll(t = Date.now()) {
    this._lastScroll = jr(t)
  }
  registerClick(t) {
    const n = Kc(t)
    this._handleMultiClick(n)
  }
  _handleMultiClick(t) {
    this._getClicks(t).forEach(n => {
      n.clickCount++
    })
  }
  _getClicks(t) {
    return this._clicks.filter(n => n.node === t)
  }
  _checkClicks() {
    const t = [],
      n = Lo()
    this._clicks.forEach(r => {
      ;(!r.mutationAfter &&
        this._lastMutation &&
        (r.mutationAfter =
          r.timestamp <= this._lastMutation
            ? this._lastMutation - r.timestamp
            : void 0),
        !r.scrollAfter &&
          this._lastScroll &&
          (r.scrollAfter =
            r.timestamp <= this._lastScroll
              ? this._lastScroll - r.timestamp
              : void 0),
        r.timestamp + this._timeout <= n && t.push(r))
    })
    for (const r of t) {
      const s = this._clicks.indexOf(r)
      s > -1 && (this._generateBreadcrumbs(r), this._clicks.splice(s, 1))
    }
    this._clicks.length && this._scheduleCheckClicks()
  }
  _generateBreadcrumbs(t) {
    const n = this._replay,
      r = t.scrollAfter && t.scrollAfter <= this._scrollTimeout,
      s = t.mutationAfter && t.mutationAfter <= this._threshold,
      i = !r && !s,
      { clickCount: o, clickBreadcrumb: c } = t
    if (i) {
      const a = Math.min(t.mutationAfter || this._timeout, this._timeout) * 1e3,
        u = a < this._timeout * 1e3 ? 'mutation' : 'timeout',
        l = {
          type: 'default',
          message: c.message,
          timestamp: c.timestamp,
          category: 'ui.slowClickDetected',
          data: {
            ...c.data,
            url: Q.location.href,
            route: n.getCurrentRoute(),
            timeAfterClickMs: a,
            endReason: u,
            clickCount: o || 1,
          },
        }
      this._addBreadcrumbEvent(n, l)
      return
    }
    if (o > 1) {
      const a = {
        type: 'default',
        message: c.message,
        timestamp: c.timestamp,
        category: 'ui.multiClick',
        data: {
          ...c.data,
          url: Q.location.href,
          route: n.getCurrentRoute(),
          clickCount: o,
          metric: !0,
        },
      }
      this._addBreadcrumbEvent(n, a)
    }
  }
  _scheduleCheckClicks() {
    ;(this._checkClickTimeout && clearTimeout(this._checkClickTimeout),
      (this._checkClickTimeout = vn(() => this._checkClicks(), 1e3)))
  }
}
const y_ = ['A', 'BUTTON', 'INPUT']
function S_(e, t) {
  return !!(
    !y_.includes(e.tagName) ||
    (e.tagName === 'INPUT' &&
      !['submit', 'button'].includes(e.getAttribute('type') || '')) ||
    (e.tagName === 'A' &&
      (e.hasAttribute('download') ||
        (e.hasAttribute('target') && e.getAttribute('target') !== '_self'))) ||
    (t && e.matches(t))
  )
}
function E_(e) {
  return !!(e.data && typeof e.data.nodeId == 'number' && e.timestamp)
}
function Lo() {
  return Date.now() / 1e3
}
function b_(e, t) {
  try {
    if (!v_(t)) return
    const { source: n } = t.data
    if (
      (m_.has(n) && e.registerMutation(t.timestamp),
      n === A.Scroll && e.registerScroll(t.timestamp),
      T_(t))
    ) {
      const { type: r, id: s } = t.data,
        i = We.mirror.getNode(s)
      i instanceof HTMLElement && r === pe.Click && e.registerClick(i)
    }
  } catch {}
}
function v_(e) {
  return e.type === u_
}
function T_(e) {
  return e.data.source === A.MouseInteraction
}
function Ne(e) {
  return { timestamp: Date.now() / 1e3, type: 'default', ...e }
}
var ai = (e => (
  (e[(e.Document = 0)] = 'Document'),
  (e[(e.DocumentType = 1)] = 'DocumentType'),
  (e[(e.Element = 2)] = 'Element'),
  (e[(e.Text = 3)] = 'Text'),
  (e[(e.CDATA = 4)] = 'CDATA'),
  (e[(e.Comment = 5)] = 'Comment'),
  e
))(ai || {})
const I_ = new Set([
  'id',
  'class',
  'aria-label',
  'role',
  'name',
  'alt',
  'title',
  'data-test-id',
  'data-testid',
  'disabled',
  'aria-disabled',
  'data-sentry-component',
])
function w_(e) {
  const t = {}
  !e['data-sentry-component'] &&
    e['data-sentry-element'] &&
    (e['data-sentry-component'] = e['data-sentry-element'])
  for (const n in e)
    if (I_.has(n)) {
      let r = n
      ;((n === 'data-testid' || n === 'data-test-id') && (r = 'testId'),
        (t[r] = e[n]))
    }
  return t
}
const k_ = e => t => {
  if (!e.isEnabled()) return
  const n = R_(t)
  if (!n) return
  const r = t.name === 'click',
    s = r ? t.event : void 0
  ;(r &&
    e.clickDetector &&
    s?.target &&
    !s.altKey &&
    !s.metaKey &&
    !s.ctrlKey &&
    !s.shiftKey &&
    g_(e.clickDetector, n, Jc(t.event)),
    In(e, n))
}
function Zc(e, t) {
  const n = We.mirror.getId(e),
    r = n && We.mirror.getNode(n),
    s = r && We.mirror.getMeta(r),
    i = s && x_(s) ? s : null
  return {
    message: t,
    data: i
      ? {
          nodeId: n,
          node: {
            id: n,
            tagName: i.tagName,
            textContent: Array.from(i.childNodes)
              .map(o => o.type === ai.Text && o.textContent)
              .filter(Boolean)
              .map(o => o.trim())
              .join(''),
            attributes: w_(i.attributes),
          },
        }
      : {},
  }
}
function R_(e) {
  const { target: t, message: n } = C_(e)
  return Ne({ category: `ui.${e.name}`, ...Zc(t, n) })
}
function C_(e) {
  const t = e.name === 'click'
  let n,
    r = null
  try {
    ;((r = t ? Jc(e.event) : Qc(e.event)),
      (n = we(r, { maxStringLength: 200 }) || '<unknown>'))
  } catch {
    n = '<unknown>'
  }
  return { target: r, message: n }
}
function x_(e) {
  return e.type === ai.Element
}
function M_(e, t) {
  if (!e.isEnabled()) return
  e.updateUserActivity()
  const n = A_(t)
  n && In(e, n)
}
function A_(e) {
  const {
    metaKey: t,
    shiftKey: n,
    ctrlKey: r,
    altKey: s,
    key: i,
    target: o,
  } = e
  if (!o || O_(o) || !i) return null
  const c = t || r || s,
    a = i.length === 1
  if (!c && a) return null
  const u = we(o, { maxStringLength: 200 }) || '<unknown>',
    l = Zc(o, u)
  return Ne({
    category: 'ui.keyDown',
    message: u,
    data: { ...l.data, metaKey: t, shiftKey: n, ctrlKey: r, altKey: s, key: i },
  })
}
function O_(e) {
  return (
    e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' || e.isContentEditable
  )
}
const N_ = { resource: B_, paint: P_, navigation: F_ }
function qr(e, t) {
  return ({ metric: n }) => void t.replayPerformanceEntries.push(e(n))
}
function L_(e) {
  return e.map(D_).filter(Boolean)
}
function D_(e) {
  const t = N_[e.entryType]
  return t ? t(e) : null
}
function Ft(e) {
  return ((_e() || Q.performance.timeOrigin) + e) / 1e3
}
function P_(e) {
  const { duration: t, entryType: n, name: r, startTime: s } = e,
    i = Ft(s)
  return { type: n, name: r, start: i, end: i + t, data: void 0 }
}
function F_(e) {
  const {
    entryType: t,
    name: n,
    decodedBodySize: r,
    duration: s,
    domComplete: i,
    encodedBodySize: o,
    domContentLoadedEventStart: c,
    domContentLoadedEventEnd: a,
    domInteractive: u,
    loadEventStart: l,
    loadEventEnd: d,
    redirectCount: p,
    startTime: f,
    transferSize: h,
    type: m,
  } = e
  return s === 0
    ? null
    : {
        type: `${t}.${m}`,
        start: Ft(f),
        end: Ft(i),
        name: n,
        data: {
          size: h,
          decodedBodySize: r,
          encodedBodySize: o,
          duration: s,
          domInteractive: u,
          domContentLoadedEventStart: c,
          domContentLoadedEventEnd: a,
          loadEventStart: l,
          loadEventEnd: d,
          domComplete: i,
          redirectCount: p,
        },
      }
}
function B_(e) {
  const {
    entryType: t,
    initiatorType: n,
    name: r,
    responseEnd: s,
    startTime: i,
    decodedBodySize: o,
    encodedBodySize: c,
    responseStatus: a,
    transferSize: u,
  } = e
  return ['fetch', 'xmlhttprequest'].includes(n)
    ? null
    : {
        type: `${t}.${n}`,
        start: Ft(i),
        end: Ft(s),
        name: r,
        data: {
          size: u,
          statusCode: a,
          decodedBodySize: o,
          encodedBodySize: c,
        },
      }
}
function $_(e) {
  const t = e.entries[e.entries.length - 1],
    n = t?.element ? [t.element] : void 0
  return ci(e, 'largest-contentful-paint', n)
}
function U_(e) {
  return e.sources !== void 0
}
function H_(e) {
  const t = [],
    n = []
  for (const r of e.entries)
    if (U_(r)) {
      const s = []
      for (const i of r.sources)
        if (i.node) {
          n.push(i.node)
          const o = We.mirror.getId(i.node)
          o && s.push(o)
        }
      t.push({ value: r.value, nodeIds: s.length ? s : void 0 })
    }
  return ci(e, 'cumulative-layout-shift', n, t)
}
function W_(e) {
  const t = e.entries[e.entries.length - 1],
    n = t?.target ? [t.target] : void 0
  return ci(e, 'interaction-to-next-paint', n)
}
function ci(e, t, n, r) {
  const s = e.value,
    i = e.rating,
    o = Ft(s)
  return {
    type: 'web-vital',
    name: t,
    start: o,
    end: o,
    data: {
      value: s,
      size: s,
      rating: i,
      nodeIds: n ? n.map(c => We.mirror.getId(c)) : void 0,
      attributions: r,
    },
  }
}
function z_(e) {
  function t(s) {
    e.performanceEntries.includes(s) || e.performanceEntries.push(s)
  }
  function n({ entries: s }) {
    s.forEach(t)
  }
  const r = []
  return (
    ['navigation', 'paint', 'resource'].forEach(s => {
      r.push(ht(s, n))
    }),
    r.push(Ks(qr($_, e)), Xs(qr(H_, e)), hc(qr(W_, e))),
    () => {
      r.forEach(s => s())
    }
  )
}
const C = typeof __SENTRY_DEBUG__ > 'u' || __SENTRY_DEBUG__,
  j_ =
    'var t=Uint8Array,n=Uint16Array,r=Int32Array,e=new t([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),i=new t([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),s=new t([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),a=function(t,e){for(var i=new n(31),s=0;s<31;++s)i[s]=e+=1<<t[s-1];var a=new r(i[30]);for(s=1;s<30;++s)for(var o=i[s];o<i[s+1];++o)a[o]=o-i[s]<<5|s;return{b:i,r:a}},o=a(e,2),h=o.b,f=o.r;h[28]=258,f[258]=28;for(var l=a(i,0).r,u=new n(32768),c=0;c<32768;++c){var v=(43690&c)>>1|(21845&c)<<1;v=(61680&(v=(52428&v)>>2|(13107&v)<<2))>>4|(3855&v)<<4,u[c]=((65280&v)>>8|(255&v)<<8)>>1}var d=function(t,r,e){for(var i=t.length,s=0,a=new n(r);s<i;++s)t[s]&&++a[t[s]-1];var o,h=new n(r);for(s=1;s<r;++s)h[s]=h[s-1]+a[s-1]<<1;if(e){o=new n(1<<r);var f=15-r;for(s=0;s<i;++s)if(t[s])for(var l=s<<4|t[s],c=r-t[s],v=h[t[s]-1]++<<c,d=v|(1<<c)-1;v<=d;++v)o[u[v]>>f]=l}else for(o=new n(i),s=0;s<i;++s)t[s]&&(o[s]=u[h[t[s]-1]++]>>15-t[s]);return o},p=new t(288);for(c=0;c<144;++c)p[c]=8;for(c=144;c<256;++c)p[c]=9;for(c=256;c<280;++c)p[c]=7;for(c=280;c<288;++c)p[c]=8;var g=new t(32);for(c=0;c<32;++c)g[c]=5;var w=d(p,9,0),y=d(g,5,0),m=function(t){return(t+7)/8|0},b=function(n,r,e){return(null==e||e>n.length)&&(e=n.length),new t(n.subarray(r,e))},M=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],E=function(t,n,r){var e=new Error(n||M[t]);if(e.code=t,Error.captureStackTrace&&Error.captureStackTrace(e,E),!r)throw e;return e},z=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8},_=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8,t[e+2]|=r>>16},x=function(r,e){for(var i=[],s=0;s<r.length;++s)r[s]&&i.push({s:s,f:r[s]});var a=i.length,o=i.slice();if(!a)return{t:F,l:0};if(1==a){var h=new t(i[0].s+1);return h[i[0].s]=1,{t:h,l:1}}i.sort(function(t,n){return t.f-n.f}),i.push({s:-1,f:25001});var f=i[0],l=i[1],u=0,c=1,v=2;for(i[0]={s:-1,f:f.f+l.f,l:f,r:l};c!=a-1;)f=i[i[u].f<i[v].f?u++:v++],l=i[u!=c&&i[u].f<i[v].f?u++:v++],i[c++]={s:-1,f:f.f+l.f,l:f,r:l};var d=o[0].s;for(s=1;s<a;++s)o[s].s>d&&(d=o[s].s);var p=new n(d+1),g=A(i[c-1],p,0);if(g>e){s=0;var w=0,y=g-e,m=1<<y;for(o.sort(function(t,n){return p[n.s]-p[t.s]||t.f-n.f});s<a;++s){var b=o[s].s;if(!(p[b]>e))break;w+=m-(1<<g-p[b]),p[b]=e}for(w>>=y;w>0;){var M=o[s].s;p[M]<e?w-=1<<e-p[M]++-1:++s}for(;s>=0&&w;--s){var E=o[s].s;p[E]==e&&(--p[E],++w)}g=e}return{t:new t(p),l:g}},A=function(t,n,r){return-1==t.s?Math.max(A(t.l,n,r+1),A(t.r,n,r+1)):n[t.s]=r},D=function(t){for(var r=t.length;r&&!t[--r];);for(var e=new n(++r),i=0,s=t[0],a=1,o=function(t){e[i++]=t},h=1;h<=r;++h)if(t[h]==s&&h!=r)++a;else{if(!s&&a>2){for(;a>138;a-=138)o(32754);a>2&&(o(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(o(s),--a;a>6;a-=6)o(8304);a>2&&(o(a-3<<5|8208),a=0)}for(;a--;)o(s);a=1,s=t[h]}return{c:e.subarray(0,i),n:r}},T=function(t,n){for(var r=0,e=0;e<n.length;++e)r+=t[e]*n[e];return r},k=function(t,n,r){var e=r.length,i=m(n+2);t[i]=255&e,t[i+1]=e>>8,t[i+2]=255^t[i],t[i+3]=255^t[i+1];for(var s=0;s<e;++s)t[i+s+4]=r[s];return 8*(i+4+e)},U=function(t,r,a,o,h,f,l,u,c,v,m){z(r,m++,a),++h[256];for(var b=x(h,15),M=b.t,E=b.l,A=x(f,15),U=A.t,C=A.l,F=D(M),I=F.c,S=F.n,L=D(U),O=L.c,j=L.n,q=new n(19),B=0;B<I.length;++B)++q[31&I[B]];for(B=0;B<O.length;++B)++q[31&O[B]];for(var G=x(q,7),H=G.t,J=G.l,K=19;K>4&&!H[s[K-1]];--K);var N,P,Q,R,V=v+5<<3,W=T(h,p)+T(f,g)+l,X=T(h,M)+T(f,U)+l+14+3*K+T(q,H)+2*q[16]+3*q[17]+7*q[18];if(c>=0&&V<=W&&V<=X)return k(r,m,t.subarray(c,c+v));if(z(r,m,1+(X<W)),m+=2,X<W){N=d(M,E,0),P=M,Q=d(U,C,0),R=U;var Y=d(H,J,0);z(r,m,S-257),z(r,m+5,j-1),z(r,m+10,K-4),m+=14;for(B=0;B<K;++B)z(r,m+3*B,H[s[B]]);m+=3*K;for(var Z=[I,O],$=0;$<2;++$){var tt=Z[$];for(B=0;B<tt.length;++B){var nt=31&tt[B];z(r,m,Y[nt]),m+=H[nt],nt>15&&(z(r,m,tt[B]>>5&127),m+=tt[B]>>12)}}}else N=w,P=p,Q=y,R=g;for(B=0;B<u;++B){var rt=o[B];if(rt>255){_(r,m,N[(nt=rt>>18&31)+257]),m+=P[nt+257],nt>7&&(z(r,m,rt>>23&31),m+=e[nt]);var et=31&rt;_(r,m,Q[et]),m+=R[et],et>3&&(_(r,m,rt>>5&8191),m+=i[et])}else _(r,m,N[rt]),m+=P[rt]}return _(r,m,N[256]),m+P[256]},C=new r([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),F=new t(0),I=function(){for(var t=new Int32Array(256),n=0;n<256;++n){for(var r=n,e=9;--e;)r=(1&r&&-306674912)^r>>>1;t[n]=r}return t}(),S=function(){var t=1,n=0;return{p:function(r){for(var e=t,i=n,s=0|r.length,a=0;a!=s;){for(var o=Math.min(a+2655,s);a<o;++a)i+=e+=r[a];e=(65535&e)+15*(e>>16),i=(65535&i)+15*(i>>16)}t=e,n=i},d:function(){return(255&(t%=65521))<<24|(65280&t)<<8|(255&(n%=65521))<<8|n>>8}}},L=function(s,a,o,h,u){if(!u&&(u={l:1},a.dictionary)){var c=a.dictionary.subarray(-32768),v=new t(c.length+s.length);v.set(c),v.set(s,c.length),s=v,u.w=c.length}return function(s,a,o,h,u,c){var v=c.z||s.length,d=new t(h+v+5*(1+Math.ceil(v/7e3))+u),p=d.subarray(h,d.length-u),g=c.l,w=7&(c.r||0);if(a){w&&(p[0]=c.r>>3);for(var y=C[a-1],M=y>>13,E=8191&y,z=(1<<o)-1,_=c.p||new n(32768),x=c.h||new n(z+1),A=Math.ceil(o/3),D=2*A,T=function(t){return(s[t]^s[t+1]<<A^s[t+2]<<D)&z},F=new r(25e3),I=new n(288),S=new n(32),L=0,O=0,j=c.i||0,q=0,B=c.w||0,G=0;j+2<v;++j){var H=T(j),J=32767&j,K=x[H];if(_[J]=K,x[H]=J,B<=j){var N=v-j;if((L>7e3||q>24576)&&(N>423||!g)){w=U(s,p,0,F,I,S,O,q,G,j-G,w),q=L=O=0,G=j;for(var P=0;P<286;++P)I[P]=0;for(P=0;P<30;++P)S[P]=0}var Q=2,R=0,V=E,W=J-K&32767;if(N>2&&H==T(j-W))for(var X=Math.min(M,N)-1,Y=Math.min(32767,j),Z=Math.min(258,N);W<=Y&&--V&&J!=K;){if(s[j+Q]==s[j+Q-W]){for(var $=0;$<Z&&s[j+$]==s[j+$-W];++$);if($>Q){if(Q=$,R=W,$>X)break;var tt=Math.min(W,$-2),nt=0;for(P=0;P<tt;++P){var rt=j-W+P&32767,et=rt-_[rt]&32767;et>nt&&(nt=et,K=rt)}}}W+=(J=K)-(K=_[J])&32767}if(R){F[q++]=268435456|f[Q]<<18|l[R];var it=31&f[Q],st=31&l[R];O+=e[it]+i[st],++I[257+it],++S[st],B=j+Q,++L}else F[q++]=s[j],++I[s[j]]}}for(j=Math.max(j,B);j<v;++j)F[q++]=s[j],++I[s[j]];w=U(s,p,g,F,I,S,O,q,G,j-G,w),g||(c.r=7&w|p[w/8|0]<<3,w-=7,c.h=x,c.p=_,c.i=j,c.w=B)}else{for(j=c.w||0;j<v+g;j+=65535){var at=j+65535;at>=v&&(p[w/8|0]=g,at=v),w=k(p,w+1,s.subarray(j,at))}c.i=v}return b(d,0,h+m(w)+u)}(s,null==a.level?6:a.level,null==a.mem?u.l?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(s.length)))):20:12+a.mem,o,h,u)},O=function(t,n,r){for(;r;++n)t[n]=r,r>>>=8},j=function(){function n(n,r){if("function"==typeof n&&(r=n,n={}),this.ondata=r,this.o=n||{},this.s={l:0,i:32768,w:32768,z:32768},this.b=new t(98304),this.o.dictionary){var e=this.o.dictionary.subarray(-32768);this.b.set(e,32768-e.length),this.s.i=32768-e.length}}return n.prototype.p=function(t,n){this.ondata(L(t,this.o,0,0,this.s),n)},n.prototype.push=function(n,r){this.ondata||E(5),this.s.l&&E(4);var e=n.length+this.s.z;if(e>this.b.length){if(e>2*this.b.length-32768){var i=new t(-32768&e);i.set(this.b.subarray(0,this.s.z)),this.b=i}var s=this.b.length-this.s.z;this.b.set(n.subarray(0,s),this.s.z),this.s.z=this.b.length,this.p(this.b,!1),this.b.set(this.b.subarray(-32768)),this.b.set(n.subarray(s),32768),this.s.z=n.length-s+32768,this.s.i=32766,this.s.w=32768}else this.b.set(n,this.s.z),this.s.z+=n.length;this.s.l=1&r,(this.s.z>this.s.w+8191||r)&&(this.p(this.b,r||!1),this.s.w=this.s.i,this.s.i-=2)},n.prototype.flush=function(){this.ondata||E(5),this.s.l&&E(4),this.p(this.b,!1),this.s.w=this.s.i,this.s.i-=2},n}();function q(t,n){n||(n={});var r=function(){var t=-1;return{p:function(n){for(var r=t,e=0;e<n.length;++e)r=I[255&r^n[e]]^r>>>8;t=r},d:function(){return~t}}}(),e=t.length;r.p(t);var i,s=L(t,n,10+((i=n).filename?i.filename.length+1:0),8),a=s.length;return function(t,n){var r=n.filename;if(t[0]=31,t[1]=139,t[2]=8,t[8]=n.level<2?4:9==n.level?2:0,t[9]=3,0!=n.mtime&&O(t,4,Math.floor(new Date(n.mtime||Date.now())/1e3)),r){t[3]=8;for(var e=0;e<=r.length;++e)t[e+10]=r.charCodeAt(e)}}(s,n),O(s,a-8,r.d()),O(s,a-4,e),s}var B=function(){function t(t,n){this.c=S(),this.v=1,j.call(this,t,n)}return t.prototype.push=function(t,n){this.c.p(t),j.prototype.push.call(this,t,n)},t.prototype.p=function(t,n){var r=L(t,this.o,this.v&&(this.o.dictionary?6:2),n&&4,this.s);this.v&&(function(t,n){var r=n.level,e=0==r?0:r<6?1:9==r?3:2;if(t[0]=120,t[1]=e<<6|(n.dictionary&&32),t[1]|=31-(t[0]<<8|t[1])%31,n.dictionary){var i=S();i.p(n.dictionary),O(t,2,i.d())}}(r,this.o),this.v=0),n&&O(r,r.length-4,this.c.d()),this.ondata(r,n)},t.prototype.flush=function(){j.prototype.flush.call(this)},t}(),G="undefined"!=typeof TextEncoder&&new TextEncoder,H="undefined"!=typeof TextDecoder&&new TextDecoder;try{H.decode(F,{stream:!0})}catch(t){}var J=function(){function t(t){this.ondata=t}return t.prototype.push=function(t,n){this.ondata||E(5),this.d&&E(4),this.ondata(K(t),this.d=n||!1)},t}();function K(n,r){if(G)return G.encode(n);for(var e=n.length,i=new t(n.length+(n.length>>1)),s=0,a=function(t){i[s++]=t},o=0;o<e;++o){if(s+5>i.length){var h=new t(s+8+(e-o<<1));h.set(i),i=h}var f=n.charCodeAt(o);f<128||r?a(f):f<2048?(a(192|f>>6),a(128|63&f)):f>55295&&f<57344?(a(240|(f=65536+(1047552&f)|1023&n.charCodeAt(++o))>>18),a(128|f>>12&63),a(128|f>>6&63),a(128|63&f)):(a(224|f>>12),a(128|f>>6&63),a(128|63&f))}return b(i,0,s)}const N=new class{constructor(){this._init()}clear(){this._init()}addEvent(t){if(!t)throw new Error("Adding invalid event");const n=this._hasEvents?",":"";this.stream.push(n+t),this._hasEvents=!0}finish(){this.stream.push("]",!0);const t=function(t){let n=0;for(const r of t)n+=r.length;const r=new Uint8Array(n);for(let n=0,e=0,i=t.length;n<i;n++){const i=t[n];r.set(i,e),e+=i.length}return r}(this._deflatedData);return this._init(),t}_init(){this._hasEvents=!1,this._deflatedData=[],this.deflate=new B,this.deflate.ondata=(t,n)=>{this._deflatedData.push(t)},this.stream=new J((t,n)=>{this.deflate.push(t,n)}),this.stream.push("[")}},P={clear:()=>{N.clear()},addEvent:t=>N.addEvent(t),finish:()=>N.finish(),compress:t=>function(t){return q(K(t))}(t)};addEventListener("message",function(t){const n=t.data.method,r=t.data.id,e=t.data.arg;if(n in P&&"function"==typeof P[n])try{const t=P[n](e);postMessage({id:r,method:n,success:!0,response:t})}catch(t){postMessage({id:r,method:n,success:!1,response:t.message}),console.error(t)}}),postMessage({id:void 0,method:"init",success:!0,response:void 0});'
function q_() {
  const e = new Blob([j_])
  return URL.createObjectURL(e)
}
const Do = ['log', 'warn', 'error'],
  Xn = '[Replay] '
function Gr(e, t = 'info') {
  Je(
    {
      category: 'console',
      data: { logger: 'replay' },
      level: t,
      message: `${Xn}${e}`,
    },
    { level: t }
  )
}
function G_() {
  let e = !1,
    t = !1
  const n = {
    exception: () => {},
    infoTick: () => {},
    setConfig: r => {
      ;((e = !!r.captureExceptions), (t = !!r.traceInternals))
    },
  }
  return (
    C
      ? (Do.forEach(r => {
          n[r] = (...s) => {
            ;(_[r](Xn, ...s), t && Gr(s.join(''), Qa(r)))
          }
        }),
        (n.exception = (r, ...s) => {
          ;(s.length && n.error && n.error(...s),
            _.error(Xn, r),
            e
              ? Da(r, {
                  mechanism: {
                    handled: !0,
                    type: 'auto.function.replay.debug',
                  },
                })
              : t && Gr(r, 'error'))
        }),
        (n.infoTick = (...r) => {
          ;(_.log(Xn, ...r), t && setTimeout(() => Gr(r[0]), 0))
        }))
      : Do.forEach(r => {
          n[r] = () => {}
        }),
    n
  )
}
const x = G_()
class ui extends Error {
  constructor() {
    super(`Event buffer exceeded maximum size of ${ei}.`)
  }
}
class eu {
  constructor() {
    ;((this.events = []),
      (this._totalSize = 0),
      (this.hasCheckout = !1),
      (this.waitForCheckout = !1))
  }
  get hasEvents() {
    return this.events.length > 0
  }
  get type() {
    return 'sync'
  }
  destroy() {
    this.events = []
  }
  async addEvent(t) {
    const n = JSON.stringify(t).length
    if (((this._totalSize += n), this._totalSize > ei)) throw new ui()
    this.events.push(t)
  }
  finish() {
    return new Promise(t => {
      const n = this.events
      ;(this.clear(), t(JSON.stringify(n)))
    })
  }
  clear() {
    ;((this.events = []), (this._totalSize = 0), (this.hasCheckout = !1))
  }
  getEarliestTimestamp() {
    const t = this.events.map(n => n.timestamp).sort()[0]
    return t ? oi(t) : null
  }
}
class V_ {
  constructor(t) {
    ;((this._worker = t), (this._id = 0))
  }
  ensureReady() {
    return this._ensureReadyPromise
      ? this._ensureReadyPromise
      : ((this._ensureReadyPromise = new Promise((t, n) => {
          ;(this._worker.addEventListener(
            'message',
            ({ data: r }) => {
              r.success ? t() : n()
            },
            { once: !0 }
          ),
            this._worker.addEventListener(
              'error',
              r => {
                n(r)
              },
              { once: !0 }
            ))
        })),
        this._ensureReadyPromise)
  }
  destroy() {
    ;(C && x.log('Destroying compression worker'), this._worker.terminate())
  }
  postMessage(t, n) {
    const r = this._getAndIncrementId()
    return new Promise((s, i) => {
      const o = ({ data: c }) => {
        const a = c
        if (a.method === t && a.id === r) {
          if ((this._worker.removeEventListener('message', o), !a.success)) {
            ;(C && x.error('Error in compression worker: ', a.response),
              i(new Error('Error in compression worker')))
            return
          }
          s(a.response)
        }
      }
      ;(this._worker.addEventListener('message', o),
        this._worker.postMessage({ id: r, method: t, arg: n }))
    })
  }
  _getAndIncrementId() {
    return this._id++
  }
}
class Y_ {
  constructor(t) {
    ;((this._worker = new V_(t)),
      (this._earliestTimestamp = null),
      (this._totalSize = 0),
      (this.hasCheckout = !1),
      (this.waitForCheckout = !1))
  }
  get hasEvents() {
    return !!this._earliestTimestamp
  }
  get type() {
    return 'worker'
  }
  ensureReady() {
    return this._worker.ensureReady()
  }
  destroy() {
    this._worker.destroy()
  }
  addEvent(t) {
    const n = oi(t.timestamp)
    ;(!this._earliestTimestamp || n < this._earliestTimestamp) &&
      (this._earliestTimestamp = n)
    const r = JSON.stringify(t)
    return (
      (this._totalSize += r.length),
      this._totalSize > ei
        ? Promise.reject(new ui())
        : this._sendEventToWorker(r)
    )
  }
  finish() {
    return this._finishRequest()
  }
  clear() {
    ;((this._earliestTimestamp = null),
      (this._totalSize = 0),
      (this.hasCheckout = !1),
      this._worker.postMessage('clear').then(null, t => {
        C && x.exception(t, 'Sending "clear" message to worker failed', t)
      }))
  }
  getEarliestTimestamp() {
    return this._earliestTimestamp
  }
  _sendEventToWorker(t) {
    return this._worker.postMessage('addEvent', t)
  }
  async _finishRequest() {
    const t = await this._worker.postMessage('finish')
    return ((this._earliestTimestamp = null), (this._totalSize = 0), t)
  }
}
class X_ {
  constructor(t) {
    ;((this._fallback = new eu()),
      (this._compression = new Y_(t)),
      (this._used = this._fallback),
      (this._ensureWorkerIsLoadedPromise = this._ensureWorkerIsLoaded()))
  }
  get waitForCheckout() {
    return this._used.waitForCheckout
  }
  get type() {
    return this._used.type
  }
  get hasEvents() {
    return this._used.hasEvents
  }
  get hasCheckout() {
    return this._used.hasCheckout
  }
  set hasCheckout(t) {
    this._used.hasCheckout = t
  }
  set waitForCheckout(t) {
    this._used.waitForCheckout = t
  }
  destroy() {
    ;(this._fallback.destroy(), this._compression.destroy())
  }
  clear() {
    return this._used.clear()
  }
  getEarliestTimestamp() {
    return this._used.getEarliestTimestamp()
  }
  addEvent(t) {
    return this._used.addEvent(t)
  }
  async finish() {
    return (await this.ensureWorkerIsLoaded(), this._used.finish())
  }
  ensureWorkerIsLoaded() {
    return this._ensureWorkerIsLoadedPromise
  }
  async _ensureWorkerIsLoaded() {
    try {
      await this._compression.ensureReady()
    } catch (t) {
      C &&
        x.exception(
          t,
          'Failed to load the compression worker, falling back to simple buffer'
        )
      return
    }
    await this._switchToCompressionWorker()
  }
  async _switchToCompressionWorker() {
    const { events: t, hasCheckout: n, waitForCheckout: r } = this._fallback,
      s = []
    for (const i of t) s.push(this._compression.addEvent(i))
    ;((this._compression.hasCheckout = n),
      (this._compression.waitForCheckout = r),
      (this._used = this._compression))
    try {
      ;(await Promise.all(s), this._fallback.clear())
    } catch (i) {
      C && x.exception(i, 'Failed to add events when switching buffers.')
    }
  }
}
function K_({ useCompression: e, workerUrl: t }) {
  if (e && window.Worker) {
    const n = J_(t)
    if (n) return n
  }
  return (C && x.log('Using simple buffer'), new eu())
}
function J_(e) {
  try {
    const t = e || Q_()
    if (!t) return
    C && x.log(`Using compression worker${e ? ` from ${e}` : ''}`)
    const n = new Worker(t)
    return new X_(n)
  } catch (t) {
    C && x.exception(t, 'Failed to create compression worker')
  }
}
function Q_() {
  return typeof __SENTRY_EXCLUDE_REPLAY_WORKER__ > 'u' ||
    !__SENTRY_EXCLUDE_REPLAY_WORKER__
    ? q_()
    : ''
}
function di() {
  try {
    return 'sessionStorage' in Q && !!Q.sessionStorage
  } catch {
    return !1
  }
}
function Z_(e) {
  ;(ey(), (e.session = void 0))
}
function ey() {
  if (di())
    try {
      Q.sessionStorage.removeItem(Qs)
    } catch {}
}
function tu(e) {
  return e === void 0 ? !1 : Math.random() < e
}
function li(e) {
  if (di())
    try {
      Q.sessionStorage.setItem(Qs, JSON.stringify(e))
    } catch {}
}
function nu(e) {
  const t = Date.now(),
    n = e.id || Se(),
    r = e.started || t,
    s = e.lastActivity || t,
    i = e.segmentId || 0,
    o = e.sampled,
    c = e.previousSessionId
  return {
    id: n,
    started: r,
    lastActivity: s,
    segmentId: i,
    sampled: o,
    previousSessionId: c,
  }
}
function ty(e, t) {
  return tu(e) ? 'session' : t ? 'buffer' : !1
}
function Po(
  { sessionSampleRate: e, allowBuffering: t, stickySession: n = !1 },
  { previousSessionId: r } = {}
) {
  const s = ty(e, t),
    i = nu({ sampled: s, previousSessionId: r })
  return (n && li(i), i)
}
function ny() {
  if (!di()) return null
  try {
    const e = Q.sessionStorage.getItem(Qs)
    if (!e) return null
    const t = JSON.parse(e)
    return (C && x.infoTick('Loading existing session'), nu(t))
  } catch {
    return null
  }
}
function Ss(e, t, n = +new Date()) {
  return e === null || t === void 0 || t < 0 ? !0 : t === 0 ? !1 : e + t <= n
}
function ru(
  e,
  { maxReplayDuration: t, sessionIdleExpire: n, targetTime: r = Date.now() }
) {
  return Ss(e.started, t, r) || Ss(e.lastActivity, n, r)
}
function su(e, { sessionIdleExpire: t, maxReplayDuration: n }) {
  return !(
    !ru(e, { sessionIdleExpire: t, maxReplayDuration: n }) ||
    (e.sampled === 'buffer' && e.segmentId === 0)
  )
}
function Vr(
  { sessionIdleExpire: e, maxReplayDuration: t, previousSessionId: n },
  r
) {
  const s = r.stickySession && ny()
  return s
    ? su(s, { sessionIdleExpire: e, maxReplayDuration: t })
      ? (C &&
          x.infoTick(
            'Session in sessionStorage is expired, creating new one...'
          ),
        Po(r, { previousSessionId: s.id }))
      : s
    : (C && x.infoTick('Creating new session'), Po(r, { previousSessionId: n }))
}
function ry(e) {
  return e.type === D.Custom
}
function fi(e, t, n) {
  return ou(e, t) ? (iu(e, t, n), !0) : !1
}
function sy(e, t, n) {
  return ou(e, t) ? iu(e, t, n) : Promise.resolve(null)
}
async function iu(e, t, n) {
  const { eventBuffer: r } = e
  if (!r || (r.waitForCheckout && !n)) return null
  const s = e.recordingMode === 'buffer'
  try {
    ;(n && s && r.clear(),
      n && ((r.hasCheckout = !0), (r.waitForCheckout = !1)))
    const i = e.getOptions(),
      o = iy(t, i.beforeAddRecordingEvent)
    return o ? await r.addEvent(o) : void 0
  } catch (i) {
    const o = i && i instanceof ui,
      c = o ? 'addEventSizeExceeded' : 'addEvent'
    if (o && s) return (r.clear(), (r.waitForCheckout = !0), null)
    ;(e.handleException(i), await e.stop({ reason: c }))
    const a = F()
    a && a.recordDroppedEvent('internal_sdk_error', 'replay')
  }
}
function ou(e, t) {
  if (!e.eventBuffer || e.isPaused() || !e.isEnabled()) return !1
  const n = oi(t.timestamp)
  return n + e.timeouts.sessionIdlePause < Date.now()
    ? !1
    : n > e.getContext().initialTimestamp + e.getOptions().maxReplayDuration
      ? (C &&
          x.infoTick(
            `Skipping event with timestamp ${n} because it is after maxReplayDuration`
          ),
        !1)
      : !0
}
function iy(e, t) {
  try {
    if (typeof t == 'function' && ry(e)) return t(e)
  } catch (n) {
    return (
      C &&
        x.exception(
          n,
          'An error occurred in the `beforeAddRecordingEvent` callback, skipping the event...'
        ),
      null
    )
  }
  return e
}
function pi(e) {
  return !e.type
}
function Es(e) {
  return e.type === 'transaction'
}
function oy(e) {
  return e.type === 'replay_event'
}
function Fo(e) {
  return e.type === 'feedback'
}
function ay(e) {
  return (t, n) => {
    if (!e.isEnabled() || (!pi(t) && !Es(t))) return
    const r = n.statusCode
    if (!(!r || r < 200 || r >= 300)) {
      if (Es(t)) {
        cy(e, t)
        return
      }
      uy(e, t)
    }
  }
}
function cy(e, t) {
  const n = e.getContext()
  t.contexts?.trace?.trace_id &&
    n.traceIds.size < 100 &&
    n.traceIds.add(t.contexts.trace.trace_id)
}
function uy(e, t) {
  const n = e.getContext()
  if (
    (t.event_id && n.errorIds.size < 100 && n.errorIds.add(t.event_id),
    e.recordingMode !== 'buffer' || !t.tags || !t.tags.replayId)
  )
    return
  const { beforeErrorSampling: r } = e.getOptions()
  ;(typeof r == 'function' && !r(t)) ||
    vn(async () => {
      try {
        await e.sendBufferedReplayOrFlush()
      } catch (s) {
        e.handleException(s)
      }
    })
}
function dy(e) {
  return t => {
    !e.isEnabled() || !pi(t) || ly(e, t)
  }
}
function ly(e, t) {
  const n = t.exception?.values?.[0]?.value
  if (
    typeof n == 'string' &&
    (n.match(
      /(reactjs\.org\/docs\/error-decoder\.html\?invariant=|react\.dev\/errors\/)(418|419|422|423|425)/
    ) ||
      n.match(
        /(does not match server-rendered HTML|Hydration failed because)/i
      ))
  ) {
    const r = Ne({ category: 'replay.hydrate-error', data: { url: Ut() } })
    In(e, r)
  }
}
function fy(e) {
  const t = F()
  t && t.on('beforeAddBreadcrumb', n => py(e, n))
}
function py(e, t) {
  if (!e.isEnabled() || !au(t)) return
  const n = hy(t)
  n && In(e, n)
}
function hy(e) {
  return !au(e) ||
    ['fetch', 'xhr', 'sentry.event', 'sentry.transaction'].includes(
      e.category
    ) ||
    e.category.startsWith('ui.')
    ? null
    : e.category === 'console'
      ? my(e)
      : Ne(e)
}
function my(e) {
  const t = e.data?.arguments
  if (!Array.isArray(t) || t.length === 0) return Ne(e)
  let n = !1
  const r = t.map(s => {
    if (!s) return s
    if (typeof s == 'string')
      return s.length > Dn ? ((n = !0), `${s.slice(0, Dn)}…`) : s
    if (typeof s == 'object')
      try {
        const i = Te(s, 7)
        return JSON.stringify(i).length > Dn
          ? ((n = !0), `${JSON.stringify(i, null, 2).slice(0, Dn)}…`)
          : i
      } catch {}
    return s
  })
  return Ne({
    ...e,
    data: {
      ...e.data,
      arguments: r,
      ...(n ? { _meta: { warnings: ['CONSOLE_ARG_TRUNCATED'] } } : {}),
    },
  })
}
function au(e) {
  return !!e.category
}
function gy(e, t) {
  return e.type || !e.exception?.values?.length
    ? !1
    : !!t.originalException?.__rrweb__
}
function cu() {
  const e = X().getPropagationContext().dsc
  e && delete e.replay_id
  const t = le()
  if (t) {
    const n = De(t)
    delete n.replay_id
  }
}
function _y(e, t) {
  ;(e.triggerUserActivity(),
    e.addUpdate(() =>
      t.timestamp
        ? (e.throttledAddEvent({
            type: D.Custom,
            timestamp: t.timestamp * 1e3,
            data: {
              tag: 'breadcrumb',
              payload: {
                timestamp: t.timestamp,
                type: 'default',
                category: 'sentry.feedback',
                data: { feedbackId: t.event_id },
              },
            },
          }),
          !1)
        : !0
    ))
}
function yy(e, t) {
  return e.recordingMode !== 'buffer' ||
    t.message === Zs ||
    !t.exception ||
    t.type
    ? !1
    : tu(e.getOptions().errorSampleRate)
}
function Sy(e) {
  return Object.assign(
    (t, n) =>
      !e.isEnabled() || e.isPaused()
        ? t
        : oy(t)
          ? (delete t.breadcrumbs, t)
          : !pi(t) && !Es(t) && !Fo(t)
            ? t
            : e.checkAndHandleExpiredSession()
              ? Fo(t)
                ? (e.flush(),
                  (t.contexts.feedback.replay_id = e.getSessionId()),
                  _y(e, t),
                  t)
                : gy(t, n) && !e.getOptions()._experiments.captureExceptions
                  ? (C && x.log('Ignoring error from rrweb internals', t), null)
                  : ((yy(e, t) || e.recordingMode === 'session') &&
                      (t.tags = { ...t.tags, replayId: e.getSessionId() }),
                    t)
              : (cu(), t),
    { id: 'Replay' }
  )
}
function kr(e, t) {
  return t.map(({ type: n, start: r, end: s, name: i, data: o }) => {
    const c = e.throttledAddEvent({
      type: D.Custom,
      timestamp: r,
      data: {
        tag: 'performanceSpan',
        payload: {
          op: n,
          description: i,
          startTimestamp: r,
          endTimestamp: s,
          data: o,
        },
      },
    })
    return typeof c == 'string' ? Promise.resolve(null) : c
  })
}
function Ey(e) {
  const { from: t, to: n } = e,
    r = Date.now() / 1e3
  return {
    type: 'navigation.push',
    start: r,
    end: r,
    name: n,
    data: { previous: t },
  }
}
function by(e) {
  return t => {
    if (!e.isEnabled()) return
    const n = Ey(t)
    n !== null &&
      (e.getContext().urls.push(n.name),
      e.triggerUserActivity(),
      e.addUpdate(() => (kr(e, [n]), !1)))
  }
}
function vy(e, t) {
  return C && e.getOptions()._experiments.traceInternals ? !1 : cf(t, F())
}
function uu(e, t) {
  e.isEnabled() &&
    t !== null &&
    (vy(e, t.name) || e.addUpdate(() => (kr(e, [t]), !0)))
}
function Rr(e) {
  if (!e) return
  const t = new TextEncoder()
  try {
    if (typeof e == 'string') return t.encode(e).length
    if (e instanceof URLSearchParams) return t.encode(e.toString()).length
    if (e instanceof FormData) {
      const n = Tc(e)
      return t.encode(n).length
    }
    if (e instanceof Blob) return e.size
    if (e instanceof ArrayBuffer) return e.byteLength
  } catch {}
}
function du(e) {
  if (!e) return
  const t = parseInt(e, 10)
  return isNaN(t) ? void 0 : t
}
function pr(e, t) {
  if (!e) return { headers: {}, size: void 0, _meta: { warnings: [t] } }
  const n = { ...e._meta },
    r = n.warnings || []
  return ((n.warnings = [...r, t]), (e._meta = n), e)
}
function lu(e, t) {
  if (!t) return null
  const {
    startTimestamp: n,
    endTimestamp: r,
    url: s,
    method: i,
    statusCode: o,
    request: c,
    response: a,
  } = t
  return {
    type: e,
    start: n / 1e3,
    end: r / 1e3,
    name: s,
    data: { method: i, statusCode: o, request: c, response: a },
  }
}
function un(e) {
  return { headers: {}, size: e, _meta: { warnings: ['URL_SKIPPED'] } }
}
function Xe(e, t, n) {
  if (!t && Object.keys(e).length === 0) return
  if (!t) return { headers: e }
  if (!n) return { headers: e, size: t }
  const r = { headers: e, size: t },
    { body: s, warnings: i } = Ty(n)
  return ((r.body = s), i?.length && (r._meta = { warnings: i }), r)
}
function bs(e, t) {
  return Object.entries(e).reduce((n, [r, s]) => {
    const i = r.toLowerCase()
    return (t.includes(i) && e[r] && (n[i] = s), n)
  }, {})
}
function Ty(e) {
  if (!e || typeof e != 'string') return { body: e }
  const t = e.length > _o,
    n = Iy(e)
  if (t) {
    const r = e.slice(0, _o)
    return n
      ? { body: r, warnings: ['MAYBE_JSON_TRUNCATED'] }
      : { body: `${r}…`, warnings: ['TEXT_TRUNCATED'] }
  }
  if (n)
    try {
      return { body: JSON.parse(e) }
    } catch {}
  return { body: e }
}
function Iy(e) {
  const t = e[0],
    n = e[e.length - 1]
  return (t === '[' && n === ']') || (t === '{' && n === '}')
}
function hr(e, t) {
  const n = wy(e)
  return Ue(n, t)
}
function wy(e, t = Q.document.baseURI) {
  if (
    e.startsWith('http://') ||
    e.startsWith('https://') ||
    e.startsWith(Q.location.origin)
  )
    return e
  const n = new URL(e, t)
  if (n.origin !== new URL(t).origin) return e
  const r = n.href
  return !e.endsWith('/') && r.endsWith('/') ? r.slice(0, -1) : r
}
async function ky(e, t, n) {
  try {
    const r = await Cy(e, t, n),
      s = lu('resource.fetch', r)
    uu(n.replay, s)
  } catch (r) {
    C && x.exception(r, 'Failed to capture fetch breadcrumb')
  }
}
function Ry(e, t) {
  const { input: n, response: r } = t,
    s = n ? wc(n) : void 0,
    i = Rr(s),
    o = r ? du(r.headers.get('content-length')) : void 0
  ;(i !== void 0 && (e.data.request_body_size = i),
    o !== void 0 && (e.data.response_body_size = o))
}
async function Cy(e, t, n) {
  const r = Date.now(),
    { startTimestamp: s = r, endTimestamp: i = r } = t,
    {
      url: o,
      method: c,
      status_code: a = 0,
      request_body_size: u,
      response_body_size: l,
    } = e.data,
    d = hr(o, n.networkDetailAllowUrls) && !hr(o, n.networkDetailDenyUrls),
    p = d ? xy(n, t.input, u) : un(u),
    f = await My(d, n, t.response, l)
  return {
    startTimestamp: s,
    endTimestamp: i,
    url: o,
    method: c,
    statusCode: a,
    request: p,
    response: f,
  }
}
function xy({ networkCaptureBodies: e, networkRequestHeaders: t }, n, r) {
  const s = n ? Ny(n, t) : {}
  if (!e) return Xe(s, r, void 0)
  const i = wc(n),
    [o, c] = Ic(i, x),
    a = Xe(s, r, o)
  return c ? pr(a, c) : a
}
async function My(
  e,
  { networkCaptureBodies: t, networkResponseHeaders: n },
  r,
  s
) {
  if (!e && s !== void 0) return un(s)
  const i = r ? fu(r.headers, n) : {}
  if (!r || (!t && s !== void 0)) return Xe(i, s, void 0)
  const [o, c] = await Oy(r),
    a = Ay(o, {
      networkCaptureBodies: t,
      responseBodySize: s,
      captureDetails: e,
      headers: i,
    })
  return c ? pr(a, c) : a
}
function Ay(
  e,
  {
    networkCaptureBodies: t,
    responseBodySize: n,
    captureDetails: r,
    headers: s,
  }
) {
  try {
    const i = e?.length && n === void 0 ? Rr(e) : n
    return r ? (t ? Xe(s, i, e) : Xe(s, i, void 0)) : un(i)
  } catch (i) {
    return (
      C && x.exception(i, 'Failed to serialize response body'),
      Xe(s, n, void 0)
    )
  }
}
async function Oy(e) {
  const t = Ly(e)
  if (!t) return [void 0, 'BODY_PARSE_ERROR']
  try {
    return [await Dy(t)]
  } catch (n) {
    return n instanceof Error && n.message.indexOf('Timeout') > -1
      ? (C && x.warn('Parsing text body from response timed out'),
        [void 0, 'BODY_PARSE_TIMEOUT'])
      : (C && x.exception(n, 'Failed to get text body from response'),
        [void 0, 'BODY_PARSE_ERROR'])
  }
}
function fu(e, t) {
  const n = {}
  return (
    t.forEach(r => {
      e.get(r) && (n[r] = e.get(r))
    }),
    n
  )
}
function Ny(e, t) {
  return e.length === 1 && typeof e[0] != 'string'
    ? Bo(e[0], t)
    : e.length === 2
      ? Bo(e[1], t)
      : {}
}
function Bo(e, t) {
  if (!e) return {}
  const n = e.headers
  return n
    ? n instanceof Headers
      ? fu(n, t)
      : Array.isArray(n)
        ? {}
        : bs(n, t)
    : {}
}
function Ly(e) {
  try {
    return e.clone()
  } catch (t) {
    C && x.exception(t, 'Failed to clone response body')
  }
}
function Dy(e) {
  return new Promise((t, n) => {
    const r = vn(
      () => n(new Error('Timeout while trying to read response body')),
      500
    )
    Py(e)
      .then(
        s => t(s),
        s => n(s)
      )
      .finally(() => clearTimeout(r))
  })
}
async function Py(e) {
  return await e.text()
}
async function Fy(e, t, n) {
  try {
    const r = $y(e, t, n),
      s = lu('resource.xhr', r)
    uu(n.replay, s)
  } catch (r) {
    C && x.exception(r, 'Failed to capture xhr breadcrumb')
  }
}
function By(e, t) {
  const { xhr: n, input: r } = t
  if (!n) return
  const s = Rr(r),
    i = n.getResponseHeader('content-length')
      ? du(n.getResponseHeader('content-length'))
      : zy(n.response, n.responseType)
  ;(s !== void 0 && (e.data.request_body_size = s),
    i !== void 0 && (e.data.response_body_size = i))
}
function $y(e, t, n) {
  const r = Date.now(),
    { startTimestamp: s = r, endTimestamp: i = r, input: o, xhr: c } = t,
    {
      url: a,
      method: u,
      status_code: l = 0,
      request_body_size: d,
      response_body_size: p,
    } = e.data
  if (!a) return null
  if (
    !c ||
    !hr(a, n.networkDetailAllowUrls) ||
    hr(a, n.networkDetailDenyUrls)
  ) {
    const T = un(d),
      y = un(p)
    return {
      startTimestamp: s,
      endTimestamp: i,
      url: a,
      method: u,
      statusCode: l,
      request: T,
      response: y,
    }
  }
  const f = c[ot],
    h = f ? bs(f.request_headers, n.networkRequestHeaders) : {},
    m = bs(Uy(c), n.networkResponseHeaders),
    [g, E] = n.networkCaptureBodies ? Ic(o, x) : [void 0],
    [R, P] = n.networkCaptureBodies ? Hy(c) : [void 0],
    N = Xe(h, d, g),
    M = Xe(m, p, R)
  return {
    startTimestamp: s,
    endTimestamp: i,
    url: a,
    method: u,
    statusCode: l,
    request: E ? pr(N, E) : N,
    response: P ? pr(M, P) : M,
  }
}
function Uy(e) {
  const t = e.getAllResponseHeaders()
  return t
    ? t
        .split(
          `\r
`
        )
        .reduce((n, r) => {
          const [s, i] = r.split(': ')
          return (i && (n[s.toLowerCase()] = i), n)
        }, {})
    : {}
}
function Hy(e) {
  const t = []
  try {
    return [e.responseText]
  } catch (n) {
    t.push(n)
  }
  try {
    return Wy(e.response, e.responseType)
  } catch (n) {
    t.push(n)
  }
  return (C && x.warn('Failed to get xhr response body', ...t), [void 0])
}
function Wy(e, t) {
  try {
    if (typeof e == 'string') return [e]
    if (e instanceof Document) return [e.body.outerHTML]
    if (t === 'json' && e && typeof e == 'object') return [JSON.stringify(e)]
    if (!e) return [void 0]
  } catch (n) {
    return (
      C && x.exception(n, 'Failed to serialize body', e),
      [void 0, 'BODY_PARSE_ERROR']
    )
  }
  return (
    C && x.log('Skipping network body because of body type', e),
    [void 0, 'UNPARSEABLE_BODY_TYPE']
  )
}
function zy(e, t) {
  try {
    const n = t === 'json' && e && typeof e == 'object' ? JSON.stringify(e) : e
    return Rr(n)
  } catch {
    return
  }
}
function jy(e) {
  const t = F()
  try {
    const {
        networkDetailAllowUrls: n,
        networkDetailDenyUrls: r,
        networkCaptureBodies: s,
        networkRequestHeaders: i,
        networkResponseHeaders: o,
      } = e.getOptions(),
      c = {
        replay: e,
        networkDetailAllowUrls: n,
        networkDetailDenyUrls: r,
        networkCaptureBodies: s,
        networkRequestHeaders: i,
        networkResponseHeaders: o,
      }
    t && t.on('beforeAddBreadcrumb', (a, u) => qy(c, a, u))
  } catch {}
}
function qy(e, t, n) {
  if (t.data)
    try {
      ;(Gy(t) && Yy(n) && (By(t, n), Fy(t, n, e)),
        Vy(t) && Xy(n) && (Ry(t, n), ky(t, n, e)))
    } catch (r) {
      C && x.exception(r, 'Error when enriching network breadcrumb')
    }
}
function Gy(e) {
  return e.category === 'xhr'
}
function Vy(e) {
  return e.category === 'fetch'
}
function Yy(e) {
  return e?.xhr
}
function Xy(e) {
  return e?.response
}
function Ky(e) {
  const t = F()
  ;(Ec(k_(e)), vr(by(e)), fy(e), jy(e))
  const n = Sy(e)
  ;(Rl(n),
    t &&
      (t.on('beforeSendEvent', dy(e)),
      t.on('afterSendEvent', ay(e)),
      t.on('createDsc', r => {
        const s = e.getSessionId()
        s &&
          e.isEnabled() &&
          e.recordingMode === 'session' &&
          e.checkAndHandleExpiredSession() &&
          (r.replay_id = s)
      }),
      t.on('spanStart', r => {
        e.lastActiveSpan = r
      }),
      t.on('spanEnd', r => {
        e.lastActiveSpan = r
      }),
      t.on('beforeSendFeedback', async (r, s) => {
        const i = e.getSessionId()
        s?.includeReplay &&
          e.isEnabled() &&
          i &&
          r.contexts?.feedback &&
          (r.contexts.feedback.source === 'api' &&
            (await e.sendBufferedReplayOrFlush()),
          (r.contexts.feedback.replay_id = i))
      }),
      t.on('openFeedbackWidget', async () => {
        await e.sendBufferedReplayOrFlush()
      })))
}
async function Jy(e) {
  try {
    return Promise.all(kr(e, [Qy(Q.performance.memory)]))
  } catch {
    return []
  }
}
function Qy(e) {
  const { jsHeapSizeLimit: t, totalJSHeapSize: n, usedJSHeapSize: r } = e,
    s = Date.now() / 1e3
  return {
    type: 'memory',
    name: 'memory',
    start: s,
    end: s,
    data: {
      memory: { jsHeapSizeLimit: t, totalJSHeapSize: n, usedJSHeapSize: r },
    },
  }
}
function Zy(e, t, n) {
  return hf(e, t, { ...n, setTimeoutImpl: vn })
}
const $n = $.navigator
function eS() {
  return /iPhone|iPad|iPod/i.test($n?.userAgent ?? '') ||
    (/Macintosh/i.test($n?.userAgent ?? '') &&
      $n?.maxTouchPoints &&
      $n?.maxTouchPoints > 1)
    ? { sampling: { mousemove: !1 } }
    : {}
}
function tS(e) {
  let t = !1
  return (n, r) => {
    if (!e.checkAndHandleExpiredSession()) {
      C && x.warn('Received replay event after session expired.')
      return
    }
    const s = r || !t
    ;((t = !0),
      e.clickDetector && b_(e.clickDetector, n),
      e.addUpdate(() => {
        if (
          (e.recordingMode === 'buffer' && s && e.setInitialState(),
          !fi(e, n, s))
        )
          return !0
        if (!s) return !1
        const i = e.session
        if ((rS(e, s), e.recordingMode === 'buffer' && i && e.eventBuffer)) {
          const o = e.eventBuffer.getEarliestTimestamp()
          o &&
            (C &&
              x.log(
                `Updating session start time to earliest event in buffer to ${new Date(o)}`
              ),
            (i.started = o),
            e.getOptions().stickySession && li(i))
        }
        return (
          i?.previousSessionId || (e.recordingMode === 'session' && e.flush()),
          !0
        )
      }))
  }
}
function nS(e) {
  const t = e.getOptions()
  return {
    type: D.Custom,
    timestamp: Date.now(),
    data: {
      tag: 'options',
      payload: {
        shouldRecordCanvas: e.isRecordingCanvas(),
        sessionSampleRate: t.sessionSampleRate,
        errorSampleRate: t.errorSampleRate,
        useCompressionOption: t.useCompression,
        blockAllMedia: t.blockAllMedia,
        maskAllText: t.maskAllText,
        maskAllInputs: t.maskAllInputs,
        useCompression: e.eventBuffer ? e.eventBuffer.type === 'worker' : !1,
        networkDetailHasUrls: t.networkDetailAllowUrls.length > 0,
        networkCaptureBodies: t.networkCaptureBodies,
        networkRequestHasHeaders: t.networkRequestHeaders.length > 0,
        networkResponseHasHeaders: t.networkResponseHeaders.length > 0,
      },
    },
  }
}
function rS(e, t) {
  !t || !e.session || e.session.segmentId !== 0 || fi(e, nS(e), !1)
}
function sS(e) {
  if (!e) return null
  try {
    return e.nodeType === e.ELEMENT_NODE ? e : e.parentElement
  } catch {
    return null
  }
}
function iS(e, t, n, r) {
  return _t(Ca(e, Ls(e), r, n), [
    [{ type: 'replay_event' }, e],
    [
      {
        type: 'replay_recording',
        length:
          typeof t == 'string' ? new TextEncoder().encode(t).length : t.length,
      },
      t,
    ],
  ])
}
function oS({ recordingData: e, headers: t }) {
  let n
  const r = `${JSON.stringify(t)}
`
  if (typeof e == 'string') n = `${r}${e}`
  else {
    const i = new TextEncoder().encode(r)
    ;((n = new Uint8Array(i.length + e.length)), n.set(i), n.set(e, i.length))
  }
  return n
}
async function aS({ client: e, scope: t, replayId: n, event: r }) {
  const s =
      typeof e._integrations == 'object' &&
      e._integrations !== null &&
      !Array.isArray(e._integrations)
        ? Object.keys(e._integrations)
        : void 0,
    i = { event_id: n, integrations: s }
  e.emit('preprocessEvent', r, i)
  const o = await La(e.getOptions(), r, i, t, e, Oe())
  if (!o) return null
  ;(e.emit('postprocessEvent', o, i), (o.platform = o.platform || 'javascript'))
  const c = e.getSdkMetadata(),
    { name: a, version: u, settings: l } = c?.sdk || {}
  return (
    (o.sdk = {
      ...o.sdk,
      name: a || 'sentry.javascript.unknown',
      version: u || '0.0.0',
      settings: l,
    }),
    o
  )
}
async function cS({
  recordingData: e,
  replayId: t,
  segmentId: n,
  eventContext: r,
  timestamp: s,
  session: i,
}) {
  const o = oS({ recordingData: e, headers: { segment_id: n } }),
    { urls: c, errorIds: a, traceIds: u, initialTimestamp: l } = r,
    d = F(),
    p = X(),
    f = d?.getTransport(),
    h = d?.getDsn()
  if (!d || !f || !h || !i.sampled) return Promise.resolve({})
  const m = {
      type: Bm,
      replay_start_timestamp: l / 1e3,
      timestamp: s / 1e3,
      error_ids: a,
      trace_ids: u,
      urls: c,
      replay_id: t,
      segment_id: n,
      replay_type: i.sampled,
    },
    g = await aS({ scope: p, client: d, replayId: t, event: m })
  if (!g)
    return (
      d.recordDroppedEvent('event_processor', 'replay'),
      C && x.log('An event processor returned `null`, will not send event.'),
      Promise.resolve({})
    )
  delete g.sdkProcessingMetadata
  const E = iS(g, o, h, d.getOptions().tunnel)
  let R
  try {
    R = await f.send(E)
  } catch (N) {
    const M = new Error(Zs)
    try {
      M.cause = N
    } catch {}
    throw M
  }
  if (
    typeof R.statusCode == 'number' &&
    (R.statusCode < 200 || R.statusCode >= 300)
  )
    throw new pu(R.statusCode)
  const P = Ya({}, R)
  if (Va(P, 'replay')) throw new hi(P)
  return R
}
class pu extends Error {
  constructor(t) {
    super(`Transport returned status code ${t}`)
  }
}
class hi extends Error {
  constructor(t) {
    ;(super('Rate limit hit'), (this.rateLimits = t))
  }
}
async function hu(e, t = { count: 0, interval: jm }) {
  const { recordingData: n, onError: r } = e
  if (n.length)
    try {
      return (await cS(e), !0)
    } catch (s) {
      if (s instanceof pu || s instanceof hi) throw s
      if ((Fa('Replays', { _retryCount: t.count }), r && r(s), t.count >= qm)) {
        const i = new Error(`${Zs} - max retries exceeded`)
        try {
          i.cause = s
        } catch {}
        throw i
      }
      return (
        (t.interval *= ++t.count),
        new Promise((i, o) => {
          vn(async () => {
            try {
              ;(await hu(e, t), i(!0))
            } catch (c) {
              o(c)
            }
          }, t.interval)
        })
      )
    }
}
const mu = '__THROTTLED',
  uS = '__SKIPPED'
function dS(e, t, n) {
  const r = new Map(),
    s = c => {
      const a = c - n
      r.forEach((u, l) => {
        l < a && r.delete(l)
      })
    },
    i = () => [...r.values()].reduce((c, a) => c + a, 0)
  let o = !1
  return (...c) => {
    const a = Math.floor(Date.now() / 1e3)
    if ((s(a), i() >= t)) {
      const l = o
      return ((o = !0), l ? uS : mu)
    }
    o = !1
    const u = r.get(a) || 0
    return (r.set(a, u + 1), e(...c))
  }
}
class lS {
  constructor({ options: t, recordingOptions: n }) {
    ;((this.eventBuffer = null),
      (this.performanceEntries = []),
      (this.replayPerformanceEntries = []),
      (this.recordingMode = 'session'),
      (this.timeouts = { sessionIdlePause: $m, sessionIdleExpire: Um }),
      (this._lastActivity = Date.now()),
      (this._isEnabled = !1),
      (this._isPaused = !1),
      (this._requiresManualStart = !1),
      (this._hasInitializedCoreListeners = !1),
      (this._context = {
        errorIds: new Set(),
        traceIds: new Set(),
        urls: [],
        initialTimestamp: Date.now(),
        initialUrl: '',
      }),
      (this._recordingOptions = n),
      (this._options = t),
      (this._debouncedFlush = Zy(
        () => this._flush(),
        this._options.flushMinDelay,
        { maxWait: this._options.flushMaxDelay }
      )),
      (this._throttledAddEvent = dS((o, c) => sy(this, o, c), 300, 5)))
    const { slowClickTimeout: r, slowClickIgnoreSelectors: s } =
        this.getOptions(),
      i = r
        ? {
            threshold: Math.min(Gm, r),
            timeout: r,
            scrollTimeout: Vm,
            ignoreSelector: s ? s.join(',') : '',
          }
        : void 0
    if ((i && (this.clickDetector = new __(this, i)), C)) {
      const o = t._experiments
      x.setConfig({
        captureExceptions: !!o.captureExceptions,
        traceInternals: !!o.traceInternals,
      })
    }
    ;((this._handleVisibilityChange = () => {
      Q.document.visibilityState === 'visible'
        ? this._doChangeToForegroundTasks()
        : this._doChangeToBackgroundTasks()
    }),
      (this._handleWindowBlur = () => {
        const o = Ne({ category: 'ui.blur' })
        this._doChangeToBackgroundTasks(o)
      }),
      (this._handleWindowFocus = () => {
        const o = Ne({ category: 'ui.focus' })
        this._doChangeToForegroundTasks(o)
      }),
      (this._handleKeyboardEvent = o => {
        M_(this, o)
      }))
  }
  getContext() {
    return this._context
  }
  isEnabled() {
    return this._isEnabled
  }
  isPaused() {
    return this._isPaused
  }
  isRecordingCanvas() {
    return !!this._canvas
  }
  getOptions() {
    return this._options
  }
  handleException(t) {
    ;(C && x.exception(t), this._options.onError && this._options.onError(t))
  }
  initializeSampling(t) {
    const { errorSampleRate: n, sessionSampleRate: r } = this._options,
      s = n <= 0 && r <= 0
    if (((this._requiresManualStart = s), !s)) {
      if ((this._initializeSessionForSampling(t), !this.session)) {
        C && x.exception(new Error('Unable to initialize and create session'))
        return
      }
      this.session.sampled !== !1 &&
        ((this.recordingMode =
          this.session.sampled === 'buffer' && this.session.segmentId === 0
            ? 'buffer'
            : 'session'),
        C && x.infoTick(`Starting replay in ${this.recordingMode} mode`),
        this._initializeRecording())
    }
  }
  start() {
    if (this._isEnabled && this.recordingMode === 'session') {
      C && x.log('Recording is already in progress')
      return
    }
    if (this._isEnabled && this.recordingMode === 'buffer') {
      C && x.log('Buffering is in progress, call `flush()` to save the replay')
      return
    }
    ;(C && x.infoTick('Starting replay in session mode'),
      this._updateUserActivity())
    const t = Vr(
      {
        maxReplayDuration: this._options.maxReplayDuration,
        sessionIdleExpire: this.timeouts.sessionIdleExpire,
      },
      {
        stickySession: this._options.stickySession,
        sessionSampleRate: 1,
        allowBuffering: !1,
      }
    )
    ;((this.session = t),
      (this.recordingMode = 'session'),
      this._initializeRecording())
  }
  startBuffering() {
    if (this._isEnabled) {
      C && x.log('Buffering is in progress, call `flush()` to save the replay')
      return
    }
    C && x.infoTick('Starting replay in buffer mode')
    const t = Vr(
      {
        sessionIdleExpire: this.timeouts.sessionIdleExpire,
        maxReplayDuration: this._options.maxReplayDuration,
      },
      {
        stickySession: this._options.stickySession,
        sessionSampleRate: 0,
        allowBuffering: !0,
      }
    )
    ;((this.session = t),
      (this.recordingMode = 'buffer'),
      this._initializeRecording())
  }
  startRecording() {
    try {
      const t = this._canvas
      this._stopRecording = We({
        ...this._recordingOptions,
        ...(this.recordingMode === 'buffer'
          ? { checkoutEveryNms: zm }
          : this._options._experiments.continuousCheckout && {
              checkoutEveryNms: Math.max(
                36e4,
                this._options._experiments.continuousCheckout
              ),
            }),
        emit: tS(this),
        ...eS(),
        onMutation: this._onMutationHandler.bind(this),
        ...(t
          ? {
              recordCanvas: t.recordCanvas,
              getCanvasManager: t.getCanvasManager,
              sampling: t.sampling,
              dataURLOptions: t.dataURLOptions,
            }
          : {}),
      })
    } catch (t) {
      this.handleException(t)
    }
  }
  stopRecording() {
    try {
      return (
        this._stopRecording &&
          (this._stopRecording(), (this._stopRecording = void 0)),
        !0
      )
    } catch (t) {
      return (this.handleException(t), !1)
    }
  }
  async stop({ forceFlush: t = !1, reason: n } = {}) {
    if (this._isEnabled) {
      ;((this._isEnabled = !1), (this.recordingMode = 'buffer'))
      try {
        ;(C && x.log(`Stopping Replay${n ? ` triggered by ${n}` : ''}`),
          cu(),
          this._removeListeners(),
          this.stopRecording(),
          this._debouncedFlush.cancel(),
          t && (await this._flush({ force: !0 })),
          this.eventBuffer?.destroy(),
          (this.eventBuffer = null),
          Z_(this))
      } catch (r) {
        this.handleException(r)
      }
    }
  }
  pause() {
    this._isPaused ||
      ((this._isPaused = !0),
      this.stopRecording(),
      C && x.log('Pausing replay'))
  }
  resume() {
    !this._isPaused ||
      !this._checkSession() ||
      ((this._isPaused = !1),
      this.startRecording(),
      C && x.log('Resuming replay'))
  }
  async sendBufferedReplayOrFlush({ continueRecording: t = !0 } = {}) {
    if (this.recordingMode === 'session') return this.flushImmediate()
    const n = Date.now()
    ;(C && x.log('Converting buffer to session'), await this.flushImmediate())
    const r = this.stopRecording()
    !t ||
      !r ||
      (this.recordingMode !== 'session' &&
        ((this.recordingMode = 'session'),
        this.session &&
          (this._updateUserActivity(n),
          this._updateSessionActivity(n),
          this._maybeSaveSession()),
        this.startRecording()))
  }
  addUpdate(t) {
    const n = t()
    this.recordingMode === 'buffer' ||
      !this._isEnabled ||
      (n !== !0 && this._debouncedFlush())
  }
  triggerUserActivity() {
    if ((this._updateUserActivity(), !this._stopRecording)) {
      if (!this._checkSession()) return
      this.resume()
      return
    }
    ;(this.checkAndHandleExpiredSession(), this._updateSessionActivity())
  }
  updateUserActivity() {
    ;(this._updateUserActivity(), this._updateSessionActivity())
  }
  conditionalFlush() {
    return this.recordingMode === 'buffer'
      ? Promise.resolve()
      : this.flushImmediate()
  }
  flush() {
    return this._debouncedFlush()
  }
  flushImmediate() {
    return (this._debouncedFlush(), this._debouncedFlush.flush())
  }
  cancelFlush() {
    this._debouncedFlush.cancel()
  }
  getSessionId() {
    return this.session?.id
  }
  checkAndHandleExpiredSession() {
    if (
      this._lastActivity &&
      Ss(this._lastActivity, this.timeouts.sessionIdlePause) &&
      this.session &&
      this.session.sampled === 'session'
    ) {
      this.pause()
      return
    }
    return !!this._checkSession()
  }
  setInitialState() {
    const t = `${Q.location.pathname}${Q.location.hash}${Q.location.search}`,
      n = `${Q.location.origin}${t}`
    ;((this.performanceEntries = []),
      (this.replayPerformanceEntries = []),
      this._clearContext(),
      (this._context.initialUrl = n),
      (this._context.initialTimestamp = Date.now()),
      this._context.urls.push(n))
  }
  throttledAddEvent(t, n) {
    const r = this._throttledAddEvent(t, n)
    if (r === mu) {
      const s = Ne({ category: 'replay.throttled' })
      this.addUpdate(
        () =>
          !fi(this, {
            type: d_,
            timestamp: s.timestamp || 0,
            data: { tag: 'breadcrumb', payload: s, metric: !0 },
          })
      )
    }
    return r
  }
  getCurrentRoute() {
    const t = this.lastActiveSpan || le(),
      n = t && de(t),
      s = ((n && z(n).data) || {})[Me]
    if (!(!n || !s || !['route', 'custom'].includes(s))) return z(n).description
  }
  _initializeRecording() {
    ;(this.setInitialState(),
      this._updateSessionActivity(),
      (this.eventBuffer = K_({
        useCompression: this._options.useCompression,
        workerUrl: this._options.workerUrl,
      })),
      this._removeListeners(),
      this._addListeners(),
      (this._isEnabled = !0),
      (this._isPaused = !1),
      this.startRecording())
  }
  _initializeSessionForSampling(t) {
    const n = this._options.errorSampleRate > 0,
      r = Vr(
        {
          sessionIdleExpire: this.timeouts.sessionIdleExpire,
          maxReplayDuration: this._options.maxReplayDuration,
          previousSessionId: t,
        },
        {
          stickySession: this._options.stickySession,
          sessionSampleRate: this._options.sessionSampleRate,
          allowBuffering: n,
        }
      )
    this.session = r
  }
  _checkSession() {
    if (!this.session) return !1
    const t = this.session
    return su(t, {
      sessionIdleExpire: this.timeouts.sessionIdleExpire,
      maxReplayDuration: this._options.maxReplayDuration,
    })
      ? (this._refreshSession(t), !1)
      : !0
  }
  async _refreshSession(t) {
    this._isEnabled &&
      (await this.stop({ reason: 'refresh session' }),
      this.initializeSampling(t.id))
  }
  _addListeners() {
    try {
      ;(Q.document.addEventListener(
        'visibilitychange',
        this._handleVisibilityChange
      ),
        Q.addEventListener('blur', this._handleWindowBlur),
        Q.addEventListener('focus', this._handleWindowFocus),
        Q.addEventListener('keydown', this._handleKeyboardEvent),
        this.clickDetector && this.clickDetector.addListeners(),
        this._hasInitializedCoreListeners ||
          (Ky(this), (this._hasInitializedCoreListeners = !0)))
    } catch (t) {
      this.handleException(t)
    }
    this._performanceCleanupCallback = z_(this)
  }
  _removeListeners() {
    try {
      ;(Q.document.removeEventListener(
        'visibilitychange',
        this._handleVisibilityChange
      ),
        Q.removeEventListener('blur', this._handleWindowBlur),
        Q.removeEventListener('focus', this._handleWindowFocus),
        Q.removeEventListener('keydown', this._handleKeyboardEvent),
        this.clickDetector && this.clickDetector.removeListeners(),
        this._performanceCleanupCallback && this._performanceCleanupCallback())
    } catch (t) {
      this.handleException(t)
    }
  }
  _doChangeToBackgroundTasks(t) {
    !this.session ||
      ru(this.session, {
        maxReplayDuration: this._options.maxReplayDuration,
        sessionIdleExpire: this.timeouts.sessionIdleExpire,
      }) ||
      (t && this._createCustomBreadcrumb(t), this.conditionalFlush())
  }
  _doChangeToForegroundTasks(t) {
    if (!this.session) return
    if (!this.checkAndHandleExpiredSession()) {
      C && x.log('Document has become active, but session has expired')
      return
    }
    t && this._createCustomBreadcrumb(t)
  }
  _updateUserActivity(t = Date.now()) {
    this._lastActivity = t
  }
  _updateSessionActivity(t = Date.now()) {
    this.session && ((this.session.lastActivity = t), this._maybeSaveSession())
  }
  _createCustomBreadcrumb(t) {
    this.addUpdate(() => {
      this.throttledAddEvent({
        type: D.Custom,
        timestamp: t.timestamp || 0,
        data: { tag: 'breadcrumb', payload: t },
      })
    })
  }
  _addPerformanceEntries() {
    let t = L_(this.performanceEntries).concat(this.replayPerformanceEntries)
    if (
      ((this.performanceEntries = []),
      (this.replayPerformanceEntries = []),
      this._requiresManualStart)
    ) {
      const n = this._context.initialTimestamp / 1e3
      t = t.filter(r => r.start >= n)
    }
    return Promise.all(kr(this, t))
  }
  _clearContext() {
    ;(this._context.errorIds.clear(),
      this._context.traceIds.clear(),
      (this._context.urls = []))
  }
  _updateInitialTimestampFromEventBuffer() {
    const { session: t, eventBuffer: n } = this
    if (!t || !n || this._requiresManualStart || t.segmentId) return
    const r = n.getEarliestTimestamp()
    r &&
      r < this._context.initialTimestamp &&
      (this._context.initialTimestamp = r)
  }
  _popEventContext() {
    const t = {
      initialTimestamp: this._context.initialTimestamp,
      initialUrl: this._context.initialUrl,
      errorIds: Array.from(this._context.errorIds),
      traceIds: Array.from(this._context.traceIds),
      urls: this._context.urls,
    }
    return (this._clearContext(), t)
  }
  async _runFlush() {
    const t = this.getSessionId()
    if (!this.session || !this.eventBuffer || !t) {
      C && x.error('No session or eventBuffer found to flush.')
      return
    }
    if (
      (await this._addPerformanceEntries(),
      !!this.eventBuffer?.hasEvents &&
        (await Jy(this), !!this.eventBuffer && t === this.getSessionId()))
    )
      try {
        this._updateInitialTimestampFromEventBuffer()
        const n = Date.now()
        if (
          n - this._context.initialTimestamp >
          this._options.maxReplayDuration + 3e4
        )
          throw new Error('Session is too long, not sending replay')
        const r = this._popEventContext(),
          s = this.session.segmentId++
        this._maybeSaveSession()
        const i = await this.eventBuffer.finish()
        await hu({
          replayId: t,
          recordingData: i,
          segmentId: s,
          eventContext: r,
          session: this.session,
          timestamp: n,
          onError: o => this.handleException(o),
        })
      } catch (n) {
        ;(this.handleException(n), this.stop({ reason: 'sendReplay' }))
        const r = F()
        if (r) {
          const s = n instanceof hi ? 'ratelimit_backoff' : 'send_error'
          r.recordDroppedEvent(s, 'replay')
        }
      }
  }
  async _flush({ force: t = !1 } = {}) {
    if (!this._isEnabled && !t) return
    if (!this.checkAndHandleExpiredSession()) {
      C && x.error('Attempting to finish replay event after session expired.')
      return
    }
    if (!this.session) return
    const n = this.session.started,
      s = Date.now() - n
    this._debouncedFlush.cancel()
    const i = s < this._options.minReplayDuration,
      o = s > this._options.maxReplayDuration + 5e3
    if (i || o) {
      ;(C &&
        x.log(
          `Session duration (${Math.floor(s / 1e3)}s) is too ${i ? 'short' : 'long'}, not sending replay.`
        ),
        i && this._debouncedFlush())
      return
    }
    const c = this.eventBuffer
    c &&
      this.session.segmentId === 0 &&
      !c.hasCheckout &&
      C &&
      x.log('Flushing initial segment without checkout.')
    const a = !!this._flushLock
    this._flushLock || (this._flushLock = this._runFlush())
    try {
      await this._flushLock
    } catch (u) {
      this.handleException(u)
    } finally {
      ;((this._flushLock = void 0), a && this._debouncedFlush())
    }
  }
  _maybeSaveSession() {
    this.session && this._options.stickySession && li(this.session)
  }
  _onMutationHandler(t) {
    const { ignoreMutations: n } = this._options._experiments
    if (
      n?.length &&
      t.some(c => {
        const a = sS(c.target),
          u = n.join(',')
        return a?.matches(u)
      })
    )
      return !1
    const r = t.length,
      s = this._options.mutationLimit,
      i = this._options.mutationBreadcrumbLimit,
      o = s && r > s
    if (r > i || o) {
      const c = Ne({
        category: 'replay.mutations',
        data: { count: r, limit: o },
      })
      this._createCustomBreadcrumb(c)
    }
    return o
      ? (this.stop({
          reason: 'mutationLimit',
          forceFlush: this.recordingMode === 'session',
        }),
        !1)
      : !0
  }
}
function Xt(e, t) {
  return [...e, ...t].join(',')
}
function fS({ mask: e, unmask: t, block: n, unblock: r, ignore: s }) {
  const i = ['base', 'iframe[srcdoc]:not([src])'],
    o = Xt(e, ['.sentry-mask', '[data-sentry-mask]']),
    c = Xt(t, [])
  return {
    maskTextSelector: o,
    unmaskTextSelector: c,
    blockSelector: Xt(n, ['.sentry-block', '[data-sentry-block]', ...i]),
    unblockSelector: Xt(r, []),
    ignoreSelector: Xt(s, [
      '.sentry-ignore',
      '[data-sentry-ignore]',
      'input[type="file"]',
    ]),
  }
}
function pS({
  el: e,
  key: t,
  maskAttributes: n,
  maskAllText: r,
  privacyOptions: s,
  value: i,
}) {
  return !r || (s.unmaskTextSelector && e.matches(s.unmaskTextSelector))
    ? i
    : n.includes(t) ||
        (t === 'value' &&
          e.tagName === 'INPUT' &&
          ['submit', 'button'].includes(e.getAttribute('type') || ''))
      ? i.replace(/[\S]/g, '*')
      : i
}
const $o =
    'img,image,svg,video,object,picture,embed,map,audio,link[rel="icon"],link[rel="apple-touch-icon"]',
  hS = ['content-length', 'content-type', 'accept']
let Uo = !1
const mS = e => new gS(e)
class gS {
  constructor({
    flushMinDelay: t = Hm,
    flushMaxDelay: n = Wm,
    minReplayDuration: r = Ym,
    maxReplayDuration: s = yo,
    stickySession: i = !0,
    useCompression: o = !0,
    workerUrl: c,
    _experiments: a = {},
    maskAllText: u = !0,
    maskAllInputs: l = !0,
    blockAllMedia: d = !0,
    mutationBreadcrumbLimit: p = 750,
    mutationLimit: f = 1e4,
    slowClickTimeout: h = 7e3,
    slowClickIgnoreSelectors: m = [],
    networkDetailAllowUrls: g = [],
    networkDetailDenyUrls: E = [],
    networkCaptureBodies: R = !0,
    networkRequestHeaders: P = [],
    networkResponseHeaders: N = [],
    mask: M = [],
    maskAttributes: T = ['title', 'placeholder', 'aria-label'],
    unmask: y = [],
    block: I = [],
    unblock: S = [],
    ignore: w = [],
    maskFn: L,
    beforeAddRecordingEvent: B,
    beforeErrorSampling: U,
    onError: Z,
  } = {}) {
    this.name = 'Replay'
    const te = fS({ mask: M, unmask: y, block: I, unblock: S, ignore: w })
    if (
      ((this._recordingOptions = {
        maskAllInputs: l,
        maskAllText: u,
        maskInputOptions: { password: !0 },
        maskTextFn: L,
        maskInputFn: L,
        maskAttributeFn: (K, b, q) =>
          pS({
            maskAttributes: T,
            maskAllText: u,
            privacyOptions: te,
            key: K,
            value: b,
            el: q,
          }),
        ...te,
        slimDOMOptions: 'all',
        inlineStylesheet: !0,
        inlineImages: !1,
        collectFonts: !0,
        errorHandler: K => {
          try {
            K.__rrweb__ = !0
          } catch {}
        },
        recordCrossOriginIframes: !!a.recordCrossOriginIframes,
      }),
      (this._initialOptions = {
        flushMinDelay: t,
        flushMaxDelay: n,
        minReplayDuration: Math.min(r, Xm),
        maxReplayDuration: Math.min(s, yo),
        stickySession: i,
        useCompression: o,
        workerUrl: c,
        blockAllMedia: d,
        maskAllInputs: l,
        maskAllText: u,
        mutationBreadcrumbLimit: p,
        mutationLimit: f,
        slowClickTimeout: h,
        slowClickIgnoreSelectors: m,
        networkDetailAllowUrls: g,
        networkDetailDenyUrls: E,
        networkCaptureBodies: R,
        networkRequestHeaders: Ho(P),
        networkResponseHeaders: Ho(N),
        beforeAddRecordingEvent: B,
        beforeErrorSampling: U,
        onError: Z,
        _experiments: a,
      }),
      this._initialOptions.blockAllMedia &&
        (this._recordingOptions.blockSelector = this._recordingOptions
          .blockSelector
          ? `${this._recordingOptions.blockSelector},${$o}`
          : $o),
      this._isInitialized && uo())
    )
      throw new Error(
        'Multiple Sentry Session Replay instances are not supported'
      )
    this._isInitialized = !0
  }
  get _isInitialized() {
    return Uo
  }
  set _isInitialized(t) {
    Uo = t
  }
  afterAllSetup(t) {
    !uo() || this._replay || (this._setup(t), this._initialize(t))
  }
  start() {
    this._replay && this._replay.start()
  }
  startBuffering() {
    this._replay && this._replay.startBuffering()
  }
  stop() {
    return this._replay
      ? this._replay.stop({
          forceFlush: this._replay.recordingMode === 'session',
        })
      : Promise.resolve()
  }
  flush(t) {
    return this._replay
      ? this._replay.isEnabled()
        ? this._replay.sendBufferedReplayOrFlush(t)
        : (this._replay.start(), Promise.resolve())
      : Promise.resolve()
  }
  getReplayId() {
    if (this._replay?.isEnabled()) return this._replay.getSessionId()
  }
  getRecordingMode() {
    if (this._replay?.isEnabled()) return this._replay.recordingMode
  }
  _initialize(t) {
    this._replay &&
      (this._maybeLoadFromReplayCanvasIntegration(t),
      this._replay.initializeSampling())
  }
  _setup(t) {
    const n = _S(this._initialOptions, t)
    this._replay = new lS({
      options: n,
      recordingOptions: this._recordingOptions,
    })
  }
  _maybeLoadFromReplayCanvasIntegration(t) {
    try {
      const n = t.getIntegrationByName('ReplayCanvas')
      if (!n) return
      this._replay._canvas = n.getOptions()
    } catch {}
  }
}
function _S(e, t) {
  const n = t.getOptions(),
    r = { sessionSampleRate: 0, errorSampleRate: 0, ...e },
    s = pt(n.replaysSessionSampleRate),
    i = pt(n.replaysOnErrorSampleRate)
  return (
    s == null &&
      i == null &&
      Ze(() => {
        console.warn(
          'Replay is disabled because neither `replaysSessionSampleRate` nor `replaysOnErrorSampleRate` are set.'
        )
      }),
    s != null && (r.sessionSampleRate = s),
    i != null && (r.errorSampleRate = i),
    r
  )
}
function Ho(e) {
  return [...hS, ...e.map(t => t.toLowerCase())]
}
const Wo = new WeakMap(),
  Yr = new Map(),
  gu = {
    traceFetch: !0,
    traceXHR: !0,
    enableHTTPTimings: !0,
    trackFetchStreamPerformance: !1,
  }
function yS(e, t) {
  const {
      traceFetch: n,
      traceXHR: r,
      trackFetchStreamPerformance: s,
      shouldCreateSpanForRequest: i,
      enableHTTPTimings: o,
      tracePropagationTargets: c,
      onRequestSpanStart: a,
    } = { ...gu, ...t },
    u = typeof i == 'function' ? i : f => !0,
    l = f => ES(f, c),
    d = {},
    p = e.getOptions().propagateTraceparent
  ;(n &&
    (e.addEventProcessor(
      f => (
        f.type === 'transaction' &&
          f.spans &&
          f.spans.forEach(h => {
            if (h.op === 'http.client') {
              const m = Yr.get(h.span_id)
              m && ((h.timestamp = m / 1e3), Yr.delete(h.span_id))
            }
          }),
        f
      )
    ),
    s &&
      Zf(f => {
        if (f.response) {
          const h = Wo.get(f.response)
          h && f.endTimestamp && Yr.set(h, f.endTimestamp)
        }
      }),
    nc(f => {
      const h = Bf(f, u, l, d, { propagateTraceparent: p })
      if (
        (f.response &&
          f.fetchData.__span &&
          Wo.set(f.response, f.fetchData.__span),
        h)
      ) {
        const m = _u(f.fetchData.url),
          g = m ? lt(m).host : void 0
        ;(h.setAttributes({ 'http.url': m, 'server.address': g }),
          o && zo(h),
          a?.(h, { headers: f.headers }))
      }
    })),
    r &&
      vc(f => {
        const h = bS(f, u, l, d, p)
        if (h) {
          o && zo(h)
          let m
          try {
            m = new Headers(f.xhr.__sentry_xhr_v3__?.request_headers)
          } catch {}
          a?.(h, { headers: m })
        }
      }))
}
function SS(e) {
  return (
    e.entryType === 'resource' &&
    'initiatorType' in e &&
    typeof e.nextHopProtocol == 'string' &&
    (e.initiatorType === 'fetch' || e.initiatorType === 'xmlhttprequest')
  )
}
function zo(e) {
  const { url: t } = z(e).data
  if (!t || typeof t != 'string') return
  const n = ht('resource', ({ entries: r }) => {
    r.forEach(s => {
      SS(s) && s.name.endsWith(t) && (e.setAttributes(Sc(s)), setTimeout(n))
    })
  })
}
function ES(e, t) {
  const n = Ut()
  if (n) {
    let r, s
    try {
      ;((r = new URL(e, n)), (s = new URL(n).origin))
    } catch {
      return !1
    }
    const i = r.origin === s
    return t ? Ue(r.toString(), t) || (i && Ue(r.pathname, t)) : i
  } else {
    const r = !!e.match(/^\/(?!\/)/)
    return t ? Ue(e, t) : r
  }
}
function bS(e, t, n, r, s) {
  const i = e.xhr,
    o = i?.[ot]
  if (!i || i.__sentry_own_request__ || !o) return
  const { url: c, method: a } = o,
    u = Ae() && t(c)
  if (e.endTimestamp && u) {
    const g = i.__sentry_xhr_span_id__
    if (!g) return
    const E = r[g]
    E &&
      o.status_code !== void 0 &&
      (fa(E, o.status_code), E.end(), delete r[g])
    return
  }
  const l = _u(c),
    d = lt(l || c),
    p = af(c),
    f = !!le(),
    h =
      u && f
        ? zt({
            name: `${a} ${p}`,
            attributes: {
              url: c,
              type: 'xhr',
              'http.method': a,
              'http.url': l,
              'server.address': d?.host,
              [oe]: 'auto.http.browser',
              [Ge]: 'http.client',
              ...(d?.search && { 'http.query': d?.search }),
              ...(d?.hash && { 'http.fragment': d?.hash }),
            },
          })
        : new Ke()
  ;((i.__sentry_xhr_span_id__ = h.spanContext().spanId),
    (r[i.__sentry_xhr_span_id__] = h),
    n(c) && vS(i, Ae() && f ? h : void 0, s))
  const m = F()
  return (m && m.emit('beforeOutgoingRequestSpan', h, e), h)
}
function vS(e, t, n) {
  const {
    'sentry-trace': r,
    baggage: s,
    traceparent: i,
  } = Ka({ span: t, propagateTraceparent: n })
  r && TS(e, r, s, i)
}
function TS(e, t, n, r) {
  const s = e.__sentry_xhr_v3__?.request_headers
  if (!(s?.['sentry-trace'] || !e.setRequestHeader))
    try {
      if (
        (e.setRequestHeader('sentry-trace', t),
        r && !s?.traceparent && e.setRequestHeader('traceparent', r),
        n)
      ) {
        const i = s?.baggage
        ;(!i || !IS(i)) && e.setRequestHeader('baggage', n)
      }
    } catch {}
}
function IS(e) {
  return e.split(',').some(t => t.trim().startsWith('sentry-'))
}
function _u(e) {
  try {
    return new URL(e, j.location.origin).href
  } catch {
    return
  }
}
function wS() {
  j.document
    ? j.document.addEventListener('visibilitychange', () => {
        const e = le()
        if (!e) return
        const t = de(e)
        if (j.document.hidden && t) {
          const n = 'cancelled',
            { op: r, status: s } = z(t)
          ;(ke &&
            _.log(
              `[Tracing] Transaction: ${n} -> since tab moved to the background, op: ${r}`
            ),
            s || t.setStatus({ code: ae, message: n }),
            t.setAttribute('sentry.cancellation_reason', 'document.hidden'),
            t.end())
        }
      })
    : ke &&
      _.warn(
        '[Tracing] Could not set up background tab detection due to lack of global document'
      )
}
const kS = 3600,
  yu = 'sentry_previous_trace',
  RS = 'sentry.previous_trace'
function CS(e, { linkPreviousTrace: t, consistentTraceSampling: n }) {
  const r = t === 'session-storage'
  let s = r ? AS() : void 0
  e.on('spanStart', o => {
    if (de(o) !== o) return
    const c = X().getPropagationContext()
    ;((s = xS(s, o, c)), r && MS(s))
  })
  let i = !0
  n &&
    e.on('beforeSampling', o => {
      if (!s) return
      const c = X(),
        a = c.getPropagationContext()
      if (i && a.parentSpanId) {
        i = !1
        return
      }
      ;(c.setPropagationContext({
        ...a,
        dsc: {
          ...a.dsc,
          sample_rate: String(s.sampleRate),
          sampled: String(vs(s.spanContext)),
        },
        sampleRand: s.sampleRand,
      }),
        (o.parentSampled = vs(s.spanContext)),
        (o.parentSampleRate = s.sampleRate),
        (o.spanAttributes = { ...o.spanAttributes, [da]: s.sampleRate }))
    })
}
function xS(e, t, n) {
  const r = z(t)
  function s() {
    try {
      return Number(n.dsc?.sample_rate) ?? Number(r.data?.[Cs])
    } catch {
      return 0
    }
  }
  const i = {
    spanContext: t.spanContext(),
    startTimestamp: r.start_timestamp,
    sampleRate: s(),
    sampleRand: n.sampleRand,
  }
  if (!e) return i
  const o = e.spanContext
  return o.traceId === r.trace_id
    ? e
    : (Date.now() / 1e3 - e.startTimestamp <= kS &&
        (ke &&
          _.log(
            `Adding previous_trace ${o} link to span ${{ op: r.op, ...t.spanContext() }}`
          ),
        t.addLink({ context: o, attributes: { [ed]: 'previous_trace' } }),
        t.setAttribute(RS, `${o.traceId}-${o.spanId}-${vs(o) ? 1 : 0}`)),
      i)
}
function MS(e) {
  try {
    j.sessionStorage.setItem(yu, JSON.stringify(e))
  } catch (t) {
    ke && _.warn('Could not store previous trace in sessionStorage', t)
  }
}
function AS() {
  try {
    const e = j.sessionStorage?.getItem(yu)
    return JSON.parse(e)
  } catch {
    return
  }
}
function vs(e) {
  return e.traceFlags === 1
}
const OS = 'BrowserTracing',
  NS = {
    ...jn,
    instrumentNavigation: !0,
    instrumentPageLoad: !0,
    markBackgroundSpan: !0,
    enableLongTask: !0,
    enableLongAnimationFrame: !0,
    enableInp: !0,
    enableElementTiming: !0,
    ignoreResourceSpans: [],
    ignorePerformanceApiSpans: [],
    detectRedirects: !0,
    linkPreviousTrace: 'in-memory',
    consistentTraceSampling: !1,
    enableReportPageLoaded: !1,
    _experiments: {},
    ...gu,
  },
  LS = (e = {}) => {
    const t = { name: void 0, source: void 0 },
      n = j.document,
      {
        enableInp: r,
        enableElementTiming: s,
        enableLongTask: i,
        enableLongAnimationFrame: o,
        _experiments: {
          enableInteractions: c,
          enableStandaloneClsSpans: a,
          enableStandaloneLcpSpans: u,
        },
        beforeStartSpan: l,
        idleTimeout: d,
        finalTimeout: p,
        childSpanTimeout: f,
        markBackgroundSpan: h,
        traceFetch: m,
        traceXHR: g,
        trackFetchStreamPerformance: E,
        shouldCreateSpanForRequest: R,
        enableHTTPTimings: P,
        ignoreResourceSpans: N,
        ignorePerformanceApiSpans: M,
        instrumentPageLoad: T,
        instrumentNavigation: y,
        detectRedirects: I,
        linkPreviousTrace: S,
        consistentTraceSampling: w,
        enableReportPageLoaded: L,
        onRequestSpanStart: B,
      } = { ...NS, ...e }
    let U, Z, te
    function K(b, q, k = !0) {
      const G = q.op === 'pageload',
        ne = q.name,
        ee = l ? l(q) : q,
        be = ee.attributes || {}
      if ((ne !== ee.name && ((be[Me] = 'custom'), (ee.attributes = be)), !k)) {
        const Pe = gt()
        zt({ ...ee, startTime: Pe }).end(Pe)
        return
      }
      ;((t.name = ee.name), (t.source = be[Me]))
      const fe = Na(ee, {
        idleTimeout: d,
        finalTimeout: p,
        childSpanTimeout: f,
        disableAutoFinish: G,
        beforeSpanEnd: Pe => {
          ;(U?.(),
            dh(Pe, {
              recordClsOnPageloadSpan: !a,
              recordLcpOnPageloadSpan: !u,
              ignoreResourceSpans: N,
              ignorePerformanceApiSpans: M,
            }),
            qo(b, void 0))
          const St = X(),
            Gt = St.getPropagationContext()
          ;(St.setPropagationContext({
            ...Gt,
            traceId: fe.spanContext().traceId,
            sampled: nt(fe),
            dsc: De(Pe),
          }),
            G && (te = void 0))
        },
        trimIdleSpanEndTimestamp: !L,
      })
      ;(G && L && (te = fe), qo(b, fe))
      function yt() {
        n &&
          ['interactive', 'complete'].includes(n.readyState) &&
          b.emit('idleSpanEnableAutoFinish', fe)
      }
      G &&
        !L &&
        n &&
        (n.addEventListener('readystatechange', () => {
          yt()
        }),
        yt())
    }
    return {
      name: OS,
      setup(b) {
        if (
          (Cd(),
          (U = rh({
            recordClsStandaloneSpans: a || !1,
            recordLcpStandaloneSpans: u || !1,
            client: b,
          })),
          r && Lh(),
          s && bh(),
          o &&
          $.PerformanceObserver &&
          PerformanceObserver.supportedEntryTypes &&
          PerformanceObserver.supportedEntryTypes.includes(
            'long-animation-frame'
          )
            ? ih()
            : i && sh(),
          c && oh(),
          I && n)
        ) {
          const k = () => {
            Z = ce()
          }
          ;(addEventListener('click', k, { capture: !0 }),
            addEventListener('keydown', k, { capture: !0, passive: !0 }))
        }
        function q() {
          const k = dn(b)
          k &&
            !z(k).timestamp &&
            (ke &&
              _.log(
                `[Tracing] Finishing current active span with op: ${z(k).op}`
              ),
            k.setAttribute(rn, 'cancelled'),
            k.end())
        }
        ;(b.on('startNavigationSpan', (k, G) => {
          if (F() !== b) return
          if (G?.isRedirect) {
            ;(ke &&
              _.warn(
                '[Tracing] Detected redirect, navigation span will not be the root span, but a child span.'
              ),
              K(b, { op: 'navigation.redirect', ...k }, !1))
            return
          }
          ;((Z = void 0),
            q(),
            Oe().setPropagationContext({
              traceId: qe(),
              sampleRand: Math.random(),
              propagationSpanId: Ae() ? void 0 : He(),
            }))
          const ne = X()
          ;(ne.setPropagationContext({
            traceId: qe(),
            sampleRand: Math.random(),
            propagationSpanId: Ae() ? void 0 : He(),
          }),
            ne.setSDKProcessingMetadata({ normalizedRequest: void 0 }),
            K(b, {
              op: 'navigation',
              ...k,
              parentSpan: null,
              forceTransaction: !0,
            }))
        }),
          b.on('startPageLoadSpan', (k, G = {}) => {
            if (F() !== b) return
            q()
            const ne = G.sentryTrace || jo('sentry-trace'),
              ee = G.baggage || jo('baggage'),
              be = Ed(ne, ee),
              fe = X()
            ;(fe.setPropagationContext(be),
              Ae() || (fe.getPropagationContext().propagationSpanId = He()),
              fe.setSDKProcessingMetadata({ normalizedRequest: Hs() }),
              K(b, { op: 'pageload', ...k }))
          }),
          b.on('endPageloadSpan', () => {
            L && te && (te.setAttribute(rn, 'reportPageLoaded'), te.end())
          }))
      },
      afterAllSetup(b) {
        let q = Ut()
        if (
          (S !== 'off' &&
            CS(b, { linkPreviousTrace: S, consistentTraceSampling: w }),
          j.location)
        ) {
          if (T) {
            const k = _e()
            DS(b, {
              name: j.location.pathname,
              startTime: k ? k / 1e3 : void 0,
              attributes: { [Me]: 'url', [oe]: 'auto.pageload.browser' },
            })
          }
          y &&
            vr(({ to: k, from: G }) => {
              if (G === void 0 && q?.indexOf(k) !== -1) {
                q = void 0
                return
              }
              q = void 0
              const ne = Us(k),
                ee = dn(b),
                be = ee && I && BS(ee, Z)
              PS(
                b,
                {
                  name: ne?.pathname || j.location.pathname,
                  attributes: { [Me]: 'url', [oe]: 'auto.navigation.browser' },
                },
                { url: k, isRedirect: be }
              )
            })
        }
        ;(h && wS(),
          c && FS(b, d, p, f, t),
          r && Fh(),
          yS(b, {
            traceFetch: m,
            traceXHR: g,
            trackFetchStreamPerformance: E,
            tracePropagationTargets: b.getOptions().tracePropagationTargets,
            shouldCreateSpanForRequest: R,
            enableHTTPTimings: P,
            onRequestSpanStart: B,
          }))
      },
    }
  }
function DS(e, t, n) {
  ;(e.emit('startPageLoadSpan', t, n), X().setTransactionName(t.name))
  const r = dn(e)
  return (r && e.emit('afterStartPageLoadSpan', r), r)
}
function PS(e, t, n) {
  const { url: r, isRedirect: s } = n || {}
  ;(e.emit('beforeStartNavigationSpan', t, { isRedirect: s }),
    e.emit('startNavigationSpan', t, { isRedirect: s }))
  const i = X()
  return (
    i.setTransactionName(t.name),
    r &&
      !s &&
      i.setSDKProcessingMetadata({ normalizedRequest: { ...Hs(), url: r } }),
    dn(e)
  )
}
function jo(e) {
  return (
    j.document?.querySelector(`meta[name=${e}]`)?.getAttribute('content') ||
    void 0
  )
}
function FS(e, t, n, r, s) {
  const i = j.document
  let o
  const c = () => {
    const a = 'ui.action.click',
      u = dn(e)
    if (u) {
      const l = z(u).op
      if (['navigation', 'pageload'].includes(l)) {
        ke &&
          _.warn(
            `[Tracing] Did not create ${a} span because a pageload or navigation span is in progress.`
          )
        return
      }
    }
    if (
      (o &&
        (o.setAttribute(rn, 'interactionInterrupted'), o.end(), (o = void 0)),
      !s.name)
    ) {
      ke &&
        _.warn(
          `[Tracing] Did not create ${a} transaction because _latestRouteName is missing.`
        )
      return
    }
    o = Na(
      { name: s.name, op: a, attributes: { [Me]: s.source || 'url' } },
      { idleTimeout: t, finalTimeout: n, childSpanTimeout: r }
    )
  }
  i && addEventListener('click', c, { capture: !0 })
}
const Su = '_sentry_idleSpan'
function dn(e) {
  return e[Su]
}
function qo(e, t) {
  Ee(e, Su, t)
}
const Go = 1.5
function BS(e, t) {
  const n = z(e),
    r = gt(),
    s = n.start_timestamp
  return !(r - s > Go || (t && r - t <= Go))
}
function $S(e) {
  const t = { ...e }
  return (Xa(t, 'react'), Fa('react', { version: vu.version }), Fm(t))
}
const HS = () => {
  ;($S({
    dsn: 'https://your_sentry_dsn@sentry.io/project_id',
    environment: 'production',
    sendDefaultPii: !0,
    integrations: [
      LS(),
      mS({ maskAllText: !1, blockAllMedia: !1 }),
      Xf({ levels: ['log', 'warn', 'error'] }),
    ],
    tracesSampleRate: 0.1,
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/.*\.supabase\.co\/.*$/,
      /^https:\/\/.*\.clerk\.accounts\.dev\/.*$/,
      /^https:\/\/.*\.vercel\.app\/.*$/,
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    enableLogs: !0,
    beforeSend(e, t) {
      return e
    },
  }),
    console.log('✅ Sentry initialized for production environment'))
}
export { HS as initSentry }
