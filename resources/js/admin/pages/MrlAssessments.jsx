import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Lightbulb, Plus, Eye, BookOpen, BarChart3, CheckCircle2, X,
    UserCheck, Globe, ExternalLink, ArrowRight, Search, Check,
} from 'lucide-react';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Skeleton from '../../components/Skeleton';

const STATUS_BADGE = {
    draft: { label: 'Draft', variant: 'secondary' },
    self_assessed: { label: 'Self-Assessed', variant: 'default' },
    external_reviewed: { label: 'External Reviewed', variant: 'default' },
    finalized: { label: 'Finalized', variant: 'success' },
};

const STRATEGY_LABEL = {
    average: 'Rata-rata (self + external)',
    weighted: 'Weighted (70% external, 30% self)',
    lower_of_two: 'Lower of two (konservatif)',
    self_only: 'Self only',
};

// Color per MRL level (1-3 merah, 4-6 amber, 7-9 emerald) sesuai CloudWatch2
const LEVEL_COLOR = (level) => {
    if (! level) return 'bg-slate-300 text-slate-700';
    if (level >= 7) return 'bg-emerald-500 text-white';
    if (level >= 4) return 'bg-amber-400 text-amber-900';
    return 'bg-rose-500 text-white';
};

export default function MrlAssessments() {
    const [tab, setTab] = useState('list');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'mrl', 'stats'],
        queryFn: () => api.get('/api/admin/mrl-stats').then((r) => r.data),
    });

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-6 w-6 text-amber-600" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Pengukuran MRL (Market Readiness Level)
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Standar CloudWatch2 / SWForum.eu — 7 kriteria × 9 level dual-track:
                        <strong> self-assessment </strong>(inventor) + <strong>external review</strong> (reviewer industri via survey link).
                        Threshold eligible komersialisasi: MRL ≥ 5.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Mulai Pengukuran
                </Button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <StatCard label="Total Assessment" value={stats?.total ?? '—'} icon={Lightbulb} color="amber" />
                <StatCard label="Draft" value={stats?.draft ?? '—'} icon={BookOpen} color="amber" />
                <StatCard label="Finalized" value={stats?.finalized ?? '—'} icon={CheckCircle2} color="emerald" />
                <StatCard label="Eligible Komersialisasi (≥5)" value={stats?.eligible_for_commercialization ?? '—'} icon={ArrowRight} color="emerald" />
                <StatCard label="Avg MRL Final" value={stats?.avg_final_score ?? '—'} icon={BarChart3} color="primary" />
            </div>

            <div className="border-b border-slate-200 mb-4 flex gap-1">
                {[
                    ['list', 'Daftar Pengukuran'],
                    ['criteria', '7 Kriteria MRL'],
                ].map(([k, label]) => (
                    <button
                        key={k}
                        onClick={() => setTab(k)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                            tab === k ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'list' && <ListTab onOpen={setEditing} />}
            {tab === 'criteria' && <CriteriaTab />}

            {creating && <CreateDialog onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setEditing(id); }} />}
            {editing && <DetailDialog id={editing} onClose={() => setEditing(null)} />}
        </div>
    );
}

