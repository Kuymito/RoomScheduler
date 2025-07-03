import React from 'react';

const RightForgotPasswordSectionSkeleton = () => {
    return (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center animate-pulse">
            <div className="w-full sm:w-5/6">
                 {/* Mobile-only Logo Skeleton */}
                <div className="mb-16 block md:hidden">
                    <div className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded-full w-3/4 mx-auto mb-2"></div>
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-full mx-auto mb-6"></div>
                </div>
                 {/* Form Header Skeleton */}
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-full mb-1"></div>
                 <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-4/5 mb-8"></div>

            </div>

            <div className="w-full sm:w-5/6">
                 {/* Email Input Skeleton */}
                <div className="mb-5">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-1/4 mb-1"></div>
                    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-full"></div>
                </div>


                {/* Buttons Skeleton */}
                <div className="w-full text-right h-5 bg-gray-300 dark:bg-gray-700 rounded-full mb-5 w-1/4 ml-auto"></div>
                <div className="w-full h-10 bg-gray-400 dark:bg-gray-600 rounded-lg"></div>

            </div>
        </div>
    );
};

export default RightForgotPasswordSectionSkeleton;