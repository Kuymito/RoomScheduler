// src/services/auth.service.js
import axios from 'axios';

// The API_URL now points to the local API directory for client-side calls.
// The server-side proxy will handle forwarding to the actual backend.
const LOCAL_API_URL = "/api";
const SERVER_API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

const handleError = (context, error) => {
    console.error(`${context} service error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed operation: ${context}.`);
};

const getAuthHeaders = (token, contentType = 'application/json') => ({
    'Authorization': `Bearer ${token}`,
    // This header is necessary to bypass the ngrok warning page.
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': contentType,
});

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
    const url = isServer ? `${SERVER_API_URL}/auth/profile` : `${LOCAL_API_URL}/profile`;

    try {
        const response = await axios.get(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                // Add ngrok header only on server-side calls
                ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
            }
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

/**
 * Resets a specific instructor's password (Admin action).
 * @param {string|number} instructorId - The ID of the instructor whose password is to be reset.
 * @param {string} newPassword - The new password to set.
 * @param {string} token - The admin's authorization token.
 * @returns {Promise<Object>} The response from the API.
 */
const resetInstructorPassword = async (instructorId, newPassword, token) => {
  // Always call the local, non-conflicting API route from the client.
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

const updateProfile = async (profileData, token) => {
    try {
        let authToken = token;
        // --- THIS IS THE FIX ---
        // If a token is not provided, attempt to get it directly from the session.
        if (!authToken) {
            const session = await getSession();
            authToken = session?.accessToken;
        }

        // Now, perform the validation on the token we have.
        if (typeof authToken !== 'string' || !authToken) {
            throw new Error("Authentication token is invalid or missing. Please sign in again.");
        }

        // Decode the token to get the instructor ID from its claims.
        const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
        const instructorId = tokenPayload.instructorId;

        if (!instructorId) {
            throw new Error("Instructor ID could not be found in the token.");
        }

        // Create the plain JavaScript object that matches the required JSON structure.
        const payload = {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            phone: profileData.phoneNumber,
            degree: profileData.degree,
            major: profileData.major,
            address: profileData.address,
            departmentId: profileData.departmentId,
            profile: profileData.avatarUrl
        };
        
        // Use the correct endpoint with the instructor's ID in the URL.
        const response = await axios.patch(
            `${LOCAL_API_URL}/instructors/${instructorId}`, // The endpoint now includes the ID.
            payload,
            { 
                headers: getAuthHeaders(authToken, 'application/json')
            }
        );
        
        return response.data;

    } catch (error) {
        handleError("Update profile", error);
    }
};

export const authService = {
  login,
  getProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  resetInstructorPassword,
  updateProfile
};