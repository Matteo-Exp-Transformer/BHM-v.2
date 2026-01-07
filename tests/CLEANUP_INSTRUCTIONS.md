# 🧹 Istruzioni Pulizia Test

## ✅ Completato

- ✅ **Creato**: `auth.config.ts` - Credenziali test
- ✅ **Creato**: `template.spec.ts` - Template per nuovi test
- ✅ **Creato**: `README.md` - Guida completa
- ✅ **Creato**: `helpers/auth.helper.ts` - Helper autenticazione
- ✅ **Creato**: `helpers/onboarding.helper.ts` - Helper onboarding
- ✅ **Creato**: `onboarding/completamento-onboarding.spec.ts` - Test funzionante ✅
- ✅ **Archiviato**: 9 file test vecchi in `Archives/Tests/Old_Onboarding_Tests/`

## ⚠️ Da Fare Manualmente

La cartella `tests/Test da verificare/` contiene molti test vecchi che andrebbero archiviati.

### Opzione 1: Archiviare (Raccomandato)

```bash
# Chiudi VSCode prima!
mv "tests/Test da verificare" "Archives/Tests/"
```

### Opzione 2: Eliminare (Se sei sicuro)

```bash
# ⚠️ ATTENZIONE: Azione irreversibile!
rm -rf "tests/Test da verificare"
```

## 📂 Struttura Test Finale

Dopo la pulizia, la cartella `tests/` dovrebbe contenere solo:

```
tests/
├── auth.config.ts              # ✅ Credenziali test
├── template.spec.ts            # ✅ Template base
├── README.md                   # ✅ Guida completa
├── helpers/
│   ├── auth.helper.ts          # ✅ Helper login/logout
│   └── onboarding.helper.ts    # ✅ Helper onboarding
├── onboarding/
│   └── completamento-onboarding.spec.ts  # ✅ Test principale FUNZIONANTE
└── auth/
    └── login/
        └── LoginPage.spec.ts   # ⚠️ Da verificare se ancora valido
```

## 🗑️ Da Archiviare

- ❌ `tests/Test da verificare/` - Contiene test vecchi non aggiornati
  - 50+ file di test obsoleti
  - Screenshot vecchi
  - File duplicati (auth.config.ts, template.spec.ts)

## ✅ Test Verificato e Funzionante

Il test principale che **FUNZIONA** è:
```bash
npx playwright test tests/onboarding/completamento-onboarding.spec.ts --headed
```

Questo test:
- ✅ Fa login con credenziali test
- ✅ Resetta lo stato onboarding
- ✅ Precompila i dati
- ✅ Completa l'onboarding
- ✅ Verifica assenza errori 409/23505 (duplicate key)
- ✅ Verifica redirect a dashboard

---

**Data**: 2026-01-07
**Status**: Test onboarding funzionante e struttura pronta per nuovi test
