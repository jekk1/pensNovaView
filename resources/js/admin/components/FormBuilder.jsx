import { useState, useEffect } from 'react';
import Spinner from '../../components/Spinner';
import { CurrencyInput } from '../../components/ui/currency-input';

/**
 * FormBuilder — declarative form untuk admin pages.
 *
 * fields = [
 *   { name: 'name', label: 'Nama', type: 'text', required: true, placeholder: '...' },
 *   { name: 'email', label: 'Email', type: 'email' },
 *   { name: 'description', label: 'Deskripsi', type: 'textarea', rows: 4 },
 *   { name: 'sector', label: 'Sektor', type: 'select', options: [{value, label}] },
 *   { name: 'roles', label: 'Roles', type: 'multiselect', options: [...] },
 *   { name: 'is_active', label: 'Aktif', type: 'toggle' },
 *   { name: 'color_hex', label: 'Warna', type: 'color' },
 *   { name: 'icon', label: 'Icon (emoji)', type: 'text', maxLength: 8 },
 *   { name: 'tags', label: 'Tags', type: 'tags' }, // array of strings, comma-separated
 *   { name: 'sort_order', label: 'Urutan', type: 'number' },
 *   { name: 'start_date', label: 'Mulai', type: 'date' },
 *   { name: 'kpi_snapshot', label: 'KPI', type: 'json' },
 * ]
 *
 * onSubmit(values) → return Promise. Pada error, throw error dengan response.errors untuk display.
 */
export default function FormBuilder({
    fields,
    initial = {},
    onSubmit,
    onCancel,
    submitLabel = 'Simpan',
    layout = 'two-col', // 'two-col' or 'one-col'
}) {
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        const init = {};
        fields.forEach((f) => {
            init[f.name] = initial[f.name] ?? f.default ?? defaultForType(f.type);
        });
        setValues(init);
    }, [JSON.stringify(initial), fields.map((f) => f.name).join(',')]);

    function setField(name, value) {
        setValues((v) => ({ ...v, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        setSubmitting(true);

        // Normalisasi nilai (json string → object, dst)
        const payload = {};
        for (const f of fields) {
            let val = values[f.name];
            if (f.type === 'json' && typeof val === 'string') {
                try { val = val.trim() ? JSON.parse(val) : null; }
                catch { setErrors({ [f.name]: ['Format JSON tidak valid'] }); setSubmitting(false); return; }
            }
            if (f.type === 'tags' && typeof val === 'string') {
                val = val.split(',').map((s) => s.trim()).filter(Boolean);
            }
            if (f.type === 'number' && val !== null && val !== '' && val !== undefined) {
                val = Number(val);
            }
            payload[f.name] = val;
        }

        try {
            await onSubmit(payload);
        } catch (err) {
            const data = err.response?.data;
            setErrors(data?.errors || {});
            setGeneralError(data?.message || 'Gagal menyimpan. Periksa isian Anda.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {generalError && (
                <div className="p-3 rounded-lg bg-rose-50 ring-1 ring-rose-200 text-sm text-rose-800">{generalError}</div>
            )}

            <div className={`grid gap-4 ${layout === 'two-col' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {fields.map((f) => (
                    <FieldRenderer
                        key={f.name}
                        field={f}
                        value={values[f.name]}
                        onChange={(v) => setField(f.name, v)}
                        error={errors[f.name]?.[0]}
                    />
                ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm">
                        Batal
                    </button>
                )}
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm disabled:opacity-60">
                    {submitting && <Spinner className="h-4 w-4" />}
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

function FieldRenderer({ field, value, onChange, error }) {
    const cls = `w-full px-3 py-2 rounded-lg border ${error ? 'border-rose-400' : 'border-slate-300'} text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400`;

    const wrapperClass = field.fullWidth ? 'sm:col-span-2' : '';

    const label = (
        <label className="block text-sm font-medium mb-1 text-slate-700">
            {field.label}
            {field.required && <span className="text-rose-500"> *</span>}
        </label>
    );

    const errorEl = error && <p className="mt-1 text-xs text-rose-600">{error}</p>;
    const helpEl = field.help && <p className="mt-1 text-xs text-slate-500">{field.help}</p>;

    if (field.type === 'textarea' || field.type === 'json') {
        return (
            <div className={wrapperClass + ' sm:col-span-2'}>
                {label}
                <textarea
                    rows={field.rows || (field.type === 'json' ? 5 : 3)}
                    value={field.type === 'json' && typeof value === 'object' ? JSON.stringify(value || null, null, 2) : (value ?? '')}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className={`${cls} font-${field.type === 'json' ? 'mono text-xs' : 'sans'}`}
                />
                {helpEl}{errorEl}
            </div>
        );
    }

    if (field.type === 'select') {
        return (
            <div className={wrapperClass}>
                {label}
                <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cls}>
                    {!field.required && <option value="">— pilih —</option>}
                    {(field.options || []).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {helpEl}{errorEl}
            </div>
        );
    }

    if (field.type === 'multiselect') {
        const arr = Array.isArray(value) ? value : [];
        return (
            <div className={wrapperClass + ' sm:col-span-2'}>
                {label}
                <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-slate-300 min-h-[2.5rem]">
                    {(field.options || []).map((opt) => {
                        const selected = arr.includes(opt.value);
                        return (
                            <button
                                type="button"
                                key={opt.value}
                                onClick={() => {
                                    if (selected) onChange(arr.filter((v) => v !== opt.value));
                                    else onChange([...arr, opt.value]);
                                }}
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${selected ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
                {helpEl}{errorEl}
            </div>
        );
    }

    if (field.type === 'toggle') {
        return (
            <div className={wrapperClass}>
                <label className="flex items-center gap-2 mt-6 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-700"
                    />
                    <span className="text-sm font-medium text-slate-700">{field.label}</span>
                </label>
                {helpEl}{errorEl}
            </div>
        );
    }

    if (field.type === 'color') {
        return (
            <div className={wrapperClass}>
                {label}
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={value || '#6366f1'}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#6366f1"
                        className={cls + ' font-mono text-xs'}
                    />
                </div>
                {helpEl}{errorEl}
            </div>
        );
    }

    if (field.type === 'tags') {
        return (
            <div className={wrapperClass + ' sm:col-span-2'}>
                {label}
                <input
                    type="text"
                    value={Array.isArray(value) ? value.join(', ') : (value || '')}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || 'tag1, tag2, tag3'}
                    className={cls}
                />
                {(helpEl || <p className="mt-1 text-xs text-slate-500">Pisahkan dengan koma</p>)}
                {errorEl}
            </div>
        );
    }

    if (field.type === 'currency') {
        return (
            <div className={wrapperClass}>
                {label}
                <CurrencyInput value={value ?? ''} onChange={(v) => onChange(v)} placeholder={field.placeholder} />
                {helpEl}{errorEl}
            </div>
        );
    }

    // Default: text / number / email / date / password / etc
    return (
        <div className={wrapperClass}>
            {label}
            <input
                type={field.type || 'text'}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                min={field.min}
                max={field.max}
                step={field.step}
                className={cls}
            />
            {helpEl}{errorEl}
        </div>
    );
}

function defaultForType(type) {
    if (type === 'toggle') return false;
    if (type === 'multiselect' || type === 'tags') return [];
    if (type === 'json') return null;
    if (type === 'number') return '';
    return '';
}
