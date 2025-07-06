// src/app/instructor/notification/InstructorNotification.jsx
'use client';
import React from 'react';
import Image from 'next/image'; // Import the Image component

// --- Helper Icons ---
const CheckCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const InfoCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;


const InstructorNotification = ({ notification, onMarkAsRead }) => {
  // Directly destructure properties from the notification object.
  const { notificationId, message, createdAt, read, type, details } = notification;
  // The key fix: derive isUnread from the 'read' property.
  const isUnread = !read;

  const handleItemClick = () => {
    if (isUnread && typeof onMarkAsRead === 'function') {
      onMarkAsRead(notificationId);
    }
  };
  
  const getIcon = () => {
    // The API response for instructor notifications seems to use `type` differently.
    // Let's adjust based on the message content for now, or use a default.
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('approved')) {
        return <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />;
    }
    if (lowerMessage.includes('denied')) {
        return <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />;
    }
    return <InfoCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />;
  }

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
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center"
        >
          <Image
            src="/images/LOGO-NUM-1.png"
            alt="Notification Icon"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <p className="font-inter font-semibold text-sm leading-normal text-slate-700 dark:text-gray-300 self-stretch break-words flex items-start gap-2">
             {getIcon()}
            <span>{message}</span>
          </p>
        </div>

        <div className="flex flex-col items-end text-right flex-shrink-0 pl-2 ml-auto w-auto min-w-[60px]">
          <span className="font-inter font-normal text-xs leading-normal text-slate-500 dark:text-gray-400 whitespace-nowrap">
            {new Date(createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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

export default InstructorNotification;