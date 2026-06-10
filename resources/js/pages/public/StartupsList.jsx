import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import PageHero from '../../components/PageHero';
import Animate from '../../components/Animate';

const MOCK_STARTUPS = [
    {
        id: 1,
        slug: 'aitoma-automation',
        name: 'AITOMA',
        one_liner: 'Solusi AI IoT Automation untuk efisiensi rantai pasokan manufaktur dan pelacakan gudang real-time.',
        stage: 'Growth',
        sector: 'IoT & AI',
        subPhase: 'Scale Up',
        stageProgress: 4,
        stageBadges: ['HKI Terdaftar', 'Mentor Endorsed', 'Investor Ready'],
    },
    {
        id: 6,
        slug: 'logioptima-route',
        name: 'LogiOptima',
        one_liner: 'Software optimasi rute armada pengiriman logistik untuk memotong biaya bahan bakar hingga 30%.',
        stage: 'Growth',
        sector: 'Logistics',
        subPhase: 'Scale Up',
        stageProgress: 4,
        stageBadges: ['HKI Terdaftar', 'Mentor Endorsed', 'Investor Ready'],
    },
    {
        id: 2,
        slug: 'edulink-learning',
        name: 'EduLink',
        one_liner: 'Platform Edutech berbasis AI adaptif untuk kurikulum sekolah kejuruan mandiri.',
        stage: 'Early Revenue',
        sector: 'Education Tech',
        subPhase: 'Market Expansion',
        stageProgress: 3,
        stageBadges: ['HKI Terdaftar', 'Mentor Endorsed'],
    },
    {
        id: 3,
        slug: 'mediscan-health',
        name: 'Mediscan',
        one_liner: 'Sistem deteksi dini kanker paru berbasis citra rontgen menggunakan algoritma deep learning.',
        stage: 'MVP',
        sector: 'Health Tech',
        subPhase: 'Beta Testing',
        stageProgress: 2,
        stageBadges: ['Mentor Endorsed'],
    },
    {
        id: 5,
        slug: 'cleanenergy-solar',
        name: 'CleanEnergy',
        one_liner: 'Microgrid cerdas pengelola pembangkit listrik tenaga surya mandiri untuk desa tertinggal.',
        stage: 'MVP',
        sector: 'Sustainability',
        subPhase: 'Beta Testing',
        stageProgress: 2,
        stageBadges: ['HKI Terdaftar'],
    },
    {
        id: 4,
        slug: 'agrishield-pest',
        name: 'AgriShield',
        one_liner: 'Sensor pintar pemantau kesuburan tanah dan penyemprot pestisida otomatis bertenaga solar cell.',
        stage: 'Prototype',
        sector: 'Agriculture Tech',
        subPhase: 'Validation',
        stageProgress: 1,
        stageBadges: [],
    },
];

// * Memetakan prioritas stage secara case-insensitive untuk kebutuhan pengurutan tenant
function getStagePriority(stage) {
    if (!stage) return 0;
    const s = String(stage).toLowerCase().trim();
    if (s === 'growth') return 4;
    if (s === 'early revenue' || s === 'early_revenue' || s === 'earlyrevenue') return 3;
    if (s === 'mvp' || s === 'mcp') return 2;
    if (s === 'prototype') return 1;
    return 0;
}

// * Mengurutkan tenant berdasarkan prioritas tahap inkubasi dari tertinggi ke terendah
function sortByStage(arr) {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
        return getStagePriority(b.stage) - getStagePriority(a.stage);
    });
}


// Konfigurasi visual per stage tenant sesuai desain Figma
const stageConfig = {
    Growth:          { bg: 'rgba(14,165,233,0.12)',  color: '#0369a1', label: 'Growth',        nextLabel: 'Alumni',        },
    growth:          { bg: 'rgba(14,165,233,0.12)',  color: '#0369a1', label: 'Growth',        nextLabel: 'Alumni',        },
    'Early Revenue': { bg: 'rgba(251,146,60,0.15)',  color: '#c2410c', label: 'Early Revenue', nextLabel: 'Growth',        },
    early_revenue:   { bg: 'rgba(251,146,60,0.15)',  color: '#c2410c', label: 'Early Revenue', nextLabel: 'Growth',        },
    MVP:             { bg: 'rgba(6,182,212,0.12)',   color: '#0e7490', label: 'MVP',            nextLabel: 'Early Revenue', },
    mvp:             { bg: 'rgba(6,182,212,0.12)',   color: '#0e7490', label: 'MVP',            nextLabel: 'Early Revenue', },
    Prototype:       { bg: 'rgba(239,68,68,0.1)',    color: '#b91c1c', label: 'Prototype',      nextLabel: 'MVP',           },
    prototype:       { bg: 'rgba(239,68,68,0.1)',    color: '#b91c1c', label: 'Prototype',      nextLabel: 'MVP',           },
};

// Mapping badge ke warna pill
const badgePillStyle = {
    'HKI Terdaftar':  { bg: 'rgba(22,163,74,0.1)', color: '#15803d' },
    'Mentor Endorsed':{ bg: 'rgba(22,163,74,0.1)', color: '#15803d' },
    'Investor Ready': { bg: '#1e293b',              color: '#f1f5f9' },
};

export default function StartupsList() {
    const [params, setParams] = useSearchParams();
    const sector = params.get('sector') || '';
    const stage = params.get('stage') || '';
    const phase = params.get('phase') || '';
    const q = params.get('q') || '';

    // Master data — admin bisa edit di /admin
    const { data: master } = useQuery({
        queryKey: ['public', 'master'],
        queryFn: () => api.get('/api/public/master').then((r) => r.data),
        staleTime: 5 * 60_000,
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['public', 'tenants', { sector, stage, phase, q }],
        queryFn: () =>
            api.get('/api/public/tenants', { params: { sector, stage, phase, q, per_page: 12 } }).then((r) => r.data),
    });

    function setParam(key, value) {
        const next = new URLSearchParams(params);
        if (value) next.set(key, value);
        else next.delete(key);
        setParams(next);
    }

    return (
        <div className="bg-slate-50">
            <PageHero
                eyebrow="Portofolio Tenant"
                title="Direktori"
                accent="Startup"
                titleAfter=" PENSNOVA"
                subtitle={`${data?.meta?.total ?? '—'} startup binaan UPA Pengembangan Teknologi & Produk Unggulan PENS — siap kolaborasi dengan industri & masyarakat.`}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

            <form className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 sm:mb-8 p-4 bg-white rounded-xl ring-1 ring-slate-200" onSubmit={(e) => { e.preventDefault(); setParam('q', e.target.q.value); }}>
                <input name="q" defaultValue={q} placeholder="Cari nama atau deskripsi..." className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-sm" />

                <select value={sector} onChange={(e) => setParam('sector', e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">
                    <option value="">Semua Sektor</option>
                    {(master?.sectors || []).map((s) => (
                        <option key={s.slug} value={s.slug}>{s.name}</option>
                    ))}
                </select>

                <select value={stage} onChange={(e) => setParam('stage', e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">
                    <option value="">Semua Tahap</option>
                    {(master?.stages || []).map((s) => (
                        <option key={s.slug} value={s.slug}>{s.name}</option>
                    ))}
                </select>

                <select value={phase} onChange={(e) => setParam('phase', e.target.value)} className="md:col-span-4 px-3 py-2 rounded-lg border border-slate-300 text-sm">
                    <option value="">Semua Tahap Inkubasi PENSNOVA</option>
                    {(master?.incubation_phases || []).map((p) => (
                        <option key={p.slug} value={p.slug}>{p.name} — {p.focus}</option>
                    ))}
                </select>
            </form>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton.Card key={i} />)}
                </div>
            ) : error || !data?.data ? (
                <div>
                    <div className="mb-6 p-4 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 ring-1 ring-amber-200">
                        Peringatan: Gagal terhubung ke API backend. Menampilkan data demo/offline agar visual tetap berjalan.
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {sortByStage(MOCK_STARTUPS).map((t, i) => (
                            <Animate key={t.id} variant="scale-in" delay={(i % 3) + 1}>
                                <TenantCard tenant={t} />
                            </Animate>
                        ))}
                    </div>
                </div>
            ) : data.data.length === 0 ? (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-12 text-center">
                    <Search className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="font-bold mb-1">Tidak ada startup yang cocok</h3>
                    <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {sortByStage(data.data).map((t, i) => (
                        <Animate key={t.id} variant="scale-in" delay={(i % 3) + 1}>
                            <TenantCard tenant={t} />
                        </Animate>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}

function TenantCard({ tenant }) {
    const s = stageConfig[tenant.stage] ?? { bg: '#f1f5f9', color: '#64748b', label: tenant.stage, nextLabel: '-' };
    const progress = tenant.stageProgress ?? 0;
    const progressPct = Math.min(100, (progress / 4) * 100);
    const sector = tenant.sector_label || tenant.sector || '';
    const subPhase = tenant.incubation_phase_label || tenant.subPhase || '';
    const stageBadges = tenant.stageBadges || tenant.badges?.map((b) => b.name) || [];

    return (
        <Link
            to={`/startup/${tenant.slug}`}
            className="group rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200 block"
            style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}
        >
            {/* Nama + stage pill */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-extrabold text-base leading-tight" style={{ color: '#0f172a' }}>
                    {tenant.name}
                </h3>
                <span
                    className="shrink-0 text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide"
                    style={{ background: s.bg, color: s.color }}
                >
                    {s.label}
                </span>
            </div>

            {/* Deskripsi */}
            <p className="text-xs mb-3 line-clamp-2" style={{ color: '#64748b' }}>
                {tenant.one_liner || tenant.description}
            </p>

            {/* Sektor pill border hitam + sub-phase */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
                {sector && (
                    <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{ border: '1.5px solid #1e293b', color: '#1e293b', background: 'transparent' }}
                    >
                        {sector}
                    </span>
                )}
                {subPhase && (
                    <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                        - {subPhase}
                    </span>
                )}
            </div>

            {/* Separator */}
            <div className="mb-3" style={{ borderTop: '1px solid #f1f5f9' }} />

            {/* Progress bar ke stage berikutnya */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold" style={{ color: '#64748b' }}>
                        Progres ke {s.nextLabel}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: '#0f172a' }}>
                        {progress} / 4
                    </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
                    <div
                        className="h-full rounded-full animate-stage-fill"
                        style={{ width: `${progressPct}%`, background: '#06b6d4' }}
                    />
                </div>
            </div>

            {/* Badge pills */}
            {stageBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {stageBadges.map((badge) => {
                        const bStyle = badgePillStyle[badge] ?? { bg: 'rgba(100,116,139,0.1)', color: '#475569' };
                        return (
                            <span
                                key={badge}
                                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                                style={{ background: bStyle.bg, color: bStyle.color }}
                            >
                                {badge}
                            </span>
                        );
                    })}
                </div>
            )}
        </Link>
    );
}
