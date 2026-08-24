-- ==========================================================
-- Database Schema untuk Aplikasi Bank Sampah (Multi-Role)
-- Berdasarkan spesifikasi terbaru di context.md
-- ==========================================================

-- Catatan: Jika Anda melakukan update pada database yang sudah ada,
-- jalankan DROP TABLE secara berurutan untuk menghindari constraint error.
-- DROP TABLE IF EXISTS withdrawals;
-- DROP TABLE IF EXISTS deposits;
-- DROP TABLE IF EXISTS transaction_details; (Tabel usang)
-- DROP TABLE IF EXISTS transactions;        (Tabel usang)
-- DROP TABLE IF EXISTS system_settings;
-- DROP TABLE IF EXISTS trash_categories;
-- DROP TABLE IF EXISTS users;

-- 1. Tabel users (Pengguna, Admin & Super Admin)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'super_admin') NOT NULL DEFAULT 'user',
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  balance DECIMAL(15,2) DEFAULT 0,
  google_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel trash_categories (Kategori & Harga Sampah)
CREATE TABLE `trash_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price_per_kg` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Tabel locations (Lokasi Bank Sampah)
CREATE TABLE `locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `maps_link` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Tabel deposits (Setoran Sampah oleh User)
-- (Menggantikan tabel transactions dan transaction_details)
CREATE TABLE deposits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  location_id INT NOT NULL,
  category_id INT NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  photo_url VARCHAR(255) NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES trash_categories(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- 5. Tabel withdrawals (Penarikan Saldo oleh User)
CREATE TABLE withdrawals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  processed_by INT NULL, -- Menyimpan ID admin/super_admin yang memproses
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- 6. Tabel system_settings (Pengaturan Dinamis Aplikasi)
CREATE TABLE system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value VARCHAR(255) NOT NULL
);

-- ==========================================================
-- Data Awal (Seeding)
-- ==========================================================

-- Insert 1 Super Admin Default (Password: superadmin321)
INSERT INTO users (name, email, password, role, status) 
VALUES ('Super Admin', 'admin@banksampah.com', '$2a$10$ItJBl0GyZA29qMZs1G1HTOLNjJ1myQNyJF4VgbRkFHiht/isatUnC', 'super_admin', 'active');

-- Insert 1 Admin Biasa (Password: admin123)
INSERT INTO users (name, email, password, role, status) 
VALUES ('Admin Cabang', 'cabang@banksampah.com', '$2a$10$lq1gFNe/FDE/e/yJnqOk4uWVdDBSRPUWxu6skO6tm6LRZLdE/A2f6', 'admin', 'active');

-- Insert Pengaturan Default
INSERT INTO system_settings (setting_key, setting_value) VALUES 
('MIN_WITHDRAWAL_BALANCE', '50000');

-- Insert Kategori Sampah Awal
INSERT INTO trash_categories (name, price_per_kg) VALUES 
('Plastik Botol', 3500.00),
('Kertas Kardus', 2000.00),
('Besi Tua', 5000.00);

-- Insert Lokasi Default
INSERT INTO locations (name, address, maps_link) VALUES 
('Bank Sampah Pusat', 'Jl. Jenderal Sudirman No. 1, Jakarta', 'https://goo.gl/maps/example');
