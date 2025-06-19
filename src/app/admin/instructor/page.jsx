import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorPageSkeleton from './components/InstructorPageSkeleton';
import InstructorClientView from './components/InstructorClientView'; // We will create this next

const fetchInstructorData = async () => {
    const initialInstructorData = [
        { id: 1, name: 'Sok Mean', firstName: 'Sok', lastName: 'Mean', email: 'sok.mean@example.com', phone: '012345678', majorStudied: 'Computer Science', qualifications: 'PhD', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=68' },
        { id: 2, name: 'Sok Chan', firstName: 'Sok', lastName: 'Chan', email: 'sok.chan@example.com', phone: '012345679', majorStudied: 'Information Technology', qualifications: 'Master', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=52' },
        { id: 3, name: 'Dara Kim', firstName: 'Dara', lastName: 'Kim', email: 'dara.kim@example.com', phone: '012345680', majorStudied: 'Information Systems', qualifications: 'Professor', status: 'active', profileImage: null },
        { id: 4, name: 'Lina Heng', firstName: 'Lina', lastName: 'Heng', email: 'lina.heng@example.com', phone: '012345681', majorStudied: 'Artificial Intelligence', qualifications: 'PhD', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=25' },
        { id: 5, name: 'Virak Chea', firstName: 'Virak', lastName: 'Chea', email: 'virak.chea@example.com', phone: '012345682', majorStudied: 'Data Science', qualifications: 'Master', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=33' },
        { id: 6, name: 'Sophea Nov', firstName: 'Sophea', lastName: 'Nov', email: 'sophea.nov@example.com', phone: '012345683', majorStudied: 'Machine Learning', qualifications: 'Lecturer', status: 'active', profileImage: null },
        { id: 7, name: 'Chanthy Pen', firstName: 'Chanthy', lastName: 'Pen', email: 'chanthy.pen@example.com', phone: '012345684', majorStudied: 'Data Analytics', qualifications: 'Associate Professor', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=17' },
        { id: 8, name: 'Vicheka Sreng', firstName: 'Vicheka', lastName: 'Sreng', email: 'vicheka.sreng@example.com', phone: '012345685', majorStudied: 'Software Engineering', qualifications: 'PhD', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=41' },
    ];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return initialInstructorData;
};

export default async function AdminInstructorsPage() {
    // Data is fetched on the server before the page is sent to the client.
    const initialInstructors = await fetchInstructorData();

    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Management">
            <Suspense fallback={<InstructorPageSkeleton />}>
                 {/* We render the Client Component here, passing the server-fetched data as a prop.
                   The browser will receive the pre-rendered HTML for the table, making the initial
                   load appear instant. Then, the client-side JavaScript will load to make it interactive.
                 */}
                <InstructorClientView initialInstructors={initialInstructors} />
            </Suspense>
        </AdminLayout>
    );
}
