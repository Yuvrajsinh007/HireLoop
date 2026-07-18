import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loader from "./Loader";

/**
 * ProtectedRoute
 * allowedRoles   — system roles: ["member","officer","collegeAdmin","superAdmin"]
 * allowedAcademic — academic statuses: ["ENROLLED","FINAL_YEAR","GRADUATED"]
 * staffOnly      — shortcut for officer+collegeAdmin+superAdmin
 * alumniOnly     — shortcut for GRADUATED members
 * studentOnly    — shortcut for ENROLLED+FINAL_YEAR members
 */
const ProtectedRoute = ({
  allowedRoles,
  allowedAcademic,
  staffOnly,
  alumniOnly,
  studentOnly,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader fullScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Staff only shortcut
  if (staffOnly && !["collegeAdmin","officer","superAdmin"].includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Alumni only shortcut
  if (alumniOnly && user?.academicStatus !== "GRADUATED") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Student only shortcut
  if (studentOnly && !["ENROLLED","FINAL_YEAR"].includes(user?.academicStatus)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Academic status check
  if (allowedAcademic && !allowedAcademic.includes(user?.academicStatus)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;