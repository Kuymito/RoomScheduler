import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClassDetailSkeleton from '../components/ClassDetailSkeleton';
import ClassDetailClientView from '../components/ClassDetailClientView'; // We will create this next
import { notFound } from 'next/navigation';

// --- Data Simulation (Move to a central lib/data.js file in a real app) ---
const initialClassData = [
    { id: 1, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', semester: '2024-2025 S1', shift: '7:00 - 10:00', status: 'Active' },
    { id: 2, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', semester: '2024-2025 S1', shift: '7:00 - 10:00', status: 'Active' },
    { id: 3, name: 'NUM30-02', generation: '30', group: '02', major: 'CS', degrees: 'Bachelor', faculty: 'Faculty of CS', semester: '2024-2025 S1', shift: '8:00 - 11:00', status: 'Active' },
    { id: 4, name: 'NUM32-03', generation: '32', group: '03', major: 'IS', degrees: 'Bachelor', faculty: 'Faculty of IS', semester: '2024-2025 S2', shift: '9:00 - 12:00', status: 'Active' },
    { id: 5, name: 'NUM32-04', generation: '32', group: '04', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE', semester: '2024-2025 S2', shift: '13:00 - 16:00', status: 'Active' },
    { id: 6, name: 'NUM32-05', generation: '32', group: '05', major: 'AI', degrees: 'Bachelor', faculty: 'Faculty of AI & R', semester: '2024-2025 S2', shift: '15:00 PM - 18:00', status: 'Active' },
    { id: 7, name: 'NUM33-06', generation: '33', group: '06', major: 'DS', degrees: 'Bachelor', faculty: 'Faculty of DS', semester: '2024-2025 S3', shift: '17:00 - 20:00', status: 'Active' },
    { id: 8, name: 'NUM33-07', generation: '33', group: '07', major: 'ML', degrees: 'Bachelor', faculty: 'Faculty of ML', semester: '2024-2025 S3', shift: '18:00 - 21:00', status: 'Active' },
    { id: 9, name: 'NUM33-08', generation: '33', group: '08', major: 'DA', degrees: 'Bachelor', faculty: 'Faculty of DA', semester: '2024-2025 S3', shift: '19:00 - 22:00', status: 'Archived' },
    { id: 10, name: 'NUM33-09', generation: '33', group: '09', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE & R', semester: '2024-2025 S3', shift: '8:00 - 11:00', status: 'Active' }
];

const initialInstructorsData = [
    { id: 'inst1', name: 'Dr. Evelyn Reed', profileImage: '/images/admin.jpg', degree: 'PhD' },
    { id: 'inst2', name: 'Prof. Samuel Green', profileImage: null, degree: 'Master' },
    { id: 'inst3', name: 'Ms. Olivia Blue', profileImage: '', degree: 'Associate' },
    { id: 'inst4', name: 'Mr. Kenji Tanaka', profileImage: '/images/reach.jpg', degree: 'PhD' },
    { id: 'inst5', name: 'Dr. Aisha Khan', profileImage: null, degree: 'Master' },
    { id: 'inst6', name: 'Prof. Ethan Brown', profileImage: null, degree: 'Associate' },
    { id: 'inst7', name: 'Ms. Olivia Green', profileImage: null, degree: 'PhD' },
    { id: 'inst8', name: 'Mr. Kenji Tanaka', profileImage: null, degree: 'Master' },
    { id: 'inst9', name: 'Dr. Aisha Khan', profileImage: null, degree: 'Associate' },
    { id: 'inst10', name: 'Prof. Ethan Brown', profileImage: null, degree: 'PhD' },
];

/**
 * Server-side data fetching function. This runs on the server, not in the browser.
 * It fetches both the class details and the list of available instructors.
 */
const fetchClassDetailData = async (id) => {
    console.log(`Fetching data for class ID: ${id} on the server.`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const classDetails = initialClassData.find(cls => cls.id === id);
    // In a real app, you would also fetch the instructors and any existing schedule here.
    const instructors = initialInstructorsData; 

    return { classDetails, instructors };
};

/**
 * The main page is now an async Server Component.
 * It receives `params` from the URL to fetch the correct data.
 */
export default async function ClassDetailsPage({ params }) {
    const classId = parseInt(params.classId, 10);
    const { classDetails, instructors } = await fetchClassDetailData(classId);

    // If no class is found for the given ID, show a 404 page.
    if (!classDetails) {
        notFound();
    }

    return (
        <AdminLayout activeItem="class" pageTitle="Class Details">
            <Suspense fallback={<ClassDetailSkeleton />}>
                {/* Render the Client Component, passing the server-fetched data as props.
                  The browser receives the pre-rendered HTML for an instant load, then the
                  client-side JS hydrates the component to make it fully interactive.
                */}
                <ClassDetailClientView 
                    initialClassDetails={classDetails}
                    allInstructors={instructors}
                />
            </Suspense>
        </AdminLayout>
    );
}