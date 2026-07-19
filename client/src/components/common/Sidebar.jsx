import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Avatar from './Avatar';

const Navbar = () => {
  const {
    isAuthenticated,
    user,
    logout,
    isCurrentStudent,
    isAlumni,
    isOfficer,
    isCollegeAdmin,
    isSuperAdmin
  } = useAuth();

  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const getNavLinks = () => {
    if (!isAuthenticated) return [];

    if (isSuperAdmin) {
      return [
        { name: 'Dashboard', path: '/super-admin/dashboard' },
        { name: 'Institutions', path: '/super-admin/institutions' },
        { name: 'Users', path: '/super-admin/users' },
      ];
    }
    if (isCollegeAdmin) {
      return [
        { name: 'Dashboard', path: '/college-admin/dashboard' },
        { name: 'Structure', path: '/college-admin/academic-structure' },
        { name: 'Staff', path: '/college-admin/staff' },
        { name: 'Placement Ops', path: '/officer/dashboard' },
      ];
    }
    if (isOfficer) {
      return [
        { name: 'Dashboard', path: '/officer/dashboard' },
        { name: 'Drives', path: '/officer/drives' },
        { name: 'Members', path: '/officer/members' },
        { name: 'Guidance', path: '/officer/guidance' },
      ];
    }
    if (isCurrentStudent) {
      return [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Journey', path: '/journey' },
        { name: 'Drives', path: '/drives' },
        { name: 'Experiences', path: '/experiences' },
      ];
    }
    if (isAlumni) {
      return [
        { name: 'Dashboard', path: '/alumni/dashboard' },
        { name: 'My Career', path: '/alumni/career' },
        { name: 'Sessions', path: '/alumni/sessions' },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              HIRELOOP
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Side / Auth Status */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                  Sign in
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition shadow-sm hover:shadow">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <Avatar
                    src={user?.avatarUrl}
                    alt={user?.name}
                    name={user?.name}
                    size="sm"
                  />
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                >
                  {link.name}
                </Link>
              ))}

              {!isAuthenticated ? (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col space-y-2 px-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center px-4 py-2 text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center px-4 space-x-3 mb-3">
                    <Avatar src={user?.avatarUrl} alt={user?.name} name={user?.name} size="sm" />
                    <div>
                      <p className="text-base font-medium text-gray-800">{user?.name}</p>
                      <p className="text-sm font-medium text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;