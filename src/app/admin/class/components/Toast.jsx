'use client';

import React, { useEffect } from 'react';

// --- Icon Components for different toast types ---
const icons = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

/**
 * A toast notification component for displaying brief messages.
 * @param {object} props - The component props.
 * @param {boolean} props.show - Controls the visibility of the toast.
 * @param {string} props.message - The message to display.
 * @param {'success' | 'error' | 'warning'} props.type - The type of toast.
 * @param {() => void} props.onClose - Function to call when the toast is closed.
 */
const Toast = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  // Use a specific, simpler style for the error toast as requested.
  if (type === 'error') {
    return (
      <div className="fixed top-24 right-6 bg-red-500 text-white py-3 px-5 rounded-lg shadow-lg z-50 animate-fade-in-scale">
        <div className="flex items-center justify-between">
          <p className="font-semibold mr-4">{message}</p>
          <button onClick={onClose} className="-mr-1 p-1 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Determine the configuration for other toast types
  const config = {
    success: { icon: icons.success, barColor: 'bg-green-500' },
    warning: { icon: icons.warning, barColor: 'bg-yellow-500' },
  }[type];

  return (
    <div className="fixed top-5 right-5 z-[2000] animate-fade-in-scale">
      <div className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{config.icon}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={onClose}
                className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className={`h-1 ${config.barColor} w-full`}></div>
      </div>
    </div>
  );
};

export default Toast;