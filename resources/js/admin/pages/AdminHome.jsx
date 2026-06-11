import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Building2, FlaskConical, Handshake, Palette,
    Rocket, Lightbulb, Cog, TrendingUp, DollarSign,
    ArrowRight, Sparkles, FileText, Target, Banknote, Award, CheckCircle2,
    ClipboardList, GraduationCap, Briefcase, ExternalLink, ChevronRight,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { StatCard } from '../../components/ui/stat-card';

const fmtIDR = (n) => n ? `Rp ${Number(n).toLocaleString('id-ID')}` : 'Rp 0';

// Target pendapatan non-UKT tahun ini per arahan Kepala UPA
const ANNUAL_REVENUE_TARGET = 100_000_000;

export default function AdminHome() {
    const { user } = useAuth();

    const { data: stats } = useQuery({
        queryKey: ['public', 'stats'],
        queryFn: () => api.get('/api/public/stats').then((r) => r.data),
    });

    const { data: partnerships } = useQuery({
        queryKey: ['admin', 'partnerships', 'stats'],
        queryFn: () => api.get('/api/admin/partnerships-stats').then((r) => r.data),
    });

    const { data: graduations } = useQuery({
        queryKey: ['admin', 'graduations', 'stats'],
        queryFn: () => api.get('/api/admin/graduations-stats').then((r) => r.data),
    });

    const { data: workspaceStats } = useQuery({
        queryKey: ['admin', 'workspace', 'stats'],
        queryFn: () => api.get('/api/admin/workspace-rentals-stats').then((r) => r.data),
    });

    const { data: patentStats } = useQuery({
        queryKey: ['admin', 'patents', 'stats'],
        queryFn: () => api.get('/api/admin/patents-stats').then((r) => r.data),
    });

    const { data: researchProductStats } = useQuery({
        queryKey: ['admin', 'research-products', 'stats'],
        queryFn: () => api.get('/api/admin/research-products-stats').then((r) => r.data),
    });

    const { data: trlStats } = useQuery({
        queryKey: ['admin', 'trl', 'stats'],
        queryFn: () => api.get('/api/admin/trl-stats').then((r) => r.data),
    });

    const { data: certStats } = useQuery({
        queryKey: ['admin', 'program-certificates', 'stats'],
        queryFn: () => api.get('/api/admin/program-certificates-stats').then((r) => r.data),
    });

    const isKepalaUpa = user?.roles?.some((r) => ['super-admin', 'kepala-upa'].includes(r));
    const pendingApproval = certStats?.pending_approval ?? 0;

    // Aggregate revenue dari 4 aliran (yang sudah aktif)
    const sewaRevenue = Number(workspaceStats?.paid_amount ?? 0);
    const hkiRoyalty = Number(patentStats?.royalty_per_year ?? 0);
    const partnershipsValue = Number(partnerships?.total_value ?? 0);
    const totalRealized = sewaRevenue + hkiRoyalty; // partnership tidak otomatis cash, jadi terpisah dari "realisasi tunai"

    return (
        <div>
            <header className="mb-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    Halo, {user?.name}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                    Pusat operasional <strong>UPA Pengembangan Teknologi & Produk Unggulan PENS</strong> — kelola 4 aliran pendapatan non-UKT.
                </p>
            </header>

            {/* HEADLINE: Target Rp 100jt + Realisasi */}
            <DashboardHeadline
                target={ANNUAL_REVENUE_TARGET}
                totalRealized={totalRealized}
                sewaRevenue={sewaRevenue}
                sewaPotential={Number(workspaceStats?.potential_yearly_revenue ?? 0)}
                hkiRoyalty={hkiRoyalty}
                hkiLicensed={Number(patentStats?.licensed ?? 0)}
                partnershipsValue={partnershipsValue}
                partnershipsActive={Number(partnerships?.active ?? 0)}
                graduated={graduations?.graduated ?? 0}
                occupancy={workspaceStats?.occupancy_rate ?? 0}
            />

            {isKepalaUpa && pendingApproval > 0 && (
                <Link
                    to="/admin/program-certificates?status=pending_approval"
                    className="flex items-center gap-3 ring-1 ring-amber-300 rounded-2xl p-4 mb-5 transition" style={{ background: '#fffbeb' }}
                >
                    <Award className="h-8 w-8 text-amber-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-amber-900">
                            {pendingApproval} sertifikat peserta menunggu ACC Anda
                        </div>
                        <div className="text-xs text-amber-800 mt-0.5">
                            Peserta sudah mengisi Feedback Program. Tinjau & setujui untuk menerbitkan sertifikat PDF.
                        </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-amber-700" />
                </Link>
            )}

            {/* PIPELINE OVERVIEW — produk dosen yg sedang di-assess */}
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Pipeline Komersialisasi
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard
                    label="Produk Dosen Terdaftar"
                    value={researchProductStats?.total ?? 0}
                    icon={FlaskConical}
                    color="primary"
                />
                <StatCard
                    label="Dalam Pipeline (TKT/MRL)"
                    value={researchProductStats?.in_pipeline ?? 0}
                    icon={TrendingUp}
                    color="amber"
                />
                <StatCard
                    label="Siap Komersialisasi"
                    value={researchProductStats?.ready_to_commercialize ?? 0}
                    icon={Target}
                    color="emerald"
                />
                <StatCard
                    label="Pengukuran TKT"
                    value={trlStats?.total ?? 0}
                    icon={Sparkles}
                    color="primary"
                />
            </div>

            {/* 4 DIVISI = 4 ALIRAN PENDAPATAN */}
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Empat Aliran Pendapatan UPA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <RevenueStreamCard
                    title="Divisi Technopreneurship & Venture Building"
                    subtitle="Inkubator, sewa ruang, spin-off startup"
                    icon={Rocket}
                    color="emerald"
                    stats={[
                        { label: 'Tenant aktif', value: stats?.tenants ?? '—' },
                        { label: 'Bilik tersewa', value: `${Math.round(((workspaceStats?.occupancy_rate ?? 0) / 100) * (workspaceStats?.total_slots ?? 0))}/${workspaceStats?.total_slots ?? 0}` },
                        { label: 'Lulus inkubasi', value: graduations?.graduated ?? 0 },
                    ]}
                    cta={{ to: '/admin/workspace', label: 'Sewa Ruang' }}
                />

                <RevenueStreamCard
                    title="Divisi Knowledge Asset Management"
                    subtitle="Komersialisasi paten & HKI PENS"
                    icon={Lightbulb}
                    color="amber"
                    stats={[
                        { label: 'Total HKI', value: patentStats?.total ?? 0 },
                        { label: 'Granted', value: patentStats?.granted ?? 0 },
                        { label: 'Dilisensikan', value: patentStats?.licensed ?? 0 },
                    ]}
                    cta={{ to: '/admin/patents', label: 'Portofolio Paten' }}
                />

                <RevenueStreamCard
                    title="Divisi Applied Research & Innovation"
                    subtitle="Produk dosen, pengukuran TKT/MRL"
                    icon={FlaskConical}
                    color="sky"
                    stats={[
                        { label: 'Produk', value: researchProductStats?.total ?? 0 },
                        { label: 'Avg TKT', value: researchProductStats?.avg_trl || '—' },
                        { label: 'Avg MRL', value: researchProductStats?.avg_mrl || '—' },
                    ]}
                    cta={{ to: '/admin/research-products', label: 'Produk Dosen' }}
                />

                <RevenueStreamCard
                    title="Divisi Tech Deployment & Partnership"
                    subtitle="MoU, PKS, kerjasama industri"
                    icon={Cog}
                    color="violet"
                    stats={[
                        { label: 'Total MoU/PKS', value: partnerships?.total ?? 0 },
                        { label: 'Aktif', value: partnerships?.active ?? 0 },
                        { label: 'Nilai', value: fmtIDRCompact(partnershipsValue) },
                    ]}
                    cta={{ to: '/admin/partnerships', label: 'Kerjasama' }}
                />
            </div>

            {/* KPI INKUBATOR — yang sudah jalan */}
            <h2 className="text-base font-bold text-slate-900 mb-3">Metrik Inkubator</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <StatCard
                    label="Tenant Binaan"
                    value={stats?.tenants ?? '—'}
                    icon={Building2}
                    color="emerald"
                />
                <StatCard
                    label="Topik Riset"
                    value={stats?.research ?? '—'}
                    icon={FlaskConical}
                    color="sky"
                />
                <StatCard
                    label="Mitra Industri"
                    value={stats?.partners ?? '—'}
                    icon={Handshake}
                    color="amber"
                />
                <StatCard
                    label="Kerjasama / MoU"
                    value={partnerships?.total ?? '—'}
                    icon={FileText}
                    color="violet"
                />
            </div>

            {/* AKSES CEPAT — re-grouped sesuai 4 divisi */}
            <h2 className="text-base font-bold text-slate-900 mb-3">Akses Cepat</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card title="Operasi Inkubator" subtitle="Workflow tenant & evaluasi">
                    <Quick to="/admin/applications" icon="file-text" title="Seleksi Tenant" desc="Review pendaftaran + AI screening + penilaian proposal/wawancara" highlight />
                    <Quick to="/admin/tenants" icon="building" title="Tenant" desc="Profil startup binaan + sektor + tahap inkubasi" />
                    <Quick to="/admin/monev-assessments" icon="clipboard" title="Penilaian Inkubasi" desc="Monev 2 tahap dengan rubrik KPI, kelulusan skor ≥ 80" />
                    <Quick to="/admin/graduations" icon="grad" title="Kelulusan Tenant" desc="Evaluasi exit strategy berdasar kriteria finansial" />
                </Card>

                <Card title="Stakeholder & Kerjasama" subtitle="Mitra industri, investor, MoU">
                    <Quick to="/admin/partnerships" icon="file-text" title="Kerjasama / MoU" desc="Tracking semua kerjasama institusional UPA" highlight />
                    <Quick to="/admin/partner-companies" icon="handshake" title="Mitra Industri" desc="Database perusahaan partner" />
                    <Quick to="/admin/investors" icon="briefcase" title="Investor" desc="Angel, VC, CVC, family office" />
                    <Quick to="/admin/match-records" icon="link" title="Match Records" desc="Hasil matchmaking research ↔ industri" />
                </Card>
            </div>

            <div className="mt-6 p-4 rounded-xl ring-1 ring-amber-200 text-sm text-slate-800" style={{ background: '#fffbeb' }}>
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="block">Roadmap berikutnya</strong>
                        <span className="text-xs text-slate-700">
                            3 divisi baru (Lisensi HKI, Jasa Riset, R&D Industri) akan dibangun bertahap untuk mendigitalkan seluruh aliran pendapatan UPA. Prioritas tergantung mana yang sudah jalan secara operasional tapi belum tercatat di sistem.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardHeadline({ target, totalRealized, sewaRevenue, sewaPotential, hkiRoyalty, hkiLicensed, partnershipsValue, partnershipsActive, graduated, occupancy }) {
    const progress = Math.min(100, Math.round((totalRealized / target) * 100));

    return (
        <div className="mb-6 rounded-2xl text-white p-6 relative overflow-hidden" style={{ background: '#0d1830' }}>
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <div className="text-[11px] uppercase tracking-widest font-bold text-amber-400">
                            Target Pendapatan Non-UKT 2026
                        </div>
                        <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
                                {fmtIDR(totalRealized)}
                            </div>
                            <div className="text-sm text-slate-300">
                                / {fmtIDR(target)}
                            </div>
                            <div className={`text-sm font-bold ${progress >= 80 ? 'text-emerald-400' : progress >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                                ({progress}%)
                            </div>
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                            Realisasi tunai YTD: sewa ruang dibayar + royalti HKI aktif. Pipeline nilai kerjasama: {fmtIDR(partnershipsValue)}.
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <Banknote className="h-12 w-12 text-amber-400/40" />
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-primary-700/50 rounded-full h-3 mb-5 overflow-hidden">
                    <div
                        className={`h-3 rounded-full transition-all ${progress >= 80 ? 'bg-emerald-500' : progress >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-primary-700">
                    <RevenueStreamBadge
                        label="Sewa Ruang"
                        value={fmtIDRCompact(sewaRevenue)}
                        unit={`dari ${fmtIDRCompact(sewaPotential)} potensi`}
                        active={sewaRevenue > 0}
                        highlight
                    />
                    <RevenueStreamBadge
                        label="Royalti HKI"
                        value={hkiRoyalty > 0 ? fmtIDRCompact(hkiRoyalty) : '—'}
                        unit={`${hkiLicensed} dilisensikan`}
                        active={hkiRoyalty > 0}
                    />
                    <RevenueStreamBadge
                        label="Kerjasama R&D"
                        value={partnershipsActive > 0 ? fmtIDRCompact(partnershipsValue) : '—'}
                        unit={`${partnershipsActive} MoU/PKS aktif`}
                        active={partnershipsActive > 0}
                    />
                    <RevenueStreamBadge
                        label="Spin-off Tenant"
                        value={graduated}
                        unit="lulus inkubasi"
                        active={graduated > 0}
                    />
                </div>

                <div className="mt-3 text-[11px] text-slate-300">
                    Okupansi ruang inkubator: <strong className="text-amber-400">{occupancy}%</strong> · Kepala UPA: Aji Sapta Pramulen
                </div>
            </div>
        </div>
    );
}

function fmtIDRCompact(n) {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} M`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} jt`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)} rb`;
    return 'Rp 0';
}

function RevenueStreamBadge({ label, value, unit, active, highlight }) {
    return (
        <div className={`rounded-lg p-2.5 ${highlight ? 'bg-amber-500/15 ring-1 ring-amber-400/40' : active ? 'bg-emerald-500/15 ring-1 ring-emerald-400/30' : 'bg-primary-800/40'}`}>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-300">{label}</div>
            <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-lg font-extrabold ${highlight ? 'text-amber-300' : active ? 'text-emerald-300' : 'text-slate-400'}`}>{value}</span>
                <span className="text-[10px] text-slate-400">{unit}</span>
            </div>
        </div>
    );
}

