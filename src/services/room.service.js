// src/services/room.service.js
import api, { getAuthHeaders, handleResponse, handleError } from './api';

export const getAllRooms = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await api.get('/room', { headers });
        return handleResponse(response);
    } catch (error) {
        handleError("fetching all rooms", error);
    }
};

export const getRoomById = async (roomId, token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await api.get(`/room/${roomId}`, { headers });
        return handleResponse(response);
    } catch (error) {
        handleError(`fetching room by ID ${roomId}`, error);
    }
};

export const updateRoom = async (roomId, roomUpdateDto, token) => {
    try {
        // The token is passed from the component, but getAuthHeaders can also
        // fetch it from the session on the client-side if it's not provided.
        const headers = await getAuthHeaders(token);
        const response = await api.patch(`/room/${roomId}`, roomUpdateDto, { headers });
        return handleResponse(response);
    } catch (error) {
        handleError(`updating room ${roomId}`, error);
    }
};