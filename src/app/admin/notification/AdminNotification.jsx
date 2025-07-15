import React, { useState } from 'react';
import Image from 'next/image';

// --- Icon Components ---
const CheckCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const RequestIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;

// This component determines which icon to show on the avatar based on status
const StatusIcon = ({ status }) => {
    switch (status) {
        case 'PENDING':
            return <RequestIcon className="w-6 h-6 text-blue-500 bg-white rounded-full absolute -bottom-1 -right-1" />;
        case 'APPROVED':
            return <CheckCircleIcon className="w-6 h-6 text-green-500 bg-white rounded-full absolute -bottom-1 -right-1" />;
        case 'DENIED':
            return <XCircleIcon className="w-6 h-6 text-red-500 bg-white rounded-full absolute -bottom-1 -right-1" />;
        default:
            return null;
    }
};


const NotificationItem = ({ notification, onApprove, onDeny, onMarkAsRead }) => {
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!notification) return null;

    const {
        message, profile, description, createdAt, status,
        changeRequestId, notificationId, read: isRead,
    } = notification;

    const isActionable = status === 'PENDING';
    const isUnread = !isRead;

    const AvatarPlaceholder = ({ name }) => (
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
            {name ? name.substring(0, 2).toUpperCase() : '??'}
        </div>
    );

    const handleItemClick = () => {
        if (isUnread && typeof onMarkAsRead === 'function') {
            onMarkAsRead(notificationId);
        }
    };

    return (
        <div
            className={`w-full transition-colors duration-200 ${isUnread ? 'bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            onClick={handleItemClick}
        >
            <div className="flex flex-row items-start p-4 md:p-5 gap-4 relative animate-fade-in-scale">
                {isUnread && (
                    <div className="absolute left-1.5 md:left-2 top-1.5 md:top-2 w-3 h-3 flex items-center justify-center z-10">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                )}
                
                <div className="relative flex-shrink-0">
                    {profile && !imageError ? (
                        <Image
                            src={profile}
                            alt="User profile"
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <AvatarPlaceholder name={message} />
                    )}
                    <StatusIcon status={status} />
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="font-inter font-semibold text-sm leading-normal text-slate-700 dark:text-gray-300 self-stretch flex items-baseline gap-2 flex-wrap">
                        <span>{message}</span>
                        {description && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDescriptionVisible(!isDescriptionVisible);
                                }}
                                className="text-blue-600 dark:text-blue-400 font-medium text-xs hover:underline ml-1"
                            >
                                {isDescriptionVisible ? 'View Less' : 'View More'}
                            </button>
                        )}
                    </div>
                    {isDescriptionVisible && description && (
                        <p className="font-inter text-sm text-slate-600 dark:text-gray-400 mt-1 animate-fade-in">
                            {description}
                        </p>
                    )}
                    {isActionable && (
                        <div className="flex flex-row items-center pt-1.5 gap-3">
                            <button onClick={(e) => { e.stopPropagation(); onApprove(changeRequestId); }} className="flex justify-center items-center py-2 px-4 bg-blue-600 rounded-md text-white font-inter font-medium text-xs hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm" title={`Approve request ${changeRequestId}`}>Approve</button>
                            <button onClick={(e) => { e.stopPropagation(); onDeny(changeRequestId); }} className="box-border flex justify-center items-center py-2 px-4 text-gray-800 dark:text-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md font-inter font-medium text-xs active:bg-slate-100 border dark:border-gray-500 transition-colors shadow-sm" title={`Deny request ${changeRequestId}`}>Deny</button>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end text-right flex-shrink-0 pl-2 ml-auto w-auto min-w-[60px]">
                    <span className="font-inter font-normal text-xs leading-normal text-slate-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
            <div className="flex flex-row">
                <div className="pl-20 w-full border-t border-slate-200 dark:border-slate-700">
                    <div className="h-px w-full"></div>
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
