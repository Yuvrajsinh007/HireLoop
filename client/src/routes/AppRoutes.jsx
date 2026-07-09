import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Public
import Landing from "../pages/Landing";

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";
import JourneyTracker from "../pages/student/JourneyTracker";
import Profile from "../pages/student/Profile";
import SavedExperiences from "../pages/student/SavedExperiences";

// Company Pages
import CompanyList from "../pages/company/CompanyList";
import CompanyPage from "../pages/company/CompanyPage";

// Experience Pages
import ExperienceFeed from "../pages/experience/ExperienceFeed";
import ExperienceDetail from "../pages/experience/ExperienceDetail";

// Mentor Pages
import MentorList from "../pages/mentor/MentorList";
import MyBookings from "../pages/mentor/MyBookings";

// Officer Pages
import OfficerDashboard from "../pages/officer/OfficerDashboard";
import ManageCompanies from "../pages/officer/ManageCompanies";
import PlacementReports from "../pages/officer/PlacementReports";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import VerifyData from "../pages/admin/VerifyData";

// ─── Placeholder for unauthorized ─────────────────────────────────────────
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center flex-col gap-4">
    <h1 className="text-3xl font-bold text-red-500">403 — Unauthorized</h1>
    <p className="text-gray-500">You don't have permission to access this page.</p>
    <a href="/" className="text-indigo-600 underline">Go Home</a>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center flex-col gap-4">
    <h1 className="text-3xl font-bold text-gray-800">404 — Page Not Found</h1>
    <p className="text-gray-500">The page you're looking for doesn't exist.</p>
    <a href="/" className="text-indigo-600 underline">Go Home</a>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ─── Public Routes ───────────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ─── Student + Senior Routes ─────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={["student", "senior", "officer", "admin"]} />}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/journey" element={<JourneyTracker />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/saved-experiences" element={<SavedExperiences />} />
        <Route path="/companies" element={<CompanyList />} />
        <Route path="/companies/:id" element={<CompanyPage />} />
        <Route path="/experiences" element={<ExperienceFeed />} />
        <Route path="/experiences/:id" element={<ExperienceDetail />} />
        <Route path="/mentors" element={<MentorList />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Route>

      {/* ─── Officer Routes ───────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={["officer", "admin"]} />}>
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/companies" element={<ManageCompanies />} />
        <Route path="/officer/reports" element={<PlacementReports />} />
      </Route>

      {/* ─── Admin Routes ─────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/verify" element={<VerifyData />} />
      </Route>

      {/* ─── Fallback ─────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;