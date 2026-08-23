// ============================================================
// src/models/userModel.js — Database Queries untuk Tabel `users`
// ============================================================
// Model HANYA bertanggung jawab untuk operasi database (CRUD).
// Tidak ada business logic di sini — itu tugas Service layer.
//
// Semua method return Promise karena menggunakan mysql2/promise.
// Pemanggil cukup pakai: const user = await UserModel.findByEmail(email);
// ============================================================

const db = require('../config/db');

const UserModel = {
  // ---------- CREATE ----------
  // Menyimpan user baru ke database.
  // Parameter `userData` berisi: { name, email, password (sudah di-hash), role }
  // Mengembalikan result object dari MySQL (berisi insertId, affectedRows, dll)
  async create(userData) {
    const { name, email, password, role } = userData;
    const sql = `
      INSERT INTO users (name, email, password, role, balance)
      VALUES (?, ?, ?, ?, 0)
    `;
    // db.execute() menggunakan prepared statement secara otomatis.
    // Tanda '?' akan di-replace dengan nilai dari array parameter.
    // Ini MENCEGAH SQL Injection karena nilai di-escape oleh MySQL driver.
    const [result] = await db.execute(sql, [name, email, password, role]);
    return result;
  },

  // ---------- READ: Cari berdasarkan Email ----------
  // Digunakan saat login untuk memverifikasi kredensial.
  // Digunakan juga saat register untuk cek duplikasi email.
  // Return: object user LENGKAP (termasuk password hash) atau undefined
  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0]; // rows adalah array, ambil elemen pertama (atau undefined)
  },

  // ---------- READ: Cari berdasarkan ID ----------
  // Digunakan setelah JWT di-decode untuk mendapatkan data user lengkap.
  // TIDAK mengembalikan password untuk keamanan (SELECT tanpa password).
  async findById(id) {
    const sql = `SELECT id, name, email, role, balance, created_at FROM users WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  // ---------- READ: Ambil Semua User ----------
  // Hanya diakses oleh admin untuk melihat daftar nasabah.
  // Password TIDAK disertakan dalam hasil query.
  async findAll() {
    const sql = `SELECT id, name, email, role, balance, created_at FROM users ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // ---------- UPDATE: Perbarui Saldo Nasabah ----------
  // Dipanggil setelah transaksi setor sampah selesai.
  // `amount` adalah jumlah yang DITAMBAHKAN ke saldo saat ini.
  async updateBalance(userId, amount) {
    const sql = `UPDATE users SET balance = balance + ? WHERE id = ?`;
    const [result] = await db.execute(sql, [amount, userId]);
    return result;
  },
};

module.exports = UserModel;
