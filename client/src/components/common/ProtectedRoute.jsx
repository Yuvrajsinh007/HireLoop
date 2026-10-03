import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import Loader from "./Loader";

const STAFF_ROLES = [
  "collegeAdmin",
  "officer",
  "superAdmin",
];

const STUDENT_STATUSES = [
  "ENROLLED",
  "FINAL_YEAR",
];

const ProtectedRoute = ({
  allowedRoles,
  allowedAcademic,
  staffOnly = false,
  studentOnly = false,
}) => {
  const {
    isAuthenticated,
    user,
    isLoading,
  } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <Loader
        fullScreen
        label="Checking secure access"
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (
    staffOnly &&
    !STAFF_ROLES.includes(user?.role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  if (
    studentOnly &&
    !STUDENT_STATUSES.includes(
      user?.academicStatus
    )
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  if (
    allowedAcademic &&
    !allowedAcademic.includes(
      user?.academicStatus
    )
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;