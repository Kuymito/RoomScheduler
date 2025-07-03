import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1/auth/change-password";

async function handler(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    const backendResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Change password proxy error:", error);
    return NextResponse.json(
      { message: "API proxy failed for password change.", error: error.message },
      { status: 500 }
    );
  }
}

export { handler as POST };