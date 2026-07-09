import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

const NAV_ITEMS = {
  // Common to all logged-in users
  common: [
    { path: "/dashboard",          label: "Dashboard",         icon: "📊" },
    { path: "/journey",            label: "My Journey",        icon: "📋" },
    { path: "/companies",          label: "Companies",         icon: "🏢" },
    { path: "/experiences",        label: "Experiences",       icon: "📝" },
    { path: "/mentors",            label: "Mentors",           icon: "🤝" },
    { path: "/my-bookings",        label: "My Bookings",       icon: "📅" },
    { path: "/saved-experiences",  label: "Saved",             icon: "🔖" },
    { path: "/profile",            label: "My Profile",        icon: "👤" },
  ],

  // Officer only
  officer: [
    { path: "/officer/dashboard",  label: "Officer Dashboard", icon: "📈" },
    { path: "/officer/companies",  label: "Manage Companies",  icon: "🏭" },
    { path: "/officer/reports",    label: "Reports",           icon: "📑" },
  ],

  // Admin only
  admin: [
    { path: "/admin/dashboard",    label: "Admin Dashboard",   icon: "🛡️" },
    { path: "/admin/users",        label: "Manage Users",      icon: "👥" },
    { path: "/admin/verify",       label: "Verify Data",       icon: "✅" },
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
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="py-4 px-3">
          {/* Main Navigation */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </p>
            <nav className="space-y-0.5">
              {NAV_ITEMS.common.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Officer Section */}
          {isOfficerOrAdmin && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Placement Office
              </p>
              <nav className="space-y-0.5">
                {NAV_ITEMS.officer.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`
                    }
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Administration
              </p>
              <nav className="space-y-0.5">
                {NAV_ITEMS.admin.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`
                    }
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}

          {/* Bottom: Email verification warning */}
          {user && !user.isEmailVerified && (
            <div className="mx-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-medium">⚠️ Email not verified</p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Check your inbox to verify your account.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;