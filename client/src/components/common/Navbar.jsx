import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { getDashboardPath, getRoleLabel } from "../../utils/roleHelpers";
import { timeAgo } from "../../utils/formatDate";
import { NOTIFICATION_TYPES } from "../../utils/constants";
import toast from "react-hot-toast";
import { 
  Menu, Bell, User, LogOut, ChevronDown, 
  LayoutDashboard, Map, BellDot
} from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotification() || {};
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBellClick = () => {
    setShowNotif((p) => !p);
    if (!showNotif && fetchNotifications) fetchNotifications();
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const avatarUrl = user?.avatar || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=4F46E5&color=fff`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 transition-all">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={user ? getDashboardPath(user?.role) : "/"} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight hidden sm:block">
              HireLoop
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {!user ? (
            /* Public Navbar Actions */
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">
                Log in
              </Link>
              <Link to="/register" className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          ) : (
            /* Authenticated Navbar Actions */
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleBellClick}
                  className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5 stroke-[1.5]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotif && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto overscroll-contain">
                      {notifications?.length === 0 ? (
                        <div className="py-10 flex flex-col items-center justify-center text-gray-400">
                          <BellDot className="w-8 h-8 mb-2 opacity-20" />
                          <span className="text-sm">No notifications yet</span>
                        </div>
                      ) : (
                        notifications?.slice(0, 10).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-brand-50/30" : ""}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'} truncate`}>{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] font-medium text-gray-400 mt-1.5 uppercase tracking-wider">{timeAgo(n.createdAt)}</p>
                            </div>
                            {!n.isRead && <div className="w-2 h-2 bg-brand-500 rounded-full mt-1.5 flex-shrink-0 shadow-sm" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile((p) => !p)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <img src={avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" />
                  <div className="hidden sm:block text-left mr-1">
                    <p className="text-sm font-semibold text-gray-700 leading-none">{user?.name?.split(" ")[0]}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>

                {showProfile && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                      <div className="mt-2 inline-flex">
                        <span className="badge badge-indigo capitalize shadow-sm">{getRoleLabel(user?.role)}</span>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link to="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4 stroke-[1.5]" /> My Profile
                      </Link>
                      <Link to="/dashboard" onClick={() => setShowProfile(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4 stroke-[1.5]" /> Dashboard
                      </Link>
                      <Link to="/journey" onClick={() => setShowProfile(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                        <Map className="w-4 h-4 stroke-[1.5]" /> My Journey
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 py-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                        <LogOut className="w-4 h-4 stroke-[1.5]" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;