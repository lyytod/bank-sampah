const db = require('../config/db');

const WithdrawalModel = {
  // CREATE: Buat request penarikan baru
  async create(data) {
    const { user_id, amount, bank_name, account_number } = data;
    const sql = `
      INSERT INTO withdrawals (user_id, amount, bank_name, account_number, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
    const [result] = await db.execute(sql, [user_id, amount, bank_name, account_number]);
    return result;
  },

  // READ: Dapatkan semua riwayat penarikan milik user tertentu
  async findByUserId(userId) {
    const sql = `
      SELECT id, amount, bank_name, account_number, status, created_at 
      FROM withdrawals 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  },

  // (Optional) READ: Ambil jumlah total penarikan pending untuk validasi saldo
  async getPendingWithdrawalTotal(userId) {
    const sql = `
      SELECT SUM(amount) as total_pending 
      FROM withdrawals 
      WHERE user_id = ? AND status = 'pending'
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0].total_pending || 0;
  },

  // READ: Dapatkan semua riwayat penarikan (Admin)
  async findAll() {
    const sql = `
      SELECT w.id, w.amount, w.bank_name, w.account_number, w.status, w.created_at,
             u.name as user_name, u.email as user_email
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // UPDATE: Update status penarikan dan potong saldo jika 'approved' (Untuk Admin)
  async updateStatus(id, status) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Ambil data withdrawal
      const [withRows] = await connection.execute(
        `SELECT * FROM withdrawals WHERE id = ? FOR UPDATE`,
        [id]
      );

      if (withRows.length === 0) {
        throw new Error('Penarikan tidak ditemukan');
      }

      const withdrawal = withRows[0];

      if (withdrawal.status !== 'pending') {
        throw new Error('Hanya penarikan berstatus pending yang dapat diubah.');
      }

      // Jika di-approve, kita perlu mengecek ulang apakah saldo user saat ini masih mencukupi
      // Karena mungkin saldo berkurang dari penarikan lain yang berbarengan (walaupun jarang)
      if (status === 'approved') {
        const [userRows] = await connection.execute(
          `SELECT balance FROM users WHERE id = ? FOR UPDATE`,
          [withdrawal.user_id]
        );
        
        if (userRows[0].balance < withdrawal.amount) {
           throw new Error('Gagal menyetujui penarikan: Saldo nasabah saat ini tidak mencukupi.');
        }

        // 2. Potong saldo user
        await connection.execute(
          `UPDATE users SET balance = balance - ? WHERE id = ?`,
          [withdrawal.amount, withdrawal.user_id]
        );
      }

      // 3. Ubah status withdrawal
      await connection.execute(`UPDATE withdrawals SET status = ? WHERE id = ?`, [status, id]);

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

module.exports = WithdrawalModel;
