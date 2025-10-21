# DESIGN TOKENS - BHM v.2 Auth System

**Data**: 2025-10-20  
**Autore**: Agente 3 - Experience & Interface Designer  
**Versione**: 1.0  
**Focus**: Design system per componenti auth

---

## COLORS

### Primary Colors
```json
{
  "primary": {
    "50": "#EFF6FF",
    "100": "#DBEAFE", 
    "200": "#BFDBFE",
    "300": "#93C5FD",
    "400": "#60A5FA",
    "500": "#3B82F6",  // Main brand color
    "600": "#2563EB",
    "700": "#1D4ED8",
    "800": "#1E40AF",
    "900": "#1E3A8A"
  }
}
```

### Semantic Colors
```json
{
  "success": {
    "50": "#F0FDF4",
    "100": "#DCFCE7",
    "200": "#BBF7D0",
    "300": "#86EFAC",
    "400": "#4ADE80",
    "500": "#10B981",  // Success green
    "600": "#059669",
    "700": "#047857",
    "800": "#065F46",
    "900": "#064E3B"
  },
  "error": {
    "50": "#FEF2F2",
    "100": "#FEE2E2",
    "200": "#FECACA",
    "300": "#FCA5A5",
    "400": "#F87171",
    "500": "#EF4444",  // Error red
    "600": "#DC2626",
    "700": "#B91C1C",
    "800": "#991B1B",
    "900": "#7F1D1D"
  },
  "warning": {
    "50": "#FFFBEB",
    "100": "#FEF3C7",
    "200": "#FDE68A",
    "300": "#FCD34D",
    "400": "#FBBF24",
    "500": "#F59E0B",  // Warning orange
    "600": "#D97706",
    "700": "#B45309",
    "800": "#92400E",
    "900": "#78350F"
  },
  "info": {
    "50": "#F0F9FF",
    "100": "#E0F2FE",
    "200": "#BAE6FD",
    "300": "#7DD3FC",
    "400": "#38BDF8",
    "500": "#0EA5E9",  // Info blue
    "600": "#0284C7",
    "700": "#0369A1",
    "800": "#075985",
    "900": "#0C4A6E"
  }
}
```

### Neutral Colors
```json
{
  "neutral": {
    "50": "#F9FAFB",
    "100": "#F3F4F6",
    "200": "#E5E7EB",
    "300": "#D1D5DB",
    "400": "#9CA3AF",
    "500": "#6B7280",
    "600": "#4B5563",
    "700": "#374151",
    "800": "#1F2937",
    "900": "#111827"
  }
}
```

### Background Colors
```json
{
  "background": {
    "primary": "#FFFFFF",
    "secondary": "#F9FAFB",
    "tertiary": "#F3F4F6",
    "overlay": "rgba(0, 0, 0, 0.5)",
    "card": "#FFFFFF",
    "input": "#FFFFFF"
  }
}
```

### Text Colors
```json
{
  "text": {
    "primary": "#111827",
    "secondary": "#6B7280", 
    "tertiary": "#9CA3AF",
    "disabled": "#D1D5DB",
    "inverse": "#FFFFFF",
    "error": "#EF4444",
    "success": "#10B981",
    "warning": "#F59E0B"
  }
}
```

---

## TYPOGRAPHY

### Font Families
```json
{
  "fontFamily": {
    "sans": "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    "mono": "'Fira Code', 'Courier New', monospace"
  }
}
```

### Font Sizes
```json
{
  "fontSize": {
    "xs": "0.75rem",    // 12px
    "sm": "0.875rem",   // 14px
    "base": "1rem",    // 16px
    "lg": "1.125rem",  // 18px
    "xl": "1.25rem",   // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem"      // 48px
  }
}
```

### Font Weights
```json
{
  "fontWeight": {
    "normal": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700
  }
}
```

### Line Heights
```json
{
  "lineHeight": {
    "none": 1,
    "tight": 1.25,
    "snug": 1.375,
    "normal": 1.5,
    "relaxed": 1.625,
    "loose": 2
  }
}
```

### Typography Scale
```json
{
  "typography": {
    "h1": {
      "fontSize": "2xl",
      "fontWeight": "bold",
      "lineHeight": "tight",
      "color": "text.primary"
    },
    "h2": {
      "fontSize": "xl",
      "fontWeight": "semibold", 
      "lineHeight": "snug",
      "color": "text.primary"
    },
    "h3": {
      "fontSize": "lg",
      "fontWeight": "semibold",
      "lineHeight": "snug", 
      "color": "text.primary"
    },
    "body": {
      "fontSize": "base",
      "fontWeight": "normal",
      "lineHeight": "normal",
      "color": "text.primary"
    },
    "caption": {
      "fontSize": "sm",
      "fontWeight": "normal",
      "lineHeight": "normal",
      "color": "text.secondary"
    },
    "label": {
      "fontSize": "sm",
      "fontWeight": "medium",
      "lineHeight": "normal",
      "color": "text.primary"
    }
  }
}
```

