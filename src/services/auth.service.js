// src/services/auth.service.js
import axios from 'axios';

// The API_URL now points to the local API directory.
// Requests will go to /api/auth/login, /api/otp/generate, etc.
const LOCAL_API_URL = "/api";
const SERVER_API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

const login = async (email, password) => {
  try {
    const response = await axios.post(`${SERVER_API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || "Invalid credentials.");
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${LOCAL_API_URL}/otp/generate`, { email });
    if (response.data.status !== 'OK') {
      throw new Error(response.data.message || 'Failed to send OTP.');
    }
    return response.data;
  } catch (error) {
    console.error("Forgot Password service error:", error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'An error occurred while sending the OTP.');
  }
};

const verifyOtp = async (email, otp) => {
    try {
        const response = await axios.post(`${LOCAL_API_URL}/otp/validate`, { email, otp });
        
        if (response.data.payload === true) {
             return { success: true, message: "OTP verified successfully." };
        } else {
             throw new Error(response.data.message || "Invalid OTP.");
        }
    } catch (error) {
        console.error("Verify OTP service error:", error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.message || "An error occurred during OTP validation.");
    }
};

const resetPassword = async ({ token, password }) => {
    console.log(`Simulating password reset with token: ${token}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: "Password has been reset successfully." };
};


export const authService = {
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
};