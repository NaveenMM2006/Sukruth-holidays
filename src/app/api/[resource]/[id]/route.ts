import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { resourceModels, ResourceKey } from "@/models";

export const dynamic = "force-dynamic";

type Ctx = { params: { resource: string; id: string } };
const getModel = (resource: string) => resourceModels[resource as ResourceKey];
const validId = (id: string) => /^[a-f\d]{24}$/i.test(id);

export async function GET(_req: NextRequest, { params }: Ctx) {
  const model = getModel(params.resource);
  if (!model || !validId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await connectDB();
  const admin = await requireAdmin();
  const doc = await model.findOne(admin ? { _id: params.id } : { _id: params.id, active: true }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const model = getModel(params.resource);
  if (!model || !validId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await connectDB();
    const body = await req.json();
    delete body._id;
    const doc = await model.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Could not update" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const model = getModel(params.resource);
  if (!model || !validId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  await model.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
