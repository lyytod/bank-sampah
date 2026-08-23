// ============================================================
// src/services/authService.js — Business Logic untuk Autentikasi
// ============================================================
// Service layer berisi LOGIKA BISNIS murni:
// - Validasi input (menggunakan Zod schema)
// - Hashing password (bcrypt)
// - Generate & verifikasi JWT token
//
// MENGAPA dipisah dari Controller?
// 1. Controller hanya handle HTTP (req/res) — tidak tahu soal bcrypt/JWT
// 2. Service bisa di-reuse di tempat lain (misal: CLI tool, unit test)
// 3. Lebih mudah di-test karena tidak bergantung pada objek Express
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// ---------- Validation Schemas (Zod) ----------
// Zod memvalidasi input SEBELUM masuk ke database.
// Jika validasi gagal, Zod melempar ZodError dengan pesan detail.

// Schema untuk registrasi user baru
const registerSchema = z.object({
  name: z
    .string({ required_error: 'Nama wajib diisi' })
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z
    .string({ required_error: 'Email wajib diisi' })
    .email('Format email tidak valid'),
  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(6, 'Password minimal 6 karakter'),
  role: z
    .enum(['admin', 'nasabah'], {
      errorMap: () => ({ message: "Role harus 'admin' atau 'nasabah'" }),
    })
    .default('nasabah'), // Jika role tidak dikirim, default = nasabah
});

// Schema untuk login — hanya butuh email dan password
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi' })
    .email('Format email tidak valid'),
  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi'),
});

const AuthService = {
  // ---------- Validasi Input ----------
  // Mem-parse dan memvalidasi data menggunakan Zod schema.
  // Jika valid, mengembalikan data yang sudah di-sanitize.
  // Jika tidak valid, melempar ZodError.
  validateRegister(data) {
    return registerSchema.parse(data);
  },

  validateLogin(data) {
    return loginSchema.parse(data);
  },

  // ---------- Hash Password ----------
  // bcrypt.hash() menggunakan salt rounds = 10 (standar industri).
  // Salt rounds menentukan kompleksitas hashing:
  //   - 10 = ~10 hash/detik (cukup aman untuk production)
  //   - 12 = ~3 hash/detik (lebih aman, tapi lebih lambat)
  // Salt di-generate otomatis dan di-embed dalam hash result.
  async hashPassword(plainPassword) {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  },

  // ---------- Bandingkan Password ----------
  // Membandingkan plain password dari user dengan hash di database.
  // bcrypt.compare() secara internal mengekstrak salt dari hash,
  // lalu hash ulang plain password dengan salt yang sama untuk dibandingkan.
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // ---------- Generate JWT Token ----------
  // Payload berisi data user yang AMAN untuk disimpan di token:
  //   - id: untuk identifikasi user
  //   - role: untuk authorization (admin vs nasabah)
  // JANGAN masukkan password atau data sensitif ke payload!
  //
  // expiresIn: '24h' artinya token expired dalam 24 jam.
  // Setelah expired, user harus login ulang.
  generateToken(user) {
    const payload = {
      id: user.id,
      role: user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  },

  // ---------- Verifikasi JWT Token ----------
  // Memverifikasi bahwa token valid dan belum expired.
  // Jika valid, return decoded payload { id, role, iat, exp }.
  // Jika invalid/expired, melempar JsonWebTokenError.
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  },
};

module.exports = AuthService;
