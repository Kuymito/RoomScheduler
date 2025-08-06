import { Inter, Poppins, Roboto } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

// UPDATED METADATA OBJECT
export const metadata = {
  title: 'NUM Digital Scheduler',
  description: 'A comprehensive room and class scheduling management system for the National University of Management.',
  openGraph: {
    title: 'NUM Digital Scheduler',
    description: 'Efficiently plan, track, and manage university schedules for Administrators and Instructors.',
    url: 'https://num-digital-scheduler.fit',
    siteName: 'National University of Management Scheduler',
    images: [
      {
        url: '/images/LOGO-NUM-1.png',
        width: 800,
        height: 800,
        alt: 'National University of Management Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}>
      {/*
        The <head> tag is no longer needed here. 
        Next.js automatically generates it from the 'metadata' object above.
        Your favicon.ico file in the `src/app` directory will also be picked up automatically.
      */}
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}