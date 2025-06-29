import { NextResponse } from 'next/server';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

async function handler(req) {
  const { pathname, search } = req.nextUrl;
  
  // --- Start Path Remapping ---
  let backendPath;

  // Special case for the profile to avoid NextAuth conflict.
  // If the request is to our friendly URL `/api/profile`...
  if (pathname === '/api/profile') {
    // ...we map it to the real backend endpoint `/auth/profile`.
    backendPath = '/auth/profile';
  } else {
    // For all other requests, we just remove the `/api` prefix.
    backendPath = pathname.replace('/api', '');
  }
  // --- End Path Remapping ---

  const destinationUrl = `${API_URL}${backendPath}${search}`;

  // Log for debugging
  console.log("--- API Proxy ---");
  console.log("Incoming Path:", req.nextUrl.pathname);
  console.log("Mapped Backend Path:", backendPath);
  console.log("Final Destination URL:", destinationUrl);
  console.log("-------------------");
  
  const headers = new Headers(req.headers);
  headers.set('host', new URL(API_URL).host);
  headers.set('ngrok-skip-browser-warning', 'true');

  try {
    const response = await fetch(destinationUrl, {
      method: req.method,
      headers: headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? null : req.body,
      redirect: 'follow',
      duplex: 'half'
    });
    
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