/**
 * Sentry initialization — wrapper supaya rest of code tidak peduli ada/ tidaknya DSN.
 *
 * Aktif kalau VITE_SENTRY_DSN di-set di .env. Kalau kosong (default dev),
 * semua call ke captureException() akan jadi no-op.
 *
 * Setup:
 *   .env.production:  VITE_SENTRY_DSN=https://...@sentry.io/...
 */

let initialized = false;
let SentryRef = null;

async function initSentry() {
    if (initialized) return;
    initialized = true;

    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) return; // disabled

    try {
        const Sentry = await import('@sentry/react');
        Sentry.init({
            dsn,
            environment: import.meta.env.MODE,
            tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
            // Kirim hanya error yang signifikan
            beforeSend(event) {
                // Skip network error 401 (sudah ditangani axios interceptor)
                if (event.exception?.values?.[0]?.value?.match(/Request failed with status code 401/i)) {
                    return null;
                }
                return event;
            },
        });
        SentryRef = Sentry;
        console.info('[Sentry] initialized');
    } catch (err) {
        console.warn('[Sentry] init failed:', err);
    }
}

// Auto-init saat module di-import
initSentry();

export function captureException(error, context = {}) {
    if (SentryRef) {
        SentryRef.captureException(error, context);
    }
}

export function captureMessage(message, level = 'info') {
    if (SentryRef) {
        SentryRef.captureMessage(message, level);
    }
}

export function setUser(user) {
    if (SentryRef) {
        SentryRef.setUser(user ? { id: user.id, email: user.email } : null);
    }
}
