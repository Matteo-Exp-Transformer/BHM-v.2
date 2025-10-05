import { r as f, a as v } from './react-vendor-Cttizgra.js'
function he(e) {
  var t,
    a,
    n = ''
  if (typeof e == 'string' || typeof e == 'number') n += e
  else if (typeof e == 'object')
    if (Array.isArray(e)) {
      var r = e.length
      for (t = 0; t < r; t++)
        e[t] && (a = he(e[t])) && (n && (n += ' '), (n += a))
    } else for (a in e) e[a] && (n && (n += ' '), (n += a))
  return n
}
function D() {
  for (var e, t, a = 0, n = '', r = arguments.length; a < r; a++)
    (e = arguments[a]) && (t = he(e)) && (n && (n += ' '), (n += t))
  return n
}
const G = e => typeof e == 'number' && !isNaN(e),
  U = e => typeof e == 'string',
  L = e => typeof e == 'function',
  oe = e => (U(e) || L(e) ? e : null),
  ie = e => f.isValidElement(e) || U(e) || L(e) || G(e)
function _e(e, t, a) {
  a === void 0 && (a = 300)
  const { scrollHeight: n, style: r } = e
  requestAnimationFrame(() => {
    ;((r.minHeight = 'initial'),
      (r.height = n + 'px'),
      (r.transition = `all ${a}ms`),
      requestAnimationFrame(() => {
        ;((r.height = '0'),
          (r.padding = '0'),
          (r.margin = '0'),
          setTimeout(t, a))
      }))
  })
}
function se(e) {
  let {
    enter: t,
    exit: a,
    appendPosition: n = !1,
    collapse: r = !0,
    collapseDuration: i = 300,
  } = e
  return function (s) {
    let {
      children: k,
      position: h,
      preventExitTransition: x,
      done: p,
      nodeRef: $,
      isIn: N,
      playToast: C,
    } = s
    const m = n ? `${t}--${h}` : t,
      y = n ? `${a}--${h}` : a,
      b = f.useRef(0)
    return (
      f.useLayoutEffect(() => {
        const u = $.current,
          d = m.split(' '),
          c = g => {
            g.target === $.current &&
              (C(),
              u.removeEventListener('animationend', c),
              u.removeEventListener('animationcancel', c),
              b.current === 0 &&
                g.type !== 'animationcancel' &&
                u.classList.remove(...d))
          }
        ;(u.classList.add(...d),
          u.addEventListener('animationend', c),
          u.addEventListener('animationcancel', c))
      }, []),
      f.useEffect(() => {
        const u = $.current,
          d = () => {
            ;(u.removeEventListener('animationend', d), r ? _e(u, p, i) : p())
          }
        N ||
          (x
            ? d()
            : ((b.current = 1),
              (u.className += ` ${y}`),
              u.addEventListener('animationend', d)))
      }, [N]),
      v.createElement(v.Fragment, null, k)
    )
  }
}
function de(e, t) {
  return e != null
    ? {
        content: e.content,
        containerId: e.props.containerId,
        id: e.props.toastId,
        theme: e.props.theme,
        type: e.props.type,
        data: e.props.data || {},
        isLoading: e.props.isLoading,
        icon: e.props.icon,
        status: t,
      }
    : {}
}
const T = new Map()
let J = []
const le = new Set(),
  Me = e => le.forEach(t => t(e)),
  ue = () => T.size > 0
