import axios from 'axios';

// Define the base URLs for server-side and client-side calls
const SERVER_API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";
const LOCAL_API_URL = "/api"; // This points to the Next.js API proxy

/**
 * Fetches all classes from the API.
 * This function is "universal" - it works on both the client and server.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of class objects.
 */
const getAllClasses = async (token) => {
  // Ensure a token is provided before making the request.
  if (!token) {
    throw new Error("Authentication token is required to fetch classes.");
  }

  // Determine if the code is running on the server or the client.
  const isServer = typeof window === 'undefined';
  const url = isServer ? `${SERVER_API_URL}/class` : `${LOCAL_API_URL}/class`;

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
    console.error("Invalid data structure for classes from API", response.data);
    throw new Error('Invalid data structure for classes from API');
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
  if (!token) {
    throw new Error("Authentication token is required.");
  }
  const isServer = typeof window === 'undefined';
  const url = isServer ? `${SERVER_API_URL}/class/${classId}` : `${LOCAL_API_URL}/class/${classId}`;

  try {
    const response = await axios.get(url, {
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
    const response = await axios.patch(`${LOCAL_API_URL}/class/${classId}`, classData, {
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
 * Creates a new class via a POST request.
 * @param {object} classData - An object with the class details matching the API spec.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Object>} A promise that resolves to the API response.
 */
const createClass = async (classData, token) => {
  try {
    const response = await axios.post(`${LOCAL_API_URL}/class`, classData, {
       headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Create class service error:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to create class.`);
  }
};

/**
 * Assigns an instructor to a class for a specific day.
 * @param {object} assignmentData - The assignment data.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} A promise that resolves to the API response.
 */
const assignInstructorToClass = async (assignmentData, token) => {
    try {
        const response = await axios.post(`${LOCAL_API_URL}/class/assign-instructor`, assignmentData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Assign instructor service error:', {
            message: error.message,
            response: error.response ? error.response.data : 'No response',
        });
        throw new Error(error.response?.data?.message || 'Failed to assign instructor.');
    }
};

/**
 * Unassigns an instructor from a class for a specific day.
 * @param {object} unassignmentData - The unassignment data.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} A promise that resolves to the API response.
 */
const unassignInstructorFromClass = async (unassignmentData, token) => {
    try {
        const response = await axios.post(`${LOCAL_API_URL}/class/unassign-instructor`, unassignmentData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Unassign instructor service error:', {
            message: error.message,
            response: error.response ? error.response.data : 'No response',
        });
        throw new Error(error.response?.data?.message || 'Failed to unassign instructor.');
    }
};

/**
 * Fetches classes assigned to the currently authenticated instructor.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of class objects.
 */
const getAssignedClasses = async (token) => {
  if (!token) {
    throw new Error("Authentication token is required to fetch assigned classes.");
  }

  const isServer = typeof window === 'undefined';
  const url = isServer ? `${SERVER_API_URL}/class/my-classes` : `${LOCAL_API_URL}/class/my-classes`;

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
    console.error("Invalid data structure for assigned classes from API", response.data);
    throw new Error('Invalid data structure for assigned classes from API');
  } catch (error) {
    console.error("Get assigned classes service error:", {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || "Failed to fetch assigned classes.");
  }
};

export const classService = {
  getAllClasses,
  getClassById,
  patchClass,
  createClass,
  assignInstructorToClass,
  unassignInstructorFromClass,
  getAssignedClasses,
};