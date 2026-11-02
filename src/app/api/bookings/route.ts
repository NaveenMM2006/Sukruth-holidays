import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Booking, Package, Vehicle, Profile } from "@/models";
import { paginate } from "@/lib/queries";
import { normalizePhone } from "@/lib/phone";
import { sendBookingEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

// Customer creates a booking request. Login + mobile number are mandatory.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Please log in with Google to book." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(body.phone);
  if (!phone) return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });

  const kind = body.kind === "vehicle" ? "vehicle" : "package";
  if (!/^[a-f\d]{24}$/i.test(String(body.itemId))) {
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  }

  await connectDB();
  const item: any =
    kind === "vehicle"
      ? await Vehicle.findById(body.itemId).lean()
      : await Package.findById(body.itemId).lean();
  if (!item) return NextResponse.json({ error: "This item is no longer available." }, { status: 404 });

  const travellers = Math.min(100, Math.max(1, parseInt(body.travellers, 10) || 1));
  const travelDate = body.travelDate ? new Date(body.travelDate) : undefined;
  const message = String(body.message || "").slice(0, 1000);

  await Profile.findOneAndUpdate(
    { email: session.user.email },
    { email: session.user.email, name: session.user.name, phone },
    { upsert: true }
  );

  const booking = await Booking.create({
    kind,
    itemId: item._id,
    itemTitle: item.title || item.name,
    name: session.user.name || session.user.email,
    email: session.user.email,
    phone,
    travelDate: travelDate && !isNaN(travelDate.getTime()) ? travelDate : undefined,
    travellers,
    message,
  });

  const emailed = await sendBookingEmail({
    kind,
    itemTitle: booking.itemTitle,
    name: booking.name,
    email: booking.email,
    phone,
    travelDate: travelDate && !isNaN(travelDate.getTime()) ? travelDate.toDateString() : undefined,
    travellers,
    message,
  });

  return NextResponse.json(
    { ok: true, id: booking._id, emailed, contactPhone: process.env.NEXT_PUBLIC_ADMIN_PHONE || "" },
    { status: 201 }
  );
}

// Admin: all bookings (paginated, filter by ?status=). Customer: ?mine=1 for their own.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const mine = sp.get("mine") === "1";
  if (!mine && !session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const filter: Record<string, unknown> = mine ? { email: session.user.email } : {};
  const status = sp.get("status");
  if (!mine && status && ["new", "contacted", "confirmed", "cancelled"].includes(status)) filter.status = status;

  const result = await paginate(Booking, filter, { createdAt: -1 }, sp.get("page"), sp.get("limit"), 10);
  return NextResponse.json(result);
}
