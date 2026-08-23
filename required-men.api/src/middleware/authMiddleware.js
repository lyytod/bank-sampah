// ============================================================
// src/middleware/authMiddleware.js — JWT Verification & RBAC
// ============================================================
// Middleware ini "menjaga pintu" sebelum request sampai ke controller.
//
// Dua middleware tersedia:
// 1. verifyToken  → Memastikan user sudah login (punya token valid)
// 2. authorizeRole → Memastikan user punya role yang tepat (admin/nasabah)
//
// Cara kerja di Express:
//   router.get('/protected', verifyToken, authorizeRole('admin'), controller)
//   Request harus melewati verifyToken DAN authorizeRole sebelum masuk controller.
// ============================================================

const AuthService = require('../services/authService');

// ---------- Middleware 1: Verifikasi JWT Token ----------
// Mengecek apakah request membawa token JWT yang valid di header.
//
// Format header yang diharapkan:
//   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
//
// Jika valid: req.user diisi dengan decoded payload, lalu next()
// Jika invalid: return 401 Unauthorized
const verifyToken = (req, res, next) => {
  try {
    // Ambil header Authorization
    const authHeader = req.headers.authorization;

    // Cek apakah header ada dan formatnya benar (Bearer <token>)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.',
        data: null,
      });
    }

    // Pisahkan "Bearer" dari token-nya
    // "Bearer eyJhbG..." → split(' ') → ["Bearer", "eyJhbG..."] → ambil index [1]
    const token = authHeader.split(' ')[1];

    // Verifikasi dan decode token menggunakan AuthService
    // Jika token expired atau invalid, jwt.verify() akan throw error
    const decoded = AuthService.verifyToken(token);

    // Simpan data user dari token ke req.user
    // Sekarang controller bisa akses req.user.id dan req.user.role
    req.user = decoded;

    // Lanjut ke middleware/controller berikutnya
    next();
  } catch (error) {
    // Token expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah expired. Silakan login ulang.',
        data: null,
      });
    }

    // Token tidak valid (di-tamper, salah secret, format rusak)
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid.',
      data: null,
    });
  }
};

// ---------- Middleware 2: Role-Based Access Control (RBAC) ----------
// Higher-order function yang mengembalikan middleware.
// Menerima daftar role yang DIIZINKAN mengakses route.
//
// Contoh penggunaan:
//   authorizeRole('admin')            → hanya admin
//   authorizeRole('admin', 'nasabah') → admin DAN nasabah
//
// HARUS dipanggil SETELAH verifyToken, karena butuh req.user.role
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user.role sudah diisi oleh verifyToken dari JWT payload
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk mengakses resource ini.',
        data: null,
      });
      // 403 Forbidden = user terautentikasi TAPI tidak punya hak akses
      // Berbeda dengan 401 Unauthorized = user belum terautentikasi
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRole };
