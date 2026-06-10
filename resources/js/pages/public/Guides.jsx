import { Link } from 'react-router-dom';

/**
 * Panduan / Guides — daftar PDF panduan untuk tenant, mitra, dan civitas.
 * Inspirasi: innovation.ui.ac.id (3 panduan utama).
 *
 * File PDF di-store di public/panduan/. Link langsung — atau bisa di-stream
 * via API kalau perlu access control.
 */

const GUIDES = [
    {
        category: 'Pendaftaran',
        items: [
            {
                icon: '📄',
                title: 'Panduan Pendaftaran Tenant PENSNOVA',
                desc: 'Step-by-step cara mendaftar sebagai tenant inkubasi: persyaratan, dokumen, alur seleksi.',
                file: '/panduan/pendaftaran-tenant.pdf',
                size: '450 KB',
            },
            {
                icon: '📋',
                title: 'Template Pitch Deck',
                desc: 'Template PowerPoint 12 slide untuk pendaftaran — struktur problem, solusi, market, traction, tim.',
                file: '/panduan/template-pitchdeck.pptx',
                size: '2.1 MB',
            },
        ],
    },
    {
        category: 'Pembinaan',
        items: [
            {
                icon: '🎓',
                title: 'Panduan Program Inkubasi',
                desc: 'Tahapan pembinaan dari Pra-Inkubasi → Inkubasi → Scale-Up. KPI, milestone, scope mentoring.',
                file: '/panduan/program-inkubasi.pdf',
                size: '1.8 MB',
            },
            {
                icon: '📊',
                title: 'Format Laporan Progress Bulanan',
                desc: 'Template laporan progress yang harus diisi tenant setiap bulan ke admin PENSNOVA.',
                file: '/panduan/template-progress-report.docx',
                size: '180 KB',
            },
        ],
    },
    {
        category: 'HKI / Kekayaan Intelektual',
        items: [
            {
                icon: '🛡️',
                title: 'Panduan Pendaftaran HKI',
                desc: 'Cara mendaftarkan paten, hak cipta, merek, dan desain industri ke DJKI Kemenkumham.',
                file: '/panduan/pendaftaran-hki.pdf',
                size: '1.2 MB',
            },
            {
                icon: '⚖️',
                title: 'Panduan Lisensi & Komersialisasi',
                desc: 'Mekanisme lisensi teknologi: capital intensive vs non-capital, royalti, MoU.',
                file: '/panduan/lisensi-komersialisasi.pdf',
                size: '900 KB',
            },
        ],
    },
    {
        category: 'Kemitraan',
        items: [
            {
                icon: '🤝',
                title: 'Panduan Research Collaboration',
                desc: 'Skema kolaborasi riset dengan industri & pemerintah daerah, termasuk pendanaan.',
                file: '/panduan/research-collaboration.pdf',
                size: '1.4 MB',
            },
            {
                icon: '💼',
                title: 'Panduan Pengajuan Pendanaan',
                desc: 'Akses pendanaan: BRIN, CPPBT, PPBT, Pertamuda, Kementerian, BUMN, swasta.',
                file: '/panduan/pengajuan-pendanaan.pdf',
                size: '780 KB',
            },
        ],
    },
];

export default function Guides() {
    return (
        <div className="bg-slate-50">
            <section className="bg-gradient-to-br from-primary-800 via-primary-900 to-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                    <Link to="/" className="text-amber-300 hover:text-amber-400 text-sm mb-4 inline-block">
                        ← Beranda
                    </Link>
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400 mb-2">
                        Resources
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                        Panduan & Template
                    </h1>
                    <p className="mt-3 text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed">
                        Dokumen panduan lengkap untuk tenant, mentor, mitra industri, dan civitas akademika
                        PENS. Download gratis untuk membantu proses pendaftaran, pembinaan, HKI, dan kemitraan.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
                {GUIDES.map((cat) => (
                    <div key={cat.category}>
                        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary-700 mb-3">
                            {cat.category}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {cat.items.map((g) => (
                                <GuideCard key={g.title} guide={g} />
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            <section className="bg-amber-50 border-t border-amber-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <h2 className="font-bold text-lg text-amber-900">Butuh panduan tambahan?</h2>
                    <p className="text-sm text-amber-800 mt-1 mb-3">
                        Hubungi tim PENSNOVA untuk konsultasi langsung atau request dokumen tambahan.
                    </p>
                    <a
                        href="mailto:penssky.inkubator@div.pens.ac.id"
                        className="inline-block px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    >
                        ✉️ Hubungi Tim
                    </a>
                </div>
            </section>
        </div>
    );
}

function GuideCard({ guide }) {
    return (
        <a
            href={guide.file}
            download
            className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-5 hover:shadow-md hover:ring-primary-300 transition group flex items-start gap-3"
        >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-2xl group-hover:bg-primary-100 transition">
                {guide.icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-primary-700">
                    {guide.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {guide.desc}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-primary-700 font-semibold">⬇ Download</span>
                    <span className="text-slate-400">{guide.size}</span>
                </div>
            </div>
        </a>
    );
}
