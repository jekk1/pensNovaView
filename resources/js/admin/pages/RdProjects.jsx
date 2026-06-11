import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cog, Plus, Eye, X, Search, Briefcase, Calendar, Banknote, FlaskConical, GraduationCap } from 'lucide-react';
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
    proposed: { label: 'Proposal Masuk', variant: 'warning' },
    reviewing: { label: 'Sedang Review', variant: 'default' },
    approved: { label: 'Disetujui', variant: 'default' },
    active: { label: 'Berjalan', variant: 'success' },
    completed: { label: 'Selesai', variant: 'success' },
    cancelled: { label: 'Dibatalkan', variant: 'destructive' },
};

const IP_LABEL = {
    shared: 'Hak Bersama',
    client_owned: 'Hak Klien',
    upa_owned: 'Hak UPA/PENS',
    licensed_to_client: 'Lisensi ke Klien',
};

const fmtIDR = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

export default function RdProjects() {
    const qc = useQueryClient();
    const [filters, setFilters] = useState({ status: '', q: '' });
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'rd-projects', 'stats'],
        queryFn: () => api.get('/api/admin/rd-projects-stats').then((r) => r.data),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'rd-projects', filters],
        queryFn: () => api.get('/api/admin/rd-projects', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    return (
        <div>
            <header className="mb-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Cog className="h-6 w-6 text-violet-600" />
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Proyek R&amp;D Industri</h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                        Contract research: mitra industri ajukan kebutuhan riset, UPA assign Principal Investigator dari dosen PENS.
                        Pola: Stanford SRP / ITS Sains-Tek Park / Telkom U Innovation Hub.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" /> Proyek Baru</Button>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <StatCard label="Total Proyek" value={stats?.total ?? 0} icon={Cog} color="primary" />
                <StatCard label="Proposal Masuk" value={stats?.proposed ?? 0} icon={Briefcase} color="amber" />
                <StatCard label="Berjalan" value={stats?.active ?? 0} icon={FlaskConical} color="violet" />
                <StatCard label="Budget Aktif" value={fmtIDR(stats?.active_budget)} icon={Banknote} color="emerald" />
            </div>

            <Card className="mb-4">
                <CardContent className="p-3 flex gap-2 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Cari judul / PI / klien..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="pl-8" />
                    </div>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border border-slate-200 rounded-md px-3 py-2 text-sm">
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <Spinner className="h-8 w-8 mx-auto" />
            ) : (data?.data || []).length === 0 ? (
                <Card><CardContent className="p-8 text-center text-sm text-slate-500">
                    <Cog className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                    <p>Belum ada proyek R&amp;D industri.</p>
                </CardContent></Card>
            ) : (
                <Card><CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                            <tr>
                                <th className="px-3 py-2 text-left">Proyek</th>
                                <th className="px-3 py-2 text-left">Klien / PI</th>
                                <th className="px-3 py-2 text-right">Budget</th>
                                <th className="px-3 py-2 text-left">Periode</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.data.map((p) => {
                                const status = STATUS_BADGE[p.status];
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-3 py-2">
                                            <div className="font-semibold text-slate-900 line-clamp-1">{p.title}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{p.project_code}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-xs text-slate-800">{p.partner_company?.name || p.client_name || '—'}</div>
                                            <div className="text-[11px] text-violet-700">PI: {p.pi_name || '—'}</div>
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-mono">{fmtIDR(p.budget)}</td>
                                        <td className="px-3 py-2 text-xs">
                                            {p.start_date ? new Date(p.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—'}
                                            {' → '}
                                            {p.end_date ? new Date(p.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-3 py-2"><Badge variant={status.variant}>{status.label}</Badge></td>
                                        <td className="px-3 py-2"><Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Eye className="h-4 w-4" /></Button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent></Card>
            )}

            {(creating || editing) && (
                <ProjectDialog
                    project={editing}
                    onClose={() => { setCreating(false); setEditing(null); }}
                    onSaved={() => {
                        qc.invalidateQueries({ queryKey: ['admin', 'rd-projects'] });
                        qc.invalidateQueries({ queryKey: ['admin', 'rd-projects', 'stats'] });
                        setCreating(false); setEditing(null);
                    }}
                />
            )}
        </div>
    );
}

function ProjectDialog({ project, onClose, onSaved }) {
    const isEdit = !! project?.id;
    const [form, setForm] = useState({
        title: project?.title || '',
        description: project?.description || '',
        objectives: project?.objectives || '',
        deliverables: project?.deliverables || '',
        partner_company_id: project?.partner_company_id || '',
        client_name: project?.client_name || '',
        client_email: project?.client_email || '',
        client_phone: project?.client_phone || '',
        pi_name: project?.pi_name || '',
        pi_email: project?.pi_email || '',
        pi_department: project?.pi_department || '',
        budget: project?.budget || 0,
        overhead_rate: project?.overhead_rate || 15,
        start_date: project?.start_date?.split('T')[0] || '',
        end_date: project?.end_date?.split('T')[0] || '',
        duration_months: project?.duration_months || '',
        ip_arrangement: project?.ip_arrangement || 'shared',
        field_of_research: project?.field_of_research || '',
        trl_target: project?.trl_target || '',
        status: project?.status || 'proposed',
        notes: project?.notes || '',
    });
    const [formError, setFormError] = useState('');

    const { data: partners } = useQuery({
        queryKey: ['admin', 'partners-list'],
        queryFn: () => api.get('/api/admin/partner-companies', { params: { per_page: 200 } }).then((r) => r.data?.data ?? []),
    });

    const save = useMutation({
        mutationFn: () => isEdit
            ? api.patch(`/api/admin/rd-projects/${project.id}`, form)
            : api.post('/api/admin/rd-projects', form),
        onSuccess: onSaved,
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">{isEdit ? 'Edit Proyek R&D' : 'Proyek R&D Baru'}</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-3 overflow-y-auto">
                    <Field label="Judul Proyek *"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                    <Field label="Deskripsi *">
                        <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Objectives">
                            <textarea rows="2" value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                        </Field>
                        <Field label="Deliverables">
                            <textarea rows="2" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                        </Field>
                    </div>

                    <div className="bg-sky-50 ring-1 ring-sky-200 rounded-lg p-3">
                        <div className="text-xs font-bold text-sky-900 mb-2 flex items-center gap-1"><Briefcase className="h-3 w-3" /> Klien Industri</div>
                        <Field label="Mitra Terdaftar (opsional)">
                            <select value={form.partner_company_id} onChange={(e) => setForm({ ...form, partner_company_id: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                <option value="">— Atau isi manual di bawah —</option>
                                {(partners || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </Field>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            <Field label="Nama Klien"><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></Field>
                            <Field label="Email"><Input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} /></Field>
                            <Field label="Telepon"><Input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} /></Field>
                        </div>
                    </div>

                    <div className="bg-violet-50 ring-1 ring-violet-200 rounded-lg p-3">
                        <div className="text-xs font-bold text-violet-900 mb-2 flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Principal Investigator (Dosen PENS)</div>
                        <div className="grid grid-cols-3 gap-3">
                            <Field label="Nama PI"><Input value={form.pi_name} onChange={(e) => setForm({ ...form, pi_name: e.target.value })} placeholder="Dr. Eng. ..." /></Field>
                            <Field label="Email PI"><Input type="email" value={form.pi_email} onChange={(e) => setForm({ ...form, pi_email: e.target.value })} /></Field>
                            <Field label="Departemen"><Input value={form.pi_department} onChange={(e) => setForm({ ...form, pi_department: e.target.value })} placeholder="Teknik Elektro" /></Field>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Budget (Rp)"><CurrencyInput value={form.budget ?? ''} onChange={(v) => setForm({ ...form, budget: v })} /></Field>
                        <Field label="Overhead UPA (%)"><Input type="number" step="0.1" value={form.overhead_rate} onChange={(e) => setForm({ ...form, overhead_rate: e.target.value })} /></Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Mulai"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
                        <Field label="Berakhir"><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>
                        <Field label="Durasi (bulan)"><Input type="number" value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: e.target.value })} /></Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="IP Arrangement">
                            <select value={form.ip_arrangement} onChange={(e) => setForm({ ...form, ip_arrangement: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                {Object.entries(IP_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label="Bidang Riset"><Input value={form.field_of_research} onChange={(e) => setForm({ ...form, field_of_research: e.target.value })} placeholder="AI/ML, IoT, dll" /></Field>
                        <Field label="Target TRL"><Input value={form.trl_target} onChange={(e) => setForm({ ...form, trl_target: e.target.value })} placeholder="6 / 7 / 8" /></Field>
                    </div>
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
                        <Button onClick={() => { setFormError(''); save.mutate(); }} disabled={save.isPending || ! form.title || ! form.description}>
                            {save.isPending ? 'Menyimpan…' : (isEdit ? 'Update' : 'Buat Proyek')}
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
