// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/services/auth.service';

function decodeJwt(token) {
  try {
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
            
            // --- UPDATED NAME HANDLING ---
            let userName;
            
            // Priority 1: Use firstName and lastName if available
            if (decodedPayload.firstName) {
                userName = decodedPayload.firstName;
                if (decodedPayload.lastName) {
                    userName += ` ${decodedPayload.lastName}`;
                }
            } 
            // Priority 2: Use the 'name' field if available and not empty
            else if (decodedPayload.name) {
                userName = decodedPayload.name;
            } 
            // Priority 3: Fallback to the email, but strip the domain part
            else {
                userName = credentials.email.split('@')[0];
            }

            return {
              id: decodedPayload.instructorId, // Use instructorId from the token
              name: userName, // Use the constructed or cleaned-up name
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
          // Decode the token to get the instructorId
          const decoded = token.accessToken ? 
              JSON.parse(Buffer.from(token.accessToken.split('.')[1], 'base64').toString()) 
              : null;
          
          session.accessToken = token.accessToken;
          session.user = {
              ...session.user,
              id: decoded?.instructorId || token.id, // Use instructorId from token
              email: token.email,
              role: token.role,
              name: token.name
          };
      }
      console.log("Updated session:", session);
      return session;
  },
  },
  
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
