import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { paginate } from "@/lib/queries";
import { resourceModels, ResourceKey } from "@/models";

export const dynamic = "force-dynamic";

const getModel = (resource: string) => resourceModels[resource as ResourceKey];

// GET /api/packages?page=1&limit=9&all=1   (all=1 includes hidden items, admin only)
export async function GET(req: NextRequest, { params }: { params: { resource: string } }) {
  const model = getModel(params.resource);
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sp = req.nextUrl.searchParams;
  const wantsAll = sp.get("all") === "1";
  if (wantsAll && !(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filter: Record<string, unknown> = wantsAll ? {} : { active: true };
  const result = await paginate(model, filter, { createdAt: -1 }, sp.get("page"), sp.get("limit"), 10);
  return NextResponse.json(result);
}

// POST /api/packages  (admin only)
export async function POST(req: NextRequest, { params }: { params: { resource: string } }) {
  const model = getModel(params.resource);
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const body = await req.json();
    const doc = await model.create(body);
    return NextResponse.json(doc, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Could not save" }, { status: 400 });
  }
}