function RevenueStreamCard({ title, subtitle, icon: Icon, color, stats, cta, comingSoon, plannedFeatures }) {
    const colorMap = {
        emerald: { bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: 'text-emerald-700', accent: 'bg-emerald-600' },
        amber:   { bg: 'bg-amber-50',   ring: 'ring-amber-200',   icon: 'text-amber-700',   accent: 'bg-amber-600' },
        sky:     { bg: 'bg-sky-50',     ring: 'ring-sky-200',     icon: 'text-sky-700',     accent: 'bg-sky-600' },
        violet:  { bg: 'bg-violet-50',  ring: 'ring-violet-200',  icon: 'text-violet-700',  accent: 'bg-violet-600' },
    };
    const c = colorMap[color] || colorMap.emerald;

    return (
        <div className={`rounded-xl ring-1 ${c.ring} ${c.bg} p-4 flex flex-col`}>
            <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-white ring-1 ${c.ring}`}>
                    <Icon className={`h-5 w-5 ${c.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{title}</h3>
                        {comingSoon && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-amber-400 font-bold uppercase tracking-wider">
                                Segera Hadir
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-3 gap-2 mt-1">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white/70 rounded p-2">
                            <div className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold leading-tight">{s.label}</div>
                            <div className="text-base font-extrabold text-slate-900 mt-0.5">{s.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {plannedFeatures && (
                <ul className="space-y-1 text-xs text-slate-700 mt-1">
                    {plannedFeatures.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                            <span className="text-slate-400 mt-0.5">•</span>
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>
            )}

            {cta && (
                <Link
                    to={cta.to}
                    className="mt-3 inline-flex items-center justify-between text-xs font-bold text-slate-900 hover:underline"
                >
                    <span>{cta.label}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            )}
        </div>
    );
}

function Card({ title, subtitle, children }) {
    return (
        <section className="bg-white rounded-2xl ring-1 ring-slate-200 p-5">
            <div className="mb-3">
                <h2 className="font-bold text-base text-slate-900">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="space-y-2">{children}</div>
        </section>
    );
}

function Quick({ to, icon: iconKey, title, desc, highlight, external }) {
    const QUICK_ICONS = {
        'file-text': FileText, 'building': Building2, 'clipboard': ClipboardList,
        'grad': GraduationCap, 'handshake': Handshake, 'briefcase': Briefcase,
        'link': ChevronRight, 'external': ExternalLink,
    };
    const Icon = QUICK_ICONS[iconKey];
    const content = (
        <div className={`flex items-start gap-3 p-3 rounded-xl transition cursor-pointer ${
            highlight
                ? 'ring-1 ring-amber-200 hover:bg-slate-50'
                : 'hover:bg-slate-50'
        }`}>
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
                {Icon && <Icon className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2">
                    {title}
                    {highlight && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold uppercase">Baru</span>}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{desc}</div>
            </div>
            <span className="text-slate-400 shrink-0 mt-0.5">{external ? <ExternalLink className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
        </div>
    );
    if (external) return <a href={to}>{content}</a>;
    return <Link to={to}>{content}</Link>;
}
