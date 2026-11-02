import { connectDB } from "./db";
import { Package, Vehicle, Offer, Booking } from "@/models";
import type { Model } from "mongoose";

export type Paged<T> = { items: T[]; total: number; page: number; pages: number; limit: number };

export type PackageItem = {
  _id: string;
  title: string;
  destination: string;
  price: number;
  days: number;
  nights: number;
  description: string;
  included: string[];
  excluded: string[];
  images: string[];
  featured: boolean;
  active: boolean;
  createdAt: string;
};
export type VehicleItem = {
  _id: string;
  name: string;
  type: string;
  seats: number;
  pricePerDay: number;
  pricePerKm: number;
  description: string;
  features: string[];
  images: string[];
  active: boolean;
};
export type OfferItem = {
  _id: string;
  title: string;
  body: string;
  badge: string;
  image: string;
  link: string;
  validTill?: string;
  active: boolean;
  createdAt: string;
};

/** Mongo documents -> plain JSON that can cross the server/client boundary. */
export const plain = <T,>(v: unknown): T => JSON.parse(JSON.stringify(v));

export const clampInt = (v: unknown, def: number, min: number, max: number) => {
  const n = parseInt(String(v ?? ""), 10);
  if (Number.isNaN(n)) return def;
  return Math.min(max, Math.max(min, n));
};

export async function paginate<T>(
  model: Model<any>,
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  pageParam: unknown,
  limitParam: unknown,
  defaultLimit = 9
): Promise<Paged<T>> {
  await connectDB();
  const limit = clampInt(limitParam, defaultLimit, 1, 50);
  const total = await model.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(clampInt(pageParam, 1, 1, 100000), pages);
  const items = await model
    .find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return { items: plain<T[]>(items), total, page, pages, limit };
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function getPackages(opts: { page?: unknown; q?: string; limit?: number }) {
  const filter: Record<string, unknown> = { active: true };
  if (opts.q?.trim()) {
    const rx = new RegExp(escapeRegex(opts.q.trim()), "i");
    filter.$or = [{ title: rx }, { destination: rx }];
  }
  return paginate<PackageItem>(Package, filter, { featured: -1, createdAt: -1 }, opts.page, opts.limit, 9);
}

export async function getFeaturedPackages(limit = 6) {
  await connectDB();
  const items = await Package.find({ active: true }).sort({ featured: -1, createdAt: -1 }).limit(limit).lean();
  return plain<PackageItem[]>(items);
}

export async function getPackage(id: string) {
  await connectDB();
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  const doc = await Package.findOne({ _id: id, active: true }).lean();
  return doc ? plain<PackageItem>(doc) : null;
}

export const getVehicles = (opts: { page?: unknown }) =>
  paginate<VehicleItem>(Vehicle, { active: true }, { createdAt: -1 }, opts.page, 6, 6);

export async function getVehicle(id: string) {
  await connectDB();
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  const doc = await Vehicle.findOne({ _id: id, active: true }).lean();
  return doc ? plain<VehicleItem>(doc) : null;
}

export const getOffers = (opts: { page?: unknown; limit?: number }) =>
  paginate<OfferItem>(Offer, { active: true }, { createdAt: -1 }, opts.page, opts.limit, 6);

export async function getLatestOffers(limit = 4) {
  await connectDB();
  const items = await Offer.find({ active: true }).sort({ createdAt: -1 }).limit(limit).lean();
  return plain<OfferItem[]>(items);
}

export async function getAdminStats() {
  await connectDB();
  const [packages, vehicles, offers, bookings, newBookings] = await Promise.all([
    Package.countDocuments(),
    Vehicle.countDocuments(),
    Offer.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "new" }),
  ]);
  return { packages, vehicles, offers, bookings, newBookings };
}
