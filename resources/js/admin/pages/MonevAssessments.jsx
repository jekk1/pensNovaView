import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Award, Plus, Eye, FileCheck } from 'lucide-react';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';

const STAGE_LABEL = {
    monev_1: 'Monev I (Pertengahan)',
    monev_2: 'Monev II (Akhir / Kelulusan)',
};

const STATUS_BADGE = {
    scheduled: { label: 'Terjadwal', variant: 'secondary' },
    in_progress: { label: 'Berlangsung', variant: 'warning' },
    completed: { label: 'Selesai', variant: 'success' },
    cancelled: { label: 'Dibatalkan', variant: 'destructive' },
};

export default function MonevAssessments() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ stage: '', status: '', q: '', page: 1 });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'monev', 'stats'],
        queryFn: () => api.get('/api/admin/monev-assessments-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'monev-assessments', filters],
        queryFn: () =>
            api.get('/api/admin/monev-assessments', {
                params: { ...filters, per_page: 25 },
            }).then((r) => r.data),
    });

    const rows = data?.data ?? [];
    const meta = data?.meta ?? data;

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ClipboardCheck className="h-6 w-6 text-primary-700" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Monev Program Inkubasi
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Penilaian formal program inkubasi 2 tahap per batch dengan rubrik bobot KPI. Kelulusan: skor minimal 80.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)} className="flex-shrink-0">
                    <Plus className="h-4 w-4 mr-1" /> Jadwalkan Monev
                </Button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <StatCard label="Total Assessment" value={stats?.total ?? '—'} icon={ClipboardCheck} color="primary" />
                <StatCard label="Terjadwal" value={stats?.scheduled ?? '—'} icon={Clock} color="amber" />
                <StatCard label="Selesai" value={stats?.completed ?? '—'} icon={FileCheck} color="emerald" />
                <StatCard label="Lulus" value={stats?.passed ?? '—'} icon={Award} color="emerald" />
                <StatCard label="Rata-rata Skor" value={stats?.avg_score ?? '—'} icon={CheckCircle2} color="primary" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari nama tenant…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.stage}
                        onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value, page: 1 }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Stage</option>
                        <option value="monev_1">Monev I</option>
                        <option value="monev_2">Monev II</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Status</option>
                        <option value="scheduled">Terjadwal</option>
                        <option value="in_progress">Berlangsung</option>
                        <option value="completed">Selesai</option>
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner className="h-6 w-6" /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <ClipboardCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <h3 className="font-bold text-sm">Belum ada Monev terjadwal</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Klik <strong>Jadwalkan Monev</strong> untuk mulai siklus penilaian tenant.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Tenant</th>
                                <th className="px-3 py-2 text-left">Stage</th>
                                <th className="px-3 py-2 text-left">Jadwal</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-right">Skor</th>
                                <th className="px-3 py-2 text-center">Lulus</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = STATUS_BADGE[r.status] || STATUS_BADGE.scheduled;
                                return (
                                    <tr key={r.id} className="hover:bg-amber-50/40">
                                        <td className="px-3 py-2 font-semibold text-slate-900">{r.tenant?.name || '—'}</td>
                                        <td className="px-3 py-2">{STAGE_LABEL[r.stage] || r.stage}</td>
                                        <td className="px-3 py-2 text-slate-600">
                                            {r.scheduled_at ? new Date(r.scheduled_at).toLocaleDateString('id-ID') : '—'}
                                        </td>
                                        <td className="px-3 py-2"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-3 py-2 text-right font-mono font-semibold">
                                            {r.total_score !== null && r.total_score !== undefined ? Number(r.total_score).toFixed(2) : '—'}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {r.passed === true && <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />}
                                            {r.passed === false && <XCircle className="h-4 w-4 text-rose-600 inline" />}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button
                                                onClick={() => setEditing(r.id)}
                                                className="inline-flex items-center gap-1 text-primary-700 hover:underline font-semibold"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {creating && <CreateDialog onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setEditing(id); qc.invalidateQueries({ queryKey: ['admin', 'monev-assessments'] }); qc.invalidateQueries({ queryKey: ['admin', 'monev', 'stats'] }); }} />}
            {editing && <DetailDialog id={editing} onClose={() => setEditing(null)} />}
        </div>
    );
}

