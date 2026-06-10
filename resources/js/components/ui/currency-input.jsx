import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

// Format angka ke ribuan ID (mis. 10000000 → "10.000.000"). Hanya integer rupiah.
const formatID = (n) => {
    if (n === '' || n === null || n === undefined) return '';
    const digits = String(n).replace(/\D/g, '');
    return digits === '' ? '' : Number(digits).toLocaleString('id-ID');
};

/**
 * Input uang Rupiah: tampil dengan pemisah ribuan + prefix "Rp",
 * tapi memanggil onChange dengan NILAI NUMERIK mentah (Number | '').
 *
 * <CurrencyInput value={form.value} onChange={(v) => setField('value', v)} />
 */
const CurrencyInput = forwardRef(({ className, value, onChange, prefix = 'Rp', ...props }, ref) => (
    <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none">{prefix}</span>
        <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={formatID(value)}
            onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                onChange?.(digits === '' ? '' : Number(digits));
            }}
            className={cn(
                'flex h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm',
                'placeholder:text-slate-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:border-primary-400',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    </div>
));
CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
