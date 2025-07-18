// src/services/schedule.service.js
import api, { getAuthHeaders, handleResponse, handleError } from './api';

const getAllSchedules = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await api.get('/schedule', { headers });
        const payload = handleResponse(response);
        
        if (Array.isArray(payload)) {
            const uniqueSchedules = new Map();
            payload.forEach(schedule => {
                if (!schedule) return;
                const key = schedule.scheduleId || `booking-${schedule.roomId}-${schedule.dayDetails?.[0]?.dayOfWeek}-${schedule.className}`;
                if (!uniqueSchedules.has(key)) {
                    uniqueSchedules.set(key, schedule);
                }
            });
            return Array.from(uniqueSchedules.values());
        }
        return payload;
    } catch (error) {
        handleError("fetching all schedules", error);
    }
};

const getMySchedule = async (token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await api.get('/schedule/my-schedule', { headers });
        const payload = handleResponse(response);

        if (Array.isArray(payload)) {
            const uniqueSchedules = new Map();
            payload.forEach(schedule => {
                if (!schedule) return;
                const key = schedule.scheduleId || `booking-${schedule.roomId}-${schedule.dayDetails?.[0]?.dayOfWeek}-${schedule.className}`;
                if (!uniqueSchedules.has(key)) {
                    uniqueSchedules.set(key, schedule);
                }
            });
            return Array.from(uniqueSchedules.values());
        }
        return payload;
    } catch (error) {
        handleError("fetching my schedule", error);
    }
};

const assignRoomToClass = async (scheduleRequest, token) => {
    try {
      const headers = await getAuthHeaders(token);
      const response = await api.post('/schedule/assign', scheduleRequest, { headers });
      return handleResponse(response);
    } catch (error) {
      handleError("assigning room to class", error);
    }
};

const unassignRoomFromClass = async (scheduleId, token) => {
    try {
      const headers = await getAuthHeaders(token);
      const response = await api.delete(`/schedule/${scheduleId}`, { headers });
      return handleResponse(response);
    } catch (error) {
      handleError(`unassigning room for schedule ${scheduleId}`, error);
    }
};

const swapSchedules = async (swapRequest, token) => {
    try {
        const headers = await getAuthHeaders(token);
        const response = await api.post('/schedule/swap', swapRequest, { headers });
        return handleResponse(response);
    } catch (error) {
        handleError("swapping schedules", error);
    }
};

const moveScheduleToRoom = async (scheduleId, newRoomId, token) => {
  try {
      const headers = await getAuthHeaders(token);
      const response = await api.put(`/schedule/${scheduleId}/move`, { newRoomId }, { headers });
      return handleResponse(response);
  } catch (error) {
      handleError(`moving schedule ${scheduleId} to new room`, error);
  }
};

export const scheduleService = {
  getAllSchedules,
  getMySchedule,
  assignRoomToClass,
  unassignRoomFromClass,
  swapSchedules,
  moveScheduleToRoom
};