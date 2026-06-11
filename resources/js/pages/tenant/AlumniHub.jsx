import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    GraduationCap, Users, ClipboardList, CheckCircle2, AlertCircle,
    ExternalLink, UserPlus, Search, Inbox, Send, X, Building2,
} from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

export default function AlumniHub() {
    const qc = useQueryClient();
    const [tab, setTab] = useState('overview');
    const [searchQ, setSearchQ] = useState('');
    const [connectTo, setConnectTo] = useState(null);

    const { data: hub, isLoading } = useQuery({
        queryKey: ['tenant', 'alumni-hub'],
        queryFn: () => api.get('/api/tenant/alumni-hub').then((r) => r.data),
    });

    const { data: network } = useQuery({
        queryKey: ['tenant', 'alumni-network', searchQ],
        queryFn: () => api.get('/api/tenant/alumni-network', { params: { q: searchQ } }).then((r) => r.data),
        enabled: hub?.is_alumni && tab === 'network',
    });

    const { data: requests } = useQuery({
        queryKey: ['tenant', 'alumni-pending-requests'],
        queryFn: () => api.get('/api/tenant/alumni-pending-requests').then((r) => r.data.data),
        enabled: hub?.is_alumni && tab === 'requests',
    });

    const respondMutation = useMutation({
        mutationFn: ({ id, action }) => api.post(`/api/tenant/alumni-connections/${id}/respond`, { action }).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tenant', 'alumni-pending-requests'] });
            qc.invalidateQueries({ queryKey: ['tenant', 'alumni-hub'] });
        },
    });

    if (isLoading) return <Spinner className="h-10 w-10 mx-auto text-emerald-600" />;

    if (! hub?.is_alumni) {
        return (
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-8 text-center max-w-2xl mx-auto">
                <GraduationCap className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <h2 className="font-bold text-lg">Belum Jadi Alumni</h2>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                    {hub?.message || 'Alumni Hub dibuka setelah tim Anda lulus inkubasi (Graduation di-ACC Kepala UPA).'}
                </p>
            </div>
        );
    }

    return (
        <>
            <header className="mb-5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <GraduationCap className="h-7 w-7 text-primary-700" /> Alumni Hub
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                    Selamat datang kembali, <strong>{hub.tenant.name}</strong>! Tetap terhubung dengan komunitas alumni PENSNOVA.
                </p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <StatCard label="Alumni Tersedia" value={hub.network.total_alumni} icon={Users} tone="primary" />
                <StatCard label="Koneksi Aktif" value={hub.network.my_connections} icon={CheckCircle2} tone="emerald" />
                <StatCard label="Permintaan Masuk" value={hub.network.pending_requests} icon={Inbox} tone="amber" highlight={hub.network.pending_requests > 0} />
                <StatCard label="Tracer Study" value={hub.tracer_study?.has_filled ? 'Selesai' : (hub.tracer_study ? 'Buka' : '—')} icon={ClipboardList} tone="violet" />
            </div>

            {hub.tracer_study && ! hub.tracer_study.has_filled && (
                <a
                    href={hub.tracer_study.url}
                    target="_blank"
                    rel="noopener"
                    className="block ring-1 ring-amber-300 rounded-2xl p-4 mb-5 transition group" style={{ background: '#fffbeb' }}
                >
                    <div className="flex items-center gap-3">
                        <ClipboardList className="h-8 w-8 text-amber-700 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900">Tracer Study: {hub.tracer_study.title}</div>
                            <div className="text-xs text-amber-800 mt-1">
                                Bantu UPA mengukur dampak program inkubasi — isi tracer dengan email Anda. Estimasi 5-10 menit.
                            </div>
                        </div>
                        <ExternalLink className="h-5 w-5 text-amber-700 group-hover:translate-x-0.5 transition" />
                    </div>
                </a>
            )}

            <div className="border-b border-slate-200 flex gap-1 mb-4">
                {[
                    ['overview', 'Overview'],
                    ['network', `Jaringan (${hub.network.total_alumni})`],
                    ['requests', `Permintaan (${hub.network.pending_requests})`],
                ].map(([k, label]) => (
                    <button
                        key={k}
                        onClick={() => setTab(k)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                            tab === k ? 'border-primary-700 text-primary-700' : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'overview' && <OverviewTab hub={hub} />}

            {tab === 'network' && (
                <NetworkTab
                    data={network}
                    searchQ={searchQ}
                    setSearchQ={setSearchQ}
                    onConnect={setConnectTo}
                />
            )}

            {tab === 'requests' && (
                <RequestsTab
                    requests={requests}
                    onAccept={(id) => respondMutation.mutate({ id, action: 'accept' })}
                    onDecline={(id) => respondMutation.mutate({ id, action: 'decline' })}
                    isPending={respondMutation.isPending}
                />
            )}

            {connectTo && (
                <ConnectDialog
                    target={connectTo}
                    onClose={() => setConnectTo(null)}
                    onSent={() => {
                        qc.invalidateQueries({ queryKey: ['tenant', 'alumni-network'] });
                        qc.invalidateQueries({ queryKey: ['tenant', 'alumni-hub'] });
                        setConnectTo(null);
                    }}
                />
            )}
        </>
    );
}

function OverviewTab({ hub }) {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5">
                <h3 className="font-bold mb-3">Status Tim Anda</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                    <Item label="Lulus pada" value={hub.tenant.graduated_at ? new Date(hub.tenant.graduated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                    <Item label="Revenue saat lulus" value={hub.tenant.annual_revenue_at_grad ? `Rp ${Number(hub.tenant.annual_revenue_at_grad).toLocaleString('id-ID')}` : '—'} />
                </dl>
            </div>

            <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5">
                <h3 className="font-bold mb-3">Apa yang Bisa Anda Lakukan Sebagai Alumni</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                    <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-primary-700 mt-0.5 shrink-0" />
                        <div>
                            <strong>Bangun jaringan alumni</strong> — request koneksi dengan startup lain untuk kolaborasi, mentor, atau co-founding.
                        </div>
                    </li>
                    <li className="flex items-start gap-2">
                        <ClipboardList className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <strong>Isi tracer study tahunan</strong> — bantu UPA mengukur dampak program & dapatkan rekomendasi continued partnership.
                        </div>
                    </li>
                    <li className="flex items-start gap-2">
                        <ExternalLink className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                        <div>
                            <strong>Jadi mentor batch berikutnya</strong> — hubungi UPA untuk mendaftar sebagai mentor di program inkubasi.
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}

function NetworkTab({ data, searchQ, setSearchQ, onConnect }) {
    return (
        <div>
            <div className="relative mb-4">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Cari alumni startup..."
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
            </div>

            {(data?.data || []).length === 0 ? (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-8 text-center">
                    <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-600">Tidak ada alumni lain yang cocok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.data.map((a) => (
                        <div key={a.id} className="bg-white rounded-2xl ring-1 ring-slate-200 p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0">
                                    <div className="font-bold text-slate-900">{a.name}</div>
                                    <div className="text-xs text-slate-500">{a.batch?.name || '—'}{a.sector_master ? ' · ' + a.sector_master.name : ''}</div>
                                </div>
                            </div>
                            {a.one_liner && <p className="text-xs text-slate-600 line-clamp-2 mb-3">{a.one_liner}</p>}
                            <div className="flex items-center gap-2">
                                <Link to={`/alumni/${a.slug}`} className="text-xs text-primary-700 hover:underline">Lihat profil →</Link>
                                <div className="ml-auto">
                                    {a.connection_status === 'accepted' ? (
                                        <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Terhubung
                                        </span>
                                    ) : a.connection_status === 'pending' ? (
                                        <span className="text-xs text-amber-700 font-semibold">{a.is_requester ? 'Menunggu jawaban' : 'Permintaan masuk'}</span>
                                    ) : a.connection_status === 'declined' ? (
                                        <span className="text-xs text-slate-500">Ditolak</span>
                                    ) : (
                                        <button
                                            onClick={() => onConnect(a)}
                                            className="text-xs px-2 py-1 rounded bg-primary-700 hover:bg-primary-800 text-white font-semibold inline-flex items-center gap-1"
                                        >
                                            <UserPlus className="h-3 w-3" /> Konek
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function RequestsTab({ requests, onAccept, onDecline, isPending }) {
    if (! requests || requests.length === 0) {
        return (
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-8 text-center">
                <Inbox className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-600">Tidak ada permintaan koneksi masuk.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {requests.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl ring-1 ring-amber-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-amber-100 text-amber-800 h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0">
                            {r.requester.name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold">{r.requester.name}</div>
                            {r.requester.one_liner && <p className="text-xs text-slate-600 mt-0.5">{r.requester.one_liner}</p>}
                            {r.intro_message && (
                                <div className="mt-2 text-sm bg-slate-50 ring-1 ring-slate-200 rounded p-2 whitespace-pre-wrap">
                                    {r.intro_message}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={() => onDecline(r.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 text-sm rounded hover:bg-slate-100"
                        >
                            Tolak
                        </button>
                        <button
                            onClick={() => onAccept(r.id)}
                            disabled={isPending}
                            className="px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                            <CheckCircle2 className="h-3 w-3 inline mr-1" /> Terima
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ConnectDialog({ target, onClose, onSent }) {
    const [message, setMessage] = useState('');

    const sendMutation = useMutation({
        mutationFn: () => api.post(`/api/tenant/alumni-connect/${target.slug}`, { intro_message: message }).then((r) => r.data),
        onSuccess: (res) => {
            alert(res.message);
            onSent();
        },
        onError: (err) => alert(err.response?.data?.message || 'Gagal kirim.'),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold">Konek dengan {target.name}</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>
                <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600">
                        Kirim pesan perkenalan singkat (opsional). {target.name} akan menerima permintaan koneksi Anda.
                    </p>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        placeholder="Mis: Halo! Saya tertarik berdiskusi tentang scaling product di sektor edutech."
                        maxLength={1000}
                        className="w-full rounded-md border border-slate-300 p-2 text-sm"
                    />
                    <div className="text-[10px] text-slate-400 text-right">{message.length}/1000</div>
                </div>
                <div className="p-3 border-t flex justify-end gap-2 bg-slate-50">
                    <button onClick={onClose} className="px-3 py-1.5 text-sm rounded hover:bg-slate-100">Batal</button>
                    <button
                        onClick={() => sendMutation.mutate()}
                        disabled={sendMutation.isPending}
                        className="px-4 py-1.5 text-sm rounded bg-primary-700 hover:bg-primary-800 text-white font-semibold inline-flex items-center gap-1"
                    >
                        <Send className="h-3 w-3" /> {sendMutation.isPending ? 'Mengirim…' : 'Kirim Permintaan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, tone = 'primary', highlight = false }) {
    const tones = {
        primary: 'bg-primary-50 text-primary-800',
        emerald: 'bg-emerald-50 text-emerald-800',
        amber: 'bg-amber-50 text-amber-800',
        violet: 'bg-violet-50 text-violet-800',
    };
    return (
        <div className={`rounded-2xl p-4 ring-1 ring-slate-200 ${highlight ? 'animate-pulse ring-amber-400' : ''}`}>
            <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${tones[tone]}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-2">{value}</div>
            <div className="text-xs text-slate-600 mt-1">{label}</div>
        </div>
    );
}

function Item({ label, value }) {
    return (
        <div>
            <dt className="text-xs text-slate-500 uppercase">{label}</dt>
            <dd className="font-semibold">{value}</dd>
        </div>
    );
}
