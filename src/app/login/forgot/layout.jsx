// app/forgot-password/layout.jsx
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
  title: 'Forgot Password - NUM', // Keep it concise or use the full name
  description: 'Recover your Nation University of Management account password.',
};

export default function ForgotPasswordSegmentLayout({ children }) {
  return (
    // The <html> and <body> tags are typically handled by the root layout (app/layout.jsx).
    // This segment layout provides the specific font variables and renders children.
    // If this is your ONLY layout and you don't have a root app/layout.jsx, you'd need <html> and <body> here.
    // Assuming you have a root layout, this is simpler:
    <div lang="en" className={`${roboto.variable} ${battambang.variable} font-roboto`}>
      {/* The body classes like bg-num-light-gray, flex, justify-center etc.
          should ideally be on the <body> tag in your ROOT layout (app/layout.jsx)
          or on a main wrapper div within it if this layout is nested.
          For this example, if this is the effective "page wrapper":
      */}
      <main className="bg-num-light-gray flex justify-center items-center min-h-screen text-num-dark-text m-0">
        {children}
      </main>
    </div>
  );
}   