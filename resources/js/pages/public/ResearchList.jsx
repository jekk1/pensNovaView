import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import PageHero from '../../components/PageHero';
import Animate from '../../components/Animate';

const MOCK_RESEARCH = [
    {
        id: 1,
        slug: 'sistem-irigasi-cerdas',
        title: 'Sistem Pengairan & Pemupukan Otomatis Berbasis Sensor IoT',
        technology_readiness: 7,
        abstract: 'Riset mengenai teknologi irigasi presisi berbasis IoT yang mendeteksi kelembaban tanah dan kadar nitrogen untuk optimasi air dan pupuk.',
        keywords: ['IoT', 'Smart Agriculture', 'Sensor', 'Automation'],
        tenant: { name: 'AgriShield' }
    },
    {
        id: 2,
        slug: 'asisten-ai-belajar',
        title: 'Model Generative AI untuk Personalisasi Pembelajaran SMK',
        technology_readiness: 6,
        abstract: 'Riset dan implementasi AI adaptif menggunakan Large Language Model untuk membantu pengajaran praktikum kejuruan.',
        keywords: ['Generative AI', 'Adaptive Learning', 'Edutech', 'LLM'],
        tenant: { name: 'EduLink' }
    },
    {
        id: 3,
        slug: 'deteksi-dini-paru',
        title: 'Diagnosis Kanker Paru Menggunakan Deep Convolutional Neural Networks',
        technology_readiness: 8,
        abstract: 'Pengembangan model deteksi dini tumor paru melalui pengolahan citra medis CT-scan dengan akurasi klasifikasi mencapai 96.7%.',
        keywords: ['Computer Vision', 'Deep Learning', 'Healthtech', 'Cancer Detection'],
        tenant: { name: 'Mediscan' }
    }
];

export default function ResearchList() {
    const [params, setParams] = useSearchParams();
    const sector = params.get('sector') || '';
    const q = params.get('q') || '';

    const { data, isLoading, error } = useQuery({
        queryKey: ['public', 'research', { sector, q }],
        queryFn: () => api.get('/api/public/research', { params: { sector, q, per_page: 12 } }).then((r) => r.data),
    });

    return (
        <div className="bg-slate-50">
            <PageHero
                eyebrow="Riset Terapan"
                title="Topik"
                accent="Riset"
                titleAfter=" Terbuka"
                subtitle={`${data?.meta?.total ?? '—'} riset siap untuk kolaborasi industri — lisensi teknologi, joint research, atau spin-off.`}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

            <form className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 p-4 bg-white rounded-xl ring-1 ring-slate-200" onSubmit={(e) => { e.preventDefault(); const next = new URLSearchParams(params); const v = e.target.q.value; v ? next.set('q', v) : next.delete('q'); setParams(next); }}>
                <input name="q" defaultValue={q} placeholder="Cari judul atau abstrak…" className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                <select value={sector} onChange={(e) => { const next = new URLSearchParams(params); e.target.value ? next.set('sector', e.target.value) : next.delete('sector'); setParams(next); }} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">
                    <option value="">Semua Sektor</option>
                    {['agritech','edutech','fintech','healthtech','iot','ai-ml','creative','sustainability','manufacturing','logistics'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </form>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton.Card key={i} />)}
                </div>
            ) : error || !data?.data ? (
                <div>
                    <div className="mb-6 p-4 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 ring-1 ring-amber-200">
                        Peringatan: Gagal terhubung ke API backend. Menampilkan data demo/offline agar visual tetap berjalan.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {MOCK_RESEARCH.map((r, i) => (
                            <Animate key={r.id} variant="scale-in" delay={(i % 2) + 1}>
                                <Link to={`/riset/${r.slug}`} className="group p-5 sm:p-6 rounded-2xl bg-white hover:bg-primary-50 ring-1 ring-slate-200 hover:ring-primary-300 transition block card-lift h-full">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-base sm:text-lg group-hover:text-primary-700 line-clamp-2">{r.title}</h3>
                                        {r.technology_readiness && (
                                            <span className="shrink-0 text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-600 font-bold">TRL {r.technology_readiness}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{r.abstract}</p>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {(r.keywords || []).slice(0, 5).map((kw) => (
                                            <span key={kw} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">{kw}</span>
                                        ))}
                                    </div>
                                    {r.tenant && <div className="text-xs text-slate-500">oleh <strong>{r.tenant.name}</strong></div>}
                                </Link>
                            </Animate>
                        ))}
                    </div>
                </div>
            ) : data.data.length === 0 ? (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-12 text-center">
                    <Search className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="font-bold mb-1">Tidak ada riset yang cocok</h3>
                    <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {data.data.map((r, i) => (
                        <Animate key={r.id} variant="scale-in" delay={(i % 2) + 1}>
                            <Link to={`/riset/${r.slug}`} className="group p-5 sm:p-6 rounded-2xl bg-white hover:bg-primary-50 ring-1 ring-slate-200 hover:ring-primary-300 transition block card-lift h-full">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-base sm:text-lg group-hover:text-primary-700 line-clamp-2">{r.title}</h3>
                                    {r.technology_readiness && (
                                        <span className="shrink-0 text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-600 font-bold">TRL {r.technology_readiness}</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{r.abstract}</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {(r.keywords || []).slice(0, 5).map((kw) => (
                                        <span key={kw} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">{kw}</span>
                                    ))}
                                </div>
                                {r.tenant && <div className="text-xs text-slate-500">oleh <strong>{r.tenant.name}</strong></div>}
                            </Link>
                        </Animate>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}

/*
## PENJELASAN CODE:

### ResearchList()
- Fungsi: Komponen halaman direktori topik riset terapan kampus terbuka PENSNOVA.
- Parameter: Tidak ada.
- Return: Elemen visual JSX direktori riset.
- Cara pakai: <ResearchList />
- Catatan: Menambahkan visual card-lift dan staggered scale-in list melalui wrapper Animate agar layout direktori responsif dan tidak kaku.
*/
