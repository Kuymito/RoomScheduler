import axios from 'axios';

// Define the base URLs for server-side and client-side calls
const SERVER_API_URL = "https://employees-depend-refuse-struct.trycloudflare.com/api/v1";

/**
 * Fetches all majors from the API.
 * This function is "universal" - it works on both the client and server.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of major objects.
 */
const getAllMajors = async (token) => {
  if (!token) {
    throw new Error("Authentication token is required to fetch majors.");
  }

  const isServer = typeof window === 'undefined';
  const url = `${SERVER_API_URL}/major`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
      }
    });

    if (response.data && Array.isArray(response.data.payload)) {
        return response.data.payload;
    }
    console.error("Invalid data structure for majors from API", response.data);
    throw new Error('Invalid data structure for majors from API');
  } catch (error) {
    console.error("Get all majors service error:", {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || "Failed to fetch majors.");
  }
};

export const majorService = {
  getAllMajors,
};