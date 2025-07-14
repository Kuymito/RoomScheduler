'use client';
import React, { useState, useEffect, useMemo } from 'react';
import NotificationItem from './AdminNotification';
import { useSession } from 'next-auth/react';
import { notificationService } from '@/services/notification.service';

const NotificationPopup = ({ show, notifications = [], onMarkAllRead, onApprove, onDeny, onMarkAsRead, anchorRef, onClose }) => {
    const { data: session } = useSession();
    const [isExiting, setIsExiting] = useState(false);

    const allItems = useMemo(() => {
        if (!notifications) return [];
        const validItems = notifications.filter(item => item && item.message);
        validItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return validItems;
    }, [notifications]);

    useEffect(() => {
        if (!show) {
            setIsExiting(false);
        }
    }, [show]);

    const handleMarkAllRead = async () => {
        if (session?.accessToken && notifications.length > 0) {
            try {
                await notificationService.markAllNotificationsAsRead(notifications, session.accessToken);
                if (typeof onMarkAllRead === 'function') {
                    onMarkAllRead();
                }
            } catch (error) {
                console.error("Failed to mark all notifications as read:", error);
            }
        }
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 200);
    };

    if (!show && !isExiting) return null;

    let popupStyle = { right: '20px', top: '80px' };
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
            className={`fixed md:absolute w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg z-[1000] flex flex-col right-5 top-20 md:right-auto md:left-auto ${show && !isExiting ? 'animate-fade-in-scale' : ''} ${isExiting ? 'animate-fade-out-scale' : ''}`}
            style={anchorRef?.current ? popupStyle : {}}
        >
            <div className="relative flex justify-between items-center py-4 px-5">
                <h2 className="font-roboto font-semibold text-xl text-gray-800 dark:text-gray-100">
                    Notifications
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleMarkAllRead}
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
                            key={item.notificationId}
                            notification={item}
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