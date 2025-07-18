// src/services/shift.service.js
import api, { getAuthHeaders, handleResponse, handleError } from './api';

export async function getAllShifts(token) {
    try {
        const headers = await getAuthHeaders(token);
        const response = await api.get('/shifts', { headers });
        const payload = handleResponse(response);
        
        if (Array.isArray(payload)) {
            return payload;
        }
        // Handle cases where the payload might be directly the array
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        handleError("fetching all shifts", error);
    }
}