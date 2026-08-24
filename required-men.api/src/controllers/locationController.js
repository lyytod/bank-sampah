const LocationModel = require('../models/locationModel');

const LocationController = {
  // GET /api/locations
  async getAll(req, res) {
    try {
      // Jika query parameter ?all=true ada (Admin/Super Admin), ambil semua
      // Jika tidak (User biasa), ambil yang aktif saja
      const { all } = req.query;
      let locations;

      if (all === 'true') {
        locations = await LocationModel.findAll();
      } else {
        locations = await LocationModel.findAllActive();
      }

      return res.status(200).json({
        success: true,
        message: 'Data lokasi berhasil diambil',
        data: locations
      });
    } catch (error) {
      console.error('Get Locations Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null
      });
    }
  },

  // POST /api/locations (Admin)
  async createLocation(req, res) {
    try {
      const { name, address, maps_link } = req.body;
      if (!name || !address) {
        return res.status(400).json({
          success: false,
          message: 'Nama dan alamat lokasi wajib diisi',
          data: null
        });
      }

      await LocationModel.create(req.body);

      return res.status(201).json({
        success: true,
        message: 'Lokasi berhasil ditambahkan',
        data: null
      });
    } catch (error) {
      console.error('Create Location Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan lokasi',
        data: null
      });
    }
  },

  // PUT /api/locations/:id (Admin)
  async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const { name, address, maps_link } = req.body;

      if (!name || !address) {
        return res.status(400).json({
          success: false,
          message: 'Nama dan alamat lokasi wajib diisi',
          data: null
        });
      }

      await LocationModel.update(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Lokasi berhasil diperbarui',
        data: null
      });
    } catch (error) {
      console.error('Update Location Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui lokasi',
        data: null
      });
    }
  },

  // PATCH /api/locations/:id/toggle (Admin)
  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      await LocationModel.toggleActive(id, is_active);

      return res.status(200).json({
        success: true,
        message: `Status lokasi berhasil diubah menjadi ${is_active ? 'Aktif' : 'Nonaktif'}`,
        data: null
      });
    } catch (error) {
      console.error('Toggle Location Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengubah status lokasi',
        data: null
      });
    }
  },

  // DELETE /api/locations/:id (Admin)
  async deleteLocation(req, res) {
    try {
      const { id } = req.params;
      await LocationModel.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Lokasi berhasil dihapus permanen',
        data: null
      });
    } catch (error) {
      console.error('Delete Location Error:', error);
      // Jika foreign key constraint gagal (sudah ada yang setor di lokasi ini)
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
          success: false,
          message: 'Lokasi tidak bisa dihapus karena sudah memiliki riwayat setoran. Silakan gunakan fitur Nonaktifkan (Toggle).',
          data: null
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus lokasi',
        data: null
      });
    }
  }
};

module.exports = LocationController;
