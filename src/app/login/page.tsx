"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Lock, Mail, KeyRound, Loader2, LogOut, CheckCircle2 } from "lucide-react";

type WhoAmI = {
  authenticated: boolean;
  userEmail: string | null;
  isAdmin: boolean;
  adminEmailsConfigured: string[];
  hasSecret: boolean;
  nextAuthUrl: string | null;
};

function LoginInner() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";
  const error = sp.get("error");
  const { data: session, status } = useSession();

  const isAdminTarget = callbackUrl.startsWith("/admin");

  const [mode, setMode] = useState<"credentials" | "google">(isAdminTarget ? "credentials" : "google");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [whoami, setWhoami] = useState<WhoAmI | null>(null);

  useEffect(() => {
    fetch("/api/auth/whoami")
      .then((r) => r.json())
      .then((data: WhoAmI) => {
        setWhoami(data);
        if (data.authenticated && (data.isAdmin || !isAdminTarget)) {
          window.location.href = callbackUrl;
        }
      })
      .catch(() => {});
  }, [status, callbackUrl, isAdminTarget]);

  // Direct password submit for Admin
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setAuthError("");

    try {
      const res = await signIn("admin-credentials", {
        email: adminEmail.trim() || "admin@sukruthholidays.com",
        password: adminPassword,
        redirect: false,
        callbackUrl,
      });

      if (!res || res.error) {
        setAuthError(res?.error || "Incorrect password. Default is admin123 (or check ADMIN_PASSWORD).");
        setBusy(false);
      } else {
        // Hard navigate so cookies sync immediately
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="container-x grid min-h-[65vh] place-items-center py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mist text-lagoon">
          {isAdminTarget ? <Lock size={28} /> : <KeyRound size={28} />}
        </div>

        <h1 className="mt-4 text-3xl font-bold">
          {isAdminTarget ? "Admin Portal" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          {isAdminTarget
            ? "Sign in with Admin Password or an authorized Google account."
            : "Sign in to manage your bookings and inquiries."}
        </p>

        {/* Tab switch for Admin */}
        {isAdminTarget && (
          <div className="mt-6 flex rounded-xl bg-mist p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => { setMode("credentials"); setAuthError(""); }}
              className={`flex-1 rounded-lg py-2 transition-all ${
                mode === "credentials" ? "bg-white text-ink shadow-sm font-bold" : "text-ink/60 hover:text-ink"
              }`}
            >
              Admin Password
            </button>
            <button
              type="button"
              onClick={() => { setMode("google"); setAuthError(""); }}
              className={`flex-1 rounded-lg py-2 transition-all ${
                mode === "google" ? "bg-white text-ink shadow-sm font-bold" : "text-ink/60 hover:text-ink"
              }`}
            >
              Google Login
            </button>
          </div>
        )}

        {(authError || error) && (
          <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-left text-sm text-red-700">
            <p className="font-bold">
              {authError ? "Login Failed" : `Sign-in Error: ${error}`}
            </p>
            <p className="mt-1">
              {authError
                ? authError
                : error === "Configuration"
                ? "NextAuth configuration error. Check NEXTAUTH_SECRET and Google credentials in Vercel."
                : error === "OAuthSignin"
                ? "Failed to initiate Google sign-in. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel."
                : error === "OAuthCallback"
                ? "Google OAuth callback failed. Ensure 'https://sukruth-holidays.vercel.app/api/auth/callback/google' is in your Google Cloud Console Authorized redirect URIs."
                : error === "AccessDenied"
                ? "Access was denied by Google or by your authorization settings."
                : "Could not log you in. Please check your credentials and try again."}
            </p>
          </div>
        )}

        {/* 1. ADMIN PASSWORD FORM */}
        {mode === "credentials" && isAdminTarget && (
          <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-ink/70">
                Admin Email (Optional)
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-3 text-ink/40" size={16} />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@sukruthholidays.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="input !pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-pass" className="block text-xs font-semibold text-ink/70">
                Admin Password *
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 text-ink/40" size={16} />
                <input
                  id="admin-pass"
                  type="password"
                  required
                  placeholder="Enter admin password (default: admin123)"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input !pl-10"
                />
              </div>
              <p className="mt-1 text-xs text-ink/50">
                Default is <code className="font-mono font-bold text-ink">admin123</code> (configured via ADMIN_PASSWORD)
              </p>
            </div>

            <button type="submit" disabled={busy} className="btn-primary mt-2 w-full">
              {busy ? <Loader2 className="animate-spin" size={18} /> : null}
              {busy ? "Signing in..." : "Log In to Admin"}
            </button>
          </form>
        )}

        {/* 2. GOOGLE LOGIN */}
        {(mode === "google" || !isAdminTarget) && (
          <div className="mt-6">
            <button
              onClick={() => signIn("google", { callbackUrl, prompt: "select_account" })}
              className="btn-dark w-full"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden className="mr-2 inline-block">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* Diagnostic info when signed in but unauthorized */}
        {whoami?.authenticated && !whoami?.isAdmin && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900">
            <p className="font-semibold text-amber-800">Signed in with Google:</p>
            <p className="mt-1 font-mono font-bold">{whoami.userEmail}</p>
            <p className="mt-2 text-amber-700">
              This email is not listed in Vercel <code className="font-mono">ADMIN_EMAILS</code>. You can switch to the <strong>Admin Password</strong> tab above to log in directly!
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/login?callbackUrl=/admin" })}
              className="mt-3 flex items-center gap-1 font-semibold text-amber-900 hover:underline"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
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
