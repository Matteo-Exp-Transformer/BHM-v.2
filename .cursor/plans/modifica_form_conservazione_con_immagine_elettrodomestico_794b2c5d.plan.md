---
name: Modifica form conservazione con immagine elettrodomestico
overview: "Sostituire la sezione \"Categorie prodotti (auto-configurate)\" con un layout a metà quando viene selezionato \"Frigorifero\": sinistra mostra le categorie del profilo selezionato, destra mostra l'immagine dell'elettrodomestico cliccabile per visualizzazione fullscreen. Le note HACCP rimangono sotto."
todos:
  - id: "0"
    content: Organizzare immagine esistente da Images/Punti di conservazione/FrigoriferoVerticaleConFreezer a public/images/conservation/appliances/vertical_fridge_with_freezer.{ext} preservando estensione originale
    status: pending
  - id: "1"
    content: Aggiungere state isImageModalOpen per gestire apertura/chiusura modal immagine
    status: pending
  - id: "2"
    content: Creare funzione helper getApplianceImagePath per mapping categoria → percorso immagine con supporto multiple estensioni (png, jpg, jpeg, webp)
    status: pending
  - id: "3"
    content: Condizionare sezione categorie esistente (righe 1211-1277) per nasconderla quando pointType === fridge
    status: pending
  - id: "4"
    content: Implementare nuovo layout split responsive (grid-cols-1 md:grid-cols-2) con categorie sinistra + immagine destra quando fridge + applianceCategory + profileId selezionati
    status: pending
  - id: "5"
    content: Implementare colonna sinistra con lista categorie profilo (badge/chip) usando selectedProfile.allowedCategoryIds mappate con mapCategoryIdsToDbNames, con placeholder quando profilo non selezionato
    status: pending
  - id: "6"
    content: Implementare colonna destra con immagine cliccabile usando OptimizedImage, overlay hover con indicatore "Clicca per ingrandire", e gestione stati loading/error
    status: pending
  - id: "7"
    content: Aggiungere modal lightbox usando componente Modal esistente per visualizzazione fullscreen immagine con chiusura ESC/overlay/bottone
    status: pending
  - id: "8"
    content: Verificare che note HACCP (righe 1182-1207) rimangano nella posizione corretta sotto il nuovo layout
    status: pending
  - id: "9"
    content: Aggiungere import necessari (Modal, OptimizedImage) e verificare accessibilità (aria-label, keyboard navigation)
    status: pending
---

# Modifica Form Conservazione - Immagine Elettrodomestico

## Obiettivo

Quando viene selezionato "Frigorifero" nel form `AddPointModal`, sostituire la sezione "Categorie prodotti (auto-configurate)" con un nuovo layout che mostra:

- **Sinistra**: Categorie prodotti del profilo HACCP selezionato
- **Destra**: Immagine dell'elettrodomestico (cliccabile per fullscreen)
- **Sotto**: Note HACCP (mantenute nella posizione attuale)

## File da Modificare

### 1. `src/features/conservation/components/AddPointModal.tsx`

**Modifiche principali:**

#### A. Rimuovere/Condizionare Sezione Categorie Esistente

- La sezione "Categorie prodotti" (righe 1211-1277) deve essere nascosta quando `formData.pointType === 'fridge'`
- Mantenere la logica esistente per altri tipi di punto

#### B. Aggiungere Nuova Sezione Layout Split

- Creare nuovo componente/sezione che appare solo quando:
  - `formData.pointType === 'fridge'`
  - `formData.applianceCategory` è selezionato
  - `formData.profileId` è presente (per mostrare categorie)
- Layout responsive: `grid grid-cols-1 md:grid-cols-2 gap-4` (stack verticale su mobile, side-by-side su desktop)
- Altezza minima: `min-h-[300px]` per mantenere proporzioni
- **Colonna sinistra**: Lista categorie del profilo selezionato con badge/chip
- **Colonna destra**: Immagine elettrodomestico cliccabile con overlay hover

#### C. Implementare Visualizzazione Categorie Profilo

- Usare `selectedProfile.allowedCategoryIds` (già disponibile nel codice)
- Mappare con `mapCategoryIdsToDbNames()` per ottenere nomi leggibili
- Mostrare come lista di badge/chip con stile coerente al design system
- Layout scrollabile verticalmente se lista lunga: `max-h-[400px] overflow-y-auto`
- Placeholder quando `selectedProfile` non presente: "Seleziona un profilo HACCP per visualizzare le categorie"
- Ogni categoria mostrata con icona `ShieldCheck` e stile badge (border-blue-200, bg-white)

