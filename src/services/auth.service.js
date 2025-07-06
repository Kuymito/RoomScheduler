import axios from 'axios';

// Define a single, consistent API_URL for all backend requests.
const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

const getAuthHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    // This header is necessary to bypass the ngrok warning page.
    'ngrok-skip-browser-warning': 'true'
});

const handleError = (context, error) => {
    console.error(`${context} service error:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed operation: ${context}.`);
};

const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        const token = response.data?.payload?.token || response.data?.token;

        if (token) {
            return response.data.payload || response.data;
        }

        console.error("Login Error: Token not found in backend response.", response.data);
        throw new Error('Invalid response structure from login API.');

    } catch (error) {
        handleError("Login", error);
    }
};

/**
 * Fetches the user's profile information.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} The user's profile data.
 */
const getProfile = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/auth/profile`, { headers: getAuthHeaders(token) });
        
        // --- THIS IS THE FIX ---
        // Check if response.data exists and return it directly.
        // This matches the structure of your API response.
        if (response.data) {
            return response.data;
        }

        // If there's no data, something went wrong.
        throw new Error('No profile data received from API');
        
    } catch (error) {
        handleError("Get profile", error);
    }
};

/**
 * Sends a request to generate a password reset OTP.
 * @param {string} email - The user's email address.
 * @returns {Promise<Object>} The API response.
 */
const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/otp/generate`, { email }, {
             headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (response.data.status !== 'OK') {
            throw new Error(response.data.message || 'Failed to send OTP.');
        }
        return response.data;
    } catch (error) {
        handleError("Forgot Password", error);
    }
};

/**
 * Verifies the provided OTP for a given email.
 * @param {string} email - The user's email.
 * @param {string} otp - The one-time password.
 * @returns {Promise<Object>} An object indicating success or failure.
 */
const verifyOtp = async (email, otp) => {
    try {
        const response = await axios.post(`${API_URL}/otp/validate`, { email, otp }, {
             headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (response.data.payload === true) {
            return { success: true, message: "OTP verified successfully." };
        } else {
            throw new Error(response.data.message || "Invalid OTP.");
        }
    } catch (error) {
        handleError("Verify OTP", error);
    }
};

/**
 * Resets the user's password using a verified OTP.
 * @param {object} resetData - Contains email, otp, and newPassword.
 * @returns {Promise<Object>} The API response.
 */
const resetPassword = async ({ email, otp, newPassword }) => {
    try {
        const response = await axios.post(`${API_URL}/auth/reset-password-with-otp`, {
            email,
            otp,
            newPassword
        }, {
             headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        return response.data;
    } catch (error) {
        handleError("Reset Password", error);
    }
};

/**
 * Changes the currently logged-in user's password.
 * @param {string} currentPassword - The user's current password.
 * @param {string} newPassword - The new password.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} The API response.
 */
const changePassword = async (currentPassword, newPassword, token) => {
    try {
        // The payload object matches the required structure.
        const payload = { currentPassword, newPassword };

        const response = await axios.post(
            `${API_URL}/auth/change-password`,
            payload,
            { headers: getAuthHeaders(token) }
        );
        return response.data;
    } catch (error) {
        handleError("Change password", error);
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