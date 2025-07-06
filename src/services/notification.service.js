import axios from 'axios';

// Define the base URL for all API requests.
const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

/**
 * Creates the authorization headers for an API request.
 * @param {string} token - The user's JWT token.
 * @returns {object} The headers object.
 */
const getAuthHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
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
 * Fetches all change requests for the admin.
 * @param {string} token - The authorization token.
 * @returns {Promise<Array>} A promise that resolves to an array of change request objects.
 */
const getChangeRequests = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/change-requests`, { headers: getAuthHeaders(token) });
        return response.data.payload || [];
    } catch (error) {
        handleError("Get change requests", error);
    }
};

/**
 * Submits a change request.
 * @param {object} requestData - The data for the change request.
 * @param {string} token - The authorization token.
 * @returns {Promise<any>} The response from the API.
 */
const submitChangeRequest = async (requestData, token) => {
    try {
        const response = await axios.post(`${API_URL}/change-requests`, requestData, { headers: getAuthHeaders(token) });
        return response.data;
    } catch (error) {
        handleError("Submit change request", error);
    }
};

/**
 * Approves a change request.
 * @param {string|number} changeRequestId - The ID of the change request to approve.
 * @param {string} token - The authorization token.
 */
const approveChangeRequest = async (changeRequestId, token) => {
    try {
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
        await axios.post(`${API_URL}/notifications/${notificationId}/read`, {}, { headers: getAuthHeaders(token) });
    } catch (error) {
        handleError("Mark notification as read", error);
    }
};

export const notificationService = {
    getNotifications,
    getChangeRequests,
    submitChangeRequest,
    approveChangeRequest,
    denyChangeRequest,
    markNotificationAsRead
};