import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/**
 * Actually enforces numeric-only input by sanitizing each keystroke,
 * unlike the old purely-cosmetic `numeric` flag (which only changed
 * direction/font — `inputMode` alone is just a mobile-keyboard hint and
 * never blocked desktop typing or pasting).
 *
 *   - `integer`: digits only (year, odometer, initial odometer km)
 *   - `decimal`: digits + at most one `.` (liters, total price, tank capacity)
 *   - `plate`: digits + dashes (Israeli license plates, e.g. "12-345-67" —
 *     NOT pure numeric, so this must stay separate from `integer`)
 */
export type NumericKind = 'decimal' | 'integer' | 'plate';

const sanitizeForKind = (value: string, kind: NumericKind): string => {
  if (kind === 'integer') return value.replace(/\D/g, '');
  if (kind === 'plate') return value.replace(/[^\d-]/g, '');

  let seenDot = false;
  let result = '';
  for (const char of value) {
    if (char >= '0' && char <= '9') {
      result += char;
    } else if (char === '.' && !seenDot) {
      seenDot = true;
      result += char;
    }
  }
  return result;
};

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  /** Renders mono/LTR (odometer, liters, price, dates) without enforcing input — see `numericKind` for real enforcement. */
  numeric?: boolean;
  /** Enforces numeric-only input by sanitizing keystrokes/pastes; also implies the LTR/mono styling `numeric` gives. */
  numericKind?: NumericKind;
  unit?: string;
  warning?: boolean;
}

export const TextInput = ({
  className,
  hint,
  id,
  inputMode,
  label,
  numeric,
  numericKind,
  onChange,
  unit,
  warning,
  ...props
}: TextInputProps) => {
  const isLtr = numeric || Boolean(numericKind);
  const effectiveInputMode =
    numericKind === 'integer' ? 'numeric' : numericKind === 'decimal' ? 'decimal' : inputMode;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (numericKind) {
      const sanitized = sanitizeForKind(event.target.value, numericKind);
      if (sanitized !== event.target.value) {
        event.target.value = sanitized;
      }
    }
    onChange?.(event);
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-on-surface-variant">{label}</span>
      <span className="relative flex items-center">
        <input
          id={id}
          dir={isLtr ? 'ltr' : 'rtl'}
          inputMode={effectiveInputMode}
          className={cn(
            'w-full rounded-md border border-ghost-strong bg-surface-container text-right px-4 py-3.5 text-base text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:shadow-glow-amber focus:outline-none',
            isLtr ? 'font-mono' : 'font-hebrew',
            className,
          )}
          onChange={handleChange}
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
};
