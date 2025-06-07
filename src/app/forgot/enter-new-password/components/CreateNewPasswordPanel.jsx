// app/create-new-password/components/CreateNewPasswordPanel.jsx
"use client";

import { useState } from 'react';

// Example SVG icons (replace with your actual icons from a library like lucide-react)
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 cursor-pointer">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 cursor-pointer">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
    <line x1="2" x2="22" y1="2" y2="22"></line>
  </svg>
);

export default function CreateNewPasswordPanel() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateNewPassword = (value) => {
    if (!value) {
      setNewPasswordError('Password is required.');
      return false;
    }
    if (value.length < 8) {
      setNewPasswordError('Must be at least 8 characters.');
      return false;
    }
    // Add other password strength rules if needed (e.g., uppercase, number, symbol)
    setNewPasswordError('');
    return true;
  };

  const validateConfirmPasswordMatch = (newPass, confPass) => {
    if (!confPass) {
        setConfirmPasswordError('Confirm password is required.');
        return false;
    }
    if (newPass !== confPass) {
      setConfirmPasswordError('Please ensure both password fields are identical.');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    validateNewPassword(value);
    if (confirmPassword) { // Re-validate confirm password if it was already filled
      validateConfirmPasswordMatch(value, confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPasswordMatch(newPassword, value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const isNewPasswordValid = validateNewPassword(newPassword);
    const isConfirmPasswordValid = validateConfirmPasswordMatch(newPassword, confirmPassword);

    if (isNewPasswordValid && isConfirmPasswordValid) {
      alert(`Password reset successful! (This is a placeholder)`);
      // TODO: Add your actual password reset logic here (e.g., API call)
      // Consider also checking if new password is different from old ones via API
      setNewPassword('');
      setConfirmPassword('');
      setNewPasswordError('');
      setConfirmPasswordError('');
    } else {
      // Ensure errors are shown if fields are empty on submit
      if (!newPassword) validateNewPassword('');
      if (!confirmPassword) validateConfirmPasswordMatch(newPassword, '');
    }
  };

  return (
    <div className="right-panel bg-gray-100 p-8 md:p-10 lg:py-[50px] lg:px-[60px] w-full
     lg:w-[45%] flex flex-col justify-center items-center min-h-[350px] lg:min-h-full">
      <div className="form-container w-full max-w-md text-left">
        <h2 className="text-3xl sm:text-[32px] text-num-dark-text mb-2 font-bold text-black">
          Create new password
        </h2>
        <p className="instructions text-sm text-gray-500 mb-8 leading-normal">
          Your new password must be different from previous used <br /> passwords.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5"> {/* Adjusted space-y */}
          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block sm:text-[19px] font-bold mb-1 text-black">
              Enter new password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={handleNewPasswordChange}
                placeholder="********"
                required
                className={`w-full p-3 pr-10 bg-white text-gray-400 rounded-md text-base box-border 
                           ${confirmPasswordError ? '' : 'border-num-border'}
                           focus:border-num-blue focus:outline-none focus:ring-1 focus:ring-num-blue`}
                aria-describedby="newPasswordHelp"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {newPasswordError && <p id="newPasswordError" className="mt-2 mb-6 text-xs text-red-600">{newPasswordError}</p>}
            {!newPasswordError && <p id="newPasswordHelp" className="mt-2 mb-6 text-xs text-gray-500">Must be at least 8 characters.</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block sm:text-[19px] font-bold  mb-1 text-black">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Re-enter new password" // Placeholder more descriptive
                required
                className={`w-full p-3 pr-10 bg-white text-gray-400  rounded-md text-base box-border 
                           ${confirmPasswordError ? '' : 'border-num-border'}
                           focus:border-num-blue focus:outline-none focus:ring-1 focus:ring-num-blue`}
                aria-describedby="confirmPasswordHelp"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {confirmPasswordError && <p id="confirmPasswordError" className="mt-2 text-xs text-red-600">{confirmPasswordError}</p>}
            {!confirmPasswordError && <p id="confirmPasswordHelp" className="mt-2 text-xs text-gray-500">Please ensure both password fields are identical.</p>}
          </div>

          <button
            type="submit"
            className="continue-button mt-8 w-full sm:w-[100%] p-3 sm:p-[12px_15px] bg-blue-500 text-white
             border-none rounded-md text-base font-medium cursor-pointer
              transition-colors duration-300 ease-in-out hover:bg-num-button-hove"
            disabled={
                !newPassword || 
                !confirmPassword || 
                !!newPasswordError || 
                !!confirmPasswordError || 
                newPassword !== confirmPassword
            }
          >
            Reset new password
          </button>
        </form>
      </div>
    </div>
  );
}
