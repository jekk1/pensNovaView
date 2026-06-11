import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Building2, MapPin, CheckCircle2, Clock, XCircle, Banknote, TrendingUp,
    Eye, FileText, AlertCircle, Calendar, FileDown, RefreshCw,
    Pencil, Plus, Trash2, Check, X, DoorOpen, Move,
} from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { CurrencyInput } from '../../components/ui/currency-input';
import { apiErrorMessage } from '../../lib/apiError';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';

const STATUS_BADGE = {
    requested: { label: 'Menunggu', variant: 'warning' },
    approved: { label: 'Disetujui', variant: 'default' },
    active: { label: 'Aktif', variant: 'success' },
    expired: { label: 'Selesai', variant: 'secondary' },
    cancelled: { label: 'Dibatalkan', variant: 'destructive' },
    terminated: { label: 'Diputus', variant: 'destructive' },
};

const SLOT_STATUS_COLOR = {
    available: 'bg-emerald-500',
    reserved: 'bg-amber-400',
    occupied: 'bg-rose-400',
    maintenance: 'bg-slate-300',
};

const SLOT_STATUS_LABEL = {
    available: 'Tersedia',
    reserved: 'Dipesan',
    occupied: 'Disewa',
    maintenance: 'Maintenance',
};

// Theme per status untuk LayoutTab — solid color + ring + text dengan kontras yang baik
const SLOT_THEME = {
    available: {
        bg: 'bg-emerald-500',
        ring: 'ring-emerald-300',
        textPrimary: 'text-white',
        textSecondary: 'text-emerald-50',
        dot: 'bg-white',
    },
    reserved: {
        bg: 'bg-amber-400',
        ring: 'ring-amber-300',
        textPrimary: 'text-amber-900',
        textSecondary: 'text-amber-800',
        dot: 'bg-amber-900',
    },
    occupied: {
        bg: 'bg-rose-500',
        ring: 'ring-rose-300',
        textPrimary: 'text-white',
        textSecondary: 'text-rose-50',
        dot: 'bg-white',
    },
    maintenance: {
        bg: 'bg-slate-100',
        ring: 'ring-slate-200',
        textPrimary: 'text-slate-700',
        textSecondary: 'text-slate-500',
        dot: 'bg-slate-400',
    },
};

// Icon untuk non-rental rooms (selain workspace)
const ROOM_ICON = {
    musholla: 'Musholla',
    meeting_room: 'Meeting',
    waiting_area: 'Waiting',
    front_office: 'Office',
    internship_desk: 'Intern',
    door: 'Pintu',
    common: 'Ruang',
};

// Tipe ruang yang bisa ditambahkan admin di editor denah
const ADDABLE_TYPES = [
    { type: 'workspace', label: 'Bilik', icon: 'Bilik', rentable: true },
    { type: 'door', label: 'Pintu', icon: 'Pintu', rentable: false },
    { type: 'meeting_room', label: 'Meeting Room', icon: 'Meeting', rentable: false },
    { type: 'common', label: 'Ruang Lain', icon: 'Ruang', rentable: false },
];

