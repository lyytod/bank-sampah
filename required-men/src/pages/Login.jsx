// ============================================================
// src/pages/Login.jsx — Halaman Login Lengkap
// ============================================================
// Halaman ini menangani:
// 1. Form input email & password dengan validasi client-side
// 2. Panggil API login via authAPI.login()
// 3. Simpan token & user data via AuthContext
// 4. Redirect ke dashboard setelah login berhasil
// 5. Tampilkan error message jika gagal
//
// UI: Desain split-screen dengan gradient di kiri, form di kanan.
// ============================================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  // ---------- Hooks ----------
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // ---------- State ----------
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Jika user sudah login, redirect ke dashboard
  // (menghindari akses halaman login saat sudah authenticated)
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // ---------- Handlers ----------

  // Update state saat user mengetik di input field
  // [e.target.name] = computed property name, mengambil atribut 'name' dari input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Hapus error message saat user mulai mengetik ulang
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah browser reload halaman (default behavior form)

    // Validasi sederhana di client-side
    if (!formData.email || !formData.password) {
      setError('Email dan password wajib diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Panggil API login
      const response = await authAPI.login(formData);
      const { token, user } = response.data.data;

      // Simpan ke AuthContext (dan localStorage via context)
      login(user, token);

      // Redirect ke halaman asal (jika ada) atau dashboard
      // location.state?.from berasal dari ProtectedRoute saat redirect ke login
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Tangani error dari backend
      if (err.response) {
        // Server merespon dengan error (400, 401, 500, dll)
        setError(err.response.data.message || 'Login gagal');
      } else if (err.request) {
        // Request terkirim tapi tidak ada response (server down)
        setError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
      } else {
        // Error lainnya
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen flex">
      {/* ====== LEFT PANEL: Branding & Illustration ====== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 -left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="text-6xl mb-6">♻️</div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Bank Sampah
            <br />
            <span className="text-primary-200">Digital</span>
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-md">
            Kelola setoran sampah, pantau tabungan nasabah, dan lacak transaksi
            secara digital. Bersama menjaga lingkungan untuk masa depan yang lebih baik.
          </p>

          {/* Stats preview */}
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-primary-200 text-sm">Nasabah Aktif</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold">500kg</div>
              <div className="text-primary-200 text-sm">Sampah Terkelola</div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== RIGHT PANEL: Login Form ====== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-secondary-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo (hidden on desktop) */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-3">♻️</div>
            <h1 className="text-2xl font-bold text-gradient">Bank Sampah</h1>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-secondary-800">
              Selamat Datang
            </h2>
            <p className="text-secondary-500 mt-2">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400">
                  📧
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-secondary-300 rounded-xl
                             text-secondary-800 placeholder-secondary-400
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400">
                  🔒
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 bg-white border border-secondary-300 rounded-xl
                             text-secondary-800 placeholder-secondary-400
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             transition-all duration-200"
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400
                             hover:text-secondary-600 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-xl
                         hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transform active:scale-[0.98] transition-all duration-200
                         shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  {/* CSS Spinner */}
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-secondary-400">
            Bank Sampah Digital &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
