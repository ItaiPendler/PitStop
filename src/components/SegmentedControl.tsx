import { cn } from '../lib/cn'

export interface SegmentedOption<T extends string> {
  label: string
  value: T
}

export interface SegmentedControlProps<T extends string> {
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  value: T
  className?: string
}

export const SegmentedControl = <T extends string>({
  className,
  onChange,
  options,
  value,
}: SegmentedControlProps<T>) => (
  <div className={cn('flex gap-1 rounded-full border border-ghost bg-surface-container p-1', className)}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={cn(
          'flex-1 rounded-full py-2 text-center text-[13px] font-medium text-on-surface-variant',
          opt.value === value && 'bg-primary font-semibold text-on-primary',
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
)
