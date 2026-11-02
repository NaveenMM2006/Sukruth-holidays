import type { Metadata } from "next";
import { Phone, MessageCircle, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_ADMIN_PHONE;
  const wa = process.env.NEXT_PUBLIC_WHATSAPP || phone?.replace(/\D/g, "");

  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-4xl font-bold sm:text-5xl">Talk to us</h1>
      <p className="mt-3 text-ink/70">
        Planning something that is not on the website? Tell us the dates and the number of people, and we will put a plan together.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {phone && (
          <a href={`tel:${phone}`} className="rounded-3xl bg-ink p-7 text-white transition-colors hover:bg-lagoon-dark">
            <Phone className="text-marigold" aria-hidden />
            <p className="mt-4 font-display text-xl font-bold">Call</p>
            <p className="text-white/80">{phone}</p>
          </a>
        )}
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-3xl bg-mist p-7 transition-colors hover:bg-lagoon-light"
          >
            <MessageCircle className="text-lagoon" aria-hidden />
            <p className="mt-4 font-display text-xl font-bold">WhatsApp</p>
            <p className="text-ink/70">Usually replies within the hour</p>
          </a>
        )}
      </div>

      <p className="mt-8 flex items-center gap-2 text-sm text-ink/60">
        <Clock size={16} aria-hidden /> Open every day, 9 am to 9 pm.
      </p>
    </div>
  );
}
