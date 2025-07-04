// src/services/auth.service.js
import axios from 'axios';

// The API_URL now points to the local API directory for client-side calls.
// The server-side proxy will handle forwarding to the actual backend.
const LOCAL_API_URL = "/api";
const SERVER_API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

const login = async (email, password) => {
  try {
    const response = await axios.post(`${SERVER_API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Invalid credentials.");
  }
};

const getProfile = async (token) => {
    try {
        // The API call remains the same
        const response = await axios.get(`${LOCAL_API_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // The key is to access response.data directly now, not response.data.payload
        if (response.data) {
            return response.data;
        }
        
        throw new Error('Invalid data structure for profile from API');
    } catch (error) {
        console.error("Get profile service error:", {
            message: error.message,
            code: error.code,
            response: error.response ? error.response.data : 'No response data'
        });
        throw new Error(error.response?.data?.message || "Failed to fetch profile.");
    }
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${LOCAL_API_URL}/otp/generate`, { email });
    if (response.data.status !== 'OK') {
      throw new Error(response.data.message || 'Failed to send OTP.');
    }
    return response.data;
  } catch (error) {
    console.error("Forgot Password service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'An error occurred while sending the OTP.');
  }
};

const verifyOtp = async (email, otp) => {
    try {
        const response = await axios.post(`${LOCAL_API_URL}/otp/validate`, { email, otp });
        if (response.data.payload === true) {
             return { success: true, message: "OTP verified successfully." };
        } else {
             throw new Error(response.data.message || "Invalid OTP.");
        }
    } catch (error) {
        console.error("Verify OTP service error:", error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.message || "An error occurred during OTP validation.");
    }
};

const resetPassword = async ({ email, otp, newPassword }) => {
    try {
        const response = await axios.post(`${SERVER_API_URL}/auth/reset-password-with-otp`, {
            email,
            otp,
            newPassword
        });
        return response.data;
    } catch (error) {
        console.error("Reset Password service error:", error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.message || 'Failed to reset password. Please check your details and try again.');
    }
};

/**
 * Changes the user's password.
 * @param {string} currentPassword - The user's current password.
 * @param {string} newPassword - The new password.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} A promise that resolves to the API response.
 */
const changePassword = async (currentPassword, newPassword, token) => {
  try {
    // Using a new, non-conflicting API route for password changes.
    const response = await axios.post(
      `${LOCAL_API_URL}/user/change-password`, // UPDATED ENDPOINT
      { currentPassword, newPassword },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Change password service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'Failed to change password.');
  }
};

export const authService = {
  login,
  getProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
};