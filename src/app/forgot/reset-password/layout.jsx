// app/reset-password/layout.jsx
import { Roboto, Battambang } from 'next/font/google';

// Configure fonts
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto', // Ensure these are defined in your tailwind.config.js
});

const battambang = Battambang({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--font-battambang', // Ensure these are defined in your tailwind.config.js
});

export const metadata = {
  title: 'Create New Password - NUM',
  description: 'Set a new password for your Nation University of Management account.',
};

export default function ResetPasswordSegmentLayout({ children }) {
  return (
    <div lang="en" className={`${roboto.variable} ${battambang.variable} font-roboto`}>
      <main className="flex justify-center items-center min-h-screen">
        {/* The background color for the page (e.g., bg-num-light-gray) should be on the <body> tag
            in your root app/layout.jsx or on this <main> tag if this segment has a different background.
            Assuming root layout handles general background. */}
        {children}
      </main>
    </div>
  );
}
