import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axios from 'axios';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

/**
 * Handles the PATCH request to reset an instructor's password.
 * This acts as a secure server-side proxy to your backend API.
 * @param {Request} req - The incoming request object.
 * @param {object} context - The context object containing params.
 * @param {object} context.params - The route parameters.
 * @param {string} context.params.instructorId - The ID of the instructor.
 */
export async function PATCH(req, { params }) {
  try {
    // 1. Authenticate the admin making the request
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken || session.user.role !== 'ROLE_ADMIN') {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    // 2. Get the instructorId from the URL and the new password from the body
    const { instructorId } = params;
    const { newPassword } = await req.json();

    if (!newPassword) {
        return NextResponse.json({ message: "New password is required" }, { status: 400 });
    }

    // 3. Construct the backend API URL
    const backendUrl = `${API_URL}/auth/${instructorId}/reset-password`;
    
    // 4. Make the PATCH request to the backend API
    const backendResponse = await axios.patch(
      backendUrl,
      { newPassword },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    // 5. Forward the response from the backend to the client
    return NextResponse.json(backendResponse.data, { status: backendResponse.status });

  } catch (error) {
    console.error("Admin reset password proxy error:", error.response ? error.response.data : error.message);
    return NextResponse.json(
      { message: "API proxy failed for password reset.", error: error.response?.data?.message || error.message },
      { status: error.response?.status || 500 }
    );
  }
}