// ============================================================
// src/config/db.js — Konfigurasi Koneksi Database MySQL
// ============================================================
// Menggunakan mysql2/promise untuk mendapatkan Promise-based API
// sehingga kita bisa pakai async/await di seluruh aplikasi.
//
// createPool() dipilih dibanding createConnection() karena:
// - Pool mengelola BANYAK koneksi secara otomatis (connection pooling)
// - Lebih efisien untuk server yang handle banyak request bersamaan
// - Koneksi yang idle akan di-reuse, bukan dibuat baru setiap saat
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config(); // Memuat variabel dari file .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,         // Alamat IP / hostname server MySQL
  port: process.env.DB_PORT || 3306, // Port MySQL (default: 3306)
  user: process.env.DB_USER,         // Username database
  password: process.env.DB_PASSWORD, // Password database
  database: process.env.DB_NAME,     // Nama database yang digunakan
  waitForConnections: true,          // Antri jika semua koneksi sedang dipakai
  connectionLimit: 10,               // Maksimal 10 koneksi simultan dalam pool
  queueLimit: 0,                     // 0 = tidak ada batas antrian (unlimited queue)
});

// Test koneksi saat module pertama kali di-load
// Ini memastikan konfigurasi DB benar sebelum server menerima request
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database MySQL terhubung berhasil.');
    connection.release(); // PENTING: kembalikan koneksi ke pool setelah selesai
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error.message);
    process.exit(1); // Hentikan server jika DB tidak bisa diakses
  }
})();

module.exports = pool;
