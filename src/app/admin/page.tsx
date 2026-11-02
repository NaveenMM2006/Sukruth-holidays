import Link from "next/link";
import { Map, Car, Flame, Inbox, ArrowUpRight } from "lucide-react";
import { getAdminStats, paginate } from "@/lib/queries";
import { Booking } from "@/models";
import { safe } from "@/lib/safe";
import { shortDate } from "@/lib/format";
import SafeImage from "@/components/SafeImage";

type B = { _id: string; itemTitle: string; name: string; phone: string; createdAt: string; kind: string };

export default async function AdminHome() {
  const stats = await safe(getAdminStats, { packages: 0, vehicles: 0, offers: 0, bookings: 0, newBookings: 0 });
  const recent = await safe(
    () => paginate<B>(Booking, { status: "new" }, { createdAt: -1 }, 1, 5, 5),
    { items: [], total: 0, page: 1, pages: 1, limit: 5 }
  );

  const cards = [
    { label: "New requests", value: stats.newBookings, href: "/admin/bookings", icon: Inbox, accent: true },
    {
      label: "Packages",
      value: stats.packages,
      href: "/admin/packages",
      icon: Map,
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=70",
    },
    {
      label: "Vehicles",
      value: stats.vehicles,
      href: "/admin/vehicles",
      icon: Car,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=70",
    },
    {
      label: "Offers and news",
      value: stats.offers,
      href: "/admin/offers",
      icon: Flame,
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=70",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, href, icon: Icon, accent, image }) => (
          <Link
            key={label}
            href={href}
            className={`group relative overflow-hidden rounded-2xl p-5 shadow-card transition-all hover:-translate-y-0.5 ${
              accent ? "bg-marigold text-ink" : "bg-white text-ink"
            }`}
          >
            {image && (
              <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20">
                <SafeImage src={image} alt="" fill sizes="250px" className="object-cover" />
              </div>
            )}
            <div className="relative z-10 flex items-center justify-between">
              <Icon size={22} aria-hidden />
              <ArrowUpRight size={16} className="text-ink/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="relative z-10 mt-3 font-display text-4xl font-bold">{value}</p>
            <p className="relative z-10 text-sm font-medium">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/packages"
          className="group relative flex h-36 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          <SafeImage
            src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"
            alt="Packages"
            fill
            sizes="350px"
            className="object-cover brightness-50 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-marigold">Tours & Sightseeing</p>
            <p className="font-display text-xl font-bold">Manage Packages &rarr;</p>
          </div>
        </Link>
        <Link
          href="/admin/vehicles"
          className="group relative flex h-36 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          <SafeImage
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"
            alt="Vehicles"
            fill
            sizes="350px"
            className="object-cover brightness-50 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-marigold">Car & Bus Fleet</p>
            <p className="font-display text-xl font-bold">Manage Vehicles &rarr;</p>
          </div>
        </Link>
        <Link
          href="/admin/offers"
          className="group relative flex h-36 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          <SafeImage
            src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80"
            alt="Offers"
            fill
            sizes="350px"
            className="object-cover brightness-50 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-marigold">Promotions</p>
            <p className="font-display text-xl font-bold">Manage Offers &rarr;</p>
          </div>
        </Link>
      </div>

      <h2 className="mt-10 text-xl font-bold">Latest new requests</h2>
      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-card">
        {recent.items.length ? (
          <ul className="divide-y divide-ink/10">
            {recent.items.map((b) => (
              <li key={b._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{b.itemTitle}</p>
                  <p className="text-sm text-ink/60">{b.name} · {shortDate(b.createdAt)}</p>
                </div>
                <a href={`tel:${b.phone}`} className="btn-dark !px-4 !py-1.5 text-sm">Call {b.phone}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 text-center text-ink/60">No new requests. You are all caught up.</p>
        )}
      </div>
    </div>
  );
}
