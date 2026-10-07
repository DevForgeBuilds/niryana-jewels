import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Real Google OAuth sign-in. Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
// (from Google Cloud Console → APIs & Services → Credentials) and a
// NEXTAUTH_SECRET to be set as environment variables (locally in .env.local,
// and on Vercel under Project Settings → Environment Variables).
//
// In production, the user's Google profile (name, email, avatar) is used to
// create/sign-in the session. Persisting the account to MySQL `users` table
// (so orders can be linked to a real customer record) is the next step once
// the backend database is live — see README.
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/account",
  },
});

export { handler as GET, handler as POST };
