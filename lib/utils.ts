import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes safely.
 * Solves the problem of clashing Tailwind CSS classes.
 * Combines clsx for conditional classes and tailwind-merge for overriding.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
