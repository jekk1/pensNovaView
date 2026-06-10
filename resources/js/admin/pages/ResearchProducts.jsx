import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FlaskConical, Plus, Eye, CheckCircle2, AlertCircle, TrendingUp,
    Target, Award, Sparkles, X, ArrowRight, User as UserIcon, Upload, Download,
} from 'lucide-react';
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
    submitted: { label: 'Submitted', variant: 'warning' },
    assessing_trl: { label: 'Assess TKT', variant: 'warning' },
    assessing_mrl: { label: 'Assess MRL', variant: 'warning' },
    ready_to_commercialize: { label: 'Siap Komersialisasi', variant: 'success' },
    commercialized: { label: 'Dikomersialisasi', variant: 'success' },
    archived: { label: 'Diarsipkan', variant: 'secondary' },
};

const TRL_COLOR = (level) => {
    if (level >= 7) return 'bg-emerald-500 text-white';
    if (level >= 4) return 'bg-amber-400 text-amber-900';
    if (level >= 1) return 'bg-rose-500 text-white';
    return 'bg-slate-300 text-slate-700';
};

const MRL_COLOR = (score) => {
    if (score >= 7) return 'bg-emerald-500 text-white';
    if (score >= 4) return 'bg-amber-400 text-amber-900';
    if (score >= 1) return 'bg-rose-500 text-white';
    return 'bg-slate-300 text-slate-700';
};

