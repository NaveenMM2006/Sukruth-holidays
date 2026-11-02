"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, Mail, Trash2, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import clsx from "clsx";

type Booking = {
  _id: string;
  kind: "package" | "vehicle";
  itemTitle: string;
  name: string;
  email: string;
  phone: string;
  travelDate?: string;
  travellers: number;
  message?: string;
  status: "new" | "contacted" | "confirmed" | "cancelled";
  createdAt: string;
};

const tabs = ["all", "new", "contacted", "confirmed", "cancelled"] as const;
const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-");

export default function AdminBookings() {
  const [status, setStatus] = useState<(typeof tabs)[number]>("new");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Booking[]; pages: number; total: number }>({ items: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), limit: "8" });
    if (status !== "all") qs.set("status", status);
    const res = await fetch(`/api/bookings?${qs}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function setBookingStatus(id: string, s: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this request?")) return;
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Booking requests</h1>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={status === t}
            onClick={() => {
              setStatus(t);
              setPage(1);
            }}
            className={clsx(
              "rounded-full px-4 py-1.5 text-sm font-semibold capitalize",
              status === t ? "bg-ink text-white" : "bg-white hover:bg-mist"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4" aria-busy={loading}>
        {loading && !data.items.length && [0, 1, 2].map((i) => <div key={i} className="skeleton h-32" />)}

        {data.items.map((b) => (
          <article key={b._id} className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-lagoon-dark">{b.kind === "vehicle" ? "Vehicle" : "Package"}</p>
                <h2 className="text-lg font-bold">{b.itemTitle}</h2>
                <p className="text-sm text-ink/60">Received {fmt(b.createdAt)}</p>
              </div>
              <select
                value={b.status}
                onChange={(e) => setBookingStatus(b._id, e.target.value)}
                aria-label="Status"
                className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm font-semibold capitalize"
              >
                {tabs.slice(1).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-ink/50">Customer</dt><dd className="font-semibold">{b.name}</dd></div>
              <div><dt className="text-ink/50">Mobile</dt><dd className="font-semibold">{b.phone}</dd></div>
              <div><dt className="text-ink/50">Email</dt><dd className="break-all font-semibold">{b.email}</dd></div>
              <div><dt className="text-ink/50">Travel date and people</dt><dd className="font-semibold">{fmt(b.travelDate)} · {b.travellers}</dd></div>
              {b.message && <div className="sm:col-span-2"><dt className="text-ink/50">Message</dt><dd>{b.message}</dd></div>}
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${b.phone}`} onClick={() => b.status === "new" && setBookingStatus(b._id, "contacted")} className="btn-dark !px-4 !py-2 text-sm">
                <Phone size={16} aria-hidden /> Call
              </a>
              <a
                href={`https://wa.me/${b.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${b.name}, this is Sukruth Holidays about your request for ${b.itemTitle}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !px-4 !py-2 text-sm"
              >
                <MessageCircle size={16} aria-hidden /> WhatsApp
              </a>
              <a href={`mailto:${b.email}?subject=${encodeURIComponent("Your request: " + b.itemTitle)}`} className="btn-ghost !px-4 !py-2 text-sm">
                <Mail size={16} aria-hidden /> Email
              </a>
              <button onClick={() => remove(b._id)} className="ml-auto rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete request">
                <Trash2 size={18} />
              </button>
            </div>
          </article>
        ))}

        {!loading && !data.items.length && (
          <p className="rounded-2xl bg-white p-10 text-center text-ink/60 shadow-card">No {status === "all" ? "" : status} requests.</p>
        )}
      </div>

      {data.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-ghost !px-3 !py-2" aria-label="Previous page"><ChevronLeft size={16} /></button>
          <span>Page {page} of {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="btn-ghost !px-3 !py-2" aria-label="Next page"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
