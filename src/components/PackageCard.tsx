import Link from "next/link";
import { Moon, Sun, Star } from "lucide-react";
import SafeImage from "./SafeImage";
import { inr } from "@/lib/format";
import type { PackageItem } from "@/lib/queries";

export default function PackageCard({ pkg, priority = false }: { pkg: PackageItem; priority?: boolean }) {
  return (
    <Link
      href={`/packages/${pkg._id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage
          src={pkg.images[0]}
          alt={`${pkg.title} in ${pkg.destination}`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {pkg.featured && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-marigold px-3 py-1 text-xs font-bold text-ink">
            <Star size={12} aria-hidden /> Featured
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-medium text-white">
          {pkg.destination}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold leading-snug">{pkg.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink/70">{pkg.description}</p>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div className="flex items-center gap-3 text-sm text-ink/70">
            <span className="flex items-center gap-1"><Sun size={15} aria-hidden /> {pkg.days}D</span>
            <span className="flex items-center gap-1"><Moon size={15} aria-hidden /> {pkg.nights}N</span>
          </div>
          <p className="text-right">
            <span className="block text-xs text-ink/60">from, per person</span>
            <span className="font-display text-xl font-bold text-lagoon-dark">{inr(pkg.price)}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
