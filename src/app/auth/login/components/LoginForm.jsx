'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Moul } from 'next/font/google';

const moul = Moul({ weight: '400', subsets: ['latin'] });

// Define the API URL for your login endpoint
const LOGIN_API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/auth/login` : 'https://jaybird-new-previously.ngrok-free.app/api/v1/auth/login';

/**
 * A simple helper function to decode the payload from a JWT.
 * This runs on the client and does not verify the token's signature.
 * @param {string} token The JWT string.
 * @returns {object|null} The decoded payload object or null if parsing fails.
 */
const parseJwt = (token) => {
    if (!token) { return null; }
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error parsing JWT:", error);
        return null;
    }
};

// This component contains the form and its logic
const RightSection = () => {
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
    
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
    
        setIsLoading(true);
        setError('');
    
        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
    
            // First, check if the response is okay. If not, parse error message.
            if (!response.ok) {
                let errorMsg = 'Login failed. Please check your credentials.';
                try {
                    // Try to get a more specific error message from the backend
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    // Ignore if error response is not JSON
                }
                throw new Error(errorMsg);
            }
    
            const data = await response.json();
            
            // The token should be in the 'payload' of your successful ApiResponse
            const token = data.payload?.token || data.token;
            
            if (token) {
                console.log("Token found! Saving to storage and navigating.");
                localStorage.setItem('jwtToken', token);
                
                // --- ✅ ROLE-BASED REDIRECTION LOGIC ---
                const decodedToken = parseJwt(token);

                if (decodedToken && decodedToken.roles) {
                    // Check if the user has the 'ROLE_ADMIN'
                    if (decodedToken.roles.includes('ROLE_ADMIN')) {
                        console.log("Admin user detected. Redirecting to admin dashboard.");
                        router.push('/admin/dashboard'); 
                    } 
                    // Check if the user has the 'ROLE_INSTRUCTOR'
                    else if (decodedToken.roles.includes('ROLE_INSTRUCTOR')) {
                        console.log("Instructor user detected. Redirecting to instructor dashboard.");
                        router.push('/instructor/dashboard'); // Make sure this route exists
                    } 
                    // Fallback for any other authenticated user
                    else {
                        console.log("User with other roles detected. Redirecting to default page.");
                        router.push('/'); 
                    }
                } else {
                    // Fallback if token is valid but has no roles claim
                    console.warn("Token is valid but no roles found. Redirecting to default dashboard.");
                    router.push('/admin/dashboard');
                }

            } else {
                throw new Error('Login successful, but no token was received from the server.');
            }
    
        } catch (err) {
            console.error("An error occurred during login:", err);
            setError(err.message);
            setIsLoading(false); // Stop loading spinner on error
        }
    };

    const handleForgotPasswordClick = () => {
        setIsForgotLoading(true);
        setTimeout(() => {
            router.push('/auth/forgot');
        }, 1500);
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
                    {isForgotLoading ? "Redirecting, please wait..." : "Authenticating, please wait..."}
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
                <h2 className="text-2xl sm:text-[24px] font-bold text-gray-800 mb-2 text-left">Welcome back!</h2>
                <p className="text-sm sm:text-base text-gray-600 text-left">Please sign in to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full sm:w-5/6">
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm sm:text-base mb-1 font-bold text-gray-900">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`shadow-sm border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                        placeholder="admin@example.com"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm sm:text-base mb-1 font-bold text-gray-900">Password</label>
                    <div className="relative">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`shadow-sm border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                            placeholder="Your password"
                            required
                        />
                        <span
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={togglePasswordVisibility}
                        >
                            {passwordVisible ? (
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A3 3 0 1012 12M21 12c-1.785 4.398-5.672 7-9 7-1.488 0-2.92-.254-4.252-.733L5 18.5V21h2l-2-2m-2-2l2-2" /></svg>
                            ) : (
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </span>
                    </div>
                    {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
                </div>

                <div className="flex flex-col items-center justify-between">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition duration-150 ease-in-out mb-3 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={handleForgotPasswordClick}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Forgot Password
                    </button>
                </div>
            </form>
        </div>
    );
};


const LoginForm = () => {
    return (
        <div className="min-h-screen w-screen flex flex-col lg:flex-row font-sans">
            <div className="lg:w-3/5 w-full bg-[#3165F8] text-white flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden">
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

            <div className="lg:w-2/5 w-full bg-[#E0E4F3] flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16">
                <RightSection />
            </div>
        </div>
    );
};

export default LoginForm;