// Topbar.js
'use client';
import Image from 'next/image';
import React from 'react'; // Keep React import for ref
import ThemeToggle from './ThemeToggle'; // From 39f846b

const Topbar = ({
  onToggleSidebar,
  isSidebarCollapsed,
  onUserIconClick,
  pageSubtitle,
  userIconRef,
  onNotificationIconClick, // Prop from HEAD
  notificationIconRef,     // Prop from HEAD
  hasUnreadNotifications   // Prop from HEAD
}) => {
  return (
    <div className="flex justify-between items-center w-full h-full"> 
      <div className="topbar-content-left flex items-center">
        <div
          id="sidebar-toggle"
          className="sidebar-toggle-btn text-xl cursor-pointer mr-4 p-2 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 select-none leading-none"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          onClick={onToggleSidebar}
        >
          {/* Using spans for icons for simplicity in merge, original had dangerouslySetInnerHTML */}
          {isSidebarCollapsed ? <span>&#x2715;</span> : <span>&#9776;</span>}
        </div>
        <div className="page-title font-medium text-xl text-black dark:text-white">
          National University of Management
          <p className="dashboard text-sm font-normal text-blue-600 mt-1">{pageSubtitle}</p>
        </div>
      </div>
      <div className="topbar-icons flex items-center gap-4">
        <ThemeToggle /> {/* Added from 39f846b */}
        
        {/* Notification Icon from HEAD (prioritized for functionality) with dark mode wrapper considerations */}
        <div
          ref={notificationIconRef} 
          className="icon-wrapper relative w-10 h-10 flex items-center justify-center border border-num-icon-border dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" // Added dark:border-gray-700 and dark:hover:bg-gray-800
          onClick={onNotificationIconClick} 
          title="Notifications"
        >
          <Image src="/images/bell.png" alt="Notifications" width={20} height={20} className="h-5 w-5" /> {/* Consider dark mode filter for image if needed */}
          {hasUnreadNotifications && (
            <div className="notification-badge absolute w-2 h-2 bg-num-red rounded-full top-[5px] right-[5px]"></div>
          )}
        </div>

        {/* User Icon - Merged: SVG from both, ref/onClick from HEAD, dark mode wrapper from 39f846b */}
        <div
          ref={userIconRef}
          className="user-icon relative w-10 h-10 flex items-center justify-center border border-num-icon-border dark:bg-gray-800 dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" // hover:bg-gray-100 dark:hover:bg-gray-700 added for consistency
          onClick={onUserIconClick}
          title="User Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-black dark:text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Topbar;