import API from "./api";

export const getAnnouncements = () => API.get("/announcements");
export const getAnnouncement = (id) => API.get(`/announcements/${id}`);
export const createAnnouncement = (data) => API.post("/announcements", data);
export const updateAnnouncement = (id, data) => API.put(`/announcements/${id}`, data);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);
