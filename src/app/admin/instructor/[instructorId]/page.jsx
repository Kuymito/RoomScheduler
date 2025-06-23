import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorDetailSkeleton from '../components/InstructorDetailSkeleton';
import InstructorDetailClientView from '../components/InstructorDetailClientView'; // We will create this
import { notFound } from 'next/navigation';

// --- Data Simulation & Options (Keep these here or move to a central lib/data.js) ---
const initialInstructorData = [
    { id: 1, name: 'Phay SOM', firstName: 'Phay', lastName: 'SOM', email: 'physom@gmail.com', phone: '012886667', major: 'Research Methodology', degree: 'PhD', department:'Faculty of IT', status: 'active', profileImage: '/images/instructor/PhaySOM.jpeg', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 2, name: 'Sam Vicheka', firstName: 'Sam', lastName: 'Vicheka', email: 'samvicheka@gmail.com', phone: '093956789', major: 'Network', degree: 'Master', department:'Faculty of IT', status: 'active', profileImage: '/images/instructor/Sam Vicheka.jpeg', address : '123 Main St, Phnom Penh, Cambodia', password: 'password456' },
    { id: 3, name: 'Sreng Vichet', firstName: 'Sreng', lastName: 'Vichet', email: 'srengvichet@gmail.com', phone: '012345680', major: 'Information Technology', degree: 'Professor', department:'Faculty of IT', status: 'active', profileImage: '/images/instructor/Sreng Vichet.jpeg', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 4, name: 'Kang Sovannara', firstName: 'Kang', lastName: 'Sovvanara', email: 'kangsovvanara@gmail.com', phone: '012345681', major: 'Management of Change / Business / Investment Management', degree: 'PhD',department:'Faculty of Management', status: 'archived', profileImage: '/images/instructor/Kang Sovannara.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 5, name: 'Sok Seang', firstName: 'Sok', lastName: 'Seang', email: 'sokseang@gamil.com', phone: '012345682',  major: 'Entrepreneurship', degree: 'PhD', department:'Faculty of Business', status: 'active', profileImage: '/images/instructor/Sok Seang.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 6, name: 'Phim Runsinarith', firstName: 'Phim', lastName: 'Runsinarith', email: 'phimrunsinarith@gamil.com', phone: '012345683', major: 'Research / Economics', degree: 'PhD',department:'Faculty of Business', status: 'active', profileImage: '/images/instructor/Phim Runsinarith.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' }, // No image
    { id: 7, name: 'Ly Sok Heng', firstName: 'Ly', lastName: 'Sok Heng', email: 'sokheng@gmail.com', phone: '012345684', major: 'Economics/ Finance', degree: 'PhD',department:'Faculty of Finance', status: 'active', profileImage: '/images/instructor/Ly Sok Heng.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 8, name: 'Heng Dyna', firstName: 'Heng', lastName: 'Dyna', email: 'hengdyna@gamil.com.com', phone: '012345684', major: 'Economics/ Finance', degree: 'PhD',department:'Faculty of Finance', status: 'active', profileImage: '/images/instructor/Heng Dyna.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },


];

/**
 * Server-side data fetching function.
 * This runs on the server, not in the browser.
 */
const fetchInstructorDetails = async (id) => {
    console.log(`Fetching data for instructor ID: ${id} on the server.`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = initialInstructorData.find(inst => inst.id === id);
    return data;
};

/**
 * The page is now an async Server Component.
 * It receives `params` from the URL to fetch data.
 */
export default async function InstructorDetailsPage({ params }) {
    const instructorId = parseInt(params.instructorId, 10);
    const instructor = await fetchInstructorDetails(instructorId);

    // If no instructor is found, show a 404 page.
    if (!instructor) {
        notFound();
    }

    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Details">
            <Suspense fallback={<InstructorDetailSkeleton />}>
                {/* Render the Client Component, passing the server-fetched data as a prop.
                  The browser gets the pre-rendered HTML for an instant load, then the
                  client-side JS hydrates to make the form interactive.
                */}
                <InstructorDetailClientView initialInstructor={instructor} />
            </Suspense>
        </AdminLayout>
    );
}