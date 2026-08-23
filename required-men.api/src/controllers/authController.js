// ============================================================
// src/controllers/authController.js — Request Handler untuk Auth
// ============================================================
// Controller bertanggung jawab untuk:
// 1. Menerima HTTP request (req)
// 2. Memanggil Service/Model untuk proses bisnis
// 3. Mengembalikan HTTP response (res) dalam format JSON konsisten
//
// Controller TIDAK melakukan:
// - Query database langsung (itu tugas Model)
// - Hash password atau generate token (itu tugas Service)
// ============================================================

const UserModel = require('../models/userModel');
const AuthService = require('../services/authService');

const AuthController = {
  // ==========================================================
  // POST /api/auth/register — Registrasi User Baru
  // ==========================================================
  // Flow:
  // 1. Validasi input (Zod) → 2. Cek email duplikat →
  // 3. Hash password → 4. Simpan ke DB → 5. Return response
  async register(req, res) {
    try {
      // STEP 1: Validasi input menggunakan Zod schema
      // Jika gagal, Zod melempar ZodError yang ditangkap di catch block
      const validatedData = AuthService.validateRegister(req.body);

      // STEP 2: Cek apakah email sudah terdaftar
      const existingUser = await UserModel.findByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar',
          data: null,
        });
        // 409 Conflict = resource sudah ada (lebih semantik dari 400)
      }

      // STEP 3: Hash password sebelum disimpan ke database
      // Plain password TIDAK PERNAH disimpan — hanya hash-nya
      validatedData.password = await AuthService.hashPassword(validatedData.password);

      // STEP 4: Simpan user baru ke database
      const result = await UserModel.create(validatedData);

      // STEP 5: Return success response
      // Tidak mengembalikan password hash demi keamanan
      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          id: result.insertId,
          name: validatedData.name,
          email: validatedData.email,
          role: validatedData.role,
        },
      });
    } catch (error) {
      // Tangani error validasi dari Zod secara spesifik
      if (error.name === 'ZodError') {
        // error.errors berisi array detail error dari setiap field
        const messages = error.errors.map((e) => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: messages,
          data: null,
        });
      }

      // Error tak terduga (DB down, network error, dll)
      console.error('Register Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // POST /api/auth/login — Login User
  // ==========================================================
  // Flow:
  // 1. Validasi input → 2. Cari user by email →
  // 3. Bandingkan password → 4. Generate JWT → 5. Return token
  async login(req, res) {
    try {
      // STEP 1: Validasi format input
      const validatedData = AuthService.validateLogin(req.body);

      // STEP 2: Cari user berdasarkan email
      const user = await UserModel.findByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah',
          data: null,
        });
        // Pesan sengaja TIDAK spesifik ("email tidak ditemukan")
        // untuk mencegah enumeration attack (penyerang menebak email valid)
      }

      // STEP 2.5: Cek apakah akun di-suspend
      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda telah ditangguhkan. Silakan hubungi administrator.',
          data: null,
        });
      }

      // STEP 3: Bandingkan plain password dengan hash di database
      const isPasswordValid = await AuthService.comparePassword(
        validatedData.password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah',
          data: null,
        });
        // Pesan yang SAMA persis agar tidak bocor info mana yang salah
      }

      // STEP 4: Generate JWT token berisi { id, role }
      const token = AuthService.generateToken(user);

      // STEP 5: Return token beserta info user (tanpa password)
      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            balance: user.balance,
          },
        },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e) => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: messages,
          data: null,
        });
      }

      console.error('Login Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // GET /api/auth/me — Ambil Profil User yang Sedang Login
  // ==========================================================
  // Endpoint ini DILINDUNGI oleh authMiddleware.
  // req.user sudah diisi oleh middleware dengan { id, role } dari JWT.
  async getProfile(req, res) {
    try {
      // req.user.id berasal dari JWT payload yang di-decode oleh middleware
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
          data: null,
        });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda telah ditangguhkan.',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profil berhasil diambil',
        data: user,
      });
    } catch (error) {
      console.error('GetProfile Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  },

  // ==========================================================
  // POST /api/auth/forgot-password — Dummy Forgot Password
  // ==========================================================
  async forgotPassword(req, res) {
    try {
      const validatedData = AuthService.validateForgotPassword(req.body);
      
      const user = await UserModel.findByEmail(validatedData.email);
      if (!user) {
        // Return 200 sukses MESKIPUN email tidak ditemukan 
        // (Security best practice: Mencegah attacker mengetahui email mana yang terdaftar)
        return res.status(200).json({
          success: true,
          message: 'Jika email terdaftar, instruksi reset password telah dikirim.',
          data: null,
        });
      }

      // Generate dummy token
      const resetToken = AuthService.generateResetToken(user);
      
      // DUMMY: Di production, kirim resetToken via Email di sini.
      console.log(`[DUMMY EMAIL SENT] Reset Password Token untuk ${user.email}: ${resetToken}`);

      return res.status(200).json({
        success: true,
        message: 'Jika email terdaftar, instruksi reset password telah dikirim.',
        data: {
          dummy_token_for_dev: resetToken // Dihapus di production
        },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e) => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: messages,
          data: null,
        });
      }

      console.error('Forgot Password Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        data: null,
      });
    }
  }
};

module.exports = AuthController;
