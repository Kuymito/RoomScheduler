'use client';
import React, { useState, useEffect } from 'react';

// Optimized Checkmark Icon
const CheckmarkIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="text-green-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

// Optimized Close Icon
const CloseIconSvg = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
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
  const [isShowing, setIsShowing] = useState(false);

  // On component mount, trigger the entry animation.
  useEffect(() => {
    // A tiny delay to allow the component to be in the DOM with initial (hidden) styles
    // before transitioning to the visible state.
    const timer = setTimeout(() => {
      setIsShowing(true);
    }, 10); // A small delay is sometimes needed for the transition to trigger correctly on mount.
    return () => clearTimeout(timer);
  }, []);

  // Handler to trigger the exit animation before calling the parent's close function.
  const handleClose = () => {
    setIsShowing(false); // Trigger the exit animation
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 200); // This duration should match the transition-out duration.
  };

  const handleConfirm = () => {
    setIsShowing(false); // Trigger the exit animation
    setTimeout(() => {
      onConfirm();
    }, 200); // This duration should match the transition-out duration.
  };

  return (
    <div
      className={`
        relative w-[480px] h-[330px] bg-white shadow-custom-heavy rounded-[6px] font-sans
        transition-all duration-200 ease-out
        ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
    >
      {/* Close Icon Button */}
      {onClose && (
        <button
          onClick={handleClose}
          aria-label="Close alert"
          className="absolute w-[20px] h-[20px] left-[431px] top-[21px] text-alert-close-icon hover:opacity-75 transition-opacity"
        >
          <CloseIconSvg className="w-full h-full" />
        </button>
      )}

      {/* Icon container & Ellipse background */}
      <div
        className="box-border absolute w-[70px] h-[70px] left-[205px] top-[35px] bg-alert-success-icon-bg rounded-full flex items-center justify-center"
      >
        <CheckmarkIcon className="w-[32px] h-[32px] text-white" />
      </div>

      {/* Title Text */}
      <h2
        className="absolute w-[238px] left-[calc(50%-119px)] top-[125px] font-roboto font-semibold text-[26px] leading-[30px] text-black text-center"
      >
        {title}
      </h2>

      {/* Descriptive Text */}
      <p
        className="absolute w-[370px] h-auto left-[55px] top-[181px] font-sans font-normal text-[12px] leading-[15px] text-center text-num-gray"
      >
        {messageLine1}<br />
        {messageLine2}
      </p>

      {/* Button Container */}
      <div className="absolute w-[400px] h-[45px] left-[40px] top-[250px]">
        <button
          onClick={handleConfirm}
          className="flex flex-row justify-center items-center w-full h-full px-[92px] py-[10px] gap-[10px] text-white bg-num-blue rounded-[5px] hover:opacity-90 transition-opacity"
        >
          <span className="font-sans font-semibold text-[12px] leading-[15px] text-alert-button-text-light whitespace-nowrap">
            {confirmButtonText}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SuccessAlert;