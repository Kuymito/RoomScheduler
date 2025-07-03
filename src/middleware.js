import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // If the user is not logged in, `token` will be null.
    // The `withAuth` middleware already handles redirecting to the login page.
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const userRole = token.role;

    // Redirect logic for admin users
    if (userRole === 'ROLE_ADMIN') {
      // If an admin tries to access instructor routes, redirect them to the admin dashboard
      if (pathname.startsWith('/instructor')) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    }
    
    // Redirect logic for instructor users
    else if (userRole === 'ROLE_INSTRUCTOR') {
      // If an instructor tries to access admin routes, redirect them to the instructor dashboard
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/instructor/dashboard', req.url));
      }
    }

    // Allow the request to proceed if no redirection is needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // A user is authorized if they have a token
    },
  }
);

// This configures the middleware to run on specific paths
export const config = {
  matcher: ['/admin/:path*', '/instructor/:path*'],
};
