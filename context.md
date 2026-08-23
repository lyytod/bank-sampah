# Context & Tech Spec: Aplikasi Bank Sampah (Multi-Role)

## 1. Project Overview & Role Definitions
Aplikasi Bank Sampah berbasis Client-Server (React.js + Express.js + MySQL). Terinspirasi dari banksampahindonesia.com. 

Sistem memiliki 3 Role dengan wewenang spesifik:
1. **User (Nasabah):** 
   - Bisa mendaftar mandiri (Form Email/Password atau Google OAuth).
   - Fitur: Input setoran sampah (pilih kategori, jumlah, upload foto bukti), lihat saldo, dan request penarikan saldo (withdraw) ke Bank/E-Wallet.
2. **Admin:**
   - Dibuat oleh Super Admin.
   - Fitur: Memiliki akses fitur User, memvalidasi/menolak request penarikan saldo, dan CRUD Kategori & Harga Sampah.
3. **Super Admin:**
   - Dibuat secara manual di database (terbatas).
   - Fitur: Memiliki akses fitur User & Admin, mengatur minimum saldo penarikan, serta CRUD manajemen akun (User & Admin), termasuk suspend/blokir akun.

## 2. Frontend Routing Flow & Layout
Setiap kali login, backend merespons dengan `token` dan `role`. Frontend menggunakan React Router untuk mengarahkan pengguna ke layout yang tepat:
- `/` -> Homepage (Landing page informasi).
- `/login` & `/register` -> Halaman autentikasi.
- `/user/...` -> Dashboard khusus Nasabah.
- `/admin/...` -> Dashboard khusus Admin.
- `/superadmin/...` -> Dashboard khusus Super Admin.

## 3. Penambahan Database Schema (MySQL)

**Table: `users`**
- Tambahan: `role` ENUM('user', 'admin', 'super_admin') DEFAULT 'user'.
- Tambahan: `status` ENUM('active', 'suspended') DEFAULT 'active'.
- Tambahan: `google_id` VARCHAR(255) NULL (Untuk integrasi Google).

**Table: `deposits` (Setoran Sampah User)**
- `id`, `user_id`, `category_id`, `weight`, `photo_url` (bukti foto), `status` ENUM('pending', 'approved', 'rejected'), `created_at`.

**Table: `withdrawals` (Penarikan Saldo)**
- `id`, `user_id`, `amount`, `bank_name` (Bank/E-Wallet), `account_number`, `status` ENUM('pending', 'approved', 'rejected'), `processed_by` (admin_id), `created_at`.

**Table: `system_settings` (Pengaturan Dinamis)**
- `id`, `setting_key` (ex: 'MIN_WITHDRAWAL_BALANCE'), `setting_value` (ex: '50000').

## 4. Aturan Wajib untuk AI Assistant (AI Rules)
1. **Bekerja Bertahap (Fase):** JANGAN generate seluruh aplikasi dalam satu respons. Tunggu user meminta "Kerjakan Fase X".
2. **Auto-Routing:** Saat membuat `AuthContext`, pastikan fungsi login langsung mendeteksi `role` dan menggunakan `navigate()` ke `/user`, `/admin`, atau `/superadmin`.
3. **Keamanan:** Endpoint untuk Admin dan Super Admin harus dilindungi oleh middleware verifikasi JWT **dan** verifikasi Role (`verifyRole(['admin', 'super_admin'])`).
4. **File Upload:** Untuk setoran yang butuh foto, gunakan middleware `multer` di Express.js, simpan di folder `public/uploads`.
5. **Efisien Kode:** Jangan hapus kode yang sudah ada kecuali diminta. Modifikasi file yang sudah ada (`App.jsx`, `api.js`) sesuai kebutuhan fase.

## 5. Roadmap Eksekusi (Fase Development)
- **Fase 1 (DB & Middleware):** Modifikasi MySQL schema, update Model User, buat Auth & Role Middleware, update config database.
- **Fase 2 (Auth Engine):** Buat backend & frontend untuk Login, Register (termasuk persiapan Google OAuth), Forgot Password, dan implementasi routing/redirect berdasarkan Role.
- **Fase 3 (Public UI):** Buat Homepage yang menarik sebagai halaman awal aplikasi (pengganti Login sebagai halaman pertama).
- **Fase 4 (User Core):** Buat fitur User (Dashboard, form input setoran + upload foto, riwayat saldo, form request withdraw).
- **Fase 5 (Admin Core):** Buat fitur Admin (Validasi setoran user, validasi withdraw, CRUD kategori & harga sampah).
- **Fase 6 (Super Admin Core):** Buat fitur Super Admin (Manajemen user/admin list, suspend akun, setting minimum balance).