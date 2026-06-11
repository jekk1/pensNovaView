import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import Spinner from '../../components/Spinner';
import Logo from '../../components/Logo';

export default function Login() {
    const { login, defaultDashboardPath } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const u = await login({ email, password, remember });
            // Validate redirect — hanya allow path internal (start dengan /, bukan //
            // atau scheme:). Anti open redirect via /login?redirect=https://evil.com
            const rawRedirect = params.get('redirect');
            const safeRedirect = rawRedirect && rawRedirect.startsWith('/') && ! rawRedirect.startsWith('//')
                ? rawRedirect
                : null;
            // Pakai user dari return value (bukan dari state context yang
            // belum re-render setelah setUser).
            navigate(safeRedirect || defaultDashboardPath(u), { replace: true });
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.errors?.email?.[0] || data?.message || 'Login gagal. Coba lagi.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 flex justify-center">
                    <Link to="/">
                        <Logo variant="stacked" size="lg" />
                    </Link>
                </div>

                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 sm:p-8">
                    <h1 className="text-2xl font-bold tracking-tight">Masuk ke PENSNOVA</h1>
                    <p className="text-sm text-slate-600 mt-1">Login sebagai tenant, mentor, investor, atau admin UPA.</p>

                    {error && (
                        <div className="mt-4 p-3 rounded-lg bg-rose-50 ring-1 ring-rose-200 text-sm text-rose-800 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="email"
                                    autoFocus
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    autoComplete="email"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded"
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="rounded text-primary-600 focus:ring-primary-400"
                                />
                                Ingat saya
                            </label>
                            <Link to="/lupa-password" className="text-sm text-primary-700 hover:underline font-semibold">
                                Lupa password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-semibold disabled:opacity-60 transition"
                        >
                            {submitting && <Spinner className="h-4 w-4" />}
                            {submitting ? 'Memproses…' : 'Masuk'}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-slate-100 text-center text-sm">
                        Belum punya akun? <Link to="/daftar" className="text-primary-700 font-semibold hover:underline">Daftar sebagai tenant</Link>
                    </div>
                </div>

                <div className="mt-4 text-center text-xs text-slate-500">
                    <p>Setelah login, Anda otomatis diarahkan ke dashboard sesuai role.</p>
                </div>
            </div>
        </div>
    );
}
