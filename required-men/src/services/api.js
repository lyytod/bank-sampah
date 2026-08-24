// ============================================================
// src/services/api.js — Axios Configuration & API Call Functions
// ============================================================
// File ini adalah SATU-SATUNYA tempat untuk berkomunikasi dengan backend.
// Semua API call dikelola di sini agar:
// 1. Base URL dan headers terpusat (tidak tersebar di banyak komponen)
// 2. JWT token otomatis disisipkan ke setiap request
// 3. Error handling konsisten (misal: auto-logout jika token expired)
//
// ARSITEKTUR:
//   Komponen React → api.js (Axios) → Express Backend → MySQL
//   Komponen React ← api.js (Axios) ← JSON Response  ←
// ============================================================

import axios from 'axios';

// ---------- 1. Buat Axios Instance ----------
// Axios instance adalah "template" untuk semua HTTP request.
// Semua config di bawah berlaku otomatis untuk setiap request.
const api = axios.create({
  // baseURL: Semua request akan diawali dengan URL ini.
  // Di development: Vite proxy meneruskan /api → localhost:5000
  // Di production: Ganti dengan URL backend production
  baseURL: '/api',

  // timeout: Batalkan request jika server tidak merespon dalam 10 detik.
  // Mencegah UI "hang" tanpa batas jika backend down.
  timeout: 10000,

  // headers default untuk semua request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- 2. Request Interceptor ----------
// Interceptor ini berjalan SEBELUM setiap request dikirim ke server.
// Fungsinya: menyisipkan JWT token ke header Authorization secara otomatis.
//
// Tanpa interceptor, kita harus menulis ini di SETIAP API call:
//   axios.get('/users', { headers: { Authorization: `Bearer ${token}` } })
// Dengan interceptor, cukup: api.get('/users') — token otomatis ditambahkan.
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('token');

    // Jika token ada, sisipkan ke header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // WAJIB return config agar request diteruskan
  },
  (error) => {
    // Error saat menyiapkan request (jarang terjadi)
    return Promise.reject(error);
  }
);

