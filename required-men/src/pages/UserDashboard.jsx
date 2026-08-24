import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { depositAPI, withdrawalAPI, trashCategoryAPI, locationAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const UserDashboard = () => {
  const { user } = useAuth();
  
  // State for Tabs
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'deposit', 'withdraw', 'history'

  // State for Data
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form State
  const [depositForm, setDepositForm] = useState({ category_id: '', location_id: '', weight: '', photo: null });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bank_name: '', account_number: '' });

  // Initial Data Fetch
  useEffect(() => {
    fetchCategories();
    fetchHistory();
  }, []);

  const fetchCategories = async () => {
    try {
      const [catRes, locRes] = await Promise.all([
        trashCategoryAPI.getAll(),
        locationAPI.getAll() // Mengambil lokasi aktif saja
      ]);
      setCategories(catRes.data.data);
      setLocations(locRes.data.data);
    } catch (error) {
      console.error("Gagal mengambil data referensi", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const [depRes, withRes] = await Promise.all([
        depositAPI.getMyDeposits(),
        withdrawalAPI.getMyWithdrawals()
      ]);
      setDeposits(depRes.data.data);
      setWithdrawals(withRes.data.data);
    } catch (error) {
      console.error("Gagal mengambil riwayat transaksi", error);
    }
  };

  // Handlers
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositForm.category_id || !depositForm.location_id || !depositForm.weight) {
      setFeedback({ type: 'error', message: 'Kategori, lokasi, dan berat wajib diisi' });
      return;
    }

    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    const formData = new FormData();
    formData.append('category_id', depositForm.category_id);
    formData.append('location_id', depositForm.location_id);
    formData.append('weight', depositForm.weight);
    if (depositForm.photo) {
      formData.append('photo', depositForm.photo);
    }

    try {
      await depositAPI.create(formData);
      setFeedback({ type: 'success', message: 'Setoran berhasil disubmit dan menunggu validasi admin.' });
      setDepositForm({ category_id: '', location_id: '', weight: '', photo: null });
      fetchHistory(); // Refresh history
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Terjadi kesalahan saat menyubmit setoran.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawForm.amount || !withdrawForm.bank_name || !withdrawForm.account_number) {
      setFeedback({ type: 'error', message: 'Semua field penarikan wajib diisi' });
      return;
    }

    setIsLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      await withdrawalAPI.create(withdrawForm);
      setFeedback({ type: 'success', message: 'Permintaan penarikan berhasil dikirim.' });
      setWithdrawForm({ amount: '', bank_name: '', account_number: '' });
      fetchHistory(); // Refresh history
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Terjadi kesalahan saat meminta penarikan.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderers
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-10 translate-x-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <h2 className="text-xl font-medium mb-2 text-primary-100">Total Saldo Anda</h2>
        <div className="text-5xl font-bold mb-6">Rp {parseFloat(user?.balance || 0).toLocaleString('id-ID')}</div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('deposit')} className="px-6 py-2 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors">
            Setor Sampah
          </button>
          <button onClick={() => setActiveTab('withdraw')} className="px-6 py-2 bg-primary-700/50 border border-primary-400 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
            Tarik Dana
          </button>
        </div>
      </div>
    </div>
  );

  const renderDepositForm = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-secondary-800 mb-6">Setor Sampah</h2>
      {feedback.message && activeTab === 'deposit' && (
        <div className={`mb-6 p-4 rounded-xl text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {feedback.message}
        </div>
      )}
      <form onSubmit={handleDepositSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Kategori Sampah</label>
          <select 
            value={depositForm.category_id}
            onChange={(e) => setDepositForm({...depositForm, category_id: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">Pilih Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name} - Rp {cat.price_per_kg.toLocaleString('id-ID')}/kg</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Lokasi Bank Sampah</label>
          <select 
            value={depositForm.location_id}
            onChange={(e) => setDepositForm({...depositForm, location_id: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">Pilih Lokasi</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Berat (Kg)</label>
          <input 
            type="number"
            step="0.1"
            min="0.1"
            value={depositForm.weight}
            onChange={(e) => setDepositForm({...depositForm, weight: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="Contoh: 2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Foto Bukti (Opsional)</label>
          <input 
            type="file"
            accept="image/*"
            onChange={(e) => setDepositForm({...depositForm, photo: e.target.files[0]})}
            className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50">
          {isLoading ? 'Memproses...' : 'Kirim Setoran'}
        </button>
      </form>
    </div>
  );

  const renderWithdrawForm = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-secondary-800 mb-6">Tarik Dana</h2>
      {feedback.message && activeTab === 'withdraw' && (
        <div className={`mb-6 p-4 rounded-xl text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {feedback.message}
        </div>
      )}
      <form onSubmit={handleWithdrawSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Nominal Penarikan</label>
          <input 
            type="number"
            min="50000"
            value={withdrawForm.amount}
            onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="Minimal Rp 50.000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Pilih Bank / E-Wallet</label>
          <select 
            value={withdrawForm.bank_name}
            onChange={(e) => setWithdrawForm({...withdrawForm, bank_name: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">Pilih Tujuan</option>
            <option value="BCA">BCA</option>
            <option value="Mandiri">Mandiri</option>
            <option value="BNI">BNI</option>
            <option value="BRI">BRI</option>
            <option value="GOPAY">GoPay</option>
            <option value="DANA">DANA</option>
            <option value="OVO">OVO</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Nomor Rekening / HP</label>
          <input 
            type="text"
            value={withdrawForm.account_number}
            onChange={(e) => setWithdrawForm({...withdrawForm, account_number: e.target.value})}
            className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="Masukkan nomor tujuan"
          />
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50">
          {isLoading ? 'Memproses...' : 'Request Penarikan'}
        </button>
      </form>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8">
      <h2 className="text-2xl font-bold text-secondary-800 mb-6">Riwayat Transaksi</h2>
      
      <h3 className="text-lg font-semibold text-secondary-700 mb-4 mt-8">Setoran Sampah</h3>
      {deposits.length === 0 ? (
        <p className="text-secondary-500">Belum ada riwayat setoran.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary-50 text-secondary-600 font-medium">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Tanggal</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Berat</th>
                <th className="py-3 px-4">Estimasi Harga</th>
                <th className="py-3 px-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {deposits.map(dep => (
                <tr key={dep.id} className="hover:bg-secondary-50">
                  <td className="py-3 px-4">{new Date(dep.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-4 text-xs text-secondary-500">📍 {dep.location_name}</td>
                  <td className="py-3 px-4 font-medium">{dep.category_name}</td>
                  <td className="py-3 px-4">{dep.weight} kg</td>
                  <td className="py-3 px-4 text-primary-600 font-medium">Rp {parseFloat(dep.estimated_subtotal).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${dep.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${dep.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                      ${dep.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {dep.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="text-lg font-semibold text-secondary-700 mb-4 mt-12">Penarikan Dana</h3>
      {withdrawals.length === 0 ? (
        <p className="text-secondary-500">Belum ada riwayat penarikan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary-50 text-secondary-600 font-medium">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Tanggal</th>
                <th className="py-3 px-4">Tujuan</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {withdrawals.map(wd => (
                <tr key={wd.id} className="hover:bg-secondary-50">
                  <td className="py-3 px-4">{new Date(wd.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-4 font-medium">{wd.bank_name} - {wd.account_number}</td>
                  <td className="py-3 px-4 text-red-600 font-medium">Rp {parseFloat(wd.amount).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${wd.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${wd.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                      ${wd.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {wd.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard Nasabah</h1>
          <p className="text-secondary-500 mt-1">Kelola setoran dan saldo tabungan Anda.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto mb-8 bg-white p-1 rounded-2xl shadow-sm border border-secondary-200 w-max">
          {[
            { id: 'overview', label: 'Ringkasan' },
            { id: 'deposit', label: 'Setor Sampah' },
            { id: 'withdraw', label: 'Tarik Dana' },
            { id: 'history', label: 'Riwayat' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setFeedback({ type: '', message: '' }); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'deposit' && renderDepositForm()}
          {activeTab === 'withdraw' && renderWithdrawForm()}
          {activeTab === 'history' && renderHistory()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