---

## SPACING

### Spacing Scale
```json
{
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px",
    "32": "128px"
  }
}
```

### Component Spacing
```json
{
  "componentSpacing": {
    "form": {
      "fieldGap": "6",      // 24px tra campi
      "sectionGap": "8",   // 32px tra sezioni
      "padding": "8",       // 32px padding interno
      "margin": "6"         // 24px margin esterno
    },
    "button": {
      "paddingX": "6",     // 24px padding orizzontale
      "paddingY": "3",     // 12px padding verticale
      "gap": "2"           // 8px gap tra icona e testo
    },
    "input": {
      "paddingX": "4",     // 16px padding orizzontale
      "paddingY": "3",     // 12px padding verticale
      "gap": "2"           // 8px gap tra elementi
    }
  }
}
```

---

## BORDERS

### Border Radius
```json
{
  "borderRadius": {
    "none": "0px",
    "sm": "4px",
    "DEFAULT": "8px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "2xl": "24px",
    "full": "9999px"
  }
}
```

### Border Width
```json
{
  "borderWidth": {
    "0": "0px",
    "1": "1px",
    "2": "2px",
    "4": "4px",
    "8": "8px"
  }
}
```

### Border Colors
```json
{
  "borderColor": {
    "default": "#E5E7EB",
    "focus": "#3B82F6",
    "error": "#EF4444",
    "success": "#10B981",
    "warning": "#F59E0B"
  }
}
```

---

## SHADOWS

### Shadow Scale
```json
{
  "boxShadow": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "DEFAULT": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    "none": "none"
  }
}
```

### Component Shadows
```json
{
  "componentShadow": {
    "card": "md",
    "button": "sm",
    "input": "none",
    "inputFocus": "0 0 0 3px rgba(59, 130, 246, 0.1)",
    "modal": "2xl",
    "toast": "lg"
  }
}
```

---

## TRANSITIONS

### Transition Durations
```json
{
  "transitionDuration": {
    "fast": "150ms",
    "base": "200ms",
    "slow": "300ms",
    "slower": "500ms"
  }
}
```

### Transition Timing
```json
{
  "transitionTiming": {
    "ease": "cubic-bezier(0.4, 0, 0.2, 1)",
    "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
    "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
    "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)"
  }
}
```

### Component Transitions
```json
{
  "componentTransition": {
    "button": "all base ease",
    "input": "all base ease",
    "card": "all base ease",
    "modal": "all slow ease",
    "toast": "all base ease"
  }
}
```

---

## Z-INDEX

### Z-Index Scale
```json
{
  "zIndex": {
    "dropdown": 1000,
    "sticky": 1020,
    "fixed": 1030,
    "modalBackdrop": 1040,
    "modal": 1050,
    "popover": 1060,
    "tooltip": 1070,
    "toast": 1080
  }
}
```

---

## BREAKPOINTS

### Responsive Breakpoints
```json
{
  "breakpoints": {
    "sm": "640px",
    "md": "768px", 
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  }
}
```

### Container Sizes
```json
{
  "container": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px",
    "auth": "400px"
  }
}
```

---

## COMPONENT TOKENS

### Button Tokens
```json
{
  "button": {
    "primary": {
      "background": "primary.500",
      "backgroundHover": "primary.600",
      "backgroundActive": "primary.700",
      "backgroundDisabled": "neutral.300",
      "text": "white",
      "textDisabled": "neutral.500",
      "border": "transparent",
      "borderHover": "transparent",
      "shadow": "sm",
      "shadowHover": "md",
      "padding": "3 6",
      "fontSize": "base",
      "fontWeight": "medium",
      "borderRadius": "md",
      "transition": "all base ease"
    },
    "secondary": {
      "background": "transparent",
      "backgroundHover": "neutral.100",
      "backgroundActive": "neutral.200",
      "backgroundDisabled": "transparent",
      "text": "neutral.700",
      "textDisabled": "neutral.400",
      "border": "neutral.300",
      "borderHover": "neutral.400",
      "shadow": "none",
      "shadowHover": "sm",
      "padding": "3 6",
      "fontSize": "base",
      "fontWeight": "medium",
      "borderRadius": "md",
      "transition": "all base ease"
    },
    "danger": {
      "background": "error.500",
      "backgroundHover": "error.600",
      "backgroundActive": "error.700",
      "backgroundDisabled": "neutral.300",
      "text": "white",
      "textDisabled": "neutral.500",
      "border": "transparent",
      "borderHover": "transparent",
      "shadow": "sm",
      "shadowHover": "md",
      "padding": "3 6",
      "fontSize": "base",
      "fontWeight": "medium",
      "borderRadius": "md",
      "transition": "all base ease"
    }
  }
}
```

