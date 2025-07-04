import axios from 'axios';

// Detect if the code is running on the server or the client.
const isServer = typeof window === 'undefined';

// --- THE FIX ---
// Always use the full, absolute ngrok URL for all API requests,
// regardless of whether they are from the server or the client.
const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

/**
 * Creates the authorization headers for an API request.
 * @param {string} token - The user's JWT token.
 * @returns {object} The headers object.
 */
const getAuthHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    // This header is only necessary for direct server-to-server requests.
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
 * Fetches all instructors from the API.
 * @param {string} token - The authorization token.
 * @returns {Promise<Array>} A promise that resolves to an array of instructor objects.
 */
const getAllInstructors = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/instructors`, { headers: getAuthHeaders(token) });
        if (Array.isArray(response.data.payload)) {
            return response.data.payload;
        }
        throw new Error('Invalid data structure for instructors from API');
    } catch (error) {
        handleError("Get all instructors", error);
    }
};

/**
 * Fetches all departments from the API.
 * @param {string} token - The authorization token.
 * @returns {Promise<Array>} A promise that resolves to an array of department objects.
 */
const getAllDepartments = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/department`, { headers: getAuthHeaders(token) });
        if (Array.isArray(response.data.payload)) {
            return response.data.payload;
        }
        throw new Error('Invalid data structure for departments from API');
    } catch (error) {
        handleError("Get all departments", error);
    }
};

/**
 * Creates a new instructor.
 * @param {object} instructorData - The instructor data from the form.
 * @param {number} departmentId - The ID of the selected department.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} A promise that resolves to the newly created instructor object.
 */
const createInstructor = async (instructorData, departmentId, token) => {
  try {
      // --- THIS IS THE FIX ---
      // Construct the payload exactly as the backend requires.
      const payload = {
          firstName: instructorData.firstName,
          lastName: instructorData.lastName,
          email: instructorData.email,
          phone: instructorData.phone,
          degree: instructorData.degree,
          major: instructorData.major,
          address: instructorData.address,
          profile: instructorData.profile,
          // Explicitly add the departmentId to the payload
          departmentId: departmentId,
          password: "123", // Auto-assign a default password
          roleId: 2,       // Auto-assign the instructor role
      };

      const response = await axios.post(`${API_URL}/instructors`, payload, { headers: getAuthHeaders(token) });
      return response.data.payload;
  } catch (error) {
      handleError("Create instructor", error);
  }
};

/**
 * Updates an instructor's status.
 * @param {string} instructorId - The ID of the instructor.
 * @param {boolean} isArchived - The new archive status.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} A promise that resolves to the updated instructor object.
 */
const updateInstructorStatus = async (instructorId, isArchived, token) => {
    try {
        const payload = { is_archived: isArchived };
        const response = await axios.patch(`${API_URL}/instructors/${instructorId}/archive`, payload, { headers: getAuthHeaders(token) });
        return response.data.payload;
    } catch (error) {
        handleError("Update instructor status", error);
    }
};

/**
 * Partially updates an instructor's details.
 * @param {string} instructorId - The ID of the instructor.
 * @param {object} instructorPayload - The fields to update.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} A promise that resolves to the updated instructor object.
 */
const patchInstructor = async (instructorId, instructorPayload, token) => {
    try {
        const response = await axios.patch(`${API_URL}/instructors/${instructorId}`, instructorPayload, { headers: getAuthHeaders(token) });
        return response.data.payload;
    } catch (error) {
        handleError("Patch instructor", error);
    }
};

/**
 * Fetches a single instructor by their ID.
 * @param {string} instructorId - The ID of the instructor.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} A promise that resolves to the instructor object.
 */
const getInstructorById = async (instructorId, token) => {
    try {
        const response = await axios.get(`${API_URL}/instructors/${instructorId}`, { headers: getAuthHeaders(token) });
        if (response.data && response.data.payload) {
            return response.data.payload;
        }
        throw new Error('Invalid data structure for single instructor from API');
    } catch (error) {
        handleError(`Get instructor by ID (${instructorId})`, error);
    }
};

export const instructorService = {
    getAllInstructors,
    getAllDepartments,
    createInstructor,
    updateInstructorStatus,
    patchInstructor,
    getInstructorById,
};