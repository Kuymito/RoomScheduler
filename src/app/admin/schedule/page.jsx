import AdminLayout from '@/components/AdminLayout';

const ScheduleViewContent = () => {    
    return (
        <div className="p-6">
        <h1 className="text-lg font-bold mb-4">Schedule</h1>
        <hr className="border-t border-gray-200 mt-4 mb-4" />
        <p>Welcome to the admin schedule. view schedules, and more.</p>
        {/* Add more dashboard content here */}
        </div>
    );
};

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="schedule" pageTitle="Schedule Management">
            <ScheduleViewContent/>
        </AdminLayout>
    );
}