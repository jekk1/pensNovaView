import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, FlaskConical, Building2, Target, Lightbulb, Cog, X } from 'lucide-react';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import Spinner from '../../components/Spinner';

const STATUS_META = {
    suggested: { label: 'Suggested', color: 'bg-slate-100 text-slate-700' },
    reviewed:  { label: 'Reviewed',  color: 'bg-blue-50 text-blue-700' },
    approved:  { label: 'Approved',  color: 'bg-emerald-50 text-emerald-700' },
    forwarded: { label: 'Forwarded', color: 'bg-violet-50 text-violet-700' },
    accepted:  { label: 'Accepted',  color: 'bg-emerald-100 text-emerald-800' },
    rejected:  { label: 'Rejected',  color: 'bg-rose-50 text-rose-700' },
    archived:  { label: 'Archived',  color: 'bg-slate-100 text-slate-500' },
};

export default function MatchRecords() {
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');
    const [minScore, setMinScore] = useState('');
    const [selected, setSelected] = useState(null);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'match-records-stats'],
        queryFn: () => api.get('/api/admin/match-records-stats').then((r) => r.data),
    });

    const { data: list, isLoading } = useQuery({
        queryKey: ['admin', 'match-records', { statusFilter, minScore }],
        queryFn: () =>
            api.get('/api/admin/match-records', {
                params: { status: statusFilter || undefined, min_score: minScore || undefined, per_page: 50 },
            }).then((r) => r.data),
    });

    const runMutation = useMutation({
        mutationFn: (aiTop) => api.post('/api/admin/match-records/run-matchmaking', { ai_top: aiTop }),
        onSuccess: (res) => {
            alert(res.data.message);
            qc.invalidateQueries({ queryKey: ['admin', 'match-records'] });
            qc.invalidateQueries({ queryKey: ['admin', 'match-records-stats'] });
        },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    return (
        <div>
            <header className="mb-6 flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Match Records</h1>
                    <p className="text-sm text-slate-600 mt-1">Hasil matchmaking research ↔ perusahaan mitra. Generate baru via tombol di kanan.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => runMutation.mutate(0)}
                        disabled={runMutation.isPending}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                        {runMutation.isPending && <Spinner className="h-3 w-3" />}
                        <Cog className="h-3.5 w-3.5" /> Run Rule-based
                    </button>
                    <button
                        onClick={() => runMutation.mutate(10)}
                        disabled={runMutation.isPending}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold"
                    >
                        {runMutation.isPending && <Spinner className="h-3 w-3" />}
                        <Bot className="h-3.5 w-3.5" /> Run + AI Enrich (top 10)
                    </button>
                </div>
            </header>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <StatBox label="Total Match" value={stats.total} accent="slate" />
                    <StatBox label="High Score (≥0.7)" value={stats.high_score} accent="emerald" />
                    <StatBox label="Avg Score" value={Number(stats.avg_score).toFixed(2)} accent="primary" />
                    <StatBox label="Approved" value={stats.by_status?.approved || 0} accent="emerald" />
                    <StatBox label="Pending Review" value={(stats.by_status?.suggested || 0) + (stats.by_status?.reviewed || 0)} accent="amber" />
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl ring-1 ring-slate-200 p-3 mb-4 flex flex-wrap items-center gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">
                    <option value="">Semua Status</option>
                    {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    placeholder="Min score 0-1"
                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm w-36"
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="py-12 text-center"><Spinner className="h-8 w-8 mx-auto text-primary-700" /></div>
                ) : list?.data.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                        Belum ada match. Klik <strong>Run Rule-based</strong> untuk generate.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {list.data.map((m) => (
                            <MatchRow key={m.id} match={m} onClick={() => setSelected(m)} />
                        ))}
                    </div>
                )}
            </div>

            {selected && <DetailPanel id={selected.id} onClose={() => setSelected(null)} />}
        </div>
    );
}

function StatBox({ label, value, accent }) {
    const colors = {
        slate: 'text-slate-700',
        emerald: 'text-emerald-700',
        primary: 'text-primary-700',
        amber: 'text-amber-700',
    };
    return (
        <div className="bg-white rounded-xl p-3 ring-1 ring-slate-200">
            <div className={`text-xl sm:text-2xl font-extrabold ${colors[accent]}`}>{value}</div>
            <div className="text-[10px] text-slate-600 font-medium uppercase tracking-wide mt-0.5">{label}</div>
        </div>
    );
}

