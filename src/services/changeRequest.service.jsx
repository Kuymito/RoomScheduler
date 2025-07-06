import axios from 'axios';

const API_BASE_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

const getAuthHeaders = (token) => {
    if (!token) throw new Error('Authentication token not found');
    return {
        'Content-Type': 'application/json',
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
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
 * Creates a new change request for a class schedule.
 * @param {object} requestData - The data for the change request.
 * @param {string} token - The authorization token.
 * @returns {Promise<any>} A promise that resolves to the API response.
 */
const createChangeRequest = async (requestData, token) => {
    try {
        const headers = getAuthHeaders(token);
        const response = await axios.post(`${API_BASE_URL}/change-requests`, requestData, { headers });
        return response.data;
    } catch (error) {
        handleError("Create Change Request", error);
    }
};

export const changeRequestService = {
    createChangeRequest,
};