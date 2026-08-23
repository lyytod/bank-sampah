// ============================================================
// src/components/ProtectedRoute.jsx — Route Guard Component
// ============================================================
// Komponen ini melindungi halaman yang MEMBUTUHKAN login.
// Jika user belum login → redirect ke /login
// Jika user login tapi role tidak sesuai → redirect ke /unauthorized
//
// Digunakan di App.jsx sebagai wrapper route:
//   <Route element={<ProtectedRoute />}>        → semua role
//   <Route element={<ProtectedRoute roles={['admin']} />}> → admin only
//
// KONSEP:
// React Router v7 menggunakan <Outlet /> untuk merender child routes.
// ProtectedRoute bertindak sebagai "pintu gerbang":
//   User login? → Render <Outlet /> (child route ditampilkan)
//   User belum login? → <Navigate to="/login" /> (redirect)
// ============================================================

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // ---------- Cek 1: Apakah user sudah login? ----------
  if (!isAuthenticated) {
    // Redirect ke /login dan simpan halaman yang dituju di state.
    // Setelah login berhasil, user bisa diredirect kembali ke halaman asli.
    //
    // replace: true → mengganti history entry (tombol Back tidak kembali ke sini)
    // state.from → menyimpan lokasi asal untuk redirect setelah login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ---------- Cek 2: Apakah role user sesuai? ----------
  // Jika prop `roles` diberikan, periksa apakah role user termasuk dalam daftar
  if (roles && !roles.includes(user?.role)) {
    // User login tapi tidak punya akses ke halaman ini
    return <Navigate to="/unauthorized" replace />;
  }

  // ---------- Semua cek lolos → Render child route ----------
  // <Outlet /> adalah placeholder untuk child route yang cocok
  return <Outlet />;
};

export default ProtectedRoute;
