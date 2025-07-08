// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/services/auth.service';

/**
 * Decodes a JWT token without verifying its signature.
 * @param {string} token - The JWT token.
 * @returns {object|null} The decoded payload or null if decoding fails.
 */
function decodeJwt(token) {
  try {
    // The token is split into three parts: header, payload, and signature.
    // The payload is the second part, which is base64url encoded.
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!process.env.NEXTAUTH_SECRET) {
            throw new Error("NEXTAUTH_SECRET is not set. Please add it to your .env.local file.");
        }
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password.");
        }
        try {
          const apiResponse = await authService.login(credentials.email, credentials.password);
          const accessToken = apiResponse.token;

          if (accessToken) {
            const decodedPayload = decodeJwt(accessToken);
            if (!decodedPayload) throw new Error("Could not decode token.");
            
            console.log("Decoded JWT Payload:", decodedPayload);

            const userRole = decodedPayload.roles && decodedPayload.roles[0];
            // FIX: Use a specific user/instructor ID from the token payload.
            // Assuming the backend includes a 'userId' or 'instructorId' claim.
            const userId = decodedPayload.userId || decodedPayload.instructorId;

            if (!userRole) {
              console.error("Role not found in JWT payload's 'roles' array!");
              return null;
            }
            
            if (!userId) {
                console.error("User ID ('userId' or 'instructorId') not found in JWT payload!");
                // Fallback to 'sub' but log a warning, as the numeric ID is preferred.
                console.warn("Falling back to 'sub' claim for user ID. This may not be the correct numeric ID for API calls.");
            }

            let userName;
            if (decodedPayload.firstName) {
                userName = decodedPayload.firstName;
                if (decodedPayload.lastName) {
                    userName += ` ${decodedPayload.lastName}`;
                }
            } else if (decodedPayload.name) {
                userName = decodedPayload.name;
            } else {
                userName = credentials.email.split('@')[0];
            }

            return {
              // Use the numeric ID from the token if available, otherwise fallback to 'sub'
              id: userId || decodedPayload.sub,
              name: userName,
              email: decodedPayload.sub, // 'sub' usually holds the email/username
              role: userRole,
              accessToken: accessToken,
            };
          }
          return null;
        } catch (error) {
          throw new Error(error.message);
        }
      }
    })
  ],
  pages: {
    signIn: '/api/auth/login',
    error: '/api/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // When a user signs in, the `user` object is passed.
      // We persist the custom properties to the token.
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // The session callback receives the token and populates the session object.
      if (token) {
        session.accessToken = token.accessToken;
        session.user = {
            ...session.user,
            id: token.id,
            role: token.role,
            name: token.name,
            email: token.email
        };
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };