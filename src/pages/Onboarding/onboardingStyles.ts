import { cva } from 'class-variance-authority';

export const onboardingActions = cva('flex flex-col gap-3');

export const onboardingBody = cva('text-sm leading-6 text-on-surface-variant');

export const onboardingErrorText = cva('text-sm text-tertiary');

export const onboardingEyebrow = cva('text-xs font-medium tracking-[0.18em] text-primary/80');

export const onboardingHeroCard = cva('flex flex-col gap-4');

export const onboardingLead = cva('text-sm leading-6 text-on-surface');

export const onboardingPage = cva('flex min-h-[70svh] flex-col justify-center gap-6');

export const onboardingSectionCard = cva('flex flex-col gap-4');

export const onboardingTitle = cva('text-2xl leading-9 font-semibold text-on-surface');
