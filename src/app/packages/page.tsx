import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import PackageCard from "@/components/PackageCard";
import Pagination from "@/components/Pagination";
import { EmptyState } from "@/components/Sections";
import { getPackages } from "@/lib/queries";
import { safe } from "@/lib/safe";

export const metadata: Metadata = { title: "Holiday packages" };
export const dynamic = "force-dynamic";

export default async function PackagesPage({ searchParams }: { searchParams: { page?: string; q?: string } }) {
  const q = searchParams.q?.slice(0, 60);
  const data = await safe(() => getPackages({ page: searchParams.page, q }), {
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 9,
  });

  return (
    <div className="container-x py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Holiday packages</h1>
          <p className="mt-2 text-ink/70">{data.total} {data.total === 1 ? "trip" : "trips"} {q ? `matching “${q}”` : "to choose from"}</p>
        </div>
        <form action="/packages" role="search" className="flex w-full max-w-md gap-2">
          <label htmlFor="q" className="sr-only">Search packages</label>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-ink/40" size={18} aria-hidden />
            <input id="q" name="q" defaultValue={q} placeholder="Goa, Kerala, Manali…" className="input !pl-10" />
          </div>
          <button className="btn-dark !py-2.5">Search</button>
        </form>
      </div>

      <div className="mt-10">
        {data.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p, i) => (
              <PackageCard key={p._id} pkg={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={q ? `No trips found for “${q}”` : "No packages yet"}
            hint={q ? "Try a different destination or clear the search." : "New packages are added by our team regularly."}
          />
        )}
      </div>
      {q && (
        <p className="mt-6 text-center text-sm">
          <Link href="/packages" className="text-lagoon-dark underline">Clear search</Link>
        </p>
      )}

      <Pagination page={data.page} pages={data.pages} basePath="/packages" params={{ q }} />
    </div>
  );
}
