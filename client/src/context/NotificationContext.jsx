import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSocket } from "./SocketContext";
import API from "../services/api";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // ─── Fetch notifications from server ─────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/students/notifications");
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.data?.filter((n) => !n.isRead).length || 0);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Listen for real-time notifications via socket ────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("notification:new");
    };
  }, [socket]);

  // ─── Mark single notification as read ─────────────────────────────────────
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await API.put(`/students/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }, []);

  // ─── Mark all as read ─────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await API.put("/students/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

export default NotificationContext;