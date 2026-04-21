import api from "./api";

export const sendOtp = (email) => {
  return api.post("/auth/admin/send-otp", {
    email: email ,
  });
};

export const verifyOtp = (email, otp) => {
  return api.post("/auth/admin/verify-otp", {
    email,
    otp,
  });
};

export const resetPassword = (email, newPassword) => {
  return api.post("/auth/admin/reset-password", {
    email,
    newPassword,
  });
};
