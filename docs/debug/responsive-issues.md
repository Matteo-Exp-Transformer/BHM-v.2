# 📱 Audit Responsive Layout – 3 Ott 2025

## Contesto
- **Branch:** `fix/cursor-functional`
- **Task:** B3 – Audit Responsive Layout
- **URL dev:** http://localhost:3004
- **Device presets:** 375px (iPhone SE), 414px (iPhone Pro Max), 768px (iPad), 1024px (iPad Pro), 1440px, 1920px

## Metodologia
- Navigazione manuale su tutte le principali pagine (`/login`, `/onboarding`, `/conservation`, `/inventory`, `/calendar`, `/management`, `/settings`, `/dashboard`).
- Controllo di overflow orizzontale, leggibilità, spaziatura, accessibilità touch target.
- Verifica dei componenti riutilizzati (es. `CollapsibleCard`, `StepNavigator`, card statistiche) ai diversi breakpoint.
- Annotazione screenshot riferiti (nomi file in `/docs/debug/screenshots/` da produrre se richiesti).

## Issues Rilevati

### 1. Layout Header Onboarding – testo overflow su mobile
- **Pagina:** `/onboarding`
- **Breakpoint:** 375px / 414px
- **Componente:** `OnboardingWizard` header introduzione
- **Problema:** Titolo + paragrafo + pulsanti Dev creano overflow verticale e orizzontale (padding eccessivo, bottone “🚀 Compila con dati di esempio” supera i bordi).
- **Impatto:** UI confusa su mobile, difficile raggiungere pulsanti.
- **Suggerimento fix:** Stacking verticale con `flex-col`, ridurre font-size, spostare pulsanti Dev dietro `import.meta.env.DEV` o comprimere a icone su mobile.
- **Priorità:** Alta (blocca onboarding mobile)

### 2. Step Navigator – 6 colonne non leggibili su 768px
- **Pagina:** `/onboarding`
- **Breakpoint:** 768px (iPad), 1024px
- **Componente:** `StepNavigator` versione desktop (grid 6 colonne fisse)
- **Problema:** Colonne strette, testo tronco, icone sovrapposte.
- **Suggerimento fix:** Usare grid responsive (`sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6`), aggiungere `text-xs`/`truncate`, padding minore.
- **Priorità:** Media

### 3. Bottom Navigation (MainLayout) – overflow e tap area
- **Pagina:** tutte le pagine protette (es. `/inventory`)
- **Breakpoint:** 375px (>=6 tab)
- **Componente:** `MainLayout` nav bottom
- **Problema:** Con 6 tab il testo esce, touch target <44px, scrollbar orizzontale.
- **Suggerimento fix:** Implementare navigation scrollabile con `overflow-x-auto`, icone + label ridotti (`text-[10px]`), o condizionare label (solo icone su <400px).
- **Priorità:** Alta (navigation primaria). 

### 4. LoginPage – SignIn card non centrata su mobile
- **Pagina:** `/login`
- **Breakpoint:** 375px, 414px
- **Problema:** `ml-12` sul container Clerk spinge card fuori viewport.
- **Suggerimento fix:** Remuovere `ml-12`, usare `mx-auto`, definire larghezza max su breakpoints (`max-w-sm` mobile, `max-w-md` desktop).
- **Priorità:** Alta (prima impressione).

### 5. Inventory header – pulsanti allineati male su mobile
- **Pagina:** `/inventory`
- **Breakpoint:** 375px
- **Problema:** `flex gap-2` per due pulsanti porta overflow (non wrap). 
- **Suggerimento fix:** `flex-col sm:flex-row`, `w-full` su mobile, icone con testo più corto.
- **Priorità:** Media.

### 6. Stat cards multiple pagine – grid 2 colonne su mobile crea overflow
- **Pagine:** `/inventory` (`grid-cols-2`), `/dashboard`, `/management`
- **Breakpoint:** 375px
- **Problema:** Cards fisse a 2 colonne con contenuto largo (icone) causano schiacciamento e overflow.
- **Suggerimento:** `grid-cols-1 sm:grid-cols-2`, definire `min-h` e `gap` adeguati.
- **Priorità:** Media.

