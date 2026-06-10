# Panduan Frontend — Fitur Gamifikasi (PENSNOVA)

> Dokumen ini untuk developer yang **hanya mengerjakan frontend**. Kamu **tidak perlu**
> menjalankan PHP, MySQL, Composer, atau menyentuh backend sama sekali. Cukup React + Vite,
> arahkan ke API yang sudah jalan.

---

## 1. Batasan Kerja (WAJIB dibaca)

✅ **Boleh diedit:**
- `resources/js/**` — semua kode React (komponen, halaman, hooks, lib frontend)
- `resources/css/**` — styling (Tailwind 4)

🚫 **JANGAN disentuh:**
- `app/`, `routes/`, `database/`, `config/`, `composer.json` — itu backend
- File `.env` milik tim backend (jangan minta/jangan commit)

**Alur kerja:** kerjakan di branch `feat/gamifikasi` → submit lewat **Pull Request**. Backend
& integrasi di-review oleh tim backend.

---

## 2. Setup (3 langkah, tanpa backend)

```bash
# 1. install dependency frontend
npm install

# 2. buat file .env di root project, isi 1 baris (arahkan ke API yang sudah deploy)
#    VITE_API_URL=https://api.pensnova.id
#    (atau URL staging yang diberikan tim backend)

# 3. jalankan dev server
npm run dev
```

Buka URL yang muncul di terminal (biasanya `http://localhost:5173`).

> ⚠️ `VITE_API_URL` adalah **satu-satunya** konfigurasi backend yang kamu butuh. Seluruh
> request frontend otomatis diarahkan ke sana — lihat [resources/js/lib/api.js](../resources/js/lib/api.js).

Build standalone (kalau perlu cek hasil produksi):
```bash
npm run build:frontend   # output ke ./dist-frontend
```

---

## 3. Cara Akses API (penting)

### Pakai API client yang sudah ada — JANGAN bikin axios baru

Sudah ada client siap pakai di [resources/js/lib/api.js](../resources/js/lib/api.js).
Tinggal import:

```js
import api from '@/lib/api';

// GET
const { data } = await api.get('/api/tenant/dashboard');

// POST
await api.post('/api/tenant/milestones', { title: 'Milestone baru' });
```

Yang **otomatis** ditangani client ini (kamu tidak perlu urus manual):
- **Base URL** dari `VITE_API_URL`
- **Bearer token** otomatis ditempel ke header `Authorization` (diambil dari `localStorage`)
- **Auto-retry** 2x untuk error transient (network / 502 / 503 / 504)
- **401** → token dihapus + redirect ke `/login`
- **Timeout** 20 detik

### Format pesan error untuk UI

```js
import api, { formatApiError } from '@/lib/api';

try {
  await api.post('/api/...', payload);
} catch (err) {
  toast.error(formatApiError(err)); // pesan ramah-user, Bahasa Indonesia
}
```

### Data fetching pakai React Query

Project ini sudah pakai `@tanstack/react-query`. Ikuti pola yang ada:

```js
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const { data, isLoading } = useQuery({
  queryKey: ['gamifikasi', 'leaderboard'],
  queryFn: () => api.get('/api/tenant/gamification/leaderboard').then(r => r.data),
});
```

---

## 4. Autentikasi & Cara Dapat Token untuk Testing

Hampir semua endpoint butuh login (Bearer token). Untuk development kamu butuh **akun test**
(minta ke tim backend — JANGAN pakai akun produksi asli).

**Login** mengembalikan token:

```http
POST /api/login
Content-Type: application/json
X-Auth-Mode: token

{ "email": "tenant-test@upa.pens.ac.id", "password": "password", "device_name": "Chrome - Dev" }
```

Response:
```json
{
  "data": { "id": 5, "name": "...", "roles": ["tenant"], "tenant": { ... } },
  "token": "12|xxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "expires_at": "..."
}
```

Di aplikasi, login sudah ditangani halaman `/login` + helper `setToken()` di
[resources/js/lib/api.js](../resources/js/lib/api.js) — cukup login lewat UI, token
tersimpan otomatis. Setelah itu semua request sudah ter-autentikasi.

**Role yang relevan untuk gamifikasi:** `tenant` (subjek utama poin/badge). Akun test
sebaiknya punya role `tenant` agar bisa akses prefix `/api/tenant/*`.

---

## 5. Endpoint yang Relevan sebagai Sumber Data Gamifikasi

Gamifikasi (poin, badge, progress, leaderboard) idealnya dihitung dari **aktivitas tenant
yang sudah ada**. Endpoint berikut sudah tersedia dan bisa jadi sumber data:

