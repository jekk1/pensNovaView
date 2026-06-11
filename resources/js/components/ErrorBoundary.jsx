import { Component } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { captureException } from './sentry';

/**
 * Global error boundary — menangkap error render React dan menampilkan fallback
 * yang ramah user. Tanpa ini, satu error di mana pun bikin whole app blank.
 *
 * Strategi:
 * - Production: tampilkan pesan generic + tombol reload, kirim ke Sentry kalau DSN diset
 * - Dev (import.meta.env.DEV): tampilkan stack trace untuk debugging
 * - Tombol "Kembali ke Beranda" untuk recovery cepat tanpa harus reload
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        if (typeof window !== 'undefined' && window.console) {
            console.error('[ErrorBoundary]', error, errorInfo);
        }
        // Kirim ke Sentry (no-op kalau VITE_SENTRY_DSN kosong)
        captureException(error, { contexts: { react: { componentStack: errorInfo?.componentStack } } });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleHome = () => {
        window.location.href = '/';
    };

    render() {
        if (!this.state.error) return this.props.children;

        const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-lg w-full bg-white rounded-2xl ring-1 ring-slate-200 p-8 text-center shadow-sm">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                        Ada yang Tidak Beres
                    </h1>
                    <p className="text-sm text-slate-600 mb-6">
                        Maaf, terjadi error tak terduga. Tim teknis sudah diberi tahu.
                        Silakan muat ulang halaman atau kembali ke beranda.
                    </p>

                    {isDev && (
                        <details className="text-left bg-slate-50 rounded-lg p-3 mb-6 text-xs font-mono">
                            <summary className="cursor-pointer text-slate-700 font-semibold mb-2">
                                Detail teknis (mode development)
                            </summary>
                            <pre className="whitespace-pre-wrap break-words text-rose-700 mt-2">
                                {String(this.state.error?.stack || this.state.error)}
                            </pre>
                        </details>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                            onClick={this.handleReload}
                            className="px-4 py-2 rounded-lg bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 transition"
                        >
                            <RefreshCw className="h-4 w-4 mr-1" /> Muat Ulang
                        </button>
                        <button
                            onClick={this.handleHome}
                            className="px-4 py-2 rounded-lg ring-1 ring-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                        >
                            ← Ke Beranda
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
