const Footer = () => (
  <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-xs">H</span>
        </div>
        <span className="text-sm font-bold text-gray-900 tracking-tight">HireLoop</span>
      </div>
      <p className="text-xs font-medium text-gray-500">
        © {new Date().getFullYear()} HireLoop · Built for Campus Placements
      </p>
    </div>
  </footer>
);

export default Footer;