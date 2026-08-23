// ============================================================
// src/pages/Dashboard.jsx — Halaman Dashboard Lengkap
// ============================================================
// Dashboard menampilkan data berbeda berdasarkan role:
//
// ADMIN:
//   - Total nasabah, total transaksi, total berat, total uang
//   - Daftar semua transaksi terbaru
//   - Quick action: buat transaksi baru
//
// NASABAH:
//   - Saldo tabungan
//   - Total transaksi sendiri, total berat pribadi
//   - Riwayat transaksi sendiri
//
// Data diambil dari API saat komponen pertama kali di-render (useEffect).
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { authAPI, transactionAPI, trashCategoryAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();

  // ---------- State ----------
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalWeight: 0,
    totalAmount: 0,
    totalCategories: 0,
    balance: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ---------- Fetch Data ----------
  // useEffect berjalan SEKALI setelah komponen di-render pertama kali.
  // Dependency array [] memastikan tidak ada re-fetch yang tidak perlu.
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch transaksi dan profil secara paralel (Promise.all)
        // Lebih cepat daripada fetch satu-per-satu (sequential)
        const [transRes, profileRes, categoryRes] = await Promise.all([
          transactionAPI.getAll(),
          authAPI.getProfile(),
          trashCategoryAPI.getAll().catch(() => ({ data: { data: [] } })),
          // catch() pada categories agar tidak gagal total jika endpoint error
        ]);

        const transData = transRes.data.data || [];
        const profileData = profileRes.data.data;
        const categoryData = categoryRes.data.data || [];

        // Hitung statistik dari data transaksi
        const totalWeight = transData.reduce(
          (sum, t) => sum + parseFloat(t.total_weight || 0),
          0
        );
        const totalAmount = transData.reduce(
          (sum, t) => sum + parseFloat(t.total_amount || 0),
          0
        );

        setStats({
          totalTransactions: transData.length,
          totalWeight: totalWeight.toFixed(1),
          totalAmount: totalAmount,
          totalCategories: categoryData.length,
          balance: parseFloat(profileData.balance || 0),
        });

        setTransactions(transData);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Gagal memuat data dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ---------- Helper: Format Currency ----------
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // ---------- Helper: Format Date ----------
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ---------- Stats Cards Configuration ----------
  // Konfigurasi card berbeda untuk admin dan nasabah
  const getStatsCards = () => {
    if (user?.role === 'admin') {
      return [
        {
          label: 'Total Transaksi',
          value: stats.totalTransactions,
          icon: '📋',
          color: 'bg-blue-50 text-blue-600',
          borderColor: 'border-blue-200',
        },
        {
          label: 'Total Berat (kg)',
          value: `${stats.totalWeight} kg`,
          icon: '⚖️',
          color: 'bg-emerald-50 text-emerald-600',
          borderColor: 'border-emerald-200',
        },
        {
          label: 'Total Nilai',
          value: formatRupiah(stats.totalAmount),
          icon: '💰',
          color: 'bg-amber-50 text-amber-600',
          borderColor: 'border-amber-200',
        },
        {
          label: 'Kategori Sampah',
          value: stats.totalCategories,
          icon: '🗂️',
          color: 'bg-purple-50 text-purple-600',
          borderColor: 'border-purple-200',
        },
      ];
    }

    // Nasabah cards
    return [
      {
        label: 'Saldo Tabungan',
        value: formatRupiah(stats.balance),
        icon: '💳',
        color: 'bg-primary-50 text-primary-600',
        borderColor: 'border-primary-200',
        highlight: true,
      },
      {
        label: 'Total Setoran',
        value: stats.totalTransactions,
        icon: '📋',
        color: 'bg-blue-50 text-blue-600',
        borderColor: 'border-blue-200',
      },
      {
        label: 'Total Berat',
        value: `${stats.totalWeight} kg`,
        icon: '⚖️',
        color: 'bg-emerald-50 text-emerald-600',
        borderColor: 'border-emerald-200',
      },
      {
        label: 'Total Penghasilan',
        value: formatRupiah(stats.totalAmount),
        icon: '💰',
        color: 'bg-amber-50 text-amber-600',
        borderColor: 'border-amber-200',
      },
    ];
  };

  // ---------- Render ----------
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-800">
          Dashboard
        </h1>
        <p className="text-secondary-500 mt-1">
          {user?.role === 'admin'
            ? 'Ringkasan aktivitas Bank Sampah'
            : 'Ringkasan tabungan dan setoran Anda'}
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-secondary-500">Memuat data...</p>
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <span className="text-4xl block mb-3">⚠️</span>
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          {/* ====== STATS CARDS ====== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {getStatsCards().map((card, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                  card.borderColor
                } ${card.highlight ? 'ring-2 ring-primary-200' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg ${card.color}`}
                  >
                    {card.icon}
                  </span>
                </div>
                <p className="text-2xl font-bold text-secondary-800">
                  {card.value}
                </p>
                <p className="text-sm text-secondary-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* ====== RECENT TRANSACTIONS TABLE ====== */}
          <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-secondary-800">
                  {user?.role === 'admin' ? 'Transaksi Terbaru' : 'Riwayat Setoran'}
                </h2>
                <p className="text-sm text-secondary-500">
                  {transactions.length} transaksi ditemukan
                </p>
              </div>
            </div>

            {/* Table Content */}
            {transactions.length === 0 ? (
              <div className="py-16 text-center">
                <span className="text-5xl block mb-4">📭</span>
                <p className="text-secondary-500 font-medium">
                  Belum ada transaksi
                </p>
                <p className="text-sm text-secondary-400 mt-1">
                  {user?.role === 'admin'
                    ? 'Buat transaksi baru untuk memulai'
                    : 'Setoran sampah Anda akan muncul di sini'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary-50">
                      <th className="text-left px-6 py-3 font-medium text-secondary-600">
                        ID
                      </th>
                      {user?.role === 'admin' && (
                        <th className="text-left px-6 py-3 font-medium text-secondary-600">
                          Nasabah
                        </th>
                      )}
                      <th className="text-left px-6 py-3 font-medium text-secondary-600">
                        Berat (kg)
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-secondary-600">
                        Nilai
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-secondary-600">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 font-medium text-secondary-600">
                        Tanggal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100">
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-secondary-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-secondary-600">
                          #{transaction.id}
                        </td>
                        {user?.role === 'admin' && (
                          <td className="px-6 py-4 font-medium text-secondary-800">
                            {transaction.nasabah_name || '-'}
                          </td>
                        )}
                        <td className="px-6 py-4 text-secondary-700">
                          {parseFloat(transaction.total_weight).toFixed(1)} kg
                        </td>
                        <td className="px-6 py-4 font-semibold text-secondary-800">
                          {formatRupiah(transaction.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={
                              transaction.status === 'completed'
                                ? 'badge-completed'
                                : 'badge-pending'
                            }
                          >
                            {transaction.status === 'completed'
                              ? '✅ Selesai'
                              : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-secondary-500">
                          {formatDate(transaction.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
