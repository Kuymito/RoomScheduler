import axios from 'axios';

// Detect if the code is running on the server or the client.
const isServer = typeof window === 'undefined';
// Use the full external URL when on the server, and the relative proxy path when on the client.
const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1" ;

/**
 * Fetches all classes from the API.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of class objects.
 */
const getAllClasses = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/class`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true' 
      }
    });
    if (response.data && Array.isArray(response.data.payload)) {
        return response.data.payload;
    }
    throw new Error('Invalid data structure from API');
  } catch (error) {
    console.error("Get all classes service error:", {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || "Failed to fetch classes.");
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
       headers: {
        'Authorization': `Bearer ${token}`,
        ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
      }
    });
    if (response.data && response.data.payload) {
      return response.data.payload;
    }
     throw new Error('Invalid data structure for single class from API');
  } catch (error) {
    console.error(`Get class by ID (${classId}) service error:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to fetch class ${classId}.`);
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
    // Client-side calls should always go to the local proxy.
    const response = await axios.patch(`/api/class/${classId}`, classData, {
       headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Update class by ID (${classId}) service error:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to update class ${classId}.`);
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
  getClassById,
  patchClass,
  getAllShifts,
};