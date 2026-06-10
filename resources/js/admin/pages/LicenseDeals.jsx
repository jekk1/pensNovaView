import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DollarSign, FileSignature, Search, Plus, Eye, X, CheckCircle2, AlertCircle, TrendingUp, Banknote,
} from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { CurrencyInput } from '../../components/ui/currency-input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';
import { apiErrorMessage } from '../../lib/apiError';

const STATUS_BADGE = {
    draft: { label: 'Draft', variant: 'secondary' },
    negotiation: { label: 'Negosiasi', variant: 'warning' },
    active: { label: 'Aktif', variant: 'success' },
    expired: { label: 'Berakhir', variant: 'secondary' },
    terminated: { label: 'Diputus', variant: 'destructive' },
    breached: { label: 'Wanprestasi', variant: 'destructive' },
};

const TYPE_LABEL = {
    exclusive: 'Eksklusif',
    non_exclusive: 'Non-Eksklusif',
    sole: 'Sole License',
};

const fmtIDR = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

export default function LicenseDeals() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '', q: '' });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'license-deals', 'stats'],
        queryFn: () => api.get('/api/admin/license-deals-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'license-deals', filters],
        queryFn: () => api.get('/api/admin/license-deals', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileSignature className="h-6 w-6 text-amber-600" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Deal Lisensi HKI
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Kelola kontrak lisensi paten / hak cipta ke mitra industri. Pola: Stanford Technology Licensing Office —
                        upfront fee + royalty rate + annual minimum + milestone payment.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Deal Baru
                </Button>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
                <StatCard label="Total Deal" value={stats?.total ?? 0} icon={FileSignature} color="primary" />
                <StatCard label="Aktif" value={stats?.active ?? 0} icon={CheckCircle2} color="emerald" />
                <StatCard label="Negosiasi" value={stats?.negotiation ?? 0} icon={AlertCircle} color="amber" />
                <StatCard label="Upfront Total" value={fmtIDR(stats?.total_upfront_received)} icon={Banknote} color="violet" />
                <StatCard label="Royalti Diterima" value={fmtIDR(stats?.total_royalty_received)} icon={TrendingUp} color="emerald" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex gap-2 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari judul / licensee / nomor deal..."
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
                <Spinner className="h-8 w-8 mx-auto text-amber-600" />
            ) : (data?.data || []).length === 0 ? (
                <Card><CardContent className="p-8 text-center">
                    <FileSignature className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-600">Belum ada deal lisensi.</p>
                    <Button onClick={() => setCreating(true)} className="mt-3" size="sm"><Plus className="h-3 w-3 mr-1" /> Buat Deal Pertama</Button>
                </CardContent></Card>
            ) : (
                <Card><CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                            <tr>
                                <th className="px-3 py-2 text-left">Deal / Paten</th>
                                <th className="px-3 py-2 text-left">Licensee</th>
                                <th className="px-3 py-2 text-left">Tipe</th>
                                <th className="px-3 py-2 text-right">Upfront</th>
                                <th className="px-3 py-2 text-right">Royalty</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.data.map((d) => {
                                const status = STATUS_BADGE[d.status] || { label: d.status, variant: 'secondary' };
                                return (
                                    <tr key={d.id} className="hover:bg-slate-50">
                                        <td className="px-3 py-2">
                                            <div className="font-semibold text-slate-900">{d.title}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">{d.patent?.title}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{d.deal_number}</div>
                                        </td>
                                        <td className="px-3 py-2 text-xs">{d.licensee_partner?.name || d.licensee_name || '—'}</td>
                                        <td className="px-3 py-2 text-xs">{TYPE_LABEL[d.license_type]}</td>
                                        <td className="px-3 py-2 text-right text-xs font-mono">{fmtIDR(d.upfront_fee)}</td>
                                        <td className="px-3 py-2 text-right text-xs">{d.royalty_rate}%</td>
                                        <td className="px-3 py-2"><Badge variant={status.variant}>{status.label}</Badge></td>
                                        <td className="px-3 py-2"><Button size="sm" variant="ghost" onClick={() => setEditing(d)}><Eye className="h-4 w-4" /></Button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent></Card>
            )}

            {(creating || editing) && (
                <DealDialog
                    deal={editing}
                    onClose={() => { setCreating(false); setEditing(null); }}
                    onSaved={() => {
                        qc.invalidateQueries({ queryKey: ['admin', 'license-deals'] });
                        qc.invalidateQueries({ queryKey: ['admin', 'license-deals', 'stats'] });
                        setCreating(false);
                        setEditing(null);
                    }}
                />
            )}
        </div>
    );
}

function DealDialog({ deal, onClose, onSaved }) {
    const isEdit = !! deal?.id;
    const [form, setForm] = useState({
        patent_id: deal?.patent_id || '',
        licensee_partner_id: deal?.licensee_partner_id || '',
        licensee_name: deal?.licensee_name || '',
        title: deal?.title || '',
        scope: deal?.scope || '',
        license_type: deal?.license_type || 'non_exclusive',
        territory: deal?.territory || 'Indonesia',
        field_of_use: deal?.field_of_use || '',
        effective_date: deal?.effective_date?.split('T')[0] || '',
        expiry_date: deal?.expiry_date?.split('T')[0] || '',
        upfront_fee: deal?.upfront_fee || 0,
        annual_minimum: deal?.annual_minimum || 0,
        royalty_rate: deal?.royalty_rate || 0,
        milestone_payment: deal?.milestone_payment || 0,
        status: deal?.status || 'draft',
        notes: deal?.notes || '',
    });
    const [formError, setFormError] = useState('');

    const { data: patents } = useQuery({
        queryKey: ['admin', 'patents-list'],
        queryFn: () => api.get('/api/admin/patents', { params: { per_page: 500 } }).then((r) => r.data?.data ?? []),
    });

    const { data: partners } = useQuery({
        queryKey: ['admin', 'partners-list'],
        queryFn: () => api.get('/api/admin/partner-companies', { params: { per_page: 200 } }).then((r) => r.data?.data ?? []),
    });

    const save = useMutation({
        mutationFn: () => isEdit
            ? api.patch(`/api/admin/license-deals/${deal.id}`, form)
            : api.post('/api/admin/license-deals', form),
        onSuccess: onSaved,
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">{isEdit ? 'Edit Deal' : 'Deal Lisensi Baru'}</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-3 overflow-y-auto">
                    <Field label="Paten / HKI *">
                        <select value={form.patent_id} onChange={(e) => setForm({ ...form, patent_id: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                            <option value="">— Pilih Paten —</option>
                            {(patents || []).map((p) => <option key={p.id} value={p.id}>{p.title} {p.reference_number ? `(${p.reference_number})` : ''}</option>)}
                        </select>
                    </Field>
                    <Field label="Judul Deal *">
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mis: Lisensi Eksklusif Sensor IoT untuk PT Telkomsel" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Licensee (Mitra Terdaftar)">
                            <select value={form.licensee_partner_id} onChange={(e) => setForm({ ...form, licensee_partner_id: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                <option value="">— Atau ketik manual di bawah —</option>
                                {(partners || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Licensee (Manual)">
                            <Input value={form.licensee_name} onChange={(e) => setForm({ ...form, licensee_name: e.target.value })} placeholder="Nama perusahaan kalau tidak terdaftar" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Tipe Lisensi *">
                            <select value={form.license_type} onChange={(e) => setForm({ ...form, license_type: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label="Territory">
                            <Input value={form.territory} onChange={(e) => setForm({ ...form, territory: e.target.value })} placeholder="Indonesia / Asia / Global" />
                        </Field>
                        <Field label="Field of Use">
                            <Input value={form.field_of_use} onChange={(e) => setForm({ ...form, field_of_use: e.target.value })} placeholder="Pendidikan, Industri, dll" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Effective Date"><Input type="date" value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} /></Field>
                        <Field label="Expiry Date"><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></Field>
                    </div>
                    <div className="bg-amber-50 ring-1 ring-amber-200 rounded-lg p-3">
                        <div className="text-xs font-bold text-amber-900 mb-2">💰 Struktur Royalti (4 Pilar)</div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Upfront Fee (Rp)"><CurrencyInput value={form.upfront_fee ?? ''} onChange={(v) => setForm({ ...form, upfront_fee: v })} /></Field>
                            <Field label="Annual Minimum (Rp)"><CurrencyInput value={form.annual_minimum ?? ''} onChange={(v) => setForm({ ...form, annual_minimum: v })} /></Field>
                            <Field label="Royalty Rate (%)"><Input type="number" step="0.01" value={form.royalty_rate} onChange={(e) => setForm({ ...form, royalty_rate: e.target.value })} /></Field>
                            <Field label="Milestone Payment (Rp)"><CurrencyInput value={form.milestone_payment ?? ''} onChange={(v) => setForm({ ...form, milestone_payment: v })} /></Field>
                        </div>
                    </div>
                    <Field label="Scope / Ruang Lingkup">
                        <textarea rows="3" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>
                    <Field label="Status">
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                            {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </Field>
                    <Field label="Catatan">
                        <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>
                </div>
                <div className="border-t p-3">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose}>Batal</Button>
                        <Button onClick={() => { setFormError(''); save.mutate(); }} disabled={save.isPending || ! form.patent_id || ! form.title}>
                            {save.isPending ? 'Menyimpan…' : (isEdit ? 'Update' : 'Buat Deal')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
            {children}
        </div>
    );
}
