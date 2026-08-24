require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
  console.log("Memulai migrasi database untuk tabel locations...");
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'banksampah_db'
    });

    console.log("Berhasil terhubung ke database.");

    // 1. Buat tabel locations
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        maps_link VARCHAR(255) NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log("Tabel 'locations' diperiksa/dibuat.");

    // 2. Cek apakah ada data lokasi utama. Jika tidak ada, insert.
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM locations');
    if (rows[0].count === 0) {
      await connection.execute(`
        INSERT INTO locations (name, address, maps_link) 
        VALUES ('Bank Sampah Pusat', 'Jl. Jenderal Sudirman No. 1, Jakarta', 'https://goo.gl/maps/example')
      `);
      console.log("Lokasi default disisipkan.");
    }

    // 3. Tambahkan kolom location_id ke deposits jika belum ada
    const [columns] = await connection.execute("SHOW COLUMNS FROM deposits LIKE 'location_id'");
    if (columns.length === 0) {
      // Tambahkan kolom, set default ke 1 agar data lama tidak error (Asumsi ID 1 adalah Lokasi Pusat)
      await connection.execute(`
        ALTER TABLE deposits 
        ADD COLUMN location_id INT NOT NULL DEFAULT 1 AFTER user_id
      `);
      // Hapus klausa default agar kolom selanjutnya strict, opsional
      await connection.execute(`
        ALTER TABLE deposits 
        ALTER COLUMN location_id DROP DEFAULT
      `);
      // Tambahkan Foreign Key constraint
      await connection.execute(`
        ALTER TABLE deposits 
        ADD CONSTRAINT fk_deposit_location 
        FOREIGN KEY (location_id) REFERENCES locations(id)
      `);
      console.log("Kolom 'location_id' berhasil ditambahkan ke tabel 'deposits' dengan FK.");
    } else {
      console.log("Kolom 'location_id' sudah ada di tabel 'deposits'.");
    }

    console.log("Migrasi selesai!");
  } catch (error) {
    console.error("Terjadi kesalahan migrasi:", error);
  } finally {
    if (connection) await connection.end();
  }
}

runMigration();
