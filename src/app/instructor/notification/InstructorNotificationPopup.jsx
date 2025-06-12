'use client';
import React from 'react';
import InstructorNotificationItem from './InstructorNotificationItem';

const InstructorNotificationPopup = ({ show, notifications = [], onMarkAllRead, anchorRef }) => {
  if (!show) return null;

  // --- Popup Positioning ---
  // Calculates the position of the popup to appear below the notification bell icon.
  const popupStyle = anchorRef?.current
    ? {
        position: 'absolute',
        top: `${anchorRef.current.getBoundingClientRect().bottom + window.scrollY + 10}px`,
        right: `${window.innerWidth - anchorRef.current.getBoundingClientRect().right}px`,
      }
    : {
        position: 'fixed',
        right: '20px',
        top: '80px',
      };

  return (
    <div
      className="w-[480px] max-w-[95vw] bg-white dark:bg-gray-800 shadow-xl rounded-lg z-50 flex flex-col border border-gray-200 dark:border-gray-700"
      style={popupStyle}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
          Notifications
        </h2>
        <button
          onClick={onMarkAllRead}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          title="Mark all notifications as read"
        >
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <div className="flex flex-col flex-1 overflow-y-auto max-h-[500px]">
        {notifications && notifications.length > 0 ? (
          notifications.map(notification => (
            <InstructorNotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
            No new notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorNotificationPopup;