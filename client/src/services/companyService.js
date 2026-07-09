import API from "./api";

export const getCompanies     = (params) => API.get("/companies", { params });
export const getCompany       = (id)     => API.get(`/companies/${id}`);
export const searchCompanies  = (q)      => API.get("/companies/search", { params: { q } });
export const createCompany    = (data)   => API.post("/companies", data);
export const updateCompany    = (id, data) => API.put(`/companies/${id}`, data);
export const deleteCompany    = (id)     => API.delete(`/companies/${id}`);
export const uploadCompanyLogo= (id, formData) => API.post(`/companies/${id}/logo`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});