import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    FlaskConical, Plus, Sparkles, CheckCircle2, AlertCircle, ArrowRight,
    Award, Target, TrendingUp,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import Spinner from '../../components/Spinner';

const STATUS_BADGE = {
    draft: { label: 'Draft', variant: 'secondary' },
    submitted: { label: 'Submitted', variant: 'warning' },
    assessing_trl: { label: 'Penilaian TKT', variant: 'warning' },
    assessing_mrl: { label: 'Penilaian MRL', variant: 'warning' },
    ready_to_commercialize: { label: 'Siap Komersialisasi', variant: 'success' },
    commercialized: { label: 'Dikomersialisasi', variant: 'success' },
    archived: { label: 'Diarsipkan', variant: 'secondary' },
};

const LEVEL_COLOR = (level, threshold) => {
    if (!level) return 'bg-slate-200 text-slate-600';
    if (level >= threshold) return 'bg-emerald-500 text-white';
    if (level >= threshold - 2) return 'bg-amber-400 text-amber-900';
    return 'bg-rose-500 text-white';
};

export default function TenantProducts() {
    const { user } = useAuth();
    const [creating, setCreating] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['tenant', 'research-products'],
        queryFn: () => api.get('/api/tenant/research-products').then((r) => r.data),
    });

    const products = data?.data || [];

    return (
        <div>
            <header className="mb-5 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FlaskConical className="h-7 w-7 text-emerald-700" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Produk Saya</h1>
                    </div>
                    <p className="text-sm text-slate-600 max-w-2xl">
                        Daftarkan produk/teknologi Anda untuk masuk pipeline komersialisasi UPA: Pengukuran TKT (BRIN) →
                        Pengukuran MRL (Market Readiness) → Eligible komersialisasi (lisensi atau spin-off).
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Daftarkan Produk
                </Button>
            </header>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner className="h-8 w-8 text-emerald-600" /></div>
            ) : products.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FlaskConical className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-bold text-base">Belum ada produk terdaftar</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                            Daftarkan produk pertama untuk memulai pipeline komersialisasi.
                        </p>
                        <Button onClick={() => setCreating(true)}>
                            <Plus className="h-4 w-4 mr-1" /> Daftarkan Produk Pertama
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
            )}

            {creating && <RegisterDialog onClose={() => setCreating(false)} onSaved={() => setCreating(false)} />}
        </div>
    );
}

