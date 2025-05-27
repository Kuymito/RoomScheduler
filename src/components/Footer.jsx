'use client'; // Not strictly necessary for this component as it's static, but good practice if you might add client-side interactions later.

import React from 'react';

const Footer = () => {
  return (
    <footer className="footer bg-white p-[15px] text-center font-medium text-xs text-black border-t border-num-gray-light">
      Copyright @2025 NUM-FIT Digital Center. All rights reserved.
    </footer>
  );
};

export default Footer;