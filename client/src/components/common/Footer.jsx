const Footer = () => (
    <footer className="border-t border-gray-100 bg-white py-4 mt-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">HireLoop</span>
        </div>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} HireLoop · Built for CHARUSAT Campus Placements
        </p>
      </div>
    </footer>
  );
  
  export default Footer;