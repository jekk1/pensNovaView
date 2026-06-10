import { useQuery } from '@tanstack/react-query';
import { Handshake, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import PageHero from '../../components/PageHero';

export default function Companies() {
    const { data, isLoading } = useQuery({
        queryKey: ['public', 'companies'],
        queryFn: () => api.get('/api/public/companies').then((r) => r.data),
    });

    const total = data?.meta?.total ?? data?.data?.length ?? 0;

    return (
        <div className="bg-slate-50">
            <PageHero
                eyebrow="🤝 Ekosistem Kolaborasi"
                title="Mitra"
                accent="Industri"
                subtitle={`${total} perusahaan yang telah menjalin kerjasama dengan PENSNOVA — MoU, PKS, kerjasama riset, distribusi teknologi.`}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton.Card key={i} />)}
                </div>
            ) : ! data?.data?.length ? (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-12 text-center">
                    <Handshake className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="font-bold mb-1">Belum Ada Mitra Terdaftar</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Daftar mitra industri akan tampil di sini setelah MoU/PKS terdaftar di sistem.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {data.data.map((c) => (
                        <div key={c.id} className="bg-white rounded-2xl p-5 sm:p-6 ring-1 ring-slate-200 hover:ring-primary-300 hover:shadow-md transition flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <h3 className="font-bold text-base sm:text-lg line-clamp-2">{c.name}</h3>
                                {c.mou_status === 'signed' && (
                                    <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold inline-flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> MoU
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-1">{c.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                                {c.sector && (
                                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium uppercase">{c.sector}</span>
                                )}
                                {c.city && (
                                    <span className="text-slate-500 inline-flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {c.city}
                                    </span>
                                )}
                            </div>
                            {c.interests?.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tertarik kolaborasi</div>
                                    <div className="flex flex-wrap gap-1">
                                        {c.interests.slice(0, 4).map((i) => (
                                            <span key={i.id} className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 font-medium">
                                                {i.collaboration_type.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}
