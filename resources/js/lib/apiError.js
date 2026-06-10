// Ekstrak pesan error yang manusiawi dari error axios (validasi 422 / pesan 4xx-5xx).
export function apiErrorMessage(e, fallback = 'Terjadi kesalahan. Periksa isian lalu coba lagi.') {
    const res = e?.response?.data;
    if (res?.errors) return Object.values(res.errors).flat().join(' ');
    return res?.message || fallback;
}

// Map error validasi Laravel (422) jadi objek { field: "pesan pertama" } untuk warning per-input.
export function apiFieldErrors(e) {
    const errs = e?.response?.data?.errors;
    if (!errs) return {};
    return Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
}
