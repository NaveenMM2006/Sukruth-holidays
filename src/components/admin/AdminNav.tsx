"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Car, Flame, Inbox, ExternalLink, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Booking requests", icon: Inbox },
  { href: "/admin/packages", label: "Packages", icon: Map },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/offers", label: "Offers and news", icon: Flame },
];

export default function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  return (
    <aside className="bg-ink text-white md:fixed md:inset-y-0 md:left-0 md:w-64">
      <div className="flex items-center justify-between px-5 py-4 md:block md:py-6">
        <p className="font-display text-lg font-bold">Sukruth Holidays</p>
        <p className="hidden text-xs text-white/60 md:block">Signed in as {name}</p>
      </div>
      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10",
                active && "bg-white/15 text-marigold"
              )}
            >
              <Icon size={18} aria-hidden /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden space-y-1 px-3 py-6 md:absolute md:bottom-0 md:block md:w-full">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm hover:bg-white/10">
          <ExternalLink size={18} aria-hidden /> View website
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm hover:bg-white/10">
          <LogOut size={18} aria-hidden /> Log out
        </button>
      </div>
    </aside>
  );
}
