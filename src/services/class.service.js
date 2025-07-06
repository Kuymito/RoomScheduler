import axios from 'axios';

// Detect if the code is running on the server or the client.
const isServer = typeof window === 'undefined';
// Use the full external URL when on the server, and the relative proxy path when on the client.
const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1" ;

/**
 * Creates the authorization headers for an API request.
 * @param {string} token - The user's JWT token.
 * @returns {object} The headers object.
 */
const getAuthHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    // This header is necessary to bypass the ngrok warning page on server-side requests.
    'ngrok-skip-browser-warning': 'true'
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
 * Fetches all classes from the API.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of class objects.
 */
const getAllClasses = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/class`, {
      headers: getAuthHeaders(token)
    });
    if (response.data && Array.isArray(response.data.payload)) {
        return response.data.payload;
    }
    throw new Error('Invalid data structure from API');
  } catch (error) {
    handleError("Get all classes", error);
  }
};

/**
 * Fetches only the classes assigned to the currently authenticated instructor.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of class objects.
 */
const getMyClasses = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/class/my-classes`, {
      headers: getAuthHeaders(token)
    });
    if (response.data && Array.isArray(response.data.payload)) {
        return response.data.payload;
    }
    throw new Error('Invalid data structure from API');
  } catch (error) {
    handleError("Get My Classes", error);
  }
};

/**
 * Fetches a single class by its ID from the API.
 * @param {string} classId - The ID of the class to fetch.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Object>} A promise that resolves to a single class object.
 */
const getClassById = async (classId, token) => {
  try {
    const response = await axios.get(`${API_URL}/class/${classId}`, {
       headers: getAuthHeaders(token)
    });
    if (response.data && response.data.payload) {
      return response.data.payload;
    }
     throw new Error('Invalid data structure for single class from API');
  } catch (error) {
    handleError(`Get class by ID (${classId})`, error);
  }
};

/**
 * Partially updates an existing class by its ID using PATCH.
 * @param {string} classId - The ID of the class to update.
 * @param {object} classData - An object containing only the fields to be updated.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Object>} A promise that resolves to the API response.
 */
const patchClass = async (classId, classData, token) => {
  try {
    const response = await axios.patch(`${API_URL}/class/${classId}`, classData, {
       headers: getAuthHeaders(token)
    });
    return response.data;
  } catch (error) {
    handleError(`Update class by ID (${classId})`, error);
  }
};

/**
 * Fetches all shifts from the API.
 * @param {string} token - The authorization token.
 * @returns {Promise<Array>} A promise that resolves to an array of shift objects.
 */
const getAllShifts = async (token) => {
  try {
      const response = await axios.get(`${API_URL}/shifts`, { headers: getAuthHeaders(token) });
      return response.data.payload || [];
  } catch (error) {
      handleError("Get all shifts", error);
  }
};


export const classService = {
  getAllClasses,
  getMyClasses,
  getClassById,
  patchClass,
  getAllShifts,
};