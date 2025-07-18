// src/services/schedule.service.js
import axios from 'axios';
import { getSession } from 'next-auth/react';

// The base URL for your backend API.
const API_BASE_URL = 'https://employees-depend-refuse-struct.trycloudflare.com/api/v1';

/**
 * A helper function to create authorization headers.
 * It can use a provided token (for server-side calls) or get it from the session (for client-side calls).
 * @param {string} [token] - Optional token for server-side requests.
 * @returns {Promise<Object>} An object containing the necessary headers.
 */
const getAuthHeaders = async (token) => {
    let authToken = token;
    if (!authToken) {
        const session = await getSession();
        authToken = session?.accessToken;
    }

    if (!authToken) {
        console.warn('Authentication token not found in session.');
    }

    return {
        'Content-Type': 'application/json',
        'accept': '*/*',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        'ngrok-skip-browser-warning': 'true',
    };
};

/**
 * A generic function to handle API responses.
 * It checks for successful responses and extracts the 'payload'.
 * @param {import('axios').AxiosResponse} response - The Axios response object.
 * @returns {any} The payload from the API response.
 * @throws {Error} Throws an error for non-successful responses.
 */
const handleResponse = (response) => {
    if (response.status >= 200 && response.status < 300) {
        if (response.data && typeof response.data.payload !== 'undefined') {
            return response.data.payload;
        }
        if(response.data){
            return response.data;
        }
        return null; // Handle successful but empty responses (e.g., 204 No Content)
    }
    const errorData = response.data || { message: 'An unknown error occurred' };
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
};

/**
 * Fetches all schedule entries from the API.
 * @param {string} [token] - Optional token for server-side calls.
 * @returns {Promise<Array>} A promise that resolves to an array of schedule objects.
 */
export const getAllSchedules = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.get(`${API_BASE_URL}/schedule`, { headers });
        
        const payload = handleResponse(response);
        if (Array.isArray(payload)) {
            const uniqueSchedules = new Map();
            payload.forEach(schedule => {
                if (schedule) {
                    if (schedule.scheduleId) { // Handle regular class schedules with an ID
                        if (!uniqueSchedules.has(schedule.scheduleId)) {
                            uniqueSchedules.set(schedule.scheduleId, schedule);
                        }
                    } else { // Handle bookings which have scheduleId: null
                        // Create a unique key for bookings to prevent duplicates
                        const day = schedule.dayDetails?.[0]?.dayOfWeek;
                        if (schedule.roomId && day) {
                            const bookingKey = `booking-${schedule.roomId}-${day}-${schedule.className}`;
                            if (!uniqueSchedules.has(bookingKey)) {
                                uniqueSchedules.set(bookingKey, schedule);
                            }
                        }
                    }
                }
            });
            return Array.from(uniqueSchedules.values());
        }
        
        return payload;
    } catch (error) {
        console.error("getAllSchedules service error:", error.message);
        throw error;
    }
};

/**
 * Fetches the schedule for the currently authenticated instructor.
 * @param {string} [token] - Optional token for server-side calls.
 * @returns {Promise<Array>} A promise that resolves to an array of schedule objects for the instructor.
 */
export const getMySchedule = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.get(`${API_BASE_URL}/schedule/my-schedule`, { headers });
        
        const payload = handleResponse(response);
        if (Array.isArray(payload)) {
            const uniqueSchedules = new Map();
            payload.forEach(schedule => {
                 if (schedule) {
                    if (schedule.scheduleId) { // Handle regular class schedules with an ID
                        if (!uniqueSchedules.has(schedule.scheduleId)) {
                            uniqueSchedules.set(schedule.scheduleId, schedule);
                        }
                    } else { // Handle bookings which have scheduleId: null
                        const day = schedule.dayDetails?.[0]?.dayOfWeek;
                        if (schedule.roomId && day) {
                            const bookingKey = `booking-${schedule.roomId}-${day}-${schedule.className}`;
                            if (!uniqueSchedules.has(bookingKey)) {
                                uniqueSchedules.set(bookingKey, schedule);
                            }
                        }
                    }
                }
            });
            return Array.from(uniqueSchedules.values());
        }
        
        return payload;

    } catch (error) {
        console.error("getMySchedule service error:", error.message);
        throw error;
    }
};

const assignRoomToClass = async (scheduleRequest, token) => {
    const isServer = typeof window === 'undefined';
    const url = isServer ? `${API_BASE_URL}/schedule/assign` : `${API_BASE_URL}/schedule/assign`;
  
    try {
      const response = await axios.post(url, scheduleRequest, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred during assignment.";
      throw new Error(errorMessage);
    }
  };

  /**
 * Deletes a schedule entry by its ID.
 * @param {number} scheduleId - The ID of the schedule to delete.
 * @param {string} token - The authorization token.
 * @returns {Promise<void>}
 */
  const unassignRoomFromClass = async (scheduleId, token) => {
    const isServer = typeof window === 'undefined';
    const url = isServer 
      ? `${API_BASE_URL}/schedule/${scheduleId}` 
      : `${API_BASE_URL}/schedule/${scheduleId}`;
    
    try {
      await axios.delete(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
        }
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete schedule.";
      throw new Error(errorMessage);
    }
  };

  const swapSchedules = async (swapRequest, token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.post(`${API_BASE_URL}/schedule/swap`, swapRequest, { headers });
        return handleResponse(response);
    } catch (error) {
        console.error("swapSchedules service error:", error);
        const errorMessage = error.response?.data?.message || "An unexpected error occurred during the swap.";
        throw new Error(errorMessage);
    }
};

const moveScheduleToRoom = async (scheduleId, newRoomId, token) => {
  try {
      const headers = await getAuthHeaders(token);
      const response = await axios.put(`${API_BASE_URL}/schedule/${scheduleId}/move`, { newRoomId }, { headers });
      return handleResponse(response);
  } catch (error) {
      const message = error.response?.data?.message || "Move failed.";
      throw new Error(message);
  }
};

// Export the service object
export const scheduleService = {
  getAllSchedules,
  getMySchedule,
  assignRoomToClass,
  unassignRoomFromClass,
  swapSchedules,
  moveScheduleToRoom
};