import { Roboto, Battambang } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const battambang = Battambang({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--font-battambang',
  display: 'swap',
});

export const metadata = {
  title: 'Forgot Password - Nation University of Management',
  description:
    'Recover your Nation University of Management account password to regain access to your student portal.',
  keywords: 'NUM, Nation University of Management, forgot password, password recovery',
  viewport: 'width=device-width, initial-scale=1',
};

export default function ForgotPasswordSegmentLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.variable} ${battambang.variable}`}>
      <body className="m-0 p-0 bg-gray-100">
        <main className="flex justify-center items-center min-h-screen w-screen text-gray-900">
          {children}
        </main>
      </body>
    </html>
  );
}