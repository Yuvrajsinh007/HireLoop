import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ChevronsUpDown,
  LogOut,
  Settings2,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { getNavItems } from "../../utils/roleHelpers";
import Avatar from "./Avatar";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("hireloop-sidebar-collapsed") === "true";
  });

  const [accountOpen, setAccountOpen] = useState(false);

  const navItems = getNavItems(user);

  const groupedItems = navItems.reduce((groups, item) => {
    const groupName = item.group || "Workspace";

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push(item);

    return groups;
  }, {});

  useEffect(() => {
    onClose?.();
    setAccountOpen(false);
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((previous) => {
      const nextState = !previous;

      localStorage.setItem(
        "hireloop-sidebar-collapsed",
        String(nextState)
      );

      return nextState;
    });
  };

  const institutionName =
    typeof user?.institution === "object"
      ? user.institution?.shortName ||
        user.institution?.name ||
        "Your institution"
      : user?.institutionName || "Your institution";

  const userName = user?.name || "HireLoop User";
  const userEmail = user?.email || "No email available";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setAccountOpen(false);
    onClose?.();

    if (typeof logout === "function") {
      logout();
    }
  };

  return (
    <>
      {/* Mobile background overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="app-sidebar"
        className={`fixed bottom-0 left-0 top-[72px] z-50 flex border-r border-slate-200 bg-white shadow-2xl shadow-slate-950/10 transition-[width,transform] duration-300 ease-out lg:z-40 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-72 lg:w-[76px]" : "w-72 lg:w-64"}`}
      >
        <div className="flex w-full min-w-0 flex-col overflow-hidden">
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-emerald-400">
                H
              </div>

              <span className="text-sm font-black tracking-tight text-slate-950">
                HireLoop
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-violet-500/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop heading and sidebar collapse button */}
          <div
            className={`hidden border-b border-slate-100 py-3 lg:flex ${
              isCollapsed
                ? "justify-center px-2"
                : "items-center justify-between px-3"
            }`}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-emerald-400 shadow-sm">
                  H
                </div>

                <span className="text-sm font-black tracking-tight text-slate-950">
                  HireLoop
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={toggleCollapse}
              aria-label={
                isCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"
              }
              aria-expanded={!isCollapsed}
              aria-controls="app-sidebar"
              title={
                isCollapsed ? "Expand navigation" : "Collapse navigation"
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/15"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Scrollable sidebar body */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {/* Institution */}
            {user?.institution && (
              <div
                className={`mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 transition-all duration-300 ${
                  isCollapsed
                    ? "flex h-11 w-11 items-center justify-center p-0"
                    : "p-3"
                }`}
                title={isCollapsed ? institutionName : undefined}
              >
                {isCollapsed ? (
                  <Building2 className="h-5 w-5 text-emerald-700" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                      <Building2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                        Institution
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-emerald-950">
                        {institutionName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation groups */}
            <nav aria-label="Workspace navigation">
              {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="mb-6 last:mb-0">
                  {!isCollapsed && (
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      {groupName}
                    </p>
                  )}

                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === "/dashboard"}
                          onClick={onClose}
                          title={isCollapsed ? item.label : undefined}
                          className={({ isActive }) =>
                            `group relative flex items-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                              isCollapsed
                                ? "justify-center px-2 py-2.5"
                                : "gap-3 px-3 py-2.5"
                            } ${
                              isActive
                                ? "bg-violet-50 text-violet-700"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-violet-600" />
                              )}

                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                                  isActive
                                    ? "bg-white text-violet-700 shadow-sm"
                                    : "text-slate-500 group-hover:bg-white group-hover:text-slate-800"
                                }`}
                              >
                                {/* Direct instantiation of the Icon component */}
                                <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                              </span>

                              {!isCollapsed && (
                                <span className="truncate">{item.label}</span>
                              )}

                              {!isCollapsed && item.badge && (
                                <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Unverified email alert */}
          {user && !user.isEmailVerified && (
            <div
              className={`mx-3 mb-3 rounded-2xl border border-amber-200 bg-amber-50 transition-all duration-300 ${
                isCollapsed
                  ? "flex h-11 w-11 items-center justify-center p-0"
                  : "p-3"
              }`}
              title={isCollapsed ? "Verify your email" : undefined}
            >
              {isCollapsed ? (
                <CircleAlert className="h-5 w-5 text-amber-600" />
              ) : (
                <div className="flex items-start gap-2.5">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                  <div>
                    <p className="text-xs font-bold text-amber-900">
                      Verify your email
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      Verify your email from the Profile page to secure your
                      account.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account section */}
          <div className="relative border-t border-slate-100 p-3">
            {accountOpen && !isCollapsed && (
              <div className="absolute bottom-[76px] left-3 right-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10">
                <NavLink
                  to="/profile"
                  onClick={() => {
                    setAccountOpen(false);
                    onClose?.();
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <UserRound className="h-4 w-4 text-slate-500" />
                  Profile
                </NavLink>

                <NavLink
                  to="/profile"
                  onClick={() => {
                    setAccountOpen(false);
                    onClose?.();
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <Settings2 className="h-4 w-4 text-slate-500" />
                  Account settings
                </NavLink>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (isCollapsed) return;
                setAccountOpen((previous) => !previous);
              }}
              title={isCollapsed ? userName : undefined}
              className={`flex w-full items-center rounded-xl text-left transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-violet-500/15 ${
                isCollapsed ? "justify-center p-1.5" : "gap-3 p-2"
              }`}
            >
              <Avatar
                name={userName}
                src={user?.avatar || user?.profilePicture}
                size="sm"
                status="online"
              />

              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {userName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {userEmail}
                    </p>
                  </div>

                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;