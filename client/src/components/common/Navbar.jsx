import { useState } from "react";
import {
  Link,
  NavLink,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { getDashboardPath } from "../../utils/roleHelpers";
import Logo from "./Logo";

const Navbar = () => {
  const {
    isAuthenticated,
    user,
    logout,
  } = useAuth();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const dashboardPath =
    isAuthenticated
      ? getDashboardPath(user)
      : "/";

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;

  const sharedLinks = [
    {
      label: "Companies",
      to: "/companies",
    },
    {
      label: "Drives",
      to: "/drives",
    },
    {
      label: "Experiences",
      to: "/experiences",
    },
  ];

  const getRoleLinks = () => {
    if (!user) {
      return [];
    }

    switch (user.role) {
      case "student":
        return [
          {
            label: "Journey",
            to: "/journey",
          },
          {
            label: "Guidance",
            to: "/guidance/my",
          },
        ];

      case "alumni":
        return [
          {
            label: "Career",
            to: "/alumni/career",
          },
          {
            label: "Sessions",
            to: "/alumni/sessions",
          },
        ];

      case "officer":
        return [
          {
            label: "Manage drives",
            to: "/officer/drives",
          },
          {
            label: "Guidance",
            to: "/officer/guidance",
          },
        ];

      case "collegeAdmin":
        return [
          {
            label: "Academic structure",
            to: "/college-admin/academic-structure",
          },
          {
            label: "Staff",
            to: "/college-admin/staff",
          },
        ];

      case "superAdmin":
        return [
          {
            label: "Institutions",
            to: "/super-admin/institutions",
          },
          {
            label: "Users",
            to: "/super-admin/users",
          },
        ];

      default:
        return [];
    }
  };

  const navigationLinks = isAuthenticated
    ? [
        ...sharedLinks,
        ...getRoleLinks(),
      ]
    : [];

  const handleLogout = () => {
    closeMenu();

    if (typeof logout === "function") {
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {isAuthenticated &&
            navigationLinks
              .slice(0, 5)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 sm:flex">
          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPath}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Dashboard
              </Link>

              <Link
                to="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 transition hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Open profile"
                title="Open profile"
              >
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <button
          type="button"
          onClick={() =>
            setIsMenuOpen(
              (current) => !current
            )
          }
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:hidden"
          aria-label={
            isMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M18 6 6 18"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-lg sm:hidden">
          <div className="mx-auto max-w-7xl space-y-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to={dashboardPath}
                  onClick={closeMenu}
                  className={navLinkClass}
                >
                  Dashboard
                </NavLink>

                {navigationLinks.map(
                  (item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMenu}
                      className={navLinkClass}
                    >
                      {item.label}
                    </NavLink>
                  )
                )}

                <NavLink
                  to="/profile"
                  onClick={closeMenu}
                  className={navLinkClass}
                >
                  Profile
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="block rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                >
                  Get started
                </Link>

                <Link
                  to="/register-institution"
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                  Register institution
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;