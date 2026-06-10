import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn() — helper untuk merge Tailwind class names dengan deduplication.
 *
 * Usage:
 *   cn('px-4 py-2', condition && 'bg-primary-700', otherClasses)
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
