// src/services/major.service.js
import api, { getAuthHeaders, handleResponse, handleError } from './api';

const getAllMajors = async (token) => {
  try {
    const response = await api.get('/major', { headers: await getAuthHeaders(token) });
    const payload = handleResponse(response);
    if (!Array.isArray(payload)) {
        throw new Error('Invalid data structure for majors from API');
    }
    return payload;
  } catch (error) {
    handleError("fetching all majors", error);
  }
};

export const majorService = {
  getAllMajors,
};