// src/app/admin/notification/AdminNotification.jsx
'use client';
import React from 'react';

// (Icon components remain the same as the previous step)
const ApprovedIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#4CAF50" fillOpacity="0.1"/>
        <path d="M9 12L11 14L15 10" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="11.5" stroke="#4CAF50" strokeOpacity="0.2"/>
    </svg>
);

const DeniedIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#F44336" fillOpacity="0.1"/>
        <path d="M15 9L9 15M9 9L15 15" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="11.5" stroke="#F44336" strokeOpacity="0.2"/>
    </svg>
);


const NotificationItem = ({ notification, onApprove, onDeny, onNotificationClick }) => {
    const { id, avatarUrl, message, timestamp, isUnread, type, status } = notification;
    const messageParts = message.split(/(Request)/i);
    const isActionable = type === 'roomRequest' && onApprove && onDeny;

    return (
        <div 
            className={`w-full cursor-pointer ${isUnread ? 'bg-blue-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => onNotificationClick && onNotificationClick(id)} // Handle click on the whole item
        >
            <div className="flex flex-row items-center p-4 gap-4 relative border-b border-gray-200 dark:border-gray-700">
                {isUnread && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <div className="pl-3">
                    <img 
                        src={avatarUrl || 'https://numregister.com/assets/img/logo/num.png'}
                        alt="Notification Avatar"
                        className="w-12 h-12 rounded-full flex-shrink-0 bg-cover bg-center"
                    />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <p className="font-sans text-sm leading-normal text-slate-800 dark:text-gray-300 break-words">
                        {messageParts.map((part, index) =>
                            part.toLowerCase() === 'request' ? <strong key={index} className="font-semibold text-gray-900 dark:text-gray-100">{part}</strong> : part
                        )}
                    </p>
                    {isActionable && (
                        <div className="flex flex-row items-center pt-1.5 gap-2.5">
                            <button onClick={(e) => { e.stopPropagation(); onApprove(id); }} className="flex justify-center items-center py-1.5 px-4 bg-blue-600 rounded-md text-white font-inter font-medium text-xs hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm">
                                Approve
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDeny(id); }} className="box-border flex justify-center items-center py-1.5 px-4 text-gray-800 dark:text-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md font-inter font-medium text-xs active:bg-slate-100 border dark:border-gray-500 transition-colors shadow-sm">
                                Deny
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                    {!isActionable && status === 'approved' && <ApprovedIcon />}
                    {!isActionable && status === 'denied' && <DeniedIcon />}
                    <span className="font-sans font-normal text-sm text-slate-500 dark:text-gray-400 whitespace-nowrap">
                        {timestamp}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;