import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Building2, FileDown, Clock, CheckCircle2, AlertCircle, Calendar, Banknote,
    Upload, FileText, X, Check,
} from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import Spinner from '../../components/Spinner';

const STATUS_BADGE = {
    requested: { label: 'Menunggu Persetujuan', variant: 'warning' },
    approved: { label: 'Disetujui — Menunggu Pembayaran', variant: 'default' },
    active: { label: 'Aktif', variant: 'success' },
    expired: { label: 'Selesai', variant: 'secondary' },
    cancelled: { label: 'Dibatalkan', variant: 'destructive' },
    terminated: { label: 'Diputus', variant: 'destructive' },
};

const fmtIDR = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

export default function TenantWorkspaceRentals() {
    const { data, isLoading } = useQuery({
        queryKey: ['tenant', 'workspace-rentals'],
        queryFn: () => api.get('/api/tenant/workspace-rentals').then((r) => r.data),
    });

    const rentals = data?.data || [];

    return (
        <div>
            <header className="mb-5 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-7 w-7 text-emerald-700" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Sewa Ruang</h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        Status permintaan sewa ruang inkubator dan kontrak Anda.
                    </p>
                </div>
                <Link to="/sewa-ruang">
                    <Button>Lihat Ruang Tersedia</Button>
                </Link>
            </header>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner className="h-8 w-8 text-emerald-600" /></div>
            ) : rentals.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-bold text-base">Belum ada sewa ruang aktif</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                            Jelajahi denah ruang inkubator UPA dan ajukan permintaan sewa.
                        </p>
                        <Link to="/sewa-ruang"><Button>Lihat Ruang Tersedia</Button></Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {rentals.map((r) => <RentalCard key={r.id} rental={r} />)}
                </div>
            )}
        </div>
    );
}

