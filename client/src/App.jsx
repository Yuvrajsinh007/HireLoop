import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';

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

// Alumni Pages
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniSessions from './pages/alumni/AlumniSessions';
import MyCareer from './pages/alumni/MyCareer';

// Guidance Pages
import MyRequests from './pages/guidance/MyRequests';
import MySessions from './pages/guidance/MySessions';
import RequestGuidance from './pages/guidance/RequestGuidance';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import GuidanceInbox from './pages/officer/GuidanceInbox';
import ManageCompanies from './pages/officer/ManageCompanies';
import ManageDrives from './pages/officer/ManageDrives';
import ManageMembers from './pages/officer/ManageMembers';
import PlacementReports from './pages/officer/PlacementReports';

// College Admin Pages
import CollegeAdminDashboard from './pages/collegeAdmin/CollegeAdminDashboard';
import AcademicStructure from './pages/collegeAdmin/AcademicStructure';
import ManageStaff from './pages/collegeAdmin/ManageStaff';

// Admin Pages (data verification — officer + collegeAdmin)
import VerifyData from './pages/admin/VerifyData';

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
            <div className="flex flex-col min-h-screen">
              <Navbar />

              <main className="flex-grow">
                <Routes>
                  {/* ── Public Routes ─────────────────────────────────── */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register-institution" element={<RegisterInstitution />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* ── Shared Features (any authenticated user) ─────── */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/companies" element={<CompanyList />} />
                    <Route path="/companies/:id" element={<CompanyPage />} />
                    <Route path="/drives" element={<DriveList />} />
                    <Route path="/drives/:id" element={<DriveDetail />} />
                    <Route path="/experiences" element={<ExperienceFeed />} />
                    <Route path="/experiences/:id" element={<ExperienceDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/saved-experiences" element={<SavedExperiences />} />
                  </Route>

                  {/* ── Guidance (current students only can request) ─── */}
                  <Route element={<ProtectedRoute studentOnly />}>
                    <Route path="/guidance/request" element={<RequestGuidance />} />
                    <Route path="/guidance/my" element={<MyRequests />} />
                  </Route>
                  <Route element={<ProtectedRoute alumniOnly />}>
                    <Route path="/alumni/sessions" element={<AlumniSessions />} />
                  </Route>
                  <Route element={<ProtectedRoute staffOnly />}>
                    <Route path="/guidance/sessions" element={<MySessions />} />
                  </Route>

                  {/* ── Student Routes ─────────────────────────────────── */}
                  <Route element={<ProtectedRoute studentOnly />}>
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/journey" element={<JourneyTracker />} />
                  </Route>

                  {/* ── Alumni Routes ──────────────────────────────────── */}
                  <Route element={<ProtectedRoute alumniOnly />}>
                    <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
                    <Route path="/alumni/career" element={<MyCareer />} />
                  </Route>

                  {/* ── Officer Routes ─────────────────────────────────── */}
                  <Route element={<ProtectedRoute allowedRoles={["officer","collegeAdmin","superAdmin"]} />}>
                    <Route path="/officer/dashboard" element={<OfficerDashboard />} />
                    <Route path="/officer/members" element={<ManageMembers />} />
                    <Route path="/officer/drives" element={<ManageDrives />} />
                    <Route path="/officer/companies" element={<ManageCompanies />} />
                    <Route path="/officer/guidance" element={<GuidanceInbox />} />
                    <Route path="/officer/reports" element={<PlacementReports />} />
                    <Route path="/officer/verify-data" element={<VerifyData />} />
                  </Route>

                  {/* ── College Admin Routes ───────────────────────────── */}
                  <Route element={<ProtectedRoute allowedRoles={["collegeAdmin","superAdmin"]} />}>
                    <Route path="/college-admin/dashboard" element={<CollegeAdminDashboard />} />
                    <Route path="/college-admin/academic-structure" element={<AcademicStructure />} />
                    <Route path="/college-admin/staff" element={<ManageStaff />} />
                  </Route>

                  {/* ── Super Admin Routes ─────────────────────────────── */}
                  <Route element={<ProtectedRoute allowedRoles={["superAdmin"]} />}>
                    <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
                    <Route path="/super-admin/institutions" element={<ManageInstitutions />} />
                    <Route path="/super-admin/users" element={<ManageUsers />} />
                  </Route>

                  {/* ── 404 ─────────────────────────────────────────────── */}
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