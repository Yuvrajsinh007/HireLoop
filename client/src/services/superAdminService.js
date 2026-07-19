import API from "./api";

// ─── Institutions (Platform Super Admin) ──────────────────────────────────
export const getAllInstitutions   = (params) => API.get("/super-admin/institutions", { params });
export const getInstitution       = (id)     => API.get(`/super-admin/institutions/${id}`);
export const approveInstitution   = (id)     => API.put(`/super-admin/institutions/${id}/approve`);
export const rejectInstitution    = (id, reason) => API.put(`/super-admin/institutions/${id}/reject`, { reason });
export const suspendInstitution   = (id)     => API.put(`/super-admin/institutions/${id}/suspend`);
export const reactivateInstitution= (id)     => API.put(`/super-admin/institutions/${id}/reactivate`);

// ─── Platform Stats ─────────────────────────────────────────────────────────
export const getPlatformStats     = ()       => API.get("/super-admin/stats");

// ─── Users (read-only platform directory) ───────────────────────────────────
export const getAllUsers          = (params) => API.get("/super-admin/users", { params });

// ─── Public: College Registration (no auth required) ────────────────────────
export const registerInstitution  = (data)   => API.post("/super-admin/institutions/register", data);