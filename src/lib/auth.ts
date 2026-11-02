import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.replace(/['"\s]/g, "").trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleaned = email.trim().toLowerCase();
  const admins = getAdminEmails();
  return admins.includes(cleaned);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      token.isAdmin = isAdminEmail(token.email);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = Boolean(token.isAdmin || isAdminEmail(session.user.email));
      }
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

/** Returns the session if the caller is an admin, otherwise null. */
export async function requireAdmin() {
  const session = await getSession();
  const isAdm = Boolean(session?.user?.isAdmin || isAdminEmail(session?.user?.email));
  return isAdm ? session : null;
}
