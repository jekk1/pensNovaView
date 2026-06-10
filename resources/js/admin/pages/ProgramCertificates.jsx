import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Award, Plus, Eye, Search, CheckCircle2, Clock, ClipboardList,
    Download, X, FileBadge, XCircle, RefreshCw, Link as LinkIcon, ShieldOff,
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
    pending_feedback: { label: 'Menunggu Feedback', variant: 'secondary', icon: ClipboardList },
    pending_approval: { label: 'Menunggu ACC Kepala UPA', variant: 'warning', icon: Clock },
    approved: { label: 'Disetujui (Cetak)', variant: 'default', icon: CheckCircle2 },
    issued: { label: 'Terbit', variant: 'success', icon: FileBadge },
    revoked: { label: 'Dicabut', variant: 'destructive', icon: ShieldOff },
};

const STATUS_DESC = {
    pending_feedback: 'Peserta belum mengisi Survey Feedback Program.',
    pending_approval: 'Feedback sudah terisi — siap di-ACC Kepala UPA.',
    approved: 'Sudah disetujui & PDF sertifikat sudah dicetak.',
    issued: 'Sertifikat aktif, bisa di-download.',
    revoked: 'Sertifikat dicabut — tidak bisa di-download.',
};

export default function ProgramCertificates() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        q: '',
    });
    const [selected, setSelected] = useState(null);
    const [creating, setCreating] = useState(false);

    const isKepalaUpa = user?.roles?.some((r) => ['super-admin', 'kepala-upa'].includes(r));

    const { data: stats } = useQuery({
        queryKey: ['admin', 'program-certificates', 'stats'],
        queryFn: () => api.get('/api/admin/program-certificates-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'program-certificates', filters],
        queryFn: () => api.get('/api/admin/program-certificates', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    const rows = data?.data ?? [];

    const linkFeedback = useMutation({
        mutationFn: (id) => api.post(`/api/admin/program-certificates/${id}/link-feedback`).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['admin', 'program-certificates'] });
            alert(res.message);
        },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    const approve = useMutation({
        mutationFn: (id) => api.post(`/api/admin/program-certificates/${id}/approve`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'program-certificates'] });
            qc.invalidateQueries({ queryKey: ['admin', 'program-certificates', 'stats'] });
            alert('Sertifikat berhasil diterbitkan & PDF di-generate.');
        },
        onError: (err) => alert(err.response?.data?.message || 'Gagal approve.'),
    });

    const regenerate = useMutation({
        mutationFn: (id) => api.post(`/api/admin/program-certificates/${id}/regenerate`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'program-certificates'] });
            alert('PDF di-regenerate.');
        },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    const revoke = useMutation({
        mutationFn: ({ id, reason }) => api.post(`/api/admin/program-certificates/${id}/revoke`, { reason }).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'program-certificates'] });
            qc.invalidateQueries({ queryKey: ['admin', 'program-certificates', 'stats'] });
            setSelected(null);
            alert('Sertifikat dicabut.');
        },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Award className="h-6 w-6 text-amber-600" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            Sertifikat Peserta Program Inkubasi
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Sertifikat untuk mahasiswa anggota tim tenant. Alur: <strong>buat sertifikat</strong> → peserta isi <strong>Survey Feedback Program</strong> → <strong>Kepala UPA ACC</strong> → PDF auto-cetak & bisa di-download.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setCreating(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Buat Sertifikat
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatCard label="Total" value={stats?.total ?? 0} icon={Award} />
                <StatCard label="Menunggu Feedback" value={stats?.pending_feedback ?? 0} icon={ClipboardList} tone="amber" />
                <StatCard label="Menunggu ACC" value={stats?.pending_approval ?? 0} icon={Clock} tone="orange" />
                <StatCard label="Sudah Terbit" value={stats?.issued ?? 0} icon={FileBadge} tone="emerald" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex gap-2 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari nama / email / nomor sertifikat..."
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
            ) : rows.length === 0 ? (
                <Card><CardContent className="p-6 text-center text-sm text-slate-500">Belum ada sertifikat.</CardContent></Card>
            ) : (
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                <tr>
                                    <th className="px-3 py-2 text-left">Penerima</th>
                                    <th className="px-3 py-2 text-left">Tenant / Batch</th>
                                    <th className="px-3 py-2 text-left">Nomor Sertifikat</th>
                                    <th className="px-3 py-2 text-left">Status</th>
                                    <th className="px-3 py-2 text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((r) => {
                                    const status = STATUS_BADGE[r.status] || { label: r.status, variant: 'secondary' };
                                    const StatusIcon = status.icon;
                                    return (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-2">
                                                <div className="font-semibold text-slate-900">{r.recipient_name}</div>
                                                <div className="text-xs text-slate-500">{r.recipient_email || '—'}</div>
                                                {r.role_in_program && <div className="text-xs text-amber-700 mt-0.5">{r.role_in_program}</div>}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="text-slate-700">{r.tenant?.name || '—'}</div>
                                                <div className="text-xs text-slate-500">{r.batch?.name || 'Tanpa batch'}</div>
                                            </td>
                                            <td className="px-3 py-2 font-mono text-xs">{r.certificate_number || '—'}</td>
                                            <td className="px-3 py-2">
                                                <Badge variant={status.variant}>
                                                    {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                                                    {status.label}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2 flex gap-1 flex-wrap">
                                                <Button size="sm" variant="ghost" onClick={() => setSelected(r)} title="Detail">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {r.status === 'pending_feedback' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => linkFeedback.mutate(r.id)}
                                                        title="Cek apakah peserta sudah isi feedback"
                                                    >
                                                        <LinkIcon className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {r.status === 'pending_approval' && isKepalaUpa && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm(`Setujui & cetak sertifikat untuk ${r.recipient_name}?`)) {
                                                                approve.mutate(r.id);
                                                            }
                                                        }}
                                                        disabled={approve.isPending}
                                                    >
                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Setujui & Cetak
                                                    </Button>
                                                )}
                                                {r.status === 'issued' && (
                                                    <>
                                                        <a
                                                            href={`/api/admin/program-certificates/${r.id}/download`}
                                                            target="_blank"
                                                            rel="noopener"
                                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        >
                                                            <Download className="h-3 w-3 mr-1" /> PDF
                                                        </a>
                                                        {isKepalaUpa && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    if (confirm('Regenerate PDF (mis. setelah ganti nama penandatangan)?')) {
                                                                        regenerate.mutate(r.id);
                                                                    }
                                                                }}
                                                                title="Regenerate PDF"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {creating && <CreateDialog onClose={() => setCreating(false)} />}
            {selected && (
                <DetailDialog
                    cert={selected}
                    onClose={() => setSelected(null)}
                    isKepalaUpa={isKepalaUpa}
                    onApprove={() => approve.mutate(selected.id)}
                    onRevoke={(reason) => revoke.mutate({ id: selected.id, reason })}
                />
            )}
        </div>
    );
}

