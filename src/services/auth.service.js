// src/services/auth.service.js
import axios from 'axios';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data; // This will return { token: "..." }
  } catch (error) {
    console.error("Login service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Invalid credentials.");
  }
};

export const authService = {
  login,
};