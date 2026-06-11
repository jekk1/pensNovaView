import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, ShieldCheck, AlertTriangle, KeyRound, Copy, Check } from 'lucide-react';
import api from '../lib/api';

/**
 * Section 2FA TOTP — embedded di /settings.
 * State machine: disabled → enrolling (showing QR) → enabled.
 */
export default function TwoFactorSection() {
    const qc = useQueryClient();
    const [stage, setStage] = useState('idle'); // idle | enroll-form | confirm | manage-codes
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [enrollData, setEnrollData] = useState(null);
    const [copiedCodes, setCopiedCodes] = useState(false);

    const { data: status } = useQuery({
        queryKey: ['2fa', 'status'],
        queryFn: () => api.get('/api/two-factor/status').then((r) => r.data),
    });

    const enroll = useMutation({
        mutationFn: () => api.post('/api/two-factor/enroll', { current_password: password }).then((r) => r.data),
        onSuccess: (d) => {
            setEnrollData(d);
            setStage('confirm');
            setPassword('');
        },
        onError: (e) => alert(e.response?.data?.message || 'Gagal mulai enrollment.'),
    });

    const confirm = useMutation({
        mutationFn: () => api.post('/api/two-factor/confirm', { code }).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['2fa', 'status'] });
            setStage('manage-codes');
            setCode('');
        },
        onError: (e) => alert(e.response?.data?.message || 'Kode salah.'),
    });

    const disable = useMutation({
        mutationFn: () => api.post('/api/two-factor/disable', { current_password: password }).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['2fa', 'status'] });
            setStage('idle');
            setPassword('');
            setEnrollData(null);
        },
        onError: (e) => alert(e.response?.data?.message || 'Gagal disable.'),
    });

    const regen = useMutation({
        mutationFn: () => api.post('/api/two-factor/recovery-codes/regenerate', { current_password: password }).then((r) => r.data),
        onSuccess: (d) => {
            setEnrollData({ ...enrollData, recovery_codes: d.recovery_codes });
            setStage('manage-codes');
            setPassword('');
            alert('Recovery codes baru telah di-generate. Yang lama otomatis non-aktif.');
        },
    });

    const isEnabled = status?.enabled;
    const isPending = status?.enrolled_pending_confirm;

    return (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
                {isEnabled ? <ShieldCheck className="h-6 w-6 text-emerald-600" /> : <Shield className="h-6 w-6 text-slate-400" />}
                <div className="flex-1">
                    <h3 className="font-bold text-base">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                        {isEnabled
                            ? 'Akun Anda terlindungi 2FA. Login butuh kode 6-digit dari authenticator.'
                            : 'Tambah lapisan keamanan dengan kode 6-digit dari Google Authenticator / Authy / 1Password.'}
                    </p>
                </div>
                {isEnabled && (
                    <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">AKTIF</span>
                )}
            </div>

            {/* IDLE — belum enable */}
            {! isEnabled && ! isPending && stage === 'idle' && (
                <button
                    onClick={() => setStage('enroll-form')}
                    className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold"
                >
                    Aktifkan 2FA
                </button>
            )}

            {/* ENROLL FORM — input password */}
            {stage === 'enroll-form' && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-700">Masukkan password Anda untuk lanjut:</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password aktif"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setStage('idle'); setPassword(''); }}
                            className="px-3 py-2 rounded-lg hover:bg-slate-100 text-sm"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => enroll.mutate()}
                            disabled={! password || enroll.isPending}
                            className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold disabled:opacity-50"
                        >
                            {enroll.isPending ? 'Memulai…' : 'Lanjut'}
                        </button>
                    </div>
                </div>
            )}

            {/* CONFIRM — display QR + recovery codes + input TOTP */}
            {stage === 'confirm' && enrollData && (
                <div className="space-y-4">
                    <div className="bg-amber-50 ring-1 ring-amber-200 rounded-lg p-3 text-xs text-amber-900 flex gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                            <strong>Penting:</strong> simpan recovery codes di bawah. Codes ini single-use untuk login darurat kalau HP hilang.
                            Setelah halaman ini ditutup tanpa save, codes baru tidak bisa dilihat lagi.
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-slate-700 mb-2">Step 1. Scan QR ini di Google Authenticator / Authy:</div>
                        <div className="flex items-start gap-3 flex-wrap">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(enrollData.qr_url)}`}
                                alt="QR Code 2FA"
                                className="w-48 h-48 border border-slate-200 rounded-lg"
                            />
                            <div className="text-xs text-slate-600 max-w-xs">
                                Atau input manual secret:
                                <div className="font-mono text-[11px] bg-slate-50 p-2 rounded mt-1 break-all">
                                    {enrollData.secret}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-slate-700 mb-2">Step 2. Simpan recovery codes:</div>
                        <div className="bg-slate-50 ring-1 ring-slate-200 rounded-lg p-3 font-mono text-xs grid grid-cols-2 gap-1.5">
                            {enrollData.recovery_codes.map((c) => <div key={c}>{c}</div>)}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(enrollData.recovery_codes.join('\n'));
                                setCopiedCodes(true);
                                setTimeout(() => setCopiedCodes(false), 2000);
                            }}
                            className="mt-2 inline-flex items-center text-xs text-primary-700 hover:underline"
                        >
                            {copiedCodes ? <><Check className="h-3 w-3 mr-1" /> Tersalin</> : <><Copy className="h-3 w-3 mr-1" /> Copy semua codes</>}
                        </button>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-slate-700 mb-2">Step 3. Input kode 6-digit dari authenticator:</div>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="123456"
                            className="w-32 px-3 py-2 rounded-lg border border-slate-300 text-center font-mono text-lg tracking-widest"
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={() => confirm.mutate()}
                        disabled={code.length !== 6 || confirm.isPending}
                        className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold disabled:opacity-50"
                    >
                        {confirm.isPending ? 'Mengkonfirmasi…' : 'Aktifkan 2FA'}
                    </button>
                </div>
            )}

            {/* ENABLED — manage state */}
            {isEnabled && stage !== 'manage-codes' && (
                <div className="space-y-3">
                    <div className="text-xs text-slate-600">
                        Recovery codes tersisa: <strong>{status?.recovery_codes_remaining ?? 0}</strong> dari 8.
                        {status?.recovery_codes_remaining <= 3 && (
                            <span className="text-rose-600 ml-2 inline-flex items-center gap-1"><TriangleAlert className="h-3 w-3" /> Mulai habis — regenerate.</span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setStage('regen-form')}
                            className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 text-xs font-semibold"
                        >
                            <KeyRound className="h-3 w-3 inline mr-1" /> Regenerate Recovery Codes
                        </button>
                        <button
                            onClick={() => setStage('disable-form')}
                            className="px-3 py-1.5 rounded-lg ring-1 ring-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                        >
                            Disable 2FA
                        </button>
                    </div>
                </div>
            )}

            {/* DISABLE FORM */}
            {stage === 'disable-form' && (
                <div className="space-y-3 mt-3 pt-3 border-t border-slate-200">
                    <p className="text-sm text-rose-700">Konfirmasi password untuk disable 2FA:</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                    />
                    <div className="flex gap-2">
                        <button onClick={() => { setStage('idle'); setPassword(''); }} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-sm">Batal</button>
                        <button
                            onClick={() => disable.mutate()}
                            disabled={! password || disable.isPending}
                            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold disabled:opacity-50"
                        >
                            {disable.isPending ? 'Disabling…' : 'Konfirmasi Disable'}
                        </button>
                    </div>
                </div>
            )}

            {/* REGEN FORM */}
            {stage === 'regen-form' && (
                <div className="space-y-3 mt-3 pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-700">Konfirmasi password untuk regenerate codes baru (codes lama otomatis non-aktif):</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                    />
                    <div className="flex gap-2">
                        <button onClick={() => { setStage('idle'); setPassword(''); }} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-sm">Batal</button>
                        <button
                            onClick={() => regen.mutate()}
                            disabled={! password || regen.isPending}
                            className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold disabled:opacity-50"
                        >
                            {regen.isPending ? 'Regenerating…' : 'Regenerate'}
                        </button>
                    </div>
                </div>
            )}

            {/* SHOW NEW CODES after regen / confirm */}
            {stage === 'manage-codes' && enrollData?.recovery_codes && (
                <div className="space-y-3 mt-3 pt-3 border-t border-slate-200">
                    <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
                        2FA aktif. Simpan recovery codes di bawah — tidak akan ditampilkan lagi.
                    </div>
                    <div className="bg-slate-50 ring-1 ring-slate-200 rounded-lg p-3 font-mono text-xs grid grid-cols-2 gap-1.5">
                        {enrollData.recovery_codes.map((c) => <div key={c}>{c}</div>)}
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(enrollData.recovery_codes.join('\n'));
                            alert('Recovery codes copied.');
                        }}
                        className="text-xs text-primary-700 hover:underline"
                    >
                        <Copy className="h-3 w-3 inline mr-1" /> Copy semua codes
                    </button>
                    <button
                        onClick={() => { setStage('idle'); setEnrollData(null); }}
                        className="block text-xs text-slate-500 hover:underline mt-2"
                    >
                        Saya sudah simpan codes-nya
                    </button>
                </div>
            )}
        </div>
    );
}
