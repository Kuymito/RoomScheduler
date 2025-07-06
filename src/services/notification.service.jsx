import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

/**
 * A robust helper function to create authorization headers.
 * It will use the provided token, but if it's missing, it will attempt
 * to get the token from the current session.
 * @param {string} [token] - Optional token for server-side requests.
 * @returns {Promise<Object>} An object containing the necessary headers.
 */
const getAuthHeaders = async (token) => {
    let authToken = token;
    if (!authToken) {
        const session = await getSession();
        authToken = session?.accessToken;
    }

    if (!authToken) {
        // This is the point where the "Bearer undefined" error originates.
        // We now explicitly handle it.
        console.warn('Authentication token could not be found.');
    }

    return {
        'Content-Type': 'application/json',
        'accept': '*/*',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        'ngrok-skip-browser-warning': 'true',
    };
};

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
 * @param {string} [token] - Optional token for server-side calls.
 * @returns {Promise<Array>} A promise that resolves to an array of notification objects.
 */
const getNotifications = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.get(`${API_BASE_URL}/notifications`, { headers });
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
        const headers = await getAuthHeaders(token);
        await axios.post(`${API_BASE_URL}/change-requests/${changeRequestId}/approve`, {}, { headers });
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
        const headers = await getAuthHeaders(token);
        await axios.post(`${API_BASE_URL}/change-requests/${changeRequestId}/deny`, {}, { headers });
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
        const headers = await getAuthHeaders(token);
        await axios.post(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, { headers });
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