import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";

export function getAdminEmails(): string[] {
  const configured = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.replace(/['"\s]/g, "").trim().toLowerCase())
    .filter(Boolean);
  return configured.length ? configured : ["tempuser8861@gmail.com"];
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleaned = email.trim().toLowerCase();
  return getAdminEmails().includes(cleaned);
}

export const authOptions: NextAuthOptions = {
  // Safe fallback ensures NextAuth never crashes on missing env var
  secret: process.env.NEXTAUTH_SECRET || "sukruth-holidays-fallback-auth-secret-key-2026-production",
  providers: [
    // 1. Direct Admin Credentials (Password) login — 100% reliable, no Google setup needed
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Password",
      credentials: {
        email: { label: "Admin Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase() || "";
        const password = credentials?.password || "";
        const expected = process.env.ADMIN_PASSWORD || "admin123";

        if (!password || password !== expected) {
          throw new Error("Invalid password. Default is admin123 (or check ADMIN_PASSWORD in env).");
        }

        return {
          id: "admin-master",
          name: "Admin",
          email: email || "admin@sukruthholidays.com",
          isAdmin: true,
        };
      },
    }),

    // 2. Google OAuth login
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
      if (user) {
        token.email = user.email || token.email;
        token.isAdmin = (user as any).isAdmin ?? isAdminEmail(token.email);
      } else if (token.email) {
        token.isAdmin = Boolean(token.isAdmin || isAdminEmail(token.email));
      }
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
  if (!session?.user) return null;
  const isAdm = Boolean(session.user.isAdmin || isAdminEmail(session.user.email));
  return isAdm ? session : null;
}
