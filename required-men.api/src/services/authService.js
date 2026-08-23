// ============================================================
// src/services/authService.js — Business Logic untuk Autentikasi
// ============================================================
// Update Fase 2: 
// - Menyesuaikan validasi role ('user', 'admin', 'super_admin')
// - Menambahkan validasi google_id (opsional)
// - Menambahkan fungsi dummy untuk Forgot Password
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// ---------- Validation Schemas (Zod) ----------

const registerSchema = z.object({
  name: z.string({ required_error: 'Nama wajib diisi' }).min(3, 'Nama minimal 3 karakter').max(100),
  email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
  password: z.string({ required_error: 'Password wajib diisi' }).min(6, 'Password minimal 6 karakter'),
  role: z.enum(['user', 'admin', 'super_admin']).default('user'),
  google_id: z.string().nullable().optional(),
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
  password: z.string({ required_error: 'Password wajib diisi' }).min(1, 'Password wajib diisi'),
});

const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
});

const AuthService = {
  // ---------- Validasi Input ----------
  validateRegister(data) {
    return registerSchema.parse(data);
  },

  validateLogin(data) {
    return loginSchema.parse(data);
  },

  validateForgotPassword(data) {
    return forgotPasswordSchema.parse(data);
  },

  // ---------- Hash & Compare Password ----------
  async hashPassword(plainPassword) {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  },

  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // ---------- JWT Token Generation & Verification ----------
  generateToken(user) {
    const payload = {
      id: user.id,
      role: user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  },

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  },

  // ---------- Forgot Password (Dummy) ----------
  // Menggenerate token reset password yang umurnya sangat singkat (15 menit).
  // Di sistem sungguhan, token ini akan dikirim via Email (Nodemailer).
  generateResetToken(user) {
    const payload = {
      id: user.id,
      action: 'reset_password',
    };
    // Gunakan secret khusus gabungan JWT_SECRET dan password hash lama 
    // agar token invalid setelah password diubah.
    const secret = process.env.JWT_SECRET + user.password;
    return jwt.sign(payload, secret, { expiresIn: '15m' });
  }
};

module.exports = AuthService;
