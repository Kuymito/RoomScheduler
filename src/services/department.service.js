import axios from 'axios';

// Define the base URLs for server-side and client-side calls
const SERVER_API_URL = "https://employees-depend-refuse-struct.trycloudflare.com/api/v1";

/**
 * Fetches all departments from the API.
 * This function is "universal" - it works on both the client and server.
 * It determines the correct API endpoint based on the execution environment.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of department objects.
 * @throws {Error} Throws an error if the API request fails or the token is missing.
 */
const getAllDepartments = async (token) => {
  // 1. Ensure a token is provided before making the request.
  if (!token) {
    console.error("Department Service Error: Authentication token is missing.");
    throw new Error("Authentication token is required to fetch departments.");
  }

  // 2. Determine if the code is running on the server or the client.
  const isServer = typeof window === 'undefined';
  
  // 3. Select the appropriate URL based on the environment.
  const url = `${SERVER_API_URL}/department`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // The ngrok header is only necessary for direct server-to-server requests.
        ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
      }
    });

    // 4. Validate the response and its structure before returning.
    if (response && response.data && Array.isArray(response.data.payload)) {
        return response.data.payload;
    }
    
    // If the payload is not an array or data is missing, throw a specific error.
    console.error("Department Service Error: Invalid data structure received from API.", response.data);
    throw new Error('Invalid data structure for departments from API');

  } catch (error) {
    // 5. Log the detailed error for better debugging.
    console.error("Get all departments service error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: url,
    });
    
    // Throw a more user-friendly error to be caught by the calling component.
    throw new Error(error.response?.data?.message || "Failed to fetch departments. Please check the network connection and try again.");
  }
};

// Export the service methods
export const departmentService = {
  getAllDepartments,
};