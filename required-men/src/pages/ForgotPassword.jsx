import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus({ type: 'error', message: 'Email wajib diisi' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await authAPI.forgotPassword({ email });
      setStatus({ type: 'success', message: response.data.message });
      
      // Jika ada dummy token (hanya untuk development)
      if (response.data.data?.dummy_token_for_dev) {
        console.log("Token Reset:", response.data.data.dummy_token_for_dev);
      }
    } catch (err) {
      if (err.response) {
        setStatus({ type: 'error', message: err.response.data.message || 'Terjadi kesalahan' });
      } else {
        setStatus({ type: 'error', message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-secondary-200">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔒</div>
            <h1 className="text-2xl font-bold text-secondary-800">Lupa Password?</h1>
            <p className="text-secondary-500 mt-2 text-sm">
              Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset password.
            </p>
          </div>

          {status.message && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <span className="text-xl flex-shrink-0">{status.type === 'error' ? '⚠️' : '✅'}</span>
              <p className={`text-sm ${status.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>
                {status.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400">📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if(status.message) setStatus({ type: '', message: '' });
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Kirim Instruksi'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm font-medium text-secondary-500 hover:text-primary-600 transition-colors">
              &larr; Kembali ke halaman Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
