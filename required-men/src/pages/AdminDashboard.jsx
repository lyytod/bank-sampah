import { useState, useEffect } from 'react';
import { depositAPI, withdrawalAPI, trashCategoryAPI, locationAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('deposits'); // 'deposits', 'withdrawals', 'categories'
  
  // Data States
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Form State for Category & Location
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', price_per_kg: '' });
  const [locationForm, setLocationForm] = useState({ id: null, name: '', address: '', maps_link: '' });
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [selectedPhoto, setSelectedPhoto] = useState(null); // For modal

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      if (activeTab === 'deposits') {
        const res = await depositAPI.getAll();
        setDeposits(res.data.data);
      } else if (activeTab === 'withdrawals') {
        const res = await withdrawalAPI.getAll();
        setWithdrawals(res.data.data);
      } else if (activeTab === 'categories') {
        const res = await trashCategoryAPI.getAll(true); // ?all=true
        setCategories(res.data.data);
      } else if (activeTab === 'locations') {
        const res = await locationAPI.getAll(true); // ?all=true
        setLocations(res.data.data);
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Gagal mengambil data' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers for Deposits ---
  const handleDepositStatus = async (id, status) => {
    if (!window.confirm(`Apakah Anda yakin ingin menolak/menerima setoran ini sebagai ${status}?`)) return;
    
    try {
      await depositAPI.updateStatus(id, status);
      setFeedback({ type: 'success', message: `Setoran berhasil di-${status}` });
      fetchData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal mengubah status' });
    }
  };

  // --- Handlers for Withdrawals ---
  const handleWithdrawalStatus = async (id, status) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status penarikan menjadi ${status}?`)) return;
    
    try {
      await withdrawalAPI.updateStatus(id, status);
      setFeedback({ type: 'success', message: `Penarikan berhasil di-${status}` });
      fetchData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal mengubah status' });
    }
  };

  // --- Handlers for Categories ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.price_per_kg) return;

    try {
      if (categoryForm.id) {
        await trashCategoryAPI.update(categoryForm.id, {
          name: categoryForm.name,
          price_per_kg: parseFloat(categoryForm.price_per_kg)
        });
        setFeedback({ type: 'success', message: 'Kategori berhasil diupdate' });
      } else {
        await trashCategoryAPI.create({
          name: categoryForm.name,
          price_per_kg: parseFloat(categoryForm.price_per_kg)
        });
        setFeedback({ type: 'success', message: 'Kategori berhasil ditambahkan' });
      }
      setCategoryForm({ id: null, name: '', price_per_kg: '' });
      fetchData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal menyimpan kategori' });
    }
  };

  const handleEditCategory = (cat) => {
    setCategoryForm({ id: cat.id, name: cat.name, price_per_kg: cat.price_per_kg });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCategory = async (id, currentStatus) => {
    try {
      await trashCategoryAPI.toggleActive(id, !currentStatus);
      setFeedback({ type: 'success', message: 'Status kategori berhasil diubah' });
      fetchData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal mengubah status' });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini secara permanen? Jika sudah digunakan pada transaksi, proses ini akan gagal. Sebaiknya gunakan fitur Toggle Nonaktif.')) return;
    try {
      await trashCategoryAPI.delete(id);
      setFeedback({ type: 'success', message: 'Kategori berhasil dihapus' });
      fetchData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal menghapus kategori' });
    }
  };

  // --- Handlers for Locations ---
  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!locationForm.name || !locationForm.address) return;

    try {
      if (locationForm.id) {
        await locationAPI.update(locationForm.id, {
          name: locationForm.name,
          address: locationForm.address,
          maps_link: locationForm.maps_link
        });
        setFeedback({ type: 'success', message: 'Lokasi berhasil diupdate' });
      } else {
        await locationAPI.create({
          name: locationForm.name,
          address: locationForm.address,
          maps_link: locationForm.maps_link
        });
        setFeedback({ type: 'success', message: 'Lokasi berhasil ditambahkan' });
      }
      setLocationForm({ id: null, name: '', address: '', maps_link: '' });
      fetchData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal menyimpan lokasi' });
    }
  };

  const handleEditLocation = (loc) => {
    setLocationForm({ id: loc.id, name: loc.name, address: loc.address, maps_link: loc.maps_link });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLocation = async (id, currentStatus) => {
    try {
      await locationAPI.toggleActive(id, !currentStatus);
      setFeedback({ type: 'success', message: 'Status lokasi berhasil diubah' });
      fetchData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal mengubah status lokasi' });
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus lokasi ini secara permanen? Jika sudah ada nasabah yang setor di sini, proses akan gagal. Sebaiknya gunakan Toggle Nonaktif.')) return;
    try {
      await locationAPI.delete(id);
      setFeedback({ type: 'success', message: 'Lokasi berhasil dihapus' });
      fetchData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal menghapus lokasi' });
    }
  };

  // --- Renders ---
  const renderDeposits = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8">
      <h2 className="text-2xl font-bold text-secondary-800 mb-6">Validasi Setoran Sampah</h2>
      {deposits.length === 0 ? (
        <p className="text-secondary-500">Tidak ada data setoran.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary-50 text-secondary-600 font-medium">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Tanggal</th>
                <th className="py-3 px-4">Nasabah & Lokasi</th>
                <th className="py-3 px-4">Kategori & Berat</th>
                <th className="py-3 px-4">Est. Nilai</th>
                <th className="py-3 px-4">Bukti</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {deposits.map(dep => (
                <tr key={dep.id} className="hover:bg-secondary-50">
                  <td className="py-3 px-4 whitespace-nowrap">{new Date(dep.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-secondary-900">{dep.user_name}</div>
                    <div className="text-xs text-secondary-500">{dep.user_email}</div>
                    <div className="text-xs text-primary-600 mt-1">📍 {dep.location_name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{dep.category_name}</span>
                    <br/><span className="text-xs text-secondary-500">{dep.weight} kg</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-primary-600">Rp {parseFloat(dep.estimated_subtotal).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">
                    {dep.photo_url ? (
                      <button 
                        onClick={() => setSelectedPhoto(dep.photo_url)}
                        className="text-primary-600 hover:underline text-xs"
                      >Lihat Foto</button>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${dep.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${dep.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                      ${dep.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {dep.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {dep.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDepositStatus(dep.id, 'approved')} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Setujui">✅</button>
                        <button onClick={() => handleDepositStatus(dep.id, 'rejected')} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Tolak">❌</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderWithdrawals = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8">
      <h2 className="text-2xl font-bold text-secondary-800 mb-6">Validasi Penarikan Dana</h2>
      {withdrawals.length === 0 ? (
        <p className="text-secondary-500">Tidak ada data penarikan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary-50 text-secondary-600 font-medium">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Tanggal</th>
                <th className="py-3 px-4">Nasabah</th>
                <th className="py-3 px-4">Tujuan Transfer</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {withdrawals.map(wd => (
                <tr key={wd.id} className="hover:bg-secondary-50">
                  <td className="py-3 px-4 whitespace-nowrap">{new Date(wd.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-secondary-900">{wd.user_name}</div>
                    <div className="text-xs text-secondary-500">{wd.user_email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold">{wd.bank_name}</span>
                    <br/><span className="font-mono text-xs text-secondary-600">{wd.account_number}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-red-600">Rp {parseFloat(wd.amount).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${wd.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${wd.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                      ${wd.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {wd.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {wd.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleWithdrawalStatus(wd.id, 'approved')} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Setujui">✅</button>
                        <button onClick={() => handleWithdrawalStatus(wd.id, 'rejected')} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Tolak">❌</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8">
        <h2 className="text-2xl font-bold text-secondary-800 mb-6">
          {categoryForm.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        </h2>
        <form onSubmit={handleCategorySubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-secondary-700 mb-2">Nama Kategori</label>
            <input 
              type="text" 
              required
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
              className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Contoh: Plastik Bening"
            />
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-secondary-700 mb-2">Harga per Kg (Rp)</label>
            <input 
              type="number" 
              required
              value={categoryForm.price_per_kg}
              onChange={(e) => setCategoryForm({...categoryForm, price_per_kg: e.target.value})}
              className="w-full px-4 py-3 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Contoh: 3000"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button type="submit" className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700">
              {categoryForm.id ? 'Simpan Perubahan' : 'Tambah'}
            </button>
            {categoryForm.id && (
              <button type="button" onClick={() => setCategoryForm({ id: null, name: '', price_per_kg: '' })} className="px-6 py-3 bg-secondary-200 text-secondary-700 font-bold rounded-xl hover:bg-secondary-300">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8">
        <h2 className="text-2xl font-bold text-secondary-800 mb-6">Daftar Kategori Sampah</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary-50 text-secondary-600 font-medium">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Nama Kategori</th>
                <th className="py-3 px-4">Harga / Kg</th>
                <th className="py-3 px-4">Status Aktif</th>
                <th className="py-3 px-4 rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-secondary-50">
                  <td className="py-3 px-4 font-medium">{cat.name}</td>
                  <td className="py-3 px-4 font-medium text-primary-600">Rp {parseFloat(cat.price_per_kg).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleToggleCategory(cat.id, cat.is_active)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${cat.is_active ? 'bg-primary-600' : 'bg-secondary-300'}`}
                    >
                      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${cat.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="ml-2 text-xs text-secondary-500">{cat.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditCategory(cat)} className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200">Edit</button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLocations = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Tambah/Edit Lokasi */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8 sticky top-8">
          <h2 className="text-xl font-bold text-secondary-800 mb-6">
            {locationForm.id ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
          </h2>
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Nama Lokasi</label>
              <input
                type="text"
                required
                value={locationForm.name}
                onChange={(e) => setLocationForm({...locationForm, name: e.target.value})}
                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Cth: Bank Sampah Pusat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Alamat Lengkap</label>
              <textarea
                required
                rows="3"
                value={locationForm.address}
                onChange={(e) => setLocationForm({...locationForm, address: e.target.value})}
                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Cth: Jl. Sudirman No. 1"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Link Google Maps (Opsional)</label>
              <input
                type="url"
                value={locationForm.maps_link}
                onChange={(e) => setLocationForm({...locationForm, maps_link: e.target.value})}
                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Cth: https://goo.gl/maps/..."
              />
            </div>
            <div className="pt-2 flex gap-2">
              <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50">
                {locationForm.id ? 'Update' : 'Simpan'}
              </button>
              {locationForm.id && (
                <button type="button" onClick={() => setLocationForm({ id: null, name: '', address: '', maps_link: '' })} className="px-4 py-2.5 bg-secondary-200 text-secondary-700 font-semibold rounded-xl hover:bg-secondary-300">
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Tabel Daftar Lokasi */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8">
          <h2 className="text-xl font-bold text-secondary-800 mb-6">Daftar Lokasi Bank Sampah</h2>
          {locations.length === 0 ? (
            <p className="text-secondary-500">Belum ada data lokasi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary-50 text-secondary-600 font-medium">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Info Lokasi</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {locations.map(loc => (
                    <tr key={loc.id} className="hover:bg-secondary-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-secondary-900">{loc.name}</div>
                        <div className="text-xs text-secondary-500 mt-1 truncate max-w-xs">{loc.address}</div>
                        {loc.maps_link && (
                          <a href={loc.maps_link} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline mt-1 block">
                            Buka di Maps &nearr;
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => handleToggleLocation(loc.id, loc.is_active)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${loc.is_active ? 'bg-primary-600' : 'bg-secondary-300'}`}
                        >
                          <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${loc.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="ml-2 text-xs text-secondary-500">{loc.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditLocation(loc)} className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200">Edit</button>
                          <button onClick={() => handleDeleteLocation(loc.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard Admin</h1>
          <p className="text-secondary-500 mt-1">Kelola persetujuan transaksi dan data master sistem.</p>
        </div>

        {feedback.message && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {feedback.message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto mb-8 bg-white p-1 rounded-2xl shadow-sm border border-secondary-200 w-max">
          {[
            { id: 'deposits', label: 'Validasi Setoran' },
            { id: 'withdrawals', label: 'Validasi Penarikan' },
            { id: 'categories', label: 'Kategori Sampah' },
            { id: 'locations', label: 'Lokasi Bank Sampah' },
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {activeTab === 'deposits' && renderDeposits()}
            {activeTab === 'withdrawals' && renderWithdrawals()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'locations' && renderLocations()}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
            <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-secondary-900 hover:bg-secondary-200 z-10"
              >✕</button>
              <img src={`http://localhost:5000${selectedPhoto}`} alt="Bukti Setoran" className="max-h-[85vh] rounded-xl object-contain bg-secondary-900" />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
