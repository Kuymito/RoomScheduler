// app/create-new-password/layout.jsx
import { Roboto, Battambang } from 'next/font/google';

// Configure fonts
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

const battambang = Battambang({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--font-battambang',
});

export const metadata = {
  title: 'Create New Password - NUM',
  description: 'Set a new password for your Nation University of Management account.',
};

export default function CreateNewPasswordSegmentLayout({ children }) {
  return (
    <div lang="en" className={`${roboto.variable} ${battambang.variable} font-roboto`}>
      <main className="flex justify-center items-center min-h-screen">
        {children}
      </main>
    </div>
  );
}
