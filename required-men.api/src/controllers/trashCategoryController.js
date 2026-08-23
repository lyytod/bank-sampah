// ============================================================
// src/controllers/trashCategoryController.js — CRUD Kategori Sampah
// ============================================================
// Endpoint ini hanya bisa diakses oleh Admin.
// Authorization dihandle oleh middleware di routes, bukan di sini.
//
// Semua response mengikuti format konsisten:
//   { success: boolean, message: string, data: object/array/null }
// ============================================================

const TrashCategoryModel = require('../models/trashCategoryModel');
const TrashCategoryService = require('../services/trashCategoryService');

const TrashCategoryController = {
  // ==========================================================
  // POST /api/trash-categories — Tambah Kategori Baru
  // ==========================================================
  async create(req, res) {
    try {
      // Validasi input (name, price_per_kg)
      const validatedData = TrashCategoryService.validateCategory(req.body);

      // Simpan ke database
      const result = await TrashCategoryModel.create(validatedData);

      return res.status(201).json({
        success: true,
        message: 'Kategori sampah berhasil ditambahkan',
        data: {
          id: result.insertId,
          ...validatedData,
        },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e) => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: messages,
          data: null,
        });
      }
      console.error('Create Category Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // GET /api/trash-categories — Ambil Semua Kategori
  // ==========================================================
  async getAll(req, res) {
    try {
      const categories = await TrashCategoryModel.findAll();

      return res.status(200).json({
        success: true,
        message: 'Data kategori berhasil diambil',
        data: categories,
      });
    } catch (error) {
      console.error('Get All Categories Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // GET /api/trash-categories/:id — Ambil Kategori by ID
  // ==========================================================
  async getById(req, res) {
    try {
      const category = await TrashCategoryModel.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Data kategori berhasil diambil',
        data: category,
      });
    } catch (error) {
      console.error('Get Category By ID Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // PUT /api/trash-categories/:id — Update Kategori
  // ==========================================================
  async update(req, res) {
    try {
      // Cek apakah kategori ada
      const existing = await TrashCategoryModel.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
          data: null,
        });
      }

      // Validasi input baru
      const validatedData = TrashCategoryService.validateCategory(req.body);

      // Update di database
      await TrashCategoryModel.update(req.params.id, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Kategori berhasil diperbarui',
        data: {
          id: parseInt(req.params.id),
          ...validatedData,
        },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e) => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: messages,
          data: null,
        });
      }
      console.error('Update Category Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // DELETE /api/trash-categories/:id — Hapus Kategori
  // ==========================================================
  async delete(req, res) {
    try {
      const existing = await TrashCategoryModel.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan',
          data: null,
        });
      }

      await TrashCategoryModel.delete(req.params.id);

      return res.status(200).json({
        success: true,
        message: 'Kategori berhasil dihapus',
        data: null,
      });
    } catch (error) {
      console.error('Delete Category Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },
};

module.exports = TrashCategoryController;
