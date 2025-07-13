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

  // --- Header Forwarding ---
  const headersToForward = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headersToForward.append(key, value);
    }
  });
  headersToForward.set('host', new URL(API_URL).host);
  headersToForward.set('ngrok-skip-browser-warning', 'true');

  // --- Body Forwarding (FIX) ---
  // Determine if the request has a body and handle it correctly.
  let body;
  const contentType = req.headers.get('content-type');
  if (req.method !== 'GET' && req.method !== 'HEAD' && contentType) {
    if (contentType.includes('application/json')) {
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
        }
    } else {
        // Handle other content types like form-data if necessary
        body = await req.text();
    }
  }

  try {
    const response = await fetch(destinationUrl, {
      method: req.method,
      headers: headersToForward,
      // Conditionally add the body to the request.
      // Stringify the body if it's a JSON object.
      body: body ? JSON.stringify(body) : null,
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
