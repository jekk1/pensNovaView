import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, FileBadge, Clock, CheckCircle2, AlertTriangle, Calendar, Plus, Eye } from 'lucide-react';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';

const STATUS_BADGE = {
    planned: { label: 'Direncanakan', variant: 'secondary' },
    in_progress: { label: 'Berlangsung', variant: 'warning' },
    submitted: { label: 'Submitted', variant: 'default' },
    issued: { label: 'Terbit', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
    expired: { label: 'Expired', variant: 'destructive' },
};

const CATEGORY_LABEL = { legal: 'Legal & Perizinan', certification: 'Sertifikasi Produk', other: 'Lainnya' };

const fmtIDR = (n) => n ? `Rp ${Number(n).toLocaleString('id-ID')}` : '—';

export default function Certifications() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '', type: '', category: '', q: '', page: 1 });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'certifications', 'stats'],
        queryFn: () => api.get('/api/admin/tenant-certifications-stats').then((r) => r.data),
    });

    const { data: types } = useQuery({
        queryKey: ['admin', 'certifications', 'types'],
        queryFn: () => api.get('/api/admin/tenant-certifications-types').then((r) => r.data.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'certifications', filters],
        queryFn: () => api.get('/api/admin/tenant-certifications', { params: { ...filters, per_page: 25 } }).then((r) => r.data),
    });

    const rows = data?.data ?? [];
    const typeMap = (types || []).reduce((acc, t) => ({ ...acc, [t.key]: t }), {});

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileBadge className="h-6 w-6 text-primary-700" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Legalitas & Sertifikasi Tenant
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Fasilitasi pengurusan dokumen legal (NIB, NPWP, Akta Notaris) dan sertifikasi produk (SNI, Ijin Edar BPOM, Halal BPJPH, Valuasi IT) untuk tenant.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)} className="flex-shrink-0">
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                </Button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
                <StatCard label="Total" value={stats?.total ?? '—'} icon={FileBadge} color="primary" />
                <StatCard label="Direncanakan" value={stats?.planned ?? '—'} icon={Calendar} color="amber" />
                <StatCard label="Berlangsung" value={stats?.in_progress ?? '—'} icon={Clock} color="amber" />
                <StatCard label="Terbit" value={stats?.issued ?? '—'} icon={CheckCircle2} color="emerald" />
                <StatCard label="Expiring (90hr)" value={stats?.expiring_soon ?? '—'} icon={AlertTriangle} color="rose" />
                <StatCard label="Ditolak" value={stats?.rejected ?? '—'} icon={Shield} color="rose" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari tenant / nomor sertifikat…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value, type: '', page: 1 }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Kategori</option>
                        <option value="legal">Legal & Perizinan</option>
                        <option value="certification">Sertifikasi Produk</option>
                    </select>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value, page: 1 }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Jenis</option>
                        {(types || []).filter((t) => !filters.category || t.category === filters.category).map((t) => (
                            <option key={t.key} value={t.key}>{t.label}</option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_BADGE).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner className="h-6 w-6" /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <FileBadge className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <h3 className="font-bold text-sm">Belum ada pengurusan sertifikasi</h3>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Tenant</th>
                                <th className="px-3 py-2 text-left">Jenis</th>
                                <th className="px-3 py-2 text-left">No. Sertifikat</th>
                                <th className="px-3 py-2 text-left">Otoritas</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-left">Terbit / Expire</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = STATUS_BADGE[r.status] || STATUS_BADGE.planned;
                                const meta = typeMap[r.type];
                                return (
                                    <tr key={r.id} className="hover:bg-amber-50/40">
                                        <td className="px-3 py-2 font-semibold">{r.tenant?.name || '—'}</td>
                                        <td className="px-3 py-2">
                                            <div className="font-semibold">{meta?.label || r.type}</div>
                                            <div className="text-[10px] text-slate-500">{CATEGORY_LABEL[meta?.category] || ''}</div>
                                        </td>
                                        <td className="px-3 py-2 font-mono text-[11px]">{r.certificate_number || <span className="text-slate-400">—</span>}</td>
                                        <td className="px-3 py-2">{r.issuing_authority || '—'}</td>
                                        <td className="px-3 py-2"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-3 py-2 text-[11px]">
                                            {r.issued_at && <div>Terbit: {new Date(r.issued_at).toLocaleDateString('id-ID')}</div>}
                                            {r.expires_at && <div className="text-rose-600">Exp: {new Date(r.expires_at).toLocaleDateString('id-ID')}</div>}
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

            {creating && <FormDialog types={types || []} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); qc.invalidateQueries({ queryKey: ['admin', 'certifications'] }); qc.invalidateQueries({ queryKey: ['admin', 'certifications', 'stats'] }); }} />}
            {editing && <FormDialog id={editing} types={types || []} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ['admin', 'certifications'] }); qc.invalidateQueries({ queryKey: ['admin', 'certifications', 'stats'] }); }} />}
        </div>
    );
}