#### D. Implementare Immagine Elettrodomestico

- **Path immagine**: `/images/conservation/appliances/vertical_fridge_with_freezer.{ext}`
  - Immagine esistente in: `Images/Punti di conservazione/FrigoriferoVerticaleConFreezer/`
  - Da copiare a: `public/images/conservation/appliances/vertical_fridge_with_freezer.{ext}` (preservare estensione originale: png, jpg, jpeg, webp, svg)
- Usare componente `OptimizedImage` per gestione stati loading/error/loaded
- Immagine cliccabile con `cursor-pointer`
- Overlay hover con indicatore "Clicca per ingrandire" (opacity-0 group-hover:opacity-100)
- Stile: `max-w-full max-h-[300px] object-contain` nella preview
- Container con `border rounded-lg p-4 bg-gray-50` e hover effect

#### E. Creare Modal Fullscreen Immagine

- Usare componente `Modal` esistente (`src/components/ui/Modal.tsx`) con size "xl"
- State: `const [isImageModalOpen, setIsImageModalOpen] = useState(false)`
- Mostrare immagine a schermo intero quando cliccata
- Immagine nel modal: `max-w-full max-h-[90vh] object-contain` centrata
- Chiusura con ESC, click overlay, o bottone close
- Z-index: Modal esistente gestisce già z-50, sufficiente per essere sopra AddPointModal (z-[9999])

#### F. Mantenere Note HACCP

- Le note HACCP (righe 1182-1207) rimangono nella stessa posizione
- Appaiono sotto il nuovo layout split

## Struttura Componente

### Nuova Sezione Layout (da inserire dopo riga 1209, prima delle note HACCP)

```tsx
{/* Sezione Layout Immagine + Categorie - Solo per frigoriferi con categoria e profilo selezionati */}
{formData.pointType === 'fridge' && formData.applianceCategory && formData.profileId && (
  <div className="space-y-4 border-t pt-6">
    <h3 className="text-lg font-medium flex items-center gap-2">
      <ShieldCheck className="h-5 w-5 text-blue-600" />
      Configurazione Punto di Conservazione
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[300px]">
      {/* Colonna Sinistra: Categorie Profilo */}
      <div className="space-y-2">
        <Label>Categorie del Profilo Selezionato</Label>
        {selectedProfile ? (
          <div className="border rounded-lg p-4 bg-gray-50 max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
              {mapCategoryIdsToDbNames(selectedProfile.allowedCategoryIds).map((categoryName, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                  <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{categoryName}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-gray-500 text-center">
              Seleziona un profilo HACCP per visualizzare le categorie
            </p>
          </div>
        )}
      </div>
      
      {/* Colonna Destra: Immagine Frigorifero */}
      <div className="space-y-2">
        <Label>Immagine Elettrodomestico</Label>
        <div 
          className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group relative"
          onClick={() => setIsImageModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsImageModalOpen(true)
            }
          }}
          aria-label="Clicca per ingrandire l'immagine"
        >
          <div className="relative w-full h-full min-h-[200px] flex items-center justify-center">
            <OptimizedImage
              src={getApplianceImagePath(formData.applianceCategory)}
              alt={APPLIANCE_CATEGORY_LABELS[formData.applianceCategory]}
              className="max-w-full max-h-[300px] object-contain"
            />
            {/* Overlay hover con indicatore */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
                  Clicca per ingrandire
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

### Modal Lightbox (da aggiungere prima del return finale, dopo il form)

```tsx
{/* Modal Lightbox Immagine */}
<Modal
  isOpen={isImageModalOpen}
  onClose={() => setIsImageModalOpen(false)}
  title={APPLIANCE_CATEGORY_LABELS[formData.applianceCategory] || 'Immagine Elettrodomestico'}
  size="xl"
  closeOnOverlayClick={true}
  closeOnEscape={true}
>
  <div className="flex items-center justify-center p-4">
    <OptimizedImage
      src={getApplianceImagePath(formData.applianceCategory)}
      alt={`${APPLIANCE_CATEGORY_LABELS[formData.applianceCategory]} - Vista ingrandita`}
      className="max-w-full max-h-[90vh] object-contain"
    />
  </div>
