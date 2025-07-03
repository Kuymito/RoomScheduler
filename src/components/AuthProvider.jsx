'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * This is a client-side component that wraps the NextAuth SessionProvider.
 * It allows us to use the useSession hook in our client components.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be wrapped.
 * @param {object} [props.session] - The initial session object (optional).
 */
export default function AuthProvider({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}