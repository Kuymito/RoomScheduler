import InstructorLayout from '@/components/InstructorLayout';

const InstructorDashboardViewContent = () => {    
    return (
        <div className="p-6 dark:text-white">
            <h1 className="text-lg font-bold mb-4">Dashboard</h1>
            <hr className="border-t border-gray-200 mt-4 mb-4" />
            <p>Welcome to the instructor Dashboard.</p>
        {/* Add more dashboard content here */}
        </div>
    );
};

export default function InstructorDashboardPage() {
    return (
        <InstructorLayout activeItem="dashboard" pageTitle="Dashboard">
            <InstructorDashboardViewContent/>
        </InstructorLayout>
    );
}