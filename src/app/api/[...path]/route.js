import { NextResponse } from 'next/server';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

async function handler(req) {
  const { pathname, search } = req.nextUrl;
  const destinationUrl = `${API_URL}${pathname.replace('/api', '')}${search}`;
  
  // Create a new Headers object for the outgoing request. This is a safer approach.
  const headers = new Headers();

  // Explicitly copy the necessary headers from the incoming request.
  const contentType = req.headers.get('Content-Type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  const authToken = req.headers.get('Authorization');
  if (authToken) {
    headers.set('Authorization', authToken);
  }

  // Add the ngrok header for direct server-to-server requests to bypass warnings.
  headers.set('ngrok-skip-browser-warning', 'true');

  try {
    // Make the request to the destination with the newly constructed headers.
    const response = await fetch(destinationUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: 'follow',
      // The 'duplex' property is required for streaming request bodies.
      duplex: 'half'
    });
    
    // Stream the backend's response directly back to the client.
    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });

  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      { message: "API proxy failed.", error: error.message },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };