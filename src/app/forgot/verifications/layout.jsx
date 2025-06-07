// app/verify-code/layout.jsx
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
  title: 'Verification - NUM',
  description: 'Verify your email for Nation University of Management.',
};

export default function VerifyCodeSegmentLayout({ children }) {
  // This layout applies font variables.
  // Global styles like background and centering should be in your root layout (app/layout.jsx).
  return (
    <div lang="en" className={`${roboto.variable} ${battambang.variable} font-roboto`}>
      <main className="flex justify-center items-center min-h-screen">
        {children}
      </main>
    </div>
  );
}
