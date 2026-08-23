-- ==========================================================
-- Database Schema untuk Aplikasi Bank Sampah
-- Berdasarkan spesifikasi di tech-spec.md
-- ==========================================================

-- Buat database jika belum ada (opsional, jalankan ini jika Anda belum buat databasenya)
-- CREATE DATABASE IF NOT EXISTS bank_sampah;
-- USE bank_sampah;

-- 1. Tabel users (Pengguna & Nasabah)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'nasabah') NOT NULL DEFAULT 'nasabah',
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel trash_categories (Kategori Sampah)
CREATE TABLE trash_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel transactions (Transaksi Setor Sampah)
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nasabah_id INT NOT NULL,
  admin_id INT NOT NULL,
  total_weight DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nasabah_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 4. Tabel transaction_details (Detail Item Transaksi)
CREATE TABLE transaction_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  category_id INT NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES trash_categories(id)
);

-- ==========================================================
-- Data Awal (Seeding)
-- ==========================================================

-- Insert 1 Admin Default agar Anda bisa langsung login
-- Password aslinya adalah: superadmin321
INSERT INTO users (name, email, password, role) 
VALUES ('Super Admin', 'admin@banksampah.com', '$2a$10$ItJBl0GyZA29qMZs1G1HTOLNjJ1myQNyJF4VgbRkFHiht/isatUnC', 'admin');

-- Opsional: Insert beberapa kategori sampah sebagai contoh awal
INSERT INTO trash_categories (name, price_per_kg) VALUES 
('Plastik Botol', 3500.00),
('Kertas Kardus', 2000.00),
('Besi Tua', 5000.00);