### Input Tokens
```json
{
  "input": {
    "default": {
      "background": "white",
      "backgroundDisabled": "neutral.50",
      "text": "text.primary",
      "textDisabled": "text.disabled",
      "placeholder": "text.tertiary",
      "border": "neutral.300",
      "borderHover": "neutral.400",
      "borderFocus": "primary.500",
      "borderError": "error.500",
      "shadow": "none",
      "shadowFocus": "0 0 0 3px rgba(59, 130, 246, 0.1)",
      "shadowError": "0 0 0 3px rgba(239, 68, 68, 0.1)",
      "padding": "3 4",
      "fontSize": "base",
      "fontWeight": "normal",
      "borderRadius": "md",
      "transition": "all base ease"
    }
  }
}
```

### Card Tokens
```json
{
  "card": {
    "default": {
      "background": "white",
      "border": "neutral.200",
      "shadow": "md",
      "shadowHover": "lg",
      "padding": "8",
      "borderRadius": "lg",
      "transition": "all base ease"
    },
    "auth": {
      "background": "white",
      "border": "neutral.200",
      "shadow": "lg",
      "shadowHover": "xl",
      "padding": "8",
      "borderRadius": "lg",
      "transition": "all base ease",
      "maxWidth": "400px",
      "width": "100%"
    }
  }
}
```

### Toast Tokens
```json
{
  "toast": {
    "success": {
      "background": "success.50",
      "border": "success.200",
      "text": "success.800",
      "icon": "success.500",
      "shadow": "lg",
      "padding": "4",
      "borderRadius": "md",
      "transition": "all base ease"
    },
    "error": {
      "background": "error.50",
      "border": "error.200",
      "text": "error.800",
      "icon": "error.500",
      "shadow": "lg",
      "padding": "4",
      "borderRadius": "md",
      "transition": "all base ease"
    },
    "warning": {
      "background": "warning.50",
      "border": "warning.200",
      "text": "warning.800",
      "icon": "warning.500",
      "shadow": "lg",
      "padding": "4",
      "borderRadius": "md",
      "transition": "all base ease"
    }
  }
}
```

---

## ACCESSIBILITY TOKENS

### Focus Tokens
```json
{
  "focus": {
    "ring": {
      "width": "2px",
      "color": "primary.500",
      "offset": "2px",
      "style": "solid"
    },
    "outline": "none"
  }
}
```

### Contrast Tokens
```json
{
  "contrast": {
    "text": {
      "normal": "4.5:1",
      "large": "3:1"
    },
    "ui": {
      "minimum": "3:1"
    }
  }
}
```

### Touch Target Tokens
```json
{
  "touchTarget": {
    "minimum": "44px",
    "recommended": "48px"
  }
}
```

---

## USAGE EXAMPLES

### Tailwind CSS Classes
```css
/* Primary Button */
.btn-primary {
  @apply bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* Input Field */
.input-field {
  @apply w-full px-4 py-3 border border-neutral-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200 placeholder-neutral-400;
}

/* Error Input */
.input-error {
  @apply border-error-500 focus:border-error-500 focus:ring-error-500;
}

/* Card */
.card-auth {
  @apply bg-white border border-neutral-200 rounded-lg shadow-lg p-8 max-w-md w-full;
}

/* Toast Success */
.toast-success {
  @apply bg-success-50 border border-success-200 text-success-800 p-4 rounded-md shadow-lg;
}
```

### CSS Custom Properties
```css
:root {
  /* Colors */
  --color-primary-500: #3B82F6;
  --color-success-500: #10B981;
  --color-error-500: #EF4444;
  --color-warning-500: #F59E0B;
  
  /* Spacing */
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  
  /* Typography */
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  
  /* Shadows */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-base: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## IMPLEMENTATION NOTES

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
          // ... altri colori
        },
        success: {
          50: '#F0FDF4',
          500: '#10B981',
          // ... altri colori
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '4': '16px',
        '6': '24px',
        '8': '32px',
      }
    }
  }
}
```

### Component Implementation
```jsx
// Esempio LoginForm con design tokens
const LoginForm = () => {
  return (
    <div className="card-auth">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Accedi al sistema
      </h1>
      <p className="text-gray-600 mb-6">
        Gestione sicurezza alimentare HACCP
      </p>
      
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            className="input-field"
            placeholder="mario@esempio.com"
          />
        </div>
        
        <button type="submit" className="btn-primary w-full">
          Accedi
        </button>
      </form>
    </div>
  )
}
```

---

**FIRMA**: Agente 3 - Experience & Interface Designer  
**Data**: 2025-10-20  
**Status**: ✅ COMPLETATO - Pronto per component specifications