function fe(e, t) {
  var a
  if (t) return !((a = T.get(t)) == null || !a.isToastActive(e))
  let n = !1
  return (
    T.forEach(r => {
      r.isToastActive(e) && (n = !0)
    }),
    n
  )
}
function ke(e, t) {
  ie(e) &&
    (ue() || J.push({ content: e, options: t }),
    T.forEach(a => {
      a.buildToast(e, t)
    }))
}
function pe(e, t) {
  T.forEach(a => {
    t != null && t != null && t.containerId
      ? t?.containerId === a.id && a.toggle(e, t?.id)
      : a.toggle(e, t?.id)
  })
}
function be(e) {
  const {
    subscribe: t,
    getSnapshot: a,
    setProps: n,
  } = f.useRef(
    (function (i) {
      const s = i.containerId || 1
      return {
        subscribe(k) {
          const h = (function (p, $, N) {
            let C = 1,
              m = 0,
              y = [],
              b = [],
              u = [],
              d = $
            const c = new Map(),
              g = new Set(),
              A = () => {
                ;((u = Array.from(c.values())), g.forEach(l => l()))
              },
              q = l => {
                ;((b = l == null ? [] : b.filter(_ => _ !== l)), A())
              },
              E = l => {
                const {
                    toastId: _,
                    onOpen: w,
                    updateId: S,
                    children: j,
                  } = l.props,
                  X = S == null
                ;(l.staleId && c.delete(l.staleId),
                  c.set(_, l),
                  (b = [...b, l.props.toastId].filter(B => B !== l.staleId)),
                  A(),
                  N(de(l, X ? 'added' : 'updated')),
                  X && L(w) && w(f.isValidElement(j) && j.props))
              }
            return {
              id: p,
              props: d,
              observe: l => (g.add(l), () => g.delete(l)),
              toggle: (l, _) => {
                c.forEach(w => {
                  ;(_ != null && _ !== w.props.toastId) ||
                    (L(w.toggle) && w.toggle(l))
                })
              },
              removeToast: q,
              toasts: c,
              clearQueue: () => {
                ;((m -= y.length), (y = []))
              },
              buildToast: (l, _) => {
                if (
                  (H => {
                    let { containerId: I, toastId: z, updateId: P } = H
                    const F = I ? I !== p : p !== 1,
                      Q = c.has(z) && P == null
                    return F || Q
                  })(_)
                )
                  return
                const {
                    toastId: w,
                    updateId: S,
                    data: j,
                    staleId: X,
                    delay: B,
                  } = _,
                  Z = () => {
                    q(w)
                  },
                  ee = S == null
                ee && m++
                const V = {
                  ...d,
                  style: d.toastStyle,
                  key: C++,
                  ...Object.fromEntries(
                    Object.entries(_).filter(H => {
                      let [I, z] = H
                      return z != null
                    })
                  ),
                  toastId: w,
                  updateId: S,
                  data: j,
                  closeToast: Z,
                  isIn: !1,
                  className: oe(_.className || d.toastClassName),
                  bodyClassName: oe(_.bodyClassName || d.bodyClassName),
                  progressClassName: oe(
                    _.progressClassName || d.progressClassName
                  ),
                  autoClose:
                    !_.isLoading &&
                    ((R = _.autoClose),
                    (W = d.autoClose),
                    R === !1 || (G(R) && R > 0) ? R : W),
                  deleteToast() {
                    const H = c.get(w),
                      { onClose: I, children: z } = H.props
                    ;(L(I) && I(f.isValidElement(z) && z.props),
                      N(de(H, 'removed')),
                      c.delete(w),
                      m--,
                      m < 0 && (m = 0),
                      y.length > 0 ? E(y.shift()) : A())
                  },
                }
                var R, W
                ;((V.closeButton = d.closeButton),
                  _.closeButton === !1 || ie(_.closeButton)
                    ? (V.closeButton = _.closeButton)
                    : _.closeButton === !0 &&
                      (V.closeButton = !ie(d.closeButton) || d.closeButton))
                let Y = l
                f.isValidElement(l) && !U(l.type)
                  ? (Y = f.cloneElement(l, {
                      closeToast: Z,
                      toastProps: V,
                      data: j,
                    }))
                  : L(l) && (Y = l({ closeToast: Z, toastProps: V, data: j }))
                const O = { content: Y, props: V, staleId: X }
                d.limit && d.limit > 0 && m > d.limit && ee
                  ? y.push(O)
                  : G(B)
                    ? setTimeout(() => {
                        E(O)
                      }, B)
                    : E(O)
              },
              setProps(l) {
                d = l
              },
              setToggle: (l, _) => {
                c.get(l).toggle = _
              },
              isToastActive: l => b.some(_ => _ === l),
              getSnapshot: () => u,
            }
          })(s, i, Me)
          T.set(s, h)
          const x = h.observe(k)
          return (
            J.forEach(p => ke(p.content, p.options)),
            (J = []),
            () => {
              ;(x(), T.delete(s))
            }
          )
        },
        setProps(k) {
          var h
          ;(h = T.get(s)) == null || h.setProps(k)
        },
        getSnapshot() {
          var k
          return (k = T.get(s)) == null ? void 0 : k.getSnapshot()
        },
      }
    })(e)
  ).current
  n(e)
  const r = f.useSyncExternalStore(t, a, a)
  return {
    getToastToRender: function (i) {
      if (!r) return []
      const s = new Map()
      return (
        e.newestOnTop && r.reverse(),
        r.forEach(k => {
          const { position: h } = k.props
          ;(s.has(h) || s.set(h, []), s.get(h).push(k))
        }),
        Array.from(s, k => i(k[0], k[1]))
      )
    },
    isToastActive: fe,
    count: r?.length,
  }
}
function xe(e) {
  const [t, a] = f.useState(!1),
    [n, r] = f.useState(!1),
    i = f.useRef(null),
    s = f.useRef({
      start: 0,
      delta: 0,
      removalDistance: 0,
      canCloseOnClick: !0,
      canDrag: !1,
      didMove: !1,
    }).current,
    {
      autoClose: k,
      pauseOnHover: h,
      closeToast: x,
      onClick: p,
      closeOnClick: $,
    } = e
  var N, C
  function m() {
    a(!0)
  }
  function y() {
    a(!1)
  }
  function b(c) {
    const g = i.current
    s.canDrag &&
      g &&
      ((s.didMove = !0),
      t && y(),
      (s.delta =
        e.draggableDirection === 'x'
          ? c.clientX - s.start
          : c.clientY - s.start),
      s.start !== c.clientX && (s.canCloseOnClick = !1),
      (g.style.transform = `translate3d(${e.draggableDirection === 'x' ? `${s.delta}px, var(--y)` : `0, calc(${s.delta}px + var(--y))`},0)`),
      (g.style.opacity = '' + (1 - Math.abs(s.delta / s.removalDistance))))
  }
  function u() {
    ;(document.removeEventListener('pointermove', b),
      document.removeEventListener('pointerup', u))
    const c = i.current
    if (s.canDrag && s.didMove && c) {
      if (((s.canDrag = !1), Math.abs(s.delta) > s.removalDistance))
        return (r(!0), e.closeToast(), void e.collapseAll())
      ;((c.style.transition = 'transform 0.2s, opacity 0.2s'),
        c.style.removeProperty('transform'),
        c.style.removeProperty('opacity'))
    }
  }
  ;((C = T.get(
    (N = { id: e.toastId, containerId: e.containerId, fn: a }).containerId || 1
  )) == null || C.setToggle(N.id, N.fn),
    f.useEffect(() => {
      if (e.pauseOnFocusLoss)
        return (
          document.hasFocus() || y(),
          window.addEventListener('focus', m),
          window.addEventListener('blur', y),
          () => {
            ;(window.removeEventListener('focus', m),
              window.removeEventListener('blur', y))
          }
        )
    }, [e.pauseOnFocusLoss]))
  const d = {
    onPointerDown: function (c) {
      if (e.draggable === !0 || e.draggable === c.pointerType) {
        ;((s.didMove = !1),
          document.addEventListener('pointermove', b),
          document.addEventListener('pointerup', u))
        const g = i.current
        ;((s.canCloseOnClick = !0),
          (s.canDrag = !0),
          (g.style.transition = 'none'),
          e.draggableDirection === 'x'
            ? ((s.start = c.clientX),
              (s.removalDistance = g.offsetWidth * (e.draggablePercent / 100)))
            : ((s.start = c.clientY),
              (s.removalDistance =
                (g.offsetHeight *
                  (e.draggablePercent === 80
                    ? 1.5 * e.draggablePercent
                    : e.draggablePercent)) /
                100)))
      }
    },
    onPointerUp: function (c) {
      const {
        top: g,
        bottom: A,
        left: q,
        right: E,
      } = i.current.getBoundingClientRect()
      c.nativeEvent.type !== 'touchend' &&
      e.pauseOnHover &&
      c.clientX >= q &&
      c.clientX <= E &&
      c.clientY >= g &&
      c.clientY <= A
        ? y()
        : m()
    },
  }
  return (
    k && h && ((d.onMouseEnter = y), e.stacked || (d.onMouseLeave = m)),
    $ &&
      (d.onClick = c => {
        ;(p && p(c), s.canCloseOnClick && x())
      }),
    {
      playToast: m,
      pauseToast: y,
      isRunning: t,
      preventExitTransition: n,
      toastRef: i,
      eventHandlers: d,
    }
  )
}
function Ne(e) {
  let {
    delay: t,
    isRunning: a,
    closeToast: n,
    type: r = 'default',
    hide: i,
    className: s,
    style: k,
    controlledProgress: h,
    progress: x,
    rtl: p,
    isIn: $,
    theme: N,
  } = e
  const C = i || (h && x === 0),
    m = {
      ...k,
      animationDuration: `${t}ms`,
      animationPlayState: a ? 'running' : 'paused',
    }
  h && (m.transform = `scaleX(${x})`)
  const y = D(
      'Toastify__progress-bar',
      h
        ? 'Toastify__progress-bar--controlled'
        : 'Toastify__progress-bar--animated',
      `Toastify__progress-bar-theme--${N}`,
      `Toastify__progress-bar--${r}`,
      { 'Toastify__progress-bar--rtl': p }
    ),
    b = L(s) ? s({ rtl: p, type: r, defaultClassName: y }) : D(y, s),
    u = {
      [h && x >= 1 ? 'onTransitionEnd' : 'onAnimationEnd']:
        h && x < 1
          ? null
          : () => {
              $ && n()
            },
    }
  return v.createElement(
    'div',
    { className: 'Toastify__progress-bar--wrp', 'data-hidden': C },
    v.createElement('div', {
      className: `Toastify__progress-bar--bg Toastify__progress-bar-theme--${N} Toastify__progress-bar--${r}`,
    }),
    v.createElement('div', {
      role: 'progressbar',
      'aria-hidden': C ? 'true' : 'false',
      'aria-label': 'notification timer',
      className: b,
      style: m,
      ...u,
    })
  )
}
let $e = 1
const me = () => '' + $e++
function Ee(e) {
  return e && (U(e.toastId) || G(e.toastId)) ? e.toastId : me()
}
function K(e, t) {
  return (ke(e, t), t.toastId)
}
function ne(e, t) {
  return { ...t, type: (t && t.type) || e, toastId: Ee(t) }
}
function te(e) {
  return (t, a) => K(t, ne(e, a))
}
function M(e, t) {
  return K(e, ne('default', t))
}
;((M.loading = (e, t) =>
  K(
    e,
    ne('default', {
      isLoading: !0,
      autoClose: !1,
      closeOnClick: !1,
      closeButton: !1,
      draggable: !1,
      ...t,
    })
  )),
  (M.promise = function (e, t, a) {
    let n,
      { pending: r, error: i, success: s } = t
    r && (n = U(r) ? M.loading(r, a) : M.loading(r.render, { ...a, ...r }))
    const k = {
        isLoading: null,
        autoClose: null,
        closeOnClick: null,
        closeButton: null,
        draggable: null,
      },
      h = (p, $, N) => {
        if ($ == null) return void M.dismiss(n)
        const C = { type: p, ...k, ...a, data: N },
          m = U($) ? { render: $ } : $
        return (
          n ? M.update(n, { ...C, ...m }) : M(m.render, { ...C, ...m }),
          N
        )
      },
      x = L(e) ? e() : e
    return (x.then(p => h('success', s, p)).catch(p => h('error', i, p)), x)
  }),
  (M.success = te('success')),
  (M.info = te('info')),
  (M.error = te('error')),
  (M.warning = te('warning')),
  (M.warn = M.warning),
  (M.dark = (e, t) => K(e, ne('default', { theme: 'dark', ...t }))),
  (M.dismiss = function (e) {
    ;(function (t) {
      var a
      if (ue()) {
        if (t == null || U((a = t)) || G(a))
          T.forEach(n => {
            n.removeToast(t)
          })
        else if (t && ('containerId' in t || 'id' in t)) {
          const n = T.get(t.containerId)
          n
            ? n.removeToast(t.id)
            : T.forEach(r => {
                r.removeToast(t.id)
              })
        }
      } else J = J.filter(n => t != null && n.options.toastId !== t)
    })(e)
  }),
  (M.clearWaitingQueue = function (e) {
    ;(e === void 0 && (e = {}),
      T.forEach(t => {
        !t.props.limit ||
          (e.containerId && t.id !== e.containerId) ||
          t.clearQueue()
      }))
  }),
  (M.isActive = fe),
  (M.update = function (e, t) {
    t === void 0 && (t = {})
    const a = ((n, r) => {
      var i
      let { containerId: s } = r
      return (i = T.get(s || 1)) == null ? void 0 : i.toasts.get(n)
    })(e, t)
    if (a) {
      const { props: n, content: r } = a,
        i = { delay: 100, ...n, ...t, toastId: t.toastId || e, updateId: me() }
      i.toastId !== e && (i.staleId = e)
      const s = i.render || r
      ;(delete i.render, K(s, i))
    }
  }),
  (M.done = e => {
    M.update(e, { progress: 1 })
  }),
  (M.onChange = function (e) {
    return (
      le.add(e),
      () => {
        le.delete(e)
      }
    )
  }),
  (M.play = e => pe(!0, e)),
  (M.pause = e => pe(!1, e)))
