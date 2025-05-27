'use client';

import React from 'react';

const LogoutAlert = ({ show, onClose, onConfirmLogout }) => {
  if (!show) return null;

  return (
    <div className="logout-alert fixed w-[480px] max-w-[90%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-custom-medium rounded-md z-[1001] p-[25px] flex flex-col items-center">
      <div
        className="close-icon absolute w-5 h-5 right-[15px] top-[15px] cursor-pointer close-icon-svg"
        onClick={onClose}
      ></div>
      <div className="alert-icon w-[70px] h-[70px] bg-num-red border-[5px] border-num-red-light rounded-full flex items-center justify-center mb-5">
        <div className="alert-icon-inner alert-icon-inner-svg w-8 h-8"></div>
      </div>
      <div className="alert-title font-roboto font-semibold text-2xl leading-tight text-black mb-2.5 text-center">
        Confirm Logout
      </div>
      <div className="alert-message font-sans font-normal text-sm leading-relaxed text-center text-[#333333] mb-6 max-w-alert-message">
        Logging out will end your current session. You’ll need to sign in again to continue.
      </div>
      <div className="alert-buttons flex gap-4 w-full justify-center">
        <button
          type="button"
          onClick={onClose}
          className="alert-button cancel-button min-w-[120px] h-10 rounded-[5px] flex items-center justify-center cursor-pointer font-sans font-semibold text-sm px-5 bg-gray-200 hover:bg-gray-300 text-[#333333] border border-gray-300"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirmLogout}
          className="alert-button logout-button min-w-[120px] h-10 rounded-[5px] flex items-center justify-center cursor-pointer font-sans font-semibold text-sm px-5 bg-num-red hover:bg-red-700 text-white border border-num-red"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default LogoutAlert;