### 7. CollapsibleCard content spacing – padding insufficiente su mobile
- **Pagine:** `inventory`, `conservation`, `settings`
- **Breakpoint:** 375px
- **Problema:** Layout condizionale (stats + grid) non gestisce bene stacking -> cards con stat grid mantengono layout 2 colonne.
- **Suggerimento:** Per mobile forzare `grid-cols-1`, spaziature `space-y-3`, `text-sm`.
- **Priorità:** Media.

### 8. Calendar – toolbar e filter button overflow
- **Pagina:** `/calendar`
- **Breakpoint:** 375px, 414px
- **Problema:** Toolbar `flex` con titolo + pulsanti (Filtri, Nuovo Evento) supera width, appare scroll.
- **Suggerimento:** Stacking su mobile (`flex-col gap-2`), `text-sm` per titolo, `w-full` pulsanti.
- **Priorità:** Alta (component interazione must).

### 9. Calendar grid – FullCalendar non responsive a 375px
- **Pagina:** `/calendar`
- **Breakpoint:** 375px
- **Problema:** FullCalendar minima width ~ 320px ma overflow generato da padding container; tocca scorrere horizontal.
- **Suggerimento:** Ridurre `padding` container a `p-2`, `font-size` minore, forzare `overflow-x-auto` per calendario.
- **Priorità:** Media.

### 10. Management welcome banner – testo overflow
- **Pagina:** `/management`
- **Breakpoint:** 375px
- **Problema:** Banner gradient `flex items-center` con icona e testo lungo -> wrap non gestito.
- **Suggerimento:** `flex-col` mobile, `text-center`, ridurre font.
- **Priorità:** Bassa.

### 11. Settings cards – `CollapsibleCard` margini duplicati
- **Pagina:** `/settings`
- **Breakpoint:** <768px
- **Problema:** Cards `className="bg-white"` ma container già `bg-gray-50`, margine top/ bottom ridotto, appare compresso.
- **Suggerimento:** Aggiungere `space-y-4` container e `p-0 md:p-4`.
- **Priorità:** Bassa (cosmetica).

### 12. Dashboard – stats grid 2 colonne su mobile, quick actions overflow
- **Pagina:** `/dashboard`
- **Breakpoint:** 375px
- **Problema:** Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` ok, ma Quick Actions (3 cards) vertical spacing ridotta; cards > viewport width per padding.
- **Suggerimento:** `space-y-4`, `rounded-md`, `text-sm`.
- **Priorità:** Media.

### 13. Conservation page – stats mini cards non leggibili
- **Pagina:** `/conservation`
- **Breakpoint:** 375px
- **Problema:** Stat mini cards (4) in `grid-cols-2` ma contenuto con emoji + testo -> overflow.
- **Suggerimento:** `grid-cols-1 sm:grid-cols-2`, ridurre font.
- **Priorità:** Media.

### 14. Modal (AddProduct, AddPoint) – altezza e scroll su 375px
- **Pagine:** inventory/conservation modals
- **Problema:** Modali centrati senza `max-h` e `overflow-y-auto`, su 375px i pulsanti bottom escono.
- **Suggerimento:** `max-h-[90vh]` + `overflow-y-auto` per contenuto.
- **Priorità:** Alta (blocca esecuzione task).

## Riepilogo Priorità
- **Alta:** #1 Onboarding header; #3 Bottom navigation; #4 Login; #8 Calendar toolbar; #14 Modal overflow.
- **Media:** #2 Step navigator; #5 Inventory header; #6 Stats grid; #7 CollapsibleCard spacing; #9 Calendar grid; #12 Dashboard cards; #13 Conservation stats.
- **Bassa:** #10 Management banner; #11 Settings spacing.

## Prossimi Step
1. Allineare fix design con Task B4 (Responsive Fix) – concentrarsi su priorità Alta.
2. Verificare `CollapsibleCard` component per supportare props responsive (Task B5).
3. Validare modali con `@headlessui/react` pattern o Tailwind utilities.
4. Aggiornare UI test plan con breakpoints coperti (Task B11 in futuro).

_Report generato da Cursor Agent B il 3 Ottobre 2025._

