"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moul } from 'next/font/google';

const moul = Moul({ weight: '400', subsets: ['latin'] });

// This component contains the form and its logic
const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [emailError, setEmailError] = useState('');
    const router = useRouter();

    const handleSendCode = (event) => {
        event.preventDefault();
        setEmailError('');

        if (!email) {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                setEmailError('Email address is required.');
            }, 1000);
            return;
        }

        setIsLoading(true);
        // Simulate API call and then redirect to the verification page
        setTimeout(() => {
            // No need to set isLoading to false, as the page will redirect
            router.push('/api/auth/verification'); // Navigate to the verification page
        }, 2000);
    };

    const handleBackToLogin = () => {
        setIsNavigating(true);
        setTimeout(() => {
            router.push('/api/auth/login');
        }, 1500);
    };

    // Show a loading screen for any loading action
    if (isLoading || isNavigating) {
        return (
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center justify-center text-center">
                 <img
                    src="https://numregister.com/assets/img/logo/num.png"
                    alt="University Logo"
                    className="mx-auto mb-6 w-20"
                />
                <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-4">
                    {isNavigating ? "Returning to Login..." : "Redirecting to Verification..."}
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

    // The component now only shows the initial email form
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
                        className={`w-full p-3 bg-white rounded-md text-base border ${emailError ? 'border-red-500 ring-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none focus:ring-2 ${emailError ? 'focus:ring-red-500/50' : 'focus:ring-blue-500/25'}`}
                    />
                    {emailError && <p className="text-red-500 text-xs italic mt-2">{emailError}</p>}
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


const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen w-screen flex font-sans">
      {/* Left Column (Info Section) - Hidden on mobile */}
      <div className="hidden md:flex md:w-3/5 bg-[#3165F8] text-white items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br opacity-75"></div>
        <div className="relative z-10 max-w-sm sm:max-w-md lg:max-w-lg">
          <img src="https://numregister.com/assets/img/logo/num.png" alt="University Logo" className="mx-auto mb-10 w-16 sm:w-20 md:w-24 lg:w-28" />
          <h1 className={`${moul.className} font-bold mb-2 text-center sm:text-[25px]`}>សាកលវិទ្យាល័យជាតិគ្រប់គ្រង</h1>
          <h2 className="sm:text-[21px] font-medium mb-6 text-center">National University of Management</h2>
          <h3 className="font-medium mb-3 relative sm:text-[21px]">Welcome student login form.</h3>
          <p className="sm:text-[17px] sm:leading-[1.8]">
            First, as the Rector of the National University of Management (NUM), I would like to sincerely
            welcome you to our institution here in the Capital City of Phnom Penh, Cambodia. For those who
            have become our partners and friends, I extend a heartfelt appreciation for your cooperation and
            support in advancing higher education in our developing nation. The development of NUM as a quality
            education institution began at its commencement in 1983. NUM continues to be one of the leading public
            universities in Cambodia.
          </p>
        </div>
      </div>

      {/* Right Column (Form Section) */}
      <div className="w-full md:w-2/5 bg-[#E0E4F3] flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 min-h-screen">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;