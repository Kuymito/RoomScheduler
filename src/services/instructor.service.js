import axios from 'axios';

// Detect if the code is running on the server or the client.
const isServer = typeof window === 'undefined';
// Use the full external URL when on the server, and the relative proxy path when on the client.
const API_URL = isServer ? "https://jaybird-new-previously.ngrok-free.app/api/v1" : "/api";

/**
 * Creates the authorization headers for an API request.
 * @param {string} token - The user's JWT token.
 * @returns {object} The headers object.
 */
const getAuthHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    // The ngrok header is only necessary for direct server-to-server requests
    ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
});

/**
 * A generic error handler for axios requests.
 * @param {string} context - A string describing the context of the error (e.g., "Get all instructors").
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
        const response = await axios.get(`${API_URL}/departments`, { headers: getAuthHeaders(token) });
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
 * @param {object} instructorPayload - The instructor data from the form.
 * @param {string} token - The authorization token.
 * @returns {Promise<Object>} A promise that resolves to the newly created instructor object.
 */
const createInstructor = async (instructorPayload, token) => {
    try {
        const payload = {
            ...instructorPayload,
            password: "123", // Auto-assign password
            roleId: 2,       // Auto-assign role
        };
        const response = await axios.post(`${API_URL}/instructors`, payload, { headers: getAuthHeaders(token) });
        return response.data.payload;
    } catch (error) {
        handleError("Create instructor", error);
    }
};

/**
 * Updates an instructor's status (archives or unarchives them).
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

// You can keep getInstructorById if you use it on the details page.
const getInstructorById = async (instructorId, token) => {
  try {
    const response = await axios.get(`${API_URL}/instructors/${instructorId}`, {
        headers: getAuthHeaders(token)
    });
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
  getAllDepartments, // Export the new function
  createInstructor,
  updateInstructorStatus,
  patchInstructor, // This would be used on an edit page
  getInstructorById,
};