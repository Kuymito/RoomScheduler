// src/services/api.js
import axios from 'axios';
import { getSession } from 'next-auth/react';

/**
 * 1. Centralized API URL
 * The base URL for the backend API is retrieved from the environment variables.
 * This ensures that the URL is configured in one place and can be easily changed.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL is not defined in your environment variables. Please check your .env.local file.");
}

/**
 * 2. Configured Axios Instance
 * A pre-configured instance of axios is created with the base URL.
 * This instance will be used for all API requests throughout the application.
 */
const api = axios.create({
  baseURL: API_URL,
});

/**
 * 3. Universal Authentication Header Helper
 * Creates the necessary headers for an authenticated API request.
 * If a token is provided (common for server-side rendering), it uses that.
 * If no token is provided and the code is running on the client-side,
 * it automatically tries to get the token from the user's session.
 * @param {string} [token] - Optional token for server-side or pre-fetched requests.
 * @returns {Promise<object>} A promise that resolves to the headers object.
 * @throws {Error} If no token can be found.
 */
export const getAuthHeaders = async (token) => {
    let authToken = token;
    if (!authToken && typeof window !== 'undefined') {
        const session = await getSession();
        authToken = session?.accessToken;
    }

    if (!authToken) {
        throw new Error("Authentication token is required for this request.");
    }
    
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        // This header is useful for bypassing ngrok's browser warning page during development.
        'ngrok-skip-browser-warning': 'true',
    };
};

/**
 * 4. Generic Error Handler
 * Creates a standardized error from an axios error object for consistent error handling.
 * @param {string} context - A string describing the action that failed (e.g., "fetching instructors").
 * @param {Error} error - The original error object from the catch block.
 * @throws {Error} Throws a new, more user-friendly error.
 */
export const handleError = (context, error) => {
    console.error(`Service error while ${context}:`, {
        message: error.message,
        code: error.code,
        response: error.response ? error.response.data : 'No response data'
    });
    // Use the error message from the backend if available, otherwise provide a generic message.
    throw new Error(error.response?.data?.message || `Failed while ${context}.`);
};

/**
 * 5. Generic Response Handler
 * Processes the API response and consistently extracts the data payload.
 * @param {import('axios').AxiosResponse} response - The Axios response object.
 * @returns {any} The payload from the API response or the full data object.
 */
export const handleResponse = (response) => {
    // Check for a 'payload' key and return it if it exists
    if (response.data && typeof response.data.payload !== 'undefined') {
        return response.data.payload;
    }
    // For responses that are valid but don't use a 'payload' key (e.g., login)
    if (response.data) {
        return response.data;
    }
    // Handle successful but empty responses (e.g., 204 No Content from a DELETE)
    return null;
};

export default api;