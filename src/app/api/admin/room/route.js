// app/api/admin/room/route.js
import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

/**
 * Handles GET /api/admin/room
 * Fetches a list of all rooms from the backend.
 */
export async function GET(req) {
  const session = await getServerAuthSession();
  if (!session?.accessToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  
  const destinationUrl = `${API_URL}/room`;
  console.log(`Forwarding GET all rooms request to: ${destinationUrl}`);

  try {
    const apiResponse = await fetch(destinationUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error("Backend API error:", errorBody);
        return NextResponse.json(
            { message: "Backend API error", details: errorBody }, 
            { status: apiResponse.status }
        );
    }
    
    // Return the response directly from the backend
    return new NextResponse(apiResponse.body, {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      headers: apiResponse.headers,
    });

  } catch (error) {
    console.error("API route error in /api/admin/room:", error);
    return NextResponse.json(
      { message: "API proxy failed", error: error.message },
      { status: 500 }
    );
  }
}