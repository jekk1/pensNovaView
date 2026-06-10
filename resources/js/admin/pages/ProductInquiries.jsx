import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Mail, MessageSquare, CheckCircle2, Clock, Search, X, Eye,
    Building2, Phone, Briefcase, Send, AlertCircle, Sparkles,
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
    new: { label: 'Baru', variant: 'warning', icon: AlertCircle },
    contacted: { label: 'Sudah Dihubungi', variant: 'default', icon: Mail },
    in_discussion: { label: 'Dalam Diskusi', variant: 'default', icon: MessageSquare },
    closed_won: { label: 'Sukses', variant: 'success', icon: CheckCircle2 },
    closed_lost: { label: 'Tidak Lanjut', variant: 'destructive', icon: X },
};

const INTEREST_LABEL = {
    license: 'Lisensi penggunaan',
    purchase: 'Pembelian / pengadaan',
    research_collab: 'Riset kolaboratif',
    distribution: 'Distribusi / reseller',
    other: 'Lainnya',
};

export default function ProductInquiries() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '', q: '' });
    const [selected, setSelected] = useState(null);
    const [formError, setFormError] = useState('');

    const { data: stats } = useQuery({
        queryKey: ['admin', 'product-inquiries', 'stats'],
        queryFn: () => api.get('/api/admin/product-inquiries-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'product-inquiries', filters],
        queryFn: () => api.get('/api/admin/product-inquiries', { params: { ...filters, per_page: 25 } }).then((r) => r.data),
    });

    const rows = data?.data ?? [];

    const update = useMutation({
        mutationFn: ({ id, payload }) => api.patch(`/api/admin/product-inquiries/${id}`, payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'product-inquiries'] });
            qc.invalidateQueries({ queryKey: ['admin', 'product-inquiries', 'stats'] });
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <div>
            <header className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-6 w-6 text-amber-500" />
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                        Inquiry Komersialisasi Produk Inovasi
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                    Permintaan dari calon mitra industri yang submit interest melalui halaman publik <code className="bg-slate-100 px-1 rounded">/produk-inovasi</code>. PIC default: Kadiv Knowledge Asset Management.
                    SLA respons: 2-3 hari kerja.
                </p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                <StatCard label="Total Inquiry" value={stats?.total ?? 0} icon={Mail} />
                <StatCard label="Baru" value={stats?.new ?? 0} icon={AlertCircle} tone="amber" />
                <StatCard label="Dihubungi" value={stats?.contacted ?? 0} icon={Clock} tone="sky" />
                <StatCard label="Diskusi" value={stats?.in_discussion ?? 0} icon={MessageSquare} tone="violet" />
                <StatCard label="Sukses" value={stats?.closed_won ?? 0} icon={CheckCircle2} tone="emerald" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex gap-2 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari nama / email / organisasi..."
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
                <Card><CardContent className="p-6 text-center text-sm text-slate-500">Belum ada inquiry.</CardContent></Card>
            ) : (
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                <tr>
                                    <th className="px-3 py-2 text-left">Peminat</th>
                                    <th className="px-3 py-2 text-left">Produk</th>
                                    <th className="px-3 py-2 text-left">Tipe</th>
                                    <th className="px-3 py-2 text-left">Status</th>
                                    <th className="px-3 py-2 text-left">Tanggal</th>
                                    <th className="px-3 py-2 text-left"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((r) => {
                                    const status = STATUS_BADGE[r.status] || { label: r.status, variant: 'secondary' };
                                    const StatusIcon = status.icon;
                                    return (
                                        <tr key={r.id} className={`hover:bg-slate-50 ${r.status === 'new' ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-3 py-2">
                                                <div className="font-semibold text-slate-900">{r.inquirer_name}</div>
                                                <div className="text-xs text-slate-500">
                                                    {r.inquirer_organization || '—'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="font-medium text-slate-800 line-clamp-1">{r.product?.title || '—'}</div>
                                            </td>
                                            <td className="px-3 py-2 text-xs">
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                    {INTEREST_LABEL[r.interest_type] || r.interest_type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge variant={status.variant}>
                                                    {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                                                    {status.label}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-500">
                                                {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </td>
                                            <td className="px-3 py-2">
                                                <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {selected && (
                <InquiryDetail
                    id={selected.id}
                    onClose={() => setSelected(null)}
                    onUpdate={(payload) => { setFormError(''); update.mutate({ id: selected.id, payload }); }}
                    isPending={update.isPending}
                    formError={formError}
                />
            )}
        </div>
    );
}

function InquiryDetail({ id, onClose, onUpdate, isPending, formError }) {
    const { data } = useQuery({
        queryKey: ['admin', 'product-inquiry', id],
        queryFn: () => api.get(`/api/admin/product-inquiries/${id}`).then((r) => r.data.data),
    });

    const [notes, setNotes] = useState('');

    if (! data) return null;

    const status = STATUS_BADGE[data.status] || { label: data.status };

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Detail Inquiry</h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                            Diterima {new Date(data.created_at).toLocaleString('id-ID')}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto">
                    <div className="bg-amber-50 ring-1 ring-amber-200 rounded-lg p-3">
                        <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1">Produk yang diminati</div>
                        <div className="font-bold text-slate-900">{data.product?.title || '—'}</div>
                        {data.product?.linked_patent && (
                            <div className="text-xs text-slate-700 mt-1">
                                🛡️ HKI: {data.product.linked_patent.title}
                            </div>
                        )}
                    </div>

                    <Section title="Identitas Peminat">
                        <Row label="Nama" value={data.inquirer_name} />
                        <Row label="Email" value={
                            <a href={`mailto:${data.inquirer_email}`} className="text-primary-700 hover:underline">
                                {data.inquirer_email}
                            </a>
                        } />
                        {data.inquirer_phone && (
                            <Row label="Telepon" value={
                                <a href={`tel:${data.inquirer_phone}`} className="text-primary-700 hover:underline">
                                    {data.inquirer_phone}
                                </a>
                            } />
                        )}
                        {data.inquirer_organization && <Row label="Organisasi" value={data.inquirer_organization} />}
                        {data.inquirer_position && <Row label="Jabatan" value={data.inquirer_position} />}
                    </Section>

                    <Section title="Jenis Ketertarikan">
                        <div className="px-3 py-2 rounded-lg bg-violet-50 text-violet-800 text-sm">
                            {INTEREST_LABEL[data.interest_type] || data.interest_type}
                        </div>
                    </Section>

                    <Section title="Pesan dari Peminat">
                        <div className="px-4 py-3 rounded-lg bg-slate-50 ring-1 ring-slate-200 text-sm text-slate-800 whitespace-pre-wrap">
                            {data.message}
                        </div>
                    </Section>

                    <Section title="Tindak Lanjut Internal">
                        <Row label="Status" value={
                            <Badge variant={status.variant}>{status.label}</Badge>
                        } />
                        {data.contacted_at && <Row label="Dihubungi" value={new Date(data.contacted_at).toLocaleString('id-ID')} />}
                        {data.closed_at && <Row label="Ditutup" value={new Date(data.closed_at).toLocaleString('id-ID')} />}
                        {data.assignee && <Row label="PIC" value={data.assignee.name} />}
                        {data.admin_notes && (
                            <div className="mt-2 px-3 py-2 rounded bg-slate-50 text-sm whitespace-pre-wrap">
                                {data.admin_notes}
                            </div>
                        )}
                    </Section>

                    <Section title="Tambah Catatan Internal">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Mis: Sudah email balasan 12 Mei, follow up minggu depan."
                            rows={3}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm"
                        />
                    </Section>
                </div>

                <div className="border-t p-3 bg-slate-50">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <div className="flex flex-wrap justify-end gap-2">
                    <a
                        href={`mailto:${data.inquirer_email}?subject=Re: Inquiry untuk ${encodeURIComponent(data.product?.title || '')}`}
                        className="inline-flex items-center px-3 py-2 rounded-md text-sm bg-white ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                        <Mail className="h-4 w-4 mr-1" /> Balas Email
                    </a>
                    {data.status === 'new' && (
                        <Button
                            onClick={() => onUpdate({ status: 'contacted', admin_notes: notes || data.admin_notes })}
                            disabled={isPending}
                        >
                            <Send className="h-4 w-4 mr-1" /> Tandai Sudah Dihubungi
                        </Button>
                    )}
                    {data.status === 'contacted' && (
                        <Button
                            onClick={() => onUpdate({ status: 'in_discussion', admin_notes: notes || data.admin_notes })}
                            disabled={isPending}
                        >
                            Masuk Diskusi
                        </Button>
                    )}
                    {['contacted', 'in_discussion'].includes(data.status) && (
                        <>
                            <Button
                                variant="ghost"
                                className="text-emerald-700"
                                onClick={() => onUpdate({ status: 'closed_won', admin_notes: notes || data.admin_notes })}
                                disabled={isPending}
                            >
                                Sukses
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-rose-600"
                                onClick={() => onUpdate({ status: 'closed_lost', admin_notes: notes || data.admin_notes })}
                                disabled={isPending}
                            >
                                Tidak Lanjut
                            </Button>
                        </>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</div>
            {children}
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="grid grid-cols-3 gap-2 text-sm py-1">
            <div className="text-xs text-slate-500 uppercase">{label}</div>
            <div className="col-span-2 text-slate-800">{value || '—'}</div>
        </div>
    );
}
