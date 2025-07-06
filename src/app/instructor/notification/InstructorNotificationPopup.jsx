// src/app/instructor/notification/InstructorNotificationPopup.jsx
'use client';

import React from 'react';
import InstructorNotification from './InstructorNotification'; // Assumes the item component is in the same folder

const InstructorNotificationPopup = ({
  show,
  notifications,
  onMarkAllRead,
  onMarkAsRead,
  anchorRef,
}) => {
  if (!show) {
    return null;
  }
  
  const hasUnread = notifications.some(n => n.isUnread);

  return (
    <div
      className="absolute top-full right-0 mt-3 w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 z-50 animate-fade-in-down"
      style={{
        // Positioning logic can be adjusted based on your layout needs
        top: anchorRef.current ? anchorRef.current.offsetTop + anchorRef.current.offsetHeight : '90px',
        right: '20px',
      }}
    >
      {/* --- Popup Header --- */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
          Notifications
        </h3>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* --- Scrollable Notification List Container --- */}
      <div className="flex flex-col max-h-[450px] overflow-y-auto">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <InstructorNotification
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        ) : (
          <div className="text-center p-8">
            <p className="text-slate-500 dark:text-gray-400">
              You have no notifications right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorNotificationPopup;