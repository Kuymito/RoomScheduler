import axios from 'axios';

const isServer = typeof window === 'undefined';
const API_URL = isServer ? "https://jaybird-new-previously.ngrok-free.app/api/v1" : "/api";

const getAllDepartments = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/department`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(isServer && { 'ngrok-skip-browser-warning': 'true' })
      }
    });

    console.log("API Response for Departments:", response.data); 

    // LOGIC FIX: Check for data in 'payload' OR use the data directly.
    const departments = response.data.payload || response.data;

    if (Array.isArray(departments)) {
        return departments;
    }
      throw new Error('Invalid data structure for departments from API');
  } catch (error) {
    console.error("Get all departments service error:", {
      message: error.message,
      code: error.code,
      response: error.response ? error.response.data : 'No response data'
    });
    throw new Error(error.response?.data?.message || "Failed to fetch departments.");
  }
};

export const departmentService = {
  getAllDepartments,
};