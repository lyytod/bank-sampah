// ============================================================
// src/routes/trashCategoryRoutes.js — Endpoint Kategori Sampah
// ============================================================
// Semua endpoint di sini memerlukan autentikasi (verifyToken).
//
// Akses berdasarkan role:
//   GET (read)        → admin & nasabah (semua user bisa lihat kategori)
//   POST/PUT/DELETE   → admin only (hanya admin yang kelola data master)
//
// Route ini di-mount di server.js dengan prefix '/api/trash-categories'
// ============================================================

const express = require('express');
const router = express.Router();

const TrashCategoryController = require('../controllers/trashCategoryController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// Semua route di bawah ini memerlukan token JWT valid
// verifyToken diterapkan sebagai middleware pada router level
// Artinya: SETIAP request ke /api/trash-categories/* harus bawa token
router.use(verifyToken);

// ---------- Routes yang bisa diakses semua role ----------
// Nasabah perlu lihat daftar kategori (misal: untuk info harga)
router.get('/', TrashCategoryController.getAll);
router.get('/:id', TrashCategoryController.getById);

// ---------- Routes khusus Admin ----------
// authorizeRole('admin') memastikan hanya admin yang bisa CRUD data master
router.post('/', authorizeRole('admin'), TrashCategoryController.create);
router.put('/:id', authorizeRole('admin'), TrashCategoryController.update);
router.delete('/:id', authorizeRole('admin'), TrashCategoryController.delete);

module.exports = router;
