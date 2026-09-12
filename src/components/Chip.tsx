import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

const chipVariants = cva('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', {
  defaultVariants: { status: 'optimal' },
  variants: {
    status: {
      caution: 'bg-tertiary/15 text-tertiary',
      optimal: 'bg-secondary/15 text-secondary',
    },
  },
})

export interface ChipProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

export const Chip = ({ children, className, status, ...props }: ChipProps) => (
  <span className={cn(chipVariants({ status }), className)} {...props}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </span>
)
