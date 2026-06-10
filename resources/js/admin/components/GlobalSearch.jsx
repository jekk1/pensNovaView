import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Search, Building2, Users, Lightbulb, FlaskConical, FileText, MessageSquare,
    Award, X, Command, ArrowRight,
} from 'lucide-react';
import api from '../../lib/api';

const TYPE_META = {
    tenant: { icon: Building2, tone: 'emerald', label: 'Tenant' },
    user: { icon: Users, tone: 'sky', label: 'User' },
    patent: { icon: Lightbulb, tone: 'amber', label: 'Paten/HKI' },
    product: { icon: FlaskConical, tone: 'violet', label: 'Produk Dosen' },
    application: { icon: FileText, tone: 'sky', label: 'Pendaftaran' },
    inquiry: { icon: MessageSquare, tone: 'rose', label: 'Inquiry' },
    certificate: { icon: Award, tone: 'amber', label: 'Sertifikat' },
};

const TONE_CLASS = {
    emerald: 'text-emerald-600 bg-emerald-50',
    sky: 'text-sky-600 bg-sky-50',
    amber: 'text-amber-600 bg-amber-50',
    violet: 'text-violet-600 bg-violet-50',
    rose: 'text-rose-600 bg-rose-50',
};

/**
 * Cmd/Ctrl+K palette untuk cross-resource search di admin.
 * Debounced 200ms — hit /api/admin/search.
 */
export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [debouncedQ, setDebouncedQ] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Cmd/Ctrl + K to open
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((o) => !o);
            } else if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Auto-focus input when opening
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
        else setQ('');
    }, [open]);

    // Debounce query
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQ(q), 200);
        return () => clearTimeout(t);
    }, [q]);

    const { data, isFetching } = useQuery({
        queryKey: ['admin', 'search', debouncedQ],
        queryFn: () => api.get('/api/admin/search', { params: { q: debouncedQ } }).then((r) => r.data),
        enabled: debouncedQ.length >= 2,
        keepPreviousData: true,
    });

    const grouped = data?.data ?? {};
    const total = data?.total ?? 0;

    const navigateTo = (link) => {
        setOpen(false);
        navigate(link);
    };

    return (
        <>
            {/* Trigger button — visible di header */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-xs text-slate-500"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cari…</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600">
                    <Command className="h-2.5 w-2.5" /> K
                </kbd>
            </button>

            {/* Dialog */}
            {open && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-[100] flex items-start justify-center pt-20 sm:pt-32 px-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center px-4 py-3 border-b border-slate-200">
                            <Search className="h-5 w-5 text-slate-400 mr-2" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari tenant, user, paten, produk, sertifikat, inquiry…"
                                className="flex-1 outline-none text-sm"
                            />
                            <kbd className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">ESC</kbd>
                            <button onClick={() => setOpen(false)} className="ml-2 text-slate-400 hover:text-slate-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {q.length < 2 && (
                                <div className="p-8 text-center text-sm text-slate-500">
                                    Ketik minimal 2 karakter untuk mulai cari.
                                </div>
                            )}
                            {q.length >= 2 && isFetching && (
                                <div className="p-8 text-center text-sm text-slate-500">Mencari…</div>
                            )}
                            {q.length >= 2 && ! isFetching && total === 0 && (
                                <div className="p-8 text-center text-sm text-slate-500">
                                    Tidak ada hasil untuk "<strong>{q}</strong>".
                                </div>
                            )}

                            {Object.entries(grouped).map(([type, items]) => {
                                if (! items || items.length === 0) return null;
                                const meta = TYPE_META[items[0]?.type] ?? {};
                                const Icon = meta.icon;
                                return (
                                    <div key={type}>
                                        <div className="px-4 py-2 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                            {meta.label || type} · {items.length}
                                        </div>
                                        {items.map((item, i) => (
                                            <button
                                                key={`${type}-${i}`}
                                                onClick={() => navigateTo(item.link)}
                                                className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 transition group"
                                            >
                                                {Icon && (
                                                    <div className={`p-1.5 rounded ${TONE_CLASS[meta.tone] ?? 'text-slate-600 bg-slate-100'}`}>
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm text-slate-900 truncate">{item.title}</div>
                                                    {item.subtitle && (
                                                        <div className="text-xs text-slate-500 truncate">{item.subtitle}</div>
                                                    )}
                                                </div>
                                                {item.badge && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition" />
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        {total > 0 && (
                            <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
                                {total} hasil di {Object.values(grouped).filter((g) => g.length > 0).length} kategori
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
