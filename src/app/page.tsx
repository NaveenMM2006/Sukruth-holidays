import Link from "next/link";
import { Suspense } from "react";
import { Search, Car, ShieldCheck, Headset, Wallet, ArrowRight, Calculator } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { FeaturedPackages, HotOffers, SectionSkeleton } from "@/components/Sections";
import { getFeaturedPackages } from "@/lib/queries";
import { safe } from "@/lib/safe";
import { inr } from "@/lib/format";

export const revalidate = 60; // refresh the home page data at most once a minute

const tilt = ["-6deg", "3deg", "-1deg"];
const offset = ["lg:translate-x-0 lg:translate-y-6", "lg:translate-x-16 lg:-translate-y-2", "lg:-translate-x-10 lg:translate-y-2"];

const defaultPostcards = [
  {
    _id: "default-1",
    destination: "Goa Beach Escape",
    days: 4,
    nights: 3,
    price: 14999,
    images: ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"],
  },
  {
    _id: "default-2",
    destination: "Kerala Backwaters",
    days: 6,
    nights: 5,
    price: 22999,
    images: ["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80"],
  },
  {
    _id: "default-3",
    destination: "Manali Hills",
    days: 5,
    nights: 4,
    price: 18499,
    images: ["https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80"],
  },
];

export default async function Home() {
  const cards = await safe(() => getFeaturedPackages(3), []);
  const heroCards = cards.length ? cards : defaultPostcards;

  return (
    <>
      {/* HERO: stack of postcards built from real packages */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-lagoon/40 blur-3xl"
          aria-hidden
        />
        <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Pack light.
              <br />
              We plan the road.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
              Hotels, drivers, sightseeing and a person you can call at midnight. Pick a package or hire a vehicle
              and we handle the rest.
            </p>

            <form action="/packages" className="mt-8 flex max-w-xl gap-2 rounded-full bg-white p-1.5 shadow-card" role="search">
              <label htmlFor="q" className="sr-only">Search destinations</label>
              <Search className="ml-4 mt-3 shrink-0 text-ink/40" size={20} aria-hidden />
              <input
                id="q"
                name="q"
                placeholder="Where do you want to go?"
                className="min-w-0 flex-1 bg-transparent px-2 text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <button className="btn-primary !py-2.5">Find trips</button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link href="/vehicles" className="flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 hover:bg-white/10">
                <Car size={16} aria-hidden /> Need a vehicle only?
              </Link>
              <Link href="/fare-calculator" className="flex items-center gap-2 rounded-full border border-marigold/60 px-4 py-2 text-marigold hover:bg-marigold/10">
                <Calculator size={16} aria-hidden /> Calculate trip fare
              </Link>
              <Link href="/offers" className="flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 hover:bg-white/10">
                Hot offers
              </Link>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-md flex-col gap-4 lg:max-w-none">
            {heroCards.map((c, i) => (
              <div
                key={c?._id ?? i}
                style={{ ["--r" as string]: tilt[i], animationDelay: `${i * 140}ms` }}
                className={`animate-drift w-full max-w-sm rotate-[var(--r)] ${offset[i]} ${i === 1 ? "self-end" : ""}`}
              >
                <div className="overflow-hidden rounded-2xl bg-white p-2 pb-3 text-ink shadow-2xl">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-mist">
                    <SafeImage
                      src={c?.images?.[0] || defaultPostcards[i % defaultPostcards.length].images[0]}
                      alt={c ? c.destination : "Destination photo"}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1024px) 90vw, 400px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-baseline justify-between px-2 pt-3">
                    <p className="font-display text-lg font-bold">{c ? c.destination : "Your destination"}</p>
                    <p className="text-sm text-ink/70">{c ? `${c.days}D/${c.nights}N from ${inr(c.price)}` : "Popular tour"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HotOffersBlock />

      {/* Featured packages, streamed */}
      <section className="container-x pt-20" aria-labelledby="feat-title">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="feat-title" className="text-3xl font-bold sm:text-4xl">Trips people are booking</h2>
            <p className="mt-2 text-ink/70">Fixed prices, clear inclusions, no surprises at the hotel desk.</p>
          </div>
          <Link href="/packages" className="hidden items-center gap-1 font-semibold text-lagoon-dark hover:underline sm:flex">
            All packages <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedPackages />
        </Suspense>
      </section>

      {/* Vehicle rental */}
      <section className="container-x pt-20">
        <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-lagoon p-8 text-white sm:p-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Just need wheels?</h2>
            <p className="mt-3 max-w-lg text-white/85">
              Sedans, SUVs and Tempo Travellers with experienced drivers. Pay by the day or by the kilometre.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/vehicles" className="btn-primary">Browse vehicles</Link>
              <Link href="/fare-calculator" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/20">
                <Calculator size={18} /> Calculate fare by KM
              </Link>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl">
            <SafeImage
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"
              alt="Comfortable rental car"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section className="container-x pt-20" aria-labelledby="why-title">
        <h2 id="why-title" className="max-w-xl text-3xl font-bold sm:text-4xl">Why travellers come back</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { icon: Wallet, t: "Honest pricing", d: "Every package lists what is included and what is not, so the price you see is the price you pay." },
            { icon: Headset, t: "A real person on call", d: "Call or WhatsApp during the trip. Someone who knows your itinerary picks up." },
            { icon: ShieldCheck, t: "Vetted drivers and stays", d: "We work with drivers and hotels we have used ourselves, season after season." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-3xl bg-mist p-7">
              <Icon className="text-lagoon" size={28} aria-hidden />
              <h3 className="mt-4 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function HotOffersBlock() {
  return (
    <Suspense fallback={null}>
      <HotOffers />
    </Suspense>
  );
}
