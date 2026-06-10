import { useQuery } from '@tanstack/react-query';
import { GraduationCap, TrendingUp, Users, ClipboardList, Sparkles, Network } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { StatCard } from '../../components/ui/stat-card';
import Spinner from '../../components/Spinner';
import Skeleton from '../../components/Skeleton';

const fmtIDR = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

const STATUS_LABEL = {
    growing: 'Tumbuh & ekspansi',
    stable: 'Stabil beroperasi',
    struggling: 'Kesulitan',
    pivoted: 'Pivot ke bisnis lain',
    closed: 'Sudah tidak beroperasi',
};

export default function AlumniInsights() {
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'alumni-insights'],
        queryFn: () => api.get('/api/admin/alumni-insights').then((r) => r.data),
    });

    if (isLoading) {
        return (
            <div>
                <Skeleton height="h-8" width="w-1/3" className="mb-2" />
                <Skeleton height="h-4" width="w-2/3" className="mb-5" />
                <Skeleton.Stats count={4} />
            </div>
        );
    }
    if (! data) return null;

    const { overview, distribution, tracer_survey, recent_responses } = data;

    return (
        <div>
            <header className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="h-6 w-6 text-primary-700" />
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                        Alumni Insights
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                    Aggregat data alumni dari <strong>Graduations</strong> + <strong>Tracer Study responses</strong>.
                    Penting untuk evaluasi dampak program inkubasi & target peningkatan tahun berikutnya.
                </p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <StatCard label="Total Alumni" value={overview.total_alumni} icon={GraduationCap} color="primary" />
                <StatCard label="Tracer Responses" value={`${overview.tracer_responses} (${overview.tracer_response_rate}%)`} icon={ClipboardList} color="amber" />
                <StatCard label="Revenue saat Lulus" value={fmtIDR(overview.total_revenue_at_grad)} icon={TrendingUp} color="emerald" />
                <StatCard label="Avg Skor Monev" value={overview.avg_monev_score_at_grad ? Number(overview.avg_monev_score_at_grad).toFixed(1) : '—'} icon={Sparkles} color="violet" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-sm">Status Bisnis Alumni (Tracer)</h3>
                            <Network className="h-4 w-4 text-slate-400" />
                        </div>
                        {Object.keys(distribution.business_status).length === 0 ? (
                            <p className="text-xs text-slate-500">Belum ada response tracer.</p>
                        ) : (
                            <DistributionBars data={distribution.business_status} labels={STATUS_LABEL} total={overview.tracer_responses} />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-sm">Jaringan Alumni</h3>
                            <Users className="h-4 w-4 text-slate-400" />
                        </div>
                        <dl className="space-y-2 text-sm">
                            <Row label="Total Koneksi Diterima" value={overview.network_connections} tone="emerald" />
                            <Row label="Permintaan Pending" value={overview.pending_connections} tone="amber" />
                            <Row label="Rata-rata Impact Score Tracer" value={overview.avg_impact_score ? `${overview.avg_impact_score} / 5` : '—'} tone="violet" />
                        </dl>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-bold text-sm mb-3">Distribusi Annual Revenue</h3>
                        {Object.keys(distribution.annual_revenue).length === 0 ? (
                            <p className="text-xs text-slate-500">Belum ada response.</p>
                        ) : (
                            <DistributionBars data={distribution.annual_revenue} labels={{
                                '<100m': '< Rp 100 jt',
                                '100m-500m': 'Rp 100 – 500 jt',
                                '500m-2b': 'Rp 500 jt – 2 M',
                                '2b-10b': 'Rp 2 – 10 M',
                                '>10b': '> Rp 10 M',
                            }} total={overview.tracer_responses} />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-bold text-sm mb-3">Distribusi Ukuran Tim</h3>
                        {Object.keys(distribution.team_size).length === 0 ? (
                            <p className="text-xs text-slate-500">Belum ada response.</p>
                        ) : (
                            <DistributionBars data={distribution.team_size} labels={{
                                '1': 'Solo founder',
                                '2-5': '2-5 orang',
                                '6-10': '6-10 orang',
                                '11-25': '11-25 orang',
                                '>25': '> 25 orang',
                            }} total={overview.tracer_responses} />
                        )}
                    </CardContent>
                </Card>
            </div>

            {tracer_survey && (
                <Card className="mb-5">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-sm mb-1">Survey Tracer Aktif</h3>
                                <div className="text-xs text-slate-600 mb-2">{tracer_survey.title}</div>
                                <div className="font-mono text-[10px] text-slate-500 break-all">{tracer_survey.public_url}</div>
                            </div>
                            <a
                                href={tracer_survey.public_url}
                                target="_blank"
                                rel="noopener"
                                className="text-xs px-3 py-1.5 rounded bg-primary-700 hover:bg-primary-800 text-white font-semibold shrink-0"
                            >
                                Preview
                            </a>
                        </div>
                    </CardContent>
                </Card>
            )}

            {recent_responses.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-bold text-sm mb-3">5 Response Tracer Terbaru</h3>
                        <table className="w-full text-xs">
                            <thead className="text-slate-500 uppercase">
                                <tr>
                                    <th className="text-left py-1.5">Tanggal</th>
                                    <th className="text-left py-1.5">Status Bisnis</th>
                                    <th className="text-left py-1.5">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recent_responses.map((r, i) => (
                                    <tr key={i}>
                                        <td className="py-2">{new Date(r.submitted_at).toLocaleDateString('id-ID')}</td>
                                        <td className="py-2">{STATUS_LABEL[r.business_status] || r.business_status || '—'}</td>
                                        <td className="py-2">{r.impact ? `${r.impact} / 5` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function DistributionBars({ data, labels, total }) {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    return (
        <div className="space-y-2">
            {entries.map(([key, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                    <div key={key}>
                        <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-slate-700">{labels[key] || key}</span>
                            <span className="text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="bg-slate-100 h-2 rounded overflow-hidden">
                            <div className="bg-primary-600 h-full" style={{ width: pct + '%' }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function Row({ label, value, tone }) {
    const tones = {
        emerald: 'text-emerald-700',
        amber: 'text-amber-700',
        violet: 'text-violet-700',
    };
    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-600">{label}</span>
            <span className={`font-bold ${tones[tone] || 'text-slate-800'}`}>{value}</span>
        </div>
    );
}
