export const dynamic = "force-dynamic";

import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';

const authOptions: NextAuthOptions = {
  providers: [],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };