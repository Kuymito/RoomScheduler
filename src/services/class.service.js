// src/services/class.service.js
import api, { getAuthHeaders, handleResponse, handleError } from './api';

const getAllClasses = async (token) => {
  try {
    const response = await api.get('/class', { headers: await getAuthHeaders(token) });
    const payload = handleResponse(response);
    if (!Array.isArray(payload)) {
        throw new Error('Invalid data structure for classes from API');
    }
    return payload;
  } catch (error) {
    handleError("fetching all classes", error);
  }
};

const getClassById = async (classId, token) => {
  try {
    const response = await api.get(`/class/${classId}`, { headers: await getAuthHeaders(token) });
    const payload = handleResponse(response);
    if (!payload) {
        throw new Error('Invalid data structure for single class from API');
    }
    return payload;
  } catch (error) {
    handleError(`fetching class by ID (${classId})`, error);
  }
};

const patchClass = async (classId, classData, token) => {
  try {
    const response = await api.patch(`/class/${classId}`, classData, { headers: await getAuthHeaders(token) });
    return handleResponse(response);
  } catch (error) {
    handleError(`updating class by ID (${classId})`, error);
  }
};

const createClass = async (classData, token) => {
  try {
    const response = await api.post('/class', classData, { headers: await getAuthHeaders(token) });
    return handleResponse(response);
  } catch (error) {
    handleError("creating class", error);
  }
};

const assignInstructorToClass = async (assignmentData, token) => {
    try {
        const response = await api.post('/class/assign-instructor', assignmentData, { headers: await getAuthHeaders(token) });
        return handleResponse(response);
    } catch (error) {
        handleError("assigning instructor", error);
    }
};

const unassignInstructorFromClass = async (unassignmentData, token) => {
    try {
        const response = await api.post('/class/unassign-instructor', unassignmentData, { headers: await getAuthHeaders(token) });
        return handleResponse(response);
    } catch (error) {
        handleError("unassigning instructor", error);
    }
};

const getAssignedClasses = async (token) => {
  try {
    const response = await api.get('/class/my-classes', { headers: await getAuthHeaders(token) });
    const payload = handleResponse(response);
    if (!Array.isArray(payload)) {
        throw new Error('Invalid data structure for assigned classes from API');
    }
    return payload;
  } catch (error) {
    handleError("fetching assigned classes", error);
  }
};

export const classService = {
  getAllClasses,
  getClassById,
  patchClass,
  createClass,
  assignInstructorToClass,
  unassignInstructorFromClass,
  getAssignedClasses,
};