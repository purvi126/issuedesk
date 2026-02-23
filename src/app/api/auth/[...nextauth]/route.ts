import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },

  // Use your custom login page
  pages: {
    signIn: "/login",
  },

  // Keep redirects safe + consistent
  callbacks: {
    async redirect({ url, baseUrl }) {
      // allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // allow same-origin absolute URLs
      if (new URL(url).origin === baseUrl) return url;
      // fallback
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };