import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Video, MapPin, User, Pencil, Trash2 } from 'lucide-react';
import api, { formatApiError } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import Spinner from '../../components/Spinner';

const STATUS_COLOR = {
    scheduled: 'default',
    completed: 'success',
    cancelled: 'destructive',
    rescheduled: 'warning',
};

export default function MentorSessions() {
    const toast = useToast();
    const qc = useQueryClient();
    const [dialog, setDialog] = useState({ open: false, editing: null });

    const { data, isLoading } = useQuery({
        queryKey: ['mentor', 'mentoring-sessions'],
        queryFn: () => api.get('/api/mentor/mentoring-sessions').then((r) => r.data),
    });

    const { data: myTenants } = useQuery({
        queryKey: ['mentor', 'tenants'],
        queryFn: () => api.get('/api/mentor/tenants').then((r) => r.data),
        enabled: dialog.open,
    });

    const sessions = data?.data || data || [];
    const tenants = myTenants?.data || myTenants || [];

    const save = useMutation({
        mutationFn: (form) =>
            form.id
                ? api.put(`/api/mentor/mentoring-sessions/${form.id}`, form)
                : api.post('/api/mentor/mentoring-sessions', form),
        onSuccess: () => {
            toast.success(dialog.editing ? 'Sesi diperbarui' : 'Sesi dibuat');
            qc.invalidateQueries({ queryKey: ['mentor', 'mentoring-sessions'] });
            qc.invalidateQueries({ queryKey: ['mentor', 'dashboard'] });
            setDialog({ open: false, editing: null });
        },
        onError: (err) => toast.error(formatApiError(err)),
    });

    const remove = useMutation({
        mutationFn: (id) => api.delete(`/api/mentor/mentoring-sessions/${id}`),
        onSuccess: () => {
            toast.success('Sesi dihapus');
            qc.invalidateQueries({ queryKey: ['mentor', 'mentoring-sessions'] });
        },
    });

    return (
        <div>
            <header className="mb-5 flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-7 w-7 text-sky-700" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Sesi Mentoring
                        </h1>
                    </div>
                    <p className="text-sm text-slate-600">
                        Jadwalkan & kelola sesi mentoring dengan tenant binaan.
                    </p>
                </div>
                <Button onClick={() => setDialog({ open: true, editing: null })}>
                    <Plus className="h-4 w-4" />
                    Jadwalkan Sesi
                </Button>
            </header>

            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <Spinner className="h-8 w-8 text-sky-600" />
                </div>
            ) : sessions.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="font-bold text-base">Belum ada sesi</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                            Jadwalkan sesi mentoring pertama dengan tenant binaan.
                        </p>
                        <Button onClick={() => setDialog({ open: true, editing: null })}>
                            <Plus className="h-4 w-4" />
                            Jadwalkan Sesi
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {sessions.map((s) => (
                        <SessionCard
                            key={s.id}
                            session={s}
                            onEdit={() => setDialog({ open: true, editing: s })}
                            onDelete={() => {
                                if (confirm(`Hapus sesi "${s.title}"?`)) remove.mutate(s.id);
                            }}
                        />
                    ))}
                </div>
            )}

            <SessionDialog
                open={dialog.open}
                editing={dialog.editing}
                tenants={tenants}
                onClose={() => setDialog({ open: false, editing: null })}
                onSave={(form) => save.mutate(form)}
                saving={save.isPending}
            />
        </div>
    );
}

function SessionCard({ session, onEdit, onDelete }) {
    const date = new Date(session.scheduled_at);
    const isUpcoming = date >= new Date();
    const isVideo = ['online', 'video'].includes(session.mode);

    return (
        <Card className={isUpcoming ? 'ring-2 ring-sky-200' : ''}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div
                        className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center ${
                            isUpcoming ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                        <div className="text-xs uppercase font-semibold leading-none">
                            {date.toLocaleDateString('id-ID', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-extrabold leading-none mt-0.5">
                            {date.getDate()}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-base leading-tight">{session.title}</h3>
                            <Badge variant={STATUS_COLOR[session.status] || 'secondary'}>
                                {session.status}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5">
                            <span>
                                {date.toLocaleString('id-ID', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                            {session.tenant && (
                                <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
                                    <User className="h-3 w-3" />
                                    {session.tenant.name}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                                {isVideo ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                {session.mode}
                            </span>
                        </div>
                        {session.notes && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                                {session.notes}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Button size="icon" variant="ghost" onClick={onEdit}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={onDelete}
                            className="text-rose-600 hover:bg-rose-50"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SessionDialog({ open, editing, tenants, onClose, onSave, saving }) {
    const [form, setForm] = useState({
        tenant_id: editing?.tenant_id || '',
        title: editing?.title || '',
        scheduled_at: editing?.scheduled_at ? editing.scheduled_at.slice(0, 16) : '',
        duration_minutes: editing?.duration_minutes || 60,
        mode: editing?.mode || 'online',
        meeting_link: editing?.meeting_link || '',
        location: editing?.location || '',
        agenda: editing?.agenda || '',
        notes: editing?.notes || '',
        status: editing?.status || 'scheduled',
    });

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit Sesi' : 'Jadwalkan Sesi Mentoring'}</DialogTitle>
                    <DialogDescription>
                        Tentukan jadwal, mode (online/offline), dan agenda sesi.
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
                        <Label htmlFor="tenant_id">Tenant *</Label>
                        <select
                            id="tenant_id"
                            value={form.tenant_id}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, tenant_id: e.target.value }))
                            }
                            required
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                        >
                            <option value="">— pilih tenant —</option>
                            {tenants.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="title">Judul Sesi *</Label>
                        <Input
                            id="title"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            required
                            placeholder="Review milestone, GTM strategy, dst"
                            className="mt-1"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="scheduled_at">Tanggal & Waktu *</Label>
                            <Input
                                id="scheduled_at"
                                type="datetime-local"
                                value={form.scheduled_at}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, scheduled_at: e.target.value }))
                                }
                                required
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="duration">Durasi (menit)</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="15"
                                step="15"
                                value={form.duration_minutes}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        duration_minutes: Number(e.target.value),
                                    }))
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="mode">Mode</Label>
                            <select
                                id="mode"
                                value={form.mode}
                                onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
                                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                            >
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
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
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rescheduled">Rescheduled</option>
                            </select>
                        </div>
                    </div>
                    {form.mode !== 'offline' && (
                        <div>
                            <Label htmlFor="meeting_link">Link Meeting</Label>
                            <Input
                                id="meeting_link"
                                type="url"
                                value={form.meeting_link}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, meeting_link: e.target.value }))
                                }
                                placeholder="https://meet.google.com/..."
                                className="mt-1"
                            />
                        </div>
                    )}
                    {form.mode !== 'online' && (
                        <div>
                            <Label htmlFor="location">Lokasi</Label>
                            <Input
                                id="location"
                                value={form.location}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, location: e.target.value }))
                                }
                                placeholder="Ruang meeting EIC Lt.3"
                                className="mt-1"
                            />
                        </div>
                    )}
                    <div>
                        <Label htmlFor="agenda">Agenda</Label>
                        <textarea
                            id="agenda"
                            rows={2}
                            value={form.agenda}
                            onChange={(e) => setForm((f) => ({ ...f, agenda: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                        />
                    </div>
                    <div>
                        <Label htmlFor="notes">Catatan Mentor (post-session)</Label>
                        <textarea
                            id="notes"
                            rows={3}
                            value={form.notes}
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                        />
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
