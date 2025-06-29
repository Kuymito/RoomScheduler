// app/api/admin/room/[roomId]/route.js
import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

// Generic handler to forward requests for a specific room
async function forwardRequest(req, { params }) {
    const session = await getServerAuthSession();
    if (!session?.accessToken) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { roomId } = params;
    const destinationUrl = `${API_URL}/room/${roomId}`;

    // Create new headers and forward the authorization token
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${session.accessToken}`);
    headers.set('ngrok-skip-browser-warning', 'true');
    // Forward content-type header for PATCH requests
    if (req.headers.get('content-type')) {
        headers.set('content-type', req.headers.get('content-type'));
    }
    
    console.log(`Forwarding ${req.method} request for room ${roomId} to: ${destinationUrl}`);

    try {
        const apiResponse = await fetch(destinationUrl, {
            method: req.method,
            headers: headers,
            // Stream the body for PATCH requests
            body: req.method === 'GET' || req.method === 'DELETE' ? undefined : req.body,
            duplex: 'half', // Required for streaming request bodies
        });

        // Directly stream the response from the backend back to the client
        return new NextResponse(apiResponse.body, {
            status: apiResponse.status,
            statusText: apiResponse.statusText,
            headers: apiResponse.headers,
        });

    } catch (error) {
        console.error(`API route error for room ${roomId}:`, error);
        return NextResponse.json(
            { message: "API proxy failed", error: error.message },
            { status: 500 }
        );
    }
}

// Export the handler for each supported HTTP method
export { forwardRequest as GET, forwardRequest as PATCH, forwardRequest as DELETE };