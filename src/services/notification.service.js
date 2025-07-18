// src/services/notification.service.js
import api, { getAuthHeaders, handleResponse, handleError } from './api';

const getNotifications = async (token) => {
    try {
        const response = await api.get('/notifications', { headers: await getAuthHeaders(token) });
        const payload = handleResponse(response);
        return payload || [];
    } catch (error) {
        handleError("fetching notifications", error);
    }
};

const getChangeRequests = async (token) => {
    try {
        const response = await api.get('/change-requests', { headers: await getAuthHeaders(token) });
        const payload = handleResponse(response);
        return payload || [];
    } catch (error) {
        handleError("fetching change requests", error);
    }
};

const submitChangeRequest = async (requestData, token) => {
    try {
        const response = await api.post('/change-requests', requestData, { headers: await getAuthHeaders(token) });
        return handleResponse(response);
    } catch (error) {
        handleError("submitting change request", error);
    }
};

const approveChangeRequest = async (changeRequestId, token) => {
    try {
        const response = await api.post(`/change-requests/${changeRequestId}/approve`, {}, { headers: await getAuthHeaders(token) });
        return handleResponse(response);
    } catch (error) {
        handleError("approving change request", error);
    }
};

const denyChangeRequest = async (changeRequestId, token) => {
    try {
        const response = await api.post(`/change-requests/${changeRequestId}/deny`, {}, { headers: await getAuthHeaders(token) });
        return handleResponse(response);
    } catch (error) {
        handleError("denying change request", error);
    }
};

const markNotificationAsRead = async (notificationId, token) => {
    try {
        const response = await api.post(`/notifications/${notificationId}/read`, {}, { headers: await getAuthHeaders(token) });
        return handleResponse(response);
    } catch (error) {
        handleError("marking notification as read", error);
    }
};

const markAllNotificationsAsRead = async (notifications, token) => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
        return Promise.resolve();
    }
    const markAsReadPromises = unreadNotifications.map(notification =>
        markNotificationAsRead(notification.notificationId, token)
    );
    try {
        await Promise.all(markAsReadPromises);
    } catch (error) {
        console.error("An error occurred while marking all notifications as read.", error);
    }
};

export const notificationService = {
    getNotifications,
    getChangeRequests,
    submitChangeRequest,
    approveChangeRequest,
    denyChangeRequest,
    markNotificationAsRead,
    markAllNotificationsAsRead
};