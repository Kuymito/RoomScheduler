import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorPageSkeleton from './components/InstructorPageSkeleton';
import InstructorClientView from './components/InstructorClientView'; // We will create this next

/**
 * Mock data fetching function. In a real app, this would fetch from your database.
 * Since this is a Server Component, this function runs on the server, not in the browser.
 */
const fetchInstructorData = async () => {
    const initialInstructorData = [
        { id: 1, name: 'PhySOM', firstName: 'Phy', lastName: 'SOM', email: 'physom@gmail.com', phone: '012345678', majorStudied: 'Research Methodology', qualifications: 'PhD', status: 'active', profileImage: '/images/instructor/PhaySOM.jpeg' },
        { id: 2, name: 'Sam Vicheka', firstName: 'Sam', lastName: 'Vicheka', email: 'Sam Vicheka.com', phone: '093956789', majorStudied: 'Network', qualifications: 'Master', status: 'active', profileImage: '/images/instructor/Sam Vicheka.jpeg' },
        { id: 3, name: 'Sreng Vichet', firstName: 'Sreng', lastName: 'Vichet', email: 'srengvichet@gmail.com', phone: '012345680', majorStudied: 'Information Technology', qualifications: 'Professor', status: 'active', profileImage: '/images/instructor/Sreng Vichet.jpeg' }, 
        { id: 4, name: 'Kang Sovannara', firstName: 'Kang', lastName: 'Sovannara', email: 'kangsovvanara@gmail.com', phone: '012345681', majorStudied: 'Management of Change / Business / Investment Management', qualifications: 'PhD', status: 'archived', profileImage: '/images/instructor/Kang Sovannara.png' },
        { id: 5, name: 'Sok Seang', firstName: 'Sok', lastName: 'Seang', email: 'sokseang@gmail.com', phone: '012345682', majorStudied: 'Entrepreneurship', qualifications: 'PhD', status: 'active', profileImage: '/images/instructor/Sok Seang.png' },
        { id: 6, name: 'Phim Runsinarith', firstName: 'Phim', lastName: 'Runsinarith', email: 'phimrunsinarith@gamil.com', phone: '012345683', majorStudied: 'Research / Economics', qualifications: 'PhD', status: 'active', profileImage: '/images/instructor/Phim Runsinarith.png' },
        { id: 7, name: 'Ly Sok Heng', firstName: 'Ly', lastName: 'Sok Heng', email: 'sokheng@gamil.com', phone: '012345684', majorStudied: 'Economics/ Finance', qualifications: 'PhD', status: 'active', profileImage: '/images/instructor/Ly Sok Heng.png' },
        { id: 8, name: 'Heng Dyna', firstName: 'Heng', lastName: 'Dyna', email: 'hengdyna@gamil.com', phone: '012345684', majorStudied: 'Economics/ Finance', qualifications: 'PhD', status: 'active', profileImage: '/images/instructor/Heng Dyna.png' }, 
    ];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return initialInstructorData;
};


/**
 * The main page component is now an async Server Component.
 */
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
