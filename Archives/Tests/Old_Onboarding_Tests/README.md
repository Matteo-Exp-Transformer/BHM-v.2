# Test Onboarding Archiviati

**Data archiviazione**: 2026-01-07

## Motivo Archiviazione

Questi test sono stati sostituiti dal nuovo test consolidato:
- **Nuovo test**: `tests/onboarding/completamento-onboarding.spec.ts`

Il nuovo test include:
- ✅ Login automatico con credenziali test
- ✅ Reset stato onboarding prima di ogni test
- ✅ Verifica completamento onboarding con DevButtons
- ✅ Verifica assenza errori duplicate key (UPSERT)
- ✅ Helper riutilizzabili in `tests/helpers/`

## File Archiviati

1. **onboarding_full_flow.test.tsx** - Test vecchio flusso completo
2. **onboarding_playwright_demo.test.ts** - Demo Playwright originale
3. **onboarding-complete.spec.ts** - Test completamento base
4. **onboarding-completo-funzionante.spec.ts** - Variante test completamento
5. **onboarding-steps-4-7.spec.ts** - Test step 4-7 specifici
6. **onboarding-steps-detailed.spec.ts** - Test step dettagliati
7. **onboarding-wizard.spec.ts** - Test wizard completo
8. **test-onboarding-mappatura.spec.ts** - Test mappatura
9. **test-onboarding-singolo.spec.ts** - Test singolo step

## Come Riutilizzare

Se hai bisogno di logiche specifiche da questi test:
1. Apri il file archiviato
2. Copia la logica necessaria
3. Integrala nel nuovo test `tests/onboarding/completamento-onboarding.spec.ts`

## Nuova Struttura Test

```
tests/
├── auth.config.ts                    # ✅ Credenziali test
├── helpers/
│   ├── auth.helper.ts                # ✅ Helper login/logout
│   └── onboarding.helper.ts          # ✅ Helper onboarding
├── onboarding/
│   └── completamento-onboarding.spec.ts  # ✅ Test principale
├── template.spec.ts                  # ✅ Template per nuovi test
└── README.md                         # ✅ Guida completa
```

---

**NON ELIMINARE**: Questi file potrebbero contenere logiche utili per il futuro.
