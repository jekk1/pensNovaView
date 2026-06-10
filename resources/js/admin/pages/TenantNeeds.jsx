import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, UserPlus, Eye, FileText } from 'lucide-react';
import api from '../../lib/api';
import { apiErrorMessage } from '../../lib/apiError';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import Spinner from '../../components/Spinner';

const STATUS_BADGE = {
    draft: { label: 'Draft', variant: 'secondary' },
    submitted: { label: 'Submitted', variant: 'warning' },
    assigned: { label: 'Assigned', variant: 'default' },
    in_progress: { label: 'In Progress', variant: 'default' },
    completed: { label: 'Completed', variant: 'success' },
};

export default function TenantNeeds() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '', q: '', page: 1 });
    const [editing, setEditing] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'tenant-needs', filters],
        queryFn: () => api.get('/api/admin/tenant-needs', { params: { ...filters, per_page: 25 } }).then((r) => r.data),
    });

    const { data: standardNeeds } = useQuery({
        queryKey: ['admin', 'tenant-needs-standard'],
        queryFn: () => api.get('/api/admin/tenant-needs-standard').then((r) => r.data.data),
    });

    const rows = data?.data ?? [];
    const needsMap = (standardNeeds || []).reduce((acc, n) => ({ ...acc, [n.key]: n.label }), {});

    return (
        <div>
            <header className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="h-6 w-6 text-primary-700" />
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                        Identifikasi Kebutuhan Tenant
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                    Form identifikasi kebutuhan tenant — 8 area pendampingan standar plus opsi "Lainnya". Tugaskan mentor sesuai kebutuhan & prioritas.
                </p>
            </header>

            <Card className="mb-4">
                <CardContent className="p-3 flex flex-wrap gap-2">
                    <Input
                        placeholder="Cari nama usaha atau tenant…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Status</option>
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted (menunggu fasilitator)</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner className="h-6 w-6" /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <h3 className="font-bold text-sm">Belum ada form kebutuhan terisi</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Tenant akan mengisi form Identifikasi Kebutuhan saat onboarding inkubasi.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Tenant / Usaha</th>
                                <th className="px-3 py-2 text-left">Produk</th>
                                <th className="px-3 py-2 text-left">Kebutuhan</th>
                                <th className="px-3 py-2 text-left">Fasilitator</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = STATUS_BADGE[r.status] || STATUS_BADGE.draft;
                                const sorted = [...(r.needs || [])].sort((a, b) => (a.priority || 99) - (b.priority || 99));
                                return (
                                    <tr key={r.id} className="hover:bg-amber-50/40">
                                        <td className="px-3 py-2">
                                            <div className="font-semibold text-slate-900">{r.tenant?.name || '—'}</div>
                                            <div className="text-[10px] text-slate-500">{r.business_name}</div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 max-w-xs truncate">{r.product_description}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex flex-wrap gap-1">
                                                {sorted.slice(0, 3).map((n, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 font-semibold">
                                                        {n.priority && `${n.priority}. `}{needsMap[n.key] || n.key}
                                                    </span>
                                                ))}
                                                {sorted.length > 3 && (
                                                    <span className="text-[10px] text-slate-500">+{sorted.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-slate-700">{r.facilitator?.name || <span className="text-slate-400">—</span>}</td>
                                        <td className="px-3 py-2"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-3 py-2 text-right">
                                            <button
                                                onClick={() => setEditing(r.id)}
                                                className="inline-flex items-center gap-1 text-primary-700 hover:underline font-semibold"
                                            >
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

            {editing && <DetailDialog id={editing} needsMap={needsMap} onClose={() => setEditing(null)} />}
        </div>
    );
}

function DetailDialog({ id, needsMap, onClose }) {
    const qc = useQueryClient();
    const { data } = useQuery({
        queryKey: ['admin', 'tenant-needs', id],
        queryFn: () => api.get(`/api/admin/tenant-needs/${id}`).then((r) => r.data.data),
    });

    const { data: mentors } = useQuery({
        queryKey: ['admin', 'mentors-simple'],
        queryFn: () => api.get('/api/admin/mentors', { params: { per_page: 200 } }).then((r) => r.data.data),
    });

    const [facilitatorId, setFacilitatorId] = useState('');
    const [formError, setFormError] = useState('');

    const assignMutation = useMutation({
        mutationFn: () => api.post(`/api/admin/tenant-needs/${id}/assign-facilitator`, { facilitator_id: facilitatorId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'tenant-needs'] });
            qc.invalidateQueries({ queryKey: ['admin', 'tenant-needs', id] });
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    if (!data) return null;
    const sorted = [...(data.needs || [])].sort((a, b) => (a.priority || 99) - (b.priority || 99));

    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight">Form Kebutuhan — {data.tenant?.name}</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <Info label="Nama Usaha" value={data.business_name} />
                        <Info label="Diisi oleh" value={data.filled_by_name || '—'} />
                        <Info label="Tanggal Isi" value={data.filled_at ? new Date(data.filled_at).toLocaleDateString('id-ID') : '—'} />
                        <Info label="Status" value={STATUS_BADGE[data.status]?.label || data.status} />
                    </div>

                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Produk yang Dihasilkan</div>
                        <p className="text-sm bg-slate-50 rounded p-2.5">{data.product_description}</p>
                    </div>

                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Kebutuhan Pendampingan (urutan prioritas)</div>
                        <ol className="space-y-1.5 list-decimal list-inside text-sm">
                            {sorted.map((n, i) => (
                                <li key={i} className="bg-amber-50/50 rounded p-2 border-l-2 border-amber-400">
                                    <span className="font-semibold">{needsMap[n.key] || n.key}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {data.other_need && (
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Kebutuhan Lainnya</div>
                            <p className="text-sm bg-slate-50 rounded p-2.5">{data.other_need}</p>
                        </div>
                    )}

                    <div className="border-t border-slate-200 pt-4">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Fasilitator / Pendamping</div>
                        {data.facilitator ? (
                            <div className="bg-emerald-50 rounded p-3 text-sm">
                                <div className="font-semibold text-emerald-900">{data.facilitator.name}</div>
                                <div className="text-xs text-emerald-700">Ditugaskan: {data.facilitator_assigned_at ? new Date(data.facilitator_assigned_at).toLocaleDateString('id-ID') : '—'}</div>
                            </div>
                        ) : (
                            <div>
                                {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                                <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold">Pilih Mentor:</label>
                                    <select
                                        value={facilitatorId}
                                        onChange={(e) => setFacilitatorId(e.target.value)}
                                        className="w-full h-9 mt-1 rounded-md border border-slate-300 px-2 text-sm"
                                    >
                                        <option value="">— Pilih mentor —</option>
                                        {(mentors || []).map((m) => (
                                            <option key={m.id} value={m.user_id || m.user?.id}>
                                                {m.user?.name || m.name} — {m.expertise || 'general'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button onClick={() => { setFormError(''); assignMutation.mutate(); }} disabled={!facilitatorId || assignMutation.isPending}>
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    {assignMutation.isPending ? 'Menugaskan…' : 'Tugaskan'}
                                </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="bg-slate-50 rounded p-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
            <div className="text-xs font-semibold mt-0.5">{value || '—'}</div>
        </div>
    );
}
