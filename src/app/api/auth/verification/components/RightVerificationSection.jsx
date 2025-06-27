// src/app/api/auth/verification/components/RightVerificationSection.jsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { moul } from '@/components/fonts';
import { authService } from '@/services/auth.service';

// This component now holds all the logic for the verification form
export default function RightVerificationSection() {
    const [otp, setOtp] = useState(['', '', '', '']);
    // Updated timer to 5 minutes (300 seconds)
    const [timer, setTimer] = useState(300); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Set initial focus only once on component mount
    useEffect(() => {
        inputRefs[0].current?.focus();
    }, []);

    // Handle the timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (e, index) => {
        const { value } = e.target;
        setError(''); // Clear error on change
        // Allow only single digits
        if (/^[0-9]$/.test(value) || value === "") {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            // Move to the next input if a digit is entered
            if (value && index < 3) {
                inputRefs[index + 1].current?.focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        // Move to the previous input on backspace if the current input is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        const verificationCode = otp.join('');
        if (verificationCode.length !== 4) {
            setError('Please enter the complete 4-digit code.');
            return;
        }

        const email = sessionStorage.getItem('emailForVerification');
        if (!email) {
            setError('Email not found. Please start the process again.');
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOtp(email, verificationCode);
            // If successful, store the OTP and redirect to the reset password page.
            sessionStorage.setItem('otpForReset', verificationCode); // Store OTP
            router.push('/api/auth/reset');
        } catch (err) {
            console.error("OTP verification error:", err.message); // Log the actual error
            setError("Invalid code. Please try again."); // Display user-friendly message
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (timer === 0) {
            const email = sessionStorage.getItem('emailForVerification');
            if (!email) {
                setError('Email not found. Cannot resend code.');
                return;
            }
            setIsLoading(true);
            try {
                await authService.forgotPassword(email);
                // Reset timer to 5 minutes
                setTimer(300);
                setOtp(['', '', '', '']);
                setError('');
                inputRefs[0].current?.focus();
            } catch (err) {
                console.error("Resend code error:", err.message); // Log the actual error
                setError('Failed to resend code.'); // Display user-friendly message
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
             <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center justify-center text-center">
                 <img
                    src="https://numregister.com/assets/img/logo/num.png"
                    alt="University Logo"
                    className="mx-auto mb-6 w-20"
                />
                <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-4">
                    {timer > 0 ? 'Verifying Code...' : 'Resending Code...'}
                </p>
                <div
                    className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"
                    role="status"
                >
                    <span className="sr-only">Loading...</span>
                </div>
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
            <h2 className="text-3xl sm:text-[24px] text-black mb-4 font-bold">
                Verification
            </h2>
            <p className="text-sm mb-6 leading-normal text-gray-500">
                Enter the 4-digit code that you received in your email.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center space-x-2 sm:space-x-3 md:space-x-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            maxLength="1"
                            required
                            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-black text-center border rounded-md text-xl sm:text-2xl font-medium focus:outline-none focus:ring-1 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'}`}
                        />
                    ))}
                </div>
                
                {error && <p className="text-red-500 text-xs text-center italic mt-2">{error}</p>}

                <div className="flex justify-center text-red-600 font-base">
                    {timer > 0 ? formatTime(timer) : "The validation period has ended. Please try again."}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={otp.join('').length !== 4}
                >
                    Continue
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                If you didn't receive a code,{" "}
                <button
                    onClick={handleResendCode}
                    disabled={timer > 0}
                    className="font-medium text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    Resend
                </button>
            </p>
        </div>
    );
};