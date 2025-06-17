"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moul } from 'next/font/google';
import { authService } from '@/services/auth.service';

const moul = Moul({ weight: '400', subsets: ['latin'] });

// This component contains the form and its logic
const RightForgotPasswordSection = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSendCode = async (event) => {
        event.preventDefault();
        setError('');

        if (!email) {
            setError('Email address is required.');
            return;
        }

        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            // Store email to be used on the verification page
            sessionStorage.setItem('emailForVerification', email);
            router.push('/api/auth/verification');
        } catch (err) {
            setError(err.message || 'Failed to send verification code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setIsNavigating(true);
        setTimeout(() => {
            router.push('/api/auth/login');
        }, 1500);
    };

    if (isLoading || isNavigating) {
        return (
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center justify-center text-center">
                 <img
                    src="https://numregister.com/assets/img/logo/num.png"
                    alt="University Logo"
                    className="mx-auto mb-6 w-20"
                />
                <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-4">
                    {isNavigating ? "Returning to Login..." : "Sending Verification Code..."}
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
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center">
            <div className="mb-16 block md:hidden">
                <img src="https://numregister.com/assets/img/logo/num.png" alt="University Logo" className="mx-auto mb-5 w-16 sm:w-20 md:w-24 lg:w-28" />
                <h1 className={`${moul.className} font-bold mb-2 text-center sm:text-[25px]`}>សាកលវិទ្យាល័យជាតិគ្រប់គ្រង</h1>
                <h2 className="sm:text-[21px] font-medium mb-6 text-center">National University of Management</h2>
            </div>
            <h2 className="text-2xl sm:text-[24px] mb-4 font-bold text-gray-900 text-left w-full sm:w-5/6">
                Forgot Password
            </h2>
            <p className="text-sm text-gray-500 mb-5 leading-normal text-left w-full sm:w-5/6">
                Enter your email, and we will send a 4-digit verification code.
            </p>
            <form onSubmit={handleSendCode} className="w-full flex flex-col items-center" noValidate>
                <div className="form-group mb-5 w-full sm:w-5/6">
                    <label htmlFor="email" className="block text-sm sm:text-base mb-1 font-base text-gray-900">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-3 bg-white rounded-md text-base border ${error ? 'border-red-500 ring-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/50' : 'focus:ring-blue-500/25'}`}
                    />
                    {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
                </div>
                <p className="mb-5 w-full sm:w-5/6 text-right">
                    <button type="button" onClick={handleBackToLogin} className="text-blue-500 hover:underline">
                        Back to login
                    </button>
                </p>
                <button
                    type="submit"
                    className="w-full sm:w-5/6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition"
                >
                    Continue
                </button>
            </form>
        </div>
    );
};


export default RightForgotPasswordSection;