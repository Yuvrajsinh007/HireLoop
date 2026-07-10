import API from "./api";

export const getMentors      = (params) => API.get("/mentors", { params });
export const getMySlots      = ()       => API.get("/mentors/my-slots");
export const getMyBookings   = ()       => API.get("/mentors/my-bookings");
export const createSlot      = (data)   => API.post("/mentors/slots", data);
export const updateSlot      = (id, d)  => API.put(`/mentors/slots/${id}`, d);
export const deleteSlot      = (id)     => API.delete(`/mentors/slots/${id}`);
export const bookSlot        = (id, d)  => API.post(`/mentors/slots/${id}/book`, d);
export const cancelBooking   = (id, d)  => API.put(`/mentors/bookings/${id}/cancel`, d);
export const submitFeedback  = (id, d)  => API.put(`/mentors/bookings/${id}/feedback`, d);