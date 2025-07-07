import axios from 'axios';

const API_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

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
    // By removing the try/catch, any error from axios will now be caught by the component.
    const response = await axios.get(`${API_URL}/shifts`, { 
        headers: getAuthHeaders(token) 
    });

    // This logic correctly checks for a payload or a direct array.
    if (response.data && Array.isArray(response.data.payload)) {
        return response.data.payload;
    }
    if (Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

export const shiftService = {
    getAllShifts,
};