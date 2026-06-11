import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Sparkles, Building2, Lightbulb, FlaskConical, Handshake, GraduationCap,
    TrendingUp, Target, DollarSign, Rocket, ChartBar, Award,
} from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/Skeleton';
import PageHero from '../../components/PageHero';

const fmtIDR = (n) => {
    const num = Number(n || 0);
    if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)} M`;
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(0)} jt`;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

const fmtNum = (n) => Number(n || 0).toLocaleString('id-ID');

export default function Impact() {
    const { data, isLoading } = useQuery({
        queryKey: ['public', 'impact-stats'],
        queryFn: () => api.get('/api/public/impact-stats').then((r) => r.data),
    });

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <Skeleton height="h-10" width="w-2/3" className="mx-auto mb-3" />
                <Skeleton height="h-4" width="w-1/2" className="mx-auto mb-8" />
                <Skeleton height="h-48" className="rounded-3xl mb-8" />
                <Skeleton.Stats count={4} />
            </div>
        );
    }
    if (! data) return null;

    const totalRevenue = (data.revenue?.sewa_ruang || 0) + (data.revenue?.partnership_value || 0);
    const targetPct = data.revenue?.target_annual
        ? Math.min(100, Math.round((totalRevenue / data.revenue.target_annual) * 100))
        : 0;

    return (
        <div className="bg-slate-50">
            <PageHero
                eyebrow="Innovation Hub · Realtime"
                title="Dampak"
                accent="UPA"
                titleAfter=" PENSNOVA"
                subtitle="UPA Pengembangan Teknologi & Produk Unggulan PENS menjalankan 4 aliran pendapatan non-UKT: inkubasi tenant, komersialisasi HKI, jasa riset, R&D industri. Angka di bawah menunjukkan hasil konkret secara realtime."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="text-center text-[10px] text-slate-500 mb-6">
                    Diperbarui: {new Date(data.updated_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </div>

            {/* HEADLINE — Target Revenue */}
            <div className="text-white rounded-3xl p-6 sm:p-10 mb-8" style={{ background: '#0d1830' }}>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1">Realisasi vs Target Tahunan</div>
                        <div className="text-3xl sm:text-5xl font-extrabold">{fmtIDR(totalRevenue)}</div>
                        <div className="text-xs sm:text-sm text-primary-200 mt-1">
                            dari target <strong>{fmtIDR(data.revenue?.target_annual ?? 0)}</strong> tahun ini
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl sm:text-5xl font-extrabold text-amber-300">{targetPct}%</div>
                        <div className="text-xs text-primary-200">tercapai</div>
                    </div>
                </div>
                <div className="bg-primary-800/50 rounded-full overflow-hidden h-3">
                    <div className="bg-amber-400 h-full transition-all" style={{ width: targetPct + '%' }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 text-center">
                    <RevenueStream label="Sewa Ruang Inkubator" value={fmtIDR(data.revenue?.sewa_ruang)} />
                    <RevenueStream label="Nilai Kerjasama Aktif" value={fmtIDR(data.revenue?.partnership_value)} />
                    <RevenueStream label="Alumni saat Lulus" value={fmtIDR(data.revenue?.alumni_revenue_at_grad)} />
                </div>
            </div>

            {/* 4 PILAR */}
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 inline-flex items-center gap-2"><Award className="w-5 h-5 text-primary-700" /> Empat Pilar UPA PENSNOVA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <PillarCard
                    icon={Rocket}
                    tone="emerald"
                    title="Technopreneurship & Venture Building"
                    subtitle="Inkubasi tenant, spin-off startup, sewa ruang"
                    metrics={[
                        { label: 'Tenant aktif', value: fmtNum(data.tenants.incubating) },
                        { label: 'Alumni lulus', value: fmtNum(data.tenants.alumni) },
                        { label: 'Bilik tersewa', value: `${data.workspace.occupied_slots} / ${data.workspace.total_slots}` },
                    ]}
                    cta={{ to: '/startup', label: 'Direktori Startup →' }}
                />

                <PillarCard
                    icon={Lightbulb}
                    tone="amber"
                    title="Knowledge Asset Management"
                    subtitle="Komersialisasi HKI — paten, hak cipta, royalti"
                    metrics={[
                        { label: 'Total HKI', value: fmtNum(data.patents.total) },
                        { label: 'Granted', value: fmtNum(data.patents.granted) },
                        { label: 'Dilisensikan', value: fmtNum(data.patents.licensed) },
                    ]}
                    cta={{ to: '/produk-inovasi', label: 'Produk Inovasi →' }}
                />

                <PillarCard
                    icon={FlaskConical}
                    tone="sky"
                    title="Applied Research & Innovation"
                    subtitle="Produk dosen, pengukuran TKT/MRL"
                    metrics={[
                        { label: 'Total produk', value: fmtNum(data.products.total) },
                        { label: 'Siap komersialisasi', value: fmtNum(data.products.ready_to_commercialize) },
                        { label: 'Avg TKT', value: data.products.avg_trl || '—' },
                    ]}
                    cta={{ to: '/riset', label: 'Topik Riset →' }}
                />

                <PillarCard
                    icon={Handshake}
                    tone="violet"
                    title="Tech Deployment & Partnership"
                    subtitle="Kerjasama industri, MoU, PKS, jasa R&D"
                    metrics={[
                        { label: 'Total kerjasama', value: fmtNum(data.partnerships.total) },
                        { label: 'Aktif', value: fmtNum(data.partnerships.active) },
                        { label: 'Nilai aktif', value: fmtIDR(data.partnerships.total_value) },
                    ]}
                    cta={{ to: '/mitra', label: 'Mitra Industri →' }}
                />
            </div>

            {/* SEKTOR DISTRIBUSI */}
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 mb-6">
                <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                    <ChartBar className="h-5 w-5 text-primary-700" /> Distribusi Tenant per Sektor
                </h3>
                {Object.keys(data.tenants.by_sector || {}).length === 0 ? (
                    <p className="text-sm text-slate-500">Belum ada data sektor.</p>
                ) : (
                    <div className="space-y-2">
                        {Object.entries(data.tenants.by_sector).map(([sector, count]) => {
                            const pct = Math.round((count / data.tenants.total_tenants) * 100);
                            return (
                                <div key={sector}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-slate-800 font-semibold">{sector}</span>
                                        <span className="text-slate-600">{count} ({pct}%)</span>
                                    </div>
                                    <div className="bg-slate-100 h-2 rounded overflow-hidden">
                                        <div className="bg-primary-600 h-full" style={{ width: pct + '%' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <CTACard
                    icon={Building2}
                    title="Daftar sebagai Tenant"
                    desc="Mahasiswa, dosen, alumni PENS yang punya ide startup bisa daftar batch inkubasi terbuka."
                    to="/daftar"
                />
                <CTACard
                    icon={Award}
                    title="Cari Produk Inovasi"
                    desc="Calon mitra industri bisa explore katalog produk siap-komersialisasi dengan HKI terdaftar."
                    to="/produk-inovasi"
                />
                <CTACard
                    icon={GraduationCap}
                    title="Lihat Alumni Sukses"
                    desc="Track record startup yang sudah lulus inkubasi & berkomitmen continued partnership."
                    to="/alumni"
                />
            </div>
            </div>
        </div>
    );
}

function RevenueStream({ label, value }) {
    return (
        <div className="bg-primary-800/30 rounded-lg p-3">
            <div className="text-base sm:text-lg font-bold">{value}</div>
            <div className="text-[10px] uppercase tracking-wider text-primary-200 mt-0.5">{label}</div>
        </div>
    );
}

function PillarCard({ icon: Icon, tone, title, subtitle, metrics, cta }) {
    const tones = {
        emerald: { bg: '#ecfdf5', text: 'text-emerald-800', ring: 'ring-emerald-200', icon: 'text-emerald-600' },
        amber: { bg: '#fffbeb', text: 'text-amber-800', ring: 'ring-amber-200', icon: 'text-amber-600' },
        sky: { bg: '#f0f9ff', text: 'text-sky-800', ring: 'ring-sky-200', icon: 'text-sky-600' },
        violet: { bg: '#f5f3ff', text: 'text-violet-800', ring: 'ring-violet-200', icon: 'text-violet-600' },
    };
    const t = tones[tone];

    return (
        <div className={`rounded-2xl ring-1 ${t.ring} p-5`} style={{ background: t.bg }}>
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`inline-flex h-10 w-10 rounded-lg bg-white ${t.icon} items-center justify-center shrink-0`}>
                    <Icon className="h-5 w-5" />
                </div>
                <Link to={cta.to} className={`text-xs ${t.text} hover:underline font-bold`}>{cta.label}</Link>
            </div>
            <h3 className="font-bold text-base mb-1">{title}</h3>
            <p className={`text-xs ${t.text} mb-3`}>{subtitle}</p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-300/30">
                {metrics.map((m) => (
                    <div key={m.label}>
                        <div className={`text-base font-extrabold ${t.text}`}>{m.value}</div>
                        <div className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">{m.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CTACard({ icon: Icon, title, desc, to }) {
    return (
        <Link to={to} className="group bg-white rounded-2xl ring-1 ring-slate-200 p-5 hover:ring-primary-300 transition">
            <Icon className="h-6 w-6 text-primary-600 mb-2" />
            <h4 className="font-bold mb-1 group-hover:text-primary-700">{title}</h4>
            <p className="text-xs text-slate-600">{desc}</p>
        </Link>
    );
}
