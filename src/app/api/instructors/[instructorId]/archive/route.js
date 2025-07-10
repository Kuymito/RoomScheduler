import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axios from 'axios';

// The base URL for your backend API
const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

/**
 * Handles the PATCH request to archive or un-archive an instructor.
 * This acts as a secure server-side proxy to your backend API.
 * @param {Request} req - The incoming request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The route parameters.
 * @param {string} context.params.instructorId - The ID of the instructor.
 */
export async function PATCH(req, { params }) {
  try {
    // Authenticate the admin making the request
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken || session.user.role !== 'ROLE_ADMIN') {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const { instructorId } = params;
    const { is_archived } = await req.json();

    // Validate the request body
    if (typeof is_archived !== 'boolean') {
        return NextResponse.json({ message: "The 'is_archived' field must be a boolean." }, { status: 400 });
    }

    const backendUrl = `${API_URL}/instructors/${instructorId}/archive`;
    
    // Make the PATCH request to your actual backend API
    const backendResponse = await axios.patch(
      backendUrl,
      { is_archived }, // The request body
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
          'ngrok-skip-browser-warning': 'true', // Header for ngrok
        },
      }
    );

    // Forward the response from the backend to the client
    return NextResponse.json(backendResponse.data, { status: backendResponse.status });

  } catch (error) {
    // Log and return a descriptive error
    console.error("Admin archive instructor proxy error:", error.response ? error.response.data : error.message);
    return NextResponse.json(
      { message: "API proxy failed for instructor archive.", error: error.response?.data?.message || error.message },
      { status: error.response?.status || 500 }
    );
  }
}