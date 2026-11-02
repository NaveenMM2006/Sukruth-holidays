import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Profile } from "@/models";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Login required" }, { status: 401 });
  await connectDB();
  const p = await Profile.findOne({ email: session.user.email }).lean<{ phone?: string }>();
  return NextResponse.json({ phone: p?.phone || "" });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { phone } = await req.json();
  const clean = normalizePhone(phone);
  if (!clean) return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });
  await connectDB();
  await Profile.findOneAndUpdate(
    { email: session.user.email },
    { email: session.user.email, name: session.user.name, phone: clean },
    { upsert: true, new: true }
  );
  return NextResponse.json({ phone: clean });
}
