import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, Calendar, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function ApplyThanks() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-sm overflow-hidden">
                {/* Hero banner */}
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-primary-700 text-white p-8 sm:p-12 text-center">
                    <div className="inline-flex h-20 w-20 rounded-full bg-white/15 ring-4 ring-white/20 items-center justify-center mb-4">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">Terima Kasih!</h1>
                    <p className="text-emerald-50 mt-3 max-w-xl mx-auto text-sm sm:text-base">
                        Pendaftaran tenant PENSNOVA Anda telah berhasil diterima. Tim UPA akan meninjau
                        proposal Anda dalam <strong>5-7 hari kerja</strong>.
                    </p>
                </div>

                {/* Next steps */}
                <div className="p-6 sm:p-8">
                    <h2 className="font-bold text-base sm:text-lg text-slate-900 mb-4">Apa yang terjadi selanjutnya?</h2>

                    <ol className="space-y-4 mb-6">
                        <Step
                            num="1"
                            icon={Mail}
                            title="Konfirmasi via Email"
                            desc="Anda akan menerima email konfirmasi dalam 1×24 jam berisi nomor pendaftaran & instruksi awal."
                        />
                        <Step
                            num="2"
                            icon={Calendar}
                            title="Screening Proposal & Wawancara"
                            desc="Tim UPA me-review proposal Anda. Bila lolos screening, Anda dijadwalkan untuk sesi pitching."
                        />
                        <Step
                            num="3"
                            icon={LayoutDashboard}
                            title="Akses Dashboard Tenant"
                            desc="Setelah terkonfirmasi sebagai tenant, akun login dashboard akan dikirim ke email Anda."
                        />
                    </ol>

                    <div className="bg-amber-50 ring-1 ring-amber-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">💡</div>
                            <div className="text-sm">
                                <strong className="text-amber-900">Tips sambil menunggu:</strong>
                                <ul className="text-amber-800 list-disc list-inside mt-1 space-y-0.5">
                                    <li>Cek email (termasuk folder spam) untuk update status</li>
                                    <li>Siapkan dokumen pendukung tambahan (CV anggota tim, proof of concept)</li>
                                    <li>Pelajari <Link to="/program" className="underline font-semibold">program inkubasi</Link> untuk persiapan wawancara</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/login"
                            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm shadow-sm transition"
                        >
                            <LayoutDashboard className="h-4 w-4 mr-1.5" /> Login Dashboard
                        </Link>
                        <Link
                            to="/startup"
                            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition"
                        >
                            Lihat Alumni Startup <ArrowRight className="h-4 w-4 ml-1.5" />
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center px-5 py-2.5 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold text-sm transition"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500">
                Ada pertanyaan? Hubungi <a href="mailto:penssky.inkubator@div.pens.ac.id" className="text-primary-700 font-semibold hover:underline">penssky.inkubator@div.pens.ac.id</a>
            </div>
        </div>
    );
}

function Step({ num, icon: Icon, title, desc }) {
    return (
        <li className="flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full bg-primary-50 ring-1 ring-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                {num}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="h-4 w-4 text-primary-700" />
                    <h3 className="font-bold text-sm text-slate-900">{title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
        </li>
    );
}
