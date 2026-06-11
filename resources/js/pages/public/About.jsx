import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Monitor, DollarSign, GraduationCap, Building2, Handshake, Building, Globe, Flag, Users, Award } from 'lucide-react';
import OrgChart from '../../components/OrgChart';
import InnovationFramework from '../../components/InnovationFramework';
import Animate from '../../components/Animate';

const pengakuan = [
    { tag: '2015', label: 'SK Pendirian',                detail: 'PENS Sky Venture didirikan resmi 15 Januari 2015' },
    { tag: 'AIBI', label: 'Anggota Aktif',               detail: 'Asosiasi Inkubator Bisnis Indonesia' },
    { tag: '2021', label: 'ADB Recognition',             detail: 'Inkubator bisnis terbaik pilihan Asian Development Bank' },
    { tag: '2022', label: 'Juara 1 Surabaya',            detail: 'Penghargaan inkubator kampus terbaik Surabaya' },
    { tag: '2023', label: 'Gold Medal BeritaJatim',      detail: 'Inkubator terbaik Jawa Timur' },
    { tag: '2024', label: 'PKS Disperindag Jatim',       detail: 'Gebyar Startup Jatim 2024' },
];

const stakeholders = [
    {
        icon: Building2,
        title: 'Institusi (PENS)',
        body: 'Mendukung transformasi PENS sebagai perguruan tinggi teknopreneur sains terapan berkelas dunia dengan tata kelola profesional, transparan, dan berorientasi dampak nyata.',
    },
    {
        icon: Building,
        title: 'Mitra Industri',
        body: 'Kanal komersialisasi efektif via Teaching Industry, lisensi teknologi siap pakai, kemitraan strategis, dan pembentukan spin-off relevan.',
    },
    {
        icon: Flag,
        title: 'Pemerintah',
        body: 'Pendekatan demand-pull untuk menjawab kebutuhan nasional — solusi teknologi tepat guna selaras dengan kebijakan & pelayanan publik.',
    },
    {
        icon: Users,
        title: 'Masyarakat Luas',
        body: 'Produk unggulan berdampak langsung pada kualitas hidup — edutech, healthtech, lingkungan, smart city.',
    },
];

const peranStrategis = [
    {
        icon: Monitor,
        title: 'Pusat Pengembangan Teknologi Unggulan',
        body: 'Unit utama dalam pengembangan, hilirisasi, dan inkubasi teknologi sains terapan yang berorientasi teknopreneurship.',
    },
    {
        icon: DollarSign,
        title: 'Valorisasi Inovasi Akademik',
        body: 'Mengubah hasil riset dan inovasi sivitas akademika menjadi produk dengan nilai guna nyata serta nilai ekonomi tinggi.',
    },
    {
        icon: GraduationCap,
        title: 'Pembinaan Teknopreneurship',
        body: 'Menyelenggarakan program Startup Academy untuk mencetak founder startup tangguh dan produk unggulan berdaya saing global.',
    },
    {
        icon: Building2,
        title: 'Ekosistem Bisnis Terintegrasi',
        body: 'Membangun workspace inkubator yang mendorong kolaborasi aktif antar tenant, sinergi lintas disiplin, dan pertumbuhan berkelanjutan.',
    },
    {
        icon: Handshake,
        title: 'Komersialisasi Strategis',
        body: 'Memperkuat kemitraan industri untuk akselerasi lisensi teknologi, pembentukan spin-off, dan implementasi teaching industry.',
    },
];

