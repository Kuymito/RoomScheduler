'use client';

import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    const isSuccess = type === 'success';
    const isError = type === 'error';

    const bgColor = isSuccess ? 'bg-green-100 dark:bg-green-800/90' : isError ? 'bg-red-100 dark:bg-red-800/90' : 'bg-blue-100 dark:bg-blue-800/90';
    const textColor = isSuccess ? 'text-green-800 dark:text-green-200' : isError ? 'text-red-800 dark:text-red-200' : 'text-blue-800 dark:text-blue-200';
    const borderColor = isSuccess ? 'border-green-200 dark:border-green-700' : isError ? 'border-red-200 dark:border-red-700' : 'border-blue-200 dark:border-blue-700';
    
    const Icon = () => {
        if (isSuccess) {
            return <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        }
        if (isError) {
            return <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        }
        return <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    };

    return (
        <div className="fixed top-24 right-6 z-[1002] animate-fade-in-scale">
            <div className={`flex items-center p-4 rounded-lg shadow-lg ${bgColor} border ${borderColor}`}>
                <Icon />
                <p className={`ml-3 font-medium ${textColor}`}>{message}</p>
                <button onClick={onClose} className={`${textColor} ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 focus:ring-offset-2`}>
                    <span className="sr-only">Dismiss</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;