// ============================================================
// src/main.jsx — Entry Point React Application
// ============================================================
// File ini adalah titik awal eksekusi React.
// Tugasnya:
// 1. Import CSS global (index.css dengan Tailwind)
// 2. Render komponen root (<App />) ke dalam DOM element #root
//
// StrictMode mengaktifkan pengecekan tambahan saat development:
// - Mendeteksi side effects yang tidak aman
// - Mendeteksi penggunaan API yang deprecated
// - Merender komponen 2x untuk menemukan bug (hanya di dev)
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
