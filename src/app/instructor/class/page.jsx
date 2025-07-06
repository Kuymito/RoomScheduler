import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import InstructorClassClientView from './components/InstructorClassClientView';
import InstructorClassPageSkeleton from './components/InstructorClassPageSkeleton';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { classService } from '@/services/class.service';

// Mapping from shiftId to the full descriptive name used in the UI.
const shiftIdToFullNameMap = {
    1: 'Morning Shift',
    2: 'Noon Shift',
    3: 'Afternoon Shift',
    4: 'Evening Shift',
    5: 'Weekend Shift'
};

const fetchInstructorClassData = async () => {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) {
    console.error("Instructor Class Page: Not authenticated.");
    return [];
  }

  try {
    const apiData = await classService.getAssignedClasses(token);
    
    // Format the data to match what the client component expects
    const formattedData = apiData.map(item => ({
        id: item.classId,
        name: item.className,
        generation: item.generation,
        group: item.groupName,
        major: item.majorName,
        degrees: item.degreeName,
        faculty: item.department?.name || 'N/A',
        semester: item.semester,
        shift: item.shift ? shiftIdToFullNameMap[item.shift.shiftId] || 'N/A' : 'N/A',
        status: item.archived ? 'archived' : 'active',
    }));

    return formattedData;
  } catch (error) {
    console.error("Failed to fetch instructor's class data:", error.message);
    return []; // Return empty array on error
  }
};

/**
 * The main page component is now an async Server Component.
 */
export default async function InstructorClassPage() {
    // Data is fetched on the server before the page is sent to the client.
    const initialClasses = await fetchInstructorClassData();

    return (
        <InstructorLayout activeItem="class" pageTitle="Class Management">
            <Suspense fallback={<InstructorClassPageSkeleton />}>
                {/* The Client Component is rendered here, receiving the server-fetched data as a prop. */}
                <InstructorClassClientView initialClasses={initialClasses} />
            </Suspense>
        </InstructorLayout>
    );
}