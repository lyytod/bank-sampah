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

import { createContext, useState, useContext, useEffect } from 'react';

// 1. Buat Context object
// Context ini akan menjadi "wadah" untuk data auth global
const AuthContext = createContext(null);

// 2. Custom hook untuk mengakses AuthContext
// Komponen cukup panggil: const { user, token, login, logout } = useAuth();
// Lebih clean daripada: const context = useContext(AuthContext);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};

// 3. Provider component — membungkus seluruh app
// Semua komponen di dalam <AuthProvider> bisa mengakses auth state
export const AuthProvider = ({ children }) => {
  // ---------- State ----------
  // Inisialisasi state dari localStorage (jika ada)
  // Ini memungkinkan user tetap login setelah refresh browser
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // ---------- Login ----------
  // Dipanggil setelah API login berhasil
  // Menyimpan data ke state DAN localStorage
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  // ---------- Logout ----------
  // Membersihkan semua data auth
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
