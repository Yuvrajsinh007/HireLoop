import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from "../../utils/constants";
// Premium Professional Icons
import { 
  LayoutDashboard, Map, Building2, BookOpen, 
  Handshake, Calendar, Bookmark, User, 
  TrendingUp, Building, FileBarChart, 
  Shield, Users, ClipboardCheck, AlertTriangle 
} from "lucide-react";

const NAV_ITEMS = {
  // Common to all logged-in users
  common: [
    { path: "/dashboard",          label: "Dashboard",        icon: LayoutDashboard },
    { path: "/journey",            label: "My Journey",       icon: Map },
    { path: "/companies",          label: "Companies",        icon: Building2 },
    { path: "/experiences",        label: "Experiences",      icon: BookOpen },
    { path: "/mentors",            label: "Mentors",          icon: Handshake },
    { path: "/my-bookings",        label: "My Bookings",      icon: Calendar },
    { path: "/saved-experiences",  label: "Saved",            icon: Bookmark },
    { path: "/profile",            label: "My Profile",       icon: User },
  ],

  // Officer only
  officer: [
    { path: "/officer/dashboard",  label: "Officer Dashboard", icon: TrendingUp },
    { path: "/officer/companies",  label: "Manage Companies",  icon: Building },
    { path: "/officer/reports",    label: "Reports",           icon: FileBarChart },
  ],

  // Admin only
  admin: [
    { path: "/admin/dashboard",    label: "Admin Dashboard",   icon: Shield },
    { path: "/admin/users",        label: "Manage Users",      icon: Users },
    { path: "/admin/verify",       label: "Verify Data",       icon: ClipboardCheck },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role;
  const isOfficerOrAdmin = [ROLES.OFFICER, ROLES.ADMIN].includes(role);
  const isAdmin = role === ROLES.ADMIN;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-sm
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="py-6 px-4">
          {/* Main Navigation */}
          <div className="mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
              Main Menu
            </p>
            <nav className="space-y-1">
              {NAV_ITEMS.common.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 stroke-[1.5]" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Officer Section */}
          {isOfficerOrAdmin && (
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
                Placement Office
              </p>
              <nav className="space-y-1">
                {NAV_ITEMS.officer.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 stroke-[1.5]" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
                Administration
              </p>
              <nav className="space-y-1">
                {NAV_ITEMS.admin.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 stroke-[1.5]" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}

          {/* Bottom: Email verification warning */}
          {user && !user.isEmailVerified && (
            <div className="mx-2 mt-auto p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-semibold">Email not verified</p>
                <p className="text-xs text-yellow-600 mt-1 leading-relaxed">
                  Check your inbox to verify your account and unlock all features.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;