function FormDialog({ id, types, onClose, onSaved }) {
    const qc = useQueryClient();
    const isEdit = !!id;

    const { data: existing } = useQuery({
        queryKey: ['admin', 'certifications', id],
        queryFn: () => api.get(`/api/admin/tenant-certifications/${id}`).then((r) => r.data.data),
        enabled: isEdit,
    });

    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants-simple'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200 } }).then((r) => r.data.data),
    });

    const { data: users } = useQuery({
        queryKey: ['admin', 'users-mentor-admin'],
        queryFn: () => api.get('/api/admin/users', { params: { per_page: 200 } }).then((r) => r.data.data),
    });

    const [form, setForm] = useState({});
    const [formError, setFormError] = useState('');

    const data = isEdit ? { ...existing, ...form } : form;

    const saveMutation = useMutation({
        mutationFn: () => {
            const payload = { ...form };
            if (isEdit) {
                return api.patch(`/api/admin/tenant-certifications/${id}`, payload);
            }
            return api.post('/api/admin/tenant-certifications', payload);
        },
        onSuccess: () => {
            onSaved?.();
            onClose();
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight">
                        {isEdit ? 'Edit Pengurusan' : 'Tambah Pengurusan Legal/Sertifikasi'}
                    </h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Tenant *">
                            <select
                                value={data?.tenant_id ?? ''}
                                onChange={(e) => setField('tenant_id', e.target.value)}
                                disabled={isEdit}
                                className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                            >
                                <option value="">— Pilih —</option>
                                {(tenants || []).map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Jenis Dokumen *">
                            <select
                                value={data?.type ?? ''}
                                onChange={(e) => setField('type', e.target.value)}
                                disabled={isEdit}
                                className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                            >
                                <option value="">— Pilih —</option>
                                <optgroup label="Legal & Perizinan">
                                    {types.filter((t) => t.category === 'legal').map((t) => (
                                        <option key={t.key} value={t.key}>{t.label}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Sertifikasi Produk">
                                    {types.filter((t) => t.category === 'certification').map((t) => (
                                        <option key={t.key} value={t.key}>{t.label}</option>
                                    ))}
                                </optgroup>
                                <option value="other">Lainnya</option>
                            </select>
                        </Field>
                        <Field label="Judul / Catatan Singkat">
                            <Input value={data?.title ?? ''} onChange={(e) => setField('title', e.target.value)} placeholder="Mis: Sertifikasi Halal produk Smart Inverter" />
                        </Field>
                        <Field label="Status">
                            <select
                                value={data?.status ?? 'planned'}
                                onChange={(e) => setField('status', e.target.value)}
                                className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                            >
                                {Object.entries(STATUS_BADGE).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Otoritas Penerbit">
                            <Input value={data?.issuing_authority ?? ''} onChange={(e) => setField('issuing_authority', e.target.value)} placeholder="BPOM, BPJPH, BSN, Notaris, dll." />
                        </Field>
                        <Field label="Fasilitator / Pendamping">
                            <select
                                value={data?.facilitator_id ?? ''}
                                onChange={(e) => setField('facilitator_id', e.target.value)}
                                className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                            >
                                <option value="">—</option>
                                {(users || []).map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="No. Aplikasi">
                            <Input value={data?.application_number ?? ''} onChange={(e) => setField('application_number', e.target.value)} />
                        </Field>
                        <Field label="No. Sertifikat">
                            <Input value={data?.certificate_number ?? ''} onChange={(e) => setField('certificate_number', e.target.value)} />
                        </Field>
                        <Field label="Tanggal Terbit">
                            <Input type="date" value={data?.issued_at ?? ''} onChange={(e) => setField('issued_at', e.target.value)} />
                        </Field>
                        <Field label="Tanggal Expire">
                            <Input type="date" value={data?.expires_at ?? ''} onChange={(e) => setField('expires_at', e.target.value)} />
                        </Field>
                        <Field label="Biaya (Rp)">
                            <Input type="number" step="0.01" value={data?.cost ?? ''} onChange={(e) => setField('cost', e.target.value)} />
                        </Field>
                    </div>
                    <Field label="Catatan">
                        <textarea rows="3" value={data?.notes ?? ''} onChange={(e) => setField('notes', e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>
                </div>
                <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose}>Batal</Button>
                        <Button onClick={() => { setFormError(''); saveMutation.mutate(); }} disabled={saveMutation.isPending}>
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
