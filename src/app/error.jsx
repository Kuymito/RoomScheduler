'use client';

import Link from 'next/link';
import { Moul } from 'next/font/google';
import { useEffect } from 'react';

// Initialize the Moul font, consistent with your login page
const moul = Moul({
    weight: '400',
    subsets: ['latin'],
});

/**
 * A general-purpose error component styled like the login page's loading screen.
 *
 * @param {object} props - The props for the component.
 * @param {Error & { digest?: string }} props.error - The error object.
 * @param {() => void} props.reset - A function to reset the error boundary.
 */
const ErrorPage = ({ error, reset }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const statusCode = error.digest || '500'; 
  const title = "An Error Occurred";
  const description = error.message || "Something went wrong on our end. Please try again in a moment.";

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#E0E4F3] text-center p-6">
      <img
        src="https://numregister.com/assets/img/logo/num.png"
        alt="University Logo"
        className="mx-auto mb-6 w-24 sm:w-28 md:w-32"
      />
      <h1 className={`${moul.className} text-2xl sm:text-3xl font-bold mb-3 text-blue-800`}>
        សាកលវិទ្យាល័យជាតិគ្រប់គ្រង
      </h1>
      <h2 className="text-xl sm:text-2xl font-medium mb-8 text-blue-700">
        National University of Management
      </h2>
      
      <div className="max-w-md">
        <h3 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">
          Error {statusCode}
        </h3>
        <p className="text-base sm:text-lg text-gray-700 font-semibold mb-8">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Try Again
          </button>
          <Link href="/" legacyBehavior>
            <a className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              Go Back Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;