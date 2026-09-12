import { cn } from '../lib/cn';

export interface FuelRowProps {
  costLabel: string;
  date: string;
  efficiencyLabel: string;
  meta: string;
  status: 'good' | 'warn';
  onClick?: () => void;
}

export const FuelRow = ({
  costLabel,
  date,
  efficiencyLabel,
  meta,
  onClick,
  status,
}: FuelRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-4 rounded-lg border border-ghost bg-surface-container p-4 text-start"
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-container-highest text-lg">
      ⛽
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium">{date}</span>
      <span className="ltr-num mt-0.5 block text-xs text-on-surface-variant">{meta}</span>
    </span>
    <span className="shrink-0 text-start">
      <span
        className={cn(
          'ltr-num block text-[15px] font-semibold',
          status === 'good' ? 'text-secondary' : 'text-tertiary',
        )}
      >
        {efficiencyLabel}
      </span>
      <span className="ltr-num mt-0.5 block text-xs text-on-surface-variant">{costLabel}</span>
    </span>
  </button>
);
