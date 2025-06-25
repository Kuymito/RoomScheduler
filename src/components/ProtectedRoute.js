// components/ProtectedRoute.js
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (allowedRoles && !allowedRoles.some(role => user?.roles?.includes(role))) {
            router.push('/unauthorized');
        }
    }, [isAuthenticated, user, allowedRoles, router]);

    return isAuthenticated ? children : null;
}   