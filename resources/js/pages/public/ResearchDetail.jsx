import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import { SearchX } from 'lucide-react';

export default function ResearchDetail() {
    const { slug } = useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ['public', 'research', slug],
        queryFn: () => api.get(`/api/public/research/${slug}`).then((r) => r.data.data),
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <Skeleton height="h-4" width="w-20" className="mb-6" />
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6">
                    <Skeleton height="h-8" width="w-3/4" className="mb-2" />
                    <Skeleton height="h-4" width="w-1/2" className="mb-6" />
                    <Skeleton.Text lines={6} />
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="bg-rose-50 ring-1 ring-rose-200 rounded-2xl p-8">
                    <SearchX className="h-10 w-10 mx-auto text-rose-400 mb-3" />
                    <h2 className="text-xl font-bold text-rose-900">Riset Tidak Ditemukan</h2>
                    <Link to="/riset" className="inline-block mt-4 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold">← Kembali ke Riset</Link>
                </div>
            </div>
        );
    }

    const r = data;
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Link to="/riset" className="inline-flex items-center gap-1 text-sm text-primary-700 mb-6 hover:underline">← Kembali</Link>

            <article className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-8">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold uppercase">{r.stage}</span>
                    {r.technology_readiness && <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold">TRL {r.technology_readiness}</span>}
                    {(r.sectors || []).map((s) => (
                        <span key={s} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium uppercase">{s}</span>
                    ))}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{r.title}</h1>
                {r.tenant && (
                    <p className="mt-2 text-slate-600 text-sm">
                        Diteliti oleh <Link to={`/startup/${r.tenant.slug}`} className="text-primary-700 font-semibold hover:underline">{r.tenant.name}</Link>
                    </p>
                )}

                <div className="mt-6">
                    <h2 className="text-base sm:text-lg font-bold mb-2">Abstrak</h2>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">{r.abstract}</p>

                    {r.keywords?.length > 0 && (
                        <>
                            <h3 className="text-sm font-bold mt-6 mb-2">Kata Kunci</h3>
                            <div className="flex flex-wrap gap-1">
                                {r.keywords.map((kw) => (
                                    <span key={kw} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">{kw}</span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {r.open_for_collaboration && (
                    <div className="mt-6 p-5 rounded-xl text-white" style={{ background: '#0d1830' }}>
                        <h3 className="font-bold text-lg mb-1">Terbuka untuk Kolaborasi</h3>
                        <p className="text-sm text-primary-100 mb-3">Perusahaan dapat menghubungi tim PENSNOVA untuk pilot project, lisensi, atau kerjasama riset.</p>
                        {r.tenant && (
                            <Link to={`/startup/${r.tenant.slug}`} className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-500 text-primary-900 text-sm font-bold hover:bg-amber-400">
                                Hubungi {r.tenant.name} →
                            </Link>
                        )}
                    </div>
                )}
            </article>
        </div>
    );
}
