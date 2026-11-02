import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Booking } from "@/models";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "contacted", "confirmed", "cancelled"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { status } = await req.json();
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  await connectDB();
  const doc = await Booking.findByIdAndUpdate(params.id, { status }, { new: true });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  await Booking.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
