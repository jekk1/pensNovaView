import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Handshake, Plus, Eye, FileSignature, RefreshCw, XCircle, Building2, Calendar, AlertTriangle, FileDown, FilePlus } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { CurrencyInput } from '../../components/ui/currency-input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';

const STATUS_FLOW = [
    { key: 'planning',    label: 'Perencanaan',    variant: 'secondary' },
    { key: 'proposed',    label: 'Diusulkan',      variant: 'secondary' },
    { key: 'drafting',    label: 'Draft MoU',      variant: 'warning' },
    { key: 'negotiating', label: 'Negosiasi',      variant: 'warning' },
    { key: 'signed',      label: 'MoU Ditandatangani', variant: 'default' },
    { key: 'active',      label: 'Aktif',          variant: 'success' },
    { key: 'reported',    label: 'Pelaporan',      variant: 'default' },
    { key: 'concluded',   label: 'Selesai',        variant: 'success' },
    { key: 'terminated',  label: 'Dihentikan',     variant: 'destructive' },
];

const TYPE_LABEL = {
    industry: 'Industri',
    academia: 'Perguruan Tinggi',
    government: 'Pemerintah',
    npo: 'NGO / Asosiasi',
    investor: 'Investor',
    other: 'Lainnya',
};

const fmtIDR = (n) => n ? `Rp ${Number(n).toLocaleString('id-ID')}` : '—';

export default function Partnerships() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '', partner_type: '', q: '', page: 1 });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'partnerships', 'stats'],
        queryFn: () => api.get('/api/admin/partnerships-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'partnerships', filters],
        queryFn: () => api.get('/api/admin/partnerships', { params: { ...filters, per_page: 25 } }).then((r) => r.data),
    });

    const rows = data?.data ?? [];

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Handshake className="h-6 w-6 text-primary-700" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Kerjasama Pihak Ketiga (MoU)
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Kerjasama institusional level UPA dengan mitra eksternal (industri, perguruan tinggi, pemerintah). Lifecycle penuh dari komunikasi awal sampai keputusan perpanjangan.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)} className="flex-shrink-0">
                    <Plus className="h-4 w-4 mr-1" /> Kerjasama Baru
                </Button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <StatCard label="Total" value={stats?.total ?? '—'} icon={Handshake} color="primary" />
                <StatCard label="Planning" value={stats?.planning ?? '—'} icon={Building2} color="amber" />
                <StatCard label="Aktif" value={stats?.active ?? '—'} icon={FileSignature} color="emerald" />
                <StatCard label="Total Nilai" value={stats?.total_value ? `${(stats.total_value / 1_000_000).toFixed(0)} jt` : '—'} icon={RefreshCw} color="primary" />
                <StatCard label="Expiring 90hr" value={stats?.expiring_soon ?? '—'} icon={AlertTriangle} color="rose" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari mitra / judul / no. MoU…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.partner_type}
                        onChange={(e) => setFilters((f) => ({ ...f, partner_type: e.target.value, page: 1 }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Tipe</option>
                        {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Status</option>
                        {STATUS_FLOW.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner className="h-6 w-6" /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <Handshake className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <h3 className="font-bold text-sm">Belum ada kerjasama tercatat</h3>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Mitra</th>
                                <th className="px-3 py-2 text-left">Judul</th>
                                <th className="px-3 py-2 text-left">No. MoU</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-right">Nilai</th>
                                <th className="px-3 py-2 text-left">Efektif</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = STATUS_FLOW.find((s) => s.key === r.status) || STATUS_FLOW[0];
                                return (
                                    <tr key={r.id} className="hover:bg-amber-50/40">
                                        <td className="px-3 py-2">
                                            <div className="font-semibold">{r.partner_name}</div>
                                            <div className="text-[10px] text-slate-500">{TYPE_LABEL[r.partner_type] || ''}</div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700 max-w-xs truncate">{r.title}</td>
                                        <td className="px-3 py-2 font-mono text-[11px]">{r.mou_number || <span className="text-slate-400">—</span>}</td>
                                        <td className="px-3 py-2"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-3 py-2 text-right font-mono">{fmtIDR(r.value)}</td>
                                        <td className="px-3 py-2 text-[11px]">
                                            {r.effective_from && <div>Dari: {new Date(r.effective_from).toLocaleDateString('id-ID')}</div>}
                                            {r.effective_until && <div className="text-rose-600">Sampai: {new Date(r.effective_until).toLocaleDateString('id-ID')}</div>}
                                        </td>
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

            {creating && <FormDialog onClose={() => setCreating(false)} onSaved={() => { setCreating(false); qc.invalidateQueries({ queryKey: ['admin', 'partnerships'] }); qc.invalidateQueries({ queryKey: ['admin', 'partnerships', 'stats'] }); }} />}
            {editing && <FormDialog id={editing} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ['admin', 'partnerships'] }); qc.invalidateQueries({ queryKey: ['admin', 'partnerships', 'stats'] }); }} />}
        </div>
    );
}

