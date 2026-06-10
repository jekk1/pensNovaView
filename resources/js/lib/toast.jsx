import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Toast notification system — replace native alert() / confirm().
 *
 * Pemakaian:
 *   const toast = useToast();
 *   toast.success('Data berhasil disimpan');
 *   toast.error('Gagal: ' + formatApiError(err));
 *   toast.info('Memproses…');
 *   toast.warning('Sesi akan segera berakhir');
 *
 * Auto-dismiss 4 detik (8 detik untuk error). Stacking di pojok kanan atas.
 * Akses keyboard: pencet ESC untuk dismiss semua.
 */

const ToastContext = createContext(null);

let toastIdSeq = 0;

const VARIANT_STYLES = {
    success: { bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-900', icon: '✓', iconBg: 'bg-emerald-500' },
    error:   { bg: 'bg-rose-50',    ring: 'ring-rose-200',    text: 'text-rose-900',    icon: '✕', iconBg: 'bg-rose-500' },
    warning: { bg: 'bg-amber-50',   ring: 'ring-amber-200',   text: 'text-amber-900',   icon: '!', iconBg: 'bg-amber-500' },
    info:    { bg: 'bg-sky-50',     ring: 'ring-sky-200',     text: 'text-sky-900',     icon: 'i', iconBg: 'bg-sky-500' },
};

const DEFAULT_TIMEOUT = { success: 4000, info: 4000, warning: 6000, error: 8000 };

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef(new Map());

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const dismissAll = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current.clear();
        setToasts([]);
    }, []);

    const show = useCallback((variant, message, opts = {}) => {
        const id = ++toastIdSeq;
        const timeout = opts.timeout ?? DEFAULT_TIMEOUT[variant] ?? 4000;
        setToasts((prev) => [...prev, { id, variant, message, title: opts.title }]);
        if (timeout > 0) {
            const t = setTimeout(() => dismiss(id), timeout);
            timersRef.current.set(id, t);
        }
        return id;
    }, [dismiss]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && toasts.length > 0) dismissAll();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [toasts.length, dismissAll]);

    const api = useMemo(() => ({
        success: (msg, opts) => show('success', msg, opts),
        error:   (msg, opts) => show('error', msg, opts),
        warning: (msg, opts) => show('warning', msg, opts),
        info:    (msg, opts) => show('info', msg, opts),
        dismiss,
        dismissAll,
    }), [show, dismiss, dismissAll]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div
                className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-96 pointer-events-none"
                role="region"
                aria-label="Notifikasi"
                aria-live="polite"
            >
                {toasts.map((t) => {
                    const s = VARIANT_STYLES[t.variant] || VARIANT_STYLES.info;
                    return (
                        <div
                            key={t.id}
                            role={t.variant === 'error' ? 'alert' : 'status'}
                            className={`pointer-events-auto ${s.bg} ${s.text} ring-1 ${s.ring} rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 animate-slide-in-right`}
                        >
                            <div className={`flex-shrink-0 w-6 h-6 ${s.iconBg} text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5`}>
                                {s.icon}
                            </div>
                            <div className="flex-1 min-w-0 text-sm">
                                {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
                                <div className="break-words">{t.message}</div>
                            </div>
                            <button
                                onClick={() => dismiss(t.id)}
                                className="flex-shrink-0 text-slate-500 hover:text-slate-700 text-lg leading-none"
                                aria-label="Tutup"
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast harus di dalam <ToastProvider>');
    return ctx;
}
