// ============================================================
// src/server.js — Entry Point Aplikasi Express.js
// ============================================================
// File ini adalah "jantung" dari backend. Tugasnya:
// 1. Memuat environment variables (.env)
// 2. Menginisialisasi Express app
// 3. Mengaktifkan middleware global (CORS, JSON parser)
// 4. Mendaftarkan semua route
// 5. Menjalankan HTTP server pada port tertentu
// ============================================================

// ---------- 1. Load Environment Variables ----------
// dotenv.config() HARUS dipanggil paling awal sebelum module lain
// agar process.env.* tersedia di seluruh aplikasi
require('dotenv').config();

// ---------- 2. Import Dependencies ----------
const express = require('express');
const cors = require('cors');
const path = require('path');

// ---------- 3. Inisialisasi Express App ----------
const app = express();
const PORT = process.env.PORT || 5000; // Fallback ke port 5000 jika tidak di-set

// ---------- 4. Middleware Global ----------
// cors()    → Mengizinkan frontend (beda origin/port) mengakses API ini.
//             Tanpa CORS, browser akan memblokir request dari localhost:5173 (Vite)
//             ke localhost:5000 (Express).
app.use(cors());

// express.json() → Mem-parse request body berformat JSON secara otomatis.
//                  Tanpa ini, req.body akan undefined saat menerima POST/PUT request.
app.use(express.json());

// Serve static files (untuk folder public/uploads tempat foto disimpan)
app.use(express.static(path.join(__dirname, '../public')));

// ---------- 5. Health Check Route ----------
// Route sederhana untuk memastikan server berjalan.
// Berguna untuk monitoring dan debugging awal.
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bank Sampah API is running 🚀',
    data: null,
  });
});

// ---------- 6. Registrasi Routes ----------
// Import route modules
const authRoutes = require('./routes/authRoutes');
const trashCategoryRoutes = require('./routes/trashCategoryRoutes');
const depositRoutes = require('./routes/depositRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Mount routes dengan prefix URL
app.use('/api/auth', authRoutes);
app.use('/api/trash-categories', trashCategoryRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);

// ---------- 7. Global Error Handler ----------
// Middleware dengan 4 parameter (err, req, res, next) dikenali Express
// sebagai error handler. Semua error yang di-throw atau di-next(err)
// akan ditangkap di sini.
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null,
  });
});

// ---------- 8. Jalankan Server ----------
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
