import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Homepage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-secondary-50 font-sans selection:bg-primary-500 selection:text-white">
      {/* ====== NAVBAR ====== */}
      <Navbar />

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
          <div className="w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-8 border border-primary-100 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
              Platform Daur Ulang Modern
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-secondary-900 tracking-tight mb-8 leading-tight">
              Ubah Sampah Menjadi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">
                Nilai Ekonomis
              </span>
            </h1>

            <p className="text-xl text-secondary-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Bergabunglah dengan ribuan nasabah lainnya. Kumpulkan sampah yang bisa didaur ulang, setorkan, dan nikmati keuntungan finansial sekaligus menyelamatkan bumi kita.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'super_admin' ? '/superadmin' : user?.role === 'admin' ? '/admin' : '/user'}
                  className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/30 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  Buka Dashboard
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/30 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  Mulai Menabung
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </Link>
              )}
              <a
                href="#cara-kerja"
                className="w-full sm:w-auto px-8 py-4 bg-white text-secondary-700 font-bold rounded-2xl hover:bg-secondary-50 shadow-sm border border-secondary-200 transform hover:-translate-y-1 transition-all text-center"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES SECTION ====== */}
      <section id="fitur" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Fitur Unggulan Kami</h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">Sistem yang dirancang untuk memudahkan Anda dalam mengelola sampah secara cerdas dan transparan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-secondary-50 border border-secondary-100 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Sistem Digital</h3>
              <p className="text-secondary-600 leading-relaxed">
                Pantau saldo, riwayat setoran, dan request penarikan dana langsung dari dashboard personal Anda.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-secondary-50 border border-secondary-100 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Pencairan Mudah</h3>
              <p className="text-secondary-600 leading-relaxed">
                Tarik saldo hasil setoran sampah langsung ke rekening Bank atau E-Wallet pilihan Anda dengan cepat.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-secondary-50 border border-secondary-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Dampak Nyata</h3>
              <p className="text-secondary-600 leading-relaxed">
                Setiap kilogram sampah yang Anda setorkan berkontribusi langsung pada pengurangan emisi karbon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CALL TO ACTION ====== */}
      <section className="py-20 bg-secondary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Placeholder for an eco pattern/grid */}
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Siap Menjadi Pahlawan Lingkungan?</h2>
          <p className="text-xl text-secondary-300 mb-10 leading-relaxed">
            Pendaftaran 100% gratis. Mulai pilah sampah dari rumah dan rasakan manfaat finansialnya.
          </p>
          {isAuthenticated ? (
            <Link
              to={user?.role === 'super_admin' ? '/superadmin' : user?.role === 'admin' ? '/admin' : '/user'}
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-400 shadow-xl shadow-primary-500/30 transform hover:scale-105 transition-all"
            >
              Kembali ke Dashboard
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-400 shadow-xl shadow-primary-500/30 transform hover:scale-105 transition-all"
            >
              Buat Akun Gratis Sekarang
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
