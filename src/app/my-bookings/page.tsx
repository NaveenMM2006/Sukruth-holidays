import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Booking } from "@/models";
import { paginate, PackageItem } from "@/lib/queries";
import Pagination from "@/components/Pagination";
import { EmptyState } from "@/components/Sections";
import { safe } from "@/lib/safe";
import { shortDate } from "@/lib/format";

export const metadata: Metadata = { title: "My booking requests" };
export const dynamic = "force-dynamic";

type B = { _id: string; kind: string; itemTitle: string; status: string; travelDate?: string; createdAt: string; travellers: number };

const statusStyle: Record<string, string> = {
  new: "bg-marigold/30",
  contacted: "bg-lagoon-light",
  confirmed: "bg-green-200",
  cancelled: "bg-red-100",
};

export default async function MyBookings({ searchParams }: { searchParams: { page?: string } }) {
  const session = await getSession();
  if (!session?.user?.email) redirect("/login?callbackUrl=/my-bookings");

  const data = await safe(
    () => paginate<B>(Booking, { email: session.user!.email }, { createdAt: -1 }, searchParams.page, 8, 8),
    { items: [], total: 0, page: 1, pages: 1, limit: 8 }
  );

  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-4xl font-bold">My booking requests</h1>
      <div className="mt-8 space-y-4">
        {data.items.length ? (
          data.items.map((b) => (
            <div key={b._id} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-card">
              <div>
                <p className="font-bold">{b.itemTitle}</p>
                <p className="text-sm text-ink/60">
                  Sent {shortDate(b.createdAt)}
                  {b.travelDate ? `, travel on ${shortDate(b.travelDate)}` : ""} · {b.travellers} {b.travellers === 1 ? "person" : "people"}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusStyle[b.status]}`}>{b.status}</span>
            </div>
          ))
        ) : (
          <EmptyState title="No requests yet" hint="Pick a package and send your first request." />
        )}
      </div>
      {!data.items.length && (
        <p className="mt-6 text-center">
          <Link href="/packages" className="btn-primary">Browse packages</Link>
        </p>
      )}
      <Pagination page={data.page} pages={data.pages} basePath="/my-bookings" />
    </div>
  );
}
