  import { useState } from "react";
  import { Outlet } from "react-router-dom";
  import { Menu } from "lucide-react";

  import Navbar from "../common/Navbar";
  import Sidebar from "../common/Sidebar";

  const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] =
      useState(false);

    const [isSidebarCollapsed, setIsSidebarCollapsed] =
      useState(false);

    const closeSidebar = () => {
      setIsSidebarOpen(false);
    };

    const toggleSidebar = () => {
      setIsSidebarOpen((current) => !current);
    };

    const toggleCollapse = () => {
      setIsSidebarCollapsed((current) => !current);
    };

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Top Navbar */}
        <Navbar />

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Mobile Sidebar Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            isSidebarOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
          className="fixed bottom-5 left-5 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Content */}
        <main
          className={`min-h-screen pt-[72px] transition-[padding] duration-300 ${
            isSidebarCollapsed
              ? "lg:pl-[76px]"
              : "lg:pl-64"
          }`}
        >
          <Outlet />
        </main>
      </div>
    );
  };

  export default AppLayout;