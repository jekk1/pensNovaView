import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Save, Send, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import Spinner from '../../components/Spinner';

const STATUS_LABEL = {
    draft: { label: 'Draft', variant: 'secondary' },
    submitted: { label: 'Menunggu Penugasan Mentor', variant: 'warning' },
    assigned: { label: 'Mentor Sudah Ditugaskan', variant: 'success' },
    in_progress: { label: 'Pendampingan Berlangsung', variant: 'default' },
    completed: { label: 'Selesai', variant: 'success' },
};

export default function TenantNeeds() {
    const qc = useQueryClient();
    const { data: needsData, isLoading } = useQuery({
        queryKey: ['tenant', 'tenant-needs'],
        queryFn: () => api.get('/api/tenant/tenant-needs').then((r) => r.data),
    });
    const { data: standardNeeds } = useQuery({
        queryKey: ['tenant', 'tenant-needs-standard'],
        queryFn: () => api.get('/api/tenant/tenant-needs-standard').then((r) => r.data.data),
    });

    const existing = needsData?.data?.[0];
    const isEditable = !existing || existing.status === 'draft';

    const [form, setForm] = useState({
        business_name: '',
        product_description: '',
        selected: [],
        priorities: {},
        other_need: '',
    });

    useEffect(() => {
        if (existing) {
            const sel = (existing.needs || []).map((n) => n.key);
            const pri = (existing.needs || []).reduce((acc, n, idx) => ({
                ...acc,
                [n.key]: n.priority || idx + 1,
            }), {});
            setForm({
                business_name: existing.business_name || '',
                product_description: existing.product_description || '',
                selected: sel,
                priorities: pri,
                other_need: existing.other_need || '',
            });
        }
    }, [existing]);

    const toggleNeed = (key) => {
        setForm((f) => {
            const isSelected = f.selected.includes(key);
            if (isSelected) {
                const newSel = f.selected.filter((k) => k !== key);
                const newPri = { ...f.priorities };
                delete newPri[key];
                return { ...f, selected: newSel, priorities: newPri };
            }
            return {
                ...f,
                selected: [...f.selected, key],
                priorities: { ...f.priorities, [key]: f.selected.length + 1 },
            };
        });
    };

    const setPriority = (key, value) => {
        setForm((f) => ({ ...f, priorities: { ...f.priorities, [key]: Number(value) || 1 } }));
    };

    const buildPayload = (submit) => ({
        business_name: form.business_name,
        product_description: form.product_description,
        needs: form.selected.map((key) => ({ key, priority: form.priorities[key] || null })),
        other_need: form.other_need || null,
        submit,
    });

    const saveMutation = useMutation({
        mutationFn: (submit) => {
            const payload = buildPayload(submit);
            if (existing && existing.status === 'draft') {
                return api.patch(`/api/tenant/tenant-needs/${existing.id}`, payload);
            }
            return api.post('/api/tenant/tenant-needs', payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tenant', 'tenant-needs'] });
        },
    });

    if (isLoading) return <div className="py-12 flex justify-center"><Spinner className="h-8 w-8 text-emerald-600" /></div>;

    return (
        <div>
            <header className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="h-7 w-7 text-emerald-700" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Identifikasi Kebutuhan</h1>
                </div>
                <p className="text-sm text-slate-600">
                    Form Identifikasi Kebutuhan Pendampingan. Tim Inkubator akan menugaskan mentor sesuai kebutuhan & prioritas Anda.
                </p>
            </header>

            {existing && existing.status !== 'draft' && (
                <Card className="mb-4 border-emerald-300">
                    <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="font-bold text-sm">Form Anda sudah submitted</div>
                            <div className="text-xs text-slate-600 mt-0.5">
                                {existing.facilitator ? (
                                    <>Fasilitator: <strong>{existing.facilitator.name}</strong></>
                                ) : (
                                    'Tim Inkubator akan menugaskan mentor untuk Anda.'
                                )}
                            </div>
                        </div>
                        <Badge variant={STATUS_LABEL[existing.status]?.variant}>{STATUS_LABEL[existing.status]?.label}</Badge>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-5 space-y-4">
                    <Field label="Nama Usaha *">
                        <Input
                            value={form.business_name}
                            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                            placeholder="Nama bisnis / UMKM"
                            disabled={!isEditable}
                            required
                        />
                    </Field>

                    <Field label="Produk yang Dihasilkan *">
                        <textarea
                            rows="2"
                            value={form.product_description}
                            onChange={(e) => setForm({ ...form, product_description: e.target.value })}
                            disabled={!isEditable}
                            placeholder="Deskripsi singkat produk/jasa Anda"
                            className="w-full rounded-md border border-slate-300 p-2 text-sm disabled:bg-slate-50"
                        />
                    </Field>

                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-2">
                            Kebutuhan Pendampingan * <span className="text-slate-500 font-normal">(pilih ≥ 1, beri prioritas 1 = paling penting)</span>
                        </label>
                        <div className="space-y-2">
                            {(standardNeeds || []).map((n) => {
                                const isSelected = form.selected.includes(n.key);
                                return (
                                    <div
                                        key={n.key}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg border ${isSelected ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'} ${!isEditable && 'opacity-60'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleNeed(n.key)}
                                            disabled={!isEditable}
                                            className="rounded border-slate-300"
                                        />
                                        <span className="flex-1 text-sm font-medium">{n.label}</span>
                                        {isSelected && (
                                            <input
                                                type="number"
                                                min="1"
                                                max={form.selected.length}
                                                value={form.priorities[n.key] || ''}
                                                onChange={(e) => setPriority(n.key, e.target.value)}
                                                disabled={!isEditable}
                                                placeholder="Pri"
                                                className="w-14 h-7 px-1 rounded border border-slate-300 text-xs text-center"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Field label="Kebutuhan Lainnya">
                        <textarea
                            rows="2"
                            value={form.other_need}
                            onChange={(e) => setForm({ ...form, other_need: e.target.value })}
                            disabled={!isEditable}
                            placeholder="Sebutkan kebutuhan lain yang belum tercakup di atas (opsional)"
                            className="w-full rounded-md border border-slate-300 p-2 text-sm disabled:bg-slate-50"
                        />
                    </Field>

                    {isEditable && (
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                            <Button variant="outline" onClick={() => saveMutation.mutate(false)} disabled={saveMutation.isPending}>
                                <Save className="h-4 w-4 mr-1" /> Simpan Draft
                            </Button>
                            <Button
                                onClick={() => saveMutation.mutate(true)}
                                disabled={!form.business_name || !form.product_description || form.selected.length === 0 || saveMutation.isPending}
                            >
                                <Send className="h-4 w-4 mr-1" />
                                {saveMutation.isPending ? 'Mengirim…' : 'Submit ke Tim Inkubator'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{label}</label>
            {children}
        </div>
    );
}
