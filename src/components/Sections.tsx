import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import PackageCard from "./PackageCard";
import OfferCard from "./OfferCard";
import { getFeaturedPackages, getLatestOffers } from "@/lib/queries";
import { safe } from "@/lib/safe";

export function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-80" />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/20 bg-white/60 p-10 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mt-1 text-sm text-ink/60">{hint}</p>
    </div>
  );
}

/** Streams in after the hero so the first paint is not blocked by the database. */
export async function FeaturedPackages() {
  const pkgs = await safe(() => getFeaturedPackages(6), []);
  if (!pkgs.length) {
    return <EmptyState title="Packages are being added" hint="Check back soon, or call us to plan a custom trip." />;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {pkgs.map((p) => (
        <PackageCard key={p._id} pkg={p} />
      ))}
    </div>
  );
}

export async function HotOffers() {
  const offers = await safe(() => getLatestOffers(4), []);
  if (!offers.length) return null;
  return (
    <section className="bg-ink py-16 text-white" aria-labelledby="hot-title">
      <div className="container-x">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="hot-title" className="flex items-center gap-3 text-3xl font-bold sm:text-4xl">
            <Flame className="text-marigold" aria-hidden /> Hot right now
          </h2>
          <Link href="/offers" className="flex items-center gap-1 text-sm font-semibold text-marigold hover:underline">
            All offers <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 [&_*]:text-ink">
          {offers.map((o) => (
            <OfferCard key={o._id} offer={o} />
          ))}
        </div>
      </div>
    </section>
  );
}
