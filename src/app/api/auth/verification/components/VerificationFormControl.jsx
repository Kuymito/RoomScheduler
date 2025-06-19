'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { moul } from '@/components/fonts';
import RightVerificationSectionSkeleton from './RightVerificationSectionSkeleton';

const DynamicRightVerificationSection = dynamic(() => import('./RightVerificationSection'), {
  ssr: false,
});

const VerificationFormControl = () => {
    return (
        <div className="min-h-screen w-screen flex flex-col md:flex-row font-sans">
            {/* Left Column (Info Section) */}
            <div className="hidden md:flex md:w-3/5 bg-[#3165F8] text-white items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br opacity-75"></div>
                <div className="relative z-10 max-w-xs sm:max-w-sm lg:max-w-md">
                    <Image 
                        src="/images/LOGO-NUM-1.png" 
                        alt="University Logo" 
                        width={112} 
                        height={112}
                        priority={true}
                        className="mx-auto mb-10 w-16 sm:w-20 md:w-24 lg:w-28" 
                    />
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
            <div className="w-full h-full md:w-2/5 bg-[#E0E4F3] flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16">
                <Suspense fallback={<RightVerificationSectionSkeleton />}>
                    <DynamicRightVerificationSection />
                </Suspense>
            </div>
        </div>
    );
};

export default VerificationFormControl;