import API from "./api";

// ─── Public ────────────────────────────────────────────────────────────────
export const lookupDomain         = (email)  => API.get(`/institutions/lookup-domain?email=${email}`);

// ─── Institution Profile ───────────────────────────────────────────────────
export const getMyInstitution     = ()       => API.get("/institutions/me");
export const updateMyInstitution  = (data)   => API.put("/institutions/me", data);

// ─── Domains ───────────────────────────────────────────────────────────────
export const getDomains           = ()       => API.get("/institutions/domains");
export const addDomain            = (data)   => API.post("/institutions/domains", data);
export const removeDomain         = (id)     => API.delete(`/institutions/domains/${id}`);

// ─── Academic Units ────────────────────────────────────────────────────────
export const getAcademicUnits     = ()       => API.get("/institutions/academic-units");
export const createAcademicUnit   = (data)   => API.post("/institutions/academic-units", data);
export const updateAcademicUnit   = (id, d)  => API.put(`/institutions/academic-units/${id}`, d);
export const deleteAcademicUnit   = (id)     => API.delete(`/institutions/academic-units/${id}`);

// ─── Programs ─────────────────────────────────────────────────────────────
export const getPrograms          = (params) => API.get("/institutions/programs", { params });
export const createProgram        = (data)   => API.post("/institutions/programs", data);
export const updateProgram        = (id, d)  => API.put(`/institutions/programs/${id}`, d);
export const deleteProgram        = (id)     => API.delete(`/institutions/programs/${id}`);