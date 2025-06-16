// src/app/admin/notification/AdminNotification.jsx
'use client';
import React from 'react';

// --- Helper Icons ---
const CheckCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;

const NotificationItem = ({ notification, onApprove, onDeny, onMarkAsRead }) => {
  const { id, avatarUrl, message, timestamp, isUnread, type, details } = notification;

  const AvatarPlaceholder = ({ name }) => (
    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
      {name ? name.substring(0, 2).toUpperCase() : 'NN'}
    </div>
  );

  const handleItemClick = () => {
    if (isUnread && typeof onMarkAsRead === 'function') {
      onMarkAsRead(id);
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
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse-green"></div>
          </div>
        )}

        <div 
          className="w-12 h-12 rounded-full flex-shrink-0 bg-cover bg-center bg-slate-200 dark:bg-slate-500"
          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}}
        >
          {!avatarUrl && <AvatarPlaceholder name={details?.requestorName || message.substring(0,2)} />}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <p className="font-inter font-semibold text-sm leading-normal text-slate-700 dark:text-gray-300 self-stretch break-words flex items-start gap-2">
            {type === 'info_approved' && <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
            {type === 'info_denied' && <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
            <span>{message}</span>
          </p>
          
          {type === 'roomRequest' && (
            <div className="flex flex-row items-center pt-1.5 gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(id); }}
                className="flex justify-center items-center py-2 px-4 bg-blue-600 rounded-md text-white font-inter font-medium text-xs hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
                title={`Approve request ${id}`}
              >
                Approve
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeny(id); }}
                className="box-border flex justify-center items-center py-2 px-4 text-gray-800 dark:text-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md font-inter font-medium text-xs active:bg-slate-100 border dark:border-gray-500 transition-colors shadow-sm"
                title={`Deny request ${id}`}
              >
                Deny
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end text-right flex-shrink-0 pl-2 ml-auto w-auto min-w-[60px]">
          <span className="font-inter font-normal text-xs leading-normal text-slate-500 dark:text-gray-400 whitespace-nowrap">
            {timestamp}
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