'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AdminPopup from 'src/app/admin/profile/components/AdminPopup';
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';

export default function AdminLayout({ children, activeItem, pageTitle }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    
    const adminPopupRef = useRef(null);
    const userIconRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        }
    }, [isSidebarCollapsed]);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const handleUserIconClick = (event) => { event.stopPropagation(); setShowAdminPopup(!showAdminPopup); };
    const handleLogoutClick = () => { setShowAdminPopup(false); setShowLogoutAlert(true); };
    const handleCloseLogoutAlert = () => setShowLogoutAlert(false);
    const handleConfirmLogout = () => { 
        alert('Logged out'); 
        setShowLogoutAlert(false); 
    };
     
    const handleNavItemClick = (item) => {
        console.log("Navigating to:", item);
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
                    <main className="content-area flex-grow p-3 m-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
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