import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorDetailSkeleton from '../components/InstructorDetailSkeleton';
import InstructorDetailClientView from '../components/InstructorDetailClientView'; // We will create this
import { notFound } from 'next/navigation';

// --- Data Simulation & Options (Keep these here or move to a central lib/data.js) ---
const initialInstructorData = [
    { id: 1, name: 'Phay SOM', firstName: 'Phay', lastName: 'SOM', email: 'physom@gmail.com', phone: '012886667', major: 'Research Methodology', degree: 'PhD', department:'Faculty of IT', status: 'active', profileImage: 'https://media.licdn.com/dms/image/v2/C5603AQFztJoAXb0vTQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1616584101352?e=2147483647&v=beta&t=LTffaDKSkt4qCR2VgtDbeRkKF8Trhm_pqe-T7tlvbXk', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 2, name: 'Sam Vicheka', firstName: 'Sam', lastName: 'Vicheka', email: 'samvicheka@gmail.com', phone: '093956789', major: 'Network', degree: 'Master', department:'Faculty of IT', status: 'active', profileImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_UOl581yD7ebvnmXxGNIZiqRT4NTHD33igA&s', address : '123 Main St, Phnom Penh, Cambodia', password: 'password456' },
    { id: 3, name: 'Sreng Vichet', firstName: 'Sreng', lastName: 'Vichet', email: 'srengvichet@gmail.com', phone: '012345680', major: 'Information Technology', degree: 'Professor', department:'Faculty of IT', status: 'active', profileImage: 'data:image/jpeg;base64,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', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 4, name: 'Kang Sovannara', firstName: 'Kang', lastName: 'Sovvanara', email: 'kangsovvanara@gmail.com', phone: '012345681', major: 'Management of Change / Business / Investment Management', degree: 'PhD',department:'Faculty of Management', status: 'archived', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/DrKang-Sovannara-e1693628853981.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 5, name: 'Sok Seang', firstName: 'Sok', lastName: 'Seang', email: 'sokseang@gamil.com', phone: '012345682',  major: 'Entrepreneurship', degree: 'PhD', department:'Faculty of Business', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/DrSok-Seang-e1693629096526.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 6, name: 'Phim Runsinarith', firstName: 'Phim', lastName: 'Runsinarith', email: 'phimrunsinarith@gamil.com', phone: '012345683', major: 'Research / Economics', degree: 'PhD',department:'Faculty of Business', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/DrPhim-Runsinarith-1-e1693629343364.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' }, // No image
    { id: 7, name: 'Ly Sok Heng', firstName: 'Ly', lastName: 'Sok Heng', email: 'sokheng@gmail.com', phone: '012345684', major: 'Economics/ Finance', degree: 'PhD',department:'Faculty of Finance', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/Dr-Ly-Sok-Heng-e1693626068844.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 8, name: 'Heng Dyna', firstName: 'Heng', lastName: 'Dyna', email: 'hengdyna@gamil.com.com', phone: '012345684', major: 'Economics/ Finance', degree: 'PhD',department:'Faculty of Finance', status: 'active', profileImage: 'https://num.e-khmer.com/wp-content/uploads/2023/09/Dr-Heng-Dyna.png', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },


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