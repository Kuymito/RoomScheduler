'use client';

import React from 'react';

const AdminPopup = ({ show, onLogoutClick, adminName = "Admin", adminEmail = "admin@gmail.com" }) => {
  if (!show) return null;

  return (
    <div className="admin-popup absolute w-[299px] right-5 top-20 bg-white shadow-custom-heavy rounded-[5px] z-[1000]">
      <div className="admin-popup-header w-full h-[84px] bg-num-blue rounded-t-[5px] flex flex-col items-center justify-center p-2.5">
        <div className="admin-popup-name font-poppins font-medium text-base leading-6 text-white">{adminName}</div>
        <div className="admin-popup-email font-sans font-normal text-xs leading-4 text-num-blue-light">{adminEmail}</div>
      </div>
      <div className="admin-popup-options p-2.5 flex flex-col">
        <a href="profile" className="popup-option w-full h-10 bg-white rounded-[5px] flex items-center cursor-pointer px-4 mb-1.5 hover:bg-gray-50">
          <div className="popup-option-icon setting-icon-svg w-[15px] h-[15px] mr-2.5"></div>
          <div className="popup-option-text font-sans font-normal text-xs leading-[15px] text-num-blue">Edit Profile</div>
        </a>
        <div
          onClick={onLogoutClick}
          className="popup-option logout-option w-full h-10 bg-white rounded-[5px] flex items-center cursor-pointer px-4 hover:bg-gray-50"
        >
          <div className="popup-option-icon logout-icon-svg w-[15px] h-[15px] mr-2.5"></div>
          <div className="popup-option-text font-sans font-normal text-xs leading-[15px] text-num-red">Logout</div>
        </div>
      </div>
    </div>
  );
};

export default AdminPopup;