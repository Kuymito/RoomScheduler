import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axios from 'axios';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

/**
 * Handles PATCH requests to update a room's details.
 * This acts as a secure server-side proxy to your backend API.
 * @param {Request} req - The incoming request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The route parameters.
 * @param {string} context.params.roomId - The ID of the room to update.
 */
export async function PATCH(req, { params }) {
  try {
    // 1. Authenticate the admin making the request
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken || session.user.role !== 'ROLE_ADMIN') {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const { roomId } = params;
    const body = await req.json();

    // 2. Construct the backend API URL
    const backendUrl = `${API_URL}/room/${roomId}`;
    
    // 3. Make the PATCH request to the backend API
    const backendResponse = await axios.patch(backendUrl, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    // 4. Forward the response from the backend to the client
    return NextResponse.json(backendResponse.data, { status: backendResponse.status });

  } catch (error) {
    // 5. Log and return a descriptive error
    console.error(`Admin update room proxy error for ID ${params.roomId}:`, error.response ? error.response.data : error.message);
    return NextResponse.json(
      { message: "API proxy failed for room update.", error: error.response?.data?.message || error.message },
      { status: error.response?.status || 500 }
    );
  }
}