// ---------- 3. Response Interceptor ----------
// Interceptor ini berjalan SETELAH response diterima dari server.
// Fungsinya: menangani error global (terutama 401 Unauthorized).
//
// Jika server mengembalikan 401 (token expired/invalid):
// → Hapus data auth dari localStorage
// → Redirect ke halaman login
// Ini membuat user OTOMATIS ter-logout tanpa perlu handle di setiap komponen.
api.interceptors.response.use(
  (response) => {
    // Response sukses (status 2xx) — langsung teruskan
    return response;
  },
  (error) => {
    // Response error (status 4xx/5xx)
    if (error.response && error.response.status === 401) {
      // Token expired atau tidak valid
      // Bersihkan data auth
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect ke halaman login
      // Hanya redirect jika BUKAN sedang di halaman login (menghindari loop)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error); // Tetap reject agar catch() di komponen juga berjalan
  }
);

// ============================================================
// API CALL FUNCTIONS
// ============================================================
// Setiap fungsi di bawah merepresentasikan satu endpoint backend.
// Komponen React cukup import dan panggil fungsi ini.
//
// Contoh di komponen:
//   import { authAPI } from '../services/api';
//   const response = await authAPI.login({ email, password });
// ============================================================

// ---------- Auth API ----------
export const authAPI = {
  // POST /api/auth/register
  // Body: { name, email, password, role }
  register: (data) => api.post('/auth/register', data),

  // POST /api/auth/login
  // Body: { email, password }
  // Response: { token, user: { id, name, email, role, balance } }
  login: (data) => api.post('/auth/login', data),

  // POST /api/auth/forgot-password
  // Body: { email }
  forgotPassword: (data) => api.post('/auth/forgot-password', data),

  // GET /api/auth/me
  // Header: Authorization: Bearer <token> (otomatis via interceptor)
  // Response: { id, name, email, role, balance, created_at }
  getProfile: () => api.get('/auth/me'),
};

// ---------- Trash Categories API ----------
export const trashCategoryAPI = {
  // GET /api/trash-categories
  getAll: (all = false) => api.get(`/trash-categories${all ? '?all=true' : ''}`),

  // GET /api/trash-categories/:id
  getById: (id) => api.get(`/trash-categories/${id}`),

  // POST /api/trash-categories (Admin only)
  // Body: { name, price_per_kg }
  create: (data) => api.post('/trash-categories', data),

  // PUT /api/trash-categories/:id (Admin only)
  // Body: { name, price_per_kg }
  update: (id, data) => api.put(`/trash-categories/${id}`, data),

  // PATCH /api/trash-categories/:id/toggle (Admin only)
  // Body: { is_active: boolean }
  toggleActive: (id, is_active) => api.patch(`/trash-categories/${id}/toggle`, { is_active }),

  // DELETE /api/trash-categories/:id (Admin only)
  delete: (id) => api.delete(`/trash-categories/${id}`),
};

// ---------- Location API ----------
export const locationAPI = {
  // GET /api/locations
  getAll: (all = false) => api.get(`/locations${all ? '?all=true' : ''}`),

  // POST /api/locations
  create: (data) => api.post('/locations', data),

  // PUT /api/locations/:id
  update: (id, data) => api.put(`/locations/${id}`, data),

  // PATCH /api/locations/:id/toggle
  toggleActive: (id, is_active) => api.patch(`/locations/${id}/toggle`, { is_active }),

  // DELETE /api/locations/:id
  delete: (id) => api.delete(`/locations/${id}`),
};

// ---------- Public API ----------
export const publicAPI = {
  getStats: () => api.get('/public/stats'),
  getCategories: (page = 1, limit = 10) => api.get(`/public/categories?page=${page}&limit=${limit}`),
  getLocations: () => api.get('/public/locations'),
};

// ---------- Transactions API ----------
export const transactionAPI = {
  // GET /api/transactions
  // Admin: semua transaksi | Nasabah: transaksi sendiri
  getAll: () => api.get('/transactions'),

  // GET /api/transactions/:id
  // Response termasuk detail items (JOIN transaction_details + trash_categories)
  getById: (id) => api.get(`/transactions/${id}`),

  // POST /api/transactions (Admin only)
  // Body: { nasabah_id, items: [{ category_id, weight }] }
  create: (data) => api.post('/transactions', data),

  // PATCH /api/transactions/:id/complete (Admin only)
  // Mengubah status pending → completed dan update saldo nasabah
  complete: (id) => api.patch(`/transactions/${id}/complete`),
};

// ---------- Deposits API ----------
export const depositAPI = {
  // GET /api/deposits (Admin)
  getAll: () => api.get('/deposits'),

  // GET /api/deposits/my (Nasabah)
  getMyDeposits: () => api.get('/deposits/my'),

  // POST /api/deposits (Multipart Form Data)
  create: (formData) => api.post('/deposits', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // PATCH /api/deposits/:id/status (Admin)
  // Body: { status: 'approved' | 'rejected' }
  updateStatus: (id, status) => api.patch(`/deposits/${id}/status`, { status }),
};

// ---------- Withdrawals API ----------
export const withdrawalAPI = {
  // GET /api/withdrawals (Admin)
  getAll: () => api.get('/withdrawals'),

  // GET /api/withdrawals/my (Nasabah)
  getMyWithdrawals: () => api.get('/withdrawals/my'),

  // POST /api/withdrawals (Nasabah)
  create: (data) => api.post('/withdrawals', data),

  // PATCH /api/withdrawals/:id/status (Admin)
  // Body: { status: 'approved' | 'rejected' }
  updateStatus: (id, status) => api.patch(`/withdrawals/${id}/status`, { status }),
};

// ---------- Users API (Super Admin) ----------
export const userAPI = {
  // GET /api/users
  getAll: () => api.get('/users'),

  // PATCH /api/users/:id/role
  // Body: { role: 'user' | 'admin' | 'super_admin' }
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),

  // PATCH /api/users/:id/status
  // Body: { status: 'active' | 'suspended' }
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
};

// Export Axios instance sebagai default (untuk kasus custom request)
export default api;
