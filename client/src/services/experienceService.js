import API from "./api";

export const getExperiences    = (params) => API.get("/experiences", { params });
export const getExperience     = (id)     => API.get(`/experiences/${id}`);
export const getMyExperiences  = ()       => API.get("/experiences/my");
export const getByCompany      = (id)     => API.get(`/experiences/company/${id}`);
export const createExperience  = (data)   => API.post("/experiences", data);
export const updateExperience  = (id, d)  => API.put(`/experiences/${id}`, d);
export const deleteExperience  = (id)     => API.delete(`/experiences/${id}`);
export const upvoteExperience  = (id)     => API.post(`/experiences/${id}/upvote`);