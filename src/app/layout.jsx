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

export const metadata = {
  metadataBase: new URL('https://num-digital-scheduler.fit'),

  title: 'NUM Digital Scheduler',
  description: 'A comprehensive room and class scheduling management system for the National University of Management.',
  openGraph: {
    title: 'NUM Digital Scheduler',
    description: 'Efficiently plan, track, and manage university schedules for Administrators and Instructors.',
    url: 'https://num-digital-scheduler.fit',
    siteName: 'National University of Management Scheduler',
    images: [
      {
        url: '/images/LOGO-NUM-1.png', // Next.js will now correctly turn this into an absolute URL
        width: 800,
        height: 800,
        alt: 'National University of Management Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/images/LOGO-NUM-1.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}>
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