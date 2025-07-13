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

/**
 * Fetches all shifts from the API.
 * @param {string} token - The authorization token.
 * @returns {Promise<Array>} A promise that resolves to an array of shift objects.
 */
export async function getAllShifts(token) {
    try {
        const response = await axios.get(`${API_URL}/shifts`, {
            headers: getAuthHeaders(token)
        });

        if (response.data && Array.isArray(response.data.payload)) {
            return response.data.payload;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error(`Get all shifts service error:`, {
            message: error.message,
            code: error.code,
            response: error.response ? error.response.data : 'No response data'
        });
        throw new Error(error.response?.data?.message || `Failed to fetch shifts.`);
    }
};