import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, Plus, Eye, FileCheck, BookOpen, BarChart3, CheckCircle2, X } from 'lucide-react';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import { useAuth } from '../../lib/auth';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';

const STATUS_BADGE = {
    draft: { label: 'Draft', variant: 'secondary' },
    finalized: { label: 'Finalized', variant: 'success' },
};

// Color per TKT level — sesuai TKT-meter BRIN (1-3 merah, 4-6 kuning, 7-9 hijau)
const LEVEL_COLOR = (level) => {
    if (level >= 7) return 'bg-emerald-500 text-white';
    if (level >= 4) return 'bg-amber-400 text-amber-900';
    if (level >= 1) return 'bg-rose-500 text-white';
    return 'bg-slate-300 text-slate-700';
};

const SCORE_LABELS = {
    0: '0% — Tidak terpenuhi',
    1: '20%',
    2: '40%',
    3: '60%',
    4: '80% — Terpenuhi (threshold)',
    5: '100% — Penuh',
};

export default function TrlAssessments() {
    const [tab, setTab] = useState('list');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'trl', 'stats'],
        queryFn: () => api.get('/api/admin/trl-stats').then((r) => r.data),
    });

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-6 w-6 text-primary-700" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Pengukuran TKT (Tingkat Kesiapan Teknologi)
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Standar BRIN — 7 bidang × 9 level dengan rubrik indikator. Default threshold pemenuhan: 80%.
                        Divisi Applied Research & Innovation gunakan ini untuk menilai kesiapan produk dosen sebelum komersialisasi.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Mulai Pengukuran
                </Button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <StatCard label="Total Assessment" value={stats?.total ?? '—'} icon={TrendingUp} color="primary" />
                <StatCard label="Draft" value={stats?.draft ?? '—'} icon={BookOpen} color="amber" />
                <StatCard label="Finalized" value={stats?.finalized ?? '—'} icon={FileCheck} color="emerald" />
                <StatCard label="High Readiness (≥7)" value={stats?.high_readiness ?? '—'} icon={CheckCircle2} color="emerald" />
                <StatCard label="Avg TKT" value={stats?.avg_level ?? '—'} icon={BarChart3} color="primary" />
            </div>

            <div className="border-b border-slate-200 mb-4 flex gap-1">
                {[
                    ['list', 'Daftar Pengukuran'],
                    ['rubric', 'Rubrik BRIN'],
                ].map(([k, label]) => (
                    <button
                        key={k}
                        onClick={() => setTab(k)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                            tab === k ? 'border-primary-700 text-primary-700' : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'list' && <ListTab onOpen={setEditing} />}
            {tab === 'rubric' && <RubricTab />}

            {creating && <CreateDialog onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setEditing(id); }} />}
            {editing && <DetailDialog id={editing} onClose={() => setEditing(null)} />}
        </div>
    );
}

