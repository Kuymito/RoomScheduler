import axios from 'axios';

// Detect if running on the server or client to select the correct base URL.
const isServer = typeof window === 'undefined';

// Define the correct, full base URL for all API requests.
const API_URL =  "https://jaybird-new-previously.ngrok-free.app/api/v1" ;

/**
 * Creates the authorization headers for an API request.
 * @param {string} token - The user's JWT token.
 * @returns {object} The headers object.
 */
const getAuthHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    // This header is only necessary for direct server-to-server requests to bypass the ngrok warning page.
     'ngrok-skip-browser-warning': 'true'
});

/**
 * A generic error handler for axios requests.
 * @param {string} context - A string describing the context of the error.
 * @param {Error} error - The error object from the catch block.
 */
const handleError = (context, error) => {
    console.error(`${context} service error:`, {
        message: error.message,
        code: error.code,
        response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed operation: ${context}.`);
};

// --- API Functions with Correctly Formatted URLs ---

/**
 * Fetches all notifications for the current user.
 * @param {string} token - The authorization token.
 * @returns {Promise<Array>} A promise that resolves to an array of notification objects.
 */
const getNotifications = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/notifications`, { headers: getAuthHeaders(token) });
        return response.data.payload || [];
    } catch (error) {
        handleError("Get notifications", error);
    }
};

/**
 * Approves a change request.
 * @param {string|number} changeRequestId - The ID of the change request to approve.
 * @param {string} token - The authorization token.
 */
const approveChangeRequest = async (changeRequestId, token) => {
    try {
        // Correct URL: https://.../api/v1/change-requests/{id}/approve
        await axios.post(`${API_URL}/change-requests/${changeRequestId}/approve`, {}, { headers: getAuthHeaders(token) });
    } catch (error) {
        handleError("Approve change request", error);
    }
};

/**
 * Denies a change request.
 * @param {string|number} changeRequestId - The ID of the change request to deny.
 * @param {string} token - The authorization token.
 */
const denyChangeRequest = async (changeRequestId, token) => {
    try {
        // Correct URL: https://.../api/v1/change-requests/{id}/deny
        await axios.post(`${API_URL}/change-requests/${changeRequestId}/deny`, {}, { headers: getAuthHeaders(token) });
    } catch (error) {
        handleError("Deny change request", error);
    }
};

/**
 * Marks a single notification as read.
 * @param {string|number} notificationId - The ID of the notification to mark as read.
 * @param {string} token - The authorization token.
 */
const markNotificationAsRead = async (notificationId, token) => {
    try {
        // Correct URL: https://.../api/v1/notifications/{id}/read
        await axios.post(`${API_URL}/notifications/${notificationId}/read`, {}, { headers: getAuthHeaders(token) });
    } catch (error) {
        handleError("Mark notification as read", error);
    }
};

export const notificationService = {
    getNotifications,
    approveChangeRequest,
    denyChangeRequest,
    markNotificationAsRead
};