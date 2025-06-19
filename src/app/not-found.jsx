'use client';

import Link from 'next/link';
import { Moul } from 'next/font/google';

// Initialize the Moul font, consistent with your login page
const moul = Moul({
    weight: '400',
    subsets: ['latin'],
});

const NotFoundPage = () => {
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
      <p className="text-2xl sm:text-3xl text-red-600 font-semibold mb-2">
        404 - Page Not Found
      </p>
      <p className="text-lg sm:text-xl text-gray-700 font-semibold mb-8">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/" legacyBehavior>
        <a className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
          Go Back Home
        </a>
      </Link>
    </div>
  );
};

export default NotFoundPage;