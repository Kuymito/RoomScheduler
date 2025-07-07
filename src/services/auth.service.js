import axios from 'axios';
import { getSession } from 'next-auth/react'; // Import getSession

// Define a single, consistent API_URL for all backend requests.
const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

const getAuthHeaders = (token, contentType = 'application/json') => ({
    'Authorization': `Bearer ${token}`,
    // This header is necessary to bypass the ngrok warning page.
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': contentType,
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

const getProfile = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/auth/profile`, { headers: getAuthHeaders(token) });
        
        if (response.data) {
            return response.data;
        }

        throw new Error('No profile data received from API');
        
    } catch (error) {
        handleError("Get profile", error);
    }
};


/**
 * Updates the currently authenticated instructor's profile using a JSON payload.
 * @param {Object} profileData - An object containing the instructor's profile fields.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} The API response.
 */
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
            `${API_URL}/instructors/${instructorId}`, // The endpoint now includes the ID.
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

const changePassword = async (currentPassword, newPassword, token) => {
    try {
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
    updateProfile, // The updated function
    forgotPassword,
    verifyOtp,
    resetPassword,
    changePassword,
};
