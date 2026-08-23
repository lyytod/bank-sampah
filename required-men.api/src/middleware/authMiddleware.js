// ============================================================
// src/middleware/authMiddleware.js — JWT Verification & RBAC
// ============================================================
// Middleware ini "menjaga pintu" sebelum request sampai ke controller.
//
// Update Fase 1: 
// - verifyToken: Ditambahkan pengecekan database secara real-time 
//   untuk mengeblok akses jika akun user di-suspend.
// - authorizeRole: Disesuaikan untuk struktur 3 Role (user, admin, super_admin).
// ============================================================

const AuthService = require('../services/authService');
const UserModel = require('../models/userModel');

// ---------- Middleware 1: Verifikasi JWT Token & Status Akun ----------
// Mengecek apakah request membawa token JWT yang valid.
// Jika valid, akan mengecek ke database apakah akun dalam status 'active'.
// Jika 'suspended', akses langsung ditolak.
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verifikasi dan decode token (throws error if invalid/expired)
    const decoded = AuthService.verifyToken(token);

    // Cek status terbaru user dari database secara real-time
    const currentUser = await UserModel.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan. Token tidak valid.',
        data: null,
      });
    }

    // Blokir jika statusnya suspended
    if (currentUser.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Akun Anda telah ditangguhkan (suspended).',
        data: null,
      });
    }

    // Simpan data user terbaru ke req.user agar bisa dipakai controller
    req.user = currentUser;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah expired. Silakan login ulang.',
        data: null,
      });
    }

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
//   authorizeRole('super_admin')             → hanya super admin
//   authorizeRole('admin', 'super_admin')    → admin & super admin
//
// HARUS dipanggil SETELAH verifyToken
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user sudah diisi oleh verifyToken dari database
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk mengakses resource ini.',
        data: null,
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRole };
