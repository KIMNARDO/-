import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { getServiceSupabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      const supabase = getServiceSupabase();

      // Upsert user with tokens
      await supabase.from("users").upsert(
        {
          email: user.email,
          name: user.name,
          image: user.image,
          google_access_token: account.access_token,
          google_refresh_token: account.refresh_token,
        },
        { onConflict: "email" }
      );

      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
      };
    },
  },
  pages: {
    signIn: "/setup",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
