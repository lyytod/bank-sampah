const db = require('../config/db');

const DepositModel = {
  // CREATE: Buat setoran baru (status 'pending' by default)
  async create(data) {
    const { user_id, category_id, location_id, weight, photo_url } = data;
    const sql = `
      INSERT INTO deposits (user_id, category_id, location_id, weight, photo_url, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    const [result] = await db.execute(sql, [user_id, category_id, location_id, weight, photo_url]);
    return result;
  },

  // READ: Dapatkan semua setoran milik user tertentu (dengan detail kategori & lokasi)
  async findByUserId(userId) {
    const sql = `
      SELECT d.id, d.weight, d.photo_url, d.status, d.created_at, 
             c.name as category_name, c.price_per_kg,
             l.name as location_name,
             (d.weight * c.price_per_kg) as estimated_subtotal
      FROM deposits d
      JOIN trash_categories c ON d.category_id = c.id
      JOIN locations l ON d.location_id = l.id
      WHERE d.user_id = ?
      ORDER BY d.created_at DESC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  },

  // READ: Dapatkan semua setoran (Untuk Admin)
  async findAll() {
    const sql = `
      SELECT d.id, d.weight, d.photo_url, d.status, d.created_at, 
             c.name as category_name, c.price_per_kg,
             l.name as location_name,
             u.name as user_name, u.email as user_email,
             (d.weight * c.price_per_kg) as estimated_subtotal
      FROM deposits d
      JOIN trash_categories c ON d.category_id = c.id
      JOIN locations l ON d.location_id = l.id
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // READ: Dapatkan setoran berdasarkan ID
  async findById(id) {
    const sql = `
      SELECT d.*, c.price_per_kg, l.name as location_name, (d.weight * c.price_per_kg) as estimated_subtotal
      FROM deposits d
      JOIN trash_categories c ON d.category_id = c.id
      JOIN locations l ON d.location_id = l.id
      WHERE d.id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },

  // UPDATE: Update status setoran dan tambah saldo jika 'approved' (Untuk Admin)
  async updateStatus(id, status) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Ambil data deposit
      const [depRows] = await connection.execute(
        `SELECT d.*, (d.weight * c.price_per_kg) as estimated_subtotal 
         FROM deposits d 
         JOIN trash_categories c ON d.category_id = c.id 
         WHERE d.id = ? FOR UPDATE`,
        [id]
      );

      if (depRows.length === 0) {
        throw new Error('Deposit not found');
      }

      const deposit = depRows[0];

      if (deposit.status !== 'pending') {
        throw new Error('Hanya setoran berstatus pending yang dapat diubah.');
      }

      // 2. Ubah status deposit
      await connection.execute(`UPDATE deposits SET status = ? WHERE id = ?`, [status, id]);

      // 3. Jika disetujui, tambahkan saldo user
      if (status === 'approved') {
        await connection.execute(
          `UPDATE users SET balance = balance + ? WHERE id = ?`,
          [deposit.estimated_subtotal, deposit.user_id]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = DepositModel;
