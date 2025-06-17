// src/app/api/auth/headerToken.js

import { getSession } from 'next-auth/react';

/**
 * A helper function to get the authorization header with the Bearer token.
 * This can be used in your client-side components to make authenticated API requests.
 * @returns {Promise<Object>} An object containing the Authorization header, or an empty object if no token is found.
 */
export const getAuthHeader = async () => {
  // getSession can be used client-side to get the current session
  const session = await getSession();
  
  // The session object contains the accessToken we stored in the NextAuth callbacks
  if (session && session.accessToken) {
    return { 'Authorization': `Bearer ${session.accessToken}` };
  }
  
  return {};
};
