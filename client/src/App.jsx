import React from "react";
import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Toast from "./components/common/Toast";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Shared Feature Pages
import CompanyList from './pages/company/CompanyList';
import CompanyPage from './pages/company/CompanyPage';
import DriveList from './pages/drives/DriveList';
import DriveDetail from './pages/drives/DriveDetail';
import ExperienceFeed from './pages/experience/ExperienceFeed';
import ExperienceDetail from './pages/experience/ExperienceDetail';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import JourneyTracker from './pages/student/JourneyTracker';
import Profile from './pages/student/Profile';
import SavedExperiences from './pages/student/SavedExperiences';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import ManageCompanies from './pages/officer/ManageCompanies';
import ManageDrives from './pages/officer/ManageDrives';
import ManageMembers from './pages/officer/ManageMembers';
import PlacementReports from './pages/officer/PlacementReports';
import Announcements from './pages/officer/Announcements';

// College Admin Pages
import CollegeAdminDashboard from './pages/collegeAdmin/CollegeAdminDashboard';
import AcademicStructure from './pages/collegeAdmin/AcademicStructure';
import ManageStaff from './pages/collegeAdmin/ManageStaff';
import EmailDomains from './pages/collegeAdmin/EmailDomains';

// Admin Pages (data verification — officer + collegeAdmin)
import VerifyData from './pages/admin/VerifyData';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';

import AppLayout from "./components/layout/AppLayout";

// Super Admin Pages
import RegisterInstitution from './pages/auth/RegisterInstitution';
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import ManageInstitutions from './pages/superAdmin/ManageInstitutions';
import ManageUsers from './pages/admin/ManageUsers';

// Misc
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />

            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/register-institution"
                  element={<RegisterInstitution />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/companies" element={<CompanyList />} />
                  <Route path="/companies/:id" element={<CompanyPage />} />
                  <Route path="/drives" element={<DriveList />} />
                  <Route path="/drives/:id" element={<DriveDetail />} />
                  <Route path="/experiences" element={<ExperienceFeed />} />
                  <Route
                    path="/experiences/:id"
                    element={<ExperienceDetail />}
                  />
                  <Route path="/profile" element={<Profile />} />
                  <Route
                    path="/saved-experiences"
                    element={<SavedExperiences />}
                  />
                </Route>

                <Route element={<ProtectedRoute studentOnly />}>
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/journey" element={<JourneyTracker />} />
                </Route>

                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={["officer", "collegeAdmin", "superAdmin"]}
                    />
                  }
                >
                  <Route
                    path="/officer/dashboard"
                    element={<OfficerDashboard />}
                  />
                  <Route path="/officer/members" element={<ManageMembers />} />
                  <Route path="/officer/drives" element={<ManageDrives />} />
                  <Route
                    path="/officer/companies"
                    element={<ManageCompanies />}
                  />
                  <Route
                    path="/officer/reports"
                    element={<PlacementReports />}
                  />
                  <Route
                    path="/officer/announcements"
                    element={<Announcements />}
                  />
                  <Route
                    path="/officer/verify-data"
                    element={<VerifyData />}
                  />
                </Route>

                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={["collegeAdmin", "superAdmin"]}
                    />
                  }
                >
                  <Route
                    path="/college-admin/dashboard"
                    element={<CollegeAdminDashboard />}
                  />
                  <Route
                    path="/college-admin/academic-structure"
                    element={<AcademicStructure />}
                  />
                  <Route
                    path="/college-admin/staff"
                    element={<ManageStaff />}
                  />
                  <Route
                    path="/college-admin/domains"
                    element={<EmailDomains />}
                  />
                </Route>

                <Route
                  element={<ProtectedRoute allowedRoles={["superAdmin", "collegeAdmin"]} />}
                >
                  <Route
                    path="/admin/audit-logs"
                    element={<AuditLogs />}
                  />
                  <Route
                    path="/admin/settings"
                    element={<Settings />}
                  />
                </Route>

                <Route
                  element={<ProtectedRoute allowedRoles={["superAdmin"]} />}
                >
                  <Route
                    path="/super-admin/dashboard"
                    element={<SuperAdminDashboard />}
                  />
                  <Route
                    path="/super-admin/institutions"
                    element={<ManageInstitutions />}
                  />
                  <Route
                    path="/super-admin/users"
                    element={<ManageUsers />}
                  />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>

          <Toast />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
