const API_BASE_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error('Authentication token not found');
    return {
        'Content-Type': 'application/json',
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    return response.json().then(data => data.payload);
};

export const getAllRooms = async () => {
    const response = await fetch(`${API_BASE_URL}/room`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const updateRoom = async (roomId, roomUpdateDto) => {
    const response = await fetch(`${API_BASE_URL}/room/${roomId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(roomUpdateDto)
    });
    return handleResponse(response);
};