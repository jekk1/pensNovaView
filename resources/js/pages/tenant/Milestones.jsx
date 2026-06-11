import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Target, Calendar, CheckCircle2, Clock, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import api, { formatApiError } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import Spinner from '../../components/Spinner';

const STATUS = {
    planned: { label: 'Direncanakan', color: 'secondary', icon: Clock },
    in_progress: { label: 'Berjalan', color: 'warning', icon: Target },
    achieved: { label: 'Tercapai', color: 'success', icon: CheckCircle2 },
    missed: { label: 'Terlewat', color: 'destructive', icon: AlertTriangle },
};

export default function Milestones() {
    const toast = useToast();
    const qc = useQueryClient();
    const [dialog, setDialog] = useState({ open: false, editing: null });

    const { data: list, isLoading } = useQuery({
        queryKey: ['tenant', 'milestones'],
        queryFn: () => api.get('/api/tenant/milestones').then((r) => r.data),
    });

    const milestones = list?.data || list || [];

    const save = useMutation({
        mutationFn: (data) =>
            data.id
                ? api.put(`/api/tenant/milestones/${data.id}`, data)
                : api.post('/api/tenant/milestones', data),
        onSuccess: () => {
            toast.success(dialog.editing ? 'Milestone diperbarui' : 'Milestone dibuat');
            qc.invalidateQueries({ queryKey: ['tenant', 'milestones'] });
            qc.invalidateQueries({ queryKey: ['tenant', 'dashboard'] });
            setDialog({ open: false, editing: null });
        },
        onError: (err) => toast.error(formatApiError(err)),
    });

    const remove = useMutation({
        mutationFn: (id) => api.delete(`/api/tenant/milestones/${id}`),
        onSuccess: () => {
            toast.success('Milestone dihapus');
            qc.invalidateQueries({ queryKey: ['tenant', 'milestones'] });
        },
    });

    return (
        <div>
            <header className="mb-5 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="h-7 w-7 text-emerald-700" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Milestones
                        </h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        Target & KPI startup Anda untuk batch berjalan.
                    </p>
                </div>
                <Button onClick={() => setDialog({ open: true, editing: null })}>
                    <Plus className="h-4 w-4" />
                    Tambah Milestone
                </Button>
            </header>

            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <Spinner className="h-8 w-8 text-emerald-600" />
                </div>
            ) : milestones.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Target className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-bold text-base">Belum ada milestone</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                            Mulai dengan menentukan target measurable untuk batch ini.
                        </p>
                        <Button onClick={() => setDialog({ open: true, editing: null })}>
                            <Plus className="h-4 w-4" />
                            Buat Milestone Pertama
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {milestones.map((m) => (
                        <MilestoneCard
                            key={m.id}
                            milestone={m}
                            onEdit={() => setDialog({ open: true, editing: m })}
                            onDelete={() => {
                                if (confirm(`Hapus milestone "${m.title}"?`)) remove.mutate(m.id);
                            }}
                        />
                    ))}
                </div>
            )}

            <MilestoneDialog
                open={dialog.open}
                editing={dialog.editing}
                onClose={() => setDialog({ open: false, editing: null })}
                onSave={(data) => save.mutate(data)}
                saving={save.isPending}
            />
        </div>
    );
}

function MilestoneCard({ milestone, onEdit, onDelete }) {
    const s = STATUS[milestone.status] || STATUS.planned;
    const Icon = s.icon;
    const overdue =
        milestone.status === 'planned' &&
        milestone.due_date &&
        new Date(milestone.due_date) < new Date();
    return (
        <Card className={overdue ? 'ring-1 ring-rose-200' : ''}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-slate-900 leading-tight">
                                {milestone.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant={s.color}>{s.label}</Badge>
                                {overdue && <Badge variant="destructive">Overdue</Badge>}
                            </div>
                        </div>
                        {milestone.description && (
                            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                                {milestone.description}
                            </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            {milestone.due_date && (
                                <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Due: {new Date(milestone.due_date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            )}
                            {milestone.kpi_name && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                    <Target className="h-4 w-4" /> {milestone.kpi_name}: {milestone.kpi_actual || 0} / {milestone.kpi_target}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Button size="icon" variant="ghost" onClick={onEdit} title="Edit">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={onDelete}
                            className="text-rose-600 hover:bg-rose-50"
                            title="Hapus"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MilestoneDialog({ open, editing, onClose, onSave, saving }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        due_date: '',
        status: 'planned',
        kpi_name: '',
        kpi_target: '',
        kpi_actual: '',
        weight: 1,
    });

    // Sync ketika editing berubah
    useState(() => {
        if (editing) {
            setForm({
                title: editing.title || '',
                description: editing.description || '',
                due_date: editing.due_date || '',
                status: editing.status || 'planned',
                kpi_name: editing.kpi_name || '',
                kpi_target: editing.kpi_target || '',
                kpi_actual: editing.kpi_actual || '',
                weight: editing.weight || 1,
            });
        }
    });

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit Milestone' : 'Tambah Milestone'}</DialogTitle>
                    <DialogDescription>
                        Tentukan target measurable dengan KPI dan tanggal target.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave({ ...form, id: editing?.id });
                    }}
                    className="space-y-3"
                >
                    <div>
                        <Label htmlFor="title">Judul *</Label>
                        <Input
                            id="title"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <textarea
                            id="description"
                            rows={3}
                            value={form.description}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, description: e.target.value }))
                            }
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="due_date">Target Date *</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={form.due_date}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, due_date: e.target.value }))
                                }
                                required
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={form.status}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, status: e.target.value }))
                                }
                                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                            >
                                {Object.entries(STATUS).map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <Label htmlFor="kpi_name">KPI (opsional)</Label>
                            <Input
                                id="kpi_name"
                                placeholder="Active Users, Revenue, dst"
                                value={form.kpi_name}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, kpi_name: e.target.value }))
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="kpi_target">Target</Label>
                            <Input
                                id="kpi_target"
                                value={form.kpi_target}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, kpi_target: e.target.value }))
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="kpi_actual">Actual</Label>
                            <Input
                                id="kpi_actual"
                                value={form.kpi_actual}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, kpi_actual: e.target.value }))
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Spinner className="h-4 w-4" />}
                            Simpan
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
