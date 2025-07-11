'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle'; // Assuming ThemeToggle is in the same directory or adjust path

const InstructorTopbar = ({ onToggleSidebar, isSidebarCollapsed, onUserIconClick, breadcrumbs, userIconRef, onNotificationIconClick, notificationIconRef, hasUnreadNotifications, }) => {
  return (
    <div className="flex justify-between items-center w-full h-full"> 
      <div className="topbar-content-left flex items-center">
        <div
          id="sidebar-toggle"
          className="sidebar-toggle-btn text-xl cursor-pointer mr-4 p-2 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 select-none leading-none"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          onClick={onToggleSidebar}
        >
          {isSidebarCollapsed ? <span dangerouslySetInnerHTML={{ __html: '&#x2715;' }} /> : <span dangerouslySetInnerHTML={{ __html: '&#9776;' }} />}
        </div>
        <div className="page-title font-medium text-xl text-black dark:text-white">
          National University of Management
          <div className="dashboard text-sm font-normal text-blue-600 mt-1 flex items-center">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:underline text-blue-600">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-blue-700 dark:text-blue-400">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <span className="mx-2 text-blue-400">&gt;</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="topbar-icons flex items-center gap-4">
        <ThemeToggle />
        
        <div
          ref={notificationIconRef} 
          className="icon-wrapper relative w-10 h-10 flex items-center justify-center border border-num-icon-border  dark:bg-gray-800 dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" // Added dark:border-gray-700 and dark:hover:bg-gray-800
          onClick={onNotificationIconClick} 
          title="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-16 w-12 text-black dark:text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          {hasUnreadNotifications && (
            <div className="notification-badge absolute w-2 h-2 bg-num-red rounded-full top-[5px] right-[5px]"></div>
          )}
        </div>
        
        <div
          ref={userIconRef}
          className="user-icon relative w-10 h-10 flex items-center justify-center border border-num-icon-border dark:bg-gray-800 dark:border-gray-700 p-[10px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onUserIconClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-black dark:text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default InstructorTopbar;