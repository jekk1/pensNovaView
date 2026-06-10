import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import Spinner from '../../components/Spinner';

const STATUS_META = {
    draft:        { label: 'Draft',        color: 'bg-slate-100 text-slate-700',   ring: 'ring-slate-300',   dot: 'bg-slate-400' },
    submitted:    { label: 'Submitted',    color: 'bg-blue-50 text-blue-700',     ring: 'ring-blue-300',    dot: 'bg-blue-500' },
    under_review: { label: 'Under Review', color: 'bg-amber-50 text-amber-700',   ring: 'ring-amber-300',   dot: 'bg-amber-500' },
    shortlisted:  { label: 'Shortlisted',  color: 'bg-violet-50 text-violet-700', ring: 'ring-violet-300',  dot: 'bg-violet-500' },
    accepted:     { label: 'Accepted',     color: 'bg-emerald-50 text-emerald-700', ring: 'ring-emerald-400', dot: 'bg-emerald-500' },
    rejected:     { label: 'Rejected',     color: 'bg-rose-50 text-rose-700',     ring: 'ring-rose-300',    dot: 'bg-rose-500' },
};

const KANBAN_ORDER = ['submitted', 'under_review', 'shortlisted', 'accepted', 'rejected'];

export default function Applications() {
    const qc = useQueryClient();
    const [view, setView] = useState('kanban'); // 'kanban' | 'list'
    const [batchId, setBatchId] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [aiFilter, setAiFilter] = useState('');
    const [q, setQ] = useState('');
    const [selected, setSelected] = useState(null); // application detail open
    const [bulkSelected, setBulkSelected] = useState([]); // array of ids

    // Batches lookup
    const { data: batchesData } = useQuery({
        queryKey: ['admin', 'applications', 'batches'],
        queryFn: () => api.get('/api/admin/applications-batches').then((r) => r.data.data),
        staleTime: 5 * 60_000,
    });

    // Stats
    const { data: stats } = useQuery({
        queryKey: ['admin', 'applications', 'stats', { batchId }],
        queryFn: () => api.get('/api/admin/applications-stats', { params: { batch_id: batchId || undefined } }).then((r) => r.data),
    });

    // Applications list (lebih lebar limit untuk kanban)
    const { data: list, isFetching } = useQuery({
        queryKey: ['admin', 'applications', { batchId, statusFilter, aiFilter, q, view }],
        queryFn: () =>
            api.get('/api/admin/applications', {
                params: {
                    batch_id: batchId || undefined,
                    status: statusFilter || undefined,
                    ai_recommendation: aiFilter || undefined,
                    q: q || undefined,
                    per_page: view === 'kanban' ? 200 : 25,
                },
            }).then((r) => r.data),
    });

    function refresh() {
        qc.invalidateQueries({ queryKey: ['admin', 'applications'] });
    }

    // Key list yang persis sama dengan useQuery di atas — dipakai optimistic update DnD.
    const listKey = ['admin', 'applications', { batchId, statusFilter, aiFilter, q, view }];

    // Pindah status via drag-and-drop kanban (optimistic: kartu langsung pindah).
    const moveMutation = useMutation({
        mutationFn: ({ id, status }) => api.patch(`/api/admin/applications/${id}`, { status }),
        onMutate: async ({ id, status }) => {
            await qc.cancelQueries({ queryKey: listKey });
            const prev = qc.getQueryData(listKey);
            qc.setQueryData(listKey, (old) => {
                if (!old?.data) return old;
                return { ...old, data: old.data.map((a) => (a.id === id ? { ...a, status } : a)) };
            });
            return { prev };
        },
        onError: (e, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData(listKey, ctx.prev);
            alert(apiErrorMessage(e) || 'Gagal memindahkan kartu.');
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'applications'] }),
    });

    function handleMove(id, status) {
        moveMutation.mutate({ id, status });
    }

    const grouped = useMemo(() => {
        const result = Object.fromEntries(KANBAN_ORDER.map((s) => [s, []]));
        (list?.data || []).forEach((a) => {
            if (result[a.status]) result[a.status].push(a);
            else if (a.status === 'draft') {
                if (!result.draft) result.draft = [];
                result.draft.push(a);
            }
        });
        return result;
    }, [list]);

    return (
        <div>
            <header className="mb-6 flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Seleksi Tenant</h1>
                    <p className="text-sm text-slate-600 mt-1">Review pendaftaran masuk → AI screening → keputusan akhir.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white rounded-lg ring-1 ring-slate-200 p-0.5 flex">
                        <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${view === 'kanban' ? 'bg-primary-700 text-white' : 'text-slate-600'}`}>📋 Kanban</button>
                        <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${view === 'list' ? 'bg-primary-700 text-white' : 'text-slate-600'}`}>📑 List</button>
                    </div>
                </div>
            </header>

            {/* Stats banner */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3 mb-4">
                    <StatCard label="Total" value={stats.total} accent="slate" />
                    <StatCard label="Submitted" value={stats.by_status.submitted} accent="blue" />
                    <StatCard label="Under Review" value={stats.by_status.under_review} accent="amber" />
                    <StatCard label="Shortlisted" value={stats.by_status.shortlisted} accent="violet" />
                    <StatCard label="Accepted" value={stats.by_status.accepted} accent="emerald" />
                    <StatCard label="Rejected" value={stats.by_status.rejected} accent="rose" />
                </div>
            )}

            {/* AI screening summary */}
            {stats && stats.ai_screened > 0 && (
                <div className="mb-4 p-3 bg-gradient-to-r from-primary-50 to-amber-50 rounded-xl ring-1 ring-primary-100 flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-bold text-primary-800">🤖 AI Screening:</span>
                    <span className="text-slate-700">{stats.ai_screened}/{stats.total} applications di-screen</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-emerald-700 font-semibold">✅ Accepted: {stats.ai_recommendation.accepted}</span>
                    <span className="text-violet-700 font-semibold">⭐ Shortlisted: {stats.ai_recommendation.shortlisted}</span>
                    <span className="text-rose-700 font-semibold">❌ Rejected: {stats.ai_recommendation.rejected}</span>
                    {stats.unscreened > 0 && (
                        <span className="ml-auto text-slate-500">
                            {stats.unscreened} belum di-screen — buka detail lalu klik "Run AI Screen"
                        </span>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl ring-1 ring-slate-200 p-3 mb-4 flex flex-wrap items-center gap-2">
                <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari nama startup…"
                    className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
                <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">
                    <option value="">Semua Batch</option>
                    {(batchesData || []).map((b) => (
                        <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
                    ))}
                </select>
                {view === 'list' && (
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">
                        <option value="">Semua Status</option>
                        {KANBAN_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                    </select>
                )}
                <select value={aiFilter} onChange={(e) => setAiFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">
                    <option value="">Semua AI Rec</option>
                    <option value="accepted">AI: Accepted</option>
                    <option value="shortlisted">AI: Shortlisted</option>
                    <option value="rejected">AI: Rejected</option>
                </select>
                {bulkSelected.length > 0 && (
                    <BulkActions selected={bulkSelected} onDone={() => { setBulkSelected([]); refresh(); }} />
                )}
            </div>

            {isFetching && (
                <div className="text-center text-xs text-slate-400 mb-2">Memuat…</div>
            )}

            {/* Main content */}
            {view === 'kanban' ? (
                <KanbanBoard grouped={grouped} onSelect={setSelected} bulkSelected={bulkSelected} setBulkSelected={setBulkSelected} onMove={handleMove} />
            ) : (
                <ListView data={list?.data || []} onSelect={setSelected} bulkSelected={bulkSelected} setBulkSelected={setBulkSelected} />
            )}

            {selected && <ReviewPanel id={selected.id} onClose={() => setSelected(null)} onSaved={refresh} />}
        </div>
    );
}

function StatCard({ label, value, accent }) {
    const colors = {
        slate: 'text-slate-700',
        blue: 'text-blue-700',
        amber: 'text-amber-700',
        violet: 'text-violet-700',
        emerald: 'text-emerald-700',
        rose: 'text-rose-700',
    };
    return (
        <div className="bg-white rounded-xl p-3 ring-1 ring-slate-200">
            <div className={`text-xl sm:text-2xl font-extrabold ${colors[accent]}`}>{value}</div>
            <div className="text-[10px] sm:text-xs text-slate-600 font-medium uppercase tracking-wide mt-0.5">{label}</div>
        </div>
    );
}

function KanbanBoard({ grouped, onSelect, bulkSelected, setBulkSelected, onMove }) {
    const [dragId, setDragId] = useState(null);
    const [dragFrom, setDragFrom] = useState(null);
    const [overCol, setOverCol] = useState(null);

    function endDrag() {
        setDragId(null);
        setDragFrom(null);
        setOverCol(null);
    }

    function handleDrop(e, status) {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData('text/plain')) || dragId;
        if (id && status !== dragFrom) onMove?.(id, status);
        endDrag();
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto pb-4">
            {KANBAN_ORDER.map((status) => {
                const meta = STATUS_META[status];
                const items = grouped[status] || [];
                const isTarget = overCol === status && dragFrom !== status;
                return (
                    <div
                        key={status}
                        onDragOver={(e) => { if (dragId !== null) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverCol(status); } }}
                        onDragLeave={(e) => { if (e.currentTarget === e.target) setOverCol((c) => (c === status ? null : c)); }}
                        onDrop={(e) => handleDrop(e, status)}
                        className={`rounded-xl p-3 min-h-[200px] transition-colors ${isTarget ? 'bg-primary-50 ring-2 ring-primary-400' : 'bg-slate-100'}`}
                    >
                        <div className="flex items-center justify-between mb-3 sticky top-0 bg-inherit pb-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                                <h3 className="font-bold text-sm">{meta.label}</h3>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-slate-600 font-semibold">{items.length}</span>
                        </div>
                        <div className="space-y-2 min-h-[48px]">
                            {items.length === 0 && (
                                <p className={`text-xs italic ${isTarget ? 'text-primary-600' : 'text-slate-400'}`}>
                                    {isTarget ? 'Lepas di sini…' : 'Kosong'}
                                </p>
                            )}
                            {items.map((a) => (
                                <KanbanCard
                                    key={a.id}
                                    app={a}
                                    onClick={() => onSelect(a)}
                                    isChecked={bulkSelected.includes(a.id)}
                                    isDragging={dragId === a.id}
                                    onCheck={(checked) => {
                                        setBulkSelected((b) => checked ? [...b, a.id] : b.filter((id) => id !== a.id));
                                    }}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', String(a.id));
                                        e.dataTransfer.effectAllowed = 'move';
                                        setDragId(a.id);
                                        setDragFrom(status);
                                    }}
                                    onDragEnd={endDrag}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function KanbanCard({ app, onClick, isChecked, onCheck, isDragging, onDragStart, onDragEnd }) {
    const aiRec = app.ai_screening?.recommendation;
    const aiBadge = aiRec ? {
        accepted: 'bg-emerald-100 text-emerald-700',
        shortlisted: 'bg-violet-100 text-violet-700',
        rejected: 'bg-rose-100 text-rose-700',
    }[aiRec] : null;

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`group bg-white rounded-lg p-3 ring-1 ring-slate-200 hover:ring-primary-300 hover:shadow-md transition cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
        >
            <div className="flex items-start gap-2 mb-2">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => { e.stopPropagation(); onCheck(e.target.checked); }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5"
                />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
                    <div className="font-bold text-sm truncate">
                        <span className="text-slate-300 group-hover:text-slate-400 mr-1 select-none" title="Geser untuk pindah status">⠿</span>
                        {app.tenant?.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{app.tenant?.one_liner}</div>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap" onClick={onClick}>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium uppercase">{app.tenant?.sector}</span>
                {app.score && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">📊 {app.score}</span>}
                {app.ai_score && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${aiBadge || 'bg-slate-100 text-slate-700'}`}>
                        🤖 {Math.round(app.ai_score)}
                    </span>
                )}
            </div>
        </div>
    );
}

function ListView({ data, onSelect, bulkSelected, setBulkSelected }) {
    const allChecked = data.length > 0 && data.every((d) => bulkSelected.includes(d.id));
    return (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-3 py-3 w-10">
                                <input type="checkbox" checked={allChecked}
                                    onChange={(e) => setBulkSelected(e.target.checked ? data.map((d) => d.id) : [])} />
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">Startup</th>
                            <th className="px-4 py-3 text-left font-semibold">Sektor</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Score</th>
                            <th className="px-4 py-3 text-left font-semibold">AI Rec</th>
                            <th className="px-4 py-3 text-left font-semibold">Submitted</th>
                            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-12 text-slate-500">Tidak ada aplikasi.</td></tr>
                        ) : data.map((a) => {
                            const meta = STATUS_META[a.status] || STATUS_META.draft;
                            return (
                                <tr key={a.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-3">
                                        <input type="checkbox" checked={bulkSelected.includes(a.id)}
                                            onChange={(e) => setBulkSelected((b) => e.target.checked ? [...b, a.id] : b.filter((id) => id !== a.id))} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold">{a.tenant?.name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs">{a.tenant?.one_liner}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-medium">{a.tenant?.sector}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${meta.color}`}>{meta.label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{a.score ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {a.ai_score ? (
                                            <span className="font-bold">{Math.round(a.ai_score)}</span>
                                        ) : <span className="text-slate-400">—</span>}
                                        {a.ai_screening?.recommendation && (
                                            <span className="ml-2 text-xs text-slate-500">{a.ai_screening.recommendation}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => onSelect(a)} className="text-xs px-3 py-1.5 rounded bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold">
                                            Review →
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BulkActions({ selected, onDone }) {
    const qc = useQueryClient();
    const [working, setWorking] = useState(false);

    async function bulkUpdate(status) {
        const message = status === 'rejected' ? prompt('Alasan reject (opsional):') : null;
        if (!confirm(`Ubah ${selected.length} aplikasi menjadi "${status}"?`)) return;
        setWorking(true);
        try {
            await api.post('/api/admin/applications/bulk-status', {
                ids: selected,
                status,
                rejection_reason: message,
            });
            qc.invalidateQueries({ queryKey: ['admin', 'applications'] });
            onDone();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal bulk update.');
        } finally {
            setWorking(false);
        }
    }

    return (
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 ring-1 ring-primary-200 rounded-lg text-xs">
            <span className="font-semibold text-primary-800">{selected.length} dipilih:</span>
            <button onClick={() => bulkUpdate('under_review')} disabled={working} className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-semibold">Review</button>
            <button onClick={() => bulkUpdate('shortlisted')} disabled={working} className="px-2 py-1 rounded bg-violet-500 hover:bg-violet-600 text-white font-semibold">Shortlist</button>
            <button onClick={() => bulkUpdate('accepted')} disabled={working} className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Accept</button>
            <button onClick={() => bulkUpdate('rejected')} disabled={working} className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold">Reject</button>
        </div>
    );
}

function ReviewPanel({ id, onClose, onSaved }) {
    const qc = useQueryClient();
    const [tab, setTab] = useState('overview');
    const [editing, setEditing] = useState({});
    const [formError, setFormError] = useState('');

    const { data: app, isLoading } = useQuery({
        queryKey: ['admin', 'applications', id],
        queryFn: () => api.get(`/api/admin/applications/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: (payload) => api.patch(`/api/admin/applications/${id}`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'applications'] });
            onSaved();
            setEditing({});
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    const aiMutation = useMutation({
        mutationFn: () => api.post(`/api/admin/applications/${id}/run-ai-screen`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'applications', id] }),
    });

    if (isLoading || !app) {
        return (
            <Drawer onClose={onClose}>
                <div className="p-6"><Spinner className="h-8 w-8 text-primary-700 mx-auto" /></div>
            </Drawer>
        );
    }

    const t = app.tenant;
    const ans = app.answers || {};
    const ai = app.ai_screening;
    const meta = STATUS_META[app.status] || STATUS_META.draft;

    function updateStatus(status) {
        updateMutation.mutate({ status });
    }
    function saveScore() {
        setFormError('');
        updateMutation.mutate({
            score: editing.score ?? app.score,
            reviewer_notes: editing.reviewer_notes ?? app.reviewer_notes,
        });
    }

    return (
        <Drawer onClose={onClose}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{app.batch?.name}</div>
                    <h2 className="text-xl font-extrabold tracking-tight truncate">{t?.name}</h2>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-1">{t?.one_liner}</p>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 rounded-lg hover:bg-slate-100 shrink-0">✕</button>
            </div>

            {/* Status pill + actions */}
            <div className="px-6 py-3 border-b border-slate-200 flex flex-wrap items-center gap-2 bg-slate-50">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${meta.color}`}>● {meta.label}</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-700 uppercase font-medium">{t?.sector}</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-700">{t?.stage}</span>
                <div className="ml-auto flex flex-wrap gap-1">
                    <ActionButton onClick={() => updateStatus('under_review')} label="Review" color="amber" disabled={app.status === 'under_review'} />
                    <ActionButton onClick={() => updateStatus('shortlisted')} label="Shortlist" color="violet" disabled={app.status === 'shortlisted'} />
                    <ActionButton onClick={() => updateStatus('accepted')} label="Accept" color="emerald" disabled={app.status === 'accepted'} />
                    <ActionButton onClick={() => updateStatus('rejected')} label="Reject" color="rose" disabled={app.status === 'rejected'} />
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-200 flex gap-4 overflow-x-auto">
                <Tab active={tab === 'overview'} onClick={() => setTab('overview')}>Ringkasan</Tab>
                <Tab active={tab === 'esai'} onClick={() => setTab('esai')}>Esai</Tab>
                <Tab active={tab === 'pitch'} onClick={() => setTab('pitch')}>
                    💼 Pitch Deck
                    {app.pitch_deck_evaluated_at && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">{Math.round(app.pitch_deck_evaluation?.weighted_total ?? 0)}</span>}
                </Tab>
                <Tab active={tab === 'proposal'} onClick={() => setTab('proposal')}>
                    📄 Proposal SOP
                    {app.proposal_evaluated_at && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">{Math.round(app.proposal_score ?? 0)}</span>}
                </Tab>
                <Tab active={tab === 'interview'} onClick={() => setTab('interview')}>
                    🎤 Wawancara
                    {app.interview_evaluated_at && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">{Math.round(app.interview_score ?? 0)}</span>}
                </Tab>
                <Tab active={tab === 'ai'} onClick={() => setTab('ai')}>🤖 AI</Tab>
                <Tab active={tab === 'documents'} onClick={() => setTab('documents')}>
                    📎 Dokumen
                    {app.documents?.length > 0 && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 font-bold">
                            {app.documents.length}
                        </span>
                    )}
                </Tab>
                <Tab active={tab === 'review'} onClick={() => setTab('review')}>Catatan</Tab>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {tab === 'overview' && (
                    <div className="space-y-5">
                        <Section title="Profil Startup">
                            <DL label="Nama" value={t?.name} />
                            <DL label="One-liner" value={t?.one_liner} />
                            <DL label="Sektor" value={t?.sector} />
                            <DL label="Tahap" value={t?.stage} />
                            <DL label="Berdiri" value={t?.founded_at} />
                            <DL label="Deskripsi" value={t?.description} long />
                        </Section>
                        <Section title="Tim Founder">
                            {t?.founders?.length === 0 && <p className="text-sm text-slate-500">Belum ada founder ter-record.</p>}
                            {(t?.founders || []).map((f) => (
                                <div key={f.id} className="p-3 bg-slate-50 rounded-lg">
                                    <div className="font-semibold">{f.name} {f.is_primary && <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">Primary</span>}</div>
                                    <div className="text-xs text-slate-600">{f.role} · {f.email}</div>
                                </div>
                            ))}
                        </Section>
                        <Section title="Submission">
                            <DL label="Submitted" value={app.submitted_at ? new Date(app.submitted_at).toLocaleString('id-ID') : '—'} />
                            <DL label="Reviewed" value={app.reviewed_at ? new Date(app.reviewed_at).toLocaleString('id-ID') : '—'} />
                            <DL label="Reviewer" value={app.reviewer?.name || '—'} />
                        </Section>
                    </div>
                )}

                {tab === 'esai' && (
                    <div className="space-y-5">
                        <Section title="Problem">
                            <p className="text-sm text-slate-700 whitespace-pre-line">{ans.problem || '—'}</p>
                        </Section>
                        <Section title="Solution">
                            <p className="text-sm text-slate-700 whitespace-pre-line">{ans.solution || '—'}</p>
                        </Section>
                        <Section title="Target Market">
                            <p className="text-sm text-slate-700 whitespace-pre-line">{ans.target_market || '—'}</p>
                        </Section>
                        <Section title="Achievements">
                            <p className="text-sm text-slate-700 whitespace-pre-line">{ans.achievements || '—'}</p>
                        </Section>
                        <DL label="Ukuran Tim" value={ans.team_size || '—'} />
                    </div>
                )}

                {tab === 'pitch' && <PitchDeckEvaluation app={app} onSaved={onSaved} />}

                {tab === 'proposal' && (
                    <SopEvaluationPanel
                        app={app}
                        onSaved={onSaved}
                        type="proposal"
                        title="Penilaian Proposal Calon Tenant"
                        endpoint={`/api/admin/applications/${app.id}/proposal-eval`}
                        existingEval={app.proposal_evaluation}
                        existingScore={app.proposal_score}
                        existingAt={app.proposal_evaluated_at}
                    />
                )}

                {tab === 'interview' && (
                    <SopEvaluationPanel
                        app={app}
                        onSaved={onSaved}
                        type="interview"
                        title="Penilaian Wawancara Calon Tenant"
                        endpoint={`/api/admin/applications/${app.id}/interview-eval`}
                        existingEval={app.interview_evaluation}
                        existingScore={app.interview_score}
                        existingAt={app.interview_evaluated_at}
                    />
                )}

                {tab === 'ai' && (
                    <div className="space-y-4">
                        {!ai ? (
                            <div className="p-6 bg-slate-50 rounded-xl text-center">
                                <div className="text-4xl mb-2">🤖</div>
                                <p className="text-sm text-slate-600 mb-4">Aplikasi ini belum di-screen oleh AI.</p>
                                <button onClick={() => aiMutation.mutate()} disabled={aiMutation.isPending}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm disabled:opacity-60">
                                    {aiMutation.isPending && <Spinner className="h-4 w-4" />}
                                    Run AI Screen
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4 text-center">
                                        <div className="text-3xl font-extrabold text-primary-700">{Math.round(app.ai_score)}</div>
                                        <div className="text-xs text-slate-600 mt-1">AI Score (0-100)</div>
                                    </div>
                                    <div className="col-span-2 bg-white ring-1 ring-slate-200 rounded-xl p-4">
                                        <div className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-1">Recommendation</div>
                                        <div className={`text-lg font-bold ${
                                            ai.recommendation === 'accepted' ? 'text-emerald-700' :
                                            ai.recommendation === 'shortlisted' ? 'text-violet-700' :
                                            'text-rose-700'
                                        }`}>{ai.recommendation?.toUpperCase()}</div>
                                        <div className="text-xs text-slate-600 mt-1">Source: {ai.source} · {app.ai_screened_at && new Date(app.ai_screened_at).toLocaleString('id-ID')}</div>
                                    </div>
                                </div>

                                <Section title="Summary">
                                    <p className="text-sm text-slate-700">{ai.summary}</p>
                                </Section>

                                {ai.strengths?.length > 0 && (
                                    <Section title="✓ Strengths">
                                        <ul className="space-y-1 text-sm text-emerald-800">
                                            {ai.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                                        </ul>
                                    </Section>
                                )}

                                {ai.weaknesses?.length > 0 && (
                                    <Section title="✗ Weaknesses">
                                        <ul className="space-y-1 text-sm text-rose-800">
                                            {ai.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                                        </ul>
                                    </Section>
                                )}

                                {ai.rationale && (
                                    <Section title="Rationale">
                                        <p className="text-sm text-slate-700 italic">{ai.rationale}</p>
                                    </Section>
                                )}

                                <button onClick={() => aiMutation.mutate()} disabled={aiMutation.isPending}
                                    className="text-xs px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 font-semibold flex items-center gap-2">
                                    {aiMutation.isPending && <Spinner className="h-3 w-3" />}
                                    🔄 Re-screen dengan AI
                                </button>
                            </>
                        )}
                    </div>
                )}

                {tab === 'documents' && <DocumentsTab app={app} />}

                {tab === 'review' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Skor Reviewer (0-100)</label>
                            <input type="number" min="0" max="100" step="0.5"
                                defaultValue={app.score ?? ''}
                                onChange={(e) => setEditing({ ...editing, score: e.target.value === '' ? null : Number(e.target.value) })}
                                className="w-32 px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Reviewer</label>
                            <textarea
                                rows={6}
                                defaultValue={app.reviewer_notes || ''}
                                onChange={(e) => setEditing({ ...editing, reviewer_notes: e.target.value })}
                                placeholder="Tulis observasi & feedback untuk arsip internal."
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                            />
                        </div>
                        {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                        <button onClick={saveScore} disabled={updateMutation.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm disabled:opacity-60">
                            {updateMutation.isPending && <Spinner className="h-4 w-4" />}
                            Simpan
                        </button>

                        {app.rejection_reason && (
                            <Section title="Alasan Reject (catatan saat status berubah ke rejected)">
                                <p className="text-sm text-rose-800 whitespace-pre-line">{app.rejection_reason}</p>
                            </Section>
                        )}
                    </div>
                )}
            </div>
        </Drawer>
    );
}

/* ================== PITCH DECK EVALUATION ================== */

function PitchDeckEvaluation({ app, onSaved }) {
    const qc = useQueryClient();
    const pitchUrl = app.tenant?.pitch_deck_url;
    const existingEval = app.pitch_deck_evaluation;

    // Fetch rubric dari backend
    const { data: rubricData } = useQuery({
        queryKey: ['admin', 'applications-pitch-rubric'],
        queryFn: () => api.get('/api/admin/applications-pitch-rubric').then((r) => r.data.data),
        staleTime: 60 * 60_000,
    });
    const rubric = rubricData || [];

    // Initial scores: dari evaluasi existing atau default 5 (median)
    const initialScores = useMemo(() => {
        const out = {};
        rubric.forEach((c) => {
            const ex = existingEval?.scores?.[c.key];
            out[c.key] = {
                score: ex?.score ?? 5,
                notes: ex?.notes ?? '',
            };
        });
        return out;
    }, [rubric, existingEval]);

    const [scores, setScores] = useState(initialScores);
    const [overallNotes, setOverallNotes] = useState(existingEval?.overall_notes || '');
    const [applyToScore, setApplyToScore] = useState(false);

    // Re-init kalau rubric/eval berubah
    useEffect(() => {
        setScores(initialScores);
        setOverallNotes(existingEval?.overall_notes || '');
    }, [JSON.stringify(initialScores), existingEval?.evaluated_at]);

    // Auto-calculate weighted total
    const weightedTotal = useMemo(() => {
        if (rubric.length === 0) return 0;
        let weightedSum = 0;
        let totalWeight = 0;
        rubric.forEach((c) => {
            const v = scores[c.key]?.score ?? 0;
            weightedSum += Number(v) * c.weight;
            totalWeight += c.weight;
        });
        return totalWeight > 0 ? Math.round((weightedSum * 100 / (totalWeight * 10)) * 100) / 100 : 0;
    }, [scores, rubric]);

    const saveMutation = useMutation({
        mutationFn: (payload) => api.post(`/api/admin/applications/${app.id}/pitch-deck-eval`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'applications'] });
            qc.invalidateQueries({ queryKey: ['admin', 'applications', app.id] });
            onSaved?.();
            alert('Evaluasi pitch deck berhasil disimpan.');
        },
        onError: (err) => alert(err.response?.data?.message || 'Gagal simpan.'),
    });

    function handleSubmit() {
        const payload = {
            scores,
            overall_notes: overallNotes,
            apply_to_score: applyToScore,
        };
        saveMutation.mutate(payload);
    }

    function setScore(key, value) {
        setScores((s) => ({ ...s, [key]: { ...s[key], score: Number(value) } }));
    }
    function setNotes(key, value) {
        setScores((s) => ({ ...s, [key]: { ...s[key], notes: value } }));
    }

    return (
        <div className="space-y-6">
            {/* Pitch deck viewer */}
            <PitchDeckViewer url={pitchUrl} />

            {/* Existing evaluation summary */}
            {existingEval && (
                <div className="p-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-emerald-800">
                            ✅ Sudah dievaluasi: <span className="text-2xl font-extrabold">{Math.round(existingEval.weighted_total)}</span>/100
                        </span>
                        <span className="text-slate-600">
                            oleh {existingEval.evaluated_by_user_name} · {new Date(existingEval.evaluated_at).toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            )}

            {/* Live total */}
            <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-white border-y border-slate-200 flex items-center justify-between">
                <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Bobot Saat Ini</div>
                    <div className="text-3xl font-extrabold text-primary-700">{weightedTotal} <span className="text-sm text-slate-400 font-normal">/ 100</span></div>
                </div>
                <div className="text-right text-xs text-slate-500">
                    <div>Skor per kriteria 0–10</div>
                    <div>Bobot total = 100%</div>
                </div>
            </div>

            {/* Rubric form */}
            <div className="space-y-4">
                {rubric.map((c) => (
                    <CriteriaRow
                        key={c.key}
                        criteria={c}
                        score={scores[c.key]?.score ?? 5}
                        notes={scores[c.key]?.notes ?? ''}
                        onScore={(v) => setScore(c.key, v)}
                        onNotes={(v) => setNotes(c.key, v)}
                    />
                ))}
            </div>

            {/* Overall notes */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Keseluruhan</label>
                <textarea
                    rows={3}
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    placeholder="Kesan umum, rekomendasi, atau catatan lain tentang pitch deck."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
            </div>

            {/* Apply to score toggle + submit */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-200">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={applyToScore} onChange={(e) => setApplyToScore(e.target.checked)} className="w-4 h-4" />
                    <span>Terapkan total ({weightedTotal}) sebagai <strong>Score Reviewer</strong></span>
                </label>
                <button
                    onClick={handleSubmit}
                    disabled={saveMutation.isPending || rubric.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm disabled:opacity-60"
                >
                    {saveMutation.isPending && <Spinner className="h-4 w-4" />}
                    💾 Simpan Evaluasi
                </button>
            </div>
        </div>
    );
}

function CriteriaRow({ criteria, score, notes, onScore, onNotes }) {
    const colorBadge =
        score >= 8 ? 'bg-emerald-100 text-emerald-700' :
        score >= 6 ? 'bg-amber-100 text-amber-700' :
        score >= 4 ? 'bg-orange-100 text-orange-700' :
        'bg-rose-100 text-rose-700';

    return (
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-900">{criteria.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Bobot: {criteria.weight}%</div>
                </div>
                <span className={`shrink-0 text-lg font-extrabold px-3 py-1 rounded-lg ${colorBadge}`}>
                    {Number(score).toFixed(1)}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={score}
                    onChange={(e) => onScore(e.target.value)}
                    className="flex-1 accent-primary-700"
                />
                <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={score}
                    onChange={(e) => onScore(e.target.value || 0)}
                    className="w-16 px-2 py-1 rounded border border-slate-300 text-sm text-center"
                />
            </div>

            <textarea
                rows={2}
                value={notes}
                onChange={(e) => onNotes(e.target.value)}
                placeholder="Catatan untuk kriteria ini (opsional)…"
                className="mt-2 w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs"
            />
        </div>
    );
}

/* ================== Proposal & Interview Evaluation ================== */

function SopEvaluationPanel({ app, onSaved, type, title, endpoint, existingEval, existingScore, existingAt }) {
    const qc = useQueryClient();

    const { data: rubricData, isLoading: rubricLoading } = useQuery({
        queryKey: ['admin', 'sop-rubric', type],
        queryFn: () => api.get(`/api/admin/applications-sop-rubric/${type}`).then((r) => r.data),
    });

    const rubric = rubricData?.data || [];
    const scaleMax = rubricData?.scale_max || 10;

    // Initial scores: dari existing evaluation, fallback empty
    const [scores, setScores] = useState({});
    const [overallNotes, setOverallNotes] = useState(existingEval?.overall_notes || '');
    const [applyToScore, setApplyToScore] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (existingEval?.scores) {
            const init = {};
            Object.entries(existingEval.scores).forEach(([key, val]) => {
                init[key] = { score: val.score, notes: val.notes || '' };
            });
            setScores(init);
            setOverallNotes(existingEval.overall_notes || '');
        }
    }, [existingEval]);

    const liveTotal = useMemo(() => {
        let weightedSum = 0;
        let totalWeight = 0;
        rubric.forEach((r) => {
            const s = scores[r.key]?.score;
            if (s === null || s === undefined || s === '') return;
            weightedSum += Number(s) * Number(r.weight);
            totalWeight += Number(r.weight);
        });
        if (totalWeight === 0) return null;
        return Math.round((weightedSum / totalWeight) * 100 / scaleMax * 100) / 100;
    }, [scores, rubric, scaleMax]);

    const allFilled = rubric.length > 0 && rubric.every((r) => {
        const s = scores[r.key]?.score;
        return s !== null && s !== undefined && s !== '' && Number(s) >= 1 && Number(s) <= scaleMax;
    });

    const saveMutation = useMutation({
        mutationFn: () => {
            const payload = {
                scores: Object.fromEntries(
                    Object.entries(scores).map(([k, v]) => [
                        k,
                        { score: Number(v.score), notes: v.notes || null },
                    ])
                ),
                overall_notes: overallNotes || null,
                apply_to_score: applyToScore,
            };
            return api.post(endpoint, payload).then((r) => r.data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'applications'] });
            onSaved?.();
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    if (rubricLoading) return <Spinner className="h-6 w-6 mx-auto" />;

    return (
        <div className="space-y-5">
            <div className="rounded-xl bg-primary-50/60 ring-1 ring-primary-100 p-4 text-sm">
                <div className="font-bold text-primary-900 mb-1">{title}</div>
                <div className="text-xs text-primary-800">
                    Skala penilaian: 1–{scaleMax}. Total bobot: {rubric.reduce((s, r) => s + Number(r.weight), 0)}%.
                    Skor akhir dinormalkan ke 0–100.
                </div>
            </div>

            {existingAt && (
                <div className="text-xs text-slate-600 bg-emerald-50 ring-1 ring-emerald-200 rounded-lg p-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <span>
                            ✅ Sudah dievaluasi oleh <strong>{existingEval?.evaluated_by_user_name}</strong> pada {new Date(existingAt).toLocaleString('id-ID')}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 text-base">
                            Skor: {Number(existingScore).toFixed(2)} / 100
                        </span>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {rubric.map((r) => (
                    <div key={r.key} className="bg-white ring-1 ring-slate-200 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-slate-900">{r.label}</div>
                                <div className="text-xs text-slate-600 mt-0.5">{r.kpi}</div>
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Bobot: {r.weight}%</div>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max={scaleMax}
                                step="1"
                                value={scores[r.key]?.score ?? ''}
                                onChange={(e) =>
                                    setScores((prev) => ({
                                        ...prev,
                                        [r.key]: { ...(prev[r.key] || {}), score: e.target.value },
                                    }))
                                }
                                placeholder={`1–${scaleMax}`}
                                className="w-16 h-9 px-2 rounded border border-slate-300 text-sm text-center font-mono font-bold"
                            />
                        </div>
                        <textarea
                            rows={2}
                            value={scores[r.key]?.notes || ''}
                            onChange={(e) =>
                                setScores((prev) => ({
                                    ...prev,
                                    [r.key]: { ...(prev[r.key] || {}), notes: e.target.value },
                                }))
                            }
                            placeholder="Catatan untuk kriteria ini (opsional)…"
                            className="mt-2 w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs"
                        />
                    </div>
                ))}
            </div>

            <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan Keseluruhan</label>
                <textarea
                    rows={3}
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    placeholder="Kesimpulan, rekomendasi, atau catatan tambahan…"
                    className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                />
            </div>

            {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <div className={`text-2xl font-extrabold font-mono ${liveTotal >= 80 ? 'text-emerald-700' : liveTotal >= 60 ? 'text-amber-700' : 'text-slate-700'}`}>
                        {liveTotal !== null ? liveTotal.toFixed(2) : '—'}
                    </div>
                    <div className="text-xs text-slate-600">/ 100</div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                            type="checkbox"
                            checked={applyToScore}
                            onChange={(e) => setApplyToScore(e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        Apply ke skor utama
                    </label>
                    <button
                        onClick={() => { setFormError(''); saveMutation.mutate(); }}
                        disabled={!allFilled || saveMutation.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm disabled:opacity-50"
                    >
                        {saveMutation.isPending && <Spinner className="h-4 w-4" />}
                        {existingAt ? 'Update Penilaian' : 'Simpan Penilaian'}
                    </button>
                </div>
            </div>

            {!allFilled && (
                <div className="text-[11px] text-amber-700 bg-amber-50 ring-1 ring-amber-200 rounded p-2">
                    Semua {rubric.length} kriteria harus diisi skornya (1–{scaleMax}) sebelum dapat disimpan.
                </div>
            )}
        </div>
    );
}

function PitchDeckViewer({ url }) {
    if (!url) {
        return (
            <div className="p-5 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-sm text-amber-800">
                ⚠️ Tenant belum menyertakan link pitch deck. Anda masih bisa skor berdasarkan data submission lain.
            </div>
        );
    }

    const embedUrl = transformToEmbed(url);

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">📎 Pitch Deck</div>
                <a href={url} target="_blank" rel="noopener" className="text-xs text-primary-700 hover:underline font-semibold">Buka di tab baru ↗</a>
            </div>
            {embedUrl ? (
                <div className="aspect-video w-full bg-slate-100 rounded-xl overflow-hidden ring-1 ring-slate-200">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="autoplay"
                        title="Pitch Deck"
                    />
                </div>
            ) : (
                <div className="p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 text-sm">
                    <p className="text-slate-700 mb-2">Pitch deck di-host eksternal. Klik untuk buka:</p>
                    <a href={url} target="_blank" rel="noopener" className="text-primary-700 font-semibold break-all hover:underline">{url}</a>
                </div>
            )}
        </div>
    );
}

/**
 * Auto-detect URL pitch deck → return embed URL kalau bisa di-iframe.
 */
function transformToEmbed(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        // Google Slides
        let m = u.pathname.match(/\/presentation\/d\/([^/]+)/);
        if (m && u.hostname.includes('docs.google.com')) {
            return `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false`;
        }
        // Google Drive PDF/file
        m = u.pathname.match(/\/file\/d\/([^/]+)/);
        if (m && (u.hostname.includes('drive.google.com'))) {
            return `https://drive.google.com/file/d/${m[1]}/preview`;
        }
        // Google Docs
        m = u.pathname.match(/\/document\/d\/([^/]+)/);
        if (m && u.hostname.includes('docs.google.com')) {
            return `https://docs.google.com/document/d/${m[1]}/preview`;
        }
        // Canva
        if (u.hostname.includes('canva.com') && u.pathname.includes('/design/')) {
            // https://www.canva.com/design/XXX/view → tambah ?embed
            return url.split('?')[0] + '?embed';
        }
        // Notion (kalau public)
        if (u.hostname.endsWith('notion.site') || u.hostname.endsWith('notion.so')) {
            return url;
        }
        // PDF langsung (akhiran .pdf)
        if (u.pathname.toLowerCase().endsWith('.pdf')) {
            return url;
        }
        return null;
    } catch {
        return null;
    }
}

/* ================== END PITCH DECK ================== */

function Drawer({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50" />
            <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

function Tab({ active, onClick, children }) {
    return (
        <button onClick={onClick} className={`whitespace-nowrap py-3 text-sm font-semibold border-b-2 transition ${active ? 'text-primary-700 border-primary-700' : 'text-slate-600 border-transparent hover:text-slate-900'}`}>
            {children}
        </button>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h3 className="font-bold text-sm text-slate-900 mb-2">{title}</h3>
            <div className="space-y-1.5 bg-slate-50 rounded-lg p-3">{children}</div>
        </div>
    );
}

function DL({ label, value, long }) {
    if (long) {
        return (
            <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">{value || '—'}</p>
            </div>
        );
    }
    return (
        <div className="flex items-baseline gap-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-24 shrink-0">{label}</div>
            <div className="text-sm text-slate-700">{value || '—'}</div>
        </div>
    );
}

function ActionButton({ onClick, label, color, disabled }) {
    const colors = {
        amber: 'bg-amber-500 hover:bg-amber-600 text-white',
        violet: 'bg-violet-500 hover:bg-violet-600 text-white',
        emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        rose: 'bg-rose-600 hover:bg-rose-700 text-white',
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`px-2.5 py-1 rounded text-xs font-semibold transition ${colors[color]} disabled:opacity-40 disabled:cursor-not-allowed`}>
            {label}
        </button>
    );
}

// ──────────────────────────────────────────────────────────────────────────
// Documents tab — list + download tombol per file

function DocumentsTab({ app }) {
    const docs = app.documents || [];

    if (docs.length === 0) {
        return (
            <div className="p-8 bg-slate-50 rounded-2xl text-center">
                <div className="text-5xl mb-3">📂</div>
                <p className="text-sm font-medium text-slate-700">Belum ada dokumen</p>
                <p className="text-xs text-slate-500 mt-1">
                    Tenant belum upload pitch deck, proposal, logo, atau CV saat pendaftaran.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="text-xs text-slate-600 mb-2">
                {docs.length} dokumen ter-upload oleh tenant. Klik tombol Download untuk membuka file.
            </div>
            {docs.map((doc) => (
                <DocumentRow key={doc.id} appId={app.id} doc={doc} />
            ))}
        </div>
    );
}

function DocumentRow({ appId, doc }) {
    const sizeKB = ((doc.size || 0) / 1024).toFixed(0);
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    const icon = mimeIcon(doc.mime_type);
    const [downloading, setDownloading] = useState(false);

    async function handleDownload() {
        setDownloading(true);
        try {
            // Pakai api (axios) supaya Bearer token ke-attach
            const res = await api.get(
                `/api/admin/applications/${appId}/documents/${doc.id}/download`,
                { responseType: 'blob' }
            );
            const blob = new Blob([res.data], { type: doc.mime_type || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = doc.filename || doc.title;
            window.document.body.appendChild(a);
            a.click();
            a.remove();
            // Revoke setelah delay supaya download sempat trigger
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (err) {
            alert('Gagal download: ' + (err.response?.data?.message || err.message));
        } finally {
            setDownloading(false);
        }
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-white ring-1 ring-slate-200 rounded-xl hover:shadow-sm transition">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 truncate">{doc.title}</span>
                    {doc.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-bold">
                            {doc.category}
                        </span>
                    )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {doc.filename} · {sizeStr} · {doc.mime_type}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                    Upload: {new Date(doc.created_at).toLocaleString('id-ID')}
                </div>
            </div>
            <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-60"
            >
                {downloading ? <Spinner className="h-3 w-3" /> : '⬇'} Download
            </button>
        </div>
    );
}

function mimeIcon(mime = '') {
    if (mime.includes('pdf')) return '📕';
    if (mime.includes('word') || mime.includes('doc')) return '📘';
    if (mime.includes('powerpoint') || mime.includes('presentation') || mime.includes('keynote')) return '📊';
    if (mime.includes('image')) return '🖼️';
    if (mime.includes('zip') || mime.includes('archive')) return '🗜️';
    return '📄';
}
