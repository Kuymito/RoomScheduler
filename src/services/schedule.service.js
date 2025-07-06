// src/services/schedule.service.js
import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

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

const handleResponse = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response.data?.payload || [];
    }
    const errorData = response.data || { message: 'An unknown error occurred' };
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
};

export const getAllSchedules = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.get(`${API_BASE_URL}/schedule`, { headers });
        return handleResponse(response);
    } catch (error) {
        console.error("getAllSchedules service error:", error.message);
        throw error;
    }
};

export const createSchedule = async (scheduleData, token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.post(`${API_BASE_URL}/schedule`, scheduleData, { headers });
        return handleResponse(response);
    } catch (error) {
        console.error("createSchedule service error:", error.message);
        throw error;
    }
};

/**
 * Fetches the schedule for the currently authenticated instructor.
 * @param {string} [token] - Optional token for server-side calls.
 * @returns {Promise<Array>} A promise that resolves to an array of schedule objects.
 */
export const getMySchedules = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.get(`${API_BASE_URL}/schedule/my-schedule`, { headers });
        return handleResponse(response);
    } catch (error) {
        console.error("getMySchedules service error:", error.message);
        throw error;
    }
};

export const scheduleService = {
  getAllSchedules,
  createSchedule,
  getMySchedules,
};