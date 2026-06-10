import { Link } from 'react-router-dom';
import { Lightbulb, Rocket, Factory, Map, Users, TrendingUp, UserCheck, GraduationCap, Briefcase, Sprout, Trophy } from 'lucide-react';
import Animate from '../../components/Animate';

const phases = [
    {
        idx: 1,
        name: 'Pra-Inkubasi',
        duration: 'Sekitar 6 Bulan',
        focus: 'Product Focus',
        sasaran: 'Mahasiswa & Dosen',
        funding: 'CPPBT, Kementerian, BUMN',
        scope: ['Mencari Calon Startup', 'Team Formation', 'Design Thinking & UI/UX', 'Branding & HKI'],
        color: 'slate',
    },
    {
        idx: 2,
        name: 'Inkubasi',
        duration: '6 - 12 Bulan',
        focus: 'Customer Focus',
        sasaran: 'Sivitas & Masyarakat Umum',
        funding: 'PPBT, PPBR, BUMN',
        scope: ['Membina Startup', 'Digital Marketing', 'Tata Kelola Produksi', 'Legalitas (PT, Izin Edar)'],
        color: 'primary',
    },
    {
        idx: 3,
        name: 'Scale-Up',
        duration: '6 - 12 Bulan',
        focus: 'Mass Product Focus',
        sasaran: 'Investasi & Ekspansi',
        funding: 'Investor, Kementerian, Swasta',
        scope: ['Business Matching', 'Pitching to Investors', 'Pengelolaan Keuangan', 'Akses Pasar Global'],
        color: 'amber',
    },
];

const colorMap = {
    slate:   { headerBg: '#334155', accent: '#334155', badgeBg: '#f1f5f9', badgeColor: '#334155' },
    primary: { headerBg: '#142143', accent: '#1a5d94', badgeBg: '#eef2f9', badgeColor: '#1a5d94' },
    amber:   { headerBg: '#d97706', accent: '#b45309', badgeBg: '#fef3c7', badgeColor: '#92400e' },
};

const pillarItems = [
    { icon: Factory,   title: 'Workspace Inkubator',      body: 'Ruang kerja berbasis tenant yang kondusif untuk startup tahap awal.' },
    { icon: Map,       title: 'Pemetaan Strategis',        body: 'Penempatan tenant berdasarkan bidang usaha, tahapan, dan posisi value chain.' },
    { icon: Users,     title: 'Kolaborasi Antar Tenant',   body: 'Sinergi B2B antar startup dalam satu workspace untuk saling menguatkan.' },
    { icon: TrendingUp,title: 'Pertumbuhan Berkelanjutan', body: 'Workspace sebagai katalis kematangan usaha & keberlanjutan jangka panjang.' },
];

const serviceItems = [
    { num: '01', icon: UserCheck,    title: 'Coaching & Mentoring Bisnis',  body: 'Pendampingan langsung 1-on-1 oleh mentor berpengalaman untuk akselerasi pengembangan bisnis tenant.' },
    { num: '02', icon: GraduationCap,title: 'Workshop Kewirausahaan',       body: 'Pelatihan & edukasi terjadwal: design thinking, validasi pasar, legal, branding, hingga pitching.' },
    { num: '03', icon: Briefcase,    title: 'Pendampingan Usaha',           body: 'Bantuan teknis & strategis untuk usaha berjalan: scaling produksi, perizinan, kemitraan supplier.' },
    { num: '04', icon: TrendingUp,   title: 'Business Matching & Pitching', body: 'Mempertemukan startup dengan investor, mitra industri, dan pengambil kebijakan via demo day & pitching.', highlight: true },
    { num: '05', icon: Sprout,       title: 'Pengembangan Usaha Baru',      body: 'Inkubasi dari nol: ideasi ke tim formation ke MVP ke pre-seed funding untuk founder pertama kali.' },
    { num: 'Track Record', icon: Trophy, title: 'Track Record',             body: '50+ startup dimentor sejak 2015, 34 startup berhasil mendapat pendanaan dari BRIN.', footer: true },
];

