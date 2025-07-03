"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { moul } from '@/components/fonts';
import { authService } from '@/services/auth.service';

// --- SVG Icons ---
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line>
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

// --- Form Control Component ---
export default function RightResetPasswordSection() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [apiError, setApiError] = useState(''); // For API-level errors
    const router = useRouter();

    const validatePassword = (value) => {
        if (!value) {
            setPasswordError('Password is required.'); return false;
        }
        if (value.length < 8) {
            setPasswordError('Must be at least 8 characters.'); return false;
        }
        setPasswordError(''); return true;
    };

    const validateConfirmPassword = (value, currentPassword) => {
        if (!value) {
            setConfirmPasswordError('Confirm password is required.'); return false;
        }
        if (value !== currentPassword) {
            setConfirmPasswordError('Passwords do not match.'); return false;
        }
        setConfirmPasswordError(''); return true;
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword);
        if (confirmPassword) {
            validateConfirmPassword(confirmPassword, newPassword);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        validateConfirmPassword(newConfirmPassword, password);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError('');
        const isPasswordValid = validatePassword(password);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

        if (isPasswordValid && isConfirmPasswordValid) {
            const email = sessionStorage.getItem('emailForVerification');
            const otp = sessionStorage.getItem('otpForReset');

            if (!email || !otp) {
                setApiError("Session expired. Please start the password reset process again.");
                return;
            }

            setIsLoading(true);
            try {
                // Ensure the key 'newPassword' is used as expected by the service
                await authService.resetPassword({ email, otp, newPassword: password });
                setIsSuccess(true);
                sessionStorage.removeItem('emailForVerification');
                sessionStorage.removeItem('otpForReset');
            } catch (err) {
                setApiError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBackToLogin = () => {
        setIsNavigating(true);
        router.push('/api/auth/login');
    };

    if (isLoading || isNavigating) {
        return (
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center justify-center text-center">
                <img src="https://numregister.com/assets/img/logo/num.png" alt="University Logo" className="mx-auto mb-6 w-20" />
                <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-4">
                    {isNavigating ? "Returning to Login..." : "Resetting Password..."}
                </p>
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center text-center">
                <CheckCircleIcon />
                <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Password Reset!</h2>
                <p className="text-gray-600 mb-6">Your password has been successfully reset. Click below to log in.</p>
                <button
                    onClick={handleBackToLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
            <div className="mb-16 block md:hidden">
                <img src="https://numregister.com/assets/img/logo/num.png" alt="University Logo" className="mx-auto mb-5 w-16 sm:w-20 md:w-24 lg:w-28" />
                <h1 className={`${moul.className} font-bold mb-2 text-center sm:text-[25px]`}>សាកលវិទ្យាល័យជាតិគ្រប់គ្រង</h1>
                <h2 className="sm:text-[21px] font-medium mb-6 text-center">National University of Management</h2>
            </div>
            <h2 className="text-3xl sm:text-[24px] text-gray-900 mb-2 font-bold">Create new password</h2>
            <p className="text-sm text-gray-500 mb-8 leading-normal">Your new password must be different from previously used passwords.</p>
            {apiError && <p className="text-red-500 text-sm text-center mb-4">{apiError}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="password" className="block text-sm sm:text-base mb-1 font-base text-gray-900">Password</label>
                    <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={handlePasswordChange} required className={`w-full p-3 pr-10 bg-white rounded-md text-gray-600 border ${passwordError || apiError ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none focus:ring-1 ${passwordError || apiError ? 'focus:ring-red-500/50' : 'focus:ring-blue-500/50'}`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                    </div>
                    {passwordError ? (<p className="mt-2 text-xs text-red-600">{passwordError}</p>) : (<p className="mt-2 text-xs text-gray-500">Must be at least 8 characters.</p>)}
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm sm:text-base mb-1 font-base text-gray-900">Confirm Password</label>
                    <div className="relative">
                        <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" value={confirmPassword} onChange={handleConfirmPasswordChange} required className={`w-full p-3 pr-10 bg-white rounded-md text-gray-600 border ${confirmPasswordError || apiError ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none focus:ring-1 ${confirmPasswordError || apiError ? 'focus:ring-red-500/50' : 'focus:ring-blue-500/50'}`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center">{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                    </div>
                    {confirmPasswordError && (<p className="mt-2 text-xs text-red-600">{confirmPasswordError}</p>)}
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-blue-400 disabled:cursor-not-allowed" disabled={!password || !confirmPassword || !!passwordError || !!confirmPasswordError || isLoading}>
                    Reset Password
                </button>
            </form>
        </div>
    );
};