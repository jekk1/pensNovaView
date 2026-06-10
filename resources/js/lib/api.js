import axios from 'axios';

/**
 * API client untuk PENSNOVA — Bearer token mode (cross-domain ready).
 *
 * Frontend & backend bisa di domain berbeda:
 *   - Dev local: VITE_API_URL=http://localhost:8000
 *   - Production: VITE_API_URL=https://api.pensnova.id (backend VPS Plesk)
 *
 * Token disimpan di localStorage:
 *   - Expiry 30 hari (config di backend AuthController)
 *   - Auto-clear saat 401
 *   - Pakai HTTPS di production WAJIB
 *   - Mitigasi XSS: hindari third-party script tidak terpercaya, gunakan CSP
 *
 * Resilience:
 *   - Timeout default 20s — request lebih lama akan abort
 *   - Auto-retry 2x untuk error transient (network error, 502/503/504)
 *   - Exponential backoff: 500ms, 1500ms
 */

const TOKEN_KEY = 'pensnova_auth_token';
const LEGACY_TOKEN_KEY = 'stp_auth_token';

export function getToken() {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
        // Migrasi token lama (dari sebelum rename)
        const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
        if (legacy) {
            localStorage.setItem(TOKEN_KEY, legacy);
            localStorage.removeItem(LEGACY_TOKEN_KEY);
            t = legacy;
        }
    }
    return t;
}

export function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    timeout: 20_000,
    headers: {
        'Accept': 'application/json',
        'X-Auth-Mode': 'token',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const RETRY_DELAYS = [500, 1500];
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

api.interceptors.response.use(
    (r) => r,
    async (error) => {
        const config = error.config || {};

        // 401 → clear token + redirect login
        if (error.response?.status === 401 && !config._skipAuthRedirect) {
            clearToken();
            const path = window.location.pathname;
            if (path !== '/login') {
                window.location.href = '/login?redirect=' + encodeURIComponent(path + window.location.search);
            }
            return Promise.reject(error);
        }

        // Auto-retry untuk error transient (network error, 5xx gateway)
        const isTransient = !error.response || RETRYABLE_STATUSES.has(error.response.status) || error.code === 'ECONNABORTED';
        const isIdempotent = !config.method || ['get', 'head', 'options'].includes(config.method.toLowerCase());

        if (isTransient && isIdempotent && !config._skipRetry) {
            config._retryCount = config._retryCount ?? 0;
            if (config._retryCount < RETRY_DELAYS.length) {
                const delay = RETRY_DELAYS[config._retryCount];
                config._retryCount++;
                await new Promise((res) => setTimeout(res, delay));
                return api(config);
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Format error message untuk UI dari axios error.
 * Coba ambil dari response body, fallback ke message generic Bahasa Indonesia.
 */
export function formatApiError(err, fallback = 'Terjadi kesalahan. Silakan coba lagi.') {
    if (!err) return fallback;
    const data = err.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first) && first.length) return first[0];
    }
    if (err.code === 'ECONNABORTED') return 'Koneksi timeout. Periksa jaringan Anda.';
    if (!err.response) return 'Tidak bisa terhubung ke server. Periksa koneksi internet.';
    return err.message || fallback;
}

export default api;
