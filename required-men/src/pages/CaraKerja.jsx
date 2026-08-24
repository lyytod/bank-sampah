import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const CaraKerja = () => {
  const steps = [
    {
      id: 1,
      title: "Daftar Akun",
      description: "Buat akun dengan cepat menggunakan email atau akun Google Anda. Gratis dan tanpa syarat rumit.",
      icon: "👤",
      color: "bg-blue-100 text-blue-600",
      shadow: "hover:shadow-blue-500/20",
    },
    {
      id: 2,
      title: "Pilah & Laporkan",
      description: "Pisahkan sampah berdasarkan kategori. Foto dan laporkan estimasi beratnya melalui dashboard.",
      icon: "📦",
      color: "bg-emerald-100 text-emerald-600",
      shadow: "hover:shadow-emerald-500/20",
    },
    {
      id: 3,
      title: "Setor & Validasi",
      description: "Bawa sampah ke titik kumpul terdekat. Admin akan menimbang ulang dan memvalidasi setoran.",
      icon: "⚖️",
      color: "bg-purple-100 text-purple-600",
      shadow: "hover:shadow-purple-500/20",
    },
    {
      id: 4,
      title: "Tarik Saldo",
      description: "Setelah divalidasi, saldo otomatis masuk. Tarik saldo kapan saja ke rekening bank atau E-Wallet.",
      icon: "💳",
      color: "bg-primary-100 text-primary-600",
      shadow: "hover:shadow-primary-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 font-sans flex flex-col selection:bg-primary-500 selection:text-white">
      {/* NAVBAR */}
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
            <div className="w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-6 border border-primary-100 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
              Panduan Praktis
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-secondary-900 tracking-tight mb-6 leading-tight">
              Bagaimana Cara <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">Kerjanya?</span>
            </h1>
            
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed">
              Hanya dengan 4 langkah mudah, Anda sudah bisa berkontribusi menjaga kelestarian lingkungan dan mendapatkan nilai ekonomis dari sampah Anda.
            </p>
          </div>
        </section>

        {/* TIMELINE / GRID SECTION */}
        <section className="pb-24 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Optional: Line connecting the steps (visible on large screens) */}
              <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-secondary-200 z-0"></div>

              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className={`relative z-10 p-8 rounded-3xl bg-white border border-secondary-200 shadow-sm transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl ${step.shadow} group`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl transition-transform group-hover:scale-110 ${step.color} mx-auto lg:mx-0`}>
                    {step.icon}
                  </div>
                  
                  <div className="text-center lg:text-left">
                    <div className="text-sm font-bold text-primary-600 mb-2 uppercase tracking-wider">Langkah {step.id}</div>
                    <h3 className="text-2xl font-bold text-secondary-900 mb-3">{step.title}</h3>
                    <p className="text-secondary-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CALL TO ACTION */}
            <div className="mt-20 text-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/30 transform hover:scale-105 transition-all"
              >
                Mulai Sekarang
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default CaraKerja;
