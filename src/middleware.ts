import { withAuth } from "next-auth/middleware";

// Only signed-in admins can open /admin pages. API routes re-check on the server as well.
export default withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: { authorized: ({ token }) => Boolean(token?.isAdmin) },
  pages: { signIn: "/login" },
});

export const config = { matcher: ["/admin/:path*"] };
