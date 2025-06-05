// NotificationItem.js
'use client';
import React from 'react';
// If you are using Next.js <Image> component for avatarUrl, uncomment the line below
// import Image from 'next/image';

const NotificationItem = ({ notification, onApprove, onDeny }) => {
  const { id, avatarUrl, message, timestamp, isUnread, type, details } = notification;

  // Placeholder for avatar
  const AvatarPlaceholder = ({ name }) => (
    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
      {/* Using a common blue, adjust if you have 'num-blue' defined in Tailwind config */}
      {name ? name.substring(0, 2).toUpperCase() : 'NN'}
    </div>
  );

  return (
    <div className={`w-full ${isUnread ? 'bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:dark:bg-gray-600' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}> {/* Lighter blue for unread, or use your #EDF3FF */}
      <div className="flex flex-row items-start p-4 md:p-5 gap-4 relative"> {/* Standardized padding and slightly increased gap */}
        
        {isUnread && (
          // Status dot aligned to the visual start of the avatar space
          (<div className="absolute left-1.5 md:left-2 top-1.5 md:top-2 w-3 h-3 flex items-center justify-center z-10">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>)
        )}

        {/* Avatar */}
        <div 
          className="w-12 h-12 rounded-full flex-shrink-0 bg-cover bg-center bg-slate-200 dark:bg-slate-500" // Fallback bg color
          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}}
        >
          {!avatarUrl && <AvatarPlaceholder name={details?.requestorName || message.substring(0,2)} />}
        </div>

        {/* Main Content Area (Message & Actions) */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <p className="font-inter font-semibold text-xs sm:text-sm leading-normal text-slate-700 dark:text-gray-400 self-stretch break-words">
            {/* Increased font size slightly for better readability */}
            {message}
          </p>

          {/* Action Buttons */}
          {type === 'roomRequest' && (
            <div className="flex flex-row items-center pt-1.5 gap-2.5"> {/* Slightly more spacing */}
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

        {/* Timestamp and optional actions menu icon */}
        <div className="flex flex-col items-end text-right flex-shrink-0 pl-2 ml-auto w-auto min-w-[50px]"> {/* Ensure some min-width for timestamp */}
          <span className="font-inter font-normal text-xs leading-normal text-slate-500 dark:text-gray-300 whitespace-nowrap">
            {timestamp}
          </span>
          {/* Optional: Ellipsis for more actions - uncomment and style if needed 
          <button className="mt-1 text-slate-400 hover:text-slate-600 p-1 rounded-full" title="More options">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
            </svg>
          </button>
          */}
        </div>
      </div>
      {/* Divider Line - The padding-left should be avatar width + item padding + gap */}
      <div className="flex flex-row">
        {/* Based on p-4 (1rem), avatar w-12 (3rem), gap-4 (1rem): pl-[calc(1rem+3rem+1rem)] = pl-20 */}
        {/* Based on p-5 (1.25rem), avatar w-12 (3rem), gap-4 (1rem): pl-[calc(1.25rem+3rem+1rem)] = pl-[5.25rem] which is pl-[84px] */}
        <div className="pl-[84px] w-full = border-t border-slate-200 dark:border-slate-600"> {/* Using the 84px from your original spec calculation */}
            <div className="h-px w-full"></div> {/* Lighter divider */}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;