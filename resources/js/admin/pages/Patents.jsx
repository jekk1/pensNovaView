import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Lightbulb, ExternalLink, Plus, Eye, Search, CheckCircle2, Clock, AlertTriangle,
    DollarSign, FileSignature, X, Trash2, Pencil,
} from 'lucide-react';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';

const STATUS_BADGE = {
    pending: { label: 'Pending', variant: 'warning' },
    granted: { label: 'Granted', variant: 'success' },
    expired: { label: 'Expired', variant: 'destructive' },
    abandoned: { label: 'Ditinggalkan', variant: 'secondary' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
};

const COMM_BADGE = {
    not_attempted: { label: 'Belum dikomersilkan', variant: 'secondary' },
    in_negotiation: { label: 'Negosiasi', variant: 'warning' },
    licensed: { label: 'Dilisensikan', variant: 'success' },
    royalty_active: { label: 'Royalti Aktif', variant: 'success' },
    expired: { label: 'Lisensi Habis', variant: 'destructive' },
};

const fmtIDR = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
const fmtIDRCompact = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

export default function Patents() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '', type: '', q: '' });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'patents', 'stats'],
        queryFn: () => api.get('/api/admin/patents-stats').then((r) => r.data),
    });

    const { data: types } = useQuery({
        queryKey: ['admin', 'patents', 'types'],
        queryFn: () => api.get('/api/admin/patents-types').then((r) => r.data.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'patents', filters],
        queryFn: () => api.get('/api/admin/patents', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    const rows = data?.data ?? [];
    const typeMap = (types || []).reduce((acc, t) => ({ ...acc, [t.key]: t.label }), {});

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-6 w-6 text-amber-600" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Portofolio Paten & HKI PENS
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Divisi Knowledge Asset Management — registry kekayaan intelektual PENS untuk dikomersialisasi (lisensi, royalti). Sumber data: PDKI Indonesia + entry manual.
                    </p>
                </div>
                <div className="flex gap-2">
                    <a
                        href="https://pdki-indonesia.dgip.go.id/search?type=patent&keyword=Politeknik+Elektronika+Negeri+Surabaya"
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
                    >
                        <Search className="h-3.5 w-3.5" /> Cari di PDKI
                        <ExternalLink className="h-3 w-3" />
                    </a>
                    <Button onClick={() => setCreating(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Tambah HKI
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <StatCard label="Total HKI" value={stats?.total ?? '—'} icon={Lightbulb} color="amber" />
                <StatCard label="Granted" value={stats?.granted ?? '—'} icon={CheckCircle2} color="emerald" />
                <StatCard label="Pending" value={stats?.pending ?? '—'} icon={Clock} color="primary" />
                <StatCard label="Dilisensikan" value={stats?.licensed ?? '—'} icon={FileSignature} color="emerald" />
                <StatCard label="Royalti/Tahun" value={fmtIDRCompact(stats?.royalty_per_year ?? 0)} icon={DollarSign} color="emerald" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari judul / nomor / inventor…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Jenis</option>
                        {(types || []).map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <Lightbulb className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <h3 className="font-bold text-sm">Belum ada HKI tercatat</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Klik <strong>Tambah HKI</strong> untuk mulai mengisi portofolio paten, hak cipta, desain industri, dll.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Judul</th>
                                <th className="px-3 py-2 text-left">Jenis</th>
                                <th className="px-3 py-2 text-left">No. Pendaftaran</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-left">Komersialisasi</th>
                                <th className="px-3 py-2 text-right">Royalti/th</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
                                const cm = COMM_BADGE[r.commercialization_status] || COMM_BADGE.not_attempted;
                                return (
                                    <tr key={r.id} className="hover:bg-amber-50/40">
                                        <td className="px-3 py-2">
                                            <div className="font-semibold max-w-xs truncate">{r.title}</div>
                                            <div className="text-[10px] text-slate-500">{r.holding_unit || '—'}</div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600">{typeMap[r.type] || r.type}</td>
                                        <td className="px-3 py-2 font-mono text-[11px]">{r.reference_number || r.certificate_number || '—'}</td>
                                        <td className="px-3 py-2"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-3 py-2"><Badge variant={cm.variant}>{cm.label}</Badge></td>
                                        <td className="px-3 py-2 text-right font-mono">{r.royalty_per_year ? fmtIDRCompact(r.royalty_per_year) : '—'}</td>
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

            {creating && <FormDialog types={types || []} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); qc.invalidateQueries({ queryKey: ['admin', 'patents'] }); qc.invalidateQueries({ queryKey: ['admin', 'patents', 'stats'] }); }} />}
            {editing && <FormDialog id={editing} types={types || []} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ['admin', 'patents'] }); qc.invalidateQueries({ queryKey: ['admin', 'patents', 'stats'] }); }} />}
        </div>
    );
}

