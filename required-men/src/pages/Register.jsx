import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Semua field wajib diisi');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'user', // Default role untuk registrasi mandiri
      });

      // Redirect ke login setelah sukses daftar
      navigate('/login', { replace: true, state: { message: 'Registrasi berhasil! Silakan login.' } });
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Registrasi gagal');
      } else {
        setError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ====== LEFT PANEL: Branding & Illustration ====== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute top-20 -left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full">
          <div className="text-6xl mb-6">♻️</div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">Bergabunglah<br /><span className="text-primary-200">Bersama Kami</span></h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-md">Ubah sampah menjadi berkah. Mulai menabung dan berkontribusi untuk lingkungan yang lebih bersih.</p>
        </div>
      </div>

      {/* ====== RIGHT PANEL: Register Form ====== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-secondary-50 relative">
        <div className="w-full max-w-md">
          {/* Back to Home Link */}
          <div className="mb-6">
            <Link to="/" className="text-sm font-medium text-secondary-500 hover:text-primary-600 transition-colors flex items-center gap-2 w-max">
              <span>&larr;</span> Kembali ke Beranda
            </Link>
          </div>

          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-3">♻️</div>
            <h1 className="text-2xl font-bold text-gradient">Bank Sampah</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-secondary-800">Daftar Akun</h2>
            <p className="text-secondary-500 mt-2">Buat akun baru sebagai Nasabah</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Nama Lengkap</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Nama Anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Konfirmasi Password</label>
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Ulangi password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <span className="w-1/5 border-b border-secondary-300 lg:w-1/4"></span>
            <span className="text-xs text-center text-secondary-500 uppercase">Atau daftar dengan</span>
            <span className="w-1/5 border-b border-secondary-300 lg:w-1/4"></span>
          </div>

          <button
            type="button"
            className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-6 bg-white border border-secondary-300 rounded-xl text-secondary-700 font-semibold hover:bg-secondary-50 shadow-sm"
            onClick={() => alert('Fitur Google OAuth akan diintegrasikan dengan GOOGLE_CLIENT_ID.')}
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <p className="mt-8 text-center text-secondary-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
