// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/services/auth.service';

function decodeJwt(token) {
  try {
    // Using Buffer is the standard and more reliable way in Node.js
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

            if (!userRole) {
              console.error("Role not found in JWT payload's 'roles' array!");
              return null;
            }
            
            return {
              id: decodedPayload.sub,
              name: decodedPayload.name || credentials.email,
              email: decodedPayload.sub,
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
      if (token) {
        session.accessToken = token.accessToken;
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };