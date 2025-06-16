// src/app/instructor/notification/InstructorNotificationPopup.jsx
'use client';
import React, { useState, useEffect } from 'react';
import InstructorNotification from './InstructorNotification';

const InstructorNotificationPopup = ({ show, notifications = [], onMarkAllRead, onMarkAsRead, anchorRef }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsExiting(false);
    }
  }, [show]);

  if (!show && !isExiting) return null;

  let popupStyle = {
    right: '20px',
    top: '80px',
  };

  if (anchorRef && anchorRef.current) {
    const rect = anchorRef.current.getBoundingClientRect();
    popupStyle = {
      position: 'absolute',
      top: `${rect.bottom + window.scrollY + 10}px`,
      right: `${window.innerWidth - rect.right}px`,
    };
  }

  return (
    <div
      className={`fixed md:absolute w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg z-[1000] flex flex-col right-5 top-20 md:right-auto md:left-auto
        ${show && !isExiting ? 'animate-fade-in-scale' : ''}
        ${isExiting ? 'animate-fade-out-scale' : ''}
      `}
      style={anchorRef?.current ? popupStyle : {}}
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

      <div className="flex flex-col flex-1 overflow-y-auto dark:bg-gray-800 border-t border-gray-200 dark:border-slate-600 rounded-b-lg">
        {notifications && notifications.length > 0 ? (
          notifications.map(notification => (
            <InstructorNotification
              key={notification.id}
              notification={notification}
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

export default InstructorNotificationPopup;