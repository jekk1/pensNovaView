import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlaskConical, Plus, Eye, X, Search, Banknote, ClipboardList, CheckCircle2, Globe } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { CurrencyInput } from '../../components/ui/currency-input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';
import { apiErrorMessage } from '../../lib/apiError';

const ORDER_STATUS = {
    inquiry: { label: 'Pertanyaan Awal', variant: 'warning' },
    quoted: { label: 'Quote Dikirim', variant: 'default' },
    confirmed: { label: 'Disetujui', variant: 'default' },
    in_progress: { label: 'Dikerjakan', variant: 'default' },
    completed: { label: 'Selesai', variant: 'success' },
    cancelled: { label: 'Dibatalkan', variant: 'destructive' },
};

const UNIT_LABEL = {
    per_sample: 'per sampel',
    per_hour: 'per jam',
    per_day: 'per hari',
    per_project: 'per proyek',
};

const fmtIDR = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

export default function LabServices() {
    const qc = useQueryClient();
    const [tab, setTab] = useState('catalog');
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'lab-services', 'stats'],
        queryFn: () => api.get('/api/admin/lab-services-stats').then((r) => r.data),
    });

    return (
        <div>
            <header className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <FlaskConical className="h-6 w-6 text-sky-600" />
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Katalog Jasa Lab</h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                    Jasa lab PENS yang ditawarkan ke publik & industri. Pola: ITS LPPM, UI Sains-Tek, BPPT Sertifikasi —
                    katalog publik di /jasa-lab + admin tracking order.
                </p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
                <StatCard label="Total Jasa" value={stats?.total_services ?? 0} icon={FlaskConical} color="primary" />
                <StatCard label="Aktif" value={stats?.active_services ?? 0} icon={CheckCircle2} color="emerald" />
                <StatCard label="Order Baru" value={stats?.pending_orders ?? 0} icon={ClipboardList} color="amber" />
                <StatCard label="Dikerjakan" value={stats?.in_progress_orders ?? 0} icon={FlaskConical} color="violet" />
                <StatCard label="Revenue" value={fmtIDR(stats?.total_revenue)} icon={Banknote} color="emerald" />
            </div>

            <div className="border-b border-slate-200 mb-4 flex gap-1">
                <button onClick={() => setTab('catalog')} className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${tab === 'catalog' ? 'border-primary-700 text-primary-700' : 'border-transparent text-slate-600'}`}>Katalog Jasa</button>
                <button onClick={() => setTab('orders')} className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${tab === 'orders' ? 'border-primary-700 text-primary-700' : 'border-transparent text-slate-600'}`}>Order Klien ({stats?.pending_orders + stats?.in_progress_orders || 0})</button>
            </div>

            {tab === 'catalog' && (
                <CatalogTab onCreate={() => setCreating(true)} onEdit={setEditing} />
            )}
            {tab === 'orders' && (
                <OrdersTab onSelect={setSelectedOrder} />
            )}

            {(creating || editing) && (
                <ServiceDialog
                    service={editing}
                    onClose={() => { setCreating(false); setEditing(null); }}
                    onSaved={() => {
                        qc.invalidateQueries({ queryKey: ['admin', 'lab-services'] });
                        setCreating(false); setEditing(null);
                    }}
                />
            )}
            {selectedOrder && (
                <OrderDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
}

function CatalogTab({ onCreate, onEdit }) {
    const [filters, setFilters] = useState({ q: '' });
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'lab-services', filters],
        queryFn: () => api.get('/api/admin/lab-services', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    return (
        <>
            <Card className="mb-4"><CardContent className="p-3 flex gap-2 flex-wrap items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Cari nama / lab / kode jasa..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="pl-8" />
                </div>
                <Button onClick={onCreate} className="ml-auto"><Plus className="h-4 w-4 mr-1" /> Jasa Baru</Button>
            </CardContent></Card>

            {isLoading ? <Spinner className="h-8 w-8 mx-auto" /> : (data?.data || []).length === 0 ? (
                <Card><CardContent className="p-8 text-center text-sm text-slate-500">Belum ada jasa lab terdaftar.</CardContent></Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.data.map((s) => (
                        <Card key={s.id} className="hover:shadow-md transition">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="font-bold text-slate-900 line-clamp-2">{s.name}</div>
                                    <div className="flex gap-1 shrink-0">
                                        {s.is_published && <Badge variant="success" className="text-[10px]"><Globe className="h-3 w-3 mr-1" />Public</Badge>}
                                        {! s.is_active && <Badge variant="secondary" className="text-[10px]">Non-Aktif</Badge>}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-2">{s.lab_name}</div>
                                <p className="text-xs text-slate-600 line-clamp-2 mb-3">{s.description}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <div>
                                        <div className="font-bold text-sky-700">{fmtIDR(s.base_price)}</div>
                                        <div className="text-[10px] text-slate-500">{UNIT_LABEL[s.unit]}</div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 text-right">
                                        {s.orders_count > 0 && <div>{s.orders_count} order</div>}
                                        <Button size="sm" variant="ghost" onClick={() => onEdit(s)}><Eye className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}

function OrdersTab({ onSelect }) {
    const [filters, setFilters] = useState({ status: '' });
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'lab-service-orders', filters],
        queryFn: () => api.get('/api/admin/lab-service-orders', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    return (
        <>
            <Card className="mb-4"><CardContent className="p-3">
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border border-slate-200 rounded-md px-3 py-2 text-sm">
                    <option value="">Semua Status</option>
                    {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </CardContent></Card>

            {isLoading ? <Spinner /> : (data?.data || []).length === 0 ? (
                <Card><CardContent className="p-8 text-center text-sm text-slate-500">Belum ada order.</CardContent></Card>
            ) : (
                <Card><CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                            <tr>
                                <th className="px-3 py-2 text-left">Order</th>
                                <th className="px-3 py-2 text-left">Klien</th>
                                <th className="px-3 py-2 text-left">Jasa</th>
                                <th className="px-3 py-2 text-right">Quote</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.data.map((o) => {
                                const status = ORDER_STATUS[o.status];
                                return (
                                    <tr key={o.id} className="hover:bg-slate-50">
                                        <td className="px-3 py-2 text-xs font-mono">{o.order_number}</td>
                                        <td className="px-3 py-2">
                                            <div className="text-xs font-semibold">{o.client_name}</div>
                                            <div className="text-[10px] text-slate-500">{o.client_organization || '—'}</div>
                                        </td>
                                        <td className="px-3 py-2 text-xs">{o.service?.name}</td>
                                        <td className="px-3 py-2 text-right text-xs font-mono">{o.quoted_price ? fmtIDR(o.quoted_price) : '—'}</td>
                                        <td className="px-3 py-2"><Badge variant={status.variant}>{status.label}</Badge></td>
                                        <td className="px-3 py-2"><Button size="sm" variant="ghost" onClick={() => onSelect(o)}><Eye className="h-4 w-4" /></Button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent></Card>
            )}
        </>
    );
}

function ServiceDialog({ service, onClose, onSaved }) {
    const isEdit = !! service?.id;
    const [form, setForm] = useState({
        name: service?.name || '',
        description: service?.description || '',
        methodology: service?.methodology || '',
        lab_name: service?.lab_name || '',
        department: service?.department || '',
        base_price: service?.base_price || 0,
        unit: service?.unit || 'per_sample',
        typical_duration_days: service?.typical_duration_days || '',
        equipment_used: service?.equipment_used?.join('\n') || '',
        certifications: service?.certifications?.join(', ') || '',
        sample_outputs: service?.sample_outputs?.join('\n') || '',
        is_active: service?.is_active ?? true,
        is_published: service?.is_published ?? false,
        notes: service?.notes || '',
    });
    const [formError, setFormError] = useState('');

    const save = useMutation({
        mutationFn: () => {
            const payload = {
                ...form,
                equipment_used: form.equipment_used.split('\n').map((s) => s.trim()).filter(Boolean),
                certifications: form.certifications.split(',').map((s) => s.trim()).filter(Boolean),
                sample_outputs: form.sample_outputs.split('\n').map((s) => s.trim()).filter(Boolean),
            };
            return isEdit
                ? api.patch(`/api/admin/lab-services/${service.slug}`, payload)
                : api.post('/api/admin/lab-services', payload);
        },
        onSuccess: onSaved,
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold">{isEdit ? 'Edit Jasa Lab' : 'Jasa Lab Baru'}</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-3 overflow-y-auto">
                    <Field label="Nama Jasa *"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pengukuran EMC Compatibility" /></Field>
                    <Field label="Deskripsi *">
                        <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>
                    <Field label="Metodologi / Standar">
                        <textarea rows="2" value={form.methodology} onChange={(e) => setForm({ ...form, methodology: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="IEC 61000-4-3, ISO 17025, dll" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Lab Pengampu *"><Input value={form.lab_name} onChange={(e) => setForm({ ...form, lab_name: e.target.value })} placeholder="Lab EMC PENS" /></Field>
                        <Field label="Departemen"><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Teknik Elektro" /></Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Tarif Dasar (Rp) *"><CurrencyInput value={form.base_price ?? ''} onChange={(v) => setForm({ ...form, base_price: v })} /></Field>
                        <Field label="Unit Tarif">
                            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                                {Object.entries(UNIT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label="Estimasi Hari"><Input type="number" value={form.typical_duration_days} onChange={(e) => setForm({ ...form, typical_duration_days: e.target.value })} placeholder="3" /></Field>
                    </div>
                    <Field label="Peralatan (1 per baris)">
                        <textarea rows="3" value={form.equipment_used} onChange={(e) => setForm({ ...form, equipment_used: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm font-mono text-xs" placeholder="Spectrum Analyzer Keysight N9020A&#10;Anechoic Chamber 3m" />
                    </Field>
                    <Field label="Sertifikasi (pisah koma)"><Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="ISO 17025, KAN" /></Field>
                    <Field label="Output / Deliverable (1 per baris)">
                        <textarea rows="2" value={form.sample_outputs} onChange={(e) => setForm({ ...form, sample_outputs: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" placeholder="Sertifikat hasil uji&#10;Laporan teknis 10-20 halaman" />
                    </Field>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                            Aktif (bisa di-order)
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                            Publish ke katalog publik
                        </label>
                    </div>
                </div>
                <div className="border-t p-3">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose}>Batal</Button>
                        <Button onClick={() => { setFormError(''); save.mutate(); }} disabled={save.isPending || ! form.name || ! form.lab_name}>
                            {save.isPending ? 'Menyimpan…' : (isEdit ? 'Update' : 'Buat Jasa')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderDialog({ order, onClose }) {
    const qc = useQueryClient();
    const [quotedPrice, setQuotedPrice] = useState(order.quoted_price || '');
    const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
    const [formError, setFormError] = useState('');

    const update = useMutation({
        mutationFn: (payload) => api.patch(`/api/admin/lab-service-orders/${order.id}`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'lab-service-orders'] });
            qc.invalidateQueries({ queryKey: ['admin', 'lab-services', 'stats'] });
            onClose();
        },
        onError: (e) => setFormError(apiErrorMessage(e)),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold">Order {order.order_number}</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-5 space-y-3 overflow-y-auto text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <div><div className="text-xs text-slate-500">Klien</div><div className="font-semibold">{order.client_name}</div></div>
                        <div><div className="text-xs text-slate-500">Email</div><a href={`mailto:${order.client_email}`} className="text-primary-700 hover:underline">{order.client_email}</a></div>
                    </div>
                    {order.client_organization && <div><div className="text-xs text-slate-500">Organisasi</div><div>{order.client_organization}</div></div>}
                    <div className="bg-slate-50 ring-1 ring-slate-200 rounded p-3">
                        <div className="text-xs font-bold text-slate-700 mb-1">Persyaratan</div>
                        <p className="text-sm whitespace-pre-wrap">{order.requirements}</p>
                    </div>
                    <Field label="Quote (Rp)">
                        <CurrencyInput value={quotedPrice ?? ''} onChange={(v) => setQuotedPrice(v)} />
                    </Field>
                    <Field label="Catatan Internal">
                        <textarea rows="2" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </Field>
                </div>
                <div className="border-t p-3">
                    {formError && <div className="mb-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md px-3 py-2">{formError}</div>}
                    <div className="flex justify-end gap-2 flex-wrap">
                        {order.status === 'inquiry' && (
                            <Button onClick={() => { setFormError(''); update.mutate({ status: 'quoted', quoted_price: quotedPrice, admin_notes: adminNotes }); }} disabled={! quotedPrice}>Kirim Quote</Button>
                        )}
                        {order.status === 'quoted' && (
                            <Button onClick={() => { setFormError(''); update.mutate({ status: 'confirmed', admin_notes: adminNotes }); }}>Tandai Disetujui</Button>
                        )}
                        {order.status === 'confirmed' && (
                            <Button onClick={() => { setFormError(''); update.mutate({ status: 'in_progress', admin_notes: adminNotes }); }}>Mulai Kerjakan</Button>
                        )}
                        {order.status === 'in_progress' && (
                            <Button onClick={() => { setFormError(''); update.mutate({ status: 'completed', admin_notes: adminNotes }); }}>Selesai</Button>
                        )}
                        <Button variant="ghost" onClick={onClose}>Tutup</Button>
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
