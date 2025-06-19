import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClassPageSkeleton from './components/ClassPageSkeleton';
import ClassClientView from './components/ClassClientView'; // We will create this next

/**
 * Mock data fetching function. In a real app, this would fetch from your database.
 * Because this is a Server Component, this function runs on the server.
 */
const fetchClassData = async () => {
    const initialClassData = [
        { id: 1, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', semester: 'Semester 1', shift: '7:00 - 10:00', status: 'active' },
        { id: 2, name: 'NUM30-01', generation: '30', group: '01', major: 'IT', degrees: 'Bachelor', faculty: 'Faculty of IT', semester: 'Semester 1', shift: '7:00 - 10:00', status: 'active' },
        { id: 3, name: 'NUM30-02', generation: '30', group: '02', major: 'CS', degrees: 'Bachelor', faculty: 'Faculty of CS', semester: 'Semester 1', shift: '10:30 - 13:30', status: 'active' },
        { id: 4, name: 'NUM32-03', generation: '32', group: '03', major: 'IS', degrees: 'Bachelor', faculty: 'Faculty of IS', semester: 'Semester 2', shift: '7:00 - 10:00', status: 'active' },
        { id: 5, name: 'NUM32-04', generation: '32', group: '04', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE', semester: 'Semester 2', shift: '14:00 - 17:00', status: 'active' },
        { id: 6, name: 'NUM32-05', generation: '32', group: '05', major: 'AI', degrees: 'Bachelor', faculty: 'Faculty of AI', semester: 'Semester 2', shift: '17:30 PM - 20:30', status: 'active' },
        { id: 7, name: 'NUM33-06', generation: '33', group: '06', major: 'DS', degrees: 'Bachelor', faculty: 'Faculty of DS', semester: 'Semester 3', shift: '17:30 PM - 20:30', status: 'active' },
        { id: 8, name: 'NUM33-07', generation: '33', group: '07', major: 'ML', degrees: 'Bachelor', faculty: 'Faculty of ML', semester: '2Semester 3', shift: '14:00 - 17:00', status: 'active' },
        { id: 9, name: 'NUM33-08', generation: '33', group: '08', major: 'DA', degrees: 'Bachelor', faculty: 'Faculty of DA', semester: 'Semester 3', shift: '17:30 PM - 20:30', status: 'archived' },
        { id: 10, name: 'NUM33-09', generation: '33', group: '09', major: 'SE', degrees: 'Bachelor', faculty: 'Faculty of SE & R', semester: '2024-2025 S3', shift: '7:00 - 10:00', status: 'active' }
    ];
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return initialClassData;
};

/**
 * The main page component is now an async Server Component.
 */
export default async function AdminClassPage() {
    // Data is fetched on the server before the page is sent to the browser.
    const initialClasses = await fetchClassData();

    return (
        <AdminLayout activeItem="class" pageTitle="Class Management">
            <Suspense fallback={<ClassPageSkeleton />}>
                {/* The Client Component is rendered here, receiving the server-fetched data as a prop.
                  The browser gets the pre-rendered HTML for the table, making the initial
                  load appear instant. Then, the client-side JavaScript loads to enable interactivity.
                */}
                <ClassClientView initialClasses={initialClasses} />
            </Suspense>
        </AdminLayout>
    );
}
