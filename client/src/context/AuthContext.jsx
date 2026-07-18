import { createContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, getMe } from "../services/authService";

export const AuthContext = createContext(null);

const TOKEN_KEY = "hireloop_token";
const USER_KEY  = "hireloop_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // ─── Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (!saved) { setIsLoading(false); return; }
      try {
        const res = await getMe();
        setUser(res.data.data);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  }, []);

  // ─── Register ──────────────────────────────────────────────────────────
  const register = useCallback(async (data) => {
    const res = await registerUser(data);
    const { token: t, user: u } = res.data.data;
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // ─── Update user (profile edit, email verify, OTP login) ──────────────
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const merged = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
    if (updates.token) {
      localStorage.setItem(TOKEN_KEY, updates.token);
      setToken(updates.token);
    }
  }, []);

  const isAuthenticated = !!token && !!user;

  // ─── Derived helpers ───────────────────────────────────────────────────
  const isCurrentStudent = user
    ? ["ENROLLED","FINAL_YEAR"].includes(user.academicStatus)
    : false;

  const isAlumni = user?.academicStatus === "GRADUATED";

  const isStaff = user
    ? ["collegeAdmin","officer","superAdmin"].includes(user.role)
    : false;

  const isSuperAdmin   = user?.role === "superAdmin";
  const isCollegeAdmin = user?.role === "collegeAdmin";
  const isOfficer      = user?.role === "officer";

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, isAuthenticated,
      login, register, logout, updateUser,
      isCurrentStudent, isAlumni, isStaff,
      isSuperAdmin, isCollegeAdmin, isOfficer,
    }}>
      {children}
    </AuthContext.Provider>
  );
};