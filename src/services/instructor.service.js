// src/services/instructor.service.js

import axios from 'axios';

const API_URL =  "https://employees-depend-refuse-struct.trycloudflare.com/api/v1";

/**
 * Fetches all instructors from the API.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of instructor objects.
 */
const getAllInstructors = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/instructors`, {
      headers: {
        'Authorization': `Bearer ${token}`
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
        'Authorization': `Bearer ${token}`
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
    const response = await axios.post(`${API_URL}/api/instructors`, instructorData, {
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

/**
 * Updates an existing instructor via a PATCH request.
 * @param {string|number} instructorId - The ID of the instructor to update.
 * @param {object} instructorData - An object with the fields to update.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Object>} A promise that resolves to the API response.
 */
const updateInstructor = async (instructorId, instructorData, token) => {
  try {
    // Use the local API proxy for client-side requests
    const response = await axios.patch(`${API_URL}/api/instructors/${instructorId}`, instructorData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Update instructor service error for ID ${instructorId}:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to update instructor ${instructorId}.`);
  }
};

/**
 * Archives or un-archives an instructor.
 * @param {string|number} instructorId - The ID of the instructor to update.
 * @param {boolean} isArchived - The desired archive status.
 * @param {string} token - The authorization token for the request.
 * @returns {Promise<Object>} A promise that resolves to the API response.
 */
const archiveInstructor = async (instructorId, isArchived, token) => {
  try {
    // This client-side call goes to our new local API route
    const response = await axios.patch(`${API_URL}/api/instructors/${instructorId}/archive`, 
    { is_archived: isArchived }, 
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Archive instructor service error for ID ${instructorId}:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to update archive status for instructor ${instructorId}.`);
  }
};

/**
 * Fetches the schedule for a specific instructor.
 * @param {string|number} instructorId - The ID of the instructor.
 * @param {string} token - The authorization token.
 * @returns {Promise<Array>} A promise that resolves to an array of schedule objects.
 */
const getInstructorSchedule = async (instructorId, token) => {
  try {
    const response = await axios.get(`${API_URL}/schedule/instructor/${instructorId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
      }
    });
    return response.data.payload || [];
  } catch (error) {
    console.error(`Get instructor schedule service error for ID ${instructorId}:`, {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || `Failed to fetch schedule for instructor ${instructorId}.`);
  }
};


export const instructorService = {
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  archiveInstructor, // Added the new archive function
  getInstructorSchedule, // Added the new schedule function
};