function ListTab({ onOpen }) {
    const [filters, setFilters] = useState({ status: '', trl_category_id: '', q: '' });

    const { data: cats } = useQuery({
        queryKey: ['admin', 'trl-categories'],
        queryFn: () => api.get('/api/admin/trl-categories').then((r) => r.data.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'trl-assessments', filters],
        queryFn: () => api.get('/api/admin/trl-assessments', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    const rows = data?.data ?? [];

    return (
        <>
            <Card className="mb-4">
                <CardContent className="p-3 flex gap-2 flex-wrap">
                    <Input
                        placeholder="Cari judul teknologi…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.trl_category_id}
                        onChange={(e) => setFilters((f) => ({ ...f, trl_category_id: e.target.value }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Bidang</option>
                        {(cats || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Status</option>
                        <option value="draft">Draft</option>
                        <option value="finalized">Finalized</option>
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <TrendingUp className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <h3 className="font-bold text-sm">Belum ada pengukuran TKT</h3>
                        <p className="text-xs text-slate-500 mt-1">Klik <strong>Mulai Pengukuran</strong> untuk mulai assess kesiapan teknologi produk.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Teknologi</th>
                                <th className="px-3 py-2 text-left">Bidang</th>
                                <th className="px-3 py-2 text-center">TKT</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-left">Assessor</th>
                                <th className="px-3 py-2 text-left">Tanggal</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = STATUS_BADGE[r.status] || STATUS_BADGE.draft;
                                return (
                                    <tr key={r.id} className="hover:bg-amber-50/40">
                                        <td className="px-3 py-2 font-semibold max-w-xs truncate">{r.technology_title}</td>
                                        <td className="px-3 py-2 text-slate-600 text-[11px]">{r.category?.name}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-extrabold ${LEVEL_COLOR(r.achieved_level)}`}>
                                                {r.achieved_level}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-3 py-2">{r.assessor?.name || '—'}</td>
                                        <td className="px-3 py-2 text-[11px]">{r.assessed_at ? new Date(r.assessed_at).toLocaleDateString('id-ID') : '—'}</td>
                                        <td className="px-3 py-2 text-right">
                                            <button onClick={() => onOpen(r.id)} className="text-primary-700 hover:underline font-semibold inline-flex items-center gap-1">
                                                <Eye className="h-3.5 w-3.5" /> Buka
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

function RubricTab() {
    const { data: cats } = useQuery({
        queryKey: ['admin', 'trl-categories'],
        queryFn: () => api.get('/api/admin/trl-categories').then((r) => r.data.data),
    });

    const [selectedKey, setSelectedKey] = useState('umum');
    const selected = (cats || []).find((c) => c.key === selectedKey);

    const { data: detail } = useQuery({
        queryKey: ['admin', 'trl-categories', selected?.id],
        queryFn: () => api.get(`/api/admin/trl-categories/${selected.id}`).then((r) => r.data.data),
        enabled: !!selected,
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
            <Card>
                <CardContent className="p-2 space-y-1">
                    {(cats || []).map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedKey(c.key)}
                            className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold transition ${
                                c.key === selectedKey ? 'bg-primary-100 text-primary-900' : 'hover:bg-slate-100'
                            }`}
                        >
                            {c.name}
                            <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                                {c.total_indicators} indikator
                            </div>
                        </button>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    {!detail ? (
                        <Spinner className="mx-auto" />
                    ) : (
                        <>
                            <h3 className="font-bold text-base mb-1">{detail.name}</h3>
                            <p className="text-xs text-slate-600 mb-4">{detail.description}</p>
                            <div className="space-y-3">
                                {detail.levels.map((lvl) => (
                                    <div key={lvl.level} className="border-l-4 pl-3" style={{ borderColor: lvl.level >= 7 ? '#10b981' : lvl.level >= 4 ? '#f59e0b' : '#ef4444' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-extrabold ${LEVEL_COLOR(lvl.level)}`}>
                                                {lvl.level}
                                            </span>
                                            <strong className="text-sm">TKT {lvl.level}</strong>
                                            <span className="text-[10px] text-slate-500">({lvl.count} indikator)</span>
                                        </div>
                                        <ol className="list-decimal list-inside text-xs text-slate-700 space-y-0.5 ml-1">
                                            {lvl.indicators.map((ind) => <li key={ind.id}>{ind.description}</li>)}
                                        </ol>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function CreateDialog({ onClose, onCreated }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        technology_title: '',
        trl_category_id: '',
        threshold_percent: 80,
        notes: '',
    });
    const [formError, setFormError] = useState('');

    const { data: cats } = useQuery({
        queryKey: ['admin', 'trl-categories'],
        queryFn: () => api.get('/api/admin/trl-categories').then((r) => r.data.data),
    });

    const mutation = useMutation({
        mutationFn: () => api.post('/api/admin/trl-assessments', {
            ...form,
            assessable_type: 'App\\Models\\User',
            assessable_id: user?.id || 1,
        }),
        onSuccess: (res) => onCreated(res.data.data?.id),
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <Backdrop onClose={onClose} title="Mulai Pengukuran TKT">
            <div className="space-y-3">
                <Field label="Judul Teknologi / Produk *">
                    <Input value={form.technology_title} onChange={(e) => setForm({ ...form, technology_title: e.target.value })} placeholder="Mis: Sistem inverter IoT untuk panel surya" />
                </Field>
                <Field label="Bidang Teknologi *">
                    <select value={form.trl_category_id} onChange={(e) => setForm({ ...form, trl_category_id: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                        <option value="">— Pilih bidang —</option>
                        {(cats || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </Field>
                <Field label="Threshold Pemenuhan (%)">
                    <Input type="number" min="50" max="100" value={form.threshold_percent} onChange={(e) => setForm({ ...form, threshold_percent: Number(e.target.value) })} />
                    <div className="text-[10px] text-slate-500 mt-0.5">Default 80% (BRIN standard). Indikator dianggap terpenuhi bila skor ≥ threshold.</div>
                </Field>
                <Field label="Catatan">
                    <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                </Field>
                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button onClick={() => { setFormError(''); mutation.mutate(); }} disabled={!form.technology_title || !form.trl_category_id || mutation.isPending}>
                        {mutation.isPending ? 'Membuat…' : 'Mulai Pengukuran'}
                    </Button>
                </div>
            </div>
        </Backdrop>
    );
}

function DetailDialog({ id, onClose }) {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'trl-assessments', id],
        queryFn: () => api.get(`/api/admin/trl-assessments/${id}`).then((r) => r.data.data),
    });

    const [scores, setScores] = useState({});
    const [notes, setNotes] = useState('');
    const [formError, setFormError] = useState('');

    const refresh = () => qc.invalidateQueries({ queryKey: ['admin', 'trl-assessments', id] });

    const saveMutation = useMutation({
        mutationFn: () => api.patch(`/api/admin/trl-assessments/${id}`, {
            notes: notes || data?.notes,
            scores: Object.entries(scores).map(([indicatorId, payload]) => ({
                indicator_id: Number(indicatorId),
                score: Number(payload.score),
                evidence_note: payload.evidence_note || null,
            })),
        }),
        onSuccess: () => { refresh(); qc.invalidateQueries({ queryKey: ['admin', 'trl-assessments'] }); qc.invalidateQueries({ queryKey: ['admin', 'trl', 'stats'] }); },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    const finalizeMutation = useMutation({
        mutationFn: () => api.post(`/api/admin/trl-assessments/${id}/finalize`),
        onSuccess: () => { refresh(); qc.invalidateQueries({ queryKey: ['admin', 'trl-assessments'] }); qc.invalidateQueries({ queryKey: ['admin', 'trl', 'stats'] }); },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    if (isLoading || !data) {
        return <Backdrop onClose={onClose} title="Memuat…"><div className="py-10 flex justify-center"><Spinner /></div></Backdrop>;
    }

    // Group indicators by level + merge with current scores
    const scoresByInd = (data.scores || []).reduce((acc, s) => ({ ...acc, [s.trl_indicator_id]: s }), {});
    const byLevel = (data.category?.indicators || []).reduce((acc, ind) => {
        if (!acc[ind.level]) acc[ind.level] = [];
        acc[ind.level].push(ind);
        return acc;
    }, {});

    const computeLiveLevel = () => {
        let achieved = 0;
        for (let lvl = 1; lvl <= 9; lvl++) {
            const inds = byLevel[lvl] || [];
            if (!inds.length) continue;
            const allMet = inds.every((ind) => {
                const override = scores[ind.id]?.score;
                const score = override !== undefined ? Number(override) : (scoresByInd[ind.id]?.score ?? 0);
                const percent = score * 20;
                return percent >= data.threshold_percent;
            });
            if (allMet) achieved = lvl;
        }
        return achieved;
    };

    const liveLevel = computeLiveLevel();
    const isFinalized = data.status === 'finalized';

    return (
        <Backdrop onClose={onClose} title={data.technology_title} wide>
            <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap" style={{ background: '#eef2f9' }}>
                    <div>
                        <div className="text-xs text-slate-600">{data.category?.name}</div>
                        <div className="text-sm font-bold mt-0.5">TKT Tercapai (Live)</div>
                        <div className="text-[10px] text-slate-500">Threshold: ≥ {data.threshold_percent}% per indikator</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center justify-center w-16 h-16 rounded-lg text-3xl font-black ${LEVEL_COLOR(liveLevel)}`}>
                            {liveLevel}
                        </span>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">dari 9</div>
                            <div className="text-xs font-semibold mt-0.5">
                                {liveLevel === 0 ? 'Belum dinilai' : liveLevel >= 7 ? 'Siap deploy' : liveLevel >= 4 ? 'Prototype / Validasi' : 'Riset Dasar'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicators per level */}
                <div className="space-y-3">
                    {Object.entries(byLevel).sort((a, b) => Number(a[0]) - Number(b[0])).map(([lvl, inds]) => {
                        const numLvl = Number(lvl);
                        const allMet = inds.every((ind) => {
                            const override = scores[ind.id]?.score;
                            const score = override !== undefined ? Number(override) : (scoresByInd[ind.id]?.score ?? 0);
                            return score * 20 >= data.threshold_percent;
                        });
                        return (
                            <div key={lvl} className={`border-l-4 pl-3 ${allMet ? 'opacity-100' : 'opacity-90'}`} style={{ borderColor: numLvl >= 7 ? '#10b981' : numLvl >= 4 ? '#f59e0b' : '#ef4444' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-extrabold ${LEVEL_COLOR(numLvl)}`}>{numLvl}</span>
                                    <strong className="text-sm">TKT {numLvl}</strong>
                                    {allMet && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                                    <span className="text-[10px] text-slate-500">({inds.length} indikator)</span>
                                </div>
                                <div className="space-y-1.5">
                                    {inds.map((ind) => {
                                        const current = scoresByInd[ind.id];
                                        const override = scores[ind.id]?.score;
                                        const currentScore = override !== undefined ? Number(override) : (current?.score ?? 0);
                                        const percent = currentScore * 20;
                                        return (
                                            <div key={ind.id} className="flex items-start gap-2 text-xs">
                                                <select
                                                    value={currentScore}
                                                    disabled={isFinalized}
                                                    onChange={(e) => setScores((p) => ({ ...p, [ind.id]: { ...(p[ind.id] || {}), score: e.target.value } }))}
                                                    className={`flex-shrink-0 w-14 h-7 rounded border text-xs font-bold text-center ${
                                                        percent >= data.threshold_percent ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-300'
                                                    }`}
                                                >
                                                    {[0,1,2,3,4,5].map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <span className="flex-shrink-0 text-[10px] text-slate-500 w-8 mt-1">{percent}%</span>
                                                <span className="flex-1 text-slate-700 leading-snug mt-0.5">{ind.description}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Field label="Catatan Pengukuran">
                    <textarea
                        rows="2"
                        disabled={isFinalized}
                        defaultValue={data.notes || ''}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-md border border-slate-300 p-2 text-sm"
                    />
                </Field>

                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <Button variant="ghost" onClick={onClose}>Tutup</Button>
                    {!isFinalized && (
                        <>
                            <Button variant="outline" onClick={() => { setFormError(''); saveMutation.mutate(); }} disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? 'Menyimpan…' : 'Simpan Draft'}
                            </Button>
                            <Button onClick={() => { setFormError(''); finalizeMutation.mutate(); }} disabled={finalizeMutation.isPending}>
                                <FileCheck className="h-4 w-4 mr-1" />
                                {finalizeMutation.isPending ? 'Memfinalisasi…' : 'Finalisasi'}
                            </Button>
                        </>
                    )}
                </div>

                <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded">
                    <strong>Legenda Skor:</strong> 0=Tidak terpenuhi (0%), 1=20%, 2=40%, 3=60%, 4=80% (terpenuhi minimal), 5=100% (penuh).
                    Indikator hijau berarti sudah memenuhi threshold {data.threshold_percent}%.
                </div>
            </div>
        </Backdrop>
    );
}

function Backdrop({ children, onClose, title, wide = false }) {
    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className={`w-full bg-white shadow-2xl flex flex-col h-full overflow-hidden ${wide ? 'max-w-4xl' : 'max-w-xl'}`} onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight">{title}</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{label}</label>
            {children}
        </div>
    );
}

