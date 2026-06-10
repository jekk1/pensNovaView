# pensNovaView

# PENSNOVA — Frontend (Gamifikasi)

Paket frontend standalone PENSNOVA. Berisi **hanya kode frontend** (React + Vite) — tidak ada backend. Aplikasi mengakses data lewat API yang sudah jalan.

## Quick start

```bash
npm install
cp .env.example .env      # lalu isi VITE_API_URL dari admin (Windows: copy .env.example .env)
npm run dev               # buka http://localhost:5173
```

Login pakai akun test yang dikasih admin.

## Build produksi

```bash
npm run build             # output ke folder dist/
```

## Baca dulu

- **`docs/TUTORIAL-FRONTEND.md`** — panduan lengkap step-by-step
- **`docs/FRONTEND-GAMIFIKASI-ONBOARDING.md`** — referensi teknis (endpoint, kontrak API, pola mock)

## Aturan singkat

- Edit hanya di `resources/js/` dan `resources/css/`
- Ambil data pakai client yang sudah ada: `import api from '@/lib/api'`
- Endpoint gamifikasi belum ada di backend → pakai mock dulu (lihat docs)
- Jangan commit file `.env`
