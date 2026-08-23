// ============================================================
// src/App.jsx — Main Router Configuration
// ============================================================
// File ini adalah "peta jalan" seluruh aplikasi.
// Mendefinisikan URL mana → menampilkan komponen apa.
//
// STRUKTUR ROUTE:
// /login              → Halaman login (public)
// /dashboard          → Dashboard (protected, semua role)
// /unauthorized       → Halaman akses ditolak
// /                   → Redirect ke /dashboard
// *                   → Halaman 404 Not Found
//
// KONSEP REACT ROUTER v7:
// - <BrowserRouter>  → Menggunakan HTML5 History API untuk URL bersih
// - <Routes>         → Container untuk semua <Route>
// - <Route element>  → Layout/guard wrapper (ProtectedRoute, DashboardLayout)
// - <Outlet />       → Placeholder untuk child route di dalam wrapper
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ---------- Import Pages ----------
// Halaman-halaman ini akan dibuat lengkap di Fase 6.
// Untuk sekarang, kita buat placeholder sederhana agar routing bisa ditest.
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// ---------- Halaman Unauthorized (inline) ----------
// Ditampilkan saat user mencoba mengakses halaman tanpa izin role
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-secondary-50">
    <div className="card text-center max-w-md">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-secondary-800 mb-2">
        Akses Ditolak
      </h1>
      <p className="text-secondary-600 mb-4">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <a
        href="/dashboard"
        className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Kembali ke Dashboard
      </a>
    </div>
  </div>
);

// ---------- Halaman 404 Not Found (inline) ----------
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-secondary-50">
    <div className="card text-center max-w-md">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-secondary-800 mb-2">
        404 — Halaman Tidak Ditemukan
      </h1>
      <p className="text-secondary-600 mb-4">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <a
        href="/dashboard"
        className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Kembali ke Dashboard
      </a>
    </div>
  </div>
);

// ============================================================
// MAIN APP COMPONENT
// ============================================================
function App() {
  return (
    // AuthProvider membungkus SELURUH app agar semua komponen
    // bisa mengakses auth state via useAuth() hook
    <AuthProvider>
      {/* BrowserRouter mengaktifkan client-side routing */}
      {/* URL berubah TANPA reload halaman (SPA behavior) */}
      <BrowserRouter>
        <Routes>
          {/* ====== PUBLIC ROUTES ====== */}
          {/* Halaman yang bisa diakses tanpa login */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ====== PROTECTED ROUTES ====== */}
          {/* Semua route di dalam ProtectedRoute memerlukan login */}
          {/* Jika belum login → redirect ke /login */}
          <Route element={<ProtectedRoute />}>
            {/* Dashboard — bisa diakses admin dan nasabah */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Tambahkan protected routes lain di sini nanti */}
            {/* Contoh route khusus admin: */}
            {/* <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin/users" element={<ManageUsers />} />
            </Route> */}
          </Route>

          {/* ====== REDIRECTS & FALLBACKS ====== */}
          {/* Root path (/) → redirect ke /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Semua URL yang tidak cocok → 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
