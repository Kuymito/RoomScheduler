"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Moul } from 'next/font/google';

const moul = Moul({ weight: '400', subsets: ['latin'] });

// This component now holds all the logic for the verification form
const VerificationFormControl = () => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(59);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        // Auto-focus the first input on component mount
        inputRefs[0].current?.focus();

        // Timer countdown logic
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]); // Reruns when timer changes

    const handleChange = (e, index) => {
        const { value } = e.target;
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

    const handleSubmit = (event) => {
        event.preventDefault();
        const verificationCode = otp.join('');
        if (verificationCode.length === 4) {
            setIsLoading(true);
            // Simulate API verification
            setTimeout(() => {
                console.log(`Verified OTP: ${verificationCode}`);
                // On success, navigate to the reset password page
                router.push('/api/auth/reset'); // Assumes this is the route for your reset page
            }, 2000);
        }
    };

    const handleResendCode = () => {
        if (timer === 0) {
            setIsLoading(true);
             // Simulate resending code
            setTimeout(() => {
                setTimer(59);
                setOtp(['', '', '', '']);
                inputRefs[0].current?.focus();
                setIsLoading(false);
                 alert('A new verification code has been sent.');
            }, 1500)
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
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-black text-center border border-gray-300 rounded-md text-xl sm:text-2xl font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    ))}
                </div>

                <div className="flex justify-center text-red-600 font-semibold">
                    {timer > 0 ? formatTime(timer) : "Time's up!"}
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


const VerificationPage = () => {
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
            <div className="w-full md:w-2/5 bg-[#E0E4F3] flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16">
                <VerificationFormControl />
            </div>
        </div>
    );
};

export default VerificationPage;