function CreateDialog({ onClose }) {
    const qc = useQueryClient();
    const [tenantId, setTenantId] = useState('');
    const [batchId, setBatchId] = useState('');
    const [period, setPeriod] = useState({ start: '', end: '' });
    const [selectedFounders, setSelectedFounders] = useState({});
    const [formError, setFormError] = useState('');

    const { data: tenants } = useQuery({
        queryKey: ['admin', 'tenants-list'],
        queryFn: () => api.get('/api/admin/tenants', { params: { per_page: 200 } }).then((r) => r.data?.data ?? []),
    });

    const { data: founders } = useQuery({
        queryKey: ['admin', 'eligible-founders', tenantId, batchId],
        queryFn: () => api.get('/api/admin/program-certificates-eligible-founders', {
            params: { tenant_id: tenantId || undefined, batch_id: batchId || undefined },
        }).then((r) => r.data?.data ?? []),
        enabled: Boolean(tenantId || batchId),
    });

    const bulkCreate = useMutation({
        mutationFn: (payload) => api.post('/api/admin/program-certificates-bulk', payload).then((r) => r.data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['admin', 'program-certificates'] });
            qc.invalidateQueries({ queryKey: ['admin', 'program-certificates', 'stats'] });
            alert(res.message);
            onClose();
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    const toggle = (id) => setSelectedFounders((s) => ({ ...s, [id]: !s[id] }));
    const ids = Object.keys(selectedFounders).filter((k) => selectedFounders[k]).map(Number);

    const submit = () => {
        if (ids.length === 0) return alert('Pilih minimal 1 peserta.');
        setFormError('');
        bulkCreate.mutate({
            founder_ids: ids,
            batch_id: batchId || null,
            program_period_start: period.start || null,
            program_period_end: period.end || null,
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg">Buat Sertifikat Peserta</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-700">Tenant</label>
                            <select
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm mt-1"
                            >
                                <option value="">— Pilih Tenant —</option>
                                {(tenants || []).map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-700">Periode Program (opsional)</label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input type="date" value={period.start} onChange={(e) => setPeriod({ ...period, start: e.target.value })} />
                                <Input type="date" value={period.end} onChange={(e) => setPeriod({ ...period, end: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {tenantId && (
                        <div>
                            <div className="text-xs font-semibold text-slate-700 mb-1">
                                Pilih Mahasiswa Penerima ({(founders || []).length} ditemukan)
                            </div>
                            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 max-h-72 overflow-y-auto">
                                {(founders || []).map((f) => (
                                    <label key={f.id} className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50 ${f.has_certificate ? 'opacity-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedFounders[f.id]}
                                            onChange={() => toggle(f.id)}
                                            disabled={f.has_certificate}
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm">{f.name}</div>
                                            <div className="text-xs text-slate-500">{f.email || '—'} · {f.role || 'Anggota'}</div>
                                        </div>
                                        {f.has_certificate && (
                                            <Badge variant="secondary" className="text-[10px]">Sudah ada ({f.certificate_status})</Badge>
                                        )}
                                    </label>
                                ))}
                                {(!founders || founders.length === 0) && (
                                    <div className="p-4 text-center text-xs text-slate-500">
                                        Tidak ada founder untuk tenant ini. Tambahkan di menu Tenants → Edit → Founders.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="border-t p-3">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button onClick={submit} disabled={bulkCreate.isPending || ids.length === 0}>
                        Buat {ids.length > 0 ? `${ids.length} Sertifikat` : ''}
                    </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailDialog({ cert, onClose, isKepalaUpa, onApprove, onRevoke }) {
    const [showRevoke, setShowRevoke] = useState(false);
    const [reason, setReason] = useState('');

    const { data } = useQuery({
        queryKey: ['admin', 'program-certificate', cert.id],
        queryFn: () => api.get(`/api/admin/program-certificates/${cert.id}`).then((r) => r.data.data),
    });

    const c = data || cert;
    const status = STATUS_BADGE[c.status] || { label: c.status, variant: 'secondary' };

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg">Detail Sertifikat</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto text-sm">
                    <Field label="Penerima" value={c.recipient_name} />
                    <Field label="Email" value={c.recipient_email} />
                    <Field label="Peran" value={c.role_in_program} />
                    <Field label="Tenant" value={c.tenant?.name} />
                    <Field label="Batch" value={c.batch?.name} />
                    <Field label="Program" value={c.program_name} />
                    <Field
                        label="Periode"
                        value={c.program_period_start ? `${c.program_period_start} → ${c.program_period_end || '—'}` : '—'}
                    />
                    <Field label="Nomor Sertifikat" value={c.certificate_number} />
                    <Field label="Status">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <div className="text-xs text-slate-500 mt-1">{STATUS_DESC[c.status]}</div>
                    </Field>
                    {c.feedback_submitted_at && (
                        <Field label="Feedback diisi" value={new Date(c.feedback_submitted_at).toLocaleString('id-ID')} />
                    )}
                    {c.approver && (
                        <Field label="Disetujui oleh" value={`${c.approver.name} · ${c.approved_at ? new Date(c.approved_at).toLocaleString('id-ID') : ''}`} />
                    )}
                    {c.revoked_at && (
                        <Field label="Dicabut" value={`${new Date(c.revoked_at).toLocaleString('id-ID')} — ${c.revoked_reason}`} />
                    )}

                    {c.status === 'pending_feedback' && (
                        <div className="bg-amber-50 ring-1 ring-amber-200 rounded-md p-3 text-xs text-amber-800">
                            <strong>Belum ada feedback dari peserta.</strong> Minta {c.recipient_name} buka link survey feedback program & isi dengan email <code className="bg-white px-1 rounded">{c.recipient_email}</code>. Setelah itu klik tombol Link Feedback di tabel.
                        </div>
                    )}
                </div>
                <div className="border-t p-3 flex justify-end gap-2 flex-wrap">
                    <Button variant="ghost" onClick={onClose}>Tutup</Button>
                    {c.status === 'pending_approval' && isKepalaUpa && (
                        <Button onClick={onApprove}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Setujui & Cetak
                        </Button>
                    )}
                    {c.status === 'issued' && (
                        <a
                            href={`/api/admin/program-certificates/${c.id}/download`}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center px-3 py-2 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            <Download className="h-4 w-4 mr-1" /> Download PDF
                        </a>
                    )}
                    {['issued', 'approved', 'pending_approval'].includes(c.status) && isKepalaUpa && !showRevoke && (
                        <Button variant="ghost" className="text-rose-600" onClick={() => setShowRevoke(true)}>
                            <XCircle className="h-4 w-4 mr-1" /> Cabut
                        </Button>
                    )}
                </div>
                {showRevoke && (
                    <div className="border-t p-3 bg-rose-50">
                        <div className="text-xs font-semibold text-rose-800 mb-1">Alasan pencabutan (wajib)</div>
                        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Mis. data tidak valid, peserta DO, dll" />
                        <div className="mt-2 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setShowRevoke(false)}>Batal</Button>
                            <Button
                                onClick={() => {
                                    if (!reason.trim()) return;
                                    onRevoke(reason.trim());
                                }}
                                disabled={!reason.trim()}
                            >
                                Konfirmasi Pencabutan
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Field({ label, value, children }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="text-xs text-slate-500 uppercase">{label}</div>
            <div className="col-span-2">
                {children || <div className="text-slate-800">{value || '—'}</div>}
            </div>
        </div>
    );
}
