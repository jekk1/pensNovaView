import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Users, Clock, CheckCircle2, AlertCircle, X, DoorOpen, Wrench, Tag } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Spinner from '../../components/Spinner';

function RoomIcon({ type, className = '' }) {
    const icons = { meeting_room: Users, workshop: Wrench };
    const Icon = icons[type] || DoorOpen;
    return <Icon className={className || 'w-5 h-5'} />;
}

const STATUS_BADGE = {
    requested: { label: 'Menunggu', variant: 'warning' },
    approved: { label: 'Disetujui', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
    cancelled: { label: 'Dibatalkan', variant: 'secondary' },
    completed: { label: 'Selesai', variant: 'default' },
};
const fmtIDR = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

function hoursBetween(a, b) {
    if (!a || !b) return 0;
    const [h1, m1] = a.split(':').map(Number);
    const [h2, m2] = b.split(':').map(Number);
    return Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
}

export default function TenantRoomBookings() {
    const qc = useQueryClient();
    const [form, setForm] = useState({ workspace_slot_id: '', booking_date: todayStr(), start_time: '09:00', end_time: '11:00', purpose: '', attendees: '' });
    const [error, setError] = useState('');

    const { data: roomsData } = useQuery({
        queryKey: ['tenant', 'bookable-rooms'],
        queryFn: () => api.get('/api/tenant/bookable-rooms').then((r) => r.data),
    });
    const { data: mine, isLoading } = useQuery({
        queryKey: ['tenant', 'room-bookings'],
        queryFn: () => api.get('/api/tenant/room-bookings').then((r) => r.data),
    });
    const { data: avail } = useQuery({
        queryKey: ['tenant', 'availability', form.workspace_slot_id, form.booking_date],
        queryFn: () => api.get('/api/tenant/room-bookings/availability', { params: { workspace_slot_id: form.workspace_slot_id, date: form.booking_date } }).then((r) => r.data.data),
        enabled: !!form.workspace_slot_id && !!form.booking_date,
    });

    const rooms = roomsData?.data || [];
    const tenantPays = roomsData?.tenant_pays ?? false;
    const selectedRoom = rooms.find((r) => String(r.id) === String(form.workspace_slot_id));
    const hours = hoursBetween(form.start_time, form.end_time);
    const estCost = selectedRoom ? Math.round((selectedRoom.effective_rate_hourly || 0) * hours) : 0;

    const create = useMutation({
        mutationFn: (payload) => api.post('/api/tenant/room-bookings', payload).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tenant', 'room-bookings'] });
            qc.invalidateQueries({ queryKey: ['tenant', 'availability'] });
            setForm((f) => ({ ...f, purpose: '', attendees: '' }));
            setError('');
        },
        onError: (e) => setError(e.response?.data?.message || e.response?.data?.errors?.start_time?.[0] || 'Gagal membuat peminjaman.'),
    });
    const cancel = useMutation({
        mutationFn: (id) => api.post(`/api/tenant/room-bookings/${id}/cancel`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant', 'room-bookings'] }),
    });

    const submit = (e) => {
        e.preventDefault();
        setError('');
        if (!form.workspace_slot_id) return setError('Pilih ruang dulu.');
        if (hours <= 0) return setError('Jam selesai harus setelah jam mulai.');
        create.mutate({ ...form, attendees: form.attendees || null });
    };

    const bookings = mine?.data || [];

    return (
        <div>
            <header className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <CalendarClock className="h-7 w-7 text-primary-700" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Pinjam Ruang</h1>
                </div>
                <p className="text-sm text-slate-600">
                    Pinjam Ruang Amtom (rapat) & Bengkel untuk kegiatan tenant.{' '}
                    {roomsData && (
                        <Badge variant={tenantPays ? 'warning' : 'success'} className="ml-1">
                            {roomsData.tenant_type === 'inwall_rental' ? 'Inwall (sewa)'
                                : roomsData.tenant_type === 'inwall_program' ? 'Inwall (program)'
                                : 'Outwall'}
                            {tenantPays ? ' · kena biaya di ruang berbayar' : ' · gratis'}
                        </Badge>
                    )}
                </p>
            </header>

            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
                {/* Form booking */}
                <Card>
                    <CardContent className="p-5">
                        <h2 className="font-bold text-base mb-4">Ajukan Peminjaman</h2>

                        {/* Pilih ruang */}
                        <div className="grid grid-cols-1 gap-2 mb-4">
                            {rooms.map((r) => {
                                const sel = String(r.id) === String(form.workspace_slot_id);
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, workspace_slot_id: r.id }))}
                                        className={`text-left p-3 rounded-lg ring-1 transition ${sel ? 'ring-2 ring-primary-600 bg-primary-50' : 'ring-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="text-lg"><RoomIcon type={r.slot_type} className="w-5 h-5" /></span> {r.name}
                                            </span>
                                            <span className="text-xs font-medium text-slate-600 inline-flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {r.effective_rate_hourly > 0 ? `${fmtIDR(r.effective_rate_hourly)}/jam` : 'Gratis'}
                                            </span>
                                        </div>
                                        {r.facilities?.length > 0 && (
                                            <div className="text-[11px] text-slate-500 mt-1">{r.facilities.join(' · ')}</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <form onSubmit={submit} className="space-y-3">
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-600">Tanggal</span>
                                <Input type="date" min={todayStr()} value={form.booking_date} onChange={(e) => setForm((f) => ({ ...f, booking_date: e.target.value }))} className="mt-1" />
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className="text-xs font-semibold text-slate-600">Jam Mulai</span>
                                    <Input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} className="mt-1" />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-semibold text-slate-600">Jam Selesai</span>
                                    <Input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} className="mt-1" />
                                </label>
                            </div>
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-600">Keperluan</span>
                                <Input value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} placeholder="mis. Rapat tim mingguan" className="mt-1" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-semibold text-slate-600">Jumlah Peserta (opsional)</span>
                                <Input type="number" min="1" value={form.attendees} onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))} className="mt-1" />
                            </label>

                            {/* Estimasi biaya */}
                            <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3 flex items-center justify-between">
                                <span className="text-sm text-slate-600">{hours > 0 ? `${hours} jam` : 'Durasi —'}</span>
                                <span className="font-bold text-slate-900">
                                    {estCost > 0 ? `Estimasi: ${fmtIDR(estCost)}` : 'GRATIS'}
                                </span>
                            </div>

                            {error && (
                                <div className="text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-lg p-2.5 flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full" disabled={create.isPending}>
                                {create.isPending ? 'Mengirim…' : 'Ajukan Peminjaman'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Ketersediaan + booking saya */}
                <div className="space-y-5">
                    <Card>
                        <CardContent className="p-5">
                            <h2 className="font-bold text-base mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Jadwal Terisi {selectedRoom ? `— ${selectedRoom.name}` : ''}</h2>
                            {!form.workspace_slot_id ? (
                                <p className="text-sm text-slate-500">Pilih ruang untuk lihat jadwal yang sudah terisi.</p>
                            ) : (avail || []).length === 0 ? (
                                <p className="text-sm text-emerald-600">Belum ada peminjaman pada {form.booking_date}. Slot kosong.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {avail.map((b, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm bg-amber-50 ring-1 ring-amber-200 rounded-md px-3 py-1.5">
                                            <Clock className="h-3.5 w-3.5 text-amber-700" />
                                            <span className="font-medium">{b.start}–{b.end}</span>
                                            <Badge variant={b.status === 'approved' ? 'success' : 'warning'} className="ml-auto">{STATUS_BADGE[b.status]?.label || b.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <h2 className="font-bold text-base mb-3">Peminjaman Saya</h2>
                            {isLoading ? (
                                <div className="py-6 flex justify-center"><Spinner /></div>
                            ) : bookings.length === 0 ? (
                                <p className="text-sm text-slate-500">Belum ada peminjaman.</p>
                            ) : (
                                <div className="space-y-2">
                                    {bookings.map((b) => (
                                        <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg ring-1 ring-slate-200">
                                            <span className="text-xl"><RoomIcon type={b.slot?.slot_type} className="w-5 h-5" /></span>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-sm text-slate-900 truncate">{b.slot?.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(b.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {String(b.start_time).slice(0, 5)}–{String(b.end_time).slice(0, 5)}
                                                    {!b.is_free && ` · ${fmtIDR(b.total_cost)}`}
                                                </div>
                                            </div>
                                            <Badge variant={STATUS_BADGE[b.status]?.variant || 'secondary'}>{STATUS_BADGE[b.status]?.label || b.status}</Badge>
                                            {['requested', 'approved'].includes(b.status) && (
                                                <button onClick={() => cancel.mutate(b.id)} className="text-slate-400 hover:text-rose-600" title="Batalkan">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