function CreateDialog({ onClose, onCreated }) {
    const [form, setForm] = useState({ tenant_id: '', stage: 'monev_1', scheduled_at: '', team_members: '' });
    const [formError, setFormError] = useState('');
    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants', 'simple'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200 } }).then((r) => r.data.data),
    });
    const mutation = useMutation({
        mutationFn: (payload) => api.post('/api/admin/monev-assessments', payload).then((r) => r.data),
        onSuccess: (res) => onCreated(res.data?.id),
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <Backdrop onClose={onClose} title="Jadwalkan Monev Baru">
            <form onSubmit={(e) => { e.preventDefault(); setFormError(''); mutation.mutate(form); }} className="space-y-3">
                <Field label="Tenant *">
                    <select
                        value={form.tenant_id}
                        onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
                        required
                        className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                    >
                        <option value="">Pilih tenant…</option>
                        {(tenants || []).map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Stage *">
                    <select
                        value={form.stage}
                        onChange={(e) => setForm({ ...form, stage: e.target.value })}
                        required
                        className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                    >
                        <option value="monev_1">Monev I (Pertengahan)</option>
                        <option value="monev_2">Monev II (Akhir / Kelulusan)</option>
                    </select>
                </Field>
                <Field label="Tanggal Jadwal">
                    <Input type="date" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
                </Field>
                <Field label="Tim Monev (nama-nama dipisah koma)">
                    <Input value={form.team_members} onChange={(e) => setForm({ ...form, team_members: e.target.value })} placeholder="contoh: Endro Wahjono, Achmad Dzulkarnaen, Amir Baihaqi" />
                </Field>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded">
                    Saat dijadwalkan, sistem otomatis menggenerate 5 indikator KPI sesuai tahap Monev — total bobot 100%.
                </div>
                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
                    <Button type="submit" disabled={mutation.isPending || !form.tenant_id}>
                        {mutation.isPending ? 'Menyimpan…' : 'Jadwalkan'}
                    </Button>
                </div>
            </form>
        </Backdrop>
    );
}

function DetailDialog({ id, onClose }) {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'monev-assessments', id],
        queryFn: () => api.get(`/api/admin/monev-assessments/${id}`).then((r) => r.data.data),
    });
    const [scores, setScores] = useState({});
    const [notes, setNotes] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [formError, setFormError] = useState('');

    const a = data;
    const isFinalized = a?.status === 'completed';

    const handleSave = useMutation({
        mutationFn: () =>
            api.patch(`/api/admin/monev-assessments/${id}`, {
                notes,
                recommendation,
                scores: Object.entries(scores).map(([itemId, payload]) => ({
                    id: Number(itemId),
                    score: payload.score === '' ? null : Number(payload.score),
                    evidence_note: payload.evidence_note || null,
                })),
            }).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'monev-assessments', id] });
            qc.invalidateQueries({ queryKey: ['admin', 'monev-assessments'] });
            qc.invalidateQueries({ queryKey: ['admin', 'monev', 'stats'] });
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    const handleFinalize = useMutation({
        mutationFn: () => api.post(`/api/admin/monev-assessments/${id}/finalize`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'monev-assessments', id] });
            qc.invalidateQueries({ queryKey: ['admin', 'monev-assessments'] });
            qc.invalidateQueries({ queryKey: ['admin', 'monev', 'stats'] });
        },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    if (isLoading || !a) {
        return (
            <Backdrop onClose={onClose} title="Memuat…">
                <div className="py-10 flex justify-center"><Spinner className="h-6 w-6" /></div>
            </Backdrop>
        );
    }

    // Compute live preview total
    const liveTotal = (a.score_items || []).reduce((sum, it) => {
        const overrideScore = scores[it.id]?.score;
        const s = overrideScore !== undefined && overrideScore !== '' ? Number(overrideScore) : it.score;
        if (s === null || s === undefined || Number.isNaN(s)) return sum;
        return sum + (Number(s) * Number(it.weight)) / 100;
    }, 0);

    return (
        <Backdrop onClose={onClose} title={`Monev — ${a.tenant?.name || ''}`} wide>
            <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <Info label="Stage" value={STAGE_LABEL[a.stage]} />
                    <Info label="Status" value={STATUS_BADGE[a.status]?.label} />
                    <Info label="Jadwal" value={a.scheduled_at ? new Date(a.scheduled_at).toLocaleDateString('id-ID') : '—'} />
                    <Info label="Tim Monev" value={a.team_members || '—'} />
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-100 text-[10px] uppercase">
                            <tr>
                                <th className="px-2 py-2 text-left">Uraian Kegiatan</th>
                                <th className="px-2 py-2 text-left">KPI</th>
                                <th className="px-2 py-2 text-left">Target</th>
                                <th className="px-2 py-2 text-right">Bobot</th>
                                <th className="px-2 py-2 text-right w-24">Skor (0–100)</th>
                                <th className="px-2 py-2 text-right">Tertimbang</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(a.score_items || []).map((it) => {
                                const overrideScore = scores[it.id]?.score;
                                const s = overrideScore !== undefined ? overrideScore : (it.score ?? '');
                                const weighted = s !== '' && s !== null ? (Number(s) * Number(it.weight)) / 100 : null;
                                return (
                                    <tr key={it.id} className="hover:bg-amber-50/30">
                                        <td className="px-2 py-2 font-semibold">{it.kpi_label}</td>
                                        <td className="px-2 py-2 text-slate-600">{it.kpi_indicator}</td>
                                        <td className="px-2 py-2 text-slate-600">{it.target || '—'}</td>
                                        <td className="px-2 py-2 text-right font-mono">{Number(it.weight)}%</td>
                                        <td className="px-2 py-2 text-right">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                disabled={isFinalized}
                                                value={s}
                                                onChange={(e) => setScores((prev) => ({
                                                    ...prev,
                                                    [it.id]: { ...(prev[it.id] || {}), score: e.target.value },
                                                }))}
                                                className="w-20 h-7 rounded border border-slate-300 px-1 text-right font-mono"
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-right font-mono font-semibold">
                                            {weighted !== null ? weighted.toFixed(2) : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-xs">
                            <tr>
                                <td colSpan="3" className="px-2 py-2 text-right">TOTAL SKOR</td>
                                <td className="px-2 py-2 text-right font-mono">100%</td>
                                <td className="px-2 py-2 text-right">
                                    <Badge variant={liveTotal >= 80 ? 'success' : 'warning'}>
                                        {liveTotal >= 80 ? 'LULUS' : 'BELUM'}
                                    </Badge>
                                </td>
                                <td className="px-2 py-2 text-right font-mono text-base">{liveTotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <Field label="Catatan Monev">
                    <textarea
                        rows="3"
                        disabled={isFinalized}
                        defaultValue={a.notes || ''}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-md border border-slate-300 p-2 text-sm"
                    />
                </Field>

                <Field label="Rekomendasi">
                    <textarea
                        rows="2"
                        disabled={isFinalized}
                        defaultValue={a.recommendation || ''}
                        onChange={(e) => setRecommendation(e.target.value)}
                        className="w-full rounded-md border border-slate-300 p-2 text-sm"
                    />
                </Field>

                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button variant="ghost" onClick={onClose}>Tutup</Button>
                    {!isFinalized && (
                        <>
                            <Button variant="outline" onClick={() => { setFormError(''); handleSave.mutate(); }} disabled={handleSave.isPending}>
                                {handleSave.isPending ? 'Menyimpan…' : 'Simpan Draft'}
                            </Button>
                            <Button onClick={() => handleFinalize.mutate()} disabled={handleFinalize.isPending}>
                                <FileCheck className="h-4 w-4 mr-1" />
                                {handleFinalize.isPending ? 'Memfinalisasi…' : 'Finalisasi'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Backdrop>
    );
}

function Backdrop({ children, onClose, title, wide = false }) {
    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div
                className={`w-full bg-white shadow-2xl flex flex-col h-full overflow-hidden ${wide ? 'max-w-4xl' : 'max-w-xl'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight">{title}</h2>
                    <button onClick={onClose} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-200 text-slate-600">✕</button>
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

function Info({ label, value }) {
    return (
        <div className="bg-slate-50 rounded p-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
            <div className="text-xs font-semibold mt-0.5">{value || '—'}</div>
        </div>
    );
}
