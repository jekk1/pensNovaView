import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
    Building2, MapPin, CheckCircle2, Clock, Coffee, Calendar, Info,
    Wifi, Zap, Users, ArrowRight, Banknote, AlertCircle, X,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import Spinner from '../../components/Spinner';

const TYPE_LABEL = {
    workspace: 'Bilik Tenant',
    meeting_room: 'Ruang Meeting',
    waiting_area: 'Ruang Tunggu',
    musholla: 'Musholla',
    front_office: 'Front Office',
    internship_desk: 'Meja Internship',
    common: 'Area Umum',
};

const STATUS_COLOR = {
    available: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    reserved: 'bg-amber-400 text-amber-900',
    occupied: 'bg-rose-400 text-rose-900',
    maintenance: 'bg-slate-300 text-slate-600',
};

const STATUS_LABEL = {
    available: 'Tersedia',
    reserved: 'Dipesan',
    occupied: 'Disewa',
    maintenance: 'Perawatan',
};

const SLOT_THEME = {
    available: { bg: 'bg-emerald-500', ring: 'ring-emerald-300', textPrimary: 'text-white', textSecondary: 'text-emerald-50', dot: 'bg-white' },
    reserved: { bg: 'bg-amber-400', ring: 'ring-amber-300', textPrimary: 'text-amber-900', textSecondary: 'text-amber-800', dot: 'bg-amber-900' },
    occupied: { bg: 'bg-rose-500', ring: 'ring-rose-300', textPrimary: 'text-white', textSecondary: 'text-rose-50', dot: 'bg-white' },
    maintenance: { bg: 'bg-slate-100', ring: 'ring-slate-200', textPrimary: 'text-slate-700', textSecondary: 'text-slate-500', dot: 'bg-slate-400' },
};

function SlotIcon({ type, className = 'text-lg sm:text-xl leading-none' }) {
    const icons = {
        musholla: Building2,
        meeting_room: Users,
        waiting_area: Coffee,
        front_office: Building2,
        internship_desk: Zap,
    };
    const Icon = icons[type] || Building2;
    return <Icon className={className || 'w-5 h-5'} />;
}

const fmtIDR = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

