// app/reset-password/components/CreateNewPasswordPanel.jsx
"use client";

import { useState } from 'react';
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
    <line x1="2" x2="22" y1="2" y2="22"></line>
  </svg>
);


export default function CreateNewPasswordPanel() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validatePassword = (value) => {
    if (value.length < 8) {
      setPasswordError('Must be at least 8 characters.'); // Corrected typo
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (value) => {
    if (value !== password) {
      setConfirmPasswordError('Please ensure both password fields are identical.');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    // Also validate confirm password if it's already filled
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (password) { // Only validate if original password has some value
        if (newConfirmPassword !== password) {
            setConfirmPasswordError('Please ensure both password fields are identical.');
        } else {
            setConfirmPasswordError('');
        }
    } else if (newConfirmPassword) {
        // If original password is empty, but confirm password is not, it's an error
        setConfirmPasswordError('Please enter the original password first.');
    } else {
        setConfirmPasswordError('');
    }
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (isPasswordValid && isConfirmPasswordValid && password === confirmPassword) {
      alert(`Password reset successful! New password: ${password}`);
      // TODO: Add your actual password reset logic here (e.g., API call)
      setPassword('');
      setConfirmPassword('');
    } else {
      // Errors will be displayed below the fields
      if (!password) validatePassword(''); // Trigger error if empty
      if (!confirmPassword && password) validateConfirmPassword(''); // Trigger error if empty and password is not
    }
  };

  return (
    <div className="right-panel bg-gray-100 p-8 md:p-10 lg:py-[50px] lg:px-[60px] w-full lg:w-[45%] flex flex-col justify-center items-center min-h-[350px] lg:min-h-full">
      <div className="form-container w-full max-w-md text-left"> {/* Changed max-w-sm to max-w-md for a bit more space */}
        <h2 className="text-3xl sm:text-[32px]  mb-2 font-bold">
          Create new password
        </h2>
        <p className="instructions text-sm text-gray-500 mb-8 leading-normal">
          Set the new password for your account so you can login <br /> and access all features.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block sm:text-[19px]  mb-1 font-bold">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="8 symbols at least"
                required
                className={`w-full p-3 pr-10 bg-white rounded-md text-base box-border 
                           ${passwordError ? '' : 'border-num-border'}
                           focus:border-num-blue focus:outline-none focus:ring-1 focus:ring-num-blue`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordError && <p className="mt-2 text-xs text-red-600">{passwordError}</p>}
            {!passwordError && <p className="mt-2  text-xs text-gray-500">Must be at least 8 characters.</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block   sm:text-[19px]  mb-1 font-bold">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="8 symbols at least"
                required
                className={`w-full p-3 pr-10 bg-white rounded-md text-base box-border 
                           ${confirmPasswordError ? '' : 'border-num-border'}
                           focus:border-num-blue focus:outline-none focus:ring-1 focus:ring-num-blue`}
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
            {confirmPasswordError && <p className="mt-2 text-xs text-red-600">{confirmPasswordError}</p>}
            {!confirmPasswordError && <p className="mt-2 text-xs text-gray-500">Please ensure both password fields are identical.</p>}
          </div>

          <button
            type="submit"
            className="continue-button mt-7 w-full sm:w-[100%] p-3 sm:p-[12px_15px] bg-blue-500 text-white
             border-none rounded-md text-base font-medium cursor-pointer
              transition-colors duration-300 ease-in-out hover:bg-num-button-hove"
            disabled={!password || !confirmPassword || !!passwordError || !!confirmPasswordError || password !== confirmPassword}
          >
            Reset new password
          </button>
        </form>
      </div>
    </div>
  );
}
