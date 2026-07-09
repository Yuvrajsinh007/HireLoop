export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

export const isCollegeEmail = (email) =>
  /@charusat\.edu\.in$/.test(email) || /@ec\.charusat\.ac\.in$/.test(email);

export const isValidURL = (url) => {
  try { new URL(url); return true; }
  catch { return false; }
};

export const isValidCGPA = (cgpa) => {
  const n = parseFloat(cgpa);
  return !isNaN(n) && n >= 0 && n <= 10;
};

export const isValidPassword = (password) => password && password.length >= 6;

export const isEmpty = (val) => !val || val.toString().trim() === "";