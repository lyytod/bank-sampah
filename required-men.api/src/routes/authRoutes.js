// ============================================================
// src/routes/authRoutes.js — Definisi Endpoint Autentikasi
// ============================================================
// File ini mendefinisikan URL endpoint dan menghubungkannya
// dengan controller yang sesuai.
//
// Endpoint yang tersedia:
//   POST /api/auth/register → Daftar user baru
//   POST /api/auth/login    → Login dan dapatkan JWT token
//   GET  /api/auth/me       → Ambil profil user (perlu token)
//
// Route ini di-mount di server.js dengan prefix '/api/auth'
// Jadi: router.post('/register') → menjadi POST /api/auth/register
// ============================================================

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// ---------- Public Routes (Tidak perlu login) ----------
// POST /api/auth/register
// Endpoint terbuka (tanpa token) untuk mendaftar
router.post('/register', AuthController.register);

// POST /api/auth/login
// Endpoint terbuka untuk mendapatkan token
router.post('/login', AuthController.login);

// POST /api/auth/forgot-password
// Endpoint terbuka untuk reset password
router.post('/forgot-password', AuthController.forgotPassword);

// ---------- Protected Routes (Harus login) ----------
// verifyToken memastikan request membawa JWT valid
// Jika token valid, lanjut ke AuthController.getProfile
// Jika tidak, middleware mengembalikan 401
router.get('/me', verifyToken, AuthController.getProfile);

module.exports = router;
