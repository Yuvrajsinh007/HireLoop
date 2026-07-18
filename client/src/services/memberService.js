import API from "./api";

// ─── Profile ───────────────────────────────────────────────────────────────
export const getMemberProfile   = ()       => API.get("/members/profile");
export const updateMemberProfile= (data)   => API.put("/members/profile", data);
export const uploadAvatar       = (fd)     => API.post("/members/avatar", fd, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const uploadResume       = (fd)     => API.post("/members/resume", fd, {
  headers: { "Content-Type": "multipart/form-data" },
});

// ─── Dashboard Stats ───────────────────────────────────────────────────────
export const getDashboardStats  = ()       => API.get("/members/dashboard-stats");
export const getAlumniStats     = ()       => API.get("/members/alumni-stats");

// ─── Employment History (alumni) ───────────────────────────────────────────
export const getEmploymentHistory = ()          => API.get("/members/employment");
export const addEmployment        = (data)      => API.post("/members/employment", data);
export const updateEmployment     = (id, data)  => API.put(`/members/employment/${id}`, data);
export const deleteEmployment     = (id)        => API.delete(`/members/employment/${id}`);

// ─── Saved Experiences ─────────────────────────────────────────────────────
export const getSavedExperiences  = ()    => API.get("/members/saved-experiences");
export const saveExperience       = (id)  => API.post(`/members/save-experience/${id}`);
export const unsaveExperience     = (id)  => API.delete(`/members/save-experience/${id}`);

// ─── Notifications ─────────────────────────────────────────────────────────
export const getNotifications         = ()    => API.get("/members/notifications");
export const markNotificationRead     = (id)  => API.put(`/members/notifications/${id}/read`);
export const markAllNotificationsRead = ()    => API.put("/members/notifications/read-all");

// ─── Applications (student) ────────────────────────────────────────────────
export const getMyApplications = (params) => API.get("/applications/my", { params });
export const addApplication    = (data)   => API.post("/applications", data);
export const updateAppStage    = (id, d)  => API.put(`/applications/${id}/stage`, d);
export const updateApplication = (id, d)  => API.put(`/applications/${id}`, d);
export const deleteApplication = (id)     => API.delete(`/applications/${id}`);