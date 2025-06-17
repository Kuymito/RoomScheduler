import { NextResponse } from 'next/server';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

async function handler(req) {
  const { pathname, search } = req.nextUrl;
  const destinationUrl = `${API_URL}${pathname.replace('/api', '')}${search}`;
  
  // Create a new Headers object from the incoming request
  const headers = new Headers(req.headers);
  
  // Set the ngrok header to bypass the warning page.
  headers.set('ngrok-skip-browser-warning', 'true');
  // Let Next.js/Vercel manage the host header.
  headers.delete('host');

  try {
    // Stream the request body directly to the destination.
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

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };