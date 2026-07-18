import API from "./api";

// ─── Dashboard ─────────────────────────────────────────────────────────────
export const getOfficerDashboard  = ()           => API.get("/officer/dashboard");

// ─── Members ───────────────────────────────────────────────────────────────
export const getMembers           = (params)     => API.get("/officer/members", { params });
export const getMember            = (userId)     => API.get(`/officer/members/${userId}`);
export const updateMemberStatus   = (userId, d)  => API.put(`/officer/members/${userId}/status`, d);

// ─── Batch Graduation ──────────────────────────────────────────────────────
export const graduateBatch        = (data)       => API.post("/officer/graduate-batch", data);

// ─── Reports ───────────────────────────────────────────────────────────────
export const getPlacementReport   = (params)     => API.get("/officer/reports", { params });

// ─── Staff ─────────────────────────────────────────────────────────────────
export const getStaff             = ()           => API.get("/officer/staff");
export const updateUser           = (id, data)   => API.put(`/officer/users/${id}`, data);