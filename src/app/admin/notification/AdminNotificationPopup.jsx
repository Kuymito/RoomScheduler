// src/app/admin/notification/AdminNotificationPopup.jsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import NotificationItem from './AdminNotification';

const NotificationPopup = ({ show, notifications = [], changeRequests = [], onMarkAllRead, onApprove, onDeny, onMarkAsRead, anchorRef, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  // Combine, filter, and sort notifications and change requests into a single list
  const allItems = useMemo(() => {
    const processedNotifications = (notifications || []).map(n => ({
        ...n,
        id: `notif-${n.notificationId}`, // Create a unique key for React's map function
        type: 'notification',
        timestamp: n.createdAt,
    }));

    const processedChangeRequests = (changeRequests || []).map(cr => ({
        ...cr,
        id: `req-${cr.requestId}`, // Create a unique key for React's map function
        type: 'changeRequest',
        timestamp: cr.requestedAt,
    }));

    const combined = [...processedNotifications, ...processedChangeRequests];
    
    // Filter out items that have invalid or placeholder-only messages
    const validItems = combined.filter(item => {
        const message = item.description || item.message;
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return false; // Remove items with no message
        }
        const lowerMessage = message.trim().toLowerCase();
        // Remove items with common placeholder text
        if (lowerMessage === 'no description' || lowerMessage === 'string' || lowerMessage === 'ok') {
            return false;
        }
        return true;
    });
    
    // Sort the valid items by timestamp in descending order (most recent first)
    validItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return validItems;
  }, [notifications, changeRequests]);

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

      <div className="flex flex-col flex-1 overflow-y-scroll max-h-96 dark:bg-gray-800 border-t border-gray-200 dark:border-slate-600 rounded-b-lg">
        {allItems && allItems.length > 0 ? (
          allItems.map(item => (
            <NotificationItem
              key={item.id}
              notification={item} // Pass the unified and filtered item object
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