const Ce = typeof window < 'u' ? f.useLayoutEffect : f.useEffect,
  ae = e => {
    let { theme: t, type: a, isLoading: n, ...r } = e
    return v.createElement('svg', {
      viewBox: '0 0 24 24',
      width: '100%',
      height: '100%',
      fill:
        t === 'colored' ? 'currentColor' : `var(--toastify-icon-color-${a})`,
      ...r,
    })
  },
  ce = {
    info: function (e) {
      return v.createElement(
        ae,
        { ...e },
        v.createElement('path', {
          d: 'M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z',
        })
      )
    },
    warning: function (e) {
      return v.createElement(
        ae,
        { ...e },
        v.createElement('path', {
          d: 'M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.779-1.095h1.91c.528.005.84.476.784 1.1z',
        })
      )
    },
    success: function (e) {
      return v.createElement(
        ae,
        { ...e },
        v.createElement('path', {
          d: 'M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z',
        })
      )
    },
    error: function (e) {
      return v.createElement(
        ae,
        { ...e },
        v.createElement('path', {
          d: 'M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z',
        })
      )
    },
    spinner: function () {
      return v.createElement('div', { className: 'Toastify__spinner' })
    },
  },
  Te = e => {
    const {
        isRunning: t,
        preventExitTransition: a,
        toastRef: n,
        eventHandlers: r,
        playToast: i,
      } = xe(e),
      {
        closeButton: s,
        children: k,
        autoClose: h,
        onClick: x,
        type: p,
        hideProgressBar: $,
        closeToast: N,
        transition: C,
        position: m,
        className: y,
        style: b,
        bodyClassName: u,
        bodyStyle: d,
        progressClassName: c,
        progressStyle: g,
        updateId: A,
        role: q,
        progress: E,
        rtl: l,
        toastId: _,
        deleteToast: w,
        isIn: S,
        isLoading: j,
        closeOnClick: X,
        theme: B,
      } = e,
      Z = D(
        'Toastify__toast',
        `Toastify__toast-theme--${B}`,
        `Toastify__toast--${p}`,
        { 'Toastify__toast--rtl': l },
        { 'Toastify__toast--close-on-click': X }
      ),
      ee = L(y)
        ? y({ rtl: l, position: m, type: p, defaultClassName: Z })
        : D(Z, y),
      V = (function (O) {
        let { theme: H, type: I, isLoading: z, icon: P } = O,
          F = null
        const Q = { theme: H, type: I }
        return (
          P === !1 ||
            (L(P)
              ? (F = P({ ...Q, isLoading: z }))
              : f.isValidElement(P)
                ? (F = f.cloneElement(P, Q))
                : z
                  ? (F = ce.spinner())
                  : (ve => ve in ce)(I) && (F = ce[I](Q))),
          F
        )
      })(e),
      R = !!E || !h,
      W = { closeToast: N, type: p, theme: B }
    let Y = null
    return (
      s === !1 ||
        (Y = L(s)
          ? s(W)
          : f.isValidElement(s)
            ? f.cloneElement(s, W)
            : (function (O) {
                let { closeToast: H, theme: I, ariaLabel: z = 'close' } = O
                return v.createElement(
                  'button',
                  {
                    className: `Toastify__close-button Toastify__close-button--${I}`,
                    type: 'button',
                    onClick: P => {
                      ;(P.stopPropagation(), H(P))
                    },
                    'aria-label': z,
                  },
                  v.createElement(
                    'svg',
                    { 'aria-hidden': 'true', viewBox: '0 0 14 16' },
                    v.createElement('path', {
                      fillRule: 'evenodd',
                      d: 'M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z',
                    })
                  )
                )
              })(W)),
      v.createElement(
        C,
        {
          isIn: S,
          done: w,
          position: m,
          preventExitTransition: a,
          nodeRef: n,
          playToast: i,
        },
        v.createElement(
          'div',
          {
            id: _,
            onClick: x,
            'data-in': S,
            className: ee,
            ...r,
            style: b,
            ref: n,
          },
          v.createElement(
            'div',
            {
              ...(S && { role: q }),
              className: L(u) ? u({ type: p }) : D('Toastify__toast-body', u),
              style: d,
            },
            V != null &&
              v.createElement(
                'div',
                {
                  className: D('Toastify__toast-icon', {
                    'Toastify--animate-icon Toastify__zoom-enter': !j,
                  }),
                },
                V
              ),
            v.createElement('div', null, k)
          ),
          Y,
          v.createElement(Ne, {
            ...(A && !R ? { key: `pb-${A}` } : {}),
            rtl: l,
            theme: B,
            delay: h,
            isRunning: t,
            isIn: S,
            closeToast: N,
            hide: $,
            type: p,
            style: g,
            className: c,
            controlledProgress: R,
            progress: E || 0,
          })
        )
      )
    )
  },
  re = function (e, t) {
    return (
      t === void 0 && (t = !1),
      {
        enter: `Toastify--animate Toastify__${e}-enter`,
        exit: `Toastify--animate Toastify__${e}-exit`,
        appendPosition: t,
      }
    )
  },
  we = se(re('bounce', !0))
