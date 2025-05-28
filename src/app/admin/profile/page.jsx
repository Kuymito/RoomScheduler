'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AdminPopup from 'src/app/admin/profile/components/AdminPopup';
import LogoutAlert from '@/components/LogoutAlert';
import Footer from '@/components/Footer';

export default function AdminProfilePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [pageSubtitle, setPageSubtitle] = useState('Dashboard');

  const adminPopupRef = useRef(null);
  const userIconRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleUserIconClick = (event) => {
    event.stopPropagation();
    setShowAdminPopup(!showAdminPopup);
  };

  const handleLogoutClick = () => {
    setShowAdminPopup(false);
    setShowLogoutAlert(true);
  };

  const handleCloseLogoutAlert = () => {
    setShowLogoutAlert(false);
  };

  const handleConfirmLogout = () => {
    alert('Logged out successfully');
    setShowLogoutAlert(false);
    // Add actual logout logic here
  };

  const handleNavItemClick = (item) => {
    setActiveNavItem(item);
    const navItemText = item.charAt(0).toUpperCase() + item.slice(1);
    setPageSubtitle(navItemText);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAdminPopup &&
          adminPopupRef.current &&
          !adminPopupRef.current.contains(event.target) &&
          userIconRef.current &&
          !userIconRef.current.contains(event.target)
          ) {
        setShowAdminPopup(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAdminPopup]);


  return (
    <>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        activeItem={activeNavItem}
        onNavItemClick={handleNavItemClick}
      />

      <div className="main-content flex-grow flex flex-col">
        <Topbar
            onToggleSidebar={toggleSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
            onUserIconClick={handleUserIconClick}
            pageSubtitle={pageSubtitle}
            userIconRef={userIconRef}
        />

        {/* MODIFICATION 1: Reduce padding and margin on content-area, remove overflow-y-auto for now */}
        <div className="content-area flex-grow p-6 bg-white rounded-lg m-6"> {/* Was p-5 m-5 */}
          <div className="section-title font-semibold text-base text-num-dark-text mb-4"> {/* Was mb-5 */}
            Profile
          </div>
          {/* MODIFICATION 2: Reduce gap and bottom margin on profile-section */}
          <div className="profile-section flex gap-6 mb-4 flex-wrap"> {/* Was gap-[30px] mb-[30px] or gap-5 mb-6 */}
            {/* Avatar Card */}
            {/* Consider if h-[140px] is too tall or can be made flexible */}
            <div className="avatar-card w-[311px] h-[130px] p-3 bg-white border border-num-gray-light shadow-custom-light rounded-lg flex-shrink-0"> {/* Reduced h and p slightly */}
              <div className="avatar-content flex">
                <Image
                  src="/images/kok.png"
                  alt="Profile Avatar"
                  width={56} // Keep image size for now
                  height={56}
                  className="avatar-img w-14 h-14 rounded-full bg-num-content-bg mr-3" // Reduced mr
                />
                <div className="avatar-info flex flex-col">
                  <div className="avatar-name font-semibold text-lg text-black mb-0.5">Admin</div>
                  <div className="avatar-role text-[15px] text-num-gray mb-2">Admin</div> {/* Was mb-3 */}
                  <button className="avatar-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer"> {/* Reduced py and px */}
                    Upload Profile
                  </button>
                </div>
              </div>
            </div>

            {/* MODIFICATION 3: Reduce gap in info-details-wrapper */}
            <div className="info-details-wrapper flex-grow flex flex-col gap-6 min-w-[300px]"> {/* Was gap-[30px] or gap-5 */}
              {/* General Information Card */}
              <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light shadow-custom-light rounded-lg"> {/* Reduced p */}
                <div className  ="section-title font-semibold text-base text-num-dark-text mb-3">General information</div> {/* Was mb-5 */}
                {/* Form rows will have mb-2 or mb-1.5 if needed */}
                <div className="form-row flex gap-3 mb-2 flex-wrap"> {/* Was mb-3 */}
                  <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text mb-1">First Name</label> {/* Was mb-1.5 */}
                    <input
                      type="text"
                      className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text" /* Reduced py, text size */
                      defaultValue="Admin"
                    />
                  </div>
                  <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Last Name</label> {/* Was mb-1.5 */}
                    <input
                      type="text"
                      className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text" /* Reduced py, text size */
                      defaultValue="User"
                    />
                  </div>
                </div>
                {/* Repeat similar reductions for other form rows and their labels/inputs/buttons */}
                <div className="form-row flex gap-3 mb-2 flex-wrap">
                  <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Email</label>
                    <input
                      type="email"
                      className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light rounded-md font-medium text-[14px] text-gray-500"
                      defaultValue="admin@gmail.com"
                      readOnly
                    />
                  </div>
                  <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text"
                      defaultValue="+855 12 345 678"
                    />
                  </div>
                </div>
                 <div className="form-row flex gap-3 mb-2 flex-wrap">
                  <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Address</label>
                    <input
                      type="text"
                      className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text"
                      defaultValue="Phnom Penh, Cambodia"
                    />
                  </div>
                </div>
                <div className="form-actions flex justify-end mt-3"> {/* Was mt-5 */}
                  <button className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer"> {/* Reduced py, px */}
                    Save
                  </button>
                </div>
              </div>

              {/* Password Information Card - Apply similar reductions here */}
              <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light shadow-custom-light rounded-lg"> {/* Reduced p */}
                <div className="section-title font-semibold text-base text-num-dark-text mb-3">Password information</div> {/* Was mb-5 */}
                <div className="form-row flex gap-3 mb-2 flex-wrap"> {/* Was mb-3 */}
                  <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Current Password</label> {/* Was mb-1.5 */}
                    <input
                      type="password"
                      className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text" /* Reduced py, text size */
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text mb-1">New Password</label> {/* Was mb-1.5 */}
                    <input
                      type="password"
                      className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text" /* Reduced py, text size */
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                <div className="form-row flex gap-3 mb-2 flex-wrap"> {/* Was mb-3 */}
                  <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Confirm New Password</label> {/* Was mb-1.5 */}
                    <input
                      type="password"
                      className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text" /* Reduced py, text size */
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="form-actions flex justify-end mt-3"> {/* Was mt-5 */}
                  <button className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer"> {/* Reduced py, px */}
                    Save Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer/>
      </div>

      {/* Popups */}
      <div ref={adminPopupRef}>
        <AdminPopup show={showAdminPopup} onLogoutClick={handleLogoutClick} />
      </div>
      <LogoutAlert show={showLogoutAlert} onClose={handleCloseLogoutAlert} onConfirmLogout={handleConfirmLogout} />
    </>
  );
}