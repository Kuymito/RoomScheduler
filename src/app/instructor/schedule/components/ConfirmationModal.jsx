// src/app/admin/schedule/components/ConfirmationModal.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, isLoading }) => {
    const [isMounted, setIsMounted] = useState(false);

    // Ensure the component is only rendered on the client where the DOM is available.
    useEffect(() => {
        setIsMounted(true);
        
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // The modal's JSX content.
    const modalContent = (
        <div
            onClick={onClose} // Close when clicking the backdrop
            className={`
                fixed inset-0 z-50 flex items-center justify-center p-4
                transition-opacity duration-300 ease-in-out
                ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
                className={`
                    relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl
                    transform transition-all duration-300 ease-in-out
                    ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                `}
            >
                <div className="p-6">
                    <h2 id="modal-title" className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h2>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        {children}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                            Cancel
                        </button>
                        <button type="button" onClick={onConfirm} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400 flex items-center">
                            {isLoading ? 'Processing...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // If the component is mounted on the client, create a portal and render the modal content into the 'modal-root' div.
    if (isMounted) {
        const portalRoot = document.getElementById('modal-root');
        if (portalRoot) {
            return createPortal(modalContent, portalRoot);
        }
    }

    // Return null if not mounted or if the portal root doesn't exist.
    return null;
};

export default ConfirmationModal;
