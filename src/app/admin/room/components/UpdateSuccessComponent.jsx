'use client';
import React from 'react';

// Placeholder Checkmark Icon
const CheckmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// Placeholder Close Icon
const CloseIconSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SuccessAlert = ({
  onConfirm,
  onClose,
  title = "Update Successfully",
  messageLine1 = "Your item has been updated successfully.",
  messageLine2 = "You can view or edit it anytime.",
  confirmButtonText = "OK"
}) => {
  return (
    <div className="relative w-[480px] h-[330px] bg-white shadow-custom-heavy rounded-[6px] font-sans"> {/* Use font-sans (Inter) as base */}
      {/* Close Icon Button */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close alert"
          className="absolute w-[20px] h-[20px] left-[431px] top-[21px] text-alert-close-icon hover:opacity-75 transition-opacity"
        >
          <CloseIconSvg />
        </button>
      )}

      {/* Icon container & Ellipse background */}
      <div
        className="box-border absolute w-[70px] h-[70px] left-[205px] top-[35px] bg-alert-success-icon-bg border-[5px] border-alert-success-icon-border rounded-full flex items-center justify-center"
      >
        <div className="w-[32px] h-[32px] text-white"> {/* Icon itself is white */}
          <CheckmarkIcon />
        </div>
      </div>

      {/* Title Text */}
      <h2
        className="absolute w-[238px] left-[calc(50%-119px)] top-[125px] font-roboto font-semibold text-[26px] leading-[30px] text-black text-center" // Use font-roboto for title, text-black for title color
      >
        {title}
      </h2>

      {/* Descriptive Text */}
      <p
        className="absolute w-[370px] h-auto left-[55px] top-[181px] font-sans font-normal text-[12px] leading-[15px] text-center text-num-gray" // Use font-sans and num-gray
      >
        {messageLine1}<br />
        {messageLine2}
      </p>

      {/* Button Container */}
      <div className="absolute w-[400px] h-[45px] left-[40px] top-[250px]">
        <button
          onClick={onConfirm}
          className="flex flex-row justify-center items-center w-full h-full px-[92px] py-[10px] gap-[10px] bg-num-blue rounded-[5px] hover:opacity-90 transition-opacity" // Use bg-num-blue
        >
          <span className="font-sans font-semibold text-[12px] leading-[15px] text-alert-button-text-light whitespace-nowrap"> {/* Use font-sans and alert-button-text-light */}
            {confirmButtonText}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SuccessAlert;