import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Award, AlertTriangle, Clock, Plus, Eye, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';

const DECISION_BADGE = {
    pending: { label: 'Pending', variant: 'secondary' },
    graduate: { label: 'Graduate', variant: 'success' },
    extend: { label: 'Extended', variant: 'warning' },
    expelled: { label: 'Expelled', variant: 'destructive' },
};

const fmtIDR = (n) => n ? `Rp ${Number(n).toLocaleString('id-ID')}` : '—';

export default function Graduations() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ decision: '', q: '', page: 1 });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'graduations', 'stats'],
        queryFn: () => api.get('/api/admin/graduations-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'graduations', filters],
        queryFn: () => api.get('/api/admin/graduations', { params: { ...filters, per_page: 25 } }).then((r) => r.data),
    });

    const rows = data?.data ?? [];

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="h-6 w-6 text-primary-700" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Kelulusan Tenant (Eksit)
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Kriteria lulus: kekayaan bersih ≥ Rp 200 juta atau penjualan tahunan ≥ Rp 300 juta, atau mampu kontribusi pendanaan ke inkubator, atau mengembangkan networking. Skor Monev akhir minimal 80.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)} className="flex-shrink-0">
                    <Plus className="h-4 w-4 mr-1" /> Buat Evaluasi
                </Button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <StatCard label="Total" value={stats?.total ?? '—'} icon={GraduationCap} color="primary" />
                <StatCard label="Pending" value={stats?.pending ?? '—'} icon={Clock} color="amber" />
                <StatCard label="Lulus" value={stats?.graduated ?? '—'} icon={Award} color="emerald" />
                <StatCard label="Diperpanjang" value={stats?.extended ?? '—'} icon={RefreshCw} color="amber" />
                <StatCard label="Dikeluarkan" value={stats?.expelled ?? '—'} icon={AlertTriangle} color="rose" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari tenant…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.decision}
                        onChange={(e) => setFilters((f) => ({ ...f, decision: e.target.value, page: 1 }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Keputusan</option>
                        <option value="pending">Pending</option>
                        <option value="graduate">Graduate</option>
                        <option value="extend">Extended</option>
                        <option value="expelled">Expelled</option>
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner className="h-6 w-6" /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <GraduationCap className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <h3 className="font-bold text-sm">Belum ada evaluasi kelulusan</h3>
                        <p className="text-xs text-slate-500 mt-1">Klik Buat Evaluasi untuk mulai proses eksit tenant.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Tenant</th>
                                <th className="px-3 py-2 text-right">Net Worth</th>
                                <th className="px-3 py-2 text-right">Revenue</th>
                                <th className="px-3 py-2 text-right">Skor Monev II</th>
                                <th className="px-3 py-2 text-left">Keputusan</th>
                                <th className="px-3 py-2 text-left">Reviewer</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = DECISION_BADGE[r.decision] || DECISION_BADGE.pending;
                                return (
                                    <tr key={r.id} className="hover:bg-amber-50/40">
                                        <td className="px-3 py-2 font-semibold">{r.tenant?.name || '—'}</td>
                                        <td className="px-3 py-2 text-right font-mono">{fmtIDR(r.annual_net_worth)}</td>
                                        <td className="px-3 py-2 text-right font-mono">{fmtIDR(r.annual_revenue)}</td>
                                        <td className="px-3 py-2 text-right font-mono font-semibold">
                                            {r.final_monev_score !== null && r.final_monev_score !== undefined ? Number(r.final_monev_score).toFixed(2) : '—'}
                                        </td>
                                        <td className="px-3 py-2"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-3 py-2 text-slate-700">{r.reviewer?.name || '—'}</td>
                                        <td className="px-3 py-2 text-right">
                                            <button onClick={() => setEditing(r.id)} className="inline-flex items-center gap-1 text-primary-700 hover:underline font-semibold">
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

            {creating && <CreateDialog onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setEditing(id); qc.invalidateQueries({ queryKey: ['admin', 'graduations'] }); qc.invalidateQueries({ queryKey: ['admin', 'graduations', 'stats'] }); }} />}
            {editing && <DetailDialog id={editing} onClose={() => setEditing(null)} />}
        </div>
    );
}

