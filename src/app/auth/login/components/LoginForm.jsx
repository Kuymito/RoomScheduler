"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Moul } from 'next/font/google';

const moul = Moul({
  weight: '400',
  subsets: ['latin'],
});

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctEmail = "admin@gmail.com";
    const correctPassword = "123";

    if (!email && !password) {
      alert("Please enter email and password.");
      return;
    } else if (!password) {
      alert("Please enter your password.");
      return;
    }else if(!email){
      alert("Please enter your email.")
      return;
    }
    else if (email !== correctEmail || password !== correctPassword) {
      alert("Incorrect email or password. Please try again.");
      return;
    } else {
    //   alert('Login successful!');
      console.log("Logging in with:", { email, password });
      router.push('/admin/dashboard'); // Redirect to the dashboard page
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row font-sans">
      <div className="lg:w-3/5 w-full bg-blue-100 text-white flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 opacity-75"></div>
        <div className="relative z-10 max-w-sm sm:max-w-md lg:max-w-lg">
          <img src="https://numregister.com/assets/img/logo/num.png" alt="University Logo" className="mx-auto mb-4 w-16 sm:w-20 md:w-24 lg:w-28" />
          <h1 className={`${moul.className} text-3xl font-bold mb-2 text-center`}>សាកលវិទ្យាល័យជាតិគ្រប់គ្រង</h1>
          <h2 className="text-2xl font-medium mb-6 text-center">Nation University of Management</h2>
          <h3 className="text-lg font-medium mb-3">Welcome student login form.</h3>
          <p className="text-sm leading-relaxed">
            First, as the Rector of the National University of Management (NUM), I would like to
            sincerely welcome you to our institution here in the Capital City of Phnom Penh,
            Cambodia. For those who have become our partners and friends, I extend a heartfelt
            appreciation for your cooperation and support in advancing higher education in our
            developing nation. The development of NUM as a quality education institution began
            at its commencement in 1983. NUM continues to be one of the leading public
            universities in Cambodia.
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:w-2/5 w-full bg-white flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Welcome back!</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">Please sign in to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow-sm border rounded-lg w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="admin@gmail.com"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow-sm border rounded-lg w-full py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="at least 8 characters"
                />
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? (
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A3 3 0 1012 12M21 12c-1.785 4.398-5.672 7-9 7-1.488 0-2.92-.254-4.252-.733L5 18.5V21h2l-2-2m-2-2l2-2"/>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between">
              <button
                  type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition duration-150 ease-in-out mb-3"
              >
                Login
              </button>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Forgot Password</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;