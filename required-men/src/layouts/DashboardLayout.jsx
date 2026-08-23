// ============================================================
// src/layouts/DashboardLayout.jsx — Layout Wrapper (Sidebar + Navbar)
// ============================================================
// Layout ini membungkus semua halaman setelah login.
// Menyediakan:
// 1. Sidebar navigasi (collapsible di mobile)
// 2. Top navbar dengan user info dan logout
// 3. <Outlet /> untuk merender child route content
//
// PATTERN: Layout Route
// Di App.jsx: <Route element={<DashboardLayout />}>
//               <Route path="/dashboard" element={<Dashboard />} />
//             </Route>
// DashboardLayout merender Sidebar + Navbar, lalu <Outlet/> = Dashboard
// ============================================================

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // ---------- Menu Items berdasarkan Role ----------
  const menuItems = [
    {
      label: 'Dashboard Nasabah',
      path: '/user',
      icon: '👤',
      roles: ['user'],
    },
    {
      label: 'Dashboard Admin',
      path: '/admin',
      icon: '📊',
      roles: ['admin', 'super_admin'],
    },
    {
      label: 'Super Admin',
      path: '/superadmin',
      icon: '⚙️',
      roles: ['super_admin'],
    },
  ].filter((item) => item.roles.includes(user?.role));
  // .filter() hanya menampilkan menu sesuai role user yang login

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* ====== SIDEBAR ====== */}
      {/* Mobile overlay (backdrop gelap saat sidebar terbuka) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-secondary-200">
          <span className="text-2xl">♻️</span>
          <h1 className="text-lg font-bold text-gradient">Bank Sampah</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-800'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer — User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
          <div className="flex items-center gap-3 px-2">
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-secondary-800 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ====== MAIN AREA ====== */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* ====== TOP NAVBAR ====== */}
        <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Hamburger button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title area (kosong, bisa diisi nanti) */}
          <div className="hidden lg:block" />

          {/* Right side: user actions */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-2 text-sm text-secondary-600">
              Halo, <span className="font-semibold">{user?.name}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                user?.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-primary-100 text-primary-700'
              }`}>
                {user?.role}
              </span>
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* ====== PAGE CONTENT ====== */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
