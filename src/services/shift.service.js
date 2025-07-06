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
 * Fetches all shifts from the API.
 * @param {string} token - The authorization token.
 * @returns {Promise<Array>} A promise that resolves to an array of shift objects.
 */
const getAllShifts = async (token) => {
    try {
        const headers = getAuthHeaders(token);
        const response = await axios.get(`${API_BASE_URL}/shifts`, { headers });
        
        // --- THIS IS THE FIX ---
        // The API returns a direct array, not an object with a payload.
        // We check if the response data is an array and return it.
        if (Array.isArray(response.data)) {
            return response.data;
        }
        // If the structure is ever different, fall back to the payload property.
        return response.data.payload || [];

    } catch (error) {
        handleError("Get all shifts", error);
    }
};

export const shiftService = {
    getAllShifts,
};