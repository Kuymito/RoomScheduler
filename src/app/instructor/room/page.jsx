import InstructorLayout from "@/components/InstructorLayout";
import InstructorRoomView from "./components/InstructorRoomView";
import { getRoomsData, buildings } from "./lib/data";
import { Suspense } from "react";
import InstructorRoomPageSkeleton from "./components/Skeletons";
import RequestSuccessComponent from "./components/RequestSuccessComponent";

// This is a React Server Component (RSC)
// It fetches data on the server and passes it to client components.
export default async function AdminRoomPage() {
  // Fetch initial data on the server.
  // This happens once at build time or on request, not in the client's browser.
  const allRoomsData = await getRoomsData();

  return (
    <InstructorLayout activeItem="room" pageTitle="Room Management">
      <Suspense fallback={<InstructorRoomPageSkeleton />}>
        {/*
          The InstructorRoomView is a Client Component.
          We pass the server-fetched data as props.
          This avoids a "loading" state on the client for initial data.
        */}
        <InstructorRoomView initialRoomsData={allRoomsData} buildings={buildings} />
      </Suspense>
    </InstructorLayout>
  );
}