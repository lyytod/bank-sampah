// ============================================================
// src/models/userModel.js — Database Queries untuk Tabel `users`
// ============================================================
// Model ini menangani interaksi langsung dengan tabel users.
// Update Fase 1: Menambahkan dukungan untuk field `status`, 
// `google_id`, dan pengelolaan role (user, admin, super_admin).
// ============================================================

const db = require('../config/db');

const UserModel = {
  // ---------- CREATE ----------
  // Menyimpan user baru ke database.
  // Mendukung pendaftaran manual (password) atau via Google OAuth.
  async create(userData) {
    const { name, email, password, role = 'user', google_id = null } = userData;
    const sql = `
      INSERT INTO users (name, email, password, role, status, balance, google_id)
      VALUES (?, ?, ?, ?, 'active', 0, ?)
    `;
    const [result] = await db.execute(sql, [name, email, password, role, google_id]);
    return result;
  },

  // ---------- READ: Cari berdasarkan Email ----------
  // Digunakan untuk verifikasi login dan cek duplikasi email.
  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  },

  // ---------- READ: Cari berdasarkan ID ----------
  // Mengambil data user untuk request profile atau saat verifikasi token.
  async findById(id) {
    const sql = `SELECT id, name, email, role, status, balance, google_id, created_at FROM users WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  // ---------- READ: Ambil Semua User (Khusus Admin/Super Admin) ----------
  // Mengambil daftar seluruh user (kecuali password) untuk fitur manajemen akun.
  async findAll() {
    const sql = `SELECT id, name, email, role, status, balance, google_id, created_at FROM users ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // ---------- UPDATE: Perbarui Saldo ----------
  // Dipanggil setelah transaksi setoran/penarikan disetujui.
  // amount positif untuk setoran, negatif untuk penarikan.
  async updateBalance(userId, amount) {
    const sql = `UPDATE users SET balance = balance + ? WHERE id = ?`;
    const [result] = await db.execute(sql, [amount, userId]);
    return result;
  },

  // ---------- UPDATE: Perbarui Status (Suspend / Active) ----------
  // Khusus Super Admin: Untuk suspend atau mengaktifkan kembali akun.
  async updateStatus(userId, newStatus) {
    const sql = `UPDATE users SET status = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [newStatus, userId]);
    return result;
  },

  // ---------- UPDATE: Perbarui Role ----------
  // Khusus Super Admin
  async updateRole(userId, newRole) {
    const sql = `UPDATE users SET role = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [newRole, userId]);
    return result;
  }
};

module.exports = UserModel;
