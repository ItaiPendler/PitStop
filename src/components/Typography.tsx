import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type EyebrowProps = ComponentPropsWithoutRef<'span'>;

export const Eyebrow = ({ className, ...props }: EyebrowProps) => (
  <span
    className={cn('text-xs font-medium tracking-[0.18em] text-primary/80', className)}
    {...props}
  />
);

export type PageTitleProps = ComponentPropsWithoutRef<'h1'>;

export const PageTitle = ({ className, ...props }: PageTitleProps) => (
  <h1 className={cn('text-2xl leading-9 font-semibold text-on-surface', className)} {...props} />
);

export type BodyTextProps = ComponentPropsWithoutRef<'p'>;

export const BodyText = ({ className, ...props }: BodyTextProps) => (
  <p className={cn('text-sm leading-6 text-on-surface', className)} {...props} />
);

export type SectionTitleProps = ComponentPropsWithoutRef<'h2'>;

export const SectionTitle = ({ className, ...props }: SectionTitleProps) => (
  <h2 className={cn('text-lg leading-7 font-semibold text-on-surface', className)} {...props} />
);

export type SectionBodyProps = ComponentPropsWithoutRef<'p'>;

export const SectionBody = ({ className, ...props }: SectionBodyProps) => (
  <p
    className={cn('text-sm leading-6 text-on-surface-variant', className)}
    {...props}
  />
);

export type FieldLabelProps = ComponentPropsWithoutRef<'span'>;

export const FieldLabel = ({ className, ...props }: FieldLabelProps) => (
  <span className={cn('text-xs font-medium text-on-surface-variant', className)} {...props} />
);

export type FieldValueProps = ComponentPropsWithoutRef<'p'>;

export const FieldValue = ({ className, ...props }: FieldValueProps) => (
  <p
    className={cn('text-sm leading-6 font-medium text-on-surface', className)}
    {...props}
  />
);
