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

    // Define sidebar widths for calculations
    const sidebarWidth = isSidebarCollapsed ? '80px' : '265px';
    // Define topbar height based on your design.
    // If your Topbar component's inner content has p-5, and it contains text,
    // a good estimate for the total height including padding and text might be around 90px.
    // Adjust this value to match your actual Topbar height.
    const TOPBAR_HEIGHT = '90px'; 

    return (
        <div className="flex w-full min-h-screen bg-[#E2E1EF] dark:bg-gray-800">
            {/* Sidebar (fixed) */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                activeItem={activeItem}
                onNavItemClick={handleNavItemClick}
            />

            {/* Main Content Area (flex-grow, scrollable) */}
            <div
                className="flex flex-col flex-grow transition-all duration-300 ease-in-out"
                style={{
                    marginLeft: sidebarWidth, // Push content right to make space for fixed sidebar
                    width: `calc(100% - ${sidebarWidth})`, // Occupy remaining width
                    height: '100vh', // Take full viewport height for scrolling
                    overflowY: 'auto', // Enable vertical scrolling for this container
                }}
            >
                {/* Topbar (fixed at the top of the main content area) */}
                {/* This div positions the Topbar component */}
                <div
                    className="fixed top-0 bg-white dark:bg-gray-900 shadow-custom-medium p-5 flex justify-between items-center z-30 transition-all duration-300 ease-in-out"
                    style={{
                        left: sidebarWidth, // Aligns with the end of the sidebar
                        width: `calc(100% - ${sidebarWidth})`, // Takes remaining width
                        height: TOPBAR_HEIGHT, // Set explicit height
                    }}
                >
                    <Topbar
                        onToggleSidebar={toggleSidebar}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onUserIconClick={handleUserIconClick}
                        pageSubtitle={pageTitle}
                        userIconRef={userIconRef}
                    />
                </div>

                {/* Content and Footer Container (scrolls with overflow) */}
                {/* This flex-grow div pushes the footer down and holds the main content */}
                <div className="flex flex-col flex-grow" style={{ paddingTop: TOPBAR_HEIGHT }}>
                    <main className="content-area flex-grow p-3 m-6">
                        {children} {/* Dynamic page content */}
                    </main>
                    <Footer />
                </div>
            </div>

            {/* Popups (positioned independently, often fixed or absolutely) */}
            <div ref={adminPopupRef}>
                <AdminPopup show={showAdminPopup} onLogoutClick={handleLogoutClick} />
            </div>
            <LogoutAlert show={showLogoutAlert} onClose={handleCloseLogoutAlert} onConfirmLogout={handleConfirmLogout} />
        </div>
    );
}