// ============================================================
// postcss.config.js — Konfigurasi PostCSS
// ============================================================
// PostCSS adalah CSS processor yang digunakan oleh Vite secara otomatis.
// Tailwind CSS dan Autoprefixer berjalan sebagai plugin PostCSS.
//
// tailwindcss  → Mengubah class Tailwind menjadi CSS final
// autoprefixer → Menambahkan vendor prefix (-webkit-, -moz-, dll)
//                secara otomatis untuk kompatibilitas browser
// ============================================================

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
