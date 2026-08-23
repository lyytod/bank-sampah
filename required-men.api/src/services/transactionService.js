// ============================================================
// src/services/transactionService.js — Business Logic Transaksi
// ============================================================
// File ini berisi logika bisnis INTI dari aplikasi Bank Sampah:
//
// 1. Validasi input transaksi (Zod)
// 2. Kalkulasi otomatis: subtotal per item, total_weight, total_amount
// 3. Orchestrasi proses "complete" transaksi (update status + saldo)
//
// FLOW TRANSAKSI:
//   Admin input: nasabah_id + items [{ category_id, weight }]
//   → Service hitung subtotal per item (weight × price_per_kg)
//   → Service hitung total_weight dan total_amount
//   → Model simpan ke DB (transactions + transaction_details)
//   → Saat di-complete: saldo nasabah bertambah
// ============================================================

const { z } = require('zod');
const TrashCategoryModel = require('../models/trashCategoryModel');
const TransactionModel = require('../models/transactionModel');
const UserModel = require('../models/userModel');

// ---------- Zod Validation Schema ----------

// Schema untuk setiap item dalam transaksi
const transactionItemSchema = z.object({
  category_id: z
    .number({ required_error: 'Category ID wajib diisi' })
    .int('Category ID harus bilangan bulat')
    .positive('Category ID harus positif'),
  weight: z
    .number({ required_error: 'Berat wajib diisi' })
    .positive('Berat harus lebih dari 0'),
});

// Schema untuk keseluruhan transaksi
const createTransactionSchema = z.object({
  nasabah_id: z
    .number({ required_error: 'Nasabah ID wajib diisi' })
    .int('Nasabah ID harus bilangan bulat')
    .positive('Nasabah ID harus positif'),
  items: z
    .array(transactionItemSchema, {
      required_error: 'Items wajib diisi',
    })
    .min(1, 'Minimal 1 item dalam transaksi'),
    // Transaksi harus punya setidaknya 1 item sampah
});

const TransactionService = {
  // ---------- Validasi Input ----------
  validateCreateTransaction(data) {
    return createTransactionSchema.parse(data);
  },

  // ==========================================================
  // Proses Pembuatan Transaksi Lengkap
  // ==========================================================
  // Menerima input mentah dari controller, lalu:
  // 1. Validasi setiap category_id ada di database
  // 2. Hitung subtotal per item (weight × price_per_kg)
  // 3. Hitung total_weight dan total_amount
  // 4. Simpan ke database via Model
  //
  // Parameter:
  //   validatedData: { nasabah_id, items: [{ category_id, weight }] }
  //   adminId: ID admin yang membuat transaksi (dari JWT)
  async processTransaction(validatedData, adminId) {
    const { nasabah_id, items } = validatedData;

    // Validasi: Pastikan nasabah_id merujuk ke user dengan role 'nasabah'
    const nasabah = await UserModel.findById(nasabah_id);
    if (!nasabah || nasabah.role !== 'nasabah') {
      throw { status: 404, message: 'Nasabah tidak ditemukan' };
    }

    let totalWeight = 0;
    let totalAmount = 0;
    const processedDetails = [];

    // Loop setiap item untuk kalkulasi
    for (const item of items) {
      // Ambil data kategori dari database untuk mendapatkan harga
      const category = await TrashCategoryModel.findById(item.category_id);
      if (!category) {
        throw {
          status: 404,
          message: `Kategori dengan ID ${item.category_id} tidak ditemukan`,
        };
      }

      // Hitung subtotal: berat × harga per kg
      // parseFloat() memastikan operasi matematika berjalan benar
      // karena DECIMAL dari MySQL bisa datang sebagai string
      const subtotal = parseFloat(item.weight) * parseFloat(category.price_per_kg);

      // Akumulasi total
      totalWeight += parseFloat(item.weight);
      totalAmount += subtotal;

      // Simpan item yang sudah diproses
      processedDetails.push({
        category_id: item.category_id,
        weight: item.weight,
        subtotal: subtotal,
      });
    }

    // Siapkan data header transaksi
    const transactionData = {
      nasabah_id,
      admin_id: adminId,
      total_weight: totalWeight,
      total_amount: totalAmount,
      status: 'pending', // Transaksi baru selalu pending
    };

    // Simpan ke database (transactions + transaction_details)
    // Model menggunakan MySQL Transaction untuk atomicity
    const result = await TransactionModel.create(transactionData, processedDetails);

    return {
      transactionId: result.insertId,
      totalWeight,
      totalAmount,
      itemCount: processedDetails.length,
    };
  },

  // ==========================================================
  // Complete Transaksi (pending → completed)
  // ==========================================================
  // Saat transaksi di-complete:
  // 1. Status diubah ke 'completed'
  // 2. Saldo nasabah bertambah sebesar total_amount
  //
  // Ini memisahkan "pencatatan" dari "pembayaran":
  // - Admin bisa review transaksi sebelum finalisasi
  // - Mencegah kesalahan input langsung mempengaruhi saldo
  async completeTransaction(transactionId) {
    // Ambil data transaksi
    const transaction = await TransactionModel.findById(transactionId);

    if (!transaction) {
      throw { status: 404, message: 'Transaksi tidak ditemukan' };
    }

    if (transaction.status === 'completed') {
      throw { status: 400, message: 'Transaksi sudah selesai sebelumnya' };
    }

    // Update status transaksi → 'completed'
    await TransactionModel.updateStatus(transactionId, 'completed');

    // Tambahkan saldo nasabah sebesar total_amount transaksi
    await UserModel.updateBalance(
      transaction.nasabah_id,
      transaction.total_amount
    );

    return {
      transactionId,
      nasabahId: transaction.nasabah_id,
      amountAdded: transaction.total_amount,
    };
  },
};

module.exports = TransactionService;
