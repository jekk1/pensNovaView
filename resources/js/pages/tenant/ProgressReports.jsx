import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, X } from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import Skeleton from '../../components/Skeleton';

export default function ProgressReports() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['tenant', 'progress-reports'],
        queryFn: () => api.get('/api/tenant/progress-reports').then((r) => r.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/api/tenant/progress-reports/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant', 'progress-reports'] }),
    });

    return (
        <>
            <header className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Laporan Bulanan</h1>
                    <p className="text-sm text-slate-600 mt-1">Catat progress startup Anda setiap bulan.</p>
                </div>
                <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">
                    + Laporan Baru
                </button>
            </header>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton.Card key={i} />)}
                </div>
            ) : data.data.length === 0 ? (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-12 text-center">
                    <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-bold text-base mb-1">Belum Ada Laporan</h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">Catat progress bulanan startup Anda untuk monitoring oleh tim UPA. Laporan pertama akan menjadi baseline tracking.</p>
                    <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1">
                        + Buat Laporan Pertama
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.data.map((r) => (
                        <article key={r.id} className="bg-white rounded-2xl ring-1 ring-slate-200 p-5">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <h3 className="font-bold text-lg">{r.period_label}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${r.is_submitted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {r.is_submitted ? 'Submitted' : 'Draft'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                {r.revenue !== null && <Field label="Revenue" value={`Rp ${Number(r.revenue).toLocaleString('id-ID')}`} />}
                                <Field label="Tim" value={r.team_size || '—'} />
                                <Field label="Pengguna" value={r.users_count || '—'} />
                                <Field label="Funding" value={r.funding_raised ? `Rp ${Number(r.funding_raised).toLocaleString('id-ID')}` : '—'} />
                            </div>
                            {r.narrative && <p className="text-sm text-slate-700 line-clamp-2 mb-3">{r.narrative}</p>}
                            <div className="flex gap-2">
                                <button onClick={() => { setEditing(r); setShowForm(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium">Edit</button>
                                {!r.is_submitted && (
                                    <button onClick={() => confirm('Hapus laporan ini?') && deleteMutation.mutate(r.id)} className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium">Hapus</button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {showForm && <ReportForm initial={editing} onClose={() => setShowForm(false)} />}
        </>
    );
}

function ReportForm({ initial, onClose }) {
    const qc = useQueryClient();
    const isEdit = !!initial;
    const [errors, setErrors] = useState({});

    const mutation = useMutation({
        mutationFn: (payload) =>
            isEdit
                ? api.patch(`/api/tenant/progress-reports/${initial.id}`, payload)
                : api.post('/api/tenant/progress-reports', payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tenant', 'progress-reports'] });
            qc.invalidateQueries({ queryKey: ['tenant', 'dashboard'] });
            onClose();
        },
        onError: (err) => setErrors(err.response?.data?.errors || {}),
    });

    function submit(e) {
        e.preventDefault();
        setErrors({});
        const fd = new FormData(e.target);
        const payload = Object.fromEntries(fd.entries());
        ['period_year', 'period_month', 'users_count', 'team_size'].forEach((k) => {
            if (payload[k] !== '') payload[k] = parseInt(payload[k], 10);
            else delete payload[k];
        });
        ['revenue', 'funding_raised'].forEach((k) => {
            if (payload[k] !== '') payload[k] = parseFloat(payload[k]);
            else delete payload[k];
        });
        payload.is_submitted = !!fd.get('is_submitted');
        mutation.mutate(payload);
    }

    const now = new Date();
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
                    <h3 className="text-lg font-bold">{isEdit ? 'Edit' : 'Buat'} Laporan</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={submit} className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input name="period_year" type="number" label="Tahun" required errors={errors} defaultValue={initial?.period_year ?? now.getFullYear()} />
                        <Input name="period_month" type="number" label="Bulan (1-12)" required errors={errors} defaultValue={initial?.period_month ?? now.getMonth() + 1} />
                        <Input name="revenue" type="number" step="0.01" label="Revenue (Rp)" errors={errors} defaultValue={initial?.revenue ?? ''} />
                        <Input name="users_count" type="number" label="Jumlah User" errors={errors} defaultValue={initial?.users_count ?? ''} />
                        <Input name="team_size" type="number" label="Ukuran Tim" errors={errors} defaultValue={initial?.team_size ?? ''} />
                        <Input name="funding_raised" type="number" step="0.01" label="Funding (Rp)" errors={errors} defaultValue={initial?.funding_raised ?? ''} />
                    </div>
                    <Textarea name="narrative" label="Narasi Bulan Ini" rows={3} errors={errors} defaultValue={initial?.narrative ?? ''} />
                    <Textarea name="challenges" label="Tantangan" rows={2} errors={errors} defaultValue={initial?.challenges ?? ''} />
                    <Textarea name="next_steps" label="Rencana Bulan Depan" rows={2} errors={errors} defaultValue={initial?.next_steps ?? ''} />
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="is_submitted" defaultChecked={initial?.is_submitted} />
                        Submit final (tidak bisa di-edit setelah ini)
                    </label>
                    <button type="submit" disabled={mutation.isPending} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60">
                        {mutation.isPending && <Spinner className="h-4 w-4" />}
                        Simpan
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({ label, value }) { return <div><dt className="text-xs text-slate-500 uppercase">{label}</dt><dd className="font-medium">{value}</dd></div>; }
function Input({ name, label, errors, ...props }) {
    return <div><label className="block text-sm font-medium mb-1">{label}</label><input name={name} {...props} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />{errors[name] && <p className="text-xs text-rose-600 mt-1">{errors[name][0]}</p>}</div>;
}
function Textarea({ name, label, errors, ...props }) {
    return <div><label className="block text-sm font-medium mb-1">{label}</label><textarea name={name} {...props} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />{errors[name] && <p className="text-xs text-rose-600 mt-1">{errors[name][0]}</p>}</div>;
}