function RentalCard({ rental: r }) {
    const status = STATUS_BADGE[r.status] || STATUS_BADGE.requested;

    return (
        <Card className={r.status === 'active' ? 'border-emerald-300' : ''}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                    <div>
                        <h3 className="font-bold text-base">{r.slot?.name}</h3>
                        <div className="text-xs text-slate-600 mt-0.5">
                            {r.slot?.size_label} · Kontrak: <strong className="font-mono">{r.contract_number || '—'}</strong>
                        </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <Info icon={Calendar} label="Mulai" value={new Date(r.start_date).toLocaleDateString('id-ID')} />
                    <Info icon={Calendar} label="Berakhir" value={new Date(r.end_date).toLocaleDateString('id-ID')} />
                    <Info icon={Banknote} label="Total" value={fmtIDR(r.total_amount)} />
                    <Info icon={CheckCircle2} label="Pembayaran" value={r.payment_first_paid_at && r.payment_second_paid_at ? 'Lunas' : r.payment_first_paid_at ? '1 dari 2 termin' : 'Belum dibayar'} />
                </div>

                <PaymentInfo rental={r} />

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end gap-2 flex-wrap">
                    {r.contract_file_path && (
                        <Button onClick={async () => {
                            try {
                                const res = await api.get(`/api/tenant/workspace-rentals/${r.id}/contract`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                const a = window.document.createElement('a');
                                a.href = url;
                                a.download = `Kontrak-${r.contract_number || r.id}.pdf`;
                                window.document.body.appendChild(a);
                                a.click();
                                a.remove();
                                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                            } catch (e) { alert('Gagal download: ' + (e.response?.data?.message || e.message)); }
                        }}>
                            <FileDown className="h-4 w-4 mr-1" /> Download Kontrak
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function PaymentInfo({ rental: r }) {
    if (r.status === 'requested') {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>Permintaan sedang ditinjau oleh tim UPA. Anda akan dihubungi via email/telepon untuk konfirmasi.</div>
            </div>
        );
    }
    if (r.status === 'cancelled' || r.status === 'terminated' || r.status === 'expired') {
        return null;
    }

    return (
        <div className="space-y-2">
            <PaymentTermPanel rental={r} term="first" />
            {r.payment_first_paid_at && <PaymentTermPanel rental={r} term="second" />}
        </div>
    );
}

function PaymentTermPanel({ rental: r, term }) {
    const qc = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const isFirst = term === 'first';
    const amount = isFirst ? r.payment_first : r.payment_second;
    const dueDate = isFirst ? r.payment_first_due : r.payment_second_due;
    const paidAt = isFirst ? r.payment_first_paid_at : r.payment_second_paid_at;
    const proofPath = isFirst ? r.payment_first_proof_path : r.payment_second_proof_path;
    const submittedAt = isFirst ? r.payment_first_submitted_at : r.payment_second_submitted_at;
    const invoiceNumber = isFirst ? r.invoice_first_number : r.invoice_second_number;
    const invoicePath = isFirst ? r.invoice_first_path : r.invoice_second_path;
    const label = isFirst ? 'Termin 1' : 'Termin 2';

    const upload = useMutation({
        mutationFn: (file) => {
            const fd = new FormData();
            fd.append('term', term);
            fd.append('proof', file);
            return api.post(`/api/tenant/workspace-rentals/${r.id}/payment-proof`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tenant', 'workspace-rentals'] });
            setUploading(false);
            alert('Bukti pembayaran terkirim. Menunggu verifikasi UPA.');
        },
        onError: (err) => {
            setUploading(false);
            alert('Gagal upload: ' + (err.response?.data?.message || err.message));
        },
    });

    const downloadInvoice = async () => {
        try {
            const res = await api.get(`/api/tenant/workspace-rentals/${r.id}/invoice/${term}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = window.document.createElement('a');
            a.href = url;
            a.download = `Invoice-${invoiceNumber || r.id}.pdf`;
            window.document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (e) { alert('Gagal download: ' + (e.response?.data?.message || e.message)); }
    };

    // State warna panel
    const tone = paidAt
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : submittedAt
            ? 'bg-sky-50 border-sky-200 text-sky-900'
            : 'bg-amber-50 border-amber-200 text-amber-900';

    return (
        <div className={`rounded-lg border p-3 ${tone}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                        {paidAt ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Banknote className="h-4 w-4" />}
                        {label} — {fmtIDR(amount)}
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-80">
                        Jatuh tempo: {dueDate ? new Date(dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    </div>
                </div>
                <Badge variant={paidAt ? 'success' : submittedAt ? 'default' : 'warning'}>
                    {paidAt ? <><Check className="h-3 w-3 inline mr-0.5" />Lunas</> : submittedAt ? 'Menunggu Verifikasi' : 'Belum Bayar'}
                </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {invoicePath && (
                    <button onClick={downloadInvoice} className="inline-flex items-center px-2 py-1 rounded bg-white hover:bg-slate-50 ring-1 ring-slate-200 font-semibold">
                        <FileText className="h-3 w-3 mr-1" /> Invoice {invoiceNumber || ''}
                    </button>
                )}
                {! invoicePath && ! paidAt && (
                    <span className="text-[10px] italic opacity-70">Invoice belum diterbitkan UPA.</span>
                )}
                {! paidAt && (
                    <label className="inline-flex items-center px-2 py-1 rounded bg-primary-700 hover:bg-primary-800 text-white font-semibold cursor-pointer">
                        <Upload className="h-3 w-3 mr-1" />
                        {uploading || upload.isPending ? 'Uploading…' : (submittedAt ? 'Ganti Bukti' : 'Upload Bukti Transfer')}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (! f) return;
                                setUploading(true);
                                upload.mutate(f);
                            }}
                            disabled={upload.isPending}
                        />
                    </label>
                )}
                {proofPath && submittedAt && (
                    <span className="text-[10px] italic">
                        Bukti dikirim {new Date(submittedAt).toLocaleDateString('id-ID')}
                    </span>
                )}
            </div>
        </div>
    );
}

function Info({ icon: Icon, label, value }) {
    return (
        <div className="bg-slate-50 rounded p-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
                <Icon className="h-3 w-3" /> {label}
            </div>
            <div className="text-xs font-semibold mt-0.5">{value || '—'}</div>
        </div>
    );
}
