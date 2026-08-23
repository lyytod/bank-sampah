const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'banksampah_db'
    });

    console.log("Connected to DB, altering table...");
    
    // Check if column exists first (optional, but safe to just catch error)
    try {
      await connection.execute(`ALTER TABLE trash_categories ADD COLUMN is_active TINYINT(1) DEFAULT 1`);
      console.log("Column is_active added successfully.");
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("Column is_active already exists.");
      } else {
        throw err;
      }
    }
    
    await connection.end();
    console.log("Done.");
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
