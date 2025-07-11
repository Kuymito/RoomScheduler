import { Inter, Poppins, Roboto, Battambang } from 'next/font/google'; // Import Battambang
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

// Define Battambang font
const battambang = Battambang({
  subsets: ['khmer'], // Important: specify 'khmer' subset
  weight: ['400', '700'], // Choose the weights you need
  variable: '--font-battambang',
  display: 'swap',
});

export const metadata = {
  title: 'Scheduler',
  description: 'Scheduler Management System',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en" // Keep lang="en" for overall document, specific lang handled by component
      className={`${inter.variable} ${poppins.variable} ${roboto.variable} ${battambang.variable}`} // Add Battambang variable
    >
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