const fmtIDR = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
const fmtIDRCompact = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)} rb`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

export default function WorkspaceManagement() {
    const [tab, setTab] = useState('overview');
    const [selectedRental, setSelectedRental] = useState(null);

    const { data: stats } = useQuery({
        queryKey: ['admin', 'workspace', 'stats'],
        queryFn: () => api.get('/api/admin/workspace-rentals-stats').then((r) => r.data),
    });

    return (
        <div>
            <header className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-6 w-6 text-primary-700" />
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                        Sewa Ruang Inkubator
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                    Kelola layout ruang, permintaan sewa, dan pembayaran. Sumber pendapatan utama UPA dari sewa workspace tenant.
                </p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <StatCard label="Bilik Disewa" value={`${stats?.total_slots > 0 ? Math.round((stats.occupancy_rate / 100) * stats.total_slots) : 0} / ${stats?.total_slots ?? '—'}`} icon={Building2} color="emerald" />
                <StatCard label="Okupansi" value={`${stats?.occupancy_rate ?? 0}%`} icon={TrendingUp} color="amber" />
                <StatCard label="Permintaan Baru" value={stats?.requested ?? 0} icon={Clock} color="amber" />
                <StatCard label="Potensi YTD" value={fmtIDRCompact(stats?.potential_yearly_revenue ?? 0)} icon={Banknote} color="primary" />
                <StatCard label="Sudah Dibayar" value={fmtIDRCompact(stats?.paid_amount ?? 0)} icon={CheckCircle2} color="emerald" />
            </div>

            <div className="border-b border-slate-200 mb-4 flex gap-1">
                {['overview', 'rentals', 'bookings', 'slots'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                            tab === t ? 'border-primary-700 text-primary-700' : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {t === 'overview' ? 'Layout' : t === 'rentals' ? 'Permintaan & Kontrak' : t === 'bookings' ? 'Peminjaman Ruang' : 'Bilik & Tarif'}
                    </button>
                ))}
            </div>

            {tab === 'overview' && <LayoutTab />}
            {tab === 'rentals' && <RentalsTab onSelect={setSelectedRental} />}
            {tab === 'bookings' && <BookingsTab />}
            {tab === 'slots' && <SlotsTab />}

            {selectedRental && <RentalDetailDialog id={selectedRental} onClose={() => setSelectedRental(null)} />}
        </div>
    );
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const round1 = (v) => Math.round(v * 10) / 10;

function LayoutTab() {
    const qc = useQueryClient();
    const [hovered, setHovered] = useState(null);
    const [edit, setEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [localPos, setLocalPos] = useState({}); // overlay {id: {grid_x,grid_y,grid_w,grid_h}}
    const containerRef = useRef(null);
    const dragRef = useRef(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'workspace-slots'],
        queryFn: () => api.get('/api/admin/workspace-slots').then((r) => r.data.data),
    });

    const patch = useMutation({
        mutationFn: ({ id, payload }) => api.patch(`/api/admin/workspace-slots/${id}`, payload).then((r) => r.data.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'workspace-slots'] }),
        onError: (e) => alert(apiErrorMessage(e)),
    });
    const create = useMutation({
        mutationFn: (payload) => api.post('/api/admin/workspace-slots', payload).then((r) => r.data.data),
        onSuccess: (s) => { qc.invalidateQueries({ queryKey: ['admin', 'workspace-slots'] }); setSelectedId(s.id); },
        onError: (e) => alert(apiErrorMessage(e)),
    });
    const remove = useMutation({
        mutationFn: (id) => api.delete(`/api/admin/workspace-slots/${id}`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'workspace-slots'] }); setSelectedId(null); },
        onError: (e) => alert(apiErrorMessage(e)),
    });

    const slots = data || [];
    const getPos = (slot) => localPos[slot.id] || {
        grid_x: +slot.grid_x, grid_y: +slot.grid_y, grid_w: +slot.grid_w, grid_h: +slot.grid_h,
    };

    const onPointerMove = useCallback((e) => {
        const d = dragRef.current;
        if (! d) return;
        const dxp = ((e.clientX - d.startX) / d.rect.width) * 100;
        const dyp = ((e.clientY - d.startY) / d.rect.height) * 100;
        setLocalPos((prev) => {
            const p = { ...d.orig };
            if (d.mode === 'move') {
                p.grid_x = clamp(round1(d.orig.grid_x + dxp), 0, 100 - d.orig.grid_w);
                p.grid_y = clamp(round1(d.orig.grid_y + dyp), 0, 100 - d.orig.grid_h);
            } else {
                p.grid_w = clamp(round1(d.orig.grid_w + dxp), 2, 100 - d.orig.grid_x);
                p.grid_h = clamp(round1(d.orig.grid_h + dyp), 2, 100 - d.orig.grid_y);
            }
            return { ...prev, [d.id]: p };
        });
    }, []);

    const onPointerUp = useCallback(() => {
        const d = dragRef.current;
        dragRef.current = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        if (! d) return;
        setLocalPos((prev) => {
            const p = prev[d.id];
            if (p) patch.mutate({ id: d.id, payload: p });
            return prev;
        });
    }, [onPointerMove, patch]);

    const startDrag = (e, slot, mode) => {
        if (! edit) return;
        e.preventDefault();
        e.stopPropagation();
        setSelectedId(slot.id);
        const rect = containerRef.current.getBoundingClientRect();
        dragRef.current = { id: slot.id, mode, startX: e.clientX, startY: e.clientY, rect, orig: getPos(slot) };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    const addSlot = (t) => {
        create.mutate({
            name: t.label, slot_type: t.type, is_rentable: t.rentable,
            grid_x: 45, grid_y: 40, grid_w: t.type === 'door' ? 2 : 9, grid_h: t.type === 'door' ? 8 : 18,
            yearly_rate: t.rentable ? 9600000 : 0,
            area_sqm: t.type === 'workspace' ? 12 : null,
        });
    };

    if (isLoading) return <div className="py-12 flex justify-center"><Spinner /></div>;

    const occupied = slots.filter((s) => s.is_rentable && s.status === 'occupied').length;
    const rentable = slots.filter((s) => s.is_rentable).length;
    const available = slots.filter((s) => s.is_rentable && s.status === 'available').length;
    const selected = slots.find((s) => s.id === selectedId) || null;

    return (
        <Card>
            <CardContent className="p-4 sm:p-5">
                {/* Header dengan summary + legenda + tombol edit */}
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                    <div>
                        <h2 className="font-bold text-base text-slate-900">Denah Ruang Inkubator</h2>
                        <p className="text-xs text-slate-600 mt-0.5">
                            {edit
                                ? 'Mode edit: seret untuk pindah, tarik pojok kanan-bawah untuk ubah ukuran, klik untuk pilih & atur luas.'
                                : `${occupied} dari ${rentable} bilik disewa · ${available} tersedia · klik bilik untuk detail`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {! edit && (
                            <div className="flex items-center gap-3 text-xs flex-wrap mr-1">
                                {Object.entries(SLOT_STATUS_LABEL).map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-1.5">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${SLOT_STATUS_COLOR[k]} ring-2 ring-white shadow-sm`} />
                                        <span className="text-slate-700 font-medium">{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button
                            size="sm"
                            variant={edit ? 'default' : 'outline'}
                            onClick={() => { setEdit((v) => !v); setSelectedId(null); setLocalPos({}); }}
                        >
                            {edit ? <><Check className="h-4 w-4 mr-1" /> Selesai</> : <><Pencil className="h-4 w-4 mr-1" /> Edit Denah</>}
                        </Button>
                    </div>
                </div>

                {/* Toolbar tambah elemen (edit mode) */}
                {edit && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap text-xs">
                        <span className="text-slate-500 font-medium">Tambah:</span>
                        {ADDABLE_TYPES.map((t) => (
                            <button
                                key={t.type}
                                onClick={() => addSlot(t)}
                                disabled={create.isPending}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700 disabled:opacity-50"
                            >
                                <Plus className="h-3.5 w-3.5" /> {t.icon} {t.label}
                            </button>
                        ))}
                        {(patch.isPending || create.isPending || remove.isPending) && (
                            <span className="text-slate-400 inline-flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> menyimpan…</span>
                        )}
                    </div>
                )}

                <div className={edit && selected ? 'grid lg:grid-cols-[1fr_280px] gap-4' : ''}>
                    {/* Floor plan container */}
                    <div
                        ref={containerRef}
                        className={`relative w-full rounded-xl ring-1 ring-slate-200 overflow-hidden ${edit ? 'bg-slate-50 cursor-default touch-none' : ''}`}
                        style={{ aspectRatio: '21 / 9', background: edit ? undefined : '#f8fafc' }}
                        onClick={() => { if (edit) setSelectedId(null); }}
                    >
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage: 'linear-gradient(rgba(148,163,184,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.2) 1px, transparent 1px)',
                                backgroundSize: '5% 10%',
                            }}
                        />

                        {slots.filter((s) => s.zone !== 'external').map((slot) => {
                            const isRentable = slot.is_rentable;
                            const isDoor = slot.slot_type === 'door';
                            const theme = isRentable ? SLOT_THEME[slot.status] : SLOT_THEME.maintenance;
                            const isWorkspace = slot.slot_type === 'workspace';
                            const isHovered = hovered === slot.id;
                            const isSel = selectedId === slot.id;
                            const pos = getPos(slot);

                            if (isDoor) {
                                return (
                                    <div
                                        key={slot.id}
                                        onMouseEnter={() => setHovered(slot.id)}
                                        onMouseLeave={() => setHovered(null)}
                                        onPointerDown={(e) => startDrag(e, slot, 'move')}
                                        onClick={(e) => edit && e.stopPropagation()}
                                        className={`absolute rounded-sm bg-amber-700/80 ring-1 ring-amber-900/40 flex items-center justify-center ${edit ? 'cursor-move' : ''} ${isSel ? 'ring-2 ring-primary-600 z-20' : ''}`}
                                        style={{ left: `${pos.grid_x}%`, top: `${pos.grid_y}%`, width: `${pos.grid_w}%`, height: `${pos.grid_h}%` }}
                                        title="Pintu"
                                    >
                                        <DoorOpen className="h-3 w-3 text-amber-50" />
                                        {edit && isSel && <ResizeHandle onPointerDown={(e) => startDrag(e, slot, 'resize')} />}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={slot.id}
                                    onMouseEnter={() => setHovered(slot.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    onPointerDown={(e) => startDrag(e, slot, 'move')}
                                    onClick={(e) => edit && e.stopPropagation()}
                                    className={`absolute rounded-lg ring-1 ${theme.ring} ${theme.bg} ${theme.textPrimary} transition-shadow flex flex-col items-center justify-center text-center px-2 py-1 ${edit ? 'cursor-move' : 'cursor-pointer hover:scale-[1.03] hover:z-10'} ${isHovered && ! edit ? 'z-10 ring-2' : ''} ${isSel ? 'ring-2 ring-primary-600 z-20' : ''}`}
                                    style={{ left: `${pos.grid_x}%`, top: `${pos.grid_y}%`, width: `${pos.grid_w}%`, height: `${pos.grid_h}%` }}
                                    title={`${slot.name}${slot.occupied_by ? ` — ${slot.occupied_by}` : ''}`}
                                >
                                    {isRentable && (
                                        <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${theme.dot} ring-1 ring-black/10`} />
                                    )}
                                    {isWorkspace ? (
                                        <>
                                            <div className="text-base sm:text-lg font-extrabold leading-none tracking-tight">#{slot.slot_code}</div>
                                            {slot.occupied_by && (
                                                <div className={`text-[9px] sm:text-[10px] mt-1 ${theme.textSecondary} leading-tight max-w-full truncate px-1 font-semibold`}>
                                                    {slot.occupied_by.replace(/\s*\([^)]*\)\s*/, '')}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-lg sm:text-xl leading-none">{ROOM_ICON[slot.slot_type] || '—'}</div>
                                            <div className={`text-[9px] sm:text-[10px] mt-1 font-semibold leading-tight ${theme.textSecondary}`}>{slot.name}</div>
                                        </>
                                    )}
                                    {slot.area_sqm && ! edit && (
                                        <div className={`text-[8px] mt-0.5 ${isRentable ? theme.textSecondary : 'text-slate-400'}`}>{(+slot.area_sqm).toFixed(0)} m²</div>
                                    )}
                                    {edit && isSel && <ResizeHandle onPointerDown={(e) => startDrag(e, slot, 'resize')} />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Edit panel */}
                    {edit && selected && (
                        <SlotEditPanel
                            key={selected.id}
                            slot={selected}
                            pos={getPos(selected)}
                            onPatch={(payload) => patch.mutate({ id: selected.id, payload })}
                            onPosChange={(p) => { setLocalPos((prev) => ({ ...prev, [selected.id]: { ...getPos(selected), ...p } })); patch.mutate({ id: selected.id, payload: p }); }}
                            onDelete={() => { if (confirm(`Hapus "${selected.name}" dari denah?`)) remove.mutate(selected.id); }}
                            deleting={remove.isPending}
                        />
                    )}
                </div>

                {/* Semua ruang yang bisa dipinjam (Amtom, Bengkel luar kawasan + Ruang Diskusi di denah) */}
                <ExternalRoomsSection
                    rooms={slots.filter((s) => s.is_bookable)}
                    onPatch={(id, payload) => patch.mutate({ id, payload })}
                />

                {/* Hover detail card (view mode) */}
                {hovered && ! edit && (
                    <div className="mt-3 bg-white ring-1 ring-slate-200 rounded-lg p-3 text-sm">
                        {(() => {
                            const slot = slots.find((s) => s.id === hovered);
                            if (! slot) return null;
                            return (
                                <div className="flex items-start gap-3 flex-wrap">
                                    <div>
                                        <span className="font-bold text-slate-900">
                                            {slot.slot_type === 'workspace' ? `Bilik #${slot.slot_code}` : slot.name}
                                        </span>
                                        {slot.size_label && <span className="text-xs text-slate-500 ml-2">({slot.size_label})</span>}
                                    </div>
                                    {slot.is_rentable && (
                                        <>
                                            <Badge variant={slot.status === 'occupied' ? 'destructive' : slot.status === 'reserved' ? 'warning' : 'success'}>
                                                {SLOT_STATUS_LABEL[slot.status]}
                                            </Badge>
                                            <span className="text-xs text-slate-600">
                                                Tarif: <strong>{fmtIDR(slot.yearly_rate)}/tahun</strong>
                                            </span>
                                        </>
                                    )}
                                    {slot.occupied_by && (
                                        <span className="text-xs text-slate-700">
                                            Disewa oleh: <strong>{slot.occupied_by}</strong>
                                        </span>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ResizeHandle({ onPointerDown }) {
    return (
        <span
            onPointerDown={onPointerDown}
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-sm bg-white ring-2 ring-primary-600 cursor-nwse-resize z-30"
            title="Tarik untuk ubah ukuran"
        />
    );
}

function SlotEditPanel({ slot, pos, onPatch, onPosChange, onDelete, deleting }) {
    const isWorkspace = slot.slot_type === 'workspace';
    const canBook = ['meeting_room', 'workshop', 'common'].includes(slot.slot_type);
    const [name, setName] = useState(slot.name || '');
    const [area, setArea] = useState(slot.area_sqm ? String(+slot.area_sqm) : '');
    const [rate, setRate] = useState(slot.yearly_rate ? String(+slot.yearly_rate) : '');
    const [bookRate, setBookRate] = useState(slot.booking_rate_hourly ? String(+slot.booking_rate_hourly) : '');

    return (
        <div className="bg-white ring-1 ring-slate-200 rounded-lg p-3 text-sm space-y-3 h-fit">
            <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{isWorkspace ? `Bilik #${slot.slot_code}` : slot.name}</span>
                <span className="text-base">{ROOM_ICON[slot.slot_type] || '—'}</span>
            </div>

            <Field label="Nama">
                <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name !== slot.name && onPatch({ name })} className="h-8 text-sm" />
            </Field>

            <Field label="Luas (m²)">
                <Input
                    type="number" min="0" value={area}
                    onChange={(e) => setArea(e.target.value)}
                    onBlur={() => {
                        const a = area === '' ? null : Number(area);
                        onPatch({ area_sqm: a, size_label: a ? `${a} m²` : null });
                    }}
                    className="h-8 text-sm" placeholder="mis. 12"
                />
            </Field>

            <div className="grid grid-cols-2 gap-2">
                <Field label="Lebar (%)">
                    <Input
                        type="number" min="2" max="100" value={pos.grid_w}
                        onChange={(e) => onPosChange({ grid_w: clamp(Number(e.target.value) || 2, 2, 100 - pos.grid_x) })}
                        className="h-8 text-sm"
                    />
                </Field>
                <Field label="Tinggi (%)">
                    <Input
                        type="number" min="2" max="100" value={pos.grid_h}
                        onChange={(e) => onPosChange({ grid_h: clamp(Number(e.target.value) || 2, 2, 100 - pos.grid_y) })}
                        className="h-8 text-sm"
                    />
                </Field>
            </div>

            {isWorkspace && (
                <>
                    <Field label="Tarif / tahun (Rp)">
                        <CurrencyInput
                            value={rate}
                            onChange={(v) => setRate(v)}
                            onBlur={() => Number(rate) !== +slot.yearly_rate && onPatch({ yearly_rate: Number(rate) || 0 })}
                            className="h-9 text-sm"
                        />
                    </Field>
                    <Field label="Status">
                        <select
                            value={slot.status}
                            onChange={(e) => onPatch({ status: e.target.value })}
                            className="h-8 w-full rounded-md border border-slate-200 px-2 text-sm bg-white"
                        >
                            {Object.entries(SLOT_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </Field>
                </>
            )}

            {canBook && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Peminjaman Ruang</span>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={!!slot.is_bookable} onChange={(e) => onPatch({ is_bookable: e.target.checked })} className="rounded" />
                        Bisa dipinjam tenant (Amtom/Bengkel)
                    </label>
                    {slot.is_bookable && (
                        <>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={!!slot.booking_is_paid} onChange={(e) => onPatch({ booking_is_paid: e.target.checked })} className="rounded" />
                                Berbayar <span className="text-xs text-slate-400">(hanya inwall-sewa dikenai)</span>
                            </label>
                            {slot.booking_is_paid && (
                                <Field label="Tarif pinjam / jam (Rp)">
                                    <CurrencyInput
                                        value={bookRate}
                                        onChange={(v) => setBookRate(v)}
                                        onBlur={() => Number(bookRate) !== +slot.booking_rate_hourly && onPatch({ booking_rate_hourly: Number(bookRate) || 0 })}
                                        className="h-9 text-sm" placeholder="50000"
                                    />
                                </Field>
                            )}
                        </>
                    )}
                </div>
            )}

            <Button variant="destructive" size="sm" className="w-full" onClick={onDelete} disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-1" /> Hapus dari denah
            </Button>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
            <div className="mt-1">{children}</div>
        </label>
    );
}

function BookRateInput({ initial, onCommit }) {
    const [v, setV] = useState(initial ? +initial : '');
    return (
        <CurrencyInput
            value={v}
            onChange={setV}
            onBlur={() => Number(v) !== +(initial || 0) && onCommit(Number(v) || 0)}
            className="h-9 text-sm"
            placeholder="50000"
        />
    );
}

function ExternalRoomsSection({ rooms, onPatch }) {
    if (rooms.length === 0) return null;
    return (
        <div className="mt-5 border-t border-slate-200 pt-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" /> Ruang yang Bisa Dipinjam (Booking)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">Semua ruang yang bisa dipinjam tenant via menu Pinjam Ruang — termasuk ruang di kawasan berbeda (Amtom, Bengkel) maupun di denah inkubator (Ruang Diskusi).</p>
            <div className="grid sm:grid-cols-2 gap-3">
                {rooms.map((r) => (
                    <div key={r.id} className="rounded-lg ring-1 ring-slate-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-900 flex items-center gap-2">
                                <span className="text-lg">{ROOM_ICON[r.slot_type] || '—'}</span> {r.name}
                            </span>
                            {r.is_bookable && (
                                <Badge variant={r.booking_is_paid ? 'warning' : 'success'}>
                                    {r.booking_is_paid ? `${fmtIDR(r.booking_rate_hourly)}/jam` : 'Gratis'}
                                </Badge>
                            )}
                        </div>
                        <div className="space-y-1.5 text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={!!r.is_bookable} onChange={(e) => onPatch(r.id, { is_bookable: e.target.checked })} className="rounded" />
                                Bisa dipinjam tenant
                            </label>
                            {r.is_bookable && (
                                <>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={!!r.booking_is_paid} onChange={(e) => onPatch(r.id, { booking_is_paid: e.target.checked })} className="rounded" />
                                        Berbayar <span className="text-xs text-slate-400">(hanya inwall-sewa)</span>
                                    </label>
                                    {r.booking_is_paid && (
                                        <label className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 shrink-0">Tarif/jam</span>
                                            <BookRateInput
                                                initial={r.booking_rate_hourly}
                                                onCommit={(val) => onPatch(r.id, { booking_rate_hourly: val })}
                                            />
                                        </label>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const BOOKING_STATUS = {
    requested: { label: 'Menunggu', variant: 'warning' },
    approved: { label: 'Disetujui', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
    cancelled: { label: 'Dibatalkan', variant: 'secondary' },
    completed: { label: 'Selesai', variant: 'default' },
};
const TENANT_TYPE_LABEL = {
    outwall: { label: 'Outwall · gratis', variant: 'success' },
    inwall_program: { label: 'Inwall program · gratis', variant: 'success' },
    inwall_rental: { label: 'Inwall sewa · bayar', variant: 'warning' },
    inwall: { label: 'Inwall · bayar', variant: 'warning' },
};

function BookingsTab() {
    const qc = useQueryClient();
    const [status, setStatus] = useState('');

    const { data: stats } = useQuery({
        queryKey: ['admin', 'room-bookings-stats'],
        queryFn: () => api.get('/api/admin/room-bookings-stats').then((r) => r.data),
    });
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'room-bookings', status],
        queryFn: () => api.get('/api/admin/room-bookings', { params: { status, per_page: 50 } }).then((r) => r.data),
    });

    const approve = useMutation({
        mutationFn: (id) => api.post(`/api/admin/room-bookings/${id}/approve`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'room-bookings'] }); qc.invalidateQueries({ queryKey: ['admin', 'room-bookings-stats'] }); },
        onError: (e) => alert(e.response?.data?.message || 'Gagal menyetujui.'),
    });
    const reject = useMutation({
        mutationFn: (id) => api.post(`/api/admin/room-bookings/${id}/reject`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'room-bookings'] }); qc.invalidateQueries({ queryKey: ['admin', 'room-bookings-stats'] }); },
    });

    const rows = data?.data || [];

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <StatCard label="Menunggu" value={stats?.requested ?? 0} icon={Clock} color="amber" />
                <StatCard label="Disetujui" value={stats?.approved ?? 0} icon={CheckCircle2} color="emerald" />
                <StatCard label="Pendapatan Booking" value={fmtIDRCompact(stats?.inwall_revenue ?? 0)} icon={Banknote} color="primary" />
                <StatCard label="Booking Outwall" value={stats?.outwall_count ?? 0} icon={DoorOpen} color="slate" />
            </div>

            <div className="flex gap-2 mb-3">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-slate-200 px-3 text-sm bg-white">
                    <option value="">Semua status</option>
                    {Object.entries(BOOKING_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-12 flex justify-center"><Spinner /></div>
                    ) : rows.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-sm">Belum ada peminjaman ruang.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                    <tr>
                                        <th className="text-left font-semibold px-4 py-2.5">Jadwal</th>
                                        <th className="text-left font-semibold px-4 py-2.5">Ruang</th>
                                        <th className="text-left font-semibold px-4 py-2.5">Pemohon</th>
                                        <th className="text-left font-semibold px-4 py-2.5">Keperluan</th>
                                        <th className="text-right font-semibold px-4 py-2.5">Biaya</th>
                                        <th className="text-left font-semibold px-4 py-2.5">Status</th>
                                        <th className="px-4 py-2.5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.map((b) => {
                                        const tt = TENANT_TYPE_LABEL[b.tenant_type] || TENANT_TYPE_LABEL.outwall;
                                        return (
                                            <tr key={b.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-2.5 whitespace-nowrap">
                                                    <div className="font-medium">{new Date(b.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                                    <div className="text-xs text-slate-500">{String(b.start_time).slice(0, 5)}–{String(b.end_time).slice(0, 5)}</div>
                                                </td>
                                                <td className="px-4 py-2.5">{b.slot?.name}</td>
                                                <td className="px-4 py-2.5">
                                                    <div className="font-medium">{b.user?.name}</div>
                                                    <Badge variant={tt.variant} className="mt-0.5 text-[10px]">{tt.label}</Badge>
                                                </td>
                                                <td className="px-4 py-2.5 max-w-[200px] truncate text-slate-600">{b.purpose}</td>
                                                <td className="px-4 py-2.5 text-right font-medium">{b.is_free ? <span className="text-emerald-600">Gratis</span> : fmtIDR(b.total_cost)}</td>
                                                <td className="px-4 py-2.5"><Badge variant={BOOKING_STATUS[b.status]?.variant || 'secondary'}>{BOOKING_STATUS[b.status]?.label || b.status}</Badge></td>
                                                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                                    {b.status === 'requested' && (
                                                        <div className="flex gap-1 justify-end">
                                                            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => approve.mutate(b.id)} disabled={approve.isPending}><Check className="h-3.5 w-3.5" /></Button>
                                                            <Button size="sm" variant="outline" className="h-7 px-2 text-rose-600" onClick={() => reject.mutate(b.id)} disabled={reject.isPending}><X className="h-3.5 w-3.5" /></Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function RentalsTab({ onSelect }) {
    const [filters, setFilters] = useState({ status: '', q: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'workspace-rentals', filters],
        queryFn: () => api.get('/api/admin/workspace-rentals', { params: { ...filters, per_page: 50 } }).then((r) => r.data),
    });

    const rows = data?.data || [];

    return (
        <>
            <Card className="mb-4">
                <CardContent className="p-3 flex gap-2 flex-wrap">
                    <Input
                        placeholder="Cari penyewa / nama usaha…"
                        value={filters.q}
                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                        className="max-w-xs"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                        className="h-9 rounded-md border border-slate-300 px-2 text-xs"
                    >
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
            ) : rows.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-slate-600">Belum ada permintaan sewa.</CardContent>
                </Card>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-3 py-2 text-left">Slot</th>
                                <th className="px-3 py-2 text-left">Penyewa</th>
                                <th className="px-3 py-2 text-left">Periode</th>
                                <th className="px-3 py-2 text-right">Nilai</th>
                                <th className="px-3 py-2 text-left">Pembayaran</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const st = STATUS_BADGE[r.status] || STATUS_BADGE.requested;
                                const paymentStatus = r.payment_first_paid_at && r.payment_second_paid_at
                                    ? { label: 'Lunas', cls: 'text-emerald-700' }
                                    : r.payment_first_paid_at
                                    ? { label: '1/2', cls: 'text-amber-700' }
                                    : { label: 'Belum', cls: 'text-rose-700' };

                                return (
                                    <tr key={r.id} className="hover:bg-amber-50/40">
                                        <td className="px-3 py-2 font-semibold">{r.slot?.name}</td>
                                        <td className="px-3 py-2">
                                            <div className="font-semibold">{r.business_name || r.renter_name}</div>
                                            <div className="text-[10px] text-slate-500">{r.renter_email}</div>
                                        </td>
                                        <td className="px-3 py-2 text-[11px]">
                                            <div>{new Date(r.start_date).toLocaleDateString('id-ID')}</div>
                                            <div className="text-slate-500">s/d {new Date(r.end_date).toLocaleDateString('id-ID')}</div>
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono">{fmtIDR(r.total_amount)}</td>
                                        <td className="px-3 py-2"><span className={`font-semibold text-[11px] ${paymentStatus.cls}`}>{paymentStatus.label}</span></td>
                                        <td className="px-3 py-2"><Badge variant={st.variant}>{st.label}</Badge></td>
                                        <td className="px-3 py-2 text-right">
                                            <button onClick={() => onSelect(r.id)} className="inline-flex items-center gap-1 text-primary-700 hover:underline font-semibold">
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
        </>
    );
}

function SlotsTab() {
    const qc = useQueryClient();
    const [editing, setEditing] = useState(null);

    const { data } = useQuery({
        queryKey: ['admin', 'workspace-slots'],
        queryFn: () => api.get('/api/admin/workspace-slots').then((r) => r.data.data),
    });

    const slots = (data || []).filter((s) => s.is_rentable);

    return (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600">
                    <tr>
                        <th className="px-3 py-2 text-left">Slot</th>
                        <th className="px-3 py-2 text-left">Tipe</th>
                        <th className="px-3 py-2 text-right">Tarif/Tahun</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Penyewa</th>
                        <th className="px-3 py-2 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {slots.map((s) => (
                        <tr key={s.id} className="hover:bg-amber-50/40">
                            <td className="px-3 py-2 font-semibold">{s.name}</td>
                            <td className="px-3 py-2 text-slate-600">{s.size_label || '—'}</td>
                            <td className="px-3 py-2 text-right font-mono">{fmtIDR(s.yearly_rate)}</td>
                            <td className="px-3 py-2"><Badge variant={s.status === 'available' ? 'success' : s.status === 'occupied' ? 'destructive' : 'warning'}>{SLOT_STATUS_LABEL[s.status]}</Badge></td>
                            <td className="px-3 py-2 text-[11px]">
                                {s.occupied_by ? (
                                    <>
                                        <div className="font-semibold">{s.occupied_by}</div>
                                        <div className="text-slate-500">sampai {s.occupied_until ? new Date(s.occupied_until).toLocaleDateString('id-ID') : '—'}</div>
                                    </>
                                ) : '—'}
                            </td>
                            <td className="px-3 py-2 text-right">
                                <button onClick={() => setEditing(s)} className="text-primary-700 hover:underline font-semibold">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editing && <SlotEditDialog slot={editing} onClose={() => setEditing(null)} onSaved={() => { qc.invalidateQueries({ queryKey: ['admin', 'workspace-slots'] }); setEditing(null); }} />}
        </div>
    );
}

function SlotEditDialog({ slot, onClose, onSaved }) {
    const [form, setForm] = useState({
        yearly_rate: slot.yearly_rate,
        is_rentable: slot.is_rentable,
        status: slot.status,
        notes: slot.notes || '',
    });

    const mutation = useMutation({
        mutationFn: () => api.patch(`/api/admin/workspace-slots/${slot.id}`, form),
        onSuccess: onSaved,
    });

    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold">Edit {slot.name}</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    <div>
                        <label className="text-xs font-semibold block mb-1">Tarif Tahunan (Rp)</label>
                        <Input type="number" value={form.yearly_rate} onChange={(e) => setForm({ ...form, yearly_rate: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold block mb-1">Status</label>
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm">
                            <option value="available">Tersedia</option>
                            <option value="reserved">Dipesan</option>
                            <option value="occupied">Disewa</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs flex items-center gap-2">
                            <input type="checkbox" checked={form.is_rentable} onChange={(e) => setForm({ ...form, is_rentable: e.target.checked })} />
                            Slot ini dapat disewa
                        </label>
                    </div>
                    <div>
                        <label className="text-xs font-semibold block mb-1">Catatan</label>
                        <textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                    </div>
                </div>
                <div className="px-5 py-3 border-t bg-slate-50 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Batal</Button>
                    <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                        {mutation.isPending ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function RentalDetailDialog({ id, onClose }) {
    const qc = useQueryClient();
    const { data } = useQuery({
        queryKey: ['admin', 'workspace-rentals', id],
        queryFn: () => api.get(`/api/admin/workspace-rentals/${id}`).then((r) => r.data.data),
    });

    const [adminNotes, setAdminNotes] = useState('');

    const refresh = () => {
        qc.invalidateQueries({ queryKey: ['admin', 'workspace-rentals'] });
        qc.invalidateQueries({ queryKey: ['admin', 'workspace-rentals', id] });
        qc.invalidateQueries({ queryKey: ['admin', 'workspace-slots'] });
        qc.invalidateQueries({ queryKey: ['admin', 'workspace', 'stats'] });
    };

    const approve = useMutation({
        mutationFn: () => api.post(`/api/admin/workspace-rentals/${id}/approve`, { admin_notes: adminNotes }),
        onSuccess: refresh,
    });

    const markPayment = useMutation({
        mutationFn: (term) => api.post(`/api/admin/workspace-rentals/${id}/mark-payment`, { term }),
        onSuccess: refresh,
    });

    const cancel = useMutation({
        mutationFn: () => api.post(`/api/admin/workspace-rentals/${id}/cancel`, { cancellation_reason: adminNotes || 'Dibatalkan oleh admin' }),
        onSuccess: () => { refresh(); onClose(); },
    });

    if (!data) {
        return (
            <Backdrop onClose={onClose} title="Memuat…">
                <div className="py-10 flex justify-center"><Spinner /></div>
            </Backdrop>
        );
    }

    const st = STATUS_BADGE[data.status] || STATUS_BADGE.requested;

    return (
        <Backdrop onClose={onClose} title={`Sewa #${data.id} — ${data.slot?.name}`}>
            <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Status</span><Badge variant={st.variant}>{st.label}</Badge></div>
                    <div className="flex justify-between"><span className="text-slate-500">Nomor Kontrak</span><span className="font-mono font-bold">{data.contract_number || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Penyewa</span><span className="font-semibold">{data.business_name || data.renter_name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Email</span><span>{data.renter_email}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Telepon</span><span>{data.renter_phone || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Periode</span><span>{new Date(data.start_date).toLocaleDateString('id-ID')} — {new Date(data.end_date).toLocaleDateString('id-ID')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total Biaya</span><span className="font-mono font-bold">{fmtIDR(data.total_amount)}</span></div>
                </div>

                <div className="border rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-sm mb-2">Pembayaran</h4>
                    <PaymentRow
                        label="Termin 1"
                        amount={data.payment_first}
                        due={data.payment_first_due}
                        paid={data.payment_first_paid_at}
                        onMarkPaid={() => markPayment.mutate('first')}
                        canMark={data.status === 'approved'}
                    />
                    <PaymentRow
                        label="Termin 2"
                        amount={data.payment_second}
                        due={data.payment_second_due}
                        paid={data.payment_second_paid_at}
                        onMarkPaid={() => markPayment.mutate('second')}
                        canMark={!!data.payment_first_paid_at}
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold block mb-1">Catatan Admin</label>
                    <textarea
                        rows="2"
                        defaultValue={data.admin_notes || ''}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full rounded-md border border-slate-300 p-2 text-sm"
                    />
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-3 border-t">
                    <Button variant="ghost" onClick={onClose}>Tutup</Button>
                    {data.contract_file_path && (
                        <>
                            <Button variant="outline" onClick={() => {
                                api.post(`/api/admin/workspace-rentals/${id}/regenerate-contract`).then(refresh);
                            }}>
                                <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                            </Button>
                            <Button onClick={async () => {
                                try {
                                    const res = await api.get(`/api/admin/workspace-rentals/${id}/contract`, { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                    const a = window.document.createElement('a');
                                    a.href = url;
                                    a.download = `Kontrak-${data.contract_number || id}.pdf`;
                                    window.document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                                } catch (e) { alert('Gagal download: ' + (e.response?.data?.message || e.message)); }
                            }}>
                                <FileDown className="h-4 w-4 mr-1" /> Download Kontrak
                            </Button>
                        </>
                    )}
                    {data.status === 'requested' && (
                        <>
                            <Button variant="destructive" onClick={() => cancel.mutate()}>
                                <XCircle className="h-4 w-4 mr-1" /> Tolak
                            </Button>
                            <Button onClick={() => approve.mutate()} disabled={approve.isPending}>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                {approve.isPending ? 'Menyetujui…' : 'Setujui & Generate Kontrak'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Backdrop>
    );
}

function PaymentRow({ label, amount, due, paid, onMarkPaid, canMark }) {
    return (
        <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex-1">
                <div className="font-semibold">{label}</div>
                <div className="text-slate-500">
                    {fmtIDR(amount)} · jatuh tempo {due ? new Date(due).toLocaleDateString('id-ID') : '—'}
                </div>
            </div>
            {paid ? (
                <Badge variant="success">Lunas {new Date(paid).toLocaleDateString('id-ID')}</Badge>
            ) : canMark ? (
                <Button size="sm" onClick={onMarkPaid}>Tandai Lunas</Button>
            ) : (
                <span className="text-slate-400 text-[11px]">Menunggu</span>
            )}
        </div>
    );
}

function Backdrop({ children, onClose, title }) {
    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" />
            <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-3 border-b flex items-center justify-between bg-slate-50">
                    <h2 className="text-base font-bold tracking-tight">{title}</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-slate-200"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">{children}</div>
            </div>
        </div>
    );
}

