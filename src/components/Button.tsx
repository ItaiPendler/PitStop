import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md font-hebrew text-[15px] font-semibold transition-transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      fullWidth: false,
      variant: 'primary',
    },
    variants: {
      fullWidth: {
        false: '',
        true: 'w-full',
      },
      variant: {
        primary: 'bg-primary text-on-primary shadow-glow-amber',
        secondary: 'border border-ghost-strong bg-transparent text-on-surface',
      },
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = ({ className, fullWidth, variant, ...props }: ButtonProps) => (
  <button className={cn(buttonVariants({ fullWidth, variant }), className)} {...props} />
);
