import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar onMenuClick={() => setSidebarOpen((p) => !p)} />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 lg:ml-64 pt-16 min-h-screen overflow-x-hidden">
        <div className="p-6 md:p-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;