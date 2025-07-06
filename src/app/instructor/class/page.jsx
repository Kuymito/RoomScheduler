import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import InstructorClassClientView from './components/InstructorClassClientView';
import InstructorClassPageSkeleton from './components/InstructorClassPageSkeleton';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { classService } from '@/services/class.service'; // Import your service

/**
 * Fetches the classes for the currently authenticated instructor from the API.
 */
const fetchInstructorClassData = async () => {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) {
    console.error("No auth token found in session.");
    return [];
  }

  try {
    // Use the new service function to get the instructor's classes
    const classes = await classService.getMyClasses(token);
    
    // Format the data to match what the client component expects
    return classes.map(item => ({
      id: item.classId,
      name: item.className,
      generation: item.generation,
      group: item.groupName,
      major: item.majorName,
      degrees: item.degreeName,
      faculty: item.department?.name || 'N/A',
      semester: item.semester,
      shift: item.shift?.name || 'N/A',
      status: item.archived ? 'archived' : 'active',
    }));
  } catch (error) {
    console.error("Failed to fetch instructor classes:", error);
    return []; // Return an empty array on error
  }
};

/**
 * The main page component that fetches data on the server.
 */
export default async function InstructorClassPage() {
    const initialClasses = await fetchInstructorClassData();

    return (
        <InstructorLayout activeItem="class" pageTitle="Class Management">
            <Suspense fallback={<InstructorClassPageSkeleton />}>
                <InstructorClassClientView initialClasses={initialClasses} />
            </Suspense>
        </InstructorLayout>
    );
}