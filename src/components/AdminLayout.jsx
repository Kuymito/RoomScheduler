'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';  // Assume Topbar.js exists
import Footer from './Footer';  // Assume Footer.js exists
import AdminPopup from '@/app/admin/profile/components/AdminPopup';// Assuming a more generic path
import LogoutAlert from './LogoutAlert';// Assuming a more generic path

export default function AdminLayout({ children, pageTitle }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    
    const adminPopupRef = useRef(null);
    const userIconRef = useRef(null); // This ref should be passed to and used by Topbar for the user icon

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const handleUserIconClick = (event) => { 
        event.stopPropagation(); 
        setShowAdminPopup(!showAdminPopup); 
    };
    const handleLogoutClick = () => { 
        setShowAdminPopup(false); 
        setShowLogoutAlert(true); 
    };
    const handleCloseLogoutAlert = () => setShowLogoutAlert(false);
    const handleConfirmLogout = () => { 
        alert('Logged out'); 
        setShowLogoutAlert(false); 
        // Add actual logout logic, e.g., router.push('/login');
    };
     
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAdminPopup && 
                adminPopupRef.current && !adminPopupRef.current.contains(event.target) &&
                userIconRef.current && !userIconRef.current.contains(event.target)) { // Check user icon too
                setShowAdminPopup(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showAdminPopup]); // Rerun effect if showAdminPopup changes

    return (
        <div className="flex w-full min-h-screen bg-[#E2E1EF]"> {/* Overall page background */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                // onToggleSidebar={toggleSidebar} // Topbar usually handles the toggle button
            />
            <div className={`main-content flex-grow flex flex-col transition-all duration-300 ease-in-out`}>
                <Topbar
                    onToggleSidebar={toggleSidebar} // Pass toggle function to Topbar
                    isSidebarCollapsed={isSidebarCollapsed} // Let Topbar know the state for its icon
                    onUserIconClick={handleUserIconClick}
                    pageSubtitle={pageTitle}
                    userIconRef={userIconRef} // Pass ref to Topbar
                />
                <main className="content-area flex-grow p-3 sm:p-6 m-3 sm:m-6 bg-white rounded-lg shadow-md">
                    {children} {/* Specific page content renders here */}
                </main>
                <Footer />
            </div>

            {/* Popups - ensure they are positioned correctly (e.g., fixed or absolute in a portal) */}
            <div ref={adminPopupRef}> {/* This div is just for the ref, AdminPopup controls its own visibility & positioning */}
              <AdminPopup show={showAdminPopup} onLogoutClick={handleLogoutClick} />
            </div>
            <LogoutAlert show={showLogoutAlert} onClose={handleCloseLogoutAlert} onConfirmLogout={handleConfirmLogout} />
        </div>
    );
}