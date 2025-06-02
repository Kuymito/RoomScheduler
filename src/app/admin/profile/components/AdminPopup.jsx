'use client';

import React from 'react';

const AdminPopup = ({ show, onLogoutClick, adminName = "Admin", adminEmail = "admin@gmail.com" }) => {
  if (!show) return null;

  return (
    <div className="admin-popup absolute w-[299px] right-5 top-20 bg-white dark:bg-gray-700 shadow-custom-heavy rounded-[5px] z-[1000]">
      <div className="admin-popup-header w-full h-[84px] bg-num-blue dark:bg-blue-800 rounded-t-[5px] flex flex-col items-center justify-center p-2.5">
        <div className="admin-popup-name font-poppins font-medium text-base leading-6 text-white">{adminName}</div>
        <div className="admin-popup-email font-sans font-normal text-xs leading-4 text-num-blue-light">{adminEmail}</div>
      </div>
      <div className="admin-popup-options p-2.5 flex flex-col">
        <a href="profile" className="popup-option w-full h-10 gap-4 bg-white dark:bg-gray-700 rounded-[5px] flex items-center cursor-pointer px-4 mb-1.5 hover:bg-gray-50 dark:hover:bg-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-num-blue dark:text-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          <div className="popup-option-text font-sans font-normal text-xs leading-[15px] text-num-blue dark:text-blue-400">Edit Profile</div>
        </a>
        <div
          onClick={onLogoutClick}
          className="popup-option logout-option w-full h-10 gap-4 bg-white dark:bg-gray-700 rounded-[5px] flex items-center cursor-pointer px-4 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-red-500 dark:text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          <div className="popup-option-text font-sans font-normal text-xs leading-[15px] text-num-red dark:text-red-400">Logout</div>
        </div>
      </div>
    </div>
  );
};

export default AdminPopup;