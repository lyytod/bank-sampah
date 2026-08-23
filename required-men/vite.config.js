// ============================================================
// vite.config.js — Konfigurasi Build Tool Vite
// ============================================================
// Vite adalah build tool modern yang SANGAT cepat karena:
// - Dev mode: Menggunakan native ES modules (tanpa bundling)
// - Build mode: Menggunakan Rollup untuk optimized production bundle
//
// Konfigurasi di bawah menambahkan:
// - React plugin (JSX transform, Fast Refresh)
// - Proxy API untuk development (menghindari CORS issues)
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173, // Port dev server frontend

    // ---------- API Proxy ----------
    // Saat development, frontend (port 5173) dan backend (port 5000)
    // berjalan di port berbeda. Proxy meneruskan request /api/*
    // ke backend sehingga kita tidak perlu hardcode URL backend
    // dan menghindari masalah CORS di development.
    //
    // Contoh:
    //   fetch('/api/auth/login') di frontend
    //   → Vite proxy → http://localhost:5000/api/auth/login
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,  // Mengubah origin header agar backend menerimanya
      },
    },
  },
});
