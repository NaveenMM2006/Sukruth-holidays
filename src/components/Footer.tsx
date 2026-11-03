"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const phone = process.env.NEXT_PUBLIC_ADMIN_PHONE;

  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold text-white">Sukruth Holidays</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            Tour packages, vehicle rentals and travel offers planned by people who know the routes.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-2 text-sm">
          <Link href="/packages" className="hover:text-marigold">Packages</Link>
          <Link href="/vehicles" className="hover:text-marigold">Vehicle rental</Link>
          <Link href="/fare-calculator" className="hover:text-marigold">Fare Calculator</Link>
          <Link href="/offers" className="hover:text-marigold">Hot offers</Link>
          <Link href="/contact" className="hover:text-marigold">Contact</Link>
        </nav>
        <div className="space-y-3 text-sm">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-marigold">
              <Phone size={16} aria-hidden /> {phone}
            </a>
          )}
          <p className="flex items-center gap-2">
            <Mail size={16} aria-hidden /> Send a request from any package page
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Sukruth Holidays. All rights reserved.
      </div>
    </footer>
  );
}
