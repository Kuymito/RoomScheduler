import AdminLayout from '@/components/AdminLayout';

const InstructorViewContent = () => {    
    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Instructor</h1>
        <p>Welcome to the admin instructor. view instructor, and more.</p>
        {/* Add more dashboard content here */}
        </div>
    );
};

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Management">
            <InstructorViewContent/>
        </AdminLayout>
    );
}