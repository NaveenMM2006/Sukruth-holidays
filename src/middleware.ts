import { withAuth } from "next-auth/middleware";

// Only signed-in admins can open /admin pages.
export default withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized: ({ token }) => {
      if (!token) return false;
      if (token.isAdmin) return true;
      const email = (token.email || "").trim().toLowerCase();
      if (!email) return false;
      const admins = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.replace(/['"\s]/g, "").trim().toLowerCase())
        .filter(Boolean);
      return admins.includes(email);
    },
  },
  pages: { signIn: "/login" },
});

export const config = { matcher: ["/admin/:path*"] };
