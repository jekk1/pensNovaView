import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Rocket, Users, Briefcase, Target, CheckCircle2,
    Quote, Calendar, FileText, GraduationCap, Bell, ShieldCheck, Sparkles,
    TrendingUp, Award, FlaskConical, Handshake, Factory, Scale, Search
} from 'lucide-react';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import ReadinessChecklist from '../../components/ReadinessChecklist';
import Animate from '../../components/Animate';

// Tanggal target pembukaan batch berikutnya
const BATCH_OPEN_DATE = new Date('2026-08-01T00:00:00+07:00');
const WAITLIST_KEY = 'pensnova_waitlist';

// Data demo untuk kondisi API tidak tersedia (urutan: Growth teratas)
const MOCK_TENANTS_HOME = [
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


// Hitung sisa waktu ke tanggal target
function useCountdown(target) {
    const [diff, setDiff] = useState(() => Math.max(0, target - Date.now()));

    useEffect(() => {
        const id = setInterval(() => setDiff(Math.max(0, target - Date.now())), 1000);
        return () => clearInterval(id);
    }, [target]);

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, ended: diff <= 0 };
}

export default function Home() {
    const { data: stats } = useQuery({
        queryKey: ['public', 'stats'],
        queryFn: () => api.get('/api/public/stats').then((r) => r.data),
    });

    const { data: tenants } = useQuery({
        queryKey: ['public', 'tenants', { per_page: 6 }],
        queryFn: () => api.get('/api/public/tenants', { params: { per_page: 6 } }).then((r) => r.data),
    });

    const { data: research } = useQuery({
        queryKey: ['public', 'research', { per_page: 4 }],
        queryFn: () => api.get('/api/public/research', { params: { per_page: 4 } }).then((r) => r.data),
    });

    const { data: articles } = useQuery({
        queryKey: ['public', 'articles', { per_page: 3 }],
        queryFn: () => api.get('/api/public/articles', { params: { per_page: 3 } }).then((r) => r.data),
    });

    const { data: innovations } = useQuery({
        queryKey: ['public', 'innovations', { per_page: 3 }],
        queryFn: () => api.get('/api/public/innovations', { params: { per_page: 3 } }).then((r) => r.data),
    });

    const { data: impactStats } = useQuery({
        queryKey: ['public', 'impact-stats'],
        queryFn: () => api.get('/api/public/impact-stats').then((r) => r.data),
    });

    const countdown = useCountdown(BATCH_OPEN_DATE.getTime());

    // Waitlist counter — baca dari localStorage + increment
    const [waitlistCount, setWaitlistCount] = useState(() => {
        try { return parseInt(localStorage.getItem(WAITLIST_KEY) || '247'); } catch { return 247; }
    });
    // * Jangan baca localStorage langsung — cek izin Notification API yang sebenarnya
    const [waitlistJoined, setWaitlistJoined] = useState(() => {
        return typeof Notification !== 'undefined' && Notification.permission === 'granted';
    });

    function joinWaitlist() {
        if (waitlistJoined) return;
        // Minta izin notification browser
        const askAndJoin = () => {
            const next = waitlistCount + 1;
            setWaitlistCount(next);
            setWaitlistJoined(true);
            try {
                localStorage.setItem(WAITLIST_KEY, String(next));
                localStorage.setItem('pensnova_waitlist_joined', '1');
            } catch { /* ignore */ }
        };
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission().then((perm) => {
                if (perm === 'granted') askAndJoin();
            });
        } else {
            askAndJoin();
        }
    }

    // Growth tenants — tampil paling atas sebagai inspirasi mahasiswa
    const growthTenants = tenants?.data?.filter(
        (t) => t.stage === 'Growth' || t.stage === 'growth' || t.stage === 'Early Revenue' || t.stage === 'early_revenue'
    ) ?? [];

    const [tenantIdx, setTenantIdx] = useState(0);
    const [researchIdx, setResearchIdx] = useState(0);
    const [innovationIdx, setInnovationIdx] = useState(0);
    const [articleIdx, setArticleIdx] = useState(0);
    const [audienceIdx, setAudienceIdx] = useState(0);
    const [pilarIdx, setPilarIdx] = useState(0);

    const tenantScrollRef = useRef(null);
    const researchScrollRef = useRef(null);
    const innovationScrollRef = useRef(null);
    const articleScrollRef = useRef(null);
    const audienceScrollRef = useRef(null);
    const pilarScrollRef = useRef(null);

    // Mengatur index slide aktif berdasarkan posisi scroll horizontal container carousel.
    const handleScroll = (ref, setIdx) => {
        return () => {
            if (!ref.current) return;
            const { scrollLeft, clientWidth } = ref.current;
            const cardWidth = clientWidth * 0.82;
            if (cardWidth > 0) {
                const index = Math.round(scrollLeft / cardWidth);
                setIdx(index);
            }
        };
    };

    const tenantList = !tenants ? sortByStage(MOCK_TENANTS_HOME) : sortByStage(tenants.data);

    return (
        <>
            {/* * ------------------------------------------------------------ */}
            {/* ============ 1. HERO SECTION ============ */}
            <section
                className="relative overflow-hidden text-white"
                style={{ background: '#0d1830' }}
            >
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
                    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">

                        {/* Kolom kiri — headline + CTA + countdown */}
                        <Animate variant="fade-up">
                            {/* Badge status */}
                            <div
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                                style={{ background: 'rgba(255,175,0,0.15)', border: '1px solid rgba(255,175,0,0.4)', color: '#ffaf00' }}
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                                </span>
                            Innovation Hub PENS &middot; Batch 2026 Segera Dibuka
                            </div>

                            <h1
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight"
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            >
                                Hilirisasi <span style={{ color: '#ffaf00' }}>inovasi kampus</span>
                                <br />
                                jadi <span style={{ color: '#ffaf00' }}>dampak nyata</span>.
                            </h1>

                            <p className="mt-6 text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                <strong className="text-white">PENSNOVA</strong> adalah unit pelaksana akademik PENS yang membangun ekosistem
                                inovasi — dari <strong className="text-white">inkubasi startup</strong>, <strong className="text-white">manajemen HKI</strong>, <strong className="text-white">riset terapan</strong>,
                                sampai <strong className="text-white">kemitraan industri</strong>.
                            </p>

                            {/* CTA buttons */}
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to="/program"
                                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition-all hover:-translate-y-0.5 hover:opacity-90 btn-glow"
                                    style={{ background: '#ffaf00', color: '#0d1830' }}
                                >
                                    Daftar Inkubasi Batch 2026
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                                </Link>
                                <Link
                                    to="/startup"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-all hover:bg-white/20"
                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
                                >
                                    Lihat Tenant Aktif
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                {['Gratis untuk mahasiswa PENS', 'Mentor industri & investor', 'Akses pendanaan PMW/P2MW'].map((b) => (
                                    <span key={b} className="inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" style={{ color: '#16a34a' }} />
                                        {b}
                                    </span>
                                ))}
                            </div>

                            {!countdown.ended && (
                                <div
                                    className="mt-8 p-4 rounded-2xl"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#ffaf00' }}>
                                        Pembukaan Batch Berikutnya
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex gap-2.5 justify-center sm:justify-start">
                                            {[{ v: countdown.d, l: 'Hari' }, { v: countdown.h, l: 'Jam' }, { v: countdown.m, l: 'Menit' }, { v: countdown.s, l: 'Detik' }].map(({ v, l }) => (
                                                <div key={l} className="text-center">
                                                    <div
                                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-extrabold text-white transition-all"
                                                        style={{ background: 'rgba(255,175,0,0.15)', border: '1px solid rgba(255,175,0,0.3)' }}
                                                    >
                                                        {String(v).padStart(2, '0')}
                                                    </div>
                                                    <div className="text-[9px] font-semibold mt-1 sm:mt-1.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 w-full">
                                            {!waitlistJoined ? (
                                                <button
                                                    onClick={joinWaitlist}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
                                                    style={{ background: '#ffaf00', color: '#0d1830' }}
                                                >
                                                    <Bell className="w-3.5 h-3.5" />
                                                    Nyalakan Notifikasi
                                                </button>
                                            ) : (
                                                <div
                                                    className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold"
                                                    style={{ background: 'rgba(22,163,74,0.15)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.3)' }}
                                                >
                                                    Notifikasi aktif!
                                                </div>
                                            )}
                                            <div className="text-center text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                {waitlistCount} orang sudah daftar notifikasi
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Animate>

                        {/* Kolom kanan — floating cards */}
                        <div className="hidden lg:block relative h-[460px] animate-slide-up-delay-2">
                            {/* Card tenant aktif */}
                            <div
                                className="absolute top-0 right-0 w-80 rounded-2xl p-5 animate-float"
                                style={{ background: '#ffffff', color: '#0d1830' }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>Tenant Aktif</div>
                                        <div className="text-sm font-extrabold" style={{ color: '#0d1830' }}>AITOMA · AI Automation</div>
                                    </div>
                                    <span
                                        className="text-[9px] px-2 py-1 rounded-full font-bold"
                                        style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}
                                    >
                                        Growth
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                    {[{ v: '87', l: 'AI Score', c: '#eef2f9', tc: '#142143' }, { v: 'Rp 24jt', l: 'Omzet', c: 'rgba(255,175,0,0.1)', tc: '#b87c00' }, { v: '5', l: 'Tim', c: 'rgba(22,163,74,0.1)', tc: '#16a34a' }].map(({ v, l, c, tc }) => (
                                        <div key={l} className="p-2 rounded-xl" style={{ background: c }}>
                                            <div className="text-sm font-extrabold" style={{ color: tc }}>{v}</div>
                                            <div className="text-[9px] font-bold" style={{ color: '#64748b' }}>{l}</div>
                                        </div>
                                    ))}
                                </div>
                                {/* Stage progress mini */}
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                                    <div className="h-full rounded-full" style={{ width: '100%', background: '#1a5d94' }} />
                                </div>
                                <div className="flex justify-between mt-1">
                                    {['Proto', 'MVP', 'Revenue', 'Growth'].map((s, i) => (
                                        <span key={s} className="text-[8px] font-bold" style={{ color: i === 3 ? '#16a34a' : '#94a3b8' }}>{s}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Card achievement */}
                            <div
                                className="absolute bottom-10 left-0 w-72 rounded-2xl p-5 animate-float-reverse"
                                style={{ background: '#ffaf00', color: '#0d1830' }}
                            >
                                <Sparkles className="w-5 h-5 mb-2 opacity-70" />
                                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Stage Achievement</div>
                                <div className="text-2xl font-black mt-1">Lulus TKT 7</div>
                                <div className="text-xs font-semibold mt-1 opacity-80">Siap lisensi & pengadaan</div>
                            </div>

                            {/* Badge online indicator */}
                            <div
                                className="absolute top-36 left-8 px-3 py-2 rounded-full inline-flex items-center gap-2 text-white text-xs font-bold"
                                style={{ background: 'rgba(22,163,74,0.9)' }}
                            >
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                3 mentor online
                            </div>

                            {/* Badge HKI */}
                            <div
                                className="absolute top-52 right-8 px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 text-white text-[10px] font-bold animate-badge-pop"
                                style={{ background: '#142143', border: '1px solid rgba(255,175,0,0.4)' }}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#ffaf00' }} />
                                HKI Terdaftar
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 2. TRUST STRIP ============ */}
            <section style={{ background: '#ffffff', borderBottom: '1px solid #e4e4e4' }}>
                <Animate variant="fade-in" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="text-center text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#94a3b8' }}>
                        Bagian dari Ekosistem Inovasi Nasional
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                        {[
                            { label: 'Politeknik Elektronika Negeri Surabaya' },
                            { label: 'Kemdikbud RI - Belmawa' },
                            { label: 'Sentra HKI PENS' },
                            { label: 'P2MW Belmawa' },
                            { label: 'KMI Expo' },
                        ].map((t) => (
                            <span key={t.label} className="inline-flex items-center gap-2 text-xs font-bold whitespace-nowrap" style={{ color: '#475569' }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#1a5d94' }} />
                                {t.label}
                            </span>
                        ))}
                    </div>
                </Animate>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 3. BENTO STATS ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Kolom 1: Stat Besar */}
                    <Animate variant="fade-up" delay={1}>
                        <BentoStatLarge
                            label="Startup Binaan"
                            value={stats?.tenants ?? '—'}
                            hint={impactStats?.tenants?.alumni ? `${impactStats.tenants.alumni} lulus` : 'Sejak 2015'}
                            accentColor="#1a5d94"
                            icon={Rocket}
                        />
                    </Animate>
                    {/* Kolom 2: Stat Kecil Ditumpuk */}
                    <Animate variant="fade-up" delay={2} className="grid grid-rows-2 gap-4">
                        <BentoStatMini
                            label="HKI / Paten Terdaftar"
                            value={impactStats?.patents?.total ?? '—'}
                            hint={impactStats?.patents?.granted ? `${impactStats.patents.granted} granted` : 'Kekayaan Intelektual'}
                            accentColor="#b87c00"
                            icon={ShieldCheck}
                        />
                        <BentoStatMini
                            label="Mitra Industri Aktif"
                            value={stats?.partners ?? '—'}
                            hint="Kerjasama MoU/MoA"
                            accentColor="#16a34a"
                            icon={Handshake}
                        />
                    </Animate>
                    {/* Kolom 3: Banner CTA Link */}
                    <Animate variant="fade-up" delay={3} className="h-full">
                        <Link
                            to="/dampak"
                            className="rounded-2xl p-6 sm:p-8 hover:-translate-y-1 hover:border-gold-500 hover:ring-1 hover:ring-gold-500/50 transition-all duration-300 group flex flex-col justify-between h-full card-lift"
                            style={{
                                background: '#142143',
                                color: '#ffffff',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-[#ffaf00]">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition text-[#ffaf00]" />
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-[#ffaf00]">Dashboard Dampak</div>
                                <h3 className="text-lg font-extrabold mt-1 text-white">Metrik Kinerja &amp; Dampak</h3>
                                <p className="text-xs mt-1.5 leading-relaxed text-slate-300">
                                    Lihat perkembangan wirausaha, total valuasi, omzet, dan realisasi kerjasama teknologi secara real-time.
                                </p>
                            </div>
                        </Link>
                    </Animate>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 4. AUDIENCE SELECTOR ============ */}
            <section className="overflow-hidden" style={{ background: '#f8f9fc', borderTop: '1px dashed #d4d4d4', borderBottom: '1px dashed #d4d4d4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up" as="header" className="text-center max-w-2xl mx-auto mb-10">
                        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}><Users className="w-3.5 h-3.5" /> Siapa Kamu?</div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>
                            Pilih jalur yang paling tepat
                        </h2>
                        <p className="mt-3 text-sm sm:text-base" style={{ color: '#475569' }}>
                            Tiap peran punya kebutuhan berbeda. Klik kartu di bawah untuk melihat layanan yang sesuai.
                        </p>
                    </Animate>

                    <div
                        ref={audienceScrollRef}
                        onScroll={handleScroll(audienceScrollRef, setAudienceIdx)}
                        className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth scrollbar-none"
                    >
                        {[
                            {
                                icon: GraduationCap,
                                color: '#142143',
                                title: 'Mahasiswa',
                                sub: 'Mau bikin startup',
                                body: 'Dapat pembinaan, akses mentor industri, ruang inkubator, dan jalur pendanaan PMW/P2MW.',
                                cta: 'Lihat Program Inkubasi',
                                to: '/program',
                            },
                            {
                                icon: FileText,
                                color: '#b87c00',
                                title: 'Dosen / Peneliti',
                                sub: 'Punya inovasi',
                                body: 'Komersialisasikan riset terapan - daftar HKI, lisensi teknologi, atau bentuk spin-off PENS.',
                                cta: 'Submit Inovasi',
                                to: '/riset',
                            },
                            {
                                icon: Briefcase,
                                color: '#16a34a',
                                title: 'Industri',
                                sub: 'Cari kolaborasi',
                                body: 'Akses teknologi siap pakai, joint research, teaching factory, atau pengadaan dari tenant PENSNOVA.',
                                cta: 'Mitra Industri',
                                to: '/produk-inovasi',
                            },
                            {
                                icon: Target,
                                color: '#7c3aed',
                                title: 'Investor',
                                sub: 'Cari startup',
                                body: 'Akses pipeline 16+ tenant terkurasi dengan AI screening, due-diligence ready, exit potential terukur.',
                                cta: 'Lihat Pipeline',
                                to: '/startup',
                            },
                        ].map((a, i) => (
                            <Animate variant="fade-up" delay={i + 1} key={a.title} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto h-full animate-delay-1">
                                <Link
                                    to={a.to}
                                    className="group rounded-2xl p-6 hover:-translate-y-1 transition-all flex flex-col h-full card-lift"
                                    style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}
                                >
                                    <div
                                        className="h-12 w-12 rounded-xl grid place-items-center text-white mb-4"
                                        style={{ background: a.color }}
                                    >
                                        <a.icon className="h-6 w-6" />
                                    </div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: '#94a3b8' }}>{a.sub}</div>
                                    <h3 className="font-extrabold text-lg mb-2" style={{ color: '#142143' }}>{a.title}</h3>
                                    <p className="text-sm leading-relaxed flex-1" style={{ color: '#475569' }}>{a.body}</p>
                                    <div
                                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all"
                                        style={{ color: '#1a5d94' }}
                                    >
                                        {a.cta}
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </Link>
                            </Animate>
                        ))}
                    </div>
                    <div className="flex md:hidden justify-center gap-1.5 mt-4">
                        {[0, 1, 2, 3].map((idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (audienceScrollRef.current) {
                                        const cardWidth = audienceScrollRef.current.clientWidth * 0.82;
                                        audienceScrollRef.current.scrollTo({
                                            left: idx * cardWidth,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === audienceIdx ? 'bg-primary-600 w-5' : 'bg-slate-300 w-2'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 5. PILAR / MISI (Bento Grid) ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 overflow-hidden">
                <Animate variant="fade-up" as="header" className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}><Target className="w-3.5 h-3.5" /> Misi UPA</div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>
                        5 Pilar Strategis PENSNOVA
                    </h2>
                    <p className="mt-3" style={{ color: '#475569' }}>
                        Dari hilirisasi riset sampai tata kelola - semuanya terintegrasi untuk dampak nyata.
                    </p>
                </Animate>
                <div
                    ref={pilarScrollRef}
                    onScroll={handleScroll(pilarScrollRef, setPilarIdx)}
                    className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth scrollbar-none"
                >
                    <Animate variant="fade-up" delay={1} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto lg:col-span-2">
                        <PilarCard icon="beaker" title="Inovasi Bernilai Ekonomi" body="Mengembangkan dan menghilirkan inovasi teknologi sains terapan agar memiliki nilai guna dan nilai ekonomi." />
                    </Animate>
                    <Animate variant="fade-up" delay={2} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto">
                        <PilarCard icon="rocket" title="Inkubasi Startup" body="Menyelenggarakan program inkubasi melalui Startup Academy untuk menghasilkan startup dan produk unggulan." accent="#ffaf00" />
                    </Animate>
                    <Animate variant="fade-up" delay={3} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto">
                        <PilarCard icon="handshake" title="Ekosistem Kolaboratif" body="Membangun ekosistem bisnis berbasis workspace inkubator yang mendorong kolaborasi dan pertumbuhan tenant." />
                    </Animate>
                    <Animate variant="fade-up" delay={4} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto">
                        <PilarCard icon="factory" title="Kemitraan Strategis" body="Memperkuat kemitraan strategis untuk komersialisasi, lisensi teknologi, dan pembentukan spin-off." />
                    </Animate>
                    <Animate variant="fade-up" delay={5} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto">
                        <PilarCard icon="scale" title="Tata Kelola Profesional" body="Mewujudkan tata kelola UPA yang profesional, transparan, dan berorientasi dampak." />
                    </Animate>
                </div>
                <div className="flex md:hidden justify-center gap-1.5 mt-2 mb-4">
                    {[0, 1, 2, 3, 4].map((idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (pilarScrollRef.current) {
                                    const cardWidth = pilarScrollRef.current.clientWidth * 0.82;
                                    pilarScrollRef.current.scrollTo({
                                        left: idx * cardWidth,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                idx === pilarIdx ? 'bg-primary-600 w-5' : 'bg-slate-300 w-2'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
                <Animate variant="fade-up" delay={6} className="mt-4">
                    <Link
                        to="/tentang"
                        className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:-translate-y-1 hover:border-primary-400 hover:ring-1 hover:ring-primary-400/30 transition-all duration-300 group w-full card-lift"
                        style={{ background: 'rgba(26,93,148,0.06)', border: '1px solid rgba(26,93,148,0.2)' }}
                    >
                        <div>
                            <div className="text-sm font-extrabold" style={{ color: '#1a5d94' }}>Pelajari Lengkap Ekosistem PENSNOVA</div>
                            <div className="text-xs mt-1 text-slate-600">Visi, misi, struktur organisasi, framework inkubasi, dan pengakuan prestasi di tingkat nasional.</div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a5d94] group-hover:gap-2.5 transition-all shrink-0">
                            Tentang UPA PENSNOVA <ArrowRight className="h-4 w-4" />
                        </div>
                    </Link>
                </Animate>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 6. PROSES INKUBASI ============ */}
            <section style={{ background: '#f8f9fc', borderTop: '1px dashed #d4d4d4', borderBottom: '1px dashed #d4d4d4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up" as="header" className="text-center max-w-2xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#b87c00' }}><Rocket className="w-3.5 h-3.5" /> Alur Inkubasi</div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>
                            4 langkah dari ide ke startup
                        </h2>
                        <p className="mt-3" style={{ color: '#475569' }}>
                            Ringan di depan, intensif di belakang. Tim akan didampingi mentor dari industri.
                        </p>
                    </Animate>

                    <div className="relative">
                        <div
                            className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 animate-stage-fill"
                            style={{ background: '#1a5d94' }}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
                            {[
                                { label: 'Submit Proposal', desc: 'Daftar ide via /program - upload pitchdeck + tim', step: 1, color: '#1a5d94' },
                                { label: 'Seleksi & AI Screening', desc: 'Reviewer + AI menilai potensi pasar & tim', step: 2, color: '#ffaf00' },
                                { label: 'Pembinaan Intensif', desc: 'Mentor industri, kelas startup, validasi MVP', step: 3, color: '#7c3aed' },
                                { label: 'Lulus & Scale-up', desc: 'Pitch ke investor, dapat ruang inkubator, akses pasar', step: 4, color: '#16a34a' },
                            ].map((s, i) => (
                                <Animate variant="fade-up" delay={i + 1} key={s.step} className="text-center group">
                                    <div className="relative inline-block">
                                        <div
                                            className="relative h-20 w-20 mx-auto rounded-full flex items-center justify-center group-hover:scale-110 transition"
                                            style={{ background: '#ffffff', border: `3px solid ${s.color}` }}
                                        >
                                            <span className="text-2xl font-extrabold" style={{ color: s.color }}>{s.step}</span>
                                        </div>
                                    </div>
                                    <h3 className="mt-5 font-bold" style={{ color: '#142143' }}>{s.label}</h3>
                                    <p className="mt-1.5 text-xs max-w-[180px] mx-auto leading-relaxed" style={{ color: '#64748b' }}>{s.desc}</p>
                                </Animate>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 7. TENANT SHOWCASE — gamifikasi mahasiswa #1 ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 overflow-hidden">
                <Animate variant="fade-up" className="flex items-end justify-between mb-8 flex-wrap gap-3">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-1" style={{ color: '#1a5d94' }}><GraduationCap className="w-3.5 h-3.5" /> Inspirasi Mahasiswa</div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>
                            Startup yang Sudah Terbukti
                        </h2>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                            Ini yang bisa kamu capai - startup binaan dengan pencapaian nyata di pasar.
                        </p>
                    </div>
                    <Link
                        to="/startup"
                        className="inline-flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all"
                        style={{ color: '#1a5d94' }}
                    >
                        Lihat semua tenant <ArrowRight className="w-4 h-4" />
                    </Link>
                </Animate>
                <div
                    ref={tenantScrollRef}
                    onScroll={handleScroll(tenantScrollRef, setTenantIdx)}
                    className="flex md:grid md:grid-cols-3 gap-4 sm:gap-5 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth scrollbar-none"
                >
                    {tenantList.map((t, i) => (
                        <Animate variant="fade-up" delay={(i % 3) + 1} key={t.id} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto">
                            <TenantCard tenant={t} />
                        </Animate>
                    ))}
                </div>
                {tenantList.length > 1 && (
                    <div className="flex md:hidden justify-center gap-1.5 mt-4">
                        {tenantList.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (tenantScrollRef.current) {
                                        const cardWidth = tenantScrollRef.current.clientWidth * 0.82;
                                        tenantScrollRef.current.scrollTo({
                                            left: idx * cardWidth,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === tenantIdx ? 'bg-primary-600 w-5' : 'bg-slate-300 w-2'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 8. CHECKLIST KESIAPAN — gamifikasi mahasiswa #2 ============ */}
            <section className="overflow-hidden" style={{ background: '#f8f9fc', borderTop: '1px dashed #d4d4d4', borderBottom: '1px dashed #d4d4d4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <Animate variant="slide-left">
                            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#1a5d94' }}><Users className="w-3.5 h-3.5" /> Untuk Mahasiswa</div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4" style={{ color: '#142143' }}>
                                Sudah siap daftar inkubasi?
                            </h2>
                            <p className="text-base leading-relaxed mb-6" style={{ color: '#475569' }}>
                                Cek kesiapanmu dengan 5 poin di bawah. Tiap poin yang kamu centang tersimpan otomatis - kamu bisa balik lagi kapanpun untuk update progressmu.
                            </p>
                            <div className="space-y-3">
                                {[
                                    { icon: Rocket, text: 'Tidak perlu badan hukum dulu - bisa daftar sebagai tim mahasiswa' },
                                    { icon: Users, text: 'Program gratis - tidak ada biaya pendaftaran' },
                                    { icon: TrendingUp, text: 'Mentor industri nyata, bukan akademisi murni' },
                                    { icon: Award, text: 'Akses jalur pendanaan PMW & P2MW Belmawa' },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-start gap-3">
                                        <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,93,148,0.1)' }}>
                                            <Icon className="w-4 h-4" style={{ color: '#1a5d94' }} />
                                        </div>
                                        <p className="text-sm leading-relaxed pt-1" style={{ color: '#475569' }}>{text}</p>
                                    </div>
                                ))}
                            </div>
                        </Animate>

                        {/* Checklist interaktif */}
                        <Animate variant="slide-right" className="w-full min-w-0 overflow-hidden">
                            <ReadinessChecklist />
                        </Animate>
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 8B. UNTUK DOSEN / PENELITI ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                <Animate variant="fade-up" as="header" className="mb-10">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#b87c00' }}>
                        <FlaskConical className="w-3.5 h-3.5" /> Untuk Dosen &amp; Peneliti
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>
                                Komersialisasikan inovasi risetmu
                            </h2>
                            <p className="mt-2 text-sm sm:text-base max-w-2xl" style={{ color: '#475569' }}>
                                PENSNOVA menyediakan jalur terstruktur bagi dosen dan peneliti PENS untuk membawa inovasi dari laboratorium ke pasar — mulai dari perlindungan HKI hingga pembentukan spin-off.
                            </p>
                        </div>
                        <Link
                            to="/riset"
                            className="inline-flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all shrink-0"
                            style={{ color: '#b87c00' }}
                        >
                            Lihat semua riset <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </Animate>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            icon: FlaskConical,
                            step: '01',
                            title: 'Submit Riset',
                            body: 'Daftarkan topik riset terapan kamu ke database PENSNOVA. Terbuka untuk kolaborasi industri, lisensi teknologi, dan pilot project.',
                            cta: 'Submit Sekarang',
                            to: '/riset',
                            accent: '#1a5d94',
                            bg: 'rgba(26,93,148,0.07)',
                        },
                        {
                            icon: ShieldCheck,
                            step: '02',
                            title: 'Daftar HKI',
                            body: 'Sentra HKI PENS terintegrasi langsung — paten, hak cipta, dan merek bisa diurus satu pintu dengan pendampingan penuh dari tim PENSNOVA.',
                            cta: 'Info HKI',
                            to: '/tentang',
                            accent: '#b87c00',
                            bg: 'rgba(184,124,0,0.07)',
                        },
                        {
                            icon: Handshake,
                            step: '03',
                            title: 'Lisensi Teknologi',
                            body: 'Monetisasi hasil riset via skema lisensi teknologi ke industri mitra. Tim PENSNOVA memfasilitasi negosiasi, drafting kontrak, dan royalti.',
                            cta: 'Pelajari Skema',
                            to: '/produk-inovasi',
                            accent: '#16a34a',
                            bg: 'rgba(22,163,74,0.07)',
                        },
                        {
                            icon: Factory,
                            step: '04',
                            title: 'Bentuk Spin-off',
                            body: 'Riset dengan potensi komersial tinggi dapat difasilitasi menjadi perusahaan spin-off resmi PENS dengan dukungan legal, inkubasi, dan akses investor.',
                            cta: 'Konsultasi',
                            to: '/program',
                            accent: '#7c3aed',
                            bg: 'rgba(124,58,237,0.07)',
                        },
                    ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <Animate variant="fade-up" delay={i + 1} key={item.title}>
                                <Link
                                    to={item.to}
                                    className="group rounded-2xl p-6 flex flex-col h-full card-lift transition-all"
                                    style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                                            style={{ background: item.bg }}
                                        >
                                            <Icon className="w-5 h-5" style={{ color: item.accent }} />
                                        </div>
                                        <span
                                            className="text-[11px] font-black tabular-nums"
                                            style={{ color: item.accent, opacity: 0.4 }}
                                        >
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="font-extrabold text-base mb-2" style={{ color: '#142143' }}>{item.title}</h3>
                                    <p className="text-sm leading-relaxed flex-1" style={{ color: '#475569' }}>{item.body}</p>
                                    <div
                                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all"
                                        style={{ color: item.accent }}
                                    >
                                        {item.cta} <ArrowRight className="w-3 h-3" />
                                    </div>
                                </Link>
                            </Animate>
                        );
                    })}
                </div>

                {/* Banner CTA dosen */}
                <Animate variant="fade-up" delay={5} className="mt-6">
                    <div
                        className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                        style={{ background: 'rgba(184,124,0,0.06)', border: '1px solid rgba(184,124,0,0.2)' }}
                    >
                        <div>
                            <div className="text-sm font-extrabold" style={{ color: '#b87c00' }}>Sudah punya inovasi siap dikomersialisasikan?</div>
                            <div className="text-xs mt-1" style={{ color: '#64748b' }}>Konsultasikan langsung dengan tim PENSNOVA — gratis untuk sivitas akademika PENS.</div>
                        </div>
                        <Link
                            to="/riset"
                            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
                            style={{ background: '#b87c00', color: '#ffffff' }}
                        >
                            Submit Inovasi <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </Animate>
            </section>


            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                <Animate variant="fade-up" as="header" className="text-center max-w-2xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#16a34a' }}><Sparkles className="w-3.5 h-3.5" /> Mengapa PENSNOVA</div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>
                        Yang membedakan kami
                    </h2>
                </Animate>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        {
                            ic: Users,
                            bg: 'rgba(26,93,148,0.08)',
                            iconColor: '#1a5d94',
                            title: 'Mentor Industri Real',
                            body: 'Bukan akademisi murni - mentor kami praktisi yang sudah membangun startup, exit, atau lead di industri teknologi.',
                            metric: '12+ mentor industri',
                            metricColor: '#1a5d94',
                        },
                        {
                            ic: Rocket,
                            bg: 'rgba(255,175,0,0.08)',
                            iconColor: '#b87c00',
                            title: 'Akses Pendanaan Multi-Sumber',
                            body: 'PMW PENS (2-5jt), P2MW Belmawa (5-25jt), KMI Expo, plus link ke investor & VC ekosistem Surabaya.',
                            metric: 'Rp 100jt+ disalurkan',
                            metricColor: '#b87c00',
                        },
                        {
                            ic: ShieldCheck,
                            bg: 'rgba(22,163,74,0.08)',
                            iconColor: '#16a34a',
                            title: 'HKI End-to-End',
                            body: 'Sentra HKI PENS integrasi langsung - paten, hak cipta, merek bisa diurus dari satu pintu sampai lisensi.',
                            metric: '50+ HKI granted',
                            metricColor: '#16a34a',
                        },
                    ].map((u, i) => (
                        <Animate variant="fade-up" delay={i + 1} key={u.title} className="h-full">
                            <div
                                className="rounded-2xl p-7 hover:-translate-y-0.5 transition-all flex flex-col h-full card-lift"
                                style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}
                            >
                                <div className="h-12 w-12 rounded-xl grid place-items-center mb-4" style={{ background: u.bg }}>
                                    <u.ic className="h-6 w-6" style={{ color: u.iconColor }} />
                                </div>
                                <h3 className="font-bold text-lg mb-2" style={{ color: '#142143' }}>{u.title}</h3>
                                <p className="text-sm leading-relaxed flex-1" style={{ color: '#475569' }}>{u.body}</p>
                                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: u.metricColor }}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {u.metric}
                                </div>
                            </div>
                        </Animate>
                    ))}
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 10. TESTIMONI ============ */}
            <section style={{ background: '#f8f9fc', borderTop: '1px dashed #d4d4d4', borderBottom: '1px dashed #d4d4d4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up" as="header" className="text-center max-w-2xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#7c3aed' }}><Quote className="w-3.5 h-3.5" /> Suara Founder</div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>
                            Apa kata mereka yang sudah lulus
                        </h2>
                    </Animate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                            {
                                quote: 'PENSNOVA membantu kami fokus pada validasi pasar sejak hari pertama. Mentor industri yang dipasangkan punya pengalaman langsung di sektor kami - bukan teori akademis.',
                                name: 'Muhammad Hariz Izzuddin',
                                role: 'Founder - AITOMA',
                                sector: 'AI / Automation',
                                color: '#142143',
                            },
                            {
                                quote: 'Akses ke jalur pendanaan PMW lalu P2MW Belmawa benar-benar terstruktur. Sampai sertifikasi HKI pun dibantu - kami bisa fokus build produk, bukan ngurus paperwork.',
                                name: 'Pak Ali',
                                role: 'Founder - E-Guru ALMAS',
                                sector: 'EdTech',
                                color: '#b87c00',
                            },
                        ].map((t, i) => (
                            <Animate variant="fade-up" delay={i + 1} key={t.name}>
                                <div
                                    className="rounded-2xl p-7 relative h-full card-lift"
                                    style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}
                                >
                                    <div className="absolute top-5 right-5 w-8 h-8" style={{ color: '#f1f5f9' }} />
                                    <div className="text-base leading-relaxed italic relative z-10" style={{ color: '#334155' }}>"{t.quote}"</div>
                                    <div className="mt-5 pt-5 flex items-center gap-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <div
                                            className="h-12 w-12 rounded-full flex items-center justify-center font-black text-lg text-white"
                                            style={{ background: t.color }}
                                        >
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold" style={{ color: '#142143' }}>{t.name}</div>
                                            <div className="text-xs" style={{ color: '#64748b' }}>{t.role} - {t.sector}</div>
                                        </div>
                                    </div>
                                </div>
                            </Animate>
                        ))}
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 11. RISET ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 overflow-hidden">
                <Animate variant="fade-up" className="flex items-end justify-between mb-8 flex-wrap gap-3">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-1" style={{ color: '#1a5d94' }}><Handshake className="w-3.5 h-3.5" /> Lisensi & Kolaborasi</div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>Riset Terbuka untuk Kolaborasi</h2>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Inovasi siap dilisensikan, di-pilot, atau dijadikan spin-off.</p>
                    </div>
                    <Link to="/riset" className="inline-flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all" style={{ color: '#1a5d94' }}>
                        Semua riset <ArrowRight className="w-4 h-4" />
                    </Link>
                </Animate>
                <div
                    ref={researchScrollRef}
                    onScroll={handleScroll(researchScrollRef, setResearchIdx)}
                    className="flex md:grid md:grid-cols-2 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth scrollbar-none"
                >
                    {!research ? (
                        <Spinner />
                    ) : (
                        research.data.map((r, i) => (
                            <Animate variant="fade-up" delay={(i % 2) + 1} key={r.id} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto">
                                <ResearchCard topic={r} />
                            </Animate>
                        ))
                    )}
                </div>
                {research?.data?.length > 1 && (
                    <div className="flex md:hidden justify-center gap-1.5 mt-4">
                        {research.data.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (researchScrollRef.current) {
                                        const cardWidth = researchScrollRef.current.clientWidth * 0.82;
                                        researchScrollRef.current.scrollTo({
                                            left: idx * cardWidth,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === researchIdx ? 'bg-primary-600 w-5' : 'bg-slate-300 w-2'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 12. INNOVATION HUB ============ */}
            {innovations?.data?.length > 0 && (
                <section className="overflow-hidden" style={{ background: 'rgba(255,175,0,0.04)', borderTop: '1px solid rgba(255,175,0,0.15)', borderBottom: '1px solid rgba(255,175,0,0.15)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                        <Animate variant="fade-up" className="flex items-end justify-between mb-8 flex-wrap gap-3">
                            <div>
                                <div className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-1 inline-flex items-center gap-1.5" style={{ color: '#b87c00' }}>
                                    Innovation Hub
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>Produk Siap Komersialisasi</h2>
                                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Lulus TKT & MRL - siap lisensi, pengadaan, atau kolaborasi riset.</p>
                            </div>
                            <Link to="/produk-inovasi" className="inline-flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all" style={{ color: '#b87c00' }}>
                                Semua produk <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Animate>
                        <div
                            ref={innovationScrollRef}
                            onScroll={handleScroll(innovationScrollRef, setInnovationIdx)}
                            className="flex md:grid md:grid-cols-3 gap-4 sm:gap-5 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth scrollbar-none"
                        >
                            {innovations.data.map((p, i) => (
                                <Animate variant="fade-up" delay={(i % 3) + 1} key={p.id} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto">
                                    <InnovationCard product={p} />
                                </Animate>
                            ))}
                        </div>
                        {innovations.data.length > 1 && (
                            <div className="flex md:hidden justify-center gap-1.5 mt-4">
                                {innovations.data.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (innovationScrollRef.current) {
                                                const cardWidth = innovationScrollRef.current.clientWidth * 0.82;
                                                innovationScrollRef.current.scrollTo({
                                                    left: idx * cardWidth,
                                                    behavior: 'smooth'
                                                });
                                            }
                                        }}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            idx === innovationIdx ? 'bg-primary-600 w-5' : 'bg-slate-300 w-2'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* * ------------------------------------------------------------ */}
            {/* ============ 13. ARTIKEL ============ */}
            {articles?.data?.length > 0 && (
                <section className="overflow-hidden" style={{ background: '#ffffff', borderTop: '1px dashed #d4d4d4', borderBottom: '1px dashed #d4d4d4' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                        <Animate variant="fade-up" className="flex items-end justify-between mb-8 flex-wrap gap-3">
                            <div>
                                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-1" style={{ color: '#1a5d94' }}><Award className="w-3.5 h-3.5" /> Inovasi untuk Negeri</div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>Artikel & Berita Terbaru</h2>
                                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Update terbaru dari ekosistem PENSNOVA.</p>
                            </div>
                            <Link to="/artikel" className="inline-flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all" style={{ color: '#1a5d94' }}>
                                Semua artikel <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Animate>
                        <div
                            ref={articleScrollRef}
                            onScroll={handleScroll(articleScrollRef, setArticleIdx)}
                            className="flex md:grid md:grid-cols-3 gap-4 sm:gap-5 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth scrollbar-none"
                        >
                            {articles.data.map((a, i) => (
                                <Animate variant="fade-up" delay={(i % 3) + 1} key={a.id} className="snap-start shrink-0 w-[82vw] sm:w-[45vw] md:w-auto">
                                    <ArticleMiniCard article={a} />
                                </Animate>
                            ))}
                        </div>
                        {articles.data.length > 1 && (
                            <div className="flex md:hidden justify-center gap-1.5 mt-4">
                                {articles.data.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (articleScrollRef.current) {
                                                const cardWidth = articleScrollRef.current.clientWidth * 0.82;
                                                articleScrollRef.current.scrollTo({
                                                    left: idx * cardWidth,
                                                    behavior: 'smooth'
                                                });
                                            }
                                        }}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            idx === articleIdx ? 'bg-primary-600 w-5' : 'bg-slate-300 w-2'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* * ------------------------------------------------------------ */}
            {/* ============ 14. EKOSISTEM TERKAIT ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                <Animate variant="fade-up" as="header" className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}><Factory className="w-3.5 h-3.5" /> Ekosistem PENS Terintegrasi</div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#142143' }}>Sistem Terkait di PENS</h2>
                    <p className="text-sm mt-2" style={{ color: '#64748b' }}>PENSNOVA bekerja bersama unit lain untuk hilirisasi yang terpadu.</p>
                </Animate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    <Animate variant="fade-up" delay={1}>
                        <ExternalLinkCard title="Sentra HKI PENS" body="Pendaftaran & manajemen Hak Kekayaan Intelektual - paten, hak cipta, merek, desain industri." href="https://hki.pens.ac.id" cta="hki.pens.ac.id" />
                    </Animate>
                    <Animate variant="fade-up" delay={2}>
                        <ExternalLinkCard title="Wira - Kewirausahaan Mahasiswa" body="Platform kewirausahaan mahasiswa PENS untuk PMW Internal & P2MW Belmawa." href="https://wira.pensnova.org" cta="wira.pensnova.org" />
                    </Animate>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* ============ 15. FINAL CTA ============ */}
            <section
                className="text-white relative overflow-hidden"
                style={{ background: '#0d1830' }}
            >
                {/* Dot grid pattern overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
                <Animate variant="scale-in" className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
                        style={{ background: 'rgba(255,175,0,0.15)', border: '1px solid rgba(255,175,0,0.4)', color: '#ffaf00' }}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        Batch 2026 - Segera Dibuka
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                        Siap menghilirkan inovasimu?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        Bergabung di batch berikutnya. Dari pitchdeck pertama sampai lisensi & exit - kami damping setiap langkahnya.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3 justify-center">
                        <Link
                            to="/program"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all hover:-translate-y-0.5 hover:opacity-90 btn-glow"
                            style={{ background: '#ffaf00', color: '#0d1830' }}
                        >
                            Daftar Inkubasi Sekarang
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="mailto:penssky.inkubator@div.pens.ac.id"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all"
                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
                        >
                            Hubungi Tim Kami
                        </a>
                    </div>
                    <div className="mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Kolaborasi industri? Email{' '}
                        <a href="mailto:penssky.inkubator@div.pens.ac.id" className="font-semibold hover:underline" style={{ color: '#ffaf00' }}>
                            penssky.inkubator@div.pens.ac.id
                        </a>
                    </div>
                </Animate>
            </section>
        </>
    );
}

/* ============ HELPER COMPONENTS ============ */

function BentoStatLarge({ label, value, hint, icon: Icon, accentColor }) {
    return (
        <div
            className="rounded-2xl p-6 sm:p-8 hover:-translate-y-1 hover:border-primary-400 hover:ring-1 hover:ring-primary-400/30 transition-all duration-300 flex flex-col justify-between h-full min-h-[190px]"
            style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}
        >
            <div className="flex justify-between items-start">
                <div className="text-3xl sm:text-4xl font-black" style={{ color: accentColor ?? '#142143' }}>{value}</div>
                {Icon && (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="mt-4">
                <div className="text-sm sm:text-base font-extrabold" style={{ color: '#142143' }}>{label}</div>
                {hint && <div className="text-xs mt-1" style={{ color: '#64748b' }}>{hint}</div>}
            </div>
        </div>
    );
}

function BentoStatMini({ label, value, hint, icon: Icon, accentColor }) {
    return (
        <div
            className="rounded-2xl p-4 hover:-translate-y-1 hover:border-primary-400 hover:ring-1 hover:ring-primary-400/30 transition-all duration-300 flex items-center gap-4"
            style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}
        >
            {Icon && (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(26,93,148,0.06)', color: accentColor }}>
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div>
                <div className="text-xl font-bold leading-tight" style={{ color: accentColor ?? '#142143' }}>{value}</div>
                <div className="text-xs font-semibold" style={{ color: '#475569' }}>{label}</div>
                {hint && <div className="text-[10px] text-slate-400 mt-0.5">{hint}</div>}
            </div>
        </div>
    );
}

const pilarIcons = {
    beaker:    FlaskConical,
    rocket:    Rocket,
    handshake: Handshake,
    factory:   Factory,
    scale:     Scale,
};

function PilarCard({ icon, title, body, accent, className }) {
    const IconComponent = pilarIcons[icon];
    return (
        <div
            className={`rounded-2xl p-5 sm:p-6 hover:-translate-y-1 hover:border-primary-400 hover:ring-1 hover:ring-primary-400/30 transition-all duration-300 flex flex-col ${className || ''}`}
            style={{ background: '#ffffff', border: `1px solid ${accent ? '#ffaf00' : '#e4e4e4'}` }}
        >
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="h-12 w-12 rounded-xl grid place-items-center text-white shrink-0" style={{ background: accent ? '#b87c00' : '#142143' }}>
                    {IconComponent && <IconComponent className="h-6 w-6" />}
                </div>
                <div>
                    <h3 className="font-extrabold text-base sm:text-lg mb-2" style={{ color: '#142143' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{body}</p>
                </div>
            </div>
        </div>
    );
}

// Konfigurasi visual per stage tenant sesuai desain Figma
const stageConfig = {
    Growth:        { bg: 'rgba(14,165,233,0.12)', color: '#0369a1', label: 'Growth',        nextLabel: 'Alumni',        nextIdx: 4 },
    growth:        { bg: 'rgba(14,165,233,0.12)', color: '#0369a1', label: 'Growth',        nextLabel: 'Alumni',        nextIdx: 4 },
    'Early Revenue': { bg: 'rgba(251,146,60,0.15)', color: '#c2410c', label: 'Early Revenue', nextLabel: 'Growth',     nextIdx: 3 },
    early_revenue: { bg: 'rgba(251,146,60,0.15)', color: '#c2410c', label: 'Early Revenue', nextLabel: 'Growth',     nextIdx: 3 },
    MVP:           { bg: 'rgba(6,182,212,0.12)',  color: '#0e7490', label: 'MVP',            nextLabel: 'Early Revenue', nextIdx: 2 },
    mvp:           { bg: 'rgba(6,182,212,0.12)',  color: '#0e7490', label: 'MVP',            nextLabel: 'Early Revenue', nextIdx: 2 },
    Prototype:     { bg: 'rgba(239,68,68,0.1)',   color: '#b91c1c', label: 'Prototype',      nextLabel: 'MVP',          nextIdx: 1 },
    prototype:     { bg: 'rgba(239,68,68,0.1)',   color: '#b91c1c', label: 'Prototype',      nextLabel: 'MVP',          nextIdx: 1 },
};

// Mapping nama badge ke warna pills
const badgePillStyle = {
    'HKI Terdaftar':    { bg: 'rgba(22,163,74,0.1)',  color: '#15803d' },
    'Mentor Endorsed':  { bg: 'rgba(22,163,74,0.1)',  color: '#15803d' },
    'Investor Ready':   { bg: '#1e293b',              color: '#f1f5f9' },
};

function TenantCard({ tenant }) {
    const s = stageConfig[tenant.stage] ?? { bg: '#f1f5f9', color: '#64748b', label: tenant.stage, nextLabel: '-', nextIdx: 0 };
    const progress = tenant.stageProgress ?? 0;
    const progressPct = Math.min(100, (progress / 4) * 100);
    const sector = tenant.sector_label || tenant.sector || '';
    const subPhase = tenant.incubation_phase_label || tenant.subPhase || '';
    const stageBadges = tenant.stageBadges || [];

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

function ResearchCard({ topic }) {
    return (
        <Link
            to={`/riset/${topic.slug}`}
            className="group rounded-2xl p-5 sm:p-6 hover:-translate-y-0.5 transition-all block"
            style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}
        >
            <div className="flex items-start gap-2 mb-2 flex-wrap">
                {topic.technology_readiness_level && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(26,93,148,0.1)', color: '#1a5d94' }}>
                        TKT {topic.technology_readiness_level}
                    </span>
                )}
                {topic.status && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,175,0,0.1)', color: '#b87c00' }}>
                        {topic.status}
                    </span>
                )}
            </div>
            <h3 className="font-bold text-base group-hover:text-primary-700 line-clamp-2 mb-1" style={{ color: '#142143' }}>{topic.title}</h3>
            <p className="text-sm line-clamp-2" style={{ color: '#64748b' }}>{topic.abstract}</p>
        </Link>
    );
}

function ArticleMiniCard({ article }) {
    const catColor = {
        innovation: { bg: 'rgba(255,175,0,0.1)', color: '#b87c00', label: 'Artikel Inovasi' },
        news: { bg: 'rgba(26,93,148,0.1)', color: '#1a5d94', label: 'Berita' },
        announcement: { bg: 'rgba(220,38,38,0.08)', color: '#dc2626', label: 'Pengumuman' },
    };
    const cat = catColor[article.category] ?? { bg: '#f1f5f9', color: '#64748b', label: article.category };

    return (
        <Link
            to={`/artikel/${article.slug}`}
            className="group block rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-all"
            style={{ background: '#f8f9fc', border: '1px solid #e4e4e4' }}
        >
            {article.cover_image ? (
                <div className="aspect-video bg-slate-100 overflow-hidden">
                    <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
            ) : (
                <div className="aspect-video flex items-center justify-center" style={{ background: '#f8fafc' }}>
                    <span className="text-4xl opacity-40">--</span>
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>
                        {cat.label}
                    </span>
                    <span className="text-[11px]" style={{ color: '#94a3b8' }}>
                        {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-primary-700" style={{ color: '#142143' }}>{article.title}</h3>
                {article.excerpt && <p className="text-xs mt-2 line-clamp-2" style={{ color: '#64748b' }}>{article.excerpt}</p>}
            </div>
        </Link>
    );
}

function ExternalLinkCard({ title, body, href, cta }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener"
            className="group block rounded-2xl p-5 sm:p-6 hover:-translate-y-0.5 transition-all"
            style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}
        >
            <h3 className="font-bold text-base sm:text-lg mb-1.5 group-hover:text-primary-700" style={{ color: '#142143' }}>{title}</h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#475569' }}>{body}</p>
            <div className="text-xs font-bold" style={{ color: '#1a5d94' }}>{cta} (buka)</div>
        </a>
    );
}

function InnovationCard({ product }) {
    return (
        <Link
            to={`/produk-inovasi/${product.slug}`}
            className="group rounded-2xl p-5 hover:-translate-y-0.5 transition-all flex flex-col"
            style={{ background: '#ffffff', border: '1px solid rgba(255,175,0,0.25)' }}
        >
            <div className="flex items-start gap-2 mb-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                    {product.status === 'commercialized' ? 'Sudah Dikomersialisasi' : 'Siap Komersialisasi'}
                </span>
                {product.linked_patent && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: 'rgba(255,175,0,0.1)', color: '#b87c00' }}>
                        <ShieldCheck className="h-2.5 w-2.5" /> HKI
                    </span>
                )}
            </div>
            <h3 className="font-bold text-base line-clamp-2 mb-2 group-hover:text-amber-700" style={{ color: '#142143' }}>{product.title}</h3>
            <p className="text-xs line-clamp-3 mb-3 flex-1" style={{ color: '#64748b' }}>{product.description}</p>
            <div className="flex items-center gap-3 text-[11px] pt-2" style={{ borderTop: '1px solid #f1f5f9', color: '#64748b' }}>
                {product.current_trl_level && <span className="font-semibold">TKT {product.current_trl_level}</span>}
                {product.current_mrl_score && <span className="font-semibold">MRL {Number(product.current_mrl_score).toFixed(1)}</span>}
                <span className="ml-auto font-bold group-hover:translate-x-0.5 transition text-xs" style={{ color: '#b87c00' }}>lihat</span>
            </div>
        </Link>
    );
}

/*
## PENJELASAN CODE:

### getStagePriority(stage)
- Fungsi: Menentukan prioritas numerik dari nama tahap inkubasi secara case-insensitive.
- Parameter: stage (string) - Nama tahapan inkubasi tenant.
- Return: Angka prioritas dari 0 hingga 4 untuk pengurutan.
- Cara pakai: const priority = getStagePriority(tenant.stage);
- Catatan: Menangani input string kosong, variasi penulisan spasi, dan penulisan lowercase/uppercase.

### sortByStage(arr)
- Fungsi: Mengurutkan array tenant berdasarkan tingkat prioritas tahapan inkubasi dari yang paling tinggi ke terendah.
- Parameter: arr (array) - Array data tenant/startup.
- Return: Array tenant baru yang telah diurutkan berdasarkan tahap inkubasi.
- Cara pakai: const sorted = sortByStage(tenants);
- Catatan: Menggunakan operator spread untuk menghindari mutasi langsung pada data array asli.

### useCountdown(target)
- Fungsi: Custom react hook untuk menghitung waktu mundur pendaftaran batch baru secara berkala tiap 1 detik.
- Parameter: target (number) - Waktu target (timestamp milidetik).
- Return: Object dengan sisa hari, jam, menit, detik, dan boolean penanda waktu habis.
- Cara pakai: const timer = useCountdown(BATCH_OPEN_DATE.getTime());
- Catatan: Membersihkan event interval secara otomatis saat komponen di-unmount demi kebersihan memori.

### Home()
- Fungsi: Komponen landing page utama (Beranda) platform PENSNOVA.
- Parameter: Tidak ada.
- Return: Elemen visual JSX halaman beranda.
- Cara pakai: <Home />
- Catatan: Ditambahkan scroll-reveal animations (Animate) dan micro-interactions pada bento stats, audience grid, pilar, dan showcase startup agar terasa responsif dan hidup.

### BentoStatLarge(props)
- Fungsi: Menampilkan data statistik utama dalam layout kartu bento besar.
- Parameter: props (object) - Data label, nilai, petunjuk info, ikon pendukung, dan warna aksen.
- Return: Elemen JSX Bento Card besar.
- Cara pakai: <BentoStatLarge label="Startup" value="15" icon={Rocket} />
- Catatan: Mendukung hover effect translasi y yang halus.

### BentoStatMini(props)
- Fungsi: Menampilkan data statistik pendukung dalam layout kartu bento kecil.
- Parameter: props (object) - Data label, nilai, petunjuk info, ikon pendukung, dan warna aksen.
- Return: Elemen JSX Bento Card kecil.
- Cara pakai: <BentoStatMini label="HKI" value="50" icon={ShieldCheck} />
- Catatan: Layout compact, cocok disandingkan di sebelah bento card besar.

### PilarCard(props)
- Fungsi: Menampilkan 5 pilar strategis PENSNOVA.
- Parameter: props (object) - Icon, title, body, accent, className.
- Return: Elemen JSX pilar card.
- Cara pakai: <PilarCard title="Pilar 1" body="..." icon="beaker" />
- Catatan: Meresolusi ikon dinamis berdasarkan string yang dipetakan ke komponen Lucide React.

### TenantCard(props)
- Fungsi: Menampilkan profil singkat tenant startup beserta progress bar inkubasi.
- Parameter: props (object) - Object tenant.
- Return: Elemen JSX tenant card.
- Cara pakai: <TenantCard tenant={tenant} />
- Catatan: Dilengkapi dengan progress bar dinamis ke stage berikutnya dan detail sektor teknologi.

### ResearchCard(props)
- Fungsi: Menampilkan ringkasan riset terapan kampus siap kolaborasi.
- Parameter: props (object) - Object topic riset.
- Return: Elemen JSX research card.
- Cara pakai: <ResearchCard topic={topic} />
- Catatan: Menampilkan info level TKT (Technology Readiness Level) secara visual.

### ArticleMiniCard(props)
- Fungsi: Menampilkan ringkasan artikel berita atau pengumuman terbaru.
- Parameter: props (object) - Object article.
- Return: Elemen JSX artikel card.
- Cara pakai: <ArticleMiniCard article={article} />
- Catatan: Menampilkan label kategori artikel yang disesuaikan secara visual dan tanggal terbit lokal.

### ExternalLinkCard(props)
- Fungsi: Menampilkan tautan ke sistem terkait di PENS.
- Parameter: props (object) - Title, body, href, cta.
- Return: Elemen JSX external link card.
- Cara pakai: <ExternalLinkCard title="Sentra HKI" href="..." cta="..." />
- Catatan: Membuka url eksternal di tab baru dengan perlindungan keamanan noopener.

### InnovationCard(props)
- Fungsi: Menampilkan produk inovasi siap komersialisasi.
- Parameter: props (object) - Object product inovasi.
- Return: Elemen JSX innovation card.
- Cara pakai: <InnovationCard product={product} />
- Catatan: Menampilkan data level TKT dan MRL (Manufacturing Readiness Level) terintegrasi.

### handleScroll(ref, setIdx)
- Fungsi: Handler event scroll untuk mendeteksi indeks halaman aktif pada carousel horizontal di mobile.
- Parameter: ref (object) - Reference ke element DOM scroll container, setIdx (function) - State setter untuk menyimpan indeks slide aktif.
- Return: Function event handler.
- Cara pakai: onScroll={handleScroll(tenantScrollRef, setTenantIdx)}
- Catatan: Indeks halaman dihitung berdasarkan lebar clientWidth container dikali faktor lebar card.
*/
