// src/services/instructor.service.js
import api, { getAuthHeaders, handleResponse, handleError } from './api';

const getAllInstructors = async (token) => {
  try {
    const response = await api.get('/instructors', { headers: await getAuthHeaders(token) });
    const payload = handleResponse(response);
    if (!Array.isArray(payload)) {
        throw new Error('Invalid data structure for instructors from API');
    }
    return payload;
  } catch (error) {
    handleError("fetching all instructors", error);
  }
};

const getInstructorById = async (instructorId, token) => {
  try {
    const response = await api.get(`/instructors/${instructorId}`, { headers: await getAuthHeaders(token) });
    const payload = handleResponse(response);
    if (!payload) {
      throw new Error('Invalid data structure for single instructor from API');
    }
    return payload;
  } catch (error) {
    handleError(`fetching instructor by ID (${instructorId})`, error);
  }
};

const createInstructor = async (instructorData, token) => {
  try {
    const response = await api.post('/instructors', instructorData, { headers: await getAuthHeaders(token) });
    return handleResponse(response);
  } catch (error) {
    handleError("creating instructor", error);
  }
};

const updateInstructor = async (instructorId, instructorData, token) => {
  try {
    const response = await api.patch(`/instructors/${instructorId}`, instructorData, { headers: await getAuthHeaders(token) });
    return handleResponse(response);
  } catch (error) {
    handleError(`updating instructor ${instructorId}`, error);
  }
};

const archiveInstructor = async (instructorId, isArchived, token) => {
  try {
    const response = await api.patch(`/instructors/${instructorId}/archive`, { is_archived: isArchived }, { headers: await getAuthHeaders(token) });
    return handleResponse(response);
  } catch (error) {
    handleError(`archiving instructor ${instructorId}`, error);
  }
};

const getInstructorSchedule = async (instructorId, token) => {
  try {
    const response = await api.get(`/schedule/instructor/${instructorId}`, { headers: await getAuthHeaders(token) });
    const payload = handleResponse(response);
    return payload || [];
  } catch (error) {
    handleError(`fetching schedule for instructor ${instructorId}`, error);
  }
};

export const instructorService = {
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  archiveInstructor,
  getInstructorSchedule,
};