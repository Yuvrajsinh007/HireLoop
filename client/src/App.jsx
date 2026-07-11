import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import Loader from "./components/common/Loader";
import Toast from "./components/common/Toast";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Landing from "./pages/Landing";

import StudentDashboard from "./pages/student/StudentDashboard";
import JourneyTracker from "./pages/student/JourneyTracker";
import Profile from "./pages/student/Profile";
import SavedExperiences from "./pages/student/SavedExperiences";

import CompanyList from "./pages/company/CompanyList";
import CompanyPage from "./pages/company/CompanyPage";
import ExperienceFeed from "./pages/experience/ExperienceFeed";
import ExperienceDetail from "./pages/experience/ExperienceDetail";

import MentorList from "./pages/mentor/MentorList";
import MyBookings from "./pages/mentor/MyBookings";

import OfficerDashboard from "./pages/officer/OfficerDashboard";
import ManageCompanies from "./pages/officer/ManageCompanies";
import PlacementReports from "./pages/officer/PlacementReports";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import VerifyData from "./pages/admin/VerifyData";

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center flex-col gap-4">
    <h1 className="text-3xl font-bold text-red-500">403 — Unauthorized</h1>
    <p className="text-gray-500">You don't have permission to access this page.</p>
    <Link to="/" className="text-brand-600 underline">Go Home</Link>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center flex-col gap-4">
    <h1 className="text-3xl font-bold text-gray-800">404 — Page Not Found</h1>
    <p className="text-gray-500">The page you're looking for doesn't exist.</p>
    <Link to="/" className="text-brand-600 underline">Go Home</Link>
  </div>
);

const App = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast />
      
      <Routes>
        {/* ─── Public Routes ───────────────────────────────────────────── */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ─── Protected Routes (Layout is inside each page component) ─── */}
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

        <Route element={<ProtectedRoute allowedRoles={["officer", "admin"]} />}>
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />
          <Route path="/officer/companies" element={<ManageCompanies />} />
          <Route path="/officer/reports" element={<PlacementReports />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/verify" element={<VerifyData />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;