function ListTab({ onOpen }) {
    const [filters, setFilters] = useState({ status: '', q: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'mrl-assessments', filters],
        queryFn: () => api.get('/api/admin/mrl-assessments', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    return (
        <>
            <Card className="mb-4">
                <CardContent className="p-3 flex gap-2 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari judul produk..."
                            value={filters.q}
                            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                            className="pl-8"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="border border-slate-200 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_BADGE).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton.Card key={i} />)}
                </div>
            ) : (data?.data || []).length === 0 ? (
                <Card><CardContent className="p-12 text-center">
                    <Lightbulb className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="font-bold">Belum ada pengukuran MRL</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                        Mulai pengukuran kesiapan pasar produk dosen. Dual-track: inventor isi self-assessment,
                        reviewer luar isi via survey link.
                    </p>
                </CardContent></Card>
            ) : (
                <Card><CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                            <tr>
                                <th className="px-3 py-2 text-left">Produk</th>
                                <th className="px-3 py-2 text-center">Self-Assessment</th>
                                <th className="px-3 py-2 text-center">External Review</th>
                                <th className="px-3 py-2 text-center">Final MRL</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.data.map((a) => {
                                const status = STATUS_BADGE[a.status] || { label: a.status, variant: 'secondary' };
                                return (
                                    <tr key={a.id} className="hover:bg-slate-50">
                                        <td className="px-3 py-2">
                                            <div className="font-semibold text-slate-900 line-clamp-1">{a.product_title}</div>
                                            <div className="text-[11px] text-slate-500">
                                                {STRATEGY_LABEL[a.score_strategy]}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {a.self_assessed_at ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                                                    <UserCheck className="h-3 w-3" /> {a.self_score ? Number(a.self_score).toFixed(1) : '—'}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {a.externally_reviewed_at ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-sky-700 font-semibold">
                                                    <Globe className="h-3 w-3" /> {a.external_score ? Number(a.external_score).toFixed(1) : '—'}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {a.final_score ? (
                                                <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded font-extrabold ${LEVEL_COLOR(a.final_score)}`}>
                                                    {Number(a.final_score).toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2"><Badge variant={status.variant}>{status.label}</Badge></td>
                                        <td className="px-3 py-2">
                                            <Button size="sm" variant="ghost" onClick={() => onOpen(a.id)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent></Card>
            )}
        </>
    );
}

function CriteriaTab() {
    const { data: criteria } = useQuery({
        queryKey: ['admin', 'mrl-criteria'],
        queryFn: () => api.get('/api/admin/mrl-criteria').then((r) => r.data),
    });

    return (
        <Card>
            <CardContent className="p-5">
                <div className="mb-4">
                    <h2 className="font-bold text-base mb-1">7 Kriteria MRL CloudWatch2</h2>
                    <p className="text-xs text-slate-600">
                        Setiap kriteria di-skor 1-5 dengan bobot tertentu. Skor MRL final = 9 × Σ(skor × bobot) / (5 × Σbobot).
                    </p>
                </div>
                <div className="space-y-2">
                    {(criteria || []).map((c, i) => (
                        <div key={c.id} className="bg-slate-50 ring-1 ring-slate-200 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-start gap-2">
                                    <div className="bg-amber-100 text-amber-800 h-6 w-6 rounded flex items-center justify-center font-bold text-xs shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900">{c.label}</div>
                                        <div className="text-[10px] font-mono text-slate-500">{c.key}</div>
                                    </div>
                                </div>
                                <Badge variant="warning" className="text-[10px]">Bobot {c.weight}</Badge>
                            </div>
                            {c.description && (
                                <p className="text-xs text-slate-600 mt-1 ml-8">{c.description}</p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-4 bg-amber-50 ring-1 ring-amber-200 rounded-lg p-3 text-xs text-amber-900">
                    <strong><Lightbulb className="h-3 w-3 inline mr-0.5" /> Tips Penggunaan:</strong> Bobot menentukan pengaruh kriteria ke skor final.
                    Customer Validation & Market Demand biasanya bobot tertinggi karena dampaknya paling
                    signifikan ke kesiapan komersialisasi.
                </div>
            </CardContent>
        </Card>
    );
}

function CreateDialog({ onClose, onCreated }) {
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState({
        product_title: '',
        assessable_type: 'App\\Models\\ResearchProduct',
        assessable_id: '',
        score_strategy: 'lower_of_two',
        notes: '',
    });

    // Auto-suggest from existing ResearchProducts
    const { data: products } = useQuery({
        queryKey: ['admin', 'research-products-list'],
        queryFn: () => api.get('/api/admin/research-products', { params: { per_page: 200 } }).then((r) => r.data?.data ?? []),
    });

    const create = useMutation({
        mutationFn: () => api.post('/api/admin/mrl-assessments', form).then((r) => r.data),
        onSuccess: (res) => onCreated(res.data.id),
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    const selectProduct = (productId) => {
        const p = products?.find((x) => String(x.id) === String(productId));
        if (p) {
            setForm({
                ...form,
                assessable_id: p.id,
                product_title: p.title,
            });
        } else {
            setForm({ ...form, assessable_id: productId });
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold">Mulai Pengukuran MRL Baru</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Produk Dosen *</label>
                        <select
                            value={form.assessable_id}
                            onChange={(e) => selectProduct(e.target.value)}
                            className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                        >
                            <option value="">— Pilih dari katalog —</option>
                            {(products || []).map((p) => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1">
                            Atau kelola produk lebih lanjut di <button onClick={() => { onClose(); navigate('/admin/research-products'); }} className="text-primary-700 underline">Produk Dosen</button>
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Produk *</label>
                        <Input value={form.product_title} onChange={(e) => setForm({ ...form, product_title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Strategi Skor Final</label>
                        <select
                            value={form.score_strategy}
                            onChange={(e) => setForm({ ...form, score_strategy: e.target.value })}
                            className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                        >
                            {Object.entries(STRATEGY_LABEL).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1">
                            <strong>Lower of two</strong> = konservatif (rekomendasi default).
                            <strong> Weighted</strong> = lebih percaya pendapat reviewer luar.
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan (opsional)</label>
                        <textarea
                            rows="2"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm"
                        />
                    </div>
                </div>
                <div className="border-t p-3">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose}>Batal</Button>
                        <Button
                            onClick={() => { setFormError(''); create.mutate(); }}
                            disabled={create.isPending || ! form.product_title || ! form.assessable_id}
                        >
                            {create.isPending ? 'Membuat…' : 'Mulai Pengukuran'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailDialog({ id, onClose }) {
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'mrl-assessment', id],
        queryFn: () => api.get(`/api/admin/mrl-assessments/${id}`).then((r) => r.data.data),
    });

    const finalize = useMutation({
        mutationFn: () => api.post(`/api/admin/mrl-assessments/${id}/finalize`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'mrl-assessment', id] });
            qc.invalidateQueries({ queryKey: ['admin', 'mrl-assessments'] });
            qc.invalidateQueries({ queryKey: ['admin', 'mrl', 'stats'] });
            alert('MRL final score di-set.');
        },
        onError: (err) => alert(err.response?.data?.message || 'Gagal finalize.'),
    });

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
                    <Skeleton.Text lines={5} />
                </div>
            </div>
        );
    }

    if (! data) return null;
    const a = data;
    const status = STATUS_BADGE[a.status];

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{a.product_title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <span className="text-[11px] text-slate-500">{STRATEGY_LABEL[a.score_strategy]}</span>
                        </div>
                    </div>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-3">
                        <ScoreCard label="Self-Assessment" icon={UserCheck} value={a.self_score} done={!! a.self_assessed_at} tone="emerald" />
                        <ScoreCard label="External Review" icon={Globe} value={a.external_score} done={!! a.externally_reviewed_at} tone="sky" />
                        <ScoreCard label="Final MRL" icon={CheckCircle2} value={a.final_score} done={!! a.finalized_at} tone="amber" highlight />
                    </div>

                    <div className="bg-amber-50 ring-1 ring-amber-200 rounded-lg p-3 text-xs">
                        <p className="text-amber-900 mb-2">
                            <strong><Lightbulb className="h-3 w-3 inline mr-0.5" /> Untuk mengisi assessment:</strong> Buka detail Produk Dosen → tab MRL Dual-Track.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => { onClose(); navigate('/admin/research-products'); }}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            <ArrowRight className="h-3 w-3 mr-1" /> Buka Produk Dosen
                        </Button>
                    </div>

                    {a.notes && (
                        <div>
                            <div className="text-xs font-semibold text-slate-700 mb-1">Catatan</div>
                            <p className="text-sm text-slate-700 bg-slate-50 ring-1 ring-slate-200 rounded p-3 whitespace-pre-wrap">{a.notes}</p>
                        </div>
                    )}
                </div>

                <div className="border-t p-3 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Tutup</Button>
                    {a.status !== 'finalized' && (a.self_assessed_at || a.externally_reviewed_at) && (
                        <Button onClick={() => finalize.mutate()} disabled={finalize.isPending}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            {finalize.isPending ? 'Finalizing…' : 'Finalize Skor'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ScoreCard({ label, icon: Icon, value, done, tone = 'emerald', highlight = false }) {
    const tones = {
        emerald: 'bg-emerald-50 ring-emerald-200 text-emerald-800',
        sky: 'bg-sky-50 ring-sky-200 text-sky-800',
        amber: 'bg-amber-50 ring-amber-200 text-amber-800',
    };
    return (
        <div className={`rounded-lg ring-1 p-3 ${tones[tone]} ${highlight ? 'ring-2 shadow-sm' : ''}`}>
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold">
                <Icon className="h-3.5 w-3.5" /> {label}
            </div>
            <div className="text-2xl font-extrabold">{value ? Number(value).toFixed(1) : '—'}</div>
            <div className="text-[10px] mt-0.5 opacity-70">
                {done ? <><Check className="h-3 w-3 inline mr-0.5" />Selesai</> : 'Belum diisi'}
            </div>
        </div>
    );
}
