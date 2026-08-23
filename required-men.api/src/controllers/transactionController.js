// ============================================================
// src/controllers/transactionController.js — Handle Transaksi
// ============================================================
// Controller ini menghubungkan HTTP request dengan TransactionService.
//
// Alur bisnis utama:
//   1. Admin membuat transaksi (POST) → status: 'pending'
//   2. Admin mereview dan complete transaksi (PATCH) → saldo nasabah bertambah
//   3. Admin/Nasabah melihat daftar transaksi (GET)
//   4. Admin/Nasabah melihat detail transaksi (GET :id)
// ============================================================

const TransactionModel = require('../models/transactionModel');
const TransactionService = require('../services/transactionService');

const TransactionController = {
  // ==========================================================
  // POST /api/transactions — Buat Transaksi Baru (Admin Only)
  // ==========================================================
  // Body: { nasabah_id: number, items: [{ category_id, weight }] }
  //
  // Service akan:
  // - Validasi nasabah_id dan setiap category_id
  // - Hitung subtotal per item otomatis
  // - Hitung total_weight dan total_amount
  // - Simpan ke DB dengan status 'pending'
  async create(req, res) {
    try {
      // Validasi struktur input
      const validatedData = TransactionService.validateCreateTransaction(req.body);

      // Proses transaksi (kalkulasi + simpan ke DB)
      // req.user.id = admin yang login (dari JWT)
      const result = await TransactionService.processTransaction(
        validatedData,
        req.user.id
      );

      return res.status(201).json({
        success: true,
        message: 'Transaksi berhasil dibuat',
        data: result,
      });
    } catch (error) {
      // Error dari Zod validation
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e) => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: messages,
          data: null,
        });
      }

      // Error dari Service (custom throw dengan status)
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
          data: null,
        });
      }

      console.error('Create Transaction Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // GET /api/transactions — Ambil Daftar Transaksi
  // ==========================================================
  // Admin: melihat SEMUA transaksi
  // Nasabah: hanya melihat transaksi MILIKNYA sendiri
  //
  // Pembedaan dilakukan berdasarkan req.user.role dari JWT
  async getAll(req, res) {
    try {
      let transactions;

      if (req.user.role === 'admin') {
        // Admin bisa lihat semua transaksi
        transactions = await TransactionModel.findAll();
      } else {
        // Nasabah hanya bisa lihat transaksi sendiri
        transactions = await TransactionModel.findByNasabahId(req.user.id);
      }

      return res.status(200).json({
        success: true,
        message: 'Data transaksi berhasil diambil',
        data: transactions,
      });
    } catch (error) {
      console.error('Get All Transactions Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // GET /api/transactions/:id — Detail Transaksi + Items
  // ==========================================================
  // Mengembalikan header transaksi beserta array detail items
  async getById(req, res) {
    try {
      const transaction = await TransactionModel.findByIdWithDetails(req.params.id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan',
          data: null,
        });
      }

      // Nasabah hanya boleh lihat transaksi miliknya
      if (req.user.role === 'nasabah' && transaction.nasabah_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk melihat transaksi ini',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Detail transaksi berhasil diambil',
        data: transaction,
      });
    } catch (error) {
      console.error('Get Transaction By ID Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // PATCH /api/transactions/:id/complete — Complete Transaksi
  // ==========================================================
  // Mengubah status 'pending' → 'completed' dan menambah saldo nasabah.
  // Hanya admin yang bisa melakukan ini.
  async complete(req, res) {
    try {
      const result = await TransactionService.completeTransaction(req.params.id);

      return res.status(200).json({
        success: true,
        message: 'Transaksi berhasil diselesaikan dan saldo nasabah telah diperbarui',
        data: result,
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
          data: null,
        });
      }

      console.error('Complete Transaction Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },
};

module.exports = TransactionController;
