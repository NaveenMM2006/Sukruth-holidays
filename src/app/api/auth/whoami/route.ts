import { NextResponse } from "next/server";
import { getSession, getAdminEmails, isAdminEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  const admins = getAdminEmails();
  const userEmail = session?.user?.email || null;
  const isAdmin = isAdminEmail(userEmail);

  return NextResponse.json({
    authenticated: Boolean(session?.user),
    userEmail,
    isAdmin,
    adminEmailsConfigured: admins,
    hasSecret: Boolean(process.env.NEXTAUTH_SECRET),
    nextAuthUrl: process.env.NEXTAUTH_URL || null,
  });
}

