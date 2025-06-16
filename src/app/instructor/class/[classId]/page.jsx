import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import InstructorLayout from '@/components/InstructorLayout';
import InstructorClassDetailSkeleton from '../components/InstructorClassDetailSkeleton';
import InstructorClassDetailClientView from '../components/InstructorClassDetailClientView';

// --- SERVER-SIDE DATA FETCHING ---

const fetchClassData = async (classId) => {
    // In a real app, this would be a database query for a specific class
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
    return initialClassData.find(cls => cls.id === classId);
};

const fetchScheduleData = async (classId) => {
     // This would also be a dynamic query based on classId
    const mockScheduleData = {
        Monday: { instructor: { name: 'Dr. Linda Keo', role: 'Doctor', avatar: '/images/admin.jpg' }, studyMode: 'In-Class' },
        Tuesday: { instructor: { name: 'Dr. Anthony Chea', role: 'Doctor', avatar: '/images/kok.png' }, studyMode: 'In-Class' },
        Wednesday: { instructor: { name: 'Mr. Alex Chan', role: 'Master', avatar: '/images/admin.jpg' }, studyMode: 'In-Class' },
        Thursday: { instructor: { name: 'Dr. Sokunthy Lim', role: 'Doctor', avatar: '/images/admin.jpg' }, studyMode: 'Online' },
        Friday: { instructor: { name: 'Dr. Anthony Chea', role: 'Doctor', avatar: '/images/admin.jpg' }, studyMode: 'Online' },
        Saturday: null,
        Sunday: null,
    };
    return mockScheduleData;
};


/**
 * The main page component is now an async Server Component.
 */
export default async function InstructorClassDetailsPage({ params }) {
    const classId = parseInt(params.classId, 10);
    
    // Fetch data in parallel on the server
    const [classDetails, schedule] = await Promise.all([
        fetchClassData(classId),
        fetchScheduleData(classId)
    ]);
    
    // If class doesn't exist, show a 404 page
    if (!classDetails) {
        notFound();
    }

    return (
        <InstructorLayout activeItem="class" pageTitle="Class Details">
            <Suspense fallback={<InstructorClassDetailSkeleton />}>
                {/* Render the Client Component, passing all server-fetched data as props. */}
                <InstructorClassDetailClientView
                    initialClassDetails={classDetails}
                    initialSchedule={schedule}
                />
            </Suspense>
        </InstructorLayout>
    );
}