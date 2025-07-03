import { Suspense } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import InstructorClassClientView from './components/InstructorClassClientView';
import InstructorClassPageSkeleton from './components/InstructorClassPageSkeleton';

// --- SERVER-SIDE DATA FETCHING ---
const fetchClassData = async () => {
  // In a real app, this would be a database query.
  const initialClassData = [
    { id: 1, name: "NUM30-01", generation: "30", group: "01", major: "IT", degrees: "Bachelor", faculty: "Faculty of IT", semester: "2024-2025 S1", shift: "7:00 - 10:00", status: 'active' },
    { id: 2, name: "NUM30-01", generation: "30", group: "01", major: "IT", degrees: "Bachelor", faculty: "Faculty of IT", semester: "2024-2025 S1", shift: "7:00 - 10:00", status: 'active' },
    { id: 3, name: "NUM30-02", generation: "30", group: "02", major: "CS", degrees: "Bachelor", faculty: "Faculty of CS", semester: "2024-2025 S1", shift: "8:00 - 11:00", status: 'active' },
    { id: 4, name: "NUM32-03", generation: "32", group: "03", major: "IS", degrees: "Bachelor", faculty: "Faculty of IS", semester: "2024-2025 S2", shift: "9:00 - 12:00", status: 'active' },
    { id: 5, name: "NUM32-04", generation: "32", group: "04", major: "SE", degrees: "Bachelor", faculty: "Faculty of SE", semester: "2024-2025 S2", shift: "13:00 - 16:00", status: 'active' },
    { id: 6, name: "NUM32-05", generation: "32", group: "05", major: "AI", degrees: "Bachelor", faculty: "Faculty of AI & R", semester: "2024-2025 S2", shift: "15:00 PM - 18:00", status: 'active' },
    { id: 7, name: "NUM33-06", generation: "33", group: "06", major: "DS", degrees: "Bachelor", faculty: "Faculty of DS", semester: "2024-2025 S3", shift: "17:00 - 20:00", status: 'active' },
    { id: 8, name: "NUM33-07", generation: "33", group: "07", major: "ML", degrees: "Bachelor", faculty: "Faculty of ML", semester: "2024-2025 S3", shift: "18:00 - 21:00", status: 'active' },
    { id: 9, name: "NUM33-08", generation: "33", group: "08", major: "DA", degrees: "Bachelor", faculty: "Faculty of DA", semester: "2024-2025 S3", shift: "19:00 - 22:00", status: 'archived' },
    { id: 10, name: "NUM33-09", generation: "33", group: "09", major: "SE", degrees: "Bachelor", faculty: "Faculty of SE & R", semester: "2024-2025 S3", shift: "8:00 - 11:00", status: 'active' }
  ];
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return initialClassData;
};

/**
 * The main page component is now an async Server Component.
 */
export default async function InstructorClassPage() {
    // Data is fetched on the server before the page is sent to the client.
    const initialClasses = await fetchClassData();

    return (
        <InstructorLayout activeItem="class" pageTitle="Class Management">
            <Suspense fallback={<InstructorClassPageSkeleton />}>
                {/* The Client Component is rendered here, receiving the server-fetched data as a prop. */}
                <InstructorClassClientView initialClasses={initialClasses} />
            </Suspense>
        </InstructorLayout>
    );
}
