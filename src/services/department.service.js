// src/services/department.service.js
import api, { getAuthHeaders, handleResponse, handleError } from './api';

const getAllDepartments = async (token) => {
  try {
    const response = await api.get('/department', { headers: await getAuthHeaders(token) });
    const payload = handleResponse(response);
    if (!Array.isArray(payload)) {
        throw new Error('Invalid data structure for departments from API');
    }
    return payload;
  } catch (error) {
    handleError("fetching all departments", error);
  }
};

export const departmentService = {
  getAllDepartments,
};