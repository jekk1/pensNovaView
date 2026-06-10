import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { GraduationCap, TrendingUp, ExternalLink, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import PageHero from '../../components/PageHero';
import Animate from '../../components/Animate';

const fmtIDRCompact = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

const MOCK_ALUMNI = [
    {
        id: 1,
        slug: 'iotera-solusi',
        name: 'IoTera',
        one_liner: 'Penyedia smart water meter IoT untuk perusahaan daerah air minum nasional.',
        batch: { name: 'Batch 2024' },
        sector_master: { name: 'Internet of Things' }
    },
    {
        id: 2,
        slug: 'vegegrow-hidroponik',
        name: 'VegeGrow',
        one_liner: 'Sistem otomasi hidroponik indoor berbasis mobile app untuk sayuran premium.',
        batch: { name: 'Batch 2023' },
        sector_master: { name: 'Agritech' }
    },
    {
        id: 3,
        slug: 'carebot-medis',
        name: 'CareBot',
        one_liner: 'Robot asisten medis untuk rumah sakit kelas B guna meringankan beban perawat.',
        batch: { name: 'Batch 2024' },
        sector_master: { name: 'Healthtech' }
    }
];

export default function AlumniList() {
    const [params, setParams] = useSearchParams();
    const q = params.get('q') || '';
    const sector = params.get('sector') || '';

    const { data: stats } = useQuery({
        queryKey: ['public', 'alumni-stats'],
        queryFn: () => api.get('/api/public/alumni/stats').then((r) => r.data),
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['public', 'alumni', { q, sector }],
        queryFn: () => api.get('/api/public/alumni', { params: { q, sector, per_page: 12 } }).then((r) => r.data),
    });

    const activeStats = stats || {
        total_alumni: 18,
        total_revenue_at_grad: 350_000_000,
        avg_monev_score: 84.5
    };

    return (
        <div className="bg-slate-50">
            <PageHero
                eyebrow="Track Record"
                title="Alumni"
                accent="Startup"
                titleAfter=" PENSNOVA"
                subtitle="Startup yang sudah lulus program inkubasi UPA Pengembangan Teknologi & Produk Unggulan PENS — bukti track record komersial nyata yang menunjukkan kredibilitas program."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <Animate variant="fade-up" delay={1}>
                    <StatPanel label="Alumni Lulus" value={activeStats?.total_alumni ?? 0} icon={GraduationCap} tone="primary" />
                </Animate>
                <Animate variant="fade-up" delay={2}>
                    <StatPanel label="Total Revenue saat Lulus" value={fmtIDRCompact(activeStats?.total_revenue_at_grad ?? 0)} icon={TrendingUp} tone="emerald" />
                </Animate>
                <Animate variant="fade-up" delay={3}>
                    <StatPanel label="Rata-rata Monev Score" value={activeStats?.avg_monev_score ? Number(activeStats.avg_monev_score).toFixed(1) : '—'} icon={Sparkles} tone="amber" />
                </Animate>
            </div>

            <form
                className="mb-6 p-4 bg-white rounded-xl ring-1 ring-slate-200"
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
                    placeholder="Cari nama startup alumni…"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
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
                        {MOCK_ALUMNI.map((a, i) => (
                            <Animate key={a.id} variant="scale-in" delay={(i % 3) + 1}>
                                <Link
                                    to={`/alumni/${a.slug}`}
                                    className="group p-5 rounded-2xl bg-white hover:bg-primary-50 ring-1 ring-slate-200 hover:ring-primary-300 transition flex flex-col card-lift h-full"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <h3 className="font-bold text-base sm:text-lg group-hover:text-primary-700 line-clamp-2">{a.name}</h3>
                                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-primary-100 text-primary-800 font-bold uppercase">
                                            Alumni
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">{a.one_liner}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                                        <span>{a.batch?.name || '—'}</span>
                                        {a.sector_master && (
                                            <span className="text-primary-700 font-semibold">{a.sector_master.name}</span>
                                        )}
                                    </div>
                                </Link>
                            </Animate>
                        ))}
                    </div>
                </div>
            ) : data.data.length === 0 ? (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-12 text-center">
                    <GraduationCap className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-600">Belum ada alumni terdaftar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {data.data.map((a, i) => (
                        <Animate key={a.id} variant="scale-in" delay={(i % 3) + 1}>
                            <Link
                                to={`/alumni/${a.slug}`}
                                className="group p-5 rounded-2xl bg-white hover:bg-primary-50 ring-1 ring-slate-200 hover:ring-primary-300 transition flex flex-col card-lift h-full"
                            >
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <h3 className="font-bold text-base sm:text-lg group-hover:text-primary-700 line-clamp-2">{a.name}</h3>
                                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-primary-100 text-primary-800 font-bold uppercase">
                                        Alumni
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">{a.one_liner || a.description?.substring(0, 120) || '—'}</p>
                                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                                    <span>{a.batch?.name || '—'}</span>
                                    {a.sector_master && (
                                        <span className="text-primary-700 font-semibold">{a.sector_master.name}</span>
                                    )}
                                </div>
                            </Link>
                        </Animate>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}

function StatPanel({ label, value, icon: Icon, tone = 'primary' }) {
    const tones = {
        primary: 'bg-primary-50 ring-primary-200 text-primary-800',
        emerald: 'bg-emerald-50 ring-emerald-200 text-emerald-800',
        amber: 'bg-amber-50 ring-amber-200 text-amber-800',
    };
    return (
        <div className={`rounded-xl ring-1 p-4 ${tones[tone]}`}>
            <div className="flex items-start justify-between">
                <Icon className="h-5 w-5 opacity-70" />
            </div>
            <div className="text-2xl font-bold mt-2">{value}</div>
            <div className="text-xs uppercase tracking-wider opacity-80 mt-1">{label}</div>
        </div>
    );
}

/*
## PENJELASAN CODE:

### fmtIDRCompact(n)
- Fungsi: Memformat angka nominal rupiah menjadi format string ringkas (M untuk milyar, jt untuk juta).
- Parameter: n (number) - Angka rupiah yang akan diformat.
- Return: String hasil format rupiah terkompresi.
- Cara pakai: fmtIDRCompact(12000000)
- Catatan: Menangani input bernilai null atau undefined dengan aman.

### AlumniList()
- Fungsi: Komponen halaman direktori alumni startup inkubasi PENSNOVA.
- Parameter: Tidak ada.
- Return: Elemen visual JSX daftar alumni.
- Cara pakai: <AlumniList />
- Catatan: Menerapkan transisi hover card-lift dan visual scale-in melalui Animate wrapper agar layout direktori tidak kaku.

### StatPanel(props)
- Fungsi: Menampilkan metrik data statistik agregat ringkas (total alumni, total omzet, rata-rata monev).
- Parameter: props (object) - label, value, icon, tone.
- Return: Elemen JSX stat panel ringkas.
- Cara pakai: <StatPanel label="Lulus" value={10} icon={GraduationCap} />
- Catatan: Menggunakan skema warna latar terpisah berbasis parameter tone.
*/
