'use client';
import Image from 'next/image';
import React from 'react'; // Keep React import for ref

const Topbar = ({ onToggleSidebar, isSidebarCollapsed, onUserIconClick, pageSubtitle, userIconRef }) => {
  return (
    <div className="topbar bg-white shadow-custom-medium p-5 flex justify-between items-center">
      <div className="topbar-content-left flex items-center">
        <div
          id="sidebar-toggle"
          className="sidebar-toggle-btn text-xl cursor-pointer mr-4 p-2 rounded hover:bg-gray-100 select-none leading-none"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          onClick={onToggleSidebar}
        >
          {isSidebarCollapsed ? <span dangerouslySetInnerHTML={{ __html: '&#x2715;' }} /> : <span dangerouslySetInnerHTML={{ __html: '&#9776;' }} />}
        </div>
        <div className="page-title font-medium text-xl text-black">
          National University of Management
          <p className="dashboard text-sm font-normal text-blue-600 mt-1">{pageSubtitle}</p>
        </div>
      </div>
      <div className="topbar-icons flex items-center gap-4">
        <div className="icon-wrapper relative w-10 h-10 flex items-center justify-center border border-num-icon-border p-[10px] rounded-md">
          <Image src="/images/bell.png" alt="Notifications" width={20} height={20} className="h-5 w-5" />
          <div className="notification-badge absolute w-2 h-2 bg-num-red rounded-full top-[5px] right-[5px]"></div>
        </div>
        <div
          ref={userIconRef}
          className="user-icon relative w-10 h-10 flex items-center justify-center border border-num-icon-border p-[10px] rounded-md cursor-pointer"
          onClick={onUserIconClick}
        >
          <Image src="/images/icon.png" alt="User Menu" width={20} height={20} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default Topbar;