se(re('slide', !0))
se(re('zoom'))
se(re('flip'))
const Le = {
  position: 'top-right',
  transition: we,
  autoClose: 5e3,
  closeButton: !0,
  pauseOnHover: !0,
  pauseOnFocusLoss: !0,
  draggable: 'touch',
  draggablePercent: 80,
  draggableDirection: 'x',
  role: 'alert',
  theme: 'light',
}
function Zt(e) {
  let t = { ...Le, ...e }
  const a = e.stacked,
    [n, r] = f.useState(!0),
    i = f.useRef(null),
    { getToastToRender: s, isToastActive: k, count: h } = be(t),
    { className: x, style: p, rtl: $, containerId: N } = t
  function C(y) {
    const b = D(
      'Toastify__toast-container',
      `Toastify__toast-container--${y}`,
      { 'Toastify__toast-container--rtl': $ }
    )
    return L(x) ? x({ position: y, rtl: $, defaultClassName: b }) : D(b, oe(x))
  }
  function m() {
    a && (r(!0), M.play())
  }
  return (
    Ce(() => {
      if (a) {
        var y
        const b = i.current.querySelectorAll('[data-in="true"]'),
          u = 12,
          d = (y = t.position) == null ? void 0 : y.includes('top')
        let c = 0,
          g = 0
        Array.from(b)
          .reverse()
          .forEach((A, q) => {
            const E = A
            ;(E.classList.add('Toastify__toast--stacked'),
              q > 0 && (E.dataset.collapsed = `${n}`),
              E.dataset.pos || (E.dataset.pos = d ? 'top' : 'bot'))
            const l = c * (n ? 0.2 : 1) + (n ? 0 : u * q)
            ;(E.style.setProperty('--y', `${d ? l : -1 * l}px`),
              E.style.setProperty('--g', `${u}`),
              E.style.setProperty('--s', '' + (1 - (n ? g : 0))),
              (c += E.offsetHeight),
              (g += 0.025))
          })
      }
    }, [n, h, a]),
    v.createElement(
      'div',
      {
        ref: i,
        className: 'Toastify',
        id: N,
        onMouseEnter: () => {
          a && (r(!1), M.pause())
        },
        onMouseLeave: m,
      },
      s((y, b) => {
        const u = b.length ? { ...p } : { ...p, pointerEvents: 'none' }
        return v.createElement(
          'div',
          { className: C(y), style: u, key: `container-${y}` },
          b.map(d => {
            let { content: c, props: g } = d
            return v.createElement(
              Te,
              {
                ...g,
                stacked: a,
                collapseAll: m,
                isIn: k(g.toastId, g.containerId),
                style: g.style,
                key: `toast-${g.key}`,
              },
              c
            )
          })
        )
      })
    )
  )
}
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ie = e => e.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
  ze = e =>
    e.replace(/^([A-Z])|[\s-_]+(\w)/g, (t, a, n) =>
      n ? n.toUpperCase() : a.toLowerCase()
    ),
  ye = e => {
    const t = ze(e)
    return t.charAt(0).toUpperCase() + t.slice(1)
  },
  ge = (...e) =>
    e
      .filter((t, a, n) => !!t && t.trim() !== '' && n.indexOf(t) === a)
      .join(' ')
      .trim(),
  Ae = e => {
    for (const t in e)
      if (t.startsWith('aria-') || t === 'role' || t === 'title') return !0
  }
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var He = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Pe = f.forwardRef(
  (
    {
      color: e = 'currentColor',
      size: t = 24,
      strokeWidth: a = 2,
      absoluteStrokeWidth: n,
      className: r = '',
      children: i,
      iconNode: s,
      ...k
    },
    h
  ) =>
    f.createElement(
      'svg',
      {
        ref: h,
        ...He,
        width: t,
        height: t,
        stroke: e,
        strokeWidth: n ? (Number(a) * 24) / Number(t) : a,
        className: ge('lucide', r),
        ...(!i && !Ae(k) && { 'aria-hidden': 'true' }),
        ...k,
      },
      [
        ...s.map(([x, p]) => f.createElement(x, p)),
        ...(Array.isArray(i) ? i : [i]),
      ]
    )
)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const o = (e, t) => {
  const a = f.forwardRef(({ className: n, ...r }, i) =>
    f.createElement(Pe, {
      ref: i,
      iconNode: t,
      className: ge(`lucide-${Ie(ye(e))}`, `lucide-${e}`, n),
      ...r,
    })
  )
  return ((a.displayName = ye(e)), a)
}
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const qe = [
    [
      'path',
      {
        d: 'M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2',
        key: '169zse',
      },
    ],
  ],
  Wt = o('activity', qe)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Se = [
    ['path', { d: 'm12 19-7-7 7-7', key: '1l729n' }],
    ['path', { d: 'M19 12H5', key: 'x3x0zl' }],
  ],
  Yt = o('arrow-left', Se)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ve = [
    ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0', key: 'vwvbt9' }],
    [
      'path',
      {
        d: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326',
        key: '11g9vi',
      },
    ],
  ],
  Qt = o('bell', Ve)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const je = [
    ['path', { d: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', key: '1b4qmf' }],
    ['path', { d: 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', key: 'i71pzd' }],
    ['path', { d: 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', key: '10jefs' }],
    ['path', { d: 'M10 6h4', key: '1itunk' }],
    ['path', { d: 'M10 10h4', key: 'tcdvrf' }],
    ['path', { d: 'M10 14h4', key: 'kelpxr' }],
    ['path', { d: 'M10 18h4', key: '1ulq68' }],
  ],
  Kt = o('building-2', je)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Be = [
    ['path', { d: 'M16 14v2.2l1.6 1', key: 'fo4ql5' }],
    ['path', { d: 'M16 2v4', key: '4m81vk' }],
    [
      'path',
      {
        d: 'M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5',
        key: '1osxxc',
      },
    ],
    ['path', { d: 'M3 10h5', key: 'r794hk' }],
    ['path', { d: 'M8 2v4', key: '1cmpym' }],
    ['circle', { cx: '16', cy: '16', r: '6', key: 'qoo3c4' }],
  ],
  Gt = o('calendar-clock', Be)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Re = [
    ['path', { d: 'M8 2v4', key: '1cmpym' }],
    ['path', { d: 'M16 2v4', key: '4m81vk' }],
    [
      'rect',
      { width: '18', height: '18', x: '3', y: '4', rx: '2', key: '1hopcy' },
    ],
    ['path', { d: 'M3 10h18', key: '8toen8' }],
    ['path', { d: 'M8 14h.01', key: '6423bh' }],
    ['path', { d: 'M12 14h.01', key: '1etili' }],
    ['path', { d: 'M16 14h.01', key: '1gbofw' }],
    ['path', { d: 'M8 18h.01', key: 'lrp35t' }],
    ['path', { d: 'M12 18h.01', key: 'mhygvu' }],
    ['path', { d: 'M16 18h.01', key: 'kzsmim' }],
  ],
  Jt = o('calendar-days', Re)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const De = [
    ['path', { d: 'M8 2v4', key: '1cmpym' }],
    ['path', { d: 'M16 2v4', key: '4m81vk' }],
    [
      'rect',
      { width: '18', height: '18', x: '3', y: '4', rx: '2', key: '1hopcy' },
    ],
    ['path', { d: 'M3 10h18', key: '8toen8' }],
  ],
  ea = o('calendar', De)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Oe = [
    [
      'path',
      {
        d: 'M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z',
        key: '18u6gg',
      },
    ],
    ['circle', { cx: '12', cy: '13', r: '3', key: '1vg3eu' }],
  ],
  ta = o('camera', Oe)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Fe = [['path', { d: 'M20 6 9 17l-5-5', key: '1gmf2c' }]],
  aa = o('check', Fe)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ue = [
  [
    'path',
    {
      d: 'M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z',
      key: '1qvrer',
    },
  ],
  ['path', { d: 'M6 17h12', key: '1jwigz' }],
]
o('chef-hat', Ue)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Xe = [['path', { d: 'm6 9 6 6 6-6', key: 'qrunsl' }]],
  oa = o('chevron-down', Xe)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ze = [['path', { d: 'm18 15-6-6-6 6', key: '153udz' }]],
  na = o('chevron-up', Ze)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const We = [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['line', { x1: '12', x2: '12', y1: '8', y2: '12', key: '1pkeuh' }],
    ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16', key: '4dfq90' }],
  ],
  sa = o('circle-alert', We)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ye = [
    ['path', { d: 'M21.801 10A10 10 0 1 1 17 3.335', key: 'yps3ct' }],
    ['path', { d: 'm9 11 3 3L22 4', key: '1pflzl' }],
  ],
  ra = o('circle-check-big', Ye)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Qe = [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['path', { d: 'm15 9-6 6', key: '1uzhvr' }],
    ['path', { d: 'm9 9 6 6', key: 'z0biqf' }],
  ],
  ca = o('circle-x', Qe)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ke = [
    [
      'rect',
      {
        width: '8',
        height: '4',
        x: '8',
        y: '2',
        rx: '1',
        ry: '1',
        key: 'tgr4d6',
      },
    ],
    [
      'path',
      {
        d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
        key: '116196',
      },
    ],
    ['path', { d: 'm9 14 2 2 4-4', key: 'df797q' }],
  ],
  ia = o('clipboard-check', Ke)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ge = [
    ['path', { d: 'M12 6v6l4 2', key: 'mmk7yg' }],
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ],
  la = o('clock', Ge)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Je = [
    ['line', { x1: '12', x2: '12', y1: '2', y2: '22', key: '7eqyqh' }],
    [
      'path',
      { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', key: '1b0p4s' },
    ],
  ],
  da = o('dollar-sign', Je)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const et = [
    ['circle', { cx: '12', cy: '12', r: '1', key: '41hilf' }],
    ['circle', { cx: '12', cy: '5', r: '1', key: 'gxeob9' }],
    ['circle', { cx: '12', cy: '19', r: '1', key: 'lyex9k' }],
  ],
  pa = o('ellipsis-vertical', et)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const tt = [
    [
      'path',
      {
        d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
        key: '1rqfz7',
      },
    ],
    ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4', key: 'tnqrlb' }],
    ['path', { d: 'M10 9H8', key: 'b1mrlr' }],
    ['path', { d: 'M16 13H8', key: 't4e002' }],
    ['path', { d: 'M16 17H8', key: 'z1uh3a' }],
  ],
  ya = o('file-text', tt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const at = [
    [
      'path',
      {
        d: 'M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z',
        key: 'sc7q7i',
      },
    ],
  ],
  ha = o('funnel', at)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ot = [
    [
      'path',
      { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8', key: '5wwlr5' },
    ],
    [
      'path',
      {
        d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
        key: 'r6nss1',
      },
    ],
  ],
  ua = o('house', ot)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const nt = [
    ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
    ['path', { d: 'M12 16v-4', key: '1dtifu' }],
    ['path', { d: 'M12 8h.01', key: 'e9boi3' }],
  ],
  fa = o('info', nt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const st = [['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56', key: '13zald' }]],
  ka = o('loader-circle', st)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const rt = [
    [
      'rect',
      {
        width: '18',
        height: '11',
        x: '3',
        y: '11',
        rx: '2',
        ry: '2',
        key: '1w4ew1',
      },
    ],
    ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4', key: 'fwvmzm' }],
  ],
  ma = o('lock', rt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ct = [
    ['path', { d: 'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7', key: '132q7q' }],
    [
      'rect',
      { x: '2', y: '4', width: '20', height: '16', rx: '2', key: 'izxlao' },
    ],
  ],
  ga = o('mail', ct)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const it = [
    [
      'path',
      {
        d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
        key: '1r0f0z',
      },
    ],
    ['circle', { cx: '12', cy: '10', r: '3', key: 'ilqhr7' }],
  ],
  va = o('map-pin', it)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const lt = [
    [
      'path',
      {
        d: 'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z',
        key: '1a0edw',
      },
    ],
    ['path', { d: 'M12 22V12', key: 'd0xqtd' }],
    ['polyline', { points: '3.29 7 12 12 20.71 7', key: 'ousv84' }],
    ['path', { d: 'm7.5 4.27 9 5.15', key: '1c824w' }],
  ],
  _a = o('package', lt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const dt = [
    ['path', { d: 'M13 21h8', key: '1jsn5i' }],
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
        key: '1a8usu',
      },
    ],
  ],
  Ma = o('pen-line', dt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const pt = [
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
        key: '1a8usu',
      },
    ],
  ],
  ba = o('pen', pt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const yt = [
    [
      'path',
      {
        d: 'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',
        key: '9njp5v',
      },
    ],
  ],
  xa = o('phone', yt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ht = [
    [
      'path',
      {
        d: 'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z',
        key: '10ikf1',
      },
    ],
  ],
  Na = o('play', ht)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ut = [
    ['path', { d: 'M5 12h14', key: '1ays0h' }],
    ['path', { d: 'M12 5v14', key: 's699le' }],
  ],
  $a = o('plus', ut)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ft = [
    [
      'path',
      {
        d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8',
        key: 'v9h5vc',
      },
    ],
    ['path', { d: 'M21 3v5h-5', key: '1q7to0' }],
    [
      'path',
      {
        d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16',
        key: '3uifl3',
      },
    ],
    ['path', { d: 'M8 16H3v5', key: '1cv678' }],
  ],
  Ea = o('refresh-cw', ft)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const kt = [
    [
      'path',
      { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', key: '1357e3' },
    ],
    ['path', { d: 'M3 3v5h5', key: '1xhq8a' }],
  ],
  Ca = o('rotate-ccw', kt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const mt = [
    [
      'path',
      {
        d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
        key: '1c8476',
      },
    ],
    ['path', { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7', key: '1ydtos' }],
    ['path', { d: 'M7 3v4a1 1 0 0 0 1 1h7', key: 't51u73' }],
  ],
  Ta = o('save', mt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const gt = [
    ['path', { d: 'm21 21-4.34-4.34', key: '14j7rj' }],
    ['circle', { cx: '11', cy: '11', r: '8', key: '4ej97u' }],
  ],
  wa = o('search', gt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const vt = [
    [
      'path',
      {
        d: 'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915',
        key: '1i5ecw',
      },
    ],
    ['circle', { cx: '12', cy: '12', r: '3', key: '1v7zrd' }],
  ],
  La = o('settings', vt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _t = [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
        key: 'oel41y',
      },
    ],
    ['path', { d: 'M12 8v4', key: '1got3b' }],
    ['path', { d: 'M12 16h.01', key: '1drbdi' }],
  ],
  Ia = o('shield-alert', _t)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Mt = [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
        key: 'oel41y',
      },
    ],
    ['path', { d: 'm9 12 2 2 4-4', key: 'dzmm74' }],
  ],
  za = o('shield-check', Mt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const bt = [
    [
      'path',
      {
        d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
        key: 'oel41y',
      },
    ],
  ],
  Aa = o('shield', bt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const xt = [
    [
      'rect',
      {
        width: '14',
        height: '20',
        x: '5',
        y: '2',
        rx: '2',
        ry: '2',
        key: '1yt0o3',
      },
    ],
    ['path', { d: 'M12 18h.01', key: 'mhygvu' }],
  ],
  Ha = o('smartphone', xt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Nt = [
    ['path', { d: 'm10 20-1.25-2.5L6 18', key: '18frcb' }],
    ['path', { d: 'M10 4 8.75 6.5 6 6', key: '7mghy3' }],
    ['path', { d: 'm14 20 1.25-2.5L18 18', key: '1chtki' }],
    ['path', { d: 'm14 4 1.25 2.5L18 6', key: '1b4wsy' }],
    ['path', { d: 'm17 21-3-6h-4', key: '15hhxa' }],
    ['path', { d: 'm17 3-3 6 1.5 3', key: '11697g' }],
    ['path', { d: 'M2 12h6.5L10 9', key: 'kv9z4n' }],
    ['path', { d: 'm20 10-1.5 2 1.5 2', key: '1swlpi' }],
    ['path', { d: 'M22 12h-6.5L14 15', key: '1mxi28' }],
    ['path', { d: 'm4 10 1.5 2L4 14', key: 'k9enpj' }],
    ['path', { d: 'm7 21 3-6-1.5-3', key: 'j8hb9u' }],
    ['path', { d: 'm7 3 3 6h4', key: '1otusx' }],
  ],
  Pa = o('snowflake', Nt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $t = [
    [
      'path',
      {
        d: 'M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344',
        key: '2acyp4',
      },
    ],
    ['path', { d: 'm9 11 3 3L22 4', key: '1pflzl' }],
  ],
  qa = o('square-check-big', $t)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Et = [
    [
      'path',
      {
        d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
        key: '1m0v6g',
      },
    ],
    [
      'path',
      {
        d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
        key: 'ohrbg2',
      },
    ],
  ],
  Sa = o('square-pen', Et)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ct = [
  ['path', { d: 'M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5', key: 'slp6dd' }],
  [
    'path',
    {
      d: 'M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244',
      key: 'o0xfot',
    },
  ],
  [
    'path',
    { d: 'M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05', key: 'wn3emo' },
  ],
]
o('store', Ct)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Tt = [
    [
      'path',
      {
        d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z',
        key: 'vktsd0',
      },
    ],
    [
      'circle',
      { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor', key: 'kqv944' },
    ],
  ],
  Va = o('tag', Tt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const wt = [
    [
      'path',
      { d: 'M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z', key: '17jzev' },
    ],
  ],
  ja = o('thermometer', wt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Lt = [
    ['circle', { cx: '9', cy: '12', r: '3', key: 'u3jwor' }],
    [
      'rect',
      { width: '20', height: '14', x: '2', y: '5', rx: '7', key: 'g7kal2' },
    ],
  ],
  Ba = o('toggle-left', Lt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const It = [
    ['circle', { cx: '15', cy: '12', r: '3', key: '1afu0r' }],
    [
      'rect',
      { width: '20', height: '14', x: '2', y: '5', rx: '7', key: 'g7kal2' },
    ],
  ],
  Ra = o('toggle-right', It)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const zt = [
    ['path', { d: 'M10 11v6', key: 'nco0om' }],
    ['path', { d: 'M14 11v6', key: 'outv1u' }],
    ['path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', key: 'miytrc' }],
    ['path', { d: 'M3 6h18', key: 'd0wm0j' }],
    ['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', key: 'e791ji' }],
  ],
  Da = o('trash-2', zt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const At = [
    ['path', { d: 'M16 7h6v6', key: 'box55l' }],
    ['path', { d: 'm22 7-8.5 8.5-5-5L2 17', key: '1t1m79' }],
  ],
  Oa = o('trending-up', At)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ht = [
    [
      'path',
      {
        d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
        key: 'wmoenq',
      },
    ],
    ['path', { d: 'M12 9v4', key: 'juzpu7' }],
    ['path', { d: 'M12 17h.01', key: 'p32p05' }],
  ],
  Fa = o('triangle-alert', Ht)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Pt = [
    ['path', { d: 'M12 3v12', key: '1x0j5s' }],
    ['path', { d: 'm17 8-5-5-5 5', key: '7q97r8' }],
    ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', key: 'ih7n3h' }],
  ],
  Ua = o('upload', Pt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const qt = [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', key: '1yyitq' }],
    ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
    ['line', { x1: '19', x2: '19', y1: '8', y2: '14', key: '1bvyxn' }],
    ['line', { x1: '22', x2: '16', y1: '11', y2: '11', key: '1shjgl' }],
  ],
  Xa = o('user-plus', qt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const St = [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', key: '1yyitq' }],
    ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
    ['line', { x1: '17', x2: '22', y1: '8', y2: '13', key: '3nzzx3' }],
    ['line', { x1: '22', x2: '17', y1: '8', y2: '13', key: '1swrse' }],
  ],
  Za = o('user-x', St)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Vt = [
    ['path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', key: '975kel' }],
    ['circle', { cx: '12', cy: '7', r: '4', key: '17ys0d' }],
  ],
  Wa = o('user', Vt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const jt = [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', key: '1yyitq' }],
    ['path', { d: 'M16 3.128a4 4 0 0 1 0 7.744', key: '16gr8j' }],
    ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87', key: 'kshegd' }],
    ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
  ],
  Ya = o('users', jt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Bt = [
  [
    'path',
    {
      d: 'm16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8',
      key: 'n7qcjb',
    },
  ],
  [
    'path',
    {
      d: 'M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7',
      key: 'd0u48b',
    },
  ],
  ['path', { d: 'm2.1 21.8 6.4-6.3', key: 'yn04lh' }],
  ['path', { d: 'm19 5-7 7', key: '194lzd' }],
]
o('utensils-crossed', Bt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Rt = [
    ['path', { d: 'M12 20h.01', key: 'zekei9' }],
    ['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0', key: '1bycff' }],
    ['path', { d: 'M5 12.859a10 10 0 0 1 5.17-2.69', key: '1dl1wf' }],
    ['path', { d: 'M19 12.859a10 10 0 0 0-2.007-1.523', key: '4k23kn' }],
    ['path', { d: 'M2 8.82a15 15 0 0 1 4.177-2.643', key: '1grhjp' }],
    ['path', { d: 'M22 8.82a15 15 0 0 0-11.288-3.764', key: 'z3jwby' }],
    ['path', { d: 'm2 2 20 20', key: '1ooewy' }],
  ],
  Qa = o('wifi-off', Rt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Dt = [
    ['path', { d: 'M12 20h.01', key: 'zekei9' }],
    ['path', { d: 'M2 8.82a15 15 0 0 1 20 0', key: 'dnpr2z' }],
    ['path', { d: 'M5 12.859a10 10 0 0 1 14 0', key: '1x1e6c' }],
    ['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0', key: '1bycff' }],
  ],
  Ka = o('wifi', Dt)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ot = [
    [
      'path',
      {
        d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z',
        key: '1ngwbx',
      },
    ],
  ],
  Ga = o('wrench', Ot)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ft = [
    ['path', { d: 'M18 6 6 18', key: '1bl5f8' }],
    ['path', { d: 'm6 6 12 12', key: 'd8bk6v' }],
  ],
  Ja = o('x', Ft)
/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ut = [
    [
      'path',
      {
        d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
        key: '1xq2db',
      },
    ],
  ],
  e1 = o('zap', Ut)
export {
  ua as $,
  Wt as A,
  M as B,
  na as C,
  da as D,
  pa as E,
  ha as F,
  Aa as G,
  Ya as H,
  fa as I,
  Xa as J,
  Ta as K,
  aa as L,
  va as M,
  Qt as N,
  Ha as O,
  Ma as P,
  La as Q,
  Ea as R,
  Sa as S,
  Da as T,
  Wa as U,
  Ka as V,
  Ga as W,
  Ja as X,
  Ua as Y,
  e1 as Z,
  Qa as _,
  oa as a,
  Pa as a0,
  qa as a1,
  ma as a2,
  ka as a3,
  Za as a4,
  Zt as a5,
  za as a6,
  Ia as a7,
  ia as a8,
  Yt as a9,
  la as b,
  sa as c,
  ra as d,
  Fa as e,
  ea as f,
  $a as g,
  D as h,
  Jt as i,
  Gt as j,
  Oa as k,
  Va as l,
  _a as m,
  ca as n,
  ja as o,
  Ca as p,
  wa as q,
  ya as r,
  ta as s,
  Na as t,
  Kt as u,
  Ra as v,
  Ba as w,
  ba as x,
  ga as y,
  xa as z,
}
