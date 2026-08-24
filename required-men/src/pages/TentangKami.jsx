import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { publicAPI } from '../services/api';
import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from 'react-icons/fa';

const TentangKami = () => {
  // States
  const [stats, setStats] = useState({ total_users: 0, total_trash: 0 });
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total_pages: 1 });
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [mapLinkState, setMapLinkState] = useState('');

  // Fetch Stats & Locations
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await publicAPI.getStats();
        setStats(statsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    const fetchLocations = async () => {
      try {
        const locRes = await publicAPI.getLocations();
        const locationsData = locRes.data.data;
        // Gunakan lokasi pertama yang aktif jika tersedia
        if (locationsData && locationsData.length > 0 && locationsData[0].maps_link) {
          setMapLinkState(locationsData[0].maps_link);
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };

    fetchStats();
    fetchLocations();
  }, []);

  // Fetch Categories
  useEffect(() => {
    fetchCategories(pagination.page);
  }, [pagination.page]);

  const fetchCategories = async (page) => {
    setIsLoadingCats(true);
    try {
      const res = await publicAPI.getCategories(page, pagination.limit);
      setCategories(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoadingCats(false);
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination({ ...pagination, page: pagination.page - 1 });
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.total_pages) {
      setPagination({ ...pagination, page: pagination.page + 1 });
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 font-sans flex flex-col selection:bg-primary-500 selection:text-white">
      {/* NAVBAR */}
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION (Visi/Misi) */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-white">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
            <div className="w-[30rem] h-[30rem] bg-emerald-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-secondary-900 tracking-tight mb-6 leading-tight">
              Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">Bank Sampah Digital</span>
            </h1>
            <p className="text-xl text-secondary-600 leading-relaxed mb-8">
              Misi kami adalah menciptakan ekosistem pengelolaan sampah yang modern, transparan, dan menguntungkan. Melalui Bank Sampah Digital, kami mengedukasi masyarakat untuk memilah sampah sekaligus mendapatkan nilai ekonomis, demi mewujudkan lingkungan hijau dan masa depan yang berkelanjutan.
            </p>
          </div>
        </section>

        {/* STATISTIK SECTION */}
        <section className="py-16 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 text-center text-white">
              <div className="p-8 bg-primary-700/50 rounded-3xl border border-primary-500/30">
                <div className="text-5xl font-extrabold mb-2">{stats.total_users.toLocaleString('id-ID')}</div>
                <div className="text-primary-100 text-lg font-medium">Pahlawan Lingkungan (Nasabah)</div>
              </div>
              <div className="p-8 bg-emerald-700/50 rounded-3xl border border-emerald-500/30">
                <div className="text-5xl font-extrabold mb-2">{parseFloat(stats.total_trash).toLocaleString('id-ID')} Kg</div>
                <div className="text-emerald-100 text-lg font-medium">Sampah Berhasil Didaur Ulang</div>
              </div>
            </div>
          </div>
        </section>

        {/* TABEL HARGA SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">Daftar Harga Sampah</h2>
              <p className="text-secondary-600">
                Harga dapat berubah sewaktu-waktu sesuai dengan kebijakan pusat. Berikut adalah estimasi harga beli kami saat ini:
              </p>
            </div>

            <div className="bg-secondary-50 rounded-3xl border border-secondary-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary-100 text-secondary-600 font-medium">
                    <tr>
                      <th className="py-4 px-6">No.</th>
                      <th className="py-4 px-6">Jenis Kategori Sampah</th>
                      <th className="py-4 px-6 text-right">Harga per Kg (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 bg-white">
                    {isLoadingCats ? (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-secondary-500">Memuat data...</td>
                      </tr>
                    ) : categories.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-secondary-500">Data kategori belum tersedia.</td>
                      </tr>
                    ) : (
                      categories.map((cat, index) => (
                        <tr key={cat.id} className="hover:bg-secondary-50 transition-colors">
                          <td className="py-4 px-6 text-secondary-500">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                          <td className="py-4 px-6 font-medium text-secondary-900">{cat.name}</td>
                          <td className="py-4 px-6 text-right text-primary-600 font-bold">
                            {parseFloat(cat.price_per_kg).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-secondary-200">
                <div className="text-sm text-secondary-500">
                  Halaman <span className="font-semibold text-secondary-900">{pagination.page}</span> dari <span className="font-semibold text-secondary-900">{pagination.total_pages}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={pagination.page <= 1}
                    className="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-600 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button 
                    onClick={handleNextPage} 
                    disabled={pagination.page >= pagination.total_pages}
                    className="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-600 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PETA LOKASI & SOSMED SECTION */}
        <section className="py-20 bg-secondary-50 border-t border-secondary-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-secondary-900 mb-8">Temukan Kami</h2>
            
            {/* Map Frame */}
            <div className="w-full mb-8 rounded-3xl overflow-hidden border border-secondary-300 shadow-lg">
              <iframe 
                src={mapLinkState || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126510.63599292813!2d111.44973305364808!3d-7.618641499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79bf8c117e30dd%3A0x3027a76e352bbf0!2sKabupaten%20Madiun%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"} 
                width="100%" 
                height="400" 
                className="w-full border-0" 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Peta Lokasi Bank Sampah"
              ></iframe>
            </div>

            {/* Social Media Links */}
            <div className="flex justify-center gap-6">
              <a href="#" aria-label="Facebook" className="w-14 h-14 rounded-full bg-white border border-secondary-200 flex items-center justify-center text-secondary-500 hover:text-blue-600 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all text-2xl">
                <FaFacebook />
              </a>
              <a href="#" aria-label="Instagram" className="w-14 h-14 rounded-full bg-white border border-secondary-200 flex items-center justify-center text-secondary-500 hover:text-pink-600 hover:border-pink-300 hover:shadow-lg hover:-translate-y-1 transition-all text-2xl">
                <FaInstagram />
              </a>
              <a href="#" aria-label="WhatsApp" className="w-14 h-14 rounded-full bg-white border border-secondary-200 flex items-center justify-center text-secondary-500 hover:text-emerald-500 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all text-2xl">
                <FaWhatsapp />
              </a>
              <a href="#" aria-label="TikTok" className="w-14 h-14 rounded-full bg-white border border-secondary-200 flex items-center justify-center text-secondary-500 hover:text-black hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all text-2xl">
                <FaTiktok />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default TentangKami;