// * Komponen utama halaman program dan layanan inkubasi UPA PENSNOVA
export default function Programs() {
    return (
        <div style={{ background: '#f8f9fc' }} className="min-h-screen">

            {/* * ------------------------------------------------------------ */}
            {/* Hero */}
            <section
                className="relative overflow-hidden text-white"
                style={{ background: 'linear-gradient(135deg, #0d1830, #142143, #1a5d94)' }}
            >
                <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(ellipse at 15% 60%, #ffaf00 0%, transparent 45%), radial-gradient(ellipse at 85% 30%, #1a5d94 0%, transparent 55%)'
                    }}
                />
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <Animate variant="fade-up">
                        <Link to="/" className="text-sm mb-4 inline-block font-bold hover:underline" style={{ color: '#ffaf00' }}>
                            Kembali ke Beranda
                        </Link>
                        <div className="text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-2" style={{ color: '#ffaf00' }}>
                            Strategi &amp; Implementasi
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                            Program Kerja PENSNOVA
                        </h1>
                        <p className="mt-4 text-base sm:text-lg max-w-3xl leading-relaxed opacity-90" style={{ color: '#cbd5e1' }}>
                            Dua fokus utama: pembinaan melalui <strong className="text-white font-bold">Startup Academy</strong> dan penyediaan ekosistem bisnis terintegrasi untuk hilirisasi produk.
                        </p>
                    </Animate>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Startup Academy */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                <Animate variant="fade-up">
                    <header className="text-center mb-12">
                        <div className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}>
                            Inkubasi &amp; Pembinaan
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                            Startup Academy
                        </h2>
                        <p className="text-sm mt-3 max-w-2xl mx-auto text-slate-500">
                            Program pembinaan intensif berbasis teknologi terapan untuk membekali tenant dengan kapabilitas validasi produk dan pasar.
                        </p>
                    </header>
                </Animate>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Problem-Solution Fit */}
                    <Animate variant="slide-left" delay={1}>
                        <div className="rounded-2xl overflow-hidden h-full hover:-translate-y-1 transition-all duration-200" style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}>
                            <div className="p-6 text-white" style={{ background: '#142143' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,175,0,0.15)' }}>
                                        <Lightbulb className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider opacity-80">Tahap 1</div>
                                        <h3 className="text-xl font-extrabold">Problem-Solution Fit</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-primary-500">Fokus Program</div>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        {['Identifikasi masalah berbasis kebutuhan industri & pasar riil', 'Validasi masalah melalui observasi lapangan & wawancara mendalam', 'Perancangan solusi berbasis teknologi sains terapan', 'Pembuatan & pengujian prototipe awal (Proof of Concept)'].map((item) => (
                                            <li key={item} className="flex items-start gap-2">
                                                <span className="font-bold shrink-0 text-primary-500">+</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-4 rounded-xl" style={{ background: '#eef2f9', border: '1px solid rgba(26,93,148,0.15)' }}>
                                    <div className="text-xs font-bold mb-1 text-primary-600">Key Output</div>
                                    <p className="text-xs text-slate-500 leading-relaxed">Dokumentasi masalah tervalidasi secara empiris serta purwarupa solusi yang layak untuk dikembangkan lebih lanjut.</p>
                                </div>
                                <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                    Target IKU: <strong>8 Tim Startup / Tahun</strong>
                                </div>
                            </div>
                        </div>
                    </Animate>

                    {/* Product-Market Fit */}
                    <Animate variant="slide-right" delay={2}>
                        <div className="rounded-2xl overflow-hidden h-full hover:-translate-y-1 transition-all duration-200" style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}>
                            <div className="p-6 text-white" style={{ background: '#1a5d94' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                        <Rocket className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider opacity-85">Tahap 2</div>
                                        <h3 className="text-xl font-extrabold">Product-Market Fit</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-primary-500">Fokus Program</div>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        {['Penyempurnaan produk agar siap masuk ke pasar komersial', 'Validasi minat beli dan tingkat adopsi pengguna aktif', 'Penyusunan model bisnis yang berkelanjutan dan berskala', 'Strategi komersialisasi: Lisensi, Kemitraan, atau Spin-off'].map((item) => (
                                            <li key={item} className="flex items-start gap-2">
                                                <span className="font-bold shrink-0 text-primary-500">+</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-4 rounded-xl" style={{ background: '#eef2f9', border: '1px solid rgba(26,93,148,0.15)' }}>
                                    <div className="text-xs font-bold mb-1 text-primary-600">Key Output</div>
                                    <p className="text-xs text-slate-500 leading-relaxed">Produk siap pasar (Market-Ready), bisnis terdaftar resmi, dan kesiapan akses kemitraan industri.</p>
                                </div>
                                <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                    Target IKU: <strong>2 Produk Jadi / Tahun</strong>
                                </div>
                            </div>
                        </div>
                    </Animate>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* 3 Tahap Layanan Inkubasi */}
            <section style={{ background: '#ffffff', borderTop: '1px solid #e4e4e4', borderBottom: '1px solid #e4e4e4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up">
                        <header className="text-center mb-12">
                            <div className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}>Tahapan Program</div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Layanan Inkubasi UPA</h2>
                            <p className="text-sm mt-3 max-w-2xl mx-auto text-slate-500">Tiga tahap perjalanan tenant: ideasi produk, peluncuran pasar, hingga ekspansi berskala.</p>
                        </header>
                    </Animate>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {phases.map((p, i) => {
                            const c = colorMap[p.color];
                            return (
                                <Animate key={p.idx} variant="scale-in" delay={i + 1}>
                                    <article className="rounded-2xl overflow-hidden h-full hover:-translate-y-1 transition-all duration-200" style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}>
                                        <div className="p-6 text-white" style={{ background: c.headerBg }}>
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="font-extrabold text-lg">{p.name}</h3>
                                                <span className="text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wide" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                    {p.duration}
                                                </span>
                                            </div>
                                            <div className="mt-2.5 inline-block text-xs px-2.5 py-0.5 rounded font-bold bg-white/10">
                                                {p.focus}
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">Sasaran &amp; Pendanaan</div>
                                                <div className="font-extrabold text-sm" style={{ color: c.accent }}>{p.sasaran}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{p.funding}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Pendampingan Mentoring</div>
                                                <ul className="space-y-1.5">
                                                    {p.scope.map((s) => (
                                                        <li key={s} className="text-sm flex items-start gap-2 text-slate-600">
                                                            <span className="font-bold shrink-0" style={{ color: c.accent }}>+</span>
                                                            <span>{s}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </article>
                                </Animate>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Ekosistem Bisnis Terintegrasi */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                <Animate variant="fade-up">
                    <header className="text-center mb-12">
                        <div className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}>Komersialisasi &amp; Sinergi</div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Ekosistem Bisnis Terintegrasi</h2>
                        <p className="text-sm mt-3 max-w-2xl mx-auto text-slate-500">Jembatan strategis antara kebutuhan industri nyata dan hasil riset terapan kampus demi penciptaan nilai.</p>
                    </header>
                </Animate>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pillarItems.map((item, i) => (
                        <Animate key={item.title} variant="scale-in" delay={i + 1}>
                            <div className="rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200 h-full" style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(26,93,148,0.06)' }}>
                                    <item.icon className="w-6 h-6 text-primary-500" />
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                                <p className="text-sm mt-2.5 leading-relaxed text-slate-500">{item.body}</p>
                            </div>
                        </Animate>
                    ))}
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* 5 Layanan Pembinaan Startup */}
            <section style={{ background: '#ffffff', borderTop: '1px solid #e4e4e4', borderBottom: '1px solid #e4e4e4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up">
                        <header className="text-center mb-12">
                            <div className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}>Layanan Konkret</div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">5 Layanan Pembinaan Startup</h2>
                            <p className="text-sm mt-3 max-w-2xl mx-auto text-slate-500">Lima paket layanan inkubasi intensif yang terstruktur untuk menjamin kematangan bisnis tenant secara bertahap.</p>
                        </header>
                    </Animate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {serviceItems.map((item, i) => (
                            <Animate key={item.num} variant="fade-up" delay={(i % 3) + 1}>
                                <ServiceCard {...item} />
                            </Animate>
                        ))}
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Final CTA */}
            <section style={{ background: 'linear-gradient(135deg, #0d1830, #142143, #1a5d94)' }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <Animate variant="fade-up">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Siap Bergabung Sebagai Tenant?</h2>
                        <p className="mt-3 text-base sm:text-lg opacity-85" style={{ color: '#cbd5e1' }}>Daftarkan startup atau gagasan inovasimu pada batch inkubasi yang sedang berjalan.</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Link to="/daftar" className="px-7 py-3.5 rounded-xl font-bold transition hover:opacity-90 hover:-translate-y-0.5 btn-glow" style={{ background: '#ffaf00', color: '#0d1830' }}>
                                Daftar Sekarang
                            </Link>
                            <Link to="/tentang" className="px-7 py-3.5 rounded-xl font-semibold transition hover:opacity-90 border border-white/20 hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff' }}>
                                Tentang UPA PENSNOVA
                            </Link>
                        </div>
                    </Animate>
                </div>
            </section>
        </div>
    );
}

// * Render kartu layanan individu pembinaan startup
function ServiceCard({ num, icon: Icon, title, body, highlight = false, footer = false }) {
    if (footer) {
        return (
            <div className="rounded-2xl p-6 h-full border-2 border-[#ffaf00]" style={{ background: 'linear-gradient(135deg, #fef9ee, #fef3c7)' }}>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,175,0,0.15)' }}>
                        <Icon className="w-6 h-6 text-amber-800" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest font-extrabold text-amber-800">{num}</div>
                        <h3 className="font-extrabold text-amber-900 text-base mt-1.5">{title}</h3>
                        <p className="text-sm mt-2.5 leading-relaxed text-amber-900/80">{body}</p>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div
            className="rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200 h-full"
            style={{
                background: highlight ? '#142143' : '#ffffff',
                border: highlight ? '2px solid #1a5d94' : '1px solid #e4e4e4'
            }}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: highlight ? 'rgba(255,255,255,0.1)' : 'rgba(26,93,148,0.06)' }}>
                    <Icon className="w-6 h-6" style={{ color: highlight ? '#ffaf00' : '#1a5d94' }} />
                </div>
                <span className="text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded" style={{ background: highlight ? 'rgba(255,255,255,0.15)' : 'rgba(26,93,148,0.06)', color: highlight ? '#ffffff' : '#1a5d94' }}>
                    {num}
                </span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg" style={{ color: highlight ? '#ffffff' : '#142143' }}>{title}</h3>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: highlight ? '#cbd5e1' : '#64748b' }}>{body}</p>
        </div>
    );
}

/*
## PENJELASAN CODE:

### Programs()
- Fungsi: Komponen halaman yang menampilkan program-program utama inkubasi (Startup Academy, 3 Tahap Inkubasi, Ekosistem Terintegrasi, dan 5 Layanan Pembinaan).
- Parameter: Tidak ada.
- Return: Elemen JSX halaman Program.
- Cara pakai: `<Programs />`
- Catatan: Menambahkan visual premium dengan mesh gradient di hero, asimetris grid, serta transisi hover bersih tanpa box-shadow.

### ServiceCard(props)
- Fungsi: Menampilkan kartu representasi paket layanan pembinaan dengan variasi visual highlight atau footer.
- Parameter: num (string), icon (LucideIcon), title (string), body (string), highlight (boolean), footer (boolean).
- Return: Elemen JSX kartu layanan.
- Cara pakai: Dipanggil internal oleh Programs.
- Catatan: Mendukung tema gelap kontras tinggi (navy) atau tema peringatan kuning (untuk statistik track record) tanpa box-shadow.
*/
