import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import RoomPageSkeleton from './components/RoomPageSkeleton';
import RoomClientView from './components/RoomClientView';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from "next-auth/next";

// The base URL for your backend API
const API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

/**
 * This function now fetches data from your live Spring Boot backend API.
 * It runs on the Next.js server before the page is sent to the client.
 */
const fetchRoomData = async () => {
  console.log("Fetching all room data from the live backend...");
  
  // 1. Get the current user's session to retrieve the access token.
  const session = await getServerSession(authOptions);
  
  // If there's no token, we can't make an authenticated request.
  if (!session?.accessToken) {
    console.error("Server-side Error: Not authenticated. Cannot fetch room data.");
    return {}; // Return empty data to prevent a crash.
  }

  try {
    // 2. Make a GET request to your backend's /room endpoint.
    const response = await fetch(`${API_URL}/room`, {
      method: 'GET',
      headers: {
        // Your API requires an Authorization token.
        'Authorization': `Bearer ${session.accessToken}`,
        // This header is required to bypass the ngrok browser warning page.
        'ngrok-skip-browser-warning': 'true',
      },
      // Ensure we always get the freshest data and not a cached version.
      cache: 'no-store', 
    });

    if (!response.ok) {
      // If the API returns an error (e.g., 401, 500), throw an error.
      throw new Error(`Failed to fetch rooms from backend: ${response.status} ${response.statusText}`);
    }

    // 3. Parse the JSON response from the API.
    const apiResponse = await response.json();
    
    // As per your API docs, the array of rooms is inside the 'payload' key.
    const roomsArray = apiResponse.payload || [];

    // 4. Transform the data. Your client component expects an object where the
    // key is the room's ID (e.g., "A1", "B2"), so we convert the array.
    const roomsObject = roomsArray.reduce((acc, room) => {
      // The original component uses string IDs like "A1", "MeetingA". We will use
      // the `roomName` or a modified version if needed, or preferably the `roomId`.
      // For this to work seamlessly, the IDs in the original component's `buildings` object
      // must match the keys we generate here. We will use `roomId`.
      acc[room.roomId] = room;
      return acc;
    }, {});
    
    return roomsObject;

  } catch (error) {
    console.error("An error occurred during data fetching:", error);
    // In case of any error, return an empty object to ensure the page can still render.
    return {};
  }
};

export default async function AdminRoomPage() {
    // This function will now be executed on the server, fetching live data.
    const allRoomsData = await fetchRoomData();

    return (
        <AdminLayout activeItem="room" pageTitle="Management">
            <Suspense fallback={<RoomPageSkeleton />}>
                {/* The live data is passed as a prop to your existing client component.
                  The page is pre-rendered on the server with this data for a fast initial load.
                */}
                <RoomClientView initialAllRoomsData={allRoomsData} />
            </Suspense>
        </AdminLayout>
    );
}
