import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldOff, Search, AlertCircle, Award } from 'lucide-react';
import api from '../../lib/api';
import Logo from '../../components/Logo';
import Spinner from '../../components/Spinner';

/**
 * /sertifikat/verifikasi — halaman publik buat pihak luar (employer, beasiswa,
 * institusi mitra) cek keaslian sertifikat peserta program inkubasi PENSNOVA
 * dengan input nomor sertifikat (cetak di PDF).
 *
 * Mendukung deep-link via ?number=PENSNOVA-CERT/2026/0001 untuk QR/URL share.
 */
export default function CertificateVerify() {
    const [params, setParams] = useSearchParams();
    const initial = params.get('number') ?? '';
    const [input, setInput] = useState(initial);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (number) => {
        if (! number.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await api.get('/api/public/program-certificate-verify', { params: { number: number.trim() } });
            setResult(res.data);
        } catch (e) {
            if (e.response?.status === 404) {
                setResult(e.response.data);
            } else {
                setError(e.response?.data?.message || 'Gagal memverifikasi. Coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initial) submit(initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setParams(input ? { number: input } : {});
        submit(input);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-50/40 via-white to-white">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
                    <Logo variant="mark" size="sm" />
                    <div>
                        <div className="font-bold text-sm text-slate-900">PENSNOVA</div>
                        <div className="text-[10px] text-slate-500 leading-none">Verifikasi Sertifikat</div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 shadow-sm">
                    <div className="text-center mb-5">
                        <Award className="h-10 w-10 mx-auto text-primary-700 mb-2" />
                        <h1 className="font-bold text-lg sm:text-xl text-slate-900">Verifikasi Sertifikat Peserta</h1>
                        <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                            Cek keaslian sertifikat program inkubasi tenant UPA PENSNOVA dengan memasukkan nomor sertifikat (tercetak di pojok PDF).
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="PENSNOVA-CERT/2026/0001"
                            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading || ! input.trim()}
                            className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 disabled:opacity-50 inline-flex items-center"
                        >
                            <Search className="h-4 w-4 mr-1" /> Verifikasi
                        </button>
                    </form>

                    {loading && (
                        <div className="py-8 text-center">
                            <Spinner className="h-8 w-8 mx-auto text-primary-600" />
                            <p className="text-xs text-slate-500 mt-2">Mengecek registry…</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-50 ring-1 ring-rose-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                            <div className="text-sm text-rose-800">{error}</div>
                        </div>
                    )}

                    {result && <VerificationResult result={result} />}

                    <div className="mt-5 text-[11px] text-slate-500 text-center border-t border-slate-100 pt-3">
                        Verifikasi resmi oleh UPA Pengembangan Teknologi & Produk Unggulan PENS.<br />
                        Jika ada keraguan, hubungi <a href="mailto:penssky.inkubator@div.pens.ac.id" className="text-primary-700 hover:underline">penssky.inkubator@div.pens.ac.id</a>.
                    </div>
                </div>
            </main>
        </div>
    );
}

function VerificationResult({ result }) {
    if (! result.verified) {
        const isRevoked = result.data?.status === 'revoked';
        return (
            <div className={`rounded-lg p-4 ring-1 ${isRevoked ? 'bg-rose-50 ring-rose-300' : 'bg-amber-50 ring-amber-300'}`}>
                <div className="flex items-start gap-3">
                    <ShieldOff className={`h-7 w-7 shrink-0 ${isRevoked ? 'text-rose-600' : 'text-amber-600'}`} />
                    <div>
                        <div className={`font-bold ${isRevoked ? 'text-rose-900' : 'text-amber-900'}`}>
                            {isRevoked ? 'Sertifikat Dicabut / Tidak Berlaku' : 'Tidak Terverifikasi'}
                        </div>
                        <p className={`text-sm mt-1 ${isRevoked ? 'text-rose-800' : 'text-amber-800'}`}>
                            {result.message}
                        </p>
                        {isRevoked && result.data?.revoked_reason && (
                            <p className="text-xs mt-2 italic text-rose-700">
                                Alasan: {result.data.revoked_reason}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const d = result.data;
    return (
        <div className="rounded-lg p-4 ring-1 bg-emerald-50 ring-emerald-300">
            <div className="flex items-start gap-3 mb-3">
                <ShieldCheck className="h-7 w-7 text-emerald-600 shrink-0" />
                <div>
                    <div className="font-bold text-emerald-900">Sertifikat Resmi Terverifikasi</div>
                    <p className="text-sm text-emerald-800 mt-1">{result.message}</p>
                </div>
            </div>
            <div className="bg-white rounded-md p-3 border border-emerald-200 text-sm space-y-1.5">
                <Row label="Nomor" value={<span className="font-mono">{d.certificate_number}</span>} />
                <Row label="Penerima" value={<strong>{d.recipient_name}</strong>} />
                {d.role_in_program && <Row label="Peran" value={d.role_in_program} />}
                <Row label="Tenant" value={d.tenant_name} />
                <Row label="Program" value={d.program_name} />
                {d.program_period_start && (
                    <Row
                        label="Periode"
                        value={
                            d.program_period_start +
                            (d.program_period_end ? ' s/d ' + d.program_period_end : '')
                        }
                    />
                )}
                <Row label="Tanggal Terbit" value={d.issued_at} />
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="text-xs text-slate-500 uppercase">{label}</div>
            <div className="col-span-2 text-slate-800">{value || '—'}</div>
        </div>
    );
}
