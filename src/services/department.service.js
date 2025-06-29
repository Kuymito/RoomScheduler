import axios from 'axios';

// Detect if running on the server or client to use the correct API URL.
const isServer = typeof window === 'undefined';
const API_URL = isServer ? "https://jaybird-new-previously.ngrok-free.app/api/v1" : "/api";

/**
 * Fetches all departments from the API.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of department objects.
 * @throws {Error} Throws an error if the API request fails.
 */
const getAllDepartments = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/department`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // The ngrok header is only necessary for direct server-to-server requests
        ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
      }
    });
    if (Array.isArray(response.data.payload)) {
        return response.data.payload;
    }
     throw new Error('Invalid data structure for departments from API');
  } catch (error) {
    console.error("Get all departments service error:", {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || "Failed to fetch departments.");
  }
};

// Export the service methods
export const departmentService = {
  getAllDepartments,
};