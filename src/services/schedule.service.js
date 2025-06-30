// src/services/schedule.service.js
import axios from 'axios';
import { getSession } from 'next-auth/react';

// The base URL for your backend API.
const API_BASE_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

/**
 * A helper function to create authorization headers.
 * It can use a provided token (for server-side calls) or get it from the session (for client-side calls).
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
        console.warn('Authentication token not found in session.');
    }

    return {
        'Content-Type': 'application/json',
        'accept': '*/*',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        'ngrok-skip-browser-warning': 'true',
    };
};

/**
 * A generic function to handle API responses.
 * It checks for successful responses and extracts the 'payload'.
 * @param {import('axios').AxiosResponse} response - The Axios response object.
 * @returns {any} The payload from the API response.
 * @throws {Error} Throws an error for non-successful responses.
 */
const handleResponse = (response) => {
    if (response.status >= 200 && response.status < 300) {
        if (response.data && response.data.payload) {
            return response.data.payload;
        }
        return null; // Handle successful but empty responses (e.g., 204 No Content)
    }
    const errorData = response.data || { message: 'An unknown error occurred' };
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
};

/**
 * Fetches all schedule entries from the API.
 * @param {string} [token] - Optional token for server-side calls.
 * @returns {Promise<Array>} A promise that resolves to an array of schedule objects.
 */
export const getAllSchedules = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.get(`${API_BASE_URL}/schedule`, { headers });
        return handleResponse(response);
    } catch (error) {
        console.error("getAllSchedules service error:", error.message);
        throw error;
    }
};

// Export the service object
export const scheduleService = {
  getAllSchedules,
};