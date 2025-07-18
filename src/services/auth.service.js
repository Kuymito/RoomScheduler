// src/services/auth.service.js
import api, { getAuthHeaders, handleResponse, handleError } from './api';

const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return handleResponse(response);
  } catch (error) {
    handleError("logging in", error);
  }
};

const getProfile = async (token) => {
  try {
    const response = await api.get('/auth/profile', { headers: await getAuthHeaders(token) });
    return handleResponse(response);
  } catch (error) {
    handleError("fetching profile", error);
  }
};

const updateAdminProfile = async (adminId, adminData, token) => {
  try {
    const response = await api.patch(`/admins/${adminId}`, adminData, { headers: await getAuthHeaders(token) });
    return handleResponse(response);
  } catch (error) {
    handleError(`updating admin profile for ID ${adminId}`, error);
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await api.post('/otp/generate', { email });
    const data = handleResponse(response);
    if (data.status !== 'OK') {
      throw new Error(data.message || 'Failed to send OTP.');
    }
    return data;
  } catch (error) {
    handleError("sending forgot password OTP", error);
  }
};

const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post('/otp/validate', { email, otp });
    const data = handleResponse(response);
    if (data === true) { // The payload is just a boolean
      return { success: true, message: "OTP verified successfully." };
    }
    // The backend sends a message on failure, which will be caught by handleError
    throw new Error("Invalid OTP.");
  } catch (error) {
    handleError("verifying OTP", error);
  }
};

const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    const response = await api.post('/auth/reset-password-with-otp', { email, otp, newPassword });
    return handleResponse(response);
  } catch (error) {
    handleError("resetting password", error);
  }
};

const changePassword = async (currentPassword, newPassword, token) => {
  try {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword }, { headers: await getAuthHeaders(token) });
    return handleResponse(response);
  } catch (error) {
    handleError("changing password", error);
  }
};

const resetInstructorPassword = async (instructorId, newPassword, token) => {
  try {
    const response = await api.patch(`/auth/${instructorId}/reset-password`, { newPassword }, { headers: await getAuthHeaders(token) });
    return handleResponse(response);
  } catch (error) {
    handleError(`resetting password for instructor ${instructorId}`, error);
  }
};

export const authService = {
  login,
  getProfile,
  updateAdminProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  resetInstructorPassword,
};