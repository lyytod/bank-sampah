const db = require('../config/db');

const PublicController = {
  // GET /api/public/categories
  // Ambil data kategori dengan pagination
  async getCategories(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Hitung total data (untuk informasi pagination di frontend)
      const [[{ total }]] = await db.execute(`SELECT COUNT(*) as total FROM trash_categories WHERE is_active = 1`);
      
      // Ambil data dengan limit & offset menggunakan db.query agar aman dari isu prepared statement LIMIT
      const [rows] = await db.query(
        `SELECT id, name, price_per_kg FROM trash_categories WHERE is_active = 1 ORDER BY name ASC LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return res.status(200).json({
        success: true,
        message: 'Data kategori publik berhasil diambil',
        data: rows,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Public getCategories Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kategori',
        data: null
      });
    }
  },

  // GET /api/public/stats
  // Return statistik total nasabah & total sampah terkumpul
  async getStats(req, res) {
    try {
      // Total Nasabah (Role = 'user')
      const [[{ total_users }]] = await db.execute(
        `SELECT COUNT(*) as total_users FROM users WHERE role = 'user'`
      );

      // Total Sampah Terkumpul (Status = 'approved')
      const [[{ total_trash }]] = await db.execute(
        `SELECT SUM(weight) as total_trash FROM deposits WHERE status = 'approved'`
      );

      return res.status(200).json({
        success: true,
        message: 'Data statistik berhasil diambil',
        data: {
          total_users: total_users || 0,
          total_trash: total_trash || 0 // dalam kilogram
        }
      });
    } catch (error) {
      console.error('Public getStats Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data statistik',
        data: null
      });
    }
  },

  // GET /api/public/locations
  // Ambil data lokasi dari database
  async getLocations(req, res) {
    try {
      const [rows] = await db.query(
        `SELECT id, name, address, maps_link FROM locations WHERE is_active = 1 ORDER BY name ASC`
      );

      return res.status(200).json({
        success: true,
        message: 'Data lokasi berhasil diambil',
        data: rows
      });
    } catch (error) {
      console.error('Public getLocations Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data lokasi',
        data: null
      });
    }
  }
};

module.exports = PublicController;
