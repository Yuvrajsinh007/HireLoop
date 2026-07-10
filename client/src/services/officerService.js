import API from "./api";

export const getOfficerDashboard = ()       => API.get("/officer/dashboard");
export const getStudents         = (params) => API.get("/officer/students", { params });
export const sendDriveAlert      = (data)   => API.post("/officer/send-drive-alert", data);
export const getPlacementReport  = (params) => API.get("/officer/reports", { params });
export const getAllUsers          = (params) => API.get("/officer/admin/users", { params });
export const updateUser          = (id, d)  => API.put(`/officer/admin/users/${id}`, d);
export const verifyExperience    = (id)     => API.put(`/officer/admin/experiences/${id}/verify`);