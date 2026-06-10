import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Config standalone frontend SPA PENSNOVA.
// Backend diakses lewat VITE_API_URL (lihat .env). Tidak butuh PHP/Laravel.
export default defineConfig({
    plugins: [react(), tailwindcss()],
    publicDir: 'public',
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
    },
    server: {
        port: 5173,
        host: true,
    },
});
