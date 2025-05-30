'use client'; // Not strictly necessary for this component as it's static, but good practice if you might add client-side interactions later.

import React from 'react';

const Footer = () => {
  return (
    <footer className="footer bg-white dark:bg-gray-900 p-[15px] text-center font-medium text-xs text-black dark:text-white">
      Copyright @2025 <span className='text-blue-600'>NUM-FIT</span> Digital Center. All rights reserved.
    </footer>
  );
};

export default Footer;