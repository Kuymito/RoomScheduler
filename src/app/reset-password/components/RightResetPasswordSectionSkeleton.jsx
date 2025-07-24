import React from 'react';
/**
 * A skeleton loader that mimics the layout of the "Reset Password" form.
 */
const RightResetPasswordSectionSkeleton = () => {
    return (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md animate-pulse">
            {/* Mobile-only Logo Skeleton */}
            <div className="mb-16 block md:hidden">
                <div className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded-full w-3/4 mx-auto mb-2"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-full mx-auto mb-6"></div>
            </div>

            {/* Form Header Skeleton */}
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-full mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-5/6 mb-8"></div>
            
            <div className="space-y-6">
                 {/* Password Input Skeleton */}
                <div>
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-1/4 mb-1"></div>
                    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-full"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-1/2 mt-2"></div>
                </div>

                {/* Confirm Password Input Skeleton */}
                <div>
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-1/3 mb-1"></div>
                    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-full"></div>
                </div>

                {/* Button Skeleton */}
                <div className="h-12 bg-gray-400 dark:bg-gray-600 rounded-lg w-full"></div>
            </div>
        </div>
    );
};

export default RightResetPasswordSectionSkeleton;