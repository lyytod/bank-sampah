const db = require('../config/db');

const LocationModel = {
  // GET: Semua lokasi (Admin)
  async findAll() {
    const sql = `SELECT * FROM locations ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // GET: Semua lokasi yang AKTIF saja (User dropdown)
  async findAllActive() {
    const sql = `SELECT * FROM locations WHERE is_active = 1 ORDER BY name ASC`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // POST: Buat lokasi baru
  async create(data) {
    const { name, address, maps_link } = data;
    const sql = `INSERT INTO locations (name, address, maps_link) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [name, address, maps_link || null]);
    return result;
  },

  // PUT: Update lokasi
  async update(id, data) {
    const { name, address, maps_link } = data;
    const sql = `UPDATE locations SET name = ?, address = ?, maps_link = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [name, address, maps_link || null, id]);
    return result;
  },

  // PATCH: Toggle status aktif
  async toggleActive(id, isActive) {
    const sql = `UPDATE locations SET is_active = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [isActive ? 1 : 0, id]);
    return result;
  },

  // DELETE: Hapus permanen
  async delete(id) {
    const sql = `DELETE FROM locations WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  }
};

module.exports = LocationModel;
