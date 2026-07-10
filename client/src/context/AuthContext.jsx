import { createContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, getMe } from "../services/authService";

// 1. Export the context directly as a named export
export const AuthContext = createContext(null);

const TOKEN_KEY = "hireloop_token";
const USER_KEY = "hireloop_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  // Note: Renamed loading to isLoading to match what App.jsx and ProtectedRoute expect
  const [isLoading, setIsLoading] = useState(true);

  // ─── Load user on mount if token exists ─────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, role) => {
    const res = await registerUser({ name, email, password, role });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // ─── Update user in context (after profile edit) ──────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    const saved = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
    localStorage.setItem(USER_KEY, JSON.stringify({ ...saved, ...updatedUser }));
  }, []);

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isLoading, // Exported as isLoading so useAuth().isLoading works in App.jsx
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};