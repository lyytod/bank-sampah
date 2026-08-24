import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ---------- Import Pages ----------
import Homepage from './pages/Homepage';
import CaraKerja from './pages/CaraKerja';
import TentangKami from './pages/TentangKami';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// ---------- Fallback Pages ----------
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-secondary-50">
    <div className="card text-center max-w-md p-8 bg-white rounded-xl shadow-lg border border-secondary-200">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-secondary-800 mb-2">Akses Ditolak</h1>
      <p className="text-secondary-600 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <button onClick={() => window.history.back()} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Kembali
      </button>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-secondary-50">
    <div className="card text-center max-w-md p-8 bg-white rounded-xl shadow-lg border border-secondary-200">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-secondary-800 mb-2">404 — Tidak Ditemukan</h1>
      <p className="text-secondary-600 mb-4">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <button onClick={() => window.history.back()} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Kembali
      </button>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ====== PUBLIC ROUTES ====== */}
          <Route path="/" element={<Homepage />} />
          <Route path="/cara-kerja" element={<CaraKerja />} />
          <Route path="/tentang-kami" element={<TentangKami />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ====== PROTECTED ROUTES ====== */}
          
          {/* USER (Nasabah) ROUTES */}
          <Route element={<ProtectedRoute roles={['user', 'admin', 'super_admin']} />}>
            <Route path="/user" element={<UserDashboard />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute roles={['admin', 'super_admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* SUPER ADMIN ROUTES */}
          <Route element={<ProtectedRoute roles={['super_admin']} />}>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
          </Route>

          {/* ====== REDIRECTS & FALLBACKS ====== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
