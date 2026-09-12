import { cva } from 'class-variance-authority';

export const aboutBody = cva('text-sm leading-6 text-on-surface-variant');

export const aboutChipRow = cva('flex flex-wrap gap-2');

export const aboutGrid = cva('grid gap-3 sm:grid-cols-2');

export const aboutHeroCard = cva('flex flex-col gap-4');

export const aboutHeroLead = cva('text-sm leading-6 text-on-surface');

export const aboutHeroTitle = cva('text-2xl leading-9 font-semibold text-on-surface');

export const aboutInfoCard = cva('flex flex-col gap-2 p-4');

export const aboutInfoLabel = cva('text-xs font-medium text-on-surface-variant');

export const aboutInfoValue = cva('text-sm leading-6 font-medium text-on-surface');

export const aboutList = cva(
  'flex flex-col gap-2 text-sm leading-6 text-on-surface-variant marker:text-primary',
);

export const aboutPage = cva('flex flex-col gap-6');

export const aboutSectionCard = cva('flex flex-col gap-4');

export const aboutSectionEyebrow = cva('text-xs font-medium tracking-[0.18em] text-primary/80');

export const aboutSectionTitle = cva('text-lg leading-7 font-semibold text-on-surface');

export const aboutStepItem = cva(
  'flex items-start gap-3 rounded-lg border border-ghost bg-black/10 p-3',
);

export const aboutStepNumber = cva(
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-on-primary',
);

export const aboutStepText = cva('pt-0.5 text-sm leading-6 text-on-surface');
