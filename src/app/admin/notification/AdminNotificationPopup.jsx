// NotificationPopup.js
'use client';
import React from 'react';
import NotificationItem from './AdminNotification';

const NotificationPopup = ({ show, notifications = [], onMarkAllRead, onApprove, onDeny, anchorRef // Optional ref of the bell icon for positioning
}) => {
  if (!show) return null;
  
  let popupStyle = {
    right: '20px', // Default like UserPopup
    top: '80px',   // Default like UserPopup
  };

  if (anchorRef && anchorRef.current) {
    const rect = anchorRef.current.getBoundingClientRect();
    popupStyle = {
      position: 'absolute', // Ensure it's absolute for top/left to work relative to positioned parent or viewport
      top: `${rect.bottom + window.scrollY + 8}px`, // Position below the anchor + 8px gap
      right: `${window.innerWidth - rect.right - (400 - rect.width)/2 - rect.left}px`, // Attempt to center/align right
      // Ensure right positioning doesn't push it off-screen
      // A more common pattern is to align its right edge with the anchor's right edge
      // right: `${window.innerWidth - rect.right}px`, 
      left: `${rect.left + rect.width / 2 - 400 + 20}px`, // Attempt to align right edge of popup with right of icon
    };
     // Simplified positioning: align popup's top-right near the icon's bottom-right
    popupStyle = {
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 10}px`, // Below the icon
        right: `${window.innerWidth - rect.right}px`, // Align right edges. Adjust as needed.
        // This might need to be refined based on overall page layout
    };
  }


  return (
    // Admin Popup (main container for notifications)
    // Using fixed position relative to viewport for simplicity if anchorRef is tricky
    // For better positioning, consider using a popover library.
    <div
      className="fixed md:absolute w-[400px] h-[600px] bg-white dark:bg-gray-800 shadow-[0px_2px_15px_rgba(0,0,0,0.25)] rounded-[10px] z-[1000] flex flex-col right-5 top-20 md:right-auto md:left-auto" // Default fixed position, can be overridden by style prop
      style={anchorRef?.current ? popupStyle : {}} // Apply calculated style if anchorRef is present
    >
      {/* Header Section */}
      <div className="relative flex justify-between items-center py-[20px] px-[21px]"> {/* padding simplified. top:20px, left:21px for title */}
        <h2 className="font-roboto font-semibold text-xl leading-[23px] text-gray-800 dark:text-gray-100">
          Notifications
        </h2>
        {/* Frame 8 & light-mode/Mark as Read */}
        <div className="flex flex-row justify-end items-center gap-3"> {/* gap: 12px */}
          <button
            onClick={onMarkAllRead}
            className="font-inter font-medium text-xs leading-tight text-[#2E70E8] dark:text-blue-500 hover:underline" // line-height: 100% (12px)
            title="Mark all notifications as read"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Frame 1321314673 (Notification List Area) */}
      <div className="flex flex-col items-start flex-1 overflow-y-auto dark:bg-gray-800 border-t border-[#E2E8F0] dark:border-slate-600 rounded-b-[10px]"> {/* top: 74px implies it's below header. Added border */}
        {notifications && notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onApprove={onApprove}
              onDeny={onDeny}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 text-gray-500">
            No new notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;