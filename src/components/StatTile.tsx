import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  className?: string;
  unit?: string;
}

export const StatTile = ({ className, label, unit, value }: StatTileProps) => (
  <div
    className={cn(
      'flex flex-col gap-1.5 rounded-lg border border-ghost bg-surface-container p-4',
      className,
    )}
  >
    <span className="text-xs font-medium text-on-surface-variant">{label}</span>
    <span className="ltr-num text-[22px] leading-7 font-semibold tracking-tight text-on-surface">
      {value}
      {unit && <span className="ms-1 text-xs font-normal text-on-surface-variant">{unit}</span>}
    </span>
  </div>
);
