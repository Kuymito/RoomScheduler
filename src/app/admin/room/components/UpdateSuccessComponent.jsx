'use client';
import React from 'react';

// --- Icon Components (no changes needed here) ---
const CheckmarkIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="text-white size-9">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const CloseIconSvg = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


// --- Corrected SuccessAlert Component ---
const SuccessAlert = ({ show, onConfirm, onClose, title = "Update Successfully", messageLine1 = "Your item has been updated successfully.", messageLine2 = "You can view or edit it anytime.", confirmButtonText = "OK" }) => {
  
  // If the show prop is false, the component renders nothing.
  if (!show) {
    return null;
  }

  // The component now relies solely on the 'show' prop to be visible.
  // The animation class is applied directly when it's rendered.
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1001] p-4">
      <div
          className="relative w-full max-w-sm bg-white dark:bg-gray-800 shadow-custom-heavy rounded-lg font-sans"
      >
        <div className="p-6 text-center">
            {onClose && (
              <button onClick={onClose} aria-label="Close alert" className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <CloseIconSvg className="w-5 h-5" />
              </button>
            )}

            <div className="w-[70px] h-[70px] mx-auto mb-5 bg-green-500 rounded-full flex items-center justify-center animate-pulse-green">
                <CheckmarkIcon className="w-9 h-9" />
            </div>

            <h2 className="font-roboto font-semibold text-2xl text-black dark:text-white mb-2">
                {title}
            </h2>

            <p className="font-sans font-normal text-sm text-gray-600 dark:text-gray-300 mb-6">
                {messageLine1}<br />
                {messageLine2}
            </p>

            <button onClick={onConfirm} className="w-full h-11 px-6 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-sans font-semibold text-sm transition-colors">
                {confirmButtonText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessAlert;