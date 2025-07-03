import { NextResponse } from 'next/server';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

async function handler(req) {
  const { pathname, search } = req.nextUrl;
  
  // --- Path Remapping ---
  let backendPath;
  if (pathname === '/api/profile') {
    backendPath = '/auth/profile';
  } else {
    backendPath = pathname.replace('/api', '');
  }
  
  const destinationUrl = `${API_URL}${backendPath}${search}`;

  // Log for debugging
  console.log("--- API Proxy ---");
  console.log("Incoming Path:", req.nextUrl.pathname);
  console.log("Mapped Backend Path:", backendPath);
  console.log("Final Destination URL:", destinationUrl);
  console.log("Request Method:", req.method);
  
  // --- Explicit Header Forwarding (FIX) ---
  // Create a new Headers object to avoid issues with read-only properties.
  const headersToForward = new Headers();
  // Iterate over the incoming request's headers and append them to the new Headers object.
  req.headers.forEach((value, key) => {
    // Do not forward the original 'host' header, as it can cause issues.
    if (key.toLowerCase() !== 'host') {
      headersToForward.append(key, value);
    }
  });

  // Set the correct host for the backend API.
  headersToForward.set('host', new URL(API_URL).host);
  // Add the ngrok header to bypass the browser warning page.
  headersToForward.set('ngrok-skip-browser-warning', 'true');

  console.log("Forwarding Authorization Header:", headersToForward.get('authorization'));
  console.log("-------------------");

  try {
    const response = await fetch(destinationUrl, {
      method: req.method,
      headers: headersToForward, // Use the newly constructed headers object
      body: req.method === 'GET' || req.method === 'HEAD' ? null : req.body,
      redirect: 'follow',
      // 'duplex: "half"' is required for streaming request bodies with `fetch`.
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