function CreateDialog({ onClose, onCreated }) {
    const [tenantId, setTenantId] = useState('');
    const [formError, setFormError] = useState('');
    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants', 'simple-incubation'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200, status: 'incubation' } }).then((r) => r.data.data),
    });

    const mutation = useMutation({
        mutationFn: () => api.post('/api/admin/graduations', { tenant_id: tenantId }).then((r) => r.data),
        onSuccess: (res) => onCreated(res.data?.id),
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <Backdrop onClose={onClose} title="Buat Evaluasi Kelulusan">
            <div className="space-y-3">
                <label className="text-xs font-semibold">Pilih Tenant Aktif:</label>
                <select
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                >
                    <option value="">— Pilih tenant —</option>
                    {(tenants || []).map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded">
                    Skor Monev II terakhir akan otomatis di-pull (jika tenant sudah pernah dievaluasi).
                </div>
                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button onClick={() => { setFormError(''); mutation.mutate(); }} disabled={!tenantId || mutation.isPending}>
                        {mutation.isPending ? 'Membuat…' : 'Buat'}
                    </Button>
                </div>
            </div>
        </Backdrop>
    );
}

function DetailDialog({ id, onClose }) {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'graduations', id],
        queryFn: () => api.get(`/api/admin/graduations/${id}`).then((r) => r.data),
    });

    const [form, setForm] = useState({});
    const [touched, setTouched] = useState(false);
    const [formError, setFormError] = useState('');

    const grad = data?.data;
    const evaluation = data?.evaluation;
    const isFinalized = grad && grad.decision !== 'pending';

    const updateMutation = useMutation({
        mutationFn: () => api.patch(`/api/admin/graduations/${id}`, form),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'graduations', id] }),
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    const decideMutation = useMutation({
        mutationFn: (decision) => api.post(`/api/admin/graduations/${id}/decide`, { decision, notes: form.notes }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'graduations', id] });
            qc.invalidateQueries({ queryKey: ['admin', 'graduations'] });
            qc.invalidateQueries({ queryKey: ['admin', 'graduations', 'stats'] });
        },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    if (isLoading || !grad) {
        return <Backdrop onClose={onClose} title="Memuat…"><div className="py-10 flex justify-center"><Spinner /></div></Backdrop>;
    }

    const fields = {
        annual_net_worth: grad.annual_net_worth,
        annual_revenue: grad.annual_revenue,
        final_monev_score: grad.final_monev_score,
        can_contribute_to_incubator: grad.can_contribute_to_incubator,
        has_networking_capability: grad.has_networking_capability,
        violated_workspace_rules: grad.violated_workspace_rules,
        absent_from_activities: grad.absent_from_activities,
        notes: grad.notes,
        ...form,
    };

    const setField = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setTouched(true); };

    return (
        <Backdrop onClose={onClose} title={`Evaluasi Kelulusan — ${grad.tenant?.name}`} wide>
            <div className="space-y-5">
                {/* Eligibility summary */}
                <Card className={evaluation?.eligible_to_graduate ? 'border-emerald-300 bg-emerald-50/40' : evaluation?.should_expel ? 'border-rose-300 bg-rose-50/40' : 'border-amber-300 bg-amber-50/40'}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {evaluation?.eligible_to_graduate ? <CheckCircle2 className="h-5 w-5 text-emerald-700" /> : evaluation?.should_expel ? <XCircle className="h-5 w-5 text-rose-700" /> : <Clock className="h-5 w-5 text-amber-700" />}
                            <span className="font-bold text-sm">
                                {evaluation?.eligible_to_graduate ? 'Memenuhi kriteria LULUS' : evaluation?.should_expel ? 'Ada flag untuk DIKELUARKAN' : 'Belum memenuhi kriteria — pertimbangkan EXTEND'}
                            </span>
                        </div>
                        <div className="text-xs space-y-1">
                            {Object.entries(evaluation?.criteria_met || {}).map(([k, v]) => (
                                <div key={k} className="flex items-center gap-2">
                                    {v ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-400" />}
                                    <span className={v ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>{labelFor(k)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Kekayaan Bersih Tahunan (Rp)">
                        <Input type="number" disabled={isFinalized} value={fields.annual_net_worth ?? ''} onChange={(e) => setField('annual_net_worth', e.target.value)} />
                        <div className="text-[10px] text-slate-500 mt-0.5">Threshold lulus: Rp 200.000.000</div>
                    </Field>
                    <Field label="Penjualan Tahunan (Rp)">
                        <Input type="number" disabled={isFinalized} value={fields.annual_revenue ?? ''} onChange={(e) => setField('annual_revenue', e.target.value)} />
                        <div className="text-[10px] text-slate-500 mt-0.5">Threshold lulus: Rp 300.000.000</div>
                    </Field>
                    <Field label="Skor Monev II">
                        <Input type="number" step="0.01" min="0" max="100" disabled={isFinalized} value={fields.final_monev_score ?? ''} onChange={(e) => setField('final_monev_score', e.target.value)} />
                        <div className="text-[10px] text-slate-500 mt-0.5">Lulus jika ≥ 80</div>
                    </Field>
                    <div className="space-y-1">
                        <Checkbox checked={!!fields.can_contribute_to_incubator} disabled={isFinalized} onChange={(v) => setField('can_contribute_to_incubator', v)} label="Mampu kontribusi pendanaan ke Inkubator" />
                        <Checkbox checked={!!fields.has_networking_capability} disabled={isFinalized} onChange={(v) => setField('has_networking_capability', v)} label="Mampu kembangkan networking & pemasaran" />
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2">
                    <div className="text-xs font-semibold text-rose-700">Flag Pelanggaran (memaksa keputusan EXPELLED)</div>
                    <Checkbox checked={!!fields.violated_workspace_rules} disabled={isFinalized} onChange={(v) => setField('violated_workspace_rules', v)} label="Melanggar aturan workspace" />
                    <Checkbox checked={!!fields.absent_from_activities} disabled={isFinalized} onChange={(v) => setField('absent_from_activities', v)} label="Tidak ikuti kegiatan yang disepakati" />
                </div>

                <Field label="Catatan / Rekomendasi">
                    <textarea
                        rows="3"
                        disabled={isFinalized}
                        value={fields.notes ?? ''}
                        onChange={(e) => setField('notes', e.target.value)}
                        className="w-full rounded-md border border-slate-300 p-2 text-sm disabled:bg-slate-50"
                    />
                </Field>

                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button variant="ghost" onClick={onClose}>Tutup</Button>
                    {!isFinalized ? (
                        <>
                            <Button variant="outline" disabled={!touched || updateMutation.isPending} onClick={() => { setFormError(''); updateMutation.mutate(); }}>
                                {updateMutation.isPending ? 'Menyimpan…' : 'Simpan Data'}
                            </Button>
                            <Button variant="destructive" disabled={decideMutation.isPending} onClick={() => decideMutation.mutate('expelled')}>
                                Dikeluarkan
                            </Button>
                            <Button variant="amber" disabled={decideMutation.isPending} onClick={() => decideMutation.mutate('extend')}>
                                Perpanjang
                            </Button>
                            <Button disabled={decideMutation.isPending} onClick={() => decideMutation.mutate('graduate')}>
                                <GraduationCap className="h-4 w-4 mr-1" /> Luluskan
                            </Button>
                        </>
                    ) : (
                        <div className="text-sm text-slate-700">
                            Keputusan: <Badge variant={DECISION_BADGE[grad.decision]?.variant}>{DECISION_BADGE[grad.decision]?.label}</Badge> oleh <strong>{grad.reviewer?.name}</strong>
                        </div>
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
            <div className={`w-full bg-white shadow-2xl flex flex-col h-full overflow-hidden ${wide ? 'max-w-3xl' : 'max-w-xl'}`} onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight">{title}</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return <div><label className="text-xs font-semibold text-slate-700 block mb-1">{label}</label>{children}</div>;
}

function Checkbox({ checked, onChange, label, disabled }) {
    return (
        <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
                type="checkbox"
                checked={!!checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="rounded border-slate-300"
            />
            <span>{label}</span>
        </label>
    );
}

function labelFor(key) {
    return ({
        meets_net_worth_threshold: 'Kekayaan bersih ≥ Rp 200jt',
        meets_revenue_threshold: 'Penjualan tahunan ≥ Rp 300jt',
        can_contribute_to_incubator: 'Kontribusi pendanaan ke Inkubator',
        has_networking_capability: 'Networking & pemasaran',
        passed_monev_2: 'Skor Monev II ≥ 80',
    })[key] || key;
}
