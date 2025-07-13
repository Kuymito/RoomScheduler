// app/api/schedule/assign/route.js
import { getServerSession } from 'next-auth';
import { scheduleService } from '@/services/schedule.service';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { classId, roomId } = await request.json();
  
  try {
    const result = await scheduleService.assignClassToRoom(
      classId,
      roomId,
      session.accessToken
    );
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}