function FormDialog({ id, types, onClose, onSaved }) {
    const isEdit = !!id;
    const qc = useQueryClient();

    const { data: existing } = useQuery({
        queryKey: ['admin', 'patents', id],
        queryFn: () => api.get(`/api/admin/patents/${id}`).then((r) => r.data.data),
        enabled: isEdit,
    });

    const [form, setForm] = useState({});
    const [formError, setFormError] = useState('');
    const data = isEdit ? { ...existing, ...form } : { type: 'paten_invensi', status: 'pending', commercialization_status: 'not_attempted', inventors: [{ name: '', affiliation: '' }], ...form };

    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const save = useMutation({
        mutationFn: () => isEdit
            ? api.patch(`/api/admin/patents/${id}`, form)
            : api.post('/api/admin/patents', { ...data, ...form }),
        onSuccess: () => { onSaved(); onClose(); },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    const destroy = useMutation({
        mutationFn: () => api.delete(`/api/admin/patents/${id}`),
        onSuccess: () => { onSaved(); onClose(); },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    const inventors = data?.inventors || [];

    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold">{isEdit ? 'Edit HKI' : 'Tambah HKI Baru'}</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    <Field label="Judul HKI / Invensi *">
                        <Input value={data?.title ?? ''} onChange={(e) => setField('title', e.target.value)} placeholder="Mis: Sistem inverter IoT untuk panel surya" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Jenis *">
                            <select value={data?.type ?? ''} onChange={(e) => setField('type', e.target.value)} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                {types.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Status">
                            <select value={data?.status ?? 'pending'} onChange={(e) => setField('status', e.target.value)} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </Field>
                        <Field label="No. Pendaftaran (Reference)">
                            <Input value={data?.reference_number ?? ''} onChange={(e) => setField('reference_number', e.target.value)} placeholder="Mis: P00202101234" />
                        </Field>
                        <Field label="No. Sertifikat (jika sudah granted)">
                            <Input value={data?.certificate_number ?? ''} onChange={(e) => setField('certificate_number', e.target.value)} placeholder="IDP00012345" />
                        </Field>
                        <Field label="Tanggal Pendaftaran">
                            <Input type="date" value={data?.filing_date ?? ''} onChange={(e) => setField('filing_date', e.target.value)} />
                        </Field>
                        <Field label="Tanggal Granted">
                            <Input type="date" value={data?.granted_date ?? ''} onChange={(e) => setField('granted_date', e.target.value)} />
                        </Field>
                        <Field label="Tanggal Kadaluarsa">
                            <Input type="date" value={data?.expiry_date ?? ''} onChange={(e) => setField('expiry_date', e.target.value)} />
                        </Field>
                        <Field label="Unit Pengampu">
                            <Input value={data?.holding_unit ?? ''} onChange={(e) => setField('holding_unit', e.target.value)} placeholder="Mis: Departemen Teknik Elektro PENS" />
                        </Field>
                    </div>

                    <Field label="Abstrak">
                        <textarea rows="3" value={data?.abstract ?? ''} onChange={(e) => setField('abstract', e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-slate-700">Inventor / Pencipta</label>
                            <button type="button" onClick={() => setField('inventors', [...inventors, { name: '', affiliation: '' }])} className="text-[11px] text-primary-700 hover:underline font-semibold">
                                + Tambah inventor
                            </button>
                        </div>
                        <div className="space-y-2">
                            {inventors.map((inv, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <Input
                                        placeholder="Nama inventor"
                                        value={inv.name}
                                        onChange={(e) => {
                                            const next = [...inventors];
                                            next[i] = { ...next[i], name: e.target.value };
                                            setField('inventors', next);
                                        }}
                                        className="flex-1"
                                    />
                                    <Input
                                        placeholder="Afiliasi (mis: Dosen Teknik Elektro PENS)"
                                        value={inv.affiliation}
                                        onChange={(e) => {
                                            const next = [...inventors];
                                            next[i] = { ...next[i], affiliation: e.target.value };
                                            setField('inventors', next);
                                        }}
                                        className="flex-1"
                                    />
                                    {inventors.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setField('inventors', inventors.filter((_, idx) => idx !== i))}
                                            className="h-9 w-9 rounded-md hover:bg-rose-50 text-rose-600 flex items-center justify-center"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                        <h4 className="text-xs font-bold text-slate-700 mb-2">Komersialisasi</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Status Komersialisasi">
                                <select value={data?.commercialization_status ?? 'not_attempted'} onChange={(e) => setField('commercialization_status', e.target.value)} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                    {Object.entries(COMM_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Royalti per Tahun (Rp)">
                                <Input type="number" step="0.01" value={data?.royalty_per_year ?? ''} onChange={(e) => setField('royalty_per_year', e.target.value)} />
                            </Field>
                            <Field label="Estimasi Nilai HKI (Rp)">
                                <Input type="number" step="0.01" value={data?.estimated_value ?? ''} onChange={(e) => setField('estimated_value', e.target.value)} />
                            </Field>
                            <Field label="URL PDKI Indonesia">
                                <Input type="url" value={data?.pdki_url ?? ''} onChange={(e) => setField('pdki_url', e.target.value)} placeholder="https://pdki-indonesia.dgip.go.id/..." />
                            </Field>
                        </div>
                    </div>

                    <Field label="Catatan">
                        <textarea rows="2" value={data?.notes ?? ''} onChange={(e) => setField('notes', e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>
                </div>
                <div className="px-5 py-3 border-t bg-slate-50">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <div className="flex justify-between gap-2">
                        <div>
                            {isEdit && (
                                <Button variant="destructive" size="sm" onClick={() => { if (confirm('Hapus HKI ini?')) destroy.mutate(); }}>
                                    <Trash2 className="h-4 w-4 mr-1" /> Hapus
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={onClose}>Batal</Button>
                            <Button onClick={() => { setFormError(''); save.mutate(); }} disabled={save.isPending}>
                                {save.isPending ? 'Menyimpan…' : isEdit ? 'Update' : 'Simpan'}
                            </Button>
                        </div>
                    </div>
                </div>
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
