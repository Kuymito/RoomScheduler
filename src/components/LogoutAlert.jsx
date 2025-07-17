'use client';

import React, { useState, useEffect } from 'react';

const LogoutAlert = ({ show, onClose, onConfirmLogout }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsExiting(false);
    }
  }, [show]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200); // Match animation duration
  };

  const handleConfirm = () => {
    setIsExiting(true);
    setTimeout(onConfirmLogout, 200); // Match animation duration
  };

  if (!show && !isExiting) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
        <div className={`logout-alert fixed w-[480px] max-w-[90%] bg-white dark:bg-gray-800 shadow-custom-medium rounded-md p-[25px] flex flex-col items-center
            ${show && !isExiting ? 'animate-fade-in-scale' : ''}
            ${isExiting ? 'animate-fade-out-scale' : ''}
        `}>
            <div
                className="close-icon absolute w-5 h-5 right-[15px] top-[15px] cursor-pointer close-icon-svg"
                onClick={handleClose}
            ></div>
            <div className="alert-icon w-[70px] h-[70px] bg-num-red border-[5px] border-num-red-light rounded-full flex items-center justify-center mb-5 animate-pulse-red">
                <div className="alert-icon-inner alert-icon-inner-svg w-8 h-8"></div>
            </div>
            <div className="alert-title font-roboto font-semibold text-2xl leading-tight text-black dark:text-white mb-2.5 text-center">
                Confirm Logout
            </div>
            <div className="alert-message font-sans font-normal text-sm leading-relaxed text-center text-[#333333] dark:text-gray-100 mb-6 max-w-alert-message">
                Logging out will end your current session. You’ll need to sign in again to continue.
            </div>
            <div className="alert-buttons flex gap-4 w-full justify-center">
                <button
                type="button"
                onClick={handleClose}
                className="alert-button cancel-button min-w-[120px] h-10 rounded-[5px] flex items-center justify-center cursor-pointer font-sans font-semibold text-sm px-5 bg-gray-200 hover:bg-gray-300 text-[#333333] border border-gray-300 transition-colors"
                >
                Cancel
                </button>
                <button
                type="button"
                onClick={handleConfirm}
                className="alert-button logout-button min-w-[120px] h-10 rounded-[5px] flex items-center justify-center cursor-pointer font-sans font-semibold text-sm px-5 bg-num-red hover:bg-red-700 text-white border border-num-red transition-colors"
                >
                Logout
                </button>
            </div>
        </div>
    </div>
  );
};

export default LogoutAlert;
