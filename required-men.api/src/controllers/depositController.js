const DepositModel = require('../models/depositModel');
const TrashCategoryModel = require('../models/trashCategoryModel');

const DepositController = {
  // POST /api/deposits
  async createDeposit(req, res) {
    try {
      const { category_id, location_id, weight } = req.body;
      const user_id = req.user.id; // Didapat dari authMiddleware

      if (!category_id || !location_id || !weight) {
        return res.status(400).json({
          success: false,
          message: 'Kategori, lokasi, dan berat wajib diisi',
          data: null
        });
      }

      // Validasi kategori ada
      const category = await TrashCategoryModel.findById(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori sampah tidak ditemukan',
          data: null
        });
      }

      // Ambil path foto yang diupload multer
      let photo_url = null;
      if (req.file) {
        // req.file.filename di-generate oleh Multer
        photo_url = `/uploads/${req.file.filename}`;
      }

      // Simpan deposit ke DB
      // Panggil Model untuk insert
      const result = await DepositModel.create({
        user_id,
        category_id,
        location_id,
        weight: parseFloat(weight),
        photo_url
      });

      return res.status(201).json({
        success: true,
        message: 'Setoran berhasil disubmit dan menunggu validasi admin.',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Create Deposit Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server saat memproses setoran.',
        data: null
      });
    }
  },

  // GET /api/deposits/my
  async getMyDeposits(req, res) {
    try {
      const user_id = req.user.id;
      const deposits = await DepositModel.findByUserId(user_id);
      
      return res.status(200).json({
        success: true,
        message: 'Berhasil mengambil riwayat setoran',
        data: deposits
      });
    } catch (error) {
      console.error('Get My Deposits Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null
      });
    }
  },

  // GET /api/deposits (Admin)
  async getAllDeposits(req, res) {
    try {
      const deposits = await DepositModel.findAll();
      return res.status(200).json({
        success: true,
        message: 'Berhasil mengambil semua setoran',
        data: deposits
      });
    } catch (error) {
      console.error('Get All Deposits Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null
      });
    }
  },

  // PATCH /api/deposits/:id/status (Admin)
  async updateDepositStatus(req, res) {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status tidak valid. Gunakan "approved" atau "rejected".',
          data: null
        });
      }

      await DepositModel.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: `Setoran berhasil di-${status}`,
        data: null
      });
    } catch (error) {
      console.error('Update Deposit Status Error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Gagal mengubah status setoran',
        data: null
      });
    }
  }
};

module.exports = DepositController;
