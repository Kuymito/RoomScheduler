"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moul } from 'next/font/google';

const moul = Moul({ weight: '400', subsets: ['latin'] });

// This new component contains the form and its logic
const RightSection = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const DUMMY_ACCOUNTS = {
        admin: { email: 'admin@gmail.com', password: '123' },
        instructor: { email: 'instructor@gmail.com', password: '123' },
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            if (email === DUMMY_ACCOUNTS.admin.email && password === DUMMY_ACCOUNTS.admin.password) {
                router.push('/admin/dashboard');
            } else if (email === DUMMY_ACCOUNTS.instructor.email && password === DUMMY_ACCOUNTS.instructor.password) {
                router.push('/instructor/dashboard');
            } else {
                setError("Incorrect email or password.");
                setIsLoading(false);
            }
        }, 1000);
    };

    const handleForgotPasswordClick = () => {
        setIsForgotLoading(true);
        setTimeout(() => {
            router.push('/api/auth/forgot');
        }, 1000);
    };

    if (isLoading || isForgotLoading) {
        return (
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center justify-center text-center">
                 <img
                    src="https://numregister.com/assets/img/logo/num.png"
                    alt="University Logo"
                    className="mx-auto mb-6 w-20"
                />
                <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-4">
                    {isForgotLoading ? "Redirecting, please wait..." : "Logging in, please wait..."}
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
            <div className="w-full sm:w-5/6 mb-6">
                <div className="mb-16 block md:hidden">
                    <img src="https://numregister.com/assets/img/logo/num.png" alt="University Logo" className="mx-auto mb-5 w-16 sm:w-20 md:w-24 lg:w-28" />
                    <h1 className={`${moul.className} font-bold mb-2 text-center sm:text-[25px]`}>សាកលវិទ្យាល័យជាតិគ្រប់គ្រង</h1>
                    <h2 className="sm:text-[21px] font-medium mb-6 text-center">National University of Management</h2>
                </div>
                <h2 className="text-2xl sm:text-[24px] font-bold text-gray-800 mb-2 text-left">Welcome back!</h2>
                <p className="text-sm sm:text-base text-gray-600 text-left">Please sign in to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full sm:w-5/6">
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm sm:text-base mb-1 font-base text-gray-900">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`shadow-sm border rounded-lg w-full py-2 px-3 text-[14px] text-gray-700 focus:outline-white focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                        placeholder="example@gmail.com"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm sm:text-base mb-1 font-base text-gray-900">Password</label>
                    <div className="relative">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`shadow-sm border rounded-lg w-full py-2 px-3 text-gray-700  text-[14px] focus:outline-white focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                            placeholder="at least 8 characters"
                        />
                        <span
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={togglePasswordVisibility}
                        >
                            {passwordVisible ? (
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            ) : (
                                
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m2.122-2.122C7.695 5.802 9.79 5 12 5c4.478 0 8.268 2.943 9.543 7a9.973 9.973 0 01-4.152 5.132M15 12a3 3 0 00-3-3m0 0a3 3 0 00-3 3m3-3l9 9m-9-9L3 3" />
                                </svg>
                            )}
                        </span>
                    </div>
                    {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
                </div>

                <div className="flex flex-col items-center justify-between">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition duration-150 ease-in-out mb-3"
                    >
                        Login
                    </button>
                    
                </div>
                <button
                        type="button"
                        onClick={handleForgotPasswordClick}
                        className="text-sm text-blue-600 hover:text-blue-800 float-right"
                    >
                        Forgot Password
                </button>
            </form>
        </div>
    );
};

export default RightSection;