import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Lightbulb, ShieldCheck, TrendingUp, Search } from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import PageHero from '../../components/PageHero';
import Animate from '../../components/Animate';

const STATUS_BADGE = {
    ready_to_commercialize: { label: 'Siap Komersialisasi', tone: 'bg-emerald-100 text-emerald-800' },
    commercialized: { label: 'Sudah Dikomersialisasi', tone: 'bg-violet-100 text-violet-800' },
};

const MOCK_INNOVATIONS = [
    {
        id: 1,
        slug: 'sistem-monitoring-iot',
        title: 'Sistem Monitoring Energi Berbasis IoT',
        status: 'ready_to_commercialize',
        linked_patent: true,
        description: 'Sistem pemantau konsumsi energi listrik gedung terintegrasi IoT dengan akurasi 98.5% untuk efisiensi operasional.',
        current_trl_level: 7,
        current_mrl_score: 8.0,
        primary_inventor_name: 'Dr. Eng. Bambang, M.T.'
    },
    {
        id: 2,
        slug: 'robot-patroli-keamanan',
        title: 'Robot Patroli Otonom Kampus PENS',
        status: 'ready_to_commercialize',
        linked_patent: true,
        description: 'Robot otonom patroli keamanan malam dengan transmisi video live, deteksi wajah, dan sensor rintangan LiDAR.',
        current_trl_level: 6,
        current_mrl_score: 7.2,
        primary_inventor_name: 'Ir. Anang, M.Eng.'
    },
    {
        id: 3,
        slug: 'filter-air-bersih-pedesaan',
        title: 'Filter Air Portabel Sistem Membran',
        status: 'commercialized',
        linked_patent: false,
        description: 'Teknologi filter air bersih portabel skala desa menggunakan sistem membran mikrofiltrasi yang tahan lama.',
        current_trl_level: 8,
        current_mrl_score: 9.0,
        primary_inventor_name: 'Dr. Indah, S.Si.'
    }
];

