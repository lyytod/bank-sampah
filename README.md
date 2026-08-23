# ♻️ Bank Sampah Digital

Bank Sampah Digital adalah platform aplikasi web _full-stack_ yang dibangun untuk memudahkan proses pengelolaan, penyetoran, dan pencairan dana tabungan sampah. Platform ini menghubungkan Nasabah dengan pihak pengepul (Admin) secara transparan dan efisien.

## 🚀 Fitur Utama

Aplikasi ini menggunakan arsitektur *Role-Based Access Control* (RBAC) yang membagi pengguna menjadi 3 peran:

### 1. Nasabah (User)
- **Registrasi & Autentikasi:** Mendaftar mandiri melalui *form* pendaftaran yang dilengkapi keamanan *password hashing*.
- **Setor Sampah:** Memilih kategori sampah, memasukkan berat (kg), serta melampirkan foto bukti sampah untuk dikirimkan ke Admin.
- **Tarik Dana:** Mengajukan penarikan saldo ke berbagai bank / *e-wallet* (BCA, Mandiri, GoPay, DANA, dll).
- **Dashboard & Riwayat:** Memantau ringkasan saldo aktual dan melacak status transaksi (Pending, Approved, Rejected).

### 2. Administrator (Admin Cabang)
- **Validasi Setoran:** Menerima atau menolak setoran sampah nasabah. Jika disetujui, saldo nasabah akan otomatis bertambah (*Database Transaction Safe*).
- **Validasi Penarikan:** Memproses pencairan dana nasabah. Jika disetujui, saldo nasabah akan dipotong secara aman.
- **Manajemen Kategori Sampah:** Membuat, mengedit, dan mengubah status (*Soft Delete / Toggle*) harga kategori sampah yang berlaku.

### 3. Super Admin
- **User Management:** Memiliki wewenang absolut untuk melihat seluruh daftar pengguna.
- **Role Assignment:** Dapat mempromosikan Nasabah menjadi Admin Cabang, atau menurunkan pangkat Admin.
- **Moderasi Akun:** Dapat menangguhkan (*Suspend*) akun pengguna yang melanggar, mencegah mereka untuk *login* atau mengakses API (diblokir pada level Middleware).

---

## 🛠️ Teknologi yang Digunakan

**Frontend:**
- [React (Vite)](https://vitejs.dev/) - Framework UI
- [Tailwind CSS](https://tailwindcss.com/) - Styling & Desain Responsif
- [React Router DOM](https://reactrouter.com/) - Manajemen Routing & Navigasi
- [Axios](https://axios-http.com/) - Interceptor & HTTP Client

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) - Server API
- [MySQL2](https://www.npmjs.com/package/mysql2) - Database Driver dengan Promise & Transaction support
- [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) - Enkripsi Password
- [JSON Web Token (JWT)](https://jwt.io/) - Otorisasi & Manajemen Sesi
- [Multer](https://www.npmjs.com/package/multer) - Penanganan Upload File / Foto

---

## 💻 Panduan Instalasi & Menjalankan Aplikasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer Anda.

### 1. Persiapan Database (MySQL)
1. Buka **XAMPP / Laragon** dan jalankan modul MySQL.
2. Buka `phpMyAdmin` (biasanya `http://localhost/phpmyadmin`).
3. Buat database baru bernama `banksampah_db`.
4. Import file **`bank_sampah.sql`** yang ada di _root_ folder ini ke dalam database tersebut.
   > File `bank_sampah.sql` sudah dilengkapi dengan 2 akun *default* (Super Admin & Admin Cabang).

### 2. Persiapan Backend (API)
Buka terminal baru, dan arahkan ke folder `required-men.api`:
```bash
cd required-men.api
npm install
```
Buat file bernama `.env` di dalam folder `required-men.api` dan isi dengan konfigurasi berikut:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=banksampah_db

JWT_SECRET=super_secret_key_yang_panjang_dan_aman_123
JWT_EXPIRES_IN=7d
```
Jalankan server Backend:
```bash
npm run dev
```
*(Backend akan berjalan di `http://localhost:5000`)*

### 3. Persiapan Frontend (Client)
Buka terminal baru lainnya, dan arahkan ke folder `required-men`:
```bash
cd required-men
npm install
```
Jalankan server Frontend:
```bash
npm run dev
```
*(Frontend akan berjalan di `http://localhost:5173`)*

---

## 🔑 Akun Default (Testing)

Saat Anda pertama kali meng-*import* database, Anda dapat login menggunakan kredensial berikut:

- **Super Admin**
  - Email: `admin@banksampah.com`
  - Password: `superadmin321`

- **Admin Cabang**
  - Email: `cabang@banksampah.com`
  - Password: `admin123`

---
*Dibuat untuk sistem informasi pengelolaan sampah masa depan yang lebih baik.* 🌍
