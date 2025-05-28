'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';

const DashboardViewContent = () => {    
    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to the admin dashboard. Here you can manage rooms, view schedules, and more.</p>
        {/* Add more dashboard content here */}
        </div>
    );
};

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="dashboard" pageTitle="Dashboard">
            <DashboardViewContent/>
        </AdminLayout>
    );
}
