import { Suspense } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClassPageSkeleton from './components/ClassPageSkeleton';
import ClassClientView from './components/ClassClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axios from 'axios'; // Import axios for direct fetching

// The external API URL to be used by the server component directly.
const EXTERNAL_API_URL = "https://jaybird-new-previously.ngrok-free.app/api/v1";

/**
 * An async Server Component to fetch the data directly from the external API.
 */
async function ClassData() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("No access token found in session. User is not authenticated.");
        return <ClassClientView initialClasses={[]} />; 
    }

    try {
        // Fetch directly from the external API, bypassing the internal proxy route.
        const response = await axios.get(`${EXTERNAL_API_URL}/class`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });
        
        const apiData = response.data.payload;
        
        const formattedData = apiData.map(item => ({
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

        return <ClassClientView initialClasses={formattedData} />;
    } catch (error) {
        console.error("Failed to fetch class data in page.jsx:", error.message);
        return <ClassClientView initialClasses={[]} />; 
    }
}

/**
 * The main page component, responsible for layout and the Suspense boundary.
 */
export default function AdminClassPage() {
    return (
        <AdminLayout activeItem="class" pageTitle="Class Management">
            <Suspense fallback={<ClassPageSkeleton />}>
                <ClassData />
            </Suspense>
        </AdminLayout>
    );
}