function ProductCard({ product: p }) {
    const status = STATUS_BADGE[p.status] || STATUS_BADGE.draft;
    const trlOk = (p.current_trl_level ?? 0) >= 6;
    const mrlOk = Number(p.current_mrl_score ?? 0) >= 5;
    const isEligible = trlOk && mrlOk;

    return (
        <Card className={isEligible ? 'border-emerald-300' : ''}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base">{p.title}</h3>
                        <div className="text-xs text-slate-600 mt-0.5">
                            {p.trl_category?.name} · Inventor utama: <strong>{p.primary_inventor_name}</strong>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {isEligible && (
                            <Badge variant="success" className="text-[10px]">
                                <Award className="h-3 w-3 mr-1" /> ELIGIBLE
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Pipeline status */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <PipelineStep icon={CheckCircle2} label="Daftar" done current={false} />
                    <PipelineStep
                        icon={Target}
                        label={`TKT ${p.current_trl_level ?? '—'}`}
                        done={(p.current_trl_level ?? 0) > 0}
                        current={!(p.current_trl_level ?? 0)}
                        threshold="≥ 6"
                        ok={trlOk}
                    />
                    <PipelineStep
                        icon={Sparkles}
                        label={`MRL ${p.current_mrl_score ? Number(p.current_mrl_score).toFixed(1) : '—'}`}
                        done={(p.current_mrl_score ?? 0) > 0}
                        current={!(p.current_mrl_score ?? 0)}
                        threshold="≥ 5"
                        ok={mrlOk}
                    />
                    <PipelineStep
                        icon={Award}
                        label="Komersialisasi"
                        done={isEligible || p.status === 'commercialized'}
                        current={false}
                    />
                </div>

                {p.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mt-2">
                        {p.description}
                    </p>
                )}

                {!isEligible && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-2.5 text-xs flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Untuk eligible komersialisasi:</strong> TKT minimal 6 (saat ini {p.current_trl_level ?? '—'}),
                            MRL minimal 5 (saat ini {p.current_mrl_score ? Number(p.current_mrl_score).toFixed(1) : '—'}).
                            Tim UPA akan menghubungi Anda untuk jadwal pengukuran.
                        </div>
                    </div>
                )}

                {isEligible && (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded p-2.5 text-xs flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Produk Anda eligible untuk komersialisasi!</strong> Divisi Knowledge Asset Management
                            akan mengevaluasi jalur komersialisasi (lisensi HKI / spin-off via inkubator).
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function PipelineStep({ icon: Icon, label, done, current, threshold, ok }) {
    const bgClass = done
        ? (ok === false ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
        : current
        ? 'bg-amber-100 text-amber-800'
        : 'bg-slate-100 text-slate-600';
    return (
        <div className={`rounded p-2 ${bgClass}`}>
            <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">{label}</span>
            </div>
            {threshold && <div className="text-[9px] mt-0.5 opacity-70">target {threshold}</div>}
        </div>
    );
}

function RegisterDialog({ onClose, onSaved }) {
    const qc = useQueryClient();
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

    const { data: cats } = useQuery({
        queryKey: ['tenant', 'trl-categories'],
        queryFn: () => api.get('/api/admin/trl-categories').then((r) => r.data.data).catch(() => []),
    });

    const mutation = useMutation({
        mutationFn: () => api.post('/api/tenant/research-products', form),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tenant', 'research-products'] });
            onSaved();
        },
    });

    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold">Daftarkan Produk Baru</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs text-emerald-900">
                        <strong>Setelah Anda daftarkan:</strong> Tim UPA akan menghubungi Anda untuk:
                        <ol className="list-decimal list-inside mt-1 space-y-0.5">
                            <li>Pengukuran Tingkat Kesiapan Teknologi (TKT) — standar BRIN</li>
                            <li>Pengukuran Market Readiness Level (MRL) — self + external reviewer</li>
                            <li>Evaluasi eligibility komersialisasi</li>
                        </ol>
                    </div>

                    <Field label="Judul Produk *">
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mis: Sistem IoT untuk pertanian presisi" />
                    </Field>

                    <Field label="Bidang Teknologi *">
                        <select value={form.trl_category_id} onChange={(e) => setForm({ ...form, trl_category_id: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                            <option value="">— Pilih bidang —</option>
                            {(cats || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Field>

                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Inventor Utama *">
                            <Input value={form.primary_inventor_name} onChange={(e) => setForm({ ...form, primary_inventor_name: e.target.value })} />
                        </Field>
                        <Field label="Email">
                            <Input type="email" value={form.primary_inventor_email} onChange={(e) => setForm({ ...form, primary_inventor_email: e.target.value })} />
                        </Field>
                    </div>

                    <Field label="Unit Pengampu">
                        <Input value={form.holding_unit} onChange={(e) => setForm({ ...form, holding_unit: e.target.value })} placeholder="Mis: Departemen Teknik Elektro PENS" />
                    </Field>

                    <Field label="Deskripsi Produk">
                        <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="Apa produk ini? Bagaimana cara kerjanya?" />
                    </Field>

                    <Field label="Value Proposition">
                        <textarea rows="2" value={form.value_proposition} onChange={(e) => setForm({ ...form, value_proposition: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="Keunggulan utama? Masalah yang diselesaikan?" />
                    </Field>

                    <Field label="Target Market">
                        <textarea rows="2" value={form.target_market} onChange={(e) => setForm({ ...form, target_market: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="Siapa pengguna/pembeli target?" />
                    </Field>
                </div>
                <div className="px-5 py-3 border-t bg-slate-50 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button onClick={() => mutation.mutate()} disabled={!form.title || !form.trl_category_id || !form.primary_inventor_name || mutation.isPending}>
                        {mutation.isPending ? 'Mendaftarkan…' : 'Daftarkan'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return <div><label className="text-xs font-semibold text-slate-700 block mb-1">{label}</label>{children}</div>;
}
