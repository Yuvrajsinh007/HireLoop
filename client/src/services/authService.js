import API from "./api";

export const registerUser = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

export const getMe = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

export const verifyEmail = async (token) => {
  const res = await API.get(`/auth/verify-email?token=${token}`);
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await API.post("/auth/reset-password", { token, newPassword });
  return res.data;
};

export const changePassword = async (data) => {
  const res = await API.put("/auth/change-password", data);
  return res.data;
};