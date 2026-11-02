import type { Metadata } from "next";
import { Users, Check } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import Pagination from "@/components/Pagination";
import BookingModal from "@/components/BookingModal";
import { EmptyState } from "@/components/Sections";
import { getVehicles } from "@/lib/queries";
import { safe } from "@/lib/safe";
import { inr } from "@/lib/format";

export const metadata: Metadata = { title: "Vehicle rental" };
export const dynamic = "force-dynamic";

export default async function VehiclesPage({ searchParams }: { searchParams: { page?: string } }) {
  const data = await safe(() => getVehicles({ page: searchParams.page }), {
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 6,
  });

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-bold sm:text-5xl">Vehicle rental</h1>
      <p className="mt-2 max-w-xl text-ink/70">Clean vehicles with experienced local drivers, for a day, a weekend or a whole trip.</p>

      <div className="mt-10">
        {data.items.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {data.items.map((v, i) => (
              <article key={v._id} className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-card sm:flex-row">
                <div className="relative aspect-[4/3] sm:aspect-auto sm:w-2/5 sm:shrink-0">
                  <SafeImage src={v.images[0]} alt={v.name} fill priority={i < 2} sizes="(max-width: 640px) 100vw, 220px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">{v.name}</h2>
                      <p className="text-sm text-ink/60">{v.type}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-sm">
                      <Users size={14} aria-hidden /> {v.seats}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-ink/70">{v.description}</p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70">
                    {v.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center gap-1"><Check size={12} className="text-lagoon" aria-hidden /> {f}</li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <p>
                      <span className="font-display text-2xl font-bold text-lagoon-dark">{inr(v.pricePerDay)}</span>
                      <span className="text-sm text-ink/60"> / day</span>
                      {v.pricePerKm > 0 && <span className="block text-xs text-ink/60">or {inr(v.pricePerKm)} per km</span>}
                    </p>
                    <BookingModal kind="vehicle" itemId={v._id} itemTitle={v.name} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No vehicles listed yet" hint="Call us and we will arrange one for your dates." />
        )}
      </div>

      <Pagination page={data.page} pages={data.pages} basePath="/vehicles" />
    </div>
  );
}
