import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import Logo from '../../components/Logo';
import Spinner from '../../components/Spinner';

/**
 * /feedback — auto-discover survey kepuasan layanan UPA yang aktif,
 * lalu redirect ke /survey/{slug}?t={token}. Kalau tidak ada → tampilkan info.
 *
 * Tujuan: link permanen yang bisa dishare di kop surat, footer website,
 * dashboard tenant, kantor UPA, dll — tanpa perlu update URL setiap kali
 * survey berganti.
 */
export default function FeedbackRedirect() {
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ['public', 'active-feedback-survey'],
        queryFn: () => api.get('/api/public/active-feedback-survey').then((r) => r.data.data),
        retry: false,
    });

    useEffect(() => {
        if (data?.slug && data?.token) {
            navigate(`/survey/${data.slug}?t=${data.token}`, { replace: true });
        }
    }, [data, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-50/40 via-white to-white">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
                    <Logo variant="mark" size="sm" />
                    <div>
                        <div className="font-bold text-sm text-slate-900">PENSNOVA</div>
                        <div className="text-[10px] text-slate-500 leading-none">UPA Pengembangan Teknologi PENS</div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-8 text-center shadow-sm">
                    {isLoading || (data && data.slug) ? (
                        <>
                            <Spinner className="h-10 w-10 mx-auto text-primary-600 mb-3" />
                            <h2 className="font-bold text-base text-slate-900">Menghubungkan ke Survey Kepuasan…</h2>
                            <p className="text-xs text-slate-500 mt-1">Mohon tunggu, mengarahkan Anda ke survey aktif.</p>
                        </>
                    ) : !data && !error ? (
                        <>
                            <ClipboardList className="h-12 w-12 mx-auto text-amber-400 mb-3" />
                            <h2 className="font-bold text-lg text-slate-900">Belum Ada Survey Kepuasan Aktif</h2>
                            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                                Saat ini belum ada survey kepuasan layanan UPA yang dibuka. Mohon cek kembali nanti
                                atau hubungi tim UPA langsung via email.
                            </p>
                            <a
                                href="mailto:aji.sapta@pens.ac.id"
                                className="inline-block mt-4 text-sm font-semibold text-primary-700 hover:underline"
                            >
                                ✉️ Kirim Email ke UPA
                            </a>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="h-12 w-12 mx-auto text-rose-400 mb-3" />
                            <h2 className="font-bold text-lg text-slate-900">Terjadi Kesalahan</h2>
                            <p className="text-sm text-slate-600 mt-2">Tidak dapat memuat survey. Coba refresh halaman.</p>
                        </>
                    )}
                </div>

                <div className="text-[11px] text-slate-500 text-center mt-4">
                    Dipersembahkan oleh PENSNOVA — Platform UPA Pengembangan Teknologi & Produk Unggulan PENS
                </div>
            </main>
        </div>
    );
}
