import { cva } from 'class-variance-authority';

export const settingsCarCard = cva('flex items-center justify-between gap-3');

export const settingsCarDetails = cva('text-xs leading-5 text-on-surface-variant');

export const settingsCarLabel = cva('text-sm font-semibold text-on-surface');

export const settingsCarList = cva('flex flex-col gap-3');

export const settingsCarRow = cva(
  'w-full rounded-lg border bg-surface-container-low p-4 text-right transition-colors focus:outline-none focus-visible:border-primary focus-visible:shadow-glow-amber',
  {
    defaultVariants: {
      active: false,
    },
    variants: {
      active: {
        false: 'border-ghost hover:border-ghost-strong',
        true: 'border-primary/70 bg-surface-container-high shadow-elevated',
      },
    },
  },
);

export const settingsFieldGrid = cva('grid gap-3 sm:grid-cols-2');

export const settingsInlineHint = cva('text-xs leading-5 text-on-surface-variant');

export const settingsInlineSuccess = cva('text-sm leading-6 text-secondary');

export const settingsLink = cva(
  'text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary/80',
);

export const settingsLocaleValue = cva('font-mono text-sm text-on-surface');

export const settingsMetaGrid = cva('grid gap-3 sm:grid-cols-2');

export const settingsPage = cva('flex flex-col gap-6');

export const settingsReadonlyCard = cva('flex flex-col gap-2 p-4');

export const settingsReadonlyLabel = cva('text-xs font-medium text-on-surface-variant');

export const settingsReadonlyValue = cva('text-sm leading-6 font-medium text-on-surface');

export const settingsSectionBody = cva('text-sm leading-6 text-on-surface-variant');

export const settingsSectionCard = cva('flex flex-col gap-4');

export const settingsSectionEyebrow = cva('text-xs font-medium tracking-[0.18em] text-primary/80');

export const settingsSectionHeader = cva('flex flex-col gap-2');

export const settingsSectionTitle = cva('text-lg leading-7 font-semibold text-on-surface');

export const settingsStatusRow = cva(
  'flex items-start justify-between gap-3 rounded-lg border border-ghost bg-black/10 p-4',
);
