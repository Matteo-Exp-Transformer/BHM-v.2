import { j as e } from './query-vendor-BsnDS19Y.js'
import { b as r } from './auth-vendor-CMFeYHy6.js'
import { a as s } from './router-vendor-kmGKi7vG.js'
import './react-vendor-Cttizgra.js'
const n = () => {
  const t = s()
  return e.jsx('div', {
    className:
      'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8',
    children: e.jsxs('div', {
      className: 'w-full max-w-2xl flex flex-col items-center space-y-8',
      children: [
        e.jsxs('div', {
          className: 'text-center',
          children: [
            e.jsxs('h1', {
              className:
                'text-6xl font-bold text-blue-700 mb-4 whitespace-nowrap',
              style: {
                fontFamily: 'Tangerine, cursive',
                fontStyle: 'italic',
                letterSpacing: '0.02em',
              },
              children: [
                'Business H',
                e.jsx('span', { className: 'lowercase', children: 'accp' }),
                ' Manager',
              ],
            }),
            e.jsx('h2', {
              className: 'text-xl font-semibold text-gray-700 mb-2',
              children: 'Accedi al Sistema',
            }),
            e.jsx('p', {
              className: 'text-sm text-gray-600 leading-relaxed',
              children:
                'Gestisci la sicurezza alimentare del tuo ristorante con strumenti professionali e intuitivi',
            }),
          ],
        }),
        e.jsx('div', {
          className: 'w-full flex justify-center',
          children: e.jsx('div', {
            className: 'w-full max-w-md ml-12',
            children: e.jsx(r, {
              appearance: {
                elements: {
                  formButtonPrimary:
                    'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl',
                  card: 'shadow-2xl border-0 rounded-2xl',
                  headerTitle: 'text-gray-800 font-semibold',
                  headerSubtitle: 'text-gray-600',
                  socialButtonsBlockButton:
                    'border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200',
                  formFieldInput:
                    'border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg',
                  footerActionLink:
                    'text-blue-600 hover:text-blue-700 font-medium',
                },
              },
            }),
          }),
        }),
        e.jsx('div', {
          className: 'mt-6 text-center',
          children: e.jsxs('button', {
            onClick: () => t('/'),
            className:
              'text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2',
            children: [
              e.jsx('svg', {
                className: 'w-4 h-4',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                children: e.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M10 19l-7-7m0 0l7-7m-7 7h18',
                }),
              }),
              'Torna alla home',
            ],
          }),
        }),
      ],
    }),
  })
}
export { n as default }
