import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

export default function MentorDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['mentor', 'dashboard'],
        queryFn: () => api.get('/api/mentor/dashboard').then((r) => r.data),
    });

    if (isLoading) return <Spinner className="h-10 w-10 mx-auto text-sky-600" />;
    if (!data) return null;

    // Unwrap helper: backend bisa kirim array langsung atau wrapped {data:[]}.
    const unwrap = (x, fallback) => (x?.data !== undefined ? x.data : x) ?? fallback;
    const tenants = unwrap(data.tenants, []);
    const upcomingSessions = unwrap(data.upcoming_sessions, []);

    return (
        <>
            <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <Stat label="Tenant Binaan" value={data.kpi.total_tenants} />
                <Stat label="Sesi Mendatang" value={data.kpi.upcoming_sessions} />
                <Stat label="Sesi Bulan Ini" value={data.kpi.sessions_this_month} />
                <Stat label="Sesi Selesai" value={data.kpi.completed_sessions} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card title="Tenant Binaan" cta={{ to: '/dashboard/mentor/tenants', label: 'Detail →' }} className="lg:col-span-2">
                    {tenants.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada tenant binaan.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {tenants.map((t) => (
                                <li key={t.id} className="py-3 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold">{t.name}</div>
                                        <div className="text-xs text-slate-500">{t.sector} · {t.stage}</div>
                                    </div>
                                    <Link to={`/startups/${t.slug}`} className="shrink-0 text-xs text-sky-700 font-semibold">Lihat profil →</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Sesi Mendatang" cta={{ to: '/dashboard/mentor/sessions', label: 'Kelola →' }}>
                    {upcomingSessions.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada sesi.</p>
                    ) : (
                        <ul className="space-y-3">
                            {upcomingSessions.slice(0, 5).map((s) => (
                                <li key={s.id} className="text-sm">
                                    <div className="font-semibold">{new Date(s.scheduled_at).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="text-slate-600 text-xs">{s.tenant?.name} · {s.mode}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </>
    );
}

function Stat({ label, value }) {
    return <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-200"><div className="text-xl sm:text-2xl font-bold text-sky-700">{value}</div><div className="text-xs sm:text-sm text-slate-600 mt-1">{label}</div></div>;
}

function Card({ title, cta, children, className = '' }) {
    return (
        <section className={`bg-white rounded-2xl ring-1 ring-slate-200 p-5 ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base sm:text-lg">{title}</h2>
                {cta && <Link to={cta.to} className="text-xs sm:text-sm text-sky-700 font-semibold hover:underline">{cta.label}</Link>}
            </div>
            {children}
        </section>
    );
}
