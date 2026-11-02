"use client";

import { Suspense, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, LogOut } from "lucide-react";

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";
  const error = sp.get("error");
  const { data: session, status } = useSession();

  const isAdminTarget = callbackUrl.startsWith("/admin");
  const isAccessDenied = status === "authenticated" && isAdminTarget && !session?.user?.isAdmin;

  useEffect(() => {
    if (status === "authenticated" && (!isAdminTarget || session?.user?.isAdmin)) {
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, isAdminTarget, router]);

  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-card">
        <h1 className="text-3xl font-bold">
          {isAdminTarget ? "Admin Access" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          {isAdminTarget
            ? "Sign in with an authorized Google account to manage the website."
            : "Log in to send booking requests and track them."}
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not log you in. Please check your credentials or try again.
          </p>
        )}

        {isAccessDenied ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle size={18} />
                <span>Email Not Authorized</span>
              </div>
              <p className="mt-2">
                Signed in as <strong>{session?.user?.email}</strong>, but this email is not in <code>ADMIN_EMAILS</code>.
              </p>
              <p className="mt-2 text-xs text-amber-700">
                Add <strong>{session?.user?.email}</strong> to <code>ADMIN_EMAILS</code> in your Vercel Environment Variables, or sign in with an authorized account.
              </p>
            </div>

            <button
              onClick={() => signIn("google", { callbackUrl, prompt: "select_account" })}
              className="btn-dark w-full"
            >
              Sign in with another Google account
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink/20 py-2.5 text-sm font-medium hover:bg-mist"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl, prompt: "select_account" })}
            className="btn-dark mt-6 w-full"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden className="mr-2 inline-block">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
            </svg>
            Continue with Google
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
