import axios from 'axios';

// Detect if the code is running on the server or the client.
const isServer = typeof window === 'undefined';
// Use the full external URL when on the server, and the relative proxy path when on the client.
const API_URL = isServer ? "https://jaybird-new-previously.ngrok-free.app/api/v1" : "/api";

/**
 * Fetches all instructors from the API.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of instructor objects.
 */
const getAllInstructors = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/instructors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // The ngrok header is only necessary for direct server-to-server requests
        ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
      }
    });
    if (Array.isArray(response.data.payload)) {
        return response.data.payload;
    }
     throw new Error('Invalid data structure for instructors from API');
  } catch (error) {
    console.error("Get all instructors service error:", {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || "Failed to fetch instructors.");
  }
};

/**
 * Fetches a single instructor by their ID from the API.
 * @param {string} instructorId - The ID of the instructor to fetch.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Object>} A promise that resolves to a single instructor object.
 */
const getInstructorById = async (instructorId, token) => {
  try {
    const response = await axios.get(`${API_URL}/instructors/${instructorId}`, {
       headers: {
        'Authorization': `Bearer ${token}`,
        ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
      }
    });
    if (response.data && response.data.payload) {
      return response.data.payload;
    }
     throw new Error('Invalid data structure for single instructor from API');
  } catch (error) {
    console.error(`Get instructor by ID (${instructorId}) service error:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to fetch instructor ${instructorId}.`);
  }
};

/**
 * Creates a new instructor via a POST request.
 * @param {object} instructorData - An object with the instructor details.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Object>} A promise that resolves to the API response.
 */
const createInstructor = async (instructorData, token) => {
  try {
    // Client-side calls should always go to the local proxy.
    const response = await axios.post(`/api/instructors`, instructorData, {
       headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Create instructor service error:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to create instructor.`);
  }
};


export const instructorService = {
  getAllInstructors,
  getInstructorById,
  createInstructor,
};