| Aktivitas (sumber poin) | Endpoint | Method |
|---|---|---|
| Ringkasan dashboard tenant | `/api/tenant/dashboard` | GET |
| Milestone tercapai | `/api/tenant/milestones` | GET |
| Progress report dikirim | `/api/tenant/progress-reports` | GET |
| Sesi mentoring diikuti | `/api/tenant/mentoring-sessions` | GET |
| Hasil MONEV / penilaian | `/api/tenant/monev-assessments` | GET |
| Sertifikasi diperoleh | `/api/tenant/certifications` | GET |
| Produk riset diunggah | `/api/tenant/research-products` | GET |
| Dokumen di vault | `/api/tenant/documents` | GET |
| Profil user saat ini | `/api/me` | GET |

> Daftar endpoint **lengkap** (semua role) ada di [docs/API.md](API.md). Untuk daftar paling
> akurat & terbaru, tim backend bisa jalankan `php artisan route:list --path=api`.

---

## 6. Pola Umum API

### Pagination
Endpoint list mendukung query string:
```
?page=1&per_page=20&sort=created_at&dir=desc&search=foo
```
Response shape:
```json
{
  "data": [ ... ],
  "meta": { "current_page": 1, "last_page": 5, "per_page": 20, "total": 95 }
}
```

### Error
- `401` token invalid/expired → auto-redirect login
- `403` role tidak diizinkan
- `422` validasi gagal → `{ "message": "...", "errors": { "field": ["..."] } }`
- `429` kena rate limit → cek header `Retry-After`

---

## 7. Kontrak Endpoint Gamifikasi (BELUM ADA — mock dulu)

Endpoint khusus gamifikasi **belum dibuat di backend**. Supaya kamu tidak ke-blok menunggu,
**buat frontend terlebih dulu terhadap kontrak di bawah ini**, dengan data dummy yang
ditaruh di satu file adapter — nanti tim backend tinggal menggantinya dengan request asli.

Buat file `resources/js/lib/gamification.js`:

```js
import api from '@/lib/api';

// FLAG: ganti ke false setelah endpoint backend siap.
const USE_MOCK = true;

const MOCK_PROFILE = {
  points: 1250,
  level: 4,
  level_name: 'Innovator',
  next_level_points: 1500,
  badges: [
    { id: 'first_milestone', name: 'Langkah Pertama', icon: 'flag', earned_at: '2026-05-01' },
    { id: 'mentor_5x',       name: 'Rajin Mentoring', icon: 'users', earned_at: null },
  ],
};

const MOCK_LEADERBOARD = [
  { rank: 1, tenant_name: 'Aitoma', points: 1820, avatar_url: null },
  { rank: 2, tenant_name: 'Tenant B', points: 1250, avatar_url: null },
];

export function getGamificationProfile() {
  if (USE_MOCK) return Promise.resolve(MOCK_PROFILE);
  return api.get('/api/tenant/gamification/profile').then(r => r.data.data);
}

export function getLeaderboard() {
  if (USE_MOCK) return Promise.resolve(MOCK_LEADERBOARD);
  return api.get('/api/tenant/gamification/leaderboard').then(r => r.data.data);
}
```

### Kontrak yang diharapkan dari backend

**`GET /api/tenant/gamification/profile`** → poin & badge tenant yang login:
```json
{
  "data": {
    "points": 1250,
    "level": 4,
    "level_name": "Innovator",
    "next_level_points": 1500,
    "badges": [
      { "id": "first_milestone", "name": "Langkah Pertama", "icon": "flag", "earned_at": "2026-05-01" }
    ]
  }
}
```

**`GET /api/tenant/gamification/leaderboard`** → peringkat semua tenant:
```json
{
  "data": [
    { "rank": 1, "tenant_name": "Aitoma", "points": 1820, "avatar_url": null }
  ]
}
```

> Kalau butuh field tambahan (mis. histori poin, riwayat aktivitas), **diskusikan dulu
> kontraknya dengan tim backend** sebelum hardcode di frontend. Semua komunikasi struktur
> data ditulis di PR / issue agar backend bisa menyesuaikan.

---

## 8. Checklist Sebelum PR

- [ ] Hanya mengubah file di `resources/js/**` dan `resources/css/**`
- [ ] Pakai `import api from '@/lib/api'` (tidak bikin axios sendiri)
- [ ] Error di-handle dengan `formatApiError()`
- [ ] Data fetching pakai React Query (ikuti pola halaman lain)
- [ ] `npm run build:frontend` sukses tanpa error
- [ ] Endpoint gamifikasi masih lewat adapter `lib/gamification.js` (flag `USE_MOCK`)
- [ ] Tidak ada secret / `.env` ke-commit
