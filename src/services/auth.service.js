// src/services/auth.service.js
import axios from 'axios';

// The API_URL now points to the local API directory for client-side calls.
// The server-side proxy will handle forwarding to the actual backend.
const SERVER_API_URL = "https://employees-depend-refuse-struct.trycloudflare.com/api/v1";

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
    const isServer = typeof window === 'undefined';
    // Use the correct URL based on the environment
    const url = `${SERVER_API_URL}/auth/profile`;

    try {
        const response = await axios.get(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                // Add ngrok header only on server-side calls
                ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
            }
        });

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

/**
 * Updates an admin's profile information.
 * @param {string|number} adminId - The ID of the admin to update.
 * @param {object} adminData - The data to update.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} The response from the API.
 */
const updateAdminProfile = async (adminId, adminData, token) => {
  try {
    // This call goes through the Next.js API proxy
    const response = await axios.patch(`${LOCAL_API_URL}/admins/${adminId}`, adminData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Update admin profile service error for ID ${adminId}:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to update admin profile.`);
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

const changePassword = async (currentPassword, newPassword, token) => {
  try {
    const response = await axios.post(
      `${LOCAL_API_URL}/user/change-password`,
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

const resetInstructorPassword = async (instructorId, newPassword, token) => {
  const url = `${LOCAL_API_URL}/instructors/${instructorId}/reset-password`;
    
  try {
    const response = await axios.patch(url, 
      { newPassword }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Reset instructor password service error for ID ${instructorId}:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to reset password for instructor ${instructorId}.`);
  }
};

export const authService = {
  login,
  getProfile,
  updateAdminProfile, // Added the correct function here
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  resetInstructorPassword,
};