// ============================================================
// src/models/transactionModel.js — Query DB untuk Transaksi
// ============================================================
// Mengelola 2 tabel yang saling terkait:
//   1. `transactions`        → Header transaksi (siapa, kapan, total)
//   2. `transaction_details` → Item-item dalam transaksi (kategori, berat)
//
// PENTING: Operasi CREATE menggunakan MySQL Transaction (BEGIN/COMMIT)
// untuk menjamin atomicity — semua berhasil atau semua dibatalkan.
// ============================================================

const db = require('../config/db');

const TransactionModel = {
  // ==========================================================
  // CREATE: Buat Transaksi Baru (dengan detail items)
  // ==========================================================
  // Parameter:
  //   transactionData: { nasabah_id, admin_id, total_weight, total_amount, status }
  //   details: [{ category_id, weight, subtotal }, ...]
  //
  // Menggunakan MySQL Transaction untuk atomicity:
  //   BEGIN → INSERT transactions → INSERT transaction_details → COMMIT
  //   Jika ada error di tengah → ROLLBACK (semua dibatalkan)
  async create(transactionData, details) {
    // getConnection() mengambil 1 koneksi dedicated dari pool.
    // Kita butuh koneksi yang SAMA untuk BEGIN, INSERT, dan COMMIT
    // agar semuanya dalam satu transaksi database.
    const connection = await db.getConnection();

    try {
      // Mulai transaksi database
      await connection.beginTransaction();

      // INSERT header transaksi
      const { nasabah_id, admin_id, total_weight, total_amount, status } = transactionData;
      const sqlTransaction = `
        INSERT INTO transactions (nasabah_id, admin_id, total_weight, total_amount, status)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [transResult] = await connection.execute(sqlTransaction, [
        nasabah_id,
        admin_id,
        total_weight,
        total_amount,
        status || 'pending',
      ]);

      const transactionId = transResult.insertId;

      // INSERT semua detail items dalam satu batch
      // Menggunakan loop karena setiap item perlu prepared statement terpisah
      const sqlDetail = `
        INSERT INTO transaction_details (transaction_id, category_id, weight, subtotal)
        VALUES (?, ?, ?, ?)
      `;
      for (const item of details) {
        await connection.execute(sqlDetail, [
          transactionId,
          item.category_id,
          item.weight,
          item.subtotal,
        ]);
      }

      // Semua INSERT berhasil → COMMIT (simpan permanen)
      await connection.commit();

      return { insertId: transactionId };
    } catch (error) {
      // Ada error → ROLLBACK (batalkan semua perubahan)
      // Ini menjamin data tidak "setengah jadi" di database
      await connection.rollback();
      throw error; // Lempar error ke caller (controller) untuk di-handle
    } finally {
      // SELALU kembalikan koneksi ke pool, baik sukses maupun gagal
      // Tanpa ini, koneksi akan "bocor" dan pool habis
      connection.release();
    }
  },

  // ==========================================================
  // READ: Ambil Semua Transaksi (dengan info nasabah & admin)
  // ==========================================================
  // JOIN dengan tabel users untuk mendapatkan nama nasabah dan admin
  // tanpa perlu query terpisah. Alias digunakan agar nama kolom tidak bentrok.
  async findAll() {
    const sql = `
      SELECT
        t.*,
        u_nasabah.name AS nasabah_name,
        u_admin.name   AS admin_name
      FROM transactions t
      JOIN users u_nasabah ON t.nasabah_id = u_nasabah.id
      JOIN users u_admin   ON t.admin_id   = u_admin.id
      ORDER BY t.created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // ==========================================================
  // READ: Transaksi berdasarkan Nasabah ID
  // ==========================================================
  // Nasabah hanya bisa melihat transaksi miliknya sendiri
  async findByNasabahId(nasabahId) {
    const sql = `
      SELECT
        t.*,
        u_admin.name AS admin_name
      FROM transactions t
      JOIN users u_admin ON t.admin_id = u_admin.id
      WHERE t.nasabah_id = ?
      ORDER BY t.created_at DESC
    `;
    const [rows] = await db.execute(sql, [nasabahId]);
    return rows;
  },

  // ==========================================================
  // READ: Detail Lengkap Satu Transaksi (header + items)
  // ==========================================================
  // Mengembalikan header transaksi beserta array detail items
  async findByIdWithDetails(transactionId) {
    // Query 1: Ambil header transaksi + nama nasabah & admin
    const sqlHeader = `
      SELECT
        t.*,
        u_nasabah.name AS nasabah_name,
        u_admin.name   AS admin_name
      FROM transactions t
      JOIN users u_nasabah ON t.nasabah_id = u_nasabah.id
      JOIN users u_admin   ON t.admin_id   = u_admin.id
      WHERE t.id = ?
    `;
    const [headerRows] = await db.execute(sqlHeader, [transactionId]);

    if (headerRows.length === 0) return null;

    // Query 2: Ambil detail items + nama kategori
    const sqlDetails = `
      SELECT
        td.*,
        tc.name AS category_name,
        tc.price_per_kg
      FROM transaction_details td
      JOIN trash_categories tc ON td.category_id = tc.id
      WHERE td.transaction_id = ?
    `;
    const [detailRows] = await db.execute(sqlDetails, [transactionId]);

    // Gabungkan header + details dalam satu object
    return {
      ...headerRows[0],
      details: detailRows,
    };
  },

  // ==========================================================
  // UPDATE: Ubah Status Transaksi
  // ==========================================================
  // Mengubah status dari 'pending' → 'completed'
  // Dipanggil oleh TransactionService yang juga update saldo nasabah
  async updateStatus(transactionId, status) {
    const sql = `UPDATE transactions SET status = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [status, transactionId]);
    return result;
  },

  // ==========================================================
  // READ: Cari transaksi berdasarkan ID (header saja)
  // ==========================================================
  async findById(transactionId) {
    const sql = `SELECT * FROM transactions WHERE id = ?`;
    const [rows] = await db.execute(sql, [transactionId]);
    return rows[0];
  },
};

module.exports = TransactionModel;
