"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { CheckCircle2, Phone, MessageCircle, Loader2 } from "lucide-react";

type Props = { kind: "package" | "vehicle"; itemId: string; itemTitle: string };

/**
 * Booking flow:
 * 1. Not logged in  -> "Log in with Google to book"
 * 2. Logged in      -> mobile number (+ optional date / travellers / note) -> "Send booking request"
 * 3. Success        -> shows the agency contact number; the admin gets an email with the customer's email + mobile
 */
export default function BookingPanel({ kind, itemId, itemTitle }: Props) {
  const { data: session, status } = useSession();
  const [phone, setPhone] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ contactPhone: string } | null>(null);

  // prefill saved mobile number
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => p?.phone && setPhone(p.phone))
      .catch(() => {});
  }, [status]);

  const contact = process.env.NEXT_PUBLIC_ADMIN_PHONE || "";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || contact.replace(/\D/g, "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, itemId, phone, travelDate, travellers, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setDone({ contactPhone: data.contactPhone || contact });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const shell = "rounded-3xl bg-white p-6 shadow-card";

  if (done) {
    return (
      <div className={shell} role="status">
        <CheckCircle2 className="text-lagoon" size={36} aria-hidden />
        <h3 className="mt-3 text-xl font-bold">Request sent</h3>
        <p className="mt-2 text-sm text-ink/70">
          We received your request for <b>{itemTitle}</b>. Our team will call you on <b>{phone}</b> shortly.
        </p>
        {done.contactPhone && (
          <div className="mt-5 space-y-2">
            <p className="text-sm font-semibold">Want to talk right now?</p>
            <a href={`tel:${done.contactPhone}`} className="btn-primary w-full">
              <Phone size={18} aria-hidden /> Call {done.contactPhone}
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, I just sent a booking request for ${itemTitle}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full"
              >
                <MessageCircle size={18} aria-hidden /> WhatsApp us
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  if (status === "loading") {
    return <div className={`${shell} skeleton h-64`} aria-busy="true" />;
  }

  if (status !== "authenticated") {
    return (
      <div className={shell}>
        <h3 className="text-xl font-bold">Book this {kind === "vehicle" ? "vehicle" : "trip"}</h3>
        <p className="mt-2 text-sm text-ink/70">Log in with Google so we know who to call back.</p>
        <button onClick={() => signIn("google")} className="btn-primary mt-5 w-full">
          Log in with Google to book
        </button>
        {contact && (
          <a href={`tel:${contact}`} className="mt-3 block text-center text-sm text-lagoon-dark underline">
            or call us on {contact}
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`${shell} space-y-4`}>
      <h3 className="text-xl font-bold">Book this {kind === "vehicle" ? "vehicle" : "trip"}</h3>
      <p className="text-sm text-ink/70">
        Booking as <b>{session.user?.email}</b>
      </p>

      <div>
        <label htmlFor="phone" className="label">Mobile number</label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="+91 98765 43210"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="date" className="label">Travel date</label>
          <input
            id="date"
            type="date"
            className="input"
            min={new Date().toISOString().split("T")[0]}
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="trav" className="label">{kind === "vehicle" ? "Passengers" : "Travellers"}</label>
          <input
            id="trav"
            type="number"
            min={1}
            max={100}
            className="input"
            value={travellers}
            onChange={(e) => setTravellers(Number(e.target.value))}
          />
        </div>
      </div>
      <div>
        <label htmlFor="msg" className="label">Anything we should know? (optional)</label>
        <textarea id="msg" rows={2} maxLength={1000} className="input" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null}
        {busy ? "Sending…" : "Send booking request"}
      </button>
    </form>
  );
}
