import axios from 'axios';

// The API URL now points to the new, specific admin directory.
const LOCAL_API_URL = "/api/admin/room";

/**
 * Fetches all rooms from the backend.
 * This is typically used for the initial page load on a server component.
 * @param {string} token - The user's accessToken from the session.
 * @returns {Promise<Array>} A list of all room objects.
 */
const getAllRooms = async (token) => {
  try {
    // Calls GET /api/admin/room
    const response = await axios.get(LOCAL_API_URL, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Get All Rooms service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch all rooms.");
  }
};

/**
 * Fetches the details for a single room by its ID.
 * @param {string} roomId - The ID of the room.
 * @param {string} token - The user's accessToken from the session.
 * @returns {Promise<object>} The room data.
 */
const getRoomById = async (roomId, token) => {
  try {
    // Calls GET /api/admin/room/{roomId}
    const response = await axios.get(`${LOCAL_API_URL}/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error)    {
    console.error("Get Room service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch room details.");
  }
};

/**
 * Updates a room's details.
 * @param {string} roomId - The ID of the room to update.
 * @param {object} roomData - The data to update.
 * @param {string} token - The user's accessToken from the session.
 * @returns {Promise<object>} The updated room data from the server.
 */
const updateRoom = async (roomId, roomData, token) => {
  try {
    // Calls PATCH /api/admin/room/{roomId}
    const response = await axios.patch(`${LOCAL_API_URL}/${roomId}`, roomData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Update Room service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Failed to update room.");
  }
};

/**
 * Deletes a room by its ID.
 * @param {string} roomId - The ID of the room to delete.
 * @param {string} token - The user's accessToken from the session.
 * @returns {Promise<void>}
 */
const deleteRoom = async (roomId, token) => {
  try {
    // Calls DELETE /api/admin/room/{roomId}
    await axios.delete(`${LOCAL_API_URL}/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error) {
    console.error("Delete Room service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Failed to delete room.");
  }
};


export const roomService = {
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};
