// ============================================================
// src/services/trashCategoryService.js — Business Logic Kategori Sampah
// ============================================================
// Validasi input menggunakan Zod sebelum data masuk ke database.
// Service ini memastikan data yang dikirim client memenuhi aturan bisnis.
// ============================================================

const { z } = require('zod');

// ---------- Zod Validation Schema ----------
// Mendefinisikan aturan validasi untuk setiap field

const categorySchema = z.object({
  name: z
    .string({ required_error: 'Nama kategori wajib diisi' })
    .min(2, 'Nama kategori minimal 2 karakter')
    .max(100, 'Nama kategori maksimal 100 karakter'),
  price_per_kg: z
    .number({ required_error: 'Harga per kg wajib diisi' })
    .positive('Harga per kg harus lebih dari 0'),
    // .positive() memastikan tidak bisa input 0 atau negatif
});

const TrashCategoryService = {
  // Validasi data kategori (digunakan untuk CREATE dan UPDATE)
  validateCategory(data) {
    return categorySchema.parse(data);
  },
};

module.exports = TrashCategoryService;
