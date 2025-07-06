// src/app/admin/notification/AdminNotificationPopup.jsx
'use client';
import React, { useState, useEffect } from 'react';
import NotificationItem from './AdminNotification';

const NotificationPopup = ({ show, notifications = [], onMarkAllRead, onApprove, onDeny, onMarkAsRead, anchorRef }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsExiting(false);
    }
  }, [show]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  if (!show && !isExiting) return null;

  let popupStyle = {
    right: '20px',
    top: '80px',
  };

  // Adjust popup position based on the anchorRef (e.g., the notification icon)
  if (anchorRef && anchorRef.current) {
    const rect = anchorRef.current.getBoundingClientRect();
    popupStyle = {
      position: 'absolute',
      // Position the popup 10px below the anchor element, relative to its bottom edge
      top: `${rect.bottom + window.scrollY + 10}px`,
      // Position the popup aligned with the right edge of the anchor element
      right: `${window.innerWidth - rect.right}px`,
    };
  }

  return (
    <div
      className={`fixed md:absolute w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg z-[1000] flex flex-col right-5 top-20 md:right-auto md:left-auto
        ${show && !isExiting ? 'animate-fade-in-scale' : ''}
        ${isExiting ? 'animate-fade-out-scale' : ''}
      `}
      style={anchorRef?.current ? popupStyle : {}} // Apply dynamic style if anchorRef is available
    >
      <div className="relative flex justify-between items-center py-4 px-5">
        <h2 className="font-roboto font-semibold text-xl text-gray-800 dark:text-gray-100">
          Notifications
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onMarkAllRead}
            className="font-inter font-medium text-xs text-blue-600 dark:text-blue-500 hover:underline"
            title="Mark all notifications as read"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-scroll max-h-96 dark:bg-gray-800 border-t border-gray-200 dark:border-slate-600 rounded-b-lg">
        {notifications && notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onApprove={onApprove}
              onDeny={onDeny}
              onMarkAsRead={onMarkAsRead}
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