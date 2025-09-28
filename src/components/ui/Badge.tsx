import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const badgeVariants = tv({
  base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  variants: {
    variant: {
      default:
        'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary:
        'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive:
        'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline: 'border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
      muted: 'border-transparent bg-muted text-muted-foreground',
    },
    tone: {
      neutral: '',
      success: 'border-green-200 bg-green-100 text-green-700',
      warning: 'border-amber-200 bg-amber-100 text-amber-800',
      danger: 'border-red-200 bg-red-100 text-red-800',
      info: 'border-blue-200 bg-blue-100 text-blue-700',
    },
    size: {
      sm: 'px-2 py-0.5 text-[11px]',
      md: 'px-2.5 py-0.5 text-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
    tone: 'neutral',
    size: 'md',
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, tone, size, ...props }, ref) => (
    <span
      ref={ref}
      className={badgeVariants({ variant, tone, size, className })}
      {...props}
    />
  )
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
