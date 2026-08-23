// ============================================================
// src/models/trashCategoryModel.js — Query DB Tabel `trash_categories`
// ============================================================
// Tabel ini menyimpan jenis-jenis sampah beserta harga per kg.
// Contoh: Plastik (Rp 3.000/kg), Kertas (Rp 2.000/kg), Logam (Rp 5.000/kg)
//
// Data ini dikelola oleh Admin dan digunakan saat membuat transaksi
// untuk menghitung subtotal otomatis (weight × price_per_kg).
// ============================================================

const db = require('../config/db');

const TrashCategoryModel = {
  // ---------- CREATE ----------
  // Menambahkan kategori sampah baru (hanya admin)
  async create(categoryData) {
    const { name, price_per_kg } = categoryData;
    const sql = `INSERT INTO trash_categories (name, price_per_kg) VALUES (?, ?)`;
    const [result] = await db.execute(sql, [name, price_per_kg]);
    return result;
  },

  // ---------- READ: Semua Kategori (Admin) ----------
  async findAll() {
    const sql = `SELECT * FROM trash_categories ORDER BY name ASC`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // ---------- READ: Kategori Aktif Saja (Nasabah) ----------
  async findAllActive() {
    const sql = `SELECT * FROM trash_categories WHERE is_active = 1 ORDER BY name ASC`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // ---------- READ: Berdasarkan ID ----------
  // Digunakan untuk validasi saat membuat transaksi
  async findById(id) {
    const sql = `SELECT * FROM trash_categories WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  // ---------- UPDATE ----------
  // Mengubah nama atau harga kategori (hanya admin)
  async update(id, categoryData) {
    const { name, price_per_kg } = categoryData;
    const sql = `UPDATE trash_categories SET name = ?, price_per_kg = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [name, price_per_kg, id]);
    return result;
  },

  // ---------- DELETE ----------
  // Menghapus kategori (hanya admin)
  // PERHATIAN: Pastikan tidak ada transaksi yang mereferensi kategori ini
  async delete(id) {
    const sql = `DELETE FROM trash_categories WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  },

  // ---------- TOGGLE ACTIVE ----------
  async toggleActive(id, isActive) {
    const sql = `UPDATE trash_categories SET is_active = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [isActive ? 1 : 0, id]);
    return result;
  },
};

module.exports = TrashCategoryModel;
