import API from "./api";

export const getStudentProfile  = ()        => API.get("/students/profile");
export const updateStudentProfile = (data)  => API.put("/students/profile", data);
export const uploadResume       = (formData)=> API.post("/students/resume", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const uploadAvatar       = (formData)=> API.post("/students/avatar", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const getDashboardStats  = ()        => API.get("/students/dashboard-stats");
export const getMyApplications  = (params)  => API.get("/applications/my", { params });
export const addApplication     = (data)    => API.post("/applications", data);
export const updateAppStage     = (id, data)=> API.put(`/applications/${id}/stage`, data);
export const deleteApplication  = (id)      => API.delete(`/applications/${id}`);
export const getSavedExperiences= ()        => API.get("/students/saved-experiences");
export const saveExperience     = (id)      => API.post(`/students/save-experience/${id}`);
export const unsaveExperience   = (id)      => API.delete(`/students/save-experience/${id}`);
export const getNotifications   = ()        => API.get("/students/notifications");
export const markNotificationRead   = (id)  => API.put(`/students/notifications/${id}/read`);
export const markAllNotificationsRead = ()  => API.put("/students/notifications/read-all");