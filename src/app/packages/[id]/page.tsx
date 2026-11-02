import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, X, MapPin, Moon, Sun, ChevronLeft } from "lucide-react";
import Gallery from "@/components/Gallery";
import BookingPanel from "@/components/BookingPanel";
import { getPackage } from "@/lib/queries";
import { safe } from "@/lib/safe";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pkg = await safe(() => getPackage(params.id), null);
  return pkg ? { title: pkg.title, description: pkg.description.slice(0, 150) } : { title: "Package not found" };
}

export default async function PackageDetail({ params }: Props) {
  const pkg = await safe(() => getPackage(params.id), null);
  if (!pkg) notFound();

  return (
    <div className="container-x py-10">
      <Link href="/packages" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-lagoon-dark hover:underline">
        <ChevronLeft size={16} aria-hidden /> All packages
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Gallery images={pkg.images} title={pkg.title} />

          <h1 className="mt-8 text-4xl font-bold sm:text-5xl">{pkg.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-mist px-4 py-1.5"><MapPin size={15} aria-hidden /> {pkg.destination}</span>
            <span className="flex items-center gap-1 rounded-full bg-mist px-4 py-1.5"><Sun size={15} aria-hidden /> {pkg.days} days</span>
            <span className="flex items-center gap-1 rounded-full bg-mist px-4 py-1.5"><Moon size={15} aria-hidden /> {pkg.nights} nights</span>
          </div>

          <h2 className="mt-10 text-2xl font-bold">About this trip</h2>
          <p className="mt-3 max-w-prose whitespace-pre-line leading-relaxed text-ink/80">{pkg.description}</p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl bg-mist p-6" aria-labelledby="inc">
              <h2 id="inc" className="text-xl font-bold">What is included</h2>
              <ul className="mt-4 space-y-2">
                {pkg.included.map((x) => (
                  <li key={x} className="flex gap-2 text-sm"><Check className="mt-0.5 shrink-0 text-lagoon" size={16} aria-hidden /> {x}</li>
                ))}
                {!pkg.included.length && <li className="text-sm text-ink/60">Ask us for the full list.</li>}
              </ul>
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-card" aria-labelledby="exc">
              <h2 id="exc" className="text-xl font-bold">What is not included</h2>
              <ul className="mt-4 space-y-2">
                {pkg.excluded.map((x) => (
                  <li key={x} className="flex gap-2 text-sm"><X className="mt-0.5 shrink-0 text-red-500" size={16} aria-hidden /> {x}</li>
                ))}
                {!pkg.excluded.length && <li className="text-sm text-ink/60">Nothing major. Ask us to confirm.</li>}
              </ul>
            </section>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-ink p-6 text-white">
            <p className="text-sm text-white/70">Starting from, per person</p>
            <p className="font-display text-4xl font-bold text-marigold">{inr(pkg.price)}</p>
            <p className="mt-1 text-sm text-white/70">{pkg.days} days / {pkg.nights} nights</p>
          </div>
          <BookingPanel kind="package" itemId={pkg._id} itemTitle={pkg.title} />
        </aside>
      </div>
    </div>
  );
}
