import { Flame, CalendarClock } from "lucide-react";
import SafeImage from "./SafeImage";
import { shortDate } from "@/lib/format";
import type { OfferItem } from "@/lib/queries";

export default function OfferCard({ offer }: { offer: OfferItem }) {
  const Wrapper: any = offer.link ? "a" : "div";
  const wrapperProps = offer.link ? { href: offer.link, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="group flex overflow-hidden rounded-3xl bg-white shadow-card transition-transform hover:-translate-y-1"
    >
      {offer.image && (
        <div className="relative hidden w-2/5 shrink-0 sm:block">
          <SafeImage src={offer.image} alt="" fill sizes="240px" className="object-cover" />
        </div>
      )}
      <div className="flex flex-col p-6">
        <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-marigold px-3 py-1 text-xs font-bold text-ink">
          <Flame size={13} aria-hidden /> {offer.badge}
        </span>
        <h3 className="text-xl font-bold">{offer.title}</h3>
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink/70">{offer.body}</p>
        {offer.validTill && (
          <p className="mt-auto flex items-center gap-1 pt-4 text-xs text-ink/60">
            <CalendarClock size={14} aria-hidden /> Valid till {shortDate(offer.validTill)}
          </p>
        )}
      </div>
    </Wrapper>
  );
}
