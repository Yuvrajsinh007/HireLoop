import API from "./api";

// ─── Student ───────────────────────────────────────────────────────────────
export const submitGuidanceRequest  = (data)   => API.post("/guidance", data);
export const getMyGuidanceRequests  = ()        => API.get("/guidance/my");
export const getMySessions          = ()        => API.get("/guidance/my-sessions");
export const submitSessionFeedback  = (id, d)  => API.post(`/guidance/sessions/${id}/feedback`, d);

// ─── Alumni ────────────────────────────────────────────────────────────────
export const getAlumniSessions      = ()        => API.get("/guidance/alumni/sessions");

// ─── Officer ───────────────────────────────────────────────────────────────
export const getAllGuidanceRequests  = (params) => API.get("/guidance/officer/requests", { params });
export const assignAlumni           = (id, d)  => API.put(`/guidance/officer/requests/${id}/assign-alumni`, d);
export const updateRequestStatus    = (id, d)  => API.put(`/guidance/officer/requests/${id}/status`, d);
export const suggestAlumni          = (id)     => API.get(`/guidance/officer/requests/${id}/suggest-alumni`);
export const createSession          = (data)   => API.post("/guidance/officer/sessions", data);
export const getAllSessions          = (params) => API.get("/guidance/officer/sessions", { params });
export const updateSession          = (id, d)  => API.put(`/guidance/officer/sessions/${id}`, d);