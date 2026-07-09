import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

/**
 * DashboardLayout — wraps all protected pages
 * Usage: wrap page content with this component
 */
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen((p) => !p)} />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;