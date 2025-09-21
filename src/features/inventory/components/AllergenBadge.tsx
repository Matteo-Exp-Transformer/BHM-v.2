import { AlertTriangle } from 'lucide-react'
import { AllergenType } from '@/types/inventory'

interface AllergenBadgeProps {
  allergen: AllergenType
  size?: 'sm' | 'md' | 'lg'
}

const ALLERGEN_LABELS: Record<AllergenType, string> = {
  [AllergenType.GLUTINE]: 'Glutine',
  [AllergenType.LATTE]: 'Latte',
  [AllergenType.UOVA]: 'Uova',
  [AllergenType.SOIA]: 'Soia',
  [AllergenType.FRUTTA_GUSCIO]: 'Frutta a guscio',
  [AllergenType.ARACHIDI]: 'Arachidi',
  [AllergenType.PESCE]: 'Pesce',
  [AllergenType.CROSTACEI]: 'Crostacei',
}

const ALLERGEN_COLORS: Record<AllergenType, string> = {
  [AllergenType.GLUTINE]: 'bg-yellow-100 text-yellow-800',
  [AllergenType.LATTE]: 'bg-blue-100 text-blue-800',
  [AllergenType.UOVA]: 'bg-orange-100 text-orange-800',
  [AllergenType.SOIA]: 'bg-green-100 text-green-800',
  [AllergenType.FRUTTA_GUSCIO]: 'bg-purple-100 text-purple-800',
  [AllergenType.ARACHIDI]: 'bg-red-100 text-red-800',
  [AllergenType.PESCE]: 'bg-cyan-100 text-cyan-800',
  [AllergenType.CROSTACEI]: 'bg-pink-100 text-pink-800',
}

export function AllergenBadge({ allergen, size = 'md' }: AllergenBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${ALLERGEN_COLORS[allergen]}`}
      title={`Allergene: ${ALLERGEN_LABELS[allergen]}`}
    >
      <AlertTriangle className={iconSizes[size]} />
      {ALLERGEN_LABELS[allergen]}
    </span>
  )
}
