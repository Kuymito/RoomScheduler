// src/app/api/auth/login/components/RightSection.jsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { moul } from '@/components/fonts';

export default function RightSection() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setIsLoading(true);

        // Use the signIn function from NextAuth.js to trigger the 'authorize' function in your API route
        const result = await signIn('credentials', {
            redirect: false, // We handle the redirect manually
            email,
            password,
        });

        if (result.error) {
            // Display an error if signIn returns an error (e.g., invalid credentials)
            setError("Invalid email or password. Please try again.");
            setIsLoading(false);
        } else if (result.ok) {
            // On successful sign-in, fetch the session to get the user's role
            const res = await fetch('/api/auth/session');
            const session = await res.json();
            
            // Redirect based on the role from the session
            const userRole = session?.user?.role;
            if (userRole === 'ROLE_ADMIN') {
                router.push('/admin/dashboard');
            } else if (userRole === 'ROLE_INSTRUCTOR') {
                router.push('/instructor/dashboard');
            } else {
                // Fallback redirect if the role is not recognized
                router.push('/admin/dashboard'); 
            }
        } else {
             setError("An unknown error occurred. Please try again.");
             setIsLoading(false);
        }
    };

    const handleForgotPasswordClick = () => {
        setIsForgotLoading(true);
        router.push('/api/auth/forgot');
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
                    {isForgotLoading ? "Redirecting..." : "Logging in..."}
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
                        className={`shadow-sm border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 ${error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                        placeholder="Email"
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
                            className={`shadow-sm border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                            placeholder="Password"
                        />
                        <span
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={togglePasswordVisibility}
                        >
                            {passwordVisible ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                                ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
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
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleForgotPasswordClick}
                        className="text-sm text-blue-600 hover:text-blue-800 "
                    >
                        <span className="underline">Forgot Password</span>
                    </button>
                </div>
            </form>
        </div>
    );
};