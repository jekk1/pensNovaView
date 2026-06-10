import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, Plus, Eye, X, Banknote, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
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
    reported: { label: 'Dilaporkan', variant: 'warning' },
    invoiced: { label: 'Tagihan Terbit', variant: 'default' },
    paid: { label: 'Dibayar', variant: 'default' },
    verified: { label: 'Terverifikasi', variant: 'success' },
    disputed: { label: 'Sengketa', variant: 'destructive' },
};

const fmtIDR = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

export default function RoyaltyPayments() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '' });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'royalty-payments', 'stats'],
        queryFn: () => api.get('/api/admin/royalty-payments-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'royalty-payments', filters],
        queryFn: () => api.get('/api/admin/royalty-payments', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    const update = useMutation({
        mutationFn: ({ id, payload }) => api.patch(`/api/admin/royalty-payments/${id}`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'royalty-payments'] });
            qc.invalidateQueries({ queryKey: ['admin', 'royalty-payments', 'stats'] });
        },
    });

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Royalti Masuk</h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Tracking pembayaran royalti per periode dari mitra lisensee. Lifecycle: Dilaporkan → Tagihan → Dibayar → Terverifikasi.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" /> Catat Royalti</Button>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <StatCard label="Total Catatan" value={stats?.total ?? 0} icon={FileText} color="primary" />
                <StatCard label="Pending Verifikasi" value={stats?.pending ?? 0} icon={AlertCircle} color="amber" />
                <StatCard label="Sudah Diterima" value={fmtIDR(stats?.total_paid)} icon={CheckCircle2} color="emerald" />
                <StatCard label="Outstanding (Owed)" value={fmtIDR(stats?.total_owed)} icon={Banknote} color="rose" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex gap-2 flex-wrap items-center">
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
                <Spinner className="h-8 w-8 mx-auto" />
            ) : (data?.data || []).length === 0 ? (
                <Card><CardContent className="p-8 text-center text-sm text-slate-500">Belum ada catatan royalti.</CardContent></Card>
            ) : (
                <Card><CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                            <tr>
                                <th className="px-3 py-2 text-left">Deal / Paten</th>
                                <th className="px-3 py-2 text-left">Periode</th>
                                <th className="px-3 py-2 text-right">Gross Revenue</th>
                                <th className="px-3 py-2 text-right">Royalti Owed</th>
                                <th className="px-3 py-2 text-right">Dibayar</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.data.map((r) => {
                                const status = STATUS_BADGE[r.status];
                                return (
                                    <tr key={r.id} className="hover:bg-slate-50">
                                        <td className="px-3 py-2">
                                            <div className="font-semibold text-slate-900 text-xs">{r.deal?.title}</div>
                                            <div className="text-[11px] text-slate-500">{r.deal?.patent?.title}</div>
                                        </td>
                                        <td className="px-3 py-2 text-xs">
                                            <div className="font-semibold">{r.period_label || '—'}</div>
                                            <div className="text-[10px] text-slate-500">{r.period_start} → {r.period_end}</div>
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-mono">{fmtIDR(r.reported_gross_revenue)}</td>
                                        <td className="px-3 py-2 text-right text-xs font-mono font-bold">{fmtIDR(r.royalty_owed)}</td>
                                        <td className="px-3 py-2 text-right text-xs font-mono text-emerald-700">{fmtIDR(r.amount_paid)}</td>
                                        <td className="px-3 py-2"><Badge variant={status.variant}>{status.label}</Badge></td>
                                        <td className="px-3 py-2 flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => setEditing(r)}><Eye className="h-4 w-4" /></Button>
                                            {r.status === 'reported' && (
                                                <Button size="sm" onClick={() => update.mutate({ id: r.id, payload: { status: 'paid', amount_paid: r.royalty_owed } })}>Mark Paid</Button>
                                            )}
                                            {r.status === 'paid' && (
                                                <Button size="sm" onClick={() => update.mutate({ id: r.id, payload: { status: 'verified' } })}>Verifikasi</Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent></Card>
            )}

            {(creating || editing) && (
                <PaymentDialog
                    payment={editing}
                    onClose={() => { setCreating(false); setEditing(null); }}
                    onSaved={() => {
                        qc.invalidateQueries({ queryKey: ['admin', 'royalty-payments'] });
                        qc.invalidateQueries({ queryKey: ['admin', 'royalty-payments', 'stats'] });
                        setCreating(false); setEditing(null);
                    }}
                />
            )}
        </div>
    );
}

function PaymentDialog({ payment, onClose, onSaved }) {
    const isEdit = !! payment?.id;
    const [form, setForm] = useState({
        license_deal_id: payment?.license_deal_id || '',
        period_label: payment?.period_label || '',
        period_start: payment?.period_start?.split('T')[0] || '',
        period_end: payment?.period_end?.split('T')[0] || '',
        reported_gross_revenue: payment?.reported_gross_revenue || 0,
        royalty_owed: payment?.royalty_owed || 0,
        amount_paid: payment?.amount_paid || 0,
        status: payment?.status || 'reported',
        due_date: payment?.due_date?.split('T')[0] || '',
        notes: payment?.notes || '',
    });
    const [formError, setFormError] = useState('');

    const { data: deals } = useQuery({
        queryKey: ['admin', 'license-deals-list'],
        queryFn: () => api.get('/api/admin/license-deals', { params: { per_page: 200 } }).then((r) => r.data?.data ?? []),
    });

    const save = useMutation({
        mutationFn: () => isEdit
            ? api.patch(`/api/admin/royalty-payments/${payment.id}`, form)
            : api.post('/api/admin/royalty-payments', form),
        onSuccess: onSaved,
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold">{isEdit ? 'Edit Royalti' : 'Catat Royalti Baru'}</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-3 overflow-y-auto">
                    {! isEdit && (
                        <Field label="License Deal *">
                            <select value={form.license_deal_id} onChange={(e) => setForm({ ...form, license_deal_id: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                <option value="">— Pilih Deal —</option>
                                {(deals || []).map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                            </select>
                        </Field>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Periode Label"><Input value={form.period_label} onChange={(e) => setForm({ ...form, period_label: e.target.value })} placeholder="Q1 2026" /></Field>
                        <Field label="Dari *"><Input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} /></Field>
                        <Field label="Sampai *"><Input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} /></Field>
                    </div>
                    <Field label="Gross Revenue Dilaporkan (Rp)"><CurrencyInput value={form.reported_gross_revenue ?? ''} onChange={(v) => setForm({ ...form, reported_gross_revenue: v })} /></Field>
                    <Field label="Royalti Owed (Rp) *"><CurrencyInput value={form.royalty_owed ?? ''} onChange={(v) => setForm({ ...form, royalty_owed: v })} /></Field>
                    {isEdit && (
                        <>
                            <Field label="Sudah Dibayar (Rp)"><CurrencyInput value={form.amount_paid ?? ''} onChange={(v) => setForm({ ...form, amount_paid: v })} /></Field>
                            <Field label="Status">
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                    {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </Field>
                        </>
                    )}
                    <Field label="Jatuh Tempo"><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Field>
                    <Field label="Catatan">
                        <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>
                </div>
                <div className="border-t p-3">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose}>Batal</Button>
                        <Button onClick={() => { setFormError(''); save.mutate(); }} disabled={save.isPending}>{save.isPending ? 'Menyimpan…' : (isEdit ? 'Update' : 'Catat')}</Button>
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