function FormDialog({ id, onClose, onSaved }) {
    const qc = useQueryClient();
    const isEdit = !!id;

    const { data: existing } = useQuery({
        queryKey: ['admin', 'partnerships', id],
        queryFn: () => api.get(`/api/admin/partnerships/${id}`).then((r) => r.data.data),
        enabled: isEdit,
    });

    const { data: users } = useQuery({
        queryKey: ['admin', 'users', 'internal'],
        queryFn: () => api.get('/api/admin/users', { params: { per_page: 200, role_group: 'internal' } }).then((r) => r.data.data),
    });

    const [form, setForm] = useState({});
    const [error, setError] = useState('');
    const data = isEdit ? { ...existing, ...form } : { status: 'planning', partner_type: 'industry', currency: 'IDR', ...form };

    const saveMutation = useMutation({
        mutationFn: () => {
            if (isEdit) return api.patch(`/api/admin/partnerships/${id}`, form);
            return api.post('/api/admin/partnerships', form);
        },
        onSuccess: () => { onSaved?.(); onClose(); },
        onError: (e) => {
            const errs = e.response?.data?.errors;
            setError(errs ? Object.values(errs).flat().join(' ') : (e.response?.data?.message || 'Gagal menyimpan. Cek isian (mis. nilai terlalu besar).'));
        },
    });

    const continueMutation = useMutation({
        mutationFn: (decision) => api.post(`/api/admin/partnerships/${id}/decide-continuation`, { continuation_decision: decision }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'partnerships', id] });
            qc.invalidateQueries({ queryKey: ['admin', 'partnerships'] });
        },
    });

    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight">
                        {isEdit ? `Kerjasama: ${existing?.partner_name || '…'}` : 'Kerjasama Baru'}
                    </h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Nama Mitra *">
                            <Input value={data?.partner_name ?? ''} onChange={(e) => setField('partner_name', e.target.value)} placeholder="PT/Universitas/Organisasi" />
                        </Field>
                        <Field label="Organisasi Formal">
                            <Input value={data?.partner_organization ?? ''} onChange={(e) => setField('partner_organization', e.target.value)} placeholder="Nama hukum penuh" />
                        </Field>
                        <Field label="Tipe Mitra">
                            <select value={data?.partner_type ?? 'industry'} onChange={(e) => setField('partner_type', e.target.value)} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label="Status Lifecycle">
                            <select value={data?.status ?? 'planning'} onChange={(e) => setField('status', e.target.value)} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                {STATUS_FLOW.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Judul Kerjasama *">
                            <Input value={data?.title ?? ''} onChange={(e) => setField('title', e.target.value)} placeholder="Mis: Beasiswa Ikatan Dinas" />
                        </Field>
                        <Field label="Nomor MoU/PKS">
                            <Input value={data?.mou_number ?? ''} onChange={(e) => setField('mou_number', e.target.value)} />
                        </Field>
                        <Field label="PIC Internal">
                            <select value={data?.pic_internal_id ?? ''} onChange={(e) => setField('pic_internal_id', e.target.value)} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                <option value="">—</option>
                                {(users || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </Field>
                        <Field label="PIC Eksternal">
                            <Input value={data?.pic_external_name ?? ''} onChange={(e) => setField('pic_external_name', e.target.value)} placeholder="Nama PIC mitra" />
                        </Field>
                        <Field label="Email PIC Eksternal">
                            <Input type="email" value={data?.pic_external_email ?? ''} onChange={(e) => setField('pic_external_email', e.target.value)} />
                        </Field>
                        <Field label="Telp PIC Eksternal">
                            <Input value={data?.pic_external_phone ?? ''} onChange={(e) => setField('pic_external_phone', e.target.value)} />
                        </Field>
                        <Field label="Efektif Dari">
                            <Input type="date" value={data?.effective_from ?? ''} onChange={(e) => setField('effective_from', e.target.value)} />
                        </Field>
                        <Field label="Efektif Sampai">
                            <Input type="date" value={data?.effective_until ?? ''} onChange={(e) => setField('effective_until', e.target.value)} />
                        </Field>
                        <Field label="Nilai Kerjasama (Rp)">
                            <CurrencyInput value={data?.value ?? ''} onChange={(v) => setField('value', v)} />
                        </Field>
                        <Field label="Auto-renew">
                            <select value={data?.auto_renew ? '1' : '0'} onChange={(e) => setField('auto_renew', e.target.value === '1')} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                <option value="0">Tidak</option>
                                <option value="1">Ya</option>
                            </select>
                        </Field>
                    </div>
                    <Field label="Deskripsi Kerjasama">
                        <textarea rows="2" value={data?.description ?? ''} onChange={(e) => setField('description', e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>
                    <Field label="Pemanfaatan Sumber Daya">
                        <textarea rows="2" value={data?.resource_allocation ?? ''} onChange={(e) => setField('resource_allocation', e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="Apa yang dialokasikan dari masing-masing pihak" />
                    </Field>
                    <Field label="Keluaran / Manfaat">
                        <textarea rows="2" value={data?.outcomes ?? ''} onChange={(e) => setField('outcomes', e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="Manfaat yang diperoleh masing-masing pihak" />
                    </Field>
                    <Field label="Catatan">
                        <textarea rows="2" value={data?.notes ?? ''} onChange={(e) => setField('notes', e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>

                    {isEdit && (
                        <div className="border-t border-slate-200 pt-3 space-y-2">
                            <div className="text-xs font-bold text-primary-800 mb-1">📄 Dokumen Kerjasama</div>
                            <Field label="Ruang Lingkup MoU (1 per baris)">
                                <textarea rows="3" value={data?.mou_scope ?? ''} onChange={(e) => setField('mou_scope', e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="a. Riset bersama&#10;b. Pelatihan teknis&#10;c. Joint publication" />
                            </Field>
                            <Field label="Output / Deliverables PKS">
                                <textarea rows="3" value={data?.pks_deliverables ?? ''} onChange={(e) => setField('pks_deliverables', e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="1. Prototipe sensor 100 unit&#10;2. Dashboard web&#10;3. Laporan teknis quarterly" />
                            </Field>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <DocumentRow
                                    label="MoU"
                                    number={existing?.mou_number}
                                    filePath={existing?.mou_file_path}
                                    onGenerate={async () => {
                                        await api.post(`/api/admin/partnerships/${id}/generate-mou`);
                                        qc.invalidateQueries({ queryKey: ['admin', 'partnerships', id] });
                                        qc.invalidateQueries({ queryKey: ['admin', 'partnerships'] });
                                    }}
                                    downloadUrl={`/api/admin/partnerships/${id}/download-mou`}
                                    filename={`MoU-${existing?.mou_number || id}.pdf`}
                                />
                                <DocumentRow
                                    label="PKS"
                                    number={existing?.pks_number}
                                    filePath={existing?.pks_file_path}
                                    onGenerate={async () => {
                                        await api.post(`/api/admin/partnerships/${id}/generate-pks`);
                                        qc.invalidateQueries({ queryKey: ['admin', 'partnerships', id] });
                                        qc.invalidateQueries({ queryKey: ['admin', 'partnerships'] });
                                    }}
                                    downloadUrl={`/api/admin/partnerships/${id}/download-pks`}
                                    filename={`PKS-${existing?.pks_number || id}.pdf`}
                                />
                            </div>
                        </div>
                    )}

                    {isEdit && existing?.status === 'reported' && !existing?.continuation_decision && (
                        <div className="border-t border-slate-200 pt-3">
                            <div className="text-xs font-bold text-amber-800 mb-2">⏰ Keputusan Keberlanjutan Kerjasama:</div>
                            <div className="flex gap-2">
                                <Button onClick={() => continueMutation.mutate('renew')} disabled={continueMutation.isPending}>
                                    <RefreshCw className="h-4 w-4 mr-1" /> Perpanjang
                                </Button>
                                <Button variant="destructive" onClick={() => continueMutation.mutate('no_renew')} disabled={continueMutation.isPending}>
                                    <XCircle className="h-4 w-4 mr-1" /> Tidak Diperpanjang
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
                    {error && (
                        <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{error}</div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose}>Batal</Button>
                        <Button onClick={() => { setError(''); saveMutation.mutate(); }} disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? 'Menyimpan…' : isEdit ? 'Update' : 'Buat'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return <div><label className="text-xs font-semibold text-slate-700 block mb-1">{label}</label>{children}</div>;
}

function DocumentRow({ label, number, filePath, onGenerate, downloadUrl, filename }) {
    const handleDownload = async () => {
        try {
            const res = await api.get(downloadUrl, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = window.document.createElement('a');
            a.href = url;
            a.download = filename;
            window.document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (e) { alert('Gagal download: ' + (e.response?.data?.message || e.message)); }
    };

    return (
        <div className="bg-white rounded-lg ring-1 ring-slate-200 p-3">
            <div className="flex items-center justify-between mb-1">
                <strong className="text-xs">{label}</strong>
                {filePath && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">READY</span>}
            </div>
            <div className="text-[11px] text-slate-600 font-mono mb-2">{number || '(belum di-generate)'}</div>
            <div className="flex gap-1">
                <button onClick={onGenerate} className="flex-1 text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold flex items-center justify-center gap-1">
                    {filePath ? <RefreshCw className="h-3 w-3" /> : <FilePlus className="h-3 w-3" />}
                    {filePath ? 'Regenerate' : 'Generate'}
                </button>
                {filePath && (
                    <button onClick={handleDownload} className="flex-1 text-[11px] px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1">
                        <FileDown className="h-3 w-3" /> Download
                    </button>
                )}
            </div>
        </div>
    );
}
