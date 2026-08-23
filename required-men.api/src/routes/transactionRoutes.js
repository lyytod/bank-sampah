// ============================================================
// src/routes/transactionRoutes.js — Endpoint Transaksi
// ============================================================
// Transaksi adalah fitur inti Bank Sampah:
//   - Admin membuat transaksi saat nasabah menyetor sampah
//   - Admin meng-complete transaksi → saldo nasabah bertambah
//   - Nasabah bisa melihat riwayat transaksi miliknya
//
// Route ini di-mount di server.js dengan prefix '/api/transactions'
// ============================================================

const express = require('express');
const router = express.Router();

const TransactionController = require('../controllers/transactionController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// Semua route memerlukan autentikasi
router.use(verifyToken);

// ---------- GET: Daftar & Detail Transaksi ----------
// Bisa diakses admin dan nasabah
// Controller akan membedakan data yang ditampilkan berdasarkan role:
//   - Admin  → lihat semua transaksi
//   - Nasabah → hanya lihat transaksi sendiri
router.get('/', TransactionController.getAll);
router.get('/:id', TransactionController.getById);

// ---------- POST: Buat Transaksi Baru (Admin Only) ----------
// Hanya admin yang bisa membuat transaksi
// karena admin yang menerima dan menimbang sampah dari nasabah
router.post('/', authorizeRole('admin'), TransactionController.create);

// ---------- PATCH: Complete Transaksi (Admin Only) ----------
// PATCH dipilih karena hanya mengubah SEBAGIAN resource (status saja)
// Berbeda dengan PUT yang mengganti SELURUH resource
// Saat di-complete, saldo nasabah otomatis bertambah
router.patch('/:id/complete', authorizeRole('admin'), TransactionController.complete);

module.exports = router;
