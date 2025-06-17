import React from 'react';
/**
 * A skeleton loader that mimics the layout of the OTP verification form.
 */
const RightVerificationSectionSkeleton = () => {
    return (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md animate-pulse">
            {/* Mobile-only Logo Skeleton */}
            <div className="mb-16 block md:hidden">
                <div className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded-full w-3/4 mx-auto mb-2"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-full mx-auto mb-6"></div>
            </div>

            {/* Form Header Skeleton */}
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-full mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-5/6 mb-8"></div>
            
            <div className="space-y-6">
                 {/* OTP Boxes Skeleton */}
                <div className="flex justify-center space-x-2 sm:space-x-3 md:space-x-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                </div>

                {/* Timer Skeleton */}
                <div className="h-6 w-24 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full"></div>

                {/* Button Skeleton */}
                <div className="h-12 bg-gray-400 dark:bg-gray-600 rounded-lg w-full"></div>
            </div>

             {/* Resend Link Skeleton */}
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-3/4 mx-auto mt-6"></div>
        </div>
    );
};

export default RightVerificationSectionSkeleton;