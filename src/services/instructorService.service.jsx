const API_BASE_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

// A helper function to handle API responses
const handleResponse = async (response) => {
    if (response.status === 401 || response.status === 403) {
        // Handle unauthorized access, e.g., by redirecting to login
        localStorage.removeItem('jwtToken');
        // This is tricky in a service file, the component should handle redirection
        throw new Error('Unauthorized'); 
    }
    
    const data = await response.json();

    if (!response.ok) {
        // Throw an error with the message from the API, or a default one
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data.payload; // Return only the payload on success
};

// A helper to get headers, including the auth token
const getAuthHeaders = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // In a real app, you might want to handle this more gracefully
        throw new Error('Authentication token not found');
    }
    return {
        'Content-Type': 'application/json',
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
    };
};


// --- Service Functions ---

export const getAllInstructors = async () => {
    const response = await fetch(`${API_BASE_URL}/instructors`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const getAllDepartments = async () => {
    const response = await fetch(`${API_BASE_URL}/department`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const createInstructor = async (instructorPayload) => {
    const response = await fetch(`${API_BASE_URL}/instructors`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(instructorPayload)
    });
    return handleResponse(response);
};

export const updateInstructorStatus = async (instructorId, isArchived) => {
    const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/archive`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_archived: isArchived })
    });
    return handleResponse(response);
};