import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => (
    <input
        ref={ref}
        type={type}
        className={cn(
            'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm',
            'placeholder:text-slate-400 file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:border-primary-400',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
        )}
        {...props}
    />
));
Input.displayName = 'Input';

export { Input };
