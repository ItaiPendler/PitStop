import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines conditional class names (clsx) and resolves Tailwind conflicts
 * (tailwind-merge). Use this in every component instead of manual string
 * concatenation, so callers can override classes via a `className` prop
 * without producing duplicate/conflicting utility classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
