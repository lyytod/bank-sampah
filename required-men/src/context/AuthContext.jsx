// ============================================================
// src/context/AuthContext.jsx — Global Auth State Management
// ============================================================
// React Context menyediakan "global state" yang bisa diakses
// oleh SEMUA komponen tanpa perlu prop drilling (passing props
// dari parent ke child secara beruntun).
//
// AuthContext menyimpan:
//   - user: data user yang sedang login (atau null)
//   - token: JWT token untuk API calls
//   - login(): fungsi untuk menyimpan data setelah login berhasil
//   - logout(): fungsi untuk membersihkan data dan redirect ke login
//
// Data disimpan di localStorage agar tetap ada setelah refresh browser.
// ============================================================

import { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Buat Context object
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // ---------- Login & Auto-Routing ----------
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);

    // Auto-Routing berdasarkan Role
    if (userData.role === 'super_admin') {
      navigate('/superadmin', { replace: true });
    } else if (userData.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/user', { replace: true });
    }
  };

  // ---------- Logout ----------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  // ---------- Value yang di-share ke seluruh app ----------
  const value = {
    user,       // Data user: { id, name, email, role, balance }
    token,      // JWT token string
    login,      // Fungsi login(userData, token)
    logout,     // Fungsi logout()
    isAuthenticated: !!token, // true jika token ada (shorthand boolean conversion)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
