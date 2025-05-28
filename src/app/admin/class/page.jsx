import AdminLayout from '@/components/AdminLayout';

const ClassViewContent = () => {    
    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Class</h1>
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