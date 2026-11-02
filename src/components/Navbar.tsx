"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Compass, Menu, X, LogOut, Shield } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/packages", label: "Packages" },
  { href: "/vehicles", label: "Vehicle rental" },
  { href: "/offers", label: "Hot offers" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-marigold focus:px-3 focus:py-1 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-marigold text-ink">
            <Compass size={20} aria-hidden />
          </span>
          Sukruth Holidays
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                pathname.startsWith(l.href) && "bg-white/15"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session?.user?.isAdmin && (
            <Link href="/admin" className="flex items-center gap-1 text-sm text-marigold hover:underline">
              <Shield size={16} aria-hidden /> Admin
            </Link>
          )}
          {status === "authenticated" ? (
            <>
              <Link href="/my-bookings" className="text-sm hover:underline">
                My requests
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1 rounded-full border border-white/25 px-4 py-2 text-sm hover:bg-white/10"
                aria-label="Log out"
              >
                <LogOut size={16} aria-hidden /> Log out
              </button>
            </>
          ) : (
            <button onClick={() => signIn("google")} className="btn-primary !px-5 !py-2 text-sm">
              Log in with Google
            </button>
          )}
        </div>

        <button
          className="rounded-lg p-2 hover:bg-white/10 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-4 pb-4 md:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 hover:bg-white/10">
                {l.label}
              </Link>
            ))}
            {status === "authenticated" && (
              <Link href="/my-bookings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 hover:bg-white/10">
                My requests
              </Link>
            )}
            {session?.user?.isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-marigold hover:bg-white/10">
                Admin panel
              </Link>
            )}
          </nav>
          {status === "authenticated" ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost w-full !text-white">
              Log out
            </button>
          ) : (
            <button onClick={() => signIn("google")} className="btn-primary w-full">
              Log in with Google
            </button>
          )}
        </div>
      )}
    </header>
  );
}
