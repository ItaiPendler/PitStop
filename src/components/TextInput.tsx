import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  /** Numeric fields render mono/LTR (odometer, liters, price); text fields render RTL. */
  numeric?: boolean;
  unit?: string;
  warning?: boolean;
}

export const TextInput = ({
  className,
  hint,
  id,
  label,
  numeric,
  unit,
  warning,
  ...props
}: TextInputProps) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[13px] font-medium text-on-surface-variant">{label}</span>
    <span className="relative flex items-center">
      <input
        id={id}
        dir={numeric ? 'ltr' : 'rtl'}
        className={cn(
          'w-full rounded-md border border-ghost-strong bg-surface-container px-4 py-3.5 text-base text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:shadow-glow-amber focus:outline-none',
          numeric ? 'text-left font-mono' : 'text-right font-hebrew',
          className,
        )}
        {...props}
      />
      {unit && (
        <span className="pointer-events-none absolute left-4 font-mono text-[13px] text-on-surface-variant">
          {unit}
        </span>
      )}
    </span>
    {hint && (
      <span className={cn('text-xs', warning ? 'text-tertiary' : 'text-on-surface-variant')}>
        {hint}
      </span>
    )}
  </label>
);
