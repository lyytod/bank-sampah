import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const SuperAdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.data);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Gagal mengambil data pengguna' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm(`Yakin ingin mengubah role menjadi ${newRole}?`)) return;
    
    try {
      await userAPI.updateRole(id, newRole);
      setFeedback({ type: 'success', message: 'Role berhasil diperbarui' });
      fetchUsers();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal mengubah role' });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const action = newStatus === 'active' ? 'mengaktifkan kembali' : 'menangguhkan (suspend)';
    if (!window.confirm(`Yakin ingin ${action} akun ini?`)) return;
    
    try {
      await userAPI.updateStatus(id, newStatus);
      setFeedback({ type: 'success', message: `Akun berhasil di-${newStatus === 'active' ? 'aktifkan' : 'suspend'}` });
      fetchUsers();
    } catch (error) {
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Gagal mengubah status' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">Super Admin Dashboard</h1>
          <p className="text-secondary-500 mt-1">Manajemen Hak Akses dan Status Akun Pengguna.</p>
        </div>

        {feedback.message && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {feedback.message}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-secondary-200 p-8">
          <h2 className="text-2xl font-bold text-secondary-800 mb-6">Daftar Pengguna</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <p className="text-secondary-500">Tidak ada data pengguna.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary-50 text-secondary-600 font-medium">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Nama / Email</th>
                    <th className="py-3 px-4">Tanggal Daftar</th>
                    <th className="py-3 px-4">Saldo</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 rounded-r-xl">Status & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-secondary-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-secondary-900 flex items-center gap-2">
                          {u.name} 
                          {u.id === currentUser.id && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Anda</span>}
                        </div>
                        <div className="text-xs text-secondary-500">{u.email}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4 font-medium text-primary-600">Rp {parseFloat(u.balance).toLocaleString('id-ID')}</td>
                      
                      <td className="py-3 px-4">
                        <select 
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === currentUser.id}
                          className="px-2 py-1 bg-secondary-50 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                            ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                          `}>
                            {u.status.toUpperCase()}
                          </span>
                          
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => handleStatusChange(u.id, u.status === 'active' ? 'suspended' : 'active')}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                                u.status === 'active' 
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                                  : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                              }`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Unsuspend'}
                            </button>
                          )}
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
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
