import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-secondary-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-3xl">♻️</span>
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Bank Sampah Digital
            </Link>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-secondary-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link to="/cara-kerja" className="text-secondary-600 hover:text-primary-600 font-medium transition-colors">Cara Kerja</Link>
            <Link to="/tentang-kami" className="text-secondary-600 hover:text-primary-600 font-medium transition-colors">Tentang Kami</Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'super_admin' ? '/superadmin' : user?.role === 'admin' ? '/admin' : '/user'}
                className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all"
              >
                Dashboard ({user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Nasabah'})
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:block px-5 py-2.5 text-primary-600 font-semibold hover:bg-primary-50 rounded-xl transition-all"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
