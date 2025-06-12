
'use client';
import React from 'react';
const NotificationItem = ({ notification, onApprove, onDeny }) => {
  const { id, avatarUrl, message, timestamp, isUnread, type, details } = notification;
  const AvatarPlaceholder = ({ name }) => (
    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
      {name ? name.substring(0, 2).toUpperCase() : 'NN'}
    </div>
  );

  return (
    <div className={`w-full ${isUnread ? 'bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:dark:bg-gray-600' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}> 
      <div className="flex flex-row items-start p-4 md:p-5 gap-4 relative"> 
        
        {isUnread && (
          // Status dot aligned to the visual start of the avatar space
          (<div className="absolute left-1.5 md:left-2 top-1.5 md:top-2 w-3 h-3 flex items-center justify-center z-10">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>)
        )}

        {/* Avatar */}
        <div 
          className="w-12 h-12 rounded-full flex-shrink-0 bg-cover bg-center bg-slate-200 dark:bg-slate-500"
          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}}
        >
          {!avatarUrl && <AvatarPlaceholder name={details?.requestorName || message.substring(0,2)} />}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <p className="font-inter font-semibold text-xs sm:text-sm leading-normal text-slate-700 dark:text-gray-400 self-stretch break-words">
            {message}
          </p>

          {type === 'roomRequest' && (
            <div className="flex flex-row items-center pt-1.5 gap-2.5"> 
              <button
                onClick={() => onApprove(id)}
                className="flex justify-center items-center py-1.5 px-4 bg-blue-600 rounded-md text-white font-inter font-medium text-xs hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
                title={`Approve request ${id}`}
              >
                Approve
              </button>
              <button
                onClick={() => onDeny(id)}
                className="box-border flex justify-center items-center py-1.5 px-4 text-gray-800 dark:text-white bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md font-inter font-medium text-xs active:bg-slate-100 border dark:border-gray-500 transition-colors shadow-sm"
                title={`Deny request ${id}`}
              >
                Deny
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end text-right flex-shrink-0 pl-2 ml-auto w-auto min-w-[50px]">
          <span className="font-inter font-normal text-xs leading-normal text-slate-500 dark:text-gray-300 whitespace-nowrap">
            {timestamp}
          </span>
        </div>
      </div>
      <div className="flex flex-row">
        <div className="pl-[84px] w-full = border-t border-slate-200 dark:border-slate-600"> 
            <div className="h-px w-full"></div> 
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;