const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaybird-new-previously.ngrok-free.app';

const getAuthHeaders = () => {
    const token = localStorage.getItem('jwtToken');
    const decoded = decodeToken(token);
    
    if (decoded?.isExpired) {
        console.warn("Token expired, redirecting to login");
        localStorage.removeItem('jwtToken');
        window.location.href = '/auth/login';
        return {};
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
    };
};

const decodeToken = (token) => {
    if (!token) {
      return null;
    }
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

const handleResponse = async (response) => {
    console.log("API response:", {
        status: response.status,
        url: response.url
    });

    if (response.status === 401 || response.status === 403) {
        console.warn("Authentication failed, redirecting to login");
        localStorage.removeItem('jwtToken');
        // Delay redirect to allow logs to be seen
        setTimeout(() => window.location.href = '/auth/login', 2000);
        throw new Error("Session expired. Please log in again.");
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
        }
        return null;
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `Request failed with status: ${response.status}`);
    }

    return data;
};

const apiClient = {
    get: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getAuthHeaders(),
            cache: 'no-store' // Important for Next.js
        });
        return handleResponse(response);
    },
    post: async (endpoint, body) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
            cache: 'no-store'
        });
        return handleResponse(response);
    },
    patch: async (endpoint, body) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
            cache: 'no-store'
        });
        return handleResponse(response);
    },
    delete: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            cache: 'no-store'
        });
        return handleResponse(response);
    },
};

export default apiClient;