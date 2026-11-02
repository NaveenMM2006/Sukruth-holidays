import type { Metadata } from "next";
import OfferCard from "@/components/OfferCard";
import Pagination from "@/components/Pagination";
import { EmptyState } from "@/components/Sections";
import { getOffers } from "@/lib/queries";
import { safe } from "@/lib/safe";

export const metadata: Metadata = { title: "Hot offers & travel news" };
export const dynamic = "force-dynamic";

export default async function OffersPage({ searchParams }: { searchParams: { page?: string } }) {
  const data = await safe(() => getOffers({ page: searchParams.page }), {
    items: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 6,
  });

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-bold sm:text-5xl">Hot offers and travel news</h1>
      <p className="mt-2 max-w-xl text-ink/70">Seasonal discounts, new routes and travel updates, newest first.</p>

      <div className="mt-10">
        {data.items.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {data.items.map((o) => (
              <OfferCard key={o._id} offer={o} />
            ))}
          </div>
        ) : (
          <EmptyState title="No offers right now" hint="New deals are posted here as soon as they are live." />
        )}
      </div>

      <Pagination page={data.page} pages={data.pages} basePath="/offers" />
    </div>
  );
}
