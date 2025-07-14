import React from 'react';
import NotificationItem from './NotificationItem'; // Adjust the import path

const NotificationList = ({ notifications, onApprove, onDeny, onMarkAsRead }) => {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        You have no new notifications.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* This is the correct way to render the list.
        Use a direct .map() and pass the full notification object as a prop.
        The key should be a unique identifier like notification.notificationId.
      */}
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.notificationId}
          notification={notification}
          onApprove={onApprove}
          onDeny={onDeny}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};

export default NotificationList;