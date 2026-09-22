import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getNavItems } from "../../utils/roleHelpers";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navItems = getNavItems(user);

  const groupedItems = navItems.reduce((acc, item) => {
    const group = item.group || "Main";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

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
      <aside className={`
        fixed top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-100
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        <div className="py-4 px-3">

          {/* Institution name */}
          {user?.institution && (
            <div className="px-3 py-2 mb-4 bg-indigo-50 rounded-xl">
              <p className="text-xs text-indigo-400 font-medium">Institution</p>
              <p className="text-sm font-semibold text-indigo-800 truncate">
                {typeof user.institution === "object"
                  ? user.institution.shortName || user.institution.name
                  : "Your Institution"}
              </p>
            </div>
          )}

          {/* Nav items */}
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Email verification warning */}
          {user && !user.isEmailVerified && (
            <div className="mx-2 mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-800 font-semibold">⚠️ Email not verified</p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Go to Profile to verify your email.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;