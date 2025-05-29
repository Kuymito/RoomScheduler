import AdminLayout from '@/components/AdminLayout';

const ClassViewContent = () => {    
    return (
        <div className="p-6">
        <h1 className="text-lg font-bold mb-4">Class</h1>
        <hr className="border-t border-gray-200 mt-4 mb-4" />
        <p>Welcome to the admin class. view class, and more.</p>
        {/* Add more dashboard content here */}
        </div>
    );
};

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="class" pageTitle="Class Management">
            <ClassViewContent/>
        </AdminLayout>
    );
}