export default function WorkspaceRental() {
    const { data, isLoading } = useQuery({
        queryKey: ['public', 'workspace-layout'],
        queryFn: () => api.get('/api/public/workspace-layout').then((r) => r.data),
    });

    const [selectedSlot, setSelectedSlot] = useState(null);
    const slots = data?.data || [];
    const stats = data?.stats || {};

    return (
        <div className="min-h-screen" style={{ background: '#f8f9fc' }}>
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="mb-8 text-center">
                    <Badge variant="outline" className="mb-3">UPA Pengembangan Teknologi & Produk Unggulan PENS</Badge>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                        Sewa Ruang Inkubator
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                        Workspace untuk startup, founder, dan pelaku UMKM di lingkungan PENS. 12 bilik 3×4 meter dengan fasilitas penuh, sewa tahunan terjangkau.
                    </p>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto">
                    <Stat label="Bilik Tersedia" value={stats.available ?? '—'} color="emerald" />
                    <Stat label="Bilik Terisi" value={stats.occupied ?? '—'} color="rose" />
                    <Stat label="Tingkat Okupansi" value={`${stats.occupancy_rate ?? 0}%`} color="amber" />
                    <Stat label="Tarif Mulai" value="Rp 9,6jt/th" color="primary" />
                </div>

                {/* Floor plan visual */}
                <Card className="mb-6">
                    <CardContent className="p-3 sm:p-5">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary-700" />
                                <h2 className="font-bold text-base">Denah Ruang Inkubator</h2>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <LegendItem color="bg-emerald-500" label="Tersedia" />
                                <LegendItem color="bg-amber-400" label="Dipesan" />
                                <LegendItem color="bg-rose-400" label="Disewa" />
                                <LegendItem color="bg-slate-200" label="Fasilitas Bersama" />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="h-96 flex items-center justify-center">
                                <Spinner className="h-8 w-8 text-primary-600" />
                            </div>
                        ) : (
                            <FloorPlan slots={slots} onSelect={setSelectedSlot} selectedId={selectedSlot?.id} />
                        )}
                    </CardContent>
                </Card>

                {/* Slot detail card */}
                {selectedSlot && <SlotDetail slot={selectedSlot} onClose={() => setSelectedSlot(null)} />}

                {/* Info section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <InfoCard icon={Banknote} title="Tarif Sewa">
                        <strong>Rp 9,6 juta / tahun</strong> untuk bilik tenant 3×4 meter.<br />
                        Dibayar 2 termin dalam setahun.
                    </InfoCard>
                    <InfoCard icon={Calendar} title="Jam Operasional">
                        Senin–Jumat, <strong>08.00 – 16.00 WIB</strong>.<br />
                        Akses di luar jam atas persetujuan UPA.
                    </InfoCard>
                    <InfoCard icon={Coffee} title="Fasilitas">
                        Meja, kursi, listrik, WiFi, AC bersama, toilet, akses meeting room, mushola.
                    </InfoCard>
                </div>
            </div>
        </div>
    );
}

function FloorPlan({ slots, onSelect, selectedId }) {
    return (
        <div
            className="relative w-full rounded-xl ring-1 ring-slate-200 overflow-hidden"
            style={{ aspectRatio: '21 / 9', background: '#f8fafc' }}
        >
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: 'linear-gradient(rgba(148,163,184,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.2) 1px, transparent 1px)',
                    backgroundSize: '5% 10%',
                }}
            />
            {slots.map((slot) => {
                const isRentable = slot.is_rentable;
                const theme = isRentable ? SLOT_THEME[slot.status] : SLOT_THEME.maintenance;
                const isWorkspace = slot.slot_type === 'workspace';
                const isSelected = slot.id === selectedId;
                const isClickable = isRentable && slot.status !== 'occupied';

                return (
                    <button
                        key={slot.id}
                        onClick={() => isClickable && onSelect(slot)}
                        disabled={! isClickable}
                        className={`absolute rounded-lg ring-1 ${theme.ring} ${theme.bg} ${theme.textPrimary} transition-all flex flex-col items-center justify-center text-center px-2 py-1 ${
                            isSelected ? 'ring-4 ring-primary-500 z-20 scale-[1.05]' : ''
                        } ${isClickable ? 'cursor-pointer hover:scale-[1.03] hover:shadow-md hover:z-10' : 'cursor-default'}`}
                        style={{
                            left: `${slot.grid_x}%`,
                            top: `${slot.grid_y}%`,
                            width: `${slot.grid_w}%`,
                            height: `${slot.grid_h}%`,
                        }}
                        title={`${slot.name} — ${STATUS_LABEL[slot.status] || ''}`}
                    >
                        {isRentable && (
                            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${theme.dot} ring-1 ring-black/10`} />
                        )}
                        {isWorkspace ? (
                            <>
                                <div className="text-base sm:text-lg font-extrabold leading-none tracking-tight">#{slot.slot_code}</div>
                                <div className={`text-[9px] sm:text-[10px] mt-1 ${theme.textSecondary} font-semibold leading-tight`}>3×4m</div>
                                <div className={`text-[8px] sm:text-[9px] mt-0.5 ${theme.textSecondary} hidden sm:block leading-tight`}>
                                    {STATUS_LABEL[slot.status]}
                                </div>
                            </>
                        ) : (
                            <>
                                <SlotIcon type={slot.slot_type} />
                                <div className={`text-[9px] sm:text-[10px] mt-1 font-semibold leading-tight ${theme.textSecondary}`}>
                                    {slot.name}
                                </div>
                            </>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function SlotDetail({ slot, onClose }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);

    const isOccupied = slot.status === 'occupied';

    return (
        <Card className="mt-4 border-primary-200 bg-primary-50/30">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <h3 className="text-lg font-extrabold text-slate-900">{slot.name}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                            {TYPE_LABEL[slot.slot_type]} · {slot.size_label || '—'}
                        </p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200 text-slate-600"><X className="h-5 w-5" /></button>
                </div>

                {isOccupied ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-900">
                        <div className="font-bold mb-1 flex items-center gap-1">
                            <Info className="h-4 w-4" /> Sedang Disewa
                        </div>
                        <div className="text-xs">
                            Disewa oleh <strong>{slot.occupied_by}</strong> sampai{' '}
                            {slot.occupied_until ? new Date(slot.occupied_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}.
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <DetailItem icon={Banknote} label="Tarif Tahunan" value={fmtIDR(slot.yearly_rate)} />
                            <DetailItem icon={Calendar} label="Pembayaran" value="2 termin / tahun" />
                            <DetailItem icon={Clock} label="Jam Operasional" value="08.00–16.00" />
                            <DetailItem icon={Users} label="Kapasitas" value="2–4 orang" />
                        </div>

                        {slot.facilities?.length > 0 && (
                            <div className="mb-4">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Fasilitas</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {slot.facilities.map((f, i) => (
                                        <Badge key={i} variant="secondary" className="text-[11px]">{f}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!showForm ? (
                            <div className="flex gap-2 justify-end">
                                {user ? (
                                    <Button onClick={() => setShowForm(true)}>
                                        Ajukan Sewa <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={() => navigate('/login?redirect=/sewa-ruang')}>
                                            Login dulu
                                        </Button>
                                        <Button onClick={() => navigate('/daftar')}>
                                            Daftar sebagai Tenant
                                        </Button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <RentalForm slot={slot} onClose={() => { setShowForm(false); onClose(); qc.invalidateQueries({ queryKey: ['public', 'workspace-layout'] }); }} />
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function RentalForm({ slot, onClose }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        duration_months: 12,
        renter_name: user?.name || '',
        renter_id_number: '',
        renter_address: '',
        renter_phone: user?.phone || '',
        renter_email: user?.email || '',
        business_name: '',
        notes: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const monthlyRate = Number(slot.yearly_rate) / 12;
    const totalAmount = Math.round(monthlyRate * form.duration_months);

    const mutation = useMutation({
        mutationFn: () => api.post('/api/tenant/workspace-rentals', {
            ...form,
            workspace_slot_id: slot.id,
        }),
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => onClose(), 2500);
        },
        onError: (e) => {
            // Fallback to non-tenant route
            api.post('/api/workspace-rentals-public', { ...form, workspace_slot_id: slot.id })
                .then(() => { setSuccess(true); setTimeout(() => onClose(), 2500); })
                .catch((err) => setError(err?.response?.data?.message || 'Gagal mengajukan sewa'));
        },
    });

    if (success) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600 mb-2" />
                <h4 className="font-bold text-emerald-900 mb-1">Permintaan Sewa Terkirim</h4>
                <p className="text-xs text-emerald-800">
                    Tim UPA akan menghubungi Anda untuk konfirmasi dan instruksi pembayaran. Pantau status di Dashboard Anda.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <Field label="Tanggal Mulai *">
                    <Input type="date" value={form.start_date} required onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </Field>
                <Field label="Durasi Sewa (bulan) *">
                    <select
                        value={form.duration_months}
                        onChange={(e) => setForm({ ...form, duration_months: Number(e.target.value) })}
                        className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm"
                    >
                        <option value="6">6 bulan</option>
                        <option value="12">12 bulan (1 tahun)</option>
                        <option value="24">24 bulan (2 tahun)</option>
                    </select>
                </Field>
                <Field label="Nama Penyewa *">
                    <Input value={form.renter_name} required onChange={(e) => setForm({ ...form, renter_name: e.target.value })} />
                </Field>
                <Field label="Nomor KTP">
                    <Input value={form.renter_id_number} onChange={(e) => setForm({ ...form, renter_id_number: e.target.value })} />
                </Field>
                <Field label="Telepon">
                    <Input value={form.renter_phone} onChange={(e) => setForm({ ...form, renter_phone: e.target.value })} placeholder="08xx..." />
                </Field>
                <Field label="Email">
                    <Input type="email" value={form.renter_email} onChange={(e) => setForm({ ...form, renter_email: e.target.value })} />
                </Field>
                <div className="col-span-2">
                    <Field label="Nama Usaha / Brand">
                        <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="Nama startup atau usaha" />
                    </Field>
                </div>
                <div className="col-span-2">
                    <Field label="Alamat *">
                        <textarea
                            rows="2"
                            required
                            value={form.renter_address}
                            onChange={(e) => setForm({ ...form, renter_address: e.target.value })}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm"
                        />
                    </Field>
                </div>
                <div className="col-span-2">
                    <Field label="Catatan (opsional)">
                        <textarea
                            rows="2"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm"
                        />
                    </Field>
                </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between font-bold">
                    <span>Total Biaya Sewa</span>
                    <span className="text-primary-800 font-mono">{fmtIDR(totalAmount)}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                    Dibayar dalam 2 termin: {fmtIDR(Math.round(totalAmount / 2))} di awal + {fmtIDR(totalAmount - Math.round(totalAmount / 2))} di tengah periode.
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <Button variant="ghost" type="button" onClick={onClose}>Batal</Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Mengirim…' : 'Ajukan Sewa'}
                </Button>
            </div>
        </form>
    );
}

function Stat({ label, value, color }) {
    const colors = {
        emerald: 'text-emerald-700 bg-emerald-50 ring-emerald-200',
        rose: 'text-rose-700 bg-rose-50 ring-rose-200',
        amber: 'text-amber-700 bg-amber-50 ring-amber-200',
        primary: 'text-primary-700 bg-primary-50 ring-primary-200',
    };
    return (
        <div className={`rounded-xl p-3 ring-1 text-center ${colors[color] || colors.primary}`}>
            <div className="text-xl sm:text-2xl font-extrabold">{value}</div>
            <div className="text-[10px] sm:text-xs uppercase font-semibold tracking-wider mt-1 opacity-80">{label}</div>
        </div>
    );
}

function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded ${color}`} />
            <span className="text-slate-700">{label}</span>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value }) {
    return (
        <div className="bg-white rounded-lg p-2.5 ring-1 ring-slate-200">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                <Icon className="h-3 w-3" /> {label}
            </div>
            <div className="text-sm font-bold mt-0.5">{value}</div>
        </div>
    );
}

function InfoCard({ icon: Icon, title, children }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-primary-100">
                        <Icon className="h-4 w-4 text-primary-700" />
                    </div>
                    <h3 className="font-bold text-sm">{title}</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{children}</p>
            </CardContent>
        </Card>
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
