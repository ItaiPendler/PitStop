import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

const cardVariants = cva('rounded-lg border border-ghost p-6', {
  defaultVariants: { variant: 'default' },
  variants: {
    variant: {
      default: 'bg-surface-container',
      elevated: 'bg-surface-container-high shadow-elevated',
      hero: 'bg-linear-to-br from-surface-container-high to-surface-container shadow-elevated',
    },
  },
})

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = ({ className, variant, ...props }: CardProps) => (
  <div className={cn(cardVariants({ variant }), className)} {...props} />
)
