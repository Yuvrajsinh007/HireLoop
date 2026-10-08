import API from "./api";

export const getDomains = () => API.get("/college-admin/domains");
export const addDomain = (data) => API.post("/college-admin/domains", data);
export const verifyDomain = (id) => API.put(`/college-admin/domains/${id}/verify`);
export const removeDomain = (id) => API.delete(`/college-admin/domains/${id}`);

export const createOfficer = (data) => API.post("/college-admin/officers", data);
export const updateOfficer = (id, data) => API.put(`/college-admin/officers/${id}`, data);
export const deactivateOfficer = (id) => API.delete(`/college-admin/officers/${id}/deactivate`);
