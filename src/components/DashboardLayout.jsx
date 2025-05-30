// components/AdminLayout.js (or a suitable path)
'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AdminPopup from 'src/app/admin/profile/components/AdminPopup'; // Adjust path if AdminPopup is more general
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';

export default function DashboardLayout({ children, activeItem, pageTitle }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    
    // activeNavItem and pageSubtitle are now primarily driven by props from the specific page
    // but we still need to pass activeItem to Sidebar and pageTitle to Topbar.
    // The handleNavItemClick might now live in the page that uses the layout if it needs to control routing,
    // or the layout can handle it if it's just for visual state within the layout.
    // For simplicity, let's assume Sidebar clicks might trigger navigation handled by Next.js Link components within Sidebar.

    const adminPopupRef = useRef(null);
    const userIconRef = useRef(null);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const handleUserIconClick = (event) => { event.stopPropagation(); setShowAdminPopup(!showAdminPopup); };
    const handleLogoutClick = () => { setShowAdminPopup(false); setShowLogoutAlert(true); };
    const handleCloseLogoutAlert = () => setShowLogoutAlert(false);
    const handleConfirmLogout = () => { 
        alert('Logged out'); 
        setShowLogoutAlert(false); 
        // Add actual logout logic, possibly redirecting: router.push('/login');
    };
     
    // This specific handleNavItemClick might be less relevant if Sidebar items are Links
    // or if the page itself manages active state changes that cause re-renders.
    // If Sidebar needs to visually update based on the current page, 'activeItem' prop is key.
    const handleNavItemClick = (item) => {
        // If using Next.js App Router, navigation is usually done via <Link> components in Sidebar.
        // This handler might only be needed if you're not using Links for some reason or for other UI effects.
        console.log("Navigating to:", item); // Placeholder
        // For actual navigation, you'd use Next.js's router or <Link> components in Sidebar.
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAdminPopup && adminPopupRef.current && !adminPopupRef.current.contains(event.target) &&
                userIconRef.current && !userIconRef.current.contains(event.target)) {
                setShowAdminPopup(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showAdminPopup]);

    return (
        <div className="flex w-full min-h-screen bg-[#E2E1EF] dark:bg-gray-800">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                activeItem={activeItem} // Use prop to highlight active item
                onNavItemClick={handleNavItemClick} // Sidebar would ideally use Next.js <Link>
            />
            <div className={`main-content flex-grow flex flex-col transition-all duration-300 ease-in-out`}>
                <Topbar
                    onToggleSidebar={toggleSidebar}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onUserIconClick={handleUserIconClick}
                    pageSubtitle={pageTitle} // Use prop for the page title
                    userIconRef={userIconRef}
                />
                <main className="content-area flex-grow p-3 m-6 rounded-lg">
                    {children} {/* This is where the specific page content will go */}
                </main>
                <Footer />
            </div>

            <div ref={adminPopupRef}>
                <AdminPopup show={showAdminPopup} onLogoutClick={handleLogoutClick} />
            </div>
            <LogoutAlert show={showLogoutAlert} onClose={handleCloseLogoutAlert} onConfirmLogout={handleConfirmLogout} />
        </div>
    );
}