'use client';

import DashboardLayout from '@/components/DashboardLayout';

const DashboardViewContent = () => {    
    return (
        <div className="p-6 dark:text-white">
            <h1 className="text-lg font-bold mb-4">Dashboard</h1>
            <hr className="border-t border-gray-200 mt-4 mb-4" />
        {/* Add more dashboard content here */}
        </div>
    );
};

export default function AdminDashboardPage() {
    return (
        <DashboardLayout activeItem="dashboard" pageTitle="Dashboard">
            <DashboardViewContent/>
        </DashboardLayout>
    );
}
