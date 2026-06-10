import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

export default function InvestorDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['investor', 'dashboard'],
        queryFn: () => api.get('/api/investor/dashboard').then((r) => r.data),
    });

    if (isLoading) return <Spinner className="h-10 w-10 mx-auto text-violet-600" />;
    if (!data) return null;

    // Unwrap helper: backend bisa kirim array langsung atau wrapped {data:[]}.
    const unwrap = (x, fallback) => (x?.data !== undefined ? x.data : x) ?? fallback;
    const matchedTenants = unwrap(data.matched_tenants, []);
    const recentMeetings = unwrap(data.recent_meetings, []);

    return (
        <>
            <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Investor Portal</h1>
                <p className="text-sm text-slate-600 mt-1">{data.investor.organization} · {data.investor.type}</p>
            </header>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                <Stat label="Total Meeting" value={data.kpi.total_meetings} />
                <Stat label="Pending" value={data.kpi.pending_meetings} />
                <Stat label="Startup Match" value={data.kpi.matched_tenants} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card title="Startup Match Sektor Anda" cta={{ to: '/startups', label: 'Browse semua →' }} className="lg:col-span-2">
                    {matchedTenants.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada startup yang cocok.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {matchedTenants.map((t) => (
                                <Link key={t.id} to={`/startups/${t.slug}`} className="p-3 rounded-lg bg-slate-50 hover:bg-violet-50 hover:ring-1 hover:ring-violet-200 transition block">
                                    <div className="font-semibold text-sm">{t.name}</div>
                                    <div className="text-xs text-slate-600 line-clamp-1">{t.one_liner}</div>
                                    <div className="flex gap-1 mt-2">
                                        <span className="text-xs px-2 py-0.5 rounded bg-white text-slate-700 ring-1 ring-slate-200 uppercase">{t.sector}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-white text-slate-700 ring-1 ring-slate-200">{t.stage}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>

                <Card title="Meeting Terbaru" cta={{ to: '/dashboard/investor/meetings', label: 'Semua →' }}>
                    {recentMeetings.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada meeting request. <Link to="/startups" className="text-violet-700 font-semibold">Browse startup →</Link></p>
                    ) : (
                        <ul className="space-y-3">
                            {recentMeetings.slice(0, 5).map((m) => (
                                <li key={m.id} className="text-sm">
                                    <div className="font-semibold truncate">{m.subject}</div>
                                    <div className="text-xs text-slate-600">{m.tenant?.name} · {m.status}</div>
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
    return <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-200"><div className="text-xl sm:text-2xl font-bold text-violet-700">{value}</div><div className="text-xs sm:text-sm text-slate-600 mt-1">{label}</div></div>;
}

function Card({ title, cta, children, className = '' }) {
    return (
        <section className={`bg-white rounded-2xl ring-1 ring-slate-200 p-5 ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base sm:text-lg">{title}</h2>
                {cta && <Link to={cta.to} className="text-xs sm:text-sm text-violet-700 font-semibold hover:underline">{cta.label}</Link>}
            </div>
            {children}
        </section>
    );
}