// * Komponen utama halaman profil institusi UPA PENSNOVA
export default function About() {
    return (
        <div style={{ background: '#f8f9fc' }} className="min-h-screen">

            {/* * ------------------------------------------------------------ */}
            {/* Hero */}
            <section
                className="relative overflow-hidden text-white"
                style={{ background: '#0d1830' }}
            >
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <Animate variant="fade-up">
                        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold mb-6 transition hover:underline" style={{ color: '#ffaf00' }}>
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                        </Link>
                        <div className="text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-3" style={{ color: '#ffaf00' }}>
                            Profil Institusi
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                            Tentang <span style={{ color: '#ffaf00' }}>PENSNOVA</span>
                        </h1>
                        <p className="mt-5 text-base sm:text-lg max-w-3xl leading-relaxed opacity-90" style={{ color: '#cbd5e1' }}>
                            UPA Pengembangan Teknologi &amp; Produk Unggulan — Politeknik Elektronika Negeri Surabaya.
                            Menjalankan fungsi <strong className="text-white font-bold">hilirisasi riset</strong>, <strong className="text-white font-bold">manajemen HKI</strong>, <strong className="text-white font-bold">inkubasi startup</strong> teknopreneurship,
                            dan <strong className="text-white font-bold">kemitraan industri</strong>.
                        </p>
                    </Animate>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Visi */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                <Animate variant="scale-in">
                    <div
                        className="rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden"
                        style={{ background: '#142143' }}
                    >

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#ffaf00' }}>
                                <Globe className="w-4 h-4" /> Visi UPA PENSNOVA
                            </div>
                            <p className="text-lg sm:text-xl md:text-2xl font-bold leading-relaxed max-w-4xl tracking-tight">
                                "Menjadi unit unggulan dalam pengembangan, hilirisasi, dan inkubasi teknologi sains terapan yang berorientasi{' '}
                                <span style={{ color: '#ffaf00' }}>teknopreneurship</span>, berdaya saing global, dan berdampak nyata bagi industri serta masyarakat."
                            </p>
                        </div>
                    </div>
                </Animate>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Peran Strategis */}
            <section style={{ background: '#ffffff', borderTop: '1px dashed #d4d4d4', borderBottom: '1px dashed #d4d4d4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up">
                        <header className="text-center max-w-2xl mx-auto mb-12">
                            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}><Flag className="w-3.5 h-3.5" /> Peran Strategis</div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>Latar Belakang &amp; Mandat UPA</h2>
                            <p className="mt-3 text-sm sm:text-base text-slate-500">5 fungsi utama yang dijalankan PENSNOVA untuk mendukung visi PENS.</p>
                        </header>
                    </Animate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {peranStrategis.map((p, i) => (
                            <Animate key={p.title} variant="fade-up" delay={(i % 4) + 1}>
                                <div
                                    className="rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200 h-full"
                                    style={{ background: '#ffffff', border: '1px solid #e4e4e4', borderLeft: '4px solid #1a5d94' }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(26,93,148,0.06)' }}>
                                            <p.icon className="w-5 h-5 text-primary-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">{p.title}</h3>
                                            <p className="text-sm mt-2 leading-relaxed text-slate-500">{p.body}</p>
                                        </div>
                                    </div>
                                </div>
                            </Animate>
                        ))}
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Struktur Organisasi */}
            <section style={{ background: '#f8f9fc' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up">
                        <header className="text-center max-w-2xl mx-auto mb-12">
                            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}><Building className="w-3.5 h-3.5" /> Tata Kelola & Manajemen</div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>
                                Struktur Organisasi <span style={{ color: '#1a5d94' }}>UPA</span>
                            </h2>
                        </header>
                    </Animate>
                    <Animate variant="fade-in" delay={1}>
                        <OrgChart />
                    </Animate>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Framework */}
            <section style={{ background: '#ffffff', borderTop: '1px dashed #d4d4d4', borderBottom: '1px dashed #d4d4d4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up">
                        <header className="text-center max-w-2xl mx-auto mb-12">
                            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}><Globe className="w-3.5 h-3.5" /> Framework Strategis</div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>Applied Innovation Framework</h2>
                            <p className="text-sm sm:text-base mt-3 text-slate-500">Alur inovasi terapan dari kebutuhan pasar hingga komersialisasi — dengan loop feedback berkelanjutan.</p>
                        </header>
                    </Animate>
                    <Animate variant="fade-in" delay={1}>
                        <InnovationFramework />
                    </Animate>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Stakeholder Value */}
            <section style={{ background: '#f8f9fc' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up">
                        <header className="text-center max-w-2xl mx-auto mb-10">
                            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#1a5d94' }}><Handshake className="w-3.5 h-3.5" /> Dampak Strategis</div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>Nilai Tambah bagi Pemangku Kepentingan</h2>
                        </header>
                    </Animate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {stakeholders.map((s, i) => (
                            <Animate key={s.title} variant="scale-in" delay={(i % 4) + 1}>
                                <div className="rounded-2xl p-6 sm:p-7 hover:-translate-y-1 transition-all duration-200 h-full" style={{ background: '#ffffff', border: '1px solid #e4e4e4' }}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(26,93,148,0.06)' }}>
                                            <s.icon className="w-5 h-5 text-primary-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-base sm:text-lg text-slate-955">{s.title}</h3>
                                            <p className="text-sm mt-2 leading-relaxed text-slate-500">{s.body}</p>
                                        </div>
                                    </div>
                                </div>
                            </Animate>
                        ))}
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Pengakuan */}
            <section style={{ background: '#ffffff', borderTop: '1px dashed #d4d4d4', borderBottom: '1px dashed #d4d4d4' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Animate variant="fade-up">
                        <header className="text-center max-w-2xl mx-auto mb-10">
                            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#b45309' }}><Award className="w-3.5 h-3.5" /> Rekam Jejak</div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#142143' }}>Pengakuan &amp; Penghargaan</h2>
                            <p className="mt-3 text-sm sm:text-base text-slate-500">Track record yang membuktikan komitmen kami sejak 2015.</p>
                        </header>
                    </Animate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pengakuan.map((p, i) => (
                            <Animate key={p.label} variant="fade-up" delay={(i % 3) + 1}>
                                <div className="rounded-2xl p-5 flex items-start gap-3 hover:-translate-y-1 transition-all duration-200 h-full" style={{ background: '#f8f9fc', border: '1px solid #e4e4e4' }}>
                                    <span className="shrink-0 inline-flex items-center justify-center min-w-[3.25rem] h-9 px-2 rounded-lg font-extrabold text-xs text-white" style={{ background: '#ffaf00' }}>
                                        {p.tag}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="font-extrabold text-sm text-slate-900">{p.label}</div>
                                        <div className="text-xs mt-1 leading-relaxed text-slate-500">{p.detail}</div>
                                    </div>
                                </div>
                            </Animate>
                        ))}
                    </div>
                </div>
            </section>

            {/* * ------------------------------------------------------------ */}
            {/* Final CTA */}
            <section className="relative overflow-hidden" style={{ background: '#0d1830' }}>
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
                    <Animate variant="scale-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-5" style={{ background: 'rgba(255,175,0,0.15)', border: '1px solid rgba(255,175,0,0.4)', color: '#ffaf00' }}>
                            <Calendar className="w-3.5 h-3.5" /> Batch 2026 dibuka
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">Tertarik berkolaborasi dengan PENSNOVA?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg opacity-85" style={{ color: '#cbd5e1' }}>Industri, investor, dan pemerintah — mari bersinergi membangun ekosistem inovasi berdampak.</p>
                        <div className="mt-9 flex flex-wrap gap-3 justify-center">
                            <Link to="/program" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition hover:opacity-90 hover:-translate-y-0.5 btn-glow" style={{ background: '#ffaf00', color: '#0d1830' }}>
                                Lihat Program &amp; Layanan <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="mailto:penssky.inkubator@div.pens.ac.id" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition hover:opacity-90 border border-white/20 hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff' }}>
                                Hubungi Kami
                            </a>
                        </div>
                    </Animate>
                </div>
            </section>
        </div>
    );
}

/*
## PENJELASAN CODE:

### About()
- Fungsi: Komponen halaman profil institusi UPA PENSNOVA yang merangkum data visi, peran strategis, struktur bagan, framework inovasi, stakeholder, dan daftar penghargaan.
- Parameter: Tidak ada.
- Return: Elemen JSX halaman profil institusi.
- Cara pakai: `<About />`
- Catatan: Layout dirombak agar modern dengan background mesh gradient di hero section, visual glassmorphism pada box Visi, transisi hover halus, dan responsivitas mobile penuh.
*/