function MatchRow({ match, onClick }) {
    const meta = STATUS_META[match.status] || STATUS_META.suggested;
    const scoreColor =
        match.score >= 0.8 ? 'text-emerald-700' :
        match.score >= 0.6 ? 'text-amber-700' :
        'text-slate-600';

    return (
        <div onClick={onClick} className="p-4 hover:bg-slate-50 cursor-pointer flex items-start gap-4">
            <div className={`shrink-0 text-3xl font-extrabold ${scoreColor} w-16 text-center`}>
                {Number(match.score).toFixed(2)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{match.research_topic?.title}</span>
                    <span className="text-slate-400">↔</span>
                    <span className="font-bold text-sm">{match.partner_company?.name}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2">
                    {match.research_topic?.tenant?.name} ({match.research_topic?.tenant?.sector}) · {match.partner_company?.sector}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${meta.color}`}>{meta.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{match.source.replace('_', ' ')}</span>
                    {match.matched_keywords?.length > 0 && (
                        <span className="text-xs text-slate-500">{match.matched_keywords.length} keyword match</span>
                    )}
                </div>
            </div>
            <div className="text-slate-400 text-xl">→</div>
        </div>
    );
}

function DetailPanel({ id, onClose }) {
    const qc = useQueryClient();
    const [adminNote, setAdminNote] = useState('');
    const [formError, setFormError] = useState('');

    const { data: match, isLoading } = useQuery({
        queryKey: ['admin', 'match-records', id],
        queryFn: () => api.get(`/api/admin/match-records/${id}`).then((r) => r.data.data),
    });

    const updateMutation = useMutation({
        mutationFn: (payload) => api.patch(`/api/admin/match-records/${id}`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'match-records'] });
            qc.invalidateQueries({ queryKey: ['admin', 'match-records-stats'] });
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    if (isLoading || !match) {
        return (
            <Drawer onClose={onClose}>
                <div className="p-6"><Spinner className="h-8 w-8 text-primary-700 mx-auto" /></div>
            </Drawer>
        );
    }

    return (
        <Drawer onClose={onClose}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Match Record #{match.id}</div>
                    <div className="text-2xl font-extrabold text-primary-700">{Number(match.score).toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Source: {match.source.replace('_', ' ')}</div>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_META[match.status].color}`}>● {STATUS_META[match.status].label}</span>
                <div className="ml-auto flex flex-wrap gap-1">
                    {['reviewed', 'approved', 'forwarded', 'accepted', 'rejected', 'archived'].map((s) => (
                        <button
                            key={s}
                            onClick={() => updateMutation.mutate({ status: s })}
                            disabled={match.status === s || updateMutation.isPending}
                            className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
                        >
                            {STATUS_META[s].label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <Section title="Research Topic">
                    <div className="font-bold">{match.research_topic?.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                        oleh <strong>{match.research_topic?.tenant?.name}</strong> · TRL {match.research_topic?.technology_readiness ?? '—'}
                    </div>
                </Section>

                <Section title="Partner Company">
                    <div className="font-bold">{match.partner_company?.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{match.partner_company?.sector}</div>
                </Section>

                {match.matched_keywords?.length > 0 && (
                    <Section title="Matched Keywords">
                        <div className="flex flex-wrap gap-1">
                            {match.matched_keywords.map((kw) => (
                                <span key={kw} className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-medium">{kw}</span>
                            ))}
                        </div>
                    </Section>
                )}

                {match.matched_sectors?.length > 0 && (
                    <Section title="Matched Sectors">
                        <div className="flex flex-wrap gap-1">
                            {match.matched_sectors.map((s) => (
                                <span key={s} className="text-xs px-2 py-1 rounded bg-primary-50 text-primary-700 uppercase font-medium">{s}</span>
                            ))}
                        </div>
                    </Section>
                )}

                {match.reasoning && (
                    <Section title="Reasoning">
                        <p className="text-sm text-slate-700 whitespace-pre-line">{match.reasoning}</p>
                    </Section>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Admin</label>
                    <textarea
                        rows={3}
                        defaultValue={match.admin_note || ''}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                    />
                    {formError && <div className="mb-2 mt-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <button
                        onClick={() => { setFormError(''); updateMutation.mutate({ admin_note: adminNote }); }}
                        disabled={updateMutation.isPending}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold disabled:opacity-60"
                    >
                        {updateMutation.isPending && <Spinner className="h-3 w-3" />}
                        Simpan Catatan
                    </button>
                </div>
            </div>
        </Drawer>
    );
}

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

function Section({ title, children }) {
    return (
        <div>
            <h3 className="font-bold text-sm text-slate-900 mb-2">{title}</h3>
            <div className="bg-slate-50 rounded-lg p-3">{children}</div>
        </div>
    );
}
