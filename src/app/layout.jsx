import { Inter, Poppins, Roboto } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider'; // Import the new AuthProvider

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
  title: 'Scheduler',
  description: 'Scheduler Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}>
      <head>
        <title>{metadata.title}</title>
        <link rel="icon" href="https://numregister.com/assets/img/logo/num.png" />
      </head>
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