</Modal>
```

### Condizionare Sezione Categorie Esistente (riga 1211)

```tsx
{/* Sezione categorie originale - solo per non-fridge o senza profilo */}
{formData.pointType !== 'fridge' && (
  <div>
    {/* Sezione categorie esistente (righe 1211-1277) */}
    <div className="flex items-center justify-between mb-2">
      <Label>Categorie prodotti {formData.profileId ? '(auto-configurate)' : '*'}</Label>
      {/* ... resto del codice esistente ... */}
    </div>
  </div>
)}
```

## Funzioni Helper Necessarie

### `getApplianceImagePath(applianceCategory: ApplianceCategory): string`

- Mapping categoria → percorso immagine in `public/`
- Path base: `/images/conservation/appliances/`
- Mapping: `vertical_fridge_with_freezer` → `vertical_fridge_with_freezer.{ext}`
- Supporto multiple estensioni: png, jpg, jpeg, webp, svg
- Implementazione con fallback: prova estensioni comuni o usa estensione nota
- Estendibile per future categorie elettrodomestici

**Implementazione suggerita:**

```typescript
const getApplianceImagePath = (category: ApplianceCategory): string => {
  const categoryToFile: Record<ApplianceCategory, string> = {
    vertical_fridge_with_freezer: 'vertical_fridge_with_freezer',
  }
  // Assumiamo .png per ora, può essere esteso per supportare fallback
  return `/images/conservation/appliances/${categoryToFile[category]}.png`
}
```

## Dettagli Implementazione

### State Management

- Aggiungere `const [isImageModalOpen, setIsImageModalOpen] = useState(false)`

### Styling

- Layout split responsive: `grid grid-cols-1 md:grid-cols-2 gap-4`
- Altezza minima: `min-h-[300px]` per mantenere proporzioni
- Immagine preview: `max-h-[300px] object-contain`
- Immagine modal: `max-h-[90vh] object-contain`
- Categorie: `max-h-[400px] overflow-y-auto` per scroll verticale se lista lunga
- Badge categorie: `border border-blue-200 bg-white rounded p-2` con icona ShieldCheck
- Overlay hover: `bg-black bg-opacity-0 group-hover:bg-opacity-10` con transizione

### Accessibilità

- Alt text appropriato per immagini (usare APPLIANCE_CATEGORY_LABELS)
- Keyboard navigation: `onKeyDown` per Enter/Space sull'immagine cliccabile
- `role="button"` e `tabIndex={0}` per immagine cliccabile
- `aria-label` per indicare che l'immagine è cliccabile
- Focus management: Modal esistente gestisce già focus management

## File da Organizzare

### `public/images/conservation/appliances/vertical_fridge_with_freezer.{ext}`

- **Immagine esistente**: `Images/Punti di conservazione/FrigoriferoVerticaleConFreezer/` (immagine già presente)
- **Azione**: Copiare/spostare l'immagine esistente nella cartella `public/images/conservation/appliances/`
- **Nome file finale**: `vertical_fridge_with_freezer.{ext}` dove `{ext}` è l'estensione originale (png, jpg, jpeg, webp, svg)
- **Cartella**: `public/images/conservation/appliances/` da creare se non esiste
- **Nota**: L'immagine esiste già, non va generata, solo organizzata nella struttura corretta. Preservare l'estensione originale.

## Import Necessari

Aggiungere al file AddPointModal.tsx:

```typescript
import { Modal } from '@/components/ui/Modal'
import OptimizedImage from '@/components/ui/OptimizedImage'
// mapCategoryIdsToDbNames già importato da @/utils/conservationProfiles
```

## Note Tecniche

1. **Path Immagine**: Vite serve `public/` come root, quindi `/images/conservation/appliances/` punta a `public/images/conservation/appliances/`

2. **Estendibilità**: Strutturare il codice per facilitare aggiunta di altre categorie elettrodomestici in futuro. La funzione `getApplianceImagePath` può essere estesa con un mapping Record.

3. **Performance**: `OptimizedImage` gestisce già lazy loading e stati loading/error

4. **Responsive**: Layout stack verticale su mobile (`grid-cols-1`), side-by-side su desktop (`md:grid-cols-2`)

5. **Condizioni di visualizzazione**: La nuova sezione appare solo quando:

   - `formData.pointType === 'fridge'`
   - `formData.applianceCategory` è selezionato
   - `formData.profileId` è presente (per mostrare categorie)

6. **Z-index**: Modal esistente usa z-50, sufficiente per essere sopra AddPointModal (z-[9999])