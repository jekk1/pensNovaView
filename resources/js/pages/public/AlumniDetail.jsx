import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    GraduationCap, ArrowLeft, Building2, Globe, Award, TrendingUp,
    Users, Calendar,
} from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import Skeleton from '../../components/Skeleton';

const fmtIDR = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

export default function AlumniDetail() {
    const { slug } = useParams();
    const { data, isLoading } = useQuery({
        queryKey: ['public', 'alumni', slug],
        queryFn: () => api.get(`/api/public/alumni/${slug}`).then((r) => r.data.data),
    });

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <Skeleton height="h-4" width="w-32" className="mb-4" />
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 mb-5">
                    <Skeleton height="h-8" width="w-2/3" className="mb-2" />
                    <Skeleton height="h-4" width="w-1/2" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2"><Skeleton.Card /></div>
                    <Skeleton.Card />
                </div>
            </div>
        );
    }
    if (! data) return <div className="max-w-3xl mx-auto p-8 text-center text-slate-500">Alumni tidak ditemukan.</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Link to="/alumni" className="text-sm text-primary-700 hover:underline inline-flex items-center mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke direktori alumni
            </Link>

            <header className="rounded-2xl ring-1 ring-primary-200 p-6 sm:p-8 mb-5" style={{ background: '#eef2f9' }}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded bg-primary-100 text-primary-800 font-semibold inline-flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> Alumni PENSNOVA
                    </span>
                    {data.batch && (
                        <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 font-semibold">
                            {data.batch.name}
                        </span>
                    )}
                    {data.sector && (
                        <span className="text-xs px-2 py-1 rounded bg-violet-100 text-violet-800 font-semibold">
                            {data.sector.name}
                        </span>
                    )}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">{data.name}</h1>
                {data.one_liner && <p className="text-base text-slate-700">{data.one_liner}</p>}
                {data.website && (
                    <a href={data.website} target="_blank" rel="noopener" className="inline-flex items-center mt-3 text-sm text-primary-700 hover:underline">
                        <Globe className="h-4 w-4 mr-1" /> {data.website}
                    </a>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-5">
                    {data.description && (
                        <Section title="Tentang Startup">
                            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">{data.description}</p>
                        </Section>
                    )}

                    {(data.achievements || []).length > 0 && (
                        <Section title="Pencapaian" tone="emerald">
                            <ul className="text-sm text-slate-700 space-y-2">
                                {data.achievements.map((a, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Award className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>{typeof a === 'string' ? a : a?.title}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    {(data.founders || []).length > 0 && (
                        <Section title="Tim Founders">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.founders.map((f) => (
                                    <div key={f.id} className="flex items-start gap-2 text-sm">
                                        <Users className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                                        <div>
                                            <div className="font-semibold">{f.name}</div>
                                            <div className="text-xs text-slate-500">{f.role || '—'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </div>

                <aside className="space-y-4">
                    {data.graduated_at && (
                        <div className="bg-white rounded-2xl ring-1 ring-primary-200 p-4">
                            <div className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">
                                <Calendar className="h-3 w-3 inline mr-1" /> Lulus pada
                            </div>
                            <div className="font-bold">{new Date(data.graduated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                    )}
                    {data.annual_revenue_at_grad && (
                        <div className="bg-emerald-50 rounded-2xl ring-1 ring-emerald-200 p-4">
                            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                                <TrendingUp className="h-3 w-3 inline mr-1" /> Revenue saat lulus
                            </div>
                            <div className="font-bold text-emerald-900">{fmtIDR(data.annual_revenue_at_grad)}</div>
                        </div>
                    )}
                    {data.monev_score && (
                        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Skor Monev Final</div>
                            <div className="font-bold text-slate-800 text-xl">{Number(data.monev_score).toFixed(1)} / 100</div>
                        </div>
                    )}

                    {(data.tech_stack || []).length > 0 && (
                        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tech Stack</div>
                            <div className="flex flex-wrap gap-1">
                                {data.tech_stack.map((t, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

function Section({ title, children, tone }) {
    const toneClass = tone === 'emerald' ? 'bg-emerald-50 ring-emerald-200' : 'bg-white ring-slate-200';
    return (
        <section className={`rounded-2xl ring-1 p-5 ${toneClass}`}>
            <h2 className="font-bold mb-3 text-slate-900">{title}</h2>
            {children}
        </section>
    );
}
