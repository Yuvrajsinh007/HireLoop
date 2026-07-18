import API from "./api";

export const getDrives          = (params) => API.get("/drives", { params });
export const getDrive           = (id)     => API.get(`/drives/${id}`);
export const getEligibleDrives  = ()       => API.get("/drives/eligible");
export const createDrive        = (data)   => API.post("/drives", data);
export const updateDrive        = (id, d)  => API.put(`/drives/${id}`, d);
export const deleteDrive        = (id)     => API.delete(`/drives/${id}`);
export const sendDriveAlert     = (id)     => API.post(`/drives/${id}/send-alert`);
export const getDriveApplications = (id)  => API.get(`/drives/${id}/applications`);