export default function ResearchProducts() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '', q: '', eligible_only: '' });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [importing, setImporting] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'research-products', 'stats'],
        queryFn: () => api.get('/api/admin/research-products-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'research-products', filters],
        queryFn: () => api.get('/api/admin/research-products', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    const rows = data?.data ?? [];

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FlaskConical className="h-6 w-6 text-sky-700" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Produk Dosen — Divisi Applied Research & Innovation
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Pipeline: Dosen daftar produk → Pengukuran TKT (BRIN) → Pengukuran MRL Dual-Track (self + external reviewer)
                        → Eligible komersialisasi (Lisensi HKI atau Spin-off via Inkubator).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setImporting(true)}>
                        <Upload className="h-4 w-4 mr-1" /> Import CSV
                    </Button>
                    <Button onClick={() => setCreating(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Daftarkan Produk
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <StatCard label="Total Produk" value={stats?.total ?? '—'} icon={FlaskConical} color="primary" />
                <StatCard label="Dalam Pipeline" value={stats?.in_pipeline ?? '—'} icon={TrendingUp} color="amber" />
                <StatCard label="Siap Komersialisasi" value={stats?.ready_to_commercialize ?? '—'} icon={Award} color="emerald" />
                <StatCard label="Avg TKT" value={stats?.avg_trl || '—'} icon={Target} color="primary" />
                <StatCard label="Avg MRL" value={stats?.avg_mrl || '—'} icon={Sparkles} color="emerald" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari produk / inventor…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.eligible_only === '1'}
                            onChange={(e) => setFilters((f) => ({ ...f, eligible_only: e.target.checked ? '1' : '' }))}
                            className="rounded border-slate-300"
                        />
                        Hanya yang eligible komersialisasi (TKT ≥ 6 & MRL ≥ 5)
                    </label>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <FlaskConical className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <h3 className="font-bold text-sm">Belum ada produk dosen terdaftar</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Klik <strong>Daftarkan Produk</strong> untuk mulai pipeline assessment.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Produk / Inventor</th>
                                <th className="px-3 py-2 text-left">Bidang</th>
                                <th className="px-3 py-2 text-center">TKT</th>
                                <th className="px-3 py-2 text-center">MRL</th>
                                <th className="px-3 py-2 text-left">Status Pipeline</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = STATUS_BADGE[r.status] || STATUS_BADGE.draft;
                                const isEligible = (r.current_trl_level ?? 0) >= 6 && (r.current_mrl_score ?? 0) >= 5;
                                return (
                                    <tr key={r.id} className={`hover:bg-amber-50/40 ${isEligible ? 'bg-emerald-50/30' : ''}`}>
                                        <td className="px-3 py-2">
                                            <div className="font-semibold">{r.title}</div>
                                            <div className="text-[10px] text-slate-500">
                                                {r.primary_inventor_name} · {r.holding_unit || '—'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-[11px] text-slate-600">{r.trl_category?.name || '—'}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded font-extrabold text-xs ${TRL_COLOR(r.current_trl_level ?? 0)}`}>
                                                {r.current_trl_level ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded font-extrabold text-[11px] ${MRL_COLOR(Number(r.current_mrl_score) ?? 0)}`}>
                                                {r.current_mrl_score ? Number(r.current_mrl_score).toFixed(1) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <Badge variant={st.variant}>{st.label}</Badge>
                                            {isEligible && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">ELIGIBLE</span>}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button onClick={() => setEditing(r.id)} className="text-primary-700 hover:underline font-semibold inline-flex items-center gap-1">
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

            {creating && <ProductForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); qc.invalidateQueries({ queryKey: ['admin', 'research-products'] }); qc.invalidateQueries({ queryKey: ['admin', 'research-products', 'stats'] }); }} />}
            {importing && <ImportDialog onClose={() => setImporting(false)} onImported={() => { setImporting(false); qc.invalidateQueries({ queryKey: ['admin', 'research-products'] }); qc.invalidateQueries({ queryKey: ['admin', 'research-products', 'stats'] }); }} />}
            {editing && <ProductDetail id={editing} onClose={() => setEditing(null)} />}
        </div>
    );
}

function ProductForm({ id, onClose, onSaved }) {
    const isEdit = !!id;
    const { user } = useAuth();
    const [form, setForm] = useState({
        title: '',
        description: '',
        value_proposition: '',
        target_market: '',
        trl_category_id: '',
        primary_inventor_name: user?.name || '',
        primary_inventor_email: user?.email || '',
        holding_unit: '',
    });
    const [formError, setFormError] = useState('');

    const { data: cats } = useQuery({
        queryKey: ['admin', 'trl-categories'],
        queryFn: () => api.get('/api/admin/trl-categories').then((r) => r.data.data),
    });

    const mutation = useMutation({
        mutationFn: () => api.post('/api/admin/research-products', form),
        onSuccess: onSaved,
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <Backdrop onClose={onClose} title="Daftarkan Produk Dosen">
            <div className="space-y-3">
                <div className="bg-sky-50 border border-sky-200 rounded p-3 text-xs text-sky-900">
                    <strong>Pipeline:</strong> Produk akan masuk status <em>Submitted</em>, lalu Anda perlu jalankan
                    pengukuran TKT (via menu Pengukuran TKT) dan MRL (via tombol di detail produk).
                    Setelah TKT ≥ 6 & MRL ≥ 5, produk akan otomatis tagged <strong>Eligible Komersialisasi</strong>.
                </div>
                <Field label="Judul Produk *">
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mis: Sistem deteksi dini kebakaran hutan berbasis IoT" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Bidang Teknologi *">
                        <select value={form.trl_category_id} onChange={(e) => setForm({ ...form, trl_category_id: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                            <option value="">— Pilih —</option>
                            {(cats || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Unit Pengampu">
                        <Input value={form.holding_unit} onChange={(e) => setForm({ ...form, holding_unit: e.target.value })} placeholder="Mis: Departemen Teknik Elektro PENS" />
                    </Field>
                    <Field label="Inventor Utama *">
                        <Input value={form.primary_inventor_name} onChange={(e) => setForm({ ...form, primary_inventor_name: e.target.value })} />
                    </Field>
                    <Field label="Email Inventor">
                        <Input type="email" value={form.primary_inventor_email} onChange={(e) => setForm({ ...form, primary_inventor_email: e.target.value })} />
                    </Field>
                </div>
                <Field label="Deskripsi Produk">
                    <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                </Field>
                <Field label="Value Proposition">
                    <textarea rows="2" value={form.value_proposition} onChange={(e) => setForm({ ...form, value_proposition: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="Apa keunggulan utama produk ini? Masalah apa yang diselesaikan?" />
                </Field>
                <Field label="Target Market">
                    <textarea rows="2" value={form.target_market} onChange={(e) => setForm({ ...form, target_market: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="Siapa target pengguna/pembeli produk ini?" />
                </Field>

                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button onClick={() => { setFormError(''); mutation.mutate(); }} disabled={!form.title || !form.primary_inventor_name || mutation.isPending}>
                        {mutation.isPending ? 'Mendaftarkan…' : 'Daftarkan Produk'}
                    </Button>
                </div>
            </div>
        </Backdrop>
    );
}

function ProductDetail({ id, onClose }) {
    const qc = useQueryClient();
    const [tab, setTab] = useState('info');

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'research-products', id],
        queryFn: () => api.get(`/api/admin/research-products/${id}`).then((r) => r.data),
    });

    const product = data?.data;
    const isEligible = data?.is_eligible_for_commercialization;
    const thresholds = data?.thresholds;

    if (isLoading || !product) {
        return <Backdrop onClose={onClose} title="Memuat…" wide><Spinner className="mx-auto" /></Backdrop>;
    }

    return (
        <Backdrop onClose={onClose} title={product.title} wide>
            <div className="space-y-4">
                {/* Pipeline summary */}
                <div className={`rounded-lg p-4 ${isEligible ? 'bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-300' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <PipelineStep label="Daftar" done current={false} />
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                            <PipelineStep label={`TKT ${product.current_trl_level ?? '—'}`} done={(product.current_trl_level ?? 0) > 0} current={!(product.current_trl_level ?? 0)} />
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                            <PipelineStep label={`MRL ${product.current_mrl_score ? Number(product.current_mrl_score).toFixed(1) : '—'}`} done={(product.current_mrl_score ?? 0) > 0} current={!(product.current_mrl_score ?? 0)} />
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                            <PipelineStep label="Komersialisasi" done={isEligible} current={false} />
                        </div>
                        {isEligible && (
                            <Badge variant="success" className="text-xs">
                                <Award className="h-3 w-3 mr-1" /> ELIGIBLE KOMERSIALISASI
                            </Badge>
                        )}
                    </div>
                    {!isEligible && thresholds && (
                        <div className="text-[11px] text-slate-600 mt-2">
                            Threshold eligibility: TKT ≥ {thresholds.min_trl}, MRL ≥ {thresholds.min_mrl}.
                            {' '}Saat ini TKT={product.current_trl_level ?? '—'}, MRL={product.current_mrl_score ? Number(product.current_mrl_score).toFixed(1) : '—'}.
                        </div>
                    )}
                </div>

                <div className="border-b border-slate-200 flex gap-1">
                    {[
                        ['info', 'Info Produk'],
                        ['mrl', 'MRL Dual-Track'],
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

                {tab === 'info' && <InfoTab product={product} />}
                {tab === 'mrl' && <MrlTab product={product} onRefresh={() => qc.invalidateQueries({ queryKey: ['admin', 'research-products', id] })} />}
            </div>
        </Backdrop>
    );
}

function InfoTab({ product }) {
    return (
        <div className="space-y-3 text-sm">
            <Info label="Inventor Utama" value={product.primary_inventor_name + (product.primary_inventor_email ? ` (${product.primary_inventor_email})` : '')} />
            <Info label="Unit Pengampu" value={product.holding_unit || '—'} />
            <Info label="Bidang Teknologi" value={product.trl_category?.name || '—'} />
            <Info label="Deskripsi" value={product.description || '—'} multiline />
            <Info label="Value Proposition" value={product.value_proposition || '—'} multiline />
            <Info label="Target Market" value={product.target_market || '—'} multiline />
            <LinkPatentSection product={product} />
            {product.linked_tenant_id && <Info label="Linked Tenant" value={product.linked_tenant?.name || '—'} />}
        </div>
    );
}

function LinkPatentSection({ product }) {
    const qc = useQueryClient();
    const [selecting, setSelecting] = useState(false);
    const [formError, setFormError] = useState('');

    const { data: patents } = useQuery({
        queryKey: ['admin', 'patents-list-for-link'],
        queryFn: () => api.get('/api/admin/patents', { params: { per_page: 200 } }).then((r) => r.data?.data ?? []),
        enabled: selecting,
    });

    const update = useMutation({
        mutationFn: (patentId) => api.patch(`/api/admin/research-products/${product.slug}`, {
            linked_patent_id: patentId || null,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'research-products', product.id] });
            qc.invalidateQueries({ queryKey: ['admin', 'research-products'] });
            setSelecting(false);
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <div className="bg-amber-50 ring-1 ring-amber-200 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider">🛡️ Paten / HKI Terkait</div>
                {! selecting && (
                    <button
                        onClick={() => setSelecting(true)}
                        className="text-xs text-primary-700 hover:underline font-semibold"
                    >
                        {product.linked_patent_id ? 'Ubah' : '+ Link Paten'}
                    </button>
                )}
            </div>
            {product.linked_patent && ! selecting && (
                <div>
                    <div className="font-semibold text-sm text-slate-900">{product.linked_patent.title}</div>
                    {product.linked_patent.reference_number && (
                        <div className="text-xs font-mono text-slate-500 mt-0.5">No. {product.linked_patent.reference_number}</div>
                    )}
                </div>
            )}
            {! product.linked_patent && ! selecting && (
                <div className="text-xs text-slate-500 italic">Belum ada paten ter-link. Link kalau produk ini dilindungi HKI.</div>
            )}
            {selecting && (
                <div className="space-y-2 mt-2">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <select
                        defaultValue={product.linked_patent_id || ''}
                        onChange={(e) => { setFormError(''); update.mutate(e.target.value); }}
                        disabled={update.isPending}
                        className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                    >
                        <option value="">— Tidak ter-link —</option>
                        {(patents || []).map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.title} {p.reference_number ? `(${p.reference_number})` : ''}
                            </option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setSelecting(false)}
                            className="text-xs px-3 py-1 rounded hover:bg-slate-100"
                            disabled={update.isPending}
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function MrlTab({ product, onRefresh }) {
    const qc = useQueryClient();
    const { data: criteria } = useQuery({
        queryKey: ['admin', 'mrl-criteria'],
        queryFn: () => api.get('/api/admin/mrl-criteria').then((r) => r.data),
    });

    const { data: assessments } = useQuery({
        queryKey: ['admin', 'mrl-assessments', { product: product.id }],
        queryFn: () => api.get('/api/admin/mrl-assessments', { params: { assessable_type: 'App\\Models\\ResearchProduct' } }).then((r) => r.data),
    });

    const ownAssessments = (assessments?.data || []).filter((a) => a.assessable_id === product.id);
    const latest = ownAssessments[0];

    const [showForm, setShowForm] = useState(null); // 'self' | 'external' | null

    const createAssessment = useMutation({
        mutationFn: () => api.post('/api/admin/mrl-assessments', {
            assessable_type: 'App\\Models\\ResearchProduct',
            assessable_id: product.id,
            product_title: product.title,
            score_strategy: 'lower_of_two',
        }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'mrl-assessments', { product: product.id }] }),
        onError: (e) => alert(apiErrorMessage(e)),
    });

    if (!latest) {
        return (
            <div className="text-center py-8">
                <Sparkles className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <h3 className="font-bold text-sm">Belum ada MRL assessment</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">Mulai MRL untuk produk ini.</p>
                <Button onClick={() => createAssessment.mutate()} disabled={createAssessment.isPending}>
                    {createAssessment.isPending ? 'Memulai…' : 'Mulai MRL Assessment'}
                </Button>
            </div>
        );
    }

    const crits = criteria?.data || [];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <ScoreCard
                    label="Self Assessment"
                    score={latest.self_score}
                    subtitle={latest.self_assessed_at ? `oleh ${latest.self_assessor?.name || 'inventor'}` : 'Belum diisi'}
                    color="primary"
                />
                <ScoreCard
                    label="External Review"
                    score={latest.external_score}
                    subtitle={latest.external_reviewer_name || (latest.external_assessed_at ? 'External reviewer' : 'Belum direview')}
                    color="amber"
                />
                <ScoreCard
                    label="Final Score"
                    score={latest.final_score}
                    subtitle={`Strategy: ${latest.score_strategy}`}
                    color="emerald"
                    big
                />
            </div>

            <div className="flex gap-2 flex-wrap">
                {!latest.self_assessed_at && <Button onClick={() => setShowForm('self')}>Isi Self-Assessment</Button>}
                {!latest.external_assessed_at && (
                    <>
                        <Button variant="outline" onClick={() => setShowForm('external')}>Isi Manual External Review</Button>
                        <GenerateReviewSurveyButton
                            mrlId={latest.id}
                            onCreated={() => qc.invalidateQueries({ queryKey: ['admin', 'mrl-assessments', { product: product.id }] })}
                        />
                    </>
                )}
                {latest.self_assessed_at && latest.external_assessed_at && latest.status !== 'finalized' && (
                    <Button onClick={async () => {
                        await api.post(`/api/admin/mrl-assessments/${latest.id}/finalize`);
                        qc.invalidateQueries({ queryKey: ['admin', 'mrl-assessments', { product: product.id }] });
                        onRefresh?.();
                    }}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Finalisasi MRL
                    </Button>
                )}
            </div>

            {showForm && (
                <ScoreForm
                    type={showForm}
                    assessment={latest}
                    criteria={crits}
                    onClose={() => setShowForm(null)}
                    onSaved={() => {
                        setShowForm(null);
                        qc.invalidateQueries({ queryKey: ['admin', 'mrl-assessments', { product: product.id }] });
                    }}
                />
            )}

            <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded leading-relaxed">
                <strong>Dual-Track:</strong> Self-assessment diisi inventor sendiri, external review diisi reviewer luar.
                Final score dihitung pakai strategy (default <code className="bg-white px-1 rounded">lower_of_two</code> — konservatif).
                Bisa diganti ke <code className="bg-white px-1 rounded">average</code> atau <code className="bg-white px-1 rounded">weighted</code> (70% external + 30% self).
            </div>
        </div>
    );
}

function ScoreForm({ type, assessment, criteria, onClose, onSaved }) {
    const [scores, setScores] = useState({});
    const [notes, setNotes] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [reviewerEmail, setReviewerEmail] = useState('');
    const [reviewerAff, setReviewerAff] = useState('');
    const [formError, setFormError] = useState('');

    const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight), 0);
    const weightedSum = criteria.reduce((sum, c) => {
        const s = Number(scores[c.key] || 0);
        return sum + s * Number(c.weight);
    }, 0);
    const liveMrl = totalWeight > 0 ? Math.round((9 * weightedSum) / (5 * totalWeight) * 100) / 100 : 0;

    const submit = useMutation({
        mutationFn: () => api.post(`/api/admin/mrl-assessments/${assessment.id}/${type === 'self' ? 'self-assessment' : 'external-review'}`, {
            scores: Object.fromEntries(criteria.map((c) => [c.key, Number(scores[c.key] || 1)])),
            notes,
            ...(type === 'external' ? {
                reviewer_name: reviewerName,
                reviewer_email: reviewerEmail,
                reviewer_affiliation: reviewerAff,
            } : {}),
        }),
        onSuccess: onSaved,
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <Backdrop onClose={onClose} title={type === 'self' ? 'Self-Assessment MRL' : 'External Review MRL'}>
            <div className="space-y-3">
                {type === 'external' && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-2">
                        <Field label="Nama Reviewer">
                            <Input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Mis: Dr. Sukma (Telkomsel)" />
                        </Field>
                        <Field label="Email Reviewer">
                            <Input type="email" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} />
                        </Field>
                        <Field label="Afiliasi">
                            <Input value={reviewerAff} onChange={(e) => setReviewerAff(e.target.value)} placeholder="Mis: Industry expert, VC, Konsultan" />
                        </Field>
                    </div>
                )}

                <div className="space-y-2">
                    {criteria.map((c) => (
                        <div key={c.key} className="bg-white border rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">{c.label}</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">{c.description}</div>
                                    <div className="text-[10px] text-amber-700 mt-0.5">Bobot: {c.weight}</div>
                                </div>
                                <select
                                    value={scores[c.key] || ''}
                                    onChange={(e) => setScores({ ...scores, [c.key]: e.target.value })}
                                    className="h-9 w-16 rounded border border-slate-300 px-1 text-sm font-bold text-center"
                                >
                                    <option value="">—</option>
                                    {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-amber-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Live MRL Score</div>
                        <div className="text-xs text-slate-600">Formula: 9 × Σ(skor × bobot) / (5 × Σbobot)</div>
                    </div>
                    <div className={`text-3xl font-black ${liveMrl >= 7 ? 'text-emerald-700' : liveMrl >= 4 ? 'text-amber-700' : 'text-rose-700'}`}>
                        {liveMrl.toFixed(2)}
                    </div>
                </div>

                <Field label="Catatan">
                    <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                </Field>

                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button onClick={() => { setFormError(''); submit.mutate(); }} disabled={Object.keys(scores).length < criteria.length || submit.isPending}>
                        {submit.isPending ? 'Submit…' : 'Submit'}
                    </Button>
                </div>
            </div>
        </Backdrop>
    );
}

function PipelineStep({ label, done, current }) {
    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${done ? 'bg-emerald-100 text-emerald-800' : current ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
            {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="w-3.5 h-3.5 rounded-full bg-current opacity-30" />}
            <span className="text-xs font-semibold">{label}</span>
        </div>
    );
}

function ScoreCard({ label, score, subtitle, color, big }) {
    const colors = {
        primary: 'bg-primary-50 ring-primary-200 text-primary-900',
        amber: 'bg-amber-50 ring-amber-200 text-amber-900',
        emerald: 'bg-emerald-50 ring-emerald-200 text-emerald-900',
    };
    return (
        <div className={`rounded-lg p-3 ring-1 ${colors[color] || colors.primary}`}>
            <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">{label}</div>
            <div className={big ? 'text-3xl font-black mt-1' : 'text-2xl font-extrabold mt-1'}>
                {score !== null && score !== undefined ? Number(score).toFixed(2) : '—'}
            </div>
            <div className="text-[10px] opacity-70 mt-0.5 truncate">{subtitle}</div>
        </div>
    );
}

function Info({ label, value, multiline }) {
    return (
        <div className="bg-slate-50 rounded p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
            <div className={`text-sm mt-0.5 ${multiline ? 'whitespace-pre-line' : ''}`}>{value || '—'}</div>
        </div>
    );
}

function Backdrop({ children, onClose, title, wide = false }) {
    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className={`w-full bg-white shadow-2xl flex flex-col h-full overflow-hidden ${wide ? 'max-w-4xl' : 'max-w-xl'}`} onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight truncate pr-3">{title}</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200 flex-shrink-0">✕</button>
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

function GenerateReviewSurveyButton({ mrlId, onCreated }) {
    const [generated, setGenerated] = useState(null);
    const [copied, setCopied] = useState(false);

    const mutation = useMutation({
        mutationFn: () => api.post(`/api/admin/mrl-assessments/${mrlId}/create-review-survey`),
        onSuccess: (res) => {
            setGenerated(res.data);
            onCreated?.();
        },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    const copyLink = () => {
        if (!generated?.public_url) return;
        navigator.clipboard.writeText(generated.public_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (generated) {
        return (
            <div className="w-full bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-2">
                <div className="text-xs font-bold text-emerald-900 mb-2">
                    ✅ Survey Link Generated — bagikan ke reviewer luar
                </div>
                <div className="bg-white rounded p-2 font-mono text-[10px] break-all border border-emerald-200 mb-2">
                    {generated.public_url}
                </div>
                <div className="flex gap-2">
                    <button onClick={copyLink} className="text-[11px] px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1">
                        {copied ? '✓ Tersalin!' : '📋 Copy Link'}
                    </button>
                    <a href={generated.public_url} target="_blank" rel="noopener" className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold">
                        🔗 Preview
                    </a>
                </div>
                <div className="text-[10px] text-emerald-700 mt-2">
                    Saat reviewer submit, external_score MrlAssessment akan otomatis ter-update + final_score recompute.
                </div>
            </div>
        );
    }

    return (
        <Button variant="amber" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Membuat…' : '📨 Generate Link Survey untuk Reviewer Luar'}
        </Button>
    );
}

function ImportDialog({ onClose, onImported }) {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);

    const importMutation = useMutation({
        mutationFn: () => {
            const fd = new FormData();
            fd.append('file', file);
            return api.post('/api/admin/research-products-import', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }).then((r) => r.data);
        },
        onSuccess: (res) => {
            setResult(res);
            if (res.created > 0) onImported?.();
        },
        onError: (err) => alert(err.response?.data?.message || 'Gagal upload CSV.'),
    });

    return (
        <Backdrop onClose={onClose} title="Import Produk dari CSV">
            <div className="space-y-3">
                <div className="bg-sky-50 ring-1 ring-sky-200 rounded-lg p-3 text-xs text-sky-900">
                    <strong>Format yang diterima:</strong> CSV dengan header kolom <code>title, description, value_proposition, target_market, primary_inventor_name, primary_inventor_email, holding_unit, trl_category_key, current_trl_level, current_mrl_score, status, notes</code>.
                    Title + inventor_name wajib. Duplicate (title sama) akan di-skip otomatis.
                </div>

                <a
                    href="/api/admin/research-products-import-template"
                    download
                    className="inline-flex items-center text-xs text-primary-700 hover:underline font-semibold"
                >
                    <Download className="h-3 w-3 mr-1" /> Download Template CSV
                </a>

                {! result && (
                    <>
                        <Field label="File CSV">
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm border border-slate-200 rounded p-2"
                            />
                        </Field>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                            <Button variant="ghost" onClick={onClose}>Batal</Button>
                            <Button onClick={() => importMutation.mutate()} disabled={! file || importMutation.isPending}>
                                <Upload className="h-4 w-4 mr-1" />
                                {importMutation.isPending ? 'Mengimpor…' : 'Import Sekarang'}
                            </Button>
                        </div>
                    </>
                )}

                {result && (
                    <div>
                        <div className={`rounded-lg p-3 ring-1 ${result.created > 0 ? 'bg-emerald-50 ring-emerald-200' : 'bg-amber-50 ring-amber-200'}`}>
                            <div className="font-bold text-sm">
                                {result.created > 0 ? '✅' : '⚠️'} {result.message}
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                                <div><strong>{result.created}</strong> dibuat</div>
                                <div><strong>{result.skipped}</strong> di-skip</div>
                            </div>
                        </div>

                        {result.errors?.length > 0 && (
                            <div className="mt-3">
                                <div className="text-xs font-semibold text-slate-700 mb-1">Detail issue:</div>
                                <ul className="text-xs text-rose-700 space-y-1 max-h-40 overflow-y-auto bg-rose-50 ring-1 ring-rose-200 rounded p-2">
                                    {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 mt-3">
                            <Button onClick={onClose}>Tutup</Button>
                        </div>
                    </div>
                )}
            </div>
        </Backdrop>
    );
}
