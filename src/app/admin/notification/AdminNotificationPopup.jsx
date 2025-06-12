// src/app/admin/notification/AdminNotificationPopup.jsx
'use client';
import React from 'react';
import NotificationItem from './AdminNotification';

const NotificationPopup = ({ show, notifications = [], onMarkAllRead, onApprove, onDeny, onNotificationClick, anchorRef }) => {
    if (!show) return null;
  
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
            className="fixed md:absolute w-[400px] h-[600px] bg-white dark:bg-gray-800 shadow-[0px_2px_15px_rgba(0,0,0,0.25)] rounded-[10px] z-[1000] flex flex-col right-5 top-20 md:right-auto md:left-auto"
            style={anchorRef?.current ? popupStyle : {}}
        >
            <div className="relative flex justify-between items-center py-[20px] px-[21px]">
                <h2 className="font-roboto font-semibold text-xl leading-[23px] text-gray-800 dark:text-gray-100">
                    Notifications
                </h2>
                <div className="flex flex-row justify-end items-center gap-3">
                    <button
                        onClick={onMarkAllRead}
                        className="font-inter font-medium text-xs leading-tight text-[#2E70E8] dark:text-blue-500 hover:underline"
                        title="Mark all notifications as read"
                    >
                        Mark all as read
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-start flex-1 overflow-y-auto dark:bg-gray-800 border-t border-[#E2E8F0] dark:border-slate-600 rounded-b-[10px]">
                {notifications && notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onApprove={onApprove}
                            onDeny={onDeny}
                            onNotificationClick={onNotificationClick} // Pass the click handler down
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