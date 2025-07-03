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
        'ngrok-skip-browser-warning': 'true'
    };
};

const handleResponse = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response.data?.payload || [];
    }
    const errorData = response.data || { message: 'An unknown error occurred' };
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
};

export const getAllRooms = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.get(`${API_BASE_URL}/room`, { headers });
        return handleResponse(response);
    } catch (error) {
        console.error("getAllRooms service error:", error.message);
        throw error;
    }
};

export const updateRoom = async (roomId, roomUpdateDto, token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await axios.patch(`${API_BASE_URL}/room/${roomId}`, roomUpdateDto, { headers });
        return handleResponse(response);
    } catch (error) {
        console.error(`updateRoom service error for room ${roomId}:`, error.message);
        throw error;
    }
};

// --- FIX: Add this export block ---
// This bundles your functions into the roomService object that your page expects.
export const roomService = {
  getAllRooms,
  updateRoom,
};