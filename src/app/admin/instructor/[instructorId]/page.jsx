import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import InstructorDetailSkeleton from '../components/InstructorDetailSkeleton';
import InstructorDetailClientView from '../components/InstructorDetailClientView'; // We will create this
import { notFound } from 'next/navigation';

// --- Data Simulation & Options (Keep these here or move to a central lib/data.js) ---
const initialInstructorData = [
    { id: 1, name: 'Sok Mean', firstName: 'Sok', lastName: 'Mean', email: 'sok.mean@example.com', phone: '012345678', major: 'Computer Science', degree: 'PhD', department:'Faculty of CS', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=68', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 2, name: 'Sok Chan', firstName: 'Sok', lastName: 'Chan', email: 'sok.chan@example.com', phone: '012345679', major: 'Information Technology', degree: 'Master', department:'Faculty of IT', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=52', address : '123 Main St, Phnom Penh, Cambodia', password: 'password456' },
    { id: 3, name: 'Dara Kim', firstName: 'Dara', lastName: 'Kim', email: 'dara.kim@example.com', phone: '012345680', major: 'Information Systems', degree: 'Professor', department:'Faculty of IS', status: 'active', profileImage: null, address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 4, name: 'Lina Heng', firstName: 'Lina', lastName: 'Heng', email: 'lina.heng@example.com', phone: '012345681', major: 'Artificial Intelligence', degree: 'PhD', department:'Faculty of AI', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=25', address : '123 Main St, Phnom Penh, Cambodia', password: 'password111' },
    { id: 5, name: 'Virak Chea', firstName: 'Virak', lastName: 'Chea', email: 'virak.chea@example.com', phone: '012345682', major: 'Data Science', degree: 'Master', department:'Faculty of DS', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=33', address : '123 Main St, Phnom Penh, Cambodia', password: 'password222' },
    { id: 6, name: 'Sophea Nov', firstName: 'Sophea', lastName: 'Nov', email: 'sophea.nov@example.com', phone: '012345683', major: 'Machine Learning', degree: 'Lecturer', department:'Faculty of ML', status: 'active', profileImage: null, address : '123 Main St, Phnom Penh, Cambodia', password: 'password333' }, // No image
    { id: 7, name: 'Chanthy Pen', firstName: 'Chanthy', lastName: 'Pen', email: 'chanthy.pen@example.com', phone: '012345684', major: 'Data Analytics', degree: 'Associate Professor', department:'Faculty of DA', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=17', address : '123 Main St, Phnom Penh, Cambodia', password: 'password444' },
    { id: 8, name: 'Vicheka Sreng', firstName: 'Vicheka', lastName: 'Sreng', email: 'vicheka.sreng@example.com', phone: '012345685', major: 'Software Engineering', degree: 'PhD', department:'Faculty of SE', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=41', address : '123 Main St, Phnom Penh, Cambodia', password: 'password555' },
];

/**
 * Server-side data fetching function.
 * This runs on the server, not in the browser.
 */
const fetchInstructorDetails = async (id) => {
    console.log(`Fetching data for instructor ID: ${id} on the server.`);
    // Artificial delay removed
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