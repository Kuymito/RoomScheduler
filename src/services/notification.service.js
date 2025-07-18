import axios from 'axios';

// Define the base URLs for server-side and client-side calls
const SERVER_API_URL = "https://employees-depend-refuse-struct.trycloudflare.com/api/v1";

/**
 * Creates the authorization headers for an API request.
 * @param {string} token - The user's JWT token.
 * @param {boolean} isServer - Flag to indicate if the call is from the server.
 * @returns {object} The headers object.
 */
const getAuthHeaders = (token, isServer) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
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
    const isServer = typeof window === 'undefined';
    const url = `${SERVER_API_URL}/notifications`;
    try {
        const response = await axios.get(url, { headers: getAuthHeaders(token, isServer) });
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
    const isServer = typeof window === 'undefined';
    const url = `${SERVER_API_URL}/change-requests`;
    try {
        const response = await axios.get(url, { headers: getAuthHeaders(token, isServer) });
        return response.data.payload || [];
    } catch (error) {
        handleError("Get change requests", error);
    }
};

/**
 * Submits a change request or a booking. This is a client-side only function.
 * @param {object} requestData - The data for the request.
 * @param {string} token - The authorization token.
 * @returns {Promise<any>} The response from the API.
 */
const submitChangeRequest = async (requestData, token) => {
    const url = `${LOCAL_API_URL}/change-requests`;
    
    try {
        // Dynamically build the payload based on whether it's a booking or a change request.
        const payload = {
            instructorId: Number(requestData.instructorId),
            newRoomId: Number(requestData.newRoomId),
            effectiveDate: requestData.effectiveDate,
            description: requestData.description || ''
        };

        // If eventName is present, it's a booking for a conference room.
        if (requestData.eventName) {
            payload.eventName = requestData.eventName;
            payload.scheduleId = null; // Set scheduleId to null for bookings.
        } else {
            // Otherwise, it's a standard change request.
            payload.scheduleId = Number(requestData.scheduleId);
        }

        const response = await axios.post(
            url,
            payload,
            {
                headers: getAuthHeaders(token, false) // isServer is always false for this function
            }
        );
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
    const isServer = typeof window === 'undefined';
    const url = `${SERVER_API_URL}/change-requests/${changeRequestId}/approve`;
    try {
        await axios.post(url, {}, { headers: getAuthHeaders(token, isServer) });
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
    const isServer = typeof window === 'undefined';
    const url = `${SERVER_API_URL}/change-requests/${changeRequestId}/deny`;
    try {
        await axios.post(url, {}, { headers: getAuthHeaders(token, isServer) });
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
    const isServer = typeof window === 'undefined';
    const url = `${SERVER_API_URL}/notifications/${notificationId}/read`;
    try {
        await axios.post(url, {}, { headers: getAuthHeaders(token, isServer) });
    } catch (error) {
        handleError("Mark notification as read", error);
    }
};

/**
 * Marks all unread notifications as read.
 * @param {Array} notifications - The list of all notifications.
 * @param {string} token - The authorization token.
 */
const markAllNotificationsAsRead = async (notifications, token) => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
        return;
    }
    const markAsReadPromises = unreadNotifications.map(notification =>
        markNotificationAsRead(notification.notificationId, token)
    );
    try {
        await Promise.all(markAsReadPromises);
    } catch (error) {
        console.error("An error occurred while marking all notifications as read.", error);
    }
};

export const notificationService = {
    getNotifications,
    getChangeRequests,
    submitChangeRequest,
    approveChangeRequest,
    denyChangeRequest,
    markNotificationAsRead,
    markAllNotificationsAsRead
};