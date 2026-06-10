import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import GamificationWidget from '../../components/GamificationWidget';

export default function TenantDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['tenant', 'dashboard'],
        queryFn: () => api.get('/api/tenant/dashboard').then((r) => r.data),
    });

    if (isLoading) {
        return (
            <>
                <header className="mb-6">
                    <Skeleton height="h-8" width="w-1/2" className="mb-2" />
                    <Skeleton height="h-4" width="w-2/3" />
                </header>
                <Skeleton.Stats count={4} />
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2"><Skeleton.Card /></div>
                    <Skeleton.Card />
                </div>
            </>
        );
    }
    if (!data) return null;

    // Backend bisa wrap dalam ResourceCollection ({data: [...]}) atau kirim array
    // langsung. Helper unwrap untuk robust handling.
    const unwrap = (x, fallback) => (x?.data !== undefined ? x.data : x) ?? fallback;
    const t = unwrap(data.tenant, {});
    const k = data.kpi || {};
    const milestones = unwrap(data.milestones, []);
    const upcomingSessions = unwrap(data.upcoming_sessions, []);
    const latestReport = data.latest_report ? unwrap(data.latest_report, null) : null;

    return (
        <>
            <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Halo, {t.name}!</h1>
                <p className="text-slate-600 text-sm mt-1">{t.one_liner}</p>
            </header>

            {/* Gamifikasi widget — XP, level, badges, streak */}
            <div className="mb-6">
                <GamificationWidget />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <Stat label="Milestone Tercapai" value={`${k.achieved_milestones}/${k.total_milestones}`} accent="emerald" />
                <Stat label="Milestone Overdue" value={k.overdue_milestones} accent={k.overdue_milestones > 0 ? 'rose' : 'slate'} />
                <Stat label="Riset Terdaftar" value={k.total_research} accent="violet" />
                <Stat label="Sesi Bulan Ini" value={k.sessions_this_month} accent="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card title="Milestone Aktif" cta={{ to: '/dashboard/tenant/milestones', label: 'Kelola →' }} className="lg:col-span-2">
                    {milestones.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada milestone. <Link to="/dashboard/tenant/milestones" className="text-emerald-700 font-semibold">Tambah →</Link></p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {milestones.map((m) => (
                                <li key={m.id} className="py-3 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm truncate">{m.title}</div>
                                        <div className="text-xs text-slate-500">Due: {m.due_date}</div>
                                    </div>
                                    <StatusPill status={m.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Sesi Mendatang" cta={{ to: '/dashboard/tenant/sessions', label: 'Semua →' }}>
                    {upcomingSessions.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada sesi terjadwal.</p>
                    ) : (
                        <ul className="space-y-3">
                            {upcomingSessions.slice(0, 3).map((s) => (
                                <li key={s.id} className="text-sm">
                                    <div className="font-semibold">{new Date(s.scheduled_at).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="text-slate-600 text-xs truncate">{s.mentor?.name} · {s.mode}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <div className="mt-6">
                <Link
                    to="/feedback"
                    className="block bg-gradient-to-r from-amber-50 to-amber-100 ring-1 ring-amber-200 rounded-2xl p-4 hover:from-amber-100 hover:to-amber-200 transition group"
                >
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">📝</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-amber-900">Beri Feedback Layanan UPA</div>
                            <div className="text-xs text-amber-800 mt-0.5">Bantu kami tingkatkan layanan inkubasi & teknologi — isi survey kepuasan (anonim, ±3 menit).</div>
                        </div>
                        <div className="text-amber-700 font-semibold text-sm group-hover:translate-x-0.5 transition">→</div>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
                <Card title="Laporan Progress Terakhir" cta={{ to: '/dashboard/tenant/progress-reports', label: 'Semua →' }}>
                    {latestReport ? (
                        <div className="space-y-2 text-sm">
                            <div className="font-semibold">{latestReport.period_label}</div>
                            {latestReport.revenue !== null && latestReport.revenue !== undefined && (
                                <div className="text-slate-600">Revenue: Rp {Number(latestReport.revenue).toLocaleString('id-ID')}</div>
                            )}
                            <div className="text-slate-600">Tim: {latestReport.team_size || '—'} orang</div>
                            <p className="text-slate-700 line-clamp-3 text-sm">{latestReport.narrative}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Belum ada laporan. <Link to="/dashboard/tenant/progress-reports" className="text-emerald-700 font-semibold">Buat sekarang →</Link></p>
                    )}
                </Card>

                <Card title="Tentang Startup" cta={{ to: `/startups/${t.slug}`, label: 'Lihat halaman publik →' }}>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <Field label="Sektor" value={t.sector} />
                        <Field label="Tahap" value={t.stage} />
                        <Field label="Status" value={t.status} />
                        <Field label="Published" value={t.is_published ? 'Ya' : 'Tidak'} />
                    </dl>
                </Card>
            </div>
        </>
    );
}

function Stat({ label, value, accent = 'emerald' }) {
    const colors = {
        emerald: 'text-emerald-700',
        rose: 'text-rose-600',
        violet: 'text-violet-700',
        amber: 'text-amber-600',
        slate: 'text-slate-700',
    };
    return (
        <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-200">
            <div className={`text-xl sm:text-2xl font-bold ${colors[accent]}`}>{value}</div>
            <div className="text-xs sm:text-sm text-slate-600 mt-1">{label}</div>
        </div>
    );
}

function Card({ title, cta, children, className = '' }) {
    return (
        <section className={`bg-white rounded-2xl ring-1 ring-slate-200 p-5 ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base sm:text-lg">{title}</h2>
                {cta && <Link to={cta.to} className="text-xs sm:text-sm text-emerald-700 font-semibold hover:underline">{cta.label}</Link>}
            </div>
            {children}
        </section>
    );
}

function StatusPill({ status }) {
    const colors = {
        planned: 'bg-slate-100 text-slate-700',
        in_progress: 'bg-amber-50 text-amber-700',
        achieved: 'bg-emerald-50 text-emerald-700',
        missed: 'bg-rose-50 text-rose-700',
    };
    const safeStatus = status || 'planned';
    return <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${colors[safeStatus] || 'bg-slate-100 text-slate-700'}`}>{safeStatus.replace('_', ' ')}</span>;
}

function Field({ label, value }) {
    return (
        <div>
            <dt className="text-xs text-slate-500 uppercase">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}
