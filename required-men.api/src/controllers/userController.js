const UserModel = require('../models/userModel');

const UserController = {
  // GET /api/users
  async getAllUsers(req, res) {
    try {
      const users = await UserModel.findAll();
      return res.status(200).json({
        success: true,
        message: 'Data pengguna berhasil diambil',
        data: users
      });
    } catch (error) {
      console.error('Get All Users Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null
      });
    }
  },

  // PATCH /api/users/:id/role
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['user', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role tidak valid',
          data: null
        });
      }

      // Cegah Super Admin mengubah role dirinya sendiri agar tidak terkunci dari sistem
      if (req.user.id === parseInt(id)) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak dapat mengubah role Anda sendiri',
          data: null
        });
      }

      await UserModel.updateRole(id, role);

      return res.status(200).json({
        success: true,
        message: 'Role pengguna berhasil diperbarui',
        data: null
      });
    } catch (error) {
      console.error('Update Role Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null
      });
    }
  },

  // PATCH /api/users/:id/status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status tidak valid',
          data: null
        });
      }

      // Cegah Super Admin men-suspend dirinya sendiri
      if (req.user.id === parseInt(id)) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak dapat mengubah status akun Anda sendiri',
          data: null
        });
      }

      await UserModel.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: `Akun pengguna berhasil di-${status === 'active' ? 'aktifkan' : 'tangguhkan'}`,
        data: null
      });
    } catch (error) {
      console.error('Update Status Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null
      });
    }
  }
};

module.exports = UserController;
