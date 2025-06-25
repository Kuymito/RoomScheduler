const API_BASE_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

// Helper function to get authorization headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // This is a simple way to handle it; in a real app, you might use a more robust auth solution.
        throw new Error('Authentication token not found');
    }
    return {
        'Content-Type': 'application/json',
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
    };
};

// Helper function to handle API responses and errors
const handleResponse = async (response) => {
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('jwtToken');
        throw new Error('Unauthorized. Please log in again.');
    }
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
    }
    
    return data.payload;
};

// --- Service Functions ---

/**
 * Fetches all classes, optionally filtered by archived status.
 * @param {boolean|null} isArchived - Filter by archived status. Null fetches all.
 */
export const getAllClasses = async (isArchived) => {
    const url = new URL(`${API_BASE_URL}/class`);
    if (isArchived !== null) {
        url.searchParams.append('isArchived', isArchived);
    }
    const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
    return handleResponse(response);
};

/**
 * Finds all classes matching a set of query parameters.
 * @param {object} queryParams - Object with key-value pairs for querying.
 */
export const queryClasses = async (queryParams) => {
    const url = new URL(`${API_BASE_URL}/class`);
    Object.entries(queryParams).forEach(([key, value]) => {
        if (value != null) {
            url.searchParams.append(key, value);
        }
    });
    const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
    return handleResponse(response);
};

/**
 * Fetches a single class by its ID.
 * @param {number} classId - The ID of the class.
 */
export const getClassById = async (classId) => {
    const response = await fetch(`${API_BASE_URL}/class/${classId}`, { method: 'GET', headers: getAuthHeaders() });
    return handleResponse(response);
};

/**
 * Creates a new class.
 * @param {object} classCreateDto - The data for the new class.
 */
export const createClass = async (classCreateDto) => {
    const response = await fetch(`${API_BASE_URL}/class`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(classCreateDto)
    });
    return handleResponse(response);
};

/**
 * Updates a class's archived status.
 * @param {number} classId - The ID of the class to update.
 * @param {boolean} isArchived - The new archive status.
 */
export const updateClassStatus = async (classId, isArchived) => {
    const response = await fetch(`${API_BASE_URL}/class/${classId}/archive`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_archived: isArchived })
    });
    return handleResponse(response);
};

/**
 * Patches a class with specific updates.
 * @param {number} classId - The ID of the class to update.
 * @param {object} classUpdateDto - An object with the fields to update.
 */
export const patchClass = async (classId, classUpdateDto) => {
    const response = await fetch(`${API_GEB_URL}/class/${classId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(classUpdateDto)
    });
    return handleResponse(response);
};

/**
 * Deletes a class by its ID.
 * @param {number} classId - The ID of the class to delete.
 */
export const deleteClass = async (classId) => {
    const response = await fetch(`${API_GEB_URL}/class/${classId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    return true;
};