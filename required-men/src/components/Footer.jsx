const Footer = () => {
  return (
    <footer className="bg-white border-t border-secondary-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">♻️</span>
          <span className="text-lg font-bold text-secondary-900">Bank Sampah Digital</span>
        </div>
        <p className="text-secondary-500 text-sm">
          &copy; {new Date().getFullYear()} Bank Sampah Digital. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
