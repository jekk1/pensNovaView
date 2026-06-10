# 🎮 Tutorial Setup Frontend — Fitur Gamifikasi PENSNOVA

Halo! Kamu kebagian ngerjain **fitur gamifikasi** (poin, badge, level, leaderboard) di
PENSNOVA. Kamu **cuma ngurus frontend** — nggak perlu install PHP, database, atau backend
sama sekali. Cukup React + Vite, arahkan ke API yang sudah jalan. Ikuti langkah ini dari atas.

---

## Yang perlu disiapin dulu

- **Node.js** versi 20+ — [download](https://nodejs.org)
- **Git** — [download](https://git-scm.com)
- Akun **GitHub**
- Editor (VS Code recommended)

Dari admin kamu akan dapat (lewat chat, bukan di repo):
- **URL API** (`VITE_API_URL`)
- **Akun test** dengan role `tenant` (email + password)

---

## Langkah 1 — Fork repo

1. Buka: `https://github.com/ajisaptapramulen/PENSNOVA`
2. Klik tombol **Fork** (pojok kanan atas) → tunggu sampai jadi salinan di akun GitHub-mu.

> Fork = kamu punya salinan repo sendiri. Semua kerjaanmu di salinan ini, nanti dikirim balik
> lewat Pull Request.

## Langkah 2 — Clone fork-mu ke laptop

Ganti `USERNAME-KAMU` dengan username GitHub kamu:

```bash
git clone https://github.com/USERNAME-KAMU/PENSNOVA.git
cd PENSNOVA
```

## Langkah 3 — Bikin branch kerja

```bash
git checkout -b feat/gamifikasi
```

## Langkah 4 — Install dependency frontend

```bash
npm install
```

(Abaikan file backend seperti `composer.json` — kamu nggak perlu menyentuhnya.)

## Langkah 5 — Setting koneksi ke API

Bikin file baru bernama `.env` di folder paling luar (root project), isi **satu baris**:

```
VITE_API_URL=<URL API DARI ADMIN>
```

> ⚠️ `VITE_API_URL` adalah satu-satunya konfigurasi backend yang kamu butuh. **Jangan**
> commit/push file `.env` ini.

## Langkah 6 — Jalankan

```bash
npm run dev
```

Buka URL yang muncul di terminal (biasanya `http://localhost:5173`). Login pakai **akun test**
yang dikasih admin.

---

## 📁 Aturan Main (PENTING)

✅ **Cuma boleh edit di:**
- `resources/js/` — semua kode React (komponen, halaman, hooks, lib frontend)
- `resources/css/` — styling (Tailwind 4)

🚫 **JANGAN sentuh:**
- `app/`, `routes/`, `database/`, `config/`, `composer.json` — itu ranah backend
- File `.env` — jangan commit, jangan minta milik orang lain

---

## 🔌 Cara Ambil Data dari API

Sudah ada API client siap pakai. **Jangan bikin axios sendiri**, cukup import:

```js
import api from '@/lib/api';

// GET
const { data } = await api.get('/api/tenant/dashboard');

// POST
await api.post('/api/tenant/milestones', { title: 'Milestone baru' });
```

Yang otomatis ditangani client ini (kamu nggak perlu urus manual):
- Base URL dari `VITE_API_URL`
- Bearer token otomatis ditempel ke header (setelah login)
- Auto-retry untuk error jaringan / 5xx
- 401 → otomatis redirect ke `/login`

**Handle error untuk UI:**

```js
import api, { formatApiError } from '@/lib/api';

try {
  await api.post('/api/...', payload);
} catch (err) {
  toast.error(formatApiError(err)); // pesan ramah-user, Bahasa Indonesia
}
```

**Data fetching pakai React Query** (sudah terpasang di project, ikuti pola halaman lain):

```js
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const { data, isLoading } = useQuery({
  queryKey: ['gamifikasi', 'leaderboard'],
  queryFn: () => api.get('/api/tenant/gamification/leaderboard').then(r => r.data),
});
```

> 📖 Daftar endpoint lengkap + sumber data gamifikasi ada di
> **`docs/FRONTEND-GAMIFIKASI-ONBOARDING.md`** — **baca itu dulu**, isinya detail.

---

## 🎮 Khusus Endpoint Gamifikasi (mock dulu)

Endpoint gamifikasi (poin/badge/leaderboard) **belum dibuat di backend**. Biar kamu nggak
ke-blok nunggu, **pakai data dummy dulu** lewat file adapter `resources/js/lib/gamification.js`.
Pola lengkap + contoh struktur response ada di `docs/FRONTEND-GAMIFIKASI-ONBOARDING.md`
bagian 7. Nanti backend tinggal mengganti dummy-nya jadi request asli — kerjaanmu nggak perlu
diubah.

Kalau butuh struktur data tertentu dari backend, **tulis di deskripsi Pull Request** biar
dibahas dengan tim backend.

---

## 📤 Cara Submit Hasil Kerja

```bash
git add .
git commit -m "feat: <jelaskan singkat yang kamu kerjakan>"
git push -u origin feat/gamifikasi
```

Lalu buka repo fork-mu di GitHub → klik **Compare & pull request** → arahkan ke repo asli
`ajisaptapramulen/PENSNOVA` → **Create pull request**. Admin yang akan review & merge.

**Checklist sebelum push:**
- [ ] Cuma mengubah file di `resources/js/` dan `resources/css/`
- [ ] Pakai `import api from '@/lib/api'` (bukan axios sendiri)
- [ ] Error di-handle dengan `formatApiError()`
- [ ] `npm run build:frontend` sukses tanpa error
- [ ] Endpoint gamifikasi masih lewat adapter `lib/gamification.js`
- [ ] Tidak ada file `.env` / secret yang ke-commit

---

Ada yang bingung? Tanya admin. Selamat ngoding! 🚀
