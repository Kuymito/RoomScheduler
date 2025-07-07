import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

const getAuthenticationHeaders = async (token) => {
    let authenticationToken = token;
    if (!authenticationToken) {
        const session = await getSession();
        authenticationToken = session?.accessToken;
    }
    if (!authenticationToken) {
        console.warn('Authentication token was not found.');
    }
    return {
        'Content-Type': 'application/json',
        'accept': '*/*',
        ...(authenticationToken && { 'Authorization': `Bearer ${authenticationToken}` }),
        'ngrok-skip-browser-warning': 'true'
    };
};

const handleApiResponse = (response) => {
    if (response.status >= 200 && response.status < 300) {
        const responseData = response.data;
        if (responseData && Array.isArray(responseData.payload)) {
            return responseData.payload;
        }
        if (Array.isArray(responseData)) {
            return responseData;
        }
        return responseData || {};
    }
    const errorData = response.data || { message: 'An unknown error occurred' };
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
};

const getAllRooms = async (token) => {
    try {
        const headers = await getAuthenticationHeaders(token);
        const response = await axios.get(`${API_URL}/room`, { headers });
        return handleApiResponse(response);
    } catch (error) {
        console.error("getAllRooms service error:", error.message);
        throw error;
    }
};

const updateRoom = async (roomId, roomUpdateDto, token) => {
    try {
        const headers = await getAuthenticationHeaders(token);
        const response = await axios.patch(`${API_URL}/room/${roomId}`, roomUpdateDto, { headers });
        return handleApiResponse(response);
    } catch (error) {
        console.error(`updateRoom service error for room ${roomId}:`, error.message);
        throw error;
    }
};

// This bundles your functions into the roomService object that your page expects.
export const roomService = {
  getAllRooms,
  updateRoom,
};