export default function InnovationsList() {
    const [params, setParams] = useSearchParams();
    const q = params.get('q') || '';
    const category = params.get('category') || '';

    const { data, isLoading, error } = useQuery({
        queryKey: ['public', 'innovations', { q, category }],
        queryFn: () => api.get('/api/public/innovations', { params: { q, category, per_page: 12 } }).then((r) => r.data),
    });

    return (
        <div className="bg-slate-50">
            <PageHero
                eyebrow="Innovation Hub"
                title="Produk"
                accent="Inovasi"
                titleAfter=" PENSNOVA"
                subtitle={`${data?.meta?.total ?? '—'} produk inovasi dosen PENS siap untuk lisensi, kemitraan komersial, atau riset kolaboratif. Setiap produk lulus pengukuran TKT (BRIN) & MRL (CloudWatch2) — siap untuk industri.`}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

            <form
                className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 p-4 bg-white rounded-xl ring-1 ring-slate-200"
                onSubmit={(e) => {
                    e.preventDefault();
                    const next = new URLSearchParams(params);
                    const v = e.target.q.value;
                    v ? next.set('q', v) : next.delete('q');
                    setParams(next);
                }}
            >
                <input
                    name="q"
                    defaultValue={q}
                    placeholder="Cari produk, inventor, atau kata kunci…"
                    className="md:col-span-3 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
            </form>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton.Card key={i} />)}
                </div>
            ) : error || !data?.data ? (
                <div>
                    <div className="mb-6 p-4 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 ring-1 ring-amber-200">
                        Peringatan: Gagal terhubung ke API backend. Menampilkan data demo/offline agar visual tetap berjalan.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {MOCK_INNOVATIONS.map((p, i) => {
                            const status = STATUS_BADGE[p.status] || { label: p.status, tone: 'bg-slate-100 text-slate-700' };
                            return (
                                <Animate key={p.id} variant="scale-in" delay={(i % 3) + 1}>
                                    <Link
                                        to={`/produk-inovasi/${p.slug}`}
                                        className="group p-5 rounded-2xl bg-white hover:bg-primary-50 ring-1 ring-slate-200 hover:ring-primary-300 transition flex flex-col card-lift h-full"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-base sm:text-lg group-hover:text-primary-700 line-clamp-2">{p.title}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${status.tone}`}>
                                                {status.label}
                                            </span>
                                            {p.linked_patent && (
                                                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium inline-flex items-center gap-1">
                                                    <ShieldCheck className="h-3 w-3" /> HKI terdaftar
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3 line-clamp-3 flex-1">{p.description}</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs mt-auto pt-3 border-t border-slate-100">
                                            {p.current_trl_level && (
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                                                    TKT {p.current_trl_level}
                                                </div>
                                            )}
                                            {p.current_mrl_score && (
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Lightbulb className="h-3 w-3 text-amber-600" />
                                                    MRL {Number(p.current_mrl_score).toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-slate-500 truncate">
                                            Inventor: <span className="font-semibold text-slate-700">{p.primary_inventor_name}</span>
                                        </div>
                                    </Link>
                                </Animate>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {data.data.length === 0 ? (
                        <p className="md:col-span-2 lg:col-span-3 text-slate-500 text-center py-12">
                            Belum ada produk inovasi yang siap untuk publik. Cek lagi nanti.
                        </p>
                    ) : (
                        data.data.map((p, i) => {
                            const status = STATUS_BADGE[p.status] || { label: p.status, tone: 'bg-slate-100 text-slate-700' };
                            return (
                                <Animate key={p.id} variant="scale-in" delay={(i % 3) + 1}>
                                    <Link
                                        to={`/produk-inovasi/${p.slug}`}
                                        className="group p-5 rounded-2xl bg-white hover:bg-primary-50 ring-1 ring-slate-200 hover:ring-primary-300 transition flex flex-col card-lift h-full"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-base sm:text-lg group-hover:text-primary-700 line-clamp-2">{p.title}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${status.tone}`}>
                                                {status.label}
                                            </span>
                                            {p.linked_patent && (
                                                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium inline-flex items-center gap-1">
                                                    <ShieldCheck className="h-3 w-3" /> HKI terdaftar
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3 line-clamp-3 flex-1">{p.description}</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs mt-auto pt-3 border-t border-slate-100">
                                            {p.current_trl_level && (
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                                                    TKT {p.current_trl_level}
                                                </div>
                                            )}
                                            {p.current_mrl_score && (
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Lightbulb className="h-3 w-3 text-amber-600" />
                                                    MRL {Number(p.current_mrl_score).toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-slate-500 truncate">
                                            Inventor: <span className="font-semibold text-slate-700">{p.primary_inventor_name}</span>
                                        </div>
                                    </Link>
                                </Animate>
                            );
                        })
                    )}
                </div>
            )}

            <div className="mt-10 bg-gradient-to-br from-primary-50 to-amber-50 ring-1 ring-primary-100 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold mb-2">Tertarik dengan salah satu produk?</h2>
                <p className="text-sm text-slate-700 max-w-2xl">
                    Setiap produk memiliki tombol <strong>"Tertarik untuk Lisensi"</strong> di halaman detail. Tim Divisi Knowledge Asset Management UPA akan menghubungi Anda dalam 2-3 hari kerja untuk pembahasan lebih lanjut.
                </p>
            </div>
            </div>
        </div>
    );
}

/*
## PENJELASAN CODE:

### InnovationsList()
- Fungsi: Komponen halaman direktori produk inovasi siap komersialisasi dari dosen & peneliti PENS.
- Parameter: Tidak ada.
- Return: Elemen visual JSX direktori produk inovasi.
- Cara pakai: <InnovationsList />
- Catatan: Menambahkan visual card-lift dan staggered scale-in list melalui wrapper Animate agar layout direktori responsif dan tidak kaku.
*/
