'use client';

import { useState } from 'react';

// You can reuse the Eye icons from the main profile page if they are exported,
// or redefine them here.
const EyeOpenIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> );
const EyeClosedIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> );

export default function PasswordConfirmationModal({
  show,
  onClose,
  onConfirm,
  loading,
  error
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (!show) return null;

  const handleConfirmClick = () => {
    onConfirm(currentPassword);
  };
  
  const handleClose = () => {
    setCurrentPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="relative w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Confirm Your Identity
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          To save your new password, please enter your current password.
        </p>

        {error && (
            <div className="mt-4 p-3 text-sm rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
            </div>
        )}

        <div className="mt-4">
          <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
            Current Password
          </label>
           <div className="relative">
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs bg-white dark:bg-gray-700 border-num-gray-light dark:border-gray-600 text-num-dark-text dark:text-white`}
              placeholder="Enter your current password"
              disabled={loading}
            />
            <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
                {isPasswordVisible ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
           </div>
        </div>

        <div className="mt-6 flex justify-end items-center gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white py-2 px-3 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={loading || !currentPassword}
            className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white text-xs py-2 px-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Confirming..." : "Confirm & Save"}
          </button>
        </div>
      </div>
    </div>
  );
}